//@@ replace showToast
  function showToast(message, icon = 'fa-circle-check') {
    const toast = document.getElementById('appToast');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.innerHTML = `<i class="fa-solid ${icon}" style="color: #F3B5CF; margin-right: 8px;"></i>${escapeHtml(message)}`;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

//@@ replace getBoneLogoSVG
  // --------------------------------------------------------------------------
  // VISUAL HELPERS (3D illustrations, escaping, celebration, wizard chrome)
  // --------------------------------------------------------------------------
  const ICON_BASE = 'assets/icons3d/';
  const prefersReducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function img3d(name, cls = '', size = 56, extra = '') {
    return `<img src="${ICON_BASE}${name}.webp" alt="" class="i3d ${cls}" width="${size}" height="${size}" decoding="async" ${extra}>`;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function celebrate(kind = 'small') {
    if (prefersReducedMotion || typeof window.confetti !== 'function') return;
    const colors = ['#E5305F', '#B1315D', '#6B2A5C', '#332D4B', '#F3B5CF'];
    if (kind === 'big') {
      const end = Date.now() + 900;
      (function frame() {
        window.confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors });
        window.confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    } else {
      window.confetti({ particleCount: 70, spread: 70, startVelocity: 32, origin: { y: 0.75 }, colors, scalar: 0.9 });
    }
  }

  function animateNumber(el, to) {
    if (!el) return;
    const from = parseInt(el.textContent, 10) || 0;
    if (prefersReducedMotion || from === to) { el.textContent = to; return; }
    const start = performance.now();
    const duration = 700;
    cancelAnimationFrame(el.rafId);
    const step = (now) => {
      const k = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (k < 1) el.rafId = requestAnimationFrame(step);
    };
    el.rafId = requestAnimationFrame(step);
  }

  function wizTop({ back = '', total = 0, done = 0, color = '', label = '' }) {
    const bars = total
      ? `<div class="wiz-progress" style="${color ? `--wiz-c: ${color};` : ''}">${Array.from({ length: total }, (_, i) => `<span class="${i < done ? 'on' : ''}"></span>`).join('')}</div>`
      : '<div style="flex: 1;"></div>';
    return `
      <div class="wiz-top">
        ${back ? `<button class="wiz-back" onclick="${back}" aria-label="Back"><i class="fa-solid fa-arrow-left"></i></button>` : ''}
        ${bars}
        ${label ? `<span class="wiz-step">${label}</span>` : ''}
      </div>`;
  }

  function choiceTile({ id, img, title, sub = '', selected = false, onclick, i = 0 }) {
    return `
      <button type="button" class="choice-tile pop ${selected ? 'selected' : ''}" data-id="${id}" style="--i: ${i};" onclick="${onclick}" aria-pressed="${selected}">
        <span class="tick"><i class="fa-solid fa-check"></i></span>
        ${img3d(img || 'sparkles', '', 58)}
        <b>${title}</b>
        ${sub ? `<small>${sub}</small>` : ''}
      </button>`;
  }

  function choiceRow({ id, img, title, selected = false, onclick, i = 0 }) {
    return `
      <button type="button" class="choice-row fade-up ${selected ? 'selected' : ''}" data-id="${id}" style="--i: ${i};" onclick="${onclick}" aria-pressed="${selected}">
        ${img3d(img || 'check', '', 40)}
        <b>${title}</b>
        <span class="tick"><i class="fa-solid fa-check"></i></span>
      </button>`;
  }

  function staticTile({ img, title, sub, i = 0 }) {
    return `
      <div class="choice-tile static pop" style="--i: ${i};">
        ${img3d(img, '', 58)}
        <b>${title}</b>
        ${sub ? `<small>${sub}</small>` : ''}
      </div>`;
  }

  function pillarRow({ kind = '', img, title, sub, num = '', i = 0 }) {
    return `
      <div class="pillar-row ${kind} pop" style="--i: ${i};">
        ${img3d(img, '', 54)}
        <div><h4>${title}</h4><p>${sub}</p></div>
        ${num ? `<span class="num">${num}</span>` : ''}
      </div>`;
  }

  function foodChips(items) {
    return items.map(([img, label]) => `<span class="food-chip">${img3d(img, '', 22)} ${label}</span>`).join('');
  }

  function setTileSelected(scope, id, selected) {
    const el = document.querySelector(`${scope} [data-id="${id}"]`);
    if (!el) return;
    el.classList.toggle('selected', selected);
    el.setAttribute('aria-pressed', String(selected));
  }

  function getRiskLevel(count) {
    if (count > 4) return { label: 'High', color: '#DC2626', msg: 'Please discuss these signs with your doctor.' };
    if (count >= 2) return { label: 'Moderate', color: '#D97706', msg: 'A few warning signs. The home check helps.' };
    return { label: 'Low', color: '#1E9E62', msg: 'Great start. Let’s make your home safe too.' };
  }

  function riskAngle(count) {
    return -90 + (Math.min(count, 6) / 6) * 180;
  }

  function riskInfoHtml(count) {
    const r = getRiskLevel(count);
    return `
      <b>${count} of 6</b>
      <span>${r.msg}</span><br>
      <span class="lvl" style="background: ${r.color};">${r.label} risk</span>`;
  }

  function riskGaugeHtml(count, startAngle) {
    const angle = typeof startAngle === 'number' ? startAngle : riskAngle(count);
    return `
      <div class="gauge" aria-hidden="true">
        <svg viewBox="0 0 132 76">
          <path d="M10 66 A56 56 0 0 1 36.3 18.5" stroke="#1E9E62" stroke-width="12" fill="none" stroke-linecap="round"/>
          <path d="M39.7 16.6 A56 56 0 0 1 92.3 16.6" stroke="#D97706" stroke-width="12" fill="none"/>
          <path d="M95.7 18.5 A56 56 0 0 1 122 66" stroke="#DC2626" stroke-width="12" fill="none" stroke-linecap="round"/>
          <g class="needle" style="transform: rotate(${angle}deg);">
            <line x1="66" y1="66" x2="66" y2="22" stroke="#2A2540" stroke-width="4" stroke-linecap="round"/>
          </g>
          <circle cx="66" cy="66" r="7" fill="#2A2540"/>
        </svg>
      </div>
      <div class="gauge-info" aria-live="polite">${riskInfoHtml(count)}</div>`;
  }

  function updateRiskGauge() {
    const card = document.getElementById('riskGaugeCard');
    if (!card) return;
    const count = state.protectRiskChecked.size;
    const needle = card.querySelector('.needle');
    if (needle) needle.style.transform = `rotate(${riskAngle(count)}deg)`;
    const info = card.querySelector('.gauge-info');
    if (info) info.innerHTML = riskInfoHtml(count);
  }

  function roomTabsHtml(activeRoomId, handler) {
    return BONE_SIP_DATA.protectHomeAuditRooms.map(room => {
      const answers = state.protectHomeAuditAnswers[room.id] || {};
      const done = room.questions.every(q => answers[q.id]);
      return `
        <button type="button" class="room-tab-btn ${room.id === activeRoomId ? 'active' : ''}" onclick="${handler}('${room.id}')" aria-pressed="${room.id === activeRoomId}">
          ${done ? '<i class="fa-solid fa-circle-check room-done"></i>' : ''}
          ${img3d(room.img || 'house', '', 36)}
          ${room.name}
        </button>`;
    }).join('');
  }

  function qaRowsHtml(room, handler) {
    const answers = state.protectHomeAuditAnswers[room.id] || {};
    return room.questions.map(q => {
      const ans = answers[q.id] || '';
      return `
        <div class="qa-row">
          <span>${q.text}</span>
          <div class="yesno" role="group" aria-label="${escapeHtml(q.text)}">
            <button type="button" class="yes ${ans === 'yes' ? 'on' : ''}" aria-pressed="${ans === 'yes'}" onclick="${handler}('${room.id}', '${q.id}', 'yes')">Yes</button>
            <button type="button" class="no ${ans === 'no' ? 'on' : ''}" aria-pressed="${ans === 'no'}" onclick="${handler}('${room.id}', '${q.id}', 'no')">No</button>
          </div>
        </div>`;
    }).join('');
  }

  function homeSafetyTotals() {
    let total = 0;
    let safe = 0;
    BONE_SIP_DATA.protectHomeAuditRooms.forEach(room => {
      const answers = state.protectHomeAuditAnswers[room.id] || {};
      room.questions.forEach(q => {
        total++;
        if (answers[q.id] === 'yes') safe++;
      });
    });
    return { total, safe, pct: total ? Math.round((safe / total) * 100) : 0 };
  }

  function dietImgFor(diet) {
    return { veg: 'salad', eggetarian: 'egg', non_veg: 'poultry', vegan: 'seedling' }[diet] || 'salad';
  }

  const SLOT_META = {
    m_sun_d3: { name: 'Morning sun', img: 'sunrise', time: '6:30–8:00 AM' },
    m_breakfast: { name: 'Breakfast', img: 'coffee', time: '8:00–9:30 AM' },
    m_lunch: { name: 'Lunch', img: 'curry', time: '1:00–2:30 PM' },
    m_snack: { name: 'Snack', img: 'peanuts', time: '4:30–5:30 PM' },
    m_dinner: { name: 'Dinner', img: 'bowl', time: '7:30–8:30 PM' }
  };
  const SLOT_ORDER = ['m_sun_d3', 'm_breakfast', 'm_lunch', 'm_snack', 'm_dinner'];

  function isDemoMode() {
    const cfg = window.BONE_SIP_CONFIG || {};
    return cfg.mode !== 'production';
  }

  function toISODate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

//@@ replace startOnboardingTour
  function startOnboardingTour() {
    playSound('tap');
    const splash = document.getElementById('appSplashScreen');
    if (splash) splash.classList.add('dismissed');
    if (hasExistingJourney()) {
      resumeJourney();
      return;
    }
    const tour = document.getElementById('appOnboardingOverlay');
    if (tour) tour.style.display = 'flex';
    state.onboardingSlide = 0;
    renderOnboardingCarousel();
  }

  function hasExistingJourney() {
    return !!(state.auth.isVerified || state.completedPillars.build || state.selectedAssets.length || state.buildAssessmentStep !== 'goals');
  }

  // Sends a returning user to wherever they left off.
  function resumeJourney() {
    if (state.completedPillars.build && state.auth.isVerified) {
      if (state.completedPillars.protect && state.completedPillars.strengthen) {
        state.activePillar = 'build';
        showView('build');
        switchBuildSubTab(state.activeBuildSubTab || 'diet', true);
      } else if (state.completedPillars.protect) {
        state.assessmentPhase = 'strengthen';
        state.activePillar = 'strengthen';
        showView('assessment');
        renderAssessmentStage();
      } else {
        state.assessmentPhase = 'protect';
        state.activePillar = 'protect';
        showView('assessment');
        renderAssessmentStage();
      }
    } else {
      state.assessmentPhase = 'build';
      state.activePillar = 'build';
      showView('assessment');
      renderAssessmentStage();
    }
    renderPillarBottomNav();
  }

//@@ replace skipOnboarding
  function skipOnboarding() {
    playSound('tap');
    const splash = document.getElementById('appSplashScreen');
    const tour = document.getElementById('appOnboardingOverlay');
    if (splash) splash.classList.add('dismissed');
    if (tour) {
      tour.classList.add('dismissed');
      setTimeout(() => { tour.style.display = 'none'; }, 400);
    }
    if (hasExistingJourney()) {
      resumeJourney();
      return;
    }
    state.assessmentPhase = 'build';
    state.buildAssessmentStep = 'goals';
    showView('assessment');
    renderAssessmentStage();
    renderPillarBottomNav();
  }

//@@ replace renderOnboardingCarousel
  function renderOnboardingCarousel() {
    const container = document.getElementById('onboardingCarousel');
    const dotsContainer = document.getElementById('onboardingDots');
    const nextBtn = document.getElementById('onboardNextBtn');
    const slides = BONE_SIP_DATA.onboardingScreens || [];
    if (!container || !slides.length) return;

    container.innerHTML = slides.map((slide, index) => {
      const art = slide.art || ['bone'];
      let artHtml;
      if (slide.id === 'onboard_moves') {
        artHtml = `
          <div class="onboard-art trio">
            <div class="trio-item build pop" style="--i: 1;">${img3d(art[0], '', 76)}<span>Build</span></div>
            <i class="fa-solid fa-chevron-right trio-arrow"></i>
            <div class="trio-item protect pop" style="--i: 3;">${img3d(art[1], '', 76)}<span>Protect</span></div>
            <i class="fa-solid fa-chevron-right trio-arrow"></i>
            <div class="trio-item strengthen pop" style="--i: 5;">${img3d(art[2], '', 76)}<span>Strengthen</span></div>
          </div>`;
      } else {
        artHtml = `
          <div class="onboard-art">
            ${img3d(art[0], 'hero float', 132)}
            ${art[1] ? img3d(art[1], 'sat s1 pop', 64, 'style="--i: 2;"') : ''}
            ${art[2] ? img3d(art[2], 'sat s2 pop', 64, 'style="--i: 4;"') : ''}
            ${art[3] ? img3d(art[3], 'sat s3 pop', 64, 'style="--i: 6;"') : ''}
          </div>`;
      }
      return `
        <div class="onboard-slide ${index === state.onboardingSlide ? 'active' : ''}" data-slide="${index}">
          ${artHtml}
          <div class="onboard-eyebrow">${slide.tag}</div>
          <h2 class="onboard-heading">${slide.title}</h2>
          <p class="onboard-desc">${slide.description}</p>
        </div>`;
    }).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map((slide, index) => `
        <button class="onboard-dot ${index === state.onboardingSlide ? 'active' : ''}" aria-label="Slide ${index + 1}" onclick="BoneApp.goToOnboardingSlide(${index})"></button>
      `).join('');
    }

    if (nextBtn) {
      const current = slides[state.onboardingSlide];
      const isLast = state.onboardingSlide === slides.length - 1;
      nextBtn.innerHTML = `${current ? current.btnText : 'Next'} <i class="fa-solid fa-arrow-right"></i>`;
      nextBtn.classList.toggle('cta-lg', isLast);
    }
  }

  function setupOnboardingSwipe() {
    const stage = document.getElementById('onboardingCarousel');
    if (!stage) return;
    let startX = null;
    stage.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) nextOnboardingSlide();
      else if (state.onboardingSlide > 0) goToOnboardingSlide(state.onboardingSlide - 1);
    }, { passive: true });
  }

