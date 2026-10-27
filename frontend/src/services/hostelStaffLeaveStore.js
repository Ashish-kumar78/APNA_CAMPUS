// Service for Managing Hostel Staff & Warden Leaves
// Synchronizes Leave Balances, Institutional Instructions & Admin Approvals

const STORAGE_KEY = 'bput_hostel_staff_leaves_v1';
const SUMMARY_STORAGE_KEY = 'bput_hostel_leave_summary_v1';

export const INITIAL_LEAVE_SUMMARY = {
  session: '2025 - 2026 Session',
  casualLeave: 7,           // Total allowed: 15
  earnedLeave: 10,          // Total allowed: 10 or half vacation
  extraOrdinaryLeave: 15,   // Clause-i: 15 days
  sickLeave: 30,            // Half pay: 30 days
  halfDayLeave: 4,          // 1/2 Day
  specialLeave: 10,         // Special: 10 days
  dutyOutsideCampus: 5,     // OD
  lwp: 0,                   // Leave Without Pay
  halfOd: 0,                // 1/2 OD
  compLeave: 2,             // Compensatory Leave
  workHome: 3               // Work from Home
};

export const INITIAL_LEAVE_APPLICATIONS = [
  {
    id: 'LV-HST-2026-081',
    applicantName: 'Mr. Tanmaya Kumar Routray',
    employeeId: 'EMP-HST-140',
    designation: 'Hostel Supervisor (Boys Residence)',
    department: 'Hostel Administration',
    leaveType: 'Casual Leave',
    startDate: '2026-10-30',
    endDate: '2026-10-31',
    days: 2,
    session: 'Full Day',
    reason: 'Attending family urgent domestic ceremony and parental health checkup at native village (Tangi, Cuttack).',
    alternativeArrangement: 'Mr. P. Mohanty (Hostel Supervisor Block B) will oversee evening biometric roll call and gate pass departures.',
    stationLeaving: 'Yes',
    contactAddress: 'At/PO - Tangi, Naya Sahi, Dist - Cuttack, Pin 754022',
    contactPhone: '+91 78730 08197',
    status: 'Pending Approval', // 'Pending Approval' | 'Approved by Hostel Admin' | 'Rejected by Hostel Admin'
    appliedOn: '2026-10-26 10:30 AM',
    approvedBy: null,
    approvedAt: null,
    adminRemarks: ''
  },
  {
    id: 'LV-HST-2026-079',
    applicantName: 'Mrs. Nibedita Das',
    employeeId: 'EMP-HST-2017-036',
    designation: 'Chief Resident Warden (Girls Residence)',
    department: 'Hostel Administration & Student Housing',
    leaveType: 'Special Leave',
    startDate: '2026-11-04',
    endDate: '2026-11-06',
    days: 3,
    session: 'Full Day',
    reason: 'Family wedding event in Cuttack (immediate relative marriage as per Special Leave Clause).',
    alternativeArrangement: 'Assistant Warden Dr. Swapna Patra will take charge of Sarojini Girls Residence operations & curfew management.',
    stationLeaving: 'Yes',
    contactAddress: 'Sector 6, CDA, Cuttack, Odisha',
    contactPhone: '+91 94370 00120',
    status: 'Pending Approval',
    appliedOn: '2026-10-25 04:15 PM',
    approvedBy: null,
    approvedAt: null,
    adminRemarks: ''
  },
  {
    id: 'LV-HST-2026-072',
    applicantName: 'Mr. Rajesh Jena',
    employeeId: 'EMP-HST-2019-014',
    designation: 'Assistant Warden (Gandhi Residence)',
    department: 'Hostel Administration',
    leaveType: 'Casual Leave',
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    days: 2,
    session: 'Full Day',
    reason: 'Doctor prescribed seasonal fever rest and viral care.',
    alternativeArrangement: 'Caretaker K. C. Pradhan was assigned evening register desk.',
    stationLeaving: 'No',
    contactAddress: 'Staff Quarters Type-B, Campus',
    contactPhone: '+91 98610 44551',
    status: 'Approved by Hostel Admin',
    appliedOn: '2026-10-10 09:00 AM',
    approvedBy: 'Hostel Admin & Principal Secretariat',
    approvedAt: '2026-10-11 11:20 AM',
    adminRemarks: 'Sanctioned under CL regulations. Handover verified with Caretaker.'
  },
  {
    id: 'LV-HST-2026-068',
    applicantName: 'Mr. Bimalendu Sahoo',
    employeeId: 'EMP-HST-2021-052',
    designation: 'Hostel Mess & Store Supervisor',
    department: 'Hostel Administration',
    leaveType: 'Earned Leave',
    startDate: '2026-09-18',
    endDate: '2026-09-22',
    days: 5,
    session: 'Full Day',
    reason: 'Personal travel without 7 days advance notice during session start.',
    alternativeArrangement: 'No alternative supervisor named.',
    stationLeaving: 'Yes',
    contactAddress: 'Puri Town, Odisha',
    contactPhone: '+91 94372 00119',
    status: 'Rejected by Hostel Admin',
    appliedOn: '2026-09-16 02:00 PM',
    approvedBy: 'Hostel Admin',
    approvedAt: '2026-09-17 10:00 AM',
    adminRemarks: 'Rejected: EL requires 1 week advance application and alternative arrangement proposal during active term.'
  }
];

