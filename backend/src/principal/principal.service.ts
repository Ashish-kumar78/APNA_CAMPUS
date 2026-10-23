import { Injectable, NotFoundException, BadRequestException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrincipalService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. CAMPUS OVERVIEW
  async getOverview(academicYear = '2026-27') {
    const [totalStudents, totalFaculty, totalStaff, pendingApprovalsCount, departments, academicPrograms] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.user.count({ where: { role: 'FACULTY' } }),
      this.prisma.user.count({ where: { role: { in: ['STAFF', 'WARDEN', 'CANTEEN', 'TRANSPORT', 'MAINTENANCE', 'ACCOUNTS', 'LIBRARY', 'EXAM_CELL', 'PLACEMENT'] } } }),
      this.prisma.workflowRequest.count({ where: { status: { in: ['Pending', 'Under Review', 'PENDING'] } } }),
      this.prisma.department.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.programme.count(),
    ]);

    const liveDepartments = await Promise.all(departments.map(async (department) => {
      const [students, faculty] = await Promise.all([
        this.prisma.student.count({ where: { deptCode: department.code } }),
        this.prisma.user.count({ where: { role: 'FACULTY', department: department.name } }),
      ]);
      return {
        code: department.code,
        name: department.name,
        hod: department.hod,
        students,
        faculty,
        facultyOnDuty: null,
        syllabusPace: null,
        status: department.status,
        avgCgpa: null,
        attendance: null,
      };
    }));

    return {
      success: true,
      data: {
        academicYear,
        lastUpdated: new Date().toISOString(),
        kpis: {
          totalStudents,
          teachingFaculty: totalFaculty,
          nonTeachingStaff: totalStaff,
          activeDepartments: departments.filter((department) => department.status.toLowerCase() === 'active').length,
          academicPrograms,
          studentAttendanceRate: null,
          facultyAttendanceRate: null,
          overallPassRate: null,
          pendingLeavesCount: null,
          pendingApprovalsCount,
          noticesAwaitingClearanceCount: null,
        },
        departments: liveDepartments,
        upcomingDeadlines: [],
        recentActivities: [],
      },
    };
  }

  // 2. ACADEMIC PERFORMANCE & ANALYTICS DASHBOARD
  async getAcademicAnalytics(academicYear = '2026-27', program = 'All', department = 'All', semester = 'All') {
    return {
      success: true,
      data: {
        academicYear,
        filtersApplied: { program, department, semester },
        dataAvailable: false,
        overallStats: {
          overallPassPct: null,
          previousCyclePassPct: null,
          yoyImprovement: null,
          avgCampusCgpa: null,
          firstClassDistinctionRate: null,
          supplementaryBacklogRate: null,
          totalStudentsEvaluated: 0,
          totalPassedStudents: 0,
          totalBacklogCases: 0,
        },
        semesterWiseResults: [],
        departmentResults: [],
        atRiskSubjects: [],
        deansHonorList: [],
        academicSupportList: [],
      },
    };
  }

  // 3. LEAVE APPROVALS WORKFLOW
  async getLeaves() {
    const requests = await this.prisma.workflowRequest.findMany({
      where: {
        workflowType: 'STAFF_LEAVE',
        status: { in: ['Pending Principal Approval', 'PENDING_PRINCIPAL', 'Pending'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    return requests.map((request) => {
      const details = (request.details || {}) as Record<string, any>;
      const history = Array.isArray(request.history) ? request.history as Array<Record<string, any>> : [];
      const hodDecision = history.find((entry) => entry.stage === 'HOD_APPROVED' || entry.action === 'HOD_APPROVED');
      return {
        id: request.id,
        applicantName: request.requesterName,
        applicantId: details.applicantId || details.staffId || request.requesterId,
        applicantRole: request.requesterRole,
        department: request.department || 'Unassigned',
        leaveType: details.leaveType || 'Leave',
        totalDays: details.totalDays ?? null,
        startDate: details.startDate || null,
        endDate: details.endDate || null,
        reason: details.reason || request.title,
        hodRemarks: details.hodRemarks || hodDecision?.notes || null,
        supportingDoc: details.supportingDoc || null,
        principalStatus: request.status === 'Pending' ? 'Pending Principal Approval' : request.status,
      };
    });
  }

  async decideLeave(
    id: string,
    action: 'APPROVE' | 'REJECT',
    remarks: string,
    actingUser: { name: string; role: string; identifier: string },
  ) {
    if (!['APPROVE', 'REJECT'].includes(action)) throw new BadRequestException('Action must be APPROVE or REJECT.');
    if (action === 'REJECT' && !remarks.trim()) throw new BadRequestException('A rejection reason is required.');

    const current = await this.prisma.workflowRequest.findFirst({ where: { id, workflowType: 'STAFF_LEAVE' } });
    if (!current) throw new NotFoundException('Staff leave request not found.');
    const acceptedStatuses = ['Pending Principal Approval', 'PENDING_PRINCIPAL', 'Pending'];
    if (!acceptedStatuses.includes(current.status)) {
      throw new ConflictException(`Leave request is ${current.status} and cannot be decided again.`);
    }

    const status = action === 'APPROVE' ? 'Approved' : 'Rejected';
    const reviewer = actingUser.name || actingUser.identifier;
    const notes = remarks.trim() || `Approved by ${reviewer}.`;
    const history = Array.isArray(current.history) ? current.history as Array<Record<string, any>> : [];
    history.push({ action: `PRINCIPAL_${action}`, stage: status, by: reviewer, role: actingUser.role, notes, timestamp: new Date().toISOString() });

    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.workflowRequest.updateMany({
        where: { id, workflowType: 'STAFF_LEAVE', status: { in: acceptedStatuses } },
        data: {
          status,
          currentStage: status,
          approverId: actingUser.identifier,
          approverName: reviewer,
          approvalNotes: notes,
          history,
        },
      });
      if (changed.count !== 1) throw new ConflictException('Leave request changed concurrently. Refresh and retry.');
      await tx.auditLog.create({
        data: {
          user: reviewer,
          role: actingUser.role,
          action: `PRINCIPAL_LEAVE_${action}`,
          target: id,
          oldValue: current.status,
          newValue: status,
          changedAt: new Date().toISOString(),
          reason: notes,
        },
      });
      const updated = await tx.workflowRequest.findUnique({ where: { id } });
      return { success: true, data: updated };
    });
  }

  async getCirculars() {
    const notices = await this.prisma.notice.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    return notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      scope: 'College-wide',
      category: notice.tag,
      priority: notice.pinned ? 'Critical' : 'Normal',
      status: 'Published',
      author: notice.publisher,
      date: notice.date,
      content: notice.content,
      attachments: notice.attachment ? [notice.attachment] : [],
    }));
  }

  async createCircular(data: any, actingUser: any) {
    if (!data.title?.trim()) {
      throw new BadRequestException('Circular title is required.');
    }

    const publisher = actingUser.name || actingUser.identifier;
    const created = await this.prisma.$transaction(async (tx) => {
      const notice = await tx.notice.create({
        data: {
          title: data.title.trim(),
          tag: data.category || 'ACADEMIC',
          publisher,
          pinned: data.priority === 'Critical',
          summary: data.scope ? `Audience: ${data.scope}` : data.title.trim(),
          content: data.content?.trim() || data.title.trim(),
          date: new Date().toISOString(),
        },
      });
      await tx.auditLog.create({
        data: {
          user: publisher,
          role: actingUser.role,
          subject: notice.title,
          assessment: 'Published Institutional Notice',
          oldMark: 'NONE',
          newMark: 'PUBLISHED',
          changedAt: new Date().toLocaleString('en-IN'),
          reason: `Published notice${data.scope ? ` for ${data.scope}` : ''}.`,
        },
      });
      return notice;
    });

    return {
      success: true,
      message: 'Notice published.',
      data: {
        id: created.id,
        title: created.title,
        scope: data.scope || 'College-wide',
        category: created.tag,
        priority: created.pinned ? 'Critical' : 'Normal',
        status: 'Published',
        author: created.publisher,
        date: created.date,
        content: created.content,
        attachments: created.attachment ? [created.attachment] : [],
      },
    };
  }

  async decideCircular(_id: string, _action: 'APPROVE' | 'REJECT', _remarks: string, _actingUser: any): Promise<never> {
    throw new ServiceUnavailableException('Circular moderation is unavailable until a persisted approval workflow is configured.');
  }

}
