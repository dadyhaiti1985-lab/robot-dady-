import React, { useState } from 'react';
import { useOracleStrategy } from '@/hooks/useOracleStrategy';

// ── Helpers ──────────────────────────────────────────────────────────────────

function SignalBadge({ signal }) {
  const cfg = {
    BUY:  { bg: '#10B98120', text: '#10B981', border: '#10B98140', label: '▲ BUY' },
    SELL: { bg: '#EF444420', text: '#EF4444', border: '#EF444440', label: '▼ SELL' },
    HOLD: { bg: '#FBBF2420', text: '#FBBF24', border: '#FBBF2440', label: '◼ HOLD' },
  }[signal] || { bg: '#1E2A3B', text: '#8899AA', border: '#1E2A3B', label: signal };

  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-bold border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

function CondRow({ label, passed }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-[#1E2A3B] last:border-0 text-[11px]">
      <span className="text-[#8899AA]">{label}</span>
      <span className={passed ? 'text-[#10B981] font-bold' : 'text-[#EF4444] font-bold'}>
        {passed ? '✓ PASS' : '✗ FAIL'}
      </span>
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-[#1E2A3B] last:border-0">
      <span className="text-[11px] text-[#8899AA]">{label}</span>
      <span className={`text-[11px] font-mono font-bold ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}

// ── Demo candle generator (for "Try Demo" button) ────────────────────────────
function makeDemoCandles(n = 80) {
  let price = 67000;
  return Array.from({ length: n }, () => {
    const open = price;
    price = price * (1 + (Math.random() - 0.47) * 0.006);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.004);
    const low  = Math.min(open, close) * (1 - Math.random() * 0.004);
    const volume = 500 + Math.random() * 800;
    return { open, high, low, close, volume };
  });
}

// ── Main component ───────────────────────────────────────────────────────────
export default function OracleStrategyPanel({
  candles = [],
  aiConfidence = 0.95,
  accountBalance = 10000,
  riskPerTradePct = 0.02,
  rrRatio = 2.0,
}) {
  const { evaluate, result, loading, error } = useOracleStrategy();
  const [usedDemo, setUsedDemo] = useState(false);

  const run = async (c = candles) => {
    await evaluate({ candles: c, aiConfidence, accountBalance, riskPerTradePct, rrRatio });
  };

  const runDemo = async () => {
    setUsedDemo(true);
    await run(makeDemoCandles(80));
  };

  const hasEnough = candles.length >= 60;
  const sig = result?.signal;

  // Flatten conditions for display
  const conditions = result?.conditions
    ? (typeof result.conditions.buy === 'object' && !Array.isArray(result.conditions.buy))
      ? result.signal === 'HOLD'
        ? { ...result.conditions.buy, ...result.conditions.sell }
        : result.conditions
      : result.conditions
    : null;

  return (
    <div className="rounded-xl border border-[#1E2A3B] p-4 space-y-4" style={{ background: '#111827' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest">
            Oracle Trader Pro Strategy
          </p>
          <p className="text-[10px] text-[#4B5E74] mt-0.5">
            Python-parity · EMA · RSI · MACD · ADX · ATR · VWAP · 2% risk/trade · 1:{rrRatio} R:R
          </p>
        </div>
        <div className="flex gap-2">
          {!hasEnough && (
            <button
              onClick={runDemo}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-[#2563EB50] text-[#60A5FA] text-xs font-bold hover:bg-[#2563EB20] transition-colors disabled:opacity-40"
            >
              Try Demo
            </button>
          )}
          <button
            onClick={() => run()}
            disabled={loading || !hasEnough}
            className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-bold transition-colors"
          >
            {loading ? 'Evaluating…' : 'Evaluate'}
          </button>
        </div>
      </div>

      {usedDemo && (
        <p className="text-[10px] text-[#FBBF24] bg-[#FBBF2415] border border-[#FBBF2430] rounded-lg px-3 py-2">
          ⚡ Demo mode — simulated BTC candle data. Connect live candles for real signals.
        </p>
      )}

      {error && (
        <p className="text-[#EF4444] text-xs bg-[#EF444415] border border-[#EF444430] rounded-lg px-3 py-2">{error}</p>
      )}

      {!result && !loading && (
        <p className="text-[#4B5E74] text-sm text-center py-6">
          {hasEnough
            ? 'Click "Evaluate" to run the Oracle Trader Pro signal engine.'
            : `Need ${60 - candles.length} more candles (min 60). Click "Try Demo" to test.`}
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 gap-2">
          <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#8899AA] text-sm">Running Oracle strategy engine…</span>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Signal hero */}
          <div className={`rounded-lg px-4 py-3 border flex items-center justify-between gap-4 ${
            sig === 'BUY'  ? 'bg-[#10B98115] border-[#10B98140]'
            : sig === 'SELL' ? 'bg-[#EF444415] border-[#EF444440]'
            : 'bg-[#FBBF2415] border-[#FBBF2440]'
          }`}>
            <div>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest">Signal</p>
              <SignalBadge signal={sig} />
              {result.reason && (
                <p className="text-[10px] text-[#8899AA] mt-1">{result.reason}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8899AA]">AI Confidence</p>
              <p className="text-2xl font-bold font-mono text-white">
                {(result.confidence * 100).toFixed(0)}%
              </p>
              <p className="text-[10px] text-[#8899AA]">
                {result.passedConditions}/{result.totalConditions} conditions
              </p>
            </div>
          </div>

          {/* Entry / SL / TP */}
          {sig !== 'HOLD' && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-[#1E2A3B] py-2 px-1" style={{ background: '#0B0E14' }}>
                <p className="text-[10px] text-[#8899AA]">Entry</p>
                <p className="text-sm font-mono font-bold text-white">
                  ${Number(result.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg border border-[#EF444430] py-2 px-1" style={{ background: '#0B0E14' }}>
                <p className="text-[10px] text-[#EF4444]">Stop Loss</p>
                <p className="text-sm font-mono font-bold text-[#EF4444]">
                  ${Number(result.stopLoss).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg border border-[#10B98130] py-2 px-1" style={{ background: '#0B0E14' }}>
                <p className="text-[10px] text-[#10B981]">Take Profit</p>
                <p className="text-sm font-mono font-bold text-[#10B981]">
                  ${Number(result.takeProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Position / Risk metrics */}
          {sig !== 'HOLD' && (
            <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest mb-1">Risk Management</p>
              <MetricRow label="Position Size"  value={`${Number(result.positionSize).toFixed(6)} units`} />
              <MetricRow label="Risk Amount"    value={`$${Number(result.riskAmount ?? 0).toFixed(2)}`} color="text-[#EF4444]" />
              <MetricRow label="Risk/Reward"    value={`1:${result.riskRewardRatio}`} />
              <MetricRow label="Account"        value={`$${Number(accountBalance).toLocaleString()}`} />
            </div>
          )}

          {/* Indicators */}
          {result.indicators && (
            <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest mb-1">Indicators</p>
              <MetricRow label="EMA 20 (fast)"  value={Number(result.indicators.emaFast ?? 0).toFixed(2)} />
              <MetricRow label="EMA 50 (slow)"  value={Number(result.indicators.emaSlow ?? 0).toFixed(2)} />
              <MetricRow label="RSI (14)"        value={Number(result.indicators.rsi ?? 0).toFixed(2)} />
              <MetricRow label="MACD line"       value={Number(result.indicators.macd?.line ?? 0).toFixed(4)} />
              <MetricRow label="MACD signal"     value={Number(result.indicators.macd?.signal ?? 0).toFixed(4)} />
              <MetricRow label="ADX (14)"        value={Number(result.indicators.adx ?? 0).toFixed(2)} />
              <MetricRow label="ATR (14)"        value={Number(result.indicators.atr ?? 0).toFixed(4)} />
              <MetricRow label="VWAP"            value={Number(result.indicators.vwap ?? 0).toFixed(2)} />
              <MetricRow label="Volume SMA 20"   value={Number(result.indicators.volSMA ?? 0).toFixed(2)} />
            </div>
          )}

          {/* Conditions checklist */}
          {conditions && (
            <div className="rounded-lg border border-[#1E2A3B] px-3 py-2" style={{ background: '#0B0E14' }}>
              <p className="text-[10px] text-[#8899AA] uppercase tracking-widest mb-1">
                {sig === 'HOLD' ? 'All Conditions (HOLD)' : `${sig} Conditions`}
              </p>
              {Object.entries(conditions).map(([key, val]) =>
                typeof val === 'boolean' ? (
                  <CondRow
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    passed={val}
                  />
                ) : null
              )}
            </div>
          )}

          <p className="text-[10px] text-[#4B5E74] text-right">
            Evaluated: {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : '—'}
          </p>
        </>
      )}
    </div>
  );
}
