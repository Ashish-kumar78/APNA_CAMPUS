// Automated verification test for Hostel Staff & Warden Duty Roster sync
import assert from 'node:assert';

// Setup Mock Browser Environment
const storage = new Map();
global.window = {
  location: { hostname: 'localhost', origin: 'http://localhost:5173', protocol: 'http:' },
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear()
  },
  dispatchEvent: (ev) => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = global.window.localStorage;
global.Event = class Event { constructor(type) { this.type = type; } };
global.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } };

async function runTest() {
  console.log('--- STARTING WARDEN & STAFF ROSTER SYNC TESTS ---');

  // 1. Import stores
  const {
    getAllWardens,
    addNewWarden,
    setWardenDutyStatus
  } = await import('../src/services/wardenManagementStore.js');

  const {
    getAllStaffLeaves,
    applyStaffLeave,
    approveStaffLeave,
    rejectStaffLeave
  } = await import('../src/services/hostelStaffLeaveStore.js');

  const { mockHostelStaffList } = await import('../src/components/hostel/hostelData.js');

  // 2. Initial state verification
  const initialWardens = getAllWardens();
  console.log(`✓ Initial seeded wardens loaded: ${initialWardens.length}`);
  assert(initialWardens.length >= 6, 'Expected at least 6 initial wardens');

  // 3. Add a new warden (simulating Add New Warden form submission)
  const newWardenData = {
    firstName: 'Siddhartha',
    lastName: 'Mohanty',
    designation: 'Assistant Resident Warden (Tech)',
    hostelName: 'Kalam Boys Residence',
    dutyShift: 'General / 24x7 Resident',
    phone: '+91 94370 77788',
    email: 'siddhartha.mohanty@gift.edu.in',
    avatar: '/candidate_photo_apna.png',
    dutyStatus: 'On Duty'
  };

  const createdWarden = addNewWarden(newWardenData);
  console.log(`✓ New warden successfully added: ${createdWarden.name} (${createdWarden.id})`);
  assert(createdWarden.id.startsWith('WRD-'), 'New warden ID should start with WRD-');

  // Check that the new warden is present in getAllWardens()
  const updatedWardens = getAllWardens();
  const foundWarden = updatedWardens.find(w => w.id === createdWarden.id);
  assert(foundWarden, 'New warden should be found in wardens directory');
  assert.strictEqual(foundWarden.dutyStatus, 'On Duty', 'New warden should default to On Duty');

  // 4. Test Roster Merging Logic
  function mergeRoster() {
    const wardens = getAllWardens();
    const leaves = getAllStaffLeaves();

    const wardenStaff = wardens.map(w => {
      const id = w.id || w.employeeId;
      const activeApprovedLeave = leaves.find(l => {
        const matchesEmp = l.employeeId && (l.employeeId === id || l.employeeId === w.employeeId);
        const matchesName = l.applicantName && w.name && l.applicantName.toLowerCase() === w.name.toLowerCase();
        return (matchesEmp || matchesName) && l.status === 'Approved by Hostel Admin';
      });

      const isOnLeave = (
        w.dutyStatus === 'On Leave' ||
        w.accountStatus === 'On Leave' ||
        Boolean(activeApprovedLeave)
      );

      return {
        id,
        name: w.name,
        designation: w.designation,
        hostel: w.hostelName,
        shift: w.dutyShift,
        phone: w.phone,
        email: w.email,
        attendance: isOnLeave ? 'On Leave (Relief on Duty)' : 'Present On Duty',
        isOnLeave,
        dutyStatus: isOnLeave ? 'On Leave' : 'On Duty',
        isWarden: true
      };
    });

    const supportStaff = mockHostelStaffList
      .filter(s => !s.id.startsWith('WRD') && s.id !== 'STF-101' && s.id !== 'STF-102' && s.id !== 'STF-103')
      .map(s => ({
        ...s,
        isOnLeave: s.attendance.includes('Leave'),
        dutyStatus: s.attendance.includes('Leave') ? 'On Leave' : 'On Duty',
        isWarden: false
      }));

    return [...wardenStaff, ...supportStaff];
  }

  let roster = mergeRoster();
  const testWardenInRoster = roster.find(s => s.id === createdWarden.id);
  assert(testWardenInRoster, 'Newly added warden must be automatically present in the roster!');
  assert.strictEqual(testWardenInRoster.attendance, 'Present On Duty', 'Newly added warden must show Present On Duty');
  console.log(`✓ Newly added warden "${testWardenInRoster.name}" automatically appears in Staff Roster with status "${testWardenInRoster.attendance}"`);

  // 5. Test Warden Taking Leave
  console.log('--- Testing Leave Application & Duty Status Sync ---');
  setWardenDutyStatus(createdWarden.id, 'On Leave', 'Official family leave sanctioned');

  roster = mergeRoster();
  const leaveWardenInRoster = roster.find(s => s.id === createdWarden.id);
  assert.strictEqual(leaveWardenInRoster.dutyStatus, 'On Leave');
  assert.strictEqual(leaveWardenInRoster.attendance, 'On Leave (Relief on Duty)');
  console.log(`✓ When warden takes leave, roster immediately displays: "${leaveWardenInRoster.attendance}"`);

  // 6. Test Warden Resuming Duty
  console.log('--- Testing Duty Resumption ---');
  setWardenDutyStatus(createdWarden.id, 'On Duty', 'Returned to residential post');

  roster = mergeRoster();
  const resumedWarden = roster.find(s => s.id === createdWarden.id);
  assert.strictEqual(resumedWarden.dutyStatus, 'On Duty');
  assert.strictEqual(resumedWarden.attendance, 'Present On Duty');
  console.log(`✓ When warden returns to duty, roster immediately displays: "${resumedWarden.attendance}"`);

  // 7. Test Leave Sanction via Staff Leaves Store
  console.log('--- Testing Leave Sanction via applyStaffLeave ---');
  applyStaffLeave({
    applicantName: createdWarden.name,
    employeeId: createdWarden.id,
    designation: createdWarden.designation,
    leaveType: 'Casual Leave',
    startDate: '2026-11-03',
    endDate: '2026-11-05',
    days: 3,
    reason: 'Conference duty',
    status: 'Approved by Hostel Admin'
  });

  roster = mergeRoster();
  const sanctionedWarden = roster.find(s => s.id === createdWarden.id);
  assert.strictEqual(sanctionedWarden.isOnLeave, true);
  assert.strictEqual(sanctionedWarden.attendance, 'On Leave (Relief on Duty)');
  console.log(`✓ When staff leave is approved for warden, status automatically becomes: "${sanctionedWarden.attendance}"`);

  console.log('ALL TESTS PASSED SUCCESSFULLY! ✓');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
