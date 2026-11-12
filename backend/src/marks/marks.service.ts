import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentMarks(rollNumberOrId: string) {
    const marks = await this.prisma.assessmentMark.findMany({
      where: {
        OR: [
          { rollNumber: rollNumberOrId },
          { studentId: rollNumberOrId },
        ],
      },
    });

    return marks;
  }

  async getSectionMarks(subjectCode: string, section = 'Section A') {
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
  }) {
    const whereClause: any = {};
    if (data.studentId) whereClause.studentId = data.studentId;
    if (data.rollNumber) whereClause.rollNumber = data.rollNumber;

    let existing = await this.prisma.assessmentMark.findFirst({
      where: {
        ...whereClause,
        subjectCode: data.subjectCode,
      },
    });

    if (!existing) {
      const student = await this.prisma.student.findFirst({
        where: {
          OR: [
            ...(data.studentId ? [{ id: data.studentId }, { studentId: data.studentId }] : []),
            ...(data.rollNumber ? [{ rollNumber: data.rollNumber }] : []),
          ],
        },
      });

      if (!student) {
        throw new NotFoundException('Assessment record and student not found.');
      }

      existing = await this.prisma.assessmentMark.create({
        data: {
          studentId: student.id,
          rollNumber: student.rollNumber || data.rollNumber || '01',
          studentName: student.name || 'Enrolled Student',
          subjectCode: data.subjectCode,
          subjectName: data.subjectCode === 'CS501' ? 'Data Structures & Algorithms' : data.subjectCode,
          semester: student.semester || 'Semester 5',
          section: student.section || 'Section A',
        },
      });
    }

    const oldMark = (existing as any)[data.assessment] ?? 0;
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
        user: data.user || 'Faculty Evaluator',
        role: data.role || 'FACULTY',
        targetStudent: `${existing.studentName} (Roll ${existing.rollNumber})`,
        subject: existing.subjectName,
        assessment: data.assessment,
        oldMark: String(oldMark),
        newMark: String(data.score),
        changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        reason: data.reason || 'Continuous evaluation update',
      },
    });

    return updated;
  }

  async getApprovalQueue() {
    return this.prisma.approvalQueue.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitToHod(data: { subjectCode: string; subject: string; faculty: string; semester: string; section: string }) {
    const existing = await this.prisma.approvalQueue.findFirst({
      where: { subjectCode: data.subjectCode, section: data.section },
    });

    if (existing) {
      return this.prisma.approvalQueue.update({
        where: { id: existing.id },
        data: {
          status: 'Pending',
          submittedDate: 'Today, Just now',
          hodRemarks: 'Submitted for HOD moderation review.',
        },
      });
    }

    return this.prisma.approvalQueue.create({
      data: {
        ...data,
        submittedDate: 'Today, Just now',
        status: 'Pending',
        hodRemarks: 'Submitted for HOD moderation review.',
      },
    });
  }

  async approveQueueItem(id: string) {
    const updated = await this.prisma.approvalQueue.update({
      where: { id },
      data: {
        status: 'Approved',
        reviewedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hodRemarks: 'Approved by HOD. Verified continuous internal assessment components.',
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        user: 'Dr. P. K. Pattnaik (HOD)',
        role: 'HOD',
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

  async rejectQueueItem(id: string, rejectionReason: string) {
    return this.prisma.approvalQueue.update({
      where: { id },
      data: {
        status: 'Rejected',
        reviewedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hodRemarks: rejectionReason,
      },
    });
  }

  async unlockQueueItem(id: string) {
    return this.prisma.approvalQueue.update({
      where: { id },
      data: {
        status: 'Pending',
        hodRemarks: 'HOD unlocked marks for faculty correction.',
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
