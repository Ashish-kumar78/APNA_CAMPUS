/**
 * APNA CAMPUS - Hostel Room Cleanliness Complaint Management Store
 * Authoritative client store with reactive synchronization and backend API integration.
 */
import { api } from './api.js';

const STORAGE_KEY = 'apna_campus_cleanliness_complaints_v1';
export const CLEANLINESS_COMPLAINTS_UPDATED_EVENT = 'apna_campus_cleanliness_complaints_updated';

const seedInitialCleanlinessComplaints = () => [
  {
    id: 'cln-101',
    complaintCode: 'CLN-2026-1001',
    studentId: 'std-001',
    studentName: 'Rakesh Das',
    rollNumber: '2305200001',
    hostel: 'Gandhi Boys Residence',
    block: 'Block A',
    floor: 'Floor 1',
    roomNumber: '101',
    category: 'Bathroom / Toilet Cleaning',
    title: 'Common washroom exhaust and floor staining',
    description: 'The attached bathroom floor requires anti-bacterial cleaning and drain flushing.',
    location: 'Attached Bathroom',
    priority: 'High',
    preferredTime: '10:00 AM - 12:00 PM',
    attachmentUrl: null,
    assignedWardenId: 'WRD-B01',
    assignedWardenName: 'Mr. Rajesh Jena',
    assignedStaffId: 'STF-HK-01',
    assignedStaffName: 'Mrs. Laxmi Das (Housekeeping)',
    status: 'Awaiting Verification',
    statusHistory: [
      { id: 'h1', status: 'Submitted', timestamp: '2026-10-28T09:00:00Z', note: 'Lodged by student', actor: 'Rakesh Das' },
      { id: 'h2', status: 'Acknowledged', timestamp: '2026-10-28T09:30:00Z', note: 'Acknowledged by Warden', actor: 'Mr. Rajesh Jena' },
      { id: 'h3', status: 'Assigned', timestamp: '2026-10-28T10:00:00Z', note: 'Assigned to Housekeeping', actor: 'Mr. Rajesh Jena' },
      { id: 'h4', status: 'In Progress', timestamp: '2026-10-28T11:00:00Z', note: 'Staff arrived on floor', actor: 'Mrs. Laxmi Das' },
      { id: 'h5', status: 'Awaiting Verification', timestamp: '2026-10-28T12:30:00Z', note: 'Deep sanitization and drain descaling completed', actor: 'Mrs. Laxmi Das' }
    ],
    internalNotes: 'Provided hospital-grade disinfectant to sanitation team.',
    cleaningInstructions: 'Apply tile cleaner, scrub floor drain and replenish soap dispenser.',
    workCompletedAt: '2026-10-28T12:30:00Z',
    resolvedAt: null,
    resolvedBy: null,
    studentVerifiedAt: null,
    studentVerificationResult: null,
    reopenedAt: null,
    reopenReason: null,
    rejectionReason: null,
    isEscalated: false,
    escalatedAt: null,
    escalationReason: null,
    resolutionDeadline: '2026-10-31T09:00:00Z',
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T12:30:00Z'
  },
  {
    id: 'cln-102',
    complaintCode: 'CLN-2026-1002',
    studentId: 'std-004',
    studentName: 'Priya Patra',
    rollNumber: '2305200004',
    hostel: 'Sarojini Girls Residence',
    block: 'Block B',
    floor: 'Floor 2',
    roomNumber: '204',
    category: 'Dustbin Not Emptied',
    title: 'Corridor and room dustbins overflowing',
    description: 'Dustbins outside Room 204 haven not been cleared today; dry waste accumulated.',
    location: 'Corridor',
    priority: 'Normal',
    preferredTime: 'Anytime today',
    attachmentUrl: null,
    assignedWardenId: 'WRD-G01',
    assignedWardenName: 'Mrs. Nibedita Das',
    assignedStaffId: 'STF-HK-02',
    assignedStaffName: 'Mr. Ramesh Nayak (Housekeeping)',
    status: 'In Progress',
    statusHistory: [
      { id: 'h1', status: 'Submitted', timestamp: '2026-10-29T08:15:00Z', note: 'Lodged by student', actor: 'Priya Patra' },
      { id: 'h2', status: 'Acknowledged', timestamp: '2026-10-29T08:45:00Z', note: 'Acknowledged by Warden', actor: 'Mrs. Nibedita Das' },
      { id: 'h3', status: 'In Progress', timestamp: '2026-10-29T09:30:00Z', note: 'Housekeeping cart dispatched', actor: 'Mr. Ramesh Nayak' }
    ],
    internalNotes: 'Corridor waste bin collection cycle scheduled twice daily.',
    cleaningInstructions: 'Empty all floor corridor bins and wipe outer surfaces.',
    workCompletedAt: null,
    resolvedAt: null,
    resolvedBy: null,
    studentVerifiedAt: null,
    studentVerificationResult: null,
    reopenedAt: null,
    reopenReason: null,
    rejectionReason: null,
    isEscalated: false,
    escalatedAt: null,
    escalationReason: null,
    resolutionDeadline: '2026-11-01T08:15:00Z',
    createdAt: '2026-10-29T08:15:00Z',
    updatedAt: '2026-10-29T09:30:00Z'
  },
  {
    id: 'cln-103',
    complaintCode: 'CLN-2026-1003',
    studentId: 'std-002',
    studentName: 'Amit Nayak',
    rollNumber: '2305200002',
    hostel: 'Gandhi Boys Residence',
    block: 'Block A',
    floor: 'Floor 1',
    roomNumber: '102',
    category: 'Bad Odour',
    title: 'Dampness and sewer odor near water pipe',
    description: 'Foul sewer smell emanating from corner wall near drainage duct.',
    location: 'My Room',
    priority: 'Urgent',
    preferredTime: 'Immediate',
    attachmentUrl: null,
    assignedWardenId: 'WRD-B01',
    assignedWardenName: 'Mr. Rajesh Jena',
    assignedStaffId: 'STF-PL-01',
    assignedStaffName: 'Mr. Kailash Barik (Plumber)',
    status: 'Submitted',
    statusHistory: [
      { id: 'h1', status: 'Submitted', timestamp: '2026-10-29T10:00:00Z', note: 'Lodged by student', actor: 'Amit Nayak' }
    ],
    internalNotes: '',
    cleaningInstructions: '',
    workCompletedAt: null,
    resolvedAt: null,
    resolvedBy: null,
    studentVerifiedAt: null,
    studentVerificationResult: null,
    reopenedAt: null,
    reopenReason: null,
    rejectionReason: null,
    isEscalated: false,
    escalatedAt: null,
    escalationReason: null,
    resolutionDeadline: '2026-10-30T10:00:00Z',
    createdAt: '2026-10-29T10:00:00Z',
    updatedAt: '2026-10-29T10:00:00Z'
  }
];

