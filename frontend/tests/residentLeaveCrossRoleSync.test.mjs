// Test suite for Resident Overnight Outstation Leaves Cross-Role Synchronization
// Verifies status normalization, student application, warden/admin approval & rejection with reason,
// and cross-role real-time synchronization.

import assert from 'node:assert/strict';

// Mock browser environment for local storage & events
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};

const listeners = new Map();
global.window = {
  location: { hostname: 'localhost' },
  addEventListener: (event, fn) => {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event).push(fn);
  },
  removeEventListener: (event, fn) => {
    if (listeners.has(event)) {
      listeners.set(event, listeners.get(event).filter(cb => cb !== fn));
    }
  },
  dispatchEvent: (event) => {
    const cbs = listeners.get(event.type) || [];
    for (const cb of cbs) cb(event);
    return true;
  }
};
global.CustomEvent = class CustomEvent {
  constructor(type, eventInitDict) {
    this.type = type;
    this.detail = eventInitDict?.detail;
  }
};
global.Event = class Event {
  constructor(type) {
    this.type = type;
  }
};

// Import module
const {
  normalizeLeaveStatus,
  INITIAL_RESIDENT_LEAVES,
  getAllResidentLeaves,
  getResidentLeavesByStudent,
  createResidentLeave,
  approveResidentLeave,
  rejectResidentLeave,
  markResidentReturned
} = await import('../src/services/hostelResidentLeaveStore.js');

console.log('--- 1. Testing normalizeLeaveStatus ---');
assert.equal(normalizeLeaveStatus('Pending'), 'Pending');
assert.equal(normalizeLeaveStatus('Pending Approval'), 'Pending');
assert.equal(normalizeLeaveStatus('Pending Warden Approval'), 'Pending');
assert.equal(normalizeLeaveStatus('Approved'), 'Approved');
assert.equal(normalizeLeaveStatus('Approved by Hostel Admin'), 'Approved');
assert.equal(normalizeLeaveStatus('Approved by Resident Warden'), 'Approved');
assert.equal(normalizeLeaveStatus('Rejected'), 'Rejected');
assert.equal(normalizeLeaveStatus('Rejected by Warden'), 'Rejected');
assert.equal(normalizeLeaveStatus('Returned'), 'Returned');
assert.equal(normalizeLeaveStatus(null), 'Pending');
assert.equal(normalizeLeaveStatus(undefined), 'Pending');
console.log('✓ normalizeLeaveStatus handles all variants correctly');

console.log('--- 2. Verifying INITIAL_RESIDENT_LEAVES matches user screenshot ---');
const leaves = getAllResidentLeaves();
assert.ok(leaves.length >= 7, 'Expected at least 7 leaves');

const row72 = leaves.find(l => l.id === 'LV-2026-072');
assert.ok(row72, 'LV-2026-072 must exist');
assert.equal(row72.studentName, 'Rakesh Das');
assert.equal(normalizeLeaveStatus(row72.status), 'Pending');
console.log('✓ LV-2026-072 is present and normalized to Pending (will show Pending Review badge and buttons)');

const row46 = leaves.find(l => l.id === 'LV-2026-046');
assert.ok(row46, 'LV-2026-046 must exist');
assert.equal(row46.studentName, 'Raj Sahoo');
assert.equal(normalizeLeaveStatus(row46.status), 'Rejected');
assert.ok(row46.rejectionReason.includes('telephonic consent could not be verified'), 'rejection reason must match screenshot');
console.log('✓ LV-2026-046 is present with specified rejection reason');

const row41 = leaves.find(l => l.id === 'LV-2026-041');
assert.ok(row41, 'LV-2026-041 must exist');
assert.equal(row41.studentName, 'Sourav Mohanty');
assert.equal(normalizeLeaveStatus(row41.status), 'Approved');
console.log('✓ LV-2026-041 is present and normalized to Approved');

console.log('--- 3. Testing Student Application Lifecycle ---');
let eventFired = false;
window.addEventListener('bput_hostel_leaves_updated', (e) => {
  eventFired = true;
});

const newApp = createResidentLeave({
  studentName: 'Sourav Mohanty',
  rollNumber: '2305200005',
  regNo: '2305200005',
  hostelName: 'Gandhi Boys Residence',
  roomNumber: '201',
  phone: '+91 98610 55443',
  startDate: '2026-11-05',
  endDate: '2026-11-08',
  days: 3,
  reason: 'Attending State Level Robotics Conclave',
  guardianName: 'B. C. Mohanty',
  guardianPhone: '+91 98610 88771'
});

assert.ok(newApp.id.startsWith('LV-2026-'));
assert.equal(newApp.status, 'Pending');
assert.equal(eventFired, true, 'bput_hostel_leaves_updated must fire on submission');

const allAfterCreate = getAllResidentLeaves();
const createdInStore = allAfterCreate.find(l => l.id === newApp.id);
assert.ok(createdInStore, 'Newly created leave must be in store');
assert.equal(createdInStore.status, 'Pending');
console.log('✓ Student can apply for leave and it immediately enters Pending status');

console.log('--- 4. Testing Warden / Hostel Admin Approval ---');
const approvedList = approveResidentLeave(newApp.id, 'Mr. Rajesh Jena (Hostel Admin)');
const approvedItem = approvedList.find(l => l.id === newApp.id);
assert.equal(approvedItem.status, 'Approved');
assert.equal(approvedItem.approvedBy, 'Mr. Rajesh Jena (Hostel Admin)');
assert.ok(approvedItem.approvedAt, 'approvedAt timestamp must be recorded');
console.log('✓ Leave approved successfully with officer name and timestamp');

console.log('--- 5. Testing Warden / Hostel Admin Rejection with Reason ---');
const testApp2 = createResidentLeave({
  studentName: 'Amit Nayak',
  rollNumber: '2305200002',
  regNo: '2305200002',
  hostelName: 'Gandhi Boys Residence',
  roomNumber: '102',
  phone: '+91 98610 00222',
  reason: 'Weekend trip without formal mentor authorization'
});

const rejectReason = 'Guardian telephone verification unsuccessful after 3 attempts; mandatory parent sign-off required.';
const rejectedList = rejectResidentLeave({
  leaveId: testApp2.id,
  reason: rejectReason,
  rejectedBy: 'Mr. Rajesh Jena (Resident Warden)'
});

const rejectedItem = rejectedList.find(l => l.id === testApp2.id);
assert.equal(rejectedItem.status, 'Rejected');
assert.equal(rejectedItem.rejectionReason, rejectReason);
assert.equal(rejectedItem.rejectedBy, 'Mr. Rajesh Jena (Resident Warden)');
assert.ok(rejectedItem.rejectedAt, 'rejectedAt timestamp must be recorded');
console.log('✓ Leave rejected with mandatory reason and notifying metadata');

console.log('--- 6. Testing Student Query & Verification ---');
const souravLeaves = getResidentLeavesByStudent('2305200005');
assert.ok(souravLeaves.some(l => l.id === newApp.id && l.status === 'Approved'), 'Sourav must see his approved leave');

const amitLeaves = getResidentLeavesByStudent('2305200002');
const amitRejected = amitLeaves.find(l => l.id === testApp2.id);
assert.ok(amitRejected, 'Amit must find his application');
assert.equal(amitRejected.status, 'Rejected');
assert.equal(amitRejected.rejectionReason, rejectReason);
console.log('✓ Student view accurately fetches approved and rejected status with stated reason');

console.log('\nAll 6 test assertions PASSED cleanly!');
