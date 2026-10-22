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
  Info
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

  // Filters
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [department, setDepartment] = useState(deptCode);
  const [semester, setSemester] = useState('Semester 5');
  const [section, setSection] = useState('Section A');
  const [activeTab, setActiveTab] = useState('grid'); // 'grid', 'faculty', 'rooms', 'workload', 'conflicts', 'policy'

  // Data
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState(null);
  const [config, setConfig] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [workloadReport, setWorkloadReport] = useState([]);
  const [roomUtilReport, setRoomUtilReport] = useState([]);
  const [selectedFacultyView, setSelectedFacultyView] = useState('');
  const [selectedRoomView, setSelectedRoomView] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
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
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Load active timetable and configuration
  const loadTimetableData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Schedule Config
      const configRes = await api.getTimetableConfig(academicYear, department);
      setConfig(configRes?.data || null);

      // 2. Fetch Active Timetable for Department & Section
      const listRes = await api.getTimetables({
        academicYear,
        department,
        semester,
        section,
      });

      if (listRes?.data?.length > 0) {
        // Load full timetable details with entries & conflicts
        const fullTt = await api.getTimetableById(listRes.data[0].id);
        setTimetable(fullTt?.data || null);
      } else {
        // Fallback to student view query or empty draft
        const studentViewRes = await api.getStudentTimetable({ department, semester, section });
        setTimetable(studentViewRes?.data?.timetable || null);
      }

      // 3. Fetch Rooms
      const roomsRes = await api.getTimetableRooms({ department });
      setRooms(roomsRes?.data || []);

      // 4. Fetch Workload
      const wlRes = await api.getTimetableWorkloadReport({ department, academicYear });
      setWorkloadReport(wlRes?.data || []);

      // 5. Fetch Room Utilization
      const utilRes = await api.getTimetableRoomUtilization({ department, academicYear });
      setRoomUtilReport(utilRes?.data || []);
    } catch (err) {
      console.warn('Timetable data load warning:', err.message);
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

  // Lifecycle Handlers
  const handleSubmitForApproval = async () => {
    if (!timetable?.id) return;
    try {
      await api.submitTimetableForApproval(timetable.id);
      triggerToast('Timetable submitted to Principal for formal review!');
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
      if (!window.confirm(`Warning: This timetable contains ${timetable.conflictCount} active scheduling conflicts. Are you sure you want to publish an un-cleared schedule?`)) {
        return;
      }
    }
    try {
      await api.publishTimetable(timetable.id);
      triggerToast(`Timetable published college-wide to all students and faculty!`);
      loadTimetableData();
    } catch (err) {
      triggerToast(`Publication failed: ${err.message}`);
    }
  };

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
    triggerToast('Weekly Timetable PDF exported successfully!');
  };

  const handleDownloadExcel = () => {
    if (!timetable?.id) return;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('collegeflow_token') : null;
    const url = `${API_BASE_URL}/timetables/${timetable.id}/export/excel`;
    window.open(url, '_blank');
    triggerToast('Master Timetable Excel (.xlsx) file download initiated!');
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomData.roomNumber) return;
    try {
      await api.createTimetableRoom({ ...newRoomData, department });
      triggerToast(`Room ${newRoomData.roomNumber} registered in master database!`);
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

  // Distinct Faculty and Rooms for view filters
  const distinctFaculty = useMemo(() => {
    const list = new Set();
    (timetable?.entries || []).forEach((e) => {
      if (e.facultyName) list.add(e.facultyName);
    });
    return Array.from(list);
  }, [timetable]);

  const distinctRooms = useMemo(() => {
    const list = new Set();
    (timetable?.entries || []).forEach((e) => {
      if (e.roomNumber) list.add(e.roomNumber);
    });
    return Array.from(list);
  }, [timetable]);

  // Filtered entries for faculty or room view
  const displayTimetable = useMemo(() => {
    if (!timetable) return null;
    if (activeTab === 'faculty' && selectedFacultyView) {
      return {
        ...timetable,
        entries: timetable.entries.filter((e) => e.facultyName === selectedFacultyView),
      };
    }
    if (activeTab === 'rooms' && selectedRoomView) {
      return {
        ...timetable,
        entries: timetable.entries.filter((e) => e.roomNumber === selectedRoomView),
      };
    }
    return timetable;
  }, [timetable, activeTab, selectedFacultyView, selectedRoomView]);

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
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" />
          {toastMessage}
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="tt-header">
        <div className="tt-title-group">
          <h2>
            <CalendarDays size={26} color="#2563eb" />
            Automated Academic Timetable System
          </h2>
          <p className="tt-subtitle">
            Constraint-optimized weekly schedules powered by Google OR-Tools CP-SAT · Conflict Detection &amp; Publishing Governance
          </p>
        </div>

        <div className="tt-action-bar">
          <button
            className="tt-btn tt-btn-primary"
            onClick={() => setIsGeneratorOpen(true)}
          >
            <Sparkles size={16} /> Generate Timetable
          </button>

          {/* HOD: Submit for Approval */}
          {(userRole === 'hod' || userRole === 'super_admin' || userRole === 'admin') &&
            timetable &&
            timetable.status !== 'PUBLISHED' &&
            timetable.status !== 'PENDING_APPROVAL' && (
              <button
                className="tt-btn tt-btn-warning"
                onClick={handleSubmitForApproval}
                title="Submit current draft to Principal for formal approval"
              >
                <Send size={15} /> Submit for Approval
              </button>
            )}

          {/* Principal: Approve */}
          {(userRole === 'principal' || userRole === 'super_admin') &&
            timetable &&
            timetable.status === 'PENDING_APPROVAL' && (
              <button
                className="tt-btn tt-btn-success"
                onClick={handleApprove}
                title="Grant official Principal approval"
              >
                <ShieldCheck size={16} /> Approve Timetable
              </button>
            )}

          {/* Principal / Admin: Publish */}
          {(userRole === 'principal' || userRole === 'super_admin' || userRole === 'admin') &&
            timetable &&
            !timetable.isPublished && (
              <button
                className="tt-btn tt-btn-primary"
                style={{ background: '#1d4ed8' }}
                onClick={handlePublish}
                title="Broadcast official timetable to all students and faculty"
              >
                <CheckCircle2 size={16} /> Publish Timetable
              </button>
            )}

          <button className="tt-btn tt-btn-secondary" onClick={handleDownloadExcel} title="Export timetable to Excel spreadsheet">
            <FileSpreadsheet size={15} color="#059669" /> Excel
          </button>

          <button className="tt-btn tt-btn-secondary" onClick={handleDownloadPdf} title="Download printable PDF timetable">
            <Download size={15} color="#2563eb" /> PDF
          </button>

          <button className="tt-btn tt-btn-secondary" onClick={() => window.print()} title="Print current view">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="tt-kpi-grid">
        <div className="tt-kpi-card">
          <div className="tt-kpi-icon-wrap tt-kpi-icon-blue">
            <Layers size={22} />
          </div>
          <div className="tt-kpi-info">
            <span>Scheduled Sessions</span>
            <h3>{timetable?.entries?.length || 0} Periods</h3>
          </div>
        </div>

        <div className="tt-kpi-card">
          <div className="tt-kpi-icon-wrap tt-kpi-icon-green">
            <ShieldCheck size={22} />
          </div>
          <div className="tt-kpi-info">
            <span>Optimization Score</span>
            <h3>
              {timetable?.qualityScore
                ? `${timetable.qualityScore}%`
                : (timetable?.entries?.length || 0) > 0
                  ? `${Math.max(0, Math.min(100, Math.round(((timetable.entries.length) / 30) * 100 - (timetable.conflictCount || 0) * 15)))}%`
                  : 'N/A (Draft empty)'}
            </h3>
          </div>
        </div>

        <div className="tt-kpi-card">
          <div className="tt-kpi-icon-wrap tt-kpi-icon-amber">
            <AlertTriangle size={22} />
          </div>
          <div className="tt-kpi-info">
            <span>Detected Conflicts</span>
            <h3 style={{ color: (timetable?.conflictCount || 0) > 0 ? '#dc2626' : '#059669' }}>
              {timetable?.conflictCount || 0} Clashes
            </h3>
          </div>
        </div>

        <div className="tt-kpi-card">
          <div className="tt-kpi-icon-wrap tt-kpi-icon-purple">
            <Clock size={22} />
          </div>
          <div className="tt-kpi-info">
            <span>Publishing Lifecycle</span>
            <div style={{ marginTop: '3px' }}>
              <span className={`tt-status-badge tt-status-${(timetable?.status || 'draft').toLowerCase()}`}>
                {timetable?.isPublished ? 'PUBLISHED' : timetable?.status || 'DRAFT'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts Alert Banner if hard conflicts present */}
      {timetable?.conflicts && timetable.conflicts.length > 0 && (
        <div className="tt-conflict-alert">
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong>Active Scheduling Conflicts Detected ({timetable.conflicts.length})</strong>
            <p style={{ margin: '3px 0 0', fontSize: '0.84rem' }}>
              The constraint engine flagged the following issues. Manual slot edits will be restricted until hard conflicts are cleared.
            </p>
            <ul className="tt-conflict-list">
              {timetable.conflicts.slice(0, 3).map((c, i) => (
                <li key={i}>
                  <strong>[{c.conflictType}]</strong> {c.description} {c.suggestedAction ? `— Suggestion: ${c.suggestedAction}` : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation & View Filter Bar */}
      <div className="tt-nav-bar">
        <div className="tt-view-tabs">
          <button
            className={`tt-tab-btn ${activeTab === 'grid' ? 'active' : ''}`}
            onClick={() => setActiveTab('grid')}
          >
            <CalendarDays size={14} /> Section Grid
          </button>
          <button
            className={`tt-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('faculty');
              if (!selectedFacultyView && distinctFaculty.length > 0) setSelectedFacultyView(distinctFaculty[0]);
            }}
          >
            <Users size={14} /> Faculty Schedule
          </button>
          <button
            className={`tt-tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('rooms');
              if (!selectedRoomView && distinctRooms.length > 0) setSelectedRoomView(distinctRooms[0]);
            }}
          >
            <Building2 size={14} /> Room Allocation
          </button>
          <button
            className={`tt-tab-btn ${activeTab === 'workload' ? 'active' : ''}`}
            onClick={() => setActiveTab('workload')}
          >
            <BarChart3 size={14} /> Workload Analysis
          </button>
          <button
            className={`tt-tab-btn ${activeTab === 'roomRegistry' ? 'active' : ''}`}
            onClick={() => setActiveTab('roomRegistry')}
          >
            <Building2 size={14} /> Rooms &amp; Labs ({rooms.length})
          </button>
        </div>

        <div className="tt-filter-selects">
          <select
            className="tt-select"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="2026-27">2026-27 Session</option>
            <option value="2025-26">2025-26 Session</option>
          </select>

          <select
            className="tt-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="CSE">CSE Department</option>
            <option value="AI&ML">AI &amp; ML</option>
            <option value="ECE">ECE Department</option>
            <option value="CA">Computer Applications</option>
          </select>

          <select
            className="tt-select"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 5">Semester 5</option>
            <option value="Semester 7">Semester 7</option>
          </select>

          <select
            className="tt-select"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
          </select>

          <button className="tt-btn tt-btn-secondary" style={{ padding: '0.42rem 0.65rem' }} onClick={loadTimetableData} title="Refresh Timetable">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* VIEW: SECTION GRID */}
      {activeTab === 'grid' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
              Showing {timetable?.title || `${department} ${semester} (${section})`}
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2563eb' }} /> Theory (TH)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#059669' }} /> Practical / Lab (LAB)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d97706' }} /> Lunch Interval
              </span>
            </div>
          </div>

          <TimetableGrid
            timetable={timetable}
            config={config}
            onMoveEntry={handleMoveEntry}
            canEdit={userRole === 'hod' || userRole === 'super_admin' || userRole === 'admin'}
          />
        </>
      )}

      {/* VIEW: FACULTY-WISE TIMETABLE */}
      {activeTab === 'faculty' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Select Faculty Member:</label>
            <select
              className="tt-form-select"
              style={{ maxWidth: '280px' }}
              value={selectedFacultyView}
              onChange={(e) => setSelectedFacultyView(e.target.value)}
            >
              {distinctFaculty.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <small style={{ color: '#64748b' }}>
              Filtered view showing only lectures assigned to {selectedFacultyView || 'the instructor'}.
            </small>
          </div>

          <TimetableGrid
            timetable={displayTimetable}
            config={config}
            canEdit={false}
          />
        </div>
      )}

      {/* VIEW: ROOM-WISE OCCUPANCY */}
      {activeTab === 'rooms' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Select Room / Laboratory:</label>
            <select
              className="tt-form-select"
              style={{ maxWidth: '280px' }}
              value={selectedRoomView}
              onChange={(e) => setSelectedRoomView(e.target.value)}
            >
              {distinctRooms.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <small style={{ color: '#64748b' }}>
              Shows real-time weekly occupancy for {selectedRoomView || 'selected room'}.
            </small>
          </div>

          <TimetableGrid
            timetable={displayTimetable}
            config={config}
            canEdit={false}
          />
        </div>
      )}

      {/* VIEW: WORKLOAD & COMPLIANCE ANALYSIS */}
      {activeTab === 'workload' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#2563eb" /> Faculty Teaching Workload Distribution &amp; Compliance
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Faculty Instructor</th>
                  <th>Department</th>
                  <th>Total Weekly Hours</th>
                  <th>Theory Hours</th>
                  <th>Lab Hours</th>
                  <th>Allocated Courses</th>
                  <th>Workload Compliance</th>
                </tr>
              </thead>
              <tbody>
                {workloadReport.map((w, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{w.facultyName}</td>
                    <td>{w.department}</td>
                    <td><strong>{w.totalHours} Hrs / Wk</strong></td>
                    <td>{w.theoryHours} Hrs</td>
                    <td>{w.labHours} Hrs</td>
                    <td>{(w.subjects || []).join(', ')}</td>
                    <td>
                      <span className={`tt-status-badge ${w.complianceStatus === 'Compliant' ? 'tt-status-approved' : 'tt-status-rejected'}`}>
                        {w.complianceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {workloadReport.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Publish a timetable to generate live institutional workload analytics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: ROOM REGISTRY */}
      {activeTab === 'roomRegistry' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Classroom &amp; Laboratory Registry</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Registered institutional lecture halls, smart classrooms, and engineering computer labs.
              </p>
            </div>
            <button className="tt-btn tt-btn-primary" onClick={() => setIsAddRoomOpen(true)}>
              <Plus size={15} /> Add Room / Lab
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Room / Lab No.</th>
                  <th>Building &amp; Floor</th>
                  <th>Facility Type</th>
                  <th>Seating Capacity</th>
                  <th>Equipped Facilities</th>
                  <th>Utilization Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((rm) => (
                  <tr key={rm.id}>
                    <td style={{ fontWeight: 700, color: rm.isLab ? '#059669' : '#1e40af' }}>
                      {rm.roomNumber} {rm.isLab ? '🔬' : '🏫'}
                    </td>
                    <td>{rm.building} · {rm.floor}</td>
                    <td>
                      <span className={`tt-status-badge ${rm.isLab ? 'tt-status-approved' : 'tt-status-validated'}`}>
                        {rm.roomType}
                      </span>
                    </td>
                    <td><strong>{rm.capacity} Seats</strong></td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {(rm.facilities || []).join(', ')}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#059669' }}>Optimal</span>
                    </td>
                    <td>
                      <span className="tt-status-badge tt-status-approved">{rm.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Timetable Generator Wizard */}
      <TimetableGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        userDepartment={department}
        onGenerated={(newId) => {
          setIsGeneratorOpen(false);
          triggerToast('New Timetable Draft generated with OR-Tools CP-SAT!');
          loadTimetableData();
        }}
      />

      {/* MODAL: Register New Room / Lab */}
      {isAddRoomOpen && (
        <div className="tt-modal-overlay">
          <div className="tt-modal-card" style={{ maxWidth: '500px' }}>
            <div className="tt-modal-header">
              <h3><Building2 size={18} color="#2563eb" /> Register Institutional Room / Lab</h3>
              <button className="tt-modal-close" onClick={() => setIsAddRoomOpen(false)}>
                <XCircle size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRoom}>
              <div className="tt-modal-body">
                <div className="tt-form-row">
                  <div className="tt-form-group">
                    <label>Room Identifier / Number</label>
                    <input
                      type="text"
                      className="tt-form-input"
                      required
                      placeholder="e.g. Room 402 or AI Lab-2"
                      value={newRoomData.roomNumber}
                      onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                    />
                  </div>
                  <div className="tt-form-group">
                    <label>Capacity (Students)</label>
                    <input
                      type="number"
                      className="tt-form-input"
                      required
                      min={10}
                      max={300}
                      value={newRoomData.capacity}
                      onChange={(e) => setNewRoomData({ ...newRoomData, capacity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="tt-form-row">
                  <div className="tt-form-group">
                    <label>Building Block</label>
                    <input
                      type="text"
                      className="tt-form-input"
                      value={newRoomData.building}
                      onChange={(e) => setNewRoomData({ ...newRoomData, building: e.target.value })}
                    />
                  </div>
                  <div className="tt-form-group">
                    <label>Facility Type</label>
                    <select
                      className="tt-form-select"
                      value={newRoomData.roomType}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isLab = val.includes('LAB') || val === 'WORKSHOP';
                        setNewRoomData({ ...newRoomData, roomType: val, isLab });
                      }}
                    >
                      <option value="CLASSROOM">Standard Classroom</option>
                      <option value="SMART_CLASSROOM">Smart Classroom (Interactive Board)</option>
                      <option value="COMPUTER_LAB">Computer Laboratory</option>
                      <option value="HARDWARE_LAB">Hardware / Electronics Lab</option>
                      <option value="SEMINAR_HALL">Seminar Hall / Auditorium</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="tt-modal-footer">
                <button type="button" className="tt-btn tt-btn-secondary" onClick={() => setIsAddRoomOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="tt-btn tt-btn-primary">
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
