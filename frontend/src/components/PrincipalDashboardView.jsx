import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  DollarSign,
  AlertCircle,
  Clock,
  Home,
  Wrench,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Filter,
  Download,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShieldAlert,
  Megaphone,
  Briefcase,
  FileCheck,
  Check,
  Award,
  Activity,
  Bed,
  Settings,
  Database,
  Send,
  Bus,
  School,
  FlaskConical,
  CreditCard,
  UserCheck,
  PartyPopper,
  MapPin,
  CalendarDays,
  CalendarCheck,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import './PrincipalDashboard.css';

// SVG mini sparkline wave generator
function SparklineWave({ color = '#2563eb' }) {
  return (
    <svg className="pdb-kpi-sparkline" viewBox="0 0 100 24" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0,18 Q15,4 30,14 T60,8 T90,16 L100,10 L100,24 L0,24 Z"
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <path
        d="M0,18 Q15,4 30,14 T60,8 T90,16 L100,10"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

export default function PrincipalDashboardView({ account, onNavigate }) {
  const [profileTab, setProfileTab] = useState('profile');
  const [selectedDept, setSelectedDept] = useState('All');
  const [calMonth, setCalMonth] = useState(new Date(2026, 9, 1)); // October 2026

  // Live ticking clock
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [currentTime]);

  const formattedClock = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  // 1. Department Student Strength
  const deptStrength = [
    { code: 'CSE', count: 620 },
    { code: 'ECE', count: 460 },
    { code: 'MECH', count: 420 },
    { code: 'CIVIL', count: 380 },
    { code: 'EE', count: 360 },
    { code: 'MBA', count: 300 },
    { code: 'BCA', count: 280 },
    { code: 'B.Sc', count: 220 },
  ];

  const filteredDeptStrength = selectedDept === 'All'
    ? deptStrength
    : deptStrength.filter(d => d.code === selectedDept);

  // 2. Program-wise Enrollment Donut Data
  const programEnrollment = [
    { name: 'B.Tech', count: 1120, pct: '45.0%', color: '#2563eb' },
    { name: 'BCA', count: 420, pct: '16.9%', color: '#0ea5e9' },
    { name: 'MBA', count: 280, pct: '11.2%', color: '#f59e0b' },
    { name: 'Diploma', count: 260, pct: '10.4%', color: '#8b5cf6' },
    { name: 'B.Sc', count: 210, pct: '8.5%', color: '#ec4899' },
    { name: 'Others', count: 200, pct: '8.0%', color: '#10b981' },
  ];

  // 3. Infrastructure & Facility Usage Data
  const facilityUsage = [
    { name: 'Classrooms', pct: 82, color: '#10b981' },
    { name: 'Laboratories', pct: 76, color: '#2563eb' },
    { name: 'Library', pct: 66, color: '#f59e0b' },
    { name: 'Hostel', pct: 94, color: '#8b5cf6' },
    { name: 'Canteen', pct: 88, color: '#eab308' },
    { name: 'Transport', pct: 91, color: '#f43f5e' },
  ];

  // 4. Departmental Academic Health Table
  const academicHealthTable = [
    { dept: 'Computer Science & Engineering', hod: 'Dr. P. K. Pattnaik', att: '95.8%', pass: '94.2%', cgpa: '8.42', status: 'Excellent', statusClass: 'excellent' },
    { dept: 'Electronics & Communication', hod: 'Dr. S. L. Mehta', att: '95.1%', pass: '92.4%', cgpa: '8.18', status: 'Good', statusClass: 'good' },
    { dept: 'Mechanical Engineering', hod: 'Dr. K. K.', att: '93.6%', pass: '89.6%', cgpa: '7.84', status: 'Good', statusClass: 'good' },
    { dept: 'Civil Engineering', hod: 'Dr. A. K. Nayak', att: '92.4%', pass: '88.1%', cgpa: '7.62', status: 'Satisfactory', statusClass: 'satisfactory' },
    { dept: 'Electrical Engineering', hod: 'Dr. M. R. Patil', att: '91.8%', pass: '86.3%', cgpa: '7.48', status: 'Satisfactory', statusClass: 'satisfactory' },
    { dept: 'Master of Business Admin.', hod: 'Dr. Neeta Verma', att: '90.6%', pass: '90.2%', cgpa: '8.06', status: 'Good', statusClass: 'good' },
    { dept: 'BCA Program', hod: 'Dr. T. T. Swain', att: '92.1%', pass: '88.5%', cgpa: '7.71', status: 'Good', statusClass: 'good' },
    { dept: 'Diploma Programs', hod: 'Dr. V. K. Singh', att: '89.8%', pass: '84.2%', cgpa: '7.20', status: 'Needs Attention', statusClass: 'attention' },
  ];

  // 5. Principal Circulars & Notices
  const principalNotices = [
    { day: '30', month: 'OCT', cat: 'EXAMINATION', catClass: 'exam', title: 'Mid-Semester Examination Schedule 2026', author: 'Published by Exam Cell', isNew: true, tab: 'examinations' },
    { day: '28', month: 'OCT', cat: 'ACADEMIC', catClass: 'academic', title: 'Faculty Duty Leave & Research Incentive Regulations', author: 'Published by Principal Office', tab: 'leaves' },
    { day: '24', month: 'OCT', cat: 'INFRASTRUCTURE', catClass: 'infra', title: 'Campus Infrastructure Development Plan Phase II', author: 'Published by Administration', tab: 'infrastructure' },
    { day: '22', month: 'OCT', cat: 'ACADEMIC', catClass: 'academic', title: 'Autonomous Curriculum Review Meeting', author: 'Published by Academic Council', tab: 'departments' },
    { day: '18', month: 'OCT', cat: 'EVENT', catClass: 'event', title: 'Annual Techno-Cultural Fest 2026', author: 'Published by Student Affairs', tab: 'calendar_events' },
  ];

  // 6. Upcoming Events
  const upcomingEvents = [
    { day: '02', month: 'NOV', title: 'Department Seminar', location: 'CSE Department', time: '10:00 AM - 12:00 PM', tag: 'Seminar', tagClass: 'seminar', tab: 'departments' },
    { day: '05', month: 'NOV', title: 'Parent-Teacher Meeting', location: 'Main Auditorium', time: '11:00 AM - 1:00 PM', tag: 'Meeting', tagClass: 'meeting', tab: 'calendar_events' },
    { day: '10', month: 'NOV', title: 'Cultural Fest 2026', location: 'Campus Ground', time: 'All Day', tag: 'Event', tagClass: 'event', tab: 'calendar_events' },
    { day: '15', month: 'NOV', title: 'Alumni Meet', location: 'Main Auditorium', time: '2:00 PM - 5:00 PM', tag: 'Alumni', tagClass: 'alumni', tab: 'calendar_events' },
  ];

  // 7. Holiday List
  const holidayList = [
    { day: '14', month: 'JAN', name: 'Makar Sankranti / Pongal', dateStr: 'Wednesday - 14-01-2026' },
    { day: '26', month: 'JAN', name: 'Republic Day', dateStr: 'Monday - 26-01-2026' },
    { day: '15', month: 'FEB', name: 'Maha Shivratri', dateStr: 'Sunday - 15-02-2026' },
    { day: '4', month: 'MAR', name: 'Dola Purnima / Holi Eve', dateStr: 'Wednesday - 04-03-2026' },
    { day: '5', month: 'MAR', name: 'Holi Festival', dateStr: 'Thursday - 05-03-2026' },
  ];

  // Calendar days for October 2026
  // October 2026: Oct 1 is Thursday. 31 days total.
  const calendarCells = useMemo(() => {
    // 42 cells grid
    // Days in Sep before: 27, 28, 29, 30 (Sunday to Wednesday)
    const cells = [];
    // Prev month padding (Sep 27-30)
    cells.push({ d: 27, other: true }, { d: 28, other: true }, { d: 29, other: true }, { d: 30, other: true });
    // Oct 1 to 31
    for (let i = 1; i <= 31; i++) {
      const isSun = (i + 4) % 7 === 1; // Oct 4, 11, 18, 25 are Sundays
      const isToday = i === 30; // 30 Oct
      const isEvent = i === 2; // Gandhi Jayanti
      const isFest = [14, 15, 16, 17, 20, 24].includes(i); // Fest/holidays
      cells.push({ d: i, other: false, isSun, isToday, isEvent, isFest });
    }
    // Next month padding (Nov 1-7)
    let nextD = 1;
    while (cells.length < 42) {
      cells.push({ d: nextD++, other: true });
    }
    return cells;
  }, []);

  return (
    <div className="pdb-root">
      {/* 1. HERO BANNER */}
      <section className="pdb-hero" aria-label="Principal Executive Banner">
        <div className="pdb-hero-content">
          <div className="pdb-hero-tag">PRINCIPAL DASHBOARD</div>
          <h1 className="pdb-hero-title">
            Good evening, Dr. Rajesh Kumar
            <span className="pdb-hero-wave" role="img" aria-label="Hand Wave">✋</span>
          </h1>
          <p className="pdb-hero-desc">
            Oversee academic excellence, institutional growth, and overall campus administration.
          </p>

          <div className="pdb-hero-message-ribbon">
            <span className="pdb-hero-message-badge">Message of the Day</span>
            <span>Mid-Semester Examination schedule has been released. Ensure department readiness.</span>
          </div>
        </div>

        <div className="pdb-hero-right">
          <div className="pdb-hero-timebox">
            <div className="pdb-hero-academic-year">ACADEMIC YEAR 2026-27</div>
            <div className="pdb-hero-time-row">
              <Calendar size={14} color="#93c5fd" />
              <span>{formattedDate}</span>
            </div>
            <div className="pdb-hero-time-row time-clock">
              <Clock size={14} color="#60a5fa" />
              <span>{formattedClock}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KPI METRIC CARDS (6-column row with sparkline waves) */}
      <section className="pdb-kpi-grid" aria-label="Institutional KPIs">
        {/* Students */}
        <div className="pdb-kpi-card" onClick={() => onNavigate('academic_health')} title="View Enrolled Students">
          <div className="pdb-kpi-top">
            <div className="pdb-kpi-icon-wrap students">
              <Users size={20} />
            </div>
            <div className="pdb-kpi-label">Students</div>
          </div>
          <div className="pdb-kpi-val-row">
            <span className="pdb-kpi-val">2,480</span>
            <span className="pdb-kpi-pill green">↑ 5%</span>
          </div>
          <div className="pdb-kpi-sub">+112 this semester</div>
          <SparklineWave color="#0284c7" />
        </div>

        {/* Faculty */}
        <div className="pdb-kpi-card" onClick={() => onNavigate('faculty_staff')} title="View Faculty & Staff">
          <div className="pdb-kpi-top">
            <div className="pdb-kpi-icon-wrap faculty">
              <GraduationCap size={20} />
            </div>
            <div className="pdb-kpi-label">Faculty</div>
          </div>
          <div className="pdb-kpi-val-row">
            <span className="pdb-kpi-val">160</span>
            <span className="pdb-kpi-pill green">↑ 3%</span>
          </div>
          <div className="pdb-kpi-sub">+6 new this month</div>
          <SparklineWave color="#9333ea" />
        </div>

        {/* Departments */}
        <div className="pdb-kpi-card" onClick={() => onNavigate('departments')} title="View Autonomous Departments">
          <div className="pdb-kpi-top">
            <div className="pdb-kpi-icon-wrap depts">
              <Building2 size={20} />
            </div>
            <div className="pdb-kpi-label">Departments</div>
          </div>
          <div className="pdb-kpi-val-row">
            <span className="pdb-kpi-val">12</span>
            <span className="pdb-kpi-pill grey">— 0%</span>
          </div>
          <div className="pdb-kpi-sub">Active programs</div>
          <SparklineWave color="#16a34a" />
        </div>

        {/* Programs / Courses */}
        <div className="pdb-kpi-card" onClick={() => onNavigate('departments')} title="View Degree Programs">
          <div className="pdb-kpi-top">
            <div className="pdb-kpi-icon-wrap programs">
              <BookOpen size={20} />
            </div>
            <div className="pdb-kpi-label">Programs/Courses</div>
          </div>
          <div className="pdb-kpi-val-row">
            <span className="pdb-kpi-val">87</span>
            <span className="pdb-kpi-pill green">↑ 4%</span>
          </div>
          <div className="pdb-kpi-sub">Across all departments</div>
          <SparklineWave color="#e11d48" />
        </div>

        {/* Research Projects */}
        <div className="pdb-kpi-card" onClick={() => onNavigate('accreditation')} title="View R&D Projects">
          <div className="pdb-kpi-top">
            <div className="pdb-kpi-icon-wrap research">
              <Award size={20} />
            </div>
            <div className="pdb-kpi-label">Research Projects</div>
          </div>
          <div className="pdb-kpi-val-row">
            <span className="pdb-kpi-val">36</span>
            <span className="pdb-kpi-pill green">↑ 9%</span>
          </div>
          <div className="pdb-kpi-sub">Funded &amp; ongoing</div>
          <SparklineWave color="#d97706" />
        </div>

        {/* Total Revenue */}
        <div className="pdb-kpi-card" onClick={() => onNavigate('finance')} title="View Financial Overview">
          <div className="pdb-kpi-top">
            <div className="pdb-kpi-icon-wrap revenue">
              <DollarSign size={20} />
            </div>
            <div className="pdb-kpi-label">Total Revenue</div>
          </div>
          <div className="pdb-kpi-val-row">
            <span className="pdb-kpi-val">₹ 22.60 Cr</span>
            <span className="pdb-kpi-pill green">↑ 8%</span>
          </div>
          <div className="pdb-kpi-sub">This academic year</div>
          <SparklineWave color="#dc2626" />
        </div>
      </section>

      {/* 3. ROW 2: EXECUTIVE PROFILE DOSSIER + ACADEMIC & GOVERNANCE KPIS */}
      <section className="pdb-profile-grid" aria-label="Executive Profile & Core Metrics">
        {/* Left: Principal Profile & Institutional Dossier */}
        <div className="pdb-card">
          <div className="pdb-profile-header">
            <img
              src="/principal_avatar.jpg"
              alt="Dr. Rajesh Kumar"
              className="pdb-profile-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
            <div className="pdb-profile-meta">
              <h3 className="pdb-profile-name">Dr. Rajesh Kumar</h3>
              <p className="pdb-profile-role">Principal &amp; Autonomous Campus Director</p>
              <p className="pdb-profile-role" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Office of the Principal</p>
            </div>
            <span className="pdb-profile-badge">● Active</span>
          </div>

          <div className="pdb-profile-tabs">
            <button
              type="button"
              className={`pdb-profile-tab ${profileTab === 'profile' ? 'active' : ''}`}
              onClick={() => setProfileTab('profile')}
            >
              Profile
            </button>
            <button
              type="button"
              className={`pdb-profile-tab ${profileTab === 'dossier' ? 'active' : ''}`}
              onClick={() => setProfileTab('dossier')}
            >
              Professional Dossier
            </button>
            <button
              type="button"
              className={`pdb-profile-tab ${profileTab === 'identity' ? 'active' : ''}`}
              onClick={() => setProfileTab('identity')}
            >
              Identity &amp; Access
            </button>
          </div>

          <div className="pdb-profile-table">
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Officer ID</span>
              <span className="pdb-profile-val">OFF-PRIN-01</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Employee Code</span>
              <span className="pdb-profile-val">EMP-PRIN-001</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Full Name</span>
              <span className="pdb-profile-val">Dr. Rajesh Kumar</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Designation</span>
              <span className="pdb-profile-val">Principal &amp; Campus Director</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Department</span>
              <span className="pdb-profile-val">Office of the Principal</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Specialization</span>
              <span className="pdb-profile-val">Fluid Dynamics &amp; Edu. Admin</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Official Email</span>
              <span className="pdb-profile-val">principal@apnacampus.edu.in</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Mobile Number</span>
              <span className="pdb-profile-val">+91 94370 00000</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Employment Type</span>
              <span className="pdb-profile-val">Full-Time Regular (Tenured)</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Date of Joining</span>
              <span className="pdb-profile-val">04 Jul 2015</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Employment Status</span>
              <span className="pdb-profile-val">Active - Executive Head</span>
            </div>
            <div className="pdb-profile-row">
              <span className="pdb-profile-label">Reporting Authority</span>
              <span className="pdb-profile-val">Governing Council</span>
            </div>
          </div>

          <button
            type="button"
            className="pdb-profile-btn"
            onClick={() => onNavigate('accreditation')}
          >
            <span>View Institutional Dossier</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Middle Stack: Total Student Body + Academic Performance */}
        <div className="pdb-subcard-stack">
          {/* Card: Total Student Body */}
          <div className="pdb-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div className="pdb-kpi-icon-wrap students" style={{ width: 32, height: 32 }}>
                <Users size={16} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Total Student Body</span>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              2,480
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              18 Programs across Engineering &amp; Tech
            </div>

            <div className="pdb-mini-pill-row">
              <span className="pdb-mini-pill">4 Schools</span>
              <span className="pdb-mini-pill">5 UG</span>
              <span className="pdb-mini-pill">6 PG</span>
              <span className="pdb-mini-pill">2 Diploma</span>
              <span className="pdb-mini-pill">1 PhD</span>
            </div>
          </div>

          {/* Card: Academic Performance */}
          <div className="pdb-card" style={{ padding: '16px' }}>
            <div className="pdb-card-header" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="#8b5cf6" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Academic Performance</span>
              </div>
              <select className="pdb-select" defaultValue="Odd Sem 2026" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                <option value="Odd Sem 2026">Odd Sem 2026</option>
              </select>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              8.14
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Institutional Pass Rate: <strong style={{ color: '#16a34a' }}>94.2%</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>94.2%</div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Pass Rate</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>8.21</div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Avg. CGPA</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>12</div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Top Performers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stack: Faculty Attendance + Pending Executive Approvals */}
        <div className="pdb-subcard-stack">
          {/* Card: Faculty Attendance */}
          <div className="pdb-card" style={{ padding: '16px' }}>
            <div className="pdb-card-header" style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="#16a34a" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Faculty Attendance (Today)</span>
              </div>
              <span className="pdb-status-pill excellent" style={{ fontSize: '0.66rem' }}>Present 154 / 160</span>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '4px' }}>
              96.2%
            </div>

            <div className="pdb-att-bar-wrap">
              <div className="pdb-att-bar-fill" style={{ width: '96.2%' }} />
              <div className="pdb-att-bar-absent" style={{ width: '3.8%' }} />
            </div>

            <div className="pdb-att-legend-row">
              <span style={{ color: '#16a34a' }}>● 154 Present</span>
              <span style={{ color: '#d97706' }}>● 4 On Leave</span>
              <span style={{ color: '#ef4444' }}>● 2 Absent</span>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
              ✓ 5 on sanctioned duty leave / FDP
            </div>
          </div>

          {/* Card: Pending Executive Approvals */}
          <div className="pdb-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Clock size={16} color="#d97706" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Pending Executive Approvals</span>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', letterSpacing: '-0.02em' }}>
              05 Items
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>
              3 Faculty leave requests · 2 Event clearances
            </div>

            <div className="pdb-approval-row" onClick={() => onNavigate('leaves')} title="Review Faculty Leave Requests">
              <div className="pdb-approval-label">
                <FileCheck size={15} color="#16a34a" />
                <span>Faculty Leave Requests</span>
              </div>
              <span className="pdb-approval-count">3 <ChevronRight size={14} /></span>
            </div>

            <div className="pdb-approval-row" onClick={() => onNavigate('calendar_events')} title="Review Event & Seminar Approvals">
              <div className="pdb-approval-label">
                <PartyPopper size={15} color="#d97706" />
                <span>Event &amp; Seminar Approvals</span>
              </div>
              <span className="pdb-approval-count">1 <ChevronRight size={14} /></span>
            </div>

            <div className="pdb-approval-row" onClick={() => onNavigate('infrastructure')} title="Review Infrastructure Proposals">
              <div className="pdb-approval-label">
                <Building2 size={15} color="#dc2626" />
                <span>Infrastructure Proposals</span>
              </div>
              <span className="pdb-approval-count">1 <ChevronRight size={14} /></span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ROW 3: 3-COLUMN CHARTS */}
      <section className="pdb-three-grid" aria-label="Academic Strength & Facilities Usage">
        {/* Card 1: Department-wise Student Strength */}
        <div className="pdb-card">
          <div className="pdb-card-header">
            <h3 className="pdb-card-title">
              <BarChart2 size={18} />
              Department-wise Student Strength
            </h3>
            <select
              className="pdb-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter Department"
            >
              <option value="All">All Departments</option>
              {deptStrength.map(d => (
                <option key={d.code} value={d.code}>{d.code}</option>
              ))}
            </select>
          </div>

          <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDeptStrength} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} Students`, 'Enrolled']}
                  contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Program-wise Enrollment Donut */}
        <div className="pdb-card">
          <div className="pdb-card-header">
            <h3 className="pdb-card-title">
              <GraduationCap size={18} />
              Program-wise Enrollment
            </h3>
            <select className="pdb-select" defaultValue="Academic Year 2026-27">
              <option value="Academic Year 2026-27">Academic Year 2026-27</option>
            </select>
          </div>

          <div className="pdb-donut-container">
            <div className="pdb-donut-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programEnrollment}
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {programEnrollment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Students`, name]}
                    contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pdb-donut-center">
                <div className="pdb-donut-center-val">2,480</div>
                <div className="pdb-donut-center-lbl">Students</div>
              </div>
            </div>

            <div className="pdb-donut-legend">
              {programEnrollment.map(item => (
                <div key={item.name} className="pdb-donut-row">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="pdb-donut-dot" style={{ background: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="pdb-donut-count">{item.count.toLocaleString()} ({item.pct})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Infrastructure & Facility Usage */}
        <div className="pdb-card">
          <div className="pdb-card-header">
            <h3 className="pdb-card-title">
              <Building2 size={18} />
              Infrastructure &amp; Facility Usage
            </h3>
            <select className="pdb-select" defaultValue="This Month">
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="pdb-facility-list">
            {facilityUsage.map(fac => (
              <div key={fac.name} className="pdb-facility-row">
                <div className="pdb-facility-meta">
                  <span>{fac.name}</span>
                  <span style={{ fontWeight: 800, color: fac.color }}>{fac.pct}%</span>
                </div>
                <div className="pdb-facility-bar-bg">
                  <div
                    className="pdb-facility-bar-fill"
                    style={{ width: `${fac.pct}%`, background: fac.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ROW 4: DEPARTMENTAL HEALTH TABLE + NOTICES */}
      <section className="pdb-table-notices-grid" aria-label="Academic Health and Official Circulars">
        {/* Left: Departmental Academic Health & Results Overview */}
        <div className="pdb-card">
          <div className="pdb-card-header">
            <h3 className="pdb-card-title">
              <Award size={18} />
              Departmental Academic Health &amp; Results Overview
            </h3>
            <select className="pdb-select" defaultValue="Odd Sem 2026">
              <option value="Odd Sem 2026">Odd Sem 2026</option>
            </select>
          </div>

          <div className="pdb-table-container">
            <table className="pdb-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>HOD</th>
                  <th>Faculty Attendance</th>
                  <th>Pass Rate</th>
                  <th>Avg CGPA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {academicHealthTable.map(row => (
                  <tr key={row.dept}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.dept}</td>
                    <td style={{ color: '#475569' }}>{row.hod}</td>
                    <td style={{ fontWeight: 600 }}>{row.att}</td>
                    <td style={{ fontWeight: 600 }}>{row.pass}</td>
                    <td style={{ fontWeight: 800, color: row.statusClass === 'attention' ? '#dc2626' : (row.statusClass === 'satisfactory' ? '#d97706' : '#16a34a') }}>
                      {row.cgpa}
                    </td>
                    <td>
                      <span className={`pdb-status-pill ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Principal Circulars & Notices */}
        <div className="pdb-card">
          <div className="pdb-card-header">
            <h3 className="pdb-card-title">
              <Megaphone size={18} />
              Principal Circulars &amp; Notices
            </h3>
            <button
              className="pdb-card-link"
              onClick={() => onNavigate('notices')}
              title="View All Notices"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="pdb-notice-list">
            {principalNotices.map(notice => (
              <div
                key={notice.title}
                className="pdb-notice-item"
                onClick={() => onNavigate(notice.tab)}
                title={`Open notice: ${notice.title}`}
              >
                <div className="pdb-notice-left">
                  <div className="pdb-notice-datebox">
                    <span className="pdb-notice-day">{notice.day}</span>
                    <span className="pdb-notice-month">{notice.month}</span>
                  </div>
                  <div className="pdb-notice-info">
                    <span className={`pdb-notice-cat ${notice.catClass}`}>{notice.cat}</span>
                    <span className="pdb-notice-title">{notice.title}</span>
                    <span className="pdb-notice-meta">{notice.author}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {notice.isNew && (
                    <span className="pdb-status-pill attention" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>New</span>
                  )}
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ROW 5: CALENDAR + UPCOMING EVENTS + HOLIDAYS */}
      <section className="pdb-calendar-grid" aria-label="Academic Schedules and Dates">
        {/* Column 1: Academic Calendar */}
        <div className="pdb-card">
          <div className="pdb-cal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#2563eb" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Academic Calendar</span>
            </div>
            <div className="pdb-cal-nav">
              <button
                type="button"
                className="pdb-cal-btn"
                onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                aria-label="Previous Month"
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>October 2026</span>
              <button
                type="button"
                className="pdb-cal-btn"
                onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                aria-label="Next Month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="pdb-cal-grid">
            <div className="pdb-cal-dow sun">SUN</div>
            <div className="pdb-cal-dow">MON</div>
            <div className="pdb-cal-dow">TUE</div>
            <div className="pdb-cal-dow">WED</div>
            <div className="pdb-cal-dow">THU</div>
            <div className="pdb-cal-dow">FRI</div>
            <div className="pdb-cal-dow">SAT</div>

            {calendarCells.map((cell, idx) => {
              let cellClass = 'pdb-cal-cell';
              if (cell.other) cellClass += ' other-month';
              else if (cell.isToday) cellClass += ' today';
              else if (cell.isEvent) cellClass += ' event-day';
              else if (cell.isFest) cellClass += ' fest-day';
              else if (cell.isSun) cellClass += ' sunday';

              return (
                <div key={idx} className={cellClass}>
                  {cell.d}
                </div>
              );
            })}
          </div>

          <div className="pdb-cal-legend">
            <span><span style={{ color: '#d97706' }}>●</span> Holiday</span>
            <span><span style={{ color: '#ef4444' }}>●</span> Sunday</span>
            <span><span style={{ color: '#2563eb' }}>●</span> Today</span>
            <span><span style={{ color: '#8b5cf6' }}>●</span> Event</span>
          </div>
        </div>

        {/* Column 2: Upcoming Events */}
        <div className="pdb-card">
          <div className="pdb-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} color="#8b5cf6" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Upcoming Events</span>
            </div>
            <button
              className="pdb-card-link"
              onClick={() => onNavigate('calendar_events')}
              title="View All Events"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div>
            {upcomingEvents.map(evt => (
              <div
                key={evt.title}
                className="pdb-list-item"
                onClick={() => onNavigate(evt.tab)}
                title={`Open event details: ${evt.title}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={`pdb-badge-date ${evt.tagClass}`}>
                    <span className="pdb-badge-day">{evt.day}</span>
                    <span className="pdb-badge-month">{evt.month}</span>
                  </div>
                  <div className="pdb-list-info">
                    <span className="pdb-list-title">{evt.title}</span>
                    <span className="pdb-list-sub">{evt.location} · {evt.time}</span>
                  </div>
                </div>
                <span className={`pdb-list-tag ${evt.tagClass}`}>
                  {evt.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Holiday List */}
        <div className="pdb-card">
          <div className="pdb-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarCheck size={18} color="#16a34a" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Holiday List</span>
            </div>
            <select className="pdb-select" defaultValue="All 2026 (29)">
              <option value="All 2026 (29)">All 2026 (29)</option>
            </select>
          </div>

          <div>
            {holidayList.map(hol => (
              <div
                key={hol.name}
                className="pdb-list-item"
                onClick={() => onNavigate('calendar_events')}
                title={`Holiday: ${hol.name}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="pdb-badge-date blue">
                    <span className="pdb-badge-day">{hol.day}</span>
                    <span className="pdb-badge-month">{hol.month}</span>
                  </div>
                  <div className="pdb-list-info">
                    <span className="pdb-list-title">{hol.name}</span>
                    <span className="pdb-list-sub">{hol.dateStr}</span>
                  </div>
                </div>
                <span className="pdb-list-tag holiday">Holiday</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

