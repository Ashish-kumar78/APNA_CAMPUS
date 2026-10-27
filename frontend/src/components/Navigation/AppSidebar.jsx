import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react';
import ApnaCampusSymbol from '../Branding/ApnaCampusSymbol';

export default function AppSidebar({
  portalName = 'Apna Campus',
  portalSubtitle = 'Autonomous Higher Education',
  navSections = [],
  activeTab = '',
  onTabChange,
  sidebarOpen = false,
  mobileOpen = false,
  onCloseSidebar,
  onCloseMobile,
  account
}) {
  // Section collapse state (keyed by section title or index)
  const [collapsedMap, setCollapsedMap] = useState({});

  // Reset collapse state whenever switching portals
  useEffect(() => {
    setCollapsedMap({});
  }, [portalName]);

  // Auto-expand section containing the activeTab
  useEffect(() => {
    if (!activeTab) return;
    navSections.forEach((sec, idx) => {
      const key = sec.title || `sec-${idx}`;
      const hasActive = sec.items?.some(it => it.id === activeTab || it.page === activeTab);
      if (hasActive) {
        setCollapsedMap(prev => ({ ...prev, [key]: false }));
      }
    });
  }, [activeTab, navSections]);

  const toggleSection = (key, currentlyCollapsed) => {
    setCollapsedMap(prev => {
      const current = prev[key] !== undefined ? prev[key] : currentlyCollapsed;
      return { ...prev, [key]: !current };
    });
  };

  // Close drawer or sidebar on ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (mobileOpen && onCloseMobile) {
          onCloseMobile();
        } else if (sidebarOpen && onCloseSidebar) {
          onCloseSidebar();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, sidebarOpen, onCloseMobile, onCloseSidebar]);

  const displayRole = (account?.role || 'User').replace(/_/g, ' ');
  const displayName = account?.name || 'Authorized User';

  const isVisible = sidebarOpen || mobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="apna-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`apna-sidebar ${sidebarOpen ? 'desktop-open' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Sidebar navigation"
        aria-hidden={!isVisible}
      >
        {/* Sidebar Brand Header */}
        <div className="apna-sidebar-header">
          <div className="apna-sidebar-logo-frame">
            <ApnaCampusSymbol size={32} />
          </div>
          <div className="apna-sidebar-brand-text">
            <span className="apna-sidebar-title">{portalName}</span>
            <span className="apna-sidebar-subtitle">{portalSubtitle}</span>
          </div>

          {/* Close button (Mobile or Desktop dismiss) */}
          {mobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="apna-sidebar-close-btn"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Navigation List */}
        <nav className="apna-sidebar-nav">
          {navSections.map((sec, secIdx) => {
            const key = sec.title || `sec-${secIdx}`;
            // Every section with a title is collapsible as a dropdown box across all roles unless explicitly set to false
            const isCollapsible = Boolean(sec.title) && sec.collapsible !== false;
            const hasActive = sec.items?.some(it => it.id === activeTab || it.page === activeTab);
            const defaultCollapsed = sec.defaultCollapsed !== undefined ? sec.defaultCollapsed : !hasActive;
            const isCollapsed = isCollapsible && (collapsedMap[key] !== undefined ? collapsedMap[key] : defaultCollapsed);

            return (
              <div key={key} className={`apna-sidebar-section ${isCollapsible ? 'is-collapsible' : ''}`}>
                {sec.title && (
                  isCollapsible ? (
                    <button
                      type="button"
                      className="apna-sidebar-section-toggle"
                      onClick={() => toggleSection(key, isCollapsed)}
                      aria-expanded={!isCollapsed}
                    >
                      <span className="apna-sidebar-section-title">{sec.title}</span>
                      <span className="apna-sidebar-section-chevron">
                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      </span>
                    </button>
                  ) : (
                    <p className="apna-sidebar-section-title">{sec.title}</p>
                  )
                )}

                {!isCollapsed && sec.items?.map((item) => {
                  const Icon = item.icon || ShieldCheck;
                  const isActive = activeTab === item.id || activeTab === item.page;
                  const badgeText = item.badge !== undefined && item.badge !== null ? String(item.badge) : null;

                  return (
                    <button
                      key={item.id || item.page || item.label}
                      type="button"
                      className={`apna-sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (onTabChange) onTabChange(item.id || item.page);
                        if (mobileOpen && onCloseMobile) onCloseMobile();
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="apna-sidebar-item-icon">
                        <Icon size={18} />
                      </div>
                      <span className="apna-sidebar-item-label">{item.label}</span>
                      {badgeText && (
                        <span className={`apna-sidebar-badge ${item.badgeType || ''}`}>
                          {badgeText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer Role Card */}
        <div className="apna-sidebar-footer">
          <div className="apna-sidebar-role-card">
            <div className="apna-sidebar-role-kicker">AUTHORIZED SCOPE</div>
            <div className="apna-sidebar-role-name">{displayRole.toUpperCase()} · {displayName}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
