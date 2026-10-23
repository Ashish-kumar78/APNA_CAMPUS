import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ProposalDecisionDto {
  action: 'APPROVE' | 'REJECT' | 'RETURN';
  comments?: string;
}

@Injectable()
export class ManagementService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. INSTITUTIONAL EXECUTIVE OVERVIEW
  async getOverview(academicYear = '2026-27', semester?: string) {
    const [totalStudents, totalFaculty, totalStaff, pendingApprovalsCount, feeCollections, selectedApplications, drives] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.user.count({ where: { role: 'FACULTY' } }),
      this.prisma.user.count({ where: { role: { in: ['STAFF', 'WARDEN', 'CANTEEN', 'TRANSPORT', 'MAINTENANCE', 'ACCOUNTS', 'LIBRARY', 'EXAM_CELL', 'PLACEMENT'] } } }),
      this.prisma.workflowRequest.count({ where: { workflowType: 'strategic_approval', status: { in: ['Pending', 'Under Review'] } } }),
      this.prisma.feeTransaction.aggregate({ _sum: { amount: true } }),
      this.prisma.placementApplication.count({ where: { status: 'Selected' } }),
      this.prisma.placementDrive.findMany({ select: { packageLPA: true } }),
    ]);
    const packages = drives.map((drive) => drive.packageLPA).filter((value) => Number.isFinite(value));
    const highestPackage = packages.length ? Math.max(...packages) : null;

    return {
      success: true,
      data: {
        academicYear,
        semester: semester || 'All Semesters',
        lastUpdated: new Date().toISOString(),
        kpis: {
          totalStudents,
          totalFaculty,
          totalStaff,
          studentFacultyRatio: totalFaculty > 0 ? `1:${(totalStudents / totalFaculty).toFixed(1)}` : null,
          avgCgpa: null,
          avgAttendance: null,
          feeAssessedFormatted: null,
          feeCollectedAmount: feeCollections._sum.amount ?? 0,
          feeDueFormatted: null,
          feeRecoveryRate: null,
          placementRate: null,
          placedStudents: selectedApplications,
          highestCTC: highestPackage,
          avgCTC: null,
          pendingApprovalsCount,
          accreditationStatus: null,
          passRate: null,
          hostelOccupancy: null,
          libraryVolumes: null,
          researchPapers: null,
          operationalBusFleet: await this.prisma.transportRoute.count(),
          labUptime: null,
        },
        yoyComparisons: {
          intakeGrowthPct: null,
          feeCollectionGrowthPct: null,
          placementGrowthPct: null,
          researchOutputGrowthPct: null,
          studentToFacultyRatio: totalFaculty > 0 ? `1:${(totalStudents / totalFaculty).toFixed(1)}` : null,
        },
      },
    };
  }

  // 2. DYNAMIC EXECUTIVE INSIGHTS ENGINE (Transparent, Rule-Based)
  async getExecutiveInsights() {
    return { success: true, count: 0, data: [] };
  }

  // 3. DEPARTMENT COMPARISON ANALYTICS
  async getDepartments(academicYear = '2026-27', semester?: string, filterDept = 'All') {
    const records = await this.prisma.department.findMany({
      where: filterDept === 'All' ? {} : { code: filterDept },
      orderBy: { name: 'asc' },
    });
    const departments = await Promise.all(records.map(async (department) => {
      const [students, faculty] = await Promise.all([
        this.prisma.student.count({ where: { deptCode: department.code } }),
        this.prisma.user.count({ where: { role: 'FACULTY', department: department.name } }),
      ]);
      return {
        name: department.name,
        code: department.code,
        hod: department.hod,
        students,
        faculty,
        sfr: faculty > 0 ? `1:${(students / faculty).toFixed(1)}` : null,
        cgpa: null,
        attendance: null,
        placement: null,
        feeRecovery: null,
        pass: null,
        scholarships: null,
        budgetAllocated: null,
        budgetSpent: null,
        budgetUtilization: null,
        budgetRemaining: null,
      };
    }));
    return { success: true, academicYear, semester: semester || 'All Semesters', count: departments.length, data: departments };
  }

  // 4. FEE & FINANCIAL INTELLIGENCE + BUDGET PLANNING
  async getFinancialOverview(academicYear = '2026-27') {
    const [collection, scholarships] = await Promise.all([
      this.prisma.feeTransaction.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
      this.prisma.scholarship.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return {
      success: true,
      data: {
        academicYear,
        summary: {
          totalDemand: null,
          totalCollectedAmount: collection._sum.amount ?? 0,
          totalTransactions: collection._count._all,
          totalDue: null,
          overallRecoveryPct: null,
          studentsWithDues: null,
          totalScholarshipsDisbursed: null,
          scholarshipBeneficiaries: null,
        },
        departmentRealization: [],
        revenueBreakdown: [],
        scholarships,
        budgetSummary: null,
      },
    };
  }

  // 5. PLACEMENT & CAREERS INTELLIGENCE
  async getPlacementOverview() {
    const [drives, selectedStudents] = await Promise.all([
      this.prisma.placementDrive.findMany({ orderBy: { driveDate: 'desc' } }),
      this.prisma.placementApplication.count({ where: { status: 'Selected' } }),
    ]);
    const packageValues = drives.map((drive) => drive.packageLPA).filter((value) => Number.isFinite(value));
    return {
      success: true,
      data: {
        summary: {
          companiesVisited: new Set(drives.map((drive) => drive.companyName)).size,
          eligibleStudents: null,
          placedStudents: selectedStudents,
          overallConversionRate: null,
          highestPackage: packageValues.length ? Math.max(...packageValues) : null,
          avgPackage: null,
          medianPackage: null,
          season: null,
        },
        drives: drives.map((drive) => ({
          id: drive.id,
          company: drive.companyName,
          role: drive.roleTitle,
          ctcNum: drive.packageLPA,
          registered: drive.registeredCount,
          shortlisted: drive.shortlistedCount,
          selected: drive.selectedCount,
          status: drive.status,
          dept: drive.eligibleBranches.join(', '),
          driveDate: drive.driveDate,
        })),
        branchBreakdown: [],
      },
    };
  }

  // 6. STRATEGIC APPROVALS ENGINE (Persistent, Audited, Multi-Stage)
  async getApprovals() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'strategic_approval' },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = records.map(r => {
      const details = (r.details as any) || {};
      return {
        id: r.id,
        title: r.title,
        description: details.description || r.title,
        dept: r.department || 'All Departments',
        by: `${r.requesterName} (${r.requesterRole})`,
        category: details.category || 'Institutional',
        budget: details.budget || 'N/A',
        priority: details.priority || 'Medium',
        status: r.status,
        date: details.submittedDate || new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        currentStage: r.currentStage,
        supportingDocuments: Array.isArray(details.supportingDocuments) ? details.supportingDocuments : [],
        history: (r.history as any[]) || [],
      };
    });

    return {
      success: true,
      count: formatted.length,
      data: formatted,
    };
  }

  async decideApproval(
    id: string,
    dto: ProposalDecisionDto,
    actingUser: { id: string; name: string; role: string; identifier: string }
  ) {
    const proposal = await this.prisma.workflowRequest.findUnique({
      where: { id },
    });

    if (!proposal) {
      throw new NotFoundException(`Strategic proposal with ID ${id} was not found.`);
    }

    if (proposal.workflowType !== 'strategic_approval') {
      throw new BadRequestException('Target workflow request is not a Governing Body strategic proposal.');
    }

    const previousStatus = proposal.status;
    let newStatus = '';
    let actionVerb = '';

    if (dto.action === 'APPROVE') {
      newStatus = 'Approved';
      actionVerb = 'APPROVED';
    } else if (dto.action === 'REJECT') {
      newStatus = 'Rejected';
      actionVerb = 'REJECTED';
    } else if (dto.action === 'RETURN') {
      newStatus = 'Returned for Revision';
      actionVerb = 'RETURNED_FOR_REVISION';
    } else {
      throw new BadRequestException(`Invalid action "${dto.action}". Must be APPROVE, REJECT, or RETURN.`);
    }

    // Append to decision history audit log inside the record
    const history = (proposal.history as any[]) || [];
    const historyEntry = {
      action: actionVerb,
      fromStatus: previousStatus,
      toStatus: newStatus,
      actorId: actingUser.id,
      actorName: actingUser.name,
      actorRole: actingUser.role,
      comments: dto.comments || `Proposal ${actionVerb.toLowerCase()} by Governing Body.`,
      timestamp: new Date().toISOString(),
    };
    history.push(historyEntry);

    // Update WorkflowRequest
    const updated = await this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        approverId: actingUser.id,
        approverName: actingUser.name,
        approvalNotes: dto.comments || '',
        history,
      },
    });

    // Record Immutable Audit Log Entry
    try {
      await this.prisma.auditLog.create({
        data: {
          user: actingUser.name || actingUser.identifier,
          role: actingUser.role,
          subject: proposal.title,
          assessment: 'Strategic Proposal Decision',
          oldMark: previousStatus,
          newMark: newStatus,
          changedAt: new Date().toLocaleString('en-IN'),
          reason: dto.comments || `Governing Body decision: ${actionVerb}`,
        },
      });
    } catch (e: any) {
      console.warn('Could not record audit log entry:', e?.message);
    }

    return {
      success: true,
      message: `Strategic proposal ${proposal.id} successfully marked as ${newStatus}.`,
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    };
  }

  // 7. GOVERNANCE & REGULATORY NOTICES
  async getGovernanceOverview() {
    const notices = await this.prisma.notice.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    return {
      success: true,
      data: {
        accreditations: [],
        notices: notices.map((notice) => ({
          id: notice.id,
          tag: notice.tag,
          title: notice.title,
          date: notice.date,
          priority: notice.pinned ? 'Critical' : 'Normal',
          issuer: notice.publisher,
        })),
        milestones: [],
      },
    };
  }

  // 8. RISK & EXCEPTION MONITORING (Section 10.B)
  async getExceptions() {
    return { success: true, count: 0, data: [] };
  }

  // 9. AUDIT TRAIL REPOSITORY (Section 10.C)
  async getAuditTrail(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { user: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { assessment: { contains: search, mode: 'insensitive' } },
      ];
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      success: true,
      count: logs.length,
      data: logs,
    };
  }

  // 10. ACTIVITY LOGGER (For Management actions such as Report Export)
  async logActivity(data: { action: string; details: string; user: any }) {
    return this.prisma.auditLog.create({
      data: {
        user: data.user.name || data.user.identifier || 'Governing Body',
        role: data.user.role || 'management',
        subject: data.action,
        assessment: 'Institutional Management Action',
        oldMark: 'N/A',
        newMark: 'EXECUTED',
        changedAt: new Date().toLocaleString('en-IN'),
        reason: data.details,
      },
    });
  }


}
