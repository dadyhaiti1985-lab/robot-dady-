import { useEffect, useRef, useState, useCallback } from 'react';
import perfMonitor from '@/utils/performanceMonitor';

/**
 * Hook to offload heavy market data analysis to a Web Worker.
 * Uses Transferable Objects (ArrayBuffer) for zero-copy data transfer.
 */
export function useMarketDataWorker() {
  const workerRef = useRef(null);
  const pendingRef = useRef(null);
  const startTimeRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/marketDataWorker.js', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (e) => {
        const { type, data, error: errMsg } = e.data || {};
        if (type === 'ANALYSIS_COMPLETE') {
          const elapsed = startTimeRef.current ? performance.now() - startTimeRef.current : 0;
          perfMonitor.recordWorkerTime(elapsed);
          setAnalysisResult(data);
          setIsAnalyzing(false);
          setError(null);
          if (pendingRef.current) {
            const next = pendingRef.current;
            pendingRef.current = null;
            _send(next);
          }
        } else if (type === 'ANALYSIS_ERROR') {
          setError(errMsg || 'Worker analysis failed');
          setIsAnalyzing(false);
        }
      };

      workerRef.current.onerror = (ev) => {
        setError(ev.message || 'Worker error');
        setIsAnalyzing(false);
      };
    } catch (err) {
      setError('Web Workers not available');
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const _send = useCallback((payload) => {
    if (!workerRef.current) return;
    startTimeRef.current = performance.now();
    setIsAnalyzing(true);
    setError(null);

    const { prices = [], highs = [], lows = [], volumes = [], timestamps = [] } = payload;

    // Convert to Float64Array for zero-copy Transferable transfer
    const pricesBuf = new Float64Array(prices);
    const highsBuf = new Float64Array(highs.length ? highs : prices);
    const lowsBuf = new Float64Array(lows.length ? lows : prices);
    const volumesBuf = new Float64Array(volumes.length ? volumes : new Array(prices.length).fill(0));
    const tsBuf = new Float64Array(timestamps.length ? timestamps : [Date.now()]);

    workerRef.current.postMessage(
      {
        type: 'ANALYZE_MARKET',
        prices: pricesBuf.buffer,
        highs: highsBuf.buffer,
        lows: lowsBuf.buffer,
        volumes: volumesBuf.buffer,
        timestamps: tsBuf.buffer,
      },
      [pricesBuf.buffer, highsBuf.buffer, lowsBuf.buffer, volumesBuf.buffer, tsBuf.buffer]
    );
  }, []);

  const analyzeMarketData = useCallback((payload) => {
    if (!workerRef.current) return;
    if (isAnalyzing) {
      pendingRef.current = payload;
      return;
    }
    _send(payload);
  }, [isAnalyzing, _send]);

  return { analyzeMarketData, isAnalyzing, analysisResult, error };
}

export default useMarketDataWorker;
