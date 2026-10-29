import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
  Edit3,
  Lock,
  Unlock,
  Users,
  Save,
  Eye,
  EyeOff,
  X,
  Phone,
  PhoneCall,
  Copy,
  Bell,
  ArrowLeft,
  MessageSquare,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  getAllHostels,
  getStudentsRoster,
  submitHostelAttendance,
  getSubmittedAttendances,
  getStudentDeptAndBranch
} from '../../services/hostelAttendanceStore.js';
import { findStudentByQuery, setActiveStudent } from '../../services/studentStore.js';
import {
  exportHostelAttendanceToExcel,
  downloadHostelAttendancePdf
} from '../../utils/hostelAttendanceExportUtils.js';
import StudentDossierDashboard from './StudentDossierDashboard.jsx';
import StudentPortal from '../../StudentPortal.jsx';
import './HostelModules.css';

const PARENT_ALERTS_STORAGE_KEY = 'bput_parent_absence_alerts_log_v1';

export default function TakeHostelAttendance({ account, onNavigateTab }) {
  const [hostels] = useState(() => getAllHostels());
  const [selectedHostel, setSelectedHostel] = useState('Bhabani Hostel-1');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Night Roll Call (08:30 PM)');
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [lastSubmittedId, setLastSubmittedId] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudentDossier, setSelectedStudentDossier] = useState(null);

  // Enhancement 1 & 2 states: contact copy feedback & student dashboard view
  const [copiedKey, setCopiedKey] = useState(null);
  const [viewingStudentDashboard, setViewingStudentDashboard] = useState(null);

  // Enhancement 3 & 4 states: parent alerts modal & dispatch summary
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  const [alertSummary, setAlertSummary] = useState(null);

  // Flow states for post-submission view:
  // - isSubmitted: true once attendance is dispatched (or previously saved)
  // - isEditing: true when user clicks "Update Attendance" to edit the full roster
  // - showTable: controls visibility of the roster table (default false after submit, true when taking attendance or editing)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTable, setShowTable] = useState(true);

  // Student records for the selected hostel
  const [students, setStudents] = useState(() => {
    const list = getStudentsRoster('Bhabani Hostel-1');
    return list.map(s => ({
      ...s,
      status: s.status || 'Present',
      customRemarks: s.remarks || ''
    }));
  });

  // Check if attendance was already submitted whenever hostel, date, or session changes
  useEffect(() => {
    const all = getSubmittedAttendances();
    const existing = all.find(
      s => (s.hostelName?.toLowerCase() === selectedHostel.toLowerCase() || s.hostelCode === selectedHostel) &&
           s.date === attendanceDate &&
           s.session === session
    );

    if (existing) {
      setIsSubmitted(true);
      setIsEditing(false);
      setShowTable(false); // Only show summary after submit, matching user requirement
      setLastSubmittedId(existing.id);
      setSubmittedData(existing);
      setRemarks(existing.remarks || '');

      if (existing.records && existing.records.length > 0) {
        setStudents(existing.records.map(r => ({
          id: r.studentId || `std-${r.rollNumber}`,
          studentName: r.studentName,
          rollNumber: r.rollNumber,
          regNo: r.regNo || '',
          roomNumber: r.roomNumber,
          bedNumber: r.bedNumber,
          department: r.department || '',
          semester: r.semester || '5th Sem',
          phone: r.phone || '',
          parentPhone: r.parentPhone || '',
          status: r.status || 'Present',
          customRemarks: r.remarks || ''
        })));
      }
    } else {
      setIsSubmitted(false);
      setIsEditing(false);
      setShowTable(true); // Show table for fresh roll-call
      setLastSubmittedId(null);
      setSubmittedData(null);
      setRemarks('');
      const list = getStudentsRoster(selectedHostel);
      setStudents(list.map(s => ({
        ...s,
        status: 'Present',
        customRemarks: ''
      })));
    }

    // Load any existing parent alert dispatch log for this session
    try {
      const raw = localStorage.getItem(PARENT_ALERTS_STORAGE_KEY);
      if (raw) {
        const logs = JSON.parse(raw);
        const alertLog = logs.find(
          l => (l.hostel?.toLowerCase() === selectedHostel.toLowerCase()) &&
               l.date === attendanceDate &&
               l.session === session
        );
        if (alertLog) {
          setAlertSummary({
            dispatchedCount: alertLog.dispatchedCount,
            missingCount: alertLog.missingCount,
            totalAbsent: alertLog.totalAbsent,
            timestamp: alertLog.timestamp
          });
        } else {
          setAlertSummary(null);
        }
      } else {
        setAlertSummary(null);
      }
    } catch {
      setAlertSummary(null);
    }
  }, [selectedHostel, attendanceDate, session]);

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 3800);
  };

  const handleCopyNumber = (phoneStr, key) => {
    if (!phoneStr) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phoneStr);
      } else {
        const input = document.createElement('input');
        input.value = phoneStr;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedKey(key);
      showToast(`Copied ${phoneStr} to clipboard.`);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      showToast(`Contact number: ${phoneStr}`);
    }
  };

  const handleViewStudentDashboard = (std) => {
    const matched = findStudentByQuery(std.regNo || std.rollNumber || std.studentName) || {};
    const studentAccount = {
      id: matched.id || `std-${std.rollNumber}`,
      studentId: matched.id || `std-${std.rollNumber}`,
      role: 'student',
      name: matched.name || std.studentName,
      registrationNumber: matched.registrationNumber || std.regNo,
      rollNumber: matched.rollNumber || std.rollNumber,
      branch: matched.branch || std.department,
      department: matched.department || std.department,
      semester: matched.semester || std.semester || '5th Sem',
      phone: std.phone || matched.phone || '+91 98610 11223',
      parentPhone: std.parentPhone || matched.parentPhone || matched.guardianPhone || '+91 94370 99887',
      guardianName: matched.guardianName || 'Guardian',
      email: matched.email || `${(std.studentName || 'student').toLowerCase().replace(/\s+/g, '.')}@student.apnacampus.edu.in`,
      roomNumber: std.roomNumber,
      bedNumber: std.bedNumber,
      allottedHostel: selectedHostel,
      batch: matched.batch || '2023–2027',
      section: matched.section || 'A',
      cgpa: matched.cgpa || '8.85',
      ...matched
    };

    setActiveStudent(studentAccount.registrationNumber || studentAccount.id);
    setViewingStudentDashboard(studentAccount);
  };

  const handleOpenAlertModal = () => {
    if (!isSubmitted) {
      showToast('Please submit attendance before sending parent alerts.', true);
      return;
    }
    const currentAbsentees = students.filter(s => s.status === 'Absent');
    if (currentAbsentees.length === 0) {
      showToast('All residents are present! No absentee parent alerts required.');
      return;
    }
    setIsAlertModalOpen(true);
  };

  const handleConfirmSendAlerts = async () => {
    setIsSendingAlerts(true);
    // Realistic gateway handoff latency
    await new Promise(r => setTimeout(r, 600));

    const absentees = students.filter(s => s.status === 'Absent');
    const validRecipients = absentees.filter(s => Boolean(s.parentPhone && s.parentPhone.trim() && s.parentPhone !== '—'));
    const missingRecipients = absentees.filter(s => !s.parentPhone || !s.parentPhone.trim() || s.parentPhone === '—');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-GB');
    const logEntry = {
      id: `ALERT-${Date.now()}`,
      hostel: selectedHostel,
      date: attendanceDate,
      session,
      totalAbsent: absentees.length,
      dispatchedCount: validRecipients.length,
      missingCount: missingRecipients.length,
      timestamp,
      recipients: validRecipients.map(r => ({ name: r.studentName, roll: r.rollNumber, parentPhone: r.parentPhone })),
      dispatchedBy: account?.name || 'Resident Warden'
    };

    try {
      const raw = localStorage.getItem(PARENT_ALERTS_STORAGE_KEY);
      const logs = raw ? JSON.parse(raw) : [];
      const updated = [logEntry, ...logs.filter(l => !(l.hostel === selectedHostel && l.date === attendanceDate && l.session === session))];
      localStorage.setItem(PARENT_ALERTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save alert log to localStorage', e);
    }

    setIsSendingAlerts(false);
    setIsAlertModalOpen(false);
    setAlertSummary({
      dispatchedCount: validRecipients.length,
      missingCount: missingRecipients.length,
      totalAbsent: absentees.length,
      timestamp
    });

    showToast(`✓ Parent alerts queued for ${validRecipients.length} absent student(s). Logged in warden registry.`);
  };

  const handleStatusChange = (studentId, newStatus) => {
    if (isSubmitted && !isEditing) return; // Locked in disabled state
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarkChange = (studentId, text) => {
    if (isSubmitted && !isEditing) return; // Locked in disabled state
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, customRemarks: text } : s))
    );
  };

  const markAllStatus = (newStatus) => {
    if (isSubmitted && !isEditing) return;
    setStudents(prev => prev.map(s => ({ ...s, status: newStatus })));
    showToast(`Marked all ${students.length} students as ${newStatus}.`);
  };

  const handleSubmitAttendance = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (students.length === 0) {
      showToast('No students in this hostel roster to submit.', true);
      return;
    }

    setIsSubmitting(true);
    const targetHostelObj = hostels.find(h => h.name === selectedHostel) || {};
    const submitterName = account?.name
      ? `${account.name} (${account.role === 'hostel_admin' ? 'Hostel Admin' : 'Resident Warden'})`
      : 'Mr. Rajesh Jena (Resident Warden)';

    const submissionRecords = students.map(s => ({
      studentId: s.id,
      studentName: s.studentName,
      rollNumber: s.rollNumber,
      regNo: s.regNo,
      roomNumber: s.roomNumber,
      bedNumber: s.bedNumber,
      department: s.department,
      phone: s.phone,
      parentPhone: s.parentPhone,
      status: s.status,
      remarks: s.customRemarks || (s.status === 'Present' ? 'Verified by Warden' : 'Unreported absence')
    }));

    const result = submitHostelAttendance({
      id: lastSubmittedId || submittedData?.id,
      hostelName: selectedHostel,
      hostelCode: targetHostelObj.code || 'BN1',
      date: attendanceDate,
      session,
      submittedBy: submitterName,
      records: submissionRecords,
      remarks: remarks || `Daily roll call taken by ${submitterName}.`
    });

    setLastSubmittedId(result.id);
    setSubmittedData(result);
    setIsSubmitted(true);
    setIsEditing(false);
    setShowTable(false); // Only show summary after submit, table is disabled/hidden
    setIsSubmitting(false);

    showToast(
      isEditing
        ? `✓ Attendance updated for ${selectedHostel} and synced to Hostel Admin!`
        : `✓ Attendance for ${selectedHostel} submitted successfully! Automatically fetched to Hostel Admin view.`
    );
  };

  const handleStartUpdate = () => {
    setIsEditing(true);
    setShowTable(true); // "after submit shows a option update when click on it it will be show the full ."
  };

  const handleCancelUpdate = () => {
    setIsEditing(false);
    setShowTable(false); // Return to summary view
    if (submittedData && submittedData.records) {
      // Revert to previously saved submission records
      setStudents(submittedData.records.map(r => ({
        id: r.studentId || `std-${r.rollNumber}`,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        regNo: r.regNo || '',
        roomNumber: r.roomNumber,
        bedNumber: r.bedNumber,
        department: r.department || '',
        semester: r.semester || '5th Sem',
        phone: r.phone || '',
        parentPhone: r.parentPhone || '',
        status: r.status || 'Present',
        customRemarks: r.remarks || ''
      })));
      setRemarks(submittedData.remarks || '');
    }
    showToast('Editing cancelled. Attendance record remains locked.');
  };

  // Filtered students by search
  const filteredStudents = students.filter(s =>
    !searchQuery ||
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const leaveCount = students.filter(s => s.status === 'On Leave').length;

  if (viewingStudentDashboard) {
    return (
      <div className="hostel-unified-module">
        <div className="warden-student-dashboard-wrapper">
          <div className="warden-student-nav-banner">
            <div className="warden-student-nav-left">
              <button
                type="button"
                className="warden-back-attendance-btn"
                onClick={() => setViewingStudentDashboard(null)}
                title="Return to Take Hostel Attendance"
              >
                <ArrowLeft size={16} />
                <span>Back to Take Attendance</span>
              </button>
              <div className="warden-viewing-student-info">
                <span className="warden-badge-inspect">
                  <ShieldCheck size={14} /> Warden Inspection View: CMS Student Workspace
                </span>
                <strong className="warden-student-name">{viewingStudentDashboard.name}</strong>
                <span className="warden-student-meta">
                  Roll No: <strong>{viewingStudentDashboard.rollNumber}</strong> &nbsp;|&nbsp;
                  Reg No: <strong>{viewingStudentDashboard.registrationNumber}</strong> &nbsp;|&nbsp;
                  {viewingStudentDashboard.branch} &nbsp;|&nbsp;
                  Room {viewingStudentDashboard.roomNumber} ({viewingStudentDashboard.allottedHostel || selectedHostel})
                </span>
              </div>
            </div>
            <div className="warden-student-nav-right">
              <span className="warden-sync-chip">
                <span className="live-dot-green"></span> Live CMS Profile Connected
              </span>
            </div>
          </div>

          <div className="warden-student-portal-embed">
            <StudentPortal
              account={viewingStudentDashboard}
              onLogout={() => setViewingStudentDashboard(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (selectedStudentDossier) {
    return (
      <div className="hostel-unified-module">
        <StudentDossierDashboard
          applicant={selectedStudentDossier}
          account={account}
          onBack={() => setSelectedStudentDossier(null)}
        />
      </div>
    );
  }

  return (
    <div className="hostel-unified-module">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`hostel-toast-banner ${toastMsg.isError ? 'error' : 'success'}`}>
          <CheckCircle2 size={18} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="hostel-page-header">
        <div className="hostel-breadcrumb">
          <span>Home</span> / <span>Hostel</span> / <span className="current">Take Hostel Attendance</span>
        </div>
        <div className="hostel-header-title-row">
          <div>
            <h2>Take Hostel Attendance</h2>
            <p>Record daily night roll-call &amp; biometric roll. Submissions automatically sync to the Hostel Admin in real time.</p>
          </div>
          <div className="hostel-role-tag">
            <ShieldCheck size={16} /> Role: {account?.role === 'hostel_admin' ? 'Hostel Admin' : 'Resident Warden'}
          </div>
        </div>
      </div>

      {/* Filter / Session Selectors Box */}
      <div className="hostel-card-container">
        <div className="attendance-controls-grid">
          <div className="control-field">
            <label>Select Hostel *</label>
            <div className="input-with-icon">
              <Building size={16} color="#64748b" />
              <select
                value={selectedHostel}
                onChange={e => setSelectedHostel(e.target.value)}
              >
                {hostels.map(h => (
                  <option key={h.id || h.code} value={h.name}>
                    {h.name} ({h.code} · {h.totalBeds} Beds)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="control-field">
            <label>Attendance Date *</label>
            <div className="input-with-icon">
              <Calendar size={16} color="#64748b" />
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
              />
            </div>
          </div>

          <div className="control-field">
            <label>Roll-Call Session *</label>
            <div className="input-with-icon">
              <Clock size={16} color="#64748b" />
              <select value={session} onChange={e => setSession(e.target.value)}>
                <option value="Night Roll Call (08:30 PM)">Night Roll Call (08:30 PM)</option>
                <option value="Morning Roll Call (07:00 AM)">Morning Roll Call (07:00 AM)</option>
                <option value="Special Warden Inspection">Special Warden Inspection</option>
                <option value="Curfew Emergency Census">Curfew Emergency Census</option>
              </select>
            </div>
          </div>

          <div className="control-field">
            <label>Search Resident</label>
            <div className="input-with-icon">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Name, roll or room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SUBMITTED ATTENDANCE SUMMARY CARD
            Matches user requirement:
            "after take attendance when click you submit only shows hostel name
             absent, present, leave, lin number... after submit shows a option update"
            ───────────────────────────────────────────────────────────── */}
        {isSubmitted && (
          <div className="hostel-attendance-submitted-card" id="submitted-attendance-summary">
            <div className="has-card-header">
              <div className="has-header-left">
                <div className="has-icon-badge">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="has-header-title">
                    <span>Attendance Submitted &amp; Verified</span>
                    <span className="has-sync-badge">
                      <span className="live-dot-green"></span> Synced to Hostel Admin
                    </span>
                  </div>
                  <p className="has-header-sub">
                    Roll-call recorded for <strong>{selectedHostel}</strong>. Record is saved and synchronized with Hostel Admin view.
                  </p>
                </div>
              </div>

              {/* Action buttons: Update Attendance & Toggle View */}
              <div className="has-header-actions">
                {!isEditing ? (
                  <button
                    type="button"
                    className="has-update-btn"
                    onClick={handleStartUpdate}
                    id="btn-update-hostel-attendance"
                  >
                    <Edit3 size={16} />
                    <span>Update</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="has-cancel-edit-btn"
                    onClick={handleCancelUpdate}
                  >
                    <X size={15} />
                    <span>Cancel Edit</span>
                  </button>
                )}

                <button
                  type="button"
                  className="has-toggle-view-btn"
                  onClick={() => setShowTable(prev => !prev)}
                >
                  {showTable ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showTable ? 'Hide Table' : 'Show Disabled Table'}</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid showing: Hostel Name, Line Numbers (Total Count), Present, Absent, Leave */}
            <div className="has-metrics-grid">
              <div className="has-metric-card hostel-name">
                <div className="has-metric-icon"><Building size={20} /></div>
                <div className="has-metric-info">
                  <span className="has-metric-label">HOSTEL NAME</span>
                  <strong className="has-metric-val">{selectedHostel}</strong>
                </div>
              </div>

              <div className="has-metric-card line-numbers">
                <div className="has-metric-icon"><Users size={20} /></div>
                <div className="has-metric-info">
                  <span className="has-metric-label">LINE NUMBER / ENROLLED</span>
                  <strong className="has-metric-val">{students.length} Residents (Lines 1–{students.length})</strong>
                </div>
              </div>

              <div className="has-metric-card present">
                <div className="has-metric-icon"><UserCheck size={20} /></div>
                <div className="has-metric-info">
                  <span className="has-metric-label">PRESENT</span>
                  <strong className="has-metric-val">{presentCount}</strong>
                </div>
              </div>

              <div className="has-metric-card absent">
                <div className="has-metric-icon"><UserX size={20} /></div>
                <div className="has-metric-info">
                  <span className="has-metric-label">ABSENT</span>
                  <strong className="has-metric-val">{absentCount}</strong>
                </div>
              </div>

              <div className="has-metric-card leave">
                <div className="has-metric-icon"><Clock size={20} /></div>
                <div className="has-metric-info">
                  <span className="has-metric-label">ON LEAVE</span>
                  <strong className="has-metric-val">{leaveCount}</strong>
                </div>
              </div>
            </div>

            {/* Footer metadata */}
            <div className="has-card-footer">
              <div className="has-footer-meta">
                <span><strong>Date:</strong> {attendanceDate}</span>
                <span>•</span>
                <span><strong>Session:</strong> {session}</span>
                {lastSubmittedId && (
                  <>
                    <span>•</span>
                    <span><strong>Record ID:</strong> <code>{lastSubmittedId}</code></span>
                  </>
                )}
                <span>•</span>
                <span className="has-locked-badge">
                  {isEditing ? <Unlock size={12} color="#2563eb" /> : <Lock size={12} color="#64748b" />}
                  {isEditing ? 'Editing Mode Unlocked' : 'Roster Table Locked'}
                </span>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  className="has-link-btn"
                  onClick={() => onNavigateTab('view-attendance')}
                >
                  View in Hostel Admin Console →
                </button>
              )}
            </div>

            {/* Enhancement 3 & 4: Parent Alert Action, Export Buttons & Dispatch Summary in Submitted Card */}
            <div className="has-card-actions-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="has-parent-alert-btn"
                disabled={absentCount === 0}
                onClick={handleOpenAlertModal}
                id="btn-alert-parents-absent-card"
                title={
                  absentCount === 0
                    ? 'All residents are present! No parent alerts required.'
                    : `Send automated absence alert to parents of ${absentCount} absent resident boarder(s)`
                }
              >
                <Bell size={16} />
                <span>Alert Parents of Absent Students ({absentCount})</span>
              </button>

              <button
                type="button"
                className="export-btn excel"
                style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', height: '36px' }}
                onClick={() => {
                  try {
                    const subObj = submittedData || {
                      hostelName: selectedHostel,
                      hostelCode: targetHostelObj?.code || 'BN1',
                      date: attendanceDate,
                      session,
                      submittedBy: account?.name || 'Resident Warden',
                      records: students
                    };
                    const fileName = exportHostelAttendanceToExcel({
                      submission: subObj,
                      records: students
                    });
                    showToast(`✓ Excel register downloaded: ${fileName}`);
                  } catch (err) {
                    console.error('Excel Export Error:', err);
                    showToast('Failed to export Excel file.');
                  }
                }}
                title="Download complete attendance register in Excel (.xlsx) format"
              >
                <FileSpreadsheet size={15} /> EXCEL (.xlsx)
              </button>

              <button
                type="button"
                className="export-btn pdf"
                style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', height: '36px' }}
                onClick={() => {
                  try {
                    const subObj = submittedData || {
                      hostelName: selectedHostel,
                      hostelCode: targetHostelObj?.code || 'BN1',
                      date: attendanceDate,
                      session,
                      submittedBy: account?.name || 'Resident Warden',
                      records: students
                    };
                    const fileName = downloadHostelAttendancePdf({
                      submission: subObj,
                      records: students
                    });
                    showToast(`✓ Official PDF attendance report generated: ${fileName}`);
                  } catch (err) {
                    console.error('PDF Export Error:', err);
                    showToast('Failed to generate PDF document.');
                  }
                }}
                title="Download official PDF attendance report with table and signatures"
              >
                <FileText size={15} /> PDF REPORT
              </button>

              {absentCount === 0 ? (
                <span className="all-present-badge">
                  <CheckCircle2 size={15} /> All residents present. No parent alerts needed.
                </span>
              ) : alertSummary ? (
                <span className="alerts-dispatched-tag">
                  <Check size={14} /> Alerts Queued ({alertSummary.dispatchedCount} Sent · {alertSummary.timestamp})
                </span>
              ) : null}
            </div>

            {alertSummary && (
              <div className="has-alert-dispatch-summary">
                <div className="alert-dispatch-info">
                  <Bell size={18} color="#d97706" />
                  <div>
                    <strong>Parent Absence Alert Summary ({alertSummary.timestamp})</strong>
                    <div className="alert-dispatch-meta">
                      Total Absentees: <strong>{alertSummary.totalAbsent}</strong> &nbsp;|&nbsp;
                      Parent Alerts Queued: <strong>{alertSummary.dispatchedCount}</strong> &nbsp;|&nbsp;
                      Missing Contacts: <strong>{alertSummary.missingCount}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="has-link-btn"
                  style={{ fontSize: '0.8rem', color: '#b45309' }}
                  onClick={handleOpenAlertModal}
                >
                  View / Re-send Alerts →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            RESIDENT ROSTER TABLE SECTION (shown in 2nd image)
            - When !isSubmitted: table is shown and fully interactive
            - When isSubmitted && !isEditing:
                If showTable is false: HIDDEN (matches "only shows hostel name absent, present, leave, lin number")
                If showTable is true: DISABLED (matches "that part was disable")
            - When isSubmitted && isEditing:
                SHOWS THE FULL TABLE with interactive controls (matches "when click on it it will be show the full")
            ───────────────────────────────────────────────────────────── */}
        {showTable && (
          <>
            {/* Banner for Update Mode */}
            {isEditing && (
              <div className="has-editing-banner">
                <div className="editing-banner-content">
                  <Sparkles size={18} color="#2563eb" />
                  <div>
                    <strong>Update Attendance Mode Active</strong>
                    <p>Modify student attendance statuses or remarks below. Click <strong>"Save &amp; Update Attendance"</strong> below to sync changes.</p>
                  </div>
                </div>
                <button type="button" className="has-cancel-edit-btn" onClick={handleCancelUpdate}>
                  <X size={15} /> Cancel Edit
                </button>
              </div>
            )}

            {/* Banner when Table is Shown in Disabled Mode */}
            {isSubmitted && !isEditing && (
              <div className="has-locked-table-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} color="#64748b" />
                  <span>
                    This attendance roster was submitted and is currently <strong>locked (disabled)</strong>. Click <strong>"Update"</strong> to modify.
                  </span>
                </div>
                <button
                  type="button"
                  className="has-update-btn"
                  style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                  onClick={handleStartUpdate}
                >
                  <Edit3 size={14} /> Update Attendance
                </button>
              </div>
            )}

            {/* Quick Tally & Bulk Controls */}
            <div className="attendance-summary-toolbar">
              <div className="summary-pill total">
                <span>Total Enrolled:</span> <strong>{students.length}</strong>
              </div>
              <div className="summary-pill present">
                <span>Present:</span> <strong>{presentCount}</strong>
              </div>
              <div className="summary-pill absent">
                <span>Absent:</span> <strong>{absentCount}</strong>
              </div>
              <div className="summary-pill leave">
                <span>On Leave:</span> <strong>{leaveCount}</strong>
              </div>

              <div className="bulk-actions-group">
                <button
                  type="button"
                  className="bulk-btn mark-present"
                  disabled={isSubmitted && !isEditing}
                  onClick={() => markAllStatus('Present')}
                >
                  <UserCheck size={14} /> Mark All Present
                </button>
                <button
                  type="button"
                  className="bulk-btn mark-absent"
                  disabled={isSubmitted && !isEditing}
                  onClick={() => markAllStatus('Absent')}
                >
                  <UserX size={14} /> Mark All Absent
                </button>
                <button
                  type="button"
                  className="bulk-btn reset"
                  disabled={isSubmitted && !isEditing}
                  onClick={() => {
                    const list = getStudentsRoster(selectedHostel);
                    setStudents(list.map(s => ({ ...s, status: 'Present', customRemarks: '' })));
                    showToast('Reset attendance roster to default.');
                  }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>

            {/* Student Attendance Roster Table */}
            <div className="hostel-table-wrapper">
              <table className={`hostel-custom-table ${isSubmitted && !isEditing ? 'table-disabled' : ''}`}>
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}>Sl No</th>
                    <th>Name of Student</th>
                    <th>Registration No</th>
                    <th>Department</th>
                    <th>Branch</th>
                    <th style={{ textAlign: 'center' }}>Roll No</th>
                    <th>Room No</th>
                    <th>Student Contact</th>
                    <th>Parent Contact</th>
                    <th style={{ minWidth: '210px', textAlign: 'center' }}>Attendance Status</th>
                    <th style={{ minWidth: '125px', textAlign: 'center' }}>View Student</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="no-records-cell">
                        No resident boarders found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std, idx) => {
                      const isAbsent = std.status === 'Absent';
                      const isDisabled = isSubmitted && !isEditing;
                      const deptAndBranch = getStudentDeptAndBranch(std);

                      return (
                        <tr key={std.id} className={isAbsent ? 'row-absent-highlight' : ''}>
                          {/* 1. Sl No */}
                          <td>{idx + 1}</td>

                          {/* 2. Name of Student */}
                          <td>
                            <div
                              className="student-name-bold"
                              style={{ cursor: 'pointer', color: '#1d4ed8' }}
                              onClick={() => handleViewStudentDashboard(std)}
                              title="Click to view full student details"
                            >
                              {std.studentName}
                            </div>
                          </td>

                          {/* 3. Registration No */}
                          <td>
                            <span className="reg-no-code">{std.regNo || `23052010${String(std.rollNumber || '01').padStart(2, '0')}`}</span>
                          </td>

                          {/* 4. Department */}
                          <td>
                            <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                              {deptAndBranch.department}
                            </div>
                          </td>

                          {/* 5. Branch */}
                          <td>
                            <span className="branch-pill-badge">
                              {deptAndBranch.branch}
                            </span>
                          </td>

                          {/* 6. Roll No */}
                          <td style={{ textAlign: 'center' }}>
                            <strong style={{ color: '#0f172a' }}>{std.rollNumber}</strong>
                          </td>

                          {/* 7. Room No */}
                          <td>
                            <span className="room-badge">
                              Room {std.roomNumber}
                              {std.bedNumber ? ` · ${std.bedNumber}` : ''}
                            </span>
                          </td>

                          {/* 8. Student Contact */}
                          <td>
                            {std.phone ? (
                              <div className="contact-cell-box">
                                <a
                                  href={`tel:${std.phone}`}
                                  className="contact-phone-link"
                                  title={`Call Student: ${std.phone}`}
                                >
                                  <Phone size={13} className="contact-icon student" />
                                  <span className="contact-number">{std.phone}</span>
                                </a>
                                <button
                                  type="button"
                                  className="contact-copy-btn"
                                  onClick={() => handleCopyNumber(std.phone, `std-${std.id}`)}
                                  title="Copy Student Mobile Number"
                                >
                                  {copiedKey === `std-${std.id}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                  {copiedKey === `std-${std.id}` && <span className="copied-tag">Copied!</span>}
                                </button>
                              </div>
                            ) : (
                              <span className="contact-unavailable">— Not Provided</span>
                            )}
                          </td>

                          {/* 9. Parent Contact */}
                          <td>
                            {std.parentPhone ? (
                              <div className="contact-cell-box">
                                <a
                                  href={`tel:${std.parentPhone}`}
                                  className="contact-phone-link parent"
                                  title={`Call Parent/Guardian: ${std.parentPhone}`}
                                >
                                  <PhoneCall size={13} className="contact-icon parent" />
                                  <span className="contact-number">{std.parentPhone}</span>
                                </a>
                                <button
                                  type="button"
                                  className="contact-copy-btn"
                                  onClick={() => handleCopyNumber(std.parentPhone, `parent-${std.id}`)}
                                  title="Copy Parent Mobile Number"
                                >
                                  {copiedKey === `parent-${std.id}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                  {copiedKey === `parent-${std.id}` && <span className="copied-tag">Copied!</span>}
                                </button>
                              </div>
                            ) : (
                              <span className="contact-unavailable">— Not Provided</span>
                            )}
                          </td>

                          {/* 10. Attendance Status */}
                          <td style={{ textAlign: 'center' }}>
                            <div className="status-toggle-buttons">
                              <button
                                type="button"
                                disabled={isDisabled}
                                className={`status-btn present ${std.status === 'Present' ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => handleStatusChange(std.id, 'Present')}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                disabled={isDisabled}
                                className={`status-btn absent ${std.status === 'Absent' ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => handleStatusChange(std.id, 'Absent')}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                disabled={isDisabled}
                                className={`status-btn leave ${std.status === 'On Leave' ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => handleStatusChange(std.id, 'On Leave')}
                              >
                                Leave
                              </button>
                            </div>
                          </td>

                          {/* 11. View Student */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="view-student-btn"
                              onClick={() => handleViewStudentDashboard(std)}
                              title={`Open ${std.studentName}'s complete CMS Student Dashboard`}
                            >
                              <Eye size={14} />
                              <span>View Student</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Warden Review & Submit Footer */}
            <div className="attendance-submit-footer">
              <div className="remarks-box">
                <label>General Warden Notes &amp; Curfew Observation</label>
                <input
                  type="text"
                  disabled={isSubmitted && !isEditing}
                  readOnly={isSubmitted && !isEditing}
                  placeholder="e.g. All residential wings inspected at 08:45 PM. Absentees informed to warden office."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>

              <div className="submit-action-row">
                <div className="submit-meta">
                  <span>Hostel: <strong>{selectedHostel}</strong></span>
                  <span>Date: <strong>{attendanceDate}</strong></span>
                  <span>Present: <strong style={{ color: '#15803d' }}>{presentCount}</strong> / {students.length}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {isEditing && (
                    <button
                      type="button"
                      className="bulk-btn reset"
                      style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                      onClick={handleCancelUpdate}
                    >
                      <X size={15} /> Cancel
                    </button>
                  )}

                  {isSubmitted && !isEditing ? (
                    <>
                      <button
                        type="button"
                        className="has-parent-alert-btn"
                        disabled={absentCount === 0}
                        onClick={handleOpenAlertModal}
                        id="btn-alert-parents-absent-footer"
                        style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                        title={
                          absentCount === 0
                            ? 'All residents are present! No parent alerts required.'
                            : `Send automated absence alert to parents of ${absentCount} absent boarder(s)`
                        }
                      >
                        <Bell size={16} />
                        <span>Alert Parents of Absent Students ({absentCount})</span>
                      </button>

                      <button
                        type="button"
                        className="has-update-btn"
                        style={{ padding: '10px 22px', fontSize: '0.92rem' }}
                        onClick={handleStartUpdate}
                      >
                        <Edit3 size={16} />
                        Update Attendance
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={`submit-attendance-btn ${isEditing ? 'update-mode' : ''}`}
                      disabled={isSubmitting}
                      onClick={handleSubmitAttendance}
                    >
                      {isEditing ? <Save size={16} /> : <Send size={16} />}
                      {isSubmitting
                        ? 'Dispatching...'
                        : isEditing
                          ? 'Save & Update Attendance'
                          : 'Submit Attendance & Fetch to Hostel Admin'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ENHANCEMENT 3: CONFIRM PARENT ALERTS MODAL
          ───────────────────────────────────────────────────────────── */}
      {isAlertModalOpen && (
        <div className="parent-alert-modal-overlay" onClick={() => !isSendingAlerts && setIsAlertModalOpen(false)}>
          <div className="parent-alert-modal" onClick={e => e.stopPropagation()}>
            <div className="parent-alert-modal-header">
              <div className="modal-header-title-box">
                <h3>
                  <Bell size={20} color="#d97706" />
                  <span>Confirm Parent Alerts</span>
                </h3>
                <p>
                  Automated roll-call absence alerts for <strong>{selectedHostel}</strong> ({attendanceDate} · {session})
                </p>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => !isSendingAlerts && setIsAlertModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="parent-alert-modal-body">
              {/* Recipient Statistics */}
              {(() => {
                const absenteesList = students.filter(s => s.status === 'Absent');
                const validParentsList = absenteesList.filter(s => Boolean(s.parentPhone && s.parentPhone.trim() && s.parentPhone !== '—'));
                const missingParentsList = absenteesList.filter(s => !s.parentPhone || !s.parentPhone.trim() || s.parentPhone === '—');

                return (
                  <>
                    <div className="alert-stats-ribbon">
                      <div className="alert-stat-card absent">
                        <span className="alert-stat-label">TOTAL ABSENT STUDENTS</span>
                        <strong className="alert-stat-val">{absenteesList.length}</strong>
                      </div>
                      <div className="alert-stat-card valid">
                        <span className="alert-stat-label">VALID PARENT CONTACTS</span>
                        <strong className="alert-stat-val">{validParentsList.length}</strong>
                      </div>
                      <div className="alert-stat-card missing">
                        <span className="alert-stat-label">MISSING CONTACT NUMBERS</span>
                        <strong className="alert-stat-val">{missingParentsList.length}</strong>
                      </div>
                    </div>

                    {/* Absentee List Table */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                          Absent Resident Boarders ({absenteesList.length})
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Only students marked Absent for this session are included
                        </span>
                      </div>

                      <div className="alert-table-box">
                        <table className="alert-recipients-table">
                          <thead>
                            <tr>
                              <th style={{ width: '40px' }}>#</th>
                              <th>Student Name</th>
                              <th>Roll Number</th>
                              <th>Room</th>
                              <th>Parent Contact</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {absenteesList.map((a, i) => {
                              const hasParentNumber = Boolean(a.parentPhone && a.parentPhone.trim() && a.parentPhone !== '—');
                              return (
                                <tr key={a.id || i}>
                                  <td>{i + 1}</td>
                                  <td>
                                    <strong>{a.studentName}</strong>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Reg: {a.regNo}</div>
                                  </td>
                                  <td>{a.rollNumber}</td>
                                  <td>Room {a.roomNumber} ({a.bedNumber})</td>
                                  <td>
                                    {hasParentNumber ? (
                                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#15803d' }}>
                                        {a.parentPhone}
                                      </span>
                                    ) : (
                                      <span className="badge-missing-phone">
                                        <AlertCircle size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                        Missing Phone Number
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <span className="badge-absent-pill">Absent</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Message Template Preview Box */}
                    <div className="alert-template-box">
                      <div className="alert-template-header">
                        <MessageSquare size={14} color="#2563eb" />
                        <span>Parent Alert Message Template Preview</span>
                      </div>
                      <pre className="alert-template-text">
{`Dear Parent/Guardian,

This is an attendance alert from APNA CAMPUS. Your ward, {Student Name} (Roll No: {Roll Number}), was marked absent during the hostel ${session} on ${attendanceDate} at ${selectedHostel}.

Please contact the hostel warden if you need further information.

Regards,
Hostel Administration
APNA CAMPUS`}
                      </pre>
                    </div>

                    {/* Messaging Gateway Transparency Notice (Requirement 5.D) */}
                    <div className="alert-disclaimer-card">
                      <Info size={18} className="alert-disclaimer-icon" />
                      <div>
                        <strong>Institutional Gateway Transparency &amp; Carrier Status:</strong>
                        <p style={{ margin: '3px 0 0 0' }}>
                          External cellular carrier delivery requires connecting the institutional backend SMS / WhatsApp gateway endpoint (e.g. Fast2SMS / Twilio). 
                          Clicking <strong>Confirm &amp; Send Alerts</strong> validates parent contact numbers, logs authorized absence dispatches in the institutional audit store, and queues alerts for transmission without exposing private API credentials.
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="parent-alert-modal-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                disabled={isSendingAlerts}
                onClick={() => setIsAlertModalOpen(false)}
              >
                Cancel
              </button>

              {(() => {
                const absenteesList = students.filter(s => s.status === 'Absent');
                const validParentsList = absenteesList.filter(s => Boolean(s.parentPhone && s.parentPhone.trim() && s.parentPhone !== '—'));
                return (
                  <button
                    type="button"
                    className="modal-btn-confirm"
                    disabled={isSendingAlerts || validParentsList.length === 0}
                    onClick={handleConfirmSendAlerts}
                  >
                    {isSendingAlerts ? (
                      <>
                        <Clock size={16} className="animate-spin" />
                        <span>Queuing Parent Alerts...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Confirm &amp; Send Alerts ({validParentsList.length})</span>
                      </>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
