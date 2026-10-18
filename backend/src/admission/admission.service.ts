import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicantStatus, Role } from '@prisma/client';
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
    documents?: any[];
  }) {
    // Generate unique Application Number: APP-YEAR-RANDOM
    const year = new Date().getFullYear();
    const count = await this.prisma.applicant.count();
    const applicationNo = `APP-${year}-${String(count + 1).padStart(4, '0')}`;

    // Verify email unique among applicants
    const existing = await this.prisma.applicant.findFirst({ where: { email: data.email.trim().toLowerCase() } });
    if (existing) {
      throw new ConflictException(`An application with email ${data.email} already exists (${existing.applicationNo}).`);
    }

    return this.prisma.applicant.create({
      data: {
        applicationNo,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        gender: data.gender || 'Not Specified',
        dob: data.dob,
        category: data.category || 'General',
        programmeId: data.programmeId || null,
        programmeName: data.programmeName,
        academicYear: data.academicYear || '2026-27',
        tenthMarks: data.tenthMarks ? Number(data.tenthMarks) : null,
        twelfthMarks: data.twelfthMarks ? Number(data.twelfthMarks) : null,
        entranceExam: data.entranceExam || 'Direct Merit',
        entranceRank: data.entranceRank ? Number(data.entranceRank) : null,
        documents: data.documents || [],
        status: ApplicantStatus.APPLIED,
      },
      include: { programme: true },
    });
  }

  async verifyApplicant(id: string, verifiedBy: string) {
    const applicant = await this.getApplicantById(id);
    if (applicant.status === ApplicantStatus.ENROLLED) {
      throw new BadRequestException('Applicant is already enrolled into the institution.');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status: ApplicantStatus.VERIFIED,
        verifiedBy,
      },
      include: { programme: true },
    });
  }

  async rejectApplicant(id: string, reason: string, rejectedBy: string) {
    const applicant = await this.getApplicantById(id);
    if (applicant.status === ApplicantStatus.ENROLLED) {
      throw new BadRequestException('Cannot reject an applicant who is already enrolled.');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status: ApplicantStatus.REJECTED,
        rejectionReason: reason,
        approvedBy: rejectedBy,
      },
    });
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
  async approveAndEnroll(applicantId: string, approvedBy: string) {
    const applicant = await this.getApplicantById(applicantId);

    if (applicant.status === ApplicantStatus.ENROLLED) {
      throw new BadRequestException(`Applicant ${applicant.applicationNo} has already been enrolled into the college.`);
    }

    // Resolve programme
    let prog = applicant.programme;
    if (!prog && applicant.programmeId) {
      prog = await this.prisma.programme.findUnique({ where: { id: applicant.programmeId } });
    }

    const deptCode = prog?.departmentCode || 'CSE';
    const deptName = prog?.name || 'Computer Science & Engineering';
    const academicYear = applicant.academicYear || '2026-27';

    // Generate unique institutional registration number & roll number
    const totalStudents = await this.prisma.student.count();
    const batchYear = academicYear.slice(2, 4); // "26"
    const rollSequence = String(totalStudents + 1).padStart(2, '0'); // e.g. "04"
    const uniqueRollNumber = `${batchYear}${deptCode}${String(totalStudents + 101).padStart(4, '0')}`; // e.g. "26CSE0104"
    const studentIdNumber = `STU-${batchYear}-${String(totalStudents + 1).padStart(4, '0')}`;

    // Cryptographic activation token
    const activationToken = crypto.randomBytes(24).toString('hex');
    const tempSalt = await bcrypt.genSalt(10);
    const tempPasswordHash = await bcrypt.hash(`Gift@${new Date().getFullYear()}`, tempSalt);

    // Atomic Prisma Transaction guarantees integrity
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create Student record
      const student = await tx.student.create({
        data: {
          studentId: studentIdNumber,
          rollNumber: uniqueRollNumber,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          gender: applicant.gender,
          dob: applicant.dob || '01-01-2005',
          category: applicant.category,
          department: deptName,
          deptCode: deptCode,
          semester: 'Semester 1',
          section: 'Section A',
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
          semester: 'Semester 1',
          section: 'Section A',
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
          detail: 'Semester 1 · Section A',
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
      const updatedApplicant = await tx.applicant.update({
        where: { id: applicant.id },
        data: {
          status: ApplicantStatus.ENROLLED,
          approvedBy,
          studentId: student.id,
          enrolledUserId: user.id,
        },
      });

      // 6. Record audit log
      await tx.auditLog.create({
        data: {
          user: approvedBy,
          role: 'ADMIN',
          targetStudent: student.name,
          subject: 'Admissions & Enrollment',
          reason: `Approved admission for applicant ${applicant.applicationNo} -> Created Student ID: ${student.rollNumber}`,
          changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
      });

      return { student, enrollment, user, updatedApplicant };
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
