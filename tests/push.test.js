/**
 * Daily reminder push (server/push.js): subscribing, sending each reminder once
 * at its time in the phone's time zone, encryption and the VAPID signature.
 * Push services are faked, so nothing leaves this machine.
 *   node tests/push.test.js
 */
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { createPush, encryptPayload, localClock } = require('../server/push');

let pass = 0;
let fail = 0;
function assert(cond, name, details = '') {
  if (cond) { pass++; console.log(`  ✅ PASS: ${name}`); } else { fail++; console.error(`  ❌ FAIL: ${name}${details ? `\n       ${details}` : ''}`); }
}

// What a phone does with a push: undo the RFC 8291 encryption.
function decrypt(body, ua, authSecret) {
  const salt = body.subarray(0, 16);
  const idLen = body.readUInt8(20);
  const asPublic = body.subarray(21, 21 + idLen);
  const data = body.subarray(21 + idLen);
  const shared = ua.computeSecret(asPublic);
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), ua.getPublicKey(), asPublic]);
  const ikm = Buffer.from(crypto.hkdfSync('sha256', shared, authSecret, keyInfo, 32));
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12));
  const decipher = crypto.createDecipheriv('aes-128-gcm', cek, nonce);
  decipher.setAuthTag(data.subarray(data.length - 16));
  const plain = Buffer.concat([decipher.update(data.subarray(0, data.length - 16)), decipher.final()]);
  return plain.subarray(0, plain.lastIndexOf(2)).toString('utf8');
}

function fakePhone(endpoint) {
  const ua = crypto.createECDH('prime256v1');
  ua.generateKeys();
  const auth = crypto.randomBytes(16);
  return { ua, auth, subscription: { endpoint, keys: { p256dh: ua.getPublicKey().toString('base64url'), auth: auth.toString('base64url') } } };
}

// 2026-10-20 at hh:mm India time, as a Date.
const ist = (hh, mm) => new Date(Date.UTC(2026, 9, 20, hh, mm) - 330 * 60000);

