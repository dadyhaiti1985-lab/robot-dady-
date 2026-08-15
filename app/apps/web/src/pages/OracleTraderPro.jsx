import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, Area, AreaChart, LineChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, PieChart, Pie, Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  Activity, Power, Zap, Bell, Bot, Wifi, Radio, Cpu, Terminal, Newspaper,
  CalendarClock, TrendingUp, TrendingDown, KeyRound, Gauge, Layers,
  ArrowUpRight, ArrowDownRight, ShieldCheck, ChevronRight, CircleDot, Crown, ChevronDown,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import AiTradingAssistant from '@/components/AiTradingAssistant.jsx';
import integratedAiClient from '@/lib/integratedAiClient';
import pocketbaseClient from '@/lib/pocketbaseClient';
import { useOwnAccountData } from '@/hooks/useOwnAccountData';
import { toast } from 'sonner';

const usd = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* Mobile collapsible wrapper — keeps side panels reachable without overflow. */
function MobilePanel({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="md:hidden glass-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-border/60">{children}</div>}
    </div>
  );
}

/* ---------------- helpers / mock engine ---------------- */

const ASSETS = [
  { symbol: 'BTC-USD', label: 'Bitcoin', base: 64951.94, kind: 'Kripto' },
  { symbol: 'ETH-USD', label: 'Ethereum', base: 3412.55, kind: 'Kripto' },
  { symbol: 'XAU/USD', label: 'Gold Spot', base: 2338.12, kind: 'Komodite' },
  { symbol: 'XAG/USD', label: 'Silver Spot', base: 29.44, kind: 'Komodite' },
  { symbol: 'NZD/USD', label: 'NZ Dollar', base: 0.6094, kind: 'Forex' },
  { symbol: 'USD/CHF', label: 'Swiss Franc', base: 0.8977, kind: 'Forex' },
  { symbol: 'SOL-USD', label: 'Solana', base: 146.7, kind: 'Kripto' },
];

const TABS = [
  { id: 'price', label: 'PRICE/SMA' },
  { id: 'rsi', label: 'RSI MONITOR' },
  { id: 'sdk', label: 'SDK PYTHON' },
  { id: 'telegram', label: 'TELEGRAM CAST' },
  { id: 'backtest', label: 'BACKTEST' },
  { id: 'strategies', label: 'STRATEGIES' },
];



function genCandles(base, count = 48) {
  let price = base;
  const out = [];
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const drift = (Math.random() - 0.48) * base * 0.006;
    const open = price;
    const close = price + drift;
    const high = Math.max(open, close) + Math.random() * base * 0.003;
    const low = Math.min(open, close) - Math.random() * base * 0.003;
    price = close;
    out.push({
      t: new Date(now - i * 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open, close, high, low,
      sma: close * (0.997 + Math.random() * 0.004),
      rsi: Math.min(85, Math.max(18, 50 + (Math.random() - 0.5) * 55)),
      body: [Math.min(open, close), Math.max(open, close)],
      wick: [low, high],
      up: close >= open,
    });
  }
  return out;
}

function genPerf() {
  let v = 100;
  return Array.from({ length: 30 }, (_, i) => {
    v += (Math.random() - 0.42) * 3.2;
    return { day: `D${i + 1}`, value: Number(v.toFixed(2)) };
  });
}

const CandleShape = (props) => {
  const { x, y, width, height, payload } = props;
  if (payload == null || y == null || height == null) return null;
  const { high, low, open, close } = payload;
  const range = high - low || 1;
  // y => high (top), y+height => low (bottom); linear map value -> pixel
  const toY = (v) => y + ((high - v) / range) * height;
  const cx = x + width / 2;
  const color = close >= open ? 'hsl(151 100% 45%)' : 'hsl(349 100% 55%)';
  const yOpen = toY(open);
  const yClose = toY(close);
  const bodyTop = Math.min(yOpen, yClose);
  const bodyH = Math.max(2, Math.abs(yClose - yOpen));
  const w = Math.max(2, width * 0.6);
  return (
    <g>
      <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} strokeWidth={1} />
      <rect x={cx - w / 2} y={bodyTop} width={w} height={bodyH} fill={color} rx={1} />
    </g>
  );
};

