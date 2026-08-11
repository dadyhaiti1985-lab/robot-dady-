import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Bell, CandlestickChart, ChevronRight, CircleGauge, Filter, Flame, Landmark, ShieldAlert, Waves, Wallet } from 'lucide-react';
import './ViewStyles.css';

const BASE_FEED = [
  {
    timestamp: 'now',
    asset: 'BTC',
    type: 'Buy',
    amount: '$18.4M',
    source: 'Coinbase Prime → Cold Storage',
    confidence: 'High',
    status: 'Accumulation',
  },
  {
    timestamp: '2m ago',
    asset: 'ETH',
    type: 'Wallet Transfer',
    amount: '$9.1M',
    source: 'Unknown Whale → Ethereum L2 Bridge',
    confidence: 'Medium',
    status: 'Monitoring',
  },
  {
    timestamp: '5m ago',
    asset: 'SOL',
    type: 'Sell',
    amount: '$6.8M',
    source: 'OTC Desk → Market Maker',
    confidence: 'Medium',
    status: 'Distribution',
  },
  {
    timestamp: '8m ago',
    asset: 'BTC',
    type: 'Wallet Transfer',
    amount: '$24.7M',
    source: 'Binance Wallet → Self Custody',
    confidence: 'High',
    status: 'Neutral',
  },
  {
    timestamp: '11m ago',
    asset: 'ETH',
    type: 'Buy',
    amount: '$12.3M',
    source: 'Institutional Desk → OTC Fill',
    confidence: 'High',
    status: 'Accumulation',
  },
];

const HEATMAP_ROWS = [
  { label: 'BTC', buy: 84, sell: 36, note: 'Buy wall building near $64.8K' },
  { label: 'ETH', buy: 68, sell: 44, note: 'Liquidity clustering around $3.2K' },
  { label: 'SOL', buy: 56, sell: 52, note: 'Balanced order flow with local support' },
  { label: 'USDT', buy: 91, sell: 16, note: 'Stablecoin inflow suggests dry powder' },
];

const SIGNALS = [
  {
    asset: 'BTC',
    bias: 'Accumulating',
    summary: 'Large wallet inflows to cold storage and OTC buy prints point to steady accumulation. Resistance absorption remains active above the local offer stack.',
  },
  {
    asset: 'ETH',
    bias: 'Neutral to Bullish',
    summary: 'Institutional transfers are balanced, but repeated bid-side absorption suggests dealers are willing to inventory ETH into weakness.',
  },
  {
    asset: 'SOL',
    bias: 'Distribution Watch',
    summary: 'Recent sell-side prints and wallet rotations are consistent with profit-taking. A reclaim of the upper liquidity band is needed to confirm renewed accumulation.',
  },
];

