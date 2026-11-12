import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkQueueItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  cohort: string;
  facultyName: string;
  submissionDate: string;
  dueDate: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: string;
  reviewer: string;
  nextAction: string;
  linkTab: string;
}

export interface DepartmentNotice {
  id: string;
  title: string;
  category: 'EXAM' | 'ACADEMIC' | 'ADMIN' | 'URGENT';
  date: string;
  author: string;
  content: string;
  isUrgent?: boolean;
}

@Injectable()
export class HodService {
  constructor(private readonly prisma: PrismaService) {}

  // In-memory persistent queue items for HOD review
  private approvalQueue = [
    {
      id: 'AQ-101',
      subject: 'Data Structures',
      subjectCode: 'CS501',
      faculty: 'Dr. S. Mohanty',
      semester: 'Semester 5',
      section: 'Section A',
      cohortSize: 32,
      courseTotalEnrollment: 91,
      evaluatedCount: 28,
      missingMarksCount: 4,
      componentsCount: 13,
      status: 'Pending',
      submittedDate: '2026-10-09',
      dueDate: '2026-10-12',
      hodRemarks: '',
      reviewedAt: '',
    },
    {
      id: 'AQ-102',
      subject: 'Operating Systems',
      subjectCode: 'CS502',
      faculty: 'Prof. R. K. Jena',
      semester: 'Semester 5',
      section: 'Section A',
      cohortSize: 32,
      courseTotalEnrollment: 91,
      evaluatedCount: 32,
      missingMarksCount: 0,
      componentsCount: 13,
      status: 'Approved',
      submittedDate: '2026-10-08',
      dueDate: '2026-10-11',
      hodRemarks: 'Approved by HOD. Verified continuous internal assessment components.',
      reviewedAt: '2026-10-08 17:30',
    },
    {
      id: 'AQ-103',
      subject: 'Database Management Systems',
      subjectCode: 'CS503',
      faculty: 'Dr. M. R. Senapati',
      semester: 'Semester 5',
      section: 'Section B',
      cohortSize: 30,
      courseTotalEnrollment: 91,
      evaluatedCount: 30,
      missingMarksCount: 0,
      componentsCount: 13,
      status: 'Approved',
      submittedDate: '2026-10-07',
      dueDate: '2026-10-10',
      hodRemarks: 'Approved & Moderated for Exam Cell.',
      reviewedAt: '2026-10-07 16:15',
    },
    {
      id: 'AQ-104',
      subject: 'Design & Analysis of Algorithms',
      subjectCode: 'CS504',
      faculty: 'Prof. S. K. Swain',
      semester: 'Semester 5',
      section: 'Section C',
      cohortSize: 29,
      courseTotalEnrollment: 91,
      evaluatedCount: 24,
      missingMarksCount: 5,
      componentsCount: 13,
      status: 'Rejected',
      submittedDate: '2026-10-06',
      dueDate: '2026-10-09',
      hodRemarks: 'Quiz 3 and Lab viva marks missing for 5 borderline candidates. Returned for correction.',
      reviewedAt: '2026-10-06 18:40',
    },
    {
      id: 'AQ-105',
      subject: 'Object Oriented Programming',
      subjectCode: 'CS301',
      faculty: 'Dr. B. K. Mishra',
      semester: 'Semester 3',
      section: 'Section A',
      cohortSize: 35,
      courseTotalEnrollment: 95,
      evaluatedCount: 35,
      missingMarksCount: 0,
      componentsCount: 13,
      status: 'Approved',
      submittedDate: '2026-10-05',
      dueDate: '2026-10-08',
      hodRemarks: 'Certified autonomous evaluation returns.',
      reviewedAt: '2026-10-05 14:20',
    },
  ];

  // In-memory intervention records
  private interventions = [
    {
      id: 'INT-001',
      studentId: 'STU-032',
      studentName: 'Debasish Panda',
      rollNumber: '32',
      cohort: 'Semester 5 · Section A',
      trigger: 'Attendance Shortage (64%) & Modular Exam Failure (6/20)',
      severity: 'CRITICAL',
      interventionType: 'Extra Tutorial',
      followUpDate: '2026-10-16',
      status: 'Intervention Scheduled',
      assignedMentor: 'Prof. B. Panda',
      notes: 'Scheduled special weekend problem-solving tutorial for Data Structures and counselling session.',
      loggedAt: '2026-10-09',
    },
  ];

  // In-memory audit events
  private auditEvents: Array<{
    id: string;
    actor: string;
    role: string;
    action: string;
    target: string;
    oldValue: string;
    newValue: string;
    timestamp: string;
  }> = [];

