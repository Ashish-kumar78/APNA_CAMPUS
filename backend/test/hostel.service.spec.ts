import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { HostelService } from '../src/hostel/hostel.service';

const student = {
  id: 'student-1',
  name: 'Asha Student',
  rollNumber: 'R-001',
  department: 'CSE',
  hostelName: null,
  roomNumber: null,
  bedNumber: null,
  floor: null,
};

const room = {
  id: 'room-1',
  hostelId: 'hostel-1',
  hostelName: 'Residence A',
  roomNumber: '101',
  floor: '1',
  capacity: 2,
  occupied: 0,
};

function allocationService(options: { roomResult?: typeof room | null; roomUpdateCount?: number } = {}) {
  const calls: Record<string, any> = { studentUpdateCount: 0, bedClaim: null, capacityWhere: null };
  const tx = {
    student: {
      findFirst: async () => null,
      updateMany: async () => {
        calls.studentUpdateCount += 1;
        return { count: 1 };
      },
      findUnique: async ({ select }: any) => {
        calls.studentSelect = select;
        return { ...student, name: student.name, rollNumber: student.rollNumber };
      },
    },
    workflowRequest: {
      findUnique: async () => null,
      create: async ({ data }: any) => { calls.bedClaim = data; return data; },
    },
    hostelRoom: {
      updateMany: async ({ where, data }: any) => {
        calls.capacityWhere = where;
        calls.capacityData = data;
        return { count: options.roomUpdateCount ?? 1 };
      },
    },
  };
  const prisma = {
    student: { findUnique: async () => student },
    hostelRoom: { findFirst: async () => options.roomResult === undefined ? room : options.roomResult },
    $transaction: async (callback: (transaction: any) => unknown) => callback(tx),
  };
  return { service: new HostelService(prisma as any, {} as any), calls };
}

const actor = { id: 'user-admin', name: 'Hostel Admin', role: 'ADMIN' };

test('hostel allocation reserves a unique bed and conditionally increments room occupancy', async () => {
  const { service, calls } = allocationService();

  const result = await service.allocateBed({
    studentRoll: 'R-001',
    hostelName: 'Residence A',
    roomNumber: '101',
    bedNumber: 'Bed 1',
  }, actor);

  assert.equal(result.success, true);
  assert.equal(calls.bedClaim.workflowType, 'HOSTEL_BED_ALLOCATION');
  assert.equal(calls.bedClaim.status, 'ACTIVE');
  assert.equal(calls.bedClaim.details.studentId, student.id);
  assert.deepEqual(calls.capacityWhere, { id: room.id, capacity: room.capacity, occupied: { lt: room.capacity } });
  assert.deepEqual(calls.capacityData, { occupied: { increment: 1 } });
  assert.equal(calls.studentUpdateCount, 1);
  assert.equal(calls.studentSelect.passwordHash, undefined);
});

test('hostel allocation rejects a missing room without writing', async () => {
  const { service, calls } = allocationService({ roomResult: null });

  await assert.rejects(
    service.allocateBed({ studentRoll: 'R-001', hostelName: 'Missing', roomNumber: '404', bedNumber: 'Bed 1' }, actor),
    NotFoundException,
  );
  assert.equal(calls.bedClaim, null);
  assert.equal(calls.studentUpdateCount, 0);
});

test('hostel allocation rejects a full or concurrently changed room before student update', async () => {
  const { service, calls } = allocationService({ roomUpdateCount: 0 });

  await assert.rejects(
    service.allocateBed({ studentRoll: 'R-001', hostelName: 'Residence A', roomNumber: '101', bedNumber: 'Bed 1' }, actor),
    ConflictException,
  );
  assert.equal(calls.studentUpdateCount, 0);
});

