import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AIInsights = () => {
  const [insights, setInsights] = useState([
    {
      asset: 'BTC',
      recommendation: 'Achte',
      confidence: 78,
      reason: 'EMA kwaze pozitif, RSI nan zòn achte'
    },
    {
      asset: 'ETH',
      recommendation: 'Rete Konsa',
      confidence: 62,
      reason: 'Volatilite wo, tann konfirmasyon'
    },
    {
      asset: 'SOL',
      recommendation: 'Vann',
      confidence: 71,
      reason: 'RSI nan zòn sivann, MACD negatif'
    }
  ]);

  const getRecommendationColor = (rec) => {
    if (rec === 'Achte') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (rec === 'Vann') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  };

  const getRecommendationIcon = (rec) => {
    if (rec === 'Achte') return <TrendingUp className="w-4 h-4" />;
    if (rec === 'Vann') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <span>Rekòmandasyon AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="p-3 rounded-lg border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg">{insight.asset}</span>
                <Badge variant="outline" className={getRecommendationColor(insight.recommendation)}>
                  <span className="flex items-center space-x-1">
                    {getRecommendationIcon(insight.recommendation)}
                    <span>{insight.recommendation}</span>
                  </span>
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">{insight.confidence}% konfyans</span>
            </div>
            <p className="text-sm text-muted-foreground">{insight.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIInsights;