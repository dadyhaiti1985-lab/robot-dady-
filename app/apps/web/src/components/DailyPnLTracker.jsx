import React, { useState, useEffect } from 'react';
import { TRADING_RULES } from '@/utils/TradeEngine';

function formatTimeLeft(lockoutUntil) {
  if (!lockoutUntil) return null;
  const ms = new Date(lockoutUntil).getTime() - Date.now();
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DailyPnLTracker({ riskStatus, onUpdate }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const pnl = riskStatus?.dailyPnlPct ?? 0;
  const isLocked = riskStatus?.isLocked ?? false;
  const lockoutUntil = riskStatus?.lockoutUntil ?? null;

  useEffect(() => {
    if (!isLocked || !lockoutUntil) { setTimeLeft(null); return; }
    const t = setInterval(() => setTimeLeft(formatTimeLeft(lockoutUntil)), 1000);
    setTimeLeft(formatTimeLeft(lockoutUntil));
    return () => clearInterval(t);
  }, [isLocked, lockoutUntil]);

  const pct = Math.min(Math.abs(pnl) / TRADING_RULES.MAX_DAILY_DRAWDOWN_PCT * 100, 100);
  const isWarning = pnl <= -2 && !isLocked;

  const barColor = isLocked ? '#EF4444' : isWarning ? '#FBBF24' : '#10B981';

  return (
    <div className="rounded-xl border border-[#1E2A3B] p-4" style={{ background: '#111827' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest">Daily PnL Tracker</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
          isLocked ? 'bg-[#EF444420] text-[#EF4444] border-[#EF444430]' :
          isWarning ? 'bg-[#FBBF2420] text-[#FBBF24] border-[#FBBF2430]' :
          'bg-[#10B98120] text-[#10B981] border-[#10B98130]'
        }`}>
          {isLocked ? '🔴 LOCKED' : isWarning ? '🟡 WARNING' : '🟢 NORMAL'}
        </span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[10px] text-[#8899AA] mb-0.5">Daily P/L</p>
          <p className={`text-2xl font-bold font-mono ${pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#8899AA] mb-0.5">Drawdown Limit</p>
          <p className="text-[#EF4444] font-mono font-bold text-sm">-{TRADING_RULES.MAX_DAILY_DRAWDOWN_PCT}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-[#1E2A3B] overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <p className="text-[10px] text-[#4B5E74]">{pct.toFixed(0)}% of daily drawdown limit used</p>

      {isLocked && timeLeft && (
        <div className="mt-3 bg-[#EF444410] border border-[#EF444420] rounded-lg px-3 py-2 text-center">
          <p className="text-[#EF4444] text-[11px] mb-1">Circuit breaker active — trading locked</p>
          <p className="text-[#EF4444] font-mono font-bold text-lg">{timeLeft}</p>
          <p className="text-[#4B5E74] text-[10px]">until trading resumes</p>
        </div>
      )}

      {isWarning && !isLocked && (
        <div className="mt-2 bg-[#FBBF2410] border border-[#FBBF2420] rounded-lg px-3 py-2">
          <p className="text-[#FBBF24] text-[11px]">⚠ Approaching drawdown limit. Reduce position sizes.</p>
        </div>
      )}

      {/* Manual PnL input */}
      {onUpdate && (
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor="daily-pnl-update" className="sr-only">Update daily PnL %</label>
          <input
            id="daily-pnl-update"
            name="dailyPnlUpdate"
            type="number"
            step="0.1"
            autoComplete="off"
            aria-label="Update daily PnL percentage"
            placeholder="Update daily PnL %"
            className="flex-1 bg-[#0B0E14] border border-[#1E2A3B] rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-[#2563EB]"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) { onUpdate(v); e.target.value = ''; }
              }
            }}
          />
          <span className="text-[10px] text-[#4B5E74]">Enter to update</span>
        </div>
      )}
    </div>
  );
}
