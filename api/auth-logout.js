const { json, safeString } = require('./_util');
const { deleteSession } = require('./_auth-store');
const { clearSessionCookie, readSessionToken } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const sessionToken = readSessionToken(req);
    if (sessionToken) {
      await deleteSession(sessionToken);
    }
    clearSessionCookie(res, req);
    return json(res, 200, { ok: true, authenticated: false });
  } catch (error) {
    clearSessionCookie(res, req);
    return json(res, 200, { ok: true, authenticated: false, warning: safeString(error?.message || error, 2000) });
  }
};
