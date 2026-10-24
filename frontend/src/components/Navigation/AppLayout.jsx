import React, { useState, useEffect, useMemo } from 'react';
import './Navigation.css';
import AppHeader from './AppHeader.jsx';
import AppSidebar from './AppSidebar.jsx';
import BreadcrumbRow from './BreadcrumbRow.jsx';
import PageHeader from './PageHeader.jsx';

export default function AppLayout({
  account,
  portalName = 'Apna Campus',
  portalSubtitle = 'Autonomous Higher Education',
  portalHomeTab = 'dashboard',
  navSections = [],
  activeTab = 'dashboard',
  onTabChange,
  onLogout,
  unreadCount = 0,
  onNotificationClick,
  breadcrumbs,
  pageTitle,
  pageSubtitle,
  pageActions,
  children
}) {
  // Sidebar state: Completely hidden by default on login.
  // Persists only if explicitly opened by the user.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem('apna_sidebar_open') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);



  // Close mobile drawer on navigation / activeTab change
  useEffect(() => {
    setMobileOpen(false);
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

  // Compute active item metadata for breadcrumbs and page titles
  const allNavItems = useMemo(() => {
    return navSections.flatMap(sec => sec.items || []);
  }, [navSections]);

  const activeNavItem = useMemo(() => {
    return allNavItems.find(item => item.id === activeTab || item.page === activeTab) || null;
  }, [allNavItems, activeTab]);

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

  return (
    <div className={`apna-app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* 1. Global Top Navigation Bar */}
      <AppHeader
        account={account}
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
        onLogout={onLogout}
        unreadCount={unreadCount}
        onNotificationClick={onNotificationClick}
        portalName={portalName}
      />

      {/* 2. Standardized Breadcrumb Row */}
      <BreadcrumbRow
        items={computedBreadcrumbs}
        onNavigateHome={() => {
          if (onTabChange) onTabChange(portalHomeTab);
        }}
      />

      {/* 3. Body: Left Sidebar + Main Content Area */}
      <div className="apna-layout-body">
        {/* Reusable Left Sidebar */}
        <AppSidebar
          portalName={portalName}
          portalSubtitle={portalSubtitle}
          navSections={navSections}
          activeTab={activeTab}
          onTabChange={onTabChange}
          sidebarOpen={sidebarOpen}
          mobileOpen={mobileOpen}
          onCloseSidebar={handleCloseSidebar}
          onCloseMobile={() => setMobileOpen(false)}
          account={account}
        />

        {/* Main Workspace */}
        <main className="apna-main-workspace" role="main" id="main-content">
          {/* Standardized Page Heading Area (only for secondary pages, avoiding duplicate dashboard titles) */}
          {shouldRenderPageHeader && (
            <PageHeader
              title={resolvedPageTitle}
              subtitle={resolvedPageSubtitle}
              actions={pageActions}
            />
          )}

          {/* Page / Dashboard Content */}
          <div className="apna-page-content">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