function formatSign(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function Meter({ value, accent = '#10B981' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#0B1220] border border-[#1E2A3B]">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(Math.max(value, 5), 100)}%`, background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.18))` }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, delta, tone = 'neutral' }) {
  const tones = {
    bullish: { border: '#123B2E', glow: 'rgba(16,185,129,0.16)', value: '#D1FAE5' },
    bearish: { border: '#3B1B24', glow: 'rgba(239,68,68,0.12)', value: '#FECACA' },
    neutral: { border: '#1E2A3B', glow: 'rgba(37,99,235,0.12)', value: '#E5EEF8' },
  };

  const theme = tones[tone] || tones.neutral;

  return (
    <div className="rounded-2xl border p-4 backdrop-blur-sm" style={{ borderColor: theme.border, background: `linear-gradient(180deg, rgba(17,24,39,0.98), ${theme.glow})` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8DA2BD]">
            <Icon className="h-4 w-4" />
            {label}
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
          {sublabel ? <div className="mt-1 text-xs text-[#8DA2BD]">{sublabel}</div> : null}
        </div>
        {delta ? (
          <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${delta.startsWith('-') ? 'bg-[#3B1B24] text-[#FCA5A5]' : 'bg-[#123B2E] text-[#86EFAC]'}`}>
            {delta}
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#6E819A]">
          <span>Live pressure</span>
          <span>ORACLE feed</span>
        </div>
        <div className="mt-2">
          <Meter value={tone === 'bearish' ? 42 : tone === 'bullish' ? 78 : 62} accent={tone === 'bearish' ? '#EF4444' : tone === 'bullish' ? '#10B981' : '#38BDF8'} />
        </div>
      </div>
    </div>
  );
}

export default function SmartMoneyView() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPulse((value) => value + 1);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const feed = useMemo(() => {
    const rotation = pulse % BASE_FEED.length;
    return [...BASE_FEED.slice(rotation), ...BASE_FEED.slice(0, rotation)];
  }, [pulse]);

  const whaleInflow = 48.2;
  const whaleOutflow = 31.7;
  const netFlow = Number((whaleInflow - whaleOutflow).toFixed(1));
  const institutionalBias = 68;
  const darkPoolVolume = 124.6;
  const activeAlerts = 7 + (pulse % 3);

  const spotlight = useMemo(() => {
    if (institutionalBias >= 65) {
      return 'Smart money is accumulating BTC and ETH while SOL shows partial distribution. The balance of evidence favors continuation if bid-side absorption holds.';
    }

    return 'Institutional flows are mixed. BTC remains the primary accumulation candidate, but repeated sell prints in SOL suggest caution until the order book rebalances.';
  }, [institutionalBias]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1>Smart Money</h1>
            <p>Institutional and whale wallet movements across major assets</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1E2A3B] bg-[#0B1220] px-3 py-2 text-xs font-medium text-[#A7BED3]">
            <span className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.7)]" />
            Live simulated feed
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          <StatCard icon={Waves} label="Whale Inflow / Outflow (24h)" value={`${formatSign(netFlow)}M`} sublabel={`${whaleInflow}M inflow • ${whaleOutflow}M outflow`} delta="+12.5%" tone="bullish" />
          <StatCard icon={CircleGauge} label="Institutional Bias" value={`${institutionalBias}%`} sublabel="Accumulation bias across BTC / ETH / SOL" delta="Bullish" tone="bullish" />
          <StatCard icon={Landmark} label="Dark Pool Volume" value={`$${darkPoolVolume}M`} sublabel="Estimated OTC / block transaction volume" delta="+4.8%" tone="neutral" />
          <StatCard icon={Bell} label="Active Whale Alerts" value={String(activeAlerts)} sublabel="Large transfers and wallet rotations detected" delta="Real-time" tone="bearish" />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="rounded-2xl border border-[#1E2A3B] bg-[#0B1220]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8DA2BD]">
                  <ShieldAlert className="h-4 w-4 text-[#FBBF24]" />
                  Live Whale & Dark Pool Feed
                </div>
                <p className="mt-2 text-sm text-[#B6C7D9]">Latest institutional prints, wallet rotations, and transfer signals</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#1E2A3B] bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-[#93A6BC]">
                <Filter className="h-3.5 w-3.5" />
                Risk filtered
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#1E2A3B]">
              <div className="grid grid-cols-12 gap-3 border-b border-[#1E2A3B] bg-[#111827] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6E819A]">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-1">Asset</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2 text-right">Amount ($USD)</div>
                <div className="col-span-4">Source / Destination</div>
                <div className="col-span-1 text-right">Confidence</div>
              </div>

              <div className="divide-y divide-[#1E2A3B] bg-[#0B1220]">
                {feed.map((entry, index) => {
                  const isBuy = entry.type === 'Buy';
                  const isSell = entry.type === 'Sell';

                  return (
                    <div key={`${entry.asset}-${entry.timestamp}-${index}`} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-white">
                      <div className="col-span-2 text-[#93A6BC]">{entry.timestamp}</div>
                      <div className="col-span-1 font-semibold">{entry.asset}</div>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isBuy ? 'bg-[#123B2E] text-[#86EFAC]' : isSell ? 'bg-[#3B1B24] text-[#FCA5A5]' : 'bg-[#1D2840] text-[#9CC7FF]'}`}>
                          {isBuy ? <ArrowUpRight className="h-3.5 w-3.5" /> : isSell ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Wallet className="h-3.5 w-3.5" />}
                          {entry.type}
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono text-[#E5EEF8]">{entry.amount}</div>
                      <div className="col-span-4 truncate text-[#A7BED3]" title={entry.source}>{entry.source}</div>
                      <div className="col-span-1 text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${entry.confidence === 'High' ? 'bg-[#123B2E] text-[#86EFAC]' : 'bg-[#3B3218] text-[#FDE68A]'}`}>
                          {entry.confidence}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#1E2A3B] bg-[#111827] p-4 text-sm text-[#B6C7D9]">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8DA2BD]">
                <Flame className="h-4 w-4 text-[#FBBF24]" />
                Live status
              </div>
              <p>{pulse % 2 === 0 ? 'Institutional accumulation remains elevated. Large wallet behavior is consistent with controlled risk-on positioning.' : 'Monitoring for follow-through. Transfer velocity is rising, but the dominant bias still favors accumulation above key liquidity bands.'}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-[#1E2A3B] bg-[#0B1220]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8DA2BD]">
                <CandlestickChart className="h-4 w-4 text-[#38BDF8]" />
                Institutional Order Flow
              </div>
              <div className="space-y-4">
                {HEATMAP_ROWS.map((row) => (
                  <div key={row.label} className="rounded-xl border border-[#1E2A3B] bg-[#111827] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">{row.label}</div>
                        <div className="text-xs text-[#8DA2BD]">Liquidity concentration</div>
                      </div>
                      <div className="text-right text-xs text-[#A7BED3]">{row.note}</div>
                    </div>
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[11px] text-[#8DA2BD]">
                      <span>Buy</span>
                      <Meter value={row.buy} accent="#10B981" />
                      <span className="font-mono text-[#D1FAE5]">{row.buy}%</span>
                    </div>
                    <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 text-[11px] text-[#8DA2BD]">
                      <span>Sell</span>
                      <Meter value={row.sell} accent="#EF4444" />
                      <span className="font-mono text-[#FECACA]">{row.sell}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1E2A3B] bg-[#0B1220]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8DA2BD]">
                <ChevronRight className="h-4 w-4 text-[#FBBF24]" />
                Smart Money AI Signal Insights
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-[#1E2A3B] bg-[#111827] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">ORACLE Intelligence</div>
                      <div className="text-xs text-[#8DA2BD]">Smart money interpretation</div>
                    </div>
                    <span className="rounded-full bg-[#123B2E] px-2.5 py-1 text-[11px] font-semibold text-[#86EFAC]">Bias {institutionalBias}%</span>
                  </div>
                  <p className="text-sm leading-6 text-[#D3DFEA]">{spotlight}</p>
                </div>

                {SIGNALS.map((signal) => (
                  <div key={signal.asset} className="rounded-xl border border-[#1E2A3B] bg-[#111827] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">{signal.asset}</div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${signal.bias.includes('Distribution') ? 'bg-[#3B1B24] text-[#FCA5A5]' : signal.bias.includes('Neutral') ? 'bg-[#1D2840] text-[#9CC7FF]' : 'bg-[#123B2E] text-[#86EFAC]'}`}>
                        {signal.bias}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-[#B6C7D9]">{signal.summary}</p>
                  </div>
                ))}

                <div className="rounded-xl border border-[#1E2A3B] bg-gradient-to-br from-[#0F172A] to-[#111827] p-4 text-sm text-[#B6C7D9]">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8DA2BD]">
                    <Wallet className="h-4 w-4 text-[#38BDF8]" />
                    Interpretation
                  </div>
                  <p>BTC is the cleanest accumulation signal, ETH is constructive, and SOL is under distribution watch. Continue to treat large inbound transfers to exchanges as potential supply unless the next bid wall absorbs the move.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1E2A3B] bg-[#0B1220]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8DA2BD]">
            <ShieldAlert className="h-4 w-4 text-[#FBBF24]" />
            Smart Money AI Signal Snapshot
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {SIGNALS.map((signal) => (
              <div key={`${signal.asset}-snapshot`} className="rounded-xl border border-[#1E2A3B] bg-[#111827] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">{signal.asset}</div>
                  <div className="text-xs text-[#8DA2BD]">Oracle read</div>
                </div>
                <div className="text-sm leading-6 text-[#D3DFEA]">{signal.summary}</div>
                <div className="mt-4 flex items-center justify-between text-xs text-[#8DA2BD]">
                  <span>Confidence</span>
                  <span className="font-mono text-white">{signal.asset === 'BTC' ? '92%' : signal.asset === 'ETH' ? '84%' : '71%'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
