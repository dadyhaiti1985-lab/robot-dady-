import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewStyles.css';

export default function SettingsView() {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Settings</h1>
        <p>Configure your trading preferences and API credentials</p>
      </div>

      <div className="settings-form">
        <div className="form-group">
          <label>API Credentials</label>
          <button className="btn-primary" onClick={() => navigate('/oracle-trader-pro/setup')}>
            Manage API Keys
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="settings-notifications">Notifications</label>
          <div>
            <input id="settings-notifications" name="settings-notifications" type="checkbox" defaultChecked />
            <span style={{ color: '#8899AA', fontSize: 14 }}>Enable trade signal notifications</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="settings-theme">Theme</label>
          <select id="settings-theme" name="settings-theme">
            <option value="dark">Dark Mode</option>
            <option value="light">Light Mode</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="settings-risk">Default Risk Per Trade</label>
          <select id="settings-risk" name="settings-risk">
            <option value="1">1%</option>
            <option value="2">2%</option>
            <option value="3">3%</option>
          </select>
        </div>
      </div>
    </div>
  );
}
