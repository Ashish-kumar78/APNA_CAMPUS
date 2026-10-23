import { Injectable, UnauthorizedException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/env';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const rawKey = dto.identifier.trim().toLowerCase();
    
    // Find user by identifier or email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { identifier: { equals: rawKey, mode: 'insensitive' } },
          { email: { equals: rawKey, mode: 'insensitive' } },
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

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('We could not verify those sign-in details. Invalid password.');
    }

    if (!user.isActive || !user.isActivated) {
      throw new UnauthorizedException('Your account is currently disabled. Please contact the administrator.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      identifier: user.identifier,
    };

    const secret = getJwtSecret();
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
        phone: user.phone,
        identifier: user.identifier,
        role: roleKey,
        roleEnum: user.role,
        designation: user.designation || user.detail || '',
        permissions: user.permissions || [],
        registrationNumber: regNo,
        identity: facultyId || regNo,
        department: user.department || user.student?.department,
        detail: user.detail || (user.role === 'STUDENT' ? user.student?.semester : undefined),
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
      department: user.department,
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
    if (!newPassword || newPassword.length < 8 || Buffer.byteLength(newPassword, 'utf8') > 72) {
      throw new BadRequestException('Password must be between 8 and 72 bytes.');
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

    const secret = getJwtSecret();
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
        phone: updatedUser.phone,
        identifier: updatedUser.identifier,
        role: roleKey,
        roleEnum: updatedUser.role,
        registrationNumber: regNo,
        department: updatedUser.department || updatedUser.student?.department,
        detail: updatedUser.detail || updatedUser.student?.semester,
      },
    };
  }

  async forgotPassword(_emailOrIdentifier: string): Promise<never> {
    throw new ServiceUnavailableException('Password recovery is unavailable until a secure email delivery provider is configured.');
  }

  async resetPassword(resetToken: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8 || Buffer.byteLength(newPassword, 'utf8') > 72) {
      throw new BadRequestException('Password must be between 8 and 72 bytes.');
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
