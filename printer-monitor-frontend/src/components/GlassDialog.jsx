import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const GlassDialog = ({ isOpen, type = 'confirm', title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', intent = 'danger' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (type === 'confirm' && onCancel) onCancel();
        if (type === 'alert' && onConfirm) onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm, type]);

  if (!isOpen) return null;

  const isDanger = intent === 'danger';
  const isWarning = intent === 'warning';
  const isSuccess = intent === 'success';

  const themeColor = isDanger ? 'var(--neon-rose)' : isWarning ? 'var(--neon-amber)' : isSuccess ? 'var(--neon-emerald)' : 'var(--neon-cyan)';
  const themeBg = isDanger ? 'rgba(255,59,107,0.1)' : isWarning ? 'rgba(255,184,0,0.1)' : isSuccess ? 'rgba(0,255,136,0.1)' : 'rgba(0,212,255,0.1)';

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15,23,42,0.85)' }} onClick={type === 'confirm' ? onCancel : onConfirm}>
      <div 
        className="glass-panel" 
        style={{ 
          maxWidth: 400, 
          padding: '2rem', 
          textAlign: 'center', 
          border: `1px solid ${themeBg}`,
          boxShadow: `0 0 40px ${themeBg}`,
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          width: 60, height: 60, borderRadius: '50%', background: themeBg, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 1.5rem', color: themeColor,
          boxShadow: `0 0 20px ${themeBg}`
        }}>
          {isDanger ? <AlertTriangle size={30} /> : isWarning ? <AlertTriangle size={30} /> : isSuccess ? <CheckCircle size={30} /> : <Info size={30} />}
        </div>
        
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', color: 'white' }}>{title}</h3>
        <p style={{ margin: '0 0 2rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {type === 'confirm' && (
            <button 
              onClick={onCancel}
              style={{
                flex: 1, padding: '0.75rem', background: 'transparent', 
                border: '1px solid var(--border-medium)', color: 'var(--text-muted)', 
                borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'white'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.75rem', background: themeBg, 
              border: `1px solid ${themeColor}`, color: themeColor, 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
              boxShadow: `0 0 15px ${themeBg}`, transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = themeColor; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = themeBg; e.currentTarget.style.color = themeColor; }}
          >
            {type === 'alert' ? 'OK' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassDialog;
