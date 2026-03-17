const { json, readBody, safeString } = require('./_util');
const { getUserByEmail, updateUser } = require('./_auth-store');
const {
  buildDisplayName,
  clearSessionCookie,
  publicAccount,
  readAuthenticatedUser,
  sanitizePersistedState,
  setSessionCookie,
} = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (!['GET', 'POST'].includes(req.method)) {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const auth = await readAuthenticatedUser(req, { refresh: true });
    if (!auth) {
      clearSessionCookie(res, req);
      return json(res, 401, { ok: false, authenticated: false, error: 'Authentication required.' });
    }

    if (req.method === 'GET') {
      setSessionCookie(res, req, auth.session.sessionId);
      return json(res, 200, {
        ok: true,
        authenticated: true,
        account: publicAccount(auth.user),
        appState: auth.user.state || null,
        sessionToken: auth.session.sessionId,
      });
    }

    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const appState = sanitizePersistedState(body.appState);
    if (!appState || typeof appState !== 'object') {
      return json(res, 400, { ok: false, error: 'A valid appState object is required.' });
    }

    const requestedEmail = safeString(
      body.email || body.userProfile?.email || body.appState?.userProfile?.email || auth.user.email,
      160
    );
    const requestedLeadId = safeString(
      body.leadId || body.userProfile?.leadId || body.appState?.zohoLeadId || auth.user.leadId,
      120
    );
    const requestedDisplayName = buildDisplayName({
      displayName:
        safeString(body.displayName, 160) ||
        safeString(body.userProfile?.displayName, 160) ||
        safeString(body.appState?.userProfile?.displayName, 160),
      userProfile: body.userProfile || body.appState?.userProfile,
    });

    const normalizedRequestedEmail = requestedEmail.toLowerCase();
    if (normalizedRequestedEmail && normalizedRequestedEmail !== auth.user.email.toLowerCase()) {
      const existingAccount = await getUserByEmail(normalizedRequestedEmail);
      if (existingAccount && existingAccount.userId !== auth.user.userId) {
        return json(res, 409, { ok: false, error: 'Another account already uses that email.' });
      }
    }

    const nextUser = await updateUser(auth.user.userId, {
      email: normalizedRequestedEmail || auth.user.email,
      leadId: requestedLeadId || auth.user.leadId,
      displayName: requestedDisplayName || auth.user.displayName,
      state: appState,
    });
    setSessionCookie(res, req, auth.session.sessionId);

    return json(res, 200, {
      ok: true,
      authenticated: true,
      account: publicAccount(nextUser),
      appState: nextUser.state || null,
      savedAt: nextUser.updatedAt,
      sessionToken: auth.session.sessionId,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
