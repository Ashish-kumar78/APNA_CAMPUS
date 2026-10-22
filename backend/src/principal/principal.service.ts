import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrincipalService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. CAMPUS OVERVIEW
  async getOverview(academicYear = '2026-27') {
    const totalStudents = await this.prisma.student.count();
    const totalFaculty = await this.prisma.user.count({ where: { role: 'FACULTY' } });
    const totalStaff = await this.prisma.user.count({
      where: {
        role: {
          in: ['STAFF', 'WARDEN', 'CANTEEN', 'TRANSPORT', 'MAINTENANCE', 'ACCOUNTS', 'LIBRARY', 'EXAM_CELL', 'PLACEMENT', 'ADMIN', 'HOD'],
        },
      },
    });

    const pendingApprovalsCount = await this.prisma.workflowRequest.count({
      where: { status: { in: ['Pending', 'Under Review'] } },
    });

    const departments = [
      { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. P. K. Pattnaik', students: 540, faculty: 32, facultyOnDuty: 31, syllabusPace: 74, status: 'On Schedule', avgCgpa: 8.42, attendance: 91.2 },
      { code: 'AIML', name: 'AI & Machine Learning', hod: 'Dr. S. K. Swain', students: 360, faculty: 22, facultyOnDuty: 21, syllabusPace: 72, status: 'On Schedule', avgCgpa: 8.28, attendance: 89.8 },
      { code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. M. R. Senapati', students: 380, faculty: 24, facultyOnDuty: 24, syllabusPace: 71, status: 'On Schedule', avgCgpa: 8.10, attendance: 88.6 },
      { code: 'EEE', name: 'Electrical & Electronics', hod: 'Dr. S. K. Das', students: 290, faculty: 18, facultyOnDuty: 18, syllabusPace: 69, status: 'On Schedule', avgCgpa: 7.85, attendance: 87.4 },
      { code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. B. K. Rout', students: 320, faculty: 22, facultyOnDuty: 20, syllabusPace: 68, status: 'Review Needed', avgCgpa: 7.68, attendance: 86.0 },
      { code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. A. K. Nayak', students: 240, faculty: 16, facultyOnDuty: 15, syllabusPace: 67, status: 'Review Needed', avgCgpa: 7.72, attendance: 85.2 },
      { code: 'MBA', name: 'Business Administration', hod: 'Dr. Rashmi Mohanty', students: 180, faculty: 14, facultyOnDuty: 14, syllabusPace: 76, status: 'On Schedule', avgCgpa: 7.90, attendance: 90.4 },
      { code: 'MCA', name: 'Computer Applications', hod: 'Dr. T. P. Tripathy', students: 180, faculty: 12, facultyOnDuty: 12, syllabusPace: 75, status: 'On Schedule', avgCgpa: 8.02, attendance: 91.0 },
    ];

    const upcomingDeadlines = [
      { date: '25 Oct 2026', title: 'Mid-Semester Continuous Assessment Marks Clearance', type: 'Academic', priority: 'High' },
      { date: '28 Oct 2026', title: 'Internal Quality Assurance Cell (IQAC) Quarterly Review', type: 'Governance', priority: 'High' },
      { date: '02 Nov 2026', title: 'Autonomous End-Semester Examination Hall Seating Optimization', type: 'Exam Cell', priority: 'Critical' },
      { date: '10 Nov 2026', title: 'NAAC Cycle IV Peer Team Mock Verification', type: 'Accreditation', priority: 'Critical' },
      { date: '15 Nov 2026', title: 'Even Semester Academic Calendar & Timetable Drafting', type: 'Planning', priority: 'Medium' },
    ];

    const recentActivities = [
      { time: '10 mins ago', user: 'Dr. P. K. Pattnaik (HOD CSE)', action: 'Recommended Faculty Duty Leave', detail: 'Dr. S. Mohanty for IEEE Conference' },
      { time: '45 mins ago', user: 'Controller of Examinations', action: 'Submitted Result Moderation Roster', detail: 'Autumn 2026 Continuous Evaluation' },
      { time: '2 hours ago', user: 'Training & Placement Office', action: 'Requested Placement Circular Clearance', detail: 'Cisco Systems Placement Drive' },
      { time: '4 hours ago', user: 'Chief Estate Officer', action: 'Submitted Green Campus Audit Certificate', detail: 'Solar Phase II Commissioning' },
      { time: 'Yesterday', user: 'Registrar Office', action: 'Verified AICTE Mandatory Disclosure', detail: 'Annual Academic Compliance 2026-27' },
    ];

    return {
      success: true,
      data: {
        academicYear,
        lastUpdated: new Date().toISOString(),
        kpis: {
          totalStudents: totalStudents || 2490,
          teachingFaculty: totalFaculty || 148,
          nonTeachingStaff: totalStaff || 74,
          activeDepartments: 8,
          academicPrograms: 18,
          studentAttendanceRate: 88.7,
          facultyAttendanceRate: 96.8,
          overallPassRate: 94.2,
          pendingLeavesCount: 3,
          pendingApprovalsCount,
          noticesAwaitingClearanceCount: 2,
        },
        departments,
        upcomingDeadlines,
        recentActivities,
      },
    };
  }

  // 2. ACADEMIC PERFORMANCE & ANALYTICS DASHBOARD
  async getAcademicAnalytics(academicYear = '2026-27', program = 'All', department = 'All', semester = 'All') {
    const overallStats = {
      overallPassPct: 94.2,
      previousCyclePassPct: 92.8,
      yoyImprovement: '+1.4%',
      avgCampusCgpa: 8.04,
      firstClassDistinctionRate: 78.6,
      supplementaryBacklogRate: 5.8,
      totalStudentsEvaluated: 2490,
      totalPassedStudents: 2346,
      totalBacklogCases: 144,
    };

    const semesterWiseResults = [
      { semester: 'Semester 1', appeared: 620, passed: 567, passPct: 91.5, avgSgpa: 7.82, backlogs: 53 },
      { semester: 'Semester 2', appeared: 615, passed: 573, passPct: 93.2, avgSgpa: 7.95, backlogs: 42 },
      { semester: 'Semester 3', appeared: 580, passed: 521, passPct: 89.8, avgSgpa: 7.68, backlogs: 59 },
      { semester: 'Semester 4', appeared: 575, passed: 531, passPct: 92.4, avgSgpa: 7.88, backlogs: 44 },
      { semester: 'Semester 5', appeared: 540, passed: 511, passPct: 94.6, avgSgpa: 8.12, backlogs: 29 },
      { semester: 'Semester 6', appeared: 535, passed: 513, passPct: 95.8, avgSgpa: 8.24, backlogs: 22 },
      { semester: 'Semester 7', appeared: 490, passed: 473, passPct: 96.5, avgSgpa: 8.35, backlogs: 17 },
      { semester: 'Semester 8', appeared: 485, passed: 476, passPct: 98.2, avgSgpa: 8.52, backlogs: 9 },
    ];

    const departmentResults = [
      { code: 'CSE', name: 'Computer Science & Engineering', appeared: 540, passed: 524, passPct: 97.1, avgCgpa: 8.42, backlogs: 16, distinctionPct: 84.2, honorStudents: 48 },
      { code: 'AIML', name: 'AI & Machine Learning', appeared: 360, passed: 346, passPct: 96.0, avgCgpa: 8.28, backlogs: 14, distinctionPct: 81.5, honorStudents: 32 },
      { code: 'ECE', name: 'Electronics & Communication', appeared: 380, passed: 360, passPct: 94.8, avgCgpa: 8.10, backlogs: 20, distinctionPct: 76.8, honorStudents: 28 },
      { code: 'MCA', name: 'Computer Applications', appeared: 180, passed: 172, passPct: 95.6, avgCgpa: 8.02, backlogs: 8, distinctionPct: 78.0, honorStudents: 16 },
      { code: 'MBA', name: 'Business Administration', appeared: 180, passed: 171, passPct: 95.0, avgCgpa: 7.90, backlogs: 9, distinctionPct: 75.0, honorStudents: 14 },
      { code: 'EEE', name: 'Electrical & Electronics', appeared: 290, passed: 268, passPct: 92.4, avgCgpa: 7.85, backlogs: 22, distinctionPct: 72.4, honorStudents: 18 },
      { code: 'MECH', name: 'Mechanical Engineering', appeared: 320, passed: 290, passPct: 90.6, avgCgpa: 7.68, backlogs: 30, distinctionPct: 68.2, honorStudents: 15 },
      { code: 'CIVIL', name: 'Civil Engineering', appeared: 240, passed: 214, passPct: 89.2, avgCgpa: 7.72, backlogs: 26, distinctionPct: 66.5, honorStudents: 12 },
    ];

    const atRiskSubjects = [
      { code: 'CS502', name: 'Design and Analysis of Algorithms', dept: 'CSE / AIML', semester: 'Sem 5', faculty: 'Dr. Priya Ranjan', passPct: 84.5, failureCount: 22, action: 'Remedial Tutorial Sessions Assigned' },
      { code: 'EC401', name: 'Signals, Systems & DSP', dept: 'ECE / EEE', semester: 'Sem 4', faculty: 'Dr. M. R. Senapati', passPct: 81.2, failureCount: 28, action: 'Peer Mentoring and Doubt-clearing Classes' },
      { code: 'ME303', name: 'Applied Thermodynamics & Heat Transfer', dept: 'MECH', semester: 'Sem 3', faculty: 'Dr. B. K. Rout', passPct: 79.4, failureCount: 31, action: 'Laboratory Experiment Correlation Review' },
      { code: 'CE504', name: 'Structural Analysis & RCC Design', dept: 'CIVIL', semester: 'Sem 5', faculty: 'Dr. A. K. Nayak', passPct: 78.8, failureCount: 24, action: 'HOD Academic Consultation Scheduled' },
    ];

    const deansHonorList = [
      { rank: 1, name: 'Ananya Sharma', rollNo: '2305201001', dept: 'CSE', semester: 'Sem 5', cgpa: 9.85, achievements: 'Autonomous Gold Medalist Contender' },
      { rank: 2, name: 'Rohan Senapati', rollNo: '2305201004', dept: 'AIML', semester: 'Sem 5', cgpa: 9.72, achievements: 'SIH 2026 Finalist Team Lead' },
      { rank: 3, name: 'Priyanka Mohapatra', rollNo: '2305201012', dept: 'ECE', semester: 'Sem 5', cgpa: 9.64, achievements: 'IEEE Student Branch President' },
      { rank: 4, name: 'Sourav Panigrahi', rollNo: '2305201019', dept: 'CSE', semester: 'Sem 5', cgpa: 9.58, achievements: 'Published Q1 Scopus Research Paper' },
      { rank: 5, name: 'Debashis Rout', rollNo: '2305201027', dept: 'EEE', semester: 'Sem 5', cgpa: 9.46, achievements: 'Solar Innovation Fellowship Award' },
    ];

    const academicSupportList = [
      { rollNo: '2305201104', name: 'Bikash Jena', dept: 'MECH', semester: 'Sem 3', cgpa: 5.82, backlogs: 2, attendance: 71.4, facultyMentor: 'Prof. K. C. Nayak', status: 'In Remedial Tutoring' },
      { rollNo: '2305201118', name: 'Subhashree Barik', dept: 'CIVIL', semester: 'Sem 5', cgpa: 6.12, backlogs: 2, attendance: 74.0, facultyMentor: 'Prof. S. R. Mishra', status: 'Academic Warning Issued' },
      { rollNo: '2305201132', name: 'Amit Pradhan', dept: 'EEE', semester: 'Sem 4', cgpa: 6.25, backlogs: 1, attendance: 72.8, facultyMentor: 'Prof. D. Mohanty', status: 'Special Mentoring Sessions' },
      { rollNo: '2305201145', name: 'Manoj Tripathy', dept: 'CIVIL', semester: 'Sem 3', cgpa: 5.95, backlogs: 3, attendance: 69.5, facultyMentor: 'Prof. R. N. Sahoo', status: 'Parent Consultation Scheduled' },
    ];

    return {
      success: true,
      data: {
        academicYear,
        filtersApplied: { program, department, semester },
        overallStats,
        semesterWiseResults,
        departmentResults: department === 'All' ? departmentResults : departmentResults.filter(d => d.code === department),
        atRiskSubjects,
        deansHonorList,
        academicSupportList,
      },
    };
  }

  // 3. LEAVE APPROVALS WORKFLOW
  async getLeaves() {
    return [
      {
        id: 'LV-2026-101',
        applicantName: 'Dr. Soumya Ranjan Mohanty',
        applicantId: 'FAC-042',
        applicantRole: 'Faculty (Associate Professor)',
        department: 'Computer Science & Engineering',
        leaveType: 'Duty / Conference Leave',
        startDate: '2026-10-24',
        endDate: '2026-10-27',
        totalDays: 4,
        reason: 'Presenting research paper on Autonomous Edge Computing at IEEE International Conference, IIT Kharagpur.',
        hodStatus: 'Approved & Recommended',
        hodRemarks: 'Paper accepted in core track. Classes adjusted with Dr. Priya Ranjan.',
        principalStatus: 'Pending Final Stamp',
        appliedAt: '03 Oct 2026',
        supportingDoc: 'IEEE_Acceptance_Letter_IITKGP.pdf',
      },
      {
        id: 'LV-2026-102',
        applicantName: 'Er. Rajesh Kumar Sethi',
        applicantId: 'STF-018',
        applicantRole: 'Non-Teaching (Senior Lab Instructor)',
        department: 'Electronics & Communication',
        leaveType: 'Medical Leave',
        startDate: '2026-10-21',
        endDate: '2026-10-25',
        totalDays: 5,
        reason: 'Scheduled knee arthroscopy surgery and post-operative recuperation as per orthopedic advice.',
        hodStatus: 'Approved & Recommended',
        hodRemarks: 'Medical certificate verified. Lab sessions handed over to Er. B. K. Jena.',
        principalStatus: 'Pending Final Stamp',
        appliedAt: '02 Oct 2026',
        supportingDoc: 'Hospital_Admission_Order_AIIMS.pdf',
      },
      {
        id: 'LV-2026-103',
        applicantName: 'Prof. Manas Ranjan Senapati',
        applicantId: 'HOD-ECE',
        applicantRole: 'Faculty (Professor & HOD)',
        department: 'Electronics & Communication',
        leaveType: 'Casual Leave',
        startDate: '2026-10-26',
        endDate: '2026-10-27',
        totalDays: 2,
        reason: 'Attending family religious ceremony at Puri Jagannath Temple.',
        hodStatus: 'Self / HOD Requisition',
        hodRemarks: 'Department administrative charge delegated to senior Professor Dr. P. K. Swain.',
        principalStatus: 'Pending Final Stamp',
        appliedAt: '04 Oct 2026',
        supportingDoc: 'Casual_Leave_Undertaking.pdf',
      },
      {
        id: 'LV-2026-098',
        applicantName: 'Subham Sekhar Jena',
        applicantId: '2305201018',
        applicantRole: 'Student (B.Tech CSE Sem 5)',
        department: 'Computer Science & Engineering',
        leaveType: 'On Duty / Hackathon Leave',
        startDate: '2026-10-22',
        endDate: '2026-10-24',
        totalDays: 3,
        reason: 'Representing Apna Campus in Smart India Hackathon (SIH 2026) Grand Finale at Ahmedabad.',
        hodStatus: 'Approved & Recommended',
        hodRemarks: 'Official nomination. Attendance waiver recommended by Institution Innovation Council.',
        principalStatus: 'Approved',
        appliedAt: '30 Sep 2026',
        supportingDoc: 'SIH_Finalist_Selection_Letter.pdf',
      },
      {
        id: 'LV-2026-094',
        applicantName: 'Pooja Priyadarshini',
        applicantId: 'STF-029',
        applicantRole: 'Non-Teaching (Accounts Assistant)',
        department: 'Finance & Accounts',
        leaveType: 'Casual Leave',
        startDate: '2026-10-18',
        endDate: '2026-10-19',
        totalDays: 2,
        reason: 'Personal urgent work at ancestral village.',
        hodStatus: 'Approved & Recommended',
        hodRemarks: 'Fee reconciliation counter covered by senior clerk.',
        principalStatus: 'Approved',
        appliedAt: '28 Sep 2026',
        supportingDoc: 'Leave_Application.pdf',
      },
    ];
  }

  async decideLeave(
    id: string,
    action: 'APPROVE' | 'REJECT',
    remarks: string,
    actingUser: { name: string; role: string; identifier: string }
  ) {
    if (action === 'REJECT' && !remarks?.trim()) {
      throw new BadRequestException('A clear rejection reason must be provided when rejecting a leave application.');
    }

    const newStatus = action === 'APPROVE' ? 'Approved' : 'Rejected';

    // Record Immutable Audit Log
    try {
      await this.prisma.auditLog.create({
        data: {
          user: actingUser.name || actingUser.identifier || 'Dr. S. K. Rout (Principal)',
          role: 'PRINCIPAL',
          subject: `Leave Application ${id}`,
          assessment: 'Executive Leave Clearance',
          oldMark: 'Pending Final Stamp',
          newMark: newStatus,
          changedAt: new Date().toLocaleString('en-IN'),
          reason: remarks || `Leave ${newStatus.toLowerCase()} by Principal`,
        },
      });
    } catch (e: any) {
      console.warn('Could not record audit log:', e?.message);
    }

    return {
      success: true,
      message: `Leave application ${id} officially ${newStatus} by Principal / Director.`,
      data: {
        id,
        status: newStatus,
        remarks: remarks || `Approved by Principal / Director`,
        decidedAt: new Date().toISOString(),
      },
    };
  }

  // 4. CIRCULARS & NOTICES CLEARANCE
  async getCirculars() {
    return [
      {
        id: 'NOTIF-201',
        title: 'Autumn End-Semester Autonomous Examination Schedule 2026',
        scope: 'All Campus',
        category: 'EXAMINATIONS',
        priority: 'Critical',
        status: 'Approved & Broadcasted',
        author: 'Controller of Examinations',
        date: '02 Oct 2026',
        expiryDate: '15 Nov 2026',
        content: 'Official timetable schedule for Autonomous B.Tech, M.Tech, MCA & MBA End-Semester Autumn 2026 examinations published on college portal. Students are advised to download hall tickets before 28 October.',
        attachments: ['End_Sem_Exam_Schedule_2026.pdf'],
      },
      {
        id: 'NOTIF-202',
        title: 'Campus Holiday on account of Gandhi Jayanti (02 October)',
        scope: 'College-wide',
        category: 'HOLIDAY',
        priority: 'Normal',
        status: 'Approved & Broadcasted',
        author: 'Principal Secretariat',
        date: '01 Oct 2026',
        expiryDate: '03 Oct 2026',
        content: 'All academic and administrative departments of Apna Campus will remain closed on Wednesday, 02 October 2026 on account of Gandhi Jayanti.',
        attachments: [],
      },
      {
        id: 'NOTIF-203',
        title: 'Cisco Systems Placement Drive for B.Tech Final Year Students',
        scope: 'Final Year B.Tech',
        category: 'PLACEMENT',
        priority: 'High',
        status: 'Pending Clearance',
        author: 'Training & Placement Cell',
        date: '04 Oct 2026',
        expiryDate: '20 Oct 2026',
        content: 'Cisco Systems campus recruitment drive scheduled for 22-23 October 2026. Eligible branches: CSE, AIML, ECE. Minimum CGPA criterion: 7.0 with zero standing arrears.',
        attachments: ['Cisco_Job_Description_2026.pdf'],
      },
      {
        id: 'NOTIF-204',
        title: 'NAAC Cycle IV Preparatory Review Meeting for all Faculty',
        scope: 'All Faculty & HODs',
        category: 'REGULATORY',
        priority: 'Critical',
        status: 'Approved & Broadcasted',
        author: 'Internal Quality Assurance Cell (IQAC)',
        date: '30 Sep 2026',
        expiryDate: '30 Oct 2026',
        content: 'Mandatory faculty briefing regarding NAAC Cycle IV peer review documentation at Main Auditorium on Friday at 03:30 PM.',
        attachments: ['IQAC_Faculty_Guidelines.pdf'],
      },
      {
        id: 'NOTIF-205',
        title: 'Annual Sports & Cultural Festival "SPANDAN 2026" Committee Nominations',
        scope: 'All Students & Staff',
        category: 'CAMPUS_LIFE',
        priority: 'Medium',
        status: 'Pending Clearance',
        author: 'Student Welfare Cell',
        date: '04 Oct 2026',
        expiryDate: '25 Oct 2026',
        content: 'Nominations invited from student coordinators and faculty advisors for the upcoming annual institutional cultural carnival.',
        attachments: ['Spandan_2026_Proposal.pdf'],
      },
    ];
  }

  async createCircular(data: any, actingUser: any) {
    if (!data.title?.trim()) {
      throw new BadRequestException('Circular title is required.');
    }

    const item = {
      id: `NOTIF-${Math.floor(200 + Math.random() * 800)}`,
      title: data.title,
      scope: data.scope || 'College-wide',
      category: data.category || 'ACADEMIC',
      priority: data.priority || 'Normal',
      status: 'Approved & Broadcasted',
      author: 'Office of the Principal / Director',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expiryDate: data.expiryDate || '30 Nov 2026',
      content: data.content || '',
      attachments: data.attachments || [],
    };

    try {
      await this.prisma.notice.create({
        data: {
          title: item.title,
          tag: item.category,
          publisher: 'Office of the Principal / Director',
          pinned: item.priority === 'Critical',
          summary: item.title,
          content: item.content || item.title,
          date: item.date,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          user: actingUser.name || 'Dr. S. K. Rout (Principal)',
          role: 'PRINCIPAL',
          subject: item.title,
          assessment: 'Published Official Institutional Circular',
          oldMark: 'Draft',
          newMark: 'Approved & Broadcasted',
          changedAt: new Date().toLocaleString('en-IN'),
          reason: `Broadcasted to audience: ${item.scope}`,
        },
      });
    } catch (e: any) {
      console.warn('Could not persist notice to database:', e?.message);
    }

    return {
      success: true,
      message: 'Official circular published and broadcasted across campus.',
      data: item,
    };
  }

  async decideCircular(id: string, action: 'APPROVE' | 'REJECT', remarks: string, actingUser: any) {
    const newStatus = action === 'APPROVE' ? 'Approved & Broadcasted' : 'Rejected / Returned';

    try {
      await this.prisma.auditLog.create({
        data: {
          user: actingUser.name || 'Dr. S. K. Rout (Principal)',
          role: 'PRINCIPAL',
          subject: `Circular ${id}`,
          assessment: 'Circular Clearance Action',
          oldMark: 'Pending Clearance',
          newMark: newStatus,
          changedAt: new Date().toLocaleString('en-IN'),
          reason: remarks || `Circular ${newStatus.toLowerCase()} by Principal`,
        },
      });
    } catch {}

    return {
      success: true,
      message: `Circular ${id} ${newStatus}.`,
      data: { id, status: newStatus },
    };
  }
}
