import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';

const CoinbaseConnectionStatus = () => {
  const { currentUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (currentUser?.apiKey && currentUser?.apiSecret) {
        setIsConnected(true);
        setLastSync(new Date());
      } else {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isConnected ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
          <span>Koneksyon API</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estati</span>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? 'Konekte' : 'Dekonekte'}
            </span>
          </div>
          {isConnected && lastSync && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dènye Senkronizasyon</span>
              <span className="text-sm">{lastSync.toLocaleTimeString('fr-HT')}</span>
            </div>
          )}
          {!isConnected && (
            <p className="text-xs text-muted-foreground mt-2">
              Konfigire kle API ou nan Paramèt pou konekte ak Coinbase
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinbaseConnectionStatus;