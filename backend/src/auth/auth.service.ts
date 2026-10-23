import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const FALLBACK_USERS: Record<string, any> = {
  superadmin: {
    id: 'demo-superadmin',
    name: 'Er. Bikramaditya Patra',
    email: 'superadmin@gift.edu.in',
    role: 'super_admin',
    roleEnum: 'SUPER_ADMIN',
    identifier: 'superadmin',
    designation: 'Chief Enterprise Systems Architect',
    detail: 'Root System & Security Administrator',
    department: 'Office of Information Technology',
    phone: '+91 94370 00001',
    permissions: ['*'],
  },
  management: {
    id: 'demo-management',
    name: 'Shri Patitapaban Panda',
    email: 'management@gift.edu.in',
    role: 'management',
    roleEnum: 'MANAGEMENT',
    identifier: 'management',
    designation: 'Managing Trustee',
    detail: 'Institutional Governance & Oversight',
    department: 'Governing Body & Trust Board',
    phone: '+91 94370 00002',
    permissions: ['*'],
  },
  principal: {
    id: 'demo-principal',
    name: 'Dr. Sujit Kumar Khuntia',
    email: 'principal@gift.edu.in',
    role: 'principal',
    roleEnum: 'PRINCIPAL',
    identifier: 'principal',
    designation: 'Principal & Director',
    detail: 'Academic Council & Executive Head',
    department: 'Office of the Principal',
    phone: '+91 94370 00003',
    permissions: ['*'],
  },
  admin: {
    id: 'demo-admin',
    name: 'Sri Manoranjan Tripathy',
    email: 'admin@gift.edu.in',
    role: 'admin',
    roleEnum: 'ADMIN',
    identifier: 'admin',
    designation: 'Chief Administrative Officer',
    detail: 'Admissions, Records & Campus Services',
    department: 'Administrative Operations',
    phone: '+91 94370 00004',
    permissions: ['*'],
  },
  hod: {
    id: 'demo-hod',
    name: 'Dr. P. K. Pattnaik',
    email: 'hod@gift.edu.in',
    role: 'hod',
    roleEnum: 'HOD',
    identifier: 'hod',
    designation: 'Professor & Head of Department',
    detail: 'Department Administrator · CSE',
    department: 'Computer Science & Engineering',
    phone: '+91 94370 00005',
    permissions: ['academics', 'faculty_management'],
  },
  faculty: {
    id: 'demo-faculty',
    name: 'Dr. S. Mohanty',
    email: 'faculty@gift.edu.in',
    role: 'faculty',
    roleEnum: 'FACULTY',
    identifier: 'faculty',
    designation: 'Associate Professor',
    detail: 'Faculty · School of Computing',
    department: 'Computer Science & Engineering',
    phone: '+91 94370 00006',
    identity: 'FAC-042',
    permissions: ['attendance', 'grading'],
  },
  student: {
    id: 'demo-student',
    name: 'Rakesh Das',
    email: 'student@gift.edu.in',
    role: 'student',
    roleEnum: 'STUDENT',
    identifier: '2305201001',
    registrationNumber: '2305201001',
    identity: '2305201001',
    designation: 'Student',
    detail: 'B.Tech Semester 5 · Section A',
    department: 'Computer Science & Engineering',
    phone: '+91 98610 23010',
    permissions: ['view_grades', 'attend_classes'],
  },
  examcell: {
    id: 'demo-examcell',
    name: 'Prof. S. R. Mahapatra',
    email: 'examcell@gift.edu.in',
    role: 'exam_cell',
    roleEnum: 'EXAM_CELL',
    identifier: 'examcell',
    designation: 'Controller of Examinations',
    detail: 'Autonomous Examination Cell',
    department: 'Autonomous Examination Cell',
    phone: '+91 94370 00008',
    permissions: ['exam_management', 'question_paper_moderation'],
  },
  accounts: {
    id: 'demo-accounts',
    name: 'CA S. K. Agrawal',
    email: 'accounts@gift.edu.in',
    role: 'accounts',
    roleEnum: 'ACCOUNTS',
    identifier: 'accounts',
    designation: 'Chief Finance Officer',
    detail: 'Student Fee Ledgers & Payroll',
    department: 'Finance & Accounts Division',
    phone: '+91 94370 00009',
    permissions: ['fee_collection', 'payroll'],
  },
  library: {
    id: 'demo-library',
    name: 'Dr. B. K. Jena',
    email: 'library@gift.edu.in',
    role: 'library',
    roleEnum: 'LIBRARY',
    identifier: 'library',
    designation: 'Chief Librarian',
    detail: 'Central Autonomous Library',
    department: 'Learning Resource Centre',
    phone: '+91 94370 00010',
    permissions: ['book_circulation', 'cataloguing'],
  },
  placement: {
    id: 'demo-placement',
    name: 'Mr. Soumya Ranjan Das',
    email: 'placement@gift.edu.in',
    role: 'placement',
    roleEnum: 'PLACEMENT',
    identifier: 'placement',
    designation: 'Head - Corporate Relations',
    detail: 'Training & Placement Division',
    department: 'Industry Relations & Placements',
    phone: '+91 94370 00011',
    permissions: ['placement_drives', 'recruiter_liaison'],
  },
  transport: {
    id: 'demo-transport',
    name: 'Mr. Ramesh Behera',
    email: 'transport@gift.edu.in',
    role: 'transport',
    roleEnum: 'TRANSPORT',
    identifier: 'transport',
    designation: 'Transport Supervisor',
    detail: 'Fleet Operations & Campus Bus Routes',
    department: 'Logistics & Transport',
    phone: '+91 94370 00012',
    permissions: ['fleet_management', 'route_scheduling'],
  },
  warden: {
    id: 'demo-warden',
    name: 'Capt. (Retd) D. N. Rout',
    email: 'hostel@gift.edu.in',
    role: 'warden',
    roleEnum: 'HOSTEL_WARDEN',
    identifier: 'warden',
    designation: 'Chief Hostel Warden',
    detail: 'Gents & Ladies Hostels',
    department: 'Hostel Administration',
    phone: '+91 94370 00013',
    permissions: ['room_allocation', 'gatepass_approval'],
  },
  staff: {
    id: 'demo-staff',
    name: 'Mr. Ashok Kumar Jena',
    email: 'staff@gift.edu.in',
    role: 'staff',
    roleEnum: 'STAFF',
    identifier: 'staff',
    designation: 'Senior Technical Officer',
    detail: 'CSE Cloud & AI Advanced Labs',
    department: 'Computer Science & Engineering',
    phone: '+91 94370 00014',
    permissions: ['lab_equipment', 'maintenance'],
  },
  canteen: {
    id: 'demo-canteen',
    name: 'Mr. Rabindra Jena',
    email: 'canteen@gift.edu.in',
    role: 'canteen',
    roleEnum: 'CANTEEN',
    identifier: 'canteen',
    designation: 'Campus Catering Manager',
    detail: 'Food Court & Student Mess Operations',
    department: 'Food & Beverage Services',
    phone: '+91 94370 00015',
    permissions: ['mess_menu', 'meal_punching'],
  },
  admissions: {
    id: 'demo-admissions',
    name: 'Er. Sujata Mohapatra',
    email: 'admissions@gift.edu.in',
    role: 'admissions',
    roleEnum: 'ADMISSION',
    identifier: 'admissions',
    designation: 'Dean Admissions',
    detail: 'B.Tech & M.Tech Enrollment Cell',
    department: 'Admissions & Outreach Cell',
    phone: '+91 94370 00016',
    permissions: ['admission_approval', 'leads_management'],
  },
};

