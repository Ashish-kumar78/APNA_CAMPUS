// Service for Managing Hostel Student Resident Leaves (Overnight Outstation Leaves)
// Synchronizes leave status and rejection reasons between Warden Portal and Student Portal

import { mockLeaveApplications } from '../components/hostel/hostelData.js';

const STORAGE_KEY = 'bput_hostel_resident_leaves_v2';

export const INITIAL_RESIDENT_LEAVES = [
  {
    id: 'LV-2026-041',
    studentName: 'Sourav Mohanty',
    rollNumber: '2305200005',
    regNo: '2305200005',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '201',
    phone: '+91 98610 55443',
    startDate: '2026-10-18',
    endDate: '2026-10-22',
    days: 4,
    reason: "Sister's Wedding Ceremony at Berhampur",
    guardianName: 'B. C. Mohanty',
    guardianPhone: '+91 98610 88771',
    guardianStatus: 'Verified via Phone Call',
    status: 'Approved',
    appliedOn: '2026-10-15',
    returned: false,
    rejectionReason: '',
    rejectedBy: null,
    rejectedAt: null
  },
  {
    id: 'LV-2026-042',
    studentName: 'Amit Nayak',
    rollNumber: '2305200002',
    regNo: '2305200002',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '102',
    phone: '+91 98610 00222',
    startDate: '2026-10-20',
    endDate: '2026-10-24',
    days: 4,
    reason: 'Medical Checkup & Dental Procedure at AIIMS BBSR',
    guardianName: 'Nayak Senior',
    guardianPhone: '+91 98610 00222',
    guardianStatus: 'SMS Awaiting Confirmation',
    status: 'Rejected',
    appliedOn: '2026-10-18',
    returned: false,
    rejectionReason: 'Parent/Guardian telephonic consent could not be verified after 3 attempts by warden office.',
    rejectedBy: 'Mr. Rajesh Jena (Resident Warden)',
    rejectedAt: '19 Oct 2026, 11:30 AM'
  },
  {
    id: 'LV-2026-043',
    studentName: 'Ananya Mishra',
    rollNumber: '2305200008',
    regNo: '2305200008',
    hostelName: 'Sarojini Girls Residence',
    roomNumber: '101',
    phone: '+91 94371 88990',
    startDate: '2026-10-19',
    endDate: '2026-10-21',
    days: 2,
    reason: 'Hackathon Participation at NIT Rourkela',
    guardianName: 'S. K. Mishra',
    guardianPhone: '+91 94371 99001',
    guardianStatus: 'Faculty & Guardian Consent Letter Attached',
    status: 'Pending',
    appliedOn: '2026-10-17',
    returned: false,
    rejectionReason: '',
    rejectedBy: null,
    rejectedAt: null
  },
  {
    id: 'LV-2026-039',
    studentName: 'Rakesh Das',
    rollNumber: '2305200001',
    regNo: '2305201001',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '101',
    phone: '+91 94370 11999',
    startDate: '2026-10-10',
    endDate: '2026-10-13',
    days: 3,
    reason: 'Family Function in Cuttack',
    guardianName: 'D. Das',
    guardianPhone: '+91 94370 11888',
    guardianStatus: 'Verified',
    status: 'Approved',
    appliedOn: '2026-10-08',
    returned: true,
    rejectionReason: '',
    rejectedBy: null,
    rejectedAt: null
  },
  {
    id: 'LV-2026-038',
    studentName: 'Subrat Jena',
    rollNumber: '2305200012',
    regNo: '2305200012',
    hostelName: 'Kalam Boys Residence',
    roomNumber: '106',
    phone: '+91 98612 33445',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    days: 2,
    reason: 'Personal errands without guardian consent letter',
    guardianName: 'R. K. Jena',
    guardianPhone: '+91 98612 00112',
    guardianStatus: 'Guardian Disapproved',
    status: 'Rejected',
    appliedOn: '2026-10-03',
    returned: false,
    rejectionReason: 'Guardian explicitly disapproved overnight outstation travel during mid-semester review.',
    rejectedBy: 'Mr. Rajesh Jena (Resident Warden)',
    rejectedAt: '04 Oct 2026, 06:15 PM'
  }
];

