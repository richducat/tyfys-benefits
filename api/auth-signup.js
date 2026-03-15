const { json, readBody, safeString } = require('./_util');
const { createUser } = require('./_auth-store');
const {
  buildDisplayName,
  createAuthenticatedSession,
  createPasswordSalt,
  hashPassword,
  publicAccount,
  sanitizePersistedState,
} = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const email = safeString(body.email, 160);
    const password = String(body.password || '');
    const leadId = safeString(body.leadId, 120);
    const displayName = buildDisplayName({
      displayName: safeString(body.displayName, 160),
      userProfile: body.userProfile || body.appState?.userProfile,
    });
    const appState = sanitizePersistedState(body.appState);

    if (!email) return json(res, 400, { ok: false, error: 'Email is required.' });
    if (password.length < 8) {
      return json(res, 400, { ok: false, error: 'Password must be at least 8 characters.' });
    }

    const passwordSalt = createPasswordSalt();
    const passwordHash = hashPassword(password, passwordSalt);
    const account = await createUser({
      email,
      passwordHash,
      passwordSalt,
      displayName,
      leadId,
      state: appState,
    });

    await createAuthenticatedSession(res, req, account.userId);

    return json(res, 200, {
      ok: true,
      authenticated: true,
      account: publicAccount(account),
      appState: account.state || null,
    });
  } catch (error) {
    const message = safeString(error?.message || error, 2000);
    const status = /already exists/i.test(message) ? 409 : 500;
    return json(res, status, { ok: false, error: message });
  }
};
