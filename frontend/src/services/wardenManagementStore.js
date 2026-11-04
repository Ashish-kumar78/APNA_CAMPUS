// Apna Campus — Warden Management & Hostel Admin Supervisory Store
// Manages Warden Directory, Assignments, Granular Permissions, Performance, Audit Logs & Multi-module Approvals

import { api } from './api.js';

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

export const INITIAL_WARDEN_PERMISSIONS = {
  'WRD-101': { ...DEFAULT_WARDEN_PERMISSIONS, manageStaffDutyRosters: true, approveOperationalRequests: true, editHostelConfiguration: true },
  'WRD-102': { ...DEFAULT_WARDEN_PERMISSIONS, editHostelConfiguration: true },
  'WRD-103': { ...DEFAULT_WARDEN_PERMISSIONS, editHostelConfiguration: false },
  'WRD-104': { ...DEFAULT_WARDEN_PERMISSIONS, editHostelConfiguration: false },
  'WRD-105': { ...DEFAULT_WARDEN_PERMISSIONS, editHostelConfiguration: true },
  'WRD-106': { ...DEFAULT_WARDEN_PERMISSIONS, editHostelConfiguration: false },
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
// 1. WARDEN DIRECTORY APIS & SUSPENSION STATUS CHECK
// ----------------------------------------------------
export function isWardenSuspended(target) {
  if (!target) return false;

  // If passed an account / user object
  if (typeof target === 'object') {
    if (target.accountStatus === 'Suspended' || target.status === 'Suspended') return true;
    if (target.identity && isWardenSuspended(target.identity)) return true;
    if (target.id && isWardenSuspended(target.id)) return true;
    if (target.name && isWardenSuspended(target.name)) return true;
    if (target.email && isWardenSuspended(target.email)) return true;
    return false;
  }

  // If passed an ID or Name or Email string
  if (typeof target === 'string') {
    const trimmed = target.trim().toLowerCase();
    const wardens = getAllWardens();
    const match = wardens.find(w =>
      (w.id && w.id.toLowerCase() === trimmed) ||
      (w.name && w.name.toLowerCase() === trimmed) ||
      (w.name && (w.name.toLowerCase().includes(trimmed) || trimmed.includes(w.name.toLowerCase()))) ||
      (w.email && w.email.toLowerCase() === trimmed)
    );
    if (match) {
      return match.accountStatus === 'Suspended';
    }
  }

  return false;
}

export function saveWardens(wardens) {
  setToStorage(WARDENS_STORAGE_KEY, wardens);
}

export function getAllWardens() {
  return getFromStorage(WARDENS_STORAGE_KEY, INITIAL_WARDENS);
}

export async function syncWardensFromBackend() {
  if (typeof api !== 'undefined' && api.getWardens) {
    try {
      const res = await api.getWardens();
      const backendList = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(backendList) && backendList.length > 0) {
        const localWardens = getAllWardens();
        const mergedMap = new Map();

        localWardens.forEach(w => {
          if (w && (w.id || w.employeeId)) mergedMap.set(w.id || w.employeeId, w);
        });

        backendList.forEach(bw => {
          const id = bw.id || bw.employeeId || bw.badgeNumber;
          if (!id) return;
          const existing = mergedMap.get(id) || {};
          mergedMap.set(id, {
            ...existing,
            ...bw,
            id: id,
            name: bw.name || existing.name,
            hostelName: bw.hostelName || bw.assignedHostelOrPost || existing.hostelName,
            designation: bw.designation || bw.roleOrCategory || existing.designation,
            phone: bw.phone || bw.mobileNo || existing.phone,
            mobileNo: bw.phone || bw.mobileNo || existing.mobileNo,
            accountStatus: bw.status === 'ACTIVE' || bw.accountStatus === 'Active' || bw.status === 'Active' ? 'Active' : (bw.accountStatus || 'Active'),
            dutyStatus: bw.dutyStatus || existing.dutyStatus || 'On Duty'
          });
        });

        const merged = Array.from(mergedMap.values());
        setToStorage(WARDENS_STORAGE_KEY, merged);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bput_wardens_updated', { detail: { wardens: merged } }));
          window.dispatchEvent(new Event('storage'));
        }
        return merged;
      }
    } catch (err) {
      console.warn('Backend getWardens sync fallback to local storage:', err?.message || err);
    }
  }
  return getAllWardens();
}

export function getRelatedWardensForHostel(hostelNameOrId) {
  if (!hostelNameOrId) return [];
  const query = String(hostelNameOrId).toLowerCase().trim();
  const wardens = getAllWardens();
  return wardens.filter(w => {
    const hName = (w.hostelName || '').toLowerCase();
    const hId = (w.hostelId || '').toLowerCase();
    return hName === query || hId === query || (query.length > 2 && (hName.includes(query) || query.includes(hName)));
  });
}

export function getWardenAssignedHostel(wardenNameOrId) {
  if (!wardenNameOrId) return null;
  const query = String(wardenNameOrId).toLowerCase().trim();
  const wardens = getAllWardens();
  return wardens.find(w => {
    const id = (w.id || '').toLowerCase();
    const name = (w.name || '').toLowerCase();
    return id === query || name === query || name.includes(query) || query.includes(name);
  }) || null;
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

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_wardens_updated', { detail: { warden: wardenData, wardens: updated } }));
    window.dispatchEvent(new Event('storage'));
  }

  return updated;
}

export function addNewWarden(wardenData) {
  const wardens = getAllWardens();

  // 1. Calculate next numerical ID e.g. WRD-107
  let nextId = wardenData.id || wardenData.employeeId;
  if (!nextId) {
    const ids = wardens
      .map(w => parseInt(String(w.id || '').replace('WRD-', ''), 10))
      .filter(n => !isNaN(n));
    const maxId = ids.length > 0 ? Math.max(...ids) : 106;
    nextId = `WRD-${maxId + 1}`;
  }

  const fullName = wardenData.name || `${wardenData.title || 'Mr.'} ${wardenData.firstName || ''} ${wardenData.lastName || ''}`.trim();
  const avatarUrl = wardenData.avatar || wardenData.photoUrl || '/candidate_photo_apna.png';
  const joiningDateFormatted = wardenData.joiningDate || new Date().toISOString().split('T')[0];

  const newWarden = {
    id: nextId,
    employeeId: nextId,
    name: fullName,
    designation: wardenData.designation || 'Resident Warden',
    department: wardenData.department || 'Hostel Administration & Student Housing',
    email: wardenData.email || wardenData.emailId || `${nextId.toLowerCase()}@gift.edu.in`,
    phone: wardenData.phone || wardenData.mobileNo || '+91 94370 00000',
    mobileNo: wardenData.phone || wardenData.mobileNo || '+91 94370 00000',
    emailId: wardenData.email || wardenData.emailId || `${nextId.toLowerCase()}@gift.edu.in`,
    hostelId: wardenData.hostelId || 'hst-1',
    hostelName: wardenData.hostelName || 'Gandhi Boys Residence',
    assignedBlocks: Array.isArray(wardenData.assignedBlocks)
      ? wardenData.assignedBlocks
      : [wardenData.assignedBlocks || 'Block A (Rooms 101-220)'],
    dutyShift: wardenData.dutyShift || 'General / 24x7 Resident',
    shiftTimings: wardenData.shiftTimings || '06:00 AM - 10:00 PM (Rotational Curfew)',
    accountStatus: 'Active',
    dutyStatus: 'On Duty',
    joiningDate: joiningDateFormatted,
    lastLogin: 'Never logged in (New Account)',
    qualification: wardenData.qualification || 'M.Tech / B.Tech',
    roomOffice: wardenData.roomOffice || wardenData.presentAddress1 || 'Staff Quarters, Campus',
    emergencyContact: wardenData.emergencyContact || '',
    guardianMobile: wardenData.guardianMobile || wardenData.emergencyContactPhone || '',
    bloodGroup: wardenData.bloodGroup || 'B+',
    gender: wardenData.gender || 'MALE',
    empDob: wardenData.empDob || '01-01-1985',
    totalExperience: wardenData.totalExperience || '5 Year(s)',
    attendanceCompliance: 100.0,
    pendingTasks: 0,
    activeResidentsCount: Number(wardenData.activeResidentsCount) || 160,
    totalBedsSupervised: Number(wardenData.totalBedsSupervised) || 180,
    role: 'warden',
    notes: wardenData.notes || 'Newly onboarded resident warden registered by Hostel Administrator.',
    avatar: avatarUrl,
    photoUrl: avatarUrl,
    createdAt: new Date().toISOString(),
    ...wardenData,
    id: nextId,
    employeeId: nextId,
    name: fullName,
    avatar: avatarUrl,
  };

  // 2. Add to active wardens directory in localStorage
  const updated = [newWarden, ...wardens.filter(w => w.id !== nextId)];
  setToStorage(WARDENS_STORAGE_KEY, updated);

  // 3. Register default or scoped granular permissions
  const customPerms = wardenData.permissions || {};
  const perms = { ...DEFAULT_WARDEN_PERMISSIONS, ...customPerms };
  const allPerms = getFromStorage(PERMISSIONS_STORAGE_KEY, {});
  allPerms[nextId] = perms;
  setToStorage(PERMISSIONS_STORAGE_KEY, allPerms);

  // 4. Save to custom profiles repository for instant 10-tab CMS dossier access
  const customProfiles = getFromStorage('apna_custom_warden_profiles_v1', {});
  customProfiles[nextId] = {
    ...newWarden,
    bputRegdNo: wardenData.bputRegdNo || `BPUT-EMP-2026-${Math.floor(100 + Math.random() * 900)}`,
    status: 'Active',
    documents: [
      { id: `doc-${Date.now()}-1`, name: 'Official Appointment Order (Warden)', meta: `Issued ${joiningDateFormatted} · Autonomous Administration` },
      { id: `doc-${Date.now()}-2`, name: 'Educational & Technical Degree Certificates', meta: 'Autonomous Verified' },
      { id: `doc-${Date.now()}-3`, name: 'Identity Proof (Aadhaar & PAN)', meta: 'UIDAI Verified' }
    ]
  };
  setToStorage('apna_custom_warden_profiles_v1', customProfiles);

  // 5. Audit Logging
  logAdminAction({
    action: 'WARDEN_CREATED',
    targetEntity: 'WardenDirectory',
    recordId: nextId,
    hostelScope: newWarden.hostelName,
    previousValue: 'None (New Employee)',
    newValue: `Registered new warden ${fullName} (${nextId}) assigned to ${newWarden.hostelName}`,
    reason: wardenData.reason || 'Institutional employee onboarding.'
  });

  // 6. Sync with backend API
  api.createWarden(newWarden).catch(err => {
    console.warn('Backend createWarden sync fallback:', err?.message || err);
  });

  // 7. Fire custom events for instantaneous universal synchronization across all UI components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_wardens_updated', { detail: { warden: newWarden, wardens: updated } }));
    window.dispatchEvent(new CustomEvent('bput_warden_created', { detail: { warden: newWarden, wardens: updated } }));
    window.dispatchEvent(new CustomEvent('bput_warden_status_changed', { detail: { wardenId: nextId, status: 'Active' } }));
    window.dispatchEvent(new Event('storage'));
  }

  return newWarden;
}

export function deleteWarden(wardenId) {
  const wardens = getAllWardens();
  const target = wardens.find(w => w.id === wardenId || w.employeeId === wardenId);
  if (!target) return false;

  const updated = wardens.filter(w => w.id !== target.id && w.employeeId !== target.id);
  saveWardens(updated);

  // Sync with backend API
  if (typeof api !== 'undefined' && api.deleteWarden) {
    api.deleteWarden(target.id).catch(err => {
      console.warn('Backend deleteWarden sync fallback:', err?.message || err);
    });
  }

  logAdminAction({
    action: 'WARDEN_DELETED',
    targetEntity: 'WardenDirectory',
    recordId: target.id,
    hostelScope: target.hostelName,
    previousValue: `${target.name} (${target.id})`,
    newValue: 'DELETED',
    reason: 'Warden account deleted by Administrator'
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_wardens_updated', { detail: { wardens: updated } }));
    window.dispatchEvent(new Event('storage'));
  }

  return true;
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

  // Notify all active portal tabs and modules immediately
  try {
    window.dispatchEvent(new CustomEvent('bput_warden_status_changed', {
      detail: { wardenId, status, wardenName: target.name, hostelName: target.hostelName }
    }));
  } catch {}

  // Sync to backend if endpoint available
  if (typeof api !== 'undefined' && api.updateWardenStatus) {
    api.updateWardenStatus(wardenId, status, reason).catch(err => {
      console.warn('Backend updateWardenStatus sync:', err?.message || err);
    });
  }

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

export function setWardenDutyStatus(wardenId, dutyStatus, remarks = '', relievingWarden = null) {
  const wardens = getAllWardens();
  const target = wardens.find(w => 
    w.id === wardenId || 
    w.employeeId === wardenId || 
    (w.name && wardenId && (
      w.name.toLowerCase() === wardenId.toLowerCase() ||
      w.name.toLowerCase().includes(wardenId.toLowerCase()) ||
      wardenId.toLowerCase().includes(w.name.toLowerCase())
    ))
  );
  if (!target) return false;

  const prevDutyStatus = target.dutyStatus || 'On Duty';
  const assignedRelieving = relievingWarden !== null 
    ? relievingWarden 
    : (dutyStatus === 'On Duty' ? 'None Assigned' : target.relievingWarden || 'Relief Official Assigned');

  const updated = wardens.map(w => {
    if (w.id === target.id || w.employeeId === target.employeeId) {
      return { 
        ...w, 
        dutyStatus, 
        relievingWarden: assignedRelieving,
        updatedAt: new Date().toISOString() 
      };
    }
    return w;
  });
  setToStorage(WARDENS_STORAGE_KEY, updated);

  // Notify all components immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_warden_duty_changed', {
      detail: { 
        wardenId: target.id, 
        dutyStatus, 
        prevDutyStatus, 
        wardenName: target.name,
        relievingWarden: assignedRelieving
      }
    }));
    window.dispatchEvent(new CustomEvent('bput_wardens_updated', {
      detail: { wardens: updated }
    }));
    window.dispatchEvent(new Event('storage'));
  }

  // Sync with backend API
  if (typeof api !== 'undefined' && api.updateWardenDutyStatus) {
    api.updateWardenDutyStatus(target.id, dutyStatus, remarks, assignedRelieving).catch(err => {
      console.warn('Backend updateWardenDutyStatus sync fallback:', err?.message || err);
    });
  }

  logAdminAction({
    action: dutyStatus === 'On Leave' ? 'WARDEN_LEAVE_MARKED' : 'WARDEN_DUTY_RESUMED',
    targetEntity: 'WardenDutyStatus',
    recordId: target.id,
    hostelScope: target.hostelName,
    previousValue: `Duty Status: ${prevDutyStatus}`,
    newValue: `Duty Status: ${dutyStatus} (${assignedRelieving})`,
    reason: remarks || (dutyStatus === 'On Leave' ? 'Warden placed on official leave' : 'Warden resumed active hostel duty')
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

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_wardens_updated', { detail: { wardenId, newHostelName } }));
    window.dispatchEvent(new Event('storage'));
  }

  // Also sync reassignment to backend API asynchronously
  api.updateWardenProfile(wardenId, {
    hostelName: newHostelName,
    assignedHostelOrPost: newHostelName,
    assignedBlocks: Array.isArray(assignedBlocks) ? assignedBlocks : [assignedBlocks],
    dutyShift,
    shiftTimings
  }).catch(err => {
    console.warn('Backend updateWardenProfile sync warning:', err?.message || err);
  });

  return newHistRecord;
}

// ----------------------------------------------------
// 3. WARDEN PERMISSIONS APIS
// ----------------------------------------------------
export function getWardenPermissions(wardenId) {
  const allPerms = getFromStorage(PERMISSIONS_STORAGE_KEY, INITIAL_WARDEN_PERMISSIONS);
  const perms = allPerms[wardenId] || INITIAL_WARDEN_PERMISSIONS[wardenId] || { ...DEFAULT_WARDEN_PERMISSIONS };
  const suspended = isWardenSuspended(wardenId);

  if (suspended) {
    // When suspended by admin, warden is UNABLE to perform any mutating work in CMS
    // (take attendance, gate approval, leave approval, room transfers, indents, etc.)
    // Only view / show is permitted ("only show all the things")
    return {
      ...perms,
      isSuspended: true,
      viewHostelRecords: true,
      viewRoomAllocations: true,
      viewReports: true,
      manageAttendance: false,
      submitAttendance: false,
      manageRoomAllocations: false,
      reviewStudentLeaves: false,
      approveOperationalRequests: false,
      manageGatePasses: false,
      registerVisitors: false,
      recordDisciplinaryIncidents: false,
      manageComplaints: false,
      createInventoryRequisitions: false,
      manageStaffDutyRosters: false,
      exportReports: false,
      editHostelConfiguration: false
    };
  }

  return {
    ...perms,
    isSuspended: false
  };
}

export function syncPermissionsFromBackend() {
  if (typeof api !== 'undefined' && api.getAllWardenPermissions) {
    api.getAllWardenPermissions()
      .then((res) => {
        if (res && res.data && res.data.wardenPermissions) {
          const current = getFromStorage(PERMISSIONS_STORAGE_KEY, {});
          const merged = { ...current, ...res.data.wardenPermissions };
          setToStorage(PERMISSIONS_STORAGE_KEY, merged);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('bput_warden_permissions_changed', { detail: { wardenId: 'SYNC', permissions: merged } }));
            window.dispatchEvent(new Event('storage'));
          }
        }
      })
      .catch((err) => {
        console.warn('Backend permissions sync fallback:', err?.message || err);
      });
  }
}

export function getWardenIdFromAccount(account) {
  if (!account) return 'WRD-101';
  const role = (account.role || '').toLowerCase();
  if (role === 'student' || role === 'faculty' || role === 'admin') {
    return null;
  }
  // Check by official warden name first
  const name = (account.name || '').toLowerCase();
  if (name.includes('rajesh') || name.includes('jena')) return 'WRD-101';
  if (name.includes('nibedita') || name.includes('das')) return 'WRD-102';
  if (name.includes('tanmaya') || name.includes('routray')) return 'WRD-103';
  if (name.includes('swapna') || name.includes('patra')) return 'WRD-104';
  if (name.includes('debendra') || name.includes('sahoo')) return 'WRD-105';
  if (name.includes('bipin') || name.includes('sethi')) return 'WRD-106';

  // Normalize legacy demo identities
  const rawId = String(account.identity || account.id || account.employeeId || '');
  if (rawId === 'WRD-001' || rawId === 'WRD-ADM-01') return 'WRD-101';
  if (rawId === 'WRD-004' || rawId === 'WRD-002') return 'WRD-102';
  if (rawId === 'WRD-003') return 'WRD-103';
  if (rawId.startsWith('WRD-10')) return rawId;
  if (account.identity && account.identity.startsWith('WRD-')) return account.identity;
  if (role === 'warden') return 'WRD-101';
  return null;
}

export const getActiveWardenId = getWardenIdFromAccount;

export function applyPermissionsToAllWardens(newPermissions, reason = 'Global permissions applied to all hostel wardens', syncBackend = true) {
  const allPerms = getFromStorage(PERMISSIONS_STORAGE_KEY, INITIAL_WARDEN_PERMISSIONS);
  const wardens = getAllWardens();

  wardens.forEach((w) => {
    const prev = allPerms[w.id] || INITIAL_WARDEN_PERMISSIONS[w.id] || { ...DEFAULT_WARDEN_PERMISSIONS };
    allPerms[w.id] = { ...prev, ...newPermissions };
  });

  setToStorage(PERMISSIONS_STORAGE_KEY, allPerms);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_warden_permissions_changed', { detail: { wardenId: 'ALL', permissions: allPerms } }));
    window.dispatchEvent(new Event('storage'));
  }

  // Sync to Backend
  if (syncBackend && typeof api !== 'undefined' && api.applyWardenPermissionsToAll) {
    api.applyWardenPermissionsToAll(newPermissions).catch((err) => {
      console.warn('Backend applyWardenPermissionsToAll fallback:', err?.message || err);
    });
  }

  logAdminAction({
    action: 'WARDEN_PERMISSIONS_UPDATE',
    targetEntity: 'WardenPermissions',
    recordId: 'ALL_WARDENS',
    hostelScope: 'All Campus Hostels',
    previousValue: 'Mixed / Per-warden configuration',
    newValue: JSON.stringify(newPermissions),
    reason: reason,
  });

  return allPerms;
}

export function updateWardenPermissions(wardenId, newPermissions, reason = 'Administrative permission adjustment', applyToAll = false, syncBackend = true) {
  if (applyToAll) {
    return applyPermissionsToAllWardens(newPermissions, reason, syncBackend);
  }

  const allPerms = getFromStorage(PERMISSIONS_STORAGE_KEY, INITIAL_WARDEN_PERMISSIONS);
  const prevPerms = allPerms[wardenId] || INITIAL_WARDEN_PERMISSIONS[wardenId] || { ...DEFAULT_WARDEN_PERMISSIONS };
  const updatedPerms = { ...prevPerms, ...newPermissions };

  allPerms[wardenId] = updatedPerms;
  setToStorage(PERMISSIONS_STORAGE_KEY, allPerms);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_warden_permissions_changed', { detail: { wardenId, permissions: updatedPerms } }));
    window.dispatchEvent(new Event('storage'));
  }

  // Sync to Backend
  if (syncBackend && typeof api !== 'undefined' && api.updateWardenPermissions) {
    api.updateWardenPermissions(wardenId, updatedPerms, false).catch((err) => {
      console.warn('Backend updateWardenPermissions fallback:', err?.message || err);
    });
  }

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


// ----------------------------------------------------
// 6. WARDEN OPERATIONAL PENDING TASKS & DOCKETS
// ----------------------------------------------------
export const WARDEN_PENDING_TASKS_KEY = 'apna_hostel_warden_pending_tasks_v1';

export const INITIAL_WARDEN_PENDING_TASKS = {
  'WRD-101': [
    {
      id: 'TSK-101-1',
      docketNumber: 'GP-2026-4401',
      wardenId: 'WRD-101',
      wardenName: 'Mr. Rajesh Jena',
      hostelName: 'Gandhi Boys Residence',
      block: 'Block A (Rooms 101-220)',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Weekend Outstation Leave Pass — Cuttack Native Home',
      description: 'Request for weekend leave to visit parents. Faculty mentor verified. Parent consent authenticated via registered SMS OTP.',
      studentName: 'Rohan Mohanty',
      studentRoll: '2301105012',
      studentRoom: 'Room 104-B',
      studentPhone: '+91 98612 34011',
      studentDepartment: 'B.Tech CSE (3rd Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94371 88920 (Father)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 09:15 AM',
      dueTime: '2026-10-28 06:00 PM',
      history: [
        {
          status: 'Submitted',
          updatedBy: 'Rohan Mohanty (Student)',
          role: 'STUDENT',
          timestamp: '2026-10-28 09:15 AM',
          remarks: 'Submitted via Student Portal.'
        },
        {
          status: 'Mentor Endorsed',
          updatedBy: 'Dr. S. K. Nayak (Faculty Mentor)',
          role: 'FACULTY',
          timestamp: '2026-10-28 10:30 AM',
          remarks: 'Academic attendance > 85%, endorsed for warden sanction.'
        }
      ]
    },
    {
      id: 'TSK-101-2',
      docketNumber: 'CMP-HST-881',
      wardenId: 'WRD-101',
      wardenName: 'Mr. Rajesh Jena',
      hostelName: 'Gandhi Boys Residence',
      block: 'Block B (Rooms 201-320)',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Electrical Short & Spark in Switchboard (Room 218)',
      description: 'Heavy sparking observed during laptop charging. Main circuit breaker tripped in Block B second floor.',
      studentName: 'Soumya Ranjan Sahoo',
      studentRoll: '2201105108',
      studentRoom: 'Room 218',
      studentPhone: '+91 97780 23145',
      studentDepartment: 'B.Tech Electrical (5th Sem)',
      priority: 'Critical',
      status: 'In Progress',
      assignedStaff: 'Manoj Pradhan (Electrician)',
      createdAt: '2026-10-28 07:45 AM',
      dueTime: '2026-10-28 01:00 PM',
      remarks: 'Electrician dispatched with spare 16A modular switch and MCB.',
      history: [
        {
          status: 'Reported',
          updatedBy: 'Soumya Ranjan Sahoo',
          role: 'STUDENT',
          timestamp: '2026-10-28 07:45 AM',
          remarks: 'Urgent electrical hazard reported.'
        },
        {
          status: 'In Progress',
          updatedBy: 'Mr. Rajesh Jena (Warden)',
          role: 'WARDEN',
          timestamp: '2026-10-28 08:20 AM',
          remarks: 'Assigned to campus electrical maintenance team.'
        }
      ]
    },
    {
      id: 'TSK-101-3',
      docketNumber: 'NRC-FLG-339',
      wardenId: 'WRD-101',
      wardenName: 'Mr. Rajesh Jena',
      hostelName: 'Gandhi Boys Residence',
      block: 'Block A (Rooms 101-220)',
      category: 'Curfew & Night Roll Call',
      taskType: 'night_curfew',
      title: 'Curfew Late Return Verification — Biswajit Behera',
      description: 'Student entered hostel gate at 09:42 PM (curfew cutoff 09:30 PM). Gate security recorded delayed biometric punch. Requires warden justification note.',
      studentName: 'Biswajit Behera',
      studentRoll: '2301105099',
      studentRoom: 'Room 112',
      studentPhone: '+91 94380 44521',
      studentDepartment: 'B.Tech Mechanical (3rd Sem)',
      parentConsentVerified: false,
      priority: 'Medium',
      status: 'Pending Verification',
      createdAt: '2026-10-27 10:15 PM',
      dueTime: '2026-10-28 12:00 PM',
      history: [
        {
          status: 'Flagged by Security',
          updatedBy: 'Security Guard Gate 2',
          role: 'SECURITY',
          timestamp: '2026-10-27 10:15 PM',
          remarks: 'Logged late entry with security log book entry #412.'
        }
      ]
    }
  ],

  'WRD-102': [
    {
      id: 'TSK-102-1',
      docketNumber: 'GP-2026-3890',
      wardenId: 'WRD-102',
      wardenName: 'Mrs. Nibedita Das',
      hostelName: 'Sarojini Girls Residence',
      block: 'Wing A (Floors 1-3)',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Extended Evening Library Research Pass (Till 09:30 PM)',
      description: 'Permission to access Central Library Autonomous Research wing for final year capstone thesis data collection. Faculty supervisor confirmed.',
      studentName: 'Ananya Priyadarshini',
      studentRoll: '2101105189',
      studentRoom: 'Wing A Room 205',
      studentPhone: '+91 94372 99012',
      studentDepartment: 'B.Tech CSE (7th Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94370 12345 (Mother)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 08:30 AM',
      dueTime: '2026-10-28 05:00 PM',
      history: [
        {
          status: 'Submitted',
          updatedBy: 'Ananya Priyadarshini',
          role: 'STUDENT',
          timestamp: '2026-10-28 08:30 AM',
          remarks: 'Special library curfew extension docket.'
        }
      ]
    }
  ],

  'WRD-103': [
    {
      id: 'TSK-103-1',
      docketNumber: 'RM-TRS-102',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Room Reallocation',
      taskType: 'room_transfer',
      title: 'Room Change Request: Room 108 to Room 312',
      description: 'Student requested mutual room swap with peer to join collaborative departmental project study room on 3rd floor.',
      studentName: 'Debashis Nayak',
      studentRoll: '2301105044',
      studentRoom: 'Room 108 (Floor 1)',
      studentPhone: '+91 98611 23098',
      studentDepartment: 'B.Tech ECE (3rd Sem)',
      priority: 'Medium',
      status: 'Awaiting Inspection',
      createdAt: '2026-10-27 02:20 PM',
      dueTime: '2026-10-29 05:00 PM',
      history: [
        {
          status: 'Initiated',
          updatedBy: 'Debashis Nayak',
          role: 'STUDENT',
          timestamp: '2026-10-27 02:20 PM',
          remarks: 'Form submitted with mutual consent declaration.'
        }
      ]
    },
    {
      id: 'TSK-103-2',
      docketNumber: 'CMP-HST-912',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'RO Water Cooler Filter Overflow & Choke (Floor 2)',
      description: 'Drinking water dispenser drainage blocked, causing water accumulation on corridor floor. Requires plumber and sanitization.',
      studentName: 'Subrat Kumar Sahoo',
      studentRoll: '2401105021',
      studentRoom: 'Room 206',
      studentPhone: '+91 97782 11099',
      studentDepartment: 'B.Tech Civil (1st Sem)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 06:40 AM',
      dueTime: '2026-10-28 02:00 PM',
      history: [
        {
          status: 'Logged',
          updatedBy: 'Subrat Kumar Sahoo',
          role: 'STUDENT',
          timestamp: '2026-10-28 06:40 AM',
          remarks: 'Water spill hazard in corridor.'
        }
      ]
    },
    {
      id: 'TSK-103-3',
      docketNumber: 'GP-2026-4488',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Emergency Medical Hospital Pass — Apollo Hospital BBSR',
      description: 'Student experiencing acute dental inflammation; scheduled consultant appointment at Apollo Clinic Bhubaneswar. Parent informed.',
      studentName: 'Subham Das',
      studentRoll: '2301105088',
      studentRoom: 'Room 215',
      studentPhone: '+91 94399 88123',
      studentDepartment: 'B.Tech Mechanical (3rd Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94371 44556',
      priority: 'Critical',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 10:10 AM',
      dueTime: '2026-10-28 12:30 PM',
      history: [
        {
          status: 'Medical Priority Pass',
          updatedBy: 'Campus Dispensary Doctor',
          role: 'DOCTOR',
          timestamp: '2026-10-28 10:10 AM',
          remarks: 'Dispensary referral issued.'
        }
      ]
    },
    {
      id: 'TSK-103-4',
      docketNumber: 'LV-HST-2026-081',
      wardenId: 'WRD-103',
      wardenName: 'Mr. Tanmaya Kumar Routray',
      hostelName: 'Bhabani Hostel-2',
      block: 'Main Block (Floors 1-3)',
      category: 'Staff & Indents',
      taskType: 'leave',
      title: 'Supervisor Casual Leave Endorsement & Duty Handover',
      description: 'Casual leave application for 30-31 Oct 2026 to attend urgent family function. Substitute arrangement endorsed by Mr. P. Mohapatra.',
      studentName: 'Mr. Tanmaya Kumar Routray (Self)',
      priority: 'Medium',
      status: 'Pending Approval',
      createdAt: '2026-10-26 10:30 AM',
      dueTime: '2026-10-29 04:00 PM',
      history: [
        {
          status: 'Submitted',
          updatedBy: 'Mr. Tanmaya Kumar Routray',
          role: 'STAFF',
          timestamp: '2026-10-26 10:30 AM',
          remarks: 'Awaiting Chief Warden / Hostel Admin sign-off.'
        }
      ]
    }
  ],

  'WRD-104': [
    {
      id: 'TSK-104-1',
      docketNumber: 'CMP-HST-934',
      wardenId: 'WRD-104',
      wardenName: 'Dr. Swapna Patra',
      hostelName: 'Sarojini Girls Residence',
      block: 'Wing B Extension (Floor 3)',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Water Geyser Heating Element Tripping MCB (3rd Floor Washroom)',
      description: 'Morning hot water geyser in common washroom not heating. Technician replaced coil, pending warden test inspection and sign-off.',
      studentName: 'Priyanka Samal',
      studentRoll: '2201105312',
      studentRoom: 'Room 304',
      studentPhone: '+91 94378 11200',
      studentDepartment: 'B.Tech IT (5th Sem)',
      priority: 'Medium',
      status: 'In Progress',
      assignedStaff: 'Kailash Sahoo (Plumbing/Electrical)',
      createdAt: '2026-10-27 05:40 PM',
      dueTime: '2026-10-28 02:00 PM',
      history: [
        {
          status: 'Repair Complete / Awaiting Warden Verification',
          updatedBy: 'Kailash Sahoo (Technician)',
          role: 'STAFF',
          timestamp: '2026-10-28 09:00 AM',
          remarks: 'Heating element replaced. Awaiting warden sign-off.'
        }
      ]
    },
    {
      id: 'TSK-104-2',
      docketNumber: 'NRC-FLG-345',
      wardenId: 'WRD-104',
      wardenName: 'Dr. Swapna Patra',
      hostelName: 'Sarojini Girls Residence',
      block: 'Wing B Extension (Floor 3)',
      category: 'Curfew & Night Roll Call',
      taskType: 'night_curfew',
      title: 'Medical Sick Room Reporting — Lipsa Rout',
      description: 'Student marked absent at 09:30 PM biometric curfew roll call due to fever rest in Campus Medical Center. Sick bay docket attached.',
      studentName: 'Lipsa Rout',
      studentRoll: '2301105155',
      studentRoom: 'Room 302',
      studentPhone: '+91 97781 44552',
      studentDepartment: 'B.Tech CSE (3rd Sem)',
      parentConsentVerified: true,
      priority: 'High',
      status: 'Pending Verification',
      createdAt: '2026-10-27 10:00 PM',
      dueTime: '2026-10-28 01:00 PM',
      history: [
        {
          status: 'Dispensary Rest Registered',
          updatedBy: 'Staff Nurse B. Senapati',
          role: 'MEDICAL',
          timestamp: '2026-10-27 10:00 PM',
          remarks: 'Student admitted for overnight observation.'
        }
      ]
    }
  ],

  'WRD-105': [
    {
      id: 'TSK-105-1',
      docketNumber: 'GP-2026-4510',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Gate Pass & Exit',
      taskType: 'gate_pass',
      title: 'Urgent Family Ceremony Leave — Balasore',
      description: 'Request for 2-day leave to attend elder sister marriage ceremony. Bus ticket and parent verification letter submitted.',
      studentName: 'Prakash Senapati',
      studentRoll: '2401105009',
      studentRoom: 'Room G-04',
      studentPhone: '+91 98614 77890',
      studentDepartment: 'B.Tech Civil (1st Sem)',
      parentConsentVerified: true,
      parentContact: '+91 94371 99882 (Father)',
      priority: 'High',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-28 07:15 AM',
      dueTime: '2026-10-28 04:00 PM',
      history: [
        {
          status: 'Applied',
          updatedBy: 'Prakash Senapati',
          role: 'STUDENT',
          timestamp: '2026-10-28 07:15 AM',
          remarks: 'Submitted with attached invitation card.'
        }
      ]
    },
    {
      id: 'TSK-105-2',
      docketNumber: 'CMP-HST-940',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Window Mosquito Mesh Net Torn (Room 102)',
      description: 'Mesh net damaged during heavy gust wind, causing insect nuisance at night. Carpenter requisition required.',
      studentName: 'Amitav Pradhan',
      studentRoll: '2401105033',
      studentRoom: 'Room 102',
      studentPhone: '+91 97788 12344',
      studentDepartment: 'B.Tech Electrical (1st Sem)',
      priority: 'Low',
      status: 'Pending Warden Approval',
      createdAt: '2026-10-27 04:10 PM',
      dueTime: '2026-10-29 05:00 PM',
      history: [
        {
          status: 'Reported',
          updatedBy: 'Amitav Pradhan',
          role: 'STUDENT',
          timestamp: '2026-10-27 04:10 PM',
          remarks: 'Routine carpentry fix needed.'
        }
      ]
    },
    {
      id: 'TSK-105-3',
      docketNumber: 'MSS-DKT-114',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Dining & Mess',
      taskType: 'mess',
      title: 'Mess Hall Sanitization & RO Water TDS Verification',
      description: 'Monthly hygiene compliance check and TDS meter calibration for Bhabani dining hall water filter.',
      studentName: 'Mess Committee Rep (Chandan Sethi)',
      priority: 'Medium',
      status: 'Under Inspection',
      createdAt: '2026-10-27 11:30 AM',
      dueTime: '2026-10-28 05:00 PM',
      history: [
        {
          status: 'Quality Audit Scheduled',
          updatedBy: 'Mess Committee',
          role: 'COMMITTEE',
          timestamp: '2026-10-27 11:30 AM',
          remarks: 'TDS tested at 145 ppm. Awaiting warden sign-off certificate.'
        }
      ]
    },
    {
      id: 'TSK-105-4',
      docketNumber: 'NRC-FLG-350',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Curfew & Night Roll Call',
      taskType: 'night_curfew',
      title: 'Inter-College Football Tournament Late Return Pass',
      description: 'Captain Alok Mishra returned at 10:10 PM with Physical Education Director permission slip following practice.',
      studentName: 'Alok Mishra',
      studentRoll: '2301105077',
      studentRoom: 'Room G-12',
      studentPhone: '+91 94391 22340',
      studentDepartment: 'B.Tech Mechanical (3rd Sem)',
      priority: 'Medium',
      status: 'Pending Verification',
      createdAt: '2026-10-27 10:15 PM',
      dueTime: '2026-10-28 02:00 PM',
      history: [
        {
          status: 'Sports Exemption Submitted',
          updatedBy: 'Director of Physical Education',
          role: 'STAFF',
          timestamp: '2026-10-27 10:15 PM',
          remarks: 'Sports training curfew relaxation.'
        }
      ]
    },
    {
      id: 'TSK-105-5',
      docketNumber: 'RM-CHK-204',
      wardenId: 'WRD-105',
      wardenName: 'Mr. Debendra Sahoo',
      hostelName: 'Bhabani Hostel-1',
      block: 'Ground & 1st Floor',
      category: 'Room Reallocation',
      taskType: 'room_transfer',
      title: 'Post-Renovation Room 106 Fixture Clearance & Handover',
      description: 'Room 106 whitewash, LED tubelight replacement, and wardrobe polishing completed. Requires supervisor handover sign-off before bed re-allotment.',
      studentName: 'Estate Maintenance Team',
      priority: 'Low',
      status: 'Awaiting Inspection',
      createdAt: '2026-10-28 09:30 AM',
      dueTime: '2026-10-29 01:00 PM',
      history: [
        {
          status: 'Maintenance Handover Ready',
          updatedBy: 'Estate Supervisor',
          role: 'ESTATE',
          timestamp: '2026-10-28 09:30 AM',
          remarks: 'Room vacant and ready for warden bed inspection.'
        }
      ]
    }
  ],

  'WRD-106': [
    {
      id: 'TSK-106-1',
      docketNumber: 'REQ-MNT-552',
      wardenId: 'WRD-106',
      wardenName: 'Mr. Bipin Sethi',
      hostelName: 'Central Hostel Complex (Relief Coverage)',
      block: 'Utility Core & Central Mess',
      category: 'Staff & Indents',
      taskType: 'complaint',
      title: 'Diesel Generator Backup Fuel Log Verification (500 KVA DG Set)',
      description: 'Log book fuel reconciliation for DG Set #2. 400 Litres diesel procured on 24-Oct; requires supervisory signature for billing clearance.',
      studentName: 'Generator Maintenance Tech (B. Swain)',
      priority: 'High',
      status: 'Pending Verification',
      createdAt: '2026-10-27 03:00 PM',
      dueTime: '2026-10-28 04:00 PM',
      history: [
        {
          status: 'Submitted for Audit',
          updatedBy: 'B. Swain (Estate)',
          role: 'ESTATE',
          timestamp: '2026-10-27 03:00 PM',
          remarks: 'Fuel slips and meter readings attached.'
        }
      ]
    },
    {
      id: 'TSK-106-2',
      docketNumber: 'CMP-HST-955',
      wardenId: 'WRD-106',
      wardenName: 'Mr. Bipin Sethi',
      hostelName: 'Central Hostel Complex (Relief Coverage)',
      block: 'Utility Core & Central Mess',
      category: 'Room Maintenance',
      taskType: 'complaint',
      title: 'Central Recreation Room DTH Cable Signal Glitch',
      description: 'Tata Sky set top box in main common recreation hall showing "No Signal (E48-32)". Cable line needs re-termination.',
      studentName: 'Recreation Club Secretary',
      priority: 'Low',
      status: 'In Progress',
      assignedStaff: 'Electronics Tech',
      createdAt: '2026-10-28 08:00 AM',
      dueTime: '2026-10-28 06:00 PM',
      history: [
        {
          status: 'Assigned',
          updatedBy: 'Mr. Bipin Sethi',
          role: 'WARDEN',
          timestamp: '2026-10-28 08:45 AM',
          remarks: 'Technician instructed to check LNB cable connector.'
        }
      ]
    }
  ],

  'WRD-107': []
};

