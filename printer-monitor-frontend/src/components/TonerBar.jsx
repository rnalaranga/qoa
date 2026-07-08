import React from 'react';
import { AlertTriangle } from 'lucide-react';

const TonerBar = ({ tonerLevelStr, isOffline }) => {
  let isColor = false;
  let toners = [];
  
  if (tonerLevelStr && tonerLevelStr.startsWith('{')) {
    try {
      const data = JSON.parse(tonerLevelStr);
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
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
        {toners.map(t => {
          const isErr = t.val < 0;
          const displayVal = isErr ? 'ERR' : t.val + '%';
          const pct = isErr ? 0 : t.val;
          const barColor = isErr || pct <= 10 ? 'var(--neon-rose)' : (pct <= 25 ? 'var(--neon-amber)' : t.color);
          
          return (
            <div key={t.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center', width: '25px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: t.color }}>{t.label}</div>
              <div style={{ width: '100%', height: 4, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: String(pct) + '%', height: '100%', background: barColor, borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {displayVal}
              </div>
            </div>
          );
        })}
        {isOffline && <AlertTriangle size={11} style={{ color: 'var(--neon-amber)', marginLeft: '4px' }} title="Offline" />}
      </div>
    );
  } else {
    const tonerNum = parseInt(tonerLevelStr?.replace('%', '')) || 0;
    const isTonerError = tonerLevelStr === 'Insert Toner' || tonerLevelStr === 'Replace Toner' || tonerLevelStr === '-1';
    const tonerColor = isTonerError || tonerNum <= 10 ? 'var(--neon-rose)' : tonerNum <= 25 ? 'var(--neon-amber)' : 'var(--neon-emerald)';
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
        <div style={{ width: 60, height: 5, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: (isTonerError ? 0 : tonerNum) + '%', height: '100%', background: tonerColor, borderRadius: 99, boxShadow: '0 0 6px ' + tonerColor }} />
        </div>
        <span style={{ color: tonerColor, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {isTonerError ? 'ERR' : tonerNum + '%'}
          {isOffline && <AlertTriangle size={11} style={{ color: 'var(--neon-amber)' }} title="Offline" />}
        </span>
      </div>
    );
  }
};

export default TonerBar;
