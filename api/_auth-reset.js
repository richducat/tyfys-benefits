const { deletePasswordReset, getPasswordReset, getUserById, hashPasswordResetToken } = require('./_auth-store');
const { safeString } = require('./_util');

async function resolvePasswordResetToken(rawToken) {
  const token = safeString(rawToken, 240);
  if (!token) {
    return { ok: false, error: 'Reset token is required.' };
  }

  const tokenHash = hashPasswordResetToken(token);
  const resetRecord = await getPasswordReset(tokenHash);
  if (!resetRecord || Number(resetRecord.expiresAt || 0) <= Date.now()) {
    if (tokenHash) await deletePasswordReset(tokenHash);
    return { ok: false, error: 'This password reset link is invalid or expired.' };
  }

  const user = await getUserById(resetRecord.userId);
  if (!user || String(user.passwordResetTokenHash || '') !== tokenHash) {
    if (tokenHash) await deletePasswordReset(tokenHash);
    return { ok: false, error: 'This password reset link is invalid or expired.' };
  }

  return {
    ok: true,
    token,
    tokenHash,
    resetRecord,
    user,
  };
}

module.exports = {
  resolvePasswordResetToken,
};
