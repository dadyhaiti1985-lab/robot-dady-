import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Activity, Target, Percent } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const EQUITY_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  value: 10000 + Math.sin(i * 0.3) * 500 + i * 80 + Math.random() * 200,
}));

export default function PortfolioStats({ balance = { total: 0, available: 0 }, trades = [], winRate = 0, totalPnl = 0 }) {
  const totalTrades = trades.length;
  const wins = trades.filter(t => Number(t.pnl ?? 0) > 0).length;
  const losses = totalTrades - wins;
  const wr = totalTrades ? Math.round((wins / totalTrades) * 100) : winRate;

  const stats = [
    { label: 'Total Balance', value: `$${Number(balance.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: '#FBBF24' },
    { label: 'Available', value: `$${Number(balance.available || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet2, color: '#10B981' },
    { label: "Today's Profit", value: '+$284.20', icon: TrendingUp, color: '#10B981' },
    { label: 'Weekly Profit', value: '+$1,842', icon: TrendingUp, color: '#10B981' },
    { label: 'Monthly Profit', value: '+$7,214', icon: TrendingUp, color: '#10B981' },
    { label: 'Total Trades', value: totalTrades.toString(), icon: Activity, color: '#2563EB' },
    { label: 'Winning Trades', value: wins.toString(), icon: TrendingUp, color: '#10B981' },
    { label: 'Losing Trades', value: losses.toString(), icon: TrendingDown, color: '#EF4444' },
    { label: 'Win Rate', value: `${wr}%`, icon: Target, color: '#FBBF24' },
    { label: 'Avg ROI', value: '+4.2%', icon: Percent, color: '#8B5CF6' },
  ];

  return (
    <section id="portfolio">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-4 h-4 text-[#FBBF24]" />
        <h2 className="text-base font-bold text-white">Portfolio</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-[#1E2A3B] p-3" style={{ background: '#111827' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              <span className="text-[10px] text-[#4B5E74] uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Equity curve */}
      <div className="rounded-xl border border-[#1E2A3B] p-4" style={{ background: '#111827' }}>
        <p className="text-xs font-medium text-[#8899AA] mb-3">30-Day Equity Curve</p>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={EQUITY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <Tooltip
              contentStyle={{ background: '#0E1628', border: '1px solid #1E2A3B', borderRadius: 8, fontSize: 11 }}
              formatter={v => [`$${v.toFixed(0)}`, 'Equity']}
            />
            <Area dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#eqGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// inline icon placeholder
function Wallet2(props) {
  return <DollarSign {...props} />;
}
