import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const rawKey = dto.identifier.trim().toLowerCase();
    
    // Find user by identifier, email, or administrative alias
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { identifier: { equals: rawKey, mode: 'insensitive' } },
          { email: { equals: rawKey, mode: 'insensitive' } },
          ...(rawKey === 'superadmin' || rawKey === 'super_admin'
            ? [{ identifier: { equals: 'SYS-SUPER-01', mode: 'insensitive' as const } }, { role: 'SUPER_ADMIN' as const }]
            : []),
          ...(rawKey === 'admin'
            ? [{ identifier: { equals: 'ADM-001', mode: 'insensitive' as const } }, { role: 'ADMIN' as const }]
            : []),
          ...(rawKey === 'management' || rawKey === 'director'
            ? [{ identifier: { equals: 'GOV-CHAIR-01', mode: 'insensitive' as const } }, { role: 'MANAGEMENT' as const }]
            : []),
          ...(rawKey === 'principal'
            ? [{ identifier: { equals: 'OFF-PRIN-01', mode: 'insensitive' as const } }, { role: 'PRINCIPAL' as const }]
            : []),
        ],
      },
      include: {
        student: true,
        faculty: true,
        hod: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('We could not verify those sign-in details. Please check your College ID and password.');
    }

    // Verify submitted password against securely stored password hash
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

    const secret = process.env.JWT_SECRET || 'gift-autonomous-bput-super-secret-jwt-key-2026-production';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

    const accessToken = jwt.sign(payload, secret, { expiresIn });

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

    const secret = process.env.JWT_SECRET || 'gift-autonomous-bput-super-secret-jwt-key-2026-production';
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

    const isProduction = process.env.NODE_ENV === 'production';
    return {
      success: true,
      message: 'If an account exists with those details, a reset token has been issued to the registered channel.',
      ...(isProduction ? {} : { debugToken: resetToken, expiresAt: tokenExpiresAt }),
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
