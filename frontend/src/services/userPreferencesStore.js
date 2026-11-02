/**
 * Central User Preferences Store
 * Manages per-user independent Theme (light/dark) and Language (en/hi) settings.
 * Synchronizes with NestJS backend database and persists in localStorage.
 */

import { api } from './api.js';
import { applyLanguageToDOM } from './languageStore.js';

const PREF_EVENT = 'collegeflow_preferences_updated';

export function resolveUserPrefKey(account) {
  if (!account) return 'default_user';
  return String(
    account.id ||
    account.identifier ||
    account.email ||
    account.roleKey ||
    account.role ||
    'default_user'
  ).trim().toLowerCase();
}

function getStorageKey(account) {
  return `collegeflow_user_pref_${resolveUserPrefKey(account)}`;
}

const memoryPrefCache = new Map();

/**
 * Get current stored preferences for a user
 * Defaults: theme: 'light', language: 'en'
 */
export function getUserPreferences(account) {
  const key = getStorageKey(account);
  const defaults = { theme: 'light', language: 'en' };

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          theme: parsed.theme === 'dark' ? 'dark' : 'light',
          language: parsed.language === 'hi' ? 'hi' : 'en',
        };
      }
    } catch (e) {
      console.warn('Failed to read user preferences from localStorage:', e);
    }
  }

  return memoryPrefCache.get(key) || defaults;
}

/**
 * Save user preferences locally and dispatch update event
 */
export function saveLocalUserPreferences(account, prefs) {
  const key = getStorageKey(account);
  const normalized = {
    theme: prefs.theme === 'dark' ? 'dark' : 'light',
    language: prefs.language === 'hi' ? 'hi' : 'en',
  };

  memoryPrefCache.set(key, normalized);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(normalized));
    } catch (e) {
      console.warn('Failed to save user preferences to localStorage:', e);
    }
  }

  // Apply to DOM immediately
  applyPreferencesToDOM(normalized);

  // Notify listeners
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(PREF_EVENT, { detail: { account, preferences: normalized } }));
    } catch (e) {}
  }

  return normalized;
}

/**
 * Apply Theme and Language attributes to the document DOM
 */
export function applyPreferencesToDOM(prefs) {
  if (typeof document === 'undefined') return;

  const isDark = prefs.theme === 'dark';
  const docEl = document.documentElement;
  const body = document.body;

  // 1. Theme application
  docEl.setAttribute('data-theme', isDark ? 'dark' : 'light');
  if (isDark) {
    docEl.classList.add('dark-mode', 'dark');
    if (body) body.classList.add('dark-theme', 'dark-mode');
  } else {
    docEl.classList.remove('dark-mode', 'dark');
    if (body) body.classList.remove('dark-theme', 'dark-mode');
  }

  // 2. Language application
  docEl.setAttribute('lang', prefs.language || 'en');
  applyLanguageToDOM(prefs.language || 'en');
}

/**
 * Initialize / Hydrate preferences for the logged-in user
 * Pulls from local storage, applies to DOM, and syncs from backend in background
 */
export async function hydrateUserPreferences(account) {
  if (!account) {
    applyPreferencesToDOM({ theme: 'light', language: 'en' });
    return { theme: 'light', language: 'en' };
  }

  // 1. Immediately apply local cached preferences (zero flicker)
  const local = getUserPreferences(account);
  applyPreferencesToDOM(local);

  // 2. Fetch latest preferences from backend
  try {
    const res = await api.getUserPreferences();
    if (res?.success && res.preferences) {
      const serverPrefs = {
        theme: res.preferences.theme === 'dark' ? 'dark' : 'light',
        language: res.preferences.language === 'hi' ? 'hi' : 'en',
      };
      saveLocalUserPreferences(account, serverPrefs);
      return serverPrefs;
    }
  } catch (err) {
    // Offline / fallback to local cache
  }

  return local;
}

/**
 * Update Theme preference for the current user
 */
export async function setUserTheme(account, theme) {
  const current = getUserPreferences(account);
  const updated = { ...current, theme: theme === 'dark' ? 'dark' : 'light' };
  saveLocalUserPreferences(account, updated);

  // Background sync to backend
  try {
    await api.updateUserPreferences({ theme: updated.theme });
  } catch (err) {
    console.debug('Background backend sync for setUserTheme fallback:', err?.message);
  }

  return updated;
}

/**
 * Update Language preference for the current user
 */
export async function setUserLanguage(account, language) {
  const current = getUserPreferences(account);
  const updated = { ...current, language: language === 'hi' ? 'hi' : 'en' };
  saveLocalUserPreferences(account, updated);

  // Background sync to backend
  try {
    await api.updateUserPreferences({ language: updated.language });
  } catch (err) {
    console.debug('Background backend sync for setUserLanguage fallback:', err?.message);
  }

  return updated;
}

/**
 * Subscribe to preference changes
 */
export function subscribeUserPreferences(callback) {
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener(PREF_EVENT, callback);
    return () => window.removeEventListener(PREF_EVENT, callback);
  }
  return () => {};
}

