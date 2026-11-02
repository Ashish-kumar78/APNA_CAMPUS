import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CalendarNotesService } = require('../../backend/dist/src/calendar-notes/calendar-notes.service.js');

import {
  resolveUserId,
  getLocalNotesForUser,
  saveLocalNotesForUser,
  createCalendarNote,
  getCalendarNotes,
  getPendingCalendarReminders,
  updateCalendarNote,
  submitCalendarNote,
  deleteCalendarNote,
} from '../src/services/calendarNotesStore.js';

console.log('========================================================');
console.log('Testing Calendar Notes & Mandatory Reminder System');
console.log('========================================================\n');

// --- 1. VERIFY FRONTEND CODE STRUCTURE & INTEGRATION ---
console.log('--- 1. Verifying Code Structure & Component Wiring ---');
const appJsPath = path.resolve('frontend/src/App.jsx');
const landingPath = path.resolve('frontend/src/components/RoleDashboardLanding.jsx');
const studentPortalPath = path.resolve('frontend/src/StudentPortal.jsx');
const calendarWidgetPath = path.resolve('frontend/src/components/CalendarWidget.jsx');
const reminderModalPath = path.resolve('frontend/src/components/CalendarReminderModal.jsx');
const backendControllerPath = path.resolve('backend/src/calendar-notes/calendar-notes.controller.ts');
const backendServicePath = path.resolve('backend/src/calendar-notes/calendar-notes.service.ts');

assert(fs.existsSync(calendarWidgetPath), 'CalendarWidget.jsx must exist');
assert(fs.existsSync(reminderModalPath), 'CalendarReminderModal.jsx must exist');
assert(fs.existsSync(backendControllerPath), 'calendar-notes.controller.ts must exist');
assert(fs.existsSync(backendServicePath), 'calendar-notes.service.ts must exist');

const appContent = fs.readFileSync(appJsPath, 'utf8');
assert(appContent.includes('CalendarReminderModal'), 'App.jsx must import and mount CalendarReminderModal');
assert(appContent.includes('<CalendarReminderModal account={account} />'), 'App.jsx must render CalendarReminderModal');

const landingContent = fs.readFileSync(landingPath, 'utf8');
assert(landingContent.includes('CalendarWidget'), 'RoleDashboardLanding must import and mount CalendarWidget');
assert(landingContent.includes('<CalendarWidget account={account} />'), 'RoleDashboardLanding must render CalendarWidget');

const studentContent = fs.readFileSync(studentPortalPath, 'utf8');
assert(studentContent.includes('CalendarWidget'), 'StudentPortal must import and mount CalendarWidget');
assert(studentContent.includes('<CalendarWidget account={account} />'), 'StudentPortal must render CalendarWidget');

console.log('✔ Component integration across App.jsx, RoleDashboardLanding, and StudentPortal verified.\n');

// --- 2. MULTIPLE NOTES FOR THE SAME DATE ---
console.log('--- 2. Testing Multiple Notes for the Same Date ---');
const principalAccount = { id: 'PRIN-001', name: 'Dr. S. K. Rath', role: 'principal' };
const targetDate = '2026-11-05';

// Clear initial state
saveLocalNotesForUser(principalAccount, []);

const note1 = await createCalendarNote(principalAccount, {
  title: 'Submit project documentation',
  description: 'Submit technical architecture doc to university board',
  scheduledDate: targetDate,
});

const note2 = await createCalendarNote(principalAccount, {
  title: 'Complete attendance verification',
  description: 'Audit bio-metric registers for tech faculty',
  scheduledDate: targetDate,
});

const note3 = await createCalendarNote(principalAccount, {
  title: 'Review pending hostel complaints',
  description: 'Weekly review of hostel infrastructure reports',
  scheduledDate: targetDate,
});

assert(note1 && note2 && note3, 'All 3 notes must be created');
assert.notEqual(note1.id, note2.id, 'Notes must have unique IDs');
assert.notEqual(note2.id, note3.id, 'Notes must have unique IDs');

const notesOnDate = await getCalendarNotes(principalAccount, targetDate);
assert.equal(notesOnDate.length, 3, 'Must retrieve all 3 separate notes for November 5, 2026');
console.log(`✔ Created and retrieved ${notesOnDate.length} distinct notes for ${targetDate}`);

