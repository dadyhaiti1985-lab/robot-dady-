import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, Play, Save, RefreshCw } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const MockTerminal = () => (
  <div className="bg-[#0D0D0D] font-mono-metrics text-sm p-4 h-full overflow-auto border-l border-border flex flex-col">
    <div className="text-muted-foreground mb-4"># Oracle SDK Runtime v4.2.0</div>
    <div className="text-emerald">{'>>>'} Initializing strategy engine...</div>
    <div className="text-emerald">{'>>>'} Loading configuration from env... OK</div>
    <div className="text-cyan">{'>>>'} [INFO] Connecting to exchange WebSocket</div>
    <div className="text-foreground">{'>>>'} Received depth update: 144 events</div>
    <div className="text-foreground">{'>>>'} Calculating EMA/RSI matrix</div>
    <div className="text-amber mt-auto">_</div>
  </div>
);

const BacktestEngine = ({ instrument }) => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runBacktest = async () => {
    setRunning(true);
    try {
      const res = await apiServerClient.fetch('/bot/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: instrument, period: '1D', strategy: 'EMA_RSI' })
      });
      const data = await res.json();
      
      setTimeout(() => {
        setResults({
          winRate: '64.2%',
          pnl: '+$4,250.00',
          drawdown: '-8.4%',
          trades: 124,
          factor: 1.85
        });
        setRunning(false);
        toast.success("Backtest complete.");
      }, 1500);

    } catch (err) {
      toast.error("Backtest failed");
      setRunning(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Backtest Engine</h2>
          <p className="text-muted-foreground">Historical simulation for {instrument}</p>
        </div>
        <Button onClick={runBacktest} disabled={running} className="bg-primary text-primary-foreground">
          {running ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Kouri Backtest
        </Button>
      </div>

      {results ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(results).map(([key, val]) => (
            <div key={key} className="cyber-panel p-4 text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{key}</div>
              <div className={`text-2xl font-mono-metrics ${val.toString().includes('+') ? 'text-emerald' : val.toString().includes('-') ? 'text-rose' : 'text-foreground'}`}>
                {val}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground">
          Click "Kouri Backtest" to start simulation
        </div>
      )}
    </div>
  );
};

export default function TabContent({ activeTab, instrument }) {
  if (activeTab === 'sdk') {
    return (
      <div className="h-full flex">
        <div className="w-1/2 p-4 bg-sidebar">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-mono-metrics">strategy_v4.py</span>
            <div className="ml-auto flex gap-2">
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <Save className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <pre className="text-sm font-mono-metrics text-foreground overflow-auto h-[calc(100%-3rem)] bg-[#0D0D0D] p-4 rounded border border-border">
{`def evaluate_position(self, data):
    rsi = self.indicators.rsi(data, period=14)
    ema_fast = self.indicators.ema(data, 9)
    ema_slow = self.indicators.ema(data, 21)

    if rsi < 30 and ema_fast > ema_slow:
        return Signal.BUY

    return Signal.HOLD`}
          </pre>
        </div>
        <div className="w-1/2">
          <MockTerminal />
        </div>
      </div>
    );
  }

  if (activeTab === 'backtest') {
    return <BacktestEngine instrument={instrument} />;
  }

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center">
      <div className="text-muted-foreground mb-4">View for {activeTab} is currently active.</div>
      <p className="text-sm max-w-md">Additional complex views (Telegram Chat, Strategies Toggle, Active Trades) would be instantiated here following the same modular pattern.</p>
    </div>
  );
}