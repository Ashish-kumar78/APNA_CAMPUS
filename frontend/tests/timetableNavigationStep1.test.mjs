import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStudentMenuConfig } from '../src/config/menuConfig/menuConfig.student.js';
import { getFacultyMenuConfig } from '../src/config/menuConfig/menuConfig.faculty.js';
import { getHodMenuConfig } from '../src/config/menuConfig/menuConfig.hod.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 1: Timetable Navigation for Student, Faculty, and HOD Roles', () => {
  it('1. Student menuConfig includes Timetable under ACADEMICS section', () => {
    const studentMenu = getStudentMenuConfig();
    const academicsSection = studentMenu.find(s => s.title === 'ACADEMICS');
    expect(academicsSection).toBeDefined();

    const timetableItem = academicsSection.items.find(item => item.id === 'timetable' || item.page === 'timetable');
    expect(timetableItem).toBeDefined();
    expect(timetableItem.label).toBe('Timetable');
    expect(timetableItem.page).toBe('timetable');
    expect(timetableItem.icon).toBeDefined();
  });

  it('2. StudentPortal.jsx studentNavSections includes Timetable and passes account to TimetablePage', () => {
    const studentPortalPath = path.resolve(__dirname, '../src/StudentPortal.jsx');
    const source = fs.readFileSync(studentPortalPath, 'utf8');

    // Navigation item
    expect(source).toMatch(/{\s*label:\s*['"]Timetable['"],\s*icon:\s*Calendar,\s*page:\s*['"]timetable['"]\s*}/);

    // TimetablePage renders with account prop
    expect(source).toMatch(/<TimetablePage\s+account=\{studentAccount\s*\|\|\s*account\}/);
  });

  it('3. TimetablePage.jsx forwards account and role props to PublicTimetable', () => {
    const timetablePagePath = path.resolve(__dirname, '../src/pages/TimetablePage.jsx');
    const source = fs.readFileSync(timetablePagePath, 'utf8');

    expect(source).toContain('account');
    expect(source).toMatch(/<PublicTimetable[^>]*account=\{account\}/);
  });

  it('4. Faculty menuConfig includes timetable under teaching/academics section', () => {
    const facultyMenu = getFacultyMenuConfig();
    const teachingSection = facultyMenu.find(s => s.title === 'TEACHING & CLASSES' || s.title.includes('TEACHING'));
    expect(teachingSection).toBeDefined();

    const timetableItem = teachingSection.items.find(item => item.id === 'timetable');
    expect(timetableItem).toBeDefined();
    expect(timetableItem.label).toBe('My Timetable');
  });

  it('5. HOD menuConfig includes timetable under ACADEMICS & EVALUATION section', () => {
    const hodMenu = getHodMenuConfig();
    const academicsSection = hodMenu.find(s => s.title === 'ACADEMICS & EVALUATION');
    expect(academicsSection).toBeDefined();

    const timetableItem = academicsSection.items.find(item => item.id === 'timetable');
    expect(timetableItem).toBeDefined();
    expect(timetableItem.label).toBe('Timetable Management');
  });
});

