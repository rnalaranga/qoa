import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Search, Bell, Printer, ChevronRight, ChevronLeft, Menu, Moon, Sun, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();

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
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  if (user?.role === 'admin') {
    navItems.splice(1, 0, { to: '/customers', icon: Users, label: 'Customers' });
    navItems.splice(2, 0, { to: '/users', icon: Users, label: 'Print Users' });
  }

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
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
              <span>{label}</span>
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
              <span>Fleet Status</span>
              <span className="nav-badge" style={{ marginLeft: 'auto' }}>Live</span>
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <SettingsIcon size={18} />
                <span>Settings</span>
              </NavLink>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="sidebar-footer">
          <button 
            className="collapse-btn hide-on-mobile"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          
          <div className="user-profile">
            <div className="avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-info">
              <div className="user-name" style={{ textTransform: 'capitalize' }}>{user?.username || 'User'}</div>
              <div className="user-email" style={{ textTransform: 'capitalize' }}>{user?.role || 'Guest'}</div>
            </div>
            <button className="icon-btn logout-btn" onClick={logout} title="Logout" style={{ marginLeft: 'auto' }}>
              <LogOut size={16} color="var(--neon-rose)" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navigation Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
              <Menu size={20} />
            </button>
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
