import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import AISignalsView from '@/views/AISignalsView.jsx';
import MarketsView from '@/views/MarketsView.jsx';
import AIAnalysisView from '@/views/AIAnalysisView.jsx';
import TradingView from '@/views/TradingView.jsx';
import PortfolioView from '@/views/PortfolioView.jsx';
import OrdersView from '@/views/OrdersView.jsx';
import WatchlistView from '@/views/WatchlistView.jsx';
import NewsIntelligenceView from '@/views/NewsIntelligenceView.jsx';
import SmartMoneyView from '@/views/SmartMoneyView.jsx';
import EconomicCalendarView from '@/views/EconomicCalendarView.jsx';
import AnalyticsView from '@/views/AnalyticsView.jsx';
import TradeHistoryView from '@/views/TradeHistoryView.jsx';
import SettingsView from '@/views/SettingsView.jsx';
import SupportView from '@/views/SupportView.jsx';
import '@/views/ViewStyles.css';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

import PremiumSidebar from '@/components/dashboard/PremiumSidebar.jsx';
import PremiumHeader from '@/components/dashboard/PremiumHeader.jsx';
import HeroSection from '@/components/dashboard/HeroSection.jsx';
import MarketOverview from '@/components/dashboard/MarketOverview.jsx';
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel.jsx';
import TradeExecutionPanel from '@/components/dashboard/TradeExecutionPanel.jsx';
import AISignalsTable from '@/components/dashboard/AISignalsTable.jsx';
import PortfolioStats from '@/components/dashboard/PortfolioStats.jsx';
import MarketHeatmap from '@/components/dashboard/MarketHeatmap.jsx';
import NewsIntelligence from '@/components/dashboard/NewsIntelligence.jsx';
import SmartMoneyPanel from '@/components/dashboard/SmartMoneyPanel.jsx';
import PerformanceAnalytics from '@/components/dashboard/PerformanceAnalytics.jsx';
import Watchlist from '@/components/dashboard/Watchlist.jsx';
import FooterStatusBar from '@/components/dashboard/FooterStatusBar.jsx';
import AIAssistantButton from '@/components/AIAssistantButton.jsx';
import AIChatWindow from '@/components/AIChatWindow.jsx';
import TradeDecisionPanel from '@/components/TradeDecisionPanel.jsx';
import TradeSetupForm from '@/components/TradeSetupForm.jsx';
import NewsBuffer from '@/components/NewsBuffer.jsx';
import DailyPnLTracker from '@/components/DailyPnLTracker.jsx';
import { useTradeDecision } from '@/hooks/useTradeDecision.js';
import StrategyAnalysisPanel from '@/components/StrategyAnalysisPanel.jsx';
import OracleStrategyPanel from '@/components/OracleStrategyPanel.jsx';
import { throttleMouseMove, throttleResize } from '@/utils/rafThrottle';
import { useBotToggle } from '@/hooks/useBotToggle.js';
import { useAIConnection } from '@/hooks/useAIConnection.js';
import { createBatcher } from '@/utils/messageBatcher';

const ADMIN_EMAILS = ['meahunlimitedgroupe@gmail.com', 'dadyhaiti1985@gmail.com'];

let _balanceFetching = false;
let _balanceLastFetch = 0;
let _balanceUnauthorized = false;

// Module-level batcher for balance updates — applies last update per frame
let _balanceBatcherRef = null;
function getBalanceBatcher(applyFn) {
  if (!_balanceBatcherRef) {
    _balanceBatcherRef = createBatcher((updates) => {
      // Apply only the most recent update
      if (updates.length > 0) applyFn(updates[updates.length - 1]);
    }, 10, 16);
  }
  return _balanceBatcherRef;
}

