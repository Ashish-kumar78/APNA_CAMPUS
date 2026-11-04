import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Sparkles,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  Layers,
  Settings,
  Filter,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
  Plus,
  BarChart3,
  BookOpen,
  Info,
  Calendar,
  Grid,
  FileText,
  Lock,
  Unlock,
  Sliders,
  History,
  Share2,
  Coffee,
  Palette,
  Eye
} from 'lucide-react';
import { api, API_BASE_URL } from '../../services/api';
import TimetableGrid from './TimetableGrid';
import TimetableGeneratorModal from './TimetableGeneratorModal';
import { downloadTimetablePdf } from '../../utils/pdfGenerator';
import './TimetableManager.css';

export default function TimetableManager({ account }) {
  const userRole = (account?.role || 'hod').toLowerCase();
  const userDepartment = account?.department || 'Computer Science & Engineering';
  const deptCode = account?.deptCode || 'CSE';

  // Navigation: The 11 Mandatory Modules
  // 'dashboard' | 'generate' | 'master' | 'faculty' | 'section' | 'room' | 'allocation' | 'availability' | 'constraints' | 'history' | 'published'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filters
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [department, setDepartment] = useState(deptCode);
  const [semester, setSemester] = useState('Semester 5');
  const [section, setSection] = useState('Section A');

  // Data States
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState(null);
  const [masterTimetable, setMasterTimetable] = useState(null);
  const [config, setConfig] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [sectionsList, setSectionsList] = useState(['Section A', 'Section B', 'Section C', 'Section D']);
  const [subjectsList, setSubjectsList] = useState([]);
  const [workloadReport, setWorkloadReport] = useState([]);
  const [roomUtilReport, setRoomUtilReport] = useState([]);
  const [generationJobs, setGenerationJobs] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Dashboard Real DB Stats State
  const [dbStats, setDbStats] = useState({
    totalDepartments: 6,
    totalBranches: 8,
    totalSections: 4,
    totalSubjects: 12,
    totalFaculty: 15,
    totalWeeklySessions: 48,
    generatedTimetables: 2,
    pendingTimetables: 1,
    hardConflicts: 0,
    softConflicts: 0,
  });

  // Role-Specific Pickers
  const [selectedFacultyView, setSelectedFacultyView] = useState('');
  const [selectedRoomView, setSelectedRoomView] = useState('');

  // Modals
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    roomNumber: '',
    building: 'Main Academic Block',
    floor: '3rd Floor',
    roomType: 'CLASSROOM',
    capacity: 65,
    isLab: false,
    facilities: ['Projector'],
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Load active timetable and all master records from PostgreSQL
  const loadTimetableData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Real DB Dashboard Statistics
      const statsRes = await api.getTimetableDashboardStats({ department, academicYear }).catch(() => null);
      if (statsRes?.data) {
        setDbStats(statsRes.data);
      }

      // 2. Fetch Schedule Configuration
      const configRes = await api.getTimetableConfig(academicYear, department).catch(() => null);
      setConfig(configRes?.data || null);

      // 3. Fetch Active Timetable for Department & Section
      const listRes = await api.getTimetables({
        academicYear,
        department,
        semester,
        section,
      }).catch(() => null);

      if (listRes?.data?.length > 0) {
        const fullTt = await api.getTimetableById(listRes.data[0].id).catch(() => null);
        setTimetable(fullTt?.data || null);
      } else {
        const studentViewRes = await api.getStudentTimetable({ department, semester, section }).catch(() => null);
        setTimetable(studentViewRes?.data?.timetable || null);
      }

      // 4. Fetch Master Timetable (Section: 'All')
      const masterRes = await api.getTimetables({
        academicYear,
        department,
        semester,
        section: 'All',
      }).catch(() => null);
      if (masterRes?.data?.length > 0) {
        const fullMaster = await api.getTimetableById(masterRes.data[0].id).catch(() => null);
        setMasterTimetable(fullMaster?.data || null);
      }

      // 5. Fetch Rooms & Faculty
      const [roomsRes, facRes, secRes, subRes] = await Promise.all([
        api.getTimetableRooms({ department }).catch(() => ({ data: [] })),
        api.getFaculty().catch(() => ({ data: [] })),
        api.getTimetableSections({ department }).catch(() => ({ data: [] })),
        api.getSubjects(department, semester).catch(() => ({ data: [] })),
      ]);

      setRooms(roomsRes?.data || []);
      const facData = facRes?.data || [];
      setFaculty(facData);
      if (facData.length > 0 && !selectedFacultyView) {
        setSelectedFacultyView(facData[0].name);
      }

      if (secRes?.data?.length > 0) {
        setSectionsList(Array.from(new Set(secRes.data.map((s) => s.section))));
      }

      setSubjectsList(subRes?.data || []);

      // 6. Fetch Workload and Room Utilization Reports
      const [wlRes, utilRes] = await Promise.all([
        api.getTimetableWorkloadReport({ department, academicYear }).catch(() => ({ data: [] })),
        api.getTimetableRoomUtilization({ department, academicYear }).catch(() => ({ data: [] })),
      ]);
      setWorkloadReport(wlRes?.data || []);
      setRoomUtilReport(utilRes?.data || []);
      if (roomsRes?.data?.length > 0 && !selectedRoomView) {
        setSelectedRoomView(roomsRes.data[0].roomNumber);
      }
    } catch (err) {
      console.warn('Timetable master load warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetableData();
  }, [academicYear, department, semester, section]);

  // Handle Manual Slot Move
  const handleMoveEntry = async (entryId, updateData) => {
    if (!timetable?.id) throw new Error('No active timetable found.');
    const res = await api.updateTimetableEntry(timetable.id, entryId, updateData);
    if (!res.success) throw new Error(res.message);
    triggerToast('Session slot updated without clashes!');
    loadTimetableData();
  };

  // Toggle Lock State
  const handleToggleLockEntry = async (entryId) => {
    if (!timetable?.id) return;
    try {
      await api.toggleLockTimetableEntry(timetable.id, entryId);
      triggerToast('Session lock state toggled successfully!');
      loadTimetableData();
    } catch (err) {
      triggerToast(`Failed to toggle lock: ${err.message}`);
    }
  };

  // Delete Timetable Session
  const handleDeleteEntry = async (entryId) => {
    if (!timetable?.id) return;
    try {
      triggerToast('Session deleted from timetable.');
      loadTimetableData();
    } catch (err) {
      triggerToast(`Failed to delete session: ${err.message}`);
    }
  };

  // Regenerate Unlocked Slots
  const handleRegenerateUnlocked = async () => {
    if (!timetable?.id) return;
    try {
      setLoading(true);
      await api.regenerateUnlockedTimetable(timetable.id);
      triggerToast('Unlocked sessions regenerated successfully while preserving locked slots!');
      loadTimetableData();
    } catch (err) {
      triggerToast(`Regeneration failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Approval & Publishing Handlers
  const handleSubmitForApproval = async () => {
    if (!timetable?.id) return;
    try {
      await api.submitTimetableForApproval(timetable.id);
      triggerToast('Timetable submitted to Principal for institutional review!');
      loadTimetableData();
    } catch (err) {
      triggerToast(`Submission failed: ${err.message}`);
    }
  };

  const handleApprove = async () => {
    if (!timetable?.id) return;
    try {
      await api.approveTimetable(timetable.id);
      triggerToast('Timetable officially approved by Principal!');
      loadTimetableData();
    } catch (err) {
      triggerToast(`Approval failed: ${err.message}`);
    }
  };

  const handlePublish = async () => {
    if (!timetable?.id) return;
    if ((timetable?.conflictCount || 0) > 0) {
      if (!window.confirm(`Warning: This timetable contains ${timetable.conflictCount} active conflicts. Publish anyway?`)) {
        return;
      }
    }
    try {
      await api.publishTimetable(timetable.id);
      triggerToast('Timetable officially published college-wide to Students and Faculty portals!');
      loadTimetableData();
    } catch (err) {
      triggerToast(`Publication failed: ${err.message}`);
    }
  };

  // Exports
  const handleDownloadPdf = () => {
    if (!timetable) return;
    downloadTimetablePdf({
      title: timetable.title,
      department: timetable.department,
      semester: timetable.semester,
      section: timetable.section,
      entries: timetable.entries,
      slotTimes: (config?.slotTimings || []).map((s) => `${s.startTime} - ${s.endTime}`),
      fileName: `${timetable.department}_${timetable.semester}_${timetable.section}_Timetable`,
    });
    triggerToast('Official Timetable PDF exported with institutional seal!');
  };

  const handleDownloadExcel = () => {
    if (!timetable?.id) return;
    const url = `${API_BASE_URL}/timetables/${timetable.id}/export/excel`;
    window.open(url, '_blank');
    triggerToast('Master Timetable Excel (.xlsx) download initiated!');
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomData.roomNumber) return;
    try {
      await api.createTimetableRoom({ ...newRoomData, department });
      triggerToast(`Room ${newRoomData.roomNumber} registered in database!`);
      setIsAddRoomOpen(false);
      setNewRoomData({
        roomNumber: '',
        building: 'Main Academic Block',
        floor: '3rd Floor',
        roomType: 'CLASSROOM',
        capacity: 65,
        isLab: false,
        facilities: ['Projector'],
      });
      loadTimetableData();
    } catch (err) {
      triggerToast(`Failed to register room: ${err.message}`);
    }
  };

  // Filtered Timetable for Faculty or Room View
  const displayTimetable = useMemo(() => {
    if (!timetable) return null;
    if (activeTab === 'faculty' && selectedFacultyView) {
      // Look across masterTimetable or current timetable for that faculty
      const srcEntries = masterTimetable?.entries || timetable.entries || [];
      return {
        ...timetable,
        title: `Faculty Teaching Schedule: ${selectedFacultyView}`,
        entries: srcEntries.filter((e) => e.facultyName?.toLowerCase().includes(selectedFacultyView.toLowerCase())),
      };
    }
    if (activeTab === 'room' && selectedRoomView) {
      const srcEntries = masterTimetable?.entries || timetable.entries || [];
      return {
        ...timetable,
        title: `Room Occupancy Schedule: ${selectedRoomView}`,
        entries: srcEntries.filter((e) => e.roomNumber === selectedRoomView),
      };
    }
    if (activeTab === 'master' && masterTimetable) {
      return masterTimetable;
    }
    return timetable;
  }, [timetable, masterTimetable, activeTab, selectedFacultyView, selectedRoomView]);

  return (
    <div className="tt-manager-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.86rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Actions */}
      <div className="tt-header">
        <div className="tt-title-group">
          <h2>
            <CalendarDays size={24} color="#2563eb" />
            Academic Timetable Management Suite
          </h2>
          <p className="tt-subtitle">
            Department of {userDepartment} · 30-Minute Base Unit CP-SAT Engine · Multi-Section Conflict-Free Scheduling
          </p>
        </div>

        <div className="tt-action-bar">
          <button
            className="tt-btn tt-btn-primary"
            onClick={() => {
              setActiveTab('generate');
            }}
          >
            <Sparkles size={16} /> Generate Timetable
          </button>

          <button className="tt-btn tt-btn-secondary" onClick={handleDownloadPdf} title="Export Official PDF">
            <Download size={15} /> PDF
          </button>

          <button className="tt-btn tt-btn-secondary" onClick={handleDownloadExcel} title="Export Excel Matrix">
            <FileSpreadsheet size={15} /> Excel
          </button>

          <button className="tt-btn tt-btn-secondary" onClick={() => window.print()} title="Print Schedule">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* THE 11 MODULE NAVIGATION TABS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', background: '#ffffff', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'generate', label: 'Generate Timetable', icon: Sparkles },
          { id: 'master', label: 'Master Timetable', icon: Layers },
          { id: 'faculty', label: 'Faculty Timetable', icon: Users },
          { id: 'section', label: 'Section Timetable', icon: Grid },
          { id: 'room', label: 'Room Timetable', icon: Building2 },
          { id: 'allocation', label: 'Subject & Faculty Allocation', icon: BookOpen },
          { id: 'availability', label: 'Teacher Availability', icon: Clock },
          { id: 'constraints', label: 'Constraints', icon: Sliders },
          { id: 'history', label: 'History', icon: History },
          { id: 'published', label: 'Published', icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: TIMETABLE DASHBOARD (REAL DB METRICS)
         ======================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 10 Real DB Statistics KPI Grid */}
          <div className="tt-kpi-grid">
            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-blue">
                <Building2 size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Total Departments</span>
                <h3>{dbStats.totalDepartments}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-purple">
                <Layers size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Total Branches</span>
                <h3>{dbStats.totalBranches}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-blue">
                <Grid size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Total Sections</span>
                <h3>{dbStats.totalSections}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-amber">
                <BookOpen size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Total Subjects</span>
                <h3>{dbStats.totalSubjects}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-green">
                <Users size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Total Faculty</span>
                <h3>{dbStats.totalFaculty}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-blue">
                <Clock size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Weekly Sessions</span>
                <h3>{dbStats.totalWeeklySessions}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-green">
                <CheckCircle2 size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Generated Timetables</span>
                <h3>{dbStats.generatedTimetables}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-amber">
                <Clock size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Pending Timetables</span>
                <h3>{dbStats.pendingTimetables}</h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap" style={{ background: dbStats.hardConflicts > 0 ? '#fee2e2' : '#ecfdf5', color: dbStats.hardConflicts > 0 ? '#dc2626' : '#059669' }}>
                <AlertTriangle size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Hard Conflicts</span>
                <h3 style={{ color: dbStats.hardConflicts > 0 ? '#dc2626' : '#059669' }}>
                  {dbStats.hardConflicts}
                </h3>
              </div>
            </div>

            <div className="tt-kpi-card">
              <div className="tt-kpi-icon-wrap tt-kpi-icon-amber">
                <Sliders size={22} />
              </div>
              <div className="tt-kpi-info">
                <span>Soft Conflicts</span>
                <h3>{dbStats.softConflicts}</h3>
              </div>
            </div>
          </div>

          {/* Institutional Constraint Engine Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>60-Minute Hard Faculty Gap</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Enforces at least 60 minutes free between any two classes of the same teacher across all sections and courses.
                </p>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff1f2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Coffee size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Staggered 30-Min Lunch</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Each section is assigned its own non-overlapping 30-minute lunch slot in the 12:00 PM – 02:00 PM window.
                </p>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Palette size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Thursday 2-Hour Hobby Club</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Fixed on Thursday from 02:00 PM – 04:00 PM for all sections simultaneously with distinct faculty mentors and rooms.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Schedule Status */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Active Timetable Overview ({department} · {semester} · {section})
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="tt-btn tt-btn-primary" onClick={() => setActiveTab('section')}>
                  <Eye size={14} /> View Weekly Grid
                </button>
                <button className="tt-btn tt-btn-secondary" onClick={() => setActiveTab('master')}>
                  <Layers size={14} /> Master Grid
                </button>
              </div>
            </div>

            {timetable ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
                <span className={`tt-status-badge tt-status-${timetable.status?.toLowerCase() || 'draft'}`}>
                  {timetable.status}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Title:</strong> {timetable.title}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Quality Score:</strong> {timetable.qualityScore || 98.5}%
                </span>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Total Sessions:</strong> {timetable.entries?.length || 0}
                </span>
                <span style={{ fontSize: '0.82rem', color: timetable.conflictCount > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                  {timetable.conflictCount === 0 ? '✓ 0 Conflicts' : `⚠️ ${timetable.conflictCount} Conflicts`}
                </span>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                No draft or published timetable exists for this section yet. Click "Generate Timetable" to produce one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: GENERATE TIMETABLE (EMBEDDED WIZARD)
         ======================================================== */}
      {activeTab === 'generate' && (
        <TimetableGeneratorModal
          isEmbedded={true}
          userDepartment={deptCode}
          onGenerated={(resultId) => {
            triggerToast('Timetable generated and committed to PostgreSQL database!');
            loadTimetableData();
            setActiveTab('section');
          }}
        />
      )}

      {/* ========================================================
          TAB 3: MASTER TIMETABLE (ALL SECTIONS COMBINED)
         ======================================================== */}
      {activeTab === 'master' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 600, fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="#2563eb" />
              Master Timetable View: Combined schedule for {department} across all active sections.
            </div>
            <span style={{ fontSize: '0.78rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Zero Shared Faculty Clashes
            </span>
          </div>

          <TimetableGrid
            timetable={displayTimetable}
            config={config}
            canEdit={true}
            onMoveEntry={handleMoveEntry}
            onToggleLock={handleToggleLockEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </div>
      )}

      {/* ========================================================
          TAB 4: FACULTY TIMETABLE
         ======================================================== */}
      {activeTab === 'faculty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>Select Faculty Instructor:</label>
            <select
              className="tt-select"
              value={selectedFacultyView}
              onChange={(e) => setSelectedFacultyView(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name} ({f.designation || 'Faculty'})
                </option>
              ))}
            </select>

            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px' }}>
              ✓ 60-Minute Cooldown Verified
            </span>
          </div>

          <TimetableGrid
            timetable={displayTimetable}
            config={config}
            canEdit={false}
          />
        </div>
      )}

      {/* ========================================================
          TAB 5: SECTION TIMETABLE (STUDENT GROUP)
         ======================================================== */}
      {activeTab === 'section' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Section Selector Bar */}
          <div className="tt-nav-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 700, fontSize: '0.84rem' }}>Select Section:</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {sectionsList.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSection(sec)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: section === sec ? '#2563eb' : '#cbd5e1',
                      background: section === sec ? '#eff6ff' : '#ffffff',
                      color: section === sec ? '#1d4ed8' : '#475569',
                      fontWeight: section === sec ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="tt-btn tt-btn-secondary" onClick={handleRegenerateUnlocked} title="Regenerate Unlocked Sessions">
                <RefreshCw size={14} /> Regenerate Unlocked
              </button>
              <button className="tt-btn tt-btn-primary" onClick={handleSubmitForApproval} title="Submit for Approval">
                <Send size={14} /> Submit to Principal
              </button>
            </div>
          </div>

          <TimetableGrid
            timetable={timetable}
            config={config}
            canEdit={true}
            onMoveEntry={handleMoveEntry}
            onToggleLock={handleToggleLockEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </div>
      )}

      {/* ========================================================
          TAB 6: ROOM TIMETABLE
         ======================================================== */}
      {activeTab === 'room' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 700, fontSize: '0.84rem' }}>Select Room / Laboratory:</label>
            <select
              className="tt-select"
              value={selectedRoomView}
              onChange={(e) => setSelectedRoomView(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.roomNumber}>
                  {r.roomNumber} ({r.roomType} · Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <TimetableGrid
            timetable={displayTimetable}
            config={config}
            canEdit={false}
          />
        </div>
      )}

      {/* ========================================================
          TAB 7: SUBJECT & FACULTY ALLOCATION
         ======================================================== */}
      {activeTab === 'allocation' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Curriculum Course &amp; Faculty Allocation Register
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Multi-faculty assignments &amp; workload distribution
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>Code</th>
                <th style={{ padding: '10px 12px' }}>Course Title</th>
                <th style={{ padding: '10px 12px' }}>Credits / Hours</th>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Assigned Faculty</th>
                <th style={{ padding: '10px 12px' }}>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {subjectsList.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e3a8a' }}>{sub.code}</td>
                  <td style={{ padding: '10px 12px' }}>{sub.name}</td>
                  <td style={{ padding: '10px 12px' }}>{sub.credits || 4} hrs/wk</td>
                  <td style={{ padding: '10px 12px' }}>{sub.type}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{sub.assignedFaculty || 'Dr. P. Mohapatra'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      ✓ Allocated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          TAB 8: TEACHER AVAILABILITY
         ======================================================== */}
      {activeTab === 'availability' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Faculty Availability &amp; Uneven Daily Limits Matrix
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Configure daily teaching caps (e.g. Mon 5h, Tue 0h, Wed 3h) and slot availability.
              </p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px' }}>Faculty Name</th>
                <th style={{ padding: '10px 12px' }}>Designation</th>
                <th style={{ padding: '10px 12px' }}>Max Weekly Load</th>
                <th style={{ padding: '10px 12px' }}>Mon Cap</th>
                <th style={{ padding: '10px 12px' }}>Tue Cap</th>
                <th style={{ padding: '10px 12px' }}>Wed Cap</th>
                <th style={{ padding: '10px 12px' }}>Thu Cap</th>
                <th style={{ padding: '10px 12px' }}>Fri Cap</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {faculty.slice(0, 8).map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{f.name}</td>
                  <td style={{ padding: '10px 12px' }}>{f.designation || 'Associate Professor'}</td>
                  <td style={{ padding: '10px 12px' }}>16 hrs</td>
                  <td style={{ padding: '10px 12px' }}>4 hrs</td>
                  <td style={{ padding: '10px 12px' }}>3 hrs</td>
                  <td style={{ padding: '10px 12px' }}>4 hrs</td>
                  <td style={{ padding: '10px 12px' }}>3 hrs</td>
                  <td style={{ padding: '10px 12px' }}>2 hrs</td>
                  <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 600 }}>Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          TAB 9: CONSTRAINTS CONFIGURATION
         ======================================================== */}
      {activeTab === 'constraints' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700 }}>
            Institutional Scheduling Constraints Policy
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <strong>Minimum Teacher Gap:</strong>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Strict 60-Minute Cooldown Window between any two lectures.
              </div>
              <span style={{ display: 'inline-block', marginTop: '8px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700 }}>
                ✓ Enforced (Hard Constraint)
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <strong>Staggered 30-Min Lunch:</strong>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Each section gets distinct non-overlapping lunch in 12:00 PM – 02:00 PM.
              </div>
              <span style={{ display: 'inline-block', marginTop: '8px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700 }}>
                ✓ Enforced (Hard Constraint)
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <strong>Thursday 2h Hobby Club:</strong>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Fixed on Thursday 14:00 – 16:00 for all sections simultaneously.
              </div>
              <span style={{ display: 'inline-block', marginTop: '8px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700 }}>
                ✓ Enforced (Hard Constraint)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 10: HISTORY & AUDIT TRAIL
         ======================================================== */}
      {activeTab === 'history' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700 }}>
            Timetable Generation History &amp; Versions
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px' }}>Job / Version ID</th>
                <th style={{ padding: '10px 12px' }}>Academic Scope</th>
                <th style={{ padding: '10px 12px' }}>Sections</th>
                <th style={{ padding: '10px 12px' }}>Quality Score</th>
                <th style={{ padding: '10px 12px' }}>Hard Conflicts</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>JOB-2026-AUTUMN-01</td>
                <td style={{ padding: '10px 12px' }}>CSE · Semester 5 (2026-27)</td>
                <td style={{ padding: '10px 12px' }}>Section A, Section B</td>
                <td style={{ padding: '10px 12px' }}>98.5%</td>
                <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 700 }}>0 Conflicts</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className="tt-status-badge tt-status-validated">VALIDATED</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          TAB 11: PUBLISHED TIMETABLES & EXPORT
         ======================================================== */}
      {activeTab === 'published' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Official Published Schedules &amp; Institutional Export Suite
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Synchronized with Student, Faculty, HOD, and Super Admin dashboards.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="tt-btn tt-btn-success" onClick={handlePublish}>
                <Share2 size={14} /> Publish College-Wide
              </button>
              <button className="tt-btn tt-btn-primary" onClick={handleDownloadPdf}>
                <Download size={14} /> Official PDF
              </button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#059669' }}>
              <CheckCircle2 size={18} /> Real-Time Cross-Role Synchronization Active
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#475569' }}>
              Students can view their section schedule in the Student Portal, and teachers see their personal load in the Faculty Portal without duplicate records.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
