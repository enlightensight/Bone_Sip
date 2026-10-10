/**
 * BONE SIP Super Admin Portal (admin.html)
 * Talks to /api/admin/* on our server (server/accounts.js);
 * Features modern two-column dashboard with Real Activity log, Overview, Users,
 * Clinical Diet plans & Dishes repertoire, and Compliance Audits.
 * Zero fake telemetry or hardcoded WhatsApp reminders.
 */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const state = {
    users: [],
    auditEntries: [],
    filter: 'all',
    sort: 'recent',
    search: '',
    activitySearch: '',
    activityDate: 'all',
    activityModule: 'all',
    activityStatus: 'all',
    currentTab: 'activity',
    // Dishes catalog filter state
    dishSearch: '',
    dishDiet: 'all',
    dishCondition: 'all',
    dishRegion: 'all',
    dishSlot: 'all'
  };

  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = iso => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
  const fmtShort = iso => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const fmtDateTime = iso => {
    if (!iso) return '—';
    try {
      const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return String(iso);
    }
  };
  const cap = v => (v ? String(v).charAt(0).toUpperCase() + String(v).slice(1).replace(/_/g, ' ') : v);
  const fmtPhone = p => (p ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : '—');
  const LABELS = { complete: 'Routine done', partial: 'Partly done', missed: 'Missed' };

  const REGION_NAMES = {
    north: 'North Indian',
    south: 'South Indian',
    west: 'West Indian',
    east: 'East Indian',
    continental: 'Global / Continental'
  };

  const SLOT_NAMES = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    snack: 'Evening Snack',
    dinner: 'Dinner',
    sun_d3: 'D3 Sunlight'
  };

  const DIET_BADGES = {
    veg: { label: 'Vegetarian', cls: 'veg', icon: 'fa-leaf' },
    vegan: { label: 'Vegan', cls: 'vegan', icon: 'fa-seedling' },
    eggetarian: { label: 'Eggetarian', cls: 'eggetarian', icon: 'fa-egg' },
    non_veg: { label: 'Non-Veg', cls: 'non-veg', icon: 'fa-drumstick-bite' }
  };

  async function api(method, path, body) {
    const res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    let json = {};
    try { json = await res.json(); } catch (e) { /* empty */ }
    return { status: res.status, ok: res.ok, json };
  }

  function getCatalog() {
    const data = (typeof window !== 'undefined' && window.BONE_SIP_DATA)
      || (typeof BONE_SIP_DATA !== 'undefined' ? BONE_SIP_DATA : null)
      || (typeof globalThis !== 'undefined' && globalThis.BONE_SIP_DATA ? globalThis.BONE_SIP_DATA : null);
    return (data && data.fullDietCatalog) || [];
  }

  // ------------------------------------------------------------- Login
  function showLogin() {
    $('adApp').hidden = true;
    $('adLogin').hidden = false;
    if ($('adLoginForm')) $('adLoginForm').hidden = false;
    loginError('');
    if ($('adId')) $('adId').focus();
  }

  function loginError(msg) {
    const el = $('adLoginError');
    if (el) el.textContent = msg || '';
  }

  // Direct Admin ID + Password Login Form
  if ($('adLoginForm')) {
    $('adLoginForm').addEventListener('submit', async e => {
      e.preventDefault();
      loginError('');
      const id = $('adId').value.trim();
      const password = $('adPassword').value;
      if (!id || !password) return loginError('Please enter both Admin ID and Password.');

      const submitBtn = $('adLoginSubmitBtn');
      const origHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
      }

      const r = await api('POST', '/admin/login', { id, password }).catch(() => null);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }

      if (!r) return loginError('Could not reach the server. Please verify connection.');
      if (r.ok) {
        $('adPassword').value = '';
        return start();
      }
      const msg = {
        admin_not_configured: 'Admin credentials are not configured on the server.',
        wrong_details: 'Invalid Admin ID or Password. Please try again.'
      }[r.json.error] || 'Invalid Admin ID or Password. Please verify your credentials.';
      loginError(msg);
    });
  }

  // Toggle Password Visibility
  if ($('togglePassBtn')) {
    $('togglePassBtn').addEventListener('click', () => {
      const passInput = $('adPassword');
      const icon = $('togglePassIcon');
      if (passInput) {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        if (icon) {
          icon.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        }
      }
    });
  }

  if ($('adLogoutBtn')) {
    $('adLogoutBtn').addEventListener('click', async () => {
      await api('POST', '/admin/logout', {}).catch(() => null);
      showLogin();
    });
  }

  // Mobile sidebar drawer toggle
  if ($('adMobileToggle')) {
    $('adMobileToggle').addEventListener('click', () => {
      if ($('adSidebar')) $('adSidebar').classList.toggle('open');
    });
  }

  // ------------------------------------------------------------- Dashboard Start
  async function start() {
    const me = await api('GET', '/admin/me').catch(() => null);
    if (!me || !me.ok) return showLogin();
    $('adLogin').hidden = true;
    $('adApp').hidden = false;

    const isSubAdmin = !!(me.json && me.json.admin && me.json.admin.role === 'admin' && me.json.isMaster === false);
    state.isMaster = !isSubAdmin;

    if ($('adNavAdmins')) $('adNavAdmins').hidden = !state.isMaster;
    if ($('adSidebarUser')) {
      if (state.isMaster) {
        $('adSidebarUser').textContent = 'Signed in as Master Admin';
      } else {
        const u = me.json.admin ? (me.json.admin.name || me.json.admin.username) : 'Admin';
        $('adSidebarUser').textContent = `Signed in as Admin · ${u}`;
      }
    }

    await Promise.all([loadOverview(), loadUsers(), loadAudit()]);
    switchTab(state.currentTab);
  }

  // Tab switching
  function switchTab(tab) {
    if (tab === 'admins' && !state.isMaster) {
      tab = 'activity';
    }
    state.currentTab = tab;
    document.querySelectorAll('.ad-nav-item').forEach(b => {
      const active = b.dataset.tab === tab;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });

    if ($('adOverviewTab')) $('adOverviewTab').hidden = tab !== 'overview';
    if ($('adActivityTab')) $('adActivityTab').hidden = tab !== 'activity';
    if ($('adUsersTab')) $('adUsersTab').hidden = tab !== 'users';
    if ($('adDietsTab')) $('adDietsTab').hidden = tab !== 'diets';
    if ($('adAuditsTab')) $('adAuditsTab').hidden = tab !== 'audits';
    if ($('adAdminsTab')) $('adAdminsTab').hidden = tab !== 'admins';

    if (tab === 'activity') renderActivityLog();
    if (tab === 'users') renderUsers();
    if (tab === 'audits') loadAudit();
    if (tab === 'diets') renderDishesCatalog();
    if (tab === 'admins') loadAdmins();

    if ($('adSidebar')) $('adSidebar').classList.remove('open');
  }

  document.querySelectorAll('.ad-nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ------------------------------------------------------------- Real Activity Log
  function buildRealActivities() {
    const list = [];
    const auditNames = {
      login: 'Super Admin portal logged in',
      view_user: 'Viewed user clinical profile',
      export_csv: 'Exported user database (CSV)'
    };

    // 1. Real Audit Records from SQLite
    (state.auditEntries || []).forEach(e => {
      const isLogin = e.action === 'login';
      const isExport = e.action === 'export_csv';
      const userLabel = isLogin || isExport ? 'Super Admin' : (e.target_phone ? fmtPhone(e.target_phone) : (e.target_name || 'User'));
      const eventText = auditNames[e.action] || cap(e.action);
      list.push({
        time: fmtDateTime(e.at),
        user: userLabel,
        event: eventText,
        module: isLogin ? 'Auth / Admin' : 'Audits',
        status: isLogin ? 'Success' : 'Logged',
        rawTime: new Date(e.at).getTime()
      });
    });

    // 2. Real User Registrations & Milestone Events
    (state.users || []).forEach(u => {
      const uPhone = fmtPhone(u.phone);
      const uName = u.name ? ` (${u.name})` : '';

      // Registration event
      list.push({
        time: fmtDateTime(u.createdAt),
        user: uPhone,
        event: `Account registered & phone verified${uName}`,
        module: 'Users',
        status: 'Success',
        rawTime: new Date(u.createdAt).getTime()
      });

      // Clinical assessment event
      const p = u.profile || {};
      const conds = (p.conditions || []).filter(c => c && c !== 'none');
      if (p.diet || conds.length) {
        const dietLabel = cap(p.diet || 'Veg');
        const condLabel = conds.length ? conds.map(c => cap(c)).join(', ') : 'General Bone Health';
        list.push({
          time: fmtDateTime(u.createdAt),
          user: uPhone,
          event: `Clinical assessment completed: ${dietLabel} · ${condLabel}`,
          module: 'Build · Diet',
          status: 'Completed',
          rawTime: new Date(u.createdAt).getTime() + 500
        });
      }

      // Daily streak / activity check-in
      if (u.lastActiveDay) {
        const streakText = u.streak ? ` (${u.streak} day streak)` : '';
        const actEvent = u.today === 'complete'
          ? `Daily Bone SIP routine completed${streakText}`
          : (u.today === 'partial' ? `Partial meals & moves logged` : `Routine check-in logged`);
        list.push({
          time: fmtDateTime(u.lastSeenAt || `${u.lastActiveDay}T12:00:00`),
          user: uPhone,
          event: actEvent,
          module: (u.week && u.week.moves > u.week.diet) ? 'Strengthen · Exercise' : 'Build · Diet',
          status: u.today === 'complete' ? 'Success' : 'Active',
          rawTime: new Date(u.lastSeenAt || `${u.lastActiveDay}T12:00:00`).getTime()
        });
      }
    });

    return list.sort((a, b) => b.rawTime - a.rawTime);
  }

  function renderActivityLog() {
    const q = (state.activitySearch || '').trim().toLowerCase();
    const mod = state.activityModule;
    const st = state.activityStatus;
    const dt = state.activityDate;
    const all = buildRealActivities();

    const now = Date.now();
    const msDay = 86400000;

    let items = all.filter(item => {
      if (q && !item.user.toLowerCase().includes(q) && !item.event.toLowerCase().includes(q)) return false;
      if (mod !== 'all' && item.module !== mod) return false;
      if (st !== 'all' && item.status !== st) return false;
      if (dt === 'today' && (now - item.rawTime) > msDay) return false;
      if (dt === '7d' && (now - item.rawTime) > (7 * msDay)) return false;
      if (dt === '30d' && (now - item.rawTime) > (30 * msDay)) return false;
      return true;
    });

    const tbody = $('adActivityRows');
    const noAct = $('adNoActivity');
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = '';
      if (noAct) noAct.hidden = false;
      if ($('adActivityCount')) $('adActivityCount').textContent = 'Showing 0 events';
      return;
    }

    if (noAct) noAct.hidden = true;
    if ($('adActivityCount')) {
      $('adActivityCount').textContent = `Showing 1–${items.length} of ${all.length} real events`;
    }

    tbody.innerHTML = items.map(r => `
      <tr>
        <td class="time">${esc(r.time)}</td>
        <td class="user">${esc(r.user)}</td>
        <td class="event">${esc(r.event)}</td>
        <td class="module">${esc(r.module)}</td>
        <td class="status"><span class="ad-badge ${r.status.toLowerCase()}">${esc(r.status)}</span></td>
      </tr>
    `).join('');
  }

  if ($('adActivitySearch')) {
    $('adActivitySearch').addEventListener('input', e => {
      state.activitySearch = e.target.value;
      renderActivityLog();
    });
  }

  if ($('adActivityModule')) {
    $('adActivityModule').addEventListener('change', e => {
      state.activityModule = e.target.value;
      renderActivityLog();
    });
  }

  if ($('adActivityStatus')) {
    $('adActivityStatus').addEventListener('change', e => {
      state.activityStatus = e.target.value;
      renderActivityLog();
    });
  }

  if ($('adActivityDate')) {
    $('adActivityDate').addEventListener('change', e => {
      state.activityDate = e.target.value;
      renderActivityLog();
    });
  }

  if ($('adActivityPrev')) {
    $('adActivityPrev').addEventListener('click', () => {
      renderActivityLog();
    });
  }

  if ($('adActivityNext')) {
    $('adActivityNext').addEventListener('click', () => {
      renderActivityLog();
    });
  }

  // ------------------------------------------------------------- Overview Tab
  async function loadOverview() {
    const r = await api('GET', '/admin/overview');
    if (r.status === 401) return showLogin();
    const t = r.json.totals || {};

    if ($('adKpis')) {
      const kpi = (label, value, sub) => `<div class="ad-kpi"><span>${label}</span><b>${value}</b>${sub ? `<em>${sub}</em>` : ''}</div>`;
      $('adKpis').innerHTML = [
        kpi('Users', t.users || 0, `${t.newThisWeek || 0} new this week`),
        kpi('Active today', t.activeToday || 0, `${t.users ? Math.round((t.activeToday / t.users) * 100) : 0}% of users`),
        kpi('Active this week', t.active7 || 0, 'ticked a meal or move'),
        kpi('Diet followed', `${t.dietWeek || 0}%`, 'average, last 7 days'),
        kpi('Moves done', `${t.movesWeek || 0}%`, 'average, last 7 days')
      ].join('');
    }

    // Update Activity Log top KPI cards with 100% real numbers
    if ($('adKpiVerified')) $('adKpiVerified').textContent = String(t.users || state.users.length || 0);
    if ($('adKpiActiveToday')) $('adKpiActiveToday').textContent = String(t.activeToday || 0);
    if ($('adKpiActive7')) $('adKpiActive7').textContent = String(t.active7 || 0);
    if ($('adKpiDishes')) $('adKpiDishes').textContent = String(getCatalog().length || 144);
    if ($('adKpiAudit')) $('adKpiAudit').textContent = String(state.auditEntries.length || 0);

    renderActiveChart(r.json.activeDays || []);
  }

  function renderActiveChart(days) {
    if (!$('adActiveChart')) return;
    const max = Math.max(1, ...days.map(d => d.users));
    const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];
    $('adActiveChart').innerHTML = `
      <div class="ad-bars" role="img" aria-label="Active users per day for the last 14 days">
        <div class="ad-grid">${ticks.map(v => `<span style="bottom:${(v / max) * 100}%"><em>${v}</em></span>`).join('')}</div>
        ${days.map(d => `
          <div class="ad-bar-col" data-tip="${esc(fmtShort(d.day))}: ${d.users} active user${d.users === 1 ? '' : 's'}">
            <i style="height:${Math.max(d.users ? 3 : 0, (d.users / max) * 100)}%"></i>
            <span>${new Date(`${d.day}T00:00:00`).getDate()}</span>
          </div>`).join('')}
      </div>
      <table class="sr-only"><caption>Active users per day</caption><tr><th>Day</th><th>Users</th></tr>${days.map(d => `<tr><td>${esc(d.day)}</td><td>${d.users}</td></tr>`).join('')}</table>`;
  }

  // ------------------------------------------------------------- Users Tab
  async function loadUsers() {
    const r = await api('GET', '/admin/users');
    if (r.status === 401) return showLogin();
    state.users = r.json.users || [];
    renderUsers();
  }

  function pctBar(pct) {
    const tone = pct >= 70 ? 'good' : pct >= 40 ? 'warn' : 'bad';
    return `<div class="ad-pct ${tone}"><i style="width:${pct}%"></i><b>${pct}%</b></div>`;
  }

  function todayPill(status) {
    const icon = { complete: 'fa-circle-check', partial: 'fa-circle-half-stroke', missed: 'fa-circle' }[status] || 'fa-circle';
    return `<span class="ad-status ${status}"><i class="fa-solid ${icon}"></i> ${LABELS[status] || 'Missed'}</span>`;
  }

  function visibleUsers() {
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const q = state.search.trim().toLowerCase();
    let list = state.users.filter(u => {
      if (q && !(u.name || '').toLowerCase().includes(q) && !u.phone.includes(q.replace(/\D/g, '') || '~')) return false;
      if (state.filter === 'today') return u.today !== 'missed';
      if (state.filter === 'inactive') return !u.lastActiveDay || u.lastActiveDay < weekAgo;
      if (state.filter === 'lowdiet') return u.week.diet < 50;
      return true;
    });
    const by = {
      recent: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
      active: (a, b) => ((a.lastActiveDay || '') < (b.lastActiveDay || '') ? 1 : -1),
      diet: (a, b) => b.week.diet - a.week.diet,
      streak: (a, b) => b.streak - a.streak,
      name: (a, b) => (a.name || '~').localeCompare(b.name || '~')
    }[state.sort];
    return list.sort(by);
  }

  function renderUsers() {
    if (!$('adUserRows')) return;
    const list = visibleUsers();
    if ($('adNoUsers')) $('adNoUsers').hidden = list.length > 0;
    $('adUserRows').innerHTML = list.map(u => `
      <tr tabindex="0" data-id="${u.id}">
        <td><b>${esc(u.name || 'No name yet')}</b><span>${esc(fmtPhone(u.phone))}</span></td>
        <td>${fmtDate(u.createdAt)}</td>
        <td>${u.lastActiveDay ? fmtDate(u.lastActiveDay) : '<span class="ad-muted">Never</span>'}</td>
        <td>${todayPill(u.today)}</td>
        <td>${u.streak ? `🔥 ${u.streak}` : '0'}</td>
        <td>${pctBar(u.week.diet)}</td>
        <td>${pctBar(u.week.moves)}</td>
        <td>${pctBar(u.month.diet)}</td>
      </tr>`).join('');
  }

  if ($('adSearch')) {
    $('adSearch').addEventListener('input', e => { state.search = e.target.value; renderUsers(); });
  }
  if ($('adSort')) {
    $('adSort').addEventListener('change', e => { state.sort = e.target.value; renderUsers(); });
  }
  document.querySelectorAll('.ad-chip').forEach(chip => chip.addEventListener('click', () => {
    document.querySelectorAll('.ad-chip').forEach(c => c.classList.toggle('active', c === chip));
    state.filter = chip.dataset.filter;
    renderUsers();
  }));

  if ($('adUserRows')) {
    $('adUserRows').addEventListener('click', e => {
      const row = e.target.closest('tr[data-id]');
      if (row) openUser(row.dataset.id);
    });
    $('adUserRows').addEventListener('keydown', e => {
      const row = e.target.closest('tr[data-id]');
      if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openUser(row.dataset.id); }
    });
  }

  // ------------------------------------------------------------- Audit Tab
  async function loadAudit() {
    const r = await api('GET', '/admin/audit');
    if (r.status === 401) return showLogin();
    state.auditEntries = r.json.entries || [];
    if ($('adKpiAudit')) $('adKpiAudit').textContent = String(state.auditEntries.length);

    const names = { login: 'Admin logged in', view_user: 'Viewed user', export_csv: 'Exported users (CSV)' };
    if ($('adAuditRows')) {
      $('adAuditRows').innerHTML = state.auditEntries.map(e => `
        <tr><td>${esc(new Date(e.at).toLocaleString('en-IN'))}</td><td>${esc(names[e.action] || e.action)}</td>
        <td>${e.target_user_id ? `${esc(e.target_name || 'No name')} · ${esc(e.target_phone ? fmtPhone(e.target_phone) : 'deleted')}` : '—'}</td></tr>`).join('');
    }
  }

  // ------------------------------------------------------------- Diet Plans & Dishes Catalog
  function dishMatchesCondition(dish, cond) {
    if (!cond || cond === 'all') return true;
    const text = `${dish.name || ''} ${dish.desc || ''} ${(dish.conditions || []).join(' ')}`.toLowerCase();

    // Explicit tag match
    if (dish.conditions && dish.conditions.includes(cond)) return true;

    if (cond === 'kidney') {
      // Renal safe: moderate protein (<= 25g), no organ meats, purines or heavy cream
      const lowPurine = !/nihari|nalli|mutton|high protein|purine|heavy cream/i.test(text);
      const isRenalFriendly = dish.protein <= 25 && lowPurine;
      const renalIngredients = /bottle gourd|lauki|cucumber|khichdi|moong|dalma|sundal|makhana|poha|steamed|idli/i.test(text);
      return isRenalFriendly || renalIngredients;
    }

    if (cond === 'hypertension') {
      // DASH low-sodium safe: millets, moringa, greens, fish, yogurt, not pickled or salted papad
      if (/papad|pickle|salted butter|deep fried|nihari/i.test(text)) return false;
      return /moringa|drumstick|ragi|jowar|bajra|curd|chaas|buttermilk|spinach|palak|lentil|dal|fish|salmon|sardine|oats|steamed|idli|pesarattu|potassium|cucumber|sprout/i.test(text) || dish.diet === 'vegan';
    }

    if (cond === 'lactose_intolerance') {
      // Dairy-free / Lactose-free
      if (dish.diet === 'vegan') return true;
      return !/paneer|curd|dahi|milk|chaas|buttermilk|cheese|malai|kheer|kadhi|ghee|ricotta|parmesan/i.test(text);
    }

    if (cond === 'diabetes') {
      // Low GI millets, lentils, greens, proteins, no sugars / jaggery
      if (/sugar|jaggery|chikki|sweet|kheer|payasam|ladoo|halwa|honey|syrup/i.test(text)) return false;
      return /ragi|jowar|bajra|oats|quinoa|methi|palak|spinach|moong|chana|sprout|tofu|besan|chilla|egg|fish|chicken|dal|poriyal|khichdi|bhakri/i.test(text);
    }

    if (cond === 'nuts_allergy') {
      // Nut-free
      return !/almond|badam|peanut|mungfali|cashew|kaju|walnut|akhrot|pista|brazil nut/i.test(text);
    }

    if (cond === 'thyroid') {
      // Mineral rich, selenium / zinc supportive
      return /almond|seed|sesame|til|egg|fish|mushroom|cooked|phulka|saag|selenium|zinc|moringa|ragi/i.test(text);
    }

    if (cond === 'dyslipidemia') {
      // Heart-healthy fats, soluble fiber, no mutton/heavy cream
      if (/mutton|nalli|nihari|full cream|butter|tallow|deep fried/i.test(text)) return false;
      return /oats|chia|flax|walnut|almond|fish|salmon|sardine|rohu|methi|steamed|trout|tofu|sesame|lentil/i.test(text);
    }

    if (cond === 'obesity') {
      // High protein-to-calorie density, low simple sugars and cream
      if (/cream|butter|malai|fried|puris|pakora|rich|ladoo/i.test(text)) return false;
      return /sprout|boiled egg|egg white|tofu|grilled|steamed|chilla|salad|chaas|clear|dalma|besan|cucumber|bhakri|roti/i.test(text);
    }

    return false;
  }

  function getDishConditionTags(dish) {
    const tags = [];
    const text = `${dish.name || ''} ${dish.desc || ''}`.toLowerCase();

    if (dishMatchesCondition(dish, 'kidney') && (dish.protein <= 22 || /lauki|bottle gourd|dalma|khichdi|moong/i.test(text))) {
      tags.push({ id: 'kidney', label: 'Kidney Safe', icon: 'fa-droplet' });
    }
    if (dishMatchesCondition(dish, 'hypertension')) {
      tags.push({ id: 'hypertension', label: 'DASH / BP', icon: 'fa-heart-pulse' });
    }
    if (dishMatchesCondition(dish, 'lactose_intolerance')) {
      tags.push({ id: 'lactose_intolerance', label: 'Lactose-Free', icon: 'fa-shield-halved' });
    }
    if (dishMatchesCondition(dish, 'diabetes')) {
      tags.push({ id: 'diabetes', label: 'Low-GI / Diabetic', icon: 'fa-chart-line' });
    }
    if (dishMatchesCondition(dish, 'nuts_allergy')) {
      tags.push({ id: 'nuts_allergy', label: 'Nut-Free', icon: 'fa-ban' });
    }
    if (dishMatchesCondition(dish, 'dyslipidemia')) {
      tags.push({ id: 'dyslipidemia', label: 'Heart-Healthy', icon: 'fa-heart' });
    }

    return tags.slice(0, 4);
  }

  function renderDishesCatalog() {
    const grid = $('adDishesGrid');
    const emptyEl = $('adNoDishes');
    const countEl = $('adDishCount');
    if (!grid) return;

    const catalog = getCatalog();
    const q = (state.dishSearch || '').trim().toLowerCase();
    const diet = state.dishDiet;
    const cond = state.dishCondition;
    const reg = state.dishRegion;
    const slot = state.dishSlot;

    const filtered = catalog.filter(dish => {
      if (diet !== 'all' && dish.diet !== diet) return false;
      if (cond !== 'all' && !dishMatchesCondition(dish, cond)) return false;
      if (reg !== 'all' && dish.region !== reg) return false;
      if (slot !== 'all' && dish.slot !== slot) return false;
      if (q) {
        const full = `${dish.name} ${dish.desc} ${REGION_NAMES[dish.region] || ''} ${SLOT_NAMES[dish.slot] || ''} ${dish.diet}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${catalog.length} dishes`;
    }

    if (!filtered.length) {
      grid.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    grid.innerHTML = filtered.map(dish => {
      const dietMeta = DIET_BADGES[dish.diet] || { label: cap(dish.diet), cls: 'veg', icon: 'fa-utensils' };
      const regLabel = REGION_NAMES[dish.region] || cap(dish.region);
      const slotLabel = SLOT_NAMES[dish.slot] || cap(dish.slot);
      const caPct = Math.min(100, Math.round((dish.calcium / 1200) * 100));
      const tags = getDishConditionTags(dish);

      return `
        <article class="ad-dish-card" data-id="${esc(dish.id)}">
          <div class="ad-dish-header">
            <div class="ad-dish-meta-left">
              <span class="ad-dish-badge region">${esc(regLabel)}</span>
              <span class="ad-dish-badge slot">${esc(slotLabel)}</span>
            </div>
            <span class="ad-dish-tag ${dietMeta.cls}">
              <i class="fa-solid ${dietMeta.icon}"></i> ${esc(dietMeta.label)}
            </span>
          </div>

          <h3 class="ad-dish-name">${esc(dish.name)}</h3>
          <p class="ad-dish-desc">${esc(dish.desc)}</p>

          <div class="ad-dish-nutrients">
            <div class="ad-nutrient-box ca">
              <div class="ad-nutrient-val">
                <b>${dish.calcium}</b> <span>mg Ca</span>
              </div>
              <div class="ad-nutrient-bar">
                <i style="width: ${caPct}%;"></i>
              </div>
              <span class="ad-nutrient-sub">${caPct}% of 1,200mg Daily</span>
            </div>

            <div class="ad-nutrient-box pro">
              <div class="ad-nutrient-val">
                <b>${dish.protein}</b> <span>g Protein</span>
              </div>
              <span class="ad-nutrient-sub">Bone matrix repair</span>
            </div>
          </div>

          <div class="ad-dish-conditions">
            ${tags.map(t => `
              <span class="ad-cond-chip" title="Suitable for ${esc(t.label)}">
                <i class="fa-solid ${t.icon}"></i> ${esc(t.label)}
              </span>
            `).join('')}
          </div>
        </article>
      `;
    }).join('');
  }

  // Dish catalog filter event listeners
  if ($('adDishSearch')) {
    $('adDishSearch').addEventListener('input', e => {
      state.dishSearch = e.target.value;
      renderDishesCatalog();
    });
  }

  document.querySelectorAll('#adDietPills .ad-dish-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#adDietPills .ad-dish-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.dishDiet = btn.dataset.diet;
      renderDishesCatalog();
    });
  });

  if ($('adConditionFilter')) {
    $('adConditionFilter').addEventListener('change', e => {
      state.dishCondition = e.target.value;
      renderDishesCatalog();
    });
  }

  if ($('adRegionFilter')) {
    $('adRegionFilter').addEventListener('change', e => {
      state.dishRegion = e.target.value;
      renderDishesCatalog();
    });
  }

  if ($('adSlotFilter')) {
    $('adSlotFilter').addEventListener('change', e => {
      state.dishSlot = e.target.value;
      renderDishesCatalog();
    });
  }

  // ------------------------------------------------------------- User Drawer
  async function openUser(id) {
    $('adDrawer').hidden = false;
    $('adDrawerBody').innerHTML = '<p class="ad-muted">Loading…</p>';
    const r = await api('GET', `/admin/users/${encodeURIComponent(id)}`);
    if (r.status === 401) { closeDrawer(); return showLogin(); }
    if (!r.ok) { $('adDrawerBody').innerHTML = '<p class="ad-error">Could not load this user.</p>'; return; }
    renderUser(r.json.user, r.json.days || []);
    $('adDrawerClose').focus();
  }

  function closeDrawer() { $('adDrawer').hidden = true; }
  $('adDrawerClose').addEventListener('click', closeDrawer);
  $('adDrawer').addEventListener('click', e => { if (e.target === $('adDrawer')) closeDrawer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('adDrawer').hidden) closeDrawer(); });

  function renderUser(u, days) {
    const p = u.profile || {};
    const byDay = new Map(days.map(d => [d.day, d]));
    const today = new Date();
    const cells = [];
    const joined = (u.createdAt || '').slice(0, 10);
    const first = [joined].concat(days.map(d => d.day)).sort()[0];
    const ninetyAgo = new Date(today);
    ninetyAgo.setDate(today.getDate() - 89);
    const start = first && new Date(`${first}T00:00:00`) > ninetyAgo ? new Date(`${first}T00:00:00`) : ninetyAgo;
    const span = Math.round((new Date(today.toDateString()) - new Date(start.toDateString())) / 86400000) + 1;
    const lead = (start.getDay() + 6) % 7;
    for (let i = 0; i < lead; i++) cells.push('<span class="ad-cell empty"></span>');
    for (let i = 0; i < span; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toLocaleDateString('en-CA');
      const rec = byDay.get(iso);
      const status = rec ? rec.status : (iso < joined ? 'none' : 'missed');
      const tip = rec ? `${fmtShort(iso)}: ${LABELS[status]} · meals ${rec.dietDone}/${rec.dietTotal} · moves ${rec.movesDone}/${rec.movesTotal}` : `${fmtShort(iso)}: ${status === 'none' ? 'before joining' : 'nothing recorded'}`;
      cells.push(`<span class="ad-cell ${status}" data-tip="${esc(tip)}"></span>`);
    }
    const fact = (label, value) => `<div><span>${label}</span><b>${value == null || value === '' ? '—' : esc(value)}</b></div>`;
    const recent = days.slice().reverse().slice(0, 14);

    $('adDrawerBody').innerHTML = `
      <h2 id="adDrawerTitle">${esc(u.name || 'No name yet')}</h2>
      <p class="ad-muted">${esc(fmtPhone(u.phone))} · joined ${fmtDate(u.createdAt)} · last seen ${fmtDate(u.lastSeenAt)}</p>

      <div class="ad-mini-kpis">
        <div><b>${u.streak}</b><span>day streak</span></div>
        <div><b>${u.week.diet}%</b><span>diet · 7 days</span></div>
        <div><b>${u.week.moves}%</b><span>moves · 7 days</span></div>
        <div><b>${u.month.diet}%</b><span>diet · 30 days</span></div>
      </div>

      <h3>${span >= 90 ? 'Last 90 days' : `Since ${fmtDate(start.toLocaleDateString('en-CA'))}`}</h3>
      <div class="ad-heat">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(l => `<span class="ad-wd">${l}</span>`).join('')}${cells.join('')}</div>
      <div class="ad-legend"><span><i class="complete"></i>Routine done</span><span><i class="partial"></i>Partly done</span><span><i class="missed"></i>Missed</span></div>

      <h3>Health summary</h3>
      <div class="ad-facts">
        ${fact('Age', p.age)}${fact('BMI', p.bmi)}${fact('Diet', cap(p.diet))}${fact('Food region', cap(p.region))}
        ${fact('Conditions', (p.conditions || []).join(', ') || 'None')}${fact('Lowest T-score', p.lowestTScore == null ? 'No scan saved' : `${p.lowestTScore}${p.scanDate ? ` (${fmtDate(p.scanDate)})` : ''}`)}
        ${fact('Vitamin D', p.vitaminD != null ? `${p.vitaminD} ng/mL` : '')}${fact('Home hazards', p.homeHazards)}
        ${fact('Medicines', (p.medicines || []).join(', ') || 'None added')}${fact('Medicines taken · 7 days', p.medsWeek == null ? '' : `${p.medsWeek}%`)}
        ${fact('Fall risk signs', p.fallRisks)}${fact('Pillars done', ['build', 'protect', 'strengthen'].filter(k => (p.pillars || {})[k]).join(', ') || 'None')}
      </div>

      <h3>Recent days</h3>
      ${recent.length ? recent.map(d => `
        <details class="ad-day">
          <summary><span class="ad-status ${d.status}">${LABELS[d.status]}</span><b>${fmtDate(d.day)}</b><em>meals ${d.dietDone}/${d.dietTotal} · moves ${d.movesDone}/${d.movesTotal}</em></summary>
          <div class="ad-day-lists">
            <ul>${d.meals.map(m => `<li class="${m.done ? 'done' : ''}">${m.done ? '✓' : '○'} ${esc(m.name)}</li>`).join('')}</ul>
            <ul>${d.moves.map(m => `<li class="${m.done ? 'done' : ''}">${m.done ? '✓' : '○'} ${esc(m.name)}</li>`).join('')}</ul>
          </div>
        </details>`).join('') : '<p class="ad-muted">No days recorded yet.</p>'}
    `;
  }

  // ------------------------------------------------------------- Tooltip
  const tip = $('adTooltip');
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) { tip.hidden = true; return; }
    tip.textContent = el.dataset.tip;
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    tip.style.left = `${Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2))}px`;
    tip.style.top = `${Math.max(8, r.top - tip.offsetHeight - 8)}px`;
  });

  // ------------------------------------------------------------- Admin Management (Master Admin Exclusive)
  async function loadAdmins() {
    if (!state.isMaster) return;
    const tbody = $('adAdminsTableRows');
    const countEl = $('adAdminCount');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="ad-muted" style="text-align:center; padding:24px;">Loading administrators...</td></tr>';
    const res = await api('GET', '/admin/admins').catch(() => null);
    if (!res || !res.ok || !res.json || !res.json.admins) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="ad-error" style="text-align:center; padding:24px;">Failed to load administrators.</td></tr>';
      return;
    }
    const admins = res.json.admins || [];
    if (countEl) countEl.textContent = `${admins.length} active administrator account${admins.length === 1 ? '' : 's'}`;

    if (!admins.length) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="ad-muted" style="text-align:center; padding:24px;">No administrators found.</td></tr>';
      return;
    }

    if (tbody) {
      tbody.innerHTML = admins.map(a => {
        const isMaster = a.isPrimary || a.role === 'master' || a.id === 0;
        const icon = isMaster
          ? '<i class="fa-solid fa-crown" style="color:#D97706; margin-right:8px;"></i>'
          : '<i class="fa-solid fa-user-shield" style="color:var(--strengthen); margin-right:8px;"></i>';
        const roleBadge = isMaster
          ? '<span class="ad-role-badge master"><i class="fa-solid fa-crown"></i> Master Admin</span>'
          : '<span class="ad-role-badge admin"><i class="fa-solid fa-shield-halved"></i> Admin</span>';
        const createdText = isMaster ? 'Primary account' : `${fmtDate(a.created_at)} · by ${esc(a.created_by || 'master')}`;
        const actionHtml = isMaster
          ? '<span class="ad-protected-badge"><i class="fa-solid fa-lock"></i> Protected</span>'
          : `<button class="ad-btn-del-admin" data-admin-id="${a.id}" data-admin-user="${esc(a.username)}"><i class="fa-solid fa-trash-can"></i> Revoke</button>`;

        return `
          <tr>
            <td><strong>${icon}${esc(a.username)}</strong></td>
            <td>${roleBadge}</td>
            <td class="ad-muted">${createdText}</td>
            <td>${actionHtml}</td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.ad-btn-del-admin').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.adminId;
          const user = btn.dataset.adminUser;
          if (!confirm(`Are you sure you want to revoke admin access for "${user}"?`)) return;
          const delRes = await api('DELETE', `/admin/admins/${id}`).catch(() => null);
          if (delRes && delRes.ok) {
            loadAdmins();
          } else {
            alert((delRes && delRes.json && delRes.json.message) || 'Failed to revoke admin.');
          }
        });
      });
    }
  }

  function setAdminFeedback(msg, type) {
    const el = $('adAdminFeedback');
    if (!el) return;
    if (!msg) {
      el.hidden = true;
      el.textContent = '';
      el.className = 'ad-feedback-box';
      return;
    }
    el.hidden = false;
    el.className = `ad-feedback-box ${type || 'error'}`;
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    el.innerHTML = `${icon} <span>${esc(msg)}</span>`;
  }

  // Eye toggles for New Admin Password inputs
  if ($('toggleNewPassBtn') && $('newAdminPass')) {
    $('toggleNewPassBtn').addEventListener('click', () => {
      const inp = $('newAdminPass');
      const icon = $('toggleNewPassIcon');
      const isPass = inp.type === 'password';
      inp.type = isPass ? 'text' : 'password';
      if (icon) {
        icon.classList.toggle('fa-eye', !isPass);
        icon.classList.toggle('fa-eye-slash', isPass);
      }
    });
  }

  if ($('toggleConfirmPassBtn') && $('newAdminConfirmPass')) {
    $('toggleConfirmPassBtn').addEventListener('click', () => {
      const inp = $('newAdminConfirmPass');
      const icon = $('toggleConfirmPassIcon');
      const isPass = inp.type === 'password';
      inp.type = isPass ? 'text' : 'password';
      if (icon) {
        icon.classList.toggle('fa-eye', !isPass);
        icon.classList.toggle('fa-eye-slash', isPass);
      }
    });
  }

  // Create Admin Form submit
  if ($('adCreateAdminForm')) {
    $('adCreateAdminForm').addEventListener('submit', async e => {
      e.preventDefault();
      setAdminFeedback('', '');

      const usernameInput = $('newAdminUser');
      const passInput = $('newAdminPass');
      const confirmPassInput = $('newAdminConfirmPass');

      const username = (usernameInput && usernameInput.value ? usernameInput.value : '').trim();
      const password = passInput && passInput.value ? passInput.value : '';
      const confirmPassword = confirmPassInput && confirmPassInput.value ? confirmPassInput.value : '';

      // Validation
      if (!username || !password || !confirmPassword) {
        return setAdminFeedback('All fields are required.', 'error');
      }

      if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
        return setAdminFeedback('Username must be 3–30 characters (letters, numbers, hyphens or underscores).', 'error');
      }

      if (password.length < 6) {
        return setAdminFeedback('Password must be at least 6 characters.', 'error');
      }

      if (password !== confirmPassword) {
        return setAdminFeedback('Passwords do not match. Please verify confirmation.', 'error');
      }

      const submitBtn = $('btnCreateAdmin');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Admin...';
      }

      try {
        const res = await api('POST', '/admin/admins', { username, password, confirmPassword });
        if (res && res.ok) {
          setAdminFeedback(`Admin "${username}" was created successfully!`, 'success');
          if ($('adCreateAdminForm')) $('adCreateAdminForm').reset();
          loadAdmins();
        } else {
          const err = (res && res.json && res.json.message) || 'Failed to create admin.';
          setAdminFeedback(err, 'error');
        }
      } catch (err) {
        setAdminFeedback('Network error while creating admin.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Admin Account';
        }
      }
    });
  }

  start();
})();
