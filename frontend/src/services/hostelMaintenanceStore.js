// Centralized Hostel Maintenance Complaints Store
// Provides unified persistence, cross-role synchronization (Student <-> Warden <-> Admin),
// SLA tracking, and status lifecycle progression.

import { api } from './api.js';

const STORAGE_KEY = 'bput_hostel_complaints_v1';

export const SEED_HOSTEL_COMPLAINTS = [
  {
    id: 'CMP-2026-381',
    studentName: 'Rakesh Das',
    rollNumber: '01',
    regNo: '2305201001',
    hostel: 'Sarojini Girls Residence (Block A)',
    roomNumber: '204',
    location: 'Room 204 Attached Bathroom',
    category: 'Plumbing',
    predictedCategory: 'plumbing',
    confidence: 0.92,
    needsReview: false,
    title: 'Water tap leaking continuously in bathroom',
    description: 'The bathroom wash basin tap is broken at the valve and dripping water constantly.',
    priority: 'High',
    status: 'In Progress',
    assignedStaffId: 'STF-PLUMB-01',
    assignedStaffName: 'Suresh Mahapatra',
    assignedStaffPhone: '+91 94379 11231',
    assignedStaffRole: 'Plumber & Water Works',
    assignedWardenId: 'WRD-G01',
    assignedWardenName: 'Mrs. Nibedita Das',
    assignedWardenContact: '+91 94370 33445',
    resolutionDeadline: new Date(Date.now() + 90 * 3600 * 1000).toISOString(),
    isEscalated: false,
    filedDate: '18 Oct 2026',
    resolutionNotes: 'Assigned to Suresh Mahapatra. Ceramic washer replacement scheduled for 11:30 AM.',
    statusHistory: [
      { id: 'h-381-1', status: 'Submitted', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: '2026-10-18T10:00:00Z', note: 'Complaint submitted by student. Auto-routed to Warden Mrs. Nibedita Das.' },
      { id: 'h-381-2', status: 'Assigned', changedBy: 'Mrs. Nibedita Das', role: 'WARDEN', timestamp: '2026-10-18T11:00:00Z', note: 'Approved by Warden Mrs. Nibedita Das. Auto-assigned to Suresh Mahapatra by workload.' },
      { id: 'h-381-3', status: 'In Progress', changedBy: 'Suresh Mahapatra', role: 'STAFF', timestamp: '2026-10-19T09:00:00Z', note: 'Assigned to Suresh Mahapatra. Ceramic washer replacement scheduled for 11:30 AM.' }
    ]
  },
  {
    id: 'CMP-2026-382',
    studentName: 'Rakesh Das',
    rollNumber: '01',
    regNo: '2305201001',
    hostel: 'Sarojini Girls Residence (Block A)',
    roomNumber: '204',
    location: 'Study Area Desk #03',
    category: 'Electrical',
    predictedCategory: 'electrical',
    confidence: 0.88,
    needsReview: false,
    title: 'Ceiling fan making screeching noise',
    description: 'The ceiling fan bearing has deteriorated and makes a loud squeaking sound on speed 4 and 5.',
    priority: 'Medium',
    status: 'Assigned',
    assignedStaffId: 'STF-ELEC-01',
    assignedStaffName: 'Pramod Panda',
    assignedStaffPhone: '+91 94370 99000',
    assignedStaffRole: 'Electrician & Power Maintenance',
    assignedWardenId: 'WRD-G01',
    assignedWardenName: 'Mrs. Nibedita Das',
    assignedWardenContact: '+91 94370 33445',
    resolutionDeadline: new Date(Date.now() + 68 * 3600 * 1000).toISOString(),
    isEscalated: false,
    filedDate: '19 Oct 2026',
    resolutionNotes: 'Allocated to Pramod Panda based on lowest existing electrical workload.',
    statusHistory: [
      { id: 'h-382-1', status: 'Submitted', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: '2026-10-19T09:00:00Z', note: 'Complaint submitted by student.' },
      { id: 'h-382-2', status: 'Assigned', changedBy: 'Mrs. Nibedita Das', role: 'WARDEN', timestamp: '2026-10-19T10:00:00Z', note: 'Approved by Warden Mrs. Nibedita Das. Allocated to Pramod Panda based on lowest existing electrical workload.' }
    ]
  },
  {
    id: 'CMP-2026-383',
    studentName: 'Rakesh Das',
    rollNumber: '01',
    regNo: '2305201001',
    hostel: 'Sarojini Girls Residence (Block A)',
    roomNumber: '204',
    location: 'Balcony Door Hinge',
    category: 'Civil',
    predictedCategory: 'civil',
    confidence: 0.84,
    needsReview: false,
    title: 'Balcony door latch loose and rattling',
    description: 'Metal latch bracket screws came loose in high winds and the latch rattles continuously.',
    priority: 'Medium',
    status: 'Awaiting Student Verification',
    assignedStaffId: 'STF-CARP-01',
    assignedStaffName: 'Manoj Kumar Barik',
    assignedStaffPhone: '+91 94379 77210',
    assignedStaffRole: 'Carpentry & Metal Works',
    assignedWardenId: 'WRD-G01',
    assignedWardenName: 'Mrs. Nibedita Das',
    assignedWardenContact: '+91 94370 33445',
    resolutionDeadline: new Date(Date.now() + 42 * 3600 * 1000).toISOString(),
    isEscalated: false,
    filedDate: '25 Oct 2026',
    resolutionNotes: 'Replaced anchor screws and aligned striker plate. Awaiting student verification.',
    statusHistory: [
      { id: 'h-383-1', status: 'Submitted', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: '2026-10-25T14:00:00Z', note: 'Complaint submitted.' },
      { id: 'h-383-2', status: 'Assigned', changedBy: 'Mrs. Nibedita Das', role: 'WARDEN', timestamp: '2026-10-25T14:30:00Z', note: 'Approved and assigned to Manoj Kumar Barik.' },
      { id: 'h-383-3', status: 'In Progress', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: '2026-10-26T10:00:00Z', note: 'Repair commenced.' },
      { id: 'h-383-4', status: 'Awaiting Student Verification', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: '2026-10-26T15:00:00Z', note: 'Replaced anchor screws and aligned striker plate. Awaiting student verification.' }
    ]
  }
];