//@@ replace renderPillarBottomNav
  function renderPillarBottomNav() {
    const pillars = [
      { id: 'build', label: 'Build', btn: 'pillarBtnBuild', icon: 'iconPillarBuild', img: 'biceps' },
      { id: 'protect', label: 'Protect', btn: 'pillarBtnProtect', icon: 'iconPillarProtect', img: 'shield' },
      { id: 'strengthen', label: 'Strengthen', btn: 'pillarBtnStrengthen', icon: 'iconPillarStrengthen', img: 'chart' }
    ];
    pillars.forEach(p => {
      const btn = document.getElementById(p.btn);
      const icon = document.getElementById(p.icon);
      if (!btn) return;
      const locked = !state.unlockedPillars[p.id];
      const active = !locked && state.activePillar === p.id;
      btn.className = `pillar-nav-btn pillar-${p.id}`;
      if (locked) btn.classList.add('locked');
      if (active) btn.classList.add('active');
      if (state.completedPillars[p.id] && !active) btn.classList.add('done');
      btn.setAttribute('aria-current', active ? 'page' : 'false');
      btn.setAttribute('aria-label', locked ? `${p.label} (locked)` : p.label);
      if (icon) {
        icon.innerHTML = `<img src="${ICON_BASE}${p.img}.webp" alt="" width="32" height="32">${locked ? '<span class="lock-badge"><i class="fa-solid fa-lock"></i></span>' : ''}`;
      }
    });
  }

//@@ replace renderAssessmentStage
  let lastStageKey = '';
  function renderAssessmentStage() {
    const container = document.getElementById('assessmentStageContainer');
    if (!container) return;

    renderPillarBottomNav();

    // Animate only when the step changes, not on every tap within a step.
    const key = `${state.assessmentPhase}:${state.buildAssessmentStep}:${state.protectAssessmentStep}:${state.strengthenAssessmentStep}`;
    const isNewStep = key !== lastStageKey;
    container.classList.toggle('no-anim', !isNewStep);
    if (isNewStep && lastStageKey) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    lastStageKey = key;

    if (state.assessmentPhase === 'build') {
      renderBuildAssessmentStep(container);
    } else if (state.assessmentPhase === 'protect') {
      renderProtectAssessmentStep(container);
    } else if (state.assessmentPhase === 'strengthen') {
      renderStrengthenAssessmentStep(container);
    }
    BoneDB.save();
  }

