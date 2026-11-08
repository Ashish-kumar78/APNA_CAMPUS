/**
 * APNA_CAMPUS - Mess Complaint & Request Management Engine
 * Implements Fretbox BPUT Hackathon 2026 PS07 Mess Grievance Architecture
 * Reuses institutional Request Management Engine data structures & notificationsStore
 */

import { api } from './api.js';
import { notificationsStore } from './notificationsStore.js';

const STORAGE_KEY = 'apna_campus_mess_complaints_v1';
export const MESS_COMPLAINTS_UPDATED_EVENT = 'apna_campus_mess_complaints_updated';

// 7 Statutory Mess Grievance Categories defined in Hackathon PS07
export const MESS_COMPLAINT_CATEGORIES = [
  'Poor Food Quality',
  'Stale Food',
  'Hygiene Problems',
  'Insufficient Food Quantity',
  'Incorrect Menu',
  'Food Not Available',
  'Other Mess Issues',
];

export const MESS_COMPLAINT_STATUSES = [
  'Pending',
  'In Progress',
  'Resolved',
  'Reopened',
];

const seedInitialComplaints = () => [
  {
    id: 'msc-01',
    trackingId: 'MSC-2026-1041',
    studentId: 'std-002',
    studentName: 'Amit Nayak',
    rollNumber: '2305200002',
    studentPhone: '+91 94370 22002',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '102',
    mealDate: '2026-11-07',
    mealType: 'Lunch',
    category: 'Poor Food Quality',
    title: 'Excess salt and tough paneer in lunch curry',
    description: 'The paneer butter masala had excessive salt proportion and paneer cubes were slightly tough.',
    attachmentUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    assignedManager: 'Mr. Kailash Chandra Nayak',
    status: 'In Progress',
    internalNotes: '[2026-11-07 13:45 by Mr. Kailash Chandra Nayak]: Kitchen shift head instructed to calibrate seasoning ratio.',
    resolutionNote: '',
    resolutionImageUrl: null,
    submittedAt: '2026-11-07T13:15:00Z',
    updatedAt: '2026-11-07T13:45:00Z',
    statusHistory: [
      { status: 'Pending', changedBy: 'Amit Nayak (Student)', timestamp: '2026-11-07T13:15:00Z', remarks: 'Ticket logged via student portal' },
      { status: 'In Progress', changedBy: 'Mr. Kailash Chandra Nayak (Mess Manager)', timestamp: '2026-11-07T13:45:00Z', remarks: 'Assigned to second shift chef for investigation' },
    ],
  },
  {
    id: 'msc-02',
    trackingId: 'MSC-2026-1042',
    studentId: 'std-001',
    studentName: 'Rakesh Das',
    rollNumber: '2305200001',
    studentPhone: '+91 94370 22001',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '101',
    mealDate: '2026-11-06',
    mealType: 'Dinner',
    category: 'Insufficient Food Quantity',
    title: 'Chapati counter ran out before 9:15 PM',
    description: 'Second round of hot chapatis was delayed by 25 minutes causing a long queue in dining hall.',
    attachmentUrl: null,
    assignedManager: 'Mr. Kailash Chandra Nayak',
    status: 'Resolved',
    internalNotes: '[2026-11-06 21:40 by Mr. Kailash Chandra Nayak]: Dough batch preparation scheduled 30 mins earlier.',
    resolutionNote: 'Extra dough kneading machine calibrated; buffer quota increased by 50 chapatis for peak dining hours.',
    resolutionImageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
    resolvedAt: '2026-11-06T22:30:00Z',
    submittedAt: '2026-11-06T21:30:00Z',
    updatedAt: '2026-11-06T22:30:00Z',
    statusHistory: [
      { status: 'Pending', changedBy: 'Rakesh Das (Student)', timestamp: '2026-11-06T21:30:00Z', remarks: 'Grievance lodged' },
      { status: 'In Progress', changedBy: 'Mr. Kailash Chandra Nayak (Mess Manager)', timestamp: '2026-11-06T21:40:00Z', remarks: 'Night inventory audited' },
      { status: 'Resolved', changedBy: 'Mr. Kailash Chandra Nayak (Mess Manager)', timestamp: '2026-11-06T22:30:00Z', remarks: 'Buffer quota approved and implemented' },
    ],
  },
  {
    id: 'msc-03',
    trackingId: 'MSC-2026-1043',
    studentId: 'std-004',
    studentName: 'Priya Patra',
    rollNumber: '2305200004',
    studentPhone: '+91 94370 22004',
    hostelName: 'Sarojini Girls Residence',
    roomNumber: '204',
    mealDate: '2026-11-07',
    mealType: 'Breakfast',
    category: 'Hygiene Problems',
    title: 'Water dispenser drip tray overflowed in dining hall',
    description: 'RO water dispenser drainage tray was full and dripping on the tiled floor creating slipping hazard.',
    attachmentUrl: null,
    assignedManager: 'Mr. Kailash Chandra Nayak',
    status: 'Resolved',
    internalNotes: '[2026-11-07 09:00 by Mr. Kailash Chandra Nayak]: Janitorial staff assigned dedicated routine.',
    resolutionNote: 'Tray cleared and sanitization sweep scheduled every 2 hours during breakfast sessions.',
    resolutionImageUrl: null,
    resolvedAt: '2026-11-07T09:30:00Z',
    submittedAt: '2026-11-07T08:45:00Z',
    updatedAt: '2026-11-07T09:30:00Z',
    statusHistory: [
      { status: 'Pending', changedBy: 'Priya Patra (Student)', timestamp: '2026-11-07T08:45:00Z', remarks: 'Reported water spill hazard' },
      { status: 'Resolved', changedBy: 'Mr. Kailash Chandra Nayak (Mess Manager)', timestamp: '2026-11-07T09:30:00Z', remarks: 'Sanitization sweep performed' },
    ],
  },
  {
    id: 'msc-04',
    trackingId: 'MSC-2026-1044',
    studentId: 'std-005',
    studentName: 'Subhashree Sahoo',
    rollNumber: '2305200005',
    studentPhone: '+91 94370 22005',
    hostelName: 'Sarojini Girls Residence',
    roomNumber: '310',
    mealDate: '2026-11-05',
    mealType: 'Breakfast',
    category: 'Stale Food',
    title: 'Morning bread slices smelled sour and dry',
    description: 'The white bread provided at breakfast counter appeared old and had a slight sour smell.',
    attachmentUrl: null,
    assignedManager: 'Mr. Kailash Chandra Nayak',
    status: 'Resolved',
    internalNotes: '[2026-11-05 08:30 by Mr. Kailash Chandra Nayak]: Vendor delivery batch inspected.',
    resolutionNote: 'Discarded bakery crate #4; supplier issued formal quality warning with strict daily delivery inspection.',
    resolutionImageUrl: null,
    resolvedAt: '2026-11-05T09:15:00Z',
    submittedAt: '2026-11-05T08:15:00Z',
    updatedAt: '2026-11-05T09:15:00Z',
    statusHistory: [
      { status: 'Pending', changedBy: 'Subhashree Sahoo (Student)', timestamp: '2026-11-05T08:15:00Z', remarks: 'Bakery batch complaint' },
      { status: 'Resolved', changedBy: 'Mr. Kailash Chandra Nayak (Mess Manager)', timestamp: '2026-11-05T09:15:00Z', remarks: 'Supplier penalty issued' },
    ],
  },
  {
    id: 'msc-05',
    trackingId: 'MSC-2026-1045',
    studentId: 'std-007',
    studentName: 'Bikash Mohanty',
    rollNumber: '2305200007',
    studentPhone: '+91 94370 22007',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '208',
    mealDate: '2026-11-04',
    mealType: 'Breakfast',
    category: 'Incorrect Menu',
    title: 'Poha served instead of published Idli Sambar schedule',
    description: 'The published weekly menu indicated Idli & Medu Vada for Wednesday morning, but cold Poha was served.',
    attachmentUrl: null,
    assignedManager: 'Mr. Kailash Chandra Nayak',
    status: 'Pending',
    internalNotes: '',
    resolutionNote: '',
    resolutionImageUrl: null,
    submittedAt: '2026-11-04T08:30:00Z',
    updatedAt: '2026-11-04T08:30:00Z',
    statusHistory: [
      { status: 'Pending', changedBy: 'Bikash Mohanty (Student)', timestamp: '2026-11-04T08:30:00Z', remarks: 'Menu discrepancy logged' },
    ],
  },
  {
    id: 'msc-06',
    trackingId: 'MSC-2026-1046',
    studentId: 'std-008',
    studentName: 'Siddharth Jena',
    rollNumber: '2305200008',
    studentPhone: '+91 94370 22008',
    hostelName: 'Gandhi Boys Residence',
    roomNumber: '115',
    mealDate: '2026-11-06',
    mealType: 'Dinner',
    category: 'Food Not Available',
    title: 'Special curd counter closed 40 minutes early',
    description: 'Reached dining hall at 09:10 PM and was told curd and salad items were exhausted.',
    attachmentUrl: null,
    assignedManager: 'Mr. Kailash Chandra Nayak',
    status: 'Reopened',
    internalNotes: '[2026-11-07 10:00 by Mr. Kailash Chandra Nayak]: Student indicated same issue re-occurred on Friday.',
    resolutionNote: '',
    resolutionImageUrl: null,
    reopenedAt: '2026-11-07T09:45:00Z',
    reopenReason: 'Supervisor promised full service till 9:30 PM but Friday night curd ran out early again.',
    submittedAt: '2026-11-06T21:40:00Z',
    updatedAt: '2026-11-07T10:00:00Z',
    statusHistory: [
      { status: 'Pending', changedBy: 'Siddharth Jena (Student)', timestamp: '2026-11-06T21:40:00Z', remarks: 'Food stock shortage logged' },
      { status: 'Resolved', changedBy: 'Mr. Kailash Chandra Nayak (Mess Manager)', timestamp: '2026-11-06T22:15:00Z', remarks: 'Dining timing reiterated to counter staff' },
      { status: 'Reopened', changedBy: 'Siddharth Jena (Student)', timestamp: '2026-11-07T09:45:00Z', remarks: 'Recurrence on consecutive night' },
    ],
  },
];

