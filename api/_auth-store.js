const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const STORE_PREFIX = 'tyfys:auth';
const FILE_STORE_PATH =
  process.env.TYFYS_AUTH_STORE_FILE || path.join(__dirname, '.local', 'auth-store.json');
const BLOB_STORE_PATH = process.env.TYFYS_AUTH_BLOB_PATH || `${STORE_PREFIX}/store.json`;
const BLOB_MUTATION_RETRIES = 5;
const REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const HAS_UPSTASH_STORE = Boolean(
  REDIS_REST_URL && REDIS_REST_TOKEN
);
const HAS_BLOB_STORE = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

let blobSdkPromise = null;

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizeLeadId(value) {
  return String(value || '').trim().slice(0, 120);
}

function ensureJsonSize(label, value, maxBytes = 450000) {
  const encoded = Buffer.byteLength(JSON.stringify(value || null), 'utf8');
  if (encoded > maxBytes) {
    throw new Error(`${label} is too large to persist`);
  }
}

function createUserId() {
  return `usr_${crypto.randomUUID()}`;
}

function createSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

function defaultFileStore() {
  return {
    users: {},
    emailToUserId: {},
    sessions: {},
  };
}

function normalizeStoreShape(raw) {
  const parsed = raw && typeof raw === 'object' ? raw : {};
  const nextStore = {
    users: parsed.users && typeof parsed.users === 'object' ? parsed.users : {},
    emailToUserId:
      parsed.emailToUserId && typeof parsed.emailToUserId === 'object' ? parsed.emailToUserId : {},
    sessions: {},
  };

  if (parsed.sessions && typeof parsed.sessions === 'object') {
    for (const [sessionId, session] of Object.entries(parsed.sessions)) {
      if (!session || typeof session !== 'object') continue;
      if (Number(session.expiresAt || 0) <= Date.now()) continue;
      nextStore.sessions[sessionId] = session;
    }
  }

  return nextStore;
}

function hostedRuntime() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.NODE_ENV === 'production');
}

function fileStoreEnabled() {
  return !HAS_BLOB_STORE && !HAS_UPSTASH_STORE && !hostedRuntime();
}

function blobStoreEnabled() {
  return HAS_BLOB_STORE && !HAS_UPSTASH_STORE;
}

function assertStoreConfigured() {
  if (!fileStoreEnabled() && !blobStoreEnabled() && !HAS_UPSTASH_STORE) {
    throw new Error(
      'Durable auth storage is not configured. Add KV_REST_API_URL/KV_REST_API_TOKEN, UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN, or BLOB_READ_WRITE_TOKEN.'
    );
  }
}

function ensureStoreDir() {
  fs.mkdirSync(path.dirname(FILE_STORE_PATH), { recursive: true });
}

function readFileStore() {
  ensureStoreDir();
  if (!fs.existsSync(FILE_STORE_PATH)) return defaultFileStore();
  try {
    const raw = fs.readFileSync(FILE_STORE_PATH, 'utf8');
    return normalizeStoreShape(raw ? JSON.parse(raw) : defaultFileStore());
  } catch (error) {
    return defaultFileStore();
  }
}

