const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PAGE_PATH = path.join(__dirname, '..', 'intake-portal-content.html');
const COOKIE_NAME = 'tyfys_intake_portal_auth';
const LOGIN_ROUTE = '/intake-portal.html';

const PORTAL_USER = process.env.INTAKE_PORTAL_USER || 'admin';
const PORTAL_PASS = process.env.INTAKE_PORTAL_PASS || 'stateboys';
const PORTAL_SECRET = process.env.INTAKE_PORTAL_SECRET || 'tyfys-intake-portal-secret-v1';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i === -1) return;
    const key = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (!key) return;
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function authToken() {
  return crypto
    .createHash('sha256')
    .update(`${PORTAL_USER}:${PORTAL_PASS}:${PORTAL_SECRET}`)
    .digest('hex');
}

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(String(a || ''), 'utf8');
  const bBuf = Buffer.from(String(b || ''), 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return timingSafeEqual(cookies[COOKIE_NAME], authToken());
}

function setNoStore(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

function setAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(authToken())}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`
  );
}

function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );
}

function sendLoginPage(res, errorMessage = '', actionPath = LOGIN_ROUTE) {
  setNoStore(res);
  res.statusCode = 200;
  res.setHeader('content-type', 'text/html; charset=utf-8');

  const safeError = errorMessage
    ? `<p class="error">${errorMessage}</p>`
    : '<p class="hint">Enter your intake portal credentials to continue.</p>';

  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TYFYS Intake Portal Login</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      background: linear-gradient(145deg, #0f172a 0%, #1e3a8a 100%);
      color: #0f172a;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    .card {
      width: min(420px, 100%);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.3);
      border: 1px solid #e2e8f0;
      padding: 28px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 1.6rem;
      line-height: 1.2;
      color: #0f172a;
    }
    p { margin: 0 0 18px; color: #334155; }
    .hint { color: #475569; }
    .error {
      color: #b91c1c;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 10px 12px;
    }
    label {
      display: block;
      margin: 12px 0 6px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #0f172a;
    }
    input {
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 1rem;
    }
    input:focus {
      outline: 2px solid #93c5fd;
      border-color: #60a5fa;
    }
    button {
      margin-top: 16px;
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      background: #1e3a8a;
      cursor: pointer;
    }
    button:hover { background: #1d4ed8; }
    .meta {
      margin-top: 12px;
      font-size: 0.78rem;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1>Intake Portal Login</h1>
    ${safeError}
    <form method="POST" action="${actionPath}">
      <label for="username">Username</label>
      <input id="username" name="username" autocomplete="username" required />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />
      <button type="submit">Sign In</button>
    </form>
    <p class="meta">Protected TYFYS intake access</p>
  </main>
</body>
</html>`);
}

function sendPortalPage(res) {
  let html;
  try {
    html = fs.readFileSync(PAGE_PATH, 'utf8');
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Unable to load intake portal page.');
    return;
  }

  setNoStore(res);
  res.statusCode = 200;
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(html);
}

async function parseCredentials(req) {
  const raw = await readBody(req);
  const contentType = String(req.headers['content-type'] || '');
  const text = raw.toString('utf8');

  if (contentType.includes('application/json')) {
    const data = JSON.parse(text || '{}');
    return {
      username: String(data.username || ''),
      password: String(data.password || ''),
    };
  }

  const params = new URLSearchParams(text);
  return {
    username: String(params.get('username') || ''),
    password: String(params.get('password') || ''),
  };
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    setNoStore(res);
    res.end();
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    const url = new URL(req.url, 'https://tyfys.net');
    const actionPath = url.searchParams.get('embed') === '1' ? `${LOGIN_ROUTE}?embed=1` : LOGIN_ROUTE;
    if (url.searchParams.get('logout') === '1') {
      clearAuthCookie(res);
      return sendLoginPage(res, 'You have been signed out.', actionPath);
    }

    if (!isAuthenticated(req)) {
      return sendLoginPage(res, '', actionPath);
    }

    return sendPortalPage(res);
  }

  if (req.method === 'POST') {
    const url = new URL(req.url, 'https://tyfys.net');
    const actionPath = url.searchParams.get('embed') === '1' ? `${LOGIN_ROUTE}?embed=1` : LOGIN_ROUTE;
    try {
      const { username, password } = await parseCredentials(req);
      const userOk = timingSafeEqual(username, PORTAL_USER);
      const passOk = timingSafeEqual(password, PORTAL_PASS);

      if (userOk && passOk) {
        setNoStore(res);
        setAuthCookie(res);
        res.statusCode = 302;
        res.setHeader('Location', actionPath);
        res.end();
        return;
      }
    } catch (e) {
      // Fall through to generic auth error.
    }

    clearAuthCookie(res);
    return sendLoginPage(res, 'Invalid username or password.', actionPath);
  }

  res.statusCode = 405;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.end('Method not allowed');
};
