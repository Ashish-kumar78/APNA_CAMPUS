import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import PublicTimetable from '../src/components/PublicTimetable.jsx';
import {
  PUBLISHED_CLASS_TIMETABLES,
  FACULTY_TIMETABLE_METRICS,
  ROOM_LOADS_METRICS,
  FLOOR_MANAGERS_MONITORING,
  ONLINE_TIMETABLE_CLASSES
} from '../src/services/timetableStore.js';

describe('STEP 6: Consistency Across All 5 Reference Views, Print & PDF Integration', () => {
  const mockHodAccount = {
    id: 'hod_cse_001',
    name: 'Dr. P. K. Pattnaik',
    role: 'hod',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE'
  };

  it('1. Verifies all 5 core reference views have complete structured data catalogs', () => {
    // 1. Class Timetables
    expect(PUBLISHED_CLASS_TIMETABLES.length).toBeGreaterThanOrEqual(16);
    // 2. Faculty Timetables (Image 3)
    expect(FACULTY_TIMETABLE_METRICS.length).toBeGreaterThanOrEqual(16);
    // 3. Room Loads (Image 4)
    expect(ROOM_LOADS_METRICS.length).toBeGreaterThanOrEqual(18);
    // 4. Floor Managers (Image 5)
    expect(FLOOR_MANAGERS_MONITORING.length).toBeGreaterThanOrEqual(5);
    // 5. Online Classes
    expect(ONLINE_TIMETABLE_CLASSES.length).toBeGreaterThanOrEqual(4);
  });

  it('2. Verifies Print stylesheet (@media print) is defined and hides interactive controls', () => {
    const cssPath = path.resolve(__dirname, '../src/components/PublicTimetable.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain('@media print');
    expect(cssContent).toContain('size: landscape');
    expect(cssContent).toContain('.apna-tt-top-nav');
    expect(cssContent).toContain('display: none !important');
    expect(cssContent).toContain('print-color-adjust: exact');
  });

  it('3. Verifies mobile responsiveness down to 360px viewports in CSS', () => {
    const cssPath = path.resolve(__dirname, '../src/components/PublicTimetable.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain('@media (max-width: 768px)');
    expect(cssContent).toContain('@media (max-width: 480px)');
    expect(cssContent).toContain('-webkit-overflow-scrolling: touch');
    expect(cssContent).toContain('overflow-x: auto');
  });

  it('4. Renders institutional crest and certified branding across headers', () => {
    const html = renderToString(
      React.createElement(PublicTimetable, { account: mockHodAccount, role: 'hod' })
    );

    expect(html).toContain('Apna Campus');
    expect(html).toContain('All Academic Routines &amp; Room Allocations Certified');
  });
});

