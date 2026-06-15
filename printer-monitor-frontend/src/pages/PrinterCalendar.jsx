import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle, FileText } from 'lucide-react';

const PrinterCalendar = () => {
  const { ip } = useParams();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        // Fetch data from 1st of month to last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const startStr = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
        const endStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

        const res = await axios.get(`http://153.75.225.81:5000/api/printers/${ip}/report`, {
          params: { startDate: startStr, endDate: endStr }
        });
        setReportData(res.data);
      } catch (err) {
        console.error('Failed to load calendar data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthData();
  }, [ip, year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Create array of days to render
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  // Map data to specific days
  const getDayData = (day) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reportData.find(d => {
      // API date format is ISO or "YYYY-MM-DD"
      const apiDateStr = new Date(d.date).toISOString().split('T')[0];
      return apiDateStr === targetDateStr;
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate(`/printer/${ip}`)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="dashboard-title">Printer Calendar</h1>
            <div className="dashboard-subtitle">{ip}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          <button className="icon-btn" onClick={prevMonth} style={{ width: 32, height: 32 }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, width: '140px', textAlign: 'center', color: 'var(--text-bright)' }}>
            {monthNames[month]} {year}
          </div>
          <button className="icon-btn" onClick={nextMonth} style={{ width: 32, height: 32 }} disabled={new Date() < new Date(year, month + 1, 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        {/* Days of week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem', flex: 1 }}>
          {/* Blanks for days before 1st of month */}
          {blanks.map(b => (
            <div key={`blank-${b}`} style={{ background: 'transparent', border: '1px dashed var(--border-subtle)', borderRadius: '12px', opacity: 0.3 }} />
          ))}

          {/* Actual days */}
          {days.map(day => {
            const data = getDayData(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            return (
              <div 
                key={day} 
                style={{ 
                  background: 'var(--bg-input)', 
                  border: isToday ? '1.5px solid var(--neon-cyan)' : '1px solid var(--border-medium)', 
                  borderRadius: '12px', 
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  boxShadow: isToday ? '0 0 15px rgba(0,212,255,0.1)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isToday ? 'var(--neon-cyan)' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {day}
                </div>
                
                {data ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, justifyContent: 'flex-end' }}>
                    {/* Pages Taken */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--neon-violet)', fontWeight: 600, background: 'var(--neon-violet-dim)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      <FileText size={12} />
                      +{parseInt(data.prints_taken).toLocaleString()} pages
                    </div>
                    
                    {/* Toner Level */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: 600, background: 'var(--neon-cyan-dim)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '2px', border: '1px solid currentColor', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${data.avg_toner}%`, background: 'currentColor' }} />
                      </div>
                      {data.avg_toner}% Toner
                    </div>

                    {/* Errors */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', 
                      color: parseInt(data.error_count || 0) > 0 ? 'var(--neon-rose)' : 'var(--text-muted)', 
                      fontWeight: 600, 
                      background: parseInt(data.error_count || 0) > 0 ? 'var(--neon-rose-dim)' : 'rgba(255,255,255,0.03)', 
                      padding: '0.2rem 0.4rem', borderRadius: '4px' 
                    }}>
                      <AlertTriangle size={12} />
                      {parseInt(data.error_count || 0)} Errors
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {loading ? (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border-medium)', borderTopColor: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.5 }}>No Data</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrinterCalendar;
