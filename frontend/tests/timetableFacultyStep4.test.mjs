import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PublicTimetable from '../src/components/PublicTimetable.jsx';
import {
  WEEKLY_ROUTINES,
  filterFacultyEntries,
  getCurrentAndNextClass,
  getFacultyTimetableData
} from '../src/services/timetableStore.js';

describe('STEP 4: Faculty Role – Academics → Timetable Interface Verification', () => {
  const mockFacultyAccount = {
    id: 'fac_cse_011',
    name: 'Asish Kumar Prusty',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    designation: 'Assistant Professor',
    employeeId: 'FAC-CSE-011',
    email: 'asish.prusty@apnacampus.edu.in'
  };

  it('1. Automatically sets default active tab to My Timetable for faculty role', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockFacultyAccount, role: 'faculty' })
    );

    expect(html).toContain('MY TEACHING TIMETABLE');
    expect(html).toContain('My Timetable');
  });

  it('2. Renders faculty personal profile banner with designation, department, and weekly workload', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockFacultyAccount, role: 'faculty' })
    );

    expect(html).toContain('Asish Kumar Prusty');
    expect(html).toContain('Assistant Professor');
    expect(html).toMatch(/Computer Science (&amp;|&) Engineering/);
    expect(html).toContain('FAC-CSE-011');
    expect(html).toContain('View Full Teaching Routine');
    expect(html).toContain('Hours/Week');
  });

  it('3. Renders faculty-specific 5 navigation tabs matching institutional workflow', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockFacultyAccount, role: 'faculty' })
    );

    expect(html).toContain('My Timetable');
    expect(html).toContain('Faculty Wise Timetable');
    expect(html).toContain('Class Timetables');
    expect(html).toContain('Room Wise Timetable');
    expect(html).toContain('Online Class Timetable');
  });

  it('4. Correctly filters personal teaching schedule across Monday–Saturday for faculty member', () => {
    const teachingEntries = filterFacultyEntries(WEEKLY_ROUTINES, 'Asish Kumar Prusty');

    expect(teachingEntries.length).toBeGreaterThan(0);
    for (const entry of teachingEntries) {
      expect(entry.facultyName.toLowerCase()).toContain('asish');
    }
  });

  it('5. Computes live teaching status and today lectures for faculty', () => {
    const facultyEntries = filterFacultyEntries(WEEKLY_ROUTINES, 'Asish Kumar Prusty');
    // Test on Monday 09:15 AM when Asish Kumar Prusty teaches OS Lab
    const mondayMorning = new Date(2026, 10, 2, 9, 15, 0); // Monday
    const liveStatus = getCurrentAndNextClass(facultyEntries, mondayMorning);

    expect(liveStatus.currentDay).toBe('Monday');
    expect(liveStatus.ongoingClass).not.toBeNull();
    expect(liveStatus.ongoingClass.subjectName).toContain('OS Lab');
  });

  it('6. Enforces read-only permissions for faculty (cannot edit or publish timetable)', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockFacultyAccount, role: 'faculty' })
    );

    expect(html).not.toContain('Generate Timetable');
    expect(html).not.toContain('Publish Timetable');
    expect(html).not.toContain('Save as Draft');
    expect(html).not.toContain('Delete Routine');
  });

  it('7. Top actions contain Print, Download PDF, and Close buttons for faculty', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockFacultyAccount, role: 'faculty' })
    );

    expect(html).toContain('Print');
    expect(html).toContain('Download PDF');
    expect(html).toContain('Close');
  });
});
