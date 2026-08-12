/**
 * useBotToggle — robust bot toggle hook with retry, duplicate-prevention,
 * and exponential backoff.
 */
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const MAX_RETRIES = 3;

async function authFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    Authorization: `Bearer ${pb.authStore.token}`,
  };
  let res = await apiServerClient.fetch(path, { ...options, headers });
  if (res.status === 401 && pb.authStore.isValid) {
    try { await pb.collection('users').authRefresh(); } catch (_) { return res; }
    res = await apiServerClient.fetch(path, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${pb.authStore.token}` },
    });
  }
  return res;
}

export function useBotToggle(initialActive = false) {
  const [botActive, setBotActive] = useState(initialActive);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(false);
  const retryCountRef = useRef(0);

  const toggleBot = useCallback(async (forceValue) => {
    // Prevent duplicate concurrent requests
    if (inFlightRef.current) {
      console.warn('[useBotToggle] Toggle already in progress — skipped');
      return;
    }

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);

    const attemptToggle = async (attempt) => {
      const next = forceValue !== undefined ? forceValue : !botActive;
      try {
        const res = await authFetch('/bot/toggle', {
          method: 'POST',
          body: JSON.stringify({ botActive: next }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success !== false) {
          const newState = typeof data.botActive === 'boolean' ? data.botActive : next;
          setBotActive(newState);
          retryCountRef.current = 0;
          toast.success(newState ? '🟢 Oracle AI Trading — ACTIVATED' : '🔴 Oracle AI Trading — STOPPED');
          return true;
        }

        const code = data?.code || 'UNKNOWN';
        const msg = data?.error || `HTTP ${res.status}`;

        if (res.status === 401) {
          setError('Session expired. Please sign in again.');
          toast.error('Session expired — please sign in again.');
          return false; // Don't retry auth errors
        }

        if (res.status === 400 || code === 'NO_CREDENTIALS' || code === 'INVALID_CREDENTIALS' || code === 'INVALID_BODY' || code === 'INVALID_STATUS') {
          setError(msg);
          toast.error(msg);
          return false; // Don't retry client errors
        }

        // Infrastructure failures — don't retry, show clear message immediately
        if (res.status === 503 || code === 'PB_UNAVAILABLE' || code === 'PB_SAVE_FAILED') {
          const infraMsg = 'Service unavailable — backend or database is offline. Please try again in a moment.';
          setError(infraMsg);
          toast.error(infraMsg);
          return false;
        }

        throw new Error(msg); // Retriable server error (5xx other than 503)

      } catch (err) {
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[useBotToggle] Attempt ${attempt + 1} failed: ${err.message}. Retrying in ${delay}ms…`);
          await new Promise(r => setTimeout(r, delay));
          return attemptToggle(attempt + 1);
        }
        setError(err.message || 'Failed to toggle bot. Please try again.');
        toast.error('Failed to toggle bot — please try again.');
        return false;
      }
    };

    try {
      await attemptToggle(0);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, [botActive]);

  return { botActive, setBotActive, isLoading, error, toggleBot };
}

export default useBotToggle;
