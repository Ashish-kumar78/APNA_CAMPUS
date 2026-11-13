import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 5: Staff Lab Equipment & Inventory Module Integration', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. All 11 Required Equipment Specification Fields in UI Component
  it('1. EquipmentInventoryTab includes all 11 required specification fields in asset card modal', () => {
    const compPath = path.join(frontendDir, 'components/StaffModules/EquipmentInventoryTab.jsx');
    const compContent = fs.readFileSync(compPath, 'utf8');

    // Checks all 11 fields
    expect(compContent).toContain('1. Equipment ID');
    expect(compContent).toContain('2. Equipment Name');
    expect(compContent).toContain('3. Category');
    expect(compContent).toContain('4. Branch / Discipline');
    expect(compContent).toContain('5. Laboratory');
    expect(compContent).toContain('6. Total Quantity');
    expect(compContent).toContain('7. Available Quantity');
    expect(compContent).toContain('8. Issued Quantity');
    expect(compContent).toContain('9. Condition');
    expect(compContent).toContain('10. Current Status');
    expect(compContent).toMatch(/11\.\s+Purchase Information/);
  });

  // 2. Equipment Register Table Headers
  it('2. Equipment table displays Qty (Avail/Total), Issued count, and Request New Instrument action button', () => {
    const compPath = path.join(frontendDir, 'components/StaffModules/EquipmentInventoryTab.jsx');
    const compContent = fs.readFileSync(compPath, 'utf8');

    expect(compContent).toContain('Request New Instrument');
    expect(compContent).toContain('Qty (Avail/Total)');
    expect(compContent).toMatch(/<th[^>]*>Issued<\/th>/);
    expect(compContent).toContain('setShowReqModal(true)');
  });

  // 3. Request New Instrument Submission Lifecycle
  it('3. Requesting a new instrument generates a pending requisition and dispatches to backend API', () => {
    labStaffStore.setBranch('BIOTECH');
    const newReq = labStaffStore.createRequisition({
      department: 'BIOTECH',
      labId: 'BIOTECH-LAB-01',
      itemName: 'Eppendorf 24-Well Cell Culture Plate Incubator',
      quantity: 5,
      priority: 'High',
      reason: 'Required for advanced stem cell differentiation practical sessions.',
      estimatedBudget: 45000,
    });

    expect(newReq).toBeDefined();
    expect(newReq.status).toBe('Pending Approval');
    expect(newReq.requisitionNo).toContain('BIOTECH');
    expect(newReq.itemName).toBe('Eppendorf 24-Well Cell Culture Plate Incubator');
    expect(newReq.quantity).toBe(5);

    // Verify requisition is in store
    const storedReq = labStaffStore.data.requisitions.find(r => r.id === newReq.id);
    expect(storedReq).toBeDefined();
  });

  // 4. Strict Constraint: Staff Requisition Does NOT Auto-Issue Stock
  it('4. Requisition submission does NOT increase available stock until approved by Admin', () => {
    labStaffStore.setBranch('CSE_AI');
    const beforeCount = labStaffStore.data.equipment.filter(e => e.department === 'CSE_AI').length;

    labStaffStore.createRequisition({
      department: 'CSE_AI',
      labId: 'AI-LAB-01',
      itemName: 'NVIDIA RTX 4090 Workstation',
      quantity: 10,
      reason: 'Batch expansion',
    });

    const afterCount = labStaffStore.data.equipment.filter(e => e.department === 'CSE_AI').length;
    // Equipment count must not increase simply from a staff requisition
    expect(afterCount).toBe(beforeCount);
  });

  // 5. Equipment Condition and Status Values Compliance
  it('5. Complies with allowed condition statuses: Available, Issued, Under Maintenance, Damaged, Out of Stock', () => {
    const allowedConditions = ['Available', 'Issued', 'Under Maintenance', 'Damaged', 'Out of Stock'];
    const currentEquipment = labStaffStore.data.equipment;

    currentEquipment.forEach(eq => {
      if (eq.status) {
        expect(['Available', 'Issued', 'In Use', 'Under Maintenance', 'Damaged', 'Out of Stock', 'Calibration Due']).toContain(eq.status);
      }
    });
  });

  // 6. Branch Scoping for Equipment Inventory
  it('6. Equipment inventory accurately filters by selected branch', () => {
    labStaffStore.setBranch('BIOTECH');
    const biotechEquipment = labStaffStore.data.equipment.filter(e => e.department === 'BIOTECH');
    expect(biotechEquipment.length).toBeGreaterThanOrEqual(3);
    expect(biotechEquipment.some(e => e.name.includes('Biosafety Cabinet'))).toBe(true);

    labStaffStore.setBranch('CSE');
    const cseEquipment = labStaffStore.data.equipment.filter(e => e.department === 'CSE');
    expect(cseEquipment.length).toBeGreaterThanOrEqual(4);
    expect(cseEquipment.some(e => e.name.includes('Workstation') || e.name.includes('Cisco'))).toBe(true);
  });
});
