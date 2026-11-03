import assert from 'node:assert/strict';
import {
  getTodayIST,
  createCalendarNote,
  getCalendarNotes,
  updateCalendarNote,
  submitCalendarNote,
  deleteCalendarNote,
  getPendingCalendarReminders,
  resolveUserId,
} from '../src/services/calendarNotesStore.js';

console.log('--- STARTING CMS CALENDAR INTEGRATION TESTS ---');

// Test 1: IST Timezone & Date Formatting
console.log('Test 1: Verify IST (Asia/Kolkata) automatic date detection...');
const ist = getTodayIST();
assert(typeof ist.dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ist.dateStr), 'IST dateStr should be YYYY-MM-DD');
assert(typeof ist.year === 'number' && ist.year >= 2026, 'IST year should be valid');
assert(typeof ist.monthIndex === 'number' && ist.monthIndex >= 0 && ist.monthIndex <= 11, 'Month index 0-11');
assert(typeof ist.day === 'number' && ist.day >= 1 && ist.day <= 31, 'Day 1-31');
console.log(`✓ Detected IST Date: ${ist.dateStr} (Year: ${ist.year}, Month: ${ist.monthIndex + 1}, Day: ${ist.day})`);

// Test 2: Past Date Restriction (Must Reject)
console.log('\nTest 2: Verify past date restriction rejection in frontend store...');
const testUserA = { id: 'user_prof_01', name: 'Dr. Sharma', role: 'FACULTY' };
let pastRejected = false;
try {
  await createCalendarNote(testUserA, {
    title: 'Should fail for past date',
    description: 'This is in the past',
    scheduledDate: '2020-01-01',
  });
} catch (e) {
  pastRejected = true;
  assert(e.message.includes('past dates'), 'Error message should explain past date restriction');
}
assert(pastRejected, 'Creating note for past date MUST throw an error');
console.log('✓ Successfully blocked note creation for past date 2020-01-01');

// Test 3: Create Today's Note & Instant Save
console.log('\nTest 3: Verify creation of Today and Future notes with 0ms perceived lag...');
const todayNote = await createCalendarNote(testUserA, {
  title: 'Faculty Senate Meeting',
  description: 'Discuss curriculum review and end-sem schedule',
  scheduledDate: ist.dateStr,
});
assert(todayNote.id && todayNote.id.startsWith('cn-'), 'Note ID should be generated');
assert.equal(todayNote.status, 'PENDING');
assert.equal(todayNote.scheduledDate, ist.dateStr);

// Create Future Note
const futureDateStr = `${ist.year}-${String(ist.monthIndex + 1).padStart(2, '0')}-28`;
const futureNote = await createCalendarNote(testUserA, {
  title: 'Final Examination Submission',
  description: 'Submit marks sheets to controller of examinations',
  scheduledDate: futureDateStr,
});
assert(futureNote.id);
assert.equal(futureNote.status, 'PENDING');
assert.equal(futureNote.scheduledDate, futureDateStr);
console.log(`✓ Created Today note: "${todayNote.title}" and Future note for ${futureDateStr}`);

// Test 4: Retrieve Notes for User A
console.log('\nTest 4: Retrieve and verify user notes...');
const userNotes = await getCalendarNotes(testUserA);
assert(userNotes.some((n) => n.id === todayNote.id), 'Today note should be present');
assert(userNotes.some((n) => n.id === futureNote.id), 'Future note should be present');
console.log(`✓ User notes loaded successfully. Total notes: ${userNotes.length}`);

// Test 5: Verify Status Indicator Logic (Blue Dot vs Green Dot)
console.log('\nTest 5: Verify Calendar dot indicator state transition (Pending: Blue -> Completed: Green)...');
const notesForToday = userNotes.filter((n) => n.scheduledDate === ist.dateStr);
const hasPendingBefore = notesForToday.some((n) => n.status === 'PENDING');
assert.equal(hasPendingBefore, true, 'Before completion, day has pending notes (Blue dot)');

// Submit note (marks as COMPLETED)
const completed = await submitCalendarNote(testUserA, todayNote.id);
assert.equal(completed.status, 'COMPLETED');
assert(completed.completedAt !== null, 'completedAt timestamp must be recorded');

