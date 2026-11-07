import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
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
  lastSyncTime = '06:42 PM',
  version = 'v2.5.0'
}) {
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
        document.body.style.overflow = originalOverflow;
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

        {/* ── ZONE 3: FIXED BOTTOM FOOTER (System Online + Authorized Scope) ── */}
        <div className="apna-sidebar-footer">
          <div className="apna-sidebar-online-status">
            <div className="apna-status-indicator">
              <span className="apna-status-dot" aria-hidden="true" />
              <span className="apna-status-label">System Online</span>
            </div>
            <span className="apna-version-tag">{version}</span>
          </div>

          <div className="apna-sidebar-sync-time">
            Last sync: {lastSyncTime}
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