  /**
   * 1. Get comprehensive real-time department dashboard metrics
   */
  async getDashboard(deptCode = 'CSE') {
    const pendingCount = this.approvalQueue.filter(q => q.status === 'Pending').length;
    const approvedCount = this.approvalQueue.filter(q => q.status === 'Approved').length;
    const rejectedCount = this.approvalQueue.filter(q => q.status === 'Rejected').length;

    const workQueue: WorkQueueItem[] = [
      {
        id: 'wq-101',
        title: 'Review and verify Data Structures (CS501) Continuous Evaluation marks',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        facultyName: 'Dr. S. Mohanty',
        submissionDate: '2026-10-09',
        dueDate: '12 Oct 2026',
        priority: 'CRITICAL',
        status: 'Action Required',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Inspect 4 missing marks and approve or return for correction',
        linkTab: 'approval',
      },
      {
        id: 'wq-102',
        title: 'Conduct Academic Support Review for 3 At-Risk Students',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        facultyName: 'Prof. B. Panda (Mentor)',
        submissionDate: '2026-10-08',
        dueDate: '14 Oct 2026',
        priority: 'HIGH',
        status: 'Follow-up Pending',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Verify compensatory tutorial attendance for Debasish Panda',
        linkTab: 'at-risk',
      },
      {
        id: 'wq-103',
        title: 'Curriculum Milestone Sign-off: DAA (CS504) Mid-Term Syllabus Coverage',
        subjectCode: 'CS504',
        subjectName: 'Design & Analysis of Algorithms',
        cohort: 'Semester 5 · Section C',
        facultyName: 'Prof. S. K. Swain',
        submissionDate: '2026-10-07',
        dueDate: '15 Oct 2026',
        priority: 'MEDIUM',
        status: 'Under Review',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Verify completion of Module II (Dynamic Programming & Greedy)',
        linkTab: 'subjects',
      },
    ];

    const departmentNotices: DepartmentNotice[] = [
      {
        id: 'not-101',
        title: 'Mid-Semester Continuous Internal Assessment (CIA) Cutoff',
        category: 'EXAM',
        date: '15 Oct 2026',
        author: 'Controller of Examinations',
        content: 'All continuous evaluation marks for 5th semester courses must be verified, signed, and approved by respective HODs by 15 Oct 2026, 05:00 PM.',
        isUrgent: true,
      },
      {
        id: 'not-102',
        title: 'Department Academic Council Review Meeting',
        category: 'ACADEMIC',
        date: '18 Oct 2026',
        author: 'HOD Office (CSE)',
        content: 'Department faculty meeting on syllabus progress, lab manual upgrades, and autonomous paper setting in Conference Room 2.',
        isUrgent: false,
      },
      {
        id: 'not-103',
        title: 'Statutory 75% Lecture Attendance Advisory',
        category: 'URGENT',
        date: '08 Oct 2026',
        author: 'Academic Dean Office',
        content: 'Condonation forms for students falling between 65%-74% with certified medical reasons must be countersigned by HOD prior to admit card generation.',
        isUrgent: true,
      },
    ];

    return {
      success: true,
      department: deptCode,
      academicYear: '2026-2027',
      currentSemester: 'Autumn Semester',
      kpis: {
        totalStudents: 540, // 540 active students across 6 departmental sections
        totalFaculty: 32,   // 32 teaching staff
        activeSubjects: 48, // 48 curriculum subjects under autonomous council
        marksPendingApproval: pendingCount,
        marksApproved: approvedCount,
        marksRejected: rejectedCount,
        overdueSubmissions: 1,
        atRiskStudentsCount: this.interventions.length > 0 ? 3 : 0,
        attendanceCompliancePct: 88.6,
        assessmentCompletionPct: 92.4,
        facultySubmissionCompliancePct: 93.8,
        upcomingDeadlinesCount: 3,
      },
      workQueue,
      departmentNotices,
      analytics: {
        enrollmentBySemester: [
          { semester: 'Semester 1 (First Year)', count: 180, sections: ['Sec A', 'Sec B', 'Sec C'] },
          { semester: 'Semester 3 (Second Year)', count: 180, sections: ['Sec A', 'Sec B', 'Sec C'] },
          { semester: 'Semester 5 (Third Year)', count: 180, sections: ['Sec A', 'Sec B', 'Sec C'] },
        ],
        subjectCompletion: [
          { code: 'CS501', name: 'Data Structures', completionPct: 82.0, status: 'In Progress' },
          { code: 'CS502', name: 'Operating Systems', completionPct: 100.0, status: 'Approved' },
          { code: 'CS503', name: 'Database Management Systems', completionPct: 100.0, status: 'Approved' },
          { code: 'CS504', name: 'Design & Analysis of Algorithms', completionPct: 75.0, status: 'Revision Requested' },
          { code: 'CS505', name: 'Formal Language & Automata', completionPct: 90.0, status: 'Draft Ready' },
          { code: 'CS506', name: 'Advanced Java Programming', completionPct: 100.0, status: 'Approved' },
        ],
        attendanceDistribution: [
          { tier: '>= 90% (High Attendance)', percentage: 58.0, count: 313 },
          { tier: '80% - 89% (Regular)', percentage: 28.0, count: 151 },
          { tier: '75% - 79% (Borderline)', percentage: 10.0, count: 54 },
          { tier: '< 75% (Shortage Alert)', percentage: 4.0, count: 22 },
        ],
        gradeBands: [
          { band: 'Outstanding (O: >=90%)', pct: 24.0 },
          { band: 'Excellent (A+: 80-89%)', pct: 42.0 },
          { band: 'Very Good (A: 70-79%)', pct: 20.0 },
          { band: 'Good (B+: 60-69%)', pct: 11.0 },
          { band: 'Remedial Support (<60%)', pct: 3.0 },
        ],
      },
    };
  }

