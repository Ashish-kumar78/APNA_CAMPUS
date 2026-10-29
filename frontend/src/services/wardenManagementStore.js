// Apna Campus — Warden Management & Hostel Admin Supervisory Store
// Manages Warden Directory, Assignments, Granular Permissions, Performance, Audit Logs & Multi-module Approvals

const WARDENS_STORAGE_KEY = 'apna_hostel_wardens_directory_v1';
const ASSIGNMENTS_HISTORY_KEY = 'apna_hostel_warden_assignments_history_v1';
const PERMISSIONS_STORAGE_KEY = 'apna_hostel_warden_permissions_v1';
const AUDIT_LOGS_STORAGE_KEY = 'apna_hostel_admin_audit_logs_v1';
const WARDEN_PERFORMANCE_KEY = 'apna_hostel_warden_performance_v1';

export const INITIAL_WARDENS = [
  {
    id: 'WRD-101',
    name: 'Mr. Rajesh Jena',
    designation: 'Chief Resident Warden (Boys)',
    department: 'Hostel Administration & Student Housing',
    email: 'rajesh.jena@gift.edu.in',
    phone: '+91 94370 11223',
    hostelId: 'hst-3',
    hostelName: 'Gandhi Boys Residence',
    assignedBlocks: ['Block A (Rooms 101-220)', 'Block B (Rooms 201-320)'],
    dutyShift: 'General / 24x7 Resident',
    shiftTimings: '06:00 AM - 10:00 PM (On-Call Curfew)',
    accountStatus: 'Active', // 'Active' | 'Suspended' | 'On Leave'
    dutyStatus: 'On Duty', // 'On Duty' | 'Off Duty' | 'On Leave' | 'Relieved'
    joiningDate: '2018-07-15',
    lastLogin: '28 Oct 2026, 09:42 PM',
    qualification: 'M.Tech (Thermal Engg), B.Tech (Mechanical)',
    roomOffice: 'Ground Floor Office, Gandhi Residence',
    emergencyContact: '+91 94370 11224 (Spouse)',
    bloodGroup: 'B+',
    attendanceCompliance: 98.4,
    pendingTasks: 3,
    activeResidentsCount: 168,
    totalBedsSupervised: 180,
    role: 'warden',
    notes: 'Primary liaison for Boys Hostel Disciplinary Committee and Night Roll Call verification.'
  },
  {
    id: 'WRD-102',
    name: 'Mrs. Nibedita Das',
    designation: 'Chief Resident Warden (Girls)',
    department: 'Hostel Administration & Student Housing',
    email: 'nibedita.das@gift.edu.in',
    phone: '+91 94370 00120',
    hostelId: 'hst-4',
    hostelName: 'Sarojini Girls Residence',
    assignedBlocks: ['Wing A (Floors 1-3)', 'Wing B (Floors 1-2)'],
    dutyShift: 'Morning & Evening Resident',
    shiftTimings: '07:00 AM - 09:30 PM (Curfew Lock)',
    accountStatus: 'Active',
    dutyStatus: 'On Duty',
    joiningDate: '2017-08-01',
    lastLogin: '28 Oct 2026, 08:15 PM',
    qualification: 'M.Sc (Chemistry), B.Ed',
    roomOffice: 'Wing A Main Lobby Office, Sarojini Residence',
    emergencyContact: '+91 94370 00129',
    bloodGroup: 'O+',
    attendanceCompliance: 99.2,
    pendingTasks: 1,
    activeResidentsCount: 192,
    totalBedsSupervised: 200,
    role: 'warden',
    notes: 'Oversees Girls Residence biometric check-in, mentor communications, and guardian verification.'
  },
  {
    id: 'WRD-103',
    name: 'Mr. Tanmaya Kumar Routray',
    designation: 'Hostel Supervisor (Boys)',
    department: 'Hostel Administration',
    email: 'tanmaya.routray@gift.edu.in',
    phone: '+91 94370 67890',
    hostelId: 'hst-2',
    hostelName: 'Bhabani Hostel-2',
    assignedBlocks: ['Main Block (Floors 1-3)'],
    dutyShift: 'Evening & Night Shift',
    shiftTimings: '04:00 PM - 12:00 AM',
    accountStatus: 'Active',
    dutyStatus: 'On Duty',
    joiningDate: '2021-02-10',
    lastLogin: '28 Oct 2026, 07:30 PM',
    qualification: 'MCA, Diploma in Administration',
    roomOffice: 'Room 101, Bhabani Hostel-2',
    emergencyContact: '+91 78730 08197',
    bloodGroup: 'A+',
    attendanceCompliance: 94.8,
    pendingTasks: 4,
    activeResidentsCount: 52,
    totalBedsSupervised: 60,
    role: 'warden',
    notes: 'Handles late night entry logs and emergency infrastructure maintenance reporting.'
  },
  {
    id: 'WRD-104',
    name: 'Dr. Swapna Patra',
    designation: 'Assistant Warden (Girls)',
    department: 'Hostel Administration',
    email: 'swapna.patra@gift.edu.in',
    phone: '+91 94372 33445',
    hostelId: 'hst-4',
    hostelName: 'Sarojini Girls Residence',
    assignedBlocks: ['Wing B Extension (Floor 3)'],
    dutyShift: 'Night Relief Shift',
    shiftTimings: '08:00 PM - 06:00 AM',
    accountStatus: 'Active',
    dutyStatus: 'On Duty',
    joiningDate: '2022-11-15',
    lastLogin: '28 Oct 2026, 06:45 PM',
    qualification: 'Ph.D (Life Sciences)',
    roomOffice: 'Wing B 1st Floor Station',
    emergencyContact: '+91 94372 33449',
    bloodGroup: 'AB+',
    attendanceCompliance: 96.5,
    pendingTasks: 2,
    activeResidentsCount: 68,
    totalBedsSupervised: 75,
    role: 'warden',
    notes: 'Responsible for medical emergencies, student unwell reports, and night dispensary coordination.'
  },
  {
    id: 'WRD-105',
    name: 'Mr. Debendra Sahoo',
    designation: 'Hostel Supervisor (Boys Kalam Block)',
    department: 'Hostel Administration',
    email: 'debendra.sahoo@gift.edu.in',
    phone: '+91 98610 99887',
    hostelId: 'hst-1',
    hostelName: 'Bhabani Hostel-1',
    assignedBlocks: ['Ground & 1st Floor'],
    dutyShift: 'Day Shift',
    shiftTimings: '08:00 AM - 04:00 PM',
    accountStatus: 'Active',
    dutyStatus: 'On Duty',
    joiningDate: '2023-01-20',
    lastLogin: '28 Oct 2026, 05:10 PM',
    qualification: 'B.Com, PG Diploma in Facilities Management',
    roomOffice: 'Bhabani-1 Ground Floor Office',
    emergencyContact: '+91 98610 99881',
    bloodGroup: 'O+',
    attendanceCompliance: 92.1,
    pendingTasks: 5,
    activeResidentsCount: 74,
    totalBedsSupervised: 82,
    role: 'warden',
    notes: 'Manages mess meal reservations, food waste monitoring, and contractor laundry handovers.'
  },
  {
    id: 'WRD-106',
    name: 'Mr. Bipin Sethi',
    designation: 'Resident Facilities Caretaker & Relief Warden',
    department: 'Campus Maintenance & Hostel Operations',
    email: 'bipin.sethi@gift.edu.in',
    phone: '+91 94378 55667',
    hostelId: 'ALL',
    hostelName: 'Central Hostel Complex (Relief Coverage)',
    assignedBlocks: ['Utility Core & Central Mess'],
    dutyShift: 'General Maintenance & Relief',
    shiftTimings: '09:00 AM - 06:00 PM (Rotational Curfew)',
    accountStatus: 'Active',
    dutyStatus: 'On Duty',
    joiningDate: '2019-04-10',
    lastLogin: '28 Oct 2026, 08:50 PM',
    qualification: 'Diploma in Electrical Engineering',
    roomOffice: 'Hostel Central Electrical & Plumbing Station',
    emergencyContact: '+91 94378 55660',
    bloodGroup: 'B+',
    attendanceCompliance: 97.8,
    pendingTasks: 2,
    activeResidentsCount: 310,
    totalBedsSupervised: 350,
    role: 'warden',
    notes: 'Handles 72h maintenance ticket escalations, water pump scheduling, and relief roll calls.'
  }
];

