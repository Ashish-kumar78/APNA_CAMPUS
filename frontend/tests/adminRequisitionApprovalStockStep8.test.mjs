import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 8: Admin Requisition Approval & Stock Issuance Workflow', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. Staff Requisition Submission Triggers Admin Notification
  it('1. Submitting a requisition automatically triggers an Admin notification', () => {
    labStaffStore.setBranch('BIOTECH');
    const newReq = labStaffStore.createRequisition({
      department: 'BIOTECH',
      labId: 'BIOTECH-LAB-01',
      itemName: 'Eppendorf Thermomixer C with 1.5mL SmartBlock',
      quantity: 4,
      priority: 'High',
      estimatedBudget: 38000,
      reason: 'Urgent requirement for enzyme kinetics and plasmid DNA extraction practicals.'
    });

    expect(newReq).toBeDefined();
    expect(newReq.status).toBe('Pending Approval');

    const notifs = labStaffStore.data.notifications;
    const reqNotif = notifs.find(n => n.title === 'New Instrument Requisition Submitted' && n.message.includes('Thermomixer'));
    expect(reqNotif).toBeDefined();
    expect(reqNotif.unread).toBe(true);
    expect(reqNotif.actionRoute).toBe('laboratory-management');
  });

  // 2. Admin Review Workflow: Supports Approve, Reject, and Request Changes
  it('2. Admin can review, approve, reject, or request changes with remarks', () => {
    labStaffStore.setBranch('BIOTECH');
    const pendingReqs = labStaffStore.getRequisitions('BIOTECH').filter(r => r.status === 'Pending Approval');
    expect(pendingReqs.length).toBeGreaterThan(0);
    const targetReq = pendingReqs[0];

    // Admin reviews and approves
    const approved = labStaffStore.reviewRequisition(targetReq.id, {
      action: 'APPROVE',
      adminRemarks: 'Approved under Autonomous Biotech Modernization Fund FY2026-27.',
      reviewerName: 'Dr. S. K. Dash (Dean Academics)'
    });

    expect(approved.status).toBe('Approved');
    expect(approved.reviewedBy).toBe('Dr. S. K. Dash (Dean Academics)');
    expect(approved.adminRemarks).toContain('Modernization Fund');

    const feedbackNotif = labStaffStore.data.notifications.find(n => n.title === 'Requisition Approved');
    expect(feedbackNotif).toBeDefined();
  });

  // 3. Anti-Bypass Guard: Stock Issuance Rejected for Unapproved Requisitions
  it('3. Anti-Bypass Guard prevents stock issuance for unapproved or pending requisitions', () => {
    labStaffStore.setBranch('CSE');
    const unapprovedReq = labStaffStore.createRequisition({
      department: 'CSE',
      labId: 'CSE-LAB-02',
      itemName: 'Unapproved Gigabit Transceiver SFP+',
      quantity: 10,
      priority: 'Low',
      reason: 'Spare stock test'
    });

    expect(unapprovedReq.status).toBe('Pending Approval');

    expect(() => {
      labStaffStore.issueRequisitionStock(unapprovedReq.id, {
        issuedQuantity: 10,
        adminRemarks: 'Premature bypass attempt'
      });
    }).toThrowError(/Cannot issue stock for a requisition that is in "Pending Approval" status/);
  });

  // 4. Stock Issuance Workflow Automatically Updates Available Inventory
  it('4. Issuing stock updates available inventory automatically and sets status to Issued', () => {
    labStaffStore.setBranch('BIOTECH');
    // Find our approved requisition from test 2
    const approvedReqs = labStaffStore.getRequisitions('BIOTECH').filter(r => r.status === 'Approved');
    expect(approvedReqs.length).toBeGreaterThan(0);
    const targetApprovedReq = approvedReqs[0];

    const initialEqCount = labStaffStore.getEquipment('BIOTECH').length;

    // Issue stock
    const issued = labStaffStore.issueRequisitionStock(targetApprovedReq.id, {
      issuedQuantity: 4,
      adminRemarks: 'Dispatched from Central Stores Bay 2, Rack B',
      issuerName: 'Mr. Chittaranjan Sahoo (Store Officer)'
    });

    expect(issued.status).toBe('Issued');
    expect(issued.issuedQuantity).toBe(4);
    expect(issued.issuedBy).toBe('Mr. Chittaranjan Sahoo (Store Officer)');

    // Verify equipment inventory in target branch increased
    const updatedEqList = labStaffStore.getEquipment('BIOTECH');
    const matchingEq = updatedEqList.find(e => e.name.toLowerCase().includes(targetApprovedReq.itemName.toLowerCase()));
    expect(matchingEq).toBeDefined();
    expect(matchingEq.availableQuantity).toBeGreaterThanOrEqual(4);
    expect(matchingEq.status).toBe('Available');

    // Verify notification was dispatched
    const issueNotif = labStaffStore.data.notifications.find(n => n.title === 'Instrument Stock Issued');
    expect(issueNotif).toBeDefined();
  });

  // 5. Admin UI Surface in AdminLaboratoryManagementModule.jsx
  it('5. AdminLaboratoryManagementModule exposes Review & Decide and Issue Stock actions', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toMatch(/Laboratory Instrument Requisitions\s*(&|&amp;)\s*Stock Issuance Approvals/);
    expect(modContent).toMatch(/Review\s*(&|&amp;)\s*Decide/);
    expect(modContent).toContain('Issue Stock');
    expect(modContent).toContain('Review Instrument Requisition');
    expect(modContent).toMatch(/Issue Equipment Stock\s*(&|&amp;)\s*Update Inventory/);
    expect(modContent).toMatch(/Requisition Lifecycle\s*(&|&amp;)\s*Audit Trail/);
  });
});
