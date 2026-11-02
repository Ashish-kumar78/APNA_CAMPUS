import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveHostelComplex,
  getAllHostelComplexes
} from '../src/services/hostelComplexStore.js';
import {
  getAllHostels,
  getStudentsRoster,
  getSubmittedAttendances
} from '../src/services/hostelAttendanceStore.js';
import {
  getWardenPermissions,
  updateWardenPermissions,
  applyPermissionsToAllWardens,
  DEFAULT_WARDEN_PERMISSIONS
} from '../src/services/wardenManagementStore.js';

describe('Hostel Auto-Propagation & Warden Permissions Sync', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      };
    } else {
      globalThis.localStorage.clear();
    }
    if (typeof globalThis.window === 'undefined') {
      globalThis.window = {
        dispatchEvent: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, detail) {
        this.type = type;
        this.detail = detail?.detail;
      }
    };
    vi.restoreAllMocks();
  });

  it('1. Automatically registers new hostel by admin and propagates to all hostel dropdown sources', () => {
    const created = saveHostelComplex({
      name: 'Ramanujan Boys Residence',
      type: 'Boys',
      totalFloors: 4,
      totalRooms: 40,
      totalBeds: 120,
      warden: 'Mr. Prasant Mohanty',
      contact: '+91 94371 99887'
    });

    expect(created.name).toBe('Ramanujan Boys Residence');

    // Verify it exists in both complexes and general hostels dropdown list
    const complexes = getAllHostelComplexes();
    expect(complexes.some(h => h.name === 'Ramanujan Boys Residence')).toBe(true);

    const hostels = getAllHostels();
    expect(hostels.some(h => h.name === 'Ramanujan Boys Residence')).toBe(true);
  });

  it('2. Granular operational permissions save for a specific warden and apply to their role', () => {
    const wardenId = 'WRD-101';
    const initialPerms = getWardenPermissions(wardenId);
    expect(initialPerms.recordDisciplinaryIncidents).toBe(true);

    // Admin restricts disciplinary incidents for WRD-101
    const updated = updateWardenPermissions(wardenId, {
      ...initialPerms,
      recordDisciplinaryIncidents: false,
      manageComplaints: false
    });

    expect(updated.recordDisciplinaryIncidents).toBe(false);
    expect(updated.manageComplaints).toBe(false);

    // Verify retrieval reflects the updated permission
    const fetched = getWardenPermissions(wardenId);
    expect(fetched.recordDisciplinaryIncidents).toBe(false);
    expect(fetched.manageComplaints).toBe(false);

    // Verify other wardens are unaffected
    const otherWarden = getWardenPermissions('WRD-102');
    expect(otherWarden.recordDisciplinaryIncidents).toBe(true);
  });

  it('3. Admin bulk matrix applies permissions to ALL hostel wardens', () => {
    applyPermissionsToAllWardens({
      editHostelConfiguration: true,
      exportReports: true
    });

    const w101 = getWardenPermissions('WRD-101');
    const w102 = getWardenPermissions('WRD-102');
    const w103 = getWardenPermissions('WRD-103');

    expect(w101.editHostelConfiguration).toBe(true);
    expect(w101.exportReports).toBe(true);
    expect(w102.editHostelConfiguration).toBe(true);
    expect(w102.exportReports).toBe(true);
    expect(w103.editHostelConfiguration).toBe(true);
    expect(w103.exportReports).toBe(true);
  });

  it('4. Student contact is always provided for all resident students across roster and attendance', () => {
    const roster = getStudentsRoster('Gandhi Boys Residence');
    expect(roster.length).toBeGreaterThan(0);

    roster.forEach(student => {
      expect(student.phone).toBeDefined();
      expect(student.phone.trim()).not.toBe('');
      expect(student.phone).toMatch(/^\+91/);
      expect(student.parentPhone).toBeDefined();
      expect(student.parentPhone.trim()).not.toBe('');
    });

    const attendances = getSubmittedAttendances();
    expect(attendances.length).toBeGreaterThan(0);

    attendances.forEach(sub => {
      (sub.records || []).forEach(record => {
        expect(record.phone).toBeDefined();
        expect(record.phone.trim()).not.toBe('');
        expect(record.phone).toMatch(/^\+91/);
      });
    });
  });
});
