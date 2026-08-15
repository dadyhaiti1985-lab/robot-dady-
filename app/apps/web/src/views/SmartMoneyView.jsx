import React from 'react';
import './ViewStyles.css';

export default function SmartMoneyView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Smart Money</h1>
        <p>Track institutional and whale wallet movements</p>
      </div>
      <div className="placeholder-content">
        <p style={{ fontSize: 48, marginBottom: 16 }}>🏦</p>
        <p>Institutional flow tracking coming soon</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>On-chain whale analytics and dark pool data will appear here</p>
      </div>
    </div>
  );
}
