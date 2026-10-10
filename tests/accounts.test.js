/**
 * Accounts API: phone login, saved data, day-by-day history and the admin portal.
 * Starts the real server on a random port with a throwaway database.
 *   node tests/accounts.test.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createServer } = require('../server/server');
const { istDay, addDays } = require('../server/accounts');

let pass = 0;
let fail = 0;
function assert(cond, name, details = '') {
  if (cond) { pass++; console.log(`  ✅ PASS: ${name}`); } else { fail++; console.error(`  ❌ FAIL: ${name}${details ? `\n       ${details}` : ''}`); }
}

const ADMIN = '9000000001';
const PIN = 'pin-12345';
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bonesip-test-'));

function client(base) {
  let cookies = {};
  return async function call(method, url, body, extraHeaders = {}) {
    const headers = Object.assign({ Origin: base }, extraHeaders);
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const cookieStr = Object.entries(cookies).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookieStr) headers.Cookie = cookieStr;
    const res = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    (res.headers.getSetCookie ? res.headers.getSetCookie() : []).forEach(c => {
      const [pair] = c.split(';');
      const i = pair.indexOf('=');
      cookies[pair.slice(0, i)] = pair.slice(i + 1);
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (e) { /* csv */ }
    return { status: res.status, json, text, headers: res.headers };
  };
}

async function login(call, phone) {
  const sent = await call('POST', '/api/auth/otp/send', { phone });
  return call('POST', '/api/auth/otp/verify', { phone, code: sent.json.testCode });
}

