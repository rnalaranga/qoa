import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Server, Activity, ArrowRight, Printer, AlertTriangle, ShieldCheck, Download, RefreshCw } from 'lucide-react';

const getPrinterState = (p) => {
  if (p.online_status === 'Removed' || p.is_stale || p.printer_status === 'Offline') return 'Offline';
  
  const isTonerError = p.toner_level === 'Insert Toner' || p.toner_level === 'Replace Toner';
  const hasSpecificError = p.error_status && !['-', 'OK', 'None', '', '0', 'null', 'undefined', 'Normal', 'Ready'].includes(String(p.error_status).trim());
  const isMaintenance = hasSpecificError && String(p.error_status).toLowerCase().includes('maintenance');

  if (hasSpecificError || p.printer_status === 'Stopped' || p.printer_status === 'Error' || p.printer_status === 'Warning' || isTonerError) {
    if (isMaintenance) return 'Warning';
    return 'Error';
  }
  if (p.printer_status === 'Printing' || p.printer_status === 'Warmup') return 'Printing';
  return 'Online';
};

const getStatusStyle = (state) => {
  if (state === 'Offline') return { color: '#94a3b8', label: 'Offline', cls: 'badge-gray' };
  if (state === 'Error') return { color: 'var(--neon-rose)', label: 'Error', cls: 'badge-rose' };
  if (state === 'Warning') return { color: 'var(--neon-amber)', label: 'Warning', cls: 'badge-amber' };
  if (state === 'Printing') return { color: 'var(--neon-violet)', label: 'Printing', cls: 'badge-violet' };
  return { color: 'var(--neon-emerald)', label: 'OK', cls: 'badge-emerald' };
};

// Mock data generator for telemetry
const generateTelemetry = (ip) => {
  const hash = ip.split('.').reduce((acc, val) => acc + parseInt(val), 0);
  const firmwareVersions = ['v2.4.1', 'v2.5.0', 'v2.6.2-beta', 'v1.9.8'];
  const fwIndex = hash % firmwareVersions.length;
  
  return {
    mac: `00:1A:2B:${ip.split('.').slice(2).map(n => parseInt(n).toString(16).padStart(2, '0')).join(':').toUpperCase()}`,
    firmware: firmwareVersions[fwIndex],
    uptime: `${Math.floor((hash * 13) % 90) + 1}d ${Math.floor((hash * 7) % 24)}h`,
    temp: `${Math.floor((hash * 3) % 15) + 35}°C`
  };
};

import { useNavigate } from 'react-router-dom';

const FleetStatus = () => {
  const navigate = useNavigate();
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrinters = async () => {
    try {
      const res = await axios.get('/api/printers');
      const enhancedPrinters = res.data.map(p => ({
        ...p,
        ...generateTelemetry(p.ip_address)
      }));
      setPrinters(enhancedPrinters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
    const int = setInterval(fetchPrinters, 10000);
    return () => clearInterval(int);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPrinters();
  };

  const handleAction = (action, ip) => {
    alert(`Mock Action: ${action} triggered for ${ip}`);
  };

  const filtered = printers.filter(p => 
    p.ip_address.includes(searchTerm) || 
    (p.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.qoa_num || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Global Fleet Status</h1>
          <p>Technical overview and telemetry for all network devices.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button className="btn-primary">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by IP, Model, or QOA number..."
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-ghost">
          <Filter size={15} /> Filter
        </button>
      </div>

      {/* Data Grid */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-container" style={{ height: 300 }}>
            <div className="dot" style={{ width: 12, height: 12 }} />
            <p>Scanning network...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Device / Network</th>
                  <th>Telemetry</th>
                  <th>Consumables</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const state = getPrinterState(p);
                  const { cls, label, color } = getStatusStyle(state);
                  const tonerNum = parseInt(p.toner_level?.replace('%', '')) || 0;
                  const isTonerError = p.toner_level === 'Insert Toner' || p.toner_level === 'Replace Toner';
                  const tonerColor = isTonerError || tonerNum <= 10 ? 'var(--neon-rose)' : tonerNum <= 25 ? 'var(--neon-amber)' : 'var(--neon-emerald)';
                  const isOffline = state === 'Offline';
                  const isError = state === 'Error';

                  return (
                    <tr key={p.ip_address} style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: label === 'OK' ? 'transparent' : color + '0D' }}>
                      {/* Device / Network */}
                      <td style={{ padding: '1.25rem 1.5rem', borderLeft: (label === 'Offline' || label === 'Warning' || label === 'Error') ? `2px solid ${color}` : '2px solid transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                            <Printer size={18} style={{ color: 'var(--neon-cyan)' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-bright)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem' }}>
                              {p.qoa_num || 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Server size={12} /> {p.ip_address} • {p.mac}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Telemetry */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ShieldCheck size={13} style={{ color: 'var(--neon-emerald)' }} />
                            FW: {p.firmware}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Activity size={13} style={{ color: 'var(--neon-cyan)' }} />
                            Up: {p.uptime}
                          </div>
                        </div>
                      </td>

                      {/* Consumables */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                          <div style={{ width: 60, height: 5, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${isTonerError ? 0 : tonerNum}%`, height: '100%', background: tonerColor, borderRadius: 99, boxShadow: `0 0 6px ${tonerColor}` }} />
                          </div>
                          <span style={{ color: tonerColor, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            {isTonerError ? 'ERR' : `${tonerNum}%`}
                            {isOffline && <AlertTriangle size={11} style={{ color: 'var(--neon-amber)' }} title="Last known reading (Offline)" />}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isOffline ? 'var(--text-muted)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          Pages: {p.pages_printed && !isNaN(parseInt(p.pages_printed)) ? parseInt(p.pages_printed).toLocaleString() : '—'}
                          {isOffline && <AlertTriangle size={10} style={{ color: 'var(--neon-amber)' }} title="Last known reading (Offline)" />}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <span className={`badge ${cls}`}>{label}</span>
                          {p.is_stale ? (
                            <div style={{ fontSize: '0.7rem', color: 'var(--neon-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <AlertTriangle size={10} /> Agent Not Running
                            </div>
                          ) : p.error_status && p.error_status !== 'OK' && p.error_status !== 'None' ? (
                            <div style={{ fontSize: '0.7rem', color: (state === 'Warning' ? 'var(--neon-amber)' : 'var(--neon-rose)'), fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <AlertTriangle size={10} /> {p.error_status}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button 
                            className="icon-btn" 
                            title="View Details" 
                            onClick={() => navigate(`/printer/${p.ip_address}`)}
                          >
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FleetStatus;
