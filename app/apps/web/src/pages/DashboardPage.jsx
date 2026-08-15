import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Activity, BarChart2, Shield, Settings, History, Wallet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';

// Advanced Components
import IndicatorVisualization from '@/components/dashboard/IndicatorVisualization.jsx';
import PositionManager from '@/components/dashboard/PositionManager.jsx';
import AssetRotationHistory from '@/components/dashboard/AssetRotationHistory.jsx';
import DailyStatsCard from '@/components/dashboard/DailyStatsCard.jsx';
import BotConfigPanel from '@/components/dashboard/BotConfigPanel.jsx';
import TelegramNotificationPanel from '@/components/dashboard/TelegramNotificationPanel.jsx';

// Account Components
import { useAccountData } from '@/hooks/useAccountData.js';
import AccountSummaryCard from '@/components/dashboard/AccountSummaryCard.jsx';
import PortfolioTable from '@/components/dashboard/PortfolioTable.jsx';
import PortfolioPieChart from '@/components/dashboard/PortfolioPieChart.jsx';
import RecentTransactionsTable from '@/components/dashboard/RecentTransactionsTable.jsx';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [status, setStatus] = useState(null);
  const [analysis, setAnalysis] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [botConfig, setBotConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Account Data Hook (uses batch /bot/dashboard-data endpoint)
  const accountData = useAccountData();

  // Update Last updated timer
  useEffect(() => {
    if (!accountData.lastUpdated) return;
    
    const updateTimer = () => {
      const diff = Math.floor((Date.now() - accountData.lastUpdated.getTime()) / 1000);
      setSecondsAgo(diff >= 0 ? diff : 0);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [accountData.lastUpdated]);

  // Fetch logic
  const fetchAdvancedStatus = async () => {
    if (!currentUser) return;
    try {
      const res = await apiServerClient.fetch('/bot/advanced-status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Status fetch error:", err);
    }
  };

  const fetchAnalysis = async (asset) => {
    if (!currentUser || !asset) return;
    try {
      const timeframes = ['15m', '4h', '1D'];
      const promises = timeframes.map(tf => 
        apiServerClient.fetch(`/bot/analysis?asset=${asset}&timeframe=${tf}`).then(r => r.ok ? r.json() : null)
      );
      const results = await Promise.all(promises);
      setAnalysis(results.filter(Boolean));
    } catch (err) {
      console.error("Analysis fetch error:", err);
    }
  };

  const fetchRotations = async () => {
    if (!currentUser) return;
    try {
      const res = await apiServerClient.fetch('/bot/rotations?limit=10');
      if (res.ok) {
        const data = await res.json();
        setRotations(Array.isArray(data) ? data : (data.items || []));
      }
    } catch (err) {
      console.error("Rotations fetch error:", err);
    }
  };

  const fetchUserConfig = async () => {
    if (!currentUser) return;
    try {
      const records = await pb.collection('bot_config').getList(1, 1, {
        filter: `userId = "${currentUser.id}"`,
        $autoCancel: false
      });
      if (records.items.length > 0) {
        setBotConfig(records.items[0]);
      }
    } catch (err) {
      console.error("Config fetch error:", err);
    }
  };

  // Lifecycle
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchUserConfig();
      await fetchAdvancedStatus();
      await fetchRotations();
      setLoading(false);
    };
    init();
  }, [currentUser]);

  useEffect(() => {
    if (status?.activeAsset) {
      fetchAnalysis(status.activeAsset);
    }
  }, [status?.activeAsset]);

  useEffect(() => {
    const statusInterval = setInterval(fetchAdvancedStatus, 5000);
    const rotationInterval = setInterval(fetchRotations, 30000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(rotationInterval);
    };
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Ou dekonekte avèk siksè.');
  };

  const activeAsset = status?.activeAsset || 'Chèche...';
  const signalGaugeValue = analysis.length > 0 ? (analysis.reduce((acc, curr) => acc + (curr.signalStrength || 0), 0) / analysis.length).toFixed(0) : 0;
  const isRunning = status?.isRunning || false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet><title>Tablo de Bò Avanse - RoboKripto</title></Helmet>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Top Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              Tablo de Bò Avanse
            </h1>
            <p className="text-muted-foreground mt-2">
              Sipèvize analiz milti-tan ak jesyon risk.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-2 bg-background rounded-lg border border-border flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Aktif:</span>
              <span className="font-bold text-lg text-primary">{activeAsset}</span>
            </div>
            
            <div className="px-4 py-2 bg-background rounded-lg border border-border flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Siyal:</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${signalGaugeValue >= 70 ? 'bg-success' : signalGaugeValue >= 40 ? 'bg-warning' : 'bg-danger'}`} 
                    style={{ width: `${signalGaugeValue}%` }}
                  />
                </div>
                <span className="font-bold text-sm">{signalGaugeValue}%</span>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${isRunning ? 'bg-success-subtle border-success/30 text-success' : 'bg-muted border-border text-muted-foreground'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="font-medium text-sm">{isRunning ? 'Aktif' : 'An Poz'}</span>
            </div>

            <Button variant="outline" onClick={handleLogout} className="border-border">
              <LogOut className="w-4 h-4 mr-2" /> Soti
            </Button>
          </div>
        </div>

        {/* Global Warning for Cached Data */}
        {accountData.isCachedData && (
          <div className="mb-6 flex items-center justify-center space-x-2 bg-warning-subtle text-warning border border-warning/20 p-4 rounded-xl shadow-sm transition-all">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Using cached data - live data unavailable</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid grid-cols-6 bg-muted/50 p-1 mb-6">
                <TabsTrigger value="account" className="data-[state=active]:bg-card"><Wallet className="w-4 h-4 mr-2 hidden sm:block" /> Kont</TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-card"><Activity className="w-4 h-4 mr-2 hidden sm:block" /> Analiz</TabsTrigger>
                <TabsTrigger value="positions" className="data-[state=active]:bg-card"><Shield className="w-4 h-4 mr-2 hidden sm:block" /> Pozisyon</TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-card"><BarChart2 className="w-4 h-4 mr-2 hidden sm:block" /> Estatistik</TabsTrigger>
                <TabsTrigger value="rotations" className="data-[state=active]:bg-card"><History className="w-4 h-4 mr-2 hidden sm:block" /> Wotasyon</TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-card"><Settings className="w-4 h-4 mr-2 hidden sm:block" /> Paramèt</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="focus-visible:outline-none">
                <AccountSummaryCard 
                  balance={accountData.balance} 
                  loading={accountData.loading} 
                  error={accountData.error} 
                  isRefreshing={accountData.isRefreshing}
                  isCachedData={accountData.isCachedData}
                  onRefresh={accountData.refetch}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PortfolioTable portfolio={accountData.portfolio} loading={accountData.loading || accountData.isRefreshing} />
                  </div>
                  <div className="lg:col-span-1">
                    <PortfolioPieChart portfolio={accountData.portfolio} loading={accountData.loading || accountData.isRefreshing} />
                  </div>
                </div>
                <RecentTransactionsTable transactions={accountData.transactions} loading={accountData.loading || accountData.isRefreshing} />
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4 focus-visible:outline-none">
                <IndicatorVisualization analysisData={analysis} />
              </TabsContent>
              
              <TabsContent value="positions" className="focus-visible:outline-none">
                <PositionManager 
                  positions={status?.openPositions || []} 
                  loading={loading} 
                  onRefresh={fetchAdvancedStatus}
                />
              </TabsContent>

              <TabsContent value="stats" className="focus-visible:outline-none">
                <DailyStatsCard stats={status} loading={loading} />
              </TabsContent>

              <TabsContent value="rotations" className="focus-visible:outline-none">
                <AssetRotationHistory rotations={rotations} loading={loading} />
              </TabsContent>

              <TabsContent value="config" className="focus-visible:outline-none">
                <BotConfigPanel 
                  currentConfig={botConfig} 
                  userId={currentUser?.id} 
                  onConfigUpdate={fetchUserConfig}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="xl:col-span-4">
            <TelegramNotificationPanel />
          </div>
        </div>

        {/* Live Timestamp */}
        {accountData.lastUpdated && (
          <div className="mt-12 text-center text-sm font-medium text-muted-foreground pb-4">
            Last updated: {secondsAgo} seconds ago
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;