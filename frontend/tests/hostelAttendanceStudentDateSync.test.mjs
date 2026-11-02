// Test suite for Hostel Attendance Submission -> Student Portal Last Date of Hostel Attendance Sync
import assert from 'node:assert/strict';

// Mock browser environment
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

const {
  formatToDDMMYYYY,
  getLatestHostelAttendanceDate,
  updateStudentsHostelAttendanceDate,
  defaultDemoStudent,
  rakeshDasStudent,
  findStudentByQuery,
  getAllStudents
} = await import('../src/services/studentStore.js');

const {
  submitHostelAttendance,
  getSubmittedAttendances
} = await import('../src/services/hostelAttendanceStore.js');

console.log('--- 1. Testing formatToDDMMYYYY helper ---');
assert.equal(formatToDDMMYYYY('2026-11-01'), '01/11/2026');
assert.equal(formatToDDMMYYYY('2026-10-16'), '16/10/2026');
assert.equal(formatToDDMMYYYY('16/10/2026'), '16/10/2026');
assert.equal(formatToDDMMYYYY('2026-12-25'), '25/12/2026');
console.log('✓ formatToDDMMYYYY converts dates accurately');

console.log('--- 2. Initial state before attendance submission ---');
assert.equal(defaultDemoStudent.lastHostelAttendanceDate, '16/10/2026');
assert.equal(rakeshDasStudent.lastHostelAttendanceDate, '16/10/2026');
console.log('✓ Initial lastHostelAttendanceDate is 16/10/2026 matching user screenshot');

console.log('--- 3. Submitting Attendance Roster by Warden / Admin for 2026-11-01 ---');
let eventAttendanceSubmitted = false;
let eventStudentChanged = false;

window.addEventListener('bput_hostel_attendance_submitted', (e) => {
  eventAttendanceSubmitted = true;
});

window.addEventListener('cms_students_changed', (e) => {
  eventStudentChanged = true;
});

const rosterStudents = [
  { studentId: 'std-1', studentName: 'Rakesh Das', rollNumber: '01', regNo: '2305201001', status: 'Present' },
  { studentId: 'std-2', studentName: 'Amit Nayak', rollNumber: '03', regNo: '2305201002', status: 'Present' },
  { studentId: 'std-bishnu', studentName: 'BISHNU PRASAD SAHOO', rollNumber: '2401432265', regNo: '2401432265', status: 'Present' }
];

const submission1 = submitHostelAttendance({
  hostelName: 'Gandhi Boys Residence',
  hostelCode: 'GBR',
  date: '2026-11-01',
  session: 'Night Roll Call (08:30 PM)',
  submittedBy: 'Mr. Rajesh Jena (Resident Warden)',
  records: rosterStudents,
  remarks: 'Daily night roll call recorded and verified.'
});

assert.ok(submission1.id);
assert.equal(submission1.date, '2026-11-01');
assert.equal(eventAttendanceSubmitted, true, 'bput_hostel_attendance_submitted event must fire');
assert.equal(eventStudentChanged, true, 'cms_students_changed event must fire');

// Verify studentStore date updated immediately
assert.equal(getLatestHostelAttendanceDate(), '01/11/2026');
assert.equal(defaultDemoStudent.lastHostelAttendanceDate, '01/11/2026');
assert.equal(rakeshDasStudent.lastHostelAttendanceDate, '01/11/2026');

const rakesh = findStudentByQuery('2305201001');
assert.ok(rakesh);
assert.equal(rakesh.lastHostelAttendanceDate, '01/11/2026');

const bishnu = findStudentByQuery('2401432265');
assert.ok(bishnu);
assert.equal(bishnu.lastHostelAttendanceDate, '01/11/2026');

console.log('✓ After submit, Last Date of Hostel Attendance automatically updated from 16/10/2026 -> 01/11/2026');

console.log('--- 4. Submitting Next Attendance for 2026-11-02 ---');
const submission2 = submitHostelAttendance({
  hostelName: 'Gandhi Boys Residence',
  hostelCode: 'GBR',
  date: '2026-11-02',
  session: 'Night Roll Call (08:30 PM)',
  submittedBy: 'Mr. Rajesh Jena (Hostel Admin)',
  records: rosterStudents,
  remarks: 'Subsequent roll call verification.'
});

assert.equal(getLatestHostelAttendanceDate(), '02/11/2026');
const rakeshUpdated = findStudentByQuery('2305201001');
assert.equal(rakeshUpdated.lastHostelAttendanceDate, '02/11/2026');
console.log('✓ After subsequent submit, Last Date of Hostel Attendance automatically updated -> 02/11/2026');

console.log('\nAll Hostel Attendance Last Date Sync tests PASSED cleanly!');