export const INITIAL_ASSIGNMENT_HISTORY = [
  {
    id: 'ASN-HIST-001',
    wardenId: 'WRD-101',
    wardenName: 'Mr. Rajesh Jena',
    previousHostel: 'Bhabani Hostel-1',
    newHostel: 'Gandhi Boys Residence',
    assignedBlocks: 'Block A & B (Floors 1-3)',
    effectiveDate: '2025-07-01',
    assignedBy: 'Chief Administrator (Hostel Affairs)',
    relievingWarden: 'Mr. Debendra Sahoo',
    reason: 'Annual administrative rotation and high-occupancy block supervision assignment.',
    handoverStatus: 'Completed',
    handoverNotes: 'All master keys, room inventory ledgers, and emergency asset inventory verified and handed over.'
  },
  {
    id: 'ASN-HIST-002',
    wardenId: 'WRD-103',
    wardenName: 'Mr. Tanmaya Kumar Routray',
    previousHostel: 'Gandhi Boys Residence Wing C',
    newHostel: 'Bhabani Hostel-2',
    assignedBlocks: 'Main Block (All Floors)',
    effectiveDate: '2025-08-15',
    assignedBy: 'Hostel Administrator',
    relievingWarden: 'None (Newly commissioned hostel block)',
    reason: 'Operational assignment to manage newly inaugurated Bhabani-2 block.',
    handoverStatus: 'Completed',
    handoverNotes: 'New biometric roll call scanner initialized and verified.'
  },
  {
    id: 'ASN-HIST-003',
    wardenId: 'WRD-104',
    wardenName: 'Dr. Swapna Patra',
    previousHostel: 'Off-Campus Girls Transit',
    newHostel: 'Sarojini Girls Residence',
    assignedBlocks: 'Wing B Extension',
    effectiveDate: '2026-01-10',
    assignedBy: 'Hostel Administrator',
    relievingWarden: 'Mrs. Nibedita Das',
    reason: 'Addition of second resident warden for girl resident welfare & night roll call backup.',
    handoverStatus: 'Completed',
    handoverNotes: 'Dispensary cabinet stock and medical emergency registers handed over.'
  }
];

