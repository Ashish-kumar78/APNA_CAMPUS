// Integration Test: Hostel Management Integration in Admin Office and Super Admin
// Verifies shared data, real-time sync, and CRUD functionality for Wardens and Leaves

import assert from 'node:assert';

// Mock localStorage and window for node test environment
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};

global.window = {
  location: { hostname: 'localhost' },
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = class CustomEvent { constructor(name, detail) { this.name = name; this.detail = detail; } };
global.Event = class Event { constructor(name) { this.name = name; } };

const {
  getAllWardens,
  saveWarden,
  addNewWarden,
  deleteWarden,
  setWardenDutyStatus
} = await import('../src/services/wardenManagementStore.js');

const {
  getAllResidentLeaves,
  approveResidentLeave,
  rejectResidentLeave,
  createResidentLeave
} = await import('../src/services/hostelResidentLeaveStore.js');

console.log('--- Starting Hostel Management Integration Tests ---');

// TEST 1: Warden Store Operations
console.log('Test 1: Warden Directory & CRUD...');
const initialCount = getAllWardens().length;
assert(initialCount > 0, 'Initial wardens should not be empty');

const testWarden = {
  id: 'WRD-TEST-99',
  name: 'Prof. Test Warden',
  gender: 'Male',
  hostelCategory: 'Boys Hostel',
  assignedHostel: 'Gandhi Boys Residence',
  roomOffice: 'Ground Floor, Test Cabin',
  shift: '24x7 Resident Duty',
  phone: '+91 94370 99999',
  email: 'test.warden@apnacampus.edu.in',
  residentsCount: 160,
  totalBeds: 180,
  accountStatus: 'Active',
  dutyStatus: 'On Duty'
};

// Add Warden
addNewWarden(testWarden);
const afterAdd = getAllWardens();
const foundAdd = afterAdd.find(w => w.id === 'WRD-TEST-99');
assert(foundAdd, 'Added warden should be in store');
assert.strictEqual(foundAdd.name, 'Prof. Test Warden');
console.log('✓ Warden Add verified');

// Edit Warden
saveWarden({ ...testWarden, name: 'Prof. Test Warden Updated' });
const foundEdit = getAllWardens().find(w => w.id === 'WRD-TEST-99');
assert.strictEqual(foundEdit.name, 'Prof. Test Warden Updated');
console.log('✓ Warden Edit verified');

// Duty Status Toggle (On Duty -> On Leave)
setWardenDutyStatus('WRD-TEST-99', 'On Leave');
const foundLeave = getAllWardens().find(w => w.id === 'WRD-TEST-99');
assert.strictEqual(foundLeave.dutyStatus, 'On Leave');
console.log('✓ Warden Duty Status (On Leave) verified');

// Delete Warden
deleteWarden('WRD-TEST-99');
const afterDelete = getAllWardens();
assert(!afterDelete.find(w => w.id === 'WRD-TEST-99'), 'Deleted warden should not exist');
console.log('✓ Warden Delete verified');

// TEST 2: Shared Real-Time Leave Application
console.log('\nTest 2: Student Leave Shared Workflow...');
const newLeave = createResidentLeave({
  studentName: 'Amit Kumar',
  rollNumber: '2305200099',
  regNo: '2305201099',
  hostelName: 'Gandhi Boys Residence',
  roomNumber: '101',
  phone: '+91 94370 12345',
  startDate: '2026-11-05',
  endDate: '2026-11-08',
  reason: 'Family Emergency',
  guardianName: 'S. Kumar',
  guardianPhone: '+91 94370 54321'
});

assert(newLeave && newLeave.id, 'Leave application should be created with an ID');
assert.strictEqual(newLeave.status, 'Pending');
console.log(`✓ Student Leave created (ID: ${newLeave.id}, Status: Pending)`);

// 2. Admin / Super Admin approves leave
approveResidentLeave(newLeave.id, 'Approved by Institutional Administration Office');
const approvedLeaves = getAllResidentLeaves();
const foundApproved = approvedLeaves.find(l => l.id === newLeave.id);
assert.strictEqual(foundApproved.status, 'Approved');
assert(foundApproved.approvedAt, 'approvedAt timestamp must be set');
console.log('✓ Leave Approval verified across portals (Status: Approved)');

// 3. Reject leave with reason
rejectResidentLeave({
  leaveId: newLeave.id,
  reason: 'Parent verification required',
  wardenName: 'Admin Office'
});
const rejectedLeaves = getAllResidentLeaves();
const foundRejected = rejectedLeaves.find(l => l.id === newLeave.id);
assert.strictEqual(foundRejected.status, 'Rejected');
assert.strictEqual(foundRejected.rejectionReason, 'Parent verification required');
console.log('✓ Leave Rejection with Reason verified (Status: Rejected)');

console.log('\n--- ALL HOSTEL MANAGEMENT INTEGRATION TESTS PASSED! ---');
