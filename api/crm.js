const { json, readBody, safeString } = require('./_util');
const { clearSessionCookie, publicAccount, readAuthenticatedUser, setSessionCookie } = require('./_auth');
const { getUserById, listUsers, updateUser } = require('./_auth-store');
const {
  CRM_PIPELINE_STAGES,
  applyCrmUpdate,
  buildCrmCustomer,
  buildCrmMetrics,
  canAccessCrm,
  isLikelyCustomer,
  normalizeCrmRecord,
} = require('./_crm');

function sortCustomers(customers) {
  return customers.sort((left, right) => {
    const rightDueAt = Date.parse(String(right.dueAt || '')) || 0;
    const leftDueAt = Date.parse(String(left.dueAt || '')) || 0;
    if (rightDueAt !== leftDueAt) return leftDueAt - rightDueAt;

    const rightUpdatedAt = Date.parse(String(right.updatedAt || '')) || 0;
    const leftUpdatedAt = Date.parse(String(left.updatedAt || '')) || 0;
    return rightUpdatedAt - leftUpdatedAt;
  });
}

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

    if (!canAccessCrm(auth.user)) {
      setSessionCookie(res, req, auth.session.sessionId);
      return json(res, 403, {
        ok: false,
        authenticated: true,
        error: 'This account does not have CRM access.',
      });
    }

    setSessionCookie(res, req, auth.session.sessionId);

    if (req.method === 'GET') {
      const users = await listUsers({ limit: 2000 });
      const customers = sortCustomers(
        users
          .filter((user) => isLikelyCustomer(user))
          .map((user) => buildCrmCustomer(user))
      );

      return json(res, 200, {
        ok: true,
        authenticated: true,
        viewer: publicAccount(auth.user),
        stages: CRM_PIPELINE_STAGES,
        metrics: buildCrmMetrics(customers),
        customers,
        generatedAt: new Date().toISOString(),
      });
    }

    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const userId = safeString(body.userId, 120);
    if (!userId) {
      return json(res, 400, { ok: false, error: 'userId is required.' });
    }

    const targetUser = await getUserById(userId);
    if (!targetUser || !isLikelyCustomer(targetUser)) {
      return json(res, 404, { ok: false, error: 'Customer not found.' });
    }

    const currentCrm = normalizeCrmRecord(targetUser.crm, targetUser);
    const nextCrm = applyCrmUpdate(
      currentCrm,
      body,
      safeString(auth.user.displayName, 160) || safeString(auth.user.email, 160) || 'TYFYS CRM'
    );

    const nextUser = await updateUser(userId, { crm: nextCrm });
    const customer = buildCrmCustomer(nextUser);

    return json(res, 200, {
      ok: true,
      authenticated: true,
      customer,
      savedAt: customer.updatedAt,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
