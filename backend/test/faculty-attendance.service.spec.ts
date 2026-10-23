import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { FacultyService } from '../src/faculty/faculty.service';

const assignment = {
  id: 'assignment-1',
  facultyId: 'faculty-1',
  faculty: { name: 'Dr Example' },
  facultyAssignmentId: undefined,
  courseOfferingId: 'course-1',
  section: 'Section A',
  academicYear: '2026-27',
  courseOffering: {
    subjectCode: 'CS501',
    subjectName: 'Data Structures',
    semester: 'Semester 5',
    department: 'CSE',
  },
};

const students = [
  { id: 'student-1', rollNumber: 'R-001', name: 'Asha' },
  { id: 'student-2', rollNumber: 'R-002', name: 'Ravi' },
];

const payload = {
  subjectCode: 'CS501',
  section: 'Section A',
  date: '2026-10-21',
  period: 'Period 1 (09:00 - 10:00 AM)',
  attendanceMap: { 'R-001': true, 'R-002': false },
};

function makeService(options: {
  assignmentResult?: typeof assignment | null;
  roster?: typeof students;
  assignments?: { id: string }[];
  transactionError?: unknown;
} = {}) {
  const calls: any = {
    assignmentWhere: undefined,
    assignmentsWhere: undefined,
    rosterWhere: undefined,
    sessionsWhere: undefined,
    sessionData: undefined,
    auditData: undefined,
  };
  const tx = {
    attendanceSession: {
      create: async ({ data }: any) => {
        calls.sessionData = data;
        if (options.transactionError) throw options.transactionError;
        return { id: 'session-1', ...data };
      },
    },
    auditLog: {
      create: async ({ data }: any) => {
        calls.auditData = data;
        return data;
      },
    },
  };
  const prisma = {
    facultyAssignment: {
      findFirst: async ({ where }: any) => {
        calls.assignmentWhere = where;
        return options.assignmentResult === undefined ? assignment : options.assignmentResult;
      },
      findMany: async ({ where }: any) => {
        calls.assignmentsWhere = where;
        return options.assignments || [{ id: 'assignment-1' }];
      },
    },
    student: {
      findMany: async ({ where }: any) => {
        calls.rosterWhere = where;
        return options.roster || students;
      },
    },
    attendanceSession: {
      findMany: async ({ where }: any) => {
        calls.sessionsWhere = where;
        return [{ id: 'saved-session' }];
      },
    },
    $transaction: async (callback: (transaction: any) => unknown) => callback(tx),
  };
  return { service: new FacultyService(prisma as any), calls };
}

test('attendance submission checks the assignment and exact active roster, then persists session and audit together', async () => {
  const { service, calls } = makeService();

  const result = await service.submitAttendanceSession('faculty-1', 'user-1', payload);

  assert.equal(calls.assignmentWhere.facultyId, 'faculty-1');
  assert.equal(calls.assignmentWhere.section, 'Section A');
  assert.deepEqual(calls.assignmentWhere.courseOffering, { is: { subjectCode: 'CS501' } });
  assert.equal(calls.rosterWhere.semester, 'Semester 5');
  assert.equal(calls.rosterWhere.academicYear, '2026-27');
  assert.equal(calls.sessionData.subjectName, 'Data Structures');
  assert.equal(calls.sessionData.recordedByUserId, 'user-1');
  assert.equal(calls.sessionData.totalCount, 2);
  assert.equal(calls.sessionData.presentCount, 1);
  assert.equal(calls.sessionData.absentCount, 1);
  assert.equal(calls.sessionData.percentage, 50);
  assert.deepEqual(calls.sessionData.entries, [
    { studentId: 'student-1', rollNumber: 'R-001', name: 'Asha', present: true },
    { studentId: 'student-2', rollNumber: 'R-002', name: 'Ravi', present: false },
  ]);
  assert.equal(calls.auditData.assessment, 'PERIOD_ATTENDANCE');
  assert.equal(result.id, 'session-1');
});

test('attendance rejects a partial or foreign roster before writing', async () => {
  const { service, calls } = makeService();

  await assert.rejects(
    service.submitAttendanceSession('faculty-1', 'user-1', {
      ...payload,
      attendanceMap: { 'R-001': true, 'R-999': false },
    }),
    BadRequestException,
  );
  assert.equal(calls.sessionData, undefined);
});

test('attendance rejects invalid calendar dates and non-boolean marks', async () => {
  const { service } = makeService();
  await assert.rejects(
    service.submitAttendanceSession('faculty-1', 'user-1', { ...payload, date: '2026-02-30' }),
    BadRequestException,
  );
  await assert.rejects(
    service.submitAttendanceSession('faculty-1', 'user-1', {
      ...payload,
      attendanceMap: { 'R-001': 'present', 'R-002': false } as any,
    }),
    BadRequestException,
  );
});

test('attendance cannot be submitted for a subject section outside the faculty assignment', async () => {
  const { service } = makeService({ assignmentResult: null });
  await assert.rejects(
    service.submitAttendanceSession('faculty-1', 'user-1', payload),
    ForbiddenException,
  );
});

test('duplicate attendance period returns a conflict when the unique session key is already used', async () => {
  const { service } = makeService({ transactionError: { code: 'P2002' } });
  await assert.rejects(
    service.submitAttendanceSession('faculty-1', 'user-1', payload),
    ConflictException,
  );
});

test('attendance roster lookup requires and checks an assigned subject section', async () => {
  const { service, calls } = makeService();

  const roster = await service.getAttendanceRoster('faculty-1', 'CS501', 'Section A');

  assert.deepEqual(roster, students);
  assert.equal(calls.assignmentWhere.facultyId, 'faculty-1');
  assert.deepEqual(calls.rosterWhere.OR, [
    { deptCode: 'CSE' },
    { department: 'CSE' },
  ]);
});

test('attendance history is queried only for the requesting faculty member assignments', async () => {
  const { service, calls } = makeService({ assignments: [{ id: 'assigned-1' }, { id: 'assigned-2' }] });

  const sessions = await service.getAttendanceSessions('faculty-1', 'CS501', 'Section A');

  assert.deepEqual(sessions, [{ id: 'saved-session' }]);
  assert.equal(calls.assignmentsWhere.facultyId, 'faculty-1');
  assert.deepEqual(calls.sessionsWhere, {
    facultyAssignmentId: { in: ['assigned-1', 'assigned-2'] },
  });
});
