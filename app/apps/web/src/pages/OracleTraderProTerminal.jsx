import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Bot, ShieldCheck, KeyRound, Lock, CheckCircle2, AlertTriangle,
  Loader2, Wifi, WifiOff, RefreshCw, TrendingUp, BarChart2,
  Sparkles, DollarSign, Clock, LogOut, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import AIAssistantWidget from '@/components/AIAssistantWidget.jsx';

const ADMIN_EMAILS = ['meahunlimitedgroupe@gmail.com', 'dadyhaiti1985@gmail.com'];

const CRYPTO_PAIRS = [
  { value: 'BTC-USD', label: 'BTC/USD — Bitcoin' },
  { value: 'ETH-USD', label: 'ETH/USD — Ethereum' },
  { value: 'SOL-USD', label: 'SOL/USD — Solana' },
  { value: 'XRP-USD', label: 'XRP/USD — Ripple' },
  { value: 'ADA-USD', label: 'ADA/USD — Cardano' },
  { value: 'DOGE-USD', label: 'DOGE/USD — Dogecoin' },
  { value: 'LINK-USD', label: 'LINK/USD — Chainlink' },
  { value: 'AVAX-USD', label: 'AVAX/USD — Avalanche' },
];

const FOREX_PAIRS = [
  { value: 'EUR-USD', label: 'EUR/USD — Euro' },
  { value: 'GBP-USD', label: 'GBP/USD — British Pound' },
  { value: 'USD-JPY', label: 'USD/JPY — Japanese Yen' },
  { value: 'USD-CHF', label: 'USD/CHF — Swiss Franc' },
  { value: 'AUD-USD', label: 'AUD/USD — Australian Dollar' },
  { value: 'USD-CAD', label: 'USD/CAD — Canadian Dollar' },
  { value: 'NZD-USD', label: 'NZD/USD — New Zealand Dollar' },
];

const TIMEFRAMES = ['1H', '4H', '1D', '1W'];

const PAIR_LS_KEY = 'oracle_terminal_pair';
const TF_LS_KEY = 'oracle_terminal_tf';

async function authFetch(path, options = {}) {
  const makeHeaders = () => ({
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    Authorization: `Bearer ${pb.authStore.token}`,
  });
  let res = await apiServerClient.fetch(path, { ...options, headers: makeHeaders() });
  if (res.status === 401 && pb.authStore.isValid) {
    try { await pb.collection('users').authRefresh(); } catch (_) { return res; }
    res = await apiServerClient.fetch(path, { ...options, headers: makeHeaders() });
  }
  return res;
}

