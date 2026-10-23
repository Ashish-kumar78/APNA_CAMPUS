import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserRound,
  GraduationCap,
  Building2,
  Building,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Briefcase,
  Bus,
  Bed,
  Home,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Server,
  Check,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  Sparkles,
  Megaphone,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  PartyPopper,
  Monitor,
  ClipboardList,
  Ticket,
  FileCheck2,
  FileText,
  Award,
  TrendingUp,
  MapPin,
  RotateCcw,
  Receipt,
  Search,
  Filter,
  DollarSign,
  Printer,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  KeyRound,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import '../DashboardHome.css';
import './RoleDashboardLanding.css';
import { api } from '../services/api';

// DetailRow matching StudentPortal
function DetailRow({ label, value }) {
  return (
    <div className="student-detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '7.5px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '12.5px' }}>
      <dt style={{ color: '#64748b', fontWeight: 600 }}>{label}</dt>
      <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0, textAlign: 'right' }}>{value}</dd>
    </div>
  );
}

// Official Institutional Gazetted Holidays 2026
const OFFICIAL_HOLIDAYS_2026 = [
  ['14-01-2026', 'Makar Sankranti / Pongal'],
  ['23-01-2026', 'Netaji Jayanti / Veer Surendra Sai Jayanti'],
  ['26-01-2026', 'Republic Day'],
  ['15-02-2026', 'Maha Shivratri'],
  ['04-03-2026', 'Dola Purnima / Holi Eve'],
  ['05-03-2026', 'Holi Festival'],
  ['20-03-2026', 'Id-ul-Fitr (Ramzan Id)'],
  ['27-03-2026', 'Sri Ram Navami'],
  ['01-04-2026', 'Utkal Divas (Odisha Day)'],
  ['03-04-2026', 'Good Friday'],
  ['14-04-2026', 'Dr. B.R. Ambedkar Jayanti / Maha Vishuba Sankranti'],
  ['01-05-2026', 'May Day (International Workers\' Day)'],
  ['27-05-2026', 'Bakrid / Eid-ul-Adha'],
  ['16-07-2026', 'Rath Yatra (Car Festival)'],
  ['24-07-2026', 'Bahuda Yatra'],
  ['26-07-2026', 'Muharram'],
  ['15-08-2026', 'Independence Day'],
  ['04-09-2026', 'Sri Krishna Janmashtami'],
  ['14-09-2026', 'Ganesh Chaturthi / Vinayaka Puja'],
  ['16-09-2026', 'Nuakhai (Western Odisha Festival)'],
  ['02-10-2026', 'Mahatma Gandhi Jayanti'],
  ['10-10-2026', 'Mahalaya'],
  ['14-10-2026', 'Durga Puja (Maha Saptami)'],
  ['15-10-2026', 'Durga Puja (Maha Ashtami)'],
  ['16-10-2026', 'Durga Puja (Maha Navami)'],
  ['17-10-2026', 'Vijaya Dashami (Dussehra)'],
  ['20-10-2026', 'Diwali / Kali Puja'],
  ['24-11-2026', 'Guru Nanak Jayanti / Rahas Purnima'],
  ['25-12-2026', 'Christmas Day'],
];

function createCalendarDays(month, today) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return {
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === month.getMonth(),
      isToday: date.toDateString() === today.toDateString(),
      isSunday: date.getDay() === 0,
    };
  });
}

