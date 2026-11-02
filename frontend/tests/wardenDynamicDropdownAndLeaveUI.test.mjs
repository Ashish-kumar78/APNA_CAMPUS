// Test for dynamic warden dropdown synchronization and Duty & Leave Management UI
import assert from 'node:assert/strict';
import {
  getAllWardens,
  addNewWarden,
  getRelatedWardensForHostel,
  getWardenAssignedHostel
} from '../src/services/wardenManagementStore.js';
import {
  getAllStaffLeaves,
  applyStaffLeave,
  approveStaffLeave,
  rejectStaffLeave
} from '../src/services/hostelStaffLeaveStore.js';

// Setup Mock Window and LocalStorage
const storageMap = new Map();
global.localStorage = {
  getItem: (key) => storageMap.get(key) || null,
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

const dispatchedEvents = [];
global.window = {
  dispatchEvent: (event) => {
    dispatchedEvents.push(event);
    return true;
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
  }
};
global.Event = class Event {
  constructor(type) {
    this.type = type;
  }
};

console.log('Testing Warden Dynamic Dropdown Synchronization...');

// 1. Initial wardens list
const initialWardens = getAllWardens();
assert(Array.isArray(initialWardens), 'getAllWardens should return an array');
assert(initialWardens.length >= 6, 'Should have initial seeded wardens');
console.log(`✓ Initial wardens count: ${initialWardens.length}`);

// 2. Add a new warden
const testWardenPayload = {
  title: 'Dr.',
  firstName: 'Pravat',
  lastName: 'Mishra',
  designation: 'Resident Facilities Warden',
  department: 'Hostel Administration',
  hostelName: 'Kalam Complex Block C',
  phone: '+91 94370 99999',
  mobileNo: '+91 94370 99999',
  email: 'pravat.mishra@gift.edu.in',
  dutyShift: 'Night Relief Shift',
  qualification: 'Ph.D in Operations'
};

const createdWarden = addNewWarden(testWardenPayload);
assert(createdWarden, 'addNewWarden should return the created warden');
assert.equal(createdWarden.name, 'Dr. Pravat Mishra');
assert.equal(createdWarden.hostelName, 'Kalam Complex Block C');
console.log(`✓ Successfully created warden: ${createdWarden.name} (${createdWarden.id})`);

// 3. Verify updated wardens list includes the newly created warden
const updatedWardens = getAllWardens();
const found = updatedWardens.find(w => w.id === createdWarden.id);
assert(found, 'New warden must be found in getAllWardens()');
assert.equal(found.name, 'Dr. Pravat Mishra');
console.log('✓ New warden is immediately present in directory');

// 4. Verify related warden auto-linking
const related = getRelatedWardensForHostel('Kalam Complex Block C');
assert(related.length > 0, 'Related wardens should find the newly assigned warden');
assert(related.some(w => w.name === 'Dr. Pravat Mishra'), 'Dr. Pravat Mishra should be linked to Kalam Complex Block C');
console.log(`✓ Related warden auto-linking works (${related.length} match found)`);

const assignedHostel = getWardenAssignedHostel('Dr. Pravat Mishra');
assert(assignedHostel, 'getWardenAssignedHostel should resolve warden profile');
assert.equal(assignedHostel.hostelName, 'Kalam Complex Block C');
console.log('✓ getWardenAssignedHostel resolves correct complex');

// 5. Verify events dispatched for UI reactivity
const hasUpdateEvent = dispatchedEvents.some(e => e.type === 'bput_wardens_updated');
const hasCreatedEvent = dispatchedEvents.some(e => e.type === 'bput_warden_created');
const hasStorageEvent = dispatchedEvents.some(e => e.type === 'storage');
assert(hasUpdateEvent, 'Must dispatch bput_wardens_updated');
assert(hasCreatedEvent, 'Must dispatch bput_warden_created');
assert(hasStorageEvent, 'Must dispatch storage event');
console.log('✓ All real-time synchronization events dispatched successfully');

// 6. Test Staff Leave Application & Sanctions
console.log('Testing Staff Leave Sanctions...');
const leavePayload = {
  applicantName: createdWarden.name,
  employeeId: createdWarden.id,
  designation: createdWarden.designation,
  leaveType: 'Special Leave',
  startDate: '2026-11-05',
  endDate: '2026-11-07',
  days: 3,
  reason: 'Academic Conference in New Delhi',
  relievingWarden: 'Mr. Rajesh Jena',
  status: 'Approved by Hostel Admin'
};

const leaveRes = applyStaffLeave(leavePayload);
assert(leaveRes && leaveRes.newApplication, 'applyStaffLeave should succeed');
assert.equal(leaveRes.newApplication.status, 'Approved by Hostel Admin');
console.log(`✓ Staff leave application registered: ${leaveRes.newApplication.id}`);

const allStaffLeaves = getAllStaffLeaves();
assert(allStaffLeaves.some(l => l.id === leaveRes.newApplication.id), 'Staff leave must be persisted in storage');
console.log('✓ Staff leave properly persisted');

console.log('All tests passed successfully!');