export const DEFAULT_WARDEN_PERMISSIONS = {
  viewHostelRecords: true,
  manageAttendance: true,
  submitAttendance: true,
  viewRoomAllocations: true,
  manageRoomAllocations: true,
  reviewStudentLeaves: true,
  approveOperationalRequests: false, // Only Hostel Admin has final authority
  manageGatePasses: true,
  registerVisitors: true,
  recordDisciplinaryIncidents: true,
  manageComplaints: true,
  createInventoryRequisitions: true,
  manageStaffDutyRosters: false, // Managed by Admin
  viewReports: true,
  exportReports: false, // Exporting sensitive PII requires Admin authorization
  editHostelConfiguration: false // Admin only
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-HST-2026-101',
    timestamp: '2026-10-28 20:30:15',
    actingUser: 'Chief Hostel Administrator (WRD-ADM-01)',
    actingRole: 'hostel_admin',
    action: 'POLICY_UPDATE',
    targetEntity: 'HostelRulesConfig',
    recordId: 'CURFEW-BOYS-GANDHI',
    hostelScope: 'Gandhi Boys Residence',
    previousValue: 'Curfew: 10:00 PM; SMS Grace: 15 min',
    newValue: 'Curfew: 10:15 PM; SMS Grace: 10 min',
    reason: 'BPUT Autonomous Autumn term evening lab practicals timetable extension.',
    outcome: 'SUCCESS'
  },
  {
    id: 'AUD-HST-2026-102',
    timestamp: '2026-10-28 18:45:22',
    actingUser: 'Chief Hostel Administrator (WRD-ADM-01)',
    actingRole: 'hostel_admin',
    action: 'WARDEN_REASSIGN',
    targetEntity: 'WardenAssignment',
    recordId: 'WRD-103',
    hostelScope: 'Bhabani Hostel-2',
    previousValue: 'Shift: Day Shift (08:00 AM - 04:00 PM)',
    newValue: 'Shift: Evening & Night Shift (04:00 PM - 12:00 AM)',
    reason: 'Night roll call biometric supervision requirement for midterm examination cycle.',
    outcome: 'SUCCESS'
  },
  {
    id: 'AUD-HST-2026-103',
    timestamp: '2026-10-28 16:10:05',
    actingUser: 'Chief Hostel Administrator (WRD-ADM-01)',
    actingRole: 'hostel_admin',
    action: 'ATTENDANCE_CORRECTION',
    targetEntity: 'HostelAttendanceRecord',
    recordId: 'ATT-HST-2026-1028-01',
    hostelScope: 'Gandhi Boys Residence',
    previousValue: 'Roll 2305200012: ABSENT',
    newValue: 'Roll 2305200012: ON_APPROVED_LEAVE',
    reason: 'Emergency hospital visit slip verified by Parent/Guardian via phone. Approved outstation leave #LV-2026-041.',
    outcome: 'SUCCESS'
  },
  {
    id: 'AUD-HST-2026-104',
    timestamp: '2026-10-27 14:20:40',
    actingUser: 'Chief Hostel Administrator (WRD-ADM-01)',
    actingRole: 'hostel_admin',
    action: 'INVENTORY_APPROVAL',
    targetEntity: 'HostelIndent',
    recordId: 'IND-2026-004',
    hostelScope: 'Sarojini Girls Residence',
    previousValue: 'Status: Pending Approval (Qty: 25 LED Batten 20W)',
    newValue: 'Status: Approved by Hostel Admin (Issued Qty: 25)',
    reason: 'Critical corridor lighting replacement approved for student safety.',
    outcome: 'SUCCESS'
  },
  {
    id: 'AUD-HST-2026-105',
    timestamp: '2026-10-26 11:15:30',
    actingUser: 'Chief Hostel Administrator (WRD-ADM-01)',
    actingRole: 'hostel_admin',
    action: 'DISCIPLINARY_SANCTION',
    targetEntity: 'DisciplinaryRecord',
    recordId: 'DISC-2026-011',
    hostelScope: 'Gandhi Boys Residence',
    previousValue: 'Status: Under Investigation',
    newValue: 'Status: Show-Cause Issued & Parent Informed',
    reason: 'Repeated unauthorized late night return without gate pass.',
    outcome: 'SUCCESS'
  }
];