export function getAllHostelComplaints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HOSTEL_COMPLAINTS));
      return SEED_HOSTEL_COMPLAINTS;
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HOSTEL_COMPLAINTS));
      return SEED_HOSTEL_COMPLAINTS;
    }
    // Ensure seed items exist if list has fewer
    const missingSeed = SEED_HOSTEL_COMPLAINTS.filter(s => !list.some(item => item.id === s.id));
    if (missingSeed.length > 0) {
      const merged = [...list, ...missingSeed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return list;
  } catch (e) {
    console.warn('Error reading hostel complaints from storage:', e);
    return SEED_HOSTEL_COMPLAINTS;
  }
}

export function saveHostelComplaints(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bput_hostel_complaints_updated', { detail: list }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.error('Error saving hostel complaints to storage:', e);
  }
}

export function getStudentComplaints(studentIdentifier) {
  const all = getAllHostelComplaints();
  if (!studentIdentifier) return all;
  const term = String(studentIdentifier).toLowerCase();
  const matched = all.filter(c => {
    const matchRoll = c.rollNumber && String(c.rollNumber).toLowerCase() === term;
    const matchReg = c.regNo && String(c.regNo).toLowerCase() === term;
    const matchName = c.studentName && c.studentName.toLowerCase().includes(term);
    return matchRoll || matchReg || matchName;
  });
  // If matched complaints exist, return them, else return default seed
  return matched.length > 0 ? matched : all;
}

export function lodgeStudentComplaint(data) {
  const timestamp = new Date().toISOString();
  const generatedId = data.id || `CMP-2026-${String(Math.floor(384 + Math.random() * 600))}`;
  const isGirls = (data.hostel || '').toLowerCase().includes('girls') || (data.hostel || '').toLowerCase().includes('sarojini');

  const newComplaint = {
    id: generatedId,
    studentName: data.studentName || 'Rakesh Das',
    rollNumber: data.rollNumber || '01',
    regNo: data.regNo || data.rollNumber || '2305201001',
    hostel: data.hostel || (isGirls ? 'Sarojini Girls Residence (Block A)' : 'Gandhi Boys Residence'),
    roomNumber: data.roomNumber || '204',
    location: data.location || `Room ${data.roomNumber || '204'} Area`,
    category: data.category || 'Plumbing',
    predictedCategory: (data.category || 'plumbing').toLowerCase(),
    confidence: data.confidence || 0.92,
    needsReview: Boolean(data.needsReview),
    title: data.title || 'Hostel Maintenance Request',
    description: data.description || '',
    priority: data.priority || 'Medium',
    status: 'Submitted', // Initial status requiring Warden approval
    assignedWardenId: isGirls ? 'WRD-G01' : 'WRD-B01',
    assignedWardenName: isGirls ? 'Mrs. Nibedita Das' : 'Mr. Rajesh Jena',
    assignedWardenContact: isGirls ? '+91 94370 33445' : '+91 94371 88990',
    assignedStaffId: null,
    assignedStaffName: null,
    assignedStaffPhone: null,
    assignedStaffRole: null,
    resolutionDeadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    isEscalated: false,
    filedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    resolutionNotes: 'Pending review and assignment by Resident Warden.',
    imageUrl: data.imageUrl || data.attachmentUrl || null,
    statusHistory: [
      {
        id: `hist-${Date.now()}-1`,
        status: 'Submitted',
        changedBy: data.studentName || 'Student',
        role: 'STUDENT',
        timestamp,
        note: `Complaint filed by student. Auto-routed to Warden ${isGirls ? 'Mrs. Nibedita Das' : 'Mr. Rajesh Jena'}. Pending approval.`
      }
    ]
  };

  const existing = getAllHostelComplaints();
  const updated = [newComplaint, ...existing.filter(c => c.id !== generatedId)];
  saveHostelComplaints(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bput_complaint_created', { detail: newComplaint }));
  }

  // Trigger backend API in background
  try {
    api.lodgeComplaint({
      ...data,
      id: generatedId,
      status: 'Submitted'
    }).catch(err => console.warn('Backend sync fallback for lodgeComplaint:', err));
  } catch (err) {
    console.warn('Backend error:', err);
  }

  return newComplaint;
}

