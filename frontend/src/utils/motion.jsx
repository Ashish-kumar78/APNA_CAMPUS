/**
 * APNA CAMPUS — Centralized Enterprise Motion & Animation Design System
 * 
 * Consistent durations, easing curves, and utilities across all 15+ portals.
 * Respects 'prefers-reduced-motion' for accessibility and optimal performance.
 */

import React, { useState, useEffect, useRef } from 'react';

// Enterprise timing tokens (in milliseconds)
export const MOTION_DURATIONS = {
  micro: 120,       // Hover, active tap, badge pop
  input: 160,       // Form focus, button states, checkmarks
  card: 220,        // Card lift, tab toggle, drawer peek
  modal: 260,       // Modal fade/scale, drawer slide
  chart: 600,       // Progressive chart reveal, metric count-up
};

// Enterprise cubic-bezier easing curves
export const MOTION_EASINGS = {
  // Ultra-smooth deceleration curve for natural, premium enterprise feel
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
};

/**
 * Hook to detect whether the user has requested reduced motion in their OS
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setPrefersReduced(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReduced;
}

/**
 * Extracts numeric parts and text tokens from formatted strings (e.g., "$12,450", "98.5%", "₹ 4,50,000")
 */
function parseNumericValue(value) {
  if (typeof value === 'number') {
    return { isNumeric: true, prefix: '', targetNum: value, suffix: '', decimals: Number.isInteger(value) ? 0 : 2, hasCommas: false };
  }

  if (typeof value !== 'string') {
    return { isNumeric: false, raw: String(value ?? '') };
  }

  const trimmed = value.trim();
  // Regex to match prefix, number (with optional commas/decimals), and suffix
  const match = trimmed.match(/^([^0-9.-]*)([0-9,]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) {
    return { isNumeric: false, raw: trimmed };
  }

  const prefix = match[1];
  const numStr = match[2];
  const suffix = match[3];

  const hasCommas = numStr.includes(',');
  const cleanNumStr = numStr.replace(/,/g, '');
  const parsed = parseFloat(cleanNumStr);

  if (Number.isNaN(parsed)) {
    return { isNumeric: false, raw: trimmed };
  }

  const decimalPart = cleanNumStr.split('.')[1];
  const decimals = decimalPart ? decimalPart.length : 0;

  return {
    isNumeric: true,
    prefix,
    targetNum: parsed,
    suffix,
    decimals,
    hasCommas,
  };
}

/**
 * Hook to count up from 0 to real backend value smoothly on mount or data change.
 * Uses requestAnimationFrame with cubic ease-out. Never uses fake data.
 */
export function useCountUp(rawValue, duration = 600) {
  const prefersReduced = usePrefersReducedMotion();
  const parsed = parseNumericValue(rawValue);

  const [displayValue, setDisplayValue] = useState(() => {
    if (!parsed.isNumeric || prefersReduced) return rawValue;
    return `${parsed.prefix}0${parsed.suffix}`;
  });

  const prevTargetRef = useRef(parsed.isNumeric ? parsed.targetNum : null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // If not numeric or user prefers reduced motion, render target immediately
    if (!parsed.isNumeric || prefersReduced) {
      setDisplayValue(rawValue);
      return;
    }

    const startNum = 0;
    const targetNum = parsed.targetNum;
    const startTime = performance.now();

    const formatNum = (current) => {
      let formatted = parsed.decimals > 0 ? current.toFixed(parsed.decimals) : Math.round(current).toString();
      if (parsed.hasCommas) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      return `${parsed.prefix}${formatted}${parsed.suffix}`;
    };

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic: 1 - pow(1 - x, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = startNum + (targetNum - startNum) * easeOut;

      setDisplayValue(formatNum(currentVal));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(formatNum(targetNum));
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [rawValue, prefersReduced, duration, parsed.targetNum, parsed.isNumeric]);

  return displayValue;
}

/**
 * Drop-in Animated Counter Component
 * Safely wraps actual backend values (e.g., <CountUpNumber value={stat.val} />)
 */
export function CountUpNumber({ value, className = '' }) {
  const animated = useCountUp(value, 650);
  return <span className={`count-up-number ${className}`}>{animated}</span>;
}

/**
 * Animated Container for Page Views, Modals & Tab Content
 */
export function MotionPageWrapper({ children, className = '', id }) {
  return (
    <div id={id} className={`campus-page-enter ${className}`}>
      {children}
    </div>
  );
}

