import React from 'react';

export default function ApnaCampusLogo({ size = 36, className = '', style = {}, showText = false }) {
  return (
    <span
      className={`apna-campus-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      <img
        src="/logo.png"
        alt="Apna Campus Logo"
        style={{
          height: typeof size === 'number' ? `${size}px` : size,
          width: 'auto',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {showText && (
        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
          Apna Campus
        </span>
      )}
    </span>
  );
}
