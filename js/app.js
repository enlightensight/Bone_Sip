// BONE SIP - Streamlined 3-Pillar Architecture (Build · Protect · Strengthen)
// OpenDesign Specification with Multi-Step Progressive Gating & Daily Continuous Streak

(function () {
  'use strict';

  // Display language (js/i18n.js). Falls back to English when it isn't loaded (e.g. tests).
  const I18N = window.BoneI18n || {
    LANGS: [{ code: 'en', name: 'English', native: 'English', glyph: 'Aa' }],
    t: (k, v) => (v ? k.replace(/\{(\w+)\}/g, (m, n) => (v[n] !== undefined ? v[n] : m)) : k),
    tr: x => x,
    current: () => 'en',
    language: () => null,
    saved: () => 'en',
    setLanguage: () => Promise.resolve('en'),
    date: (d, o) => d.toLocaleDateString('en-IN', o)
  };
  const { t, tr } = I18N;

  // --------------------------------------------------------------------------
  // APPLICATION STATE STORE
  // --------------------------------------------------------------------------
  const state = {
    activePillar: 'build', // 'build' | 'protect' | 'strengthen'
    activeBuildSubTab: 'diet', // 'diet' | 'exercise'
    assessmentPhase: 'build', // 'build' | 'protect' | 'strengthen' | 'completed'
    buildAssessmentStep: 'goals', // 'goals' | 'plan_overview' | 'diet' | 'regional_food' | 'activity' | 'conditions' | 'build_education'
    protectAssessmentStep: 1, // 1 (Intro) | 2 (Risk Audit) | 3 (Home Audit)
    strengthenAssessmentStep: 1, // 1 (Intro) | 2 (Doctor Review)

    onboardingSlide: 0,
    selectedCoach: 'male', // 'male' | 'female'

    // Auth & Pillar Gating State
    auth: {
      isVerified: false,
      phone: '',
      otpCode: '849201'
    },
    unlockedPillars: {
      build: true,
      protect: false,
      strengthen: false
    },
    completedPillars: {
      build: false,
      protect: false,
      strengthen: false
    },

    // Build assessment choices & user profile
    selectedAssets: [],
    userProfile: {
      fullName: '',
      phone: '',
      age: 52,
      heightCm: 165,
      weightKg: 62,
      bmi: 22.8,
      diet: 'veg',
      regionalFood: 'north',
      activityLevel: 'moderate',
      healthConditions: []
    },

    // 100+ Regional Meal Swaps & 12 Clinical Exercise Routines
    customMealSwaps: {}, // { [isoDate]: { [slotId]: mealObject } }
    activeExerciseRoutine: ['ex_sit_to_stand', 'ex_one_leg_balance', 'ex_calf_raises', 'ex_step_ups', 'ex_band_pull'],
    mealSwapFilter: { slotId: 'm_breakfast', slotName: 'Breakfast Milestone', region: 'all', diet: 'all', search: '' },
    exerciseSwapFilter: { replacingExId: null, category: 'all' },

    // Daily Score out of 100
    dailyScore100: 0,
    dailyScoreBreakdown: { diet: 0, exercise: 0, precautions: 0, streak: 0 },

    // Intelligent AI Chatbot
    isChatDrawerOpen: false,
    chatHistory: [],
    chatLanguage: 'auto', // Ojas reply language: 'auto' or a code from CHAT_LANGUAGES

    // Protect assessment choices (Images 2, 3, 4) - default unchecked
    protectRiskChecked: new Set(),
    protectHomeAuditAnswers: {},
    selectedAuditRoom: 'room_bathroom',

    // Strengthen View State: 'simple' (Clean Doctor Review & DXA Guide) | 'clinical' (Advanced Portal)
    strengthenMode: 'simple',
    strengthenActiveSubTab: 'dxa_risk',
    // The user's bone health file: only what they enter (no sample values).
    scans: [],      // [{ id, date, spine, neck, hip }] DXA T-scores
    labs: [],       // [{ id, date, vit_d, calcium, alp, egfr }]
    meds: [],       // [{ id, name, kind, time, weekly, weekday }]
    medTaken: {},   // { 'YYYY-MM-DD': [medId] }
    doctorVisit: { date: '', questions: [] },
    strengthenForm: null,
    medDraft: null,
    fraxInputs: {
      prior_fracture: false,
      parent_hip: false,
      steroid_use: false,
      rheumatoid: false
    },
    spineInputs: {
      heightAge25: '',
      heightCurrent: ''
    },
    strengthenDoctorChecked: new Set(),

    // Unlocked Dashboard Tracking & Date-Wise Continuous Streaks
    calendarWeekOffset: 0,
    selectedCalendarDate: '', // initialized dynamically to today YYYY-MM-DD
    selectedCalendarDay: 'Monday',
    checkedDietMilestones: {
      Monday: new Set(),
      Tuesday: new Set(),
      Wednesday: new Set(),
      Thursday: new Set(),
      Friday: new Set(),
      Saturday: new Set(),
      Sunday: new Set()
    },
    checkedExerciseMilestones: {
      Monday: new Set(),
      Tuesday: new Set(),
      Wednesday: new Set(),
      Thursday: new Set(),
      Friday: new Set(),
      Saturday: new Set(),
      Sunday: new Set()
    },
    checkedDietItems: {},
    activeStreakDays: 0,

    // Exercise Workout Timer
    timer: {
      currentExercise: null,
      total: 45,
      remaining: 45,
      isRunning: false,
      intervalId: null
    }
  };

  // --------------------------------------------------------------------------
  // INLINE VECTOR SVG ICON REGISTRY (100% OFFLINE & BULLETPROOF RENDERING)
  // --------------------------------------------------------------------------
  const SVG_ICONS = {
    check: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    seedling: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a6 6 0 0 0-6-6H3v2a6 6 0 0 0 6 6h3"></path><path d="M12 10a6 6 0 0 1 6-6h3v2a6 6 0 0 1-6 6h-3"></path><path d="M12 10v11"></path></svg>`,
    shield: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    lock: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="11" rx="2.5" ry="2.5"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    trend: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`
  };

  // --------------------------------------------------------------------------
  // SYNTHESIZED WEB AUDIO SOUND ENGINE
  // --------------------------------------------------------------------------
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'tap') {
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'check') {
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'timer_beep') {
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      // Audio fallback silent
    }
  }

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  function showToast(message, icon = 'fa-circle-check') {
    const toast = document.getElementById('appToast');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.innerHTML = `<i class="fa-solid ${icon}" style="color: #F3B5CF; margin-right: 8px;"></i>${escapeHtml(message)}`;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // --------------------------------------------------------------------------
  // BONE LOGO SVG GENERATOR (MATCHING IMAGE 1)
  // --------------------------------------------------------------------------
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
      <b>${t('{0} of {1}', { 0: count, 1: 6 })}</b>
      <span>${r.msg}</span><br>
      <span class="lvl" style="background: ${r.color};">${tr(`${r.label} risk`)}</span>`;
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
    m_sun_d3: { name: 'Morning sun', img: 'sunrise', icon: 'fa-regular fa-sun', time: '6:30–8:00 AM' },
    m_breakfast: { name: 'Breakfast', img: 'coffee', icon: 'fa-solid fa-mug-hot', time: '8:00–9:30 AM' },
    m_lunch: { name: 'Lunch', img: 'curry', icon: 'fa-solid fa-bowl-rice', time: '1:00–2:30 PM' },
    m_snack: { name: 'Snack', img: 'peanuts', icon: 'fa-solid fa-cookie-bite', time: '4:30–5:30 PM' },
    m_dinner: { name: 'Dinner', img: 'bowl', icon: 'fa-solid fa-utensils', time: '7:30–8:30 PM' }
  };
  const SLOT_ORDER = ['m_sun_d3', 'm_breakfast', 'm_lunch', 'm_snack', 'm_dinner'];

  function isDemoMode() {
    const cfg = window.BONE_SIP_CONFIG || {};
    return cfg.mode !== 'production';
  }

  function toISODate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // --------------------------------------------------------------------------
  // MODULE 1: ONBOARDING TOUR
  // --------------------------------------------------------------------------
  function startOnboardingTour() {
    playSound('tap');
    const splash = document.getElementById('appSplashScreen');
    if (splash) splash.classList.add('dismissed');
    // First visit: choose a language before anything else.
    if (window.BoneI18n && !I18N.saved()) {
      openLanguagePicker({ firstRun: true, then: startOnboardingTour });
      return;
    }
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
      state.activePillar = 'build';
      showView('build');
      switchBuildSubTab(state.activeBuildSubTab || 'diet', true);
    } else {
      state.assessmentPhase = 'build';
      state.activePillar = 'build';
      showView('assessment');
      renderAssessmentStage();
    }
    renderPillarBottomNav();
  }

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

  function nextOnboardingSlide() {
    playSound('tap');
    const totalSlides = BONE_SIP_DATA.onboardingScreens.length;
    if (state.onboardingSlide < totalSlides - 1) {
      state.onboardingSlide++;
      renderOnboardingCarousel();
    } else {
      skipOnboarding();
    }
  }

  function goToOnboardingSlide(index) {
    playSound('tap');
    state.onboardingSlide = index;
    renderOnboardingCarousel();
  }

  // --------------------------------------------------------------------------
  // VIEW ROUTER & PILLAR BOTTOM NAVIGATION
  // --------------------------------------------------------------------------
  function showView(viewId) {
    document.body.dataset.view = viewId;
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

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

  function navigatePillar(pillarId) {
    playSound('tap');

    // Check Lock State
    if (pillarId === 'protect' && !state.unlockedPillars.protect) {
      showToast('🔒 Complete Build Assessment & Login to unlock Protect.', 'fa-lock');
      return;
    }
    if (pillarId === 'strengthen' && !state.unlockedPillars.strengthen) {
      showToast('🔒 Complete Protect Assessment to unlock Strengthen.', 'fa-lock');
      return;
    }

    state.activePillar = pillarId;
    renderPillarBottomNav();

    // Check if in ongoing assessment phase vs completed dashboard
    if (pillarId === 'build') {
      if (!state.completedPillars.build) {
        state.assessmentPhase = 'build';
        showView('assessment');
        renderAssessmentStage();
      } else {
        showView('build');
        switchBuildSubTab(state.activeBuildSubTab || 'diet', true);
      }
    } else if (pillarId === 'protect') {
      if (!state.completedPillars.protect) {
        state.assessmentPhase = 'protect';
        showView('assessment');
        renderAssessmentStage();
      } else {
        showView('protect');
        renderProtectHubView(true);
      }
    } else if (pillarId === 'strengthen') {
      if (!state.completedPillars.strengthen) {
        state.assessmentPhase = 'strengthen';
        showView('assessment');
        renderAssessmentStage();
      } else {
        showView('strengthen');
        renderStrengthenHubView(true);
      }
    }
  }

  // --------------------------------------------------------------------------
  // MULTI-STEP ASSESSMENT WIZARD (BUILD · PROTECT · STRENGTHEN)
  // --------------------------------------------------------------------------
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

  // 1. BUILD ASSESSMENT STEPS
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
          <span class="wiz-count ${state.selectedAssets.length ? 'on' : ''}" id="assetSelectedCount"><i class="fa-solid ${state.selectedAssets.length ? 'fa-circle-check' : 'fa-circle-info'}"></i> ${state.selectedAssets.length ? `${state.selectedAssets.length} selected` : 'Select at least 1 goal'}</span>
          <button class="cta-btn" id="goalsContinueBtn" ${state.selectedAssets.length === 0 ? 'disabled' : ''} onclick="BoneApp.setBuildAssessmentStep('plan_overview')">Continue <i class="fa-solid fa-arrow-right"></i></button>
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
        ${baselineHtml()}
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
          <button class="cta-btn" onclick="BoneApp.continueFromDiet()">Continue <i class="fa-solid fa-arrow-right"></i></button>
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

  // 2. PROTECT ASSESSMENT STEPS (IMAGES 2, 3, 4)
  function renderProtectAssessmentStep(container) {
    const step = state.protectAssessmentStep;
    const data = BONE_SIP_DATA;

    if (step === 1) {
      container.innerHTML = `
        ${wizTop({ back: "BoneApp.navigatePillar('build')", total: 3, done: 1, color: 'var(--protect)', label: 'Protect · 1 of 3' })}
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

  // 3. STRENGTHEN ASSESSMENT STEPS (IMAGE 5)
  // Strengthen intro: one screen about what the portal does, then straight in.
  function renderStrengthenAssessmentStep(container) {
    container.innerHTML = `
      ${wizTop({ total: 1, done: 1, color: 'var(--strengthen)', label: t('Strengthen') })}
      <div class="unlock-banner strengthen pop">
        ${img3d('party', '', 40)}
        <div><b>${t('Protect complete!')}</b><span>${t('Strengthen is now unlocked.')}</span></div>
      </div>
      <div class="wiz-hero">
        ${img3d('stethoscope', 'i3d-lg float', 72)}
        <div>
          <span class="step-chip strengthen">${t('Strengthen')}</span>
          <h2 class="wiz-title">${t('Your bone health file')}</h2>
          <p class="wiz-sub">${t('Keep your scans, tests and medicines in one place.')}</p>
        </div>
      </div>
      <div class="pillar-stack">
        ${pillarRow({ img: 'xray', title: t('Scan results'), sub: t('See if your bones are getting stronger'), i: 1 })}
        ${pillarRow({ img: 'barchart', title: t('Blood tests'), sub: t('Vitamin D, calcium and more'), i: 2 })}
        ${pillarRow({ img: 'pill', title: t('Medicines'), sub: t('Tick each tablet so you never miss one'), i: 3 })}
        ${pillarRow({ img: 'clipboard', title: t('Doctor visit'), sub: t('A one-page summary to show your doctor'), i: 4 })}
      </div>
      <div class="wiz-footer">
        <button class="cta-btn strengthen" onclick="BoneApp.completeStrengthenAssessment()">${t('Open Strengthen')} <i class="fa-solid fa-arrow-right"></i></button>
      </div>`;
  }

  // Helper Setters for Assessment
  function setBuildAssessmentStep(step) {
    playSound('tap');
    if (step === 'plan_overview' && state.selectedAssets.length === 0) {
      showToast('Please select at least one goal to continue', 'fa-circle-info');
      const grid = document.getElementById('lifeAssetGrid');
      if (grid) {
        grid.classList.remove('shake');
        void grid.offsetWidth;
        grid.classList.add('shake');
      }
      return;
    }
    state.buildAssessmentStep = step;
    renderAssessmentStage();
  }

  function setProtectAssessmentStep(step) {
    playSound('tap');
    state.protectAssessmentStep = step;
    renderAssessmentStage();
  }

  function setStrengthenAssessmentStep(step) {
    playSound('tap');
    state.strengthenAssessmentStep = step;
    renderAssessmentStage();
  }

  function toggleLifeAsset(assetId) {
    playSound('check');
    const idx = state.selectedAssets.indexOf(assetId);
    if (idx > -1) state.selectedAssets.splice(idx, 1);
    else state.selectedAssets.push(assetId);

    setTileSelected('#lifeAssetGrid', assetId, state.selectedAssets.includes(assetId));
    const countEl = document.getElementById('assetSelectedCount');
    if (countEl) {
      countEl.innerHTML = `<i class="fa-solid ${state.selectedAssets.length ? 'fa-circle-check' : 'fa-circle-info'}"></i> ${state.selectedAssets.length ? `${state.selectedAssets.length} selected` : 'Select at least 1 goal'}`;
      countEl.classList.toggle('on', state.selectedAssets.length > 0);
    }
    const continueBtn = document.getElementById('goalsContinueBtn');
    if (continueBtn) {
      continueBtn.disabled = state.selectedAssets.length === 0;
    }
    BoneDB.save();
  }

  function selectDiet(dietId) {
    playSound('check');
    state.userProfile.diet = dietId;
    renderAssessmentStage();
  }

  function selectRegionalFood(regId) {
    playSound('check');
    state.userProfile.regionalFood = regId;
    renderAssessmentStage();
  }

  function selectActivity(activityId) {
    playSound('check');
    state.userProfile.activityLevel = activityId;
    renderAssessmentStage();
  }

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

  function toggleProtectRisk(riskId) {
    playSound('check');
    if (state.protectRiskChecked.has(riskId)) state.protectRiskChecked.delete(riskId);
    else state.protectRiskChecked.add(riskId);
    setTileSelected('#riskFactorGrid', riskId, state.protectRiskChecked.has(riskId));
    updateRiskGauge();
    BoneDB.save();
  }

  function selectAuditRoom(roomId) {
    playSound('tap');
    state.selectedAuditRoom = roomId;
    renderAssessmentStage();
  }

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

  function toggleStrengthenDoctor(docId) {
    playSound('check');
    if (state.strengthenDoctorChecked.has(docId)) state.strengthenDoctorChecked.delete(docId);
    else state.strengthenDoctorChecked.add(docId);
    setTileSelected('#strengthenDoctorList', docId, state.strengthenDoctorChecked.has(docId));
    BoneDB.save();
  }

  // Modal for Height & Weight
  function openHeightWeightModal() {
    playSound('tap');
    const h = document.getElementById('heightRangeInput');
    const w = document.getElementById('weightRangeInput');
    if (h) { h.value = state.userProfile.heightCm; onHeightChange(h.value); }
    if (w) { w.value = state.userProfile.weightKg; onWeightChange(w.value); }
    const modal = document.getElementById('heightWeightModal');
    if (modal) modal.style.display = 'flex';
  }

  function closeHeightWeightModal() {
    playSound('tap');
    const modal = document.getElementById('heightWeightModal');
    if (modal) modal.style.display = 'none';
  }

  function onHeightChange(val) {
    state.userProfile.heightCm = parseInt(val, 10);
    const disp = document.getElementById('heightDisplayValue');
    if (disp) disp.textContent = `${val} cm`;
  }

  function onWeightChange(val) {
    state.userProfile.weightKg = parseInt(val, 10);
    const disp = document.getElementById('weightDisplayValue');
    if (disp) disp.textContent = `${val} kg`;
  }

  // Height & weight start empty; once saved they collapse into a summary with an Edit button.
  function baselineHtml() {
    const p = state.userProfile;
    if (p.baselineSet && !state.editingBaseline) {
      return `
        <div class="baseline-pill">
          <span class="bp-stat"><i class="fa-solid fa-ruler-vertical"></i> ${p.heightCm} cm</span>
          <span class="bp-stat"><i class="fa-solid fa-weight-scale"></i> ${p.weightKg} kg</span>
          <span class="spacer"></span>
          <button class="btn btn-sm btn-outline" onclick="BoneApp.editBaseline()"><i class="fa-solid fa-pen"></i> Edit</button>
        </div>`;
    }
    const h = p.baselineSet ? p.heightCm : '';
    const w = p.baselineSet ? p.weightKg : '';
    return `
      <div class="baseline-form" id="baselineForm">
        <div class="bf-title">Your height &amp; weight</div>
        <div class="bf-row">
          <label class="bf-field">
            <i class="fa-solid fa-ruler-vertical"></i>
            <input type="number" id="baselineHeight" inputmode="numeric" min="100" max="230" placeholder="Height" value="${h}" aria-label="Height in centimetres">
            <span>cm</span>
          </label>
          <label class="bf-field">
            <i class="fa-solid fa-weight-scale"></i>
            <input type="number" id="baselineWeight" inputmode="numeric" min="25" max="250" placeholder="Weight" value="${w}" aria-label="Weight in kilograms">
            <span>kg</span>
          </label>
          <button class="btn btn-sm btn-primary bf-save" onclick="BoneApp.saveBaseline()"><i class="fa-solid fa-check"></i> Save</button>
        </div>
      </div>`;
  }

  function saveBaseline() {
    const hEl = document.getElementById('baselineHeight');
    const wEl = document.getElementById('baselineWeight');
    const h = parseInt(hEl && hEl.value, 10);
    const w = parseInt(wEl && wEl.value, 10);
    if (!(h >= 100 && h <= 230)) {
      showToast('Enter height between 100 and 230 cm', 'fa-ruler-vertical');
      if (hEl) hEl.focus();
      return;
    }
    if (!(w >= 25 && w <= 250)) {
      showToast('Enter weight between 25 and 250 kg', 'fa-weight-scale');
      if (wEl) wEl.focus();
      return;
    }
    playSound('check');
    state.userProfile.heightCm = h;
    state.userProfile.weightKg = w;
    state.userProfile.baselineSet = true;
    state.editingBaseline = false;
    calculateBMI();
    renderAssessmentStage();
  }

  function editBaseline() {
    playSound('tap');
    state.editingBaseline = true;
    renderAssessmentStage();
    const hEl = document.getElementById('baselineHeight');
    if (hEl) hEl.focus();
  }

  function continueFromDiet() {
    if (!state.userProfile.baselineSet || state.editingBaseline) {
      playSound('tap');
      showToast('Please save your height & weight first', 'fa-circle-info');
      const form = document.getElementById('baselineForm');
      if (form) {
        form.classList.remove('shake');
        void form.offsetWidth;
        form.classList.add('shake');
      }
      const hEl = document.getElementById('baselineHeight');
      if (hEl && !hEl.value) hEl.focus();
      return;
    }
    setBuildAssessmentStep('regional_food');
  }

  function saveHeightWeightModal() {
    playSound('check');
    closeHeightWeightModal();
    renderAssessmentStage();
  }

  // Progression from Build Assessment to Login Gate
  function proceedToLogin() {
    playSound('tap');
    if (!state.userProfile.healthConditions || state.userProfile.healthConditions.length === 0) {
      state.userProfile.healthConditions = ['none'];
    }
    // Someone who already verified (e.g. redoing Build) shouldn't need a new OTP.
    if (state.auth.isVerified && state.auth.phone) {
      completeBuildPillar();
      return;
    }
    state.authMode = 'save';
    setAuthCopy();
    showView('auth');
    showAuthPhoneStep();
    const input = document.getElementById('inlineMobileNumberInput');
    if (input && !input.value && state.userProfile.phone) input.value = state.userProfile.phone;
    BoneDB.save();
  }

  function shakeAuthCard() {
    const card = document.querySelector('#view-auth .auth-card');
    if (!card) return;
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
  }

  // The code to show on screen when there is no real SMS yet (demo or server test mode).
  function onScreenOtpCode() {
    return state.auth.pendingMode === 'cloud' ? cloud.testCode : ((window.BONE_SIP_CONFIG || {}).demoOtpCode || '849201');
  }

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
    let mode = isDemoMode() ? 'demo' : 'custom';
    cloud.testCode = '';
    if (accountsApi()) {
      let r = null;
      try { r = await apiCall('POST', '/auth/otp/send', { phone: cleanPhone }); } catch (err) { r = null; }
      if (!r) {
        showToast(t('Could not send the code. Please check your internet and try again.'), 'fa-triangle-exclamation');
        return;
      }
      if (r.status === 429) {
        showToast(t('Too many tries. Please wait an hour and try again.'), 'fa-triangle-exclamation');
        return;
      }
      if (r.status === 503) {
        showToast(t('Phone login is not switched on yet. Please try later.'), 'fa-triangle-exclamation');
        return;
      }
      if (r.ok) {
        mode = 'cloud';
        cloud.testCode = r.json.testMode ? String(r.json.testCode || '') : '';
      } else if (r.status !== 404 && r.status !== 405) {
        showToast(t('Could not send the code. Please check your internet and try again.'), 'fa-triangle-exclamation');
        return;
      }
      // 404/405: this host has no accounts API, so fall back to the on-device login below.
    }

    if (mode === 'custom') {
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
    state.auth.pendingMode = mode;

    const phoneStep = document.getElementById('inlineAuthPhoneStep');
    const otpStep = document.getElementById('inlineAuthOtpStep');
    if (phoneStep) phoneStep.style.display = 'none';
    if (otpStep) otpStep.style.display = 'block';
    const back = document.getElementById('authBackBtn');
    if (back) back.hidden = false;

    const sentText = document.getElementById('inlineOtpSentPhoneText');
    if (sentText) sentText.textContent = t('Code sent to {phone}', { phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}` });

    const showCode = mode === 'demo' || (mode === 'cloud' && !!cloud.testCode);
    const bubble = document.getElementById('inlineSmsSimBubble');
    const autofill = document.getElementById('otpAutofillBtn');
    const codeText = document.getElementById('inlineSimulatedOtpCodeText');
    const codeLabel = document.getElementById('inlineSmsSimLabel');
    if (bubble) bubble.style.display = showCode ? 'flex' : 'none';
    if (autofill) autofill.style.display = showCode ? 'inline-flex' : 'none';
    if (codeText) codeText.textContent = onScreenOtpCode();
    if (codeLabel) codeLabel.textContent = mode === 'cloud' ? t('Test login — your code is') : t('Demo mode — your code is');

    const boxes = document.querySelectorAll('.inline-otp');
    boxes.forEach(b => { b.value = ''; });
    if (boxes[0]) setTimeout(() => boxes[0].focus(), 150);

    showToast(showCode ? t('Use the code shown on screen') : t('Code sent to {phone}', { phone: `+91 ${cleanPhone}` }), 'fa-comment-sms');
  }

  function autofillInlineOTP() {
    const code = onScreenOtpCode();
    if (!code || !(state.auth.pendingMode === 'demo' || cloud.testCode)) return;
    playSound('check');
    code.split('').forEach((d, index) => {
      const input = document.querySelectorAll('.inline-otp')[index];
      if (input) input.value = d;
    });
    verifyInlineOTP();
  }

  function handleInlineOtpInput(input, index, event) {
    const inputs = document.querySelectorAll('.inline-otp');
    if (event && event.type === 'keydown') {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        event.preventDefault();
        inputs[index - 1].value = '';
        inputs[index - 1].focus();
      }
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
    let failNote = t('That code didn’t match. Please try again.');
    let account = null;
    try {
      if (state.auth.pendingMode === 'cloud') {
        const r = await apiCall('POST', '/auth/otp/verify', { phone, code });
        verified = r.ok;
        if (r.ok) account = r.json;
        else if (r.json.error === 'expired') failNote = t('That code has expired. Tap Resend for a new one.');
        else if (r.json.error === 'too_many_attempts') failNote = t('Too many wrong tries. Tap Resend for a new code.');
      } else if (state.auth.pendingMode === 'demo' || isDemoMode()) {
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
      failNote = t('Could not check the code. Please check your internet and try again.');
    } finally {
      otpVerifyInFlight = false;
    }

    if (!verified) {
      playSound('tap');
      showToast(failNote, 'fa-triangle-exclamation');
      shakeAuthCard();
      boxes.forEach(b => { b.value = ''; });
      if (boxes[0]) boxes[0].focus();
      return;
    }

    state.auth.isVerified = true;
    state.auth.phone = phone;
    state.auth.cloud = !!account;
    if (account && account.user) state.auth.createdAt = account.user.createdAt;
    state.userProfile.phone = phone;
    delete state.auth.pendingPhone;
    delete state.auth.pendingMode;

    playSound('success');
    celebrate('big');
    updateHeaderProfileBadge();

    // Returning user: bring back their saved plan and history.
    const remote = account && account.state;
    if (remote && remote.completedPillars && remote.completedPillars.build) {
      adoptCloudState(remote);
      cloud.fullUpload = true;
      BoneDB.save();
      showToast(t('Welcome back! Your plan and history are restored.'), 'fa-cloud-arrow-down');
      state.authMode = 'save';
      resumeJourney();
      return;
    }

    cloud.fullUpload = true;
    if (state.authMode === 'login' && !state.completedPillars.build) {
      // New number on the login screen: start the short setup, already logged in.
      state.authMode = 'save';
      BoneDB.save();
      showToast(t('You’re logged in. Let’s set up your plan.'), 'fa-circle-check');
      resumeJourney();
      return;
    }
    state.authMode = 'save';
    completeBuildPillar();
  }

  function completeBuildPillar() {
    state.completedPillars.build = true;
    state.unlockedPillars.protect = true;

    state.activePillar = 'build';
    state.activeBuildSubTab = 'diet';
    showToast('Verified! Welcome to your Build plan. Protect is unlocked.', 'fa-shield-halved');
    showView('build');
    switchBuildSubTab('diet', true);
    renderPillarBottomNav();
    BoneDB.save();
  }

  function completeProtectAssessment() {
    playSound('success');
    celebrate();
    state.completedPillars.protect = true;
    state.unlockedPillars.strengthen = true;

    state.activePillar = 'protect';
    showView('protect');
    renderProtectHubView();
    showToast('Protect complete! Strengthen is unlocked.', 'fa-arrow-trend-up');
    renderPillarBottomNav();
    BoneDB.save();
  }

  function completeStrengthenAssessment() {
    playSound('success');
    celebrate('big');
    state.completedPillars.strengthen = true;
    state.unlockedPillars.strengthen = true;
    state.assessmentPhase = 'completed';
    state.activePillar = 'strengthen';
    showToast(t('All 3 pillars unlocked. Welcome to your plan!'), 'fa-trophy');
    showView('strengthen');
    renderStrengthenHubView(true);
    renderPillarBottomNav();
    BoneDB.save();
  }

  // --------------------------------------------------------------------------
  // MODULE 3: BUILD VIEW (DIET & EXERCISE WITH STREAK ENGINE)
  // --------------------------------------------------------------------------
  function switchBuildSubTab(tab, silent) {
    if (!silent) playSound('tap');
    state.activeBuildSubTab = tab;
    BoneDB.save();

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

  // --------------------------------------------------------------------------
  // DATE-WISE CALENDAR ENGINE
  // --------------------------------------------------------------------------
  function getTodayISODate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getTodayDayName() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[new Date().getDay()];
  }

  function getWeekDays(offset = 0) {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + (offset * 7));

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;
      const isToday = d.toDateString() === now.toDateString();
      const dateNum = d.getDate();
      const dayName = dayNames[i];
      const english = I18N.current() === 'en';
      const dayShort = english ? dayName.slice(0, 3).toUpperCase() : I18N.date(d, { weekday: 'short' });
      const monthShort = english ? monthNames[d.getMonth()] : I18N.date(d, { month: 'short' });
      const monthFull = english ? fullMonthNames[d.getMonth()] : I18N.date(d, { month: 'long' });

      days.push({
        date: d,
        isoDate,
        dateNum: dateNum < 10 ? `0${dateNum}` : `${dateNum}`,
        dayName,
        dayShort,
        monthShort,
        monthFull,
        year: yyyy,
        isToday
      });
    }
    return days;
  }

  // --------------------------------------------------------------------------
  // MODULE: PRODUCTION DATABASE & LOCAL PERSISTENCE LAYER (BoneDB)
  // --------------------------------------------------------------------------
  // Before v3.7 Strengthen showed sample values (T-score -2.6, vitamin D 24…).
  // Keep only numbers the user actually changed, as dated-unknown records.
  function migrateOldStrengthenInputs(data) {
    const dxa = data.dxaInputs;
    if (!Array.isArray(data.scans) && dxa && !(dxa.spineTScore === -2.6 && dxa.hipTScore === -1.8 && dxa.neckTScore === -2.2)) {
      const n = v => (typeof v === 'number' && !isNaN(v) ? v : null);
      state.scans = [{ id: 'old_scan', date: dxa.scanDate || '', spine: n(dxa.spineTScore), neck: n(dxa.neckTScore), hip: n(dxa.hipTScore) }];
    }
    const lab = data.labInputs;
    if (!Array.isArray(data.labs) && lab && !(lab.vit_d === 24 && lab.calcium === 9.4 && lab.alp === 85 && lab.egfr === 75)) {
      state.labs = [{ id: 'old_lab', date: '', vit_d: lab.vit_d, calcium: lab.calcium, alp: lab.alp, egfr: lab.egfr }];
    }
    const sp = data.spineInputs;
    if (sp && sp.heightAge25 === 168 && sp.heightCurrent === 165) state.spineInputs = { heightAge25: '', heightCurrent: '' };
  }

  const BoneDB = {
    KEY: 'BONE_SIP_PRODUCTION_DB_V3',

    // Everything worth keeping, as plain JSON (saved on the phone and, when logged in, to the account).
    payload() {
      return {
        version: 4,
        lastUpdated: new Date().toISOString(),
        auth: state.auth,
        unlockedPillars: state.unlockedPillars,
        completedPillars: state.completedPillars,
        assessmentPhase: state.assessmentPhase,
        buildAssessmentStep: state.buildAssessmentStep,
        protectAssessmentStep: state.protectAssessmentStep,
        strengthenAssessmentStep: state.strengthenAssessmentStep,
        selectedAssets: state.selectedAssets,
        userProfile: state.userProfile,
        protectRiskChecked: Array.from(state.protectRiskChecked || []),
        protectHomeAuditAnswers: state.protectHomeAuditAnswers || {},
        strengthenDoctorChecked: Array.from(state.strengthenDoctorChecked || []),
        customMealSwaps: state.customMealSwaps || {},
        itemSwaps: state.itemSwaps || {},
        activeExerciseRoutine: state.activeExerciseRoutine || [],
        selectedCoach: state.selectedCoach,
        exerciseGroup: state.exerciseGroup,
        exerciseDurations: state.exerciseDurations || {},
        selectedAuditRoom: state.selectedAuditRoom,
        activeBuildSubTab: state.activeBuildSubTab,
        activeStreakDays: state.activeStreakDays || 0,
        chatHistory: (state.chatHistory || []).slice(-60),
        chatLanguage: state.chatLanguage,
        checkedDietMilestones: Object.keys(state.checkedDietMilestones || {}).reduce((acc, k) => {
          acc[k] = Array.from(state.checkedDietMilestones[k] || []);
          return acc;
        }, {}),
        checkedDietItems: state.checkedDietItems || {},
        checkedExerciseMilestones: Object.keys(state.checkedExerciseMilestones || {}).reduce((acc, k) => {
          acc[k] = Array.from(state.checkedExerciseMilestones[k] || []);
          return acc;
        }, {}),
        protectBannerDismissed: !!state.protectBannerDismissed,
        strengthenMode: state.strengthenMode || 'simple',
        strengthenActiveSubTab: state.strengthenActiveSubTab || 'dxa_risk',
        fraxInputs: state.fraxInputs || {},
        spineInputs: state.spineInputs || {},
        scans: state.scans || [],
        labs: state.labs || [],
        meds: state.meds || [],
        medTaken: state.medTaken || {},
        doctorVisit: state.doctorVisit || { date: '', questions: [] }
      };
    },

    save() {
      try {
        localStorage.setItem(this.KEY, JSON.stringify(this.payload()));
        scheduleCloudSync();
      } catch (err) {
        console.warn('BoneDB save error:', err);
      }
    },

    load() {
      try {
        let raw = localStorage.getItem(this.KEY);
        if (!raw) {
          raw = localStorage.getItem('BONE_SIP_PRODUCTION_DB_V2');
        }
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data) return false;

        // Clean out demo seed values that pre-v3 builds stored. Real v3 data is left alone,
        // since a genuine user can own any number, including the old demo one.
        const isLegacy = (data.version || 0) < 4;
        if (isLegacy && data.userProfile) {
          if (data.userProfile.fullName === 'Sunita Sharma') data.userProfile.fullName = '';
          if (data.userProfile.phone === '9876543210') data.userProfile.phone = '';
        }
        if (isLegacy && data.auth) {
          if (data.auth.phone === '9876543210') {
            data.auth.phone = '';
            data.auth.isVerified = false;
          }
        }
        if (Array.isArray(data.chatHistory)) {
          const hasDummy = data.chatHistory.some(m => m.text && m.text.includes('Sunita Sharma'));
          if (hasDummy) {
            data.chatHistory = [];
          }
        }

        if (data.auth) state.auth = Object.assign(state.auth, data.auth);
        if (data.unlockedPillars) state.unlockedPillars = Object.assign(state.unlockedPillars, data.unlockedPillars);
        if (data.completedPillars) state.completedPillars = Object.assign(state.completedPillars, data.completedPillars);
        if (data.assessmentPhase) state.assessmentPhase = data.assessmentPhase;
        if (data.buildAssessmentStep) state.buildAssessmentStep = data.buildAssessmentStep;
        if (data.protectAssessmentStep) state.protectAssessmentStep = data.protectAssessmentStep;
        if (data.strengthenAssessmentStep) state.strengthenAssessmentStep = data.strengthenAssessmentStep;
        if (data.selectedCoach) state.selectedCoach = data.selectedCoach;
        if (data.exerciseGroup) state.exerciseGroup = data.exerciseGroup;
        if (data.exerciseDurations && typeof data.exerciseDurations === 'object') state.exerciseDurations = data.exerciseDurations;
        if (data.selectedAuditRoom) state.selectedAuditRoom = data.selectedAuditRoom;
        if (data.activeBuildSubTab) state.activeBuildSubTab = data.activeBuildSubTab;
        if (data.userProfile) state.userProfile = Object.assign(state.userProfile, data.userProfile);
        if (data.selectedAssets) state.selectedAssets = data.selectedAssets;
        if (data.protectHomeAuditAnswers) state.protectHomeAuditAnswers = data.protectHomeAuditAnswers;
        if (data.customMealSwaps) state.customMealSwaps = data.customMealSwaps;
        if (data.itemSwaps && typeof data.itemSwaps === 'object') state.itemSwaps = data.itemSwaps;
        if (data.activeExerciseRoutine && data.activeExerciseRoutine.length) {
          state.activeExerciseRoutine = data.activeExerciseRoutine;
        }
        if (typeof data.activeStreakDays === 'number') state.activeStreakDays = data.activeStreakDays;
        if (Array.isArray(data.chatHistory)) state.chatHistory = data.chatHistory;
        if (typeof data.chatLanguage === 'string' && /^[a-z]{2,4}$/.test(data.chatLanguage)) state.chatLanguage = data.chatLanguage;
        if (typeof data.protectBannerDismissed === 'boolean') state.protectBannerDismissed = data.protectBannerDismissed;
        if (data.strengthenMode) state.strengthenMode = data.strengthenMode;
        if (data.strengthenActiveSubTab) state.strengthenActiveSubTab = data.strengthenActiveSubTab;
        if (data.fraxInputs) state.fraxInputs = Object.assign(state.fraxInputs, data.fraxInputs);
        if (data.spineInputs) state.spineInputs = Object.assign(state.spineInputs, data.spineInputs);
        if (Array.isArray(data.scans)) state.scans = data.scans;
        if (Array.isArray(data.labs)) state.labs = data.labs;
        if (Array.isArray(data.meds)) state.meds = data.meds;
        if (data.medTaken && typeof data.medTaken === 'object') state.medTaken = data.medTaken;
        if (data.doctorVisit && typeof data.doctorVisit === 'object') state.doctorVisit = Object.assign({ date: '', questions: [] }, data.doctorVisit);
        migrateOldStrengthenInputs(data);

        if (Array.isArray(data.protectRiskChecked)) {
          state.protectRiskChecked = new Set(data.protectRiskChecked);
        }
        if (Array.isArray(data.strengthenDoctorChecked)) {
          state.strengthenDoctorChecked = new Set(data.strengthenDoctorChecked);
        }

        if (data.checkedDietMilestones) {
          Object.keys(data.checkedDietMilestones).forEach(k => {
            state.checkedDietMilestones[k] = new Set(data.checkedDietMilestones[k]);
          });
        }
        if (data.checkedDietItems && typeof data.checkedDietItems === 'object') {
          state.checkedDietItems = data.checkedDietItems;
        }
        if (data.checkedExerciseMilestones) {
          Object.keys(data.checkedExerciseMilestones).forEach(k => {
            state.checkedExerciseMilestones[k] = new Set(data.checkedExerciseMilestones[k]);
          });
        }
        return true;
      } catch (err) {
        console.warn('BoneDB load error:', err);
        return false;
      }
    },

    exportJSON() {
      try {
        const raw = localStorage.getItem(this.KEY) || JSON.stringify(state);
        const blob = new Blob([raw], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bone_sip_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        playSound('success');
        showToast('📁 Database backup downloaded successfully!', 'fa-database');
      } catch (e) {
        showToast('Export failed', 'fa-triangle-exclamation');
      }
    },

    reset() {
      try {
        localStorage.removeItem(this.KEY);
        localStorage.removeItem('BONE_SIP_PRODUCTION_DB_V2');
        playSound('tap');
        showToast('Database reset. Reloading platform...', 'fa-rotate-right');
        setTimeout(() => window.location.reload(), 800);
      } catch (e) {}
    }
  };

  function calculateBMI() {
    const h = (state.userProfile.heightCm || 165) / 100;
    const w = state.userProfile.weightKg || 62;
    const bmi = (w / (h * h)).toFixed(1);
    state.userProfile.bmi = parseFloat(bmi);
    return bmi;
  }

  function formatRegionName(reg) {
    const map = {
      north: 'North Indian',
      south: 'South Indian',
      west: 'West Indian',
      east: 'East Indian',
      continental: 'Global / Continental'
    };
    return map[reg] || 'Regional';
  }

  function formatDietName(d) {
    const map = {
      veg: 'Vegetarian',
      eggetarian: 'Eggetarian',
      non_veg: 'Non-Vegetarian',
      vegan: 'Vegan'
    };
    return map[d] || 'Healthy';
  }

  // --------------------------------------------------------------------------
  // MODULE: ACCOUNT, CLOUD SAVE & HISTORY
  // --------------------------------------------------------------------------
  // On our server (server/accounts.js) the phone login is real: the user's data
  // and one record per day (meals eaten, moves done) are saved to their account,
  // so they come back on any phone. On hosting without the accounts API (static
  // sites, file://) the app falls back to the on-device demo login.
  const PENDING_DAYS_KEY = 'bonesip_pending_days';
  const cloud = { timer: null, syncing: false, fullUpload: false, testCode: '', warnedExpired: false };

  function accountsApi() {
    const cfg = window.BONE_SIP_CONFIG || {};
    return typeof location !== 'undefined' && /^https?:$/.test(location.protocol) && cfg.accountsApi ? String(cfg.accountsApi).replace(/\/$/, '') : '';
  }

  async function apiCall(method, path, body) {
    const res = await fetch(accountsApi() + path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
    let json = {};
    try { json = await res.json(); } catch (e) { /* empty body */ }
    return { status: res.status, ok: res.ok, json };
  }

  function isCloudUser() {
    return !!(state.auth && state.auth.isVerified && state.auth.cloud && accountsApi());
  }

  function isLoggedIn() {
    const hasVerified = !!(state.auth && state.auth.isVerified);
    const phone = (state.auth && state.auth.phone) || (state.userProfile && state.userProfile.phone) || '';
    const hasValidPhone = /^[6-9]\d{9}$/.test(phone);
    return (hasVerified && hasValidPhone) || (hasValidPhone && state.auth && state.auth.cloud) || hasVerified;
  }

  function loggedInPhone() {
    const phone = (state.auth && state.auth.phone) || (state.userProfile && state.userProfile.phone) || '';
    return /^[6-9]\d{9}$/.test(phone) ? phone : '';
  }

  function readPendingDays() {
    try { return new Set(JSON.parse(localStorage.getItem(PENDING_DAYS_KEY) || '[]')); } catch (e) { return new Set(); }
  }

  function writePendingDays(set) {
    try { localStorage.setItem(PENDING_DAYS_KEY, JSON.stringify(Array.from(set).slice(-200))); } catch (e) { /* storage full */ }
  }

  // Remembers that a day changed so its record is sent even if the date rolls over first.
  function markDayForSync(day) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return;
    const set = readPendingDays();
    set.add(day);
    writePendingDays(set);
  }

  // The day's planned moves: one per group, rotating by date (same rule as todaysMix).
  function movesPlannedFor(iso) {
    const dayNumber = Math.floor(new Date(`${iso}T00:00:00`).getTime() / 86400000);
    return (BONE_SIP_DATA.exerciseGroups || []).map(g => {
      const list = workoutLib().filter(e => e.group === g.id);
      return list.length ? list[dayNumber % list.length] : null;
    }).filter(Boolean);
  }

  // One day's record: what was planned and eaten, which moves were done.
  function dayLogFor(day) {
    const dietSet = state.checkedDietMilestones[day] instanceof Set ? state.checkedDietMilestones[day] : new Set(state.checkedDietMilestones[day] || []);
    const exSet = state.checkedExerciseMilestones[day] instanceof Set ? state.checkedExerciseMilestones[day] : new Set(state.checkedExerciseMilestones[day] || []);
    const meals = resolveDailyMilestones(day, null).map(m => ({ slot: m.id, name: (m.meal && m.meal.name) || m.slot, done: dietSet.has(m.id) }));
    const lib = workoutLib();
    const moves = Array.from(exSet).map(id => ({ id, name: (lib.find(e => e.id === id) || {}).name || id, done: true }));
    const target = getDailyExerciseTarget();
    movesPlannedFor(day).forEach(ex => {
      if (moves.length < target && !exSet.has(ex.id)) moves.push({ id: ex.id, name: ex.name, done: false });
    });
    return { day, meals, moves, score: calculateDailyScore100(day).total };
  }

  function localDataDays() {
    const days = new Set();
    ['checkedDietMilestones', 'checkedExerciseMilestones'].forEach(k => {
      Object.keys(state[k] || {}).forEach(d => {
        const v = state[k][d];
        if (/^\d{4}-\d{2}-\d{2}$/.test(d) && v && (v.size || v.length)) days.add(d);
      });
    });
    return days;
  }

  function scheduleCloudSync(delay = 2500) {
    if (!isCloudUser()) return;
    clearTimeout(cloud.timer);
    cloud.timer = setTimeout(syncToCloud, delay);
  }

  async function syncToCloud() {
    if (!isCloudUser() || cloud.syncing || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
    cloud.syncing = true;
    const today = getTodayISODate();
    const pending = readPendingDays();
    const days = new Set(pending);
    days.add(today);
    if (cloud.fullUpload) localDataDays().forEach(d => days.add(d));
    const list = Array.from(days).filter(d => d <= today).sort().slice(-120);
    try {
      const saved = await apiCall('PUT', '/me/state', { data: BoneDB.payload() });
      if (saved.status === 401) { cloudSessionEnded(); return; }
      const sent = await apiCall('PUT', '/me/days', { days: list.map(dayLogFor) });
      if (saved.ok && sent.ok) {
        const left = readPendingDays();
        list.forEach(d => left.delete(d));
        writePendingDays(left);
        cloud.fullUpload = false;
      }
    } catch (err) {
      // Offline or server busy: the pending days stay queued for the next try.
    } finally {
      cloud.syncing = false;
    }
  }

  function cloudSessionEnded() {
    if (state.auth) state.auth.cloud = false;
    try { localStorage.setItem(BoneDB.KEY, JSON.stringify(BoneDB.payload())); } catch (e) { /* ignore */ }
    updateHeaderProfileBadge();
    if (!cloud.warnedExpired) {
      cloud.warnedExpired = true;
      showToast(t('Please log in again to keep saving to your account'), 'fa-circle-info');
    }
  }

  // A returning user logged in on this phone: take their saved account data,
  // keeping any ticks made here before logging in.
  function adoptCloudState(remote) {
    const local = BoneDB.payload();
    const merged = Object.assign({}, remote);
    ['checkedDietMilestones', 'checkedExerciseMilestones'].forEach(k => {
      const out = Object.assign({}, remote[k] || {});
      Object.entries(local[k] || {}).forEach(([day, ids]) => {
        out[day] = Array.from(new Set([].concat(out[day] || [], ids || [])));
      });
      merged[k] = out;
    });
    merged.auth = Object.assign({}, state.auth);
    merged.chatHistory = local.chatHistory;
    localStorage.setItem(BoneDB.KEY, JSON.stringify(merged));
    BoneDB.load();
    updateActiveStreak();
    calculateBMI();
    renderPillarBottomNav();
    updateHeaderProfileBadge();
    syncCoachToggle();
  }

  // Login for someone who already has an account (new phone, after logging out…).
  function openLogin() {
    playSound('tap');
    const tour = document.getElementById('appOnboardingOverlay');
    const splash = document.getElementById('appSplashScreen');
    if (splash) splash.classList.add('dismissed');
    if (tour && tour.style.display !== 'none') {
      tour.classList.add('dismissed');
      setTimeout(() => { tour.style.display = 'none'; }, 400);
    }
    const profileModal = document.getElementById('userProfileModal');
    if (profileModal) profileModal.style.display = 'none';
    state.authMode = 'login';
    setAuthCopy();
    showView('auth');
    showAuthPhoneStep();
    const input = document.getElementById('inlineMobileNumberInput');
    if (input && !input.value) input.value = state.auth.phone || state.userProfile.phone || '';
  }

  function cancelLogin() {
    playSound('tap');
    state.authMode = 'save';
    if (hasExistingJourney()) resumeJourney();
    else {
      showView('assessment');
      renderAssessmentStage();
    }
  }

  function changeAuthPhone() {
    playSound('tap');
    showAuthPhoneStep();
  }

  function handleAuthBack() {
    const otpStep = document.getElementById('inlineAuthOtpStep');
    if (otpStep && otpStep.style.display !== 'none') {
      changeAuthPhone();
      return;
    }
    if (state.authMode === 'login') {
      cancelLogin();
    }
  }

  function setAuthCopy() {
    const login = state.authMode === 'login';
    const chip = document.getElementById('authStepChip');
    const title = document.getElementById('authTitle');
    const sub = document.getElementById('authSub');
    const back = document.getElementById('authBackBtn');
    if (chip) chip.hidden = login;
    if (back) back.hidden = !login;
    if (title) title.textContent = login ? t('Welcome back') : t('Save your plan');
    if (sub) sub.textContent = login ? t('Log in with your mobile number to get your plan and history back.') : t('Verify your mobile to keep your progress and unlock Protect.');
  }

  function showAuthPhoneStep() {
    const phoneStep = document.getElementById('inlineAuthPhoneStep');
    const otpStep = document.getElementById('inlineAuthOtpStep');
    if (phoneStep) phoneStep.style.display = 'block';
    if (otpStep) otpStep.style.display = 'none';
    const back = document.getElementById('authBackBtn');
    if (back) back.hidden = state.authMode !== 'login';
    const input = document.getElementById('inlineMobileNumberInput');
    if (input) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 150);
    }
  }

  async function logout() {
    playSound('tap');
    if (!confirm(t('Log out of this phone? Your data stays safe in your account.'))) return;
    clearTimeout(cloud.timer);
    if (isCloudUser()) {
      try { await syncToCloud(); } catch (e) { /* ignore */ }
      try { await apiCall('POST', '/auth/logout', {}); } catch (e) { /* offline: the session just expires */ }
    }
    state.auth.isVerified = false;
    state.auth.phone = '';
    state.auth.cloud = false;
    state.userProfile.phone = '';
    clearLocalAccountData();
    showToast(t('Logged out'), 'fa-right-from-bracket');
    setTimeout(() => window.location.reload(), 600);
  }

  async function deleteAccount() {
    playSound('tap');
    if (!confirm(t('Delete your account and all your saved data? This cannot be undone.'))) return;
    let r;
    try { r = await apiCall('DELETE', '/me'); } catch (e) { r = { ok: false }; }
    if (!r.ok) {
      showToast(t('Could not delete right now. Please check your internet and try again.'), 'fa-triangle-exclamation');
      return;
    }
    clearLocalAccountData();
    showToast(t('Your account has been deleted'), 'fa-circle-check');
    setTimeout(() => window.location.reload(), 900);
  }

  function clearLocalAccountData() {
    try {
      localStorage.removeItem(BoneDB.KEY);
      localStorage.removeItem('BONE_SIP_PRODUCTION_DB_V2');
      localStorage.removeItem(PENDING_DAYS_KEY);
    } catch (e) { /* ignore */ }
  }

  // ---------------- My history: month calendar of past days ----------------
  const historyView = { month: '', selected: '', remote: {}, loading: false };

  function openHistoryModal() {
    playSound('tap');
    const today = getTodayISODate();
    historyView.month = today.slice(0, 7);
    historyView.selected = today;
    const modal = document.getElementById('historyModal');
    if (modal) modal.style.display = 'flex';
    renderHistory();
    loadHistoryMonth();
  }

  function closeHistoryModal() {
    playSound('tap');
    const modal = document.getElementById('historyModal');
    if (modal) modal.style.display = 'none';
  }

  function historyMonthBounds(month) {
    const [y, m] = month.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}`, days: last, firstWeekday: (new Date(y, m - 1, 1).getDay() + 6) % 7 };
  }

  async function loadHistoryMonth() {
    if (!isCloudUser()) return;
    const { from, to } = historyMonthBounds(historyView.month);
    const today = getTodayISODate();
    historyView.loading = true;
    renderHistory();
    try {
      const r = await apiCall('GET', `/me/days?from=${from}&to=${to < today ? to : today}`);
      if (r.status === 401) cloudSessionEnded();
      if (r.ok) (r.json.days || []).forEach(d => { historyView.remote[d.day] = d; });
    } catch (e) { /* offline: show what this phone has */ }
    historyView.loading = false;
    renderHistory();
  }

  function shiftHistoryMonth(delta) {
    playSound('tap');
    const [y, m] = historyView.month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (next > getTodayISODate().slice(0, 7)) return;
    historyView.month = next;
    const { to } = historyMonthBounds(next);
    historyView.selected = to < getTodayISODate() ? to : getTodayISODate();
    renderHistory();
    loadHistoryMonth();
  }

  function selectHistoryDay(day) {
    playSound('tap');
    historyView.selected = day;
    renderHistory();
  }

  function historyStartDay() {
    const local = Array.from(localDataDays()).sort()[0];
    const joined = state.auth.createdAt ? toISODate(new Date(state.auth.createdAt)) : '';
    const remote = Object.keys(historyView.remote).sort()[0];
    return [local, joined, remote].filter(Boolean).sort()[0] || getTodayISODate();
  }

  // Server records win for past days (they hold what was planned that day); today is always live.
  function historyDay(day) {
    const today = getTodayISODate();
    if (day > today) return { status: 'future' };
    let rec = day !== today && historyView.remote[day];
    if (!rec) {
      if (day !== today && !localDataDays().has(day)) {
        return { status: day < historyStartDay() ? 'none' : 'missed', meals: [], moves: [] };
      }
      const log = dayLogFor(day);
      rec = { meals: log.meals, moves: log.moves, score: log.score };
    }
    const dietDone = rec.meals.filter(m => m.done).length;
    const movesDone = rec.moves.filter(m => m.done).length;
    const allDone = rec.meals.length && dietDone >= rec.meals.length && movesDone >= rec.moves.length;
    return {
      status: allDone ? 'complete' : (dietDone || movesDone ? 'partial' : (day === today ? 'today' : 'missed')),
      meals: rec.meals, moves: rec.moves, score: rec.score || 0, dietDone, movesDone
    };
  }

  function renderHistory() {
    const body = document.getElementById('historyBody');
    if (!body) return;
    const { from, days, firstWeekday } = historyMonthBounds(historyView.month);
    const today = getTodayISODate();
    const monthLabel = I18N.date(new Date(`${from}T00:00:00`), { month: 'long', year: 'numeric' });
    const isCurrent = historyView.month === today.slice(0, 7);

    let complete = 0, partial = 0, missed = 0, dietDays = 0, movesDays = 0, counted = 0;
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push('<span class="hx-cell empty"></span>');
    for (let n = 1; n <= days; n++) {
      const day = `${historyView.month}-${String(n).padStart(2, '0')}`;
      const info = historyDay(day);
      if (['complete', 'partial', 'missed'].includes(info.status)) {
        counted++;
        if (info.status === 'complete') complete++;
        else if (info.status === 'partial') partial++;
        else missed++;
        if (info.meals.length && info.dietDone >= info.meals.length) dietDays++;
        if (info.moves.length && info.movesDone >= info.moves.length) movesDays++;
      }
      const clickable = info.status !== 'future' && info.status !== 'none';
      cells.push(`<button type="button" class="hx-cell ${info.status}${day === today ? ' is-today' : ''}${day === historyView.selected ? ' selected' : ''}" ${clickable ? `onclick="BoneApp.selectHistoryDay('${day}')"` : 'disabled'} aria-label="${escapeHtml(I18N.date(new Date(`${day}T00:00:00`), { day: 'numeric', month: 'long' }))}">${n}</button>`);
    }
    const weekLetters = Array.from({ length: 7 }, (_, i) => I18N.date(new Date(2024, 0, 1 + i), { weekday: 'narrow' }));

    const sel = historyDay(historyView.selected);
    const selLabel = I18N.date(new Date(`${historyView.selected}T00:00:00`), { weekday: 'long', day: 'numeric', month: 'long' });
    const statusChip = {
      complete: ['✅', t('Routine done')], partial: ['🌗', t('Partly done')], missed: ['⚪', t('Missed')], today: ['🕒', t('Not started yet')]
    }[sel.status] || ['⚪', t('Missed')];
    const listHtml = (items, emptyText) => items.length ? items.map(it => `
      <li class="${it.done ? 'done' : ''}"><span class="hx-tick">${it.done ? '<i class="fa-solid fa-check"></i>' : ''}</span>${escapeHtml(tr(it.name))}</li>`).join('') : `<li class="hx-empty">${emptyText}</li>`;

    body.innerHTML = `
      <div class="hx-month">
        <button type="button" class="cal-nav-btn" onclick="BoneApp.shiftHistoryMonth(-1)" aria-label="${escapeHtml(t('Previous month'))}"><i class="fa-solid fa-chevron-left"></i></button>
        <b>${monthLabel}</b>
        <button type="button" class="cal-nav-btn" onclick="BoneApp.shiftHistoryMonth(1)" ${isCurrent ? 'disabled' : ''} aria-label="${escapeHtml(t('Next month'))}"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="hx-stats">
        <div><b>${complete}</b><span>${t('Routine done')}</span></div>
        <div><b>${dietDays}</b><span>${t('All meals')}</span></div>
        <div><b>${movesDays}</b><span>${t('All moves')}</span></div>
      </div>
      <div class="hx-grid" role="group" aria-label="${escapeHtml(monthLabel)}">
        ${weekLetters.map(l => `<span class="hx-wd">${l}</span>`).join('')}
        ${cells.join('')}
      </div>
      <div class="hx-legend">
        <span><i class="complete"></i>${t('Routine done')}</span>
        <span><i class="partial"></i>${t('Partly done')}</span>
        <span><i class="missed"></i>${t('Missed')}</span>
      </div>
      ${historyView.loading ? `<p class="hx-note"><i class="fa-solid fa-spinner fa-spin"></i> ${t('Loading your history…')}</p>` : ''}
      <div class="hx-detail">
        <div class="hx-detail-head">
          <b>${selLabel}</b>
          <span class="hx-chip ${sel.status}">${statusChip[0]} ${statusChip[1]}</span>
        </div>
        <h5>🥗 ${t('Meals')} <em>${sel.dietDone || 0}/${(sel.meals || []).length}</em></h5>
        <ul class="hx-list">${listHtml(sel.meals || [], t('Nothing recorded'))}</ul>
        <h5>💪 ${t('Moves')} <em>${sel.movesDone || 0}/${(sel.moves || []).length}</em></h5>
        <ul class="hx-list">${listHtml(sel.moves || [], t('Nothing recorded'))}</ul>
      </div>
      ${isCloudUser() ? '' : `
        <div class="hx-guest">
          <span>🔒</span>
          <div><b>${t('Keep your history safe')}</b><span>${t('Log in so your history is saved to your account and works on any phone.')}</span></div>
          <button type="button" class="btn btn-sm btn-outline" onclick="BoneApp.closeHistoryModal(); BoneApp.openLogin()">${t('Log in')}</button>
        </div>`}
    `;
  }

  function getCheckedItemIndices(dateKey, slotId, totalItems) {
    if (state.checkedDietItems && state.checkedDietItems[dateKey] && Array.isArray(state.checkedDietItems[dateKey][slotId])) {
      return state.checkedDietItems[dateKey][slotId];
    }
    const dietSet = state.checkedDietMilestones[dateKey] || new Set();
    if (dietSet.has(slotId)) {
      const allIndices = [];
      for (let i = 0; i < (totalItems || 1); i++) allIndices.push(i);
      return allIndices;
    }
    return [];
  }

  // --------------------------------------------------------------------------
  // MODULE: DAILY BONE HEALTH SCORE ENGINE (0 TO 100)
  // --------------------------------------------------------------------------
  function calculateDailyScore100(dateKey) {
    const todayISO = getTodayISODate();
    const effectiveKey = dateKey || state.selectedCalendarDate || todayISO;

    // 1. Diet Milestones (5 items * 8 pts = 40 pts, proportional by item)
    const dayMilestones = resolveDailyMilestones(effectiveKey, null)
      .sort((a, b) => SLOT_ORDER.indexOf(a.id) - SLOT_ORDER.indexOf(b.id));
    let dietPts = 0;
    const dietSet = state.checkedDietMilestones[effectiveKey] || new Set();
    dayMilestones.forEach(m => {
      const items = m.meal.items || splitMealComponents(m.meal);
      const totalItems = Math.max(1, items.length);
      const checked = getCheckedItemIndices(effectiveKey, m.id, totalItems);
      dietPts += (checked.length / totalItems) * 8;
    });
    dietPts = Math.min(40, Math.round(dietPts));

    // 2. Exercise Milestones (4 movements * 7.5 pts = 30 pts)
    const exSet = state.checkedExerciseMilestones[effectiveKey] || new Set();
    const activeExCount = getDailyExerciseTarget();
    const checkedExCount = Math.min(activeExCount, exSet.size);
    const exPts = Math.round((checkedExCount / activeExCount) * 30); // Max 30

    // 3. Fall Precautions & D3 Sunlight Milestone (Max 20 pts)
    let safeRoomsCount = 0;
    const rooms = BONE_SIP_DATA.protectHomeAuditRooms || [];
    rooms.forEach(r => {
      const roomAns = state.protectHomeAuditAnswers[r.id] || {};
      const yesCount = Object.values(roomAns).filter(v => v === 'yes').length;
      if (yesCount >= 1) safeRoomsCount++;
    });
    const homeAuditPts = Math.min(10, Math.round((safeRoomsCount / Math.max(1, rooms.length)) * 10));
    const sunItems = getCheckedItemIndices(effectiveKey, 'm_sun_d3', 2);
    const d3Done = dietSet.has('m_sun_d3') ? 10 : (sunItems.length > 0 ? Math.round((sunItems.length / 2) * 10) : 0);
    const safePts = Math.min(20, homeAuditPts + d3Done); // Max 20

    // 4. Continuous Streak Bonus (Max 10 pts)
    const streakBonus = Math.min(10, (state.activeStreakDays || 0) * 2);

    const total = Math.min(100, dietPts + exPts + safePts + streakBonus);

    let tier = 'Building Baseline';
    let badgeClass = 'badge-gold';
    if (total >= 85) {
      tier = 'Elite Bone Investor';
      badgeClass = 'badge-green';
    } else if (total >= 60) {
      tier = 'Active Capital Builder';
      badgeClass = 'badge-blue';
    } else if (total >= 40) {
      tier = 'Steady Depositor';
      badgeClass = 'badge-gold';
    }

    return {
      total,
      dietPts,
      exPts,
      safePts,
      streakPts: streakBonus,
      tier,
      badgeClass
    };
  }

  // --------------------------------------------------------------------------
  // MODULE: RESOLVE 5 DAILY DIET MILESTONES WITH 100+ CATALOG & CUSTOM SWAPS
  // --------------------------------------------------------------------------
  // ---------------- Meal items: "Bajra Bhakri + Methi Pithla" → two swappable items ----------------
  const SLOT_TYPE = { m_breakfast: 'breakfast', m_lunch: 'lunch', m_snack: 'snack', m_dinner: 'dinner', m_sun_d3: 'sun_d3' };

  function splitMealComponents(meal) {
    const raw = String((meal && meal.name) || '').split('+').map(x => x.trim()).filter(Boolean);
    const parts = raw.length ? raw : ['Meal'];
    const n = parts.length;
    return parts.map(text => {
      const m = text.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      return {
        name: (m ? m[1] : text).trim(),
        portion: m ? m[2].trim() : '',
        calcium: Math.round(((meal && meal.calcium) || 0) / n),
        protein: Math.round(((meal && meal.protein) || 0) / n)
      };
    });
  }

  function applyItemSwaps(dateKey, slotId, meal) {
    if (!state.itemSwaps) state.itemSwaps = {};
    const swaps = (state.itemSwaps[dateKey] && state.itemSwaps[dateKey][slotId]) || {};
    const items = splitMealComponents(meal).map((c, i) => (swaps[i] ? Object.assign({}, swaps[i], { swapped: true }) : c));
    const anySwapped = items.some(c => c.swapped);
    return Object.assign({}, meal, {
      items,
      name: anySwapped ? items.map(c => (c.portion ? `${c.name} (${c.portion})` : c.name)).join(' + ') : meal.name,
      calcium: anySwapped ? items.reduce((a, c) => a + (c.calcium || 0), 0) : meal.calcium,
      protein: anySwapped ? items.reduce((a, c) => a + (c.protein || 0), 0) : meal.protein
    });
  }

  function clearItemSwaps(dateKey, slotId) {
    if (state.itemSwaps && state.itemSwaps[dateKey]) delete state.itemSwaps[dateKey][slotId];
  }

  function dietAllows(userDiet, itemDiet) {
    const allowed = {
      vegan: ['vegan'],
      veg: ['veg', 'vegan'],
      eggetarian: ['veg', 'vegan', 'eggetarian'],
      non_veg: ['veg', 'vegan', 'eggetarian', 'non_veg']
    };
    return (allowed[userDiet] || allowed.veg).includes(itemDiet);
  }

  // A short, friendly label for a food item (keyword-based, indicative only).
  function itemBenefit(name) {
    const lower = String(name).toLowerCase();
    const has = words => words.some(w => lower.includes(w));
    if (has(['sun', 'sunlight'])) return { text: 'Vitamin D boost', tag: 'Vitamin D', icon: 'fa-sun' };
    if (has(['ragi', 'milk', 'paneer', 'curd', 'dahi', 'til', 'sesame', 'cheese', 'tofu', 'chhena', 'yogurt', 'yoghurt', 'makhana', 'almond', 'raita', 'chaas', 'buttermilk', 'lassi'])) return { text: 'Calcium rich', tag: 'High calcium', icon: 'fa-bone' };
    if (has(['dal', 'egg', 'chicken', 'fish', 'sprout', 'chana', 'moong', 'rajma', 'soy', 'besan', 'sattu', 'matki', 'usal', 'peanut', 'lentil', 'pithla', 'sundal'])) return { text: 'High protein', tag: 'High protein', icon: 'fa-dumbbell' };
    if (has(['palak', 'spinach', 'methi', 'saag', 'greens', 'broccoli', 'moringa', 'drumstick', 'salad', 'amla', 'guava', 'lemon', 'fruit'])) return { text: 'Vitamins & minerals', tag: 'Greens', icon: 'fa-leaf' };
    if (has(['water', 'jeera', 'soup', 'rasam'])) return { text: 'Hydrating', tag: 'Hydration', icon: 'fa-droplet' };
    return { text: 'Gut friendly', tag: 'High fibre', icon: 'fa-heart' };
  }

  function itemOptionsFor(slotId, excludeName) {
    const slotType = SLOT_TYPE[slotId] || 'breakfast';
    const userReg = state.userProfile.regionalFood || 'north';
    const userDiet = state.userProfile.diet || 'veg';
    const seen = new Set([String(excludeName || '').toLowerCase()]);
    const out = [];
    (BONE_SIP_DATA.fullDietCatalog || [])
      .filter(m => m.slot === slotType && dietAllows(userDiet, m.diet))
      .forEach(m => splitMealComponents(m).forEach(c => {
        const key = c.name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push(Object.assign(c, { region: m.region }));
      }));
    return out.sort((a, b) => ((b.region === userReg) - (a.region === userReg)) || (b.calcium - a.calcium));
  }

  function getMealMetabolicScore(meal, conditions, userDiet, userReg) {
    let score = 0;
    if (meal.region === userReg) score += 60;
    if (meal.diet === userDiet) score += 25;

    const activeConditions = (conditions || []).filter(c => c && c !== 'none');
    if (!activeConditions.length) {
      return score + (meal.calcium || 0) / 10;
    }

    const text = `${meal.name || ''} ${meal.desc || ''} ${(meal.conditions || []).join(' ')}`.toLowerCase();

    activeConditions.forEach(cond => {
      if (meal.conditions && meal.conditions.includes(cond)) {
        score += 35;
      }
      if (cond === 'diabetes') {
        if (/ragi|jowar|bajra|oats|quinoa|methi|fenugreek|palak|spinach|moong|chana|sprout|tofu|besan|chilla|egg|fish|chicken/i.test(text)) score += 20;
        if (/sugar|jaggery|sweet|kheer|payasam|chikki|honey|ladoo|halwa|syrup/i.test(text)) score -= 50;
      }
      if (cond === 'hypertension') {
        if (/drumstick|moringa|curd|chaas|buttermilk|spinach|palak|sesame|til|makhana|cucumber|salad|steamed|idli|pesarattu|potassium/i.test(text)) score += 20;
        if (/papad|pickle|salted butter|deep fried|nihari/i.test(text)) score -= 35;
      }
      if (cond === 'obesity') {
        if (/sprout|boiled egg|egg white|tofu|grilled|steamed|chilla|salad|chaas|clear|dalma|besan|cucumber/i.test(text)) score += 20;
        if (/cream|butter|malai|fried|puris|pakora|rich|ladoo/i.test(text)) score -= 35;
      }
      if (cond === 'dyslipidemia') {
        if (/oats|chia|flax|walnut|almond|fish|salmon|sardine|rohu|methi|steamed|trout/i.test(text)) score += 20;
        if (/mutton|nalli|nihari|full cream|butter|tallow|deep fried/i.test(text)) score -= 40;
      }
      if (cond === 'thyroid') {
        if (/almond|seed|egg|fish|mushroom|cooked|phulka|saag|selenium|zinc/i.test(text)) score += 15;
      }
      if (cond === 'kidney') {
        if (/bottle gourd|lauki|cucumber|steamed rice|mild|khichdi|moong/i.test(text)) score += 20;
        if (/nihari|high protein|mutton|processed cheese|purine/i.test(text)) score -= 35;
      }
      if (cond === 'lactose_intolerance') {
        if (/tofu|soymilk|soy|ragi|sesame|til|leafy|moringa|sattu|chana|dalma/i.test(text) && !/paneer|curd|dahi|milk|chaas|buttermilk|cheese|ghee|kheer/i.test(text)) score += 35;
        if (/paneer|curd|dahi|milk|chaas|buttermilk|cheese|malai|kheer|kadhi/i.test(text)) score -= 45;
      }
      if (cond === 'nuts_allergy') {
        if (/sesame|til|pumpkin|sunflower|sprout|tofu|chana|dal|moong|sattu/i.test(text) && !/almond|badam|peanut|mungfali|cashew|kaju|walnut|akhrot|pista|nut/i.test(text)) score += 30;
        if (/almond|badam|peanut|mungfali|cashew|kaju|walnut|akhrot|pista/i.test(text)) score -= 60;
      }
    });

    score += Math.min(25, (meal.calcium || 0) / 20);
    return score;
  }

  function getClinicalMealNote(meal, conditions) {
    const active = (conditions || []).filter(c => c && c !== 'none');
    if (!active.length) return null;
    const text = `${meal.name || ''} ${meal.desc || ''}`.toLowerCase();
    const notes = [];
    if (active.includes('diabetes')) {
      if (/ragi|jowar|bajra|oats|besan|chilla|moong|tofu/i.test(text)) {
        notes.push('Low GI complex grain for glycemic stability');
      } else {
        notes.push('Diabetic-friendly portion: monitor glycemic load');
      }
    }
    if (active.includes('hypertension')) {
      notes.push('DASH-aligned / low-sodium & potassium-rich');
    }
    if (active.includes('obesity')) {
      notes.push('High protein-to-calorie density for muscle retention');
    }
    if (active.includes('dyslipidemia')) {
      notes.push('Heart-healthy fats & soluble fiber support');
    }
    if (active.includes('thyroid')) {
      notes.push('Mineral rich (space 4h from thyroid medication)');
    }
    if (active.includes('kidney')) {
      notes.push('Renal-balanced mineral filtration profile');
    }
    if (active.includes('lactose_intolerance')) {
      if (/paneer|curd|dahi|milk|chaas|cheese|kheer/i.test(text)) {
        notes.push('Contains dairy (choose lactose-free alternative)');
      } else {
        notes.push('100% Lactose-free plant calcium & protein');
      }
    }
    if (active.includes('nuts_allergy')) {
      if (/peanut|almond|cashew|walnut|pista/i.test(text)) {
        notes.push('Contains nuts (swap with roasted sesame/seeds)');
      } else {
        notes.push('Nut-free mineral & protein safe source');
      }
    }
    return notes.slice(0, 2).join(' · ');
  }

  function renderClinicalDietGuidance(userConditions, userDiet, userReg) {
    const active = (userConditions || []).filter(c => c && c !== 'none');
    if (!active.length) return '';

    const condNames = active.map(c => {
      const opt = (BONE_SIP_DATA.healthConditionOptions || []).find(o => o.id === c);
      return opt ? opt.title : c;
    });

    const tips = [];
    if (active.includes('diabetes')) {
      tips.push({
        icon: 'fa-chart-line',
        title: 'Glycemic & Collagen Health',
        desc: 'Prioritize low-GI millets (Ragi, Jowar) & sprouted pulses. Preventing sugar spikes preserves bone collagen flexibility.'
      });
    }
    if (active.includes('hypertension')) {
      tips.push({
        icon: 'fa-heart-pulse',
        title: 'Low Sodium & DASH Balance',
        desc: 'Keep daily sodium low. High salt causes renal calcium excretion (hypercalciuria); potassium in moringa & curd protects your bones.'
      });
    }
    if (active.includes('obesity')) {
      tips.push({
        icon: 'fa-weight-scale',
        title: 'Lean Protein & Satiety',
        desc: 'Aim for 1.0–1.2g protein/kg from steamed/grilled sources (sprouts, tofu, egg whites, fish) to maintain bone & muscle scaffolding.'
      });
    }
    if (active.includes('dyslipidemia')) {
      tips.push({
        icon: 'fa-shield-halved',
        title: 'Lipid Health & Soluble Fiber',
        desc: 'Emphasize Omega-3 fatty acids and soluble beta-glucans (oats, flaxseeds, methi). Lowers osteoclast inflammatory signaling.'
      });
    }
    if (active.includes('thyroid')) {
      tips.push({
        icon: 'fa-clock',
        title: 'Critical 4-Hour Calcium Spacing',
        desc: 'Take thyroid medicine with plain water on an empty stomach. Wait AT LEAST 4 HOURS before having milk, curd, paneer, or calcium supplements.'
      });
    }
    if (active.includes('kidney')) {
      tips.push({
        icon: 'fa-droplet',
        title: 'Renal-Mineral Equilibrium',
        desc: 'Balanced moderate protein with monitored phosphorus & potassium. Protects renal filtration while maintaining bone density.'
      });
    }
    if (active.includes('lactose_intolerance')) {
      tips.push({
        icon: 'fa-ban',
        title: 'Lactose-Free & Plant Calcium',
        desc: 'Meet calcium goals with fortified plant milks (soy, almond, oat), tofu, ragi, sesame seeds (til), and dark leafy greens without gut distress.'
      });
    }
    if (active.includes('nuts_allergy')) {
      tips.push({
        icon: 'fa-seedling',
        title: 'Nut-Free Seeds & Legumes',
        desc: 'Swap nuts for pumpkin seeds, sunflower seeds, white sesame (til), roasted chana, and pulses to get concentrated magnesium, zinc, and protein safely.'
      });
    }
    if (active.includes('fracture')) {
      tips.push({
        icon: 'fa-bone',
        title: 'Fracture Recovery & Mineralization',
        desc: 'Target 1,200 mg daily calcium paired with Vitamin D3 and gentle bone-loading movements to accelerate trabecular bone remodeling.'
      });
    }

    return `
      <div class="clinical-diet-banner fade-up" role="region" aria-label="${t('Clinical Guidance')}">
        <div class="cdb-header">
          <div class="cdb-badge"><i class="fa-solid fa-stethoscope"></i> ${t('Clinical Guidance')}</div>
          <div class="cdb-conditions">
            ${condNames.map(cn => `<span class="cdb-cond-chip">${escapeHtml(t(cn))}</span>`).join('')}
          </div>
        </div>
        <div class="cdb-title">${t('Personalized for {region}', { region: formatRegionName(userReg) })} · ${formatDietName(userDiet)}</div>
        <div class="cdb-desc">${t('Diet tailored to your selected metabolic profile to optimize bone mineralization while supporting overall systemic health.')}</div>
        <div class="cdb-tips-grid">
          ${tips.map(tItem => `
            <div class="cdb-tip-item">
              <i class="fa-solid ${tItem.icon}"></i>
              <div>
                <b>${escapeHtml(t(tItem.title))}</b>
                <span>${escapeHtml(t(tItem.desc))}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function dismissProtectBanner() {
    playSound('tap');
    state.protectBannerDismissed = true;
    const banner = document.getElementById('protectSuggestionBannerContainer');
    if (banner) banner.innerHTML = '';
    BoneDB.save();
  }

  function renderProtectSuggestionBanner() {
    const container = document.getElementById('protectSuggestionBannerContainer');
    if (!container) return;
    if (!state.unlockedPillars.protect || state.completedPillars.protect || state.protectBannerDismissed) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `
      <div class="protect-suggestion-card fade-up" role="region" aria-label="${t('Protect Precaution Suggestion')}">
        <div class="psc-top">
          <div class="psc-badge"><img src="${ICON_BASE}shield.webp" alt="" width="20" height="20"> <span>${t('Precaution & Fall Safety')}</span></div>
          <button class="psc-close-btn" onclick="BoneApp.dismissProtectBanner()" aria-label="${t('Dismiss')}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="psc-content">
          <div class="psc-text">
            <h4 class="psc-title">${t('Protect is unlocked: Guard your bones from falls')}</h4>
            <p class="psc-desc">${t('95% of hip fractures result from standing falls. Complete your quick 2-minute Fall Risk & Home Safety check whenever you are ready.')}</p>
          </div>
          <div class="psc-actions">
            <button class="cta-btn psc-cta" onclick="BoneApp.navigatePillar('protect')">
              ${t('Check fall risk')} <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="psc-later" onclick="BoneApp.dismissProtectBanner()">
              ${t('Later')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function resolveDailyMilestones(dateKey, dayData) {
    const slots = [
      { id: 'm_breakfast', slotId: 'breakfast', slotName: 'Breakfast Milestone', time: '07:30 AM' },
      { id: 'm_lunch', slotId: 'lunch', slotName: 'Lunch Milestone (3-2-1 Power Meal)', time: '12:30 PM' },
      { id: 'm_snack', slotId: 'snack', slotName: 'Evening Snack Milestone', time: '04:30 PM' },
      { id: 'm_dinner', slotId: 'dinner', slotName: 'Dinner Milestone', time: '07:30 PM' },
      { id: 'm_sun_d3', slotId: 'sun_d3', slotName: 'Hydration & D3 Catalyst Milestone', time: 'Daily' }
    ];

    const catalog = BONE_SIP_DATA.fullDietCatalog || [];
    const userReg = state.userProfile.regionalFood || 'north';
    const userDiet = state.userProfile.diet || 'veg';
    const userConditions = state.userProfile.healthConditions || [];

    return slots.map(slot => {
      // 1. Check custom meal swap for this date & slot
      if (state.customMealSwaps[dateKey] && state.customMealSwaps[dateKey][slot.id]) {
        const customMeal = Object.assign({}, state.customMealSwaps[dateKey][slot.id]);
        customMeal.clinicalNote = getClinicalMealNote(customMeal, userConditions);
        return {
          id: slot.id,
          slot: slot.slotName,
          slotId: slot.id,
          time: slot.time,
          meal: applyItemSwaps(dateKey, slot.id, customMeal),
          isCustomSwapped: true
        };
      }

      // 2. Intelligent selection from 100+ catalog matching user's region, diet, and metabolic conditions
      let candidate = null;
      if (slot.slotId === 'sun_d3') {
        candidate = catalog.find(m => m.slot === 'sun_d3' && m.region === userReg) || catalog.find(m => m.slot === 'sun_d3');
      } else {
        const pool = catalog.filter(m => m.slot === slot.slotId && dietAllows(userDiet, m.diet));
        if (pool.length) {
          pool.sort((a, b) => getMealMetabolicScore(b, userConditions, userDiet, userReg) - getMealMetabolicScore(a, userConditions, userDiet, userReg));
          candidate = pool[0];
        }
      }

      if (!candidate && dayData && dayData.meals && dayData.meals[slot.slotId]) {
        candidate = dayData.meals[slot.slotId].options[0];
      }
      if (!candidate) {
        candidate = {
          name: slot.slotId === 'sun_d3' ? '15 mins safe sunlight + 2.5L water & Vitamin D3' : `${formatRegionName(userReg)} Balanced Dish`,
          calcium: 250,
          protein: 12,
          desc: 'Balanced bone mineral deposit'
        };
      }

      const mealObj = Object.assign({}, candidate);
      mealObj.clinicalNote = getClinicalMealNote(mealObj, userConditions);

      return {
        id: slot.id,
        slot: slot.slotName,
        slotId: slot.id,
        time: slot.time,
        meal: applyItemSwaps(dateKey, slot.id, mealObj),
        isCustomSwapped: false
      };
    });
  }

  // --------------------------------------------------------------------------
  // MODULE: MEAL SWAP MODAL & FILTERING (100+ CHOICES)
  // --------------------------------------------------------------------------
  function openMealSwapModal(slotId, slotName) {
    playSound('tap');
    state.mealSwapFilter.slotId = slotId;
    state.mealSwapFilter.slotName = slotName || 'Meal Slot';
    state.mealSwapFilter.search = '';
    state.mealSwapFilter.region = 'all';
    state.mealSwapFilter.diet = 'all';

    const modal = document.getElementById('mealSwapModal');
    const badge = document.getElementById('mealSwapSlotBadge');
    const input = document.getElementById('mealSwapSearchInput');
    if (badge) badge.textContent = state.mealSwapFilter.slotName;
    if (input) input.value = '';

    // Reset pill classes
    document.querySelectorAll('#mealSwapRegionPills .filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.region === 'all');
    });
    document.querySelectorAll('#mealSwapDietPills .filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diet === 'all');
    });

    renderMealSwapGrid();
    if (modal) modal.style.display = 'flex';
  }

  function closeMealSwapModal() {
    playSound('tap');
    const modal = document.getElementById('mealSwapModal');
    if (modal) modal.style.display = 'none';
  }

  function setMealSwapRegionFilter(region) {
    playSound('tap');
    state.mealSwapFilter.region = region;
    document.querySelectorAll('#mealSwapRegionPills .filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.region === region);
    });
    renderMealSwapGrid();
  }

  function setMealSwapDietFilter(diet) {
    playSound('tap');
    state.mealSwapFilter.diet = diet;
    document.querySelectorAll('#mealSwapDietPills .filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diet === diet);
    });
    renderMealSwapGrid();
  }

  function filterMealSwapCatalog() {
    const input = document.getElementById('mealSwapSearchInput');
    state.mealSwapFilter.search = input ? input.value.trim().toLowerCase() : '';
    renderMealSwapGrid();
  }

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

  // ---------------- Per-item options sheet ----------------
  let itemSwapCtx = null;

  function openItemOptions(slotId, index) {
    playSound('tap');
    const dateKey = state.selectedCalendarDate || getTodayISODate();
    const resolved = resolveDailyMilestones(dateKey, null).find(m => m.id === slotId);
    if (!resolved) return;
    const current = (resolved.meal.items || [])[index];
    if (!current) return;
    itemSwapCtx = { slotId, index, dateKey, current, options: itemOptionsFor(slotId, current.name) };
    const meta = SLOT_META[slotId] || { name: 'Meal' };
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('itemSwapSlot', meta.name);
    set('itemSwapTitle', t('Instead of {name}', { name: tr(current.name) }));
    const input = document.getElementById('itemSwapSearch');
    if (input) input.value = '';
    const reset = document.getElementById('itemSwapReset');
    if (reset) reset.hidden = !current.swapped;
    renderItemOptions();
    const sheet = document.getElementById('itemSwapSheet');
    if (sheet) sheet.style.display = 'flex';
  }

  function renderItemOptions() {
    const list = document.getElementById('itemSwapList');
    if (!list || !itemSwapCtx) return;
    const q = ((document.getElementById('itemSwapSearch') || {}).value || '').trim().toLowerCase();
    const opts = itemSwapCtx.options.filter(o => !q || o.name.toLowerCase().includes(q));
    if (!opts.length) {
      list.innerHTML = '<div class="empty-state"><b>No matches</b><span>Try another word.</span></div>';
      return;
    }
    list.innerHTML = opts.slice(0, 60).map(o => {
      const b = itemBenefit(o.name);
      const i = itemSwapCtx.options.indexOf(o);
      return `
        <button type="button" class="opt-row" onclick="BoneApp.applyItemSwap(${i})">
          <div class="mi-text">
            <b>${escapeHtml(o.name)}</b>
            <span>${o.portion ? `${escapeHtml(o.portion)} · ` : ''}${b.text} <em class="mi-tag"><i class="fa-solid ${b.icon}"></i> ${b.tag}</em></span>
          </div>
          <span class="opt-nutri">${o.calcium} mg Ca</span>
        </button>`;
    }).join('');
  }

  function filterItemOptions() {
    renderItemOptions();
  }

  function closeItemOptions() {
    const sheet = document.getElementById('itemSwapSheet');
    if (sheet) sheet.style.display = 'none';
    itemSwapCtx = null;
  }

  function applyItemSwap(optionIndex) {
    if (!itemSwapCtx) return;
    const opt = itemSwapCtx.options[optionIndex];
    if (!opt) return;
    playSound('check');
    const { dateKey, slotId, index } = itemSwapCtx;
    if (!state.itemSwaps) state.itemSwaps = {};
    if (!state.itemSwaps[dateKey]) state.itemSwaps[dateKey] = {};
    if (!state.itemSwaps[dateKey][slotId]) state.itemSwaps[dateKey][slotId] = {};
    state.itemSwaps[dateKey][slotId][index] = { name: opt.name, portion: opt.portion, calcium: opt.calcium, protein: opt.protein };
    markDayForSync(dateKey);
    BoneDB.save();
    closeItemOptions();
    renderBuildDietView();
    showToast(t('Swapped to {name}', { name: tr(opt.name) }), 'fa-arrows-rotate');
  }

  function resetItemSwap() {
    if (!itemSwapCtx) return;
    const { dateKey, slotId, index } = itemSwapCtx;
    if (state.itemSwaps && state.itemSwaps[dateKey] && state.itemSwaps[dateKey][slotId]) {
      delete state.itemSwaps[dateKey][slotId][index];
    }
    BoneDB.save();
    closeItemOptions();
    renderBuildDietView();
  }

  function applyMealSwap(slotId, mealId) {
    playSound('check');
    const meal = (BONE_SIP_DATA.fullDietCatalog || []).find(m => m.id === mealId);
    if (!meal) return;

    const dateKey = state.selectedCalendarDate || getTodayISODate();
    if (!state.customMealSwaps[dateKey]) {
      state.customMealSwaps[dateKey] = {};
    }
    state.customMealSwaps[dateKey][slotId] = meal;
    markDayForSync(dateKey);
    clearItemSwaps(dateKey, slotId);

    BoneDB.save();
    closeMealSwapModal();
    renderBuildDietView();
    showToast(t('Meal updated to: {name}', { name: tr(meal.name) }), 'fa-circle-check');
  }

  // --------------------------------------------------------------------------
  // MODULE: EXERCISE ROUTINE & 12 CLINICAL MOVEMENTS SWAP
  // --------------------------------------------------------------------------
  function getActiveExerciseList() {
    const catalog = BONE_SIP_DATA.fullExerciseCatalog || [];
    const defaultFive = ['ex_sit_to_stand', 'ex_one_leg_balance', 'ex_calf_raises', 'ex_step_ups', 'ex_band_pull'];
    const routine = (state.activeExerciseRoutine && state.activeExerciseRoutine.length)
      ? state.activeExerciseRoutine
      : defaultFive;
    const resolved = routine.map(id => {
      return catalog.find(ex => ex.id === id || (id === 'ex_single_leg_stork' && ex.id === 'ex_one_leg_balance') || (id === 'ex_one_leg_balance' && ex.id === 'ex_single_leg_stork'));
    }).filter(Boolean);
    return resolved.length ? resolved : catalog.slice(0, 5);
  }

  function openExerciseSwapModal(replacingExId) {
    playSound('tap');
    state.exerciseSwapFilter.replacingExId = replacingExId;
    state.exerciseSwapFilter.category = 'all';

    const modal = document.getElementById('exerciseSwapModal');
    document.querySelectorAll('#exerciseSwapCatPills .filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.excat === 'all');
    });

    renderExerciseSwapGrid();
    if (modal) modal.style.display = 'flex';
  }

  function closeExerciseSwapModal() {
    playSound('tap');
    const modal = document.getElementById('exerciseSwapModal');
    if (modal) modal.style.display = 'none';
  }

  function setExerciseSwapCatFilter(category) {
    playSound('tap');
    state.exerciseSwapFilter.category = category;
    document.querySelectorAll('#exerciseSwapCatPills .filter-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.excat === category);
    });
    renderExerciseSwapGrid();
  }

  function renderExerciseSwapGrid() {
    const grid = document.getElementById('exerciseSwapOptionsGrid');
    if (!grid) return;

    const catalog = BONE_SIP_DATA.fullExerciseCatalog || [];
    const filter = state.exerciseSwapFilter;

    let list = catalog.filter(ex => {
      if (filter.category !== 'all') {
        const catStr = `${ex.category} ${ex.name}`.toLowerCase();
        if (!catStr.includes(filter.category.toLowerCase())) return false;
      }
      return true;
    });

    grid.innerHTML = list.map(ex => {
      const isAlreadyInRoutine = (state.activeExerciseRoutine || []).includes(ex.id);
      return `
        <div class="exercise-swap-card ${isAlreadyInRoutine ? 'selected' : ''}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="badge badge-pink">${ex.category}</span>
              <span style="font-size: 0.72rem; font-weight: 800; color: #D6265A;">${ex.impactLevel}</span>
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; margin: 4px 0 2px 0;">
              ${ex.name}
            </h4>
            <div style="font-size: 0.75rem; color: #6B6580; font-weight: 700; margin-bottom: 8px;">
              ${ex.reps} · ⏱️ ${ex.durationSec}s
            </div>
            <p style="font-size: 0.8rem; color: #4A4560; line-height: 1.35; margin-bottom: 10px;">
              <strong>Bones targeted:</strong> ${ex.targetBones}
            </p>
          </div>

          <div>
            <button class="btn btn-sm ${isAlreadyInRoutine ? 'btn-secondary' : 'btn-primary'}" style="width: 100%; border-radius: var(--radius-full); font-weight: 800;" onclick="BoneApp.applyExerciseSwap('${filter.replacingExId}', '${ex.id}')">
              ${isAlreadyInRoutine ? '<i class="fa-solid fa-check"></i> Already in Daily Routine' : '<i class="fa-solid fa-shuffle"></i> Choose this Movement'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function applyExerciseSwap(replacingExId, newExId) {
    playSound('check');
    if (!state.activeExerciseRoutine || !state.activeExerciseRoutine.length) {
      state.activeExerciseRoutine = ['ex_sit_to_stand', 'ex_one_leg_balance', 'ex_calf_raises', 'ex_step_ups', 'ex_band_pull'];
    }

    const idx = state.activeExerciseRoutine.indexOf(replacingExId);
    if (idx !== -1) {
      state.activeExerciseRoutine[idx] = newExId;
    } else {
      state.activeExerciseRoutine.push(newExId);
    }

    BoneDB.save();
    closeExerciseSwapModal();
    renderBuildExerciseView();
    showToast('💪 Workout routine updated with new clinical movement!', 'fa-dumbbell');
  }

  // --------------------------------------------------------------------------
  // MODULE: PROGRESSIVE ESTIMATED HEALTH REPORT
  // --------------------------------------------------------------------------
  function openProgressiveReportModal() {
    playSound('tap');
    generateProgressiveHealthReport();
    const modal = document.getElementById('progressiveReportModal');
    if (modal) modal.style.display = 'flex';
  }

  function closeProgressiveReportModal() {
    playSound('tap');
    const modal = document.getElementById('progressiveReportModal');
    if (modal) modal.style.display = 'none';
  }

  function generateProgressiveHealthReport() {
    const container = document.getElementById('progressiveReportContainer');
    if (!container) return;

    const todayISO = getTodayISODate();
    const score = calculateDailyScore100(todayISO);
    const bmi = parseFloat(calculateBMI());
    const streak = state.activeStreakDays || 0;
    const user = state.userProfile;
    const who = user.fullName || (state.auth.phone ? `+91 ••••••${state.auth.phone.slice(-4)}` : 'Guest');
    const bmiInfo = bmiCategory(bmi);

    const dateBadge = document.getElementById('reportDateBadge');
    if (dateBadge) dateBadge.textContent = I18N.date(new Date(), { month: 'long', year: 'numeric' });

    const exTarget = getDailyExerciseTarget();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const diet = (state.checkedDietMilestones[iso] || new Set()).size;
      const ex = (state.checkedExerciseMilestones[iso] || new Set()).size;
      const pct = Math.round(Math.min(1, (Math.min(diet, 5) / 5) * 0.6 + (Math.min(ex, exTarget) / exTarget) * 0.4) * 100);
      days.push({ pct, label: I18N.date(d, { weekday: 'narrow' }), today: i === 0 });
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

  // --------------------------------------------------------------------------
  // MODULE: USER PROFILE & PRODUCTION DATABASE MODAL
  // --------------------------------------------------------------------------
  function setHeightUnit(unit) {
    playSound('tap');
    state.heightUnit = unit;
    const btnFt = document.getElementById('unitToggleFt');
    const btnCm = document.getElementById('unitToggleCm');
    const hInput = document.getElementById('profInputHeight');
    if (btnFt) btnFt.classList.toggle('active', unit === 'ft');
    if (btnCm) btnCm.classList.toggle('active', unit === 'cm');
    if (hInput) {
      if (unit === 'ft') {
        const cm = parseInt(hInput.value) || 165;
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        hInput.placeholder = `Height in ft (e.g. ${feet}'${inches}")`;
      } else {
        hInput.placeholder = 'Height in cm (e.g. 173)';
      }
    }
  }

  function selectPrefDiet(diet) {
    playSound('tap');
    state.userProfile.diet = diet;
    document.querySelectorAll('#profDietPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diet === diet);
    });
    const dietSelect = document.getElementById('profSelectDiet');
    if (dietSelect) dietSelect.value = diet;
  }

  function selectPrefActivity(act) {
    playSound('tap');
    state.userProfile.activityLevel = act;
    document.querySelectorAll('#profActivityPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.activity === act);
    });
  }

  function selectPrefRegion(reg) {
    playSound('tap');
    state.userProfile.regionalFood = reg;
    document.querySelectorAll('#profRegionPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.region === reg);
    });
    const regSelect = document.getElementById('profSelectRegion');
    if (regSelect) regSelect.value = reg;
  }

  function togglePrefCondition(cond) {
    playSound('tap');
    if (!Array.isArray(state.userProfile.healthConditions)) {
      state.userProfile.healthConditions = Array.isArray(state.userProfile.conditions) ? [...state.userProfile.conditions] : [];
    }
    let list = state.userProfile.healthConditions;
    if (cond === 'none') {
      state.userProfile.healthConditions = list.includes('none') ? [] : ['none'];
    } else {
      list = list.filter(c => c !== 'none');
      const idx = list.indexOf(cond);
      if (idx !== -1) {
        list.splice(idx, 1);
      } else {
        list.push(cond);
      }
      state.userProfile.healthConditions = list;
    }
    state.userProfile.conditions = state.userProfile.healthConditions;

    document.querySelectorAll('#profHealthPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', state.userProfile.healthConditions.includes(btn.dataset.cond));
    });
  }

  function openUserProfileModal() {
    playSound('tap');
    const modal = document.getElementById('userProfileModal');
    const nameInput = document.getElementById('profInputName');
    const phoneInput = document.getElementById('profInputPhone');
    const hInput = document.getElementById('profInputHeight');
    const wInput = document.getElementById('profInputWeight');
    const regSelect = document.getElementById('profSelectRegion');
    const dietSelect = document.getElementById('profSelectDiet');

    const phone = loggedInPhone();
    if (nameInput) nameInput.value = state.userProfile.fullName || '';
    if (phoneInput) {
      phoneInput.value = phone || state.userProfile.phone || '';
      phoneInput.readOnly = isLoggedIn();
      phoneInput.title = isLoggedIn() ? 'Verified number' : '';
    }
    if (hInput) hInput.value = state.userProfile.heightCm || 165;
    if (wInput) wInput.value = state.userProfile.weightKg || 62;
    if (regSelect) regSelect.value = state.userProfile.regionalFood || 'north';
    if (dietSelect) dietSelect.value = state.userProfile.diet || 'veg';

    // Sync pill classes
    const userDiet = state.userProfile.diet || 'veg';
    const userReg = state.userProfile.regionalFood || 'north';
    const userAct = state.userProfile.activityLevel || 'light';
    const userConds = Array.isArray(state.userProfile.healthConditions)
      ? state.userProfile.healthConditions
      : (Array.isArray(state.userProfile.conditions) ? state.userProfile.conditions : []);

    document.querySelectorAll('#profDietPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diet === userDiet);
    });
    document.querySelectorAll('#profRegionPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.region === userReg);
    });
    document.querySelectorAll('#profActivityPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.activity === userAct);
    });
    document.querySelectorAll('#profHealthPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', userConds.includes(btn.dataset.cond));
    });

    renderProfileAccountBox();
    if (modal) modal.style.display = 'flex';
  }

  // Login state at the bottom of the profile: log in, or log out / delete account.
  function renderProfileAccountBox() {
    const box = document.getElementById('profileAccountBox');
    const note = document.getElementById('profilePrivacyNote');
    const reset = document.getElementById('profileResetBtn');
    const loggedIn = isLoggedIn();
    const phone = loggedInPhone();
    const inCloud = isCloudUser();

    if (reset) reset.hidden = loggedIn;
    if (note) {
      note.innerHTML = `<i class="fa-solid fa-lock"></i> ${loggedIn ? t('Saved safely to your account. Only you can see it.') : t('Your data stays on this device.')}`;
    }
    if (!box) return;

    if (loggedIn) {
      const formattedPhone = phone ? `+91 ${escapeHtml(phone.slice(0, 5))} ${escapeHtml(phone.slice(5))}` : t('Logged in');
      box.innerHTML = `
        <div class="pa-row">
          <span class="pa-icon"><i class="fa-solid ${inCloud ? 'fa-cloud' : 'fa-mobile-screen-button'}"></i></span>
          <div><b>${formattedPhone}</b><span>${inCloud ? t('Logged in · saved to your account') : t('Logged in · verified mobile')}</span></div>
        </div>
        <div class="pa-actions">
          <button type="button" class="btn btn-outline" onclick="BoneApp.logout()"><i class="fa-solid fa-right-from-bracket"></i> ${t('Log out')}</button>
          <button type="button" class="link-btn danger" onclick="BoneApp.deleteAccount()"><i class="fa-solid fa-user-xmark"></i> ${t('Delete account')}</button>
        </div>`;
    } else {
      box.innerHTML = `
        <div class="pa-row">
          <span class="pa-icon guest"><i class="fa-solid fa-mobile-screen"></i></span>
          <div><b>${t('Keep your data safe')}</b><span>${t('Log in with your mobile to save your plan and history to your account.')}</span></div>
        </div>
        <button type="button" class="cta-btn btn-full" onclick="BoneApp.openLogin()"><i class="fa-solid fa-right-to-bracket"></i> ${t('Log in')}</button>`;
    }
  }

  function closeUserProfileModal() {
    playSound('tap');
    const modal = document.getElementById('userProfileModal');
    if (modal) modal.style.display = 'none';
  }

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
    if (phoneInput && !isLoggedIn()) {
      state.userProfile.phone = phoneInput.value.replace(/\D/g, '').slice(-10);
    }
    const h = parseInt(hInput && hInput.value, 10);
    const w = parseInt(wInput && wInput.value, 10);
    if (h >= 100 && h <= 230) state.userProfile.heightCm = h;
    if (w >= 25 && w <= 250) state.userProfile.weightKg = w;
    if (h >= 100 && h <= 230 && w >= 25 && w <= 250) state.userProfile.baselineSet = true;
    if (regSelect) state.userProfile.regionalFood = regSelect.value;
    if (dietSelect) state.userProfile.diet = dietSelect.value;

    const activeHealthPills = Array.from(document.querySelectorAll('#profHealthPills .pref-pill.active'))
      .map(btn => btn.dataset.cond)
      .filter(Boolean);
    state.userProfile.healthConditions = activeHealthPills;
    state.userProfile.conditions = activeHealthPills;

    calculateBMI();
    BoneDB.save();
    updateHeaderProfileBadge();
    if (state.completedPillars.build) renderBuildDietView();
    renderChatContextStrip();
    closeUserProfileModal();
    showToast('Profile saved', 'fa-circle-check');
  }

  function exportDatabaseJSON() {
    BoneDB.exportJSON();
  }

  function resetDatabase() {
    if (confirm(t('Are you sure you want to clear your local bone records and reset the assessment?'))) {
      BoneDB.reset();
    }
  }

  function updateHeaderProfileBadge() {
    const userProf = document.getElementById('userHeaderProfile');
    if (!userProf) return;
    const verified = isLoggedIn();
    userProf.innerHTML = `
      <button class="avatar-btn" id="loginHeaderBtn" aria-label="${verified ? 'Open profile (verified)' : 'Open profile'}" title="My profile">
        <i class="fa-solid fa-user"></i>
        ${verified ? '<span class="avatar-dot"><i class="fa-solid fa-check"></i></span>' : ''}
      </button>`;
  }

  // --------------------------------------------------------------------------
  // MODULE: OJAS — AI ASSISTANT
  // --------------------------------------------------------------------------
  // Ojas answers through our own /api/chat endpoint (server/assistant.js), which
  // holds the Groq key, knows the whole platform and receives a short snapshot of
  // this user's plan. With no network or endpoint it falls back to the built-in
  // offline answers (generateBotResponse below).
  const CHAT_LANGUAGES = [
    ['auto', 'Auto'], ['en', 'English'], ['hi', 'हिन्दी'], ['bn', 'বাংলা'], ['mr', 'मराठी'], ['te', 'తెలుగు'],
    ['ta', 'தமிழ்'], ['gu', 'ગુજરાતી'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['pa', 'ਪੰਜਾਬੀ'], ['or', 'ଓଡ଼ିଆ']
  ];

  // {name} becomes ", Asha" (or nothing for guests).
  const CHAT_GREETINGS = {
    en: "Namaste{name}! I'm **Ojas**, your bone-health AI assistant. Ask me about today's meals, your workout, your score or how to use BONE SIP, in English or any Indian language.",
    hi: 'नमस्ते{name}! मैं **ओजस** हूँ, आपकी हड्डियों की सेहत का AI सहायक। आज के खाने, व्यायाम, स्कोर या BONE SIP ऐप के बारे में कुछ भी पूछिए।',
    bn: 'নমস্কার{name}! আমি **ওজস**, আপনার হাড়ের স্বাস্থ্যের AI সহকারী। আজকের খাবার, ব্যায়াম, স্কোর বা BONE SIP অ্যাপ নিয়ে যা খুশি জিজ্ঞেস করুন।',
    mr: 'नमस्कार{name}! मी **ओजस**, तुमच्या हाडांच्या आरोग्याचा AI सहाय्यक. आजचे जेवण, व्यायाम, स्कोअर किंवा BONE SIP ॲपबद्दल काहीही विचारा.',
    te: 'నమస్కారం{name}! నేను **ఓజస్**, మీ ఎముకల ఆరోగ్య AI సహాయకుడు. ఈరోజు భోజనం, వ్యాయామం, స్కోర్ లేదా BONE SIP యాప్ గురించి ఏదైనా అడగండి.',
    ta: 'வணக்கம்{name}! நான் **ஓஜஸ்**, உங்கள் எலும்பு ஆரோக்கிய AI உதவியாளர். இன்றைய உணவு, உடற்பயிற்சி, மதிப்பெண் அல்லது BONE SIP செயலி பற்றி எதையும் கேளுங்கள்.',
    gu: 'નમસ્તે{name}! હું **ઓજસ** છું, તમારા હાડકાંના સ્વાસ્થ્યનો AI સહાયક. આજનું ભોજન, કસરત, સ્કોર કે BONE SIP એપ વિશે કંઈ પણ પૂછો.',
    kn: 'ನಮಸ್ಕಾರ{name}! ನಾನು **ಓಜಸ್**, ನಿಮ್ಮ ಮೂಳೆ ಆರೋಗ್ಯದ AI ಸಹಾಯಕ. ಇಂದಿನ ಊಟ, ವ್ಯಾಯಾಮ, ಸ್ಕೋರ್ ಅಥವಾ BONE SIP ಆ್ಯಪ್ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.',
    ml: 'നമസ്കാരം{name}! ഞാൻ **ഓജസ്**, നിങ്ങളുടെ അസ്ഥി ആരോഗ്യ AI സഹായി. ഇന്നത്തെ ഭക്ഷണം, വ്യായാമം, സ്കോർ അല്ലെങ്കിൽ BONE SIP ആപ്പ് എന്നിവയെക്കുറിച്ച് എന്തും ചോദിക്കൂ.',
    pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ{name}! ਮੈਂ **ਓਜਸ** ਹਾਂ, ਤੁਹਾਡੀਆਂ ਹੱਡੀਆਂ ਦੀ ਸਿਹਤ ਦਾ AI ਸਹਾਇਕ। ਅੱਜ ਦੇ ਖਾਣੇ, ਕਸਰਤ, ਸਕੋਰ ਜਾਂ BONE SIP ਐਪ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।',
    or: 'ନମସ୍କାର{name}! ମୁଁ **ଓଜସ**, ଆପଣଙ୍କ ହାଡ଼ ସ୍ୱାସ୍ଥ୍ୟର AI ସହାୟକ। ଆଜିର ଖାଦ୍ୟ, ବ୍ୟାୟାମ, ସ୍କୋର କିମ୍ବା BONE SIP ଆପ୍ ବିଷୟରେ ଯାହା ବି ପଚାରନ୍ତୁ।'
  };

  // Buttons Ojas can offer under a reply (ids come from server/assistant.js).
  const ASSISTANT_ACTIONS = {
    open_diet: { label: "Today's diet", icon: 'fa-bowl-food', run: () => { navigatePillar('build'); if (state.completedPillars.build) switchBuildSubTab('diet'); } },
    open_exercise: { label: 'Exercises', icon: 'fa-person-walking', run: () => { navigatePillar('build'); if (state.completedPillars.build) switchBuildSubTab('exercise'); } },
    start_workout: { label: "Start today's workout", icon: 'fa-play', run: () => startWorkout('today') },
    open_report: { label: 'My bone report', icon: 'fa-chart-column', run: () => openProgressiveReportModal() },
    open_protect: { label: 'Open Protect', icon: 'fa-shield-halved', run: () => navigatePillar('protect') },
    open_strengthen: { label: 'Open Strengthen', icon: 'fa-user-doctor', run: () => navigatePillar('strengthen') },
    open_profile: { label: 'My profile', icon: 'fa-user', run: () => openUserProfileModal() },
    save_doctor_pdf: { label: 'Save doctor PDF', icon: 'fa-file-arrow-down', run: () => printDocument('doctor') }
  };

  const MEAL_SLOT_LABEL = { m_breakfast: 'Breakfast', m_lunch: 'Lunch', m_snack: 'Evening snack', m_dinner: 'Dinner', m_sun_d3: 'Sunlight + water' };

  let chatBusy = false;

  function assistantEndpoint() {
    const cfg = (window.BONE_SIP_CONFIG && window.BONE_SIP_CONFIG.assistant) || {};
    return typeof fetch === 'function' && cfg.endpoint ? cfg.endpoint : '';
  }

  function toggleChatDrawer() {
    playSound('tap');
    state.isChatDrawerOpen = !state.isChatDrawerOpen;
    const drawer = document.getElementById('boneChatDrawer');
    if (!drawer) return;

    if (state.isChatDrawerOpen) {
      drawer.style.display = 'flex';
      renderChatLanguageSelect();
      renderChatContextStrip();
      renderQuickChips();
      if (!state.chatHistory || state.chatHistory.length === 0) {
        initChatbotGreeting();
      } else {
        renderChatHistory();
      }
    } else {
      drawer.style.display = 'none';
    }
  }

  function closeChatDrawer() {
    playSound('tap');
    state.isChatDrawerOpen = false;
    const drawer = document.getElementById('boneChatDrawer');
    if (drawer) drawer.style.display = 'none';
  }

  function clearChatHistory() {
    playSound('tap');
    state.chatHistory = [];
    BoneDB.save();
    initChatbotGreeting();
    showToast('Chat history cleared', 'fa-trash-can');
  }

  function renderChatLanguageSelect() {
    const sel = document.getElementById('chatLangSelect');
    if (!sel) return;
    sel.innerHTML = CHAT_LANGUAGES.map(([code, label]) => `<option value="${code}"${code === state.chatLanguage ? ' selected' : ''}>${label}</option>`).join('');
    sel.value = state.chatLanguage;
  }

  function setChatLanguage(code) {
    if (!CHAT_LANGUAGES.some(([c]) => c === code)) return;
    state.chatLanguage = code;
    BoneDB.save();
    renderChatLanguageSelect();
    // A fresh chat greets again in the new language; an ongoing one just continues in it.
    const onlyGreeting = (state.chatHistory || []).every(m => m.greeting);
    if (onlyGreeting) initChatbotGreeting();
    else showToast(t('Ojas will reply in {lang}', { lang: (CHAT_LANGUAGES.find(([c]) => c === code) || [, code])[1] }), 'fa-language');
  }

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

  function renderQuickChips() {
    const container = document.getElementById('chatQuickChips');
    if (!container) return;
    const chips = ((BONE_SIP_DATA.botKnowledge && BONE_SIP_DATA.botKnowledge.quickSuggestions) || []).slice();
    const activeConds = (state.userProfile.healthConditions || []).filter(c => c && c !== 'none');
    if (activeConds.length) {
      chips.unshift({ text: '🥗 My metabolic diet chart', query: 'personalized_diet_chart' });
    }
    container.innerHTML = chips.map(c => `
      <button class="quick-chip-btn" onclick="BoneApp.sendChatMessage('${c.query}')">${escapeHtml(c.text)}</button>
    `).join('');
  }

  function initChatbotGreeting() {
    const first = String(state.userProfile.fullName || '').trim().split(/\s+/)[0];
    const template = CHAT_GREETINGS[chatReplyLanguage()] || CHAT_GREETINGS.en;
    state.chatHistory = [{
      sender: 'bot',
      text: template.replace('{name}', first ? `, ${first}` : ''),
      time: getCurrentTimeStr(),
      greeting: true
    }];
    renderChatHistory();
    BoneDB.save();
  }

  function getCurrentTimeStr() {
    const now = new Date();
    let hh = now.getHours();
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh}:${mm} ${ampm}`;
  }

  // Escape first so nothing typed (or generated) can become markup, then apply a
  // small markdown subset: paragraphs, "-"/"1." lists, **bold** and *italic*.
  function formatChatText(text) {
    const inline = s => s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
    let html = '';
    let listType = null;
    escapeHtml(text).split('\n').forEach(line => {
      const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
      const numbered = !bullet && /^\s*\d+[.)]\s+(.*)$/.exec(line);
      const type = bullet ? 'ul' : numbered ? 'ol' : null;
      if (type !== listType) {
        if (listType) html += `</${listType}>`;
        if (type) html += `<${type}>`;
        listType = type;
      }
      if (type) html += `<li>${inline((bullet || numbered)[1])}</li>`;
      else if (line.trim()) html += `<p>${inline(line.trim())}</p>`;
    });
    if (listType) html += `</${listType}>`;
    return html;
  }

  function renderChatHistory() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    container.innerHTML = (state.chatHistory || []).map(msg => {
      const sender = msg.sender === 'user' ? 'user' : 'bot';
      const actions = sender === 'bot' && Array.isArray(msg.actions)
        ? msg.actions.filter(id => ASSISTANT_ACTIONS[id]).map(id => `
            <button type="button" class="chat-action-btn" onclick="BoneApp.runAssistantAction('${id}')"><i class="fa-solid ${ASSISTANT_ACTIONS[id].icon}"></i> ${ASSISTANT_ACTIONS[id].label}</button>`).join('')
        : '';
      return `
        <div class="chat-msg-row ${sender}">
          <div class="chat-bubble ${sender}">${formatChatText(msg.text)}</div>
          ${actions ? `<div class="chat-actions">${actions}</div>` : ''}
          <span class="chat-msg-time">${escapeHtml(msg.time)}</span>
        </div>`;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  function showChatTyping(on) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    const old = document.getElementById('chatTypingRow');
    if (old) old.remove();
    if (!on) return;
    const typingEl = document.createElement('div');
    typingEl.id = 'chatTypingRow';
    typingEl.className = 'chat-msg-row bot';
    typingEl.innerHTML = `
      <div class="chat-typing-indicator" aria-label="Ojas is typing">
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
        <div class="chat-typing-dot"></div>
      </div>`;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
  }

  function setChatBusy(busy) {
    chatBusy = busy;
    const input = document.getElementById('chatTextInput');
    const status = document.getElementById('chatStatusText');
    const drawer = document.getElementById('boneChatDrawer');
    if (input) input.disabled = busy;
    if (status) status.textContent = busy ? 'Typing…' : 'Your bone-health assistant';
    if (drawer) drawer.classList.toggle('is-busy', busy);
    if (!busy && input && state.isChatDrawerOpen) input.focus();
  }

  // A short, privacy-minded snapshot so Ojas can answer about *this* user's plan.
  // Never includes the phone number or the full name.
  function buildAssistantContext() {
    const u = state.userProfile;
    const today = getTodayISODate();
    const score = calculateDailyScore100(today);
    const dayData = (BONE_SIP_DATA.weeklyDietCalendar || []).find(d => d.day === getTodayDayName());
    const dietSet = state.checkedDietMilestones[today] || new Set();
    const meals = resolveDailyMilestones(today, dayData).map(m => ({
      done: dietSet.has(m.id),
      text: `${MEAL_SLOT_LABEL[m.id] || m.slot}: ${m.meal && m.meal.name}`
    }));
    const exSet = getExerciseSetFor(today);
    const mix = todaysMix();
    const home = homeSafetySummary();
    const bmi = parseFloat(calculateBMI());
    return {
      today,
      screen: state.activePillar === 'build' ? `build/${state.activeBuildSubTab || 'diet'}` : state.activePillar,
      firstName: String(u.fullName || '').trim().split(/\s+/)[0],
      age: u.age,
      heightCm: u.heightCm,
      weightKg: u.weightKg,
      bmi: isNaN(bmi) ? null : bmi,
      diet: u.diet,
      region: u.regionalFood,
      activity: optionTitle(BONE_SIP_DATA.activityLevelOptions, u.activityLevel),
      conditions: (u.healthConditions || []).filter(c => c !== 'none').map(c => optionTitle(BONE_SIP_DATA.healthConditionOptions, c)).filter(Boolean),
      unlocked: ['build'].concat(state.unlockedPillars.protect ? ['protect'] : [], state.unlockedPillars.strengthen ? ['strengthen'] : []),
      score: { total: score.total, tier: score.tier, diet: score.dietPts, exercise: score.exPts, safety: score.safePts, streak: score.streakPts },
      streakDays: state.activeStreakDays || 0,
      mealsDone: meals.filter(m => m.done).map(m => m.text),
      mealsPending: meals.filter(m => !m.done).map(m => m.text),
      workout: { done: mix.filter(e => exSet.has(e.id)).length, target: getDailyExerciseTarget(), remaining: mix.filter(e => !exSet.has(e.id)).map(e => e.name) },
      riskSigns: (BONE_SIP_DATA.boneRiskAuditFactors || []).filter(f => state.protectRiskChecked.has(f.id)).map(f => f.text),
      homeSafety: home.answered ? `${home.safe} of ${home.total} checks safe` : 'not checked yet',
      homeFixes: home.rows.flatMap(r => r.fixes.map(f => `${r.name}: ${f}`)),
      doctorQuestions: autoDoctorQuestions().map(([, q]) => q).concat(state.doctorVisit.questions || [])
    };
  }

  async function askAssistant(endpoint) {
    const messages = (state.chatHistory || [])
      .filter(m => !m.greeting && !m.offline)
      .slice(-12)
      .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: String(m.text || '') }));
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language: chatReplyLanguage(), context: buildAssistantContext() }),
      signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(40000) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON error page */ }
    if (res.ok && data && data.reply) return { text: data.reply, actions: Array.isArray(data.actions) ? data.actions : [] };
    throw new Error((data && data.error) || `http_${res.status}`);
  }

  function addBotReply(reply) {
    showChatTyping(false);
    state.chatHistory.push(Object.assign({ sender: 'bot', time: getCurrentTimeStr() }, reply));
    renderChatHistory();
    BoneDB.save();
    playSound('success');
  }

  function sendChatMessage(overrideQuery) {
    const input = document.getElementById('chatTextInput');
    const query = overrideQuery || (input ? input.value.trim() : '');
    if (!query || chatBusy) return;

    if (input) input.value = '';
    playSound('tap');

    state.chatHistory.push({
      sender: 'user',
      text: overrideQuery ? tr(getQuickChipLabel(overrideQuery)) : query,
      time: getCurrentTimeStr()
    });
    renderChatHistory();
    showChatTyping(true);

    const endpoint = assistantEndpoint();
    if (!endpoint) {
      setTimeout(() => addBotReply({ text: generateBotResponse(query) }), 400);
      return;
    }

    setChatBusy(true);
    askAssistant(endpoint)
      .then(reply => addBotReply(reply))
      .catch(err => {
        addBotReply({ text: `*${assistantErrorNote(err)}*\n\n${generateBotResponse(query)}`, offline: true });
      })
      .finally(() => setChatBusy(false));
  }

  // Say why the AI answer failed, so it can be fixed (wrong server, missing key, limits, offline).
  function assistantErrorNote(err) {
    const code = String(err && err.message);
    if (location.protocol === 'file:') return 'Ojas AI needs the BONE SIP server: open http://localhost:5510 (start it with "node server/server.js 5510") instead of opening index.html as a file. Here is a quick answer for now.';
    if (/busy|too_many/.test(code)) return t("I'm answering a lot of questions right now. Here is a quick answer; please ask again in a minute for a personal one.");
    if (/not_configured/.test(code)) return 'Ojas AI is not set up on this server yet (GROQ_API_KEY is missing). Here is a quick answer.';
    if (/http_(404|405|501)/.test(code)) return 'This server has no AI endpoint (/api/chat). Run the app with "node server/server.js" or deploy it to Netlify/Vercel. Here is a quick answer.';
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return t("You're offline, so here is a quick answer. Ojas will give personal answers again when you're back online.");
    return t("I couldn't reach my AI service just now. Here is a quick answer; please try again in a moment.");
  }

  function runAssistantAction(id) {
    const action = ASSISTANT_ACTIONS[id];
    if (!action) return;
    closeChatDrawer();
    action.run();
  }

  function getQuickChipLabel(q) {
    const map = {
      personalized_diet_chart: 'What is my personalized metabolic diet plan?',
      meal_suggestion: 'What should I eat today for strong bones?',
      calcium_gap: 'How do I reach 1,200 mg of calcium today?',
      exercise_advice: 'Which exercises should I do today?',
      dxa_explanation: 'What does a DXA T-score mean?',
      streak_score: 'Explain my bone score and streak.',
      d3_mechanism: 'How do I get enough vitamin D?',
      fall_prevention: 'How can I prevent falls at home?',
      user_profile: 'Show my profile.'
    };
    return map[q] || q;
  }

  // Offline answers: used when there is no network or no assistant endpoint.
  function generateBotResponse(raw) {
    const text = (raw || '').toLowerCase();
    const user = state.userProfile;
    const score = calculateDailyScore100();
    const bmi = calculateBMI();
    const reg = user.regionalFood || 'north';
    const diet = user.diet || 'veg';
    const catalog = BONE_SIP_DATA.fullDietCatalog || [];

    // 0A. EDIT / REMOVE HEALTH CONDITIONS (e.g. Obesity, Thyroid, Kidney)
    if (
      (text.includes('remove') || text.includes('change') || text.includes('edit') || text.includes('delete') || text.includes('uncheck') || text.includes('how can i change') || text.includes('how can i edit')) &&
      (text.includes('obes') || text.includes('condition') || text.includes('health') || text.includes('thyroid') || text.includes('kidney') || text.includes('cholesterol') || text.includes('sugar') || text.includes('diabetes') || text.includes('lactose'))
    ) {
      const condWord = text.includes('obes') ? 'Obesity'
        : (text.includes('thyroid') ? 'Thyroid'
        : (text.includes('kidney') ? 'Kidney'
        : (text.includes('cholesterol') ? 'High cholesterol'
        : (text.includes('diabet') || text.includes('sugar') ? 'Diabetes'
        : (text.includes('lactose') ? 'Lactose-free' : 'any condition')))));

      return `To edit or remove **${condWord}** from your health profile:\n\n1. Tap your **Profile icon** (person avatar) in the top-right header.\n2. In the **"My profile"** window, look at the **"Health & metabolic conditions"** section.\n3. Tap the **${condWord}** pill to uncheck/deselect it (it turns from red/active to white/inactive).\n4. Tap the green **Save** button at the bottom.\n\nYour 3-2-1 daily diet plan and clinical guidance will immediately update to match your corrected profile!`;
    }

    // 0B. BMI & OBESITY VALIDATION
    if (text.includes('do i have obesity') || text.includes('am i obese') || text.includes('do you think that i have obesity') || text.includes('why my diet plan accordingly obesity') || text.includes('why is my diet for obesity')) {
      const bmiNum = parseFloat(bmi);
      let cat = 'Normal weight';
      if (bmiNum < 18.5) cat = 'Underweight';
      else if (bmiNum >= 25 && bmiNum < 30) cat = 'Overweight';
      else if (bmiNum >= 30) cat = 'Obese';

      if (bmiNum < 25) {
        return `Your current BMI is **${bmi}** (${user.weightKg || 62} kg, ${user.heightCm || 165} cm), which is in the **${cat}** range—**you do not have obesity**.\n\nIf "Obesity" was previously selected in your initial assessment:\n1. Tap your **Profile icon** at the top right.\n2. Under **"Health & metabolic conditions"**, tap **Obesity** to deselect it.\n3. Tap **Save** at the bottom.\n\nYour diet will then focus directly on bone building and healthy weight maintenance!`;
      }
    }

    // 0C. WHAT'S MY BMI
    if (text.includes('whats my bmi') || text.includes('what is my bmi') || text === 'bmi') {
      const bmiNum = parseFloat(bmi);
      let cat = 'Normal weight';
      if (bmiNum < 18.5) cat = 'Underweight';
      else if (bmiNum >= 25 && bmiNum < 30) cat = 'Overweight';
      else if (bmiNum >= 30) cat = 'Obese';

      return `Your BMI is **${bmi}** (${user.heightCm || 165} cm, ${user.weightKg || 62} kg), which is in the **${cat}** category.\n\n• **Healthy BMI range:** 18.5 – 24.9\n• **Bone Health Note:** Maintaining a healthy body weight provides natural mechanical loading to stimulate osteoblasts without placing excess strain on joints.`;
    }

    // 0. PERSONALIZED METABOLIC DIET CHART
    const isMetabolicDietQuery =
      raw === 'personalized_diet_chart' ||
      text.includes('personalized_diet_chart') ||
      text.includes('metabolic diet') || text.includes('diet chart') ||
      text.includes('diet plan') || text.includes('customized diet') ||
      text.includes('personalized diet') ||
      text.includes('diabet') || text.includes('hypertens') ||
      text.includes('high bp') || text.includes('blood pressure') ||
      text.includes('obes') || text.includes('cholesterol') ||
      text.includes('dyslipidemia') || text.includes('lipid') ||
      text.includes('thyroid') || text.includes('kidney') ||
      text.includes('renal') || text.includes('lactose') ||
      text.includes('dairy') || text.includes('nut') ||
      text.includes('peanut') || text.includes('allergy');

    if (isMetabolicDietQuery) {
      const activeConds = new Set((user.healthConditions || []).filter(c => c && c !== 'none'));
      if (text.includes('diabet')) activeConds.add('diabetes');
      if (text.includes('hypertens') || text.includes('bp') || text.includes('pressure')) activeConds.add('hypertension');
      if (text.includes('obes') || text.includes('weight')) activeConds.add('obesity');
      if (text.includes('cholesterol') || text.includes('dyslipidemia') || text.includes('lipid')) activeConds.add('dyslipidemia');
      if (text.includes('thyroid')) activeConds.add('thyroid');
      if (text.includes('kidney') || text.includes('renal')) activeConds.add('kidney');
      if (text.includes('lactose') || text.includes('dairy')) activeConds.add('lactose_intolerance');
      if (text.includes('nut') || text.includes('peanut') || text.includes('allergy')) activeConds.add('nuts_allergy');
      if (text.includes('fracture')) activeConds.add('fracture');

      const condList = Array.from(activeConds);
      const condNames = condList.map(c => {
        const opt = (BONE_SIP_DATA.healthConditionOptions || []).find(o => o.id === c);
        return opt ? opt.title : c;
      });

      const milestones = resolveDailyMilestones(getTodayISODate(), null);
      const mealSlots = milestones.filter(m => m.id !== 'm_sun_d3');

      let res = `📋 **Your Personalized Bone & Metabolic Diet Plan**\n`;
      res += `• **Cuisine & Lifestyle:** ${formatRegionName(reg)} · ${formatDietName(diet)}\n`;
      if (condNames.length > 0) {
        res += `• **Clinical Focus:** ${condNames.join(', ')}\n`;
      }
      res += `\nHere is your tailored 4-milestone daily chart:\n`;

      const slotEmoji = {
        m_breakfast: '🌅',
        m_lunch: '☀️',
        m_snack: '☕',
        m_dinner: '🌙'
      };

      mealSlots.forEach(m => {
        const emoji = slotEmoji[m.id] || '🍽️';
        const meal = m.meal;
        res += `\n${emoji} **${m.slot}**\n`;
        res += `• **Dish:** ${meal.name}\n`;
        res += `• **Nutrients:** **${meal.calcium} mg** Calcium · **${meal.protein} g** Protein\n`;
        if (meal.clinicalNote) {
          res += `• **Clinical Note:** ${meal.clinicalNote}\n`;
        } else if (meal.desc) {
          res += `• **Benefit:** ${meal.desc}\n`;
        }
      });

      // Clinical nutritional rules
      const clinicalTips = [];
      if (activeConds.has('diabetes')) {
        clinicalTips.push(`**Diabetes:** Prioritize low-GI millets (Ragi, Jowar, Bajra) and pulses. Avoid refined sugar & jaggery to stop Advanced Glycation End-products (AGEs) from weakening bone collagen.`);
      }
      if (activeConds.has('hypertension')) {
        clinicalTips.push(`**Hypertension (DASH):** Keep sodium under 2,000 mg/day. High sodium causes renal hypercalciuria (calcium wasting into urine); boost potassium via moringa and fresh curd.`);
      }
      if (activeConds.has('obesity')) {
        clinicalTips.push(`**Obesity:** Maintain 1.0–1.2 g/kg lean protein from steamed legumes, sprouts, and low-fat dairy/tofu to preserve bone scaffolding while managing caloric load.`);
      }
      if (activeConds.has('dyslipidemia')) {
        clinicalTips.push(`**High Cholesterol:** Incorporate soluble fiber (oats, methi, flaxseeds) and Omega-3 fats to quiet osteoclast inflammatory signaling; avoid trans fats and heavy ghee.`);
      }
      if (activeConds.has('thyroid')) {
        clinicalTips.push(`**Thyroid 4-Hour Rule:** Take morning thyroid medication with water on an empty stomach, and wait at least 4 hours before consuming calcium supplements or dairy.`);
      }
      if (activeConds.has('kidney')) {
        clinicalTips.push(`**Kidney Health:** Moderate high-quality protein with balanced minerals and low inorganic phosphorus to protect filtration while retaining bone minerals.`);
      }
      if (activeConds.has('lactose_intolerance')) {
        clinicalTips.push(`**Lactose Intolerance:** Rely on calcium-fortified plant milks (soy, almond, oat), firm tofu, ragi rotis, white sesame (til), and moringa to hit 1,200 mg calcium daily without lactose.`);
      }
      if (activeConds.has('nuts_allergy')) {
        clinicalTips.push(`**Nuts Allergy:** Swap tree nuts & peanuts for toasted pumpkin seeds, sunflower seeds, white sesame seeds (til), and roasted chana to secure essential magnesium, zinc, and bone minerals safely.`);
      }
      if (activeConds.has('fracture')) {
        clinicalTips.push(`**Fracture Recovery:** Target 1,200 mg calcium daily paired with sunlight Vitamin D3 and gentle joint loading to accelerate trabecular bone remodeling.`);
      }

      if (clinicalTips.length > 0) {
        res += `\n🩺 **Clinical Nutritional Directives:**\n`;
        clinicalTips.forEach(tip => {
          res += `• ${tip}\n`;
        });
      } else {
        res += `\n💡 **Daily 3-2-1 Benchmark:** Ensure 3 calcium servings (~1,200 mg), 2 protein portions (~50–60g), and 15 mins morning sunlight for active Vitamin D3 synthesis.\n`;
      }

      res += `\n👉 *You can customize or swap any dish directly in the "3-2-1 Daily Diet" tab!*`;
      return res;
    }

    // 1. MEAL SUGGESTIONS
    if (text.includes('meal') || text.includes('food') || text.includes('diet') || text.includes('suggest') || text === 'meal_suggestion') {
      const activeConds = (user.healthConditions || []).filter(c => c && c !== 'none');
      const pool = catalog.filter(m => m.region === reg && dietAllows(diet, m.diet));
      if (pool.length > 0) {
        pool.sort((a, b) => getMealMetabolicScore(b, activeConds, diet, reg) - getMealMetabolicScore(a, activeConds, diet, reg));
        const matches = pool.slice(0, 3);
        let res = `Here are **3 bone-enriching meals** tailored to your **${formatRegionName(reg)} ${formatDietName(diet)}** lifestyle:\n`;
        matches.forEach((m, i) => {
          res += `\n**${i + 1}. ${m.name}**\n• Calcium: **${m.calcium} mg** · Protein: **${m.protein} g**\n• Clinical Benefit: ${m.desc}\n`;
          const note = getClinicalMealNote(m, activeConds);
          if (note) res += `• Clinical Note: ${note}\n`;
        });
        res += `\n💡 *Tip: You can swap any of these directly into today's 3-2-1 Diet checklist using the "Swap (100+)" button!*`;
        return res;
      }
    }

    // 2. CALCIUM & BRIDGING 1200MG GAP
    if (text.includes('calcium') || text.includes('1200') || text === 'calcium_gap') {
      return `To achieve the clinical benchmark of **1,200 mg/day**, follow the BONE SIP 3-2-1 rule:\n\n• **3 Calcium Servings:**\n  - 1 cup Milk/Curd: ~300 mg\n  - 100g Paneer/Tofu: ~200–350 mg\n  - 2 Ragi Rotis or Dosa: ~340 mg\n  - 2 tsp Roasted Sesame (Til): ~180 mg\n• **Moringa (Drumstick leaves):** 440 mg per 100g!\n• **Poppy Seeds (Khus Khus):** Highest plant calcium at 1,400 mg/100g.\n\nCombined with safe sunlight exposure, this ensures positive bone mineral retention!`;
    }

    // 3. EXERCISE GUIDANCE & SQUATS
    if (text.includes('exercise') || text.includes('squat') || text.includes('workout') || text.includes('bone loading') || text === 'exercise_advice') {
      return `Bones remodel through **piezo-electric loading**—the mechanical compression triggers osteoblasts to lay down hydroxyapatite crystals.\n\n**Top 3 Clinical Movements:**\n1. **Sit to Stand (Chair Squats):** 3 sets of 10–12 reps. Maximizes femoral neck bone mineral density.\n2. **Tandem Balance Stance:** 30s per leg. Retrains proprioceptors to prevent tripping.\n3. **Prone Cobra / Wall Push-Ups:** Strengthens the thoracic extensor muscles that shield vertebrae from compression.\n\n👉 *You can start our guided video timer from the "Bone Loading Exercises" tab!*`;
    }

    // 4. DAILY STREAK SCORE & PROGRESS
    if (text.includes('score') || text.includes('streak') || text === 'streak_score') {
      return `📊 **Your Live Bone Health Score:** **${score.total} / 100** (*${score.tier}*)\n\n**Component Breakdown:**\n• **Diet Milestones:** ${score.dietPts} / 40 pts\n• **Guided Exercises:** ${score.exPts} / 30 pts\n• **Fall Safety & D3:** ${score.safePts} / 20 pts\n• **Streak Consistency:** ${score.streakPts} / 10 pts\n\n🔥 **Active Continuous Streak:** **${state.activeStreakDays} Days**\n\n*Check off all remaining items today to lock in your 100/100 score!*`;
    }

    // 5. DXA SCAN & T-SCORE
    if (text.includes('dxa') || text.includes('t-score') || text.includes('t score') || text.includes('scan') || text === 'dxa_explanation') {
      return `A **Dual-Energy X-ray Absorptiometry (DXA)** scan measures Bone Mineral Density (BMD):\n\n• **T-Score > -1.0:** Normal Bone Density.\n• **T-Score -1.0 to -2.5:** Osteopenia (Mild bone thinning, ideal time for early SIP intervention).\n• **T-Score ≤ -2.5:** Osteoporosis (Fragile bone matrix, elevated fracture risk).\n\nBring our **Ask Your Doctor Checklist** (found in the Strengthen pillar) to your physician to review your 10-year FRAX probability!`;
    }

    // 6. VITAMIN D3 MECHANISM
    if (text.includes('vitamin d') || text.includes('sunlight') || text.includes('d3') || text === 'd3_mechanism') {
      return `☀️ **How Vitamin D3 Unlocks Calcium:**\nWithout active Vitamin D (calcitriol), your digestive tract absorbs **less than 15%** of ingested calcium.\n\n• **Natural Source:** 15–20 minutes of safe morning sunlight (face and arms exposed) triggers cutaneous synthesis of ~10,000 IU cholecalciferol.\n• **Supplementation:** Indoor professionals often need weekly or monthly clinical Vitamin D3 drops as prescribed by a doctor.`;
    }

    // 7. FALL PRECAUTIONS & HOME HAZARD AUDIT
    if (text.includes('fall') || text.includes('hazard') || text.includes('precaution') || text.includes('bathroom') || text === 'fall_prevention') {
      return `🛡️ **95% of hip fractures result from a standing fall.** Protect your bone capital:\n\n1. **Bathroom:** Install anti-skid rubber mats and sturdy wall grab bars.\n2. **Nighttime:** Keep illuminated pathways to the bathroom with nightlights.\n3. **Footwear:** Never walk in loose open slippers. Wear rubber-soled supportive footwear with heel counters.\n4. **Rugs:** Anchor or discard loose throw rugs that cause tripping.`;
    }

    // 8. USER PROFILE & LOCAL DATABASE
    if (text.includes('who am i') || text.includes('profile') || text.includes('number') || text.includes('name') || text.includes('database') || text === 'user_profile') {
      if (user.fullName || state.auth.phone) {
        return `📋 **Your Registered Profile & Database Status:**\n\n• **Name:** ${user.fullName || 'Not specified'}\n• **Mobile:** ${state.auth.phone ? '+91 ' + state.auth.phone : 'Not verified'}\n• **Height & Weight:** ${user.heightCm} cm · ${user.weightKg} kg (BMI: **${bmi}**)\n• **Cuisine:** ${formatRegionName(user.regionalFood)} (${formatDietName(user.diet)})\n• **Database Sync:** Local Encrypted BoneDB (Live & Synced)\n\n*Tap the profile icon in the top header anytime to edit your parameters or export a backup!*`;
      } else {
        return `📋 **Your Profile & Database Status:**\n\n• **Status:** Guest Session (Not Logged In)\n• **Name:** *None entered yet*\n• **Mobile:** *Not verified yet*\n• **Height & Weight:** ${user.heightCm} cm · ${user.weightKg} kg (BMI: **${bmi}**)\n• **Cuisine:** ${formatRegionName(user.regionalFood)} (${formatDietName(user.diet)})\n• **Database Sync:** Local Guest Session\n\n*Tap "Login / Profile" in the top header to enter your name and phone number to permanently sync your data!*`;
      }
    }

    // 9. PLATFORM FLOW & WHERE EVERYTHING IS
    if (text.includes('platform') || text.includes('how to use') || text.includes('where is') || text.includes('unlock') || text.includes('pillar') || text.includes('how does this platform work')) {
      return `🌟 **How BONE SIP Works & Where Everything Is:**\n\n• **Top Header:**\n  - **BONE SIP Logo:** Tap anytime to return to the Build home.\n  - **Language Picker:** Tap the language pill to switch between English and 11 Indian languages.\n  - **Health Report Icon:** Tap the clipboard/chart icon to view your live Bone Score (0–100), 7-day trend, WhatsApp summary, and PDF report.\n  - **Profile Avatar:** Tap the person icon at top-right to edit Height, Weight, Diet, Activity, Regional cuisine, and Health/Metabolic conditions.\n\n• **Three Core Pillars (Bottom Nav):**\n  1. **Build:** Daily 3-2-1 Diet checklist (Breakfast, Lunch, Snack, Dinner, Sun D3) + 4 guided video bone-loading workouts.\n  2. **Protect:** Fall-risk assessment and 5-room home safety hazard audit.\n  3. **Strengthen:** "Ask your doctor" printable checklist and DXA T-Score interpretation guide.\n\n• **AI Guide (Ojas):** Floating button at bottom-right for 24/7 personal answers!`;
    }

    // DEFAULT INTELLIGENT CLINICAL RESPONSE
    const salutation = user.fullName ? `Thank you for your question, **${user.fullName}**!` : `Thank you for your question!`;
    return `${salutation}\n\nAs your BONE SIP AI guide, I recommend focusing on our **3-2-1 nutritional foundation** (3 calcium servings, 2 protein portions, 1 Vitamin D3 source) alongside our **daily bone loading movements**.\n\nWould you like me to:\n• Suggest a **high-calcium meal** for your **${formatRegionName(user.regionalFood)}** cuisine?\n• Review your **Daily Score (${score.total}/100)**?\n• Explain the **best exercises** for hip and spine strength?`;
  }

  // A. DIET SUBVIEW (DATE-WISE CALENDAR + DAILY MILESTONES & STREAK)
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
          <button class="calendar-day-btn ${dObj.isoDate === currentDateKey ? 'active' : ''} ${dObj.isToday ? 'is-today' : ''} ${done ? 'day-completed' : ''}" onclick="BoneApp.selectCalendarDate('${dObj.isoDate}', '${dObj.dayName}')" aria-label="${I18N.date(dObj.date, { weekday: 'long', day: 'numeric', month: 'long' })}">
            <span class="day-abbr">${dObj.isToday ? 'Today' : dObj.dayShort}</span>
            <span class="day-date-number">${dObj.dateNum}</span>
            ${done ? '<div class="day-status-pill"><span class="status-check">✓</span></div>' : (set.size > 0 ? `<div class="day-status-pill"><span class="status-count">${set.size}/5</span></div>` : '')}
          </button>`;
      }).join('');
    }

    // 3. Hero copy
    const dayTitle = document.getElementById('dietDayTitle');
    if (dayTitle) {
      const tag = isPast ? '<span class="past-tag"><i class="fa-solid fa-lock"></i> View only</span>' : '';
      const when = I18N.current() === 'en'
        ? `${activeDayObj.dateNum} ${activeDayObj.monthShort}`
        : I18N.date(activeDayObj.date, { day: 'numeric', month: 'short' });
      const title = isToday
        ? t('Today, {date}', { date: when })
        : (I18N.current() === 'en' ? `${activeDayObj.dayName}, ${when}` : I18N.date(activeDayObj.date, { weekday: 'long', day: 'numeric', month: 'short' }));
      dayTitle.innerHTML = `${escapeHtml(title)} ${tag}`;
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
      const items = m.meal.items || splitMealComponents(m.meal);
      const totalItems = Math.max(1, items.length);
      const checkedIndices = getCheckedItemIndices(currentDateKey, m.id, totalItems);
      if (checkedIndices.length === 0) return;

      items.forEach((c, idx) => {
        if (!checkedIndices.includes(idx)) return;
        got.cal += (c.calcium || Math.round((m.meal.calcium || 0) / totalItems));
        got.pro += (c.protein || Math.round((m.meal.protein || 0) / totalItems));
        const text = `${c.name || ''} ${m.meal.name || ''} ${m.meal.desc || ''}`.toLowerCase();
        got.d3 += m.id === 'm_sun_d3' ? Math.round(800 / totalItems) : has(text, ['fortified', 'egg', 'fish', 'mushroom', 'badam milk']) ? Math.round(100 / totalItems) : Math.round(25 / totalItems);
        got.k2 += has(text, ['curd', 'dahi', 'paneer', 'chhena', 'dosa', 'idli', 'chaas', 'fermented']) ? Math.round(22 / totalItems) : has(text, ['palak', 'saag', 'methi', 'greens', 'spinach']) ? Math.round(16 / totalItems) : Math.round(6 / totalItems);
        got.mg += has(text, ['til', 'sesame', 'makhana', 'almond', 'badam', 'ragi', 'bajra', 'jowar', 'dal', 'chana', 'seeds']) ? Math.round(85 / totalItems) : Math.round(45 / totalItems);
        got.vitC += has(text, ['amla', 'guava', 'lemon', 'moringa', 'drumstick', 'mint', 'salad']) ? Math.round(20 / totalItems) : has(text, ['greens', 'spinach', 'fruit']) ? Math.round(12 / totalItems) : Math.round(4 / totalItems);
      });
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

    // 5b. Protect Precaution Suggestion Prompt
    renderProtectSuggestionBanner();

    // 6. Meal cards & Clinical Guidance Banner
    const guidanceContainer = document.getElementById('clinicalDietGuidanceContainer');
    if (guidanceContainer) {
      const userReg = state.userProfile.regionalFood || 'north';
      const userDiet = state.userProfile.diet || 'veg';
      guidanceContainer.innerHTML = renderClinicalDietGuidance(state.userProfile.healthConditions, userDiet, userReg);
    }

    const listEl = document.getElementById('dietMilestonesList');
    if (!listEl) return;
    listEl.classList.toggle('no-anim', lastDietDateRendered === currentDateKey);
    lastDietDateRendered = currentDateKey;

    listEl.innerHTML = resolvedMilestones.map((item, i) => {
      const meta = SLOT_META[item.id] || { name: 'Meal', time: '' };
      const items = item.meal.items || splitMealComponents(item.meal);
      const totalItems = Math.max(1, items.length);
      const checkedIndices = getCheckedItemIndices(currentDateKey, item.id, totalItems);
      const isSlotDone = checkedIndices.length >= totalItems;
      const hidden = state.activeSlotFilter && state.activeSlotFilter !== 'all' && state.activeSlotFilter !== item.id;
      const justDone = isSlotDone && state.lastToggledMilestone === item.id;

      return `
        <div class="meal-card fade-up ${isSlotDone ? 'completed' : ''} ${justDone ? 'just-done' : ''}" data-slot-id="${item.id}" id="mealSlotCard_${item.id}" style="--i: ${i}; ${hidden ? 'display: none;' : ''}">
          <div class="meal-head">
            <div class="meal-ico">
              ${meta.img ? `<img src="assets/icons3d/${meta.img}.webp" alt="" class="i3d meal-ico-img" width="34" height="34">` : `<i class="${meta.icon || 'fa-solid fa-utensils'}"></i>`}
            </div>
            <div class="meal-head-text">
              <b>${meta.name}</b>
              <span>${meta.time} · ${item.meal.calcium || 0} mg calcium · ${item.meal.protein || 0} g protein</span>
            </div>
            ${!isPast ? `
              <div class="meal-head-nav">
                <button class="mini-nav" onclick="BoneApp.cycleSlotMeal('${item.id}', -1)" aria-label="${t('Previous {meal} idea', { meal: tr(meta.name) })}"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="mini-nav" onclick="BoneApp.cycleSlotMeal('${item.id}', 1)" aria-label="${t('Next {meal} idea', { meal: tr(meta.name) })}"><i class="fa-solid fa-chevron-right"></i></button>
              </div>` : ''}
          </div>
          <div class="meal-items">
            ${items.map((c, idx) => {
              const b = itemBenefit(c.name);
              const isItemDone = checkedIndices.includes(idx);
              const itemAction = isPast ? 'BoneApp.showPastDayNotice()' : `BoneApp.toggleDietItem('${currentDateKey}', '${item.id}', ${idx}, ${totalItems})`;
              return `
                <div class="meal-item ${isItemDone ? 'item-completed' : ''} ${c.swapped ? 'swapped' : ''}">
                  <div class="mi-text">
                    <b>${escapeHtml(c.name)}</b>
                    <span>${c.portion ? `${escapeHtml(c.portion)} · ` : ''}${b.text} <em class="mi-tag"><i class="fa-solid ${b.icon}"></i> ${b.tag}</em></span>
                  </div>
                  <div class="mi-actions">
                    ${!isPast ? `<button class="mi-opt" onclick="BoneApp.openItemOptions('${item.id}', ${idx})">View options <i class="fa-solid fa-chevron-right"></i></button>` : ''}
                    <button type="button" class="meal-item-check ${isItemDone ? 'checked' : ''} ${isPast ? 'locked' : ''}" onclick="${itemAction}" aria-pressed="${isItemDone}" aria-label="${escapeHtml(t(isItemDone ? 'Undo item: {name}' : 'Mark item done: {name}', { name: c.name }))}">
                      <i class="fa-solid ${isItemDone ? 'fa-check' : (isPast ? 'fa-lock' : '')}"></i>
                    </button>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
    state.lastToggledMilestone = null;
  }

  function cycleSlotMeal(slotId, direction) {
    playSound('tap');
    const catalog = BONE_SIP_DATA.fullDietCatalog || [];
    const userReg = state.userProfile.regionalFood || 'north';
    const userDiet = state.userProfile.diet || 'veg';

    let slotType = 'breakfast';
    if (slotId === 'm_lunch') slotType = 'lunch';
    else if (slotId === 'm_snack') slotType = 'snack';
    else if (slotId === 'm_dinner') slotType = 'dinner';
    else if (slotId === 'm_sun_d3') slotType = 'sun_d3';

    let candidates = [];
    if (slotType === 'sun_d3') {
      candidates = catalog.filter(m => m.slot === 'sun_d3' && (userDiet === 'all' || m.diet === userDiet || m.diet === 'veg' || m.diet === 'vegan'));
      if (candidates.length <= 1) {
        candidates = catalog.filter(m => m.slot === 'sun_d3');
      }
    } else {
      candidates = catalog.filter(m => m.slot === slotType && m.region === userReg && (userDiet === 'all' || m.diet === userDiet));
      if (candidates.length === 0) {
        candidates = catalog.filter(m => m.slot === slotType && (userDiet === 'all' || m.diet === userDiet));
      }
      if (candidates.length === 0) {
        candidates = catalog.filter(m => m.slot === slotType);
      }
    }
    if (candidates.length === 0) return;

    const dateKey = state.selectedCalendarDate || getTodayISODate();
    const currentMeal = (state.customMealSwaps[dateKey] && state.customMealSwaps[dateKey][slotId]) || null;
    let currentIdx = 0;
    if (currentMeal) {
      currentIdx = candidates.findIndex(m => m.id === currentMeal.id || m.name === currentMeal.name);
      if (currentIdx === -1) currentIdx = 0;
    }

    const nextIdx = (currentIdx + direction + candidates.length) % candidates.length;
    const nextMeal = candidates[nextIdx];

    if (!state.customMealSwaps[dateKey]) {
      state.customMealSwaps[dateKey] = {};
    }
    state.customMealSwaps[dateKey][slotId] = nextMeal;
    markDayForSync(dateKey);
    clearItemSwaps(dateKey, slotId);

    BoneDB.save();
    renderBuildDietView();
    showToast(t('Meal updated to: {name}', { name: tr(nextMeal.name) }), 'fa-arrows-rotate');
  }

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

  function recordYesterdayFeedback(isYes) {
    playSound(isYes ? 'success' : 'tap');
    state.yesterdayFollowed = isYes;
    BoneDB.save();
    if (isYes) {
      showToast("🎉 Wonderful! Consistency is the #1 driver of bone density wealth.", "fa-thumbs-up");
    } else {
      showToast("💡 No worries! Today is a fresh opportunity to invest in your bone bank.", "fa-heart");
    }
  }

  function showPastDayNotice() {
    playSound('tap');
    showToast('ℹ️ Past day logs are view-only and cannot be edited.', 'fa-lock');
  }

  // Consecutive completed days ending today (or yesterday, if today isn't finished yet).
  function isDayComplete(iso) {
    const diet = state.checkedDietMilestones[iso];
    const ex = state.checkedExerciseMilestones[iso];
    const exTarget = getDailyExerciseTarget();
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

  function selectCalendarDate(isoDate, dayName) {
    playSound('tap');
    state.selectedCalendarDate = isoDate;
    state.selectedCalendarDay = dayName;
    BoneDB.save();
    renderBuildDietView();
  }

  function selectCalendarDay(day) {
    playSound('tap');
    state.selectedCalendarDay = day;
    const weekDays = getWeekDays(state.calendarWeekOffset || 0);
    const found = weekDays.find(d => d.dayName === day);
    if (found) {
      state.selectedCalendarDate = found.isoDate;
    }
    renderBuildDietView();
  }

  function prevCalendarWeek() {
    playSound('tap');
    state.calendarWeekOffset = (state.calendarWeekOffset || 0) - 1;
    const weekDays = getWeekDays(state.calendarWeekOffset);
    state.selectedCalendarDate = weekDays[0].isoDate;
    state.selectedCalendarDay = weekDays[0].dayName;
    renderBuildDietView();
  }

  function nextCalendarWeek() {
    playSound('tap');
    state.calendarWeekOffset = (state.calendarWeekOffset || 0) + 1;
    const weekDays = getWeekDays(state.calendarWeekOffset);
    state.selectedCalendarDate = weekDays[0].isoDate;
    state.selectedCalendarDay = weekDays[0].dayName;
    renderBuildDietView();
  }

  function jumpToTodayCalendar() {
    playSound('tap');
    state.calendarWeekOffset = 0;
    state.selectedCalendarDate = getTodayISODate();
    state.selectedCalendarDay = getTodayDayName();
    renderBuildDietView();
  }

  function toggleDietMilestone(dateKey, milestoneId) {
    if (!milestoneId) {
      milestoneId = dateKey;
      dateKey = state.selectedCalendarDate || getTodayISODate();
    }
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
    markDayForSync(dateKey);
    const wasDone = set.has(milestoneId);
    if (wasDone) {
      set.delete(milestoneId);
      if (state.checkedDietItems && state.checkedDietItems[dateKey]) {
        delete state.checkedDietItems[dateKey][milestoneId];
      }
    } else {
      set.add(milestoneId);
      if (!state.checkedDietItems) state.checkedDietItems = {};
      if (!state.checkedDietItems[dateKey]) state.checkedDietItems[dateKey] = {};
      state.checkedDietItems[dateKey][milestoneId] = [0, 1, 2, 3, 4];
    }
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

  function toggleDietItem(dateKey, slotId, itemIdx, totalItems) {
    if (typeof itemIdx === 'undefined') {
      slotId = dateKey;
      dateKey = state.selectedCalendarDate || getTodayISODate();
      itemIdx = 0;
      totalItems = 1;
    }
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
    if (!state.checkedDietItems) state.checkedDietItems = {};
    if (!state.checkedDietItems[dateKey]) state.checkedDietItems[dateKey] = {};

    const tot = Math.max(1, totalItems || 1);
    let current = getCheckedItemIndices(dateKey, slotId, tot).slice();
    const pos = current.indexOf(itemIdx);
    if (pos >= 0) {
      current.splice(pos, 1);
    } else {
      current.push(itemIdx);
    }
    state.checkedDietItems[dateKey][slotId] = current;

    if (!(state.checkedDietMilestones[dateKey] instanceof Set)) state.checkedDietMilestones[dateKey] = new Set();
    const set = state.checkedDietMilestones[dateKey];
    markDayForSync(dateKey);

    const wasSlotDone = set.has(slotId);
    if (current.length >= tot) {
      set.add(slotId);
      state.lastToggledMilestone = slotId;
    } else {
      set.delete(slotId);
      state.lastToggledMilestone = null;
    }

    updateActiveStreak();
    if (!wasSlotDone && set.size === 5) {
      playSound('success');
      celebrate('big');
      showToast(`All 5 done! ${state.activeStreakDays}-day streak 🔥`, 'fa-fire');
    }

    BoneDB.save();
    renderBuildDietView();
  }

  // B. EXERCISE SUBVIEW (DAILY MOVEMENTS & WORKOUT TIMER)
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
    document.querySelectorAll('#buildSubViewExercise video').forEach(v => v.pause());
  }

  // --------------------------------------------------------------------------
  // GUIDED WORKOUTS (Exercise tab): home → detail sheet → full-screen player
  // --------------------------------------------------------------------------
  const READY_SEC = 10;
  const REST_SEC = 10;
  const BODY_REGION_LABELS = {
    neck: 'Neck', shoulders: 'Shoulders', chest: 'Chest', upperBack: 'Upper back', arms: 'Arms & wrists',
    core: 'Tummy & core', lowerBack: 'Lower back', hips: 'Hips & glutes', thighs: 'Thighs',
    calves: 'Calves & shins', ankles: 'Ankles & feet'
  };

  function getDailyExerciseTarget() {
    const groups = (BONE_SIP_DATA.exerciseGroups || []).filter(g => (BONE_SIP_DATA.workoutLibrary || []).some(e => e.group === g.id));
    return Math.max(1, groups.length);
  }

  function workoutLib() {
    return BONE_SIP_DATA.workoutLibrary || [];
  }

  function findWorkout(id) {
    return workoutLib().find(e => e.id === id);
  }

  function getExDuration(ex) {
    return (state.exerciseDurations && state.exerciseDurations[ex.id]) || ex.durationSec || 45;
  }

  function fmtClock(sec) {
    const s = Math.max(0, Math.round(sec));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  function exVideoSrc(ex) {
    if (!ex || !ex.video) return '';
    return (state.selectedCoach === 'female' ? ex.video.female : ex.video.male) || ex.video.male || ex.video.female || '';
  }

  function exPosterSrc(ex) {
    const v = exVideoSrc(ex);
    return v ? v.replace('assets/exercises/', 'assets/exercises/posters/').replace(/\.mp4$/i, '.webp') : '';
  }

  function getExerciseSetFor(iso) {
    const prev = state.checkedExerciseMilestones[iso];
    if (!(prev instanceof Set)) state.checkedExerciseMilestones[iso] = new Set(Array.isArray(prev) ? prev : []);
    return state.checkedExerciseMilestones[iso];
  }

  function isExerciseDayComplete(iso) {
    const set = state.checkedExerciseMilestones[iso];
    return !!(set && set.size >= getDailyExerciseTarget());
  }

  // One move from each group, rotating daily so the routine stays varied.
  function todaysMix() {
    const dayNumber = Math.floor(new Date(`${getTodayISODate()}T00:00:00`).getTime() / 86400000);
    return (BONE_SIP_DATA.exerciseGroups || []).map(g => {
      const list = workoutLib().filter(e => e.group === g.id);
      return list.length ? list[dayNumber % list.length] : null;
    }).filter(Boolean);
  }

  function challengeStats() {
    const doneDays = Object.keys(state.checkedExerciseMilestones)
      .filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k) && isExerciseDayComplete(k)).length;
    const todayDone = isExerciseDayComplete(getTodayISODate());
    const week = getWeekDays(0).map(d => ({ label: I18N.current() === 'en' ? d.dayShort.slice(0, 1) : I18N.date(d.date, { weekday: 'narrow' }), iso: d.isoDate, done: isExerciseDayComplete(d.isoDate), today: d.isToday }));
    return {
      doneDays: Math.min(28, doneDays),
      day: Math.min(28, doneDays + (todayDone ? 0 : 1)),
      weekDone: week.filter(d => d.done).length,
      week
    };
  }

  function exThumbHtml(ex, size = 'sm') {
    const poster = exPosterSrc(ex);
    if (poster) {
      // Looping preview; setupLazyVideos() only loads/plays it while it's on screen.
      return `<div class="wk-thumb ${size}"><video data-src="${exVideoSrc(ex)}" poster="${poster}" muted loop playsinline preload="none" aria-hidden="true"></video></div>`;
    }
    return `<div class="wk-thumb ${size} illus">${img3d(ex.img || 'running', '', size === 'sm' ? 48 : 64)}</div>`;
  }

  function bodyMapSvg(focus = [], focus2 = []) {
    const fill = (r) => focus.includes(r) ? '#D6265A' : focus2.includes(r) ? '#F49BB3' : '#E7E3EF';
    const figure = (x, side) => `
      <g transform="translate(${x},0)">
        <circle cx="50" cy="16" r="12" fill="#E7E3EF"/>
        <rect x="45" y="27" width="10" height="9" rx="3" fill="${fill('neck')}"/>
        <ellipse cx="29" cy="43" rx="10" ry="8" fill="${fill('shoulders')}"/>
        <ellipse cx="71" cy="43" rx="10" ry="8" fill="${fill('shoulders')}"/>
        <rect x="34" y="37" width="32" height="30" rx="8" fill="${fill(side === 'front' ? 'chest' : 'upperBack')}"/>
        <rect x="16" y="49" width="11" height="34" rx="5.5" fill="${fill('arms')}"/>
        <rect x="73" y="49" width="11" height="34" rx="5.5" fill="${fill('arms')}"/>
        <rect x="13" y="85" width="10" height="32" rx="5" fill="${fill('arms')}"/>
        <rect x="77" y="85" width="10" height="32" rx="5" fill="${fill('arms')}"/>
        <rect x="36" y="69" width="28" height="26" rx="6" fill="${fill(side === 'front' ? 'core' : 'lowerBack')}"/>
        <rect x="34" y="97" width="32" height="18" rx="8" fill="${fill('hips')}"/>
        <rect x="35" y="117" width="14" height="46" rx="7" fill="${fill('thighs')}"/>
        <rect x="51" y="117" width="14" height="46" rx="7" fill="${fill('thighs')}"/>
        <rect x="36" y="166" width="12" height="40" rx="6" fill="${fill('calves')}"/>
        <rect x="52" y="166" width="12" height="40" rx="6" fill="${fill('calves')}"/>
        <ellipse cx="42" cy="211" rx="8" ry="4.5" fill="${fill('ankles')}"/>
        <ellipse cx="58" cy="211" rx="8" ry="4.5" fill="${fill('ankles')}"/>
        ${side === 'back' ? '<line x1="50" y1="38" x2="50" y2="95" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>' : ''}
        <text x="50" y="230" text-anchor="middle" font-size="10" font-weight="700" fill="#6B6580">${side === 'front' ? 'Front' : 'Back'}</text>
      </g>`;
    return `<svg viewBox="0 0 220 236" class="body-map" role="img" aria-label="Body areas this exercise works">${figure(5, 'front')}${figure(115, 'back')}</svg>`;
  }

  let exerciseHomeRendered = false;
  function renderBuildExerciseView() {
    const root = document.getElementById('buildSubViewExercise');
    if (!root) return;
    try {
      const groups = BONE_SIP_DATA.exerciseGroups || [];
      if (!groups.some(g => g.id === state.exerciseGroup)) state.exerciseGroup = groups[0] ? groups[0].id : 'strength';
      const group = groups.find(g => g.id === state.exerciseGroup) || groups[0];
      const todaySet = getExerciseSetFor(getTodayISODate());
      const target = getDailyExerciseTarget();
      const mix = todaysMix();
      const mixLeft = mix.filter(e => !todaySet.has(e.id));
      const stats = challengeStats();
      const list = workoutLib().filter(e => e.group === group.id);
      const minutesFor = (arr) => Math.max(1, Math.round(arr.reduce((a, e) => a + getExDuration(e) + REST_SEC, 0) / 60));
      const dayDone = todaySet.size >= target;
      const ctaLabel = dayDone ? 'Do today’s workout again' : (mixLeft.length < mix.length ? 'Continue today’s workout' : 'Start today’s workout');

      root.classList.toggle('no-anim', exerciseHomeRendered);
      exerciseHomeRendered = true;

      root.innerHTML = `
        <section class="wk-hero fade-up">
          <div class="wk-hero-top">
            <span class="wk-badge"><i class="fa-solid fa-trophy"></i> 28-day challenge</span>
            <span class="wk-week-count" title="Workouts this week"><img src="${ICON_BASE}fire.webp" alt="" width="22" height="22"> ${stats.weekDone}/7</span>
          </div>
          <h2>Strong Bones Plan</h2>
          <div class="wk-day">${t('Day {n} of {total}', { n: `<b>${stats.day}</b>`, total: 28 })}</div>
          <div class="wk-progress" role="progressbar" aria-valuemin="0" aria-valuemax="28" aria-valuenow="${stats.doneDays}"><i style="width: ${Math.round((stats.doneDays / 28) * 100)}%;"></i></div>
          <div class="wk-week">
            ${stats.week.map(d => `<span class="${d.done ? 'done' : ''} ${d.today ? 'today' : ''}" title="${d.iso}">${d.done ? '<i class="fa-solid fa-check"></i>' : d.label}</span>`).join('')}
          </div>
          <div class="wk-today">
            <div class="wk-today-icons">${mix.map(e => `<span class="${todaySet.has(e.id) ? 'done' : ''}">${img3d((groups.find(g => g.id === e.group) || {}).img || e.img, '', 30)}</span>`).join('')}</div>
            <div class="wk-today-text">
              <b>Today’s workout</b>
              <span><span id="exerciseProgressDisplay">${Math.min(todaySet.size, target)} / ${target}</span> done · about ${minutesFor(mix)} min</span>
            </div>
          </div>
          <button class="wk-hero-btn" onclick="BoneApp.startWorkout('today')"><i class="fa-solid fa-play"></i> ${ctaLabel}</button>
        </section>

        <div class="wk-safety fade-up" style="--i: 1;">
          ${img3d('chair', '', 40)}
          <p><b>Stay safe:</b> keep a sturdy chair nearby. Stop if you feel pain, dizziness or chest discomfort.</p>
        </div>

        <div class="coach-selector-bar fade-up" style="--i: 2;">
          <span class="coach-label"><i class="fa-solid fa-video"></i> Video coach</span>
          <div class="coach-pill-toggle">
            <button class="coach-btn ${state.selectedCoach !== 'female' ? 'active' : ''}" id="coachBtnMale" onclick="BoneApp.switchGlobalCoach('male')"><i class="fa-solid fa-person"></i> Male</button>
            <button class="coach-btn ${state.selectedCoach === 'female' ? 'active' : ''}" id="coachBtnFemale" onclick="BoneApp.switchGlobalCoach('female')"><i class="fa-solid fa-person-dress"></i> Female</button>
          </div>
        </div>

        <h3 class="wk-section-title">Choose a focus</h3>
        <div class="wk-groups" role="tablist">
          ${groups.map((g, i) => {
            const count = workoutLib().filter(e => e.group === g.id).length;
            return `
              <button class="wk-group pop ${g.id === group.id ? 'active' : ''}" style="--i: ${i};" role="tab" aria-selected="${g.id === group.id}" onclick="BoneApp.selectExerciseGroup('${g.id}')">
                ${img3d(g.img, '', 52)}
                <b>${g.label}</b>
                <small>${count} ${count === 1 ? 'move' : 'moves'}</small>
              </button>`;
          }).join('')}
        </div>

        <div class="wk-list-head">
          <div>
            <h3>${group.label}</h3>
            <span>${group.blurb} · ${list.length} ${list.length === 1 ? 'move' : 'moves'} · ~${minutesFor(list)} min</span>
          </div>
          <button class="wk-start-all" onclick="BoneApp.startWorkout('${group.id}')"><i class="fa-solid fa-play"></i> Start all</button>
        </div>
        <div class="wk-list">
          ${list.map((ex, i) => {
            const done = todaySet.has(ex.id);
            return `
              <div class="wk-row fade-up ${done ? 'done' : ''}" style="--i: ${i};" onclick="BoneApp.openExerciseDetail('${ex.id}')">
                ${exThumbHtml(ex)}
                <div class="wk-row-body">
                  <b>${ex.name}</b>
                  <span>${fmtClock(getExDuration(ex))} · ${ex.reps}</span>
                  <small class="wk-level ${ex.level === 'Easy' ? 'easy' : 'mod'}">${ex.level}</small>
                </div>
                <button type="button" class="wk-row-check ${done ? 'done' : ''}" onclick="event.stopPropagation(); BoneApp.toggleExerciseMilestone('${getTodayISODate()}', '${ex.id}');" aria-label="${done ? 'Mark incomplete' : 'Mark done'}">
                  <i class="fa-solid ${done ? 'fa-check' : 'fa-plus'}"></i>
                </button>
              </div>`;
          }).join('')}
        </div>`;
      setupLazyVideos(root);
    } catch (err) {
      console.error('renderBuildExerciseView error:', err);
    }
  }

  function selectExerciseGroup(groupId) {
    playSound('tap');
    state.exerciseGroup = groupId;
    BoneDB.save();
    renderBuildExerciseView();
    const head = document.querySelector('#buildSubViewExercise .wk-list-head');
    if (head) head.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  // ---------------- Detail sheet ----------------
  let detailExerciseId = null;

  function openExerciseDetail(exId) {
    const ex = findWorkout(exId);
    if (!ex) return;
    playSound('tap');
    detailExerciseId = exId;
    pauseAllCardVideos();
    renderExerciseDetail();
    const sheet = document.getElementById('exDetailSheet');
    if (sheet) {
      sheet.style.display = 'flex';
      const card = sheet.querySelector('.exd-card');
      if (card) card.scrollTop = 0;
    }
  }

  function renderExerciseDetail() {
    const ex = findWorkout(detailExerciseId);
    const body = document.getElementById('exDetailBody');
    if (!ex || !body) return;
    const group = (BONE_SIP_DATA.exerciseGroups || []).find(g => g.id === ex.group) || { label: '' };
    const video = exVideoSrc(ex);
    const focusAll = [...(ex.focus || []), ...(ex.focus2 || [])];
    const done = getExerciseSetFor(getTodayISODate()).has(ex.id);
    body.innerHTML = `
      <div class="exd-media">
        ${video
          ? `<video src="${video}" poster="${exPosterSrc(ex)}" autoplay loop muted playsinline aria-label="${escapeHtml(t('{name} demonstration', { name: tr(ex.name) }))}"></video>`
          : `<div class="exd-illus">${img3d(ex.img || 'running', 'float', 110)}<span><i class="fa-solid fa-list-ol"></i> Follow the steps below</span></div>`}
        <button class="exd-close" onclick="BoneApp.closeExerciseDetail()" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="exd-body">
        <span class="step-chip build">${tr(group.label)}${done ? ` · <i class="fa-solid fa-check"></i> ${t('Done today')}` : ''}</span>
        <h2 class="exd-title">${ex.name}</h2>
        <div class="exd-stats">
          <div><b>${ex.level}</b><span>Level</span></div>
          <div><b>${fmtClock(getExDuration(ex))}</b><span>Time</span></div>
          <div><b>${ex.reps}</b><span>Target</span></div>
        </div>

        <div class="exd-duration">
          <span>Duration</span>
          <div class="exd-stepper">
            <button onclick="BoneApp.adjustExerciseDuration('${ex.id}', -15)" aria-label="Shorter"><i class="fa-solid fa-minus"></i></button>
            <b>${fmtClock(getExDuration(ex))}</b>
            <button onclick="BoneApp.adjustExerciseDuration('${ex.id}', 15)" aria-label="Longer"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>

        <h4 class="exd-h">How to do it</h4>
        <ol class="exd-steps">${(ex.how || []).map(s => `<li>${s}</li>`).join('')}</ol>
        ${ex.safety ? `<div class="exd-safety"><i class="fa-solid fa-shield-heart"></i><span>${ex.safety}</span></div>` : ''}

        ${focusAll.length ? `
          <h4 class="exd-h">Focus area</h4>
          <div class="exd-focus">
            ${(ex.focus || []).map(r => `<span class="primary"><i></i>${BODY_REGION_LABELS[r] || r}</span>`).join('')}
            ${(ex.focus2 || []).map(r => `<span><i></i>${BODY_REGION_LABELS[r] || r}</span>`).join('')}
          </div>
          ${bodyMapSvg(ex.focus, ex.focus2)}` : ''}

        ${(ex.bones || []).length ? `
          <h4 class="exd-h">Bones it strengthens</h4>
          <div class="exd-bones">${ex.bones.map(b => `<span>${img3d('bone', '', 22)} ${b}</span>`).join('')}</div>` : ''}

        <h4 class="exd-h">Why it helps</h4>
        <ul class="exd-benefits">${(ex.benefits || []).map(b => `<li><i class="fa-solid fa-circle-check"></i>${b}</li>`).join('')}</ul>

        <div class="exd-quick-action" style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
          <button type="button" class="btn btn-full ${done ? 'btn-outline' : 'primary'}" onclick="BoneApp.toggleExerciseMilestone('${getTodayISODate()}', '${ex.id}'); BoneApp.renderExerciseDetail();" style="height: 48px; font-weight: 800; font-size: 0.98rem;">
            <i class="fa-solid ${done ? 'fa-circle-check' : 'fa-check'}"></i> ${done ? 'Completed today ✓ (tap to undo)' : 'Mark as completed'}
          </button>
        </div>
      </div>`;
  }

  function closeExerciseDetail(silent) {
    if (!silent) playSound('tap');
    const sheet = document.getElementById('exDetailSheet');
    if (sheet) {
      const v = sheet.querySelector('video');
      if (v) v.pause();
      sheet.style.display = 'none';
    }
    // Resume the looping thumbnails that are still on screen.
    const root = document.getElementById('buildSubViewExercise');
    if (root && root.style.display !== 'none') {
      setupLazyVideos(root);
    }
  }

  function startDetailExercise(scope) {
    const ex = findWorkout(detailExerciseId);
    if (!ex) return;
    startWorkout(scope === 'group' ? ex.group : ex.id);
  }

  function adjustExerciseDuration(exId, delta) {
    const ex = findWorkout(exId);
    if (!ex) return;
    playSound('tap');
    if (!state.exerciseDurations) state.exerciseDurations = {};
    const next = Math.min(180, Math.max(15, getExDuration(ex) + delta));
    state.exerciseDurations[exId] = next;
    BoneDB.save();
    renderExerciseDetail();
    renderBuildExerciseView();
  }

  // ---------------- Full-screen player ----------------
  const player = { queue: [], index: 0, phase: 'idle', remaining: 0, total: 0, paused: false, timer: null, completed: [], label: '', wakeLock: null };

  function voiceOn() {
    try { return localStorage.getItem('bonesip_voice') !== 'off'; } catch (e) { return true; }
  }

  function getVolume() {
    try {
      const v = localStorage.getItem('bonesip_player_vol');
      return v !== null ? parseFloat(v) : 1;
    } catch (e) { return 1; }
  }

  function setVolume(val) {
    val = Math.max(0, Math.min(1, parseFloat(val) || 0));
    try { localStorage.setItem('bonesip_player_vol', String(val)); } catch (e) {}
    try { localStorage.setItem('bonesip_voice', val > 0 ? 'on' : 'off'); } catch (e) {}
    updateVoiceButton();
    const v = document.getElementById('plVideo');
    if (v) v.volume = val;
    if (voiceAudio) voiceAudio.volume = val;
  }

  let voiceAudio = null;
  function stopVoice() {
    if (voiceAudio) {
      try { voiceAudio.pause(); voiceAudio.currentTime = 0; } catch (e) {}
      voiceAudio = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  function playVoiceCue(cueName, fallbackText, onDone) {
    const vol = getVolume();
    if (vol <= 0 || !voiceOn()) return;
    stopVoice();

    const code = (typeof I18N !== 'undefined' && I18N.current) ? I18N.current() : 'en';
    const audioSrc = `assets/audio/voice/${code}/${cueName}.mp3`;

    const audio = new Audio(audioSrc);
    audio.volume = vol;
    voiceAudio = audio;

    let completed = false;
    const finish = () => {
      if (!completed) {
        completed = true;
        voiceAudio = null;
        if (onDone) onDone();
      }
    };

    audio.onended = finish;
    audio.onerror = () => {
      speak(fallbackText || cueName);
      if (onDone) setTimeout(onDone, 1200);
    };

    audio.play().catch(() => {
      speak(fallbackText || cueName);
      if (onDone) setTimeout(onDone, 1200);
    });
  }

  function speak(text) {
    const vol = getVolume();
    if (vol <= 0 || !voiceOn() || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const code = (typeof I18N !== 'undefined' && I18N.current) ? I18N.current() : 'en';
      const spoken = (code !== 'en' && typeof I18N !== 'undefined' && I18N.tr) ? I18N.tr(text) : text;
      const u = new SpeechSynthesisUtterance(spoken);
      u.rate = 0.9;
      u.volume = vol;
      const langTags = {
        hi: 'hi-IN', bn: 'bn-IN', mr: 'mr-IN', te: 'te-IN', ta: 'ta-IN',
        gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN', en: 'en-IN'
      };
      u.lang = langTags[code] || (code !== 'en' ? `${code}-IN` : 'en-IN');
      const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      if (voices.length && code !== 'en') {
        const match = voices.find(v => {
          const l = String(v.lang || '').toLowerCase().replace('_', '-');
          return l === u.lang.toLowerCase() || l.startsWith(code + '-');
        });
        if (match) u.voice = match;
      }
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is optional */ }
  }

  function toggleVoice(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const pop = document.getElementById('plVolPop');
    if (pop) {
      pop.hidden = !pop.hidden;
      if (!pop.hidden) updateVoiceButton();
    }
  }

  function onVolumeChange(val) {
    setVolume(val);
  }

  function updateVoiceButton() {
    const btn = document.getElementById('plVoiceBtn');
    if (!btn) return;
    const vol = getVolume();
    const isMuted = vol <= 0 || !voiceOn();
    btn.style.display = ('speechSynthesis' in window || typeof Audio !== 'undefined') ? '' : 'none';
    const iconClass = isMuted ? 'fa-volume-xmark' : (vol < 0.5 ? 'fa-volume-low' : 'fa-volume-high');
    btn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    btn.setAttribute('aria-label', `Volume: ${Math.round(vol * 100)}%`);
    const slider = document.getElementById('plVolSlider');
    if (slider) { slider.value = vol; slider.style.setProperty('--vol', `${Math.round(vol * 100)}%`); }
    const valEl = document.getElementById('plVolVal');
    if (valEl) valEl.textContent = `${Math.round(vol * 100)}%`;
  }

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) player.wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) { /* not supported or denied */ }
  }

  function releaseWakeLock() {
    try { if (player.wakeLock) player.wakeLock.release(); } catch (e) { /* ignore */ }
    player.wakeLock = null;
  }

  function startWorkout(kind) {
    const groups = BONE_SIP_DATA.exerciseGroups || [];
    let queue;
    let label;
    if (kind === 'today') {
      const set = getExerciseSetFor(getTodayISODate());
      const mix = todaysMix();
      const left = mix.filter(e => !set.has(e.id));
      queue = (left.length ? left : mix).map(e => e.id);
      label = 'Today’s workout';
    } else if (groups.some(g => g.id === kind)) {
      queue = workoutLib().filter(e => e.group === kind).map(e => e.id);
      label = groups.find(g => g.id === kind).label;
    } else if (findWorkout(kind)) {
      queue = [kind];
      label = findWorkout(kind).name;
    }
    if (!queue || !queue.length) return;

    playSound('tap');
    closeExerciseDetail(true);
    pauseAllCardVideos();
    Object.assign(player, { queue, index: 0, completed: [], label, paused: false });

    const el = document.getElementById('workoutPlayer');
    if (el) el.hidden = false;
    document.body.classList.add('player-open');
    updateVoiceButton();
    requestWakeLock();
    enterPhase('ready');
  }

  function currentWorkout() {
    return findWorkout(player.queue[player.index]);
  }

  function enterPhase(phase) {
    clearInterval(player.timer);
    player.phase = phase;
    player.paused = false;
    const ex = currentWorkout();

    if (phase === 'ready') {
      player.total = player.remaining = READY_SEC;
      if (ex && ex.id) {
        playVoiceCue('ready', 'Get ready.', () => {
          if (player.phase === 'ready' && !player.paused) {
            playVoiceCue(ex.id, ex.name);
          }
        });
      } else {
        playVoiceCue('ready', 'Get ready.');
      }
    } else if (phase === 'work') {
      player.total = player.remaining = getExDuration(ex);
      playVoiceCue('begin', 'Begin.');
    } else if (phase === 'rest') {
      player.total = player.remaining = REST_SEC;
      const nextEx = player.queue[player.index + 1] ? findWorkout(player.queue[player.index + 1]) : null;
      if (nextEx && nextEx.id) {
        playVoiceCue('rest', 'Rest.', () => {
          if (player.phase === 'rest' && !player.paused) {
            playVoiceCue(nextEx.id, nextEx.name);
          }
        });
      } else {
        playVoiceCue('rest', 'Rest.');
      }
    } else if (phase === 'done') {
      releaseWakeLock();
      celebrate('big');
      playSound('success');
      playVoiceCue('completed', 'Workout complete. Well done!');
    }

    renderPlayer();
    if (phase !== 'done') player.timer = setInterval(playerTick, 1000);
  }

  function playerTick() {
    if (player.paused) return;
    player.remaining--;
    if (player.remaining > 0 && player.remaining <= 3 && player.phase !== 'rest') playSound('timer_beep');
    if (player.remaining <= 0) {
      if (player.phase === 'ready') enterPhase('work');
      else if (player.phase === 'work') finishCurrentExercise(true);
      else if (player.phase === 'rest') advanceToNext();
      return;
    }
    updatePlayerClock();
  }

  function markWorkoutDone(exId) {
    const iso = getTodayISODate();
    const set = getExerciseSetFor(iso);
    const wasComplete = set.size >= getDailyExerciseTarget();
    set.add(exId);
    updateActiveStreak();
    BoneDB.save();
    return !wasComplete && set.size >= getDailyExerciseTarget();
  }

  function finishCurrentExercise(completed) {
    const ex = currentWorkout();
    if (completed && ex) {
      player.completed.push(ex.id);
      if (markWorkoutDone(ex.id)) player.dailyGoalReached = true;
      playSound('check');
    }
    if (player.index >= player.queue.length - 1) enterPhase('done');
    else enterPhase('rest');
  }

  function advanceToNext() {
    player.index++;
    enterPhase('work');
  }

  function playerTogglePause() {
    if (player.phase === 'done') return;
    player.paused = !player.paused;
    const v = document.getElementById('plVideo');
    if (v) {
      if (player.paused) v.pause();
      else if (player.phase === 'work') v.play().catch(() => {});
    }
    if (player.paused) stopVoice();
    renderPlayerControls();
  }

  function playerCompleteCurrent() {
    playSound('tap');
    if (player.phase === 'ready') enterPhase('work');
    else if (player.phase === 'work') finishCurrentExercise(true);
    else if (player.phase === 'rest') advanceToNext();
  }

  function playerSkip() {
    playSound('tap');
    if (player.phase === 'ready') enterPhase('work');
    else if (player.phase === 'work') finishCurrentExercise(false);
    else if (player.phase === 'rest') advanceToNext();
  }

  function playerAddRest() {
    if (player.phase !== 'rest') return;
    playSound('tap');
    player.remaining += 10;
    player.total += 10;
    updatePlayerClock();
  }

  function closePlayer(force) {
    const active = ['ready', 'work', 'rest'].includes(player.phase);
    if (active && !force && !window.confirm(t('End this workout? Moves you finished are saved.'))) return;
    clearInterval(player.timer);
    player.phase = 'idle';
    stopVoice();
    const v = document.getElementById('plVideo');
    if (v) v.pause();
    releaseWakeLock();
    const el = document.getElementById('workoutPlayer');
    if (el) el.hidden = true;
    const pop = document.getElementById('plVolPop');
    if (pop) pop.hidden = true;
    document.body.classList.remove('player-open');
    if (player.dailyGoalReached) {
      showToast(`Daily workout done! ${state.activeStreakDays}-day streak 🔥`, 'fa-fire');
      player.dailyGoalReached = false;
    }
    renderBuildExerciseView();
    if (document.getElementById('buildSubViewDiet') && state.completedPillars.build) renderBuildDietView();
  }

  function updatePlayerClock() {
    const clock = document.getElementById(player.phase === 'rest' ? 'plRestTimer' : (player.phase === 'ready' ? 'plReadyNum' : 'plTimer'));
    if (clock) clock.textContent = player.phase === 'ready' ? player.remaining : fmtClock(player.remaining);
    const bar = document.getElementById(player.phase === 'rest' ? 'plRestBar' : 'plBar');
    if (bar) bar.style.width = `${player.total ? 100 - (player.remaining / player.total) * 100 : 0}%`;
  }

  function renderPlayerControls() {
    const btn = document.getElementById('plPauseBtn');
    if (btn) btn.innerHTML = player.paused ? '<i class="fa-solid fa-play"></i> Resume' : '<i class="fa-solid fa-pause"></i> Pause';
    const wrap = document.getElementById('workoutPlayer');
    if (wrap) wrap.classList.toggle('paused', player.paused);
  }

  function setPlayerMedia(ex, { autoplay }) {
    const media = document.getElementById('plMedia');
    if (!media) return;
    const src = exVideoSrc(ex);
    if (src) {
      let v = document.getElementById('plVideo');
      if (!v) {
        media.innerHTML = '<video id="plVideo" loop muted playsinline></video>';
        v = document.getElementById('plVideo');
      }
      if (v.getAttribute('src') !== src) {
        v.setAttribute('poster', exPosterSrc(ex));
        v.src = src;
      }
      if (autoplay) v.play().catch(() => {});
      else v.pause();
    } else {
      media.innerHTML = `
        <div class="pl-illus">
          ${img3d(ex.img || 'running', 'float', 96)}
          <ol>${(ex.how || []).map(s => `<li>${s}</li>`).join('')}</ol>
        </div>`;
    }
  }

  function renderPlayer() {
    const ex = currentWorkout();
    const wrap = document.getElementById('workoutPlayer');
    if (!wrap || !ex) return;
    wrap.dataset.phase = player.phase;
    const total = player.queue.length;
    const groupLabel = ((BONE_SIP_DATA.exerciseGroups || []).find(g => g.id === ex.group) || {}).label || '';
    const next = findWorkout(player.queue[player.index + 1]);

    const segs = document.getElementById('plSegs');
    if (segs) {
      segs.innerHTML = player.queue.map((id, i) => {
        const cls = player.completed.includes(id) ? 'done' : (i === player.index && player.phase !== 'done' ? 'now' : (i < player.index ? 'skipped' : ''));
        return `<span class="${cls}"></span>`;
      }).join('');
    }

    const ready = document.getElementById('plReady');
    const rest = document.getElementById('plRest');
    const done = document.getElementById('plDone');
    if (ready) ready.hidden = player.phase !== 'ready';
    if (rest) rest.hidden = player.phase !== 'rest';
    if (done) done.hidden = player.phase !== 'done';

    if (player.phase === 'ready' || player.phase === 'work') {
      setPlayerMedia(ex, { autoplay: player.phase === 'work' });
      const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      set('plCount', `Move ${player.index + 1} of ${total} · ${groupLabel}`);
      set('plName', ex.name);
      set('plReps', ex.reps);
      set('plReadyName', ex.name);
      set('plSafety', ex.safety || 'Move slowly and keep support nearby.');
      set('plNext', next ? t('Next: {name}', { name: tr(next.name) }) : 'Last move. You’re nearly done!');
    }

    if (player.phase === 'rest' && next) {
      const v = document.getElementById('plVideo');
      if (v) v.pause();
      const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      set('plRestNextLabel', `Next ${player.index + 2}/${total}`);
      set('plRestNextName', next.name);
      set('plRestNextTime', fmtClock(getExDuration(next)));
      const prev = document.getElementById('plRestPreview');
      if (prev) {
        const poster = exPosterSrc(next);
        prev.innerHTML = poster ? `<img src="${poster}" alt="">` : img3d(next.img || 'running', 'float', 110);
      }
    }

    if (player.phase === 'done') {
      const v = document.getElementById('plVideo');
      if (v) v.pause();
      const doneList = document.getElementById('plDoneList');
      const minutes = Math.max(1, Math.round(player.completed.reduce((a, id) => a + getExDuration(findWorkout(id) || {}), 0) / 60));
      const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      set('plDoneMoves', `${player.completed.length}`);
      set('plDoneMinutes', `${minutes}`);
      set('plDoneStreak', `${state.activeStreakDays}`);
      set('plDoneTitle', player.completed.length ? 'Well done!' : 'Workout ended');
      if (doneList) {
        doneList.innerHTML = player.queue.map(id => {
          const w = findWorkout(id);
          const ok = player.completed.includes(id);
          return `<li class="${ok ? 'ok' : ''}"><i class="fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-minus'}"></i>${w ? w.name : id}</li>`;
        }).join('');
      }
    }

    updatePlayerClock();
    renderPlayerControls();
  }

  function toggleExerciseMilestone(_dateKey, exId) {
    // Exercise is always logged against today.
    const key = getTodayISODate();
    playSound('check');
    if (!(state.checkedExerciseMilestones[key] instanceof Set)) {
      const prev = state.checkedExerciseMilestones[key];
      state.checkedExerciseMilestones[key] = new Set(Array.isArray(prev) ? prev : []);
    }
    const set = state.checkedExerciseMilestones[key];
    markDayForSync(key);
    const wasDone = set.has(exId);
    if (wasDone) set.delete(exId);
    else set.add(exId);

    updateActiveStreak();
    if (!wasDone && set.size >= getDailyExerciseTarget()) {
      playSound('success');
      celebrate('big');
      showToast(`Workout complete! ${state.activeStreakDays}-day streak 🔥`, 'fa-dumbbell');
    }

    BoneDB.save();
    renderBuildExerciseView();
  }

  function syncCoachToggle() {
    const btnFemale = document.getElementById('coachBtnFemale');
    const btnMale = document.getElementById('coachBtnMale');
    if (btnFemale) btnFemale.classList.toggle('active', state.selectedCoach === 'female');
    if (btnMale) btnMale.classList.toggle('active', state.selectedCoach === 'male');
  }

  function switchGlobalCoach(gender) {
    playSound('tap');
    state.selectedCoach = gender;
    BoneDB.save();
    const btnFemale = document.getElementById('coachBtnFemale');
    const btnMale = document.getElementById('coachBtnMale');
    if (btnFemale && btnMale) {
      btnFemale.classList.toggle('active', gender === 'female');
      btnMale.classList.toggle('active', gender === 'male');
    }
    renderBuildExerciseView();
  }

  // Workout Timer Controls
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

  // Legacy entry point: older buttons now open the new exercise detail sheet.
  function openWorkoutTimerModal(exId) {
    if (findWorkout(exId)) openExerciseDetail(exId);
  }

  function closeWorkoutTimerModal() {
    playSound('tap');
    clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    const vidEl = document.getElementById('timerExerciseVideo');
    if (vidEl) {
      vidEl.pause();
    }
    const modal = document.getElementById('workoutTimerModal');
    if (modal) modal.style.display = 'none';
  }

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

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // MODULE 4: PROTECT HUB VIEW
  // --------------------------------------------------------------------------
  function isRoomCheckOpen() {
    if (typeof state.protectRoomCheckOpen === 'boolean') {
      return state.protectRoomCheckOpen;
    }
    const answered = homeSafetySummary().answered;
    return answered > 0 && answered < 15;
  }

  function toggleRoomCheckDropdown(forceOpen) {
    if (typeof forceOpen === 'boolean') {
      state.protectRoomCheckOpen = forceOpen;
    } else {
      state.protectRoomCheckOpen = !isRoomCheckOpen();
    }
    playSound('tap');
    updateRoomCheckDropdownUI();
  }

  function updateRoomCheckDropdownUI() {
    const open = isRoomCheckOpen();
    const body = document.getElementById('hubRoomCheckCollapseBody');
    const chevron = document.getElementById('roomCheckDropdownChevron');
    const header = document.getElementById('hubRoomCheckDropdownHeader');
    if (body) {
      body.style.display = open ? 'block' : 'none';
    }
    if (chevron) {
      chevron.classList.toggle('open', open);
    }
    if (header) {
      header.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  }

  function renderProtectHubView(animate = false) {
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

    renderProtectSafetyAnalysis(animate);
    updateRoomCheckDropdownUI();
  }

  // Short, visual summary under the room check: a score ring, a "fix these"
  // checklist (tap a row for the full how-to) and a few daily habits.
  const SAFETY_HABITS = [
    { img: 'shoe', text: 'Wear grip shoes' },
    { img: 'bulb', text: 'Night lights on' },
    { img: 'glasses', text: 'Yearly eye check' },
    { img: 'pill', text: 'Review medicines' },
    { img: 'flamingo', text: 'Balance practice' },
    { img: 'phone', text: 'Phone within reach' }
  ];

  function renderProtectSafetyAnalysis(animate = false) {
    const container = document.getElementById('protectSafetyAnalysisCard');
    if (!container) return;

    const totals = homeSafetyTotals();
    const answered = homeSafetySummary().answered;
    const unanswered = totals.total - answered;
    const personalRisks = (BONE_SIP_DATA.boneRiskAuditFactors || []).filter(f => state.protectRiskChecked.has(f.id));
    const hazards = [];
    BONE_SIP_DATA.protectHomeAuditRooms.forEach(room => {
      const ans = state.protectHomeAuditAnswers[room.id] || {};
      room.questions.forEach(q => { if (ans[q.id] === 'no') hazards.push({ room, q }); });
    });

    // "Safe" is only said once every room question has an answer.
    let tone = 'good';
    let mood = '😊';
    let headline = t('Your home is safe');
    if (answered === 0) {
      tone = 'todo'; mood = '📝'; headline = t('Home check not done yet');
    } else if (hazards.length >= 6 || personalRisks.length >= 3) {
      tone = 'bad'; mood = '⚠️'; headline = t('High fall risk');
    } else if (hazards.length || personalRisks.length) {
      tone = 'warn'; mood = '🙂'; headline = t('A few things to fix');
    } else if (unanswered) {
      tone = 'todo'; mood = '📝'; headline = t('Finish your home check');
    }
    const ringColor = { good: '#1E9E62', warn: '#D97706', bad: '#DC2626', todo: '#4A3F7A' }[tone];
    const complete = unanswered === 0;
    const ringPct = complete ? totals.pct : Math.round((answered / totals.total) * 100);
    const startBtn = `<button type="button" class="psx-act primary psx-start" onclick="BoneApp.scrollToRoomCheck()"><i class="fa-solid fa-clipboard-check"></i> ${answered ? t('Continue room check') : t('Start room check')}</button>`;

    let listHtml;
    if (hazards.length) {
      listHtml = `
        <h4 class="psx-h"><span>🔧</span> ${t('Fix these')} <em class="psx-count">${hazards.length}</em></h4>
        <div class="psx-fixes">
          ${hazards.map(({ room, q }, i) => `
            <div class="psx-fix" style="--i:${i}">
              ${img3d(room.img || 'house', '', 38)}
              <details>
                <summary><b>${t(q.tip || q.text)}</b><span>${t(room.name)} · ${t('How?')}</span></summary>
                <p>${t(q.fix)}</p>
              </details>
              <button type="button" class="psx-done" onclick="BoneApp.markHazardFixed('${room.id}', '${q.id}')" aria-label="${escapeHtml(t('Fixed'))}" title="${escapeHtml(t('Fixed'))}">
                <i class="fa-solid fa-check"></i>
              </button>
            </div>`).join('')}
        </div>`;
    } else if (complete) {
      listHtml = `<div class="psx-note good"><span>🎉</span><b>${t('All rooms are safe. Great job!')}</b></div>`;
    } else {
      listHtml = `<div class="psx-note"><span>👆</span><b>${t('Answer the room questions above to see what to fix.')}</b></div>${startBtn}`;
    }
    if (hazards.length && unanswered) {
      listHtml += `<div class="psx-note"><span>📝</span><b>${t('{0} questions not answered yet.', { 0: unanswered })}</b></div>${startBtn}`;
    }

    container.classList.toggle('psx-anim', animate);
    container.innerHTML = `
      <div class="psx-hero ${tone}">
        <div class="psx-ring" style="--p:${ringPct}; --c:${ringColor};" role="img" aria-label="${complete ? `${totals.pct}% ${t('safe')}` : `${answered}/${totals.total} ${t('answered')}`}">
          <div>${complete ? `<b>${totals.pct}%</b><span>${t('safe')}</span>` : `<b class="sm">${answered}/${totals.total}</b><span>${t('answered')}</span>`}</div>
        </div>
        <div class="psx-hero-body">
          <h3><span class="psx-mood">${mood}</span> ${headline}</h3>
          <div class="psx-pills">
            ${answered ? `<span class="stat-pill">${img3d('house', '', 20)} <b>${totals.safe}</b>&nbsp;${t('safe')}</span>` : ''}
            ${hazards.length ? `<span class="stat-pill warn">🔧 <b>${hazards.length}</b>&nbsp;${t('to fix')}</span>` : ''}
            ${unanswered ? `<span class="stat-pill">📝 <b>${unanswered}</b>&nbsp;${t('not answered')}</span>` : ''}
            ${personalRisks.length ? `<span class="stat-pill warn">${img3d('warning', '', 20)} <b>${personalRisks.length}</b>&nbsp;${t('risk signs')}</span>` : ''}
          </div>
        </div>
      </div>

      ${listHtml}

      <h4 class="psx-h"><span>✨</span> ${t('Daily safety habits')}</h4>
      <div class="psx-habits">
        ${SAFETY_HABITS.map((h, i) => `
          <div class="psx-habit" style="--i:${i}">
            ${img3d(h.img, '', 40)}
            <b>${t(h.text)}</b>
          </div>`).join('')}
      </div>

      <div class="psx-actions">
        <button type="button" class="psx-act" onclick="BoneApp.askAiAboutFallSafety()">
          <img src="assets/images/ojas-avatar.svg" alt="" width="26" height="26"> ${t('Ask Ojas')}
        </button>
        <button type="button" class="psx-act" onclick="BoneApp.shareProtectSafetyWhatsApp()">
          <i class="fa-brands fa-whatsapp" style="color:#25D366"></i> ${t('Share')}
        </button>
        <button type="button" class="psx-act" onclick="BoneApp.printDocument('report')">
          <i class="fa-solid fa-file-pdf" style="color:#B1315D"></i> PDF
        </button>
      </div>
    `;
  }

  function scrollToRoomCheck() {
    playSound('tap');
    const rooms = BONE_SIP_DATA.protectHomeAuditRooms;
    const firstOpen = rooms.find(r => r.questions.some(q => !(state.protectHomeAuditAnswers[r.id] || {})[q.id]));
    if (firstOpen && firstOpen.id !== state.selectedAuditRoom) {
      state.selectedAuditRoom = firstOpen.id;
    }
    state.protectRoomCheckOpen = true;
    renderProtectHubView();
    const target = document.getElementById('protectRoomCheckCard') || document.getElementById('hubRoomTabs');
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  function markHazardFixed(roomId, questionId) {
    setHubRoomAnswer(roomId, questionId, 'yes');
    showToast(t('Nice! Marked as fixed'), 'fa-circle-check');
  }

  function shareProtectSafetyWhatsApp() {
    playSound('tap');
    const summary = homeSafetySummary();
    const hazards = [];
    summary.rows.forEach(r => {
      if (r.fixes && r.fixes.length) {
        hazards.push(`*${r.name}:*`);
        r.fixes.forEach(f => hazards.push(` • Fix: ${f}`));
      }
    });

    const msg = [
      '*BONE SIP — Home Fall-Proofing & Safety Plan*',
      `Safety Score: ${summary.safe} of ${summary.total} checks safe (${Math.round((summary.safe / summary.total) * 100)}%)`,
      '',
      hazards.length ? '*Identified Hazards to Fix:*' : '*All home areas verified safe!*',
      ...hazards,
      '',
      '*Key Prevention Habits:*',
      '1. Wear non-skid footwear indoors.',
      '2. Keep bedside and hallway nightlights on.',
      '3. Practice daily 1-leg balance & chair stand exercises.',
      '',
      'Invest in Bones. Invest in Life.'
    ].join('\n');

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  function askAiAboutFallSafety() {
    playSound('tap');
    toggleChatDrawer();
    const summary = homeSafetySummary();
    const hazardsCount = summary.total - summary.safe;
    let query = 'How can I make my home safer from falls?';
    if (hazardsCount > 0) {
      query = `I completed my home safety check and found ${hazardsCount} hazards. What are the most urgent fixes and balance exercises to prevent falls?`;
    }
    const input = document.getElementById('chatTextInput');
    if (input) {
      input.value = query;
      sendChatMessage();
    }
  }

  function selectHubRoom(roomId) {
    playSound('tap');
    state.selectedAuditRoom = roomId;
    renderProtectHubView();
  }

  function setHubRoomAnswer(roomId, questionId, answer) {
    playSound('check');
    if (!state.protectHomeAuditAnswers[roomId]) state.protectHomeAuditAnswers[roomId] = {};
    state.protectHomeAuditAnswers[roomId][questionId] = answer;
    BoneDB.save();
    renderProtectHubView();
  }

  function toggleHubDoctor(docId) {
    toggleStrengthenDoctor(docId);
  }

  function shareDoctorReviewWhatsApp() {
    shareStrengthenBriefWhatsApp();
  }

  // --------------------------------------------------------------------------
  // MODULE 5: STRENGTHEN — THE USER'S BONE HEALTH FILE
  // --------------------------------------------------------------------------
  // Only what the user enters is shown (no sample values): DXA scans and blood
  // tests with dates so changes are visible, the medicines they take with a daily
  // tick, a height check, and a doctor-visit summary built from all of it.
  const T_SITES = [['spine', 'Spine'], ['neck', 'Hip neck'], ['hip', 'Total hip']];
  const MED_KINDS = [
    { id: 'calcium', name: 'Calcium', icon: '🥛', time: '13:00' },
    { id: 'vitd', name: 'Vitamin D3', icon: '☀️', time: '13:00' },
    { id: 'thyroid', name: 'Thyroid pill', icon: '🦋', time: '07:00' },
    { id: 'bone', name: 'Weekly bone medicine', icon: '🦴', time: '07:00', weekly: true },
    { id: 'other', name: 'Other medicine', icon: '💊', time: '09:00' }
  ];

  function setStrengthenMode(mode) {
    playSound('tap');
    state.strengthenMode = mode === 'clinical' ? 'clinical' : 'simple';
    BoneDB.save();
    renderStrengthenHubView(true);
  }

  function switchStrengthenSubTab(tabId) {
    playSound('tap');
    state.strengthenMode = 'clinical';
    state.strengthenActiveSubTab = tabId;
    state.strengthenForm = null;
    BoneDB.save();
    renderStrengthenHubView(true);
  }

  function toggleHubDoctor(docId) {
    playSound('check');
    if (!(state.strengthenDoctorChecked instanceof Set)) {
      state.strengthenDoctorChecked = new Set(state.strengthenDoctorChecked || []);
    }
    if (state.strengthenDoctorChecked.has(docId)) state.strengthenDoctorChecked.delete(docId);
    else state.strengthenDoctorChecked.add(docId);
    BoneDB.save();
    renderStrengthenHubView();
  }

  function shareDoctorReviewWhatsApp() {
    playSound('tap');
    const checkedSet = state.strengthenDoctorChecked instanceof Set
      ? state.strengthenDoctorChecked
      : new Set(state.strengthenDoctorChecked || []);
    const questions = (BONE_SIP_DATA.doctorReviewChecklist || [])
      .filter(q => checkedSet.has(q.id))
      .map((q, idx) => `${idx + 1}. ${tr(q.text)}`);
    if (!questions.length) {
      showToast(t('Tick at least one question first'), 'fa-circle-info');
      return;
    }
    const msg = [
      `*${t('BONE SIP — Questions for my doctor')}*`,
      '',
      ...questions,
      '',
      t('Invest in Bones. Invest in Life.')
    ].join('\n');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  // `animate` replays the entrance animation; plain re-renders after an input
  // change skip it so the screen does not flicker while typing.
  function renderStrengthenHubView(animate = false) {
    const isClinical = state.strengthenMode === 'clinical';
    const simpleContainer = document.getElementById('strengthenSimpleContainer');
    const clinicalContainer = document.getElementById('strengthenClinicalContainer');
    const heroTitle = document.getElementById('strengthenHeroTitle');
    const heroSub = document.getElementById('strengthenHeroSubtitle');
    const modeBar = document.getElementById('strengthenModeBar');

    if (heroTitle) {
      heroTitle.textContent = isClinical ? t('Bone care & scans') : t('Talk to your doctor');
    }
    if (heroSub) {
      heroSub.textContent = isClinical ? t('Scans, tests and medicines made simple.') : t('Take these questions to your next visit.');
    }

    if (modeBar) {
      modeBar.innerHTML = isClinical
        ? `<button type="button" class="btn btn-sm btn-outline sx-mode-btn" onclick="BoneApp.setStrengthenMode('simple')"><i class="fa-solid fa-clipboard-check"></i> ${t('Switch to Simple Doctor Checklist')}</button>`
        : `<button type="button" class="btn btn-sm btn-outline sx-mode-btn" onclick="BoneApp.setStrengthenMode('clinical')"><i class="fa-solid fa-notes-medical"></i> ${t('Switch to Advanced Clinical Portal')}</button>`;
    }

    if (simpleContainer) simpleContainer.style.display = isClinical ? 'none' : 'block';
    if (clinicalContainer) clinicalContainer.style.display = isClinical ? 'block' : 'none';

    if (!isClinical) {
      const listEl = document.getElementById('hubDoctorChecklist');
      if (listEl && BONE_SIP_DATA.doctorReviewChecklist) {
        listEl.innerHTML = BONE_SIP_DATA.doctorReviewChecklist.map(q => {
          const isChecked = state.strengthenDoctorChecked instanceof Set
            ? state.strengthenDoctorChecked.has(q.id)
            : (Array.isArray(state.strengthenDoctorChecked) && state.strengthenDoctorChecked.includes(q.id));
          return `
            <button type="button" class="doc-row ${isChecked ? 'selected' : ''}" onclick="BoneApp.toggleHubDoctor('${q.id}')" aria-pressed="${Boolean(isChecked)}">
              ${img3d(q.img || 'clipboard', '', 34)}
              <span>${escapeHtml(tr(q.text))}</span>
              <span class="tick"><i class="fa-solid fa-check"></i></span>
            </button>`;
        }).join('');
      }

      const dxaEl = document.getElementById('hubDxaRangesList');
      const guide = BONE_SIP_DATA.dxaInterpretationGuide;
      if (dxaEl && guide && guide.ranges) {
        const colors = ['#1E9E62', '#D97706', '#B1315D'];
        dxaEl.innerHTML = guide.ranges.map((r, i) => `
          <div class="dxa-item" style="--dxa-c: ${colors[i] || '#6B6580'};">
            <div>
              <b>${escapeHtml(tr(r.category))}</b>
              <p><strong>${escapeHtml(tr(r.score))}.</strong> ${escapeHtml(tr(r.meaning))}</p>
            </div>
          </div>`).join('');
      }
      return;
    }

    const tabs = ['dxa_risk', 'labs_biomarkers', 'meds_timing', 'spine_safety', 'doctor_brief'];
    const activeTab = tabs.includes(state.strengthenActiveSubTab) ? state.strengthenActiveSubTab : 'dxa_risk';

    tabs.forEach(tId => {
      const btn = document.getElementById(`stTab_${tId}`);
      if (btn) {
        btn.classList.toggle('active', tId === activeTab);
        btn.setAttribute('aria-selected', String(tId === activeTab));
      }
    });

    const container = document.getElementById('strengthenContentContainer');
    if (!container) return;
    const render = {
      dxa_risk: renderDxaRiskSubTab,
      labs_biomarkers: renderLabsBiomarkersSubTab,
      meds_timing: renderMedsTimingSubTab,
      spine_safety: renderSpineSafetySubTab,
      doctor_brief: renderDoctorBriefSubTab
    }[activeTab];
    if (render) {
      container.classList.toggle('sx-anim', animate);
      container.innerHTML = render();
    }
  }

  const sxHead = (img, title, sub = '', action = '') => `
    <div class="sx-head">
      ${img3d(img, '', 44)}
      <div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>
      ${action}
    </div>`;

  const sxAddBtn = (form, label) => `<button type="button" class="sx-add" onclick="BoneApp.openStrengthenForm('${form}')"><i class="fa-solid fa-plus"></i> ${label}</button>`;

  function newRecordId(prefix) {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function byNewest(list) {
    return (list || []).slice().sort((a, b) => ((a.date || '') < (b.date || '') ? 1 : -1));
  }

  function fmtRecordDate(iso) {
    return iso ? I18N.date(new Date(`${iso}T00:00:00`), { day: 'numeric', month: 'short', year: 'numeric' }) : t('Date not saved');
  }

  function addMonthsISO(iso, months) {
    const d = new Date(`${iso}T00:00:00`);
    d.setMonth(d.getMonth() + months);
    return toISODate(d);
  }

  const isNum = v => typeof v === 'number' && !isNaN(v);

  function scanLowest(scan) {
    const vals = scan ? [scan.spine, scan.neck, scan.hip].filter(isNum) : [];
    return vals.length ? Math.min(...vals) : null;
  }

  function latestScan() {
    return byNewest(state.scans)[0] || null;
  }

  function tScoreInfo(tScore) {
    if (tScore <= -2.5) return { tone: 'bad', emoji: '⚠️', label: t('Osteoporosis'), advice: t('Ask your doctor about bone medicine.'), months: 12 };
    if (tScore < -1.0) return { tone: 'warn', emoji: '🙂', label: t('Low bone mass'), advice: t('Calcium, vitamin D and exercise help a lot.'), months: 18 };
    return { tone: 'good', emoji: '💪', label: t('Healthy bones'), advice: t('Keep up your diet and exercise.'), months: 24 };
  }

  // Latest value of one blood test, with the one before it for the trend.
  function labHistory(id) {
    return byNewest(state.labs).filter(l => isNum(l[id])).map(l => ({ value: l[id], date: l.date }));
  }

  function scanDue() {
    const scan = latestScan();
    const low = scanLowest(scan);
    if (!scan || low === null || !scan.date) return null;
    const due = addMonthsISO(scan.date, tScoreInfo(low).months);
    return { due, overdue: due <= getTodayISODate() };
  }

  function strengthenFormHtml(fields, saveFn, title) {
    return `
      <div class="sx-form" role="group" aria-label="${escapeHtml(title)}">
        <b class="sx-form-title">${title}</b>
        ${fields}
        <div class="sx-form-actions">
          <button type="button" class="psx-act" onclick="BoneApp.closeStrengthenForm()">${t('Cancel')}</button>
          <button type="button" class="psx-act primary" onclick="BoneApp.${saveFn}()"><i class="fa-solid fa-check"></i> ${t('Save')}</button>
        </div>
      </div>`;
  }

  const dateField = id => `
    <label class="sx-field"><span>${t('Date on the report')}</span>
      <input type="date" id="${id}" value="${getTodayISODate()}" max="${getTodayISODate()}">
    </label>`;

  // ---------------------------------------------------------------- 1. Bone scan
  function renderDxaRiskSubTab() {
    const scans = byNewest(state.scans);
    const formOpen = state.strengthenForm === 'scan';
    const form = formOpen ? strengthenFormHtml(`
      ${dateField('sxScanDate')}
      <p class="sx-hint">${t('Find the T-score for each place on your report. Leave a box empty if it is not there.')}</p>
      <div class="sx-form-grid">
        ${T_SITES.map(([key, name]) => `
          <label class="sx-field"><span>${t(name)}</span>
            <input type="number" step="0.1" min="-6" max="4" inputmode="decimal" id="sxScan_${key}" placeholder="-1.5">
          </label>`).join('')}
      </div>`, 'saveScan', t('Add scan result')) : '';

    if (!scans.length) {
      return `
        <div class="st-card sx-card">
          ${sxHead('xray', t('Bone scan (DXA)'), t('A DXA scan shows how strong your bones are.'))}
          ${form || `
            <div class="sx-empty">
              <span class="sx-empty-icon">🩻</span>
              <b>${t('No scan saved yet')}</b>
              <p>${t('Had a DXA scan? Add the T-scores from your report.')}</p>
              <button type="button" class="psx-act primary" onclick="BoneApp.openStrengthenForm('scan')"><i class="fa-solid fa-plus"></i> ${t('Add scan result')}</button>
            </div>`}
        </div>
        ${whoNeedsScanCard()}
        ${riskFactorsCard()}`;
    }

    const latest = scans[0];
    const low = scanLowest(latest);
    const info = tScoreInfo(low);
    const pinPct = Math.min(100, Math.max(0, ((low + 4) / 5.5) * 100));
    const prev = scans.slice(1).find(s => scanLowest(s) !== null);
    let trend = '';
    if (prev) {
      const diff = Math.round((low - scanLowest(prev)) * 10) / 10;
      trend = diff > 0
        ? `<div class="sx-trend good">📈 ${t('Better than your last scan ({0})', { 0: `+${diff}` })}</div>`
        : diff < 0
          ? `<div class="sx-trend bad">📉 ${t('Lower than your last scan ({0})', { 0: diff })}</div>`
          : `<div class="sx-trend">➖ ${t('Same as your last scan')}</div>`;
    }
    const due = scanDue();
    const dueLine = due
      ? (due.overdue ? `⏰ ${t('Your next scan is due now')}` : `📅 ${t('Next scan due: {date}', { date: I18N.date(new Date(`${due.due}T00:00:00`), { month: 'long', year: 'numeric' }) })}`)
      : '';

    return `
      <div class="st-card sx-card">
        ${sxHead('xray', t('Bone scan (DXA)'), fmtRecordDate(latest.date), formOpen ? '' : sxAddBtn('scan', t('Add')))}
        ${form}
        <div class="sx-result ${info.tone}">
          <div class="sx-big"><b>${low.toFixed(1)}</b><span>${t('Lowest T-score')}</span></div>
          <div class="sx-result-body">
            <span class="sx-status ${info.tone}">${info.emoji} ${info.label}</span>
            <p>${info.advice}</p>
          </div>
        </div>
        <div class="sx-scale">
          <div class="sx-scale-bar"><i class="bad"></i><i class="warn"></i><i class="good"></i>
            <span class="sx-pin" style="left:${pinPct}%"></span>
          </div>
          <div class="sx-scale-labels"><span>${t('Weak')}</span><span>${t('Low')}</span><span>${t('Healthy')}</span></div>
        </div>
        <div class="sx-sites">
          ${T_SITES.map(([key, name]) => `
            <div class="sx-site"><span>${t(name)}</span><b>${isNum(latest[key]) ? latest[key].toFixed(1) : '—'}</b></div>`).join('')}
        </div>
        ${trend}
        ${dueLine ? `<div class="sx-chip-line">${dueLine}</div>` : ''}
        ${recordHistoryHtml(scans, s => `${t('Lowest T-score')} ${scanLowest(s) === null ? '—' : scanLowest(s).toFixed(1)}`, s => tScoreInfo(scanLowest(s) ?? 0).tone, 'deleteScan')}
      </div>
      ${riskFactorsCard()}`;
  }

  function recordHistoryHtml(list, summary, tone, deleteFn) {
    return `
      <details class="sx-history" ${list.length > 1 ? 'open' : ''}>
        <summary>${t('All saved results')} <em>${list.length}</em></summary>
        <ul>
          ${list.map(r => `
            <li><i class="sx-dot ${tone(r)}"></i><span><b>${fmtRecordDate(r.date)}</b>${summary(r)}</span>
              <button type="button" class="sx-del" onclick="BoneApp.${deleteFn}('${r.id}')" aria-label="${escapeHtml(t('Delete'))}"><i class="fa-solid fa-trash-can"></i></button></li>`).join('')}
        </ul>
      </details>`;
  }

  function whoNeedsScanCard() {
    const age = Number(state.userProfile.age) || 0;
    const f = state.fraxInputs || {};
    const advised = age >= 65 || f.prior_fracture || f.steroid_use;
    return `
      <div class="st-card sx-card">
        ${sxHead('stethoscope', t('Who should get a scan?'))}
        <ul class="sx-asks compact">
          <li><em>👵</em><span>${t('Women over 65 and men over 70')}</span></li>
          <li><em>🩹</em><span>${t('Anyone who broke a bone in a small fall')}</span></li>
          <li><em>💊</em><span>${t('People on steroid tablets for 3+ months')}</span></li>
          <li><em>🌸</em><span>${t('Early menopause or very low body weight')}</span></li>
        </ul>
        ${advised ? `<div class="psx-note good"><span>✅</span><b>${t('Based on your answers, ask your doctor for a DXA scan.')}</b></div>` : ''}
      </div>`;
  }

  function riskFactorsCard() {
    const factors = BONE_SIP_DATA.fraxRiskFactorsCatalog || [];
    return `
      <div class="st-card sx-card">
        ${sxHead('target', t('Tell your doctor'), t('Tap what applies to you. Your doctor uses this with your scan to work out your fracture risk.'))}
        <div class="sx-toggles">
          ${factors.map(f => {
            const on = !!(state.fraxInputs && state.fraxInputs[f.id]);
            return `<button type="button" class="sx-toggle ${on ? 'on' : ''}" aria-pressed="${on}" onclick="BoneApp.toggleFraxFactor('${f.id}')">
              ${img3d(f.img || 'bone', '', 30)}<span>${t(f.short || f.text)}</span><i class="fa-solid ${on ? 'fa-circle-check' : 'fa-circle-plus'}"></i>
            </button>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------- 2. Blood tests
  function labStatusIndex(id, v) {
    if (id === 'vit_d') return v < 20 ? 0 : v <= 30 ? 1 : v <= 60 ? 2 : 3;
    if (id === 'calcium') return v < 8.5 ? 0 : v <= 10.2 ? 1 : 2;
    if (id === 'alp') return v <= 129 ? 0 : 1;
    if (id === 'egfr') return v < 35 ? 0 : v < 60 ? 1 : 2;
    return 0;
  }

  const LAB_STATUS = {
    good: { text: 'Good', icon: '✅', color: '#1E9E62' },
    low: { text: 'Low', icon: '⬇️', color: '#D97706' },
    high: { text: 'High', icon: '⬆️', color: '#DC2626' }
  };

  function labCardState(bm, v) {
    const range = bm.ranges[labStatusIndex(bm.id, v)] || bm.ranges[0];
    const st = LAB_STATUS[range.status] || LAB_STATUS.good;
    return { st, tip: range.short || range.tip };
  }

  function renderLabsBiomarkersSubTab() {
    const catalog = BONE_SIP_DATA.boneBiomarkersCatalog || [];
    const labs = byNewest(state.labs);
    const formOpen = state.strengthenForm === 'lab';
    const form = formOpen ? strengthenFormHtml(`
      ${dateField('sxLabDate')}
      <p class="sx-hint">${t('Type the numbers from your blood report. Leave a box empty if the test was not done.')}</p>
      <div class="sx-form-grid two">
        ${catalog.map(bm => `
          <label class="sx-field"><span>${t(bm.short || bm.name)} <small>${bm.unit}</small></span>
            <input type="number" step="${bm.id === 'calcium' ? '0.1' : '1'}" min="0" inputmode="decimal" id="sxLab_${bm.id}">
          </label>`).join('')}
      </div>`, 'saveLab', t('Add blood test')) : '';

    if (!labs.length) {
      return `
        <div class="st-card sx-card">
          ${sxHead('barchart', t('Blood tests'), t('These tests show if your body can build bone.'))}
          ${form || `
            <div class="sx-empty">
              <span class="sx-empty-icon">🩸</span>
              <b>${t('No blood test saved yet')}</b>
              <p>${t('Ask your doctor for these tests:')}</p>
              <div class="sx-pills">${catalog.map(bm => `<span>${img3d(bm.img || 'barchart', '', 20)} ${t(bm.short || bm.name)}</span>`).join('')}</div>
              <button type="button" class="psx-act primary" onclick="BoneApp.openStrengthenForm('lab')"><i class="fa-solid fa-plus"></i> ${t('Add blood test')}</button>
            </div>`}
        </div>`;
    }

    return `
      <div class="st-card sx-card">
        ${sxHead('barchart', t('Blood tests'), fmtRecordDate(labs[0].date), formOpen ? '' : sxAddBtn('lab', t('Add')))}
        ${form}
        <div class="sx-labs">
          ${catalog.map((bm, i) => {
            const hist = labHistory(bm.id);
            if (!hist.length) {
              return `<div class="sx-lab none" style="--i:${i}"><div class="sx-lab-top">${img3d(bm.img || 'barchart', '', 36)}<b>${t(bm.short || bm.name)}</b></div><p class="sx-lab-tip">${t('Not tested yet')}</p></div>`;
            }
            const v = hist[0].value;
            const { st, tip } = labCardState(bm, v);
            const prev = hist[1];
            const change = prev ? (v > prev.value ? `↑ ${t('from {0}', { 0: prev.value })}` : v < prev.value ? `↓ ${t('from {0}', { 0: prev.value })}` : t('No change')) : '';
            return `
              <div class="sx-lab" style="--i:${i}; --c:${st.color}">
                <div class="sx-lab-top">
                  ${img3d(bm.img || 'barchart', '', 36)}
                  <b>${t(bm.short || bm.name)}</b>
                  <span class="sx-lab-chip">${st.icon} ${t(st.text)}</span>
                </div>
                <div class="sx-lab-val"><b>${v}</b> <small>${bm.unit}</small>${change ? `<em>${change}</em>` : ''}</div>
                <p class="sx-lab-tip">${t(tip)}</p>
              </div>`;
          }).join('')}
        </div>
        ${recordHistoryHtml(labs, l => catalog.filter(bm => isNum(l[bm.id])).map(bm => `${t(bm.short || bm.name)} ${l[bm.id]}`).join(' · '), l => {
          const tones = catalog.filter(bm => isNum(l[bm.id])).map(bm => (bm.ranges[labStatusIndex(bm.id, l[bm.id])] || {}).status);
          return tones.includes('high') ? 'bad' : tones.includes('low') ? 'warn' : 'good';
        }, 'deleteLab')}
      </div>`;
  }

  // ---------------------------------------------------------------- 3. Medicines
  function medKind(id) {
    return MED_KINDS.find(k => k.id === id) || MED_KINDS[MED_KINDS.length - 1];
  }

  function medsDueOn(iso) {
    const weekday = new Date(`${iso}T00:00:00`).getDay();
    return (state.meds || []).filter(m => !m.weekly || m.weekday === weekday);
  }

  function minutesOf(hhmm) {
    const [h, m] = String(hhmm || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function renderMedsTimingSubTab() {
    const today = getTodayISODate();
    const due = medsDueOn(today).slice().sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
    const later = (state.meds || []).filter(m => !due.includes(m));
    const taken = new Set(state.medTaken[today] || []);
    const formOpen = state.strengthenForm === 'med';
    const draft = state.medDraft || MED_KINDS[0];
    const form = formOpen ? strengthenFormHtml(`
      <div class="sx-kind-chips">
        ${MED_KINDS.map(k => `<button type="button" class="${draft.id === k.id ? 'on' : ''}" onclick="BoneApp.pickMedKind('${k.id}')">${k.icon} ${t(k.name)}</button>`).join('')}
      </div>
      <div class="sx-form-grid two">
        <label class="sx-field"><span>${t('Medicine name')}</span><input type="text" id="sxMedName" maxlength="40" value="${escapeHtml(t(draft.name))}"></label>
        <label class="sx-field"><span>${t('Time')}</span><input type="time" id="sxMedTime" value="${draft.time}"></label>
      </div>
      <label class="sx-check"><input type="checkbox" id="sxMedWeekly" ${draft.weekly ? 'checked' : ''}> ${t('Once a week (on this day of the week)')}</label>`, 'saveMed', t('Add medicine')) : '';

    const weekdayName = m => I18N.date(new Date(2024, 0, 7 + (m.weekday || 0)), { weekday: 'long' });
    const medRow = (m, isDue) => {
      const k = medKind(m.kind);
      const done = taken.has(m.id);
      return `
        <li class="sx-med-row ${done ? 'done' : ''} ${isDue ? '' : 'later'}">
          <em>${k.icon}</em>
          <span><b>${escapeHtml(m.name)}</b><small>${m.time}${m.weekly ? ` · ${t('Every {day}', { day: weekdayName(m) })}` : ''}</small></span>
          ${isDue ? `<button type="button" class="sx-taken ${done ? 'on' : ''}" onclick="BoneApp.toggleMedTaken('${m.id}')" aria-pressed="${done}"><i class="fa-solid fa-check"></i> ${done ? t('Taken') : t('Take')}</button>` : ''}
          <button type="button" class="sx-del" onclick="BoneApp.deleteMed('${m.id}')" aria-label="${escapeHtml(t('Delete'))}"><i class="fa-solid fa-trash-can"></i></button>
        </li>`;
    };

    const listCard = (state.meds || []).length ? `
      <div class="st-card sx-card">
        ${sxHead('pill', t('Today’s medicines'), t('{0} of {1} taken today', { 0: due.filter(m => taken.has(m.id)).length, 1: due.length }), formOpen ? '' : sxAddBtn('med', t('Add')))}
        ${form}
        <ul class="sx-med-list">${due.map(m => medRow(m, true)).join('')}</ul>
        ${later.length ? `<p class="sx-label">${t('Not due today')}</p><ul class="sx-med-list">${later.map(m => medRow(m, false)).join('')}</ul>` : ''}
      </div>` : `
      <div class="st-card sx-card">
        ${sxHead('pill', t('My medicines'), t('Tick each tablet when you take it, so you never miss one.'))}
        ${form || `
          <div class="sx-empty">
            <span class="sx-empty-icon">💊</span>
            <b>${t('No medicines added yet')}</b>
            <p>${t('Add the tablets you take, like calcium, vitamin D or a thyroid pill.')}</p>
            <button type="button" class="psx-act primary" onclick="BoneApp.openStrengthenForm('med')"><i class="fa-solid fa-plus"></i> ${t('Add medicine')}</button>
          </div>`}
      </div>`;

    return listCard + medTipsHtml() + `
      <div class="st-card sx-card">
        ${sxHead('milk', t('Which calcium tablet?'))}
        <div class="sx-duo">
          <div class="sx-duo-card good">
            <b>${t('Calcium citrate (CCM)')}</b>
            <span>✅ ${t('Take any time')}</span>
            <span>✅ ${t('Gentle on the stomach')}</span>
          </div>
          <div class="sx-duo-card">
            <b>${t('Calcium carbonate')}</b>
            <span>🍽️ ${t('Take right after a meal')}</span>
            <span>💨 ${t('May cause gas')}</span>
          </div>
        </div>
      </div>`;
  }

  // Tips that only show when they apply to the medicines the user added.
  function medTipsHtml() {
    const meds = state.meds || [];
    const thyroid = meds.find(m => m.kind === 'thyroid');
    const calcium = meds.filter(m => m.kind === 'calcium');
    const bone = meds.find(m => m.kind === 'bone');
    const vitd = meds.find(m => m.kind === 'vitd');
    const tips = [];

    if (thyroid) {
      const safeMin = (minutesOf(thyroid.time) + 240) % 1440;
      const safe = `${String(Math.floor(safeMin / 60)).padStart(2, '0')}:${String(safeMin % 60).padStart(2, '0')}`;
      const tooClose = calcium.filter(c => {
        const gap = (minutesOf(c.time) - minutesOf(thyroid.time) + 1440) % 1440;
        return gap < 240 || gap > 1440 - 60;
      });
      tips.push(`
        <div class="st-card sx-card">
          ${sxHead('thyroid', t('Thyroid pill & calcium'), t('Calcium blocks the thyroid pill. Keep {0} hours apart.', { 0: 4 }))}
          <div class="sx-timeline">
            <div class="sx-tl-step"><span class="sx-tl-emoji">🦋</span><b class="plain">${thyroid.time}</b><small>${t('Thyroid pill')}</small></div>
            <div class="sx-tl-gap"><span>⏳ ${t('{0} hours', { 0: 4 })}</span></div>
            <div class="sx-tl-step ok"><span class="sx-tl-emoji">🥛</span><b>${safe}</b><small>${t('Calcium & milk')}</small></div>
          </div>
          ${tooClose.length
            ? `<div class="psx-note warn"><span>⚠️</span><b>${t('Your calcium at {0} is too close to your thyroid pill. Take it at {1} or later.', { 0: tooClose[0].time, 1: safe })}</b></div>`
            : calcium.length ? `<div class="psx-note good"><span>✅</span><b>${t('Good gap between your thyroid pill and calcium.')}</b></div>` : ''}
        </div>`);
    }
    if (bone) {
      const p = (BONE_SIP_DATA.prescriptionTherapiesCatalog || [])[0] || {};
      tips.push(`
        <div class="st-card sx-card">
          ${sxHead('shield', t('Your weekly bone medicine'), t('Follow these steps every time.'))}
          <div class="sx-rules">${(p.rulesShort || []).map(r => `<span><em>${r.icon}</em>${t(r.text)}</span>`).join('')}</div>
        </div>`);
    }
    if (vitd) {
      tips.push(`<div class="psx-note sx-tip"><span>☀️</span><b>${t('Take vitamin D with a meal. It is absorbed better with some fat.')}</b></div>`);
    }
    return tips.join('');
  }

  // ---------------------------------------------------------------- 4. Spine
  function renderSpineSafetySubTab() {
    const h25 = parseInt(state.spineInputs.heightAge25, 10);
    const hNow = parseInt(state.spineInputs.heightCurrent || state.userProfile.heightCm, 10);
    const hasBoth = !isNaN(h25) && !isNaN(hNow);
    const loss = hasBoth ? Math.max(0, h25 - hNow) : 0;

    let tone = 'good', emoji = '✅', msg = t('Normal. Nothing to worry about.');
    if (loss >= 4) { tone = 'bad'; emoji = '🩻'; msg = t('Ask your doctor for a spine X-ray.'); }
    else if (loss >= 2) { tone = 'warn'; emoji = '⚠️'; msg = t('Watch your posture. Do back exercises.'); }

    const moves = BONE_SIP_DATA.safeMovementFlashcards || [];
    const steps = BONE_SIP_DATA.emergencyFallSteps || [];

    return `
      <div class="st-card sx-card">
        ${sxHead('standing', t('Height check'), t('Losing height can mean a hidden spine fracture.'))}
        <div class="sx-height">
          <label class="sx-hbox"><span>${t('At age 25')}</span><input type="number" inputmode="numeric" placeholder="cm" value="${isNaN(h25) ? '' : h25}" onchange="BoneApp.setSpineHeight('heightAge25', this.value)"><small>cm</small></label>
          <span class="sx-harrow">→</span>
          <label class="sx-hbox"><span>${t('Now')}</span><input type="number" inputmode="numeric" placeholder="cm" value="${isNaN(hNow) ? '' : hNow}" onchange="BoneApp.setSpineHeight('heightCurrent', this.value)"><small>cm</small></label>
        </div>
        ${hasBoth ? `
          <div class="sx-result ${tone} slim">
            <div class="sx-big"><b>${loss}</b><span>${t('cm lost')}</span></div>
            <div class="sx-result-body"><span class="sx-status ${tone}">${emoji} ${msg}</span></div>
          </div>` : `<div class="psx-note"><span>📏</span><b>${t('Enter your height at age 25 (or the tallest you remember) to check.')}</b></div>`}
      </div>

      <div class="st-card sx-card">
        ${sxHead('shield', t('Move safely'), t('Small changes protect your spine.'))}
        <div class="sx-moves">
          ${moves.map((m, i) => `
            <div class="sx-move" style="--i:${i}">
              <div class="sx-move-top">${img3d(m.img || 'biceps', '', 36)}<b>${t(m.title || m.activity)}</b></div>
              <div class="sx-dont"><span>✕</span>${t(m.dont || m.danger)}</div>
              <div class="sx-do"><span>✓</span>${t(m.do || m.safe)}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="st-card sx-card">
        ${sxHead('warning', t('If you fall'))}
        <ol class="sx-steps">
          ${steps.map((s, i) => `
            <li style="--i:${i}"><em>${s.icon || s.step}</em><span>${t(s.short || s.title)}</span></li>`).join('')}
        </ol>
        <a class="sx-call" href="tel:108"><i class="fa-solid fa-phone"></i> ${t('Call {0} for an ambulance', { 0: 108 })}</a>
      </div>
    `;
  }

  // ---------------------------------------------------------------- 5. Doctor visit
  // Questions built only from what the user really entered.
  function autoDoctorQuestions() {
    const u = state.userProfile;
    const conds = (u.healthConditions || []).filter(c => c !== 'none');
    const age = Number(u.age) || 0;
    const f = state.fraxInputs || {};
    const anyRisk = Object.values(f).some(Boolean);
    const low = scanLowest(latestScan());
    const due = scanDue();
    const vitD = labHistory('vit_d')[0];
    const egfr = labHistory('egfr')[0];
    const home = homeSafetySummary();
    const meds = state.meds || [];
    const ask = [];

    if (low === null && (age >= 50 || anyRisk)) ask.push(['🩻', t('Do I need a bone density (DXA) scan?')]);
    if (low !== null && low <= -2.5) ask.push(['💊', t('Should I start bone medicine? (T-score {0})', { 0: low.toFixed(1) })]);
    else if (low !== null && low < -1) ask.push(['🦴', t('My bone density is low. How can I stop more bone loss?')]);
    if (due && due.overdue) ask.push(['📅', t('Is it time for my next bone scan?')]);
    if (anyRisk) ask.push(['🎯', t('I have risk factors for fractures. What is my 10-year fracture risk?')]);
    if (!vitD) ask.push(['☀️', t('Should I check my vitamin D level?')]);
    else if (vitD.value < 30) ask.push(['☀️', t('My vitamin D is {0}. Do I need D3 doses?', { 0: vitD.value })]);
    if (conds.includes('thyroid') || meds.some(m => m.kind === 'thyroid')) ask.push(['⏰', t('How far apart should I take my thyroid pill and calcium?')]);
    if (conds.includes('diabetes')) ask.push(['🩸', t('Does diabetes affect my bone strength?')]);
    if (conds.includes('kidney') || (egfr && egfr.value < 60)) ask.push(['🫘', t('Are bone medicines safe for my kidneys?')]);
    const hazards = home.rows.reduce((n, r) => n + r.fixes.length, 0);
    if (hazards > 0) ask.push(['🏠', t('I have {0} fall risks at home. Can you check my balance?', { 0: hazards })]);
    ask.push(['🥛', t('How much calcium daily? When is my next scan?')]);
    return ask;
  }

  function renderDoctorBriefSubTab() {
    const u = state.userProfile;
    const low = scanLowest(latestScan());
    const vitD = labHistory('vit_d')[0];
    const home = homeSafetySummary();
    const visit = state.doctorVisit || { date: '', questions: [] };
    const today = getTodayISODate();
    let visitNote = '';
    if (visit.date && visit.date >= today) {
      const days = Math.round((new Date(`${visit.date}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000);
      visitNote = days === 0 ? t('Your visit is today') : t('In {0} days', { 0: days });
    }

    const stat = (img, label, value, color = '') => `
      <div class="sx-stat">${img3d(img, '', 30)}<span>${label}</span><b${color ? ` style="color:${color}"` : ''}>${value}</b></div>`;
    const tone = { good: '#1E9E62', warn: '#D97706', bad: '#B1315D' };

    return `
      <div class="st-card sx-card">
        ${sxHead('calendar', t('Next doctor visit'))}
        <div class="sx-visit">
          <input type="date" value="${visit.date || ''}" min="${today}" onchange="BoneApp.setDoctorVisitDate(this.value)" aria-label="${escapeHtml(t('Next doctor visit'))}">
          ${visitNote ? `<span class="sx-chip-line">⏰ ${visitNote}</span>` : `<span class="sx-hint">${t('Add the date so you can prepare.')}</span>`}
        </div>
      </div>

      <div class="st-card sx-card">
        ${sxHead('clipboard', t('Doctor visit'), t('Show this to your doctor.'))}
        <div class="sx-stats">
          ${stat('family', t('Age / BMI'), `${u.age || '—'} · ${calculateBMI()}`)}
          ${stat('xray', t('Lowest T-score'), low === null ? t('No scan yet') : low.toFixed(1), low === null ? '' : tone[tScoreInfo(low).tone])}
          ${stat('sun', t('Vitamin D'), vitD ? `${vitD.value}` : t('Not tested yet'), vitD ? (vitD.value < 30 ? '#D97706' : '#1E9E62') : '')}
          ${stat('pill', t('Medicines'), `${(state.meds || []).length}`)}
          ${stat('house', t('Home safety'), home.answered ? `${home.safe}/${home.total}` : t('Not checked yet'))}
        </div>
        <h4 class="psx-h"><span>💬</span> ${t('Ask your doctor')}</h4>
        <ul class="sx-asks">
          ${autoDoctorQuestions().map(([icon, text], i) => `<li style="--i:${i}"><em>${icon}</em><span>${text}</span></li>`).join('')}
          ${(visit.questions || []).map((q, i) => `<li class="mine"><em>✍️</em><span>${escapeHtml(q)}</span>
            <button type="button" class="sx-del" onclick="BoneApp.deleteDoctorQuestion(${i})" aria-label="${escapeHtml(t('Delete'))}"><i class="fa-solid fa-xmark"></i></button></li>`).join('')}
        </ul>
        <div class="sx-own-q">
          <input type="text" id="sxOwnQuestion" maxlength="160" placeholder="${escapeHtml(t('Add your own question'))}" onkeydown="if(event.key==='Enter') BoneApp.addDoctorQuestion()">
          <button type="button" class="psx-act" onclick="BoneApp.addDoctorQuestion()"><i class="fa-solid fa-plus"></i></button>
        </div>
        <div class="psx-actions">
          <button type="button" class="psx-act primary" onclick="BoneApp.printDocument('doctor')">
            <i class="fa-solid fa-file-pdf"></i> PDF
          </button>
          <button type="button" class="psx-act" onclick="BoneApp.shareStrengthenBriefWhatsApp()">
            <i class="fa-brands fa-whatsapp" style="color:#25D366"></i> ${t('Share')}
          </button>
          <button type="button" class="psx-act" onclick="BoneApp.askAiAboutStrengthenTopic('doctor')">
            <img src="assets/images/ojas-avatar.svg" alt="" width="22" height="22"> ${t('Ask Ojas')}
          </button>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------- Actions
  function openStrengthenForm(form) {
    playSound('tap');
    state.strengthenForm = form;
    if (form === 'med' && !state.medDraft) state.medDraft = MED_KINDS[0];
    renderStrengthenHubView();
    setTimeout(() => {
      const first = document.querySelector('.sx-form input:not([type="date"]):not([type="checkbox"])');
      if (first) first.focus();
    }, 50);
  }

  function closeStrengthenForm() {
    playSound('tap');
    state.strengthenForm = null;
    renderStrengthenHubView();
  }

  function formNumber(id, min, max) {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === '') return null;
    const n = parseFloat(el.value);
    return isNaN(n) || n < min || n > max ? NaN : Math.round(n * 10) / 10;
  }

  function formDate(id) {
    const el = document.getElementById(id);
    const v = el ? el.value : '';
    return /^\d{4}-\d{2}-\d{2}$/.test(v) && v <= getTodayISODate() ? v : getTodayISODate();
  }

  function saveScan() {
    const scan = { id: newRecordId('s'), date: formDate('sxScanDate') };
    T_SITES.forEach(([key]) => { scan[key] = formNumber(`sxScan_${key}`, -6, 4); });
    const vals = T_SITES.map(([key]) => scan[key]);
    if (vals.some(v => Number.isNaN(v))) {
      showToast(t('T-scores are usually between -5 and +3. Please check the numbers.'), 'fa-triangle-exclamation');
      return;
    }
    if (vals.every(v => v === null)) {
      showToast(t('Enter at least one T-score'), 'fa-circle-info');
      return;
    }
    playSound('success');
    state.scans.push(scan);
    state.strengthenForm = null;
    BoneDB.save();
    renderStrengthenHubView();
    showToast(t('Scan result saved'), 'fa-circle-check');
  }

  function saveLab() {
    const lab = { id: newRecordId('l'), date: formDate('sxLabDate') };
    const limits = { vit_d: [1, 200], calcium: [3, 20], alp: [5, 2000], egfr: [1, 200] };
    (BONE_SIP_DATA.boneBiomarkersCatalog || []).forEach(bm => {
      const [min, max] = limits[bm.id] || [0, 10000];
      lab[bm.id] = formNumber(`sxLab_${bm.id}`, min, max);
    });
    const vals = Object.keys(limits).map(k => lab[k]);
    if (vals.some(v => Number.isNaN(v))) {
      showToast(t('One of the numbers looks wrong. Please check it.'), 'fa-triangle-exclamation');
      return;
    }
    if (vals.every(v => v === null || v === undefined)) {
      showToast(t('Enter at least one test result'), 'fa-circle-info');
      return;
    }
    playSound('success');
    state.labs.push(lab);
    state.strengthenForm = null;
    BoneDB.save();
    renderStrengthenHubView();
    showToast(t('Blood test saved'), 'fa-circle-check');
  }

  function deleteRecord(listName, id) {
    if (!confirm(t('Delete this result?'))) return;
    playSound('tap');
    state[listName] = (state[listName] || []).filter(r => r.id !== id);
    BoneDB.save();
    renderStrengthenHubView();
  }

  function deleteScan(id) { deleteRecord('scans', id); }
  function deleteLab(id) { deleteRecord('labs', id); }

  function pickMedKind(kindId) {
    playSound('tap');
    state.medDraft = medKind(kindId);
    renderStrengthenHubView();
  }

  function saveMed() {
    const nameEl = document.getElementById('sxMedName');
    const timeEl = document.getElementById('sxMedTime');
    const weeklyEl = document.getElementById('sxMedWeekly');
    const name = (nameEl ? nameEl.value : '').trim().slice(0, 40);
    if (!name) {
      showToast(t('Enter the medicine name'), 'fa-circle-info');
      return;
    }
    const draft = state.medDraft || MED_KINDS[0];
    playSound('success');
    state.meds.push({
      id: newRecordId('m'),
      name,
      kind: draft.id,
      time: timeEl && /^\d{2}:\d{2}$/.test(timeEl.value) ? timeEl.value : draft.time,
      weekly: !!(weeklyEl && weeklyEl.checked),
      weekday: new Date().getDay()
    });
    state.strengthenForm = null;
    state.medDraft = null;
    BoneDB.save();
    renderStrengthenHubView();
    showToast(t('Medicine added'), 'fa-circle-check');
  }

  function deleteMed(id) {
    if (!confirm(t('Remove this medicine?'))) return;
    playSound('tap');
    state.meds = state.meds.filter(m => m.id !== id);
    BoneDB.save();
    renderStrengthenHubView();
  }

  function toggleMedTaken(id) {
    const today = getTodayISODate();
    const set = new Set(state.medTaken[today] || []);
    if (set.has(id)) set.delete(id);
    else { set.add(id); playSound('check'); }
    state.medTaken[today] = Array.from(set);
    const due = medsDueOn(today);
    if (due.length && due.every(m => set.has(m.id)) && set.has(id)) {
      playSound('success');
      showToast(t('All medicines taken today. Well done!'), 'fa-circle-check');
    }
    markDayForSync(today);
    BoneDB.save();
    renderStrengthenHubView();
  }

  function setDoctorVisitDate(value) {
    state.doctorVisit.date = /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '';
    BoneDB.save();
    renderStrengthenHubView();
  }

  function addDoctorQuestion() {
    const input = document.getElementById('sxOwnQuestion');
    const text = (input ? input.value : '').trim().slice(0, 160);
    if (!text) return;
    playSound('check');
    state.doctorVisit.questions = (state.doctorVisit.questions || []).concat(text).slice(-15);
    BoneDB.save();
    renderStrengthenHubView();
  }

  function deleteDoctorQuestion(index) {
    playSound('tap');
    state.doctorVisit.questions.splice(index, 1);
    BoneDB.save();
    renderStrengthenHubView();
  }

  function toggleFraxFactor(factorId) {
    playSound('check');
    if (!state.fraxInputs) state.fraxInputs = {};
    state.fraxInputs[factorId] = !state.fraxInputs[factorId];
    BoneDB.save();
    renderStrengthenHubView();
  }

  function setSpineHeight(field, val) {
    const num = parseInt(val, 10);
    state.spineInputs[field] = !isNaN(num) && num >= 100 && num <= 230 ? num : '';
    BoneDB.save();
    renderStrengthenHubView();
  }

  function shareStrengthenBriefWhatsApp() {
    playSound('tap');
    const u = state.userProfile;
    const scan = latestScan();
    const low = scanLowest(scan);
    const vitD = labHistory('vit_d')[0];
    const lines = [
      '*BONE SIP: My bone health summary*',
      `${u.fullName || 'Me'} · ${u.age || '—'} years · BMI ${calculateBMI()}`,
      '',
      scan && low !== null
        ? `*DXA scan (${scan.date || 'date not saved'}):* lowest T-score ${low.toFixed(1)}${T_SITES.filter(([k]) => isNum(scan[k])).map(([k, n]) => ` · ${n} ${scan[k]}`).join('')}`
        : '*DXA scan:* none saved yet',
      vitD ? `*Vitamin D:* ${vitD.value} ng/mL (${vitD.date || 'date not saved'})` : '*Vitamin D:* not tested yet',
      (state.meds || []).length ? `*Medicines:* ${state.meds.map(m => `${m.name} ${m.time}${m.weekly ? ' weekly' : ''}`).join(', ')}` : '',
      '',
      '*Questions for my doctor:*',
      ...autoDoctorQuestions().map(([, q], i) => `${i + 1}. ${q}`),
      ...(state.doctorVisit.questions || []).map((q, i) => `${autoDoctorQuestions().length + i + 1}. ${q}`),
      '',
      'Invest in Bones. Invest in Life.'
    ].filter(line => line !== null);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  }

  function askAiAboutStrengthenTopic(topic) {
    playSound('tap');
    toggleChatDrawer();
    const low = scanLowest(latestScan());
    const vitD = labHistory('vit_d')[0];
    let query = 'What should I discuss with my doctor about my bone health?';
    if (topic === 'doctor') {
      query = low !== null
        ? `My lowest DXA T-score is ${low.toFixed(1)}${vitD ? ` and my vitamin D is ${vitD.value} ng/mL` : ''}. What should I ask my doctor at my next visit?`
        : 'I have not had a DXA bone scan yet. Do I need one, and what should I ask my doctor?';
    }
    const input = document.getElementById('chatTextInput');
    if (input) {
      input.value = query;
      sendChatMessage();
    }
  }

  // --------------------------------------------------------------------------
  // MODULE: PRINTABLE DOCUMENTS (bone report + doctor visit summary)
  // --------------------------------------------------------------------------
  // "Save PDF" renders a proper A4 document into #printDoc and prints only that,
  // rather than printing whatever is on screen.
  function bmiCategory(bmi) {
    if (isNaN(bmi)) return ['–', '#6B6580'];
    return bmi < 18.5 ? ['Underweight', '#D97706'] : bmi < 25 ? ['Healthy', '#1E9E62'] : bmi < 30 ? ['Overweight', '#D97706'] : ['High', '#DC2626'];
  }

  function optionTitle(list, id) {
    const o = (list || []).find(x => x.id === id);
    return o ? o.title : '';
  }

  function maskedPhone() {
    const phone = state.userProfile.phone || (state.auth && state.auth.phone) || '';
    return phone ? `+91 ••••••${String(phone).slice(-4)}` : '—';
  }

  function homeSafetySummary() {
    const rooms = BONE_SIP_DATA.protectHomeAuditRooms || [];
    let safe = 0, total = 0, answered = 0;
    const rows = rooms.map(room => {
      const ans = state.protectHomeAuditAnswers[room.id] || {};
      const fixes = room.questions.filter(q => ans[q.id] === 'no').map(q => q.text);
      const yes = room.questions.filter(q => ans[q.id] === 'yes').length;
      const done = room.questions.filter(q => ans[q.id]).length;
      safe += yes; total += room.questions.length; answered += done;
      return { name: room.name, yes, count: room.questions.length, done, fixes };
    });
    return { rows, safe, total, answered };
  }

  const pdSection = (num, title, inner, flow = false) => `
    <section class="pd-sec${flow ? ' flow' : ''}">
      <h2><span>${num}</span>${title}</h2>
      ${inner}
    </section>`;

  const pdTable = (head, rows, cls = '') => `
    <table class="pd-table ${cls}">
      <thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;

  const pdBar = (pct, color) => `<span class="pd-bar"><i style="width: ${Math.max(0, Math.min(100, pct))}%; background: ${color};"></i></span>`;

  function pdPatientHtml() {
    const u = state.userProfile;
    const bmi = parseFloat(calculateBMI());
    const conditions = (u.healthConditions || []).filter(c => c !== 'none')
      .map(c => optionTitle(BONE_SIP_DATA.healthConditionOptions, c)).filter(Boolean);
    const rows = [
      ['Name', escapeHtml(u.fullName) || '—'],
      ['Mobile', maskedPhone()],
      ['Age', u.age ? `${escapeHtml(u.age)} years` : '—'],
      ['Height · Weight', `${escapeHtml(u.heightCm)} cm · ${escapeHtml(u.weightKg)} kg`],
      ['BMI', isNaN(bmi) ? '—' : `${bmi} <em style="color: ${bmiCategory(bmi)[1]};">${bmiCategory(bmi)[0]}</em>`],
      ['Diet', formatDietName(u.diet)],
      ['Activity', optionTitle(BONE_SIP_DATA.activityLevelOptions, u.activityLevel) || '—'],
      ['Bone history', conditions.length ? conditions.join(', ') : 'None reported']
    ];
    return `<dl class="pd-kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  }

  function pdShell({ title, intro, body }) {
    const dateStr = I18N.date(new Date(), { day: 'numeric', month: 'long', year: 'numeric' });
    // Table header/footer groups repeat on every printed page.
    return `
      <table class="pd-page">
        <thead><tr><td>
          <header class="pd-head">
            <img src="assets/images/bonesip_logo_720.webp" alt="BONE SIP" width="130" height="52">
            <div class="pd-head-meta"><b>${title}</b><span>${t('Prepared {date}', { date: dateStr })}</span></div>
          </header>
        </td></tr></thead>
        <tfoot><tr><td>
          <footer class="pd-foot">
            <span>BONE SIP · Invest in Bones. Invest in Life.</span>
            <span>For discussion with a doctor. Not a medical diagnosis.</span>
          </footer>
        </td></tr></tfoot>
        <tbody><tr><td>
          <h1 class="pd-title">${title}</h1>
          <p class="pd-intro">${intro}</p>
          ${body}
        </td></tr></tbody>
      </table>`;
  }

  function healthReportDocHtml() {
    const todayISO = getTodayISODate();
    const score = calculateDailyScore100(todayISO);
    const bmi = parseFloat(calculateBMI());
    const streak = state.activeStreakDays || 0;
    const exTarget = getDailyExerciseTarget();

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const diet = Math.min(5, (state.checkedDietMilestones[iso] || new Set()).size);
      const ex = Math.min(exTarget, (state.checkedExerciseMilestones[iso] || new Set()).size);
      const pct = Math.round(Math.min(1, (diet / 5) * 0.6 + (ex / exTarget) * 0.4) * 100);
      days.push([
        `${I18N.date(d, { weekday: 'short', day: 'numeric', month: 'short' })}${i === 0 ? ` <em>(${t('today')})</em>` : ''}`,
        `${diet} / 5`, `${ex} / ${exTarget}`, `${pdBar(pct, '#8E2C6A')} ${pct}%`
      ]);
    }

    const parts = [
      ['Diet milestones', 'Meals & calcium-rich foods ticked off', score.dietPts, 40, '#D6265A'],
      ['Exercise', 'Bone-loading moves completed', score.exPts, 30, '#8E2C6A'],
      ['Safety & sunlight', 'Home safety check + daily sunlight', score.safePts, 20, '#4A3F7A'],
      ['Streak bonus', `${streak} day streak`, score.streakPts, 10, '#D97706']
    ];

    const risks = (BONE_SIP_DATA.boneRiskAuditFactors || []).filter(f => state.protectRiskChecked.has(f.id));
    const risk = getRiskLevel(risks.length);
    const home = homeSafetySummary();

    const body = `
      ${pdSection(1, 'Patient details', pdPatientHtml())}
      ${pdSection(2, 'Summary', `
        <div class="pd-kpis">
          <div><span>Today's bone score</span><b>${score.total}<small> / 100</small></b><em>${score.tier}</em></div>
          <div><span>Habit streak</span><b>${streak}<small> ${streak === 1 ? 'day' : 'days'}</small></b><em>Consecutive active days</em></div>
          <div><span>Body mass index</span><b>${isNaN(bmi) ? '–' : bmi}</b><em style="color: ${bmiCategory(bmi)[1]};">${bmiCategory(bmi)[0]}</em></div>
        </div>`)}
      ${pdSection(3, 'Score breakdown (today)', pdTable(
        ['Area', 'What it measures', 'Points', ''],
        [...parts.map(([a, m, v, max, c]) => [`<b>${a}</b>`, m, `${v} / ${max}`, pdBar((v / max) * 100, c)]),
         ['<b>Total</b>', '', `<b>${score.total} / 100</b>`, pdBar(score.total, '#2A2540')]],
        'pd-score'))}
      ${pdSection(4, 'Last 7 days', pdTable(['Day', 'Meals & sunlight', 'Exercises', 'Daily progress'], days, 'pd-week'), true)}
      ${pdSection(5, 'Fall-risk check', `
        <p class="pd-line"><b>${risks.length} of ${(BONE_SIP_DATA.boneRiskAuditFactors || []).length} warning signs</b> · <span class="pd-tag" style="--c: ${risk.color};">${risk.label} risk</span></p>
        ${risks.length ? `<ul class="pd-list">${risks.map(r => `<li>${r.text}</li>`).join('')}</ul>` : '<p class="pd-muted">No warning signs noted.</p>'}`)}
      ${pdSection(6, 'Home safety check', `
        <p class="pd-line"><b>${home.safe} of ${home.total} checks safe</b>${home.answered < home.total ? ` · ${home.total - home.answered} not yet checked` : ''}</p>
        ${pdTable(['Room', 'Safe', 'Needs attention'], home.rows.map(r => [
          `<b>${r.name}</b>`, `${r.yes} / ${r.count}`,
          r.fixes.length ? r.fixes.join('<br>') : (r.done ? '<span class="pd-muted">Nothing</span>' : '<span class="pd-muted">Not checked</span>')
        ]))}`, true)}
      ${pdSection(7, 'Discuss with your doctor', `
        <ul class="pd-list">
          <li>Your daily calcium target (often 1,000–1,200 mg)</li>
          <li>A Vitamin D blood test (25-OH Vitamin D)</li>
          <li>Whether you need a DXA bone density scan</li>
          ${risks.length >= 2 ? `<li>The ${risks.length} fall-risk signs noted above</li>` : ''}
        </ul>`)}
      <p class="pd-note">The bone score is an estimate built from daily habits logged in BONE SIP (diet, exercise, home safety and sunlight). It does not measure bone density and is not a medical diagnosis.</p>`;

    return pdShell({
      title: 'Bone Health Report',
      intro: 'A summary of daily bone-building habits, fall risk and home safety, recorded in the BONE SIP app.',
      body
    });
  }

  function doctorSummaryDocHtml() {
    const questions = autoDoctorQuestions().map(([, text]) => ({ text }))
      .concat((state.doctorVisit.questions || []).map(text => ({ text: escapeHtml(text) })));
    const scans = byNewest(state.scans);
    const labRow = (id, label, unit, ref) => {
      const h = labHistory(id)[0];
      return [`<b>${label}</b>`, h ? `${h.value} ${unit}` : '—', h && h.date ? fmtRecordDate(h.date) : '—', ref];
    };
    const u = state.userProfile;
    const risks = (BONE_SIP_DATA.boneRiskAuditFactors || []).filter(f => state.protectRiskChecked.has(f.id));
    const risk = getRiskLevel(risks.length);
    const home = homeSafetySummary();
    const conditions = (u.healthConditions || []).filter(c => c !== 'none')
      .map(c => optionTitle(BONE_SIP_DATA.healthConditionOptions, c)).filter(Boolean);
    const guide = BONE_SIP_DATA.dxaInterpretationGuide || { ranges: [] };
    const dxaColors = ['#1E9E62', '#D97706', '#B1315D'];
    const fixes = home.rows.flatMap(r => r.fixes.map(f => `${tr(r.name)}: ${tr(f)}`));

    const body = `
      ${pdSection(1, 'Patient details', pdPatientHtml())}
      ${pdSection(2, 'My questions', `
        <ol class="pd-qs">
          ${questions.map(q => `
            <li>
              <b>${q.text}</b>
              <div class="pd-write"><span>Doctor's answer</span><i></i><i></i></div>
            </li>`).join('')}
        </ol>`, true)}
      ${pdSection(3, 'Things my doctor should know', pdTable(['Topic', 'Details'], [
        ['<b>Bone history</b>', conditions.length ? conditions.join(', ') : 'None reported'],
        ['<b>Fall-risk signs</b>', `${risks.length ? risks.map(r => r.text).join(', ') : 'None noted'} <span class="pd-tag" style="--c: ${risk.color};">${risk.label} risk</span>`],
        ['<b>Home safety</b>', `${home.safe} of ${home.total} checks safe${fixes.length ? `<br><span class="pd-muted">${t('To fix: {list}', { list: fixes.join('; ') })}</span>` : ''}`],
        ['<b>Activity</b>', optionTitle(BONE_SIP_DATA.activityLevelOptions, u.activityLevel) || '—'],
        ['<b>Diet</b>', formatDietName(u.diet)]
      ], 'pd-facts'), true)}
      ${pdSection(4, 'My DXA scan results', `
        ${scans.length ? pdTable(['Scan date', 'Spine', 'Hip neck', 'Total hip', 'Lowest'], scans.map(sc => [
          `<b>${fmtRecordDate(sc.date)}</b>`,
          ...['spine', 'neck', 'hip'].map(k => (isNum(sc[k]) ? sc[k].toFixed(1) : '—')),
          scanLowest(sc) === null ? '—' : `<b>${scanLowest(sc).toFixed(1)}</b>`
        ]), 'pd-fill') : '<p class="pd-muted">No DXA scan saved yet.</p>'}
        <h3 class="pd-h3">Blood tests (latest)</h3>
        ${pdTable(['Test', 'Result', 'Date', 'Usual range'], [
          labRow('vit_d', '25-OH Vitamin D', 'ng/mL', '30–60 ng/mL'),
          labRow('calcium', 'Serum calcium', 'mg/dL', '8.5–10.2 mg/dL'),
          labRow('alp', 'Alkaline phosphatase (ALP)', 'IU/L', '40–129 IU/L'),
          labRow('egfr', 'Kidney (eGFR)', 'mL/min', 'Above 60 mL/min')
        ], 'pd-fill')}
        ${(state.meds || []).length ? `<h3 class="pd-h3">Medicines I take</h3>${pdTable(['Medicine', 'When'], state.meds.map(m => [`<b>${escapeHtml(m.name)}</b>`, `${m.time}${m.weekly ? ' (once a week)' : ' (daily)'}`]), 'pd-fill')}` : ''}
        <h3 class="pd-h3">How to read a T-score</h3>
        ${pdTable(['T-score', 'Category', 'What it means'], guide.ranges.map((r, i) => [
          `<b>${r.score.replace('T-Score ', '')}</b>`,
          `<span class="pd-dot" style="--c: ${dxaColors[i] || '#6B6580'};"></span>${r.category}`,
          r.meaning
        ]), 'pd-dxa')}`, true)}
      ${pdSection(5, 'Plan agreed with my doctor', `
        <div class="pd-plan">
          ${['Calcium target (mg/day)', 'Vitamin D (dose / test)', 'Medicines', 'Next DXA scan', 'Other tests', 'Next appointment']
            .map(l => `<div><span>${l}</span><i></i></div>`).join('')}
        </div>
        <div class="pd-write tall"><span>Other notes</span><i></i><i></i></div>`)}`;

    return pdShell({
      title: 'Doctor Visit Summary',
      intro: `${questions.length} ${questions.length === 1 ? 'question' : 'questions'} to discuss at my next visit, with the background my doctor may need.`,
      body
    });
  }

  async function printDocument(kind) {
    playSound('tap');
    const host = document.getElementById('printDoc');
    if (!host) return;
    host.innerHTML = kind === 'doctor' ? doctorSummaryDocHtml() : healthReportDocHtml();
    // Make sure the logo is ready, or it prints blank.
    await Promise.all(Array.from(host.querySelectorAll('img')).map(img => (img.decode ? img.decode().catch(() => {}) : null)));

    const prevTitle = document.title;
    // Browsers use the title as the suggested PDF file name.
    document.title = `BONE SIP ${kind === 'doctor' ? 'Doctor Visit Summary' : 'Bone Health Report'} ${getTodayISODate()}`;
    document.body.classList.add('printing-doc');
    const cleanup = () => {
      window.removeEventListener('afterprint', cleanup);
      document.title = prevTitle;
      setTimeout(() => document.body.classList.remove('printing-doc'), 500);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  // --------------------------------------------------------------------------
  // MODULE: LANGUAGE (English + 10 Indian languages, see js/i18n.js)
  // --------------------------------------------------------------------------
  // Picker copy is shown in the language being previewed, before it is applied.
  const LANG_PICKER_COPY = {
    en: ['Choose your language', 'You can change this anytime from the top bar.', 'Continue'],
    hi: ['अपनी भाषा चुनें', 'इसे आप कभी भी ऊपर की पट्टी से बदल सकते हैं।', 'आगे बढ़ें'],
    bn: ['আপনার ভাষা বেছে নিন', 'উপরের বার থেকে যেকোনো সময় এটি বদলাতে পারবেন।', 'এগিয়ে চলুন'],
    mr: ['तुमची भाषा निवडा', 'वरच्या पट्टीतून ही भाषा कधीही बदलता येईल.', 'पुढे चला'],
    te: ['మీ భాషను ఎంచుకోండి', 'పై పట్టీ నుండి దీన్ని ఎప్పుడైనా మార్చవచ్చు.', 'కొనసాగించండి'],
    ta: ['உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', 'மேலே உள்ள பட்டையிலிருந்து இதை எப்போது வேண்டுமானாலும் மாற்றலாம்.', 'தொடரவும்'],
    gu: ['તમારી ભાષા પસંદ કરો', 'ઉપરની પટ્ટીમાંથી તમે તેને ગમે ત્યારે બદલી શકો છો.', 'આગળ વધો'],
    kn: ['ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', 'ಮೇಲಿನ ಪಟ್ಟಿಯಿಂದ ಇದನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಬಹುದು.', 'ಮುಂದುವರಿಸಿ'],
    ml: ['നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക', 'മുകളിലെ ബാറിൽ നിന്ന് ഇത് എപ്പോൾ വേണമെങ്കിലും മാറ്റാം.', 'തുടരുക'],
    pa: ['ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ', 'ਤੁਸੀਂ ਇਸਨੂੰ ਕਦੇ ਵੀ ਉੱਪਰਲੀ ਪੱਟੀ ਤੋਂ ਬਦਲ ਸਕਦੇ ਹੋ।', 'ਅੱਗੇ ਵਧੋ'],
    or: ['ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ', 'ଉପର ପଟିରୁ ଏହାକୁ ଯେକୌଣସି ସମୟରେ ବଦଳାଇ ପାରିବେ।', 'ଆଗକୁ ବଢ଼ନ୍ତୁ']
  };
  let langPickerChoice = 'en';
  let langPickerThen = null;

  function openLanguagePicker(opts = {}) {
    const el = document.getElementById('langPicker');
    if (!el) return;
    if (!opts.firstRun) playSound('tap');
    langPickerChoice = I18N.current();
    langPickerThen = typeof opts.then === 'function' ? opts.then : null;
    el.classList.toggle('first-run', !!opts.firstRun);
    renderLanguagePicker();
    el.hidden = false;
    document.body.classList.add('lang-open');
    requestAnimationFrame(() => el.classList.add('open'));
    const sel = el.querySelector('.lang-option.selected');
    if (sel) setTimeout(() => sel.focus({ preventScroll: true }), 50);
  }

  function renderLanguagePicker() {
    const grid = document.getElementById('langGrid');
    if (grid) {
      grid.innerHTML = I18N.LANGS.map(l => `
        <button type="button" class="lang-option ${l.code === langPickerChoice ? 'selected' : ''}" lang="${l.code}" onclick="BoneApp.pickLanguage('${l.code}')" aria-pressed="${l.code === langPickerChoice}">
          <span class="lang-glyph" aria-hidden="true">${l.glyph}</span>
          <span class="lang-names"><b>${l.native}</b>${l.code === 'en' ? '' : `<small>${l.name}</small>`}</span>
          <span class="lang-tick" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
        </button>`).join('');
    }
    const copy = LANG_PICKER_COPY[langPickerChoice] || LANG_PICKER_COPY.en;
    const set = (id, text) => { const el = document.getElementById(id); if (el) { el.textContent = text; el.lang = langPickerChoice; } };
    set('langPickerTitle', copy[0]);
    set('langPickerSub', copy[1]);
    set('langContinueLabel', copy[2]);
  }

  function pickLanguage(code) {
    playSound('tap');
    langPickerChoice = code;
    renderLanguagePicker();
  }

  function confirmLanguage() {
    playSound('success');
    const then = langPickerThen;
    const btn = document.getElementById('langContinueBtn');
    if (btn) btn.disabled = true;
    I18N.setLanguage(langPickerChoice).then(() => {
      if (btn) btn.disabled = false;
      closeLanguagePicker(true);
      if (then) then();
    });
  }

  function closeLanguagePicker(silent) {
    const el = document.getElementById('langPicker');
    if (!el || el.hidden) return;
    // The first-run picker can't be dismissed without choosing.
    if (!silent && el.classList.contains('first-run')) return;
    if (!silent) playSound('tap');
    el.classList.remove('open');
    document.body.classList.remove('lang-open');
    setTimeout(() => { el.hidden = true; }, 220);
  }

  function updateHeaderLangButton() {
    const label = document.getElementById('headerLangLabel');
    const lang = I18N.language ? I18N.language() : null;
    if (label) label.textContent = lang ? lang.native : 'English';
  }

  // The reply language Ojas uses: the chat's own choice, else the app language.
  function chatReplyLanguage() {
    if (state.chatLanguage && state.chatLanguage !== 'auto') return state.chatLanguage;
    return I18N.current() !== 'en' ? I18N.current() : 'auto';
  }

  // Re-render everything built with t()/dates so it switches language too.
  function onLanguageChanged() {
    updateHeaderLangButton();
    renderPillarBottomNav();
    updateHeaderProfileBadge();
    const view = document.body.dataset.view;
    if (view === 'assessment') renderAssessmentStage();
    else if (view === 'build') switchBuildSubTab(state.activeBuildSubTab || 'diet', true);
    else if (view === 'protect') renderProtectHubView();
    else if (view === 'strengthen') renderStrengthenHubView();
    const tour = document.getElementById('appOnboardingOverlay');
    if (tour && tour.style.display === 'flex') renderOnboardingCarousel();
    const report = document.getElementById('progressiveReportModal');
    if (report && report.style.display === 'flex') generateProgressiveHealthReport();
    // A chat that only holds the greeting starts again in the new language.
    if ((state.chatHistory || []).every(m => m.greeting)) state.chatHistory = [];
    if (state.isChatDrawerOpen) {
      renderChatLanguageSelect();
      renderChatContextStrip();
      renderQuickChips();
      if (!state.chatHistory.length) initChatbotGreeting();
    }
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  function registerServiceWorker() {
    const cfg = window.BONE_SIP_CONFIG || {};
    if (!cfg.enableServiceWorker || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
    // Skip on local dev servers so edits show up immediately; add ?sw=1 to test offline mode locally.
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (isLocal && !/[?&]sw=1\b/.test(location.search)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    const register = () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => {
          if (reg && typeof reg.update === 'function') {
            reg.update().catch(() => {});
          }
        })
        .catch(err => console.warn('Service worker registration failed:', err));
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
  }

  function init() {
    const hadSavedData = BoneDB.load();
    updateActiveStreak();
    calculateBMI();
    renderPillarBottomNav();
    updateHeaderProfileBadge();
    syncCoachToggle();
    setupOnboardingSwipe();
    updateHeaderLangButton();
    document.addEventListener('bonesip:language', onLanguageChanged);

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
        const picker = document.getElementById('langPicker');
        if (picker && !picker.hidden) { closeLanguagePicker(); return; }
        const playerEl = document.getElementById('workoutPlayer');
        if (playerEl && !playerEl.hidden) {
          closePlayer(player.phase === 'done');
          return;
        }
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

    // Close volume dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const wrap = document.querySelector('.pl-vol-wrap');
      const pop = document.getElementById('plVolPop');
      if (pop && !pop.hidden && wrap && !wrap.contains(e.target)) {
        pop.hidden = true;
      }
    });

    // Account sync & session check
    scheduleCloudSync(1500);
    checkCloudSession();
    window.addEventListener('online', () => { scheduleCloudSync(500); checkCloudSession(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && isCloudUser()) syncToCloud();
    });

    registerServiceWorker();
  }

  async function checkCloudSession() {
    if (!accountsApi()) return;
    try {
      const res = await apiCall('GET', '/me');
      if (res.ok && res.json && res.json.user) {
        state.auth.isVerified = true;
        state.auth.phone = res.json.user.phone;
        state.auth.cloud = true;
        state.userProfile.phone = res.json.user.phone;
        if (res.json.user.createdAt) state.auth.createdAt = res.json.user.createdAt;
        BoneDB.save();
        updateHeaderProfileBadge();
        renderProfileAccountBox();
      }
    } catch (err) {
      // offline or unreachable: do not reset verified state
    }
  }

  // Public API exposure for DOM Event Handlers
  window.BoneApp = {
    startOnboardingTour,
    skipOnboarding,
    openLanguagePicker,
    pickLanguage,
    confirmLanguage,
    closeLanguagePicker,
    nextOnboardingSlide,
    goToOnboardingSlide,

    navigatePillar,
    renderAssessmentStage,
    setBuildAssessmentStep,
    setProtectAssessmentStep,
    setStrengthenAssessmentStep,
    toggleLifeAsset,
    selectDiet,
    selectRegionalFood,
    selectActivity,
    toggleHealthCondition,
    toggleProtectRisk,
    selectAuditRoom,
    setHomeAuditAnswer,
    toggleStrengthenDoctor,

    openHeightWeightModal,
    closeHeightWeightModal,
    onHeightChange,
    onWeightChange,
    saveHeightWeightModal,
    saveBaseline,
    editBaseline,
    continueFromDiet,

    proceedToLogin,
    sendInlineOTP,
    autofillInlineOTP,
    handleInlineOtpInput,
    verifyInlineOTP,
    changeAuthPhone,
    handleAuthBack,
    completeProtectAssessment,
    completeStrengthenAssessment,

    switchBuildSubTab,
    selectCalendarDate,
    selectCalendarDay,
    prevCalendarWeek,
    nextCalendarWeek,
    jumpToTodayCalendar,
    renderBuildDietView,
    toggleDietMilestone,
    toggleDietItem,
    toggleExerciseMilestone,
    showPastDayNotice,
    switchGlobalCoach,

    openWorkoutTimerModal,
    selectExerciseGroup,
    openExerciseDetail,
    renderExerciseDetail,
    closeExerciseDetail,
    startDetailExercise,
    adjustExerciseDuration,
    startWorkout,
    playerTogglePause,
    playerCompleteCurrent,
    playerSkip,
    playerAddRest,
    closePlayer,
    toggleVoice,
    onVolumeChange,
    closeWorkoutTimerModal,
    toggleWorkoutTimer,
    resetWorkoutTimer,
    completeWorkoutExercise,

    selectHubRoom,
    setHubRoomAnswer,
    renderProtectHubView,
    toggleHubDoctor,
    shareDoctorReviewWhatsApp,
    setChatLanguage,
    runAssistantAction,
    printDocument,

    // Meal Swap System
    openMealSwapModal,
    closeMealSwapModal,
    setMealSwapRegionFilter,
    setMealSwapDietFilter,
    filterMealSwapCatalog,
    applyMealSwap,
    openItemOptions,
    filterItemOptions,
    closeItemOptions,
    applyItemSwap,
    resetItemSwap,

    // Exercise Swap System
    openExerciseSwapModal,
    closeExerciseSwapModal,
    setExerciseSwapCatFilter,
    applyExerciseSwap,

    // Progressive Health Report
    openProgressiveReportModal,
    closeProgressiveReportModal,
    generateProgressiveHealthReport,
    shareProgressiveReportWhatsApp,

    // Clean Diet Experience (matching Images 2, 3, 4, 5)
    cycleSlotMeal,
    filterMealSlotView,
    recordYesterdayFeedback,
    selectPrefDiet,
    selectPrefActivity,
    selectPrefRegion,
    togglePrefCondition,
    setHeightUnit,

    // User Profile & Database
    openUserProfileModal,
    closeUserProfileModal,
    saveUserProfileModal,
    exportDatabaseJSON,
    resetDatabase,
    openLogin,
    cancelLogin,
    logout,
    deleteAccount,
    openHistoryModal,
    closeHistoryModal,
    shiftHistoryMonth,
    selectHistoryDay,

    // AI Chatbot
    toggleChatDrawer,
    closeChatDrawer,
    clearChatHistory,
    sendChatMessage,
    generateBotResponse,

    // Protect Precaution Suggestion & Safety Risk Analysis
    completeBuildPillar,
    dismissProtectBanner,
    renderProtectSuggestionBanner,
    renderProtectSafetyAnalysis,
    toggleRoomCheckDropdown,
    shareProtectSafetyWhatsApp,
    askAiAboutFallSafety,
    markHazardFixed,
    scrollToRoomCheck,

    // Strengthen Clinical Medical & Bone Care Portal (V3.5)
    setStrengthenMode,
    switchStrengthenSubTab,
    renderStrengthenHubView,
    toggleHubDoctor,
    shareDoctorReviewWhatsApp,
    toggleFraxFactor,
    setSpineHeight,
    openStrengthenForm,
    closeStrengthenForm,
    saveScan,
    deleteScan,
    saveLab,
    deleteLab,
    pickMedKind,
    saveMed,
    deleteMed,
    toggleMedTaken,
    setDoctorVisitDate,
    addDoctorQuestion,
    deleteDoctorQuestion,
    shareStrengthenBriefWhatsApp,
    askAiAboutStrengthenTopic
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
