import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllHostels, syncHostelsFromBackend } from '../src/services/hostelAttendanceStore.js';
import { saveHostelComplex, getAllHostelComplexes } from '../src/services/hostelComplexStore.js';
import {
  getAllWardens,
  reassignWarden,
  getAssignmentHistory
} from '../src/services/wardenManagementStore.js';
import { api } from '../src/services/api.js';

describe('Hostel Backend Sync & Warden Reassignment to New Hostels', () => {
  beforeEach(() => {
    const store = {};
    globalThis.localStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
    if (typeof globalThis.window === 'undefined') {
      globalThis.window = {
        dispatchEvent: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };
    }
  });

  it('syncHostelsFromBackend fetches new hostels from backend API and updates getAllHostels()', async () => {
    const mockBackendHostels = [
      { id: 'hst-new-1', name: 'Aryabhatta Research Hostel', code: 'ARH', totalRooms: 40, totalBeds: 120, type: 'Boys' },
      { id: 'hst-new-2', name: 'Kalpana Chawla Hall', code: 'KCH', totalRooms: 50, totalBeds: 150, type: 'Girls' }
    ];

    vi.spyOn(api, 'getHostelComplexes').mockResolvedValueOnce({
      success: true,
      data: mockBackendHostels
    });

    const result = await syncHostelsFromBackend();
    expect(result).toBeDefined();

    const names = result.map(h => h.name);
    expect(names).toContain('Aryabhatta Research Hostel');
    expect(names).toContain('Kalpana Chawla Hall');

    // Also check getAllHostels reflects it
    const all = getAllHostels();
    expect(all.map(h => h.name)).toContain('Aryabhatta Research Hostel');
    expect(all.map(h => h.name)).toContain('Kalpana Chawla Hall');
  });

  it('saveHostelComplex adds a new hostel complex, broadcasts updates, and calls api.createHostelComplex', () => {
    const createSpy = vi.spyOn(api, 'createHostelComplex').mockResolvedValueOnce({ success: true });

    const newComplex = saveHostelComplex({
      name: 'Ramanujan Mathematical Residency',
      type: 'Boys',
      totalFloors: 4,
      totalRooms: 60,
      totalBeds: 180,
      warden: 'Mr. Rajesh Jena',
      contact: '+91 94370 22334'
    });

    expect(newComplex.name).toBe('Ramanujan Mathematical Residency');
    expect(newComplex.totalBeds).toBe(180);

    const complexes = getAllHostelComplexes();
    expect(complexes.map(c => c.name)).toContain('Ramanujan Mathematical Residency');

    const hostels = getAllHostels();
    expect(hostels.map(h => h.name)).toContain('Ramanujan Mathematical Residency');

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Ramanujan Mathematical Residency',
      totalBeds: 180
    }));
  });

  it('reassignWarden reassigns a warden to a newly added hostel and triggers api.updateWardenProfile', () => {
    const updateSpy = vi.spyOn(api, 'updateWardenProfile').mockResolvedValueOnce({ success: true });

    // First ensure new hostel is registered
    saveHostelComplex({
      name: 'Vikram Sarabhai Tower',
      type: 'Boys',
      totalFloors: 5,
      totalRooms: 80,
      totalBeds: 240
    });

    const wardens = getAllWardens();
    const targetWarden = wardens[0];
    expect(targetWarden).toBeDefined();

    const historyRecord = reassignWarden({
      wardenId: targetWarden.id,
      newHostelId: 'hst-vs-tower',
      newHostelName: 'Vikram Sarabhai Tower',
      assignedBlocks: ['North Wing (Ground + 3 Floors)'],
      dutyShift: 'General / 24x7 Resident',
      shiftTimings: '06:00 AM - 10:00 PM',
      effectiveDate: '2026-11-02',
      reason: 'Special assignment for new block',
      adminUser: 'Chief Hostel Administrator'
    });

    expect(historyRecord.newHostel).toBe('Vikram Sarabhai Tower');

    // Verify warden directory has updated hostel
    const updatedWardens = getAllWardens();
    const updatedWarden = updatedWardens.find(w => w.id === targetWarden.id);
    expect(updatedWarden.hostelName).toBe('Vikram Sarabhai Tower');
    expect(updatedWarden.assignedBlocks).toEqual(['North Wing (Ground + 3 Floors)']);

    // Verify history recorded
    const history = getAssignmentHistory();
    expect(history[0].newHostel).toBe('Vikram Sarabhai Tower');

    // Verify backend update was called
    expect(updateSpy).toHaveBeenCalledWith(
      targetWarden.id,
      expect.objectContaining({
        hostelName: 'Vikram Sarabhai Tower',
        assignedHostelOrPost: 'Vikram Sarabhai Tower'
      })
    );
  });
});
