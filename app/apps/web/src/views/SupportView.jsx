import React from 'react';
import './ViewStyles.css';

export default function SupportView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Support</h1>
        <p>Get help and connect with our support team</p>
      </div>

      <div className="support-content">
        <div className="support-card">
          <h3>Email Support</h3>
          <p>support@oracletrader.pro</p>
        </div>
        <div className="support-card">
          <h3>Live Chat</h3>
          <p>Available 24/7 via AI assistant</p>
        </div>
        <div className="support-card">
          <h3>Documentation</h3>
          <p>Setup guides and API reference</p>
        </div>
      </div>
    </div>
  );
}
