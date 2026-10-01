// Test full assessment sequence:
// 1. Splash / Start
// 2. Goals
// 3. Plan Overview
// 4. Build Education (Image 2: "Three nutrients do most of the work...") - BEFORE Assessment starts
// 5. Assessment 1 of 4: Diet Pattern (Image 1: "What does your plate usually look like?")
// 6. Assessment 2 of 4: Regional Cuisine
// 7. Assessment 3 of 4: Daily Activity
// 8. Assessment 4 of 4: Health Factors & Bone History
// 9. Login / OTP Verification Gate
// 10. Protect Unlocked

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('🧪 TESTING STEP SEQUENCE: EDUCATION -> ASSESSMENT -> LOGIN');
console.log('================================================================\n');

const dataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Mock DOM & storage
const localStorageStore = {};
const mockElements = {};
function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
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
    appendChild: function() {},
    remove: function() {},
    focus: function() {},
    querySelectorAll: function() { return []; }
  };
}

const elementIds = [
  'assessmentStageContainer', 'view-assessment', 'view-auth', 'view-build',
  'inlineAuthPhoneStep', 'inlineAuthOtpStep', 'inlineMobileNumberInput',
  'inlineOtpSentPhoneText', 'userHeaderProfile', 'pillProfileValues',
  'heightWeightModal', 'heightDisplayValue', 'weightDisplayValue',
  'pillarNavBuild', 'pillarNavProtect', 'pillarNavStrengthen'
];

elementIds.forEach(id => {
  mockElements[id] = createMockElement(id);
});

const sandbox = {
  window: {},
  document: {
    getElementById: (id) => mockElements[id] || (mockElements[id] = createMockElement(id)),
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    createElement: (tag) => createMockElement('dyn_' + Math.random(), tag),
    readyState: 'complete',
    addEventListener: () => {}
  },
  localStorage: {
    getItem: (k) => localStorageStore[k] || null,
    setItem: (k, v) => { localStorageStore[k] = String(v); },
    removeItem: (k) => { delete localStorageStore[k]; },
    clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Date: Date,
  Math: Math,
  scrollTo: () => {},
  AudioContext: class {
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    resume() {}
  }
};
sandbox.window = sandbox;
sandbox.window.localStorage = sandbox.localStorage;

vm.createContext(sandbox);
vm.runInContext(dataJs, sandbox);
vm.runInContext(appJs, sandbox);

const BoneApp = sandbox.window.BoneApp;
const doc = sandbox.document;

console.log('--- 1. Testing Initial State & Plan Overview ---');
BoneApp.setBuildAssessmentStep('plan_overview');
let container = mockElements['assessmentStageContainer'];
assert(container.innerHTML.includes('Start your bone investment journey'), 'Plan overview has start journey button');

console.log('\n--- 2. Testing Step Before Assessment: Build Education (3-2-1 Formula) ---');
BoneApp.setBuildAssessmentStep('build_education');
assert(container.innerHTML.includes('Three nutrients do most of the work. Here is where to find them.'), 'Build Education screen renders 3-2-1 formula headline before assessment');
assert(container.innerHTML.includes('Calcium-rich foods') && container.innerHTML.includes('Protein servings') && container.innerHTML.includes('Vitamin D source'), '3 metric cards present');
assert(container.innerHTML.includes('Start 2-Minute Assessment'), 'Action button leads to Start 2-Minute Assessment');

console.log('\n--- 3. Testing Assessment 1 of 4: Diet Pattern ---');
BoneApp.setBuildAssessmentStep('diet');
assert(container.innerHTML.includes('Build · 1 of 4'), 'Stage tag is Build · 1 of 4');
assert(container.innerHTML.includes('What does your plate'), 'Heading is What does your plate usually look like?');
assert(container.innerHTML.includes('Vegetarian') && container.innerHTML.includes('Eggetarian') && container.innerHTML.includes('Non-vegetarian') && container.innerHTML.includes('Vegan'), 'Diet options rendered');
assert(container.innerHTML.includes('Baseline Profile'), 'Baseline Profile card is rendered');

console.log('\n--- 4. Testing Assessment 2 of 4: Regional Cuisine ---');
BoneApp.setBuildAssessmentStep('regional_food');
assert(container.innerHTML.includes('Build · 2 of 4'), 'Stage tag is Build · 2 of 4');
assert(container.innerHTML.includes('What regional flavors'), 'Heading is What regional flavors do you cook with most?');

console.log('\n--- 5. Testing Assessment 3 of 4: Activity Level ---');
BoneApp.setBuildAssessmentStep('activity');
assert(container.innerHTML.includes('Build · 3 of 4'), 'Stage tag is Build · 3 of 4');
assert(container.innerHTML.includes('How active is your'), 'Heading is How active is your daily routine?');

console.log('\n--- 6. Testing Assessment 4 of 4: Health Factors & Bone History ---');
BoneApp.setBuildAssessmentStep('conditions');
assert(container.innerHTML.includes('Build · 4 of 4'), 'Stage tag is Build · 4 of 4');
assert(container.innerHTML.includes('Any health factors or'), 'Heading is Any health factors or bone history?');
assert(container.innerHTML.includes('Proceed to Mobile Verification'), 'Submit button leads to Mobile Verification');

console.log('\n--- 7. Testing Transition to Mobile Verification / Login Gate ---');
BoneApp.proceedToLogin();
const authSection = mockElements['view-auth'];
assert(authSection && authSection.classList.contains('active'), 'Auth view is activated');
const phoneStep = mockElements['inlineAuthPhoneStep'];
assert(phoneStep && phoneStep.style.display === 'block', 'Phone input step is visible');

console.log('\n--- 8. Testing OTP Verification & Protect Unlock ---');
const phoneInput = mockElements['inlineMobileNumberInput'];
phoneInput.value = '9876543210';
BoneApp.sendInlineOTP();
const otpStep = mockElements['inlineAuthOtpStep'];
assert(otpStep && otpStep.style.display === 'block', 'OTP step is visible after sending SMS');
BoneApp.autofillInlineOTP();
BoneApp.verifyInlineOTP();
assert(container.innerHTML.includes('Protect · 1 of 3'), 'Protect assessment is now active and unlocked');

console.log('\n================================================================');
console.log(`🏁 FLOW SEQUENCE TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================');
