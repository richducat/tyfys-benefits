const { safeString } = require('./_util');

function html(body, status = 200) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Zoho OAuth Callback</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; padding: 24px; background: #0f172a; color: #e2e8f0; }
    .card { max-width: 900px; margin: 0 auto; background: #111827; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
    pre { background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 14px; overflow-x: auto; }
    code { color: #facc15; }
    a { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    ${body}
  </div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(html('<h1>Method not allowed</h1>', 405));
    return;
  }

  const url = new URL(req.url || '/', 'https://thankyouforyourservice.co');
  const code = safeString(url.searchParams.get('code'), 400);
  const state = safeString(url.searchParams.get('state'), 200);
  const error = safeString(url.searchParams.get('error'), 200);
  const dc = process.env.ZOHO_DC || 'com';
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const redirectUri = process.env.ZOHO_REDIRECT_URI || 'https://thankyouforyourservice.co/oauth/callback';

  if (error) {
    res.statusCode = 400;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(
      html(`<h1>Zoho authorization failed</h1><p><strong>Error:</strong> ${error}</p><p>State: <code>${state || '-'}</code></p>`)
    );
    return;
  }

  if (!code) {
    res.statusCode = 400;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(
      html(
        `<h1>Missing authorization code</h1><p>Start with <a href="/api/zoho-oauth-start">/api/zoho-oauth-start</a>.</p>`
      )
    );
    return;
  }

  if (!clientId || !clientSecret) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(
      html(
        '<h1>Missing Zoho credentials</h1><p>Set <code>ZOHO_CLIENT_ID</code> and <code>ZOHO_CLIENT_SECRET</code> in environment variables.</p>'
      )
    );
    return;
  }

  try {
    const tokenUrl = `https://accounts.zoho.${dc}/oauth/v2/token`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const response = await fetch(`${tokenUrl}?${params.toString()}`, { method: 'POST' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    const refreshToken = safeString(payload.refresh_token, 400);
    const accessToken = safeString(payload.access_token, 400);
    const expiresIn = safeString(payload.expires_in, 40);

    if (!refreshToken) {
      throw new Error(
        `No refresh_token returned. Re-run consent with access_type=offline and prompt=consent. Payload: ${JSON.stringify(payload)}`
      );
    }

    res.statusCode = 200;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(
      html(`
        <h1>Zoho OAuth Connected</h1>
        <p>Copy these values into your deployment environment variables:</p>
        <pre>ZOHO_CLIENT_ID=${clientId}
ZOHO_REFRESH_TOKEN=${refreshToken}
ZOHO_DC=${dc}
ZOHO_REDIRECT_URI=${redirectUri}
ZOHO_API_DOMAIN=https://www.zohoapis.${dc}</pre>
        <p>Access token (short-lived): <code>${accessToken || '-'}</code></p>
        <p>Access token expires in: <code>${expiresIn || '-'}</code> seconds</p>
        <p>State: <code>${state || '-'}</code></p>
      `)
    );
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(html(`<h1>Zoho token exchange failed</h1><pre>${safeString(e?.message || e, 4000)}</pre>`));
  }
};
