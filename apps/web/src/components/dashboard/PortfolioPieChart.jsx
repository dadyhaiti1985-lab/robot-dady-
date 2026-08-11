import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--danger))', 'hsl(var(--accent))'];

const PortfolioPieChart = ({ portfolio, loading }) => {
  const data = portfolio?.filter(item => item.value > 0) || [];

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg">Alokasyon</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && data.length === 0 ? (
          <div className="chart-container">
            <Skeleton className="w-48 h-48 rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="chart-container text-muted-foreground border border-dashed rounded-lg">
            Pa gen done pou afiche.
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="asset"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioPieChart;