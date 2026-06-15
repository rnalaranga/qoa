import React from 'react';
import { LayoutDashboard, FileText, Settings, HelpCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">Q</div>
        <span className="logo-text">QOA Fleet</span>
      </div>
      
      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <FileText size={20} />
          <span>Reports</span>
        </a>
        <a href="#" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>
      
      <div className="sidebar-footer">
        <a href="#" className="nav-item">
          <HelpCircle size={20} />
          <span>Help</span>
        </a>
        <a href="#" className="nav-item">
          <LogOut size={20} />
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
