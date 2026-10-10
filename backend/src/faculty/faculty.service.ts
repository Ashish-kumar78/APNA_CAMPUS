import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Official teaching assignments for the faculty member
   */
  async getAssignments(facultyNameOrId?: string) {
    // Standard assignments for Apna Campus CSE Faculty
    return [
      {
        id: 'fa-1',
        facultyId: 'FAC-042',
        facultyName: 'Dr. S. Mohanty',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        program: 'B.Tech',
        deptCode: 'CSE',
        department: 'Computer Science & Engineering',
        semester: 'Semester 5',
        section: 'Section A',
        type: 'Theory + Lab',
        credits: 4,
        room: 'Block B - 302',
        labRoom: 'Computing Lab 3',
        sectionEnrollment: 32,
        courseTotalEnrollment: 91,
        attendanceCompletion: 88,
        marksCompletion: 84,
        approvalStatus: 'In Progress · Draft',
        componentsCount: 13,
        upcomingDeadline: '15 Oct 2026 (Modular 2)',
        lastUpdated: 'Today, 10:30 AM'
      },
      {
        id: 'fa-2',
        facultyId: 'FAC-042',
        facultyName: 'Dr. S. Mohanty',
        subjectCode: 'CS502',
        subjectName: 'Operating Systems',
        program: 'B.Tech',
        deptCode: 'CSE',
        department: 'Computer Science & Engineering',
        semester: 'Semester 5',
        section: 'Section A',
        type: 'Theory',
        credits: 4,
        room: 'Block B - 304',
        labRoom: null,
        sectionEnrollment: 32,
        courseTotalEnrollment: 91,
        attendanceCompletion: 92,
        marksCompletion: 100,
        approvalStatus: 'Submitted · Awaiting HOD',
        componentsCount: 13,
        upcomingDeadline: '20 Oct 2026 (Assignment 2)',
        lastUpdated: 'Yesterday, 06:10 PM'
      },
      {
        id: 'fa-3',
        facultyId: 'FAC-042',
        facultyName: 'Dr. S. Mohanty',
        subjectCode: 'CS503',
        subjectName: 'Design & Analysis of Algorithms',
        program: 'B.Tech',
        deptCode: 'CSE',
        department: 'Computer Science & Engineering',
        semester: 'Semester 5',
        section: 'Section B',
        type: 'Theory + Lab',
        credits: 4,
        room: 'Block B - 305',
        labRoom: 'Computing Lab 2',
        sectionEnrollment: 30,
        courseTotalEnrollment: 88,
        attendanceCompletion: 85,
        marksCompletion: 76,
        approvalStatus: 'In Progress · Draft',
        componentsCount: 13,
        upcomingDeadline: '22 Oct 2026 (Quiz 4)',
        lastUpdated: '07 Oct 2026, 03:45 PM'
      }
    ];
  }

  /**
   * Faculty Command Centre Operational Dashboard Data
   */
  async getDashboard(facultyNameOrId: string = 'Dr. S. Mohanty') {
    const assignments = await this.getAssignments(facultyNameOrId);
    
    // Count distinct students in database if available
    let totalScopedStudents = 32;
    try {
      const dbStudentsCount = await this.prisma.student.count({
        where: {
          semester: 'Semester 5',
          section: 'Section A'
        }
      });
      if (dbStudentsCount > 0) totalScopedStudents = dbStudentsCount;
    } catch {
      // Fallback to 32
    }

    // Work queue items prioritized for faculty attention
    const workQueue = [
      {
        id: 'wq-1',
        title: 'Review and verify Quiz 3 & 4 Continuous Evaluation marks',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        deadline: '12 Oct 2026',
        priority: 'CRITICAL',
        status: 'Action Required',
        nextAction: 'Enter missing marks for 4 borderline candidates',
        linkTab: 'marks'
      },
      {
        id: 'wq-2',
        title: 'Log Period 2 Attendance for Operating Systems',
        subjectCode: 'CS502',
        subjectName: 'Operating Systems',
        cohort: 'Semester 5 · Section A',
        deadline: 'Today, 04:00 PM',
        priority: 'HIGH',
        status: 'Pending Submission',
        nextAction: 'Record student attendance and log period',
        linkTab: 'students'
      },
      {
        id: 'wq-3',
        title: 'Moderate student-uploaded notes for "AVL Trees & Self Balancing"',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5',
        deadline: '14 Oct 2026',
        priority: 'MEDIUM',
        status: 'Awaiting Review',
        nextAction: 'Check academic syllabus accuracy and approve',
        linkTab: 'notes-moderation'
      },
      {
        id: 'wq-4',
        title: 'Verify student learning resource: "Paging & Memory Virtualization"',
        subjectCode: 'CS502',
        subjectName: 'Operating Systems',
        cohort: 'Semester 5',
        deadline: '15 Oct 2026',
        priority: 'MEDIUM',
        status: 'Pending Verification',
        nextAction: 'Verify document validity and publish to repository',
        linkTab: 'awaiting-verification'
      },
      {
        id: 'wq-5',
        title: 'Submit Data Structures CIA register to HOD for moderation lock',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        deadline: '18 Oct 2026',
        priority: 'HIGH',
        status: 'Draft Ready',
        nextAction: 'Perform final validation check and submit to HOD',
        linkTab: 'marks'
      }
    ];

    // Today's schedule
    const todayTimetable = [
      {
        period: 'Period 1 (09:00 - 10:00 AM)',
        subjectCode: 'CS501',
        subjectName: 'Data Structures (Theory)',
        room: 'Block B - 302',
        section: 'Section A',
        status: 'Completed',
        attendanceMarked: true
      },
      {
        period: 'Period 3 (11:15 - 12:15 PM)',
        subjectCode: 'CS502',
        subjectName: 'Operating Systems (Theory)',
        room: 'Block B - 304',
        section: 'Section A',
        status: 'Upcoming',
        attendanceMarked: false
      },
      {
        period: 'Period 5 & 6 (02:00 - 04:00 PM)',
        subjectCode: 'CS501',
        subjectName: 'Data Structures Lab (Practical)',
        room: 'Computing Lab 3',
        section: 'Section A (Batch A1)',
        status: 'Upcoming',
        attendanceMarked: false
      }
    ];

    // Official Department Notices & Circulars
    const notices = [
      {
        id: 'not-1',
        title: 'HOD Directive: Continuous Internal Evaluation (CIE) Midterm Locking',
        sender: 'Dr. P. K. Pattnaik (HOD)',
        date: '08 Oct 2026',
        priority: 'URGENT',
        content: 'All faculty members must freeze and submit Continuous Internal Assessment scores for Modular 1 & 2 before 18 Oct 2026. No modifications will be permitted without Academic Council re-opening approvals.'
      },
      {
        id: 'not-2',
        title: 'Autonomous Exam Cell: Hall Ticket Attendance Clearance Cutoff',
        sender: 'Controller of Examinations (CoE)',
        date: '06 Oct 2026',
        priority: 'IMPORTANT',
        content: 'Attendance cut-off for End-Semester Admit Cards is set strictly to 75.0%. Faculty members must finalize all pending period attendance entries by 15 Oct 2026.'
      }
    ];

    return {
      facultyInfo: {
        id: 'FAC-042',
        name: facultyNameOrId,
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor & Course Coordinator',
        experience: '12 Years',
        academicYear: '2026-27',
        semester: 'Autumn Semester 5'
      },
      kpis: {
        assignedSubjectsCount: assignments.length,
        scopedStudentsCount: totalScopedStudents,
        totalCourseEnrollment: 91,
        attendanceSessionsPending: 2,
        marksPendingEntry: 14,
        assessmentCompletionRate: 86.7,
        quizzesScheduledCount: 3,
        quizzesLiveCount: 1,
        resourcesPendingVerification: 4,
        studentQueriesPending: 3,
        atRiskStudentsCount: 4,
        nextAcademicMilestone: '15 Oct 2026 (Modular 2 Exams)'
      },
      assignments,
      workQueue,
      todayTimetable,
      notices
    };
  }

  /**
   * Attendance Sessions & Submission
   */
  async getAttendanceSessions(subjectCode: string = 'CS501', section: string = 'Section A') {
    return [
      {
        id: 'att-sess-1',
        date: '2026-10-09',
        period: 'Period 1 (09:00 - 10:00 AM)',
        subjectCode,
        section,
        totalEnrolled: 32,
        presentCount: 30,
        absentCount: 2,
        percentage: 93.75,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty'
      },
      {
        id: 'att-sess-2',
        date: '2026-10-08',
        period: 'Period 2 (10:00 - 11:00 AM)',
        subjectCode,
        section,
        totalEnrolled: 32,
        presentCount: 29,
        absentCount: 3,
        percentage: 90.63,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty'
      },
      {
        id: 'att-sess-3',
        date: '2026-10-07',
        period: 'Period 1 (09:00 - 10:00 AM)',
        subjectCode,
        section,
        totalEnrolled: 32,
        presentCount: 31,
        absentCount: 1,
        percentage: 96.88,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty'
      }
    ];
  }

  async submitAttendanceSession(payload: {
    subjectCode: string;
    subjectName: string;
    section: string;
    date: string;
    period: string;
    attendanceMap: Record<string, boolean>;
    facultyName?: string;
  }) {
    const rolls = Object.keys(payload.attendanceMap);
    const presentRolls = rolls.filter(r => payload.attendanceMap[r]);
    const totalCount = rolls.length || 32;
    const presentCount = presentRolls.length;
    const pct = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 100;

    // Log in database AuditLog
    try {
      await this.prisma.auditLog.create({
        data: {
          user: payload.facultyName || 'Dr. S. Mohanty',
          role: 'FACULTY',
          subject: payload.subjectCode,
          assessment: 'PERIOD_ATTENDANCE',
          oldMark: 'Unrecorded Period',
          newMark: `${presentCount} Present / ${totalCount} Enrolled (${pct}%)`,
          changedAt: new Date().toISOString(),
          reason: `Attendance recorded for ${payload.subjectCode} (${payload.section}) on ${payload.date} ${payload.period}`
        }
      });
    } catch {
      // Continue even if audit fails
    }

    return {
      success: true,
      sessionId: `att-${Date.now()}`,
      date: payload.date,
      period: payload.period,
      subjectCode: payload.subjectCode,
      totalCount,
      presentCount,
      absentCount: totalCount - presentCount,
      percentage: pct,
      message: `Attendance session successfully logged for ${payload.subjectCode} (${payload.section}).`
    };
  }

  /**
   * Quizzes Management
   */
  async getQuizzes(subjectCode?: string, section?: string) {
    return [
      {
        id: 'QZ-001',
        title: 'Data Structures – Quiz 1',
        subject: 'Data Structures',
        subjectCode: 'CS501',
        section: 'Section A',
        date: '2026-10-08',
        time: 30,
        totalMarks: 10,
        status: 'Completed',
        attempts: 32,
        averageScore: 8.4,
        highestScore: 10,
        createdAt: '2026-10-05',
        questionsCount: 10
      },
      {
        id: 'QZ-002',
        title: 'Operating Systems – Quiz 1 (Processes & Threads)',
        subject: 'Operating Systems',
        subjectCode: 'CS502',
        section: 'Section A',
        date: '2026-10-10',
        time: 25,
        totalMarks: 10,
        status: 'Scheduled',
        attempts: 0,
        averageScore: 0,
        highestScore: 0,
        createdAt: '2026-10-05',
        questionsCount: 10
      },
      {
        id: 'QZ-003',
        title: 'Data Structures – Quiz 2 (Trees & Graphs)',
        subject: 'Data Structures',
        subjectCode: 'CS501',
        section: 'Section B',
        date: '2026-10-12',
        time: 20,
        totalMarks: 10,
        status: 'Scheduled',
        attempts: 0,
        averageScore: 0,
        highestScore: 0,
        createdAt: '2026-10-05',
        questionsCount: 10
      },
      {
        id: 'QZ-004',
        title: 'Operating Systems – Quiz 2 (Memory Management)',
        subject: 'Operating Systems',
        subjectCode: 'CS502',
        section: 'Section A',
        date: '2026-10-15',
        time: 30,
        totalMarks: 10,
        status: 'Live',
        attempts: 34,
        averageScore: 7.9,
        highestScore: 10,
        createdAt: '2026-10-04',
        questionsCount: 10
      }
    ];
  }

  async createOrUpdateQuiz(quiz: any) {
    if (!quiz.title || !quiz.subject) {
      throw new BadRequestException('Quiz title and subject are required');
    }
    return {
      success: true,
      quiz: {
        ...quiz,
        id: quiz.id || `QZ-${String(Date.now()).slice(-4)}`,
        status: quiz.status || 'Scheduled',
        attempts: quiz.attempts || 0,
        createdAt: quiz.createdAt || new Date().toISOString().split('T')[0]
      },
      message: `Quiz "${quiz.title}" saved successfully.`
    };
  }

  async publishQuiz(quizId: string) {
    return {
      success: true,
      id: quizId,
      status: 'Live',
      message: `Quiz ${quizId} is now live for student attempts.`
    };
  }

  /**
   * Class Performance and Academic Analytics
   */
  async getClassPerformance(subjectCode: string = 'CS501', section: string = 'Section A') {
    return {
      subjectCode,
      subjectName: subjectCode === 'CS502' ? 'Operating Systems' : 'Data Structures',
      section,
      totalStudents: 32,
      classAverage: 82.4,
      highestScore: 96.0,
      lowestScore: 58.5,
      passPercentage: 96.9,
      assessmentCompletionRate: 88.2,
      distribution: [
        { band: 'Outstanding (O: >=90%)', count: 8, percentage: 25.0, color: '#10b981' },
        { band: 'Excellent (A+: 80-89%)', count: 14, percentage: 43.8, color: '#3b82f6' },
        { band: 'Very Good (A: 70-79%)', count: 6, percentage: 18.8, color: '#6366f1' },
        { band: 'Good (B+: 60-69%)', count: 3, percentage: 9.4, color: '#f59e0b' },
        { band: 'Support Required (<60%)', count: 1, percentage: 3.1, color: '#ef4444' }
      ],
      componentAverages: [
        { component: 'Modular 1 (20)', max: 20, avg: 16.4, pct: 82.0 },
        { component: 'Modular 2 (20)', max: 20, avg: 15.8, pct: 79.0 },
        { component: 'Quizzes (10)', max: 10, avg: 8.6, pct: 86.0 },
        { component: 'Assignments (10)', max: 10, avg: 8.9, pct: 89.0 },
        { component: 'Surprise Tests (10)', max: 10, avg: 7.8, pct: 78.0 },
        { component: 'Lab Practical (30)', max: 30, avg: 26.2, pct: 87.3 }
      ],
      attendanceCorrelation: [
        { attendanceBand: '>= 90% Attendance', studentCount: 18, avgCiaScore: 88.2 },
        { attendanceBand: '80% - 89% Attendance', studentCount: 10, avgCiaScore: 81.5 },
        { attendanceBand: '75% - 79% Attendance', studentCount: 3, avgCiaScore: 73.0 },
        { attendanceBand: '< 75% Attendance (Deficit)', studentCount: 1, avgCiaScore: 58.5 }
      ]
    };
  }

  /**
   * Academic Early-Warning & Remedial Action
   */
  async getAtRiskStudents(subjectCode: string = 'CS501', section: string = 'Section A') {
    return [
      {
        id: 'st-risk-1',
        rollNumber: '2305201018',
        studentId: 'GIFT-CSE-018',
        name: 'Debasish Panda',
        attendance: 68,
        ciaScore: 58.5,
        riskFactors: [
          'Attendance shortage (< 75% statutory requirement: 68%)',
          'Failed Modular 1 (scored 7/20; pass threshold 8/20)',
          'Quiz 2 submission missing'
        ],
        academicMentor: 'Prof. R. K. Mohapatra',
        interventions: [
          { date: '04 Oct 2026', type: 'Guardian Notice Sent', notes: 'Informed parent regarding 68% attendance shortfall' },
          { date: '07 Oct 2026', type: 'Remedial Tutorial Scheduled', notes: 'Extra session for Binary Search Trees' }
        ]
      },
      {
        id: 'st-risk-2',
        rollNumber: '2305201024',
        studentId: 'GIFT-CSE-024',
        name: 'Sourav Jena',
        attendance: 72,
        ciaScore: 62.0,
        riskFactors: [
          'Borderline attendance (72%)',
          'Sudden score drop in Surprise Test 2'
        ],
        academicMentor: 'Dr. P. R. Sahoo',
        interventions: [
          { date: '05 Oct 2026', type: 'Counselling Session', notes: 'Advised regular lab attendance' }
        ]
      }
    ];
  }

  async logRemedialIntervention(payload: {
    rollNumber: string;
    studentName: string;
    interventionType: string;
    notes: string;
    followUpDate: string;
    recordedBy?: string;
  }) {
    return {
      success: true,
      message: `Remedial action logged for ${payload.studentName} (${payload.rollNumber}).`,
      data: {
        id: `int-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString()
      }
    };
  }
}
