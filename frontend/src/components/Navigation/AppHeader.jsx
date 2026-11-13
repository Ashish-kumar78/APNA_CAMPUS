import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  LogOut,
  ChevronDown,
  Bell,
  Sliders,
  User,
  QrCode,
  Globe,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { notificationsStore } from '../../services/notificationsStore.js';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import {
  getCurrentLanguage,
  setLanguage,
  subscribeLanguage,
  SUPPORTED_LANGUAGES,
} from '../../services/languageStore.js';
import {
  getStoredTheme,
  toggleTheme,
  subscribeTheme,
  THEME_MODES,
} from '../../services/themeStore.js';

export default function AppHeader({
  account,
  onToggleSidebar,
  sidebarOpen = false,
  onLogout,
  unreadCount: propUnreadCount,
  onNotificationClick,
  onOpenNotifications,
  onViewProfile,
  onOpenDigitalId,
  portalName = 'Apna Campus',
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(propUnreadCount || 0);
  const [currentLang, setCurrentLang] = useState(() => getCurrentLanguage());
  const [currentTheme, setCurrentTheme] = useState(() => getStoredTheme());

  const menuRef = useRef(null);
  const langMenuRef = useRef(null);

  let openPanel = () => {};
  try {
    const acc = useAccessibility();
    openPanel = acc.openPanel;
  } catch (_) {}

  const handleOpenNotifs = onNotificationClick || onOpenNotifications;

  // Subscribe to reactive language and theme updates
  useEffect(() => {
    const unsubLang = subscribeLanguage((lang) => setCurrentLang(lang));
    const unsubTheme = subscribeTheme((theme) => setCurrentTheme(theme));
    return () => {
      if (typeof unsubLang === 'function') unsubLang();
      if (typeof unsubTheme === 'function') unsubTheme();
    };
  }, []);

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
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
        setLangMenuOpen(false);
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

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

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

      {/* Right: Theme Toggle + Language Selector (Beside Bell) + Bell + Profile */}
      <div className="apna-topbar-right">
        {/* Quick Theme Switcher (Light Mode / Dark Mode) */}
        <button
          type="button"
          className="apna-topbar-icon-btn apna-theme-toggle-btn"
          onClick={() => toggleTheme()}
          title={currentTheme === THEME_MODES.DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={currentTheme === THEME_MODES.DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ transition: 'transform 0.2s ease' }}
        >
          {currentTheme === THEME_MODES.DARK ? (
            <Sun size={18} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={18} style={{ color: '#475569' }} />
          )}
        </button>

        {/* Global Language Selection Dropdown - Positioned directly beside the Notification Icon */}
        <div className="apna-lang-dropdown-wrapper" ref={langMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="apna-topbar-icon-btn apna-lang-trigger-btn"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            title={`Select Language (Current: ${currentLangObj.nativeLabel})`}
            aria-label={`Select Language, currently ${currentLangObj.label}`}
            aria-expanded={langMenuOpen}
            aria-haspopup="true"
            style={{
              width: 'auto',
              minWidth: '70px',
              padding: '0 10px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <Globe size={16} style={{ color: '#2563eb' }} />
            <span>{currentLang === 'hi' ? 'HI' : currentLang === 'or' ? 'OR' : 'EN'}</span>
            <ChevronDown size={13} style={{ color: '#64748b' }} />
          </button>

          {/* Language Dropdown Menu (English, Hindi, Odia) */}
          {langMenuOpen && (
            <div className="apna-lang-menu" role="menu" style={{ minWidth: '175px', right: 0 }}>
              <div
                style={{
                  padding: '6px 12px 6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  marginBottom: '4px',
                }}
              >
                Choose Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    className={`apna-lang-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                      <span style={{ fontWeight: isActive ? 700 : 600, fontSize: '0.85rem' }}>
                        {lang.nativeLabel}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {lang.label}
                      </span>
                    </div>
                    {isActive && <Check size={16} style={{ color: '#2563eb', strokeWidth: 2.5 }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accessibility Assistive Controls (Alt+A) */}
        <button
          type="button"
          className="apna-topbar-icon-btn apna-accessibility-trigger"
          onClick={openPanel}
          title="Accessibility Controls (Alt+A)"
          aria-label="Open Accessibility & Assistive Controls (Alt+A)"
        >
          <Sliders size={18} />
        </button>

        {/* Notification Bell 🔔 */}
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

        {/* Universal 10-Second Dynamic Pass Quick Trigger */}
        {onOpenDigitalId && (
          <button
            type="button"
            className="apna-topbar-icon-btn apna-digital-id-trigger"
            onClick={onOpenDigitalId}
            title="My Digital ID & 10s Dynamic Pass"
            aria-label="Open My Digital ID & 10s Dynamic Pass"
            style={{
              color: '#0284c7',
            }}
          >
            <QrCode size={19} />
          </button>
        )}

        {/* User Pill Button */}
        <div ref={menuRef} style={{ position: 'relative' }}>
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
              {onOpenDigitalId && (
                <button
                  type="button"
                  className="apna-user-menu-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenDigitalId();
                  }}
                  role="menuitem"
                  title="Open My Digital ID & 10s Dynamic Pass"
                >
                  <QrCode size={16} style={{ color: '#0284c7' }} />
                  <span>My Digital ID & Dynamic Pass</span>
                </button>
              )}
              {onViewProfile && (
                <button
                  type="button"
                  className="apna-user-menu-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onViewProfile();
                  }}
                  role="menuitem"
                  title="View full official profile"
                >
                  <User size={16} />
                  <span>View Profile</span>
                </button>
              )}
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
      </div>
    </header>
  );
}
