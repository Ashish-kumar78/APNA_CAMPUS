import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitFoodFeedback,
  getAllFoodFeedback,
  getStudentFoodFeedback,
  approveFoodFeedback,
  respondToFoodFeedback,
  addFoodFeedbackInternalNote,
  forwardFoodFeedbackToAdmin,
  resetFoodFeedbackStore
} from '../src/services/hostelFoodStore.js';

describe('Food Feedback Cross-Role Integration: Student <-> Warden <-> Hostel Admin', () => {
  beforeEach(() => {
    resetFoodFeedbackStore();
  });

  it('1. Student submits food feedback: saved with Pending status, visible across Warden & Hostel Admin', async () => {
    const studentSubmission = {
      studentId: 'std-101',
      studentName: 'Aman Kumar Sharma',
      rollNumber: '2305201001',
      hostelName: 'Sarojini Girls Residence (Block A)',
      mealDate: '2026-10-28',
      mealType: 'Lunch',
      foodItems: 'Rice, Dal, Paneer Butter Masala, Salad',
      qualityRating: 4,
      tasteRating: 3,
      temperatureRating: 4,
      hygieneRating: 5,
      quantity: 'Appropriate',
      overallRating: 3,
      category: 'Taste',
      comments: 'Paneer gravy had excessive turmeric, dal was well prepared.',
      status: 'Pending'
    };

    // Student submits
    const created = await submitFoodFeedback(studentSubmission);
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.feedbackCode).toMatch(/^FFB-2026-/);
    expect(created.status).toBe('Pending');
    expect(created.studentName).toBe('Aman Kumar Sharma');

    // Student verifies history
    const studentHistory = await getStudentFoodFeedback('2305201001');
    const studentRecord = studentHistory.find(f => f.feedbackCode === created.feedbackCode);
    expect(studentRecord).toBeDefined();
    expect(studentRecord.status).toBe('Pending');
    expect(studentRecord.response).toBeNull();

    // Warden views feedback for their hostel
    const wardenList = await getAllFoodFeedback({ hostel: 'Sarojini' });
    const wardenRecord = wardenList.find(f => f.feedbackCode === created.feedbackCode);
    expect(wardenRecord).toBeDefined();
    expect(wardenRecord.comments).toContain('excessive turmeric');

    // Hostel Admin views all feedback across all hostels
    const adminList = await getAllFoodFeedback({});
    const adminRecord = adminList.find(f => f.feedbackCode === created.feedbackCode);
    expect(adminRecord).toBeDefined();
    expect(adminRecord.rollNumber).toBe('2305201001');
  });

  it('2. Warden adds internal administrative note: isolated from student, visible to Hostel Admin', async () => {
    const created = await submitFoodFeedback({
      studentName: 'Aman Kumar Sharma',
      rollNumber: '2305201001',
      hostelName: 'Sarojini Girls Residence (Block A)',
      mealDate: '2026-10-28',
      mealType: 'Breakfast',
      foodItems: 'Idli, Sambar, Coconut Chutney',
      overallRating: 2,
      category: 'Hygiene',
      comments: 'Chutney bowl was chipped.'
    });

    // Warden adds internal note
    const updatedWithNote = await addFoodFeedbackInternalNote(
      created.id,
      'Called kitchen supervisor regarding ceramic tableware replacement.',
      'Mrs. Nibedita Das (Resident Warden)'
    );
    expect(updatedWithNote.internalNotes).toContain('tableware replacement');

    // Hostel Admin views internal note
    const adminView = await getAllFoodFeedback({});
    const adminItem = adminView.find(f => f.id === created.id);
    expect(adminItem.internalNotes).toContain('tableware replacement');

    // Student DOES NOT see internal administrative notes
    const studentHistory = await getStudentFoodFeedback('2305201001');
    const studentItem = studentHistory.find(f => f.id === created.id);
    expect(studentItem.internalNotes).toBeUndefined();
  });

  it('3. Warden or Hostel Admin approves feedback with official response: student history reflects Approved status', async () => {
    const created = await submitFoodFeedback({
      studentName: 'Aman Kumar Sharma',
      rollNumber: '2305201001',
      hostelName: 'Sarojini Girls Residence (Block A)',
      mealDate: '2026-10-28',
      mealType: 'Dinner',
      foodItems: 'Roti, Mixed Vegetable, Rice, Dal',
      overallRating: 4,
      category: 'Quality',
      comments: 'Dinner was warm and wholesome.'
    });

    expect(created.status).toBe('Pending');

    // Hostel Warden or Admin approves
    const approved = await approveFoodFeedback(
      created.id,
      'Thank you for the meal feedback. Kitchen staff commended for warm dinner service.',
      'Mrs. Nibedita Das',
      'Daily mess temperature logging maintained.'
    );

    expect(approved.status).toBe('Approved');
    expect(approved.response).toContain('warm dinner service');
    expect(approved.respondedBy).toBe('Mrs. Nibedita Das');
    expect(approved.respondedAt).toBeDefined();

    // Student self history now shows Approved status with official response
    const studentHistory = await getStudentFoodFeedback('2305201001');
    const studentRecord = studentHistory.find(f => f.id === created.id);
    expect(studentRecord.status).toBe('Approved');
    expect(studentRecord.response).toContain('warm dinner service');
    expect(studentRecord.respondedBy).toBe('Mrs. Nibedita Das');
  });

  it('4. Warden escalates/forwards food issue to Hostel Administrator', async () => {
    const created = await submitFoodFeedback({
      studentName: 'Aman Kumar Sharma',
      rollNumber: '2305201001',
      hostelName: 'Sarojini Girls Residence (Block A)',
      mealDate: '2026-10-28',
      mealType: 'Evening Snacks',
      foodItems: 'Samosa, Tea',
      overallRating: 2,
      category: 'Oiliness',
      comments: 'Snacks were overly greasy.'
    });

    const forwarded = await forwardFoodFeedbackToAdmin(
      created.id,
      'Escalated to Hostel Admin: Oil quality audit requested with mess caterer.',
      'Mrs. Nibedita Das'
    );

    expect(forwarded.status).toBe('Action Required');
    expect(forwarded.priority).toBe('High');
    expect(forwarded.internalNotes).toContain('Oil quality audit requested');
  });
});
