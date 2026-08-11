const DEFAULT_API_SERVER_URL = '/hcgi/api';
const DEV_DIRECT_API_URL = 'http://localhost:3001';

function sanitizePath(url) {
    if (typeof url !== 'string' || !url.trim()) return '/';
    return url.startsWith('/') ? url : `/${url}`;
}

function joinUrl(base, path) {
    const normalizedBase = String(base || '').replace(/\/$/, '');
    return `${normalizedBase}${sanitizePath(path)}`;
}

function resolveBaseUrl() {
    const fromEnv = (import.meta?.env?.VITE_API_SERVER_URL || '').trim();
    if (fromEnv) return fromEnv;
    return DEFAULT_API_SERVER_URL;
}

function shouldTryLocalhostFallback(baseUrl) {
    if (typeof window === 'undefined') return false;
    if (/^https?:\/\//i.test(baseUrl)) return false;
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12_000) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await window.fetch(url, { ...options, signal: options.signal || controller.signal });
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export const API_SERVER_URL = resolveBaseUrl();

const apiServerClient = {
    fetch: async (url, options = {}) => {
        const path = sanitizePath(url);
        const primaryUrl = joinUrl(API_SERVER_URL, path);

        try {
            return await fetchWithTimeout(primaryUrl, options);
        } catch (primaryError) {
            const fallbackEligible = shouldTryLocalhostFallback(API_SERVER_URL);
            if (fallbackEligible) {
                try {
                    return await fetchWithTimeout(joinUrl(DEV_DIRECT_API_URL, path), options);
                } catch {
                    // Keep throwing the primary error below with better context.
                }
            }

            const message = primaryError?.name === 'AbortError'
                ? `API request timeout after 12000ms (${primaryUrl})`
                : `API request failed (${primaryUrl}): ${primaryError?.message || 'Unknown network error'}`;
            const enrichedError = new Error(message);
            enrichedError.cause = primaryError;
            throw enrichedError;
        }
    },
};

export default apiServerClient;

export { apiServerClient };