// ── ROLE DEFINITIONS FOR ALL 14 NON-STUDENT ROLES ──
export const ROLE_CONFIGS = {
  // 1. SUPER ADMIN
  super_admin: {
    roleKey: 'super_admin',
    roleTitle: 'Super Admin',
    dashboardTitle: 'Super Admin dashboard',
    kicker: 'ENTERPRISE SECURITY & GOVERNANCE · FULL SYSTEM CLEARANCE',
    caption: 'Monitor institutional infrastructure, RBAC policies, security audit trails, and global system health.',
    motd: 'Account and system information is loaded from the authenticated backend.',
    officer: {
      name: 'Signed-in account',
      id: '—',
      designation: 'Super Admin',
      department: 'Not set',
      email: 'Not provided',
    },
    stats: {
      c1: { icon: Users, label: 'Registered Accounts', badge: 'Backend data', val: '—', desc: 'Waiting for account metrics', pills: [] },
      c2: { icon: Server, label: 'Backend & Database', badge: 'Checking', val: '—', ratio: '', foot: 'Health is checked from the backend' },
      c3: { icon: ShieldCheck, label: 'Roles With Active Accounts', badge: 'Backend data', val: '—', desc: 'No role counts loaded', foot: 'Counts come from persisted user records' },
      c4: { icon: AlertTriangle, label: 'Disabled Accounts', badge: 'Backend data', val: '—', desc: 'Waiting for account metrics', foot: 'Count comes from persisted user records' },
    },
    quickActions: [
      { id: 'users', label: 'View Users', icon: Users },
      { id: 'approvals', label: 'Review Approvals', icon: ShieldCheck },
      { id: 'activity', label: 'View System Activity', icon: Server },
    ],
    overviewTitle: 'Backend & Runtime Diagnostics',
    overviewItems: [],
    overviewColumns: ['Subsystem', 'Status', 'Observed detail', 'Latency / uptime'],
    announcements: [],
  },

  // 2. MANAGEMENT
  management: {
    roleKey: 'management',
    roleTitle: 'Management',
    dashboardTitle: 'Management dashboard',
    kicker: 'MANAGEMENT WORKSPACE',
    caption: 'Review institutional performance, fiscal realization, admissions growth, and placement milestones.',
    motd: 'Q2 Board of Trustees review scheduled for Oct 28. NAAC peer team accreditation dossier synchronized.',
    officer: {
      name: 'Prof. (Dr.) S. P. Panda',
      id: 'GOV-CHAIR-01',
      employeeCode: 'EMP-TRUST-001',
      designation: 'Chairman & Governing Body Trustee',
      department: 'Management',
      specialization: 'Institutional Governance & Fiscal Strategy',
      office: 'Boardroom Annex · Executive Tower',
      qualification: 'M.Tech, Ph.D, FIE',
      experience: '28+ Years Institutional Leadership',
      email: 'chairman@apnacampus.edu.in',
      phone: '+91 94370 00010',
      employmentType: 'Permanent Directorate',
      dateOfJoining: '01 Jun 2008',
      employmentStatus: 'Active · Confirmed Trustee',
      reportingAuthority: 'Governing Council & Trust Board',
      photo: '/passport_photo_male.svg',
      scope: 'Institutional Trustee & Chairman',
      academicYear: '2026–2027',
      assignedResponsibilities: 'Institutional Policy, Fiscal Clearance, Academic Expansion',
      biometricId: 'BIO-EXEC-001',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 8840 · PAN: •••••321K)',
    },
    stats: {
      c1: { icon: GraduationCap, label: 'Total Student Enrollment', badge: '+4.2% YoY', val: '2,480', desc: '8 Academic Departments · 18 Programs', pills: ['2,120 UG B.Tech', '360 PG / MBA', 'Registered'] },
      c2: { icon: Users, label: 'Faculty & Staff Strength', badge: '1:17 Ratio', val: '218', ratio: '146 Faculty · 72 Staff', pct: '94%', foot: '100% AICTE teacher-student cadre compliant' },
      c3: { icon: CreditCard, label: 'Fee Realization (FY 26-27)', badge: '92.5% Target', val: '₹24.60 Cr', desc: '₹1.98 Cr Outstanding across 8 branches', foot: '+₹1.4 Cr collected in past 30 days' },
      c4: { icon: Briefcase, label: 'Campus Placement Index', badge: 'Active Season', val: '89.4%', desc: '442 of 580 Selected · Avg CTC ₹6.8 LPA', foot: 'Highest offer: ₹28.5 LPA (Cisco Systems)' },
    },
    quickActions: [
      { id: 'reports', label: 'View Institutional Reports', icon: FileSpreadsheet },
      { id: 'kpi', label: 'Review Strategic KPI', icon: TrendingUp },
      { id: 'circulars', label: 'Governance Circulars', icon: Megaphone },
    ],
    overviewTitle: 'Department-Wise Academic & Financial Performance',
    overviewItems: [
      { col1: 'Computer Science & Engineering (CSE)', col2: 'Dr. P. K. Pattnaik', col3: '540 Students · 32 Faculty', col4: '₹5.09 Cr (96.2%)', badge: 'status-green' },
      { col1: 'AI & Machine Learning (AIML)', col2: 'Dr. S. K. Swain', col3: '360 Students · 22 Faculty', col4: '₹3.32 Cr (94.4%)', badge: 'status-green' },
      { col1: 'Electronics & Communication (ECE)', col2: 'Dr. M. R. Senapati', col3: '380 Students · 24 Faculty', col4: '₹3.47 Cr (93.5%)', badge: 'status-blue' },
      { col1: 'Electrical & Electronics (EEE)', col2: 'Dr. S. K. Das', col3: '290 Students · 18 Faculty', col4: '₹2.58 Cr (91.0%)', badge: 'status-blue' },
      { col1: 'Mechanical Engineering (MECH)', col2: 'Dr. B. K. Rout', col3: '320 Students · 22 Faculty', col4: '₹2.79 Cr (89.4%)', badge: 'status-amber' },
    ],
    overviewColumns: ['Department', 'HOD', 'Student & Faculty Strength', 'Fee Collection (Recovery %)'],
    announcements: [
      { day: '05', month: 'OCT', tag: 'REGULATORY', tagTone: 'tag-violet', title: 'NAAC Accreditation Cycle IV Preparatory Review', desc: 'Criterion-wise documentation verified by internal academic audit committee.' },
      { day: '01', month: 'OCT', tag: 'ACADEMIC', tagTone: 'tag-blue', title: 'Academic Calendar 2026-27 (Odd Semester) Approved', desc: 'Autonomous examination timeline and semester vacations ratified by Governing Council.' },
      { day: '28', month: 'SEP', tag: 'PLACEMENT', tagTone: 'tag-green', title: 'Campus Placement Season Officially Commenced', desc: '18 Corporate recruiters confirmed for on-campus drives with average CTC ₹6.8 LPA.' },
    ],
  },

  // 3. PRINCIPAL
  principal: {
    roleKey: 'principal',
    roleTitle: 'Principal',
    dashboardTitle: 'Principal dashboard',
    kicker: 'ACADEMIC LEADERSHIP · OFFICE OF THE PRINCIPAL',
    caption: 'Direct college academic operations, faculty workloads, institutional clearances, and student achievements.',
    motd: 'Autumn End-Semester Autonomous examination timetable released. Faculty biometric sync at 96.2%.',
    officer: {
      name: 'Dr. B. K. Sarap',
      id: 'OFF-PRIN-01',
      employeeCode: 'EMP-PRIN-002',
      designation: 'Principal & Autonomous Campus Director',
      department: 'Office of the Principal',
      specialization: 'Fluid Dynamics & Educational Administration',
      office: 'Principal Secretariat · Main Campus Block',
      qualification: 'Ph.D (IIT Kharagpur), Post-Doc',
      experience: '24+ Years Academic Leadership',
      email: 'principal@apnacampus.edu.in',
      phone: '+91 94370 00020',
      employmentType: 'Full-Time Regular (Tenured)',
      dateOfJoining: '04 Jul 2015',
      employmentStatus: 'Active · Executive Head',
      reportingAuthority: 'Management & Governing Council',
      photo: '/passport_photo_male.svg',
      scope: 'Executive Campus Director',
      academicYear: '2026–2027',
      assignedResponsibilities: 'Institutional Clearance, Academic Quality, NAAC/NBA Compliance',
      biometricId: 'BIO-PRIN-001',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 7712 · PAN: •••••654P)',
    },
    stats: {
      c1: { icon: Users, label: 'Total Student Body', badge: 'Autonomous Campus', val: '2,480', desc: '18 Programs across Engineering & Tech', pills: ['4 Batches', '540 in CSE', '360 in AIML'] },
      c2: { icon: UserCheck, label: 'Faculty Attendance Today', badge: 'Present 96.2%', val: '96.2%', ratio: '141 / 146 Faculty Present', pct: '96.2%', foot: '5 on sanctioned Duty Leave / FDP' },
      c3: { icon: GraduationCap, label: 'Academic Performance & CGPA', badge: 'Odd Sem 2026', val: '8.14', desc: 'Institutional Pass Rate: 94.2%', foot: '18 Gold Medalist contenders shortlisted' },
      c4: { icon: Clock, label: 'Pending Executive Approvals', badge: '5 Awaiting', val: '05 Items', desc: '3 Faculty leave dockets · 2 Event clearances', foot: '14 Approvals cleared this week' },
    },
    quickActions: [
      { id: 'academic', label: 'View Academic Overview', icon: GraduationCap },
      { id: 'approvals', label: 'Review Approvals', icon: CheckCircle2 },
      { id: 'reports', label: 'View Reports', icon: FileSpreadsheet },
    ],
    overviewTitle: 'Departmental Academic Health & Results Overview',
    overviewItems: [
      { col1: 'Computer Science & Engineering', col2: 'Dr. P. K. Pattnaik', col3: '96.8%', col4: 'CGPA 8.42 · Pass 97.1%', badge: 'status-green' },
      { col1: 'AI & Machine Learning', col2: 'Dr. S. K. Swain', col3: '95.4%', col4: 'CGPA 8.28 · Pass 96.0%', badge: 'status-green' },
      { col1: 'Electronics & Communication', col2: 'Dr. M. R. Senapati', col3: '94.2%', col4: 'CGPA 8.10 · Pass 94.8%', badge: 'status-blue' },
      { col1: 'Electrical & Electronics', col2: 'Dr. S. K. Das', col3: '92.6%', col4: 'CGPA 7.85 · Pass 92.4%', badge: 'status-blue' },
      { col1: 'Mechanical Engineering', col2: 'Dr. B. K. Rout', col3: '91.8%', col4: 'CGPA 7.68 · Pass 90.6%', badge: 'status-amber' },
    ],
    overviewColumns: ['Department', 'HOD', 'Faculty Attendance', 'Academic Metrics (CGPA & Pass %)'],
    announcements: [
      { day: '02', month: 'OCT', tag: 'EXAMINATION', tagTone: 'tag-violet', title: 'Autonomous End-Semester Examination Schedule 2026', desc: 'Official examination notification published. Hall tickets to be issued by Exam Cell.' },
      { day: '01', month: 'OCT', tag: 'CIRCULAR', tagTone: 'tag-blue', title: 'Faculty Duty Leave & Research Incentive Regulations', desc: 'Principal directive encouraging faculty international conference submissions.' },
      { day: '28', month: 'SEP', tag: 'ACCREDITATION', tagTone: 'tag-green', title: 'BPUT Autonomous Inspection Commission Visit', desc: 'Academic and laboratory compliance review concluded with distinction.' },
    ],
  },

  // 4. ADMIN OPS
  admin: {
    roleKey: 'admin',
    roleTitle: 'Admin Ops',
    dashboardTitle: 'Admin Ops dashboard',
    kicker: 'CAMPUS OPERATIONS · ADMINISTRATION & STUDENT SERVICES',
    caption: 'Manage student administrative requests, document verifications, service tickets, and institutional facilities.',
    motd: 'Verification window for 2026 scholarship dockets is active. 2,256 student profiles verified.',
    officer: {
      name: 'Er. S. K. Nayak',
      id: 'ADM-OPS-001',
      employeeCode: 'EMP-ADM-2016-018',
      designation: 'Campus Administrative Officer (CAO)',
      department: 'General Administration & Student Services',
      specialization: 'Institutional Operations & Student Clearance',
      office: 'Admin Wing Room 101 · Ground Floor',
      qualification: 'B.Tech, MBA (HR & Operations)',
      experience: '14+ Years Academic Administration',
      assignedResponsibilities: 'Document Verification, Bonafide/NOC Clearance, Campus Services',
      academicYear: '2026–2027',
      email: 'admin@apnacampus.edu.in',
      phone: '+91 94370 00030',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '10 Aug 2016',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. B. K. Sarap (Principal)',
      photo: '/passport_photo_male.svg',
      scope: 'General Campus Operations',
      biometricId: 'BIO-ADM-018',
      maskedAadhaar: '•••• •••• 6634',
      maskedPan: '•••••712H',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 6634 · PAN: •••••712H)',
    },
    stats: {
      c1: { icon: ClipboardList, label: 'Pending Admin Requests', badge: 'Queue Active', val: '23', desc: 'Student Bonafide, NOC & Identity requests', pills: ['11 Bonafide', '8 NOCs', '4 Transcripts'] },
      c2: { icon: CheckCircle2, label: 'Document Verification Summary', badge: '91% Cleared', val: '91%', ratio: '2,256 / 2,480 Dossiers Verified', pct: '91%', foot: '224 dossiers pending upload or physical check' },
      c3: { icon: FileText, label: 'Certificate Request Summary', badge: 'Processing', val: '14 Ready', desc: 'Degree, Migration, and Character Certificates', foot: '8 Dispatched to students today' },
      c4: { icon: AlertTriangle, label: 'Campus Grievance Overview', badge: '4 Open Tasks', val: '04 Active', desc: '2 Civil/Water works · 2 Hostel electrical', foot: '19 Grievances resolved this month' },
    },
    quickActions: [
      { id: 'verify', label: 'Verify Documents', icon: CheckCircle2 },
      { id: 'certificates', label: 'Issue Certificates', icon: FileText },
      { id: 'requests', label: 'Process Requests', icon: ClipboardList },
    ],
    overviewTitle: 'Recent Administrative Service & Certificate Requests',
    overviewItems: [
      { col1: 'REQ-2026-441', col2: 'Rakesh Das (2305201001)', col3: 'PRERANA Scholarship Bonafide', col4: 'Approved & Signed', badge: 'status-green' },
      { col1: 'REQ-2026-442', col2: 'Priyanshu Mohapatra (2305201092)', col3: 'Passport Verification Certificate', col4: 'In Verification', badge: 'status-blue' },
      { col1: 'REQ-2026-443', col2: 'Ananya Mishra (2305201018)', col3: 'State Transport Bus Concession Pass', col4: 'Approved & Issued', badge: 'status-green' },
      { col1: 'REQ-2026-444', col2: 'Subham Senapati (2305201045)', col3: 'Duplicate College RFID Smart ID', col4: 'Card Printing', badge: 'status-amber' },
      { col1: 'REQ-2026-445', col2: 'Dr. S. Mohanty (FAC-042)', col3: 'Campus Faculty Housing Allotment', col4: 'Under CAO Review', badge: 'status-violet' },
    ],
    overviewColumns: ['Request ID', 'Applicant', 'Service Requested', 'Processing Status'],
    announcements: [
      { day: '18', month: 'OCT', tag: 'SCHOLARSHIP', tagTone: 'tag-green', title: 'Post-Matric State Scholarship Verification Phase II', desc: 'All eligible students must submit hard copies of income certificates to Admin Desk 4.' },
      { day: '14', month: 'OCT', tag: 'IDENTITY', tagTone: 'tag-blue', title: 'RFID Smart Campus Card Mandatory for Library & Gate', desc: 'Students who have not collected their encoded smart cards can report to Window 2.' },
      { day: '09', month: 'OCT', tag: 'ESTATE', tagTone: 'tag-amber', title: 'Scheduled Campus Water Filter Sanitization & Audit', desc: 'Central RO water dispensing units across Academic Blocks A, B, and C serviced.' },
    ],
  },

  // 5. ADMISSIONS
  admissions: {
    roleKey: 'admissions',
    roleTitle: 'Admissions',
    dashboardTitle: 'Admissions dashboard',
    kicker: 'STUDENT INTAKE · ADMISSIONS & COUNSELING CELL',
    caption: 'Track incoming student applications, verify JEE/OJEE rank cards, and finalize seat allocations.',
    motd: 'OJEE Special Round counseling reporting is active. 640 of 720 institutional seats enrolled.',
    officer: {
      name: 'Ms. Sasmita Mohapatra',
      id: 'ADM-OFF-01',
      employeeCode: 'EMP-ADM-2019-031',
      designation: 'Senior Admissions & Counseling Officer',
      department: 'Admissions & Student Intake Office',
      specialization: 'OJEE/JEE Counseling & Seat Allocation',
      office: 'Counselling Wing · Admission Center',
      qualification: 'MBA, PG Diploma in Educational Counseling',
      experience: '9+ Years Student Intake & Counseling',
      assignedResponsibilities: 'OJEE/JEE Counseling, Document Verification, Seat Allocation',
      academicYear: '2026–2027',
      email: 'admissions@apnacampus.edu.in',
      phone: '+91 94370 00040',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '02 May 2019',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. B. K. Sarap (Principal)',
      photo: '/passport_photo_female.svg',
      scope: 'Institutional Admissions Authority',
      biometricId: 'BIO-ADM-031',
      maskedAadhaar: '•••• •••• 4429',
      maskedPan: '•••••903R',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 4429 · PAN: •••••903R)',
    },
    stats: {
      c1: { icon: Users, label: 'Total Applications Received', badge: 'Session 2026-27', val: '1,420', desc: 'B.Tech (1,080) · MBA (180) · MCA (160)', pills: ['1,080 B.Tech', '180 MBA', '160 MCA'] },
      c2: { icon: UserCheck, label: 'Approved & Enrolled Admissions', badge: '88.9% Target', val: '640', ratio: '640 / 720 Seats Filled', pct: '88.9%', foot: '80 Vacant seats remaining across 3 disciplines' },
      c3: { icon: FileText, label: 'Documents Awaiting Verification', badge: '38 In Review', val: '38 Files', desc: 'Rank cards, 10th/12th marksheets, Caste certificates', foot: '12 Uploaded today in evening batch' },
      c4: { icon: Calendar, label: 'Upcoming Admission Deadlines', badge: '4 Days Left', val: '24 Oct', desc: 'OJEE Final Spot Round document verification closes', foot: 'Physical reporting ends at 05:00 PM' },
    },
    quickActions: [
      { id: 'review', label: 'Review Applications', icon: Users },
      { id: 'verify', label: 'Verify Documents', icon: CheckCircle2 },
      { id: 'notices', label: 'Create Admission Notice', icon: Megaphone },
      { id: 'deadlines', label: 'Manage Deadlines', icon: Calendar },
      { id: 'export', label: 'Export Report', icon: FileSpreadsheet },
      { id: 'cycle', label: 'Configure Cycle', icon: Layers },
    ],
    overviewTitle: 'Recent Admission Applications & Verification Status',
    overviewItems: [
      { col1: 'APP-2026-001', col2: 'Subhashree Behera', col3: 'B.Tech - Computer Science', col4: 'JEE Main 88.5% · In Review', badge: 'status-blue' },
      { col1: 'APP-2026-002', col2: 'Manish Kumar Pradhan', col3: 'B.Tech - Computer Science', col4: 'OJEE Rank 1,204 · Docs Verified', badge: 'status-green' },
      { col1: 'APP-2026-003', col2: 'Aditi Priyadarshini', col3: 'Bachelor of Computer App (BCA)', col4: 'Merit 84.0% · Offer Sent', badge: 'status-violet' },
      { col1: 'APP-2026-004', col2: 'Debabrata Sahoo', col3: 'B.Tech - Electronics & Comm', col4: 'Awaiting 12th Board Marksheet', badge: 'status-amber' },
      { col1: 'APP-2026-006', col2: 'Ashutosh Pradhan', col3: 'B.Tech - AI & Machine Learning', col4: 'Fee Confirmed · Ready to Enroll', badge: 'status-blue' },
      { col1: 'APP-2026-007', col2: 'Pooja Priyadarshini', col3: 'Bachelor of Computer App (BCA)', col4: 'Enrolled · STU-26-0004', badge: 'status-green' },
    ],
    overviewColumns: ['Application ID', 'Candidate Name', 'Program Applied', 'Admission Status'],
    announcements: [
      { day: '24', month: 'OCT', tag: 'DEADLINE', tagTone: 'tag-amber', title: 'OJEE Final Spot Round Verification Closes', desc: 'Candidates allotted in the institutional mop-up round must report with original documents.' },
      { day: '26', month: 'OCT', tag: 'COUNSELING', tagTone: 'tag-blue', title: 'Direct Institutional Quota Counseling Session', desc: 'Open house counseling for vacant lateral entry B.Tech seats at Seminar Hall 1.' },
      { day: '02', month: 'NOV', tag: 'ENROLLMENT', tagTone: 'tag-green', title: 'Orientation Program for 2026-27 Admitted Batch', desc: 'Academic induction, LMS credential distribution, and mentor allocation scheduled.' },
    ],
  },

  // 6. HOD
  hod: {
    roleKey: 'hod',
    roleTitle: 'HOD',
    dashboardTitle: 'HOD dashboard',
    kicker: 'DEPARTMENTAL WORKSPACE · COMPUTER SCIENCE & ENGINEERING',
    caption: 'Monitor departmental performance, faculty workload allocation, and student academic progress.',
    motd: 'Department faculty meeting on Autonomous End-Sem syllabus completion scheduled for tomorrow.',
    officer: {
      name: 'Dr. P. K. Pattnaik',
      id: 'HOD-CSE-01',
      employeeCode: 'EMP-HOD-2014-009',
      designation: 'Professor & Head of Department (HOD)',
      department: 'Computer Science & Engineering',
      specialization: 'Cloud Computing, Microservices & Sensor Networks',
      office: 'HOD Office Room 301 · Block C',
      qualification: 'Ph.D in Computer Science, M.Tech, SMIEEE',
      experience: '20+ Years Teaching & Research',
      researchInterests: 'Cloud Infrastructure, IoT Networks, Distributed Systems',
      assignedSubjects: 'CS701 (Cloud Computing & Microservices)',
      assignedSemester: 'Semester 7 (Final Year)',
      assignedSections: 'Section A & Section B',
      academicYear: '2026–2027',
      email: 'hod.cse@apnacampus.edu.in',
      phone: '+91 94370 00050',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '18 Jul 2014',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. B. K. Sarap (Principal)',
      photo: '/passport_photo_male.svg',
      scope: 'Department Executive Head',
      biometricId: 'BIO-HOD-009',
      maskedAadhaar: '•••• •••• 5519',
      maskedPan: '•••••441M',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 5519 · PAN: •••••441M)',
    },
    stats: {
      c1: { icon: GraduationCap, label: 'Department Student Strength', badge: '4 Batches', val: '540', desc: 'B.Tech CSE: Sem 1 (140), 3 (135), 5 (135), 7 (130)', pills: ['4 Batches', '8 Sections', 'Accredited'] },
      c2: { icon: Users, label: 'Department Faculty Strength', badge: '1:17 Ratio', val: '32', ratio: '18 Ph.D · 14 M.Tech', pct: '96%', foot: '100% Core subjects covered by experienced faculty' },
      c3: { icon: CheckCircle2, label: 'Department Attendance Average', badge: 'Eligible 91.2%', val: '91.2%', desc: '17% above examination threshold (75%)', foot: '512 / 540 Students eligible for End-Sem' },
      c4: { icon: ClipboardList, label: 'Pending Academic Approvals', badge: '6 Awaiting', val: '06 Dockets', desc: '4 Lesson plan submissions · 2 Lab requisitions', foot: '2 Mid-sem question papers moderation pending' },
    },
    quickActions: [
      { id: 'summary', label: 'View Department Summary', icon: GraduationCap },
      { id: 'tasks', label: 'Review Academic Tasks', icon: ClipboardList },
      { id: 'faculty', label: 'View Faculty Overview', icon: Users },
    ],
    overviewTitle: 'Subject-Wise Academic Performance & Faculty Workload',
    overviewItems: [
      { col1: 'CS501 - Data Structures & Algorithms', col2: 'Dr. S. Mohanty', col3: 'Section A & B (135)', col4: 'Att: 93.8% · Mid-Sem Pass: 96.2%', badge: 'status-green' },
      { col1: 'CS502 - Operating Systems & Kernel Design', col2: 'Prof. R. K. Behera', col3: 'Section A & B (135)', col4: 'Att: 91.4% · Mid-Sem Pass: 94.0%', badge: 'status-green' },
      { col1: 'CS503 - Database Management Systems', col2: 'Dr. M. K. Swain', col3: 'Section A & B (135)', col4: 'Att: 89.6% · Mid-Sem Pass: 92.5%', badge: 'status-blue' },
      { col1: 'CS701 - Cloud Computing & Microservices', col2: 'Dr. P. K. Pattnaik', col3: 'Final Year CSE (130)', col4: 'Att: 94.5% · Mid-Sem Pass: 98.0%', badge: 'status-green' },
      { col1: 'CS504 - Advanced Object Oriented Prog (Java)', col2: 'Prof. S. R. Jena', col3: 'Section A & B (135)', col4: 'Att: 88.2% · Mid-Sem Pass: 90.1%', badge: 'status-amber' },
    ],
    overviewColumns: ['Course Name & Code', 'Faculty In-Charge', 'Allocated Cohort', 'Attendance & Academic Pass'],
    announcements: [
      { day: '21', month: 'OCT', tag: 'INTERNAL', tagTone: 'tag-violet', title: 'Internal Assessment Marks Lock Deadline', desc: 'All faculty members must freeze internal continuous assessment marks in the portal.' },
      { day: '17', month: 'OCT', tag: 'LAB', tagTone: 'tag-blue', title: 'End-Semester Practical & Project Viva Schedule', desc: 'External examiner list approved by CoE. Laboratory rosters to be displayed on notice board.' },
      { day: '12', month: 'OCT', tag: 'RESEARCH', tagTone: 'tag-green', title: 'IEEE Student Branch Hackathon Registrations Open', desc: '3-day national hackathon on Edge AI scheduled at Central Computing Center.' },
    ],
  },

  // 7. FACULTY
  faculty: {
    roleKey: 'faculty',
    roleTitle: 'Faculty',
    dashboardTitle: 'Faculty dashboard',
    kicker: 'TEACHING & RESEARCH WORKSPACE · SCHOOL OF COMPUTING',
    caption: 'Review today\'s classes, student attendance, lab sessions, and evaluate pending assignments.',
    motd: 'Mid-semester internal marks submission window closes on Friday. 18 assignment papers pending.',
    officer: {
      name: 'Dr. Subhashree Mohanty',
      id: 'FAC-CSE-042',
      employeeCode: 'EMP-FAC-2018-042',
      designation: 'Associate Professor & Course In-Charge',
      department: 'Computer Science & Engineering',
      specialization: 'Data Structures & Distributed Algorithms',
      office: 'Faculty Cabin 208 · School of Computing',
      qualification: 'Ph.D in Computer Science (BPUT), M.Tech (CSE)',
      experience: '12+ Years Teaching & Research',
      researchInterests: 'Graph Algorithms, Distributed Systems, Edge AI',
      assignedSubjects: 'CS501 (Data Structures), CS702 (Adv. AI)',
      assignedSemester: 'Semester 5 & Semester 7',
      assignedSections: 'Section A & Section B',
      academicYear: '2026–2027',
      email: 's.mohanty@apnacampus.edu.in',
      phone: '+91 94370 00060',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '16 Jul 2018',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. P. K. Pattnaik (HOD - CSE)',
      photo: '/passport_photo_female.svg',
      scope: 'Teaching Faculty & Course In-Charge',
      biometricId: 'BIO-FAC-042',
      maskedAadhaar: '•••• •••• 9821',
      maskedPan: '•••••542F',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 9821 · PAN: •••••542F)',
    },
    stats: {
      c1: { icon: Calendar, label: 'Today\'s Classes & Labs', badge: '3 Lectures', val: '03', desc: 'CS501 (Sec A), CS502 Lab (G1), CS702', pills: ['2 Theory', '1 Practical Lab', 'Scheduled'] },
      c2: { icon: CheckCircle2, label: 'Student Attendance Rate', badge: 'Eligible', val: '93.8%', ratio: '60 / 64 Lectures Conducted', pct: '93.8%', foot: '18.8% above required university examination cutoff' },
      c3: { icon: Clock, label: 'Assigned Subjects & Sections', badge: '128 Students', val: '2 Subjects', desc: 'Data Structures (CS501) & Advanced AI (CS702)', foot: 'Room 204 & Advanced Computing Lab 3' },
      c4: { icon: FileText, label: 'Pending Assignment Evaluations', badge: '18 Pending', val: '18 Papers', desc: 'Assignment 3: Graph Traversal & Dynamic Programming', foot: 'Submission deadline was yesterday' },
    },
    quickActions: [
      { id: 'timetable', label: 'View Timetable', icon: Calendar },
      { id: 'attendance', label: 'Mark Attendance', icon: CheckCircle2 },
      { id: 'assignments', label: 'View Assignments', icon: FileText },
    ],
    overviewTitle: 'Today\'s Class Schedule & Teaching Timetable',
    overviewItems: [
      { col1: '10:30 AM – 11:30 AM', col2: 'Data Structures & Algorithms (CS501)', col3: 'Room 204 · Block B', col4: 'B.Tech CSE - Section A (68)', badge: 'status-green' },
      { col1: '01:30 PM – 03:30 PM', col2: 'Data Structures Practical Lab (CS502)', col3: 'Software Lab 3 · Computing Center', col4: 'B.Tech CSE - Group 1 (34)', badge: 'status-blue' },
      { col1: '03:45 PM – 04:45 PM', col2: 'Advanced AI & Machine Learning (CS702)', col3: 'Seminar Hall 2 · Tech Tower', col4: 'B.Tech Final Year (60)', badge: 'status-green' },
      { col1: 'Tomorrow 09:30 AM', col2: 'Algorithm Optimization Tutorial', col3: 'Tutorial Room 102 · Block B', col4: 'Remedial Batch (12)', badge: 'status-violet' },
    ],
    overviewColumns: ['Session Timing', 'Course Title & Code', 'Classroom / Lab Venue', 'Student Cohort & Batch'],
    announcements: [
      { day: '23', month: 'OCT', tag: 'EXAMINATION', tagTone: 'tag-violet', title: 'Internal Theory Examination Question Paper Submission', desc: 'Please submit 2 sets of moderated question papers with Bloom taxonomy matrix to HOD office.' },
      { day: '19', month: 'OCT', tag: 'ATTENDANCE', tagTone: 'tag-blue', title: 'Biometric Attendance Reconciliation for Odd Semester', desc: 'Verify weekly student attendance reports before publication to student portals.' },
      { day: '14', month: 'OCT', tag: 'SEMINAR', tagTone: 'tag-green', title: 'Faculty Development Program on Generative AI', desc: '5-Day online AICTE-ATAL sponsored FDP commences from Monday.' },
    ],
  },

  // 8. EXAM CELL
  exam_cell: {
    roleKey: 'exam_cell',
    roleTitle: 'Exam Cell',
    dashboardTitle: 'Exam Cell dashboard',
    kicker: 'AUTONOMOUS EXAMINATION CELL · OFFICE OF CONTROLLER OF EXAMINATIONS',
    caption: 'Coordinate examination schedules, oversee question paper distribution, and process university results.',
    motd: 'Autonomous Odd-Semester exam schedules finalized. Evaluation centers operational for paper marking.',
    officer: {
      name: 'Dr. K. C. Patra',
      id: 'COE-EXAM-01',
      employeeCode: 'EMP-COE-2015-014',
      designation: 'Controller of Examinations (CoE)',
      department: 'Autonomous Examination Cell',
      specialization: 'Examination Administration & Cryptographic Paper Custody',
      office: 'Confidential Strongroom · Examination Wing',
      qualification: 'Ph.D, M.Sc, Former University Registrar',
      experience: '22+ Years Academic Examination Governance',
      assignedResponsibilities: 'End-Sem Schedule, Hall Tickets, Evaluation Vault, Result Publishing',
      academicYear: '2026–2027',
      email: 'coe@apnacampus.edu.in',
      phone: '+91 94370 00070',
      employmentType: 'Full-Time Regular (Tenured)',
      dateOfJoining: '14 Jan 2015',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. B. K. Sarap (Principal) & Academic Council',
      photo: '/passport_photo_male.svg',
      scope: 'Autonomous Examination Controller',
      biometricId: 'BIO-COE-014',
      maskedAadhaar: '•••• •••• 8832',
      maskedPan: '•••••789T',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 8832 · PAN: •••••789T)',
    },
    stats: {
      c1: { icon: Calendar, label: 'Upcoming Examinations', badge: 'Autonomous', val: '28 Papers', desc: 'Autumn End-Semester 2026 Examination Series', pills: ['18 Theory', '10 Practical Viva', 'Sealed'] },
      c2: { icon: Ticket, label: 'Registered Candidates & Hall Tickets', badge: '98.3% Issued', val: '2,462', ratio: '2,420 / 2,462 Admit Cards Issued', pct: '98.3%', foot: '42 Hall tickets pending fee clearance' },
      c3: { icon: FileCheck2, label: 'Answer-Script Evaluation Progress', badge: '78% Complete', val: '78%', desc: '11,400 of 14,600 answer-scripts evaluated', foot: 'Digital evaluation center active' },
      c4: { icon: AlertTriangle, label: 'Pending Marks Submissions', badge: '4 Depts Due', val: '04 Depts', desc: 'Internal assessment moderation pending for 4 courses', foot: 'Moderation deadline in 48 hours' },
    },
    quickActions: [
      { id: 'schedule', label: 'View Examination Schedule', icon: Calendar },
      { id: 'progress', label: 'Check Evaluation Progress', icon: FileCheck2 },
      { id: 'submissions', label: 'Review Pending Submissions', icon: AlertTriangle },
    ],
    overviewTitle: 'Autonomous Examination Master Schedule & Centers',
    overviewItems: [
      { col1: '28 Oct 2026 · 10:00 AM', col2: 'CS501 - Data Structures & Algorithms', col3: 'Halls 101, 102, 103 (Main Block)', col4: '135 Registered · Admit Cards 100%', badge: 'status-green' },
      { col1: '30 Oct 2026 · 10:00 AM', col2: 'CS502 - Operating Systems & Architecture', col3: 'Halls 101, 102, 103 (Main Block)', col4: '135 Registered · Admit Cards 100%', badge: 'status-green' },
      { col1: '02 Nov 2026 · 10:00 AM', col2: 'EC501 - Microprocessors & Microcontrollers', col3: 'Halls 201, 202 (Tech Block)', col4: '120 Registered · Admit Cards 98%', badge: 'status-blue' },
      { col1: '04 Nov 2026 · 10:00 AM', col2: 'EE501 - Control Systems Engineering', col3: 'Halls 203, 204 (Tech Block)', col4: '95 Registered · Admit Cards 97%', badge: 'status-blue' },
      { col1: '06 Nov 2026 · 10:00 AM', col2: 'ME501 - Heat Transfer & Thermodynamics', col3: 'Halls 301, 302 (Mech Block)', col4: '110 Registered · Admit Cards 96%', badge: 'status-amber' },
    ],
    overviewColumns: ['Examination Date & Time', 'Course Name & Subject Code', 'Examination Hall Centers', 'Candidate Readiness Status'],
    announcements: [
      { day: '18', month: 'OCT', tag: 'CIRCULAR', tagTone: 'tag-violet', title: 'Autonomous End-Semester Admit Card Download Active', desc: 'Eligible students can download biometric-stamped hall tickets from their student portals.' },
      { day: '14', month: 'OCT', tag: 'CONFIDENTIAL', tagTone: 'tag-amber', title: 'Question Paper Printing & Strongroom Security Protocol', desc: '24/7 CCTV surveillance and dual keycard authentication initiated for exam vault.' },
      { day: '10', month: 'OCT', tag: 'SCRUTINY', tagTone: 'tag-green', title: 'Re-evaluation & Scrutiny Results Published for Even Sem', desc: 'Updated grade cards dispatched to department academic coordinators.' },
    ],
  },

  // 9. ACCOUNTS
  accounts: {
    roleKey: 'accounts',
    roleTitle: 'Accounts',
    dashboardTitle: 'Accounts dashboard',
    kicker: 'FINANCE & TREASURY · ACCOUNTS DIVISION',
    caption: 'Monitor fee collections, verify digital payment receipts, and generate institutional financial ledgers.',
    motd: 'Semester 5 fee reconciliation active. ₹4.85 Lakh collected today across online and offline counters.',
    officer: {
      name: 'Mr. S. K. Roy',
      id: 'ACC-BURSAR-01',
      employeeCode: 'EMP-ACC-2017-023',
      designation: 'Senior Accounts Officer & College Bursar',
      department: 'Finance, Accounts & Audit Division',
      specialization: 'Institutional Finance, Treasury & Statutory Audit',
      office: 'Accounts Wing Room 102 · Ground Floor',
      qualification: 'M.Com, FCA, PGDBF',
      experience: '16+ Years Treasury & Institutional Finance',
      assignedResponsibilities: 'Tuition Fee Recovery, Online Receipt Reconciliation, Annual Audit',
      academicYear: '2026–2027',
      email: 'accounts@apnacampus.edu.in',
      phone: '+91 94370 00080',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '05 Sep 2017',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Institutional Management',
      photo: '/passport_photo_male.svg',
      scope: 'Senior Accounts Officer & Bursar',
      biometricId: 'BIO-ACC-023',
      maskedAadhaar: '•••• •••• 3341',
      maskedPan: '•••••512C',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 3341 · PAN: •••••512C)',
    },
    stats: {
      c1: { icon: CreditCard, label: 'Total Fee Collection (FY 26-27)', badge: '92.5% Target', val: '₹24,60,80,000', desc: 'Total College Fee Budget: ₹26.58 Cr', pills: ['Tuition ₹20.2 Cr', 'Hostel ₹3.2 Cr', 'Transport ₹1.2 Cr'] },
      c2: { icon: CheckCircle2, label: 'Today\'s Real-time Collection', badge: '32 Receipts', val: '₹4,85,000', ratio: '₹4.85 L / ₹5.00 L Target', pct: '97%', foot: 'Reconciled with SBI Campus Branch counter' },
      c3: { icon: Clock, label: 'Payment Verification Requests', badge: '14 Pending', val: '14 Slips', desc: 'NEFT, RTGS & UPI payment proofs pending clearance', foot: '48 Slips verified and receipted today' },
      c4: { icon: AlertTriangle, label: 'Outstanding Fees Summary', badge: 'Follow-up Due', val: '₹1,98,40,000', desc: '64 Students with unpaid semester dues', foot: 'Automated SMS & Email reminders sent' },
    },
    quickActions: [
      { id: 'summary', label: 'View Fee Summary', icon: CreditCard },
      { id: 'payments', label: 'Review Payments', icon: CheckCircle2 },
      { id: 'transactions', label: 'View Transactions', icon: Receipt },
    ],
    overviewTitle: 'Recent Fee Transactions & Verified Receipts (INR ₹)',
    overviewItems: [
      { col1: 'RCP-2026-8821', col2: 'Rakesh Das (2305201001)', col3: 'Semester 5 Tuition & Exam Fee', col4: '₹48,500 · Verified (NEFT)', badge: 'status-green' },
      { col1: 'RCP-2026-8822', col2: 'Priya Patra (2305201004)', col3: 'Hostel Accommodation & Dining Fee', col4: '₹34,000 · Verified (Online Gateway)', badge: 'status-green' },
      { col1: 'RCP-2026-8823', col2: 'Subham Senapati (2305201045)', col3: 'Annual Transport Transit Pass', col4: '₹18,000 · Verified (SBI Challan)', badge: 'status-green' },
      { col1: 'RCP-2026-8824', col2: 'Ananya Mishra (2305201018)', col3: 'Semester 5 Tuition Balance', col4: '₹22,500 · Pending NEFT Verification', badge: 'status-amber' },
      { col1: 'RCP-2026-8825', col2: 'Amit Nayak (2305201029)', col3: 'Autonomous Re-evaluation Fee', col4: '₹1,500 · Verified (UPI)', badge: 'status-green' },
    ],
    overviewColumns: ['Receipt No.', 'Student Details', 'Fee Component Head', 'Amount in INR (₹) & Status'],
    announcements: [
      { day: '25', month: 'OCT', tag: 'FINANCE', tagTone: 'tag-amber', title: 'Odd Semester Tuition Fee Final Clearance Window', desc: 'Late fine waiver applicable for students completing payment before 25th October.' },
      { day: '18', month: 'OCT', tag: 'SCHOLARSHIP', tagTone: 'tag-green', title: 'National Scholarship Portal (NSP) Reimbursement', desc: '₹1.14 Crore scholarship grant credited to college institutional treasury for disbursement.' },
      { day: '12', month: 'OCT', tag: 'AUDIT', tagTone: 'tag-blue', title: 'Internal Financial Audit for Q2 Completed', desc: 'All ledger entries reconciled with State Bank of India main institutional account.' },
    ],
  },

  // 10. LIBRARY
  library: {
    roleKey: 'library',
    roleTitle: 'Library',
    dashboardTitle: 'Library dashboard',
    kicker: 'KNOWLEDGE & RESOURCE CENTER · CENTRAL UNIVERSITY LIBRARY',
    caption: 'Manage catalogued volumes, issue/return transactions, overdue notices, and digital e-resources.',
    motd: 'Research repository and digital library e-portal access open until 08:00 PM.',
    officer: {
      name: 'Dr. Rabindra K. Jena',
      id: 'LIB-HEAD-01',
      employeeCode: 'EMP-LIB-2016-019',
      designation: 'Chief Librarian & Knowledge Resource Officer',
      department: 'Central University Library System',
      specialization: 'Information Retrieval, Digital Repositories & RFID Automation',
      office: 'Chief Librarian Chamber · Mezzanine Floor',
      qualification: 'M.Lib.Sc, Ph.D in Information Sciences',
      experience: '19+ Years Library & Knowledge Management',
      assignedResponsibilities: 'Cataloguing, Circulation Desks, Digital Consortium (IEEE/ScienceDirect)',
      academicYear: '2026–2027',
      email: 'librarian@apnacampus.edu.in',
      phone: '+91 94370 00090',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '11 Oct 2016',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. B. K. Sarap (Principal)',
      photo: '/passport_photo_male.svg',
      scope: 'Chief University Librarian',
      biometricId: 'BIO-LIB-019',
      maskedAadhaar: '•••• •••• 2217',
      maskedPan: '•••••643E',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 2217 · PAN: •••••643E)',
    },
    stats: {
      c1: { icon: BookOpen, label: 'Total Catalogued Volumes', badge: '12,400 Titles', val: '48,500', desc: 'Engineering, Management, Science & Humanity', pills: ['38,000 Tech', '6,500 Mgmt', '4,000 General'] },
      c2: { icon: CheckCircle2, label: 'Available Books on Shelf', badge: '87.0% In-Stock', val: '42,180', ratio: '42,180 / 48,500 Available', pct: '87%', foot: 'Immediate availability at Central Circulation Desk' },
      c3: { icon: Users, label: 'Books Currently Issued', badge: '6,320 Active', val: '6,320', desc: '4,810 to Students · 1,510 to Faculty', foot: '142 Books issued today' },
      c4: { icon: AlertTriangle, label: 'Overdue Books & Pending Returns', badge: '84 Overdue', val: '84 Books', desc: 'Automatic fine reminders dispatched via SMS', foot: 'Oldest overdue: 14 days (CLRS Algorithm)' },
    },
    quickActions: [
      { id: 'search', label: 'Search Books', icon: Search },
      { id: 'issued', label: 'View Issued Books', icon: BookOpen },
      { id: 'overdue', label: 'Check Overdue Books', icon: AlertTriangle },
    ],
    overviewTitle: 'Recent Book Issue & Return Circulation Log',
    overviewItems: [
      { col1: 'ACC-88201', col2: 'Introduction to Algorithms (Cormen, Leiserson)', col3: 'Rakesh Das (2305201001)', col4: 'Issued · Due 22 Oct 2026', badge: 'status-green' },
      { col1: 'ACC-88202', col2: 'Database System Concepts (Silberschatz)', col3: 'Priya Patra (2305201004)', col4: 'Issued · Due 24 Oct 2026', badge: 'status-green' },
      { col1: 'ACC-88203', col2: 'Modern Operating Systems (Tanenbaum)', col3: 'Dr. S. Mohanty (FAC-042)', col4: 'Faculty Issue · Due 15 Nov 2026', badge: 'status-blue' },
      { col1: 'ACC-88204', col2: 'Artificial Intelligence: A Modern Approach (Russell)', col3: 'Subham Senapati (2305201045)', col4: 'Returned Today · Fine ₹0', badge: 'status-green' },
      { col1: 'ACC-88205', col2: 'Digital Signal Processing (Proakis)', col3: 'Ashutosh Pradhan (2305201092)', col4: 'Overdue by 3 Days · Fine ₹15', badge: 'status-amber' },
    ],
    overviewColumns: ['Accession No.', 'Book Title & Author', 'Borrower Details', 'Circulation Status'],
    announcements: [
      { day: '19', month: 'OCT', tag: 'DIGITAL', tagTone: 'tag-violet', title: 'IEEE Xplore & ScienceDirect Consortium Access Active', desc: 'Students can access over 5 million peer-reviewed journal papers using campus Wi-Fi.' },
      { day: '15', month: 'OCT', tag: 'RESOURCE', tagTone: 'tag-blue', title: 'Arrival of 250 New Reference Volumes for AI & Robotics', desc: 'New arrivals placed in Section 4A Reference Wing. 1-day borrowing permitted.' },
      { day: '11', month: 'OCT', tag: 'TIMING', tagTone: 'tag-green', title: 'Extended Reading Hall Hours During End-Semester', desc: 'Central Library Air-Conditioned Reading Wing will remain open until 10:00 PM.' },
    ],
  },

  // 11. PLACEMENT
  placement: {
    roleKey: 'placement',
    roleTitle: 'Placement',
    dashboardTitle: 'Placement dashboard',
    kicker: 'CORPORATE RELATIONS & CAREERS · TRAINING & PLACEMENT CELL',
    caption: 'Track campus drives, recruiter partnerships, student interview pipelines, and placement metrics.',
    motd: 'Cisco Systems interview results declared: 28 students offered. Cognizant technical round on Wednesday.',
    officer: {
      name: 'Prof. Sudhanshu S. Ray',
      id: 'TPO-HEAD-01',
      employeeCode: 'EMP-TPO-2017-027',
      designation: 'Head of Corporate Relations & Placements (TPO)',
      department: 'Training & Placement Cell (T&P)',
      specialization: 'Corporate Partnerships, Student Employability & Campus Hiring',
      office: 'Placement Executive Suite · Career Center',
      qualification: 'B.Tech, MBA, 18+ Years Corporate Relations',
      experience: '18+ Years Corporate Relations & Placements',
      assignedResponsibilities: 'Tier-1 Recruiter Relations, Placement Drives, CTC Benchmarking',
      academicYear: '2026–2027',
      email: 'tpo@apnacampus.edu.in',
      phone: '+91 94370 00100',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '03 Apr 2017',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Prof. (Dr.) S. P. Panda (Chairman) & Principal',
      photo: '/passport_photo_male.svg',
      scope: 'Placement & Corporate Relations Head',
      biometricId: 'BIO-TPO-027',
      maskedAadhaar: '•••• •••• 9924',
      maskedPan: '•••••882J',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 9924 · PAN: •••••882J)',
    },
    stats: {
      c1: { icon: Users, label: 'Registered Placement Candidates', badge: 'Final Year 2027', val: '580', desc: 'Eligible: CSE (260), ECE (140), EE/ME/CE (180)', pills: ['580 Registered', '512 Total Offers', 'Dream Batch'] },
      c2: { icon: Award, label: 'Students Selected & Placed', badge: '76.2% Placed', val: '442', ratio: '442 Selected / 580 Eligible', pct: '76.2%', foot: '418 Placements completed & accepted by students' },
      c3: { icon: Briefcase, label: 'Active Corporate Recruiters', badge: '42 Companies', val: '42 Partners', desc: 'Cisco, TCS, Infosys, Deloitte, L&T, Wipro', foot: '14 Tier-1 IT & Core firms visiting campus' },
      c4: { icon: Clock, label: 'Upcoming Placement Drives', badge: '3 This Week', val: '03 Drives', desc: 'Cognizant (Oct 21), Tech Mahindra (Oct 23)', foot: 'Cognizant pre-placement talk at 10:00 AM' },
    },
    quickActions: [
      { id: 'drives', label: 'View Placement Drives', icon: Briefcase },
      { id: 'recruiters', label: 'View Recruiters', icon: Building },
      { id: 'stats', label: 'View Placement Statistics', icon: Award },
    ],
    overviewTitle: 'Active Placement Drives & Selection Metrics',
    overviewItems: [
      { col1: 'Cisco Systems India', col2: 'Software / Network Engineer (₹18.5 LPA)', col3: '210 Applied · 84 Shortlisted', col4: '28 Selected · 28 Offers Accepted', badge: 'status-green' },
      { col1: 'Tata Consultancy Services (Digital)', col2: 'Systems Engineer (₹7.5 LPA)', col3: '340 Applied · 120 Shortlisted', col4: '42 Selected · 42 Completed', badge: 'status-green' },
      { col1: 'Deloitte USI Technology', col2: 'Technology Analyst (₹8.2 LPA)', col3: '240 Applied · 95 Shortlisted', col4: '31 Selected · In Final Documentation', badge: 'status-blue' },
      { col1: 'Cognizant GenC Next', col2: 'Full Stack Engineer (₹6.8 LPA)', col3: '280 Registered Candidates', col4: 'Technical Assessment on 21 Oct', badge: 'status-amber' },
      { col1: 'L&T Technology Services', col2: 'Graduate Engineer Trainee (₹6.0 LPA)', col3: '180 Applied · 60 Shortlisted', col4: '22 Selected · Offers Released', badge: 'status-green' },
    ],
    overviewColumns: ['Recruiting Organization', 'Role Designation & CTC', 'Applicant Funnel', 'Selections & Status'],
    announcements: [
      { day: '21', month: 'OCT', tag: 'DRIVE', tagTone: 'tag-violet', title: 'Cognizant Technology Solutions Campus Drive Schedule', desc: 'Virtual coding round begins at 10:00 AM in Labs 1, 2, and 4. Formal attire required.' },
      { day: '16', month: 'OCT', tag: 'OFFER', tagTone: 'tag-green', title: 'Cisco Systems Campus Offers Released — ₹18.5 LPA', desc: 'Hearty congratulations to 28 B.Tech students on securing dream offers at Cisco India.' },
      { day: '12', month: 'OCT', tag: 'WORKSHOP', tagTone: 'tag-blue', title: 'Mock Technical & HR Interview Sessions by Alumni', desc: 'Final year students scheduled for weekend mock technical interviews.' },
    ],
  },

  // 12. TRANSPORT
  transport: {
    roleKey: 'transport',
    roleTitle: 'Transport',
    dashboardTitle: 'Transport dashboard',
    kicker: 'CAMPUS LOGISTICS & FLEET · TRANSPORT DIVISION',
    caption: 'Manage campus bus fleet, transit routes, driver allocations, and student transport registrations.',
    motd: 'All 24 active fleet buses completed evening departures safely. Fleet fitness inspections up to date.',
    officer: {
      name: 'Mr. Jagannath Sahoo',
      id: 'TRANS-FLEET-01',
      employeeCode: 'EMP-LOG-2018-052',
      designation: 'Fleet & Transit Logistics Manager',
      department: 'Campus Transport Division',
      specialization: 'Fleet Operations, Route Scheduling & RTO Compliance',
      office: 'Transport Depot Control Room · Gate 3',
      qualification: 'Diploma in Automobile Engineering, Logistics Spec',
      experience: '15+ Years Transit & Logistics Management',
      assignedResponsibilities: '26 Fleet Vehicles, 16 Routes, Driver Scheduling, RFID Bus Passes',
      academicYear: '2026–2027',
      email: 'transport@apnacampus.edu.in',
      phone: '+91 94370 00110',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '20 Jan 2018',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Er. S. K. Nayak (CAO)',
      photo: '/passport_photo_male.svg',
      scope: 'Campus Transit Manager',
      biometricId: 'BIO-TRN-052',
      maskedAadhaar: '•••• •••• 1184',
      maskedPan: '•••••331W',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 1184 · PAN: •••••331W)',
    },
    stats: {
      c1: { icon: Bus, label: 'Total Fleet Vehicles', badge: '26 Fleet', val: '26', desc: '22 AC / Deluxe Buses · 4 Utility Vans', pills: ['22 Buses', '4 Vans', 'College Owned'] },
      c2: { icon: CheckCircle2, label: 'Vehicles in Active Service', badge: '92.3% Ready', val: '24 Buses', ratio: '24 / 26 Operational', pct: '92.3%', foot: '2 Under scheduled routine servicing at depot' },
      c3: { icon: MapPin, label: 'Active Transit Routes', badge: '16 Routes', val: '16 Routes', desc: 'Covering Cuttack, Bhubaneswar, Khordha, Jatni', foot: '16 Assigned certified commercial drivers' },
      c4: { icon: Users, label: 'Student Transport Registrations', badge: 'RFID Active', val: '1,180', desc: '1,180 Active bus pass holders across 16 routes', foot: '96% Route seat occupancy utilization' },
    },
    quickActions: [
      { id: 'routes', label: 'View Fleet Routes', icon: MapPin },
      { id: 'maintenance', label: 'Maintenance Schedule', icon: Wrench },
      { id: 'drivers', label: 'Driver Allocations', icon: Bus },
    ],
    overviewTitle: 'Active Campus Transit Routes & Driver Assignments',
    overviewItems: [
      { col1: 'Route 01 (Cuttack Badambadi)', col2: 'Bus OD-02-X-4401 (52 Seater)', col3: 'Mr. Ramesh Chandra Sahoo (94371-11001)', col4: '50 / 52 Seats · Active On-Time', badge: 'status-green' },
      { col1: 'Route 02 (Bhubaneswar Master Canteen)', col2: 'Bus OD-02-X-4402 (52 Seater)', col3: 'Mr. Kalia Nayak (94371-11002)', col4: '52 / 52 Seats · Active On-Time', badge: 'status-green' },
      { col1: 'Route 03 (Patia & KIIT Square)', col2: 'Bus OD-02-X-4403 (52 Seater)', col3: 'Mr. Bimal Rout (94371-11003)', col4: '48 / 52 Seats · Active On-Time', badge: 'status-green' },
      { col1: 'Route 04 (Khandagiri & Baramunda)', col2: 'Bus OD-02-X-4404 (48 Seater)', col3: 'Mr. Prakash Das (94371-11004)', col4: '46 / 48 Seats · Active On-Time', badge: 'status-green' },
      { col1: 'Route 05 (Khordha & Jatni Town)', col2: 'Bus OD-02-X-4405 (52 Seater)', col3: 'Mr. Surendra Behera (94371-11005)', col4: '51 / 52 Seats · Active On-Time', badge: 'status-green' },
    ],
    overviewColumns: ['Route Description & Corridor', 'Assigned Bus Vehicle', 'Designated Fleet Driver', 'Occupancy & Operational Status'],
    announcements: [
      { day: '20', month: 'OCT', tag: 'SCHEDULE', tagTone: 'tag-blue', title: 'Revised Evening Bus Departure Timings', desc: 'Due to end-semester extra tutorial sessions, evening buses will depart at 05:15 PM instead of 04:45 PM.' },
      { day: '15', month: 'OCT', tag: 'MAINTENANCE', tagTone: 'tag-amber', title: 'Routine Vehicle Fitness Inspection for Buses 07 and 12', desc: 'Buses OD-02-X-4407 and 4412 undergoing scheduled RTO pollution and brake calibration.' },
      { day: '10', month: 'OCT', tag: 'PASS', tagTone: 'tag-green', title: 'RFID Bus Pass Verification at Campus Toll Gate', desc: 'All registered transit students must tap their encoded smart identity card when boarding.' },
    ],
  },

  // 13. HOSTEL
  warden: {
    roleKey: 'warden',
    roleTitle: 'Hostel',
    dashboardTitle: 'Hostel dashboard',
    kicker: 'STUDENT RESIDENCE & HOUSING · HOSTEL ADMINISTRATION',
    caption: 'Oversee campus hostel blocks, room allocations, student complaints, and outstation gate passes.',
    motd: 'Night roll-call commences at 09:30 PM. 4 outstation gate passes awaiting mentor and warden approval.',
    officer: {
      name: 'Mrs. Nibedita Das',
      id: 'WRD-CHIEF-01',
      employeeCode: 'EMP-HST-2017-036',
      designation: 'Chief Resident Warden & Housing Supervisor',
      department: 'Hostel Administration & Student Housing',
      specialization: 'Student Welfare, Residence Discipline & Mess Operations',
      office: 'Hostel Office Block A · Gandhi Residence',
      qualification: 'M.A., Higher Education Residence Administration',
      experience: '13+ Years Student Housing Administration',
      assignedResponsibilities: '4 Hostel Complexes, 1000 Resident Beds, Night Roll-Call, Outstation Passes',
      academicYear: '2026–2027',
      email: 'warden@apnacampus.edu.in',
      phone: '+91 94370 00120',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '14 Aug 2017',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. B. K. Sarap (Principal)',
      photo: '/passport_photo_female.svg',
      scope: 'Chief Campus Resident Warden',
      biometricId: 'BIO-WRD-036',
      maskedAadhaar: '•••• •••• 7730',
      maskedPan: '•••••945Q',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 7730 · PAN: •••••945Q)',
    },
    stats: {
      c1: { icon: Building, label: 'Total Hostel Capacity', badge: '4 Hostels', val: '1,000 Beds', desc: '330 Rooms across Boys & Girls Blocks', pills: ['2 Boys Blocks', '2 Girls Blocks', 'Wi-Fi Enabled'] },
      c2: { icon: CheckCircle2, label: 'Occupied Rooms & Beds', badge: '88.0% Occupancy', val: '880 Beds', ratio: '880 / 1,000 Beds Occupied', pct: '88%', foot: '120 Beds available for new semester admissions' },
      c3: { icon: Bed, label: 'Available Rooms & Beds', badge: '120 Vacant', val: '120 Beds', desc: 'Ready for allotment across Blocks A, B, C', foot: 'Sanitized and furnished ready for intake' },
      c4: { icon: Clock, label: 'Pending Room Requests & Gate Passes', badge: '9 Pending', val: '09 Dockets', desc: '5 Room allocations · 4 Outstation gate passes', foot: 'All daytime local gate passes cleared' },
    },
    quickActions: [
      { id: 'rooms', label: 'View Room Summary', icon: Bed },
      { id: 'complaints', label: 'Review Complaints', icon: AlertTriangle },
      { id: 'maintenance', label: 'View Maintenance Requests', icon: Wrench },
    ],
    overviewTitle: 'Hostel Building Occupancy & Maintenance Status',
    overviewItems: [
      { col1: 'Gandhi Boys Residence (Hostel 1)', col2: 'Boys · 100 Rooms (300 Beds)', col3: '272 Beds Occupied (90.7%)', col4: '28 Beds Available · 2 Open Maintenance', badge: 'status-green' },
      { col1: 'APJ Abdul Kalam Residence (Hostel 2)', col2: 'Boys · 80 Rooms (240 Beds)', col3: '215 Beds Occupied (89.6%)', col4: '25 Beds Available · 1 Open Maintenance', badge: 'status-green' },
      { col1: 'Kalpana Chawla Girls Residence (Hostel 3)', col2: 'Girls · 90 Rooms (270 Beds)', col3: '248 Beds Occupied (91.8%)', col4: '22 Beds Available · 1 Open Maintenance', badge: 'status-green' },
      { col1: 'Sarojini Naidu Girls Residence (Hostel 4)', col2: 'Girls · 60 Rooms (190 Beds)', col3: '145 Beds Occupied (76.3%)', col4: '45 Beds Available · 0 Open Maintenance', badge: 'status-blue' },
    ],
    overviewColumns: ['Hostel Complex Name', 'Block Classification', 'Current Census Occupancy', 'Available Capacity & Tasks'],
    announcements: [
      { day: '19', month: 'OCT', tag: 'RULES', tagTone: 'tag-violet', title: 'Night Quiet Hours & Biometric In-Time Compliance', desc: 'All hostel residents must check into their respective residences by 09:30 PM without fail.' },
      { day: '16', month: 'OCT', tag: 'MESS', tagTone: 'tag-green', title: 'Special Sunday Festive Dinner Menu Approved', desc: 'Special festive dinner arranged at Central Dining Hall. Dining timings 07:30 PM to 09:30 PM.' },
      { day: '12', month: 'OCT', tag: 'HYGIENE', tagTone: 'tag-blue', title: 'Pest Control & Clean Campus Sanitization Drive', desc: 'Weekly sanitization across all hostel washrooms and common rooms completed.' },
    ],
  },

  // 14. STAFF (LABS)
  staff: {
    roleKey: 'staff',
    roleTitle: 'Staff (Labs)',
    dashboardTitle: 'Staff (Labs) dashboard',
    kicker: 'TECHNICAL & LAB OPERATIONS · ADVANCED COMPUTING & LABS',
    caption: 'Manage laboratory schedules, workstation health, equipment inventory, and practical sessions.',
    motd: 'All 12 computer and hardware labs ready for tomorrow\'s practical sessions. Systems patched.',
    officer: {
      name: 'Mr. Biswajit Sahoo',
      id: 'STF-OPS-09',
      employeeCode: 'EMP-LAB-2019-061',
      designation: 'Senior Technical Staff & Lab Superintendent',
      department: 'Technical & Computing Laboratories',
      specialization: 'Laboratory Workstations, Network Switches & OS Images',
      office: 'Central Computing Facility Room 104',
      qualification: 'B.Sc (Comp. Sci), CCNA, Hardware & Networking Certified',
      experience: '11+ Years Systems & Lab Infrastructure',
      assignedResponsibilities: '12 Computer & Electronics Labs, 420 Workstations, Practical Maintenance',
      academicYear: '2026–2027',
      email: 'labstaff@apnacampus.edu.in',
      phone: '+91 94370 00130',
      employmentType: 'Full-Time Regular (Permanent)',
      dateOfJoining: '05 Mar 2019',
      employmentStatus: 'Active · On Duty',
      reportingAuthority: 'Dr. P. K. Pattnaik (HOD - CSE)',
      photo: '/passport_photo_male.svg',
      scope: 'Laboratory Operations Superintendent',
      biometricId: 'BIO-LAB-061',
      maskedAadhaar: '•••• •••• 4492',
      maskedPan: '•••••119L',
      identityVerification: 'Verified Official (Aadhaar: •••• •••• 4492 · PAN: •••••119L)',
    },
    stats: {
      c1: { icon: Monitor, label: 'Assigned Laboratories', badge: '12 Labs', val: '12 Labs', desc: 'Computing, AI/ML, Networks, IoT, Cloud Labs', pills: ['8 Software Labs', '4 Hardware Labs', 'Air Conditioned'] },
      c2: { icon: CheckCircle2, label: 'Equipment Operational Index', badge: '98.2% Ready', val: '98.2%', ratio: '412 / 420 Systems Working', pct: '98.2%', foot: '8 Machines scheduled for RAM / SSD upgrades' },
      c3: { icon: Clock, label: 'Today\'s Practical Sessions', badge: '8 Batches', val: '08 Sessions', desc: 'Data Structures Lab, OS Lab, Microprocessor Lab', foot: '240 Students attending practicals today' },
      c4: { icon: Wrench, label: 'Pending Maintenance Requisitions', badge: '3 In-Queue', val: '03 Reqs', desc: '2 UPS battery replacement · 1 Cisco switch port fix', foot: 'Vendor service engineer arriving tomorrow' },
    },
    quickActions: [
      { id: 'equipment', label: 'Lab Equipment Status', icon: Monitor },
      { id: 'schedule', label: 'Practical Schedule', icon: Clock },
      { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench },
    ],
    overviewTitle: 'Laboratory Practical Sessions & Workstation Inventory',
    overviewItems: [
      { col1: 'Advanced Computing Lab 1', col2: 'Room 201 (60 Systems)', col3: 'Ubuntu Linux 24.04 / GCC / Python 3.12', col4: 'CS501 Lab Active · All 60 Online', badge: 'status-green' },
      { col1: 'AI & Data Science Lab 2', col2: 'Room 202 (50 Systems)', col3: 'NVIDIA RTX Workstations · PyTorch / CUDA', col4: 'CS702 Lab Active · All 50 Online', badge: 'status-green' },
      { col1: 'Hardware & IoT Microprocessor Lab', col2: 'Room 105 (40 Workbenches)', col3: '8085 / 8086 Kits · Arduino & Raspberry Pi', col4: 'EC501 Lab Active · Calibration Done', badge: 'status-green' },
      { col1: 'Network Simulation & Security Lab', col2: 'Room 304 (45 Systems)', col3: 'Cisco Packet Tracer / Wireshark / GNS3', col4: 'Practical Ready · 1 Switch Replaced', badge: 'status-blue' },
      { col1: 'Database & Cloud Lab 4', col2: 'Room 305 (55 Systems)', col3: 'Oracle 19c / PostgreSQL / AWS CLI', col4: 'CS503 Lab Scheduled at 01:30 PM', badge: 'status-green' },
    ],
    overviewColumns: ['Laboratory Name', 'Venue & Workstation Count', 'Configured Software & Hardware Stacks', 'Session Status & Health'],
    announcements: [
      { day: '19', month: 'OCT', tag: 'MAINTENANCE', tagTone: 'tag-violet', title: 'Central Computing Facility Server Room UPS Battery Servicing', desc: 'Preventative load testing of 40 KVA central online UPS scheduled for Saturday.' },
      { day: '15', month: 'OCT', tag: 'SOFTWARE', tagTone: 'tag-blue', title: 'MATLAB & LabVIEW Academic License Renewed', desc: 'Updated license files pushed to all 120 engineering workstations in Blocks B & C.' },
      { day: '11', month: 'OCT', tag: 'SAFETY', tagTone: 'tag-green', title: 'Laboratory Chemical & Electrical Fire Safety Inspection', desc: 'All fire extinguishers, emergency power cut-offs, and first aid kits recertified.' },
    ],
  },
};

