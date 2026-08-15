import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Area, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine 
} from 'recharts';
import apiServerClient from '@/lib/apiServerClient';
import { Skeleton } from '@/components/ui/skeleton';

// Generate mock OHLC-like data for visual presentation since Recharts doesn't natively do candlesticks easily
const generateChartData = (basePrice) => {
  let price = basePrice;
  const data = [];
  const now = new Date();
  for (let i = 60; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    price = price + (Math.random() - 0.48) * (basePrice * 0.005);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Number(price.toFixed(2)),
      ema: Number((price * 0.998).toFixed(2)),
      rsi: Math.floor(Math.random() * 60) + 20
    });
  }
  return data;
};

export default function PriceChart({ instrument }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetchInitial = async () => {
      try {
        const res = await apiServerClient.fetch(`/coinbase/price?symbol=${instrument}`);
        const currentData = await res.json();
        
        if (active) {
          const chartData = generateChartData(currentData.price || 40000);
          setData(chartData);
          setCurrentPrice(currentData.price || 40000);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) setLoading(false);
      }
    };

    fetchInitial();

    return () => { active = false; };
  }, [instrument]);

  if (loading) {
    return <Skeleton className="w-full h-full bg-sidebar" />;
  }

  const takeProfit = currentPrice * 1.02;
  const stopLoss = currentPrice * 0.985;

  return (
    <div className="flex flex-col h-full bg-card relative cyber-panel border-0">
      {/* Main Chart Area */}
      <div className="flex-1 min-h-[60%] p-4 pb-0" style={{ minHeight: 260 }}>
        <div className="absolute top-4 left-6 z-10">
          <h2 className="text-2xl font-bold text-foreground">{instrument}</h2>
          <div className="text-sm font-mono-metrics text-muted-foreground">EMA Crossover Strategy Active</div>
        </div>
        
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 40, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent-cyan))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--accent-cyan))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} />
            <YAxis domain={['auto', 'auto']} stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--sidebar))', border: '1px solid hsl(var(--border))' }}
              itemStyle={{ fontFamily: 'JetBrains Mono' }}
            />
            
            <ReferenceLine y={currentPrice} stroke="hsl(var(--accent-cyan))" strokeDasharray="3 3" label={{ position: 'right', value: 'SPOT', fill: 'hsl(var(--accent-cyan))', fontSize: 10 }} />
            <ReferenceLine y={takeProfit} stroke="hsl(var(--accent-emerald))" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'TP', fill: 'hsl(var(--accent-emerald))', fontSize: 10 }} />
            <ReferenceLine y={stopLoss} stroke="hsl(var(--accent-rose))" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'SL', fill: 'hsl(var(--accent-rose))', fontSize: 10 }} />

            <Area type="monotone" dataKey="price" stroke="hsl(var(--accent-cyan))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
            <Line type="monotone" dataKey="ema" stroke="hsl(var(--accent-amber))" strokeWidth={1} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Sub-chart */}
      <div className="h-1/3 border-t border-border p-4" style={{ minHeight: 120 }}>
        <ResponsiveContainer width="100%" height={120}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <YAxis domain={[0, 100]} ticks={[30, 50, 70]} stroke="hsl(var(--muted-foreground))" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
            <ReferenceLine y={70} stroke="hsl(var(--accent-rose))" strokeOpacity={0.5} strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="hsl(var(--accent-emerald))" strokeOpacity={0.5} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="rsi" stroke="#A855F7" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}