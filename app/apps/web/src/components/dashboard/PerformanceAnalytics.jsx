import React from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

const DAILY = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  pnl: (Math.random() - 0.4) * 800 + 200,
}));

const MONTHLY = ['Jan','Feb','Mar','Apr','May','Jun','Jul'].map(m => ({
  month: m,
  return: (Math.random() - 0.3) * 15 + 5,
}));

const METRICS = [
  { label: 'Sharpe Ratio', value: '2.41', color: '#10B981' },
  { label: 'Max Drawdown', value: '-4.8%', color: '#EF4444' },
  { label: 'Profit Factor', value: '1.87', color: '#FBBF24' },
  { label: 'Avg Trade', value: '+$142', color: '#2563EB' },
  { label: 'Best Day', value: '+$1,204', color: '#10B981' },
  { label: 'Worst Day', value: '-$382', color: '#EF4444' },
];

export default function PerformanceAnalytics() {
  return (
    <section id="analytics">
      <div className="flex items-center gap-2 mb-4">
        <LineChartIcon className="w-4 h-4 text-[#8B5CF6]" />
        <h2 className="text-base font-bold text-white">Performance Analytics</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {METRICS.map(m => (
          <div key={m.label} className="rounded-xl border border-[#1E2A3B] p-3 text-center" style={{ background: '#111827' }}>
            <p className="text-[10px] text-[#4B5E74] uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-sm font-bold font-mono" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1E2A3B] p-4" style={{ background: '#111827' }}>
          <p className="text-xs font-medium text-[#8899AA] mb-3">14-Day Daily P&L</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={DAILY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1E2A3B" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#4B5E74', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0E1628', border: '1px solid #1E2A3B', borderRadius: 8, fontSize: 11 }}
                formatter={v => [`$${v.toFixed(0)}`, 'P&L']} />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}
                fill="#10B981"
                label={false}
              >
                {DAILY.map((d, i) => (
                  <rect key={i} fill={d.pnl >= 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#1E2A3B] p-4" style={{ background: '#111827' }}>
          <p className="text-xs font-medium text-[#8899AA] mb-3">Monthly Returns (%)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={MONTHLY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1E2A3B" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4B5E74', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0E1628', border: '1px solid #1E2A3B', borderRadius: 8, fontSize: 11 }}
                formatter={v => [`${v.toFixed(1)}%`, 'Return']} />
              <Line dataKey="return" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
