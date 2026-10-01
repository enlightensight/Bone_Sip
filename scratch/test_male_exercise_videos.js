// scratch/test_male_exercise_videos.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('🧪 TESTING 5 MALE EXERCISE VIDEOS & ACCURATE DIMENSIONS');
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
console.log('--- 1. Checking Existence of 5 Target MP4 Files ---');
const expectedVideos = [
  'male_one_leg_balance.mp4',
  'male_rise_heels.mp4',
  'male_stair_climbing.mp4',
  'male_band_pull.mp4',
  'male_chair_sit_down_up.mp4'
];

expectedVideos.forEach(v => {
  const filePath = path.join(__dirname, '../assets/exercises', v);
  assert(fs.existsSync(filePath), `Video file exists: assets/exercises/${v}`);
});

// 2. Check fullExerciseCatalog metadata
console.log('\n--- 2. Checking fullExerciseCatalog 5 Core Video Exercises ---');
const catalog = BONE_SIP_DATA.fullExerciseCatalog;
assert(catalog && catalog.length === 12, `fullExerciseCatalog has 12 clinical movements (length=${catalog.length})`);

const sitToStand = catalog.find(e => e.id === 'ex_sit_to_stand');
assert(sitToStand && sitToStand.maleImg === 'assets/exercises/male_chair_sit_down_up.mp4', 'ex_sit_to_stand uses male_chair_sit_down_up.mp4');
assert(sitToStand.videoWidth === 290 && sitToStand.videoHeight === 474, 'ex_sit_to_stand has accurate dimensions 290x474');

const oneLeg = catalog.find(e => e.id === 'ex_one_leg_balance');
assert(oneLeg && oneLeg.maleImg === 'assets/exercises/male_one_leg_balance.mp4', 'ex_one_leg_balance uses male_one_leg_balance.mp4');
assert(oneLeg.videoWidth === 286 && oneLeg.videoHeight === 468, 'ex_one_leg_balance has accurate dimensions 286x468');

const calfRaises = catalog.find(e => e.id === 'ex_calf_raises');
assert(calfRaises && calfRaises.maleImg === 'assets/exercises/male_rise_heels.mp4', 'ex_calf_raises uses male_rise_heels.mp4');
assert(calfRaises.videoWidth === 240 && calfRaises.videoHeight === 450, 'ex_calf_raises has accurate dimensions 240x450');

const stepUps = catalog.find(e => e.id === 'ex_step_ups');
assert(stepUps && stepUps.maleImg === 'assets/exercises/male_stair_climbing.mp4', 'ex_step_ups uses male_stair_climbing.mp4');
assert(stepUps.videoWidth === 246 && stepUps.videoHeight === 460, 'ex_step_ups has accurate dimensions 246x460');

const bandPull = catalog.find(e => e.id === 'ex_band_pull');
assert(bandPull && bandPull.maleImg === 'assets/exercises/male_band_pull.mp4', 'ex_band_pull uses male_band_pull.mp4');
assert(bandPull.videoWidth === 422 && bandPull.videoHeight === 582, 'ex_band_pull has accurate dimensions 422x582');

// 3. Check App UI Exercise Tab Rendering with Male Coach
console.log('\n--- 3. Testing Exercise Cards Rendering in DOM ---');
BoneApp.switchBuildSubTab('exercise');
const grid = domMap['exerciseCardsGrid'];
assert(grid && grid.innerHTML.length > 0, `Exercise grid renders cards (innerHTML length=${grid.innerHTML.length})`);

// Extract all <video src="..."> occurrences in grid.innerHTML
const videoSrcMatches = [...grid.innerHTML.matchAll(/<video[^>]*src="([^"]+)"[^>]*>/g)];
assert(videoSrcMatches.length === 5, `All 5 exercise cards render native <video> elements (found: ${videoSrcMatches.length})`);

videoSrcMatches.forEach((match, i) => {
  const fullTag = match[0];
  const src = match[1];
  assert(src.endsWith('.mp4'), `Card ${i + 1} video has valid MP4 src: ${src}`);
  assert(fullTag.includes('autoplay') && fullTag.includes('loop') && fullTag.includes('muted'), `Card ${i + 1} video includes autoplay, loop, muted`);
  assert(fullTag.includes('object-fit: contain'), `Card ${i + 1} video preserves aspect ratio via object-fit: contain`);
});

// 4. Test Workout Timer Modal with Video Playback
console.log('\n--- 4. Testing Workout Timer Modal Video Integration ---');
BoneApp.openWorkoutTimerModal('ex_sit_to_stand');
const timerVideo = domMap['timerExerciseVideo'];
const timerGif = domMap['timerExerciseGif'];
const modal = domMap['workoutTimerModal'];

assert(modal.style.display === 'flex', 'Workout timer modal opened');
assert(timerVideo.style.display === 'block', 'Timer video is displayed as block');
assert(timerGif.style.display === 'none', 'Timer gif is hidden');
assert(timerVideo.src.includes('male_chair_sit_down_up.mp4'), `Timer video src correctly set to male_chair_sit_down_up.mp4 (${timerVideo.src})`);

BoneApp.closeWorkoutTimerModal();
assert(modal.style.display === 'none', 'Workout timer modal closed cleanly');

// 5. Test Switching to Female Coach and back to Male Coach
console.log('\n--- 5. Testing Coach Switching (Female GIF <-> Male MP4) ---');
BoneApp.switchGlobalCoach('female');
const femaleGifMatches = [...grid.innerHTML.matchAll(/<img[^>]*src="([^"]+)"/g)];
assert(femaleGifMatches.length >= 5, `Switching to female coach renders <img> GIF elements (found ${femaleGifMatches.length})`);

BoneApp.switchGlobalCoach('male');
const restoredVideoMatches = [...grid.innerHTML.matchAll(/<video[^>]*src="([^"]+)"/g)];
assert(restoredVideoMatches.length === 5, `Switching back to male coach restores all 5 MP4 <video> elements (found ${restoredVideoMatches.length})`);

console.log('\n================================================================');
console.log(`🏁 TEST RESULT: ${passed} Passed, ${failed} Failed`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