(async () => {
  const server = createServer({ dataDir, env: { OTP_TEST_MODE: '1', ADMIN_PHONE: ADMIN, ADMIN_PIN: PIN, OTP_SECRET: 'x' } });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  console.log('\n--- Login ---');
  const a = client(base);
  assert((await a('POST', '/api/auth/otp/send', { phone: '12345' })).status === 400, 'Rejects an invalid phone number');
  const sent = await a('POST', '/api/auth/otp/send', { phone: '9876500001' });
  assert(sent.status === 200 && sent.json.testMode && sent.json.testCode === '123456', 'Test mode sends the fixed test code');
  assert((await a('POST', '/api/auth/otp/verify', { phone: '9876500001', code: '111111' })).status === 401, 'Wrong code is refused');
  assert((await a('GET', '/api/me')).status === 401, 'Not logged in before verifying');
  const ok = await a('POST', '/api/auth/otp/verify', { phone: '9876500001', code: '123456' });
  assert(ok.status === 200 && ok.json.user.phone === '9876500001' && ok.json.state === null, 'Right code logs in a new user with no saved data');
  assert(/HttpOnly/.test(ok.headers.get('set-cookie') || '') && /SameSite=Lax/.test(ok.headers.get('set-cookie') || ''), 'Session cookie is HttpOnly and SameSite');
  assert((await a('POST', '/api/auth/otp/verify', { phone: '9876500001', code: '123456' })).status === 401, 'A code works only once');

  console.log('\n--- Saved data ---');
  const saveRes = await a('PUT', '/api/me/state', { data: { userProfile: { fullName: 'Asha', age: 58, heightCm: 160, weightKg: 58, healthConditions: ['thyroid'] }, chatHistory: [{ text: 'private' }], scans: [{ id: 's1', date: '2026-01-10', spine: -2.7, neck: -2.1, hip: null }], labs: [{ id: 'l1', date: '2026-01-10', vit_d: 18 }] } });
  assert(saveRes.status === 200, 'Saves the app data');
  const me = await a('GET', '/api/me');
  assert(me.json.state.userProfile.fullName === 'Asha' && !me.json.state.chatHistory, 'Data comes back, without chat history (chats stay on the phone)');
  assert((await a('POST', '/api/auth/otp/send', { phone: '9876500001' }, { Origin: 'https://evil.example' })).status === 403, 'Requests from other websites are blocked');

  console.log('\n--- History ---');
  const today = istDay();
  const yesterday = addDays(today, -1);
  const meals = done => ['m_breakfast', 'm_lunch', 'm_snack', 'm_dinner', 'm_sun_d3'].map((slot, i) => ({ slot, name: `Meal ${i}`, done: i < done }));
  const moves = done => ['a', 'b', 'c'].map((id, i) => ({ id, name: `Move ${i}`, done: i < done }));
  const put = await a('PUT', '/api/me/days', { days: [{ day: yesterday, meals: meals(5), moves: moves(3), score: 88 }, { day: today, meals: meals(2), moves: moves(0), score: 30 }, { day: 'not-a-day', meals: [], moves: [] }] });
  assert(put.status === 200 && put.json.saved === 2, 'Saves valid days and skips bad ones');
  const days = (await a('GET', `/api/me/days?from=${addDays(today, -7)}&to=${today}`)).json.days;
  assert(days.length === 2 && days[0].status === 'complete' && days[1].status === 'partial', 'Each day comes back with its status');
  assert(days[0].meals[0].name === 'Meal 0' && days[0].moves.length === 3, 'Each day keeps what was eaten and which moves were done');
  await a('PUT', '/api/me/days', { days: [{ day: today, meals: meals(5), moves: moves(1), score: 60 }] });
  const updated = (await a('GET', `/api/me/days?from=${today}&to=${today}`)).json.days[0];
  assert(updated.dietDone === 5 && updated.movesDone === 1, 'Saving the same day again updates it');

  console.log('\n--- Privacy between users ---');
  const b = client(base);
  await login(b, '9876500002');
  const bMe = await b('GET', '/api/me');
  assert(bMe.json.state === null && (await b('GET', `/api/me/days?from=${yesterday}&to=${today}`)).json.days.length === 0, 'Another user sees none of the first user’s data');
  assert((await b('GET', '/api/admin/users')).status === 401, 'A normal user cannot open the admin API');

  console.log('\n--- Admin ---');
  const adm = client(base);
  await adm('POST', '/api/auth/otp/send', { phone: ADMIN });
  assert((await adm('POST', '/api/admin/login', { phone: ADMIN, code: '123456', pin: 'wrong' })).status === 401, 'Admin login needs the right PIN');
  assert((await adm('POST', '/api/admin/login', { phone: '9876500001', code: '123456', pin: PIN })).status === 401, 'Only the admin number can log in to the portal');
  const admLogin = await adm('POST', '/api/admin/login', { phone: ADMIN, code: '123456', pin: PIN });
  assert(admLogin.status === 200, 'Admin logs in with number, code and PIN');
  const overview = (await adm('GET', '/api/admin/overview')).json;
  assert(overview.totals.users === 2 && overview.testMode === true, 'Overview counts users and shows test mode is on');
  const users = (await adm('GET', '/api/admin/users')).json.users;
  const asha = users.find(u => u.phone === '9876500001');
  assert(asha && asha.name === 'Asha' && asha.streak === 2 && asha.profile.lowestTScore === -2.7 && asha.profile.bmi === 22.7, 'User list shows name, streak and health summary');
  assert(asha.week.diet > 0 && asha.today === 'partial', 'User list shows diet follow-through and today’s status');
  const detail = (await adm('GET', `/api/admin/users/${asha.id}`)).json;
  assert(detail.days.length === 2 && detail.days[1].meals.length === 5, 'User detail shows their day-by-day history');
  await a('PUT', '/api/me/state', { data: { userProfile: { fullName: '=HYPERLINK("x")' } } });
  const csv = await adm('GET', '/api/admin/users.csv');
  assert(csv.status === 200 && /text\/csv/.test(csv.headers.get('content-type')) && csv.text.includes(`"'=HYPERLINK(""x"")"`), 'CSV export works and neutralises spreadsheet formulas');
  const audit = (await adm('GET', '/api/admin/audit')).json.entries;
  assert(audit.some(e => e.action === 'view_user' && e.target_user_id === asha.id) && audit.some(e => e.action === 'export_csv'), 'Admin views and exports are logged');

  console.log('\n--- Logout & delete ---');
  await b('POST', '/api/auth/logout', {});
  assert((await b('GET', '/api/me')).status === 401, 'Logout ends the session');
  assert((await a('DELETE', '/api/me')).status === 200, 'User can delete their account');
  assert(!(await adm('GET', '/api/admin/users')).json.users.some(u => u.phone === '9876500001'), 'Deleted account and its data are gone');

  console.log('\n--- Abuse limits ---');
  const c = client(base);
  let last;
  for (let i = 0; i < 6; i++) last = await c('POST', '/api/auth/otp/send', { phone: '9876500003' });
  assert(last.status === 429, 'Too many code requests for one number are blocked');
  await c('POST', '/api/auth/otp/send', { phone: '9876500004' });
  for (let i = 0; i < 5; i++) await c('POST', '/api/auth/otp/verify', { phone: '9876500004', code: '000000' });
  const locked = await c('POST', '/api/auth/otp/verify', { phone: '9876500004', code: '123456' });
  assert(locked.status === 401 && locked.json.error === 'too_many_attempts', 'Five wrong codes lock that code');

  console.log('\n--- Multi-Admin Management & Role Access ---');
  // 1. Master admin logs in via username and password
  const masterAdm = client(base);
  const mLogin = await masterAdm('POST', '/api/admin/login', { username: 'boneadmin', password: PIN });
  assert(mLogin.status === 200 && mLogin.json.admin.isMaster === true, 'Master admin logs in with username and password');

  const masterMe = await masterAdm('GET', '/api/admin/me');
  assert(masterMe.status === 200 && masterMe.json.isMaster === true, 'Master admin /api/admin/me returns isMaster: true');

  // 2. Validation tests for adding admin
  assert((await masterAdm('POST', '/api/admin/admins', { username: 'ab', password: 'Password123', confirmPassword: 'Password123' })).status === 400, 'Rejects username < 3 characters');
  assert((await masterAdm('POST', '/api/admin/admins', { username: 'dr_sharma', password: '123', confirmPassword: '123' })).status === 400, 'Rejects password < 6 characters');
  assert((await masterAdm('POST', '/api/admin/admins', { username: 'dr_sharma', password: 'Password123', confirmPassword: 'WrongPassword' })).status === 400, 'Rejects mismatched confirm password');
  assert((await masterAdm('POST', '/api/admin/admins', { username: 'boneadmin', password: 'Password123', confirmPassword: 'Password123' })).status === 400, 'Rejects reserved master username');

  // 3. Create valid sub-admin
  const createSub = await masterAdm('POST', '/api/admin/admins', { username: 'dr_sharma', password: 'DocPassword@2026', confirmPassword: 'DocPassword@2026' });
  assert(createSub.status === 201 && createSub.json.admin.username === 'dr_sharma' && createSub.json.admin.role === 'admin', 'Master admin creates sub-admin dr_sharma');

  // 4. Duplicate username rejected
  assert((await masterAdm('POST', '/api/admin/admins', { username: 'dr_sharma', password: 'DocPassword@2026', confirmPassword: 'DocPassword@2026' })).status === 400, 'Rejects duplicate username');

  // 5. List admins as master
  const adminList = (await masterAdm('GET', '/api/admin/admins')).json.admins;
  assert(adminList.length >= 2 && adminList.some(a => a.username === 'dr_sharma') && adminList.some(a => a.role === 'master'), 'Admins list includes master admin and created sub-admin');

  // 6. Sub-admin logs in with credentials
  const subAdm = client(base);
  assert((await subAdm('POST', '/api/admin/login', { username: 'dr_sharma', password: 'wrong_password' })).status === 401, 'Sub-admin login rejects wrong password');
  const subLogin = await subAdm('POST', '/api/admin/login', { username: 'dr_sharma', password: 'DocPassword@2026' });
  assert(subLogin.status === 200 && subLogin.json.admin.role === 'admin' && subLogin.json.admin.isMaster === false, 'Sub-admin logs in successfully with role admin');

  // 7. Sub-admin can access everything else
  const subMe = await subAdm('GET', '/api/admin/me');
  assert(subMe.status === 200 && subMe.json.isMaster === false, 'Sub-admin /api/admin/me returns isMaster: false');
  assert((await subAdm('GET', '/api/admin/overview')).status === 200, 'Sub-admin has access to Overview');
  assert((await subAdm('GET', '/api/admin/users')).status === 200, 'Sub-admin has access to Users');
  assert((await subAdm('GET', '/api/admin/audit')).status === 200, 'Sub-admin has access to Audits');

  // 8. Sub-admin is BLOCKED from Add Admin tab API
  assert((await subAdm('GET', '/api/admin/admins')).status === 403, 'Sub-admin is FORBIDDEN from viewing admins list');
  assert((await subAdm('POST', '/api/admin/admins', { username: 'hacker', password: 'Password123', confirmPassword: 'Password123' })).status === 403, 'Sub-admin is FORBIDDEN from creating admins');

  // 9. Master admin revokes/deletes sub-admin
  const toDel = adminList.find(a => a.username === 'dr_sharma');
  assert((await masterAdm('DELETE', `/api/admin/admins/${toDel.id}`)).status === 200, 'Master admin can delete/revoke sub-admin');
  assert((await subAdm('POST', '/api/admin/login', { username: 'dr_sharma', password: 'DocPassword@2026' })).status === 401, 'Revoked sub-admin cannot login anymore');

  server.close();
  const noSms = createServer({ dataDir: fs.mkdtempSync(path.join(os.tmpdir(), 'bonesip-test-')), env: {} });
  await new Promise(r => noSms.listen(0, '127.0.0.1', r));
  const d = client(`http://127.0.0.1:${noSms.address().port}`);
  assert((await d('POST', '/api/auth/otp/send', { phone: '9876500005' })).status === 503, 'Without test mode or SMS, login is switched off');
  assert((await d('GET', '/api/admin/me')).status === 401, 'Without ADMIN_PHONE/PIN nobody is admin');
  noSms.close();

  console.log(`\n🏁 ACCOUNTS TESTS: ${pass} Passed, ${fail} Failed`);
  process.exit(fail ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
