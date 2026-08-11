import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Activity, FileCode2, Briefcase, 
  MessageCircle, History, TrendingUp, ListChecks, 
  Settings2, Cpu, Clock, LogOut, Settings 
} from 'lucide-react';
import { playTabSound } from '@/lib/audio';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import apiServerClient from '@/lib/apiServerClient';

export default function Header({ activeTab, setActiveTab, instrument, setInstrument }) {
  const [utcTime, setUtcTime] = useState('');
  const [livePrice, setLivePrice] = useState(null);
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!instrument) return;
    const fetchPrice = async () => {
      try {
        const res = await apiServerClient.fetch(`/coinbase/price?symbol=${instrument}`);
        if (res.ok) {
          const data = await res.json();
          setLivePrice(data.price);
        }
      } catch (err) {
        console.error("Failed to fetch header price", err);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [instrument]);

  const tabs = [
    { id: 'price', label: 'Price/EMA', icon: LineChart },
    { id: 'rsi', label: 'RSI Momentum', icon: Activity },
    { id: 'sdk', label: 'SDK Python', icon: FileCode2 },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'telegram', label: 'Telegram', icon: MessageCircle },
    { id: 'backtest', label: 'Backtest', icon: History },
    { id: 'tradingview', label: 'TradingView', icon: TrendingUp },
    { id: 'active', label: 'Active Trades', icon: ListChecks },
    { id: 'executions', label: 'CB Executions', icon: Settings2 },
    { id: 'strategies', label: 'Strategies', icon: Cpu },
  ];

  const handleTabChange = (id) => {
    playTabSound();
    if (setActiveTab) setActiveTab(id);
  };

  return (
    <header className="border-b border-border bg-sidebar h-16 flex items-center justify-between px-4 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">Oracle Trader Pro</span>
        </div>
        
        {location.pathname === '/' && setInstrument && (
          <div className="flex items-center gap-3">
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger className="w-[140px] bg-card border-border font-mono-metrics">
                <SelectValue placeholder="Instrument" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC-USD">BTC-USD</SelectItem>
                <SelectItem value="ETH-USD">ETH-USD</SelectItem>
                <SelectItem value="SOL-USD">SOL-USD</SelectItem>
              </SelectContent>
            </Select>
            {livePrice && (
              <span className="text-cyan font-mono-metrics font-bold tracking-tight">
                ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        )}
      </div>

      {location.pathname === '/' && setActiveTab && (
        <div className="hidden lg:flex items-center overflow-x-auto scrollbar-hide gap-1 px-4 max-w-[50%] mask-edges">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 whitespace-nowrap transition-all text-sm font-medium ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border-b-2 border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground bg-card px-3 py-1 border border-border">
          <Clock className="w-4 h-4" />
          <span className="font-mono-metrics text-sm">{utcTime || '...'}</span>
        </div>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">History</Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} className="text-rose hover:text-rose hover:bg-rose/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}