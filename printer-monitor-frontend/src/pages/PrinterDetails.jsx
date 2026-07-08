import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Activity, Wrench, ShieldAlert, Cpu, Settings, Thermometer, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ReportModal from '../components/ReportModal';
import TonerBar from '../components/TonerBar';

const getStatusStyle = (printer) => {
  if (!printer) return { color: 'var(--neon-emerald)', label: 'Loading', cls: 'badge-emerald' };
  
  const hasSpecificError = printer.error_status && !['-', 'OK', 'None', '', '0', 'null', 'undefined', 'Normal', 'Ready'].includes(String(printer.error_status).trim());

  if (printer.printer_status === 'Printing' || printer.printer_status === 'Warmup')
    return { color: 'var(--neon-violet)', label: printer.printer_status, cls: 'badge-violet' };
  
  if (hasSpecificError)
    return { color: 'var(--neon-rose)', label: 'Error', cls: 'badge-rose' };

  if (printer.printer_status === 'Stopped' || printer.printer_status === 'Offline')
    return { color: 'var(--neon-rose)', label: printer.printer_status, cls: 'badge-rose' };
    
  if (printer.printer_status === 'Warning')
    return { color: 'var(--neon-amber)', label: 'Warning', cls: 'badge-amber' };

  return { color: 'var(--neon-emerald)', label: 'OK', cls: 'badge-emerald' };
};

