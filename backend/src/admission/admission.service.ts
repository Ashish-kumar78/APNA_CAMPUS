import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicantStatus, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AdmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicants(query?: { search?: string; status?: string; programmeId?: string; academicYear?: string }) {
    const where: any = {};

    if (query?.status && query.status !== 'All') {
      where.status = query.status as ApplicantStatus;
    }
    if (query?.programmeId && query.programmeId !== 'All') {
      where.programmeId = query.programmeId;
    }
    if (query?.academicYear && query.academicYear !== 'All') {
      where.academicYear = query.academicYear;
    }
    if (query?.search) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { applicationNo: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.applicant.findMany({
      where,
      include: { programme: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApplicantById(id: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: { programme: true },
    });
    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${id} not found.`);
    }
    return applicant;
  }

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
   * Complete End-to-End Atomic Admission & Account Provisioning Workflow:
   * 1. Validate applicant status (must not already be ENROLLED).
   * 2. Generate institutional Registration Number and Roll Number.
   * 3. Create Student record.
   * 4. Create StudentEnrollment for Semester 1.
   * 5. Generate secure random activation token.
   * 6. Create User account with role STUDENT (isActivated: false).
   * 7. Link User and Student bidirectionally.
   * 8. Mark Applicant as ENROLLED.
   * 9. Write audit log trail.
   */
  async approveAndEnroll(applicantId: string, actor: { id: string; name: string; role: string }) {
    const applicant = await this.getApplicantById(applicantId);

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

    // Atomic Prisma Transaction guarantees integrity
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

      // 6. Record audit log
      await tx.auditLog.create({
        data: {
          user: actor.name,
          role: actor.role.toUpperCase(),
          targetStudent: student.name,
          subject: 'Admissions & Enrollment',
          reason: `Approved admission for applicant ${applicant.applicationNo} -> Created Student ID: ${student.rollNumber}`,
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

  async getAdmissionStats() {
    const total = await this.prisma.applicant.count();
    const applied = await this.prisma.applicant.count({ where: { status: ApplicantStatus.APPLIED } });
    const verified = await this.prisma.applicant.count({ where: { status: ApplicantStatus.VERIFIED } });
    const approved = await this.prisma.applicant.count({ where: { status: ApplicantStatus.APPROVED } });
    const enrolled = await this.prisma.applicant.count({ where: { status: ApplicantStatus.ENROLLED } });
    const rejected = await this.prisma.applicant.count({ where: { status: ApplicantStatus.REJECTED } });

    return {
      total,
      applied,
      verified,
      approved,
      enrolled,
      rejected,
      conversionRate: total > 0 ? `${Math.round((enrolled / total) * 100)}%` : '0%',
    };
  }
}
