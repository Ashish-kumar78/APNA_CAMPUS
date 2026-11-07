import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * SidebarSection: Collapsible section grouping menu items with uppercase title
 * and accordion chevron toggle. Remembers expand/collapse state.
 */
export default function SidebarSection({
  title,
  isCollapsible = true,
  isCollapsed = false,
  onToggle,
  children
}) {
  return (
    <div className={`apna-sidebar-section ${isCollapsible ? 'is-collapsible' : ''}`}>
      {title && (
        isCollapsible ? (
          <button
            type="button"
            className="apna-sidebar-section-toggle"
            onClick={onToggle}
            aria-expanded={!isCollapsed}
          >
            <span className="apna-sidebar-section-title truncate min-w-0" title={title}>
              {title}
            </span>
            <span className="apna-sidebar-section-chevron" aria-hidden="true">
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </span>
          </button>
        ) : (
          <p className="apna-sidebar-section-title truncate min-w-0" title={title}>
            {title}
          </p>
        )
      )}

      <div
        className={`apna-sidebar-section-content ${isCollapsed ? 'collapsed' : 'expanded'}`}
        style={{ display: isCollapsed ? 'none' : 'block' }}
      >
        {children}
      </div>
    </div>
  );
}