const PrinterDetails = () => {
  const { ip } = useParams();
  const navigate = useNavigate();
  const [printer, setPrinter] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchPrinterAndHistory = async () => {
      try {
        const [printerRes, historyRes] = await Promise.all([
          axios.get('/api/printers'),
          axios.get(`/api/printers/${ip}/history`)
        ]);
        
        const found = printerRes.data.find(p => p.ip_address === ip);
        setPrinter(found);

        // Sort chronologically first (oldest to newest)
        const chronologicalHistory = [...(historyRes.data || [])].reverse();
        
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

          // Rule 1: Pages cannot be 0 or NaN. Pages theoretically never decrease.
          if (isNaN(pages) || pages <= 0) continue;
          if (lastValidPages !== null && pages < lastValidPages) {
            // Anomaly: Pages dropped. Skip this reading.
            continue;
          }

          // Rule 2: Toner cannot drop to 0 or drop drastically in a very short time from a high level.
          if (isNaN(toner)) continue;
          
          let isTonerAnomaly = false;
          if (lastValidToner !== null && lastValidTime !== null) {
            const timeDiffHours = (currentTime - lastValidTime) / (1000 * 60 * 60);
            const tonerDrop = lastValidToner - toner;
            
            // If toner drops to 0 from >10% in less than 24h, it's likely a scraper offline anomaly
            if (toner === 0 && lastValidToner > 10 && timeDiffHours < 24) {
              isTonerAnomaly = true;
            }
            // If toner drops by more than 30% in less than 6 hours, it's suspicious
            if (tonerDrop > 30 && timeDiffHours < 6) {
              isTonerAnomaly = true;
            }
          }

          if (isTonerAnomaly) continue;

          lastValidPages = pages;
          lastValidToner = toner;
          lastValidTime = currentTime;

          smartHistory.push(log);
        }

        const formattedHistory = smartHistory.map(log => {
          const date = new Date(log.created_at);
          return {
            day: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            pages: parseInt(log.pages_printed) || 0,
            toner: parseInt(log.toner_level) || 0,
            rawDate: date
          };
        });

        setHistory(formattedHistory);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrinterAndHistory();
  }, [ip]);

  if (loading) {
    return <div className="page-container"><p>Loading printer details...</p></div>;
  }

  if (!printer) {
    return <div className="page-container"><p>Printer not found.</p></div>;
  }

  const { cls, label, color } = getStatusStyle(printer);
  const hasSpecificError = printer.error_status && !['-', 'OK', 'None', '', '0', 'null', 'undefined', 'Normal', 'Ready'].includes(String(printer.error_status).trim());
  const isCritical = printer.printer_status === 'Stopped' || printer.printer_status === 'Offline';

  // Using real data from backend
  const printHistoryData = history.length > 0 ? history : [];

  return (
    <div className="page-container" style={{ paddingBottom: '4rem' }}>
      {/* Top Header with Back button */}
      <div className="hide-on-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="icon-btn" onClick={() => navigate(-1)} style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-input)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)' }}>{printer.qoa_num || printer.ip_address}</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{printer.model} · {printer.ip_address}</p>
          {(hasSpecificError || isCritical) && (
             <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--neon-rose)', fontWeight: 600, background: 'var(--neon-rose-dim)', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,59,107,0.2)' }}>
                <AlertTriangle size={14} />
                {hasSpecificError ? printer.error_status : 'Printer Offline'}
             </div>
          )}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className={`badge ${cls}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{label}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column (Main Content) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Stats Banner */}
          <div className="glass-panel" style={{ display: 'flex', padding: 0, overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '1.5rem', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Pages</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>
                {printer.pages_printed && !isNaN(parseInt(printer.pages_printed)) ? parseInt(printer.pages_printed).toLocaleString() : '—'}
              </span>
            </div>
            <div style={{ flex: 1, padding: '1.5rem', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Toner Level</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TonerBar tonerLevelStr={printer.toner_level} isOffline={isCritical} />
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-bright)' }}>
              <Activity size={18} style={{ color: 'var(--neon-violet)' }} />
              Toner & Usage History
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={printHistoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--neon-violet)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--neon-violet)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={(v) => v.toLocaleString()} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--neon-amber)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '8px' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="pages" name="Pages Printed" stroke="var(--neon-violet)" strokeWidth={3} fillOpacity={1} fill="url(#colorPages)" />
                  <Line yAxisId="right" type="stepAfter" dataKey="toner" name="Toner Level %" stroke="var(--neon-amber)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column (Side Panel) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            {printer.error_status && printer.error_status !== 'OK' && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--neon-rose)' }} />
            )}
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-bright)' }}>
              <ShieldAlert size={18} style={{ color: printer.error_status && printer.error_status !== 'OK' ? 'var(--neon-rose)' : 'var(--neon-emerald)' }} />
              Diagnostics
            </h3>
            
            {printer.error_status && printer.error_status !== 'OK' ? (
              <div style={{ padding: '1rem', background: 'var(--neon-rose-dim)', border: '1px solid rgba(255,59,107,0.2)', borderRadius: '8px', color: 'var(--neon-rose)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                {printer.error_status}
              </div>
            ) : (
              <div style={{ padding: '1rem', background: 'var(--neon-emerald-dim)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '8px', color: 'var(--neon-emerald)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <ShieldAlert size={16} />
                No active errors detected.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>IP Address</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{printer.ip_address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>MAC Address</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{printer.mac_address || 'Unknown'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>System Uptime</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{printer.uptime || 'Unknown'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Drum Life</span>
                <span style={{ color: printer.drum_level && parseInt(printer.drum_level) <= 10 ? 'var(--neon-rose)' : 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                  {printer.drum_level || 'N/A'}
                </span>
              </div>
              
              {/* Paper Trays */}
              {printer.tray_levels && (
                <div style={{ marginTop: '0.5rem', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Paper Trays</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {JSON.parse(printer.tray_levels).tray1 !== undefined && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Tray 1</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{JSON.parse(printer.tray_levels).tray1}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: JSON.parse(printer.tray_levels).tray1 <= 0 ? 'var(--neon-rose)' : 'var(--neon-cyan)', width: `${JSON.parse(printer.tray_levels).tray1}%` }} />
                        </div>
                      </div>
                    )}
                    {JSON.parse(printer.tray_levels).tray2 !== undefined && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Tray 2</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{JSON.parse(printer.tray_levels).tray2}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: JSON.parse(printer.tray_levels).tray2 <= 0 ? 'var(--neon-rose)' : 'var(--neon-emerald)', width: `${JSON.parse(printer.tray_levels).tray2}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-bright)' }}>
              <Settings size={18} style={{ color: 'var(--neon-amber)' }} />
              Remote Actions
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {/* Tile 1: Usage Report */}
              <button 
                className="action-tile"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                onClick={() => setShowReportModal(true)}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--neon-cyan)'; e.currentTarget.style.background = 'var(--neon-cyan-dim)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
              >
                <div style={{ padding: '0.5rem', background: 'rgba(0,212,255,0.1)', borderRadius: '8px', marginBottom: '0.75rem', color: 'var(--neon-cyan)' }}>
                  <FileText size={18} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-bright)' }}>Usage Report</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Generate PDF</div>
              </button>

              {/* Tile 2: Full Calendar */}
              <button 
                className="action-tile"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                onClick={() => navigate(`/printer/${ip}/calendar`)}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--neon-violet)'; e.currentTarget.style.background = 'var(--neon-violet-dim)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
              >
                <div style={{ padding: '0.5rem', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', marginBottom: '0.75rem', color: 'var(--neon-violet)' }}>
                  <Calendar size={18} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-bright)' }}>Full Calendar</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Day-by-Day Grid</div>
              </button>

              {/* Tile 3: Ping Device */}
              <button 
                className="action-tile"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                onClick={() => alert('Ping sent')}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--neon-emerald)'; e.currentTarget.style.background = 'var(--neon-emerald-dim)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
              >
                <div style={{ padding: '0.5rem', background: 'rgba(0,255,136,0.1)', borderRadius: '8px', marginBottom: '0.75rem', color: 'var(--neon-emerald)' }}>
                  <Activity size={18} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-bright)' }}>Ping Device</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Check Network</div>
              </button>

              {/* Tile 4: Restart Spooler */}
              <button 
                className="action-tile"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                onClick={() => alert('Restart initiated')}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--neon-rose)'; e.currentTarget.style.background = 'var(--neon-rose-dim)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
              >
                <div style={{ padding: '0.5rem', background: 'rgba(255,59,107,0.1)', borderRadius: '8px', marginBottom: '0.75rem', color: 'var(--neon-rose)' }}>
                  <Cpu size={18} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-bright)' }}>Restart Spooler</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Clear Queue</div>
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {showReportModal && (
        <ReportModal 
          printer={printer} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};

export default PrinterDetails;
