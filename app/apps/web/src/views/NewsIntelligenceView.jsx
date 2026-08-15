import React from 'react';
import './ViewStyles.css';

const NEWS = [
  { id: 1, title: 'Bitcoin consolidates above $67K as bulls defend key support level', source: 'CoinDesk', impact: 'HIGH', time: '2 min ago' },
  { id: 2, title: 'Federal Reserve signals potential rate pause in upcoming meeting', source: 'Bloomberg', impact: 'HIGH', time: '18 min ago' },
  { id: 3, title: 'Ethereum upgrade improves transaction throughput by 40%', source: 'The Block', impact: 'MEDIUM', time: '45 min ago' },
  { id: 4, title: 'Gold prices stabilize as USD weakens ahead of jobs data', source: 'Reuters', impact: 'MEDIUM', time: '1h ago' },
  { id: 5, title: 'New crypto regulatory framework proposed in EU parliament', source: 'CryptoNews', impact: 'LOW', time: '2h ago' },
];

export default function NewsIntelligenceView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>News Intelligence</h1>
        <p>AI-filtered market news ranked by trading impact</p>
      </div>

      <div className="news-list">
        {NEWS.map((item) => (
          <div key={item.id} className="news-card">
            <div className="news-header">
              <h3>{item.title}</h3>
              <span className={`impact-badge ${item.impact.toLowerCase()}`}>{item.impact}</span>
            </div>
            <p className="news-source">{item.source}</p>
            <p className="news-time">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
