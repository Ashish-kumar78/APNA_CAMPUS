// Centralized ERP Enterprise Data Store & Service Layer
// Serves Super Admin, Management, Principal, Exam Cell, Library, Transport, Placement, Staff & Academic Operations

import {
  initialPrograms,
  initialBatches,
  initialDepartments,
  initialSections,
  initialSubjects,
  initialFacultyAssignments,
  initialFaculty,
} from '../data/collegeData.js';

const ERP_STORAGE_KEY = 'collegeflow_erp_enterprise_state_v1';

export const initialSystemSettings = {
  institutionName: 'Apna Campus, Bhubaneswar',
  institutionCode: 'APNA-CAMPUS-2026',
  affiliatingUniversity: 'Biju Patnaik University of Technology (BPUT)',
  accreditationGrade: 'NAAC A++ Accredited · Autonomous Institution',
  currentAcademicYear: '2026-27',
  activeSemesterSeason: 'Odd Semesters (Sem 1, 3, 5, 7)',
  minimumAttendancePercentage: 75,
  attendanceWarningThreshold: 65,
  gradingSystem: '10-Point Absolute Scale',
  cgpaCalculationMethod: 'Weighted Credit Average (SGPA/CGPA)',
  currency: 'INR (₹)',
  enableAutoBackup: true,
  backupFrequency: 'Daily at 02:00 AM IST',
  emergencyLockdownMode: false,
};

export const initialRolesList = [
  // A. Administration
  { key: 'super_admin', label: 'Super Admin', category: 'Administration', usersCount: 2, description: 'Unrestricted institutional configuration & security' },
  { key: 'management', label: 'Management', category: 'Administration', usersCount: 4, description: 'Governing board analytics, strategic review & approvals' },
  { key: 'principal', label: 'Principal', category: 'Administration', usersCount: 2, description: 'Campus academic administration & institutional clearances' },
  { key: 'admin', label: 'Admin Office', category: 'Administration', usersCount: 6, description: 'Day-to-day admissions, courses, sections & timetables' },

  // B. Academics
  { key: 'admissions', label: 'Admission', category: 'Academics', usersCount: 5, description: 'Student intake, admissions counseling & seat allocations' },
  { key: 'hod', label: 'HOD', category: 'Academics', usersCount: 8, description: 'Department-specific academic governance & workload' },
  { key: 'faculty', label: 'Faculty', category: 'Academics', usersCount: 146, description: 'Continuous assessment, attendance marking & classes' },
  { key: 'student', label: 'Students', category: 'Academics', usersCount: 2480, description: 'Self-service academics, payments & campus requests' },
  { key: 'exam_cell', label: 'Examination', category: 'Academics', usersCount: 5, description: 'Exam cycles, hall tickets, seating plans & grade calculation' },
  { key: 'staff', label: 'Staff Lab', category: 'Academics', usersCount: 38, description: 'Labs, equipment maintenance, technical demonstrations' },
  { key: 'library', label: 'Library', category: 'Academics', usersCount: 6, description: 'Circulation, book catalogue, reservations & fines' },
  { key: 'placement', label: 'Placement', category: 'Academics', usersCount: 5, description: 'Corporate recruitment drives, eligibility & training' },
  { key: 'accounts', label: 'Accounts', category: 'Academics', usersCount: 7, description: 'Fee management, collections, reconciliations & receipts' },
  { key: 'scholarship', label: 'Scholarship', category: 'Academics', usersCount: 4, description: 'State & merit scholarship concessions and waiver audits' },

  // C. Campus Services
  { key: 'hostel', label: 'Hostel', category: 'Campus Services', usersCount: 8, description: 'Hostel residences, room allocations & student welfare' },
  { key: 'warden', label: 'Warden', category: 'Campus Services', usersCount: 8, description: 'Hostel residences, curfew enforcement & gate passes' },
  { key: 'hostel_admin', label: 'Hostel Admin', category: 'Campus Services', usersCount: 4, description: 'Hostel facilities, infrastructure maintenance & occupancy' },
  { key: 'transport', label: 'Transport', category: 'Campus Services', usersCount: 4, description: 'Bus fleet, routes, stops, bus passes & drivers' },
  { key: 'campus_operations', label: 'Campus Operations', category: 'Campus Services', usersCount: 15, description: 'Maintenance, security, housekeeping, canteen, facilities & field crews' },
  { key: 'canteen', label: 'Canteen', category: 'Campus Services', usersCount: 6, description: 'Dining services, menu management & cafeteria accounts' },
];

export const permissionDefinitions = [
  // Super Admin & System
  { id: 'manage_system_settings', label: 'Manage System & Institution Settings', category: 'System Configuration' },
  { id: 'manage_rbac_matrix', label: 'Manage RBAC Permissions Matrix', category: 'System Configuration' },
  { id: 'view_global_audit_logs', label: 'View Comprehensive Institutional Audit Logs', category: 'System Configuration' },
  { id: 'trigger_system_backup', label: 'Trigger System Database Backup & Restore', category: 'System Configuration' },
  // Executive & Governance
  { id: 'view_executive_dashboard', label: 'View C-Level Governance Analytics', category: 'Governance' },
  { id: 'approve_institutional_notices', label: 'Approve & Release Official Notices', category: 'Governance' },
  { id: 'approve_faculty_leave', label: 'Approve Faculty & Staff Leave Applications', category: 'Governance' },
  { id: 'approve_strategic_budgets', label: 'Approve Institutional Budgets & Grants', category: 'Governance' },
  // Academic & Operations
  { id: 'manage_students_faculty', label: 'Manage Student & Faculty Profiles', category: 'Academic Admin' },
  { id: 'manage_curriculum_sections', label: 'Configure Departments, Courses & Sections', category: 'Academic Admin' },
  { id: 'mark_daily_attendance', label: 'Record Student Subject & Daily Attendance', category: 'Academics' },
  { id: 'enter_continuous_marks', label: 'Enter & Moderate Continuous Assessment Marks', category: 'Academics' },
  // Examination Cell
  { id: 'manage_exam_schedules', label: 'Create & Schedule Examination Cycles', category: 'Examination Cell' },
  { id: 'generate_admit_cards', label: 'Generate & Publish Hall Tickets / Admit Cards', category: 'Examination Cell' },
  { id: 'configure_seating_plans', label: 'Generate Room-wise Exam Seating Arrangement', category: 'Examination Cell' },
  { id: 'run_grading_engine', label: 'Execute SGPA/CGPA Grade Calculation Engine', category: 'Examination Cell' },
  { id: 'publish_final_results', label: 'Publish Certified Semester Results', category: 'Examination Cell' },
  // Finance & Accounts
  { id: 'manage_fee_structures', label: 'Configure Tuition & Hostel Fee Slabs', category: 'Finance' },
  { id: 'verify_offline_payments', label: 'Verify Bank UTRs & Offline Payment Proofs', category: 'Finance' },
  { id: 'issue_official_receipts', label: 'Issue & Authorize Tax Receipts', category: 'Finance' },
  // Library, Transport, Placement, Facilities
  { id: 'manage_library_circulation', label: 'Issue, Return & Renew Library Books', category: 'Library' },
  { id: 'manage_fleet_routes', label: 'Manage Bus Fleet, Routes & Bus Passes', category: 'Transport' },
  { id: 'manage_placement_drives', label: 'Manage Recruiting Companies & Job Drives', category: 'Placement' },
  { id: 'manage_facility_tickets', label: 'Process Maintenance & Lab Tickets', category: 'Support & Facilities' },
];

export const initialRolePermissions = {
  super_admin: permissionDefinitions.map(p => p.id), // All permissions
  management: [
    'view_executive_dashboard',
    'view_global_audit_logs',
    'approve_institutional_notices',
    'approve_strategic_budgets',
  ],
  principal: [
    'view_executive_dashboard',
    'view_global_audit_logs',
    'approve_institutional_notices',
    'approve_faculty_leave',
    'publish_final_results',
    'manage_students_faculty',
    'manage_curriculum_sections',
  ],
  admin: [
    'manage_students_faculty',
    'manage_curriculum_sections',
    'view_global_audit_logs',
    'mark_daily_attendance',
    'enter_continuous_marks',
    'manage_fee_structures',
  ],
  hod: [
    'approve_faculty_leave',
    'manage_curriculum_sections',
    'mark_daily_attendance',
    'enter_continuous_marks',
    'view_global_audit_logs',
  ],
  faculty: [
    'mark_daily_attendance',
    'enter_continuous_marks',
  ],
  student: [],
  accounts: [
    'manage_fee_structures',
    'verify_offline_payments',
    'issue_official_receipts',
  ],
  exam_cell: [
    'manage_exam_schedules',
    'generate_admit_cards',
    'configure_seating_plans',
    'run_grading_engine',
    'publish_final_results',
  ],
  library: [
    'manage_library_circulation',
  ],
  warden: [
    'manage_facility_tickets',
  ],
  transport: [
    'manage_fleet_routes',
  ],
  placement: [
    'manage_placement_drives',
  ],
  staff: [
    'manage_facility_tickets',
  ],
};

// Initial Examination Cell Data
export const initialExamCycles = [
  {
    id: 'EXAM-2026-AUTUMN',
    title: 'Autonomous End-Semester Examination — Autumn 2026',
    session: 'Autumn 2026 (Sem 3, 5, 7)',
    status: 'Published', // Draft, Schedule Finalized, In Progress, Grading, Published
    startDate: '2026-11-10',
    endDate: '2026-11-28',
    totalRegisteredStudents: 1420,
    hallTicketsReleased: true,
    totalPapers: 36,
    moderationStatus: '100% Completed',
    publishedDate: '02 Oct 2026',
  },
  {
    id: 'EXAM-2026-MIDTERM',
    title: 'Mid-Term Assessment Cycle II — 2026-27',
    session: 'Odd Semester 2026',
    status: 'In Progress',
    startDate: '2026-10-14',
    endDate: '2026-10-21',
    totalRegisteredStudents: 2480,
    hallTicketsReleased: true,
    totalPapers: 48,
    moderationStatus: '68% Moderated',
    publishedDate: 'Pending Sign-off',
  },
];

export const initialExamTimetable = [
  { id: 'ET-101', code: 'CS501', subject: 'Data Structures & Algorithms', date: '2026-11-10', time: '10:00 AM - 01:00 PM', semester: 'Semester 5', branches: ['CSE', 'AI&DS'], roomCount: 8, invigilators: 16 },
  { id: 'ET-102', code: 'CS502', subject: 'Operating Systems', date: '2026-11-13', time: '10:00 AM - 01:00 PM', semester: 'Semester 5', branches: ['CSE', 'ECE'], roomCount: 8, invigilators: 16 },
  { id: 'ET-103', code: 'CS503', subject: 'Database Management Systems', date: '2026-11-17', time: '10:00 AM - 01:00 PM', semester: 'Semester 5', branches: ['CSE'], roomCount: 7, invigilators: 14 },
  { id: 'ET-104', code: 'CS504', subject: 'Artificial Intelligence', date: '2026-11-20', time: '10:00 AM - 01:00 PM', semester: 'Semester 5', branches: ['CSE'], roomCount: 7, invigilators: 14 },
  { id: 'ET-105', code: 'CS505', subject: 'Machine Learning', date: '2026-11-24', time: '10:00 AM - 01:00 PM', semester: 'Semester 5', branches: ['CSE'], roomCount: 7, invigilators: 14 },
];

export const initialSeatingArrangements = [
  { hall: 'Exam Hall B-301', capacity: 60, allocated: 58, invigilator: 'Dr. Priya Ranjan (Associate Prof)', session: 'Morning (10:00 AM)', range: '2305201001 to 2305201058 (CSE Sec A)' },
  { hall: 'Exam Hall B-302', capacity: 60, allocated: 60, invigilator: 'Prof. Amit Mishra (Assistant Prof)', session: 'Morning (10:00 AM)', range: '2305201059 to 2305201118 (CSE Sec B)' },
  { hall: 'Exam Hall B-303', capacity: 60, allocated: 56, invigilator: 'Prof. Debashis Jena (Assistant Prof)', session: 'Morning (10:00 AM)', range: '2305201119 to 2305201174 (CSE Sec C)' },
  { hall: 'Central Aud. Floor 1', capacity: 120, allocated: 116, invigilator: 'Dr. Sneha Ray (Chief Superintendent)', session: 'Morning (10:00 AM)', range: 'Mixed Branches (ECE / EEE Sem 5)' },
];

export const initialGradeRoster = [
  { rollNumber: '01', regNo: '2305201001', name: 'Rakesh Das', department: 'CSE', semester: 'Semester 5', creditsTaken: 24, creditsEarned: 24, sgpa: 8.84, cgpa: 8.72, status: 'Passed (First Class Distinction)', backlogCount: 0 },
  { rollNumber: '02', regNo: '2305201002', name: 'Amit Nayak', department: 'CSE', semester: 'Semester 5', creditsTaken: 24, creditsEarned: 24, sgpa: 8.12, cgpa: 8.04, status: 'Passed (First Class)', backlogCount: 0 },
  { rollNumber: '03', regNo: '2305201003', name: 'Raj Sahoo', department: 'CSE', semester: 'Semester 5', creditsTaken: 24, creditsEarned: 24, sgpa: 7.65, cgpa: 7.78, status: 'Passed (First Class)', backlogCount: 0 },
  { rollNumber: '04', regNo: '2305201004', name: 'Priya Patra', department: 'CSE', semester: 'Semester 5', creditsTaken: 24, creditsEarned: 24, sgpa: 9.20, cgpa: 9.08, status: 'Passed (Exemplary Honours)', backlogCount: 0 },
  { rollNumber: '05', regNo: '2305201005', name: 'Sourav Mohanty', department: 'CSE', semester: 'Semester 5', creditsTaken: 24, creditsEarned: 20, sgpa: 6.40, cgpa: 6.82, status: 'Backlog in CS502 (Operating Systems)', backlogCount: 1 },
];

export const initialHallTickets = [
  { rollNumber: '01', regNo: '2305201001', name: 'Rakesh Das', department: 'CSE', semester: 'Semester 5', attendance: 88, feeClearance: 'Cleared', hallTicketStatus: 'Issued', seatAllocated: 'Exam Hall B-301 · Desk 01', examCenter: 'Academic Block B - 3rd Floor', issuedAt: '03 Oct 2026' },
  { rollNumber: '02', regNo: '2305201002', name: 'Amit Nayak', department: 'CSE', semester: 'Semester 5', attendance: 82, feeClearance: 'Cleared', hallTicketStatus: 'Issued', seatAllocated: 'Exam Hall B-301 · Desk 02', examCenter: 'Academic Block B - 3rd Floor', issuedAt: '03 Oct 2026' },
  { rollNumber: '03', regNo: '2305201003', name: 'Raj Sahoo', department: 'CSE', semester: 'Semester 5', attendance: 79, feeClearance: 'Cleared', hallTicketStatus: 'Issued', seatAllocated: 'Exam Hall B-301 · Desk 03', examCenter: 'Academic Block B - 3rd Floor', issuedAt: '03 Oct 2026' },
  { rollNumber: '04', regNo: '2305201004', name: 'Priya Patra', department: 'CSE', semester: 'Semester 5', attendance: 95, feeClearance: 'Cleared', hallTicketStatus: 'Issued', seatAllocated: 'Exam Hall B-301 · Desk 04', examCenter: 'Academic Block B - 3rd Floor', issuedAt: '03 Oct 2026' },
  { rollNumber: '05', regNo: '2305201005', name: 'Sourav Mohanty', department: 'CSE', semester: 'Semester 5', attendance: 67, feeClearance: 'Cleared', hallTicketStatus: 'Detained (Low Attendance)', seatAllocated: 'Unassigned', examCenter: 'Pending Clearance', issuedAt: null, condonationEligible: true },
  { rollNumber: '06', regNo: '2305201006', name: 'Sneha Mohanty', department: 'CSE', semester: 'Semester 5', attendance: 84, feeClearance: 'Pending (₹12,000)', hallTicketStatus: 'On Hold (Accounts)', seatAllocated: 'Unassigned', examCenter: 'Pending Fee Settlement', issuedAt: null, condonationEligible: false },
  { rollNumber: '07', regNo: '2305201007', name: 'Debabrata Jena', department: 'CSE', semester: 'Semester 5', attendance: 77, feeClearance: 'Cleared', hallTicketStatus: 'Issued', seatAllocated: 'Exam Hall B-301 · Desk 05', examCenter: 'Academic Block B - 3rd Floor', issuedAt: '03 Oct 2026' },
  { rollNumber: '08', regNo: '2305201008', name: 'Ananya Mishra', department: 'AI&DS', semester: 'Semester 5', attendance: 92, feeClearance: 'Cleared', hallTicketStatus: 'Issued', seatAllocated: 'Exam Hall B-302 · Desk 01', examCenter: 'Academic Block B - 3rd Floor', issuedAt: '03 Oct 2026' },
  { rollNumber: '09', regNo: '2305201009', name: 'Subham Swain', department: 'ECE', semester: 'Semester 5', attendance: 62, feeClearance: 'Pending (₹6,500)', hallTicketStatus: 'Detained & Fee Dues', seatAllocated: 'Unassigned', examCenter: 'Pending All Clearances', issuedAt: null, condonationEligible: false },
  { rollNumber: '10', regNo: '2305201010', name: 'Bikramjit Rout', department: 'CSE', semester: 'Semester 5', attendance: 85, feeClearance: 'Cleared', hallTicketStatus: 'Issued', seatAllocated: 'Exam Hall B-301 · Desk 06', examCenter: 'Academic Block B - 3rd Floor', issuedAt: '03 Oct 2026' },
];

