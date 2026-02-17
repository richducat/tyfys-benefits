const crypto = require('crypto');

function json(res, status, obj, extraHeaders = {}) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  // CORS (vaclaimteam.com -> tyfys.net)
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type, stripe-signature');
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

module.exports = { json, readBody, safeString, sha256Hex };
