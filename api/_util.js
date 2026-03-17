const crypto = require('crypto');

const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://tyfys.net',
  'https://www.tyfys.net',
  'https://app.tyfys.net',
  'https://www.app.tyfys.net',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
]);

function normalizeOrigin(value) {
  try {
    return new URL(String(value || '').trim()).origin;
  } catch {
    return '';
  }
}

function getAllowedOrigins() {
  const envOrigins = String(process.env.TYFYS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]);
}

function appendVaryHeader(res, headerName) {
  const existing = String(res.getHeader?.('vary') || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!existing.includes(headerName)) {
    const nextValue = existing.length ? `${existing.join(', ')}, ${headerName}` : headerName;
    res.setHeader('vary', nextValue);
  }
}

function setCorsHeaders(res, extraHeaders = {}) {
  const requestOrigin = normalizeOrigin(res?.req?.headers?.origin);
  const allowCredentials = requestOrigin && getAllowedOrigins().has(requestOrigin);

  if (allowCredentials) {
    res.setHeader('access-control-allow-origin', requestOrigin);
    res.setHeader('access-control-allow-credentials', 'true');
    appendVaryHeader(res, 'Origin');
  } else {
    res.setHeader('access-control-allow-origin', '*');
  }
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type, stripe-signature, authorization, x-tyfys-session');
  res.setHeader('access-control-expose-headers', 'x-tyfys-session');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
}

function json(res, status, obj, extraHeaders = {}) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  setCorsHeaders(res, extraHeaders);
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function safeString(x, max = 2000) {
  return String(x ?? '').trim().slice(0, max);
}

function sha256Hex(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

module.exports = { json, readBody, safeString, setCorsHeaders, sha256Hex };
