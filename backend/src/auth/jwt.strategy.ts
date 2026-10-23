
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { getJwtSecret } from '../config/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: {
    sub: string;
    email?: string;
    role?: string;
  }) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        student: true,
        faculty: true,
        hod: true,
      },
    });

    if (!user || !user.isActive || !user.isActivated) {
      throw new UnauthorizedException('User account is not found or inactive.');
    }

    return {
      id: user.id,
      email: user.email,
      identifier: user.identifier,
      name: user.name,
      role: user.role,
      department: user.department,
      detail: user.detail,
      permissions: user.permissions || [],
      student: user.student,
      faculty: user.faculty,
      hod: user.hod,
    };
  }
}
