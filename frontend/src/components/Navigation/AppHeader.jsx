import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Building2,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AppHeader({
  account,
  onToggleSidebar,
  sidebarOpen = false,
  sidebarCollapsed,
  onLogout,
  unreadCount = 0,
  onNotificationClick,
  portalName = 'Apna Campus'
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayName = account?.name || 'Authorized User';
  const displayRole = (account?.role || 'User').replace(/_/g, ' ');
  const displayId = account?.registrationNumber || account?.identity || account?.employeeId || account?.id || '';
  const displayDept = account?.department || 'Autonomous Higher Education';

  // Compute initials
  const initials = displayName
    .replace('Dr. ', '')
    .replace('Prof. ', '')
    .replace('Mr. ', '')
    .replace('Mrs. ', '')
    .replace('Ms. ', '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() || 'AC';

  return (
    <header className="apna-topbar" role="banner">
      {/* Left: Hamburger & Brand */}
      <div className="apna-topbar-left">
        <button
          type="button"
          className="apna-hamburger-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
          aria-expanded={sidebarOpen}
          title="Toggle Navigation Menu (Ctrl+B)"
        >
          <Menu size={20} />
        </button>

        <div className="apna-topbar-brand">
          <img src="/logo.png" alt="Apna Campus Logo" className="apna-topbar-logo" />
          <div className="apna-topbar-brand-info">
            <span className="apna-topbar-title">APNA CAMPUS</span>
            <span className="apna-topbar-badge">NAAC A++ AUTONOMOUS INSTITUTION</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications & User */}
      <div className="apna-topbar-right" ref={menuRef}>
        {/* Notification Bell */}
        <button
          type="button"
          className="apna-topbar-icon-btn"
          onClick={onNotificationClick || (() => setUserMenuOpen(prev => !prev))}
          title="Campus Notifications"
          aria-label="Campus Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="apna-notif-dot" />}
        </button>

        {/* User Pill Button */}
        <button
          type="button"
          className="apna-user-pill-btn"
          onClick={() => setUserMenuOpen(prev => !prev)}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
          aria-label="User Account Menu"
        >
          <div className="apna-user-avatar">{initials}</div>
          <div className="apna-user-meta">
            <span className="apna-user-name">{displayName}</span>
            <span className="apna-user-role">{displayRole}</span>
          </div>
          <ChevronDown size={14} style={{ color: '#64748b' }} />
        </button>

        {/* User Menu Dropdown */}
        {userMenuOpen && (
          <div className="apna-user-menu" role="menu">
            {onLogout && (
              <button
                type="button"
                className="apna-user-menu-item logout"
                onClick={() => {
                  setUserMenuOpen(false);
                  onLogout();
                }}
                role="menuitem"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
