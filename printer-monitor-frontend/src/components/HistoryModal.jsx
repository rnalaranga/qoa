import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { X, Loader2, Printer, TrendingDown, FileText } from 'lucide-react';
import GlassDialog from './GlassDialog';
import AnimatedPrinter from './AnimatedPrinter';
import { TonerGauge } from './PrinterCard';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const fullDate = payload[0]?.payload?.fullDate;
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 10,
        padding: '0.75rem 1rem',
        fontSize: '0.78rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ color: 'rgba(0,212,255,0.7)', marginBottom: '0.4rem', fontSize: '0.7rem' }}>{fullDate}</div>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.color }} />
            <span style={{ color: '#718096' }}>
              {entry.name === 'tonerLevelNumber' ? 'Toner Level' : 'Pages Printed'}:
            </span>
            <span style={{ color: '#e2e8f0', fontWeight: 700 }}>
              {entry.name === 'tonerLevelNumber' ? `${entry.value}%` : entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const HistoryModal = ({ printer, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    intent: 'danger',
    onConfirm: null
  });

  const confirmAction = (title, message, intent, onConfirm) => {
    setDialogState({ isOpen: true, type: 'confirm', title, message, intent, onConfirm });
  };
  
  const showAlert = (title, message, intent, then = null) => {
    setDialogState({ isOpen: true, type: 'alert', title, message, intent, onConfirm: () => {
      closeDialog();
      if(then) then();
    }});
  };
  
  const closeDialog = () => setDialogState(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/api/printers/${printer.ip_address}/history`);
        // Sort chronologically first
        const chronologicalHistory = [...response.data].reverse();
        
        const smartHistory = [];
        let lastValidPages = null;
        let lastValidToner = null;
        let lastValidTime = null;

        for (let log of chronologicalHistory) {
          const lpStr = String(log.pages_printed);
          const ltStr = String(log.toner_level);
          
          if (!lpStr || lpStr === 'null' || lpStr === 'NaN' || lpStr === '-') continue;
          if (!ltStr || ltStr === 'null' || ltStr === 'NaN' || ltStr === '-') continue;

          const pages = parseInt(lpStr);
          const toner = parseInt(ltStr.replace('%', ''));
          const currentTime = new Date(log.created_at).getTime();

          // Rule 1: Pages cannot drop or be 0
          if (isNaN(pages) || pages <= 0) continue;
          if (lastValidPages !== null && pages < lastValidPages) continue;

          // Rule 2: Toner anomaly detection
          if (isNaN(toner)) continue;
          
          let isTonerAnomaly = false;
          if (lastValidToner !== null && lastValidTime !== null) {
            const timeDiffHours = (currentTime - lastValidTime) / (1000 * 60 * 60);
            const tonerDrop = lastValidToner - toner;
            if (toner === 0 && lastValidToner > 10 && timeDiffHours < 24) isTonerAnomaly = true;
            if (tonerDrop > 30 && timeDiffHours < 6) isTonerAnomaly = true;
          }

          if (isTonerAnomaly) continue;

          lastValidPages = pages;
          lastValidToner = toner;
          lastValidTime = currentTime;

          smartHistory.push({
            ...log,
            tonerLevelNumber: toner,
            pagesPrinted: pages,
            timeLabel: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fullDate: new Date(log.created_at).toLocaleString()
          });
        }

        setData(smartHistory);
      } catch (err) {
        setError('Could not load printer history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [printer.ip_address]);

  useEffect(() => {
    const handleKeyDown = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Summary stats
  const latestToner = data.length > 0 ? data[data.length - 1]?.tonerLevelNumber : null;
  const totalPages = data.length > 0 ? data[data.length - 1]?.pagesPrinted : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={18} style={{ color: 'var(--neon-cyan)' }} />
              Toner & Usage History
            </h2>
            <p>{printer.model} · {printer.ip_address}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => {
                confirmAction(
                  'Clear Logs',
                  'Are you sure you want to clear ALL logs for this printer? This cannot be undone.',
                  'warning',
                  async () => {
                    closeDialog();
                    try {
                      await axios.delete(`/api/printers/${printer.ip_address}/logs`);
                      showAlert('Logs Cleared', 'The logs have been successfully cleared.', 'success', onClose);
                    } catch(e) { showAlert('Error', 'Failed to clear logs.', 'danger'); }
                  }
                );
              }}
              style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--neon-amber)', color: 'var(--neon-amber)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Clear Logs
            </button>
            <button
              onClick={() => {
                confirmAction(
                  'Delete Printer',
                  'Are you sure you want to completely DELETE this printer? It will be removed from all agents and dashboards.',
                  'danger',
                  async () => {
                    closeDialog();
                    try {
                      await axios.delete(`/api/printers/${printer.ip_address}`);
                      showAlert('Printer Deleted', 'The printer has been completely removed from the system.', 'success', onClose);
                    } catch(e) { showAlert('Error', 'Failed to delete printer.', 'danger'); }
                  }
                );
              }}
              style={{ padding: '6px 12px', background: 'rgba(255,59,107,0.1)', border: '1px solid var(--neon-rose)', color: 'var(--neon-rose)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Delete Printer
            </button>
            <button className="close-btn" onClick={onClose} style={{ marginLeft: '10px' }}><X size={17} /></button>
          </div>
        </div>

        <div className="modal-body">
          {/* Animated Printer Graphic */}
          <div style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
            <AnimatedPrinter printer={printer} />
          </div>

          {/* Summary chips */}
          {!loading && data.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                flex: 1, padding: '0.875rem 1rem',
                background: 'var(--neon-cyan-dim)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', position: 'absolute', top: '0.875rem', left: '1rem' }}>Current Toner</div>
                <div style={{ transform: 'scale(1.2)', marginTop: '1rem' }}>
                  <TonerGauge 
                    tonerStr={printer.toner_level} 
                    color="var(--neon-cyan)" 
                    isOffline={printer.printer_status === 'Offline' || printer.is_stale} 
                  />
                </div>
              </div>
              <div style={{
                flex: 1, padding: '0.875rem 1rem',
                background: 'var(--neon-violet-dim)',
                border: '1px solid rgba(168,85,247,0.15)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}>
                <FileText size={20} style={{ color: 'var(--neon-violet)' }} />
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Total Pages</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--neon-violet)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {totalPages?.toLocaleString() || '—'}
                  </div>
                </div>
              </div>
              <div style={{
                flex: 1, padding: '0.875rem 1rem',
                background: 'var(--neon-emerald-dim)',
                border: '1px solid rgba(0,255,136,0.12)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: '0.75rem'
              }}>
                <div style={{ fontSize: '1.2rem' }}>📊</div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Data Points</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--neon-emerald)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {data.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <Loader2 className="spinner" size={30} />
              <p>Loading historical data...</p>
            </div>
          ) : error ? (
            <div className="error-msg">{error}</div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FileText size={26} /></div>
              <h3>No history yet</h3>
              <p>Historical data will appear after the first sync cycle.</p>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorToner" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="timeLabel"
                    stroke="rgba(255,255,255,0.1)"
                    tick={{ fill: '#4a5568', fontSize: 11 }}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="rgba(255,255,255,0.05)"
                    tick={{ fill: '#4a5568', fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="rgba(255,255,255,0.05)"
                    tick={{ fill: '#4a5568', fontSize: 11 }}
                    domain={['dataMin - 10', 'dataMax + 10']}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="tonerLevelNumber"
                    stroke="#00d4ff"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorToner)"
                    dot={false}
                    name="tonerLevelNumber"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.5))' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pagesPrinted"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    name="pagesPrinted"
                    strokeDasharray="6 3"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.5))' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 20, height: 3, background: '#00d4ff', borderRadius: 2, boxShadow: '0 0 6px #00d4ff' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toner Level (%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 20, height: 2, background: '#a855f7', borderRadius: 2, boxShadow: '0 0 6px #a855f7' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pages Printed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <GlassDialog {...dialogState} onCancel={closeDialog} />
    </div>
  );
};

export default HistoryModal;
