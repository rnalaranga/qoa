import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { Calendar, Filter, Activity, Printer as PrinterIcon, AlertTriangle, Clock, Layers, X } from 'lucide-react';

const NEON_COLORS = ['#ff3b6b', '#ffb800', '#00d4ff', '#a855f7', '#ff6b35', '#00ff88'];

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-medium)',
      borderRadius: 10,
      padding: '0.75rem 1rem',
      fontSize: '0.78rem',
      boxShadow: 'var(--glass-shadow)',
    }}>
      <div style={{ color: 'rgba(0,212,255,0.7)', marginBottom: '0.4rem', fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: entry.color }} />
          <span style={{ color: '#718096' }}>{entry.name}:</span>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    errorTypes: [], printerErrors: [], timeSeries: [], recentErrors: [], allPrinters: []
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIp, setSelectedIp] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = 'http://153.75.225.81:5000/api/analytics/errors?';
      if (startDate && endDate) url += `startDate=${startDate}&endDate=${endDate}&`;
      if (selectedIp) url += `ip=${selectedIp}&`;
      const res = await axios.get(url);
      const formattedTimeSeries = res.data.timeSeries.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
      setAnalyticsData({ ...res.data, timeSeries: formattedTimeSeries });
    } catch (error) {
      console.error('Error fetching analytics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [startDate, endDate, selectedIp]);

  const handleClearFilters = () => { setStartDate(''); setEndDate(''); setSelectedIp(''); };
  const hasFilters = startDate || endDate || selectedIp;

  const summaryCards = analyticsData.summary ? [
    { label: 'Total Errors', value: analyticsData.summary.totalErrors?.toLocaleString(), icon: <AlertTriangle size={20} />, color: 'var(--neon-rose)', dim: 'var(--neon-rose-dim)' },
    { label: 'Pages Printed', value: analyticsData.summary.totalPrints?.toLocaleString(), icon: <PrinterIcon size={20} />, color: 'var(--neon-cyan)', dim: 'var(--neon-cyan-dim)' },
    { label: 'Toners Replaced', value: analyticsData.summary.tonersReplaced?.toLocaleString(), icon: <Layers size={20} />, color: 'var(--neon-amber)', dim: 'var(--neon-amber-dim)' },
  ] : [];

  const inputStyle = {
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
    border: '1px solid var(--border-medium)',
    outline: 'none',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    colorScheme: 'dark',
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Printer Analytics</h1>
          <p>Historical errors, usage trends, and individual printer performance.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          <Filter size={14} /> Filters
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PrinterIcon size={14} style={{ color: 'var(--text-muted)' }} />
          <select value={selectedIp} onChange={e => setSelectedIp(e.target.value)} style={inputStyle}>
            <option value="">All Printers</option>
            {analyticsData.allPrinters.map(p => (
              <option key={p.ip_address} value={p.ip_address}>
                {p.qoa_num || p.ip_address} {p.model ? `(${p.model})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
        </div>

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s' }}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {!loading && analyticsData.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {summaryCards.map((card, i) => (
            <div key={i} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: card.dim, border: `1px solid ${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.15rem' }}>{card.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-1px', lineHeight: 1 }}>{card.value ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-container" style={{ height: 300 }}>
          <div className="dot" style={{ width: 12, height: 12 }} />
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

            {/* Error Trends - full width */}
            <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Activity size={16} style={{ color: 'var(--neon-cyan)' }} />
                Error Trends Over Time
              </h3>
              {analyticsData.timeSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analyticsData.timeSeries} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 11 }} />
                    <RechartsTooltip content={<DarkTooltip />} />
                    <Line
                      type="monotone" dataKey="errors" stroke="#00d4ff" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#00d4ff', strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: '#00d4ff', stroke: 'rgba(0,212,255,0.3)', strokeWidth: 6 }}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.5))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ height: 200 }}>
                  <div className="empty-state-icon"><Activity size={26} /></div>
                  <h3>No trend data</h3>
                  <p>No error trends recorded for this period.</p>
                </div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="glass-panel">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <AlertTriangle size={16} style={{ color: 'var(--neon-amber)' }} />
                Error Breakdown
              </h3>
              {analyticsData.errorTypes.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analyticsData.errorTypes}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={4} dataKey="value"
                      >
                        {analyticsData.errorTypes.map((_, i) => (
                          <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} style={{ filter: `drop-shadow(0 0 4px ${NEON_COLORS[i % NEON_COLORS.length]}80)` }} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<DarkTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {analyticsData.errorTypes.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: NEON_COLORS[i % NEON_COLORS.length], boxShadow: `0 0 4px ${NEON_COLORS[i % NEON_COLORS.length]}` }} />
                        {item.name?.length > 22 ? `${item.name.substring(0, 22)}…` : item.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ height: 200 }}>
                  <div className="empty-state-icon"><AlertTriangle size={26} /></div>
                  <h3>No errors</h3>
                  <p>No errors recorded for this period.</p>
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="glass-panel">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <PrinterIcon size={16} style={{ color: 'var(--neon-rose)' }} />
                {selectedIp
                  ? `Logs — ${analyticsData.allPrinters.find(p => p.ip_address === selectedIp)?.qoa_num || selectedIp}`
                  : 'Top Error Printers'}
              </h3>
              {!selectedIp && analyticsData.printerErrors.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.printerErrors} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 11 }} />
                    <RechartsTooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="errorCount" fill="#ff3b6b" radius={[4, 4, 0, 0]}
                      style={{ filter: 'drop-shadow(0 0 4px rgba(255,59,107,0.4))' }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : selectedIp ? (
                <div className="empty-state" style={{ height: 200 }}>
                  <div className="empty-state-icon"><PrinterIcon size={26} /></div>
                  <h3>Individual view</h3>
                  <p>See the error log below for specifics on this printer.</p>
                </div>
              ) : (
                <div className="empty-state" style={{ height: 200 }}>
                  <div className="empty-state-icon"><PrinterIcon size={26} /></div>
                  <h3>No data</h3>
                  <p>No printer errors recorded for this period.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Error Log */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--neon-violet)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Error Event Log</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Printer (QOA)</th>
                    <th>Error Status</th>
                    <th>Toner Level</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.recentErrors.length > 0 ? analyticsData.recentErrors.map(error => {
                    const printerInfo = analyticsData.allPrinters.find(p => p.ip_address === error.ip_address);
                    const displayName = printerInfo?.qoa_num ? `${printerInfo.qoa_num} (${error.ip_address})` : error.ip_address;
                    return (
                      <tr key={error.id}>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(error.created_at).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{displayName}</td>
                        <td>
                          <span className="badge badge-rose">{error.error_status}</span>
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>
                          <span style={{ color: parseInt(error.toner_level) <= 10 ? 'var(--neon-rose)' : 'var(--text-secondary)' }}>
                            {error.toner_level}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No recent errors found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
