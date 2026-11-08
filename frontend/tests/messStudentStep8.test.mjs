import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDailyMessMenu,
  getWeeklyMessMenu,
  updateMealMenuItem,
  addFestivalSpecialMeal,
  submitFoodFeedback,
  getStudentFoodFeedback,
  FOOD_FEEDBACK_STORAGE_KEY,
  MESS_MENU_STORAGE_KEY,
} from '../src/services/hostelFoodStore.js';
import {
  getAllMessComplaints,
  getStudentMessComplaints,
  submitMessComplaint,
  reopenMessComplaint,
  MESS_COMPLAINTS_STORAGE_KEY,
  SEED_MESS_COMPLAINTS,
} from '../src/services/messComplaintStore.js';
import {
  getStudentMealSkipStatus,
  submitStudentMealSkip,
  cancelStudentMealSkip,
  MESS_ATTENDANCE_STORAGE_KEY,
} from '../src/services/messAttendanceStore.js';
import {
  getMessNotices,
  publishMessNotice,
  markNoticeReadByStudent,
  MESS_NOTICES_STORAGE_KEY,
  SEED_MESS_NOTICES,
} from '../src/services/messNoticeStore.js';

describe('STEP 8: Student Dashboard Full Integration Verification (Fretbox BPUT Hackathon PS07)', () => {
  const testStudentRoll = '2305201044';
  const testStudentName = 'Subhashree Mohanty';
  const testHostel = 'Sarojini Girls Residence (Block A)';

  beforeEach(() => {
    // Setup isolated localStorage
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    };

    // Pre-populate seed notices and complaints
    localStorage.setItem(MESS_NOTICES_STORAGE_KEY, JSON.stringify(SEED_MESS_NOTICES));
    localStorage.setItem(MESS_COMPLAINTS_STORAGE_KEY, JSON.stringify(SEED_MESS_COMPLAINTS));
  });

  it('1. Retrieves Today\'s Live Menu with all 4 meal sessions, caloric values, and balanced nutrition', async () => {
    const testDate = '2026-11-09'; // Monday
    const menu = await getDailyMessMenu(testDate);

    expect(menu).toBeDefined();
    expect(menu.date).toBe(testDate);
    expect(menu.day).toBe('Monday');
    expect(menu.meals).toBeDefined();

    // Verify all 4 required meals
    expect(menu.meals.breakfast).toBeDefined();
    expect(menu.meals.lunch).toBeDefined();
    expect(menu.meals.snacks).toBeDefined();
    expect(menu.meals.dinner).toBeDefined();

    expect(menu.meals.breakfast.items).toBeTruthy();
    expect(menu.meals.lunch.items).toBeTruthy();
    expect(menu.meals.snacks.items).toBeTruthy();
    expect(menu.meals.dinner.items).toBeTruthy();

    expect(menu.meals.lunch.calories).toBeTruthy();
  });

  it('2. Retrieves Tomorrow\'s Menu accurately based on day rotational mapping', async () => {
    const tomorrowDate = '2026-11-10'; // Tuesday
    const menu = await getDailyMessMenu(tomorrowDate);

    expect(menu).toBeDefined();
    expect(menu.date).toBe(tomorrowDate);
    expect(menu.day).toBe('Tuesday');

    expect(menu.meals.breakfast.time).toBeTruthy();
    expect(menu.meals.lunch.items).toBeTruthy();
    expect(menu.meals.dinner.time).toBeTruthy();
  });

  it('3. Provides complete 7-Day Weekly Rotational Menu spanning Monday to Sunday', () => {
    const weekly = getWeeklyMessMenu();
    expect(weekly).toBeDefined();

    const expectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    expectedDays.forEach((day) => {
      expect(weekly[day]).toBeDefined();
      expect(weekly[day].breakfast).toBeDefined();
      expect(weekly[day].lunch).toBeDefined();
      expect(weekly[day].snacks).toBeDefined();
      expect(weekly[day].dinner).toBeDefined();
    });
  });

  it('4. Correctly flags Special Festival Meals and Unavailable Meals for student inspection', async () => {
    // Add special festival dinner on Friday
    await addFestivalSpecialMeal({
      day: 'Friday',
      mealType: 'Dinner',
      occasion: 'BPUT Foundation Day Feast',
      items: 'Kashmiri Pulao, Paneer Butter Masala, Gulab Jamun, Moong Dal Halwa',
      time: '07:30 - 10:30 PM',
      calories: '980 kcal',
      description: 'Grand festive campus dinner celebrating institutional milestone',
    });

    // Mark Wednesday snacks unavailable
    await updateMealMenuItem({
      day: 'Wednesday',
      mealType: 'Snacks',
      isAvailable: false,
      unavailabilityReason: 'Central water filter sanitization and kitchen pest treatment',
    });

    const weekly = getWeeklyMessMenu();
    expect(weekly.Friday.dinner.isSpecial).toBe(true);
    expect(weekly.Friday.dinner.specialOccasion).toBe('BPUT Foundation Day Feast');

    expect(weekly.Wednesday.snacks.isAvailable).toBe(false);
    expect(weekly.Wednesday.snacks.unavailabilityReason).toContain('sanitization');
  });

  it('5. Allows multi-criteria meal feedback submission and prevents duplicate submissions for the same meal', async () => {
    const todayIso = new Date().toISOString().split('T')[0];

    const feedbackPayload = {
      studentId: 'std-2026-44',
      studentName: testStudentName,
      rollNumber: testStudentRoll,
      hostelName: testHostel,
      mealDate: todayIso,
      mealType: 'Lunch',
      category: 'Food Quality',
      quantity: 'Appropriate',
      qualityRating: 5,
      tasteRating: 4,
      temperatureRating: 5,
      hygieneRating: 5,
      overallRating: 5,
      comments: 'Lunch paneer gravy was freshly prepared, warm, and delicious!',
    };

    const submitted = await submitFoodFeedback(feedbackPayload);
    expect(submitted).toBeDefined();
    expect(submitted.feedbackCode).toMatch(/^FFB-2026-/);
    expect(submitted.overallRating).toBe(5);

    const history = await getStudentFoodFeedback(testStudentRoll);
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history.find((f) => f.mealType === 'Lunch')).toBeDefined();

    // Duplicate check: submitting again for same roll, date, and meal must throw
    await expect(submitFoodFeedback(feedbackPayload)).rejects.toThrow(
      /already submitted feedback for Lunch/i
    );

    // Future date validation
    const futureDate = '2030-01-01';
    await expect(
      submitFoodFeedback({ ...feedbackPayload, mealDate: futureDate, mealType: 'Dinner' })
    ).rejects.toThrow(/Cannot submit feedback for future meals/i);
  });

  it('6. Lodges food quality grievances through Request Management Engine and allows student reopening', async () => {
    const todayIso = new Date().toISOString().split('T')[0];

    // Student files grievance
    const complaint = await submitMessComplaint({
      studentId: 'std-2026-44',
      studentName: testStudentName,
      rollNumber: testStudentRoll,
      hostelName: testHostel,
      roomNumber: 'A-304',
      mealDate: todayIso,
      mealType: 'Breakfast',
      category: 'Poor Food Quality',
      title: 'Undercooked idlis and lukewarm sambar in Block A dining hall',
      description: 'Idlis had raw batter in the center. Requesting steaming boiler inspection.',
      attachmentUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
    });

    expect(complaint).toBeDefined();
    expect(complaint.trackingId).toMatch(/^MSC-2026-/);
    expect(complaint.status).toBe('Pending');
    expect(complaint.category).toBe('Poor Food Quality');

    // Retrieve by student roll
    const studentTickets = await getStudentMessComplaints(testStudentRoll);
    expect(studentTickets.length).toBeGreaterThanOrEqual(1);

    // Simulate resolution by Mess Manager
    complaint.status = 'Resolved';
    complaint.resolutionNote = 'Kitchen steam boiler replaced and chef retrained.';
    complaint.resolvedAt = new Date().toISOString();
    const stored = (await getAllMessComplaints()).map((c) => (c.id === complaint.id ? complaint : c));
    localStorage.setItem(MESS_COMPLAINTS_STORAGE_KEY, JSON.stringify(stored));

    // Student reopens ticket
    const reopened = await reopenMessComplaint({
      id: complaint.id,
      reason: 'Same issue repeated today morning: idlis still undercooked inside.',
      studentName: testStudentName,
    });
    expect(reopened.status).toBe('Reopened');
    expect(reopened.reopenReason).toContain('still undercooked');
  });

  it('7. Integrates meal count / attendance opt-out with deadline cutoff and real-time status', () => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    const targetIso = tm.toISOString().split('T')[0];

    // Initial status: all active
    const initialStatus = getStudentMealSkipStatus(testStudentRoll, targetIso);
    expect(initialStatus).toBeDefined();
    expect(initialStatus.statusPerMeal.Breakfast).toBeDefined();
    expect(initialStatus.statusPerMeal.Lunch).toBeDefined();

    // Student opts out of Lunch
    submitStudentMealSkip({
      studentId: 'std-2026-44',
      studentName: testStudentName,
      rollNumber: testStudentRoll,
      hostelName: testHostel,
      roomNumber: 'A-304',
      date: targetIso,
      skippedMeals: ['Lunch'],
      reason: 'Fasting on Tuesday',
    });

    const updatedStatus = getStudentMealSkipStatus(testStudentRoll, targetIso);
    expect(updatedStatus.record.skippedMeals).toContain('Lunch');
    expect(updatedStatus.statusPerMeal.Lunch.isSkipped).toBe(true);

    // Cancel skip
    cancelStudentMealSkip({ rollNumber: testStudentRoll, date: targetIso, mealType: 'Lunch' });
    const cancelledStatus = getStudentMealSkipStatus(testStudentRoll, targetIso);
    expect(cancelledStatus.record ? cancelledStatus.record.skippedMeals : []).not.toContain('Lunch');
    expect(cancelledStatus.statusPerMeal.Lunch.isSkipped).toBe(false);
  });

  it('8. Displays Mess Notices, filters by hostel, and tracks student read acknowledgments', () => {
    // Publish notice targeting girls hostel
    const notice = publishMessNotice(
      {
        title: 'Special Navratri Feast Menu in Block A Dining Hall',
        description: 'Phalahari kheer, sabudana khichdi, and fresh seasonal fruit platter served tonight.',
        category: 'Special Festival Menu',
        priority: 'HIGH',
        targetHostel: 'Sarojini Girls Residence (Block A)',
        targetAudience: 'Hostel Residents Only',
        publishDate: '2026-11-08',
      },
      { name: 'Mr. Kailash Chandra Nayak', identity: 'MESS-101' },
      false
    );

    expect(notice.id).toBeTruthy();

    // Student reads notices
    const noticesForStudent = getMessNotices({ targetHostel: testHostel, activeOnly: true });
    expect(noticesForStudent.length).toBeGreaterThanOrEqual(1);

    // Mark as read
    const acknowledgedNotice = markNoticeReadByStudent(notice.id, testStudentRoll);
    expect(acknowledgedNotice.readBy).toContain(testStudentRoll);

    // Deduplication check: marking read again doesn't duplicate
    const reAck = markNoticeReadByStudent(notice.id, testStudentRoll);
    const count = reAck.readBy.filter((r) => r === testStudentRoll).length;
    expect(count).toBe(1);
  });
});
