/**
 * ============================================================================
 * APNA CAMPUS — MESS NOTICE & OPERATIONAL CIRCULARS STORE
 * ============================================================================
 * Fretbox BPUT Hackathon 2026 PS07: Mess Management Module (Step 6)
 *
 * Reuses existing APNA_CAMPUS notificationsStore.broadcast engine to deliver
 * real-time notices directly to students across hostels and cohorts.
 *
 * Core Capabilities:
 * 1. Notice publication (Mess closure, festive menu, timing modifications, diet advisories).
 * 2. Scoped targeting by Hostel complex and audience segment.
 * 3. Priority levels: URGENT (with student dashboard alert banner), HIGH, NORMAL.
 * 4. Expiry date calculation and status transition (Active vs Expired).
 * 5. Pin / Unpin important circulars to the top.
 * 6. Deduplicated student read tracking (tracks roll numbers and read counts).
 * 7. Broadcast integration into institutional notificationsStore ledger.
 * ============================================================================
 */

import { notificationsStore } from './notificationsStore.js';

export const MESS_NOTICES_STORAGE_KEY = 'apna_campus_mess_notices_v1';

export const NOTICE_CATEGORIES = [
  'Mess Closure / Maintenance',
  'Special Festival Menu',
  'Dining Timing Change',
  'Food Availability Update',
  'Special Food Arrangement',
  'Dietary & Hygiene Advisory',
];

export const NOTICE_PRIORITIES = ['NORMAL', 'HIGH', 'URGENT'];

export const TARGET_HOSTELS = [
  'All Hostels',
  'APJ Abdul Kalam Hostel (Boys)',
  'Sarojini Naidu Hostel (Girls)',
  'CV Raman Hostel (Boys)',
  'Kalpana Chawla Hostel (Girls)',
];

export const TARGET_AUDIENCES = [
  'All Residents & Day Boarders',
  'Hostel Residents Only',
  'Mess Committee & Representatives',
  'Vegetarian Residents',
  'Staff & Guest Diners',
];

// Seeded Institutional Mess Notices
export const SEED_MESS_NOTICES = [
  {
    id: 'ntc-m-diwali',
    title: 'Special Diwali Festive Feast & Extended Dinner Hours',
    description: 'Grand festive menu featuring Shahi Paneer, Kashmiri Pulao, Gulab Jamun, and Rasmalai on 10 Nov 2026. Dining hall open until 10:30 PM. Boarders may invite campus guests with pre-purchased guest coupon.',
    category: 'Special Festival Menu',
    priority: 'HIGH',
    targetHostel: 'All Hostels',
    targetAudience: 'All Residents & Day Boarders',
    publishDate: '2026-11-05',
    expiryDate: '2026-11-15',
    isPinned: true,
    status: 'Active',
    readCount: 382,
    readBy: ['2401432255', '2401432256'],
    publishedBy: 'Mr. Kailash Chandra Nayak (MESS-101)',
    createdAt: '2026-11-05T09:00:00.000Z',
    updatedAt: '2026-11-05T09:00:00.000Z',
  },
  {
    id: 'ntc-m-timing-mod',
    title: 'Revised Sunday Breakfast & Brunch Timings',
    description: 'Starting Sunday 09 Nov 2026, breakfast hours will be 08:00 AM – 10:30 AM to accommodate morning sports and modular examination revision schedules. Regular weekday hours remain 07:30 AM – 09:30 AM.',
    category: 'Dining Timing Change',
    priority: 'NORMAL',
    targetHostel: 'All Hostels',
    targetAudience: 'Hostel Residents Only',
    publishDate: '2026-11-06',
    expiryDate: '2026-11-20',
    isPinned: false,
    status: 'Active',
    readCount: 295,
    readBy: ['2401432255'],
    publishedBy: 'Mr. Kailash Chandra Nayak (MESS-101)',
    createdAt: '2026-11-06T10:15:00.000Z',
    updatedAt: '2026-11-06T10:15:00.000Z',
  },
  {
    id: 'ntc-m-closure',
    title: 'Dining Hall Deep Sanitation & Water Purifier Maintenance',
    description: 'Central RO water purification unit filter renewal and dining floor sanitation scheduled between 02:30 PM and 05:00 PM on Friday. Evening tea and snacks will be served at the Annex Courtyard counter.',
    category: 'Mess Closure / Maintenance',
    priority: 'URGENT',
    targetHostel: 'All Hostels',
    targetAudience: 'All Residents & Day Boarders',
    publishDate: '2026-11-07',
    expiryDate: '2026-11-10',
    isPinned: true,
    status: 'Active',
    readCount: 418,
    readBy: ['2401432255', '2401432258', '2401432259'],
    publishedBy: 'Mr. Kailash Chandra Nayak (MESS-101)',
    createdAt: '2026-11-07T08:30:00.000Z',
    updatedAt: '2026-11-07T08:30:00.000Z',
  },
  {
    id: 'ntc-m-diet-advisory',
    title: 'Dietary Advisory: Special Jain & Non-Spicy Food Counter',
    description: 'No-onion, no-garlic (Satvik/Jain) meals and mild non-spicy dietary counter is now active at Counter 3 for both lunch and dinner. Boarders requiring special dietary arrangements must register with Mess Manager.',
    category: 'Special Food Arrangement',
    priority: 'NORMAL',
    targetHostel: 'All Hostels',
    targetAudience: 'Vegetarian Residents',
    publishDate: '2026-11-01',
    expiryDate: '2026-11-30',
    isPinned: false,
    status: 'Active',
    readCount: 189,
    readBy: [],
    publishedBy: 'Mr. Kailash Chandra Nayak (MESS-101)',
    createdAt: '2026-11-01T11:00:00.000Z',
    updatedAt: '2026-11-01T11:00:00.000Z',
  },
];