let _memoryComplaints = null;

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    // Ignore storage errors in non-browser env
  }
  return null;
};

const notifyComplaintsUpdated = (data) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(MESS_COMPLAINTS_UPDATED_EVENT, { detail: data }));
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: STORAGE_KEY } }));
    } catch (e) {
      // Ignore dispatch errors
    }
  }
};

/**
 * Retrieve raw local complaints list
 */
export const getLocalMessComplaints = () => {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing mess complaints from storage:', e);
    }
  }
  if (_memoryComplaints && _memoryComplaints.length > 0) return _memoryComplaints;

  const initial = seedInitialComplaints();
  _memoryComplaints = initial;
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {}
  }
  return initial;
};

/**
 * Persist local complaints list
 */
export const saveLocalMessComplaints = (data) => {
  _memoryComplaints = data;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }
  notifyComplaintsUpdated(data);
  return data;
};

/**
 * Reset store (for testing)
 */
export const resetMessComplaintStore = () => {
  _memoryComplaints = null;
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
};

/**
 * Retrieve all complaints with optional filtering
 */
export const getAllMessComplaints = async (filters = {}) => {
  let list = getLocalMessComplaints();

  // Try background backend fetch
  try {
    const res = await api.getHostelComplaints('?category=Mess');
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      // Merge with local records
      const map = new Map();
      res.data.forEach(item => { if (item.id) map.set(item.id, item); });
      list.forEach(item => { if (item.id) map.set(item.id, { ...(map.get(item.id) || {}), ...item }); });
      list = Array.from(map.values());
      saveLocalMessComplaints(list);
    }
  } catch (e) {
    // Local fallback
  }

  // Multi-dimensional filtering
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(c => (c.status || '').toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.category && filters.category !== 'ALL') {
    list = list.filter(c => (c.category || '').toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.hostel && filters.hostel !== 'ALL') {
    list = list.filter(c => (c.hostelName || '').toLowerCase().includes(filters.hostel.toLowerCase()));
  }
  if (filters.mealType && filters.mealType !== 'ALL') {
    list = list.filter(c => (c.mealType || '').toLowerCase() === filters.mealType.toLowerCase());
  }
  if (filters.mealDate) {
    list = list.filter(c => c.mealDate === filters.mealDate);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(c =>
      (c.trackingId || '').toLowerCase().includes(q) ||
      (c.studentName || '').toLowerCase().includes(q) ||
      (c.rollNumber || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
};

/**
 * Retrieve complaints submitted by a specific student
 */
export const getStudentMessComplaints = async (rollNumber) => {
  const all = await getAllMessComplaints();
  const cleanRoll = (rollNumber || '').trim().toLowerCase();
  return all.filter(c => (c.rollNumber || '').toLowerCase() === cleanRoll);
};

/**
 * Submit a new mess complaint from Student Portal
 * Automatically dispatches notification to Mess Manager
 */
export const submitMessComplaint = async ({
  studentId = 'std-active',
  studentName = 'Aman Kumar Sharma',
  rollNumber = '2305201001',
  studentPhone = '+91 94370 11999',
  hostelName = 'Sarojini Girls Residence (Block A)',
  roomNumber = '204',
  mealDate = new Date().toISOString().split('T')[0],
  mealType = 'Lunch',
  category = 'Poor Food Quality',
  title = '',
  description = '',
  attachmentUrl = null,
}) => {
  if (!title?.trim()) throw new Error('Complaint title is required.');
  if (!description?.trim()) throw new Error('Complaint description is required.');

  const todayStr = new Date().toISOString().split('T')[0];
  if (mealDate > todayStr) {
    throw new Error('Cannot report a mess issue for future dates.');
  }

  const current = getLocalMessComplaints();
  const nextNum = 1040 + current.length + 1;
  const trackingId = `MSC-2026-${nextNum}`;
  const id = `msc-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newTicket = {
    id,
    trackingId,
    studentId,
    studentName,
    rollNumber,
    studentPhone,
    hostelName,
    roomNumber,
    mealDate,
    mealType,
    category,
    title: title.trim(),
    description: description.trim(),
    attachmentUrl,
    assignedManager: 'Mr. Kailash Chandra Nayak',
    status: 'Pending',
    internalNotes: '',
    resolutionNote: '',
    resolutionImageUrl: null,
    submittedAt: nowIso,
    updatedAt: nowIso,
    statusHistory: [
      {
        status: 'Pending',
        changedBy: `${studentName} (Student)`,
        timestamp: nowIso,
        remarks: 'Ticket lodged via Student Dining Portal',
      },
    ],
  };

  const updatedList = [newTicket, ...current];
  saveLocalMessComplaints(updatedList);

  // Background API Sync
  try {
    api.createHostelComplaint({
      studentName,
      rollNumber,
      hostel: hostelName,
      roomNumber,
      category: `Mess: ${category}`,
      title,
      description: `[Meal: ${mealType} on ${mealDate}] ${description}`,
      attachmentUrl,
      priority: category === 'Stale Food' || category === 'Hygiene Problems' ? 'High' : 'Medium',
    }).catch(err => console.warn('Backend createHostelComplaint sync fallback:', err.message));
  } catch (e) {}

  // Automated notification to Mess Manager via Request Management Engine
  try {
    notificationsStore.sendNotification(
      {
        title: `New Mess Grievance: ${category}`,
        message: `Student ${studentName} (${hostelName}, Room ${roomNumber}) reported an issue for ${mealType} on ${mealDate}: "${title}". Tracking ID: ${trackingId}`,
        category: 'Mess Grievance',
        priority: category === 'Stale Food' || category === 'Hygiene Problems' ? 'high' : 'normal',
        targetRole: 'mess_manager',
        senderRole: 'Student Portal',
        senderName: studentName,
      },
      ['mess_manager']
    );
  } catch (e) {
    console.warn('Notification dispatch fallback:', e);
  }

  return newTicket;
};

/**
 * Mess Manager updates complaint status, adds internal notes, and records resolution
 * Automatically dispatches notification to Student
 */
export const updateMessComplaintStatus = async ({
  id,
  status = 'In Progress',
  internalNotes = '',
  resolutionNote = '',
  resolutionImageUrl = null,
  officerName = 'Mr. Kailash Chandra Nayak',
}) => {
  const current = getLocalMessComplaints();
  const ticket = current.find(c => c.id === id || c.trackingId === id);
  if (!ticket) throw new Error(`Complaint ${id} not found.`);

  const nowIso = new Date().toISOString();
  const formattedTime = nowIso.replace('T', ' ').substring(0, 16);

  const updatedList = current.map(c => {
    if (c.id === id || c.trackingId === id) {
      const noteEntry = internalNotes?.trim()
        ? `[${formattedTime} by ${officerName}]: ${internalNotes.trim()}`
        : null;
      const combinedNotes = noteEntry
        ? (c.internalNotes ? `${c.internalNotes}\n${noteEntry}` : noteEntry)
        : c.internalNotes;

      const historyEntry = {
        status,
        changedBy: `${officerName} (Mess Manager)`,
        timestamp: nowIso,
        remarks: resolutionNote || internalNotes || `Status updated to ${status}`,
      };

      return {
        ...c,
        status,
        internalNotes: combinedNotes,
        resolutionNote: resolutionNote?.trim() || c.resolutionNote,
        resolutionImageUrl: resolutionImageUrl || c.resolutionImageUrl,
        resolvedAt: status === 'Resolved' ? nowIso : (status === 'Reopened' ? null : c.resolvedAt),
        updatedAt: nowIso,
        statusHistory: [...(c.statusHistory || []), historyEntry],
      };
    }
    return c;
  });

  saveLocalMessComplaints(updatedList);

  const updatedTicket = updatedList.find(c => c.id === id || c.trackingId === id);

  // Background API sync
  try {
    api.updateHostelComplaintStatus(id, {
      status,
      resolutionNotes: resolutionNote,
      assignedStaffName: officerName,
    }).catch(err => console.warn('Backend updateHostelComplaintStatus fallback:', err.message));
  } catch (e) {}

  // Automated notification to Student via Request Management Engine
  try {
    notificationsStore.sendNotification(
      {
        title: `Mess Grievance ${updatedTicket.trackingId}: ${status}`,
        message: status === 'Resolved'
          ? `Your mess grievance regarding "${updatedTicket.title}" has been marked RESOLVED by ${officerName}. Action: ${resolutionNote || 'Kitchen inspection completed.'}`
          : `Your mess grievance "${updatedTicket.title}" status is now ${status}. Officer: ${officerName}.`,
        category: 'Mess Grievance Resolution',
        priority: 'high',
        targetRole: 'student',
        targetUser: updatedTicket.rollNumber,
        senderRole: 'Chief Mess Manager',
        senderName: officerName,
      },
      ['student']
    );
  } catch (e) {
    console.warn('Student notification dispatch fallback:', e);
  }

  return updatedTicket;
};

/**
 * Student reopens an unresolved complaint
 */
export const reopenMessComplaint = async ({ id, reason = '', studentName = 'Student' }) => {
  if (!reason?.trim()) throw new Error('Reason for reopening ticket is required.');

  const current = getLocalMessComplaints();
  const ticket = current.find(c => c.id === id || c.trackingId === id);
  if (!ticket) throw new Error(`Complaint ${id} not found.`);

  const nowIso = new Date().toISOString();

  const updatedList = current.map(c => {
    if (c.id === id || c.trackingId === id) {
      const historyEntry = {
        status: 'Reopened',
        changedBy: `${studentName} (Student)`,
        timestamp: nowIso,
        remarks: `Student reopened ticket: ${reason.trim()}`,
      };
      return {
        ...c,
        status: 'Reopened',
        reopenedAt: nowIso,
        reopenReason: reason.trim(),
        updatedAt: nowIso,
        statusHistory: [...(c.statusHistory || []), historyEntry],
      };
    }
    return c;
  });

  saveLocalMessComplaints(updatedList);

  const updated = updatedList.find(c => c.id === id || c.trackingId === id);

  // Notify Mess Manager
  try {
    notificationsStore.sendNotification(
      {
        title: `Reopened Mess Ticket: ${updated.trackingId}`,
        message: `Student ${studentName} reopened ticket #${updated.trackingId} "${updated.title}". Reason: "${reason}". Immediate review required.`,
        category: 'Mess Grievance Escalation',
        priority: 'high',
        targetRole: 'mess_manager',
        senderRole: 'Student Portal',
        senderName: studentName,
      },
      ['mess_manager']
    );
  } catch (e) {}

  return updated;
};

/**
 * React hook / window subscription helper
 */
export const subscribeMessComplaints = (listener) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => listener(e.detail || getLocalMessComplaints());
  window.addEventListener(MESS_COMPLAINTS_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(MESS_COMPLAINTS_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};