const PENDING_STATUSES_SET = new Set([
  'Pending Warden Approval',
  'Awaiting Inspection',
  'Under Inspection',
  'In Progress',
  'Escalated to Admin',
  'Pending Verification',
  'Pending Approval',
  'Submitted'
]);

export function getAllWardenPendingTasksStore() {
  const stored = getFromStorage(WARDEN_PENDING_TASKS_KEY, null);
  if (stored && typeof stored === 'object') {
    return stored;
  }
  setToStorage(WARDEN_PENDING_TASKS_KEY, INITIAL_WARDEN_PENDING_TASKS);
  return INITIAL_WARDEN_PENDING_TASKS;
}

export function getWardenPendingTasksStore(wardenId, filter = {}) {
  const cleanId = String(wardenId || 'WRD-101').trim().toUpperCase();
  const allTasksMap = getAllWardenPendingTasksStore();

  let tasks = [];
  if (cleanId === 'ALL') {
    Object.values(allTasksMap).forEach(list => {
      if (Array.isArray(list)) tasks.push(...list);
    });
  } else {
    tasks = allTasksMap[cleanId] || [];
  }

  const total = tasks.length;
  const pending = tasks.filter(t => PENDING_STATUSES_SET.has(t.status)).length;
  const approved = tasks.filter(t => t.status === 'Approved').length;
  const resolved = tasks.filter(t => t.status === 'Resolved').length;
  const criticalOrHigh = tasks.filter(t => t.priority === 'Critical' || t.priority === 'High').length;

  let filtered = [...tasks];
  if (filter.status && filter.status !== 'ALL') {
    filtered = filtered.filter(t => t.status.toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.category && filter.category !== 'ALL') {
    filtered = filtered.filter(t => t.category.toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.priority && filter.priority !== 'ALL') {
    filtered = filtered.filter(t => t.priority.toLowerCase() === filter.priority.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    filtered = filtered.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.docketNumber && t.docketNumber.toLowerCase().includes(q)) ||
      (t.studentName && t.studentName.toLowerCase().includes(q)) ||
      (t.studentRoll && t.studentRoll.toLowerCase().includes(q)) ||
      (t.studentRoom && t.studentRoom.toLowerCase().includes(q))
    );
  }

  return {
    tasks: filtered,
    pendingCount: pending,
    summary: {
      total,
      pending,
      approved,
      resolved,
      criticalOrHigh,
    }
  };
}

export function updateWardenPendingTaskStatusStore(wardenId, taskId, updates, actor = 'Hostel Administrator') {
  const cleanId = String(wardenId).trim().toUpperCase();
  const allTasksMap = getAllWardenPendingTasksStore();

  let targetKey = cleanId;
  let task = null;

  if (allTasksMap[cleanId]) {
    task = allTasksMap[cleanId].find(t => t.id === taskId || t.docketNumber === taskId);
  }

  if (!task) {
    for (const [wId, list] of Object.entries(allTasksMap)) {
      const found = list.find(t => t.id === taskId || t.docketNumber === taskId);
      if (found) {
        task = found;
        targetKey = wId;
        break;
      }
    }
  }

  if (!task) return null;

  const prevStatus = task.status;
  task.status = updates.status;
  if (updates.remarks) task.remarks = updates.remarks;
  if (updates.resolutionNote) task.resolutionNote = updates.resolutionNote;

  if (!task.history) task.history = [];
  task.history.push({
    status: task.status,
    updatedBy: actor,
    role: 'ADMIN',
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    remarks: updates.remarks || updates.resolutionNote || `Status updated from ${prevStatus} to ${task.status}`
  });

  setToStorage(WARDEN_PENDING_TASKS_KEY, allTasksMap);

  // Recalculate pending tasks for this warden and update warden directory
  const currentPending = (allTasksMap[targetKey] || []).filter(t => PENDING_STATUSES_SET.has(t.status)).length;
  updateWardenPendingCountInDirectory(targetKey, currentPending);

  // Dispatch live update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apna_warden_tasks_updated', {
      detail: { wardenId: targetKey, taskId, newStatus: task.status, pendingCount: currentPending }
    }));
  }

  // Attempt backend synchronization
  api.updateWardenPendingTaskStatus(targetKey, taskId, updates).catch(err => {
    console.warn('Backend task status sync fallback:', err?.message || err);
  });

  return { task, pendingCount: currentPending };
}

