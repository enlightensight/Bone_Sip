//@@ replace renderBuildExerciseView
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

  function exThumbHtml(ex, size = 'sm') {
    const poster = exPosterSrc(ex);
    if (poster) {
      return `<div class="wk-thumb ${size}"><img src="${poster}" alt="" loading="lazy" decoding="async"><span class="wk-play"><i class="fa-solid fa-play"></i></span></div>`;
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
                  <small class="wk-level ${ex.level === 'Easy' ? 'easy' : 'mod'}">${ex.level}${ex.video ? '' : ' · <i class="fa-solid fa-list-ol"></i> Steps'}</small>
                </div>
                ${done ? '<span class="wk-row-done"><i class="fa-solid fa-check"></i></span>' : '<i class="fa-solid fa-chevron-right wk-row-go"></i>'}
              </button>`;
          }).join('')}
        </div>`;
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
  }

  function closeExerciseDetail(silent) {
    if (!silent) playSound('tap');
    const sheet = document.getElementById('exDetailSheet');
    if (sheet) {
      const v = sheet.querySelector('video');
      if (v) v.pause();
      sheet.style.display = 'none';
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

  function speak(text) {
    if (!voiceOn() || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.lang = 'en-IN';
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is optional */ }
  }

  function toggleVoice() {
    const next = !voiceOn();
    try { localStorage.setItem('bonesip_voice', next ? 'on' : 'off'); } catch (e) { /* ignore */ }
    if (!next && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    updateVoiceButton();
    showToast(next ? 'Voice guide on' : 'Voice guide off', next ? 'fa-volume-high' : 'fa-volume-xmark');
  }

  function updateVoiceButton() {
    const btn = document.getElementById('plVoiceBtn');
    if (!btn) return;
    btn.style.display = 'speechSynthesis' in window ? '' : 'none';
    btn.innerHTML = `<i class="fa-solid ${voiceOn() ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>`;
    btn.setAttribute('aria-label', voiceOn() ? 'Turn voice guide off' : 'Turn voice guide on');
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
      speak(`Get ready. ${ex.name}.`);
    } else if (phase === 'work') {
      player.total = player.remaining = getExDuration(ex);
      speak(`Begin. ${ex.name}.`);
    } else if (phase === 'rest') {
      player.total = player.remaining = REST_SEC;
      const next = findWorkout(player.queue[player.index + 1]);
      speak(`Rest. Next: ${next ? next.name : ''}.`);
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
      set('plNext', next ? `Next: ${next.name}` : 'Last move. You’re nearly done!');
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

  // Legacy entry point: older buttons now open the new exercise detail sheet.
  function openWorkoutTimerModal(exId) {
    if (findWorkout(exId)) openExerciseDetail(exId);
  }
