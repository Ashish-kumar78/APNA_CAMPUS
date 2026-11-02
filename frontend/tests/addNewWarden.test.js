import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllWardens,
  addNewWarden,
  getWardenById,
  getWardenPermissions
} from '../src/services/wardenManagementStore.js';
import { resolveWardenProfile } from '../src/components/hostel/wardenProfilesData.js';

describe('Add New Warden & Employee Onboarding', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      };
    }
  });

  it('successfully registers a new warden with full details and photo', () => {
    const wardenData = {
      title: 'Mr.',
      firstName: 'Subrat',
      lastName: 'Jena',
      name: 'Mr. Subrat Jena',
      designation: 'Hostel Supervisor (Boys)',
      department: 'Hostel Administration & Student Housing',
      hostelName: 'Bhabani Hostel-2',
      assignedBlocks: 'Block A (Rooms 101-220)',
      dutyShift: 'General / 24x7 Resident',
      shiftTimings: '06:00 AM - 10:00 PM',
      email: 'subrat.jena@gift.edu.in',
      phone: '+91 94370 88990',
      avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      qualification: 'M.Tech (Thermal Engg), B.Tech (Mechanical)',
      bloodGroup: 'O+',
      emergencyContact: 'Mrs. S. Jena (Spouse)',
      permissions: {
        submitAttendance: true,
        manageGatePasses: true,
        reviewStudentLeaves: true,
        createInventoryRequisitions: true
      }
    };

    const created = addNewWarden(wardenData);

    expect(created).toBeDefined();
    expect(created.id).toMatch(/^WRD-\d+$/);
    expect(created.name).toBe('Mr. Subrat Jena');
    expect(created.hostelName).toBe('Bhabani Hostel-2');
    expect(created.avatar).toContain('data:image/png;base64');
    expect(created.accountStatus).toBe('Active');

    // Verify it appears in getAllWardens()
    const all = getAllWardens();
    const found = all.find(w => w.id === created.id);
    expect(found).toBeDefined();
    expect(found.name).toBe('Mr. Subrat Jena');

    // Verify resolveWardenProfile resolves full CMS profile
    const profile = resolveWardenProfile(created.id);
    expect(profile).toBeDefined();
    expect(profile.name).toBe('Mr. Subrat Jena');
    expect(profile.avatar).toBe(created.avatar);
    expect(profile.qualification).toBe('M.Tech (Thermal Engg), B.Tech (Mechanical)');

    // Verify permissions are registered
    const perms = getWardenPermissions(created.id);
    expect(perms.submitAttendance).toBe(true);
    expect(perms.manageGatePasses).toBe(true);
    expect(perms.reviewStudentLeaves).toBe(true);
  });
});
