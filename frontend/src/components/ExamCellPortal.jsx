import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  Calendar,
  Ticket,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Plus,
  Play,
  RotateCcw,
  LogOut,
  Send,
  AlertTriangle,
  Layers,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Check,
  ExternalLink,
  AlertCircle,
  Sparkles,
  UserCheck,
  DollarSign,
  GraduationCap,
  BellRing,
  ArrowUpRight,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import './ExamCellPortal.css';
import './SuperAdminPortal.css';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import DigitalAnswerSheetEvaluationSystem from './DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import { examsApi } from '../services/examsApi.js';
import {
  downloadDoorChartPdf,
  downloadExamTimetableMasterPdf
} from '../utils/pdfGenerator';

const NEXT_EXAM_CYCLE_STATUS = {
  Draft: 'Registration Open',
  'Registration Open': 'Registration Closed',
  'Registration Closed': 'Scheduling',
  Scheduling: 'Admit Cards Ready',
  'Admit Cards Ready': 'In Progress',
  'In Progress': 'Evaluation',
  Evaluation: 'Moderation',
  Moderation: 'Results Approval',
  'Results Approval': 'Published',
  Published: 'Closed',
};

const MODERATION_FIELDS = [
  ['modular1', 'Module 1', 20], ['modular2', 'Module 2', 20],
  ['quiz1', 'Quiz 1', 10], ['quiz2', 'Quiz 2', 10], ['quiz3', 'Quiz 3', 10],
  ['quiz4', 'Quiz 4', 10], ['quiz5', 'Quiz 5', 10], ['quiz6', 'Quiz 6', 10],
  ['assignment1', 'Assignment 1', 10], ['assignment2', 'Assignment 2', 10],
  ['surpriseTest1', 'Surprise 1', 10], ['surpriseTest2', 'Surprise 2', 10], ['labWork', 'Lab', 10],
];