export function batchActionWardenPendingTasksStore(wardenId, taskIds, action, remarks, actor = 'Hostel Administrator') {
  const results = [];
  let newStatus = 'Approved';
  if (action === 'approve') newStatus = 'Approved';
  else if (action === 'resolve') newStatus = 'Resolved';
  else if (action === 'escalate') newStatus = 'Escalated to Admin';
  else if (action === 'in_progress') newStatus = 'In Progress';
  else if (action === 'reject') newStatus = 'Rejected';

  taskIds.forEach(tid => {
    const res = updateWardenPendingTaskStatusStore(wardenId, tid, { status: newStatus, remarks }, actor);
    if (res) results.push(res.task);
  });

  const summary = getWardenPendingTasksStore(wardenId);
  return { updatedCount: results.length, tasks: results, pendingCount: summary.pendingCount };
}

export function updateWardenPendingCountInDirectory(wardenId, count) {
  const cleanId = String(wardenId).trim().toUpperCase();
  const wardens = getAllWardens();
  const idx = wardens.findIndex(w => (w.id || '').toUpperCase() === cleanId || (w.employeeId || '').toUpperCase() === cleanId);
  if (idx !== -1) {
    wardens[idx] = { ...wardens[idx], pendingTasks: count };
    setToStorage(WARDENS_STORAGE_KEY, wardens);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bput_wardens_updated', { detail: { wardens } }));
    }
  }
}

export async function syncWardenPendingTasksFromBackend(wardenId) {
  try {
    const res = await api.getWardenPendingTasks(wardenId);
    if (res && res.success && Array.isArray(res.data)) {
      const allTasksMap = getAllWardenPendingTasksStore();
      const cleanId = String(wardenId).trim().toUpperCase();
      allTasksMap[cleanId] = res.data;
      setToStorage(WARDEN_PENDING_TASKS_KEY, allTasksMap);
      if (typeof res.pendingCount === 'number') {
        updateWardenPendingCountInDirectory(cleanId, res.pendingCount);
      }
      return { tasks: res.data, pendingCount: res.pendingCount, summary: res.summary };
    }
  } catch (err) {
    console.warn('Backend sync for warden tasks fallback to local store:', err?.message || err);
  }
  return getWardenPendingTasksStore(wardenId);
}
