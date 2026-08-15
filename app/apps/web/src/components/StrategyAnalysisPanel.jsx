import React, { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

const INDICATOR_LABELS = {
  rsi: 'RSI (14)',
  ema20: 'EMA 20',
  ema50: 'EMA 50',
  adx: 'ADX (14)',
  atr: 'ATR (14)',
  vwap: 'VWAP',
};

function Badge({ children, color }) {
  const colors = {
    green: 'bg-[#10B98120] text-[#10B981] border-[#10B98140]',
    red: 'bg-[#EF444420] text-[#EF4444] border-[#EF444440]',
    yellow: 'bg-[#FBBF2420] text-[#FBBF24] border-[#FBBF2440]',
    blue: 'bg-[#2563EB20] text-[#60A5FA] border-[#2563EB40]',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}

function ConditionRow({ label, passed }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[#1E2A3B] last:border-0">
      <span className="text-[11px] text-[#8899AA]">{label}</span>
      <span className={`text-[11px] font-bold ${passed ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
        {passed ? '✓ PASS' : '✗ FAIL'}
      </span>
    </div>
  );
}

function IndicatorRow({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-1 border-b border-[#1E2A3B] last:border-0">
      <span className="text-[11px] text-[#8899AA]">{label}</span>
      <span className="text-[11px] font-mono text-white">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
    </div>
  );
}

export default function StrategyAnalysisPanel({ candles = [], newsEvents = [], accountBalance = 10000 }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = useCallback(async () => {
    if (candles.length < 30) {
      setError('Need at least 30 candles for analysis.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (pb.authStore.token) headers.Authorization = `Bearer ${pb.authStore.token}`;
      const res = await apiServerClient.fetch('/strategy/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ candles, newsEvents, accountBalance }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [candles, newsEvents, accountBalance]);

  const recColor = result?.recommendation === 'BUY' ? 'green' : result?.recommendation === 'SELL' ? 'red' : 'yellow';

  return (
    <div className="rounded-xl border border-[#1E2A3B] p-4 space-y-4" style={{ background: '#111827' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest">Advanced Strategy Engine</span>
          <p className="text-[10px] text-[#4B5E74] mt-0.5">RSI · EMA · MACD · ADX · ATR · BB · VWAP · Fibonacci</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading || candles.length < 30}
          className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-bold transition-colors"
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {error && (
        <p className="text-[#EF4444] text-xs bg-[#EF444415] border border-[#EF444430] rounded-lg px-3 py-2">{error}</p>
      )}

      {!result && !loading && (
        <p className="text-[#4B5E74] text-sm text-center py-6">
          {candles.length < 30
            ? `Need ${30 - candles.length} more candles to enable analysis.`
            : 'Click "Run Analysis" to evaluate current market conditions.'}
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 gap-2">
          <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#8899AA] text-sm">Running multi-indicator analysis...</span>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Recommendation */}
          <div className={`rounded-lg px-4 py-3 border flex items-center justify-between ${
            result.recommendation === 'BUY'
              ? 'bg-[#10B98115] border-[#10B98140]'
              : result.recommendation === 'SELL'
              ? 'bg-[#EF444415] border-[#EF444440]'
              : 'bg-[#FBBF2415] border-[#FBBF2440]'
          }`}>
            <div>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest">Recommendation</p>
              <p className={`text-lg font-bold font-mono ${
                result.recommendation === 'BUY' ? 'text-[#10B981]' : result.recommendation === 'SELL' ? 'text-[#EF4444]' : 'text-[#FBBF24]'
              }`}>{result.recommendation}</p>
              <p className="text-[10px] text-[#8899AA] mt-0.5">{result.reason}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8899AA]">AI Confidence</p>
              <p className="text-2xl font-bold font-mono text-white">{result.confidence}%</p>
              {result.newsBlocked && <Badge color="yellow">NEWS BLOCK</Badge>}
            </div>
          </div>

          {/* Indicators grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest mb-1">Indicators</p>
              <IndicatorRow label="RSI (14)" value={result.indicators.rsi} />
              <IndicatorRow label="EMA 20" value={result.indicators.ema20} />
              <IndicatorRow label="EMA 50" value={result.indicators.ema50} />
              <IndicatorRow label="ADX (14)" value={result.indicators.adx} />
              <IndicatorRow label="ATR (14)" value={result.indicators.atr} />
              <IndicatorRow label="VWAP" value={result.indicators.vwap} />
              {result.indicators.macd && (
                <IndicatorRow label="MACD" value={result.indicators.macd.line} />
              )}
            </div>

            {/* Signal conditions */}
            {result.signal && (
              <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-[#8899AA] uppercase tracking-widest">Signal Conditions</p>
                  <Badge color={result.signal.signal === 'BUY' ? 'green' : 'red'}>
                    {result.signal.passedCount}/{result.signal.totalConditions}
                  </Badge>
                </div>
                {Object.entries(result.signal.conditions).map(([key, passed]) => (
                  <ConditionRow key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} passed={passed} />
                ))}
              </div>
            )}

            {!result.signal && (
              <div className="rounded-lg border border-[#1E2A3B] px-3 py-2 flex items-center justify-center" style={{ background: '#0B0E14' }}>
                <p className="text-[#4B5E74] text-xs text-center">No signal — conditions not met for high-confidence entry.</p>
              </div>
            )}
          </div>

          {/* Trade Plan */}
          {result.tradePlan && (
            <div className="rounded-lg border border-[#1E2A3B] px-3 py-2 space-y-1" style={{ background: '#0B0E14' }}>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest mb-1">Trade Plan</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-[#8899AA]">Entry</p>
                  <p className="text-sm font-mono font-bold text-white">${Number(result.tradePlan.entryPrice).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#EF4444]">Stop Loss</p>
                  <p className="text-sm font-mono font-bold text-[#EF4444]">${Number(result.tradePlan.stopLoss).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#10B981]">Take Profit</p>
                  <p className="text-sm font-mono font-bold text-[#10B981]">${Number(result.tradePlan.takeProfit).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#1E2A3B]">
                <span className="text-[11px] text-[#8899AA]">Position Size</span>
                <span className="text-[11px] font-mono text-white">
                  {result.tradePlan.positionSize?.units?.toFixed(6)} units (${result.tradePlan.positionSize?.value?.toFixed(2)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8899AA]">Risk Amount</span>
                <span className="text-[11px] font-mono text-[#EF4444]">${result.tradePlan.positionSize?.risk?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8899AA]">Risk/Reward</span>
                <span className="text-[11px] font-mono text-white">1:{result.tradePlan.riskRewardRatio}</span>
              </div>
            </div>
          )}

          {/* Bollinger Bands */}
          {result.indicators.bollingerBands && (
            <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest mb-1">Bollinger Bands</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-[10px] text-[#8899AA]">Upper</p><p className="text-xs font-mono text-[#FBBF24]">${Number(result.indicators.bollingerBands.upper).toFixed(2)}</p></div>
                <div><p className="text-[10px] text-[#8899AA]">Middle</p><p className="text-xs font-mono text-white">${Number(result.indicators.bollingerBands.middle).toFixed(2)}</p></div>
                <div><p className="text-[10px] text-[#8899AA]">Lower</p><p className="text-xs font-mono text-[#60A5FA]">${Number(result.indicators.bollingerBands.lower).toFixed(2)}</p></div>
              </div>
            </div>
          )}

          {/* Support / Resistance */}
          {(result.indicators.support?.length > 0 || result.indicators.resistance?.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
                <p className="text-[10px] text-[#10B981] uppercase tracking-widest mb-1">Support Levels</p>
                {result.indicators.support.slice(0, 3).map((s, i) => (
                  <p key={i} className="text-xs font-mono text-white py-0.5">${Number(s).toLocaleString()}</p>
                ))}
              </div>
              <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
                <p className="text-[10px] text-[#EF4444] uppercase tracking-widest mb-1">Resistance Levels</p>
                {result.indicators.resistance.slice(0, 3).map((r, i) => (
                  <p key={i} className="text-xs font-mono text-white py-0.5">${Number(r).toLocaleString()}</p>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-[#4B5E74] text-right">Last updated: {new Date(result.timestamp).toLocaleTimeString()}</p>
        </>
      )}
    </div>
  );
}
