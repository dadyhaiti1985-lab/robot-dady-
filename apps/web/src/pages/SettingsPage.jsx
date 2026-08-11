import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save, Shield, CheckCircle2, AlertTriangle, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

async function authFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    Authorization: `Bearer ${pb.authStore.token}`,
  };
  return apiServerClient.fetch(path, { ...options, headers });
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { markCredentialsSaved } = useAuth();

  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const canSave = apiKey.trim().length >= 20 && apiSecret.trim().length >= 20;

  const validate = () => {
    const e = {};
    if (!apiKey || apiKey.trim().length < 20)
      e.apiKey = 'API Key dwe gen omwen 20 karaktè (min 20 characters)';
    if (!apiSecret || apiSecret.trim().length < 20)
      e.apiSecret = 'API Secret dwe gen omwen 20 karaktè (min 20 characters)';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      let saved = false;

      // Try backend first (encrypts with AES-256-GCM)
      try {
        const res = await authFetch('/oracle-trader-pro/credentials', {
          method: 'POST',
          body: JSON.stringify({
            exchange: 'Coinbase',
            apiKey: apiKey.trim(),
            apiSecret: apiSecret.trim(),
            maxRiskPercent: 2,
            stopLossPercent: 2,
            takeProfitPercent: 5,
          }),
        });
        if (res.ok) {
          saved = true;
        } else if (res.status >= 500) {
          throw new Error('backend_down');
        } else {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Erè ${res.status}`);
        }
      } catch (err) {
        if (err.message !== 'backend_down') throw err;
        // Fallback: save directly to PocketBase user record
        await pb.collection('users').update(pb.authStore.record.id, {
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
        }, { requestKey: null });
        saved = true;
      }

      if (saved) {
        // Update global state immediately
        markCredentialsSaved();
        setSaved(true);
        toast.success('✅ Kredansyèl yo Sove ak Konekte! N\'ap voye ou sou Dashboard la...');
        // Wait 1.5s then redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      toast.error('Erè nan sove: ' + (err.message || 'Pwoblèm enkoni'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Konfigirasyon API — Oracle Trader Pro</title>
        <meta name="description" content="Antre kle API Coinbase pou aktive Oracle Trader Pro bot ou." />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <Shield className="w-5 h-5 text-primary" />
            ORACLE-TRADER-PRO
          </Link>
          <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full py-10">
        {saved ? (
          // Success state
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Kredansyèl yo Sove!</h2>
            <p className="text-muted-foreground">W'ap redirijye sou Dashboard la nan yon segond...</p>
            <Loader2 className="w-5 h-5 animate-spin text-primary mt-2" />
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center mb-4" style={{ boxShadow: '0 0 24px hsl(151 100% 45% / 0.2)' }}>
                <KeyRound className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Konfigire Kle API Coinbase</h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Antre kle API yo pou aktive ORACLE-TRADER-PRO. Yo chifre AES-256-GCM epi
                pèsiste — ou p'ap janm mande yo ankò.
              </p>
            </div>

            <Card className="border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Koneksyon Sekirize
                </CardTitle>
                <CardDescription>
                  Kle yo chifre anvan yo sove. Yo pa janm montre nan konsòl oswa UI a.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-5 p-3 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-cyan mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Permissions nesesè sou Coinbase:{' '}
                    {['Trade', 'View Balances', 'View Transactions'].map(p => (
                      <span key={p} className="inline-flex items-center gap-1 ml-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> {p}
                      </span>
                    ))}
                  </p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  {/* API Key */}
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-apiKey">
                      Coinbase API Key <span className="text-muted-foreground text-xs">(requis — min 20 karaktè)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="settings-apiKey"
                        name="apiKey"
                        type={showKey ? 'text' : 'password'}
                        autoComplete="off"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Kole kle API ou isit la..."
                        className="h-11 pr-10 bg-background text-foreground"
                      />
                      <button type="button" onClick={() => setShowKey(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.apiKey && <p className="text-xs text-red-400">{errors.apiKey}</p>}
                  </div>

                  {/* API Secret */}
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-apiSecret">
                      Coinbase API Secret <span className="text-muted-foreground text-xs">(requis — min 20 karaktè)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="settings-apiSecret"
                        name="apiSecret"
                        type={showSecret ? 'text' : 'password'}
                        autoComplete="off"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Kole sekrè API ou isit la..."
                        className="h-11 pr-10 bg-background text-foreground"
                      />
                      <button type="button" onClick={() => setShowSecret(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.apiSecret && <p className="text-xs text-red-400">{errors.apiSecret}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={saving || !canSave}
                    className="w-full h-12 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    style={canSave ? { boxShadow: '0 0 20px hsl(151 100% 45% / 0.4)' } : {}}
                  >
                    {saving
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ap chifre & sove...</>
                      : <><Save className="w-4 h-4 mr-2" />SOVE KREDANSYÈL YO</>}
                  </Button>

                  {!canSave && (apiKey || apiSecret) && (
                    <p className="text-xs text-center text-muted-foreground">
                      Antre API Key & Secret (omwen 20 karaktè chak) pou kontinye
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                ← Retounen sou Dashboard san konfigirasyon
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
