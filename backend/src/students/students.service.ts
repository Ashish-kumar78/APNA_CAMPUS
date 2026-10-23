import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStudents(query?: { search?: string; department?: string; semester?: string; section?: string; status?: string }) {
    const where: any = {};
    const and: any[] = [];

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
      and.push({ OR: [
        { deptCode: query.department },
        { department: query.department },
      ] });
    }
    if (query?.search) {
      const q = query.search.trim();
      if (q) {
        and.push({ OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { rollNumber: { contains: q, mode: 'insensitive' } },
          { studentId: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ] });
      }
    }
    if (and.length) where.AND = and;

    return this.prisma.student.findMany({
      where,
      orderBy: { rollNumber: 'asc' },
    });
  }

  async getProfile(studentId: string) {
    if (!studentId) {
      throw new NotFoundException('Student profile is not linked to this account.');
    }
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
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
      throw new NotFoundException('Student profile was not found.');
    }
    return student;
  }

  async updateProfile(id: string, data: any) {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async saveTransferPreference(studentId: string, campus: string, city: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
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

  async createStudent(data: {
    studentId: string;
    rollNumber: string;
    name: string;
    email: string;
    department: string;
    deptCode?: string;
    semester?: string;
    section?: string;
    academicYear?: string;
    phone?: string;
  }) {
    return this.prisma.student.create({ data });
  }

  async updateStudent(id: string, data: Prisma.StudentUpdateInput) {
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
