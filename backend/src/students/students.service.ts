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
          { id: userIdOrRoll },
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
        attendanceRecords: true,
        marks: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found.');
    }

    // Authentic attendance calculation: count only genuine attendance sessions
    const attRecords = student.attendanceRecords || [];
    const totalHeld = attRecords.reduce((sum, r) => sum + (r.held || 0), 0);
    const totalAttended = attRecords.reduce((sum, r) => sum + (r.attended || 0), 0);
    const hasAttendance = attRecords.length > 0 && totalHeld > 0;
    const attendancePercentage = hasAttendance ? Math.round((totalAttended / totalHeld) * 100) : null;

    // Authentic academic marks & CGPA: only if actual assessment records exist
    const studentMarks = student.marks || [];
    const hasMarks = studentMarks.length > 0 && studentMarks.some((m) => (m.totalMarks || 0) > 0 || (m.finalWeightage || 0) > 0);

    return {
      ...student,
      attendance: hasAttendance ? attendancePercentage : null,
      attendancePercentage: hasAttendance ? attendancePercentage : null,
      classesHeld: hasAttendance ? totalHeld : null,
      classesAttended: hasAttendance ? totalAttended : null,
      classesMissed: hasAttendance ? (totalHeld - totalAttended) : null,
      hasAttendanceRecords: hasAttendance,
      cgpa: hasMarks ? student.cgpa : null,
      hasAcademicMarks: hasMarks,
    };
  }

  async getStudentAttendance(studentIdOrRoll: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        OR: [
          { id: studentIdOrRoll },
          { userId: studentIdOrRoll },
          { rollNumber: studentIdOrRoll },
          { studentId: studentIdOrRoll },
        ],
      },
      include: {
        attendanceRecords: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found.');
    }

    const records = student.attendanceRecords || [];
    const totalHeld = records.reduce((sum, r) => sum + (r.held || 0), 0);
    const totalAttended = records.reduce((sum, r) => sum + (r.attended || 0), 0);
    const hasAttendance = records.length > 0 && totalHeld > 0;
    const attendancePercentage = hasAttendance ? Math.round((totalAttended / totalHeld) * 100) : null;

    return {
      success: true,
      data: {
        hasAttendance,
        records: records.map((r) => ({
          code: r.subjectCode,
          name: r.subjectName,
          faculty: r.faculty,
          type: r.type,
          held: r.held,
          attended: r.attended,
          percentage: r.held > 0 ? Math.round((r.attended / r.held) * 100) : null,
        })),
        totalHeld: hasAttendance ? totalHeld : 0,
        totalAttended: hasAttendance ? totalAttended : 0,
        totalMissed: hasAttendance ? Math.max(0, totalHeld - totalAttended) : 0,
        attendancePercentage,
      },
    };
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
