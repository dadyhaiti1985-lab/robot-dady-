import { useState, useRef, useCallback, useEffect } from 'react';

const _ric = typeof requestIdleCallback === 'function'
  ? requestIdleCallback
  : (cb, opts) => setTimeout(() => cb({ timeRemaining: () => 16, didTimeout: true }), (opts && opts.timeout) || 50);

/**
 * Hook for polling account balance using requestIdleCallback to avoid blocking the main thread.
 * @param {Function} fetchFn - async function that returns { total, available, currency }
 * @param {number} intervalMs - polling interval in ms (default 60000)
 */
export function useBalancePolling(fetchFn, intervalMs = 60000) {
  const [balance, setBalance] = useState({ total: 0, available: 0, currency: 'USD' });
  const [status, setStatus] = useState('idle');
  const failCountRef = useRef(0);
  const stopRef = useRef(false);
  const timerRef = useRef(null);
  const updateQueueRef = useRef([]);

  const drainQueue = useCallback(() => {
    _ric((deadline) => {
      while (
        (deadline.timeRemaining() > 1 || deadline.didTimeout) &&
        updateQueueRef.current.length > 0
      ) {
        const update = updateQueueRef.current.shift();
        setBalance(update);
        setStatus('live');
      }
      if (updateQueueRef.current.length > 0) {
        _ric(drainQueue, { timeout: 50 });
      }
    }, { timeout: 50 });
  }, []);

  const poll = useCallback(async () => {
    if (stopRef.current) return;
    setStatus('fetching');
    try {
      const result = await fetchFn();
      if (result) {
        updateQueueRef.current.push(result);
        drainQueue();
        failCountRef.current = 0;
      } else {
        failCountRef.current++;
      }
    } catch {
      failCountRef.current++;
      setStatus('error');
    }
    if (failCountRef.current >= 5) {
      stopRef.current = true;
      setStatus('stopped');
      return;
    }
    const backoff = failCountRef.current === 0
      ? intervalMs
      : Math.min(intervalMs * Math.pow(2, failCountRef.current), 300000);
    timerRef.current = setTimeout(poll, backoff);
  }, [fetchFn, intervalMs, drainQueue]);

  useEffect(() => {
    poll();
    return () => {
      clearTimeout(timerRef.current);
      stopRef.current = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    stopRef.current = false;
    failCountRef.current = 0;
    setStatus('idle');
    clearTimeout(timerRef.current);
    poll();
  }, [poll]);

  return { balance, status, reset };
}

export default useBalancePolling;
