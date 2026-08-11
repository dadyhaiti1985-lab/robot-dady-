import { API_SERVER_URL } from '@/lib/apiServerClient';

/**
 * Checks if the backend API server is reachable.
 * @returns {{ healthy: boolean, status?: number, error?: string, timestamp: string }}
 */
export async function checkAPIHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await window.fetch(`${API_SERVER_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return {
      healthy: response.ok,
      status: response.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[apiHealthCheck] Backend unreachable:', error.message);
    return {
      healthy: false,
      error: error.name === 'AbortError' ? 'Request timed out' : error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export default checkAPIHealth;
