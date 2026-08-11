import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

const GENERATE_SIGNALS = () => [
  { asset: 'BTC/USD', signal: 'BUY', confidence: 87, risk: 'Low', target: 71200, sl: 65800, profit: 8.4, status: 'Active', timeframe: '4H' },
  { asset: 'ETH/USD', signal: 'BUY', confidence: 74, risk: 'Med', target: 3850, sl: 3320, profit: 9.6, status: 'Active', timeframe: '1D' },
  { asset: 'SOL/USD', signal: 'SELL', confidence: 62, risk: 'High', target: 165, sl: 195, profit: 9.5, status: 'Pending', timeframe: '4H' },
  { asset: 'GOLD', signal: 'BUY', confidence: 78, risk: 'Low', target: 2390, sl: 2295, profit: 2.1, status: 'Active', timeframe: '1D' },
  { asset: 'EUR/USD', signal: 'SELL', confidence: 55, risk: 'Low', target: 1.075, sl: 1.092, profit: 0.85, status: 'Pending', timeframe: '1H' },
  { asset: 'GBP/USD', signal: 'HOLD', confidence: 51, risk: 'Med', target: 1.272, sl: 1.258, profit: 0.62, status: 'Watch', timeframe: '4H' },
  { asset: 'XRP/USD', signal: 'BUY', confidence: 69, risk: 'High', target: 0.72, sl: 0.59, profit: 14.6, status: 'Active', timeframe: '1D' },
  { asset: 'NASDAQ', signal: 'HOLD', confidence: 58, risk: 'Low', target: 19500, sl: 18800, profit: 1.9, status: 'Watch', timeframe: '1D' },
];

const SIG_COLORS = {
  BUY: { bg: '#10B98115', text: '#10B981', border: '#10B98130' },
  SELL: { bg: '#EF444415', text: '#EF4444', border: '#EF444430' },
  HOLD: { bg: '#FBBF2415', text: '#FBBF24', border: '#FBBF2430' },
};

const STATUS_COLORS = {
  Active: 'text-[#10B981] bg-[#10B98115]',
  Pending: 'text-[#FBBF24] bg-[#FBBF2415]',
  Watch: 'text-[#2563EB] bg-[#2563EB15]',
};

function fmtPrice(p) {
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
}

export default function AISignalsTable() {
  const [signals] = useState(GENERATE_SIGNALS);
  const [updated, setUpdated] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setUpdated(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="signals">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#FBBF24]" />
          AI Signals
        </h2>
        <div className="flex items-center gap-1.5 text-[11px] text-[#4B5E74]">
          <RefreshCw className="w-3 h-3" />
          Updated {updated.toLocaleTimeString()}
        </div>
      </div>

      <div className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E2A3B]">
                {['Asset', 'Signal', 'Conf.', 'TF', 'Risk', 'Target', 'Stop Loss', 'Est. Profit', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-[#4B5E74] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.map((s, i) => {
                const sc = SIG_COLORS[s.signal];
                return (
                  <tr key={i} className="border-b border-[#1E2A3B]/50 hover:bg-[#1E2A3B]/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-white">{s.asset}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] w-fit"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                        {s.signal === 'BUY' && <TrendingUp className="w-3 h-3" />}
                        {s.signal === 'SELL' && <TrendingDown className="w-3 h-3" />}
                        {s.signal === 'HOLD' && <Minus className="w-3 h-3" />}
                        {s.signal}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#1E2A3B] overflow-hidden">
                          <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${s.confidence}%` }} />
                        </div>
                        <span className="text-white font-mono">{s.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8899AA] font-mono">{s.timeframe}</td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        s.risk === 'Low' ? 'bg-[#10B98115] text-[#10B981]' :
                        s.risk === 'High' ? 'bg-[#EF444415] text-[#EF4444]' :
                        'bg-[#FBBF2415] text-[#FBBF24]'
                      }`}>{s.risk}</span>
                    </td>
                    <td className="px-4 py-3 text-[#10B981] font-mono">{fmtPrice(s.target)}</td>
                    <td className="px-4 py-3 text-[#EF4444] font-mono">{fmtPrice(s.sl)}</td>
                    <td className="px-4 py-3 text-[#FBBF24] font-mono">+{s.profit}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