function getStoredLeaves() {
  if (typeof window === 'undefined') return INITIAL_RESIDENT_LEAVES;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESIDENT_LEAVES));
    return INITIAL_RESIDENT_LEAVES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_RESIDENT_LEAVES;
  }
}

function saveStoredLeaves(leaves) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
    window.dispatchEvent(new CustomEvent('bput_hostel_leaves_updated', { detail: leaves }));
    window.dispatchEvent(new Event('storage'));
  }
}

export function getAllResidentLeaves() {
  return getStoredLeaves();
}

export function getResidentLeavesByStudent(studentIdentifier) {
  const all = getStoredLeaves();
  if (!studentIdentifier) return all;
  const query = String(studentIdentifier).trim().toLowerCase();

  return all.filter(l =>
    (l.rollNumber && l.rollNumber.toLowerCase().includes(query)) ||
    (l.regNo && l.regNo.toLowerCase().includes(query)) ||
    (l.studentName && l.studentName.toLowerCase().includes(query)) ||
    (query === '01' && (l.rollNumber === '2305200001' || l.studentName.toLowerCase().includes('rakesh'))) ||
    (query === '2305201001' && (l.rollNumber === '2305200001' || l.studentName.toLowerCase().includes('rakesh')))
  );
}

export function approveResidentLeave(leaveId, wardenName = 'Mr. Rajesh Jena (Resident Warden)') {
  const current = getStoredLeaves();
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updated = current.map(l => {
    if (l.id === leaveId) {
      return {
        ...l,
        status: 'Approved',
        returned: false,
        rejectionReason: '',
        approvedBy: wardenName,
        approvedAt: timeFormatted
      };
    }
    return l;
  });

  saveStoredLeaves(updated);
  return updated;
}

/**
 * Rejects a student leave application with a mandatory reason that is shown to the student
 */
export function rejectResidentLeave({
  leaveId,
  reason,
  rejectedBy = 'Mr. Rajesh Jena (Resident Warden)'
}) {
  const current = getStoredLeaves();
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
                        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const finalReason = (reason || '').trim() || 'Parent / Guardian telephonic consent could not be verified by hostel warden office.';

  const updated = current.map(l => {
    if (l.id === leaveId) {
      return {
        ...l,
        status: 'Rejected',
        rejectionReason: finalReason,
        rejectedBy,
        rejectedAt: timeFormatted
      };
    }
    return l;
  });

  saveStoredLeaves(updated);
  return updated;
}

export function markResidentReturned(leaveId) {
  const current = getStoredLeaves();
  const updated = current.map(l => {
    if (l.id === leaveId) {
      return { ...l, returned: true };
    }
    return l;
  });

  saveStoredLeaves(updated);
  return updated;
}

export function createResidentLeave({
  studentName = 'Rakesh Das',
  rollNumber = '2305200001',
  regNo = '2305201001',
  hostelName = 'Gandhi Boys Residence',
  roomNumber = '101',
  phone = '+91 94370 11999',
  startDate,
  endDate,
  days = 2,
  reason = 'Family Function & Outstation Home Visit',
  guardianName = 'D. Das',
  guardianPhone = '+91 94370 11888',
  guardianStatus = 'Consent Form Submitted Online'
}) {
  const current = getStoredLeaves();
  const seq = 44 + Math.floor(Math.random() * 50);
  const newId = `LV-2026-0${seq}`;
  const now = new Date();
  const appliedOn = now.toISOString().split('T')[0];

  const newLeave = {
    id: newId,
    studentName,
    rollNumber,
    regNo,
    hostelName,
    roomNumber,
    phone,
    startDate: startDate || appliedOn,
    endDate: endDate || appliedOn,
    days: Number(days) || 2,
    reason,
    guardianName,
    guardianPhone,
    guardianStatus,
    status: 'Pending',
    appliedOn,
    returned: false,
    rejectionReason: '',
    rejectedBy: null,
    rejectedAt: null
  };

  const updated = [newLeave, ...current];
  saveStoredLeaves(updated);
  return newLeave;
}

export function resetResidentLeavesToInitial() {
  saveStoredLeaves(INITIAL_RESIDENT_LEAVES);
  return INITIAL_RESIDENT_LEAVES;
}

