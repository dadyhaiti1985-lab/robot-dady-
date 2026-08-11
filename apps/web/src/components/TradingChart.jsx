import React, { useState, useEffect, useRef, useCallback } from 'react';
import { throttleMouseMove, throttleResize } from '@/utils/rafThrottle';
import { useMarketDataWorker } from '@/hooks/useMarketDataWorker';
import { CandleDataManager } from '@/utils/candleDataManager';

/**
 * TradingChart — candlestick chart component with:
 * - RAF-throttled mouse/scroll/resize event handling
 * - Web Worker-powered technical indicator calculations
 */

const W = 580, H = 280;

function generateCandles(n, startPrice = 67200) {
  let price = startPrice;
  return Array.from({ length: n }, () => {
    const open = price;
    price *= 1 + (Math.random() - 0.48) * 0.005;
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.003);
    const low = Math.min(open, close) * (1 - Math.random() * 0.003);
    return { open, high, low, close };
  });
}

export default function TradingChart({ symbol = 'BTC/USD', startPrice = 67200, height = 300 }) {
  const candleManagerRef = useRef(null);
  if (!candleManagerRef.current) {
    const mgr = new CandleDataManager(200);
    generateCandles(60, startPrice).forEach((c, i) =>
      mgr.addCandle({ t: Date.now() - (60 - i) * 1500, o: c.open, h: c.high, l: c.low, c: c.close, v: 0 })
    );
    candleManagerRef.current = mgr;
  }
  const [candles, setCandles] = useState(() => candleManagerRef.current.getCandles().map(c => ({ open: c.o, high: c.h, low: c.l, close: c.c })));
  const [crosshair, setCrosshair] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(W);

  const { analyzeMarketData, analysisResult, isAnalyzing } = useMarketDataWorker();

  // Candle buffer for batching
  const candleBufferRef = useRef([]);
  const batchScheduledRef = useRef(false);

  const flushCandleBuffer = useCallback(() => {
    batchScheduledRef.current = false;
    if (candleBufferRef.current.length === 0) return;
    const mgr = candleManagerRef.current;
    candleBufferRef.current.forEach(c => mgr.addCandle(c));
    candleBufferRef.current = [];
    setCandles(mgr.getCandles().map(c => ({ open: c.o, high: c.h, low: c.l, close: c.c })));
  }, []);

  // Live candle simulation
  useEffect(() => {
    const t = setInterval(() => {
      const mgr = candleManagerRef.current;
      const last = mgr.getLatestCandle();
      if (!last) return;
      const close = last.c * (1 + (Math.random() - 0.48) * 0.004);
      const open = last.c;
      const high = Math.max(open, close) * (1 + Math.random() * 0.003);
      const low = Math.min(open, close) * (1 - Math.random() * 0.003);
      const newCandle = { t: Date.now(), o: open, h: high, l: low, c: close, v: 0 };
      candleBufferRef.current.push(newCandle);
      if (!batchScheduledRef.current) {
        batchScheduledRef.current = true;
        requestAnimationFrame(flushCandleBuffer);
      }
    }, 1500);
    return () => clearInterval(t);
  }, [flushCandleBuffer]);

  // Send price data to worker every 5s
  useEffect(() => {
    const prices = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = Array.from({ length: candles.length }, () => Math.floor(Math.random() * 1000 + 500));
    analyzeMarketData({ prices, highs, lows, volumes });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles.length]);

  // Apply worker results
  useEffect(() => {
    if (analysisResult) setIndicators(analysisResult);
  }, [analysisResult]);

  // RAF-throttled mouse move for crosshair
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = throttleMouseMove((e) => {
      const rect = el.getBoundingClientRect();
      setCrosshair({ x: e.clientX - rect.left, y: e.clientY - rect.top, rectW: rect.width, rectH: rect.height });
    });
    const clear = () => setCrosshair(null);
    el.addEventListener('mousemove', handler);
    el.addEventListener('mouseleave', clear);
    return () => { el.removeEventListener('mousemove', handler); el.removeEventListener('mouseleave', clear); };
  }, []);

  // RAF-throttled resize — batch read then write to avoid forced layout
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = throttleResize(() => {
      // Read phase
      const w = el.getBoundingClientRect().width;
      // Write phase (RAF already guarantees we're in a paint frame)
      setContainerW(w || W);
    });
    const ro = new ResizeObserver(handler);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const prices = candles.map(c => [c.high, c.low]).flat();
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const scaleY = useCallback(v => H - 24 - ((v - minP) / (maxP - minP || 1)) * (H - 48) + 12, [minP, maxP]);
  const candleW = W / candles.length - 1;
  const lastPrice = candles[candles.length - 1].close;

  return (
    <div ref={containerRef} className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E2A3B]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{symbol}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ color: '#10B981', background: '#10B98115' }}>
            {indicators?.trend || 'ANALYZING'}
          </span>
          {isAnalyzing && <span className="text-[10px] text-[#FBBF24] animate-pulse">COMPUTING</span>}
        </div>
        <div className="text-[11px] font-mono text-[#FBBF24]">
          ${lastPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <svg ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair"
          preserveAspectRatio="none"
          style={{ height }}
        >
          {/* Grid */}
          {[0.2, 0.4, 0.6, 0.8].map(pct => (
            <line key={pct} x1="0" y1={H * pct} x2={W} y2={H * pct}
              stroke="#1E2A3B" strokeWidth="0.5" strokeDasharray="4 6" />
          ))}

          {/* EMA lines from worker */}
          {indicators?.ema20 && (
            <line x1="0" y1={scaleY(indicators.ema20)} x2={W} y2={scaleY(indicators.ema20)}
              stroke="#2563EB" strokeWidth="0.8" opacity="0.5" />
          )}
          {indicators?.ema50 && (
            <line x1="0" y1={scaleY(indicators.ema50)} x2={W} y2={scaleY(indicators.ema50)}
              stroke="#FBBF24" strokeWidth="0.8" opacity="0.4" />
          )}

          {/* Candles */}
          {candles.map((c, i) => {
            const x = i * (W / candles.length);
            const mx = x + candleW / 2;
            const up = c.close >= c.open;
            const color = up ? '#10B981' : '#EF4444';
            const bodyTop = scaleY(Math.max(c.open, c.close));
            const bodyBot = scaleY(Math.min(c.open, c.close));
            return (
              <g key={i}>
                <line x1={mx} y1={scaleY(c.high)} x2={mx} y2={scaleY(c.low)} stroke={color} strokeWidth="0.8" />
                <rect x={x + 0.5} y={bodyTop} width={Math.max(1, candleW - 1)} height={Math.max(1, bodyBot - bodyTop)} fill={color} opacity="0.85" rx="0.5" />
              </g>
            );
          })}

          {/* Last price line */}
          <line x1={W - 2} y1={scaleY(lastPrice)} x2={W} y2={scaleY(lastPrice)}
            stroke="#FBBF24" strokeWidth="1" />

          {/* RAF-throttled crosshair */}
          {crosshair && (() => {
            const cx = (crosshair.x / (crosshair.rectW || 1)) * W;
            const cy = (crosshair.y / (crosshair.rectH || 1)) * H;
            return (
              <g pointerEvents="none">
                <line x1={cx} y1={0} x2={cx} y2={H} stroke="#FBBF2450" strokeWidth="0.8" strokeDasharray="3 4" />
                <line x1={0} y1={cy} x2={W} y2={cy} stroke="#FBBF2450" strokeWidth="0.8" strokeDasharray="3 4" />
                <circle cx={cx} cy={cy} r="3" fill="#FBBF24" opacity="0.7" />
              </g>
            );
          })()}
        </svg>

        {/* Indicator legend */}
        <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-[#4B5E74]">
          <span className="flex items-center gap-1"><span className="w-3 h-px bg-[#2563EB] inline-block" />EMA 20</span>
          <span className="flex items-center gap-1"><span className="w-3 h-px bg-[#FBBF24] inline-block" />EMA 50</span>
          {indicators?.rsi !== null && indicators?.rsi !== undefined && (
            <span className="font-mono text-[#10B981]">RSI {indicators.rsi}</span>
          )}
          {indicators?.volatility !== null && indicators?.volatility !== undefined && (
            <span className="font-mono text-[#8899AA]">VOL {indicators.volatility}%</span>
          )}
        </div>
      </div>
    </div>
  );
}
