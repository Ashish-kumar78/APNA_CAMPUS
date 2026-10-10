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
      count: this.auditEvents.length,
      data: this.auditEvents,
    };
  }
}
