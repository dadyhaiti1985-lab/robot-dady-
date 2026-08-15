import React from 'react';
import './ViewStyles.css';

export default function EconomicCalendarView() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Economic Calendar</h1>
        <p>Upcoming economic events and high-impact data releases</p>
      </div>
      <div className="placeholder-content">
        <p style={{ fontSize: 48, marginBottom: 16 }}>📅</p>
        <p>Economic calendar coming soon</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>CPI, NFP, FOMC, and central bank events will appear here</p>
      </div>
    </div>
  );
}
