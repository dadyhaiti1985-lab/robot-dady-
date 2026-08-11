import Pocketbase from 'pocketbase';

// Frontend user auth uses PocketBase public API routes under /hcgi/platform.
// The client-side login/signup flow authenticates regular `users` records.
// Backend server-side code in apps/api handles `_superusers` separately.
const POCKETBASE_API_URL = '/hcgi/platform';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
