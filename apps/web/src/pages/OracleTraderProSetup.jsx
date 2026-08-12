import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Bot, KeyRound, Lock, AlertTriangle, Loader2, CheckCircle2, ShieldCheck,
  Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient, { isApiOfflineError } from '@/lib/apiServerClient';

const EXCHANGES = ['Coinbase', 'Binance', 'Bybit', 'KuCoin'];
const ADMIN_EMAILS = ['meahunlimitedgroupe@gmail.com', 'dadyhaiti1985@gmail.com'];

async function authFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    Authorization: `Bearer ${pb.authStore.token}`,
  };
  let res = await apiServerClient.fetch(path, { ...options, headers });
  if (res.status === 401 && pb.authStore.isValid) {
    try { await pb.collection('users').authRefresh(); } catch (_) { return res; }
    res = await apiServerClient.fetch(path, { ...options, headers: { ...headers, Authorization: `Bearer ${pb.authStore.token}` } });
  }
  return res;
}

export default function OracleTraderProSetup() {
  const navigate = useNavigate();
  const user = pb.authStore.record;
  const isAdmin = user?.email && ADMIN_EMAILS.includes(String(user.email).toLowerCase());

  const [exchange, setExchange] = useState('Coinbase');
  const [maxRisk, setMaxRisk] = useState('2');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [stopLoss, setStopLoss] = useState('2');
  const [takeProfit, setTakeProfit] = useState('5');
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingCreds, setCheckingCreds] = useState(true);
  const [apiStatusMessage, setApiStatusMessage] = useState('');

  // If user already has credentials, redirect straight to terminal
  useEffect(() => {
    if (!pb.authStore.isValid) { navigate('/login'); return; }
    authFetch('/oracle-trader-pro/credentials')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.connected) navigate('/dashboard', { replace: true });
        }
      })
      .catch((err) => {
        if (isApiOfflineError(err)) {
          setApiStatusMessage('Seve API la pa aktive sou port 3001. Tanpri relanse backend la epi rekomanse.');
        }
      })
      .finally(() => setCheckingCreds(false));
  }, [navigate]);

  const validate = () => {
    const e = {};
    const trimmedKey = apiKey.trim();
    const trimmedSecret = apiSecret.trim();
    if (!trimmedKey) e.apiKey = 'API Key obligatwa';
    if (!trimmedSecret) e.apiSecret = 'API Secret obligatwa';
    const risk = Number(maxRisk);
    if (isNaN(risk) || risk < 1 || risk > 5) e.maxRisk = 'Max Risk dwe ant 1% ak 5%';
    const sl = Number(stopLoss);
    if (isNaN(sl) || sl < 1 || sl > 3) e.stopLoss = 'Stop-Loss dwe ant 1% ak 3%';
    const tp = Number(takeProfit);
    if (isNaN(tp) || tp < 3 || tp > 10) e.takeProfit = 'Take-Profit dwe ant 3% ak 10%';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Trim whitespace before sending
    const trimmedApiKey = apiKey.trim();
    const trimmedApiSecret = apiSecret.trim();

    setSaving(true);
    setApiStatusMessage('');
    try {
      let res;
      try {
        res = await authFetch('/oracle-trader-pro/credentials', {
          method: 'POST',
          body: JSON.stringify({
            exchange,
            apiKey: trimmedApiKey,
            apiSecret: trimmedApiSecret,
            maxRiskPercent: Number(maxRisk),
            stopLossPercent: Number(stopLoss),
            takeProfitPercent: Number(takeProfit),
          }),
        });
      } catch (requestError) {
        if (isApiOfflineError(requestError)) {
          const message = 'Seve API la pa aktive sou port 3001. Tanpri demare backend la epi re-eseye.';
          setApiStatusMessage(message);
          toast.error('API offline', { description: message });
          return;
        }

        // Fallback direct PocketBase save
        await pb.collection('users').update(user.id, {
          apiKey: trimmedApiKey, apiSecret: trimmedApiSecret, platform: exchange,
          maxRisk: Number(maxRisk), stopLoss: Number(stopLoss), takeProfit: Number(takeProfit),
        }, { requestKey: null });
        toast.success('Kle API yo sove avèk siksè!');
        navigate('/dashboard');
        return;
      }

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        // On subscription error (403), fall back to PocketBase direct save so credentials are never lost
        if (res.status === 403 || res.status >= 500) {
          await pb.collection('users').update(user.id, {
            apiKey: trimmedApiKey, apiSecret: trimmedApiSecret, platform: exchange,
            maxRisk: Number(maxRisk), stopLoss: Number(stopLoss), takeProfit: Number(takeProfit),
          }, { requestKey: null });
          toast.success('Kle API yo sove avèk siksè!');
          setTimeout(() => navigate('/dashboard'), 800);
          return;
        }
        throw new Error(body.error || body.message || `Erè ${res.status}`);
      }

      toast.success('Kle API yo chifre epi sove!', { description: 'Ap transfere ou sou tablo trading ou...' });
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const isOffline = isApiOfflineError(err) || err?.code === 'API_OFFLINE';
      const message = isOffline
        ? 'Seve API la pa aktive sou port 3001. Tanpri demare backend la epi re-eseye.'
        : (err.message || 'Something went wrong while processing your request');
      if (isOffline) {
        setApiStatusMessage(message);
      }
      toast.error('Erè', { description: message });
    } finally {
      setSaving(false);
    }
  };

  if (checkingCreds) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <Helmet>
        <title>Konfigirasyon API Keys — Oracle Trader Pro</title>
        <meta name="description" content="Antre kle API exchange ou pou aktive Oracle Trader Pro." />
      </Helmet>

      <div className="w-full max-w-lg">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center glow-green">
            <Bot className="w-7 h-7 text-emerald" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ORACLE-TRADER-PRO</h1>
            <p className="text-xs text-muted-foreground font-mono-metrics">Etap 1 / 2 — Konfigirasyon API</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">1</div>
            <span className="text-xs font-semibold text-primary">Konfigirasyon API</span>
          </div>
          <div className="flex-1 h-px bg-border/60" />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-xs text-muted-foreground">Terminal Trading</span>
            <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">2</div>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-4 h-4 text-cyan shrink-0" />
            <h2 className="text-base font-semibold">Konekte Kont Exchange Ou An</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-6 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber" />
            Kle ou yo chifre ak AES-256-GCM anvan yo sove — yo pa janm ekspoze nan konsòl oswa UI a.
          </p>

          {!isAdmin && (
            <div className="mb-5 p-3 rounded-lg border border-amber/40 bg-amber/10 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber mt-0.5 shrink-0" />
              <p className="text-xs text-amber">
                Abònman ORACLE-TRADER-PRO ($35/mwa) nesesè pou aktive bot trading la.{' '}
                <Link to="/plans" className="underline hover:no-underline">Achte abònman</Link>
              </p>
            </div>
          )}

          {apiStatusMessage ? (
            <div className="mb-5 p-3 rounded-lg border border-rose/40 bg-rose/10 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose mt-0.5 shrink-0" />
              <p className="text-xs text-rose">{apiStatusMessage}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="setup-exchange">Platfòm Trading</Label>
                <Select value={exchange} onValueChange={setExchange} name="exchange">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXCHANGES.map((ex) => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setup-max-risk">Max Risk (%)</Label>
                <Input id="setup-max-risk" name="maxRisk" type="number" step="0.1" min="1" max="5" value={maxRisk}
                  onChange={(e) => setMaxRisk(e.target.value)} className="h-11 text-base" />
                {errors.maxRisk && <p className="text-xs text-rose">{errors.maxRisk}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="setup-api-key">API Key Kliyan An</Label>
              <div className="relative">
                <Input id="setup-api-key" name="apiKey" type={showKey ? 'text' : 'password'} autoComplete="off"
                  value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Minimum 20 karaktè" className="h-11 text-base pr-10" />
                <button type="button" onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.apiKey && <p className="text-xs text-rose">{errors.apiKey}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="setup-api-secret">API Secret Kliyan An</Label>
              <div className="relative">
                <Input id="setup-api-secret" name="apiSecret" type={showSecret ? 'text' : 'password'} autoComplete="off"
                  value={apiSecret} onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="Minimum 20 karaktè" className="h-11 text-base pr-10" />
                <button type="button" onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.apiSecret && <p className="text-xs text-rose">{errors.apiSecret}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="setup-stop-loss">Stop-Loss (%)</Label>
                <Input id="setup-stop-loss" name="stopLoss" type="number" step="0.1" min="1" max="3" value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)} className="h-11 text-base" />
                {errors.stopLoss && <p className="text-xs text-rose">{errors.stopLoss}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setup-take-profit">Take-Profit (%)</Label>
                <Input id="setup-take-profit" name="takeProfit" type="number" step="0.1" min="3" max="10" value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)} className="h-11 text-base" />
                {errors.takeProfit && <p className="text-xs text-rose">{errors.takeProfit}</p>}
              </div>
            </div>

            <Button type="submit" disabled={saving}
              className="w-full min-h-[52px] text-sm font-bold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg mt-2"
              style={{ boxShadow: '0 0 20px hsl(151 100% 45% / 0.4)' }}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ap chifre & sove...</>
                : <><ShieldCheck className="w-4 h-4 mr-2" /> SOVE & ANREJISTRE API KEYS</>}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>Ou gen yon kont?</span>
            <Link to="/login" className="text-primary hover:underline">Konekte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
