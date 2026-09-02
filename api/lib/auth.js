import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET;
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 Hours

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
  if (!AUTH_SECRET) throw new Error('AUTH_SECRET environment variable is missing.');
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `cms_session_${expiresAt}`;
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verify HMAC-SHA256 signed session token.
 */
export function verifySessionToken(token) {
  if (!AUTH_SECRET) return false;
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');

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
 * Accepts "250826".
 */
export function verifyPinServer(pin) {
  if (!pin || typeof pin !== 'string' || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return false;
  }

  const expectedHash = process.env.CMS_PIN_SHA256;
  if (!expectedHash || !/^[a-f0-9]{64}$/i.test(expectedHash)) return false;
  const computedHash = sha256(pin);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
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
