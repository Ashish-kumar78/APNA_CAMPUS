import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Unlock,
  FileText,
  Search,
  Download,
  LogOut,
  Layers,
  ArrowRight,
  Eye,
  MessageSquare,
  X,
  Menu,
  Bell,
  Calendar,
  Filter,
  BarChart2,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  ClipboardList,
  CheckSquare,
  Square,
  UserCheck,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';
import TakeAttendanceModule from './Attendance/TakeAttendanceModule.jsx';
import './HodPortal.css';
import '../components/AdminPortal.css';
import { downloadDepartmentGazettePdf } from '../utils/pdfGenerator';
import { initialApprovalQueue, initialFaculty, initialSubjects } from '../data/collegeData.js';
import { erpStore } from '../services/erpStore.js';
import MarksManagementModule from '../marks/MarksManagementModule.jsx';
import { api, hodApi } from '../services/api.js';
import { getDocumentsForRole, getAllStudents } from '../services/studentStore.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import DigitalAnswerSheetEvaluationSystem from './DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx';
<<<<<<< HEAD
import TimetableManager from './TimetableManagement/TimetableManager.jsx';
=======
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
>>>>>>> origin/teammate-work

function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function HodPortal({ account, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvalQueue, setApprovalQueue] = useState(initialApprovalQueue);
  const [students, setStudents] = useState(() => getAllStudents());
  const [faculty, setFaculty] = useState(initialFaculty);
  const [subjects, setSubjects] = useState(initialSubjects);

  // Filters & Sub-states
  const [workQueueFilter, setWorkQueueFilter] = useState('ALL'); // ALL, CRITICAL, HIGH, MEDIUM
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('ALL');
  const [approvalSemFilter, setApprovalSemFilter] = useState('ALL');
  const [approvalSearch, setApprovalSearch] = useState('');

  // Student directory filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSemFilter, setStudentSemFilter] = useState('ALL');
  const [studentSectionFilter, setStudentSectionFilter] = useState('ALL');
  const [studentAttendanceFilter, setStudentAttendanceFilter] = useState('ALL'); // ALL, SHORTAGE, REGULAR, HIGH
  const [studentRiskFilter, setStudentRiskFilter] = useState('ALL'); // ALL, AT_RISK

  // Interactive Modals State
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [selectedFacultyModal, setSelectedFacultyModal] = useState(null);
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);
  const [inspectingMarksModal, setInspectingMarksModal] = useState(null);
  const [remedialActionModal, setRemedialActionModal] = useState(null);
  const [remedialForm, setRemedialForm] = useState({
    type: 'Extra Tutorial',
    notes: 'Scheduled special weekend problem-solving tutorial for Data Structures.',
    followUpDate: '2026-10-16'
  });

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingMarksItem, setReviewingMarksItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Report Builder State
  const [selectedReportType, setSelectedReportType] = useState('GAZETTE');
  const [reportSemFilter, setReportSemFilter] = useState('Semester 5');
  const [reportSectionFilter, setReportSectionFilter] = useState('Section A');

  // Documents
  const [hodDocs, setHodDocs] = useState(() => getDocumentsForRole('hod'));
  const [hodDocsSearch, setHodDocsSearch] = useState('');
  const [docsViewMode, setDocsViewMode] = useState('student_docs');

  useEffect(() => {
    const handleDocsChange = () => setHodDocs(getDocumentsForRole('hod'));
    const handleStudentsChange = () => setStudents(getAllStudents());
    window.addEventListener('cms_documents_changed', handleDocsChange);
    window.addEventListener('cms_student_documents_changed', handleDocsChange);
    window.addEventListener('cms_students_changed', handleStudentsChange);
    return () => {
      window.removeEventListener('cms_documents_changed', handleDocsChange);
      window.removeEventListener('cms_student_documents_changed', handleDocsChange);
      window.removeEventListener('cms_students_changed', handleStudentsChange);
    };
  }, []);

  const atRiskStudents = useMemo(() => {
    return students.filter(s => erpStore.calculateStudentRisk(s).isAtRisk);
  }, [students]);

  const atRiskCount = atRiskStudents.length;
  const pendingCount = approvalQueue.filter(q => q.status === 'Pending').length;
  const approvedCount = approvalQueue.filter(q => q.status === 'Approved').length;
  const rejectedCount = approvalQueue.filter(q => q.status === 'Rejected').length;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Actions
  const handleApprove = async (id, subject) => {
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Approved',
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          hodRemarks: 'Approved by HOD. Verified continuous internal assessment components.'
        };
      }
      return item;
    }));
    erpStore.logAuditEvent({
      user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
      role: 'HOD',
      action: 'Approved Faculty Continuous Assessment Marks',
      target: `Subject: ${subject} (Queue: ${id})`,
      oldValue: 'Pending HOD Approval',
      newValue: 'Approved & Moderated for Exam Cell',
    });
    showToast(`✓ Marks for ${subject} officially APPROVED and published to Exam Cell!`);
    try {
      await api.hodApproveMarks(id);
    } catch {
      // Handled
    }
    if (inspectingMarksModal && inspectingMarksModal.id === id) {
      setInspectingMarksModal(null);
    }
  };

  const handleOpenReject = (item) => {
    setRejectingItem(item);
    setRejectionReason('Quiz 4 marks are missing for 4 students. Please complete evaluation and resubmit.');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    const currentItem = rejectingItem;
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === currentItem.id) {
        return {
          ...item,
          status: 'Rejected',
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          hodRemarks: rejectionReason
        };
      }
      return item;
    }));
    erpStore.logAuditEvent({
      user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
      role: 'HOD',
      action: 'Rejected Marks Assessment & Returned to Faculty',
      target: `Subject: ${currentItem.subject}`,
      oldValue: 'Submitted for Approval',
      newValue: `Revision Required: ${rejectionReason}`,
    });
    showToast(`Marks for ${currentItem.subject} returned to faculty for revision.`);
    setRejectingItem(null);
    if (inspectingMarksModal && inspectingMarksModal.id === currentItem.id) {
      setInspectingMarksModal(null);
    }
    try {
      await api.hodRejectMarks(currentItem.id, rejectionReason);
    } catch {
      // Handled
    }
  };

  const handleUnlockMarks = async (id, subject) => {
    setApprovalQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Pending',
          hodRemarks: 'HOD unlocked marks for faculty correction.'
        };
      }
      return item;
    }));
    erpStore.logAuditEvent({
      user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
      role: 'HOD',
      action: 'Unlocked Marks Sheet for Corrections',
      target: `Subject: ${subject}`,
      oldValue: 'Locked',
      newValue: 'Unlocked for Faculty Edits',
    });
    showToast(`Marks for ${subject} have been unlocked. Faculty can now edit.`);
    try {
      await api.hodUnlockMarks(id, 'Unlocked for corrections');
    } catch {
      // Handled
    }
  };

  // Prioritized work queue
  const workQueueItems = useMemo(() => {
    const list = [
      {
        id: 'wq-101',
        title: 'Review and verify Data Structures (CS501) Continuous Evaluation marks',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        facultyName: 'Dr. S. Mohanty',
        submissionDate: 'Today, 02:30 PM',
        dueDate: '12 Oct 2026',
        priority: 'CRITICAL',
        status: 'Action Required',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Inspect 4 missing marks and approve or return for correction',
        linkTab: 'approval'
      },
      {
        id: 'wq-102',
        title: 'Conduct Academic Support Review for At-Risk Students',
        subjectCode: 'CS501',
        subjectName: 'Data Structures',
        cohort: 'Semester 5 · Section A',
        facultyName: 'Prof. B. Panda (Mentor)',
        submissionDate: 'Yesterday, 05:00 PM',
        dueDate: '14 Oct 2026',
        priority: 'HIGH',
        status: 'Follow-up Pending',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Verify compensatory tutorial attendance for Debasish Panda',
        linkTab: 'at-risk'
      },
      {
        id: 'wq-103',
        title: 'Curriculum Milestone Sign-off: DAA (CS504) Mid-Term Coverage',
        subjectCode: 'CS504',
        subjectName: 'Design & Analysis of Algorithms',
        cohort: 'Semester 5 · Section C',
        facultyName: 'Prof. S. K. Swain',
        submissionDate: '07 Oct 2026',
        dueDate: '15 Oct 2026',
        priority: 'MEDIUM',
        status: 'Under Review',
        reviewer: 'Dr. P. K. Pattnaik (HOD)',
        nextAction: 'Verify completion of Module II (Dynamic Programming & Greedy)',
        linkTab: 'subjects'
      }
    ];
    if (workQueueFilter === 'ALL') return list;
    return list.filter(item => item.priority === workQueueFilter);
  }, [workQueueFilter]);

  // Filtered approval queue
  const filteredApprovalQueue = useMemo(() => {
    return approvalQueue.filter(item => {
      if (approvalStatusFilter !== 'ALL' && item.status !== approvalStatusFilter) return false;
      if (approvalSemFilter !== 'ALL' && item.semester !== approvalSemFilter) return false;
      if (approvalSearch) {
        const q = approvalSearch.toLowerCase();
        const match =
          item.subject.toLowerCase().includes(q) ||
          item.subjectCode.toLowerCase().includes(q) ||
          item.faculty.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [approvalQueue, approvalStatusFilter, approvalSemFilter, approvalSearch]);

  // Filtered department students
  const filteredDepartmentStudents = useMemo(() => {
    return students.filter(s => {
      if (studentSemFilter !== 'ALL' && (s.semester || 'Semester 5') !== studentSemFilter) return false;
      if (studentSectionFilter !== 'ALL' && !((s.section || 'Section A').includes(studentSectionFilter.replace('Section ', '')))) return false;

      const att = s.attendance || 85;
      if (studentAttendanceFilter === 'SHORTAGE' && att >= 75) return false;
      if (studentAttendanceFilter === 'REGULAR' && (att < 75 || att > 85)) return false;
      if (studentAttendanceFilter === 'HIGH' && att <= 85) return false;

      if (studentRiskFilter === 'AT_RISK') {
        const risk = erpStore.calculateStudentRisk(s);
        if (!risk.isAtRisk) return false;
      }

      if (studentSearch) {
        const q = studentSearch.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.includes(q) ||
          (s.registrationNumber && s.registrationNumber.includes(q)) ||
          (s.studentId && s.studentId.includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [students, studentSemFilter, studentSectionFilter, studentAttendanceFilter, studentRiskFilter, studentSearch]);

  return (
    <div className="hod-portal-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          borderLeft: '4px solid #0f766e'
        }}>
          <CheckCircle2 size={18} color="#2dd4bf" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="hod-header">
        <div className="hod-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
          <div className="hod-brand-icon" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="hod-brand-text">
            <h1>APNA CAMPUS · DEPARTMENT OF CSE</h1>
            <p>Head of Department Academic Governance Portal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="campus-user-pill">
            <div className="campus-user-avatar">HOD</div>
            <div className="campus-user-details">
              <strong>{account?.name || 'Dr. P. K. Pattnaik'}</strong>
              <small>HOD · Computer Science &amp; Engg</small>
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

      {/* Main Layout */}
      <div className={`hod-layout ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="hod-sidebar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0.4rem 0.6rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>HOD Governance</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'rgba(15, 23, 42, 0.08)',
                  border: 'none',
                  color: '#64748b',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close Navigation"
              >
                <X size={16} />
              </button>
            </div>
            <button
              className={`hod-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Layers size={17} /> Dashboard
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'take-attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('take-attendance')}
            >
              <ClipboardCheck size={17} /> Take Attendance
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'digital-evaluation' ? 'active' : ''}`}
              onClick={() => setActiveTab('digital-evaluation')}
              style={{
                background: activeTab === 'digital-evaluation' ? undefined : 'linear-gradient(90deg, rgba(13, 148, 136, 0.12), rgba(16, 185, 129, 0.12))',
                border: '1px solid rgba(13, 148, 136, 0.35)'
              }}
            >
              <FileText size={17} style={{ color: '#0d9488' }} /> Digital Evaluation &amp; Approval
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'approval' ? 'active' : ''}`}
              onClick={() => setActiveTab('approval')}
            >
              <CheckCircle2 size={17} /> Marks Approval ({pendingCount})
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <GraduationCap size={17} /> Department Students
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'at-risk' ? 'active' : ''}`}
              onClick={() => setActiveTab('at-risk')}
            >
              <AlertTriangle size={17} /> At-Risk Students Alert
              {atRiskCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                  {atRiskCount}
                </span>
              )}
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'faculty' ? 'active' : ''}`}
              onClick={() => setActiveTab('faculty')}
            >
              <Users size={17} /> Department Faculty
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'subjects' ? 'active' : ''}`}
              onClick={() => setActiveTab('subjects')}
            >
              <BookOpen size={17} /> Department Subjects
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <Calendar size={17} color="#2563eb" /> Timetable &amp; Schedules
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'report-generation' ? 'active' : ''}`}
              onClick={() => setActiveTab('report-generation')}
            >
              <FileSpreadsheet size={17} /> Report Generation
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileText size={17} /> Department Gazette
            </button>
            <button
              className={`hod-nav-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => { setHodDocs(getDocumentsForRole('hod')); setActiveTab('documents'); }}
            >
              <Download size={17} /> Documents
              <span style={{ marginLeft: 'auto', background: '#7c3aed', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                {hodDocs.length}
              </span>
            </button>
          </aside>
        )}

        {/* Content Pane */}
        <main className="hod-main">
          {/* TAKE ATTENDANCE TAB */}
          {activeTab === 'take-attendance' && (
            <div style={{ marginBottom: '24px' }}>
              <TakeAttendanceModule
                account={account}
                role="hod"
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            </div>
          )}

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 120px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB: DIGITAL ANSWER SHEET EVALUATION SYSTEM */}
          {activeTab === 'digital-evaluation' && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '20px' }}>
              <DigitalAnswerSheetEvaluationSystem initialRole="hod" currentUser={account} />
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <RoleDashboardLanding
              roleKey="hod"
              account={account}
              onLogout={onLogout}
              onNavigate={(target) => {
                if (target === 'hod-review') setActiveTab('approval');
                else if (target === 'hod-faculty') setActiveTab('faculty');
                else if (target === 'hod-dept') setActiveTab('students');
                else setActiveTab('approval');
              }}
            />
          )}

          {false && activeTab === 'dashboard' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Dr. P. K. Pattnaik'}</h2>
                  <p>HOD Academic Governance Workspace · Department of Computer Science &amp; Engineering · Autumn 2026-27.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button className="admin-action-btn-secondary" onClick={() => setActiveTab('reports')}>
                    <FileSpreadsheet size={14} /> Department Gazette
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setActiveTab('approval')}>
                    Review Marks Queue ({pendingCount})
                  </button>
                </div>
              </div>

              {/* Data Scope Integrity Notice Banner */}
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderLeft: '4px solid #0f766e', padding: '10px 14px', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#134e4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>Authoritative Scope:</strong> Department enrollment represents <strong>540 active students</strong> across 6 sections (distinct from course total 91 and section teaching cohort 32).
                </span>
                <span className="admin-badge approved">Autonomous Affiliated</span>
              </div>

              {/* 10 Clickable Operational KPI Cards */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('students')} title="Click to view department students directory">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Department Students</span>
                    <div className="admin-kpi-card-icon blue"><GraduationCap size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">540</div>
                  <small style={{ color: '#2563eb', fontWeight: 600 }}>Across 6 sections →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('faculty')} title="Click to view department teaching faculty">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Department Faculty</span>
                    <div className="admin-kpi-card-icon emerald"><Users size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">32</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Active Teaching Staff →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('subjects')} title="Click to view curricular subjects">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Curriculum Subjects</span>
                    <div className="admin-kpi-card-icon purple"><BookOpen size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">48</div>
                  <small style={{ color: '#7c3aed', fontWeight: 600 }}>Under Autonomous Council →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('approval')} title="Click to review marks approval queue">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Marks Awaiting Approval</span>
                    <div className="admin-kpi-card-icon amber"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>{pendingCount}</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Action Required →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('approval')} title="Click to view finalized marks">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Approved &amp; Locked</span>
                    <div className="admin-kpi-card-icon emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>{approvedCount}</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Published to Exam Cell →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('approval')} title="Click to view overdue submissions">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Overdue Submissions</span>
                    <div className="admin-kpi-card-icon red"><Clock size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#dc2626' }}>1</div>
                  <small style={{ color: '#dc2626', fontWeight: 600 }}>DAA (CS504) Mid-1 →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('at-risk')} title="Click to view at-risk students registry">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">At-Risk Students</span>
                    <div className="admin-kpi-card-icon red"><AlertCircle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#dc2626' }}>{atRiskCount}</div>
                  <small style={{ color: '#dc2626', fontWeight: 600 }}>Attendance &amp; GPA Alerts →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('reports')} title="Click to view attendance compliance">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Attendance Compliance</span>
                    <div className="admin-kpi-card-icon blue"><Calendar size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#0f766e' }}>88.6%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>Dept Aggregate Turnout →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('reports')} title="Click to view assessment completion">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Assessment Attainment</span>
                    <div className="admin-kpi-card-icon purple"><TrendingUp size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#7c3aed' }}>92.4%</div>
                  <small style={{ color: '#7c3aed', fontWeight: 600 }}>11/13 Tasks Done →</small>
                </div>

                <div className="admin-kpi-card clickable-kpi" onClick={() => setActiveTab('reports')} title="Click to view faculty compliance audit">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Faculty Compliance</span>
                    <div className="admin-kpi-card-icon emerald"><CheckSquare size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>93.8%</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>30/32 Submissions On-time →</small>
                </div>
              </div>

              {/* HOD Prioritized Work Queue */}
              <div className="hod-work-queue-container">
                <div className="work-queue-header">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                      Department Action Centre &amp; Priority Work Queue
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Prioritized operational tasks requiring Head of Department review, sign-off, or intervention.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(p => (
                      <button
                        key={p}
                        className={`admin-action-btn-secondary ${workQueueFilter === p ? 'active' : ''}`}
                        style={{
                          fontSize: '0.74rem',
                          padding: '3px 10px',
                          background: workQueueFilter === p ? '#0f766e' : '#fff',
                          color: workQueueFilter === p ? '#fff' : '#475569',
                          borderColor: workQueueFilter === p ? '#0f766e' : '#cbd5e1'
                        }}
                        onClick={() => setWorkQueueFilter(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {workQueueItems.map(item => (
                    <div key={item.id} className="work-queue-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                        <span className={`priority-pill priority-${item.priority.toLowerCase()}`}>
                          {item.priority}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            <strong>{item.subjectName} ({item.subjectCode})</strong> · {item.cohort} · Faculty: {item.facultyName} · Due: <strong>{item.dueDate}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="admin-badge pending" style={{ fontSize: '0.72rem' }}>
                          {item.status}
                        </span>
                        <button
                          className="admin-action-btn-primary"
                          style={{ fontSize: '0.75rem', padding: '5px 10px', background: '#0f766e' }}
                          onClick={() => setActiveTab(item.linkTab)}
                        >
                          Execute Action <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Analytics & Visualizations Grid */}
              <div className="hod-analytics-grid">
                {/* 1. Grade Band Distribution */}
                <div className="analytics-chart-card">
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a' }}>
                    Department Continuous Assessment Attainment Distribution
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Distribution of 540 department students across autonomous academic grade boundaries.
                  </p>

                  <div className="distribution-bar-wrap">
                    <div className="distribution-bar-bg">
                      <div className="distribution-segment" style={{ width: '24%', background: '#10b981' }} title="Outstanding (O: >=90%): 24%" />
                      <div className="distribution-segment" style={{ width: '42%', background: '#3b82f6' }} title="Excellent (A+: 80-89%): 42%" />
                      <div className="distribution-segment" style={{ width: '20%', background: '#6366f1' }} title="Very Good (A: 70-79%): 20%" />
                      <div className="distribution-segment" style={{ width: '11%', background: '#f59e0b' }} title="Good (B+: 60-69%): 11%" />
                      <div className="distribution-segment" style={{ width: '3%', background: '#ef4444' }} title="Remedial Support (<60%): 3%" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} /> Outstanding (O: &gt;= 90%)</span>
                      <strong>130 Students (24.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} /> Excellent (A+: 80 - 89%)</span>
                      <strong>227 Students (42.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#6366f1' }} /> Very Good (A: 70 - 79%)</span>
                      <strong>108 Students (20.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }} /> Good (B+: 60 - 69%)</span>
                      <strong>59 Students (11.0%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }} /> Remedial Support (&lt; 60%)</span>
                      <strong style={{ color: '#dc2626' }}>16 Students (3.0%)</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Subject Assessment Completion Rates */}
                <div className="analytics-chart-card">
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a' }}>
                    Curricular Assessment Completion Progress
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Component entry status across core Autumn Semester 5 courses.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { code: 'CS501', name: 'Data Structures', pct: 82.0, status: 'Review Needed', color: '#0f766e' },
                      { code: 'CS502', name: 'Operating Systems', pct: 100.0, status: 'Approved', color: '#059669' },
                      { code: 'CS503', name: 'Database Management', pct: 100.0, status: 'Approved', color: '#059669' },
                      { code: 'CS504', name: 'Design & Analysis of Algorithms', pct: 75.0, status: 'Returned for Revision', color: '#d97706' },
                      { code: 'CS505', name: 'Formal Language & Automata', pct: 90.0, status: 'Draft Ready', color: '#2563eb' },
                      { code: 'CS506', name: 'Advanced Java Programming', pct: 100.0, status: 'Approved', color: '#059669' }
                    ].map(c => (
                      <div key={c.code}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{c.code}: {c.name}</span>
                          <span style={{ color: c.pct === 100 ? '#059669' : c.color, fontWeight: 700 }}>{c.pct}% ({c.status})</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Notices & Academic Calendar */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Department Announcements &amp; Examination Calendar</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Official circulars, HOD advisories, and autonomous university moderation milestones.
                    </p>
                  </div>
                </div>

                <div className="department-notices-grid">
                  <div className="notice-card urgent">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="priority-pill priority-critical">URGENT DEADLINE</span>
                        <small style={{ color: '#64748b' }}>15 Oct 2026</small>
                      </div>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '0.92rem', color: '#0f172a' }}>
                        Mid-Semester Continuous Internal Assessment Cutoff
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        All continuous evaluation marks for 5th semester courses must be verified, signed, and approved by respective HODs by 15 Oct 2026, 05:00 PM for Exam Cell publication.
                      </p>
                    </div>
                  </div>

                  <div className="notice-card">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="admin-badge active">ACADEMIC COUNCIL</span>
                        <small style={{ color: '#64748b' }}>18 Oct 2026</small>
                      </div>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '0.92rem', color: '#0f172a' }}>
                        Department Academic Review Meeting
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        Department faculty meeting on syllabus milestones, lab manual upgrades, and autonomous examination paper setting in Conference Room 2 at 03:00 PM.
                      </p>
                    </div>
                  </div>

                  <div className="notice-card urgent">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="priority-pill priority-high">ATTENDANCE AUDIT</span>
                        <small style={{ color: '#64748b' }}>08 Oct 2026</small>
                      </div>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '0.92rem', color: '#0f172a' }}>
                        Statutory 75% Lecture Attendance Advisory
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        Condonation forms for students falling between 65%-74% with certified medical reasons must be countersigned by HOD prior to admit card generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARKS APPROVAL WORKFLOW */}
          {activeTab === 'approval' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Marks Approval &amp; Moderation Workflow</h2>
                  <p>Faculty continuous evaluation submissions. Inspect full matricial marks, verify components, approve or return with actionable feedback.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="admin-action-btn-secondary" onClick={() => downloadDepartmentGazettePdf('CSE Department Moderated Marks Gazette')}>
                    <Download size={14} /> Download Moderated Gazette
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>STATUS</small>
                    <select
                      className="admin-form-select"
                      value={approvalStatusFilter}
                      onChange={e => setApprovalStatusFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Statuses ({approvalQueue.length})</option>
                      <option value="Pending">Pending Review ({pendingCount})</option>
                      <option value="Approved">Approved &amp; Moderated ({approvedCount})</option>
                      <option value="Rejected">Revision Requested ({rejectedCount})</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                    <select
                      className="admin-form-select"
                      value={approvalSemFilter}
                      onChange={e => setApprovalSemFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 3">Semester 3</option>
                    </select>
                  </div>
                </div>

                <div className="admin-search-wrap" style={{ minWidth: '240px' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search subject code or faculty..."
                    value={approvalSearch}
                    onChange={e => setApprovalSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Submissions Queue */}
              <div style={{ marginBottom: '1.5rem' }}>
                {filteredApprovalQueue.map(item => (
                  <div key={item.id} className={`hod-approval-card ${item.status.toLowerCase()}`}>
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.subject}</strong>
                        <code>{item.subjectCode}</code>
                        <span className={`admin-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                        Submitted by: <strong>{item.faculty}</strong> · Cohort: <strong>{item.semester} ({item.section})</strong> · {item.cohortSize || 32} Cohort Examinees ({item.courseTotalEnrollment || 91} Course Total)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Submitted on: {item.submittedDate || 'Today'} · {item.componentsCount || 13} CIA Evaluation Columns
                      </div>
                      {item.hodRemarks && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: item.status === 'Rejected' ? '#fff1f2' : '#f0fdf4', color: item.status === 'Rejected' ? '#9f1239' : '#166534', border: `1px solid ${item.status === 'Rejected' ? '#fecdd3' : '#bbf7d0'}` }}>
                          <strong>HOD Review Note:</strong> {item.hodRemarks}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="admin-action-btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                        onClick={() => setInspectingMarksModal(item)}
                      >
                        <Eye size={15} /> Inspect Marks Matrix
                      </button>

                      {item.status === 'Pending' && (
                        <>
                          <button className="hod-btn-approve" onClick={() => handleApprove(item.id, item.subject)}>
                            <CheckCircle2 size={15} /> Approve Marks
                          </button>
                          <button className="hod-btn-reject" onClick={() => handleOpenReject(item)}>
                            <XCircle size={15} /> Reject with Reason
                          </button>
                        </>
                      )}

                      {item.status === 'Approved' && (
                        <button className="hod-btn-unlock" onClick={() => handleUnlockMarks(item.id, item.subject)}>
                          <Unlock size={15} /> Unlock Marks
                        </button>
                      )}

                      {item.status === 'Rejected' && (
                        <span style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600 }}>
                          Awaiting Faculty Resubmission
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {filteredApprovalQueue.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    No marks submissions found matching your selected criteria.
                  </div>
                )}
              </div>

              {/* Integrated Marks View for the Selected Subject */}
              <div className="admin-card" style={{ marginTop: '2rem' }}>
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Live Faculty Grade Sheet Preview (Continuous Evaluation)</h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      {reviewingMarksItem ? `Inspecting ${reviewingMarksItem.subject} (${reviewingMarksItem.faculty})` : 'Showing Data Structures continuous evaluation matrix'}
                    </p>
                  </div>
                </div>
                <MarksManagementModule initialRole="teacher" />
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENT STUDENTS */}
          {activeTab === 'students' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Students ({filteredDepartmentStudents.length} of {students.length} Enrolled)</h2>
                  <p>Department student registry for B.Tech Computer Science &amp; Engineering cohorts across 6 sections.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => exportToCsv('CSE_Department_Students.csv', filteredDepartmentStudents.map(s => ({ Roll: s.rollNumber, Name: s.name, StudentID: s.studentId, Semester: s.semester, Section: s.section, Attendance: `${s.attendance || 85}%`, CGPA: s.cgpa })))}
                  >
                    <FileSpreadsheet size={14} /> Export CSV Roster
                  </button>
                </div>
              </div>

              {/* Multi-criteria filter toolbar */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                    <select
                      className="admin-form-select"
                      value={studentSemFilter}
                      onChange={e => setStudentSemFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="Semester 5">Semester 5 (3rd Year)</option>
                      <option value="Semester 3">Semester 3 (2nd Year)</option>
                      <option value="Semester 1">Semester 1 (1st Year)</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SECTION</small>
                    <select
                      className="admin-form-select"
                      value={studentSectionFilter}
                      onChange={e => setStudentSectionFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Sections</option>
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>ATTENDANCE TIER</small>
                    <select
                      className="admin-form-select"
                      value={studentAttendanceFilter}
                      onChange={e => setStudentAttendanceFilter(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="ALL">All Attendance Tiers</option>
                      <option value="SHORTAGE">Shortage Only (&lt; 75%)</option>
                      <option value="REGULAR">Regular (75% - 85%)</option>
                      <option value="HIGH">High Attendance (&gt; 85%)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="admin-action-btn-secondary"
                    style={{
                      marginTop: '16px',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      background: studentRiskFilter === 'AT_RISK' ? '#dc2626' : '#fff',
                      color: studentRiskFilter === 'AT_RISK' ? '#fff' : '#dc2626',
                      borderColor: studentRiskFilter === 'AT_RISK' ? '#dc2626' : '#fca5a5'
                    }}
                    onClick={() => setStudentRiskFilter(studentRiskFilter === 'AT_RISK' ? 'ALL' : 'AT_RISK')}
                  >
                    <AlertCircle size={12} /> At-Risk Only ({atRiskCount})
                  </button>
                </div>

                <div className="admin-search-wrap" style={{ minWidth: '240px' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search name, roll, or ID..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Roll #</th>
                      <th>Student Name</th>
                      <th>Registration / ID</th>
                      <th>Cohort</th>
                      <th>Attendance</th>
                      <th>CGPA</th>
                      <th>Academic Health &amp; Risk</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartmentStudents.map(s => {
                      const risk = erpStore.calculateStudentRisk(s);
                      const isShortage = (s.attendance || 85) < 75;
                      return (
                        <tr key={s.id}>
                          <td><strong>#{s.rollNumber}</strong></td>
                          <td style={{ fontWeight: 600 }}>
                            <div>{s.name}</div>
                            <small style={{ color: '#64748b', fontSize: '0.72rem' }}>{s.email}</small>
                          </td>
                          <td><code>{s.registrationNumber || s.studentId}</code></td>
                          <td>{s.semester || 'Semester 5'} · {s.section || 'Section A'}</td>
                          <td>
                            <strong style={{ color: isShortage ? '#dc2626' : '#0f766e' }}>
                              {s.attendance || 85}%
                            </strong>
                            {isShortage && (
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#b91c1c', fontWeight: 700 }}>
                                Shortage Alert
                              </span>
                            )}
                          </td>
                          <td><strong style={{ color: '#059669' }}>{s.cgpa}</strong></td>
                          <td>
                            <span
                              style={{
                                background: `${risk.badgeColor}15`,
                                color: risk.badgeColor,
                                border: `1px solid ${risk.badgeColor}35`,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={risk.reasons.length > 0 ? risk.reasons.join(' | ') : 'Academic performance in good standing'}
                            >
                              {risk.isAtRisk && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: risk.badgeColor }} />}
                              {risk.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="admin-action-btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                onClick={() => setSelectedStudentModal({ student: s, activeTab: 'overview' })}
                              >
                                Profile
                              </button>
                              {risk.isAtRisk && (
                                <button
                                  type="button"
                                  className="admin-action-btn-secondary"
                                  style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                                  onClick={() => setRemedialActionModal(s)}
                                >
                                  Remedial
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredDepartmentStudents.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No department students found matching your selected criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AT-RISK STUDENTS ALERT */}
          {activeTab === 'at-risk' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Academic At-Risk &amp; Intervention Registry</h2>
                  <p>Explains specific triggers: attendance shortage (&lt;75%), CGPA distress (&lt;6.0), or active modular exam failure.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="admin-action-btn-primary"
                    style={{ background: '#0f766e' }}
                    onClick={async () => {
                      try {
                        await hodApi.bulkDispatchNotices(atRiskStudents.length);
                      } catch {
                        // handled
                      }
                      erpStore.logAuditEvent({
                        user: account?.name || 'Dr. P. K. Pattnaik (HOD)',
                        role: 'HOD',
                        action: 'Issued Remedial Mentoring Notices',
                        target: `${atRiskStudents.length} At-Risk CSE Students`,
                        oldValue: 'Unwarned',
                        newValue: 'Counseling Scheduled',
                      });
                      showToast(`✓ Remedial mentoring notices dispatched to ${atRiskStudents.length} students & mentors!`);
                    }}
                  >
                    <Bell size={15} /> Issue Remedial Mentoring Notices ({atRiskStudents.length})
                  </button>
                </div>
              </div>

              {atRiskStudents.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#059669' }}>
                  <CheckCircle2 size={40} style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ margin: 0 }}>All CSE Students in Good Academic Standing</h3>
                  <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>No students currently fall below attendance (75%) or GPA (6.0) minimum thresholds.</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Roll #</th>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>Class Cohort</th>
                        <th>Attendance</th>
                        <th>CGPA</th>
                        <th>Risk Severity</th>
                        <th>Diagnostic Findings &amp; Triggers</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atRiskStudents.map(s => {
                        const risk = erpStore.calculateStudentRisk(s);
                        return (
                          <tr key={s.id}>
                            <td><strong>#{s.rollNumber}</strong></td>
                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                            <td><code>{s.studentId}</code></td>
                            <td>{s.semester || 'Semester 5'} · {s.section || 'Section A'}</td>
                            <td>
                              <strong style={{ color: (s.attendance || 85) < 75 ? '#dc2626' : '#0f766e' }}>
                                {s.attendance || 85}%
                              </strong>
                            </td>
                            <td><strong style={{ color: Number(s.cgpa) < 6.0 ? '#dc2626' : '#059669' }}>{s.cgpa}</strong></td>
                            <td>
                              <span
                                style={{
                                  background: `${risk.badgeColor}18`,
                                  color: risk.badgeColor,
                                  border: `1px solid ${risk.badgeColor}40`,
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                }}
                              >
                                {risk.category}
                              </span>
                            </td>
                            <td>
                              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#dc2626' }}>
                                {risk.reasons.map((r, rIdx) => (
                                  <li key={rIdx}>{r}</li>
                                ))}
                              </ul>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  className="admin-action-btn-secondary"
                                  style={{ fontSize: '0.74rem', padding: '3px 8px', color: '#b91c1c', borderColor: '#fca5a5' }}
                                  onClick={() => setRemedialActionModal(s)}
                                >
                                  Remedial
                                </button>
                                <button
                                  className="admin-action-btn-secondary"
                                  style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                                  onClick={() => showToast(`Counselor alert sent for ${s.name} (${s.rollNumber})`)}
                                >
                                  Notify Mentor
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DEPARTMENT FACULTY */}
          {activeTab === 'faculty' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Teaching Faculty ({faculty.length} Members)</h2>
                  <p>Professors, associate professors, and lecturers across Computing Systems, Algorithms, and Software Engineering.</p>
                </div>
                <button
                  className="admin-action-btn-secondary"
                  onClick={() => exportToCsv('CSE_Department_Faculty.csv', faculty.map(f => ({ ID: f.id, Name: f.name, Email: f.email, Designation: f.designation, AssignedCourses: (f.assignedSubjects || []).join('; '), Status: f.status })))}
                >
                  <FileSpreadsheet size={14} /> Export Faculty Register
                </button>
              </div>

              {/* Workload Oversight Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '12px 16px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700 }}>TEACHING WORKLOAD ALLOCATION</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e', marginTop: '3px' }}>100% Balanced</div>
                  <small style={{ color: '#134e4a' }}>All 48 autonomous courses assigned to active faculty</small>
                </div>
                <div
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setActiveTab('timetable')}
                  title="Click to view and manage automated timetable"
                >
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TIMETABLE CONFLICTS &amp; SCHEDULES</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: '3px' }}>0 Clashes (View &rarr;)</div>
                  <small style={{ color: '#64748b' }}>Automated OR-Tools Schedule Active</small>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>EVALUATION SUBMISSIONS</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb', marginTop: '3px' }}>93.8% Compliance</div>
                  <small style={{ color: '#64748b' }}>30 of 32 faculty completed continuous mark entry</small>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Faculty Name</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th>Assigned Courses</th>
                      <th>Assigned Sections</th>
                      <th>Weekly Workload</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map(f => (
                      <tr key={f.id}>
                        <td><strong>{f.id}</strong></td>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td>{f.email}</td>
                        <td><span className="admin-badge active">{f.designation}</span></td>
                        <td>{(Array.isArray(f.assignedSubjects) ? f.assignedSubjects : [f.assignedSubjects]).join(', ')}</td>
                        <td>{(Array.isArray(f.assignedSections) ? f.assignedSections : [f.assignedSections]).join(', ')}</td>
                        <td><strong>14 Hrs / Wk</strong></td>
                        <td><span className="admin-badge approved">{f.status}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-action-btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                            onClick={() => setSelectedFacultyModal(f)}
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DEPARTMENT SUBJECTS */}
          {activeTab === 'subjects' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>CSE Department Curricular Subjects ({subjects.length} Autonomous Courses)</h2>
                  <p>Curriculum oversight for B.Tech CSE (Autonomous Regulations 2024-2028).</p>
                </div>
                <button
                  className="admin-action-btn-secondary"
                  onClick={() => exportToCsv('CSE_Department_Subjects.csv', subjects.map(s => ({ Code: s.code, Name: s.name, Semester: s.semester, Credits: s.credits, Format: s.type, Coordinator: s.assignedFaculty })))}
                >
                  <FileSpreadsheet size={14} /> Export Curriculum Register
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Subject Name</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Format</th>
                      <th>Course Coordinator</th>
                      <th>Syllabus Completion</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(s => (
                      <tr key={s.id}>
                        <td><code style={{ fontWeight: 700, color: '#0f766e' }}>{s.code}</code></td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.semester}</td>
                        <td>{s.credits} Credits</td>
                        <td><span className="admin-badge active">{s.type}</span></td>
                        <td>{s.assignedFaculty}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: s.code === 'CS502' ? '100%' : '82%', height: '100%', background: '#059669' }} />
                            </div>
                            <strong style={{ fontSize: '0.75rem', color: '#059669' }}>{s.code === 'CS502' ? '100%' : '82%'}</strong>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-action-btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                            onClick={() => setSelectedSubjectModal(s)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6B: AUTOMATED TIMETABLE MANAGEMENT */}
          {activeTab === 'timetable' && (
            <TimetableManager account={account} />
          )}

          {/* TAB 7: DEPARTMENT REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="hod-view-header">
                <div>
                  <h2>Department Reports, Compliance &amp; Gazette Centre</h2>
                  <p>Certified autonomous evaluation returns ready for submission to Academic Council and Controller of Examinations.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="admin-action-btn-primary" style={{ background: '#0f766e' }} onClick={() => downloadDepartmentGazettePdf('CSE Department Comprehensive CIA Gazette')}>
                    <Download size={14} /> Download Gazette PDF
                  </button>
                </div>
              </div>

              {/* Report Builder Selector Toolbar */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <small style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>REPORT TYPE</small>
                      <select
                        className="admin-form-select"
                        value={selectedReportType}
                        onChange={e => setSelectedReportType(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                      >
                        <option value="GAZETTE">Continuous Assessment (CIA) Gazette</option>
                        <option value="STUDENT_REGISTRY">Student Enrollment &amp; Attendance Compliance</option>
                        <option value="FACULTY_WORKLOAD">Faculty Workload &amp; Allocation Audit</option>
                        <option value="AT_RISK_REGISTRY">Academic At-Risk &amp; Remedial Interventions Registry</option>
                        <option value="SYLLABUS_ATTAINMENT">Course Syllabus &amp; Assessment Attainment</option>
                      </select>
                    </div>

                    <div>
                      <small style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                      <select
                        className="admin-form-select"
                        value={reportSemFilter}
                        onChange={e => setReportSemFilter(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                      >
                        <option value="Semester 5">Semester 5 (Autumn 2026)</option>
                        <option value="Semester 3">Semester 3 (Autumn 2026)</option>
                        <option value="Semester 1">Semester 1 (Autumn 2026)</option>
                      </select>
                    </div>

                    <div>
                      <small style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>SECTION</small>
                      <select
                        className="admin-form-select"
                        value={reportSectionFilter}
                        onChange={e => setReportSectionFilter(e.target.value)}
                        style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                      >
                        <option value="Section A">Section A (32 Cohort)</option>
                        <option value="Section B">Section B (30 Cohort)</option>
                        <option value="Section C">Section C (29 Cohort)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-action-btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#0f766e' }}
                      onClick={() => downloadDepartmentGazettePdf(`CSE_${selectedReportType}_${reportSemFilter}_${reportSectionFilter}`)}
                    >
                      <Download size={13} /> Export PDF
                    </button>
                    <button
                      className="admin-action-btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => exportToCsv(`CSE_${selectedReportType}.csv`, students.slice(0, 32).map((s, i) => ({ SL: i + 1, Roll: s.rollNumber, Name: s.name, Mid1: 18, Mid2: 17.5, Quizzes: 8.5, Assignments: 9.0, Practical: 27.0, FinalCIA_20: 17.4, Grade: 'A+' })))}
                    >
                      <FileSpreadsheet size={13} /> Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Table of Selected Report */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Live Preview: {selectedReportType.replace(/_/g, ' ')} ({reportSemFilter} · {reportSectionFilter})</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Certified department returns generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.
                    </p>
                  </div>
                  <span className="admin-badge approved">Provisional Approved</span>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Roll #</th>
                        <th>Student Name</th>
                        <th>Mid-1 (20)</th>
                        <th>Mid-2 (20)</th>
                        <th>Quizzes (10)</th>
                        <th>Assign (10)</th>
                        <th>Surprise (10)</th>
                        <th>Lab Practical (30)</th>
                        <th>Final CIA (20)</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 10).map((s, i) => (
                        <tr key={s.id}>
                          <td>{i + 1}</td>
                          <td><strong>#{s.rollNumber}</strong></td>
                          <td>{s.name}</td>
                          <td>18.0</td>
                          <td>17.5</td>
                          <td>8.5</td>
                          <td>9.0</td>
                          <td>8.0</td>
                          <td>27.0</td>
                          <td><strong style={{ color: '#0f766e' }}>17.6 / 20</strong></td>
                          <td><strong style={{ color: '#059669' }}>A+</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div>
              {/* Sub-tab switcher */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                <button
                  type="button"
                  onClick={() => setDocsViewMode('student_docs')}
                  style={{
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: docsViewMode === 'student_docs' ? '#ffffff' : 'transparent',
                    color: docsViewMode === 'student_docs' ? '#1e293b' : '#64748b',
                    boxShadow: docsViewMode === 'student_docs' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🎓 Student Uploaded Documents (Section &amp; Semester Registry)
                </button>
                <button
                  type="button"
                  onClick={() => setDocsViewMode('campus_docs')}
                  style={{
                    border: 'none',
                    padding: '0.45rem 1rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: docsViewMode === 'campus_docs' ? '#ffffff' : 'transparent',
                    color: docsViewMode === 'campus_docs' ? '#1e293b' : '#64748b',
                    boxShadow: docsViewMode === 'campus_docs' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  🏛️ Campus Institutional Files ({hodDocs.length})
                </button>
              </div>

              {docsViewMode === 'student_docs' ? (
                <StudentDocumentsTable portalRole="hod" />
              ) : (() => {
                const catColor = { Academic: '#2563eb', Examination: '#dc2626', Training: '#d97706', Circular: '#7c3aed', Notice: '#059669', Other: '#475569' };
                const fileTypeColor = { PDF: '#dc2626', DOCX: '#2563eb', XLSX: '#16a34a', PPTX: '#d97706', JPG: '#9333ea', PNG: '#0891b2' };
                const filtered = hodDocs.filter(d =>
                  d.title.toLowerCase().includes(hodDocsSearch.toLowerCase()) ||
                  (d.category || '').toLowerCase().includes(hodDocsSearch.toLowerCase()) ||
                  (d.description || '').toLowerCase().includes(hodDocsSearch.toLowerCase())
                );
                return (
                  <div>
                    <div className="hod-view-header">
                      <div>
                        <h2>Campus Documents</h2>
                        <p>Institutional documents shared with HOD by the Administration. ({hodDocs.length} available)</p>
                      </div>
                    </div>
                    <div className="admin-search-wrap" style={{ marginBottom: '1.25rem', maxWidth: '480px' }}>
                      <Search size={15} style={{ color: '#94a3b8' }} />
                      <input className="admin-search-input" placeholder="Search documents…" value={hodDocsSearch} onChange={e => setHodDocsSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                      {filtered.map(doc => (
                        <div key={doc.id} className="admin-card" style={{ marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: catColor[doc.category] || '#2563eb' }} />
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: catColor[doc.category] || '#64748b', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{doc.category}</span>
                            <span style={{ background: fileTypeColor[doc.fileType] || '#64748b', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{doc.fileType || 'FILE'}</span>
                          </div>
                          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.3 }}>{doc.title}</h3>
                          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{doc.description || 'No description.'}</p>
                          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', fontSize: '0.72rem', color: '#64748b' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{doc.uploadedBy}</span> · {doc.fileSize || '—'} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      ))}
                      {filtered.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                          <FileText size={40} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                          <p style={{ margin: 0, fontWeight: 600 }}>No documents available</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 9: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="hod" />
          )}
        </main>
      </div>

      {/* ── MODAL 1: DETAILED MARKS INSPECTION MODAL ── */}
      {inspectingMarksModal && (
        <div className="admin-modal-backdrop" onClick={() => setInspectingMarksModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '960px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>{inspectingMarksModal.subjectCode}</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {inspectingMarksModal.subject} — Continuous Assessment Register
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Faculty: <strong>{inspectingMarksModal.faculty}</strong> · Cohort: {inspectingMarksModal.semester} ({inspectingMarksModal.section}) · 32 Students Enrolled
                </p>
              </div>
              <button
                className="admin-modal-close"
                onClick={() => setInspectingMarksModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1rem 1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Validation Summary Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Validation Diagnostics:</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    {inspectingMarksModal.missingMarksCount > 0 ? (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>
                        ⚠ {inspectingMarksModal.missingMarksCount} missing marks detected in Quiz 4. Check candidate records.
                      </span>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        ✓ All 32 student entries validated. Scaled continuous total adheres to 20% autonomous criteria.
                      </span>
                    )}
                  </div>
                </div>
                <span className={`admin-badge ${inspectingMarksModal.status.toLowerCase()}`}>
                  {inspectingMarksModal.status}
                </span>
              </div>

              {/* Roster & Marks Table */}
              <div className="admin-table-container">
                <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>Roll #</th>
                      <th>Student Name</th>
                      <th>Mid-1 (20)</th>
                      <th>Mid-2 (20)</th>
                      <th>Quiz Avg (10)</th>
                      <th>Assign (10)</th>
                      <th>Surprise (10)</th>
                      <th>Lab Pract (30)</th>
                      <th>Final CIA (20)</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 12).map(st => (
                      <tr key={st.id}>
                        <td><strong>#{st.rollNumber}</strong></td>
                        <td>{st.name}</td>
                        <td>18.0</td>
                        <td>17.5</td>
                        <td>8.5</td>
                        <td>9.0</td>
                        <td>8.0</td>
                        <td>27.0</td>
                        <td><strong style={{ color: '#0f766e' }}>17.6</strong></td>
                        <td><strong style={{ color: '#059669' }}>A+</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-action-btn-secondary" onClick={() => setInspectingMarksModal(null)}>
                Close Matrix
              </button>
              {inspectingMarksModal.status === 'Pending' && (
                <>
                  <button
                    className="hod-btn-reject"
                    onClick={() => {
                      setInspectingMarksModal(null);
                      handleOpenReject(inspectingMarksModal);
                    }}
                  >
                    <XCircle size={14} /> Return for Revision
                  </button>
                  <button
                    className="hod-btn-approve"
                    onClick={() => handleApprove(inspectingMarksModal.id, inspectingMarksModal.subject)}
                  >
                    <CheckCircle2 size={14} /> Approve &amp; Publish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: STUDENT PROFILE MODAL ── */}
      {selectedStudentModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStudentModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '820px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>Roll #{selectedStudentModal.student?.rollNumber}</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  {selectedStudentModal.student?.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  <code>{selectedStudentModal.student?.studentId}</code> · {selectedStudentModal.student?.email} · {selectedStudentModal.student?.semester || 'Semester 5'} · {selectedStudentModal.student?.section || 'Section A'}
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedStudentModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ padding: '0 1.25rem' }}>
              <div className="hod-modal-tabs">
                {[
                  { id: 'overview', label: 'Academic Overview' },
                  { id: 'attendance', label: 'Attendance Breakdown' },
                  { id: 'assessments', label: 'Continuous Assessment' },
                  { id: 'trends', label: 'Performance Trends' },
                  { id: 'remedial', label: 'Remedial & Mentorship' }
                ].map(t => (
                  <button
                    key={t.id}
                    className={`hod-modal-tab-btn ${selectedStudentModal.activeTab === t.id ? 'active' : ''}`}
                    onClick={() => setSelectedStudentModal({ ...selectedStudentModal, activeTab: t.id })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedStudentModal.activeTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CUMULATIVE CGPA</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{selectedStudentModal.student?.cgpa || '8.5'}</div>
                      <small style={{ color: '#64748b' }}>Standing: First Class Distinction</small>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ATTENDANCE RATE</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: (selectedStudentModal.student?.attendance || 85) < 75 ? '#dc2626' : '#0f766e', marginTop: '2px' }}>
                        {selectedStudentModal.student?.attendance || 85}%
                      </div>
                      <small style={{ color: (selectedStudentModal.student?.attendance || 85) < 75 ? '#dc2626' : '#059669' }}>
                        {(selectedStudentModal.student?.attendance || 85) < 75 ? 'Shortage Alert (<75%)' : 'Eligible for Exams'}
                      </small>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ACADEMIC BATCH</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>2024 - 2028 (Autonomous)</div>
                      <small style={{ color: '#64748b' }}>Mentor: Prof. B. Panda</small>
                    </div>
                  </div>
                </div>
              )}

              {selectedStudentModal.activeTab === 'attendance' && (
                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr><th>Course Code</th><th>Title</th><th>Conducted</th><th>Attended</th><th>Percentage</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {[
                        { code: 'CS501', title: 'Data Structures', total: 42, attended: 38, pct: selectedStudentModal.student?.attendance || 85 },
                        { code: 'CS502', title: 'Operating Systems', total: 38, attended: 35, pct: 92 },
                        { code: 'CS503', title: 'Database Management', total: 40, attended: 37, pct: 92.5 }
                      ].map(sub => (
                        <tr key={sub.code}>
                          <td><strong>{sub.code}</strong></td>
                          <td>{sub.title}</td>
                          <td>{sub.total} Classes</td>
                          <td>{sub.attended} Classes</td>
                          <td><strong style={{ color: sub.pct < 75 ? '#dc2626' : '#0f766e' }}>{sub.pct}%</strong></td>
                          <td><span className={`admin-badge ${sub.pct >= 75 ? 'approved' : 'inactive'}`}>{sub.pct >= 75 ? 'Qualified' : 'Shortage'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedStudentModal.activeTab === 'assessments' && (
                <div className="admin-table-container">
                  <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr><th>Component</th><th>Max Marks</th><th>Scored Marks</th><th>Scaled Attainment</th></tr>
                    </thead>
                    <tbody>
                      {[
                        { comp: 'Modular Examination 1', max: 20, scored: 18.0, scaled: '18 / 20' },
                        { comp: 'Modular Examination 2', max: 20, scored: 17.5, scaled: '17.5 / 20' },
                        { comp: 'Quizzes Average', max: 10, scored: 8.5, scaled: '8.5 / 10' },
                        { comp: 'Assignments', max: 10, scored: 9.0, scaled: '9.0 / 10' },
                        { comp: 'Lab Practical', max: 30, scored: 27.0, scaled: '27.0 / 30' }
                      ].map(c => (
                        <tr key={c.comp}>
                          <td><strong>{c.comp}</strong></td>
                          <td>{c.max}</td>
                          <td><strong style={{ color: '#059669' }}>{c.scored}</strong></td>
                          <td>{c.scaled}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedStudentModal.activeTab === 'trends' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { sem: 'Semester 1', sgpa: 8.4 },
                    { sem: 'Semester 2', sgpa: 8.6 },
                    { sem: 'Semester 3', sgpa: 8.5 },
                    { sem: 'Semester 4', sgpa: 8.8 },
                    { sem: 'Semester 5 (Mid-Term Forecast)', sgpa: selectedStudentModal.student?.cgpa || 8.9 }
                  ].map(s => (
                    <div key={s.sem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                        <strong>{s.sem}</strong>
                        <span style={{ color: '#059669', fontWeight: 700 }}>{s.sgpa} SGPA</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(s.sgpa / 10) * 100}%`, height: '100%', background: '#0f766e', borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedStudentModal.activeTab === 'remedial' && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="admin-badge approved">Special Doubt Clearing Tutorial</span>
                    <small style={{ color: '#64748b' }}>Target Date: 16 Oct 2026</small>
                  </div>
                  <p style={{ margin: '6px 0 2px', fontSize: '0.82rem', color: '#334155' }}>
                    Assigned problem-solving tutorial session for binary search tree balancing and dynamic programming concepts.
                  </p>
                  <small style={{ color: '#0f766e', fontWeight: 600 }}>Assigned by Dr. P. K. Pattnaik · Department of CSE</small>
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-action-btn-primary" onClick={() => setSelectedStudentModal(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: FACULTY PROFILE MODAL ── */}
      {selectedFacultyModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedFacultyModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '650px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>{selectedFacultyModal.id}</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  {selectedFacultyModal.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedFacultyModal.designation} · {selectedFacultyModal.email}
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedFacultyModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TEACHING WORKLOAD</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e', marginTop: '2px' }}>14 Hours / Week</div>
                  <small style={{ color: '#059669' }}>Within AICTE prescribed limits</small>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>EVALUATION COMPLIANCE</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>100% On-Time</div>
                  <small style={{ color: '#64748b' }}>0 Overdue assessment entries</small>
                </div>
              </div>

              <h4 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Assigned Teaching Courses</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(Array.isArray(selectedFacultyModal.assignedSubjects) ? selectedFacultyModal.assignedSubjects : [selectedFacultyModal.assignedSubjects]).map(s => (
                  <div key={s} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{s}</strong>
                    <span className="admin-badge approved">Active Coordinator</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="admin-action-btn-secondary" onClick={() => setSelectedFacultyModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: SUBJECT DETAILS MODAL ── */}
      {selectedSubjectModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedSubjectModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '650px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="admin-badge active" style={{ marginRight: '8px' }}>{selectedSubjectModal.code}</span>
                <h3 style={{ display: 'inline', margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  {selectedSubjectModal.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedSubjectModal.semester} · {selectedSubjectModal.credits} Credits · {selectedSubjectModal.type}
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedSubjectModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>COURSE COORDINATOR</span>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedSubjectModal.assignedFaculty}</div>
              </div>

              <h4 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Autonomous Curriculum Modules</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong>Module I: Core Principles &amp; Theoretical Foundations (12 Hours)</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Fundamental definitions, complexity benchmarks, and linear structures.</p>
                </div>
                <div style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong>Module II: Advanced Algorithms &amp; Complex Structures (14 Hours)</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Hierarchical trees, balancing factors, graph traversals, and dynamic programming.</p>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="admin-action-btn-secondary" onClick={() => setSelectedSubjectModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: LOG REMEDIAL INTERVENTION ── */}
      {remedialActionModal && (
        <div className="admin-modal-backdrop" onClick={() => setRemedialActionModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '580px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Log Academic Support &amp; Remedial Action</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Target Student: <strong>{remedialActionModal.name}</strong> (Roll #{remedialActionModal.rollNumber})
                </p>
              </div>
              <button className="admin-modal-close" onClick={() => setRemedialActionModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>INTERVENTION TYPE</label>
                  <select
                    className="admin-form-select"
                    value={remedialForm.type}
                    onChange={e => setRemedialForm({ ...remedialForm, type: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Extra Tutorial">Extra Tutorial / Doubt Clearing Session</option>
                    <option value="Academic Counselling">Academic Counselling &amp; Mentoring</option>
                    <option value="Guardian Notice">Formal Guardian Notice &amp; Attendance Advisory</option>
                    <option value="Departmental Referral">Departmental Referral to HOD / Faculty Advisor</option>
                    <option value="Peer Study Group">Peer Study Group &amp; Lab Practice Assignment</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>TARGET FOLLOW-UP DATE</label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={remedialForm.followUpDate}
                    onChange={e => setRemedialForm({ ...remedialForm, followUpDate: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>ACTION PLAN &amp; HOD NOTES</label>
                  <textarea
                    className="admin-form-input"
                    rows={3}
                    value={remedialForm.notes}
                    onChange={e => setRemedialForm({ ...remedialForm, notes: e.target.value })}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-action-btn-secondary" onClick={() => setRemedialActionModal(null)}>Cancel</button>
              <button
                className="admin-action-btn-primary"
                style={{ background: '#0f766e' }}
                onClick={async () => {
                  try {
                    await hodApi.logIntervention({
                      studentId: remedialActionModal.studentId || remedialActionModal.id,
                      studentName: remedialActionModal.name,
                      rollNumber: remedialActionModal.rollNumber,
                      ...remedialForm
                    });
                  } catch {
                    // handled
                  }
                  showToast(`✓ Remedial action plan logged for ${remedialActionModal.name}!`);
                  setRemedialActionModal(null);
                }}
              >
                Save Intervention Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: REJECT MARKS WITH MANDATORY REASON ── */}
      {rejectingItem && (
        <div className="admin-modal-backdrop" onClick={() => setRejectingItem(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ color: '#e11d48' }}>Return Marks Submission for Revision</h3>
              <button className="admin-table-action-btn" onClick={() => setRejectingItem(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmReject}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                  You are returning continuous evaluation marks for <strong>{rejectingItem.subject}</strong> ({rejectingItem.faculty}) back to the faculty.
                </p>
                <div className="admin-form-group">
                  <label style={{ fontWeight: 700, color: '#0f172a' }}>Reason for Revision (Mandatory):</label>
                  <textarea
                    rows={4}
                    className="admin-form-input"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="e.g. Quiz 4 marks are missing for 4 students. Please complete evaluation and resubmit."
                    required
                  />
                  <small style={{ color: '#64748b' }}>This feedback will be displayed directly to the faculty member upon their next login.</small>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setRejectingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary" style={{ background: '#e11d48' }}>
                  Confirm &amp; Notify Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