//@@ replace renderBuildAssessmentStep
  function renderBuildAssessmentStep(container) {
    const step = state.buildAssessmentStep;
    const data = BONE_SIP_DATA;

    if (step === 'goals') {
      container.innerHTML = `
        ${wizTop({ label: 'Before we begin' })}
        <div class="wiz-center">
          <div class="wiz-hero">
            ${img3d('bone', 'i3d-lg float', 72)}
            <div>
              <h2 class="wiz-title">What would you never want to lose?</h2>
              <p class="wiz-sub">Pick everything that matters to you.</p>
            </div>
          </div>
        </div>
        <div class="choice-grid cols-3" id="lifeAssetGrid">
          ${data.lifeAssets.map((a, i) => choiceTile({
            id: a.id, img: a.img, title: a.title, i,
            selected: state.selectedAssets.includes(a.id),
            onclick: `BoneApp.toggleLifeAsset('${a.id}')`
          })).join('')}
        </div>
        <p class="wiz-note"><i class="fa-solid fa-bone" style="color: var(--brand-pink);"></i> All of these rest on strong bones.</p>
        <div class="wiz-footer">
          <span class="wiz-count" id="assetSelectedCount">${state.selectedAssets.length} selected</span>
          <button class="cta-btn" onclick="BoneApp.setBuildAssessmentStep('plan_overview')">Continue <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 'plan_overview') {
      const picked = state.selectedAssets.map(id => data.lifeAssets.find(a => a.id === id)).filter(Boolean);
      const shown = (picked.length ? picked : data.lifeAssets).slice(0, 3);
      container.innerHTML = `
        ${wizTop({ back: "BoneApp.setBuildAssessmentStep('goals')", label: 'Your plan' })}
        <div class="wiz-center">
          <div class="value-pills">
            ${shown.map((a, i) => `<span class="pop" style="--i: ${i};">${img3d(a.img, '', 24)} ${a.title}</span>`).join('')}
          </div>
          <h2 class="wiz-title">It all rests on your bones.</h2>
          <p class="wiz-sub">Like a SIP for your money — small, steady deposits for your bones.</p>
        </div>
        <div class="pillar-stack" style="margin-top: 18px;">
          ${pillarRow({ kind: 'build', img: 'biceps', title: 'Build', sub: 'Food · Vitamin D · Exercise', num: 1, i: 3 })}
          ${pillarRow({ kind: 'protect', img: 'shield', title: 'Protect', sub: 'Fall-proof home · Good shoes', num: 2, i: 4 })}
          ${pillarRow({ kind: 'strengthen', img: 'stethoscope', title: 'Strengthen', sub: 'Bone scan · Doctor review', num: 3, i: 5 })}
        </div>
        <div class="wiz-footer">
          <button class="cta-btn" onclick="BoneApp.setBuildAssessmentStep('build_education')">Start my plan <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 'build_education') {
      container.innerHTML = `
        ${wizTop({ back: "BoneApp.setBuildAssessmentStep('plan_overview')", label: 'The 3-2-1 rule' })}
        <div class="wiz-center">
          <h2 class="wiz-title">Your daily 3-2-1</h2>
          <p class="wiz-sub">Three simple habits do most of the work.</p>
        </div>
        <div class="formula" style="margin-top: 16px;">
          <div class="formula-cell pop" style="--i: 1;">
            <div class="formula-num">3</div>
            <div class="formula-icons">${img3d('milk', '', 34)}${img3d('cheese', '', 34)}${img3d('leafy', '', 34)}</div>
            <b>Calcium</b><small>servings</small>
          </div>
          <div class="formula-cell pop" style="--i: 2;">
            <div class="formula-num">2</div>
            <div class="formula-icons">${img3d('egg', '', 34)}${img3d('peanuts', '', 34)}</div>
            <b>Protein</b><small>servings</small>
          </div>
          <div class="formula-cell pop" style="--i: 3;">
            <div class="formula-num">1</div>
            <div class="formula-icons">${img3d('sun', '', 34)}</div>
            <b>Vitamin D</b><small>source</small>
          </div>
        </div>
        <div class="info-card fade-up" style="--i: 4;">
          <h4>${img3d('milk', '', 28)} Calcium builds bone</h4>
          <div class="food-chips">${foodChips([['milk', 'Milk & curd'], ['cheese', 'Paneer'], ['curry', 'Ragi'], ['peanuts', 'Til & almonds'], ['leafy', 'Greens']])}</div>
        </div>
        <div class="info-card fade-up" style="--i: 5;">
          <h4>${img3d('sun', '', 28)} Vitamin D absorbs it</h4>
          <div class="food-chips">${foodChips([['sunrise', 'Morning sun'], ['egg', 'Egg yolk'], ['fish', 'Fatty fish'], ['pill', 'If advised']])}</div>
        </div>
        <div class="info-card fade-up" style="--i: 6;">
          <h4>${img3d('egg', '', 28)} Protein builds muscle</h4>
          <div class="food-chips">${foodChips([['bowl', 'Dal'], ['seedling', 'Soy & tofu'], ['cheese', 'Paneer'], ['fish', 'Eggs & fish']])}</div>
        </div>
        <p class="wiz-note"><i class="fa-solid fa-circle-info"></i> Aim for about 1,000–1,200 mg calcium a day, or as your doctor advises.</p>
        <div class="wiz-footer">
          <button class="cta-btn" onclick="BoneApp.setBuildAssessmentStep('diet')">Personalise in 1 minute <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 'diet') {
      container.innerHTML = `
        ${wizTop({ back: "BoneApp.setBuildAssessmentStep('build_education')", total: 4, done: 1, label: '1 of 4' })}
        <div class="baseline-pill">
          <span class="bp-stat"><i class="fa-solid fa-ruler-vertical"></i> ${state.userProfile.heightCm} cm</span>
          <span class="bp-stat"><i class="fa-solid fa-weight-scale"></i> ${state.userProfile.weightKg} kg</span>
          <span class="spacer"></span>
          <button class="btn btn-sm btn-outline" onclick="BoneApp.openHeightWeightModal()"><i class="fa-solid fa-pen"></i> Edit</button>
        </div>
        <h2 class="wiz-title">What's on your plate?</h2>
        <p class="wiz-sub">We'll size your calcium & protein targets.</p>
        <div class="choice-grid" style="margin-top: 16px;">
          ${data.dietOptions.map((o, i) => choiceTile({
            id: o.id, img: o.img, title: o.title, sub: o.description, i,
            selected: state.userProfile.diet === o.id,
            onclick: `BoneApp.selectDiet('${o.id}')`
          })).join('')}
        </div>
        <div class="wiz-footer">
          <button class="cta-btn" onclick="BoneApp.setBuildAssessmentStep('regional_food')">Continue <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 'regional_food') {
      container.innerHTML = `
        ${wizTop({ back: "BoneApp.setBuildAssessmentStep('diet')", total: 4, done: 2, label: '2 of 4' })}
        <h2 class="wiz-title">Which kitchen is yours?</h2>
        <p class="wiz-sub">We'll suggest dishes you already cook.</p>
        <div class="choice-grid" style="margin-top: 16px;">
          ${data.regionalFoodOptions.map((o, i) => choiceTile({
            id: o.id, img: o.img, title: o.title, sub: o.description, i,
            selected: state.userProfile.regionalFood === o.id,
            onclick: `BoneApp.selectRegionalFood('${o.id}')`
          })).join('')}
        </div>
        <div class="wiz-footer">
          <button class="cta-btn" onclick="BoneApp.setBuildAssessmentStep('activity')">Continue <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 'activity') {
      container.innerHTML = `
        ${wizTop({ back: "BoneApp.setBuildAssessmentStep('regional_food')", total: 4, done: 3, label: '3 of 4' })}
        <h2 class="wiz-title">How active is your day?</h2>
        <p class="wiz-sub">Movement tells your bones to grow stronger.</p>
        <div class="choice-grid" style="margin-top: 16px;">
          ${data.activityLevelOptions.map((o, i) => choiceTile({
            id: o.id, img: o.img, title: o.title, sub: o.description, i,
            selected: state.userProfile.activityLevel === o.id,
            onclick: `BoneApp.selectActivity('${o.id}')`
          })).join('')}
        </div>
        <div class="wiz-footer">
          <button class="cta-btn" onclick="BoneApp.setBuildAssessmentStep('conditions')">Continue <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 'conditions') {
      container.innerHTML = `
        ${wizTop({ back: "BoneApp.setBuildAssessmentStep('activity')", total: 4, done: 4, label: '4 of 4' })}
        <h2 class="wiz-title">Anything we should know?</h2>
        <p class="wiz-sub">Pick any that apply.</p>
        <div class="choice-grid" id="healthConditionsList" style="margin-top: 16px;">
          ${data.healthConditionOptions.map((o, i) => choiceTile({
            id: o.id, img: o.img, title: o.title, sub: o.description, i,
            selected: state.userProfile.healthConditions.includes(o.id),
            onclick: `BoneApp.toggleHealthCondition('${o.id}')`
          })).join('')}
        </div>
        <div class="wiz-footer">
          <button class="cta-btn" onclick="BoneApp.proceedToLogin()">Save my plan <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
  }

//@@ replace renderProtectAssessmentStep
  function renderProtectAssessmentStep(container) {
    const step = state.protectAssessmentStep;
    const data = BONE_SIP_DATA;

    if (step === 1) {
      container.innerHTML = `
        ${wizTop({ total: 3, done: 1, color: 'var(--protect)', label: 'Protect · 1 of 3' })}
        <div class="unlock-banner protect pop">
          ${img3d('party', '', 40)}
          <div><b>Build complete!</b><span>Protect is now unlocked.</span></div>
        </div>
        <div class="wiz-hero">
          ${img3d('shield', 'i3d-lg float', 72)}
          <div>
            <span class="step-chip protect">Protect</span>
            <h2 class="wiz-title">Guard your bones from falls</h2>
            <p class="wiz-sub">One fall can undo years of bone building.</p>
          </div>
        </div>
        <div class="choice-grid protect">
          ${data.protectPortfolioCards.map((c, i) => staticTile({ img: c.img, title: c.title, sub: c.desc, i })).join('')}
        </div>
        <div class="wiz-footer">
          <button class="cta-btn protect" onclick="BoneApp.setProtectAssessmentStep(2)">Check my fall risk <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 2) {
      const count = state.protectRiskChecked.size;
      container.innerHTML = `
        ${wizTop({ back: 'BoneApp.setProtectAssessmentStep(1)', total: 3, done: 2, color: 'var(--protect)', label: '2 of 3' })}
        <h2 class="wiz-title">Quick fall-risk check</h2>
        <p class="wiz-sub">Tap anything that applies to you.</p>
        <div class="gauge-card" id="riskGaugeCard" style="margin-top: 14px;">
          ${riskGaugeHtml(count, container.classList.contains('no-anim') ? undefined : -90)}
        </div>
        <div class="choice-grid cols-3 protect" id="riskFactorGrid">
          ${data.boneRiskAuditFactors.map((f, i) => choiceTile({
            id: f.id, img: f.img, title: f.text, i,
            selected: state.protectRiskChecked.has(f.id),
            onclick: `BoneApp.toggleProtectRisk('${f.id}')`
          })).join('')}
        </div>
        <p class="wiz-note"><i class="fa-solid fa-circle-info"></i> An awareness check, not a diagnosis.</p>
        <div class="wiz-footer">
          <button class="cta-btn protect" onclick="BoneApp.setProtectAssessmentStep(3)">Next: home check <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
      // Sweep the needle in from the left on first paint.
      requestAnimationFrame(() => requestAnimationFrame(updateRiskGauge));
    }
    else if (step === 3) {
      const rooms = data.protectHomeAuditRooms;
      const activeRoom = rooms.find(r => r.id === state.selectedAuditRoom) || rooms[0];
      const roomIndex = rooms.indexOf(activeRoom) + 1;
      const totals = homeSafetyTotals();
      container.innerHTML = `
        ${wizTop({ back: 'BoneApp.setProtectAssessmentStep(2)', total: 3, done: 3, color: 'var(--protect)', label: '3 of 3' })}
        <h2 class="wiz-title">Is your home fall-proof?</h2>
        <p class="wiz-sub">Most falls happen at home. Check each room.</p>
        <div class="room-tabs" style="margin-top: 14px;">${roomTabsHtml(activeRoom.id, 'BoneApp.selectAuditRoom')}</div>
        <div class="room-card">
          <div class="room-card-head">
            ${img3d(activeRoom.img || 'house', '', 48)}
            <div><b>${activeRoom.name}</b><span>Room ${roomIndex} of ${rooms.length}</span></div>
          </div>
          <div class="qa-list">${qaRowsHtml(activeRoom, 'BoneApp.setHomeAuditAnswer')}</div>
        </div>
        <div class="home-score">
          <div class="hs-top"><span><i class="fa-solid fa-house-circle-check"></i> Home safety</span><span>${totals.safe} of ${totals.total} safe</span></div>
          <div class="bar"><i style="width: ${totals.pct}%;"></i></div>
        </div>
        <div class="wiz-footer">
          <button class="cta-btn protect" onclick="BoneApp.completeProtectAssessment()">Finish Protect <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
  }

//@@ replace renderStrengthenAssessmentStep
  function renderStrengthenAssessmentStep(container) {
    const step = state.strengthenAssessmentStep;

    if (step === 1) {
      container.innerHTML = `
        ${wizTop({ total: 2, done: 1, color: 'var(--strengthen)', label: 'Strengthen · 1 of 2' })}
        <div class="unlock-banner strengthen pop">
          ${img3d('party', '', 40)}
          <div><b>Protect complete!</b><span>Strengthen is now unlocked.</span></div>
        </div>
        <div class="wiz-hero">
          ${img3d('stethoscope', 'i3d-lg float', 72)}
          <div>
            <span class="step-chip strengthen">Strengthen</span>
            <h2 class="wiz-title">Know your numbers</h2>
            <p class="wiz-sub">Three checks to review with your doctor.</p>
          </div>
        </div>
        <div class="pillar-stack">
          ${pillarRow({ img: 'xray', title: 'DXA bone scan', sub: 'Measures bone density at hip & spine', i: 1 })}
          ${pillarRow({ img: 'barchart', title: 'FRAX® score', sub: 'Your 10-year fracture risk', i: 2 })}
          ${pillarRow({ img: 'clipboard', title: 'Doctor review', sub: 'Questions for your next visit', i: 3 })}
        </div>
        <div class="wiz-footer">
          <button class="cta-btn strengthen" onclick="BoneApp.setStrengthenAssessmentStep(2)">See my doctor checklist <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
    else if (step === 2) {
      container.innerHTML = `
        ${wizTop({ back: 'BoneApp.setStrengthenAssessmentStep(1)', total: 2, done: 2, color: 'var(--strengthen)', label: '2 of 2' })}
        <div class="wiz-hero">
          ${img3d('clipboard', 'i3d-lg', 72)}
          <div>
            <h2 class="wiz-title">Ask your doctor</h2>
            <p class="wiz-sub">Tick the questions to take to your next visit.</p>
          </div>
        </div>
        <div class="choice-rows strengthen" id="strengthenDoctorList">
          ${BONE_SIP_DATA.doctorReviewChecklist.map((q, i) => choiceRow({
            id: q.id, img: q.img, title: q.text, i,
            selected: state.strengthenDoctorChecked.has(q.id),
            onclick: `BoneApp.toggleStrengthenDoctor('${q.id}')`
          })).join('')}
        </div>
        <div class="share-row">
          <button class="btn btn-outline" onclick="BoneApp.shareDoctorReviewWhatsApp()"><i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> WhatsApp</button>
          <button class="btn btn-outline" onclick="window.print()"><i class="fa-solid fa-file-arrow-down"></i> Save PDF</button>
        </div>
        <div class="motto-card">
          ${img3d('trophy', '', 48)}
          <div><b>Know your risk. Protect your investment.</b><span>The best investments are reviewed regularly.</span></div>
        </div>
        <div class="wiz-footer">
          <button class="cta-btn strengthen" onclick="BoneApp.completeStrengthenAssessment()">Open my BONE SIP <i class="fa-solid fa-arrow-right"></i></button>
        </div>`;
    }
  }

//@@ replace toggleLifeAsset
  function toggleLifeAsset(assetId) {
    playSound('check');
    const idx = state.selectedAssets.indexOf(assetId);
    if (idx > -1) state.selectedAssets.splice(idx, 1);
    else state.selectedAssets.push(assetId);

    setTileSelected('#lifeAssetGrid', assetId, state.selectedAssets.includes(assetId));
    const countEl = document.getElementById('assetSelectedCount');
    if (countEl) countEl.textContent = `${state.selectedAssets.length} selected`;
    BoneDB.save();
  }

//@@ replace toggleHealthCondition
  function toggleHealthCondition(condId) {
    playSound('check');
    const list = state.userProfile.healthConditions;
    if (condId === 'none') {
      state.userProfile.healthConditions = list.includes('none') ? [] : ['none'];
    } else {
      const noneIdx = list.indexOf('none');
      if (noneIdx > -1) list.splice(noneIdx, 1);
      const idx = list.indexOf(condId);
      if (idx > -1) list.splice(idx, 1);
      else list.push(condId);
    }
    BONE_SIP_DATA.healthConditionOptions.forEach(o => {
      setTileSelected('#healthConditionsList', o.id, state.userProfile.healthConditions.includes(o.id));
    });
    BoneDB.save();
  }

//@@ replace toggleProtectRisk
  function toggleProtectRisk(riskId) {
    playSound('check');
    if (state.protectRiskChecked.has(riskId)) state.protectRiskChecked.delete(riskId);
    else state.protectRiskChecked.add(riskId);
    setTileSelected('#riskFactorGrid', riskId, state.protectRiskChecked.has(riskId));
    updateRiskGauge();
    BoneDB.save();
  }

//@@ replace setHomeAuditAnswer
  function setHomeAuditAnswer(roomId, questionId, answer) {
    playSound('check');
    if (!state.protectHomeAuditAnswers[roomId]) state.protectHomeAuditAnswers[roomId] = {};
    state.protectHomeAuditAnswers[roomId][questionId] = answer;
    renderAssessmentStage();

    // When a room is fully answered, glide to the next unfinished room.
    const rooms = BONE_SIP_DATA.protectHomeAuditRooms;
    const room = rooms.find(r => r.id === roomId);
    const answers = state.protectHomeAuditAnswers[roomId];
    if (room && room.questions.every(q => answers[q.id])) {
      const next = rooms.find(r => r.questions.some(q => !(state.protectHomeAuditAnswers[r.id] || {})[q.id]));
      if (next && next.id !== roomId) {
        setTimeout(() => {
          if (state.assessmentPhase !== 'protect' || state.protectAssessmentStep !== 3) return;
          state.selectedAuditRoom = next.id;
          renderAssessmentStage();
        }, 450);
      }
    }
  }

//@@ replace toggleStrengthenDoctor
  function toggleStrengthenDoctor(docId) {
    playSound('check');
    if (state.strengthenDoctorChecked.has(docId)) state.strengthenDoctorChecked.delete(docId);
    else state.strengthenDoctorChecked.add(docId);
    setTileSelected('#strengthenDoctorList', docId, state.strengthenDoctorChecked.has(docId));
    BoneDB.save();
  }

//@@ replace openHeightWeightModal
  function openHeightWeightModal() {
    playSound('tap');
    const h = document.getElementById('heightRangeInput');
    const w = document.getElementById('weightRangeInput');
    if (h) { h.value = state.userProfile.heightCm; onHeightChange(h.value); }
    if (w) { w.value = state.userProfile.weightKg; onWeightChange(w.value); }
    const modal = document.getElementById('heightWeightModal');
    if (modal) modal.style.display = 'flex';
  }

//@@ replace proceedToLogin
  function proceedToLogin() {
    playSound('tap');
    // Someone who already verified (e.g. redoing Build) shouldn't need a new OTP.
    if (state.auth.isVerified && state.auth.phone) {
      completeBuildPillar();
      return;
    }
    showView('auth');
    const phoneStep = document.getElementById('inlineAuthPhoneStep');
    const otpStep = document.getElementById('inlineAuthOtpStep');
    if (phoneStep) phoneStep.style.display = 'block';
    if (otpStep) otpStep.style.display = 'none';
    const input = document.getElementById('inlineMobileNumberInput');
    if (input) {
      if (!input.value && state.userProfile.phone) input.value = state.userProfile.phone;
      setTimeout(() => input.focus(), 300);
    }
    BoneDB.save();
  }

  function shakeAuthCard() {
    const card = document.querySelector('#view-auth .auth-card');
    if (!card) return;
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }

//@@ replace sendInlineOTP
  async function sendInlineOTP() {
    playSound('tap');
    const input = document.getElementById('inlineMobileNumberInput');
    const cleanPhone = (input ? input.value : '').replace(/\D/g, '').slice(-10);

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      showToast('Enter a valid 10-digit mobile number', 'fa-triangle-exclamation');
      shakeAuthCard();
      if (input) input.focus();
      return;
    }
    const consent = document.getElementById('inlineAgreeTermsCheck');
    if (consent && !consent.checked) {
      showToast('Please accept the terms to continue', 'fa-circle-info');
      return;
    }

    const cfg = window.BONE_SIP_CONFIG || {};
    if (!isDemoMode()) {
      if (!cfg.otp || !cfg.otp.sendUrl) {
        showToast('OTP service is not configured yet', 'fa-triangle-exclamation');
        return;
      }
      try {
        const res = await fetch(cfg.otp.sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        console.warn('OTP send failed:', err);
        showToast('Could not send the code. Please try again.', 'fa-triangle-exclamation');
        return;
      }
    }

    state.auth.pendingPhone = cleanPhone;

    const phoneStep = document.getElementById('inlineAuthPhoneStep');
    const otpStep = document.getElementById('inlineAuthOtpStep');
    if (phoneStep) phoneStep.style.display = 'none';
    if (otpStep) otpStep.style.display = 'block';

    const sentText = document.getElementById('inlineOtpSentPhoneText');
    if (sentText) sentText.textContent = `Code sent to +91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;

    const demo = isDemoMode();
    const bubble = document.getElementById('inlineSmsSimBubble');
    const autofill = document.getElementById('otpAutofillBtn');
    const codeText = document.getElementById('inlineSimulatedOtpCodeText');
    if (bubble) bubble.style.display = demo ? 'flex' : 'none';
    if (autofill) autofill.style.display = demo ? 'inline-flex' : 'none';
    if (codeText) codeText.textContent = cfg.demoOtpCode || '849201';

    const boxes = document.querySelectorAll('.inline-otp');
    boxes.forEach(b => { b.value = ''; });
    if (boxes[0]) setTimeout(() => boxes[0].focus(), 150);

    showToast(demo ? 'Demo mode: use the code shown on screen' : `Code sent to +91 ${cleanPhone}`, 'fa-comment-sms');
  }

//@@ replace autofillInlineOTP
  function autofillInlineOTP() {
    if (!isDemoMode()) return;
    playSound('check');
    const code = ((window.BONE_SIP_CONFIG || {}).demoOtpCode || '849201').split('');
    document.querySelectorAll('.inline-otp').forEach((input, index) => { input.value = code[index] || ''; });
    verifyInlineOTP();
  }

//@@ replace handleInlineOtpInput
  function handleInlineOtpInput(input, index, event) {
    const inputs = document.querySelectorAll('.inline-otp');
    if (event && event.key === 'Backspace' && !input.value && index > 0) {
      inputs[index - 1].focus();
      return;
    }
    const digits = input.value.replace(/\D/g, '');
    if (digits.length > 1) {
      // Pasted or autofilled the whole code into one box.
      digits.slice(0, inputs.length).split('').forEach((d, i) => { if (inputs[i]) inputs[i].value = d; });
      const last = inputs[Math.min(digits.length, inputs.length) - 1];
      if (last) last.focus();
    } else {
      input.value = digits;
      if (digits && index < inputs.length - 1) inputs[index + 1].focus();
    }
    const code = Array.from(inputs).map(i => i.value).join('');
    if (code.length === inputs.length && /^\d+$/.test(code)) verifyInlineOTP();
  }

//@@ replace verifyInlineOTP
  let otpVerifyInFlight = false;
  async function verifyInlineOTP() {
    if (otpVerifyInFlight) return;
    const boxes = Array.from(document.querySelectorAll('.inline-otp'));
    const code = boxes.map(b => b.value.trim()).join('');
    const phone = state.auth.pendingPhone;

    if (!phone) {
      showToast('Please request a code first', 'fa-circle-info');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      showToast('Enter the 6-digit code', 'fa-circle-info');
      return;
    }

    otpVerifyInFlight = true;
    let verified = false;
    try {
      if (isDemoMode()) {
        verified = code === ((window.BONE_SIP_CONFIG || {}).demoOtpCode || '849201');
      } else {
        const cfg = window.BONE_SIP_CONFIG || {};
        const res = await fetch(cfg.otp.verifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code })
        });
        const body = res.ok ? await res.json().catch(() => ({})) : {};
        verified = !!body.verified;
      }
    } catch (err) {
      console.warn('OTP verify failed:', err);
    } finally {
      otpVerifyInFlight = false;
    }

    if (!verified) {
      playSound('tap');
      showToast('That code didn’t match. Please try again.', 'fa-triangle-exclamation');
      shakeAuthCard();
      boxes.forEach(b => { b.value = ''; });
      if (boxes[0]) boxes[0].focus();
      return;
    }

    state.auth.isVerified = true;
    state.auth.phone = phone;
    state.userProfile.phone = phone;
    delete state.auth.pendingPhone;

    playSound('success');
    celebrate('big');
    updateHeaderProfileBadge();
    completeBuildPillar();
  }

  function completeBuildPillar() {
    state.completedPillars.build = true;
    state.unlockedPillars.protect = true;

    if (state.completedPillars.protect && state.completedPillars.strengthen) {
      state.activePillar = 'build';
      showView('build');
      switchBuildSubTab('diet', true);
      showToast('Plan updated', 'fa-circle-check');
    } else if (state.completedPillars.protect) {
      state.assessmentPhase = 'strengthen';
      state.activePillar = 'strengthen';
      showView('assessment');
      renderAssessmentStage();
    } else {
      state.assessmentPhase = 'protect';
      state.protectAssessmentStep = 1;
      state.activePillar = 'protect';
      showToast('Verified! Protect is unlocked.', 'fa-shield-halved');
      showView('assessment');
      renderAssessmentStage();
    }
    renderPillarBottomNav();
    BoneDB.save();
  }