export function getLeaveSummary() {
  try {
    const raw = localStorage.getItem(SUMMARY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading leave summary from storage', err);
  }
  return { ...INITIAL_LEAVE_SUMMARY };
}

export function saveLeaveSummary(summary) {
  try {
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary));
  } catch (err) {
    console.error('Failed saving leave summary to storage', err);
  }
}

export function getAllStaffLeaves() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading staff leaves from storage', err);
  }
  return [...INITIAL_LEAVE_APPLICATIONS];
}

export function saveStaffLeaves(leaves) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
  } catch (err) {
    console.error('Failed saving staff leaves to storage', err);
  }
}

export function applyStaffLeave(form) {
  const leaves = getAllStaffLeaves();
  const summary = getLeaveSummary();

  const newId = `LV-HST-2026-0${Math.floor(85 + Math.random() * 900)}`;
  const newApplication = {
    ...form,
    id: newId,
    status: 'Pending Approval',
    appliedOn: new Intl.DateTimeFormat('en-IN', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date()),
    approvedBy: null,
    approvedAt: null,
    adminRemarks: ''
  };

  const updatedLeaves = [newApplication, ...leaves];
  saveStaffLeaves(updatedLeaves);
  return { newApplication, updatedLeaves, summary };
}

export function approveStaffLeave(id, remarks = '', approverName = 'Hostel Admin') {
  const leaves = getAllStaffLeaves();
  const summary = getLeaveSummary();

  const target = leaves.find(l => l.id === id);
  if (!target) return { leaves, summary };

  const prevStatus = target.status;
  const days = Number(target.days) || 1;

  // Deduct from summary if not previously approved
  if (prevStatus !== 'Approved by Hostel Admin') {
    const type = target.leaveType;
    if (type.includes('Casual') && summary.casualLeave >= days) {
      summary.casualLeave -= days;
    } else if (type.includes('Earned') && summary.earnedLeave >= days) {
      summary.earnedLeave -= days;
    } else if (type.includes('Extra Ordinary') && summary.extraOrdinaryLeave >= days) {
      summary.extraOrdinaryLeave -= days;
    } else if (type.includes('Sick') && summary.sickLeave >= days) {
      summary.sickLeave -= days;
    } else if (type.includes('Special') && summary.specialLeave >= days) {
      summary.specialLeave -= days;
    } else if (type.includes('1/2 Day') && summary.halfDayLeave >= 1) {
      summary.halfDayLeave -= 1;
    } else if (type.includes('Comp') && summary.compLeave >= days) {
      summary.compLeave -= days;
    } else if (type.includes('Work Home') && summary.workHome >= days) {
      summary.workHome -= days;
    }
    saveLeaveSummary(summary);
  }

  const updatedLeaves = leaves.map(l => {
    if (l.id === id) {
      return {
        ...l,
        status: 'Approved by Hostel Admin',
        approvedBy: approverName,
        approvedAt: new Intl.DateTimeFormat('en-IN', {
          year: 'numeric', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }).format(new Date()),
        adminRemarks: remarks || 'Sanctioned by Hostel Administration as per institutional guidelines.'
      };
    }
    return l;
  });

  saveStaffLeaves(updatedLeaves);
  return { updatedLeaves, summary };
}

export function rejectStaffLeave(id, remarks = '', approverName = 'Hostel Admin') {
  const leaves = getAllStaffLeaves();
  const summary = getLeaveSummary();

  const updatedLeaves = leaves.map(l => {
    if (l.id === id) {
      return {
        ...l,
        status: 'Rejected by Hostel Admin',
        approvedBy: approverName,
        approvedAt: new Intl.DateTimeFormat('en-IN', {
          year: 'numeric', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }).format(new Date()),
        adminRemarks: remarks || 'Rejected by Hostel Administration due to institutional exigency or non-compliance.'
      };
    }
    return l;
  });

  saveStaffLeaves(updatedLeaves);
  return { updatedLeaves, summary };
}

export function resetStaffLeavesToDefaults() {
  saveStaffLeaves(INITIAL_LEAVE_APPLICATIONS);
  saveLeaveSummary(INITIAL_LEAVE_SUMMARY);
  return {
    leaves: INITIAL_LEAVE_APPLICATIONS,
    summary: INITIAL_LEAVE_SUMMARY
  };
}