export function approveComplaintByWarden(complaintId, wardenName = 'Mrs. Nibedita Das', customTechnician = null, customNotes = '') {
  const existing = getAllHostelComplaints();
  const timestamp = new Date().toISOString();

  const updated = existing.map(c => {
    if (c.id === complaintId) {
      const category = (c.category || '').toLowerCase();
      let staffName = 'Mr. Suresh Mahapatra';
      let staffRole = 'Plumber & Water Works';
      let staffPhone = '+91 94379 11231';

      if (category.includes('elect')) {
        staffName = 'Mr. Pramod Panda';
        staffRole = 'Electrician & Power Maintenance';
        staffPhone = '+91 94370 99000';
      } else if (category.includes('civil') || category.includes('carp')) {
        staffName = 'Mr. Manoj Kumar Barik';
        staffRole = 'Carpentry & Metal Works';
        staffPhone = '+91 94379 77210';
      } else if (category.includes('clean')) {
        staffName = 'Mr. Bipin Sethi';
        staffRole = 'Housekeeping Lead';
        staffPhone = '+91 94370 44556';
      }

      if (customTechnician?.name) {
        staffName = customTechnician.name;
        staffRole = customTechnician.role || staffRole;
        staffPhone = customTechnician.phone || staffPhone;
      }

      const note = customNotes || `Approved by Resident Warden ${wardenName}. Assigned to ${staffName} (${staffRole}). 72h resolution SLA active.`;

      const newHistory = [
        ...(c.statusHistory || []),
        {
          id: `hist-${Date.now()}`,
          status: 'Assigned',
          changedBy: wardenName,
          role: 'WARDEN',
          timestamp,
          note
        }
      ];

      return {
        ...c,
        status: 'Assigned',
        assignedStaffName: staffName,
        assignedStaffRole: staffRole,
        assignedStaffPhone: staffPhone,
        resolutionNotes: note,
        statusHistory: newHistory
      };
    }
    return c;
  });

  saveHostelComplaints(updated);

  // Sync with backend API
  try {
    api.updateComplaintStatus(complaintId, 'Assigned', customTechnician?.name || 'Assigned Technician', customNotes).catch(e => {
      console.warn('Backend updateComplaintStatus fallback:', e);
    });
  } catch (e) {}

  return updated.find(c => c.id === complaintId);
}

export function updateComplaintStatusInStore(complaintId, newStatus, changedBy = 'Resident Warden', role = 'WARDEN', notes = '') {
  const existing = getAllHostelComplaints();
  const timestamp = new Date().toISOString();

  const updated = existing.map(c => {
    if (c.id === complaintId) {
      const newHistory = [
        ...(c.statusHistory || []),
        {
          id: `hist-${Date.now()}`,
          status: newStatus,
          changedBy,
          role,
          timestamp,
          note: notes || `Status updated to ${newStatus} by ${changedBy}.`
        }
      ];
      return {
        ...c,
        status: newStatus,
        resolutionNotes: notes || c.resolutionNotes,
        statusHistory: newHistory
      };
    }
    return c;
  });

  saveHostelComplaints(updated);
  return updated.find(c => c.id === complaintId);
}

export function subscribeHostelComplaints(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    callback(getAllHostelComplaints());
  };

  window.addEventListener('bput_hostel_complaints_updated', handler);
  window.addEventListener('bput_complaint_created', handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('bput_hostel_complaints_updated', handler);
    window.removeEventListener('bput_complaint_created', handler);
    window.removeEventListener('storage', handler);
  };
}

