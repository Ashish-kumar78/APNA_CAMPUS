import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MarksService } from '../src/marks/marks.service';

test('student marks lookup returns an empty list for an unknown student and never falls back', async () => {
  let captured: any;
  const service = new MarksService({
    assessmentMark: {
      findMany: async (query: any) => { captured = query; return []; },
    },
  } as any);

  assert.deepEqual(await service.getStudentMarks('missing-student-id'), []);
  assert.deepEqual(captured.where.OR, [
    { rollNumber: 'missing-student-id' },
    { studentId: 'missing-student-id' },
  ]);
  assert.deepEqual(await service.getStudentMarks(undefined), []);
});

test('mark edits reject arbitrary Prisma field names and invalid per-field score ranges', async () => {
  let lookups = 0;
  const service = new MarksService({
    assessmentMark: { findFirst: async () => { lookups += 1; return null; } },
  } as any);

  await assert.rejects(service.updateCellMark({
    rollNumber: 'R-1', subjectCode: 'CS101', assessment: 'studentId', score: 1,
  }), BadRequestException);
  await assert.rejects(service.updateCellMark({
    rollNumber: 'R-1', subjectCode: 'CS101', assessment: 'quiz1', score: 11,
  }), BadRequestException);
  assert.equal(lookups, 0);
});

test('faculty can only edit marks for an assigned subject and section', async () => {
  let updates = 0;
  const mark = {
    id: 'mark-id', studentId: 'student-id', rollNumber: 'R-1', studentName: 'Student',
    subjectCode: 'CS101', subjectName: 'Computing', semester: 'Semester 1', section: 'Section B',
    modular1: 0, modular2: 0, quiz1: 0, quiz2: 0, quiz3: 0, quiz4: 0, quiz5: 0, quiz6: 0,
    assignment1: 0, assignment2: 0, surpriseTest1: 0, surpriseTest2: 0, labWork: 0,
  };
  const service = new MarksService({
    assessmentMark: {
      findFirst: async () => mark,
      update: async () => { updates += 1; return mark; },
    },
    facultyAssignment: { findFirst: async () => null },
  } as any);

  await assert.rejects(service.updateCellMark({
    studentId: 'student-id', subjectCode: 'CS101', assessment: 'quiz1', score: 8,
    role: 'FACULTY', facultyId: 'other-faculty', user: 'Faculty',
  }), ForbiddenException);
  assert.equal(updates, 0);
});