export default function RoleDashboardLanding({
  account,
  roleKey,
  onLogout,
  onNavigateTab,
  onSwitchRole,
  onToggleSidebar,
  sidebarOpen,
}) {
  // Resolve configuration from prop or account
  const resolvedKey = String(roleKey || account?.role || 'super_admin').toLowerCase();
  const config = ROLE_CONFIGS[resolvedKey] || ROLE_CONFIGS['super_admin'];
  const isSuperAdminDashboard = resolvedKey === 'super_admin';
  const [authenticatedAccount, setAuthenticatedAccount] = useState(null);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminDiagnostics, setAdminDiagnostics] = useState(null);
  const [dashboardLoadError, setDashboardLoadError] = useState('');

  useEffect(() => {
    if (!isSuperAdminDashboard) return undefined;
    let active = true;
    Promise.allSettled([api.getMe(), api.getAdminMetrics(), api.getAdminDiagnostics()]).then(([profileResult, metricsResult, diagnosticsResult]) => {
      if (!active) return;
      if (profileResult.status === 'fulfilled') setAuthenticatedAccount(profileResult.value?.user || null);
      if (metricsResult.status === 'fulfilled') {
        setAdminMetrics(metricsResult.value?.data || null);
        setDashboardLoadError('');
      } else {
        setDashboardLoadError('Could not load account metrics from the backend.');
      }
      if (diagnosticsResult.status === 'fulfilled') {
        setAdminDiagnostics(diagnosticsResult.value?.data || null);
      }
    });
    return () => { active = false; };
  }, [isSuperAdminDashboard]);
  const dashboardAccount = isSuperAdminDashboard ? authenticatedAccount : account;

  // Current live time & date matching Student Dashboard
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time greeting matching Student Dashboard
  const timeGreeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) {
      return {
        wish: 'Good morning',
        emoji: '🌅',
        period: 'Morning',
        themeClass: 'dash-hero-morning',
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        wish: 'Good afternoon',
        emoji: '☀️',
        period: 'Afternoon',
        themeClass: 'dash-hero-afternoon',
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        wish: 'Good evening',
        emoji: '🌇',
        period: 'Evening',
        themeClass: 'dash-hero-evening',
      };
    }
    return {
      wish: 'Good night',
      emoji: '🌙',
      period: 'Night',
      themeClass: 'dash-hero-night',
    };
  }, [currentTime]);

  const formattedLiveTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(currentTime);
  }, [currentTime]);

  // Calendar & Holiday State (Matching Student Dashboard)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [holidayView, setHolidayView] = useState('all');

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(currentMonth);
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    return createCalendarDays(currentMonth, currentTime);
  }, [currentMonth, currentTime]);

  const holidayItems = useMemo(() => {
    const startOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
    return OFFICIAL_HOLIDAYS_2026.map(([raw, name]) => {
      const [d, m, y] = raw.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const daysLeft = Math.round((date - startOfToday) / 86400000);
      return { raw, name, date, daysLeft, key: `${y}-${m - 1}-${d}` };
    });
  }, [currentTime]);

  const displayedHolidays = useMemo(() => {
    if (holidayView === 'upcoming') {
      return holidayItems.filter((h) => h.daysLeft >= 0);
    }
    return holidayItems;
  }, [holidayView, holidayItems]);

  const holidayMap = useMemo(() => {
    return Object.fromEntries(holidayItems.map((h) => [h.key, h.name]));
  }, [holidayItems]);

  const nextHoliday = useMemo(() => {
    return holidayItems.find((h) => h.daysLeft >= 0);
  }, [holidayItems]);

  function updateMonth(direction) {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + direction, 1));
  }

  // Notifications Popover State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => [
    {
      id: 'n-1',
      tag: 'INSTITUTIONAL',
      tagClass: 'tag-violet',
      title: `${config.roleTitle} Daily Operations Briefing`,
      message: `System synchronized for ${config.roleTitle}. All pending tasks logged in central registry.`,
      time: '15 mins ago',
      unread: true,
    },
    {
      id: 'n-2',
      tag: 'ACADEMIC',
      tagClass: 'tag-blue',
      title: 'Autumn End-Semester 2026 Directive',
      message: 'Official academic schedule and examination timelines approved by Principal Secretariat.',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 'n-3',
      tag: 'SYSTEM',
      tagClass: 'tag-green',
      title: 'Real-time ERP Audit Trail Verified',
      message: 'Cryptographic data integrity checks passed across institutional tables.',
      time: 'Yesterday',
      unread: false,
    },
  ]);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const handleToggleNotif = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Quick Action Modal State (Dashboard Shortcut Only - does not build internal module)
  const [activeShortcutModal, setActiveShortcutModal] = useState(null);

  // Officer Profile Section State
  const [profileTab, setProfileTab] = useState('profile'); // 'profile' | 'academic' | 'identity'
  const [photoError, setPhotoError] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const handleQuickActionClick = (action) => {
    // If the portal provides a tab switcher to an existing view, try it
    if (onNavigateTab && typeof onNavigateTab === 'function') {
      const handled = onNavigateTab(action.id);
      if (handled) return;
    }
    // Otherwise open a high-fidelity dashboard shortcut preview modal
    setActiveShortcutModal(action);
  };

  // Officer Profile
  const officer = isSuperAdminDashboard
    ? {
        name: dashboardAccount?.name || 'Signed-in account',
        id: dashboardAccount?.identifier || '—',
        designation: 'Super Admin',
        department: dashboardAccount?.department || 'Not set',
        email: dashboardAccount?.email || 'Not provided',
        photo: null,
      }
    : config.officer;
  const officerDisplayName = dashboardAccount?.name || (isSuperAdminDashboard ? 'Signed-in account' : officer.name);
  const officerShortName = officerDisplayName.split(' ').filter(Boolean)[0] || 'Officer';

  const activeRoleCount = adminMetrics?.userRoleCounts
    ? Object.values(adminMetrics.userRoleCounts).filter((counts) => counts.active > 0).length
    : null;
  const adminDashboardStats = isSuperAdminDashboard ? {
    c1: {
      ...config.stats.c1,
      badge: adminMetrics ? 'Live from backend' : 'Backend connection',
      val: adminMetrics ? Number(adminMetrics.totalAccounts || 0).toLocaleString('en-IN') : '—',
      desc: dashboardLoadError || (adminMetrics ? `${Number(adminMetrics.activeAccounts || 0).toLocaleString('en-IN')} active · ${Number(adminMetrics.inactiveAccounts || 0).toLocaleString('en-IN')} disabled` : 'Loading persisted user accounts'),
      pills: adminMetrics ? [
        `${Number(adminMetrics.totalStudents || 0).toLocaleString('en-IN')} students`,
        `${Number(adminMetrics.totalFaculty || 0).toLocaleString('en-IN')} faculty`,
      ] : [],
    },
    c2: {
      ...config.stats.c2,
      badge: adminDiagnostics?.overallStatus || adminMetrics?.systemStatus || 'Checking backend',
      val: adminDiagnostics?.overallStatus || adminMetrics?.systemStatus || '—',
      ratio: adminMetrics?.dbLatencyMs == null ? '' : `Database ping ${adminMetrics.dbLatencyMs} ms`,
      pct: '',
      foot: adminMetrics ? `Backend process uptime: ${Math.floor((adminMetrics.uptimeSeconds || 0) / 3600)}h ${Math.floor(((adminMetrics.uptimeSeconds || 0) % 3600) / 60)}m` : 'Health status is supplied by the backend',
    },
    c3: {
      ...config.stats.c3,
      label: 'Roles With Active Accounts',
      badge: adminMetrics ? 'Persisted role counts' : 'Backend data',
      val: activeRoleCount == null ? '—' : String(activeRoleCount),
      desc: adminMetrics ? `${Number(adminMetrics.activeAccounts || 0).toLocaleString('en-IN')} active accounts across assigned roles` : 'Loading role counts',
      foot: 'Based on active user records in the database',
    },
    c4: {
      ...config.stats.c4,
      label: 'Disabled Accounts',
      badge: adminMetrics ? 'Persisted account status' : 'Backend data',
      val: adminMetrics ? Number(adminMetrics.inactiveAccounts || 0).toLocaleString('en-IN') : '—',
      desc: adminMetrics ? 'Accounts marked inactive in the database' : 'Loading account status counts',
      foot: 'This count does not include pending approvals',
    },
  } : config.stats;
  const { c1, c2, c3, c4 } = adminDashboardStats;
  const dashboardOverviewItems = isSuperAdminDashboard
    ? (adminDiagnostics?.subsystems || []).map((item) => ({
        col1: item.name,
        col2: item.status,
        col3: item.details,
        col4: item.latency,
        badge: item.status === 'Healthy' ? 'status-green' : 'status-blue',
      }))
    : config.overviewItems;
  const C1Icon = c1.icon;
  const C2Icon = c2.icon;
  const C3Icon = c3.icon;
  const C4Icon = c4.icon;

  return (
    <div className="role-dash-wrapper dash">
      <div className="role-dash-container">
        {/* ==========================================================
            A. DASHBOARD HEADER (Matching Student Dashboard Header)
            ========================================================== */}
        <header className="role-dash-header">
          <div className="role-header-left">
            {onToggleSidebar && !sidebarOpen && (
              <button
                className="role-nav-toggle-btn"
                type="button"
                onClick={onToggleSidebar}
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <p className="role-header-kicker">OVERVIEW</p>
              <h1 className="role-header-title">{config.dashboardTitle}</h1>
              <p className="role-header-subtitle">
                {timeGreeting.wish}, {officerDisplayName}
              </p>
            </div>
          </div>

          <div className="role-header-actions">
            {/* WhatsApp / Campus Connect Button */}
            <div style={{ position: 'relative' }}>
              <button
                className="role-icon-btn role-whatsapp-header-btn"
                type="button"
                title="Campus Connect • College Academic WhatsApp"
                aria-label="Campus Connect"
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('campus-connect');
                  else alert('Campus Connect WhatsApp Launcher active in bottom dock.');
                }}
              >
                <MessageSquare size={18} />
              </button>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="role-icon-btn"
                type="button"
                aria-label="Notifications"
                onClick={() => setShowNotifications((s) => !s)}
                title="Campus Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="role-bell-dot" />}
              </button>

              {showNotifications && (
                <div className="role-notif-popover" role="dialog" aria-label="Notifications">
                  <div className="role-notif-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>Notifications</strong>
                      {unreadCount > 0 && (
                        <span className="role-notif-badge">{unreadCount} new</span>
                      )}
                    </div>
                    <button
                      className="role-notif-close"
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      aria-label="Close notifications"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="role-notif-list">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`role-notif-item ${notif.unread ? 'is-unread' : ''}`}
                        onClick={() => handleToggleNotif(notif.id)}
                        role="button"
                        tabIndex={0}
                        title={notif.unread ? 'Click to mark as read' : 'Click to mark as unread'}
                      >
                        <div className="role-notif-item-top">
                          <span className={`role-notif-tag ${notif.tagClass}`}>{notif.tag}</span>
                          <span className="role-notif-time">{notif.time}</span>
                        </div>
                        <h4 className="role-notif-title">{notif.title}</h4>
                        <p className="role-notif-desc">{notif.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="role-notif-foot">
                    <button type="button" onClick={handleMarkAllRead}>
                      Mark all as read
                    </button>
                    <button type="button" onClick={() => setShowNotifications(false)}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill with Sign Out */}
            <div className="role-user-pill" title={`${officerDisplayName} (${config.roleTitle})`}>
              <div className="role-user-avatar-frame">
                <img src={officer.photo} alt={officerDisplayName} />
              </div>
              <div className="role-user-details">
                <strong>{officerDisplayName}</strong>
                <small>{config.roleTitle} • {dashboardAccount?.identifier || dashboardAccount?.identity || officer.id}</small>
              </div>
              <button
                className="role-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out of portal"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* ==========================================================
            B. WELCOME BANNER (Purple-to-Blue Gradient with Live Clock)
            ========================================================== */}
        <section className={`dash-hero ${timeGreeting.themeClass}`} aria-label="Welcome Banner">
          <div className="dash-hero-glow" aria-hidden="true" />
          <div className="dash-hero-main">
            <p className="dash-hero-kicker">
              <Sparkles size={13} /> {config.kicker}
            </p>
            <h2 className="dash-hero-title">
              {timeGreeting.wish}, {officerShortName} {timeGreeting.emoji}
            </h2>
            <p className="dash-hero-caption">{config.caption}</p>
            <div className="dash-motd" role="note" aria-label="Message of the day">
              <span className="dash-motd-icon">
                <Megaphone size={14} />
              </span>
              <strong>Message of the day</strong>
              <span>{config.motd}</span>
            </div>
          </div>

          <div className="dash-hero-meta">
              <span className="dash-chip">
                {isSuperAdminDashboard ? 'Account' : 'Academic year'} <strong>{isSuperAdminDashboard ? (dashboardAccount?.identifier || '—') : '2026–27'}</strong>
              </span>
            <time className="dash-date">
              <CalendarDays size={14} /> {todayLabel}
            </time>
            <span className="dash-chip" style={{ background: 'rgba(0,0,0,0.22)' }}>
              <Clock size={12} /> {formattedLiveTime}
            </span>
          </div>
        </section>

        {/* ==========================================================
            QUICK ACTIONS BAR (Section 7 - Dashboard Shortcuts Only)
            ========================================================== */}
        <section className="role-quick-actions-bar" aria-label="Quick Action Shortcuts">
          <span className="role-quick-actions-label">
            <Zap size={14} color="#2563eb" /> Quick Actions
          </span>
          {config.quickActions.map((act) => {
            const ActIcon = act.icon;
            return (
              <button
                key={act.id}
                type="button"
                className="role-quick-action-pill"
                onClick={() => handleQuickActionClick(act)}
              >
                <ActIcon size={14} color="#2563eb" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </section>

        {/* ==========================================================
            HERO SPLIT: Left Profile Card + Right 2x2 Stats Cards (50%/50%)
            ========================================================== */}
        <div className="dash-hero-split">
          {/* LEFT: Role Officer Profile Card (Matching Student Profile Card) */}
          <aside className="dash-card dash-info dash-info-hero" id="officer-profile-card" aria-label="Officer account information">
            <div className="dash-info-cover">
              <div
                className="dash-passport-photo-frame"
                title={`${officerDisplayName} Official Passport Photo (35mm x 45mm)`}
              >
                {!photoError && officer.photo ? (
                  <img
                    src={officer.photo}
                    alt={officerDisplayName}
                    className="dash-passport-img"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="dash-passport-fallback" aria-label="Official photo fallback">
                    <UserRound size={34} color="#4338ca" />
                    <span className="dash-fallback-badge">{officer.id?.split('-')[0] || 'ERP'}</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{officerDisplayName}</strong>
                <small title={officer.designation}>{officer.designation}</small>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                  {officer.department}
                </div>
              </div>
              <span className="dash-status">
                <i /> {isSuperAdminDashboard ? (authenticatedAccount ? 'Authenticated' : 'Loading account') : 'Active'}
              </span>
            </div>

            {/* Profile Sub-Sections Tabs */}
            <div className="dash-info-tab-pills" role="tablist" aria-label="Officer Profile Navigation">
              <button
                type="button"
                role="tab"
                aria-selected={profileTab === 'profile'}
                className={`dash-info-pill ${profileTab === 'profile' ? 'active' : ''}`}
                onClick={() => setProfileTab('profile')}
              >
                {roleKey === 'faculty' ? 'Faculty Profile' : 'Profile'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={profileTab === 'academic'}
                className={`dash-info-pill ${profileTab === 'academic' ? 'active' : ''}`}
                onClick={() => setProfileTab('academic')}
              >
                {roleKey === 'faculty' || roleKey === 'hod' ? 'Teaching & Academic' : 'Professional Dossier'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={profileTab === 'identity'}
                className={`dash-info-pill ${profileTab === 'identity' ? 'active' : ''}`}
                onClick={() => setProfileTab('identity')}
              >
                Identity &amp; Status
              </button>
            </div>

            <dl className="dash-info-list">
              {profileTab === 'profile' && (
                isSuperAdminDashboard ? <>
                  <DetailRow label="Account identifier" value={officer.id} />
                  <DetailRow label="Full name" value={officerDisplayName} />
                  <DetailRow label="Role" value={dashboardAccount?.role || 'SUPER_ADMIN'} />
                  <DetailRow label="Department" value={officer.department} />
                  <DetailRow label="Email" value={officer.email} />
                  <DetailRow label="Session status" value={authenticatedAccount ? 'Authenticated by backend' : 'Loading authenticated account'} />
                </> : <>
                  <DetailRow label={roleKey === 'faculty' ? 'Faculty ID' : 'Officer ID'} value={officer.id} />
                  <DetailRow label="Employee Code" value={officer.employeeCode || officer.id} />
                  <DetailRow label="Full Name" value={officerDisplayName} />
                  <DetailRow label="Designation" value={officer.designation} />
                  <DetailRow label="Department" value={officer.department} />
                  <DetailRow label="Specialization" value={officer.specialization || 'Academic Excellence'} />
                  <DetailRow label="Official Email ID" value={officer.email} />
                  <DetailRow label="Mobile Number" value={officer.phone} />
                  <DetailRow label="Employment Type" value={officer.employmentType || 'Full-Time Regular (Permanent)'} />
                  <DetailRow label="Date of Joining" value={officer.dateOfJoining || '16 Jul 2018'} />
                  <DetailRow label="Employment Status" value={officer.employmentStatus || 'Active · On Duty'} />
                  <DetailRow label="Reporting Authority" value={officer.reportingAuthority || 'Principal Secretariat'} />
                </>
              )}

              {profileTab === 'academic' && (
                isSuperAdminDashboard ? <DetailRow label="Profile details" value="No employment or academic profile is recorded for this account." /> : <>
                  <DetailRow label="Highest Qualification" value={officer.qualification || 'Ph.D, M.Tech'} />
                  <DetailRow label="Teaching Experience" value={officer.experience || '12+ Years'} />
                  <DetailRow label="Academic Year" value={officer.academicYear || '2026–2027'} />
                  {officer.assignedSubjects && (
                    <DetailRow label="Assigned Subjects" value={officer.assignedSubjects} />
                  )}
                  {officer.assignedSemester && (
                    <DetailRow label="Assigned Semester" value={officer.assignedSemester} />
                  )}
                  {officer.assignedSections && (
                    <DetailRow label="Assigned Sections" value={officer.assignedSections} />
                  )}
                  {officer.researchInterests && (
                    <DetailRow label="Research Interests" value={officer.researchInterests} />
                  )}
                  {officer.assignedResponsibilities && (
                    <DetailRow label="Responsibilities" value={officer.assignedResponsibilities} />
                  )}
                  <DetailRow label="Office / Cabin" value={officer.office || 'Academic Block'} />
                </>
              )}

              {profileTab === 'identity' && (
                isSuperAdminDashboard ? <>
                  <DetailRow label="Account identifier" value={officer.id} />
                  <DetailRow label="Role" value={dashboardAccount?.role || 'SUPER_ADMIN'} />
                  <DetailRow label="Session status" value={authenticatedAccount ? 'Authenticated by backend' : 'Loading authenticated account'} />
                  <DetailRow label="Email" value={officer.email} />
                </> : <>
                  <DetailRow
                    label="Employment Status"
                    value={<span style={{ color: '#059669', fontWeight: 700 }}>● Active · On Duty</span>}
                  />
                  <DetailRow
                    label="Identity Verification"
                    value={<span style={{ color: '#2563eb', fontWeight: 700 }}>✓ Verified Official</span>}
                  />
                  <DetailRow label="Aadhaar ID (Masked)" value={officer.maskedAadhaar || '•••• •••• 9821'} />
                  <DetailRow label="PAN Card (Masked)" value={officer.maskedPan || '•••••542F'} />
                  <DetailRow label="Biometric Punch UID" value={officer.biometricId || `BIO-${officer.id}`} />
                  <DetailRow label="Date of Joining" value={officer.dateOfJoining || '16 Jul 2018'} />
                  <DetailRow label="Reporting Authority" value={officer.reportingAuthority || 'Principal Secretariat'} />
                  <DetailRow label="Data Security Level" value="Tier-1 Masked (PII Protected)" />
                </>
              )}
            </dl>

            {!isSuperAdminDashboard && <button
              className="dash-btn dash-btn-primary dash-info-btn"
              type="button"
              onClick={() => setIsDossierModalOpen(true)}
            >
              <span>View Institutional Dossier</span>
              <ChevronRight size={15} />
            </button>}
          </aside>

          {/* RIGHT: 2x2 Stats Grid (Matching Student 2x2 Stats Grid) */}
          <section className="dash-stats-2x2" aria-label="Operational Key Performance Metrics">
            {/* Card 1: tone-blue */}
            <article className="dash-stat tone-blue">
              <div className="dash-stat-head">
                <div className="dash-stat-head-left">
                  <span className="dash-stat-icon">
                    <C1Icon size={18} />
                  </span>
                  <span className="dash-stat-label">{c1.label}</span>
                </div>
                <span className="dash-stat-badge tone-blue-badge">{c1.badge}</span>
              </div>
              <div className="dash-stat-body">
                <strong className="dash-stat-value">{c1.val}</strong>
                <p className="dash-stat-desc">{c1.desc}</p>
              </div>
              <div className="dash-stat-foot">
                {c1.pills && c1.pills.map((pill, i) => (
                  <span key={i} className={`dash-stat-pill ${i === c1.pills.length - 1 ? 'tone-green-pill' : ''}`}>
                    {pill}
                  </span>
                ))}
              </div>
            </article>

            {/* Card 2: tone-green */}
            <article className="dash-stat tone-green">
              <div className="dash-stat-head">
                <div className="dash-stat-head-left">
                  <span className="dash-stat-icon">
                    <C2Icon size={18} />
                  </span>
                  <span className="dash-stat-label">{c2.label}</span>
                </div>
                <span className="dash-stat-badge tone-green-badge">{c2.badge}</span>
              </div>
              <div className="dash-stat-body">
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong className="dash-stat-value">{c2.val}</strong>
                  {c2.ratio && <span className="dash-stat-ratio">{c2.ratio}</span>}
                </div>
                {c2.pct && (
                  <div className="dash-progress" aria-hidden="true">
                    <i style={{ width: c2.pct }} />
                  </div>
                )}
              </div>
              <div className="dash-stat-foot">
                <small className="dash-stat-sub text-green">
                  <Check size={13} /> {c2.foot}
                </small>
              </div>
            </article>

            {/* Card 3: tone-violet */}
            <article className="dash-stat tone-violet">
              <div className="dash-stat-head">
                <div className="dash-stat-head-left">
                  <span className="dash-stat-icon">
                    <C3Icon size={18} />
                  </span>
                  <span className="dash-stat-label">{c3.label}</span>
                </div>
                <span className="dash-stat-badge tone-violet-badge">{c3.badge}</span>
              </div>
              <div className="dash-stat-body">
                <strong className="dash-stat-value">{c3.val}</strong>
                <p className="dash-stat-desc">{c3.desc}</p>
              </div>
              <div className="dash-stat-foot">
                <span className="dash-stat-sub">
                  <Info size={13} /> {c3.foot}
                </span>
              </div>
            </article>

            {/* Card 4: tone-amber */}
            <article className="dash-stat tone-amber">
              <div className="dash-stat-head">
                <div className="dash-stat-head-left">
                  <span className="dash-stat-icon">
                    <C4Icon size={18} />
                  </span>
                  <span className="dash-stat-label">{c4.label}</span>
                </div>
                <span className="dash-stat-badge tone-amber-badge">{c4.badge}</span>
              </div>
              <div className="dash-stat-body">
                <strong className="dash-stat-value">{c4.val}</strong>
                <p className="dash-stat-desc">{c4.desc}</p>
              </div>
              <div className="dash-stat-foot">
                <span className="dash-stat-sub">
                  <CalendarDays size={13} /> {c4.foot}
                </span>
              </div>
            </article>
          </section>
        </div>

        {/* ==========================================================
            D. DASHBOARD OVERVIEW: Dual Cards Grid (Overview + Notices)
            ========================================================== */}
        <div className="dash-grid-duo">
          {/* Left Card: Operational Summary Table */}
          <section className="dash-card" aria-label="Operational Summary">
            <header className="dash-card-head">
              <h3>
                <span className="dash-head-icon tone-blue">
                  <Layers size={15} />
                </span>
                {config.overviewTitle}
              </h3>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                Live Institutional Data
              </span>
            </header>

            <div className="role-overview-table-wrap">
              <table className="role-overview-table">
                <thead>
                  <tr>
                    {config.overviewColumns.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardOverviewItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.col1}</td>
                      <td>{item.col2}</td>
                      <td style={{ color: '#475569' }}>{item.col3}</td>
                      <td>
                        <span className={`role-status-badge ${item.badge}`}>{item.col4}</span>
                      </td>
                    </tr>
                  ))}
                  {dashboardOverviewItems.length === 0 && (
                    <tr><td colSpan={config.overviewColumns.length} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                      {isSuperAdminDashboard ? 'No backend diagnostics are currently available.' : 'No overview records are available.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Card: Institutional & Role Announcements */}
          <section className="dash-card" aria-label="Announcements & Notices">
            <header className="dash-card-head">
              <h3>
                <span className="dash-head-icon tone-amber">
                  <Megaphone size={15} />
                </span>
                {config.roleTitle} Circulars &amp; Notices
              </h3>
              <span className="dash-stat-badge tone-amber-badge">{isSuperAdminDashboard ? 'Backend notices' : 'Academic 2026'}</span>
            </header>

            <ul className="role-announcement-list">
              {config.announcements.map((item, idx) => (
                <li key={idx} className="role-announcement-item">
                  <div className="role-announcement-date">
                    <strong>{item.day}</strong>
                    <small>{item.month}</small>
                  </div>
                  <div className="role-announcement-content">
                    <div className="role-announcement-content-top">
                      <span className={`role-notif-tag ${item.tagTone}`}>{item.tag}</span>
                    </div>
                    <h4 className="role-announcement-title">{item.title}</h4>
                    <p className="role-announcement-desc">{item.desc}</p>
                  </div>
                </li>
              ))}
              {config.announcements.length === 0 && (
                <li className="role-announcement-item" style={{ padding: 20, color: '#64748b' }}>
                  {isSuperAdminDashboard ? 'No announcement feed is connected for this dashboard.' : 'No announcements are available.'}
                </li>
              )}
            </ul>
          </section>
        </div>

        {/* ==========================================================
            E. CALENDAR & HOLIDAY LIST: Side-by-Side Lower Grid
            Requires scroll to view, identical to Student Dashboard
            ========================================================== */}
        <div className="dash-grid-duo" style={{ marginTop: '20px' }}>
          {/* Calendar Card */}
          <section className="dash-card dash-calendar" id="calendar">
            <header className="dash-card-head">
              <h3>
                <span className="dash-head-icon tone-blue">
                  <CalendarDays size={15} />
                </span>
                Calendar
              </h3>
              <div className="dash-cal-controls">
                <button type="button" onClick={() => updateMonth(-1)} aria-label="Previous month">
                  <ChevronLeft size={15} />
                </button>
                <strong>{monthLabel}</strong>
                <button type="button" onClick={() => updateMonth(1)} aria-label="Next month">
                  <ChevronRight size={15} />
                </button>
              </div>
            </header>
            <div className="dash-cal-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="dash-cal-days">
              {calendarDays.map(({ key, day, inMonth, isToday, isSunday }) => {
                const holidayName = holidayMap[key];
                return (
                  <span
                    className={[
                      'dash-day',
                      inMonth ? '' : 'is-outside',
                      isToday ? 'is-today' : '',
                      holidayName ? 'is-holiday' : '',
                      isSunday ? 'is-sunday' : '',
                    ].filter(Boolean).join(' ')}
                    style={
                      isToday
                        ? {
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: '#ffffff',
                            fontWeight: 800,
                            boxShadow: '0 6px 14px -4px rgba(37, 99, 235, 0.75)',
                          }
                        : undefined
                    }
                    title={holidayName || undefined}
                    key={key}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
            <div className="dash-legend">
              <span><i className="lg-holiday" style={{ backgroundColor: '#fdba74' }} />Holiday</span>
              <span><i className="lg-sunday" style={{ backgroundColor: '#fda4af' }} />Sunday</span>
              <span><i className="lg-today" style={{ backgroundColor: '#2563eb' }} />Today</span>
            </div>
          </section>

          {/* Holiday List Card */}
          <section className="dash-card dash-holidays" id="holidays">
            <header className="dash-card-head">
              <h3>
                <span className="dash-head-icon tone-amber">
                  <PartyPopper size={15} />
                </span>
                Holiday List
              </h3>
              <div className="dash-holiday-controls">
                <div className="dash-holiday-filter-pills">
                  <button
                    type="button"
                    className={`dash-filter-pill ${holidayView === 'all' ? 'active' : ''}`}
                    onClick={() => setHolidayView('all')}
                  >
                    All 2026 ({holidayItems.length})
                  </button>
                  <button
                    type="button"
                    className={`dash-filter-pill ${holidayView === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setHolidayView('upcoming')}
                  >
                    Upcoming ({holidayItems.filter((h) => h.daysLeft >= 0).length})
                  </button>
                </div>
              </div>
            </header>
            <ul className="dash-holiday-list dash-holiday-scroll" aria-label="Official holidays 2026">
              {displayedHolidays.map((h) => (
                <li
                  className={`dash-holiday ${h.daysLeft < 0 ? 'is-past' : ''} ${nextHoliday && nextHoliday.raw === h.raw ? 'is-next' : ''}`}
                  key={h.raw}
                >
                  <span className="dash-holiday-date">
                    <strong>{h.date.getDate()}</strong>
                    <small>{h.date.toLocaleString('en-IN', { month: 'short' })}</small>
                  </span>
                  <span className="dash-holiday-info">
                    <strong>{h.name}</strong>
                    <small>{h.date.toLocaleString('en-IN', { weekday: 'long' })} · {h.raw}</small>
                  </span>
                  <span className="dash-holiday-badge">
                    {h.daysLeft < 0 ? 'Passed' : h.daysLeft === 0 ? 'Today' : h.daysLeft === 1 ? 'Tomorrow' : `in ${h.daysLeft}d`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <footer className="dash-footer">
          Apna Campus <span>·</span> {config.roleTitle} management portal <span>·</span> {currentTime.getFullYear()}
        </footer>
      </div>

      {/* ==========================================================
          LIGHTWEIGHT DASHBOARD SHORTCUT MODAL (Section 7)
          Dashboard shortcuts only — does not develop destination module
          ========================================================== */}
      {activeShortcutModal && (
        <div className="role-modal-overlay" onClick={() => setActiveShortcutModal(null)}>
          <div className="role-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="role-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <activeShortcutModal.icon size={18} color="#2563eb" />
                <h3>{activeShortcutModal.label}</h3>
              </div>
              <button
                type="button"
                className="role-notif-close"
                onClick={() => setActiveShortcutModal(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="role-modal-body">
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '10px', marginBottom: '14px', fontSize: '13px', color: '#1e40af', lineHeight: 1.5 }}>
                <strong>Phase 1 Dashboard Shortcut:</strong> This quick action provides high-level preview access for <strong>{config.roleTitle}</strong>. Full granular sub-modules will be expanded in Phase 2.
              </div>
              <p style={{ fontSize: '13.5px', color: '#334155', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                Current system status for <strong>{activeShortcutModal.label}</strong> is synchronized with active college databases.
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.6 }}>
                <li>Role authority: <strong>{config.roleTitle}</strong></li>
                <li>Designated officer: <strong>{officerDisplayName}</strong></li>
                <li>Audit status: <strong>Verified &amp; Logged</strong></li>
              </ul>
            </div>
            <div className="role-modal-footer">
              <button
                type="button"
                className="role-quick-action-pill"
                onClick={() => setActiveShortcutModal(null)}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="role-quick-action-pill active-action"
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab(activeShortcutModal.id);
                  }
                  setActiveShortcutModal(null);
                }}
              >
                Open Section Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          INSTITUTIONAL PROFILE DOSSIER MODAL (Full Multi-Section View)
          ========================================================== */}
      {isDossierModalOpen && (
        <div
          className="role-modal-overlay"
          onClick={() => setIsDossierModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${config.roleTitle} Institutional Profile Dossier`}
        >
          <div
            className="role-modal-card role-dossier-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal Header */}
            <div className="role-modal-header" style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4338ca, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                    Institutional Profile Dossier · {config.roleTitle}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                    BPUT Autonomous College Management System · Verified Employee Record
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="role-dossier-print-btn"
                  onClick={() => window.print()}
                  title="Print Official Dossier"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Printer size={14} />
                  <span>Print Dossier</span>
                </button>
                <button
                  type="button"
                  className="role-notif-close"
                  onClick={() => setIsDossierModalOpen(false)}
                  aria-label="Close Dossier"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '50%', width: '32px', height: '32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable with 3 organized sections */}
            <div className="role-modal-body" style={{ overflowY: 'auto', padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Cover Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '16px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="dash-passport-photo-frame" style={{ width: '80px', height: '104px', minWidth: '80px', maxHeight: '104px' }}>
                  {!photoError && officer.photo ? (
                    <img src={officer.photo} alt={officerDisplayName} className="dash-passport-img" onError={() => setPhotoError(true)} />
                  ) : (
                    <div className="dash-passport-fallback">
                      <UserRound size={36} color="#4338ca" />
                      <span className="dash-fallback-badge">{officer.id?.split('-')[0] || 'FAC'}</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', letterSpacing: '0.04em' }}>
                      {officer.employeeCode || officer.id}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                      Active Institutional Record
                    </span>
                  </div>
                  <h2 style={{ margin: '0 0 2px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                    {officerDisplayName}
                  </h2>
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#2563eb' }}>
                    {officer.designation} · {officer.department}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Specialization: <strong>{officer.specialization || 'Academic Excellence'}</strong> · Joined: <strong>{officer.dateOfJoining || '16 Jul 2018'}</strong>
                  </p>
                </div>
              </div>

              {/* Section 1: Core Institutional Profile */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={15} color="#2563eb" /> 1. Institutional &amp; Employment Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>{roleKey === 'faculty' ? 'Faculty ID' : 'Officer ID'}</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.id}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Employee Code</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.employeeCode || officer.id}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Designation</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.designation}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Department</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.department}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Official Email ID</dt>
                    <dd style={{ color: '#2563eb', fontWeight: 700, margin: 0 }}>{officer.email}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Mobile Number</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.phone}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Employment Type</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.employmentType || 'Full-Time Regular'}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Reporting Authority</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.reportingAuthority || 'Principal Secretariat'}</dd>
                  </div>
                </div>
              </div>

              {/* Section 2: Academic & Teaching Responsibilities */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={15} color="#2563eb" /> 2. Academic Summary &amp; Professional Duties
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Highest Qualification</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.qualification || 'Ph.D, M.Tech'}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Teaching / Experience</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.experience || '12+ Years'}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Academic Session</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.academicYear || '2026–2027'}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Assigned Subjects</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.assignedSubjects || 'Data Structures (CS501)'}</dd>
                  </div>
                  {officer.assignedSemester && (
                    <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <dt style={{ color: '#64748b', fontWeight: 600 }}>Assigned Semester</dt>
                      <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.assignedSemester}</dd>
                    </div>
                  )}
                  {officer.assignedSections && (
                    <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <dt style={{ color: '#64748b', fontWeight: 600 }}>Assigned Sections</dt>
                      <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.assignedSections}</dd>
                    </div>
                  )}
                  {officer.researchInterests && (
                    <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', gridColumn: '1 / -1' }}>
                      <dt style={{ color: '#64748b', fontWeight: 600 }}>Research Interests</dt>
                      <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0, textAlign: 'right' }}>{officer.researchInterests}</dd>
                    </div>
                  )}
                  {officer.assignedResponsibilities && (
                    <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', gridColumn: '1 / -1' }}>
                      <dt style={{ color: '#64748b', fontWeight: 600 }}>Operational Responsibilities</dt>
                      <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0, textAlign: 'right' }}>{officer.assignedResponsibilities}</dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Identity & Compliance (Masked Sensitive Identifiers) */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="#16a34a" /> 3. Institutional Identity &amp; Statutory Compliance
                </h4>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Identity Verification Confirmed:</strong> Biometric UID and statutory documents verified and sealed under institutional digital governance policy. PII masked per IT Act guidelines.
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Aadhaar Number (Masked)</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>{officer.maskedAadhaar || '•••• •••• 9821'}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Permanent Account Number (PAN)</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>{officer.maskedPan || '•••••542F'}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Biometric Punch UID</dt>
                    <dd style={{ color: '#0f172a', fontWeight: 700, margin: 0 }}>{officer.biometricId || `BIO-${officer.id}`}</dd>
                  </div>
                  <div className="student-detail-row" style={{ background: '#f8fafc', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <dt style={{ color: '#64748b', fontWeight: 600 }}>Official Verification Status</dt>
                    <dd style={{ color: '#059669', fontWeight: 700, margin: 0 }}>✓ Verified &amp; Certified</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="role-modal-footer" style={{ padding: '14px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                BPUT Autonomous ERP · Confidential Institutional Record
              </span>
              <button
                type="button"
                className="role-quick-action-pill active-action"
                onClick={() => setIsDossierModalOpen(false)}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
