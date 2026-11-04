import * as fs from 'fs';
import * as path from 'path';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { DEMO_USERS } from './demo-users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) { }

  async login(dto: LoginDto) {
    if (!dto || !dto.identifier || typeof dto.identifier !== 'string' || !dto.identifier.trim()) {
      throw new BadRequestException('Identifier is required.');
    }
    if (!dto.password || typeof dto.password !== 'string') {
      throw new BadRequestException('Password is required.');
    }
    const rawKey = dto.identifier.trim().toLowerCase();
// Fast indexed query: check exact matches first, fall back to case-insensitive match
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { identifier: dto.identifier.trim() },
          { email: rawKey },
          { identifier: { equals: rawKey, mode: 'insensitive' } },
          { email: { equals: rawKey, mode: 'insensitive' } },
        ],
      },
    });

    // Check if user entered student roll number or student ID
    if (!user) {
      const studentMatch = await this.prisma.student.findFirst({
        where: {
          OR: [
            { rollNumber: { equals: dto.identifier.trim(), mode: 'insensitive' } },
            { studentId: { equals: dto.identifier.trim(), mode: 'insensitive' } },
            { email: { equals: rawKey, mode: 'insensitive' } },
            { personalEmail: { equals: rawKey, mode: 'insensitive' } },
          ],
        },
      });
      if (studentMatch && studentMatch.userId) {
        user = await this.prisma.user.findUnique({
          where: { id: studentMatch.userId },
        });
      }
    }

    // Check alias mapping if identifier is a generic role name
    if (!user) {
      const roleAliases: Record<string, string> = {
        placement: 'TPO-001',
        faculty: 'FAC-042',
        hod: 'HOD-CSE',
        admin: 'ADM-001',
        principal: 'DIR-001',
        director: 'DIR-001',
        management: 'MGMT-001',
        accounts: 'ACC-012',
        library: 'LIB-001',
        transport: 'TRN-001',
        hostel: 'HSTL-001',
        warden: 'HSTL-001',
        canteen: 'CANT-001',
        admissions: 'ADM-OFF-01',
        admission: 'ADM-OFF-01',
        scholarship: 'SCH-001',
        examcell: 'EXAM-001',
        student: '2401432255',
      };
      const mappedId = roleAliases[rawKey];
      if (mappedId) {
        user = await this.prisma.user.findFirst({
          where: { identifier: mappedId },
        });
      }
    }

    if (!user) {
      throw new UnauthorizedException(
        'We could not verify those sign-in details. Please check your College ID and password.',
      );
    }

    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException(
        'We could not verify those sign-in details. Invalid password.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is currently disabled. Please contact the administrator.',
      );
    }

    if (!user.isActivated && user.role !== 'STUDENT') {
      throw new UnauthorizedException(
        'Activate your account before signing in.',
      );
    }

    // Preserve the existing Apna Campus application JWT.
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      identifier: user.identifier,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is missing from backend environment configuration.');
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

    const accessToken = jwt.sign(payload, secret, { expiresIn });

    // Update the last login timestamp asynchronously (non-blocking for instant response).
    this.prisma.user
      .update({
        where: { id: user.id },
        data: { lastLogin: new Date(), isActivated: true },
      })
      .catch(() => {});

    // Preserve the profile structure expected by the frontend.
    const roleKey = user.role.toLowerCase();

    let studentRecord: any = null;
    if (user.role === 'STUDENT') {
      studentRecord = await this.prisma.student.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { studentId: user.identifier },
            { rollNumber: user.identifier },
          ],
        },
        include: {
          programme: true,
          guardians: true,
          addresses: true,
          documents: true,
        },
      });
    }

    const photoDoc = studentRecord?.documents?.find((d: any) =>
      d.category === 'photo' || /photo|passport/i.test(d.fileName || d.category || '')
    );
    const studentPhoto = photoDoc?.fileUrl || null;

    const regNo = user.role === 'STUDENT'
      ? (studentRecord?.rollNumber || studentRecord?.studentId || user.identifier)
      : undefined;
    const facultyId = user.role !== 'STUDENT' ? user.identifier.toUpperCase() : undefined;

    return {
      success: true,

      // Existing backend token for protected Apna Campus APIs.
      accessToken,

      user: {
        id: user.id,
        name: studentRecord?.name || user.name,
        email: studentRecord?.email || user.email,
        personalEmail: studentRecord?.personalEmail,
        phone: studentRecord?.phone || user.phone || '+91 94370 12345',
        identifier: studentRecord?.studentId || user.identifier,
        studentId: studentRecord?.studentId || user.identifier,
        rollNumber: studentRecord?.rollNumber || user.identifier,
        registrationNumber: regNo,
        identity: facultyId || regNo,
        photo: studentPhoto,
        photoUrl: studentPhoto,
        avatar: studentPhoto,
        role: roleKey,
        roleEnum: user.role,
        designation: user.designation || user.detail || '',
        permissions: user.permissions || [],
        department: studentRecord?.department || user.department || 'Computer Science & Engineering',
        program: studentRecord?.programme?.name || studentRecord?.department || 'B.Tech',
        course: studentRecord?.programme?.name || 'Bachelor of Technology',
        branch: studentRecord?.department || user.department,
        semester: studentRecord?.semester || 'Semester 1',
        section: studentRecord?.section || 'Section A',
        batch: studentRecord?.academicYear || '2026-27',
        academicYear: studentRecord?.academicYear || '2026-27',
        gender: studentRecord?.gender || 'Not Specified',
        dob: studentRecord?.dob,
        category: studentRecord?.category || 'General',
        guardians: studentRecord?.guardians || [],
        addresses: studentRecord?.addresses || [],
        detail: studentRecord
          ? `${studentRecord.semester} · ${studentRecord.section}`
          : (user.detail || (user.role === 'STUDENT' ? 'Semester 1 · Section A' : 'School of Computing')),
        lastLogin: new Date(),
      },
    };

  }

  async validateUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { student: true, faculty: true, hod: true },
      });

      if (user) {
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
      }
    } catch { }

    const demo = Object.values(DEMO_USERS).find((u) => u.id === id);
    if (demo) {
      return {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        identifier: demo.identifier,
        role: demo.role.toLowerCase(),
        roleEnum: demo.role,
        registrationNumber: demo.registrationNumber,
        identity: demo.identifier,
        department: demo.department,
        detail: demo.detail,
      };
    }

    return null;
  }

  async checkActivationToken(token: string) {
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new BadRequestException('Activation token is required.');
    }
    const cleanToken = token.trim();
