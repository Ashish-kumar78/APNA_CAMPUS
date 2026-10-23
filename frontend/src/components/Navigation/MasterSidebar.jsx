import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import './MasterNavigation.css';

/**
 * Standard persistent sidebar state hook.
 * Remembers open/collapsed preference across reloads and logins.
 */
export function useMasterSidebarState(initialDefault = false) {
  const [sidebarOpen, setSidebarOpenState] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('apna_campus_sidebar_open');
        if (saved !== null) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      // ignore
    }
    return initialDefault;
  });

  const setSidebarOpen = useCallback((val) => {
    setSidebarOpenState((prev) => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('apna_campus_sidebar_open', JSON.stringify(nextVal));
          localStorage.setItem('apna_campus_sidebar_open', JSON.stringify(nextVal));
        }
      } catch (e) {
        // ignore
      }
      return nextVal;
    });
  }, []);

  return [sidebarOpen, setSidebarOpen];
}

/**
 * Standardized badge component adhering to Apna Campus ERP guidelines.
 */
export function MasterNavBadge({ variant = 'neutral', count, text }) {
  const content = count !== undefined && count !== null ? count : text;
  if (content === undefined || content === null || content === '') return null;

  const variantClass = `badge-${variant}`;
  return (
    <span className={`master-nav-badge ${variantClass}`}>
      {content}
    </span>
  );
}

/**
 * Standardized sidebar header with Apna Campus logo, product name, role subtitle,
 * and unified collapse / close button.
 */
export function MasterSidebarHeader({ roleTitle, isCollapsed, onToggle, isMobile, onCloseMobile }) {
  return (
    <div className="master-sidebar-header">
      <div className="master-brand-block" title="Apna Campus">
        <div className="master-brand-logo-frame">
          <img src="/logo.png" alt="Apna Campus" className="master-brand-logo-img" />
        </div>
        {!isCollapsed && (
          <div className="master-brand-info">
            <h1 className="master-brand-name">Apna Campus</h1>
            <span className="master-brand-role">{roleTitle || 'CAMPUS ERP'}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="master-sidebar-toggle-btn"
        onClick={isMobile ? onCloseMobile : onToggle}
        title={isMobile ? 'Close Navigation' : isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        aria-label={isMobile ? 'Close Navigation' : isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isMobile ? (
          <X size={16} />
        ) : isCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    </div>
  );
}

/**
 * Standardized Section Title
 */
export function MasterNavSection({ title, children }) {
  return (
    <div className="master-nav-section-wrapper">
      {title && <div className="master-nav-section-title">{title}</div>}
      {children}
    </div>
  );
}

/**
 * Standardized Navigation Menu Item
 */
export function MasterNavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  badgeVariant = 'neutral',
  onClick,
  isChild = false,
  dataTooltip
}) {
  return (
    <button
      type="button"
      className={`master-nav-item ${active ? 'active' : ''} ${isChild ? 'child' : ''}`}
      onClick={onClick}
      data-tooltip={dataTooltip || label}
      aria-current={active ? 'page' : undefined}
    >
      {Icon && <Icon size={20} />}
      <span className="master-nav-item-label">{label}</span>
      {badge !== undefined && badge !== null && (
        <MasterNavBadge variant={badgeVariant} count={typeof badge === 'number' ? badge : undefined} text={typeof badge !== 'number' ? badge : undefined} />
      )}
    </button>
  );
}

/**
 * Standardized Collapsible Navigation Group
 */
export function MasterNavCollapsible({
  title,
  isOpen,
  onToggle,
  children
}) {
  return (
    <div className="master-nav-collapsible-wrapper">
      <button
        type="button"
        className="master-nav-collapsible-btn"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown size={14} className={`master-nav-collapsible-icon ${isOpen ? 'open' : ''}`} />
      </button>
      <div className={`master-nav-collapsible-items ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Standardized Sidebar Footer CTA
 */
export function MasterSidebarFooter({ children }) {
  if (!children) return null;
  return <div className="master-sidebar-footer">{children}</div>;
}

/**
 * MasterSidebar: Universal Enterprise Sidebar for Apna Campus ERP.
 */
export default function MasterSidebar({
  roleTitle = 'CAMPUS ERP',
  isOpen = true,
  onToggle,
  isCollapsed = false,
  sections,
  footer,
  children
}) {
  // Determine if on mobile viewport
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escape key closes mobile drawer
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onToggle) {
        onToggle(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen, onToggle]);

  const handleCloseMobile = () => {
    if (onToggle) onToggle(false);
  };

  // If mobile and closed, don't show drawer
  const mobileClass = isMobile ? (isOpen ? 'open-mobile' : '') : '';
  const collapsedClass = !isMobile && isCollapsed ? 'collapsed' : '';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          className="master-mobile-backdrop"
          onClick={handleCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`master-sidebar ${collapsedClass} ${mobileClass}`}>
        <MasterSidebarHeader
          roleTitle={roleTitle}
          isCollapsed={!isMobile && isCollapsed}
          onToggle={onToggle}
          isMobile={isMobile}
          onCloseMobile={handleCloseMobile}
        />

        <nav className="master-sidebar-nav" aria-label={`${roleTitle} Navigation`}>
          {sections && Array.isArray(sections) ? (
            sections.map((sec, secIdx) => (
              <MasterNavSection key={sec.title || secIdx} title={sec.title}>
                {sec.items?.map((item) => (
                  <MasterNavItem
                    key={item.id || item.label}
                    icon={item.icon}
                    label={item.label}
                    active={item.active}
                    badge={item.badge?.count ?? item.badge}
                    badgeVariant={item.badge?.variant || 'neutral'}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      if (isMobile) handleCloseMobile();
                    }}
                  />
                ))}
              </MasterNavSection>
            ))
          ) : (
            children
          )}
        </nav>

        {footer && <MasterSidebarFooter>{footer}</MasterSidebarFooter>}
      </aside>
    </>
  );
}
