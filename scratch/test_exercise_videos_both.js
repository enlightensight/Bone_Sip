// scratch/test_exercise_videos_both.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('🧪 TESTING BOTH MALE & FEMALE EXERCISE MP4 VIDEOS & ACCURATE DIMENSIONS');
console.log('================================================================\n');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const BONE_SIP_DATA = require('../js/data.js');
const appContent = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

// Build mock DOM elements from HTML ids
const domMap = {};
const idMatches = html.matchAll(/id=["']([^"']+)["']/g);
for (const match of idMatches) {
  const id = match[1];
  domMap[id] = {
    id,
    style: {},
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.classes.has(c)) this.classes.delete(c);
          else this.classes.add(c);
        } else if (force) {
          this.classes.add(c);
        } else {
          this.classes.delete(c);
        }
      },
      contains(c) { return this.classes.has(c); }
    },
    dataset: {},
    innerHTML: '',
    textContent: '',
    src: '',
    play: async () => {},
    pause: () => {},
    appendChild(child) {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {}
  };
}

const windowObj = {
  location: { reload: () => {} },
  addEventListener: () => {},
  scrollTo: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  Audio: class { play() {} pause() {} }
};

const documentObj = {
  getElementById: (id) => domMap[id] || null,
  querySelectorAll: (selector) => [],
  querySelector: (selector) => null,
  createElement: (tag) => ({
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    appendChild() {},
    setAttribute() {},
    getAttribute() { return null; }
  }),
  body: { appendChild() {}, style: {} }
};

const localStorageMock = {
  _store: {},
  getItem: (key) => localStorageMock._store[key] || null,
  setItem: (key, val) => { localStorageMock._store[key] = String(val); },
  removeItem: (key) => { delete localStorageMock._store[key]; },
  clear: () => { localStorageMock._store = {}; }
};

const ctx = {
  window: windowObj,
  document: documentObj,
  localStorage: localStorageMock,
  navigator: { vibrate: () => {}, userAgent: 'NodeTest' },
  console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  Audio: windowObj.Audio,
  BONE_SIP_DATA
};
ctx.global = ctx;
ctx.window.document = documentObj;
ctx.window.localStorage = localStorageMock;

vm.createContext(ctx);
vm.runInContext(appContent, ctx);

const BoneApp = ctx.window.BoneApp;

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

// 1. Check video files exist on disk
console.log('--- 1. Checking Existence of All 10 Target MP4 Files (Male + Female) ---');
const expectedVideos = [
  // Male
  'male_one_leg_balance.mp4',
  'male_rise_heels.mp4',
  'male_stair_climbing.mp4',
  'male_band_pull.mp4',
  'male_chair_sit_down_up.mp4',
  // Female
  'female_band_pull.mp4',
  'female_chair_sit_down_up.mp4',
  'female_one_leg_balance.mp4',
  'female_stair_climbing.mp4',
  'femal_rise_hills.mp4'
];

expectedVideos.forEach(v => {
  const filePath = path.join(__dirname, '../assets/exercises', v);
  assert(fs.existsSync(filePath), `Video file exists: assets/exercises/${v}`);
});

// 2. Check fullExerciseCatalog metadata for female videos
console.log('\n--- 2. Checking fullExerciseCatalog Female Video Metadata & Dimensions ---');
const catalog = BONE_SIP_DATA.fullExerciseCatalog;
assert(catalog && catalog.length === 12, `fullExerciseCatalog has 12 clinical movements (length=${catalog.length})`);

const sitToStand = catalog.find(e => e.id === 'ex_sit_to_stand');
assert(sitToStand && sitToStand.femaleImg === 'assets/exercises/female_chair_sit_down_up.mp4', 'ex_sit_to_stand uses female_chair_sit_down_up.mp4');
assert(sitToStand.femaleVideoWidth === 274 && sitToStand.femaleVideoHeight === 454, 'ex_sit_to_stand female dimensions 274x454 (~9:15)');

const oneLeg = catalog.find(e => e.id === 'ex_one_leg_balance');
assert(oneLeg && oneLeg.femaleImg === 'assets/exercises/female_one_leg_balance.mp4', 'ex_one_leg_balance uses female_one_leg_balance.mp4');
assert(oneLeg.femaleVideoWidth === 298 && oneLeg.femaleVideoHeight === 440, 'ex_one_leg_balance female dimensions 298x440 (~2:3)');

const calfRaises = catalog.find(e => e.id === 'ex_calf_raises');
assert(calfRaises && calfRaises.femaleImg === 'assets/exercises/femal_rise_hills.mp4', 'ex_calf_raises uses femal_rise_hills.mp4');
assert(calfRaises.femaleVideoWidth === 300 && calfRaises.femaleVideoHeight === 462, 'ex_calf_raises female dimensions 300x462 (~2:3)');

