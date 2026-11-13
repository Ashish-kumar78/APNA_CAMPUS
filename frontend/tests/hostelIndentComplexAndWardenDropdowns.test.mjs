import { describe, it, expect } from 'vitest';
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

describe('Hostel Inventory: Hostel Complex & Hostel Warden Dropdowns Suite', () => {
  it('1. HostelInventorySection.jsx imports getAllHostelComplexes and getAllWardens', () => {
    const filePath = path.resolve(__dirname, '../src/components/hostel/HostelInventorySection.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toMatch(/import\s*\{\s*[^}]*getAllHostelComplexes[^}]*\}\s*from\s*['"]\.\.\/\.\.\/services\/hostelComplexStore\.js['"]/);
    expect(source).toMatch(/import\s*\{\s*[^}]*getAllWardens[^}]*\}\s*from\s*['"]\.\.\/\.\.\/services\/wardenManagementStore\.js['"]/);
  });

  it('2. Hostel Complex is rendered as a select dropdown and not a free-text input', () => {
    const filePath = path.resolve(__dirname, '../src/components/hostel/HostelInventorySection.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    // Contains Hostel Complex select dropdown
    expect(source).toContain('Hostel Complex');
    expect(source).toMatch(/<label className="required">Hostel Complex<\/label>\s*<select/);
    expect(source).toContain('handleHostelComplexChange');
    expect(source).toContain('hostelComplexes.map');
  });

  it('3. Raised By (Hostel Warden) is rendered as a select dropdown and not a free-text input', () => {
    const filePath = path.resolve(__dirname, '../src/components/hostel/HostelInventorySection.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    // Contains Hostel Warden select dropdown
    expect(source).toMatch(/<label className="required">Hostel Warden \(Raised By\)<\/label>\s*<select/);
    expect(source).toContain('handleWardenChange');
    expect(source).toContain('wardensList.map');
  });

  it('4. Real-time synchronization events are subscribed for hostel complexes and wardens', () => {
    const filePath = path.resolve(__dirname, '../src/components/hostel/HostelInventorySection.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toContain('bput_hostel_complexes_updated');
    expect(source).toContain('bput_wardens_updated');
    expect(source).toContain('bput_warden_created');
  });

  it('5. Stores return valid initial data for dropdowns', async () => {
    const { getAllHostelComplexes } = await import('../src/services/hostelComplexStore.js');
    const { getAllWardens } = await import('../src/services/wardenManagementStore.js');

    const complexes = getAllHostelComplexes();
    const wardens = getAllWardens();

    expect(Array.isArray(complexes)).toBe(true);
    expect(complexes.length).toBeGreaterThan(0);
    expect(complexes.some(c => c.name.includes('Gandhi') || c.name.includes('Sarojini') || c.name.includes('Kalam'))).toBe(true);

    expect(Array.isArray(wardens)).toBe(true);
    expect(wardens.length).toBeGreaterThan(0);
    expect(wardens.some(w => w.name.includes('Nibedita') || w.name.includes('Jena') || w.name.includes('Tanmaya'))).toBe(true);
  });
});

