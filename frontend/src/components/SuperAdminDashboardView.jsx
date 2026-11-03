import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  BookOpen,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Briefcase,
  GraduationCap,
  Activity,
  ClipboardList,
  Building,
  History,
  Megaphone,
  Calendar,
  Clock,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Trophy,
  AlertCircle,
  FileCheck2,
  CalendarDays,
  Bed,
  CheckCircle2,
  School,
  Bus,
  Layers
} from 'lucide-react';
import './SuperAdminDashboard.css';

export default function SuperAdminDashboardView({
  account,
  metrics = {},
  onNavigateTab,
  onOpenProvisionModal,
  onRunDiagnostics
}) {
  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Date and Time
  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }); // e.g. "Thu, 30 Oct 2026"

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }); // e.g. "06:44:45 PM"

  // Filter States for widgets
  const [enrollmentTimeframe, setEnrollmentTimeframe] = useState('6m');
  const [distributionFilter, setDistributionFilter] = useState('program');
  const [feeYearFilter, setFeeYearFilter] = useState('current');
  const [academicSemFilter, setAcademicSemFilter] = useState('sem5');
  const [usagePeriod, setUsagePeriod] = useState('30d');

  // KPI Metrics (using live metrics or authoritative defaults)
  const stats = [
    {
      id: 'students',
      label: 'Total Students',
      value: (metrics.totalStudents || 2460).toLocaleString(),
      trend: '+5%',
      subtext: '+112 this semester',
      icon: Users,
      colorClass: 'students',
      targetTab: 'users'
    },
    {
      id: 'faculty',
      label: 'Total Faculty',
      value: (metrics.totalFaculty || 146).toLocaleString(),
      trend: '+2%',
      subtext: '12 on leave',
      icon: UserCheck,
      colorClass: 'faculty',
      targetTab: 'users'
    },
    {
      id: 'staff',
      label: 'Total Staff',
      value: (metrics.totalStaff || 72).toLocaleString(),
      trend: '+0%',
      subtext: '6 non-teaching',
      icon: Users,
      colorClass: 'staff',
      targetTab: 'users'
    },
    {
      id: 'courses',
      label: 'Active Courses',
      value: '56',
      trend: '+3%',
      subtext: '8 departments',
      icon: Layers,
      colorClass: 'courses',
      targetTab: 'timetable'
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: '₹ 3.69 Cr',
      trend: '+5%',
      subtext: 'This academic year',
      icon: IndianRupee,
      colorClass: 'revenue',
      targetTab: 'overview'
    },
    {
      id: 'uptime',
      label: 'System Uptime',
      value: '99.98%',
      trend: '+0.2%',
      subtext: 'All services operational',
      icon: ShieldCheck,
      colorClass: 'uptime',
      targetTab: 'health'
    }
  ];

  return (
    <div className="sad-root">
      {/* 1. HERO BANNER */}
      <div className="sad-hero">
        <div className="sad-hero-content">
          <div className="sad-hero-greeting">Welcome back,</div>
          <h1 className="sad-hero-title">
            {account?.name || 'Super Administrator'}
            <span className="sad-hero-crown" role="img" aria-label="crown">👑</span>
          </h1>
          <p className="sad-hero-desc">
            Manage your institution efficiently. Monitor academic, administrative and operational activities in real time.
          </p>
        </div>

        <div className="sad-hero-right">
          <div className="sad-hero-timebox">
            <div className="sad-hero-time-row">
              <Calendar size={14} />
              <span>{formattedDate}</span>
            </div>
            <div className="sad-hero-time-row time-clock">
              <Clock size={15} />
              <span>{formattedTime}</span>
            </div>
          </div>

          <div className="sad-hero-actions">
            {onOpenProvisionModal && (
              <button
                type="button"
                className="sad-hero-btn primary"
                onClick={onOpenProvisionModal}
                title="Create a new user account"
              >
                <UserPlus size={14} />
                <span>Provision Account</span>
              </button>
            )}
            {onRunDiagnostics && (
              <button
                type="button"
                className="sad-hero-btn glass"
                onClick={onRunDiagnostics}
                title="Run live diagnostics"
              >
                <Activity size={14} />
                <span>Diagnostics</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATS ROW (6 KPI CARDS) */}
      <div className="sad-stats-row">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="sad-stat-card"
              onClick={() => onNavigateTab && onNavigateTab(stat.targetTab)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigateTab && onNavigateTab(stat.targetTab)}
            >
              <div className={`sad-stat-icon-wrap ${stat.colorClass}`}>
                <Icon size={20} />
              </div>
              <div className="sad-stat-body">
                <div className="sad-stat-label">{stat.label}</div>
                <div className="sad-stat-val-row">
                  <span className="sad-stat-val">{stat.value}</span>
                  <span className="sad-stat-trend">↑ {stat.trend}</span>
                </div>
                <div className="sad-stat-sub">{stat.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ROW 1: ENROLLMENT, DISTRIBUTION, FEE COLLECTION */}
      <div className="sad-grid-row">
        {/* WIDGET 1: Student Enrollment Trend */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <TrendingUp size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Student Enrollment Trend</h3>
            </div>
            <select
              className="sad-card-select"
              value={enrollmentTimeframe}
              onChange={(e) => setEnrollmentTimeframe(e.target.value)}
            >
              <option value="6m">Last 6 Months</option>
              <option value="3m">Last 3 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>

          <div className="sad-enrollment-legend">
            <span className="sad-legend-item">
              <span className="sad-legend-dot admissions" /> New Admissions
            </span>
            <span className="sad-legend-item">
              <span className="sad-legend-dot total" /> Total Students
            </span>
            <span className="sad-legend-item">
              <span className="sad-legend-dot dropouts" /> Dropouts
            </span>
          </div>

          {/* SVG Dual Bar & Line Trend Chart */}
          <svg className="sad-chart-svg" viewBox="0 0 380 150">
            {/* Grid Lines */}
            <line x1="30" y1="20" x2="365" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="30" y1="50" x2="365" y2="50" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="30" y1="80" x2="365" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="30" y1="110" x2="365" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="30" y1="130" x2="365" y2="130" stroke="#e2e8f0" />

            {/* Y Axis labels */}
            <text x="25" y="23" fontSize="8.5" fill="#94a3b8" textAnchor="end">3,000</text>
            <text x="25" y="53" fontSize="8.5" fill="#94a3b8" textAnchor="end">2,500</text>
            <text x="25" y="83" fontSize="8.5" fill="#94a3b8" textAnchor="end">2,000</text>
            <text x="25" y="113" fontSize="8.5" fill="#94a3b8" textAnchor="end">1,500</text>

            {/* Bars for Admissions (light blue) & Dropouts (red) */}
            {/* May */}
            <rect x="52" y="70" width="12" height="60" rx="3" fill="#93c5fd" opacity="0.85" />
            <rect x="66" y="122" width="6" height="8" rx="2" fill="#f87171" opacity="0.85" />
            <text x="62" y="142" fontSize="9" fill="#64748b" textAnchor="middle">May</text>

            {/* Jun */}
            <rect x="107" y="62" width="12" height="68" rx="3" fill="#93c5fd" opacity="0.85" />
            <rect x="121" y="124" width="6" height="6" rx="2" fill="#f87171" opacity="0.85" />
            <text x="117" y="142" fontSize="9" fill="#64748b" textAnchor="middle">Jun</text>

            {/* Jul */}
            <rect x="162" y="54" width="12" height="76" rx="3" fill="#93c5fd" opacity="0.85" />
            <rect x="176" y="121" width="6" height="9" rx="2" fill="#f87171" opacity="0.85" />
            <text x="172" y="142" fontSize="9" fill="#64748b" textAnchor="middle">Jul</text>

            {/* Aug */}
            <rect x="217" y="46" width="12" height="84" rx="3" fill="#93c5fd" opacity="0.85" />
            <rect x="231" y="123" width="6" height="7" rx="2" fill="#f87171" opacity="0.85" />
            <text x="227" y="142" fontSize="9" fill="#64748b" textAnchor="middle">Aug</text>

            {/* Sep */}
            <rect x="272" y="38" width="12" height="92" rx="3" fill="#93c5fd" opacity="0.85" />
            <rect x="286" y="122" width="6" height="8" rx="2" fill="#f87171" opacity="0.85" />
            <text x="282" y="142" fontSize="9" fill="#64748b" textAnchor="middle">Sep</text>

            {/* Oct */}
            <rect x="327" y="32" width="12" height="98" rx="3" fill="#93c5fd" opacity="0.85" />
            <rect x="341" y="125" width="6" height="5" rx="2" fill="#f87171" opacity="0.85" />
            <text x="337" y="142" fontSize="9" fill="#64748b" textAnchor="middle">Oct</text>

            {/* Total Students Line (Solid Blue Spline) */}
            <path
              d="M 62 68 Q 117 58 172 48 T 282 36 T 337 28"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
            />
            {/* Data Points */}
            <circle cx="62" cy="68" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <circle cx="117" cy="58" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <circle cx="172" cy="48" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <circle cx="227" cy="42" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <circle cx="282" cy="36" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <circle cx="337" cy="28" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
          </svg>
        </div>

        {/* WIDGET 2: Student Distribution */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <PieChart size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Student Distribution</h3>
            </div>
            <select
              className="sad-card-select"
              value={distributionFilter}
              onChange={(e) => setDistributionFilter(e.target.value)}
            >
              <option value="program">By Program</option>
              <option value="dept">By Department</option>
              <option value="year">By Year</option>
            </select>
          </div>

          <div className="sad-distribution-wrap">
            {/* SVG Donut */}
            <div className="sad-donut-svg-wrap">
              <svg width="150" height="150" viewBox="0 0 100 100">
                {/* Donut Background */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                {/* B.Tech: 61.8% -> dasharray 147.6, 238.7 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="18"
                  strokeDasharray="147.6 238.7"
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
                {/* BCA: 13.0% -> dasharray 31.0 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="18"
                  strokeDasharray="31.0 238.7"
                  strokeDashoffset="-147.6"
                  transform="rotate(-90 50 50)"
                />
                {/* MBA: 11.4% -> dasharray 27.2 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="18"
                  strokeDasharray="27.2 238.7"
                  strokeDashoffset="-178.6"
                  transform="rotate(-90 50 50)"
                />
                {/* Diploma: 8.5% -> dasharray 20.3 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="18"
                  strokeDasharray="20.3 238.7"
                  strokeDashoffset="-205.8"
                  transform="rotate(-90 50 50)"
                />
                {/* Others: 5.3% -> dasharray 12.6 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="18"
                  strokeDasharray="12.6 238.7"
                  strokeDashoffset="-226.1"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="sad-donut-center-label">
                <div className="sad-donut-center-val">2,460</div>
                <div className="sad-donut-center-sub">Total Students</div>
              </div>
            </div>

            {/* Legend List */}
            <div className="sad-donut-legend-list">
              <div className="sad-donut-legend-row">
                <div className="sad-donut-legend-left">
                  <span className="sad-donut-dot" style={{ background: '#2563eb' }} />
                  <span>B.Tech</span>
                </div>
                <div>
                  <span className="sad-donut-legend-val">1,520</span>
                  <span className="sad-donut-legend-pct">(61.8%)</span>
                </div>
              </div>

              <div className="sad-donut-legend-row">
                <div className="sad-donut-legend-left">
                  <span className="sad-donut-dot" style={{ background: '#06b6d4' }} />
                  <span>BCA</span>
                </div>
                <div>
                  <span className="sad-donut-legend-val">320</span>
                  <span className="sad-donut-legend-pct">(13.0%)</span>
                </div>
              </div>

              <div className="sad-donut-legend-row">
                <div className="sad-donut-legend-left">
                  <span className="sad-donut-dot" style={{ background: '#10b981' }} />
                  <span>MBA</span>
                </div>
                <div>
                  <span className="sad-donut-legend-val">280</span>
                  <span className="sad-donut-legend-pct">(11.4%)</span>
                </div>
              </div>

              <div className="sad-donut-legend-row">
                <div className="sad-donut-legend-left">
                  <span className="sad-donut-dot" style={{ background: '#f59e0b' }} />
                  <span>Diploma</span>
                </div>
                <div>
                  <span className="sad-donut-legend-val">210</span>
                  <span className="sad-donut-legend-pct">(8.5%)</span>
                </div>
              </div>

              <div className="sad-donut-legend-row">
                <div className="sad-donut-legend-left">
                  <span className="sad-donut-dot" style={{ background: '#ec4899' }} />
                  <span>Others</span>
                </div>
                <div>
                  <span className="sad-donut-legend-val">130</span>
                  <span className="sad-donut-legend-pct">(5.3%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Fee Collection Overview */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <Briefcase size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Fee Collection Overview</h3>
            </div>
            <select
              className="sad-card-select"
              value={feeYearFilter}
              onChange={(e) => setFeeYearFilter(e.target.value)}
            >
              <option value="current">Current Year</option>
              <option value="prev">Previous Year</option>
            </select>
          </div>

          <div className="sad-fee-wrap">
            {/* Stacked Bars */}
            <div className="sad-fee-chart">
              <svg viewBox="0 0 220 150" style={{ width: '100%', height: '100%' }}>
                {/* Horizontal Scale Lines */}
                <line x1="25" y1="20" x2="215" y2="20" stroke="#f1f5f9" strokeDasharray="2 2" />
                <line x1="25" y1="55" x2="215" y2="55" stroke="#f1f5f9" strokeDasharray="2 2" />
                <line x1="25" y1="90" x2="215" y2="90" stroke="#f1f5f9" strokeDasharray="2 2" />
                <line x1="25" y1="125" x2="215" y2="125" stroke="#e2e8f0" />

                <text x="20" y="23" fontSize="7.5" fill="#94a3b8" textAnchor="end">₹ 1 Cr</text>
                <text x="20" y="58" fontSize="7.5" fill="#94a3b8" textAnchor="end">₹ 60L</text>
                <text x="20" y="93" fontSize="7.5" fill="#94a3b8" textAnchor="end">₹ 30L</text>
                <text x="20" y="128" fontSize="7.5" fill="#94a3b8" textAnchor="end">₹ 0</text>

                {/* May: Tuition (blue 42), Hostel (green 18), Other (amber 8) */}
                <rect x="36" y="70" width="12" height="55" fill="#2563eb" rx="1" />
                <rect x="36" y="55" width="12" height="15" fill="#10b981" />
                <rect x="36" y="47" width="12" height="8" fill="#f59e0b" rx="2" />
                <text x="42" y="138" fontSize="8" fill="#64748b" textAnchor="middle">May</text>

                {/* Jun */}
                <rect x="66" y="65" width="12" height="60" fill="#2563eb" rx="1" />
                <rect x="66" y="48" width="12" height="17" fill="#10b981" />
                <rect x="66" y="39" width="12" height="9" fill="#f59e0b" rx="2" />
                <text x="72" y="138" fontSize="8" fill="#64748b" textAnchor="middle">Jun</text>

                {/* Jul */}
                <rect x="96" y="60" width="12" height="65" fill="#2563eb" rx="1" />
                <rect x="96" y="42" width="12" height="18" fill="#10b981" />
                <rect x="96" y="32" width="12" height="10" fill="#f59e0b" rx="2" />
                <text x="102" y="138" fontSize="8" fill="#64748b" textAnchor="middle">Jul</text>

                {/* Aug */}
                <rect x="126" y="55" width="12" height="70" fill="#2563eb" rx="1" />
                <rect x="126" y="36" width="12" height="19" fill="#10b981" />
                <rect x="126" y="25" width="12" height="11" fill="#f59e0b" rx="2" />
                <text x="132" y="138" fontSize="8" fill="#64748b" textAnchor="middle">Aug</text>

                {/* Sep */}
                <rect x="156" y="50" width="12" height="75" fill="#2563eb" rx="1" />
                <rect x="156" y="29" width="12" height="21" fill="#10b981" />
                <rect x="156" y="17" width="12" height="12" fill="#f59e0b" rx="2" />
                <text x="162" y="138" fontSize="8" fill="#64748b" textAnchor="middle">Sep</text>

                {/* Oct */}
                <rect x="186" y="45" width="12" height="80" fill="#2563eb" rx="1" />
                <rect x="186" y="23" width="12" height="22" fill="#10b981" />
                <rect x="186" y="10" width="12" height="13" fill="#f59e0b" rx="2" />
                <text x="192" y="138" fontSize="8" fill="#64748b" textAnchor="middle">Oct</text>
              </svg>
            </div>

            {/* Right KPI Info */}
            <div className="sad-fee-kpi-col">
              <div className="sad-fee-kpi-block">
                <strong>₹ 3.69 Cr</strong>
                <small>Total Collection</small>
                <span className="sad-stat-trend" style={{ fontSize: '0.72rem', marginTop: '2px', display: 'inline-block' }}>
                  ↑ 8% vs last year
                </span>
              </div>

              <div className="sad-fee-kpi-block">
                <strong style={{ fontSize: '1.05rem', color: '#334155' }}>₹ 4.01 Cr</strong>
                <small>Expected Revenue</small>
              </div>

              {/* Progress Ring */}
              <div className="sad-fee-progress-ring-box">
                <svg width="44" height="44" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3.8"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.8"
                    strokeDasharray="92, 100"
                    strokeLinecap="round"
                  />
                  <text x="18" y="20.5" fontSize="8.5" fontWeight="800" fill="#0f172a" textAnchor="middle">92%</text>
                </svg>
                <div>
                  <div className="sad-fee-rate-label">Collection Rate</div>
                  <small style={{ fontSize: '0.68rem', color: '#64748b' }}>Target: 95%</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: ACADEMIC PERFORMANCE, SYSTEM USAGE, REQUESTS & APPROVALS */}
      <div className="sad-grid-row">
        {/* WIDGET 1: Academic Performance Overview */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <GraduationCap size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Academic Performance Overview</h3>
            </div>
            <select
              className="sad-card-select"
              value={academicSemFilter}
              onChange={(e) => setAcademicSemFilter(e.target.value)}
            >
              <option value="sem5">Semester 5</option>
              <option value="sem4">Semester 4</option>
              <option value="sem3">Semester 3</option>
            </select>
          </div>

          <div className="sad-academic-wrap">
            {/* Line Chart */}
            <div className="sad-academic-chart">
              <svg viewBox="0 0 240 150" style={{ width: '100%', height: '100%' }}>
                <line x1="20" y1="20" x2="230" y2="20" stroke="#f1f5f9" strokeDasharray="2 2" />
                <line x1="20" y1="55" x2="230" y2="55" stroke="#f1f5f9" strokeDasharray="2 2" />
                <line x1="20" y1="90" x2="230" y2="90" stroke="#f1f5f9" strokeDasharray="2 2" />
                <line x1="20" y1="125" x2="230" y2="125" stroke="#e2e8f0" />

                <text x="16" y="23" fontSize="7.5" fill="#94a3b8" textAnchor="end">10</text>
                <text x="16" y="58" fontSize="7.5" fill="#94a3b8" textAnchor="end">8</text>
                <text x="16" y="93" fontSize="7.5" fill="#94a3b8" textAnchor="end">6</text>
                <text x="16" y="128" fontSize="7.5" fill="#94a3b8" textAnchor="end">4</text>

                {/* Sem labels */}
                <text x="35" y="140" fontSize="7.5" fill="#64748b" textAnchor="middle">Sem 1</text>
                <text x="80" y="140" fontSize="7.5" fill="#64748b" textAnchor="middle">Sem 2</text>
                <text x="125" y="140" fontSize="7.5" fill="#64748b" textAnchor="middle">Sem 3</text>
                <text x="170" y="140" fontSize="7.5" fill="#64748b" textAnchor="middle">Sem 4</text>
                <text x="215" y="140" fontSize="7.5" fill="#64748b" textAnchor="middle">Sem 5</text>

                {/* Highest CGPA Line (Green) */}
                <path
                  d="M 35 48 Q 80 40 125 32 T 170 26 T 215 24"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                <circle cx="35" cy="48" r="3" fill="#10b981" stroke="#fff" />
                <circle cx="80" cy="40" r="3" fill="#10b981" stroke="#fff" />
                <circle cx="125" cy="32" r="3" fill="#10b981" stroke="#fff" />
                <circle cx="170" cy="26" r="3" fill="#10b981" stroke="#fff" />
                <circle cx="215" cy="24" r="3" fill="#10b981" stroke="#fff" />

                {/* Average CGPA Line (Blue) */}
                <path
                  d="M 35 76 Q 80 70 125 62 T 170 54 T 215 50"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <circle cx="35" cy="76" r="3" fill="#2563eb" stroke="#fff" />
                <circle cx="80" cy="70" r="3" fill="#2563eb" stroke="#fff" />
                <circle cx="125" cy="62" r="3" fill="#2563eb" stroke="#fff" />
                <circle cx="170" cy="54" r="3" fill="#2563eb" stroke="#fff" />
                <circle cx="215" cy="50" r="3" fill="#2563eb" stroke="#fff" />

                {/* Lowest CGPA Line (Orange) */}
                <path
                  d="M 35 98 Q 80 94 125 90 T 170 86 T 215 84"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <circle cx="35" cy="98" r="3" fill="#f97316" stroke="#fff" />
                <circle cx="80" cy="94" r="3" fill="#f97316" stroke="#fff" />
                <circle cx="125" cy="90" r="3" fill="#f97316" stroke="#fff" />
                <circle cx="170" cy="86" r="3" fill="#f97316" stroke="#fff" />
                <circle cx="215" cy="84" r="3" fill="#f97316" stroke="#fff" />
              </svg>
            </div>

            {/* Right KPI Summary Cards */}
            <div className="sad-academic-kpi-col">
              <div className="sad-acad-badge-card avg">
                <div className="sad-acad-icon-box">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <div className="sad-acad-val">8.21</div>
                  <div className="sad-acad-label">Average CGPA</div>
                </div>
              </div>

              <div className="sad-acad-badge-card highest">
                <div className="sad-acad-icon-box">
                  <Trophy size={16} />
                </div>
                <div>
                  <div className="sad-acad-val">9.68</div>
                  <div className="sad-acad-label">Highest CGPA</div>
                </div>
              </div>

              <div className="sad-acad-badge-card lowest">
                <div className="sad-acad-icon-box">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="sad-acad-val">6.12</div>
                  <div className="sad-acad-label">Lowest CGPA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 2: System Usage Analytics */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <Activity size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">System Usage Analytics</h3>
            </div>
            <select
              className="sad-card-select"
              value={usagePeriod}
              onChange={(e) => setUsagePeriod(e.target.value)}
            >
              <option value="30d">Last 30 Days</option>
              <option value="14d">Last 14 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          <div className="sad-system-chart-wrap">
            <svg viewBox="0 0 360 135" style={{ width: '100%', height: '125px' }}>
              <line x1="25" y1="20" x2="350" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="25" y1="50" x2="350" y2="50" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="25" y1="80" x2="350" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="25" y1="110" x2="350" y2="110" stroke="#e2e8f0" />

              <text x="20" y="23" fontSize="8" fill="#94a3b8" textAnchor="end">2,000</text>
              <text x="20" y="53" fontSize="8" fill="#94a3b8" textAnchor="end">1,500</text>
              <text x="20" y="83" fontSize="8" fill="#94a3b8" textAnchor="end">1,000</text>
              <text x="20" y="113" fontSize="8" fill="#94a3b8" textAnchor="end">0</text>

              {/* Dates */}
              <text x="50" y="125" fontSize="8.5" fill="#64748b" textAnchor="middle">1 Oct</text>
              <text x="120" y="125" fontSize="8.5" fill="#64748b" textAnchor="middle">8 Oct</text>
              <text x="190" y="125" fontSize="8.5" fill="#64748b" textAnchor="middle">15 Oct</text>
              <text x="260" y="125" fontSize="8.5" fill="#64748b" textAnchor="middle">22 Oct</text>
              <text x="330" y="125" fontSize="8.5" fill="#64748b" textAnchor="middle">30 Oct</text>

              {/* Student Curve (Blue) with area gradient */}
              <path
                d="M 50 78 Q 85 52 120 70 T 190 45 T 260 62 T 330 40"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
              />
              <circle cx="50" cy="78" r="3" fill="#2563eb" />
              <circle cx="120" cy="70" r="3" fill="#2563eb" />
              <circle cx="190" cy="45" r="3" fill="#2563eb" />
              <circle cx="260" cy="62" r="3" fill="#2563eb" />
              <circle cx="330" cy="40" r="3" fill="#2563eb" />

              {/* Faculty Curve (Green) */}
              <path
                d="M 50 92 Q 85 80 120 85 T 190 74 T 260 82 T 330 68"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
              />
              <circle cx="50" cy="92" r="2.5" fill="#10b981" />
              <circle cx="120" cy="85" r="2.5" fill="#10b981" />
              <circle cx="190" cy="74" r="2.5" fill="#10b981" />
              <circle cx="260" cy="82" r="2.5" fill="#10b981" />
              <circle cx="330" cy="68" r="2.5" fill="#10b981" />

              {/* Staff Curve (Orange) */}
              <path
                d="M 50 100 Q 85 96 120 98 T 190 92 T 260 94 T 330 88"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />

              {/* Parents Curve (Purple) */}
              <path
                d="M 50 106 Q 85 104 120 105 T 190 102 T 260 103 T 330 98"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="1.5"
              />
            </svg>

            {/* Bottom Legend */}
            <div className="sad-system-legend">
              <span className="sad-legend-item">
                <span className="sad-legend-dot" style={{ background: '#2563eb', borderRadius: '50%' }} /> Student
              </span>
              <span className="sad-legend-item">
                <span className="sad-legend-dot" style={{ background: '#10b981', borderRadius: '50%' }} /> Faculty
              </span>
              <span className="sad-legend-item">
                <span className="sad-legend-dot" style={{ background: '#f59e0b', borderRadius: '50%' }} /> Staff
              </span>
              <span className="sad-legend-item">
                <span className="sad-legend-dot" style={{ background: '#8b5cf6', borderRadius: '50%' }} /> Parents
              </span>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Active Requests & Approvals */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <ClipboardList size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Active Requests & Approvals</h3>
            </div>
            <button
              type="button"
              className="sad-card-link"
              onClick={() => onNavigateTab && onNavigateTab('approvals')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="sad-approvals-list">
            <div
              className="sad-approval-item"
              onClick={() => onNavigateTab && onNavigateTab('approvals')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-approval-item-left">
                <div className="sad-approval-icon-box" style={{ background: '#f59e0b' }}>
                  <UserPlus size={14} />
                </div>
                <span className="sad-approval-name">Admission Approvals</span>
              </div>
              <div className="sad-approval-item-right">
                <span className="sad-approval-count">12</span>
                <span className="sad-approval-pill">Pending</span>
              </div>
            </div>

            <div
              className="sad-approval-item"
              onClick={() => onNavigateTab && onNavigateTab('approvals')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-approval-item-left">
                <div className="sad-approval-icon-box" style={{ background: '#3b82f6' }}>
                  <IndianRupee size={14} />
                </div>
                <span className="sad-approval-name">Fee Concession Requests</span>
              </div>
              <div className="sad-approval-item-right">
                <span className="sad-approval-count">8</span>
                <span className="sad-approval-pill">Pending</span>
              </div>
            </div>

            <div
              className="sad-approval-item"
              onClick={() => onNavigateTab && onNavigateTab('approvals')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-approval-item-left">
                <div className="sad-approval-icon-box" style={{ background: '#10b981' }}>
                  <CalendarDays size={14} />
                </div>
                <span className="sad-approval-name">Leave Applications</span>
              </div>
              <div className="sad-approval-item-right">
                <span className="sad-approval-count">15</span>
                <span className="sad-approval-pill">Pending</span>
              </div>
            </div>

            <div
              className="sad-approval-item"
              onClick={() => onNavigateTab && onNavigateTab('approvals')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-approval-item-left">
                <div className="sad-approval-icon-box" style={{ background: '#06b6d4' }}>
                  <FileCheck2 size={14} />
                </div>
                <span className="sad-approval-name">Certificate Requests</span>
              </div>
              <div className="sad-approval-item-right">
                <span className="sad-approval-count">7</span>
                <span className="sad-approval-pill">Pending</span>
              </div>
            </div>

            <div
              className="sad-approval-item"
              onClick={() => onNavigateTab && onNavigateTab('approvals')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-approval-item-left">
                <div className="sad-approval-icon-box" style={{ background: '#8b5cf6' }}>
                  <Bed size={14} />
                </div>
                <span className="sad-approval-name">Hostel Room Allotments</span>
              </div>
              <div className="sad-approval-item-right">
                <span className="sad-approval-count">5</span>
                <span className="sad-approval-pill">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ROW 3: INFRASTRUCTURE, RECENT ACTIVITIES, NOTICES */}
      <div className="sad-grid-row">
        {/* WIDGET 1: Institution Infrastructure Status */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <Building size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Institution Infrastructure Status</h3>
            </div>
            <button
              type="button"
              className="sad-card-link"
              onClick={() => onNavigateTab && onNavigateTab('health')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="sad-infra-grid">
            <div className="sad-infra-box">
              <div className="sad-infra-top">
                <div className="sad-infra-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  <School size={14} />
                </div>
                <span className="sad-infra-name">Academic Blocks</span>
              </div>
              <div className="sad-infra-bottom">
                <span className="sad-infra-count">6</span>
                <span className="sad-infra-badge ok">Operational</span>
              </div>
            </div>

            <div className="sad-infra-box">
              <div className="sad-infra-top">
                <div className="sad-infra-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <Building size={14} />
                </div>
                <span className="sad-infra-name">Classrooms</span>
              </div>
              <div className="sad-infra-bottom">
                <span className="sad-infra-count">124</span>
                <span className="sad-infra-badge ok">Operational</span>
              </div>
            </div>

            <div className="sad-infra-box">
              <div className="sad-infra-top">
                <div className="sad-infra-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                  <Activity size={14} />
                </div>
                <span className="sad-infra-name">Laboratories</span>
              </div>
              <div className="sad-infra-bottom">
                <span className="sad-infra-count">28</span>
                <span className="sad-infra-badge ok">Operational</span>
              </div>
            </div>

            <div className="sad-infra-box">
              <div className="sad-infra-top">
                <div className="sad-infra-icon" style={{ background: '#ffe4e6', color: '#be123c' }}>
                  <Bed size={14} />
                </div>
                <span className="sad-infra-name">Hostel Blocks</span>
              </div>
              <div className="sad-infra-bottom">
                <span className="sad-infra-count">4</span>
                <span className="sad-infra-badge ok">Operational</span>
              </div>
            </div>

            <div className="sad-infra-box">
              <div className="sad-infra-top">
                <div className="sad-infra-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  <BookOpen size={14} />
                </div>
                <span className="sad-infra-name">Library</span>
              </div>
              <div className="sad-infra-bottom">
                <span className="sad-infra-count">1</span>
                <span className="sad-infra-badge ok">Operational</span>
              </div>
            </div>

            <div className="sad-infra-box">
              <div className="sad-infra-top">
                <div className="sad-infra-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <Bus size={14} />
                </div>
                <span className="sad-infra-name">Transport Fleet</span>
              </div>
              <div className="sad-infra-bottom">
                <span className="sad-infra-count">12</span>
                <span className="sad-infra-badge warn">2 Under Maint.</span>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 2: Recent Activities */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <History size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Recent Activities</h3>
            </div>
            <button
              type="button"
              className="sad-card-link"
              onClick={() => onNavigateTab && onNavigateTab('audit')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="sad-activities-list">
            <div className="sad-activity-item">
              <div className="sad-activity-dot-box" style={{ background: '#10b981' }}>
                <CheckCircle2 size={13} />
              </div>
              <div className="sad-activity-content">
                <span className="sad-activity-title">New student admission approved</span>
                <div className="sad-activity-meta">
                  <span className="sad-activity-author">Admin User</span> · <span>10m ago</span>
                </div>
              </div>
            </div>

            <div className="sad-activity-item">
              <div className="sad-activity-dot-box" style={{ background: '#2563eb' }}>
                <IndianRupee size={13} />
              </div>
              <div className="sad-activity-content">
                <span className="sad-activity-title">Fee payment received (₹45,000)</span>
                <div className="sad-activity-meta">
                  <span className="sad-activity-author">Student Portal</span> · <span>24m ago</span>
                </div>
              </div>
            </div>

            <div className="sad-activity-item">
              <div className="sad-activity-dot-box" style={{ background: '#8b5cf6' }}>
                <UserCheck size={13} />
              </div>
              <div className="sad-activity-content">
                <span className="sad-activity-title">New faculty member joined</span>
                <div className="sad-activity-meta">
                  <span className="sad-activity-author">HR Department</span> · <span>1h ago</span>
                </div>
              </div>
            </div>

            <div className="sad-activity-item">
              <div className="sad-activity-dot-box" style={{ background: '#f59e0b' }}>
                <FileCheck2 size={13} />
              </div>
              <div className="sad-activity-content">
                <span className="sad-activity-title">Examination results published</span>
                <div className="sad-activity-meta">
                  <span className="sad-activity-author">Exam Cell</span> · <span>2h ago</span>
                </div>
              </div>
            </div>

            <div className="sad-activity-item">
              <div className="sad-activity-dot-box" style={{ background: '#06b6d4' }}>
                <ShieldCheck size={13} />
              </div>
              <div className="sad-activity-content">
                <span className="sad-activity-title">Automated system backup completed</span>
                <div className="sad-activity-meta">
                  <span className="sad-activity-author">System Engine</span> · <span>4h ago</span>
                </div>
              </div>
            </div>

            <div className="sad-activity-item">
              <div className="sad-activity-dot-box" style={{ background: '#ec4899' }}>
                <AlertCircle size={13} />
              </div>
              <div className="sad-activity-content">
                <span className="sad-activity-title">New student grievance registered</span>
                <div className="sad-activity-meta">
                  <span className="sad-activity-author">Student Portal</span> · <span>5h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Important Notices & Announcements */}
        <div className="sad-card">
          <div className="sad-card-head">
            <div className="sad-card-title-group">
              <Megaphone size={18} className="sad-card-icon" />
              <h3 className="sad-card-title">Important Notices & Announcements</h3>
            </div>
            <button
              type="button"
              className="sad-card-link"
              onClick={() => onNavigateTab && onNavigateTab('campus-connect')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="sad-notices-list">
            <div
              className="sad-notice-item"
              onClick={() => onNavigateTab && onNavigateTab('campus-connect')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-notice-left">
                <span className="sad-notice-title">Mid Semester Examination Schedule</span>
                <span className="sad-notice-date">Published on 30 Oct 2026</span>
              </div>
              <span className="sad-notice-tag exam">Exam</span>
            </div>

            <div
              className="sad-notice-item"
              onClick={() => onNavigateTab && onNavigateTab('campus-connect')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-notice-left">
                <span className="sad-notice-title">Scholarship Applications Open for AY 2026-27</span>
                <span className="sad-notice-date">Published on 28 Oct 2026</span>
              </div>
              <span className="sad-notice-tag scholarship">Scholarship</span>
            </div>

            <div
              className="sad-notice-item"
              onClick={() => onNavigateTab && onNavigateTab('campus-connect')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-notice-left">
                <span className="sad-notice-title">Campus Placement Drive by TCS Ninja</span>
                <span className="sad-notice-date">Published on 26 Oct 2026</span>
              </div>
              <span className="sad-notice-tag placement">Placement</span>
            </div>

            <div
              className="sad-notice-item"
              onClick={() => onNavigateTab && onNavigateTab('campus-connect')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-notice-left">
                <span className="sad-notice-title">Central Library Extended Timings Notice</span>
                <span className="sad-notice-date">Published on 24 Oct 2026</span>
              </div>
              <span className="sad-notice-tag library">Library</span>
            </div>

            <div
              className="sad-notice-item"
              onClick={() => onNavigateTab && onNavigateTab('campus-connect')}
              role="button"
              tabIndex={0}
            >
              <div className="sad-notice-left">
                <span className="sad-notice-title">Institutional Holiday Announcement</span>
                <span className="sad-notice-date">Published on 22 Oct 2026</span>
              </div>
              <span className="sad-notice-tag holiday">Holiday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

