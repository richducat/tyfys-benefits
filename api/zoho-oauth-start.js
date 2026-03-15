const crypto = require('crypto');
const { json, safeString } = require('./_util');

function randomState() {
  return crypto.randomBytes(16).toString('hex');
}

// GET /api/zoho-oauth-start
// Query:
// - redirect=1 (302 to Zoho instead of JSON output)
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed' });

  const clientId = process.env.ZOHO_CLIENT_ID;
  const dc = process.env.ZOHO_DC || 'com';
  const redirectUri = process.env.ZOHO_REDIRECT_URI || 'https://thankyouforyourservice.co/oauth/callback';
  const scope = process.env.ZOHO_OAUTH_SCOPE || 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL';
  const state = randomState();

  if (!clientId) {
    return json(res, 500, { ok: false, error: 'Missing ZOHO_CLIENT_ID' });
  }

  const authUrl = new URL(`https://accounts.zoho.${dc}/oauth/v2/auth`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  const requestUrl = new URL(req.url || '/', 'https://thankyouforyourservice.co');
  const shouldRedirect = safeString(requestUrl.searchParams.get('redirect')) === '1';
  if (shouldRedirect) {
    res.statusCode = 302;
    res.setHeader('location', authUrl.toString());
    res.end('');
    return;
  }

  return json(res, 200, {
    ok: true,
    state,
    authorizationUrl: authUrl.toString(),
    next: 'Open authorizationUrl in your browser, then complete consent.',
  });
};
