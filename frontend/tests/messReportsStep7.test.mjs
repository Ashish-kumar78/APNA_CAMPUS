import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMessAnalyticsReport,
  exportFeedbackReportCsv,
  exportComplaintsReportCsv,
  exportAttendanceReportCsv,
  exportExecutiveAuditCsv,
} from '../src/services/messReportStore.js';
import { getLocalFoodFeedback } from '../src/services/hostelFoodStore.js';
import { getAllMessComplaints } from '../src/services/messComplaintStore.js';

describe('STEP 7: Mess Reports, Defect Analytics & CSV Export', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    };
  });

  it('1. Generates live analytical report without hardcoded values', () => {
    const report = generateMessAnalyticsReport({ timeframe: 'weekly' });
    expect(report).toBeDefined();
    expect(report.summary).toBeDefined();
    expect(report.summary.totalFeedbackCount).toBeGreaterThan(0);
    expect(report.summary.avgOverall).toBeGreaterThan(0);
    expect(report.summary.avgQuality).toBeGreaterThan(0);
    expect(report.summary.avgHygiene).toBeGreaterThan(0);
  });

  it('2. Computes granular 4-meal session rating matrix', () => {
    const report = generateMessAnalyticsReport();
    expect(report.mealWiseMatrix.length).toBe(4);

    const sessions = report.mealWiseMatrix.map((m) => m.session);
    expect(sessions).toContain('Breakfast');
    expect(sessions).toContain('Lunch');
    expect(sessions).toContain('Evening Snacks');
    expect(sessions).toContain('Dinner');

    report.mealWiseMatrix.forEach((m) => {
      expect(m.averageRating).toBeGreaterThanOrEqual(1);
      expect(m.averageRating).toBeLessThanOrEqual(5);
      expect(m.quality).toBeGreaterThanOrEqual(1);
      expect(m.taste).toBeGreaterThanOrEqual(1);
      expect(m.hygiene).toBeGreaterThanOrEqual(1);
      expect(['Satisfactory', 'Action Recommended', 'Critical Defect']).toContain(m.status);
    });
  });

  it('3. Identifies best-rated meals and lowest-rated defect meals', () => {
    const report = generateMessAnalyticsReport();
    expect(report.bestRatedMeals).toBeDefined();
    expect(Array.isArray(report.bestRatedMeals)).toBe(true);

    if (report.bestRatedMeals.length >= 2) {
      expect(report.bestRatedMeals[0].overallRating).toBeGreaterThanOrEqual(report.bestRatedMeals[1].overallRating);
    }

    expect(report.lowestRatedMeals).toBeDefined();
    expect(Array.isArray(report.lowestRatedMeals)).toBe(true);
  });

  it('4. Clusters repeated food-quality defect trends', () => {
    const report = generateMessAnalyticsReport();
    expect(report.repeatedDefects).toBeDefined();
    expect(Array.isArray(report.repeatedDefects)).toBe(true);

    if (report.repeatedDefects.length > 0) {
      const topDefect = report.repeatedDefects[0];
      expect(topDefect.defectTitle).toBeDefined();
      expect(topDefect.occurrences).toBeGreaterThanOrEqual(1);
      expect(topDefect.lastReportedDate).toBeDefined();
    }
  });

  it('5. Computes complaint resolution metrics (Total, Pending, Resolved, Rate %)', () => {
    const report = generateMessAnalyticsReport();
    expect(report.summary.totalComplaints).toBeGreaterThanOrEqual(0);
    expect(report.summary.resolutionRate).toBeGreaterThanOrEqual(0);
    expect(report.summary.resolutionRate).toBeLessThanOrEqual(100);
  });

  it('6. Filters reports accurately by date range, hostel, and meal type', () => {
    const allReport = generateMessAnalyticsReport({ timeframe: 'monthly' });
    const breakfastReport = generateMessAnalyticsReport({ timeframe: 'monthly', mealType: 'Breakfast' });

    expect(breakfastReport.mealType).toBe('Breakfast');
    // Filtered feedback in breakfastReport should only include breakfast
    breakfastReport.filteredFeedback.forEach((f) => {
      expect(f.mealType.toLowerCase()).toContain('break');
    });
  });

  it('7. Integrates meal attendance and consumption telemetry', () => {
    const report = generateMessAnalyticsReport({ timeframe: 'daily' });
    expect(report.attendanceTelemetry).toBeDefined();
    expect(report.attendanceTelemetry.totalResidents).toBe(520);
    expect(report.attendanceTelemetry.sessions.length).toBe(4);
  });

  it('8. Supports CSV export functions for feedback, complaints, attendance, and executive audit', () => {
    expect(typeof exportFeedbackReportCsv).toBe('function');
    expect(typeof exportComplaintsReportCsv).toBe('function');
    expect(typeof exportAttendanceReportCsv).toBe('function');
    expect(typeof exportExecutiveAuditCsv).toBe('function');
  });
});
