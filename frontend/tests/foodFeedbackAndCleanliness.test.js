import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllFoodFeedback,
  getStudentFoodFeedback,
  submitFoodFeedback,
  updateFoodFeedbackStatus,
  respondToFoodFeedback,
  addFoodFeedbackInternalNote,
  forwardFoodFeedbackToAdmin,
  getFoodFeedbackAnalytics,
  resetFoodFeedbackStore
} from '../src/services/hostelFoodStore.js';
import {
  getAllCleanlinessComplaints,
  getStudentCleanlinessComplaints,
  submitCleanlinessComplaint,
  updateCleanlinessComplaintStatus,
  addCleanlinessInternalNote,
  resolveCleanlinessComplaint,
  verifyCleanlinessComplaint,
  reopenCleanlinessComplaint,
  escalateCleanlinessComplaint,
  getCleanlinessAnalytics,
  resetCleanlinessStore
} from '../src/services/cleanlinessComplaintStore.js';

describe('Module 1: Food Feedback & Mess Review System', () => {
  beforeEach(() => {
    resetFoodFeedbackStore();
  });

  it('submits food feedback successfully with ratings and category', async () => {
    const today = new Date().toISOString().split('T')[0];
    const feedbackData = {
      mealDate: today,
      mealType: 'Lunch',
      foodQualityRating: 4,
      tasteRating: 5,
      foodTempRating: 4,
      hygieneRating: 5,
      quantity: 'Appropriate',
      category: 'Taste',
      comments: 'Paneer butter masala and rotis were fresh and warm.',
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042',
      hostelName: 'Sarojini Girls Residence'
    };

    const res = await submitFoodFeedback(feedbackData);
    expect(res).toBeDefined();
    expect(res.feedbackCode).toMatch(/^FFB-/);
    expect(res.status).toBe('Submitted');
    expect(res.overallRating).toBe(5);

    const list = await getStudentFoodFeedback('CS-2024-042');
    expect(list.some(f => f.id === res.id)).toBe(true);
  });

  it('prevents submission for future meal dates', async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    await expect(submitFoodFeedback({
      mealDate: tomorrow,
      mealType: 'Dinner',
      foodQualityRating: 3,
      tasteRating: 3,
      foodTempRating: 3,
      hygieneRating: 3,
      quantity: 'Appropriate',
      category: 'Taste',
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042'
    })).rejects.toThrow(/cannot submit feedback for future meals/i);
  });

  it('prevents duplicate feedback for the same student, meal date, and meal type', async () => {
    const today = new Date().toISOString().split('T')[0];
    const base = {
      mealDate: today,
      mealType: 'Breakfast',
      foodQualityRating: 4,
      tasteRating: 4,
      foodTempRating: 4,
      hygieneRating: 4,
      quantity: 'Appropriate',
      category: 'Taste',
      comments: 'Idli sambar was good.',
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042'
    };

    const first = await submitFoodFeedback(base);
    expect(first).toBeDefined();

    await expect(submitFoodFeedback(base)).rejects.toThrow(/already submitted feedback/i);
  });

  it('allows warden to respond and add corrective action', async () => {
    const today = new Date().toISOString().split('T')[0];
    const sub = await submitFoodFeedback({
      mealDate: today,
      mealType: 'Dinner',
      foodQualityRating: 2,
      tasteRating: 2,
      foodTempRating: 1,
      hygieneRating: 3,
      quantity: 'Too Little',
      category: 'Food Temperature',
      comments: 'Dinner was served cold after 9 PM.',
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042',
      hostelName: 'Sarojini Girls Residence'
    });

    const res = await respondToFoodFeedback(
      sub.id,
      'We have instructed catering vendor to keep warmer trays powered until 10:00 PM.',
      'Inspected mess warmer units and issued caution letter to vendor.',
      'Mrs. Nibedita Das'
    );

    expect(res).toBeDefined();
    expect(res.response).toMatch(/warmer trays/i);
    expect(res.correctiveAction).toMatch(/caution letter/i);
    expect(res.respondedBy).toBe('Mrs. Nibedita Das');
  });

  it('isolates internal administrative notes from student view', async () => {
    const today = new Date().toISOString().split('T')[0];
    const sub = await submitFoodFeedback({
      mealDate: today,
      mealType: 'Lunch',
      foodQualityRating: 3,
      tasteRating: 3,
      foodTempRating: 3,
      hygieneRating: 3,
      quantity: 'Appropriate',
      category: 'Hygiene',
      comments: 'Please ensure aprons are worn.',
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042'
    });

    await addFoodFeedbackInternalNote(
      sub.id,
      'INTERNAL NOTE: Third notice issued to vendor regarding staff apron compliance.',
      'Mrs. Nibedita Das'
    );

    // In student view:
    const studentList = await getStudentFoodFeedback('CS-2024-042');
    const target = studentList.find(f => f.id === sub.id);
    expect(target).toBeDefined();
    // Internal notes are stripped in student view
    expect(target.internalNotes).toBeUndefined();
  });

  it('calculates food feedback statistics and average ratings accurately', async () => {
    const stats = await getFoodFeedbackAnalytics();
    expect(stats.totalFeedback).toBeGreaterThan(0);
    expect(stats.averageRating).toBeGreaterThanOrEqual(1);
    expect(stats.averageRating).toBeLessThanOrEqual(5);
  });
});

