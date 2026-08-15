import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Bell, Wallet, User, Wifi, Server, Globe, Sun, Moon,
  Menu, ChevronDown, Bot, TrendingUp, TrendingDown, LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const TICKER = [
  { symbol: 'BTC', price: '67,245', change: '+2.3%', up: true },
  { symbol: 'ETH', price: '3,512', change: '+1.8%', up: true },
  { symbol: 'SOL', price: '182.4', change: '+4.1%', up: true },
  { symbol: 'XRP', price: '0.628', change: '-0.9%', up: false },
  { symbol: 'GOLD', price: '2,341', change: '+0.4%', up: true },
  { symbol: 'EUR/USD', price: '1.0842', change: '-0.1%', up: false },
];

export default function PremiumHeader({ sidebarCollapsed, onMenuClick, balance }) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [dark] = useState(true);

  return (
    <header className={`
      fixed top-0 right-0 z-30 flex flex-col
      transition-all duration-300
      ${sidebarCollapsed ? 'left-[72px]' : 'left-0 lg:left-64'}
      bg-[#090E1A]/95 backdrop-blur-md border-b border-[#1E2A3B]
    `}>
      {/* Ticker tape */}
      <div className="h-7 overflow-hidden border-b border-[#1E2A3B]/50 relative">
        <div className="flex items-center gap-8 px-4 h-full animate-marquee whitespace-nowrap"
          style={{ animation: 'marquee 30s linear infinite' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-[#8899AA]">{t.symbol}</span>
              <span className="text-white">{t.price}</span>
              <span className={t.up ? 'text-[#10B981]' : 'text-[#EF4444]'}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main header row */}
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Mobile menu */}
        <button onClick={onMenuClick} className="lg:hidden text-[#8899AA] hover:text-white p-1">
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4B5E74]" />
            <input
              id="header-market-search"
              name="marketSearch"
              type="text"
              placeholder="Search markets, assets..."
              autoComplete="off"
              className="w-full h-8 bg-[#111827] border border-[#1E2A3B] rounded-lg pl-8 pr-3 text-xs text-[#8899AA] placeholder-[#4B5E74] focus:outline-none focus:border-[#2563EB]/50 focus:bg-[#111827]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-3 mr-2">
            <div className="flex items-center gap-1.5 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#10B981] font-mono">AI LIVE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <Wifi className="w-3 h-3 text-[#10B981]" />
              <span className="text-[#8899AA] font-mono">12ms</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <Server className="w-3 h-3 text-[#2563EB]" />
              <span className="text-[#8899AA] font-mono">99.9%</span>
            </div>
          </div>

          {/* Wallet balance */}
          {balance > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#1E2A3B] bg-[#111827] text-xs">
              <Wallet className="w-3 h-3 text-[#FBBF24]" />
              <span className="text-[#FBBF24] font-mono font-medium">${balance.toLocaleString()}</span>
            </div>
          )}

          {/* Language */}
          <button className="hidden lg:flex items-center gap-1 px-2 h-8 rounded-lg text-[#8899AA] hover:text-white hover:bg-[#111827] text-xs transition-colors">
            <Globe className="w-3.5 h-3.5" />
            <span>EN</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Notifications */}
          <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#8899AA] hover:text-white hover:bg-[#111827] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(v => !v)}
              className="flex items-center gap-2 px-2 h-8 rounded-lg hover:bg-[#111827] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="hidden sm:block text-xs text-[#8899AA] max-w-[80px] truncate">{user?.email?.split('@')[0] || 'Trader'}</span>
              <ChevronDown className="w-3 h-3 text-[#4B5E74] hidden sm:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-10 w-52 bg-[#111827] border border-[#1E2A3B] rounded-xl shadow-2xl z-50 py-2">
                <div className="px-4 py-2 border-b border-[#1E2A3B]">
                  <p className="text-xs font-medium text-white truncate">{user?.email || 'trader@oracle.ai'}</p>
                  <p className="text-[10px] text-[#10B981] mt-0.5">ORACLE PRO Active</p>
                </div>
                <Link to="/oracle-trader-pro/setup"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#8899AA] hover:text-white hover:bg-[#1E2A3B] transition-colors">
                  <Bot className="w-3.5 h-3.5" /> API Settings
                </Link>
                <button
                  onClick={() => { setShowProfile(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#EF4444] hover:bg-[#1E2A3B] transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
