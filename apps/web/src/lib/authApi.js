import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

/**
 * Calls the API server with the signed-in user's PocketBase token so the
 * backend can scope every response to that account only.
 */
export async function authApiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(pb.authStore.token ? { Authorization: `Bearer ${pb.authStore.token}` } : {}),
  };
  return apiServerClient.fetch(path, { ...options, headers });
}

export default authApiFetch;
