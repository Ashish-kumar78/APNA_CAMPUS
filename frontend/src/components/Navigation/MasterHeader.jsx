import React from 'react';
import { Menu, LogOut, ChevronRight } from 'lucide-react';
import './MasterNavigation.css';

/**
 * Standardized MasterHeader Component across all Apna Campus ERP portals.
 */
export default function MasterHeader({
  sidebarOpen,
  onToggleSidebar,
  breadcrumbs = [],
  title,
  actions,
  badgeText,
  badgeVariant = 'primary',
  account,
  userInitials,
  userSubtitle,
  onLogout,
  onSwitchRole
}) {
  const displayName = account?.name || 'Authorized User';
  const displayRole = userSubtitle || account?.role || 'Staff Member';
  const initials = userInitials || displayName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'AC';

  return (
    <header className="master-header">
      <div className="master-header-left">
        {onToggleSidebar && !sidebarOpen && (
          <button
            type="button"
            className="master-header-hamburger"
            onClick={onToggleSidebar}
            title="Open Navigation"
            aria-label="Open Navigation"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="master-header-titles">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="master-header-breadcrumbs">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={12} color="#94A3B8" />}
                  <span style={{ color: idx === breadcrumbs.length - 1 ? '#2563EB' : '#64748B', fontWeight: idx === breadcrumbs.length - 1 ? 700 : 500 }}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
          {title && <h2 className="master-header-title">{title}</h2>}
        </div>
      </div>

      <div className="master-header-right">
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}

        {badgeText && (
          <div style={{
            fontSize: '11px',
            background: badgeVariant === 'success' ? '#ECFDF5' : '#EFF6FF',
            color: badgeVariant === 'success' ? '#047857' : '#1D4ED8',
            padding: '5px 10px',
            borderRadius: '12px',
            fontWeight: 700,
            border: `1px solid ${badgeVariant === 'success' ? '#A7F3D0' : '#BFDBFE'}`,
            whiteSpace: 'nowrap'
          }}>
            {badgeText}
          </div>
        )}

        {onSwitchRole && (
          <button
            type="button"
            onClick={() => onSwitchRole('student')}
            title="Switch Portal Role"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Switch Role
          </button>
        )}

        {/* Standard User Profile Pill */}
        <div className="campus-user-pill" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 8px 4px 4px',
          borderRadius: '999px',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2563EB',
            color: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
            fontSize: '12px',
            fontWeight: 800,
            flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left', lineHeight: 1.2 }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {displayName}
            </strong>
            <small style={{ fontSize: '10.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {displayRole}
            </small>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#EF4444',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'grid',
                placeItems: 'center',
                marginLeft: '4px'
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
