import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_COMPLAINTS } from '../src/components/StaffModules/labStaffData.js';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 6: Staff Lab Maintenance, Safety & Complaints Module Integration', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. Initial Complaints Multi-Branch Data Integrity
  it('1. INITIAL_COMPLAINTS is populated with multi-branch records and valid fields', () => {
    expect(Array.isArray(INITIAL_COMPLAINTS)).toBe(true);
    expect(INITIAL_COMPLAINTS.length).toBeGreaterThanOrEqual(7);

    const departments = INITIAL_COMPLAINTS.map(c => c.department);
    expect(departments).toContain('CSE');
    expect(departments).toContain('CSE_AI');
    expect(departments).toContain('BIOTECH');
    expect(departments).toContain('ECE');
    expect(departments).toContain('MECH');
    expect(departments).toContain('EEE');
    expect(departments).toContain('CIVIL');

    INITIAL_COMPLAINTS.forEach(c => {
      expect(c.id).toMatch(/^CMP-2026-\d{3}$/);
      expect(c.category).toBeDefined();
      expect(c.status).toBeDefined();
      expect(c.equipmentName).toBeDefined();
    });
  });

  // 2. All 6 Mandatory Complaint Categories Supported
  it('2. MaintenanceSafetyTab & QuickActionModal support all 6 mandatory complaint categories', () => {
    const compPath = path.join(frontendDir, 'components/StaffModules/MaintenanceSafetyTab.jsx');
    const compContent = fs.readFileSync(compPath, 'utf8');

    const expectedCategories = [
      'Damaged instruments',
      'Electrical problems',
      'Computer problems',
      'Network problems',
      'Laboratory furniture',
      'Other laboratory-related problems'
    ];

    expectedCategories.forEach(cat => {
      expect(compContent).toContain(cat);
    });

    const quickModalPath = path.join(frontendDir, 'components/StaffModules/QuickActionModal.jsx');
    const quickContent = fs.readFileSync(quickModalPath, 'utf8');
    expectedCategories.forEach(cat => {
      expect(quickContent).toContain(cat);
    });
  });

  // 3. Complaint Submission Generates Unique CMP-ID with Initial Status "Submitted"
  it('3. Submitting a complaint generates unique CMP ID and initial status "Submitted"', () => {
    labStaffStore.setBranch('BIOTECH');
    const created = labStaffStore.createComplaint({
      department: 'BIOTECH',
      labId: 'BIOTECH-LAB-01',
      equipmentId: 'EQ-BIO-002',
      equipmentName: 'High-Speed Refrigerated Centrifuge',
      category: 'Damaged instruments',
      priority: 'High',
      description: 'Centrifuge rotor unbalanced vibration and error code E-12 on acceleration.',
    });

    expect(created).toBeDefined();
    expect(created.id).toMatch(/^CMP-2026-\d{3}$/);
    expect(created.status).toBe('Submitted');
    expect(created.department).toBe('BIOTECH');
    expect(created.equipmentId).toBe('EQ-BIO-002');
  });

  // 4. Equipment Status Transitions to "Damaged" on Complaint (Cannot Self-Mark as Repaired)
  it('4. Linked equipment transitions to "Damaged" status on complaint submission', () => {
    labStaffStore.setBranch('BIOTECH');
    const branchEquipment = labStaffStore.getEquipment('BIOTECH');
    const targetEq = branchEquipment.find(e => e.id === 'EQ-BIO-002');
    
    expect(targetEq).toBeDefined();
    expect(targetEq.status).toBe('Damaged');
    expect(targetEq.condition).toBe('Damaged');
  });

  // 5. Work Order Approval & Final Repair Completion Lifecycle
  it('5. Equipment transitions to "Under Maintenance" on approval and "Available" on repair completion', () => {
    labStaffStore.setBranch('BIOTECH');
    const complaints = labStaffStore.getComplaints('BIOTECH');
    const latestCmp = complaints.find(c => c.equipmentId === 'EQ-BIO-002');
    expect(latestCmp).toBeDefined();

    // Admin reviews and approves work order
    labStaffStore.updateComplaint(latestCmp.id, {
      status: 'Approved',
      workOrderNumber: 'WO-2026-BIO-009',
      assignedTechnician: 'Eppendorf Field Service Cell',
      adminRemarks: 'Approved for urgent rotor balance and tachometer inspection.'
    });

    let eqCheck = labStaffStore.getEquipment('BIOTECH').find(e => e.id === 'EQ-BIO-002');
    expect(eqCheck.status).toBe('Under Maintenance');

    // Maintenance completes repair
    labStaffStore.updateComplaint(latestCmp.id, {
      status: 'Completed',
      resolutionNotes: 'Rotor dynamically balanced and rubber vibration mounts replaced. Passed 15,000 RPM test.'
    });

    eqCheck = labStaffStore.getEquipment('BIOTECH').find(e => e.id === 'EQ-BIO-002');
    expect(eqCheck.status).toBe('Available');
    expect(eqCheck.condition).toBe('Operational / Good');
  });

  // 6. UI Component Surface: Complaints Subtab, Navigation, & Workflow Stepper Modal
  it('6. MaintenanceSafetyTab includes Equipment Complaints subtab and Workflow Audit modal', () => {
    const compPath = path.join(frontendDir, 'components/StaffModules/MaintenanceSafetyTab.jsx');
    const compContent = fs.readFileSync(compPath, 'utf8');

    expect(compContent).toContain('Equipment Complaints');
    expect(compContent).toContain('Lodge Equipment Complaint');
    expect(compContent).toContain('Workflow Audit');
    expect(compContent).toContain('Two-Tier Laboratory Repair Governance');
    expect(compContent).toContain('selectedComplaintWorkflow');
  });

  // 7. Role & Menu Configuration Wiring
  it('7. Staff menu configuration exposes Equipment Complaints route', () => {
    const menuPath = path.join(frontendDir, 'config/menuConfig/menuConfig.staff.js');
    const menuContent = fs.readFileSync(menuPath, 'utf8');

    expect(menuContent).toContain("id: 'complaints'");
    expect(menuContent).toContain("label: 'Equipment Complaints'");
  });
});

