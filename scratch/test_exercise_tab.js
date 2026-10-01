const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

// Set up mock DOM from actual HTML structure
const domMap = {};

// Simple regex to extract elements with IDs
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
    innerHTML: ''
  }),
  body: {
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    appendChild() {}
  }
};

const localStorageStore = {};
const mockLocalStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => {}
};

const sandbox = {
  window: windowObj,
  document: documentObj,
  localStorage: mockLocalStorage,
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  Audio: windowObj.Audio,
  BONE_SIP_DATA: require('../js/data.js')
};

vm.createContext(sandbox);

const appJs = fs.readFileSync('js/app.js', 'utf8');
vm.runInContext(appJs, sandbox);

console.log('App loaded. Checking BoneApp...');
const BoneApp = sandbox.window.BoneApp;
console.log('BoneApp methods:', Object.keys(BoneApp));

// init ran on DOM load in browser

console.log('\n--- Calling BoneApp.switchBuildSubTab("exercise") ---');
try {
  BoneApp.switchBuildSubTab('exercise');
  console.log('SUCCESS! switchBuildSubTab("exercise") finished without errors.');
  
  const viewEx = domMap['buildSubViewExercise'];
  console.log('buildSubViewExercise display:', viewEx.style.display);
  
  const grid = domMap['exerciseCardsGrid'];
  console.log('exerciseCardsGrid innerHTML length:', grid.innerHTML.length);
  console.log('exerciseCardsGrid preview:\n', grid.innerHTML.slice(0, 300));
} catch (err) {
  console.error('ERROR in switchBuildSubTab("exercise"):', err);
}
