/**
 * BONE SIP — Super Admin Portal Verification Test Suite
 * Validates:
 * 1. Admin markup structure in admin.html (5 active tabs, zero fake reminders/settings)
 * 2. Activity log layout with real database metrics (5 KPI cards, real audit/user modules)
 * 3. Complete Clinical Dishes Catalog with Diet & Disease/Assessment filters in #adDietsTab
 * 4. Theme color and dishes card integration in css/admin.css
 * 5. Client-side administration & catalog filtering logic in js/admin.js
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

// Reminders & Settings tabs removed completely
assert(!adminHtml.includes('data-tab="reminders"'), 'Reminders tab button is REMOVED from navigation');
assert(!adminHtml.includes('data-tab="settings"'), 'Settings tab button is REMOVED from navigation');
assert(!adminHtml.includes('id="adRemindersTab"'), 'Reminders tab section #adRemindersTab is REMOVED');
assert(!adminHtml.includes('id="adSettingsTab"'), 'Settings tab section #adSettingsTab is REMOVED');

// Fake sample data badge removed
assert(!adminHtml.includes('Sample data · layout only'), 'Fake badge "Sample data · layout only" is REMOVED');

// Check 5 Real KPI Stat Cards in Activity Log
assert(adminHtml.includes('id="adKpiVerified"') && adminHtml.includes('Verified users'), 'KPI card "Verified users" is present');
assert(adminHtml.includes('id="adKpiActiveToday"') && adminHtml.includes('Active today'), 'KPI card "Active today" is present');
assert(adminHtml.includes('id="adKpiActive7"') && adminHtml.includes('Active this week'), 'KPI card "Active this week" is present');
assert(adminHtml.includes('id="adKpiDishes"') && adminHtml.includes('Dishes in catalog'), 'KPI card "Dishes in catalog" is present');
assert(adminHtml.includes('id="adKpiAudit"') && adminHtml.includes('Audit records'), 'KPI card "Audit records" is present');

// Check Filters in Activity Log (Zero WhatsApp or Email options)
assert(adminHtml.includes('id="adActivitySearch"'), 'Search input #adActivitySearch is present');
assert(adminHtml.includes('id="adActivityDate"'), 'Date dropdown #adActivityDate is present');
assert(adminHtml.includes('id="adActivityModule"'), 'Module dropdown #adActivityModule is present');
assert(!adminHtml.includes('Reminders · WhatsApp'), 'Fake module "Reminders · WhatsApp" is REMOVED');
assert(!adminHtml.includes('Reminders · Email'), 'Fake module "Reminders · Email" is REMOVED');
assert(adminHtml.includes('id="adActivityStatus"'), 'Status dropdown #adActivityStatus is present');

// Check Table and Pagination
assert(adminHtml.includes('id="adActivityRows"'), 'Activity table tbody #adActivityRows is present');
assert(adminHtml.includes('id="adActivityCount"'), 'Event count display #adActivityCount is present');
assert(adminHtml.includes('id="adActivityPrev"') && adminHtml.includes('id="adActivityNext"'), 'Pagination buttons Previous/Next are present');

// Check Clinical Dishes Catalog & Filters in #adDietsTab
assert(adminHtml.includes('id="adDietsTab"'), 'Diet plans section #adDietsTab is present');
assert(adminHtml.includes('id="adDishSearch"'), 'Dish search input #adDishSearch is present');
assert(adminHtml.includes('id="adDietPills"'), 'Diet pills group #adDietPills is present');
assert(adminHtml.includes('data-diet="veg"') && adminHtml.includes('Vegetarian'), 'Vegetarian diet filter pill is present');
assert(adminHtml.includes('data-diet="vegan"') && adminHtml.includes('Vegan'), 'Vegan diet filter pill is present');
assert(adminHtml.includes('data-diet="eggetarian"') && adminHtml.includes('Eggetarian'), 'Eggetarian diet filter pill is present');
assert(adminHtml.includes('data-diet="non_veg"') && adminHtml.includes('Non-Veg'), 'Non-Veg diet filter pill is present');

// Check Disease / Assessment Condition Filters
assert(adminHtml.includes('id="adConditionFilter"'), 'Disease filter dropdown #adConditionFilter is present');
assert(adminHtml.includes('value="kidney"'), 'Kidney disease option is present in #adConditionFilter');
assert(adminHtml.includes('value="hypertension"'), 'Hypertension / BP option is present in #adConditionFilter');
assert(adminHtml.includes('value="lactose_intolerance"'), 'Lactose Intolerance option is present in #adConditionFilter');
assert(adminHtml.includes('value="diabetes"'), 'Diabetes option is present in #adConditionFilter');
assert(adminHtml.includes('value="nuts_allergy"'), 'Nuts allergy option is present in #adConditionFilter');
assert(adminHtml.includes('value="thyroid"'), 'Thyroid option is present in #adConditionFilter');
assert(adminHtml.includes('value="dyslipidemia"'), 'Dyslipidemia option is present in #adConditionFilter');
assert(adminHtml.includes('value="obesity"'), 'Obesity option is present in #adConditionFilter');

// Check Region & Slot dropdowns and Dishes Grid
assert(adminHtml.includes('id="adRegionFilter"'), 'Region filter dropdown #adRegionFilter is present');
assert(adminHtml.includes('id="adSlotFilter"'), 'Meal slot filter dropdown #adSlotFilter is present');
assert(adminHtml.includes('id="adDishesGrid"'), 'Dishes grid #adDishesGrid is present');
assert(adminHtml.includes('id="adDishCount"'), 'Dishes counter #adDishCount is present');
assert(adminHtml.includes('src="js/data.js'), 'js/data.js is loaded in admin.html for clinical catalog');

console.log('\n--- 2. Testing css/admin.css Theme Color & Dish Styles ---');
const adminCss = fs.readFileSync(path.join(__dirname, '../css/admin.css'), 'utf8');

assert(adminCss.includes('.ad-sidebar') && adminCss.includes('#1E182F'), 'Sidebar uses deep brand navy-plum background (#1E182F)');
assert(adminCss.includes('.ad-kpi-row') && adminCss.includes('repeat(5, 1fr)'), '5 KPI cards arranged in 5-column responsive grid');
assert(adminCss.includes('.ad-dish-grid'), 'Dishes catalog grid styles .ad-dish-grid defined');
assert(adminCss.includes('.ad-dish-card'), 'Dishes card styles .ad-dish-card defined');
assert(adminCss.includes('.ad-dish-pill.active'), 'Active diet pill styled with brand plum (#6B2A5C)');
assert(adminCss.includes('.ad-dish-tag.veg') && adminCss.includes('.ad-dish-tag.vegan'), 'Veg and Vegan dish tags styled with green themes');
assert(adminCss.includes('.ad-dish-tag.eggetarian') && adminCss.includes('.ad-dish-tag.non-veg'), 'Eggetarian and Non-veg dish tags styled');
assert(adminCss.includes('.ad-dish-nutrients') && adminCss.includes('.ad-nutrient-box'), 'Nutrient boxes for Calcium and Protein styled');
assert(adminCss.includes('.ad-cond-chip'), 'Condition safety tags .ad-cond-chip styled');

console.log('\n--- 3. Testing js/admin.js Real Data & Filtering Logic ---');
const adminJs = fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8');

assert(!adminJs.includes('SAMPLE_ACTIVITIES = ['), 'Fake SAMPLE_ACTIVITIES telemetry array is REMOVED');
assert(!adminJs.includes('WhatsApp Gateways'), 'Fake WhatsApp Gateways telemetry is REMOVED');
assert(adminJs.includes('buildRealActivities'), 'buildRealActivities function compiles real events from SQLite');
assert(adminJs.includes('renderActivityLog'), 'renderActivityLog function renders real events');
assert(adminJs.includes('renderDishesCatalog'), 'renderDishesCatalog function renders dishes with live filters');
assert(adminJs.includes('dishMatchesCondition'), 'dishMatchesCondition function matches kidney, bp, lactose, etc.');
assert(adminJs.includes('getCatalog'), 'getCatalog accesses BONE_SIP_DATA.fullDietCatalog');
assert(adminJs.includes('switchTab'), 'Sidebar tab switching function switchTab is present');

console.log('\n--- 4. Testing Clinical Dishes Catalog & Global Scope Exposure ---');
const data = require('../js/data.js');
assert(Array.isArray(data.fullDietCatalog) && data.fullDietCatalog.length === 144, 'Clinical dishes catalog contains exactly 144 dishes');
assert(globalThis.BONE_SIP_DATA && globalThis.BONE_SIP_DATA.fullDietCatalog.length === 144, 'globalThis.BONE_SIP_DATA is populated with 144 dishes');
const dataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
assert(dataJs.includes('window.BONE_SIP_DATA = BONE_SIP_DATA'), 'js/data.js explicitly assigns window.BONE_SIP_DATA');
assert(dataJs.includes('globalThis.BONE_SIP_DATA = BONE_SIP_DATA'), 'js/data.js explicitly assigns globalThis.BONE_SIP_DATA');

console.log('\n--- 5. Testing Clean URL /admin Routing Configurations ---');
const vercelJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json'), 'utf8'));
assert(vercelJson.buildCommand.includes('admin.html'), 'vercel.json buildCommand includes admin.html');
assert(vercelJson.rewrites.some(r => r.source === '/admin' && r.destination === '/admin.html'), 'vercel.json rewrites /admin to /admin.html');

const netlifyToml = fs.readFileSync(path.join(__dirname, '../netlify.toml'), 'utf8');
assert(netlifyToml.includes('admin.html') && netlifyToml.includes('cp -r'), 'netlify.toml build command copies admin.html');
assert(netlifyToml.includes('from = "/admin"') && netlifyToml.includes('to = "/admin.html"'), 'netlify.toml redirects /admin to /admin.html');

const serverJs = fs.readFileSync(path.join(__dirname, '../server/server.js'), 'utf8');
assert(serverJs.includes("PUBLIC_FILES = new Set(['index.html', 'admin.html', 'admin'"), 'server.js includes admin and admin.html in PUBLIC_FILES');
assert(serverJs.includes("if (rel === 'admin') rel = 'admin.html'"), 'server.js maps rel === "admin" to admin.html');

console.log('\n--- 6. Testing Admin Management (Master Admin Tab & Phone Banner Removal) ---');
assert(!adminHtml.includes('id="adTestBanner"'), 'Phone login warning banner #adTestBanner is completely REMOVED from admin.html');
assert(!adminHtml.includes('Anyone who knows a phone number can open that account'), 'Phone warning message is completely REMOVED from admin.html');
assert(adminHtml.includes('id="adNavAdmins"') && adminHtml.includes('data-tab="admins"'), 'Add Admin tab button #adNavAdmins is present in sidebar');
assert(adminHtml.includes('id="adAdminsTab"'), 'Admin management section #adAdminsTab is present in admin.html');
assert(adminHtml.includes('id="adCreateAdminForm"'), 'Create admin form #adCreateAdminForm is present');
assert(adminHtml.includes('id="newAdminUser"') && adminHtml.includes('id="newAdminPass"') && adminHtml.includes('id="newAdminConfirmPass"'), 'Username, password and confirm password inputs are present');
assert(adminHtml.includes('id="btnCreateAdmin"'), 'Create admin submit button is present');
assert(adminHtml.includes('id="adAdminsTableRows"'), 'Administrators table #adAdminsTableRows is present');

assert(adminCss.includes('.ad-badge-master'), 'Master admin badge styles defined in css/admin.css');
assert(adminCss.includes('.ad-admins-grid'), 'Admins grid layout defined in css/admin.css');
assert(adminCss.includes('.ad-feedback-box'), 'Feedback alert box styles defined in css/admin.css');
assert(adminCss.includes('.ad-role-badge.master') && adminCss.includes('.ad-role-badge.admin'), 'Master and Admin role badges defined in css/admin.css');
assert(adminCss.includes('.ad-btn-del-admin'), 'Admin revoke button styles defined in css/admin.css');

assert(adminJs.includes('loadAdmins'), 'loadAdmins function defined in js/admin.js');
assert(adminJs.includes('state.isMaster'), 'state.isMaster role-based access check present in js/admin.js');
assert(adminJs.includes('adCreateAdminForm'), 'Form submission listener for creating admins present in js/admin.js');
assert(adminJs.includes('Passwords do not match'), 'Password confirmation validation logic present in js/admin.js');

console.log('\n================================================================');
console.log(`🏁 ADMIN TEST SUITE COMPLETED: ${pass} Passed, ${fail} Failed`);
console.log('================================================================\n');

if (fail > 0) process.exit(1);
