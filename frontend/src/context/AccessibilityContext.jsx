import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'apna_accessibility_settings';

const DEFAULT_SETTINGS = {
  fontSize: 'normal',       // 'small' | 'normal' | 'large' | 'xlarge'
  theme: 'system',          // 'light' | 'dark' | 'system'
  highContrast: false,      // boolean
  reducedMotion: 'auto',    // 'auto' | 'reduce' | 'no-preference'
  voiceNavEnabled: false,   // boolean
};

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  // Load initial settings safely from localStorage
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse stored accessibility settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({ message: '', priority: 'polite', id: 0 });

  // Screen reader announcer helper
  const announce = useCallback((message, priority = 'polite') => {
    if (!message) return;
    setAnnouncement({ message, priority, id: Date.now() });
  }, []);

  // Set individual setting
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (key === 'fontSize') {
          localStorage.setItem('apna_font_scale', value);
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('apna_font_scale_changed', { detail: { scale: value } }));
          }
        }
      } catch (e) {
        console.warn('Failed to save accessibility setting:', e);
      }
      return updated;
    });
  }, []);

  // Reset to default settings
  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {}
    announce('Accessibility settings have been reset to default values.', 'polite');
  }, [announce]);

  // Apply settings to DOM elements (HTML and Body classes & attributes)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // 1. Font Size Class
    root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge');
    root.classList.add(`font-size-${settings.fontSize}`);
    root.setAttribute('data-font-size', settings.fontSize);

    // 2. High Contrast Class
    if (settings.highContrast) {
      root.classList.add('high-contrast');
      root.setAttribute('data-contrast', 'high');
    } else {
      root.classList.remove('high-contrast');
      root.removeAttribute('data-contrast');
    }

    // 3. Theme Application (Light / Dark / System)
    const applyTheme = () => {
      let effectiveTheme = settings.theme;
      if (settings.theme === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = prefersDark ? 'dark' : 'light';
      }

      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        if (body) body.classList.add('dark-theme');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        if (body) body.classList.remove('dark-theme');
      }
    };

    applyTheme();

    // Listen for OS theme changes if theme === 'system'
    let themeMediaQuery = null;
    let handleThemeChange = null;
    if (settings.theme === 'system' && window.matchMedia) {
      themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      handleThemeChange = () => applyTheme();
      if (themeMediaQuery.addEventListener) {
        themeMediaQuery.addEventListener('change', handleThemeChange);
      } else if (themeMediaQuery.addListener) {
        themeMediaQuery.addListener(handleThemeChange);
      }
    }

    // 4. Reduced Motion Application
    const applyMotion = () => {
      let isReduced = false;
      if (settings.reducedMotion === 'reduce') {
        isReduced = true;
      } else if (settings.reducedMotion === 'no-preference') {
        isReduced = false;
      } else {
        // 'auto': respect OS preference
        isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }

      if (isReduced) {
        root.classList.add('reduced-motion');
        root.setAttribute('data-reduced-motion', 'true');
      } else {
        root.classList.remove('reduced-motion');
        root.removeAttribute('data-reduced-motion');
      }
    };

    applyMotion();

    let motionMediaQuery = null;
    let handleMotionChange = null;
    if (settings.reducedMotion === 'auto' && window.matchMedia) {
      motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      handleMotionChange = () => applyMotion();
      if (motionMediaQuery.addEventListener) {
        motionMediaQuery.addEventListener('change', handleMotionChange);
      } else if (motionMediaQuery.addListener) {
        motionMediaQuery.addListener(handleMotionChange);
      }
    }

    return () => {
      if (themeMediaQuery && handleThemeChange) {
        if (themeMediaQuery.removeEventListener) {
          themeMediaQuery.removeEventListener('change', handleThemeChange);
        } else if (themeMediaQuery.removeListener) {
          themeMediaQuery.removeListener(handleThemeChange);
        }
      }
      if (motionMediaQuery && handleMotionChange) {
        if (motionMediaQuery.removeEventListener) {
          motionMediaQuery.removeEventListener('change', handleMotionChange);
        } else if (motionMediaQuery.removeListener) {
          motionMediaQuery.removeListener(handleMotionChange);
        }
      }
    };
  }, [settings]);

  // Global Keyboard Shortcuts (Alt+A to toggle Accessibility Panel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + A (or Option + A on Mac)
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = {
    ...settings,
    setFontSize: (size) => updateSetting('fontSize', size),
    setTheme: (theme) => updateSetting('theme', theme),
    setHighContrast: (enabled) => updateSetting('highContrast', Boolean(enabled)),
    setReducedMotion: (mode) => updateSetting('reducedMotion', mode),
    setVoiceNavEnabled: (enabled) => updateSetting('voiceNavEnabled', Boolean(enabled)),
    isPanelOpen,
    openPanel: () => setIsPanelOpen(true),
    closePanel: () => setIsPanelOpen(false),
    togglePanel: () => setIsPanelOpen((prev) => !prev),
    resetDefaults,
    announce,
    announcement,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

export default AccessibilityContext;