// --- 3. ROLE-BASED PERSONAL PRIVACY & ISOLATION ---
console.log('\n--- 3. Testing Strict User Privacy (Principal vs Faculty vs Warden vs Admin) ---');
const facultyAccount = { id: 'FAC-201', name: 'Prof. Amrita Mohanty', role: 'faculty' };
const wardenAccount = { id: 'WRD-101', name: 'Mrs. Nibedita Das', role: 'warden' };
const adminAccount = { id: 'ADM-001', name: 'Mr. Rajesh Jena', role: 'admin' };

saveLocalNotesForUser(facultyAccount, []);
saveLocalNotesForUser(wardenAccount, []);
saveLocalNotesForUser(adminAccount, []);

// Faculty creates a note
const facultyNote = await createCalendarNote(facultyAccount, {
  title: 'Grade Semester 5 Mid-Term Papers',
  description: 'Operating Systems paper evaluation',
  scheduledDate: '2026-11-03',
});

// Warden creates a note
const wardenNote = await createCalendarNote(wardenAccount, {
  title: 'Inspect Mess Food Quality',
  description: 'Random dinner inspection at Gandhi Boys Residence',
  scheduledDate: '2026-11-04',
});

// Verify Principal CANNOT see Faculty or Warden notes
const principalVisible = await getCalendarNotes(principalAccount);
assert(principalVisible.every(n => n.userId === 'prin-001'), 'Principal must only see notes owned by Principal');
assert(!principalVisible.some(n => n.id === facultyNote.id), 'Principal must NEVER see Faculty notes');
assert(!principalVisible.some(n => n.id === wardenNote.id), 'Principal must NEVER see Warden notes');

// Verify Faculty CANNOT see Principal or Warden notes
const facultyVisible = await getCalendarNotes(facultyAccount);
assert.equal(facultyVisible.length, 1, 'Faculty must have exactly 1 note');
assert.equal(facultyVisible[0].id, facultyNote.id);
assert(!facultyVisible.some(n => n.id === note1.id), 'Faculty must NEVER see Principal notes');

// Verify Warden CANNOT see Principal or Faculty notes
const wardenVisible = await getCalendarNotes(wardenAccount);
assert.equal(wardenVisible.length, 1, 'Warden must have exactly 1 note');
assert.equal(wardenVisible[0].id, wardenNote.id);

console.log('✔ Strict personal privacy verified: zero cross-role or cross-user note leakage.');

// --- 4. MANDATORY REMINDER LOGIC (TODAY + OVERDUE PENDING NOTES) ---
console.log('\n--- 4. Testing Mandatory Reminder Lifecycle & Overdue Carry-Over ---');
const testUser = { id: 'USR-TEST-99', name: 'Dev Tester', role: 'faculty' };
saveLocalNotesForUser(testUser, []);

// Scenario from User Prompt:
// Nov 2: Complete project documentation
const nNov2 = await createCalendarNote(testUser, {
  title: 'Complete project documentation',
  description: 'System specifications',
  scheduledDate: '2026-11-02',
});

// Nov 2: Review pending applications
const nNov2_2 = await createCalendarNote(testUser, {
  title: 'Review pending applications',
  description: 'Scholarship applicants review',
  scheduledDate: '2026-11-02',
});

// Day 1 (Nov 2, 2026): Opening CMS -> should see both Nov 2 notes
let remindersNov2 = await getPendingCalendarReminders(testUser, '2026-11-02');
assert.equal(remindersNov2.length, 2, 'On Nov 2, user must see 2 pending reminders');
console.log(`✔ Nov 2 Reminders: ${remindersNov2.length} pending notes shown`);

// User clicks CLOSE on both reminders: status remains PENDING!
// On Nov 3, user creates: Verify student attendance
const nNov3 = await createCalendarNote(testUser, {
  title: 'Verify student attendance',
  description: 'Morning roll call audit',
  scheduledDate: '2026-11-03',
});

// Day 2 (Nov 3, 2026): Opening CMS -> should display all 3 notes (2 previous pending + 1 new today)
let remindersNov3 = await getPendingCalendarReminders(testUser, '2026-11-03');
assert.equal(remindersNov3.length, 3, 'On Nov 3, user must see all 3 pending reminders (previous unsubmitted + today)');
console.log(`✔ Nov 3 Reminders: ${remindersNov3.length} pending notes shown (Nov 2 unsubmitted carried over!)`);

// User clicks SUBMIT on the first reminder ('Complete project documentation')
// and CLOSE on the remaining two
await submitCalendarNote(testUser, nNov2.id);
console.log('✔ User clicked SUBMIT on "Complete project documentation"');