const stepUps = catalog.find(e => e.id === 'ex_step_ups');
assert(stepUps && stepUps.femaleImg === 'assets/exercises/female_stair_climbing.mp4', 'ex_step_ups uses female_stair_climbing.mp4');
assert(stepUps.femaleVideoWidth === 282 && stepUps.femaleVideoHeight === 456, 'ex_step_ups female dimensions 282x456 (~9:15)');

const bandPull = catalog.find(e => e.id === 'ex_band_pull');
assert(bandPull && bandPull.femaleImg === 'assets/exercises/female_band_pull.mp4', 'ex_band_pull uses female_band_pull.mp4');
assert(bandPull.femaleVideoWidth === 370 && bandPull.femaleVideoHeight === 358, 'ex_band_pull female dimensions 370x358 (~1:1)');

// 3. Check Female Coach View in DOM
console.log('\n--- 3. Testing Exercise Cards with Female Coach in DOM ---');
BoneApp.switchGlobalCoach('female');
BoneApp.switchBuildSubTab('exercise');
const grid = domMap['exerciseCardsGrid'];
assert(grid && grid.innerHTML.length > 0, `Exercise grid renders cards (innerHTML length=${grid.innerHTML.length})`);

const femaleVideoMatches = [...grid.innerHTML.matchAll(/<video[^>]*src="([^"]+)"[^>]*>/g)];
assert(femaleVideoMatches.length === 5, `All 5 exercise cards render native <video> elements for Female coach (found: ${femaleVideoMatches.length})`);

const expectedFemaleOrder = [
  'female_chair_sit_down_up.mp4',
  'female_one_leg_balance.mp4',
  'femal_rise_hills.mp4',
  'female_stair_climbing.mp4',
  'female_band_pull.mp4'
];

femaleVideoMatches.forEach((match, i) => {
  const fullTag = match[0];
  const src = match[1];
  assert(src.includes(expectedFemaleOrder[i]), `Card ${i + 1} video matches expected female video: ${expectedFemaleOrder[i]}`);
  assert(fullTag.includes('autoplay') && fullTag.includes('loop') && fullTag.includes('muted'), `Card ${i + 1} video includes autoplay, loop, muted`);
  assert(fullTag.includes('object-fit: contain'), `Card ${i + 1} video preserves aspect ratio via object-fit: contain`);
});

// 4. Test Workout Timer Modal with Female Video
console.log('\n--- 4. Testing Workout Timer Modal with Female Video ---');
BoneApp.openWorkoutTimerModal('ex_sit_to_stand');
const timerVideo = domMap['timerExerciseVideo'];
const timerGif = domMap['timerExerciseGif'];
const modal = domMap['workoutTimerModal'];

assert(modal.style.display === 'flex', 'Workout timer modal opened');
assert(timerVideo.style.display === 'block', 'Timer video is displayed as block');
assert(timerGif.style.display === 'none', 'Timer gif is hidden');
assert(timerVideo.src.includes('female_chair_sit_down_up.mp4'), `Timer video src correctly set to female_chair_sit_down_up.mp4 (${timerVideo.src})`);

BoneApp.closeWorkoutTimerModal();
assert(modal.style.display === 'none', 'Workout timer modal closed cleanly');

// 5. Test Switching between Male & Female Coaches
console.log('\n--- 5. Testing Seamless Switching between Female and Male Coaches ---');
BoneApp.switchGlobalCoach('male');
const maleVideoMatches = [...grid.innerHTML.matchAll(/<video[^>]*src="([^"]+)"/g)];
assert(maleVideoMatches.length === 5, `Male coach switch renders all 5 MP4 <video> elements (found ${maleVideoMatches.length})`);

BoneApp.openWorkoutTimerModal('ex_sit_to_stand');
assert(timerVideo.src.includes('male_chair_sit_down_up.mp4'), `Male coach timer video src correctly set to male_chair_sit_down_up.mp4 (${timerVideo.src})`);
BoneApp.closeWorkoutTimerModal();

BoneApp.switchGlobalCoach('female');
const restoredFemaleVideoMatches = [...grid.innerHTML.matchAll(/<video[^>]*src="([^"]+)"/g)];
assert(restoredFemaleVideoMatches.length === 5, `Restoring female coach renders all 5 MP4 <video> elements (found ${restoredFemaleVideoMatches.length})`);

console.log('\n================================================================');
console.log(`🏁 TEST RESULT: ${passed} Passed, ${failed} Failed`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