/**
 * Safe local storage reader
 */
function readStorage() {
  if (typeof localStorage === 'undefined') {
    return [...SEED_MESS_NOTICES];
  }
  try {
    const raw = localStorage.getItem(MESS_NOTICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MESS_NOTICES_STORAGE_KEY, JSON.stringify(SEED_MESS_NOTICES));
      return [...SEED_MESS_NOTICES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED_MESS_NOTICES];
  } catch (err) {
    console.warn('Failed to read mess notices from storage, fallback to seed:', err);
    return [...SEED_MESS_NOTICES];
  }
}

/**
 * Safe local storage writer with cross-tab event notification
 */
function writeStorage(list) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(MESS_NOTICES_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn('Failed to write mess notices to storage:', err);
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(
        new CustomEvent('apna_campus_mess_notices_updated', {
          detail: { count: list.length, timestamp: Date.now() },
        })
      );
    } catch {}
  }
}

/**
 * Fetch all mess notices with optional category, target hostel, and active filter
 */
export function getMessNotices(filters = {}) {
  const list = readStorage();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Auto-evaluate expired status
  const normalized = list.map((item) => {
    const isExpired = item.expiryDate && item.expiryDate < todayStr;
    const currentStatus = isExpired ? 'Expired' : (item.status || 'Active');
    return {
      ...item,
      status: currentStatus,
    };
  });

  return normalized
    .filter((n) => {
      if (filters.category && filters.category !== 'ALL' && n.category !== filters.category) {
        return false;
      }
      if (
        filters.targetHostel &&
        filters.targetHostel !== 'All Hostels' &&
        n.targetHostel !== 'All Hostels' &&
        n.targetHostel !== filters.targetHostel
      ) {
        return false;
      }
      if (filters.activeOnly && n.status !== 'Active') {
        return false;
      }
      if (filters.search) {
        const q = String(filters.search).toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(q);
        const matchesDesc = n.description?.toLowerCase().includes(q);
        const matchesCat = n.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then newest publication date
      return new Date(b.publishDate || b.createdAt) - new Date(a.publishDate || a.createdAt);
    });
}

/**
 * Publish a new mess notice and broadcast to students using notificationsStore
 */
export function publishMessNotice(noticeData, managerAccount = null, broadcastToStudents = true) {
  if (!noticeData.title || !noticeData.title.trim()) {
    throw new Error('Notice title is mandatory.');
  }
  if (!noticeData.category) {
    throw new Error('Notice category is mandatory.');
  }
  if (!noticeData.description || !noticeData.description.trim()) {
    throw new Error('Notice description is mandatory.');
  }

  const list = readStorage();
  const nowIso = new Date().toISOString();
  const todayStr = nowIso.slice(0, 10);

  const managerName = managerAccount?.name || 'Mr. Kailash Chandra Nayak';
  const managerIdentity = managerAccount?.identity || 'MESS-101';

  const newNotice = {
    id: noticeData.id || `ntc-m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: noticeData.title.trim(),
    description: noticeData.description.trim(),
    category: noticeData.category,
    priority: noticeData.priority || 'NORMAL',
    targetHostel: noticeData.targetHostel || 'All Hostels',
    targetAudience: noticeData.targetAudience || 'All Residents & Day Boarders',
    publishDate: noticeData.publishDate || todayStr,
    expiryDate: noticeData.expiryDate || '',
    isPinned: Boolean(noticeData.isPinned),
    status: 'Active',
    readCount: 0,
    readBy: [],
    publishedBy: `${managerName} (${managerIdentity})`,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const updated = [newNotice, ...list];
  writeStorage(updated);

  // Broadcast using existing notificationsStore engine
  if (broadcastToStudents && notificationsStore && typeof notificationsStore.broadcast === 'function') {
    try {
      notificationsStore.broadcast(
        {
          title: `[Mess Notice] ${newNotice.title}`,
          message: newNotice.description,
          category: 'DINING',
          priority: newNotice.priority === 'URGENT' ? 'URGENT' : (newNotice.priority === 'HIGH' ? 'HIGH' : 'NORMAL'),
          senderName: managerName,
          senderRole: 'Chief Mess Manager & Food Safety Officer',
          senderDept: 'Hostel Dining & Food Logistics',
          targetAudience: newNotice.targetHostel || 'All Hostels',
          actionTab: 'hostel',
          actionLabel: 'View Dining Notice',
        },
        ['student']
      );
    } catch (e) {
      console.warn('Notice published, broadcast to notificationsStore encountered warning:', e);
    }
  }

  return newNotice;
}

/**
 * Update an existing notice
 */
export function updateMessNotice(id, updates = {}) {
  const list = readStorage();
  const index = list.findIndex((n) => n.id === id);
  if (index === -1) {
    throw new Error(`Mess notice with ID "${id}" was not found.`);
  }

  const existing = list[index];
  const updatedItem = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  list[index] = updatedItem;
  writeStorage(list);
  return updatedItem;
}

/**
 * Delete a mess notice
 */
export function deleteMessNotice(id) {
  const list = readStorage();
  const filtered = list.filter((n) => n.id !== id);
  writeStorage(filtered);
  return { success: true, remaining: filtered.length };
}

/**
 * Toggle pinned status
 */
export function togglePinMessNotice(id) {
  const list = readStorage();
  const target = list.find((n) => n.id === id);
  if (!target) return null;

  target.isPinned = !target.isPinned;
  target.updatedAt = new Date().toISOString();
  writeStorage(list);
  return target;
}

/**
 * Record student read tracking
 */
export function markNoticeReadByStudent(noticeId, studentRollOrId = '2401432255') {
  if (!noticeId) return null;
  const list = readStorage();
  const target = list.find((n) => n.id === noticeId);
  if (!target) return null;

  const roll = String(studentRollOrId || 'anonymous').trim();
  const readBy = Array.isArray(target.readBy) ? target.readBy : [];

  if (!readBy.includes(roll)) {
    target.readBy = [...readBy, roll];
    target.readCount = (Number(target.readCount) || 0) + 1;
    writeStorage(list);
  }

  return target;
}

/**
 * Compute real-time notice statistics for dashboard widgets
 */
export function getMessNoticeStats() {
  const notices = getMessNotices();
  const total = notices.length;
  const active = notices.filter((n) => n.status === 'Active').length;
  const urgent = notices.filter((n) => n.status === 'Active' && (n.priority === 'URGENT' || n.priority === 'HIGH')).length;
  const totalReads = notices.reduce((acc, n) => acc + (Number(n.readCount) || 0), 0);
  const avgReadPerNotice = total > 0 ? Math.round(totalReads / total) : 0;

  return {
    total,
    active,
    urgent,
    totalReads,
    avgReadPerNotice,
  };
}

