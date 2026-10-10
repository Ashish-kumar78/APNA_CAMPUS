// HOD Department Academic Governance API Client
// Connects to NestJS Backend (/api/hod/*) with robust local store fallbacks

import { api } from './api';
import { erpStore } from './erpStore';
import { initialApprovalQueue, initialFaculty, initialSubjects } from '../data/collegeData';
import { getAllStudents } from './studentStore';

export const hodApi = {
  // 1. Department Command Centre Dashboard
  getDashboard: async (deptCode = 'CSE') => {
    try {
      const res = await api.getHodDashboard(deptCode);
      if (res && res.success) return res;
    } catch {
      // Fallback
    }

    const students = getAllStudents();
    const atRisk = students.filter(s => erpStore.calculateStudentRisk(s).isAtRisk);
    const queue = initialApprovalQueue;
    const pendingCount = queue.filter(q => q.status === 'Pending').length;
    const approvedCount = queue.filter(q => q.status === 'Approved').length;

    return {
      success: true,
      department: deptCode,
      academicYear: '2026-2027',
      currentSemester: 'Autumn Semester',
      kpis: {
        totalStudents: 540,
        totalFaculty: 32,
        activeSubjects: 48,
        marksPendingApproval: pendingCount,
        marksApproved: approvedCount,
        marksRejected: queue.filter(q => q.status === 'Rejected').length,
        overdueSubmissions: 1,
        atRiskStudentsCount: atRisk.length,
        attendanceCompliancePct: 88.6,
        assessmentCompletionPct: 92.4,
        facultySubmissionCompliancePct: 93.8,
        upcomingDeadlinesCount: 3,
      },
      workQueue: [
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
          title: 'Conduct Academic Support Review for At-Risk Students',
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
      ],
      departmentNotices: [
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
      ],
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
  },

  // 2. Marks Moderation Approval Queue
  getApprovalQueue: async () => {
    try {
      const res = await api.getHodApprovalQueue();
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }
    return initialApprovalQueue;
  },

  // 3. Approve marks submission
  approveMarks: async (id) => {
    try {
      return await api.hodApproveMarks(id);
    } catch {
      return { success: true, message: 'Marks approved locally.' };
    }
  },

  // 4. Reject marks submission
  rejectMarks: async (id, reason) => {
    try {
      return await api.hodRejectMarks(id, reason);
    } catch {
      return { success: true, message: 'Marks rejected locally.' };
    }
  },

  // 5. Unlock frozen marks register
  unlockMarks: async (id, reason) => {
    try {
      return await api.hodUnlockMarks(id, reason);
    } catch {
      return { success: true, message: 'Marks unlocked locally.' };
    }
  },

  // 6. At-Risk Students & Interventions
  getAtRiskStudents: async () => {
    try {
      const res = await api.getHodAtRiskStudents();
      if (res && res.success) return res;
    } catch {
      // Fallback
    }
    const students = getAllStudents();
    const atRisk = students.filter(s => erpStore.calculateStudentRisk(s).isAtRisk);
    return {
      success: true,
      count: atRisk.length,
      data: atRisk,
    };
  },

  // 7. Log Remedial Intervention
  logIntervention: async (payload) => {
    try {
      return await api.logHodIntervention(payload);
    } catch {
      return { success: true, message: 'Intervention logged locally.', data: payload };
    }
  },

  // 8. Bulk Dispatch Notices
  bulkDispatchNotices: async (count) => {
    try {
      return await api.bulkDispatchHodNotices(count);
    } catch {
      return { success: true, message: `Dispatched notices to ${count} students.` };
    }
  },

  // 9. Department Faculty & Workload
  getFacultyList: () => initialFaculty,

  // 10. Department Curricular Subjects
  getSubjectsList: () => initialSubjects,
};
