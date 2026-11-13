/**
 * Central Theme Store & Manager
 * Provides reliable Light Mode / Dark Mode switching, persistence,
 * and DOM attribute synchronization across the entire Apna Campus application.
 */

const STORAGE_KEY = 'apna_theme';
const ACC_KEY = 'apna_accessibility_settings';
const THEME_CHANGE_EVENT = 'apna_theme_changed';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * Get current active theme ('light' | 'dark')
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return THEME_MODES.LIGHT;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    const acc = localStorage.getItem(ACC_KEY);
    if (acc) {
      const parsed = JSON.parse(acc);
      if (parsed.theme === 'dark' || parsed.theme === 'light') {
        return parsed.theme;
      }
    }
  } catch (e) {
    console.warn('Failed to read stored theme:', e);
  }
  return THEME_MODES.LIGHT;
}

/**
 * Apply theme to HTML and Body DOM elements
 */
export function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;
  const effectiveTheme = theme === THEME_MODES.DARK ? THEME_MODES.DARK : THEME_MODES.LIGHT;

  if (effectiveTheme === THEME_MODES.DARK) {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    if (body) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    }
  } else {
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
    if (body) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    }
  }
}

/**
 * Set and persist theme across session and re-logins
 */
export function setTheme(theme) {
  const targetTheme = theme === THEME_MODES.DARK ? THEME_MODES.DARK : THEME_MODES.LIGHT;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, targetTheme);

      // Keep accessibility settings in sync
      const rawAcc = localStorage.getItem(ACC_KEY);
      const acc = rawAcc ? JSON.parse(rawAcc) : {};
      acc.theme = targetTheme;
      localStorage.setItem(ACC_KEY, JSON.stringify(acc));
    } catch (e) {
      console.warn('Failed to save theme setting:', e);
    }
  }

  // Apply to DOM immediately
  applyThemeToDOM(targetTheme);

  // Notify listeners
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: targetTheme } }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }

  return targetTheme;
}

/**
 * Toggle between Light Mode and Dark Mode
 */
export function toggleTheme() {
  const current = getStoredTheme();
  const next = current === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
  return setTheme(next);
}

/**
 * Initialize theme at page startup (prevents flash of wrong theme)
 */
export function initTheme() {
  if (typeof window === 'undefined') return;
  const theme = getStoredTheme();
  applyThemeToDOM(theme);
}

/**
 * Subscribe to theme changes
 */
export function subscribeTheme(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e) => {
    callback(e.detail?.theme || getStoredTheme());
  };

  const handleStorage = (e) => {
    if (!e || e.key === STORAGE_KEY || e.key === ACC_KEY) {
      callback(getStoredTheme());
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

// Automatically initialize on module load
if (typeof window !== 'undefined') {
  initTheme();
}
