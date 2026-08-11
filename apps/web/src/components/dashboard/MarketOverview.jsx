import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react';
// Mini sparkline drawn with inline SVG (no extra dep)

const BASE_MARKETS = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 67245, change: 2.3, volume: '42.1B', volatility: 'High', cat: 'crypto', color: '#FBBF24' },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3512, change: 1.8, volume: '18.3B', volatility: 'Med', cat: 'crypto', color: '#8B5CF6' },
  { symbol: 'SOL/USD', name: 'Solana', price: 182.4, change: 4.1, volume: '5.2B', volatility: 'High', cat: 'crypto', color: '#14B8A6' },
  { symbol: 'XRP/USD', name: 'XRP', price: 0.628, change: -0.9, volume: '2.1B', volatility: 'Med', cat: 'crypto', color: '#2563EB' },
  { symbol: 'BNB/USD', name: 'BNB', price: 418.2, change: 0.6, volume: '1.4B', volatility: 'Low', cat: 'crypto', color: '#F59E0B' },
  { symbol: 'NASDAQ', name: 'NASDAQ', price: 19128, change: -0.4, volume: '8.9B', volatility: 'Low', cat: 'index', color: '#2563EB' },
  { symbol: 'S&P500', name: 'S&P 500', price: 5432, change: 0.2, volume: '12.1B', volatility: 'Low', cat: 'index', color: '#10B981' },
  { symbol: 'GOLD', name: 'Gold', price: 2341, change: 0.4, volume: '3.2B', volatility: 'Low', cat: 'commodity', color: '#FBBF24' },
  { symbol: 'EUR/USD', name: 'Euro', price: 1.0842, change: -0.1, volume: '6.4B', volatility: 'Low', cat: 'forex', color: '#2563EB' },
  { symbol: 'GBP/USD', name: 'Pound', price: 1.2641, change: 0.3, volume: '2.8B', volatility: 'Low', cat: 'forex', color: '#8B5CF6' },
  { symbol: 'USD/JPY', name: 'Dollar/Yen', price: 156.78, change: -0.2, volume: '4.1B', volatility: 'Med', cat: 'forex', color: '#EF4444' },
];

function generateSparkData(base, length = 20) {
  const data = [];
  let v = base;
  for (let i = 0; i < length; i++) {
    v = v * (1 + (Math.random() - 0.5) * 0.008);
    data.push(v);
  }
  return data;
}

const CATS = ['all', 'crypto', 'index', 'forex', 'commodity'];

export default function MarketOverview() {
  const [markets, setMarkets] = useState(() =>
    BASE_MARKETS.map(m => ({ ...m, spark: generateSparkData(m.price) }))
  );
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const t = setInterval(() => {
      setMarkets(prev => prev.map(m => ({
        ...m,
        price: m.price * (1 + (Math.random() - 0.5) * 0.002),
        change: m.change + (Math.random() - 0.5) * 0.1,
        spark: [...m.spark.slice(1), m.price * (1 + (Math.random() - 0.5) * 0.008)],
      })));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const filtered = filter === 'all' ? markets : markets.filter(m => m.cat === filter);

  const fmt = (p, sym) => {
    if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (p >= 10) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <section id="markets">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2563EB]" />
          Live Market Overview
        </h2>
        <div className="flex items-center gap-1 bg-[#111827] rounded-lg p-0.5 border border-[#1E2A3B]">
          {CATS.map(c => (
            <button key={c}
              onClick={() => setFilter(c)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all capitalize ${
                filter === c ? 'bg-[#2563EB] text-white' : 'text-[#8899AA] hover:text-white'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(m => {
          const up = m.change >= 0;
          return (
            <div key={m.symbol}
              className="rounded-xl border border-[#1E2A3B] p-4 transition-all duration-200 hover:border-[#2563EB]/40 group cursor-pointer"
              style={{ background: '#111827' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `${m.color}20`, color: m.color }}>
                      {m.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{m.symbol}</p>
                      <p className="text-[10px] text-[#4B5E74]">{m.name}</p>
                    </div>
                  </div>
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-mono font-medium px-1.5 py-0.5 rounded-md ${
                  up ? 'text-[#10B981] bg-[#10B98115]' : 'text-[#EF4444] bg-[#EF444415]'
                }`}>
                  {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {up ? '+' : ''}{m.change.toFixed(2)}%
                </span>
              </div>

              <p className="text-lg font-bold text-white font-mono mb-2">{fmt(m.price, m.symbol)}</p>

              {/* Mini sparkline (inline SVG) */}
              <div className="h-10 mb-2">
                <svg viewBox={`0 0 80 32`} className="w-full h-full" preserveAspectRatio="none">
                  {(() => {
                    const d = m.spark;
                    const mn = Math.min(...d), mx = Math.max(...d);
                    const range = mx - mn || 1;
                    const pts = d.map((v, i) => `${(i / (d.length - 1)) * 80},${32 - ((v - mn) / range) * 28}`).join(' ');
                    return <polyline points={pts} fill="none" stroke={up ? '#10B981' : '#EF4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />;
                  })()}
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#4B5E74]">
                <span>Vol: <span className="text-[#8899AA]">{m.volume}</span></span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                  m.volatility === 'High' ? 'bg-[#EF444415] text-[#EF4444]' :
                  m.volatility === 'Med' ? 'bg-[#FBBF2415] text-[#FBBF24]' :
                  'bg-[#10B98115] text-[#10B981]'
                }`}>{m.volatility}</span>
              </div>

              <button className="mt-3 w-full py-1.5 rounded-lg text-[11px] font-medium text-[#2563EB] border border-[#2563EB]/30 hover:bg-[#2563EB]/10 transition-colors opacity-0 group-hover:opacity-100">
                <BarChart2 className="w-3 h-3 inline mr-1" />Analyze
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