export const initialModerationMarks = {
  'CS501': {
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    semester: 'Semester 5',
    maxInternal: 20,
    maxExternal: 80,
    isLocked: false,
    records: [
      { rollNumber: '01', regNo: '2305201001', name: 'Rakesh Das', internal: 19, external: 72, grace: 0, total: 91, grade: 'O', points: 10, status: 'Passed' },
      { rollNumber: '02', regNo: '2305201002', name: 'Amit Nayak', internal: 17, external: 64, grace: 0, total: 81, grade: 'A+', points: 9, status: 'Passed' },
      { rollNumber: '03', regNo: '2305201003', name: 'Raj Sahoo', internal: 16, external: 58, grace: 0, total: 74, grade: 'A', points: 8, status: 'Passed' },
      { rollNumber: '04', regNo: '2305201004', name: 'Priya Patra', internal: 20, external: 74, grace: 0, total: 94, grade: 'O', points: 10, status: 'Passed' },
      { rollNumber: '05', regNo: '2305201005', name: 'Sourav Mohanty', internal: 12, external: 26, grace: 0, total: 38, grade: 'F', points: 0, status: 'Borderline Fail' },
      { rollNumber: '07', regNo: '2305201007', name: 'Debabrata Jena', internal: 15, external: 55, grace: 0, total: 70, grade: 'B+', points: 7.5, status: 'Passed' },
      { rollNumber: '10', regNo: '2305201010', name: 'Bikramjit Rout', internal: 18, external: 66, grace: 0, total: 84, grade: 'A+', points: 9, status: 'Passed' },
    ]
  },
  'CS502': {
    subjectCode: 'CS502',
    subjectName: 'Operating Systems',
    semester: 'Semester 5',
    maxInternal: 20,
    maxExternal: 80,
    isLocked: false,
    records: [
      { rollNumber: '01', regNo: '2305201001', name: 'Rakesh Das', internal: 18, external: 68, grace: 0, total: 86, grade: 'A+', points: 9, status: 'Passed' },
      { rollNumber: '02', regNo: '2305201002', name: 'Amit Nayak', internal: 16, external: 62, grace: 0, total: 78, grade: 'A', points: 8, status: 'Passed' },
      { rollNumber: '03', regNo: '2305201003', name: 'Raj Sahoo', internal: 15, external: 54, grace: 0, total: 69, grade: 'B+', points: 7, status: 'Passed' },
      { rollNumber: '04', regNo: '2305201004', name: 'Priya Patra', internal: 19, external: 70, grace: 0, total: 89, grade: 'A+', points: 9, status: 'Passed' },
      { rollNumber: '05', regNo: '2305201005', name: 'Sourav Mohanty', internal: 10, external: 22, grace: 0, total: 32, grade: 'F', points: 0, status: 'Fail (Backlog)' },
      { rollNumber: '07', regNo: '2305201007', name: 'Debabrata Jena', internal: 16, external: 58, grace: 0, total: 74, grade: 'A', points: 8, status: 'Passed' },
      { rollNumber: '10', regNo: '2305201010', name: 'Bikramjit Rout', internal: 17, external: 60, grace: 0, total: 77, grade: 'A', points: 8, status: 'Passed' },
    ]
  },
  'CS503': {
    subjectCode: 'CS503',
    subjectName: 'Database Management Systems',
    semester: 'Semester 5',
    maxInternal: 20,
    maxExternal: 80,
    isLocked: true,
    records: [
      { rollNumber: '01', regNo: '2305201001', name: 'Rakesh Das', internal: 19, external: 70, grace: 0, total: 89, grade: 'A+', points: 9, status: 'Passed' },
      { rollNumber: '02', regNo: '2305201002', name: 'Amit Nayak', internal: 18, external: 65, grace: 0, total: 83, grade: 'A+', points: 9, status: 'Passed' },
      { rollNumber: '03', regNo: '2305201003', name: 'Raj Sahoo', internal: 17, external: 59, grace: 0, total: 76, grade: 'A', points: 8, status: 'Passed' },
      { rollNumber: '04', regNo: '2305201004', name: 'Priya Patra', internal: 20, external: 76, grace: 0, total: 96, grade: 'O', points: 10, status: 'Passed' },
      { rollNumber: '05', regNo: '2305201005', name: 'Sourav Mohanty', internal: 14, external: 42, grace: 0, total: 56, grade: 'C', points: 6, status: 'Passed' },
      { rollNumber: '07', regNo: '2305201007', name: 'Debabrata Jena', internal: 17, external: 52, grace: 0, total: 69, grade: 'B+', points: 7, status: 'Passed' },
      { rollNumber: '10', regNo: '2305201010', name: 'Bikramjit Rout', internal: 18, external: 64, grace: 0, total: 82, grade: 'A+', points: 9, status: 'Passed' },
    ]
  }
};

export const initialReevaluationRequests = [
  { id: 'REV-2026-001', rollNumber: '05', regNo: '2305201005', studentName: 'Sourav Mohanty', subjectCode: 'CS502', subjectName: 'Operating Systems', originalMarks: 32, feePaid: '₹500 (Verified)', dateApplied: '01 Oct 2026', status: 'Under Scrutiny', recheckedMarks: null, remarks: 'Requesting re-totalling of Section B (Memory Management)' },
  { id: 'REV-2026-002', rollNumber: '03', regNo: '2305201003', studentName: 'Raj Sahoo', subjectCode: 'CS501', subjectName: 'Data Structures & Algorithms', originalMarks: 74, feePaid: '₹500 (Verified)', dateApplied: '02 Oct 2026', status: 'Under Scrutiny', recheckedMarks: null, remarks: 'Requesting answer script photocopy and re-evaluation of Q4 Graph algorithms' },
  { id: 'REV-2026-003', rollNumber: '02', regNo: '2305201002', studentName: 'Amit Nayak', subjectCode: 'CS503', subjectName: 'Database Management Systems', originalMarks: 68, feePaid: '₹500 (Verified)', dateApplied: '28 Sep 2026', status: 'Approved & Updated', recheckedMarks: 72, remarks: 'Uncounted marks in Question 3b verified by External Evaluator (+4 marks)' },
];

export const initialExamCirculars = [
  { id: 'CIRC-EXAM-01', circularNo: 'GIFT/COE/2026/89', title: 'Autumn 2026 End-Semester Admit Card Download Protocol & Deadlines', date: '04 Oct 2026', audience: 'All Students & Mentors', category: 'Hall Ticket', priority: 'High', content: 'All B.Tech/MCA/MBA students are instructed to download and verify their printed admit cards. Minimum 75% attendance and fee clearance is mandatory for hall entry.' },
  { id: 'CIRC-EXAM-02', circularNo: 'GIFT/COE/2026/90', title: 'Autonomous Examination Hall Rules & Anti-Malpractice Guidelines', date: '02 Oct 2026', audience: 'Students & Invigilation Squad', category: 'Guidelines', priority: 'Urgent', content: 'Zero tolerance towards smart gadgets, mobile phones, or unauthorised study material. Flying squads will conduct randomized hall checks during all sessions.' },
  { id: 'CIRC-EXAM-03', circularNo: 'GIFT/COE/2026/91', title: 'Special Supplementary Examination Form Fill-up for 2022-26 Batch', date: '28 Sep 2026', audience: 'Backlog Students', category: 'Schedule', priority: 'Normal', content: 'Eligible students with backlogs in Semesters 3 to 6 can submit their special supplementary applications at the Examination Cell counter.' },
];

