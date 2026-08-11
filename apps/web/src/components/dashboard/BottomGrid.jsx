import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import { Skeleton } from '@/components/ui/skeleton';

const OrderBook = () => (
  <div className="flex-1 min-w-0 border-r border-border p-4 bg-card cyber-panel">
    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Order Book Depth</h3>
    <div className="grid grid-cols-2 gap-4 font-mono-metrics text-xs">
      <div className="space-y-1">
        {[45012, 45010, 45005, 44990, 44980].map((p, i) => (
          <div key={i} className="flex justify-between relative group">
            <div className="absolute top-0 right-0 h-full bg-emerald/10" style={{width: `${(5-i)*20}%`}} />
            <span className="text-emerald z-10">{p}</span>
            <span className="text-muted-foreground z-10">0.{45-i*5}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {[45018, 45025, 45030, 45045, 45060].map((p, i) => (
          <div key={i} className="flex justify-between relative">
            <div className="absolute top-0 left-0 h-full bg-rose/10" style={{width: `${(5-i)*20}%`}} />
            <span className="text-rose z-10">{p}</span>
            <span className="text-muted-foreground z-10">0.{30+i*12}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AIInsights = () => (
  <div className="flex-1 min-w-0 border-r border-border p-4 bg-sidebar relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Sparkles className="w-16 h-16 text-cyan" />
    </div>
    <div className="flex items-center gap-2 mb-3">
      <Sparkles className="w-4 h-4 text-cyan" />
      <h3 className="text-xs font-medium text-cyan uppercase tracking-wider">Oracle AI Insight</h3>
    </div>
    <p className="text-sm leading-relaxed text-foreground/90">
      Strong accumulation detected at current support level. Order flow imbalance heavily skewed to the buy side. Recommend scaling into longs if 15m candle closes above VWAP.
    </p>
    <div className="mt-4 flex gap-2">
      <span className="text-[10px] px-2 py-1 bg-cyan/10 text-cyan border border-cyan/20">SENTIMENT: BULLISH</span>
      <span className="text-[10px] px-2 py-1 bg-card border border-border">CONFIDENCE: 84%</span>
    </div>
  </div>
);

const WalletBalance = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await apiServerClient.fetch('/coinbase/balance');
        if (res.ok) {
          const data = await res.json();
          setWallet(data);
        }
      } catch (err) {
        console.error("Wallet error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="flex-1 min-w-0 p-4 bg-card cyber-panel">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Equity</h3>
      </div>
      
      {loading ? (
        <Skeleton className="h-10 w-32 mb-4 bg-sidebar" />
      ) : (
        <>
          <div className="text-3xl font-mono-metrics font-bold tracking-tight mb-1">
            ${wallet?.totalUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-muted-foreground font-mono-metrics mb-4">
            Avail: ${wallet?.availableUSDC?.toLocaleString() || '0.00'} USDC
          </div>
          
          <div className="space-y-2 max-h-16 overflow-y-auto pr-2">
            {wallet?.assets?.map(asset => (
              <div key={asset.symbol} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{asset.amount} {asset.symbol}</span>
                <span className="font-mono-metrics">${asset.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function BottomGrid() {
  return (
    <div className="h-48 border-t border-border flex shrink-0 divide-x divide-border">
      <OrderBook />
      <AIInsights />
      <WalletBalance />
    </div>
  );
}