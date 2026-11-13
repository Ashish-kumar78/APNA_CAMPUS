import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory mock storage for vitest node environment
const storageMock = {};
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: (k) => storageMock[k] || null,
    setItem: (k, v) => { storageMock[k] = String(v); },
    removeItem: (k) => { delete storageMock[k]; },
    clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
  };
}
if (typeof global.window === 'undefined') {
  global.window = {
    location: { hostname: 'localhost' },
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
} else if (!global.window.location) {
  global.window.location = { hostname: 'localhost' };
}

describe('Hostel Complex Register: Bed Capacity Auto-Calculation & Dynamic Warden Dropdown Suite', () => {
  it('1. HostelPortal.jsx includes Beds in One Room field and auto-calculates totalBeds', () => {
    const filePath = path.resolve(__dirname, '../src/components/HostelPortal.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    // Field existence
    expect(source).toContain('Beds in One Room (Sharing)');

    // Auto-calculation logic on totalRooms change
    expect(source).toMatch(/totalBeds:\s*rooms\s*\*\s*bpr/);

    // Auto-calculation logic on bedsPerRoom change
    expect(source).toMatch(/bedsPerRoom:\s*bprVal,\s*totalBeds:\s*rooms\s*\*\s*bpr/);

    // Initial state has bedsPerRoom
    expect(source).toMatch(/bedsPerRoom:\s*3/);
  });

  it('2. HostelPortal.jsx uses a select dropdown for Resident Warden populated from directory', () => {
    const filePath = path.resolve(__dirname, '../src/components/HostelPortal.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    // Imports getAllWardens
    expect(source).toMatch(/import\s*\{\s*[^}]*getAllWardens[^}]*\}\s*from\s*['"]\.\.\/services\/wardenManagementStore\.js['"]/);

    // Resident Warden is a select element
    expect(source).toMatch(/<select[^>]*className=["']admin-form-select["'][^>]*value=\{hostelForm\.warden\}/);

    // Maps over availableWardens
    expect(source).toContain('availableWardens.map(');

    // Listens to real-time warden creation and update events
    expect(source).toContain("window.addEventListener('bput_wardens_updated'");
    expect(source).toContain("window.addEventListener('bput_warden_created'");
  });

  it('3. WardenManagementSection.jsx also includes Beds in One Room and auto-calculates bed capacity', () => {
    const filePath = path.resolve(__dirname, '../src/components/hostel/admin/WardenManagementSection.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toContain('Beds in One Room (Sharing)');
    expect(source).toMatch(/totalBeds:\s*roomsVal\s*\*\s*bpr/);
    expect(source).toMatch(/totalBeds:\s*rooms\s*\*\s*bprVal/);
  });

  it('4. Newly created warden in wardenManagementStore is immediately retrieved in getAllWardens', async () => {
    const { getAllWardens, addNewWarden, deleteWarden } = await import('../src/services/wardenManagementStore.js');

    const uniqueTestName = `Test Warden Automation ${Date.now()}`;
    const initialList = getAllWardens();
    const initialCount = initialList.length;

    const created = addNewWarden({
      name: uniqueTestName,
      designation: 'Assistant Resident Warden',
      phone: '+91 94370 99887',
      hostelName: 'Test Boys Residence'
    });

    expect(created).toBeDefined();
    expect(created.name).toBe(uniqueTestName);
    expect(created.id).toMatch(/^WRD-\d+/);

    const updatedList = getAllWardens();
    expect(updatedList.length).toBe(initialCount + 1);
    expect(updatedList.some(w => w.name === uniqueTestName)).toBe(true);

    // Cleanup
    deleteWarden(created.id);
    const cleanedList = getAllWardens();
    expect(cleanedList.some(w => w.name === uniqueTestName)).toBe(false);
  });
});
