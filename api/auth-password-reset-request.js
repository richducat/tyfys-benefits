const { createPasswordReset, getUserByEmail, normalizeEmail } = require('./_auth-store');
const { buildPasswordResetUrl, isLocalRequest, sendPasswordResetEmail } = require('./_auth-email');
const { json, readBody, safeString } = require('./_util');

const GENERIC_MESSAGE = 'If that email is in TYFYS, we sent a password reset link.';
const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const email = normalizeEmail(safeString(body.email, 160));

    if (!email) {
      return json(res, 400, { ok: false, error: 'Email is required.' });
    }

    const account = await getUserByEmail(email);
    if (!account) {
      return json(res, 200, { ok: true, message: GENERIC_MESSAGE });
    }

    const requestedAtMs = Date.parse(String(account.passwordResetRequestedAt || ''));
    if (Number.isFinite(requestedAtMs) && Date.now() - requestedAtMs < PASSWORD_RESET_COOLDOWN_MS) {
      return json(res, 200, { ok: true, message: GENERIC_MESSAGE });
    }

    const reset = await createPasswordReset({ userId: account.userId });
    const resetUrl = buildPasswordResetUrl(req, reset.token);

    try {
      await sendPasswordResetEmail({
        req,
        account,
        resetUrl,
      });
    } catch (deliveryError) {
      if (!isLocalRequest(req)) {
        return json(res, 500, {
          ok: false,
          error:
            'Reset email is unavailable right now. Use the account verification form below to choose a new password or contact TYFYS.',
        });
      }

      return json(res, 200, {
        ok: true,
        message: GENERIC_MESSAGE,
        debugResetUrl: resetUrl,
        warning: safeString(deliveryError?.message || deliveryError, 2000),
      });
    }

    return json(res, 200, {
      ok: true,
      message: GENERIC_MESSAGE,
      ...(isLocalRequest(req) ? { debugResetUrl: resetUrl } : {}),
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