describe('Module 2: Hostel Room Cleanliness Complaint Management System', () => {
  beforeEach(() => {
    resetCleanlinessStore();
  });

  it('submits a cleanliness complaint with automatic room details and ref code', async () => {
    const res = await submitCleanlinessComplaint({
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042',
      hostel: 'Sarojini Girls Residence',
      block: 'Block-B',
      floor: '2nd Floor',
      roomNumber: '204',
      category: 'Bathroom / Toilet Cleaning',
      title: 'Common bathroom water flush and floor cleaning',
      description: 'Flush valve leaking and floor needs phenyl scrub.',
      location: 'Common Bathroom',
      priority: 'High',
      preferredTime: 'Morning (09:00 - 11:00 AM)'
    });

    expect(res).toBeDefined();
    expect(res.complaintCode).toMatch(/^CLN-/);
    expect(res.status).toBe('Submitted');
    expect(res.roomNumber).toBe('204');
  });

  it('allows warden to assign housekeeping staff with instructions', async () => {
    const comp = await submitCleanlinessComplaint({
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042',
      hostel: 'Sarojini Girls Residence',
      block: 'Block-B',
      floor: '2nd Floor',
      roomNumber: '204',
      category: 'Room Cleaning',
      title: 'Dustbin not emptied and floor needs mop',
      description: 'Dustbin full and dust under study desk.',
      location: 'My Room',
      priority: 'Normal'
    });

    const assignRes = await updateCleanlinessComplaintStatus(
      comp.id,
      'Assigned',
      'Floor disinfection scheduled before noon.',
      'STF-HK-001',
      'Mrs. Manjulata Sahoo (Housekeeping Staff)',
      null,
      'Mrs. Nibedita Das (Hostel Warden)'
    );

    expect(assignRes).toBeDefined();
    expect(assignRes.status).toBe('Assigned');
    expect(assignRes.assignedStaffName).toBe('Mrs. Manjulata Sahoo (Housekeeping Staff)');
  });

  it('manages resolution and student verification workflow (Confirmed vs Reopened)', async () => {
    const comp = await submitCleanlinessComplaint({
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042',
      hostel: 'Sarojini Girls Residence',
      block: 'Block-B',
      floor: '2nd Floor',
      roomNumber: '204',
      category: 'Dirty Floor',
      title: 'Floor deep cleaning needed',
      description: 'Muddy floor after monsoon rain.',
      location: 'My Room',
      priority: 'Normal'
    });

    // Warden/Staff marks resolved
    const resolveRes = await resolveCleanlinessComplaint(
      comp.id,
      'Swept, mopped with disinfectant, and dried thoroughly.',
      'Maintain dry floor sign until completely dry.',
      'Mrs. Manjulata Sahoo'
    );

    expect(resolveRes).toBeDefined();
    expect(resolveRes.status).toBe('Awaiting Verification');

    // Case A: Student verifies as successfully resolved
    const verifyCleanRes = await verifyCleanlinessComplaint(
      comp.id,
      'Confirmed Cleaned',
      5,
      'Room is clean and smelling fresh now. Thank you!',
      null,
      'Subhashree Behera'
    );

    expect(verifyCleanRes).toBeDefined();
    expect(verifyCleanRes.status).toBe('Resolved');
    expect(verifyCleanRes.studentVerificationResult).toBe('Confirmed Cleaned');
  });

  it('reopens complaint if student reports issue remains unresolved', async () => {
    const comp = await submitCleanlinessComplaint({
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042',
      hostel: 'Sarojini Girls Residence',
      block: 'Block-B',
      floor: '2nd Floor',
      roomNumber: '204',
      category: 'Bad Odour',
      title: 'Persistent bad odour in room washbasin',
      description: 'Drain emitting bad smell.',
      location: 'Attached Bathroom',
      priority: 'High'
    });

    await resolveCleanlinessComplaint(
      comp.id,
      'Poured drain cleaner.',
      'Check drain flow in 30 mins.',
      'Housekeeping'
    );

    // Student reports issue is NOT resolved
    const reopenRes = await reopenCleanlinessComplaint(
      comp.id,
      'The odour is still there. Drain trap appears choked.',
      null,
      'Subhashree Behera'
    );

    expect(reopenRes).toBeDefined();
    expect(reopenRes.status).toBe('Reopened');
    expect(reopenRes.statusHistory.some(h => h.status === 'Reopened')).toBe(true);
  });

  it('escalates urgent cleanliness complaint to Admin', async () => {
    const comp = await submitCleanlinessComplaint({
      studentName: 'Subhashree Behera',
      rollNumber: 'CS-2024-042',
      hostel: 'Sarojini Girls Residence',
      block: 'Block-B',
      floor: '2nd Floor',
      roomNumber: '204',
      category: 'Pest or Insect Issue',
      title: 'Termite infestation near bed frame',
      description: 'Wood dust visible and termites spreading.',
      location: 'My Room',
      priority: 'Urgent'
    });

    const escRes = await escalateCleanlinessComplaint(
      comp.id,
      'Requires external pest control contract approval by Hostel Admin.',
      'Mrs. Nibedita Das (Hostel Warden)'
    );

    expect(escRes).toBeDefined();
    expect(escRes.isEscalated).toBe(true);
    expect(escRes.status).toBe('Escalated');
  });

  it('isolates student view and provides accurate SLA analytics', async () => {
    const stats = await getCleanlinessAnalytics();
    expect(stats.totalComplaints).toBeGreaterThan(0);
    expect(stats.newComplaints).toBeGreaterThanOrEqual(0);
    expect(stats.inProgress).toBeGreaterThanOrEqual(0);
    expect(stats.resolvedComplaints).toBeGreaterThanOrEqual(0);

    const studentList = await getStudentCleanlinessComplaints('CS-2024-042');
    studentList.forEach(c => {
      expect(c.internalNotes).toBeUndefined();
    });
  });
});
