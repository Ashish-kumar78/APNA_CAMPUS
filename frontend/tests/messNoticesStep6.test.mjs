import { describe, it, expect, beforeEach } from 'vitest';
import {
  MESS_NOTICES_STORAGE_KEY,
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  TARGET_HOSTELS,
  TARGET_AUDIENCES,
  SEED_MESS_NOTICES,
  getMessNotices,
  publishMessNotice,
  updateMessNotice,
  deleteMessNotice,
  togglePinMessNotice,
  markNoticeReadByStudent,
  getMessNoticeStats,
} from '../src/services/messNoticeStore.js';

describe('STEP 6: Mess Notices & Operational Circulars Store', () => {
  beforeEach(() => {
    // Polyfill localStorage in test environment
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    };
    localStorage.setItem(MESS_NOTICES_STORAGE_KEY, JSON.stringify(SEED_MESS_NOTICES));
  });

  it('1. Provides standard seeded notices with categories, priorities, and hostels', () => {
    const list = getMessNotices();
    expect(list.length).toBeGreaterThanOrEqual(4);

    const categoriesInList = list.map((n) => n.category);
    expect(categoriesInList).toContain('Special Festival Menu');
    expect(categoriesInList).toContain('Dining Timing Change');
    expect(categoriesInList).toContain('Mess Closure / Maintenance');
    expect(categoriesInList).toContain('Special Food Arrangement');

    expect(NOTICE_CATEGORIES.length).toBe(6);
    expect(NOTICE_PRIORITIES).toEqual(['NORMAL', 'HIGH', 'URGENT']);
    expect(TARGET_HOSTELS).toContain('All Hostels');
    expect(TARGET_AUDIENCES).toContain('All Residents & Day Boarders');
  });

  it('2. Publishes new mess notice with validations and saves to storage', () => {
    const newNotice = publishMessNotice(
      {
        title: 'Water Pipe Repair in Girls Hostel Dining Annex',
        description: 'Temporary water pipeline maintenance from 11:00 AM to 01:00 PM. Drinking water dispensers stationed outside.',
        category: 'Mess Closure / Maintenance',
        priority: 'HIGH',
        targetHostel: 'Sarojini Naidu Hostel (Girls)',
        targetAudience: 'Hostel Residents Only',
        publishDate: '2026-11-08',
        expiryDate: '2026-11-12',
      },
      { name: 'Mr. Kailash Chandra Nayak', identity: 'MESS-101' },
      false // avoid network broadcast in test
    );

    expect(newNotice.id).toBeDefined();
    expect(newNotice.title).toBe('Water Pipe Repair in Girls Hostel Dining Annex');
    expect(newNotice.readCount).toBe(0);
    expect(newNotice.readBy).toEqual([]);

    const all = getMessNotices();
    const found = all.find((n) => n.id === newNotice.id);
    expect(found).toBeDefined();
    expect(found.targetHostel).toBe('Sarojini Naidu Hostel (Girls)');
  });

  it('3. Throws validation errors if required fields are missing', () => {
    expect(() => publishMessNotice({ title: '', category: 'Dining Timing Change', description: 'Desc' })).toThrow();
    expect(() => publishMessNotice({ title: 'Title', category: '', description: 'Desc' })).toThrow();
    expect(() => publishMessNotice({ title: 'Title', category: 'Dining Timing Change', description: '' })).toThrow();
  });

  it('4. Filters notices by category, target hostel, and search term', () => {
    const festNotices = getMessNotices({ category: 'Special Festival Menu' });
    expect(festNotices.every((n) => n.category === 'Special Festival Menu')).toBe(true);

    const searchResults = getMessNotices({ search: 'Diwali' });
    expect(searchResults.length).toBeGreaterThanOrEqual(1);
    expect(searchResults[0].title).toContain('Diwali');
  });

  it('5. Pins and unpins notices to guarantee top positioning', () => {
    const unpinned = getMessNotices().find((n) => !n.isPinned);
    expect(unpinned).toBeDefined();

    togglePinMessNotice(unpinned.id);
    const updatedList = getMessNotices();
    expect(updatedList[0].id === unpinned.id || updatedList[1].id === unpinned.id).toBe(true);
    const pinnedTarget = updatedList.find((n) => n.id === unpinned.id);
    expect(pinnedTarget.isPinned).toBe(true);

    // Toggle back
    togglePinMessNotice(unpinned.id);
    const revertList = getMessNotices();
    const revertedTarget = revertList.find((n) => n.id === unpinned.id);
    expect(revertedTarget.isPinned).toBe(false);
  });

  it('6. Records student read tracking and deduplicates reader roll numbers', () => {
    const list = getMessNotices();
    const target = list[0];
    const initialReads = target.readCount || 0;

    // Student 1 reads
    markNoticeReadByStudent(target.id, 'ROLL-2026-999');
    let updated = getMessNotices().find((n) => n.id === target.id);
    expect(updated.readCount).toBe(initialReads + 1);
    expect(updated.readBy).toContain('ROLL-2026-999');

    // Duplicate read by same student must not increment readCount
    markNoticeReadByStudent(target.id, 'ROLL-2026-999');
    updated = getMessNotices().find((n) => n.id === target.id);
    expect(updated.readCount).toBe(initialReads + 1);

    // Another student reads
    markNoticeReadByStudent(target.id, 'ROLL-2026-888');
    updated = getMessNotices().find((n) => n.id === target.id);
    expect(updated.readCount).toBe(initialReads + 2);
    expect(updated.readBy).toContain('ROLL-2026-888');
  });

  it('7. Updates notice and deletes notice properly', () => {
    const created = publishMessNotice(
      {
        title: 'Temp Notice for Deletion',
        category: 'Food Availability Update',
        description: 'Test Description',
      },
      null,
      false
    );

    updateMessNotice(created.id, { title: 'Updated Title for Temp Notice' });
    let found = getMessNotices().find((n) => n.id === created.id);
    expect(found.title).toBe('Updated Title for Temp Notice');

    deleteMessNotice(created.id);
    found = getMessNotices().find((n) => n.id === created.id);
    expect(found).toBeUndefined();
  });

  it('8. Computes accurate notice statistics for executive dashboard', () => {
    const stats = getMessNoticeStats();
    expect(stats.total).toBeGreaterThanOrEqual(4);
    expect(stats.active).toBeGreaterThanOrEqual(3);
    expect(stats.urgent).toBeGreaterThanOrEqual(1);
    expect(stats.totalReads).toBeGreaterThan(500);
    expect(stats.avgReadPerNotice).toBeGreaterThan(50);
  });
});