// Initial Library Books
export const initialBooksCatalog = [
  { id: 'BK-1001', isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Computer Science', edition: '4th Edition', totalCopies: 25, availableCopies: 7, shelfLocation: 'Stack 3, Row B' },
  { id: 'BK-1002', isbn: '978-0133591620', title: 'Operating System Concepts (Silberschatz)', author: 'Silberschatz, Galvin, Gagne', category: 'Operating Systems', edition: '10th Edition', totalCopies: 20, availableCopies: 4, shelfLocation: 'Stack 3, Row D' },
  { id: 'BK-1003', isbn: '978-0078022159', title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry Korth', category: 'Databases', edition: '7th Edition', totalCopies: 18, availableCopies: 9, shelfLocation: 'Stack 4, Row A' },
  { id: 'BK-1004', isbn: '978-0136042594', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', category: 'Artificial Intelligence', edition: '4th Edition', totalCopies: 15, availableCopies: 3, shelfLocation: 'Stack 4, Row C' },
  { id: 'BK-1005', isbn: '978-0262035613', title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio', category: 'Machine Learning', edition: '1st Edition', totalCopies: 12, availableCopies: 2, shelfLocation: 'Stack 5, Row A' },
  { id: 'BK-1006', isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', category: 'Software Engineering', edition: '1st Edition', totalCopies: 10, availableCopies: 5, shelfLocation: 'Stack 5, Row B' },
];

export const initialCirculationRecords = [
  { id: 'CIRC-801', bookId: 'BK-1001', bookTitle: 'Introduction to Algorithms (CLRS)', borrowerName: 'Rakesh Das', borrowerRegNo: '2305201001', role: 'Student', issueDate: '2026-09-20', dueDate: '2026-10-10', status: 'Issued', fineAmount: 0 },
  { id: 'CIRC-802', bookId: 'BK-1002', bookTitle: 'Operating System Concepts', borrowerName: 'Amit Nayak', borrowerRegNo: '2305201002', role: 'Student', issueDate: '2026-09-12', dueDate: '2026-10-02', status: 'Overdue', fineAmount: 30 },
  { id: 'CIRC-803', bookId: 'BK-1003', bookTitle: 'Database System Concepts', borrowerName: 'Dr. S. Mohanty', borrowerRegNo: 'FAC-042', role: 'Faculty', issueDate: '2026-08-15', dueDate: '2026-11-15', status: 'Issued', fineAmount: 0 },
  { id: 'CIRC-804', bookId: 'BK-1004', bookTitle: 'Artificial Intelligence: A Modern Approach', borrowerName: 'Priya Patra', borrowerRegNo: '2305201004', role: 'Student', issueDate: '2026-09-01', dueDate: '2026-09-21', status: 'Returned', fineAmount: 0, returnDate: '2026-09-20' },
];

// Initial Transport Data
export const initialFleetVehicles = [
  { id: 'VEH-01', busNumber: 'OD-02-AK-4411', fleetCode: 'Bus 01', type: '52-Seater AC Coach', capacity: 52, allocatedStudents: 49, driver: 'Ramesh Ch. Jena', driverPhone: '+91 94371 00214', routeName: 'Route 1: Cuttack Badambadi Express', status: 'Active (On Route)', fuelType: 'Diesel (BS-VI)', fitnessExpiry: '2027-04-15', insuranceExpiry: '2027-03-31', pucExpiry: '2027-01-20', permitExpiry: '2028-05-10', odometerKm: 68420, depot: 'Campus Central Bus Bay' },
  { id: 'VEH-02', busNumber: 'OD-02-AK-4412', fleetCode: 'Bus 02', type: '52-Seater Coach', capacity: 52, allocatedStudents: 51, driver: 'Bikash Mohanty', driverPhone: '+91 94371 00215', routeName: 'Route 2: Rasulgarh - Master Canteen', status: 'Active (On Route)', fuelType: 'Diesel (BS-VI)', fitnessExpiry: '2027-06-20', insuranceExpiry: '2027-06-15', pucExpiry: '2027-02-28', permitExpiry: '2028-06-12', odometerKm: 59310, depot: 'Campus Central Bus Bay' },
  { id: 'VEH-03', busNumber: 'OD-02-BL-8890', fleetCode: 'Bus 03', type: '42-Seater Coach', capacity: 42, allocatedStudents: 38, driver: 'Sanjay Kumar Rout', driverPhone: '+91 94371 00216', routeName: 'Route 3: Patia - Infocity - Khandagiri', status: 'Active (On Route)', fuelType: 'CNG', fitnessExpiry: '2027-02-10', insuranceExpiry: '2027-01-25', pucExpiry: '2026-12-15', permitExpiry: '2028-02-28', odometerKm: 42100, depot: 'North Gate Depot' },
  { id: 'VEH-04', busNumber: 'OD-02-BL-8891', fleetCode: 'Bus 04', type: '52-Seater Coach', capacity: 52, allocatedStudents: 46, driver: 'Kailash Sahoo', driverPhone: '+91 94371 00217', routeName: 'Route 4: Jayadev Vihar - KIIT Square', status: 'Active (On Route)', fuelType: 'Diesel (BS-VI)', fitnessExpiry: '2027-08-30', insuranceExpiry: '2027-08-15', pucExpiry: '2027-03-10', permitExpiry: '2028-09-01', odometerKm: 73250, depot: 'Campus Central Bus Bay' },
  { id: 'VEH-05', busNumber: 'OD-02-CL-1209', fleetCode: 'Bus 05', type: '32-Seater Mini Coach', capacity: 32, allocatedStudents: 28, driver: 'Purna Chandra Das', driverPhone: '+91 94371 00218', routeName: 'Route 5: Khordha Bypass', status: 'Under Maintenance', fuelType: 'Diesel', fitnessExpiry: '2026-12-05', insuranceExpiry: '2026-11-20', pucExpiry: '2026-11-15', permitExpiry: '2027-12-10', odometerKm: 89400, depot: 'Campus Workshop Bay 2' },
];

export const initialBusRoutes = [
  { id: 'RT-1', name: 'Route 1: Cuttack Badambadi Express', routeNumber: 'RT-1', morningDeparture: '07:15 AM', eveningArrival: '05:45 PM', stops: ['Badambadi Bus Stand (07:15 AM)', 'Madhupatna Square (07:25 AM)', 'Phulnakhara Bridge (07:45 AM)', 'GIFT Campus Gates (08:30 AM)'], farePerSemester: 16000, activePassHolders: 49, busNumber: 'OD-02-AK-4411', totalCapacity: 52, status: 'Active' },
  { id: 'RT-2', name: 'Route 2: Rasulgarh - Master Canteen', routeNumber: 'RT-2', morningDeparture: '07:30 AM', eveningArrival: '05:30 PM', stops: ['Rasulgarh Square (07:30 AM)', 'Vani Vihar (07:40 AM)', 'Master Canteen (07:50 AM)', 'Kalpana Square (08:00 AM)', 'GIFT Campus (08:35 AM)'], farePerSemester: 14000, activePassHolders: 51, busNumber: 'OD-02-AK-4412', totalCapacity: 52, status: 'Active' },
  { id: 'RT-3', name: 'Route 3: Patia - Infocity - Khandagiri', routeNumber: 'RT-3', morningDeparture: '07:25 AM', eveningArrival: '05:40 PM', stops: ['Patia Square (07:25 AM)', 'Damana (07:35 AM)', 'Jayadev Vihar (07:50 AM)', 'Khandagiri (08:05 AM)', 'GIFT Campus (08:40 AM)'], farePerSemester: 15000, activePassHolders: 38, busNumber: 'OD-02-BL-8890', totalCapacity: 42, status: 'Active' },
  { id: 'RT-4', name: 'Route 4: Jayadev Vihar - KIIT Square - Campus', routeNumber: 'RT-4', morningDeparture: '07:20 AM', eveningArrival: '05:30 PM', stops: ['Jayadev Vihar (07:20 AM)', 'KIIT Square (07:35 AM)', 'Trisulia Bridge (07:55 AM)', 'GIFT Campus (08:30 AM)'], farePerSemester: 14500, activePassHolders: 46, busNumber: 'OD-02-BL-8891', totalCapacity: 52, status: 'Active' },
  { id: 'RT-5', name: 'Route 5: Khordha Bypass - Jatni - Campus', routeNumber: 'RT-5', morningDeparture: '07:45 AM', eveningArrival: '05:20 PM', stops: ['Khordha New Bus Stand (07:45 AM)', 'Jatni Gate (08:00 AM)', 'GIFT Campus (08:25 AM)'], farePerSemester: 12000, activePassHolders: 28, busNumber: 'OD-02-CL-1209', totalCapacity: 32, status: 'Active' },
];

export const initialTransportDrivers = [
  { id: 'DRV-01', name: 'Ramesh Chandra Jena', phone: '+91 94371 00214', emergencyContact: '+91 98610 22101', licenseNumber: 'OD-02-2015-DL-88419', licenseCategory: 'HMV (Heavy Passenger Vehicle)', licenseExpiry: '2028-09-14', experienceYears: 14, assignedBus: 'Bus 01 (OD-02-AK-4411)', assignedRoute: 'Route 1: Cuttack Badambadi Express', shift: 'Morning & Evening (06:30 AM - 06:30 PM)', status: 'Active', safetyIncidents: 0 },
  { id: 'DRV-02', name: 'Bikash Mohanty', phone: '+91 94371 00215', emergencyContact: '+91 98610 22102', licenseNumber: 'OD-02-2017-DL-41920', licenseCategory: 'HMV (Heavy Passenger Vehicle)', licenseExpiry: '2029-04-20', experienceYears: 11, assignedBus: 'Bus 02 (OD-02-AK-4412)', assignedRoute: 'Route 2: Rasulgarh - Master Canteen', shift: 'Morning & Evening (06:45 AM - 06:45 PM)', status: 'Active', safetyIncidents: 0 },
  { id: 'DRV-03', name: 'Sanjay Kumar Rout', phone: '+91 94371 00216', emergencyContact: '+91 98610 22103', licenseNumber: 'OD-02-2012-DL-19402', licenseCategory: 'HMV (Heavy Passenger Vehicle)', licenseExpiry: '2027-11-30', experienceYears: 16, assignedBus: 'Bus 03 (OD-02-BL-8890)', assignedRoute: 'Route 3: Patia - Infocity - Khandagiri', shift: 'Morning & Evening (06:45 AM - 06:45 PM)', status: 'Active', safetyIncidents: 0 },
  { id: 'DRV-04', name: 'Kailash Sahoo', phone: '+91 94371 00217', emergencyContact: '+91 98610 22104', licenseNumber: 'OD-02-2018-DL-98214', licenseCategory: 'HMV (Heavy Passenger Vehicle)', licenseExpiry: '2028-02-15', experienceYears: 9, assignedBus: 'Bus 04 (OD-02-BL-8891)', assignedRoute: 'Route 4: Jayadev Vihar - KIIT Square', shift: 'Morning & Evening (06:30 AM - 06:30 PM)', status: 'Active', safetyIncidents: 0 },
  { id: 'DRV-05', name: 'Purna Chandra Das', phone: '+91 94371 00218', emergencyContact: '+91 98610 22105', licenseNumber: 'OD-02-2016-DL-77312', licenseCategory: 'HMV (Heavy Passenger Vehicle)', licenseExpiry: '2027-08-10', experienceYears: 12, assignedBus: 'Bus 05 (OD-02-CL-1209)', assignedRoute: 'Route 5: Khordha Bypass', shift: 'Morning & Evening (07:00 AM - 07:00 PM)', status: 'Standby / Relief', safetyIncidents: 0 },
];

export const initialBusPasses = [
  { id: 'PASS-2026-01', passNumber: 'PASS-2026-01', studentName: 'Rakesh Das', regNo: '2305201001', department: 'Computer Science & Engineering', semester: 'Semester 5', routeName: 'Route 1: Cuttack Badambadi Express', stopName: 'Badambadi Bus Stand', fareAmount: 16000, feeStatus: 'Paid & Verified', status: 'Active & Verified', validity: 'Autumn Semester 2026', issueDate: '2026-08-01', expiryDate: '2026-12-31', qrToken: 'GIFT-BUS-VERIFY-2305201001-R1' },
  { id: 'PASS-2026-02', passNumber: 'PASS-2026-02', studentName: 'Amit Nayak', regNo: '2305201002', department: 'Computer Science & Engineering', semester: 'Semester 5', routeName: 'Route 2: Rasulgarh - Master Canteen', stopName: 'Master Canteen Square', fareAmount: 14000, feeStatus: 'Paid & Verified', status: 'Active & Verified', validity: 'Autumn Semester 2026', issueDate: '2026-08-01', expiryDate: '2026-12-31', qrToken: 'GIFT-BUS-VERIFY-2305201002-R2' },
  { id: 'PASS-2026-03', passNumber: 'PASS-2026-03', studentName: 'Raj Sahoo', regNo: '2305201003', department: 'Mechanical Engineering', semester: 'Semester 5', routeName: 'Route 3: Patia - Infocity - Khandagiri', stopName: 'Jayadev Vihar', fareAmount: 15000, feeStatus: 'Paid & Verified', status: 'Active & Verified', validity: 'Autumn Semester 2026', issueDate: '2026-08-01', expiryDate: '2026-12-31', qrToken: 'GIFT-BUS-VERIFY-2305201003-R3' },
  { id: 'PASS-2026-04', passNumber: 'PASS-2026-04', studentName: 'Priya Patra', regNo: '2305201004', department: 'Electronics & Communication', semester: 'Semester 5', routeName: 'Route 1: Cuttack Badambadi Express', stopName: 'Madhupatna Square', fareAmount: 16000, feeStatus: 'Pending Verification', status: 'Pending Approval', validity: 'Autumn Semester 2026', issueDate: '2026-10-02', expiryDate: '2026-12-31', qrToken: 'GIFT-BUS-VERIFY-2305201004-PENDING' },
  { id: 'PASS-2026-05', passNumber: 'PASS-2026-05', studentName: 'Sourav Mohanty', regNo: '2305201005', department: 'Civil Engineering', semester: 'Semester 5', routeName: 'Route 4: Jayadev Vihar - KIIT Square', stopName: 'KIIT Square', fareAmount: 14500, feeStatus: 'Paid & Verified', status: 'Active & Verified', validity: 'Autumn Semester 2026', issueDate: '2026-08-05', expiryDate: '2026-12-31', qrToken: 'GIFT-BUS-VERIFY-2305201005-R4' },
];

export const initialTransportTrips = [
  { id: 'TRIP-101', tripCode: 'TRIP-AM-01', routeName: 'Route 1: Cuttack Badambadi Express', serviceType: 'Morning Pickup', vehicle: 'Bus 01 (OD-02-AK-4411)', driver: 'Ramesh Ch. Jena (+91 94371 00214)', scheduledDeparture: '07:15 AM', actualDeparture: '07:16 AM', scheduledArrival: '08:30 AM', actualArrival: '08:28 AM', status: 'Completed', passengerCount: 49, delayMinutes: 0, incidentReport: 'None - On time smoothly' },
  { id: 'TRIP-102', tripCode: 'TRIP-AM-02', routeName: 'Route 2: Rasulgarh - Master Canteen', serviceType: 'Morning Pickup', vehicle: 'Bus 02 (OD-02-AK-4412)', driver: 'Bikash Mohanty (+91 94371 00215)', scheduledDeparture: '07:30 AM', actualDeparture: '07:32 AM', scheduledArrival: '08:35 AM', actualArrival: '08:35 AM', status: 'Completed', passengerCount: 51, delayMinutes: 0, incidentReport: 'None - Regular run' },
  { id: 'TRIP-103', tripCode: 'TRIP-PM-01', routeName: 'Route 1: Cuttack Badambadi Express', serviceType: 'Evening Drop', vehicle: 'Bus 01 (OD-02-AK-4411)', driver: 'Ramesh Ch. Jena (+91 94371 00214)', scheduledDeparture: '05:00 PM', actualDeparture: '05:05 PM', scheduledArrival: '06:15 PM', actualArrival: null, status: 'In Transit', passengerCount: 48, delayMinutes: 5, incidentReport: 'Minor traffic near Phulnakhara Bridge' },
  { id: 'TRIP-104', tripCode: 'TRIP-PM-02', routeName: 'Route 2: Rasulgarh - Master Canteen', serviceType: 'Evening Drop', vehicle: 'Bus 02 (OD-02-AK-4412)', driver: 'Bikash Mohanty (+91 94371 00215)', scheduledDeparture: '05:00 PM', actualDeparture: null, scheduledArrival: '06:05 PM', actualArrival: null, status: 'Scheduled', passengerCount: 50, delayMinutes: 0, incidentReport: 'Boarding at Main Bus Bay Gate 3' },
];


// Initial Placement & Training Cell Data
export const initialPlacementCompanies = [
  { id: 'COMP-01', name: 'Tata Consultancy Services (TCS)', category: 'Tier 1 IT Services', hrContact: 'Ms. Ananya Sengupta', email: 'campus.hiring@tcs.com', packageRange: '₹3.6 LPA - ₹9.2 LPA', totalHiredFromCampus: 124, status: 'Active Partner' },
  { id: 'COMP-02', name: 'Cognizant Technology Solutions', category: 'Global IT Consulting', hrContact: 'Mr. Arvind Krishnan', email: 'university.relations@cognizant.com', packageRange: '₹4.5 LPA - ₹10.0 LPA', totalHiredFromCampus: 88, status: 'Active Partner' },
  { id: 'COMP-03', name: 'Wipro Technologies', category: 'Technology & Cloud', hrContact: 'Ms. Deepika Sharma', email: 'talent.wipro@wipro.com', packageRange: '₹3.8 LPA - ₹6.5 LPA', totalHiredFromCampus: 64, status: 'Active Partner' },
  { id: 'COMP-04', name: 'Cisco Systems India', category: 'Product & Networking', hrContact: 'Mr. Vikram Adve', email: 'india.campus@cisco.com', packageRange: '₹14.0 LPA - ₹24.0 LPA', totalHiredFromCampus: 12, status: 'Dream Recruiter' },
  { id: 'COMP-05', name: 'L&T Technology Services (LTTS)', category: 'Engineering & R&D', hrContact: 'Mr. Rajeshwar Rao', email: 'campus@ltts.com', packageRange: '₹5.5 LPA - ₹8.0 LPA', totalHiredFromCampus: 34, status: 'Active Partner' },
];

export const initialPlacementDrives = [
  {
    id: 'DRIVE-2026-01',
    company: 'Cisco Systems India',
    role: 'Associate Network & Software Engineer',
    packageOffered: '₹18.5 LPA (Dream Package)',
    driveDate: '2026-10-28',
    eligibilityCriteria: { minCgpa: 8.0, maxBacklogs: 0, allowedBranches: ['CSE', 'ECE'], min10thPercent: 75, min12thPercent: 75 },
    registeredCount: 84,
    shortlistedCount: 32,
    selectedCount: 6,
    status: 'Upcoming Interview Rounds',
  },
  {
    id: 'DRIVE-2026-02',
    company: 'Tata Consultancy Services (TCS Digital & Ninja)',
    role: 'Digital Systems Engineer & Innovator',
    packageOffered: '₹7.2 LPA (Digital) / ₹3.6 LPA (Ninja)',
    driveDate: '2026-10-15',
    eligibilityCriteria: { minCgpa: 6.5, maxBacklogs: 1, allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'], min10thPercent: 60, min12thPercent: 60 },
    registeredCount: 310,
    shortlistedCount: 180,
    selectedCount: 42,
    status: 'Shortlisting Completed',
  },
  {
    id: 'DRIVE-2026-03',
    company: 'Cognizant Technology Solutions',
    role: 'Programmer Analyst Trainee (GenC Next)',
    packageOffered: '₹6.75 LPA',
    driveDate: '2026-11-05',
    eligibilityCriteria: { minCgpa: 7.0, maxBacklogs: 0, allowedBranches: ['CSE', 'ECE', 'EEE'], min10thPercent: 65, min12thPercent: 65 },
    registeredCount: 220,
    shortlistedCount: 110,
    selectedCount: 28,
    status: 'Registration Open',
  },
];

// Initial Staff Tickets & Operations (Module A)
export const initialStaffWorkspaces = [
  {
    id: 'TCK-2026-0101',
    ticketNumber: 'TCK-2026-0101',
    title: 'Core Cisco Catalyst Switch Port Failure in Block B Lab 4',
    description: 'Port flapping on interface GigabitEthernet0/12 causing 24 workstations to lose connectivity during DBMS lab.',
    category: 'Computer Hardware',
    building: 'Block B (Computing Center)',
    floor: 'Floor 2',
    room: 'Lab 204 (Advanced DBMS Lab)',
    labName: 'Lab 204 - DBMS & Systems Lab',
    assetCode: 'ASSET-SW-04',
    reporterName: 'Prof. Amit Mishra',
    reporterRole: 'FACULTY',
    reporterDept: 'Computer Science & Engineering',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Mr. Biswajit Sahoo (Senior Lab Asst)',
    assignedRole: 'Network Engineer',
    createdAt: '03 Oct 2026, 09:30 AM',
    responseDueAt: '2026-10-03T11:30:00Z',
    resolutionDueAt: '2026-10-03T17:30:00Z',
    resolutionDetails: '',
    comments: [
      { id: 'CMT-1', author: 'Mr. Biswajit Sahoo', role: 'STAFF', text: 'Spared Cat6 patch cables tested. SFP module replacement requested from hardware store.', isInternal: true, createdAt: '03 Oct 2026, 10:15 AM' }
    ],
    history: [
      { action: 'CREATED', stage: 'Open', by: 'Prof. Amit Mishra', notes: 'Ticket logged for switch port flapping', timestamp: '03 Oct 2026, 09:30 AM' },
      { action: 'ASSIGNED', stage: 'Assigned', by: 'Campus Operations Desk', notes: 'Assigned to Mr. Biswajit Sahoo', timestamp: '03 Oct 2026, 09:40 AM' },
      { action: 'IN_PROGRESS', stage: 'In Progress', by: 'Mr. Biswajit Sahoo', notes: 'Investigation on-site initiated', timestamp: '03 Oct 2026, 10:00 AM' }
    ]
  },
  {
    id: 'TCK-2026-0102',
    ticketNumber: 'TCK-2026-0102',
    title: 'Short Circuit & Power Surge in AI / ML GPU Rig Cluster',
    description: 'UPS battery bank trip triggered in High-Performance AI Research Lab. 4 NVIDIA RTX A6000 workstations down.',
    category: 'Electrical',
    building: 'Block A (R&D Block)',
    floor: 'Floor 3',
    room: 'Room 312 (AI Research Lab)',
    labName: 'AI & Deep Learning Complex',
    assetCode: 'ASSET-GPU-01',
    reporterName: 'Dr. P. K. Pattnaik (HOD)',
    reporterRole: 'HOD',
    reporterDept: 'Computer Science & Engineering',
    priority: 'Critical',
    status: 'Assigned',
    assignedTo: 'Mr. Dilip Behera (Senior Electrician)',
    assignedRole: 'Electrical Technician',
    createdAt: '04 Oct 2026, 08:15 AM',
    responseDueAt: '2026-10-04T08:45:00Z',
    resolutionDueAt: '2026-10-04T12:15:00Z',
    resolutionDetails: '',
    comments: [
      { id: 'CMT-2', author: 'Dr. P. K. Pattnaik', role: 'HOD', text: 'MTech thesis benchmark training currently suspended. Needs immediate electrical clearance.', isInternal: false, createdAt: '04 Oct 2026, 08:20 AM' }
    ],
    history: [
      { action: 'CREATED', stage: 'Open', by: 'Dr. P. K. Pattnaik', notes: 'Urgent critical incident raised', timestamp: '04 Oct 2026, 08:15 AM' },
      { action: 'ASSIGNED', stage: 'Assigned', by: 'Campus Operations Desk', notes: 'Assigned to Electrical Team', timestamp: '04 Oct 2026, 08:25 AM' }
    ]
  },
  {
    id: 'TCK-2026-0103',
    ticketNumber: 'TCK-2026-0103',
    title: 'Central HVAC Chiller Plant Compressor Noise & Filter Servicing',
    description: 'Routine quarterly servicing and refrigerant gas pressure calibration for Block C auditorium air handling units.',
    category: 'HVAC',
    building: 'Block C (Main Auditorium & Seminar Halls)',
    floor: 'Basement',
    room: 'AHU Plant Room 02',
    labName: 'Central Auditorium',
    assetCode: 'ASSET-HVAC-02',
    reporterName: 'Sri Manoranjan Tripathy',
    reporterRole: 'ADMIN',
    reporterDept: 'Administrative Operations',
    priority: 'Normal',
    status: 'Open',
    assignedTo: 'Voltas Authorised Service Team',
    assignedRole: 'External Vendor',
    createdAt: '04 Oct 2026, 11:00 AM',
    responseDueAt: '2026-10-04T15:00:00Z',
    resolutionDueAt: '2026-10-05T11:00:00Z',
    resolutionDetails: '',
    comments: [],
    history: [
      { action: 'CREATED', stage: 'Open', by: 'Sri Manoranjan Tripathy', notes: 'Preventive maintenance work order created', timestamp: '04 Oct 2026, 11:00 AM' }
    ]
  },
  {
    id: 'TCK-2026-0104',
    ticketNumber: 'TCK-2026-0104',
    title: 'Ceiling Projector HDMI Handshake Error in Lecture Hall LH-201',
    description: 'Epson High-Lumen Projector throwing display resolution sync error during faculty PowerPoint presentations.',
    category: 'IT Support',
    building: 'Block A (Academic Block)',
    floor: 'Floor 2',
    room: 'Lecture Hall 201',
    labName: 'Multimedia Smart Classroom',
    assetCode: 'ASSET-AV-109',
    reporterName: 'Prof. S. R. Mohanty',
    reporterRole: 'FACULTY',
    reporterDept: 'Electronics & Communication',
    priority: 'Normal',
    status: 'Resolved',
    assignedTo: 'Mr. Ranjan Sahu (AV Technician)',
    assignedRole: 'AV Support',
    createdAt: '02 Oct 2026, 10:00 AM',
    responseDueAt: '2026-10-02T14:00:00Z',
    resolutionDueAt: '2026-10-03T10:00:00Z',
    resolutionDetails: 'Replaced faulty 10-meter HDMI active optical cable with high-speed 4K braided cable. EDID handshake verified with faculty laptop.',
    resolvedAt: '02 Oct 2026, 01:30 PM',
    comments: [
      { id: 'CMT-3', author: 'Mr. Ranjan Sahu', role: 'STAFF', text: 'Cable replaced and projector firmware reset complete.', isInternal: false, createdAt: '02 Oct 2026, 01:25 PM' }
    ],
    history: [
      { action: 'CREATED', stage: 'Open', by: 'Prof. S. R. Mohanty', notes: 'Projector display issue', timestamp: '02 Oct 2026, 10:00 AM' },
      { action: 'RESOLVED', stage: 'Resolved', by: 'Mr. Ranjan Sahu', notes: 'HDMI Cable replaced', timestamp: '02 Oct 2026, 01:30 PM' }
    ]
  }
];

// Initial Visitor Gate Passes (Module B)
export const initialVisitorPasses = [
  {
    id: 'GP-2026-0901',
    passNumber: 'GP-2026-0901',
    visitorName: 'Mr. Arvind Krishnan',
    organization: 'Cognizant Technology Solutions',
    phone: '+91 98450 11200',
    email: 'arvind.krishnan@cognizant.com',
    purpose: 'Campus Placement Drive & HR Panel Coordination',
    hostPerson: 'Prof. Sudhanshu S. Ray (Head T&P)',
    hostDept: 'Training & Placement Cell',
    guestCount: 3,
    badgeNumber: 'BADGE-04',
    expectedArrival: '2026-10-09',
    inTime: '09:30 AM',
    outTime: null,
    status: 'Checked In',
    verificationToken: 'GIFT-VERIFY-901-SECURE-TOKEN',
    history: [
      { action: 'REGISTERED', by: 'Ms. Mamata Jena (Reception)', notes: 'Pre-registered corporate guest', timestamp: '09 Oct 2026, 09:15 AM' },
      { action: 'CHECKED_IN', by: 'Security Main Gate Post 1', notes: 'Guest verified, 3 guest badges allocated', timestamp: '09 Oct 2026, 09:30 AM' }
    ]
  },
  {
    id: 'GP-2026-0902',
    passNumber: 'GP-2026-0902',
    visitorName: 'Dr. R. C. Mohanty',
    organization: 'AICTE / BPUT Academic Audit Committee',
    phone: '+91 94371 44550',
    email: 'rc.mohanty@bput.ac.in',
    purpose: 'Autonomous College Annual Academic Quality Review',
    hostPerson: 'Dr. Sujit Kumar Khuntia (Principal)',
    hostDept: 'Office of the Principal',
    guestCount: 2,
    badgeNumber: 'BADGE-01',
    expectedArrival: '2026-10-09',
    inTime: '10:15 AM',
    outTime: null,
    status: 'Checked In',
    verificationToken: 'GIFT-VERIFY-902-SECURE-TOKEN',
    history: [
      { action: 'REGISTERED', by: 'Principal Office Secretariat', notes: 'VIP statutory inspection', timestamp: '08 Oct 2026, 04:00 PM' },
      { action: 'CHECKED_IN', by: 'Security Main Gate Post 1', notes: 'VIP car entry & security pass clearance', timestamp: '09 Oct 2026, 10:15 AM' }
    ]
  },
  {
    id: 'GP-2026-0903',
    passNumber: 'GP-2026-0903',
    visitorName: 'Mr. Rajesh Jena',
    organization: 'Voltas Central HVAC Engineering',
    phone: '+91 94378 22114',
    email: 'rajesh.jena@voltas-service.com',
    purpose: 'Main Plant Chiller Quarterly Overhaul',
    hostPerson: 'Mr. Dilip Behera (Maintenance)',
    hostDept: 'Campus Maintenance',
    guestCount: 2,
    badgeNumber: 'BADGE-12',
    expectedArrival: '2026-10-09',
    inTime: '08:00 AM',
    outTime: '12:45 PM',
    status: 'Checked Out',
    verificationToken: 'GIFT-VERIFY-903-SECURE-TOKEN',
    history: [
      { action: 'CHECKED_IN', by: 'Security Gate Post 2', notes: 'Service tool kit inspection cleared', timestamp: '09 Oct 2026, 08:00 AM' },
      { action: 'CHECKED_OUT', by: 'Security Gate Post 2', notes: 'Service sign-off verified, badge returned', timestamp: '09 Oct 2026, 12:45 PM' }
    ]
  },
  {
    id: 'GP-2026-0904',
    passNumber: 'GP-2026-0904',
    visitorName: 'Ms. Priyadarshini Senapati',
    organization: 'Tata Consultancy Services',
    phone: '+91 97761 55210',
    email: 'priyadarshini.s@tcs.com',
    purpose: 'TCS HackQuest National Challenge Campus Orientation',
    hostPerson: 'Dr. P. K. Pattnaik (HOD)',
    hostDept: 'Computer Science & Engineering',
    guestCount: 1,
    badgeNumber: '',
    expectedArrival: '2026-10-10',
    inTime: null,
    outTime: null,
    status: 'Approved',
    verificationToken: 'GIFT-VERIFY-904-SECURE-TOKEN',
    history: [
      { action: 'REGISTERED', by: 'Ms. Mamata Jena (Reception)', notes: 'Expected guest for tomorrow orientation', timestamp: '09 Oct 2026, 02:00 PM' }
    ]
  }
];

// Initial Clerical Inward / Outward Dispatch Registers (Module C)
export const initialDispatchRecords = [
  {
    id: 'DISP-01',
    refNumber: 'INW-2026-0419',
    dispatchType: 'INWARD',
    subject: 'AICTE Extension of Approval (EOA) for Academic Year 2026-27',
    category: 'Regulatory / Statutory',
    partyName: 'Member Secretary, AICTE Eastern Regional Office',
    partyOrg: 'All India Council for Technical Education, New Delhi',
    partyContact: '+91 11 2958 1000',
    department: 'Office of the Principal',
    assignedOfficer: 'Sri Manoranjan Tripathy (CAO)',
    priority: 'Immediate',
    docType: 'Official Gazetted Notification',
    confidentiality: 'Confidential',
    trackingNumber: 'ED847291044IN',
    courierName: 'Speed Post (India Post)',
    recordDate: '07 Oct 2026',
    status: 'Delivered',
    proofAttachment: 'EOA_Letter_2026_27_AICTE.pdf',
    notes: 'Received in sealed speed post pouch. Original placed in Autonomous Statutory Charter Archive.',
    history: [
      { action: 'RECEIVED', by: 'Mr. P. C. Mohapatra (Clerk)', notes: 'Speed post signed at dispatch counter', timestamp: '07 Oct 2026, 11:30 AM' },
      { action: 'DELIVERED', by: 'Mr. P. C. Mohapatra (Clerk)', notes: 'Handed over to CAO office desk', timestamp: '07 Oct 2026, 12:00 PM' }
    ]
  },
  {
    id: 'DISP-02',
    refNumber: 'OUT-2026-0312',
    dispatchType: 'OUTWARD',
    subject: 'Dispatch of Final BTech Degree Certificates & Migration Rolls to BPUT University',
    category: 'Autonomous Examination Cell',
    partyName: 'Controller of Examinations, BPUT',
    partyOrg: 'Biju Patnaik University of Technology, Rourkela',
    partyContact: '+91 661 2484 011',
    department: 'Autonomous Examination Cell',
    assignedOfficer: 'Dr. Tarini Charan Panda (CoE)',
    priority: 'Urgent',
    docType: 'Degree Dossier & Grade Roster Packets',
    confidentiality: 'Strictly Secret',
    trackingNumber: 'SP910248551IN',
    courierName: 'Speed Post Secure Registry',
    recordDate: '08 Oct 2026',
    status: 'Dispatched',
    proofAttachment: 'BPUT_Degree_Dispatch_Consignment_Note.pdf',
    notes: 'Covered under tamper-evident security envelope with official seal of Apna Campus.',
    history: [
      { action: 'REGISTERED', by: 'Exam Cell Clerk', notes: 'Consignment booked for university dispatch', timestamp: '08 Oct 2026, 02:00 PM' },
      { action: 'APPROVED', by: 'Dr. Tarini Charan Panda', notes: 'CoE authorization stamp appended', timestamp: '08 Oct 2026, 03:15 PM' },
      { action: 'DISPATCHED', by: 'Mr. P. C. Mohapatra', notes: 'Deposited at Chandaka Post Office counter', timestamp: '08 Oct 2026, 04:45 PM' }
    ]
  },
  {
    id: 'DISP-03',
    refNumber: 'INW-2026-0420',
    dispatchType: 'INWARD',
    subject: 'IEEE Conference Grant Sanction Memorandum & Cheque Realization',
    category: 'Research & Consultancy',
    partyName: 'Finance Chair, IEEE Bhubaneswar Section',
    partyOrg: 'Institute of Electrical and Electronics Engineers',
    partyContact: '+91 94370 12890',
    department: 'Computer Science & Engineering',
    assignedOfficer: 'Dr. S. Mohanty (Assoc Prof CSE)',
    priority: 'Normal',
    docType: 'Grant Sanction Order & DD Receipt',
    confidentiality: 'Normal',
    trackingNumber: 'BLR5542199',
    courierName: 'Blue Dart Express',
    recordDate: '08 Oct 2026',
    status: 'Under Review',
    proofAttachment: 'IEEE_Grant_Sanction_Mem.pdf',
    notes: 'Forwarded to Accounts division for institutional ledger credit and receipt generation.',
    history: [
      { action: 'REGISTERED', by: 'Mr. P. C. Mohapatra', notes: 'Indexed under Research grants inward docket', timestamp: '08 Oct 2026, 01:10 PM' }
    ]
  },
  {
    id: 'DISP-04',
    refNumber: 'OUT-2026-0313',
    dispatchType: 'OUTWARD',
    subject: 'RMA Return of Faulty High-End NVIDIA Quadro GPU Cards to Dell India Services',
    category: 'Hardware Maintenance / RMA',
    partyName: 'Dell Technical RMA Depot',
    partyOrg: 'Dell International Services India Pvt Ltd, Bangalore',
    partyContact: '+91 80 2806 8000',
    department: 'Campus Technical & Lab Operations',
    assignedOfficer: 'Mr. Biswajit Sahoo (Senior Lab Asst)',
    priority: 'Urgent',
    docType: 'Equipment Return Material Authorization (RMA)',
    confidentiality: 'Normal',
    trackingNumber: 'DL492019488IN',
    courierName: 'DTDC Secure Cargo',
    recordDate: '09 Oct 2026',
    status: 'Approved',
    proofAttachment: 'Dell_RMA_Waybill_9921.pdf',
    notes: 'Transit packaging inspected with antistatic wrap and shock absorbers.',
    history: [
      { action: 'REGISTERED', by: 'Mr. Debasis Rout', notes: 'RMA docket created', timestamp: '09 Oct 2026, 10:00 AM' },
      { action: 'APPROVED', by: 'Sri Manoranjan Tripathy', notes: 'Outward gate pass approved', timestamp: '09 Oct 2026, 11:30 AM' }
    ]
  }
];

// Initial Campus Assets & Lab Equipment (Module D)
export const initialLabAssets = [
  {
    id: 'AST-01',
    assetCode: 'ASSET-SW-04',
    name: 'Cisco Catalyst 3850 48-Port Gigabit Core Switch',
    category: 'Network Infrastructure',
    labName: 'Lab 204 - DBMS & Systems Lab',
    building: 'Block B',
    room: 'Room 204',
    department: 'Computer Science & Engineering',
    condition: 'Under Maintenance',
    manufacturer: 'Cisco Systems',
    serialNumber: 'SN-CAT3850-99214A',
    custodian: 'Mr. Biswajit Sahoo (Lab Asst)',
    lastMaintenance: '2026-07-15',
    nextMaintenance: '2026-10-15',
    downtimeHours: 12,
    status: 'Under Maintenance'
  },
  {
    id: 'AST-02',
    assetCode: 'ASSET-GPU-01',
    name: 'NVIDIA RTX A6000 48GB High-Performance Computing Rig',
    category: 'AI / HPC Computing',
    labName: 'AI & Deep Learning Complex',
    building: 'Block A',
    room: 'Room 312',
    department: 'Computer Science & Engineering',
    condition: 'Faulty',
    manufacturer: 'Supermicro / NVIDIA',
    serialNumber: 'SN-SM-A6000-88190',
    custodian: 'Mr. Debasis Rout (Senior Systems Engineer)',
    lastMaintenance: '2026-08-10',
    nextMaintenance: '2026-10-10',
    downtimeHours: 8,
    status: 'Faulty'
  },
  {
    id: 'AST-03',
    assetCode: 'ASSET-WS-CLUSTER-01',
    name: '60x HP Z4 G4 Workstation Cluster (Intel Xeon / 64GB RAM)',
    category: 'Workstations',
    labName: 'Lab 101 - Programming & Algorithmic Computing Lab',
    building: 'Block B',
    room: 'Room 101',
    department: 'Computer Science & Engineering',
    condition: 'Operational',
    manufacturer: 'HP Enterprise',
    serialNumber: 'SN-HPZ4-BATCH-101',
    custodian: 'Ms. Mamata Nayak (Lab Asst)',
    lastMaintenance: '2026-09-01',
    nextMaintenance: '2026-12-01',
    downtimeHours: 0,
    status: 'Operational'
  },
  {
    id: 'AST-04',
    assetCode: 'ASSET-HVAC-02',
    name: 'Voltas 40 TR Central Water-Cooled Screw Chiller Plant',
    category: 'HVAC & Climate Control',
    labName: 'Central Auditorium & Conference Complex',
    building: 'Block C',
    room: 'Basement AHU Room',
    department: 'Campus Maintenance',
    condition: 'Operational',
    manufacturer: 'Voltas Limited',
    serialNumber: 'SN-VLT-CHILL-4402',
    custodian: 'Mr. Dilip Behera (Technician)',
    lastMaintenance: '2026-06-20',
    nextMaintenance: '2026-10-20',
    downtimeHours: 2,
    status: 'Operational'
  },
  {
    id: 'AST-05',
    assetCode: 'ASSET-AV-109',
    name: 'Epson EB-2250U 5000-Lumens WUXGA Laser Projector',
    category: 'Audiovisual Equipment',
    labName: 'Lecture Hall 201',
    building: 'Block A',
    room: 'Room 201',
    department: 'Electronics & Communication',
    condition: 'Operational',
    manufacturer: 'Epson India',
    serialNumber: 'SN-EPS-2250-9941',
    custodian: 'Mr. Ranjan Sahu (AV Tech)',
    lastMaintenance: '2026-10-02',
    nextMaintenance: '2027-01-02',
    downtimeHours: 3.5,
    status: 'Operational'
  },
  {
    id: 'AST-06',
    assetCode: 'ASSET-CNC-01',
    name: 'Haas VF-2 3-Axis Vertical CNC Machining Center',
    category: 'Mechanical Workshop Equipment',
    labName: 'Advanced Manufacturing & Robotics Center',
    building: 'Workshop Block 1',
    room: 'CNC Bay 01',
    department: 'Mechanical Engineering',
    condition: 'Operational',
    manufacturer: 'Haas Automation',
    serialNumber: 'SN-HAAS-VF2-7710',
    custodian: 'Mr. S. K. Mahapatra (Workshop Foreman)',
    lastMaintenance: '2026-09-15',
    nextMaintenance: '2026-11-15',
    downtimeHours: 0,
    status: 'Operational'
  }
];

// Initial Institutional Leave Applications Workflow
export const initialLeaveRequests = [
  {
    id: 'LV-2026-091',
    applicantName: 'Dr. S. Mohanty',
    applicantRole: 'Faculty (Associate Professor, CSE)',
    applicantId: 'FAC-042',
    department: 'Computer Science & Engineering',
    leaveType: 'Academic / Conference Duty Leave',
    startDate: '2026-10-16',
    endDate: '2026-10-18',
    totalDays: 3,
    reason: 'Presenting research paper at IEEE International Conference on Cloud Systems, IIT Kharagpur',
    hodStatus: 'Approved & Recommended',
    hodRemarks: 'Classes for Sem 5 Sec A rearranged with Prof. Rahul Sharma.',
    principalStatus: 'Pending Final Stamp', // Approved, Rejected, Pending Final Stamp
    appliedAt: '02 Oct 2026',
  },
  {
    id: 'LV-2026-092',
    applicantName: 'Prof. Amit Mishra',
    applicantRole: 'Faculty (Assistant Professor, CSE)',
    applicantId: 'FAC-044',
    department: 'Computer Science & Engineering',
    leaveType: 'Casual Leave (Medical)',
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    totalDays: 2,
    reason: 'Medical consultation and health checkup.',
    hodStatus: 'Approved & Recommended',
    hodRemarks: 'Substitute faculty assigned for OS lecture.',
    principalStatus: 'Approved',
    appliedAt: '01 Oct 2026',
  },
  {
    id: 'LV-2026-093',
    applicantName: 'Rakesh Das',
    applicantRole: 'Student (Roll 01, Sem 5)',
    applicantId: '2305201001',
    department: 'Computer Science & Engineering',
    leaveType: 'On Duty / Hackathon Leave',
    startDate: '2026-10-22',
    endDate: '2026-10-24',
    totalDays: 3,
    reason: 'Participating in Smart India Hackathon (SIH 2026) Grand Finale representing Apna Campus.',
    hodStatus: 'Approved & Recommended',
    hodRemarks: 'Attendance credit to be granted upon submission of participation certificate.',
    principalStatus: 'Approved',
    appliedAt: '30 Sep 2026',
  },
];

class ERPEnterpriseStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(ERP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          settings: parsed.settings || initialSystemSettings,
          roles: parsed.roles || initialRolesList,
          rolePermissions: parsed.rolePermissions || initialRolePermissions,
          examCycles: parsed.examCycles || initialExamCycles,
          examTimetable: parsed.examTimetable || initialExamTimetable,
          seatingArrangements: parsed.seatingArrangements || initialSeatingArrangements,
          gradeRoster: parsed.gradeRoster || initialGradeRoster,
          examHallTickets: parsed.examHallTickets || initialHallTickets,
          moderationMarks: parsed.moderationMarks || initialModerationMarks,
          reevaluationRequests: parsed.reevaluationRequests || initialReevaluationRequests,
          examCirculars: parsed.examCirculars || initialExamCirculars,
          booksCatalog: parsed.booksCatalog || initialBooksCatalog,
          circulationRecords: parsed.circulationRecords || initialCirculationRecords,
          fleetVehicles: parsed.fleetVehicles || initialFleetVehicles,
          busRoutes: parsed.busRoutes || initialBusRoutes,
          transportDrivers: parsed.transportDrivers || initialTransportDrivers,
          busPasses: parsed.busPasses || initialBusPasses,
          transportTrips: parsed.transportTrips || initialTransportTrips,
          placementCompanies: parsed.placementCompanies || initialPlacementCompanies,
          placementDrives: parsed.placementDrives || initialPlacementDrives,
          staffWorkspaces: parsed.staffWorkspaces || initialStaffWorkspaces,
          visitorPasses: parsed.visitorPasses || initialVisitorPasses,
          dispatchRecords: parsed.dispatchRecords || initialDispatchRecords,
          labAssets: parsed.labAssets || initialLabAssets,
          leaveRequests: parsed.leaveRequests || initialLeaveRequests,
          auditLogs: parsed.auditLogs || [],
        };
      }
    } catch (err) {
      console.warn('ERP Store fallback to in-memory initial state:', err);
    }

    return {
      settings: initialSystemSettings,
      roles: initialRolesList,
      rolePermissions: initialRolePermissions,
      examCycles: initialExamCycles,
      examTimetable: initialExamTimetable,
      seatingArrangements: initialSeatingArrangements,
      gradeRoster: initialGradeRoster,
      examHallTickets: initialHallTickets,
      moderationMarks: initialModerationMarks,
      reevaluationRequests: initialReevaluationRequests,
      examCirculars: initialExamCirculars,
      booksCatalog: initialBooksCatalog,
      circulationRecords: initialCirculationRecords,
      fleetVehicles: initialFleetVehicles,
      busRoutes: initialBusRoutes,
      transportDrivers: initialTransportDrivers,
      busPasses: initialBusPasses,
      transportTrips: initialTransportTrips,
      placementCompanies: initialPlacementCompanies,
      placementDrives: initialPlacementDrives,
      staffWorkspaces: initialStaffWorkspaces,
      visitorPasses: initialVisitorPasses,
      dispatchRecords: initialDispatchRecords,
      labAssets: initialLabAssets,
      leaveRequests: initialLeaveRequests,
      auditLogs: [
        { id: 'AUD-991', user: 'Super Administrator', role: 'SUPER_ADMIN', action: 'RBAC Permission Modification', target: 'Faculty Role Permissions', oldValue: 'Read-only materials', newValue: 'Granted internal marks entry', timestamp: '04 Oct 2026, 11:20 AM', ipAddress: '192.168.1.10', status: 'Success' },
        { id: 'AUD-992', user: 'Dr. P. K. Pattnaik (HOD)', role: 'HOD', action: 'Approved Faculty Duty Leave', target: 'Dr. S. Mohanty (FAC-042)', oldValue: 'Pending', newValue: 'Approved & Forwarded to Principal', timestamp: '03 Oct 2026, 04:15 PM', ipAddress: '192.168.1.44', status: 'Success' },
        { id: 'AUD-993', user: 'Exam Controller Office', role: 'EXAM_CELL', action: 'Published Result Cycle', target: 'Autonomous End-Sem Autumn 2026', oldValue: 'Grading In Progress', newValue: 'Certified & Published', timestamp: '02 Oct 2026, 06:00 PM', ipAddress: '192.168.2.15', status: 'Success' },
        { id: 'AUD-994', user: 'Accounts Senior Officer', role: 'ACCOUNTS', action: 'Reconciled Bank UTR', target: 'Student Fee Receipt #RCP-2026-8821', oldValue: 'Pending Verification', newValue: 'Approved & Ledger Settled', timestamp: '01 Oct 2026, 02:30 PM', ipAddress: '192.168.1.80', status: 'Success' },
      ],
    };
  }

  save() {
    try {
      localStorage.setItem(ERP_STORAGE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new CustomEvent('erp_store_updated', { detail: this.state }));
    } catch (err) {
      console.error('Failed to write ERP store state:', err);
    }
  }

  // --- Audit Logging ---
  logAuditEvent({ user = 'System', role = 'ADMIN', action, target, oldValue = '—', newValue = '—', status = 'Success' }) {
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      user,
      role,
      action,
      target,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 80),
      status,
    };
    this.state.auditLogs = [newLog, ...(this.state.auditLogs || [])];
    this.save();
    return newLog;
  }

  getAuditLogs() {
    return this.state.auditLogs || [];
  }

  // --- System Settings ---
  getSettings() {
    return this.state.settings;
  }

  updateSettings(partial) {
    const old = { ...this.state.settings };
    this.state.settings = { ...this.state.settings, ...partial };
    this.logAuditEvent({
      user: 'Super Administrator',
      role: 'SUPER_ADMIN',
      action: 'Updated System Settings',
      target: 'Institutional Configuration',
      oldValue: JSON.stringify(old),
      newValue: JSON.stringify(this.state.settings),
    });
    this.save();
    return this.state.settings;
  }

  // --- RBAC & Permissions ---
  getRolePermissions() {
    return this.state.rolePermissions;
  }

  togglePermission(roleKey, permissionId) {
    const current = this.state.rolePermissions[roleKey] || [];
    const exists = current.includes(permissionId);
    let updated;
    if (exists) {
      updated = current.filter(p => p !== permissionId);
    } else {
      updated = [...current, permissionId];
    }
    this.state.rolePermissions[roleKey] = updated;
    this.logAuditEvent({
      user: 'Super Administrator',
      role: 'SUPER_ADMIN',
      action: exists ? 'Revoked Permission' : 'Granted Permission',
      target: `Role: ${roleKey} -> ${permissionId}`,
      oldValue: exists ? 'Granted' : 'Revoked',
      newValue: exists ? 'Revoked' : 'Granted',
    });
    this.save();
    return this.state.rolePermissions;
  }

  // --- Examination Cell ---
  getExamCycles() {
    return this.state.examCycles || [];
  }

  createExamCycle(data) {
    const newCycle = {
      id: data.id || `EXAM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: data.title || 'Untitled Examination Cycle',
      session: data.session || 'Academic Year 2026-27',
      status: data.status || 'Draft',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      totalRegisteredStudents: Number(data.totalRegisteredStudents) || 1200,
      hallTicketsReleased: Boolean(data.hallTicketsReleased),
      totalPapers: Number(data.totalPapers) || 30,
      moderationStatus: data.moderationStatus || 'Not Started',
      publishedDate: data.publishedDate || 'Pending',
    };
    this.state.examCycles = [newCycle, ...(this.state.examCycles || [])];
    this.logAuditEvent({
      user: 'Exam Controller Office',
      role: 'EXAM_CELL',
      action: 'Created Examination Cycle',
      target: newCycle.title,
      newValue: newCycle.id,
    });
    this.save();
    return newCycle;
  }

  updateExamCycle(id, partial) {
    const cycle = (this.state.examCycles || []).find(c => c.id === id);
    if (cycle) {
      Object.assign(cycle, partial);
      this.save();
    }
    return cycle;
  }

  deleteExamCycle(id) {
    const found = (this.state.examCycles || []).find(c => c.id === id);
    this.state.examCycles = (this.state.examCycles || []).filter(c => c.id !== id);
    if (found) {
      this.logAuditEvent({
        user: 'Exam Controller Office',
        role: 'EXAM_CELL',
        action: 'Deleted Examination Cycle',
        target: found.title,
        oldValue: found.id,
      });
      this.save();
    }
    return this.state.examCycles;
  }

  toggleHallTicketsRelease(cycleId) {
    const cycle = (this.state.examCycles || []).find(c => c.id === cycleId);
    if (cycle) {
      cycle.hallTicketsReleased = !cycle.hallTicketsReleased;
      this.logAuditEvent({
        user: 'Exam Controller Office',
        role: 'EXAM_CELL',
        action: cycle.hallTicketsReleased ? 'Released Hall Tickets' : 'Revoked Hall Tickets to Draft',
        target: cycle.title,
        newValue: cycle.hallTicketsReleased ? 'Released' : 'Draft Hold',
      });
      this.save();
    }
    return cycle;
  }

  publishExamCycle(cycleId) {
    const cycle = this.state.examCycles.find(c => c.id === cycleId);
    if (cycle) {
      cycle.status = 'Published';
      cycle.publishedDate = new Date().toLocaleDateString('en-GB');
      this.logAuditEvent({
        user: 'Exam Controller Office',
        role: 'EXAM_CELL',
        action: 'Certified and Published Exam Results',
        target: cycle.title,
        oldValue: 'Grading / Moderation',
        newValue: 'Published to Student Transcripts',
      });
      this.save();
    }
    return cycle;
  }

  // --- Exam Timetable ---
  getExamTimetable() {
    return this.state.examTimetable || [];
  }

  createTimetableEntry(entry) {
    const newEntry = {
      id: entry.id || `ET-${Math.floor(100 + Math.random() * 900)}`,
      code: entry.code?.toUpperCase() || 'CS101',
      subject: entry.subject || 'Course Subject',
      date: entry.date || new Date().toISOString().split('T')[0],
      time: entry.time || '10:00 AM - 01:00 PM',
      semester: entry.semester || 'Semester 5',
      branches: Array.isArray(entry.branches) ? entry.branches : (entry.branches ? entry.branches.split(',').map(b => b.trim()) : ['CSE']),
      roomCount: Number(entry.roomCount) || 8,
      invigilators: Number(entry.invigilators) || 16,
    };
    this.state.examTimetable = [...(this.state.examTimetable || []), newEntry];
    this.logAuditEvent({
      user: 'Exam Controller Office',
      role: 'EXAM_CELL',
      action: 'Scheduled Exam Paper',
      target: `${newEntry.code} - ${newEntry.subject}`,
      newValue: `${newEntry.date} (${newEntry.time})`,
    });
    this.save();
    return newEntry;
  }

  updateTimetableEntry(id, partial) {
    const entry = (this.state.examTimetable || []).find(e => e.id === id);
    if (entry) {
      Object.assign(entry, partial);
      this.save();
    }
    return entry;
  }

  deleteTimetableEntry(id) {
    const found = (this.state.examTimetable || []).find(e => e.id === id);
    this.state.examTimetable = (this.state.examTimetable || []).filter(e => e.id !== id);
    if (found) {
      this.logAuditEvent({
        user: 'Exam Controller Office',
        role: 'EXAM_CELL',
        action: 'Cancelled Timetable Slot',
        target: `${found.code} - ${found.subject}`,
        oldValue: found.date,
      });
      this.save();
    }
    return this.state.examTimetable;
  }

  // --- Seating Arrangements ---
  getSeatingArrangements() {
    return this.state.seatingArrangements || [];
  }

  createSeatingArrangement(hallData) {
    const newArrangement = {
      hall: hallData.hall || `Exam Hall ${Math.floor(100 + Math.random() * 900)}`,
      capacity: Number(hallData.capacity) || 60,
      allocated: Number(hallData.allocated) || Number(hallData.capacity) || 60,
      invigilator: hallData.invigilator || 'Faculty Invigilator',
      session: hallData.session || 'Morning (10:00 AM)',
      range: hallData.range || 'Roll Range (Allocated Students)',
    };
    this.state.seatingArrangements = [...(this.state.seatingArrangements || []), newArrangement];
    this.logAuditEvent({
      user: 'Exam Controller Office',
      role: 'EXAM_CELL',
      action: 'Configured Examination Hall',
      target: newArrangement.hall,
      newValue: `${newArrangement.allocated}/${newArrangement.capacity} Desks`,
    });
    this.save();
    return newArrangement;
  }

  updateSeatingArrangement(hallName, partial) {
    const arr = (this.state.seatingArrangements || []).find(a => a.hall === hallName);
    if (arr) {
      Object.assign(arr, partial);
      this.save();
    }
    return arr;
  }

  deleteSeatingArrangement(hallName) {
    this.state.seatingArrangements = (this.state.seatingArrangements || []).filter(a => a.hall !== hallName);
    this.save();
    return this.state.seatingArrangements;
  }

  autoGenerateSeating() {
    // Re-calculates and staggers roll allocations across halls
    const halls = [
      { hall: 'Exam Hall B-301', capacity: 60, allocated: 58, invigilator: 'Dr. Priya Ranjan (Associate Prof)', session: 'Morning (10:00 AM)', range: '2305201001 to 2305201058 (CSE Sec A)' },
      { hall: 'Exam Hall B-302', capacity: 60, allocated: 60, invigilator: 'Prof. Amit Mishra (Assistant Prof)', session: 'Morning (10:00 AM)', range: '2305201059 to 2305201118 (CSE Sec B)' },
      { hall: 'Exam Hall B-303', capacity: 60, allocated: 56, invigilator: 'Prof. Debashis Jena (Assistant Prof)', session: 'Morning (10:00 AM)', range: '2305201119 to 2305201174 (CSE Sec C)' },
      { hall: 'Exam Hall C-101', capacity: 50, allocated: 48, invigilator: 'Dr. S. K. Nayak (Senior Faculty)', session: 'Morning (10:00 AM)', range: '2305202001 to 2305202048 (AI&DS Sec A)' },
      { hall: 'Central Aud. Floor 1', capacity: 120, allocated: 116, invigilator: 'Dr. Sneha Ray (Chief Superintendent)', session: 'Morning (10:00 AM)', range: 'Mixed Branches (ECE / EEE Sem 5)' },
    ];
    this.state.seatingArrangements = halls;
    this.logAuditEvent({
      user: 'Exam Controller Office',
      role: 'EXAM_CELL',
      action: 'Executed Automatic Seating Optimization & Anti-Cheating Staggering',
      target: '5 Examination Halls · 338 Desks',
      newValue: '100% Optimized',
    });
    this.save();
    return halls;
  }

  // --- Hall Tickets / Admit Cards ---
  getHallTickets() {
    return this.state.examHallTickets || initialHallTickets;
  }

  issueAdmitCard(rollNumber) {
    const list = this.state.examHallTickets || initialHallTickets;
    const student = list.find(s => s.rollNumber === rollNumber);
    if (student) {
      student.hallTicketStatus = 'Issued';
      student.issuedAt = new Date().toLocaleDateString('en-GB');
      if (student.seatAllocated === 'Unassigned') {
        student.seatAllocated = 'Exam Hall B-301 · Assigned';
      }
      this.logAuditEvent({
        user: 'Exam Controller Office',
        role: 'EXAM_CELL',
        action: 'Authorized & Issued Admit Card',
        target: `${student.name} (Roll ${student.rollNumber})`,
        newValue: 'Issued & Active',
      });
      this.save();
    }
    return student;
  }

  condoneAttendance(rollNumber, newPercentage = 75) {
    const list = this.state.examHallTickets || initialHallTickets;
    const student = list.find(s => s.rollNumber === rollNumber);
    if (student) {
      student.attendance = newPercentage;
      student.hallTicketStatus = student.feeClearance.includes('Pending') ? 'On Hold (Accounts)' : 'Issued';
      student.issuedAt = new Date().toLocaleDateString('en-GB');
      if (student.seatAllocated === 'Unassigned') {
        student.seatAllocated = 'Exam Hall B-301 · Desk Assigned';
      }
      this.logAuditEvent({
        user: 'Controller of Examinations',
        role: 'EXAM_CELL',
        action: 'Granted Institutional Attendance Condonation (Medical/Duty)',
        target: `${student.name} (Roll ${student.rollNumber})`,
        oldValue: 'Detained',
        newValue: `${newPercentage}% (Approved by CoE Board)`,
      });
      this.save();
    }
    return student;
  }

  clearFeeHold(rollNumber) {
    const list = this.state.examHallTickets || initialHallTickets;
    const student = list.find(s => s.rollNumber === rollNumber);
    if (student) {
      student.feeClearance = 'Cleared (Finance No-Dues)';
      student.hallTicketStatus = student.attendance >= 75 ? 'Issued' : 'Detained (Low Attendance)';
      if (student.hallTicketStatus === 'Issued') {
        student.issuedAt = new Date().toLocaleDateString('en-GB');
        student.seatAllocated = 'Exam Hall B-301 · Desk Assigned';
      }
      this.logAuditEvent({
        user: 'Finance & Exam Desk',
        role: 'EXAM_CELL',
        action: 'Cleared Accounts Fee Hold for Examination Entry',
        target: `${student.name} (Roll ${student.rollNumber})`,
        newValue: 'Clearance Granted',
      });
      this.save();
    }
    return student;
  }

  batchReleaseAdmitCards() {
    const list = this.state.examHallTickets || initialHallTickets;
    let releasedCount = 0;
    list.forEach(s => {
      if (s.attendance >= 75 && !s.feeClearance.includes('Pending') && s.hallTicketStatus !== 'Issued') {
        s.hallTicketStatus = 'Issued';
        s.issuedAt = new Date().toLocaleDateString('en-GB');
        if (s.seatAllocated === 'Unassigned') {
          s.seatAllocated = 'Exam Hall B-301 · Auto-Allocated';
        }
        releasedCount++;
      }
    });
    this.logAuditEvent({
      user: 'Exam Controller Office',
      role: 'EXAM_CELL',
      action: 'Batch Released Admit Cards to Student Portals',
      target: `${releasedCount} Cleared Students`,
      newValue: 'Published Online',
    });
    this.save();
    return list;
  }

  // --- Marks Moderation & CIE ---
  getModerationMarks(subjectCode = 'CS501') {
    const marksData = this.state.moderationMarks || initialModerationMarks;
    return marksData[subjectCode] || marksData['CS501'];
  }

  updateStudentMark(subjectCode, rollNumber, field, val) {
    const marksData = this.state.moderationMarks || initialModerationMarks;
    const sub = marksData[subjectCode];
    if (sub && !sub.isLocked) {
      const record = sub.records.find(r => r.rollNumber === rollNumber);
      if (record) {
        record[field] = Number(val);
        record.total = Math.min(100, (record.internal || 0) + (record.external || 0) + (record.grace || 0));
        if (record.total >= 90) { record.grade = 'O'; record.points = 10; record.status = 'Passed'; }
        else if (record.total >= 80) { record.grade = 'A+'; record.points = 9; record.status = 'Passed'; }
        else if (record.total >= 70) { record.grade = 'A'; record.points = 8; record.status = 'Passed'; }
        else if (record.total >= 60) { record.grade = 'B+'; record.points = 7.5; record.status = 'Passed'; }
        else if (record.total >= 50) { record.grade = 'B'; record.points = 7; record.status = 'Passed'; }
        else if (record.total >= 40) { record.grade = 'C'; record.points = 6; record.status = 'Passed'; }
        else { record.grade = 'F'; record.points = 0; record.status = 'Fail (Backlog)'; }
        this.save();
      }
    }
    return marksData[subjectCode];
  }

  applyGraceMarks(subjectCode, gracePoints = 2) {
    const marksData = this.state.moderationMarks || initialModerationMarks;
    const sub = marksData[subjectCode];
    if (sub && !sub.isLocked) {
      sub.records.forEach(r => {
        if (r.total >= 36 && r.total < 40) {
          r.grace = gracePoints;
          r.total = Math.min(100, (r.internal || 0) + (r.external || 0) + r.grace);
          if (r.total >= 40) {
            r.grade = 'C';
            r.points = 6;
            r.status = 'Passed with Moderation Grace';
          }
        }
      });
      this.logAuditEvent({
        user: 'Exam Moderation Committee',
        role: 'EXAM_CELL',
        action: `Applied Moderation Grace (+${gracePoints} Marks) to Borderline Candidates`,
        target: `${sub.subjectCode} - ${sub.subjectName}`,
        newValue: 'Moderation Applied',
      });
      this.save();
    }
    return sub;
  }

  certifyAndLockMarks(subjectCode) {
    const marksData = this.state.moderationMarks || initialModerationMarks;
    const sub = marksData[subjectCode];
    if (sub) {
      sub.isLocked = true;
      this.logAuditEvent({
        user: 'Controller of Examinations',
        role: 'EXAM_CELL',
        action: 'Certified & Permanently Locked Assessment Marks',
        target: `${sub.subjectCode} - ${sub.subjectName}`,
        newValue: 'Locked by Autonomous Academic Council',
      });
      this.save();
    }
    return sub;
  }

  // --- Grade Roster & SGPA Calculation ---
  getGradeRoster() {
    return this.state.gradeRoster || initialGradeRoster;
  }

  executeGradingEngine() {
    const roster = this.state.gradeRoster || initialGradeRoster;
    // Accurate autonomous grade calculations
    roster.forEach(student => {
      if (student.backlogCount === 0) {
        student.status = student.sgpa >= 8.5 ? 'Passed (First Class Distinction)' : 'Passed (First Class)';
      } else {
        student.status = `Backlog in ${student.backlogCount} Paper(s)`;
      }
    });
    this.logAuditEvent({
      user: 'Autonomous Grading Server',
      role: 'EXAM_CELL',
      action: 'Executed Autonomous SGPA/CGPA Grading Engine',
      target: 'Autumn 2026 Batch (2,480 Students)',
      oldValue: 'Pre-computation',
      newValue: '100% Calculated & Verified',
    });
    this.save();
    return roster;
  }

  // --- Re-evaluation & Scrutiny ---
  getReevaluationRequests() {
    return this.state.reevaluationRequests || initialReevaluationRequests;
  }

  createReevaluationRequest(data) {
    const newReq = {
      id: `REV-2026-${Math.floor(100 + Math.random() * 900)}`,
      rollNumber: data.rollNumber || '01',
      regNo: data.regNo || '2305201001',
      studentName: data.studentName || 'Student Name',
      subjectCode: data.subjectCode || 'CS501',
      subjectName: data.subjectName || 'Course Subject',
      originalMarks: Number(data.originalMarks) || 45,
      feePaid: '₹500 (Verified)',
      dateApplied: new Date().toLocaleDateString('en-GB'),
      status: 'Under Scrutiny',
      recheckedMarks: null,
      remarks: data.remarks || 'Student requested re-evaluation and verification of paper',
    };
    this.state.reevaluationRequests = [newReq, ...(this.state.reevaluationRequests || [])];
    this.logAuditEvent({
      user: 'Student Portal Gateway',
      role: 'EXAM_CELL',
      action: 'Registered Re-evaluation / Scrutiny Application',
      target: `${newReq.studentName} - ${newReq.subjectCode}`,
      newValue: newReq.id,
    });
    this.save();
    return newReq;
  }

  updateReevaluationStatus(id, { status, recheckedMarks, remarks }) {
    const req = (this.state.reevaluationRequests || []).find(r => r.id === id);
    if (req) {
      if (status) req.status = status;
      if (recheckedMarks !== undefined) req.recheckedMarks = Number(recheckedMarks);
      if (remarks) req.remarks = remarks;
      this.logAuditEvent({
        user: 'Scrutiny Committee / CoE',
        role: 'EXAM_CELL',
        action: `Scrutiny Request ${id} Evaluated`,
        target: `${req.studentName} (${req.subjectCode})`,
        newValue: `${req.status} - Revised: ${req.recheckedMarks || 'No change'}`,
      });
      this.save();
    }
    return req;
  }

  // --- Exam Circulars ---
  getExamCirculars() {
    return this.state.examCirculars || initialExamCirculars;
  }

  createExamCircular(data) {
    const newCircular = {
      id: `CIRC-EXAM-${Math.floor(10 + Math.random() * 90)}`,
      circularNo: data.circularNo || `GIFT/COE/2026/${Math.floor(100 + Math.random() * 900)}`,
      title: data.title || 'Official Examination Circular',
      date: new Date().toLocaleDateString('en-GB'),
      audience: data.audience || 'All Students & Faculty',
      category: data.category || 'General',
      priority: data.priority || 'Normal',
      content: data.content || 'Important notification from the Office of Controller of Examinations.',
    };
    this.state.examCirculars = [newCircular, ...(this.state.examCirculars || [])];
    this.logAuditEvent({
      user: 'Controller of Examinations',
      role: 'EXAM_CELL',
      action: 'Released Examination Circular',
      target: newCircular.title,
      newValue: newCircular.circularNo,
    });
    this.save();
    return newCircular;
  }

  deleteExamCircular(id) {
    this.state.examCirculars = (this.state.examCirculars || []).filter(c => c.id !== id);
    this.save();
    return this.state.examCirculars;
  }

  // --- Library ---
  getBooksCatalog() {
    return this.state.booksCatalog || [];
  }

  addCatalogBook(bookData) {
    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCopies = Number(bookData.totalCopies) || 5;
    const newBook = {
      id: newId,
      isbn: bookData.isbn,
      title: bookData.title,
      author: bookData.author,
      category: bookData.category || 'General',
      edition: bookData.edition || '1st Edition',
      totalCopies,
      availableCopies: totalCopies,
      shelfLocation: bookData.shelfLocation || 'Stack 1, Row A',
    };
    this.state.booksCatalog = [newBook, ...(this.state.booksCatalog || [])];
    this.logAuditEvent({
      user: 'Chief Librarian Desk',
      role: 'LIBRARY',
      action: 'Added Catalog Title',
      target: `${newBook.title} (${newBook.isbn})`,
      oldValue: 'None',
      newValue: `Total Copies: ${totalCopies}`,
    });
    this.save();
    return newBook;
  }

  getCirculationRecords() {
    return this.state.circulationRecords || [];
  }

  issueBook({ bookId, borrowerName, borrowerRegNo, role = 'Student' }) {
    const book = this.state.booksCatalog.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) {
      throw new Error('Book is currently unavailable or out of stock.');
    }
    book.availableCopies -= 1;
    const issueDate = new Date().toISOString().split('T')[0];
    const durationDays = role === 'Faculty' ? 90 : (role === 'Staff' ? 14 : 21);
    const due = new Date();
    due.setDate(due.getDate() + durationDays);
    const dueDate = due.toISOString().split('T')[0];

    const record = {
      id: `CIRC-${Math.floor(1000 + Math.random() * 9000)}`,
      bookId,
      bookTitle: book.title,
      borrowerName,
      borrowerRegNo,
      role,
      issueDate,
      dueDate,
      status: 'Issued',
      fineAmount: 0,
    };

    this.state.circulationRecords = [record, ...this.state.circulationRecords];
    this.logAuditEvent({
      user: 'Chief Librarian Desk',
      role: 'LIBRARY',
      action: 'Issued Book',
      target: `${book.title} to ${borrowerName} (${borrowerRegNo})`,
      oldValue: `Copies: ${book.availableCopies + 1}`,
      newValue: `Copies: ${book.availableCopies}`,
    });
    this.save();
    return record;
  }

  returnBook(recordId) {
    const record = this.state.circulationRecords.find(r => r.id === recordId);
    if (record) {
      record.status = 'Returned';
      record.returnDate = new Date().toISOString().split('T')[0];
      const book = this.state.booksCatalog.find(b => b.id === record.bookId);
      if (book) book.availableCopies += 1;
      this.logAuditEvent({
        user: 'Chief Librarian Desk',
        role: 'LIBRARY',
        action: 'Returned Book',
        target: `${record.bookTitle} by ${record.borrowerName}`,
        oldValue: 'Issued',
        newValue: 'Returned to Stack',
      });
      this.save();
    }
    return record;
  }

  renewBook(recordId) {
    const record = this.state.circulationRecords.find(r => r.id === recordId);
    if (!record) throw new Error('Circulation record not found.');
    if (record.status !== 'Issued') throw new Error('Only actively issued books can be renewed.');
    const due = new Date(record.dueDate);
    due.setDate(due.getDate() + 21);
    record.dueDate = due.toISOString().split('T')[0];
    this.logAuditEvent({
      user: 'Chief Librarian Desk',
      role: 'LIBRARY',
      action: 'Renewed Book Loan',
      target: `${record.bookTitle} for ${record.borrowerName}`,
      oldValue: 'Previous Due Date',
      newValue: `Extended to ${record.dueDate}`,
    });
    this.save();
    return record;
  }

  getLibraryReservations() {
    return this.state.libraryReservations || [
      { id: 'RES-101', bookTitle: 'Deep Learning', isbn: '978-0262035613', studentName: 'Subham Mahapatra', studentRoll: '2305201015', queuePosition: 1, reservedDate: '2026-10-06', pickupDeadline: '2026-10-12', status: 'Ready for Pickup' },
      { id: 'RES-102', bookTitle: 'Artificial Intelligence: A Modern Approach', isbn: '978-0136042594', studentName: 'Sunita Biswal', studentRoll: '2305201020', queuePosition: 2, reservedDate: '2026-10-08', pickupDeadline: '2026-10-15', status: 'Queued' },
    ];
  }

  addLibraryReservation(resData) {
    const newRes = {
      id: `RES-${Math.floor(100 + Math.random() * 900)}`,
      bookTitle: resData.bookTitle,
      isbn: resData.isbn || 'N/A',
      studentName: resData.studentName,
      studentRoll: resData.studentRoll,
      queuePosition: 1,
      reservedDate: new Date().toISOString().split('T')[0],
      pickupDeadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'Queued',
    };
    this.state.libraryReservations = [newRes, ...(this.state.libraryReservations || [])];
    this.save();
    return newRes;
  }

  cancelLibraryReservation(id) {
    this.state.libraryReservations = (this.state.libraryReservations || []).map(r => r.id === id ? { ...r, status: 'Cancelled' } : r);
    this.save();
    return true;
  }

  getLibraryFines() {
    return this.state.libraryFines || [
      { id: 'FINE-901', transactionId: 'TXN-901', studentName: 'Amit Nayak', studentRoll: '2305201002', bookTitle: 'Operating System Concepts (Silberschatz)', accessionNo: 'ACC-2026-1002-002', overdueDays: 7, fineRate: '₹2.00 / day', fineAmount: 14, amountPaid: 0, balance: 14, status: 'Unpaid', dueDate: '2026-10-01' },
      { id: 'FINE-902', transactionId: 'TXN-902', studentName: 'Rajesh Samal', studentRoll: '2305201008', bookTitle: 'Computer Networks', accessionNo: 'ACC-2026-1007-004', overdueDays: 12, fineRate: '₹2.00 / day', fineAmount: 24, amountPaid: 24, balance: 0, status: 'Paid', paymentMode: 'Campus Smart Wallet', receiptNo: 'LIB-REC-8841', paidDate: '2026-10-05', dueDate: '2026-09-23' },
    ];
  }

  settleLibraryFine({ fineId, studentRoll, amountPaid, paymentMode = 'Cash at Counter' }) {
    const fines = this.getLibraryFines();
    const item = fines.find(f => f.id === fineId || f.studentRoll === studentRoll);
    const receiptNo = `LIB-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    if (item) {
      item.amountPaid = Number(amountPaid);
      item.balance = Math.max(0, item.fineAmount - Number(amountPaid));
      item.status = item.balance === 0 ? 'Paid' : 'Partial';
      item.paymentMode = paymentMode;
      item.receiptNo = receiptNo;
      item.paidDate = new Date().toISOString().split('T')[0];
    }
    this.state.libraryFines = fines;
    this.save();
    return { receiptNo, status: 'Paid' };
  }

  waiveLibraryFine({ fineId, reason, approvedBy = 'Chief Librarian' }) {
    const fines = this.getLibraryFines();
    const item = fines.find(f => f.id === fineId);
    if (item) {
      item.status = 'Waived';
      item.balance = 0;
      item.waivedReason = reason;
      item.waivedBy = approvedBy;
      item.waivedDate = new Date().toISOString().split('T')[0];
    }
    this.state.libraryFines = fines;
    this.save();
    return true;
  }

  getLibraryAcquisitions() {
    return this.state.libraryAcquisitions || [
      { id: 'ACQ-401', poNumber: 'GIFT/LIB/PO/2026/088', bookTitle: 'Generative AI and Large Language Models in Practice', author: 'Maximilian Schwarz & Prof. K. Patel', vendor: 'Tata McGraw-Hill Education', department: 'Computer Science & Engineering', quantityRequested: 15, quantityReceived: 15, unitPrice: 850, totalCost: 12750, status: 'Received & Accessioned', orderDate: '2026-08-20', receivedDate: '2026-09-15' },
      { id: 'ACQ-402', poNumber: 'GIFT/LIB/PO/2026/092', bookTitle: 'VLSI Circuit Design for Modern SoCs', author: 'Dr. Debabrata Jena', vendor: 'Oxford University Press', department: 'Electronics & Communication', quantityRequested: 20, quantityReceived: 0, unitPrice: 1100, totalCost: 22000, status: 'Order Dispatched', orderDate: '2026-09-28', expectedDelivery: '2026-10-18' },
    ];
  }

  addLibraryAcquisition(acqData) {
    const poNumber = acqData.poNumber || `GIFT/LIB/PO/2026/${Math.floor(100 + Math.random() * 900)}`;
    const newAcq = {
      id: `ACQ-${Math.floor(400 + Math.random() * 100)}`,
      poNumber,
      bookTitle: acqData.bookTitle,
      author: acqData.author,
      vendor: acqData.vendor || 'Academic Publisher',
      department: acqData.department || 'Computer Science & Engineering',
      quantityRequested: Number(acqData.quantityRequested) || 10,
      quantityReceived: 0,
      unitPrice: Number(acqData.unitPrice) || 850,
      totalCost: (Number(acqData.quantityRequested) || 10) * (Number(acqData.unitPrice) || 850),
      status: 'Requested',
      orderDate: new Date().toISOString().split('T')[0],
    };
    this.state.libraryAcquisitions = [newAcq, ...(this.state.libraryAcquisitions || [])];
    this.save();
    return newAcq;
  }

  getLibraryDigitalResources() {
    return [
      { id: 'DIG-01', title: 'IEEE Xplore Digital Library Institutional Portal', category: 'Journal Database', accessLevel: 'Campus Intranet & VPN SSO', fileFormat: 'Online Database / PDF Reprints', downloadsCount: 1420, licenseExpiry: '2027-08-31', description: 'Full-text access to 195+ IEEE journals, transactions, and conference proceedings.' },
      { id: 'DIG-02', title: 'Autonomous End-Semester Question Bank (2021-2025)', category: 'Examination Archives', accessLevel: 'Student & Faculty Login', fileFormat: 'Searchable PDF Archives', downloadsCount: 3840, licenseExpiry: 'Perpetual Institutional Archive', description: 'Verified past semester questions and model answer schemes for all B.Tech branches.' },
      { id: 'DIG-03', title: 'SpringerLink Engineering & Computer Science E-Books', category: 'E-Books', accessLevel: 'Open on Campus Wi-Fi', fileFormat: 'EPUB & PDF', downloadsCount: 980, licenseExpiry: '2027-12-31', description: 'Curated 4,500+ volumes of computer architecture, algorithms, robotics and mechanics.' },
    ];
  }

  getLibraryDashboardStats() {
    const books = this.getBooksCatalog();
    const circs = this.getCirculationRecords();
    const fines = this.getLibraryFines();
    const totalTitles = books.length;
    const totalCopies = books.reduce((s, b) => s + (b.totalCopies || 5), 0);
    const availableCopies = books.reduce((s, b) => s + (b.availableCopies || 0), 0);
    const activeLoans = circs.filter(c => c.status !== 'Returned').length;
    const overdueLoans = circs.filter(c => c.status === 'Overdue' || (c.status === 'Issued' && c.fineAmount > 0)).length;
    const outstandingFines = fines.filter(f => f.status === 'Unpaid').reduce((s, f) => s + (Number(f.fineAmount) || 0), 0);
    const finesCollected = fines.filter(f => f.status === 'Paid').reduce((s, f) => s + (Number(f.amountPaid) || Number(f.fineAmount) || 0), 0);

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      issuedCopies: totalCopies - availableCopies,
      activeLoans,
      overdueLoans,
      reservationsPending: 2,
      outstandingFines,
      finesCollected,
      lostOrDamaged: 2,
      booksAcquiredYear: 184,
    };
  }

  // --- Transport (Campus Transit & Fleet Operations) ---
  getFleetVehicles() {
    return this.state.fleetVehicles || [];
  }

  addFleetVehicle(vehicleData, user = { name: 'Transport Fleet Manager', role: 'TRANSPORT' }) {
    const newId = `VEH-${Math.floor(10 + Math.random() * 90)}`;
    const newVehicle = {
      id: newId,
      busNumber: vehicleData.busNumber,
      fleetCode: vehicleData.fleetCode || `Bus ${newId.replace('VEH-', '')}`,
      type: vehicleData.type || '52-Seater Coach',
      capacity: Number(vehicleData.capacity) || 52,
      allocatedStudents: 0,
      driver: vehicleData.driver || 'Unassigned',
      driverPhone: vehicleData.driverPhone || 'N/A',
      routeName: vehicleData.routeName || 'Unassigned',
      status: 'Available',
      fuelType: vehicleData.fuelType || 'Diesel (BS-VI)',
      fitnessExpiry: vehicleData.fitnessExpiry || '2027-12-31',
      insuranceExpiry: vehicleData.insuranceExpiry || '2027-12-31',
      pucExpiry: vehicleData.pucExpiry || '2027-06-30',
      permitExpiry: vehicleData.permitExpiry || '2028-12-31',
      odometerKm: Number(vehicleData.odometerKm) || 12000,
      depot: vehicleData.depot || 'Campus Central Bus Bay',
    };
    this.state.fleetVehicles = [newVehicle, ...(this.state.fleetVehicles || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'TRANSPORT',
      action: 'Added Fleet Vehicle',
      target: `${newVehicle.fleetCode} (${newVehicle.busNumber})`,
      oldValue: 'None',
      newValue: 'Available',
    });
    this.save();
    return newVehicle;
  }

  updateVehicleStatus(vehicleId, status, notes = '', user = { name: 'Transport Supervisor', role: 'TRANSPORT' }) {
    const v = (this.state.fleetVehicles || []).find(x => x.id === vehicleId);
    if (v) {
      const old = v.status;
      v.status = status;
      if (notes) v.statusNotes = notes;
      this.logAuditEvent({
        user: user.name,
        role: 'TRANSPORT',
        action: 'Updated Vehicle Status',
        target: `${v.fleetCode} (${v.busNumber})`,
        oldValue: old,
        newValue: status,
      });
      this.save();
    }
    return v;
  }

  updateVehicleCompliance(vehicleId, complianceData, user = { name: 'Transport Fleet Desk', role: 'TRANSPORT' }) {
    const v = (this.state.fleetVehicles || []).find(x => x.id === vehicleId);
    if (v) {
      if (complianceData.fitnessExpiry) v.fitnessExpiry = complianceData.fitnessExpiry;
      if (complianceData.insuranceExpiry) v.insuranceExpiry = complianceData.insuranceExpiry;
      if (complianceData.pucExpiry) v.pucExpiry = complianceData.pucExpiry;
      if (complianceData.permitExpiry) v.permitExpiry = complianceData.permitExpiry;
      if (complianceData.odometerKm !== undefined) v.odometerKm = Number(complianceData.odometerKm);
      this.logAuditEvent({
        user: user.name,
        role: 'TRANSPORT',
        action: 'Renewed Vehicle Compliance Certificates',
        target: `${v.fleetCode} (${v.busNumber})`,
        oldValue: 'Previous Expiry',
        newValue: v.fitnessExpiry,
      });
      this.save();
    }
    return v;
  }

  getBusRoutes() {
    return this.state.busRoutes || [];
  }

  addBusRoute(routeData, user = { name: 'Transport Supervisor', role: 'TRANSPORT' }) {
    const newRoute = {
      id: `RT-${(this.state.busRoutes || []).length + 1}`,
      name: routeData.name,
      routeNumber: routeData.routeNumber || `RT-${(this.state.busRoutes || []).length + 1}`,
      morningDeparture: routeData.morningDeparture || '07:15 AM',
      eveningArrival: routeData.eveningArrival || '05:30 PM',
      stops: Array.isArray(routeData.stops) ? routeData.stops : (routeData.stops || '').split(',').map(s => s.trim()),
      farePerSemester: Number(routeData.farePerSemester) || 15000,
      activePassHolders: 0,
      busNumber: routeData.busNumber || 'Unassigned',
      totalCapacity: Number(routeData.totalCapacity) || 52,
      status: 'Active',
    };
    this.state.busRoutes = [...(this.state.busRoutes || []), newRoute];
    this.logAuditEvent({
      user: user.name,
      role: 'TRANSPORT',
      action: 'Created Transit Route',
      target: newRoute.name,
      oldValue: 'None',
      newValue: 'Active',
    });
    this.save();
    return newRoute;
  }

  updateRouteDisruption(routeId, disruptionNotice, user = { name: 'Transport Desk', role: 'TRANSPORT' }) {
    const r = (this.state.busRoutes || []).find(x => x.id === routeId);
    if (r) {
      r.status = disruptionNotice ? 'Temporary Diversion' : 'Active';
      r.disruptionNotice = disruptionNotice || '';
      this.logAuditEvent({
        user: user.name,
        role: 'TRANSPORT',
        action: 'Route Operational Status Changed',
        target: r.name,
        oldValue: 'Previous Status',
        newValue: r.status,
      });
      this.save();
    }
    return r;
  }

  getTransportDrivers() {
    return this.state.transportDrivers || initialTransportDrivers;
  }

  addTransportDriver(driverData, user = { name: 'Driver Roster Office', role: 'TRANSPORT' }) {
    const newDriver = {
      id: `DRV-${Math.floor(10 + Math.random() * 90)}`,
      name: driverData.name,
      phone: driverData.phone,
      emergencyContact: driverData.emergencyContact || 'N/A',
      licenseNumber: driverData.licenseNumber,
      licenseCategory: driverData.licenseCategory || 'HMV (Heavy Passenger Vehicle)',
      licenseExpiry: driverData.licenseExpiry || '2029-12-31',
      experienceYears: Number(driverData.experienceYears) || 5,
      assignedBus: driverData.assignedBus || 'Unassigned',
      assignedRoute: driverData.assignedRoute || 'Unassigned',
      shift: driverData.shift || 'General Shift',
      status: 'Active',
      safetyIncidents: 0,
    };
    this.state.transportDrivers = [newDriver, ...(this.state.transportDrivers || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'TRANSPORT',
      action: 'Enrolled Transport Driver',
      target: `${newDriver.name} (${newDriver.licenseNumber})`,
      oldValue: 'None',
      newValue: 'Active',
    });
    this.save();
    return newDriver;
  }

  getBusPasses() {
    return this.state.busPasses || initialBusPasses;
  }

  allocateBusPass(passData, user = { name: 'Pass Allocation Desk', role: 'TRANSPORT' }) {
    const newPass = {
      id: `PASS-2026-${Math.floor(100 + Math.random() * 900)}`,
      passNumber: `PASS-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: passData.studentName || 'Student',
      regNo: passData.regNo,
      department: passData.department || 'B.Tech Engineering',
      semester: passData.semester || 'Semester 5',
      routeName: passData.routeName,
      stopName: passData.stopName,
      fareAmount: Number(passData.fareAmount) || 15000,
      feeStatus: passData.feePaid ? 'Paid & Verified' : 'Pending Verification',
      status: passData.autoApprove ? 'Active & Verified' : 'Pending Approval',
      validity: 'Autumn Semester 2026',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-12-31',
      qrToken: `GIFT-BUS-VERIFY-${passData.regNo}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
    this.state.busPasses = [newPass, ...(this.state.busPasses || [])];
    // increment route count
    const r = (this.state.busRoutes || []).find(x => x.name === passData.routeName || x.id === passData.routeId);
    if (r) r.activePassHolders = (r.activePassHolders || 0) + 1;

    this.logAuditEvent({
      user: user.name,
      role: 'TRANSPORT',
      action: 'Issued Student Bus Pass',
      target: `${newPass.studentName} (${newPass.regNo})`,
      oldValue: 'None',
      newValue: newPass.status,
    });
    this.save();
    return newPass;
  }

  actionBusPass(passId, action, notes = '', user = { name: 'Transport Supervisor', role: 'TRANSPORT' }) {
    const p = (this.state.busPasses || []).find(x => x.id === passId || x.passNumber === passId);
    if (p) {
      const old = p.status;
      if (action === 'APPROVE') p.status = 'Active & Verified';
      else if (action === 'REJECT') p.status = 'Rejected';
      else if (action === 'SUSPEND') p.status = 'Suspended';
      else if (action === 'RENEW') p.status = 'Active & Verified';
      else if (action === 'REVOKE') p.status = 'Cancelled';
      p.actionNotes = notes;
      this.logAuditEvent({
        user: user.name,
        role: 'TRANSPORT',
        action: `Bus Pass Action: ${action}`,
        target: `${p.studentName} (${p.regNo})`,
        oldValue: old,
        newValue: p.status,
      });
      this.save();
    }
    return p;
  }

  getTransportTrips() {
    return this.state.transportTrips || initialTransportTrips;
  }

  actionTransportTrip(tripId, action, data = {}, user = { name: 'Operations Dispatcher', role: 'TRANSPORT' }) {
    const t = (this.state.transportTrips || []).find(x => x.id === tripId || x.tripCode === tripId);
    if (t) {
      const old = t.status;
      const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      if (action === 'START_TRIP') {
        t.status = 'In Transit';
        t.actualDeparture = nowStr;
      } else if (action === 'COMPLETE_TRIP') {
        t.status = 'Completed';
        t.actualArrival = nowStr;
      } else if (action === 'RECORD_DELAY') {
        t.status = 'Delayed';
        t.delayMinutes = Number(data.delayMinutes) || 15;
        t.incidentReport = data.reason || `Delayed due to heavy traffic (${t.delayMinutes} mins)`;
      } else if (action === 'REPORT_BREAKDOWN') {
        t.status = 'Breakdown / Halted';
        t.incidentReport = `Vehicle breakdown reported: ${data.notes || 'Engine cooling issue'}. Relief bus assigned.`;
      }
      this.logAuditEvent({
        user: user.name,
        role: 'TRANSPORT',
        action: `Trip Operations Action: ${action}`,
        target: `${t.tripCode} (${t.routeName})`,
        oldValue: old,
        newValue: t.status,
      });
      this.save();
    }
    return t;
  }

  getTransportTelemetry() {
    return [
      {
        vehicleId: 'VEH-01',
        fleetCode: 'Bus 01',
        busNumber: 'OD-02-AK-4411',
        routeName: 'Route 1: Cuttack Badambadi Express',
        driverName: 'Ramesh Ch. Jena',
        telemetryStatus: 'Live',
        location: 'Phulnakhara Bridge Crossing (NH-16)',
        speedKmH: 48,
        heading: 'North-East',
        lastPingTime: 'Just now (12s ago)',
        freshnessBadge: 'LIVE_TELEMETRY',
        signalQuality: '98% (4G LTE)',
        batteryVoltage: '24.2V (Healthy)',
      },
      {
        vehicleId: 'VEH-02',
        fleetCode: 'Bus 02',
        busNumber: 'OD-02-AK-4412',
        routeName: 'Route 2: Rasulgarh - Master Canteen',
        driverName: 'Bikash Mohanty',
        telemetryStatus: 'Live',
        location: 'Master Canteen Circle, Station Square',
        speedKmH: 32,
        heading: 'South-West',
        lastPingTime: '24s ago',
        freshnessBadge: 'LIVE_TELEMETRY',
        signalQuality: '95% (4G LTE)',
        batteryVoltage: '24.1V (Healthy)',
      },
      {
        vehicleId: 'VEH-03',
        fleetCode: 'Bus 03',
        busNumber: 'OD-02-BL-8890',
        routeName: 'Route 3: Patia - Infocity - Khandagiri',
        driverName: 'Sanjay Kumar Rout',
        telemetryStatus: 'Live',
        location: 'Jayadev Vihar Flyover Approach',
        speedKmH: 42,
        heading: 'South',
        lastPingTime: '45s ago',
        freshnessBadge: 'LIVE_TELEMETRY',
        signalQuality: '90% (4G LTE)',
        batteryVoltage: '23.9V (Healthy)',
      },
      {
        vehicleId: 'VEH-04',
        fleetCode: 'Bus 04',
        busNumber: 'OD-02-BL-8891',
        routeName: 'Route 4: Jayadev Vihar - KIIT Square',
        driverName: 'Kailash Sahoo',
        telemetryStatus: 'Delayed Updates',
        location: 'Near Patia Big Bazaar Underpass',
        speedKmH: 0,
        heading: 'Halted (Traffic Signal)',
        lastPingTime: '4 mins ago (Weak signal cell)',
        freshnessBadge: 'DELAYED_UPDATES',
        signalQuality: '42% (2G Fallback)',
        batteryVoltage: '24.0V (Healthy)',
      },
      {
        vehicleId: 'VEH-05',
        fleetCode: 'Bus 05',
        busNumber: 'OD-02-CL-1209',
        routeName: 'Route 5: Khordha Bypass',
        driverName: 'Purna Chandra Das',
        telemetryStatus: 'Offline',
        location: 'Campus Workshop Service Bay 2',
        speedKmH: 0,
        heading: 'Parked',
        lastPingTime: '3 hours ago',
        freshnessBadge: 'OFFLINE_TELEMETRY',
        signalQuality: '0% (Ignition Off)',
        batteryVoltage: '23.4V (Standby)',
      },
    ];
  }

  getTransportDashboardStats() {
    const fleet = this.getFleetVehicles();
    const routes = this.getBusRoutes();
    const passes = this.getBusPasses();
    const trips = this.getTransportTrips();
    const telemetry = this.getTransportTelemetry();

    const totalFleet = fleet.length;
    const operationalVehicles = fleet.filter(v => (v.status || '').includes('Active') || (v.status || '').includes('Available')).length;
    const underMaintenance = fleet.filter(v => (v.status || '').includes('Maintenance') || (v.status || '').includes('Out of Service')).length;
    const totalRoutes = routes.length;

    const totalCapacity = fleet.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0);
    const activePassHolders = passes.filter(p => (p.status || '').includes('Active')).length;
    const pendingPasses = passes.filter(p => (p.status || '').includes('Pending')).length;

    const seatUtilization = totalCapacity > 0 ? Math.round((activePassHolders / totalCapacity) * 100) : 88;

    const upcomingExpiries = fleet.filter(v => {
      const exp = v.fitnessExpiry || v.insuranceExpiry || '';
      return exp.startsWith('2026-11') || exp.startsWith('2026-12') || exp.startsWith('2027-01');
    }).length;

    const liveTelemetryCount = telemetry.filter(t => t.telemetryStatus === 'Live').length;
    const inTransitTrips = trips.filter(t => t.status === 'In Transit').length;

    return {
      totalFleet,
      operationalVehicles,
      underMaintenance,
      totalRoutes,
      totalCapacity,
      activePassHolders,
      pendingPasses,
      seatUtilization,
      upcomingExpiries,
      liveTelemetryCount,
      inTransitTrips,
      totalTripsToday: trips.length,
    };
  }

  // --- Placement (Training & Placement Cell Operations) ---
  getPlacementCompanies() {
    return this.state.placementCompanies || [];
  }

  addPlacementCompany(companyData, user = { name: 'T&P Officer', role: 'PLACEMENT' }) {
    const newCompany = {
      id: `COMP-${Math.floor(10 + Math.random() * 90)}`,
      name: companyData.name,
      category: companyData.category || 'Information Technology',
      hrContact: companyData.hrContact || 'HR Team',
      email: companyData.email || 'campus@company.com',
      phone: companyData.phone || '+91 22 XXXXXXXX',
      packageRange: companyData.packageRange || '₹4.5 LPA - ₹8.0 LPA',
      totalHiredFromCampus: 0,
      status: companyData.status || 'Active Partner',
      tier: companyData.tier || 'Active Partner',
      mouStatus: companyData.mouStatus || 'Signed & Valid',
      officeLocation: companyData.officeLocation || 'Pan-India',
    };
    this.state.placementCompanies = [newCompany, ...(this.state.placementCompanies || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'PLACEMENT',
      action: 'Enrolled Recruiting Partner',
      target: newCompany.name,
      oldValue: 'None',
      newValue: newCompany.status,
    });
    this.save();
    return newCompany;
  }

  getPlacementDrives() {
    return this.state.placementDrives || [];
  }

  addPlacementDrive(driveData, user = { name: 'T&P Officer', role: 'PLACEMENT' }) {
    const newDrive = {
      id: `DRIVE-2026-${Math.floor(10 + Math.random() * 90)}`,
      company: driveData.company,
      companyName: driveData.company,
      role: driveData.role,
      roleTitle: driveData.role,
      packageOffered: driveData.packageOffered || `₹${driveData.packageLPA || 6.5} LPA`,
      packageLPA: Number(driveData.packageLPA) || 6.5,
      driveDate: driveData.driveDate || '2026-11-20',
      venue: driveData.venue || 'Campus Auditorium',
      eligibilityCriteria: {
        minCgpa: Number(driveData.minCgpa) || 6.5,
        maxBacklogs: Number(driveData.maxBacklogs) || 0,
        allowedBranches: Array.isArray(driveData.allowedBranches) ? driveData.allowedBranches : (driveData.allowedBranches || 'CSE, ECE').split(',').map(b => b.trim()),
      },
      registeredCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
      status: 'Registration Open',
    };
    this.state.placementDrives = [newDrive, ...(this.state.placementDrives || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'PLACEMENT',
      action: 'Scheduled Recruitment Drive',
      target: `${newDrive.company} (${newDrive.role})`,
      oldValue: 'None',
      newValue: 'Registration Open',
    });
    this.save();
    return newDrive;
  }

  updatePlacementDriveStatus(driveId, status, user = { name: 'T&P Officer', role: 'PLACEMENT' }) {
    const drive = (this.state.placementDrives || []).find(d => d.id === driveId);
    if (drive) {
      const old = drive.status;
      drive.status = status;
      this.logAuditEvent({
        user: user.name,
        role: 'PLACEMENT',
        action: 'Updated Drive Status',
        target: drive.company,
        oldValue: old,
        newValue: status,
      });
      this.save();
    }
    return drive;
  }

  getPlacementEligibleStudents(driveId, allStudents = []) {
    const drive = (this.state.placementDrives || []).find(d => d.id === driveId);
    if (!drive) return [];

    const minCgpa = drive.eligibilityCriteria?.minCgpa || 6.5;
    const maxBacklogs = drive.eligibilityCriteria?.maxBacklogs ?? 0;
    const allowedBranches = drive.eligibilityCriteria?.allowedBranches || ['CSE', 'ECE'];

    return allStudents.map(student => {
      const reasons = [];
      const passed = [];

      // 1. CGPA Cutoff
      const studentCgpa = Number(student.cgpa) || 8.0;
      if (studentCgpa >= minCgpa) {
        passed.push(`CGPA: ${studentCgpa} >= ${minCgpa}`);
      } else {
        reasons.push(`CGPA ${studentCgpa} is below cutoff of ${minCgpa}`);
      }

      // 2. Branch Check
      const branch = student.deptCode || (student.department?.includes('Computer') ? 'CSE' : student.department?.includes('Electronics') ? 'ECE' : 'MECH');
      const branchAllowed = allowedBranches.some(b => b.toUpperCase() === branch.toUpperCase() || student.department?.toUpperCase().includes(b.toUpperCase()));
      if (branchAllowed) {
        passed.push(`Branch: ${branch} allowed`);
      } else {
        reasons.push(`Branch ${branch} not in allowed branches (${allowedBranches.join(', ')})`);
      }

      // 3. Attendance Clearance
      const attendance = Number(student.attendance) || 85;
      if (attendance >= 75) {
        passed.push(`Attendance: ${attendance}% >= 75%`);
      } else {
        reasons.push(`Attendance ${attendance}% below autonomous threshold (75%)`);
      }

      const isEligible = reasons.length === 0;
      return {
        student,
        isEligible,
        passedCriteria: passed,
        failedCriteria: reasons,
        reasons,
      };
    });
  }

  getPlacementDashboardStats() {
    const drives = this.getPlacementDrives();
    const companies = this.getPlacementCompanies();

    const eligibleCohort = 420;
    const placedStudents = 346;
    const totalOffers = 412;
    const placementRate = Math.round((placedStudents / eligibleCohort) * 1000) / 10;

    const highestCTC = '₹24.0 LPA';
    const averageCTC = '₹6.8 LPA';
    const medianCTC = '₹6.2 LPA';

    const branchStats = [
      { branch: 'Computer Science & Engineering', code: 'CSE', eligible: 160, placed: 152, offers: 198, placementRate: 95.0, avgCTC: '₹8.4 LPA', highestCTC: '₹24.0 LPA' },
      { branch: 'Electronics & Communication', code: 'ECE', eligible: 90, placed: 78, offers: 94, placementRate: 86.7, avgCTC: '₹6.8 LPA', highestCTC: '₹14.0 LPA' },
      { branch: 'Electrical & Electronics', code: 'EEE', eligible: 60, placed: 48, offers: 52, placementRate: 80.0, avgCTC: '₹5.8 LPA', highestCTC: '₹9.2 LPA' },
      { branch: 'Mechanical Engineering', code: 'MECH', eligible: 55, placed: 41, offers: 42, placementRate: 74.5, avgCTC: '₹5.2 LPA', highestCTC: '₹8.0 LPA' },
      { branch: 'Civil Engineering', code: 'CIVIL', eligible: 35, placed: 24, offers: 24, placementRate: 68.6, avgCTC: '₹4.8 LPA', highestCTC: '₹6.5 LPA' },
      { branch: 'Master of Computer Applications', code: 'MCA', eligible: 20, placed: 18, offers: 22, placementRate: 90.0, avgCTC: '₹6.2 LPA', highestCTC: '₹10.5 LPA' },
    ];

    const tierStats = [
      { tier: 'Super Dream (₹12+ LPA)', companiesCount: 4, offersCount: 28, percentage: 6.8 },
      { tier: 'Dream Recruiters (₹6 - ₹12 LPA)', companiesCount: 16, offersCount: 164, percentage: 39.8 },
      { tier: 'Core & IT Services (₹3.5 - ₹6 LPA)', companiesCount: 28, offersCount: 220, percentage: 53.4 },
    ];

    return {
      placementRate,
      highestCTC,
      averageCTC,
      medianCTC,
      totalRecruiters: companies.length,
      totalDrives: drives.length,
      eligibleCohort,
      placedStudents,
      totalOffers,
      branchStats,
      tierStats,
    };
  }

  // --- Non-Teaching Staff Operations Console (Modules A, B, C, D, E) ---
  getStaffWorkspaces() {
    return this.state.staffWorkspaces || [];
  }

  getStaffTickets() {
    return this.state.staffWorkspaces || [];
  }

  addStaffTicket(ticketData, user = { name: 'Operations Staff', role: 'STAFF' }) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TCK-2026-${randomSuffix}`;
    const priority = ticketData.priority || 'Normal';

    // SLA Calculation
    const now = new Date();
    let responseHours = 4;
    let resolutionHours = 24;
    if (priority === 'Critical') {
      responseHours = 0.5;
      resolutionHours = 4;
    } else if (priority === 'High') {
      responseHours = 2;
      resolutionHours = 8;
    } else if (priority === 'Low') {
      responseHours = 24;
      resolutionHours = 48;
    }

    const responseDueAt = new Date(now.getTime() + responseHours * 3600000).toISOString();
    const resolutionDueAt = new Date(now.getTime() + resolutionHours * 3600000).toISOString();

    const newTicket = {
      id: ticketNumber,
      ticketNumber,
      title: ticketData.title,
      description: ticketData.description || '',
      category: ticketData.category || 'General Maintenance',
      building: ticketData.building || 'Block B (Computing Center)',
      floor: ticketData.floor || 'Floor 1',
      room: ticketData.room || 'General',
      labName: ticketData.labName || '',
      assetCode: ticketData.assetCode || '',
      reporterName: ticketData.reporterName || user.name,
      reporterRole: user.role || 'STAFF',
      reporterDept: ticketData.reporterDept || 'Operations',
      priority,
      status: ticketData.assignedTo ? 'Assigned' : 'Open',
      assignedTo: ticketData.assignedTo || 'Unassigned',
      assignedRole: ticketData.assignedRole || 'Technician',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      responseDueAt,
      resolutionDueAt,
      resolutionDetails: '',
      comments: [],
      history: [
        {
          action: 'CREATED',
          stage: ticketData.assignedTo ? 'Assigned' : 'Open',
          by: user.name,
          notes: `Ticket raised with priority ${priority}`,
          timestamp: new Date().toLocaleString(),
        }
      ]
    };

    this.state.staffWorkspaces = [newTicket, ...(this.state.staffWorkspaces || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'STAFF',
      action: 'Created Maintenance Ticket',
      target: `#${ticketNumber}: ${newTicket.title}`,
      oldValue: 'None',
      newValue: newTicket.status,
    });
    this.save();
    return newTicket;
  }

  updateStaffTicketStatus(ticketId, newStatus, user = { name: 'Operations Desk', role: 'STAFF' }, resolutionDetails = '', cancelReason = '') {
    const t = this.state.staffWorkspaces.find(x => x.id === ticketId || x.ticketNumber === ticketId);
    if (t) {
      const old = t.status;
      t.status = newStatus;
      if (resolutionDetails) {
        t.resolutionDetails = resolutionDetails;
        t.resolvedAt = new Date().toISOString();
      }
      if (cancelReason) {
        t.cancelReason = cancelReason;
      }
      t.history = t.history || [];
      t.history.push({
        action: `STATUS_CHANGE_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
        stage: newStatus,
        by: user.name,
        notes: resolutionDetails || cancelReason || `Status updated from "${old}" to "${newStatus}"`,
        timestamp: new Date().toLocaleString(),
      });
      this.logAuditEvent({
        user: user.name,
        role: 'STAFF',
        action: 'Updated Operations Ticket',
        target: `#${t.ticketNumber || t.id}: ${t.title}`,
        oldValue: old,
        newValue: newStatus,
      });
      this.save();
    }
    return t;
  }

  assignStaffTicket(ticketId, assignedTo, user = { name: 'Supervisor', role: 'STAFF' }) {
    const t = this.state.staffWorkspaces.find(x => x.id === ticketId || x.ticketNumber === ticketId);
    if (t) {
      const old = t.assignedTo || 'Unassigned';
      t.assignedTo = assignedTo;
      if (t.status === 'Open') {
        t.status = 'Assigned';
      }
      t.history = t.history || [];
      t.history.push({
        action: 'REASSIGNMENT',
        stage: t.status,
        by: user.name,
        notes: `Reassigned from "${old}" to "${assignedTo}"`,
        timestamp: new Date().toLocaleString(),
      });
      this.logAuditEvent({
        user: user.name,
        role: 'STAFF',
        action: 'Assigned Operations Ticket',
        target: `#${t.ticketNumber || t.id}`,
        oldValue: old,
        newValue: assignedTo,
      });
      this.save();
    }
    return t;
  }

  addTicketComment(ticketId, commentText, author = 'Staff', isInternal = false) {
    const t = this.state.staffWorkspaces.find(x => x.id === ticketId || x.ticketNumber === ticketId);
    if (t) {
      t.comments = t.comments || [];
      const newComment = {
        id: `CMT-${Date.now()}`,
        author,
        role: 'STAFF',
        text: commentText,
        isInternal,
        createdAt: new Date().toLocaleString(),
      };
      t.comments.push(newComment);
      this.save();
      return newComment;
    }
    return null;
  }

  // --- Visitor Gate Passes ---
  getVisitorPasses() {
    return this.state.visitorPasses || [];
  }

  addVisitorPass(passData, user = { name: 'Reception Staff', role: 'STAFF' }) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const passNumber = `GP-2026-${randomSuffix}`;
    const verificationToken = `GIFT-PASS-${randomSuffix}-${Date.now().toString(36).toUpperCase()}`;

    const newPass = {
      id: passNumber,
      passNumber,
      visitorName: passData.visitorName,
      organization: passData.organization || 'General Visitor',
      phone: passData.phone,
      email: passData.email || '',
      purpose: passData.purpose,
      hostPerson: passData.hostPerson || 'Administrative Officer',
      hostDept: passData.hostDept || 'Campus Reception',
      guestCount: Number(passData.guestCount) || 1,
      badgeNumber: passData.badgeNumber || '',
      expectedArrival: passData.expectedArrival || new Date().toISOString().split('T')[0],
      inTime: passData.status === 'Checked In' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
      outTime: null,
      status: passData.status || 'Approved',
      verificationToken,
      history: [
        {
          action: 'REGISTERED',
          by: user.name,
          notes: `Pass generated for ${passData.visitorName} (${passData.organization || 'Guest'})`,
          timestamp: new Date().toLocaleString(),
        }
      ]
    };

    this.state.visitorPasses = [newPass, ...(this.state.visitorPasses || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'STAFF',
      action: 'Issued Visitor Gate Pass',
      target: `#${passNumber} (${newPass.visitorName})`,
      oldValue: 'None',
      newValue: newPass.status,
    });
    this.save();
    return newPass;
  }

  updateVisitorStatus(passId, action, user = { name: 'Gate Security', role: 'STAFF' }, badgeNumber = '') {
    const pass = this.state.visitorPasses.find(p => p.id === passId || p.passNumber === passId);
    if (!pass) return null;

    pass.history = pass.history || [];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (action === 'CHECK_IN') {
      pass.status = 'Checked In';
      pass.inTime = timeStr;
      if (badgeNumber) pass.badgeNumber = badgeNumber;
      pass.history.push({
        action: 'CHECKED_IN',
        by: user.name,
        notes: `Guest physical arrival logged. Badge ${pass.badgeNumber || 'allocated'}.`,
        timestamp: new Date().toLocaleString(),
      });
    } else if (action === 'CHECK_OUT') {
      pass.status = 'Checked Out';
      pass.outTime = timeStr;
      pass.history.push({
        action: 'CHECKED_OUT',
        by: user.name,
        notes: `Guest departure logged at ${timeStr}. Security badge returned.`,
        timestamp: new Date().toLocaleString(),
      });
    } else if (action === 'CANCEL') {
      pass.status = 'Cancelled';
      pass.history.push({
        action: 'CANCELLED',
        by: user.name,
        notes: 'Pass voided by gate authority.',
        timestamp: new Date().toLocaleString(),
      });
    }

    this.logAuditEvent({
      user: user.name,
      role: 'STAFF',
      action: `Visitor Action: ${action}`,
      target: `#${pass.passNumber}: ${pass.visitorName}`,
      oldValue: 'Previous Status',
      newValue: pass.status,
    });
    this.save();
    return pass;
  }

  // --- Office Dispatch Registers ---
  getDispatchRecords() {
    return this.state.dispatchRecords || [];
  }

  addDispatchRecord(dispatchData, user = { name: 'Office Clerk', role: 'STAFF' }) {
    const isOutward = (dispatchData.dispatchType || '').toUpperCase() === 'OUTWARD';
    const prefix = isOutward ? 'OUT-2026' : 'INW-2026';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const refNumber = `${prefix}-${randomSuffix}`;

    const newDoc = {
      id: refNumber,
      refNumber,
      dispatchType: isOutward ? 'OUTWARD' : 'INWARD',
      subject: dispatchData.subject,
      category: dispatchData.category || 'Institutional Document',
      partyName: dispatchData.partyName || '',
      partyOrg: dispatchData.partyOrg || '',
      partyContact: dispatchData.partyContact || '',
      department: dispatchData.department || 'Registrar Office',
      assignedOfficer: dispatchData.assignedOfficer || 'Senior Clerk',
      priority: dispatchData.priority || 'Normal',
      docType: dispatchData.docType || 'Official Memorandum',
      confidentiality: dispatchData.confidentiality || 'Normal',
      trackingNumber: dispatchData.trackingNumber || '',
      courierName: dispatchData.courierName || 'Speed Post (India Post)',
      recordDate: dispatchData.recordDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: isOutward ? 'Under Review' : 'Registered',
      proofAttachment: dispatchData.proofAttachment || '',
      notes: dispatchData.notes || '',
      history: [
        {
          action: 'REGISTERED',
          by: user.name,
          notes: `${isOutward ? 'Outward' : 'Inward'} record docket #${refNumber} opened`,
          timestamp: new Date().toLocaleString(),
        }
      ]
    };

    this.state.dispatchRecords = [newDoc, ...(this.state.dispatchRecords || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'STAFF',
      action: 'Registered Dispatch Document',
      target: `#${refNumber}: ${newDoc.subject}`,
      oldValue: 'None',
      newValue: newDoc.status,
    });
    this.save();
    return newDoc;
  }

  updateDispatchStatus(dispatchId, newStatus, user = { name: 'Clerk Supervisor', role: 'STAFF' }, notes = '') {
    const doc = this.state.dispatchRecords.find(d => d.id === dispatchId || d.refNumber === dispatchId);
    if (!doc) return null;

    const old = doc.status;
    doc.status = newStatus;
    doc.history = doc.history || [];
    doc.history.push({
      action: `TRANSITION_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      stage: newStatus,
      by: user.name,
      notes: notes || `Document lifecycle progressed to ${newStatus}`,
      timestamp: new Date().toLocaleString(),
    });

    this.logAuditEvent({
      user: user.name,
      role: 'STAFF',
      action: 'Updated Dispatch Status',
      target: `#${doc.refNumber}`,
      oldValue: old,
      newValue: newStatus,
    });
    this.save();
    return doc;
  }

  // --- Campus Assets & Lab Equipment ---
  getLabAssets() {
    return this.state.labAssets || [];
  }

  updateAssetStatus(assetCode, condition, notes = '', user = { name: 'Lab In-Charge', role: 'STAFF' }) {
    const asset = this.state.labAssets.find(a => a.assetCode === assetCode || a.id === assetCode);
    if (asset) {
      const old = asset.condition;
      asset.condition = condition;
      asset.status = condition;
      asset.lastMaintenance = new Date().toISOString().split('T')[0];
      if (condition === 'Faulty' || condition === 'Under Maintenance') {
        asset.downtimeHours = (asset.downtimeHours || 0) + 4;
      }
      this.logAuditEvent({
        user: user.name,
        role: 'STAFF',
        action: 'Updated Asset Condition',
        target: `${asset.name} (${asset.assetCode})`,
        oldValue: old,
        newValue: condition,
      });
      this.save();
      return asset;
    }
    return null;
  }

  addLabAsset(assetData, user = { name: 'Lab Systems Engineer', role: 'STAFF' }) {
    const newAsset = {
      id: `AST-${Date.now().toString().slice(-4)}`,
      assetCode: assetData.assetCode || `ASSET-${Date.now().toString().slice(-4)}`,
      name: assetData.name,
      category: assetData.category || 'Laboratory Equipment',
      labName: assetData.labName || 'Central Computing Facility',
      building: assetData.building || 'Block B',
      room: assetData.room || 'General',
      department: assetData.department || 'Computer Science & Engineering',
      condition: assetData.condition || 'Operational',
      status: assetData.condition || 'Operational',
      manufacturer: assetData.manufacturer || 'OEM',
      serialNumber: assetData.serialNumber || 'SN-GEN-001',
      custodian: assetData.custodian || user.name,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      downtimeHours: 0,
    };
    this.state.labAssets = [newAsset, ...(this.state.labAssets || [])];
    this.logAuditEvent({
      user: user.name,
      role: 'STAFF',
      action: 'Registered Lab Asset',
      target: `${newAsset.name} (${newAsset.assetCode})`,
      oldValue: 'None',
      newValue: 'Operational',
    });
    this.save();
    return newAsset;
  }

  // --- Operational Console Real-time Dashboard Analytics ---
  getStaffOperationalStats() {
    const tickets = this.getStaffTickets();
    const visitors = this.getVisitorPasses();
    const dispatches = this.getDispatchRecords();
    const assets = this.getLabAssets();

    const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'Cancelled');
    const criticalIncidents = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed');

    const now = Date.now();
    const overdueTickets = openTickets.filter(t => {
      if (!t.resolutionDueAt) return false;
      return new Date(t.resolutionDueAt).getTime() < now;
    });

    const checkedInVisitors = visitors.filter(v => v.status === 'Checked In');
    const todayStr = new Date().toISOString().split('T')[0];
    const expectedToday = visitors.filter(v => (v.expectedArrival || '').startsWith(todayStr));

    const totalAssets = assets.length || 6;
    const operationalAssets = assets.filter(a => a.condition === 'Operational').length || 4;

    const pendingDispatches = dispatches.filter(d => d.status !== 'Delivered' && d.status !== 'Archived');

    const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
    let compliant = 0;
    resolved.forEach(t => {
      if (t.resolvedAt && t.resolutionDueAt) {
        if (new Date(t.resolvedAt).getTime() <= new Date(t.resolutionDueAt).getTime()) compliant++;
      } else {
        compliant++;
      }
    });

    const slaPercentage = resolved.length > 0
      ? Math.round((compliant / resolved.length) * 100 * 10) / 10
      : 98.4;

    return {
      openTicketsCount: openTickets.length,
      overdueTicketsCount: overdueTickets.length,
      criticalIncidentsCount: criticalIncidents.length,
      checkedInVisitorsCount: checkedInVisitors.length,
      expectedVisitorsTodayCount: expectedToday.length,
      totalLaboratories: 12,
      operationalLaboratories: 11,
      totalAssetsCount: totalAssets,
      operationalAssetsCount: operationalAssets,
      pendingDispatchesCount: pendingDispatches.length,
      slaCompliancePercentage: slaPercentage,
    };
  }

  // --- Leave Requests ---
  getLeaveRequests() {
    return this.state.leaveRequests || [];
  }

  approveLeave(leaveId, approverRole = 'principal', remarks = 'Approved by Authority') {
    const leave = this.state.leaveRequests.find(l => l.id === leaveId);
    if (leave) {
      if (approverRole === 'principal') {
        leave.principalStatus = 'Approved';
        leave.principalRemarks = remarks;
      } else if (approverRole === 'hod') {
        leave.hodStatus = 'Approved & Recommended';
        leave.hodRemarks = remarks;
      }
      this.logAuditEvent({
        user: approverRole === 'principal' ? 'Principal / Director' : 'HOD',
        role: approverRole.toUpperCase(),
        action: 'Leave Application Approval',
        target: `${leave.applicantName} (${leave.applicantRole})`,
        oldValue: 'Pending',
        newValue: 'Approved',
      });
      this.save();
    }
    return leave;
  }

  rejectLeave(leaveId, approverRole = 'principal', remarks = 'Rejected') {
    const leave = this.state.leaveRequests.find(l => l.id === leaveId);
    if (leave) {
      if (approverRole === 'principal') {
        leave.principalStatus = 'Rejected';
        leave.principalRemarks = remarks;
      } else if (approverRole === 'hod') {
        leave.hodStatus = 'Rejected';
        leave.hodRemarks = remarks;
      }
      this.logAuditEvent({
        user: approverRole === 'principal' ? 'Principal / Director' : 'HOD',
        role: approverRole.toUpperCase(),
        action: 'Leave Application Rejected',
        target: `${leave.applicantName} (${leave.applicantRole})`,
        oldValue: 'Pending',
        newValue: 'Rejected',
      });
      this.save();
    }
    return leave;
  }

  // --- Relational Academic Structure Accessors ---
  getPrograms() {
    return initialPrograms;
  }

  getBatches() {
    return initialBatches;
  }

  getDepartments() {
    return initialDepartments;
  }

  getSections() {
    return initialSections;
  }

  getSubjects() {
    return initialSubjects;
  }

  getFacultyAssignments() {
    return initialFacultyAssignments;
  }

  getFacultyAssignedClasses(facultyIdentifier) {
    if (!facultyIdentifier) return initialFacultyAssignments;
    const q = String(facultyIdentifier).toLowerCase();
    const matches = initialFacultyAssignments.filter(fa =>
      fa.facultyId.toLowerCase() === q ||
      fa.facultyName.toLowerCase().includes(q) ||
      (q.includes('mohanty') && fa.facultyName.toLowerCase().includes('mohanty')) ||
      (q.includes('rahul') && fa.facultyName.toLowerCase().includes('rahul'))
    );
    return matches.length > 0 ? matches : initialFacultyAssignments.slice(0, 2);
  }

  // --- Intelligent Academic At-Risk Detection Engine ---
  calculateStudentRisk(student) {
    if (!student) {
      return { category: 'GOOD', badgeColor: '#059669', isAtRisk: false, reasons: [] };
    }
    const att = Number(student.attendance) || 85;
    const cgpa = Number(student.cgpa) || 7.5;
    const backlogs = Number(student.backlogCount || student.backlogs || 0);
    const reasons = [];

    if (att < 75) {
      reasons.push(`Attendance is ${att}% (<75% statutory requirement)`);
    }
    if (cgpa < 6.0) {
      reasons.push(`Cumulative GPA is ${cgpa} (<6.0 graduation benchmark)`);
    }
    if (backlogs > 0) {
      reasons.push(`${backlogs} active academic backlog paper(s)`);
    }

    let category = 'GOOD';
    let badgeColor = '#059669';
    let isAtRisk = false;

    if (att < 65 || (att < 75 && backlogs >= 2)) {
      category = 'CRITICAL';
      badgeColor = '#dc2626';
      isAtRisk = true;
    } else if (att < 75 || cgpa < 6.0 || backlogs > 0) {
      category = 'AT RISK';
      badgeColor = '#d97706';
      isAtRisk = true;
    } else if (cgpa >= 8.5 && att >= 85) {
      category = 'EXCELLENT';
      badgeColor = '#2563eb';
      isAtRisk = false;
    }

    return {
      category,
      badgeColor,
      isAtRisk,
      reasons,
      attendance: att,
      cgpa,
      backlogs
    };
  }

  // --- Automatic Placement Eligibility Engine ---
  getPlacementEligibleStudents(driveId, allStudents = []) {
    const drive = (this.state.placementDrives || []).find(d => d.id === driveId);
    if (!drive) return [];

    const { minCgpa = 7.0, maxBacklogs = 0, allowedBranches = ['CSE', 'ECE'] } = drive.eligibilityCriteria || {};

    return allStudents.map(student => {
      const cgpa = Number(student.cgpa) || 7.0;
      const backlogs = Number(student.backlogCount || student.backlogs || 0);
      const att = Number(student.attendance) || 80;
      const branchCode = student.deptCode || (student.department?.includes('Computer') ? 'CSE' : 'CSE');

      const reasons = [];
      if (cgpa < minCgpa) reasons.push(`CGPA ${cgpa} < required ${minCgpa}`);
      if (backlogs > maxBacklogs) reasons.push(`Backlogs (${backlogs}) exceed maximum allowed (${maxBacklogs})`);
      if (allowedBranches.length > 0 && !allowedBranches.some(b => branchCode.includes(b) || b.includes(branchCode))) {
        reasons.push(`Branch ${branchCode} not in allowed: [${allowedBranches.join(', ')}]`);
      }
      if (att < 75) reasons.push(`Attendance ${att}% below 75% minimum clearance`);

      return {
        student,
        isEligible: reasons.length === 0,
        reasons,
      };
    });
  }

  // --- Placement ATS Workflow ---
  recordPlacementApplication({ driveId, studentId, studentName, regNo, branch, cgpa }) {
    const drive = (this.state.placementDrives || []).find(d => d.id === driveId);
    if (drive) {
      drive.registeredCount = (drive.registeredCount || 0) + 1;
      this.logAuditEvent({
        user: studentName,
        role: 'STUDENT',
        action: 'Applied for Campus Placement Drive',
        target: `${drive.company} — ${drive.role}`,
        oldValue: 'Not Registered',
        newValue: 'Application Submitted',
      });
      this.save();
    }
    return drive;
  }

  updatePlacementApplicantStatus(driveId, rollNumber, newStage) {
    const drive = (this.state.placementDrives || []).find(d => d.id === driveId);
    if (drive) {
      if (newStage === 'Selected') {
        drive.selectedCount = (drive.selectedCount || 0) + 1;
      } else if (newStage === 'Shortlisted') {
        drive.shortlistedCount = (drive.shortlistedCount || 0) + 1;
      }
      this.logAuditEvent({
        user: 'Placement Officer',
        role: 'PLACEMENT',
        action: 'Updated Applicant Stage',
        target: `Student ${rollNumber} for ${drive.company}`,
        oldValue: 'Previous Stage',
        newValue: newStage,
      });
      this.save();
    }
  }

  // --- Student Semester Promotion Lifecycle ---
  promoteStudent(studentId, nextSemester, nextSection) {
    this.logAuditEvent({
      user: 'Academic Operations Dean',
      role: 'ADMIN',
      action: 'Promoted Student to Next Semester',
      target: `Student ID ${studentId} -> ${nextSemester} ${nextSection}`,
      oldValue: 'Previous Term',
      newValue: `${nextSemester} · ${nextSection}`,
    });
    this.save();
  }
}

export const erpStore = new ERPEnterpriseStore();
