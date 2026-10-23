import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { HodService } from '../src/hod/hod.service';

test('HOD approval queue is filtered to the assigned department subject codes', async () => {
  let capturedWhere: any;
  const service = new HodService({
    subject: { findMany: async () => [{ code: 'CS101' }, { code: 'CS102' }] },
    approvalQueue: { findMany: async ({ where }: any) => { capturedWhere = where; return []; } },
  } as any);

  const result = await service.getApprovalQueue({ role: 'hod', reviewer: 'HOD', departments: ['CSE'] });

  assert.deepEqual(capturedWhere, { subjectCode: { in: ['CS101', 'CS102'] } });
  assert.deepEqual(result.data, []);
});

test('HOD cannot approve another department submission or a submission outside pending state', async () => {
  let writes = 0;
  const item = { id: 'approval-id', subjectCode: 'EE101', subject: 'Circuits', section: 'Section A', status: 'Pending' };
  const service = new HodService({
    approvalQueue: {
      findUnique: async () => item,
      update: async () => { writes += 1; return item; },
    },
    subject: { findUnique: async () => ({ code: 'EE101', department: 'EEE' }) },
  } as any);

  await assert.rejects(service.approveMarks('approval-id', {
    role: 'hod', reviewer: 'CSE HOD', departments: ['CSE'],
  }), ForbiddenException);
  assert.equal(writes, 0);

  const approvedService = new HodService({
    approvalQueue: { findUnique: async () => ({ ...item, status: 'Approved' }) },
    subject: { findUnique: async () => ({ code: 'EE101', department: 'EEE' }) },
  } as any);
  await assert.rejects(approvedService.approveMarks('approval-id', {
    role: 'hod', reviewer: 'EEE HOD', departments: ['EEE'],
  }), BadRequestException);
});
