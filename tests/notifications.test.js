/**
 * BONE SIP — Daily Routine Push Notifications Test Suite
 *
 * Verifies:
 *   1. Exactly 5 routine slots (7:00 AM, 8:00 AM, 1:00 PM, 4:30 PM, 7:30 PM)
 *   2. Complete translations in all 12 languages (en, hi, bn, mr, te, ta, gu, kn, ml, pa, or, as)
 *   3. Mobile app logo icon & badge references
 *   4. Service Worker sw.js push and notificationclick event listeners
 *   5. Markup in index.html (header button, status dot, modal, diet banner, profile toggle)
 *   6. BoneApp exported notification methods
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passCount = 0;
let failCount = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passCount++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failCount++;
    console.error(`  ❌ FAIL: ${message}${details ? `\n       ${details}` : ''}`);
  }
}

console.log('================================================================');
console.log('🧪 BONE SIP DAILY ROUTINE PUSH NOTIFICATIONS TEST SUITE');
console.log('================================================================');

// -----------------------------------------------------------------------------
// 1. Notification Engine & Schedule Structure
// -----------------------------------------------------------------------------
console.log('\n--- 1. Testing Notification Schedule & Slots ---');

const notifCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'notifications.js'), 'utf8');
const notifSandbox = {
  window: {},
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  },
  console
};
notifSandbox.globalThis = notifSandbox.window;
vm.createContext(notifSandbox);
vm.runInContext(notifCode, notifSandbox);

const BoneNotifications = notifSandbox.window.BoneNotifications;
assert(!!BoneNotifications, 'BoneNotifications is exported to global scope');
assert(Array.isArray(BoneNotifications.SCHEDULE), 'BoneNotifications.SCHEDULE is an array');
assert(BoneNotifications.SCHEDULE.length === 5, `SCHEDULE contains exactly 5 daily routine slots (actual: ${BoneNotifications.SCHEDULE.length})`);

const expectedSlots = [
  { id: 'm_sun_exercise', displayTime: '7:00 AM', targetHour: 7, targetMinute: 0 },
  { id: 'm_breakfast', displayTime: '8:00 AM', targetHour: 8, targetMinute: 0 },
  { id: 'm_lunch', displayTime: '1:00 PM', targetHour: 13, targetMinute: 0 },
  { id: 'm_snack', displayTime: '4:30 PM', targetHour: 16, targetMinute: 30 },
  { id: 'm_dinner', displayTime: '7:30 PM', targetHour: 19, targetMinute: 30 }
];

expectedSlots.forEach(expected => {
  const actual = BoneNotifications.SCHEDULE.find(s => s.id === expected.id);
  assert(!!actual, `Slot "${expected.id}" exists in schedule`);
  assert(actual.displayTime === expected.displayTime, `Slot "${expected.id}" display time is ${expected.displayTime} (actual: ${actual.displayTime})`);
  assert(actual.targetHour === expected.targetHour && actual.targetMinute === expected.targetMinute,
    `Slot "${expected.id}" targets ${expected.targetHour}:${String(expected.targetMinute).padStart(2, '0')}`);
});

// Verify Mobile App Logo Assets
assert(fs.existsSync(path.join(__dirname, '..', 'assets', 'icons', 'icon-192.png')), 'Mobile app icon assets/icons/icon-192.png exists on disk');
assert(fs.existsSync(path.join(__dirname, '..', 'assets', 'icons', 'favicon-32.png')), 'Mobile app badge assets/icons/favicon-32.png exists on disk');

// -----------------------------------------------------------------------------
// 2. Localization Coverage Across All 12 Languages
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing 12-Language Translations ---');

const LANG_CODES = ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];
const SCRIPT_CHECK = {
  hi: /[ऀ-ॿ]/,
  mr: /[ऀ-ॿ]/,
  bn: /[ঀ-৿]/,
  pa: /[਀-੿]/,
  gu: /[઀-૿]/,
  or: /[଀-୿]/,
  ta: /[஀-௿]/,
  te: /[ఀ-౿]/,
  kn: /[ಀ-೿]/,
  ml: /[ഀ-ൿ]/,
  as: /[ঀ-৿]/
};

LANG_CODES.forEach(lang => {
  const bundle = BoneNotifications.I18N_NOTIFS[lang];
  assert(!!bundle, `Language bundle "${lang}" exists`);
  if (!bundle) return;

  assert(!!bundle.welcome && !!bundle.welcome.title && !!bundle.welcome.body, `Language "${lang}" has welcome title & body`);
  expectedSlots.forEach(s => {
    const slotCopy = bundle[s.id];
    assert(!!slotCopy && typeof slotCopy.title === 'string' && slotCopy.title.length > 0,
      `Language "${lang}" translates slot "${s.id}" title`);
    assert(!!slotCopy && typeof slotCopy.body === 'string' && slotCopy.body.length > 0,
      `Language "${lang}" translates slot "${s.id}" body`);
  });

  assert(!!bundle.ui && !!bundle.ui.modalTitle && !!bundle.ui.statusActive, `Language "${lang}" has UI modal and status strings`);

  if (SCRIPT_CHECK[lang]) {
    const textSample = bundle.m_sun_exercise.title + ' ' + bundle.m_sun_exercise.body;
    assert(SCRIPT_CHECK[lang].test(textSample), `Language "${lang}" text is written in its native Indic script`);
  }
});

// -----------------------------------------------------------------------------
// 3. Service Worker sw.js Push & Notificationclick Listeners
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Service Worker Notification Handlers ---');

const swCode = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
assert(swCode.includes('addEventListener(\'notificationclick\''), 'sw.js handles notificationclick event');
assert(swCode.includes('addEventListener(\'push\''), 'sw.js handles push event');
assert(swCode.includes('addEventListener(\'message\''), 'sw.js handles message event for client triggers');
assert(swCode.includes('js/notifications.js?v=3.9.8'), 'sw.js APP_SHELL caches js/notifications.js');
assert(swCode.includes('assets/icons/icon-192.png'), 'sw.js specifies mobile icon assets/icons/icon-192.png');
assert(swCode.includes('assets/icons/favicon-32.png'), 'sw.js specifies badge assets/icons/favicon-32.png');

// -----------------------------------------------------------------------------
// 4. Markup in index.html
// -----------------------------------------------------------------------------
console.log('\n--- 4. Testing HTML Elements & UI Integration ---');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(indexHtml.includes('id="headerRemindersBtn"'), 'Header reminder button #headerRemindersBtn is present');
assert(indexHtml.includes('id="headerReminderDot"'), 'Header reminder status dot #headerReminderDot is present');
assert(indexHtml.includes('id="dietReminderBannerContainer"'), 'Diet view reminder banner container #dietReminderBannerContainer is present');
assert(indexHtml.includes('id="remindersModal"'), 'Reminders modal #remindersModal is present');
assert(indexHtml.includes('id="remindersMasterToggle"'), 'Reminders master switch toggle #remindersMasterToggle is present');
assert(indexHtml.includes('id="remindersStatusBadge"'), 'Reminders status badge #remindersStatusBadge is present');
assert(indexHtml.includes('id="remindersScheduleList"'), 'Reminders schedule list #remindersScheduleList is present');
assert(indexHtml.includes('id="btnSendTestReminder"'), 'Test reminder button #btnSendTestReminder is present');
assert(indexHtml.includes('id="profReminderToggle"'), 'Profile modal reminder toggle #profReminderToggle is present');
assert(indexHtml.includes('<script src="js/notifications.js?v=3.9.8"></script>'), 'js/notifications.js script tag loaded in index.html');

// -----------------------------------------------------------------------------
// 5. CSS Styles Verification
// -----------------------------------------------------------------------------
console.log('\n--- 5. Testing CSS Styles for Reminders ---');

const cssCode = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
assert(cssCode.includes('.reminder-pill'), 'CSS class .reminder-pill is defined');
assert(cssCode.includes('.reminder-status-dot'), 'CSS class .reminder-status-dot is defined');
assert(cssCode.includes('.switch-toggle'), 'CSS class .switch-toggle is defined');
assert(cssCode.includes('.diet-reminder-prompt-card'), 'CSS class .diet-reminder-prompt-card is defined');
assert(cssCode.includes('.diet-reminder-pill-active'), 'CSS class .diet-reminder-pill-active is defined');
assert(cssCode.includes('.reminders-modal-card'), 'CSS class .reminders-modal-card is defined');
assert(cssCode.includes('.reminder-schedule-item'), 'CSS class .reminder-schedule-item is defined');

// -----------------------------------------------------------------------------
// 6. BoneApp Method Exports
// -----------------------------------------------------------------------------
console.log('\n--- 6. Testing BoneApp Notification API Exports ---');

const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const methodsToExport = [
  'openRemindersModal',
  'closeRemindersModal',
  'toggleDailyReminders',
  'sendTestNotification',
  'testScheduleSlot',
  'renderRemindersModal',
  'renderDietReminderBanner',
  'updateHeaderReminderButton'
];

methodsToExport.forEach(m => {
  assert(appCode.includes(`${m},`) || appCode.includes(`${m}\n`), `BoneApp exports function ${m}`);
});

console.log('\n================================================================');
console.log(`🏁 NOTIFICATIONS TEST SUITE COMPLETED: ${passCount} Passed, ${failCount} Failed`);
console.log('================================================================\n');

process.exit(failCount > 0 ? 1 : 0);