// CSV Export Helper
function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            val = val.replace(/"/g, '""');
            if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
            return val;
          })
          .join(separator)
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ExamCellPortal({ account, onLogout, onSwitchRole }) {
  // Navigation & UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, cycles, timetable, seating, hall_tickets, moderation, grading, scrutiny, circulars
  const [toastMessage, setToastMessage] = useState('');

  // Store data state
  const [examCycles, setExamCycles] = useState([]);
  const [cyclesLoading, setCyclesLoading] = useState(true);
  const [cyclesError, setCyclesError] = useState('');
  const [cycleSaving, setCycleSaving] = useState(false);
  const [examTimetable, setExamTimetable] = useState([]);
  const [seatingArrangements, setSeatingArrangements] = useState([]);
  const [gradeRoster, setGradeRoster] = useState([]);
  const [hallTickets, setHallTickets] = useState([]);
  const [activeSubjectCode, setActiveSubjectCode] = useState('CS501');
  const [moderationData, setModerationData] = useState({ records: [] });
  const [markDrafts, setMarkDrafts] = useState({});
  const [reevaluationRequests, setReevaluationRequests] = useState([]);
  const [examCirculars, setExamCirculars] = useState([]);
  const [featureErrors, setFeatureErrors] = useState({});

  // Filter & Search states
  const [cycleSearch, setCycleSearch] = useState('');
  const [timetableSearch, setTimetableSearch] = useState('');
  const [timetableSemesterFilter, setTimetableSemesterFilter] = useState('all');
  const [hallTicketSearch, setHallTicketSearch] = useState('');
  const [hallTicketStatusFilter, setHallTicketStatusFilter] = useState('all');
  const [gradeSearch, setGradeSearch] = useState('');
  const [gradeStatusFilter, setGradeStatusFilter] = useState('all');

  // Interactive Modal states
  const [newCycleModal, setNewCycleModal] = useState(false);
  const [newPaperModal, setNewPaperModal] = useState(false);
  const [newHallModal, setNewHallModal] = useState(false);
  const [admitCardPreviewModal, setAdmitCardPreviewModal] = useState(null); // student object
  const [doorChartPreviewModal, setDoorChartPreviewModal] = useState(null); // hall object
  const [marksheetPreviewModal, setMarksheetPreviewModal] = useState(null); // student object
  const [scrutinyEditModal, setScrutinyEditModal] = useState(null); // scrutiny request object
  const [newCircularModal, setNewCircularModal] = useState(false);
  const [isGradingRunning, setIsGradingRunning] = useState(false);

  // Form states for New Exam Cycle
  const [cycleForm, setCycleForm] = useState({
    title: '',
    session: 'Autumn 2026 (Sem 3, 5, 7)',
    startDate: '2026-11-10',
    endDate: '2026-11-28',
  });

  // Form states for New Timetable Slot
  const [paperForm, setPaperForm] = useState({
    code: '',
    subject: '',
    date: '2026-11-15',
    time: '10:00 AM - 01:00 PM',
    semester: 'Semester 5',
    branches: 'CSE, AI&DS',
    roomCount: 8,
    invigilators: 16,
  });

  // Form states for New Exam Hall
  const [hallForm, setHallForm] = useState({
    hall: '',
    capacity: 60,
    allocated: 58,
    invigilator: '',
    session: 'Morning (10:00 AM)',
    range: '',
  });

  // Form states for New Circular
  const [circularForm, setCircularForm] = useState({
    circularNo: `GIFT/COE/2026/${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    audience: 'All Students & Mentors',
    category: 'Hall Ticket',
    priority: 'High',
    content: '',
  });

  useEffect(() => {
    let active = true;
    examsApi.getExamCycles()
      .then((cycles) => {
        if (!active) return;
        setExamCycles(cycles);
        setCyclesError('');
      })
      .catch((error) => {
        if (!active) return;
        setCyclesError(error?.message || 'Could not load examination cycles.');
      })
      .finally(() => {
        if (active) setCyclesLoading(false);
      });
    return () => { active = false; };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    let active = true;
    const load = async (key, request, setter) => {
      try {
        const result = await request();
        if (!active) return;
        setter(result);
        setFeatureErrors((current) => ({ ...current, [key]: '' }));
      } catch (error) {
        if (!active) return;
        setFeatureErrors((current) => ({ ...current, [key]: error?.message || 'This examination feature is unavailable.' }));
      }
    };
    load('timetable', () => examsApi.getExamTimetable(), setExamTimetable);
    load('seating', () => examsApi.getSeatingArrangements(), setSeatingArrangements);
    load('hallTickets', () => examsApi.getHallTickets(), setHallTickets);
    load('grades', () => examsApi.getGradeRoster(), setGradeRoster);
    load('reevaluations', () => examsApi.getReevaluations(), setReevaluationRequests);
    load('circulars', () => examsApi.getExamCirculars(), setExamCirculars);
    load('moderation', () => examsApi.getModerationMarks('CS501'), setModerationData);
    return () => { active = false; };
  }, []);

  // --- Handlers: Exam Cycles ---
  const handleCreateCycle = async (e) => {
    e.preventDefault();
    if (!cycleForm.title.trim()) {
      triggerToast('Please provide an examination cycle title');
      return;
    }
    setCycleSaving(true);
    try {
      const created = await examsApi.createExamCycle({
        title: cycleForm.title.trim(),
        session: cycleForm.session.trim(),
        startDate: cycleForm.startDate,
        endDate: cycleForm.endDate,
      });
      setExamCycles((current) => [created, ...current]);
      setNewCycleModal(false);
      setCycleForm({ title: '', session: 'Autumn 2026 (Sem 3, 5, 7)', startDate: '2026-11-10', endDate: '2026-11-28' });
      setCyclesError('');
      triggerToast('Examination cycle saved.');
    } catch (error) {
      triggerToast(error?.message || 'Could not create the examination cycle.');
    } finally {
      setCycleSaving(false);
    }
  };

  const handleAdvanceCycle = async (cycle) => {
    const nextStatus = NEXT_EXAM_CYCLE_STATUS[cycle.status];
    if (!nextStatus) return;
    try {
      const result = await examsApi.transitionCycleStatus(cycle.id, nextStatus);
      setExamCycles((current) => current.map((item) => item.id === cycle.id ? result.data : item));
      triggerToast(`Cycle advanced to ${nextStatus}.`);
    } catch (error) {
      triggerToast(error?.message || 'Could not advance the examination cycle.');
    }
  };

  // --- Handlers: Timetable ---
  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (!paperForm.code.trim() || !paperForm.subject.trim()) {
      triggerToast('Please specify subject code and course title');
      return;
    }

    const branchArr = paperForm.branches.split(',').map(b => b.trim());

    // Conflict Validation: Check overlapping examinations for the same student semester/branch
    const conflict = examTimetable.find(
      t => t.date === paperForm.date &&
           t.time === paperForm.time &&
           t.semester === paperForm.semester &&
           (t.code === paperForm.code || t.branches.some(b => branchArr.includes(b)))
    );

    if (conflict) {
      triggerToast(`⚠️ Timetable Conflict! Semester ${paperForm.semester} already has paper ${conflict.code} (${conflict.subject}) on ${paperForm.date} at ${paperForm.time}. Overlapping student exams are prohibited.`);
      return;
    }

    try {
      const created = await examsApi.createTimetableSlot({ ...paperForm, branches: branchArr });
      setExamTimetable((current) => [created, ...current]);
      setNewPaperModal(false);
      triggerToast('Exam paper slot saved.');
    } catch (error) {
      triggerToast(error?.message || 'The examination timetable could not be saved.');
    }
  };

  const handleDeletePaper = (paperId) => {
    void paperId;
    triggerToast('Timetable deletion is unavailable until a persistent timetable endpoint is implemented.');
  };

  const handlePrintTimetable = () => {
    window.print();
  };

  // --- Handlers: Seating ---
  const handleCreateHall = (e) => {
    e.preventDefault();
    if (!hallForm.hall.trim() || !hallForm.invigilator.trim()) {
      triggerToast('Please enter hall number and assigned invigilator');
      return;
    }
    triggerToast('Hall registration is unavailable until persistent hall and seat allocation storage is implemented.');
  };

  const handleAutoSeating = async () => {
    try {
      await examsApi.autoOptimizeSeating();
      triggerToast('Seating optimization completed.');
    } catch (error) {
      triggerToast(error?.message || 'Seating optimization is unavailable.');
    }
  };

  // --- Handlers: Hall Tickets ---
  const handleBatchReleaseAdmitCards = () => {
    triggerToast('Hall ticket issuance is unavailable until eligibility and issuance storage is implemented.');
  };

  const handleCondoneAttendance = (rollNumber, name) => {
    void rollNumber;
    void name;
    triggerToast('Attendance condonation cannot be recorded until an approval workflow is implemented.');
  };

  const handleClearFeeHold = (rollNumber, name) => {
    void rollNumber;
    void name;
    triggerToast('Fee holds must be cleared through the Accounts workflow; this action is not available here.');
  };

  const handleOpenAdmitCard = (student) => {
    setAdmitCardPreviewModal(student);
  };

  const handleDownloadStudentAdmitPdf = (student) => {
    void student;
    triggerToast('An official admit card cannot be generated until hall ticket and timetable data are persisted.');
  };

  // --- Handlers: Marks Moderation ---
  const handleSelectSubjectModeration = async () => {
    try {
      const data = await examsApi.getModerationMarks(activeSubjectCode.trim());
      setModerationData(data);
      setFeatureErrors((current) => ({ ...current, moderation: '' }));
    } catch (error) {
      setModerationData({ records: [] });
      setFeatureErrors((current) => ({ ...current, moderation: error?.message || 'Moderation records could not be loaded.' }));
    }
  };

  const handleMarkChange = async (rollNumber, field, value) => {
    try {
      await examsApi.updateStudentMark(activeSubjectCode, rollNumber, field, value);
      setModerationData(await examsApi.getModerationMarks(activeSubjectCode));
      setMarkDrafts((current) => {
        const next = { ...current };
        delete next[`${rollNumber}:${field}`];
        return next;
      });
      triggerToast('Assessment mark saved.');
    } catch (error) {
      triggerToast(error?.message || 'Assessment mark could not be saved.');
    }
  };

  // --- Handlers: SGPA / CGPA Engine ---
  const handleRunGradingEngine = async () => {
    setIsGradingRunning(true);
    try {
      await examsApi.executeGradingEngine();
      setGradeRoster(await examsApi.getGradeRoster());
    } catch (error) {
      triggerToast(error?.message || 'Result calculation is unavailable.');
    } finally {
      setIsGradingRunning(false);
    }
  };

  const handleViewMarksheet = (student) => {
    setMarksheetPreviewModal(student);
  };

  const handleDownloadStudentGradeCardPdf = (student) => {
    void student;
    triggerToast('A grade card cannot be generated until certified result records are available.');
  };

  // --- Handlers: Re-evaluation / Scrutiny ---
  const handleUpdateScrutinyDecision = async (e) => {
    e.preventDefault();
    if (!scrutinyEditModal) return;
    const form = e.target;
    const status = form.status.value;
    const recheckedMarks = form.recheckedMarks.value;
    const remarks = form.remarks.value;
    try {
      await examsApi.updateReevaluationStatus(scrutinyEditModal.id, {
        status,
        recheckedMarks: recheckedMarks ? Number(recheckedMarks) : scrutinyEditModal.originalMarks,
        remarks,
      });
      setScrutinyEditModal(null);
    } catch (error) {
      triggerToast(error?.message || 'The re-evaluation decision could not be saved.');
    }
  };

  // --- Handlers: Circulars ---
  const handleCreateCircular = (e) => {
    e.preventDefault();
    if (!circularForm.title.trim() || !circularForm.content.trim()) {
      triggerToast('Please provide circular title and official notification text');
      return;
    }
    void circularForm;
    triggerToast('Circular publishing is unavailable until exam circular creation is backed by a persistent workflow.');
  };

  const handleDeleteCircular = (id) => {
    void id;
    triggerToast('Circular deletion is unavailable until a persistent delete workflow is implemented.');
  };

  // Filtered Lists
  const filteredCycles = useMemo(() => {
    return examCycles.filter(c =>
      c.title.toLowerCase().includes(cycleSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(cycleSearch.toLowerCase()) ||
      (c.session || '').toLowerCase().includes(cycleSearch.toLowerCase())
    );
  }, [examCycles, cycleSearch]);

  const filteredTimetable = useMemo(() => {
    return examTimetable.filter(item => {
      const matchSearch =
        item.subject.toLowerCase().includes(timetableSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(timetableSearch.toLowerCase());
      const matchSem = timetableSemesterFilter === 'all' || item.semester === timetableSemesterFilter;
      return matchSearch && matchSem;
    });
  }, [examTimetable, timetableSearch, timetableSemesterFilter]);

  const filteredHallTickets = useMemo(() => {
    return hallTickets.filter(h => {
      const matchSearch =
        h.name.toLowerCase().includes(hallTicketSearch.toLowerCase()) ||
        h.rollNumber.toLowerCase().includes(hallTicketSearch.toLowerCase()) ||
        h.regNo.toLowerCase().includes(hallTicketSearch.toLowerCase()) ||
        h.department.toLowerCase().includes(hallTicketSearch.toLowerCase());
      const matchStatus =
        hallTicketStatusFilter === 'all' ||
        (hallTicketStatusFilter === 'issued' && h.hallTicketStatus === 'Issued') ||
        (hallTicketStatusFilter === 'detained' && h.hallTicketStatus.includes('Detained')) ||
        (hallTicketStatusFilter === 'hold' && h.hallTicketStatus.includes('Hold'));
      return matchSearch && matchStatus;
    });
  }, [hallTickets, hallTicketSearch, hallTicketStatusFilter]);

  const filteredGradeRoster = useMemo(() => {
    return gradeRoster.filter(g => {
      const matchSearch =
        g.name.toLowerCase().includes(gradeSearch.toLowerCase()) ||
        g.rollNumber.toLowerCase().includes(gradeSearch.toLowerCase()) ||
        g.regNo.toLowerCase().includes(gradeSearch.toLowerCase());
      const matchStatus =
        gradeStatusFilter === 'all' ||
        (gradeStatusFilter === 'distinction' && g.status.includes('Distinction')) ||
        (gradeStatusFilter === 'passed' && g.status.includes('Passed') && !g.status.includes('Distinction')) ||
        (gradeStatusFilter === 'backlog' && g.backlogCount > 0);
      return matchSearch && matchStatus;
    });
  }, [gradeRoster, gradeSearch, gradeStatusFilter]);

  const featureKeyByTab = {
    timetable: 'timetable',
    seating: 'seating',
    hall_tickets: 'hallTickets',
    moderation: 'moderation',
    grading: 'grades',
    scrutiny: 'reevaluations',
    circulars: 'circulars',
  };
  const activeFeatureError = featureErrors[featureKeyByTab[activeTab]];

  return (
    <div className="erp-exam-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
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
        }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="erp-sidebar">
          <div className="erp-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="erp-exam-badge" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="erp-brand-text">
                <h2>Apna Campus</h2>
                <span style={{ color: '#a78bfa' }}>Examination Cell</span>
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
                justifyContent: 'center'
              }}
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="erp-sidebar-nav">
            <button
              className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FileCheck2 size={18} />
              <span>CoE Dashboard</span>
              <span className="erp-nav-badge" style={{ background: '#10b981', color: '#ffffff' }}>Live</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'cycles' ? 'active' : ''}`}
              onClick={() => setActiveTab('cycles')}
            >
              <Calendar size={18} />
              <span>Exam Cycles</span>
              <span className="erp-nav-badge">{examCycles.length}</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <Clock size={18} />
              <span>Timetable & Schedule</span>
              <span className="erp-nav-badge">{examTimetable.length}</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'seating' ? 'active' : ''}`}
              onClick={() => setActiveTab('seating')}
            >
              <Users size={18} />
              <span>Seating & Door Charts</span>
              <span className="erp-nav-badge">{seatingArrangements.length}</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'hall_tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('hall_tickets')}
            >
              <Ticket size={18} />
              <span>Hall Tickets Desk</span>
              <span className="erp-nav-badge">{hallTickets.length}</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'moderation' ? 'active' : ''}`}
              onClick={() => setActiveTab('moderation')}
            >
              <Layers size={18} />
              <span>Marks Moderation (CIE)</span>
              <span className="erp-nav-badge">Live</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'grading' ? 'active' : ''}`}
              onClick={() => setActiveTab('grading')}
            >
              <Award size={18} />
              <span>SGPA/CGPA Engine</span>
              <span className="erp-nav-badge">{gradeRoster.length}</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'scrutiny' ? 'active' : ''}`}
              onClick={() => setActiveTab('scrutiny')}
            >
              <RotateCcw size={18} />
              <span>Re-Evaluation & Scrutiny</span>
              <span className="erp-nav-badge">{reevaluationRequests.length}</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'circulars' ? 'active' : ''}`}
              onClick={() => setActiveTab('circulars')}
            >
              <BellRing size={18} />
              <span>CoE Circulars</span>
              <span className="erp-nav-badge">{examCirculars.length}</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'digital_evaluation' ? 'active' : ''}`}
              onClick={() => setActiveTab('digital_evaluation')}
              style={{
                background: activeTab === 'digital_evaluation' ? undefined : 'linear-gradient(90deg, rgba(124, 58, 237, 0.12), rgba(99, 102, 241, 0.12))',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              <FileCheck2 size={18} style={{ color: '#a78bfa' }} />
              <span>Digital Evaluation System</span>
              <span className="erp-nav-badge" style={{ background: '#7c3aed', color: '#ffffff' }}>Live</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'report-generation' ? 'active' : ''}`}
              onClick={() => setActiveTab('report-generation')}
            >
              <FileSpreadsheet size={18} />
              <span>Report Generation</span>
              <span className="erp-nav-badge" style={{ background: '#3b82f6', color: '#ffffff' }}>New</span>
            </button>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="erp-main-content">
        <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation"
                aria-label="Show Navigation"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1>Autonomous Examination Operations & Evaluation</h1>
              <p>Office of the Controller of Examinations (CoE) · Autonomous Academic Wing</p>
            </div>
          </div>

          <div className="erp-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="erp-role-badge">
              <ShieldCheck size={14} /> Certified Controller Access
            </div>

            {/* Profile Pill with Sign Out */}
            <div className="campus-user-pill" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '4px 12px',
              borderRadius: '999px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#7c3aed',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                COE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{account?.name || 'Dr. K. C. Patra'}</strong>
                <small style={{ fontSize: '0.7rem', color: '#64748b' }}>Controller of Examinations</small>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {activeFeatureError && (
          <div role="status" style={{ margin: '0 1.5rem 1rem', padding: '12px 16px', borderRadius: 8, background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>
            {activeFeatureError}
          </div>
        )}

        <div className="erp-content-body" style={{ padding: '1.75rem' }}>
          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 140px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB: DIGITAL ANSWER SHEET EVALUATION SYSTEM */}
          {activeTab === 'digital_evaluation' && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '20px' }}>
              <DigitalAnswerSheetEvaluationSystem initialRole="exam_cell" currentUser={account} />
            </div>
          )}

          {/* =========================================================================
              TAB 0: CoE OPERATIONS DASHBOARD
             ========================================================================= */}
          {activeTab === 'dashboard' && (
            <RoleDashboardLanding
              roleKey="exam_cell"
              account={account}
              onLogout={onLogout}
              onSwitchRole={onSwitchRole}
              onNavigate={(target) => {
                if (target === 'exam-sched') setActiveTab('timetable');
                else if (target === 'exam-eval') setActiveTab('digital_evaluation');
                else if (target === 'exam-subs') setActiveTab('moderation');
                else setActiveTab('timetable');
              }}
            />
          )}

          {false && activeTab === 'dashboard' && (
            <div>
              {/* Top Operational KPI Grid */}
              <div className="erp-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="erp-stat-card clickable-kpi" onClick={() => setActiveTab('cycles')}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Active Cycles</span>
                    <Calendar size={18} color="#7c3aed" />
                  </div>
                  <div className="erp-stat-val">{examCycles.filter(c => c.status !== 'Closed').length} Cycles</div>
                  <div className="erp-stat-note">Autumn 2026 &amp; Backlog Series</div>
                  <div className="kpi-hover-hint">View Cycles <ArrowUpRight size={13} /></div>
                </div>

                <div className="erp-stat-card clickable-kpi" onClick={() => setActiveTab('hall_tickets')}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Enrolled Candidates</span>
                    <Users size={18} color="#0284c7" />
                  </div>
                  <div className="erp-stat-val">2,480</div>
                  <div className="erp-stat-note">Verified examinees across 6 departments</div>
                  <div className="kpi-hover-hint">View Candidates <ArrowUpRight size={13} /></div>
                </div>

                <div className="erp-stat-card clickable-kpi" onClick={() => setActiveTab('timetable')}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Scheduled Papers</span>
                    <BookOpen size={18} color="#10b981" />
                  </div>
                  <div className="erp-stat-val">{examTimetable.length} Papers</div>
                  <div className="erp-stat-note">0 Timetable Conflicts Detected</div>
                  <div className="kpi-hover-hint">View Timetable <ArrowUpRight size={13} /></div>
                </div>

                <div className="erp-stat-card clickable-kpi" onClick={() => setActiveTab('seating')}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Hall Capacity</span>
                    <Award size={18} color="#f59e0b" />
                  </div>
                  <div className="erp-stat-val">88.4%</div>
                  <div className="erp-stat-note">338 / 350 Desks Allocated</div>
                  <div className="kpi-hover-hint">View Seating <ArrowUpRight size={13} /></div>
                </div>

                <div className="erp-stat-card clickable-kpi" onClick={() => { setHallTicketStatusFilter('issued'); setActiveTab('hall_tickets'); }}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Admit Cards Live</span>
                    <Ticket size={18} color="#10b981" />
                  </div>
                  <div className="erp-stat-val" style={{ color: '#059669' }}>
                    {hallTickets.filter(h => h.hallTicketStatus === 'Issued').length}
                  </div>
                  <div className="erp-stat-note">Active on student self-service portal</div>
                  <div className="kpi-hover-hint">View Hall Tickets <ArrowUpRight size={13} /></div>
                </div>

                <div className="erp-stat-card clickable-kpi" onClick={() => setActiveTab('moderation')}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Marks Moderation</span>
                    <Layers size={18} color="#7c3aed" />
                  </div>
                  <div className="erp-stat-val">Live</div>
                  <div className="erp-stat-note">Continuous Internal Evaluation (CIE)</div>
                  <div className="kpi-hover-hint">Moderate Marks <ArrowUpRight size={13} /></div>
                </div>

                <div className="erp-stat-card clickable-kpi" onClick={() => setActiveTab('grading')}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Grading Engine</span>
                    <GraduationCap size={18} color="#0284c7" />
                  </div>
                  <div className="erp-stat-val">Certified</div>
                  <div className="erp-stat-note">SGPA/CGPA Weighted Credit Matrix</div>
                  <div className="kpi-hover-hint">View Grade Roster <ArrowUpRight size={13} /></div>
                </div>

                <div className="erp-stat-card clickable-kpi" onClick={() => setActiveTab('scrutiny')}>
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Scrutiny / Re-Eval</span>
                    <RotateCcw size={18} color="#f59e0b" />
                  </div>
                  <div className="erp-stat-val">{reevaluationRequests.length} Cases</div>
                  <div className="erp-stat-note">Fee Verified &amp; Committee Assigned</div>
                  <div className="kpi-hover-hint">Process Scrutiny <ArrowUpRight size={13} /></div>
                </div>
              </div>

              {/* Operational Widgets: Agenda & Readiness Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                {/* Upcoming Papers Schedule */}
                <div className="erp-panel" style={{ marginBottom: 0 }}>
                  <div className="erp-panel-header">
                    <div className="erp-panel-title">
                      <h3>Upcoming Examination Sessions</h3>
                      <p>Paper schedule, session timings, halls assigned, and invigilator squad deployment</p>
                    </div>
                    <button className="erp-btn erp-btn-secondary" onClick={() => setActiveTab('timetable')}>
                      Full Schedule
                    </button>
                  </div>

                  <div className="erp-table-responsive">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Date &amp; Session</th>
                          <th>Course / Paper</th>
                          <th>Halls Assigned</th>
                          <th>Examinees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examTimetable.slice(0, 4).map(item => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.date}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.time}</div>
                            </td>
                            <td>
                              <strong>{item.code}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{item.subject}</div>
                            </td>
                            <td>
                              <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700 }}>
                                {item.roomCount} Halls Assigned
                              </span>
                            </td>
                            <td><strong>{item.roomCount * 22} Candidates</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Examination Readiness Checklist */}
                <div className="erp-panel" style={{ marginBottom: 0 }}>
                  <div className="erp-panel-header">
                    <div className="erp-panel-title">
                      <h3>Autonomous Readiness &amp; Governance</h3>
                      <p>Regulatory prerequisite compliance audit</p>
                    </div>
                    <span className="erp-role-badge">
                      <ShieldCheck size={14} /> 100% Compliant
                    </span>
                  </div>

                  <div className="exam-readiness-checklist">
                    <div className="exam-readiness-item complete">
                      <div>
                        <strong>1. Autonomous Exam Cycles Configured</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>End-Sem Autumn 2026 session initialized with academic dates</div>
                      </div>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Done</span>
                    </div>

                    <div className="exam-readiness-item complete">
                      <div>
                        <strong>2. Timetable Conflict Validation</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Zero room double-bookings, invigilator clashes, or paper overlaps</div>
                      </div>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Passed</span>
                    </div>

                    <div className="exam-readiness-item complete">
                      <div>
                        <strong>3. Seating Plan &amp; Door Charts Staggering</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Anti-cheating branch separation across 5 examination halls</div>
                      </div>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Optimized</span>
                    </div>

                    <div className="exam-readiness-item complete">
                      <div>
                        <strong>4. Student Clearance &amp; Admit Card Generation</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Attendance vetted (&ge;75%) and accounts fee verified</div>
                      </div>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Live</span>
                    </div>

                    <div className="exam-readiness-item complete">
                      <div>
                        <strong>5. Continuous Internal Evaluation Moderation</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Departmental marks review and council grace application</div>
                      </div>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 1: EXAM CYCLES
             ========================================================================= */}
          {activeTab === 'cycles' && (
            <div>
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Autonomous Examination Cycles & Lifecycle</h3>
                    <p>Schedule lifecycle, hall ticket clearance, and result publishing workflow</p>
                  </div>
                  <div className="erp-panel-actions">
                    <button className="erp-btn erp-btn-primary" onClick={() => setNewCycleModal(true)}>
                      <Plus size={15} /> Create Exam Cycle
                    </button>
                  </div>
                </div>

                <div className="exam-toolbar">
                  <div className="exam-search-box">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search cycles by title, code or session..."
                      value={cycleSearch}
                      onChange={(e) => setCycleSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Cycle Code & Title</th>
                        <th>Session</th>
                        <th>Exam Dates</th>
                        <th>Candidates</th>
                        <th>Hall Tickets</th>
                        <th>Lifecycle Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cyclesLoading ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Loading examination cycles…</td></tr>
                      ) : cyclesError ? (
                        <tr><td colSpan="7" role="alert" style={{ textAlign: 'center', color: '#b91c1c', padding: '24px' }}>{cyclesError}</td></tr>
                      ) : filteredCycles.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>No examination cycles have been created.</td></tr>
                      ) : filteredCycles.map(c => (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.title}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Code: {c.id}</div>
                          </td>
                          <td style={{ color: '#475569' }}>{c.session}</td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {c.startDate} to {c.endDate}
                          </td>
                          <td style={{ color: '#64748b' }}>Not configured</td>
                          <td>
                            <span className={`status-pill ${c.hallTicketsReleased ? 'success' : 'purple'}`}>
                              {c.hallTicketsReleased ? 'Released' : 'Not released'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${c.status === 'Published' ? 'success' : 'purple'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {NEXT_EXAM_CYCLE_STATUS[c.status] ? (
                                <button
                                  className="erp-btn erp-btn-primary erp-btn-sm"
                                  onClick={() => handleAdvanceCycle(c)}
                                >
                                  <ChevronRight size={13} /> Advance to {NEXT_EXAM_CYCLE_STATUS[c.status]}
                                </button>
                              ) : (
                                <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>Cycle closed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: TIMETABLE & PAPER SCHEDULER
             ========================================================================= */}
          {activeTab === 'timetable' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Autonomous Semester Examination Timetable</h3>
                  <p>Paper schedule, session timings, halls assigned, and invigilator squad deployment</p>
                </div>
                <div className="erp-panel-actions">
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => {
                      downloadExamTimetableMasterPdf(filteredTimetable);
                      triggerToast('Master Autonomous Examination Timetable PDF downloaded!');
                    }}
                  >
                    <Download size={15} /> Download PDF Timetable
                  </button>
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => {
                      exportToCsv('Examination_Timetable.csv', filteredTimetable);
                      triggerToast('Examination Timetable exported to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export CSV
                  </button>
                  <button className="erp-btn erp-btn-secondary" onClick={handlePrintTimetable}>
                    <Printer size={15} /> Print
                  </button>
                  <button className="erp-btn erp-btn-primary" onClick={() => setNewPaperModal(true)}>
                    <Plus size={15} /> Schedule Exam Paper
                  </button>
                </div>
              </div>

              <div className="exam-toolbar">
                <div className="exam-search-box">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search courses by code or subject name..."
                    value={timetableSearch}
                    onChange={(e) => setTimetableSearch(e.target.value)}
                  />
                </div>
                <select
                  className="exam-filter-select"
                  value={timetableSemesterFilter}
                  onChange={(e) => setTimetableSemesterFilter(e.target.value)}
                >
                  <option value="all">All Semesters</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 7">Semester 7</option>
                </select>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Subject Code & Course Title</th>
                      <th>Exam Date</th>
                      <th>Session Timing</th>
                      <th>Semester & Branches</th>
                      <th>Halls Assigned</th>
                      <th>Invigilators</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimetable.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.subject}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: <code>{item.code}</code></div>
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.date}</td>
                        <td style={{ color: '#475569' }}>{item.time}</td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                            {item.semester} · {Array.isArray(item.branches) ? item.branches.join(', ') : item.branches}
                          </span>
                        </td>
                        <td><strong>{item.roomCount} Halls</strong></td>
                        <td>{item.invigilators} Faculty Members</td>
                        <td>
                          <button
                            className="erp-btn erp-btn-danger erp-btn-sm"
                            onClick={() => handleDeletePaper(item.id)}
                            title="Remove paper"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: SEATING PLAN & DOOR CHARTS
             ========================================================================= */}
          {activeTab === 'seating' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Examination Hall Seating Arrangement & Door Charts</h3>
                  <p>Room capacities, roll number distribution, and room chief superintendents</p>
                </div>
                <div className="erp-panel-actions">
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => {
                      exportToCsv('Exam_Seating_Arrangements.csv', seatingArrangements);
                      triggerToast('Seating arrangements exported to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export CSV
                  </button>
                  <button className="erp-btn erp-btn-secondary" onClick={handleAutoSeating}>
                    <Sparkles size={15} /> Auto-Optimize Seating
                  </button>
                  <button className="erp-btn erp-btn-primary" onClick={() => setNewHallModal(true)}>
                    <Plus size={15} /> Add Examination Hall
                  </button>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Examination Hall</th>
                      <th>Capacity</th>
                      <th>Allocated Count</th>
                      <th>Chief Invigilator</th>
                      <th>Session</th>
                      <th>Roll Number Range</th>
                      <th>Door Chart Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seatingArrangements.map((s, idx) => (
                      <tr key={idx}>
                        <td><strong>{s.hall}</strong></td>
                        <td>{s.capacity} Desks</td>
                        <td>
                          <strong style={{ color: '#16a34a' }}>{s.allocated} Candidates</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {Math.round((s.allocated / s.capacity) * 100)}% Occupancy
                          </div>
                        </td>
                        <td style={{ color: '#475569' }}>{s.invigilator}</td>
                        <td>{s.session}</td>
                        <td style={{ fontSize: '0.78rem', color: '#334155' }}>{s.range}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="erp-btn erp-btn-outline erp-btn-sm"
                              onClick={() => setDoorChartPreviewModal(s)}
                            >
                              <Eye size={13} /> View Slip
                            </button>
                            <button
                              className="erp-btn erp-btn-secondary erp-btn-sm"
                              onClick={() => {
                                downloadDoorChartPdf(s);
                                triggerToast(`Official Door Chart PDF downloaded for ${s.hall}`);
                              }}
                              title="Download Official Door Chart PDF"
                            >
                              <Download size={13} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: HALL TICKETS DESK
             ========================================================================= */}
          {activeTab === 'hall_tickets' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Student Hall Ticket / Admit Card Clearance Desk</h3>
                  <p>Attendance vetting (&ge;75%), Accounts fee clearance, and digital Admit Card issuance</p>
                </div>
                <div className="erp-panel-actions">
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => {
                      exportToCsv('Hall_Tickets_Eligibility_Roster.csv', filteredHallTickets);
                      triggerToast('Hall tickets roster exported to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Roster CSV
                  </button>
                  <button className="erp-btn erp-btn-primary" onClick={handleBatchReleaseAdmitCards}>
                    <CheckCircle size={15} /> Batch Release All Cleared
                  </button>
                </div>
              </div>

              <div className="exam-toolbar">
                <div className="exam-search-box">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search student by name, roll no, reg no, department..."
                    value={hallTicketSearch}
                    onChange={(e) => setHallTicketSearch(e.target.value)}
                  />
                </div>
                <select
                  className="exam-filter-select"
                  value={hallTicketStatusFilter}
                  onChange={(e) => setHallTicketStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="issued">Admit Card Issued</option>
                  <option value="detained">Detained (Attendance &lt; 75%)</option>
                  <option value="hold">On Hold (Fee Dues)</option>
                </select>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Student Name & Roll</th>
                      <th>Reg No & Dept</th>
                      <th>Attendance</th>
                      <th>Fee Accounts</th>
                      <th>Seat Allocated</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHallTickets.map(h => (
                      <tr key={h.rollNumber}>
                        <td>
                          <strong>{h.name}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Roll: {h.rollNumber}</div>
                        </td>
                        <td>
                          <div><code>{h.regNo}</code></div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{h.department} · {h.semester}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: h.attendance >= 75 ? '#16a34a' : '#dc2626' }}>
                              {h.attendance}%
                            </strong>
                            {h.attendance < 75 && (
                              <button
                                className="erp-btn erp-btn-outline erp-btn-sm"
                                style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                                onClick={() => handleCondoneAttendance(h.rollNumber, h.name)}
                                title="Grant CoE Attendance Condonation"
                              >
                                Condone
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: h.feeClearance.includes('Pending') ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                              {h.feeClearance}
                            </span>
                            {h.feeClearance.includes('Pending') && (
                              <button
                                className="erp-btn erp-btn-outline erp-btn-sm"
                                style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                                onClick={() => handleClearFeeHold(h.rollNumber, h.name)}
                                title="Clear Fee Hold"
                              >
                                Clear Fee
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                          {h.seatAllocated}
                        </td>
                        <td>
                          <span className={`status-pill ${h.hallTicketStatus === 'Issued' ? 'success' : h.hallTicketStatus.includes('Detained') ? 'danger' : 'warning'}`}>
                            {h.hallTicketStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              className="erp-btn erp-btn-secondary erp-btn-sm"
                              onClick={() => handleOpenAdmitCard(h)}
                              title="Preview Digital Admit Card"
                            >
                              <Eye size={13} /> View
                            </button>
                            {h.hallTicketStatus === 'Issued' && (
                              <button
                                className="erp-btn erp-btn-primary erp-btn-sm"
                                onClick={() => handleDownloadStudentAdmitPdf(h)}
                                title="Export Official PDF"
                              >
                                <Download size={13} /> PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: MARKS MODERATION (CIE / CONTINUOUS INTERNAL EVALUATION)
             ========================================================================= */}
          {activeTab === 'moderation' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Continuous Internal Evaluation (CIE) & Marks Moderation</h3>
                  <p>Persisted continuous assessment components for the selected subject</p>
                </div>
                <div className="erp-panel-actions">
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => {
                      exportToCsv(`Moderation_Marks_${activeSubjectCode}.csv`, moderationData?.records || []);
                      triggerToast(`Moderation marks for ${activeSubjectCode} exported to CSV.`);
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Marks CSV
                  </button>
                  <span className="erp-stat-note">Final moderation and approval are handled through the HOD approval queue.</span>
                </div>
              </div>

              <div className="exam-toolbar" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Select Course:</span>
                  <input
                    className="exam-filter-select"
                    value={activeSubjectCode}
                    onChange={(e) => setActiveSubjectCode(e.target.value)}
                    aria-label="Subject code"
                    placeholder="Subject code"
                  />
                  <button className="erp-btn erp-btn-secondary" onClick={handleSelectSubjectModeration}>Load</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="status-pill warning">Approval status is available in the HOD queue</span>
                </div>
              </div>

              <div className="erp-table-responsive moderation-table">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student</th>
                      {MODERATION_FIELDS.map(([field, label]) => <th key={field}>{label}</th>)}
                      <th>Recorded Total</th>
                      <th>Final Weightage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moderationData?.records?.map(r => (
                      <tr key={r.rollNumber}>
                        <td><strong>{r.rollNumber}</strong></td>
                        <td>{r.studentName}</td>
                        {MODERATION_FIELDS.map(([field, label, max]) => {
                          const draftKey = `${r.rollNumber}:${field}`;
                          const value = markDrafts[draftKey] ?? r[field] ?? 0;
                          return (
                            <td key={draftKey}>
                              <input
                                aria-label={`${label} mark for ${r.rollNumber}`}
                                type="number"
                                className="mark-edit-input"
                                min="0"
                                max={max}
                                value={value}
                                onChange={(event) => setMarkDrafts((current) => ({ ...current, [draftKey]: event.target.value }))}
                                onBlur={(event) => {
                                  if (String(value) !== String(r[field] ?? 0)) handleMarkChange(r.rollNumber, field, event.target.value);
                                }}
                              />
                            </td>
                          );
                        })}
                        <td>{r.totalMarks ?? '—'}</td>
                        <td>{r.finalWeightage ?? '—'}</td>
                      </tr>
                    ))}
                    {moderationData?.records?.length === 0 && (
                      <tr><td colSpan={MODERATION_FIELDS.length + 4} style={{ textAlign: 'center', padding: 24 }}>No persisted assessment records for this subject.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: SGPA / CGPA ENGINE & TRANSCRIPTS
             ========================================================================= */}
          {activeTab === 'grading' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Autonomous SGPA & CGPA Grade Calculation Engine</h3>
                  <p>Weighted credit computation: (Sum of Credits &times; Grade Points) / Total Credits</p>
                </div>

                <div className="erp-panel-actions">
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => {
                      exportToCsv('Autonomous_Grade_Roster.csv', filteredGradeRoster);
                      triggerToast('Grade roster exported to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Roster CSV
                  </button>
                  <button
                    className="erp-btn erp-btn-primary"
                    onClick={handleRunGradingEngine}
                    disabled={isGradingRunning}
                  >
                    <Play size={15} className={isGradingRunning ? 'animate-spin' : ''} />
                    {isGradingRunning ? 'Computing Grades...' : 'Execute Calculation Engine'}
                  </button>
                </div>
              </div>

              <div className="exam-toolbar">
                <div className="exam-search-box">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, roll no or reg no..."
                    value={gradeSearch}
                    onChange={(e) => setGradeSearch(e.target.value)}
                  />
                </div>
                <select
                  className="exam-filter-select"
                  value={gradeStatusFilter}
                  onChange={(e) => setGradeStatusFilter(e.target.value)}
                >
                  <option value="all">All Classifications</option>
                  <option value="distinction">First Class Distinction</option>
                  <option value="passed">First Class</option>
                  <option value="backlog">Backlog / Arrear</option>
                </select>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Roll Number & Reg No</th>
                      <th>Student Name</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Computed SGPA</th>
                      <th>Computed CGPA</th>
                      <th>Result Classification</th>
                      <th>Official Marksheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGradeRoster.map(g => (
                      <tr key={g.rollNumber}>
                        <td>
                          <strong>Roll {g.rollNumber}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {g.regNo}</div>
                        </td>
                        <td>{g.name}</td>
                        <td>{g.semester}</td>
                        <td>{g.creditsEarned} / {g.creditsTaken}</td>
                        <td><strong style={{ color: '#7c3aed', fontSize: '1rem' }}>{g.sgpa}</strong></td>
                        <td><strong style={{ color: '#10b981', fontSize: '1rem' }}>{g.cgpa}</strong></td>
                        <td>
                          <span className={`status-pill ${g.backlogCount === 0 ? 'success' : 'danger'}`}>
                            {g.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              className="erp-btn erp-btn-secondary erp-btn-sm"
                              onClick={() => handleViewMarksheet(g)}
                            >
                              <Eye size={13} /> View Grade Card
                            </button>
                            <button
                              className="erp-btn erp-btn-primary erp-btn-sm"
                              onClick={() => handleDownloadStudentGradeCardPdf(g)}
                            >
                              <Download size={13} /> PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 7: RE-EVALUATION & SCRUTINY CELL
             ========================================================================= */}
          {activeTab === 'scrutiny' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Autonomous Re-Evaluation &amp; Answer Script Scrutiny Cell</h3>
                  <p>Student re-checking applications, external evaluator re-totalling, and marks amendment</p>
                </div>
                <div className="erp-panel-actions">
                  <button
                    className="erp-btn erp-btn-secondary"
                    onClick={() => {
                      exportToCsv('Reevaluation_Scrutiny_Register.csv', reevaluationRequests);
                      triggerToast('Scrutiny applications register exported to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Scrutiny CSV
                  </button>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Candidate & Roll</th>
                      <th>Subject</th>
                      <th>Original Marks</th>
                      <th>Scrutiny Fee</th>
                      <th>Date Applied</th>
                      <th>Decision Status</th>
                      <th>Evaluate Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reevaluationRequests.map(req => (
                      <tr key={req.id}>
                        <td><code>{req.id}</code></td>
                        <td>
                          <strong>{req.studentName}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Roll {req.rollNumber} · {req.regNo}</div>
                        </td>
                        <td>
                          <strong>{req.subjectName}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}><code>{req.subjectCode}</code></div>
                        </td>
                        <td><strong>{req.originalMarks} / 100</strong></td>
                        <td><span style={{ color: '#16a34a', fontWeight: 600 }}>{req.feePaid}</span></td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.dateApplied}</td>
                        <td>
                          <span className={`status-pill ${req.status.includes('Approved') ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="erp-btn erp-btn-primary erp-btn-sm"
                            onClick={() => setScrutinyEditModal(req)}
                          >
                            <Edit3 size={13} /> Evaluate Case
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 8: COE CIRCULARS & NOTIFICATIONS
             ========================================================================= */}
          {activeTab === 'circulars' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Controller of Examinations Official Circulars & Bulletins</h3>
                  <p>Issue examination notifications, anti-malpractice rules, and schedules across portals</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn erp-btn-primary" onClick={() => setNewCircularModal(true)}>
                    <Plus size={15} /> Publish New Circular
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {examCirculars.map(circ => (
                  <div key={circ.id} style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed' }}>{circ.circularNo}</span>
                        <span className={`status-pill ${circ.priority === 'Urgent' ? 'danger' : circ.priority === 'High' ? 'warning' : 'info'}`}>
                          {circ.priority} Priority
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Audience: {circ.audience}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{circ.date}</span>
                        <button
                          className="erp-btn erp-btn-danger erp-btn-sm"
                          onClick={() => handleDeleteCircular(circ.id)}
                          title="Delete notice"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a' }}>{circ.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                      {circ.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="exam_cell" />
          )}
        </div>
      </main>

      {/* =========================================================================
          MODAL 1: CREATE EXAM CYCLE
         ========================================================================= */}
      {newCycleModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Create Autonomous Exam Cycle</h3>
                <p>Register new regular, supplementary, or mid-term assessment cycle</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setNewCycleModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCycle}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Examination Cycle Title *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Autonomous End-Semester Regular Examination — Autumn 2026"
                      value={cycleForm.title}
                      onChange={(e) => setCycleForm({ ...cycleForm, title: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Academic Session *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      value={cycleForm.session}
                      onChange={(e) => setCycleForm({ ...cycleForm, session: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Commencement Date *</label>
                    <input
                      type="date"
                      className="exam-form-input"
                      required
                      value={cycleForm.startDate}
                      onChange={(e) => setCycleForm({ ...cycleForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Conclusion Date *</label>
                    <input
                      type="date"
                      className="exam-form-input"
                      required
                      value={cycleForm.endDate}
                      onChange={(e) => setCycleForm({ ...cycleForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewCycleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary" disabled={cycleSaving}>
                  <Check size={14} /> {cycleSaving ? 'Saving…' : 'Create Examination Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SCHEDULE EXAM PAPER (TIMETABLE)
         ========================================================================= */}
      {newPaperModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Schedule Examination Paper Slot</h3>
                <p>Assign exam date, slot timing, branch cohort, and invigilator requirement</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setNewPaperModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePaper}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Course / Subject Code *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      placeholder="e.g. CS501"
                      required
                      value={paperForm.code}
                      onChange={(e) => setPaperForm({ ...paperForm, code: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Course Title *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      placeholder="e.g. Data Structures & Algorithms"
                      required
                      value={paperForm.subject}
                      onChange={(e) => setPaperForm({ ...paperForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Exam Date *</label>
                    <input
                      type="date"
                      className="exam-form-input"
                      required
                      value={paperForm.date}
                      onChange={(e) => setPaperForm({ ...paperForm, date: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Session Slot *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      value={paperForm.time}
                      onChange={(e) => setPaperForm({ ...paperForm, time: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Semester *</label>
                    <select
                      className="exam-form-select"
                      value={paperForm.semester}
                      onChange={(e) => setPaperForm({ ...paperForm, semester: e.target.value })}
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 7">Semester 7</option>
                    </select>
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Applicable Branches (Comma separated) *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="CSE, AI&DS, ECE"
                      value={paperForm.branches}
                      onChange={(e) => setPaperForm({ ...paperForm, branches: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Halls Count *</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      required
                      value={paperForm.roomCount}
                      onChange={(e) => setPaperForm({ ...paperForm, roomCount: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Invigilators Required *</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      required
                      value={paperForm.invigilators}
                      onChange={(e) => setPaperForm({ ...paperForm, invigilators: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewPaperModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Check size={14} /> Schedule Exam Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD EXAMINATION HALL
         ========================================================================= */}
      {newHallModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Add Examination Hall & Seating Range</h3>
                <p>Register room capacity, room superintendent, and candidate roll range</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setNewHallModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateHall}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Exam Hall Code / Name *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      placeholder="e.g. Exam Hall B-304"
                      required
                      value={hallForm.hall}
                      onChange={(e) => setHallForm({ ...hallForm, hall: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Desk Capacity *</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      required
                      value={hallForm.capacity}
                      onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value, allocated: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Chief Invigilator / Room Superintendent *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      placeholder="e.g. Prof. R. K. Behera (Assistant Professor)"
                      required
                      value={hallForm.invigilator}
                      onChange={(e) => setHallForm({ ...hallForm, invigilator: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Allocated Roll Number Range *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      placeholder="e.g. 2305201175 to 2305201230 (CSE Sec D)"
                      required
                      value={hallForm.range}
                      onChange={(e) => setHallForm({ ...hallForm, range: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewHallModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Check size={14} /> Save Hall Seating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADMIT CARD DIGITAL PREVIEW
         ========================================================================= */}
      {admitCardPreviewModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Student Examination Admit Card & Hall Ticket</h3>
                <p>Digital security verified document with barcode and examination center details</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setAdmitCardPreviewModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div className="exam-admit-card-view">
                <div className="exam-doc-watermark">APNA CAMPUS</div>

                <div className="exam-admit-header">
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
                  </div>
                  <h2 className="exam-admit-inst-name">APNA CAMPUS</h2>
                  <p className="exam-admit-inst-sub">
                    Affiliated to BPUT, Rourkela | Approved by AICTE, New Delhi | NAAC "A++" Accredited
                  </p>
                  <p className="exam-admit-inst-sub">Bhubaneswar, Odisha - 752054 · Autonomous Examination Cell</p>
                  <div className="exam-admit-title">OFFICIAL ADMIT CARD & HALL TICKET</div>
                </div>

                <div className="exam-candidate-box">
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.85rem' }}>
                      <div><strong>Candidate:</strong> {admitCardPreviewModal.name.toUpperCase()}</div>
                      <div><strong>Registration No:</strong> <code>{admitCardPreviewModal.regNo}</code></div>
                      <div><strong>Roll Number:</strong> {admitCardPreviewModal.rollNumber}</div>
                      <div><strong>Department:</strong> {admitCardPreviewModal.department}</div>
                      <div><strong>Semester:</strong> {admitCardPreviewModal.semester} Regular</div>
                      <div><strong>Exam Center:</strong> {admitCardPreviewModal.examCenter}</div>
                      <div><strong>Allocated Desk:</strong> {admitCardPreviewModal.seatAllocated}</div>
                      <div><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>VERIFIED & CLEARED</span></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="candidate-photo-box">
                      <GraduationCap size={28} color="#94a3b8" />
                      <span>AFFIX PHOTO / BIOMETRIC</span>
                    </div>
                    <div className="barcode-stripe" title="RFID / Security Barcode" />
                    <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>{admitCardPreviewModal.regNo}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#0f2b48', margin: '0 0 8px' }}>SCHEDULED PAPERS & REPORTING TIMINGS</h4>
                  <table className="erp-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Exam Date</th>
                        <th>Reporting Time</th>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Hall</th>
                        <th>Invigilator Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>10 Nov 2026</td>
                        <td>09:30 AM</td>
                        <td><code>CS501</code></td>
                        <td>Data Structures & Algorithms</td>
                        <td>Hall B-301</td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>[ Sign Here ]</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>13 Nov 2026</td>
                        <td>09:30 AM</td>
                        <td><code>CS502</code></td>
                        <td>Operating Systems</td>
                        <td>Hall B-301</td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>[ Sign Here ]</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>17 Nov 2026</td>
                        <td>09:30 AM</td>
                        <td><code>CS503</code></td>
                        <td>Database Management Systems</td>
                        <td>Hall B-301</td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>[ Sign Here ]</td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>20 Nov 2026</td>
                        <td>09:30 AM</td>
                        <td><code>CS504</code></td>
                        <td>Artificial Intelligence</td>
                        <td>Hall B-301</td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>[ Sign Here ]</td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>24 Nov 2026</td>
                        <td>09:30 AM</td>
                        <td><code>CS505</code></td>
                        <td>Machine Learning</td>
                        <td>Hall B-301</td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>[ Sign Here ]</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.72rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong>Mandatory Exam Hall Instructions:</strong>
                  <br />
                  1. Candidate must carry this printed Admit Card along with their College RFID Smart Card.
                  <br />
                  2. Electronic gadgets, smartwatches, and unauthorized materials are strictly prohibited.
                  <br />
                  3. Entry will be denied 15 minutes after paper commencement.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Authenticated Electronic Record
                    <br />
                    Issued: {admitCardPreviewModal.issuedAt || '03 Oct 2026'}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f2b48' }}>Dr. K. C. Patra</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Controller of Examinations (CoE)</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => window.print()}>
                <Printer size={14} /> Print Admit Card
              </button>
              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={() => handleDownloadStudentAdmitPdf(admitCardPreviewModal)}
              >
                <Download size={14} /> Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: DOOR CHART / SEATING SLIP PREVIEW
         ========================================================================= */}
      {doorChartPreviewModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Examination Hall Door Chart & Seating Slip</h3>
                <p>Official notice board door-sticker format for room entrance</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setDoorChartPreviewModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div className="exam-door-chart-wrap">
                <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{doorChartPreviewModal.hall.toUpperCase()}</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#475569' }}>
                    Autonomous End-Semester Regular Examination · Autumn 2026
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Chief Invigilator: <strong>{doorChartPreviewModal.invigilator}</strong> · Session: <strong>{doorChartPreviewModal.session}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div><strong>Capacity:</strong> {doorChartPreviewModal.capacity} Desks</div>
                  <div><strong>Allocated:</strong> {doorChartPreviewModal.allocated} Examinees</div>
                  <div><strong>Range:</strong> {doorChartPreviewModal.range}</div>
                </div>

                <h4 style={{ margin: '14px 0 8px', fontSize: '0.85rem', color: '#334155' }}>CANDIDATE DESK GRID ALLOCATION</h4>
                <div className="door-desk-grid">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="door-desk-cell">
                      <div className="door-desk-num">Desk {String(i + 1).padStart(2, '0')}</div>
                      <div className="door-desk-roll">23052010{String(i + 1).padStart(2, '0')}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CSE Sec A</div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
                  Students must occupy their allocated desk 15 minutes before the exam begins.
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setDoorChartPreviewModal(null)}>
                Close
              </button>
              <button
                type="button"
                className="erp-btn erp-btn-outline"
                onClick={() => {
                  downloadDoorChartPdf(doorChartPreviewModal);
                  triggerToast(`Official Door Chart PDF downloaded for ${doorChartPreviewModal.hall}`);
                }}
              >
                <Download size={14} /> Download Vector PDF
              </button>
              <button type="button" className="erp-btn erp-btn-primary" onClick={() => window.print()}>
                <Printer size={14} /> Print Door Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: OFFICIAL MARKSHEET / GRADE CARD PREVIEW
         ========================================================================= */}
      {marksheetPreviewModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Official Semester Grade Card & Marksheet</h3>
                <p>Autonomous credit weightage transcript certified by Board of Studies</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setMarksheetPreviewModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div style={{ background: '#ffffff', border: '2px solid #0f2b48', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #dc2626', paddingBottom: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                    <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f2b48' }}>APNA CAMPUS</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Affiliated to Biju Patnaik University of Technology (BPUT), Odisha
                  </p>
                  <div style={{ background: '#0f2b48', color: '#ffffff', display: 'inline-block', padding: '3px 14px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, marginTop: '6px' }}>
                    SEMESTER GRADE CARD (AUTONOMOUS)
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.84rem', marginBottom: '12px' }}>
                  <div><strong>Student Name:</strong> {marksheetPreviewModal.name.toUpperCase()}</div>
                  <div><strong>Registration Number:</strong> <code>{marksheetPreviewModal.regNo}</code></div>
                  <div><strong>Roll Number:</strong> {marksheetPreviewModal.rollNumber}</div>
                  <div><strong>Branch / Program:</strong> B.Tech (Computer Science & Engineering)</div>
                  <div><strong>Examination:</strong> {marksheetPreviewModal.semester} Regular 2026</div>
                  <div><strong>Result Classification:</strong> <strong style={{ color: '#16a34a' }}>{marksheetPreviewModal.status}</strong></div>
                </div>

                <table className="erp-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Credits</th>
                      <th>Internal</th>
                      <th>External</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td><code>CS501</code></td>
                      <td>Data Structures & Algorithms</td>
                      <td>4</td>
                      <td>19</td>
                      <td>72</td>
                      <td>91</td>
                      <td><strong>O</strong></td>
                      <td>10</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td><code>CS502</code></td>
                      <td>Operating Systems</td>
                      <td>4</td>
                      <td>18</td>
                      <td>68</td>
                      <td>86</td>
                      <td><strong>A+</strong></td>
                      <td>9</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td><code>CS503</code></td>
                      <td>Database Management Systems</td>
                      <td>4</td>
                      <td>19</td>
                      <td>70</td>
                      <td>89</td>
                      <td><strong>A+</strong></td>
                      <td>9</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td><code>CS504</code></td>
                      <td>Artificial Intelligence</td>
                      <td>3</td>
                      <td>18</td>
                      <td>65</td>
                      <td>83</td>
                      <td><strong>A+</strong></td>
                      <td>9</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td><code>CS505</code></td>
                      <td>Machine Learning</td>
                      <td>3</td>
                      <td>19</td>
                      <td>70</td>
                      <td>89</td>
                      <td><strong>A+</strong></td>
                      <td>9</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f1f5f9', padding: '12px', borderRadius: '8px', marginTop: '12px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SEMESTER SGPA</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed' }}>{marksheetPreviewModal.sgpa}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CUMULATIVE CGPA</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{marksheetPreviewModal.cgpa}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>TOTAL CREDITS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{marksheetPreviewModal.creditsEarned} / {marksheetPreviewModal.creditsTaken}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Autonomous System Authenticated Marksheet
                    <br />
                    Generated: {new Date().toLocaleDateString('en-IN')}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f2b48' }}>Dr. K. C. Patra</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Controller of Examinations</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => window.print()}>
                <Printer size={14} /> Print Marksheet
              </button>
              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={() => handleDownloadStudentGradeCardPdf(marksheetPreviewModal)}
              >
                <Download size={14} /> Download Grade Card PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: SCRUTINY / RE-EVALUATION EVALUATION
         ========================================================================= */}
      {scrutinyEditModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Evaluate Re-Evaluation & Scrutiny Request</h3>
                <p>Application ID: <code>{scrutinyEditModal.id}</code> · {scrutinyEditModal.studentName}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setScrutinyEditModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateScrutinyDecision}>
              <div className="exam-modal-body">
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '14px' }}>
                  <div><strong>Student:</strong> {scrutinyEditModal.studentName} (Roll {scrutinyEditModal.rollNumber})</div>
                  <div><strong>Course:</strong> {scrutinyEditModal.subjectName} (<code>{scrutinyEditModal.subjectCode}</code>)</div>
                  <div><strong>Original Marks Awarded:</strong> {scrutinyEditModal.originalMarks} / 100</div>
                  <div><strong>Student Request:</strong> {scrutinyEditModal.remarks}</div>
                </div>

                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Scrutiny Decision *</label>
                    <select name="status" className="exam-form-select" defaultValue={scrutinyEditModal.status}>
                      <option value="Approved & Updated">Approved & Updated (Marks Revised)</option>
                      <option value="No Change Verified">No Change Verified (Original Marks Upheld)</option>
                      <option value="Rejected">Rejected (Ineligible / Discrepancy)</option>
                    </select>
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Revised Marks Awarded</label>
                    <input
                      name="recheckedMarks"
                      type="number"
                      className="exam-form-input"
                      min="0"
                      max="100"
                      placeholder="Leave blank if no change"
                      defaultValue={scrutinyEditModal.recheckedMarks || ''}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Scrutiny Board Remarks / Evaluator Notes *</label>
                    <textarea
                      name="remarks"
                      rows={3}
                      className="exam-form-textarea"
                      required
                      defaultValue={scrutinyEditModal.remarks}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setScrutinyEditModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Check size={14} /> Submit Scrutiny Verdict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 8: PUBLISH COE CIRCULAR
         ========================================================================= */}
      {newCircularModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Publish Controller of Examinations Circular</h3>
                <p>Broadcast official notifications to students and examination faculty</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setNewCircularModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCircular}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Circular Reference Number *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      value={circularForm.circularNo}
                      onChange={(e) => setCircularForm({ ...circularForm, circularNo: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Priority Sla *</label>
                    <select
                      className="exam-form-select"
                      value={circularForm.priority}
                      onChange={(e) => setCircularForm({ ...circularForm, priority: e.target.value })}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent / Critical</option>
                    </select>
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Circular Title / Subject *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      placeholder="e.g. Autumn 2026 End-Semester Admit Card Download Protocol"
                      required
                      value={circularForm.title}
                      onChange={(e) => setCircularForm({ ...circularForm, title: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Category *</label>
                    <select
                      className="exam-form-select"
                      value={circularForm.category}
                      onChange={(e) => setCircularForm({ ...circularForm, category: e.target.value })}
                    >
                      <option value="Hall Ticket">Hall Ticket</option>
                      <option value="Guidelines">Guidelines & Rules</option>
                      <option value="Schedule">Schedule / Timetable</option>
                      <option value="General">General Notice</option>
                    </select>
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Target Audience *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      value={circularForm.audience}
                      onChange={(e) => setCircularForm({ ...circularForm, audience: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Official Circular Notice Body *</label>
                    <textarea
                      rows={4}
                      className="exam-form-textarea"
                      required
                      placeholder="Enter official circular details..."
                      value={circularForm.content}
                      onChange={(e) => setCircularForm({ ...circularForm, content: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewCircularModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Send size={14} /> Release & Publish Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
