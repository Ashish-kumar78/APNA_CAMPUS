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

describe('Hostel Inventory: Material Code Removal from Raise Indent Modal Suite', () => {
  it('1. HostelInventorySection.jsx does not render a Material Code input field in the modal', () => {
    const filePath = path.resolve(__dirname, '../src/components/hostel/HostelInventorySection.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    // Ensure the input label for Material Code is deleted from the form
    expect(source).not.toContain('<label>Material Code</label>');

    // Ensure the modal has Quantity and Estimated Approx Cost paired
    expect(source).toContain('Estimated Approx Cost (RS.)');
    expect(source).toContain('Expected Requirement Date');
  });

  it('2. Indent submission handles code automatically without requiring user input', async () => {
    const { raiseNewIndent, getAllIndents } = await import('../src/services/hostelIndentStore.js');

    const result = raiseNewIndent({
      materialName: 'Emergency Door Latch Heavy',
      quantity: '5',
      unit: 'pcs',
      approxCost: '350.00',
      purpose: 'Hostel Block C repair',
      expectedDate: '2026-11-20',
      raisedBy: 'Mr. Warden Test',
      remarks: 'Fast track'
    });

    expect(result).toBeDefined();
    expect(result.newIndent).toBeDefined();
    expect(result.newIndent.indentNo).toBeDefined();
    expect(result.newIndent.materialName).toBe('Emergency Door Latch Heavy');
    // Automatic code assigned or default preserved
    expect(result.newIndent.code).toBeDefined();
    expect(result.newIndent.status).toMatch(/Pending/);
  });
});
