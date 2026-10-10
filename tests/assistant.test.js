/**
 * Tests for the Ojas AI assistant backend (server/assistant.js) and the
 * Node server (server/server.js). No network: Groq is replaced by a fake fetch.
 *   node tests/assistant.test.js
 */
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const { handleChat, ACTIONS, LANGUAGES, _internal } = require('../server/assistant');

let pass = 0;
let fail = 0;
function assert(cond, name, details = '') {
  if (cond) { pass++; console.log(`  ✅ PASS: ${name}`); } else { fail++; console.error(`  ❌ FAIL: ${name} ${details}`); }
}

function fakeResponse(status, body, headers = {}) {
  return { status, ok: status >= 200 && status < 300, headers: { get: k => headers[k.toLowerCase()] ?? null }, json: async () => body };
}

function okReply(text) {
  return fakeResponse(200, { choices: [{ message: { content: text } }] });
}

const ENV = { GROQ_API_KEY: 'test-key', GROQ_MODELS: 'model-a,model-b' };
const userMsg = content => ({ messages: [{ role: 'user', content }], language: 'hi', context: { firstName: 'Asha', diet: 'veg', region: 'south' } });
let ipCounter = 0;
const nextIp = () => `10.0.0.${++ipCounter}`;

(async () => {
  console.log('--- Knowledge prompt ---');
  const P = _internal.KNOWLEDGE_PROMPT;
  assert(P.includes('Ojas') && P.includes('BONE SIP'), 'Prompt introduces Ojas inside BONE SIP');
  assert(['BUILD', 'PROTECT', 'STRENGTHEN', '3-2-1', 'OTP', 'Add to Home Screen'].every(k => P.includes(k)), 'Prompt covers the app flow (pillars, 3-2-1, OTP, install)');
  const data = require('../js/data.js');
  assert(data.workoutLibrary.every(e => P.includes(e.name)), 'Prompt includes every filmed exercise');
  assert(P.includes('112') && /not a doctor/i.test(P), 'Prompt includes safety rules (not a doctor, emergency number)');
  assert(Object.keys(ACTIONS).every(id => P.includes(id)), 'Prompt lists every action id');
  assert(Object.keys(LANGUAGES).length === 13 && ['hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as'].every(l => LANGUAGES[l]), 'Supports auto + English + 11 Indian languages');
  assert(P.length < 24000, 'Knowledge prompt stays compact', `(${P.length} chars)`);

  console.log('\n--- Snapshot & validation ---');
  const snap = _internal.buildSnapshot({ firstName: 'Asha\u0000<script>', age: 999, diet: 'veg', region: 'south', mealsPending: Array(20).fill('x') }, 'zz');
  assert(!snap.includes('\u0000') && snap.includes('Asha'), 'Snapshot strips control characters');
  assert(!/Age: 999/.test(snap), 'Snapshot drops out-of-range numbers');
  assert(snap.includes('same language the user writes in'), 'Unknown language falls back to auto');
  assert(/Meal ideas[\s\S]*South|Ragi/i.test(snap), 'Snapshot adds meal ideas for the user\'s cuisine');
  assert(_internal.sanitizeMessages([{ role: 'system', content: 'x' }]) === null, 'Rejects conversations without a user message');
  assert(_internal.sanitizeMessages([{ role: 'user', content: 'a'.repeat(5000) }])[0].content.length === 1000, 'Clips long user messages');

  console.log('\n--- Request handling ---');
  let r = await handleChat({ body: userMsg('hi'), env: {}, ip: nextIp() });
  assert(r.status === 503 && r.json.error === 'not_configured', 'No API key → 503 not_configured');
  r = await handleChat({ body: userMsg('hi'), env: ENV, ip: nextIp(), headers: { origin: 'https://evil.example', host: 'bonesip.app' } });
  assert(r.status === 403, 'Cross-site origin is rejected');
  r = await handleChat({ body: { messages: 'nope' }, env: ENV, ip: nextIp(), fetchImpl: async () => okReply('x') });
  assert(r.status === 400, 'Malformed body → 400');

  let sentBody = null;
  r = await handleChat({
    body: userMsg('मुझे क्या खाना चाहिए?'), env: ENV, ip: nextIp(), headers: { origin: 'https://bonesip.app', host: 'bonesip.app' },
    fetchImpl: async (url, opts) => { sentBody = JSON.parse(opts.body); return okReply('<think>hidden</think>Ragi dosa khaiye.\n[[action:open_diet]]\n[[action:delete_everything]]'); }
  });
  assert(r.status === 200 && r.json.reply === 'Ragi dosa khaiye.', 'Returns the reply with hidden reasoning and tags removed');
  assert(JSON.stringify(r.json.actions) === '["open_diet"]', 'Only whitelisted actions are returned');
  assert(sentBody.messages[0].content === P && sentBody.messages[0].role === 'system', 'Static knowledge prompt is sent first (cacheable)');
  assert(/Hindi/.test(sentBody.messages[1].content), 'Requested language reaches the model');
  assert(!JSON.stringify(sentBody).includes('test-key'), 'API key is never put in the request body');

  console.log('\n--- Model fallback ---');
  _internal.parkedUntil.clear();
  const calls = [];
  const flaky = async (url, opts) => {
    const model = JSON.parse(opts.body).model;
    calls.push(model);
    if (model === 'model-a') return fakeResponse(429, { error: {} }, { 'x-ratelimit-remaining-requests': '0', 'x-ratelimit-reset-requests': '2h0m0s' });
    return okReply('from b');
  };
  r = await handleChat({ body: userMsg('q1'), env: ENV, ip: nextIp(), fetchImpl: flaky });
  assert(r.status === 200 && r.json.model === 'model-b', 'Daily limit on model A → answered by model B');
  calls.length = 0;
  r = await handleChat({ body: userMsg('q2'), env: ENV, ip: nextIp(), fetchImpl: flaky });
  assert(calls.join() === 'model-b', 'Exhausted model is skipped until its quota resets');
  _internal.parkedUntil.clear();
  r = await handleChat({ body: userMsg('q3'), env: ENV, ip: nextIp(), fetchImpl: async () => fakeResponse(429, {}, { 'retry-after': '20' }) });
  assert(r.status === 503 && r.json.error === 'busy' && r.json.retryAfter > 0, 'All models limited → 503 busy with retryAfter');
  _internal.parkedUntil.clear();
  r = await handleChat({ body: userMsg('q4'), env: ENV, ip: nextIp(), fetchImpl: async () => fakeResponse(401, {}) });
  assert(r.status === 503 && r.json.error === 'not_configured', 'Rejected key → not_configured');
  assert(_internal.parseDuration('1m26.4s') === 86400 && _internal.parseDuration('2h') === 7200000, 'Parses Groq reset durations');

  console.log('\n--- Rate limiting ---');
  _internal.parkedUntil.clear();
  let limited = null;
  for (let i = 0; i < 25 && !limited; i++) {
    const res = await handleChat({ body: userMsg('spam'), env: ENV, ip: '9.9.9.9', fetchImpl: async () => okReply('ok') });
    if (res.status === 429) limited = i;
  }
  assert(limited === 20, 'One visitor is limited after 20 messages per 10 minutes', `(limited at ${limited})`);

  console.log('\n--- Node server (static files + /api/chat) ---');
  const port = 5600 + Math.floor(Math.random() * 300);
  const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server', 'server.js'), String(port)], { env: Object.assign({}, process.env, { NODE_ENV: 'production', GROQ_API_KEY: '' }), stdio: 'pipe' });
  await new Promise(res => { srv.stdout.on('data', d => { if (/running/.test(d)) res(); }); setTimeout(res, 3000); });
  const get = (p, method = 'GET') => new Promise(res => {
    const req = http.request({ host: '127.0.0.1', port, path: p, method }, resp => { let b = ''; resp.on('data', c => b += c); resp.on('end', () => res({ status: resp.statusCode, body: b, headers: resp.headers })); });
    req.on('error', () => res({ status: 0, body: '' }));
    req.end();
  });
  const home = await get('/');
  assert(home.status === 200 && home.body.includes('BONE SIP') && home.headers['content-security-policy'], 'Serves the app with security headers');
  const adminClean = await get('/admin');
  assert(adminClean.status === 200 && adminClean.body.includes('Diet plans & Clinical Dishes'), 'Serves admin.html at /admin');
  const adminSlash = await get('/admin/');
  assert(adminSlash.status === 200 && adminSlash.body.includes('Diet plans & Clinical Dishes'), 'Serves admin.html at /admin/');
  const adminDirect = await get('/admin.html');
  assert(adminDirect.status === 200 && adminDirect.body.includes('Diet plans & Clinical Dishes'), 'Serves admin.html at /admin.html');
  assert((await get('/js/data.js')).status === 200, 'Serves public scripts');
  assert((await get('/healthz')).body.trim() === 'ok', 'Health check responds');
  for (const p of ['/.env', '/server/assistant.js', '/css/../.env', '/css%2F..%2F.env', '/css/x%5C..%5C..%5C.env', '/tests/app.test.js', '/scratch/print-preview.html', '/.git/config']) {
    const res = await get(p);
    assert(res.status === 404 && !/GROQ|gsk_/.test(res.body), `Never serves private path ${p}`);
  }
  assert((await get('/api/chat')).status === 405, '/api/chat only accepts POST');
  srv.kill();

  console.log(`\n🏁 ASSISTANT TESTS: ${pass} Passed, ${fail} Failed`);
  process.exit(fail ? 1 : 0);
})();
