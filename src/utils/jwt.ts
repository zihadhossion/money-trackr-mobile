/**
 * Just enough JWT reading to decide, without a network round trip, whether a
 * stored session is worth trusting on launch. This does NOT verify the
 * signature — the server still does that on every request. Anything malformed
 * or unreadable is reported as expired, so the caller falls back to login.
 */

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decodes base64url without relying on `atob`. Hermes does provide `atob`, but
 * that is not something we can confirm at build time, and getting it wrong
 * would sign every user out on launch — so decode it here instead.
 */
function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/]/g, '');
  let out = '';

  for (let i = 0; i < normalized.length; i += 4) {
    const chunk =
      (B64_ALPHABET.indexOf(normalized[i]) << 18) |
      (B64_ALPHABET.indexOf(normalized[i + 1]) << 12) |
      ((normalized[i + 2] ? B64_ALPHABET.indexOf(normalized[i + 2]) : 0) << 6) |
      (normalized[i + 3] ? B64_ALPHABET.indexOf(normalized[i + 3]) : 0);

    out += String.fromCharCode((chunk >> 16) & 0xff);
    if (normalized[i + 2]) out += String.fromCharCode((chunk >> 8) & 0xff);
    if (normalized[i + 3]) out += String.fromCharCode(chunk & 0xff);
  }

  return out;
}

/** Seconds since the epoch at which the token expires, or null if unreadable. */
export function getTokenExp(token: string | null): number | null {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const { exp } = JSON.parse(decodeBase64Url(payload));
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

// A device clock running a few minutes fast would otherwise throw away a
// session the server still considers perfectly valid.
const CLOCK_SKEW_SECONDS = 5 * 60;

export function isTokenExpired(token: string | null): boolean {
  const exp = getTokenExp(token);
  if (exp === null) return true;
  return exp + CLOCK_SKEW_SECONDS <= Date.now() / 1000;
}
