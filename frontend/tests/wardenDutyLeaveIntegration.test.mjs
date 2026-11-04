import assert from 'node:assert';
import {
  getAllStaffLeaves,
  saveStaffLeaves,
  approveStaffLeave,
  rejectStaffLeave,
  applyStaffLeave,
  evaluateAllWardensDutyStatus,
  resetStaffLeavesToDefaults
} from '../src/services/hostelStaffLeaveStore.js';
import {
  getAllWardens,
  setWardenDutyStatus,
  saveWardens,
  INITIAL_WARDENS
} from '../src/services/wardenManagementStore.js';

// Mock localStorage and window events for node environment
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear()
};
global.window = {
  dispatchEvent: () => {}
};
global.Event = class {};
global.CustomEvent = class {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts?.detail;
  }
};

console.log('--- STARTING WARDEN DUTY & LEAVE INTEGRATION TESTS ---');

// Test 1: Initial state verification
resetStaffLeavesToDefaults();
saveWardens(INITIAL_WARDENS.map(w => ({ ...w, dutyStatus: 'On Duty', relievingWarden: 'None Assigned' })));

let wardens = getAllWardens();
let leaves = getAllStaffLeaves();

const initialNibedita = wardens.find(w => w.name.includes('Nibedita'));
assert.strictEqual(initialNibedita.dutyStatus, 'On Duty', 'Initial duty status should be On Duty');

const pendingLeave = leaves.find(l => l.applicantName.includes('Nibedita') && l.status === 'Pending Approval');
assert.ok(pendingLeave, 'Pending leave application for Mrs. Nibedita Das should exist');
console.log('✓ Test 1 Passed: Initial state verified. Mrs. Nibedita Das is On Duty with pending leave.');

// Test 2: Admin approves leave covering today (2026-11-04)
approveStaffLeave(pendingLeave.id, 'Sanctioned by Admin', 'Hostel Admin');
evaluateAllWardensDutyStatus('2026-11-04');

wardens = getAllWardens();
const onLeaveNibedita = wardens.find(w => w.name.includes('Nibedita'));
assert.strictEqual(onLeaveNibedita.dutyStatus, 'On Leave', 'Mrs. Nibedita Das should automatically be On Leave');
assert.strictEqual(onLeaveNibedita.relievingWarden, 'Dr. Swapna Patra', 'Relieving official should be Dr. Swapna Patra');

const activeCount = wardens.filter(w => w.dutyStatus === 'On Duty').length;
const onLeaveCount = wardens.filter(w => w.dutyStatus === 'On Leave').length;
assert.strictEqual(onLeaveCount, 1, 'Exactly 1 warden should be on leave');
assert.strictEqual(activeCount, wardens.length - 1, 'Active wardens count should decrement by 1');
console.log('✓ Test 2 Passed: Upon leave approval, Mrs. Nibedita Das automatically switched to On Leave with Dr. Swapna Patra.');

// Test 3: Automatic reversion to On Duty when leave period ends (e.g. 2026-11-07)
evaluateAllWardensDutyStatus('2026-11-07');
wardens = getAllWardens();
const returnedNibedita = wardens.find(w => w.name.includes('Nibedita'));
assert.strictEqual(returnedNibedita.dutyStatus, 'On Duty', 'Duty status should automatically revert to On Duty after leave end date');
assert.strictEqual(returnedNibedita.relievingWarden, 'None Assigned', 'Relieving official should reset to None Assigned');

const postActiveCount = wardens.filter(w => w.dutyStatus === 'On Duty').length;
assert.strictEqual(postActiveCount, wardens.length, 'All wardens should be back on duty once leave expires');
console.log('✓ Test 3 Passed: Expired leave automatically returns warden to On Duty.');

// Test 4: Manual "Resume Duty" action before leave expires
// Put her back on leave for 2026-11-04
evaluateAllWardensDutyStatus('2026-11-04');
assert.strictEqual(getAllWardens().find(w => w.name.includes('Nibedita')).dutyStatus, 'On Leave');

// Early manual return by admin
setWardenDutyStatus(onLeaveNibedita.id, 'On Duty', 'Early return from leave', 'None Assigned');
wardens = getAllWardens();
const resumedNibedita = wardens.find(w => w.id === onLeaveNibedita.id);
assert.strictEqual(resumedNibedita.dutyStatus, 'On Duty', 'Manual resume should set status to On Duty');
assert.strictEqual(resumedNibedita.relievingWarden, 'None Assigned', 'Relieving official should be None Assigned');
console.log('✓ Test 4 Passed: Manual Resume Duty immediately returns warden to active duty.');

// Test 5: Rejection does not place warden on leave
const rejectedLeaveId = 'LV-TEST-REJECT-01';
applyStaffLeave({
  id: rejectedLeaveId,
  applicantName: 'Mr. Rajesh Jena',
  employeeId: 'WRD-101',
  startDate: '2026-11-04',
  endDate: '2026-11-05',
  status: 'Pending Approval'
});

rejectStaffLeave(rejectedLeaveId, 'Manpower shortage');
evaluateAllWardensDutyStatus('2026-11-04');
const rajesh = getAllWardens().find(w => w.id === 'WRD-101');
assert.strictEqual(rajesh.dutyStatus, 'On Duty', 'Rejected leave should keep warden On Duty');
console.log('✓ Test 5 Passed: Rejected leave keeps warden On Duty.');

console.log('\n--- ALL 5 INTEGRATION TESTS PASSED SUCCESSFULLY! ---');

