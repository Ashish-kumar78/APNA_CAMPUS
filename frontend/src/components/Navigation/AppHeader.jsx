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
  X,
  Search,
  Globe,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import {
  getUserPreferences,
  setUserTheme,
  setUserLanguage,
  hydrateUserPreferences,
  subscribeUserPreferences,
} from '../../services/userPreferencesStore.js';
import { applyLanguageToDOM } from '../../services/languageStore.js';

export default function AppHeader({
  account,
  onToggleSidebar,
  sidebarOpen = false,
  sidebarCollapsed,
  onLogout,
  unreadCount = 0,
  onNotificationClick,
  portalName = 'Apna Campus',
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Preference states strictly tied to current authenticated account
  const [currentTheme, setCurrentTheme] = useState(() => {
    return getUserPreferences(account).theme;
  });
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return getUserPreferences(account).language;
  });

  const menuRef = useRef(null);
  const langMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Hydrate user preferences whenever account changes (e.g. login, role-switch, refresh)
  useEffect(() => {
    let isMounted = true;
    hydrateUserPreferences(account).then((prefs) => {
      if (isMounted && prefs) {
        setCurrentTheme(prefs.theme);
        setCurrentLanguage(prefs.language);
        applyLanguageToDOM(prefs.language);
      }
    });

    const unsubscribe = subscribeUserPreferences((e) => {
      if (isMounted) {
        const latest = getUserPreferences(account);
        setCurrentTheme(latest.theme);
        setCurrentLanguage(latest.language);
        applyLanguageToDOM(latest.language);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [account]);

  // Close dropdowns on click outside or Escape
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
      // Ctrl+K / Cmd+K search focus
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayName = account?.name || 'Dr. S. Mohanty';
  const displayRole = (account?.role || 'Faculty').replace(/_/g, ' ');
  const displayDept = account?.department || 'Autonomous Higher Education';

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
      .toUpperCase() || 'SM';

  // STEP 3: Language Switching Action
  const handleSelectLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    setUserLanguage(account, langCode);
    applyLanguageToDOM(langCode);
    setLangMenuOpen(false);
  };

  // STEP 4: Theme Toggle Action (Light <-> Dark)
  const handleToggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(nextTheme);
    setUserTheme(account, nextTheme);
  };

  const isDarkMode = currentTheme === 'dark';

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

      {/* Center: Global Search Bar with Ctrl+K */}
      <div className="apna-topbar-center">
        <div className="apna-global-search">
          <Search size={16} className="apna-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={currentLanguage === 'hi' ? 'कुछ भी खोजें... (उदा. छात्र, अंक, नोटिस)' : 'Search anything... (e.g. students, marks, notices)'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="apna-search-input"
          />
          <kbd className="apna-search-kbd">Ctrl + K</kbd>
        </div>
      </div>

      {/* Right: Exactly 3 Final Header Options + User Profile Pill */}
      <div className="apna-topbar-right" ref={menuRef}>
        {/* OPTION 1: Notification Bell 🔔 */}
        <button
          type="button"
          className={`apna-topbar-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
          onClick={onNotificationClick}
          title={
            unreadCount > 0
              ? currentLanguage === 'hi'
                ? `परिसर सूचनाएं (${unreadCount} अपठित)`
                : `Campus Notifications (${unreadCount} unread)`
              : currentLanguage === 'hi'
              ? 'परिसर सूचनाएं'
              : 'Campus Notifications'
          }
          aria-label={
            unreadCount > 0
              ? `Campus Notifications, ${unreadCount} unread items`
              : 'Campus Notifications'
          }
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="apna-notif-pill">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* OPTION 2: Language Selector 🌐 (Replaced Message/Chat icon) */}
        <div style={{ position: 'relative' }} ref={langMenuRef}>
          <button
            type="button"
            className={`apna-topbar-icon-btn ${langMenuOpen ? 'active' : ''}`}
            onClick={() => setLangMenuOpen((prev) => !prev)}
            title={
              currentLanguage === 'hi'
                ? 'भाषा चुनें (वर्तमान: हिंदी)'
                : 'Select Language (Current: English)'
            }
            aria-label="Language Selector"
            aria-expanded={langMenuOpen}
            aria-haspopup="true"
          >
            <Globe size={18} />
          </button>

          {/* Language Dropdown Menu */}
          {langMenuOpen && (
            <div className="apna-lang-menu" role="menu">
              <button
                type="button"
                className={`apna-lang-menu-item ${currentLanguage === 'en' ? 'active' : ''}`}
                onClick={() => handleSelectLanguage('en')}
                role="menuitem"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  English 🇬🇧
                </span>
                {currentLanguage === 'en' && <Check size={14} style={{ color: '#2563eb' }} />}
              </button>
              <button
                type="button"
                className={`apna-lang-menu-item ${currentLanguage === 'hi' ? 'active' : ''}`}
                onClick={() => handleSelectLanguage('hi')}
                role="menuitem"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  हिंदी 🇮🇳
                </span>
                {currentLanguage === 'hi' && <Check size={14} style={{ color: '#2563eb' }} />}
              </button>
            </div>
          )}
        </div>

        {/* OPTION 3: Theme Toggle ☀️ / 🌙 (Replaced static Sun icon) */}
        <button
          type="button"
          className="apna-topbar-icon-btn"
          onClick={handleToggleTheme}
          title={
            isDarkMode
              ? currentLanguage === 'hi'
                ? 'लाइट मोड पर स्विच करें'
                : 'Switch to Light Mode'
              : currentLanguage === 'hi'
              ? 'डार्क मोड पर स्विच करें'
              : 'Switch to Dark Mode'
          }
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun size={18} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={18} />
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
                <span>{currentLanguage === 'hi' ? 'साइन आउट' : 'Sign Out'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
