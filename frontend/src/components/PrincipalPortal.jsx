import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Megaphone,
  AlertTriangle,
  Award,
  Users,
  Clock,
  LogOut,
  Send,
  Eye,
  ShieldCheck,
  Check,
  Menu,
  X,
  FileSpreadsheet,
  CalendarDays,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  Printer,
  UserCheck,
  Info
} from 'lucide-react';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
<<<<<<< HEAD
import TimetableManager from './TimetableManagement/TimetableManager.jsx';
=======
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
>>>>>>> origin/teammate-work
import './PrincipalPortal.css';
import './SuperAdminPortal.css';
import { api } from '../services/api.js';

export default function PrincipalPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('governance'); // governance, leaves, notices, academic_health, timetable, report-generation
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live Data States
  const [overviewData, setOverviewData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [circulars, setCirculars] = useState([]);

  // Leave Approvals Filter & Modal States
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('All');
  const [leaveRoleFilter, setLeaveRoleFilter] = useState('All');
  const [leaveDeptFilter, setLeaveDeptFilter] = useState('All');
  const [approvalModal, setApprovalModal] = useState({ open: false, leave: null });
  const [rejectionModal, setRejectionModal] = useState({ open: false, leave: null, reason: '' });

  // Circular Form & Clearance States
  const [newNotice, setNewNotice] = useState({
    title: '',
    scope: 'College-wide',
    category: 'Academic',
    priority: 'Normal',
    expiryDate: '',
    content: '',
  });
  const [circularSearch, setCircularSearch] = useState('');
  const [circularCategoryFilter, setCircularCategoryFilter] = useState('All');

  // Academic Analytics Filters
  const [academicDeptFilter, setAcademicDeptFilter] = useState('All');
  const [academicSemesterFilter, setAcademicSemesterFilter] = useState('All');

  // Department Inspect Modal
  const [inspectDeptModal, setInspectDeptModal] = useState({ open: false, dept: null });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Initial Data Fetching from Backend APIs
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, academicRes, leavesRes, circularsRes] = await Promise.allSettled([
        api.getPrincipalOverview(),
        api.getPrincipalAcademicAnalytics({ department: academicDeptFilter, semester: academicSemesterFilter }),
        api.getPrincipalLeaves(),
        api.getPrincipalCirculars(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setOverviewData(overviewRes.value.data);
      }
      if (academicRes.status === 'fulfilled' && academicRes.value?.data) {
        setAcademicData(academicRes.value.data);
      }
      if (leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value)) {
        setLeaveRequests(leavesRes.value);
      } else if (leavesRes.status === 'fulfilled' && leavesRes.value?.data) {
        setLeaveRequests(leavesRes.value.data);
      }
      if (circularsRes.status === 'fulfilled' && Array.isArray(circularsRes.value)) {
        setCirculars(circularsRes.value);
      } else if (circularsRes.status === 'fulfilled' && circularsRes.value?.data) {
        setCirculars(circularsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load Principal portal data:', err);
      setError('Some live metrics could not be loaded. Displaying cached dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Refresh Academic Data when department/semester filter changes
  useEffect(() => {
    const fetchFilteredAcademic = async () => {
      try {
        const res = await api.getPrincipalAcademicAnalytics({
          department: academicDeptFilter,
          semester: academicSemesterFilter,
        });
        if (res?.data) {
          setAcademicData(res.data);
        }
      } catch (err) {
        console.error('Failed to refresh academic analytics:', err);
      }
    };
    fetchFilteredAcademic();
  }, [academicDeptFilter, academicSemesterFilter]);

  // Leave Action Handlers with Confirmation & Rejection Reason
  const confirmApproveLeave = async () => {
    if (!approvalModal.leave) return;
    const leaveId = approvalModal.leave.id;
    try {
      await api.decidePrincipalLeave(leaveId, 'APPROVE', 'Officially approved by Principal / Director');
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Approved' } : l))
      );
      triggerToast(`Leave request #${leaveId} officially approved!`);
    } catch (err) {
      console.error('Error approving leave:', err);
      triggerToast('Leave approved (local state updated).');
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Approved' } : l))
      );
    } finally {
      setApprovalModal({ open: false, leave: null });
    }
  };

  const confirmRejectLeave = async () => {
    if (!rejectionModal.leave) return;
    if (!rejectionModal.reason.trim()) {
      alert('Please provide a specific rejection reason for administrative compliance.');
      return;
    }
    const leaveId = rejectionModal.leave.id;
    try {
      await api.decidePrincipalLeave(leaveId, 'REJECT', rejectionModal.reason);
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Rejected' } : l))
      );
      triggerToast(`Leave request #${leaveId} rejected.`);
    } catch (err) {
      console.error('Error rejecting leave:', err);
      triggerToast('Leave rejected (local state updated).');
      setLeaveRequests((prev) =>
        prev.map((l) => (l.id === leaveId ? { ...l, principalStatus: 'Rejected' } : l))
      );
    } finally {
      setRejectionModal({ open: false, leave: null, reason: '' });
    }
  };

  // Circular Management Handlers
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title) return;
    try {
      const payload = {
        title: newNotice.title,
        content: newNotice.content || newNotice.title,
        scope: newNotice.scope,
        category: newNotice.category,
        priority: newNotice.priority,
        expiryDate: newNotice.expiryDate,
      };
      const res = await api.createPrincipalCircular(payload);
      if (res?.data) {
        setCirculars([res.data, ...circulars]);
      } else {
        const fallbackItem = {
          id: `NOTIF-${Math.floor(200 + Math.random() * 800)}`,
          title: newNotice.title,
          scope: newNotice.scope,
          category: newNotice.category,
          priority: newNotice.priority,
          status: 'Published & Broadcasted',
          author: 'Office of the Principal / Director',
          date: new Date().toLocaleDateString('en-GB'),
        };
        setCirculars([fallbackItem, ...circulars]);
      }
      setNewNotice({
        title: '',
        scope: 'College-wide',
        category: 'Academic',
        priority: 'Normal',
        expiryDate: '',
        content: '',
      });
      triggerToast('Official circular broadcasted across Apna Campus!');
    } catch (err) {
      console.error('Error issuing circular:', err);
      triggerToast('Circular published locally.');
    }
  };

  const handleApproveNotice = async (id) => {
    try {
      await api.decidePrincipalCircular(id, 'APPROVE', 'Cleared by Principal Secretariat');
      setCirculars((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'Approved & Broadcasted' } : n))
      );
      triggerToast(`Notice #${id} approved and published to all students & faculty!`);
    } catch (err) {
      console.error('Error approving circular:', err);
      setCirculars((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'Approved & Broadcasted' } : n))
      );
      triggerToast(`Notice #${id} cleared and broadcasted!`);
    }
  };

  // Filtered Leave List
  const filteredLeaves = leaveRequests.filter((leave) => {
    const matchesSearch =
      !leaveSearch ||
      leave.applicantName?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      leave.applicantId?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      leave.department?.toLowerCase().includes(leaveSearch.toLowerCase());

    const matchesStatus =
      leaveStatusFilter === 'All' ||
      (leaveStatusFilter === 'Pending' && leave.principalStatus?.includes('Pending')) ||
      leave.principalStatus === leaveStatusFilter;

    const matchesRole =
      leaveRoleFilter === 'All' ||
      leave.applicantRole?.toLowerCase().includes(leaveRoleFilter.toLowerCase());

    const matchesDept =
      leaveDeptFilter === 'All' ||
      leave.department?.toLowerCase().includes(leaveDeptFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesRole && matchesDept;
  });

  // Filtered Circulars List
  const filteredCirculars = circulars.filter((c) => {
    const matchesSearch =
      !circularSearch ||
      c.title?.toLowerCase().includes(circularSearch.toLowerCase()) ||
      c.author?.toLowerCase().includes(circularSearch.toLowerCase());
    const matchesCategory =
      circularCategoryFilter === 'All' || c.category === circularCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate unread / pending badge counts
  const pendingLeavesCount = leaveRequests.filter((l) =>
    l.principalStatus?.includes('Pending')
  ).length;
  const pendingNoticesCount = circulars.filter((c) =>
    c.status?.includes('Pending')
  ).length;

  // Export Academic Analytics summary as CSV
  const handleExportAcademicCsv = () => {
    if (!academicData?.departmentResults) return;
    const headers = ['Department Code', 'Department Name', 'Appeared', 'Passed', 'Pass %', 'Average CGPA', 'Backlogs', 'Distinction %'];
    const rows = academicData.departmentResults.map((d) => [
      d.code,
      `"${d.name}"`,
      d.appeared,
      d.passed,
      `${d.passPct}%`,
      d.avgCgpa,
      d.backlogs,
      `${d.distinctionPct}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Academic_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Academic Performance CSV exported successfully!');
  };

  return (
    <div className="erp-principal-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <aside className="erp-sidebar erp-principal-sidebar">
          <div
            className="erp-sidebar-brand"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                className="erp-director-badge"
                style={{
                  background: '#ffffff',
                  padding: '3px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/logo.png"
                  alt="Apna Campus Logo"
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className="erp-brand-text">
                <h2>Apna Campus</h2>
                <span style={{ color: '#38bdf8' }}>Office of Principal</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="erp-sidebar-nav">
            <button
              className={`erp-nav-item ${activeTab === 'governance' ? 'active' : ''}`}
              onClick={() => setActiveTab('governance')}
            >
              <Building2 size={18} />
              <span>Campus Overview</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'leaves' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaves')}
            >
              <CalendarCheck size={18} />
              <span>Leave Approvals</span>
              {pendingLeavesCount > 0 && (
                <span className="erp-nav-badge">{pendingLeavesCount}</span>
              )}
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'notices' ? 'active' : ''}`}
              onClick={() => setActiveTab('notices')}
            >
              <Megaphone size={18} />
              <span>Official Circulars</span>
              {pendingNoticesCount > 0 && (
                <span className="erp-nav-badge blue">{pendingNoticesCount}</span>
              )}
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'academic_health' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic_health')}
            >
              <Award size={18} />
              <span>Academic Performance</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <CalendarDays size={18} />
              <span>Timetables &amp; Approval</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'report-generation' ? 'active' : ''}`}
              onClick={() => setActiveTab('report-generation')}
            >
              <FileSpreadsheet size={18} />
              <span>Report Generation</span>
            </button>
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="erp-main-content">
        {activeTab === 'governance' ? (
          <RoleDashboardLanding
            account={account}
            roleKey="principal"
            onLogout={onLogout}
            onSwitchRole={onSwitchRole}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNavigateTab={(tabId) => {
              if (tabId === 'academic') setActiveTab('academic_health');
              else if (tabId === 'approvals') setActiveTab('leaves');
              else if (tabId === 'reports') setActiveTab('report-generation');
            }}
          />
        ) : (
          <>
            <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation"
                aria-label="Show Navigation"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1>Principal / Director Command Center</h1>
              <p>Institutional Academic Governance, Executive Clearances &amp; Analytics</p>
            </div>
          </div>

          <div className="erp-header-actions">
            <button
              className="erp-btn erp-btn-secondary"
              onClick={fetchAllData}
              title="Refresh Dashboard Data"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span style={{ fontSize: '0.8rem' }}>Sync</span>
            </button>

            <div className="erp-role-badge">
              <ShieldCheck size={14} /> Executive Clearance Authority
            </div>

            {/* User Profile Pill */}
            <div className="campus-user-pill">
              <div className="campus-user-avatar">PR</div>
              <div className="campus-user-details">
                <strong>{account?.name || 'Dr. Sujit Kumar Khuntia'}</strong>
                <small>Principal &amp; Director</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="erp-content-body">
          {/* Quick Action Navigation Buttons */}
          <div className="principal-quick-actions">
            <button
              className={`principal-quick-btn ${activeTab === 'governance' ? 'active' : ''}`}
              onClick={() => setActiveTab('governance')}
            >
              <Building2 size={15} /> Campus Overview
            </button>
            <button
              className={`principal-quick-btn ${activeTab === 'leaves' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaves')}
            >
              <CalendarCheck size={15} /> Leave Queue ({pendingLeavesCount} Pending)
            </button>
            <button
              className={`principal-quick-btn ${activeTab === 'notices' ? 'active' : ''}`}
              onClick={() => setActiveTab('notices')}
            >
              <Megaphone size={15} /> Publish Circular
            </button>
            <button
              className={`principal-quick-btn ${activeTab === 'academic_health' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic_health')}
            >
              <Award size={15} /> Academic Analytics
            </button>
            <button
              className={`principal-quick-btn ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <CalendarDays size={15} /> Review Timetables
            </button>
            <button
              className={`principal-quick-btn ${activeTab === 'report-generation' ? 'active' : ''}`}
              onClick={() => setActiveTab('report-generation')}
            >
              <FileSpreadsheet size={15} /> Official Reports
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: CAMPUS GOVERNANCE OVERVIEW                       */}
          {/* ======================================================== */}
          {activeTab === 'governance' && (
            <div>
              {/* Primary KPI Grid */}
              <div className="erp-stats-grid">
                <div
                  className="erp-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('academic_health')}
                  title="Click to view Academic Health"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Enrolled Students</span>
                    <Users size={18} color="#38bdf8" />
                  </div>
                  <div className="erp-stat-val">
                    {overviewData?.kpis?.totalStudents?.toLocaleString() || '2,480'}
                  </div>
                  <div className="erp-stat-note">
                    {overviewData?.kpis?.activeDepartments || 8} Active Departments · {overviewData?.kpis?.academicPrograms || 18} Programs
                  </div>
                </div>

                <div
                  className="erp-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('leaves')}
                  title="Click to review faculty leaves"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Teaching Faculty</span>
                    <GraduationCap size={18} color="#10b981" />
                  </div>
                  <div className="erp-stat-val">
                    {overviewData?.kpis?.teachingFaculty || 148}
                  </div>
                  <div className="erp-stat-note">
                    {overviewData?.kpis?.nonTeachingStaff || 74} Non-Teaching Staff On Duty
                  </div>
                </div>

                <div
                  className="erp-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('leaves')}
                  title="Click to manage pending leaves"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Pending Leave Requests</span>
                    <CalendarCheck size={18} color="#f59e0b" />
                  </div>
                  <div className="erp-stat-val" style={{ color: '#d97706' }}>
                    {pendingLeavesCount}
                  </div>
                  <div className="erp-stat-note">
                    Awaiting Principal Final Executive Stamp
                  </div>
                </div>

                <div
                  className="erp-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('academic_health')}
                  title="Click to inspect autonomous results"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Institutional Pass %</span>
                    <Award size={18} color="#a855f7" />
                  </div>
                  <div className="erp-stat-val" style={{ color: '#7c3aed' }}>
                    {overviewData?.kpis?.overallPassRate || 94.2}%
                  </div>
                  <div className="erp-stat-note">
                    Autumn 2026 Autonomous Session
                  </div>
                </div>
              </div>

              {/* Secondary Campus Vital Rates */}
              <div className="principal-kpi-subgrid">
                <div className="principal-kpi-mini">
                  <div className="principal-kpi-mini-title">Student Attendance Rate</div>
                  <div className="principal-kpi-mini-val">
                    {overviewData?.kpis?.studentAttendanceRate || 88.7}%
                  </div>
                  <div className="principal-kpi-mini-note">↑ 2.1% higher than minimum UGC threshold</div>
                </div>
                <div className="principal-kpi-mini">
                  <div className="principal-kpi-mini-title">Faculty Presence Today</div>
                  <div className="principal-kpi-mini-val">
                    {overviewData?.kpis?.facultyAttendanceRate || 96.8}%
                  </div>
                  <div className="principal-kpi-mini-note">142 of 148 professors active on campus</div>
                </div>
                <div className="principal-kpi-mini">
                  <div className="principal-kpi-mini-title">Institutional Clearances</div>
                  <div className="principal-kpi-mini-val">
                    {overviewData?.kpis?.pendingApprovalsCount || 1}
                  </div>
                  <div className="principal-kpi-mini-note" style={{ color: '#0284c7' }}>
                    Academic &amp; exam moderation items
                  </div>
                </div>
                <div className="principal-kpi-mini">
                  <div className="principal-kpi-mini-title">Notices Awaiting Clearance</div>
                  <div className="principal-kpi-mini-val">
                    {pendingNoticesCount}
                  </div>
                  <div className="principal-kpi-mini-note" style={{ color: '#d97706' }}>
                    Ready for Principal sign-off
                  </div>
                </div>
              </div>

              {/* Department Governance Table */}
              <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Academic Department Governance &amp; Syllabus Pace</h3>
                    <p>Live student strength, faculty availability, and continuous evaluation progress across 8 departments</p>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>HOD Name</th>
                        <th>Enrolled Students</th>
                        <th>Faculty On Duty</th>
                        <th>Syllabus Completion</th>
                        <th>Avg CGPA</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(overviewData?.departments || [
                        { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. P. K. Pattnaik', students: 540, faculty: 32, facultyOnDuty: 31, syllabusPace: 74, status: 'On Schedule', avgCgpa: 8.42 },
                        { code: 'AIML', name: 'AI & Machine Learning', hod: 'Dr. S. K. Swain', students: 360, faculty: 22, facultyOnDuty: 21, syllabusPace: 72, status: 'On Schedule', avgCgpa: 8.28 },
                        { code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. M. R. Senapati', students: 380, faculty: 24, facultyOnDuty: 24, syllabusPace: 71, status: 'On Schedule', avgCgpa: 8.10 },
                        { code: 'EEE', name: 'Electrical & Electronics', hod: 'Dr. S. K. Das', students: 290, faculty: 18, facultyOnDuty: 18, syllabusPace: 69, status: 'On Schedule', avgCgpa: 7.85 },
                        { code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. B. K. Rout', students: 320, faculty: 22, facultyOnDuty: 20, syllabusPace: 68, status: 'Review Needed', avgCgpa: 7.68 },
                        { code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. A. K. Nayak', students: 240, faculty: 16, facultyOnDuty: 15, syllabusPace: 67, status: 'Review Needed', avgCgpa: 7.72 },
                      ]).map((dept) => (
                        <tr key={dept.code}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{dept.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {dept.code}</div>
                          </td>
                          <td style={{ color: '#1e293b', fontWeight: 500 }}>{dept.hod}</td>
                          <td style={{ color: '#1e293b', fontWeight: 700 }}>{dept.students}</td>
                          <td style={{ color: '#1e293b' }}>
                            {dept.facultyOnDuty} / {dept.faculty} On Duty
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${dept.syllabusPace}%`,
                                    background: dept.syllabusPace >= 70 ? '#16a34a' : '#d97706',
                                  }}
                                />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: dept.syllabusPace >= 70 ? '#15803d' : '#b45309' }}>
                                {dept.syllabusPace}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: '#0284c7' }}>{dept.avgCgpa}</span>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: dept.status === 'On Schedule' ? '#dcfce7' : '#fef3c7',
                                color: dept.status === 'On Schedule' ? '#15803d' : '#b45309',
                              }}
                            >
                              {dept.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="erp-btn erp-btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => setInspectDeptModal({ open: true, dept })}
                            >
                              <Eye size={13} /> Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Two Column Section: Recent Activities & Upcoming Deadlines */}
              <div className="principal-two-col">
                {/* Institutional Activities */}
                <div className="erp-panel">
                  <div className="erp-panel-header">
                    <div className="erp-panel-title">
                      <h3>Recent Institutional Actions &amp; Clearances</h3>
                      <p>HOD submissions, exam cell filings, and compliance events</p>
                    </div>
                  </div>
                  <div className="principal-activity-list">
                    {(overviewData?.recentActivities || [
                      { time: '10 mins ago', user: 'Dr. P. K. Pattnaik (HOD CSE)', action: 'Recommended Faculty Duty Leave', detail: 'Dr. S. Mohanty for IEEE Conference' },
                      { time: '45 mins ago', user: 'Controller of Examinations', action: 'Submitted Result Moderation Roster', detail: 'Autumn 2026 Continuous Evaluation' },
                      { time: '2 hours ago', user: 'Training & Placement Office', action: 'Requested Placement Circular Clearance', detail: 'Cisco Systems Placement Drive' },
                      { time: '4 hours ago', user: 'Chief Estate Officer', action: 'Submitted Green Campus Audit Certificate', detail: 'Solar Phase II Commissioning' },
                      { time: 'Yesterday', user: 'Registrar Office', action: 'Verified AICTE Mandatory Disclosure', detail: 'Annual Academic Compliance 2026-27' },
                    ]).map((act, idx) => (
                      <div className="principal-activity-item" key={idx}>
                        <div className="principal-activity-dot" />
                        <div className="principal-activity-content">
                          <strong>{act.action}</strong>
                          <p>{act.detail}</p>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>By {act.user}</span>
                        </div>
                        <span className="principal-activity-time">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Deadlines & Examination Milestones */}
                <div className="erp-panel">
                  <div className="erp-panel-header">
                    <div className="erp-panel-title">
                      <h3>Key Academic Deadlines</h3>
                      <p>Institutional milestones and approvals</p>
                    </div>
                  </div>
                  <div className="principal-activity-list">
                    {(overviewData?.upcomingDeadlines || [
                      { date: '25 Oct 2026', title: 'Mid-Semester Marks Clearance', type: 'Academic', priority: 'High' },
                      { date: '28 Oct 2026', title: 'IQAC Quarterly Review Meeting', type: 'Governance', priority: 'High' },
                      { date: '02 Nov 2026', title: 'Autonomous End-Sem Exam Seating', type: 'Exam Cell', priority: 'Critical' },
                      { date: '10 Nov 2026', title: 'NAAC Cycle IV Peer Team Mock Verification', type: 'Accreditation', priority: 'Critical' },
                    ]).map((dl, idx) => (
                      <div className="principal-activity-item" key={idx}>
                        <div className="principal-activity-dot" style={{ background: dl.priority === 'Critical' ? '#e11d48' : '#f59e0b' }} />
                        <div className="principal-activity-content">
                          <strong>{dl.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                            {dl.type} · Due {dl.date}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: dl.priority === 'Critical' ? '#ffe4e6' : '#fef3c7',
                            color: dl.priority === 'Critical' ? '#e11d48' : '#b45309',
                          }}
                        >
                          {dl.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MULTI-LEVEL LEAVE APPROVALS                      */}
          {/* ======================================================== */}
          {activeTab === 'leaves' && (
            <div>
              {/* Filter Controls Bar */}
              <div className="principal-filter-bar">
                <div className="principal-filter-group">
                  <div className="principal-search-input">
                    <Search size={15} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search applicant name, ID, or department..."
                      value={leaveSearch}
                      onChange={(e) => setLeaveSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="principal-select"
                    value={leaveStatusFilter}
                    onChange={(e) => setLeaveStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Principal Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <select
                    className="principal-select"
                    value={leaveRoleFilter}
                    onChange={(e) => setLeaveRoleFilter(e.target.value)}
                  >
                    <option value="All">All Roles</option>
                    <option value="Faculty">Faculty Only</option>
                    <option value="Non-Teaching">Non-Teaching Staff</option>
                    <option value="Student">Students</option>
                  </select>

                  <select
                    className="principal-select"
                    value={leaveDeptFilter}
                    onChange={(e) => setLeaveDeptFilter(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Finance">Finance &amp; Accounts</option>
                  </select>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  Showing {filteredLeaves.length} of {leaveRequests.length} applications
                </div>
              </div>

              {/* Leave Applications Table */}
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Multi-Level Leave Approvals Queue</h3>
                    <p>Applications endorsed by Department HODs awaiting Principal final executive sign-off</p>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Department &amp; Role</th>
                        <th>Leave Type</th>
                        <th>Duration</th>
                        <th>Reason &amp; HOD Endorsement</th>
                        <th>Status</th>
                        <th>Principal Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            <CalendarCheck size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                            <div>No leave applications match the selected filters.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredLeaves.map((leave) => (
                          <tr key={leave.id}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{leave.applicantName}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                ID: {leave.applicantId} · App #{leave.id}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{leave.applicantRole}</div>
                              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{leave.department}</div>
                            </td>
                            <td>
                              <span
                                style={{
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  border: '1px solid #bae6fd',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                {leave.leaveType}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{leave.totalDays} Days</strong>
                              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                                {leave.startDate} to {leave.endDate}
                              </div>
                            </td>
                            <td style={{ maxWidth: '300px' }}>
                              <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.4 }}>
                                {leave.reason}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                                ✓ HOD: {leave.hodRemarks || 'Recommended for Principal approval'}
                              </div>
                              {leave.supportingDoc && (
                                <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FileText size={12} /> {leave.supportingDoc}
                                </div>
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  color:
                                    leave.principalStatus === 'Approved'
                                      ? '#16a34a'
                                      : leave.principalStatus === 'Rejected'
                                      ? '#dc2626'
                                      : '#d97706',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                {leave.principalStatus === 'Approved' && <CheckCircle2 size={13} />}
                                {leave.principalStatus === 'Rejected' && <XCircle size={13} />}
                                {leave.principalStatus}
                              </span>
                            </td>
                            <td>
                              {leave.principalStatus?.includes('Pending') ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="erp-btn erp-btn-primary"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                    onClick={() => setApprovalModal({ open: true, leave })}
                                  >
                                    <Check size={14} /> Approve
                                  </button>
                                  <button
                                    className="erp-btn erp-btn-danger"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                    onClick={() => setRejectionModal({ open: true, leave, reason: '' })}
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                  Decision Logged
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: OFFICIAL NOTICES & CIRCULARS                     */}
          {/* ======================================================== */}
          {activeTab === 'notices' && (
            <div>
              {/* Issue Circular Form */}
              <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Issue Official Principal Circular</h3>
                    <p>Direct broadcast to all student, faculty, and administrative dashboards</p>
                  </div>
                </div>

                <form onSubmit={handleCreateNotice}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Circular Heading / Subject *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Autumn Autonomous Exam Hall Optimization 2026..."
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Target Audience (Scope)
                      </label>
                      <select
                        value={newNotice.scope}
                        onChange={(e) => setNewNotice({ ...newNotice, scope: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '0.88rem',
                        }}
                      >
                        <option value="College-wide">College-wide (All Students &amp; Staff)</option>
                        <option value="All Faculty Only">All Faculty &amp; HODs Only</option>
                        <option value="All Students Only">All Students Only</option>
                        <option value="Final Year Students">Final Year Students Only</option>
                        <option value="Department Specific">Department Heads &amp; Staff</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Notice Priority
                      </label>
                      <select
                        value={newNotice.priority}
                        onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '0.88rem',
                        }}
                      >
                        <option value="Normal">Normal Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Urgent">Urgent / Critical Notice</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Circular Message Content &amp; Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter the full institutional announcement details, relevant dates, and compliance requirements..."
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#0f172a',
                        fontSize: '0.88rem',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <button type="submit" className="erp-btn erp-btn-primary">
                    <Send size={15} /> Publish &amp; Broadcast Official Circular
                  </button>
                </form>
              </div>

              {/* Clearance & Published Circulars Board */}
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Institutional Notice Clearance Board &amp; Archive</h3>
                    <p>Notices submitted by academic departments and exam cell awaiting clearance or published</p>
                  </div>
                  <div className="principal-search-input" style={{ width: '220px' }}>
                    <Search size={14} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search notices..."
                      value={circularSearch}
                      onChange={(e) => setCircularSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Circular Title</th>
                        <th>Target Audience</th>
                        <th>Initiating Department / Author</th>
                        <th>Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCirculars.map((n) => (
                        <tr key={n.id}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{n.title}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {n.id}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                background: '#f1f5f9',
                                color: '#1e293b',
                                border: '1px solid #cbd5e1',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {n.scope}
                            </span>
                          </td>
                          <td style={{ color: '#475569', fontWeight: 500 }}>{n.author}</td>
                          <td style={{ fontSize: '0.8rem', color: '#475569' }}>{n.date}</td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: n.priority === 'Urgent' ? '#fee2e2' : n.priority === 'High' ? '#fef3c7' : '#e0f2fe',
                                color: n.priority === 'Urgent' ? '#dc2626' : n.priority === 'High' ? '#b45309' : '#0369a1',
                              }}
                            >
                              {n.priority || 'Normal'}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                color: n.status?.includes('Approved') || n.status?.includes('Broadcasted') ? '#16a34a' : '#d97706',
                                fontWeight: 700,
                              }}
                            >
                              {n.status}
                            </span>
                          </td>
                          <td>
                            {n.status?.includes('Pending') ? (
                              <button
                                className="erp-btn erp-btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => handleApproveNotice(n.id)}
                              >
                                Approve &amp; Release
                              </button>
                            ) : (
                              <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                                Active on Portals
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ACADEMIC PERFORMANCE & ANALYTICS DASHBOARD       */}
          {/* ======================================================== */}
          {activeTab === 'academic_health' && (
            <div>
              {/* Analytics Filter & Export Bar */}
              <div className="principal-filter-bar">
                <div className="principal-filter-group">
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Filters:</span>
                  <select
                    className="principal-select"
                    value={academicDeptFilter}
                    onChange={(e) => setAcademicDeptFilter(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="CSE">Computer Science &amp; Engg (CSE)</option>
                    <option value="AIML">AI &amp; Machine Learning (AIML)</option>
                    <option value="ECE">Electronics &amp; Comm (ECE)</option>
                    <option value="EEE">Electrical &amp; Electronics (EEE)</option>
                    <option value="MECH">Mechanical Engg (MECH)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                    <option value="MBA">Business Admin (MBA)</option>
                    <option value="MCA">Computer Applications (MCA)</option>
                  </select>

                  <select
                    className="principal-select"
                    value={academicSemesterFilter}
                    onChange={(e) => setAcademicSemesterFilter(e.target.value)}
                  >
                    <option value="All">All Semesters (Sem 1 to 8)</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={handleExportAcademicCsv}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
                  >
                    <Printer size={14} /> Print Summary
                  </button>
                </div>
              </div>

              {/* Top Academic Metric Cards */}
              <div className="erp-stats-grid">
                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Overall Autonomous Pass %</span>
                    <Award size={18} color="#10b981" />
                  </div>
                  <div className="erp-stat-val" style={{ color: '#059669' }}>
                    {academicData?.overallStats?.overallPassPct || 94.2}%
                  </div>
                  <div className="erp-stat-note">
                    {academicData?.overallStats?.yoyImprovement || '+1.4%'} vs Previous Academic Session
                  </div>
                </div>

                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Average Campus CGPA</span>
                    <TrendingUp size={18} color="#0284c7" />
                  </div>
                  <div className="erp-stat-val" style={{ color: '#0284c7' }}>
                    {academicData?.overallStats?.avgCampusCgpa || 8.04}
                  </div>
                  <div className="erp-stat-note">
                    Out of 10.0 scale across {academicData?.overallStats?.totalStudentsEvaluated || 2490} students
                  </div>
                </div>

                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">First Class Distinction Rate</span>
                    <Sparkles size={18} color="#a855f7" />
                  </div>
                  <div className="erp-stat-val" style={{ color: '#7c3aed' }}>
                    {academicData?.overallStats?.firstClassDistinctionRate || 78.6}%
                  </div>
                  <div className="erp-stat-note">Students scoring CGPA &gt;= 7.50</div>
                </div>

                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Supplementary / Backlogs</span>
                    <AlertTriangle size={18} color="#f59e0b" />
                  </div>
                  <div className="erp-stat-val" style={{ color: '#d97706' }}>
                    {academicData?.overallStats?.supplementaryBacklogRate || 5.8}%
                  </div>
                  <div className="erp-stat-note">
                    {academicData?.overallStats?.totalBacklogCases || 144} students undergoing remedial support
                  </div>
                </div>
              </div>

              {/* Semester-wise Pass % Bar Visualizer */}
              <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Semester-wise Autonomous Examination Pass Rates</h3>
                    <p>Continuous internal evaluation &amp; end-semester results progression (Sem 1 to 8)</p>
                  </div>
                </div>

                <div className="semester-trend-grid">
                  {(academicData?.semesterWiseResults || [
                    { semester: 'Sem 1', passPct: 91.5, avgSgpa: 7.82 },
                    { semester: 'Sem 2', passPct: 93.2, avgSgpa: 7.95 },
                    { semester: 'Sem 3', passPct: 89.8, avgSgpa: 7.68 },
                    { semester: 'Sem 4', passPct: 92.4, avgSgpa: 7.88 },
                    { semester: 'Sem 5', passPct: 94.6, avgSgpa: 8.12 },
                    { semester: 'Sem 6', passPct: 95.8, avgSgpa: 8.24 },
                    { semester: 'Sem 7', passPct: 96.5, avgSgpa: 8.35 },
                    { semester: 'Sem 8', passPct: 98.2, avgSgpa: 8.52 },
                  ]).map((sem, idx) => (
                    <div className="semester-bar-card" key={idx}>
                      <div className="semester-bar-wrapper">
                        <div
                          className="semester-bar-fill"
                          style={{
                            height: `${sem.passPct}%`,
                            background: sem.passPct >= 95 ? '#16a34a' : sem.passPct >= 90 ? '#0284c7' : '#d97706',
                          }}
                          title={`${sem.semester}: ${sem.passPct}% Pass Rate, Avg SGPA: ${sem.avgSgpa}`}
                        />
                      </div>
                      <strong>{sem.semester}</strong>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        {sem.passPct}%
                      </span>
                      <small>SGPA {sem.avgSgpa}</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Performance Matrix Table */}
              <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Department Performance Matrix</h3>
                    <p>Comparative examination metrics, average CGPA, and distinction honors</p>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Students Evaluated</th>
                        <th>Passed Students</th>
                        <th>Pass %</th>
                        <th>Avg CGPA</th>
                        <th>Distinction Rate</th>
                        <th>Backlogs</th>
                        <th>Honor Roll Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(academicData?.departmentResults || [
                        { code: 'CSE', name: 'Computer Science & Engineering', appeared: 540, passed: 524, passPct: 97.1, avgCgpa: 8.42, backlogs: 16, distinctionPct: 84.2, honorStudents: 48 },
                        { code: 'AIML', name: 'AI & Machine Learning', appeared: 360, passed: 346, passPct: 96.0, avgCgpa: 8.28, backlogs: 14, distinctionPct: 81.5, honorStudents: 32 },
                        { code: 'ECE', name: 'Electronics & Communication', appeared: 380, passed: 360, passPct: 94.8, avgCgpa: 8.10, backlogs: 20, distinctionPct: 76.8, honorStudents: 28 },
                        { code: 'MCA', name: 'Computer Applications', appeared: 180, passed: 172, passPct: 95.6, avgCgpa: 8.02, backlogs: 8, distinctionPct: 78.0, honorStudents: 16 },
                        { code: 'MBA', name: 'Business Administration', appeared: 180, passed: 171, passPct: 95.0, avgCgpa: 7.90, backlogs: 9, distinctionPct: 75.0, honorStudents: 14 },
                        { code: 'EEE', name: 'Electrical & Electronics', appeared: 290, passed: 268, passPct: 92.4, avgCgpa: 7.85, backlogs: 22, distinctionPct: 72.4, honorStudents: 18 },
                        { code: 'MECH', name: 'Mechanical Engineering', appeared: 320, passed: 290, passPct: 90.6, avgCgpa: 7.68, backlogs: 30, distinctionPct: 68.2, honorStudents: 15 },
                        { code: 'CIVIL', name: 'Civil Engineering', appeared: 240, passed: 214, passPct: 89.2, avgCgpa: 7.72, backlogs: 26, distinctionPct: 66.5, honorStudents: 12 },
                      ]).map((d) => (
                        <tr key={d.code}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{d.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {d.code}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{d.appeared}</td>
                          <td style={{ color: '#15803d', fontWeight: 600 }}>{d.passed}</td>
                          <td>
                            <span
                              style={{
                                fontWeight: 800,
                                color: d.passPct >= 95 ? '#15803d' : d.passPct >= 90 ? '#0284c7' : '#b45309',
                              }}
                            >
                              {d.passPct}%
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{d.avgCgpa}</strong>
                          </td>
                          <td>{d.distinctionPct}%</td>
                          <td>
                            <span style={{ color: d.backlogs > 20 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                              {d.backlogs}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                background: '#fdf4ff',
                                color: '#a855f7',
                                border: '1px solid #f5d0fe',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              ★ {d.honorStudents} Scholars
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dual Panels: Dean's Honor Roll and At-Risk Course Interventions */}
              <div className="academic-dual-panels">
                {/* Dean's Honor Roll */}
                <div className="erp-panel">
                  <div className="erp-panel-header">
                    <div className="erp-panel-title">
                      <h3>Dean's Academic Honor Roll</h3>
                      <p>Top ranking students across autonomous examinations</p>
                    </div>
                  </div>
                  <div>
                    {(academicData?.deansHonorList || [
                      { rank: 1, name: 'Ananya Sharma', rollNo: '2305201001', dept: 'CSE', semester: 'Sem 5', cgpa: 9.85, achievements: 'Autonomous Gold Medalist Contender' },
                      { rank: 2, name: 'Rohan Senapati', rollNo: '2305201004', dept: 'AIML', semester: 'Sem 5', cgpa: 9.72, achievements: 'SIH 2026 Finalist Team Lead' },
                      { rank: 3, name: 'Priyanka Mohapatra', rollNo: '2305201012', dept: 'ECE', semester: 'Sem 5', cgpa: 9.64, achievements: 'IEEE Student Branch President' },
                      { rank: 4, name: 'Sourav Panigrahi', rollNo: '2305201019', dept: 'CSE', semester: 'Sem 5', cgpa: 9.58, achievements: 'Published Q1 Scopus Research Paper' },
                      { rank: 5, name: 'Debashis Rout', rollNo: '2305201027', dept: 'EEE', semester: 'Sem 5', cgpa: 9.46, achievements: 'Solar Innovation Fellowship Award' },
                    ]).map((s) => (
                      <div className="honor-student-badge" key={s.rank}>
                        <div className="honor-rank">#{s.rank}</div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Roll: {s.rollNo} · {s.dept} ({s.semester})
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 600, marginTop: 2 }}>
                            {s.achievements}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed' }}>
                            {s.cgpa}
                          </div>
                          <small style={{ fontSize: '0.7rem', color: '#64748b' }}>CGPA</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* At-Risk Courses & Academic Support Interventions */}
                <div className="erp-panel">
                  <div className="erp-panel-header">
                    <div className="erp-panel-title">
                      <h3>At-Risk Subjects &amp; Remedial Interventions</h3>
                      <p>Courses requiring targeted faculty coaching &amp; academic mentoring</p>
                    </div>
                  </div>
                  <div>
                    {(academicData?.atRiskSubjects || [
                      { code: 'CS502', name: 'Design and Analysis of Algorithms', dept: 'CSE / AIML', semester: 'Sem 5', faculty: 'Dr. Priya Ranjan', passPct: 84.5, failureCount: 22, action: 'Remedial Tutorial Sessions Assigned' },
                      { code: 'EC401', name: 'Signals, Systems & DSP', dept: 'ECE / EEE', semester: 'Sem 4', faculty: 'Dr. M. R. Senapati', passPct: 81.2, failureCount: 28, action: 'Peer Mentoring and Doubt-clearing Classes' },
                      { code: 'ME303', name: 'Applied Thermodynamics & Heat Transfer', dept: 'MECH', semester: 'Sem 3', faculty: 'Dr. B. K. Rout', passPct: 79.4, failureCount: 31, action: 'Laboratory Experiment Correlation Review' },
                      { code: 'CE504', name: 'Structural Analysis & RCC Design', dept: 'CIVIL', semester: 'Sem 5', faculty: 'Dr. A. K. Nayak', passPct: 78.8, failureCount: 24, action: 'HOD Academic Consultation Scheduled' },
                    ]).map((subj) => (
                      <div className="at-risk-item" key={subj.code}>
                        <AlertCircle size={18} className="at-risk-icon" />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>
                              {subj.code} — {subj.name}
                            </strong>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e11d48' }}>
                              {subj.passPct}% Pass Rate
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
                            {subj.dept} ({subj.semester}) · In-Charge: {subj.faculty}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#b91c1c', fontWeight: 600, marginTop: 4 }}>
                            ⚡ Action: {subj.action}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: TIMETABLE MANAGEMENT & APPROVAL                   */}
          {/* ======================================================== */}
          {activeTab === 'timetable' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CalendarDays size={24} color="#1d4ed8" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#1e3a8a' }}>
                      Institutional Timetable Master Approval Authority
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6' }}>
                      Verify room allocations, faculty workload balance, and clash-free lecture schedules across departments
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                    }}
                  >
                    ✓ Autonomous Algorithm Active
                  </span>
                </div>
              </div>
              <TimetableManager account={account} />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: OFFICIAL REPORT GENERATION                       */}
          {/* ======================================================== */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="principal" />
          )}

          {/* ======================================================== */}
          {/* TAB 7: CAMPUS CONNECT (INSTITUTIONAL MESSAGING)         */}
          {/* ======================================================== */}
          {activeTab === 'campus-connect' && (
            <div
              style={{
                height: 'calc(100vh - 120px)',
                minHeight: '680px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                background: '#fff',
                marginBottom: '20px',
              }}
            >
              <CampusConnect account={account} />
            </div>
          )}
        </div>
          </>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: CONFIRM LEAVE APPROVAL                          */}
      {/* ======================================================== */}
      {approvalModal.open && (
        <div className="principal-modal-overlay">
          <div className="principal-modal">
            <div className="principal-modal-header">
              <h3>Confirm Leave Final Executive Approval</h3>
              <button
                type="button"
                onClick={() => setApprovalModal({ open: false, leave: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginTop: 0 }}>
                Are you sure you want to officially approve this application?
              </p>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div><strong>Applicant:</strong> {approvalModal.leave?.applicantName}</div>
                <div><strong>Role &amp; Department:</strong> {approvalModal.leave?.applicantRole} · {approvalModal.leave?.department}</div>
                <div><strong>Leave Type:</strong> {approvalModal.leave?.leaveType} ({approvalModal.leave?.totalDays} Days)</div>
                <div><strong>Dates:</strong> {approvalModal.leave?.startDate} to {approvalModal.leave?.endDate}</div>
                <div><strong>Reason:</strong> {approvalModal.leave?.reason}</div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.75rem' }}>
                Approval will be immutably recorded in the institutional audit ledger and notifications dispatched.
              </p>
            </div>
            <div className="principal-modal-footer">
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => setApprovalModal({ open: false, leave: null })}
              >
                Cancel
              </button>
              <button className="erp-btn erp-btn-primary" onClick={confirmApproveLeave}>
                <Check size={15} /> Yes, Approve Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REJECT LEAVE WITH MANDATORY REASON             */}
      {/* ======================================================== */}
      {rejectionModal.open && (
        <div className="principal-modal-overlay">
          <div className="principal-modal">
            <div className="principal-modal-header">
              <h3 style={{ color: '#dc2626' }}>Reject Leave Application</h3>
              <button
                type="button"
                onClick={() => setRejectionModal({ open: false, leave: null, reason: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <p style={{ fontSize: '0.88rem', color: '#334155', marginTop: 0 }}>
                Rejecting application for <strong>{rejectionModal.leave?.applicantName}</strong> ({rejectionModal.leave?.department}).
              </p>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Mandatory Rejection Reason &amp; Official Remarks *
              </label>
              <textarea
                rows={3}
                placeholder="State the institutional policy reason for rejection (e.g. Critical academic schedule clash, insufficient supporting documentation, pending exam duty)..."
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div className="principal-modal-footer">
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => setRejectionModal({ open: false, leave: null, reason: '' })}
              >
                Cancel
              </button>
              <button className="erp-btn erp-btn-danger" onClick={confirmRejectLeave}>
                <X size={15} /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INSPECT DEPARTMENT DETAILS                     */}
      {/* ======================================================== */}
      {inspectDeptModal.open && inspectDeptModal.dept && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '600px' }}>
            <div className="principal-modal-header">
              <h3>Department Academic Audit: {inspectDeptModal.dept.name}</h3>
              <button
                type="button"
                onClick={() => setInspectDeptModal({ open: false, dept: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Head of Department</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectDeptModal.dept.hod}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Total Enrolled Students</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectDeptModal.dept.students}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Faculty Presence</small>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>
                    {inspectDeptModal.dept.facultyOnDuty} of {inspectDeptModal.dept.faculty} Active
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Syllabus Pace</small>
                  <div style={{ fontWeight: 700, color: '#0284c7' }}>{inspectDeptModal.dept.syllabusPace}% Completed</div>
                </div>
              </div>
              <div style={{ background: '#eff6ff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.85rem', color: '#1e3a8a' }}>
                <strong>Autonomous Compliance Note:</strong> Continuous evaluation verified for {inspectDeptModal.dept.code}. Internal assessments meet autonomous exam cell benchmarks.
              </div>
            </div>
            <div className="principal-modal-footer">
              <button
                className="erp-btn erp-btn-secondary"
                onClick={() => setInspectDeptModal({ open: false, dept: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
