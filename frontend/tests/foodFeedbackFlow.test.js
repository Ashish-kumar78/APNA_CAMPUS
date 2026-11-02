import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLocalFoodFeedback,
  saveLocalFoodFeedback,
  submitFoodFeedback,
  getStudentFoodFeedback,
  approveFoodFeedback,
  respondToFoodFeedback,
  resetFoodFeedbackStore
} from '../src/services/hostelFoodStore.js';

describe('Hostel Food Feedback: Student Submission & Warden/Admin Approval Flow', () => {
  beforeEach(() => {
    resetFoodFeedbackStore();
  });

  it('1. Student submits food feedback with Pending status immediately appearing in history', async () => {
    const studentRoll = '2305201001';
    const studentName = 'Aman Kumar Sharma';

    const newFeedback = await submitFoodFeedback({
      studentId: 'std-demo-1001',
      studentName,
      rollNumber: studentRoll,
      hostelName: 'Sarojini Girls Residence (Block A)',
      mealDate: '2026-11-01',
      mealType: 'Lunch',
      category: 'Taste',
      quantity: 'Appropriate',
      qualityRating: 4,
      tasteRating: 4,
      temperatureRating: 5,
      hygieneRating: 5,
      overallRating: 4,
      comments: 'Sambhar was slightly tangy, rest of the meal was very fresh.'
    });

    expect(newFeedback).toBeDefined();
    expect(newFeedback.status).toBe('Pending');
    expect(newFeedback.rollNumber).toBe(studentRoll);
    expect(newFeedback.studentName).toBe(studentName);

    // Verify it is immediately in the student feedback history
    const studentHistory = await getStudentFoodFeedback(studentRoll, { studentName });
    const found = studentHistory.find(f => f.id === newFeedback.id || f.feedbackCode === newFeedback.feedbackCode);
    expect(found).toBeDefined();
    expect(found.status).toBe('Pending');
    expect(found.comments).toContain('Sambhar was slightly tangy');
  });

  it('2. Warden or Admin approves the feedback, changing status to Approved with official response', async () => {
    const studentRoll = '2305201001';
    const studentName = 'Aman Kumar Sharma';

    const created = await submitFoodFeedback({
      studentId: 'std-demo-1001',
      studentName,
      rollNumber: studentRoll,
      hostelName: 'Sarojini Girls Residence (Block A)',
      mealDate: '2026-10-30',
      mealType: 'Dinner',
      category: 'Food Quality',
      quantity: 'Appropriate',
      qualityRating: 5,
      tasteRating: 5,
      temperatureRating: 5,
      hygieneRating: 5,
      overallRating: 5,
      comments: 'Excellent quality chapati and paneer masala.'
    });

    expect(created.status).toBe('Pending');

    // Warden approves the feedback
    const officerName = 'Mrs. Nibedita Das (Warden)';
    const approved = await approveFoodFeedback(
      created.id,
      'Approved by Warden. Quality verified with central kitchen head cook.',
      officerName,
      'Maintained recipe standard.'
    );

    expect(approved).toBeDefined();
    expect(approved.status).toBe('Approved');
    expect(approved.respondedBy).toBe(officerName);
    expect(approved.response).toContain('Approved by Warden');

    // Verify student history now shows Approved status and warden response
    const studentHistory = await getStudentFoodFeedback(studentRoll, { studentName });
    const studentViewItem = studentHistory.find(f => f.id === created.id);
    expect(studentViewItem).toBeDefined();
    expect(studentViewItem.status).toBe('Approved');
    expect(studentViewItem.respondedBy).toBe(officerName);
    expect(studentViewItem.response).toContain('Quality verified with central kitchen');
  });

  it('3. Warden submits an official response with corrective action which approves the feedback', async () => {
    const studentRoll = '2305201001';
    const studentName = 'Aman Kumar Sharma';

    const created = await submitFoodFeedback({
      studentId: 'std-demo-1001',
      studentName,
      rollNumber: studentRoll,
      hostelName: 'Sarojini Girls Residence (Block A)',
      mealDate: '2026-10-29',
      mealType: 'Evening Snacks',
      category: 'Food Temperature',
      quantity: 'Appropriate',
      qualityRating: 3,
      tasteRating: 3,
      temperatureRating: 2,
      hygieneRating: 4,
      overallRating: 3,
      comments: 'Tea was lukewarm at 5:15 PM counter.'
    });

    expect(created.status).toBe('Pending');

    // Admin responds with corrective action
    const adminOfficer = 'Hostel Administrator';
    const responded = await respondToFoodFeedback(
      created.id,
      'Inspected insulated dispensing flasks. New temperature protocol deployed.',
      'Replaced dispensing flask heater coil.',
      adminOfficer
    );

    expect(responded.status).toBe('Approved');
    expect(responded.respondedBy).toBe(adminOfficer);
    expect(responded.correctiveAction).toBe('Replaced dispensing flask heater coil.');

    // Verify reflected in student history
    const studentHistory = await getStudentFoodFeedback(studentRoll, { studentName });
    const studentItem = studentHistory.find(f => f.id === created.id);
    expect(studentItem.status).toBe('Approved');
    expect(studentItem.response).toContain('Inspected insulated dispensing flasks');
  });
});