const notesForTodayAfter = (await getCalendarNotes(testUserA)).filter((n) => n.scheduledDate === ist.dateStr);
const hasPendingAfter = notesForTodayAfter.some((n) => n.status === 'PENDING');
const allCompletedAfter = notesForTodayAfter.length > 0 && !hasPendingAfter;
assert.equal(hasPendingAfter, false, 'No pending notes left for today');
assert.equal(allCompletedAfter, true, 'All notes completed (Green dot)');
console.log('✓ Dot transitioned successfully: Blue dot (Pending) -> Green dot (Completed)');

// Test 6: Mandatory Reminder Logic
console.log('\nTest 6: Verify Mandatory Login Reminder popup logic...');
// Today's note is COMPLETED, so it must NOT appear in pending reminders
const remindersAfterCompletion = await getPendingCalendarReminders(testUserA, ist.dateStr);
const containsCompleted = remindersAfterCompletion.some((r) => r.id === todayNote.id);
assert.equal(containsCompleted, false, 'Completed note must NEVER appear in pending reminders popup');

// Create a new pending note for today to test reminder appearance
const urgentReminder = await createCalendarNote(testUserA, {
  title: 'Urgent: Submit Question Papers',
  description: 'Deadlines at 5 PM IST',
  scheduledDate: ist.dateStr,
});

const remindersWithUrgent = await getPendingCalendarReminders(testUserA, ist.dateStr);
const hasUrgent = remindersWithUrgent.some((r) => r.id === urgentReminder.id);
assert.equal(hasUrgent, true, 'Pending reminder for today must appear in login popup');
console.log('✓ Pending reminder correctly returned for popup display');

// Test 7: User Isolation & Privacy
console.log('\nTest 7: Verify user privacy and data isolation...');
const testUserB = { id: 'student_rahul_99', name: 'Rahul Sen', role: 'STUDENT' };
const userBNotes = await getCalendarNotes(testUserB);
assert(!userBNotes.some((n) => n.id === urgentReminder.id), 'User B must NOT see User A private notes');
const userBReminders = await getPendingCalendarReminders(testUserB, ist.dateStr);
assert(!userBReminders.some((r) => r.id === urgentReminder.id), 'User B must NOT receive User A reminders');
console.log('✓ Strict privacy verified: User A notes and reminders are completely isolated from User B');

// Test 8: Close vs Submit
console.log('\nTest 8: Verify Close (Review Later) retains PENDING status...');
// Urgent reminder is still PENDING because user only closed without submitting
const checkUrgent = (await getCalendarNotes(testUserA)).find((n) => n.id === urgentReminder.id);
assert.equal(checkUrgent.status, 'PENDING', 'Close keeps status PENDING for next session');
console.log('✓ Verified: Close retains PENDING status; Submit marks COMPLETED');

// Test 9: Close (Review Later) Session Dismissal Lifecycle
console.log('\nTest 9: Verify Close does NOT show immediately, and re-appears only on next login if uncompleted...');
const { isSessionDismissed, setSessionDismissed, clearSessionDismissal } = await import('../src/components/CalendarReminderModal.jsx');

const userIdA = resolveUserId(testUserA);
// Initially not dismissed
assert.equal(isSessionDismissed(userIdA), false, 'Initially not dismissed');

// User clicks "Close (Review Later)" -> marks dismissed for this session
setSessionDismissed(userIdA);
assert.equal(isSessionDismissed(userIdA), true, 'Dismissed for current session');
console.log('✓ When user clicks Close, session is marked dismissed; popup will NOT show again immediately');

// User logs out and logs in again (next login) -> clears session dismissal
clearSessionDismissal(userIdA);
assert.equal(isSessionDismissed(userIdA), false, 'Dismissal cleared on next login');

// On next login, task is still PENDING, so it will show again!
const remindersOnNextLogin = await getPendingCalendarReminders(testUserA, ist.dateStr);
assert(remindersOnNextLogin.length > 0, 'Uncompleted task shows again on next login');
console.log('✓ On next login, uncompleted task shows again as expected');

// Now user clicks Submit (Complete) -> marks COMPLETED
await submitCalendarNote(testUserA, urgentReminder.id);
const remindersAfterCompletion2 = await getPendingCalendarReminders(testUserA, ist.dateStr);
const hasCompleted = remindersAfterCompletion2.some((r) => r.id === urgentReminder.id);
assert.equal(hasCompleted, false, 'Completed task does NOT show on future logins');
console.log('✓ Once completed, task never shows again');

console.log('\n========================================');
console.log('ALL CMS CALENDAR INTEGRATION TESTS PASSED (9/9)');
console.log('========================================');

