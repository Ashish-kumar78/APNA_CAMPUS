import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDailyMealAttendanceTelemetry,
  getSkipDeadlines,
  saveSkipDeadlines,
  isSkipDeadlinePassed,
  getStudentMealSkipStatus,
  submitStudentMealSkip,
  cancelStudentMealSkip,
  recordActualMealsServed,
  resetMessAttendanceStore,
  DEFAULT_SKIP_DEADLINES,
  DEFAULT_TOTAL_RESIDENTS,
  MEAL_TYPES,
} from '../src/services/messAttendanceStore.js';

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

describe('STEP 5: Meal Count / Attendance & Student Skip-Meal System (Fretbox PS07)', () => {
  beforeEach(() => {
    resetMessAttendanceStore();
  });

  it('exposes the 4 standard daily dining sessions and default cutoff deadlines', () => {
    expect(MEAL_TYPES).toEqual(['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner']);

    const deadlines = getSkipDeadlines();
    expect(deadlines.Breakfast).toBe('06:30');
    expect(deadlines.Lunch).toBe('10:30');
    expect(deadlines['Evening Snacks']).toBe('15:30');
    expect(deadlines.Dinner).toBe('18:30');
  });

  it('generates 4-meal daily telemetry with strict separation of expected count and actual attendance', () => {
    const today = new Date().toISOString().split('T')[0];
    const telemetry = getDailyMealAttendanceTelemetry(today);

    expect(telemetry.date).toBe(today);
    expect(telemetry.totalResidents).toBe(DEFAULT_TOTAL_RESIDENTS);
    expect(telemetry.approvedLeavesCount).toBeGreaterThanOrEqual(0);

    MEAL_TYPES.forEach((meal) => {
      const data = telemetry.meals[meal];
      expect(data).toBeDefined();
      expect(data.mealType).toBe(meal);
      expect(data.totalResidents).toBe(520);
      expect(data.expectedCount).toBe(data.totalResidents - (data.approvedLeaves + data.skippedCount));
      expect(typeof data.actualServed).toBe('number');
      // Verify expected count is NOT treated as actual attendance
      expect(data.expectedCount).not.toBe(data.actualServed);
    });
  });

  it('allows Mess Manager to configure skip cutoff deadlines in real time', () => {
    const custom = {
      Breakfast: '07:00',
      Lunch: '11:00',
      'Evening Snacks': '16:00',
      Dinner: '19:00',
    };

    const saved = saveSkipDeadlines(custom);
    expect(saved.Breakfast).toBe('07:00');
    expect(saved.Dinner).toBe('19:00');

    const loaded = getSkipDeadlines();
    expect(loaded.Breakfast).toBe('07:00');
    expect(loaded.Dinner).toBe('19:00');
  });

  it('enforces cutoff deadline rules and rejects skip submissions for past dates', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Past date is always passed
    expect(isSkipDeadlinePassed('Lunch', yesterday)).toBe(true);
    // Future date is never passed
    expect(isSkipDeadlinePassed('Lunch', tomorrow)).toBe(false);

    // Rejects skip submission for past dates
    expect(() =>
      submitStudentMealSkip({
        rollNumber: '2305201001',
        date: yesterday,
        skippedMeals: ['Breakfast'],
      })
    ).toThrow(/Cannot submit or modify meal skips for past dates/i);
  });

  it('allows students to opt out of meals and automatically updates expected headcount for Central Kitchen', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Telemetry before student skip
    const initialTelemetry = getDailyMealAttendanceTelemetry(tomorrow);
    const initialBreakfastExpected = initialTelemetry.meals.Breakfast.expectedCount;

    // Student submits skip opt-out
    const res = submitStudentMealSkip({
      studentId: 'std-skip-01',
      studentName: 'Subhasish Nayak',
      rollNumber: '2305209999',
      hostelName: 'Gandhi Boys Residence',
      roomNumber: '302',
      date: tomorrow,
      skippedMeals: ['Breakfast', 'Dinner'],
      reason: 'Fasting and morning gym workout',
    });

    expect(res.success).toBe(true);
    expect(res.record).toBeDefined();
    expect(res.record.skippedMeals).toEqual(['Breakfast', 'Dinner']);
    expect(res.record.reason).toContain('Fasting');

    // Telemetry after student skip: Breakfast expected count must be reduced by 1
    const updatedTelemetry = getDailyMealAttendanceTelemetry(tomorrow);
    expect(updatedTelemetry.meals.Breakfast.skippedCount).toBe(
      initialTelemetry.meals.Breakfast.skippedCount + 1
    );
    expect(updatedTelemetry.meals.Breakfast.expectedCount).toBe(initialBreakfastExpected - 1);

    // Verify student lookup
    const studentStatus = getStudentMealSkipStatus('2305209999', tomorrow);
    expect(studentStatus.record).toBeDefined();
    expect(studentStatus.statusPerMeal.Breakfast.isSkipped).toBe(true);
    expect(studentStatus.statusPerMeal.Lunch.isSkipped).toBe(false);
    expect(studentStatus.statusPerMeal.Dinner.isSkipped).toBe(true);
  });

  it('allows students to cancel their skip opt-out before cutoff, restoring expected headcount', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    submitStudentMealSkip({
      rollNumber: '2305208888',
      studentName: 'Ananya Mishra',
      date: tomorrow,
      skippedMeals: ['Lunch'],
      reason: 'Project work',
    });

    const beforeCancel = getDailyMealAttendanceTelemetry(tomorrow);
    const lunchExpectedBefore = beforeCancel.meals.Lunch.expectedCount;

    // Cancel lunch skip
    const cancelRes = cancelStudentMealSkip({
      rollNumber: '2305208888',
      date: tomorrow,
      mealType: 'Lunch',
    });

    expect(cancelRes.success).toBe(true);

    const afterCancel = getDailyMealAttendanceTelemetry(tomorrow);
    expect(afterCancel.meals.Lunch.expectedCount).toBe(lunchExpectedBefore + 1);

    const studentStatus = getStudentMealSkipStatus('2305208888', tomorrow);
    expect(studentStatus.statusPerMeal.Lunch.isSkipped).toBe(false);
  });

  it('allows Mess Manager to record actual plates served and calculates turnout percentage', () => {
    const today = new Date().toISOString().split('T')[0];

    const result = recordActualMealsServed({
      date: today,
      mealType: 'Dinner',
      count: 485,
    });

    expect(result.success).toBe(true);
    expect(result.actualServed).toBe(485);

    const telemetry = getDailyMealAttendanceTelemetry(today);
    const dinnerData = telemetry.meals.Dinner;
    expect(dinnerData.actualServed).toBe(485);
    expect(dinnerData.turnoutRatio).toMatch(/^\d+\.\d+%$/);
    expect(dinnerData.status).toBe('Completed');
  });

  it('rejects student meal skip if student roll number is missing', () => {
    expect(() =>
      submitStudentMealSkip({
        rollNumber: '',
        date: new Date().toISOString().split('T')[0],
        skippedMeals: ['Breakfast'],
      })
    ).toThrow(/Student roll number is required/i);
  });
});

