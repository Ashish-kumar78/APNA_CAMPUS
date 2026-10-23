import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type CreateExamCycle = {
  title: string;
  session: string;
  startDate: string;
  endDate: string;
};

const CYCLE_TRANSITIONS: Record<string, string | null> = {
  Draft: 'Registration Open',
  'Registration Open': 'Registration Closed',
  'Registration Closed': 'Scheduling',
  Scheduling: 'Admit Cards Ready',
  'Admit Cards Ready': 'In Progress',
  'In Progress': 'Evaluation',
  Evaluation: 'Moderation',
  Moderation: 'Results Approval',
  'Results Approval': 'Published',
  Published: 'Closed',
  Closed: null,
};

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [cycles, configuredExamSchedulesCount] = await Promise.all([
      this.prisma.workflowRequest.findMany({
        where: { workflowType: 'EXAM_CYCLE' },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.examSchedule.count(),
    ]);

    const activeCycles = cycles
      .filter((cycle) => cycle.status !== 'Closed')
      .map((cycle) => this.toCycleResponse(cycle));

    return {
      activeCyclesCount: activeCycles.length,
      activeCycles,
      configuredExamSchedulesCount,
      registeredExaminees: null,
      scheduledPapersCount: null,
      timetableConflictsCount: null,
      hallCapacityTotal: null,
      hallCapacityAllocated: null,
      capacityUtilizationRate: null,
      admitCardsIssued: null,
      admitCardsOnHold: null,
      attendanceDetainedCount: null,
      pendingFeeHoldCount: null,
      moderationPendingSubjects: null,
      moderationCompletedSubjects: null,
      marksAwaitingApproval: null,
      certifiedResultsReady: null,
      pendingReevaluationsCount: null,
      publishedCircularsCount: null,
      upcomingSessions: [],
      examHalls: [],
      unavailableMetrics: [
        'registeredExaminees',
        'scheduledPapersCount',
        'timetableConflictsCount',
        'hallCapacityTotal',
        'hallCapacityAllocated',
        'capacityUtilizationRate',
        'admitCardsIssued',
        'admitCardsOnHold',
        'attendanceDetainedCount',
        'pendingFeeHoldCount',
        'moderationPendingSubjects',
        'moderationCompletedSubjects',
        'marksAwaitingApproval',
        'certifiedResultsReady',
        'pendingReevaluationsCount',
        'publishedCircularsCount',
        'upcomingSessions',
        'examHalls',
      ],
    };
  }

  async getExamCycles() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'EXAM_CYCLE' },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.toCycleResponse(record));
  }

  async createExamCycle(data: CreateExamCycle, user: { id: string; name: string; role: string }) {
    if (new Date(data.endDate).getTime() < new Date(data.startDate).getTime()) {
      throw new BadRequestException('The examination cycle end date must be on or after its start date.');
    }

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'EXAM_CYCLE',
        title: data.title.trim(),
        requesterId: user.id,
        requesterName: user.name,
        requesterRole: user.role,
        department: 'Examination Cell',
        currentStage: 'Draft',
        status: 'Draft',
        details: {
          session: data.session.trim(),
          startDate: data.startDate,
          endDate: data.endDate,
        },
      },
    });
    return this.toCycleResponse(record);
  }

  async transitionCycleStatus(id: string, newStatus: string, user: { id: string; name: string }) {
    const record = await this.prisma.workflowRequest.findFirst({
      where: { id, workflowType: 'EXAM_CYCLE' },
    });
    if (!record) {
      throw new NotFoundException('Examination cycle was not found.');
    }

    if (record.status === newStatus) {
      return { success: true, message: 'Examination cycle is already in that state.', data: this.toCycleResponse(record) };
    }
    if (CYCLE_TRANSITIONS[record.status] !== newStatus) {
      throw new BadRequestException(`Invalid examination cycle transition from ${record.status} to ${newStatus}.`);
    }

    const details = { ...this.asObject(record.details) } as Record<string, Prisma.InputJsonValue>;
    if (newStatus === 'Published') details.publishedAt = new Date().toISOString();
    if (newStatus === 'Admit Cards Ready') details.hallTicketsReleased = true;

    const transition = await this.prisma.workflowRequest.updateMany({
      where: { id, workflowType: 'EXAM_CYCLE', status: record.status },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details: details as Prisma.InputJsonObject,
        approverId: user.id,
        approverName: user.name,
      },
    });
    if (transition.count !== 1) {
      throw new ConflictException('The examination cycle changed while this action was being processed. Refresh and try again.');
    }

    const updated = await this.prisma.workflowRequest.findFirst({
      where: { id, workflowType: 'EXAM_CYCLE' },
    });
    if (!updated) {
      throw new NotFoundException('Examination cycle was not found after the transition.');
    }
    return { success: true, message: `Cycle transitioned to ${newStatus}.`, data: this.toCycleResponse(updated) };
  }

  async getExamTimetable(): Promise<never> {
    throw new ServiceUnavailableException('Exam paper timetable storage is not configured yet.');
  }

  async createTimetableEntry(_entry?: unknown): Promise<never> {
    throw new ServiceUnavailableException('Exam paper timetable storage is not configured yet.');
  }

  async getSeatingArrangements(): Promise<never> {
    throw new ServiceUnavailableException('Exam hall and seat allocation storage is not configured yet.');
  }

  async autoOptimizeSeating(): Promise<never> {
    throw new ServiceUnavailableException('Exam seating optimization is unavailable until hall and seat allocation storage is configured.');
  }

  async getHallTickets(): Promise<never> {
    throw new ServiceUnavailableException('Hall ticket eligibility and issuance storage is not configured yet.');
  }

  async getModerationMarks(subjectCode: string) {
    const subject = await this.prisma.subject.findUnique({ where: { code: subjectCode } });
    if (!subject) {
      throw new NotFoundException('Subject was not found.');
    }

    const records = await this.prisma.assessmentMark.findMany({
      where: { subjectCode },
      orderBy: [{ semester: 'asc' }, { section: 'asc' }, { rollNumber: 'asc' }],
      select: {
        id: true,
        studentId: true,
        rollNumber: true,
        studentName: true,
        subjectCode: true,
        subjectName: true,
        semester: true,
        section: true,
        modular1: true,
        modular2: true,
        quiz1: true,
        quiz2: true,
        quiz3: true,
        quiz4: true,
        quiz5: true,
        quiz6: true,
        assignment1: true,
        assignment2: true,
        surpriseTest1: true,
        surpriseTest2: true,
        labWork: true,
        totalMarks: true,
        finalWeightage: true,
        updatedAt: true,
      },
    });

    return {
      subjectCode: subject.code,
      subjectName: subject.name,
      semester: subject.semester,
      records,
    };
  }

  async getGradeRoster(): Promise<never> {
    throw new ServiceUnavailableException('Certified result and grade roster storage is not configured yet.');
  }

  async getReevaluationRequests(): Promise<never> {
    throw new ServiceUnavailableException('Re-evaluation request storage is not configured yet.');
  }

  async getExamCirculars() {
    const notices = await this.prisma.notice.findMany({
      where: { tag: { contains: 'exam', mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });
    return notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      date: notice.date,
      publisher: notice.publisher,
      category: notice.tag,
      content: notice.content,
      attachment: notice.attachment,
    }));
  }

  private toCycleResponse(record: {
    id: string;
    title: string;
    details: unknown;
    status: string;
    currentStage: string;
    createdAt: Date;
  }) {
    const details = this.asObject(record.details);
    return {
      id: record.id,
      title: record.title,
      session: typeof details.session === 'string' ? details.session : null,
      startDate: typeof details.startDate === 'string' ? details.startDate : null,
      endDate: typeof details.endDate === 'string' ? details.endDate : null,
      hallTicketsReleased: details.hallTicketsReleased === true,
      publishedAt: typeof details.publishedAt === 'string' ? details.publishedAt : null,
      status: record.status,
      currentStage: record.currentStage,
      createdAt: record.createdAt,
    };
  }

  private asObject(value: unknown): Prisma.InputJsonObject {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return { ...(value as Prisma.InputJsonObject) };
    }
    return {};
  }
}
