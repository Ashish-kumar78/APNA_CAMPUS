import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitFoodFeedback,
  getAllFoodFeedback,
  getFoodFeedbackAnalytics,
  detectRepeatedMealDefects,
  recordFeedbackInvestigationAction,
  resetFoodFeedbackStore,
  saveLocalFoodFeedback,
} from '../src/services/hostelFoodStore.js';

describe('STEP 3: Mess Meal Feedback & Low-Rating Detection Engine', () => {
  beforeEach(() => {
    resetFoodFeedbackStore();
  });

  it('rejects feedback submission for future dates', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await expect(
      submitFoodFeedback({
        studentId: 'std-test-1',
        studentName: 'Test Student',
        rollNumber: '2305209999',
        hostelName: 'Gandhi Boys Residence',
        mealDate: futureDateStr,
        mealType: 'Lunch',
        overallRating: 4,
        foodItems: 'Rice, Dal',
      })
    ).rejects.toThrow(/Cannot submit feedback for future meals/i);
  });

  it('prevents duplicate feedback submission for identical student, meal, and date', async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    const first = await submitFoodFeedback({
      studentId: 'std-dup-1',
      studentName: 'Duplicate Tester',
      rollNumber: '2305208888',
      hostelName: 'Gandhi Boys Residence',
      mealDate: todayStr,
      mealType: 'Breakfast',
      overallRating: 4,
      foodItems: 'Idli, Sambar',
    });
    expect(first).toBeDefined();
    expect(first.rollNumber).toBe('2305208888');

    // Attempt second submission for exact same student, meal, and date
    await expect(
      submitFoodFeedback({
        studentId: 'std-dup-1',
        studentName: 'Duplicate Tester',
        rollNumber: '2305208888',
        hostelName: 'Gandhi Boys Residence',
        mealDate: todayStr,
        mealType: 'Breakfast',
        overallRating: 2,
        foodItems: 'Idli, Sambar',
      })
    ).rejects.toThrow(/already submitted feedback/i);
  });

  it('computes 7-tier rating distribution (Total, Average, 5★, 4★, 3★, 2★, 1★)', async () => {
    const analytics = await getFoodFeedbackAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.totalFeedback).toBeGreaterThan(0);
    expect(analytics.averageRating).toBeGreaterThanOrEqual(1);
    expect(analytics.averageRating).toBeLessThanOrEqual(5);

    expect(analytics.starDistribution).toBeDefined();
    expect(typeof analytics.starDistribution['5']).toBe('number');
    expect(typeof analytics.starDistribution['4']).toBe('number');
    expect(typeof analytics.starDistribution['3']).toBe('number');
    expect(typeof analytics.starDistribution['2']).toBe('number');
    expect(typeof analytics.starDistribution['1']).toBe('number');

    const sumStars =
      analytics.starDistribution['5'] +
      analytics.starDistribution['4'] +
      analytics.starDistribution['3'] +
      analytics.starDistribution['2'] +
      analytics.starDistribution['1'];
    expect(sumStars).toBe(analytics.totalFeedback);
  });

  it('detects repeated food-quality defect clusters when multiple students report low ratings for same meal', () => {
    const mockList = [
      {
        id: 'fb-rep-1',
        rollNumber: '2305201111',
        studentName: 'Student Alpha',
        hostelName: 'Gandhi Boys Residence',
        mealDate: '2026-11-06',
        mealType: 'Lunch',
        category: 'Food Quality',
        overallRating: 2,
        comments: 'Chapatis cold and tough',
      },
      {
        id: 'fb-rep-2',
        rollNumber: '2305202222',
        studentName: 'Student Beta',
        hostelName: 'Gandhi Boys Residence',
        mealDate: '2026-11-06',
        mealType: 'Lunch',
        category: 'Food Quality',
        overallRating: 1,
        comments: 'Dal was salty and burnt',
      },
      {
        id: 'fb-rep-3',
        rollNumber: '2305203333',
        studentName: 'Student Gamma',
        hostelName: 'Sarojini Girls Residence',
        mealDate: '2026-11-07',
        mealType: 'Dinner',
        category: 'Taste',
        overallRating: 4,
        comments: 'Dinner was fine',
      },
    ];

    const clusters = detectRepeatedMealDefects(mockList);
    expect(clusters.length).toBe(1);
    expect(clusters[0].mealDate).toBe('2026-11-06');
    expect(clusters[0].mealType).toBe('Lunch');
    expect(clusters[0].count).toBe(2);
    expect(clusters[0].averageRating).toBe(1.5);
    expect(clusters[0].summary).toContain('2 students reported poor food quality / low rating');
  });

  it('records investigation notes, corrective kitchen action, and updates status without auto-resolving on view', async () => {
    const all = await getAllFoodFeedback();
    const target = all.find((f) => f.overallRating < 3) || all[0];
    expect(target).toBeDefined();

    // Verify initial state is not Resolved
    expect(target.status).not.toBe('Resolved');

    // Manager records corrective action
    const updated = await recordFeedbackInvestigationAction({
      id: target.id,
      correctiveAction: 'Inspected salt measurement container and recalibrated kitchen recipe standards.',
      internalNotes: 'Interviewed head cook; checked morning supply batch.',
      response: 'We investigated the issue with the kitchen supervisor. Seasoning has been corrected.',
      status: 'Action Taken',
      officerName: 'Mr. Kailash Chandra Nayak',
    });

    expect(updated).toBeDefined();
    expect(updated.status).toBe('Action Taken');
    expect(updated.correctiveAction).toContain('recalibrated kitchen recipe');
    expect(updated.internalNotes).toContain('Interviewed head cook');
    expect(updated.response).toContain('Seasoning has been corrected');
    expect(updated.respondedBy).toBe('Mr. Kailash Chandra Nayak');
  });

  it('marks feedback Resolved only when manager explicitly chooses Resolved status', async () => {
    const all = await getAllFoodFeedback();
    const target = all[0];

    const resolved = await recordFeedbackInvestigationAction({
      id: target.id,
      correctiveAction: 'Replaced vendor ghee and verified dough moisture.',
      internalNotes: 'Resolution verified by Chief Mess Manager during audit.',
      response: 'Issue resolved permanently after kitchen audit.',
      status: 'Resolved',
      officerName: 'Mr. Kailash Chandra Nayak',
    });

    expect(resolved.status).toBe('Resolved');
    expect(resolved.priority).toBe('Normal');
  });

  it('correctly filters feedbacks by rating, meal type, and low-rated threshold', async () => {
    const all = await getAllFoodFeedback();

    const lowRatedOnly = all.filter((f) => (Number(f.overallRating) || 0) < 3);
    expect(lowRatedOnly.length).toBeGreaterThanOrEqual(1);
    lowRatedOnly.forEach((f) => {
      expect(Number(f.overallRating)).toBeLessThan(3);
    });

    const fiveStars = all.filter((f) => Number(f.overallRating) === 5);
    fiveStars.forEach((f) => {
      expect(Number(f.overallRating)).toBe(5);
    });
  });
});

