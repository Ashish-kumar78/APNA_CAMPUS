import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 9: Admin Repair Complaints & Work Order Workflow', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. Staff filing complaint marks equipment as Damaged and notifies Admin
  it('1. Staff filing complaint marks equipment as Damaged and notifies Admin', () => {
    labStaffStore.setBranch('ECE');
    const eqList = labStaffStore.getEquipment('ECE');
    expect(eqList.length).toBeGreaterThan(0);
    const targetEq = eqList[0];

    const complaint = labStaffStore.createComplaint({
      department: 'ECE',
      labId: 'ECE-LAB-01',
      equipmentId: targetEq.id,
      equipmentName: targetEq.name,
      category: 'Damaged instruments',
      priority: 'High',
      description: 'CRO Channel 1 trace distorted, vertical attenuation intermittent.'
    });

    expect(complaint).toBeDefined();
    expect(complaint.complaintNumber).toMatch(/^CMP-\d{4}-\d{3}$/);
    expect(complaint.status).toBe('Submitted');

    // Verify equipment is now marked as Damaged
    const updatedEq = labStaffStore.getEquipment('ECE').find(e => e.id === targetEq.id);
    expect(updatedEq).toBeDefined();
    expect(updatedEq.status).toBe('Damaged');
    expect(updatedEq.condition).toBe('Damaged');

    // Verify Admin notification was pushed
    const notifs = labStaffStore.data.notifications;
    const cmpNotif = notifs.find(n => n.title === 'Equipment Complaint Filed' && n.message.includes(targetEq.name));
    expect(cmpNotif).toBeDefined();
    expect(cmpNotif.unread).toBe(true);
  });

  // 2. Admin review APPROVE generates Work Order number (WO-***), assigns technician, and updates equipment to Under Maintenance
  it('2. Admin review APPROVE generates Work Order number (WO-***), assigns technician, and sets equipment to Under Maintenance', () => {
    labStaffStore.setBranch('ECE');
    const pendingComplaints = labStaffStore.getComplaints('ECE').filter(c => c.status === 'Submitted');
    expect(pendingComplaints.length).toBeGreaterThan(0);
    const targetComplaint = pendingComplaints[0];

    const approved = labStaffStore.reviewComplaint(targetComplaint.id, {
      action: 'APPROVE',
      assignedTechnician: 'Electronics Calibration Cell (CIF)',
      adminRemarks: 'Authorized emergency bench calibration and trace resistor check.',
      reviewerName: 'Admin Er. R. N. Mohanty'
    });

    expect(approved).toBeDefined();
    expect(approved.status).toBe('Assigned');
    expect(approved.workOrderNumber).toMatch(/^WO-\d{4}-\d{4}$/);
    expect(approved.assignedTechnician).toBe('Electronics Calibration Cell (CIF)');
    expect(approved.reviewedBy).toBe('Admin Er. R. N. Mohanty');

    // Verify linked equipment is now Under Maintenance
    if (targetComplaint.equipmentId) {
      const eq = labStaffStore.getEquipment('ECE').find(e => e.id === targetComplaint.equipmentId);
      expect(eq.status).toBe('Under Maintenance');
      expect(eq.condition).toBe('Under Maintenance');
    }

    // Verify maintenance order is created
    const maintOrders = labStaffStore.getMaintenanceOrders('ECE');
    const linkedOrder = maintOrders.find(m => m.id === approved.workOrderNumber);
    expect(linkedOrder).toBeDefined();
    expect(linkedOrder.assignedTechnician).toBe('Electronics Calibration Cell (CIF)');

    // Verify Work Order notification
    const woNotif = labStaffStore.data.notifications.find(n => n.title === 'Work Order Generated & Approved');
    expect(woNotif).toBeDefined();
  });

  // 3. Anti-Bypass Guard: Unapproved complaints cannot have work order progress updated
  it('3. Anti-Bypass Guard prevents progress updates on unapproved complaints', () => {
    labStaffStore.setBranch('MECH');
    const rawComplaint = labStaffStore.createComplaint({
      department: 'MECH',
      labId: 'MECH-LAB-01',
      equipmentName: 'Universal Testing Machine 100kN',
      category: 'Damaged instruments',
      priority: 'Critical',
      description: 'Extensometer strain gauge detachment.'
    });

    expect(rawComplaint.status).toBe('Submitted');
    expect(rawComplaint.workOrderNumber).toBeNull();

    expect(() => {
      labStaffStore.updateWorkOrderProgress(rawComplaint.id, {
        status: 'Completed',
        resolutionNotes: 'Premature bypass attempt without admin approval.'
      });
    }).toThrowError(/Complaint is pending Admin review and has no authorized Work Order/);
  });

  // 4. Admin review REJECT marks complaint rejected with admin remarks
  it('4. Admin review REJECT updates complaint to Rejected and notifies staff', () => {
    labStaffStore.setBranch('MECH');
    const unapproved = labStaffStore.getComplaints('MECH').find(c => c.status === 'Submitted');
    expect(unapproved).toBeDefined();

    const rejected = labStaffStore.reviewComplaint(unapproved.id, {
      action: 'REJECT',
      adminRemarks: 'Duplicate complaint already being serviced under vendor contract.',
      reviewerName: 'Admin Workshop Superintendent'
    });

    expect(rejected.status).toBe('Rejected');
    expect(rejected.adminRemarks).toContain('Duplicate complaint');

    const rejNotif = labStaffStore.data.notifications.find(n => n.title === 'Equipment Complaint Rejected');
    expect(rejNotif).toBeDefined();
  });

  // 5. Completing work order automatically restores equipment status to Available
  it('5. Completing work order automatically restores equipment status to Available and Operational / Good', () => {
    labStaffStore.setBranch('ECE');
    const assignedComplaints = labStaffStore.getComplaints('ECE').filter(c => c.status === 'Assigned' && c.workOrderNumber);
    expect(assignedComplaints.length).toBeGreaterThan(0);
    const target = assignedComplaints[0];

    const completed = labStaffStore.updateWorkOrderProgress(target.id, {
      status: 'Completed',
      resolutionNotes: 'Replaced horizontal sweep trigger transistor and recalibrated time base. Signal verified with standard 1kHz square wave.'
    });

    expect(completed.status).toBe('Completed');
    expect(completed.resolutionNotes).toContain('recalibrated time base');

    // Linked equipment must be restored to Available & Operational / Good
    if (target.equipmentId) {
      const restoredEq = labStaffStore.getEquipment('ECE').find(e => e.id === target.equipmentId);
      expect(restoredEq.status).toBe('Available');
      expect(restoredEq.condition).toBe('Operational / Good');
    }

    // Verify Repair Completed notification
    const doneNotif = labStaffStore.data.notifications.find(n => n.title === 'Equipment Repair Completed');
    expect(doneNotif).toBeDefined();
  });

  // 6. Admin UI Surface in AdminLaboratoryManagementModule.jsx
  it('6. AdminLaboratoryManagementModule exposes Review & Authorize, Update Progress, and Workflow Timeline modals', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toMatch(/Review\s*(&|&amp;)\s*Authorize/);
    expect(modContent).toMatch(/Update Maintenance\s*(&|&amp;)\s*Repair Status/);
    expect(modContent).toMatch(/Approve\s*(&|&amp;)\s*Issue Work Order/);
    expect(modContent).toContain('Reject Complaint');
    expect(modContent).toContain('Assign Maintenance Team / Technician');
    expect(modContent).toMatch(/Service, Parts Replaced\s*(&|&amp;)\s*Resolution Notes/);
    expect(modContent).toContain('Save Progress Update');
    expect(modContent).toMatch(/ERP Auto-Restoration Rule/);
  });
});