//@@ replace completeProtectAssessment
  function completeProtectAssessment() {
    playSound('success');
    celebrate();
    state.completedPillars.protect = true;
    state.unlockedPillars.strengthen = true;

    if (state.completedPillars.strengthen) {
      state.activePillar = 'protect';
      showView('protect');
      renderProtectHubView();
    } else {
      state.assessmentPhase = 'strengthen';
      state.strengthenAssessmentStep = 1;
      state.activePillar = 'strengthen';
      showView('assessment');
      renderAssessmentStage();
    }
    showToast('Protect complete! Strengthen is unlocked.', 'fa-arrow-trend-up');
    renderPillarBottomNav();
    BoneDB.save();
  }

//@@ replace completeStrengthenAssessment
  function completeStrengthenAssessment() {
    playSound('success');
    celebrate('big');
    state.completedPillars.strengthen = true;
    state.assessmentPhase = 'completed';
    state.activePillar = 'build';
    state.activeBuildSubTab = 'diet';

    showToast('All 3 pillars unlocked. Welcome to your plan!', 'fa-trophy');
    showView('build');
    switchBuildSubTab('diet', true);
    renderPillarBottomNav();
    BoneDB.save();
  }

//@@ replace switchBuildSubTab
  function switchBuildSubTab(tab, silent) {
    if (!silent) playSound('tap');
    state.activeBuildSubTab = tab;

    const btnDiet = document.getElementById('btnBuildSubDiet');
    const btnExercise = document.getElementById('btnBuildSubExercise');
    const viewDiet = document.getElementById('buildSubViewDiet');
    const viewExercise = document.getElementById('buildSubViewExercise');

    if (btnDiet && btnExercise) {
      btnDiet.classList.toggle('active', tab === 'diet');
      btnExercise.classList.toggle('active', tab === 'exercise');
      btnDiet.setAttribute('aria-selected', String(tab === 'diet'));
      btnExercise.setAttribute('aria-selected', String(tab === 'exercise'));
    }

    if (viewDiet && viewExercise) {
      viewDiet.style.display = tab === 'diet' ? 'block' : 'none';
      viewExercise.style.display = tab === 'diet' ? 'none' : 'block';
      if (tab === 'diet') {
        renderBuildDietView();
        pauseAllCardVideos();
      } else {
        renderBuildExerciseView();
      }
    }
  }

