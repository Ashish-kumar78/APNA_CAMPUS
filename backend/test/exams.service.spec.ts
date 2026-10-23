import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ExamsService } from '../src/exams/exams.service';

test('exam cycle creation persists only supplied details and the authenticated requester', async () => {
  let captured: any;
  const now = new Date();
  const service = new ExamsService({
    workflowRequest: {
      create: async ({ data }: { data: any }) => {
        captured = data;
        return { id: 'cycle-id', ...data, createdAt: now };
      },
    },
  } as any);

  const result = await service.createExamCycle({
    title: 'Autumn exams',
    session: 'Autumn 2026',
    startDate: '2026-11-10',
    endDate: '2026-11-25',
  }, { id: 'user-id', name: 'Exam Officer', role: 'EXAM_CELL' });

  assert.equal(captured.requesterId, 'user-id');
  assert.equal(captured.requesterName, 'Exam Officer');
  assert.equal(captured.status, 'Draft');
  assert.deepEqual(captured.details, {
    session: 'Autumn 2026',
    startDate: '2026-11-10',
    endDate: '2026-11-25',
  });
  assert.equal(result.id, 'cycle-id');
});

test('exam cycle transition rejects skipped states and missing cycles', async () => {
  const service = new ExamsService({
    workflowRequest: {
      findFirst: async () => ({ id: 'cycle-id', workflowType: 'EXAM_CYCLE', status: 'Draft' }),
    },
  } as any);
  await assert.rejects(
    service.transitionCycleStatus('cycle-id', 'Published', { id: 'reviewer-id', name: 'Reviewer' }),
    BadRequestException,
  );

  const missingService = new ExamsService({ workflowRequest: { findFirst: async () => null } } as any);
  await assert.rejects(
    missingService.transitionCycleStatus('missing', 'Registration Open', { id: 'reviewer-id', name: 'Reviewer' }),
    NotFoundException,
  );
});

test('exam cycle transition uses a compare-and-set update to prevent concurrent lifecycle skips', async () => {
  let updateWhere: any;
  const updatedAt = new Date();
  const service = new ExamsService({
    workflowRequest: {
      findFirst: async () => ({
        id: 'cycle-id', workflowType: 'EXAM_CYCLE', status: 'Draft', currentStage: 'Draft',
        title: 'Autumn exams', details: { session: 'Autumn 2026' }, createdAt: updatedAt,
      }),
      updateMany: async ({ where }: { where: any }) => {
        updateWhere = where;
        return { count: 0 };
      },
    },
  } as any);

  await assert.rejects(
    service.transitionCycleStatus('cycle-id', 'Registration Open', { id: 'reviewer-id', name: 'Reviewer' }),
    ConflictException,
  );
  assert.deepEqual(updateWhere, { id: 'cycle-id', workflowType: 'EXAM_CYCLE', status: 'Draft' });
});

test('exam timetable and seating routes report unavailable storage rather than demo records', async () => {
  const service = new ExamsService({} as any);
  await assert.rejects(service.getExamTimetable(), ServiceUnavailableException);
  await assert.rejects(service.getSeatingArrangements(), ServiceUnavailableException);
  await assert.rejects(service.getHallTickets(), ServiceUnavailableException);
});
