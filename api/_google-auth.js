const { OAuth2Client } = require('google-auth-library');
const { safeString } = require('./_util');

let cachedClient = null;
let cachedClientId = '';

function getGoogleClientId() {
  return safeString(
    process.env.GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_OAUTH_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    240
  );
}

function getGoogleClient() {
  const clientId = getGoogleClientId();
  if (!clientId) return null;

  if (!cachedClient || cachedClientId !== clientId) {
    cachedClient = new OAuth2Client(clientId);
    cachedClientId = clientId;
  }

  return cachedClient;
}

async function verifyGoogleCredential(rawCredential) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google sign-in is not configured yet.');
  }

  const credential = safeString(rawCredential, 12000);
  if (!credential) {
    throw new Error('Google credential is required.');
  }

  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload() || {};
  const email = safeString(payload.email, 160).toLowerCase();

  if (!payload.email_verified || !email) {
    throw new Error('Google did not return a verified email address for this account.');
  }

  return {
    subject: safeString(payload.sub, 255),
    email,
    name: safeString(payload.name, 160),
    givenName: safeString(payload.given_name, 80),
    familyName: safeString(payload.family_name, 80),
    pictureUrl: safeString(payload.picture, 500),
    hostedDomain: safeString(payload.hd, 160).toLowerCase(),
  };
}

module.exports = {
  getGoogleClientId,
  verifyGoogleCredential,
};
