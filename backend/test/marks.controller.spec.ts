import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MarksController } from '../src/marks/marks.controller';

test('student marks route requires a linked profile and ignores client attempts to select another student', async () => {
  let receivedIdentifier: string | undefined;
  const controller = new MarksController({
    getStudentMarks: async (identifier: string) => { receivedIdentifier = identifier; return []; },
  } as any);
  const studentUser = {
    role: 'STUDENT',
    identifier: 'STU-001',
    student: { id: 'linked-db-id', rollNumber: 'R-001' },
  };

  await assert.rejects(controller.getStudentMarks(studentUser, 'R-002'), ForbiddenException);
  await controller.getStudentMarks(studentUser, 'R-001');
  assert.equal(receivedIdentifier, 'linked-db-id');
  await assert.rejects(controller.getStudentMarks({ role: 'STUDENT', identifier: 'STU-001' }, undefined), NotFoundException);
});
