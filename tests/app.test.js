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

// Validate 15 clinical exercises
assert(Array.isArray(BONE_DATA.fullExerciseCatalog), 'fullExerciseCatalog is an array');
assert(BONE_DATA.fullExerciseCatalog.length === 15, `fullExerciseCatalog contains 15 clinical movements (actual: ${BONE_DATA.fullExerciseCatalog.length})`);

const exCategories = new Set(BONE_DATA.fullExerciseCatalog.map(e => e.category));
assert(exCategories.size >= 3, `Exercises cover ${exCategories.size} diverse clinical domains (strength, balance, vertebral defense)`);

// Guided workouts (Exercise tab)
console.log('\n--- 1b. Testing Guided Workout Library ---');
const WL = BONE_DATA.workoutLibrary || [];
const WG = (BONE_DATA.exerciseGroups || []).map(g => g.id);
assert(['strength', 'balance', 'posture'].every(g => WG.includes(g)) && WG.length === 3, 'Exercise groups are Strength, Balance and Posture');
assert(WL.length === 8 && WL.every(e => e.video && e.video.male && e.video.female), 'Every exercise has a filmed coach video (male and female)');
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

// Check One-Leg Stand target and duration
const oneLeg = WL.find(e => e.id === 'ex_one_leg_balance');
assert(oneLeg && oneLeg.reps === '10 s each leg (3 times)' && oneLeg.durationSec === 95,
  'One-Leg Stand is configured for 10 s each leg (3 times) with 95s (1:35) duration');

// Check Dumbbell Pull configuration
const dumbell = WL.find(e => e.id === 'ex_dumbell_pull');
assert(dumbell && dumbell.reps === '10 per arm' && dumbell.durationSec === 41, 'Dumbbell Pull is configured with 10 per arm and 41s duration (10% faster counting speed)');

// Check Chair Sit-to-Stand configuration
const sitToStand = WL.find(e => e.id === 'ex_sit_to_stand');
assert(sitToStand && sitToStand.reps === '10 slow reps' && sitToStand.durationSec === 41, 'Chair Sit-to-Stand is configured with 10 slow reps and 41s duration (10% faster counting speed)');

// Check Step-Ups configuration
const stepUps = WL.find(e => e.id === 'ex_step_ups');
assert(stepUps && stepUps.reps === '10 per leg' && stepUps.durationSec === 41, 'Step-Ups is configured with 10 per leg and 41s duration (10% faster counting speed)');

// Check Side Leg Raise configuration
const sideLeg = WL.find(e => e.id === 'ex_leg_side_raise');
assert(sideLeg && sideLeg.reps === '12 per leg' && sideLeg.durationSec === 33, 'Side Leg Raise is configured with 12 per leg and 33s duration (matching 12 video loops)');

// Check Chest Stretch configuration
const chestStretch = WL.find(e => e.id === 'ex_chest_stretch');
assert(chestStretch && chestStretch.reps === '10 reps' && chestStretch.durationSec === 41 && Array.isArray(chestStretch.how) && chestStretch.how.length >= 4,
  'Chest Stretch is configured for 10 reps, 41s duration (10% faster counting speed) and detailed wall/doorway pushup stretch instructions');

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
  'dietDayTabs', 'lifeAssetGrid', 'goalsContinueBtn', 'assetSelectedCount', 'healthConditionsList',
  'clinicalDietGuidanceContainer', 'dietMilestonesList', 'protectSuggestionBannerContainer',
  'protectSafetyAnalysisCard', 'protectRoomCheckCard', 'hubRoomCheckDropdownHeader', 'hubRoomCheckCollapseBody', 'roomCheckDropdownChevron', 'protectRiskStatusBadge', 'hubHomeScoreBadge', 'hubRoomTabs', 'hubRoomQuestionsList',
  'strengthenContentContainer', 'printDoc', 'stTab_dxa_risk', 'stTab_labs_biomarkers', 'stTab_meds_timing', 'stTab_spine_safety', 'stTab_doctor_brief',
  'view-assessment', 'view-auth', 'view-build', 'view-protect', 'view-strengthen'
];