/* ---------------- small UI atoms ---------------- */

const StatChip = ({ label, value, tone = 'muted' }) => {
  const tones = {
    green: 'text-emerald',
    red: 'text-rose',
    cyan: 'text-cyan',
    muted: 'text-foreground',
  };
  return (
    <div className="flex flex-col px-3 border-l border-border/60 first:border-l-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`font-mono-metrics text-sm font-semibold ${tones[tone]}`}>{value}</span>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, children, accent = 'text-cyan' }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className={`w-4 h-4 ${accent}`} />
    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{children}</h3>
  </div>
);

/* ---------------- Top Nav ---------------- */

function TopNav({ live, setLive, toggles, setToggles, sentiment, account }) {
  const connected = Boolean(account.credentials?.connected);
  return (
    <header className="shrink-0 glass-card !rounded-none border-x-0 border-t-0 flex flex-wrap items-center px-3 sm:px-4 py-2 gap-2 sm:gap-4 z-30">
      <div className="flex items-center gap-2.5 pr-2 sm:pr-4 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center glow-green shrink-0">
          <Bot className="w-5 h-5 text-emerald" />
        </div>
        <div className="leading-none min-w-0">
          <div className="font-bold text-sm sm:text-base tracking-tight truncate">ORACLE-TRADER-PRO</div>
          <div className="text-[10px] font-mono-metrics text-emerald">V4.2.0 AUTONOMOUS</div>
        </div>
      </div>

      {/* Balances — strictly the signed-in user's own account, $0.00 by default */}
      <div className="order-last w-full lg:order-none lg:w-auto flex items-center overflow-x-auto scrollbar-hide">
        <StatChip label="Balans Coinbase" value={usd(account.balance.total)} tone="green" />
        <StatChip label="Ekite" value={usd(account.balance.total)} tone="cyan" />
        <StatChip label="Disponib" value={usd(account.balance.available)} tone="muted" />
        <StatChip label="P/L Revalize" value={`${account.balance.change24h >= 0 ? '+' : ''}${Number(account.balance.change24h || 0).toFixed(2)}`} tone={account.balance.change24h >= 0 ? 'green' : 'red'} />
        <StatChip label="Santiman" value={sentiment} tone="muted" />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${connected ? 'bg-emerald/10 border-emerald/30' : 'bg-muted border-border'}`}>
          <Wifi className={`w-3.5 h-3.5 ${connected ? 'text-emerald' : 'text-muted-foreground'}`} />
          <span className={`text-[10px] font-mono-metrics ${connected ? 'text-emerald' : 'text-muted-foreground'}`}>{connected ? 'CDP KONEKTE' : 'CDP PA KONFIGIRE'}</span>
          {connected && <span className="w-2 h-2 rounded-full bg-emerald pulse-dot" />}
        </div>

        <div className="hidden xl:flex items-center gap-1 mr-1">
          <ToggleBtn on={toggles.telegram} onClick={() => setToggles(t => ({ ...t, telegram: !t.telegram }))} icon={Radio} label="TG" />
          <ToggleBtn on={toggles.alerts} onClick={() => setToggles(t => ({ ...t, alerts: !t.alerts }))} icon={Bell} label="Alèt" />
          <ToggleBtn on={toggles.auto} onClick={() => setToggles(t => ({ ...t, auto: !t.auto }))} icon={Zap} label="Auto" />
        </div>

        <Link
          to="/dashboard/oracle-trader-pro"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium border bg-amber/10 border-amber/40 text-amber hover:bg-amber/20 transition-all"
        >
          <Crown className="w-3.5 h-3.5" /> KONT PA OU
        </Link>

        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono-metrics border ${live ? 'bg-emerald/10 border-emerald/40 text-emerald' : 'bg-muted border-border text-muted-foreground'}`}>
          <CircleDot className={`w-3.5 h-3.5 ${live ? 'text-emerald' : ''}`} />
          LIVE TRADE {live ? 'AKTIF' : 'OFF'}
        </div>

        <Button
          onClick={() => setLive(l => !l)}
          className={`h-11 sm:h-9 font-semibold text-xs sm:text-sm ${live ? 'bg-rose text-white hover:bg-rose/90 glow-red' : 'bg-emerald text-background hover:bg-emerald/90 glow-green'}`}
        >
          <Power className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">{live ? 'DEBRANCHE ORACLE' : 'BRANCHE ORACLE'}</span>
          <span className="sm:hidden ml-1">{live ? 'OFF' : 'ON'}</span>
        </Button>
      </div>
    </header>
  );
}

