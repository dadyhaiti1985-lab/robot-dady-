import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';
import { Skeleton } from '@/components/ui/skeleton';

const PositionManager = ({ positions, loading, onRefresh }) => {
  const [closingId, setClosingId] = useState(null);

  const handleClosePosition = async (asset) => {
    if (!window.confirm(`Èske ou sèten ou vle fèmen pozisyon ${asset} an imedyatman?`)) return;
    
    setClosingId(asset);
    try {
      const res = await apiServerClient.fetch('/bot/close-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to close position');
      }
      
      toast.success(`Pozisyon ${asset} fèmen avèk siksè`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Erè nan fèmen pozisyon an: ' + err.message);
    } finally {
      setClosingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pozisyon Louvri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Pozisyon Louvri</span>
          <Badge variant="secondary" className="ml-2">{positions?.length || 0}</Badge>
        </CardTitle>
        <CardDescription>Jere komès ki ap fèt kounye a.</CardDescription>
      </CardHeader>
      <CardContent>
        {!positions || positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-muted/10">
            <ShieldAlert className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">Pa gen okenn pozisyon ki louvri kounye a.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-y border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Senbòl</th>
                  <th className="px-4 py-3 font-medium">Antre</th>
                  <th className="px-4 py-3 font-medium">SL / TP</th>
                  <th className="px-4 py-3 font-medium">PnL</th>
                  <th className="px-4 py-3 font-medium">Fòs Siyal</th>
                  <th className="px-4 py-3 font-medium text-right">Aksyon</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4 font-semibold text-foreground flex items-center">
                      <div className="w-2 h-2 rounded-full bg-info mr-2"></div>
                      {pos.asset}
                    </td>
                    <td className="px-4 py-4 tabular-nums">${pos.entry?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-4 tabular-nums text-xs">
                      <span className="text-danger block">SL: ${pos.sl?.toLocaleString()}</span>
                      <span className="text-success block">TP: ${pos.tp?.toLocaleString()}</span>
                    </td>
                    <td className={`px-4 py-4 font-bold tabular-nums ${pos.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={pos.signalStrength >= 70 ? 'border-success/50 text-success' : 'border-warning/50 text-warning'}>
                        {pos.signalStrength}%
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 text-xs bg-danger/90 hover:bg-danger text-danger-foreground"
                        onClick={() => handleClosePosition(pos.asset)}
                        disabled={closingId === pos.asset}
                      >
                        {closingId === pos.asset ? 'Ap fèmen...' : <><X className="w-3 h-3 mr-1" /> Fèmen</>}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PositionManager;