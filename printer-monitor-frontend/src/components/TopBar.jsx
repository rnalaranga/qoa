import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="topbar">
      <div className="search-container">
        <Search size={20} className="search-icon" />
        <input type="text" placeholder="Search printers by IP or Model..." className="search-input" />
      </div>
      
      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