// ── Header ──────────────────────────────────────────────────────────────────
function TerminalHeader({ credInfo, botActive, onEditKeys, onDisconnect, disconnecting }) {
  const isAdmin = Boolean(
    pb.authStore.record?.email && ADMIN_EMAILS.includes(String(pb.authStore.record.email).toLowerCase()),
  );

  return (
    <header className="glass-card p-4 sm:p-5 mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center glow-green shrink-0">
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-emerald" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold tracking-tight leading-tight">
            ORACLE-TRADER-PRO
            <span className="text-muted-foreground font-normal text-xs sm:text-sm hidden sm:inline"> | Terminal Trading</span>
          </h1>
          <p className="text-xs font-mono-metrics text-muted-foreground">
            {credInfo?.exchange ?? '—'} · {isAdmin ? 'ADMIN (UNLIMITED)' : 'Abòné Aktif'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {botActive ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono-metrics bg-emerald/20 border border-emerald/60 text-emerald glow-green">
            <span className="w-2 h-2 rounded-full bg-emerald pulse-dot shrink-0" />
            <span className="hidden sm:inline">LIVE TRADE AKTIF</span>
            <span className="sm:hidden">LIVE</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono-metrics bg-cyan/10 border border-cyan/40 text-cyan">
            <Wifi className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">API CONNECTED</span>
            <span className="sm:hidden">CONNECTED</span>
          </span>
        )}

        <Button size="sm" variant="outline" onClick={onEditKeys}
          className="border-cyan/40 text-cyan hover:bg-cyan/10 min-h-[36px] text-xs gap-1.5">
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">MODIFYE API KEYS</span>
          <span className="sm:hidden">Modifye</span>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline"
              className="border-rose/40 text-rose hover:bg-rose/10 min-h-[36px] text-xs gap-1.5"
              disabled={disconnecting}>
              {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">DEBRANCHE ORACLE</span>
              <span className="sm:hidden">Debranche</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Debranche ORACLE?</AlertDialogTitle>
              <AlertDialogDescription>
                Sa a ap efase kle API ou yo epi voye ou tounen sou paj konfigirasyon an. Bot trading la ap kanpe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anile</AlertDialogCancel>
              <AlertDialogAction onClick={onDisconnect} className="bg-destructive hover:bg-destructive/90">
                Wi, Debranche
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}

// ── Connected status panel ───────────────────────────────────────────────────
function ConnectedStatus({ info, onRefresh, refreshing }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Kont Konekte</h2>
        </div>
        <button onClick={onRefresh} disabled={refreshing}
          className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="space-y-2 text-sm font-mono-metrics">
        {[
          ['Platfòm', info.exchange],
          ['API Key', info.apiKeyPreview],
          ['API Secret', info.apiSecretPreview],
          ['Max Risk', `${info.maxRiskPercent ?? '—'}%`],
          ['Stop-Loss', `${info.stopLossPercent ?? '—'}%`],
          ['Take-Profit', `${info.takeProfitPercent ?? '—'}%`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-muted-foreground">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pair / TF selector ────────────────────────────────────────────────────────
function PairSelector({ pair, onPairChange, timeframe, onTfChange, capital, onCapitalChange }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-cyan shrink-0" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Trading Pair</h2>
        <span className="ml-auto px-2.5 py-1 rounded-md text-xs font-mono-metrics bg-cyan/10 border border-cyan/40 text-cyan">
          {pair.replace('-', '/')}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Crypto Pairs</Label>
          <Select value={CRYPTO_PAIRS.find((p) => p.value === pair) ? pair : 'none'}
            onValueChange={(v) => { if (v !== 'none') onPairChange(v); }}>
            <SelectTrigger className="font-mono-metrics text-xs"><SelectValue placeholder="Krypto..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Krypto —</SelectItem>
              {CRYPTO_PAIRS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Forex Pairs</Label>
          <Select value={FOREX_PAIRS.find((p) => p.value === pair) ? pair : 'none'}
            onValueChange={(v) => { if (v !== 'none') onPairChange(v); }}>
            <SelectTrigger className="font-mono-metrics text-xs"><SelectValue placeholder="Forex..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Forex —</SelectItem>
              {FOREX_PAIRS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Timeframe</Label>
          <div className="flex gap-1.5">
            {TIMEFRAMES.map((tf) => (
              <button key={tf} onClick={() => onTfChange(tf)}
                className={`flex-1 min-h-[44px] sm:min-h-[36px] rounded-md text-xs font-mono-metrics transition-colors border active:scale-95 ${
                  timeframe === tf ? 'bg-cyan/15 border-cyan/50 text-cyan' : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}>{tf}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="terminal-capital" className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Kapital Disponib (USD)
          </Label>
          <Input id="terminal-capital" name="capital" type="number" min="1" step="1" value={capital}
            onChange={(e) => onCapitalChange(e.target.value)} placeholder="1000" className="font-mono-metrics" />
        </div>
        <div className="text-xs text-muted-foreground space-y-1 pb-1">
          <div className="flex justify-between"><span>Pè Aktif</span><span className="text-foreground font-mono-metrics">{pair.replace('-', '/')}</span></div>
          <div className="flex justify-between"><span>Timeframe</span><span className="text-foreground font-mono-metrics">{timeframe}</span></div>
          <div className="flex justify-between"><span>Kapital</span><span className="text-foreground font-mono-metrics">${Number(capital || 0).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}

// ── QuantMaster AI analysis panel ─────────────────────────────────────────────
function AiAnalysisPanel({ pair, timeframe, capital }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await authFetch('/ai/analyze-trade', {
        method: 'POST',
        body: JSON.stringify({ symbol: pair, timeframe, capital: Number(capital || 1000) }),
      });
      if (!res.ok) throw new Error(`Erè ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      toast.error('Analiz echwe', { description: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-amber shrink-0" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground truncate">
            QuantMaster AI — {pair.replace('-', '/')}
          </h2>
        </div>
        <Button size="sm" onClick={runAnalysis} disabled={analyzing}
          className="bg-amber/90 text-background hover:bg-amber text-xs min-h-[44px] sm:min-h-[36px] shrink-0">
          {analyzing
            ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Ap Analize...</>
            : <><Sparkles className="w-3 h-3 mr-1" /> Analize {pair.replace('-', '/')}</>}
        </Button>
      </div>

      {!result && !analyzing && (
        <div className="border border-dashed border-border/60 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Klike "Analize" pou QuantMaster AI evalye <span className="text-amber font-mono-metrics">{pair.replace('-', '/')}</span> sou timeframe <span className="text-cyan font-mono-metrics">{timeframe}</span>.
          </p>
        </div>
      )}

      {analyzing && (
        <div className="border border-amber/20 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-amber/5">
          <Loader2 className="w-6 h-6 text-amber animate-spin" />
          <p className="text-sm text-amber/80 font-mono-metrics">Ap analize {pair.replace('-', '/')} / {timeframe}...</p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" /> Analiz teknik + siyal antre...
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1.5 rounded-md text-sm font-bold font-mono-metrics ${
              result.signal === 'BUY' ? 'bg-emerald/15 border border-emerald/40 text-emerald' :
              result.signal === 'SELL' ? 'bg-rose/15 border border-rose/40 text-rose' :
              'bg-amber/15 border border-amber/40 text-amber'
            }`}>{result.signal ?? 'HOLD'}</span>
            <span className="text-xs text-muted-foreground font-mono-metrics">
              {pair.replace('-', '/')} · {timeframe} · Konfiyans: {result.confluence ?? result.confidence ?? '—'}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Antre', value: result.entry ?? result.entryPrice, color: 'text-cyan' },
              { label: 'Stop-Loss', value: result.stopLoss ?? result.sl, color: 'text-rose' },
              { label: 'Take-Profit', value: result.takeProfit ?? result.tp, color: 'text-emerald' },
            ].map(({ label, value, color }) => (
              <div key={label} className="cyber-panel p-2 sm:p-3 rounded-lg text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                <div className={`text-sm sm:text-base font-bold font-mono-metrics ${color}`}>
                  {value ? `$${Number(value).toFixed(2)}` : '—'}
                </div>
              </div>
            ))}
          </div>
          {(result.rsi !== undefined || result.ema9 !== undefined) && (
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: 'RSI', value: result.rsi },
                { label: 'EMA 9', value: result.ema9 },
                { label: 'EMA 21', value: result.ema21 },
                { label: 'MACD', value: result.macd },
              ].filter(({ value }) => value !== undefined && value !== null).map(({ label, value }) => (
                <div key={label} className="bg-card border border-border/60 rounded px-3 py-1.5 text-center">
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                  <div className="text-xs font-mono-metrics text-foreground">{Number(value).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          {result.reasoning && (
            <div className="bg-card/50 border border-border/50 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
              {result.reasoning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Trades table ─────────────────────────────────────────────────────────────
function TradesTable({ trades }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Istwa Tranzaksyon Ou (Izole Sou Kont Pa Ou)
      </h2>
      {trades.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Poko gen tranzaksyon. Bot la ap egzekite sèlman sou pwòp API keys ou bay yo.
        </p>
      ) : (
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <table className="w-full min-w-[500px] text-xs font-mono-metrics">
            <thead>
              <tr className="text-muted-foreground text-left">
                {['Byen', 'Kalite', 'Kantite', 'Antre', 'Sòti', 'P/L', 'Estati'].map((h) => (
                  <th key={h} className="py-1.5 pr-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-t border-border/50">
                  <td className="py-1.5 pr-3">{t.asset}</td>
                  <td className="py-1.5 pr-3 uppercase">{t.type}</td>
                  <td className="py-1.5 pr-3">{t.amount}</td>
                  <td className="py-1.5 pr-3">{t.entryPrice}</td>
                  <td className="py-1.5 pr-3">{t.exitPrice ?? '—'}</td>
                  <td className={`py-1.5 pr-3 ${t.pnl >= 0 ? 'text-emerald' : 'text-rose'}`}>{t.pnl ?? '—'}</td>
                  <td className="py-1.5 pr-3">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Bot activation section ────────────────────────────────────────────────────
function BotActivationPanel({ credInfo, botActive, onActivate }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-emerald shrink-0" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Kontròl Bot Trading
        </h2>
      </div>
      {botActive ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald/10 border border-emerald/40">
          <span className="w-3 h-3 rounded-full bg-emerald pulse-dot shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald">ROBOT A AP TRAVAY — LIVE TRADE AKTIF</p>
            <p className="text-xs text-muted-foreground">Bot ap egzekite tranzaksyon otomatikman sou {credInfo?.exchange}.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Kle API ou yo sove. Klike pou aktive bot trading la sou <strong>{credInfo?.exchange}</strong>.
          </p>
          <Button onClick={onActivate}
            className="w-full min-h-[48px] font-bold bg-emerald text-background hover:bg-emerald/90 shadow-lg"
            style={{ boxShadow: '0 0 20px hsl(151 100% 45% / 0.4)' }}>
            <Bot className="w-4 h-4 mr-2" /> DEMARE ROBOT A / START BOT
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Main Terminal ─────────────────────────────────────────────────────────────
export default function OracleTraderProTerminal() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [credInfo, setCredInfo] = useState(null);
  const [trades, setTrades] = useState([]);
  const [botActive, setBotActive] = useState(
    () => localStorage.getItem('oracle_bot_active') === 'true',
  );

  const [selectedPair, setSelectedPair] = useState(() => localStorage.getItem(PAIR_LS_KEY) ?? 'BTC-USD');
  const [selectedTf, setSelectedTf] = useState(() => localStorage.getItem(TF_LS_KEY) ?? '4H');
  const [capital, setCapital] = useState('1000');

  const handlePairChange = (v) => { setSelectedPair(v); localStorage.setItem(PAIR_LS_KEY, v); };
  const handleTfChange = (v) => { setSelectedTf(v); localStorage.setItem(TF_LS_KEY, v); };

  const loadData = useCallback(async (showSpinner = false) => {
    if (!pb.authStore.isValid) { navigate('/login'); return; }
    if (showSpinner) setRefreshing(true);
    try {
      const [credRes, tradesRes] = await Promise.all([
        authFetch('/oracle-trader-pro/credentials'),
        authFetch('/oracle-trader-pro/trades'),
      ]);
      if (credRes.ok) {
        const data = await credRes.json();
        if (!data.connected) {
          // No credentials — redirect to setup
          navigate('/oracle-trader-pro/setup', { replace: true });
          return;
        }
        setCredInfo(data);
      }
      if (tradesRes.ok) {
        const t = await tradesRes.json();
        setTrades(Array.isArray(t) ? t : []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  const timerRef = useRef(null);
  useEffect(() => {
    loadData();
    timerRef.current = setInterval(() => loadData(), 5 * 60 * 1000);
    return () => clearInterval(timerRef.current);
  }, [loadData]);

  const handleActivateBot = () => {
    setBotActive(true);
    localStorage.setItem('oracle_bot_active', 'true');
    toast.success('Bot aktive!', { description: 'ROBOT A AP TRAVAY — LIVE TRADE AKTIF' });
  };

  const handleEditKeys = () => navigate('/oracle-trader-pro/setup');

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      // Clear credentials via PocketBase direct
      const userId = pb.authStore.record?.id;
      if (userId) {
        await pb.collection('users').update(userId, { apiKey: '', apiSecret: '' }, { requestKey: null });
      }
      localStorage.removeItem('oracle_bot_active');
      setBotActive(false);
      toast.success('ORACLE debranche avèk siksè');
      navigate('/oracle-trader-pro/setup', { replace: true });
    } catch (err) {
      toast.error('Erè nan dekoneksyon', { description: err.message });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg p-3 sm:p-4 lg:p-6 overflow-x-hidden w-full">
      <Helmet>
        <title>Terminal Trading — Oracle Trader Pro</title>
        <meta name="description" content="Terminal trading avanse ORACLE-TRADER-PRO ak QuantMaster AI." />
      </Helmet>

      <div className="max-w-5xl mx-auto w-full">
        <TerminalHeader
          credInfo={credInfo}
          botActive={botActive}
          onEditKeys={handleEditKeys}
          onDisconnect={handleDisconnect}
          disconnecting={disconnecting}
        />

        <div className="space-y-6">
          {/* Pair + TF */}
          <PairSelector
            pair={selectedPair} onPairChange={handlePairChange}
            timeframe={selectedTf} onTfChange={handleTfChange}
            capital={capital} onCapitalChange={setCapital}
          />

          {/* QuantMaster AI */}
          <AiAnalysisPanel pair={selectedPair} timeframe={selectedTf} capital={capital} />

          {/* Bot + credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <BotActivationPanel credInfo={credInfo} botActive={botActive} onActivate={handleActivateBot} />
            {credInfo && (
              <ConnectedStatus info={credInfo} onRefresh={() => loadData(true)} refreshing={refreshing} />
            )}
          </div>

          <TradesTable trades={trades} />
        </div>
      </div>

      <AIAssistantWidget selectedPair={selectedPair} selectedTimeframe={selectedTf} capital={capital} />
    </div>
  );
}
