import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import apiServerClient from '@/lib/apiServerClient';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

const INSTRUMENTS = [
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD',
  'AVAX-USD', 'DOGE-USD', 'EURUSD', 'GBPUSD',
  'USDJPY', 'XAUUSD', 'XAGUSD'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch a single symbol with exponential backoff on rate-limit (429).
// Max 3 retries: waits 2s, 4s, 8s. Returns null on final failure.
async function fetchPrice(symbol) {
  let attempt = 0;
  while (attempt <= 3) {
    try {
      const res = await apiServerClient.fetch(`/coinbase/price?symbol=${symbol}`);
      if (res.status === 429) {
        if (attempt === 3) return null;
        await sleep(2000 * Math.pow(2, attempt)); // 2s, 4s, 8s
        attempt += 1;
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
  return null;
}

export default function MarketScan({ activeInstrument, setInstrument, riskLevel, setRiskLevel }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');
  const runningRef = useRef(false);
  const cacheRef = useRef({}); // symbol -> last good market object

  useEffect(() => {
    let cancelled = false;

    const scan = async () => {
      if (runningRef.current) return;
      runningRef.current = true;
      let hadStale = false;

      // Sequential fetch: one asset at a time with 200ms spacing.
      for (const sym of INSTRUMENTS) {
        if (cancelled) break;
        const data = await fetchPrice(sym);

        let entry;
        if (data && typeof data.price === 'number') {
          let state = 'neutral';
          if (data.change24h > 3) state = 'bullish';
          else if (data.change24h < -3) state = 'bearish';
          else if (Math.abs(data.change24h) > 5) state = 'volatile';
          entry = { ...data, state, stale: !!data.stale, updatedAt: Date.now() };
          cacheRef.current[sym] = entry;
        } else {
          // Fall back to last cached price with a stale badge.
          const prev = cacheRef.current[sym];
          entry = prev
            ? { ...prev, stale: true }
            : { symbol: sym, price: null, change24h: 0, state: 'neutral', stale: true };
          hadStale = true;
        }

        if (entry.stale) hadStale = true;

        if (!cancelled) {
          setMarkets((prevList) => {
            const next = prevList.filter((m) => m.symbol !== sym);
            next.push(entry);
            // preserve INSTRUMENTS order
            return INSTRUMENTS.map((s) => next.find((m) => m.symbol === s)).filter(Boolean);
          });
        }

        await sleep(200); // debounce spacing between assets
      }

      if (!cancelled) {
        setLoading(false);
        setBanner(hadStale ? 'Market data temporarily unavailable - using cached prices' : '');
      }
      runningRef.current = false;
    };

    scan();
    // Refresh the whole list every 30s (sequential, never simultaneous).
    const interval = setInterval(scan, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-80 border-r border-border bg-sidebar flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-4 border-b border-border bg-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Risk Management</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs">Position Size</span>
          <span className="font-mono-metrics text-cyan">{riskLevel.toFixed(1)}%</span>
        </div>
        <Slider
          value={[riskLevel]}
          onValueChange={([val]) => setRiskLevel(val)}
          max={5}
          min={0.1}
          step={0.1}
          className="my-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Conservative</span>
          <span>Max Strike</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sticky top-0 bg-sidebar/95 backdrop-blur z-10 border-b border-border">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Market Scan</h3>
        </div>

        {banner && (
          <div className="mx-2 mt-2 flex items-start gap-2 border border-amber/30 bg-[hsl(var(--accent-amber)_/_0.1)] p-2 text-[10px] text-amber">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{banner}</span>
          </div>
        )}

        <div className="p-2 space-y-1">
          {markets.map((m) => (
            <div
              key={m.symbol}
              onClick={() => setInstrument(m.symbol)}
              className={`p-3 cyber-panel cursor-pointer flex items-center justify-between transition-colors ${
                activeInstrument === m.symbol ? 'border-primary bg-primary/5' : 'hover:bg-card'
              }`}
            >
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  {m.symbol}
                  {m.stale && (
                    <span className="text-[9px] uppercase px-1 py-0.5 rounded-sm badge-neutral">stale</span>
                  )}
                </div>
                <div className={`text-[10px] uppercase mt-1 px-1.5 py-0.5 rounded-sm inline-block badge-${m.state}`}>
                  {m.state}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-metrics text-sm">
                  {m.price != null ? `$${m.price.toLocaleString()}` : '—'}
                </div>
                <div className={`font-mono-metrics text-xs ${m.change24h >= 0 ? 'text-emerald' : 'text-rose'}`}>
                  {m.change24h >= 0 ? '+' : ''}{m.change24h}%
                </div>
              </div>
            </div>
          ))}

          {loading &&
            Array(Math.max(0, INSTRUMENTS.length - markets.length)).fill(0).map((_, i) => (
              <Skeleton key={`sk-${i}`} className="h-12 w-full bg-border" />
            ))}
        </div>
      </div>

      <div className="h-48 border-t border-border bg-card p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Macro Calendar</h3>
        <div className="space-y-3">
          <div className="text-xs border-l-2 border-rose pl-2">
            <div className="text-muted-foreground font-mono-metrics">14:30 UTC</div>
            <div className="font-medium text-foreground">US CPI Data (YoY)</div>
            <div className="text-muted-foreground mt-0.5">Act: 3.1% | Est: 3.2%</div>
          </div>
          <div className="text-xs border-l-2 border-amber pl-2">
            <div className="text-muted-foreground font-mono-metrics">18:00 UTC</div>
            <div className="font-medium text-foreground">FOMC Minutes</div>
            <div className="text-muted-foreground mt-0.5">Impact: High</div>
          </div>
        </div>
      </div>
    </div>
  );
}
