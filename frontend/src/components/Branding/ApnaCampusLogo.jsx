import React from 'react';
import ApnaCampusSymbol from './ApnaCampusSymbol';

/**
 * Apna Campus Full Branding Component
 * Includes the distinctive symbol and modern institutional typography.
 */
export default function ApnaCampusLogo({
  symbolSize = 34,
  theme = 'dark', // 'dark' (for white backgrounds) or 'light' (for dark navy headers)
  subtitle = 'Autonomous College Management System',
  className = '',
  style = {},
}) {
  const isLight = theme === 'light';

  return (
    <div
      className={`apna-campus-brand-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        ...style,
      }}
    >
      <ApnaCampusSymbol size={symbolSize} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: `${Math.max(15, symbolSize * 0.48)}px`,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: isLight ? '#ffffff' : '#0f2b48',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          APNA <span style={{ color: '#2563eb' }}>CAMPUS</span>
        </span>
        {subtitle && (
          <span
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: `${Math.max(8.5, symbolSize * 0.25)}px`,
              fontWeight: 500,
              color: isLight ? '#93c5fd' : '#64748b',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