(async () => {
  console.log('\n🔔 Daily reminder push');
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bonesip-push-'));
  const db = new DatabaseSync(path.join(dataDir, 'test.db'));
  const sent = [];
  let reply = 201;
  const fetchImpl = async (url, opts) => { sent.push({ url, opts }); return { status: reply, ok: reply < 300 }; };
  const push = createPush({ db, env: {}, dataDir, fetchImpl });

  const key = await push.handle({ method: 'GET', pathname: '/api/push/key' });
  const publicKey = JSON.parse(key.body).publicKey;
  assert(Buffer.from(publicKey, 'base64url').length === 65, 'serves a P-256 public key');
  assert(fs.existsSync(path.join(dataDir, 'vapid.json')), 'keeps the generated keys in DATA_DIR/vapid.json');
  assert(createPush({ db, env: {}, dataDir, fetchImpl }).publicKey === publicKey, 'reuses the same keys after a restart');

  const phone = fakePhone('https://fcm.googleapis.com/fcm/send/abc123');
  const sub = (body, ip = '1.1.1.1') => push.handle({ method: 'POST', pathname: '/api/push/subscribe', ip, body });

  assert((await sub({ subscription: Object.assign({}, phone.subscription, { endpoint: 'https://evil.example.com/x' }) })).status === 400, 'refuses endpoints that are not push services');
  assert((await sub({ subscription: Object.assign({}, phone.subscription, { endpoint: 'http://fcm.googleapis.com/x' }) })).status === 400, 'refuses plain http endpoints');
  assert((await sub({ subscription: { endpoint: phone.subscription.endpoint, keys: { p256dh: 'x', auth: 'y' } } })).status === 400, 'refuses bad keys');
  assert((await sub({ subscription: phone.subscription, lang: 'hi', tz: 'Asia/Kolkata' })).status === 200, 'subscribes a phone');
  assert(push.subscriberCount() === 1, 'stores one subscription');

  // Times in India.
  assert(await push.tick(ist(6, 59)) === 0, 'nothing before 7:00');
  assert(await push.tick(ist(7, 0)) === 1, '7:00 sends the sun & exercise reminder');
  assert(await push.tick(ist(7, 1)) === 0, 'it is not sent twice');
  const first = sent[sent.length - 1];
  assert(first.url === phone.subscription.endpoint, 'posts to the phone\'s push endpoint');
  assert(first.opts.headers['Content-Encoding'] === 'aes128gcm' && first.opts.headers.TTL === '1800', 'uses aes128gcm with a 30 min TTL');
  const payload = JSON.parse(decrypt(first.opts.body, phone.ua, phone.auth));
  assert(payload.title.includes('धूप') && payload.tag === 'bonesip-m_sun_exercise', 'payload is the 7 AM reminder in the phone\'s language (hi)', JSON.stringify(payload));
  assert(payload.data && payload.data.pillar === 'strengthen', 'tapping it opens the right section');

  const auth = first.opts.headers.Authorization;
  const m = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(auth);
  const claims = m && JSON.parse(Buffer.from(m[2], 'base64url'));
  assert(m && m[4] === publicKey && claims.aud === 'https://fcm.googleapis.com' && claims.exp > Date.now() / 1000, 'VAPID header names the push service and our key');
  const pub = Buffer.from(publicKey, 'base64url');
  const verifyKey = crypto.createPublicKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256', x: pub.subarray(1, 33).toString('base64url'), y: pub.subarray(33).toString('base64url') } });
  assert(m && crypto.verify('sha256', Buffer.from(`${m[1]}.${m[2]}`), { key: verifyKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(m[3], 'base64url')), 'VAPID signature verifies');

  assert(await push.tick(ist(8, 20)) === 1, '8:20 still sends the 8:00 breakfast reminder (late catch-up)');
  assert(await push.tick(ist(13, 31)) === 0, 'more than 30 min late is skipped');
  assert(await push.tick(ist(16, 30)) === 1 && await push.tick(ist(19, 30)) === 1, '4:30 PM and 7:30 PM are sent');

  // Another time zone follows its own clock.
  const uk = fakePhone('https://updates.push.services.mozilla.com/wpush/v2/xyz');
  await sub({ subscription: uk.subscription, lang: 'en', tz: 'Europe/London' }, '2.2.2.2');
  const londonSeven = new Date(Date.UTC(2026, 9, 21, 6, 0)); // 7:00 in London (BST)
  const before = sent.length;
  await push.tick(londonSeven);
  assert(sent.slice(before).some(s => s.url === uk.subscription.endpoint), 'a London phone gets 7:00 London time');
  assert(localClock('Asia/Kolkata', ist(7, 5)).minutes === 425, 'local clock is right for India');

  // Unsubscribed or uninstalled: the push service answers 410 and the phone is forgotten.
  reply = 410;
  await push.tick(ist(23, 59)); // nothing due
  const gone = await push.handle({ method: 'POST', pathname: '/api/push/test', body: { endpoint: phone.subscription.endpoint } });
  assert(gone.status === 502 && push.subscriberCount() === 1, 'a 410 from the push service removes the subscription');
  reply = 201;

  assert((await push.handle({ method: 'POST', pathname: '/api/push/test', body: { endpoint: phone.subscription.endpoint } })).status === 404, 'test push needs a subscription');
  const t1 = await push.handle({ method: 'POST', pathname: '/api/push/test', body: { endpoint: uk.subscription.endpoint } });
  const t2 = await push.handle({ method: 'POST', pathname: '/api/push/test', body: { endpoint: uk.subscription.endpoint } });
  assert(t1.status === 200 && t2.status === 429, 'test push works and is rate limited');

  await push.handle({ method: 'POST', pathname: '/api/push/unsubscribe', body: { endpoint: uk.subscription.endpoint } });
  assert(push.subscriberCount() === 0, 'unsubscribe removes the phone');

  // A phone that turns reminders on at 8:10 does not get the 8:00 one ten minutes late,
  // but a phone that merely reopens the app does not lose its due reminder.
  const late = fakePhone('https://fcm.googleapis.com/fcm/send/late');
  const realNow = Date.now;
  Date.now = () => ist(8, 10).getTime();
  const RealDate = Date;
  global.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [ist(8, 10).getTime()])); } static now() { return ist(8, 10).getTime(); } };
  await sub({ subscription: late.subscription, lang: 'en', tz: 'Asia/Kolkata' }, '3.3.3.3');
  global.Date = RealDate;
  Date.now = realNow;
  assert(await push.tick(ist(8, 11)) === 0, 'turning reminders on at 8:10 does not send the 8:00 one late');

  assert(decrypt(encryptPayload('hello', late.subscription.keys.p256dh, late.subscription.keys.auth), late.ua, late.auth) === 'hello', 'encryption round-trips');

  let limited = 0;
  for (let i = 0; i < 25; i++) {
    const r = await sub({ subscription: fakePhone(`https://fcm.googleapis.com/fcm/send/spam${i}`).subscription }, '9.9.9.9');
    if (r.status === 429) limited++;
  }
  assert(limited === 5, 'new subscriptions are limited per IP', `limited ${limited}`);

  push.stop();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
