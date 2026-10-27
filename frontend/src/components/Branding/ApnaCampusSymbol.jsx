import React from 'react';

/**
 * Apna Campus Distinctive Emblem Symbol
 * Represents education (academic cap & open book gateway),
 * technology (circuit nexus node), and student empowerment in royal blue,
 * deep navy, white, and emerald green accent.
 */
export default function ApnaCampusSymbol({ size = 36, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Apna Campus Emblem"
    >
      <defs>
        <linearGradient id="ac-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0f2b48" />
        </linearGradient>
        <linearGradient id="ac-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="ac-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="ac-shadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Rounded Hexagon / Shield Backdrop */}
      <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#ac-blue-grad)" filter="url(#ac-shadow)" />
      
      {/* Subtle Inner Accent Border */}
      <rect x="7" y="7" width="86" height="86" rx="21" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />

      {/* Graduation Cap / Gateway Roof */}
      <path
        d="M50 20 L78 34 L50 48 L22 34 Z"
        fill="#ffffff"
      />
      {/* Tassel */}
      <path d="M78 34 L78 52 C78 54 75 56 75 58" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="75" cy="59" r="2" fill="#facc15" />

      {/* Open Book Pages / Academic Foundation */}
      <path
        d="M26 52 C36 49 46 51 50 54 C54 51 64 49 74 52 L74 72 C64 69 54 70 50 74 C46 70 36 69 26 72 Z"
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Book Center Spine */}
      <line x1="50" y1="54" x2="50" y2="74" stroke="#0f2b48" strokeWidth="2" strokeLinecap="round" />

      {/* Technology / AI Circuit Nodes */}
      <circle cx="34" cy="62" r="2.2" fill="#0284c7" />
      <circle cx="66" cy="62" r="2.2" fill="#0284c7" />
      <line x1="34" y1="62" x2="43" y2="62" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      <line x1="66" y1="62" x2="57" y2="62" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="1.5 1.5" />

      {/* Vibrant Green Growth Accent Star / Leaf at Base */}
      <g transform="translate(50, 78)">
        <circle cx="0" cy="0" r="3.5" fill="url(#ac-green-grad)" />
        <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
      </g>
    </svg>
  );
}