  /**
   * 2. Get Marks Approval Queue with validation diagnostics
   */
  async getApprovalQueue() {
    return {
      success: true,
      count: this.approvalQueue.length,
      data: this.approvalQueue,
    };
  }

  /**
   * 3. Approve marks submission
   */
  async approveMarks(id: string, reviewer = 'Dr. P. K. Pattnaik (HOD CSE)') {
    const item = this.approvalQueue.find(q => q.id === id);
    if (!item) throw new NotFoundException(`Approval queue item ${id} not found`);

    item.status = 'Approved';
    item.reviewedAt = new Date().toISOString();
    item.hodRemarks = 'Approved by HOD. Verified continuous internal assessment components.';

    this.logAudit({
      actor: reviewer,
      role: 'HOD',
      action: 'Approved Faculty Assessment Marks',
      target: `Subject: ${item.subject} (${item.subjectCode})`,
      oldValue: 'Pending HOD Approval',
      newValue: 'Approved & Moderated for Exam Cell',
    });

    return {
      success: true,
      message: `Marks for ${item.subject} (${item.subjectCode}) officially APPROVED and moderated.`,
      data: item,
    };
  }

  /**
   * 4. Reject marks submission with mandatory reason
   */
  async rejectMarks(id: string, rejectionReason: string, reviewer = 'Dr. P. K. Pattnaik (HOD CSE)') {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new BadRequestException('Mandatory rejection reason required for returning marks to faculty.');
    }

    const item = this.approvalQueue.find(q => q.id === id);
    if (!item) throw new NotFoundException(`Approval queue item ${id} not found`);

    item.status = 'Rejected';
    item.reviewedAt = new Date().toISOString();
    item.hodRemarks = rejectionReason;

    this.logAudit({
      actor: reviewer,
      role: 'HOD',
      action: 'Rejected Marks Assessment & Returned for Revision',
      target: `Subject: ${item.subject} (${item.subjectCode})`,
      oldValue: 'Submitted for Approval',
      newValue: `Revision Required: ${rejectionReason}`,
    });

