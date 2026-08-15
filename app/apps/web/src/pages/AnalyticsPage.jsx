import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, Activity, DollarSign } from 'lucide-react';

const AnalyticsPage = () => {
  const performanceData = [
    { date: '15 Jen', value: 10000 },
    { date: '16 Jen', value: 10247 },
    { date: '17 Jen', value: 10189 },
    { date: '18 Jen', value: 10512 },
    { date: '19 Jen', value: 10678 },
    { date: '20 Jen', value: 10834 },
    { date: '21 Jen', value: 11023 }
  ];

  const monthlyPnL = [
    { month: 'Jan', profit: 847, loss: -234 },
    { month: 'Fev', profit: 1123, loss: -456 },
    { month: 'Mas', profit: 934, loss: -189 },
    { month: 'Avr', profit: 1456, loss: -567 },
    { month: 'Me', profit: 1289, loss: -345 },
    { month: 'Jen', profit: 1567, loss: -423 }
  ];

  const stats = [
    { label: 'To Reyisit', value: '67.3%', icon: Target, color: 'text-primary' },
    { label: 'Mwayèn Genyen', value: '$127.45', icon: DollarSign, color: 'text-green-500' },
    { label: 'Mwayèn Pèdi', value: '$78.23', icon: DollarSign, color: 'text-red-500' },
    { label: 'Sharpe Ratio', value: '1.84', icon: Activity, color: 'text-secondary' }
  ];

  return (
    <>
      <Helmet>
        <title>Analitik - Robo Komèsyal</title>
        <meta name="description" content="Analiz pèfòmans ak estatistik komès ou" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Analitik</h1>
            <p className="text-muted-foreground">Analiz detaye pèfòmans ak risk pòtfolyo ou</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Evolisyon Pòtfolyo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>P&L Mansyèl</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyPnL}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="profit" fill="#22c55e" name="Profit" />
                    <Bar dataKey="loss" fill="#ef4444" name="Pèdi" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metrik Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Max Drawdown</p>
                  <p className="text-2xl font-bold text-red-500">-8.47%</p>
                  <p className="text-xs text-muted-foreground mt-1">Pi gwo pèdi depi kòmansman</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Volatilite</p>
                  <p className="text-2xl font-bold text-yellow-500">12.8%</p>
                  <p className="text-xs text-muted-foreground mt-1">Ekatip anyal</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Total Komès</p>
                  <p className="text-2xl font-bold text-primary">142</p>
                  <p className="text-xs text-muted-foreground mt-1">96 genyen, 46 pèdi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AnalyticsPage;