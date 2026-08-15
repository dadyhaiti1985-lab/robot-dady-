import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Zap, Activity, BarChart2, Target, Layers, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMarketDataWorker } from '@/hooks/useMarketDataWorker';

const RECS = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];
const REC_COLORS = { 'Strong Buy': '#10B981', 'Buy': '#34D399', 'Hold': '#FBBF24', 'Sell': '#F87171', 'Strong Sell': '#EF4444' };

function GaugeBar({ label, value, max = 100, color, format }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#8899AA] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#1E2A3B] overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }} />
      </div>
      <span className="text-[11px] font-mono text-white w-10 text-right">{format ? format(value) : `${value}%`}</span>
    </div>
  );
}

export default function AIAnalysisPanel() {
  const { analyzeMarketData, analysisResult, isAnalyzing } = useMarketDataWorker();

  const [metrics, setMetrics] = useState({
    confidence: 87, bullish: 72, bearish: 28, buyProb: 81, sellProb: 19,
    trendStrength: 78, volatility: 42, momentum: 68, liquidity: 85, institutional: 64,
    expectedMove: 3.2, rec: 'Strong Buy'
  });

  // Feed simulated market data to worker every 5s for real indicator computation
  useEffect(() => {
    function runWorker() {
      const len = 60;
      let p = 67200;
      const prices = Array.from({ length: len }, () => { p *= 1 + (Math.random() - 0.49) * 0.004; return p; });
      const volumes = Array.from({ length: len }, () => Math.floor(Math.random() * 1000 + 500));
      analyzeMarketData({ prices, volumes, highs: prices.map(x => x * 1.002), lows: prices.map(x => x * 0.998) });
    }
    runWorker();
    const wt = setInterval(runWorker, 5000);
    return () => clearInterval(wt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update metrics when worker returns results
  useEffect(() => {
    if (!analysisResult) return;
    const { rsi, volatility, trend } = analysisResult;
    setMetrics(m => ({
      ...m,
      momentum: rsi !== null ? Math.round(rsi) : m.momentum,
      volatility: volatility !== null ? Math.min(99, Math.round(volatility * 10)) : m.volatility,
      bullish: trend === 'BULLISH' ? Math.min(95, m.bullish + 1) : trend === 'BEARISH' ? Math.max(20, m.bullish - 1) : m.bullish,
    }));
  }, [analysisResult]);

  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(m => ({
        ...m,
        confidence: Math.min(99, Math.max(50, m.confidence + (Math.random() - 0.5) * 3)),
        bullish: Math.min(95, Math.max(20, m.bullish + (Math.random() - 0.5) * 2)),
        buyProb: Math.min(99, Math.max(30, m.buyProb + (Math.random() - 0.5) * 2)),
        momentum: Math.min(99, Math.max(20, m.momentum + (Math.random() - 0.5) * 3)),
      }));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const recColor = REC_COLORS[metrics.rec] || '#FBBF24';

  return (
    <section id="analysis" className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1E2A3B]">
        <Brain className="w-4 h-4 text-[#2563EB]" />
        <h2 className="text-sm font-bold text-white">AI Analysis Panel</h2>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: '#2563EB20', color: '#2563EB', border: '1px solid #2563EB40' }}>
          <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-[#FBBF24]' : 'bg-[#2563EB]'} animate-pulse`} />
          {isAnalyzing ? 'COMPUTING' : 'LIVE'}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Confidence circle */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1E2A3B" strokeWidth="6" />
              <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#2563EB" strokeWidth="6"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 214' }}
                animate={{ strokeDasharray: `${(metrics.confidence / 100) * 214} 214` }}
                transition={{ duration: 1.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white font-mono">{Math.round(metrics.confidence)}%</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#8899AA] mb-1">AI Confidence Score</p>
            <motion.p className="text-xl font-bold font-mono"
              style={{ color: recColor, textShadow: `0 0 10px ${recColor}66` }}
              key={metrics.rec}>
              {metrics.rec}
            </motion.p>
            <p className="text-[10px] text-[#4B5E74] mt-0.5">BTC/USD — 4H timeframe</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <GaugeBar label="Bullish Score" value={metrics.bullish} color="#10B981" />
          <GaugeBar label="Bearish Score" value={metrics.bearish} color="#EF4444" />
          <GaugeBar label="Buy Probability" value={metrics.buyProb} color="#10B981" />
          <GaugeBar label="Sell Probability" value={metrics.sellProb} color="#EF4444" />
          <GaugeBar label="Trend Strength" value={metrics.trendStrength} color="#2563EB" />
          <GaugeBar label="Market Volatility" value={metrics.volatility} color="#FBBF24" />
          <GaugeBar label="Momentum" value={metrics.momentum} color="#8B5CF6" />
          <GaugeBar label="Liquidity" value={metrics.liquidity} color="#14B8A6" />
          <GaugeBar label="Institutional" value={metrics.institutional} color="#FBBF24" />
          <GaugeBar label="Expected Move" value={metrics.expectedMove} max={10} color="#2563EB" format={v => `${v.toFixed(1)}%`} />
        </div>

        {/* Bull/Bear ratio */}
        <div className="rounded-lg overflow-hidden border border-[#1E2A3B]">
          <div className="flex h-2">
            <div style={{ width: `${metrics.bullish}%`, background: '#10B981' }} className="transition-all duration-500" />
            <div style={{ width: `${100 - metrics.bullish}%`, background: '#EF4444' }} className="transition-all duration-500" />
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-[#8899AA]">
            <span className="flex items-center gap-1 text-[#10B981]"><TrendingUp className="w-3 h-3" /> Bulls {Math.round(metrics.bullish)}%</span>
            <span className="flex items-center gap-1 text-[#EF4444]"><TrendingDown className="w-3 h-3" /> Bears {Math.round(100 - metrics.bullish)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
