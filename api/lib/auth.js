import crypto from 'crypto';

const DEFAULT_AUTH_SECRET = 'zeze_cms_secure_session_secret_default_2026';
const DEFAULT_PIN_SHA256 = '7c2f369bde679d94d91018d1d8934aee9153b0b48b077795aabd2f8c869f8875'; // SHA-256 of "250826"
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 Hours

function getAuthSecret() {
  return process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;
}

/**
 * SHA-256 hash helper.
 */
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate HMAC-SHA256 signed session token.
 * Token payload format: timestamp.signature
 */
export function createSessionToken() {
  const secret = getAuthSecret();
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `cms_session_${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verify HMAC-SHA256 signed session token.
 */
export function verifySessionToken(token) {
  const secret = getAuthSecret();
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  if (hmac.length !== expectedHmac.length || !crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) return false;

  const expiresAtStr = payload.replace('cms_session_', '');
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  return true;
}

/**
 * Verify 6-digit numerical PIN server-side.
 * Default PIN: "250826"
 */
export function verifyPinServer(pin) {
  if (!pin || typeof pin !== 'string' || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return false;
  }

  let expectedHash = process.env.CMS_PIN_SHA256;

  // Fallback to default PIN "250826" SHA-256 hash if env var is missing or invalid 64-hex string
  if (!expectedHash || !/^[a-f0-9]{64}$/i.test(expectedHash)) {
    expectedHash = DEFAULT_PIN_SHA256;
  }

  const computedHash = sha256(pin);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash.toLowerCase()), 
    Buffer.from(expectedHash.toLowerCase())
  );
}

/**
 * Express Middleware: Protect endpoints requiring admin authentication.
 * Returns 401 Unauthorized if request does not contain a valid session cookie or Bearer token.
 */
export function requireAuth(req, res, next) {
  // Extract token from Cookie or Authorization header
  let token = null;

  if (req.cookies && req.cookies.zeze_cms_session) {
    token = req.cookies.zeze_cms_session;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/zeze_cms_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token || !verifySessionToken(token)) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Akses ditolak. Sesi tidak valid atau telah expired.',
      },
    });
  }

  next();
}
