import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAttendanceDto } from './faculty.dto';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Persisted teaching assignments for a linked faculty profile. */
  async getAssignments(facultyId?: string) {
    if (!facultyId) return [];
    const assignments = await this.prisma.facultyAssignment.findMany({
      where: { facultyId, courseOffering: { status: 'Active' } },
      include: { faculty: true, courseOffering: true },
      orderBy: [{ academicYear: 'desc' }, { courseOffering: { subjectCode: 'asc' } }],
    });

    return Promise.all(assignments.map(async (assignment) => {
      const course = assignment.courseOffering;
      const studentsCount = await this.prisma.student.count({
        where: { semester: course.semester, section: assignment.section, academicYear: assignment.academicYear, department: course.department },
      });
      return {
        id: assignment.id,
        facultyId: assignment.facultyId,
        facultyName: assignment.faculty.name,
        subjectCode: course.subjectCode,
        subjectName: course.subjectName,
        program: course.programmeId ?? null,
        deptCode: course.department,
        department: assignment.faculty.department,
        semester: course.semester,
        section: assignment.section,
        academicYear: assignment.academicYear,
        type: course.type,
        credits: course.credits,
        room: null,
        sectionEnrollment: studentsCount,
        courseTotalEnrollment: studentsCount,
        attendanceCompletion: null,
        marksCompletion: null,
        approvalStatus: null,
        upcomingDeadline: null,
        lastUpdated: assignment.updatedAt,
      };
    }));
  }

  /** Return only faculty metrics backed by persisted records. */
  async getDashboard(facultyId?: string) {
    const [faculty, assignments] = await Promise.all([
      facultyId ? this.prisma.faculty.findUnique({ where: { id: facultyId } }) : null,
      this.getAssignments(facultyId),
    ]);
    const assignmentScopes = assignments.map((assignment) => ({
      subjectCode: assignment.subjectCode,
      section: assignment.section,
    }));
    const [scopedStudentsCount, attendanceSessionsCount, noticeRows] = assignmentScopes.length
      ? await Promise.all([
          this.prisma.student.count({ where: { OR: assignments.map((a) => ({ semester: a.semester, section: a.section, academicYear: a.academicYear, department: a.deptCode })) } }),
          this.prisma.attendanceSession.count({ where: { facultyAssignmentId: { in: assignments.map((a) => a.id) } } }),
          this.prisma.notice.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
        ])
      : [0, 0, []];

    return {
      facultyInfo: faculty ? {
        id: faculty.id,
        name: faculty.name,
        department: faculty.department,
        designation: faculty.designation,
      } : null,
      kpis: {
        assignedSubjectsCount: assignments.length,
        scopedStudentsCount,
        attendanceSessionsCount,
        totalCourseEnrollment: null,
        attendanceSessionsPending: null,
        marksPendingEntry: null,
        assessmentCompletionRate: null,
        quizzesScheduledCount: null,
        quizzesLiveCount: null,
        resourcesPendingVerification: null,
        studentQueriesPending: null,
        atRiskStudentsCount: null,
        nextAcademicMilestone: null,
      },
      assignments,
      workQueue: [],
      todayTimetable: [],
      notices: noticeRows,
    };
  }

  /**
   * Attendance Sessions & Submission
   */
  async getAttendanceRoster(facultyId: string, subjectCode?: string, section?: string) {
    if (!subjectCode?.trim() || !section?.trim()) {
      throw new BadRequestException('Subject code and section are required to load an attendance roster.');
    }

    const assignment = await this.prisma.facultyAssignment.findFirst({
      where: {
        facultyId,
        section: section.trim(),
        courseOffering: { is: { subjectCode: subjectCode.trim().toUpperCase() } },
      },
      include: { courseOffering: true },
    });
    if (!assignment) {
      throw new ForbiddenException('The requested attendance roster is outside your assigned subject sections.');
    }

    return this.prisma.student.findMany({
      where: {
        semester: assignment.courseOffering.semester,
        section: assignment.section,
        academicYear: assignment.academicYear,
        status: 'Active',
        OR: [
          { deptCode: assignment.courseOffering.department },
          { department: assignment.courseOffering.department },
        ],
      },
      select: {
        id: true,
        studentId: true,
        rollNumber: true,
        name: true,
        attendance: true,
      },
      orderBy: { rollNumber: 'asc' },
    });
  }

  async getAttendanceSessions(facultyId: string, subjectCode?: string, section?: string) {
    const assignments = await this.prisma.facultyAssignment.findMany({
      where: {
        facultyId,
        ...(section ? { section: section.trim() } : {}),
        ...(subjectCode
          ? { courseOffering: { is: { subjectCode: subjectCode.trim().toUpperCase() } } }
          : {}),
      },
      select: { id: true },
    });

    if ((subjectCode || section) && assignments.length === 0) {
      throw new ForbiddenException('Attendance history is limited to your assigned subject sections.');
    }
    if (assignments.length === 0) return [];

    return this.prisma.attendanceSession.findMany({
      where: { facultyAssignmentId: { in: assignments.map((assignment) => assignment.id) } },
      orderBy: [{ date: 'desc' }, { recordedAt: 'desc' }],
    });
  }

  async submitAttendanceSession(facultyId: string, userId: string, payload: SubmitAttendanceDto) {
    const subjectCode = payload.subjectCode.trim().toUpperCase();
    const section = payload.section.trim();
    const period = payload.period.trim();
    const dateValue = new Date(`${payload.date}T00:00:00.000Z`);
    if (Number.isNaN(dateValue.getTime()) || dateValue.toISOString().slice(0, 10) !== payload.date) {
      throw new BadRequestException('Attendance date must be a real calendar date in YYYY-MM-DD format.');
    }

    const assignment = await this.prisma.facultyAssignment.findFirst({
      where: {
        facultyId,
        section,
        courseOffering: { is: { subjectCode } },
      },
      include: { courseOffering: true, faculty: true },
    });
    if (!assignment) {
      throw new ForbiddenException('You can only record attendance for a subject section assigned to you.');
    }

    const students = await this.prisma.student.findMany({
      where: {
        semester: assignment.courseOffering.semester,
        section: assignment.section,
        academicYear: assignment.academicYear,
        status: 'Active',
        OR: [
          { deptCode: assignment.courseOffering.department },
          { department: assignment.courseOffering.department },
        ],
      },
      select: { id: true, rollNumber: true, name: true },
      orderBy: { rollNumber: 'asc' },
    });
    if (students.length === 0) {
      throw new BadRequestException('No active students are enrolled in this assigned section.');
    }
    if (students.length > 1000) {
      throw new BadRequestException('This section is too large for one attendance submission.');
    }

    const provided = payload.attendanceMap;
    if (!provided || typeof provided !== 'object' || Array.isArray(provided)) {
      throw new BadRequestException('Attendance must be an object keyed by student roll number.');
    }
    const attendance = new Map<string, boolean>();
    for (const [rawRollNumber, present] of Object.entries(provided)) {
      const rollNumber = rawRollNumber.trim();
      if (!rollNumber || typeof present !== 'boolean' || attendance.has(rollNumber)) {
        throw new BadRequestException('Each attendance entry must have a unique roll number and a boolean value.');
      }
      attendance.set(rollNumber, present);
    }

    const rosterRolls = new Set(students.map((student) => student.rollNumber));
    if (attendance.size !== rosterRolls.size || [...attendance.keys()].some((roll) => !rosterRolls.has(roll))) {
      throw new BadRequestException('Attendance must include exactly the active students in your assigned section.');
    }

    const entries = students.map((student) => ({
      studentId: student.id,
      rollNumber: student.rollNumber,
      name: student.name,
      present: attendance.get(student.rollNumber)!,
    }));
    const totalCount = entries.length;
    const presentCount = entries.filter((entry) => entry.present).length;
    const absentCount = totalCount - presentCount;
    const percentage = Number(((presentCount / totalCount) * 100).toFixed(2));
    const recordedAt = new Date();
    const sessionKey = JSON.stringify([
      assignment.courseOfferingId,
      assignment.section.toLowerCase(),
      payload.date,
      period.toLowerCase().replace(/\s+/g, ' '),
    ]);
    const data = {
      sessionKey,
      facultyAssignmentId: assignment.id,
      recordedByUserId: userId,
      facultyName: assignment.faculty.name,
      subjectCode: assignment.courseOffering.subjectCode,
      subjectName: assignment.courseOffering.subjectName,
      semester: assignment.courseOffering.semester,
      section: assignment.section,
      date: payload.date,
      period,
      totalCount,
      presentCount,
      absentCount,
      percentage,
      entries,
      recordedAt,
    };

    try {
      const session = await this.prisma.$transaction(async (tx) => {
        const created = await tx.attendanceSession.create({ data });
        await tx.auditLog.create({
          data: {
            user: assignment.faculty.name,
            role: 'FACULTY',
            targetStudent: `Section ${assignment.section}`,
            subject: assignment.courseOffering.subjectCode,
            assessment: 'PERIOD_ATTENDANCE',
            oldMark: 'Unrecorded period',
            newMark: `${presentCount} present / ${totalCount} enrolled (${percentage}%)`,
            changedAt: recordedAt.toISOString(),
            reason: `Attendance recorded for ${assignment.courseOffering.subjectCode} (${assignment.section}) on ${payload.date}, ${period}.`,
          },
        });
        return created;
      });

      return {
        ...session,
        message: `Attendance session saved for ${assignment.courseOffering.subjectCode} (${assignment.section}).`,
      };
    } catch (error) {
      if ((error as { code?: string })?.code === 'P2002') {
        throw new ConflictException('Attendance has already been recorded for this subject, section, date and period.');
      }
      throw error;
    }
  }

  /**
   * Quizzes Management
   */
  async getQuizzes() {
    throw new ServiceUnavailableException('Quiz persistence is not implemented.');
  }

  async createOrUpdateQuiz() {
    throw new ServiceUnavailableException('Quiz persistence is not implemented.');
  }

  async publishQuiz() {
    throw new ServiceUnavailableException('Quiz persistence is not implemented.');
  }

  async getClassPerformance() {
    throw new ServiceUnavailableException('Verified class performance analytics are not available.');
  }

  async getAtRiskStudents() {
    throw new ServiceUnavailableException('Verified faculty early-warning data is not available.');
  }

  async logRemedialIntervention() {
    throw new ServiceUnavailableException('Persistent remedial intervention logging is not implemented.');
  }
}
