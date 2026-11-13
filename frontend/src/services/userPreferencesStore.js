/**
 * Central User Preferences Store
 * Synchronizes Theme and Global Language across all role dashboards and sessions.
 */

import { api } from './api.js';
import { getStoredTheme, setTheme, applyThemeToDOM, THEME_MODES } from './themeStore.js';
import { getCurrentLanguage, setLanguage, applyLanguageToDOM, SUPPORTED_LANGUAGES } from './languageStore.js';

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
 */
export function getUserPreferences(account) {
  const currentTheme = getStoredTheme();
  const currentLang = getCurrentLanguage();
  return { theme: currentTheme, language: currentLang };
}

/**
 * Save user preferences locally and dispatch update event
 */
export function saveLocalUserPreferences(account, prefs = {}) {
  const key = getStorageKey(account);
  
  const targetTheme = prefs.theme || getStoredTheme();
  const targetLanguage = prefs.language || getCurrentLanguage();

  if (prefs.theme) {
    setTheme(prefs.theme);
  }
  if (prefs.language) {
    setLanguage(prefs.language);
  }

  const normalized = {
    theme: targetTheme,
    language: targetLanguage,
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
  const theme = prefs?.theme || getStoredTheme();
  const lang = prefs?.language || getCurrentLanguage();

  applyThemeToDOM(theme);
  applyLanguageToDOM(lang);
}

/**
 * Initialize / Hydrate preferences for the logged-in user
 */
export async function hydrateUserPreferences(account) {
  const currentTheme = getStoredTheme();
  const currentLang = getCurrentLanguage();
  const current = { theme: currentTheme, language: currentLang };
  applyPreferencesToDOM(current);
  return current;
}

/**
 * Update Theme preference for the current user
 */
export async function setUserTheme(account, theme) {
  setTheme(theme);
  const updated = { theme: getStoredTheme(), language: getCurrentLanguage() };
  saveLocalUserPreferences(account, updated);
  return updated;
}

/**
 * Update Language preference for the current user
 */
export async function setUserLanguage(account, language) {
  setLanguage(language);
  const updated = { theme: getStoredTheme(), language: getCurrentLanguage() };
  saveLocalUserPreferences(account, updated);
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