//@@ replace renderMealSwapGrid
  function renderMealSwapGrid() {
    const grid = document.getElementById('mealSwapOptionsGrid');
    if (!grid) return;

    const catalog = BONE_SIP_DATA.fullDietCatalog || [];
    const filter = state.mealSwapFilter;
    const slotType = { m_lunch: 'lunch', m_snack: 'snack', m_dinner: 'dinner', m_sun_d3: 'sun_d3' }[filter.slotId] || 'breakfast';

    const list = catalog.filter(m => {
      if (m.slot !== slotType) return false;
      if (filter.region !== 'all' && m.region !== filter.region) return false;
      if (filter.diet !== 'all' && m.diet !== filter.diet) return false;
      if (filter.search) {
        const text = `${m.name} ${m.desc} ${m.region} ${m.diet}`.toLowerCase();
        if (!text.includes(filter.search)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          ${img3d('bowl', '', 64)}
          <b>No dishes match</b>
          <span>Try another region or diet.</span>
          <button class="btn btn-sm btn-outline" onclick="BoneApp.setMealSwapRegionFilter('all'); BoneApp.setMealSwapDietFilter('all');">Reset filters</button>
        </div>`;
      return;
    }

    const dateKey = state.selectedCalendarDate || getTodayISODate();
    const activeCustom = (state.customMealSwaps[dateKey] && state.customMealSwaps[dateKey][filter.slotId]) || null;

    grid.innerHTML = list.map(item => {
      const isSelected = !!activeCustom && (activeCustom.id === item.id || activeCustom.name === item.name);
      return `
        <button type="button" class="swap-row ${isSelected ? 'selected' : ''}" onclick="BoneApp.applyMealSwap('${filter.slotId}', '${item.id}')">
          ${img3d(dietImgFor(item.diet), '', 36)}
          <div class="swap-row-body">
            <b>${item.name}</b>
            <div class="meal-meta">
              <span class="nchip ca">${item.calcium} mg Ca</span>
              <span class="nchip pro">${item.protein} g protein</span>
            </div>
          </div>
          <span class="swap-pick">${isSelected ? '<i class="fa-solid fa-check"></i>' : 'Pick'}</span>
        </button>`;
    }).join('');
  }

//@@ replace generateProgressiveHealthReport
  function generateProgressiveHealthReport() {
    const container = document.getElementById('progressiveReportContainer');
    if (!container) return;

    const todayISO = getTodayISODate();
    const score = calculateDailyScore100(todayISO);
    const bmi = parseFloat(calculateBMI());
    const streak = state.activeStreakDays || 0;
    const user = state.userProfile;
    const who = user.fullName || (state.auth.phone ? `+91 ••••••${state.auth.phone.slice(-4)}` : 'Guest');
    const bmiInfo = bmi < 18.5 ? ['Underweight', '#D97706'] : bmi < 25 ? ['Healthy', '#1E9E62'] : bmi < 30 ? ['Overweight', '#D97706'] : ['High', '#DC2626'];

    const dateBadge = document.getElementById('reportDateBadge');
    if (dateBadge) dateBadge.textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const exTarget = getActiveExerciseList().length || 5;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const diet = (state.checkedDietMilestones[iso] || new Set()).size;
      const ex = (state.checkedExerciseMilestones[iso] || new Set()).size;
      const pct = Math.round(Math.min(1, (Math.min(diet, 5) / 5) * 0.6 + (Math.min(ex, exTarget) / exTarget) * 0.4) * 100);
      days.push({ pct, label: d.toLocaleDateString('en-IN', { weekday: 'narrow' }), today: i === 0 });
    }

    const bar = (label, val, max, color, img) => `
      <div class="rb-row">
        ${img3d(img, '', 28)}
        <div class="rb-main">
          <div class="rb-top"><b>${label}</b><span>${val} / ${max}</span></div>
          <div class="bar"><i style="width: ${Math.round((val / max) * 100)}%; background: ${color};"></i></div>
        </div>
      </div>`;

    const riskCount = state.protectRiskChecked.size;

    container.innerHTML = `
      <div class="report-hero">
        <div class="score-ring" style="--p: ${score.total};">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="ring-track" cx="60" cy="60" r="52"/>
            <circle class="ring-fill" cx="60" cy="60" r="52" stroke="url(#gradBrandRing)"/>
          </svg>
          <div class="score-ring-label"><b>${score.total}</b><span>/ 100</span></div>
        </div>
        <div>
          <span class="muted-xs">${escapeHtml(who)}</span>
          <h3>${score.tier}</h3>
          <div class="hero-stats">
            <span class="stat-pill fire">${img3d('fire', '', 20)} <b>${streak}</b>&nbsp;day streak</span>
            <span class="stat-pill">BMI <b>${isNaN(bmi) ? '–' : bmi}</b>&nbsp;<i style="color: ${bmiInfo[1]}; font-style: normal; font-weight: 800;">${bmiInfo[0]}</i></span>
          </div>
        </div>
      </div>

      <div class="report-section">
        <h4>Today's score</h4>
        ${bar('Diet', score.dietPts, 40, 'var(--build)', 'salad')}
        ${bar('Exercise', score.exPts, 30, 'var(--strengthen)', 'running')}
        ${bar('Safety & sun', score.safePts, 20, 'var(--protect)', 'shield')}
        ${bar('Streak bonus', score.streakPts, 10, '#D97706', 'fire')}
      </div>

      <div class="report-section">
        <h4>Last 7 days</h4>
        <div class="week-bars">
          ${days.map(d => `
            <div class="wb ${d.today ? 'today' : ''}">
              <div class="wb-col" title="${d.pct}%"><i style="height: ${Math.max(d.pct, 4)}%;"></i></div>
              <span>${d.label}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="report-section">
        <h4>${img3d('stethoscope', '', 28)} Discuss with your doctor</h4>
        <ul class="report-list">
          <li>Your daily calcium target (often 1,000–1,200 mg)</li>
          <li>A Vitamin D blood test (25-OH Vitamin D)</li>
          <li>Whether you need a DXA bone density scan</li>
          ${riskCount >= 2 ? `<li>The ${riskCount} fall-risk signs you noted</li>` : ''}
        </ul>
      </div>`;
  }

//@@ replace shareProgressiveReportWhatsApp
  function shareProgressiveReportWhatsApp() {
    playSound('tap');
    const score = calculateDailyScore100();
    const lines = [
      '*BONE SIP — My bone habit report*',
      '',
      `Daily score: *${score.total}/100* (${score.tier})`,
      `Streak: *${state.activeStreakDays} days*`,
      `BMI: *${calculateBMI()}*`,
      '',
      'Invest in Bones. Invest in Life.'
    ];
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  }

//@@ replace saveUserProfileModal
  function saveUserProfileModal() {
    playSound('check');
    const nameInput = document.getElementById('profInputName');
    const phoneInput = document.getElementById('profInputPhone');
    const hInput = document.getElementById('profInputHeight');
    const wInput = document.getElementById('profInputWeight');
    const regSelect = document.getElementById('profSelectRegion');
    const dietSelect = document.getElementById('profSelectDiet');

    if (nameInput) state.userProfile.fullName = nameInput.value.trim().slice(0, 60);
    // A typed number is only a contact detail; verification still requires the OTP flow.
    if (phoneInput && !state.auth.isVerified) {
      state.userProfile.phone = phoneInput.value.replace(/\D/g, '').slice(-10);
    }
    const h = parseInt(hInput && hInput.value, 10);
    const w = parseInt(wInput && wInput.value, 10);
    if (h >= 100 && h <= 230) state.userProfile.heightCm = h;
    if (w >= 25 && w <= 250) state.userProfile.weightKg = w;
    if (regSelect) state.userProfile.regionalFood = regSelect.value;
    if (dietSelect) state.userProfile.diet = dietSelect.value;

    calculateBMI();
    BoneDB.save();
    updateHeaderProfileBadge();
    if (state.completedPillars.build) renderBuildDietView();
    renderChatContextStrip();
    closeUserProfileModal();
    showToast('Profile saved', 'fa-circle-check');
  }

//@@ replace updateHeaderProfileBadge
  function updateHeaderProfileBadge() {
    const userProf = document.getElementById('userHeaderProfile');
    if (!userProf) return;
    if (state.auth.isVerified && state.auth.phone) {
      const first = (state.userProfile.fullName || '').split(' ')[0];
      const label = first || `+91 ••••${state.auth.phone.slice(-4)}`;
      userProf.innerHTML = `
        <button class="profile-chip" aria-label="Open profile">
          <i class="fa-solid fa-circle-check"></i> ${escapeHtml(label)}
        </button>`;
    } else {
      userProf.innerHTML = `
        <button class="btn btn-sm btn-primary" id="loginHeaderBtn" aria-label="Open profile">
          <i class="fa-solid fa-user"></i> <span class="hide-mobile">Profile</span>
        </button>`;
    }
  }

//@@ replace renderChatContextStrip
  function renderChatContextStrip() {
    const strip = document.getElementById('chatContextStrip');
    if (!strip) return;
    const score = calculateDailyScore100();
    const bmi = calculateBMI();
    const who = state.userProfile.fullName || (state.auth.phone ? `+91 ••••${state.auth.phone.slice(-4)}` : 'Guest');
    strip.innerHTML = `
      <span><i class="fa-solid fa-user"></i> ${escapeHtml(who)}</span>
      <span>BMI <strong>${bmi}</strong></span>
      <span>Score <strong>${score.total}</strong></span>
      <span>${formatRegionName(state.userProfile.regionalFood)} · ${formatDietName(state.userProfile.diet)}</span>`;
  }

//@@ replace renderChatHistory
  function renderChatHistory() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    container.innerHTML = (state.chatHistory || []).map(msg => {
      // Escape first so typed text can never become markup, then apply the tiny markdown subset.
      const formattedText = escapeHtml(msg.text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      const sender = msg.sender === 'user' ? 'user' : 'bot';
      return `
        <div class="chat-msg-row ${sender}">
          <div class="chat-bubble ${sender}">${formattedText}</div>
          <span class="chat-msg-time">${escapeHtml(msg.time)}</span>
        </div>`;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

//@@ replace renderBuildDietView
  let lastDietDateRendered = '';
  function renderBuildDietView() {
    const weekDays = getWeekDays(state.calendarWeekOffset || 0);
    if (!state.selectedCalendarDate) state.selectedCalendarDate = getTodayISODate();

    let activeDayObj = weekDays.find(d => d.isoDate === state.selectedCalendarDate);
    if (!activeDayObj) {
      activeDayObj = weekDays.find(d => d.dayName === state.selectedCalendarDay) || weekDays[0];
      state.selectedCalendarDate = activeDayObj.isoDate;
    }
    state.selectedCalendarDay = activeDayObj.dayName;

    const currentDay = activeDayObj.dayName;
    const currentDateKey = activeDayObj.isoDate;
    const dayData = BONE_SIP_DATA.weeklyDietCalendar.find(d => d.day === currentDay) || BONE_SIP_DATA.weeklyDietCalendar[0];
    const todayISO = getTodayISODate();
    const isPast = currentDateKey < todayISO;
    const isToday = currentDateKey === todayISO;

    // 1. Week heading
    const monthYearEl = document.getElementById('calendarMonthYearText');
    if (monthYearEl) {
      const first = weekDays[0];
      const last = weekDays[6];
      monthYearEl.textContent = first.monthFull === last.monthFull
        ? `${first.monthFull} ${first.year}`
        : `${first.monthShort} – ${last.monthShort} ${last.year}`;
    }

    // 2. Week strip (ISO-date keyed only)
    const tabsContainer = document.getElementById('dietDayTabs');
    if (tabsContainer) {
      tabsContainer.innerHTML = weekDays.map(dObj => {
        const set = state.checkedDietMilestones[dObj.isoDate] || new Set();
        const done = set.size >= 5;
        return `
          <button class="calendar-day-btn ${dObj.isoDate === currentDateKey ? 'active' : ''} ${dObj.isToday ? 'is-today' : ''} ${done ? 'day-completed' : ''}" onclick="BoneApp.selectCalendarDate('${dObj.isoDate}', '${dObj.dayName}')" aria-label="${dObj.dayName} ${dObj.dateNum}">
            ${dObj.isToday ? '<span class="today-micro-badge">Today</span>' : ''}
            <span class="day-abbr">${dObj.dayShort}</span>
            <span class="day-date-number">${dObj.dateNum}</span>
            <div class="day-status-pill">
              ${done ? '<span class="status-check">✓</span>' : (set.size > 0 ? `<span class="status-count">${set.size}/5</span>` : '<span class="status-dot">•</span>')}
            </div>
          </button>`;
      }).join('');
    }

    // 3. Hero copy
    const themeBadge = document.getElementById('dietDayThemeBadge');
    if (themeBadge) {
      themeBadge.textContent = dayData.theme;
      themeBadge.className = `step-chip ${isPast ? 'muted' : 'build'}`;
    }
    const dayTitle = document.getElementById('dietDayTitle');
    if (dayTitle) {
      const label = isToday ? 'Today' : activeDayObj.dayName;
      const tag = isPast ? '<span class="past-tag"><i class="fa-solid fa-lock"></i> View only</span>' : '';
      dayTitle.innerHTML = `${label}, ${activeDayObj.dateNum} ${activeDayObj.monthShort} ${tag}`;
    }
    const daySubtitle = document.getElementById('dietDaySubtitle');
    if (daySubtitle) {
      daySubtitle.textContent = isPast ? 'Past days are view-only.' : isToday ? 'Tick off your 5 bone boosters.' : 'A preview of this day’s plan.';
    }

    // 4. Nutrient rings
    const resolvedMilestones = resolveDailyMilestones(currentDateKey, dayData)
      .sort((a, b) => SLOT_ORDER.indexOf(a.id) - SLOT_ORDER.indexOf(b.id));
    const activeSet = state.checkedDietMilestones[currentDateKey] || new Set();

    const targets = {
      cal: resolvedMilestones.reduce((acc, m) => acc + (m.meal.calcium || 0), 0) || 1200,
      pro: resolvedMilestones.reduce((acc, m) => acc + (m.meal.protein || 0), 0) || 70,
      d3: 1000, k2: 75, mg: 350, vitC: 50
    };
    const got = { cal: 0, pro: 0, d3: 0, k2: 0, mg: 0, vitC: 0 };
    const has = (text, words) => words.some(w => text.includes(w));

    resolvedMilestones.forEach(m => {
      if (!activeSet.has(m.id)) return;
      got.cal += m.meal.calcium || 0;
      got.pro += m.meal.protein || 0;
      const text = `${m.meal.name || ''} ${m.meal.desc || ''} ${m.slot || ''}`.toLowerCase();
      // Co-factor estimates from ingredient keywords (indicative, not lab values).
      got.d3 += m.id === 'm_sun_d3' ? 800 : has(text, ['fortified', 'egg', 'fish', 'mushroom', 'badam milk']) ? 100 : 25;
      got.k2 += has(text, ['curd', 'dahi', 'paneer', 'chhena', 'dosa', 'idli', 'chaas', 'fermented']) ? 22 : has(text, ['palak', 'saag', 'methi', 'greens', 'spinach']) ? 16 : 6;
      got.mg += has(text, ['til', 'sesame', 'makhana', 'almond', 'badam', 'ragi', 'bajra', 'jowar', 'dal', 'chana', 'seeds']) ? 85 : 45;
      got.vitC += has(text, ['amla', 'guava', 'lemon', 'moringa', 'drumstick', 'mint', 'salad']) ? 20 : has(text, ['greens', 'spinach', 'fruit']) ? 12 : 4;
    });

    const rings = [
      ['liveDietCalciumBar', 'liveDietCalciumVal', 'cal', 'mg', 'Calcium'],
      ['liveDietProteinBar', 'liveDietProteinVal', 'pro', 'g', 'Protein'],
      ['liveDietD3Bar', 'liveDietD3Val', 'd3', 'IU', 'Vitamin D3'],
      ['liveDietK2Bar', 'liveDietK2Val', 'k2', 'mcg', 'Vitamin K2'],
      ['liveDietMgBar', 'liveDietMgVal', 'mg', 'mg', 'Magnesium'],
      ['liveDietVitCBar', 'liveDietVitCVal', 'vitC', 'mg', 'Vitamin C']
    ];
    rings.forEach(([ringId, valId, key, unit, label]) => {
      const pct = Math.min(100, Math.round((got[key] / targets[key]) * 100));
      const ring = document.getElementById(ringId);
      const val = document.getElementById(valId);
      if (ring) {
        ring.style.setProperty('--p', pct);
        ring.classList.toggle('full', pct >= 100);
        ring.title = `${label}: ${got[key].toLocaleString()} of ${targets[key].toLocaleString()} ${unit} (${pct}%)`;
      }
      if (val) val.textContent = `${got[key].toLocaleString()}/${targets[key].toLocaleString()} ${unit}`;
    });

    // 5. Score + streak
    const dailyScore = calculateDailyScore100(currentDateKey);
    state.dailyScore100 = dailyScore.total;
    state.dailyScoreBreakdown = { diet: dailyScore.dietPts, exercise: dailyScore.exPts, precautions: dailyScore.safePts, streak: dailyScore.streakPts };

    const scoreRing = document.getElementById('scoreRing');
    if (scoreRing) {
      scoreRing.style.setProperty('--p', dailyScore.total);
      scoreRing.setAttribute('aria-label', `Bone score ${dailyScore.total} out of 100`);
    }
    animateNumber(document.getElementById('dailyStreakScoreDisplay'), dailyScore.total);
    const scoreBadge = document.getElementById('scoreTierBadge');
    if (scoreBadge) {
      scoreBadge.textContent = dailyScore.tier;
      scoreBadge.className = `badge ${dailyScore.badgeClass}`;
    }
    const scoreSummary = document.getElementById('scoreBreakdownSummary');
    if (scoreSummary) scoreSummary.textContent = `Diet ${dailyScore.dietPts}/40, exercise ${dailyScore.exPts}/30, safety ${dailyScore.safePts}/20, streak ${dailyScore.streakPts}/10`;
    const streakDisp = document.getElementById('dietActiveStreakDisplay');
    if (streakDisp) streakDisp.textContent = state.activeStreakDays;
    const progDisp = document.getElementById('dietDayProgressDisplay');
    if (progDisp) progDisp.textContent = `${activeSet.size} / 5`;

    // 6. Meal cards
    const listEl = document.getElementById('dietMilestonesList');
    if (!listEl) return;
    listEl.classList.toggle('no-anim', lastDietDateRendered === currentDateKey);
    lastDietDateRendered = currentDateKey;

    listEl.innerHTML = resolvedMilestones.map((item, i) => {
      const meta = SLOT_META[item.id] || { name: 'Meal', img: 'bowl', time: '' };
      const isChecked = activeSet.has(item.id);
      const hidden = state.activeSlotFilter && state.activeSlotFilter !== 'all' && state.activeSlotFilter !== item.id;
      const justDone = isChecked && state.lastToggledMilestone === item.id;
      const action = isPast ? 'BoneApp.showPastDayNotice()' : `BoneApp.toggleDietMilestone('${currentDateKey}', '${item.id}')`;
      return `
        <div class="meal-card fade-up ${isChecked ? 'completed' : ''} ${justDone ? 'just-done' : ''}" data-slot-id="${item.id}" id="mealSlotCard_${item.id}" style="--i: ${i}; ${hidden ? 'display: none;' : ''}">
          <div class="meal-art">${img3d(meta.img, '', 40)}</div>
          <div class="meal-body">
            <div class="meal-top">
              <span class="meal-slot-name">${meta.name}</span>
              <span class="meal-time">${meta.time}</span>
            </div>
            <div class="meal-dish">${escapeHtml(item.meal.name)}</div>
            <div class="meal-meta">
              <span class="nchip ca"><i class="fa-solid fa-bone"></i> ${item.meal.calcium || 0} mg Ca</span>
              <span class="nchip pro"><i class="fa-solid fa-dumbbell"></i> ${item.meal.protein || 0} g</span>
              ${item.isCustomSwapped ? '<span class="nchip swapped"><i class="fa-solid fa-arrows-rotate"></i> Swapped</span>' : ''}
              ${!isPast ? `<button class="swap-link" onclick="BoneApp.openMealSwapModal('${item.id}', '${meta.name}')"><i class="fa-solid fa-shuffle"></i> Swap</button>` : ''}
            </div>
          </div>
          <button class="check-btn ${isPast ? 'locked' : ''}" onclick="${action}" aria-pressed="${isChecked}" aria-label="${isChecked ? 'Undo' : 'Mark done'}: ${meta.name}">
            <i class="fa-solid ${isPast && !isChecked ? 'fa-lock' : 'fa-check'}"></i>
          </button>
        </div>`;
    }).join('');
    state.lastToggledMilestone = null;
  }

//@@ replace filterMealSlotView
  function filterMealSlotView(slotKey) {
    playSound('tap');
    state.activeSlotFilter = slotKey;
    document.querySelectorAll('#dietSlotFilterPills .slot-filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.slot === slotKey);
    });
    document.querySelectorAll('#dietMilestonesList .meal-card').forEach(card => {
      card.style.display = (slotKey === 'all' || card.dataset.slotId === slotKey) ? '' : 'none';
    });
  }

//@@ replace updateActiveStreak
  // Consecutive completed days ending today (or yesterday, if today isn't finished yet).
  function isDayComplete(iso) {
    const diet = state.checkedDietMilestones[iso];
    const ex = state.checkedExerciseMilestones[iso];
    const exTarget = getActiveExerciseList().length || 5;
    return !!((diet && diet.size >= 5) || (ex && ex.size >= exTarget));
  }

  function updateActiveStreak() {
    const cursor = new Date();
    if (!isDayComplete(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (streak < 3650 && isDayComplete(toISODate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    state.activeStreakDays = streak;
  }

//@@ replace toggleDietMilestone
  function toggleDietMilestone(dateKey, milestoneId) {
    const todayISO = getTodayISODate();
    if (dateKey < todayISO) {
      showPastDayNotice();
      return;
    }
    if (dateKey > todayISO) {
      playSound('tap');
      showToast('You can tick this off on the day', 'fa-calendar-day');
      return;
    }

    playSound('check');
    if (!(state.checkedDietMilestones[dateKey] instanceof Set)) state.checkedDietMilestones[dateKey] = new Set();
    const set = state.checkedDietMilestones[dateKey];
    const wasDone = set.has(milestoneId);
    if (wasDone) set.delete(milestoneId);
    else set.add(milestoneId);
    state.lastToggledMilestone = wasDone ? null : milestoneId;

    updateActiveStreak();
    if (!wasDone && set.size === 5) {
      playSound('success');
      celebrate('big');
      showToast(`All 5 done! ${state.activeStreakDays}-day streak 🔥`, 'fa-fire');
    }

    BoneDB.save();
    renderBuildDietView();
  }

//@@ replace renderBuildExerciseView
  let cardVideoObserver = null;
  function setupLazyVideos(root) {
    const videos = root.querySelectorAll('video[data-src]');
    if (cardVideoObserver) cardVideoObserver.disconnect();
    if (!('IntersectionObserver' in window)) {
      videos.forEach(v => { v.src = v.dataset.src; if (!prefersReducedMotion) v.play().catch(() => {}); });
      return;
    }
    cardVideoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (!v.getAttribute('src')) v.src = v.dataset.src;
          if (!prefersReducedMotion) v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { rootMargin: '150px 0px', threshold: 0.2 });
    videos.forEach(v => cardVideoObserver.observe(v));
  }

  function pauseAllCardVideos() {
    document.querySelectorAll('#exerciseCardsGrid video').forEach(v => v.pause());
  }

  function renderBuildExerciseView() {
    const grid = document.getElementById('exerciseCardsGrid');
    const progDisp = document.getElementById('exerciseProgressDisplay');
    if (!grid) return;

    try {
      const key = getTodayISODate();
      let checkedSet = state.checkedExerciseMilestones[key];
      if (!(checkedSet instanceof Set)) {
        checkedSet = new Set(Array.isArray(checkedSet) ? checkedSet : []);
        state.checkedExerciseMilestones[key] = checkedSet;
      }
      const activeList = getActiveExerciseList();
      if (progDisp) progDisp.textContent = `${checkedSet.size} / ${activeList.length}`;

      grid.innerHTML = activeList.map((ex, i) => {
        const done = checkedSet.has(ex.id);
        const media = (state.selectedCoach === 'male' ? ex.maleImg : ex.femaleImg) || ex.femaleImg || ex.maleImg || '';
        const isVideo = /\.(mp4|webm)$/i.test(media);
        const bones = (ex.targetBones || ex.targetMuscles || '').split(',').slice(0, 2).map(s => s.trim()).join(', ');
        return `
          <article class="ex-card fade-up ${done ? 'completed' : ''}" style="--i: ${i};">
            <div class="ex-media" onclick="BoneApp.openWorkoutTimerModal('${ex.id}')" role="button" tabindex="0" aria-label="Start ${escapeHtml(ex.name)}">
              ${isVideo ? `<video data-src="${media}" muted loop playsinline preload="none" aria-hidden="true"></video>` : (media ? `<img src="${media}" alt="" loading="lazy">` : img3d('running', 'i3d-xl', 120))}
              <span class="ex-dur"><i class="fa-regular fa-clock"></i> ${ex.durationSec || 45}s</span>
              ${done ? '<span class="ex-done-badge"><i class="fa-solid fa-check"></i> Done</span>' : ''}
              <div class="ex-play"><span><i class="fa-solid fa-play"></i></span></div>
            </div>
            <div class="ex-body">
              <h3>${ex.name}</h3>
              <div class="ex-tags">
                ${ex.reps ? `<span class="ex-tag"><i class="fa-solid fa-repeat"></i> ${ex.reps}</span>` : ''}
                ${bones ? `<span class="ex-tag"><i class="fa-solid fa-bone"></i> ${bones}</span>` : ''}
              </div>
              ${(ex.how || ex.why) ? `
                <details class="ex-why">
                  <summary><i class="fa-solid fa-circle-info"></i> How &amp; why</summary>
                  ${Array.isArray(ex.how) ? `<ol>${ex.how.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}
                  ${ex.why ? `<p>${ex.why}</p>` : ''}
                </details>` : ''}
              <div class="ex-actions">
                <button class="cta-btn" onclick="BoneApp.openWorkoutTimerModal('${ex.id}')"><i class="fa-solid fa-play"></i> Start</button>
                <button class="round-btn lg ${done ? 'on' : ''}" onclick="BoneApp.toggleExerciseMilestone('${key}', '${ex.id}')" aria-pressed="${done}" aria-label="${done ? 'Undo' : 'Mark done'}" title="${done ? 'Undo' : 'Mark done'}"><i class="fa-solid fa-check"></i></button>
                <button class="round-btn lg" onclick="BoneApp.openExerciseSwapModal('${ex.id}')" aria-label="Swap exercise" title="Swap exercise"><i class="fa-solid fa-shuffle"></i></button>
              </div>
            </div>
          </article>`;
      }).join('');
      setupLazyVideos(grid);
    } catch (err) {
      console.error('renderBuildExerciseView error:', err);
    }
  }

//@@ replace toggleExerciseMilestone
  function toggleExerciseMilestone(_dateKey, exId) {
    // Exercise is always logged against today.
    const key = getTodayISODate();
    playSound('check');
    if (!(state.checkedExerciseMilestones[key] instanceof Set)) {
      const prev = state.checkedExerciseMilestones[key];
      state.checkedExerciseMilestones[key] = new Set(Array.isArray(prev) ? prev : []);
    }
    const set = state.checkedExerciseMilestones[key];
    const wasDone = set.has(exId);
    if (wasDone) set.delete(exId);
    else set.add(exId);

    updateActiveStreak();
    if (!wasDone && set.size >= getActiveExerciseList().length) {
      playSound('success');
      celebrate('big');
      showToast(`Workout complete! ${state.activeStreakDays}-day streak 🔥`, 'fa-dumbbell');
    }

    BoneDB.save();
    renderBuildExerciseView();
  }

//@@ replace openWorkoutTimerModal
  function updateTimerUI() {
    const r = Math.max(0, state.timer.remaining);
    const cd = document.getElementById('timerCountdown');
    const ring = document.getElementById('timerRing');
    if (cd) cd.textContent = `${String(Math.floor(r / 60)).padStart(2, '0')}:${String(r % 60).padStart(2, '0')}`;
    if (ring) ring.style.setProperty('--p', state.timer.total ? (r / state.timer.total) * 100 : 0);
  }

  function setTimerButton(mode) {
    const btn = document.getElementById('timerControlBtn');
    if (!btn) return;
    const labels = {
      start: '<i class="fa-solid fa-play"></i> Start',
      pause: '<i class="fa-solid fa-pause"></i> Pause',
      resume: '<i class="fa-solid fa-play"></i> Resume'
    };
    btn.innerHTML = labels[mode] || labels.start;
  }

  function openWorkoutTimerModal(exId) {
    playSound('tap');
    const catalog = BONE_SIP_DATA.fullExerciseCatalog || BONE_SIP_DATA.exerciseLibrary || [];
    const ex = catalog.find(e => e.id === exId) || (BONE_SIP_DATA.exerciseLibrary || []).find(e => e.id === exId);
    if (!ex) return;

    clearInterval(state.timer.intervalId);
    state.timer.currentExercise = ex;
    state.timer.total = ex.durationSec || 45;
    state.timer.remaining = state.timer.total;
    state.timer.isRunning = false;

    const nameEl = document.getElementById('timerExName');
    const catEl = document.getElementById('timerExCategory');
    const bioEl = document.getElementById('timerExBiomechanics');
    if (nameEl) nameEl.textContent = ex.name;
    if (catEl) catEl.textContent = ex.category || 'Exercise';
    if (bioEl) bioEl.textContent = ex.reps || ex.biomechanics || '';
    updateTimerUI();
    setTimerButton('start');

    pauseAllCardVideos();
    const gifEl = document.getElementById('timerExerciseGif');
    const vidEl = document.getElementById('timerExerciseVideo');
    const media = (state.selectedCoach === 'male' ? ex.maleImg : ex.femaleImg) || ex.femaleImg || ex.maleImg || '';
    if (/\.(mp4|webm)$/i.test(media)) {
      if (vidEl) {
        vidEl.src = media;
        vidEl.style.display = 'block';
        vidEl.currentTime = 0;
        vidEl.play().catch(() => {});
      }
      if (gifEl) gifEl.style.display = 'none';
    } else {
      if (gifEl && media) {
        gifEl.src = media;
        gifEl.style.display = 'block';
      }
      if (vidEl) {
        vidEl.pause();
        vidEl.removeAttribute('src');
        vidEl.style.display = 'none';
      }
    }

    const modal = document.getElementById('workoutTimerModal');
    if (modal) modal.style.display = 'flex';
  }

//@@ replace toggleWorkoutTimer
  function toggleWorkoutTimer() {
    const vidEl = document.getElementById('timerExerciseVideo');
    if (state.timer.isRunning) {
      clearInterval(state.timer.intervalId);
      state.timer.isRunning = false;
      setTimerButton('resume');
      if (vidEl) vidEl.pause();
      return;
    }

    playSound('tap');
    if (state.timer.remaining <= 0) state.timer.remaining = state.timer.total;
    state.timer.isRunning = true;
    setTimerButton('pause');
    if (vidEl && vidEl.style.display !== 'none') vidEl.play().catch(() => {});

    state.timer.intervalId = setInterval(() => {
      state.timer.remaining--;
      updateTimerUI();
      if (state.timer.remaining > 0 && state.timer.remaining <= 3) playSound('timer_beep');
      if (state.timer.remaining <= 0) {
        clearInterval(state.timer.intervalId);
        state.timer.isRunning = false;
        completeWorkoutExercise();
      }
    }, 1000);
  }

//@@ replace resetWorkoutTimer
  function resetWorkoutTimer() {
    playSound('tap');
    clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    state.timer.remaining = state.timer.total;
    updateTimerUI();
    setTimerButton('start');
    const vidEl = document.getElementById('timerExerciseVideo');
    if (vidEl && vidEl.style.display !== 'none') {
      vidEl.currentTime = 0;
      vidEl.pause();
    }
  }

//@@ replace completeWorkoutExercise
  function completeWorkoutExercise() {
    const ex = state.timer.currentExercise;
    if (ex) {
      const set = state.checkedExerciseMilestones[getTodayISODate()];
      if (!(set instanceof Set) || !set.has(ex.id)) {
        toggleExerciseMilestone(getTodayISODate(), ex.id);
      } else {
        showToast('Already done today ✓', 'fa-circle-check');
      }
    }
    closeWorkoutTimerModal();
  }

//@@ replace renderProtectHubView
  function renderProtectHubView() {
    const badge = document.getElementById('protectRiskStatusBadge');
    if (badge) badge.textContent = `${getRiskLevel(state.protectRiskChecked.size).label} risk`;

    const rooms = BONE_SIP_DATA.protectHomeAuditRooms;
    const activeRoom = rooms.find(r => r.id === state.selectedAuditRoom) || rooms[0];

    const tabsEl = document.getElementById('hubRoomTabs');
    if (tabsEl) {
      tabsEl.className = 'room-tabs';
      tabsEl.innerHTML = roomTabsHtml(activeRoom.id, 'BoneApp.selectHubRoom');
    }
    const questionsEl = document.getElementById('hubRoomQuestionsList');
    if (questionsEl) questionsEl.innerHTML = qaRowsHtml(activeRoom, 'BoneApp.setHubRoomAnswer');

    const scoreBadge = document.getElementById('hubHomeScoreBadge');
    if (scoreBadge) {
      const totals = homeSafetyTotals();
      scoreBadge.textContent = `${totals.safe} of ${totals.total} safe`;
    }
  }

//@@ replace setHubRoomAnswer
  function setHubRoomAnswer(roomId, questionId, answer) {
    playSound('check');
    if (!state.protectHomeAuditAnswers[roomId]) state.protectHomeAuditAnswers[roomId] = {};
    state.protectHomeAuditAnswers[roomId][questionId] = answer;
    BoneDB.save();
    renderProtectHubView();
  }

//@@ replace renderStrengthenHubView
  function renderStrengthenHubView() {
    const listEl = document.getElementById('hubDoctorChecklist');
    if (listEl) {
      listEl.innerHTML = BONE_SIP_DATA.doctorReviewChecklist.map(q => {
        const isChecked = state.strengthenDoctorChecked.has(q.id);
        return `
          <button type="button" class="doc-row ${isChecked ? 'selected' : ''}" onclick="BoneApp.toggleHubDoctor('${q.id}')" aria-pressed="${isChecked}">
            ${img3d(q.img || 'clipboard', '', 34)}
            <span>${q.text}</span>
            <span class="tick"><i class="fa-solid fa-check"></i></span>
          </button>`;
      }).join('');
    }

    const dxaEl = document.getElementById('hubDxaRangesList');
    const guide = BONE_SIP_DATA.dxaInterpretationGuide;
    if (dxaEl && guide) {
      const colors = ['#1E9E62', '#D97706', '#B1315D'];
      dxaEl.innerHTML = guide.ranges.map((r, i) => `
        <div class="dxa-item" style="--dxa-c: ${colors[i] || '#6B6580'};">
          <div>
            <b>${r.category}</b>
            <p><strong>${r.score}.</strong> ${r.meaning}</p>
          </div>
        </div>`).join('');
    }
  }

//@@ replace toggleHubDoctor
  function toggleHubDoctor(docId) {
    playSound('check');
    if (state.strengthenDoctorChecked.has(docId)) state.strengthenDoctorChecked.delete(docId);
    else state.strengthenDoctorChecked.add(docId);
    BoneDB.save();
    renderStrengthenHubView();
  }

//@@ replace shareDoctorReviewWhatsApp
  function shareDoctorReviewWhatsApp() {
    playSound('tap');
    const questions = BONE_SIP_DATA.doctorReviewChecklist
      .filter(q => state.strengthenDoctorChecked.has(q.id))
      .map((q, idx) => `${idx + 1}. ${q.text}`);
    if (!questions.length) {
      showToast('Tick at least one question first', 'fa-circle-info');
      return;
    }
    const msg = [
      '*BONE SIP — Questions for my doctor*',
      '',
      ...questions,
      '',
      'Invest in Bones. Invest in Life.'
    ].join('\n');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

//@@ replace init
  function registerServiceWorker() {
    const cfg = window.BONE_SIP_CONFIG || {};
    if (!cfg.enableServiceWorker || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
    const register = () => navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker registration failed:', err));
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
  }

  function init() {
    const hadSavedData = BoneDB.load();
    updateActiveStreak();
    calculateBMI();
    renderPillarBottomNav();
    updateHeaderProfileBadge();
    setupOnboardingSwipe();

    const splash = document.getElementById('appSplashScreen');
    if (hadSavedData && hasExistingJourney()) {
      // Returning users skip the welcome screens and land where they left off.
      if (splash) splash.classList.add('hidden');
      resumeJourney();
    } else {
      showView('assessment');
      renderAssessmentStage();
    }

    // Keyboard support for elements that act as buttons.
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]')) {
        e.preventDefault();
        e.target.click();
      }
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => {
          if (m.style.display === 'flex') {
            if (m.id === 'workoutTimerModal') closeWorkoutTimerModal();
            else m.style.display = 'none';
          }
        });
        if (state.isChatDrawerOpen) closeChatDrawer();
      }
    });

    // Tap outside a modal to close it.
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.addEventListener('click', (e) => {
        if (e.target !== m) return;
        if (m.id === 'workoutTimerModal') closeWorkoutTimerModal();
        else m.style.display = 'none';
      });
    });

    registerServiceWorker();
  }
