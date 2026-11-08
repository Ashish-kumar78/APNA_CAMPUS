import React, { useState, useEffect, useMemo } from 'react';
import './Navigation.css';
import AppHeader from './AppHeader.jsx';
import Sidebar from './Sidebar.jsx';
import AppSidebar from './AppSidebar.jsx';
import { getMenuConfigForRole } from '../../config/menuConfig/index.js';
import BreadcrumbRow from './BreadcrumbRow.jsx';
import PageHeader from './PageHeader.jsx';
import InstitutionalNotificationDrawer from './InstitutionalNotificationDrawer.jsx';
import AccessibilityPanel from '../Accessibility/AccessibilityPanel.jsx';
import ScreenReaderAnnouncer from '../Accessibility/ScreenReaderAnnouncer.jsx';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';

export default function AppLayout({
  account,
  portalName = 'Apna Campus',
  portalSubtitle = 'Autonomous Higher Education',
  portalHomeTab = 'dashboard',
  navSections = [],
  activeTab = 'dashboard',
  onTabChange,
  onLogout,
  breadcrumbs,
  hideBreadcrumbs = false,
  pageTitle,
  pageSubtitle,
  pageActions = null,
  defaultSidebarOpen,
  children
}) {
  // Sidebar state: open by default on desktop if not explicitly set
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_sidebar_open');
      if (stored !== null) return stored === 'true';
      if (defaultSidebarOpen !== undefined) return Boolean(defaultSidebarOpen);
      return typeof window !== 'undefined' ? window.innerWidth > 1024 : true;
    } catch {
      return true;
    }
  });

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const mainWorkspaceRef = React.useRef(null);

  // Close mobile drawer on navigation / activeTab change & reset workspace scroll
  useEffect(() => {
    setMobileOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (mainWorkspaceRef.current) {
      try {
        mainWorkspaceRef.current.scrollTo({ top: 0, behavior: 'instant' });
      } catch {
        mainWorkspaceRef.current.scrollTop = 0;
      }
    }
  }, [activeTab]);

  // Toggle sidebar on desktop, drawer on mobile
  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setMobileOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => {
        const next = !prev;
        try {
          localStorage.setItem('apna_sidebar_open', String(next));
        } catch {}
        return next;
      });
    }
  };

  const handleCloseSidebar = () => {
    if (window.innerWidth <= 1024) {
      setMobileOpen(false);
    } else {
      setSidebarOpen(false);
      try {
        localStorage.setItem('apna_sidebar_open', 'false');
      } catch {}
    }
  };



  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        handleToggleSidebar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resolve navSections: use explicit props if supplied, or fallback to role-driven menuConfig
  const effectiveNavSections = useMemo(() => {
    if (navSections && navSections.length > 0) return navSections;
    return getMenuConfigForRole(account?.role, { account });
  }, [navSections, account]);

  // Compute active item metadata for breadcrumbs and page titles
  const allNavItems = useMemo(() => {
    return effectiveNavSections.flatMap(sec => sec.items || []);
  }, [effectiveNavSections]);

  const activeNavItem = useMemo(() => {
    return allNavItems.find(item => item.id === activeTab || item.page === activeTab) || null;
  }, [allNavItems, activeTab]);

  // Voice Navigation listener: match spoken requests to navigation tabs
  useEffect(() => {
    const handleVoiceNav = (e) => {
      const target = e.detail?.targetTab;
      if (!target || !onTabChange) return;

      const matched = allNavItems.find(
        item => item.id === target || item.id.toLowerCase().includes(target.toLowerCase())
      );
      if (matched) {
        onTabChange(matched.id);
      } else {
        onTabChange(target);
      }
    };
    window.addEventListener('apna_campus_voice_navigate', handleVoiceNav);
    return () => window.removeEventListener('apna_campus_voice_navigate', handleVoiceNav);
  }, [allNavItems, onTabChange]);

  // Compute Breadcrumb items
  const computedBreadcrumbs = useMemo(() => {
    if (breadcrumbs && breadcrumbs.length > 0) return breadcrumbs;

    const items = [
      {
        label: portalName,
        onClick: () => {
          if (onTabChange) onTabChange(portalHomeTab);
        }
      }
    ];

    if (activeNavItem && (activeNavItem.id !== portalHomeTab && activeNavItem.page !== portalHomeTab)) {
      items.push({
        label: activeNavItem.label,
        active: true
      });
    } else {
      items.push({
        label: activeNavItem?.label || 'Dashboard',
        active: true
      });
    }

    return items;
  }, [breadcrumbs, portalName, portalHomeTab, activeNavItem, onTabChange]);

  // Compute default Page Title and Subtitle if not explicitly provided
  const resolvedPageTitle = pageTitle !== undefined ? pageTitle : (activeNavItem?.label || 'Dashboard');
  const resolvedPageSubtitle = pageSubtitle !== undefined ? pageSubtitle : (activeNavItem?.subtitle || '');

  // Detect whether currently on the home dashboard view to prevent duplicate headers
  const isDashboardTab =
    activeTab === portalHomeTab ||
    activeTab === 'dashboard' ||
    activeTab === 'governance' ||
    activeTab === 'overview';

  const shouldRenderPageHeader =
    !isDashboardTab &&
    Boolean(resolvedPageTitle || resolvedPageSubtitle || pageActions);

  const shouldHideBreadcrumbs = hideBreadcrumbs || isDashboardTab;

  return (
    <div className={`apna-app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${shouldHideBreadcrumbs ? 'no-breadcrumbs' : ''}`}>
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a href="#main-content" className="skip-to-main-link">
        Skip to main content
      </a>

      {/* Screen Reader Live Region Announcer */}
      <ScreenReaderAnnouncer />

      {/* Centralized Accessibility Panel */}
      <AccessibilityPanel />

      {/* 1. Global Top Navigation Bar */}
      <AppHeader
        account={account}
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
        onLogout={onLogout}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onViewProfile={() => onTabChange && onTabChange('profile')}
        portalName={portalName}
      />

      {/* 2. Standardized Breadcrumb Row */}
      {!shouldHideBreadcrumbs && (
        <BreadcrumbRow
          items={computedBreadcrumbs}
          onNavigateHome={() => {
            if (onTabChange) onTabChange(portalHomeTab);
          }}
        />
      )}

      {/* 3. Body: Left Sidebar + Main Content Area */}
      <div className="apna-layout-body">
        {/* Fixed Left Sidebar */}
        <Sidebar
          portalName={portalName}
          portalSubtitle={portalSubtitle}
          portalHomeTab={portalHomeTab}
          navSections={effectiveNavSections}
          activeTab={activeTab}
          onTabChange={onTabChange}
          sidebarOpen={sidebarOpen}
          mobileOpen={mobileOpen}
          onCloseSidebar={handleCloseSidebar}
          onCloseMobile={() => setMobileOpen(false)}
          account={account}
        />

        {/* Main Workspace */}
        <main ref={mainWorkspaceRef} className="apna-main-workspace" role="main" id="main-content">
          {/* Standardized Page Heading Area (only for secondary pages, avoiding duplicate dashboard titles) */}
          {shouldRenderPageHeader && (
            <PageHeader
              title={resolvedPageTitle}
              subtitle={resolvedPageSubtitle}
              actions={pageActions}
            />
          )}

          {/* Page / Dashboard Content with Smooth Route Transition */}
          <div className="apna-page-content" key={activeTab}>
            {children}
          </div>
        </main>
      </div>

      <InstitutionalNotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        account={account}
        onNavigateTab={onTabChange}
      />
    </div>
  );
}