test('hostel overview derives capacity from persisted room rows, not denormalized hostel totals', async () => {
  const prisma = {
    hostel: { findMany: async () => [{ id: 'hostel-1', totalBeds: 200, occupiedBeds: 190, availableBeds: 10 }] },
    hostelRoom: { findMany: async () => [{ ...room, capacity: 3, occupied: 1 }] },
  };
  const service = new HostelService(prisma as any, {} as any);

  const hostels = await service.getHostels();

  assert.equal(hostels[0].totalBeds, 3);
  assert.equal(hostels[0].occupiedBeds, 1);
  assert.equal(hostels[0].availableBeds, 2);
});

test('hostel complaint identity and residence are resolved from the linked student record', async () => {
  const persistedStudent = {
    id: 'student-authenticated',
    name: 'Verified Resident',
    rollNumber: 'R-900',
    hostelName: 'Residence B',
    roomNumber: '208',
  };
  let createdComplaint: any;
  const prisma = {
    student: { findUnique: async () => persistedStudent },
    hostelComplaint: {
      findFirst: async () => null,
      create: async ({ data }: any) => { createdComplaint = data; return { id: 'complaint-1', ...data }; },
    },
  };
  const ai = {
    predictCategory: async () => ({ category: 'Electrical', confidence: 0.9, needsReview: false }),
    assignStaffByWorkload: async () => ({ assignedStaffId: 'staff-1', assignedStaffName: 'Verified Staff', notes: 'Assigned.' }),
  };
  const service = new HostelService(prisma as any, ai as any);

  await service.lodgeComplaint('student-authenticated', {
    title: 'Broken light',
    category: 'Electrical',
    studentId: 'forged-student',
    studentName: 'Forged Name',
    rollNumber: 'FORGED-ROLL',
    hostel: 'Forged Residence',
    roomNumber: '999',
  } as any);

  assert.equal(createdComplaint.studentId, persistedStudent.id);
  assert.equal(createdComplaint.studentName, persistedStudent.name);
  assert.equal(createdComplaint.rollNumber, persistedStudent.rollNumber);
  assert.equal(createdComplaint.hostel, persistedStudent.hostelName);
  assert.equal(createdComplaint.roomNumber, persistedStudent.roomNumber);
});

test('hostel complaints require a current room allocation', async () => {
  const prisma = {
    student: { findUnique: async () => ({ ...student, hostelName: null, roomNumber: null }) },
  };
  const service = new HostelService(prisma as any, {} as any);

  await assert.rejects(
    service.lodgeComplaint('student-1', { title: 'Broken light' }),
    BadRequestException,
  );
});

test('student gate pass query is scoped by authenticated account and omits fabricated identity defaults', async () => {
  let where: any;
  const createdAt = new Date('2026-10-21T12:00:00.000Z');
  const prisma = {
    workflowRequest: {
      findMany: async (args: any) => {
        where = args.where;
        return [{
          id: 'request-1',
          workflowType: 'HOSTEL_GATE_PASS',
          requesterId: 'auth-user-1',
          requesterName: 'Resident',
          department: null,
          status: 'Pending Warden Approval',
          details: {},
          createdAt,
        }];
      },
    },
  };
  const service = new HostelService(prisma as any, {} as any);

  const passes = await service.getGatePasses(undefined, undefined, 'auth-user-1');

  assert.equal(where.requesterId, 'auth-user-1');
  assert.equal(passes[0].rollNumber, null);
  assert.equal(passes[0].hostelName, null);
  assert.equal(passes[0].parentConsentVerified, false);
  assert.equal(passes[0].mentorStatus, 'Not verified');
  assert.equal(passes[0].qrCodeString, null);
});

