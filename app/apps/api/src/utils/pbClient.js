// Lazy PocketBase superuser client for Express.
//
// Unlike the legacy `pocketbaseClient.js` (which health-checks at import time
// and calls process.exit(1) when PocketBase is not up yet — killing the whole
// API server and turning every request into a generic 500), this client never
// runs anything at import time. Auth happens on the first real call and is
// retried on the next one if it failed.
import Pocketbase from 'pocketbase';
import logger from './logger.js';

const POCKETBASE_HOST = process.env.POCKETBASE_URL || 'http://localhost:8090';

const pbClient = new Pocketbase(POCKETBASE_HOST);
pbClient.autoCancellation(false);

let authPromise = null;

export async function ensureSuperuserAuth() {
	if (pbClient.authStore.isValid) return pbClient;

	if (!authPromise) {
		const email = process.env.PB_SUPERUSER_EMAIL;
		const password = process.env.PB_SUPERUSER_PASSWORD;

		if (!email || !password) {
			throw new Error('PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD missing in apps/api/.env');
		}

		authPromise = pbClient
			.collection('_superusers')
			.authWithPassword(email, password)
			.catch((err) => {
				logger.error('PocketBase superuser auth failed:', err?.message || err);
				throw err;
			})
			.finally(() => {
				authPromise = null;
			});
	}

	await authPromise;

	return pbClient;
}

pbClient.beforeSend = async function (url, options) {
	if (url.includes('/api/collections/_superusers/auth-with-password')) {
		return { url, options };
	}

	await ensureSuperuserAuth();

	if (pbClient.authStore.isValid && pbClient.authStore.token) {
		options.headers = options.headers || {};
		options.headers.Authorization = pbClient.authStore.token;
	}

	return { url, options };
};

/** True when the PocketBase server is reachable. */
export async function isPocketbaseReachable() {
	try {
		const res = await fetch(`${POCKETBASE_HOST}/api/health`, { method: 'HEAD' });
		return res.ok;
	} catch {
		return false;
	}
}

/** Detects "PocketBase is down / unreachable" style failures (vs. real 4xx). */
export function isConnectionError(error) {
	if (!error) return false;
	if (error.status === 0) return true;
	const msg = String(error.message || '');
	return /fetch failed|ECONNREFUSED|network|socket hang up|Failed to fetch/i.test(msg);
}

export default pbClient;
export { pbClient };
