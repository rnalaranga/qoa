import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, HelpCircle, LogOut, Users, Activity, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">Q</div>
        <span className="logo-text">QOA Fleet</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/fleet" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
          <Activity size={20} />
          <span>Fleet Status</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
          <FileText size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
          <Bell size={20} />
          <span>Alerts</span>
        </NavLink>
        
        {user?.role === 'admin' && (
          <>
            <NavLink to="/customers" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
              <Users size={20} />
              <span>Customers</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <div style={{ padding: '0.5rem 1.25rem', marginBottom: '1rem', color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
          Logged in as: <br/><span style={{ color: '#fff' }}>{user?.username} ({user?.role})</span>
        </div>
        <a href="#" className="nav-item">
          <HelpCircle size={20} />
          <span>Help</span>
        </a>
        <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); logout(); }}>
          <LogOut size={20} />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
