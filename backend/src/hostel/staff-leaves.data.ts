// Staff & Warden Leaves Data Store (Backend)
// Synchronizes leave sanctions, institutional balances, and live warden duty status

import { setWardenDutyStatusBackend } from './warden-profiles.data';

export interface StaffLeaveRecord {
  id: string;
  applicantName: string;
  employeeId: string;
  designation: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  session?: string;
  reason: string;
  alternativeArrangement?: string;
  stationLeaving?: string;
  contactAddress?: string;
  contactPhone?: string;
  status: 'Pending Approval' | 'Approved by Hostel Admin' | 'Rejected by Hostel Admin';
  appliedOn: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  adminRemarks?: string;
}

export const INITIAL_BACKEND_STAFF_LEAVES: StaffLeaveRecord[] = [
  {
    id: 'LV-HST-2026-081',
    applicantName: 'Mr. Tanmaya Kumar Routray',
    employeeId: 'WRD-103',
    designation: 'Hostel Supervisor (Boys Residence)',
    department: 'Hostel Administration',
    leaveType: 'Casual Leave',
    startDate: '2026-10-30',
    endDate: '2026-10-31',
    days: 2,
    session: 'Full Day',
    reason: 'Attending family urgent domestic ceremony and parental health checkup at native village (Tangi, Cuttack).',
    alternativeArrangement: 'Mr. P. Mohanty will oversee evening biometric roll call.',
    stationLeaving: 'Yes',
    contactAddress: 'At/PO - Tangi, Naya Sahi, Dist - Cuttack, Pin 754022',
    contactPhone: '+91 78730 08197',
    status: 'Pending Approval',
    appliedOn: '2026-10-26 10:30 AM',
    approvedBy: null,
    approvedAt: null,
    adminRemarks: ''
  },
  {
    id: 'LV-HST-2026-079',
    applicantName: 'Mrs. Nibedita Das',
    employeeId: 'WRD-102',
    designation: 'Chief Resident Warden (Girls Residence)',
    department: 'Hostel Administration & Student Housing',
    leaveType: 'Special Leave',
    startDate: '2026-11-04',
    endDate: '2026-11-06',
    days: 3,
    session: 'Full Day',
    reason: 'Family wedding event in Cuttack (immediate relative marriage as per Special Leave Clause).',
    alternativeArrangement: 'Assistant Warden Dr. Swapna Patra will take charge of Sarojini Girls Residence operations.',
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
    employeeId: 'WRD-101',
    designation: 'Chief Resident Warden (Boys)',
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
    applicantName: 'Mr. Arjun Pradhan',
    employeeId: 'STF-108',
    designation: 'Security Gate Sergeant',
    department: 'Hostel Security',
    leaveType: 'Casual Leave',
    startDate: '2026-11-01',
    endDate: '2026-11-03',
    days: 3,
    session: 'Night Shift',
    reason: 'Authorized rotational rest and family obligation.',
    alternativeArrangement: 'Relief Sergeant deployed at Gandhi Residence Gate.',
    stationLeaving: 'No',
    contactAddress: 'Bhubaneswar Gate Barracks',
    contactPhone: '+91 98614 77889',
    status: 'Approved by Hostel Admin',
    appliedOn: '2026-10-31 08:00 AM',
    approvedBy: 'Hostel Administrator',
    approvedAt: '2026-10-31 10:30 AM',
    adminRemarks: 'Sanctioned with relief guard replacement confirmed.'
  }
];

const staffLeavesCache = new Map<string, StaffLeaveRecord>();
INITIAL_BACKEND_STAFF_LEAVES.forEach(l => staffLeavesCache.set(l.id, { ...l }));

export function getAllStaffLeavesBackend(): StaffLeaveRecord[] {
  return Array.from(staffLeavesCache.values());
}

export function createStaffLeaveBackend(form: any): StaffLeaveRecord {
  const newId = form.id || `LV-HST-2026-0${Math.floor(85 + Math.random() * 900)}`;
  const record: StaffLeaveRecord = {
    id: newId,
    applicantName: form.applicantName || 'Hostel Staff',
    employeeId: form.employeeId || 'STAFF',
    designation: form.designation || 'Staff',
    department: form.department || 'Hostel Administration',
    leaveType: form.leaveType || 'Casual Leave',
    startDate: form.startDate || new Date().toISOString().split('T')[0],
    endDate: form.endDate || new Date().toISOString().split('T')[0],
    days: Number(form.days) || 1,
    session: form.session || 'Full Day',
    reason: form.reason || 'Official administrative leave request',
    alternativeArrangement: form.alternativeArrangement || 'Internal relief arrangement assigned',
    stationLeaving: form.stationLeaving || 'No',
    contactAddress: form.contactAddress || '',
    contactPhone: form.contactPhone || '',
    status: form.status || 'Pending Approval',
    appliedOn: form.appliedOn || new Date().toLocaleString('en-IN'),
    approvedBy: form.approvedBy || (form.status === 'Approved by Hostel Admin' ? 'Hostel Administrator' : null),
    approvedAt: form.approvedAt || (form.status === 'Approved by Hostel Admin' ? new Date().toISOString() : null),
    adminRemarks: form.adminRemarks || ''
  };

  staffLeavesCache.set(newId, record);

  // If created directly with Approved status, update warden dutyStatus
  if (record.status === 'Approved by Hostel Admin' && record.employeeId) {
    setWardenDutyStatusBackend(record.employeeId, 'On Leave');
  }

  return record;
}

export function updateStaffLeaveStatusBackend(
  id: string,
  status: 'Approved by Hostel Admin' | 'Rejected by Hostel Admin' | string,
  remarks: string = '',
  approvedBy: string = 'Hostel Administrator'
): StaffLeaveRecord | null {
  const existing = staffLeavesCache.get(id);
  if (!existing) return null;

  const normalizedStatus = status.includes('Approve')
    ? 'Approved by Hostel Admin'
    : 'Rejected by Hostel Admin';

  const updated: StaffLeaveRecord = {
    ...existing,
    status: normalizedStatus as any,
    approvedBy,
    approvedAt: new Date().toISOString(),
    adminRemarks: remarks || (normalizedStatus === 'Approved by Hostel Admin' ? 'Sanctioned by Hostel Administration.' : 'Rejected.')
  };

  staffLeavesCache.set(id, updated);

  // Automatically update warden duty status in profiles cache
  if (updated.employeeId) {
    if (normalizedStatus === 'Approved by Hostel Admin') {
      setWardenDutyStatusBackend(updated.employeeId, 'On Leave');
    } else {
      // Check if any other approved leave is currently active for this employee
      const hasOtherApproved = Array.from(staffLeavesCache.values()).some(
        l => l.id !== id && l.employeeId === updated.employeeId && l.status === 'Approved by Hostel Admin'
      );
      if (!hasOtherApproved) {
        setWardenDutyStatusBackend(updated.employeeId, 'On Duty');
      }
    }
  }

  return updated;
}

