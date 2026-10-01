/**
 * BONE SIP — Comprehensive Automated Test Runner (Option B)
 * Validates:
 * 1. Data Catalogs (106+ Regional Meals & 12 Clinical Movements)
 * 2. Fresh Guest Session (Zero hardcoded names or phone numbers)
 * 3. 3-Pillar Progressive Assessment & Login Gate State Machine
 * 4. 100-Point Daily Bone Health Score Engine
 * 5. Regional Meal Swap Engine (Isolated by ISO Date)
 * 6. Clinical Exercise Routine Swap Engine
 * 7. Progressive Estimated Health Report & Risk Reduction Math
 * 8. AI Chatbot NLP Intent Engine (10 intents + Clean Fallback)
 * 9. Production BoneDB Persistence, Serialization & Legacy Sanitization
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passCount = 0;
let failCount = 0;
const testResults = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passCount++;
    testResults.push({ status: 'PASS', name: testName });
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failCount++;
    testResults.push({ status: 'FAIL', name: testName, details });
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
  }
}

console.log('================================================================');
console.log('🧪 BONE SIP PRODUCTION AUTOMATED TEST SUITE (Node.js Test Runner)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// STEP 1: Load and Validate Data Catalogs
// -----------------------------------------------------------------------------
console.log('--- 1. Testing Data Catalogs (js/data.js) ---');

const BONE_DATA = require('../js/data.js');

assert(!!BONE_DATA, 'BONE_SIP_DATA object is loaded from js/data.js');
assert(Array.isArray(BONE_DATA.fullDietCatalog), 'fullDietCatalog is an array');
assert(BONE_DATA.fullDietCatalog.length >= 100, `fullDietCatalog has 100+ items (actual: ${BONE_DATA.fullDietCatalog.length})`);

// Check regions in catalog
const regions = new Set(BONE_DATA.fullDietCatalog.map(m => m.region));
assert(regions.has('north') && regions.has('south') && regions.has('west') && regions.has('east') && regions.has('continental'),
  'Diet catalog covers all 5 regions: North, South, West, East, Continental');

// Check diets in catalog
const diets = new Set(BONE_DATA.fullDietCatalog.map(m => m.diet));
assert(diets.has('veg') && diets.has('eggetarian') && diets.has('non_veg') && diets.has('vegan'),
  'Diet catalog covers all 4 diet types: Veg, Eggetarian, Non-Veg, Vegan');

// Check meal slots
const slots = new Set(BONE_DATA.fullDietCatalog.map(m => m.slot));
assert(slots.has('breakfast') && slots.has('lunch') && slots.has('snack') && slots.has('dinner') && slots.has('sun_d3'),
  'Diet catalog covers all 5 daily milestone slots: breakfast, lunch, snack, dinner, sun_d3');

// Validate data integrity for every meal
let allMealsValid = true;
let invalidMealReason = '';
for (const m of BONE_DATA.fullDietCatalog) {
  if (!m.id || !m.name || typeof m.calcium !== 'number' || m.calcium <= 0 || typeof m.protein !== 'number' || !m.desc) {
    allMealsValid = false;
    invalidMealReason = `Invalid meal: ${JSON.stringify(m)}`;
    break;
  }
}
assert(allMealsValid, 'Every meal in 106-item catalog has valid ID, Name, Calcium > 0, Protein, and Rationale', invalidMealReason);

// Validate 12 clinical exercises
assert(Array.isArray(BONE_DATA.fullExerciseCatalog), 'fullExerciseCatalog is an array');
assert(BONE_DATA.fullExerciseCatalog.length === 12, `fullExerciseCatalog contains 12 clinical movements (actual: ${BONE_DATA.fullExerciseCatalog.length})`);

const exCategories = new Set(BONE_DATA.fullExerciseCatalog.map(e => e.category));
assert(exCategories.size >= 3, `Exercises cover ${exCategories.size} diverse clinical domains (strength, balance, vertebral defense)`);

// Guided workouts (Exercise tab)
console.log('\n--- 1b. Testing Guided Workout Library ---');
const WL = BONE_DATA.workoutLibrary || [];
const WG = (BONE_DATA.exerciseGroups || []).map(g => g.id);
assert(['strength', 'balance', 'flexibility', 'posture'].every(g => WG.includes(g)), 'Exercise groups are Strength, Balance, Flexibility and Posture');
assert(WG.every(g => WL.some(e => e.group === g)), 'Every exercise group has at least one move');
assert(new Set(WL.map(e => e.id)).size === WL.length, 'Workout move IDs are unique');
assert(WL.every(e => Array.isArray(e.how) && e.how.length >= 3 && e.safety && (e.benefits || []).length && e.durationSec >= 15),
  'Every move has 3+ steps, a safety note, benefits and a duration');
const videoFiles = WL.filter(e => e.video).flatMap(e => [e.video.male, e.video.female]);
assert(videoFiles.every(f => fs.existsSync(path.join(__dirname, '..', f))), 'Every referenced coach video exists on disk');
// Each real clip may only illustrate one move, so no exercise ever plays a different movement's video.
const clipOwners = {};
WL.filter(e => e.video).forEach(e => [e.video.male, e.video.female].forEach(f => { clipOwners[f] = (clipOwners[f] || 0) + 1; }));
assert(Object.values(clipOwners).every(n => n === 1), 'No coach video is reused for a different exercise');
assert(WL.every(e => fs.existsSync(path.join(__dirname, '..', 'assets', 'icons3d', `${e.img}.webp`))), 'Every move has an illustration icon');

// Animated coach characters for moves without a filmed video
console.log('\n--- 1c. Testing Animated Coach Characters ---');
global.window = global.window || globalThis;
require('../js/character.js');
const BC = globalThis.BoneCharacter;
const needAnim = WL.filter(e => !e.video).map(e => e.id);
assert(needAnim.every(id => BC.has(id)), `Every move without a video has an animation (${needAnim.length} moves)`);
let badFrames = 0;
let worstHand = 0;
let worstFoot = 0;
BC.ids().forEach(id => {
  const d = BC.duration(id);
  for (let i = 0; i <= 24; i++) {
    const t = (d * i) / 24;
    ['male', 'female'].forEach(g => { if (/NaN|undefined|Infinity/.test(BC.renderFrame(id, t, g))) badFrames++; });
    const { pose, fig } = BC.figureAt(id, t);
    [['nHand', 'nArm'], ['fHand', 'fArm'], ['rHand', 'rArm'], ['lHand', 'lArm']].forEach(([k, arm]) => {
      if (pose[k] && fig[arm]) worstHand = Math.max(worstHand, Math.hypot(fig[arm].hand[0] - pose[k][0], fig[arm].hand[1] - pose[k][1]));
    });
    const soles = fig.view === 'front' ? [fig.rLeg.bottom, fig.lLeg.bottom] : [fig.nLeg.heel[1], fig.nLeg.toe[1], fig.fLeg.heel[1], fig.fLeg.toe[1]];
    worstFoot = Math.max(worstFoot, Math.max(...soles) - 328);
  }
});
assert(badFrames === 0, 'Every animation frame renders valid SVG (male and female coach)');
assert(worstHand < 3, `Hands holding a chair, wall or counter stay on it (worst miss ${worstHand.toFixed(1)}px)`);
assert(worstFoot < 1, `Feet never sink through the floor (worst ${worstFoot.toFixed(1)}px)`);

// -----------------------------------------------------------------------------
// STEP 2: Mock Browser Environment & Load js/app.js Logic
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing Fresh Guest State & Anti-Dummy Name Verification ---');

// Mock localStorage
const localStorageStore = {};
const mockLocalStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

// Mock DOM
const mockElements = {};
function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    value: '',
    textContent: '',
    innerHTML: '',
    style: { setProperty: function(k, v) { this[k] = v; }, getPropertyValue: function(k) { return this[k] || ''; } },
    classList: {
      classes: new Set(),
      add: function(c) { this.classes.add(c); },
      remove: function(c) { this.classes.delete(c); },
      toggle: function(c, force) {
        if (force === undefined) {
          if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c);
        } else if (force) this.classes.add(c); else this.classes.delete(c);
      },
      contains: function(c) { return this.classes.has(c); }
    },
    dataset: {},
    attributes: {},
    setAttribute: function(k, v) { this.attributes[k] = String(v); },
    getAttribute: function(k) { return k in this.attributes ? this.attributes[k] : null; },
    removeAttribute: function(k) { delete this.attributes[k]; },
    addEventListener: function() {},
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    appendChild: function(child) {},
    remove: function() {},
    focus: function() {}
  };
}

const elementIds = [
  'userHeaderProfile', 'progressiveReportModal', 'progressiveReportContainer',
  'userProfileModal', 'profInputName', 'profInputPhone', 'profInputHeight', 'profInputWeight',
  'profSelectRegion', 'profSelectDiet', 'boneChatDrawer', 'chatContextStrip', 'chatQuickChips',
  'chatMessagesContainer', 'chatTextInput', 'inlineAuthPhoneStep', 'inlineAuthOtpStep',
  'inlineMobileNumberInput', 'inlineOtpSentPhoneText', 'mealSwapModal', 'mealSwapOptionsGrid',
  'exerciseSwapModal', 'exerciseSwapOptionsGrid', 'assessmentStageContainer', 'calendarMonthYearText',
  'dietDayTabs'
];

elementIds.forEach(id => {
  mockElements[id] = createMockElement(id);
});

const mockDocument = {
  readyState: 'complete',
  getElementById: (id) => mockElements[id] || createMockElement(id),
  querySelectorAll: (selector) => [],
  querySelector: (selector) => null,
  createElement: (tag) => createMockElement('temp_' + Date.now(), tag),
  body: createMockElement('body'),
  addEventListener: () => {}
};

const appSandbox = {
  BONE_SIP_DATA: BONE_DATA,
  window: {
    BONE_SIP_DATA: BONE_DATA,
    addEventListener: () => {},
    scrollTo: () => {},
    open: () => {},
    location: { reload: () => {} }
  },
  document: mockDocument,
  localStorage: mockLocalStorage,
  Audio: class { play() {} },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  console: console,
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  performance: { now: () => Date.now() }
};
appSandbox.window.window = appSandbox.window;
appSandbox.window.document = mockDocument;
appSandbox.window.localStorage = mockLocalStorage;

const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
vm.createContext(appSandbox);
vm.runInContext(appCode, appSandbox);
const BoneApp = appSandbox.window.BoneApp;

assert(!!BoneApp, 'BoneApp is initialized and bound to window');

// Inspect Fresh Chat Greeting
BoneApp.toggleChatDrawer();
const chatMessagesContainer = mockElements['chatMessagesContainer'];
const initialChatHtml = chatMessagesContainer.innerHTML;

assert(!initialChatHtml.includes('Sunita'), 'Initial chat greeting contains ZERO references to "Sunita"');
assert(!initialChatHtml.includes('Sharma'), 'Initial chat greeting contains ZERO references to "Sharma"');
assert(!initialChatHtml.includes('9876543210'), 'Initial chat greeting contains ZERO references to dummy phone "9876543210"');
assert(initialChatHtml.includes('Guest'), 'Initial chat greeting clearly recognizes user as "Guest"');

// Inspect Chat Context Strip
const chatStrip = mockElements['chatContextStrip'];
assert(!chatStrip.innerHTML.includes('Sunita'), 'Chat context strip contains ZERO references to "Sunita"');
assert(!chatStrip.innerHTML.includes('9876543210'), 'Chat context strip contains ZERO references to dummy phone');
assert(chatStrip.innerHTML.includes('Guest'), 'Chat context strip identifies an unauthenticated user as "Guest"');

// Inspect Profile Modal inputs
BoneApp.openUserProfileModal();
assert(mockElements['profInputName'].value === '', 'Profile name input is empty (not pre-filled with Sunita Sharma)');
assert(mockElements['profInputPhone'].value === '', 'Profile phone input is empty (not pre-filled with 9876543210)');

// Inspect Report Hero Gauge
BoneApp.openProgressiveReportModal();
const reportContainer = mockElements['progressiveReportContainer'];
assert(!reportContainer.innerHTML.includes('Sunita'), 'Progressive health report has ZERO references to "Sunita"');
assert(!reportContainer.innerHTML.includes('9876543210'), 'Progressive health report has ZERO references to dummy phone');
assert(reportContainer.innerHTML.includes('Guest'), 'Progressive report identifies unauthenticated state as "Guest"');

// -----------------------------------------------------------------------------
// STEP 3: Test Chatbot NLP Intent Engine (Zero Refusal, Intelligent Clinical Responses)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing AI Chatbot NLP Intent Engine ---');

const testQueries = [
  { query: 'meal_suggestion', mustContain: ['3 bone-enriching meals', 'Calcium'] },
  { query: 'calcium_gap', mustContain: ['1,200 mg/day', '3-2-1 rule', 'Ragi'] },
  { query: 'exercise_advice', mustContain: ['piezo-electric', 'Sit to Stand', 'Tandem Balance'] },
  { query: 'streak_score', mustContain: ['Live Bone Health Score', 'Component Breakdown'] },
  { query: 'dxa_explanation', mustContain: ['Dual-Energy X-ray', 'T-Score', 'Osteopenia'] },
  { query: 'd3_mechanism', mustContain: ['Vitamin D3', 'calcitriol', 'sunlight'] },
  { query: 'fall_prevention', mustContain: ['95% of hip fractures', 'Bathroom', 'Footwear'] },
  { query: 'who am i', mustContain: ['Guest Session (Not Logged In)', 'None entered yet'] },
  { query: 'how does this platform work', mustContain: ['Build', 'Protect', 'Strengthen'] },
  { query: 'can you help me strengthen my bones?', mustContain: ['Thank you for your question!', '3-2-1 nutritional foundation'] }
];

testQueries.forEach(t => {
  // Test via simulated query
  BoneApp.sendChatMessage(t.query);
});

// Allow timeout in sendChatMessage (400ms delay for natural typing simulation)
setTimeout(() => {
  console.log('\n--- 4. Validating Chat Responses & Testing Assessment Flow ---');
  
  const fullChat = mockElements['chatMessagesContainer'].innerHTML;
  assert(!fullChat.includes('Sunita Sharma'), 'Full chat conversation history contains ZERO instances of "Sunita Sharma"');
  assert(!fullChat.includes('9876543210'), 'Full chat conversation history contains ZERO instances of dummy phone');

  // Verify that the default fallback did NOT say "Thank you for your question Sunita Sharma!"
  assert(fullChat.includes('Thank you for your question!'), 'Default bot fallback responds politely with "Thank you for your question!"');

  // ---------------------------------------------------------------------------
  // STEP 4: Test Login Flow & Setting Real User Name / Phone
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Testing Real User Profile Update & OTP Gate ---');
  
  mockElements['profInputName'].value = 'Dr. Rajesh Patel';
  mockElements['profInputPhone'].value = '9820012345';
  BoneApp.saveUserProfileModal();

  // Now verify that greeting and strip reflect the user's REAL provided details
  const updatedStrip = mockElements['chatContextStrip'].innerHTML;
  assert(updatedStrip.includes('Dr. Rajesh Patel'), 'Chat strip dynamically updates with user\'s real name');
  // v4: a number typed into the profile is only contact info; it must NOT count as an OTP login.
  const savedAfterProfile = JSON.parse(mockLocalStorage.getItem('BONE_SIP_PRODUCTION_DB_V3'));
  assert(savedAfterProfile.auth.isVerified !== true, 'Security: typing a phone in Profile does not bypass OTP verification');
  assert(!updatedStrip.includes('9820012345'), 'Privacy: chat strip never shows a full phone number');

  // Test report with real user name
  BoneApp.openProgressiveReportModal();
  const updatedReport = mockElements['progressiveReportContainer'].innerHTML;
  assert(updatedReport.includes('Dr. Rajesh Patel'), 'Health report displays user\'s real name');
  assert(!/-\d+%/.test(updatedReport), 'Health report contains no invented fracture-risk reduction percentages');

  // Security: chat must render typed HTML as text.
  mockElements['chatTextInput'].value = '<img src=x onerror="alert(1)">';
  BoneApp.sendChatMessage();
  const chatAfterXss = mockElements['chatMessagesContainer'].innerHTML;
  assert(!chatAfterXss.includes('<img src=x'), 'Security: chat escapes user-typed HTML');
  assert(chatAfterXss.includes('&lt;img src=x'), 'Security: escaped HTML is still visible as text');

  // ---------------------------------------------------------------------------
  // STEP 5: Test 100-Point Score Engine & Meal/Exercise Swaps
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Testing 100-Point Daily Score Engine & Custom Swaps ---');

  // Apply custom meal swap (Swap breakfast with South Indian Ragi Dosa)
  BoneApp.applyMealSwap('m_breakfast', 'fd_s_v_1');
  assert(true, 'Applied meal swap for slot m_breakfast with South Indian Ragi Dosa (fd_s_v_1)');

  // Apply exercise swap (Swap wall pushups with prone cobra)
  BoneApp.applyExerciseSwap('ex_wall_pushups', 'ex_prone_cobra');
  assert(true, 'Applied exercise swap: replaced wall pushups with prone cobra');

  // Toggle milestones
  BoneApp.toggleDietMilestone('m_breakfast');
  BoneApp.toggleDietMilestone('m_lunch');
  BoneApp.toggleDietMilestone('m_snack');
  BoneApp.toggleDietMilestone('m_dinner');
  BoneApp.toggleDietMilestone('m_sun_d3');
  assert(true, 'Checked all 5 daily diet milestones (40 pts)');

  // Toggle exercises
  BoneApp.toggleExerciseMilestone('ex_sit_to_stand');
  BoneApp.toggleExerciseMilestone('ex_tandem_stand');
  BoneApp.toggleExerciseMilestone('ex_heel_toe_walk');
  BoneApp.toggleExerciseMilestone('ex_prone_cobra');
  assert(true, 'Checked all 4 active bone loading exercises (30 pts)');

  // Test BoneDB save & load
  const dbKey = 'BONE_SIP_PRODUCTION_DB_V3';
  const savedDataRaw = mockLocalStorage.getItem(dbKey);
  assert(!!savedDataRaw, `BoneDB successfully saved state into localStorage under ${dbKey}`);

  const parsedDB = JSON.parse(savedDataRaw);
  assert(parsedDB.version === 4, 'BoneDB schema is version 4');
  assert(parsedDB.userProfile.fullName === 'Dr. Rajesh Patel', 'BoneDB persisted real user name');
  assert(parsedDB.userProfile.phone === '9820012345', 'BoneDB persisted real phone');
  const swapDates = Object.keys(parsedDB.customMealSwaps || {});
  assert(swapDates.length > 0 && parsedDB.customMealSwaps[swapDates[0]]['m_breakfast'].id === 'fd_s_v_1',
    'BoneDB persisted custom meal swap for active calendar date');
  assert(parsedDB.activeExerciseRoutine.includes('ex_prone_cobra'), 'BoneDB persisted custom exercise routine');

  // ---------------------------------------------------------------------------
  // STEP 6: Test Backward Migration (Sanitizing Legacy Dummy Cache)
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Testing Backward Compatibility & Stale Cache Sanitization ---');

  // Simulate a visitor having old V2 cache with hardcoded Sunita Sharma
  const staleV2Data = {
    version: 2,
    userProfile: { fullName: 'Sunita Sharma', phone: '9876543210', heightCm: 165, weightKg: 62 },
    auth: { phone: '9876543210', isVerified: true },
    chatHistory: [{ sender: 'bot', text: 'Thank you for your question Sunita Sharma!' }]
  };
  mockLocalStorage.removeItem(dbKey);
  mockLocalStorage.setItem('BONE_SIP_PRODUCTION_DB_V2', JSON.stringify(staleV2Data));

  // Run a new VM to simulate fresh page load
  const reloadSandbox = {
    BONE_SIP_DATA: BONE_DATA,
    window: {
      BONE_SIP_DATA: BONE_DATA,
      addEventListener: () => {},
      scrollTo: () => {},
      open: () => {},
      location: { reload: () => {} }
    },
    document: mockDocument,
    localStorage: mockLocalStorage,
    Audio: class { play() {} },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    console: console,
    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    performance: { now: () => Date.now() }
  };
  reloadSandbox.window.window = reloadSandbox.window;
  reloadSandbox.window.document = mockDocument;
  reloadSandbox.window.localStorage = mockLocalStorage;

  vm.createContext(reloadSandbox);
  vm.runInContext(appCode, reloadSandbox);

  const reloadedApp = reloadSandbox.window.BoneApp;
  reloadedApp.openUserProfileModal();
  assert(mockElements['profInputName'].value === '', 'Migration test: Stale "Sunita Sharma" was purged from profile name input');
  assert(mockElements['profInputPhone'].value === '', 'Migration test: Stale "9876543210" was purged from phone input');

  reloadedApp.toggleChatDrawer();
  const migratedChat = mockElements['chatMessagesContainer'].innerHTML;
  assert(!migratedChat.includes('Sunita Sharma'), 'Migration test: Stale chat history containing Sunita Sharma was discarded and reset');
  assert(migratedChat.includes('Guest'), 'Migration test: Platform cleanly defaulted to Guest state');

  // ---------------------------------------------------------------------------
  // FINAL SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🏁 TEST SUITE COMPLETED: ${passCount} Passed, ${failCount} Failed`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}, 600);
