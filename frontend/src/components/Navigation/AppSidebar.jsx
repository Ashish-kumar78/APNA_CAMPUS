import React, { useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';

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
            <img src="/logo.png" alt="Apna Campus Logo" className="apna-sidebar-logo" />
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
          {navSections.map((sec, secIdx) => (
            <div key={sec.title || `sec-${secIdx}`} className="apna-sidebar-section">
              {sec.title && (
                <p className="apna-sidebar-section-title">{sec.title}</p>
              )}
              {sec.items?.map((item) => {
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
          ))}
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
