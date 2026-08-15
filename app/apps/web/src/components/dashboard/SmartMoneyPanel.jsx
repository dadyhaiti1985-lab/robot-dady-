import React from 'react';
import { Shield, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';

const INSTITUTIONAL = [
  { asset: 'BTC/USD', side: 'BUY', size: '$84.2M', type: 'Block Order', confidence: 91 },
  { asset: 'ETH/USD', side: 'BUY', size: '$31.5M', type: 'Institutional', confidence: 78 },
  { asset: 'GOLD', side: 'SELL', size: '$12.1M', type: 'Hedge Fund', confidence: 65 },
  { asset: 'EUR/USD', side: 'BUY', size: '$220M', type: 'Central Bank', confidence: 82 },
];

const ZONES = [
  { asset: 'BTC/USD', type: 'Order Block', level: '$65,200', strength: 'Strong', dir: 'Support' },
  { asset: 'BTC/USD', type: 'Fair Value Gap', level: '$69,800', strength: 'Med', dir: 'Resistance' },
  { asset: 'ETH/USD', type: 'Liquidity Zone', level: '$3,350', strength: 'Strong', dir: 'Support' },
  { asset: 'SOL/USD', type: 'Volume Imbalance', level: '$175', strength: 'Med', dir: 'Support' },
];

export default function SmartMoneyPanel() {
  return (
    <section id="smartmoney">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-[#FBBF24]" />
        <h2 className="text-base font-bold text-white">Smart Money</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Institutional Orders */}
        <div className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
          <div className="px-4 py-3 border-b border-[#1E2A3B]">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#2563EB]" /> Institutional Orders
            </p>
          </div>
          <div className="divide-y divide-[#1E2A3B]/50">
            {INSTITUTIONAL.map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.side === 'BUY' ? '#10B981' : '#EF4444' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{item.asset}</p>
                  <p className="text-[10px] text-[#4B5E74]">{item.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono" style={{ color: item.side === 'BUY' ? '#10B981' : '#EF4444' }}>{item.size}</p>
                  <p className="text-[10px] text-[#4B5E74]">{item.confidence}% conf.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Zones */}
        <div className="rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827' }}>
          <div className="px-4 py-3 border-b border-[#1E2A3B]">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" /> Key Zones
            </p>
          </div>
          <div className="divide-y divide-[#1E2A3B]/50">
            {ZONES.map((z, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{z.asset}</p>
                  <p className="text-[10px] text-[#4B5E74]">{z.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-[#FBBF24]">{z.level}</p>
                  <p className="text-[10px]" style={{ color: z.dir === 'Support' ? '#10B981' : '#EF4444' }}>{z.dir}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${z.strength === 'Strong' ? 'bg-[#10B98115] text-[#10B981]' : 'bg-[#FBBF2415] text-[#FBBF24]'}`}>
                  {z.strength}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
