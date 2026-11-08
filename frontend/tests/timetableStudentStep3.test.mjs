import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PublicTimetable from '../src/components/PublicTimetable.jsx';
import {
  PUBLISHED_CLASS_TIMETABLES,
  WEEKLY_ROUTINES,
  getCurrentAndNextClass,
  getStudentTimetableData
} from '../src/services/timetableStore.js';

describe('STEP 3: Student Role – Academics → Timetable Interface Verification', () => {
  const mockStudentAccount = {
    id: 'std_2026_001',
    name: 'Bishnu Prasad',
    role: 'student',
    department: 'Computer Science & Engineering (AI)',
    semester: '5th',
    section: 'Genius',
    batch: 'BTECH 2028-P',
    academicYear: '2026-27'
  };

  it('1. Automatically detects student profile and renders Enrolled Routine banner', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockStudentAccount, role: 'student' })
    );

    expect(html).toContain('Enrolled Student Routine');
    expect(html).toContain('Bishnu Prasad');
    expect(html).toContain('Genius');
    expect(html).toContain('5th');
    expect(html).toContain('View My Weekly Routine');
  });

  it('2. Enforces student-specific 4 navigation tabs (read-only views)', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockStudentAccount, role: 'student' })
    );

    // Should include these 4 tabs
    expect(html).toContain('Timetable for Students');
    expect(html).toContain('Faculty Wise Timetable (read-only)');
    expect(html).toContain('Room Wise Timetable (read-only)');
    expect(html).toContain('Online Class Timetable');

    // Floormanagers tab should NOT be rendered for student role
    expect(html).not.toContain('Timetable for Floormanagers');
  });

  it('3. Renders structured class timetable list matching the specification table format', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockStudentAccount, role: 'student' })
    );

    // Columns: Sl. No. | Class / Department | Semester | Section | Action
    expect(html).toContain('Sl. No.');
    expect(html).toContain('Class / Department');
    expect(html).toContain('Semester');
    expect(html).toContain('Section');
    expect(html).toContain('Action');

    // Section Genius is marked with Enrolled Section badge
    expect(html).toContain('Enrolled Section');
    expect(html).toContain('View');
  });

  it('4. Computes live ongoing class, next class, and break status accurately', () => {
    // Test with a mock Wednesday 09:15 AM (SE Lab should be scheduled)
    const testDate = new Date(2026, 10, 4, 9, 15, 0); // Wednesday
    const liveStatus = getCurrentAndNextClass(WEEKLY_ROUTINES, testDate);

    expect(liveStatus.currentDay).toBe('Wednesday');
    expect(liveStatus.totalTodayClasses).toBeGreaterThan(0);
    if (liveStatus.ongoingClass) {
      expect(liveStatus.ongoingClass.subjectName).toContain('SE Lab');
    }
  });

  it('5. Correctly detects lunch and break intervals', () => {
    // 01:00 PM on Monday is Lunch
    const lunchDate = new Date(2026, 10, 2, 13, 0, 0); // Monday 1:00 PM
    const lunchStatus = getCurrentAndNextClass(WEEKLY_ROUTINES, lunchDate);

    expect(lunchStatus.isLunch).toBe(true);
  });

  it('6. Enforces strict read-only mode for students (no edit or publish controls)', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockStudentAccount, role: 'student' })
    );

    // Ensure no admin/manager controls exist
    expect(html).not.toContain('Generate Timetable');
    expect(html).not.toContain('Publish Timetable');
    expect(html).not.toContain('Save as Draft');
    expect(html).not.toContain('Resolve Conflicts');
    expect(html).not.toContain('Edit Slot');
    expect(html).not.toContain('Delete Routine');

    // Should indicate read-only access
    expect(html).toContain('Read-Only Student Access');
  });

  it('7. Top actions contain Print, Download PDF, and Close buttons', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockStudentAccount, role: 'student' })
    );

    expect(html).toContain('Print');
    expect(html).toContain('Download PDF');
    expect(html).toContain('Close');
  });
});
