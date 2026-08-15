import React from 'react';
import './ViewStyles.css';

export default function PortfolioView() {
  const portfolio = {
    totalEquity: 108450,
    availableBalance: 50000,
    unrealizedPnL: 5230,
    assets: [
      { symbol: 'USD', amount: 50000, percentage: 46 },
      { symbol: 'BTC', amount: 35000, percentage: 32 },
      { symbol: 'ETH', amount: 18450, percentage: 17 },
      { symbol: 'USDC', amount: 5000, percentage: 5 },
    ],
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Portfolio</h1>
        <p>Asset allocation and performance overview</p>
      </div>

      <div className="portfolio-stats">
        <div className="stat-card">
          <h4>Total Equity</h4>
          <div className="stat-value">${portfolio.totalEquity.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h4>Available Balance</h4>
          <div className="stat-value">${portfolio.availableBalance.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h4>Unrealized P/L</h4>
          <div className="stat-value positive">+${portfolio.unrealizedPnL.toLocaleString()}</div>
        </div>
      </div>

      <div className="assets-section">
        <h3>Asset Allocation</h3>
        <div className="assets-list">
          {portfolio.assets.map((asset) => (
            <div key={asset.symbol} className="asset-item">
              <div className="asset-info">
                <span className="asset-symbol">{asset.symbol}</span>
                <span className="asset-amount">${asset.amount.toLocaleString()}</span>
              </div>
              <div className="asset-bar">
                <div className="asset-fill" style={{ width: `${asset.percentage}%` }} />
              </div>
              <span className="asset-percentage">{asset.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