// Aliases mapping
FALLBACK_USERS['super_admin'] = FALLBACK_USERS['superadmin'];
FALLBACK_USERS['exam_cell'] = FALLBACK_USERS['examcell'];
FALLBACK_USERS['admission'] = FALLBACK_USERS['admissions'];
FALLBACK_USERS['2305201001'] = FALLBACK_USERS['student'];

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'apna-campus-secure-production-jwt-token-secret-2026';
  }

  async login(dto: LoginDto) {
    const rawKey = dto.identifier.trim().toLowerCase();
    const strippedKey = rawKey.replace(/[-_\s]/g, '');
    
    let user: any = null;
    try {
      // Find user by identifier or email (supports aliases like super_admin -> superadmin, exam_cell -> examcell)
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { identifier: { equals: rawKey, mode: 'insensitive' } },
            { identifier: { equals: strippedKey, mode: 'insensitive' } },
            { email: { equals: rawKey, mode: 'insensitive' } },
            { email: { equals: strippedKey, mode: 'insensitive' } },
          ],
        },
        include: {
          student: true,
          faculty: true,
          hod: true,
        },
      });
    } catch (dbError: any) {
      console.warn('Notice: Prisma database query failed (DATABASE_URL may not be configured in Render dashboard):', dbError?.message || dbError);
    }

    // Resilient fallback for demo and un-seeded/offline database environments
    if (!user) {
      const fallback = FALLBACK_USERS[rawKey] || FALLBACK_USERS[strippedKey];
      if (fallback && (dto.password === 'gift123' || dto.password === 'password123' || dto.password === 'admin123')) {
        const payload = {
          sub: fallback.id,
          email: fallback.email,
          role: fallback.roleEnum,
          identifier: fallback.identifier,
        };
        const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];
        const accessToken = jwt.sign(payload, this.getJwtSecret(), { expiresIn });

        return {
          success: true,
          accessToken,
          user: {
            ...fallback,
            lastLogin: new Date(),
          },
        };
      }
      throw new UnauthorizedException('We could not verify those sign-in details. Please check your College ID and password.');
    }

    // Support only the hashed password check
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('We could not verify those sign-in details. Invalid password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account is currently disabled. Please contact the administrator.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      identifier: user.identifier,
    };

    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];
    const accessToken = jwt.sign(payload, this.getJwtSecret(), { expiresIn });

    // Update lastLogin timestamp asynchronously
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch(() => {});

    // Format role and identifiers cleanly for frontend consumption
    const roleKey = user.role.toLowerCase();
    const regNo = user.student?.rollNumber || user.student?.studentId || (user.role === 'STUDENT' ? user.identifier : undefined);
    const facultyId = user.faculty?.employeeId || (user.role !== 'STUDENT' ? user.identifier.toUpperCase() : undefined);

    return {
      success: true,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 94370 12345',
        identifier: user.identifier,
        role: roleKey,
        roleEnum: user.role,
        designation: user.designation || user.detail || '',
        permissions: user.permissions || [],
        registrationNumber: regNo,
        identity: facultyId || regNo,
        department: user.department || user.student?.department || 'Computer Science & Engineering',
        detail: user.detail || (user.role === 'STUDENT' ? 'Semester 5 · Section A' : 'School of Computing'),
        lastLogin: new Date(),
      },
    };
  }

  async validateUserById(id: string) {
    if (id.startsWith('demo-')) {
      const demoKey = id.replace('demo-', '');
      const fallback = FALLBACK_USERS[demoKey];
      if (fallback) {
        return {
          id: fallback.id,
          name: fallback.name,
          email: fallback.email,
          identifier: fallback.identifier,
          role: fallback.role,
          roleEnum: fallback.roleEnum,
          registrationNumber: fallback.registrationNumber,
          identity: fallback.identity || fallback.registrationNumber,
          department: fallback.department,
          detail: fallback.detail,
        };
      }
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { student: true, faculty: true, hod: true },
      });

      if (!user) return null;

      const roleKey = user.role.toLowerCase();
      const regNo = user.student?.rollNumber || user.student?.studentId;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        identifier: user.identifier,
        role: roleKey,
        roleEnum: user.role,
        registrationNumber: regNo,
        identity: user.faculty?.employeeId || regNo,
        department: user.department || 'Computer Science & Engineering',
        detail: user.detail || '',
      };
    } catch (e) {
      return null;
    }
  }

  async checkActivationToken(token: string) {
    const cleanToken = token.trim();
    const user = await this.prisma.user.findFirst({
      where: { activationToken: cleanToken },
      include: { student: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired activation link.');
    }

    return {
      success: true,
      valid: true,
      name: user.name,
      email: user.email,
      identifier: user.identifier,
      studentId: user.student?.studentId,
      rollNumber: user.student?.rollNumber,
    };
  }

  async activateAccount(token: string, newPassword: string) {
    const cleanToken = token.trim();
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    const user = await this.prisma.user.findFirst({
      where: { activationToken: cleanToken },
      include: { student: true },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired activation token.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isActivated: true,
        activationToken: null,
      },
      include: { student: true, faculty: true, hod: true },
    });

    // Generate immediate JWT token so student is logged in directly upon activation
    const payload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      identifier: updatedUser.identifier,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];
    const accessToken = jwt.sign(payload, secret, { expiresIn });

    const roleKey = updatedUser.role.toLowerCase();
    const regNo = updatedUser.student?.rollNumber || updatedUser.student?.studentId;

    return {
      success: true,
      message: 'Account activated successfully! Welcome to Apna Campus.',
      accessToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '+91 94370 12345',
        identifier: updatedUser.identifier,
        role: roleKey,
        roleEnum: updatedUser.role,
        registrationNumber: regNo,
        department: updatedUser.department || updatedUser.student?.department || 'Computer Science & Engineering',
        detail: updatedUser.detail || 'Semester 1 · Section A',
      },
    };
  }

  async forgotPassword(emailOrIdentifier: string) {
    const rawKey = emailOrIdentifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { identifier: { equals: rawKey, mode: 'insensitive' } },
          { email: { equals: rawKey, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      // Return benign message to prevent account enumeration
      return {
        success: true,
        message: 'If an account exists with those details, a reset token has been issued.',
      };
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(24).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, tokenExpiresAt },
    });

    return {
      success: true,
      message: 'Password reset link and security token generated.',
      resetToken, // Included for easy offline/demo evaluation
      expiresAt: tokenExpiresAt,
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: resetToken.trim(),
        tokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        tokenExpiresAt: null,
      },
    });

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
