'use strict';
/**
 * BONE SIP web server: serves the static app, the AI assistant endpoint and the
 * accounts API (phone login, saved data, history, super-admin portal; see
 * server/accounts.js). Used for local development and by the Dockerfile.
 * No dependencies: the database is Node's built-in SQLite (server/db.js).
 *
 *   node server/server.js            # port 8080 (or $PORT)
 *   node server/server.js 5510       # custom port
 *
 * Reads GROQ_API_KEY, ADMIN_PHONE, ADMIN_PIN, OTP_TEST_MODE, DATA_DIR … from the
 * environment or from a .env file in the project root (see .env.example).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch (e) { /* no .env: use the real environment */ }

const { handleChat } = require('./assistant');
const { openDb } = require('./db');
const { createAccounts } = require('./accounts');

const PORT = Number(process.argv[2] || process.env.PORT || 8080);
const HOST = process.env.HOST || '127.0.0.1';
const PROD = process.env.NODE_ENV === 'production';

// Only these paths are public. Everything else (.env, server/, tests/ …) is never served.
const PUBLIC_FILES = new Set(['index.html', 'admin.html', 'admin', 'manifest.webmanifest', 'sw.js', 'robots.txt']);
const PUBLIC_DIRS = ['css/', 'js/', 'assets/'].concat(PROD ? [] : ['scratch/']);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.woff2': 'font/woff2'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};

// Development only: allow same-origin framing so scratch/print-preview.html can load the app.
if (!PROD) {
  SECURITY_HEADERS['X-Frame-Options'] = 'SAMEORIGIN';
  SECURITY_HEADERS['Content-Security-Policy'] = SECURITY_HEADERS['Content-Security-Policy'].replace("frame-ancestors 'none'", "frame-ancestors 'self'");
}

function cacheControl(rel) {
  if (!PROD) return 'no-cache';
  if (rel === 'index.html' || rel === 'admin.html' || rel === 'sw.js' || rel === 'js/config.js' || rel.endsWith('.webmanifest')) return 'no-cache';
  if (rel.startsWith('css/') || rel.startsWith('js/')) return 'public, max-age=31536000, immutable';
  if (rel.startsWith('assets/')) return 'public, max-age=2592000';
  return 'no-cache';
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, Object.assign({}, SECURITY_HEADERS, headers));
  res.end(body);
}

function serveStatic(req, res) {
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, ''); } catch (e) { return send(res, 400, 'Bad request'); }
  const notFound = () => send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  // Reject backslashes/NUL (Windows path tricks), "..", and hidden files such as .env.
  if (/[\\\0]/.test(rel)) return notFound();
  rel = path.posix.normalize(rel || 'index.html').replace(/\/+$/, '');
  if (!rel || rel === '.') rel = 'index.html';
  if (rel === 'admin') rel = 'admin.html';
  if (rel.split('/').some(p => p.startsWith('.'))) return notFound();
  const isPublic = PUBLIC_FILES.has(rel) || PUBLIC_DIRS.some(d => rel.startsWith(d));
  if (!isPublic) {
    // Unknown routes fall back to the app shell; unknown files (and private ones like server/*.js) 404.
    if (path.posix.extname(rel)) return notFound();
    rel = 'index.html';
  }
  const target = path.join(ROOT, ...rel.split('/'));
  if (!target.startsWith(ROOT + path.sep)) return notFound();
  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
    const headers = { 'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': cacheControl(rel) };
    if (PROD) headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';

    // Range support so videos can seek (Safari requires it).
    const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (range) {
      const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
      if (start > end || start >= stat.size) return send(res, 416, '', { 'Content-Range': `bytes */${stat.size}` });
      res.writeHead(206, Object.assign({}, SECURITY_HEADERS, headers, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 }));
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(target, { start, end }).pipe(res);
    }
    res.writeHead(200, Object.assign({}, SECURITY_HEADERS, headers, { 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' }));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  });
}

function readJson(req, limit = 64 * 1024) {
  return new Promise((resolve) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { resolve(null); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}

function createServer({ dataDir = process.env.DATA_DIR || path.join(ROOT, 'data'), env = process.env } = {}) {
  const accounts = createAccounts({ db: openDb(dataDir), env, prod: PROD });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://x');
    const pathname = url.pathname;
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;

    if (pathname === '/healthz') return send(res, 200, 'ok\n', { 'Content-Type': 'text/plain' });

    if (pathname === '/api/chat') {
      if (req.method !== 'POST') return send(res, 405, JSON.stringify({ error: 'method_not_allowed' }), { 'Content-Type': 'application/json', Allow: 'POST' });
      const body = await readJson(req);
      if (!body) return send(res, 400, JSON.stringify({ error: 'bad_request' }), { 'Content-Type': 'application/json' });
      const result = await handleChat({ body, headers: req.headers, ip });
      return send(res, result.status, JSON.stringify(result.json), Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, result.headers || {}));
    }

    if (pathname.startsWith('/api/')) {
      try {
        const result = await accounts.handle({ method: req.method, pathname, query: url.searchParams, headers: req.headers, ip, readBody: () => readJson(req, 400 * 1024) });
        if (result) return send(res, result.status, req.method === 'HEAD' ? '' : result.body, result.headers);
      } catch (err) {
        console.error('accounts API error:', err);
        return send(res, 500, JSON.stringify({ error: 'server_error' }), { 'Content-Type': 'application/json' });
      }
      return send(res, 404, JSON.stringify({ error: 'not_found' }), { 'Content-Type': 'application/json' });
    }

    // Development only: saves the strings collected by BoneI18n.collect() so new
    // UI text can be added to the language files (see README → Languages).
    if (!PROD && pathname === '/__dev/i18n-collected' && req.method === 'POST' && /^(::1|::ffff:127\.0\.0\.1|127\.0\.0\.1)$/.test(req.socket.remoteAddress)) {
      const body = await readJson(req, 2 * 1024 * 1024);
      if (!body || !Array.isArray(body.strings)) return send(res, 400, 'bad request');
      fs.writeFileSync(path.join(ROOT, 'scratch', 'i18n-collected.json'), JSON.stringify(body.strings.filter(s => typeof s === 'string').sort(), null, 1));
      return send(res, 200, JSON.stringify({ saved: body.strings.length }), { 'Content-Type': 'application/json' });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
    serveStatic(req, res);
  });

  server.accounts = accounts;
  return server;
}

module.exports = { createServer };

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`BONE SIP running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT} (${PROD ? 'production' : 'development'})`);
    if (!process.env.GROQ_API_KEY) console.warn('GROQ_API_KEY is not set: the AI assistant will use its offline answers.');
    if (server.accounts.testMode) console.warn('OTP_TEST_MODE is on: every number logs in with the test code. Turn it off once SMS is set up.');
    else console.warn('OTP_TEST_MODE is off and no SMS service is set up: phone login is disabled.');
    if (!server.accounts.adminConfigured) console.warn('ADMIN_PHONE / ADMIN_PIN are not set: the admin portal (/admin.html) is disabled.');
  });
}
