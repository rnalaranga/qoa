import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Printer, FileText, Download, Loader2 } from 'lucide-react';

const ReportModal = ({ printer, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.get(`http://153.75.225.81:5000/api/printers/${printer.ip_address}/report`, {
        params: { startDate, endDate }
      });
      setReportData(res.data);
    } catch (err) {
      setError('Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPrints = reportData.reduce((sum, day) => sum + parseInt(day.prints_taken || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content print-modal" style={{ maxWidth: 800, width: '90%' }} onClick={e => e.stopPropagation()}>
        
        {/* Header - Hidden on print */}
        <div className="modal-header hide-on-print">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--neon-cyan)' }} />
              Usage Report
            </h2>
            <p>{printer.model} · {printer.ip_address}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={17} /></button>
        </div>

        {/* Print Header - Only visible on print */}
        <div className="show-on-print" style={{ display: 'none', textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#000', margin: 0 }}>Printer Usage Report</h1>
          <p style={{ color: '#555', margin: '0.5rem 0' }}>{printer.model} ({printer.ip_address})</p>
          <p style={{ color: '#555' }}>Period: {startDate || 'N/A'} to {endDate || 'N/A'}</p>
        </div>

        <div className="modal-body">
          
          {/* Controls - Hidden on print */}
          <div className="hide-on-print" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', color: 'white', colorScheme: 'dark' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', color: 'white', colorScheme: 'dark' }}
              />
            </div>
            <button className="btn-primary" onClick={generateReport} disabled={loading} style={{ height: '38px', padding: '0 1.5rem', flex: '0 0 auto' }}>
              {loading ? <Loader2 size={16} className="spinner" /> : 'Generate'}
            </button>
            {reportData.length > 0 && (
              <button className="btn-ghost" onClick={handlePrint} style={{ height: '38px', color: 'var(--neon-emerald)', border: '1px solid var(--neon-emerald)', padding: '0 1.5rem' }}>
                <Printer size={16} style={{ marginRight: '0.5rem' }} /> Print
              </button>
            )}
          </div>

          {error && <div className="error-msg hide-on-print" style={{ marginBottom: '1rem' }}>{error}</div>}

          {/* Report Content */}
          {reportData.length > 0 && (
            <div className="report-content">
              {/* Summary */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }} className="print-summary">
                <div style={{
                  flex: 1, padding: '1rem',
                  background: 'var(--neon-cyan-dim)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: 8,
                  textAlign: 'center'
                }} className="print-box">
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }} className="print-label">Total Days</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neon-cyan)' }} className="print-value">{reportData.length}</div>
                </div>
                <div style={{
                  flex: 1, padding: '1rem',
                  background: 'var(--neon-violet-dim)',
                  border: '1px solid rgba(168,85,247,0.15)',
                  borderRadius: 8,
                  textAlign: 'center'
                }} className="print-box">
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }} className="print-label">Total Prints in Period</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neon-violet)' }} className="print-value">{totalPrints.toLocaleString()}</div>
                </div>
              </div>

              {/* Table */}
              <div className="table-wrapper print-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} className="print-table">
                  <thead style={{ background: 'var(--bg-table-header)', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-medium)' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-medium)' }}>Start Count</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-medium)' }}>End Count</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--neon-cyan)', borderBottom: '1px solid var(--border-medium)' }}>Prints Taken</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-medium)' }}>Avg Toner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((day, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-bright)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
                          {parseInt(day.start_count).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
                          {parseInt(day.end_count).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--neon-cyan)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
                          +{parseInt(day.prints_taken).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
                          {day.avg_toner}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && !error && reportData.length === 0 && (
            <div className="empty-state hide-on-print" style={{ padding: '3rem 0', textAlign: 'center' }}>
              <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>Select a date range and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
