const { createPasswordReset, getUserByEmail, normalizeEmail, updateUser } = require('./_auth-store');
const { json, readBody, safeString } = require('./_util');

const FAILED_ATTEMPT_WINDOW_MS = 60 * 60 * 1000;
const LOCKOUT_MS = 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function normalizeZip(value) {
  return String(value || '')
    .replace(/[^\d]/g, '')
    .slice(0, 5);
}

function normalizePhoneLast4(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return digits.slice(-4);
}

function normalizeLastName(value) {
  return safeString(value, 80)
    .toLowerCase()
    .replace(/[^a-z'-]/g, '');
}

function parseDisplayNameLastName(displayName) {
  const parts = safeString(displayName, 160)
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return normalizeLastName(parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || '');
}

function getChallengeProfile(account) {
  const profile = account?.state?.userProfile && typeof account.state.userProfile === 'object' ? account.state.userProfile : {};
  return {
    zip: normalizeZip(profile.zip),
    phoneLast4: normalizePhoneLast4(profile.phone),
    lastName: normalizeLastName(profile.lastName) || parseDisplayNameLastName(account?.displayName),
  };
}

function getChallengeThrottle(account) {
  const lockedUntil = Date.parse(String(account?.passwordResetChallengeLockedUntil || ''));
  const windowStartedAt = Date.parse(String(account?.passwordResetChallengeWindowStartedAt || ''));
  const failedAttempts = Number(account?.passwordResetChallengeFailedAttempts || 0);
  const now = Date.now();

  if (Number.isFinite(lockedUntil) && lockedUntil > now) {
    return {
      isLocked: true,
      lockedUntil,
      failedAttempts,
      windowStartedAt,
    };
  }

  if (!Number.isFinite(windowStartedAt) || now - windowStartedAt > FAILED_ATTEMPT_WINDOW_MS) {
    return {
      isLocked: false,
      lockedUntil: 0,
      failedAttempts: 0,
      windowStartedAt: now,
    };
  }

  return {
    isLocked: false,
    lockedUntil: 0,
    failedAttempts,
    windowStartedAt,
  };
}

async function recordChallengeFailure(account, throttle) {
  const nextFailedAttempts = throttle.failedAttempts + 1;
  const shouldLock = nextFailedAttempts >= MAX_FAILED_ATTEMPTS;
  return updateUser(account.userId, {
    passwordResetChallengeFailedAttempts: shouldLock ? 0 : nextFailedAttempts,
    passwordResetChallengeWindowStartedAt: new Date(throttle.windowStartedAt).toISOString(),
    passwordResetChallengeLockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS).toISOString() : '',
  });
}

async function clearChallengeFailures(account) {
  return updateUser(account.userId, {
    passwordResetChallengeFailedAttempts: 0,
    passwordResetChallengeWindowStartedAt: '',
    passwordResetChallengeLockedUntil: '',
  });
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const email = normalizeEmail(safeString(body.email, 160));
    const zip = normalizeZip(body.zip);
    const phoneLast4 = normalizePhoneLast4(body.phoneLast4 || body.phone);
    const lastName = normalizeLastName(body.lastName);

    if (!email) {
      return json(res, 400, { ok: false, error: 'Email is required.' });
    }

    if (!zip || !phoneLast4 || !lastName) {
      return json(res, 400, {
        ok: false,
        error: 'Enter the ZIP code, last name, and last 4 digits of the phone number saved in your TYFYS profile.',
      });
    }

    const account = await getUserByEmail(email);
    if (!account) {
      return json(res, 404, { ok: false, error: 'We could not verify that account with the details provided.' });
    }

    const throttle = getChallengeThrottle(account);
    if (throttle.isLocked) {
      return json(res, 429, {
        ok: false,
        error: 'Too many reset attempts. Please wait an hour, try the email reset link, or contact TYFYS.',
      });
    }

    const profile = getChallengeProfile(account);
    const matches =
      Number(Boolean(profile.zip && profile.zip === zip)) +
      Number(Boolean(profile.phoneLast4 && profile.phoneLast4 === phoneLast4)) +
      Number(Boolean(profile.lastName && profile.lastName === lastName));

    if (matches < 2) {
      await recordChallengeFailure(account, throttle);
      return json(res, 401, {
        ok: false,
        error: 'Those account details did not match what TYFYS has on file.',
      });
    }

    await clearChallengeFailures(account);
    const reset = await createPasswordReset({ userId: account.userId });
    return json(res, 200, {
      ok: true,
      email: account.email,
      resetToken: reset.token,
      expiresAt: reset.expiresAt,
      message: 'Account verified. Choose your new password now.',
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
