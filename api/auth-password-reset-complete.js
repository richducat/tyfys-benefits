const { createPasswordSalt, createAuthenticatedSession, hashPassword, publicAccount } = require('./_auth');
const { deletePasswordReset, updateUser } = require('./_auth-store');
const { resolvePasswordResetToken } = require('./_auth-reset');
const { json, readBody, safeString } = require('./_util');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const password = String(body.password || '');

    if (password.length < 8) {
      return json(res, 400, { ok: false, error: 'Password must be at least 8 characters.' });
    }

    const resolved = await resolvePasswordResetToken(body.token);
    if (!resolved.ok) {
      return json(res, 400, { ok: false, error: resolved.error });
    }

    const passwordSalt = createPasswordSalt();
    const passwordHash = hashPassword(password, passwordSalt);
    const now = new Date().toISOString();
    const nextUser = await updateUser(resolved.user.userId, {
      passwordSalt,
      passwordHash,
      passwordUpdatedAt: now,
      passwordResetTokenHash: '',
      passwordResetRequestedAt: '',
      lastLoginAt: now,
    });

    await deletePasswordReset(resolved.tokenHash);
    const session = await createAuthenticatedSession(res, req, nextUser.userId);

    return json(res, 200, {
      ok: true,
      authenticated: true,
      account: publicAccount(nextUser),
      appState: nextUser.state || null,
      sessionToken: session.sessionId,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
