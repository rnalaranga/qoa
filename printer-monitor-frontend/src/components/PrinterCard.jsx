import React from 'react';
import { AlertTriangle, CheckCircle2, Settings, XCircle, Zap } from 'lucide-react';

/* ── Dark Neon Printer Illustration ─────────────────────────── */
const PrinterIllustration = ({ isPrinting, statusColor }) => (
  <svg viewBox="0 0 200 160" style={{ width: '100%', maxWidth: 80, height: 'auto', position: 'relative', zIndex: 1 }}>
    <defs>
      <linearGradient id="bodyGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a2540" />
        <stop offset="100%" stopColor="#0d1220" />
      </linearGradient>
      <linearGradient id="topGrad2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#2a1a4a" />
      </linearGradient>
      <linearGradient id="trayGrad2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={statusColor + '80'} />
        <stop offset="100%" stopColor={statusColor + '30'} />
      </linearGradient>
      <filter id="glow2">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Shadow */}
    <ellipse cx="100" cy="145" rx="55" ry="8" fill="rgba(0,0,0,0.5)" />

    {/* Output Tray */}
    <path d="M55 110 L145 110 L150 132 L50 132 Z" fill="url(#bodyGrad2)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

    {/* Paper output */}
    <g className={isPrinting ? 'anim-print' : ''}>
      <path d="M68 112 L132 112 L136 128 L64 128 Z" fill="rgba(240,240,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1="72" y1="116" x2="128" y2="116" stroke={statusColor} strokeWidth="1" strokeOpacity="0.4" />
      <line x1="70" y1="120" x2="130" y2="120" stroke={statusColor} strokeWidth="1" strokeOpacity="0.25" />
    </g>

    {/* Printer Body */}
    <rect x="45" y="65" width="110" height="48" rx="10" fill="url(#bodyGrad2)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

    {/* Top Panel */}
    <path d="M45 65 Q45 46 60 46 L140 46 Q155 46 155 65 Z" fill="url(#topGrad2)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

    {/* Status LED bar */}
    <rect x="55" y="58" width="90" height="5" rx="2.5" fill="rgba(0,0,0,0.4)" />
    <rect
      x="56" y="58.5" width={isPrinting ? 60 : 30} height="4" rx="2"
      fill={statusColor}
      filter="url(#glow2)"
      style={{ transition: 'width 0.5s ease' }}
    />

    {/* Control panel */}
    <rect x="55" y="50" width="30" height="6" rx="2" fill="rgba(255,255,255,0.06)" />

    {/* Screen */}
    <rect x="125" y="50" width="22" height="12" rx="3" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    <rect x="127" y="52" width="18" height="8" rx="1.5"
      fill={isPrinting ? statusColor : 'rgba(0,212,255,0.3)'}
      filter="url(#glow2)"
      style={{ opacity: isPrinting ? 1 : 0.6 }}
    />

    {/* Slot */}
    <rect x="60" y="64" width="80" height="3" rx="1.5" fill="rgba(0,0,0,0.5)" />
    <rect x="61" y="64.5" width="78" height="2" rx="1" fill="rgba(255,255,255,0.03)" />
  </svg>
);

