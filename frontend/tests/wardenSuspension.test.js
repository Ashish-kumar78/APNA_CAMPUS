import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllWardens,
  setWardenAccountStatus,
  isWardenSuspended,
  getWardenPermissions
} from '../src/services/wardenManagementStore.js';
import { approveGatePass, rejectGatePass } from '../src/services/gatePassStore.js';

describe('Warden Suspension Enforcement (Read-Only Mode & Mutation Lock)', () => {
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
    // Reset status to Active for test wardens
    setWardenAccountStatus('WRD-102', 'Active');
  });

  it('correctly marks warden as suspended and checks status by ID, name, or account object', () => {
    const wardenId = 'WRD-102'; // Mrs. Nibedita Das
    expect(isWardenSuspended(wardenId)).toBe(false);

    // Suspend warden
    setWardenAccountStatus(wardenId, 'Suspended', 'Administrative audit action');
    expect(isWardenSuspended(wardenId)).toBe(true);

    // Check by name
    expect(isWardenSuspended('Mrs. Nibedita Das')).toBe(true);
    // Check by account object
    expect(isWardenSuspended({ identity: 'WRD-102', role: 'warden' })).toBe(true);
    expect(isWardenSuspended({ name: 'Mrs. Nibedita Das', role: 'warden' })).toBe(true);
  });

  it('revokes all mutating permissions while preserving read-only view access', () => {
    const wardenId = 'WRD-102';
    setWardenAccountStatus(wardenId, 'Suspended');

    const perms = getWardenPermissions(wardenId);
    expect(perms.isSuspended).toBe(true);

    // Mutating actions must be blocked
    expect(perms.submitAttendance).toBe(false);
    expect(perms.manageAttendance).toBe(false);
    expect(perms.manageGatePasses).toBe(false);
    expect(perms.reviewStudentLeaves).toBe(false);
    expect(perms.manageRoomAllocations).toBe(false);
    expect(perms.manageComplaints).toBe(false);
    expect(perms.createInventoryRequisitions).toBe(false);

    // Read-only view permissions must remain active ("only show all the things")
    expect(perms.viewHostelRecords).toBe(true);
    expect(perms.viewRoomAllocations).toBe(true);
    expect(perms.viewReports).toBe(true);
  });

  it('blocks gate pass approval and rejection when attempted by a suspended warden', () => {
    setWardenAccountStatus('WRD-102', 'Suspended');

    const approveResult = approveGatePass('GP-TEST-001', 'Mrs. Nibedita Das', 'Valid emergency');
    expect(approveResult).toHaveProperty('error');
    expect(approveResult.error).toMatch(/Warden is not authorized/);

    const rejectResult = rejectGatePass('GP-TEST-001', 'Mrs. Nibedita Das', 'Outside visiting hours');
    expect(rejectResult).toHaveProperty('error');
    expect(rejectResult.error).toMatch(/Warden is not authorized/);
  });

  it('fully restores mutating permissions and actions when reactivated by admin', () => {
    const wardenId = 'WRD-102';
    setWardenAccountStatus(wardenId, 'Suspended');
    expect(isWardenSuspended(wardenId)).toBe(true);

    // Reactivate
    setWardenAccountStatus(wardenId, 'Active', 'Reinstatement following review');
    expect(isWardenSuspended(wardenId)).toBe(false);

    const perms = getWardenPermissions(wardenId);
    expect(perms.isSuspended).toBe(false);
    expect(perms.manageGatePasses).toBe(true);
    expect(perms.reviewStudentLeaves).toBe(true);
  });
});
