import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const IndicatorCard = ({ data, title }) => {
  if (!data) return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
        Chaje done...
      </CardContent>
    </Card>
  );

  const getRsiColor = (rsi) => {
    if (rsi < 30) return 'text-success bg-success-subtle border-success/20'; // Oversold -> Buy signal
    if (rsi > 70) return 'text-danger bg-danger-subtle border-danger/20'; // Overbought -> Sell signal
    return 'text-warning bg-warning-subtle border-warning/20';
  };

  const getEmaAlignment = () => {
    const { ema9, ema21, ema50, ema200 } = data;
    if (ema9 > ema21 && ema21 > ema50) return { text: 'Bullish', color: 'text-success', icon: TrendingUp };
    if (ema9 < ema21 && ema21 < ema50) return { text: 'Bearish', color: 'text-danger', icon: TrendingDown };
    return { text: 'Konfli', color: 'text-warning', icon: Minus };
  };

  const emaAlign = getEmaAlignment();

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${data.signalStrength >= 70 ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <Badge variant="outline" className={
          data.signalStrength >= 75 ? 'bg-success-subtle border-success/30' :
          data.signalStrength >= 50 ? 'bg-warning-subtle border-warning/30' :
          'bg-muted text-muted-foreground'
        }>
          Siyal: {data.signalStrength}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RSI */}
        <div className="flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium text-muted-foreground flex items-center cursor-help">
                  RSI (14) <Info className="w-3 h-3 ml-1 opacity-50" />
                </span>
              </TooltipTrigger>
              <TooltipContent><p>Relative Strength Index. &lt;30 achte, &gt;70 vann.</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge variant="outline" className={getRsiColor(data.rsi)}>
            {data.rsi?.toFixed(1) || '--'}
          </Badge>
        </div>

        {/* EMA */}
        <div className="flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium text-muted-foreground flex items-center cursor-help">
                  EMA Aliman <Info className="w-3 h-3 ml-1 opacity-50" />
                </span>
              </TooltipTrigger>
              <TooltipContent><p>Mwayèn mobil eksponansyèl (9/21/50/200).</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className={`flex items-center text-sm font-semibold tabular-nums ${emaAlign.color}`}>
            <emaAlign.icon className="w-4 h-4 mr-1" /> {emaAlign.text}
          </div>
        </div>

        {/* MACD */}
        <div className="flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium text-muted-foreground flex items-center cursor-help">
                  MACD Hist <Info className="w-3 h-3 ml-1 opacity-50" />
                </span>
              </TooltipTrigger>
              <TooltipContent><p>Momantòm tandans. Pozitif = Bullish.</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className={`text-sm font-semibold tabular-nums ${data.macdHistogram > 0 ? 'text-success' : 'text-danger'}`}>
            {data.macdHistogram > 0 ? '+' : ''}{data.macdHistogram?.toFixed(2) || '--'}
          </span>
        </div>
        
        {/* BB */}
        <div className="flex justify-between items-center pt-1 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Siyal Antre</span>
          {data.entrySignal ? (
            <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Aktif</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Pa gen</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const IndicatorVisualization = ({ analysisData }) => {
  // analysisData expects an array or object mapping timeframes
  const m15 = analysisData?.find(d => d.timeframe === '15m');
  const h4 = analysisData?.find(d => d.timeframe === '4h');
  const d1 = analysisData?.find(d => d.timeframe === '1D');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Analiz Milti-Tan</h3>
        <p className="text-sm text-muted-foreground">Endikatè teknik an tan reyèl sou plizyè peryòd.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IndicatorCard title="Kout Tèm (15m)" data={m15} />
        <IndicatorCard title="Mwayen Tèm (4h)" data={h4} />
        <IndicatorCard title="Long Tèm (1D)" data={d1} />
      </div>
    </div>
  );
};

export default IndicatorVisualization;