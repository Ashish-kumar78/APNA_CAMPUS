import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ForbiddenException } from '@nestjs/common';
import { FacultyController } from '../src/faculty/faculty.controller';

test('attendance routes require a Faculty role with a linked Faculty profile', async () => {
  const controller = new FacultyController({
    getAttendanceRoster: async () => [],
    getAttendanceSessions: async () => [],
    submitAttendanceSession: async () => ({}),
  } as any);

  await assert.rejects(
    controller.getAttendanceRoster({ role: 'STUDENT', faculty: { id: 'faculty-1' } }, 'CS501', 'Section A'),
    ForbiddenException,
  );
  await assert.rejects(
    controller.getAttendanceSessions({ role: 'FACULTY' }, 'CS501', 'Section A'),
    ForbiddenException,
  );
  await assert.rejects(
    controller.submitAttendance({ role: 'HOD', id: 'user-1', faculty: { id: 'faculty-1' } }, {} as any),
    ForbiddenException,
  );
});

test('attendance submission passes only JWT faculty and user IDs with the validated request body', async () => {
  let call: any;
  const controller = new FacultyController({
    getAttendanceRoster: async () => [],
    getAttendanceSessions: async () => [],
    submitAttendanceSession: async (...args: any[]) => {
      call = args;
      return { id: 'session-1', message: 'saved' };
    },
  } as any);
  const user = { role: 'FACULTY', id: 'user-1', faculty: { id: 'faculty-1' } };
  const body = {
    subjectCode: 'CS501',
    section: 'Section A',
    date: '2026-10-21',
    period: 'Period 1',
    attendanceMap: { 'R-001': true },
    facultyName: 'spoofed name',
  };

  const result = await controller.submitAttendance(user, body as any);

  assert.deepEqual(call, [user.faculty.id, user.id, body]);
  assert.deepEqual(result, { success: true, message: 'saved', data: { id: 'session-1', message: 'saved' } });
});
