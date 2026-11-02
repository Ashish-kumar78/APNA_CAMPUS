import test from 'node:test';
import assert from 'node:assert';
import {
  submitHostelAttendance,
  updateHostelAttendance,
  getSubmittedAttendances,
  getStudentsRoster
} from '../src/services/hostelAttendanceStore.js';

// Setup local storage mock
const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const dispatchedEvents = [];
globalThis.window = {
  dispatchEvent: (event) => {
    dispatchedEvents.push(event);
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

test('Hostel Admin can edit and update hostel attendance records', () => {
  // 1. Initial warden submission
  const initialRoster = [
    { studentName: 'Rakesh Das', rollNumber: '01', roomNumber: '101', status: 'Present' },
    { studentName: 'Amit Pattnaik', rollNumber: '03', roomNumber: '101', status: 'Present' },
    { studentName: 'Sourav Mohanty', rollNumber: '05', roomNumber: '102', status: 'Present' }
  ];

  const wardenSubmission = submitHostelAttendance({
    id: 'att-bhabani-2026-11-01',
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-11-01',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Mrs. Nibedita Das (Hostel Warden)',
    records: initialRoster,
    remarks: 'Initial roll call taken by Warden'
  });

  assert.strictEqual(wardenSubmission.stats.present, 3);
  assert.strictEqual(wardenSubmission.stats.absent, 0);

  // 2. Hostel Admin edits attendance: marks Amit Pattnaik as Absent and Sourav Mohanty as On Leave
  const editedRoster = [
    { studentName: 'Rakesh Das', rollNumber: '01', roomNumber: '101', status: 'Present' },
    { studentName: 'Amit Pattnaik', rollNumber: '03', roomNumber: '101', status: 'Absent' },
    { studentName: 'Sourav Mohanty', rollNumber: '05', roomNumber: '102', status: 'On Leave' }
  ];

  const adminUpdate = submitHostelAttendance({
    id: wardenSubmission.id,
    hostelName: 'Bhabani Hostel-1',
    hostelCode: 'BN1',
    date: '2026-11-01',
    session: 'Night Roll Call (08:30 PM)',
    submittedBy: 'Dr. Principal / Admin (Hostel Admin Verified)',
    records: editedRoster,
    status: 'Verified & Modified by Admin',
    updatedByAdmin: true,
    remarks: 'Attendance modified by Hostel Administrator following late gate entry log.'
  });

  // Verify the updated submission has modified stats
  assert.strictEqual(adminUpdate.stats.present, 1);
  assert.strictEqual(adminUpdate.stats.absent, 1);
  assert.strictEqual(adminUpdate.stats.onLeave, 1);
  assert.strictEqual(adminUpdate.updatedByAdmin, true);
  assert.strictEqual(adminUpdate.status, 'Verified & Modified by Admin');

  // Verify stored records reflect the admin update
  const allSubmissions = getSubmittedAttendances();
  const found = allSubmissions.find(s => s.id === wardenSubmission.id);
  assert.ok(found);
  assert.strictEqual(found.stats.present, 1);
  assert.strictEqual(found.stats.absent, 1);
  assert.strictEqual(found.records.find(r => r.rollNumber === '03').status, 'Absent');
  assert.strictEqual(found.records.find(r => r.rollNumber === '05').status, 'On Leave');

  // Verify events dispatched so warden dashboard reacts in real time
  const updatedEvents = dispatchedEvents.filter(e => e.type === 'bput_hostel_attendance_updated');
  assert.ok(updatedEvents.length > 0, 'bput_hostel_attendance_updated event must be dispatched');
  const lastEvent = updatedEvents[updatedEvents.length - 1];
  assert.strictEqual(lastEvent.detail.updatedByAdmin, true);
});

