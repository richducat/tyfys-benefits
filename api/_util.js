const crypto = require('crypto');

const ALLOWED_CORS_HOSTS = new Set([
  'tyfys.net',
  'www.tyfys.net',
  'app.tyfys.net',
  'tyfys-benefits.vercel.app',
  'tyfys-benefits-eb28-llcs-projects.vercel.app',
  'tyfys-benefits-git-main-eb28-llcs-projects.vercel.app',
]);

function normalizeOrigin(value) {
  try {
    return new URL(String(value || '')).origin;
  } catch (error) {
    return '';
  }
}

function isAllowedCorsOrigin(origin) {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const host = String(url.hostname || '').toLowerCase();
    return (
      ALLOWED_CORS_HOSTS.has(host) ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]'
    );
  } catch (error) {
    return false;
  }
}

function corsHeaders(req) {
  const headers = {
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type, stripe-signature',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
  const origin = normalizeOrigin(req?.headers?.origin);

  if (isAllowedCorsOrigin(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-credentials'] = 'true';
  } else {
    headers['access-control-allow-origin'] = '*';
  }

  return headers;
}

function json(res, status, obj, extraHeaders = {}) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(corsHeaders(res.req))) res.setHeader(k, v);
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
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

module.exports = { corsHeaders, json, readBody, safeString, sha256Hex };
