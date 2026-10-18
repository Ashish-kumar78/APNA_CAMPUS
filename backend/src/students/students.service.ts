import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStudents(query?: { search?: string; department?: string; semester?: string; section?: string; status?: string }) {
    const where: any = {};

    if (query?.status && query.status !== 'All') {
      where.status = query.status;
    }
    if (query?.semester && query.semester !== 'All') {
      where.semester = query.semester;
    }
    if (query?.section && query.section !== 'All') {
      where.section = query.section;
    }
    if (query?.department && query.department !== 'All') {
      where.OR = [
        { deptCode: query.department },
        { department: query.department },
      ];
    }
    if (query?.search) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { rollNumber: { contains: q, mode: 'insensitive' } },
        { studentId: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      orderBy: { rollNumber: 'asc' },
    });
  }

  async getProfile(userIdOrRoll: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        OR: [
          { userId: userIdOrRoll },
          { rollNumber: userIdOrRoll },
          { studentId: userIdOrRoll },
        ],
      },
      include: {
        guardians: true,
        addresses: true,
        documents: true,
        programme: true,
        enrollments: {
          orderBy: { enrolledAt: 'asc' },
        },
      },
    });

    if (!student) {
      // Fallback: return primary student (Roll 01)
      return this.prisma.student.findFirst({
        where: { rollNumber: '01' },
        include: {
          guardians: true,
          addresses: true,
          documents: true,
          programme: true,
          enrollments: {
            orderBy: { enrolledAt: 'asc' },
          },
        },
      });
    }

    return student;
  }

  async updateProfile(id: string, data: any) {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async saveTransferPreference(studentIdOrRoll: string, campus: string, city: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        OR: [
          { studentId: studentIdOrRoll },
          { rollNumber: studentIdOrRoll },
          { id: studentIdOrRoll },
        ],
      },
    });

    if (!student) {
      throw new NotFoundException('Student record not found.');
    }

    return this.prisma.student.update({
      where: { id: student.id },
      data: {
        transferConfirmed: true,
        transferCampus: campus,
        transferCity: city,
      },
    });
  }

  async createStudent(data: any) {
    return this.prisma.student.create({ data });
  }

  async updateStudent(id: string, data: any) {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async deleteStudent(id: string) {
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
