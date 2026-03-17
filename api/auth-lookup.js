const { json, readBody, safeString } = require('./_util');
const { getUserByEmail } = require('./_auth-store');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const email = safeString(body.email, 160).toLowerCase();

    if (!email) {
      return json(res, 400, { ok: false, error: 'Email is required.' });
    }

    const account = await getUserByEmail(email);
    return json(res, 200, {
      ok: true,
      exists: Boolean(account),
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