/* ── Semi-circle Toner Gauge ─────────────────────────────────── */
const TonerGauge = ({ percentage, color, isOffline }) => {
  const radius = 38;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isLow = percentage <= 20;

  return (
    <div className="gauge-container-compact">
      <svg viewBox="0 0 100 55" className="gauge-svg-compact">
        {/* Track */}
        <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />

        {/* Glow track */}
        <path d="M 12 50 A 38 38 0 0 1 88 50" fill="none" stroke={color + '20'} strokeWidth="14" strokeLinecap="round" />

        {/* Fill */}
        <path
          d="M 12 50 A 38 38 0 0 1 88 50"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 4px ${color}80)`
          }}
        />

        {/* Center dot */}
        <circle cx="50" cy="48" r="3" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>

      <div className="gauge-value-compact" style={{ color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
        {percentage}%
        {isOffline && <AlertTriangle size={10} style={{ color: 'var(--neon-amber)', filter: 'none' }} title="Last known reading (Offline)" />}
      </div>
      <div className="gauge-label" style={{ color: isLow ? color : undefined }}>Toner</div>
    </div>
  );
};

/* ── Main PrinterCard Component ─────────────────────────────── */
const PrinterCard = ({ printer, onClick, onAssign }) => {
  const { qoa_num, ip_address, model, toner_level, pages_printed, printer_status, error_status, customer_id } = printer;

  const tonerNum = parseInt(toner_level?.replace('%', '')) || 0;
  const isTonerError = toner_level === 'Insert Toner' || toner_level === 'Replace Toner';

  let StatusIcon = CheckCircle2;
  let statusColor = '#00ff88';
  let statusClass = 'status-ok';
  let pillClass = 'status-pill-ok';
  let isWarning = false;
  let isCritical = false;
  let isPrinting = false;
  let isConnected = true;
  let statusLabel = 'Connected';

  const hasSpecificError = error_status && !['-', 'OK', 'None', '', '0', 'null', 'undefined', 'Normal', 'Ready'].includes(String(error_status).trim());

  if (printer_status === 'Printing' || printer_status === 'Warmup') {
    StatusIcon = Zap;
    statusColor = '#a855f7';
    statusClass = 'status-printing';
    pillClass = 'status-pill-printing';
    isPrinting = true;
    statusLabel = printer_status;
  } else if (hasSpecificError) {
    StatusIcon = AlertTriangle;
    statusColor = '#ff3b6b';
    statusClass = 'status-error';
    pillClass = 'status-pill-error';
    isWarning = true;
    isCritical = true;
    isConnected = false;
    statusLabel = error_status;
  } else if (printer_status === 'Stopped' || printer_status === 'Offline') {
    StatusIcon = XCircle;
    statusColor = '#ff3b6b';
    statusClass = 'status-error';
    pillClass = 'status-pill-error';
    isCritical = true;
    isConnected = false;
    statusLabel = 'Offline';
  } else if (printer_status === 'Warning') {
    StatusIcon = AlertTriangle;
    statusColor = '#ffb800';
    statusClass = 'status-warning';
    pillClass = 'status-pill-warning';
    isWarning = true;
    isConnected = false;
    statusLabel = 'Warning';
  } else if (printer_status === 'OK' || printer_status === 'Ready') {
    statusLabel = 'Connected';
  }

  const gaugeColor = isTonerError ? '#ff3b6b' : statusColor;
  const displayTonerNum = isTonerError ? 0 : tonerNum;

  return (
    <div className={`premium-compact-card ${statusClass}`} onClick={onClick}>

      {/* Header */}
      <div className="compact-header">
        <div className="compact-qoa">
          <span className="qoa-label">QOA</span>
          <span className="qoa-value">{qoa_num || 'N/A'}</span>
        </div>
        <div className={`compact-status ${pillClass}`}>
          {isConnected && !isPrinting && (
            <div
              className="anim-network-pulse"
              style={{ width: 7, height: 7, background: '#00ff88', borderRadius: '50%' }}
            />
          )}
          {(!isConnected || isPrinting) && (
            <StatusIcon
              size={13}
              className={isPrinting ? 'anim-spin-slow' : isWarning ? 'anim-pulse-warning' : ''}
            />
          )}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Model */}
      <div className="compact-model-title" title={model}>
        {model && model.length > 32 ? `${model.substring(0, 32)}…` : model}
      </div>

      {/* Middle Graphics */}
      <div className="compact-middle">
        <div className="compact-graphic-wrapper">
          <div
            className="graphic-glow-bg"
            style={{ background: `radial-gradient(circle, ${statusColor}40 0%, transparent 70%)` }}
          />
          <PrinterIllustration isPrinting={isPrinting} statusColor={statusColor} />
        </div>
        <div className="compact-gauge-wrapper">
          <TonerGauge percentage={displayTonerNum} color={gaugeColor} isOffline={isCritical} />
        </div>
      </div>

      {/* Error / Offline Alert */}
      {((error_status && error_status !== 'OK') || isCritical) && (
        <div className={`compact-alert ${isCritical ? 'critical' : 'warning'}`}>
          <AlertTriangle size={13} />
          <span>{isCritical ? 'Printer Offline' : error_status}</span>
        </div>
      )}

      {/* Footer */}
      <div className="compact-footer">
        <div className="compact-stat">
          <span className="stat-label">Pages</span>
          <span className="stat-val" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: isCritical ? 'var(--text-muted)' : undefined }}>
            {pages_printed && !isNaN(parseInt(pages_printed)) ? parseInt(pages_printed).toLocaleString() : '—'}
            {isCritical && <AlertTriangle size={12} style={{ color: 'var(--neon-amber)' }} title="Last known reading (Offline)" />}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {!customer_id ? (
            <button
              className="assign-btn"
              onClick={e => { e.stopPropagation(); onAssign && onAssign(printer); }}
            >
              + Assign
            </button>
          ) : (
            <>
              <div className="compact-stat right">
                <span className="stat-label">IP</span>
                <span className="stat-val" style={{ fontSize: '0.78rem' }}>{ip_address}</span>
              </div>
              <button
                className="reassign-btn"
                onClick={e => { e.stopPropagation(); onAssign && onAssign(printer); }}
                title="Re-assign Printer"
              >
                <Settings size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrinterCard;
