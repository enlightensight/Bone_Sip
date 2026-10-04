'use strict';
// Vercel Serverless Function at /api/chat. Set GROQ_API_KEY in
// Project → Settings → Environment Variables; the key never reaches the browser.
const { handleChat } = require('../server/assistant');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : null;
  if (!body) return res.status(400).json({ error: 'bad_request' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const result = await handleChat({ body, headers: req.headers, ip });
  Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  return res.status(result.status).json(result.json);
};
