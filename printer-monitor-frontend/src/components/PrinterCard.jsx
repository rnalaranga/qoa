import React from 'react';
import { AlertTriangle, CheckCircle2, Settings, XCircle, Zap } from 'lucide-react';

/* ── Dark Neon Printer Illustration ─────────────────────────── */
const PrinterIllustration = ({ isPrinting, statusColor, isColor, maxWidth = 80 }) => (
  <svg viewBox="0 0 200 160" style={{ width: '100%', maxWidth, height: 'auto', position: 'relative', zIndex: 1 }}>
    <defs>
      <linearGradient id="bodyGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a2540" />
        <stop offset="100%" stopColor="#0d1220" />
      </linearGradient>
      <linearGradient id="topGrad2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="100%" stopColor="#2a1a4a" />
      </linearGradient>
      <linearGradient id="cmykGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#00FFFF" />
        <stop offset="33%" stopColor="#FF00FF" />
        <stop offset="66%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#1a2540" />
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
    
    {isColor && (
      <rect x="145" y="70" width="4" height="20" rx="2" fill="url(#cmykGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    )}

    {/* Top Panel */}
    <path d="M45 65 Q45 46 60 46 L140 46 Q155 46 155 65 Z" fill={isColor ? "url(#cmykGrad)" : "url(#topGrad2)"} stroke="rgba(255,255,255,0.08)" strokeWidth="1" opacity={isColor ? "0.8" : "1"} />

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

/* ── Semi-circle Toner Gauge (Mono & CMYK) ─────────────────────────────────── */
const TonerGauge = ({ tonerStr, color, isOffline }) => {
  let isColor = false;
  let toners = [];
  
  if (tonerStr && tonerStr.startsWith('{')) {
    try {
      const data = JSON.parse(tonerStr);
      if (data.type === 'color') {
        isColor = true;
        toners = [
          { label: 'C', val: data.c, color: '#00FFFF' },
          { label: 'M', val: data.m, color: '#FF00FF' },
          { label: 'Y', val: data.y, color: '#eab308' },
          { label: 'K', val: data.k, color: '#64748b' }
        ];
      }
    } catch (e) {}
  }

  if (isColor) {
    const renderArc = (percentage, radius, strokeColor, label, isLow) => {
      const circum = radius * Math.PI;
      const offset = circum - (percentage / 100) * circum;
      
      return (
        <g key={label}>
          <path d={`M ${50 - radius} 50 A ${radius} ${radius} 0 0 1 ${50 + radius} 50`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" strokeLinecap="round" />
          <path d={`M ${50 - radius} 50 A ${radius} ${radius} 0 0 1 ${50 + radius} 50`} fill="none" stroke={strokeColor + '20'} strokeWidth="6" strokeLinecap="round" />
          <path
            d={`M ${50 - radius} 50 A ${radius} ${radius} 0 0 1 ${50 + radius} 50`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              strokeDasharray: circum,
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 3px ${strokeColor}80)`
            }}
          />
        </g>
      );
    };

    return (
      <div className="gauge-container-compact" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg viewBox="0 0 100 55" className="gauge-svg-compact" style={{ position: 'relative' }}>
          {toners.map((t, i) => {
            const isErr = t.val < 0;
            const pct = isErr ? 0 : t.val;
            const radius = 38 - (i * 8); // radii: 38, 30, 22, 14
            return renderArc(pct, radius, t.color, t.label, isErr || pct <= 10);
          })}
          <circle cx="50" cy="48" r="3" fill="#ffffff" style={{ opacity: 0.5 }} />
        </svg>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '4px' }}>
          {toners.map(t => {
            const isLow = t.val <= 10;
            return (
              <div key={t.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: '10px', color: t.color, fontWeight: '900', textShadow: `0 0 5px ${t.color}80` }}>{t.label}</span>
                <span style={{ fontSize: '9px', color: isLow ? '#ff3b6b' : 'var(--text-bright)', fontWeight: '700', marginTop: '2px' }}>
                  {t.val < 0 ? 'ERR' : t.val + '%'}
                </span>
              </div>
            );
          })}
        </div>
        {isOffline && (
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <AlertTriangle size={10} style={{ color: 'var(--neon-amber)' }} />
          </div>
        )}
      </div>
    );
  }

  // Mono Toner Gauge
  const percentage = parseInt(tonerStr?.replace('%', '')) || 0;
  const isTonerError = tonerStr === 'Insert Toner' || tonerStr === 'Replace Toner' || tonerStr === '-1';
  const displayPct = isTonerError ? 0 : percentage;
  
  const radius = 38;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (displayPct / 100) * circumference;
  const isLow = displayPct <= 20 || isTonerError;

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
        {isTonerError ? 'ERR' : percentage + '%'}
        {isOffline && <AlertTriangle size={10} style={{ color: 'var(--neon-amber)', filter: 'none' }} title="Last known reading (Offline)" />}
      </div>
      <div className="gauge-label" style={{ color: isLow ? color : undefined }}>Toner</div>
    </div>
  );
};

/* ── Main PrinterCard Component ─────────────────────────────── */
const PrinterCard = ({ printer, onClick, onAssign }) => {
  const { qoa_num, ip_address, model, toner_level, pages_printed, printer_status, error_status, customer_id, online_status, is_stale } = printer;

  let isTonerError = false;
  let isColorPrinter = false;
  if (toner_level && toner_level.startsWith('{')) {
    try {
      const data = JSON.parse(toner_level);
      if (data.type === 'color') isColorPrinter = true;
      if (data.c <= 0 || data.m <= 0 || data.y <= 0 || data.k <= 0) isTonerError = true;
    } catch(e) {}
  } else {
    isTonerError = toner_level === 'Insert Toner' || toner_level === 'Replace Toner' || toner_level === '-1';
  }

  const isRemoved = online_status === 'Removed';
  const hasSpecificError = error_status && !['-', 'OK', 'None', '', '0', 'null', 'undefined', 'Normal', 'Ready'].includes(String(error_status).trim());
  const isMaintenance = hasSpecificError && String(error_status).toLowerCase().includes('maintenance');

  let isConnected = true;
  let isPrinting = false;
  let isCritical = false;
  let isWarning = false;

  let mainThemeColor = '#00ff88'; 
  let bulbColor = '#00ff88'; 
  let tonerColor = isTonerError ? '#ff3b6b' : '#00ff88';
  let badges = [];

  if (isRemoved) {
    isConnected = false;
    mainThemeColor = '#64748b'; bulbColor = '#64748b'; tonerColor = '#64748b';
    badges = [{ label: 'Removed', color: '#64748b', icon: XCircle }];
  } else if (is_stale) {
    isConnected = false;
    mainThemeColor = '#64748b'; bulbColor = '#64748b'; tonerColor = '#64748b';
    badges = [{ label: 'Agent Not Running', color: '#64748b', icon: AlertTriangle }];
  } else if (printer_status === 'Offline') {
    isConnected = false;
    mainThemeColor = '#64748b'; bulbColor = '#64748b'; tonerColor = '#64748b';
    badges = [{ label: 'Offline', color: '#64748b', icon: XCircle }];
  } else {
    // Printer is connected
    badges.push({ label: 'Online', color: '#00ff88', icon: CheckCircle2, pulse: true });

    if (printer_status === 'Printing' || printer_status === 'Warmup') {
      isPrinting = true;
      mainThemeColor = '#a855f7'; bulbColor = '#a855f7'; tonerColor = '#a855f7';
      badges.push({ label: printer_status, color: '#a855f7', icon: Zap });
    }

    if (hasSpecificError || printer_status === 'Stopped' || printer_status === 'Error' || printer_status === 'Warning' || isTonerError) {
      if (isMaintenance) {
        // Warning State
        isWarning = true;
        bulbColor = '#ffb800'; // Yellow bulb
        badges.push({ label: 'Warning', color: '#ffb800', icon: AlertTriangle });
      } else {
        // Critical Error State (e.g. Paper Jam, Cover Open, Tray Empty, Toner Replace)
        isCritical = true;
        mainThemeColor = '#ff3b6b'; // Everything turns red
        bulbColor = '#ff3b6b';
        tonerColor = '#ff3b6b';
        badges.push({ label: 'Error', color: '#ff3b6b', icon: AlertTriangle });
      }
    }
  }

  const cardStyle = isRemoved ? { opacity: 0.5, filter: 'grayscale(1)', pointerEvents: 'none' } : {};
  const statusClass = isCritical ? 'status-error' : isWarning ? 'status-warning' : isPrinting ? 'status-printing' : (isConnected ? 'status-ok' : 'status-warning');

  return (
    <div className={`premium-compact-card ${statusClass}`} style={cardStyle} onClick={isRemoved ? null : onClick}>

      {/* Header */}
      <div className="compact-header">
        <div className="compact-qoa">
          <span className="qoa-label">QOA</span>
          <span className="qoa-value">{qoa_num || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="compact-status" style={{ background: `${b.color}15`, color: b.color, border: `1px solid ${b.color}30` }}>
                {b.pulse && !isPrinting && (
                  <div className="anim-network-pulse" style={{ width: 7, height: 7, background: b.color, borderRadius: '50%' }} />
                )}
                {(!b.pulse || isPrinting) && (
                  <Icon size={12} className={isPrinting && b.label === 'Printing' ? 'anim-spin-slow' : b.label === 'Warning' ? 'anim-pulse-warning' : ''} />
                )}
                <span style={{ fontSize: '0.75rem' }}>{b.label}</span>
              </div>
            );
          })}
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
            style={{ background: `radial-gradient(circle, ${mainThemeColor}40 0%, transparent 70%)` }}
          />
          <PrinterIllustration isPrinting={isPrinting} statusColor={bulbColor} isColor={isColorPrinter} />
        </div>
        <div className="compact-gauge-wrapper">
          <TonerGauge tonerStr={toner_level} color={tonerColor} isOffline={!isConnected} />
        </div>
      </div>

      {/* Error / Offline Alert */}
      {(hasSpecificError || isCritical || isWarning || !isConnected) && !isRemoved && !is_stale && (
        <div className={`compact-alert ${isCritical ? 'critical' : 'warning'}`} style={!isConnected ? {background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)'} : {}}>
          <AlertTriangle size={13} />
          <span>{hasSpecificError ? error_status : isCritical ? 'Printer Error' : !isConnected ? 'No Connection' : (error_status || 'Warning')}</span>
        </div>
      )}

      {/* Footer */}
      <div className="compact-footer">
        <div className="compact-stat">
          <span className="stat-label">Pages</span>
          <span className="stat-val" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: (isCritical || printer_status === 'Offline') ? 'var(--text-muted)' : undefined }}>
            {pages_printed && !isNaN(parseInt(pages_printed)) ? parseInt(pages_printed).toLocaleString() : '—'}
            {(isCritical || printer_status === 'Offline') && <AlertTriangle size={12} style={{ color: 'var(--neon-amber)' }} title="Last known reading (Offline)" />}
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

export { PrinterCard as default, PrinterIllustration, TonerGauge };
