import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const RealTimeWallet = () => {
  const { currentUser } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const snapshots = await pb.collection('portfolio_snapshots').getList(1, 1, {
          filter: `userId = "${currentUser?.id}"`,
          sort: '-timestamp',
          $autoCancel: false
        });

        if (snapshots.items.length > 0) {
          setPortfolioData(snapshots.items[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPortfolio();
      const interval = setInterval(fetchPortfolio, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Pòtfèy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = portfolioData?.totalValue || 0;
  const assets = portfolioData?.assets || [];
  const change24h = 2.47;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Pòtfèy</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Valè Total</p>
          <p className="text-3xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className={`flex items-center space-x-1 mt-1 ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{change24h >= 0 ? '+' : ''}{change24h}% (24h)</span>
          </div>
        </div>

        {assets.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Aktif</p>
            {assets.map((asset, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{asset.symbol}</p>
                  <p className="text-xs text-muted-foreground">{asset.amount} {asset.symbol}</p>
                </div>
                <p className="font-semibold">${asset.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeWallet;