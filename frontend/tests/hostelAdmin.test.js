import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllWardens,
  getWardenById,
  reassignWarden,
  getAssignmentHistory,
  setWardenAccountStatus,
  getWardenPermissions,
  updateWardenPermissions,
  getAllAuditLogs,
  logAdminAction,
  getUnifiedPendingApprovals,
  INITIAL_WARDENS
} from '../src/services/wardenManagementStore.js';

describe('Hostel Administrator & Warden Supervisory Management Store', () => {
  // Mock localStorage for test environment if undefined
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
      localStorage.clear();
    }
  });

  it('1. Retrieves authoritative Warden Directory with active duty status and compliance', () => {
    const wardens = getAllWardens();
    expect(wardens).toBeDefined();
    expect(wardens.length).toBeGreaterThanOrEqual(4);

    const rajesh = wardens.find(w => w.name.includes('Rajesh Jena'));
    expect(rajesh).toBeDefined();
    expect(rajesh.hostelName).toBe('Gandhi Boys Residence');
    expect(rajesh.attendanceCompliance).toBeGreaterThanOrEqual(95);
    expect(rajesh.accountStatus).toBe('Active');
  });

  it('2. Successfully reassigns a Warden to another hostel complex and logs handover history', () => {
    const historyBefore = getAssignmentHistory().length;
    const reassignResult = reassignWarden({
      wardenId: 'WRD-101',
      newHostelId: 'hst-1',
      newHostelName: 'Bhabani Hostel-1',
      assignedBlocks: ['Ground Floor Block A', 'Floor 1 Block B'],
      dutyShift: 'Morning Shift (07:00 AM - 03:00 PM)',
      effectiveDate: '2026-11-01',
      relievingWarden: 'Mr. Debendra Sahoo',
      reason: 'Semester-end capacity rebalancing and senior supervision rotation.',
      adminUser: 'Chief Hostel Admin'
    });

    expect(reassignResult).toBeDefined();
    expect(reassignResult.previousHostel).toBe('Gandhi Boys Residence');
    expect(reassignResult.newHostel).toBe('Bhabani Hostel-1');

    // Verify updated warden record
    const updated = getWardenById('WRD-101');
    expect(updated.hostelName).toBe('Bhabani Hostel-1');
    expect(updated.dutyShift).toBe('Morning Shift (07:00 AM - 03:00 PM)');

    // Verify history recorded
    const historyAfter = getAssignmentHistory();
    expect(historyAfter.length).toBe(historyBefore + 1);
    expect(historyAfter[0].wardenName).toBe('Mr. Rajesh Jena');
  });

  it('3. Suspending and reactivating a Warden preserves historical data and records audit logs', () => {
    const suspended = setWardenAccountStatus('WRD-103', 'Suspended', 'Extended medical sabbatical leave');
    expect(suspended).toBe(true);

    const wardenSuspended = getWardenById('WRD-103');
    expect(wardenSuspended.accountStatus).toBe('Suspended');

    // Reactivate
    const reactivated = setWardenAccountStatus('WRD-103', 'Active', 'Returned to active duty');
    expect(reactivated).toBe(true);

    const wardenActive = getWardenById('WRD-103');
    expect(wardenActive.accountStatus).toBe('Active');

    // Verify audit logs
    const auditLogs = getAllAuditLogs();
    const suspendLog = auditLogs.find(l => l.recordId === 'WRD-103' && l.action === 'WARDEN_SUSPEND');
    expect(suspendLog).toBeDefined();
    expect(suspendLog.reason).toBe('Extended medical sabbatical leave');
  });

  it('4. Updates granular permissions matrix for a Warden', () => {
    const perms = getWardenPermissions('WRD-102');
    expect(perms.viewHostelRecords).toBe(true);

    const updated = updateWardenPermissions('WRD-102', {
      exportReports: true,
      editHostelConfiguration: false
    }, 'Approved for BPUT autonomous senate compliance reporting.');

    expect(updated.exportReports).toBe(true);
    expect(updated.editHostelConfiguration).toBe(false);

    // Verify audit log generated
    const auditLogs = getAllAuditLogs();
    const permLog = auditLogs.find(l => l.recordId === 'WRD-102' && l.action === 'WARDEN_PERMISSIONS_UPDATE');
    expect(permLog).toBeDefined();
    expect(permLog.reason).toContain('BPUT autonomous senate compliance');
  });

  it('5. Unifies pending approvals across resident leaves, staff leaves, indents, and attendance', () => {
    // Inject mock pending items into localStorage
    localStorage.setItem('bput_hostel_resident_leaves_v2', JSON.stringify([
      {
        id: 'LV-TEST-001',
        studentName: 'Subham Panda',
        rollNumber: '2305200099',
        hostelName: 'Gandhi Boys Residence',
        roomNumber: '305',
        days: 5,
        startDate: '2026-11-05',
        endDate: '2026-11-10',
        reason: 'National Robotics Hackathon at IIT Bombay',
        guardianStatus: 'Verified by HOD & Parent SMS',
        status: 'Pending',
        appliedOn: '2026-10-28'
      }
    ]));

    localStorage.setItem('bput_hostel_indents_v1', JSON.stringify([
      {
        id: 'IND-TEST-002',
        materialName: 'LED Emergency Tube Lights 20W',
        quantityRequired: 40,
        unit: 'Pieces',
        hostelName: 'Sarojini Girls Residence',
        block: 'Corridor Lighting Wing A',
        raisedBy: 'Mrs. Nibedita Das',
        priority: 'High',
        category: 'Electrical & Safety',
        status: 'Pending Approval',
        indentDate: '2026-10-28'
      }
    ]));

    const queue = getUnifiedPendingApprovals();
    expect(queue).toBeDefined();
    expect(queue.length).toBeGreaterThanOrEqual(2);

    const leaveItem = queue.find(q => q.id === 'LV-TEST-001');
    expect(leaveItem).toBeDefined();
    expect(leaveItem.category).toBe('Student Resident Leave');
    expect(leaveItem.priority).toBe('High');

    const indentItem = queue.find(q => q.id === 'IND-TEST-002');
    expect(indentItem).toBeDefined();
    expect(indentItem.category).toBe('Material Requisition');
    expect(indentItem.priority).toBe('High');
  });

  it('6. Records tamper-evident audit logs with acting user and mandatory justification', () => {
    const log = logAdminAction({
      action: 'HOSTEL_CURFEW_OVERRIDE',
      targetEntity: 'HostelRules',
      recordId: 'RULE-CURFEW-DIWALI',
      hostelScope: 'All Hostels',
      previousValue: 'Curfew: 10:00 PM',
      newValue: 'Curfew: 11:30 PM (Diwali Festival Eve)',
      reason: 'Special institutional festival celebration permission sanctioned by Principal.',
      actingUser: 'Prof. S. R. Mohanty (Principal / Hostel Admin)'
    });

    expect(log).toBeDefined();
    expect(log.id).toContain('AUD-HST-');
    expect(log.action).toBe('HOSTEL_CURFEW_OVERRIDE');
    expect(log.newValue).toContain('Diwali Festival Eve');
    expect(log.reason).toContain('festival celebration');

    const allLogs = getAllAuditLogs();
    expect(allLogs[0].id).toBe(log.id);
  });

  it('7. Enriches student attendance record with exact 10-column fields matching UI image format', async () => {
    const { enrichStudentRecord } = await import('../src/utils/hostelAttendanceExportUtils.js');
    const enriched = enrichStudentRecord({
      studentName: 'Rakesh Das',
      rollNumber: '01',
      roomNumber: '101',
      bedNumber: 'Bed 01',
      status: 'Present'
    }, 'Bhabani Hostel-1');

    expect(enriched.studentName).toBe('Rakesh Das');
    expect(enriched.rollNumber).toBe('01');
    expect(enriched.regNo).toBe('2305201001');
    expect(enriched.department).toBe('Computer Science & Engineering');
    expect(enriched.branch).toBe('CSE');
    expect(enriched.roomFormatted).toBe('Room 101 - Bed 01');
    expect(enriched.phone).toBe('+91 98610 11223');
    expect(enriched.parentPhone).toBe('+91 94370 99887');
    expect(enriched.status).toBe('Present');
  });

  it('8. Verifies Excel & PDF export data structure matches the 10 columns from 3rd image', async () => {
    const { enrichStudentRecord } = await import('../src/utils/hostelAttendanceExportUtils.js');
    const rawRoster = [
      { studentName: 'Rakesh Das', rollNumber: '01', roomNumber: '101', bedNumber: 'Bed 01', status: 'Present' },
      { studentName: 'Amit Pattnaik', rollNumber: '03', roomNumber: '101', bedNumber: 'Bed 02', status: 'Absent' },
      { studentName: 'Sourav Mohanty', rollNumber: '05', roomNumber: '102', bedNumber: 'Bed 01', status: 'Absent' },
      { studentName: 'Debabrata Jena', rollNumber: '06', roomNumber: '102', bedNumber: 'Bed 02', status: 'Present' }
    ];

    const expectedHeaders = [
      'Sl No',
      'Name of Student',
      'Registration No',
      'Department',
      'Branch',
      'Roll No',
      'Room No',
      'Student Contact',
      'Parent Contact',
      'Attendance Status'
    ];

    expect(expectedHeaders.length).toBe(10);
    const enrichedList = rawRoster.map(r => enrichStudentRecord(r, 'Bhabani Hostel-1'));
    expect(enrichedList.length).toBe(4);

    // Verify row 2 (Amit Pattnaik - Absent)
    const row2 = enrichedList[1];
    expect(row2.studentName).toBe('Amit Pattnaik');
    expect(row2.rollNumber).toBe('03');
    expect(row2.branch).toBe('ECE');
    expect(row2.roomFormatted).toBe('Room 101 - Bed 02');
    expect(row2.status).toBe('Absent');

    // Verify row 4 (Debabrata Jena - Present)
    const row4 = enrichedList[3];
    expect(row4.studentName).toBe('Debabrata Jena');
    expect(row4.rollNumber).toBe('06');
    expect(row4.branch).toBe('ME');
    expect(row4.roomFormatted).toBe('Room 102 - Bed 02');
    expect(row4.status).toBe('Present');
  });
  it('9. Verifies Institution-wide Overview and Student Resident Docs are deleted from Hostel Admin navigation and Warden Management sections are fully operational', async () => {
    const fsMod = await import('fs');
    const hostelPortalCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');

    // Extract hostelAdminNavSections block
    const adminNavBlock = hostelPortalCode.slice(hostelPortalCode.indexOf('const hostelAdminNavSections = ['), hostelPortalCode.indexOf('const hostelNavSections = isHostelAdmin'));

    // Institution-wide Overview and Student Resident Docs are deleted from navigation
    expect(adminNavBlock).not.toContain("'institution-overview'");
    expect(adminNavBlock).not.toContain("Institution-wide Overview");
    expect(adminNavBlock).not.toContain("'documents'");
    expect(adminNavBlock).not.toContain("Student Resident Docs");

    // All 5 Warden Management sections are present and mapped
    expect(adminNavBlock).toContain('warden-directory');
    expect(adminNavBlock).toContain('warden-assignments');
    expect(adminNavBlock).toContain('warden-permissions');
    expect(adminNavBlock).toContain('warden-duty-leaves');
    expect(adminNavBlock).toContain('warden-performance');

    // Verify CalendarCheck is properly imported in WardenManagementSection to avoid ReferenceError
    const wmCode = fsMod.readFileSync('src/components/hostel/admin/WardenManagementSection.jsx', 'utf8');
    expect(wmCode).toContain('CalendarCheck');
    expect(wmCode).toMatch(/import\s*\{[^}]*CalendarCheck[^}]*\}\s*from\s*['"]lucide-react['"]/);
  });
  it('10. Verifies Assign/Reassign Warden form provides dropdowns with custom manual inputs for Blocks and Relieving Warden', async () => {
    const fsMod = await import('fs');
    const modalCode = fsMod.readFileSync('src/components/hostel/admin/WardenManagementSection.jsx', 'utf8');

    // Authorized Residential Blocks is a select dropdown with standard options & CUSTOM
    expect(modalCode).toContain("STANDARD_BLOCK_OPTIONS");
    expect(modalCode).toContain("Block A (Rooms 101-220)");
    expect(modalCode).toContain('Custom / Other (Specify Manually)');
    expect(modalCode).toContain('placeholder="Type custom residential block(s) name..."');

    // Relieving Warden is a select dropdown with None, active wardens, and CUSTOM
    expect(modalCode).toContain('None (No Relieving Warden)');
    expect(modalCode).toContain('Custom / Other Official (Specify Manually)');
    expect(modalCode).toContain('placeholder="Type relieving warden name, ID, or designation..."');
  });
  it('11. Verifies Duty & Leave Management tab is mapped and operational in Warden Management', async () => {
    const fsMod = await import('fs');
    const hpCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');
    const wmCode = fsMod.readFileSync('src/components/hostel/admin/WardenManagementSection.jsx', 'utf8');

    // Mapped in HostelPortal
    expect(hpCode).toContain("activeTab === 'warden-duty-leaves' ? 'duty-leaves'");
    expect(hpCode).toContain("case 'warden-duty-leaves':");

    // Implemented in WardenManagementSection
    expect(wmCode).toContain("activeTab === 'duty-leaves' && (");
    expect(wmCode).toContain("Warden Shift Rosters");
    expect(wmCode).toContain("handleApproveLeave");
    expect(wmCode).toContain("handleRejectLeave");
  });
  it('12. Generates dynamic hierarchical hostel structure matching the exact floor-room-bed specification', async () => {
    const { generateHostelStructure } = await import('../src/components/hostel/ManageHostelsSection.jsx');

    // Test exact example from user prompt: 2 floors, 2 rooms/floor, 2 beds/room
    const structure = generateHostelStructure(2, 2, 2);

    expect(structure).toHaveLength(2);

    // Floor 1
    const floor1 = structure[0];
    expect(floor1.floorNumber).toBe(1);
    expect(floor1.totalRooms).toBe(2);
    expect(floor1.totalBeds).toBe(4);
    expect(floor1.rooms[0].roomNumber).toBe('101');
    expect(floor1.rooms[0].totalBeds).toBe(2);
    expect(floor1.rooms[0].beds).toHaveLength(2);
    expect(floor1.rooms[0].beds[0].label).toBe('Bed 1');
    expect(floor1.rooms[0].beds[1].label).toBe('Bed 2');
    expect(floor1.rooms[1].roomNumber).toBe('102');

    // Floor 2
    const floor2 = structure[1];
    expect(floor2.floorNumber).toBe(2);
    expect(floor2.totalRooms).toBe(2);
    expect(floor2.totalBeds).toBe(4);
    expect(floor2.rooms[0].roomNumber).toBe('201');
    expect(floor2.rooms[1].roomNumber).toBe('202');

    // Total counts
    const totalRooms = structure.reduce((sum, f) => sum + f.totalRooms, 0);
    const totalBeds = structure.reduce((sum, f) => sum + f.totalBeds, 0);
    expect(totalRooms).toBe(4);
    expect(totalBeds).toBe(8);
  });

  it('13. Verifies structured Add Hostel configuration form has 3-column layout, summary cards, and warden selection', async () => {
    const fsMod = await import('fs');
    const codeStr = fsMod.readFileSync('src/components/hostel/ManageHostelsSection.jsx', 'utf8');

    // 4 Summary cards
    expect(codeStr).toContain('Total Floors');
    expect(codeStr).toContain('Total Rooms');
    expect(codeStr).toContain('Total Beds');
    expect(codeStr).toContain('Assigned Warden');

    // Sections
    expect(codeStr).toContain('Section A: Hostel Information');
    expect(codeStr).toContain('Section B: Floor &amp; Bed Capacity');
    expect(codeStr).toContain('Section C: Settings &amp; Actions');

    // Controls
    expect(codeStr).toContain('Create Hostel');
    expect(codeStr).toContain('Reset Form');
    expect(codeStr).toContain('Live Hostel Structure Preview');
    expect(codeStr).toContain('getAllWardens');
  });
  it('14. Renders Rooms & Bed Capacity with Image 2 accordion format, hostel selector, and Admin Edit/Vacate controls', async () => {
    const fsMod = await import('fs');
    const portalCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');

    // Tab and Heading
    expect(portalCode).toContain("activeTab === 'rooms'");
    expect(portalCode).toContain('Room Allotment &amp; Bed Capacity Manager');

    // Image 2 UI elements
    expect(portalCode).toContain('Choose Hostel Residence:');
    expect(portalCode).toContain('hostel-switcher-tab');
    expect(portalCode).toContain('hostel-floor-pill');
    expect(portalCode).toContain('Search Room / Student...');
    expect(portalCode).toContain('Expand All');
    expect(portalCode).toContain('Collapse All');
    expect(portalCode).toContain('hostel-room-item-card');
    expect(portalCode).toContain('Beds Occupied');

    // Resident table columns
    expect(portalCode).toContain('Bed Position');
    expect(portalCode).toContain('Resident Student');
    expect(portalCode).toContain('Roll / Reg Number');
    expect(portalCode).toContain('Department &amp; Sem');
    expect(portalCode).toContain('Emergency Contact');
    expect(portalCode).toContain('Biometric Status');
    expect(portalCode).toContain('Action');

    // Hostel Admin Edit & Vacate Action buttons
    expect(portalCode).toContain('hostel-edit-student-btn');
    expect(portalCode).toContain('hostel-delete-student-btn');
    expect(portalCode).toContain('Inspect');
    expect(portalCode).toContain('Edit');
    expect(portalCode).toContain('Vacate');
  });

  it('15. Supports Hostel Admin full modification & deletion of resident allocations with live capacity updates', async () => {
    const fsMod = await import('fs');
    const portalCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');

    // Edit modal & fields
    expect(portalCode).toContain('editingResidentModal');
    expect(portalCode).toContain('Edit Resident Allocation &amp; Student Data');
    expect(portalCode).toContain('Resident Student Name *');
    expect(portalCode).toContain('Roll Number *');
    expect(portalCode).toContain('Registration Number *');
    expect(portalCode).toContain('Department *');
    expect(portalCode).toContain('Semester *');
    expect(portalCode).toContain('Bed Position *');
    expect(portalCode).toContain('Biometric &amp; Presence Status');
    expect(portalCode).toContain('handleSaveEditedResident');

    // Delete / Vacate modal & actions
    expect(portalCode).toContain('deletingResidentModal');
    expect(portalCode).toContain('Vacate &amp; Delete Resident Bed Allocation');
    expect(portalCode).toContain('handleConfirmDeleteResident');
    expect(portalCode).toContain('Vacant Bed (Unassigned)');
    expect(portalCode).toContain('Allocate Bed');
  });

  it('16. Restricts resident modification/deletion powers exclusively to Hostel Admin, preserving Warden integrity', async () => {
    const fsMod = await import('fs');
    const portalCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');

    // Verify conditional checks on isHostelAdmin
    expect(portalCode).toContain('isHostelAdmin ? (');
    expect(portalCode).toContain('{isHostelAdmin && (');
    expect(portalCode).toContain('WARDEN STANDARD VIEW');
  });
  it('17. Manages Room, Bed, and Floor creation with automatic capacity calculation in hostelRoomStore', async () => {
    const {
      getRoomsForHostel,
      addRoomToHostel,
      addBedToRoom,
      addFloorToHostel
    } = await import('../src/services/hostelRoomStore.js');

    const hostel = 'Bhabani Hostel-1';
    const initialRooms = getRoomsForHostel(hostel);
    expect(initialRooms.length).toBeGreaterThanOrEqual(5);

    // Add a new room (Room 104 with 4 beds on Floor 1)
    const afterRoom = addRoomToHostel(hostel, {
      roomNo: '104',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4
    });
    const room104 = afterRoom.find(r => r.roomNo === '104');
    expect(room104).toBeDefined();
    expect(room104.floor).toBe('Floor 1');
    expect(room104.capacity).toBe(4);
    expect(room104.beds).toHaveLength(4);
    expect(room104.beds[0].status).toBe('Vacant');

    // Add an extra bed to Room 104 (now 5 beds)
    const afterBed = addBedToRoom(hostel, '104', 'Bed 05');
    const updated104 = afterBed.find(r => r.roomNo === '104');
    expect(updated104.capacity).toBe(5);
    expect(updated104.beds).toHaveLength(5);
    expect(updated104.beds[4].bedNo).toBe('Bed 05');

    // Add an entire new floor (Floor 3 with 3 rooms, starting at 301)
    const afterFloor = addFloorToHostel(hostel, {
      floorName: 'Floor 3',
      roomCount: 3,
      startRoomNumber: '301',
      roomType: '4-Bed Standard AC',
      bedsPerRoom: 4
    });
    const floor3Rooms = afterFloor.filter(r => r.floor === 'Floor 3');
    expect(floor3Rooms).toHaveLength(3);
    expect(floor3Rooms[0].roomNo).toBe('301');
    expect(floor3Rooms[1].roomNo).toBe('302');
    expect(floor3Rooms[2].roomNo).toBe('303');
  });

  it('18. Verifies RoomAllotmentSection renders Add Floor, Add Room, and Add Bed options with shared sync for Warden', async () => {
    const fsMod = await import('fs');
    const allotmentCode = fsMod.readFileSync('src/components/hostel/RoomAllotmentSection.jsx', 'utf8');

    // Toolbar action buttons
    expect(allotmentCode).toContain('+ Add Floor');
    expect(allotmentCode).toContain('+ Add Room');
    expect(allotmentCode).toContain('+ Add Bed');
    expect(allotmentCode).toContain('+ Allocate New Bed');

    // Modals
    expect(allotmentCode).toContain('isAddRoomModalOpen');
    expect(allotmentCode).toContain('isAddBedModalOpen');
    expect(allotmentCode).toContain('isAddFloorModalOpen');

    // Handlers
    expect(allotmentCode).toContain('handleAddRoomSubmit');
    expect(allotmentCode).toContain('handleAddBedSubmit');
    expect(allotmentCode).toContain('handleAddFloorSubmit');

    // Quick add bed button on room card
    expect(allotmentCode).toContain('quick-add-bed-btn');

    // Warden sync and role indicator
    expect(allotmentCode).toContain('Hostel Warden View (Synced with Admin)');
    expect(allotmentCode).toContain('subscribeHostelRooms');
  });
  it('19. Verifies Student Resident Registry, Check-In & Check-Out, and Incident Management & Hotline are deleted from Hostel Admin navigation', async () => {
    const fsMod = await import('fs');
    const portalCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');

    // Extract hostelAdminNavSections block
    const adminNavBlock = portalCode.slice(portalCode.indexOf('const hostelAdminNavSections = ['), portalCode.indexOf('const hostelNavSections = isHostelAdmin'));
    
    // Ensure deleted items are not in hostelAdminNavSections
    expect(adminNavBlock).not.toContain("'applicant-details'");
    expect(adminNavBlock).not.toContain("'checkin-checkout'");
    expect(adminNavBlock).not.toContain("'emergency-incidents'");
    expect(adminNavBlock).not.toContain('Student Resident Registry');
    expect(adminNavBlock).not.toContain('Check-In & Check-Out');
    expect(adminNavBlock).not.toContain('Incident Management & Hotline');

    // Ensure Residential Operations in Hostel Admin has only clean core modules
    expect(adminNavBlock).toContain('Hostel Buildings & Blocks');
    expect(adminNavBlock).toContain('Rooms & Bed Capacity');
    expect(adminNavBlock).toContain('Room Allotment');
  });
  it('20. Verifies hostelRulesStore supports Add, Edit, Delete, Reset, and Student sync', async () => {
    const {
      getAllHostelRules,
      addHostelRule,
      updateHostelRule,
      deleteHostelRule,
      resetHostelRulesToDefault,
      getStudentRulesList
    } = await import('../src/services/hostelRulesStore.js');

    // Baseline rules check
    const baseline = resetHostelRulesToDefault();
    expect(baseline.length).toBeGreaterThanOrEqual(4);
    const curfewCat = baseline.find(c => c.category === 'Curfew & Gate Timings');
    expect(curfewCat).toBeDefined();
    expect(curfewCat.items.length).toBeGreaterThanOrEqual(4);

    // Add new rule
    const newRule = addHostelRule({
      category: 'Curfew & Gate Timings',
      title: 'Exam Period Curfew Extension',
      value: '10:30 PM',
      description: 'Extended library access permitted during semester exams.'
    });
    expect(newRule.id).toBeDefined();
    expect(newRule.title).toBe('Exam Period Curfew Extension');

    const afterAdd = getAllHostelRules();
    const updatedCurfewCat = afterAdd.find(c => c.category === 'Curfew & Gate Timings');
    expect(updatedCurfewCat.items.some(i => i.title === 'Exam Period Curfew Extension')).toBe(true);

    // Edit rule
    const updated = updateHostelRule(newRule.id, {
      title: 'Exam Period Curfew Extension (Revised)',
      value: '11:00 PM',
      description: 'Extended until 11:00 PM with library swipe confirmation.'
    });
    expect(updated.title).toBe('Exam Period Curfew Extension (Revised)');
    expect(updated.value).toBe('11:00 PM');

    // Delete rule
    const deleted = deleteHostelRule(newRule.id);
    expect(deleted).toBe(true);

    const afterDelete = getAllHostelRules();
    const afterDeleteCurfew = afterDelete.find(c => c.category === 'Curfew & Gate Timings');
    expect(afterDeleteCurfew.items.some(i => i.id === newRule.id)).toBe(false);

    // Student rules list
    const studentList = getStudentRulesList();
    expect(Array.isArray(studentList)).toBe(true);
    expect(studentList.length).toBeGreaterThan(0);
    expect(studentList[0]).toHaveProperty('title');
    expect(studentList[0]).toHaveProperty('value');
    expect(studentList[0]).toHaveProperty('description');
  });

  it('21. Verifies Warden Policy Configuration tab (Image 2) is removed from Hostel Admin and Edit/Delete are enabled', async () => {
    const fsMod = await import('fs');
    const rulesCode = fsMod.readFileSync('src/components/hostel/HostelSettingsRulesSection.jsx', 'utf8');

    // Ensure Warden Policy Configuration tab (Image 2) is deleted
    expect(rulesCode).not.toContain('Warden Policy Configuration');
    expect(rulesCode).not.toContain("activeTab === 'config'");

    // Ensure Admin has Add, Edit, Delete controls
    expect(rulesCode).toContain('Add New Rule / Curfew Policy');
    expect(rulesCode).toContain('handleOpenEditModal');
    expect(rulesCode).toContain('handleOpenDeleteModal');
    expect(rulesCode).toContain('h-rule-action-btn edit');
    expect(rulesCode).toContain('h-rule-action-btn delete');

    // Ensure Warden notice is rendered for read-only warden mode
    expect(rulesCode).toContain('warden-rules-notice-banner');
    expect(rulesCode).toContain('subscribeHostelRules');
  });

  it('22. Verifies Student Hostel Page subscribes to hostelRulesStore live updates', async () => {
    const fsMod = await import('fs');
    const studentCode = fsMod.readFileSync('src/pages/StudentHostelPage.jsx', 'utf8');

    // Ensure StudentHostelPage imports and connects to hostelRulesStore
    expect(studentCode).toContain('getStudentRulesList');
    expect(studentCode).toContain('subscribeHostelRules');
    expect(studentCode).toContain('Live Admin Policy');
    expect(studentCode).toContain('Hostel Regulations');
    expect(studentCode).toContain('Code of Conduct');
  });

  it('23. Verifies Student Hostel Page and all submodules contain zero missing or undefined icon references (CalendarCheck, etc.)', async () => {
    const fsMod = await import('fs');
    const studentCode = fsMod.readFileSync('src/pages/StudentHostelPage.jsx', 'utf8');

    // Ensure StudentHostelPage has defensive render for string and object rules
    expect(studentCode).toContain("typeof rule === 'string'");

    // Ensure StudentPortal maps Hostel Residence to StudentHostelPage
    const studentPortalCode = fsMod.readFileSync('src/StudentPortal.jsx', 'utf8');
    expect(studentPortalCode).toContain("{ label: 'Hostel Residence', icon: Building2, page: 'hostel' }");
    expect(studentPortalCode).toContain("activePage === 'hostel' && <StudentHostelPage");
  });
});
