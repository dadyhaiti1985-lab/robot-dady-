const DEFAULT_API_SERVER_URL = '/hcgi/api';
const DEV_DIRECT_API_URL = 'http://localhost:3001';

const LEGACY_PATH_ALIASES = [
    [/^\/oracle_r-pro\b/i, '/oracle-trader-pro'],
    [/^\/hcgi\/oracle_r-pro\b/i, '/oracle-trader-pro'],
    [/^\/hcgi\/oracle-trader-pro\b/i, '/oracle-trader-pro'],
    [/^\/hcgi\/api\b/i, ''],
];

function sanitizePath(url) {
    if (typeof url !== 'string' || !url.trim()) return '/';
    const withLeadingSlash = url.startsWith('/') ? url : `/${url}`;
    let normalizedPath = withLeadingSlash;

    for (const [pattern, replacement] of LEGACY_PATH_ALIASES) {
        if (pattern.test(normalizedPath)) {
            normalizedPath = normalizedPath.replace(pattern, replacement || '');
            if (!normalizedPath.startsWith('/')) normalizedPath = `/${normalizedPath}`;
            break;
        }
    }

    return normalizedPath;
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

export function isApiOfflineError(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        message.includes('failed to fetch')
        || message.includes('connection refused')
        || message.includes('couldn\'t connect to server')
        || message.includes('network error')
        || message.includes('api request timeout')
    );
}

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
            enrichedError.code = isApiOfflineError(primaryError) || /api request failed|timeout/i.test(message)
                ? 'API_OFFLINE'
                : 'API_REQUEST_FAILED';
            throw enrichedError;
        }
    },
};

export default apiServerClient;

export { apiServerClient };
