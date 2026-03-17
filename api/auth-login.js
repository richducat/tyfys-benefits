const { json, readBody, safeString } = require('./_util');
const { getUserByEmail, updateUser } = require('./_auth-store');
const {
  createAuthenticatedSession,
  publicAccount,
  verifyPassword,
} = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const email = safeString(body.email, 160);
    const password = String(body.password || '');

    if (!email || !password) {
      return json(res, 400, { ok: false, error: 'Email and password are required.' });
    }

    const account = await getUserByEmail(email);
    if (!account || !verifyPassword(password, account)) {
      return json(res, 401, { ok: false, error: 'Invalid email or password.' });
    }

    const nextAccount = await updateUser(account.userId, { lastLoginAt: new Date().toISOString() });
    const session = await createAuthenticatedSession(res, req, nextAccount.userId);

    return json(res, 200, {
      ok: true,
      authenticated: true,
      account: publicAccount(nextAccount),
      appState: nextAccount.state || null,
      sessionToken: session.sessionId,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
