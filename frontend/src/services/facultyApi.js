// Faculty Portal Enterprise Service Layer
// Connects to NestJS Backend (/api/faculty/*) with erpStore fallback

import { api } from './api';
import { erpStore } from './erpStore';

export const facultyApi = {
  // 1. Dashboard & Work Queue
  getDashboardData: async (facultyName = 'Dr. S. Mohanty') => {
    try {
      const res = await api.getFacultyDashboard();
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback to local store
    }

    const assignments = erpStore.getFacultyAssignedClasses(facultyName);
    return {
      facultyInfo: {
        id: 'FAC-042',
        name: facultyName,
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor & Course Coordinator',
        experience: '12 Years',
        academicYear: '2026-27',
        semester: 'Autumn Semester 5'
      },
      kpis: {
        assignedSubjectsCount: assignments.length || 3,
        scopedStudentsCount: 32,
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
      workQueue: [
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
      ],
      todayTimetable: [
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
      ],
      notices: [
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
      ]
    };
  },

  // 2. Attendance Logging & Session History
  getAttendanceSessions: async (subjectCode = 'CS501', section = 'Section A') => {
    try {
      const res = await api.getFacultyAttendanceSessions(subjectCode, section);
      if (res && res.success && Array.isArray(res.data)) return res.data;
    } catch {
      // Fallback
    }
    // Check localStorage cache
    try {
      const cached = localStorage.getItem('apna_campus_attendance_sessions');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'att-sess-1',
        date: '2026-10-09',
        period: '10:30 AM to 11:30 AM',
        subjectCode: subjectCode || 'CS501',
        subjectName: 'Data Structures & Algorithms',
        course: 'B.Tech',
        batch: '2023–2027',
        branch: 'CSE',
        section: section || 'Section A',
        activityType: 'Regular Class',
        activityDetails: '',
        topicsCovered: 'AVL Trees, Rotations & Balance Factors',
        totalEnrolled: 32,
        presentCount: 30,
        absentCount: 2,
        percentage: 93.75,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty',
        submittedAt: '11:32 AM'
      },
      {
        id: 'att-sess-2',
        date: '2026-10-08',
        period: '02:00 PM to 04:00 PM',
        subjectCode: subjectCode || 'CS501',
        subjectName: 'Data Structures & Algorithms',
        course: 'B.Tech',
        batch: '2023–2027',
        branch: 'CSE',
        section: section || 'Section A',
        activityType: 'Seminar',
        activityDetails: 'Guest Technical Seminar on "Distributed Graph Databases & High-Performance Concurrency" by Dr. K. Sharma (Visiting Scientist)',
        topicsCovered: 'Distributed Graph Traversal & Large-Scale Indexing',
        totalEnrolled: 32,
        presentCount: 29,
        absentCount: 3,
        percentage: 90.63,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty',
        submittedAt: '04:05 PM'
      },
      {
        id: 'att-sess-3',
        date: '2026-10-07',
        period: '09:00 AM to 10:00 AM',
        subjectCode: 'CS502',
        subjectName: 'Operating Systems',
        course: 'B.Tech',
        batch: '2023–2027',
        branch: 'CSE',
        section: section || 'Section A',
        activityType: 'Internal Examination',
        activityDetails: 'Continuous Internal Assessment 1 (CIA-I) — Units 1 & 2 (Max Marks: 30)',
        topicsCovered: 'Process Scheduling, Deadlocks & Memory Management Unit Test',
        totalEnrolled: 32,
        presentCount: 31,
        absentCount: 1,
        percentage: 96.88,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty',
        submittedAt: '10:02 AM'
      },
      {
        id: 'att-sess-4',
        date: '2026-10-05',
        period: '11:15 AM to 12:15 PM',
        subjectCode: subjectCode || 'CS501',
        subjectName: 'Data Structures & Algorithms',
        course: 'B.Tech',
        batch: '2023–2027',
        branch: 'CSE',
        section: section || 'Section A',
        activityType: 'Semester Examination',
        activityDetails: 'Autonomous Mid-Semester Practical Viva & Lab Examination Slot B',
        topicsCovered: 'Practical Graph & Tree Implementation Evaluation',
        totalEnrolled: 32,
        presentCount: 32,
        absentCount: 0,
        percentage: 100.0,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty',
        submittedAt: '12:20 PM'
      },
      {
        id: 'att-sess-5',
        date: '2026-10-03',
        period: '03:00 PM to 04:30 PM',
        subjectCode: subjectCode || 'CS501',
        subjectName: 'Data Structures & Algorithms',
        course: 'B.Tech',
        batch: '2023–2027',
        branch: 'CSE',
        section: section || 'Section A',
        activityType: 'Other Academic Activity',
        activityDetails: 'Departmental Hackathon & Project Architecture Review Mentoring Session',
        topicsCovered: 'Code Review & Performance Profiling of Student Projects',
        totalEnrolled: 32,
        presentCount: 28,
        absentCount: 4,
        percentage: 87.5,
        status: 'Finalized',
        recordedBy: 'Dr. S. Mohanty',
        submittedAt: '04:35 PM'
      }
    ];
  },

  submitAttendanceSession: async (payload) => {
    try {
      const res = await api.submitFacultyAttendance(payload);
      if (res && res.success) return res;
    } catch {
      // Fallback
    }
    const rolls = Object.keys(payload.attendanceMap || {});
    const presentCount = rolls.filter(r => payload.attendanceMap[r]).length;
    const totalCount = rolls.length || 32;
    const activityType = payload.activityType || 'Regular Class';
    const activityDetails = payload.activityDetails || '';
    const pct = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 100;
    const periodDisplay = payload.period || payload.classTime || (payload.fromTime && payload.toTime ? `${payload.fromTime} to ${payload.toTime}` : 'Regular Class Hours');

    const sessionObj = {
      id: `att-${Date.now()}`,
      date: payload.date,
      period: periodDisplay,
      subjectCode: payload.subjectCode || 'CS501',
      subjectName: payload.subjectName || (payload.subjectCode === 'CS502' ? 'Operating Systems' : 'Data Structures & Algorithms'),
      course: payload.course || 'B.Tech',
      batch: payload.batch || '2023–2027',
      branch: payload.branch || 'CSE',
      section: payload.section || 'Section A',
      activityType,
      activityDetails,
      topicsCovered: payload.topicsCovered || '',
      totalEnrolled: totalCount,
      presentCount,
      absentCount: totalCount - presentCount,
      percentage: pct,
      status: 'Finalized',
      recordedBy: payload.facultyName || 'Dr. S. Mohanty',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Store in localStorage cache
    try {
      const cached = localStorage.getItem('apna_campus_attendance_sessions');
      const list = cached ? JSON.parse(cached) : [];
      list.unshift(sessionObj);
      localStorage.setItem('apna_campus_attendance_sessions', JSON.stringify(list.slice(0, 30)));
    } catch {}

    return {
      success: true,
      sessionId: sessionObj.id,
      session: sessionObj,
      presentCount,
      totalCount,
      activityType,
      activityDetails,
      message: `Attendance logged for ${payload.subjectCode || 'class'} [${activityType}]: ${presentCount}/${totalCount} students present.`
    };
  },

  // 3. Class Performance Analytics
  getClassPerformance: async (subjectCode = 'CS501', section = 'Section A') => {
    try {
      const res = await api.getFacultyPerformance(subjectCode, section);
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }

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
  },

  // 4. Early-Warning & Remedial Action
  logRemedialIntervention: async (payload) => {
    try {
      const res = await api.logFacultyIntervention(payload);
      if (res && res.success) return res;
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: `Remedial intervention logged for ${payload.studentName} (${payload.rollNumber}).`
    };
  }
};
