'use strict';
/**
 * Daily reminder push notifications (Web Push, no dependencies).
 *
 * The page can only show reminders while it is open, so the server sends them:
 * each phone that turns reminders on registers its push subscription here, and
 * a timer sends the 7:00 / 8:00 / 13:00 / 16:30 / 19:30 reminders in that
 * phone's own time zone and language, even when the app is closed.
 *
 *   GET  /api/push/key                                → { publicKey }
 *   POST /api/push/subscribe   { subscription, lang, tz }
 *   POST /api/push/unsubscribe { endpoint }
 *   POST /api/push/test        { endpoint }           → sends one reminder now
 *
 * Environment (optional): VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (base64url) and
 * VAPID_SUBJECT. Without keys, a pair is generated once and kept in
 * DATA_DIR/vapid.json; keep that file, or every phone has to turn reminders on again.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Notifs = require('../js/notifications.js');

const CATCH_UP_MINUTES = 30;          // a reminder is still sent up to 30 min late (e.g. after a restart)
const TICK_MS = 30 * 1000;
const PUSH_TTL_SECONDS = 30 * 60;     // a reminder older than 30 min is useless, let the push service drop it
const SUBS_PER_IP_HOUR = 20;
const TEST_GAP_MS = 20 * 1000;
// Only real browser push services, so the server never posts to arbitrary URLs.
const PUSH_HOSTS = /(^|\.)(googleapis\.com|mozilla\.com|mozaws\.net|windows\.com|push\.apple\.com)$/;

const b64url = buf => Buffer.from(buf).toString('base64url');
const fromB64url = s => Buffer.from(String(s || ''), 'base64url');

// ---------------------------------------------------------------------------
// VAPID keys
// ---------------------------------------------------------------------------
function loadVapidKeys(env, dataDir) {
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    return { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY };
  }
  const file = path.join(dataDir, 'vapid.json');
  try {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (saved.publicKey && saved.privateKey) return saved;
  } catch (e) { /* first run */ }
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const pub = publicKey.export({ format: 'jwk' });
  const keys = {
    publicKey: b64url(Buffer.concat([Buffer.from([4]), fromB64url(pub.x), fromB64url(pub.y)])),
    privateKey: privateKey.export({ format: 'jwk' }).d
  };
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(keys), { mode: 0o600 });
  return keys;
}

function vapidPrivateKeyObject(keys) {
  const pub = fromB64url(keys.publicKey);
  return crypto.createPrivateKey({
    format: 'jwk',
    key: { kty: 'EC', crv: 'P-256', x: b64url(pub.subarray(1, 33)), y: b64url(pub.subarray(33, 65)), d: keys.privateKey }
  });
}

function vapidAuthHeader(endpoint, keys, keyObject, subject) {
  const header = b64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = b64url(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject
  }));
  const signature = crypto.sign('sha256', Buffer.from(`${header}.${claims}`), { key: keyObject, dsaEncoding: 'ieee-p1363' });
  return `vapid t=${header}.${claims}.${b64url(signature)}, k=${keys.publicKey}`;
}

// ---------------------------------------------------------------------------
// Payload encryption (RFC 8291, aes128gcm content coding of RFC 8188)
// ---------------------------------------------------------------------------
function encryptPayload(plaintext, p256dh, auth) {
  const uaPublic = fromB64url(p256dh);
  const authSecret = fromB64url(auth);
  if (uaPublic.length !== 65 || authSecret.length !== 16) throw new Error('bad subscription keys');

  const ecdh = crypto.createECDH('prime256v1');
  const asPublic = ecdh.generateKeys();
  const shared = ecdh.computeSecret(uaPublic);
  const salt = crypto.randomBytes(16);

  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), uaPublic, asPublic]);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', shared, authSecret, keyInfo, 32));
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12));

  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(plaintext), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);

  const header = Buffer.alloc(21);
  salt.copy(header, 0);
  header.writeUInt32BE(4096, 16);
  header.writeUInt8(asPublic.length, 20);
  return Buffer.concat([header, asPublic, body]);
}