// Helper to safely get from localStorage
function getFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed reading storage key "${key}":`, e);
    return fallback;
  }
}

function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed writing storage key "${key}":`, e);
  }
}

// ----------------------------------------------------
// 1. WARDEN DIRECTORY APIS
// ----------------------------------------------------
export function getAllWardens() {
  return getFromStorage(WARDENS_STORAGE_KEY, INITIAL_WARDENS);
}

export function getWardenById(id) {
  const wardens = getAllWardens();
  return wardens.find(w => w.id === id) || null;
}

export function saveWarden(wardenData) {
  const wardens = getAllWardens();
  const index = wardens.findIndex(w => w.id === wardenData.id);
  let updated;
  if (index >= 0) {
    updated = [...wardens];
    updated[index] = { ...updated[index], ...wardenData, updatedAt: new Date().toISOString() };
  } else {
    const newId = wardenData.id || `WRD-${100 + wardens.length + 1}`;
    updated = [{ ...wardenData, id: newId, createdAt: new Date().toISOString() }, ...wardens];
  }
  setToStorage(WARDENS_STORAGE_KEY, updated);

  // Add audit log
  logAdminAction({
    action: index >= 0 ? 'WARDEN_PROFILE_UPDATE' : 'WARDEN_CREATED',
    targetEntity: 'WardenDirectory',
    recordId: wardenData.id || 'NEW',
    hostelScope: wardenData.hostelName || 'General',
    previousValue: index >= 0 ? `Updated profile for ${wardens[index].name}` : 'New Warden Record',
    newValue: `Saved profile for ${wardenData.name}`,
    reason: 'Administrative profile maintenance.'
  });

  return updated;
}

