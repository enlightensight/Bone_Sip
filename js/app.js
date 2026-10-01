// BONE SIP - Streamlined 3-Pillar Architecture (Build · Protect · Strengthen)
// OpenDesign Specification with Multi-Step Progressive Gating & Daily Continuous Streak

(function () {
  'use strict';

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

    // Protect assessment choices (Images 2, 3, 4) - default unchecked
    protectRiskChecked: new Set(),
    protectHomeAuditAnswers: {},
    selectedAuditRoom: 'room_bathroom',

    // Strengthen assessment choices (Image 5) - default unchecked
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
        renderProtectHubView();
      }
    } else if (pillarId === 'strengthen') {
      if (!state.completedPillars.strengthen) {
        state.assessmentPhase = 'strengthen';
        showView('assessment');
        renderAssessmentStage();
      } else {
        showView('strengthen');
        renderStrengthenHubView();
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
          <span class="wiz-count ${state.selectedAssets.length ? 'on' : ''}" id="assetSelectedCount"><i class="fa-solid fa-circle-check"></i> ${state.selectedAssets.length} selected</span>
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

  // 3. STRENGTHEN ASSESSMENT STEPS (IMAGE 5)
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

  // Helper Setters for Assessment
  function setBuildAssessmentStep(step) {
    playSound('tap');
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
      countEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${state.selectedAssets.length} selected`;
      countEl.classList.toggle('on', state.selectedAssets.length > 0);
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

  function autofillInlineOTP() {
    if (!isDemoMode()) return;
    playSound('check');
    const code = ((window.BONE_SIP_CONFIG || {}).demoOtpCode || '849201').split('');
    document.querySelectorAll('.inline-otp').forEach((input, index) => { input.value = code[index] || ''; });
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
      const dayShort = dayName.slice(0, 3).toUpperCase();
      const monthShort = monthNames[d.getMonth()];
      const monthFull = fullMonthNames[d.getMonth()];

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
  const BoneDB = {
    KEY: 'BONE_SIP_PRODUCTION_DB_V3',

    save() {
      try {
        const payload = {
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
          chatHistory: state.chatHistory || [],
          checkedDietMilestones: Object.keys(state.checkedDietMilestones || {}).reduce((acc, k) => {
            acc[k] = Array.from(state.checkedDietMilestones[k] || []);
            return acc;
          }, {}),
          checkedExerciseMilestones: Object.keys(state.checkedExerciseMilestones || {}).reduce((acc, k) => {
            acc[k] = Array.from(state.checkedExerciseMilestones[k] || []);
            return acc;
          }, {})
        };
        localStorage.setItem(this.KEY, JSON.stringify(payload));
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
  // MODULE: DAILY BONE HEALTH SCORE ENGINE (0 TO 100)
  // --------------------------------------------------------------------------
  function calculateDailyScore100(dateKey) {
    const todayISO = getTodayISODate();
    const effectiveKey = dateKey || state.selectedCalendarDate || todayISO;

    // 1. Diet Milestones (5 items * 8 pts = 40 pts)
    const dietSet = state.checkedDietMilestones[effectiveKey] || new Set();
    const checkedDietCount = Math.min(5, dietSet.size);
    const dietPts = checkedDietCount * 8; // Max 40

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
    const d3Done = dietSet.has('m_sun_d3') ? 10 : 0;
    const safePts = homeAuditPts + d3Done; // Max 20

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
    const t = String(name).toLowerCase();
    const has = words => words.some(w => t.includes(w));
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

    return slots.map(slot => {
      // 1. Check custom meal swap for this date & slot
      if (state.customMealSwaps[dateKey] && state.customMealSwaps[dateKey][slot.id]) {
        return {
          id: slot.id,
          slot: slot.slotName,
          slotId: slot.id,
          time: slot.time,
          meal: applyItemSwaps(dateKey, slot.id, state.customMealSwaps[dateKey][slot.id]),
          isCustomSwapped: true
        };
      }

      // 2. Intelligent selection from 100+ catalog matching user's region and diet
      let candidate = catalog.find(m => m.slot === slot.slotId && m.region === userReg && m.diet === userDiet);
      if (!candidate && userDiet !== 'veg') {
        candidate = catalog.find(m => m.slot === slot.slotId && m.region === userReg);
      }
      if (!candidate) {
        candidate = catalog.find(m => m.slot === slot.slotId && m.diet === userDiet);
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

      return {
        id: slot.id,
        slot: slot.slotName,
        slotId: slot.id,
        time: slot.time,
        meal: applyItemSwaps(dateKey, slot.id, candidate),
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
    set('itemSwapTitle', `Instead of ${current.name}`);
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
    BoneDB.save();
    closeItemOptions();
    renderBuildDietView();
    showToast(`Swapped to ${opt.name}`, 'fa-arrows-rotate');
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
    clearItemSwaps(dateKey, slotId);

    BoneDB.save();
    closeMealSwapModal();
    renderBuildDietView();
    showToast(`🍽️ Meal updated to: ${meal.name.slice(0, 36)}...`, 'fa-circle-check');
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
    const bmiInfo = bmi < 18.5 ? ['Underweight', '#D97706'] : bmi < 25 ? ['Healthy', '#1E9E62'] : bmi < 30 ? ['Overweight', '#D97706'] : ['High', '#DC2626'];

    const dateBadge = document.getElementById('reportDateBadge');
    if (dateBadge) dateBadge.textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const exTarget = getDailyExerciseTarget();
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
    if (!state.userProfile.conditions) {
      state.userProfile.conditions = ['bone'];
    }
    const idx = state.userProfile.conditions.indexOf(cond);
    if (idx !== -1) {
      state.userProfile.conditions.splice(idx, 1);
    } else {
      if (cond === 'healthy') {
        state.userProfile.conditions = ['healthy'];
      } else {
        state.userProfile.conditions = state.userProfile.conditions.filter(c => c !== 'healthy');
        state.userProfile.conditions.push(cond);
      }
    }
    document.querySelectorAll('#profHealthPills .pref-pill').forEach(btn => {
      btn.classList.toggle('active', state.userProfile.conditions.includes(btn.dataset.cond));
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

    if (nameInput) nameInput.value = state.userProfile.fullName || '';
    if (phoneInput) {
      phoneInput.value = state.auth.phone || state.userProfile.phone || '';
      phoneInput.readOnly = !!state.auth.isVerified;
      phoneInput.title = state.auth.isVerified ? 'Verified number' : '';
    }
    if (hInput) hInput.value = state.userProfile.heightCm || 165;
    if (wInput) wInput.value = state.userProfile.weightKg || 62;
    if (regSelect) regSelect.value = state.userProfile.regionalFood || 'north';
    if (dietSelect) dietSelect.value = state.userProfile.diet || 'veg';

    // Sync pill classes matching Image 4
    const userDiet = state.userProfile.diet || 'veg';
    const userReg = state.userProfile.regionalFood || 'north';
    const userAct = state.userProfile.activityLevel || 'light';
    const userConds = state.userProfile.conditions || ['bone'];

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

    if (modal) modal.style.display = 'flex';
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
    if (phoneInput && !state.auth.isVerified) {
      state.userProfile.phone = phoneInput.value.replace(/\D/g, '').slice(-10);
    }
    const h = parseInt(hInput && hInput.value, 10);
    const w = parseInt(wInput && wInput.value, 10);
    if (h >= 100 && h <= 230) state.userProfile.heightCm = h;
    if (w >= 25 && w <= 250) state.userProfile.weightKg = w;
    if (h >= 100 && h <= 230 && w >= 25 && w <= 250) state.userProfile.baselineSet = true;
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

  function exportDatabaseJSON() {
    BoneDB.exportJSON();
  }

  function resetDatabase() {
    if (confirm('Are you sure you want to clear your local bone records and reset the assessment?')) {
      BoneDB.reset();
    }
  }

  function updateHeaderProfileBadge() {
    const userProf = document.getElementById('userHeaderProfile');
    if (!userProf) return;
    const verified = !!(state.auth.isVerified && state.auth.phone);
    userProf.innerHTML = `
      <button class="avatar-btn" id="loginHeaderBtn" aria-label="${verified ? 'Open profile (verified)' : 'Open profile'}" title="My profile">
        <i class="fa-solid fa-user"></i>
        ${verified ? '<span class="avatar-dot"><i class="fa-solid fa-check"></i></span>' : ''}
      </button>`;
  }

  // --------------------------------------------------------------------------
  // MODULE: INTELLIGENT AI BONE HEALTH & NUTRITION CHATBOT
  // --------------------------------------------------------------------------
  function toggleChatDrawer() {
    playSound('tap');
    state.isChatDrawerOpen = !state.isChatDrawerOpen;
    const drawer = document.getElementById('boneChatDrawer');
    if (!drawer) return;

    if (state.isChatDrawerOpen) {
      drawer.style.display = 'flex';
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

    const chips = (BONE_SIP_DATA.botKnowledge && BONE_SIP_DATA.botKnowledge.quickSuggestions) || [
      { text: "🥗 High-calcium meals for my region", query: "meal_suggestion" },
      { text: "📊 Check my 100-point Score & Streak", query: "streak_score" },
      { text: "🦴 Explain DXA T-Score", query: "dxa_explanation" },
      { text: "🦵 Best exercises for hip strength", query: "exercise_advice" },
      { text: "🛡️ Bathroom fall precautions", query: "fall_prevention" },
      { text: "👤 Show my Profile & Database", query: "user_profile" }
    ];

    container.innerHTML = chips.map(c => `
      <button class="quick-chip-btn" onclick="BoneApp.sendChatMessage('${c.query}')">
        ${c.text}
      </button>
    `).join('');
  }

  function initChatbotGreeting() {
    const user = state.userProfile;
    const score = calculateDailyScore100();
    const bmi = calculateBMI();

    let greetingText = '';
    if (user.fullName) {
      greetingText = `Hello **${user.fullName}**! 👋 I am your **BONE SIP Clinical Bone & Nutrition Coach**.\n\nI have loaded your live profile:\n• **Phone:** ${state.auth.phone ? '+91 ' + state.auth.phone : 'Not verified yet'}\n• **BMI:** ${bmi} kg/m²\n• **Regional Diet:** ${formatRegionName(user.regionalFood)} (${formatDietName(user.diet)})\n• **Today's Score:** ${score.total}/100 (${score.tier})\n• **Active Streak:** ${state.activeStreakDays} day(s)\n\nAsk me anything about regional meals, bridging your 1,200 mg calcium gap, bone-loading exercises, DXA scans, or home fall safety!`;
    } else if (state.auth.phone) {
      greetingText = `Hello! 👋 I am your **BONE SIP Clinical Bone & Nutrition Coach**.\n\nI have loaded your profile for **+91 ${state.auth.phone}**:\n• **BMI:** ${bmi} kg/m²\n• **Regional Diet:** ${formatRegionName(user.regionalFood)} (${formatDietName(user.diet)})\n• **Today's Score:** ${score.total}/100 (${score.tier})\n• **Active Streak:** ${state.activeStreakDays} day(s)\n\nAsk me anything about regional meals, bridging your 1,200 mg calcium gap, bone-loading exercises, DXA scans, or home fall safety!`;
    } else {
      greetingText = `Hello! 👋 I am your **BONE SIP Clinical Bone & Nutrition Coach**.\n\nWelcome to your bone investment journey! You are currently browsing as a **Guest**.\n\n• **Status:** Guest Session (Not logged in)\n• **Today's Score:** ${score.total}/100 (${score.tier})\n• **Active Streak:** ${state.activeStreakDays} day(s)\n\nAsk me anything about regional meals, bridging your 1,200 mg calcium gap, bone-loading exercises, DXA scans, or home fall safety! *(You can complete the assessment & verify your mobile anytime to save your records)*`;
    }

    state.chatHistory = [{
      sender: 'bot',
      text: greetingText,
      time: getCurrentTimeStr()
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

  function sendChatMessage(overrideQuery) {
    const input = document.getElementById('chatTextInput');
    const query = overrideQuery || (input ? input.value.trim() : '');
    if (!query) return;

    if (input) input.value = '';
    playSound('tap');

    state.chatHistory.push({
      sender: 'user',
      text: overrideQuery ? getQuickChipLabel(overrideQuery) : query,
      time: getCurrentTimeStr()
    });
    renderChatHistory();

    const container = document.getElementById('chatMessagesContainer');
    const typingId = 'typing_' + Date.now();
    if (container) {
      const typingEl = document.createElement('div');
      typingEl.id = typingId;
      typingEl.className = 'chat-msg-row bot';
      typingEl.innerHTML = `
        <div class="chat-typing-indicator">
          <div class="chat-typing-dot"></div>
          <div class="chat-typing-dot"></div>
          <div class="chat-typing-dot"></div>
        </div>
      `;
      container.appendChild(typingEl);
      container.scrollTop = container.scrollHeight;
    }

    setTimeout(() => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      const botReply = generateBotResponse(query);
      state.chatHistory.push({
        sender: 'bot',
        text: botReply,
        time: getCurrentTimeStr()
      });
      renderChatHistory();
      BoneDB.save();
      playSound('success');
    }, 400);
  }

  function getQuickChipLabel(q) {
    const map = {
      meal_suggestion: 'Suggest high-calcium meals for my region',
      calcium_gap: 'How to reach 1200mg calcium today?',
      exercise_advice: 'Best exercises for hip and spine strength?',
      dxa_explanation: 'Explain DXA scan T-score results',
      streak_score: 'What is my Daily Streak Score?',
      d3_mechanism: 'How does Vitamin D3 unlock calcium?',
      fall_prevention: 'What precautions prevent hip fractures at home?',
      user_profile: 'Show my Profile and Database Information'
    };
    return map[q] || q;
  }

  function generateBotResponse(raw) {
    const text = (raw || '').toLowerCase();
    const user = state.userProfile;
    const score = calculateDailyScore100();
    const bmi = calculateBMI();
    const reg = user.regionalFood || 'north';
    const diet = user.diet || 'veg';
    const catalog = BONE_SIP_DATA.fullDietCatalog || [];

    // 1. MEAL SUGGESTIONS
    if (text.includes('meal') || text.includes('food') || text.includes('diet') || text.includes('suggest') || text === 'meal_suggestion') {
      const matches = catalog.filter(m => m.region === reg && (diet === 'all' || m.diet === diet)).slice(0, 3);
      if (matches.length > 0) {
        let res = `Here are **3 bone-enriching meals** tailored to your **${formatRegionName(reg)} ${formatDietName(diet)}** lifestyle:\n`;
        matches.forEach((m, i) => {
          res += `\n**${i + 1}. ${m.name}**\n• Calcium: **${m.calcium} mg** · Protein: **${m.protein} g**\n• Clinical Benefit: ${m.desc}\n`;
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

    // 9. PLATFORM FLOW & GATING
    if (text.includes('platform') || text.includes('how to use') || text.includes('unlock') || text.includes('pillar')) {
      return `🌟 **How BONE SIP Works:**\n\n1. **Build:** Daily 3-2-1 Diet + 4 Bone Loading Movements with calendar tracking.\n2. **Protect:** 5-Room Home Hazard Audit and fall-risk elimination.\n3. **Strengthen:** Doctor consultation checklist and DXA interpretation guide.\n\n*Complete the Build assessment & verify your mobile to unlock Protect, then complete Protect to unlock Strengthen!*`;
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
      const meta = SLOT_META[item.id] || { name: 'Meal', time: '' };
      const isChecked = activeSet.has(item.id);
      const hidden = state.activeSlotFilter && state.activeSlotFilter !== 'all' && state.activeSlotFilter !== item.id;
      const justDone = isChecked && state.lastToggledMilestone === item.id;
      const action = isPast ? 'BoneApp.showPastDayNotice()' : `BoneApp.toggleDietMilestone('${currentDateKey}', '${item.id}')`;
      const items = item.meal.items || splitMealComponents(item.meal);
      return `
        <div class="meal-card fade-up ${isChecked ? 'completed' : ''} ${justDone ? 'just-done' : ''}" data-slot-id="${item.id}" id="mealSlotCard_${item.id}" style="--i: ${i}; ${hidden ? 'display: none;' : ''}">
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
                <button class="mini-nav" onclick="BoneApp.cycleSlotMeal('${item.id}', -1)" aria-label="Previous ${meta.name} idea"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="mini-nav" onclick="BoneApp.cycleSlotMeal('${item.id}', 1)" aria-label="Next ${meta.name} idea"><i class="fa-solid fa-chevron-right"></i></button>
              </div>` : ''}
            <button class="meal-check ${isPast ? 'locked' : ''}" onclick="${action}" aria-pressed="${isChecked}" aria-label="${isChecked ? 'Undo' : 'Mark done'}: ${meta.name}">
              <i class="fa-solid ${isPast && !isChecked ? 'fa-lock' : 'fa-check'}"></i>
            </button>
          </div>
          <div class="meal-items">
            ${items.map((c, idx) => {
              const b = itemBenefit(c.name);
              return `
                <div class="meal-item ${c.swapped ? 'swapped' : ''}">
                  <div class="mi-text">
                    <b>${escapeHtml(c.name)}</b>
                    <span>${c.portion ? `${escapeHtml(c.portion)} · ` : ''}${b.text} <em class="mi-tag"><i class="fa-solid ${b.icon}"></i> ${b.tag}</em></span>
                  </div>
                  ${!isPast ? `<button class="mi-opt" onclick="BoneApp.openItemOptions('${item.id}', ${idx})">View options <i class="fa-solid fa-chevron-right"></i></button>` : ''}
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

    let candidates = catalog.filter(m => m.slot === slotType && m.region === userReg && (userDiet === 'all' || m.diet === userDiet));
    if (candidates.length === 0) {
      candidates = catalog.filter(m => m.slot === slotType && (userDiet === 'all' || m.diet === userDiet));
    }
    if (candidates.length === 0) {
      candidates = catalog.filter(m => m.slot === slotType);
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
    clearItemSwaps(dateKey, slotId);

    BoneDB.save();
    renderBuildDietView();
    showToast(`🍽️ Cycled to: ${nextMeal.name.slice(0, 36)}...`, 'fa-arrows-rotate');
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
    setCharactersPaused(document.getElementById('buildSubViewExercise'), true);
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
    return 4;
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
    const week = getWeekDays(0).map(d => ({ label: d.dayShort.slice(0, 1), iso: d.isoDate, done: isExerciseDayComplete(d.isoDate), today: d.isToday }));
    return {
      doneDays: Math.min(28, doneDays),
      day: Math.min(28, doneDays + (todayDone ? 0 : 1)),
      weekDone: week.filter(d => d.done).length,
      week
    };
  }

  function hasCharacter(ex) {
    return !!(ex && window.BoneCharacter && window.BoneCharacter.has(ex.id));
  }

  function charAnimHtml(ex) {
    return `<div class="char-anim" data-anim="${ex.id}"></div>`;
  }

  function mountCharacters(root, opts = {}) {
    if (window.BoneCharacter && root) window.BoneCharacter.mountAll(root, Object.assign({ gender: state.selectedCoach }, opts));
  }

  function setCharactersPaused(root, paused) {
    if (window.BoneCharacter && root) window.BoneCharacter.setPaused(root, paused);
  }

  function exThumbHtml(ex, size = 'sm') {
    const poster = exPosterSrc(ex);
    if (!poster && hasCharacter(ex)) {
      return `<div class="wk-thumb ${size} anim">${charAnimHtml(ex)}</div>`;
    }
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
          <div class="wk-day">Day <b>${stats.day}</b> of 28</div>
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
                <small>${count} moves</small>
              </button>`;
          }).join('')}
        </div>

        <div class="wk-list-head">
          <div>
            <h3>${group.label}</h3>
            <span>${group.blurb} · ${list.length} moves · ~${minutesFor(list)} min</span>
          </div>
          <button class="wk-start-all" onclick="BoneApp.startWorkout('${group.id}')"><i class="fa-solid fa-play"></i> Start all</button>
        </div>
        <div class="wk-list">
          ${list.map((ex, i) => {
            const done = todaySet.has(ex.id);
            return `
              <button class="wk-row fade-up ${done ? 'done' : ''}" style="--i: ${i};" onclick="BoneApp.openExerciseDetail('${ex.id}')">
                ${exThumbHtml(ex)}
                <div class="wk-row-body">
                  <b>${ex.name}</b>
                  <span>${fmtClock(getExDuration(ex))} · ${ex.reps}</span>
                  <small class="wk-level ${ex.level === 'Easy' ? 'easy' : 'mod'}">${ex.level}${ex.video || hasCharacter(ex) ? '' : ' · <i class="fa-solid fa-list-ol"></i> Steps'}</small>
                </div>
                ${done ? '<span class="wk-row-done"><i class="fa-solid fa-check"></i></span>' : '<i class="fa-solid fa-chevron-right wk-row-go"></i>'}
              </button>`;
          }).join('')}
        </div>`;
      setupLazyVideos(root);
      mountCharacters(root);
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
          ? `<video src="${video}" poster="${exPosterSrc(ex)}" autoplay loop muted playsinline aria-label="${escapeHtml(ex.name)} demonstration"></video>`
          : hasCharacter(ex)
            ? `<div class="exd-anim">${charAnimHtml(ex)}</div>`
            : `<div class="exd-illus">${img3d(ex.img || 'running', 'float', 110)}<span><i class="fa-solid fa-list-ol"></i> Follow the steps below</span></div>`}
        <button class="exd-close" onclick="BoneApp.closeExerciseDetail()" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="exd-body">
        <span class="step-chip build">${group.label}${done ? ' · <i class="fa-solid fa-check"></i> Done today' : ''}</span>
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
      </div>`;
    mountCharacters(body);
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
      setCharactersPaused(root, false);
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
  }

  function speak(text) {
    const vol = getVolume();
    if (vol <= 0 || !voiceOn() || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.volume = vol;
      u.lang = 'en-IN';
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
    btn.style.display = 'speechSynthesis' in window ? '' : 'none';
    const iconClass = isMuted ? 'fa-volume-xmark' : (vol < 0.5 ? 'fa-volume-low' : 'fa-volume-high');
    btn.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    btn.setAttribute('aria-label', `Volume: ${Math.round(vol * 100)}%`);
    const slider = document.getElementById('plVolSlider');
    if (slider) slider.value = vol;
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
      speak('Get ready.');
    } else if (phase === 'work') {
      player.total = player.remaining = getExDuration(ex);
      speak('Begin.');
    } else if (phase === 'rest') {
      player.total = player.remaining = REST_SEC;
      speak('Rest.');
    } else if (phase === 'done') {
      releaseWakeLock();
      celebrate('big');
      playSound('success');
      speak('Workout complete. Well done!');
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
    setCharactersPaused(document.getElementById('plMedia'), player.paused || player.phase !== 'work');
    if (player.paused && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    renderPlayerControls();
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
    if (active && !force && !window.confirm('End this workout? Moves you finished are saved.')) return;
    clearInterval(player.timer);
    player.phase = 'idle';
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
    } else if (hasCharacter(ex)) {
      let host = media.querySelector(`[data-anim="${ex.id}"]`);
      if (!host) {
        media.innerHTML = `<div class="pl-anim">${charAnimHtml(ex)}</div>`;
        host = media.querySelector('[data-anim]');
        mountCharacters(media, { paused: !autoplay });
        if (window.BoneCharacter) window.BoneCharacter.restart(host);
      }
      setCharactersPaused(media, !autoplay);
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
      set('plNext', next ? `Next: ${next.name}` : 'Last move. You’re nearly done!');
    }

    if (player.phase === 'rest' && next) {
      const v = document.getElementById('plVideo');
      if (v) v.pause();
      setCharactersPaused(document.getElementById('plMedia'), true);
      const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      set('plRestNextLabel', `Next ${player.index + 2}/${total}`);
      set('plRestNextName', next.name);
      set('plRestNextTime', fmtClock(getExDuration(next)));
      const prev = document.getElementById('plRestPreview');
      if (prev) {
        const poster = exPosterSrc(next);
        prev.innerHTML = poster ? `<img src="${poster}" alt="">` : (hasCharacter(next) ? `<div class="pl-anim">${charAnimHtml(next)}</div>` : img3d(next.img || 'running', 'float', 110));
        mountCharacters(prev);
      }
    }

    if (player.phase === 'done') {
      const v = document.getElementById('plVideo');
      if (v) v.pause();
      setCharactersPaused(document.getElementById('plMedia'), true);
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
  // MODULE 4: PROTECT HUB VIEW
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // MODULE 5: STRENGTHEN HUB VIEW
  // --------------------------------------------------------------------------
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

  function toggleHubDoctor(docId) {
    playSound('check');
    if (state.strengthenDoctorChecked.has(docId)) state.strengthenDoctorChecked.delete(docId);
    else state.strengthenDoctorChecked.add(docId);
    BoneDB.save();
    renderStrengthenHubView();
  }

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

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  function registerServiceWorker() {
    const cfg = window.BONE_SIP_CONFIG || {};
    if (!cfg.enableServiceWorker || !('serviceWorker' in navigator) || location.protocol === 'file:') return;
    // Skip on local dev servers so edits show up immediately; add ?sw=1 to test offline mode locally.
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (isLocal && !/[?&]sw=1\b/.test(location.search)) return;
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
    syncCoachToggle();
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

    registerServiceWorker();
  }

  // Public API exposure for DOM Event Handlers
  window.BoneApp = {
    startOnboardingTour,
    skipOnboarding,
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
    toggleExerciseMilestone,
    showPastDayNotice,
    switchGlobalCoach,

    openWorkoutTimerModal,
    selectExerciseGroup,
    openExerciseDetail,
    closeExerciseDetail,
    startDetailExercise,
    adjustExerciseDuration,
    startWorkout,
    playerTogglePause,
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
    toggleHubDoctor,
    shareDoctorReviewWhatsApp,

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

    // AI Chatbot
    toggleChatDrawer,
    closeChatDrawer,
    clearChatHistory,
    sendChatMessage
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
