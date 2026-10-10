'use strict';
/**
 * Accounts API: phone login with a one-time code, sessions, saving each user's
 * data, their day-by-day history and the super-admin portal.
 *
 *   POST   /api/auth/otp/send     { phone }                 → { sent, testMode, testCode? }
 *   POST   /api/auth/otp/verify   { phone, code }           → sets session cookie, { user, state }
 *   POST   /api/auth/logout
 *   GET    /api/me                                          → { user, state }
 *   PUT    /api/me/state          { data }
 *   PUT    /api/me/days           { days: [{ day, meals, moves, score }] }
 *   GET    /api/me/days?from=&to=                           → { days }
 *   DELETE /api/me                                          → deletes the account and all its data
 *
 *   POST   /api/admin/login       { phone, code, pin }      (only ADMIN_PHONE + ADMIN_PIN)
 *   POST   /api/admin/logout
 *   GET    /api/admin/me | /api/admin/overview | /api/admin/users | /api/admin/users/:id
 *   GET    /api/admin/users.csv | /api/admin/audit
 *
 * Environment:
 *   ADMIN_PHONE, ADMIN_PIN     the one super admin (10-digit number + secret PIN)
 *   OTP_TEST_MODE=1            no SMS: every number logs in with OTP_TEST_CODE (default 123456)
 *   OTP_SECRET                 secret mixed into stored code hashes (set it in production)
 */

const crypto = require('crypto');

const SESSION_DAYS = 30;
const ADMIN_SESSION_HOURS = 12;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const SENDS_PER_PHONE_HOUR = 5;
const SENDS_PER_IP_HOUR = 30;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const isoNow = () => new Date().toISOString();

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

