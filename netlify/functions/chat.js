'use strict';
// Netlify Function behind /api/chat (see netlify.toml). Set GROQ_API_KEY in
// Site settings → Environment variables; the key never reaches the browser.
const { handleChat } = require('../../server/assistant');

exports.handler = async (event) => {
  const json = (status, body, headers = {}) => ({
    statusCode: status,
    headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, headers),
    body: JSON.stringify(body)
  });
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' });
  if ((event.body || '').length > 64 * 1024) return json(413, { error: 'too_large' });

  let body = null;
  try { body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body); } catch (e) { /* handled below */ }
  if (!body) return json(400, { error: 'bad_request' });

  const headers = event.headers || {};
  const ip = headers['x-nf-client-connection-ip'] || String(headers['x-forwarded-for'] || '').split(',')[0].trim();
  const result = await handleChat({ body, headers, ip });
  return json(result.status, result.json, result.headers);
};
