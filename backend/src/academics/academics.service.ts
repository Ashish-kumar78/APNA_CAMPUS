import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicsService {
  constructor(private readonly prisma: PrismaService) {}

  // Departments
  async getDepartments() {
    return this.prisma.department.findMany({ orderBy: { code: 'asc' } });
  }

  async createDepartment(data: any) {
    return this.prisma.department.create({ data });
  }

  async updateDepartment(id: string, data: any) {
    return this.prisma.department.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }

  // Semesters
  async getSemesters() {
    return this.prisma.semester.findMany({ orderBy: { number: 'asc' } });
  }

  // Sections
  async getSections() {
    return this.prisma.section.findMany({ orderBy: { semester: 'asc' } });
  }

  // Subjects
  async getSubjects(department?: string, semester?: string) {
    const where: any = {};
    if (department && department !== 'All') where.department = department;
    if (semester && semester !== 'All') where.semester = semester;
    return this.prisma.subject.findMany({ where, orderBy: { code: 'asc' } });
  }

  async createSubject(data: any) {
    return this.prisma.subject.create({ data });
  }

  async updateSubject(id: string, data: any) {
    return this.prisma.subject.update({ where: { id }, data });
  }

  async deleteSubject(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }

  // Timetable
  getWeeklyTimetable() {
    return {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      slots: ['8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:30 PM'],
      schedule: {
        Monday: {
          '8:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
          '9:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
          '11:30 AM': { subject: 'Compiler Design', code: 'CS504', room: 'Room 204', faculty: 'Dr. A. Panda', type: 'theory' },
          '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
          '1:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
          '2:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
        },
        Tuesday: {
          '8:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
          '9:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
          '10:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
          '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
          '1:30 PM': { subject: 'Project Work', code: 'CS506', room: 'Lab-3', faculty: 'Dr. S. Mohanty', type: 'project' },
          '2:30 PM': { subject: 'Project Work', code: 'CS506', room: 'Lab-3', faculty: 'Dr. S. Mohanty', type: 'project' },
        },
        Wednesday: {
          '8:30 AM': { subject: 'Compiler Design', code: 'CS504', room: 'Room 204', faculty: 'Dr. A. Panda', type: 'theory' },
          '10:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
          '11:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
          '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
        },
        Thursday: {
          '8:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
          '9:30 AM': { subject: 'Compiler Design', code: 'CS504', room: 'Room 204', faculty: 'Dr. A. Panda', type: 'theory' },
          '11:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
          '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
          '1:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
          '2:30 PM': { subject: 'AI Lab', code: 'CS505', room: 'CS Lab-1', faculty: 'Dr. P. Mohapatra', type: 'lab' },
        },
        Friday: {
          '8:30 AM': { subject: 'Machine Learning', code: 'CS502', room: 'Room 302', faculty: 'Dr. S. Rath', type: 'theory' },
          '9:30 AM': { subject: 'Cloud Computing', code: 'CS503', room: 'Room 205', faculty: 'Prof. R. Nayak', type: 'theory' },
          '10:30 AM': { subject: 'Artificial Intelligence', code: 'CS501', room: 'Room 301', faculty: 'Dr. P. Mohapatra', type: 'theory' },
          '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
        },
        Saturday: {
          '8:30 AM': { subject: 'GATE / Mentorship Sessions', code: 'GATE', room: 'Seminar Hall-2', faculty: 'Senior Faculty', type: 'mentor' },
          '10:30 AM': { subject: 'Technical Seminars', code: 'SEM', room: 'Auditorium', faculty: 'Visiting Experts', type: 'seminar' },
          '12:30 PM': { subject: 'Lunch Break', code: '', room: '', faculty: '', type: 'break' },
        },
      },
    };
  }

  // ==========================================
  // PROGRAMMES (B.Tech, BBA, BCA, Diploma, etc.)
  // ==========================================
  async getProgrammes() {
    return this.prisma.programme.findMany({
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: { students: true, applicants: true, courseOfferings: true },
        },
      },
    });
  }

  async createProgramme(data: {
    code: string;
    name: string;
    degreeType?: string;
    departmentCode: string;
    durationYears?: number;
    totalSemesters?: number;
    creditsRequired?: number;
  }) {
    return this.prisma.programme.create({
      data: {
        code: data.code.toUpperCase().trim(),
        name: data.name.trim(),
        degreeType: data.degreeType || 'UG',
        departmentCode: data.departmentCode.toUpperCase().trim(),
        durationYears: data.durationYears || 4,
        totalSemesters: data.totalSemesters || 8,
        creditsRequired: data.creditsRequired || 160,
      },
    });
  }

  async updateProgramme(id: string, data: any) {
    return this.prisma.programme.update({
      where: { id },
      data,
    });
  }

  // ==========================================
  // ACADEMIC YEARS
  // ==========================================
  async getAcademicYears() {
    return this.prisma.academicYear.findMany({
      orderBy: { year: 'desc' },
    });
  }

  async createAcademicYear(data: { year: string; startDate?: string; endDate?: string; isCurrent?: boolean }) {
    if (data.isCurrent) {
      await this.prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    return this.prisma.academicYear.create({
      data: {
        year: data.year.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: Boolean(data.isCurrent),
      },
    });
  }

  // ==========================================
  // COURSE OFFERINGS & FACULTY ASSIGNMENTS
  // ==========================================
  async getCourseOfferings(query?: { department?: string; semester?: string; academicYear?: string; programmeId?: string }) {
    const where: any = {};
    if (query?.department && query.department !== 'All') where.department = query.department;
    if (query?.semester && query.semester !== 'All') where.semester = query.semester;
    if (query?.academicYear && query.academicYear !== 'All') where.academicYear = query.academicYear;
    if (query?.programmeId && query.programmeId !== 'All') where.programmeId = query.programmeId;

    return this.prisma.courseOffering.findMany({
      where,
      include: {
        programme: true,
        facultyAssignments: {
          include: { faculty: true },
        },
      },
      orderBy: { subjectCode: 'asc' },
    });
  }

  async createCourseOffering(data: {
    subjectCode: string;
    subjectName: string;
    programmeId?: string;
    department: string;
    semester: string;
    academicYear: string;
    credits?: number;
    type?: string;
  }) {
    return this.prisma.courseOffering.create({
      data: {
        subjectCode: data.subjectCode.toUpperCase().trim(),
        subjectName: data.subjectName.trim(),
        programmeId: data.programmeId || null,
        department: data.department,
        semester: data.semester,
        academicYear: data.academicYear || '2026-27',
        credits: data.credits || 4,
        type: data.type || 'Theory + Lab',
      },
      include: { programme: true },
    });
  }

  async assignFacultyToCourse(data: {
    courseOfferingId: string;
    facultyId: string;
    section?: string;
    academicYear?: string;
    role?: string;
    allocatedHours?: number;
  }) {
    return this.prisma.facultyAssignment.upsert({
      where: {
        courseOfferingId_facultyId_section: {
          courseOfferingId: data.courseOfferingId,
          facultyId: data.facultyId,
          section: data.section || 'Section A',
        },
      },
      update: {
        role: data.role || 'Lead Instructor',
        allocatedHours: data.allocatedHours || 4,
      },
      create: {
        courseOfferingId: data.courseOfferingId,
        facultyId: data.facultyId,
        section: data.section || 'Section A',
        academicYear: data.academicYear || '2026-27',
        role: data.role || 'Lead Instructor',
        allocatedHours: data.allocatedHours || 4,
      },
      include: { courseOffering: true, faculty: true },
    });
  }

  // ==========================================
  // STUDENT ENROLLMENTS & SEMESTER PROGRESSION
  // ==========================================
  async getStudentEnrollments(studentIdOrRoll: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        OR: [
          { id: studentIdOrRoll },
          { rollNumber: studentIdOrRoll },
          { studentId: studentIdOrRoll },
        ],
      },
    });

    if (!student) return [];

    return this.prisma.studentEnrollment.findMany({
      where: { studentId: student.id },
      include: { programme: true },
      orderBy: { enrolledAt: 'asc' },
    });
  }

  async promoteStudentSemester(data: {
    studentId: string;
    targetSemester: string;
    academicYear: string;
    section?: string;
    previousSemesterSgpa?: number;
  }) {
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new Error(`Student ${data.studentId} not found.`);
    }

    // Atomic transaction: mark prior enrollment as Promoted/Completed and create new semester enrollment
    return this.prisma.$transaction(async (tx) => {
      // 1. Update previous active enrollment
      await tx.studentEnrollment.updateMany({
        where: {
          studentId: student.id,
          semester: student.semester,
          status: 'Enrolled',
        },
        data: {
          status: 'Completed',
          sgpa: data.previousSemesterSgpa || student.cgpa,
          promotedAt: new Date(),
        },
      });

      // 2. Create next semester enrollment
      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          programmeId: student.programmeId,
          academicYear: data.academicYear || student.academicYear,
          semester: data.targetSemester,
          section: data.section || student.section,
          status: 'Enrolled',
          cgpa: student.cgpa,
          attendanceRate: 100,
        },
      });

      // 3. Update student record current semester
      const updatedStudent = await tx.student.update({
        where: { id: student.id },
        data: {
          semester: data.targetSemester,
          section: data.section || student.section,
          academicYear: data.academicYear || student.academicYear,
        },
      });

      return { student: updatedStudent, enrollment: newEnrollment };
    });
  }
}
