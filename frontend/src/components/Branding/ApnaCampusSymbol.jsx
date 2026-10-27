import React from 'react';

/**
 * Apna Campus Distinctive Emblem Symbol
 * Displays the official Apna Campus logo across all portals, headers, and sidebars.
 */
export default function ApnaCampusSymbol({ size = 36, className = '', style = {} }) {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  return (
    <img
      src="/logo.png"
      alt="Apna Campus Logo"
      className={`apna-campus-symbol-img ${className}`}
      style={{
        height: dimension,
        width: 'auto',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

