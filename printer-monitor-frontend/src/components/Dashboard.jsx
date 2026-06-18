import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PrinterCard from './PrinterCard';
import HistoryModal from './HistoryModal';
import CustomerAssignmentModal from './CustomerAssignmentModal';
import { Layers, Users, Printer, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [printers, setPrinters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [assigningPrinter, setAssigningPrinter] = useState(null);

  const fetchData = async () => {
    try {
      const [printersRes, customersRes] = await Promise.all([
        axios.get('/api/printers'),
        axios.get('/api/customers')
      ]);
      setPrinters(printersRes.data);
      setCustomers(customersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (printer) => setSelectedPrinter(printer);
  const handleAssignClick = (printer) => setAssigningPrinter(printer);

  const getSeverity = (p) => {
    if (p.printer_status === 'Stopped' || p.printer_status === 'Offline') return 3;
    if (p.printer_status === 'Warning' || (p.error_status && p.error_status !== 'OK' && p.printer_status !== 'Stopped')) return 2;
    if (p.printer_status === 'Printing' || p.printer_status === 'Warmup') return 1;
    return 0;
  };

  const sortPrinters = (printersArr) => {
    return [...printersArr].sort((a, b) => getSeverity(b) - getSeverity(a));
  };

  const unassignedPrinters = sortPrinters(printers.filter(p => !p.customer_id));
  const groupedPrinters = customers.map(customer => ({
    customer,
    printers: sortPrinters(printers.filter(p => p.customer_id === customer.id))
  })).filter(group => group.printers.length > 0);

  // Stats
  const getPrinterState = (p) => {
    if (p.online_status === 'Removed' || p.is_stale || p.printer_status === 'Offline') return 'Offline';
    
    const isTonerError = p.toner_level === 'Insert Toner' || p.toner_level === 'Replace Toner';
    const hasSpecificError = p.error_status && !['-', 'OK', 'None', '', '0', 'null', 'undefined', 'Normal', 'Ready'].includes(String(p.error_status).trim());
    const isMaintenance = hasSpecificError && String(p.error_status).toLowerCase().includes('maintenance');

    if (hasSpecificError || p.printer_status === 'Stopped' || p.printer_status === 'Error' || p.printer_status === 'Warning' || isTonerError) {
      if (isMaintenance) return 'Warning';
      return 'Error';
    }
    return 'Online';
  };

  const totalPrinters = printers.length;
  const onlinePrinters = printers.filter(p => getPrinterState(p) === 'Online').length;
  const warningPrinters = printers.filter(p => getPrinterState(p) === 'Warning').length;
  const errorOfflinePrinters = printers.filter(p => ['Offline', 'Error'].includes(getPrinterState(p))).length;

  const statChips = [
    { label: 'Total Printers', value: totalPrinters, icon: '🖨️', accent: 'var(--neon-cyan)', bg: 'var(--neon-cyan-dim)' },
    { label: 'Online', value: onlinePrinters, icon: '✅', accent: 'var(--neon-emerald)', bg: 'var(--neon-emerald-dim)' },
    { label: 'Warnings', value: warningPrinters, icon: '⚠️', accent: 'var(--neon-amber)', bg: 'var(--neon-amber-dim)' },
    { label: 'Errors / Offline', value: errorOfflinePrinters, icon: '🔴', accent: 'var(--neon-rose)', bg: 'var(--neon-rose-dim)' },
  ];

  if (loading && printers.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1 className="dashboard-title">Printer Fleet Monitor</h1>
            <p className="dashboard-subtitle">Loading fleet data...</p>
          </div>
        </div>

        {/* Skeleton stats */}
        <div className="stats-row" style={{ marginBottom: '2rem' }}>
          {[1,2,3,4].map(n => (
            <div key={n} className="stat-chip">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '60%', height: '1.3rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '80%', height: '0.65rem', marginBottom: 0 }} />
              </div>
            </div>
          ))}
        </div>

        <div className="printer-grid">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="premium-compact-card">
              <div className="compact-header">
                <div className="skeleton skeleton-text" style={{ width: 60, margin: 0 }} />
                <div className="skeleton skeleton-text" style={{ width: 80, height: '1.3rem', borderRadius: 99, margin: 0 }} />
              </div>
              <div className="skeleton skeleton-text" style={{ width: '70%', height: '0.8rem' }} />
              <div className="compact-middle" style={{ height: 110 }}>
                <div className="skeleton" style={{ width: 70, height: 60, borderRadius: 10 }} />
                <div className="skeleton" style={{ width: 80, height: 50, borderRadius: 40 }} />
              </div>
              <div className="compact-footer">
                <div style={{ width: '45%' }}>
                  <div className="skeleton skeleton-text" style={{ width: '80%', height: '0.6rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '60%', height: '0.9rem', marginBottom: 0 }} />
                </div>
                <div style={{ width: '45%' }}>
                  <div className="skeleton skeleton-text" style={{ width: '80%', height: '0.6rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '60%', height: '0.9rem', marginBottom: 0 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1 className="dashboard-title">Printer Fleet Monitor</h1>
          <p className="dashboard-subtitle">Real-time visibility across your entire device fleet</p>
        </div>
        <div className="refresh-indicator">
          <div className="dot" />
          LIVE SYNC
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {statChips.map((chip, i) => (
          <div
            key={i}
            className="stat-chip"
            style={{ '--chip-accent': chip.accent }}
          >
            <div
              className="stat-chip-icon"
              style={{ background: chip.bg, border: `1px solid ${chip.accent}22` }}
            >
              <span style={{ fontSize: '1.2rem' }}>{chip.icon}</span>
            </div>
            <div className="stat-chip-info">
              <div className="stat-chip-value" style={{ color: chip.accent }}>{loading ? '–' : chip.value}</div>
              <div className="stat-chip-label">{chip.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned Printers */}
      {unassignedPrinters.length > 0 && (
        <div className="customer-group-section">
          <div className="group-header">
            <div className="group-header-icon">
              <Layers size={16} />
            </div>
            <span className="group-header-title">Unassigned Printers</span>
            <span className="group-header-count">{unassignedPrinters.length}</span>
          </div>
          <div className="printer-grid">
            {unassignedPrinters.map(printer => (
              <PrinterCard
                key={printer.ip_address}
                printer={printer}
                onClick={() => handleCardClick(printer)}
                onAssign={handleAssignClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grouped by Customer */}
      {groupedPrinters.map(group => (
        <div key={group.customer.id} className="customer-group-section">
          <div className="group-header">
            <div className="group-header-icon">
              <Users size={16} />
            </div>
            <span className="group-header-title">{group.customer.name}</span>
            <span className="group-header-count">{group.printers.length}</span>
          </div>
          <div className="printer-grid">
            {group.printers.map(printer => (
              <PrinterCard
                key={printer.ip_address}
                printer={printer}
                onClick={() => handleCardClick(printer)}
                onAssign={handleAssignClick}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {groupedPrinters.length === 0 && unassignedPrinters.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Printer size={28} />
          </div>
          <h3>No printers found</h3>
          <p>No printers were detected on the network. Check your connection.</p>
        </div>
      )}

      {/* Modals */}
      {selectedPrinter && (
        <HistoryModal
          printer={selectedPrinter}
          onClose={() => setSelectedPrinter(null)}
        />
      )}
      {assigningPrinter && (
        <CustomerAssignmentModal
          printer={assigningPrinter}
          customers={customers}
          onClose={() => setAssigningPrinter(null)}
          onAssign={() => fetchData()}
        />
      )}
    </div>
  );
};

export default Dashboard;
