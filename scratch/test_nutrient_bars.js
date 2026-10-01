const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BONE_DATA = require('../js/data.js');

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
  const el = {
    id,
    tagName: tag.toUpperCase(),
    textContent: '',
    innerHTML: '',
    value: '',
    style: {},
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    addEventListener() {},
    click() {}
  };
  mockElements[id] = el;
  return el;
}

const requiredIds = [
  'liveDietCalciumVal', 'liveDietCalciumBar', 'liveDietProteinVal', 'liveDietProteinBar',
  'liveDietD3Val', 'liveDietD3Bar', 'liveDietK2Val', 'liveDietK2Bar',
  'liveDietMgVal', 'liveDietMgBar', 'liveDietVitCVal', 'liveDietVitCBar',
  'dietMilestonesList', 'dietActiveStreakDisplay', 'dietDayProgressDisplay', 'dietDayThemeBadge',
  'dietDayTitle', 'dietDaySubtitle', 'dailyStreakScoreDisplay', 'scoreTierBadge',
  'scoreBreakdownSummary', 'buildDayTabBar'
];

requiredIds.forEach(id => createMockElement(id));

const windowMock = {
  BONE_SIP_DATA: BONE_DATA,
  localStorage: mockLocalStorage,
  document: {
    getElementById: (id) => mockElements[id] || null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: (tag) => createMockElement('dyn_' + Math.random(), tag)
  },
  AudioContext: function() {
    return {
      state: 'running',
      createOscillator: () => ({ connect() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, start() {}, stop() {} }),
      createGain: () => ({ connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
      destination: {}
    };
  }
};
windowMock.window = windowMock;

const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const context = vm.createContext(windowMock);
vm.runInContext(appCode, context);

const BoneApp = windowMock.BoneApp;
console.log('--- Testing Dynamic Nutrient Target Bars ---');

// 1. Initial State (0 meals checked)
BoneApp.renderBuildDietView();
console.log('Calcium Display (0 checked):', mockElements['liveDietCalciumVal'].innerHTML);
console.log('Calcium Bar Width (0 checked):', mockElements['liveDietCalciumBar'].style.width);
console.log('Protein Display (0 checked):', mockElements['liveDietProteinVal'].innerHTML);
console.log('Protein Bar Width (0 checked):', mockElements['liveDietProteinBar'].style.width);

if (mockElements['liveDietCalciumBar'].style.width !== '0%') {
  console.error('FAIL: Calcium bar should be 0% when no meals checked');
  process.exit(1);
}
if (mockElements['liveDietProteinBar'].style.width !== '0%') {
  console.error('FAIL: Protein bar should be 0% when no meals checked');
  process.exit(1);
}

// 2. Check 1 meal (m_breakfast)
const today = new Date().toISOString().slice(0, 10);
BoneApp.toggleDietMilestone(today, 'm_breakfast');

console.log('\nAfter checking m_breakfast:');
console.log('Calcium Display:', mockElements['liveDietCalciumVal'].innerHTML);
console.log('Calcium Bar Width:', mockElements['liveDietCalciumBar'].style.width);
console.log('Protein Display:', mockElements['liveDietProteinVal'].innerHTML);
console.log('Protein Bar Width:', mockElements['liveDietProteinBar'].style.width);
console.log('Vitamin D3 Display:', mockElements['liveDietD3Val'].innerHTML);
console.log('Vitamin D3 Bar Width:', mockElements['liveDietD3Bar'].style.width);
console.log('Vitamin K2 Display:', mockElements['liveDietK2Val'].innerHTML);
console.log('Vitamin K2 Bar Width:', mockElements['liveDietK2Bar'].style.width);
console.log('Magnesium Display:', mockElements['liveDietMgVal'].innerHTML);
console.log('Magnesium Bar Width:', mockElements['liveDietMgBar'].style.width);
console.log('Vitamin C Display:', mockElements['liveDietVitCVal'].innerHTML);
console.log('Vitamin C Bar Width:', mockElements['liveDietVitCBar'].style.width);

const widthCal1 = parseFloat(mockElements['liveDietCalciumBar'].style.width);
const widthPro1 = parseFloat(mockElements['liveDietProteinBar'].style.width);
const widthK2_1 = parseFloat(mockElements['liveDietK2Bar'].style.width);
const widthMg_1 = parseFloat(mockElements['liveDietMgBar'].style.width);

if (widthCal1 <= 0 || widthCal1 >= 100) {
  console.error('FAIL: Calcium bar width should be between 0% and 100% after 1 meal');
  process.exit(1);
}
if (widthPro1 <= 0 || widthPro1 >= 100) {
  console.error('FAIL: Protein bar width should be between 0% and 100% after 1 meal');
  process.exit(1);
}
if (widthK2_1 <= 0 || widthK2_1 >= 100) {
  console.error('FAIL: K2 bar width should be between 0% and 100% after 1 meal');
  process.exit(1);
}
if (widthMg_1 <= 0 || widthMg_1 >= 100) {
  console.error('FAIL: Mg bar width should be between 0% and 100% after 1 meal');
  process.exit(1);
}

// 3. Check all 5 meals
['m_lunch', 'm_snack', 'm_dinner', 'm_sun_d3'].forEach(id => {
  BoneApp.toggleDietMilestone(today, id);
});

console.log('\nAfter checking all 5 milestones:');
console.log('Calcium Display:', mockElements['liveDietCalciumVal'].innerHTML);
console.log('Calcium Bar Width:', mockElements['liveDietCalciumBar'].style.width);
console.log('Protein Display:', mockElements['liveDietProteinVal'].innerHTML);
console.log('Protein Bar Width:', mockElements['liveDietProteinBar'].style.width);
console.log('Vitamin D3 Display:', mockElements['liveDietD3Val'].innerHTML);
console.log('Vitamin D3 Bar Width:', mockElements['liveDietD3Bar'].style.width);
console.log('Vitamin K2 Display:', mockElements['liveDietK2Val'].innerHTML);
console.log('Vitamin K2 Bar Width:', mockElements['liveDietK2Bar'].style.width);
console.log('Magnesium Display:', mockElements['liveDietMgVal'].innerHTML);
console.log('Magnesium Bar Width:', mockElements['liveDietMgBar'].style.width);
console.log('Vitamin C Display:', mockElements['liveDietVitCVal'].innerHTML);
console.log('Vitamin C Bar Width:', mockElements['liveDietVitCBar'].style.width);

if (mockElements['liveDietCalciumBar'].style.width !== '100%') {
  console.error('FAIL: Calcium bar width should be 100% when all meals are checked');
  process.exit(1);
}
if (mockElements['liveDietProteinBar'].style.width !== '100%') {
  console.error('FAIL: Protein bar width should be 100% when all meals are checked');
  process.exit(1);
}
if (parseFloat(mockElements['liveDietD3Bar'].style.width) < 80) {
  console.error('FAIL: D3 bar width should reach near 100% with morning sun');
  process.exit(1);
}

// 4. Uncheck m_breakfast
BoneApp.toggleDietMilestone(today, 'm_breakfast');
console.log('\nAfter unchecking m_breakfast:');
console.log('Calcium Display:', mockElements['liveDietCalciumVal'].innerHTML);
console.log('Calcium Bar Width:', mockElements['liveDietCalciumBar'].style.width);

const widthCalUnchecked = parseFloat(mockElements['liveDietCalciumBar'].style.width);
if (widthCalUnchecked >= 100 || widthCalUnchecked <= 0) {
  console.error('FAIL: Calcium bar width should drop below 100% after unchecking meal');
  process.exit(1);
}

console.log('\n✅ ALL NUTRIENT DYNAMIC BAR TESTS PASSED PERFECTLY!');
