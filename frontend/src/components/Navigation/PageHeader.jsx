import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  actions,
  className = ''
}) {
  if (!title && !subtitle && !actions) return null;

  return (
    <div className={`apna-page-header ${className}`} role="region" aria-label="Page Header">
      <div className="apna-page-title-group">
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </div>

      {actions && (
        <div className="apna-page-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
