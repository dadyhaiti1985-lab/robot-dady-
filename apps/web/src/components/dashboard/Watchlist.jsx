import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, BarChart2, Zap } from 'lucide-react';

const WATCHLIST = [
  { symbol: 'BTC/USD', price: 67245, change: 2.3, score: 87 },
  { symbol: 'ETH/USD', price: 3512, change: 1.8, score: 74 },
  { symbol: 'SOL/USD', price: 182.4, change: 4.1, score: 69 },
  { symbol: 'GOLD', price: 2341, change: 0.4, score: 78 },
  { symbol: 'EUR/USD', price: 1.0842, change: -0.1, score: 55 },
  { symbol: 'GBP/USD', price: 1.2641, change: 0.3, score: 61 },
];

function fmt(p) {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(5)}`;
}

export default function Watchlist() {
  const [items, setItems] = useState(WATCHLIST);

  useEffect(() => {
    const t = setInterval(() => {
      setItems(prev => prev.map(m => ({
        ...m,
        price: m.price * (1 + (Math.random() - 0.5) * 0.002),
        change: m.change + (Math.random() - 0.5) * 0.05,
      })));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="watchlist">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-[#FBBF24]" />
        <h2 className="text-base font-bold text-white">Watchlist</h2>
      </div>

      <div className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
        {items.map((m, i) => {
          const up = m.change >= 0;
          return (
            <div key={m.symbol} className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1E2A3B]/30 transition-colors ${i < items.length - 1 ? 'border-b border-[#1E2A3B]/50' : ''}`}>
              <Star className="w-3.5 h-3.5 text-[#FBBF24] shrink-0 fill-[#FBBF24]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">{m.symbol}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1 w-16 bg-[#1E2A3B] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${m.score}%` }} />
                  </div>
                  <span className="text-[10px] text-[#4B5E74]">AI {m.score}%</span>
                </div>
              </div>
              <p className="text-sm font-mono font-medium text-white">{fmt(m.price)}</p>
              <span className={`flex items-center gap-0.5 text-xs font-mono px-1.5 py-0.5 rounded-md ${up ? 'text-[#10B981] bg-[#10B98115]' : 'text-[#EF4444] bg-[#EF444415]'}`}>
                {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {up ? '+' : ''}{m.change.toFixed(2)}%
              </span>
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 rounded-lg border border-[#1E2A3B] flex items-center justify-center text-[#4B5E74] hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors">
                  <BarChart2 className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-lg border border-[#1E2A3B] flex items-center justify-center text-[#4B5E74] hover:text-[#10B981] hover:border-[#10B981]/40 transition-colors">
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
