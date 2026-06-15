import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Search, Bell, Printer, ChevronRight, Moon, Sun, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const Layout = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/customers': return 'Customer Management';
      case '/analytics': return 'Analytics';
      case '/fleet': return 'Fleet Status';
      case '/alerts': return 'Alerts & Notifications';
      case '/settings': return 'Platform Settings';
      default: return 'QOA Platform';
    }
  };

  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">Q</div>
          <div>
            <div className="logo-text">QOA Fleet</div>
            <div className="logo-sub">Monitor v2.0</div>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              <span className="nav-dot" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <div style={{ padding: '0 0.75rem' }}>
          <div className="sidebar-section-label" style={{ padding: 0, marginBottom: '0.5rem' }}>System</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <NavLink to="/fleet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Printer size={18} />
              Fleet Status
              <span className="nav-badge" style={{ marginLeft: 'auto' }}>Live</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <SettingsIcon size={18} />
              Settings
            </NavLink>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">A</div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name">Admin User</div>
              <div className="user-email">admin@qoa.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navigation Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="page-breadcrumb">
              <span>QOA</span>
              <ChevronRight size={14} />
              <span className="current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-container">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search printers, IPs, customers..."
                className="search-input"
              />
            </div>
            <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <NavLink to="/alerts" className="icon-btn" title="Notifications">
              <Bell size={17} />
              <span className="notification-badge" />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
