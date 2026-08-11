import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

/**
 * Hook for calling the Oracle Trader Pro strategy engine.
 * Calls POST /strategy/evaluate and returns the signal result.
 */
export function useOracleStrategy() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const evaluate = useCallback(async ({
    candles = [],
    aiConfidence = 0.95,
    accountBalance = 10000,
    riskPerTradePct = 0.02,
    rrRatio = 2.0,
  }) => {
    if (!candles || candles.length < 60) {
      setError('Need at least 60 candles for Oracle strategy evaluation.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (pb.authStore.token) headers.Authorization = `Bearer ${pb.authStore.token}`;
      const res = await apiServerClient.fetch('/strategy/evaluate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ candles, aiConfidence, accountBalance, riskPerTradePct, rrRatio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Strategy evaluation failed');
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setResult(null); setError(null); }, []);

  return { evaluate, result, loading, error, reset };
}
