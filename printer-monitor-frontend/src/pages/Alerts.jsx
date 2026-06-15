import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Bell, CheckCircle2, ShieldAlert, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/printers');
      const printers = res.data;
      
      // Generate alerts based on printer status
      let currentAlerts = [];
      printers.forEach((p, idx) => {
        // Mock a timestamp based on printer index for demonstration
        const baseDate = new Date();
        baseDate.setHours(baseDate.getHours() - (idx % 24));
        baseDate.setMinutes(baseDate.getMinutes() - (idx * 15 % 60));

        if (p.printer_status === 'Stopped' || p.printer_status === 'Offline') {
          currentAlerts.push({
            id: `crit-${p.ip_address}`,
            type: 'critical',
            printer: p.ip_address,
            model: p.model,
            message: `Printer is currently ${p.printer_status.toUpperCase()}. Immediate attention required.`,
            timestamp: baseDate.toISOString(),
            status: 'active'
          });
        }
        
        if (p.error_status && p.error_status !== 'OK') {
          currentAlerts.push({
            id: `err-${p.ip_address}`,
            type: 'warning',
            printer: p.ip_address,
            model: p.model,
            message: p.error_status,
            timestamp: baseDate.toISOString(),
            status: 'active'
          });
        }

        const tonerNum = parseInt(p.toner_level?.replace('%', '')) || 0;
        if (tonerNum <= 15 || p.toner_level === 'Replace Toner') {
          currentAlerts.push({
            id: `toner-${p.ip_address}`,
            type: 'warning',
            printer: p.ip_address,
            model: p.model,
            message: `Low Toner Level detected: ${p.toner_level}`,
            timestamp: baseDate.toISOString(),
            status: 'active'
          });
        }
      });

      // Sort by newest first
      currentAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(currentAlerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getAlertIcon = (type) => {
    if (type === 'critical') return <ShieldAlert size={20} style={{ color: 'var(--neon-rose)' }} />;
    return <AlertTriangle size={20} style={{ color: 'var(--neon-amber)' }} />;
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Alerts & Notifications</h1>
          <p>Manage and resolve network-wide fleet issues.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={() => setAlerts([])}>
            <CheckCircle2 size={15} /> Resolve All
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-container" style={{ height: 200 }}>
            <div className="dot" style={{ width: 12, height: 12 }} />
            <p>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state" style={{ height: 300 }}>
            <div className="empty-state-icon" style={{ background: 'var(--neon-emerald-dim)', color: 'var(--neon-emerald)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3>All Clear!</h3>
            <p>There are no active alerts or warnings across your fleet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  background: alert.type === 'critical' ? 'var(--neon-rose-dim)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ 
                  width: 44, height: 44, borderRadius: 12, 
                  background: alert.type === 'critical' ? 'rgba(255,59,107,0.1)' : 'var(--neon-amber-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  border: `1px solid ${alert.type === 'critical' ? 'rgba(255,59,107,0.2)' : 'rgba(255,184,0,0.2)'}`
                }}>
                  {getAlertIcon(alert.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '1rem' }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={12} />
                      {formatTime(alert.timestamp)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    Affected Device: <span style={{ color: 'var(--neon-cyan)' }}>{alert.printer}</span> ({alert.model})
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleResolve(alert.id)}>
                      Acknowledge
                    </button>
                    <button className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => navigate(`/printer/${alert.printer}`)}>
                      View Details <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
