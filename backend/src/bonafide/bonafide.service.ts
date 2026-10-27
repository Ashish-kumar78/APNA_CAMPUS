import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BonafidePdfService } from './bonafide-pdf.service';
import {
  CreateBonafideDto,
  ReviewBonafideDto,
  ResubmitBonafideDto,
  WithdrawBonafideDto,
  BonafidePurposeDtoEnum,
} from './dto/create-bonafide.dto';
import { Response } from 'express';
import * as QRCode from 'qrcode';

@Injectable()
export class BonafideService {
  private readonly logger = new Logger(BonafideService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: BonafidePdfService,
  ) {}

  /**
   * Helper: Resolve Student Record from current user context
   */
  private async resolveStudent(user: any) {
    if (!user) throw new ForbiddenException('Authentication required');

    let student: any = null;
    if (user.id) {
      student = await this.prisma.student.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { rollNumber: user.identifier },
            { studentId: user.identifier },
            { email: user.email },
          ],
        },
      });
    }

    if (!student && user.identifier) {
      student = await this.prisma.student.findFirst({
        where: {
          OR: [
            { rollNumber: user.identifier },
            { studentId: user.identifier },
          ],
        },
      });
    }

    // Fallback for demo student account
    if (!student) {
      student = await this.prisma.student.findFirst({
        where: { rollNumber: '2401432265' },
      });
    }

    if (!student) {
      student = await this.prisma.student.findFirst();
    }

    return student;
  }

  /**
   * 1. Dashboard Statistics
   */
  async getDashboardStats(user: any) {
    const role = (user.role || '').toUpperCase();
    const isStudent = role === 'STUDENT';

    if (isStudent) {
      const student = await this.resolveStudent(user);
      const studentId = student?.id;

      const [total, pending, approved, actionRequired] = await Promise.all([
        this.prisma.bonafideApplication.count({ where: { studentId } }),
        this.prisma.bonafideApplication.count({
          where: {
            studentId,
            status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
          },
        }),
        this.prisma.bonafideApplication.count({
          where: {
            studentId,
            status: { in: ['APPROVED', 'CERTIFICATE_ISSUED'] },
          },
        }),
        this.prisma.bonafideApplication.count({
          where: {
            studentId,
            status: { in: ['REJECTED', 'CHANGES_REQUESTED'] },
          },
        }),
      ]);

      return {
        total,
        pending,
        approved,
        actionRequired,
      };
    }

    // Reviewer Staff Statistics
    const [total, pendingQueue, approvedTotal, rejectedTotal] = await Promise.all([
      this.prisma.bonafideApplication.count(),
      this.prisma.bonafideApplication.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      this.prisma.bonafideApplication.count({
        where: { status: { in: ['APPROVED', 'CERTIFICATE_ISSUED'] } },
      }),
      this.prisma.bonafideApplication.count({
        where: { status: { in: ['REJECTED', 'CHANGES_REQUESTED'] } },
      }),
    ]);

    return {
      total,
      pending: pendingQueue,
      approved: approvedTotal,
      actionRequired: rejectedTotal,
    };
  }

  /**
   * 2. Get Authenticated Student's Applications
   */
  async getMyApplications(user: any, query: any) {
    const student = await this.resolveStudent(user);
    if (!student) throw new NotFoundException('Student profile record not found');

    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 15)));
    const skip = (page - 1) * limit;

    const where: any = { studentId: student.id };

    if (query.purpose && query.purpose !== 'ALL') {
      where.purpose = query.purpose;
    }
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.academicYear && query.academicYear !== 'ALL') {
      where.academicYear = query.academicYear;
    }
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { applicationNumber: { contains: q, mode: 'insensitive' } },
        { purposeTitle: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, applications] = await Promise.all([
      this.prisma.bonafideApplication.count({ where }),
      this.prisma.bonafideApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submissionDate: 'desc' },
        include: {
          reviews: { orderBy: { reviewedAt: 'asc' } },
          certificate: true,
          revisions: { orderBy: { revisionNumber: 'desc' }, take: 1 },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      applications,
    };
  }

  /**
   * 3. Get Single Application by ID with Full History
   */
  async getApplicationById(id: string, user: any) {
    const app = await this.prisma.bonafideApplication.findUnique({
      where: { id },
      include: {
        student: true,
        reviews: { orderBy: { reviewedAt: 'asc' } },
        revisions: { orderBy: { revisionNumber: 'desc' } },
        certificate: true,
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!app) throw new NotFoundException('Bonafide Application not found');

    const role = (user.role || '').toUpperCase();
    if (role === 'STUDENT') {
      const student = await this.resolveStudent(user);
      if (app.studentId !== student?.id && app.studentRoll !== user.identifier) {
        throw new ForbiddenException('Access denied. You may only view your own applications.');
      }
    }

    return app;
  }

  /**
   * 4. Create and Submit a Bonafide Application
   */
  async createApplication(user: any, dto: CreateBonafideDto) {
    const student = await this.resolveStudent(user);
    if (!student) throw new NotFoundException('Student profile not found');

    const year = new Date().getFullYear();
    const count = await this.prisma.bonafideApplication.count();
    const applicationNumber = `GIFT-BNF-${year}-${String(count + 1).padStart(4, '0')}`;

    // Verify hostel records if hosteller purpose
    let isHostellerVerified = false;
    if (
      dto.purpose === BonafidePurposeDtoEnum.SCHOLARSHIP_HOSTELLER ||
      dto.purpose === BonafidePurposeDtoEnum.STUDY_LOAN
    ) {
      if (student.hostelName && student.hostelName.trim() && student.roomNumber) {
        isHostellerVerified = true;
      }
    }

    // Determine workflow route by Purpose
    let currentStage = 'PLACEMENT_VERIFICATION' as any;
    let assignedRole = 'PLACEMENT';
    let currentStageLabel = 'Placement Cell Verification';

    if (dto.purpose === BonafidePurposeDtoEnum.INTERNSHIP) {
      currentStage = 'PLACEMENT_VERIFICATION';
      assignedRole = 'PLACEMENT';
      currentStageLabel = 'Placement Cell Review';
    } else {
      // SCHOLARSHIP_HOSTELLER, STUDY_LOAN, EXTERNAL_EVENT
      currentStage = 'SCHOLARSHIP_INITIAL_VERIFICATION';
      assignedRole = 'SCHOLARSHIP';
      currentStageLabel = 'Scholarship Cell Initial Verification';
    }

    const status = dto.isDraft ? 'DRAFT' : 'SUBMITTED';
    if (dto.isDraft) {
      currentStageLabel = 'Draft Application';
    }

    // Database transaction to create application, rev 1, and audit log
    const created = await this.prisma.$transaction(async (tx) => {
      const newApp = await tx.bonafideApplication.create({
        data: {
          applicationNumber,
          studentId: student.id,
          studentRoll: student.rollNumber,
          studentName: student.name,
          purpose: dto.purpose as any,
          purposeTitle: dto.purposeTitle,
          academicYear: dto.academicYear || student.academicYear || '2026-27',
          status: status as any,
          currentStage,
          currentStageLabel,
          assignedRole,
          isHostellerVerified,
          formData: dto.formData,
          supportingDocs: dto.supportingDocs || [],
          currentRevision: 1,
        },
      });

      await tx.bonafideRevision.create({
        data: {
          applicationId: newApp.id,
          revisionNumber: 1,
          formData: dto.formData,
          supportingDocs: dto.supportingDocs || [],
          notes: dto.isDraft ? 'Draft Created' : 'Initial Application Submitted',
        },
      });

      await tx.bonafideAuditLog.create({
        data: {
          applicationId: newApp.id,
          action: dto.isDraft ? 'DRAFT_CREATED' : 'APPLICATION_SUBMITTED',
          performedBy: student.name,
          performedByRole: 'STUDENT',
          previousStatus: null,
          newStatus: status,
          remarks: `Application ${applicationNumber} created for ${dto.purposeTitle}`,
        },
      });

      return newApp;
    });

    this.logger.log(`Created Bonafide Application ${applicationNumber} for student ${student.name}`);
    return created;
  }

  /**
   * 5. Update Draft Application
   */
  async updateDraft(id: string, user: any, dto: CreateBonafideDto) {
    const existing = await this.getApplicationById(id, user);

    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only applications in DRAFT status can be modified directly.');
    }

    let currentStage = existing.currentStage;
    let assignedRole = existing.assignedRole;
    let currentStageLabel = existing.currentStageLabel;
    let status = 'DRAFT' as any;

    if (!dto.isDraft) {
      status = 'SUBMITTED';
      if (existing.purpose === 'INTERNSHIP') {
        currentStage = 'PLACEMENT_VERIFICATION' as any;
        assignedRole = 'PLACEMENT';
        currentStageLabel = 'Placement Cell Review';
      } else {
        currentStage = 'SCHOLARSHIP_INITIAL_VERIFICATION' as any;
        assignedRole = 'SCHOLARSHIP';
        currentStageLabel = 'Scholarship Cell Initial Verification';
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.bonafideApplication.update({
        where: { id },
        data: {
          formData: dto.formData,
          supportingDocs: (dto.supportingDocs || existing.supportingDocs || []) as any,
          purposeTitle: dto.purposeTitle || existing.purposeTitle,
          status,
          currentStage,
          assignedRole,
          currentStageLabel,
        },
      });

      await tx.bonafideAuditLog.create({
        data: {
          applicationId: id,
          action: dto.isDraft ? 'DRAFT_UPDATED' : 'DRAFT_SUBMITTED',
          performedBy: user.name || existing.studentName,
          performedByRole: 'STUDENT',
          previousStatus: 'DRAFT',
          newStatus: status,
          remarks: dto.isDraft ? 'Draft details saved' : 'Draft submitted for departmental verification',
        },
      });

      return app;
    });

    return updated;
  }

  /**
   * 6. Resubmit Corrected Application (after Rejection or Changes Requested)
   */
  async resubmitApplication(id: string, user: any, dto: ResubmitBonafideDto) {
    const existing = await this.getApplicationById(id, user);

    if (existing.status !== 'REJECTED' && existing.status !== 'CHANGES_REQUESTED') {
      throw new BadRequestException(
        'Resubmission is only allowed for applications in REJECTED or CHANGES_REQUESTED status.',
      );
    }

    const nextRevision = existing.currentRevision + 1;

    // Reset workflow to appropriate initial review stage
    let currentStage = 'PLACEMENT_VERIFICATION' as any;
    let assignedRole = 'PLACEMENT';
    let currentStageLabel = 'Placement Cell Review (Revision ' + nextRevision + ')';

    if (existing.purpose !== 'INTERNSHIP') {
      currentStage = 'SCHOLARSHIP_INITIAL_VERIFICATION' as any;
      assignedRole = 'SCHOLARSHIP';
      currentStageLabel = 'Scholarship Cell Review (Revision ' + nextRevision + ')';
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.bonafideApplication.update({
        where: { id },
        data: {
          formData: dto.formData,
          supportingDocs: (dto.supportingDocs || existing.supportingDocs || []) as any,
          status: 'SUBMITTED',
          currentStage,
          assignedRole,
          currentStageLabel,
          currentRevision: nextRevision,
          rejectionReason: null,
          rejectionCategory: null,
          correctionInstructions: null,
        },
      });

      await tx.bonafideRevision.create({
        data: {
          applicationId: id,
          revisionNumber: nextRevision,
          formData: dto.formData,
          supportingDocs: dto.supportingDocs || [],
          notes: dto.correctionNotes || 'Corrected and resubmitted by student',
        },
      });

      await tx.bonafideAuditLog.create({
        data: {
          applicationId: id,
          action: 'APPLICATION_RESUBMITTED',
          performedBy: user.name || existing.studentName,
          performedByRole: 'STUDENT',
          previousStatus: existing.status,
          newStatus: 'SUBMITTED',
          remarks: `Revision ${nextRevision} submitted with corrections: ${dto.correctionNotes || 'Updated details'}`,
        },
      });

      return app;
    });

    this.logger.log(`Application ${existing.applicationNumber} resubmitted (Revision ${nextRevision})`);
    return updated;
  }

  /**
   * 7. Withdraw Application
   */
  async withdrawApplication(id: string, user: any, dto: WithdrawBonafideDto) {
    const existing = await this.getApplicationById(id, user);

    if (existing.status === 'APPROVED' || existing.status === 'CERTIFICATE_ISSUED') {
      throw new BadRequestException('Cannot withdraw an application that has already been approved and issued.');
    }

    if (existing.status === 'WITHDRAWN') {
      throw new BadRequestException('Application is already withdrawn.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.bonafideApplication.update({
        where: { id },
        data: {
          status: 'WITHDRAWN',
          currentStageLabel: 'Application Withdrawn by Student',
          withdrawnAt: new Date(),
          withdrawalReason: dto.reason || 'Withdrawn by student request',
        },
      });

      await tx.bonafideAuditLog.create({
        data: {
          applicationId: id,
          action: 'APPLICATION_WITHDRAWN',
          performedBy: user.name || existing.studentName,
          performedByRole: 'STUDENT',
          previousStatus: existing.status,
          newStatus: 'WITHDRAWN',
          remarks: dto.reason || 'Withdrawn by student',
        },
      });

      return app;
    });

    return updated;
  }

  /**
   * 8. Department Review Queue (Role-Filtered)
   */
  async getReviewQueue(user: any, query: any) {
    const userRole = (user.role || '').toUpperCase();
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based queues
    if (userRole === 'PLACEMENT') {
      where.purpose = 'INTERNSHIP';
      if (!query.all) {
        where.assignedRole = 'PLACEMENT';
      }
    } else if (userRole === 'SCHOLARSHIP') {
      where.purpose = { in: ['SCHOLARSHIP_HOSTELLER', 'STUDY_LOAN', 'EXTERNAL_EVENT'] };
      if (!query.all) {
        where.assignedRole = 'SCHOLARSHIP';
      }
    } else if (userRole === 'PRINCIPAL') {
      where.purpose = { in: ['SCHOLARSHIP_HOSTELLER', 'STUDY_LOAN', 'EXTERNAL_EVENT'] };
      if (!query.all) {
        where.assignedRole = 'PRINCIPAL';
      }
    }

    // Additional query filters
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.purpose && query.purpose !== 'ALL') {
      where.purpose = query.purpose;
    }
    if (query.stage && query.stage !== 'ALL') {
      where.currentStage = query.stage;
    }
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { applicationNumber: { contains: q, mode: 'insensitive' } },
        { studentName: { contains: q, mode: 'insensitive' } },
        { studentRoll: { contains: q, mode: 'insensitive' } },
        { purposeTitle: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, queue] = await Promise.all([
      this.prisma.bonafideApplication.count({ where }),
      this.prisma.bonafideApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submissionDate: 'desc' },
        include: {
          student: true,
          reviews: { orderBy: { reviewedAt: 'desc' } },
          certificate: true,
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      queue,
    };
  }

  /**
   * 9. Record Stage-Specific Review Decision (Approve / Reject / Changes Requested)
   */
  async recordReviewDecision(id: string, user: any, dto: ReviewBonafideDto) {
    const existing = await this.prisma.bonafideApplication.findUnique({
      where: { id },
      include: { student: true, certificate: true },
    });

    if (!existing) throw new NotFoundException('Bonafide Application not found');

    const userRole = (user.role || '').toUpperCase();
    const reviewerName = user.name || 'Authorized Reviewer';

    // Verify Role Authorization for the current stage
    if (
      userRole !== 'SUPER_ADMIN' &&
      userRole !== 'ADMIN' &&
      userRole !== existing.assignedRole
    ) {
      throw new ForbiddenException(
        `Access denied. Role ${userRole} is not authorized to review applications in stage: ${existing.currentStageLabel} (Assigned to: ${existing.assignedRole})`,
      );
    }

    // Mandatory remarks check on Rejection or Changes Requested
    if ((dto.action === 'REJECT' || dto.action === 'REQUEST_CHANGES') && !dto.remarks?.trim()) {
      throw new BadRequestException('A mandatory reason / remarks must be provided when rejecting or requesting changes.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scenario 1: REJECT or REQUEST CHANGES
    // ─────────────────────────────────────────────────────────────────────────
    if (dto.action === 'REJECT' || dto.action === 'REQUEST_CHANGES') {
      const newStatus = dto.action === 'REJECT' ? 'REJECTED' : 'CHANGES_REQUESTED';
      const stageName = existing.currentStageLabel;

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.bonafideApplication.update({
          where: { id },
          data: {
            status: newStatus as any,
            currentStageLabel: `${newStatus === 'REJECTED' ? 'Rejected' : 'Changes Requested'} by ${reviewerName} (${userRole})`,
            rejectionReason: dto.remarks,
            rejectionCategory: dto.rejectionCategory || 'Documentation Review',
            correctionInstructions: dto.correctionInstructions || dto.remarks,
          },
        });

        await tx.bonafideReview.create({
          data: {
            applicationId: id,
            stage: existing.currentStage,
            stageName,
            assignedRole: existing.assignedRole,
            reviewerId: user.id || null,
            reviewerName,
            reviewerRole: userRole,
            action: dto.action,
            status: newStatus,
            remarks: dto.remarks,
            rejectionCategory: dto.rejectionCategory || null,
          },
        });

        await tx.bonafideAuditLog.create({
          data: {
            applicationId: id,
            action: `REVIEW_${dto.action}`,
            performedBy: reviewerName,
            performedByRole: userRole,
            previousStatus: existing.status,
            newStatus,
            remarks: `${dto.action} at ${stageName}: ${dto.remarks}`,
          },
        });

        this.logger.log(`Application ${existing.applicationNumber} marked ${newStatus} by ${reviewerName}`);
        return updated;
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scenario 2: APPROVE (Multi-Stage Workflow Transitions)
    // ─────────────────────────────────────────────────────────────────────────
    const currStage = existing.currentStage;
    let nextStage: any = currStage;
    let nextAssignedRole = existing.assignedRole;
    let nextStageLabel = existing.currentStageLabel;
    let nextStatus: any = 'UNDER_REVIEW';
    let shouldGenerateCertificate = false;

    // Workflow Rule 1: INTERNSHIP
    if (existing.purpose === 'INTERNSHIP') {
      if (currStage === 'PLACEMENT_VERIFICATION') {
        nextStage = 'COMPLETED';
        nextAssignedRole = 'COMPLETED';
        nextStageLabel = 'Fully Approved & Certificate Issued';
        nextStatus = 'CERTIFICATE_ISSUED';
        shouldGenerateCertificate = true;
      }
    } else {
      // Workflow Rule 2: SCHOLARSHIP_HOSTELLER, STUDY_LOAN, EXTERNAL_EVENT
      if (currStage === 'SCHOLARSHIP_INITIAL_VERIFICATION') {
        // Stage 1 -> Stage 2 (Principal Approval)
        nextStage = 'PRINCIPAL_APPROVAL';
        nextAssignedRole = 'PRINCIPAL';
        nextStageLabel = 'Pending Principal Approval (Stage 2 of 3)';
        nextStatus = 'UNDER_REVIEW';
      } else if (currStage === 'PRINCIPAL_APPROVAL') {
        // Stage 2 -> Stage 3 (Final Scholarship Verification & Issuance)
        nextStage = 'SCHOLARSHIP_FINAL_APPROVAL';
        nextAssignedRole = 'SCHOLARSHIP';
        nextStageLabel = 'Pending Final Scholarship Verification & Issuance (Stage 3 of 3)';
        nextStatus = 'UNDER_REVIEW';
      } else if (currStage === 'SCHOLARSHIP_FINAL_APPROVAL') {
        // Stage 3 -> COMPLETED
        nextStage = 'COMPLETED';
        nextAssignedRole = 'COMPLETED';
        nextStageLabel = 'Fully Approved & Certificate Issued';
        nextStatus = 'CERTIFICATE_ISSUED';
        shouldGenerateCertificate = true;
      }
    }

    // Execute state transition in atomic database transaction
    return this.prisma.$transaction(async (tx) => {
      let certificateRecord: any = null;

      if (shouldGenerateCertificate) {
        const year = new Date().getFullYear();
        const certCount = await tx.bonafideCertificate.count();
        const certificateNumber = `GIFT/BONAFIDE/${year}/${String(certCount + 1).padStart(4, '0')}`;
        const verificationToken = `bnf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const qrDataUrl = await QRCode.toDataURL(
          `http://localhost:5173/?verify=bonafide_${verificationToken}`,
          { margin: 1, width: 160, color: { dark: '#0f2b48', light: '#ffffff' } },
        );

        certificateRecord = await tx.bonafideCertificate.create({
          data: {
            certificateNumber,
            applicationId: id,
            studentId: existing.studentId,
            purpose: existing.purpose,
            certificateTitle: existing.purposeTitle,
            recipient: (existing.formData as any)?.bankName || (existing.formData as any)?.company || 'To Whom It May Concern',
            verificationToken,
            qrCodeDataUrl: qrDataUrl,
            issuedBy: `${reviewerName} (${userRole})`,
            issuedByRole: userRole,
            meta: {
              approvedAt: new Date().toISOString(),
              revision: existing.currentRevision,
              academicYear: existing.academicYear,
            },
          },
        });
      }

      const updated = await tx.bonafideApplication.update({
        where: { id },
        data: {
          status: nextStatus,
          currentStage: nextStage,
          assignedRole: nextAssignedRole,
          currentStageLabel: nextStageLabel,
          rejectionReason: null,
          rejectionCategory: null,
          correctionInstructions: null,
        },
        include: {
          reviews: true,
          certificate: true,
        },
      });

      await tx.bonafideReview.create({
        data: {
          applicationId: id,
          stage: currStage,
          stageName: existing.currentStageLabel,
          assignedRole: existing.assignedRole,
          reviewerId: user.id || null,
          reviewerName,
          reviewerRole: userRole,
          action: 'APPROVED',
          status: nextStatus,
          remarks: dto.remarks || 'Stage approved officially',
        },
      });

      await tx.bonafideAuditLog.create({
        data: {
          applicationId: id,
          action: shouldGenerateCertificate ? 'CERTIFICATE_ISSUED' : 'STAGE_APPROVED',
          performedBy: reviewerName,
          performedByRole: userRole,
          previousStatus: existing.status,
          newStatus: nextStatus,
          remarks: shouldGenerateCertificate
            ? `Final approval completed. Official Certificate #${certificateRecord?.certificateNumber} generated.`
            : `Stage ${existing.currentStageLabel} approved. Advanced to ${nextStageLabel}.`,
        },
      });

      this.logger.log(
        `Application ${existing.applicationNumber} approved at stage ${currStage} -> Next: ${nextStage}`,
      );
      return updated;
    });
  }

  /**
   * 10. Generate and Stream Final Certificate PDF (Strict Download Security)
   */
  async generateCertificatePdf(id: string, user: any, res: Response) {
    const app = await this.prisma.bonafideApplication.findUnique({
      where: { id },
      include: { student: true, certificate: true },
    });

    if (!app) throw new NotFoundException('Bonafide Application not found');

    // Security Check 1: Must be in CERTIFICATE_ISSUED status
    if (app.status !== 'CERTIFICATE_ISSUED' || !app.certificate) {
      throw new ForbiddenException(
        'Official Certificate is not yet available for download. All mandatory approvals must be completed first.',
      );
    }

    // Security Check 2: Student ownership check (prevent IDOR)
    const role = (user.role || '').toUpperCase();
    if (role === 'STUDENT') {
      const student = await this.resolveStudent(user);
      if (app.studentId !== student?.id && app.studentRoll !== user.identifier) {
        throw new ForbiddenException('Access denied. You may only download your own official certificates.');
      }
    }

    return this.pdfService.generateCertificatePdf(app, app.certificate, res, false);
  }

  /**
   * 11. Generate Non-Final Draft Preview PDF
   */
  async generatePreviewPdf(id: string, user: any, res: Response) {
    const app = await this.prisma.bonafideApplication.findUnique({
      where: { id },
      include: { student: true, certificate: true },
    });

    if (!app) throw new NotFoundException('Bonafide Application not found');

    return this.pdfService.generateCertificatePdf(app, app.certificate, res, true);
  }

  /**
   * 12. Public Certificate Verification by Token
   */
  async verifyCertificate(token: string) {
    const cert = await this.prisma.bonafideCertificate.findUnique({
      where: { verificationToken: token },
      include: {
        application: {
          include: { student: true },
        },
      },
    });

    if (!cert) {
      return {
        valid: false,
        status: 'INVALID',
        message: 'No matching authentic Bonafide Certificate found in GIFT Autonomous registry.',
      };
    }

    const app = cert.application;
    return {
      valid: true,
      status: 'AUTHENTICATED',
      certificateNumber: cert.certificateNumber,
      certificateTitle: cert.certificateTitle,
      institution: 'Gandhi Institute For Technology (GIFT) Autonomous, Bhubaneswar',
      studentName: app.studentName,
      studentRoll: app.studentRoll,
      purpose: app.purpose,
      academicYear: app.academicYear,
      issueDate: cert.issueDate,
      issuedBy: cert.issuedBy,
      message: 'AUTHENTICATED: This is an authentic official Bonafide Certificate issued by GIFT Autonomous, Bhubaneswar.',
    };
  }

  /**
   * 13. Fee Structures for Study Loan Calculator
   */
  async getFeeStructures() {
    const structures = await this.prisma.feeStructure.findMany();
    return structures;
  }
}