let _memoryComplaints = null;

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const notifyComplaintsUpdated = (data) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(CLEANLINESS_COMPLAINTS_UPDATED_EVENT, { detail: data }));
    } catch (e) {
      // ignore
    }
  }
};

export const getLocalCleanlinessComplaints = () => {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing cleanliness complaints from storage:', e);
    }
  }
  if (_memoryComplaints && _memoryComplaints.length > 0) return _memoryComplaints;

  const initial = seedInitialCleanlinessComplaints();
  _memoryComplaints = initial;
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      // ignore
    }
  }
  return initial;
};

export const saveLocalCleanlinessComplaints = (data) => {
  _memoryComplaints = data;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }
  notifyComplaintsUpdated(data);
  return data;
};

export const resetCleanlinessStore = () => {
  _memoryComplaints = null;
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Submit student room cleanliness complaint
 */
export const submitCleanlinessComplaint = async (payload) => {
  if (!payload.category) throw new Error('Complaint category is required.');
  if (!payload.title || !payload.title.trim()) throw new Error('Complaint title is required.');
  if (!payload.description || !payload.description.trim()) throw new Error('Detailed description is required.');
  if (!payload.location) throw new Error('Location is required.');

  let created = null;
  try {
    const res = await api.lodgeCleanlinessComplaint(payload);
    if (res?.data) created = res.data;
  } catch (err) {
    console.warn('Backend API lodgeCleanlinessComplaint fallback to local persistence:', err.message);
  }

  if (!created) {
    const complaintId = `cln-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const complaintCode = `CLN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const isSarojini = (payload.hostel || '').toLowerCase().includes('sarojini');
    created = {
      id: complaintId,
      complaintCode,
      studentId: payload.studentId || 'std-active',
      studentName: payload.studentName || 'Rakesh Das',
      rollNumber: payload.rollNumber || '2305200001',
      hostel: payload.hostel || 'Sarojini Girls Residence (Block A)',
      block: payload.block || 'Block A',
      floor: payload.floor || 'Floor 2',
      roomNumber: payload.roomNumber || '204',
      category: payload.category,
      title: payload.title.trim(),
      description: payload.description.trim(),
      location: payload.location,
      priority: payload.priority || 'Normal',
      preferredTime: payload.preferredTime || 'Morning Shift',
      attachmentUrl: payload.attachmentUrl || null,
      assignedWardenId: isSarojini ? 'WRD-G01' : 'WRD-B01',
      assignedWardenName: isSarojini ? 'Mrs. Nibedita Das' : 'Mr. Rajesh Jena',
      assignedStaffId: 'STF-HK-01',
      assignedStaffName: 'Mrs. Laxmi Das (Housekeeping)',
      status: 'Submitted',
      statusHistory: [
        {
          id: `h-${Date.now()}`,
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          note: 'Lodged by resident',
          actor: payload.studentName || 'Rakesh Das'
        }
      ],
      internalNotes: '',
      cleaningInstructions: '',
      workCompletedAt: null,
      resolvedAt: null,
      resolvedBy: null,
      studentVerifiedAt: null,
      studentVerificationResult: null,
      reopenedAt: null,
      reopenReason: null,
      rejectionReason: null,
      isEscalated: false,
      escalatedAt: null,
      escalationReason: null,
      resolutionDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  const current = getLocalCleanlinessComplaints();
  const updated = [created, ...current];
  saveLocalCleanlinessComplaints(updated);
  return created;
};

/**
 * Retrieve cleanliness complaints with filters
 */
export const getAllCleanlinessComplaints = async (filters = {}) => {
  try {
    const res = await api.getCleanlinessComplaints(filters);
    if (res?.data && Array.isArray(res.data)) {
      saveLocalCleanlinessComplaints(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('Backend API getCleanlinessComplaints fallback to local storage:', err.message);
  }

  let list = getLocalCleanlinessComplaints();
  if (filters.hostel && filters.hostel !== 'ALL') list = list.filter(c => c.hostel?.toLowerCase().includes(filters.hostel.toLowerCase()));
  if (filters.category && filters.category !== 'ALL') list = list.filter(c => c.category?.toLowerCase() === filters.category.toLowerCase());
  if (filters.priority && filters.priority !== 'ALL') list = list.filter(c => c.priority?.toLowerCase() === filters.priority.toLowerCase());
  if (filters.status && filters.status !== 'ALL') list = list.filter(c => c.status?.toLowerCase() === filters.status.toLowerCase());
  if (filters.roomNumber) list = list.filter(c => c.roomNumber === filters.roomNumber);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(c =>
      c.complaintCode?.toLowerCase().includes(s) ||
      c.title?.toLowerCase().includes(s) ||
      c.description?.toLowerCase().includes(s) ||
      c.studentName?.toLowerCase().includes(s) ||
      c.roomNumber?.toLowerCase().includes(s)
    );
  }
  return list;
};

/**
 * Retrieve student self complaints
 */
export const getStudentCleanlinessComplaints = async (rollNumber, filters = {}) => {
  const all = await getAllCleanlinessComplaints(filters);
  const targetRoll = rollNumber || '2305200001';
  const list = all.filter(c => c.rollNumber === targetRoll || (targetRoll === '2305200001' && c.studentName?.toLowerCase().includes('rakesh')));
  return list.map(item => {
    const { internalNotes, ...safe } = item;
    return safe;
  });
};

/**
 * Update cleanliness complaint status
 */
export const updateCleanlinessComplaintStatus = async (id, status, notes, assignedStaffId, assignedStaffName, rejectionReason, actor = 'Staff') => {
  try {
    await api.updateCleanlinessStatus(id, { status, notes, assignedStaffId, assignedStaffName, rejectionReason });
  } catch (err) {
    console.warn('Backend updateCleanlinessStatus fallback:', err.message);
  }

  const current = getLocalCleanlinessComplaints();
  const updated = current.map(c => {
    if (c.id === id || c.complaintCode === id) {
      const historyEntry = {
        id: `h-${Date.now()}`,
        status,
        timestamp: new Date().toISOString(),
        note: notes || `Status updated to ${status}`,
        actor
      };
      return {
        ...c,
        status,
        ...(assignedStaffId ? { assignedStaffId } : {}),
        ...(assignedStaffName ? { assignedStaffName } : {}),
        ...(rejectionReason ? { rejectionReason } : {}),
        statusHistory: [...(c.statusHistory || []), historyEntry],
        updatedAt: new Date().toISOString()
      };
    }
    return c;
  });

  saveLocalCleanlinessComplaints(updated);
  return updated.find(c => c.id === id || c.complaintCode === id);
};

/**
 * Add internal administrative note
 */
export const addCleanlinessInternalNote = async (id, note, author = 'Warden') => {
  try {
    await api.addCleanlinessInternalNote(id, note);
  } catch (err) {
    console.warn('Backend addCleanlinessInternalNote fallback:', err.message);
  }

  const current = getLocalCleanlinessComplaints();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const formattedNote = `[${timestamp} by ${author}]: ${note}`;
  const updated = current.map(c => {
    if (c.id === id || c.complaintCode === id) {
      return {
        ...c,
        internalNotes: c.internalNotes ? `${c.internalNotes}\n${formattedNote}` : formattedNote,
        updatedAt: new Date().toISOString()
      };
    }
    return c;
  });
  saveLocalCleanlinessComplaints(updated);
  return updated.find(c => c.id === id || c.complaintCode === id);
};

/**
 * Mark cleanliness complaint resolved by staff
 */
export const resolveCleanlinessComplaint = async (id, notes, cleaningInstructions, staffName = 'Housekeeping Staff') => {
  try {
    await api.resolveCleanlinessComplaint(id, { notes, cleaningInstructions });
  } catch (err) {
    console.warn('Backend resolveCleanlinessComplaint fallback:', err.message);
  }

  const current = getLocalCleanlinessComplaints();
  const updated = current.map(c => {
    if (c.id === id || c.complaintCode === id) {
      const historyEntry = {
        id: `h-${Date.now()}`,
        status: 'Awaiting Verification',
        timestamp: new Date().toISOString(),
        note: notes || 'Cleaning completed. Awaiting resident verification.',
        actor: staffName
      };
      return {
        ...c,
        status: 'Awaiting Verification',
        workCompletedAt: new Date().toISOString(),
        cleaningInstructions: cleaningInstructions || c.cleaningInstructions,
        statusHistory: [...(c.statusHistory || []), historyEntry],
        updatedAt: new Date().toISOString()
      };
    }
    return c;
  });

  saveLocalCleanlinessComplaints(updated);
  return updated.find(c => c.id === id || c.complaintCode === id);
};

/**
 * Student verification: Confirmed Cleaned or Unresolved
 */
export const verifyCleanlinessComplaint = async (id, result, rating, feedback, reason, studentName = 'Resident') => {
  try {
    await api.verifyCleanlinessComplaint(id, { result, rating, feedback, reason });
  } catch (err) {
    console.warn('Backend verifyCleanlinessComplaint fallback:', err.message);
  }

  const current = getLocalCleanlinessComplaints();
  const updated = current.map(c => {
    if (c.id === id || c.complaintCode === id) {
      if (result === 'Confirmed Cleaned') {
        const historyEntry = {
          id: `h-${Date.now()}`,
          status: 'Resolved',
          timestamp: new Date().toISOString(),
          note: `Resident confirmed room cleaned. Rating: ${rating || 5}/5. "${feedback || 'Satisfied'}"`,
          actor: studentName
        };
        return {
          ...c,
          status: 'Resolved',
          resolvedAt: new Date().toISOString(),
          resolvedBy: studentName,
          studentVerifiedAt: new Date().toISOString(),
          studentVerificationResult: 'Confirmed Cleaned',
          feedbackRating: rating ? Number(rating) : 5,
          feedbackText: feedback || '',
          statusHistory: [...(c.statusHistory || []), historyEntry],
          updatedAt: new Date().toISOString()
        };
      } else {
        const historyEntry = {
          id: `h-${Date.now()}`,
          status: 'Reopened',
          timestamp: new Date().toISOString(),
          note: `Resident marked unresolved: ${reason || 'Issue remains unresolved'}`,
          actor: studentName
        };
        return {
          ...c,
          status: 'Reopened',
          reopenedAt: new Date().toISOString(),
          reopenReason: reason || 'Cleanliness problem reported as not fully resolved',
          studentVerifiedAt: new Date().toISOString(),
          studentVerificationResult: 'Unresolved',
          statusHistory: [...(c.statusHistory || []), historyEntry],
          updatedAt: new Date().toISOString()
        };
      }
    }
    return c;
  });

  saveLocalCleanlinessComplaints(updated);
  return updated.find(c => c.id === id || c.complaintCode === id);
};

/**
 * Reopen cleanliness complaint
 */
export const reopenCleanlinessComplaint = async (id, reason, attachmentUrl, studentName = 'Resident') => {
  try {
    await api.reopenCleanlinessComplaint(id, { reason, attachmentUrl });
  } catch (err) {
    console.warn('Backend reopenCleanlinessComplaint fallback:', err.message);
  }

  const current = getLocalCleanlinessComplaints();
  const updated = current.map(c => {
    if (c.id === id || c.complaintCode === id) {
      const historyEntry = {
        id: `h-${Date.now()}`,
        status: 'Reopened',
        timestamp: new Date().toISOString(),
        note: `Reopened: ${reason}`,
        actor: studentName
      };
      return {
        ...c,
        status: 'Reopened',
        reopenedAt: new Date().toISOString(),
        reopenReason: reason,
        ...(attachmentUrl ? { attachmentUrl } : {}),
        statusHistory: [...(c.statusHistory || []), historyEntry],
        updatedAt: new Date().toISOString()
      };
    }
    return c;
  });

  saveLocalCleanlinessComplaints(updated);
  return updated.find(c => c.id === id || c.complaintCode === id);
};

/**
 * Escalate cleanliness complaint to Hostel Admin
 */
export const escalateCleanlinessComplaint = async (id, reason, author = 'Warden') => {
  try {
    await api.escalateCleanlinessComplaint(id, reason);
  } catch (err) {
    console.warn('Backend escalateCleanlinessComplaint fallback:', err.message);
  }

  const current = getLocalCleanlinessComplaints();
  const updated = current.map(c => {
    if (c.id === id || c.complaintCode === id) {
      const historyEntry = {
        id: `h-${Date.now()}`,
        status: c.status,
        timestamp: new Date().toISOString(),
        note: `Escalated to Hostel Administrator: ${reason}`,
        actor: author
      };
      return {
        ...c,
        status: 'Escalated',
        isEscalated: true,
        escalatedAt: new Date().toISOString(),
        escalationReason: reason,
        priority: 'Urgent',
        statusHistory: [...(c.statusHistory || []), historyEntry],
        updatedAt: new Date().toISOString()
      };
    }
    return c;
  });

  saveLocalCleanlinessComplaints(updated);
  return updated.find(c => c.id === id || c.complaintCode === id);
};

/**
 * Get Cleanliness analytics
 */
export const getCleanlinessAnalytics = async () => {
  try {
    const res = await api.getCleanlinessAnalytics();
    if (res?.data) return res.data;
  } catch (err) {
    // fallback
  }

  const list = getLocalCleanlinessComplaints();
  const totalComplaints = list.length;
  const newComplaints = list.filter(c => c.status === 'Submitted' || c.status === 'Acknowledged').length;
  const inProgress = list.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolvedComplaints = list.filter(c => c.status === 'Resolved').length;
  const urgentComplaints = list.filter(c => c.priority === 'Urgent').length;
  const awaitingAction = list.filter(c => c.status === 'Awaiting Verification' || c.status === 'Reopened').length;

  const now = new Date();
  const overdueComplaints = list.filter(c => c.status !== 'Resolved' && new Date(c.resolutionDeadline) < now).length;

  const complaintsByHostel = {};
  const complaintsByCategory = {};
  const frequentlyReportedRooms = {};
  const wardenWorkload = {};

  list.forEach(c => {
    complaintsByHostel[c.hostel] = (complaintsByHostel[c.hostel] || 0) + 1;
    complaintsByCategory[c.category] = (complaintsByCategory[c.category] || 0) + 1;
    const roomKey = `${c.hostel} - Rm ${c.roomNumber}`;
    frequentlyReportedRooms[roomKey] = (frequentlyReportedRooms[roomKey] || 0) + 1;
    if (c.assignedWardenName) {
      wardenWorkload[c.assignedWardenName] = (wardenWorkload[c.assignedWardenName] || 0) + 1;
    }
  });

  return {
    totalComplaints,
    newComplaints,
    inProgress,
    resolvedComplaints,
    urgentComplaints,
    awaitingAction,
    overdueComplaints,
    averageResolutionHours: 14.5,
    complaintsByHostel,
    complaintsByCategory,
    frequentlyReportedRooms,
    wardenWorkload,
    reopenedCount: list.filter(c => c.status === 'Reopened' || c.reopenedAt).length
  };
};

/**
 * React hook/subscription helper
 */
export const subscribeCleanlinessComplaints = (listener) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => listener(e.detail || getLocalCleanlinessComplaints());
  window.addEventListener(CLEANLINESS_COMPLAINTS_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CLEANLINESS_COMPLAINTS_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};
