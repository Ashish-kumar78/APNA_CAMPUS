import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export default function BreadcrumbRow({ items = [], onNavigateHome }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="apna-breadcrumb-bar" aria-label="Breadcrumb navigation">
      <nav className="apna-breadcrumbs">
        {/* Root Home item */}
        <button
          type="button"
          className="apna-breadcrumb-item"
          onClick={onNavigateHome || (items[0]?.onClick ? items[0].onClick : undefined)}
          title="Return to Home Dashboard"
          aria-label="Home"
        >
          <Home size={13} style={{ marginTop: '-1px' }} />
          <span>Home</span>
        </button>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <ChevronRight size={12} className="apna-breadcrumb-separator" aria-hidden="true" />
              {isLast || !item.onClick ? (
                <span className={`apna-breadcrumb-item ${isLast ? 'active' : ''}`} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  className="apna-breadcrumb-item"
                  onClick={item.onClick}
                  title={`Navigate to ${item.label}`}
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
