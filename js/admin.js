/**
 * BONE SIP super-admin portal (admin.html). Talks to /api/admin/* on our own
 * server (server/accounts.js); every view of a user and every export is logged.
 */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const state = { users: [], filter: 'all', sort: 'recent', search: '', phone: '' };

  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = iso => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
  const fmtShort = iso => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const cap = v => (v ? String(v).charAt(0).toUpperCase() + String(v).slice(1).replace(/_/g, ' ') : v);
  const fmtPhone = p => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
  const LABELS = { complete: 'Routine done', partial: 'Partly done', missed: 'Missed' };

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

  // ------------------------------------------------------------- Dashboard
  async function start() {
    const me = await api('GET', '/admin/me').catch(() => null);
    if (!me || !me.ok) return showLogin();
    $('adLogin').hidden = true;
    $('adApp').hidden = false;
    $('adTestBanner').hidden = !me.json.testMode;
    await Promise.all([loadOverview(), loadUsers()]);
  }

  async function loadOverview() {
    const r = await api('GET', '/admin/overview');
    if (r.status === 401) return showLogin();
    const t = r.json.totals;
    const kpi = (label, value, sub) => `<div class="ad-kpi"><span>${label}</span><b>${value}</b>${sub ? `<em>${sub}</em>` : ''}</div>`;
    $('adKpis').innerHTML = [
      kpi('Users', t.users, `${t.newThisWeek} new this week`),
      kpi('Active today', t.activeToday, `${t.users ? Math.round((t.activeToday / t.users) * 100) : 0}% of users`),
      kpi('Active this week', t.active7, 'ticked a meal or move'),
      kpi('Diet followed', `${t.dietWeek}%`, 'average, last 7 days'),
      kpi('Moves done', `${t.movesWeek}%`, 'average, last 7 days')
    ].join('');
    renderActiveChart(r.json.activeDays || []);
  }

  // Single-series bar chart: one brand hue, rounded data ends, hover tooltip.
  function renderActiveChart(days) {
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
    const list = visibleUsers();
    $('adNoUsers').hidden = list.length > 0;
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

  $('adSearch').addEventListener('input', e => { state.search = e.target.value; renderUsers(); });
  $('adSort').addEventListener('change', e => { state.sort = e.target.value; renderUsers(); });
  document.querySelectorAll('.ad-chip').forEach(chip => chip.addEventListener('click', () => {
    document.querySelectorAll('.ad-chip').forEach(c => c.classList.toggle('active', c === chip));
    state.filter = chip.dataset.filter;
    renderUsers();
  }));
  $('adUserRows').addEventListener('click', e => {
    const row = e.target.closest('tr[data-id]');
    if (row) openUser(row.dataset.id);
  });
  $('adUserRows').addEventListener('keydown', e => {
    const row = e.target.closest('tr[data-id]');
    if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openUser(row.dataset.id); }
  });

  document.querySelectorAll('.ad-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.ad-tab').forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
    $('adUsersTab').hidden = tab.dataset.tab !== 'users';
    $('adAuditTab').hidden = tab.dataset.tab !== 'audit';
    if (tab.dataset.tab === 'audit') loadAudit();
  }));

  async function loadAudit() {
    const r = await api('GET', '/admin/audit');
    if (r.status === 401) return showLogin();
    const names = { login: 'Admin logged in', view_user: 'Viewed user', export_csv: 'Exported users (CSV)' };
    $('adAuditRows').innerHTML = (r.json.entries || []).map(e => `
      <tr><td>${esc(new Date(e.at).toLocaleString('en-IN'))}</td><td>${esc(names[e.action] || e.action)}</td>
      <td>${e.target_user_id ? `${esc(e.target_name || 'No name')} · ${esc(e.target_phone ? fmtPhone(e.target_phone) : 'deleted')}` : '—'}</td></tr>`).join('');
  }

  // ------------------------------------------------------------- User drawer
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
    // From the user's first day (joining or first logged day), at most 90 days back.
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

  // ------------------------------------------------------------- Tooltip (bars and heat cells)
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

  start();
})();