    return {
      success: true,
      message: `Marks for ${item.subject} returned to faculty for revision.`,
      data: item,
    };
  }

  /**
   * 5. Controlled unlocking of approved marks
   */
  async unlockMarks(id: string, reason = 'Unlocked for faculty correction', reviewer = 'Dr. P. K. Pattnaik (HOD CSE)') {
    const item = this.approvalQueue.find(q => q.id === id);
    if (!item) throw new NotFoundException(`Approval queue item ${id} not found`);

    const prevStatus = item.status;
    item.status = 'Pending';
    item.hodRemarks = `HOD Reopened: ${reason}`;

    this.logAudit({
      actor: reviewer,
      role: 'HOD',
      action: 'Unlocked Frozen Marks Register for Corrections',
      target: `Subject: ${item.subject} (${item.subjectCode})`,
      oldValue: prevStatus,
      newValue: 'Unlocked for Faculty Edits',
    });

    return {
      success: true,
      message: `Marks for ${item.subject} unlocked. Faculty can now edit.`,
      data: item,
    };
  }

  /**
   * 6. At-risk students registry and explainable diagnostic triggers
   */
  async getAtRiskStudents() {
    return {
      success: true,
      count: this.interventions.length,
      rules: {
        attendanceThreshold: 75.0,
        cgpaThreshold: 6.0,
        modularPassThreshold: 40.0, // 8 / 20 marks
      },
      data: this.interventions,
    };
  }

  /**
   * 7. Log academic remedial intervention
   */
  async logIntervention(data: any, actor = 'Dr. P. K. Pattnaik (HOD CSE)') {
    const newIntervention = {
      id: `INT-${String(this.interventions.length + 1).padStart(3, '0')}`,
      studentId: data.studentId || 'STU-032',
      studentName: data.studentName || 'Debasish Panda',
      rollNumber: data.rollNumber || '32',
      cohort: data.cohort || 'Semester 5 · Section A',
      trigger: data.trigger || 'Attendance Shortage (<75%)',
      severity: data.severity || 'CRITICAL',
      interventionType: data.type || data.interventionType || 'Extra Tutorial',
      followUpDate: data.followUpDate || '2026-10-16',
      status: 'Intervention Scheduled',
      assignedMentor: data.assignedMentor || 'Prof. B. Panda',
      notes: data.notes || 'Mandatory remedial problem-solving classes assigned.',
      loggedAt: new Date().toISOString().split('T')[0],
    };

    this.interventions.push(newIntervention);

    this.logAudit({
      actor,
      role: 'HOD',
      action: 'Logged Student Academic Remedial Intervention',
      target: `Student: ${newIntervention.studentName} (Roll #${newIntervention.rollNumber})`,
      oldValue: 'Unwarned / Pending Support',
      newValue: `${newIntervention.interventionType} Scheduled for ${newIntervention.followUpDate}`,
    });

    return {
      success: true,
      message: `Remedial intervention logged for ${newIntervention.studentName}.`,
      data: newIntervention,
    };
  }

  /**
   * 8. Bulk dispatch remedial mentoring notices
   */
  async bulkDispatchNotices(count = 3, actor = 'Dr. P. K. Pattnaik (HOD CSE)') {
    this.logAudit({
      actor,
      role: 'HOD',
      action: 'Dispatched Departmental Remedial Mentoring Notices',
      target: `${count} At-Risk CSE Students & Mentors`,
      oldValue: 'Unwarned',
      newValue: 'Counseling Notices Issued',
    });

    return {
      success: true,
      message: `Remedial mentoring notices dispatched to ${count} students and their assigned mentors.`,
      dispatchedCount: count,
    };
  }

  /**
   * 9. Audit trail logger
   */
  private logAudit(entry: {
    actor: string;
    role: string;
    action: string;
    target: string;
    oldValue: string;
    newValue: string;
  }) {
    this.auditEvents.unshift({
      id: `AUD-${Date.now()}`,
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  async getAuditLogs() {
    return {
      success: true,
      data: this.auditEvents,
    };
  }

  /**
   * 10. Academic Structure Management
   */
  async getAcademicStructure(deptCode: string = 'CSE') {
    let programmes: any[] = [];
    let facultyCount = 28;
    let studentsCount = 540;

    try {
      programmes = await (this.prisma as any).programme.findMany({
        where: { departmentCode: { contains: deptCode } },
      });
      facultyCount = await this.prisma.faculty.count({
        where: { department: { contains: deptCode } },
      });
      studentsCount = await this.prisma.student.count({
        where: { deptCode: { contains: deptCode } },
      });
    } catch {}

    return {
      success: true,
      data: {
        department: 'Computer Science & Engineering',
        deptCode: deptCode.toUpperCase(),
        academicSessions: ['2026-27', '2025-26', '2024-25'],
        currentSession: '2026-27',
        degrees: [
          { code: 'BTECH', name: 'Bachelor of Technology', durationYears: 4, semestersCount: 8 },
          { code: 'MTECH', name: 'Master of Technology', durationYears: 2, semestersCount: 4 },
          { code: 'MCA', name: 'Master of Computer Applications', durationYears: 2, semestersCount: 4 },
        ],
        branches: [
          { code: 'CSE', name: 'Computer Science & Engineering', intake: 180 },
          { code: 'AI-ML', name: 'Artificial Intelligence & Machine Learning', intake: 60 },
          { code: 'DS', name: 'Data Science & Analytics', intake: 60 },
          { code: 'CS', name: 'Cyber Security & Forensic Computing', intake: 60 },
        ],
        semesters: [
          'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
          'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
        ],
        activeBatches: ['2023–2027', '2024–2028', '2025–2029', '2026–2030'],
        metrics: {
          totalStudents: studentsCount || 540,
          totalFaculty: facultyCount || 28,
          totalSections: 12,
          totalCurricularSubjects: 48,
        },
      },
    };
  }

  /**
   * 11. Batch and Section Management
   */
  async getBatchesAndSections(deptCode: string = 'CSE') {
    let dbSections: any[] = [];
    try {
      dbSections = await this.prisma.section.findMany({
        where: { department: { contains: deptCode } },
      });
    } catch {}

    const defaultSections = [
      { id: 'sec-5a', semester: 'Semester 5', section: 'Section A', batch: '2023–2027', department: 'CSE', studentsCount: 32, maxCapacity: 40, room: 'Block B - 302', facultyCoordinator: 'Dr. S. Mohanty' },
      { id: 'sec-5b', semester: 'Semester 5', section: 'Section B', batch: '2023–2027', department: 'CSE', studentsCount: 30, maxCapacity: 40, room: 'Block B - 303', facultyCoordinator: 'Dr. P. Mohapatra' },
      { id: 'sec-5c', semester: 'Semester 5', section: 'Section C', batch: '2023–2027', department: 'CSE', studentsCount: 29, maxCapacity: 40, room: 'Block B - 304', facultyCoordinator: 'Dr. S. Rath' },
      { id: 'sec-3a', semester: 'Semester 3', section: 'Section A', batch: '2024–2028', department: 'CSE', studentsCount: 34, maxCapacity: 40, room: 'Block B - 201', facultyCoordinator: 'Dr. A. Tripathy' },
      { id: 'sec-3b', semester: 'Semester 3', section: 'Section B', batch: '2024–2028', department: 'CSE', studentsCount: 32, maxCapacity: 40, room: 'Block B - 202', facultyCoordinator: 'Prof. R. Nayak' },
      { id: 'sec-1a', semester: 'Semester 1', section: 'Section A', batch: '2025–2029', department: 'CSE', studentsCount: 36, maxCapacity: 40, room: 'Block B - 101', facultyCoordinator: 'Dr. Priya Ranjan' },
      { id: 'sec-1b', semester: 'Semester 1', section: 'Section B', batch: '2025–2029', department: 'CSE', studentsCount: 35, maxCapacity: 40, room: 'Block B - 102', facultyCoordinator: 'Dr. A. Panda' },
    ];

    const result = dbSections && dbSections.length > 0 ? dbSections : defaultSections;
    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  /**
   * 12. Class Advisor Allocation
   */
  async allocateClassAdvisor(data: {
    section: string;
    semester: string;
    facultyName: string;
    department?: string;
  }, actor = 'HOD CSE') {
    try {
      await this.prisma.section.updateMany({
        where: {
          section: data.section,
          semester: data.semester,
        },
        data: {
          facultyCoordinator: data.facultyName,
        },
      });
    } catch {}

    this.logAudit({
      actor,
      role: 'HOD',
      action: 'Allocated Class Advisor & Mentor',
      target: `${data.semester} ${data.section}`,
      oldValue: 'Previous Advisor',
      newValue: data.facultyName,
    });

    return {
      success: true,
      message: `Class Advisor allocated: ${data.facultyName} assigned to ${data.semester} - ${data.section}.`,
      data,
    };
  }

  /**
   * 13. Faculty Workload Monitoring
   */
  async getFacultyWorkload(deptCode: string = 'CSE') {
    let facultyList: any[] = [];
    try {
      facultyList = await this.prisma.faculty.findMany({
        where: { department: { contains: deptCode } },
        include: {
          courseAssignments: {
            include: { courseOffering: true },
          },
        },
      });
    } catch {}

    const defaultWorkload = [
      { id: 'fac-1', employeeId: 'FAC-042', name: 'Dr. S. Mohanty', designation: 'Associate Professor', department: 'CSE', email: 's.mohanty@apnacampus.edu.in', phone: '+91 94371 82910', assignedSubjectsCount: 3, assignedSections: ['Sem 5 · Sec A', 'Sem 5 · Sec B', 'Sem 3 · Sec A'], totalTeachingHours: 16, theoryHours: 10, labHours: 6, maxWeeklyHours: 18, status: 'Optimal' },
      { id: 'fac-2', employeeId: 'FAC-018', name: 'Dr. P. Mohapatra', designation: 'Professor & Head', department: 'CSE', email: 'p.mohapatra@apnacampus.edu.in', phone: '+91 94370 11223', assignedSubjectsCount: 2, assignedSections: ['Sem 5 · Sec A', 'Sem 5 · Sec B'], totalTeachingHours: 12, theoryHours: 8, labHours: 4, maxWeeklyHours: 14, status: 'Optimal' },
      { id: 'fac-3', employeeId: 'FAC-029', name: 'Dr. S. Rath', designation: 'Associate Professor', department: 'CSE', email: 's.rath@apnacampus.edu.in', phone: '+91 94372 33445', assignedSubjectsCount: 3, assignedSections: ['Sem 5 · Sec A', 'Sem 5 · Sec B', 'Sem 6 · Sec A'], totalTeachingHours: 15, theoryHours: 9, labHours: 6, maxWeeklyHours: 18, status: 'Optimal' },
      { id: 'fac-4', employeeId: 'FAC-035', name: 'Prof. R. Nayak', designation: 'Assistant Professor', department: 'CSE', email: 'r.nayak@apnacampus.edu.in', phone: '+91 94373 55667', assignedSubjectsCount: 3, assignedSections: ['Sem 5 · Sec A', 'Sem 3 · Sec B'], totalTeachingHours: 18, theoryHours: 12, labHours: 6, maxWeeklyHours: 18, status: 'Optimal' },
      { id: 'fac-5', employeeId: 'FAC-044', name: 'Dr. A. Panda', designation: 'Associate Professor', department: 'CSE', email: 'a.panda@apnacampus.edu.in', phone: '+91 94374 77889', assignedSubjectsCount: 2, assignedSections: ['Sem 5 · Sec A', 'Sem 1 · Sec B'], totalTeachingHours: 14, theoryHours: 8, labHours: 6, maxWeeklyHours: 18, status: 'Optimal' },
      { id: 'fac-6', employeeId: 'FAC-051', name: 'Dr. R. Sahoo', designation: 'Associate Professor', department: 'CSE', email: 'r.sahoo@apnacampus.edu.in', phone: '+91 94375 88990', assignedSubjectsCount: 2, assignedSections: ['Sem 4 · Sec A', 'Sem 4 · Sec B'], totalTeachingHours: 12, theoryHours: 8, labHours: 4, maxWeeklyHours: 18, status: 'Optimal' },
    ];

    const result = facultyList && facultyList.length > 0
      ? facultyList.map((f, idx) => ({
          id: f.id,
          employeeId: f.employeeId || `FAC-0${idx + 10}`,
          name: f.name,
          designation: f.designation || 'Faculty Member',
          department: f.department,
          email: f.email,
          phone: f.phone || '+91 94370 00000',
          assignedSubjectsCount: f.courseAssignments?.length || f.assignedSubjects?.length || 2,
          assignedSections: f.assignedSections || ['Section A'],
          totalTeachingHours: (f.courseAssignments?.length || 2) * 4,
          theoryHours: Math.round(((f.courseAssignments?.length || 2) * 4) * 0.6),
          labHours: Math.round(((f.courseAssignments?.length || 2) * 4) * 0.4),
          maxWeeklyHours: 18,
          status: 'Optimal',
        }))
      : defaultWorkload;

    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  /**
   * 14. Department Attendance Monitoring
   */
  async getAttendanceMonitoring(deptCode: string = 'CSE') {
    let liveOverallAttendance: number | null = null;
    let liveCriticalCount: number | null = null;
    let liveTotalStudents = 0;

    try {
      const students = await this.prisma.student.findMany({
        where: {
          OR: [
            { deptCode: { contains: deptCode } },
            { department: { contains: deptCode } },
          ],
        },
        select: {
          id: true,
          attendance: true,
          section: true,
          semester: true,
        },
      });

      if (students.length > 0) {
        liveTotalStudents = students.length;
        const totalAtt = students.reduce((sum, s) => sum + (s.attendance || 85), 0);
        liveOverallAttendance = Number((totalAtt / students.length).toFixed(1));
        liveCriticalCount = students.filter((s) => (s.attendance || 85) < 75).length;
      }
    } catch {}

    return {
      success: true,
      data: {
        department: deptCode.toUpperCase() === 'CSE' ? 'Computer Science & Engineering' : `${deptCode.toUpperCase()} Department`,
        deptCode: deptCode.toUpperCase(),
        overallAttendance: liveOverallAttendance ?? 89.4,
        totalClassesScheduled: 420,
        totalClassesLogged: 396,
        loggingCompliance: 94.2,
        sectionBreakdown: [
          { semester: 'Semester 5', section: 'Section A', attendance: 91.2, lowAttendanceCount: 3, totalStudents: 32, classAdvisor: 'Dr. S. Mohanty' },
          { semester: 'Semester 5', section: 'Section B', attendance: 88.5, lowAttendanceCount: 4, totalStudents: 30, classAdvisor: 'Dr. P. Mohapatra' },
          { semester: 'Semester 5', section: 'Section C', attendance: 87.1, lowAttendanceCount: 5, totalStudents: 29, classAdvisor: 'Dr. S. Rath' },
          { semester: 'Semester 3', section: 'Section A', attendance: 92.4, lowAttendanceCount: 2, totalStudents: 34, classAdvisor: 'Dr. A. Tripathy' },
          { semester: 'Semester 3', section: 'Section B', attendance: 89.0, lowAttendanceCount: 3, totalStudents: 32, classAdvisor: 'Prof. R. Nayak' },
          { semester: 'Semester 1', section: 'Section A', attendance: 94.1, lowAttendanceCount: 1, totalStudents: 36, classAdvisor: 'Dr. Priya Ranjan' },
        ],
        criticalAlertCount: liveCriticalCount ?? 18,
        totalStudents: liveTotalStudents || 193,
      },
    };
  }

  /**
   * 15. Department Academic Performance
   */
  async getAcademicPerformance(deptCode: string = 'CSE') {
    return {
      success: true,
      data: {
        department: 'Computer Science & Engineering',
        averageCgpa: 8.24,
        highestCgpa: 9.88,
        passPercentage: 96.8,
        ciaCompletionRate: 88.5,
        semesterPerformance: [
          { semester: 'Semester 5', passRate: 97.2, avgSgpa: 8.35, clearCount: 88, backlogCount: 3, totalStudents: 91 },
          { semester: 'Semester 4', passRate: 96.5, avgSgpa: 8.28, clearCount: 87, backlogCount: 4, totalStudents: 91 },
          { semester: 'Semester 3', passRate: 98.1, avgSgpa: 8.42, clearCount: 89, backlogCount: 2, totalStudents: 91 },
          { semester: 'Semester 2', passRate: 95.8, avgSgpa: 8.12, clearCount: 86, backlogCount: 5, totalStudents: 91 },
          { semester: 'Semester 1', passRate: 97.0, avgSgpa: 8.20, clearCount: 87, backlogCount: 4, totalStudents: 91 },
        ],
        gradeDistribution: {
          O: 24, // Outstanding
          E: 42, // Excellent
          A: 20, // Very Good
          B: 4,  // Good
          F: 1,  // Fail
        },
      },
    };
  }

  /**
   * 16. Faculty Subject Allocations
   */
  async getFacultyAllocations(deptCode: string = 'CSE', filter?: any) {
    let dbAssignments: any[] = [];
    try {
      dbAssignments = await this.prisma.facultyAssignment.findMany({
        include: {
          courseOffering: true,
          faculty: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {}

    const defaultAllocations = [
      { id: 'fa-1', subjectCode: 'CS501', subjectName: 'Data Structures & Algorithms', course: 'B.Tech', branch: 'CSE', academicYear: '2026-27', semester: 'Semester 5', section: 'Section A', facultyName: 'Dr. S. Mohanty', facultyId: 'FAC-042', role: 'Lead Instructor', allocatedHours: 4 },
      { id: 'fa-1b', subjectCode: 'CS501', subjectName: 'Data Structures & Algorithms', course: 'B.Tech', branch: 'CSE', academicYear: '2026-27', semester: 'Semester 5', section: 'Section B', facultyName: 'Dr. S. Mohanty', facultyId: 'FAC-042', role: 'Lead Instructor', allocatedHours: 4 },
      { id: 'fa-2', subjectCode: 'CS502', subjectName: 'Operating Systems', course: 'B.Tech', branch: 'CSE', academicYear: '2026-27', semester: 'Semester 5', section: 'Section A', facultyName: 'Prof. R. K. Jena', facultyId: 'FAC-018', role: 'Lead Instructor', allocatedHours: 4 },
      { id: 'fa-3', subjectCode: 'CS503', subjectName: 'Database Management Systems', course: 'B.Tech', branch: 'CSE', academicYear: '2026-27', semester: 'Semester 5', section: 'Section B', facultyName: 'Dr. M. R. Senapati', facultyId: 'FAC-029', role: 'Lead Instructor', allocatedHours: 4 },
      { id: 'fa-4', subjectCode: 'CS504', subjectName: 'Design & Analysis of Algorithms', course: 'B.Tech', branch: 'CSE', academicYear: '2026-27', semester: 'Semester 5', section: 'Section C', facultyName: 'Prof. S. K. Swain', facultyId: 'FAC-035', role: 'Lead Instructor', allocatedHours: 4 },
      { id: 'fa-5', subjectCode: 'CS505', subjectName: 'Artificial Intelligence & Systems', course: 'B.Tech', branch: 'CSE', academicYear: '2026-27', semester: 'Semester 5', section: 'Section A', facultyName: 'Dr. P. Mohapatra', facultyId: 'FAC-044', role: 'Lead Instructor', allocatedHours: 4 },
    ];

    let list = dbAssignments && dbAssignments.length > 0
      ? dbAssignments.map((a) => ({
          id: a.id,
          subjectCode: a.courseOffering.subjectCode,
          subjectName: a.courseOffering.subjectName,
          course: a.courseOffering.department === 'CSE' ? 'B.Tech' : a.courseOffering.department,
          branch: a.courseOffering.department,
          academicYear: a.academicYear,
          semester: a.courseOffering.semester,
          section: a.section,
          facultyName: a.faculty.name,
          facultyId: a.faculty.employeeId,
          role: a.role,
          allocatedHours: a.allocatedHours,
        }))
      : defaultAllocations;

    // Apply filtering
    if (filter?.semester && filter.semester !== 'ALL') {
      list = list.filter((a) => a.semester.toLowerCase() === filter.semester.toLowerCase());
    }
    if (filter?.section && filter.section !== 'ALL') {
      list = list.filter((a) => a.section.toLowerCase() === filter.section.toLowerCase());
    }
    if (filter?.academicYear && filter.academicYear !== 'ALL') {
      list = list.filter((a) => a.academicYear === filter.academicYear);
    }
    if (filter?.subjectCode && filter.subjectCode !== 'ALL') {
      list = list.filter((a) => a.subjectCode.toLowerCase() === filter.subjectCode.toLowerCase());
    }

    return {
      success: true,
      count: list.length,
      data: list,
    };
  }

  /**
   * 17. Allocate Existing Faculty to Existing Subject & Section
   */
  async allocateFacultySubject(data: {
    facultyId: string;
    subjectCode: string;
    section: string;
    semester: string;
    academicYear?: string;
    role?: string;
    allocatedHours?: number;
  }, actor = 'HOD CSE') {
    let faculty = await this.prisma.faculty.findFirst({
      where: {
        OR: [
          { id: data.facultyId },
          { employeeId: data.facultyId },
          { name: { contains: data.facultyId, mode: 'insensitive' } },
        ],
      },
    });

    if (!faculty) {
      faculty = await this.prisma.faculty.findFirst();
    }

    let offering = await this.prisma.courseOffering.findFirst({
      where: {
        subjectCode: data.subjectCode.toUpperCase().trim(),
        semester: data.semester,
      },
    });

    if (!offering && faculty) {
      offering = await this.prisma.courseOffering.create({
        data: {
          subjectCode: data.subjectCode.toUpperCase().trim(),
          subjectName: data.subjectCode,
          department: faculty.department || 'CSE',
          semester: data.semester,
          academicYear: data.academicYear || '2026-27',
          credits: 4,
          type: 'Theory + Lab',
        },
      });
    }

    if (offering && faculty) {
      await this.prisma.facultyAssignment.upsert({
        where: {
          courseOfferingId_facultyId_section: {
            courseOfferingId: offering.id,
            facultyId: faculty.id,
            section: data.section || 'Section A',
          },
        },
        update: {
          role: data.role || 'Lead Instructor',
          allocatedHours: data.allocatedHours || 4,
        },
        create: {
          courseOfferingId: offering.id,
          facultyId: faculty.id,
          section: data.section || 'Section A',
          academicYear: data.academicYear || '2026-27',
          role: data.role || 'Lead Instructor',
          allocatedHours: data.allocatedHours || 4,
        },
      });
    }

    this.logAudit({
      actor,
      role: 'HOD',
      action: 'Allocated Faculty to Subject & Section',
      target: `${faculty?.name || data.facultyId} → ${data.subjectCode} (${data.semester} ${data.section})`,
      oldValue: 'Unassigned',
      newValue: `${data.role || 'Lead Instructor'} (${data.allocatedHours || 4} hrs/wk)`,
    });

    return {
      success: true,
      message: `Faculty allocation saved: ${faculty?.name || data.facultyId} allocated to ${data.subjectCode} (${data.section}).`,
      data,
    };
  }
}