// ---------------------------------------------------------------------------
// Time zone helpers
// ---------------------------------------------------------------------------
function validTimeZone(tz) {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return null;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; } catch (e) { return null; }
}

// Local date and minutes-after-midnight for a time zone.
function localClock(tz, now = new Date()) {
  const parts = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(now).forEach(p => { parts[p.type] = p.value; });
  return { day: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

// Reminders that are due now (0–30 min after their time) for this clock.
function dueSlots(clock) {
  return Notifs.SCHEDULE.filter(item => {
    const diff = clock.minutes - (item.targetHour * 60 + item.targetMinute);
    return diff >= 0 && diff <= CATCH_UP_MINUTES;
  });
}

function reminderPayload(slotId, lang) {
  const item = Notifs.SCHEDULE.find(s => s.id === slotId);
  const copy = Notifs.getCopy(slotId, lang);
  return {
    title: copy.title,
    body: copy.body,
    tag: 'bonesip-' + slotId,
    data: { url: './?slot=' + encodeURIComponent(item.slot), slot: item.slot, pillar: item.pillar }
  };
}

// ---------------------------------------------------------------------------
function createPush({ db, env = {}, dataDir, fetchImpl = globalThis.fetch }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint    TEXT PRIMARY KEY,
      p256dh      TEXT NOT NULL,
      auth        TEXT NOT NULL,
      lang        TEXT NOT NULL DEFAULT 'en',
      tz          TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS push_sent (
      endpoint  TEXT NOT NULL,
      day       TEXT NOT NULL,
      slot      TEXT NOT NULL,
      PRIMARY KEY (endpoint, day, slot)
    );
  `);

  const keys = loadVapidKeys(env, dataDir);
  const keyObject = vapidPrivateKeyObject(keys);
  const subject = env.VAPID_SUBJECT || 'https://bonesip.com';

  const q = {
    upsert: db.prepare(`INSERT INTO push_subscriptions (endpoint, p256dh, auth, lang, tz, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, lang = excluded.lang, tz = excluded.tz, updated_at = excluded.updated_at`),
    remove: db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?'),
    removeSent: db.prepare('DELETE FROM push_sent WHERE endpoint = ?'),
    get: db.prepare('SELECT * FROM push_subscriptions WHERE endpoint = ?'),
    all: db.prepare('SELECT * FROM push_subscriptions'),
    count: db.prepare('SELECT COUNT(*) AS n FROM push_subscriptions'),
    markSent: db.prepare('INSERT OR IGNORE INTO push_sent (endpoint, day, slot) VALUES (?, ?, ?)'),
    pruneSent: db.prepare('DELETE FROM push_sent WHERE day < ?')
  };

  const subsByIp = new Map();
  const lastTest = new Map();

  function json(status, body) {
    return { status, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } };
  }

  function cleanEndpoint(endpoint) {
    if (typeof endpoint !== 'string' || endpoint.length > 1024) return null;
    try {
      const url = new URL(endpoint);
      return url.protocol === 'https:' && PUSH_HOSTS.test(url.hostname) ? url.href : null;
    } catch (e) { return null; }
  }

  async function send(sub, payload) {
    const res = await fetchImpl(sub.endpoint, {
      method: 'POST',
      headers: {
        Authorization: vapidAuthHeader(sub.endpoint, keys, keyObject, subject),
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: String(PUSH_TTL_SECONDS),
        Urgency: 'high'
      },
      body: encryptPayload(JSON.stringify(payload), sub.p256dh, sub.auth)
    });
    // 404/410: the phone unsubscribed or the app was uninstalled.
    if (res.status === 404 || res.status === 410) {
      q.remove.run(sub.endpoint);
      q.removeSent.run(sub.endpoint);
    } else if (!res.ok) {
      console.warn(`push: ${new URL(sub.endpoint).host} answered ${res.status}`);
    }
    return res.status;
  }

  async function tick(now = new Date()) {
    const jobs = [];
    for (const sub of q.all.all()) {
      const clock = localClock(validTimeZone(sub.tz) || 'Asia/Kolkata', now);
      for (const item of dueSlots(clock)) {
        // Mark first: a slow or failed send is never retried into a duplicate reminder.
        if (q.markSent.run(sub.endpoint, clock.day, item.id).changes === 0) continue;
        jobs.push(send(sub, reminderPayload(item.id, sub.lang)).catch(err => console.warn('push send failed:', err.message)));
      }
    }
    await Promise.all(jobs);
    q.pruneSent.run(new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10));
    return jobs.length;
  }

  let timer = null;
  function start() {
    if (timer) return;
    timer = setInterval(() => { tick().catch(err => console.warn('push tick failed:', err.message)); }, TICK_MS);
    timer.unref();
    tick().catch(err => console.warn('push tick failed:', err.message));
  }
  function stop() { clearInterval(timer); timer = null; }

  async function handle({ method, pathname, ip, body }) {
    if (pathname === '/api/push/key' && method === 'GET') return json(200, { publicKey: keys.publicKey });

    if (pathname === '/api/push/subscribe' && method === 'POST') {
      const sub = body && body.subscription;
      const endpoint = cleanEndpoint(sub && sub.endpoint);
      const p256dh = sub && sub.keys && sub.keys.p256dh;
      const auth = sub && sub.keys && sub.keys.auth;
      if (!endpoint || fromB64url(p256dh).length !== 65 || fromB64url(auth).length !== 16) return json(400, { error: 'bad_subscription' });
      if (!q.get.get(endpoint)) {
        const hour = Math.floor(Date.now() / 3600000);
        const seen = subsByIp.get(ip);
        const count = seen && seen.hour === hour ? seen.count : 0;
        if (count >= SUBS_PER_IP_HOUR) return json(429, { error: 'too_many_requests' });
        subsByIp.set(ip, { hour, count: count + 1 });
      }
      const lang = Notifs.I18N_NOTIFS[body.lang] ? body.lang : 'en';
      const tz = validTimeZone(body.tz) || 'Asia/Kolkata';
      const now = new Date().toISOString();
      const isNew = !q.get.get(endpoint);
      q.upsert.run(endpoint, p256dh, auth, lang, tz, now, now);
      // A phone that just turned reminders on is not sent the one whose time passed a few minutes ago.
      if (isNew) {
        const clock = localClock(tz);
        dueSlots(clock).forEach(item => q.markSent.run(endpoint, clock.day, item.id));
      }
      return json(200, { subscribed: true });
    }

    if (pathname === '/api/push/unsubscribe' && method === 'POST') {
      const endpoint = cleanEndpoint(body && body.endpoint);
      if (endpoint) { q.remove.run(endpoint); q.removeSent.run(endpoint); }
      return json(200, { subscribed: false });
    }

    if (pathname === '/api/push/test' && method === 'POST') {
      const endpoint = cleanEndpoint(body && body.endpoint);
      const sub = endpoint && q.get.get(endpoint);
      if (!sub) return json(404, { error: 'not_subscribed' });
      if (Date.now() - (lastTest.get(endpoint) || 0) < TEST_GAP_MS) return json(429, { error: 'too_many_requests' });
      lastTest.set(endpoint, Date.now());
      const welcome = Notifs.getCopy('welcome', sub.lang);
      const status = await send(sub, { title: welcome.title, body: welcome.body, tag: 'bonesip-test', data: { url: './', slot: 'all', pillar: 'build' } });
      return json(status >= 200 && status < 300 ? 200 : 502, { sent: status >= 200 && status < 300, status });
    }

    return null;
  }

  return { handle, tick, start, stop, publicKey: keys.publicKey, subscriberCount: () => q.count.get().n };
}

module.exports = { createPush, encryptPayload, localClock, dueSlots, reminderPayload };
