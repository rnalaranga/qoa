import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Monitor, Globe } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    pollingInterval: '10',
    criticalThreshold: '10',
    warningThreshold: '25',
    emailNotifications: true,
    notificationEmail: 'admin@qoa.com',
    language: 'English'
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Platform Settings</h1>
          <p>Configure fleet monitoring parameters and application preferences.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Sync Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-bright)' }}>
            <RefreshCw size={18} style={{ color: 'var(--neon-cyan)' }} />
            Data Synchronization
          </h3>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Live Polling Interval (Seconds)</label>
            <select name="pollingInterval" value={formData.pollingInterval} onChange={handleChange} className="form-select">
              <option value="5">Fast (5s) - High Network Load</option>
              <option value="10">Normal (10s) - Recommended</option>
              <option value="30">Slow (30s) - Low Network Load</option>
              <option value="60">Eco (60s)</option>
            </select>
          </div>
        </div>

        {/* Threshold Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-bright)' }}>
            <Monitor size={18} style={{ color: 'var(--neon-emerald)' }} />
            Threshold Configuration
          </h3>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Low Toner Warning Threshold (%)</label>
            <input type="number" name="warningThreshold" value={formData.warningThreshold} onChange={handleChange} className="form-input" min="1" max="99" />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Critical Toner Threshold (%)</label>
            <input type="number" name="criticalThreshold" value={formData.criticalThreshold} onChange={handleChange} className="form-input" min="1" max="50" />
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-bright)' }}>
            <Bell size={18} style={{ color: 'var(--neon-amber)' }} />
            Alerts & Notifications
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <input type="checkbox" name="emailNotifications" checked={formData.emailNotifications} onChange={handleChange} style={{ width: 18, height: 18, accentColor: 'var(--neon-cyan)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Enable Email Alerts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receive immediate emails for critical errors.</div>
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Admin Email Address</label>
            <input type="email" name="notificationEmail" value={formData.notificationEmail} onChange={handleChange} className="form-input" disabled={!formData.emailNotifications} />
          </div>
        </div>

        {/* Application Preferences */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-bright)' }}>
            <SettingsIcon size={18} style={{ color: 'var(--neon-violet)' }} />
            Application Preferences
          </h3>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Theme Mode</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                className={`tab-btn ${theme === 'dark' ? 'active' : ''}`} 
                onClick={theme !== 'dark' ? toggleTheme : undefined}
                style={{ flex: 1 }}
              >
                Dark Neon Galaxy
              </button>
              <button 
                type="button"
                className={`tab-btn ${theme === 'light' ? 'active' : ''}`} 
                onClick={theme !== 'light' ? toggleTheme : undefined}
                style={{ flex: 1 }}
              >
                Light Professional
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Language</label>
            <select name="language" value={formData.language} onChange={handleChange} className="form-select">
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
