import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Target, Shield, DollarSign, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StatItem = ({ label, value, icon: Icon, color, subtext }) => (
  <div className="p-4 rounded-xl border border-border/50 bg-card/50 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className={`p-2 rounded-lg bg-background border border-border ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  </div>
);

const DailyStatsCard = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
    );
  }

  const { dailyPnL, winRate, profitFactor, maxDrawdown, sharpeRatio, monthlyPnL, tradingPaused } = stats;

  return (
    <div className="space-y-4">
      {tradingPaused && (
        <div className="p-3 bg-danger-subtle text-danger border border-danger/20 rounded-lg flex items-center text-sm font-medium">
          <Shield className="w-4 h-4 mr-2" />
          Komès an poz akòz limit pèt chak jou an anrejistre (Trading paused due to daily loss limit).
        </div>
      )}
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatItem 
          label="Pwofi/Pèt Jodi a" 
          value={`${dailyPnL >= 0 ? '+' : ''}$${dailyPnL?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}`}
          icon={DollarSign}
          color={dailyPnL >= 0 ? 'text-success' : 'text-danger'}
          subtext="Net jodi a"
        />
        <StatItem 
          label="To Reyisit" 
          value={`${winRate?.toFixed(1) || 0}%`}
          icon={Target}
          color="text-primary"
          subtext="Pousantaj komès ki reyisi"
        />
        <StatItem 
          label="Faktè Pwofi" 
          value={profitFactor?.toFixed(2) || '0.00'}
          icon={TrendingUp}
          color={profitFactor > 1.5 ? 'text-success' : 'text-warning'}
          subtext="Pwofi total / Pèt total"
        />
        <StatItem 
          label="Max Drawdown" 
          value={`${maxDrawdown?.toFixed(2) || 0}%`}
          icon={Activity}
          color="text-danger"
          subtext="Pi gwo pèt anrejistre"
        />
        <StatItem 
          label="Sharpe Ratio" 
          value={sharpeRatio?.toFixed(2) || '0.00'}
          icon={TrendingUp}
          color={sharpeRatio > 1 ? 'text-success' : 'text-muted-foreground'}
          subtext="Rapò risk-rekonpans"
        />
        <StatItem 
          label="Pwofi Mwa Sa a" 
          value={`${monthlyPnL >= 0 ? '+' : ''}$${monthlyPnL?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}`}
          icon={Calendar}
          color={monthlyPnL >= 0 ? 'text-success' : 'text-danger'}
          subtext="Net pou mwa a"
        />
      </div>
    </div>
  );
};

export default DailyStatsCard;