export function setWardenAccountStatus(wardenId, status, reason = 'Administrative decision') {
  const wardens = getAllWardens();
  const target = wardens.find(w => w.id === wardenId);
  if (!target) return false;

  const prevStatus = target.accountStatus;
  const updated = wardens.map(w => {
    if (w.id === wardenId) {
      return { ...w, accountStatus: status, updatedAt: new Date().toISOString() };
    }
    return w;
  });
  setToStorage(WARDENS_STORAGE_KEY, updated);

  logAdminAction({
    action: status === 'Suspended' ? 'WARDEN_SUSPEND' : 'WARDEN_REACTIVATE',
    targetEntity: 'WardenAccountStatus',
    recordId: wardenId,
    hostelScope: target.hostelName,
    previousValue: `Status: ${prevStatus}`,
    newValue: `Status: ${status}`,
    reason: reason
  });

  return true;
}

// ----------------------------------------------------
// 2. WARDEN REASSIGNMENT & HISTORY APIS
// ----------------------------------------------------
export function getAssignmentHistory() {
  return getFromStorage(ASSIGNMENTS_HISTORY_KEY, INITIAL_ASSIGNMENT_HISTORY);
}

export function reassignWarden({
  wardenId,
  newHostelId,
  newHostelName,
  assignedBlocks = [],
  dutyShift,
  shiftTimings,
  effectiveDate,
  relievingWarden = 'None',
  reason,
  adminUser = 'Hostel Administrator'
}) {
  const wardens = getAllWardens();
  const warden = wardens.find(w => w.id === wardenId);
  if (!warden) throw new Error('Warden not found');

  const prevHostel = warden.hostelName;
  const prevBlocks = warden.assignedBlocks;

  // 1. Update Warden Profile
  const updatedWardens = wardens.map(w => {
    if (w.id === wardenId) {
      return {
        ...w,
        hostelId: newHostelId,
        hostelName: newHostelName,
        assignedBlocks: Array.isArray(assignedBlocks) ? assignedBlocks : [assignedBlocks],
        dutyShift: dutyShift || w.dutyShift,
        shiftTimings: shiftTimings || w.shiftTimings,
        updatedAt: new Date().toISOString()
      };
    }
    return w;
  });
  setToStorage(WARDENS_STORAGE_KEY, updatedWardens);

  // 2. Add History Record
  const history = getAssignmentHistory();
  const newHistRecord = {
    id: `ASN-HIST-${String(history.length + 1).padStart(3, '0')}`,
    wardenId,
    wardenName: warden.name,
    previousHostel: prevHostel,
    newHostel: newHostelName,
    assignedBlocks: Array.isArray(assignedBlocks) ? assignedBlocks.join(', ') : assignedBlocks,
    effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    assignedBy: adminUser,
    relievingWarden,
    reason,
    handoverStatus: 'Completed',
    handoverNotes: `Administrative reassignment effective from ${effectiveDate}. Operational handover logged.`
  };
  setToStorage(ASSIGNMENTS_HISTORY_KEY, [newHistRecord, ...history]);

  // 3. Log Audit Record
  logAdminAction({
    action: 'WARDEN_REASSIGN',
    targetEntity: 'WardenAssignment',
    recordId: wardenId,
    hostelScope: newHostelName,
    previousValue: `${warden.name} assigned to ${prevHostel} (${Array.isArray(prevBlocks) ? prevBlocks.join(';') : prevBlocks})`,
    newValue: `${warden.name} assigned to ${newHostelName} (${Array.isArray(assignedBlocks) ? assignedBlocks.join(';') : assignedBlocks})`,
    reason: reason || 'Hostel operational load rebalancing.',
    actingUser: adminUser
  });

  return newHistRecord;
}