test('gate pass creation binds owner and residence from the linked student, ignoring client identity claims', async () => {
  const resident = {
    id: 'student-verified',
    name: 'Verified Resident',
    rollNumber: 'R-999',
    department: 'ECE',
    hostelName: 'Residence C',
    roomNumber: '302',
    bedNumber: 'Bed 2',
  };
  let createData: any;
  const prisma = {
    student: { findUnique: async () => resident },
    workflowRequest: { create: async ({ data }: any) => { createData = data; return data; } },
  };
  const service = new HostelService(prisma as any, {} as any);
  const outDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const inDateTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

  await service.createGatePass({
    purposeType: 'Home Visit',
    destination: 'City',
    outDateTime,
    inDateTime,
    studentName: 'Forged Name',
    rollNumber: 'FORGED',
    hostelName: 'Forged Residence',
    parentConsentVerified: true,
  } as any, { id: 'auth-user-verified', student: { id: resident.id } });

  assert.equal(createData.requesterId, 'auth-user-verified');
  assert.equal(createData.requesterName, resident.name);
  assert.equal(createData.details.rollNumber, resident.rollNumber);
  assert.equal(createData.details.hostelName, resident.hostelName);
  assert.equal(createData.details.roomNumber, resident.roomNumber);
  assert.equal(createData.details.parentConsentVerified, false);
  assert.equal(createData.details.mentorStatus, 'Not verified');
  assert.equal(createData.details.qrCodeString, null);
});

test('gate pass action uses the expected current status as a compare-and-set', async () => {
  const request = {
    id: 'pass-1',
    workflowType: 'HOSTEL_GATE_PASS',
    status: 'Pending Warden Approval',
    details: {},
    history: [],
  };
  let updateWhere: any;
  const prisma = {
    workflowRequest: {
      findUnique: async () => request,
      updateMany: async ({ where }: any) => { updateWhere = where; return { count: 1 }; },
    },
  };
  const service = new HostelService(prisma as any, {} as any);

  await service.actionGatePass('pass-1', 'APPROVE', { id: 'warden-1', name: 'Warden', role: 'warden' });

  assert.deepEqual(updateWhere, { id: 'pass-1', workflowType: 'HOSTEL_GATE_PASS', status: 'Pending Warden Approval' });
});

test('gate pass cannot skip approval or return a request that has not exited', async () => {
  const prisma = {
    workflowRequest: {
      findUnique: async () => ({ id: 'pass-1', workflowType: 'HOSTEL_GATE_PASS', status: 'Pending Warden Approval', details: {}, history: [] }),
      updateMany: async () => { throw new Error('must not write'); },
    },
  };
  const service = new HostelService(prisma as any, {} as any);

  const actor = { id: 'warden-1', name: 'Warden', role: 'warden' };
  await assert.rejects(service.actionGatePass('pass-1', 'RECORD_EXIT', actor), ConflictException);
  await assert.rejects(service.actionGatePass('pass-1', 'RECORD_RETURN', actor), ConflictException);
});

test('assigned maintenance staff may only update tickets linked to their own roster identity', async () => {
  const complaint = { id: 'complaint-2', status: 'Assigned', assignedStaffId: 'roster-staff-1', needsReview: false };
  let updates = 0;
  const prisma = {
    hostelComplaint: {
      findUnique: async () => complaint,
      updateMany: async () => { updates += 1; return { count: 1 }; },
    },
  };
  const service = new HostelService(prisma as any, {} as any);

  await assert.rejects(
    service.updateComplaintStatus('complaint-2', 'In Progress', undefined, undefined, undefined, { id: 'another-roster-user', role: 'staff' }),
    ForbiddenException,
  );
  assert.equal(updates, 0);
});

test('complaint updates reject skipped lifecycle states and resolve staff assignments from roster IDs', async () => {
  const complaint = { id: 'complaint-3', status: 'Pending', assignedStaffId: null, needsReview: false };
  let updates = 0;
  const prisma = {
    hostelComplaint: {
      findUnique: async () => complaint,
      updateMany: async () => { updates += 1; return { count: 1 }; },
    },
    staffRoster: { findUnique: async () => null },
  };
  const service = new HostelService(prisma as any, {} as any);

  await assert.rejects(service.updateComplaintStatus('complaint-3', 'Resolved'), ConflictException);
  await assert.rejects(service.updateComplaintStatus('complaint-3', 'Assigned', 'A made-up name', undefined), BadRequestException);
  await assert.rejects(service.updateComplaintStatus('complaint-3', 'Assigned', undefined, undefined, 'missing-roster-id'), NotFoundException);
  assert.equal(updates, 0);
});
