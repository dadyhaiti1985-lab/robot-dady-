/**
 * useAIConnection — monitors AI backend connectivity with auto-reconnection.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import apiServerClient, { isApiOfflineError } from '@/lib/apiServerClient';

const MAX_ATTEMPTS = 8;

export function useAIConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastChecked, setLastChecked] = useState(null);
  const [lastError, setLastError] = useState('');
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const checkConnection = useCallback(async (attempt = 0) => {
    if (!mountedRef.current) return;
    try {
      const res = await apiServerClient.fetch('/health');
      if (!mountedRef.current) return;
      if (res.ok) {
        setIsConnected(true);
        setReconnectAttempts(0);
        setLastError('');
        setLastChecked(new Date().toISOString());
        // Re-check every 30s while healthy
        timerRef.current = setTimeout(() => checkConnection(0), 30_000);
      } else {
        throw new Error(`${res.status}`);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setIsConnected(false);
      const offlineMessage = 'Seve API la pa aktive sou port 3001';
      setLastError(isApiOfflineError(err) ? offlineMessage : (err?.message || 'Backend unreachable'));
      const nextAttempt = attempt + 1;
      setReconnectAttempts(nextAttempt);
      if (nextAttempt <= MAX_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30_000);
        console.warn(`[useAIConnection] Backend unreachable (${err.message}). Retry ${nextAttempt}/${MAX_ATTEMPTS} in ${delay}ms`);
        timerRef.current = setTimeout(() => checkConnection(nextAttempt), delay);
      } else {
        console.error('[useAIConnection] Max reconnect attempts reached. Giving up.');
        setConnectionFailed(true);
        toast.error('AI service is currently unavailable. Please try again later.');
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    checkConnection(0);
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [checkConnection]);

  const reconnect = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setReconnectAttempts(0);
    setConnectionFailed(false);
    setLastError('');
    checkConnection(0);
  }, [checkConnection]);

  return { isConnected, connectionFailed, reconnectAttempts, lastChecked, lastError, reconnect };
}

export default useAIConnection;
