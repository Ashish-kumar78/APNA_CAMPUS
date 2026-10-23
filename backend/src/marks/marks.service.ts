import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ASSESSMENT_FIELDS } from './marks.dto';

type MarkScope = {
  role: string;
  facultyId?: string;
  departments?: string[];
  user: string;
};

const ASSESSMENT_LIMITS: Record<string, number> = {
  modular1: 20,
  modular2: 20,
  quiz1: 10,
  quiz2: 10,
  quiz3: 10,
  quiz4: 10,
  quiz5: 10,
  quiz6: 10,
  assignment1: 10,
  assignment2: 10,
  surpriseTest1: 10,
  surpriseTest2: 10,
  labWork: 10,
};

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentMarks(rollNumberOrId?: string, scope?: MarkScope) {
    const key = rollNumberOrId?.trim();
    if (!key) return [];
    const marks = await this.prisma.assessmentMark.findMany({
      where: {
        OR: [
          { rollNumber: key },
          { studentId: key },
        ],
      },
    });
    if (!scope || !['faculty', 'hod'].includes(scope.role)) return marks;

    const scopedMarks: typeof marks = [];
    for (const mark of marks) {
      try {
        await this.assertSubjectScope(mark.subjectCode, mark.section, scope);
        scopedMarks.push(mark);
      } catch (error) {
        if (!(error instanceof ForbiddenException)) throw error;
      }
    }
    return scopedMarks;
  }

  async getSectionMarks(subjectCode: string, section = 'Section A', scope?: MarkScope) {
    if (scope) await this.assertSubjectScope(subjectCode, section, scope);
    return this.prisma.assessmentMark.findMany({
      where: {
        subjectCode,
        section,
      },
      orderBy: { rollNumber: 'asc' },
    });
  }

  async updateCellMark(data: {
    studentId?: string;
    rollNumber?: string;
    subjectCode: string;
    assessment: string;
    score: number;
    reason?: string;
    user?: string;
    role?: string;
    facultyId?: string;
    departments?: string[];
  }) {
    if (!ASSESSMENT_FIELDS.includes(data.assessment as typeof ASSESSMENT_FIELDS[number])) {
      throw new BadRequestException('Unsupported assessment field.');
    }
    if (Boolean(data.studentId) === Boolean(data.rollNumber)) {
      throw new BadRequestException('Provide exactly one student ID or roll number.');
    }
    const maximum = ASSESSMENT_LIMITS[data.assessment];
    if (!Number.isFinite(data.score) || data.score < 0 || data.score > maximum) {
      throw new BadRequestException(`${data.assessment} score must be between 0 and ${maximum}.`);
    }

    const existing = await this.prisma.assessmentMark.findFirst({
      where: {
        ...(data.studentId ? { studentId: data.studentId } : { rollNumber: data.rollNumber }),
        subjectCode: data.subjectCode,
      },
    });

    if (!existing) {
      throw new NotFoundException('Assessment record not found.');
    }

    if (data.role) {
      await this.assertSubjectScope(data.subjectCode, existing.section, {
        role: data.role.toLowerCase(),
        facultyId: data.facultyId,
        departments: data.departments,
        user: data.user || '',
      });
    }

    const submission = await this.prisma.approvalQueue.findFirst({
      where: {
        subjectCode: data.subjectCode,
        semester: existing.semester,
        section: existing.section,
      },
    });
    if (submission && ['Pending', 'Approved'].includes(submission.status)) {
      throw new BadRequestException('Marks are locked while the moderation submission is pending or approved.');
    }

    const oldMark = existing[data.assessment as keyof typeof existing] ?? 0;
    const updatePayload: any = {
      [data.assessment]: Number(data.score),
    };

    // Recalculate total
    const modular1 = data.assessment === 'modular1' ? Number(data.score) : existing.modular1;
    const modular2 = data.assessment === 'modular2' ? Number(data.score) : existing.modular2;
    const avgModular = (modular1 + modular2) / 2; // out of 20 (weightage 30% -> 1.5 multiplier)

    const q1 = data.assessment === 'quiz1' ? Number(data.score) : existing.quiz1;
    const q2 = data.assessment === 'quiz2' ? Number(data.score) : existing.quiz2;
    const q3 = data.assessment === 'quiz3' ? Number(data.score) : existing.quiz3;
    const q4 = data.assessment === 'quiz4' ? Number(data.score) : existing.quiz4;
    const q5 = data.assessment === 'quiz5' ? Number(data.score) : existing.quiz5;
    const q6 = data.assessment === 'quiz6' ? Number(data.score) : existing.quiz6;
    const sortedQuizzes = [q1, q2, q3, q4, q5, q6].sort((a, b) => b - a);
    const best5Avg = (sortedQuizzes.slice(0, 5).reduce((a, b) => a + b, 0)) / 5; // out of 10 (weightage 20% -> 2.0 multiplier)

    const asgn1 = data.assessment === 'assignment1' ? Number(data.score) : existing.assignment1;
    const asgn2 = data.assessment === 'assignment2' ? Number(data.score) : existing.assignment2;
    const avgAsgn = (asgn1 + asgn2) / 2; // out of 10 (weightage 10% -> 1.0 multiplier)

    const st1 = data.assessment === 'surpriseTest1' ? Number(data.score) : existing.surpriseTest1;
    const st2 = data.assessment === 'surpriseTest2' ? Number(data.score) : existing.surpriseTest2;
    const avgSt = (st1 + st2) / 2; // out of 10 (weightage 10% -> 1.0 multiplier)

    const lab = data.assessment === 'labWork' ? Number(data.score) : existing.labWork; // out of 10 (weightage 30% -> 3.0 multiplier)

    const finalWeightage = parseFloat(((avgModular * 1.5) + (best5Avg * 2.0) + (avgAsgn * 1.0) + (avgSt * 1.0) + (lab * 3.0)).toFixed(2));
    const totalMarks = parseFloat((modular1 + modular2 + q1 + q2 + q3 + q4 + q5 + q6 + asgn1 + asgn2 + st1 + st2 + lab).toFixed(1));

    updatePayload.totalMarks = totalMarks;
    updatePayload.finalWeightage = finalWeightage;

    const updated = await this.prisma.assessmentMark.update({
      where: { id: existing.id },
      data: updatePayload,
    });

    // Create Audit Log record
    await this.prisma.auditLog.create({
      data: {
        user: data.user || 'Unknown authenticated user',
        role: data.role || 'UNKNOWN',
        targetStudent: `${existing.studentName} (Roll ${existing.rollNumber})`,
        subject: existing.subjectName,
        assessment: data.assessment,
        oldMark: String(oldMark),
        newMark: String(data.score),
        changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        reason: data.reason || 'Assessment mark updated.',
      },
    });

    return updated;
  }

  async getApprovalQueue(scope?: MarkScope) {
    let where: any = {};
    if (scope?.role === 'faculty') {
      if (!scope.facultyId) return [];
      const assignments = await this.prisma.facultyAssignment.findMany({
        where: { facultyId: scope.facultyId },
        select: { section: true, courseOffering: { select: { subjectCode: true } } },
      });
      where.OR = assignments.map((assignment) => ({
        subjectCode: assignment.courseOffering.subjectCode,
        section: assignment.section,
      }));
      if (!assignments.length) return [];
    } else if (scope?.role === 'hod') {
      const departments = scope.departments?.filter(Boolean) || [];
      if (!departments.length) return [];
      const subjects = await this.prisma.subject.findMany({
        where: { department: { in: departments } },
        select: { code: true },
      });
      if (!subjects.length) return [];
      where.subjectCode = { in: subjects.map((subject) => subject.code) };
    }
    return this.prisma.approvalQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitToHod(data: { subjectCode: string; semester: string; section: string }, scope: MarkScope) {
    const subject = await this.prisma.subject.findUnique({ where: { code: data.subjectCode } });
    if (!subject) throw new NotFoundException('Subject was not found.');
    if (subject.semester !== data.semester) {
      throw new BadRequestException('The requested semester does not match the subject record.');
    }
    await this.assertSubjectScope(data.subjectCode, data.section, scope);
    const markedStudents = await this.prisma.assessmentMark.count({
      where: { subjectCode: data.subjectCode, semester: data.semester, section: data.section },
    });
    if (!markedStudents) throw new BadRequestException('There are no marks in this class to submit.');

    const existing = await this.prisma.approvalQueue.findFirst({
      where: { subjectCode: data.subjectCode, semester: data.semester, section: data.section },
    });

    if (existing) {
      if (['Pending', 'Approved'].includes(existing.status)) {
        throw new BadRequestException('This class already has a pending or approved marks submission.');
      }
      return this.prisma.approvalQueue.update({
        where: { id: existing.id },
        data: {
          status: 'Pending',
          submittedDate: new Date().toISOString(),
          hodRemarks: null,
          faculty: scope.user,
        },
      });
    }

    return this.prisma.approvalQueue.create({
      data: {
        subjectCode: subject.code,
        subject: subject.name,
        faculty: scope.user,
        semester: subject.semester,
        section: data.section,
        submittedDate: new Date().toISOString(),
        status: 'Pending',
      },
    });
  }

  async approveQueueItem(id: string, scope: MarkScope) {
    const item = await this.findQueueItem(id);
    await this.assertSubjectScope(item.subjectCode, item.section, scope);
    if (item.status !== 'Pending') {
      throw new BadRequestException(`Only pending submissions can be approved (current status: ${item.status}).`);
    }
    const updated = await this.prisma.approvalQueue.update({
      where: { id },
      data: {
        status: 'Approved',
        reviewedAt: new Date().toISOString(),
        hodRemarks: `Approved by ${scope.user}.`,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        user: scope.user,
        role: scope.role.toUpperCase(),
        targetStudent: `Whole ${updated.section}`,
        subject: updated.subject,
        assessment: 'Internal Review',
        oldMark: 'Pending',
        newMark: 'Approved',
        changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        reason: `HOD approved finalized internal marks for ${updated.semester} ${updated.section}`,
      },
    });

    return updated;
  }

  async rejectQueueItem(id: string, rejectionReason: string, scope: MarkScope) {
    if (!rejectionReason?.trim()) throw new BadRequestException('A rejection reason is required.');
    const item = await this.findQueueItem(id);
    await this.assertSubjectScope(item.subjectCode, item.section, scope);
    if (item.status !== 'Pending') {
      throw new BadRequestException(`Only pending submissions can be rejected (current status: ${item.status}).`);
    }
    const updated = await this.prisma.approvalQueue.update({
      where: { id },
      data: {
        status: 'Rejected',
        reviewedAt: new Date().toISOString(),
        hodRemarks: rejectionReason.trim(),
      },
    });
    await this.writeQueueAudit(scope, updated, 'Pending', 'Rejected', rejectionReason.trim());
    return updated;
  }

  async unlockQueueItem(id: string, reason: string, scope: MarkScope) {
    if (!reason?.trim()) throw new BadRequestException('A reason is required to reopen a reviewed submission.');
    const item = await this.findQueueItem(id);
    await this.assertSubjectScope(item.subjectCode, item.section, scope);
    if (!['Approved', 'Rejected'].includes(item.status)) {
      throw new BadRequestException(`Only approved or rejected submissions can be reopened (current status: ${item.status}).`);
    }
    const updated = await this.prisma.approvalQueue.update({
      where: { id },
      data: {
        status: 'Returned',
        reviewedAt: new Date().toISOString(),
        hodRemarks: reason.trim(),
      },
    });
    await this.writeQueueAudit(scope, updated, item.status, 'Returned', reason.trim());
    return updated;
  }

  private async findQueueItem(id: string) {
    const item = await this.prisma.approvalQueue.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Marks moderation submission was not found.');
    return item;
  }

  private async assertSubjectScope(subjectCode: string, section: string, scope: MarkScope) {
    if (scope.role === 'faculty') {
      if (!scope.facultyId) throw new ForbiddenException('A verified faculty profile is required.');
      const assignment = await this.prisma.facultyAssignment.findFirst({
        where: {
          facultyId: scope.facultyId,
          section,
          courseOffering: { is: { subjectCode } },
        },
      });
      if (!assignment) throw new ForbiddenException('Faculty access is limited to assigned subject sections.');
    }
    if (scope.role === 'hod') {
      const departments = scope.departments?.filter(Boolean) || [];
      const subject = await this.prisma.subject.findUnique({ where: { code: subjectCode } });
      if (!subject) throw new NotFoundException('Subject was not found.');
      if (!departments.includes(subject.department)) {
        throw new ForbiddenException('HOD access is limited to the assigned department.');
      }
    }
  }

  private async writeQueueAudit(scope: MarkScope, item: { subjectCode: string; subject: string; section: string }, oldStatus: string, newStatus: string, reason: string) {
    await this.prisma.auditLog.create({
      data: {
        user: scope.user,
        role: scope.role.toUpperCase(),
        targetStudent: `Section ${item.section}`,
        subject: item.subject,
        assessment: 'Marks moderation',
        oldMark: oldStatus,
        newMark: newStatus,
        changedAt: new Date().toISOString(),
        reason,
      },
    });
  }

  async getMarkingSchemes() {
    return this.prisma.markingScheme.findMany();
  }

  async updateMarkingScheme(id: string, data: any) {
    return this.prisma.markingScheme.update({
      where: { id },
      data,
    });
  }
}
