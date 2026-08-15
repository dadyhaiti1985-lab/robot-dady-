import React from 'react';
import { Newspaper, AlertTriangle, Info, TrendingUp, TrendingDown } from 'lucide-react';

const NEWS = [
  { title: 'Federal Reserve signals potential rate cut in Q3 2025', impact: 'high', sentiment: 'bullish', time: '2m ago', summary: 'AI projects +2.4% crypto surge on rate reduction expectations.' },
  { title: 'Bitcoin ETF net inflows hit $420M — institutional demand rising', impact: 'high', sentiment: 'bullish', time: '15m ago', summary: 'Sustained buying pressure from institutional investors suggests continued upward momentum.' },
  { title: 'SEC approves Ethereum spot ETF amendments', impact: 'high', sentiment: 'bullish', time: '32m ago', summary: 'Regulatory clarity expected to boost ETH liquidity and institutional adoption.' },
  { title: 'Gold reaches 3-month high amid geopolitical tensions', impact: 'medium', sentiment: 'neutral', time: '1h ago', summary: 'Safe-haven demand driving gold higher; USD showing slight weakness.' },
  { title: 'Chinese yuan strengthening against USD — forex impact expected', impact: 'medium', sentiment: 'bearish', time: '2h ago', summary: 'CNY appreciation may pressure USD pairs. Watch EUR/USD and GBP/USD for volatility.' },
  { title: 'Tech sector earnings beat expectations — NASDAQ rally possible', impact: 'medium', sentiment: 'bullish', time: '3h ago', summary: 'Strong earnings from major tech firms could propel NASDAQ above 19,500 resistance.' },
];

const IMPACT = {
  high: { color: '#EF4444', bg: '#EF444415', label: 'HIGH' },
  medium: { color: '#FBBF24', bg: '#FBBF2415', label: 'MED' },
  low: { color: '#10B981', bg: '#10B98115', label: 'LOW' },
};

export default function NewsIntelligence() {
  return (
    <section id="news">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-4 h-4 text-[#2563EB]" />
        <h2 className="text-base font-bold text-white">News Intelligence</h2>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-[#2563EB]"
          style={{ background: '#2563EB20', border: '1px solid #2563EB40' }}>
          AI Filtered
        </span>
      </div>

      <div className="space-y-2">
        {NEWS.map((n, i) => {
          const imp = IMPACT[n.impact];
          return (
            <div key={i} className="rounded-xl border border-[#1E2A3B] p-4 hover:border-[#2563EB]/30 transition-colors cursor-pointer"
              style={{ background: '#111827' }}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono"
                    style={{ background: imp.bg, color: imp.color }}>
                    {imp.label}
                  </span>
                  {n.sentiment === 'bullish'
                    ? <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                    : n.sentiment === 'bearish'
                      ? <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
                      : <Info className="w-3.5 h-3.5 text-[#FBBF24]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white leading-snug mb-1">{n.title}</p>
                  <p className="text-[11px] text-[#8899AA] leading-relaxed">{n.summary}</p>
                  <p className="text-[10px] text-[#4B5E74] mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