// ----------------------------------------------------
// 3. WARDEN PERMISSIONS APIS
// ----------------------------------------------------
export function getWardenPermissions(wardenId) {
  const allPerms = getFromStorage(PERMISSIONS_STORAGE_KEY, {});
  return allPerms[wardenId] || { ...DEFAULT_WARDEN_PERMISSIONS };
}

export function updateWardenPermissions(wardenId, newPermissions, reason = 'Administrative permission adjustment') {
  const allPerms = getFromStorage(PERMISSIONS_STORAGE_KEY, {});
  const prevPerms = allPerms[wardenId] || { ...DEFAULT_WARDEN_PERMISSIONS };
  const updatedPerms = { ...prevPerms, ...newPermissions };

  allPerms[wardenId] = updatedPerms;
  setToStorage(PERMISSIONS_STORAGE_KEY, allPerms);

  const warden = getWardenById(wardenId);

  logAdminAction({
    action: 'WARDEN_PERMISSIONS_UPDATE',
    targetEntity: 'WardenPermissions',
    recordId: wardenId,
    hostelScope: warden?.hostelName || 'General',
    previousValue: JSON.stringify(prevPerms),
    newValue: JSON.stringify(updatedPerms),
    reason: reason
  });

  return updatedPerms;
}

// ----------------------------------------------------
// 4. ADMINISTRATIVE AUDIT LOGS APIS
// ----------------------------------------------------
export function getAllAuditLogs() {
  return getFromStorage(AUDIT_LOGS_STORAGE_KEY, INITIAL_AUDIT_LOGS);
}

export function logAdminAction({
  action,
  targetEntity,
  recordId,
  hostelScope = 'All Hostels',
  previousValue = '',
  newValue = '',
  reason = 'Administrative action',
  actingUser = 'Chief Hostel Administrator (WRD-ADM-01)',
  actingRole = 'hostel_admin',
  outcome = 'SUCCESS'
}) {
  const logs = getAllAuditLogs();
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const newLog = {
    id: `AUD-HST-${now.getFullYear()}-${String(logs.length + 101)}`,
    timestamp,
    actingUser,
    actingRole,
    action,
    targetEntity,
    recordId,
    hostelScope,
    previousValue,
    newValue,
    reason,
    outcome
  };

  const updated = [newLog, ...logs];
  setToStorage(AUDIT_LOGS_STORAGE_KEY, updated);
  return newLog;
}

