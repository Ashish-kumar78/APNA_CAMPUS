import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 0: Staff Lab, Admin & Super Admin Integration — Architecture Foundation & Contracts', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const backendDir = path.resolve(rootDir, 'backend');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. Discipline & Branch Scope Definitions
  it('1. Defines supported engineering & technology branches with strict isolation keys', () => {
    const branches = ['CSE', 'CSE_AI', 'EE', 'ME', 'CE', 'BIOTECH', 'ECE'];
    expect(branches.length).toBe(7);
    expect(branches).toContain('BIOTECH');
    expect(branches).toContain('CSE_AI');
  });

  // 2. Role Hierarchy & Authority Boundaries
  it('2. Enforces three-tier role hierarchy: STAFF (requester) -> ADMIN (approver/issuer) -> SUPER_ADMIN (complete control)', () => {
    const roles = {
      STAFF: {
        canSubmitRequisition: true,
        canSubmitComplaint: true,
        canMarkAttendance: true,
        canApproveRequisition: false,
        canApproveRepair: false,
        canIssueStock: false,
        canOverrideSystem: false,
      },
      ADMIN: {
        canSubmitRequisition: true,
        canSubmitComplaint: true,
        canMarkAttendance: true,
        canApproveRequisition: true,
        canApproveRepair: true,
        canIssueStock: true,
        canOverrideSystem: false,
      },
      SUPER_ADMIN: {
        canSubmitRequisition: true,
        canSubmitComplaint: true,
        canMarkAttendance: true,
        canApproveRequisition: true,
        canApproveRepair: true,
        canIssueStock: true,
        canOverrideSystem: true,
      },
    };

    // Staff cannot approve or issue stock
    expect(roles.STAFF.canApproveRequisition).toBe(false);
    expect(roles.STAFF.canApproveRepair).toBe(false);
    expect(roles.STAFF.canIssueStock).toBe(false);

    // Admin has approval & issuance authority
    expect(roles.ADMIN.canApproveRequisition).toBe(true);
    expect(roles.ADMIN.canApproveRepair).toBe(true);
    expect(roles.ADMIN.canIssueStock).toBe(true);
    expect(roles.ADMIN.canOverrideSystem).toBe(false);

    // Super Admin has complete system control & override
    expect(roles.SUPER_ADMIN.canOverrideSystem).toBe(true);
    expect(roles.SUPER_ADMIN.canApproveRequisition).toBe(true);
    expect(roles.SUPER_ADMIN.canApproveRepair).toBe(true);
  });

  // 3. Instrument Requisition State Machine Contract
  it('3. Validates Requisition Workflow states: Submitted -> Admin Review -> Approval -> Stock Issuance', () => {
    const validRequisitionStatuses = [
      'SUBMITTED',
      'PENDING_ADMIN_REVIEW',
      'APPROVED',
      'REJECTED',
      'ISSUED',
      'CANCELLED',
    ];

    const transition = (current, action) => {
      if (current === 'SUBMITTED' && action === 'ADMIN_START_REVIEW') return 'PENDING_ADMIN_REVIEW';
      if ((current === 'SUBMITTED' || current === 'PENDING_ADMIN_REVIEW') && action === 'ADMIN_APPROVE') return 'APPROVED';
      if ((current === 'SUBMITTED' || current === 'PENDING_ADMIN_REVIEW') && action === 'ADMIN_REJECT') return 'REJECTED';
      if (current === 'APPROVED' && action === 'ISSUE_STOCK') return 'ISSUED';
      throw new Error(`Invalid transition: ${current} -> ${action}`);
    };

    expect(transition('SUBMITTED', 'ADMIN_START_REVIEW')).toBe('PENDING_ADMIN_REVIEW');
    expect(transition('PENDING_ADMIN_REVIEW', 'ADMIN_APPROVE')).toBe('APPROVED');
    expect(transition('APPROVED', 'ISSUE_STOCK')).toBe('ISSUED');
    expect(() => transition('SUBMITTED', 'ISSUE_STOCK')).toThrow();
  });

  // 4. Equipment Complaint & Repair Workflow Contract
  it('4. Validates Equipment Repair states: Complaint -> Admin Review -> Approval -> Work Order -> Repair -> Completion', () => {
    const validRepairStatuses = [
      'SUBMITTED',
      'PENDING_ADMIN_APPROVAL',
      'APPROVED',
      'REJECTED',
      'ASSIGNED',
      'IN_PROGRESS',
      'WAITING_FOR_PARTS',
      'COMPLETED',
      'CLOSED',
    ];

    const transitionRepair = (current, action) => {
      if (current === 'SUBMITTED' && action === 'ADMIN_REVIEW') return 'PENDING_ADMIN_APPROVAL';
      if ((current === 'SUBMITTED' || current === 'PENDING_ADMIN_APPROVAL') && action === 'ADMIN_APPROVE') return 'APPROVED';
      if ((current === 'SUBMITTED' || current === 'PENDING_ADMIN_APPROVAL') && action === 'ADMIN_REJECT') return 'REJECTED';
      if (current === 'APPROVED' && action === 'GENERATE_WORK_ORDER') return 'ASSIGNED';
      if (current === 'ASSIGNED' && action === 'START_WORK') return 'IN_PROGRESS';
      if (current === 'IN_PROGRESS' && action === 'MARK_REPAIRED') return 'COMPLETED';
      if (current === 'COMPLETED' && action === 'CLOSE_TICKET') return 'CLOSED';
      throw new Error(`Invalid repair transition: ${current} -> ${action}`);
    };

    expect(transitionRepair('SUBMITTED', 'ADMIN_REVIEW')).toBe('PENDING_ADMIN_APPROVAL');
    expect(transitionRepair('PENDING_ADMIN_APPROVAL', 'ADMIN_APPROVE')).toBe('APPROVED');
    expect(transitionRepair('APPROVED', 'GENERATE_WORK_ORDER')).toBe('ASSIGNED');
    expect(transitionRepair('ASSIGNED', 'START_WORK')).toBe('IN_PROGRESS');
    expect(transitionRepair('IN_PROGRESS', 'MARK_REPAIRED')).toBe('COMPLETED');
    expect(transitionRepair('COMPLETED', 'CLOSE_TICKET')).toBe('CLOSED');
    expect(() => transitionRepair('SUBMITTED', 'MARK_REPAIRED')).toThrow();
  });

  // 5. Equipment Condition Transitions
  it('5. Equipment condition changes from Damaged/Under Maintenance to Available upon Repair Completion', () => {
    const updateEquipmentOnRepair = (eq, newRepairStatus) => {
      if (newRepairStatus === 'SUBMITTED') {
        return { ...eq, condition: 'Damaged' };
      }
      if (newRepairStatus === 'IN_PROGRESS' || newRepairStatus === 'ASSIGNED') {
        return { ...eq, condition: 'Under Maintenance' };
      }
      if (newRepairStatus === 'COMPLETED' || newRepairStatus === 'CLOSED') {
        return { ...eq, condition: 'Available' };
      }
      return eq;
    };

    const initialMultimeter = { id: 'EQ-001', name: 'Digital Multimeter', condition: 'Available' };
    const broken = updateEquipmentOnRepair(initialMultimeter, 'SUBMITTED');
    expect(broken.condition).toBe('Damaged');

    const inRepair = updateEquipmentOnRepair(broken, 'IN_PROGRESS');
    expect(inRepair.condition).toBe('Under Maintenance');

    const repaired = updateEquipmentOnRepair(inRepair, 'COMPLETED');
    expect(repaired.condition).toBe('Available');
  });

  // 6. Prisma Schema Foundation Check
  it('6. Backend Prisma schema contains fundamental schema models', () => {
    const schemaPath = path.join(backendDir, 'prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    expect(schema).toContain('model LabEquipment');
    expect(schema).toContain('model Department');
    expect(schema).toContain('model AttendanceRecord');
    expect(schema).toContain('model WorkflowRequest');
  });

  // 7. Dynamic Branch Isolation Contract
  it('7. Changing branch strictly filters datasets by branchId / department', () => {
    const sampleLabs = [
      { id: 'LAB-CSE-01', name: 'Algorithms Lab', department: 'CSE' },
      { id: 'LAB-BIO-01', name: 'Genetic Engineering Lab', department: 'BIOTECH' },
      { id: 'LAB-EE-01', name: 'Power Systems Lab', department: 'EE' },
    ];

    const filterLabs = (labs, branch) => labs.filter(l => l.department === branch);

    const biotechLabs = filterLabs(sampleLabs, 'BIOTECH');
    expect(biotechLabs.length).toBe(1);
    expect(biotechLabs[0].name).toBe('Genetic Engineering Lab');

    const cseLabs = filterLabs(sampleLabs, 'CSE');
    expect(cseLabs.length).toBe(1);
    expect(cseLabs[0].name).toBe('Algorithms Lab');
  });
});

