import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart } from 'lucide-react';

const PortfolioTable = ({ portfolio, loading }) => {
  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <PieChart className="w-5 h-5 mr-2 text-primary" />
          Pòtfolyo Byen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (!portfolio || portfolio.length === 0) ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !portfolio || portfolio.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            Pa gen byen nan pòtfolyo a.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-y border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Byen</th>
                  <th className="px-4 py-3 font-medium text-right">Kantite</th>
                  <th className="px-4 py-3 font-medium text-right">Pri</th>
                  <th className="px-4 py-3 font-medium text-right">Valè ($)</th>
                  <th className="px-4 py-3 font-medium text-right">% Pòtfolyo</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50 table-row-hover">
                    <td className="px-4 py-3 font-semibold text-foreground">{item.asset}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{item.amount.toLocaleString(undefined, {maximumFractionDigits: 6})}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">${item.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <div className="flex items-center justify-end space-x-2">
                        <span>{item.percentage.toFixed(1)}%</span>
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
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

export default PortfolioTable;