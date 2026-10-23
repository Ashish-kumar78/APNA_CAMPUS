import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicsService {
  constructor(private readonly prisma: PrismaService) {}

  // Departments
  async getDepartments() {
    const departments = await this.prisma.department.findMany({ orderBy: { code: 'asc' } });
    return Promise.all(departments.map(async (department) => {
      const scope = {
        OR: [
          { department: department.name },
          { department: department.code },
          { deptCode: department.code },
        ],
      };
      const [studentsCount, facultyCount, subjects, courseOfferings] = await Promise.all([
        this.prisma.student.count({ where: scope }),
        this.prisma.faculty.count({ where: { OR: [{ department: department.name }, { department: department.code }] } }),
        this.prisma.subject.findMany({
          where: { OR: [{ department: department.name }, { department: department.code }] },
          select: { code: true },
        }),
        this.prisma.courseOffering.findMany({
          where: { OR: [{ department: department.name }, { department: department.code }] },
          select: { subjectCode: true },
        }),
      ]);
      const subjectCodes = new Set([
        ...subjects.map((subject) => subject.code),
        ...courseOfferings.map((offering) => offering.subjectCode),
      ]);
      return {
        ...department,
        studentsCount,
        facultyCount,
        subjectsCount: subjectCodes.size,
      };
    }));
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
    const semesters = await this.prisma.semester.findMany({ orderBy: { number: 'asc' } });
    return Promise.all(semesters.map(async (semester) => {
      const [studentsCount, subjects, offerings] = await Promise.all([
        this.prisma.student.count({ where: { semester: semester.label } }),
        this.prisma.subject.findMany({ where: { semester: semester.label }, select: { code: true } }),
        this.prisma.courseOffering.findMany({ where: { semester: semester.label }, select: { subjectCode: true } }),
      ]);
      const subjectCodes = new Set([...subjects.map(({ code }) => code), ...offerings.map(({ subjectCode }) => subjectCode)]);
      return { ...semester, subjectsCount: subjectCodes.size, studentsCount };
    }));
  }

  async createSemester(data: { number: number; label: string; year: string; academicYear: string; status?: string }) {
    const number = Number(data.number);
    if (!Number.isInteger(number) || number < 1 || number > 12) throw new BadRequestException('Semester number must be an integer from 1 to 12.');
    const label = String(data.label || '').trim();
    const year = String(data.year || '').trim();
    const academicYear = String(data.academicYear || '').trim();
    if (!label || !year || !academicYear) throw new BadRequestException('Semester label, year level, and academic year are required.');
    return this.prisma.semester.create({ data: { number, label, year, academicYear, status: data.status || 'Upcoming', subjectsCount: 0, studentsCount: 0 } });
  }

  async updateSemesterStatus(id: string, status: string) {
    if (!['Active', 'Closed', 'Upcoming'].includes(status)) throw new BadRequestException('Semester status must be Active, Closed, or Upcoming.');
    return this.prisma.semester.update({ where: { id }, data: { status } });
  }

  // Sections
  async getSections() {
    const sections = await this.prisma.section.findMany({ orderBy: [{ semester: 'asc' }, { department: 'asc' }, { section: 'asc' }] });
    return Promise.all(sections.map(async (section) => {
      const studentsCount = await this.prisma.student.count({
        where: {
          semester: section.semester,
          OR: [{ department: section.department }, { deptCode: section.department }],
          AND: [{ OR: [{ section: section.section }, { section: `Section ${section.section.replace(/^Section\\s+/i, '')}` }] }],
        },
      });
      return { ...section, studentsCount };
    }));
  }

  async createSection(data: { semester: string; section: string; department: string; room?: string; classRepresentative?: string; facultyCoordinator?: string }) {
    const semester = String(data.semester || '').trim();
    const section = String(data.section || '').trim();
    const department = String(data.department || '').trim();
    if (!semester || !section || !department) throw new BadRequestException('Semester, section, and department are required.');
    return this.prisma.section.create({ data: { semester, section, department, room: data.room?.trim() || null, classRepresentative: data.classRepresentative?.trim() || null, facultyCoordinator: data.facultyCoordinator?.trim() || null, studentsCount: 0 } });
  }

  // Subjects
  async getSubjects(department?: string, semester?: string) {
    const where: any = {};
    if (department && department !== 'All') where.department = department;
    if (semester && semester !== 'All') where.semester = semester;
    const [subjects, offerings] = await Promise.all([
      this.prisma.subject.findMany({ where, orderBy: { code: 'asc' } }),
      this.prisma.courseOffering.findMany({
        where,
        include: { facultyAssignments: { include: { faculty: { select: { name: true } } } } },
        orderBy: { subjectCode: 'asc' },
      }),
    ]);
    const byCode = new Map<string, any>();
    subjects.forEach((subject) => byCode.set(subject.code, { ...subject, assignedFaculty: '' }));
    offerings.forEach((offering) => {
      const existing = byCode.get(offering.subjectCode);
      const facultyNames = [...new Set(offering.facultyAssignments.map(({ faculty }) => faculty.name))].join(', ');
      byCode.set(offering.subjectCode, {
        ...(existing || {}),
        id: existing?.id || offering.id,
        code: offering.subjectCode,
        name: offering.subjectName,
        department: offering.department,
        semester: offering.semester,
        credits: offering.credits,
        type: offering.type,
        status: offering.status,
        assignedFaculty: facultyNames,
      });
    });
    return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  }

  async getFacultyDirectory() {
    return this.prisma.faculty.findMany({ where: { status: 'Active' }, orderBy: { name: 'asc' }, select: { id: true, employeeId: true, name: true, email: true, department: true, designation: true, status: true } });
  }

  async createSubject(data: any) {
    const code = String(data.code || '').trim().toUpperCase();
    const name = String(data.name || '').trim();
    const department = String(data.department || '').trim();
    const semester = String(data.semester || '').trim();
    const credits = Number(data.credits);
    const type = String(data.type || '').trim();
    if (!code || !name || !department || !semester || !type) throw new BadRequestException('Code, name, department, semester, and subject type are required.');
    if (!Number.isInteger(credits) || credits < 1 || credits > 30) throw new BadRequestException('Credits must be an integer from 1 to 30.');
    return this.prisma.subject.create({ data: { code, name, department, semester, credits, type } });
  }

  async createCurriculumItem(data: { code: string; name: string; department: string; semester: string; academicYear: string; credits: number; type: string }) {
    const code = String(data.code || '').trim().toUpperCase();
    const name = String(data.name || '').trim();
    const department = String(data.department || '').trim();
    const semester = String(data.semester || '').trim();
    const academicYear = String(data.academicYear || '').trim();
    const type = String(data.type || '').trim();
    const credits = Number(data.credits);
    if (!code || !name || !department || !semester || !academicYear || !type) throw new BadRequestException('Code, name, department, semester, academic year, and subject type are required.');
    if (!Number.isInteger(credits) || credits < 1 || credits > 30) throw new BadRequestException('Credits must be an integer from 1 to 30.');
    try {
      return await this.prisma.$transaction(async (tx) => {
        const subject = await tx.subject.create({ data: { code, name, department, semester, credits, type } });
        const offering = await tx.courseOffering.create({
          data: { subjectCode: code, subjectName: name, department, semester, academicYear, credits, type },
        });
        return { ...subject, courseOfferingId: offering.id };
      });
    } catch (error: any) {
      if (error?.code === 'P2002') throw new ConflictException('A subject or course offering with this code and academic period already exists.');
      throw error;
    }
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
    credits: number;
    type: string;
  }) {
    const subjectCode = String(data.subjectCode || '').trim().toUpperCase();
    const subjectName = String(data.subjectName || '').trim();
    const department = String(data.department || '').trim();
    const semester = String(data.semester || '').trim();
    const academicYear = String(data.academicYear || '').trim();
    const credits = Number(data.credits);
    const type = String(data.type || '').trim();
    if (!subjectCode || !subjectName || !department || !semester || !academicYear || !type) {
      throw new BadRequestException('Course code, name, department, semester, academic year, and type are required.');
    }
    if (!Number.isInteger(credits) || credits < 1 || credits > 30) throw new BadRequestException('Credits must be an integer from 1 to 30.');
    return this.prisma.courseOffering.create({
      data: {
        subjectCode,
        subjectName,
        programmeId: data.programmeId || null,
        department,
        semester,
        academicYear,
        credits,
        type,
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
    const [offering, faculty] = await Promise.all([
      this.prisma.courseOffering.findUnique({ where: { id: data.courseOfferingId } }),
      this.prisma.faculty.findUnique({ where: { id: data.facultyId } }),
    ]);
    if (!offering) throw new NotFoundException('Course offering was not found. Refresh the page and select a saved offering.');
    if (!faculty || faculty.status !== 'Active') throw new NotFoundException('Select an existing active faculty profile.');
    const section = String(data.section || '').trim();
    const allocatedHours = Number(data.allocatedHours ?? 4);
    if (!section) throw new BadRequestException('A section label is required for this allocation.');
    if (!Number.isInteger(allocatedHours) || allocatedHours < 1 || allocatedHours > 60) throw new BadRequestException('Allocated weekly hours must be from 1 to 60.');
    return this.prisma.facultyAssignment.upsert({
      where: {
        courseOfferingId_facultyId_section: {
          courseOfferingId: offering.id,
          facultyId: faculty.id,
          section,
        },
      },
      update: {
        role: data.role || 'Lead Instructor',
        allocatedHours,
      },
      create: {
        courseOfferingId: offering.id,
        facultyId: faculty.id,
        section,
        academicYear: offering.academicYear,
        role: data.role || 'Lead Instructor',
        allocatedHours,
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

    const academicYear = data.academicYear?.trim() || student.academicYear;
    const section = data.section?.trim() || student.section;
    if (!academicYear || !section) {
      throw new Error('Academic year and section must be supplied or already recorded for this student.');
    }

    // Atomic transaction: mark prior enrollment as Promoted/Completed and create new semester enrollment
    return this.prisma.$transaction(async (tx) => {
      // 1. Update previous active enrollment
      if (student.semester) {
        await tx.studentEnrollment.updateMany({
          where: { studentId: student.id, semester: student.semester, status: 'Enrolled' },
          data: {
            status: 'Completed',
            ...(data.previousSemesterSgpa != null || student.cgpa != null
              ? { sgpa: data.previousSemesterSgpa ?? student.cgpa }
              : {}),
            promotedAt: new Date(),
          },
        });
      }

      // 2. Create next semester enrollment
      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          programmeId: student.programmeId,
          academicYear,
          semester: data.targetSemester,
          section,
          status: 'Enrolled',
          cgpa: student.cgpa,
        },
      });

      // 3. Update student record current semester
      const updatedStudent = await tx.student.update({
        where: { id: student.id },
        data: {
          semester: data.targetSemester,
          section,
          academicYear,
        },
      });

      return { student: updatedStudent, enrollment: newEnrollment };
    });
  }
}
