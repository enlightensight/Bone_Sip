'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0;
let fail = 0;
function assert(cond, name, details = '') {
  if (cond) {
    pass++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    fail++;
    console.error(`  ❌ FAIL: ${name}${details ? `\n       ${details}` : ''}`);
  }
}

console.log('================================================================');
console.log('🧪 BONE SIP SPLASH SCREEN & ONBOARDING FLOW TEST');
console.log('================================================================\n');

// 1. Verify CSS z-index stacking order in brand.css
console.log('--- 1. Testing CSS Stacking Order ---');
const brandCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'brand.css'), 'utf8');

const splashMatch = brandCss.match(/\.splash\s*\{[^}]*z-index:\s*(\d+)/);
const langMatch = brandCss.match(/\.lang-overlay\s*\{[^}]*z-index:\s*(\d+)/);
const toastMatch = brandCss.match(/\.toast-notification\s*\{[^}]*z-index:\s*(\d+)/);

assert(!!splashMatch, '.splash has z-index defined');
assert(!!langMatch, '.lang-overlay has z-index defined');
assert(!!toastMatch, '.toast-notification has z-index defined');

const splashZ = splashMatch ? parseInt(splashMatch[1], 10) : 0;
const langZ = langMatch ? parseInt(langMatch[1], 10) : 0;
const toastZ = toastMatch ? parseInt(toastMatch[1], 10) : 0;

assert(langZ > splashZ, `.lang-overlay z-index (${langZ}) is above .splash (${splashZ}) so modal never renders behind splash`);
assert(toastZ > langZ, `.toast-notification z-index (${toastZ}) is above .lang-overlay (${langZ})`);

// 2. Test Onboarding Tour & Language Picker Execution
console.log('\n--- 2. Testing Splash "Get Started" Click Flow ---');

const elements = {};
function getOrCreate(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      style: {},
      classes: new Set(),
      classList: {
        add(c) { elements[id].classes.add(c); },
        remove(c) { elements[id].classes.delete(c); },
        contains(c) { return elements[id].classes.has(c); },
        toggle(c, f) {
          if (f === undefined) f = !elements[id].classes.has(c);
          if (f) elements[id].classes.add(c); else elements[id].classes.delete(c);
        }
      },
      hidden: false,
      dataset: {},
      attributes: {},
      setAttribute(k, v) { this.attributes[k] = String(v); },
      getAttribute(k) { return this.attributes[k]; },
      removeAttribute(k) { delete this.attributes[k]; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      addEventListener() {},
      innerHTML: '',
      textContent: ''
    };
  }
  return elements[id];
}

const mockDoc = {
  readyState: 'complete',
  getElementById: (id) => getOrCreate(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (t) => getOrCreate('elem_' + Math.random()),
  body: getOrCreate('body'),
  documentElement: { lang: 'en', dataset: {}, classList: { add() {}, remove() {} } },
  addEventListener: () => {},
  dispatchEvent: () => {}
};

const store = {};
const mockStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};

const BONE_DATA = require('../js/data.js');
const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

const sandbox = {
  BONE_SIP_DATA: BONE_DATA,
  window: {
    BONE_SIP_DATA: BONE_DATA,
    addEventListener: () => {},
    scrollTo: () => {},
    localStorage: mockStorage,
    BoneI18n: {
      LANGS: [
        { code: 'en', name: 'English', native: 'English', glyph: 'Aa' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी', glyph: 'अ' }
      ],
      current: () => 'en',
      saved: () => mockStorage.getItem('bonesip_lang'),
      setLanguage: (code) => {
        mockStorage.setItem('bonesip_lang', code);
        return Promise.resolve(code);
      },
      t: (k) => k,
      tr: (k) => k,
      date: (d) => d.toISOString()
    }
  },
  document: mockDoc,
  localStorage: mockStorage,
  navigator: { userAgent: 'NodeTest' },
  location: { protocol: 'http:', hostname: 'localhost', search: '' },
  requestAnimationFrame: (cb) => cb(),
  setTimeout: (cb) => cb(),
  clearTimeout: () => {},
  console: console
};
sandbox.window.window = sandbox.window;
sandbox.window.document = mockDoc;

vm.createContext(sandbox);
vm.runInContext(appCode, sandbox);

const app = sandbox.window.BoneApp;
assert(typeof app.startOnboardingTour === 'function', 'BoneApp.startOnboardingTour is exported');

// Fresh visit: language not yet picked
const splash = getOrCreate('appSplashScreen');
const langPicker = getOrCreate('langPicker');
const onboarding = getOrCreate('appOnboardingOverlay');

assert(!splash.classList.contains('dismissed'), 'Splash screen starts not dismissed');
assert(langPicker.hidden !== false || !langPicker.classList.contains('first-run'), 'Lang picker starts closed');

// User clicks "Get started"
app.startOnboardingTour();

assert(splash.classList.contains('dismissed'), 'Clicking "Get started" immediately marks splash as dismissed');
assert(!langPicker.hidden, 'Language picker is displayed (!hidden)');
assert(langPicker.classList.contains('first-run'), 'Language picker has .first-run class');

// User picks Hindi and confirms
app.pickLanguage('hi');
app.confirmLanguage();

Promise.resolve().then(() => {
  assert(mockStorage.getItem('bonesip_lang') === 'hi', 'Language "hi" is saved to localStorage');
  assert(onboarding.style.display === 'flex', 'Onboarding tour overlay is displayed with display: flex');

  console.log(`\n🏁 SPLASH TESTS: ${pass} Passed, ${fail} Failed`);
  process.exit(fail ? 1 : 0);
});
