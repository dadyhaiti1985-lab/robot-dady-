import React, { useState } from 'react';
import './ViewStyles.css';

const MARKETS = [
  { symbol: 'BTC/USD', price: 67200, change24h: 2.34, volume: '28.5B' },
  { symbol: 'ETH/USD', price: 3450, change24h: 1.82, volume: '14.2B' },
  { symbol: 'XRP/USD', price: 0.625, change24h: -0.93, volume: '3.1B' },
  { symbol: 'SOL/USD', price: 178.5, change24h: 4.21, volume: '5.8B' },
  { symbol: 'BNB/USD', price: 542, change24h: 0.75, volume: '2.4B' },
  { symbol: 'ADA/USD', price: 0.488, change24h: -1.12, volume: '1.2B' },
  { symbol: 'EUR/USD', price: 1.0845, change24h: 0.12, volume: '89.3B' },
  { symbol: 'XAU/USD', price: 2315, change24h: 0.45, volume: '12.1B' },
];

export default function MarketsView() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MARKETS.filter((m) =>
    m.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Markets</h1>
        <p>Live crypto, forex, and commodity market data</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          id="markets-search"
          name="markets-search"
          placeholder="Search markets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="markets-table">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>Volume</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((market) => (
              <tr key={market.symbol}>
                <td className="symbol">{market.symbol}</td>
                <td className="price">{market.price.toLocaleString()}</td>
                <td className={`change ${market.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {market.change24h >= 0 ? '+' : ''}{market.change24h}%
                </td>
                <td>${market.volume}</td>
                <td><button className="btn-small" onClick={() => { window.location.hash = `trading?pair=${encodeURIComponent(market.symbol)}`; }}>Trade</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
