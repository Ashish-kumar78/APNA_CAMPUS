import { Injectable, NotFoundException, BadRequestException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicantStatus, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export interface DocumentVerificationItem {
  id: string;
  name: string;
  type: string;
  status: 'NOT_UPLOADED' | 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'REPLACEMENT_REQUESTED';
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
  replacementReason?: string;
  isRequired: boolean;
}

export interface AuditHistoryItem {
  timestamp: string;
  action: string;
  user: string;
  note: string;
}

@Injectable()
export class AdmissionService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AdmissionDeadline" (
          "id" TEXT PRIMARY KEY,
          "title" TEXT NOT NULL,
          "category" TEXT NOT NULL DEFAULT 'General',
          "programmeCode" TEXT NOT NULL DEFAULT 'All',
          "deadlineDate" TEXT NOT NULL,
          "time" TEXT NOT NULL DEFAULT '05:00 PM',
          "description" TEXT,
          "status" TEXT NOT NULL DEFAULT 'Active',
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "stage" TEXT DEFAULT 'SUBMITTED';
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "meritScore" DOUBLE PRECISION;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeAmount" DOUBLE PRECISION DEFAULT 40000;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feePaid" DOUBLE PRECISION DEFAULT 0;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeStatus" TEXT DEFAULT 'Pending';
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeReceiptRef" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeConfirmedBy" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeConfirmedAt" TIMESTAMP;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "address" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "city" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "state" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "guardianName" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "guardianPhone" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "previousSchool" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "assignedReviewer" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "offerLetterGenerated" BOOLEAN DEFAULT FALSE;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "offerValidUntil" TEXT;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "offerAcceptedAt" TIMESTAMP;
        ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "history" JSONB DEFAULT '[]'::jsonb;
      `);
    } catch (err: any) {
      console.warn('Admission table / column auto-sync notice:', (err as any)?.message || err);
    }
  }

  /**
   * Helper: Map raw SQL row to typed applicant object
   */
  private formatApplicantRow(row: any) {
    if (!row) return null;
    return {
      ...row,
      documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || []),
      history: typeof row.history === 'string' ? JSON.parse(row.history) : (row.history || []),
      stage: row.stage || (row.status === 'ENROLLED' ? 'ENROLLED' : row.status === 'APPROVED' ? 'APPROVED' : row.status === 'VERIFIED' ? 'DOCS_VERIFIED' : 'UNDER_REVIEW'),
      feeAmount: row.feeAmount !== null && row.feeAmount !== undefined ? Number(row.feeAmount) : 40000,
      feePaid: row.feePaid !== null && row.feePaid !== undefined ? Number(row.feePaid) : 0,
      meritScore: row.meritScore !== null && row.meritScore !== undefined ? Number(row.meritScore) : null,
      tenthMarks: row.tenthMarks !== null && row.tenthMarks !== undefined ? Number(row.tenthMarks) : null,
      twelfthMarks: row.twelfthMarks !== null && row.twelfthMarks !== undefined ? Number(row.twelfthMarks) : null,
    };
  }

  /**
   * 1. Get comprehensive real database-backed statistics for the Admission Dashboard
   */
  async getAdmissionStats() {
    const rawApplicants: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM "Applicant" ORDER BY "createdAt" DESC;`);
    const applicants = rawApplicants.map((r) => this.formatApplicantRow(r));

    const total = applicants.length;
    const awaitingReview = applicants.filter((a) => a.status === 'APPLIED' && (a.stage === 'SUBMITTED' || a.stage === 'UNDER_REVIEW')).length;
    const documentsPending = applicants.filter((a) => {
      if (a.stage === 'DOCS_PENDING') return true;
      const docs = a.documents || [];
      return docs.some((d: any) => d.isRequired && (d.status === 'UNDER_REVIEW' || d.status === 'REPLACEMENT_REQUESTED' || d.status === 'NOT_UPLOADED'));
    }).length;
    const approved = applicants.filter((a) => a.status === 'APPROVED').length;
    const offersAwaitingAcceptance = applicants.filter((a) => a.stage === 'OFFER_SENT').length;
    const offersAccepted = applicants.filter((a) => a.stage === 'OFFER_ACCEPTED').length;
    const feeConfirmed = applicants.filter((a) => a.stage === 'FEE_CONFIRMED' || a.feeStatus === 'Paid').length;
    const enrolled = applicants.filter((a) => a.status === 'ENROLLED' || a.stage === 'ENROLLED').length;
    const rejected = applicants.filter((a) => a.status === 'REJECTED' || a.stage === 'REJECTED').length;
    const incomplete = applicants.filter((a) => !a.twelfthMarks || (a.documents && a.documents.some((d: any) => d.status === 'NOT_UPLOADED'))).length;

    // Funnel pipeline counts
    const pipeline = {
      submitted: total,
      underReview: applicants.filter((a) => a.stage === 'UNDER_REVIEW' || a.status === 'APPLIED').length,
      docsVerified: applicants.filter((a) => a.stage === 'DOCS_VERIFIED' || a.status === 'VERIFIED' || a.status === 'APPROVED' || a.status === 'ENROLLED').length,
      approved: applicants.filter((a) => a.status === 'APPROVED' || a.status === 'ENROLLED').length,
      offerAccepted: applicants.filter((a) => a.stage === 'OFFER_ACCEPTED' || a.stage === 'FEE_CONFIRMED' || a.status === 'ENROLLED').length,
      feeConfirmed: applicants.filter((a) => a.stage === 'FEE_CONFIRMED' || a.feeStatus === 'Paid' || a.status === 'ENROLLED').length,
      enrolled: enrolled,
    };

    // By Programme
    const byProgramme: Record<string, number> = {};
    for (const a of applicants) {
      const prog = a.programmeName || 'General';
      byProgramme[prog] = (byProgramme[prog] || 0) + 1;
    }

    // By Category
    const byCategory: Record<string, number> = {};
    for (const a of applicants) {
      const cat = a.category || 'General';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    // Practical Priority Action List with Age and Direct Record Links
    const now = new Date().getTime();
    const pendingTasks: any[] = [];

    // Check docs awaiting verification
    for (const a of applicants) {
      if (a.status !== 'ENROLLED' && a.status !== 'REJECTED') {
        const createdMs = new Date(a.createdAt).getTime();
        const ageHours = Math.max(1, Math.round((now - createdMs) / (1000 * 60 * 60)));
        const ageDays = Math.round(ageHours / 24);

        if (a.stage === 'DOCS_PENDING' || (a.documents && a.documents.some((d: any) => d.status === 'UNDER_REVIEW'))) {
          pendingTasks.push({
            id: `task-doc-${a.id}`,
            applicantId: a.id,
            applicationNo: a.applicationNo,
            applicantName: a.name,
            programme: a.programmeName,
            type: 'DOCUMENT_VERIFICATION',
            title: `Verify academic documents for ${a.name}`,
            severity: ageDays > 2 ? 'high' : 'medium',
            ageText: ageDays > 0 ? `${ageDays}d old` : `${ageHours}h old`,
            isOverdue: ageDays >= 2,
            actionLabel: 'Verify Docs',
          });
        }

        if (a.stage === 'OFFER_SENT' && a.offerValidUntil) {
          pendingTasks.push({
            id: `task-offer-${a.id}`,
            applicantId: a.id,
            applicationNo: a.applicationNo,
            applicantName: a.name,
            programme: a.programmeName,
            type: 'OFFER_EXPIRY',
            title: `Offer valid until ${a.offerValidUntil} for ${a.name}`,
            severity: 'high',
            ageText: `Expires ${a.offerValidUntil}`,
            isOverdue: false,
            actionLabel: 'Check Offer',
          });
        }

        if (a.stage === 'OFFER_ACCEPTED' && a.feeStatus !== 'Paid') {
          pendingTasks.push({
            id: `task-fee-${a.id}`,
            applicantId: a.id,
            applicationNo: a.applicationNo,
            applicantName: a.name,
            programme: a.programmeName,
            type: 'FEE_CONFIRMATION',
            title: `Confirm admission fee deposit (₹${(a.feeAmount || 40000).toLocaleString('en-IN')})`,
            severity: 'medium',
            ageText: `${ageDays}d pending`,
            isOverdue: ageDays >= 3,
            actionLabel: 'Confirm Fee',
          });
        }

        if (a.stage === 'FEE_CONFIRMED') {
          pendingTasks.push({
            id: `task-enroll-${a.id}`,
            applicantId: a.id,
            applicationNo: a.applicationNo,
            applicantName: a.name,
            programme: a.programmeName,
            type: 'FINAL_ENROLLMENT',
            title: `Finalize student enrollment and ID provisioning for ${a.name}`,
            severity: 'urgent',
            ageText: 'Fee Paid · Ready',
            isOverdue: true,
            actionLabel: 'Enroll Now',
          });
        }
      }
    }

    return {
      total,
      applied: awaitingReview,
      awaitingReview,
      documentsPending,
      approved,
      offersAwaitingAcceptance,
      offersAccepted,
      feeConfirmed,
      enrolled,
      rejected,
      incomplete,
      conversionRate: total > 0 ? `${Math.round((enrolled / total) * 100)}%` : '0%',
      pipeline,
      byProgramme,
      byCategory,
      pendingTasks: pendingTasks.slice(0, 10),
    };
  }

  /**
   * 2. Search, Filter, Sort, and Paginate Applicants
   */
  async getApplicants(query?: {
    search?: string;
    status?: string;
    stage?: string;
    programmeId?: string;
    academicYear?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number | string;
    limit?: number | string;
  }) {
    const rawApplicants: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM "Applicant" ORDER BY "createdAt" DESC;`);
    let applicants = rawApplicants.map((r) => this.formatApplicantRow(r));

    // Filters
    if (query?.status && query.status !== 'All') {
      applicants = applicants.filter((a) => a.status === query.status);
    }
    if (query?.stage && query.stage !== 'All') {
      applicants = applicants.filter((a) => a.stage === query.stage);
    }
    if (query?.academicYear && query.academicYear !== 'All') {
      applicants = applicants.filter((a) => a.academicYear === query.academicYear);
    }
    if (query?.programmeId && query.programmeId !== 'All') {
      applicants = applicants.filter((a) => a.programmeId === query.programmeId || a.programmeName?.includes(query.programmeId));
    }
    if (query?.search) {
      const q = query.search.trim().toLowerCase();
      applicants = applicants.filter((a) =>
        a.name?.toLowerCase().includes(q) ||
        a.applicationNo?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.includes(q) ||
        a.programmeName?.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder === 'asc' ? 1 : -1;

    applicants.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    const total = applicants.length;
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = query?.limit === 'All' ? total : Math.max(1, Number(query?.limit) || 20);
    const startIndex = (page - 1) * limit;
    const paginated = applicants.slice(startIndex, startIndex + limit);

    return {
      applicants: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 3. Get Single Applicant By ID with all Details
   */
  async getApplicantById(id: string) {
    const rows: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM "Applicant" WHERE "id" = $1 LIMIT 1;`, id);
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Applicant with ID ${id} not found.`);
    }
    const applicant = this.formatApplicantRow(rows[0]);

    // Attach programme details if available
    if (applicant.programmeId) {
      const prog = await this.prisma.programme.findUnique({ where: { id: applicant.programmeId } });
      if (prog) applicant.programme = prog;
    }

    return applicant;
  }

  /**
   * 4. Register a New Applicant
   */
  async createApplicant(data: {
    name: string;
    email: string;
    phone: string;
    gender: string;
    dob: string;
    category: string;
    programmeId: string;
    academicYear: string;
    tenthMarks?: number;
    twelfthMarks?: number;
    entranceExam?: string;
    entranceRank?: number;
  }, actor: { name: string; role: string }) {
    const year = new Date().getFullYear();
    if (![data.name, data.phone, data.gender, data.category, data.academicYear].every((value) => value?.trim())) {
      throw new BadRequestException('Name, phone, gender, category, and academic year are required.');
    }
    const birthDate = new Date(data.dob);
    if (Number.isNaN(birthDate.getTime()) || birthDate.getTime() > Date.now()) {
      throw new BadRequestException('Enter a valid date of birth that is not in the future.');
    }
    if (!/^\d{4}-(?:\d{2}|\d{4})$/.test(data.academicYear.trim())) {
      throw new BadRequestException('Academic year must use YYYY-YY or YYYY-YYYY format.');
    }
    const configuredAcademicYear = await this.prisma.academicYear.findUnique({
      where: { year: data.academicYear.trim() },
      select: { id: true },
    });
    if (!configuredAcademicYear) {
      throw new BadRequestException('Select an academic year configured in Academic Setup.');
    }
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.applicant.findFirst({ where: { email } });
    if (existing) {
      throw new ConflictException(`An application with email ${data.email} already exists (${existing.applicationNo}).`);
    }

    const programme = await this.prisma.programme.findUnique({ where: { id: data.programmeId } });
    if (!programme || programme.status !== 'Active') {
      throw new BadRequestException('Select an existing active programme.');
    }

    // Random identifiers avoid count-based collisions when multiple admissions arrive together.
    const applicationNo = `APP-${year}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const created = await tx.applicant.create({
          data: {
            applicationNo,
            name: data.name.trim(),
            email,
            phone: data.phone.trim(),
            gender: data.gender.trim(),
            dob: data.dob,
            category: data.category.trim(),
            programmeId: programme.id,
            programmeName: programme.name,
            academicYear: data.academicYear.trim(),
            tenthMarks: data.tenthMarks ?? null,
            twelfthMarks: data.twelfthMarks ?? null,
            entranceExam: data.entranceExam?.trim() || null,
            entranceRank: data.entranceRank ?? null,
            documents: [] as Prisma.InputJsonValue,
            status: ApplicantStatus.APPLIED,
          },
          include: { programme: true },
        });
        await tx.auditLog.create({
          data: {
            user: actor.name,
            role: actor.role.toUpperCase(),
            action: 'ADMISSION_APPLICATION_REGISTERED',
            target: `Application ${created.applicationNo}`,
            subject: 'Admissions & Enrollment',
            reason: 'An admissions application was registered.',
            changedAt: new Date().toISOString(),
          },
        });
        return created;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('An application with this identifier already exists. Please retry.');
      }
      throw error;
    }
  }

  async verifyApplicant(id: string, actor: { name: string; role: string }) {
    const applicant = await this.getApplicantById(id);
    if (applicant.status !== ApplicantStatus.APPLIED) {
      throw new BadRequestException(`Only applications in APPLIED status can be verified (current status: ${applicant.status}).`);
    }

    const changed = await this.prisma.$transaction(async (tx) => {
      const result = await tx.applicant.updateMany({
        where: { id, status: ApplicantStatus.APPLIED },
        data: { status: ApplicantStatus.VERIFIED, verifiedBy: actor.name },
      });
      if (result.count === 1) {
        await tx.auditLog.create({
          data: {
            user: actor.name,
            role: actor.role.toUpperCase(),
            action: 'ADMISSION_APPLICATION_VERIFIED',
            target: `Application ${applicant.applicationNo}`,
            subject: 'Admissions & Enrollment',
            reason: 'Eligibility was marked verified by an admissions reviewer.',
            changedAt: new Date().toISOString(),
          },
        });
      }
      return result;
    });
    if (changed.count !== 1) throw new ConflictException('The application changed while it was being verified. Refresh and try again.');
    return this.getApplicantById(id);
  }

  async rejectApplicant(id: string, reason: string, actor: { name: string; role: string }) {
    const applicant = await this.getApplicantById(id);
    if (applicant.status !== ApplicantStatus.APPLIED && applicant.status !== ApplicantStatus.VERIFIED) {
      throw new BadRequestException(`This application cannot be rejected from ${applicant.status} status.`);
    }

    const changed = await this.prisma.$transaction(async (tx) => {
      const result = await tx.applicant.updateMany({
        where: { id, status: applicant.status },
        data: {
          status: ApplicantStatus.REJECTED,
          rejectionReason: reason.trim(),
        },
      });
      if (result.count === 1) {
        await tx.auditLog.create({
          data: {
            user: actor.name,
            role: actor.role.toUpperCase(),
            action: 'ADMISSION_APPLICATION_REJECTED',
            target: `Application ${applicant.applicationNo}`,
            oldValue: applicant.status,
            newValue: ApplicantStatus.REJECTED,
            subject: 'Admissions & Enrollment',
            reason: reason.trim(),
            changedAt: new Date().toISOString(),
          },
        });
      }
      return result;
    });
    if (changed.count !== 1) throw new ConflictException('The application changed while it was being rejected. Refresh and try again.');
    return this.getApplicantById(id);
  }

  /**
   * 6. Bulk verify documents for multiple applicants
   */
  async approveAndEnroll(applicantId: string, actor: { id: string; name: string; role: string }) {
    const applicant = await this.getApplicantById(applicantId);
    if (applicant.status === 'ENROLLED') {
      throw new BadRequestException('Cannot modify status of an already enrolled student.');
    }

    let nextStatus = applicant.status;
    let nextStage = applicant.stage;
    let rejectionReason = applicant.rejectionReason;

    if (decisionData.decision === 'APPROVE') {
      // Validate mandatory documents check
      const docs: DocumentVerificationItem[] = applicant.documents || [];
      const unverifiedMandatory = docs.filter((d) => d.isRequired && d.status !== 'VERIFIED');
      if (unverifiedMandatory.length > 0 && !decisionData.bypassIncompleteDocs) {
        throw new BadRequestException(
          `Cannot approve application: ${unverifiedMandatory.length} mandatory document(s) (${unverifiedMandatory.map((d) => d.name).join(', ')}) are not verified. Record an authorized exception to bypass.`
        );
      }

      nextStatus = 'APPROVED';
      nextStage = 'APPROVED';
    } else if (decisionData.decision === 'REJECT') {
      nextStatus = 'REJECTED';
      nextStage = 'REJECTED';
      rejectionReason = decisionData.reason || decisionData.notes || 'Did not meet institutional admission criteria.';
    } else if (decisionData.decision === 'WAITLIST') {
      nextStage = 'WAITLISTED';
    } else if (decisionData.decision === 'UNDER_REVIEW') {
      nextStage = 'UNDER_REVIEW';
    }

    const auditEntry: AuditHistoryItem = {
      timestamp: new Date().toISOString(),
      action: `DECISION_${decisionData.decision}`,
      user: reviewerName,
      note: `Application transitioned to ${decisionData.decision}. Notes: ${decisionData.notes || decisionData.reason || 'None'}. Reviewer: ${decisionData.assignedReviewer || reviewerName}`,
    };

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Applicant"
       SET "status" = $1::"ApplicantStatus",
           "stage" = $2,
           "approvedBy" = CASE WHEN $1 = 'APPROVED' THEN $3 ELSE "approvedBy" END,
           "rejectionReason" = $4,
           "assignedReviewer" = COALESCE($5, "assignedReviewer"),
           "reviewNotes" = $6,
           "history" = $7::jsonb,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $8;`,
      nextStatus,
      nextStage,
      reviewerName,
      rejectionReason || null,
      decisionData.assignedReviewer || null,
      decisionData.notes || null,
      JSON.stringify([...(applicant.history || []), auditEntry]),
      applicantId
    );

    if (applicant.status !== ApplicantStatus.VERIFIED) {
      throw new BadRequestException(`Only verified applications can be enrolled (current status: ${applicant.status}).`);
    }

    if (!applicant.dob) {
      throw new BadRequestException('The applicant date of birth is required before enrollment.');
    }

    const prog = applicant.programmeId
      ? await this.prisma.programme.findUnique({ where: { id: applicant.programmeId } })
      : null;
    if (!prog || prog.status !== 'Active') {
      throw new BadRequestException('A valid active programme is required before enrollment.');
    }
    const department = await this.prisma.department.findUnique({ where: { code: prog.departmentCode } });
    if (!department || department.status !== 'Active') {
      throw new BadRequestException('The programme department must be configured and active before enrollment.');
    }

    const academicYear = applicant.academicYear;
    const batchYear = academicYear.slice(2, 4);
    const uniqueSuffix = crypto.randomBytes(6).toString('hex').toUpperCase();
    const uniqueRollNumber = `${batchYear}${prog.departmentCode}${uniqueSuffix}`;
    const studentIdNumber = `STU-${batchYear}-${uniqueSuffix}`;

    // Cryptographic activation token
    const activationToken = crypto.randomBytes(24).toString('hex');
    const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('base64url'), 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.applicant.updateMany({
        where: { id: applicant.id, status: ApplicantStatus.VERIFIED },
        data: { status: ApplicantStatus.APPROVED, approvedBy: actor.name },
      });
      if (claimed.count !== 1) {
        throw new ConflictException('The application changed while enrollment was being processed. Refresh and try again.');
      }

      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email: applicant.email }, { identifier: uniqueRollNumber }] },
        select: { id: true },
      });
      const existingStudent = await tx.student.findFirst({
        where: { OR: [{ email: applicant.email }, { rollNumber: uniqueRollNumber }] },
        select: { id: true },
      });
      if (existingUser || existingStudent) {
        throw new ConflictException('An account or student record already exists for this applicant. Resolve the duplicate before enrollment.');
      }

      // 1. Create Student record
      const student = await tx.student.create({
        data: {
          studentId: studentIdNumber,
          rollNumber: uniqueRollNumber,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          gender: applicant.gender,
          dob: applicant.dob,
          category: applicant.category,
          department: department.name,
          deptCode: department.code,
          semester: 'Semester 1',
          section: 'Unassigned',
          academicYear: academicYear,
          status: 'Active',
          cgpa: 0,
          attendance: 0,
          walletBalance: 0,
          programmeId: prog.id,
        },
      });

      // 2. Create StudentEnrollment record
      const enrollment = await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          programmeId: prog.id,
          academicYear: academicYear,
          semester: 'Semester 1',
          section: 'Unassigned',
          status: 'Enrolled',
          attendanceRate: 0,
        },
      });

      // 3. Create User account with role STUDENT and activationToken
      const user = await tx.user.create({
        data: {
          identifier: uniqueRollNumber,
          email: applicant.email,
          name: applicant.name,
          phone: applicant.phone,
          passwordHash: tempPasswordHash,
          role: Role.STUDENT,
          department: department.name,
          detail: 'Semester 1 · Section Unassigned',
          isActive: true,
          isActivated: false,
          activationToken: activationToken,
          permissions: ['student.portal', 'academics.view', 'attendance.view', 'marks.view', 'complaints.submit'],
        },
      });

      // 4. Link Student to User
      await tx.student.update({
        where: { id: student.id },
        data: { userId: user.id },
      });

      // 5. Update Applicant to ENROLLED
      const completed = await tx.applicant.updateMany({
        where: { id: applicant.id, status: ApplicantStatus.APPROVED },
        data: {
          status: ApplicantStatus.ENROLLED,
          studentId: student.id,
          enrolledUserId: user.id,
        },
      });
      if (completed.count !== 1) {
        throw new ConflictException('The application changed before enrollment could be completed.');
      }

      const updatedHistory = [...(applicant.history || []), auditEntry];

      await tx.$executeRawUnsafe(
        `UPDATE "Applicant"
         SET "status" = 'ENROLLED'::"ApplicantStatus",
             "stage" = 'ENROLLED',
             "approvedBy" = $1,
             "studentId" = $2,
             "enrolledUserId" = $3,
             "feeStatus" = 'Paid',
             "history" = $4::jsonb,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "id" = $5;`,
        approvedBy,
        student.id,
        user.id,
        JSON.stringify(updatedHistory),
        applicant.id
      );

      // 6. Record institutional audit log
      await tx.auditLog.create({
        data: {
          user: actor.name,
          role: actor.role.toUpperCase(),
          targetStudent: student.name,
          subject: 'Admissions & Final Enrollment',
          reason: `Approved admission for applicant ${applicant.applicationNo} -> Created Student Roll No: ${student.rollNumber}`,
          changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
      });

      return { student, enrollment, user };
    });

    return {
      success: true,
      message: `Applicant ${applicant.name} successfully admitted & enrolled!`,
      data: {
        applicationNo: applicant.applicationNo,
        studentId: result.student.studentId,
        rollNumber: result.student.rollNumber,
        name: result.student.name,
        email: result.student.email,
        department: result.student.department,
        semester: result.student.semester,
        loginId: result.user.identifier,
        activationStatus: 'PENDING_EMAIL_CONFIGURATION',
        status: 'ENROLLED',
      },
    };
  }

  /**
   * 12. Admission Deadlines Management
   */
  async getAdmissionDeadlines() {
    const deadlines: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT * FROM "AdmissionDeadline" ORDER BY "deadlineDate" ASC;`
    );
    return deadlines;
  }

  async createAdmissionDeadline(data: {
    title: string;
    category?: string;
    programmeCode?: string;
    deadlineDate: string;
    time?: string;
    description?: string;
  }) {
    const id = `dl_${Date.now()}`;
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "AdmissionDeadline" ("id", "title", "category", "programmeCode", "deadlineDate", "time", "description", "status")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active');`,
      id,
      data.title,
      data.category || 'General',
      data.programmeCode || 'All',
      data.deadlineDate,
      data.time || '05:00 PM',
      data.description || ''
    );
    return { success: true, message: 'Deadline added successfully.' };
  }

  async updateAdmissionDeadline(id: string, data: { status?: string; deadlineDate?: string; description?: string }) {
    await this.prisma.$executeRawUnsafe(
      `UPDATE "AdmissionDeadline"
       SET "status" = COALESCE($1, "status"),
           "deadlineDate" = COALESCE($2, "deadlineDate"),
           "description" = COALESCE($3, "description"),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $4;`,
      data.status || null,
      data.deadlineDate || null,
      data.description || null,
      id
    );
    return { success: true, message: 'Deadline updated.' };
  }

  async deleteAdmissionDeadline(id: string) {
    await this.prisma.$executeRawUnsafe(`DELETE FROM "AdmissionDeadline" WHERE "id" = $1;`, id);
    return { success: true, message: 'Deadline removed.' };
  }

  /**
   * 13. Admission Notices / Circulars
   */
  async getAdmissionNotices() {
    return this.prisma.notice.findMany({
      where: {
        OR: [
          { tag: 'ADMISSION' },
          { tag: 'DEADLINE' },
          { title: { contains: 'Admission', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdmissionNotice(data: {
    title: string;
    summary: string;
    content: string;
    pinned?: boolean;
  }, publisherName: string) {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    return this.prisma.notice.create({
      data: {
        title: data.title,
        tag: 'ADMISSION',
        date: dateStr,
        publisher: publisherName,
        pinned: data.pinned ?? true,
        summary: data.summary,
        content: data.content,
      },
    });
  }

  /**
   * 14. Merit List Generation & Calculations
   */
  async getMeritList(query?: { programmeName?: string; academicYear?: string }) {
    const rawApplicants: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM "Applicant" ORDER BY "meritScore" DESC;`);
    let list = rawApplicants.map((r) => this.formatApplicantRow(r));

    if (query?.programmeName && query.programmeName !== 'All') {
      list = list.filter((a) => a.programmeName?.includes(query.programmeName));
    }
    if (query?.academicYear && query.academicYear !== 'All') {
      list = list.filter((a) => a.academicYear === query.academicYear);
    }

    // Assign ranking
    const rankedList = list.map((item, index) => ({
      ...item,
      meritRank: index + 1,
      eligibilityStatus: (item.tenthMarks || 0) >= 60 && (item.twelfthMarks || 0) >= 60 ? 'Eligible' : 'Requires Review',
    }));

    return {
      totalCandidates: rankedList.length,
      academicYear: query?.academicYear || '2026-27',
      meritList: rankedList,
    };
  }
}
