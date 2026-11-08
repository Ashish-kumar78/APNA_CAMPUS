/**
 * Calendar Notes & Mandatory Reminder Store
 * Provides strict user-level privacy, persistent storage, and real-time syncing
 * with the NestJS backend and local storage.
 * Enforces IST (Asia/Kolkata) timezone and optimistic, instantaneous UI updates.
 */

import { api } from './api.js';

const EVENT_NAME = 'bput_calendar_notes_updated';

/**
 * Format 24-hour time string ("HH:mm") into 12-hour format ("h:mm AM/PM")
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = String(timeStr).split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return String(timeStr);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  const minuteFormatted = String(m).padStart(2, '0');
  return `${hour12}:${minuteFormatted} ${ampm}`;
}

/**
 * Format start and end time into human-readable event time range:
 * - Both times: "10:00 AM - 11:30 AM"
 * - Only start: "10:00 AM"
 * - No time: ""
 */
export function formatEventTimeRange(startTime, endTime) {
  const s = startTime ? formatTime12h(startTime) : '';
  const e = endTime ? formatTime12h(endTime) : '';
  if (s && e) {
    return `${s} - ${e}`;
  }
  if (s) {
    return s;
  }
  return '';
}

/**
 * Sort notes by scheduledDate, then startTime (notes without time at the end), then createdAt
 */
export function sortNotesByTime(notesList = []) {
  return [...notesList].sort((a, b) => {
    const dateCmp = (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
    if (dateCmp !== 0) return dateCmp;
    if (a.startTime && b.startTime) {
      const timeCmp = a.startTime.localeCompare(b.startTime);
      if (timeCmp !== 0) return timeCmp;
      if (a.endTime && b.endTime) return a.endTime.localeCompare(b.endTime);
    }
    if (a.startTime && !b.startTime) return -1;
    if (!a.startTime && b.startTime) return 1;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });
}

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
    account.identity ||
    account.employeeId ||
    account.empId ||
    account.rollNumber ||
    account.registrationNumber ||
    account.username ||
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
      const merged = sortNotesByTime(Array.from(noteMap.values()));
      saveLocalNotesForUser(account, merged);
      return filterDate ? merged.filter(n => n.scheduledDate === filterDate) : merged;
    }
  } catch (err) {
    // Offline / fallback to local cache
  }

  const sortedLocal = sortNotesByTime(localNotes);
  return filterDate ? sortedLocal.filter(n => n.scheduledDate === filterDate) : sortedLocal;
}

/**
 * 2. Get pending mandatory reminders for today and previous overdue dates
 */
export async function getPendingCalendarReminders(account, currentDate = null) {
  const todayStr = currentDate || getTodayIST().dateStr;
  const localNotes = getLocalNotesForUser(account);
  const localPending = sortNotesByTime(
    localNotes.filter(n => n.status === 'PENDING' && n.scheduledDate <= todayStr)
  );

  try {
    const res = await api.getPendingCalendarReminders({ currentDate: todayStr });
    if (res?.success && Array.isArray(res.reminders)) {
      const mergedMap = new Map();
      localPending.forEach(n => mergedMap.set(n.id, n));
      res.reminders.forEach(n => {
        const local = mergedMap.get(n.id);
        if (local?.status === 'COMPLETED') return;
        mergedMap.set(n.id, n);
      });
      const allReminders = Array.from(mergedMap.values()).filter(
        n => n.status === 'PENDING' && n.scheduledDate <= todayStr
      );
      return sortNotesByTime(allReminders);
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
export async function createCalendarNote(account, { title, description = '', scheduledDate, startTime = null, endTime = null }) {
  if (!title || !scheduledDate) {
    throw new Error('Title and Scheduled Date are required');
  }

  const todayStr = getTodayIST().dateStr;
  if (scheduledDate < todayStr) {
    throw new Error(`Cannot schedule notes for past dates (Selected: ${scheduledDate}, Today: ${todayStr})`);
  }

  const sTime = startTime ? String(startTime).trim() : null;
  const eTime = endTime ? String(endTime).trim() : null;

  if (eTime && !sTime) {
    throw new Error('Please select a start time first.');
  }
  if (sTime && eTime && eTime <= sTime) {
    throw new Error('End time must be after start time.');
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
    startTime: sTime,
    endTime: eTime,
    status: 'PENDING',
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Instant local save & broadcast for 0ms UI latency
  const notes = getLocalNotesForUser(account);
  notes.push(newNote);
  saveLocalNotesForUser(account, sortNotesByTime(notes));

  // Background sync to backend (non-blocking)
  api.createCalendarNote({
    title: newNote.title,
    description: newNote.description,
    scheduledDate: newNote.scheduledDate,
    startTime: newNote.startTime,
    endTime: newNote.endTime,
  }).then((res) => {
    if (res?.success && res.note) {
      const currentList = getLocalNotesForUser(account);
      const idx = currentList.findIndex(n => n.id === newNote.id);
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...res.note };
        saveLocalNotesForUser(account, sortNotesByTime(currentList));
      }
    }
  }).catch((err) => {
    console.debug('Background backend sync for createCalendarNote fallback:', err?.message);
  });

  // Clear session dismissal so new uncompleted tasks immediately remind the user
  clearSessionDismissal(userId);

  return newNote;
}

/**
 * 4. Update an existing calendar note (title, description, scheduledDate, startTime, endTime)
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

  const sTime = updates.startTime !== undefined
    ? (updates.startTime ? String(updates.startTime).trim() : null)
    : notes[idx].startTime;
  const eTime = updates.endTime !== undefined
    ? (updates.endTime ? String(updates.endTime).trim() : null)
    : notes[idx].endTime;

  if (eTime && !sTime) {
    throw new Error('Please select a start time first.');
  }
  if (sTime && eTime && eTime <= sTime) {
    throw new Error('End time must be after start time.');
  }

  const updatedNote = {
    ...notes[idx],
    ...(updates.title !== undefined && { title: String(updates.title).trim() }),
    ...(updates.description !== undefined && { description: String(updates.description).trim() }),
    ...(updates.scheduledDate !== undefined && { scheduledDate: String(updates.scheduledDate).trim() }),
    ...(updates.startTime !== undefined && { startTime: sTime }),
    ...(updates.endTime !== undefined && { endTime: eTime }),
    updatedAt: new Date().toISOString(),
  };

  notes[idx] = updatedNote;
  saveLocalNotesForUser(account, sortNotesByTime(notes));

  // Background sync to backend
  api.updateCalendarNote(noteId, {
    title: updatedNote.title,
    description: updatedNote.description,
    scheduledDate: updatedNote.scheduledDate,
    startTime: updatedNote.startTime,
    endTime: updatedNote.endTime,
  }).catch((err) => {
    console.debug('Background backend sync for updateCalendarNote fallback:', err?.message);
  });

  if (updatedNote.status === 'PENDING') {
    clearSessionDismissal(resolveUserId(account));
  }

  return updatedNote;
}

/**
 * 5. Submit Note (marks as COMPLETED)
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
