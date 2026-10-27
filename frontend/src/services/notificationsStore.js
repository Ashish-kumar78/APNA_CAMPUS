// Centralized Institutional Notification Store
// Multi-Role Support: Student, Faculty, Exam Cell, HOD, Principal, Super Admin, Management, etc.
// Fully reactive with real-time audio chimes and localStorage persistence

import { playReceivedSound } from './soundEffects.js';
import { api, API_BASE_URL } from './api.js';

const NOTIFICATIONS_STORE_KEY_PREFIX = 'apna_campus_role_notifs_v3_';
const FACULTY_NOTIFS_STORAGE_KEY = 'apna_campus_faculty_notifications_v2';


export function normalizeRole(rawRole) {
  if (!rawRole) return 'student';
  const r = String(rawRole).trim().toLowerCase().replace(/[\s-]/g, '_');
  if (r.includes('super')) return 'super_admin';
  if (r.includes('exam') || r === 'coe') return 'exam_cell';
  if (r.includes('hod')) return 'hod';
  if (r.includes('fac') || r.includes('prof') || r.includes('teach')) return 'faculty';
  if (r.includes('prin') || r.includes('direct')) return 'principal';
  if (r.includes('manag') || r.includes('trust')) return 'management';
  if (r.includes('account') || r.includes('finan')) return 'accounts';
  if (r.includes('hostel') || r.includes('warden')) return 'hostel';
  if (r.includes('lib')) return 'library';
  if (r.includes('place') || r.includes('tpo')) return 'placement';
  if (r.includes('trans')) return 'transport';
  if (r.includes('admis')) return 'admissions';
  if (r.includes('operat') || r.includes('estate') || r.includes('maint')) return 'campus_operations';
  if (r.includes('cant') || r.includes('cafe') || r.includes('mess')) return 'canteen';
  if (r.includes('staff')) return 'staff';
  if (r.includes('admin')) return 'admin';
  return 'student';
}

