const { createUser, getUserByEmail, getUserByGoogleSubject, updateUser } = require('./_auth-store');
const {
  buildDisplayName,
  createAuthenticatedSession,
  publicAccount,
  sanitizePersistedState,
} = require('./_auth');
const { verifyGoogleCredential } = require('./_google-auth');
const { json, readBody, safeString } = require('./_util');

function mergeGoogleProfileIntoState(appState, googleProfile) {
  const baseState = sanitizePersistedState(appState);
  const nextState = baseState && typeof baseState === 'object' ? { ...baseState } : {};
  const nextUserProfile =
    nextState.userProfile && typeof nextState.userProfile === 'object' ? { ...nextState.userProfile } : {};

  if (!nextUserProfile.email) {
    nextUserProfile.email = googleProfile.email;
  }
  if (!nextUserProfile.firstName && googleProfile.givenName) {
    nextUserProfile.firstName = googleProfile.givenName;
  }
  if (!nextUserProfile.lastName && googleProfile.familyName) {
    nextUserProfile.lastName = googleProfile.familyName;
  }

  nextState.userProfile = nextUserProfile;
  return Object.keys(nextState).length ? nextState : null;
}

function mergeAuthProviders(existingProviders = [], additions = []) {
  const providers = new Set();
  for (const provider of [...existingProviders, ...additions]) {
    const normalized = String(provider || '').trim().toLowerCase();
    if (normalized === 'password' || normalized === 'google') {
      providers.add(normalized);
    }
  }
  return Array.from(providers);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const googleProfile = await verifyGoogleCredential(body.credential);
    const leadId = safeString(body.leadId, 120);
    const appState = mergeGoogleProfileIntoState(body.appState, googleProfile);
    const displayName = buildDisplayName({
      displayName: safeString(body.displayName, 160) || googleProfile.name,
      userProfile: body.userProfile || appState?.userProfile,
    });
    const now = new Date().toISOString();

    let account = await getUserByGoogleSubject(googleProfile.subject);

    if (account) {
      account = await updateUser(account.userId, {
        lastLoginAt: now,
        authProviders: mergeAuthProviders(account.authProviders, ['google']),
        googlePictureUrl: googleProfile.pictureUrl || account.googlePictureUrl || '',
        googleHostedDomain: googleProfile.hostedDomain || account.googleHostedDomain || '',
        displayName: account.displayName || displayName,
        leadId: account.leadId || leadId,
        state: account.state || appState,
      });
    } else {
      const existingEmailAccount = await getUserByEmail(googleProfile.email);

      if (existingEmailAccount) {
        account = await updateUser(existingEmailAccount.userId, {
          lastLoginAt: now,
          googleSubject: googleProfile.subject,
          authProviders: mergeAuthProviders(existingEmailAccount.authProviders, ['google']),
          googlePictureUrl: googleProfile.pictureUrl || existingEmailAccount.googlePictureUrl || '',
          googleHostedDomain: googleProfile.hostedDomain || existingEmailAccount.googleHostedDomain || '',
          displayName: existingEmailAccount.displayName || displayName,
          leadId: existingEmailAccount.leadId || leadId,
          state: existingEmailAccount.state || appState,
        });
      } else {
        account = await createUser({
          email: googleProfile.email,
          displayName,
          leadId,
          state: appState,
          googleSubject: googleProfile.subject,
          authProviders: ['google'],
          googlePictureUrl: googleProfile.pictureUrl,
          googleHostedDomain: googleProfile.hostedDomain,
        });
        account = await updateUser(account.userId, { lastLoginAt: now });
      }
    }

    const session = await createAuthenticatedSession(res, req, account.userId);

    return json(res, 200, {
      ok: true,
      authenticated: true,
      account: publicAccount(account),
      appState: account.state || null,
      sessionToken: session.sessionId,
    });
  } catch (error) {
    const message = safeString(error?.message || error, 2000);
    const status = /not configured/i.test(message)
      ? 503
      : /credential|verified email|token/i.test(message)
        ? 400
        : /already linked|already exists/i.test(message)
          ? 409
          : 500;
    return json(res, status, { ok: false, error: message });
  }
};
