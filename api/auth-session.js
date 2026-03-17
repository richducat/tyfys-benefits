const { json, safeString } = require('./_util');
const { clearSessionCookie, publicAccount, readAuthenticatedUser, setSessionCookie } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const auth = await readAuthenticatedUser(req, { refresh: true });
    if (!auth) {
      clearSessionCookie(res, req);
      return json(res, 200, { ok: true, authenticated: false });
    }

    setSessionCookie(res, req, auth.session.sessionId);
    return json(res, 200, {
      ok: true,
      authenticated: true,
      account: publicAccount(auth.user),
      appState: auth.user.state || null,
      sessionToken: auth.session.sessionId,
    });
  } catch (error) {
    clearSessionCookie(res, req);
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
