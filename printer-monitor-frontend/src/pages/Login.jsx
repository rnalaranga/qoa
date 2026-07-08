import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../ThemeContext';
import { Printer, Lock, User, LogIn, AlertCircle, Sun, Moon } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      position: 'relative'
    }}>
      <button 
        className="icon-btn" 
        onClick={toggleTheme} 
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 400,
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 20px rgba(0,212,255,0.4)'
        }}>
          <Printer size={32} color="#fff" />
        </div>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '0.5rem' }}>
          Welcome Back
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Sign in to access your printer fleet
        </p>

        {error && (
          <div style={{
            width: '100%', padding: '0.8rem 1rem', marginBottom: '1.5rem',
            background: 'var(--neon-rose-dim)', border: '1px solid var(--neon-rose)',
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem',
            color: 'var(--neon-rose)', fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '0.875rem 1rem 0.875rem 2.8rem',
                  background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                  borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9rem',
                  outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--neon-cyan)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
          </div>
          
          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '0.875rem 1rem 0.875rem 2.8rem',
                  background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
                  borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9rem',
                  outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--neon-cyan)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '0.875rem', marginTop: '1rem',
            background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-violet))',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(0,212,255,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,212,255,0.4)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,212,255,0.3)'; }}
          >
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