// Day 3 (Nov 4, 2026): Opening CMS -> should display 2 reminders ('Review pending applications' & 'Verify student attendance')
// The first reminder must NEVER appear again because it was submitted!
let remindersNov4 = await getPendingCalendarReminders(testUser, '2026-11-04');
assert.equal(remindersNov4.length, 2, 'On Nov 4, submitted note must NOT appear. Remaining 2 must appear.');
assert(!remindersNov4.some(n => n.id === nNov2.id), 'Submitted note must NEVER appear in pending reminders');
assert(remindersNov4.some(n => n.id === nNov2_2.id), 'Unsubmitted Nov 2 note must still appear');
assert(remindersNov4.some(n => n.id === nNov3.id), 'Unsubmitted Nov 3 note must still appear');
console.log('✔ Nov 4 Reminders: Exactly 2 remaining unsubmitted reminders shown.');

// Check calendar history: the submitted note is STILL preserved in calendar history!
const fullHistory = await getCalendarNotes(testUser);
const submittedInHistory = fullHistory.find(n => n.id === nNov2.id);
assert(submittedInHistory, 'Submitted note must be preserved in calendar history');
assert.equal(submittedInHistory.status, 'COMPLETED', 'Note status in calendar history must be COMPLETED');
console.log('✔ Submitted note is preserved in calendar history with status COMPLETED');

// --- 5. EDIT AND DELETE FUNCTIONALITY ---
console.log('\n--- 5. Testing Edit and Delete Notes ---');
// Edit note title, description, date
const updated = await updateCalendarNote(testUser, nNov3.id, {
  title: 'Verify student attendance (Updated Urgent)',
  description: 'Updated description for morning roll call',
  scheduledDate: '2026-11-04',
});
assert.equal(updated.title, 'Verify student attendance (Updated Urgent)');
assert.equal(updated.scheduledDate, '2026-11-04');
console.log('✔ Edit note successfully updated title and scheduled date');

// Delete note
await deleteCalendarNote(testUser, nNov2_2.id);
const afterDelete = await getCalendarNotes(testUser);
assert(!afterDelete.some(n => n.id === nNov2_2.id), 'Deleted note must be removed from calendar');

let remindersAfterDelete = await getPendingCalendarReminders(testUser, '2026-11-04');
assert(!remindersAfterDelete.some(n => n.id === nNov2_2.id), 'Deleted note must be removed from active reminders');
console.log('✔ Delete note successfully removed note from calendar and active reminders');

// --- 6. BACKEND SERVICE TEST (DIRECT LOGIC & OWNERSHIP ENFORCEMENT) ---
console.log('\n--- 6. Testing Backend Service & Ownership Security ---');
const mockPrisma = {
  calendarNote: {
    findMany: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
    findUnique: async () => null,
  }
};

const backendService = new CalendarNotesService(mockPrisma);

// Backend Create
const bNote = await backendService.createNote(
  { id: 'usr-backend-1', role: 'admin' },
  { title: 'Server Security Patch', description: 'Apply CVE patch', scheduledDate: '2026-11-05' }
);
assert.equal(bNote.title, 'Server Security Patch');
assert.equal(bNote.status, 'PENDING');

// Backend Update with Authorized Owner
const bUpdated = await backendService.updateNote(
  { id: 'usr-backend-1', role: 'admin' },
  bNote.id,
  { title: 'Server Security Patch (High Priority)' }
);
assert.equal(bUpdated.title, 'Server Security Patch (High Priority)');

// Backend Update with UNAUTHORIZED user -> MUST THROW ForbiddenException
let forbiddenThrown = false;
try {
  await backendService.updateNote(
    { id: 'usr-hacker-2', role: 'student' },
    bNote.id,
    { title: 'Hacked Title' }
  );
} catch (e) {
  if (e?.name === 'ForbiddenException' || e?.message?.includes('Access denied')) {
    forbiddenThrown = true;
  }
}
assert(forbiddenThrown, 'Backend MUST throw ForbiddenException when editing another user notes');
console.log('✔ Backend ownership validation enforced: ForbiddenException thrown on unauthorized access');

// Backend Submit Note
const bSubmitted = await backendService.submitNote({ id: 'usr-backend-1' }, bNote.id);
assert.equal(bSubmitted.status, 'COMPLETED');
assert(bSubmitted.completedAt, 'completedAt must be set');

// Backend Delete Note
const bDeleted = await backendService.deleteNote({ id: 'usr-backend-1' }, bNote.id);
assert(bDeleted.success, 'Delete note must succeed');

console.log('\n========================================================');
console.log('ALL CALENDAR NOTES & REMINDER TESTS PASSED CLEANLY! ✔');
console.log('========================================================\n');
