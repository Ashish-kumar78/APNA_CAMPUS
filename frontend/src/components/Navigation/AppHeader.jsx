import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  LogOut,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { notificationsStore } from '../../services/notificationsStore.js';

export default function AppHeader({
  account,
  onToggleSidebar,
  sidebarOpen = false,
  onLogout,
  unreadCount: propUnreadCount,
  onNotificationClick,
  onOpenNotifications,
  portalName = 'Apna Campus',
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(propUnreadCount || 0);
  const menuRef = useRef(null);

  const handleOpenNotifs = onNotificationClick || onOpenNotifications;

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await api.getUnreadNotificationsCount();
      if (response?.success && Number.isFinite(Number(response.unreadCount))) {
        setUnreadCount(Number(response.unreadCount));
        return;
      }
    } catch {
      // Fallback below
    }
    try {
      const count = notificationsStore.getUnreadCount(account);
      setUnreadCount(count);
    } catch {}
  }, [account]);

  useEffect(() => {
    loadUnreadCount();
    const timerId = window.setInterval(loadUnreadCount, 30_000);
    window.addEventListener('apna_campus_notifications_updated', loadUnreadCount);
    window.addEventListener('apna_campus_notification_dispatched', loadUnreadCount);
    return () => {
      window.clearInterval(timerId);
      window.removeEventListener('apna_campus_notifications_updated', loadUnreadCount);
      window.removeEventListener('apna_campus_notification_dispatched', loadUnreadCount);
    };
  }, [loadUnreadCount]);

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
  const displayDept = account?.department || account?.program || 'Autonomous Higher Education';

  // Compute effective profile picture (DP)
  const effectivePhoto =
    account?.photo ||
    account?.avatar ||
    account?.photoUrl ||
    (typeof localStorage !== 'undefined' && account?.employeeId
      ? localStorage.getItem(`hostel_officer_avatar_${account.employeeId}`)
      : null) ||
    (typeof localStorage !== 'undefined' &&
    (account?.role === 'warden' || account?.role === 'hostel_admin')
      ? localStorage.getItem('hostel_officer_avatar')
      : null);

  // Compute initials
  const initials =
    displayName
      .replace('Dr. ', '')
      .replace('Prof. ', '')
      .replace('Mr. ', '')
      .replace('Mrs. ', '')
      .replace('Ms. ', '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
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
            <span className="apna-topbar-badge">COLLEGE MANAGEMENT ERP</span>
          </div>
        </div>
      </div>

      {/* Right: Notification Bell 🔔 + User Profile Pill */}
      <div className="apna-topbar-right" ref={menuRef}>
        <button
          type="button"
          className={`apna-topbar-icon-btn apna-notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
          onClick={handleOpenNotifs}
          title={
            unreadCount > 0
              ? `Campus Notifications (${unreadCount} unread)`
              : 'Campus Notifications'
          }
          aria-label={
            unreadCount > 0
              ? `Campus Notifications, ${unreadCount} unread items`
              : 'Campus Notifications'
          }
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="apna-notification-count">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Pill Button */}
        <button
          type="button"
          className="apna-user-pill-btn"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
          aria-label="User Account Menu"
        >
          {effectivePhoto ? (
            <img src={effectivePhoto} alt={displayName} className="apna-user-avatar-img" />
          ) : (
            <div className="apna-user-avatar">{initials}</div>
          )}
          <div className="apna-user-meta">
            <span className="apna-user-name">{displayName}</span>
            <span className="apna-user-role">{displayRole}</span>
          </div>
          <ChevronDown size={14} style={{ color: '#64748b' }} />
        </button>

        {/* User Menu Dropdown */}
        {userMenuOpen && (
          <div className="apna-user-menu" role="menu">
            <div className="apna-user-menu-header">
              <strong>{displayName}</strong>
              <small>{displayDept}</small>
            </div>
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