const user = await this.prisma.user.findFirst({
      where: {
        activationToken: cleanToken,
        isActivated: false,
        tokenExpiresAt: { gt: new Date() },
      },
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
      expiresAt: user.tokenExpiresAt,
    };
  }

  async activateAccount(token: string, newPassword: string) {
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new BadRequestException('Activation token is required.');
    }

if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }

    const cleanToken = token.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        activationToken: cleanToken,
        isActivated: false,
        tokenExpiresAt: { gt: new Date() },
      },
    });


    if (!user) {
      throw new BadRequestException('Invalid or expired activation token.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const activation = await tx.user.updateMany({
        where: {
          id: user.id,
          activationToken: cleanToken,
          isActivated: false,
          tokenExpiresAt: { gt: new Date() },
        },
        data: {
          passwordHash,
          isActivated: true,
          activationToken: null,
          tokenExpiresAt: null,
        },
      });
      if (activation.count !== 1) {
        throw new BadRequestException('Invalid, expired, or already-used activation token.');
      }

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { student: true, faculty: true, hod: true },
      });
    });

    const payload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      identifier: updatedUser.identifier,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is missing from backend environment configuration.');
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];
    const accessToken = jwt.sign(payload, secret, { expiresIn });

    const roleKey = updatedUser.role.toLowerCase();
    const regNo =
      updatedUser.student?.rollNumber ||
      updatedUser.student?.studentId;

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
        department:
          updatedUser.department ||
          updatedUser.student?.department ||
          'Computer Science & Engineering',
        detail: updatedUser.detail || 'Semester 1 · Section A',
      },
    };
  }

  async forgotPassword(emailOrIdentifier: string) {
    if (!emailOrIdentifier || typeof emailOrIdentifier !== 'string' || !emailOrIdentifier.trim()) {
      throw new BadRequestException('Email or registration identifier is required.');
    }
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
      return {
        success: true,
        message:
          'If an account exists with those details, a reset token has been issued.',
      };
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(24).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 3600000);

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken, tokenExpiresAt },
      });
    } catch { }

    const isProduction = process.env.NODE_ENV === 'production';

    return {
      success: true,
      message:
        'If an account exists with those details, a reset token has been issued to the registered channel.',
      ...(isProduction
        ? {}
        : { debugToken: resetToken, expiresAt: tokenExpiresAt }),
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    if (!resetToken || typeof resetToken !== 'string' || !resetToken.trim()) {
      throw new BadRequestException('Reset token is required.');
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }

    let user: any = null;
    try {
      user = await this.prisma.user.findFirst({
        where: {
          resetToken: resetToken.trim(),
          tokenExpiresAt: { gt: new Date() },
        },
      });
    } catch { }

    if (!user) {
      throw new BadRequestException(
        'Invalid or expired password reset token.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          tokenExpiresAt: null,
        },
      });
    } catch { }

    return {
      success: true,
      message:
        'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  async getUserPreferences(rawUserId: string) {
    const userId = String(rawUserId || 'default_user').trim().toLowerCase();
    const fallbackPath = path.resolve(process.cwd(), 'backend', 'data', 'user_preferences_store.json');

    // Default preferences: Light Mode + English
    let prefs = { theme: 'light', language: 'en' };

    try {
      const dbPref = await (this.prisma as any).userPreference.findUnique({
        where: { userId },
      });
      if (dbPref) {
        return {
          theme: dbPref.theme || 'light',
          language: dbPref.language || 'en',
        };
      }
    } catch (e: any) {
      this.logger.debug(`Prisma getUserPreferences fallback: ${e?.message}`);
    }

    // Check JSON file fallback
    try {
      if (fs.existsSync(fallbackPath)) {
        const fileData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        if (fileData[userId]) {
          return fileData[userId];
        }
      }
    } catch {}

    return prefs;
  }

  async updateUserPreferences(rawUserId: string, updates: { theme?: string; language?: string }) {
    const userId = String(rawUserId || 'default_user').trim().toLowerCase();
    const fallbackPath = path.resolve(process.cwd(), 'backend', 'data', 'user_preferences_store.json');

    const current = await this.getUserPreferences(userId);
    const newTheme = updates.theme && ['light', 'dark'].includes(updates.theme) ? updates.theme : current.theme;
    const newLang = updates.language && ['en', 'hi'].includes(updates.language) ? updates.language : current.language;

    const updated = {
      theme: newTheme,
      language: newLang,
    };

    try {
      await (this.prisma as any).userPreference.upsert({
        where: { userId },
        create: {
          userId,
          theme: updated.theme,
          language: updated.language,
        },
        update: {
          theme: updated.theme,
          language: updated.language,
        },
      });
    } catch (e: any) {
      this.logger.debug(`Prisma updateUserPreferences fallback: ${e?.message}`);
    }

    // Persist to JSON file fallback
    try {
      const dir = path.dirname(fallbackPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let fileData: any = {};
      if (fs.existsSync(fallbackPath)) {
        fileData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      }
      fileData[userId] = updated;
      fs.writeFileSync(fallbackPath, JSON.stringify(fileData, null, 2), 'utf8');
    } catch {}

    return updated;
  }

}
