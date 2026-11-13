import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Wifi, WifiOff } from 'lucide-react';
import ApnaCampusSymbol from '../Branding/ApnaCampusSymbol.jsx';
import SidebarSection from './SidebarSection.jsx';
import SidebarItem from './SidebarItem.jsx';

const SECTION_STORAGE_KEY = 'apna_sidebar_collapsed_sections';

/**
 * Universal Fixed 3-Zone Sidebar:
 * - Zone 1: Header (Logo, Portal Title, Department Subtitle) - shrink-0
 * - Zone 2: Navigation Menu (Sections & Items, thin custom scrollbar) - flex-1 min-h-0 overflow-y-auto
 * - Zone 3: Footer (System Online, Last Sync, Authorized Scope) - shrink-0
 *
 * Full rem/em typography for Text Display Scaling compatibility.
 * Section collapse states persisted in localStorage.
 * Auto-expands active section on tab change.
 */
export default function Sidebar({
  portalName = 'Apna Campus',
  portalSubtitle = 'Autonomous Higher Education',
  portalHomeTab = 'dashboard',
  navSections = [],
  activeTab = '',
  onTabChange,
  sidebarOpen = true,
  mobileOpen = false,
  onCloseSidebar,
  onCloseMobile,
  account,
  lastSyncTime,
  version = 'v2.5.0'
}) {
  // Resolve unique user key for per-user preferences and dynamic last sync
  const userId = useMemo(() => {
    if (!account) return 'guest';
    return String(
      account.id ||
      account.identity ||
      account.employeeId ||
      account.empId ||
      account.rollNumber ||
      account.registrationNumber ||
      account.username ||
      account.identifier ||
      account.email ||
      account.roleKey ||
      account.role ||
      'default'
    ).trim().toLowerCase();
  }, [account]);

  // Format dynamic time (hh:mm A)
  const formatSyncTime = useCallback((d = new Date()) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }
  }, []);

  // Online / Offline connectivity state
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });

  // Dynamic per-user last sync timestamp
  const [currentSyncTime, setCurrentSyncTime] = useState(() => {
    if (lastSyncTime) return lastSyncTime;
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(`apna_last_sync_${userId}`);
        if (saved) return saved;
      } catch {}
    }
    const initial = formatSyncTime();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`apna_last_sync_${userId}`, initial);
      } catch {}
    }
    return initial;
  });

  // Duty Status (On Duty / Off Duty) persisted per user across all roles
  const [isOnDuty, setIsOnDuty] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(`apna_duty_status_${userId}`);
        if (saved !== null) return saved === 'true';
      } catch {}
    }
    return true; // Default to ON DUTY / ACTIVE
  });

  const toggleDutyStatus = useCallback(() => {
    setIsOnDuty((prev) => {
      const next = !prev;
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`apna_duty_status_${userId}`, String(next));
        } catch {}
      }
      return next;
    });
  }, [userId]);

  const isStudent = account?.role === 'student';
  const dutyLabel = isStudent
    ? (isOnDuty ? 'ON CAMPUS' : 'ON LEAVE')
    : (isOnDuty ? 'ON DUTY' : 'OFF DUTY');

  // Listen to network changes (online/offline)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      const nowFormatted = formatSyncTime();
      setCurrentSyncTime(nowFormatted);
      try {
        localStorage.setItem(`apna_last_sync_${userId}`, nowFormatted);
      } catch {}
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId, formatSyncTime]);

  // Update or load sync time when user changes
  useEffect(() => {
    if (lastSyncTime) {
      setCurrentSyncTime(lastSyncTime);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(`apna_last_sync_${userId}`);
        if (saved) {
          setCurrentSyncTime(saved);
          return;
        }
      } catch {}
    }
    const fresh = formatSyncTime();
    setCurrentSyncTime(fresh);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`apna_last_sync_${userId}`, fresh);
      } catch {}
    }
  }, [userId, lastSyncTime, formatSyncTime]);

  // Load persisted section collapse state from localStorage
  const [collapsedMap, setCollapsedMap] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(SECTION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Save collapse state to localStorage whenever it changes
  const updateCollapsedMap = useCallback((newMap) => {
    setCollapsedMap(newMap);
    try {
      localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(newMap));
    } catch {}
  }, []);

  // Handle Tab Selection
  const handleSelectTab = (targetTab) => {
    if (!targetTab) return;
    if (onTabChange) {
      onTabChange(targetTab);
    }
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  // Auto-expand section containing the activeTab (so user always sees active item)
  useEffect(() => {
    if (!activeTab || !navSections.length) return;
    let modified = false;
    const nextMap = { ...collapsedMap };

    navSections.forEach((sec, idx) => {
      const key = sec.title || `sec-${idx}`;
      const hasActive = sec.items?.some(it => it.id === activeTab || it.page === activeTab || it.route === activeTab);
      if (hasActive && nextMap[key] === true) {
        nextMap[key] = false;
        modified = true;
      }
    });

    if (modified) {
      updateCollapsedMap(nextMap);
    }
  }, [activeTab, navSections, collapsedMap, updateCollapsedMap]);

  // Toggle individual section collapse
  const toggleSection = (key, currentlyCollapsed) => {
    const nextVal = !currentlyCollapsed;
    const nextMap = { ...collapsedMap, [key]: nextVal };
    updateCollapsedMap(nextMap);
  };

  // Close drawer or sidebar on ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (mobileOpen && onCloseMobile) {
          onCloseMobile();
        } else if (sidebarOpen && onCloseSidebar && window.innerWidth <= 1024) {
          onCloseSidebar();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, sidebarOpen, onCloseMobile, onCloseSidebar]);

  // Lock body scroll when mobile drawer is open to prevent background scrolling
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  // Compute resolved display identity
  const displayRole = (account?.role || 'User').replace(/_/g, ' ');
  const displayName = account?.name || 'Authorized User';
  const resolvedSubtitle = portalSubtitle || account?.department || 'Autonomous Higher Education';

  const isVisible = sidebarOpen || mobileOpen;

  return (
    <>
      {/* Off-canvas mobile backdrop */}
      {mobileOpen && (
        <div
          className="apna-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* ── FIXED MASTER SIDEBAR ────────────────────────────────────────── */}
      <aside
        className={`apna-sidebar ${sidebarOpen ? 'desktop-open' : 'desktop-closed'} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label={`${portalName} Sidebar Navigation`}
        aria-hidden={!isVisible}
        role="navigation"
      >
        {/* ── ZONE 1: FIXED TOP HEADER (Logo + Title + Subtitle) ── */}
        <div className="apna-sidebar-header">
          <button
            type="button"
            className="apna-sidebar-brand-btn"
            onClick={() => handleSelectTab(portalHomeTab)}
            title={`Return to ${portalName} Home`}
            aria-label={`Return to ${portalName} Home`}
          >
            <div className="apna-sidebar-logo-frame" aria-hidden="true">
              <ApnaCampusSymbol size={32} />
            </div>
            <div className="apna-sidebar-brand-text min-w-0">
              <span className="apna-sidebar-title truncate min-w-0" title={portalName}>
                {portalName}
              </span>
              <span className="apna-sidebar-subtitle truncate min-w-0" title={resolvedSubtitle}>
                {resolvedSubtitle}
              </span>
            </div>
          </button>

          {/* Mobile Drawer Close Button */}
          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="apna-sidebar-close-btn"
              aria-label="Close navigation sidebar"
              title="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── ZONE 2: SCROLLABLE NAVIGATION MENU (Thin Custom Scrollbar) ── */}
        <nav className="apna-sidebar-nav" role="menubar">
          {navSections.map((sec, secIdx) => {
            const key = sec.title || `sec-${secIdx}`;
            const isCollapsible = Boolean(sec.title) && sec.collapsible !== false;
            const hasActive = sec.items?.some(it => it.id === activeTab || it.page === activeTab || it.route === activeTab);
            const defaultCollapsed = sec.defaultCollapsed !== undefined
              ? sec.defaultCollapsed
              : (sec.title === 'OVERVIEW' || sec.title === 'MAIN' ? false : !hasActive);
            const isCollapsed = isCollapsible && (collapsedMap[key] !== undefined ? collapsedMap[key] : defaultCollapsed);

            return (
              <SidebarSection
                key={key}
                title={sec.title}
                isCollapsible={isCollapsible}
                isCollapsed={isCollapsed}
                onToggle={() => toggleSection(key, isCollapsed)}
              >
                {sec.items?.map((item) => {
                  const itemId = item.id || item.page || item.route;
                  const isActive = activeTab === itemId;

                  return (
                    <SidebarItem
                      key={itemId || item.label}
                      item={item}
                      isActive={isActive}
                      onSelect={handleSelectTab}
                    />
                  );
                })}
              </SidebarSection>
            );
          })}
        </nav>

        {/* ── ZONE 3: FIXED BOTTOM FOOTER (On Duty + Online Status + Authorized Scope) ── */}
        <div className="apna-sidebar-footer">
          <div className="apna-sidebar-duty-status-strip">
            <div
              className={`apna-sidebar-duty-chip ${isOnDuty ? 'active' : 'inactive'}`}
              onClick={toggleDutyStatus}
              title={`Duty Status: ${dutyLabel} (Click to toggle)`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDutyStatus();
                }
              }}
            >
              <span className={`apna-sidebar-duty-pulse ${isOnDuty ? 'active' : 'inactive'}`} />
              <span>{dutyLabel}</span>
            </div>

            <div
              className={`apna-sidebar-online-pill ${isOnline ? 'online' : 'offline'}`}
              title={isOnline ? 'Campus network online' : 'Device offline'}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>

            <span className="apna-version-tag">{version}</span>
          </div>

          <div className="apna-sidebar-sync-time">
            Last sync: {currentSyncTime}
          </div>

          <div className="apna-sidebar-role-card">
            <div className="apna-sidebar-role-kicker">AUTHORIZED SCOPE</div>
            <div className="apna-sidebar-role-name truncate min-w-0" title={`${displayRole.toUpperCase()} - ${displayName}`}>
              {displayRole.toUpperCase()} - {displayName}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
