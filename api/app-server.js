const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || process.env.APP_PORT || 3000);
const ROOT_DIR = path.resolve(__dirname, '..');
const API_DIR = __dirname;
const APP_SHELL_PATH = path.join(ROOT_DIR, 'app-shell.html');
const PUBLIC_APP_URL = String(process.env.TYFYS_PUBLIC_APP_URL || 'https://tyfys.net/app-coming-soon.html').trim();
const BACKEND_APP_HOSTS = new Set(['app.tyfys.net', 'www.app.tyfys.net', 'api.tyfys.net', 'www.api.tyfys.net']);
const STATIC_PREFIXES = ['.well-known', 'tyfys-platform', 'Images', 'styles', 'apps'];
const BACKEND_APP_REDIRECT_PATHS = new Set([
  '/',
  '/app-shell.html',
  '/app.html',
  '/sign-up.html',
  '/intake.html',
  '/calculator.html',
  '/veteran-operating-system.html',
]);
const STATIC_FILES = new Map([
  ['/', APP_SHELL_PATH],
  ['/app-shell.html', APP_SHELL_PATH],
  ['/app.html', path.join(ROOT_DIR, 'app.html')],
  ['/app-coming-soon.html', path.join(ROOT_DIR, 'app-coming-soon.html')],
  ['/app-support.html', path.join(ROOT_DIR, 'app-support.html')],
  ['/privacy.html', path.join(ROOT_DIR, 'privacy.html')],
  ['/account-deletion.html', path.join(ROOT_DIR, 'account-deletion.html')],
  ['/manifest.webmanifest', path.join(ROOT_DIR, 'manifest.webmanifest')],
  ['/logo.png', path.join(ROOT_DIR, 'logo.png')],
  ['/robots.txt', path.join(ROOT_DIR, 'robots.txt')],
  ['/favicon.ico', path.join(ROOT_DIR, 'logo.png')],
]);
const ROUTE_HANDLERS = new Map([
  ['/intake-portal', 'intake-portal-gate'],
  ['/intake-portal.html', 'intake-portal-gate'],
  ['/oauth/callback', 'zoho-oauth-callback'],
  ['/zoho/callback', 'zoho-oauth-callback'],
]);

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    case '.webmanifest':
      return 'application/manifest+json; charset=utf-8';
    case '.txt':
      return 'text/plain; charset=utf-8';
    case '.map':
      return 'application/json; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function sendRedirect(res, location, statusCode = 302) {
  res.statusCode = statusCode;
  res.setHeader('location', location);
  res.end();
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function getRequestHostname(req) {
  return String(req?.headers?.host || '')
    .toLowerCase()
    .split(':')[0]
    .trim();
}

function resolveStaticPath(pathname) {
  if (STATIC_FILES.has(pathname)) {
    return STATIC_FILES.get(pathname);
  }

  for (const prefix of STATIC_PREFIXES) {
    const marker = `/${prefix}/`;
    if (!pathname.startsWith(marker)) continue;
    const relativePath = pathname.slice(1);
    const resolvedPath = path.resolve(ROOT_DIR, relativePath);
    const allowedRoot = path.resolve(ROOT_DIR, prefix) + path.sep;
    if (resolvedPath.startsWith(allowedRoot) && fileExists(resolvedPath)) {
      return resolvedPath;
    }
  }

  return '';
}

function sendFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  res.statusCode = 200;
  res.setHeader('content-type', mimeTypeFor(filePath));
  res.setHeader('content-length', String(stat.size));
  res.setHeader('cache-control', filePath.includes('/tyfys-platform/') ? 'public, max-age=300' : 'no-cache');

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false, error: 'Unable to read file.' });
      return;
    }
    res.destroy();
  });
  stream.pipe(res);
}

function shouldServeAppShell(req) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const accept = String(req.headers.accept || '').toLowerCase();
  return accept.includes('text/html') || accept.includes('*/*');
}

function shouldRedirectBackendAppRequest(req, pathname, hostname) {
  if (!BACKEND_APP_HOSTS.has(hostname)) return false;
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  if (pathname === '/_health') return false;
  if (pathname.startsWith('/api/')) return false;
  if (ROUTE_HANDLERS.has(pathname)) return false;
  if (pathname === '/app-support.html' || pathname === '/privacy.html' || pathname === '/account-deletion.html') {
    return false;
  }

  for (const prefix of STATIC_PREFIXES) {
    if (pathname.startsWith(`/${prefix}/`)) return false;
  }

  if (BACKEND_APP_REDIRECT_PATHS.has(pathname)) return true;

  const ext = path.extname(pathname);
  return !ext || ext === '.html';
}

function loadApiHandler(moduleName) {
  if (!/^[a-z0-9_-]+$/i.test(moduleName || '')) return null;
  const modulePath = path.join(API_DIR, `${moduleName}.js`);
  if (!fileExists(modulePath)) return null;
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

async function dispatchApi(moduleName, req, res) {
  const handler = loadApiHandler(moduleName);
  if (!handler) {
    sendJson(res, 404, { ok: false, error: 'API route not found' });
    return;
  }

  try {
    await handler(req, res);
  } catch (error) {
    console.error(`Unhandled error in ${moduleName}:`, error);
    if (!res.writableEnded) {
      sendJson(res, 500, { ok: false, error: 'Internal server error' });
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname || '/');
    const hostname = getRequestHostname(req);

    if (shouldRedirectBackendAppRequest(req, pathname, hostname)) {
      const redirectUrl = new URL(PUBLIC_APP_URL);
      redirectUrl.search = url.search;
      sendRedirect(res, redirectUrl.toString(), 302);
      return;
    }

    if (pathname === '/_health') {
      sendJson(res, 200, { ok: true, service: 'tyfys-app-server' });
      return;
    }

    if (ROUTE_HANDLERS.has(pathname)) {
      await dispatchApi(ROUTE_HANDLERS.get(pathname), req, res);
      return;
    }

    if (pathname.startsWith('/api/')) {
      const moduleName = pathname.slice('/api/'.length).replace(/\/+$/, '');
      await dispatchApi(moduleName, req, res);
      return;
    }

    const staticPath = resolveStaticPath(pathname);
    if (staticPath) {
      sendFile(req, res, staticPath);
      return;
    }

    if (shouldServeAppShell(req) && fileExists(APP_SHELL_PATH)) {
      sendFile(req, res, APP_SHELL_PATH);
      return;
    }

    sendJson(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    console.error('App server error:', error);
    if (!res.writableEnded) {
      sendJson(res, 500, { ok: false, error: 'Internal server error' });
    }
  }
});

server.listen(PORT, () => {
  console.log(`TYFYS app server listening on ${PORT}`);
});
