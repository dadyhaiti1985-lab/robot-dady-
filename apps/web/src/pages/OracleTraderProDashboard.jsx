import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Bot, KeyRound, Shield, Eye, EyeOff, Save, Play, Square,
  TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle2,
  Loader2, Edit3, BarChart2, DollarSign, Activity, Clock,
  LogOut, Settings, Zap, Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ADMIN_EMAILS = ['meahunlimitedgroupe@gmail.com', 'dadyhaiti1985@gmail.com'];

// Module-level flags persist across component remounts — prevents burst on navigation
let _balanceFetching = false;
let _balanceLastFetch = 0;
let _balanceUnauthorized = false; // set true on COINBASE_UNAUTHORIZED — stops ALL future calls until page reload

async function authFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    Authorization: `Bearer ${pb.authStore.token}`,
  };
  let res = await apiServerClient.fetch(path, { ...options, headers });
  if (res.status === 401 && pb.authStore.isValid) {
    try { await pb.collection('users').authRefresh(); } catch (_) { return res; }
    res = await apiServerClient.fetch(path, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${pb.authStore.token}` },
    });
  }
  return res;
}

function maskKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 6) + '•••••' + key.slice(-4);
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-foreground', glow, onSubClick }) {
  return (
    <div className={`glass-card p-4 flex flex-col gap-1 ${glow || ''}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className={`text-2xl font-bold font-mono-metrics ${color}`}>{value}</p>
      {sub && (
        onSubClick
          ? <button onClick={onSubClick} className="text-xs text-muted-foreground hover:text-primary text-left cursor-pointer underline-offset-2 hover:underline">{sub}</button>
          : <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

// ── Inline API Config Form (shown when no credentials) ─────────────────────
function ApiConfigSection({ onSaved, isAdmin }) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [platform, setPlatform] = useState('Coinbase');
  const [maxRisk, setMaxRisk] = useState('2');
  const [stopLoss, setStopLoss] = useState('2');
  const [takeProfit, setTakeProfit] = useState('5');
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!apiKey || apiKey.trim().length < 20) e.apiKey = 'API Key dwe gen omwen 20 karaktè';
    if (!apiSecret || apiSecret.trim().length < 20) e.apiSecret = 'API Secret dwe gen omwen 20 karaktè';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      let savedOk = false;
      try {
        const res = await authFetch('/oracle-trader-pro/credentials', {
          method: 'POST',
          body: JSON.stringify({
            exchange: platform,
            apiKey: apiKey.trim(),
            apiSecret: apiSecret.trim(),
            passphrase: passphrase.trim() || undefined,
            maxRiskPercent: Number(maxRisk) || 2,
            stopLossPercent: Number(stopLoss) || 2,
            takeProfitPercent: Number(takeProfit) || 5,
          }),
        });
        if (res.ok) savedOk = true;
        else if (res.status >= 500) throw new Error('backend_down');
        else {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Erè ${res.status}`);
        }
      } catch (err) {
        if (err.message !== 'backend_down') throw err;
        await pb.collection('users').update(pb.authStore.record.id, {
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          platform,
          maxRisk: Number(maxRisk),
          stopLoss: Number(stopLoss),
          takeProfit: Number(takeProfit),
        }, { requestKey: null });
        savedOk = true;
      }

      if (savedOk) {
        setSaved(true);
        toast.success('✅ Kredansyèl yo sove! N\'ap chaje dashboard la...');
        setTimeout(() => onSaved(), 1500);
      }
    } catch (err) {
      toast.error('Erè nan sove: ' + (err.message || 'Pwoblèm enkoni'));
    } finally {
      setSaving(false);
    }
  };

  const canSave = apiKey.trim().length >= 20 && apiSecret.trim().length >= 20;

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center glow-green">
          <CheckCircle2 className="w-9 h-9 text-emerald" />
        </div>
        <h2 className="text-2xl font-bold text-emerald">Kredansyèl yo Sove!</h2>
        <p className="text-muted-foreground text-sm">Ap konekte ak {platform}... louvri dashboard la.</p>
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center glow-green mb-4">
          <Bot className="w-9 h-9 text-emerald" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Konekte Exchange ou</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Antre kle API ou pou aktive ORACLE-TRADER-PRO. Yo chifre AES-256-GCM
          epi pèsiste — ou p'ap janm mande yo ankò.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        {!isAdmin && (
          <div className="mb-5 p-3 rounded-lg border border-amber/40 bg-amber/10 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber mt-0.5 shrink-0" />
            <p className="text-xs text-amber">
              Abònman ORACLE-TRADER-PRO ($35/mwa) nesesè pou aktive bot.{' '}
              <Link to="/plans" className="underline">Achte Plan →</Link>
            </p>
          </div>
        )}

        <div className="mb-5 p-3 rounded-lg border border-cyan/20 bg-cyan/5 flex items-start gap-2">
          <Shield className="w-4 h-4 text-cyan mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Kle yo chifre AES-256-GCM anvan yo sove. Yo pa janm parèt nan konsòl oswa UI a.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Platform */}
          <div className="space-y-1.5">
            <Label htmlFor="cfg-platform">Platform Exchange</Label>
            <select
              id="cfg-platform"
              name="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {['Coinbase', 'Binance', 'Bybit', 'KuCoin', 'Kraken'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label htmlFor="cfg-api-key">{platform} API Key <span className="text-muted-foreground text-xs">(requis — min 20 karaktè)</span></Label>
            <div className="relative">
              <Input id="cfg-api-key" name="apiKey" type={showKey ? 'text' : 'password'} autoComplete="off"
                value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                placeholder="Kole kle API ou isit la..." className="h-11 pr-10" />
              <button type="button" onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.apiKey && <p className="text-xs text-rose">{errors.apiKey}</p>}
          </div>

          {/* API Secret */}
          <div className="space-y-1.5">
            <Label htmlFor="cfg-api-secret">{platform} API Secret <span className="text-muted-foreground text-xs">(requis — min 20 karaktè)</span></Label>
            <div className="relative">
              <Input id="cfg-api-secret" name="apiSecret" type={showSecret ? 'text' : 'password'} autoComplete="off"
                value={apiSecret} onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Kole sekrè API ou isit la..." className="h-11 pr-10" />
              <button type="button" onClick={() => setShowSecret(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.apiSecret && <p className="text-xs text-rose">{errors.apiSecret}</p>}
          </div>

          {/* Passphrase */}
          <div className="space-y-1.5">
            <Label htmlFor="cfg-passphrase">Passphrase <span className="text-muted-foreground text-xs">(opsyonèl — Coinbase Pro sèlman)</span></Label>
            <Input id="cfg-passphrase" name="passphrase" type="password" autoComplete="off"
              value={passphrase} onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Kite vid si ou pa gen yon passphrase" className="h-11" />
          </div>

          {/* Risk Parameters */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Max Risk %', value: maxRisk, onChange: setMaxRisk, min: '1', max: '5', id: 'cfg-max-risk', name: 'maxRisk' },
              { label: 'Stop-Loss %', value: stopLoss, onChange: setStopLoss, min: '1', max: '10', id: 'cfg-stop-loss', name: 'stopLoss' },
              { label: 'Take-Profit %', value: takeProfit, onChange: setTakeProfit, min: '1', max: '50', id: 'cfg-take-profit', name: 'takeProfit' },
            ].map(({ label, value, onChange, min, max, id, name }) => (
              <div key={label} className="space-y-1.5">
                <Label htmlFor={id} className="text-xs">{label}</Label>
                <Input id={id} name={name} type="number" min={min} max={max} step="0.5"
                  value={value} onChange={(e) => onChange(e.target.value)}
                  className="h-10 text-center font-mono-metrics" />
              </div>
            ))}
          </div>

          {/* Permissions */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            <span className="font-medium text-foreground">Permissions ki nesesè:</span>
            {['Trade', 'Read Balances', 'View Transactions'].map(p => (
              <span key={p} className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald" /> {p}
              </span>
            ))}
          </div>

          <Button type="submit" disabled={saving || !canSave}
            className="w-full min-h-[52px] text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2 disabled:opacity-50"
            style={canSave ? { boxShadow: '0 0 20px hsl(151 100% 45% / 0.4)' } : {}}>
            {saving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ap chifre & sove...</>
              : <><Save className="w-4 h-4 mr-2" />SOVE & KONEKTE ROBO A</>}
          </Button>

          {!canSave && (apiKey || apiSecret) && (
            <p className="text-xs text-center text-muted-foreground">
              Antre API Key & Secret (omwen 20 karaktè chak) pou kontinye
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Bot Control Panel ───────────────────────────────────────────────────────
function BotControlPanel({ credentials, onEditKeys, isAdmin, navigate }) {
  const [botActive, setBotActive] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [trades, setTrades] = useState([]);
  const [balance, setBalance] = useState({ total: 0, available: 0, change24h: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [statusError, setStatusError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [balanceStatus, setBalanceStatus] = useState('idle'); // 'idle' | 'loading' | 'live' | 'error' | 'offline'
  const [balanceError, setBalanceError] = useState(null);
  const balanceFailCountRef = React.useRef(0);
  // 'stop' = don't retry (e.g. bad creds); 'transient' = retry with backoff
  const balanceStopPollingRef = React.useRef(false);

  const fetchLiveBalance = useCallback(async () => {
    const now = Date.now();
    if (_balanceUnauthorized) return; // hard stop after bad creds
    if (_balanceFetching) return; // module-level guard: survives remounts
    if (now - _balanceLastFetch < 30_000) return; // debounce: max 1 call per 30s
    _balanceFetching = true;
    _balanceLastFetch = now;
    setBalanceStatus(s => s === 'live' ? 'live' : 'loading');
    try {
      const res = await authFetch('/user/balance');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.balance) {
        setBalance(prev => ({
          ...prev,
          total: Number(data.balance.total ?? prev.total),
          available: Number(data.balance.available ?? prev.available),
          currency: data.balance.currency || prev.currency || 'USD',
          live: data.live ?? false,
        }));
        setBalanceStatus('live');
        setBalanceError(null);
        balanceFailCountRef.current = 0;
        balanceStopPollingRef.current = false;
      } else {
        const code = data?.code || 'UNKNOWN';
        setBalanceError(data?.error || 'Unable to fetch balance');
        if (code === 'NO_CREDENTIALS') {
          setBalanceStatus('idle');
          balanceStopPollingRef.current = true; // no point polling
        } else if (code === 'COINBASE_UNAUTHORIZED' || code === 'COINBASE_CLIENT_ERROR' || code === 'DECRYPT_FAILED' || code === 'INCOMPLETE_CREDENTIALS' || code === 'CDP_KEY_UNSUPPORTED' || code === 'CDP_KEY_PARSE_FAILED') {
          setBalanceStatus('unauthorized');
          balanceStopPollingRef.current = true; // bad creds won't fix with retries
          _balanceUnauthorized = true; // module-level hard stop
        } else {
          setBalanceStatus('error');
          balanceFailCountRef.current += 1;
        }
      }
    } catch {
      setBalanceStatus('offline');
      setBalanceError('Network error — check connection');
      balanceFailCountRef.current += 1;
    } finally {
      _balanceFetching = false;
    }
  }, []);

  const loadData = useCallback(async (resetBalanceDebounce = false) => {
    if (resetBalanceDebounce) _balanceLastFetch = 0;
    setLoadingData(true);
    try {
      const [statusRes, tradesRes] = await Promise.allSettled([
        authFetch('/bot/status'),
        authFetch('/oracle-trader-pro/trades'),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value?.ok) {
        const s = await statusRes.value.json().catch(() => ({}));
        setBotActive(Boolean(s.isActive));
      }
      if (tradesRes.status === 'fulfilled' && tradesRes.value?.ok) {
        const data = await tradesRes.value.json().catch(() => []);
        setTrades(Array.isArray(data) ? data.slice(0, 10) : []);
      }

      // Fetch live balance from Coinbase
      // Stagger balance fetch 500ms after status/trades to avoid burst on mount
      await new Promise(r => setTimeout(r, 500));
      await fetchLiveBalance();
    } finally {
      setLoadingData(false);
    }
  }, [fetchLiveBalance]);

  useEffect(() => { loadData(true); }, [loadData]);

  // Auto-refresh live balance with exponential backoff on failures
  useEffect(() => {
    const BASE_INTERVAL = 60_000;
    const MAX_INTERVAL = 300_000; // 5 min cap
    let timer;

    function schedule() {
      const fails = balanceFailCountRef.current;
      // Stop polling on bad creds or after 5 consecutive transient failures
      if (balanceStopPollingRef.current || fails >= 5) {
        if (fails >= 5) setBalanceStatus('offline');
        return;
      }
      const delay = fails === 0 ? BASE_INTERVAL : Math.min(BASE_INTERVAL * Math.pow(2, fails), MAX_INTERVAL);
      timer = setTimeout(async () => {
        await fetchLiveBalance();
        schedule();
      }, delay);
    }

    schedule();
    return () => clearTimeout(timer);
  }, [fetchLiveBalance]);

  const toggleBot = useCallback(async () => {
    const next = !botActive;
    const userId = pb.authStore.record?.id;
    setToggling(true);
    setStatusError(null);

    // eslint-disable-next-line no-console
    console.log('[bot/toggleBot] Button clicked — target status:', next ? 'ACTIVE' : 'INACTIVE');
    // eslint-disable-next-line no-console
    console.log('[bot/toggleBot] User authenticated:', userId);

    try {
      // eslint-disable-next-line no-console
      console.log('[bot/toggleBot] Sending POST /api/bot/status …');
      let res = await authFetch('/bot/status', {
        method: 'POST',
        body: JSON.stringify({ status: next ? 'ACTIVE' : 'INACTIVE', isActive: next }),
      });
      // eslint-disable-next-line no-console
      console.log('[bot/toggleBot] Response received — HTTP', res.status);

      // Fallback to legacy start/stop endpoints if /bot/status is unavailable.
      if (res.status === 404 || res.status === 405) {
        // eslint-disable-next-line no-console
        console.log('[bot/toggleBot] Falling back to legacy endpoint');
        res = await authFetch(next ? '/bot/start' : '/bot/stop', {
          method: 'POST',
          body: JSON.stringify({}),
        });
        // eslint-disable-next-line no-console
        console.log('[bot/toggleBot] Legacy fallback response — HTTP', res.status);
      }

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // eslint-disable-next-line no-console
        console.log('[bot/toggleBot] Success:', data);
        setBotActive(next);
        const msg = next ? 'Robo a demaré — LIVE TRADE AKTIF! 🟢' : 'Robo a sispann.';
        toast.success(msg);
        // eslint-disable-next-line no-console
        console.log('[bot/toggleBot] Redirecting to /dashboard in 1s …');
        setTimeout(() => {
          if (navigate) navigate('/dashboard', { replace: true });
        }, 1000);
        return;
      }

      const body = await res.json().catch(() => ({}));
      // eslint-disable-next-line no-console
      console.error('[bot/toggleBot] Failed — HTTP', res.status, body);

      let msg;
      if (res.status === 400) msg = body.error || 'Kle API yo pa konfigire kòrèkteman. Mete yo nan Settings.';
      else if (res.status === 401) msg = body.error || 'Sesyon ekspire — konekte ankò.';
      else if (res.status === 422) msg = body.error || 'Koneksyon Coinbase echwe — verifye kle API yo.';
      else msg = body.error || `Echèk chanjman estati robo a (${res.status})`;

      setStatusError(msg);
      toast.error(msg);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[bot/toggleBot] Network error:', err?.message);
      // eslint-disable-next-line no-console
      console.error('[bot/toggleBot] Stack:', err?.stack);
      setStatusError('Koneksyon echwe — sèvè a pa reponn. Eseye ankò.');
      toast.error('Koneksyon echwe — eseye ankò');
    } finally {
      setToggling(false);
    }
  }, [botActive, navigate]);

  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0);
  const wins = trades.filter(t => Number(t.pnl ?? 0) > 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Connection Status Bar */}
      <div className="glass-card p-4 sm:p-5 border-l-4 border-emerald-500/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${botActive ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
              {botActive && <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />}
            </div>
            <div>
              <p className="text-sm font-bold">
                {botActive ? 'LIVE TRADE AKTIF' : 'ROBO SISPANN'}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="text-cyan font-mono-metrics">{credentials.exchange || 'Exchange'}</span>
                {' · '}
                <span className="font-mono-metrics">{credentials.apiKeyPreview || '••••••'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-cyan/10 text-cyan border-cyan/30">
              <Wifi className="w-3 h-3" /> {credentials.exchange || 'Coinbase'} KONEKTE
            </span>
            {/* Bot status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              botActive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                : 'bg-muted text-muted-foreground border-border'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${botActive ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
              ROBO {botActive ? 'AKTIF 🟢' : 'INAKTIF'}
            </span>
          </div>
        </div>

        {statusError && (
          <div className="mt-4 p-3 rounded-lg border border-rose/40 bg-rose/10 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-rose flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {statusError}
            </p>
            <Button size="sm" variant="outline" disabled={toggling} onClick={toggleBot}
              className="min-h-[36px] border-rose/50 text-rose hover:bg-rose/20">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Eseye Ankò
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Button onClick={toggleBot} disabled={toggling}
            className={`min-h-[44px] px-5 font-bold text-sm ${
              botActive
                ? 'bg-rose/20 border border-rose/60 text-rose hover:bg-rose/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            style={!botActive ? { boxShadow: '0 0 16px hsl(151 100% 45% / 0.4)' } : {}}>
            {toggling
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ap chanje...</>
              : botActive
                ? <><Square className="w-4 h-4 mr-2" />SISPANN ROBO</>
                : <><Play className="w-4 h-4 mr-2" />DEMARÉ ROBO</>}
          </Button>

          <Button variant="outline" onClick={() => setShowEditForm(v => !v)}
            className="min-h-[44px] px-4 text-sm border-border hover:border-cyan/60">
            <Edit3 className="w-4 h-4 mr-2 text-cyan" />
            MODIFYE KLE
          </Button>

          <Button variant="ghost" onClick={loadData} className="min-h-[44px] px-4 text-muted-foreground">
            <RefreshCw className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline text-xs">Rafraîchi</span>
          </Button>
        </div>

        {showEditForm && (
          <div className="mt-5 pt-5 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-amber" />
              Antre nouvèl kle pou ranplase vye yo.
            </p>
            <ApiConfigSection
              isAdmin={isAdmin}
              onSaved={() => { setShowEditForm(false); _balanceUnauthorized = false; _balanceLastFetch = 0; onEditKeys(); }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      {loadingData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 h-24 animate-pulse bg-muted/30 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={DollarSign}
            label={balanceStatus === 'live' ? `Balans Total (Live ${balance.currency || 'USD'})` : 'Balans Total'}
            value={`$${Number(balance.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            sub={
              balanceStatus === 'live' ? '🟢 Live · Rafraîchi chak 60s' :
              balanceStatus === 'loading' ? '⏳ Chajman balans...' :
              balanceStatus === 'unauthorized' ? '🔑 Kle API invalide — Klike pou Korije' :
              balanceStatus === 'error' ? `⚠️ ${balanceError || 'Erè Coinbase'} · Klike pou Eseye` :
              balanceStatus === 'offline' ? '🔴 Offline · Klike pou Eseye' :
              undefined
            }
            color="text-cyan"
            glow="glow-cyan"
            onSubClick={
              balanceStatus === 'unauthorized' ? () => setShowEditForm(true) :
              (balanceStatus === 'offline' || balanceStatus === 'error') ? () => { balanceFailCountRef.current = 0; balanceStopPollingRef.current = false; _balanceLastFetch = 0; fetchLiveBalance(); } : undefined
            }
          />
          <StatCard
            icon={Activity}
            label="Disponib"
            value={`$${Number(balance.available).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <StatCard
            icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
            label="P&L Total"
            value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
            color={totalPnl >= 0 ? 'text-emerald' : 'text-rose'}
            glow={totalPnl >= 0 ? 'glow-green' : 'glow-red'}
          />
          <StatCard icon={BarChart2} label="Win Rate" value={`${winRate}%`}
            sub={`${trades.length} komès`}
            color={winRate >= 50 ? 'text-emerald' : 'text-amber'} />
        </div>
      )}

      {/* Risk Settings */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-amber" /> Paramèt Risk — {credentials.exchange || 'Exchange'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Max Risk / Komès', value: `${credentials.maxRiskPercent ?? 2}%` },
            { label: 'Stop-Loss', value: `${credentials.stopLossPercent ?? 2}%` },
            { label: 'Take-Profit', value: `${credentials.takeProfitPercent ?? 5}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/30 rounded-lg p-3 border border-border/40">
              <p className="text-muted-foreground mb-1">{label}</p>
              <p className="font-bold font-mono-metrics text-base text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trade History */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan" /> Istwa Komès Robo a
          </h3>
          <span className="text-xs text-muted-foreground">{trades.length} dènye komès</span>
        </div>

        {trades.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Pa gen komès ankò — demaré robo a pou kòmanse.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">Aktif</th>
                  <th className="text-left py-2 pr-3 font-medium">Tip</th>
                  <th className="text-right py-2 pr-3 font-medium">Montan</th>
                  <th className="text-right py-2 pr-3 font-medium">Pri Antre</th>
                  <th className="text-right py-2 pr-3 font-medium hidden sm:table-cell">Pri Soti</th>
                  <th className="text-right py-2 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const pnl = Number(t.pnl ?? 0);
                  const side = (t.type || t.side || '').toUpperCase();
                  const isBuy = side.includes('BUY') || side === 'BUY';
                  return (
                    <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 pr-3 font-medium font-mono-metrics text-cyan">{t.asset || t.symbol || '—'}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isBuy ? 'bg-emerald/15 text-emerald' : 'bg-rose/15 text-rose'}`}>
                          {side || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono-metrics">{Number(t.amount ?? t.quantity ?? 0).toFixed(4)}</td>
                      <td className="py-2.5 pr-3 text-right font-mono-metrics">${Number(t.entryPrice ?? t.price ?? 0).toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-right font-mono-metrics hidden sm:table-cell">
                        {t.exitPrice ? `$${Number(t.exitPrice).toLocaleString()}` : '—'}
                      </td>
                      <td className={`py-2.5 text-right font-mono-metrics font-semibold ${pnl >= 0 ? 'text-emerald' : 'text-rose'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QuantMaster AI panel placeholder */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber" /> QuantMaster AI — Analiz Mache
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Signal Aktyèl', value: 'WATCH', color: 'text-amber' },
            { label: 'Konfyans', value: '72%', color: 'text-cyan' },
            { label: 'Rekòmandasyon', value: botActive ? 'BOT AKTIF' : 'DEMARÉ BOT', color: botActive ? 'text-emerald' : 'text-muted-foreground' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted/30 rounded-lg p-3 border border-border/40">
              <p className="text-muted-foreground mb-1">{label}</p>
              <p className={`font-bold font-mono-metrics text-sm ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Sistèm AI a ap surveye BTC-USD sou 3 timeframe (15m, 4H, 1D). 
          Estrateji EMA/RSI aktif — signal antre ap tann konfirmasyon volim.
        </p>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function OracleTraderProDashboard() {
  const navigate = useNavigate();
  const { markCredentialsSaved } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState(null); // null=loading, false=no keys, object=connected
  const user = pb.authStore.record;
  const isAdmin = user?.email && ADMIN_EMAILS.includes(String(user.email).toLowerCase());

  const checkCredentials = useCallback(async () => {
    if (!pb.authStore.isValid) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await authFetch('/oracle-trader-pro/credentials');
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.connected) {
          setCredentials(data);
          markCredentialsSaved();
        } else {
          // Also check PocketBase user record directly (fallback)
          const u = pb.authStore.record;
          if (u?.apiKey) {
            setCredentials({ connected: true, apiKeyPreview: maskKey(u.apiKey), exchange: u.platform || 'Coinbase', maxRiskPercent: u.maxRisk || 2, stopLossPercent: u.stopLoss || 2, takeProfitPercent: u.takeProfit || 5 });
            markCredentialsSaved();
          } else {
            setCredentials(false);
          }
        }
      } else {
        const u = pb.authStore.record;
        if (u?.apiKey) {
          setCredentials({ connected: true, apiKeyPreview: maskKey(u.apiKey), exchange: u.platform || 'Coinbase', maxRiskPercent: u.maxRisk || 2, stopLossPercent: u.stopLoss || 2, takeProfitPercent: u.takeProfit || 5 });
          markCredentialsSaved();
        } else {
          setCredentials(false);
        }
      }
    } catch {
      const u = pb.authStore.record;
      if (u?.apiKey) {
        setCredentials({ connected: true, apiKeyPreview: maskKey(u.apiKey), exchange: u.platform || 'Coinbase', maxRiskPercent: u.maxRisk || 2, stopLossPercent: u.stopLoss || 2, takeProfitPercent: u.takeProfit || 5 });
        markCredentialsSaved();
      } else {
        setCredentials(false);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, markCredentialsSaved]);

  useEffect(() => { checkCredentials(); }, [checkCredentials]);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Helmet>
        <title>Dashboard — Oracle Trader Pro</title>
        <meta name="description" content="Kontwole Robo Trading ORACLE-TRADER-PRO ou — balans, komès, ak konfigirasyon." />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight">ORACLE-TRADER-PRO</span>
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber/15 text-amber border border-amber/40">
                <Zap className="w-3 h-3" /> ADMIN
              </span>
            )}
            {credentials && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald/10 text-emerald border border-emerald/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                ROBO KONEKTE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[160px]">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => window.scrollTo(0,0)}
              title="API Configuration"
              className="text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}
              className="text-muted-foreground hover:text-rose">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Ap verifye konfigirasyon ou...</p>
          </div>
        ) : credentials ? (
          <BotControlPanel
            credentials={credentials}
            isAdmin={isAdmin}
            onEditKeys={checkCredentials}
            navigate={navigate}
          />
        ) : (
          /* No credentials — show inline config form */
          <ApiConfigSection
            isAdmin={isAdmin}
            onSaved={() => { _balanceUnauthorized = false; _balanceLastFetch = 0; checkCredentials(); }}
          />
        )}
      </main>
    </div>
  );
}
