import React, { useState, useEffect } from 'react';
import { Grid3X3 } from 'lucide-react';

const HEATMAP_ITEMS = [
  { symbol: 'BTC', change: 2.3, mkt: 1.3 },
  { symbol: 'ETH', change: 1.8, mkt: 0.7 },
  { symbol: 'SOL', change: 4.1, mkt: 0.2 },
  { symbol: 'BNB', change: 0.6, mkt: 0.15 },
  { symbol: 'XRP', change: -0.9, mkt: 0.1 },
  { symbol: 'ADA', change: -1.4, mkt: 0.08 },
  { symbol: 'DOT', change: 2.1, mkt: 0.06 },
  { symbol: 'LINK', change: 3.2, mkt: 0.05 },
  { symbol: 'UNI', change: -0.3, mkt: 0.04 },
  { symbol: 'AVAX', change: 1.5, mkt: 0.04 },
  { symbol: 'DOGE', change: -2.1, mkt: 0.03 },
  { symbol: 'MATIC', change: 0.8, mkt: 0.03 },
  { symbol: 'ATOM', change: -0.5, mkt: 0.02 },
  { symbol: 'FTM', change: 5.4, mkt: 0.01 },
  { symbol: 'NEAR', change: 1.2, mkt: 0.01 },
];

function getColor(change) {
  if (change >= 3) return { bg: '#10B981', text: '#fff' };
  if (change >= 1) return { bg: '#059669', text: '#fff' };
  if (change >= 0) return { bg: '#065F46', text: '#6EE7B7' };
  if (change >= -1) return { bg: '#7F1D1D', text: '#FCA5A5' };
  if (change >= -3) return { bg: '#991B1B', text: '#fff' };
  return { bg: '#EF4444', text: '#fff' };
}

export default function MarketHeatmap() {
  const [items, setItems] = useState(HEATMAP_ITEMS);

  useEffect(() => {
    const t = setInterval(() => {
      setItems(prev => prev.map(m => ({
        ...m,
        change: m.change + (Math.random() - 0.5) * 0.3,
      })));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="heatmap">
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="w-4 h-4 text-[#10B981]" />
        <h2 className="text-base font-bold text-white">Market Heatmap</h2>
      </div>

      <div className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
        <div className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {items.map(m => {
              const c = getColor(m.change);
              const size = Math.max(60, Math.min(120, m.mkt * 500));
              return (
                <div key={m.symbol}
                  className="rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:scale-105 hover:z-10 relative"
                  style={{ background: c.bg, width: size, height: size * 0.8, minWidth: 60, minHeight: 48 }}>
                  <span className="text-xs font-bold" style={{ color: c.text }}>{m.symbol}</span>
                  <span className="text-[10px] font-mono" style={{ color: c.text, opacity: 0.85 }}>
                    {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-[10px] text-[#4B5E74]">
            <span>Legend:</span>
            {[['> +3%', '#10B981'], ['+1~3%', '#059669'], ['0~1%', '#065F46'], ['-1~0%', '#7F1D1D'], ['< -3%', '#EF4444']].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