function writeFileStore(store) {
  ensureStoreDir();
  const tempPath = `${FILE_STORE_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalizeStoreShape(store), null, 2));
  fs.renameSync(tempPath, FILE_STORE_PATH);
}

async function runFileMutation(mutator) {
  const store = readFileStore();
  const result = await mutator(store);
  writeFileStore(store);
  return result;
}

async function getBlobSdk() {
  if (!blobSdkPromise) {
    blobSdkPromise = import('@vercel/blob');
  }
  return blobSdkPromise;
}

function isBlobNotFound(error) {
  if (!error) return false;
  const message = String(error.message || error);
  return error.name === 'BlobNotFoundError' || /blobnotfounderror|not found|does not exist/i.test(message);
}

function isBlobConflict(error) {
  if (!error) return false;
  const message = String(error.message || error);
  return (
    error.name === 'BlobPreconditionFailedError' ||
    /precondition|etag|already exists|already been taken|conflict/i.test(message)
  );
}

async function readBlobStore() {
  const { get, head } = await getBlobSdk();

  try {
    const metadata = await head(BLOB_STORE_PATH);
    const response = await get(BLOB_STORE_PATH, { access: 'private' });
    if (!response?.stream || response.statusCode !== 200) {
      return { etag: metadata?.etag || '', store: defaultFileStore() };
    }

    const raw = await new Response(response.stream).text();
    return {
      etag: metadata?.etag || '',
      store: normalizeStoreShape(raw ? JSON.parse(raw) : defaultFileStore()),
    };
  } catch (error) {
    if (isBlobNotFound(error)) {
      return { etag: '', store: defaultFileStore() };
    }
    throw error;
  }
}

async function writeBlobStore(store, etag = '') {
  const { put } = await getBlobSdk();
  const options = {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/json; charset=utf-8',
  };

  if (etag) {
    options.allowOverwrite = true;
    options.ifMatch = etag;
  }

  return put(BLOB_STORE_PATH, JSON.stringify(normalizeStoreShape(store), null, 2), options);
}

async function runBlobMutation(mutator) {
  for (let attempt = 0; attempt < BLOB_MUTATION_RETRIES; attempt += 1) {
    const { etag, store } = await readBlobStore();
    const result = await mutator(store);

    try {
      await writeBlobStore(store, etag);
      return result;
    } catch (error) {
      if (isBlobConflict(error) && attempt < BLOB_MUTATION_RETRIES - 1) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Unable to persist auth store after repeated retries');
}

async function upstashCommand(args) {
  if (!REDIS_REST_URL || !REDIS_REST_TOKEN) {
    throw new Error(
      'Missing Redis REST env (UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL/KV_REST_API_TOKEN)'
    );
  }

  const response = await fetch(REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_REST_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    throw new Error(`Upstash command failed: ${response.status} ${JSON.stringify(payload)}`);
  }
  return payload?.result;
}

function userKey(userId) {
  return `${STORE_PREFIX}:user:${userId}`;
}

function emailKey(email) {
  return `${STORE_PREFIX}:email:${normalizeEmail(email)}`;
}

function sessionKey(sessionId) {
  return `${STORE_PREFIX}:session:${sessionId}`;
}

async function getUserById(userId) {
  const id = String(userId || '').trim();
  if (!id) return null;
  assertStoreConfigured();

  if (fileStoreEnabled()) {
    const store = readFileStore();
    return store.users[id] || null;
  }

  if (blobStoreEnabled()) {
    const { store } = await readBlobStore();
    return store.users[id] || null;
  }

  const raw = await upstashCommand(['GET', userKey(id)]);
  return raw ? JSON.parse(raw) : null;
}

async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  assertStoreConfigured();

  if (fileStoreEnabled()) {
    const store = readFileStore();
    const userId = store.emailToUserId[normalizedEmail];
    return userId ? store.users[userId] || null : null;
  }

  if (blobStoreEnabled()) {
    const { store } = await readBlobStore();
    const userId = store.emailToUserId[normalizedEmail];
    return userId ? store.users[userId] || null : null;
  }

  const userId = await upstashCommand(['GET', emailKey(normalizedEmail)]);
  if (!userId) return null;
  return getUserById(userId);
}

async function createUser({ email, passwordHash, passwordSalt, displayName, leadId = '', state = null }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new Error('Email is required');
  if (!passwordHash || !passwordSalt) throw new Error('Password hash is required');
  assertStoreConfigured();
  ensureJsonSize('Auth state', state);

  const userId = createUserId();
  const record = {
    userId,
    email: normalizedEmail,
    displayName: String(displayName || '').trim().slice(0, 160),
    leadId: sanitizeLeadId(leadId),
    passwordHash,
    passwordSalt,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    lastLoginAt: '',
    state: state || null,
  };

  if (fileStoreEnabled()) {
    return runFileMutation((store) => {
      if (store.emailToUserId[normalizedEmail]) {
        throw new Error('Account already exists for this email');
      }
      store.users[userId] = record;
      store.emailToUserId[normalizedEmail] = userId;
      return record;
    });
  }

  if (blobStoreEnabled()) {
    return runBlobMutation((store) => {
      if (store.emailToUserId[normalizedEmail]) {
        throw new Error('Account already exists for this email');
      }
      store.users[userId] = record;
      store.emailToUserId[normalizedEmail] = userId;
      return record;
    });
  }

  const existingUserId = await upstashCommand(['GET', emailKey(normalizedEmail)]);
  if (existingUserId) throw new Error('Account already exists for this email');
  await upstashCommand(['SET', userKey(userId), JSON.stringify(record)]);
  await upstashCommand(['SET', emailKey(normalizedEmail), userId]);
  return record;
}

async function updateUser(userId, updates = {}) {
  assertStoreConfigured();
  const existing = await getUserById(userId);
  if (!existing) throw new Error('Account not found');

  const nextEmail = updates.email ? normalizeEmail(updates.email) : existing.email;
  const nextState = Object.prototype.hasOwnProperty.call(updates, 'state') ? updates.state : existing.state;
  ensureJsonSize('Auth state', nextState);

  const nextRecord = {
    ...existing,
    ...updates,
    email: nextEmail,
    leadId: Object.prototype.hasOwnProperty.call(updates, 'leadId')
      ? sanitizeLeadId(updates.leadId)
      : existing.leadId,
    updatedAt: nowIso(),
    state: nextState,
  };

  if (fileStoreEnabled()) {
    return runFileMutation((store) => {
      if (nextEmail !== existing.email) {
        const conflictingUserId = store.emailToUserId[nextEmail];
        if (conflictingUserId && conflictingUserId !== userId) {
          throw new Error('Another account already uses that email');
        }
        delete store.emailToUserId[existing.email];
        store.emailToUserId[nextEmail] = userId;
      }
      store.users[userId] = nextRecord;
      return nextRecord;
    });
  }

  if (blobStoreEnabled()) {
    return runBlobMutation((store) => {
      if (nextEmail !== existing.email) {
        const conflictingUserId = store.emailToUserId[nextEmail];
        if (conflictingUserId && conflictingUserId !== userId) {
          throw new Error('Another account already uses that email');
        }
        delete store.emailToUserId[existing.email];
        store.emailToUserId[nextEmail] = userId;
      }
      store.users[userId] = nextRecord;
      return nextRecord;
    });
  }

  if (nextEmail !== existing.email) {
    const conflictingUserId = await upstashCommand(['GET', emailKey(nextEmail)]);
    if (conflictingUserId && conflictingUserId !== userId) {
      throw new Error('Another account already uses that email');
    }
    await upstashCommand(['DEL', emailKey(existing.email)]);
    await upstashCommand(['SET', emailKey(nextEmail), userId]);
  }
  await upstashCommand(['SET', userKey(userId), JSON.stringify(nextRecord)]);
  return nextRecord;
}

async function createSession({ userId }) {
  if (!userId) throw new Error('User id is required for session');
  assertStoreConfigured();
  const sessionId = createSessionId();
  const session = {
    sessionId,
    userId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  if (fileStoreEnabled()) {
    await runFileMutation((store) => {
      store.sessions[sessionId] = session;
      return session;
    });
    return session;
  }

  if (blobStoreEnabled()) {
    await runBlobMutation((store) => {
      store.sessions[sessionId] = session;
      return session;
    });
    return session;
  }

  await upstashCommand([
    'SET',
    sessionKey(sessionId),
    JSON.stringify(session),
    'PX',
    String(SESSION_TTL_MS),
  ]);
  return session;
}

async function getSession(sessionId) {
  const id = String(sessionId || '').trim();
  if (!id) return null;
  assertStoreConfigured();

  if (fileStoreEnabled()) {
    const store = readFileStore();
    return store.sessions[id] || null;
  }

  if (blobStoreEnabled()) {
    const { store } = await readBlobStore();
    return store.sessions[id] || null;
  }

  const raw = await upstashCommand(['GET', sessionKey(id)]);
  return raw ? JSON.parse(raw) : null;
}

async function refreshSession(sessionId) {
  const existing = await getSession(sessionId);
  if (!existing) return null;

  const nextSession = {
    ...existing,
    updatedAt: nowIso(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  if (fileStoreEnabled()) {
    await runFileMutation((store) => {
      store.sessions[sessionId] = nextSession;
      return nextSession;
    });
    return nextSession;
  }

  if (blobStoreEnabled()) {
    await runBlobMutation((store) => {
      store.sessions[sessionId] = nextSession;
      return nextSession;
    });
    return nextSession;
  }

  await upstashCommand([
    'SET',
    sessionKey(sessionId),
    JSON.stringify(nextSession),
    'PX',
    String(SESSION_TTL_MS),
  ]);
  return nextSession;
}

async function deleteSession(sessionId) {
  const id = String(sessionId || '').trim();
  if (!id) return;
  assertStoreConfigured();

  if (fileStoreEnabled()) {
    await runFileMutation((store) => {
      delete store.sessions[id];
      return true;
    });
    return;
  }

  if (blobStoreEnabled()) {
    await runBlobMutation((store) => {
      delete store.sessions[id];
      return true;
    });
    return;
  }

  await upstashCommand(['DEL', sessionKey(id)]);
}

module.exports = {
  SESSION_TTL_MS,
  blobStoreEnabled,
  createSession,
  createUser,
  deleteSession,
  fileStoreEnabled,
  getSession,
  getUserByEmail,
  getUserById,
  normalizeEmail,
  refreshSession,
  updateUser,
};
