import React, { useState, useEffect } from 'react';
import { TRADING_RULES } from '@/utils/TradeEngine';

// Simulated high-impact news events (in a real app these would come from a news API)
function generateMockNews() {
  const now = Date.now();
  return [
    { id: 1, title: 'US CPI Data Release', impact: 'HIGH', timestamp: new Date(now + 45 * 60 * 1000).toISOString() },
    { id: 2, title: 'Fed Interest Rate Decision', impact: 'HIGH', timestamp: new Date(now + 3 * 60 * 60 * 1000).toISOString() },
    { id: 3, title: 'EU GDP Report', impact: 'MEDIUM', timestamp: new Date(now + 90 * 60 * 1000).toISOString() },
    { id: 4, title: 'USD Non-Farm Payrolls', impact: 'HIGH', timestamp: new Date(now - 10 * 60 * 1000).toISOString() },
  ];
}

function formatCountdown(ms) {
  const abs = Math.abs(ms);
  const m = Math.floor(abs / 60000);
  const s = Math.floor((abs % 60000) / 1000);
  const prefix = ms < 0 ? '-' : '+';
  return `${prefix}${m}m ${s}s`;
}

const impactColors = {
  HIGH: 'text-[#EF4444] bg-[#EF444415] border-[#EF444430]',
  MEDIUM: 'text-[#FBBF24] bg-[#FBBF2415] border-[#FBBF2430]',
  LOW: 'text-[#8899AA] bg-[#8899AA15] border-[#8899AA30]',
};

export default function NewsBuffer({ onNewsChange }) {
  const [events] = useState(generateMockNews);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const bufferMs = TRADING_RULES.NEWS_BUFFER_MINUTES * 60 * 1000;

  const blocked = events.filter(e => {
    if (e.impact !== 'HIGH') return false;
    const diff = Math.abs(now - new Date(e.timestamp).getTime());
    return diff <= bufferMs;
  });

  useEffect(() => {
    if (onNewsChange) onNewsChange(events);
  }, [events, onNewsChange]);

  return (
    <div className="rounded-xl border border-[#1E2A3B] p-4" style={{ background: '#111827' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest">News Buffer</span>
        {blocked.length > 0 ? (
          <span className="text-[10px] bg-[#EF444420] text-[#EF4444] px-2 py-0.5 rounded-full border border-[#EF444430] font-bold">
            🔴 TRADES BLOCKED
          </span>
        ) : (
          <span className="text-[10px] bg-[#10B98120] text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B98130] font-bold">
            🟢 CLEAR
          </span>
        )}
      </div>

      <div className="space-y-2">
        {events.map(event => {
          const diff = new Date(event.timestamp).getTime() - now;
          const isInBuffer = event.impact === 'HIGH' && Math.abs(diff) <= bufferMs;
          return (
            <div key={event.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                isInBuffer ? 'border-[#EF444430] bg-[#EF444408]' : 'border-[#1E2A3B] bg-[#0B0E14]'
              }`}>
              <div>
                <p className="text-white text-[11px] font-semibold">{event.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${impactColors[event.impact] || impactColors.LOW}`}>
                  {event.impact}
                </span>
              </div>
              <div className="text-right">
                <p className={`text-[11px] font-mono font-bold ${
                  isInBuffer ? 'text-[#EF4444]' : diff > 0 ? 'text-[#FBBF24]' : 'text-[#8899AA]'
                }`}>
                  {formatCountdown(diff)}
                </p>
                <p className="text-[10px] text-[#4B5E74]">{diff > 0 ? 'until event' : 'since event'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {blocked.length > 0 && (
        <p className="text-[#EF4444] text-[11px] mt-2 bg-[#EF444410] border border-[#EF444420] rounded-lg px-3 py-2">
          High-impact news within ±{TRADING_RULES.NEWS_BUFFER_MINUTES}min window. New trades are paused.
        </p>
      )}
    </div>
  );
}