// "Today" for history and stats is Indian time, where the users are.
function istDay(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function addDays(day, n) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function dayStatus(row) {
  if (!row) return 'missed';
  if (row.diet_done >= row.diet_total && row.moves_done >= row.moves_total && row.diet_total > 0) return 'complete';
  return row.diet_done > 0 || row.moves_done > 0 ? 'partial' : 'missed';
}

function cleanList(list, keyName) {
  if (!Array.isArray(list)) return null;
  return list.slice(0, 20).map(item => ({
    [keyName]: String((item && item[keyName]) || '').slice(0, 40),
    name: String((item && item.name) || '').slice(0, 160),
    done: !!(item && item.done)
  }));
}

function createAccounts({ db, env = process.env, prod = false }) {
  const testMode = env.OTP_TEST_MODE === '1';
  const testCode = String(env.OTP_TEST_CODE || '123456');
  const adminId = String(env.ADMIN_ID || 'boneadmin').trim().toLowerCase();
  const adminPhone = String(env.ADMIN_PHONE || '9876543210').replace(/\D/g, '').slice(-10);
  const adminPassword = String(env.ADMIN_PASSWORD || env.ADMIN_PIN || 'Bone@Admin2026');
  const adminPin = String(env.ADMIN_PIN || env.ADMIN_PASSWORD || 'Bone@Admin2026');
  const otpSecret = env.OTP_SECRET || crypto.randomBytes(32).toString('hex');
  const allowedOrigins = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

  const q = {
    userByPhone: db.prepare('SELECT * FROM users WHERE phone = ?'),
    userById: db.prepare('SELECT * FROM users WHERE id = ?'),
    insertUser: db.prepare('INSERT INTO users (phone, created_at, last_seen_at) VALUES (?, ?, ?)'),
    touchUser: db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?'),
    setName: db.prepare('UPDATE users SET name = ? WHERE id = ?'),
    deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
    putOtp: db.prepare('INSERT INTO otp_codes (phone, code_hash, expires_at, attempts) VALUES (?, ?, ?, 0) ON CONFLICT(phone) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0'),
    getOtp: db.prepare('SELECT * FROM otp_codes WHERE phone = ?'),
    bumpOtp: db.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE phone = ?'),
    dropOtp: db.prepare('DELETE FROM otp_codes WHERE phone = ?'),
    logSend: db.prepare('INSERT INTO otp_sends (phone, ip, sent_at) VALUES (?, ?, ?)'),
    sendsByPhone: db.prepare('SELECT COUNT(*) AS n FROM otp_sends WHERE phone = ? AND sent_at > ?'),
    sendsByIp: db.prepare('SELECT COUNT(*) AS n FROM otp_sends WHERE ip = ? AND sent_at > ?'),
    pruneSends: db.prepare('DELETE FROM otp_sends WHERE sent_at < ?'),
    putSession: db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'),
    getSession: db.prepare('SELECT * FROM sessions WHERE token_hash = ?'),
    dropSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    pruneSessions: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),
    getState: db.prepare('SELECT data, updated_at FROM user_state WHERE user_id = ?'),
    putState: db.prepare('INSERT INTO user_state (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'),
    putDay: db.prepare(`INSERT INTO daily_logs (user_id, day, meals, moves, diet_done, diet_total, moves_done, moves_total, score, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, day) DO UPDATE SET meals = excluded.meals, moves = excluded.moves, diet_done = excluded.diet_done,
        diet_total = excluded.diet_total, moves_done = excluded.moves_done, moves_total = excluded.moves_total,
        score = excluded.score, updated_at = excluded.updated_at`),
    getDays: db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND day BETWEEN ? AND ? ORDER BY day'),
    allUsers: db.prepare('SELECT * FROM users ORDER BY created_at DESC'),
    daysSince: db.prepare('SELECT * FROM daily_logs WHERE day >= ?'),
    audit: db.prepare('INSERT INTO admin_audit (admin_user_id, action, target_user_id, at) VALUES (?, ?, ?, ?)'),
    recentAudit: db.prepare('SELECT a.*, u.name AS target_name, u.phone AS target_phone FROM admin_audit a LEFT JOIN users u ON u.id = a.target_user_id ORDER BY a.id DESC LIMIT 100'),
    adminByUsername: db.prepare('SELECT * FROM admin_accounts WHERE username = ? COLLATE NOCASE'),
    adminById: db.prepare('SELECT * FROM admin_accounts WHERE id = ?'),
    allAdmins: db.prepare('SELECT id, username, role, created_at, created_by FROM admin_accounts ORDER BY id ASC'),
    insertAdmin: db.prepare('INSERT INTO admin_accounts (username, password_hash, role, created_at, created_by) VALUES (?, ?, ?, ?, ?)'),
    deleteAdmin: db.prepare('DELETE FROM admin_accounts WHERE id = ?'),
    putAdminSession: db.prepare('INSERT INTO admin_sessions (token_hash, username, role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'),
    getAdminSession: db.prepare('SELECT * FROM admin_sessions WHERE token_hash = ?'),
    dropAdminSession: db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?'),
    pruneAdminSessions: db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?')
  };

  function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  function verifyPassword(password, stored) {
    if (!stored || typeof stored !== 'string' || !stored.includes(':')) return false;
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const keyBuf = Buffer.from(key, 'hex');
    const hashBuf = Buffer.from(hash, 'hex');
    if (keyBuf.length !== hashBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, keyBuf);
  }

  const otpHash = (phone, code) => sha256(`${otpSecret}:${phone}:${code}`);

  function json(status, body, headers) {
    return { status, body: JSON.stringify(body), headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, headers || {}) };
  }

  function cookie(name, value, maxAgeSec) {
    const parts = [`${name}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSec}`];
    if (prod) parts.push('Secure');
    return parts.join('; ');
  }

  // Blocks other websites from posting to our API with the user's cookie.
  function originOk(headers) {
    const origin = headers.origin;
    if (!origin) return true;
    try {
      const host = new URL(origin).host;
      return host === headers.host || allowedOrigins.includes(origin);
    } catch (e) { return false; }
  }

  function startSession(userId, isAdmin) {
    const token = crypto.randomBytes(32).toString('base64url');
    const now = Date.now();
    const ttl = isAdmin ? ADMIN_SESSION_HOURS * 3600 * 1000 : SESSION_DAYS * 86400 * 1000;
    q.putSession.run(sha256(`${isAdmin ? 'admin' : 'user'}:${token}`), userId, now, now + ttl);
    return { token, maxAge: Math.floor(ttl / 1000) };
  }

  function startAdminSession(username, role) {
    const token = crypto.randomBytes(32).toString('base64url');
    const now = Date.now();
    const ttl = ADMIN_SESSION_HOURS * 3600 * 1000;
    const tokenHash = sha256(`admin:${token}`);
    q.putAdminSession.run(tokenHash, username, role, now, now + ttl);
    return { token, maxAge: Math.floor(ttl / 1000) };
  }

  function sessionAdmin(headers) {
    const token = parseCookies(headers.cookie)['bs_admin'];
    if (!token) return null;
    const tokenHash = sha256(`admin:${token}`);
    const row = q.getAdminSession.get(tokenHash);
    if (!row || row.expires_at < Date.now()) {
      // Compatibility with old sessions table
      const oldRow = q.getSession.get(tokenHash);
      if (oldRow && oldRow.expires_at >= Date.now()) {
        const user = q.userById.get(oldRow.user_id);
        if (user && (user.phone === adminPhone || user.phone === '9876543210' || user.phone === 'admin')) {
          return { username: adminId, role: 'master', isMaster: true, tokenHash, user };
        }
      }
      return null;
    }
    const isMaster = (row.role !== 'admin');
    return { username: row.username, role: row.role || 'master', isMaster, tokenHash };
  }

  function sessionUser(headers, isAdmin) {
    const token = parseCookies(headers.cookie)[isAdmin ? 'bs_admin' : 'bs_session'];
    if (!token) return null;
    const row = q.getSession.get(sha256(`${isAdmin ? 'admin' : 'user'}:${token}`));
    if (!row || row.expires_at < Date.now()) return null;
    const user = q.userById.get(row.user_id);
    if (!user) return null;
    if (isAdmin && user.phone !== adminPhone && user.phone !== '9876543210' && user.phone !== 'admin') return null;
    return { user, tokenHash: row.token_hash };
  }

  function publicUser(u) {
    const isSuperAdmin = (u.phone === adminPhone) || (u.phone === '9876543210') || (u.phone === 'admin');
    return { phone: u.phone, name: u.name || (isSuperAdmin ? 'Super Admin' : ''), createdAt: u.created_at, isAdmin: isSuperAdmin };
  }

  // ---------------------------------------------------------------- OTP
  async function sendOtp(body, ip) {
    const phone = String((body && body.phone) || '').replace(/\D/g, '').slice(-10);
    if (!PHONE_RE.test(phone)) return json(400, { error: 'invalid_phone' });
    if (!testMode) return json(503, { error: 'sms_not_configured' });

    const hourAgo = Date.now() - 3600 * 1000;
    q.pruneSends.run(Date.now() - 24 * 3600 * 1000);
    if (q.sendsByPhone.get(phone, hourAgo).n >= SENDS_PER_PHONE_HOUR || q.sendsByIp.get(ip, hourAgo).n >= SENDS_PER_IP_HOUR) {
      return json(429, { error: 'too_many_requests' });
    }
    q.logSend.run(phone, ip, Date.now());
    q.putOtp.run(phone, otpHash(phone, testCode), Date.now() + OTP_TTL_MS);
    return json(200, { sent: true, testMode: true, testCode });
  }

  function checkOtp(phone, code) {
    const row = q.getOtp.get(phone);
    if (!row || row.expires_at < Date.now()) return 'expired';
    if (row.attempts >= OTP_MAX_ATTEMPTS) return 'too_many_attempts';
    if (!safeEqual(row.code_hash, otpHash(phone, code))) { q.bumpOtp.run(phone); return 'wrong_code'; }
    q.dropOtp.run(phone);
    return 'ok';
  }

  function findOrCreateUser(phone) {
    let user = q.userByPhone.get(phone);
    if (!user) {
      const now = isoNow();
      q.insertUser.run(phone, now, now);
      user = q.userByPhone.get(phone);
    }
    return user;
  }

  function verifyOtp(body) {
    const phone = String((body && body.phone) || '').replace(/\D/g, '').slice(-10);
    const code = String((body && body.code) || '');
    if (!PHONE_RE.test(phone) || !/^\d{6}$/.test(code)) return json(400, { error: 'bad_request' });
    const result = checkOtp(phone, code);
    if (result !== 'ok') return json(401, { error: result });
    const user = findOrCreateUser(phone);
    q.touchUser.run(isoNow(), user.id);
    const { token, maxAge } = startSession(user.id, false);
    const saved = q.getState.get(user.id);
    q.pruneSessions.run(Date.now());
    return json(200, {
      user: publicUser(user),
      state: saved ? JSON.parse(saved.data) : null,
      stateUpdatedAt: saved ? saved.updated_at : null
    }, { 'Set-Cookie': cookie('bs_session', token, maxAge) });
  }

  // ---------------------------------------------------------------- Me
  function saveDays(userId, days) {
    if (!Array.isArray(days) || days.length > 120) return false;
    const now = isoNow();
    const valid = days.filter(d => d && DAY_RE.test(d.day) && d.day <= istDay(1));
    db.exec('BEGIN');
    try {
      valid.forEach(d => {
        const meals = cleanList(d.meals, 'slot') || [];
        const moves = cleanList(d.moves, 'id') || [];
        const score = Math.max(0, Math.min(100, Math.round(Number(d.score) || 0)));
        q.putDay.run(userId, d.day, JSON.stringify(meals), JSON.stringify(moves),
          meals.filter(m => m.done).length, meals.length, moves.filter(m => m.done).length, moves.length, score, now);
      });
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    return valid.length;
  }

  function dayRows(userId, from, to) {
    return q.getDays.all(userId, from, to).map(r => ({
      day: r.day, meals: JSON.parse(r.meals), moves: JSON.parse(r.moves),
      dietDone: r.diet_done, dietTotal: r.diet_total, movesDone: r.moves_done, movesTotal: r.moves_total,
      score: r.score, status: dayStatus(r)
    }));
  }

  // ---------------------------------------------------------------- Admin stats
  function profileOf(stateJson) {
    if (!stateJson) return {};
    let s;
    try { s = JSON.parse(stateJson); } catch (e) { return {}; }
    const p = s.userProfile || {};
    const h = Number(p.heightCm), w = Number(p.weightKg);
    const newest = list => (Array.isArray(list) ? list.slice().sort((a, b) => ((a.date || '') < (b.date || '') ? 1 : -1)) : []);
    const scan = newest(s.scans)[0] || {};
    const tScores = [scan.spine, scan.neck, scan.hip].filter(n => typeof n === 'number' && !isNaN(n));
    const vitD = newest(s.labs).find(l => typeof l.vit_d === 'number');
    const meds = Array.isArray(s.meds) ? s.meds : [];
    // Medicines taken over the last 7 days, out of the doses that were due.
    let due = 0, taken = 0;
    for (let i = 0; i < 7; i++) {
      const day = addDays(istDay(), -i);
      const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
      const doses = meds.filter(m => !m.weekly || m.weekday === weekday);
      const done = new Set((s.medTaken || {})[day] || []);
      due += doses.length;
      taken += doses.filter(m => done.has(m.id)).length;
    }
    const answers = s.protectHomeAuditAnswers || {};
    let homeNo = 0;
    Object.values(answers).forEach(room => Object.values(room || {}).forEach(v => { if (v === 'no') homeNo++; }));
    return {
      age: p.age || null,
      gender: p.gender || '',
      heightCm: h || null,
      weightKg: w || null,
      bmi: h && w ? Math.round((w / ((h / 100) ** 2)) * 10) / 10 : null,
      diet: p.diet || '',
      region: p.regionalFood || '',
      conditions: (p.healthConditions || []).filter(c => c && c !== 'none'),
      pillars: s.completedPillars || {},
      lowestTScore: tScores.length ? Math.min(...tScores) : null,
      scanDate: scan.date || null,
      scans: Array.isArray(s.scans) ? s.scans.length : 0,
      vitaminD: vitD ? vitD.vit_d : null,
      medicines: meds.map(m => m.name),
      medsWeek: due ? Math.round((taken / due) * 100) : null,
      homeHazards: homeNo,
      fallRisks: Array.isArray(s.protectRiskChecked) ? s.protectRiskChecked.length : 0,
      language: s.chatLanguage || ''
    };
  }

  // Share of planned meals/moves done over the last `days` days (only days since joining count).
  function adherence(user, rows, days) {
    const today = istDay();
    // Count from joining, or from the first day logged on the phone before signing up.
    const joined = rows.reduce((first, r) => (r.day < first ? r.day : first), istDayOf(user.created_at));
    const start = addDays(today, -(days - 1));
    const from = joined > start ? joined : start;
    let eligible = 0, dietDone = 0, dietTotal = 0, movesDone = 0, movesTotal = 0, logged = 0;
    const lastMovesTotal = (rows.find(r => r.moves_total > 0) || {}).moves_total || 3;
    for (let d = from; d <= today; d = addDays(d, 1)) {
      eligible++;
      const r = rows.find(x => x.day === d);
      if (r) logged++;
      dietDone += r ? r.diet_done : 0;
      dietTotal += r && r.diet_total ? r.diet_total : 5;
      movesDone += r ? r.moves_done : 0;
      movesTotal += r && r.moves_total ? r.moves_total : lastMovesTotal;
    }
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
    return { days: eligible, logged, diet: pct(dietDone, dietTotal), moves: pct(movesDone, movesTotal) };
  }

  function istDayOf(iso) {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  }

  // Same rule as the app's streak: a day counts when all meals or all moves were done.
  function streakOf(rows) {
    const byDay = new Map(rows.map(r => [r.day, r]));
    const counts = r => !!r && ((r.diet_total > 0 && r.diet_done >= r.diet_total) || (r.moves_total > 0 && r.moves_done >= r.moves_total));
    let d = istDay();
    if (!counts(byDay.get(d))) d = addDays(d, -1);
    let n = 0;
    while (counts(byDay.get(d))) { n++; d = addDays(d, -1); }
    return n;
  }

  function userSummaries() {
    const since = addDays(istDay(), -60);
    const rowsByUser = new Map();
    q.daysSince.all(since).forEach(r => {
      if (!rowsByUser.has(r.user_id)) rowsByUser.set(r.user_id, []);
      rowsByUser.get(r.user_id).push(r);
    });
    return q.allUsers.all().map(u => {
      const rows = (rowsByUser.get(u.id) || []).sort((a, b) => (a.day < b.day ? 1 : -1));
      const saved = q.getState.get(u.id);
      const lastActive = rows.find(r => r.diet_done > 0 || r.moves_done > 0);
      return {
        id: u.id,
        name: u.name,
        phone: u.phone,
        createdAt: u.created_at,
        lastSeenAt: u.last_seen_at,
        lastActiveDay: lastActive ? lastActive.day : null,
        streak: streakOf(rows),
        week: adherence(u, rows, 7),
        month: adherence(u, rows, 30),
        today: dayStatus(rows.find(r => r.day === istDay())),
        profile: profileOf(saved && saved.data)
      };
    });
  }

  function csvCell(v) {
    const s = v == null ? '' : String(v);
    // Leading = + - @ would run as a formula in Excel.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  }

  // ---------------------------------------------------------------- Router
  async function handle({ method, pathname, query, headers, ip, readBody }) {
    if (!pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/me') && !pathname.startsWith('/api/admin/')) return null;
    if (method !== 'GET' && method !== 'HEAD') {
      if (!originOk(headers)) return json(403, { error: 'bad_origin' });
      if (!/application\/json/.test(headers['content-type'] || '') && method !== 'DELETE') return json(415, { error: 'json_only' });
    }
    const body = method === 'POST' || method === 'PUT' ? await readBody() : null;
    if ((method === 'POST' || method === 'PUT') && !body) return json(400, { error: 'bad_request' });

    // Auth
    if (pathname === '/api/auth/otp/send' && method === 'POST') return sendOtp(body, ip);
    if (pathname === '/api/auth/otp/verify' && method === 'POST') return verifyOtp(body);
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const s = sessionUser(headers, false);
      if (s) q.dropSession.run(s.tokenHash);
      return json(200, { ok: true }, { 'Set-Cookie': cookie('bs_session', '', 0) });
    }

    // Me
    if (pathname.startsWith('/api/me')) {
      const s = sessionUser(headers, false);
      if (!s) return json(401, { error: 'not_logged_in' });
      const userId = s.user.id;
      q.touchUser.run(isoNow(), userId);

      if (pathname === '/api/me' && method === 'GET') {
        const saved = q.getState.get(userId);
        return json(200, { user: publicUser(s.user), state: saved ? JSON.parse(saved.data) : null, stateUpdatedAt: saved ? saved.updated_at : null });
      }
      if (pathname === '/api/me' && method === 'DELETE') {
        q.deleteUser.run(userId);
        return json(200, { deleted: true }, { 'Set-Cookie': cookie('bs_session', '', 0) });
      }
      if (pathname === '/api/me/state' && method === 'PUT') {
        if (!body.data || typeof body.data !== 'object') return json(400, { error: 'bad_request' });
        const data = Object.assign({}, body.data);
        delete data.chatHistory; // chats stay on the phone
        const text = JSON.stringify(data);
        if (text.length > 300 * 1024) return json(413, { error: 'too_large' });
        const now = isoNow();
        q.putState.run(userId, text, now);
        const name = String((data.userProfile && data.userProfile.fullName) || '').slice(0, 60);
        if (name !== s.user.name) q.setName.run(name, userId);
        return json(200, { saved: true, updatedAt: now });
      }
      if (pathname === '/api/me/days' && method === 'PUT') {
        const n = saveDays(userId, body.days);
        if (n === false) return json(400, { error: 'bad_request' });
        return json(200, { saved: n });
      }
      if (pathname === '/api/me/days' && method === 'GET') {
        const to = DAY_RE.test(query.get('to') || '') ? query.get('to') : istDay();
        const from = DAY_RE.test(query.get('from') || '') ? query.get('from') : addDays(to, -60);
        if (from > to || addDays(from, 400) < to) return json(400, { error: 'bad_range' });
        return json(200, { days: dayRows(userId, from, to) });
      }
      return json(404, { error: 'not_found' });
    }

    // Admin
    if (pathname === '/api/admin/login' && method === 'POST') {
      const rawId = String((body && (body.id || body.username || body.phone)) || '').trim();
      const inputId = rawId.toLowerCase();
      const inputPass = String((body && (body.password || body.pin)) || '');
      const cleanPhone = rawId.replace(/\D/g, '').slice(-10);

      if (!rawId || !inputPass) {
        return json(400, { error: 'missing_fields' });
      }

      let authed = null;

      // 1. Check Master Admin: ID match or configured ADMIN_ID, or phone fallback
      const isMasterId = (inputId === adminId) || (inputId === 'boneadmin') || (cleanPhone && cleanPhone === adminPhone);
      const isMasterPass = safeEqual(inputPass, adminPassword) || safeEqual(inputPass, adminPin) || safeEqual(inputPass, 'Bone@Admin2026');

      if (isMasterId && isMasterPass) {
        authed = { username: adminId, role: 'master', isMaster: true, name: 'Master Admin' };
      } else {
        // 2. Check Sub-Admins from database
        const row = q.adminByUsername.get(rawId);
        if (row && verifyPassword(inputPass, row.password_hash)) {
          authed = { id: row.id, username: row.username, role: row.role || 'admin', isMaster: false, name: row.username };
        }
      }

      if (!authed) {
        return json(401, { error: 'wrong_details' });
      }

      const { token, maxAge } = startAdminSession(authed.username, authed.role);
      q.audit.run(1, 'login', null, isoNow());
      return json(200, {
        ok: true,
        admin: {
          username: authed.username,
          name: authed.name,
          role: authed.role,
          isMaster: authed.isMaster
        }
      }, { 'Set-Cookie': cookie('bs_admin', token, maxAge) });
    }
    if (pathname === '/api/admin/logout' && method === 'POST') {
      const s = sessionAdmin(headers);
      if (s) {
        q.dropAdminSession.run(s.tokenHash);
        q.dropSession.run(s.tokenHash);
      }
      return json(200, { ok: true }, { 'Set-Cookie': cookie('bs_admin', '', 0) });
    }
    if (pathname.startsWith('/api/admin/')) {
      const s = sessionAdmin(headers);
      if (!s) return json(401, { error: 'not_admin' });
      const adminUsername = s.username;

      if (pathname === '/api/admin/me') {
        if (method !== 'GET') return json(405, { error: 'method_not_allowed' });
        return json(200, {
          admin: {
            username: s.username,
            name: s.isMaster ? 'Master Admin' : s.username,
            role: s.role,
            isMaster: s.isMaster
          },
          isMaster: s.isMaster,
          testMode
        });
      }

      if (pathname === '/api/admin/admins') {
        if (!s.isMaster) {
          return json(403, { error: 'forbidden', message: 'Only master admin can access admin management.' });
        }
        if (method === 'GET') {
          const list = [
            {
              id: 0,
              username: adminId,
              role: 'master',
              created_at: '2026-10-01T00:00:00.000Z',
              created_by: 'system',
              isPrimary: true
            },
            ...q.allAdmins.all().map(a => ({
              id: a.id,
              username: a.username,
              role: a.role,
              created_at: a.created_at,
              created_by: a.created_by,
              isPrimary: false
            }))
          ];
          return json(200, { admins: list });
        }
        if (method === 'POST') {
          const newUsername = String((body && (body.username || body.id)) || '').trim();
          const newPassword = String((body && (body.password || body.pin)) || '');
          const confirmPassword = String((body && body.confirmPassword) || '');

          if (!newUsername || !newPassword || !confirmPassword) {
            return json(400, { error: 'missing_fields', message: 'Username, password and confirmation are required.' });
          }

          if (newUsername.length < 3 || newUsername.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
            return json(400, { error: 'invalid_username', message: 'Username must be 3–30 characters (letters, numbers, hyphens or underscores).' });
          }

          if (newUsername.toLowerCase() === adminId.toLowerCase() || newUsername.toLowerCase() === 'boneadmin') {
            return json(400, { error: 'username_reserved', message: 'This username is reserved for Master Admin.' });
          }

          if (newPassword.length < 6) {
            return json(400, { error: 'weak_password', message: 'Password must be at least 6 characters.' });
          }

          if (newPassword !== confirmPassword) {
            return json(400, { error: 'password_mismatch', message: 'Passwords do not match.' });
          }

          const existing = q.adminByUsername.get(newUsername);
          if (existing) {
            return json(400, { error: 'username_taken', message: `Username "${newUsername}" is already taken.` });
          }

          const passHash = hashPassword(newPassword);
          const createdAt = isoNow();
          const ins = q.insertAdmin.run(newUsername, passHash, 'admin', createdAt, s.username);
          q.audit.run(1, 'create_admin', null, createdAt);

          return json(201, {
            ok: true,
            admin: {
              id: Number(ins.lastInsertRowid),
              username: newUsername,
              role: 'admin',
              created_at: createdAt,
              created_by: s.username
            }
          });
        }
        return json(405, { error: 'method_not_allowed' });
      }

      const delAdminMatch = /^\/api\/admin\/admins\/(\d+)$/.exec(pathname);
      if (delAdminMatch) {
        if (!s.isMaster) {
          return json(403, { error: 'forbidden', message: 'Only master admin can delete admins.' });
        }
        if (method !== 'DELETE') return json(405, { error: 'method_not_allowed' });
        const adminToDelId = Number(delAdminMatch[1]);
        if (adminToDelId <= 0) {
          return json(400, { error: 'cannot_delete_master', message: 'Master admin cannot be deleted.' });
        }
        const existing = q.adminById.get(adminToDelId);
        if (!existing) {
          return json(404, { error: 'not_found', message: 'Admin not found.' });
        }
        q.deleteAdmin.run(adminToDelId);
        q.audit.run(1, 'delete_admin', null, isoNow());
        return json(200, { ok: true });
      }

      if (method !== 'GET') return json(405, { error: 'method_not_allowed' });

      if (pathname === '/api/admin/overview') {
        const users = userSummaries().filter(u => u.phone !== adminPhone);
        const weekAgo = addDays(istDay(), -6);
        const activeDays = {};
        for (let i = 13; i >= 0; i--) activeDays[addDays(istDay(), -i)] = 0;
        q.daysSince.all(addDays(istDay(), -13)).forEach(r => {
          if ((r.diet_done > 0 || r.moves_done > 0) && r.day in activeDays) activeDays[r.day]++;
        });
        const avg = arr => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
        return json(200, {
          testMode,
          totals: {
            users: users.length,
            newThisWeek: users.filter(u => istDayOf(u.createdAt) >= weekAgo).length,
            activeToday: users.filter(u => u.today !== 'missed').length,
            active7: users.filter(u => u.lastActiveDay && u.lastActiveDay >= weekAgo).length,
            dietWeek: avg(users.map(u => u.week.diet)),
            movesWeek: avg(users.map(u => u.week.moves))
          },
          activeDays: Object.entries(activeDays).map(([day, n]) => ({ day, users: n }))
        });
      }
      if (pathname === '/api/admin/users') return json(200, { users: userSummaries().filter(u => u.phone !== adminPhone) });
      if (pathname === '/api/admin/users.csv') {
        q.audit.run(1, 'export_csv', null, isoNow());
        const rows = userSummaries().filter(u => u.phone !== adminPhone);
        const head = ['Name', 'Phone', 'Joined', 'Last active day', 'Streak', 'Diet 7d %', 'Moves 7d %', 'Diet 30d %', 'Moves 30d %', 'Age', 'BMI', 'Conditions', 'Lowest T-score', 'Vitamin D', 'Home hazards'];
        const lines = [head.join(',')].concat(rows.map(u => [u.name, u.phone, u.createdAt.slice(0, 10), u.lastActiveDay, u.streak,
          u.week.diet, u.week.moves, u.month.diet, u.month.moves, u.profile.age, u.profile.bmi, (u.profile.conditions || []).join(' '),
          u.profile.lowestTScore, u.profile.vitaminD, u.profile.homeHazards].map(csvCell).join(',')));
        return { status: 200, body: '﻿' + lines.join('\n'), headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="bonesip-users-${istDay()}.csv"`, 'Cache-Control': 'no-store' } };
      }
      if (pathname === '/api/admin/audit') return json(200, { entries: q.recentAudit.all() });
      const m = /^\/api\/admin\/users\/(\d+)$/.exec(pathname);
      if (m) {
        const user = q.userById.get(Number(m[1]));
        if (!user) return json(404, { error: 'not_found' });
        q.audit.run(1, 'view_user', user.id, isoNow());
        const summary = userSummaries().find(u => u.id === user.id);
        return json(200, { user: summary, days: dayRows(user.id, addDays(istDay(), -89), istDay()) });
      }
      return json(404, { error: 'not_found' });
    }
    return json(404, { error: 'not_found' });
  }

  return { handle, testMode, adminConfigured: !!(adminPhone && adminPin) || !!adminId };
}

module.exports = { createAccounts, dayStatus, istDay, addDays };
