import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PortfolioHistoryPage = () => {
  const { currentUser } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        let filter = `userId = "${currentUser?.id}"`;
        if (filterType !== 'all') {
          filter += ` && type = "${filterType}"`;
        }

        const records = await pb.collection('trades').getList(1, 50, {
          filter,
          sort: '-timestamp',
          $autoCancel: false
        });

        setTrades(records.items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trades:', error);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTrades();
    }
  }, [currentUser, filterType]);

  const exportToCSV = () => {
    const headers = ['Dat', 'Aktif', 'Tip', 'Kantite', 'Pri Antre', 'Pri Soti', 'P&L'];
    const rows = trades.map(trade => [
      new Date(trade.timestamp).toLocaleDateString('fr-HT'),
      trade.asset,
      trade.type === 'buy' ? 'Achte' : 'Vann',
      trade.amount,
      trade.entryPrice,
      trade.exitPrice || '-',
      trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'istorik-komès.csv';
    a.click();
  };

  return (
    <>
      <Helmet>
        <title>Istorik Pòtfolyo - Robo Komèsyal</title>
        <meta name="description" content="Gade tout tranzaksyon ak pèfòmans komès ou" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Istorik Pòtfolyo</h1>
            <p className="text-muted-foreground">Tout tranzaksyon ak pèfòmans komès ou</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <CardTitle>Istorik Tranzaksyon</CardTitle>
                <div className="flex items-center space-x-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tout tip" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tout tip</SelectItem>
                      <SelectItem value="buy">Achte</SelectItem>
                      <SelectItem value="sell">Vann</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={exportToCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Ekspòte CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : trades.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Pa gen tranzaksyon ankò</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dat</TableHead>
                        <TableHead>Aktif</TableHead>
                        <TableHead>Tip</TableHead>
                        <TableHead className="text-right">Kantite</TableHead>
                        <TableHead className="text-right">Pri Antre</TableHead>
                        <TableHead className="text-right">Pri Soti</TableHead>
                        <TableHead className="text-right">P&L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="font-medium">
                            {new Date(trade.timestamp).toLocaleDateString('fr-HT')}
                          </TableCell>
                          <TableCell className="font-semibold">{trade.asset}</TableCell>
                          <TableCell>
                            <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                              {trade.type === 'buy' ? 'Achte' : 'Vann'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{trade.amount}</TableCell>
                          <TableCell className="text-right">${trade.entryPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {trade.pnl ? (
                              <span className={`flex items-center justify-end space-x-1 ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {trade.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span className="font-semibold">${Math.abs(trade.pnl).toFixed(2)}</span>
                              </span>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PortfolioHistoryPage;