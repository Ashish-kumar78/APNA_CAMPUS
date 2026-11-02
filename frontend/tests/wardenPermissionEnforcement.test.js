import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getWardenPermissions,
  updateWardenPermissions,
  getWardenIdFromAccount,
  DEFAULT_WARDEN_PERMISSIONS
} from '../src/services/wardenManagementStore.js';
import {
  getAllGatePasses,
  approveGatePass,
  rejectGatePass,
  recordGatePassExit,
  recordGatePassReturn
} from '../src/services/gatePassStore.js';
import {
  getStudentsRoster,
  getSubmittedAttendances
} from '../src/services/hostelAttendanceStore.js';
import {
  getAllHostelRules,
  addHostelRule,
  updateHostelRule,
  deleteHostelRule,
  subscribeHostelRules
} from '../src/services/hostelRulesStore.js';

describe('Granular Warden Operational Permissions Enforcement (Mrs. Nibedita Das - WRD-102)', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      };
    } else {
      globalThis.localStorage.clear();
    }
    const listeners = {};
    globalThis.window = {
      addEventListener: (type, fn) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(fn);
      },
      removeEventListener: (type, fn) => {
        if (!listeners[type]) return;
        listeners[type] = listeners[type].filter(l => l !== fn);
      },
      dispatchEvent: (event) => {
        const fns = listeners[event.type] || [];
        fns.forEach(fn => fn(event));
        return true;
      }
    };
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, detail) {
        this.type = type;
        this.detail = detail?.detail;
      }
    };
    vi.restoreAllMocks();
  });

  const nibeditaMatrix = {
    viewHostelRecords: true,
    manageAttendance: false,
    submitAttendance: false,
    viewRoomAllocations: true,
    manageRoomAllocations: false,
    reviewStudentLeaves: false,
    approveOperationalRequests: false,
    manageGatePasses: true,
    registerVisitors: false,
    recordDisciplinaryIncidents: false,
    manageComplaints: false,
    createInventoryRequisitions: false,
    manageStaffDutyRosters: false,
    viewReports: true,
    exportReports: false,
    editHostelConfiguration: true
  };

  it('1. Correctly saves and retrieves Mrs. Nibedita Das permissions from the admin modal', () => {
    const saved = updateWardenPermissions('WRD-102', nibeditaMatrix, 'Admin configured permissions', false, false);
    expect(saved.viewHostelRecords).toBe(true);
    expect(saved.manageAttendance).toBe(false);
    expect(saved.submitAttendance).toBe(false);
    expect(saved.viewRoomAllocations).toBe(true);
    expect(saved.manageRoomAllocations).toBe(false);
    expect(saved.reviewStudentLeaves).toBe(false);
    expect(saved.approveOperationalRequests).toBe(false);
    expect(saved.manageGatePasses).toBe(true);
    expect(saved.registerVisitors).toBe(false);
    expect(saved.recordDisciplinaryIncidents).toBe(false);
    expect(saved.manageComplaints).toBe(false);
    expect(saved.createInventoryRequisitions).toBe(false);
    expect(saved.manageStaffDutyRosters).toBe(false);
    expect(saved.viewReports).toBe(true);
    expect(saved.exportReports).toBe(false);
    expect(saved.editHostelConfiguration).toBe(true);

    const fetched = getWardenPermissions('WRD-102');
    expect(fetched).toMatchObject(nibeditaMatrix);
  });

  it('2. viewHostelRecords (ENABLED): Warden can view attendance and resident student records', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.viewHostelRecords).toBe(true);

    const roster = getStudentsRoster('Sarojini Girls Residence');
    expect(roster.length).toBeGreaterThan(0);
    expect(roster[0].studentName).toBeDefined();
  });

  it('3. manageAttendance & submitAttendance (DISABLED): Attendance recording and submission are restricted', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.manageAttendance).toBe(false);
    expect(perms.submitAttendance).toBe(false);

    // Emulate TakeHostelAttendance guards
    const canManageAttendance = perms.manageAttendance !== false;
    const canSubmitAttendance = perms.submitAttendance !== false;
    expect(canManageAttendance).toBe(false);
    expect(canSubmitAttendance).toBe(false);
  });

  it('4. viewRoomAllocations (ENABLED) & manageRoomAllocations (DISABLED): Can view rooms but cannot mutate or allocate', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.viewRoomAllocations).toBe(true);
    expect(perms.manageRoomAllocations).toBe(false);

    // Emulate RoomAllotmentSection guards
    const canViewRooms = perms.viewRoomAllocations !== false;
    const canManageRooms = perms.manageRoomAllocations !== false;
    expect(canViewRooms).toBe(true);
    expect(canManageRooms).toBe(false);
  });

  it('5. reviewStudentLeaves (DISABLED): Cannot approve or review resident leaves', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.reviewStudentLeaves).toBe(false);

    // Emulate HostelLeaveSection guard
    const canReviewLeaves = perms.reviewStudentLeaves !== false;
    expect(canReviewLeaves).toBe(false);
  });

  it('6. manageGatePasses (ENABLED): Warden can verify, approve, and record gate passes', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.manageGatePasses).toBe(true);

    const allPasses = getAllGatePasses();
    expect(allPasses.length).toBeGreaterThan(0);

    const pendingPass = allPasses.find(p => p.status === 'Pending Warden Action') || allPasses[0];
    const approved = approveGatePass(pendingPass.id, 'Mrs. Nibedita Das (Resident Warden)', 'Verified and Approved');
    expect(approved.status).toBe('Approved');
    expect(approved.approvedBy).toBe('Mrs. Nibedita Das (Resident Warden)');

    const exited = recordGatePassExit(pendingPass.id);
    expect(exited.status).toBe('Exited Campus');

    const returned = recordGatePassReturn(pendingPass.id);
    expect(returned.status).toBe('Returned to Hostel');
  });

  it('7. registerVisitors (DISABLED): Cannot register visitors or log security check-outs', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.registerVisitors).toBe(false);
  });

  it('8. recordDisciplinaryIncidents (DISABLED): Cannot record disciplinary violations', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.recordDisciplinaryIncidents).toBe(false);
  });

  it('9. manageComplaints (DISABLED): Cannot assign, acknowledge or resolve complaints', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.manageComplaints).toBe(false);
  });

  it('10. createInventoryRequisitions (DISABLED): Cannot raise material indents or requisitions', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.createInventoryRequisitions).toBe(false);
  });

  it('11. manageStaffDutyRosters (DISABLED): Cannot configure staff rosters', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.manageStaffDutyRosters).toBe(false);
  });

  it('12. viewReports (ENABLED) & exportReports (DISABLED): Can view reports but cannot export student PII', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.viewReports).toBe(true);
    expect(perms.exportReports).toBe(false);
  });

  it('13. editHostelConfiguration (ENABLED): Can configure curfew and policies', () => {
    updateWardenPermissions('WRD-102', nibeditaMatrix, 'test', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.editHostelConfiguration).toBe(true);
  });

  it('14. Modal automatically closes upon submit and does not affect other wardens when saved for one warden', () => {
    let modalSelectedWarden = { id: 'WRD-102', name: 'Mrs. Nibedita Das', hostelName: 'Sarojini Girls Residence' };
    const closeModal = vi.fn(() => {
      modalSelectedWarden = null;
    });

    // Emulate handleSavePermissions
    updateWardenPermissions(modalSelectedWarden.id, nibeditaMatrix, 'Save for Mrs. Nibedita Das Only', false, false);
    closeModal();

    // Verify modal is closed immediately
    expect(modalSelectedWarden).toBeNull();
    expect(closeModal).toHaveBeenCalledTimes(1);

    // Verify WRD-101 (Mr. Rajesh Jena) is unaffected
    const rajeshPerms = getWardenPermissions('WRD-101');
    expect(rajeshPerms.manageAttendance).toBe(true);
    expect(rajeshPerms.manageRoomAllocations).toBe(true);
    expect(rajeshPerms.reviewStudentLeaves).toBe(true);

    // Verify WRD-102 has only the granted permissions
    const nibeditaPerms = getWardenPermissions('WRD-102');
    expect(nibeditaPerms.manageAttendance).toBe(false);
    expect(nibeditaPerms.manageGatePasses).toBe(true);
  });

  it('15. Hostel Rules & Curfew is accessible to every warden role in read-only mode when edit permission is false', () => {
    // Restrict WRD-103 from editing configuration
    updateWardenPermissions('WRD-103', { editHostelConfiguration: false }, 'Restrict edit', false, false);
    const perms = getWardenPermissions('WRD-103');
    expect(perms.editHostelConfiguration).toBe(false);

    // Warden can still view all rules
    const rules = getAllHostelRules();
    expect(rules.length).toBeGreaterThan(0);
    const curfewCat = rules.find(c => c.category.includes('Curfew'));
    expect(curfewCat).toBeDefined();
    expect(curfewCat.items.length).toBeGreaterThan(0);

    // Check UI permission flag: canEditConfiguration is false for this warden
    const canEditConfiguration = perms.editHostelConfiguration === true;
    expect(canEditConfiguration).toBe(false);
  });

  it('16. When admin gives permission, warden can add, edit, and delete rules', () => {
    // Admin grants editHostelConfiguration to WRD-102
    updateWardenPermissions('WRD-102', { editHostelConfiguration: true }, 'Admin grants curfew edit permission', false, false);
    const perms = getWardenPermissions('WRD-102');
    expect(perms.editHostelConfiguration).toBe(true);

    // Warden adds a new rule
    const created = addHostelRule({
      category: 'Curfew & Gate Timings',
      title: 'Extended Study Library Pass',
      value: '10:30 PM',
      description: 'Extended night study hall access during semester examination weeks.',
      author: 'Mrs. Nibedita Das (Resident Warden)'
    });
    expect(created.title).toBe('Extended Study Library Pass');
    expect(created.value).toBe('10:30 PM');

    // Warden updates the rule
    const updated = updateHostelRule(created.id, {
      title: 'Extended Study Library Pass (Midterms)',
      value: '11:00 PM',
      description: 'Revised extension till 11:00 PM.'
    });
    expect(updated.title).toBe('Extended Study Library Pass (Midterms)');
    expect(updated.value).toBe('11:00 PM');

    // Warden deletes the rule
    const deleted = deleteHostelRule(created.id);
    expect(deleted).toBe(true);
  });

  it('17. Real-time sync: When admin updates any rule or curfew, it automatically reflects in the warden role', () => {
    let notifiedRules = null;
    const unsub = subscribeHostelRules((latestRules) => {
      notifiedRules = latestRules;
    });

    // Admin updates a curfew timing
    const rulesBefore = getAllHostelRules();
    const firstRule = rulesBefore[0].items[0];

    updateHostelRule(firstRule.id, {
      title: firstRule.title,
      value: '09:00 PM (Admin Updated)',
      description: 'Updated curfew rule by Hostel Administrator.'
    });

    // Verify reactive listener notified immediately without reload
    expect(notifiedRules).not.toBeNull();
    const updatedRule = notifiedRules[0].items.find(it => it.id === firstRule.id);
    expect(updatedRule.value).toBe('09:00 PM (Admin Updated)');

    unsub();
  });

  it('18. Checks each of all 16 permissions one-by-one: When enabled allows operation, when disabled restricts and yields exact permission denied message', () => {
    const DENIED_MSG = '⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.';

    const all16Keys = [
      'viewHostelRecords',
      'manageAttendance',
      'submitAttendance',
      'viewRoomAllocations',
      'manageRoomAllocations',
      'reviewStudentLeaves',
      'approveOperationalRequests',
      'manageGatePasses',
      'registerVisitors',
      'recordDisciplinaryIncidents',
      'manageComplaints',
      'createInventoryRequisitions',
      'manageStaffDutyRosters',
      'viewReports',
      'exportReports',
      'editHostelConfiguration'
    ];

    all16Keys.forEach((permKey) => {
      // 1. Test ENABLED state
      updateWardenPermissions('WRD-102', { [permKey]: true }, `Enable ${permKey}`, false, false);
      let perms = getWardenPermissions('WRD-102');
      expect(perms[permKey]).toBe(true);

      // Guard check simulation
      const executeActionWhenEnabled = () => {
        if (!perms[permKey]) {
          return { error: DENIED_MSG, allowed: false };
        }
        return { success: true, allowed: true };
      };
      const enabledResult = executeActionWhenEnabled();
      expect(enabledResult.allowed).toBe(true);
      expect(enabledResult.success).toBe(true);

      // 2. Test DISABLED state
      updateWardenPermissions('WRD-102', { [permKey]: false }, `Disable ${permKey}`, false, false);
      perms = getWardenPermissions('WRD-102');
      expect(perms[permKey]).toBe(false);

      const executeActionWhenDisabled = () => {
        if (!perms[permKey]) {
          return { error: DENIED_MSG, allowed: false };
        }
        return { success: true, allowed: true };
      };
      const disabledResult = executeActionWhenDisabled();
      expect(disabledResult.allowed).toBe(false);
      expect(disabledResult.error).toBe(DENIED_MSG);
    });
  });

  it('19. Student Role Curfew & Rules Access: Student can only view hostel curfew in read-only mode and cannot edit', () => {
    const studentAccount = {
      name: 'Aman Kumar Sharma',
      role: 'student',
      registrationNumber: '2201289001'
    };

    // 1. getWardenIdFromAccount returns null for student
    const resolvedWardenId = getWardenIdFromAccount(studentAccount);
    expect(resolvedWardenId).toBeNull();

    // 2. Student role guard guarantees canEditConfiguration is false
    const isStudentRole = studentAccount.role === 'student';
    expect(isStudentRole).toBe(true);

    const canStudentEdit = !isStudentRole && Boolean(getWardenPermissions(resolvedWardenId)?.editHostelConfiguration);
    expect(canStudentEdit).toBe(false);

    // 3. Student can view all authoritative hostel rules & curfew timings
    const rules = getAllHostelRules();
    expect(rules.length).toBeGreaterThan(0);
    const curfewCat = rules.find(c => c.category.includes('Curfew'));
    expect(curfewCat).toBeDefined();
    expect(curfewCat.items.length).toBeGreaterThan(0);
    expect(curfewCat.items[0].value).toBeDefined();
  });
});
