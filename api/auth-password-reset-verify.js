const { resolvePasswordResetToken } = require('./_auth-reset');
const { json, readBody, safeString } = require('./_util');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const resolved = await resolvePasswordResetToken(body.token);

    if (!resolved.ok) {
      return json(res, 400, { ok: false, valid: false, error: resolved.error });
    }

    return json(res, 200, {
      ok: true,
      valid: true,
      email: safeString(resolved.user.email, 160),
      expiresAt: new Date(resolved.resetRecord.expiresAt).toISOString(),
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
