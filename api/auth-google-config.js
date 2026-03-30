const { getGoogleClientId } = require('./_google-auth');
const { json } = require('./_util');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed' });

  const clientId = getGoogleClientId();
  return json(res, 200, {
    ok: true,
    enabled: Boolean(clientId),
    clientId,
  });
};
