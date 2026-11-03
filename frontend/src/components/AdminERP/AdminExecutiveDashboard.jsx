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
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../../services/api';
import './AdminExecutiveDashboard.css';

// Chart Colors & Palettes
const DONUT_COLORS = ['#2563eb', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];

export default function AdminExecutiveDashboard({ onNavigate, account }) {
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('By Program');
  const [usageWindow, setUsageWindow] = useState('Last 30 Days');
  const [approvalTab, setApprovalTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      year: 'numeric'
    });
  }, [currentTime]);

  const formattedClock = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, [currentTime]);

  // Live backend states
  const [metrics, setMetrics] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [circulars, setCirculars] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, approvalsRes, circularsRes] = await Promise.allSettled([
        api.getAdminMetrics(),
        api.getAdminApprovals ? api.getAdminApprovals() : Promise.resolve({ data: [] }),
        api.getAdminGovernanceCirculars ? api.getAdminGovernanceCirculars() : Promise.resolve({ data: [] }),
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value?.data) {
        setMetrics(metricsRes.value.data);
      }
      if (approvalsRes.status === 'fulfilled' && Array.isArray(approvalsRes.value?.data)) {
        setApprovals(approvalsRes.value.data);
      }
      if (circularsRes.status === 'fulfilled' && Array.isArray(circularsRes.value?.data)) {
        setCirculars(circularsRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [academicYear]);

  // Primary Metrics
  const totalStudents = metrics?.totalStudents || 2480;
  const totalFaculty = metrics?.totalFaculty || 218;
  const totalStaff = metrics?.totalStaff || 146;
  const activeCourses = metrics?.activeCourses || 56;
  const totalRevenueCr = metrics?.totalRevenueCr || '3.69';
  const systemUptime = metrics?.systemUptime || '99.98%';

  // 1. Departmental Enrollment & Faculty Distribution Data
  const departmentalData = [
    { code: 'CSE', name: 'Computer Science', students: 620, faculty: 48 },
    { code: 'ECE', name: 'Electronics & Comm', students: 480, faculty: 42 },
    { code: 'MECH', name: 'Mechanical Engg', students: 420, faculty: 38 },
    { code: 'CIVIL', name: 'Civil Engg', students: 380, faculty: 34 },
    { code: 'EE', name: 'Electrical Engg', students: 340, faculty: 30 },
    { code: 'MBA', name: 'Business Admin', students: 300, faculty: 26 },
    { code: 'BCA', name: 'Computer Applications', students: 260, faculty: 24 },
    { code: 'BSc', name: 'Basic Sciences', students: 220, faculty: 20 },
    { code: 'Diploma', name: 'Polytechnic Diploma', students: 180, faculty: 16 },
  ];

  const filteredDeptData = selectedDept === 'All'
    ? departmentalData
    : departmentalData.filter(d => d.code === selectedDept);

  // 2. Revenue & Expenditure Overview Data
  const financialData = [
    { month: 'Apr', feeCollection: 48, hostelFees: 18, otherIncome: 8, expenditure: 32 },
    { month: 'May', feeCollection: 54, hostelFees: 20, otherIncome: 10, expenditure: 35 },
    { month: 'Jun', feeCollection: 62, hostelFees: 22, otherIncome: 11, expenditure: 40 },
    { month: 'Jul', feeCollection: 78, hostelFees: 26, otherIncome: 14, expenditure: 46 },
    { month: 'Aug', feeCollection: 88, hostelFees: 29, otherIncome: 16, expenditure: 52 },
    { month: 'Sep', feeCollection: 95, hostelFees: 32, otherIncome: 18, expenditure: 58 },
    { month: 'Oct', feeCollection: 112, hostelFees: 36, otherIncome: 22, expenditure: 65 },
  ];

  // 3. Student Distribution by Program
  const programDistribution = [
    { name: 'B.Tech', count: 1520, pct: '61.3%', color: '#2563eb' },
    { name: 'BCA', count: 320, pct: '13.0%', color: '#06b6d4' },
    { name: 'MBA', count: 280, pct: '11.4%', color: '#f59e0b' },
    { name: 'Diploma', count: 210, pct: '8.5%', color: '#8b5cf6' },
    { name: 'B.Sc', count: 100, pct: '4.0%', color: '#ec4899' },
    { name: 'Others', count: 50, pct: '2.3%', color: '#10b981' },
  ];

  // 4. Pending Approvals & Action Items Data
  const approvalItems = [
    {
      id: '#ADM-2026-1021',
      category: 'admissions',
      title: 'New Admission Approval',
      detail: 'B.Tech CSE - Riya Sharma',
      time: '2 hours ago',
      color: 'red',
      targetTab: 'students',
    },
    {
      id: '#FEE-2026-0874',
      category: 'fees',
      title: 'Fee Concession Request',
      detail: 'Rahul Verma - Financial Aid',
      time: '4 hours ago',
      color: 'amber',
      targetTab: 'accounts-fees',
    },
    {
      id: '#LEAVE-2026-0312',
      category: 'leaves',
      title: 'Faculty Leave Application',
      detail: 'Dr. Neha Singh (CSE)',
      time: '5 hours ago',
      color: 'green',
      targetTab: 'hr-workforce',
    },
    {
      id: '#CERT-2026-0145',
      category: 'certificates',
      title: 'Bonafide Certificate Request',
      detail: 'Aman Kumar (MECH)',
      time: '6 hours ago',
      color: 'purple',
      targetTab: 'documents',
    },
    {
      id: '#HOSTEL-2026-0087',
      category: 'others',
      title: 'Hostel Room Allotment',
      detail: 'First Year - Block B',
      time: '1 day ago',
      color: 'blue',
      targetTab: 'wardens',
    },
  ];

  const filteredApprovals = approvalTab === 'all'
    ? approvalItems
    : approvalItems.filter(item => {
      if (approvalTab === 'admissions') return item.category === 'admissions';
      if (approvalTab === 'fees') return item.category === 'fees';
      if (approvalTab === 'leaves') return item.category === 'leaves';
      if (approvalTab === 'certificates') return item.category === 'certificates';
      if (approvalTab === 'others') return item.category === 'others';
      return true;
    });

  // 5. System Usage Analytics Data
  const systemUsageData = [
    { date: '1 Oct', students: 850, faculty: 340, staff: 190, parents: 110 },
    { date: '5 Oct', students: 1120, faculty: 480, staff: 260, parents: 140 },
    { date: '10 Oct', students: 1380, faculty: 560, staff: 290, parents: 210 },
    { date: '15 Oct', students: 1190, faculty: 520, staff: 280, parents: 180 },
    { date: '20 Oct', students: 1650, faculty: 690, staff: 350, parents: 290 },
    { date: '25 Oct', students: 1280, faculty: 580, staff: 310, parents: 220 },
    { date: '30 Oct', students: 1540, faculty: 630, staff: 330, parents: 270 },
  ];

  // 6. Recent Notices & Circulars Data
  const noticeItems = [
    {
      day: '30',
      month: 'OCT',
      title: 'Mid Semester Examination Schedule',
      publisher: 'Published by Exam Cell',
      category: 'Exam',
      tagClass: 'exam',
      targetTab: 'exam-cell',
    },
    {
      day: '28',
      month: 'OCT',
      title: 'Scholarship Applications Open',
      publisher: 'Published by Academic Office',
      category: 'Scholarship',
      tagClass: 'scholarship',
      targetTab: 'accounts-fees',
    },
    {
      day: '26',
      month: 'OCT',
      title: 'Campus Placement Drive by TCS',
      publisher: 'Published by Placement Cell',
      category: 'Placement',
      tagClass: 'placement',
      targetTab: 'placements',
    },
    {
      day: '24',
      month: 'OCT',
      title: 'Library Timings Updated',
      publisher: 'Published by Library',
      category: 'Library',
      tagClass: 'library',
      targetTab: 'documents',
    },
    {
      day: '22',
      month: 'OCT',
      title: 'Holi Festival Holiday Notice',
      publisher: 'Published by Administration',
      category: 'Holiday',
      tagClass: 'holiday',
      targetTab: 'notification-center',
    },
  ];

  // 7. Institution Infrastructure Status
  const infraItems = [
    { label: 'Academic Blocks', count: '6', status: 'Operational', isGood: true, color: 'blue', icon: Building2 },
    { label: 'Classrooms', count: '124', status: 'Operational', isGood: true, color: 'green', icon: School },
    { label: 'Laboratories', count: '28', status: 'Operational', isGood: true, color: 'purple', icon: FlaskConical },
    { label: 'Hostel Blocks', count: '4', status: 'Operational', isGood: true, color: 'red', icon: Bed },
    { label: 'Library', count: '1', status: 'Operational', isGood: true, color: 'pink', icon: BookOpen },
    { label: 'Transport Fleet', count: '12', status: '2 Under Maintenance', isGood: false, color: 'amber', icon: Bus },
  ];

  // 8. Quick Actions
  const quickActions = [
    { label: 'Add User', icon: Users, color: 'blue', tab: 'user-accounts' },
    { label: 'Generate Report', icon: FileText, color: 'green', tab: 'report-generation' },
    { label: 'Fee Overview', icon: CreditCard, color: 'orange', tab: 'accounts-fees' },
    { label: 'Send Notice', icon: Send, color: 'purple', tab: 'notification-center' },
    { label: 'Backup System', icon: Database, color: 'red', tab: 'system-diagnostics' },
    { label: 'System Settings', icon: Settings, color: 'grey', tab: 'settings' },
  ];

  return (
    <div className="aed-root">
      {/* 1. HERO BANNER */}
      <section className="aed-hero" aria-label="Institutional Governance Banner">
        <div className="aed-hero-content">
          <h1 className="aed-hero-title">
            Institutional Governance &amp; Executive Command
            <span className="aed-hero-crown" role="img" aria-label="Crown">👑</span>
          </h1>
          <p className="aed-hero-desc">
            Real-time monitoring of academic, administrative, financial and operational activities across all departments.
          </p>
        </div>

        <div className="aed-hero-right">
          <div className="aed-hero-timebox">
            <div className="aed-hero-time-row">
              <Calendar size={14} color="#93c5fd" />
              <span>{formattedDate}</span>
            </div>
            <div className="aed-hero-time-row time-clock">
              <Clock size={14} color="#60a5fa" />
              <span>{formattedClock}</span>
            </div>
          </div>

          <div className="aed-hero-badges">
            <div className="aed-hero-badge">
              <span className="status-dot" />
              <span>Operational</span>
            </div>
            <div className="aed-hero-badge">
              <ShieldCheck size={12} color="#60a5fa" />
              <span>NAAC A++ Autonomous</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KPI METRIC CARDS (6-column row) */}
      <section className="aed-kpi-grid" aria-label="Key Performance Indicators">
        {/* Total Students */}
        <div className="aed-kpi-card" onClick={() => onNavigate('students')} title="View Enrolled Students">
          <div className="aed-kpi-icon-wrap students">
            <Users size={22} />
          </div>
          <div className="aed-kpi-body">
            <div className="aed-kpi-label">Total Students</div>
            <div className="aed-kpi-val-row">
              <span className="aed-kpi-val">{totalStudents.toLocaleString()}</span>
              <span className="aed-kpi-pill">↑ 5%</span>
            </div>
            <div className="aed-kpi-sub">+112 this semester</div>
          </div>
        </div>

        {/* Total Faculty */}
        <div className="aed-kpi-card" onClick={() => onNavigate('faculty')} title="View Faculty Directory">
          <div className="aed-kpi-icon-wrap faculty">
            <GraduationCap size={22} />
          </div>
          <div className="aed-kpi-body">
            <div className="aed-kpi-label">Total Faculty</div>
            <div className="aed-kpi-val-row">
              <span className="aed-kpi-val">{totalFaculty}</span>
              <span className="aed-kpi-pill">↑ 2%</span>
            </div>
            <div className="aed-kpi-sub">4 new this month</div>
          </div>
        </div>

        {/* Total Staff */}
        <div className="aed-kpi-card" onClick={() => onNavigate('hr-workforce')} title="View Staff Management">
          <div className="aed-kpi-icon-wrap staff">
            <Briefcase size={22} />
          </div>
          <div className="aed-kpi-body">
            <div className="aed-kpi-label">Total Staff</div>
            <div className="aed-kpi-val-row">
              <span className="aed-kpi-val">{totalStaff}</span>
              <span className="aed-kpi-pill">↑ 1%</span>
            </div>
            <div className="aed-kpi-sub">4 new this month</div>
          </div>
        </div>

        {/* Active Courses */}
        <div className="aed-kpi-card" onClick={() => onNavigate('subjects')} title="View Course Catalog">
          <div className="aed-kpi-icon-wrap courses">
            <BookOpen size={22} />
          </div>
          <div className="aed-kpi-body">
            <div className="aed-kpi-label">Active Courses</div>
            <div className="aed-kpi-val-row">
              <span className="aed-kpi-val">{activeCourses}</span>
              <span className="aed-kpi-pill">↑ 3%</span>
            </div>
            <div className="aed-kpi-sub">8 departments</div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="aed-kpi-card" onClick={() => onNavigate('accounts-fees')} title="View Fee & Financial Reports">
          <div className="aed-kpi-icon-wrap revenue">
            <DollarSign size={22} />
          </div>
          <div className="aed-kpi-body">
            <div className="aed-kpi-label">Total Revenue</div>
            <div className="aed-kpi-val-row">
              <span className="aed-kpi-val">₹ {totalRevenueCr} Cr</span>
              <span className="aed-kpi-pill">↑ 8%</span>
            </div>
            <div className="aed-kpi-sub">This academic year</div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="aed-kpi-card" onClick={() => onNavigate('system-diagnostics')} title="View System Diagnostics">
          <div className="aed-kpi-icon-wrap uptime">
            <ShieldCheck size={22} />
          </div>
          <div className="aed-kpi-body">
            <div className="aed-kpi-label">System Uptime</div>
            <div className="aed-kpi-val-row">
              <span className="aed-kpi-val">{systemUptime}</span>
              <span className="aed-kpi-pill">↑ 0.2%</span>
            </div>
            <div className="aed-kpi-sub">All services operational</div>
          </div>
        </div>
      </section>

      {/* 3. ROW 2: 3-COLUMN CHARTS */}
      <section className="aed-three-grid" aria-label="Analytical Visualizations">
        {/* Card 1: Departmental Enrollment & Faculty Distribution */}
        <div className="aed-card">
          <div className="aed-card-header">
            <h3 className="aed-card-title">
              <BarChart2 size={18} />
              Departmental Enrollment &amp; Faculty Distribution
            </h3>
            <select
              className="aed-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter Department"
            >
              <option value="All">All Departments</option>
              {departmentalData.map(d => (
                <option key={d.code} value={d.code}>{d.code}</option>
              ))}
            </select>
          </div>

          <div className="aed-legend-row">
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#2563eb' }} />
              <span>Students</span>
            </div>
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#10b981' }} />
              <span>Faculty</span>
            </div>
          </div>

          <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDeptData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [val, name === 'students' ? 'Students' : 'Faculty']}
                  contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faculty" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Revenue & Expenditure Overview */}
        <div className="aed-card">
          <div className="aed-card-header">
            <h3 className="aed-card-title">
              <TrendingUp size={18} />
              Revenue &amp; Expenditure Overview
            </h3>
            <select className="aed-select" value="Current Year" readOnly aria-label="Fiscal Year Filter">
              <option value="Current Year">Current Year</option>
            </select>
          </div>

          <div className="aed-legend-row">
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#0284c7' }} />
              <span>Fee Collection</span>
            </div>
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#06b6d4' }} />
              <span>Hostel Fees</span>
            </div>
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#f59e0b' }} />
              <span>Other Income</span>
            </div>
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#f43f5e' }} />
              <span>Expenditure</span>
            </div>
          </div>

          <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}L`}
                />
                <Tooltip
                  formatter={(val, name) => [`₹${val} Lakhs`, name]}
                  contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="feeCollection" name="Fee Collection" fill="#0284c7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="hostelFees" name="Hostel Fees" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="otherIncome" name="Other Income" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenditure" name="Expenditure" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Student Distribution by Program */}
        <div className="aed-card">
          <div className="aed-card-header">
            <h3 className="aed-card-title">
              <GraduationCap size={18} />
              Student Distribution by Program
            </h3>
            <select
              className="aed-select"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              aria-label="Program Filter"
            >
              <option value="By Program">By Program</option>
              <option value="By Department">By Department</option>
            </select>
          </div>

          <div className="aed-donut-container">
            <div className="aed-donut-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programDistribution}
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {programDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Students`, name]}
                    contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="aed-donut-center">
                <div className="aed-donut-center-val">2,480</div>
                <div className="aed-donut-center-lbl">Total Students</div>
              </div>
            </div>

            <div className="aed-donut-legend">
              {programDistribution.map(item => (
                <div key={item.name} className="aed-donut-row">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="aed-donut-dot" style={{ background: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="aed-donut-count">{item.count.toLocaleString()} ({item.pct})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ROW 3: APPROVALS, USAGE, NOTICES */}
      <section className="aed-three-grid" aria-label="Operations and Notice Stream">
        {/* Card 1: Pending Approvals & Action Items */}
        <div className="aed-card">
          <div className="aed-card-header">
            <h3 className="aed-card-title">
              <Clock size={18} />
              Pending Approvals &amp; Action Items
            </h3>
            <button
              className="aed-card-link"
              onClick={() => onNavigate('governance')}
              title="Open Approvals Console"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="aed-tabs-row">
            <button
              className={`aed-tab-btn ${approvalTab === 'all' ? 'active' : ''}`}
              onClick={() => setApprovalTab('all')}
            >
              All (24)
            </button>
            <button
              className={`aed-tab-btn ${approvalTab === 'admissions' ? 'active' : ''}`}
              onClick={() => setApprovalTab('admissions')}
            >
              Admissions (8)
            </button>
            <button
              className={`aed-tab-btn ${approvalTab === 'fees' ? 'active' : ''}`}
              onClick={() => setApprovalTab('fees')}
            >
              Fee Concessions (6)
            </button>
            <button
              className={`aed-tab-btn ${approvalTab === 'leaves' ? 'active' : ''}`}
              onClick={() => setApprovalTab('leaves')}
            >
              Leave Requests (5)
            </button>
            <button
              className={`aed-tab-btn ${approvalTab === 'certificates' ? 'active' : ''}`}
              onClick={() => setApprovalTab('certificates')}
            >
              Certificates (3)
            </button>
            <button
              className={`aed-tab-btn ${approvalTab === 'others' ? 'active' : ''}`}
              onClick={() => setApprovalTab('others')}
            >
              Others (2)
            </button>
          </div>

          <div className="aed-approval-list">
            {filteredApprovals.map(item => (
              <div
                key={item.id}
                className="aed-approval-item"
                onClick={() => onNavigate(item.targetTab)}
                title={`Open details for ${item.id}`}
              >
                <div className="aed-approval-left">
                  <div className={`aed-approval-icon ${item.color}`}>
                    <FileCheck size={16} />
                  </div>
                  <div className="aed-approval-info">
                    <span className="aed-approval-title">{item.title}</span>
                    <span className="aed-approval-sub">{item.detail}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span className="aed-approval-badge">Pending</span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: System Usage Analytics */}
        <div className="aed-card">
          <div className="aed-card-header">
            <h3 className="aed-card-title">
              <Activity size={18} />
              System Usage Analytics
            </h3>
            <select
              className="aed-select"
              value={usageWindow}
              onChange={(e) => setUsageWindow(e.target.value)}
              aria-label="Usage Window Filter"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 7 Days">Last 7 Days</option>
            </select>
          </div>

          <div className="aed-legend-row">
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#2563eb' }} />
              <span>Students</span>
            </div>
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#06b6d4' }} />
              <span>Faculty</span>
            </div>
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#f59e0b' }} />
              <span>Staff</span>
            </div>
            <div className="aed-legend-item">
              <span className="aed-legend-dot" style={{ background: '#8b5cf6' }} />
              <span>Parents</span>
            </div>
          </div>

          <div style={{ height: 165, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={systemUsageData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFaculty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                <Area type="monotone" dataKey="students" stroke="#2563eb" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={2} />
                <Area type="monotone" dataKey="faculty" stroke="#06b6d4" fillOpacity={1} fill="url(#colorFaculty)" strokeWidth={2} />
                <Line type="monotone" dataKey="staff" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="parents" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="aed-usage-mini-grid">
            <div className="aed-usage-mini-card">
              <div className="aed-usage-mini-icon blue">
                <Users size={14} />
              </div>
              <div>
                <div className="aed-usage-mini-val">12,450</div>
                <div className="aed-usage-mini-lbl">Total Logins</div>
              </div>
            </div>

            <div className="aed-usage-mini-card">
              <div className="aed-usage-mini-icon green">
                <Activity size={14} />
              </div>
              <div>
                <div className="aed-usage-mini-val">1,240</div>
                <div className="aed-usage-mini-lbl">Daily Active</div>
              </div>
            </div>

            <div className="aed-usage-mini-card">
              <div className="aed-usage-mini-icon purple">
                <Clock size={14} />
              </div>
              <div>
                <div className="aed-usage-mini-val">8.5 min</div>
                <div className="aed-usage-mini-lbl">Avg Session</div>
              </div>
            </div>

            <div className="aed-usage-mini-card">
              <div className="aed-usage-mini-icon teal">
                <ShieldCheck size={14} />
              </div>
              <div>
                <div className="aed-usage-mini-val">99.9%</div>
                <div className="aed-usage-mini-lbl">System Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Recent Notices & Circulars */}
        <div className="aed-card">
          <div className="aed-card-header">
            <h3 className="aed-card-title">
              <Megaphone size={18} />
              Recent Notices &amp; Circulars
            </h3>
            <button
              className="aed-card-link"
              onClick={() => onNavigate('notification-center')}
              title="View All Notices"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="aed-notice-list">
            {noticeItems.map(item => (
              <div
                key={item.title}
                className="aed-notice-item"
                onClick={() => onNavigate(item.targetTab)}
                title={`Open notice: ${item.title}`}
              >
                <div className="aed-notice-left">
                  <div className="aed-notice-datebox">
                    <span className="aed-notice-day">{item.day}</span>
                    <span className="aed-notice-month">{item.month}</span>
                  </div>
                  <div className="aed-notice-info">
                    <span className="aed-notice-title">{item.title}</span>
                    <span className="aed-notice-meta">{item.publisher}</span>
                  </div>
                </div>
                <span className={`aed-notice-tag ${item.tagClass}`}>
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ROW 4: INFRASTRUCTURE & QUICK ACTIONS */}
      <section className="aed-bottom-grid" aria-label="Campus Infrastructure and Quick Commands">
        {/* Left: Institution Infrastructure Status */}
        <div className="aed-card">
          <div className="aed-card-header">
            <h3 className="aed-card-title">
              <Building2 size={18} />
              Institution Infrastructure Status
            </h3>
            <button
              className="aed-card-link"
              onClick={() => onNavigate('facilities-workorders')}
              title="Open Facilities Console"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="aed-infra-grid">
            {infraItems.map(item => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.label}
                  className="aed-infra-card"
                  onClick={() => onNavigate('facilities-workorders')}
                  title={`View details for ${item.label}`}
                >
                  <div className="aed-infra-header">
                    <div className={`aed-infra-icon ${item.color}`}>
                      <IconComp size={15} />
                    </div>
                  </div>
                  <div className="aed-infra-val">{item.count}</div>
                  <div className="aed-infra-lbl">{item.label}</div>
                  <div className={`aed-infra-status ${item.isGood ? 'good' : 'warn'}`}>
                    <span>●</span> {item.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="aed-card">
          <div className="aed-card-header">
            <div>
              <h3 className="aed-card-title">
                <Wrench size={18} />
                Quick Actions
              </h3>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>Quick Admin</span>
          </div>

          <div className="aed-actions-grid">
            {quickActions.map(action => {
              const IconComp = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  className="aed-action-btn"
                  onClick={() => onNavigate(action.tab)}
                  title={`Trigger ${action.label}`}
                >
                  <div className={`aed-action-icon ${action.color}`}>
                    <IconComp size={18} />
                  </div>
                  <span className="aed-action-lbl">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