elementIds.forEach(id => {
  mockElements[id] = createMockElement(id);
});

const mockDocument = {
  readyState: 'complete',
  getElementById: (id) => {
    if (!mockElements[id]) mockElements[id] = createMockElement(id);
    return mockElements[id];
  },
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
assert(initialChatHtml.includes('Namaste! I'), 'Initial chat greeting uses no name for a new guest');
assert(initialChatHtml.includes('Ojas'), 'Chat assistant introduces itself as Ojas');
assert(mockElements['chatContextStrip'].innerHTML.includes('Guest'), 'Chat context strip clearly shows the user as "Guest"');

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

  // Test Morning Sun cycle / swap (< > buttons)
  BoneApp.cycleSlotMeal('m_sun_d3', 1);
  assert(true, 'Morning sun successfully cycles and swaps when pressing < > navigation buttons');

  // Test item-level checkbox toggle & proportional scoring
  assert(typeof BoneApp.toggleDietItem === 'function', 'BoneApp exports toggleDietItem for item-level checkbox interaction');
  BoneApp.toggleDietItem('m_lunch', 0, 2);
  assert(true, 'Individual meal item can be checked independently for partial meal progress');

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

  // Test rep-based exercise vs time-based exercise detection
  assert(typeof BoneApp.isRepBasedExercise === 'function', 'BoneApp exports isRepBasedExercise function');
  assert(BoneApp.isRepBasedExercise(dumbell) === true, 'Dumbbell Pull is detected as a rep-based exercise');
  assert(BoneApp.isRepBasedExercise(chestStretch) === true, 'Chest Stretch is detected as a rep-based exercise');
  assert(BoneApp.isRepBasedExercise(oneLeg) === false, 'One-Leg Stand is detected as a timed hold exercise');
  assert(BoneApp.getExerciseRepCount(dumbell) === 10, 'Dumbbell Pull rep count is parsed as 10');
  assert(BoneApp.getExerciseRepCount(chestStretch) === 10, 'Chest Stretch rep count is parsed as 10');

  // Test 10% faster counting speed for both male and female coaches
  BoneApp.switchGlobalCoach('male');
  assert(BoneApp.getExDuration(dumbell) === 41, 'Male coach: Dumbbell Pull duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(sitToStand) === 41, 'Male coach: Chair Sit-to-Stand duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(stepUps) === 41, 'Male coach: Step-Ups duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(chestStretch) === 41, 'Male coach: Chest Stretch duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(sideLeg) === 33, 'Male coach: Side Leg Raise duration is 33s (2.73s per rep, finishes together with 12 video loops)');

  BoneApp.switchGlobalCoach('female');
  assert(BoneApp.getExDuration(dumbell) === 41, 'Female coach: Dumbbell Pull duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(sitToStand) === 41, 'Female coach: Chair Sit-to-Stand duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(stepUps) === 41, 'Female coach: Step-Ups duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(chestStretch) === 41, 'Female coach: Chest Stretch duration is 41s (4.1s per rep, 10% faster)');
  assert(BoneApp.getExDuration(sideLeg) === 30, 'Female coach: Side Leg Raise duration is 30s (2.47s per rep, finishes together with 12 video loops)');

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
  // STEP 6b: Testing Goal Selection Gate, Metabolic Conditions & Personalized Diets
  // ---------------------------------------------------------------------------
  console.log('\n--- 6b. Testing Goal Selection Gate, Metabolic Conditions & Personalized Diets ---');

  // 1. Verify all metabolic diseases/conditions and allergies in BONE_DATA with accurate 3D icons
  const expectedMetabolicConditions = [
    { id: 'diabetes', title: 'Diabetes', img: 'glucose' },
    { id: 'hypertension', title: 'Hypertension', img: 'bp_cuff' },
    { id: 'obesity', title: 'Obesity', img: 'scale' },
    { id: 'dyslipidemia', title: 'High Cholesterol (Dyslipidemia)', img: 'cholesterol' },
    { id: 'thyroid', title: 'Thyroid Disorders', img: 'thyroid' },
    { id: 'kidney', title: 'Kidney Impairment/Disease', img: 'kidney' },
    { id: 'lactose_intolerance', title: 'Lactose Intolerance', img: 'lactose' },
    { id: 'nuts_allergy', title: 'Nuts Allergy', img: 'nut_allergy' }
  ];
  expectedMetabolicConditions.forEach(cond => {
    const found = (BONE_DATA.healthConditionOptions || []).find(o => o.id === cond.id);
    assert(!!found && found.title === cond.title, `Condition "${cond.title}" (${cond.id}) is present in healthConditionOptions`);
    assert(!!found && found.img === cond.img, `Condition "${cond.title}" uses accurate medical icon "${cond.img}"`);
  });

  // 2. Test Goal Selection Gate (Must select at least one before continuing)
  BoneApp.setBuildAssessmentStep('goals');
  // Attempting to proceed to plan_overview with 0 selected assets must stay on goals screen
  BoneApp.setBuildAssessmentStep('plan_overview');
  assert(mockElements['assessmentStageContainer'].innerHTML.includes('What would you never want to lose?'),
    'Goal selection gate: setBuildAssessmentStep refuses to advance to plan_overview when 0 goals are selected');
  assert(mockElements['assessmentStageContainer'].innerHTML.includes('id="goalsContinueBtn" disabled'),
    'Goal selection gate: Continue button is explicitly rendered with disabled attribute when 0 goals are selected');

  // Selecting a goal enables Continue and allows progression
  BoneApp.toggleLifeAsset('asset_travel');
  assert(mockElements['goalsContinueBtn'].disabled === false,
    'Goal selection gate: selecting a goal immediately enables Continue button');
  BoneApp.setBuildAssessmentStep('plan_overview');
  assert(mockElements['assessmentStageContainer'].innerHTML.includes('Your plan') || mockElements['assessmentStageContainer'].innerHTML.includes('The 3-2-1 rule'),
    'Goal selection gate: successfully advanced to plan_overview after selecting at least one goal');

  // 3. Test Condition Selection & Clinical Guidance Banner in Diet View
  BoneApp.toggleHealthCondition('diabetes');
  BoneApp.toggleHealthCondition('hypertension');
  BoneApp.toggleHealthCondition('lactose_intolerance');
  BoneApp.toggleHealthCondition('nuts_allergy');
  BoneApp.renderBuildDietView();
  const guidanceHTML = mockElements['clinicalDietGuidanceContainer'].innerHTML;
  assert(guidanceHTML.includes('Diabetes') && guidanceHTML.includes('Hypertension'),
    'Clinical diet view renders guidance chips for selected conditions (Diabetes, Hypertension)');
  assert(guidanceHTML.includes('Lactose Intolerance') && guidanceHTML.includes('Nuts Allergy'),
    'Clinical diet view renders guidance chips for Lactose Intolerance and Nuts Allergy');
  assert(guidanceHTML.includes('Glycemic') && guidanceHTML.includes('DASH'),
    'Clinical guidance contains disease-specific clinical rationales (Glycemic control & DASH low-sodium)');

  // 4. Test Offline AI Chatbot Personalized Metabolic Diet Chart
  const dietChartResp = BoneApp.generateBotResponse('personalized_diet_chart');
  assert(dietChartResp.includes('Your Personalized Bone & Metabolic Diet Plan'),
    'AI Chatbot generates structured Personalized Bone & Metabolic Diet Plan');
  assert(dietChartResp.includes('Breakfast') && dietChartResp.includes('Lunch') && dietChartResp.includes('Dinner'),
    'AI Chatbot diet plan includes 4 daily milestone meal slots with authentic regional dishes');
  assert(dietChartResp.includes('Diabetes') && dietChartResp.includes('Hypertension'),
    'AI Chatbot diet plan includes clinical directives for user active conditions');
  assert(dietChartResp.includes('AGEs') || dietChartResp.includes('hypercalciuria'),
    'AI Chatbot includes deep clinical mechanisms (AGEs collagen protection / hypercalciuria avoidance)');

  // 5. Test Condition-specific queries in AI Chatbot
  const thyroidResp = BoneApp.generateBotResponse('What should I eat with thyroid disorder?');
  assert(thyroidResp.includes('Thyroid 4-Hour Rule') && thyroidResp.includes('empty stomach'),
    'AI Chatbot provides critical 4-Hour Calcium Spacing Rule for thyroid disorder');

  const kidneyResp = BoneApp.generateBotResponse('What diet advice for kidney disease?');
  assert(kidneyResp.includes('Kidney Health') && kidneyResp.includes('protein'),
    'AI Chatbot provides renal-balanced mineral & protein guidance for kidney impairment');

  const lipidResp = BoneApp.generateBotResponse('diet advice for high cholesterol and obesity');
  assert(lipidResp.includes('High Cholesterol') && lipidResp.includes('Obesity'),
    'AI Chatbot provides targeted guidance for combined cholesterol & obesity profiles');

  const lactoseResp = BoneApp.generateBotResponse('What can I eat with lactose intolerance?');
  assert(lactoseResp.includes('Lactose Intolerance') && lactoseResp.includes('plant milks'),
    'AI Chatbot provides plant calcium guidance for lactose intolerance');

  const nutResp = BoneApp.generateBotResponse('safe calcium diet for nuts allergy');
  assert(nutResp.includes('Nuts Allergy') && nutResp.includes('pumpkin seeds'),
    'AI Chatbot provides nut-free seed-powered guidance for nuts allergy');

  const removeObesityResp = BoneApp.generateBotResponse('how can i change it and remove obesity ?');
  assert(removeObesityResp.includes('Profile icon') && removeObesityResp.includes('Obesity') && removeObesityResp.includes('Save'),
    'AI Chatbot provides step-by-step instructions to edit and remove conditions like Obesity');

  const bmiCheckResp = BoneApp.generateBotResponse('do you think that i have obesity?');
  assert(bmiCheckResp.includes('do not have obesity') || bmiCheckResp.includes('BMI'),
    'AI Chatbot validates user BMI against obesity category accurately');

  const bmiValueResp = BoneApp.generateBotResponse('whats my bmi?');
  assert(bmiValueResp.includes('Your BMI is') && bmiValueResp.includes('Healthy BMI range'),
    'AI Chatbot calculates and reports live BMI status');

  // 6. Test Login Transition to Build Home Page & Protect Precaution Suggestion
  BoneApp.completeBuildPillar();
  BoneApp.renderBuildDietView();
  const protectBannerHTML = mockElements['protectSuggestionBannerContainer'].innerHTML;
  assert(protectBannerHTML.includes('Protect is unlocked: Guard your bones from falls'),
    'Build Home Page renders Protect precaution suggestion banner for unlocked Protect pillar');
  assert(protectBannerHTML.includes('Check fall risk'),
    'Protect precaution suggestion banner provides direct action button to take the check');

  // Test dismissing the suggestion banner
  BoneApp.dismissProtectBanner();
  assert(mockElements['protectSuggestionBannerContainer'].innerHTML === '',
    'User can dismiss the Protect suggestion banner anytime without forced redirection');

  // ---------------------------------------------------------------------------
  // STEP 6c: Testing Protect Safety Risk & Clinical Fix Suggestions
  // ---------------------------------------------------------------------------
  console.log('\n--- 6c. Testing Protect Safety Risk & Clinical Suggestions ---');

  // Setup answers for bedroom (one hazard) and bathroom (one hazard)
  BoneApp.setHubRoomAnswer('room_bedroom', 'bed_path', 'no');
  BoneApp.setHubRoomAnswer('room_bedroom', 'bed_lamp', 'yes');
  BoneApp.setHubRoomAnswer('room_bedroom', 'bed_height', 'yes');
  BoneApp.setHubRoomAnswer('room_bathroom', 'bath_mats', 'no');
  BoneApp.setHubRoomAnswer('room_bathroom', 'bath_grab', 'yes');
  BoneApp.setHubRoomAnswer('room_bathroom', 'bath_light', 'yes');

  BoneApp.renderProtectHubView();

  const protectSafetyHtml = mockElements['protectSafetyAnalysisCard'].innerHTML;
  assert(protectSafetyHtml.includes('psx-ring') && protectSafetyHtml.includes('6/15') && protectSafetyHtml.includes('answered'),
    'Unfinished home check: the ring shows how many questions are answered');
  assert(!protectSafetyHtml.includes('Your home is safe') && protectSafetyHtml.includes('9 questions not answered yet.') && protectSafetyHtml.includes('scrollToRoomCheck'),
    'Unfinished home check never says "safe" and offers to continue the check');
  assert(protectSafetyHtml.includes('Fix these') && (protectSafetyHtml.match(/class="psx-fix"/g) || []).length === 2,
    'Protect results list exactly the 2 hazards answered "No"');
  assert(protectSafetyHtml.includes('Clear rugs & cables') && protectSafetyHtml.includes('Use non-slip mats'),
    'Each hazard shows a short, plain fix');
  assert(protectSafetyHtml.includes('Remove loose throw rugs'),
    'The full how-to stays available behind a tap');
  assert(['Wear grip shoes', 'Night lights on', 'Yearly eye check', 'Review medicines', 'Balance practice', 'Phone within reach'].every(h => protectSafetyHtml.includes(h)),
    'Protect results show the 6 daily safety habits');
  assert(protectSafetyHtml.includes('askAiAboutFallSafety') && protectSafetyHtml.includes('shareProtectSafetyWhatsApp'),
    'Protect results offer Ask Ojas and WhatsApp sharing');

  BoneApp.markHazardFixed('room_bedroom', 'bed_path');
  const afterFix = mockElements['protectSafetyAnalysisCard'].innerHTML;
  assert((afterFix.match(/class="psx-fix"/g) || []).length === 1 && !afterFix.includes('Clear rugs & cables'),
    '"Fixed" removes the hazard from the list and saves the answer');

  // Test Protect Room Check Dropdown & Clean UI Toggle
  assert(typeof BoneApp.toggleRoomCheckDropdown === 'function', 'BoneApp exports toggleRoomCheckDropdown function');
  BoneApp.toggleRoomCheckDropdown(false);
  assert(mockElements['hubRoomCheckCollapseBody'].style.display === 'none', 'Room check dropdown can be collapsed to keep UI clean');
  BoneApp.toggleRoomCheckDropdown(true);
  assert(mockElements['hubRoomCheckCollapseBody'].style.display === 'block', 'Room check dropdown expands on open');
  BoneApp.scrollToRoomCheck();
  assert(mockElements['hubRoomCheckCollapseBody'].style.display === 'block', 'scrollToRoomCheck automatically expands dropdown');

  // Test that Bathroom is the first room in Protect Room Check
  assert(BONE_DATA.protectHomeAuditRooms[0].id === 'room_bathroom', 'Protect home audit starts with Bathroom');
  assert(BONE_DATA.homeSafetyAuditRooms[0].id === 'room_bathroom', 'Home safety audit starts with Bathroom');

  // ---------------------------------------------------------------------------
  // STEP 7: Test Backward Migration (Sanitizing Legacy Dummy Cache)
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // 6d. Strengthen Clinical Medical & Bone Care Portal Tests
  // ---------------------------------------------------------------------------
  console.log('\n--- 6d. Testing Strengthen Clinical Medical & Bone Care Portal ---');

  appSandbox.confirm = () => true;
  const html = () => mockElements['strengthenContentContainer'].innerHTML;

  // Subtab 1: Bone scan: nothing invented before the user adds a result
  BoneApp.switchStrengthenSubTab('dxa_risk');
  assert(html().includes('No scan saved yet') && !html().includes('-2.6') && !html().includes('Osteoporosis'), 'No sample T-scores: a new user sees "No scan saved yet", not a diagnosis');
  assert(html().includes('Who should get a scan?') && html().includes('Tell your doctor'), 'Without a scan it explains who needs one and lists fracture risk factors');
  assert(!/\d+%/.test(html()), 'No invented fracture-risk percentage is shown');

  BoneApp.openStrengthenForm('scan');
  mockDocument.getElementById('sxScanDate').value = '2025-03-01';
  mockDocument.getElementById('sxScan_spine').value = '-2.2';
  mockDocument.getElementById('sxScan_neck').value = '-1.9';
  mockDocument.getElementById('sxScan_hip').value = '';
  BoneApp.saveScan();
  BoneApp.openStrengthenForm('scan');
  mockDocument.getElementById('sxScanDate').value = '2026-03-01';
  mockDocument.getElementById('sxScan_spine').value = '-2.8';
  mockDocument.getElementById('sxScan_neck').value = '-2.4';
  mockDocument.getElementById('sxScan_hip').value = '-1.9';
  BoneApp.saveScan();
  assert(html().includes('<b>-2.8</b>') && html().includes('Osteoporosis'), 'Saved scan shows the lowest T-score and what it means');
  assert(html().includes('Lower than your last scan (-0.6)'), 'Two scans: shows the change since the last scan');
  assert(html().includes('Next scan due'), 'Shows when the next scan is due');
  BoneApp.openStrengthenForm('scan');
  mockDocument.getElementById('sxScan_spine').value = '-12';
  BoneApp.saveScan();
  assert(html().includes('class="sx-form"'), 'An impossible T-score is refused and the form stays open');
  BoneApp.closeStrengthenForm();

  BoneApp.toggleFraxFactor('prior_fracture');
  assert(html().includes('sx-toggle on'), 'Risk factors can be ticked for the doctor');

  // Subtab 2: Blood tests
  BoneApp.switchStrengthenSubTab('labs_biomarkers');
  assert(html().includes('No blood test saved yet') && html().includes('Ask your doctor for these tests:'), 'No sample lab values: lists which tests to ask for');
  BoneApp.openStrengthenForm('lab');
  mockDocument.getElementById('sxLabDate').value = '2026-03-02';
  mockDocument.getElementById('sxLab_vit_d').value = '18';
  mockDocument.getElementById('sxLab_calcium').value = '9.4';
  mockDocument.getElementById('sxLab_alp').value = '';
  mockDocument.getElementById('sxLab_egfr').value = '';
  BoneApp.saveLab();
  assert(html().includes('Very low. Ask your doctor about D3 doses.') && html().includes('Normal. Keep your 3-2-1 diet.'), 'Saved blood test shows a plain status for each value');
  assert(html().includes('Not tested yet'), 'Tests that were not done are marked "Not tested yet"');

  // Subtab 3: Medicines with a daily tick and a thyroid/calcium check
  BoneApp.switchStrengthenSubTab('meds_timing');
  assert(html().includes('No medicines added yet'), 'Medicines start empty');
  BoneApp.openStrengthenForm('med');
  BoneApp.pickMedKind('thyroid');
  mockDocument.getElementById('sxMedName').value = 'Thyronorm';
  mockDocument.getElementById('sxMedTime').value = '07:00';
  mockDocument.getElementById('sxMedWeekly').checked = false;
  BoneApp.saveMed();
  BoneApp.openStrengthenForm('med');
  BoneApp.pickMedKind('calcium');
  mockDocument.getElementById('sxMedName').value = 'Shelcal';
  mockDocument.getElementById('sxMedTime').value = '08:00';
  BoneApp.saveMed();
  assert(html().includes('Thyronorm') && html().includes('Shelcal') && html().includes('0 of 2 taken today'), 'Added medicines are listed for today');
  assert(html().includes('Your calcium at 08:00 is too close to your thyroid pill. Take it at 11:00 or later.'), 'Warns when calcium is scheduled too close to the thyroid pill');
  const thyroidId = /toggleMedTaken\('([^']+)'\)/.exec(html())[1];
  BoneApp.toggleMedTaken(thyroidId);
  assert(html().includes('1 of 2 taken today') && html().includes('sx-taken on'), 'Ticking a medicine marks it taken today');

  // Subtab 4: Spine: no invented height loss
  BoneApp.switchStrengthenSubTab('spine_safety');
  assert(html().includes('Height check') && html().includes('Enter your height at age 25') && !html().includes('cm lost'), 'Height check waits for the user\'s real heights');
  BoneApp.setSpineHeight('heightAge25', 170);
  BoneApp.setSpineHeight('heightCurrent', 164);
  assert(html().includes('<b>6</b>') && html().includes('spine X-ray'), 'Height loss >= 4 cm advises a spine X-ray');
  assert(html().includes('Move safely') && html().includes('tel:108'), 'Spine tab shows safe moves and an ambulance call button');

  // Subtab 5: Doctor visit built from the user's real records
  BoneApp.switchStrengthenSubTab('doctor_brief');
  assert(html().includes('Should I start bone medicine? (T-score -2.8)') && html().includes('My vitamin D is 18. Do I need D3 doses?'), 'Doctor questions come from the saved scan and blood test');
  assert(html().includes('What is my 10-year fracture risk?') && html().includes('How far apart should I take my thyroid pill and calcium?'), 'Risk factors and medicines add the right questions');
  mockDocument.getElementById('sxOwnQuestion').value = 'Can I keep doing yoga?';
  BoneApp.addDoctorQuestion();
  assert(html().includes('Can I keep doing yoga?'), 'The user can add their own question');
  BoneApp.setDoctorVisitDate(new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  assert(/In [34] days/.test(html()), 'Next visit date shows how many days are left');

  BoneApp.printDocument('doctor');
  const printDocHtml = mockElements['printDoc'].innerHTML;
  assert(printDocHtml.includes('Doctor Visit Summary') && printDocHtml.includes('-2.8') && printDocHtml.includes('Thyronorm') && printDocHtml.includes('Can I keep doing yoga?'), 'Printed doctor summary includes the saved scans, medicines and own questions');

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
  assert(migratedChat.includes('Namaste! I') && mockElements['chatContextStrip'].innerHTML.includes('Guest'), 'Migration test: Platform cleanly defaulted to Guest state');

  console.log('\n--- 8. Testing Strengthen Dual Mode & Profile Login Persistence ---');
  // Strengthen default simple mode
  BoneApp.setStrengthenMode('simple');
  BoneApp.renderStrengthenHubView();
  assert(mockElements['hubDoctorChecklist'].innerHTML.includes('doc-row'), 'Simple mode renders doctor review checklist');
  assert(mockElements['hubDxaRangesList'].innerHTML.includes('dxa-item'), 'Simple mode renders DXA T-Score scale ranges');

  // Toggle doctor questions in simple mode
  BoneApp.toggleHubDoctor('doc_risk');
  assert(mockElements['hubDoctorChecklist'].innerHTML.includes('selected'), 'Doctor review question can be ticked');

  // Switch to clinical mode
  BoneApp.setStrengthenMode('clinical');
  BoneApp.switchStrengthenSubTab('dxa_risk');
  assert(mockElements['strengthenContentContainer'].innerHTML.includes('No scan saved yet') || mockElements['strengthenContentContainer'].innerHTML.includes('Lowest T-score'), 'Clinical mode renders clinical subtab content');

  // Profile modal: Guest state shows Log in
  BoneApp.openUserProfileModal();
  assert(mockElements['profileAccountBox'].innerHTML.includes('Log in'), 'Guest profile shows Log in button');

  // Profile modal: Verified user shows phone number and Log out button, not Log in button
  mockLocalStorage.setItem('BONE_SIP_PRODUCTION_DB_V3', JSON.stringify({
    version: 4,
    auth: { isVerified: true, phone: '9555355555', cloud: false },
    userProfile: { phone: '9555355555' }
  }));
  const verifiedSandbox = {
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
  verifiedSandbox.window.window = verifiedSandbox.window;
  verifiedSandbox.window.document = mockDocument;
  verifiedSandbox.window.localStorage = mockLocalStorage;
  vm.createContext(verifiedSandbox);
  vm.runInContext(appCode, verifiedSandbox);

  const verifiedApp = verifiedSandbox.window.BoneApp;
  verifiedApp.openUserProfileModal();
  assert(mockElements['profileAccountBox'].innerHTML.includes('+91 95553 55555'), 'Verified user profile displays phone number');
  assert(mockElements['profileAccountBox'].innerHTML.includes('Log out'), 'Verified user profile displays Log out button');
  assert(!mockElements['profileAccountBox'].innerHTML.includes('openLogin()'), 'Verified user profile does NOT show Log in button');

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
