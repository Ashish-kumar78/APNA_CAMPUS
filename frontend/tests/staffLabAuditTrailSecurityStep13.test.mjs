import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 13: Audit Trail & Security Integrity Logging', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');
  const backendDir = path.resolve(rootDir, 'backend/src/laboratory');

  // 1. Immutable Audit Logging Structure
  it('1. labStaffStore.recordAuditLog records immutable audit records with complete metadata', () => {
    const logEntry = labStaffStore.recordAuditLog({
      user: 'Dean Academics Prof. S. K. Dash',
      role: 'ADMIN',
      action: 'Safety Policy Override',
      target: 'Biotechnology High Voltage Centrifuge',
      oldValue: 'Restricted Access',
      newValue: 'Permitted under Supervision',
      status: 'Success'
    });

    expect(logEntry).toBeDefined();
    expect(logEntry.id).toMatch(/^AUD-LAB-/);
    expect(logEntry.user).toBe('Dean Academics Prof. S. K. Dash');
    expect(logEntry.role).toBe('ADMIN');
    expect(logEntry.action).toBe('Safety Policy Override');
    expect(logEntry.oldValue).toBe('Restricted Access');
    expect(logEntry.newValue).toBe('Permitted under Supervision');
    expect(logEntry.timestamp).toBeDefined();
    expect(logEntry.status).toBe('Success');
  });

  // 2. Requisition Lifecycle Audit Trail
  it('2. Reviewing requisitions and issuing stock automatically writes to the institutional audit trail', () => {
    labStaffStore.setBranch('BIOTECH');
    const req = labStaffStore.createRequisition({
      department: 'BIOTECH',
      labId: 'BIOTECH-LAB-01',
      itemName: 'Magnetic Stirrer with Hot Plate 500W',
      quantity: 3,
      priority: 'Normal',
      reason: 'Routine bacterial broth incubation requirement.'
    });

    // Admin reviews and approves
    labStaffStore.reviewRequisition(req.id, {
      action: 'APPROVE',
      adminRemarks: 'Approved for Semester VI practical coursework.',
      reviewerName: 'Admin Er. P. K. Panda'
    });

    const auditAfterReview = labStaffStore.getAuditLogs({ action: 'Review Lab Requisition' });
    expect(auditAfterReview.length).toBeGreaterThan(0);
    const targetReviewLog = auditAfterReview.find(a => a.target.includes('Magnetic Stirrer'));
    expect(targetReviewLog).toBeDefined();
    expect(targetReviewLog.user).toBe('Admin Er. P. K. Panda');
    expect(targetReviewLog.newValue).toBe('Approved');

    // Admin issues stock
    labStaffStore.issueRequisitionStock(req.id, {
      issuedQuantity: 3,
      adminRemarks: 'Issued from Stores Rack 4A',
      issuerName: 'Store Superintendent Mr. K. C. Sahoo'
    });

    const auditAfterIssue = labStaffStore.getAuditLogs({ action: 'Issue Requisition Stock' });
    expect(auditAfterIssue.length).toBeGreaterThan(0);
    const targetIssueLog = auditAfterIssue.find(a => a.target.includes('Magnetic Stirrer'));
    expect(targetIssueLog).toBeDefined();
    expect(targetIssueLog.user).toBe('Store Superintendent Mr. K. C. Sahoo');
    expect(targetIssueLog.newValue).toContain('Issued (3 Units)');
  });

  // 3. Complaint & Repair Lifecycle Audit Trail
  it('3. Authorizing work orders and updating maintenance status logs into the audit trail', () => {
    labStaffStore.setBranch('MECH');
    const cmp = labStaffStore.createComplaint({
      department: 'MECH',
      labId: 'MECH-LAB-01',
      equipmentName: 'CNC Lathe Machine Tool Chuck',
      category: 'Damaged instruments',
      priority: 'High',
      description: 'Jaw clamping misalignment, runout exceeds 0.05mm.'
    });

    // Admin approves complaint and issues work order
    labStaffStore.reviewComplaint(cmp.id, {
      action: 'APPROVE',
      assignedTechnician: 'Central Workshop Division',
      adminRemarks: 'Authorized toolpost jaw grinding and dial calibration.',
      reviewerName: 'Workshop In-Charge Prof. M. K. Senapati'
    });

    const auditAfterApproval = labStaffStore.getAuditLogs({ action: 'Approve Complaint & Issue Work Order' });
    expect(auditAfterApproval.length).toBeGreaterThan(0);
    const cmpApprovalLog = auditAfterApproval.find(a => a.target.includes('CNC Lathe Machine'));
    expect(cmpApprovalLog).toBeDefined();
    expect(cmpApprovalLog.user).toBe('Workshop In-Charge Prof. M. K. Senapati');

    // Technician completes work order
    labStaffStore.updateWorkOrderProgress(cmp.id, {
      status: 'Completed',
      resolutionNotes: 'Chuck jaws re-ground and trued to within 0.008mm runout.',
      technicianName: 'Master Craftsman B. C. Jena'
    });

    const auditAfterDone = labStaffStore.getAuditLogs({ action: 'Update Work Order Status' });
    expect(auditAfterDone.length).toBeGreaterThan(0);
    const cmpDoneLog = auditAfterDone.find(a => a.target.includes('CNC Lathe Machine'));
    expect(cmpDoneLog).toBeDefined();
    expect(cmpDoneLog.user).toBe('Master Craftsman B. C. Jena');
    expect(cmpDoneLog.newValue).toBe('Completed');
  });

  // 4. Security Integrity: Non-Super-Admin roles cannot prune or clear audit logs
  it('4. Security Integrity: Prevents unauthorized roles from purging or clearing audit logs', () => {
    expect(() => {
      labStaffStore.clearAuditLogs('STAFF');
    }).toThrowError(/Security Error: Insufficient privileges/);

    expect(() => {
      labStaffStore.clearAuditLogs('FACULTY');
    }).toThrowError(/Security Error: Insufficient privileges/);

    expect(() => {
      labStaffStore.clearAuditLogs('ADMIN');
    }).toThrowError(/Security Error: Insufficient privileges/);

    // Super Admin is permitted
    expect(() => {
      labStaffStore.clearAuditLogs('SUPER_ADMIN');
    }).not.toThrow();

    expect(labStaffStore.getAuditLogs().length).toBe(0);
  });

  // 5. Backend Controller & Service Audit Trail Capabilities
  it('5. Backend NestJS controller and service provide persistent audit logging with Prisma', () => {
    const servicePath = path.join(backendDir, 'laboratory.service.ts');
    const controllerPath = path.join(backendDir, 'laboratory.controller.ts');

    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');

    expect(serviceContent).toContain('recordLabAuditLog');
    expect(serviceContent).toContain('getAuditLogs');
    expect(serviceContent).toContain('prisma.auditLog.create');

    expect(controllerContent).toContain("@Get('audit-logs')");
    expect(controllerContent).toMatch(/@Roles\(Role\.ADMIN,\s*Role\.SUPER_ADMIN\)/);
    expect(controllerContent).toContain('getAuditLogs');
  });

  // 6. UI Integration in AdminLaboratoryManagementModule
  it('6. AdminLaboratoryManagementModule renders Super Admin Audit Trail Inspector with audit metadata', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toMatch(/Super Admin Audit Trail/);
    expect(modContent).toMatch(/Laboratory System-Wide Governance\s*(&|&amp;)\s*Audit Trail/);
    expect(modContent).toMatch(/Immutable log of administrative overrides/);
    expect(modContent).toMatch(/Action\s*(&|&amp;)\s*Target/);
    expect(modContent).toContain('Close Audit Inspector');
  });
});
