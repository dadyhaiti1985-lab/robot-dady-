import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';

const getStatusBadge = (status) => {
  const s = status?.toUpperCase();
  if (s === 'COMPLETED' || s === 'FILLED') return <Badge className="bg-success-subtle text-success border-success/20 hover:bg-success-subtle">{status}</Badge>;
  if (s === 'PENDING' || s === 'OPEN') return <Badge className="bg-warning-subtle text-warning border-warning/20 hover:bg-warning-subtle">{status}</Badge>;
  if (s === 'FAILED' || s === 'CANCELED') return <Badge className="bg-danger-subtle text-danger border-danger/20 hover:bg-danger-subtle">{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
};

const getTypeColor = (type) => {
  const t = type?.toUpperCase();
  if (t === 'BUY') return 'text-success font-semibold';
  if (t === 'SELL') return 'text-danger font-semibold';
  return 'text-foreground';
};

const RecentTransactionsTable = ({ transactions, loading }) => {
  return (
    <Card className="border-border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="w-5 h-5 mr-2 text-primary" />
          Dènye Tranzaksyon
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (!transactions || transactions.length === 0) ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            Pa gen tranzaksyon resan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-y border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Dat</th>
                  <th className="px-4 py-3 font-medium">Kalite</th>
                  <th className="px-4 py-3 font-medium">Byen</th>
                  <th className="px-4 py-3 font-medium text-right">Kantite</th>
                  <th className="px-4 py-3 font-medium text-right">Pri</th>
                  <th className="px-4 py-3 font-medium text-right">Estati</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-border/50 table-row-hover">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 ${getTypeColor(tx.type)}`}>{tx.type}</td>
                    <td className="px-4 py-3 font-medium">{tx.asset}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{tx.amount.toLocaleString(undefined, {maximumFractionDigits: 6})}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${tx.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 text-right">{getStatusBadge(tx.status)}</td>
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

export default RecentTransactionsTable;