// ----------------------------------------------------
// 5. UNIFIED APPROVAL CENTER CONSOLIDATION API
// ----------------------------------------------------
export function getUnifiedPendingApprovals() {
  // Aggregate from:
  // 1. Student Resident Leaves (hostelResidentLeaveStore)
  // 2. Staff Leaves (hostelStaffLeaveStore)
  // 3. Inventory Indents (hostelIndentStore)
  // 4. Digital Gate Passes (gatePassStore)
  // 5. Overdue / Escalated Complaints (API or local)

  const items = [];

  // A. Student Leaves
  try {
    const rawLeaves = localStorage.getItem('bput_hostel_resident_leaves_v2');
    if (rawLeaves) {
      const parsed = JSON.parse(rawLeaves);
      parsed.filter(l => l.status === 'Pending').forEach(l => {
        items.push({
          id: l.id,
          category: 'Student Resident Leave',
          sourceModule: 'leave-mgmt',
          title: `Overnight Leave: ${l.studentName} (${l.rollNumber})`,
          hostel: l.hostelName,
          blockOrRoom: `Room ${l.roomNumber}`,
          requester: l.studentName,
          submittedDate: l.appliedOn,
          priority: l.days > 3 ? 'High' : 'Normal',
          details: `Reason: ${l.reason} · Duration: ${l.days} Days (${l.startDate} to ${l.endDate}) · Guardian: ${l.guardianStatus}`,
          status: 'Pending',
          rawData: l
        });
      });
    }
  } catch (e) {}

  // B. Staff & Warden Leaves
  try {
    const rawStaffLeaves = localStorage.getItem('bput_hostel_staff_leaves_v1');
    if (rawStaffLeaves) {
      const parsed = JSON.parse(rawStaffLeaves);
      parsed.filter(sl => sl.status === 'Pending Approval').forEach(sl => {
        items.push({
          id: sl.id,
          category: 'Staff & Warden Leave',
          sourceModule: 'apply-leave',
          title: `Staff Leave: ${sl.applicantName} (${sl.designation})`,
          hostel: 'Hostel Administration',
          blockOrRoom: sl.department,
          requester: sl.applicantName,
          submittedDate: sl.appliedOn,
          priority: 'High',
          details: `Type: ${sl.leaveType} · Duration: ${sl.days} Days · Reliever: ${sl.alternativeArrangement || 'None assigned'} · Reason: ${sl.reason}`,
          status: 'Pending',
          rawData: sl
        });
      });
    }
  } catch (e) {}

  // C. Inventory Indents
  try {
    const rawIndents = localStorage.getItem('bput_hostel_indents_v1');
    if (rawIndents) {
      const parsed = JSON.parse(rawIndents);
      parsed.filter(ind => ind.status === 'Pending Approval' || ind.status === 'Submitted to Admin').forEach(ind => {
        items.push({
          id: ind.id,
          category: 'Material Requisition',
          sourceModule: 'inventory-assets',
          title: `Indent: ${ind.materialName || ind.item} (Qty: ${ind.quantityRequired || ind.quantity} ${ind.unit || 'units'})`,
          hostel: ind.hostelName || 'Hostel Campus',
          blockOrRoom: ind.block || 'General Asset',
          requester: ind.raisedBy || ind.wardenName || 'Resident Warden',
          submittedDate: ind.indentDate || ind.date,
          priority: ind.priority || 'Medium',
          details: `Category: ${ind.category} · Urgency: ${ind.urgency || ind.priority} · Purpose: ${ind.purpose || ind.justification}`,
          status: 'Pending',
          rawData: ind
        });
      });
    }
  } catch (e) {}

  // D. Attendance Submissions awaiting verification
  try {
    const rawAtt = localStorage.getItem('bput_hostel_attendance_records_v2');
    if (rawAtt) {
      const parsed = JSON.parse(rawAtt);
      parsed.filter(a => a.status === 'Submitted' || a.verificationStatus === 'Pending Verification').forEach(a => {
        items.push({
          id: a.id,
          category: 'Attendance Certification',
          sourceModule: 'attendance-verification',
          title: `Night Roll Call: ${a.hostelName} (${a.session || 'Evening Biometric'})`,
          hostel: a.hostelName,
          blockOrRoom: 'Full Hostel Block',
          requester: a.submittedBy || 'Resident Warden',
          submittedDate: a.date,
          priority: (a.absentCount > 5) ? 'High' : 'Normal',
          details: `Present: ${a.presentCount || 0} · Absent: ${a.absentCount || 0} · Total: ${a.totalStudents || 0} (${a.turnout || 0}% Turnout)`,
          status: 'Pending',
          rawData: a
        });
      });
    }
  } catch (e) {}

  // Sort by priority and date
  return items.sort((a, b) => {
    if (a.priority === 'High' && b.priority !== 'High') return -1;
    if (b.priority === 'High' && a.priority !== 'High') return 1;
    return new Date(b.submittedDate) - new Date(a.submittedDate);
  });
}

