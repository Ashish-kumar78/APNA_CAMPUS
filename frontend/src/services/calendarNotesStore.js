/**
 * Calendar Notes & Mandatory Reminder Store
 * Provides strict user-level privacy, persistent storage, and real-time syncing
 * with the NestJS backend and local storage.
 * Enforces IST (Asia/Kolkata) timezone and optimistic, instantaneous UI updates.
 */

import { api } from './api.js';

const EVENT_NAME = 'bput_calendar_notes_updated';

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kolkata (IST) timezone,
 * along with numeric breakdown and Date object.
 */
export function getTodayIST() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(new Date());
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return {
    dateStr,
    year,
    monthIndex,
    day,
    dateObj: new Date(year, monthIndex, day),
  };
}

export function resolveUserId(account) {
  if (!account) return 'guest_user';
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
  const userId = resolveUserId(account);
  return `collegeflow_calendar_notes_${userId}`;
}

/**
 * In-memory fallback map for environments where localStorage may not be available (e.g. Node tests)
 */
const inMemoryCache = new Map();

export function getLocalNotesForUser(account) {
  const key = getStorageKey(account);
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse calendar notes from localStorage:', e);
    }
  }
  return inMemoryCache.get(key) || [];
}

export function saveLocalNotesForUser(account, notes) {
  const key = getStorageKey(account);
  inMemoryCache.set(key, notes);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save calendar notes to localStorage:', e);
    }
  }
  notifySubscribers();
}

function notifySubscribers() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (e) {
      // ignore
    }
  }
}

/**
 * 1. Get all notes for the authenticated user (optionally filtered by scheduledDate)
 */
export async function getCalendarNotes(account, filterDate = null) {
  const localNotes = getLocalNotesForUser(account);

  // Background sync with backend
  try {
    const params = filterDate ? { date: filterDate } : {};
    const res = await api.getCalendarNotes(params);
    if (res?.success && Array.isArray(res.notes)) {
      // Merge backend notes with local cache
      const noteMap = new Map();
      localNotes.forEach(n => noteMap.set(n.id, n));
      res.notes.forEach(n => noteMap.set(n.id, n));
      const merged = Array.from(noteMap.values()).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
      saveLocalNotesForUser(account, merged);
      return filterDate ? merged.filter(n => n.scheduledDate === filterDate) : merged;
    }
  } catch (err) {
    // Offline / fallback to local cache
  }

  return filterDate ? localNotes.filter(n => n.scheduledDate === filterDate) : localNotes;
}

/**
 * 2. Get pending mandatory reminders for today and previous overdue dates
 * Logic:
 * - scheduledDate <= currentDate (in IST)
 * - status === 'PENDING'
 * - Ordered by scheduledDate ascending (oldest first)
 */
export async function getPendingCalendarReminders(account, currentDate = null) {
  const todayStr = currentDate || getTodayIST().dateStr;
  const localNotes = getLocalNotesForUser(account);
  const localPending = localNotes.filter(n => n.status === 'PENDING' && n.scheduledDate <= todayStr)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  try {
    const res = await api.getPendingCalendarReminders({ currentDate: todayStr });
    if (res?.success && Array.isArray(res.reminders)) {
      return res.reminders;
    }
  } catch (err) {
    // Backend unreachable, rely on local pending
  }

  return localPending;
}

/**
 * 3. Create a new personal calendar note (Instant Optimistic Save)
 * Rejects past dates in IST.
 */
