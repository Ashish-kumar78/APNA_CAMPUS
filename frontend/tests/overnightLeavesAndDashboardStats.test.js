import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// Set up browser-like environment for Node test
const storageMap = new Map();
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, val) => storageMap.set(key, String(val)),
    removeItem: (key) => storageMap.delete(key),
    clear: () => storageMap.clear(),
  };
}
if (typeof global.window === 'undefined') {
  const listeners = new Map();
  global.window = {
    dispatchEvent: (event) => {
      const handlers = listeners.get(event.type) || [];
      handlers.forEach(h => h(event));
      return true;
    },
    addEventListener: (type, handler) => {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    removeEventListener: (type, handler) => {
      const handlers = listeners.get(type) || [];
      listeners.set(type, handlers.filter(h => h !== handler));
    },
  };
}
if (typeof global.CustomEvent === 'undefined') {
  global.CustomEvent = class CustomEvent {
    constructor(type, eventInitDict) {
      this.type = type;
      this.detail = eventInitDict?.detail;
    }
  };
}
if (typeof global.Event === 'undefined') {
  global.Event = class Event {
    constructor(type) {
      this.type = type;
    }
  };
}

import {
  getAllResidentLeaves,
  createResidentLeave,
  approveResidentLeave,
  rejectResidentLeave,
  markResidentReturned,
  resetResidentLeavesToInitial
} from '../src/services/hostelResidentLeaveStore.js';
import fs from 'fs';

describe('Overnight Leave Applications & Cross-Role Sync', () => {
  beforeEach(() => {
    storageMap.clear();
    resetResidentLeavesToInitial();
    vi.restoreAllMocks();
  });

  it('student creates an overnight leave application and it is stored with Pending status', () => {
    const leave = createResidentLeave({
      studentName: 'Bishnu Prasad',
      rollNumber: '2305200088',
      regNo: '2305200088',
      hostelName: 'Gandhi Boys Residence',
      roomNumber: '105',
      startDate: '2026-11-05',
      endDate: '2026-11-08',
      days: 3,
      reason: 'Attending National Level Hackathon at IIT Kharagpur',
      guardianName: 'P. Prasad',
      guardianPhone: '+91 94370 99887'
    });

    expect(leave).toBeDefined();
    expect(leave.id).toMatch(/^LV-2026-/);
    expect(leave.status).toBe('Pending');
    expect(leave.studentName).toBe('Bishnu Prasad');
    expect(leave.reason).toContain('Hackathon');

    // Verify it is in getAllResidentLeaves()
    const all = getAllResidentLeaves();
    const found = all.find(l => l.id === leave.id);
    expect(found).toBeDefined();
    expect(found.studentName).toBe('Bishnu Prasad');
    expect(found.status).toBe('Pending');
  });

  it('warden or admin approves student overnight leave with approver name and timestamp', () => {
    const leave = createResidentLeave({
      studentName: 'Priya Nayak',
      rollNumber: '2305200077',
      hostelName: 'Sarojini Girls Residence',
      reason: 'Sister Wedding Ceremony'
    });

    const approvedList = approveResidentLeave(leave.id, 'Mrs. Nibedita Das (Resident Warden)');
    const target = approvedList.find(l => l.id === leave.id);

    expect(target).toBeDefined();
    expect(target.status).toBe('Approved');
    expect(target.approvedBy).toBe('Mrs. Nibedita Das (Resident Warden)');
    expect(target.approvedAt).toBeTruthy();
    expect(target.returned).toBe(false);
  });

  it('warden or admin rejects leave with mandatory reason that student can view', () => {
    const leave = createResidentLeave({
      studentName: 'Subrat Jena',
      rollNumber: '2305200012',
      hostelName: 'Gandhi Boys Residence',
      reason: 'Weekend Outing'
    });

    const rejectReason = 'Upcoming internal mid-semester examinations. Guardian phoned and disapproved leave.';
    const rejectedList = rejectResidentLeave({
      leaveId: leave.id,
      reason: rejectReason,
      rejectedBy: 'Mr. Rajesh Jena (Hostel Admin)'
    });

    const target = rejectedList.find(l => l.id === leave.id);
    expect(target).toBeDefined();
    expect(target.status).toBe('Rejected');
    expect(target.rejectionReason).toBe(rejectReason);
    expect(target.rejectedBy).toBe('Mr. Rajesh Jena (Hostel Admin)');
    expect(target.rejectedAt).toBeTruthy();
  });

  it('marks resident as returned when student arrives back on campus', () => {
    const leave = createResidentLeave({
      studentName: 'Sourav Mohanty',
      rollNumber: '2305200005',
      hostelName: 'Gandhi Boys Residence'
    });

    approveResidentLeave(leave.id, 'Mrs. Nibedita Das');
    const returnedList = markResidentReturned(leave.id);
    const target = returnedList.find(l => l.id === leave.id);

    expect(target.status).toBe('Returned');
    expect(target.returned).toBe(true);
  });

  it('verifies Overnight Leave Applications navigation item exists in both Warden and Hostel Admin menus', () => {
    const portalCode = fs.readFileSync('src/components/HostelPortal.jsx', 'utf8');

    // Verify Overnight Leave Applications in warden nav
    expect(portalCode).toContain("label: 'Overnight Leave Applications'");
    // Verify badge support in nav
    expect(portalCode).toContain('pendingLeavesCount');
    // Verify HostelLeaveSection handles both roles
    expect(portalCode).toContain('<HostelLeaveSection');
  });

  it('verifies RoleDashboardLanding connects 4 KPI cards to live backend stats', () => {
    const landingCode = fs.readFileSync('src/components/RoleDashboardLanding.jsx', 'utf8');

    expect(landingCode).toContain('api.getHostelDashboardStats');
    expect(landingCode).toContain('isHostelAdminRole');
    expect(landingCode).toContain("'ALL'");
    expect(landingCode).toContain('Total Hostel Capacity');
    expect(landingCode).toContain('Occupied Rooms & Beds');
    expect(landingCode).toContain('Available Rooms & Beds');
    expect(landingCode).toContain('Pending Room Requests & Gate Passes');
  });
});
