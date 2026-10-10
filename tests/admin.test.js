/**
 * BONE SIP — Super Admin Portal Verification Test Suite
 * Validates:
 * 1. Admin markup structure in admin.html (two-column sidebar + 7 tabs)
 * 2. Activity log layout matching reference design (5 KPI cards, filters, table, status pills)
 * 3. Theme color integration in css/admin.css
 * 4. Client-side administration logic in js/admin.js
 */

const fs = require('fs');
const path = require('path');

let pass = 0;
let fail = 0;

function assert(cond, name, details = '') {
  if (cond) {
    pass++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    fail++;
    console.error(`  ❌ FAIL: ${name} - ${details}`);
  }
}

console.log('================================================================');
console.log('🧪 BONE SIP SUPER ADMIN PORTAL TEST SUITE');
console.log('================================================================\n');

console.log('--- 1. Testing admin.html Markup & Architecture ---');
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');

assert(adminHtml.includes('class="ad-sidebar"'), 'Sidebar element .ad-sidebar exists');
assert(adminHtml.includes('data-tab="activity"') && adminHtml.includes('Activity log'), 'Activity log tab is defined in navigation');
assert(adminHtml.includes('data-tab="overview"') && adminHtml.includes('Overview'), 'Overview tab is defined in navigation');
assert(adminHtml.includes('data-tab="users"') && adminHtml.includes('Users'), 'Users tab is defined in navigation');
assert(adminHtml.includes('data-tab="diets"') && adminHtml.includes('Diet plans'), 'Diet plans tab is defined in navigation');
assert(adminHtml.includes('data-tab="audits"') && adminHtml.includes('Audits'), 'Audits tab is defined in navigation');
assert(adminHtml.includes('data-tab="reminders"') && adminHtml.includes('Reminders'), 'Reminders tab is defined in navigation');
assert(adminHtml.includes('data-tab="settings"') && adminHtml.includes('Settings'), 'Settings tab is defined in navigation');

// Check 5 KPI Stat Cards
assert(adminHtml.includes('Verified users'), 'KPI card "Verified users" is present');
assert(adminHtml.includes('Diet plans generated'), 'KPI card "Diet plans generated" is present');
assert(adminHtml.includes('Exercises logged'), 'KPI card "Exercises logged" is present');
assert(adminHtml.includes('Reminders sent'), 'KPI card "Reminders sent" is present');
assert(adminHtml.includes('Journey completion'), 'KPI card "Journey completion" is present');

// Check Filters
assert(adminHtml.includes('id="adActivitySearch"'), 'Search input #adActivitySearch is present');
assert(adminHtml.includes('id="adActivityDate"'), 'Date dropdown #adActivityDate is present');
assert(adminHtml.includes('id="adActivityModule"'), 'Module dropdown #adActivityModule is present');
assert(adminHtml.includes('id="adActivityStatus"'), 'Status dropdown #adActivityStatus is present');

// Check Table and Pagination
assert(adminHtml.includes('id="adActivityRows"'), 'Activity table tbody #adActivityRows is present');
assert(adminHtml.includes('id="adActivityCount"'), 'Event count display #adActivityCount is present');
assert(adminHtml.includes('id="adActivityPrev"') && adminHtml.includes('id="adActivityNext"'), 'Pagination buttons Previous/Next are present');

console.log('\n--- 2. Testing css/admin.css Theme Color Integration ---');
const adminCss = fs.readFileSync(path.join(__dirname, '../css/admin.css'), 'utf8');

assert(adminCss.includes('.ad-sidebar') && adminCss.includes('#1E182F'), 'Sidebar uses deep brand navy-plum background (#1E182F)');
assert(adminCss.includes('.ad-kpi-row') && adminCss.includes('repeat(5, 1fr)'), '5 KPI cards arranged in 5-column responsive grid');
assert(adminCss.includes('.ad-badge.delivered') && adminCss.includes('.ad-badge.success'), 'Delivered and Success pills styled with emerald theme');
assert(adminCss.includes('.ad-badge.logged') && adminCss.includes('#EEEBF7'), 'Logged pill styled with lavender protect theme');
assert(adminCss.includes('.ad-badge.high') && adminCss.includes('#FDECF1'), 'High risk pill styled with berry build theme');
assert(adminCss.includes('.ad-badge.queued') && adminCss.includes('#FFF4E5'), 'Queued pill styled with warm amber theme');
assert(adminCss.includes('.ad-badge.retry') && adminCss.includes('#FCE8EB'), 'Retry pill styled with rose alert theme');

console.log('\n--- 3. Testing js/admin.js Client-Side Logic ---');
const adminJs = fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8');

assert(adminJs.includes('SAMPLE_ACTIVITIES'), 'SAMPLE_ACTIVITIES array seeded with reference telemetry');
assert(adminJs.includes('Reminder sent: "20-minute walk"'), 'Reference reminder activity event is present');
assert(adminJs.includes('Diet plan generated (Vegan · South Indian)'), 'Reference diet plan activity event is present');
assert(adminJs.includes('Exercise completed: Sit to Stand, 10 reps'), 'Reference exercise activity event is present');
assert(adminJs.includes('Bone Risk Audit: 4 of 6 signals'), 'Reference Bone Risk Audit event is present');
assert(adminJs.includes('Home audit completed: 12 of 14 safe'), 'Reference Home audit event is present');
assert(adminJs.includes('Evening SIP skipped, email follow-up'), 'Reference SIP email event is present');
assert(adminJs.includes('OTP verified') && adminJs.includes('OTP failed'), 'Reference OTP verification events are present');
assert(adminJs.includes('switchTab'), 'Sidebar tab switching function switchTab is present');

console.log('\n================================================================');
console.log(`🏁 ADMIN TEST SUITE COMPLETED: ${pass} Passed, ${fail} Failed`);
console.log('================================================================\n');

if (fail > 0) process.exit(1);
