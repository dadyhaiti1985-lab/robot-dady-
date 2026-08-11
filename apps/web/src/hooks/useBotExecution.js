/**
 * useBotExecution — sends trade signals to the backend execution controller
 */
import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

export function useBotExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError]           = useState(null);
  const [lastOrder, setLastOrder]   = useState(null);

  const executeSignal = useCallback(async (signal) => {
    if (!signal) throw new Error('Signal is required');

    setIsExecuting(true);
    setError(null);

    try {
      const response = await apiServerClient.fetch('/ai-signals/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ signal }),
      });

      const data = await response.json();

      if (!data.success) {
        const msg = data.message || 'Failed to execute signal';
        setError(msg);
        throw new Error(msg);
      }

      setLastOrder({
        orderId: data.orderId,
        pair: signal.pair,
        side: signal.type,
        timestamp: new Date(),
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return { executeSignal, isExecuting, error, lastOrder, setError };
}

export default useBotExecution;
