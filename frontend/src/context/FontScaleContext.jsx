import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'apna_font_scale';
const ACCESSIBILITY_STORAGE_KEY = 'apna_accessibility_settings';

export const FONT_SCALE_OPTIONS = [
  { id: 'small', label: 'Small', percentage: '87.5%', sizePx: '14px', desc: '87.5% (14px)' },
  { id: 'normal', label: 'Normal', percentage: '100%', sizePx: '16px', desc: '100% (16px)' },
  { id: 'large', label: 'Large', percentage: '112.5%', sizePx: '18px', desc: '112.5% (18px)' },
  { id: 'xlarge', label: 'Extra Large', percentage: '125%', sizePx: '20px', desc: '125% (20px)' },
];

const FontScaleContext = createContext(null);

export function FontScaleProvider({ children }) {
  // 1. Initial Scale: Check localStorage ('apna_font_scale' or accessibility settings)
  const [scale, setScaleState] = useState(() => {
    if (typeof window === 'undefined') return 'normal';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['small', 'normal', 'large', 'xlarge'].includes(stored)) {
        return stored;
      }
      const acc = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (acc) {
        const parsed = JSON.parse(acc);
        if (parsed.fontSize && ['small', 'normal', 'large', 'xlarge'].includes(parsed.fontSize)) {
          return parsed.fontSize;
        }
      }
    } catch (e) {
      console.warn('Failed to read font scale preference:', e);
    }
    return 'normal';
  });

  // 2. Synchronize DOM (Root HTML font-size and classes)
  const applyScaleToDOM = useCallback((newScale) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const opt = FONT_SCALE_OPTIONS.find((o) => o.id === newScale) || FONT_SCALE_OPTIONS[1];

    // Remove legacy font-size classes
    root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge');
    root.classList.add(`font-size-${newScale}`);

    // Set dataset attributes for easy CSS selector binding
    root.setAttribute('data-font-size', newScale);
    root.setAttribute('data-scale', newScale);

    // Set root CSS variable so rem units calculate instantaneously
    root.style.setProperty('--app-font-size', opt.sizePx);
    root.style.fontSize = opt.sizePx;
  }, []);

  // 3. Update Font Scale
  const setScale = useCallback((newScale) => {
    if (!['small', 'normal', 'large', 'xlarge'].includes(newScale)) return;
    setScaleState(newScale);

    try {
      localStorage.setItem(STORAGE_KEY, newScale);

      // Keep accessibility settings in sync
      const acc = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      const accObj = acc ? JSON.parse(acc) : {};
      accObj.fontSize = newScale;
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(accObj));
    } catch (e) {
      console.warn('Failed to save font scale:', e);
    }

    applyScaleToDOM(newScale);

    // Notify any components listening to font scale changes (e.g. Recharts canvas resizing)
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('apna_font_scale_changed', { detail: { scale: newScale } }));
      // Also trigger a window resize event so Recharts ResponsiveContainer recalibrates
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  }, [applyScaleToDOM]);

  // Initial mount application
  useEffect(() => {
    applyScaleToDOM(scale);
  }, [scale, applyScaleToDOM]);

  // Listen for storage events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue && ['small', 'normal', 'large', 'xlarge'].includes(e.newValue)) {
        setScaleState(e.newValue);
        applyScaleToDOM(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [applyScaleToDOM]);

  const value = useMemo(() => ({
    scale,
    setScale,
    options: FONT_SCALE_OPTIONS,
    activeOption: FONT_SCALE_OPTIONS.find((o) => o.id === scale) || FONT_SCALE_OPTIONS[1],
  }), [scale, setScale]);

  return (
    <FontScaleContext.Provider value={value}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const context = useContext(FontScaleContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      scale: 'normal',
      setScale: () => {},
      options: FONT_SCALE_OPTIONS,
      activeOption: FONT_SCALE_OPTIONS[1],
    };
  }
  return context;
}

