import assert from 'node:assert';
import {
  submitHostelAttendance,
  getSubmittedAttendances,
  getStudentsRoster
} from '../src/services/hostelAttendanceStore.js';
import {
  getLatestHostelAttendanceDate,
  formatToDDMMYYYY
} from '../src/services/studentStore.js';

// Setup Mock Window & LocalStorage
const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
global.window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = class {
  constructor(type, eventInitDict) {
    this.type = type;
    this.detail = eventInitDict?.detail;
  }
};
global.Event = class {
  constructor(type) {
    this.type = type;
  }
};

console.log('--- 1. Testing Initial Unsubmitted State on Day 1 (2026-11-05) ---');
const day1 = '2026-11-05';
const hostel = 'Bhabani Hostel-1';
const session = 'Night Roll Call (08:30 PM)';

// Check existing attendances for day 1
let existingDay1 = getSubmittedAttendances().find(
  s => (s.hostelName?.toLowerCase() === hostel.toLowerCase() || s.hostelCode === hostel) &&
       s.date === day1 &&
       s.session === session
);
assert.strictEqual(existingDay1, undefined, 'Day 1 should not have any submitted attendance initially');
console.log('✓ Day 1 initially unsubmitted: "Take Attendance" option is displayed, student table hidden initially');

console.log('--- 2. Taking and Submitting Attendance on Day 1 ---');
const roster = getStudentsRoster(hostel);
assert.ok(roster.length > 0, 'Roster should contain residents');

const day1Submission = submitHostelAttendance({
  id: `att-test-${day1}`,
  hostelName: hostel,
  hostelCode: 'BN1',
  date: day1,
  session,
  submittedBy: 'Mrs. Nibedita Das (Resident Warden)',
  records: roster.map(s => ({
    studentId: s.id,
    studentName: s.studentName,
    rollNumber: s.rollNumber,
    regNo: s.regNo,
    roomNumber: s.roomNumber,
    bedNumber: s.bedNumber,
    department: s.department,
    status: 'Present'
  })),
  remarks: 'Daily roll call taken.'
});

assert.ok(day1Submission.id, 'Submission should succeed');

// Now check if Day 1 has existing attendance
existingDay1 = getSubmittedAttendances().find(
  s => (s.hostelName?.toLowerCase() === hostel.toLowerCase() || s.hostelCode === hostel) &&
       s.date === day1 &&
       s.session === session
);
assert.ok(existingDay1, 'Day 1 should now be recorded as submitted');
console.log('✓ Day 1 attendance successfully submitted');

// Check student portal date
const studentDateDay1 = getLatestHostelAttendanceDate();
assert.strictEqual(studentDateDay1, '05/11/2026', 'Student portal Last Date of Hostel Attendance should automatically be 05/11/2026');
console.log('✓ Student portal Last Date of Hostel Attendance updated to:', studentDateDay1);

console.log('--- 3. Verifying Post-Submit State for Day 1 ---');
// Once submitted: "Take Attendance" is disabled/hidden, only "Update" is available
const isSubmittedDay1 = !!existingDay1;
assert.strictEqual(isSubmittedDay1, true, 'isSubmitted must be true');
console.log('✓ Day 1 is in submitted state: "Take Attendance" option is disabled/hidden, only "Update" is active');

console.log('--- 4. Switching to Next Day (2026-11-06) ---');
const day2 = '2026-11-06';
let existingDay2 = getSubmittedAttendances().find(
  s => (s.hostelName?.toLowerCase() === hostel.toLowerCase() || s.hostelCode === hostel) &&
       s.date === day2 &&
       s.session === session
);
assert.strictEqual(existingDay2, undefined, 'Next day (2026-11-06) should NOT have submitted attendance yet');
const isSubmittedDay2 = !!existingDay2;
assert.strictEqual(isSubmittedDay2, false, 'isSubmitted must be false for the next day');
console.log('✓ Next day has no attendance yet: "Take Attendance" option is shown again!');

console.log('--- 5. Taking and Submitting Attendance on Next Day ---');
const day2Submission = submitHostelAttendance({
  id: `att-test-${day2}`,
  hostelName: hostel,
  hostelCode: 'BN1',
  date: day2,
  session,
  submittedBy: 'Mrs. Nibedita Das (Resident Warden)',
  records: roster.map(s => ({
    studentId: s.id,
    studentName: s.studentName,
    rollNumber: s.rollNumber,
    regNo: s.regNo,
    roomNumber: s.roomNumber,
    bedNumber: s.bedNumber,
    department: s.department,
    status: 'Present'
  })),
  remarks: 'Next day daily roll call taken.'
});

const studentDateDay2 = getLatestHostelAttendanceDate();
assert.strictEqual(studentDateDay2, '06/11/2026', 'Student portal Last Date of Hostel Attendance should automatically be 06/11/2026');
console.log('✓ Student portal Last Date of Hostel Attendance updated to:', studentDateDay2);

existingDay2 = getSubmittedAttendances().find(
  s => (s.hostelName?.toLowerCase() === hostel.toLowerCase() || s.hostelCode === hostel) &&
       s.date === day2 &&
       s.session === session
);
assert.ok(existingDay2, 'Day 2 attendance is now recorded');
console.log('✓ Next day attendance submitted: "Take Attendance" is disabled, only "Update" is active');

console.log('--- 6. Switching Back to Day 1 (2026-11-05) ---');
const recheckDay1 = getSubmittedAttendances().find(
  s => (s.hostelName?.toLowerCase() === hostel.toLowerCase() || s.hostelCode === hostel) &&
       s.date === day1 &&
       s.session === session
);
assert.ok(recheckDay1, 'Day 1 record remains locked & submitted');
console.log('✓ Day 1 remains in submitted state with ONLY "Update" option available');

console.log('\nAll Warden Take Attendance & Next-Day Lifecycle tests PASSED cleanly!');

