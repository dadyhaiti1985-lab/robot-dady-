import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target, Activity } from 'lucide-react';

const PortfolioAnalytics = () => {
  const stats = [
    { label: 'Chanjman 24h', value: '+2.47%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'To Reyisit', value: '67.3%', icon: Target, color: 'text-primary' },
    { label: 'Total Komès', value: '142', icon: BarChart3, color: 'text-secondary' },
    { label: 'Volatilite', value: '12.8%', icon: Activity, color: 'text-yellow-500' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatistik Pòtfolyo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioAnalytics;