import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Brain, BarChart3, Zap, Briefcase, ListOrdered,
  Star, Newspaper, Shield, Calendar, LineChart, History, ArrowDownToLine,
  ArrowUpFromLine, Users, Settings, HelpCircle, ChevronLeft, ChevronRight, Bot, X
} from 'lucide-react';

const NAV_ITEMS = [
  { group: 'CORE', items: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Markets', path: '/dashboard#markets' },
    { icon: Brain, label: 'AI Signals', path: '/dashboard#signals' },
    { icon: BarChart3, label: 'AI Analysis', path: '/dashboard#analysis' },
    { icon: Zap, label: 'Trading', path: '/dashboard#trading' },
    { icon: Briefcase, label: 'Portfolio', path: '/dashboard#portfolio' },
    { icon: ListOrdered, label: 'Orders', path: '/dashboard#orders' },
    { icon: Star, label: 'Watchlist', path: '/dashboard#watchlist' },
  ]},
  { group: 'INTELLIGENCE', items: [
    { icon: Newspaper, label: 'News Intelligence', path: '/dashboard#news' },
    { icon: Shield, label: 'Smart Money', path: '/dashboard#smartmoney' },
    { icon: Calendar, label: 'Economic Calendar', path: '/dashboard#calendar' },
    { icon: LineChart, label: 'Analytics', path: '/dashboard#analytics' },
  ]},
  { group: 'ACCOUNT', items: [
    { icon: History, label: 'Trade History', path: '/dashboard#trade-history' },
    { icon: ArrowDownToLine, label: 'Deposits', path: '/dashboard#deposits' },
    { icon: ArrowUpFromLine, label: 'Withdrawals', path: '/dashboard#withdrawals' },
    { icon: Users, label: 'Referral', path: '/dashboard#referral' },
    { icon: Settings, label: 'Settings', path: '/dashboard#settings' },
    { icon: HelpCircle, label: 'Support', path: '/dashboard#support' },
  ]}
];

export default function PremiumSidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const hash = location.hash;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'w-[72px]' : 'w-64'}
        bg-[#090E1A] border-r border-[#1E2A3B]
        overflow-hidden
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-[#1E2A3B] min-h-[64px] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)', boxShadow: '0 0 16px #2563EB66' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">Oracle Trader</p>
              <p className="text-[10px] text-[#2563EB] font-mono uppercase tracking-widest">PRO v4</p>
            </div>
          )}
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
          {NAV_ITEMS.map(group => (
            <div key={group.group} className="mb-2">
              {!collapsed && (
                <p className="text-[9px] font-bold tracking-[0.15em] text-[#4B5E74] uppercase px-4 py-2">{group.group}</p>
              )}
              {group.items.map(item => {
                const itemHash = item.path.includes('#') ? '#' + item.path.split('#')[1] : '';
                const isActive = itemHash
                  ? hash === itemHash
                  : (location.pathname === item.path && !hash);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-150 group relative
                      ${isActive
                        ? 'bg-[#2563EB]/20 text-[#2563EB] font-medium'
                        : 'text-[#8899AA] hover:bg-[#111827] hover:text-white'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2563EB] rounded-r-full" />
                    )}
                    <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#4B5E74] group-hover:text-[#8899AA]'}`} style={{ width: 18, height: 18 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center py-3 border-t border-[#1E2A3B] text-[#4B5E74] hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}
