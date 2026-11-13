import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 10: Super Admin System-Wide Authority & Cross-Branch Overrides', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. SuperAdminPortal includes laboratory-management in navigation and headings
  it('1. SuperAdminPortal imports FlaskConical and wires laboratory-management into navigation & headings', () => {
    const portalPath = path.join(frontendDir, 'components/SuperAdminPortal.jsx');
    const portalContent = fs.readFileSync(portalPath, 'utf8');

    expect(portalContent).toContain('FlaskConical');
    expect(portalContent).toContain('AdminLaboratoryManagementModule');
    expect(portalContent).toMatch(/label:\s*'Laboratory Management',\s*icon:\s*FlaskConical,\s*id:\s*'laboratory-management'/);
    expect(portalContent).toContain("'laboratory-management': { title: 'Laboratory Management System'");
    expect(portalContent).toMatch(/activeTab === 'laboratory-management'/);
    expect(portalContent).toContain('<AdminLaboratoryManagementModule account={account} isSuperAdmin={true} />');
  });

  // 2. menuConfig.superAdmin.js includes laboratory-management
  it('2. menuConfig.superAdmin.js integrates laboratory-management with FlaskConical icon', () => {
    const configPath = path.join(frontendDir, 'config/menuConfig/menuConfig.superAdmin.js');
    const configContent = fs.readFileSync(configPath, 'utf8');

    expect(configContent).toContain('FlaskConical');
    expect(configContent).toMatch(/id:\s*'laboratory-management',\s*label:\s*'Laboratory Management',\s*icon:\s*FlaskConical/);
  });

  // 3. Super Admin Complaint Override
  it('3. labStaffStore.superAdminOverrideComplaint overrides complaint status across branches with audit logging', () => {
    labStaffStore.setBranch('CIVIL');
    const cmp = labStaffStore.createComplaint({
      department: 'CIVIL',
      labId: 'CIVIL-LAB-01',
      equipmentName: 'Direct Shear Testing Machine 50kN',
      category: 'Damaged instruments',
      priority: 'High',
      description: 'Proving ring dial indicator seized during shear box consolidation.'
    });

    expect(cmp.status).toBe('Submitted');

    // Super Admin executes root override
    const overridden = labStaffStore.superAdminOverrideComplaint(cmp.id, {
      newStatus: 'In Progress',
      adminRemarks: 'Root emergency override: OEM specialist summoned directly by Chancellor office.',
      overriddenBy: 'Root Super Administrator'
    });

    expect(overridden.status).toBe('In Progress');
    expect(overridden.reviewedBy).toBe('Root Super Administrator');
    expect(overridden.workOrderNumber).toMatch(/^WO-\d{4}-\d{4}$/);
    expect(overridden.adminRemarks).toContain('SUPER_ADMIN OVERRIDE');

    // Verify audit log entry
    const auditLogs = labStaffStore.getAuditLogs();
    const targetAudit = auditLogs.find(a => a.action === 'Super Admin Complaint Status Override' && a.target.includes(cmp.id));
    expect(targetAudit).toBeDefined();
    expect(targetAudit.oldValue).toBe('Submitted');
    expect(targetAudit.newValue).toBe('In Progress');
    expect(targetAudit.role).toBe('SUPER_ADMIN');
  });

  // 4. Super Admin Requisition Override
  it('4. labStaffStore.superAdminOverrideRequisition overrides requisition status with audit logging', () => {
    labStaffStore.setBranch('EEE');
    const req = labStaffStore.createRequisition({
      department: 'EEE',
      labId: 'EEE-LAB-01',
      itemName: '3-Phase Synchronous Motor-Generator Set 5HP',
      quantity: 2,
      priority: 'Critical',
      reason: 'Urgent replacement for grid synchronization lab coursework.'
    });

    expect(req.status).toBe('Pending Approval');

    // Super Admin executes direct root approval override
    const overriddenReq = labStaffStore.superAdminOverrideRequisition(req.id, {
      newStatus: 'Approved',
      adminRemarks: 'Directly authorized by Super Admin under Institute Infrastructure Modernization Grant.',
      overriddenBy: 'Super Administrator Dr. B. K. Ray'
    });

    expect(overriddenReq.status).toBe('Approved');
    expect(overriddenReq.reviewedBy).toBe('Super Administrator Dr. B. K. Ray');

    // Verify audit log
    const auditLogs = labStaffStore.getAuditLogs();
    const reqAudit = auditLogs.find(a => 
      a.action === 'Super Admin Requisition Status Override' && 
      (a.target.includes(req.id) || a.target.includes(req.requisitionNo) || a.target.includes(req.itemName))
    );
    expect(reqAudit).toBeDefined();
    expect(reqAudit.oldValue).toBe('Pending Approval');
    expect(reqAudit.newValue).toBe('Approved');
  });

  // 5. Super Admin Decommission Equipment
  it('5. labStaffStore.superAdminDecommissionEquipment decommissions obsolete equipment and writes off stock', () => {
    labStaffStore.setBranch('MECH');
    const eqList = labStaffStore.getEquipment('MECH');
    expect(eqList.length).toBeGreaterThan(0);
    const targetEq = eqList[0];

    const decommissioned = labStaffStore.superAdminDecommissionEquipment(targetEq.id, {
      reason: 'Obsolescence and unrepairable hydraulic actuator fatigue.',
      decommissionedBy: 'Root Super Admin'
    });

    expect(decommissioned.status).toBe('Decommissioned');
    expect(decommissioned.condition).toBe('Decommissioned / Written Off');
    expect(decommissioned.availableQuantity).toBe(0);
    expect(decommissioned.decommissionReason).toContain('hydraulic actuator fatigue');

    // Verify audit log
    const auditLogs = labStaffStore.getAuditLogs();
    const decAudit = auditLogs.find(a => a.action === 'Equipment Decommissioned / Purged' && a.target.includes(targetEq.id));
    expect(decAudit).toBeDefined();
    expect(decAudit.newValue).toBe('Decommissioned');
  });

  // 6. AdminLaboratoryManagementModule UI incorporates Super Admin controls
  it('6. AdminLaboratoryManagementModule exposes Super Admin Governance Mode, Root Overrides, and Audit Trail', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toMatch(/isSuperAdminRole/);
    expect(modContent).toMatch(/Super Admin Root Governance Mode Active/);
    expect(modContent).toMatch(/Super Admin Audit Trail/);
    expect(modContent).toMatch(/Root Override/);
    expect(modContent).toMatch(/Decommission/);
    expect(modContent).toMatch(/Super Admin Root Authority Override/);
    expect(modContent).toMatch(/Laboratory System-Wide Governance\s*(&|&amp;)\s*Audit Trail/);
  });
});
