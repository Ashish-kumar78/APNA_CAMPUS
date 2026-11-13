import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicantStatus, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const FALLBACK_ADMISSION_PROGRAMMES = [
  {
    id: 'prog-btech-cse',
    code: 'BTECH-CSE',
    name: 'Bachelor of Technology in Computer Science & Engineering',
    degreeType: 'UG',
    departmentCode: 'CSE',
    durationYears: 4,
    totalSemesters: 8,
    status: 'Active'
  },
  {
    id: 'prog-btech-aiml',
    code: 'BTECH-AIML',
    name: 'Bachelor of Technology in Artificial Intelligence & Machine Learning',
    degreeType: 'UG',
    departmentCode: 'CSE',
    durationYears: 4,
    totalSemesters: 8,
    status: 'Active'
  },
  {
    id: 'prog-btech-ece',
    code: 'BTECH-ECE',
    name: 'Bachelor of Technology in Electronics & Communication Engineering',
    degreeType: 'UG',
    departmentCode: 'ECE',
    durationYears: 4,
    totalSemesters: 8,
    status: 'Active'
  },
  {
    id: 'prog-btech-ee',
    code: 'BTECH-EE',
    name: 'Bachelor of Technology in Electrical Engineering',
    degreeType: 'UG',
    departmentCode: 'EE',
    durationYears: 4,
    totalSemesters: 8,
    status: 'Active'
  },
  {
    id: 'prog-btech-mech',
    code: 'BTECH-MECH',
    name: 'Bachelor of Technology in Mechanical Engineering',
    degreeType: 'UG',
    departmentCode: 'ME',
    durationYears: 4,
    totalSemesters: 8,
    status: 'Active'
  },
  {
    id: 'prog-mtech-cse',
    code: 'MTECH-CSE',
    name: 'Master of Technology in Computer Science & Engineering',
    degreeType: 'PG',
    departmentCode: 'CSE',
    durationYears: 2,
    totalSemesters: 4,
    status: 'Active'
  },
  {
    id: 'prog-mca',
    code: 'MCA',
    name: 'Master of Computer Applications',
    degreeType: 'PG',
    departmentCode: 'CA',
    durationYears: 2,
    totalSemesters: 4,
    status: 'Active'
  },
  {
    id: 'prog-bca',
    code: 'BCA',
    name: 'Bachelor of Computer Applications',
    degreeType: 'UG',
    departmentCode: 'CA',
    durationYears: 3,
    totalSemesters: 6,
    status: 'Active'
  },
  {
    id: 'prog-mba',
    code: 'MBA',
    name: 'Master of Business Administration',
    degreeType: 'PG',
    departmentCode: 'MGMT',
    durationYears: 2,
    totalSemesters: 4,
    status: 'Active'
  }
];

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);

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
    programmeName?: string;
    academicYear?: string;
    tenthMarks?: number;
    twelfthMarks?: number;
    entranceExam?: string;
    entranceRank?: number;
    documents?: any[];
    directEnroll?: boolean;
    initialPassword?: string;
  }) {
    if (
      !data ||
      typeof data.name !== 'string' ||
      typeof data.email !== 'string' ||
      typeof data.phone !== 'string'
    ) {
      throw new BadRequestException('Applicant name, email, and phone are required.');
    }
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Enter a valid applicant name and email address.');
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^[+()\d.\-\s]{8,20}$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15) {
      throw new BadRequestException('Enter a valid applicant phone number.');
    }
    for (const [label, value] of [
      ['10th marks', data.tenthMarks],
      ['12th marks', data.twelfthMarks],
    ] as const) {
      if (value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
        throw new BadRequestException(`${label} must be a percentage between 0 and 100.`);
      }
    }
    if (data.entranceRank !== undefined && (!Number.isInteger(Number(data.entranceRank)) || Number(data.entranceRank) < 1)) {
      throw new BadRequestException('Entrance rank must be a positive whole number.');
    }
    if (!data.programmeId) {
      throw new BadRequestException('Select a programme from the active academic programmes.');
    }
    const academicYear = data.academicYear?.trim() || '2026-27';
    if (!/^\d{4}-(?:\d{2}|\d{4})$/.test(academicYear)) {
      throw new BadRequestException('Academic year must use YYYY-YY or YYYY-YYYY format.');
    }
    if (data.documents !== undefined && !Array.isArray(data.documents)) {
      throw new BadRequestException('Applicant documents must be provided as a list.');
    }

    const programme = await this.prisma.programme.findFirst({
      where: { id: data.programmeId, status: 'Active' },
    });
    if (!programme) {
      throw new BadRequestException('The selected programme is not available for admission.');
    }

    const year = new Date().getFullYear();
    const documentsPayload = {
      list: Array.isArray(data.documents) ? data.documents : [],
      personalDetails: (data as any).personalDetails || null,
      parentDetails: (data as any).parentDetails || null,
      academicDetails: (data as any).academicDetails || null,
    };

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.applicant.findFirst({ where: { email, academicYear } });
        if (existing) {
          throw new ConflictException(`An application for ${academicYear} with email ${email} already exists (${existing.applicationNo}).`);
        }

        const applicationNo = await this.generateNextApplicationNo(tx, year);
        return tx.applicant.create({
          data: {
            applicationNo,
            name,
            email,
            phone,
            gender: data.gender || 'Not Specified',
            dob: data.dob,
            category: data.category || 'General',
            programmeId: programme.id,
            programmeName: programme.name,
            academicYear,
            tenthMarks: data.tenthMarks === undefined ? null : Number(data.tenthMarks),
            twelfthMarks: data.twelfthMarks === undefined ? null : Number(data.twelfthMarks),
            entranceExam: data.entranceExam || 'Direct Merit',
            entranceRank: data.entranceRank === undefined ? null : Number(data.entranceRank),
            documents: documentsPayload,
            status: data.directEnroll ? ApplicantStatus.VERIFIED : ApplicantStatus.APPLIED,
          },
          include: { programme: true },
        });
      }, { maxWait: 15000, timeout: 30000 });

      if (data.directEnroll && created) {
        const enrollment = await this.approveAndEnroll(
          created.id,
          'Admission Cell Desk',
          data.initialPassword || 'Student@2026',
        );
        return {
          ...created,
          enrollment: enrollment.data,
        };
      }

      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException('Another admission request was processed concurrently. Please retry.');
      }
      throw error;
    }
  }

  private async generateNextApplicationNo(tx: Prisma.TransactionClient, year: number | string): Promise<string> {
    const key = `APPLICATION-${year}`;
    const latest = await tx.applicant.findFirst({
      where: { applicationNo: { startsWith: `APP-${year}-` } },
      orderBy: { applicationNo: 'desc' },
      select: { applicationNo: true },
    });

    let maxNum = 0;
    if (latest?.applicationNo) {
      const match = latest.applicationNo.match(/(\d+)$/);
      if (match) {
        maxNum = parseInt(match[1], 10);
      }
    }

    const currentSeq = await tx.admissionSequence.findUnique({ where: { key } });
    let nextNum = Math.max((currentSeq?.value || 0) + 1, maxNum + 1);

    let applicationNo = `APP-${year}-${String(nextNum).padStart(4, '0')}`;
    while (await tx.applicant.findUnique({ where: { applicationNo } })) {
      nextNum++;
      applicationNo = `APP-${year}-${String(nextNum).padStart(4, '0')}`;
    }

    await tx.admissionSequence.upsert({
      where: { key },
      create: { key, value: nextNum },
      update: { value: nextNum },
    });

    return applicationNo;
  }

  private async generateNextStudentId(
    tx: Prisma.TransactionClient,
    batchYear: string,
    deptCode: string,
  ): Promise<{ studentIdNumber: string; uniqueRollNumber: string }> {
    const key = `STUDENT-${batchYear}`;
    const latest = await tx.student.findFirst({
      where: { studentId: { startsWith: `AC-${batchYear}-` } },
      orderBy: { studentId: 'desc' },
      select: { studentId: true },
    });

    let maxNum = 0;
    if (latest?.studentId) {
      const match = latest.studentId.match(/(\d+)$/);
      if (match) {
        maxNum = parseInt(match[1], 10);
      }
    }

    const currentSeq = await tx.admissionSequence.findUnique({ where: { key } });
    let nextNum = Math.max((currentSeq?.value || 0) + 1, maxNum + 1);

    let studentIdNumber = `AC-${batchYear}-${String(nextNum).padStart(4, '0')}`;
    let uniqueRollNumber = `${batchYear.slice(-2)}${deptCode}${String(nextNum).padStart(4, '0')}`;

    while (
      (await tx.student.findUnique({ where: { studentId: studentIdNumber } })) ||
      (await tx.student.findUnique({ where: { rollNumber: uniqueRollNumber } }))
    ) {
      nextNum++;
      studentIdNumber = `AC-${batchYear}-${String(nextNum).padStart(4, '0')}`;
      uniqueRollNumber = `${batchYear.slice(-2)}${deptCode}${String(nextNum).padStart(4, '0')}`;
    }

    await tx.admissionSequence.upsert({
      where: { key },
      create: { key, value: nextNum },
      update: { value: nextNum },
    });

    return { studentIdNumber, uniqueRollNumber };
  }

  private async generateStudentEmail(
    tx: Prisma.TransactionClient,
    applicantName: string,
    emailDomain: string,
    fallbackId: string,
  ): Promise<string> {
    const parts = (applicantName || '')
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((p) => p.replace(/[^a-z0-9]/g, ''))
      .filter(Boolean);

    const firstName = parts[0] || 'student';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

    // 1. First priority: simple first name e.g. rahul@apnacampus.edu.in
    const baseCandidate = `${firstName}@${emailDomain}`;
    const takenStudent1 = await tx.student.findUnique({ where: { email: baseCandidate } });
    const takenUser1 = await tx.user.findUnique({ where: { email: baseCandidate } });
    if (!takenStudent1 && !takenUser1) {
      return baseCandidate;
    }

    // 2. Second priority: first.last e.g. rahul.sahoo@apnacampus.edu.in
    if (lastName) {
      const nameCandidate = `${firstName}.${lastName}@${emailDomain}`;
      const takenStudent2 = await tx.student.findUnique({ where: { email: nameCandidate } });
      const takenUser2 = await tx.user.findUnique({ where: { email: nameCandidate } });
      if (!takenStudent2 && !takenUser2) {
        return nameCandidate;
      }
    }

    // 3. Third priority: numbered variants e.g. rahul1@apnacampus.edu.in, rahul2@...
    let counter = 1;
    while (counter <= 50) {
      const numCandidate = `${firstName}${counter}@${emailDomain}`;
      const takenS = await tx.student.findUnique({ where: { email: numCandidate } });
      const takenU = await tx.user.findUnique({ where: { email: numCandidate } });
      if (!takenS && !takenU) {
        return numCandidate;
      }
      counter++;
    }

    // Fallback: e.g. ac-2026-0001@apnacampus.edu.in
    return `${fallbackId.toLowerCase()}@${emailDomain}`;
  }

  private async nextSequence(tx: Prisma.TransactionClient, key: string) {
    const sequence = await tx.admissionSequence.upsert({
      where: { key },
      create: { key, value: 1 },
      update: { value: { increment: 1 } },
    });
    return sequence.value;
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
    const rejectionReason = typeof reason === 'string' ? reason.trim() : '';
    if (!rejectionReason) {
      throw new BadRequestException('A rejection reason is required.');
    }

    const applicant = await this.getApplicantById(id);
    if (applicant.status === ApplicantStatus.ENROLLED) {
      throw new BadRequestException('Cannot reject an applicant who is already enrolled.');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status: ApplicantStatus.REJECTED,
        rejectionReason,
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
  async approveAndEnroll(applicantId: string, approvedBy: string, passwordInput?: string) {
    const initialPassword = passwordInput && typeof passwordInput === 'string' && passwordInput.trim().length >= 6
      ? passwordInput.trim()
      : 'Student@2026';
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const emailDomain = (process.env.STUDENT_EMAIL_DOMAIN || 'apnacampus.edu.in')
      .trim()
      .replace(/^@/, '')
      .toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(emailDomain)) {
      throw new BadRequestException('STUDENT_EMAIL_DOMAIN must be a valid email domain.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const applicant = await tx.applicant.findUnique({
        where: { id: applicantId },
        include: { programme: true },
      });
      if (!applicant) {
        throw new NotFoundException(`Applicant with ID ${applicantId} not found.`);
      }
      if (applicant.status === ApplicantStatus.ENROLLED) {
        throw new ConflictException(`Applicant ${applicant.applicationNo} has already been enrolled into the college.`);
      }

      const prog = applicant.programme;
      const deptCode = (prog?.departmentCode || 'CSE').replace(/[^a-z0-9]/gi, '').toUpperCase();
      const deptName = prog?.name || applicant.programmeName || 'Computer Science & Engineering';
      const academicYear = applicant.academicYear || '2026-27';
      const batchYear = academicYear.match(/\d{4}/)?.[0] || '2026';
      const durationYears = prog?.durationYears || 4;
      const admissionBatch = `${batchYear}-${Number(batchYear) + durationYears}`;

      const rawDocObj: any = applicant.documents || {};
      const personal = rawDocObj.personalDetails || {};
      const parent = rawDocObj.parentDetails || {};

      // Check if student already exists for this applicant or by identifier/email/phone to prevent duplicates
      let student = applicant.studentId
        ? await tx.student.findUnique({ where: { id: applicant.studentId } })
        : null;

      if (!student && (applicant.email || applicant.phone)) {
        student = await tx.student.findFirst({
          where: {
            OR: [
              ...(applicant.email ? [{ email: applicant.email }, { personalEmail: applicant.email }] : []),
              ...(applicant.phone ? [{ phone: applicant.phone }] : []),
            ],
          },
        });
      }

      let studentIdNumber = student?.studentId;
      let uniqueRollNumber = student?.rollNumber;
      let officialEmail = student?.email;

      if (!student) {
        const nextIds = await this.generateNextStudentId(tx, batchYear, deptCode);
        studentIdNumber = nextIds.studentIdNumber;
        uniqueRollNumber = nextIds.uniqueRollNumber;
        officialEmail = await this.generateStudentEmail(tx, applicant.name, emailDomain, studentIdNumber);

        // 1. Create authoritative Student record with Pending Section Allocation status
        student = await tx.student.create({
          data: {
            studentId: studentIdNumber,
            rollNumber: uniqueRollNumber,
            name: applicant.name,
            email: officialEmail,
            personalEmail: applicant.email,
            phone: applicant.phone,
            gender: applicant.gender || personal.gender || 'Male',
            dob: applicant.dob || personal.dob || '2005-08-15',
            bloodGroup: personal.bloodGroup || 'O+',
            category: applicant.category || personal.category || 'General',
            religion: personal.religion || 'Hindu',
            department: deptName,
            deptCode,
            semester: 'Semester 1',
            section: 'Pending Section Allocation',
            academicYear: academicYear,
            status: 'Pending Section Allocation',
            cgpa: 0.0,
            attendance: 100,
            walletBalance: 500.0,
            programmeId: prog?.id || null,
          },
        });
      } else {
        // Activate and update existing student
        student = await tx.student.update({
          where: { id: student.id },
          data: {
            name: applicant.name,
            phone: applicant.phone || student.phone,
            department: deptName,
            deptCode,
            programmeId: prog?.id || student.programmeId,
            academicYear,
            status: student.status === 'Active' ? 'Active' : 'Pending Section Allocation',
            section: student.section && student.section !== 'Section A' ? student.section : 'Pending Section Allocation',
          },
        });
      }

      // 1b. Create Guardians if present in application
      if (parent.fatherName) {
        await tx.guardian.create({
          data: {
            studentId: student.id,
            name: parent.fatherName,
            relationship: 'Father',
            contactNumber: parent.fatherMobile || applicant.phone,
            email: parent.fatherEmail || null,
          },
        }).catch(() => {});
      }
      if (parent.motherName) {
        await tx.guardian.create({
          data: {
            studentId: student.id,
            name: parent.motherName,
            relationship: 'Mother',
            contactNumber: parent.motherMobile || null,
            email: parent.motherEmail || null,
          },
        }).catch(() => {});
      }
      if (parent.guardianName && !parent.fatherName && !parent.motherName) {
        await tx.guardian.create({
          data: {
            studentId: student.id,
            name: parent.guardianName,
            relationship: parent.guardianRelation || 'Guardian',
            contactNumber: parent.guardianContact || null,
            email: parent.guardianEmail || null,
          },
        }).catch(() => {});
      }

      // 1c. Create Permanent Address if provided
      if (personal.permanentAddress?.address || personal.permanentAddress?.city) {
        await tx.address.create({
          data: {
            studentId: student.id,
            type: 'Permanent',
            addressLine: personal.permanentAddress.address || personal.permanentAddress.city || 'Campus Quarters',
            city: personal.permanentAddress.city || 'Bhubaneswar',
            state: personal.permanentAddress.state || 'Odisha',
            pincode: personal.permanentAddress.pin || '752054',
            country: personal.permanentAddress.country || 'India',
          },
        }).catch(() => {});
      }

      // 1d. Save Applicant Uploaded Qualification & Verification Documents (including Passport Photo)
      const docList = Array.isArray(rawDocObj)
        ? rawDocObj
        : Array.isArray(rawDocObj.list)
        ? rawDocObj.list
        : [];

      let passportPhotoUrl: string | null = null;
      for (const d of docList) {
        const fileUrl = d?.dataUrl || d?.fileUrl;
        if (d && fileUrl) {
          const category = d.id || 'general';
          if (
            category === 'photo' ||
            category === 'passport' ||
            /photo|passport/i.test(d.name || d.fileName || '')
          ) {
            passportPhotoUrl = fileUrl;
          }
          await tx.document.create({
            data: {
              studentId: student.id,
              category,
              fileName: d.fileName || d.name || 'document',
              fileUrl,
              status: 'Verified',
              verifiedByAdmin: true,
            },
          }).catch(() => {});
        }
      }

      // 2. Create or update authoritative StudentEnrollment record
      let enrollment = await tx.studentEnrollment.findFirst({
        where: {
          studentId: student.id,
          semester: 'Semester 1',
          academicYear,
        },
      });

      if (!enrollment) {
        enrollment = await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            programmeId: prog?.id || null,
            academicYear: academicYear,
            semester: 'Semester 1',
            section: student.section || 'Pending Section Allocation',
            status: 'Pending Section Allocation',
            attendanceRate: 100.0,
          },
        });
      } else {
        enrollment = await tx.studentEnrollment.update({
          where: { id: enrollment.id },
          data: {
            programmeId: prog?.id || enrollment.programmeId,
            status: 'Pending Section Allocation',
          },
        });
      }

      // 3. Create or synchronize User account with role STUDENT
      let user = student.userId ? await tx.user.findUnique({ where: { id: student.userId } }) : null;
      if (!user) {
        user = await tx.user.findFirst({
          where: {
            OR: [
              { identifier: student.studentId },
              { email: officialEmail },
              ...(applicant.email ? [{ email: applicant.email }] : []),
            ],
          },
        });
      }

      if (!user) {
        const resolvedOfficialEmail = officialEmail || student.email || `${student.studentId.toLowerCase()}@${emailDomain}`;
        user = await tx.user.create({
          data: {
            identifier: student.studentId,
            email: resolvedOfficialEmail,
            name: applicant.name,
            phone: applicant.phone,
            passwordHash: passwordHash,
            role: Role.STUDENT,
            department: deptName,
            detail: `Semester 1 · ${student.section}`,
            isActive: true,
            isActivated: true,
            activationToken: activationToken,
            tokenExpiresAt: activationExpiresAt,
            permissions: ['student.portal', 'academics.view', 'attendance.view', 'marks.view', 'complaints.submit'],
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            role: Role.STUDENT,
            detail: `Semester 1 · ${student.section}`,
            isActive: true,
          },
        });
      }

      // 4. Link Student to User
      if (student.userId !== user.id) {
        student = await tx.student.update({
          where: { id: student.id },
          data: { userId: user.id },
        });
      }

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
          reason: `Approved admission for applicant ${applicant.applicationNo} -> Created/Activated Student ID: ${student.studentId} (${student.department}) - Status: ${student.status}`,
          changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
      });

      return { student, enrollment, user, updatedApplicant, passportPhotoUrl, admissionBatch };
    }, { maxWait: 15000, timeout: 30000 }).catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException('Another admission action was processed concurrently. Refresh the application and retry.');
      }
      throw error;
    });

    return {
      success: true,
      message: `Applicant ${result.updatedApplicant.name} successfully admitted & enrolled!`,
      data: {
        applicationNo: result.updatedApplicant.applicationNo,
        studentId: result.student.studentId,
        rollNumber: result.student.rollNumber,
        name: result.student.name,
        email: result.student.email,
        personalEmail: result.student.personalEmail,
        department: result.student.department,
        semester: result.student.semester,
        section: result.student.section,
        academicYear: result.student.academicYear,
        academicStatus: result.student.status,
        admissionBatch: result.admissionBatch,
        loginId: result.student.studentId,
        initialPassword: initialPassword,
        activationToken,
        status: 'ENROLLED',
        photo: result.passportPhotoUrl,
        photoUrl: result.passportPhotoUrl,
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

  async trackApplicant(applicationNo: string) {
    const cleanNo = applicationNo?.trim();
    if (!cleanNo) {
      throw new BadRequestException('Application number is required.');
    }
    const applicant = await this.prisma.applicant.findUnique({
      where: { applicationNo: cleanNo },
      include: {
        programme: true,
      },
    });
    if (!applicant) {
      throw new NotFoundException(`No application found with number "${cleanNo}".`);
    }

    let studentRecord: any = null;
    if (applicant.studentId) {
      studentRecord = await this.prisma.student.findUnique({
        where: { id: applicant.studentId },
        select: {
          id: true,
          studentId: true,
          rollNumber: true,
          email: true,
          department: true,
          semester: true,
          section: true,
        },
      });
    }

    return {
      applicant,
      student: studentRecord,
    };
  }

  async getPublicProgrammes() {
    try {
      const rows = await this.prisma.programme.findMany({
        where: { status: 'Active' },
        orderBy: { code: 'asc' },
      });
      if (rows && rows.length > 0) return rows;
      return FALLBACK_ADMISSION_PROGRAMMES;
    } catch (err: any) {
      this.logger.warn(`Database connection dropped during getPublicProgrammes (${err?.message}). Retrying once...`);
      try {
        await new Promise((r) => setTimeout(r, 600));
        const retryRows = await this.prisma.programme.findMany({
          where: { status: 'Active' },
          orderBy: { code: 'asc' },
        });
        if (retryRows && retryRows.length > 0) return retryRows;
      } catch (retryErr: any) {
        this.logger.warn(`Retry failed, returning resilient fallback admission programmes: ${retryErr?.message}`);
      }
      return FALLBACK_ADMISSION_PROGRAMMES;
    }
  }

  async updateApplicant(id: string, data: any, updatedBy?: string) {
    const existing = await this.prisma.applicant.findUnique({
      where: { id },
      include: { programme: true },
    });
    if (!existing) {
      throw new NotFoundException(`Applicant with ID "${id}" not found.`);
    }

    const applicantUpdates: any = {};
    if (data.name !== undefined) applicantUpdates.name = String(data.name).trim();
    if (data.email !== undefined) applicantUpdates.email = String(data.email).trim();
    if (data.phone !== undefined) applicantUpdates.phone = String(data.phone).trim();
    if (data.gender !== undefined) applicantUpdates.gender = data.gender;
    if (data.dob !== undefined) applicantUpdates.dob = data.dob;
    if (data.category !== undefined) applicantUpdates.category = data.category;
    if (data.tenthMarks !== undefined) applicantUpdates.tenthMarks = data.tenthMarks === '' ? null : Number(data.tenthMarks);
    if (data.twelfthMarks !== undefined) applicantUpdates.twelfthMarks = data.twelfthMarks === '' ? null : Number(data.twelfthMarks);
    if (data.entranceExam !== undefined) applicantUpdates.entranceExam = data.entranceExam ? String(data.entranceExam).trim() : null;
    if (data.entranceRank !== undefined) applicantUpdates.entranceRank = data.entranceRank === '' ? null : Number(data.entranceRank);
    if (data.documents !== undefined) applicantUpdates.documents = data.documents;

    const updatedApplicant = await this.prisma.applicant.update({
      where: { id },
      data: applicantUpdates,
      include: { programme: true },
    });

    // If the applicant is already enrolled, synchronize changes to Student & User records
    if (existing.studentId || existing.enrolledUserId || existing.status === ApplicantStatus.ENROLLED) {
      try {
        const student = await this.prisma.student.findFirst({
          where: {
            OR: [
              ...(existing.studentId ? [{ id: existing.studentId }] : []),
              { email: existing.email },
              { personalEmail: existing.email },
            ],
          },
        });

        if (student) {
          const studentUpdates: any = {};
          if (data.name) studentUpdates.name = String(data.name).trim();
          if (data.phone) studentUpdates.phone = String(data.phone).trim();
          if (data.dob) studentUpdates.dob = data.dob;
          if (data.gender) studentUpdates.gender = data.gender;
          if (data.category) studentUpdates.category = data.category;
          if (data.bloodGroup) studentUpdates.bloodGroup = data.bloodGroup;
          if (data.section) studentUpdates.section = data.section;
          if (data.rollNumber) studentUpdates.rollNumber = data.rollNumber;

          if (Object.keys(studentUpdates).length > 0) {
            await this.prisma.student.update({
              where: { id: student.id },
              data: studentUpdates,
            });
          }

          if (student.userId) {
            const userUpdates: any = {};
            if (data.name) userUpdates.name = String(data.name).trim();
            if (data.phone) userUpdates.phone = String(data.phone).trim();
            if (Object.keys(userUpdates).length > 0) {
              await this.prisma.user.update({
                where: { id: student.userId },
                data: userUpdates,
              });
            }
          }
        }
      } catch (syncError: any) {
        console.warn(`Could not sync applicant updates to enrolled student/user: ${syncError.message}`);
      }
    }

    return updatedApplicant;
  }
}
