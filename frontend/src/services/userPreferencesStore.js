/**
 * Central User Preferences Store
 * Standardizes default Light Theme and English across all role dashboards.
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
  return { theme: 'light', language: 'en' };
}

/**
 * Save user preferences locally and dispatch update event
 */
export function saveLocalUserPreferences(account, prefs) {
  const key = getStorageKey(account);
  const normalized = {
    theme: 'light',
    language: 'en',
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
 * Ensures clean standard light theme and English across all roles
 */
export function applyPreferencesToDOM(prefs) {
  if (typeof document === 'undefined') return;

  const docEl = document.documentElement;
  const body = document.body;

  // Check if user has an accessibility theme setting
  try {
    const acc = localStorage.getItem('apna_accessibility_settings');
    if (acc) {
      const parsed = JSON.parse(acc);
      if (parsed.theme === 'dark' || (parsed.theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        docEl.setAttribute('data-theme', 'dark');
        docEl.classList.add('dark');
        if (body) body.classList.add('dark-theme');
        docEl.setAttribute('lang', 'en');
        applyLanguageToDOM('en');
        return;
      }
    }
  } catch (_) {}

  // 1. Standard Light Theme fallback
  docEl.setAttribute('data-theme', 'light');
  docEl.classList.remove('dark-mode', 'dark');
  if (body) {
    body.classList.remove('dark-theme', 'dark-mode');
  }

  // 2. Standard English Language
  docEl.setAttribute('lang', 'en');
  applyLanguageToDOM('en');
}

/**
 * Initialize / Hydrate preferences for the logged-in user
 */
export async function hydrateUserPreferences(account) {
  applyPreferencesToDOM({ theme: 'light', language: 'en' });
  return { theme: 'light', language: 'en' };
}

/**
 * Update Theme preference for the current user
 */
export async function setUserTheme(account, theme) {
  return { theme: 'light', language: 'en' };
}

/**
 * Update Language preference for the current user
 */
export async function setUserLanguage(account, language) {
  return { theme: 'light', language: 'en' };
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
