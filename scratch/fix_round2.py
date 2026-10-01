"""Round-2 UI fixes: selected-count chip, height/weight entry flow, avatar-only header."""
import pathlib

# ---------------------------------------------------------------- app.js
p = pathlib.Path('js/app.js')
s = p.read_bytes().decode('utf-8').replace('\r\n', '\n')


def rep(old, new):
    global s
    if s.count(old) != 1:
        raise SystemExit(f'app.js: expected one match for {old[:80]!r}, found {s.count(old)}')
    s = s.replace(old, new)


# 1. Count chip sits above the button.
rep("""          <span class="wiz-count" id="assetSelectedCount">${state.selectedAssets.length} selected</span>""",
    """          <span class="wiz-count ${state.selectedAssets.length ? 'on' : ''}" id="assetSelectedCount"><i class="fa-solid fa-circle-check"></i> ${state.selectedAssets.length} selected</span>""")
rep("""    const countEl = document.getElementById('assetSelectedCount');
    if (countEl) countEl.textContent = `${state.selectedAssets.length} selected`;""",
    """    const countEl = document.getElementById('assetSelectedCount');
    if (countEl) {
      countEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${state.selectedAssets.length} selected`;
      countEl.classList.toggle('on', state.selectedAssets.length > 0);
    }""")

# 2. Height & weight: enter -> save -> summary with Edit.
rep("""        <div class="baseline-pill">
          <span class="bp-stat"><i class="fa-solid fa-ruler-vertical"></i> ${state.userProfile.heightCm} cm</span>
          <span class="bp-stat"><i class="fa-solid fa-weight-scale"></i> ${state.userProfile.weightKg} kg</span>
          <span class="spacer"></span>
          <button class="btn btn-sm btn-outline" onclick="BoneApp.openHeightWeightModal()"><i class="fa-solid fa-pen"></i> Edit</button>
        </div>""", """        ${baselineHtml()}""")
rep("""          <button class="cta-btn" onclick="BoneApp.setBuildAssessmentStep('regional_food')">Continue <i class="fa-solid fa-arrow-right"></i></button>""",
    """          <button class="cta-btn" onclick="BoneApp.continueFromDiet()">Continue <i class="fa-solid fa-arrow-right"></i></button>""")

rep("""  function saveHeightWeightModal() {""", """  // Height & weight start empty; once saved they collapse into a summary with an Edit button.
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

  function saveHeightWeightModal() {""")

# Saving the profile modal with valid numbers also counts as entering them.
rep("""    if (h >= 100 && h <= 230) state.userProfile.heightCm = h;
    if (w >= 25 && w <= 250) state.userProfile.weightKg = w;""",
    """    if (h >= 100 && h <= 230) state.userProfile.heightCm = h;
    if (w >= 25 && w <= 250) state.userProfile.weightKg = w;
    if (h >= 100 && h <= 230 && w >= 25 && w <= 250) state.userProfile.baselineSet = true;""")

# 3. Header shows only a profile icon.
rep("""    if (state.auth.isVerified && state.auth.phone) {
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
    }""", """    const verified = !!(state.auth.isVerified && state.auth.phone);
    userProf.innerHTML = `
      <button class="avatar-btn" id="loginHeaderBtn" aria-label="${verified ? 'Open profile (verified)' : 'Open profile'}" title="My profile">
        <i class="fa-solid fa-user"></i>
        ${verified ? '<span class="avatar-dot"><i class="fa-solid fa-check"></i></span>' : ''}
      </button>`;""")

rep("""    saveHeightWeightModal,
""", """    saveHeightWeightModal,
    saveBaseline,
    editBaseline,
    continueFromDiet,
""")
p.write_bytes(s.replace('\n', '\r\n').encode('utf-8'))
print('app.js ok')

# ---------------------------------------------------------------- index.html
h = pathlib.Path('index.html')
t = h.read_text(encoding='utf-8')
old = """          <button class="btn btn-sm btn-primary" id="loginHeaderBtn">
            <i class="fa-solid fa-user"></i> <span class="hide-mobile">Profile</span>
          </button>"""
if t.count(old) != 1:
    raise SystemExit('index.html header button not found')
t = t.replace(old, """          <button class="avatar-btn" id="loginHeaderBtn" aria-label="Open profile" title="My profile">
            <i class="fa-solid fa-user"></i>
          </button>""")
h.write_text(t, encoding='utf-8')
print('index.html ok')

# ---------------------------------------------------------------- brand.css
c = pathlib.Path('css/brand.css')
u = c.read_text(encoding='utf-8')
for old, new in [
    ("  display: flex; align-items: center; gap: 12px;\n  padding: 18px 4px 6px;",
     "  display: flex; flex-direction: column; align-items: stretch; gap: 8px;\n  padding: 18px 4px 6px;"),
    (".assessment-container-card { padding-bottom: 96px !important; }",
     ".assessment-container-card { padding-bottom: 130px !important; }"),
    (".wiz-footer .cta-btn { flex: 1; }", ".wiz-footer .cta-btn { width: 100%; }"),
    (".wiz-count { font-weight: 800; color: var(--text-muted); font-size: 0.86rem; white-space: nowrap; }",
     ".wiz-count { align-self: center; display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-full); background: #fff; border: 1px solid var(--border-subtle); font-weight: 800; color: var(--text-muted); font-size: 0.8rem; box-shadow: var(--shadow-sm); transition: all var(--transition-fast); }\n"
     ".wiz-count i { color: var(--border-medium); }\n"
     ".wiz-count.on { color: var(--build); border-color: #F8C8D5; background: var(--build-bg); }\n"
     ".wiz-count.on i { color: var(--build); }"),
    (".profile-chip {",
     ".avatar-btn { position: relative; width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--grad-brand); color: #fff; font-size: 1rem; cursor: pointer; display: grid; place-items: center; box-shadow: var(--shadow-brand); transition: transform var(--transition-fast); }\n"
     ".avatar-btn:hover { transform: translateY(-1px); }\n"
     ".avatar-dot { position: absolute; right: -2px; bottom: -2px; width: 17px; height: 17px; border-radius: 50%; background: var(--success); color: #fff; font-size: 0.55rem; display: grid; place-items: center; border: 2px solid #fff; }\n"
     ".profile-chip {"),
]:
    if u.count(old) != 1:
        raise SystemExit(f'brand.css: expected one match for {old[:60]!r}')
    u = u.replace(old, new)

u += """
/* Height & weight entry (Build step 1) */
.baseline-form { background: #fff; border: 1.5px solid var(--border-subtle); border-radius: 18px; padding: 12px 14px 14px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
.baseline-form.shake { animation: wiggle 0.4s ease; border-color: var(--build); }
.bf-title { font-weight: 800; font-size: 0.86rem; margin-bottom: 10px; }
.bf-row { display: flex; gap: 8px; align-items: stretch; }
.bf-field { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; border: 1.5px solid var(--border-medium); border-radius: 12px; padding: 0 10px; background: var(--bg-card-hover); transition: border-color var(--transition-fast); }
.bf-field:focus-within { border-color: var(--build); background: #fff; }
.bf-field i { color: var(--build); font-size: 0.9rem; }
.bf-field input { flex: 1; min-width: 0; width: 100%; border: none; outline: none; background: transparent; padding: 10px 0; font-size: 1rem; font-weight: 700; color: var(--text-primary); -moz-appearance: textfield; }
.bf-field input::-webkit-outer-spin-button, .bf-field input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.bf-field span { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
.bf-save { flex-shrink: 0; border-radius: 12px; padding: 0 14px; }
"""
c.write_text(u, encoding='utf-8')
print('brand.css ok')
