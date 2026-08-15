import React from 'react';
import './ViewStyles.css';

export default function AnalyticsView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Analytics</h1>
        <p>Detailed performance analytics, win rates, and trading statistics</p>
      </div>
      <div className="placeholder-content">
        <p style={{ fontSize: 48, marginBottom: 16 }}>📉</p>
        <p>Advanced analytics dashboard coming soon</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>Sharpe ratio, drawdown, win/loss ratios, and strategy backtesting</p>
      </div>
    </div>
  );
}
