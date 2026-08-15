import React from 'react';
import './ViewStyles.css';

const WATCHLIST = [
  { symbol: 'BTC/USD', price: 67200, change: 2.34 },
  { symbol: 'ETH/USD', price: 3450, change: 1.82 },
  { symbol: 'SOL/USD', price: 178.5, change: 4.21 },
  { symbol: 'XAU/USD', price: 2315, change: 0.45 },
  { symbol: 'EUR/USD', price: 1.0845, change: 0.12 },
  { symbol: 'BNB/USD', price: 542, change: -0.75 },
];

export default function WatchlistView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Watchlist</h1>
        <p>Monitor your favorite assets at a glance</p>
      </div>

      <div className="watchlist-grid">
        {WATCHLIST.map((item) => (
          <div key={item.symbol} className="watchlist-card">
            <h3>{item.symbol}</h3>
            <div className="price">{item.price.toLocaleString()}</div>
            <div className={`change ${item.change >= 0 ? 'positive' : 'negative'}`}>
              {item.change >= 0 ? '+' : ''}{item.change}%
            </div>
            <button className="btn-small" onClick={() => { window.location.hash = `trading?pair=${encodeURIComponent(item.symbol)}`; }}>Trade</button>
          </div>
        ))}
      </div>
    </div>
  );
}
