const crypto = require('crypto');
const {
  SESSION_TTL_MS,
  createSession,
  deleteSession,
  getSession,
  getUserById,
  normalizeEmail,
  refreshSession,
} = require('./_auth-store');

const SESSION_COOKIE = 'tyfys_app_session';
const AUTH_SCRYPT_PEPPER = process.env.TYFYS_AUTH_PEPPER || '';

function parseCookies(req) {
  const cookies = {};
  const raw = String(req?.headers?.cookie || '');
  raw.split(';').forEach((part) => {
    const divider = part.indexOf('=');
    if (divider === -1) return;
    const key = part.slice(0, divider).trim();
    const value = part.slice(divider + 1).trim();
    if (!key) return;
    cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function shouldUseSecureCookies(req) {
  const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (forwardedProto === 'https') return true;

  const host = String(req?.headers?.host || '').toLowerCase();
  return !(
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('[::1]') ||
    host.startsWith('0.0.0.0')
  );
}

function setSessionCookie(res, req, sessionId) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (shouldUseSecureCookies(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res, req) {
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (shouldUseSecureCookies(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function createPasswordSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password, salt) {
  return crypto
    .scryptSync(`${String(password || '')}${AUTH_SCRYPT_PEPPER}`, String(salt || ''), 64)
    .toString('hex');
}

function verifyPassword(password, account) {
  if (!account?.passwordSalt || !account?.passwordHash) return false;
  const candidateHash = hashPassword(password, account.passwordSalt);
  const candidate = Buffer.from(candidateHash, 'hex');
  const actual = Buffer.from(String(account.passwordHash || ''), 'hex');
  if (candidate.length !== actual.length) return false;
  return crypto.timingSafeEqual(candidate, actual);
}

function buildDisplayName({ displayName, userProfile }) {
  if (displayName) return String(displayName).trim().slice(0, 160);
  const firstName = String(userProfile?.firstName || '').trim();
  const lastName = String(userProfile?.lastName || '').trim();
  return `${firstName} ${lastName}`.trim().slice(0, 160);
}

function sanitizePersistedState(appState) {
  if (!appState || typeof appState !== 'object') return null;
  return JSON.parse(JSON.stringify(appState));
}

function publicAccount(account) {
  if (!account) return null;
  return {
    userId: String(account.userId || ''),
    email: normalizeEmail(account.email),
    displayName: String(account.displayName || '').trim(),
    leadId: String(account.leadId || '').trim(),
    createdAt: String(account.createdAt || ''),
    updatedAt: String(account.updatedAt || ''),
    lastLoginAt: String(account.lastLoginAt || ''),
  };
}

async function readAuthenticatedUser(req, { refresh = false } = {}) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;

  const session = await getSession(sessionId);
  if (!session || Number(session.expiresAt || 0) <= Date.now()) {
    if (sessionId) await deleteSession(sessionId);
    return null;
  }

  const user = await getUserById(session.userId);
  if (!user) {
    await deleteSession(sessionId);
    return null;
  }

  const nextSession = refresh ? await refreshSession(sessionId) : session;
  return { session: nextSession, user };
}

async function createAuthenticatedSession(res, req, userId) {
  const session = await createSession({ userId });
  setSessionCookie(res, req, session.sessionId);
  return session;
}

module.exports = {
  buildDisplayName,
  clearSessionCookie,
  createAuthenticatedSession,
  createPasswordSalt,
  hashPassword,
  parseCookies,
  publicAccount,
  readAuthenticatedUser,
  sanitizePersistedState,
  setSessionCookie,
  verifyPassword,
};
