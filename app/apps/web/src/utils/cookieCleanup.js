/**
 * Cookie & localStorage cleanup utility
 * Runs on app startup to prevent HTTP 431 (Request Header Fields Too Large) errors
 */

const STALE_PREFIXES = ['temp_', 'cache_', 'debug_', 'tmp_', 'h_', '_ga', '_gid', 'amp_', 'ajs_'];
const ESSENTIAL_LS_KEYS = new Set(['pocketbase_auth']);
const PB_TOKEN_KEY = 'pocketbase_auth';
// Max size per localStorage/sessionStorage value (2KB)
const MAX_STORAGE_VALUE_SIZE = 2048;

// Cookies set by Hostinger tracking/analytics that can accumulate
const TRACKING_COOKIE_PATTERNS = [
  'frontend-event', 'h_sid', 'h_vid', 'h_uid', 'hstng', '_ga', '_gid',
  '_gat', 'amplitude', 'analytics', 'tracking', 'visitor', '_fbp', '_fbc',
];

function parseCookies() {
  return document.cookie.split(';').reduce((acc, pair) => {
    const [key, ...val] = pair.trim().split('=');
    if (key) acc[decodeURIComponent(key.trim())] = val.join('=');
    return acc;
  }, {});
}

function deleteCookie(name) {
  const paths = ['/', '/api', '/hcgi'];
  const domains = [window.location.hostname, `.${window.location.hostname}`, ''];
  for (const path of paths) {
    for (const domain of domains) {
      const domainPart = domain ? `; domain=${domain}` : '';
      document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainPart}`;
    }
  }
}

function getCookieHeaderSize() {
  return new Blob([document.cookie]).size;
}

export function cleanupCookies() {
  const cleaned = { cookies: [], localStorage: [] };

  try {
    const cookies = parseCookies();

    // Step 1: Delete known tracking/analytics cookies unconditionally
    for (const name of Object.keys(cookies)) {
      const lower = name.toLowerCase();
      if (TRACKING_COOKIE_PATTERNS.some(p => lower.includes(p))) {
        deleteCookie(name);
        cleaned.cookies.push(`${name} (tracking)`);
      }
    }

    // Step 2: Delete oversized non-essential cookies (>1KB)
    const afterStep1 = parseCookies();
    for (const [name, value] of Object.entries(afterStep1)) {
      const cookieSize = new Blob([`${name}=${value}`]).size;
      if (cookieSize > 1024) {
        deleteCookie(name);
        cleaned.cookies.push(`${name} (${cookieSize}B - oversized)`);
      }
    }

    // Step 3: If total cookie header still > 3KB, nuke everything non-essential
    if (getCookieHeaderSize() > 3072) {
      const remaining = parseCookies();
      const essential = ['pocketbase', 'pb_'];
      for (const name of Object.keys(remaining)) {
        const lower = name.toLowerCase();
        if (!essential.some(e => lower.startsWith(e))) {
          deleteCookie(name);
          cleaned.cookies.push(`${name} (force-clean - header ${getCookieHeaderSize()}B)`);
        }
      }
    }
  } catch (_) { /* silently ignore */ }

  // Clean localStorage
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (ESSENTIAL_LS_KEYS.has(key)) continue;

      // Remove stale-prefix keys
      if (STALE_PREFIXES.some(p => key.startsWith(p))) {
        keysToRemove.push(key);
        continue;
      }

      // Remove oversized values (>2KB for non-auth keys)
      try {
        const val = localStorage.getItem(key);
        if (val && val.length > MAX_STORAGE_VALUE_SIZE) {
          keysToRemove.push(key);
        }
      } catch (_) { /* ignore */ }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
      cleaned.localStorage.push(`ls:${key}`);
    }
  } catch (_) { /* silently ignore */ }

  // Clean sessionStorage
  try {
    const ssKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      try {
        const val = sessionStorage.getItem(key);
        if (val && val.length > MAX_STORAGE_VALUE_SIZE) {
          ssKeys.push(key);
        }
      } catch (_) { /* ignore */ }
    }
    for (const key of ssKeys) {
      sessionStorage.removeItem(key);
      cleaned.localStorage.push(`ss:${key}`);
    }
  } catch (_) { /* silently ignore */ }

  if (cleaned.cookies.length > 0 || cleaned.localStorage.length > 0) {
    console.info('[cookieCleanup] Cleaned items:', cleaned);
  }

  return cleaned;
}

export function trimAuthToken() {
  try {
    const raw = localStorage.getItem(PB_TOKEN_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.model) {
      const { id, email, verified, name } = parsed.model;
      parsed.model = { id, email, verified, name };
      localStorage.setItem(PB_TOKEN_KEY, JSON.stringify(parsed));
    }
  } catch (_) { /* ignore */ }
}

/**
 * Block Hostinger analytics from sending large tracking payloads.
 * Intercepts fetch/XHR to frontend-event-api.hostinger.com and drops them.
 */
export function blockHostingerTracking() {
  try {
    const BLOCKED_HOSTS = [
      'frontend-event-api.hostinger.com',
      'analytics.hostinger.com',
      'tracking.hostinger.com',
    ];

    const isBlocked = (url) => {
      try {
        const u = new URL(url, window.location.origin);
        return BLOCKED_HOSTS.some(h => u.hostname === h || u.hostname.endsWith(`.${h}`));
      } catch (_) { return false; }
    };

    // Intercept fetch
    const _fetch = window.fetch;
    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : input?.url ?? '';
      if (isBlocked(url)) return Promise.resolve(new Response('', { status: 204 }));
      return _fetch.apply(this, arguments);
    };

    // Intercept XHR
    const _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (isBlocked(url)) {
        this._blocked = true;
      }
      return _open.apply(this, arguments);
    };
    const _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
      if (this._blocked) return;
      return _send.apply(this, arguments);
    };
  } catch (_) { /* silently ignore */ }
}
