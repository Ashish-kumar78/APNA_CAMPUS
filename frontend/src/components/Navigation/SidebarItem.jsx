import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * SidebarItem: Individual navigation menu item button.
 * Supports active blue glow, icon, truncated label, and badges.
 * Built with rem/em units for full text-scaling compatibility.
 */
export default function SidebarItem({
  item,
  isActive = false,
  onSelect,
  isCollapsed = false,
}) {
  if (!item) return null;

  const Icon = item.icon || ShieldCheck;
  const itemId = item.id || item.page || item.route;
  const badgeText = item.badge !== undefined && item.badge !== null ? String(item.badge) : null;
  const badgeType = item.badgeType || (item.badge === 'CIA' ? 'warning' : '');

  const handleClick = (e) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(itemId);
    }
  };

  return (
    <button
      type="button"
      className={`apna-sidebar-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      title={item.label}
      role="menuitem"
    >
      <div className="apna-sidebar-item-icon" aria-hidden="true">
        <Icon size={18} />
      </div>
      
      {!isCollapsed && (
        <span className="apna-sidebar-item-label truncate min-w-0" title={item.label}>
          {item.label}
        </span>
      )}

      {!isCollapsed && badgeText && (
        <span className={`apna-sidebar-badge ${badgeType}`}>
          {badgeText}
        </span>
      )}
    </button>
  );
}

