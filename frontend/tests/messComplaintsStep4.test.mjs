import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllMessComplaints,
  getStudentMessComplaints,
  submitMessComplaint,
  updateMessComplaintStatus,
  reopenMessComplaint,
  resetMessComplaintStore,
  saveLocalMessComplaints,
  MESS_COMPLAINT_CATEGORIES,
  MESS_COMPLAINT_STATUSES,
} from '../src/services/messComplaintStore.js';
import { notificationsStore } from '../src/services/notificationsStore.js';

// Polyfill localStorage in Node test runner
const memoryStorage = new Map();
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (k) => (memoryStorage.has(k) ? memoryStorage.get(k) : null),
    setItem: (k, v) => memoryStorage.set(k, String(v)),
    removeItem: (k) => memoryStorage.delete(k),
    clear: () => memoryStorage.clear(),
  };
}

// Track sent notifications across tests
const dispatchedNotifications = [];
const originalSend = notificationsStore.sendNotification.bind(notificationsStore);
notificationsStore.sendNotification = function(notif, roles) {
  dispatchedNotifications.push({ ...notif, targetRoles: roles || notif.targetRoles });
  return originalSend(notif, roles);
};

describe('STEP 4: Mess Complaints & Issues Integrated with Request Management Engine', () => {
  beforeEach(() => {
    resetMessComplaintStore();
  });

  it('exposes the 7 statutory mess complaint categories and 4 lifecycle statuses', () => {
    expect(MESS_COMPLAINT_CATEGORIES).toHaveLength(7);
    expect(MESS_COMPLAINT_CATEGORIES).toContain('Poor Food Quality');
    expect(MESS_COMPLAINT_CATEGORIES).toContain('Stale Food');
    expect(MESS_COMPLAINT_CATEGORIES).toContain('Hygiene Problems');
    expect(MESS_COMPLAINT_CATEGORIES).toContain('Insufficient Food Quantity');
    expect(MESS_COMPLAINT_CATEGORIES).toContain('Incorrect Menu');
    expect(MESS_COMPLAINT_CATEGORIES).toContain('Food Not Available');
    expect(MESS_COMPLAINT_CATEGORIES).toContain('Other Mess Issues');

    expect(MESS_COMPLAINT_STATUSES).toEqual(['Pending', 'In Progress', 'Resolved', 'Reopened']);
  });

  it('loads seeded mess complaints with tracking ID format MSC-2026-XXXX and complete audit trail', async () => {
    const complaints = await getAllMessComplaints();
    expect(complaints.length).toBeGreaterThanOrEqual(4);

    const first = complaints[0];
    expect(first.trackingId).toMatch(/^MSC-2026-\d{4}$/);
    expect(first.studentName).toBeDefined();
    expect(first.rollNumber).toBeDefined();
    expect(first.hostelName).toBeDefined();
    expect(first.mealType).toBeDefined();
    expect(first.category).toBeDefined();
    expect(first.statusHistory).toBeInstanceOf(Array);
    expect(first.statusHistory.length).toBeGreaterThanOrEqual(1);
  });

  it('rejects complaint submission for future meal dates', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 4);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await expect(
      submitMessComplaint({
        studentId: 'std-test-1',
        studentName: 'Subhasish Nayak',
        rollNumber: '2305209111',
        hostelName: 'Gandhi Boys Residence',
        mealDate: futureDateStr,
        mealType: 'Dinner',
        category: 'Poor Food Quality',
        title: 'Future meal test',
        description: 'Testing validation rejection for future dates',
      })
    ).rejects.toThrow(/Cannot report a mess issue for future dates/i);
  });

  it('rejects complaint submission with empty title or description', async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    await expect(
      submitMessComplaint({
        studentId: 'std-test-1',
        studentName: 'Subhasish Nayak',
        rollNumber: '2305209111',
        mealDate: todayStr,
        mealType: 'Lunch',
        category: 'Stale Food',
        title: '',
        description: 'Valid description',
      })
    ).rejects.toThrow(/Complaint title is required/i);

    await expect(
      submitMessComplaint({
        studentId: 'std-test-1',
        studentName: 'Subhasish Nayak',
        rollNumber: '2305209111',
        mealDate: todayStr,
        mealType: 'Lunch',
        category: 'Stale Food',
        title: 'Valid title',
        description: '   ',
      })
    ).rejects.toThrow(/Complaint description is required/i);
  });

  it('successfully logs a new student complaint and dispatches notification to Mess Manager', async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    const newTicket = await submitMessComplaint({
      studentId: 'std-test-99',
      studentName: 'Pooja Mohanty',
      rollNumber: '2305209999',
      studentPhone: '+91 94370 99999',
      hostelName: 'Sarojini Girls Residence (Block A)',
      roomNumber: '305',
      mealDate: todayStr,
      mealType: 'Lunch',
      category: 'Stale Food',
      title: 'Sour curd and stale cucumber in dining salad',
      description: 'The salad cucumber slices were dried out and the curd had developed a sharp sour odour.',
      attachmentUrl: 'https://example.com/stale_salad.jpg',
    });

    expect(newTicket.id).toBeDefined();
    expect(newTicket.trackingId).toMatch(/^MSC-2026-\d{4}$/);
    expect(newTicket.status).toBe('Pending');
    expect(newTicket.assignedManager).toBe('Mr. Kailash Chandra Nayak');
    expect(newTicket.attachmentUrl).toBe('https://example.com/stale_salad.jpg');
    expect(newTicket.statusHistory).toHaveLength(1);
    expect(newTicket.statusHistory[0].status).toBe('Pending');
    expect(newTicket.statusHistory[0].changedBy).toContain('Pooja Mohanty');

    // Verify it is retrievable by student roll number
    const studentList = await getStudentMessComplaints('2305209999');
    expect(studentList).toHaveLength(1);
    expect(studentList[0].trackingId).toBe(newTicket.trackingId);

    // Verify notification was dispatched to mess_manager
    const managerNotif = dispatchedNotifications.find(n => n.title.includes('Stale Food'));
    expect(managerNotif).toBeDefined();
    expect(managerNotif.message).toContain(newTicket.trackingId);
  });

  it('allows Mess Manager to update status to In Progress and add internal staff notes', async () => {
    const complaints = await getAllMessComplaints();
    const pendingTicket = complaints.find(c => c.status === 'Pending') || complaints[0];

    const updated = await updateMessComplaintStatus({
      id: pendingTicket.id,
      status: 'In Progress',
      internalNotes: 'Shift supervisor dispatched to inspect cold storage refrigeration temperature.',
      officerName: 'Mr. Kailash Chandra Nayak',
    });

    expect(updated.status).toBe('In Progress');
    expect(updated.internalNotes).toContain('refrigeration temperature');
    expect(updated.statusHistory[updated.statusHistory.length - 1].status).toBe('In Progress');
    expect(updated.statusHistory[updated.statusHistory.length - 1].changedBy).toContain('Mess Manager');
  });

  it('allows Mess Manager to resolve ticket with corrective statement, photographic evidence, and notifies student', async () => {
    const complaints = await getAllMessComplaints();
    const targetTicket = complaints[0];

    const resolved = await updateMessComplaintStatus({
      id: targetTicket.id,
      status: 'Resolved',
      internalNotes: 'Supplier audited. Vendor warned regarding produce batch freshness.',
      resolutionNote: 'Fresh replacement consignment accepted; salad chiller temperature stabilized at 4°C.',
      resolutionImageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
      officerName: 'Mr. Kailash Chandra Nayak',
    });

    expect(resolved.status).toBe('Resolved');
    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.resolutionNote).toContain('salad chiller temperature stabilized');
    expect(resolved.resolutionImageUrl).toContain('unsplash');

    // Verify student received high-priority resolution notification
    const studentNotif = dispatchedNotifications.find(n => n.title.includes('Resolved'));
    expect(studentNotif).toBeDefined();
    expect(studentNotif.message).toContain(targetTicket.title);
  });

  it('allows student to reopen an unresolved grievance with mandatory reason, recording audit history', async () => {
    // First ensure we have a resolved ticket
    const todayStr = new Date().toISOString().split('T')[0];
    const ticket = await submitMessComplaint({
      studentId: 'std-reopen-test',
      studentName: 'Bikram Keshari Rout',
      rollNumber: '2305207777',
      hostelName: 'Gandhi Boys Residence',
      mealDate: todayStr,
      mealType: 'Dinner',
      category: 'Insufficient Food Quantity',
      title: 'Rice finished early at 8:45 PM',
      description: 'Second rice container was completely empty.',
    });

    await updateMessComplaintStatus({
      id: ticket.id,
      status: 'Resolved',
      resolutionNote: 'Extra batch of steam rice prepared.',
    });

    // Student reopens ticket without reason -> fails
    await expect(
      reopenMessComplaint({
        id: ticket.id,
        reason: '   ',
        studentName: 'Bikram Keshari Rout',
      })
    ).rejects.toThrow(/Reason for reopening ticket is required/i);

    // Student reopens with reason
    const reopened = await reopenMessComplaint({
      id: ticket.id,
      reason: 'The replenishment batch took 40 minutes and students were forced to leave without eating.',
      studentName: 'Bikram Keshari Rout',
    });

    expect(reopened.status).toBe('Reopened');
    expect(reopened.reopenReason).toContain('40 minutes');
    expect(reopened.reopenedAt).toBeDefined();

    // Verify audit trail captured the reopening
    const lastHistory = reopened.statusHistory[reopened.statusHistory.length - 1];
    expect(lastHistory.status).toBe('Reopened');
    expect(lastHistory.changedBy).toContain('Bikram Keshari Rout (Student)');
    expect(lastHistory.remarks).toContain('40 minutes');

    // Verify notification was sent back to mess_manager for escalation
    const reopenNotif = dispatchedNotifications.find(n => n.title.includes('Reopened Mess Ticket'));
    expect(reopenNotif).toBeDefined();
    expect(reopenNotif.title + ' ' + reopenNotif.message).toContain(reopened.trackingId);
  });

  it('filters complaints by category, status, hostel, and text search', async () => {
    const all = await getAllMessComplaints();
    expect(all.length).toBeGreaterThanOrEqual(4);

    const staleOnly = await getAllMessComplaints({ category: 'Stale Food' });
    staleOnly.forEach(c => expect(c.category).toBe('Stale Food'));

    const resolvedOnly = await getAllMessComplaints({ status: 'Resolved' });
    resolvedOnly.forEach(c => expect(c.status).toBe('Resolved'));

    const searchResults = await getAllMessComplaints({ search: 'chapatis' });
    expect(searchResults.length).toBeGreaterThanOrEqual(1);
    expect(searchResults[0].description.toLowerCase() + searchResults[0].title.toLowerCase()).toContain('chapati');
  });
});
