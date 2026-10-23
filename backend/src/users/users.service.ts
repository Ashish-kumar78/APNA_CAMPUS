import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email: { equals: String(email).trim(), mode: 'insensitive' } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
      },
    });
  }

  async list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        identifier: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
