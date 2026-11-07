import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Attendance Module Auto-Hide Student List & Canteen Menu Export', () => {
  it('1. menuConfig.canteen.js exports getCanteenMenuConfig as both named and default export', async () => {
    const canteenModule = await import('../src/config/menuConfig/menuConfig.canteen.js');
    expect(typeof canteenModule.getCanteenMenuConfig).toBe('function');
    expect(typeof canteenModule.default).toBe('function');
    expect(canteenModule.getCanteenMenuConfig).toBe(canteenModule.default);

    const menu = canteenModule.getCanteenMenuConfig();
    expect(Array.isArray(menu)).toBe(true);
    expect(menu.length).toBeGreaterThan(0);
  });

  it('2. menuConfig/index.js exports getCanteenMenuConfig and resolves for canteen role', async () => {
    const menuIndex = await import('../src/config/menuConfig/index.js');
    expect(typeof menuIndex.getCanteenMenuConfig).toBe('function');
    expect(typeof menuIndex.getMenuConfigForRole).toBe('function');

    const canteenConfig = menuIndex.getMenuConfigForRole('canteen');
    expect(Array.isArray(canteenConfig)).toBe(true);
    expect(canteenConfig.length).toBeGreaterThan(0);
    expect(canteenConfig[0].title).toContain('OVERVIEW');
  });

  it('3. TakeAttendanceModule.jsx automatically hides student list on submit', () => {
    const filePath = path.resolve(__dirname, '../src/components/Attendance/TakeAttendanceModule.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    // Verify default state
    expect(source).toMatch(/const\s+\[showViewAttendanceTable,\s*setShowViewAttendanceTable\]\s*=\s*useState\(false\);/);

    // Verify handleSubmitAttendance sets showViewAttendanceTable to false
    expect(source).toMatch(/setSubmittedSession\(sessionRecord\);[\s\S]*?setIsSubmitted\(true\);[\s\S]*?setIsEditing\(false\);[\s\S]*?setShowViewAttendanceTable\(false\);/);

    // Verify handleConfirmUpdate sets showViewAttendanceTable to false
    expect(source).toMatch(/setSubmittedSession\(updatedRecord\);[\s\S]*?setIsSubmitted\(true\);[\s\S]*?setIsEditing\(false\);[\s\S]*?setShowViewAttendanceTable\(false\);/);

    // Verify toggle button supports expanding and collapsing with proper labels
    expect(source).toContain("{showViewAttendanceTable ? 'Hide Attendance List' : 'View Attendance List'}");

    // Verify handleStartUpdate resets showViewAttendanceTable to true
    expect(source).toMatch(/handleStartUpdate[\s\S]*?setShowViewAttendanceTable\(true\);/);

    // Verify handleRecordNewSession resets showViewAttendanceTable to true
    expect(source).toMatch(/handleRecordNewSession[\s\S]*?setShowViewAttendanceTable\(true\);/);
  });
});