// ─────────────────────────────────────────────────────────────────────────────
// PRE-SEEDED ROLE-SPECIFIC NOTIFICATIONS (Institutional Master Data)
// ─────────────────────────────────────────────────────────────────────────────
export const ROLE_DEFAULT_NOTIFICATIONS = {
  student: [
    {
      id: 'notif-stu-gift-mod2',
      title: 'B.Tech 5th Semester Modular test-II schedule, 2026',
      message: 'Dear Students, The Modular Test -II for B.Tech 5th Semester will be conducted from 05 November 2026 to 12 November 2026 as per the schedule given below. All students are advised to take note of the schedule and prepare accordingly.\n\nTiming: 8:30 am to 9:30 am across all B.Tech branches (AGRIL, CIVIL, CSE, CSE-AI, CS & IOT, EEE, ECE, MECH). Lab examinations will be conducted per respective HoD timetables.',
      category: 'EXAMINATION',
      priority: 'URGENT',
      senderName: 'CONTROLLER OF EXAMINATION (GIFT)',
      senderRole: 'Dr. Pallab Kumar Kar (CoE)',
      senderDept: 'Office of the CoE · GIFT Autonomous, Bhubaneswar',
      timestamp: new Date().toISOString(),
      unread: true,
      actionTab: 'examination',
      actionLabel: 'View Exam Timetable',
      attachmentName: 'BTech_5th_Sem_Modular_Test_II_Schedule_2026.pdf',
      isOfficialModularTestNotice: true,
    },
    {
      id: 'notif-stu-102',
      title: 'Assignment 3: Red-Black Tree Implementation Deadline Extension',
      message: 'In response to multiple student requests regarding the complexities of node recoloring and rotations, the submission deadline for Assignment 3 has been extended to Friday, 17 Oct 2026, 11:59 PM. Please push your tested C/C++ repository links through the online portal.',
      category: 'ASSIGNMENT',
      priority: 'IMPORTANT',
      senderName: 'Dr. S. Mohanty',
      senderRole: 'Course Coordinator',
      senderDept: 'Computer Science & Engineering',
      timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'academics',
      actionLabel: 'Open Academics Module',
      attachmentName: 'Assignment3_RB_Tree_Specification.pdf',
    },
    {
      id: 'notif-stu-103',
      title: 'PRERANA Post-Matric Scholarship Sanctioned',
      message: 'Disbursement sanctioned by SSD Department, Government of Odisha. Identity and bank verification completed. Funds of ₹28,500 credited to tuition ledger.',
      category: 'FEES',
      priority: 'NORMAL',
      senderName: 'Accounts & Scholarships Cell',
      senderRole: 'Bursar Office',
      senderDept: 'Finance & Student Welfare',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'fees',
      actionLabel: 'View Fee Receipts',
    },
    {
      id: 'notif-stu-104',
      title: 'Central Library Book Return Reminder',
      message: '"Introduction to Algorithms (CLRS 4th Edition)" is due for return in 3 days. Renew online or return to central circulation desk to avoid late fines.',
      category: 'LIBRARY',
      priority: 'NORMAL',
      senderName: 'Central Library Desk',
      senderRole: 'Chief Librarian',
      senderDept: 'Learning Resource Center',
      timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'library',
      actionLabel: 'Open Library Catalog',
    },
    {
      id: 'notif-stu-105',
      title: 'TCS National Qualifier Test (NQT) Campus Drive 2026',
      message: 'Final year B.Tech CSE/IT/ECE registration window open. Minimum 60% aggregate across 10th, +2 and B.Tech with no active backlogs. Register before 20 Oct 2026.',
      category: 'PLACEMENT',
      priority: 'IMPORTANT',
      senderName: 'Training & Placement Cell',
      senderRole: 'Head - Corporate Relations',
      senderDept: 'T&P Directorate',
      timestamp: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
      unread: false,
      actionTab: 'placement',
      actionLabel: 'View Placement Drives',
    },
  ],

  faculty: [
    {
      id: 'notif-fac-201',
      title: 'Continuous Internal Evaluation (CIE-2) Marks Entry Deadline',
      message: 'Autonomous marks entry gateway for CS501 / CS502 closes on 18 Oct 2026 at 17:00 hrs. All faculty coordinators must freeze entries and submit signed hardcopies.',
      category: 'EXAMINATION',
      priority: 'URGENT',
      senderName: 'Controller of Examinations',
      senderRole: 'CoE Directorate',
      senderDept: 'Autonomous Examination Cell',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'marks',
      actionLabel: 'Open Marks Management',
    },
    {
      id: 'notif-fac-202',
      title: 'Mid-Semester Theory Invigilation Roster Allocated',
      message: 'You have been allotted 4 invigilation duties in Block B Examination Hall commencing from 15 Oct 2026. Review your assigned halls and session timing.',
      category: 'DUTY_ROSTER',
      priority: 'IMPORTANT',
      senderName: 'Prof. P. K. Rout',
      senderRole: 'Chief Invigilation Superintendent',
      senderDept: 'Examination Flying Squad',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'examination',
      actionLabel: 'View Invigilation Roster',
      attachmentName: 'MidSem_Invigilation_Roster_Oct2026.pdf',
    },
    {
      id: 'notif-fac-203',
      title: 'Department Academic Council (DAC) Monthly Meeting',
      message: 'Monthly syllabus coverage review & NBA Criteria-2 Course Outcome attainment audit scheduled for Thursday at 3:30 PM in Seminar Hall 1.',
      category: 'ACADEMIC',
      priority: 'NORMAL',
      senderName: 'Dr. Debabrata Singh',
      senderRole: 'Head of Department',
      senderDept: 'Computer Science & Engineering',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'dashboard',
      actionLabel: 'View Department Agenda',
    },
    {
      id: 'notif-fac-204',
      title: 'Sponsored Research Seed Grant Proposals Open',
      message: 'Institutional R&D cell invites seed research funding proposals in Generative AI, IoT & Quantum Computing with grants up to ₹3,50,000 per project.',
      category: 'RESEARCH',
      priority: 'NORMAL',
      senderName: 'Dean (Research & Development)',
      senderRole: 'Dean R&D',
      senderDept: 'Institutional Innovation Council',
      timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'dashboard',
      actionLabel: 'Research Cell Circular',
    },
  ],

  hod: [
    {
      id: 'notif-hod-301',
      title: 'Departmental NAAC Criterion 2 Verification Pending',
      message: 'Course outcome (CO) and program outcome (PO) attainment matrices required from 4 faculty course coordinators for autonomous validation.',
      category: 'COMPLIANCE',
      priority: 'URGENT',
      senderName: 'Director (IQAC & Accreditation)',
      senderRole: 'IQAC Directorate',
      senderDept: 'Quality Assurance Cell',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'governance',
      actionLabel: 'Open Compliance Ledger',
    },
    {
      id: 'notif-hod-302',
      title: 'Low Attendance Remedial Mentoring Roster',
      message: '12 students in B.Tech Semester 5 have aggregate attendance < 75%. Parent notifications and remedial class scheduling required before exam cutoff.',
      category: 'ACADEMIC',
      priority: 'IMPORTANT',
      senderName: 'Academic Proctorial Board',
      senderRole: 'Dean Academics',
      senderDept: 'Dean Office',
      timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'students',
      actionLabel: 'View At-Risk Students',
    },
    {
      id: 'notif-hod-303',
      title: 'Junior Faculty Lesson Plan Submissions for Approval',
      message: 'Lesson plans for 6 laboratory and theory courses for odd semester submitted for HOD review and endorsement.',
      category: 'FACULTY',
      priority: 'NORMAL',
      senderName: 'Department Academic Coordinator',
      senderRole: 'Academic Committee',
      senderDept: 'CSE Department',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'faculty',
      actionLabel: 'Review Lesson Plans',
    },
    {
      id: 'notif-hod-304',
      title: 'Advanced AI & GPU Lab Hardware Upgrades Operational',
      message: 'New high-performance NVIDIA RTX workstations installed in Lab 4. Network subnet and CUDA drivers configured for deep learning coursework.',
      category: 'INFRASTRUCTURE',
      priority: 'NORMAL',
      senderName: 'System Administrator',
      senderRole: 'Central IT Services',
      senderDept: 'Enterprise IT',
      timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'labs',
      actionLabel: 'Inspect Lab Inventory',
    },
  ],

  exam_cell: [
    {
      id: 'notif-coe-401',
      title: 'Question Paper Moderation Board Clearance Complete',
      message: 'Encrypted question papers for 42 autonomous degree courses moderated by external subject experts and sealed in the digital tamper-evident vault.',
      category: 'CONFIDENTIAL',
      priority: 'URGENT',
      senderName: 'Controller of Examinations',
      senderRole: 'Autonomous Examination Board',
      senderDept: 'Office of the CoE',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'question_papers',
      actionLabel: 'View Paper Vault',
    },
    {
      id: 'notif-coe-402',
      title: 'Digital Answer Sheet On-Screen Evaluation: 84% Completed',
      message: '2,140 answer booklets scored by external evaluators. 410 scripts currently under second-tier scrutiny verification in Digital Evaluation Suite.',
      category: 'EVALUATION',
      priority: 'IMPORTANT',
      senderName: 'Chief Evaluation Officer',
      senderRole: 'Digital Evaluation Division',
      senderDept: 'Autonomous Evaluation Directorate',
      timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'digital_evaluation',
      actionLabel: 'Open Evaluation Suite',
    },
    {
      id: 'notif-coe-403',
      title: '18 Scrutiny & Re-checking Applications Received',
      message: 'Candidates registered for re-evaluation in Data Structures, Discrete Mathematics and Operating Systems. Fee clearance verified by Accounts.',
      category: 'SCRUTINY',
      priority: 'NORMAL',
      senderName: 'Assistant Registrar (Examinations)',
      senderRole: 'Autonomous Exam Wing',
      senderDept: 'Office of the CoE',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'scrutiny',
      actionLabel: 'Review Re-checking Cases',
    },
    {
      id: 'notif-coe-404',
      title: 'Autonomous Hall Ticket Barcode & Gate Allocation Complete',
      message: '2,480 hall tickets generated with dynamic anti-fraud QR barcodes and room door charts ready for publishing.',
      category: 'HALL_TICKETS',
      priority: 'NORMAL',
      senderName: 'Systems Analyst (Exam Cell)',
      senderRole: 'ERP Automation Desk',
      senderDept: 'CoE Technical Unit',
      timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'hall_tickets',
      actionLabel: 'Manage Admit Cards',
    },
  ],

  super_admin: [
    {
      id: 'notif-sup-501',
      title: 'Zero-Trust Security & Audit Hash Verification Passed',
      message: 'Automated cryptographic hash integrity audit passed across institutional DB tables. Zero unauthorized permission alterations detected.',
      category: 'SECURITY',
      priority: 'URGENT',
      senderName: 'Automated Cyber Security Daemon',
      senderRole: 'Zero-Trust Engine',
      senderDept: 'Enterprise Cyber Security',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'system-health',
      actionLabel: 'View Security Audit Log',
    },
    {
      id: 'notif-sup-502',
      title: 'Microservices Health Status: 14 / 14 Services Operational',
      message: 'All core micro-services reporting 99.98% uptime with average gateway latency < 16ms. Zero socket connection failures.',
      category: 'SYSTEM',
      priority: 'NORMAL',
      senderName: 'Cluster Orchestration Manager',
      senderRole: 'Cloud DevOps Sentinel',
      senderDept: 'Data Center Annex',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'uptime',
      actionLabel: 'View Server Fleet',
    },
    {
      id: 'notif-sup-503',
      title: 'Encrypted Daily Database Snapshot Uploaded to Cold Storage',
      message: 'Off-site automated disaster recovery backup completed at 18:00 hrs IST. 4.8 GB compressed archive verified with SHA-256 checksum.',
      category: 'BACKUP',
      priority: 'NORMAL',
      senderName: 'Storage Gateway Agent',
      senderRole: 'Database Reliability Unit',
      senderDept: 'Data Center Infrastructure',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'backup',
      actionLabel: 'Verify Backup Manifest',
    },
    {
      id: 'notif-sup-504',
      title: 'RBAC Policy Token Signature Rotation Enforced',
      message: 'Automated JWT cryptographic key rotation executed across all 22 institutional gateway endpoints for 2,698 active accounts.',
      category: 'RBAC',
      priority: 'NORMAL',
      senderName: 'Identity Governance Daemon',
      senderRole: 'Auth Core',
      senderDept: 'IAM Infrastructure',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'rbac',
      actionLabel: 'Inspect Active Sessions',
    },
  ],

  principal: [
    {
      id: 'notif-pri-601',
      title: 'State Higher Education Regulatory Inspection Visit',
      message: 'High-level regulatory review committee scheduled to visit campus on 28 Oct 2026. All department heads must keep NAAC & NIRF dossiers updated.',
      category: 'GOVERNANCE',
      priority: 'URGENT',
      senderName: 'State Council of Technical Education',
      senderRole: 'Statutory Regulator',
      senderDept: 'Higher Education Department',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'governance',
      actionLabel: 'Review Inspection Agenda',
    },
    {
      id: 'notif-pri-602',
      title: 'Institutional Annual Capex & Laboratory Modernization Sanction',
      message: 'Governing Board of Trustees has sanctioned ₹2.4 Crore capital expenditure for robotics research center and smart lecture halls.',
      category: 'BUDGET',
      priority: 'IMPORTANT',
      senderName: 'Board of Trustees',
      senderRole: 'Governing Council',
      senderDept: 'Executive Board',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'finance',
      actionLabel: 'Inspect Sanction File',
    },
    {
      id: 'notif-pri-603',
      title: 'Faculty Promotion (CAS) Recommendations Submitted',
      message: '14 senior associate professor promotion files endorsed by external screening committee ready for Principal executive concurrence.',
      category: 'FACULTY',
      priority: 'NORMAL',
      senderName: 'Dean (Faculty Affairs)',
      senderRole: 'Faculty Evaluation Board',
      senderDept: 'Administrative Affairs',
      timestamp: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'faculty',
      actionLabel: 'Review Promotion Dossiers',
    },
  ],

  management: [
    {
      id: 'notif-mgt-701',
      title: 'Q3 Institutional Financial Audit & Operating Ledger Cleared',
      message: 'Independent statutory chartered accountants completed quarterly institutional audit with zero compliance exceptions or financial discrepancies.',
      category: 'FINANCE',
      priority: 'IMPORTANT',
      senderName: 'Statutory Audit Committee',
      senderRole: 'Internal Audit Bureau',
      senderDept: 'Finance Committee',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'financial-oversight',
      actionLabel: 'View Financial Report',
    },
    {
      id: 'notif-mgt-702',
      title: 'Tech Tower Phase-3 Architectural Sanction Approved',
      message: 'State municipal corporation approved structural blueprint for the 5-story innovation incubator and advanced robotics complex.',
      category: 'INFRASTRUCTURE',
      priority: 'IMPORTANT',
      senderName: 'Estate & Infrastructure Board',
      senderRole: 'Chief Infrastructure Officer',
      senderDept: 'Campus Master Plan Unit',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'infrastructure',
      actionLabel: 'View Building Blueprint',
    },
    {
      id: 'notif-mgt-703',
      title: 'NIRF 2027 Institutional Ranking Metric Upload Complete',
      message: 'All verified data parameters across Teaching, Learning & Resources (TLR) and Research & Professional Practice (RPC) uploaded to central portal.',
      category: 'ACCREDITATION',
      priority: 'NORMAL',
      senderName: 'Director (Rankings & Accreditations)',
      senderRole: 'Accreditation Bureau',
      senderDept: 'Office of Management',
      timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'governance',
      actionLabel: 'Inspect Ranking Metrics',
    },
  ],

  admin: [
    {
      id: 'notif-adm-801',
      title: 'Annual Campus Maintenance Contract (AMC) Renewal Sanctioned',
      message: 'HVAC chillers, diesel power generators, and high-speed campus fiber optic networks cleared for annual AMC renewal.',
      category: 'OPERATIONS',
      priority: 'IMPORTANT',
      senderName: 'Campus Estate Office',
      senderRole: 'Estate Officer',
      senderDept: 'General Administration',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'maintenance',
      actionLabel: 'Open Maintenance Ledger',
    },
    {
      id: 'notif-adm-802',
      title: 'Biometric Staff Attendance Reconciliation Report',
      message: 'Weekly staff biometric check-in anomalies resolved with physical gate access records. Monthly payroll export ready.',
      category: 'BIOMETRIC',
      priority: 'NORMAL',
      senderName: 'Human Resources Cell',
      senderRole: 'HR Manager',
      senderDept: 'Personnel Administration',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'attendance',
      actionLabel: 'View Attendance Records',
    },
    {
      id: 'notif-adm-803',
      title: 'Central Auditorium Reservation: Annual Tech Fest 2026',
      message: 'Stage lighting, high-definition digital projection system, and fire safety protocols certified for student technical festival.',
      category: 'FACILITIES',
      priority: 'NORMAL',
      senderName: 'Student Affairs Council',
      senderRole: 'Dean Student Affairs',
      senderDept: 'Campus Events Desk',
      timestamp: new Date(Date.now() - 27 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'facilities',
      actionLabel: 'Inspect Venue Booking',
    },
  ],

  accounts: [
    {
      id: 'notif-acc-901',
      title: 'Semester VII Tuition Fee Reconciliation: 94.2% Collected',
      message: 'Automated banking gateway reconciled ₹1.42 Cr in student online fee payments. 142 outstanding accounts flagged for automated reminder.',
      category: 'COLLECTION',
      priority: 'IMPORTANT',
      senderName: 'Automated Payment Gateway',
      senderRole: 'Banking Integration Engine',
      senderDept: 'Office of the Bursar',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'fee-collection',
      actionLabel: 'Open Fee Reconciliation',
    },
    {
      id: 'notif-acc-902',
      title: 'State Scholarship Credit Voucher Sanction Disbursed',
      message: 'PRERANA Post-Matric & National Scholarship Portal (NSP) subsidy credit of ₹24.8 Lakhs confirmed by State Treasury.',
      category: 'SCHOLARSHIP',
      priority: 'IMPORTANT',
      senderName: 'State Treasury Portal',
      senderRole: 'Government Disbursement Wing',
      senderDept: 'Scholarships Section',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'scholarships',
      actionLabel: 'View Scholarship Ledger',
    },
    {
      id: 'notif-acc-903',
      title: 'Staff & Faculty Monthly Payroll Run Schedule',
      message: 'Monthly salary vouchers and tax deductions (TDS) calculated. Bank RTGS/NEFT batch scheduled for release on 31st.',
      category: 'PAYROLL',
      priority: 'NORMAL',
      senderName: 'Payroll Officer',
      senderRole: 'Finance Officer',
      senderDept: 'Accounts Department',
      timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'payroll',
      actionLabel: 'Inspect Payroll Batch',
    },
  ],

  hostel: [
    {
      id: 'notif-hos-1001',
      title: 'Night Roll Call Curfew Audit Passed (324/324 Present)',
      message: 'Biometric dormitory turnstile audit confirmed 100% headcount compliance across Boys Hostel 1-3 and Girls Hostel A-B at 21:30 hrs.',
      category: 'CURFEW',
      priority: 'URGENT',
      senderName: 'Chief Warden Office',
      senderRole: 'Chief Warden',
      senderDept: 'Hostel Administration',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'attendance',
      actionLabel: 'View Roll Call Log',
    },
    {
      id: 'notif-hos-1002',
      title: '8 Digital Gate Passes Awaiting Warden Endorsement',
      message: 'Student weekend home leave applications with verified parent SMS authorization ready for warden digital signature.',
      category: 'GATE_PASS',
      priority: 'IMPORTANT',
      senderName: 'Gate Pass Verification Desk',
      senderRole: 'Assistant Warden',
      senderDept: 'Residential Services',
      timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'gatepass',
      actionLabel: 'Review Gate Passes',
    },
    {
      id: 'notif-hos-1003',
      title: 'Mess Committee Food Quality Audit Certified Grade A',
      message: 'Weekly nutrition and hygiene inspection of central kitchen certified compliance with FSSAI institutional standards.',
      category: 'MESS',
      priority: 'NORMAL',
      senderName: 'Hostel Food Safety Officer',
      senderRole: 'Mess Committee',
      senderDept: 'Student Dining Services',
      timestamp: new Date(Date.now() - 29 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'mess',
      actionLabel: 'Inspect Mess Report',
    },
  ],

  library: [
    {
      id: 'notif-lib-1101',
      title: '24 Overdue Book Return Notices Dispatched',
      message: 'Automated SMS & email return notifications sent to borrowers holding high-demand computing and electronics textbooks beyond 14 days.',
      category: 'OVERDUE',
      priority: 'IMPORTANT',
      senderName: 'Circulation Automation Desk',
      senderRole: 'Library Management System',
      senderDept: 'Central Library',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'circulation',
      actionLabel: 'View Overdue Register',
    },
    {
      id: 'notif-lib-1102',
      title: 'IEEE Xplore & ACM Digital Library Subscription Renewed',
      message: 'Annual institutional campus-wide IP subscription renewed with unlimited downloads for faculty and student researchers.',
      category: 'E-RESOURCES',
      priority: 'NORMAL',
      senderName: 'Electronic Resources Unit',
      senderRole: 'Chief Librarian',
      senderDept: 'Digital Resource Center',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'subscriptions',
      actionLabel: 'Open E-Journals Portal',
    },
    {
      id: 'notif-lib-1103',
      title: '14 Graduating Student No-Dues Clearance Applications Approved',
      message: 'Final semester students cleared for official degree convocation no-dues certificate after book return verification.',
      category: 'NO_DUES',
      priority: 'NORMAL',
      senderName: 'Circulation Head',
      senderRole: 'Assistant Librarian',
      senderDept: 'Student Clearance Desk',
      timestamp: new Date(Date.now() - 31 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'clearance',
      actionLabel: 'Inspect No-Dues List',
    },
  ],

  placement: [
    {
      id: 'notif-pla-1201',
      title: 'Microsoft & Infosys Campus Recruitment Drive Scheduled',
      message: 'On-campus technical coding rounds and HR interviews confirmed for 22 Oct 2026. Lab 1 through 3 booked for online assessments.',
      category: 'DRIVES',
      priority: 'URGENT',
      senderName: 'Director (Corporate Relations)',
      senderRole: 'Head - Placements',
      senderDept: 'Training & Placement Directorate',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'drives',
      actionLabel: 'View Placement Drives',
    },
    {
      id: 'notif-pla-1202',
      title: 'TCS National Qualifier Test Shortlist: 84 Students Cleared',
      message: 'Shortlisted candidates qualified for Digital and Prime interview rounds. Technical mentoring sessions commencing tomorrow.',
      category: 'SHORTLISTS',
      priority: 'IMPORTANT',
      senderName: 'TPO Coding Cell',
      senderRole: 'Placement Coordinator',
      senderDept: 'T&P Directorate',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'shortlists',
      actionLabel: 'Inspect Shortlist',
    },
    {
      id: 'notif-pla-1203',
      title: 'Resume Verification Pending for 16 Registered Candidates',
      message: 'ATS standard formatting and project repository links need final verification before company resume drop deadline.',
      category: 'STUDENTS',
      priority: 'NORMAL',
      senderName: 'Placement Student Registry',
      senderRole: 'Assistant TPO',
      senderDept: 'Career Guidance Bureau',
      timestamp: new Date(Date.now() - 27 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'students',
      actionLabel: 'Open Candidate Register',
    },
  ],

  transport: [
    {
      id: 'notif-tra-1301',
      title: 'Route 4 (Cuttack Express) Normal Transit Confirmed',
      message: 'Bus OD-02-AK-1021 arrived at Main Campus Gate on schedule at 08:45 AM. Real-time GPS beacon verified operational.',
      category: 'ROUTES',
      priority: 'NORMAL',
      senderName: 'Central Fleet Dispatcher',
      senderRole: 'Transport Supervisor',
      senderDept: 'Transport Directorate',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'routes',
      actionLabel: 'Open Route Monitor',
    },
    {
      id: 'notif-tra-1302',
      title: 'Annual Vehicular Fitness & Emission Inspection Scheduled',
      message: 'Buses #12, #14 and #15 booked for statutory Regional Transport Office (RTO) inspection on Saturday.',
      category: 'FLEET',
      priority: 'IMPORTANT',
      senderName: 'Fleet Maintenance Superintendent',
      senderRole: 'Chief Transport Officer',
      senderDept: 'Logistics Division',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'fleet',
      actionLabel: 'Inspect Fleet Status',
    },
    {
      id: 'notif-tra-1303',
      title: '42 New RFID Student Bus Passes Ready for Distribution',
      message: 'Smart card NFC passes printed and encoded for Academic Year 2026-27. Ready for distribution at Transport Office Counter.',
      category: 'PASSES',
      priority: 'NORMAL',
      senderName: 'Bus Pass Desk',
      senderRole: 'Transport Officer',
      senderDept: 'Student Travel Services',
      timestamp: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'passes',
      actionLabel: 'Manage Bus Passes',
    },
  ],

  admissions: [
    {
      id: 'notif-adm-1401',
      title: 'OJEE 2026 Round-2 Central Counseling Reporting Active',
      message: 'Candidate verification desks active in Admission Center. 48 candidates successfully processed and enrolled today.',
      category: 'COUNSELING',
      priority: 'URGENT',
      senderName: 'Admissions Convener',
      senderRole: 'Dean Admissions',
      senderDept: 'Admission & Intake Bureau',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'counseling',
      actionLabel: 'Open Counseling Ledger',
    },
    {
      id: 'notif-adm-1402',
      title: 'Provisional Document Verification Completed via DigiLocker',
      message: '10th, 12th marks certificates and state domicile certificates authenticated against National Academic Depository (NAD).',
      category: 'VERIFICATION',
      priority: 'NORMAL',
      senderName: 'Document Verification Officer',
      senderRole: 'Senior Admissions Officer',
      senderDept: 'Enrollment Division',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'verification',
      actionLabel: 'View Verified Candidates',
    },
  ],

  staff: [
    {
      id: 'notif-stf-1501',
      title: 'Biometric Duty Shift Punch Verified',
      message: 'Morning shift biometric punch authenticated at 08:58 AM. Daily duty schedule allocated to Academic Block B Administration Desk.',
      category: 'ATTENDANCE',
      priority: 'NORMAL',
      senderName: 'Biometric Timekeeper System',
      senderRole: 'HR Automation',
      senderDept: 'Personnel Office',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'attendance',
      actionLabel: 'View Punch Records',
    },
    {
      id: 'notif-stf-1502',
      title: 'Office Stationery & Material Requisition Sanctioned',
      message: 'Requisition #REQ-2026-442 approved by Central Store. Collect allocated materials from Basement Store Counter.',
      category: 'CIRCULAR',
      priority: 'NORMAL',
      senderName: 'Central Storekeeper',
      senderRole: 'Procurement Cell',
      senderDept: 'General Administration',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'circulars',
      actionLabel: 'Inspect Requisition',
    },
  ],

  campus_operations: [
    {
      id: 'notif-ops-1601',
      title: 'Main Substation Automated Load-Testing Passed',
      message: 'Diesel generator backup auto-switchover test passed under 4.2 seconds. Uninterrupted power supply to data center and examination halls verified.',
      category: 'ELECTRICAL',
      priority: 'IMPORTANT',
      senderName: 'Chief Electrical Engineer',
      senderRole: 'Estate Maintenance Wing',
      senderDept: 'Campus Operations',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'electrical',
      actionLabel: 'Inspect Substation Log',
    },
    {
      id: 'notif-ops-1602',
      title: 'Surveillance CCTV Loop Audit: 128 / 128 Feeds Active',
      message: 'Campus perimeter high-definition night vision cameras and server room feeds checked with zero recording dropped frames.',
      category: 'SECURITY',
      priority: 'NORMAL',
      senderName: 'Campus Security Chief',
      senderRole: 'Surveillance Division',
      senderDept: 'Security & Safety Office',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      unread: true,
      actionTab: 'security',
      actionLabel: 'View Surveillance Grid',
    },
  ],

  canteen: [
    {
      id: 'notif-can-1701',
      title: 'Daily Meal Voucher & Token Reconciliation: 860 Served',
      message: 'Digital POS smart card tap billing completed for lunch shift. Payment gateway credit reflected in daily settlement report.',
      category: 'ORDERS',
      priority: 'NORMAL',
      senderName: 'Canteen POS Gateway',
      senderRole: 'Automated Billing Node',
      senderDept: 'Dining Services',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      unread: true,
      actionTab: 'orders',
      actionLabel: 'View Meal Orders',
    },
    {
      id: 'notif-can-1702',
      title: 'Fresh Farm Produce & Cold-Chain Delivery Verified',
      message: 'Quality inspector certified milk, dairy and fresh vegetable stock delivery with temperature compliance at 4°C.',
      category: 'SUPPLIES',
      priority: 'NORMAL',
      senderName: 'Food Safety Inspector',
      senderRole: 'Hygiene & Quality Cell',
      senderDept: 'Hospitality Management',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      unread: false,
      actionTab: 'inventory',
      actionLabel: 'Open Inventory Ledger',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE CLASS IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────
class InstitutionalNotificationStore {
  constructor() {
    this.storagePrefix = NOTIFICATIONS_STORE_KEY_PREFIX;
    this.listeners = new Set();
    this.sseSource = null;
    this.isSyncing = false;
    this.lastAccountKey = null;
    this._setupCrossTabListener();
  }

  _setupCrossTabListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.storagePrefix)) {
        this._notify();
      }
    });
    window.addEventListener('apna_campus_notifications_updated', () => {
      this._notify();
    });
  }

  /**
   * Connect to real-time Server-Sent Events (SSE) notification stream
   */
  connectRealtimeStream() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    const token = localStorage.getItem('collegeflow_token');
    if (!token) return;

    if (this.sseSource) {
      try {
        this.sseSource.close();
      } catch {}
      this.sseSource = null;
    }

    try {
      const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
      const sse = new EventSource(url);

      sse.addEventListener('notification.new', (event) => {
        try {
          const payload = JSON.parse(event.data);
          this._onRealtimeNotificationReceived(payload);
        } catch (e) {
          console.warn('Failed to parse incoming real-time notification event:', e);
        }
      });

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.title) {
            this._onRealtimeNotificationReceived(payload);
          }
        } catch {}
      };

      sse.onerror = () => {
        // EventSource automatically attempts reconnection per SSE protocol
      };

      this.sseSource = sse;
    } catch (e) {
      console.warn('Real-time SSE stream connection error:', e);
    }
  }

  _onRealtimeNotificationReceived(item) {
    if (!item || !item.title) return;
    const role = normalizeRole(item.recipientRole || localStorage.getItem('collegeflow_role') || 'student');
    const notifItem = {
      id: item.notificationId || item.id || `notif-${Date.now()}`,
      recipientId: item.id,
      title: item.title,
      message: item.message,
      category: item.category || 'ACADEMIC',
      priority: item.priority || 'NORMAL',
      senderName: item.senderName || 'Authorized Official',
      senderRole: item.senderRole || 'Institutional Authority',
      senderDept: item.senderDept || 'Campus Administration',
      timestamp: item.timestamp || new Date().toISOString(),
      unread: true,
      actionTab: item.actionTab || 'dashboard',
      actionLabel: item.actionLabel || 'View Details',
      actionUrl: item.actionUrl || null,
      attachmentName: item.attachmentName || null,
      attachmentUrl: item.attachmentUrl || null,
      sourceModule: item.sourceModule || null,
      eventType: item.eventType || null,
    };

    const current = this._loadRawNotifications(role);
    // Deduplicate by ID
    if (!current.some((n) => n.id === notifItem.id)) {
      this._saveRawNotifications(role, [notifItem, ...current]);
      try {
        playReceivedSound();
      } catch {}
      this._notify();
    }
  }

  /**
   * Sync notifications from authoritative NestJS backend
   */
  async syncBackendNotifications(account) {
    if (this.isSyncing || typeof window === 'undefined') return;
    const token = localStorage.getItem('collegeflow_token');
    if (!token) return;

    this.isSyncing = true;
    try {
      const res = await api.getMyNotifications({ limit: 50 });
      if (res && res.success && Array.isArray(res.data)) {
        const role = normalizeRole(account?.role);
        const mapped = res.data.map((r) => ({
          id: r.id,
          recipientId: r.recipientId,
          title: r.title,
          message: r.message,
          category: r.category || 'ACADEMIC',
          priority: r.priority || 'NORMAL',
          senderName: r.senderName || 'CoE / Institutional Office',
          senderRole: r.senderRole || 'ADMIN',
          senderDept: r.senderDept || 'Apna Campus',
          timestamp: r.timestamp || r.createdAt || new Date().toISOString(),
          unread: !r.isRead,
          actionTab: r.actionTab || 'dashboard',
          actionLabel: r.actionLabel || 'View Details',
          actionUrl: r.actionUrl || null,
          attachmentName: r.attachmentName || null,
          attachmentUrl: r.attachmentUrl || null,
          sourceModule: r.sourceModule || null,
          eventType: r.eventType || null,
        }));

        if (mapped.length > 0) {
          this._saveRawNotifications(role, mapped);
          this._notify();
        }
      }
    } catch {
      // Offline fallback: rely on persisted storage
    } finally {
      this.isSyncing = false;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn('Notification listener error:', err);
      }
    });
  }

  _getStorageKey(role) {
    const r = normalizeRole(role);
    return `${this.storagePrefix}${r}`;
  }

  _loadRawNotifications(role) {
    if (typeof localStorage === 'undefined') return [];
    const key = this._getStorageKey(role);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse notifications for role:', role, e);
    }

    // Initialize with role default seed
    const norm = normalizeRole(role);
    const defaults = ROLE_DEFAULT_NOTIFICATIONS[norm] || ROLE_DEFAULT_NOTIFICATIONS.student;
    this._saveRawNotifications(role, defaults);
    return defaults;
  }

  _saveRawNotifications(role, list) {
    if (typeof localStorage === 'undefined') return;
    const key = this._getStorageKey(role);
    try {
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('apna_campus_notifications_updated', { detail: { role } }));
    } catch (e) {
      console.warn('Failed to save notifications for role:', role, e);
    }
  }

  // Load faculty broadcast notifications for students from faculty notifications storage
  _loadDynamicFacultyBroadcasts(studentRoll = '01') {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(FACULTY_NOTIFS_STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];

      return list
        .filter((n) => n.status !== 'CANCELLED')
        .map((n) => {
          const rec = (n.recipients || []).find((r) => r.studentRollNumber === studentRoll);
          const isRead = rec ? rec.isRead : false;
          return {
            id: n.id,
            title: n.title,
            message: n.message,
            category: n.category || 'ACADEMIC',
            priority: n.priority || 'NORMAL',
            senderName: n.facultyName || 'Dr. S. Mohanty',
            senderRole: n.facultyDesignation || 'Course Coordinator',
            senderDept: n.department || 'Computer Science & Engineering',
            timestamp: n.publishedAt || new Date().toISOString(),
            unread: !isRead,
            actionTab: 'examination',
            actionLabel: 'View Details',
            attachmentName: n.attachmentName || null,
            attachmentUrl: n.attachmentUrl || null,
            isDynamicFacultyNotice: true,
          };
        });
    } catch (e) {
      console.warn('Failed to load dynamic faculty notices:', e);
      return [];
    }
  }

  /**
   * Get all notifications for the given account/role
   */
  getNotifications(account) {
    const role = normalizeRole(account?.role);
    const roll = account?.rollNumber || account?.registrationNumber || '01';
    const baseNotifs = this._loadRawNotifications(role);

    // Trigger background sync and SSE connection on account change
    const accountKey = `${role}-${roll}`;
    if (this.lastAccountKey !== accountKey) {
      this.lastAccountKey = accountKey;
      this.syncBackendNotifications(account);
      this.connectRealtimeStream();
    }

    let allNotifs = [...baseNotifs];

    // If student, blend in dynamic faculty broadcast notices
    if (role === 'student') {
      const facultyNotifs = this._loadDynamicFacultyBroadcasts(roll);
      const existingIds = new Set(allNotifs.map((n) => n.id));
      facultyNotifs.forEach((fn) => {
        if (!existingIds.has(fn.id)) {
          allNotifs.unshift(fn);
        }
      });
    }

    // Sort: Unread first, then priority (URGENT > IMPORTANT > NORMAL), then newest
    const priorityWeight = { URGENT: 3, IMPORTANT: 2, HIGH: 2, NORMAL: 1, INFO: 0 };

    allNotifs.sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      const pwA = priorityWeight[a.priority] || 1;
      const pwB = priorityWeight[b.priority] || 1;
      if (pwA !== pwB) return pwB - pwA;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return allNotifs;
  }

  /**
   * Get total unread notifications count for role
   */
  getUnreadCount(account) {
    const list = this.getNotifications(account);
    return list.filter((n) => n.unread).length;
  }

  /**
   * Mark a single notification as read/unread
   */
  markAsRead(id, account, isRead = true) {
    const role = normalizeRole(account?.role);
    const roll = account?.rollNumber || account?.registrationNumber || '01';

    // 1. Sync to backend API asynchronously
    api.markNotificationRead(id).catch(() => null);

    // 2. Update in role store
    const list = this._loadRawNotifications(role);
    const updated = list.map((n) => (n.id === id ? { ...n, unread: !isRead } : n));
    this._saveRawNotifications(role, updated);

    // 3. If it's a student faculty notice, also update in faculty notifications store
    if (role === 'student') {
      try {
        const raw = localStorage.getItem(FACULTY_NOTIFS_STORAGE_KEY);
        if (raw) {
          const facList = JSON.parse(raw);
          const newFacList = facList.map((fn) => {
            if (fn.id === id) {
              const recs = (fn.recipients || []).map((r) => {
                if (r.studentRollNumber === roll) {
                  return { ...r, isRead, readAt: isRead ? new Date().toISOString() : null };
                }
                return r;
              });
              return { ...fn, recipients: recs };
            }
            return fn;
          });
          localStorage.setItem(FACULTY_NOTIFS_STORAGE_KEY, JSON.stringify(newFacList));
        }
      } catch (e) {
        console.warn('Failed to update faculty notification read status:', e);
      }
    }

    this._notify();
  }

  /**
   * Mark all notifications as read for current role
   */
  markAllAsRead(account) {
    const role = normalizeRole(account?.role);
    const roll = account?.rollNumber || account?.registrationNumber || '01';

    // 1. Call backend API
    api.markAllNotificationsRead().catch(() => null);

    // 2. Local state
    const list = this._loadRawNotifications(role);
    const updated = list.map((n) => ({ ...n, unread: false }));
    this._saveRawNotifications(role, updated);

    if (role === 'student') {
      try {
        const raw = localStorage.getItem(FACULTY_NOTIFS_STORAGE_KEY);
        if (raw) {
          const facList = JSON.parse(raw);
          const newFacList = facList.map((fn) => {
            const recs = (fn.recipients || []).map((r) => {
              if (r.studentRollNumber === roll) {
                return { ...r, isRead: true, readAt: new Date().toISOString() };
              }
              return r;
            });
            return { ...fn, recipients: recs };
          });
          localStorage.setItem(FACULTY_NOTIFS_STORAGE_KEY, JSON.stringify(newFacList));
        }
      } catch (e) {
        console.warn('Failed to mark all student notices as read:', e);
      }
    }

    this._notify();
  }

  /**
   * Delete a notification
   */
  deleteNotification(id, account) {
    const role = normalizeRole(account?.role);
    const list = this._loadRawNotifications(role);
    const updated = list.filter((n) => n.id !== id);
    this._saveRawNotifications(role, updated);
    this._notify();
  }

  /**
   * Clear all read notifications
   */
  clearAllRead(account) {
    const role = normalizeRole(account?.role);

    // Call backend API to archive/dismiss read items
    api.clearReadNotifications().catch(() => null);

    const list = this._loadRawNotifications(role);
    const updated = list.filter((n) => n.unread);
    this._saveRawNotifications(role, updated);
    this._notify();
  }


  /**
   * Send a new notification to a specific role or multiple roles
   */
  sendNotification(notification, targetRoles = ['student']) {
    const roles = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
    const newId = notification.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const notifItem = {
      id: newId,
      title: notification.title || 'Institutional Announcement',
      message: notification.message || '',
      category: notification.category || 'GENERAL',
      priority: notification.priority || 'NORMAL',
      senderName: notification.senderName || 'Authorized Official',
      senderRole: notification.senderRole || 'Institutional Authority',
      senderDept: notification.senderDept || 'Campus Administration',
      timestamp: new Date().toISOString(),
      unread: true,
      actionTab: notification.actionTab || 'dashboard',
      actionLabel: notification.actionLabel || 'View Details',
      attachmentName: notification.attachmentName || null,
      attachmentUrl: notification.attachmentUrl || null,
    };

    roles.forEach((r) => {
      const norm = normalizeRole(r);
      const current = this._loadRawNotifications(norm);
      this._saveRawNotifications(norm, [notifItem, ...current]);
    });

    // Play subtle audio alert
    try {
      playReceivedSound();
    } catch {}

    this._notify();
    return notifItem;
  }

  /**
   * Send a live test notification for the active account to verify sound & UI
   */
  sendTestAlert(account) {
    const role = normalizeRole(account?.role);
    const roleDisplay = role.replace(/_/g, ' ').toUpperCase();
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const testItem = {
      id: `test-notif-${Date.now()}`,
      title: `⚡ Live Institutional Test Alert (${timeNow})`,
      message: `Verified notification delivery to active role [${roleDisplay}]. Real-time bell badge, sound synthesis, and role dispatch are operational.`,
      category: 'SYSTEM',
      priority: 'URGENT',
      senderName: 'Campus Notification Gateway',
      senderRole: 'Enterprise Communications',
      senderDept: 'Office of Information Technology',
      timestamp: new Date().toISOString(),
      unread: true,
      actionTab: 'dashboard',
      actionLabel: 'Acknowledge Test',
      attachmentName: 'Institutional_Gateway_Diagnostic.pdf',
    };

    const current = this._loadRawNotifications(role);
    this._saveRawNotifications(role, [testItem, ...current]);

    try {
      playReceivedSound();
    } catch {}

    this._notify();
    return testItem;
  }

  /**
   * Reset role notifications back to pristine seed
   */
  resetToDefaults(account) {
    const role = normalizeRole(account?.role);
    const defaults = ROLE_DEFAULT_NOTIFICATIONS[role] || ROLE_DEFAULT_NOTIFICATIONS.student;
    this._saveRawNotifications(role, defaults);
    this._notify();
  }
}

export const notificationsStore = new InstitutionalNotificationStore();
