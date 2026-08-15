import { authApiFetch } from '@/lib/authApi';
import React, { useEffect, useState } from 'react';
import Header from '@/components/dashboard/Header.jsx';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await authApiFetch('/bot/trades?limit=20');
        if (res.ok) {
          const data = await res.json();
          setTrades(data);
        }
      } catch (error) {
        console.error("Failed to load trades", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Execution History</h1>
        
        <Card className="cyber-panel overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full bg-sidebar" />
              <Skeleton className="h-10 w-full bg-sidebar" />
              <Skeleton className="h-10 w-full bg-sidebar" />
            </div>
          ) : trades.length > 0 ? (
            <Table>
              <TableHeader className="bg-sidebar">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade.id} className="border-border hover:bg-sidebar/50">
                    <TableCell className="font-mono-metrics text-xs text-muted-foreground">
                      {new Date(trade.date || trade.created).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{trade.instrument || trade.asset}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-sm ${trade.side === 'BUY' || trade.type === 'buy' ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-rose/10 text-rose border border-rose/20'}`}>
                        {(trade.side || trade.type || 'BUY').toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono-metrics">${trade.entryPrice?.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-mono-metrics ${trade.pnl >= 0 ? 'text-emerald' : 'text-rose'}`}>
                      {trade.pnl > 0 ? '+' : ''}{trade.pnl?.toLocaleString() || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-muted-foreground border border-dashed border-border m-6 rounded-lg">
              No trades found for this account.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}