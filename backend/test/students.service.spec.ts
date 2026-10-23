import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { StudentsService } from '../src/students/students.service';

test('student roster search and department filters are both enforced', async () => {
  let capturedWhere: any;
  const service = new StudentsService({
    student: {
      findMany: async ({ where }: { where: any }) => {
        capturedWhere = where;
        return [];
      },
    },
  } as any);

  const result = await service.getAllStudents({ department: 'CSE', search: 'Asha' });

  assert.deepEqual(result, []);
  assert.equal(capturedWhere.AND.length, 2);
  assert.ok(capturedWhere.AND.some((filter: any) => filter.OR?.some((item: any) => item.deptCode === 'CSE')));
  assert.ok(capturedWhere.AND.some((filter: any) => filter.OR?.some((item: any) => item.name?.contains === 'Asha')));
});

test('student profile lookup is bound to the linked database id and does not fall back', async () => {
  let capturedWhere: any;
  const service = new StudentsService({
    student: {
      findUnique: async ({ where }: { where: any }) => {
        capturedWhere = where;
        return null;
      },
    },
  } as any);

  await assert.rejects(service.getProfile('student-db-id'), NotFoundException);
  assert.deepEqual(capturedWhere, { id: 'student-db-id' });
});

test('transfer preference looks up and updates only the linked student id', async () => {
  const calls: any[] = [];
  const service = new StudentsService({
    student: {
      findUnique: async ({ where }: { where: any }) => {
        calls.push(['findUnique', where]);
        return { id: 'student-db-id' };
      },
      update: async ({ where, data }: { where: any; data: any }) => {
        calls.push(['update', where, data]);
        return { id: 'student-db-id', ...data };
      },
    },
  } as any);

  const result = await service.saveTransferPreference('student-db-id', 'North Campus', 'Cuttack');

  assert.equal(result.transferConfirmed, true);
  assert.deepEqual(calls, [
    ['findUnique', { id: 'student-db-id' }],
    ['update', { id: 'student-db-id' }, {
      transferConfirmed: true,
      transferCampus: 'North Campus',
      transferCity: 'Cuttack',
    }],
  ]);
});
