import { describe, it, expect, vi } from 'vitest';
import {
  ROUTINE_TIME_SLOTS,
  WORKING_DAYS,
  DEFAULT_STUDENT_CLASSES,
  DEFAULT_FACULTY_TIMETABLE_DATA,
  DEFAULT_ROOM_LOADS_DATA,
  DEFAULT_FLOOR_MANAGERS_DATA,
  DEFAULT_ONLINE_TIMETABLE_DATA,
  getStandardGridEntries,
  filterFacultyEntries,
  getCurrentAndNextClass,
  getStudentTimetableData,
  getFacultyTimetableData,
  getTimetableDashboardStatsData,
  publishTimetableAndNotify
} from '../src/services/timetableStore.js';

describe('STEP 2: Timetable APIs, Backend Services & Store Integration', () => {
  it('1. Routine time slots match official 30-minute intervals from 08:30 AM to 04:00 PM', () => {
    expect(ROUTINE_TIME_SLOTS.length).toBe(15);
    expect(ROUTINE_TIME_SLOTS[0]).toBe('08:30 AM - 09:00 AM');
    expect(ROUTINE_TIME_SLOTS[ROUTINE_TIME_SLOTS.length - 1]).toBe('03:30 PM - 04:00 PM');
    expect(WORKING_DAYS).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  });

  it('2. Default datasets match reference screenshots', () => {
    expect(DEFAULT_STUDENT_CLASSES.length).toBeGreaterThan(10);
    expect(DEFAULT_STUDENT_CLASSES.some(c => c.name.includes('ANAND'))).toBe(true);
    expect(DEFAULT_STUDENT_CLASSES.some(c => c.name.includes('Genius'))).toBe(true);

    expect(DEFAULT_FACULTY_TIMETABLE_DATA.length).toBeGreaterThan(10);
    expect(DEFAULT_FACULTY_TIMETABLE_DATA.some(f => f.name.includes('Pattanaik'))).toBe(true);
    expect(DEFAULT_FACULTY_TIMETABLE_DATA.some(f => f.name.includes('Prusty'))).toBe(true);

    expect(DEFAULT_ROOM_LOADS_DATA.length).toBeGreaterThan(10);
    expect(DEFAULT_ROOM_LOADS_DATA.some(r => r.roomNo === '229')).toBe(true);
    expect(DEFAULT_ROOM_LOADS_DATA.some(r => r.roomNo === '423')).toBe(true);

    expect(DEFAULT_FLOOR_MANAGERS_DATA.length).toBe(5);
    expect(DEFAULT_ONLINE_TIMETABLE_DATA.length).toBeGreaterThan(2);
  });

  it('3. getStandardGridEntries creates Monday to Saturday routines with subject and room details', () => {
    const entries = getStandardGridEntries('BTECH 2028-P/5 TH SEM/CSE (AI) - Genius');
    expect(entries.length).toBeGreaterThan(20);

    const mondayEntries = entries.filter(e => e.dayOfWeek === 'Monday');
    expect(mondayEntries.length).toBeGreaterThan(0);
    expect(mondayEntries.some(e => e.subjectName.includes('OS Lab'))).toBe(true);
    expect(mondayEntries.some(e => e.sessionType === 'LUNCH')).toBe(true);

    const tuesdayEntries = entries.filter(e => e.dayOfWeek === 'Tuesday');
    expect(tuesdayEntries.some(e => e.subjectName.includes('FAI Lab'))).toBe(true);
  });

  it('4. filterFacultyEntries filters routines specifically for a faculty member', () => {
    const allEntries = getStandardGridEntries('CSE');
    const pattanaikEntries = filterFacultyEntries(allEntries, 'Dr. Satya Ranjan Pattanaik');

    expect(pattanaikEntries.length).toBeGreaterThan(0);
    pattanaikEntries.forEach(entry => {
      expect(entry.facultyName.toLowerCase()).toContain('pattanaik');
    });
  });

  it('5. getCurrentAndNextClass computes active schedule metrics for a specific timestamp', () => {
    const entries = getStandardGridEntries('CSE');
    // Test on Monday at 09:15 AM
    const mondayMorning = new Date('2026-11-09T09:15:00'); // A Monday
    const result = getCurrentAndNextClass(entries, mondayMorning);

    expect(result.currentDay).toBe('Monday');
    expect(result.totalTodayClasses).toBeGreaterThan(0);
    expect(result.ongoingClass).toBeDefined();
    expect(result.ongoingClass.subjectName).toContain('OS Lab');
  });

  it('6. getStudentTimetableData resolves data seamlessly with fallback', async () => {
    const data = await getStudentTimetableData({ department: 'CSE', semester: '5th', section: 'Genius' });
    expect(data).toBeDefined();
    expect(data.entries.length).toBeGreaterThan(0);
    expect(data.title).toContain('Genius');
  });

  it('7. getFacultyTimetableData resolves faculty routine', async () => {
    const data = await getFacultyTimetableData('Asish Kumar Prusty');
    expect(data).toBeDefined();
    expect(data.facultyName).toBe('Asish Kumar Prusty');
    expect(data.entries.length).toBeGreaterThan(0);
  });

  it('8. getTimetableDashboardStatsData provides valid HOD statistics', async () => {
    const data = await getTimetableDashboardStatsData('CSE', '2026-27');
    expect(data).toBeDefined();
    expect(data.stats.totalFaculty).toBeGreaterThan(0);
    expect(data.stats.totalSections).toBeGreaterThan(0);
    expect(data.stats.publishedTimetables).toBeGreaterThanOrEqual(0);
  });

  it('9. publishTimetableAndNotify triggers notifications without error', async () => {
    const result = await publishTimetableAndNotify('tt-test-123', {
      name: 'Dr. Debabrata Singh',
      department: 'Computer Science & Engineering'
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('published');
  });
});