export async function createCalendarNote(account, { title, description = '', scheduledDate }) {
  if (!title || !scheduledDate) {
    throw new Error('Title and Scheduled Date are required');
  }

  const todayStr = getTodayIST().dateStr;
  if (scheduledDate < todayStr) {
    throw new Error(`Cannot schedule notes for past dates (Selected: ${scheduledDate}, Today: ${todayStr})`);
  }

  const userId = resolveUserId(account);
  const newNote = {
    id: `cn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    userRole: account?.role || undefined,
    userEmail: account?.email || undefined,
    userName: account?.name || undefined,
    title: String(title).trim(),
    description: String(description || '').trim(),
    scheduledDate: String(scheduledDate).trim(),
    status: 'PENDING',
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Instant local save & broadcast for 0ms UI latency
  const notes = getLocalNotesForUser(account);
  notes.push(newNote);
  saveLocalNotesForUser(account, notes);

  // Background sync to backend (non-blocking)
  api.createCalendarNote({
    title: newNote.title,
    description: newNote.description,
    scheduledDate: newNote.scheduledDate,
  }).then((res) => {
    if (res?.success && res.note) {
      const currentList = getLocalNotesForUser(account);
      const idx = currentList.findIndex(n => n.id === newNote.id);
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...res.note };
        saveLocalNotesForUser(account, currentList);
      }
    }
  }).catch((err) => {
    console.debug('Background backend sync for createCalendarNote fallback:', err?.message);
  });

  return newNote;
}

/**
 * 4. Update an existing calendar note (title, description, scheduledDate)
 */
export async function updateCalendarNote(account, noteId, updates) {
  const notes = getLocalNotesForUser(account);
  const idx = notes.findIndex(n => n.id === noteId);

  if (idx === -1) {
    throw new Error('Calendar note not found');
  }

  if (updates.scheduledDate) {
    const todayStr = getTodayIST().dateStr;
    if (updates.scheduledDate < todayStr) {
      throw new Error(`Cannot reschedule notes to past dates (Selected: ${updates.scheduledDate}, Today: ${todayStr})`);
    }
  }

  const updatedNote = {
    ...notes[idx],
    ...(updates.title !== undefined && { title: String(updates.title).trim() }),
    ...(updates.description !== undefined && { description: String(updates.description).trim() }),
    ...(updates.scheduledDate !== undefined && { scheduledDate: String(updates.scheduledDate).trim() }),
    updatedAt: new Date().toISOString(),
  };

  notes[idx] = updatedNote;
  saveLocalNotesForUser(account, notes);

  // Background sync to backend
  api.updateCalendarNote(noteId, {
    title: updatedNote.title,
    description: updatedNote.description,
    scheduledDate: updatedNote.scheduledDate,
  }).catch((err) => {
    console.debug('Background backend sync for updateCalendarNote fallback:', err?.message);
  });

  return updatedNote;
}

/**
 * 5. Submit Note (marks as COMPLETED)
 * - Sets status = 'COMPLETED'
 * - Permanently removes from pending reminders
 * - Preserves in calendar history
 */
export async function submitCalendarNote(account, noteId) {
  const notes = getLocalNotesForUser(account);
  const idx = notes.findIndex(n => n.id === noteId);

  if (idx === -1) {
    throw new Error('Calendar note not found');
  }

  const completedNote = {
    ...notes[idx],
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes[idx] = completedNote;
  saveLocalNotesForUser(account, notes);

  // Background sync to backend
  api.submitCalendarNote(noteId).catch((err) => {
    console.debug('Background backend sync for submitCalendarNote fallback:', err?.message);
  });

  return completedNote;
}

/**
 * 6. Delete Note
 */
export async function deleteCalendarNote(account, noteId) {
  const notes = getLocalNotesForUser(account);
  const filtered = notes.filter(n => n.id !== noteId);
  saveLocalNotesForUser(account, filtered);

  // Background sync to backend
  api.deleteCalendarNote(noteId).catch((err) => {
    console.debug('Background backend sync for deleteCalendarNote fallback:', err?.message);
  });

  return { success: true, id: noteId };
}

/**
 * Helper to subscribe to calendar notes changes
 */
export function subscribeToCalendarNotes(callback) {
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener(EVENT_NAME, callback);
    return () => window.removeEventListener(EVENT_NAME, callback);
  }
  return () => {};
}

// In-memory fallback set for session dismissal tracking across tab navigation
const memorySessionDismissed = new Set();

function getSessionDismissKey(userId) {
  return `apna_calendar_dismissed_${userId}`;
}

export function isSessionDismissed(userId) {
  if (!userId) return false;
  if (memorySessionDismissed.has(userId)) return true;
  if (typeof sessionStorage !== 'undefined') {
    try {
      return sessionStorage.getItem(getSessionDismissKey(userId)) === 'true';
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function setSessionDismissed(userId) {
  if (!userId) return;
  memorySessionDismissed.add(userId);
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(getSessionDismissKey(userId), 'true');
    } catch (e) {}
  }
}

export function clearSessionDismissal(userId) {
  if (!userId) return;
  memorySessionDismissed.delete(userId);
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(getSessionDismissKey(userId));
    } catch (e) {}
  }
}
