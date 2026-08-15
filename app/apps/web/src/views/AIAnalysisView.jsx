import React from 'react';
import './ViewStyles.css';

export default function AIAnalysisView() {
  const analysis = {
    rsi: 65,
    ema9: 66850,
    ema21: 65200,
    macd: 'BULLISH',
    trend: 'UPTREND',
    support: 65800,
    resistance: 68500,
    bbUpper: 69200,
    bbMiddle: 67200,
    bbLower: 65200,
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>AI Analysis</h1>
        <p>Technical analysis and indicator breakdown for BTC/USD</p>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card">
          <h3>RSI (14)</h3>
          <div className="metric-value">{analysis.rsi}</div>
          <p className="metric-status" style={{ color: '#fbbf24' }}>Approaching Overbought</p>
        </div>

        <div className="analysis-card">
          <h3>EMA 9</h3>
          <div className="metric-value">${analysis.ema9.toLocaleString()}</div>
          <p className="metric-status" style={{ color: '#10b981' }}>Price above EMA</p>
        </div>

        <div className="analysis-card">
          <h3>EMA 21</h3>
          <div className="metric-value">${analysis.ema21.toLocaleString()}</div>
          <p className="metric-status" style={{ color: '#10b981' }}>Bullish crossover</p>
        </div>

        <div className="analysis-card">
          <h3>MACD</h3>
          <div className="metric-value" style={{ color: '#10b981' }}>{analysis.macd}</div>
          <p className="metric-status">Positive momentum</p>
        </div>

        <div className="analysis-card">
          <h3>Bollinger Bands</h3>
          <div className="metric-details">
            <p style={{ color: '#ef4444' }}>Upper: ${analysis.bbUpper.toLocaleString()}</p>
            <p>Middle: ${analysis.bbMiddle.toLocaleString()}</p>
            <p style={{ color: '#10b981' }}>Lower: ${analysis.bbLower.toLocaleString()}</p>
          </div>
        </div>

        <div className="analysis-card">
          <h3>Support &amp; Resistance</h3>
          <div className="metric-details">
            <p style={{ color: '#10b981' }}>Support: ${analysis.support.toLocaleString()}</p>
            <p style={{ color: '#ef4444' }}>Resistance: ${analysis.resistance.toLocaleString()}</p>
          </div>
        </div>

        <div className="analysis-card">
          <h3>Overall Trend</h3>
          <div className="metric-value" style={{ color: '#10b981', fontSize: 20 }}>{analysis.trend}</div>
          <p className="metric-status">Strong bullish structure</p>
        </div>
      </div>
    </div>
  );
}
