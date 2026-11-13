import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';
import { BRANCHES_CONFIG } from '../src/components/StaffModules/labStaffData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 14: End-to-End Acceptance Verification & Final Audit', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');
  const backendDir = path.resolve(rootDir, 'backend/src/laboratory');

  // 1. Dynamic Branch Isolation Across All 7 Engineering Disciplines
  it('1. Verifies strict branch isolation across all 7 disciplines with zero cross-contamination', () => {
    const requiredBranches = ['CSE', 'CSE_AI', 'BIOTECH', 'ECE', 'MECH', 'EEE', 'CIVIL'];

    requiredBranches.forEach(branch => {
      expect(BRANCHES_CONFIG[branch]).toBeDefined();

      labStaffStore.setBranch(branch);
      expect(labStaffStore.getBranch()).toBe(branch);

      const branchLabs = labStaffStore.getLaboratories(branch);
      expect(branchLabs.length).toBeGreaterThan(0);
      branchLabs.forEach(lab => expect(lab.department).toBe(branch));

      const branchEq = labStaffStore.getEquipment(branch);
      expect(branchEq.length).toBeGreaterThan(0);
      branchEq.forEach(eq => expect(eq.department).toBe(branch));
    });
  });

  // 2. Complete End-to-End Instrument Requisition Lifecycle
  it('2. E2E Requisition Workflow: Submission -> Anti-Bypass Guard -> Admin Approval -> Stock Issuance -> Inventory Update', () => {
    labStaffStore.setBranch('BIOTECH');
    const initialEqCount = labStaffStore.getEquipment('BIOTECH').length;

    // Step A: Staff submits requisition
    const req = labStaffStore.createRequisition({
      department: 'BIOTECH',
      labId: 'BIOTECH-LAB-01',
      itemName: 'High-Speed Microcentrifuge 15000 RPM',
      quantity: 5,
      priority: 'High',
      estimatedBudget: 45000,
      reason: 'Plasmid extraction practicals for final semester biotechnology cohort.'
    });

    expect(req).toBeDefined();
    expect(req.status).toBe('Pending Approval');

    // Step B: Anti-bypass guard: unapproved requisition cannot be issued
    expect(() => {
      labStaffStore.issueRequisitionStock(req.id, { issuedQuantity: 5 });
    }).toThrowError(/Cannot issue stock for a requisition that is in "Pending Approval" status/);

    // Step C: Admin reviews and approves
    const approved = labStaffStore.reviewRequisition(req.id, {
      action: 'APPROVE',
      adminRemarks: 'Approved under Autonomous Biotech Modernization Fund FY2026-27.',
      reviewerName: 'Dean Academics Prof. S. K. Dash'
    });
    expect(approved.status).toBe('Approved');

    // Step D: Stock issuance updates available inventory automatically
    const issued = labStaffStore.issueRequisitionStock(req.id, {
      issuedQuantity: 5,
      adminRemarks: 'Delivered from Central Store Bay 3',
      issuerName: 'Store Superintendent Mr. Chittaranjan Sahoo'
    });
    expect(issued.status).toBe('Issued');
    expect(issued.issuedQuantity).toBe(5);

    // Step E: Inventory in BIOTECH reflects the new equipment
    const updatedEq = labStaffStore.getEquipment('BIOTECH').find(e => 
      e.name.toLowerCase().includes('microcentrifuge')
    );
    expect(updatedEq).toBeDefined();
    expect(updatedEq.availableQuantity).toBeGreaterThanOrEqual(5);
    expect(updatedEq.status).toBe('Available');

    // Step F: Institutional audit trail verified
    const issueAudit = labStaffStore.getAuditLogs({ action: 'Issue Requisition Stock' });
    expect(issueAudit.length).toBeGreaterThan(0);
    expect(issueAudit[0].user).toBe('Store Superintendent Mr. Chittaranjan Sahoo');
  });

  // 3. Complete End-to-End Equipment Repair & Work Order Lifecycle
  it('3. E2E Repair Workflow: Staff Complaint -> Damaged Status -> Admin Review -> Work Order -> Repair -> Available Status', () => {
    labStaffStore.setBranch('ECE');
    const eqList = labStaffStore.getEquipment('ECE');
    expect(eqList.length).toBeGreaterThan(0);
    const targetEq = eqList[0];

    // Step A: Staff lodges complaint
    const cmp = labStaffStore.createComplaint({
      department: 'ECE',
      labId: 'ECE-LAB-01',
      equipmentId: targetEq.id,
      equipmentName: targetEq.name,
      category: 'Damaged instruments',
      priority: 'Critical',
      description: 'CRO CRT tube filament failure; no horizontal trace displayed.'
    });

    expect(cmp).toBeDefined();
    expect(cmp.status).toBe('Submitted');

    // Equipment is immediately marked as Damaged
    const damagedEq = labStaffStore.getEquipment('ECE').find(e => e.id === targetEq.id);
    expect(damagedEq.status).toBe('Damaged');
    expect(damagedEq.condition).toBe('Damaged');

    // Step B: Anti-bypass guard: unapproved complaint cannot be updated to Completed
    expect(() => {
      labStaffStore.updateWorkOrderProgress(cmp.id, {
        status: 'Completed',
        resolutionNotes: 'Bypass attempt'
      });
    }).toThrowError(/Complaint is pending Admin review and has no authorized Work Order/);

    // Step C: Admin authorizes repair and issues Work Order
    const approvedCmp = labStaffStore.reviewComplaint(cmp.id, {
      action: 'APPROVE',
      assignedTechnician: 'Electronics Calibration Cell (CIF)',
      adminRemarks: 'Authorized emergency bench servicing and CRT tube replacement.',
      reviewerName: 'Admin Er. R. N. Mohanty'
    });
    expect(approvedCmp.status).toBe('Assigned');
    expect(approvedCmp.workOrderNumber).toMatch(/^WO-\d{4}-\d{4}$/);

    // Equipment is now marked as Under Maintenance
    const maintEq = labStaffStore.getEquipment('ECE').find(e => e.id === targetEq.id);
    expect(maintEq.status).toBe('Under Maintenance');

    // Step D: Maintenance completed -> Automatically restored to Available
    const completedCmp = labStaffStore.updateWorkOrderProgress(cmp.id, {
      status: 'Completed',
      resolutionNotes: 'Replaced CRT tube filament and recalibrated deflection plates.',
      technicianName: 'Senior Technician Mr. Anup Jena'
    });
    expect(completedCmp.status).toBe('Completed');

    // Equipment is now automatically restored to Available & Operational / Good
    const restoredEq = labStaffStore.getEquipment('ECE').find(e => e.id === targetEq.id);
    expect(restoredEq.status).toBe('Available');
    expect(restoredEq.condition).toBe('Operational / Good');
  });

  // 4. Super Admin Root Authority, Cross-Branch Overrides & Anti-Tamper Security
  it('4. Super Admin Governance: Root overrides, asset decommissioning, and anti-tamper security guard', () => {
    labStaffStore.setBranch('CIVIL');
    const eqList = labStaffStore.getEquipment('CIVIL');
    expect(eqList.length).toBeGreaterThan(0);
    const targetEq = eqList[0];

    // Super Admin executes root decommissioning
    const decommissioned = labStaffStore.superAdminDecommissionEquipment(targetEq.id, {
      reason: 'Obsolescence write-off authorized by Governing Council',
      decommissionedBy: 'Root Super Administrator'
    });
    expect(decommissioned.status).toBe('Decommissioned');
    expect(decommissioned.availableQuantity).toBe(0);

    // Verify audit log exists
    const decLog = labStaffStore.getAuditLogs({ action: 'Equipment Decommissioned / Purged' });
    expect(decLog.length).toBeGreaterThan(0);
    expect(decLog[0].user).toBe('Root Super Administrator');

    // Anti-Tamper Security Guard: non-super-admin blocked
    expect(() => {
      labStaffStore.clearAuditLogs('STAFF');
    }).toThrowError(/Security Error: Insufficient privileges/);

    expect(() => {
      labStaffStore.clearAuditLogs('ADMIN');
    }).toThrowError(/Security Error: Insufficient privileges/);
  });

  // 5. Academic Lab Practical Attendance & Rubric Continuous Evaluation
  it('5. Academic Integration: Pre-session readiness check, student attendance recording, and 4-point rubric grading', () => {
    labStaffStore.setBranch('CSE');
    const sessions = labStaffStore.getTimetable('CSE');
    expect(sessions.length).toBeGreaterThan(0);
    const sess = sessions[0];

    // Readiness check
    labStaffStore.markSessionReadiness(sess.id, true, 'All 32 dual-monitor Dell workstations verified.');

    // Save Attendance
    const roster = [
      { roll: 'CSE-24-001', name: 'Aayush Mohapatra', attendanceStatus: 'Present' },
      { roll: 'CSE-24-002', name: 'Abhilash Tripathy', attendanceStatus: 'Present' },
      { roll: 'CSE-24-003', name: 'Aditi Priyadarshini', attendanceStatus: 'Absent' }
    ];
    const savedSess = labStaffStore.saveAttendance(sess.id, roster, 'Practical Session 04 conducted.');
    expect(savedSess.attendanceTaken).toBe(true);
    expect(savedSess.status).toBe('Completed');
    expect(savedSess.presentCount).toBe(2);
    expect(savedSess.absentCount).toBe(1);

    // 4-point rubric evaluation
    const evalResult = labStaffStore.saveEvaluation({
      roll: 'CSE-24-001',
      name: 'Aayush Mohapatra',
      department: 'CSE',
      subject: 'Computer Networks Practical',
      experimentation: 10,
      viva: 10,
      recordWork: 10,
      timeliness: 10
    });
    expect(evalResult.totalScore).toBe(40);
    expect(evalResult.grade).toBe('O');
  });

  // 6. Real-Time Emergency Broadcast Alerts Engine
  it('6. Broadcast Engine: Emits cross-branch alert, notifies subscribers, and elevates critical notifications', () => {
    const broadcast = labStaffStore.broadcastNotification({
      title: 'Institutional Safety Inspection Tomorrow',
      message: 'State Pollution Control Board & AICTE safety committee inspecting chemical and high-voltage laboratories.',
      category: 'Safety & Hazard',
      priority: 'Critical',
      targetRole: 'ALL',
      branch: 'ALL',
      sender: 'Office of the Principal'
    });

    expect(broadcast.isBroadcast).toBe(true);
    expect(broadcast.priority).toBe('Critical');

    const unreadCritical = labStaffStore.getNotifications({ priority: 'Critical', unreadOnly: true });
    expect(unreadCritical.length).toBeGreaterThan(0);
  });

  // 7. Full Portal UI Integration & Surface Verification
  it('7. Portal Surface Verification: Staff Lab, Admin Console, and Super Admin portals are fully wired', () => {
    const adminModPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const adminPortalPath = path.join(frontendDir, 'components/AdminPortal.jsx');
    const superAdminPortalPath = path.join(frontendDir, 'components/SuperAdminPortal.jsx');
    const menuConfigAdminPath = path.join(frontendDir, 'config/menuConfig/menuConfig.admin.js');
    const menuConfigSuperAdminPath = path.join(frontendDir, 'config/menuConfig/menuConfig.superAdmin.js');

    // Admin Console
    const adminModContent = fs.readFileSync(adminModPath, 'utf8');
    expect(adminModContent).toMatch(/A\.\s*Laboratory Management/);
    expect(adminModContent).toMatch(/B\.\s*Equipment\s*(&|&amp;)\s*Inventory/);
    expect(adminModContent).toMatch(/C\.\s*Complaints\s*(&|&amp;)\s*Maintenance/);
    expect(adminModContent).toMatch(/D\.\s*Academic Laboratory\s*(&|&amp;)\s*Attendance/);
    expect(adminModContent).toMatch(/E\.\s*Laboratory Reports/);

    // Admin Portal
    const adminPortalContent = fs.readFileSync(adminPortalPath, 'utf8');
    expect(adminPortalContent).toContain('AdminLaboratoryManagementModule');
    expect(adminPortalContent).toContain("activeTab === 'laboratory-management'");

    // Super Admin Portal
    const superAdminPortalContent = fs.readFileSync(superAdminPortalPath, 'utf8');
    expect(superAdminPortalContent).toContain('FlaskConical');
    expect(superAdminPortalContent).toContain('AdminLaboratoryManagementModule');
    expect(superAdminPortalContent).toContain("activeTab === 'laboratory-management'");

    // Menu configs
    expect(fs.readFileSync(menuConfigAdminPath, 'utf8')).toContain("'laboratory-management'");
    expect(fs.readFileSync(menuConfigSuperAdminPath, 'utf8')).toContain("'laboratory-management'");
  });
});
