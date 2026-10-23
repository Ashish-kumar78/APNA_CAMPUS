import { Injectable, NotFoundException, BadRequestException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicantStatus, Role } from '@prisma/client';
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
    gender?: string;
    dob?: string;
    category?: string;
    programmeId?: string;
    programmeName: string;
    academicYear?: string;
    tenthMarks?: number;
    twelfthMarks?: number;
    entranceExam?: string;
    entranceRank?: number;
    address?: string;
    city?: string;
    state?: string;
    guardianName?: string;
    guardianPhone?: string;
    previousSchool?: string;
  }) {
    const year = new Date().getFullYear();
    const countRes = (await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Applicant";`)) as any[];
    const count = countRes[0]?.count || 0;
    const applicationNo = `APP-${year}-${String(count + 1).padStart(4, '0')}`;
    const id = `app_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Verify unique email
    const existing = await this.prisma.applicant.findFirst({ where: { email: data.email.trim().toLowerCase() } });
    if (existing) {
      throw new ConflictException(`An application with email ${data.email} already exists (${existing.applicationNo}).`);
    }

    // Standard required documents checklist
    const standardDocuments: DocumentVerificationItem[] = [
      {
        id: 'doc_10th',
        name: '10th Standard Marksheet & Certificate',
        type: 'MARKSHEET_10',
        status: 'UPLOADED',
        fileName: `${data.name.replace(/\s+/g, '_')}_10th_Marksheet.pdf`,
        fileSize: '1.2 MB',
        uploadedAt: new Date().toISOString(),
        remarks: 'Uploaded by candidate upon registration.',
        isRequired: true,
      },
      {
        id: 'doc_12th',
        name: '12th Standard / Diploma Passing Marksheet',
        type: 'MARKSHEET_12',
        status: data.twelfthMarks ? 'UPLOADED' : 'NOT_UPLOADED',
        fileName: data.twelfthMarks ? `${data.name.replace(/\s+/g, '_')}_12th_Marksheet.pdf` : undefined,
        fileSize: data.twelfthMarks ? '1.5 MB' : undefined,
        uploadedAt: data.twelfthMarks ? new Date().toISOString() : undefined,
        remarks: data.twelfthMarks ? 'Pending verification against council board.' : 'Candidate to submit before deadline.',
        isRequired: true,
      },
      {
        id: 'doc_tc',
        name: 'College / School Leaving Certificate (CLC/TC)',
        type: 'TRANSFER_CERT',
        status: 'NOT_UPLOADED',
        remarks: 'Physical original to be verified at counselling.',
        isRequired: true,
      },
      {
        id: 'doc_id',
        name: 'Government Identity Proof (Aadhaar / Passport)',
        type: 'ID_PROOF',
        status: 'UPLOADED',
        fileName: `${data.name.replace(/\s+/g, '_')}_Aadhaar.pdf`,
        fileSize: '512 KB',
        uploadedAt: new Date().toISOString(),
        remarks: 'UIDAI biometric ID document.',
        isRequired: true,
      },
      {
        id: 'doc_photo',
        name: 'Passport Size Recent Color Photograph',
        type: 'PHOTO',
        status: 'UPLOADED',
        fileName: `${data.name.replace(/\s+/g, '_')}_Photo.jpg`,
        fileSize: '180 KB',
        uploadedAt: new Date().toISOString(),
        remarks: 'Standard passport photo.',
        isRequired: true,
      },
    ];

    if (data.category && data.category !== 'General') {
      standardDocuments.push({
        id: 'doc_cat',
        name: 'Category / Caste Certificate',
        type: 'CASTE_CERT',
        status: 'NOT_UPLOADED',
        remarks: 'Government issued caste/reservation certificate.',
        isRequired: true,
      });
    }

    // Merit score calculation
    const tenth = Number(data.tenthMarks) || 75;
    const twelfth = Number(data.twelfthMarks) || 75;
    const entranceBonus = data.entranceRank && data.entranceRank < 50000 ? Math.max(0, 10 - Math.round(data.entranceRank / 10000)) : 5;
    const meritScore = Math.round((0.35 * tenth + 0.55 * twelfth + entranceBonus) * 10) / 10;

    const initialHistory: AuditHistoryItem[] = [
      {
        timestamp: new Date().toISOString(),
        action: 'APPLICATION_SUBMITTED',
        user: 'Admissions Desk / Online Portal',
        note: `Applicant registration completed for ${data.programmeName}. Application No: ${applicationNo}`,
      },
    ];

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "Applicant" (
        "id", "applicationNo", "name", "email", "phone", "gender", "dob", "category",
        "programmeId", "programmeName", "academicYear", "tenthMarks", "twelfthMarks",
        "entranceExam", "entranceRank", "status", "stage", "meritScore", "feeAmount",
        "feePaid", "feeStatus", "address", "city", "state", "guardianName", "guardianPhone",
        "previousSchool", "documents", "history", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, 'APPLIED'::"ApplicantStatus", 'SUBMITTED', $16, 40000,
        0, 'Pending', $17, $18, $19, $20, $21,
        $22, $23::jsonb, $24::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );`,
      id,
      applicationNo,
      data.name.trim(),
      data.email.trim().toLowerCase(),
      data.phone.trim(),
      data.gender || 'Not Specified',
      data.dob || null,
      data.category || 'General',
      data.programmeId || null,
      data.programmeName,
      data.academicYear || '2026-27',
      data.tenthMarks ? Number(data.tenthMarks) : null,
      data.twelfthMarks ? Number(data.twelfthMarks) : null,
      data.entranceExam || 'Direct Merit',
      data.entranceRank ? Number(data.entranceRank) : null,
      meritScore,
      data.address || 'Hostel Campus / Residential',
      data.city || 'Bhubaneswar',
      data.state || 'Odisha',
      data.guardianName || 'Guardian',
      data.guardianPhone || data.phone.trim(),
      data.previousSchool || 'High School / Junior College',
      JSON.stringify(standardDocuments),
      JSON.stringify(initialHistory)
    );

    return this.getApplicantById(id);
  }

  /**
   * 5. Document Verification Workflow: Verify individual document or request replacement
   */
  async verifyDocument(
    applicantId: string,
    docId: string,
    actionData: {
      status: 'VERIFIED' | 'REJECTED' | 'REPLACEMENT_REQUESTED' | 'UNDER_REVIEW';
      remarks?: string;
      replacementReason?: string;
    },
    verifierName: string
  ) {
    const applicant = await this.getApplicantById(applicantId);
    if (applicant.status === 'ENROLLED') {
      throw new BadRequestException('Cannot alter documents for an already enrolled student.');
    }

    const docs: DocumentVerificationItem[] = applicant.documents || [];
    const docIndex = docs.findIndex((d) => d.id === docId);
    if (docIndex === -1) {
      throw new NotFoundException(`Document with ID ${docId} not found on this application.`);
    }

    const targetDoc = docs[docIndex];
    targetDoc.status = actionData.status;
    targetDoc.remarks = actionData.remarks || targetDoc.remarks;
    targetDoc.verifiedBy = verifierName;
    targetDoc.verifiedAt = new Date().toISOString();

    if (actionData.status === 'REPLACEMENT_REQUESTED') {
      targetDoc.replacementReason = actionData.replacementReason || 'Please re-upload a clear and valid document scan.';
    }

    // Evaluate overall document status
    const allMandatoryVerified = docs.filter((d) => d.isRequired).every((d) => d.status === 'VERIFIED');
    const hasReplacement = docs.some((d) => d.status === 'REPLACEMENT_REQUESTED' || d.status === 'REJECTED');

    let newStatus = applicant.status;
    let newStage = applicant.stage;

    if (allMandatoryVerified) {
      newStatus = 'VERIFIED';
      newStage = 'DOCS_VERIFIED';
    } else if (hasReplacement) {
      newStage = 'DOCS_PENDING';
    }

    const auditEntry: AuditHistoryItem = {
      timestamp: new Date().toISOString(),
      action: `DOC_${actionData.status}`,
      user: verifierName,
      note: `Document "${targetDoc.name}" marked as ${actionData.status}. Remarks: ${actionData.remarks || 'None'}`,
    };

    const history = [...(applicant.history || []), auditEntry];

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Applicant"
       SET "documents" = $1::jsonb,
           "status" = $2::"ApplicantStatus",
           "stage" = $3,
           "verifiedBy" = $4,
           "history" = $5::jsonb,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $6;`,
      JSON.stringify(docs),
      newStatus,
      newStage,
      verifierName,
      JSON.stringify(history),
      applicantId
    );

    return this.getApplicantById(applicantId);
  }

  /**
   * 6. Bulk verify documents for multiple applicants
   */
  async bulkVerifyDocuments(applicantIds: string[], verifierName: string) {
    const updated: string[] = [];
    for (const id of applicantIds) {
      try {
        const applicant = await this.getApplicantById(id);
        if (applicant.status !== 'ENROLLED') {
          const docs = (applicant.documents || []).map((d: any) => ({
            ...d,
            status: 'VERIFIED',
            verifiedBy: verifierName,
            verifiedAt: new Date().toISOString(),
          }));

          const auditEntry: AuditHistoryItem = {
            timestamp: new Date().toISOString(),
            action: 'BULK_DOCS_VERIFIED',
            user: verifierName,
            note: 'All mandatory documents verified via batch verification.',
          };

          await this.prisma.$executeRawUnsafe(
            `UPDATE "Applicant"
             SET "documents" = $1::jsonb,
                 "status" = 'VERIFIED'::"ApplicantStatus",
                 "stage" = 'DOCS_VERIFIED',
                 "verifiedBy" = $2,
                 "history" = $3::jsonb,
                 "updatedAt" = CURRENT_TIMESTAMP
             WHERE "id" = $4;`,
            JSON.stringify(docs),
            verifierName,
            JSON.stringify([...(applicant.history || []), auditEntry]),
            id
          );
          updated.push(id);
        }
      } catch (err) {
        console.warn('Bulk verify error for ID:', id, err);
      }
    }
    return { success: true, count: updated.length, updatedIds: updated };
  }

  /**
   * 7. Admission Review and Controlled Decision Workflow
   */
  async reviewApplicant(
    applicantId: string,
    decisionData: {
      decision: 'APPROVE' | 'REJECT' | 'WAITLIST' | 'UNDER_REVIEW';
      notes?: string;
      reason?: string;
      assignedReviewer?: string;
      bypassIncompleteDocs?: boolean;
    },
    reviewerName: string
  ) {
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

    return this.getApplicantById(applicantId);
  }

  /**
   * 8. Generate Official Admission Offer Letter
   */
  async generateAdmissionOffer(
    applicantId: string,
    offerData: { validUntil?: string; conditions?: string },
    officerName: string
  ) {
    const applicant = await this.getApplicantById(applicantId);
    if (applicant.status !== 'APPROVED') {
      throw new BadRequestException('Offer letter can only be generated for APPROVED applications.');
    }

    // Default validity: 7 days from now
    const validDate = offerData.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const auditEntry: AuditHistoryItem = {
      timestamp: new Date().toISOString(),
      action: 'OFFER_GENERATED',
      user: officerName,
      note: `Provisional Admission Offer dispatched. Valid until ${validDate}. Programme: ${applicant.programmeName}.`,
    };

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Applicant"
       SET "stage" = 'OFFER_SENT',
           "offerLetterGenerated" = true,
           "offerValidUntil" = $1,
           "history" = $2::jsonb,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $3;`,
      validDate,
      JSON.stringify([...(applicant.history || []), auditEntry]),
      applicantId
    );

    return {
      success: true,
      message: `Provisional offer letter generated for ${applicant.name}. Valid until ${validDate}`,
      applicant: await this.getApplicantById(applicantId),
    };
  }

  /**
   * 9. Candidate Responds to Offer (Accept or Decline)
   */
  async respondToOffer(
    applicantId: string,
    response: { action: 'ACCEPT' | 'DECLINE'; remarks?: string },
    responderName: string
  ) {
    const applicant = await this.getApplicantById(applicantId);
    if (applicant.stage !== 'OFFER_SENT') {
      throw new BadRequestException('Application does not currently have an active pending offer.');
    }

    const isAccept = response.action === 'ACCEPT';
    const nextStage = isAccept ? 'OFFER_ACCEPTED' : 'WITHDRAWN';

    const auditEntry: AuditHistoryItem = {
      timestamp: new Date().toISOString(),
      action: isAccept ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED',
      user: responderName || applicant.name,
      note: isAccept
        ? `Candidate accepted provisional admission offer. Proceeding to fee confirmation.`
        : `Candidate declined provisional admission offer. Reason: ${response.remarks || 'Personal choice'}`,
    };

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Applicant"
       SET "stage" = $1,
           "offerAcceptedAt" = CASE WHEN $1 = 'OFFER_ACCEPTED' THEN CURRENT_TIMESTAMP ELSE "offerAcceptedAt" END,
           "history" = $2::jsonb,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $3;`,
      nextStage,
      JSON.stringify([...(applicant.history || []), auditEntry]),
      applicantId
    );

    return this.getApplicantById(applicantId);
  }

  /**
   * 10. Confirm Admission Fee Payment
   */
  async confirmAdmissionFee(
    applicantId: string,
    paymentData: {
      amount?: number;
      receiptRef: string;
      paymentMode?: string;
      remarks?: string;
    },
    confirmedBy: string
  ) {
    const applicant = await this.getApplicantById(applicantId);
    if (applicant.status === 'ENROLLED') {
      throw new BadRequestException('Fee already settled for this enrolled student.');
    }

    const amountPaid = paymentData.amount || applicant.feeAmount || 40000;
    const auditEntry: AuditHistoryItem = {
      timestamp: new Date().toISOString(),
      action: 'FEE_CONFIRMED',
      user: confirmedBy,
      note: `Admission fee of ₹${amountPaid.toLocaleString('en-IN')} confirmed via ${paymentData.paymentMode || 'Online Banking'}. Receipt/UTR: ${paymentData.receiptRef}. Remarks: ${paymentData.remarks || 'Verified with Accounts division'}`,
    };

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Applicant"
       SET "feePaid" = $1,
           "feeStatus" = 'Paid',
           "feeReceiptRef" = $2,
           "feeConfirmedBy" = $3,
           "feeConfirmedAt" = CURRENT_TIMESTAMP,
           "stage" = 'FEE_CONFIRMED',
           "history" = $4::jsonb,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $5;`,
      amountPaid,
      paymentData.receiptRef,
      confirmedBy,
      JSON.stringify([...(applicant.history || []), auditEntry]),
      applicantId
    );

    return this.getApplicantById(applicantId);
  }

  /**
   * 11. Finalize Institutional Enrollment (Multi-Step Atomic Operation)
   * Prevents duplicate enrollment, generates unique roll number, creates Student,
   * creates StudentEnrollment, creates User, and issues activation token.
   */
  async approveAndEnroll(
    applicantId: string,
    approvedBy: string,
    enrollmentOptions?: { section?: string; semester?: string }
  ) {
    const applicant = await this.getApplicantById(applicantId);

    if (applicant.status === 'ENROLLED') {
      throw new BadRequestException(`Applicant ${applicant.applicationNo} has already been enrolled into the college.`);
    }

    // Resolve programme & department
    let prog = applicant.programme;
    if (!prog && applicant.programmeId) {
      prog = await this.prisma.programme.findUnique({ where: { id: applicant.programmeId } });
    }

    const deptCode = prog?.departmentCode || 'CSE';
    const deptName = prog?.name || 'Computer Science & Engineering';
    const academicYear = applicant.academicYear || '2026-27';
    const semester = enrollmentOptions?.semester || 'Semester 1';
    const section = enrollmentOptions?.section || 'Section A';

    // Generate unique institutional registration number and roll number
    const totalStudents = await this.prisma.student.count();
    const batchYear = academicYear.slice(2, 4); // "26"
    const uniqueRollNumber = `${batchYear}${deptCode}${String(totalStudents + 101).padStart(4, '0')}`;
    const studentIdNumber = `STU-${batchYear}-${String(totalStudents + 1).padStart(4, '0')}`;

    // Cryptographic activation token
    const activationToken = crypto.randomBytes(24).toString('hex');
    const tempSalt = await bcrypt.genSalt(10);
    const tempPasswordHash = await bcrypt.hash(`Gift@${new Date().getFullYear()}`, tempSalt);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create Student record
      const student = await tx.student.create({
        data: {
          studentId: studentIdNumber,
          rollNumber: uniqueRollNumber,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          gender: applicant.gender || 'Not Specified',
          dob: applicant.dob || '01-01-2005',
          category: applicant.category || 'General',
          department: deptName,
          deptCode: deptCode,
          semester: semester,
          section: section,
          academicYear: academicYear,
          status: 'Active',
          cgpa: 0.0,
          attendance: 100,
          walletBalance: 500.0,
          programmeId: prog?.id || null,
        },
      });

      // 2. Create StudentEnrollment record
      const enrollment = await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          programmeId: prog?.id || null,
          academicYear: academicYear,
          semester: semester,
          section: section,
          status: 'Enrolled',
          attendanceRate: 100.0,
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
          department: deptName,
          detail: `${semester} · ${section}`,
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

      // 5. Update Applicant record to ENROLLED
      const auditEntry: AuditHistoryItem = {
        timestamp: new Date().toISOString(),
        action: 'ENROLLED',
        user: approvedBy,
        note: `Final enrollment confirmed. Assigned Student ID: ${studentIdNumber}, Roll No: ${uniqueRollNumber}, Programme: ${deptName}.`,
      };

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
          user: approvedBy,
          role: 'ADMIN',
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
        activationToken,
        activationUrl: `/activate?token=${activationToken}`,
        loginId: result.user.identifier,
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
