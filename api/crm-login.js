const { json, readBody, safeString } = require('./_util');
const {
  createAuthenticatedSession,
  createPasswordSalt,
  hashPassword,
  publicAccount,
  setSessionCookie,
  verifyPassword,
} = require('./_auth');
const { createUser, getUserByEmail, updateUser } = require('./_auth-store');
const { getCrmStaffUserByEmail, getCrmStaffUserById } = require('./_crm');

function resolveStaffUser(body) {
  const byId = getCrmStaffUserById(body.staffId);
  if (byId) return byId;
  return getCrmStaffUserByEmail(body.email);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const password = safeString(body.password, 80);
    const staffUser = resolveStaffUser(body);

    if (!staffUser) {
      return json(res, 401, { ok: false, error: 'Choose a valid CRM staff login.' });
    }

    if (password !== staffUser.password) {
      return json(res, 401, { ok: false, error: 'Incorrect password for that CRM staff login.' });
    }

    const now = new Date().toISOString();
    const passwordSalt = createPasswordSalt();
    const passwordHash = hashPassword(password, passwordSalt);
    let account = await getUserByEmail(staffUser.email);

    if (!account) {
      account = await createUser({
        email: staffUser.email,
        displayName: staffUser.displayName,
        passwordHash,
        passwordSalt,
        authProviders: ['password'],
        state: null,
      });
    } else if (!verifyPassword(password, account)) {
      account = await updateUser(account.userId, {
        email: staffUser.email,
        displayName: staffUser.displayName,
        passwordHash,
        passwordSalt,
        passwordUpdatedAt: now,
        authProviders: ['password'],
      });
    } else if (safeString(account.displayName, 160) !== staffUser.displayName) {
      account = await updateUser(account.userId, {
        displayName: staffUser.displayName,
      });
    }

    const session = await createAuthenticatedSession(res, req, account.userId);
    setSessionCookie(res, req, session.sessionId);

    return json(res, 200, {
      ok: true,
      authenticated: true,
      account: publicAccount(account),
      sessionToken: session.sessionId,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
