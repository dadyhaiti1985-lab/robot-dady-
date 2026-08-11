import { useState, useRef, useEffect, useCallback } from 'react';
import { getCandleManager, normalizeCandle } from '@/utils/candleDataManager';

const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'BNB-USD'];
const BASE_PRICES = { 'BTC-USD': 67200, 'ETH-USD': 3520, 'SOL-USD': 178, 'XRP-USD': 0.62, 'BNB-USD': 415 };

const _ric = typeof requestIdleCallback === 'function'
  ? requestIdleCallback
  : (cb, opts) => setTimeout(() => cb({ timeRemaining: () => 16, didTimeout: true }), (opts && opts.timeout) || 50);

/**
 * Hook for live market data using requestIdleCallback + RAF for non-blocking price updates.
 */
export function useLiveMarketData(symbols = SYMBOLS) {
  // Initialise per-asset candle managers
  useEffect(() => {
    symbols.forEach(s => getCandleManager(s, 200));
  }, [symbols]);

  const [prices, setPrices] = useState(() =>
    Object.fromEntries(symbols.map(s => [s, { price: BASE_PRICES[s] || 100, change: 0, changePercent: 0 }]))
  );
  const [isLive, setIsLive] = useState(false);
  const pricesRef = useRef(prices);
  const priceQueueRef = useRef([]);
  const drainScheduledRef = useRef(false);

  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  const drainQueue = useCallback(() => {
    drainScheduledRef.current = false;
    if (priceQueueRef.current.length === 0) return;

    _ric((deadline) => {
      const batch = {};
      while (
        (deadline.timeRemaining() > 1 || deadline.didTimeout) &&
        priceQueueRef.current.length > 0
      ) {
        const update = priceQueueRef.current.shift();
        batch[update.symbol] = { price: update.price, change: update.change, changePercent: update.changePercent };
      }
      if (Object.keys(batch).length > 0) {
        requestAnimationFrame(() => {
          setPrices(prev => ({ ...prev, ...batch }));
        });
      }
      if (priceQueueRef.current.length > 0) {
        drainScheduledRef.current = true;
        _ric(drainQueue, { timeout: 50 });
      }
    }, { timeout: 50 });
  }, []);

  const simulateTick = useCallback(() => {
    symbols.forEach(symbol => {
      const current = pricesRef.current[symbol];
      const newPrice = current.price * (1 + (Math.random() - 0.495) * 0.003);
      const base = BASE_PRICES[symbol] || current.price;
      const change = newPrice - base;
      const changePercent = (change / base) * 100;
      priceQueueRef.current.push({ symbol, price: newPrice, change, changePercent });

      // Record candle tick (per-asset memory-managed)
      const mgr = getCandleManager(symbol, 200);
      const last = mgr.getLatestCandle();
      const ts = Date.now();
      if (last && ts - last.t < 1000) {
        // Update the current candle (same second)
        mgr.addCandle(normalizeCandle({ t: last.t, o: last.o, h: Math.max(last.h, newPrice), l: Math.min(last.l, newPrice), c: newPrice, v: (last.v || 0) + 1 }));
      } else {
        mgr.addCandle(normalizeCandle({ t: ts, o: current.price, h: Math.max(current.price, newPrice), l: Math.min(current.price, newPrice), c: newPrice, v: 1 }));
      }
    });
    if (!drainScheduledRef.current) {
      drainScheduledRef.current = true;
      drainQueue();
    }
  }, [symbols, drainQueue]);

  useEffect(() => {
    setIsLive(true);
    const t = setInterval(simulateTick, 1000);
    return () => { clearInterval(t); setIsLive(false); };
  }, [simulateTick]);

  return { prices, isLive };
}

export default useLiveMarketData;
