/**
 * Authentication Service for Zahara Portfolio CMS (/manage)
 *
 * Security Architecture:
 * 1. Authentication is performed SERVER-SIDE via POST /api/auth/login.
 * 2. Server verifies the 6-digit PIN and issues a secure HTTP-Only session cookie.
 * 3. Client does not store or process plaintext PINs or secret hashes.
 */

let cachedAuthStatus = null;

/**
 * Verify 6-digit numerical PIN via server-side API.
 * @param {string} inputPin - 6-digit numerical PIN
 * @returns {Promise<boolean>}
 */
export async function verifyPin(inputPin) {
  if (!inputPin || inputPin.length !== 6 || !/^\d{6}$/.test(inputPin)) {
    return false;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: inputPin }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      cachedAuthStatus = true;
      return true;
    }
    cachedAuthStatus = false;
    return false;
  } catch (err) {
    console.error('[AuthService] Server authentication request failed:', err);
    cachedAuthStatus = false;
    return false;
  }
}

/**
 * Check if the user is currently authenticated via server session API.
 * @returns {Promise<boolean>}
 */
export async function isAuthenticatedAsync() {
  try {
    const res = await fetch('/api/auth/me');
    const json = await res.json();
    cachedAuthStatus = Boolean(json.authenticated);
    return cachedAuthStatus;
  } catch (err) {
    return false;
  }
}

/**
 * Synchronous getter for cached authentication status.
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (cachedAuthStatus !== null) {
    return cachedAuthStatus;
  }
  return false;
}

/**
 * Revoke session via server API and logout.
 */
export async function logout() {
  cachedAuthStatus = false;
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('[AuthService] Logout request failed:', err);
  }
}
