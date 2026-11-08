import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PublicTimetable from '../src/components/PublicTimetable.jsx';
import {
  getTimetableDashboardStatsData,
  publishTimetableAndNotify,
  PUBLISHED_CLASS_TIMETABLES
} from '../src/services/timetableStore.js';

describe('STEP 5: HOD Role – Academics → Timetable Interface Verification', () => {
  const mockHodAccount = {
    id: 'hod_cse_001',
    name: 'Dr. P. K. Pattnaik',
    role: 'hod',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    designation: 'Professor & Head of Department',
    employeeId: 'EMP-HOD-CSE-01',
    email: 'hod.cse@apnacampus.edu.in'
  };

  it('1. Renders the 7 HOD dashboard summary KPI cards accurately', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockHodAccount, role: 'hod' })
    );

    // 7 KPI cards
    expect(html).toContain('Total Faculty');
    expect(html).toContain('Active Sections');
    expect(html).toContain('Total Subjects');
    expect(html).toMatch(/Classrooms\s*\/\s*Labs/);
    expect(html).toContain('Published');
    expect(html).toContain('Drafts');
    expect(html).toContain('Timetable Conflicts');
    expect(html).toContain('CP-SAT Verified');
  });

  it('2. Renders the 5 HOD timetable navigation tabs', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockHodAccount, role: 'hod' })
    );

    expect(html).toContain('Timetable for Students');
    expect(html).toContain('Faculty Wise Timetable');
    expect(html).toContain('Room Wise Timetable');
    expect(html).toContain('Section Wise Timetable');
    expect(html).toContain('Online Class Timetable');
  });

  it('3. Renders HOD management action controls (Generate, Save Draft, Publish & Notify)', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockHodAccount, role: 'hod' })
    );

    expect(html).toContain('Generate Timetable');
    expect(html).toContain('Save as Draft');
    expect(html).toMatch(/Publish\s*(&amp;|&)\s*Notify/);
    expect(html).toContain('HOD Department Management Authorized');
  });

  it('4. Provides valid HOD dashboard stats via store service', async () => {
    const stats = await getTimetableDashboardStatsData('CSE', '2026-27');

    expect(stats.totalFaculty).toBeGreaterThanOrEqual(10);
    expect(stats.totalSections).toBeGreaterThanOrEqual(4);
    expect(stats.totalClassrooms).toBeGreaterThanOrEqual(10);
    expect(stats.timetableConflicts).toBe(0);
  });

  it('5. Allows HOD to publish timetable and broadcast notifications', async () => {
    const result = await publishTimetableAndNotify('tt-test-hod', {
      name: mockHodAccount.name,
      department: mockHodAccount.department
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('notifications sent');
  });

  it('6. Top actions contain Print, Download PDF, and Close buttons for HOD', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockHodAccount, role: 'hod' })
    );

    expect(html).toContain('Print');
    expect(html).toContain('Download PDF');
    expect(html).toContain('Close');
  });
});

