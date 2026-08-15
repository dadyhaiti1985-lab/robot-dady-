import React from 'react';
import './ViewStyles.css';

export default function TradeHistoryView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Trade History</h1>
        <p>Complete history of all executed trades</p>
      </div>
      <div className="placeholder-content">
        <p style={{ fontSize: 48, marginBottom: 16 }}>📜</p>
        <p>Trade history loading...</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>All past trades with entry/exit prices, P/L, and timestamps</p>
      </div>
    </div>
  );
}