async function authFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    Authorization: `Bearer ${pb.authStore.token}`,
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  let res;
  try {
    res = await apiServerClient.fetch(path, { ...options, headers, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (res.status === 401 && pb.authStore.isValid) {
    try { await pb.collection('users').authRefresh(); } catch (_) { return res; }
    res = await apiServerClient.fetch(path, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${pb.authStore.token}` },
    });
  }
  return res;
}

function renderHashView(hash) {
  switch (hash) {
    case 'signals': return <AISignalsView />;
    case 'markets': return <MarketsView />;
    case 'analysis': return <AIAnalysisView />;
    case 'trading': return <TradingView />;
    case 'portfolio': return <PortfolioView />;
    case 'orders': return <OrdersView />;
    case 'watchlist': return <WatchlistView />;
    case 'news': return <NewsIntelligenceView />;
    case 'smartmoney': return <SmartMoneyView />;
    case 'calendar': return <EconomicCalendarView />;
    case 'analytics': return <AnalyticsView />;
    case 'trade-history': return <TradeHistoryView />;
    case 'settings': return <SettingsView />;
    case 'support': return <SupportView />;
    case 'deposits':
    case 'withdrawals':
    case 'referral':
      return (
        <div className="view-container">
          <div className="view-header">
            <h1 style={{ textTransform: 'capitalize' }}>{hash}</h1>
            <p>Manage your {hash} from this panel</p>
          </div>
          <div className="placeholder-content">
            <p>{hash.charAt(0).toUpperCase() + hash.slice(1)} coming soon</p>
          </div>
        </div>
      );
    default: return null;
  }
}

export default function PremiumDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeHash = location.hash.replace('#', '');
  const { user } = useAuth();
  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  const [credModalOpen, setCredModalOpen] = useState(false);
  const [credModalMsg, setCredModalMsg] = useState('');
  const [credApiKey, setCredApiKey] = useState('');
  const [credApiSecret, setCredApiSecret] = useState('');
  const [credSaving, setCredSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const [newsEvents, setNewsEvents] = useState([]);
  const { botActive, setBotActive, isLoading: toggling, toggleBot: toggleBotHook } = useBotToggle(false);
  const { isConnected: aiConnected } = useAIConnection();
  const [trades, setTrades] = useState([]);
  const [balance, setBalance] = useState({ total: 0, available: 0 });
  const { evaluateSetup, updateDailyPnL, decision, riskStatus } = useTradeDecision(balance.total || 1000);
  const balanceFailCountRef = React.useRef(0);
  const balanceStopPollingRef = React.useRef(false);

  const fetchLiveBalance = useCallback(async () => {
    const now = Date.now();
    if (_balanceUnauthorized) return;
    if (_balanceFetching) return;
    if (now - _balanceLastFetch < 30_000) return;
    _balanceFetching = true;
    _balanceLastFetch = now;
    try {
      const res = await authFetch('/user/balance');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.balance) {
        const batcher = getBalanceBatcher(setBalance);
        batcher.addMessage({
          total: Number(data.balance.total ?? 0),
          available: Number(data.balance.available ?? 0),
          currency: data.balance.currency || 'USD',
        });
        balanceFailCountRef.current = 0;
        balanceStopPollingRef.current = false;
      } else {
        const code = data?.code || 'UNKNOWN';
        if (['COINBASE_UNAUTHORIZED', 'COINBASE_CLIENT_ERROR', 'DECRYPT_FAILED', 'INCOMPLETE_CREDENTIALS', 'CDP_KEY_PARSE_FAILED', 'INVALID_CREDENTIALS'].includes(code)) {
          balanceStopPollingRef.current = true;
          _balanceUnauthorized = true;
          if (['CDP_KEY_PARSE_FAILED', 'INVALID_CREDENTIALS', 'DECRYPT_FAILED'].includes(code)) {
            setCredModalMsg(data?.error || 'Your stored API credentials appear corrupted. Please re-enter them.');
            setCredModalOpen(true);
          }
        } else {
          balanceFailCountRef.current += 1;
        }
      }
    } catch {
      balanceFailCountRef.current += 1;
    } finally {
      _balanceFetching = false;
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, tradesRes] = await Promise.allSettled([
        authFetch('/bot/status'),
        authFetch('/oracle-trader-pro/trades'),
      ]);
      if (statusRes.status === 'fulfilled' && statusRes.value?.ok) {
        const s = await statusRes.value.json();
        setBotActive(Boolean(s.isActive ?? s.botActive));
      }
      if (tradesRes.status === 'fulfilled' && tradesRes.value?.ok) {
        const data = await tradesRes.value.json();
        setTrades(Array.isArray(data) ? data.slice(0, 20) : []);
      }
      await new Promise(r => setTimeout(r, 500));
      await fetchLiveBalance();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[PremiumDashboard] loadData error:', err);
    }
  }, [fetchLiveBalance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // RAF-throttled window resize handler
  useEffect(() => {
    const handler = throttleResize(() => {
      // Trigger layout recalculation — components self-size via CSS
    });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const BASE = 60_000;
    let timer;
    function schedule() {
      if (balanceStopPollingRef.current || balanceFailCountRef.current >= 5) return;
      const delay = balanceFailCountRef.current === 0 ? BASE : Math.min(BASE * Math.pow(2, balanceFailCountRef.current), 300_000);
      timer = setTimeout(async () => { await fetchLiveBalance(); schedule(); }, delay);
    }
    schedule();
    return () => clearTimeout(timer);
  }, [fetchLiveBalance]);

  const toggleBot = useCallback(() => toggleBotHook(), [toggleBotHook]);

  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl ?? 0), 0);
  const wins = trades.filter(t => Number(t.pnl ?? 0) > 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;

  const handleCredModalSave = async () => {
    if (!credApiKey.trim() || !credApiSecret.trim()) {
      toast.error('Please enter both API Key and API Secret');
      return;
    }
    setCredSaving(true);
    try {
      const res = await authFetch('/user/save-credentials', {
        method: 'POST',
        body: JSON.stringify({ apiKey: credApiKey.trim(), apiSecret: credApiSecret.trim(), platform: 'Coinbase' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success('Credentials saved! Fetching balance...');
        setCredModalOpen(false);
        setCredApiKey('');
        setCredApiSecret('');
        _balanceUnauthorized = false;
        _balanceLastFetch = 0;
        balanceStopPollingRef.current = false;
        balanceFailCountRef.current = 0;
        await fetchLiveBalance();
      } else {
        toast.error(data.error || 'Failed to save credentials');
      }
    } catch {
      toast.error('Connection error — try again');
    } finally {
      setCredSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Oracle Trader Pro — AI Dashboard</title>
        <meta name="description" content="World-class AI trading dashboard — live markets, signals, analysis and automated execution." />
      </Helmet>

      {/* Sidebar */}
      <PremiumSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
      />

      {/* Main layout */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}
        style={{ background: '#090E1A' }}>

        {/* Header */}
        <PremiumHeader
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setSidebarOpen(true)}
          balance={balance.total}
        />

        {/* Content — offset for header (ticker 28px + nav 56px = 84px) */}
        <main className="pt-[84px] pb-8 max-w-screen-2xl mx-auto">

          {/* Hash-based view routing */}
          {activeHash && renderHashView(activeHash) ? (
            <div>{renderHashView(activeHash)}</div>
          ) : (
          <div className="px-4 space-y-6">

          {/* Hero */}
          <HeroSection
            botActive={botActive}
            onToggleBot={toggleBot}
            toggling={toggling}
            balance={balance.total}
            isAdmin={isAdmin}
          />

          {/* Markets */}
          <MarketOverview />

          {/* Chart + AI Analysis side-by-side */}
          <section id="chart-analysis" className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Chart placeholder */}
            <div className="xl:col-span-2 rounded-xl border border-[#1E2A3B] overflow-hidden" style={{ background: '#111827', minHeight: 380 }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2A3B]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">BTC/USD</span>
                  <span className="text-[11px] text-[#10B981] bg-[#10B98115] px-2 py-0.5 rounded-md">+2.3%</span>
                </div>
                <div className="flex items-center gap-1">
                  {['1m','5m','15m','1H','4H','1D','1W','1M'].map(tf => (
                    <button key={tf}
                      className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${tf === '4H' ? 'bg-[#2563EB] text-white' : 'text-[#8899AA] hover:text-white'}`}>
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              {/* TradingView-style chart placeholder with live price animation */}
              <LiveChartCanvas />
            </div>
            <AIAnalysisPanel />
          </section>

          {/* Trade Execution + Signals */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <TradeExecutionPanel />
            <div className="xl:col-span-2">
              <AISignalsTable />
            </div>
          </section>

          {/* Portfolio */}
          <PortfolioStats balance={balance} trades={trades} winRate={winRate} totalPnl={totalPnl} />

          {/* Oracle Trader Pro Strategy Engine (Python-parity) */}
          <section id="oracle-strategy-engine" className="space-y-2">
            <h2 className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest px-1">Oracle Trader Pro Strategy Engine</h2>
            <OracleStrategyPanel
              aiConfidence={0.95}
              accountBalance={balance.total || 10000}
              riskPerTradePct={0.02}
              rrRatio={2.0}
            />
          </section>

          {/* Advanced Multi-Indicator Strategy Engine */}
          <section id="strategy-engine" className="space-y-2">
            <h2 className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest px-1">Advanced Strategy Engine</h2>
            <StrategyAnalysisPanel newsEvents={newsEvents} accountBalance={balance.total || 10000} />
          </section>

          {/* Trade Decision Engine */}
          <section id="trade-engine" className="space-y-2">
            <h2 className="text-xs font-semibold text-[#8899AA] uppercase tracking-widest px-1">Trade Decision Engine</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <TradeSetupForm onEvaluate={evaluateSetup} newsEvents={newsEvents} />
              <TradeDecisionPanel decision={decision} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <NewsBuffer onNewsChange={setNewsEvents} />
              <DailyPnLTracker riskStatus={riskStatus} onUpdate={updateDailyPnL} />
            </div>
          </section>

          {/* Heatmap + News */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <MarketHeatmap />
            <NewsIntelligence />
          </section>

          {/* Smart Money */}
          <SmartMoneyPanel />

          {/* Performance Analytics */}
          <PerformanceAnalytics />

          {/* Watchlist + Heatmap */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Watchlist />
            <MarketHeatmap />
          </section>

          {/* Footer */}
          <FooterStatusBar />
          </div>
          )}
        </main>
      </div>

      {/* Re-enter Credentials Modal */}
      {credModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#1E2A3B] p-6 space-y-4" style={{ background: '#111827' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔑</span>
              <div>
                <h2 className="text-white font-bold text-lg">Update API Credentials</h2>
                <p className="text-[#8899AA] text-sm mt-0.5">Your stored credentials need to be re-entered.</p>
              </div>
            </div>
            <p className="text-[#EF4444] text-sm bg-[#EF444415] border border-[#EF444430] rounded-lg px-3 py-2">{credModalMsg}</p>
            {/* Step-by-step instructions */}
            <div className="bg-[#0B0E14] border border-[#1E2A3B] rounded-lg px-3 py-3 text-[11px] text-[#8899AA] space-y-1">
              <p className="text-[#FBBF24] font-semibold mb-1">📋 How to copy your Coinbase CDP credentials:</p>
              <p>1. Go to <span className="text-white">coinbase.com/developer-platform</span> → API Keys</p>
              <p>2. Copy the full <span className="text-[#10B981]">API Key Name</span> (starts with <span className="font-mono">organizations/</span>)</p>
              <p>3. Copy the <span className="text-[#10B981]">Private Key</span> — select ALL text from <span className="font-mono">-----BEGIN</span> to <span className="font-mono">-----END-----</span></p>
              <p>4. Paste each below and click <span className="text-white">Save & Retry</span></p>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="cred-modal-api-key" className="block text-xs text-[#8899AA] mb-1 font-mono">API KEY NAME (organizations/...)</label>
                <input
                  id="cred-modal-api-key"
                  name="apiKey"
                  type="text"
                  autoComplete="off"
                  value={credApiKey}
                  onChange={e => setCredApiKey(e.target.value)}
                  placeholder="organizations/your-org-id/apiKeys/your-key-id"
                  className="w-full bg-[#0B0E14] border border-[#1E2A3B] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#2563EB]"
                />
                {credApiKey && !credApiKey.startsWith('organizations/') && (
                  <p className="text-[#EF4444] text-[11px] mt-1">⚠ API key should start with <span className="font-mono">organizations/</span></p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="cred-modal-api-secret" className="text-xs text-[#8899AA] font-mono">PRIVATE KEY (PEM format)</label>
                  {credApiSecret && (
                    <span className={`text-[10px] font-mono ${
                      credApiSecret.includes('-----BEGIN') && credApiSecret.includes('-----END') && credApiSecret.replace(/-----[^-]+-----/g,'').replace(/\s+/g,'').length >= 60
                        ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}>
                      {credApiSecret.includes('-----BEGIN') && credApiSecret.includes('-----END')
                        ? `✓ Headers OK · ${credApiSecret.replace(/-----[^-]+-----/g,'').replace(/\s+/g,'').length} b64 chars`
                        : '⚠ Missing BEGIN/END headers'}
                    </span>
                  )}
                </div>
                <textarea
                  id="cred-modal-api-secret"
                  name="apiSecret"
                  autoComplete="off"
                  value={credApiSecret}
                  onChange={e => setCredApiSecret(e.target.value)}
                  placeholder={`-----BEGIN EC PRIVATE KEY-----\nMHcCAQEE... (paste full key here)\n-----END EC PRIVATE KEY-----`}
                  rows={7}
                  className="w-full bg-[#0B0E14] border border-[#1E2A3B] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#2563EB] resize-none"
                />
                <p className="text-[#4B5E74] text-[11px] mt-1">
                  ⚡ Paste the <strong>complete</strong> private key including the <span className="font-mono text-[#8899AA]">-----BEGIN-----</span> and <span className="font-mono text-[#8899AA]">-----END-----</span> lines. Do not truncate.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCredModalSave}
                disabled={credSaving}
                className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >{credSaving ? 'Saving...' : 'Save & Retry'}</button>
              <button
                onClick={() => setCredModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#1E2A3B] text-[#8899AA] hover:text-white hover:border-[#4B5E74] transition-colors text-sm"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AIChatWindow
          open={aiOpen}
          balance={balance.total}
          botActive={botActive}
          trades={trades}
        />
        <AIAssistantButton open={aiOpen} onClick={() => setAiOpen(v => !v)} />
      </div>

      {/* Ticker marquee keyframe */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}

// Live animated SVG chart (simulated candlestick-style)
function LiveChartCanvas() {
  const [candles, setCandles] = useState(() => generateCandles(60));
  const [crosshair, setCrosshair] = useState(null);
  const svgRef = React.useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setCandles(prev => {
        const last = prev[prev.length - 1];
        const close = last.close * (1 + (Math.random() - 0.48) * 0.004);
        const open = last.close;
        const high = Math.max(open, close) * (1 + Math.random() * 0.003);
        const low = Math.min(open, close) * (1 - Math.random() * 0.003);
        return [...prev.slice(1), { open, high, low, close }];
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  // RAF-throttled mouse move for crosshair
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = throttleMouseMove((e) => {
      const rect = el.getBoundingClientRect();
      setCrosshair({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    });
    const clear = () => setCrosshair(null);
    el.addEventListener('mousemove', handler);
    el.addEventListener('mouseleave', clear);
    return () => { el.removeEventListener('mousemove', handler); el.removeEventListener('mouseleave', clear); };
  }, []);

  const W = 580, H = 280;
  const prices = candles.map(c => [c.high, c.low]).flat();
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const scaleY = v => H - 24 - ((v - minP) / (maxP - minP || 1)) * (H - 48) + 12;
  const candleW = W / candles.length - 1;

  return (
    <div className="p-4 overflow-hidden">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full cursor-crosshair" preserveAspectRatio="none" style={{ height: 300 }}>
        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map(pct => (
          <line key={pct} x1="0" y1={H * pct} x2={W} y2={H * pct}
            stroke="#1E2A3B" strokeWidth="0.5" strokeDasharray="4 6" />
        ))}
        {candles.map((c, i) => {
          const x = i * (W / candles.length);
          const mx = x + candleW / 2;
          const up = c.close >= c.open;
          const color = up ? '#10B981' : '#EF4444';
          const bodyTop = scaleY(Math.max(c.open, c.close));
          const bodyBot = scaleY(Math.min(c.open, c.close));
          return (
            <g key={i}>
              <line x1={mx} y1={scaleY(c.high)} x2={mx} y2={scaleY(c.low)} stroke={color} strokeWidth="0.8" />
              <rect x={x + 0.5} y={bodyTop} width={Math.max(1, candleW - 1)} height={Math.max(1, bodyBot - bodyTop)} fill={color} opacity="0.85" rx="0.5" />
            </g>
          );
        })}
        {/* Price line */}
        <line x1={W - 2} y1={scaleY(candles[candles.length - 1].close)} x2={W} y2={scaleY(candles[candles.length - 1].close)}
          stroke="#FBBF24" strokeWidth="1" />
        {/* RAF-throttled crosshair */}
        {crosshair && (() => {
          const svgEl = svgRef.current;
          if (!svgEl) return null;
          const rect = svgEl.getBoundingClientRect();
          const cx = (crosshair.x / rect.width) * W;
          const cy = (crosshair.y / rect.height) * H;
          return (
            <g pointerEvents="none">
              <line x1={cx} y1={0} x2={cx} y2={H} stroke="#FBBF2450" strokeWidth="0.8" strokeDasharray="3 4" />
              <line x1={0} y1={cy} x2={W} y2={cy} stroke="#FBBF2450" strokeWidth="0.8" strokeDasharray="3 4" />
              <circle cx={cx} cy={cy} r="3" fill="#FBBF24" opacity="0.7" />
            </g>
          );
        })()}
      </svg>
      <div className="flex items-center gap-4 mt-1 text-[10px] text-[#4B5E74]">
        <span>EMA 9</span><span>EMA 21</span><span>RSI</span><span>MACD</span><span>VWAP</span><span>BB</span>
      </div>
    </div>
  );
}

function generateCandles(n) {
  let price = 67200;
  return Array.from({ length: n }, () => {
    const open = price;
    price = price * (1 + (Math.random() - 0.48) * 0.005);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.003);
    const low = Math.min(open, close) * (1 - Math.random() * 0.003);
    return { open, high, low, close };
  });
}