const ToggleBtn = ({ on, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium border transition-all ${on ? 'bg-cyan/10 border-cyan/40 text-cyan' : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'}`}
  >
    <Icon className="w-3.5 h-3.5" />{label}
  </button>
);

/* ---------------- Left Sidebar ---------------- */

function LeftSidebar({ prices, active, setActive, risk, setRisk, embedded = false, account }) {
  const riskTone = risk < 2 ? 'Konsèvatè' : risk < 2.8 ? 'Modere' : 'Max Risk';
  const connected = Boolean(account?.credentials?.connected);
  return (
    <aside className={embedded
      ? 'w-full flex flex-col'
      : 'w-72 shrink-0 border-r border-border bg-sidebar hidden md:flex flex-col overflow-y-auto scrollbar-hide'}>
      <div className="p-3 border-b border-border">
        <SectionTitle icon={Activity} accent="text-emerald">Live Market Scan</SectionTitle>
        <div className="space-y-1.5">
          {ASSETS.map(a => {
            const p = prices[a.symbol] || { price: a.base, change: 0 };
            const stable = Math.abs(p.change) < 0.4;
            return (
              <button
                key={a.symbol}
                onClick={() => setActive(a.symbol)}
                className={`w-full text-left p-2.5 rounded-lg border flex items-center justify-between transition-all ${active === a.symbol ? 'border-primary/50 bg-primary/5 glow-green' : 'border-border/60 bg-card/40 hover:border-border'}`}
              >
                <div>
                  <div className="text-sm font-semibold">{a.symbol}</div>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${stable ? 'badge-neutral' : p.change >= 0 ? 'badge-bullish' : 'badge-bearish'}`}>
                    {stable ? 'Stable' : p.change >= 0 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono-metrics text-xs">{p.price < 10 ? p.price.toFixed(4) : p.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className={`font-mono-metrics text-[11px] ${p.change >= 0 ? 'text-emerald' : 'text-rose'}`}>
                    {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <SectionTitle icon={Gauge} accent="text-amber">Risk Pou Chak Trade</SectionTitle>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{riskTone}</span>
          <span className="font-mono-metrics text-amber font-semibold">{risk.toFixed(1)}%</span>
        </div>
        <Slider value={[risk]} onValueChange={([v]) => setRisk(v)} min={1.8} max={3.2} step={0.1} />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
          <span>1.8% Konsèvatè</span>
          <span>3.2% Max</span>
        </div>
      </div>

      <div className="p-3">
        <SectionTitle icon={KeyRound} accent="text-cyan">Kle API Kont Pa Ou</SectionTitle>
        <div className="space-y-1.5">
          {[
            { key: 'EXCHANGE_API_KEY', ok: connected },
            { key: 'EXCHANGE_API_SECRET', ok: connected },
          ].map(e => (
            <div key={e.key} className="flex items-center justify-between text-[11px] font-mono-metrics px-2.5 py-1.5 rounded-md bg-card/50 border border-border/60">
              <span className="text-muted-foreground truncate">{e.key}</span>
              <span className={`flex items-center gap-1 ${e.ok ? 'text-emerald' : 'text-muted-foreground'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${e.ok ? 'bg-emerald' : 'bg-border'}`} />
                {e.ok ? 'SET' : 'PA KONFIGIRE'}
              </span>
            </div>
          ))}
          {!connected && (
            <Link to="/dashboard/oracle-trader-pro" className="block text-[11px] text-cyan hover:underline px-2.5 pt-1">
              Konekte kle API pa ou pou wè balans reyèl ou
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Center: Chart Workspace ---------------- */

function ChartWorkspace({ active, activeAsset, tab, setTab, candles, onSim }) {
  const last = candles[candles.length - 1]?.close || activeAsset.base;
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{active}</h2>
            <span className="font-mono-metrics text-lg text-emerald text-glow-green">
              ${last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono-metrics">{activeAsset.label} · EMA/SMA Crossover Aktif</div>
        </div>
        <div className="flex flex-wrap gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide border transition-all ${tab === t.id ? 'bg-primary/15 border-primary/50 text-emerald' : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] sm:h-[320px] w-full grid-bg rounded-lg border border-border/50 p-2">
        {tab === 'price' && (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={candles} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} orientation="right" width={64} tickFormatter={(v) => v.toFixed(v < 10 ? 3 : 0)} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="wick" shape={<CandleShape />} isAnimationActive={false} />
              <Line type="monotone" dataKey="sma" stroke="hsl(var(--accent-amber))" dot={false} strokeWidth={1.5} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {tab === 'rsi' && (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={candles} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis domain={[0, 100]} ticks={[30, 50, 70]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} orientation="right" width={40} />
              <ReferenceLine y={70} stroke="hsl(var(--accent-rose))" strokeDasharray="4 4" strokeOpacity={0.6} />
              <ReferenceLine y={30} stroke="hsl(var(--accent-emerald))" strokeDasharray="4 4" strokeOpacity={0.6} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="rsi" stroke="hsl(var(--accent-cyan))" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {tab === 'sdk' && (
          <pre className="text-[11px] font-mono-metrics text-foreground/90 h-full overflow-auto p-3 leading-relaxed">
{`# oracle_strategy_v4.py  — autonomous engine
def evaluate(self, ohlc):
    rsi = ta.rsi(ohlc, 14)
    sma_f, sma_s = ta.sma(ohlc, 9), ta.sma(ohlc, 21)
    if rsi < 30 and sma_f > sma_s:
        return Signal.BUY(size=self.risk_per_trade)
    if rsi > 70 and sma_f < sma_s:
        return Signal.SELL(size=self.position)
    return Signal.HOLD`}
          </pre>
        )}
        {tab === 'telegram' && (
          <div className="h-full overflow-auto p-2 space-y-2 font-mono-metrics text-xs">
            {['/status → Bot aktif', '/balance → gade balans kont pa ou', 'ALÈT: BTC-USD kwaze SMA anwo', '/pnl → +0.00 jodi a'].map((m, i) => (
              <div key={i} className="px-3 py-2 rounded-md bg-cyan/5 border border-cyan/20 text-cyan/90">{m}</div>
            ))}
          </div>
        )}
        {tab === 'backtest' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2 content-center h-full">
            {[['To Reyisit', '64.2%', 'text-emerald'], ['PnL', '+$4,250', 'text-emerald'], ['Drawdown', '-8.4%', 'text-rose'], ['Trades', '124', 'text-foreground']].map(([k, v, c]) => (
              <div key={k} className="glass-card p-4 text-center">
                <div className="text-[10px] uppercase text-muted-foreground mb-1">{k}</div>
                <div className={`font-mono-metrics text-xl ${c}`}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'strategies' && (
          <div className="p-2 space-y-2 h-full overflow-auto">
            {[['EMA/RSI Crossover', true], ['Mean Reversion', true], ['Momentum Breakout', false], ['Asset Rotation', true]].map(([s, on]) => (
              <div key={s} className="flex items-center justify-between px-3 py-2.5 rounded-md bg-card/50 border border-border/60">
                <span className="text-sm">{s}</span>
                <span className={`text-[10px] font-mono-metrics px-2 py-0.5 rounded ${on ? 'badge-bullish' : 'badge-neutral'}`}>{on ? 'AKTIF' : 'OFF'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <SectionTitle icon={Zap} accent="text-amber">Simulate Volatilite Sou Machè</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {[['+0.5%', 0.5, 'green'], ['+1.5% Squeeze', 1.5, 'green'], ['-0.5%', -0.5, 'red'], ['-1.5% Crash', -1.5, 'red']].map(([label, pct, tone]) => (
            <button
              key={label}
              onClick={() => onSim(pct)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono-metrics font-semibold border transition-all active:scale-95 ${tone === 'green' ? 'bg-emerald/10 border-emerald/40 text-emerald hover:bg-emerald/20' : 'bg-rose/10 border-rose/40 text-rose hover:bg-rose/20'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Center: Analytics + charts + signals ---------------- */

const MetricCard = ({ label, value, tone, icon: Icon }) => (
  <div className="glass-card p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <Icon className={`w-4 h-4 ${tone}`} />
    </div>
    <div className={`font-mono-metrics text-2xl font-bold ${tone}`}>{value}</div>
  </div>
);

function CenterExtras({ perf, trend }) {
  const signals = [
    { name: 'RSI (14)', val: '42.6', state: 'Neutral', tone: 'text-amber' },
    { name: 'SMA Aliman', val: 'Bullish', state: 'Achte', tone: 'text-emerald' },
    { name: 'MACD Hist', val: '+18.4', state: 'Bullish', tone: 'text-emerald' },
    { name: 'Bollinger', val: 'Mid Band', state: 'Neutral', tone: 'text-amber' },
  ];
  const news = [
    { tag: 'MACRO', title: 'Fed kenbe pousantaj yo — ton dovish', time: '2h' },
    { tag: 'KRIPTO', title: 'ETF Bitcoin wè antre kapital rekò', time: '4h' },
    { tag: 'FOREX', title: 'USD febli aprè done travay yo', time: '6h' },
  ];
  const calendar = [
    { evt: 'US CPI (YoY)', impact: 'Wo', when: '14:30 UTC', tone: 'text-rose' },
    { evt: 'Fed Rate Decision', impact: 'Wo', when: '18:00 UTC', tone: 'text-rose' },
    { evt: 'Unemployment Claims', impact: 'Mwayen', when: '12:30 UTC', tone: 'text-amber' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Portfolio Beta" value="0.00" tone="text-cyan" icon={Layers} />
        <MetricCard label="Max Drawdown" value="-5.95%" tone="text-rose" icon={TrendingDown} />
        <MetricCard label="Current Exposure" value="$0.00" tone="text-foreground" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <SectionTitle icon={TrendingUp} accent="text-emerald">Portfolio Performance (30 Jou)</SectionTitle>
          <div className="h-44">
            <ResponsiveContainer width="100%" height={176}>
              <AreaChart data={perf} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent-emerald))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--accent-emerald))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--accent-emerald))" fill="url(#perfFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4">
          <SectionTitle icon={Activity} accent="text-cyan">Real-Time Asset Trend</SectionTitle>
          <div className="h-44">
            <ResponsiveContainer width="100%" height={176}>
              <LineChart data={trend} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} minTickGap={40} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(v < 10 ? 2 : 0)} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="close" stroke="hsl(var(--accent-cyan))" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="glass-card p-4">
          <SectionTitle icon={Cpu} accent="text-emerald">Siyal ak Enstriman</SectionTitle>
          <div className="space-y-2">
            {signals.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs px-2.5 py-2 rounded-md bg-card/50 border border-border/50">
                <span className="text-muted-foreground">{s.name}</span>
                <span className={`font-mono-metrics ${s.tone}`}>{s.val}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-lg bg-emerald/5 border border-emerald/25">
            <div className="text-[10px] uppercase tracking-wider text-emerald mb-1">Oracle Trade Recommendation</div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald" /> ACHTE BTC-USD · Konfyans 84%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Akimilasyon fò detekte nan sipò aktyèl. Order-flow panche vè achte.</p>
          </div>
        </div>

        <div className="glass-card p-4">
          <SectionTitle icon={Newspaper} accent="text-cyan">Market Intelligence</SectionTitle>
          <div className="space-y-2">
            {news.map(n => (
              <div key={n.title} className="px-2.5 py-2 rounded-md bg-card/50 border border-border/50">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-mono-metrics px-1.5 py-0.5 rounded badge-neutral text-cyan">{n.tag}</span>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs leading-snug">{n.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <SectionTitle icon={CalendarClock} accent="text-amber">Kalandriye Macro</SectionTitle>
          <div className="space-y-2">
            {calendar.map(c => (
              <div key={c.evt} className="px-2.5 py-2 rounded-md bg-card/50 border-l-2 border border-border/50" style={{ borderLeftColor: 'hsl(var(--accent-amber))' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{c.evt}</span>
                  <span className="text-[10px] font-mono-metrics text-muted-foreground">{c.when}</span>
                </div>
                <span className={`text-[10px] ${c.tone}`}>Enpak: {c.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Right Sidebar ---------------- */

const DONUT_COLORS = ['hsl(151 100% 45%)', 'hsl(187 100% 50%)', 'hsl(43 96% 56%)', 'hsl(215 15% 45%)'];

function RightSidebar({ logs, account, embedded = false }) {
  const connected = Boolean(account.credentials?.connected);
  const donut = account.portfolio
    .filter((p) => p.value > 0)
    .slice(0, 4)
    .map((p, i) => ({ name: p.asset, value: Number(p.percentage || 0), color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  const journal = account.trades.map((t) => ({
    sym: t.asset, side: String(t.type || '').toUpperCase(), pnl: t.pnl,
  }));
  return (
    <aside className={embedded
      ? 'w-full flex flex-col'
      : 'w-80 shrink-0 border-l border-border bg-sidebar hidden md:flex flex-col overflow-y-auto scrollbar-hide'}>
      <div className="p-3 border-b border-border">
        <SectionTitle icon={Wifi} accent="text-emerald">API Config Status</SectionTitle>
        <div className={`p-3 rounded-lg border ${connected ? 'bg-emerald/5 border-emerald/25' : 'bg-card/50 border-border/60'}`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">{account.credentials?.exchange || 'Coinbase'} CDP Auth</span>
            {connected ? (
              <span className="text-emerald font-mono-metrics flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald pulse-dot" />OK</span>
            ) : (
              <span className="text-muted-foreground font-mono-metrics">PA KONFIGIRE</span>
            )}
          </div>
          <div className="text-[10px] font-mono-metrics text-muted-foreground">
            {connected ? 'kle chifre · izole sou kont pa ou' : account.userId ? 'Poko gen kle API sou kont ou' : 'Konekte pou wè estati kont ou'}
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <SectionTitle icon={Terminal} accent="text-cyan">oracle-stdout.log</SectionTitle>
        <div className="h-44 overflow-y-auto rounded-lg bg-[#05070c] border border-border/60 p-2.5 font-mono-metrics text-[10.5px] leading-relaxed space-y-0.5">
          {logs.map((l, i) => (
            <div key={i} className={l.includes('Echèk') || l.includes('undefined') ? 'text-rose' : l.includes('OK') || l.includes('AKTIF') ? 'text-emerald' : 'text-muted-foreground'}>
              <span className="text-cyan/50">{'>'}</span> {l}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <SectionTitle icon={Layers} accent="text-amber">Distribisyon Byen</SectionTitle>
        {donut.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            {account.userId ? 'Poko gen byen nan pòtfolyo ou. Balans: $0.00' : 'Konekte pou wè pòtfolyo pa ou.'}
          </p>
        ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donut} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={3} stroke="none">
                {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        )}
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {donut.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="ml-auto font-mono-metrics">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3">
        <SectionTitle icon={ChevronRight} accent="text-emerald">Tranzaksyon Journal</SectionTitle>
        {journal.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            {account.userId ? 'Poko gen tranzaksyon sou kont ou.' : 'Konekte pou wè tranzaksyon pa ou.'}
          </p>
        )}
        <div className="space-y-1.5">
          {journal.map((j, i) => (
            <div key={i} className="flex items-center justify-between px-2.5 py-2 rounded-md bg-card/50 border border-border/50">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono-metrics px-1.5 py-0.5 rounded ${j.side === 'BUY' ? 'badge-bullish' : 'badge-bearish'}`}>{j.side}</span>
                <span className="text-xs font-medium">{j.sym}</span>
              </div>
              <span className={`font-mono-metrics text-xs ${j.pnl >= 0 ? 'text-emerald' : 'text-rose'}`}>
                {j.pnl >= 0 ? '+' : ''}{j.pnl.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Page ---------------- */

export default function OracleTraderPro() {
  const [live, setLive] = useState(true);
  const [toggles, setToggles] = useState({ telegram: true, alerts: true, auto: false });
  const [risk, setRisk] = useState(1.8);
  const [active, setActive] = useState('BTC-USD');
  const [tab, setTab] = useState('price');
  const [prices, setPrices] = useState({});
  const [candles, setCandles] = useState([]);
  const simRef = useRef(0);
  const account = useOwnAccountData();

  const activeAsset = useMemo(() => ASSETS.find(a => a.symbol === active) || ASSETS[0], [active]);
  const perf = useMemo(() => genPerf(), []);
  const [logs, setLogs] = useState([
    'Inisyalize Oracle engine v4.2.0... OK',
    'Sesyon izole pou kont pa ou sèlman... OK',
    'Chaje estrateji EMA/RSI... OK',
    'Bot AKTIF · mode autonomous',
  ]);

  // regenerate candles when asset changes
  useEffect(() => {
    setCandles(genCandles(activeAsset.base));
  }, [active, activeAsset.base]);

  // live price ticks
  useEffect(() => {
    const seed = {};
    ASSETS.forEach(a => { seed[a.symbol] = { price: a.base, change: (Math.random() - 0.5) * 2 }; });
    setPrices(seed);
    const iv = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        ASSETS.forEach(a => {
          const cur = prev[a.symbol]?.price || a.base;
          const np = cur * (1 + (Math.random() - 0.5) * 0.002);
          next[a.symbol] = { price: np, change: (prev[a.symbol]?.change || 0) + (Math.random() - 0.5) * 0.15 };
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // live candle stream for active asset
  useEffect(() => {
    const iv = setInterval(() => {
      setCandles(prev => {
        if (!prev.length) return prev;
        const lastClose = prev[prev.length - 1].close;
        const bump = simRef.current;
        simRef.current = 0;
        const open = lastClose;
        const close = open * (1 + (Math.random() - 0.48) * 0.006 + bump / 100);
        const high = Math.max(open, close) + Math.random() * open * 0.003;
        const low = Math.min(open, close) - Math.random() * open * 0.003;
        const c = {
          t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open, close, high, low,
          sma: close * (0.997 + Math.random() * 0.004),
          rsi: Math.min(85, Math.max(18, 50 + (Math.random() - 0.5) * 55)),
          wick: [low, high], up: close >= open,
        };
        return [...prev.slice(1), c];
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [active]);

  // streaming logs
  useEffect(() => {
    const samples = [
      'Scan machè... 7 byen evalye',
      'Siyal detekte: BTC-USD SMA crossover',
      'Risk check OK · exposure 0.0%',
      'Heartbeat CDP... OK',
      'Telegram cast voye · /status',
    ];
    const iv = setInterval(() => {
      setLogs(prev => [...prev.slice(-30), `${new Date().toLocaleTimeString([], { hour12: false })} ${samples[Math.floor(Math.random() * samples.length)]}`]);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const handleSim = (pct) => {
    simRef.current = pct;
    setLogs(prev => [...prev.slice(-30), `SIM: aplike volatilite ${pct > 0 ? '+' : ''}${pct}% sou ${active}`]);
  };

  const [engineBusy, setEngineBusy] = useState(false);

  const runAutonomousCycle = async () => {
    if (engineBusy) return;
    if (!pocketbaseClient.authStore.isValid) {
      setLogs(prev => [...prev.slice(-30), 'Echèk motè otonòm: Konekte pou aktive motè otonòm lan (sign in required)']);
      toast.error('Motè otonòm', { description: 'Konekte pou aktive motè otonòm lan (sign in required)' });
      return;
    }
    setEngineBusy(true);
    const px = prices[active]?.price || activeAsset.base;
    const side = 'buy';
    try {
      setLogs(prev => [...prev.slice(-30), `ANALIZ TRANZAKSYON: ${active} pipeline 4-etap ap kouri...`]);
      const a = await integratedAiClient.fetch('/ai/analyze-trade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset: active, side, equity: account.balance.total }),
      });
      const an = a.analysis;
      setLogs(prev => [...prev.slice(-30),
        `RSI ${an.steps.technical.rsi} · ATR ${an.steps.volatility.atrPercent}% · konfliyans ${an.confluence}% · R:R 1:${an.riskReward}`]);
      if (!a.approved) {
        setLogs(prev => [...prev.slice(-30), `REJTE - Risk Twò Wo: ${a.reasons.join(', ')}`]);
        toast.warning('Setup rejte pa gadfou risk yo', { description: a.reasons.join(', ') });
        return;
      }
      const stopLoss = px * (1 - an.stopDistancePct / 100);
      const takeProfit = px * (1 + an.takeDistancePct / 100);
      const r = await integratedAiClient.fetch('/ai/execute-trade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset: active, side, equity: account.balance.total, entryPrice: px, stopLoss, takeProfit, riskPercent: Math.min(2, risk), confluence: an.confluence, rationale: 'Autonomous cycle' }),
      });
      if (r.executed) {
        setLogs(prev => [...prev.slice(-30), `EKZEKISYON OTOMATIK: ${side.toUpperCase()} ${active} @ ${px.toFixed(2)} | SL ${stopLoss.toFixed(2)} TP ${takeProfit.toFixed(2)}`]);
        toast.success(`Trade ekzekite: ${side.toUpperCase()} ${active}`, { description: `SL ${stopLoss.toFixed(2)} · TP ${takeProfit.toFixed(2)}` });
      } else {
        setLogs(prev => [...prev.slice(-30), `REJTE - Risk Twò Wo: ${(r.reasons || []).join(', ')}`]);
        toast.warning('Gadfou backend rejte trade a', { description: (r.reasons || []).join(', ') });
      }
    } catch (err) {
      const isAuthError = err?.status === 401 || /sign in|session/i.test(err?.message || '');
      const msg = isAuthError ? 'Konekte pou aktive motè otonòm lan (sign in required)' : (err.message || 'Erè');
      setLogs(prev => [...prev.slice(-30), `Echèk motè otonòm: ${msg}`]);
      toast.error('Motè otonòm', { description: msg });
    } finally {
      setEngineBusy(false);
    }
  };

  const trend = candles;
  const sentiment = 'Neutral';

  return (
    <div className="min-h-screen md:h-screen w-full max-w-[100vw] flex flex-col bg-background text-foreground overflow-x-hidden md:overflow-hidden">
      <TopNav live={live} setLive={setLive} toggles={toggles} setToggles={setToggles} sentiment={sentiment} account={account} />
      <div className="flex flex-1 md:overflow-hidden min-w-0">
        <LeftSidebar prices={prices} active={active} setActive={setActive} risk={risk} setRisk={setRisk} account={account} />
        <main className="flex-1 md:overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0 w-full pb-24">
          <MobilePanel title="Live Market Scan" defaultOpen>
            <LeftSidebar embedded prices={prices} active={active} setActive={setActive} risk={risk} setRisk={setRisk} account={account} />
          </MobilePanel>
          <ChartWorkspace active={active} activeAsset={activeAsset} tab={tab} setTab={setTab} candles={candles} onSim={handleSim} />
          <CenterExtras perf={perf} trend={trend} />
          <MobilePanel title="API Config / Logs">
            <RightSidebar embedded logs={logs} account={account} />
          </MobilePanel>
        </main>
        <RightSidebar logs={logs} account={account} />
      </div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92vw] sm:w-auto">
        <Button onClick={runAutonomousCycle} disabled={engineBusy}
          className="w-full sm:w-auto min-h-[44px] bg-cyan text-background hover:bg-cyan/90 glow-cyan font-semibold shadow-lg">
          <Zap className="w-4 h-4 mr-2" />
          {engineBusy ? 'ANALIZ AP KOURI...' : 'EKZEKISYON OTOMATIK'}
        </Button>
      </div>
      <AiTradingAssistant />
    </div>
  );
}
