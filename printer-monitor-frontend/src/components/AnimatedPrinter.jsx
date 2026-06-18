import React from 'react';

const AnimatedPrinter = ({ printer }) => {
  const status = printer.printer_status;
  const error = String(printer.error_status || '').toLowerCase();
  const toner = printer.toner_level || '';
  
  const isOffline = printer.is_stale || status === 'Offline' || printer.online_status === 'Removed';
  const isJam = error.includes('jam');
  const isCoverOpen = (error.includes('cover') || error.includes('drawer') || error.includes('door') || error.includes('tray')) && error.includes('open');
  const isTonerError = toner === 'Insert Toner' || toner === 'Replace Toner';
  const isPrinting = status === 'Printing';
  const isWarmup = status === 'Warmup';
  
  // Decide active state (Priority matters)
  let activeState = 'normal';
  if (isOffline) activeState = 'offline';
  else if (isJam) activeState = 'jam';
  else if (isCoverOpen) activeState = 'cover_open';
  else if (isTonerError) activeState = 'toner_error';
  else if (isPrinting) activeState = 'printing';
  else if (isWarmup) activeState = 'warmup';
  else if (status === 'Stopped') activeState = 'stopped_error'; // Generic error fallback

  const themeColor = activeState === 'offline' ? '#64748b' : 
                     (activeState === 'jam' || activeState === 'cover_open' || activeState === 'toner_error' || activeState === 'stopped_error') ? '#ff3b6b' :
                     (activeState === 'printing' || activeState === 'warmup') ? '#a855f7' : '#00ff88';

  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto', position: 'relative' }}>
      <svg viewBox="0 0 240 200" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2540" />
            <stop offset="100%" stopColor="#0d1220" />
          </linearGradient>
          <linearGradient id="topGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#2a1a4a" />
          </linearGradient>
          <filter id="glowPrinter">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx="120" cy="180" rx="80" ry="12" fill="rgba(0,0,0,0.5)" />

        {/* Normal Paper printing animation */}
        <g className={activeState === 'printing' ? 'anim-print-large' : ''} style={{ opacity: activeState === 'printing' ? 1 : 0 }}>
          <path d="M 80 145 L 160 145 L 165 170 L 75 170 Z" fill="rgba(240,240,255,0.8)" stroke="rgba(255,255,255,0.2)" />
          <line x1="85" y1="150" x2="155" y2="150" stroke={themeColor} strokeWidth="2" strokeOpacity="0.4" />
          <line x1="82" y1="160" x2="158" y2="160" stroke={themeColor} strokeWidth="2" strokeOpacity="0.25" />
        </g>

        {/* Printer Main Body */}
        <rect x="50" y="80" width="140" height="70" rx="12" fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        
        {/* Output Tray */}
        <path d="M 65 140 L 175 140 L 180 165 L 60 165 Z" fill="#151b2b" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* Side Cover (Left) - animates open */}
        <g style={{ 
            transformOrigin: '50px 115px', 
            transform: activeState === 'cover_open' ? 'rotate(-30deg) translateX(-10px)' : 'rotate(0deg)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {/* Inner mechanics visible when open (drawn underneath the cover itself) */}
          <rect x="52" y="95" width="8" height="40" rx="2" fill="#0d1220" />
          <circle cx="56" cy="100" r="3" fill="#ff3b6b" opacity={activeState === 'cover_open' ? 1 : 0} />
          <circle cx="56" cy="115" r="3" fill="#ffb800" opacity={activeState === 'cover_open' ? 1 : 0} />
          <circle cx="56" cy="125" r="2" fill="#00ff88" opacity={activeState === 'cover_open' ? 1 : 0} />
          {/* Cover */}
          <rect x="45" y="85" width="20" height="60" rx="4" fill="#1e3a5f" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        </g>

        {/* Top Panel */}
        <path d="M 50 80 Q 50 55 70 55 L 170 55 Q 190 55 190 80 Z" fill="url(#topGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

        {/* Paper Jam - crinkled paper sticking out top (moved AFTER Top Panel to ensure it sits on top) */}
        <g style={{ 
          opacity: activeState === 'jam' ? 1 : 0, 
          transform: activeState === 'jam' ? 'translateY(0) scale(1.1)' : 'translateY(20px) scale(0.9)',
          transformOrigin: '120px 70px',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <path d="M 80 65 L 90 20 L 110 35 L 130 15 L 150 40 L 160 65 Z" fill="#ffb800" stroke="#ff3b6b" strokeWidth="2" filter="url(#glowPrinter)" />
          <path d="M 95 40 L 110 50" stroke="#ff3b6b" strokeWidth="2" />
          <path d="M 125 35 L 140 45" stroke="#ff3b6b" strokeWidth="2" />
        </g>

        {/* Control Panel Area */}
        <rect x="140" y="60" width="35" height="16" rx="4" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Screen */}
        <rect x="143" y="63" width="29" height="10" rx="2" 
          fill={themeColor} 
          filter="url(#glowPrinter)"
          style={{ opacity: activeState === 'offline' ? 0.2 : (activeState === 'printing' ? 1 : 0.7) }}
        />

        {/* LED Strip */}
        <rect x="65" y="72" width="110" height="4" rx="2" fill="rgba(0,0,0,0.4)" />
        <rect x="65" y="72" width={activeState === 'offline' ? 0 : 110} height="4" rx="2" 
          fill={themeColor} 
          filter={activeState !== 'offline' ? "url(#glowPrinter)" : ""}
          className={activeState === 'jam' || activeState === 'cover_open' || activeState === 'toner_error' || activeState === 'stopped_error' ? 'anim-pulse-error' : ''}
          style={{ transition: 'all 0.5s ease' }}
        />

        {/* Toner Alert Icon (Floating) */}
        <g style={{ 
          opacity: activeState === 'toner_error' ? 1 : 0,
          transform: activeState === 'toner_error' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s ease'
        }}>
          <circle cx="120" cy="40" r="14" fill="#ff3b6b" filter="url(#glowPrinter)" />
          <text x="120" y="45" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">!</text>
        </g>

      </svg>
      
      {/* Dynamic Status Text overlaying the printer graphic */}
      <div style={{ 
        position: 'absolute', bottom: -10, left: 0, right: 0, 
        textAlign: 'center', 
        color: themeColor,
        fontWeight: 800,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        fontSize: '0.85rem',
        textShadow: `0 0 10px ${themeColor}80`,
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        {activeState === 'jam' ? 'Paper Jam Detected' :
         activeState === 'cover_open' ? 'Side Cover Open' :
         activeState === 'toner_error' ? 'Toner Error' :
         activeState === 'printing' ? 'Printing...' :
         activeState === 'warmup' ? 'Warming Up...' :
         activeState === 'stopped_error' ? 'Printer Error' :
         activeState === 'offline' ? 'Offline' : 'Ready / Connected'}
      </div>
    </div>
  );
};

export default AnimatedPrinter;
