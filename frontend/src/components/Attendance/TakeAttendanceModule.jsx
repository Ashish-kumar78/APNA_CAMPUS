import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ClipboardCheck, Clock, Calendar, CheckSquare, Square,
  CheckCircle2, XCircle, Users, UserCheck, AlertCircle,
  ArrowRight, Check, X, RotateCcw, Edit3, Eye, FileText,
  ChevronDown, Send, Sparkles, BookOpen
} from 'lucide-react';
import './TakeAttendanceModule.css';

// Academic Data Configurations
const ACADEMIC_PROGRAMS = {
  'B.Tech': {
    batches: ['2023–2027', '2024–2028', '2025–2029', '2022–2026'],
    branches: ['CSE', 'CSE (AI)', 'ECE', 'EE', 'Mechanical'],
    sections: ['Section A', 'Section B', 'Section C']
  },
  'M.Tech': {
    batches: ['2024–2026', '2025–2027'],
    branches: ['Computer Science', 'VLSI & Embedded Systems'],
    sections: ['Section A', 'Section B']
  },
  'BCA': {
    batches: ['2023–2026', '2024–2027', '2025–2028'],
    branches: ['Computer Applications', 'Cloud & Mobile Tech'],
    sections: ['Section A', 'Section B']
  },
  'MCA': {
    batches: ['2024–2026', '2025–2027'],
    branches: ['Software Architecture', 'Data Science & Analytics'],
    sections: ['Section A', 'Section B']
  },
  'MBA': {
    batches: ['2024–2026', '2025–2027'],
    branches: ['Finance', 'Marketing', 'Human Resources'],
    sections: ['Section A', 'Section B']
  }
};

// Realistic Fictional Student Roster Data
const STUDENT_NAMES_POOL = [
  'Aarav Sharma', 'Rakesh Das', 'Priya Patra', 'Amit Nayak', 'Sneha Mohanty',
  'Sourav Sahoo', 'Pooja Jena', 'Bikash Verma', 'Swati Mishra', 'Monika Rout',
  'Subham Panda', 'Ipsita Ray', 'Alok Tripathy', 'Smruti Parida', 'Chandan Swain',
  'Tanmay Mangaraj', 'Lipika Muduli', 'Manas Kar', 'Pragyan Acharya', 'Biswajit Behera',
  'Archana Pradhan', 'Gourab Samal', 'Satyajit Barik', 'Sonali Rout', 'Ashish Das',
  'Kiran Nayak', 'Pranab Sahoo', 'Niharika Patra', 'Deepak Mohanty', 'Rohit Panda'
];

function generateStudentsForSection(course, batch, branch, section) {
  if (!course || !batch || !branch || !section) return [];
  
  // Section letter determiner
  const secLetter = section.slice(-1) || 'A';
  const secOffset = secLetter === 'B' ? 30 : secLetter === 'C' ? 60 : 0;
  const count = 30; // 30 students per section
  
  const list = [];
  for (let i = 1; i <= count; i++) {
    const rollNum = 100 + secOffset + i;
    const regNum = `230101${String(rollNum).padStart(3, '0')}`;
    const nameIndex = (i - 1) % STUDENT_NAMES_POOL.length;
    list.push({
      id: `std-${course}-${branch}-${section}-${rollNum}`,
      rollNumber: String(rollNum),
      registrationNumber: regNum,
      name: STUDENT_NAMES_POOL[nameIndex],
      branch: branch
    });
  }
  return list.sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber));
}

export default function TakeAttendanceModule({ account, role = 'faculty', onBackToDashboard }) {
  // Form State
  const [course, setCourse] = useState('B.Tech');
  const [batch, setBatch] = useState('2023–2027');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('Section A');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = useState('10:30 AM');
  const [toTime, setToTime] = useState('11:30 AM');
  const [timePickerTarget, setTimePickerTarget] = useState('from');
  const classTime = useMemo(() => {
    if (fromTime && toTime) return `${fromTime} to ${toTime}`;
    return fromTime || toTime || '';
  }, [fromTime, toTime]);
  const [topicsCovered, setTopicsCovered] = useState('Binary Search Trees, AVL Rotations & Balancing Factors');

  // Search filter inside table
  const [tableSearch, setTableSearch] = useState('');

  // Attendance Map: { [studentId]: boolean } -> Default ABSENT (false)
  const [attendanceMap, setAttendanceMap] = useState({});

  // Workflow State: 'draft' | 'confirm_modal' | 'submitted' | 'update_confirm_modal'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [submittedSession, setSubmittedSession] = useState(null);
  const [showViewAttendanceTable, setShowViewAttendanceTable] = useState(true);

  // Notifications
  const [alertBanner, setAlertBanner] = useState(null);

  // Time Picker Modal State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [clockMode, setClockMode] = useState('hours'); // 'hours' | 'minutes'
  const [draftHour, setDraftHour] = useState(10);
  const [draftMinute, setDraftMinute] = useState(30);
  const [draftAmPm, setDraftAmPm] = useState('AM');

  // Available Dropdown Options Based On Selections
  const availableBatches = useMemo(() => {
    return (course && ACADEMIC_PROGRAMS[course]?.batches) || [];
  }, [course]);

  const availableBranches = useMemo(() => {
    return (course && ACADEMIC_PROGRAMS[course]?.branches) || [];
  }, [course]);

  const availableSections = useMemo(() => {
    return (course && ACADEMIC_PROGRAMS[course]?.sections) || [];
  }, [course]);

  // Dependent dropdown handlers
  const handleCourseChange = (e) => {
    const val = e.target.value;
    setCourse(val);
    const batches = ACADEMIC_PROGRAMS[val]?.batches || [];
    const branches = ACADEMIC_PROGRAMS[val]?.branches || [];
    const sections = ACADEMIC_PROGRAMS[val]?.sections || [];
    setBatch(batches[0] || '');
    setBranch(branches[0] || '');
    setSection(sections[0] || '');
    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleBatchChange = (e) => {
    const val = e.target.value;
    setBatch(val);
    const branches = ACADEMIC_PROGRAMS[course]?.branches || [];
    const sections = ACADEMIC_PROGRAMS[course]?.sections || [];
    setBranch(branches[0] || '');
    setSection(sections[0] || '');
    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setBranch(val);
    const sections = ACADEMIC_PROGRAMS[course]?.sections || [];
    setSection(sections[0] || '');
    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  const handleSectionChange = (e) => {
    const val = e.target.value;
    setSection(val);
    setAttendanceMap({});
    setIsSubmitted(false);
    setIsEditing(false);
  };

  // Student list generated for the selected class cohort
  const studentsList = useMemo(() => {
    if (!course || !batch || !branch || !section) return [];
    return generateStudentsForSection(course, batch, branch, section);
  }, [course, batch, branch, section]);

  // Filtered students for quick table searching
  const filteredStudents = useMemo(() => {
    if (!tableSearch.trim()) return studentsList;
    const q = tableSearch.toLowerCase();
    return studentsList.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q)
    );
  }, [studentsList, tableSearch]);

  // Attendance Calculations
  const totalStudents = studentsList.length;
  const presentCount = useMemo(() => {
    return studentsList.reduce((acc, s) => (attendanceMap[s.id] ? acc + 1 : acc), 0);
  }, [studentsList, attendanceMap]);
  const absentCount = totalStudents - presentCount;

  // Toggle single student present/absent
  const handleToggleStudent = (studentId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated = {};
    studentsList.forEach(s => {
      updated[s.id] = true;
    });
    setAttendanceMap(updated);
  };

  // Clear all (Mark all absent)
  const handleClearAll = () => {
    const updated = {};
    studentsList.forEach(s => {
      updated[s.id] = false;
    });
    setAttendanceMap(updated);
  };

  // Time Picker open helper for From / To time
  const openTimePicker = (target = 'from') => {
    setTimePickerTarget(target);
    const targetVal = target === 'from' ? fromTime : toTime;
    try {
      const parts = (targetVal || (target === 'from' ? '10:30 AM' : '11:30 AM')).split(/[: ]/);
      if (parts.length >= 3) {
        setDraftHour(parseInt(parts[0], 10) || (target === 'from' ? 10 : 11));
        setDraftMinute(parseInt(parts[1], 10) || 30);
        setDraftAmPm(parts[2].toUpperCase() === 'PM' ? 'PM' : 'AM');
      }
    } catch {
      setDraftHour(target === 'from' ? 10 : 11);
      setDraftMinute(30);
      setDraftAmPm('AM');
    }
    setClockMode('hours');
    setIsTimePickerOpen(true);
  };

  const confirmTimePicker = () => {
    const h = draftHour < 10 ? `0${draftHour}` : `${draftHour}`;
    const m = draftMinute < 10 ? `0${draftMinute}` : `${draftMinute}`;
    const formatted = `${h}:${m} ${draftAmPm}`;
    if (timePickerTarget === 'from') {
      setFromTime(formatted);
      if (!toTime) {
        const nextHour = (draftHour % 12) + 1;
        const nextAmPm = draftHour === 11 ? (draftAmPm === 'AM' ? 'PM' : 'AM') : draftAmPm;
        const nh = nextHour < 10 ? `0${nextHour}` : `${nextHour}`;
        setToTime(`${nh}:${m} ${nextAmPm}`);
      }
    } else {
      setToTime(formatted);
    }
    setIsTimePickerOpen(false);
  };

  // Submit Validation and Trigger
  const handleInitiateSubmit = () => {
    if (!course || !batch || !branch || !section) {
      setAlertBanner({ type: 'error', message: 'Please select Course, Batch, Branch, and Section before submitting.' });
      return;
    }
    if (!date) {
      setAlertBanner({ type: 'error', message: 'Please select a valid attendance date.' });
      return;
    }
    if (!fromTime || !toTime) {
      setAlertBanner({ type: 'error', message: 'Please specify both class start time (From) and end time (To).' });
      return;
    }
    if (!topicsCovered.trim()) {
      setAlertBanner({ type: 'error', message: 'Please enter the topics covered during this class session.' });
      return;
    }
    if (studentsList.length === 0) {
      setAlertBanner({ type: 'error', message: 'Cannot record attendance: Selected section contains 0 enrolled students.' });
      return;
    }

    setAlertBanner(null);
    setShowConfirmModal(true);
  };

  // Final Submission Confirmed
  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    const sessionRecord = {
      course,
      batch,
      branch,
      section,
      date,
      fromTime,
      toTime,
      classTime,
      topicsCovered,
      totalStudents,
      presentCount,
      absentCount,
      attendanceMap: { ...attendanceMap },
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      facultyName: account?.name || 'Dr. S. Mohanty'
    };
    setSubmittedSession(sessionRecord);
    setIsSubmitted(true);
    setIsEditing(false);
    setShowViewAttendanceTable(true);
    setAlertBanner({
      type: 'success',
      message: `Attendance successfully submitted for ${course} ${branch} (${section}) · ${presentCount} Present, ${absentCount} Absent.`
    });
  };

  // Enter Update Mode
  const handleStartUpdate = () => {
    setIsEditing(true);
    setIsSubmitted(false);
    setShowViewAttendanceTable(true);
    setAlertBanner({
      type: 'info',
      message: 'Editing mode active: Modify individual student statuses or use bulk actions, then click Save Changes.'
    });
  };

  // Initiate Update Confirmation
  const handleInitiateUpdateSave = () => {
    setShowUpdateConfirmModal(true);
  };

  // Confirm Update
  const handleConfirmUpdate = () => {
    setShowUpdateConfirmModal(false);
    const updatedRecord = {
      ...submittedSession,
      course,
      batch,
      branch,
      section,
      date,
      fromTime,
      toTime,
      classTime,
      topicsCovered,
      totalStudents,
      presentCount,
      absentCount,
      attendanceMap: { ...attendanceMap },
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSubmittedSession(updatedRecord);
    setIsSubmitted(true);
    setIsEditing(false);
    setAlertBanner({
      type: 'success',
      message: `Attendance record updated successfully! Total Present: ${presentCount}, Absent: ${absentCount}.`
    });
  };

  // Cancel Update
  const handleCancelUpdate = () => {
    if (submittedSession) {
      setAttendanceMap({ ...submittedSession.attendanceMap });
      setTopicsCovered(submittedSession.topicsCovered);
      if (submittedSession.fromTime && submittedSession.toTime) {
        setFromTime(submittedSession.fromTime);
        setToTime(submittedSession.toTime);
      } else if (submittedSession.classTime) {
        const parts = submittedSession.classTime.split(/\s*(?:to|-|–)\s*/i);
        if (parts.length >= 2) {
          setFromTime(parts[0].trim());
          setToTime(parts[1].trim());
        } else {
          setFromTime(submittedSession.classTime);
          setToTime('11:30 AM');
        }
      }
      setDate(submittedSession.date);
    }
    setIsEditing(false);
    setIsSubmitted(true);
    setAlertBanner(null);
  };

  // Reset to record new attendance session
  const handleRecordNewSession = () => {
    setIsSubmitted(false);
    setIsEditing(false);
    setSubmittedSession(null);
    setAttendanceMap({});
    setTopicsCovered('');
    setAlertBanner(null);
  };

  // Role display label
  const roleLabel = role === 'hod' ? 'HOD Department Console' : role === 'staff' ? 'Lab & Operations Staff' : 'Faculty Classroom Workspace';

  return (
    <div className="take-attendance-wrapper">
      {/* Page Header */}
      <div className="take-attendance-header">
        <div className="take-attendance-title-area">
          <h2>
            <ClipboardCheck size={26} /> Take Attendance
          </h2>
          <p>Select your class and record student attendance.</p>
        </div>
        <div className="take-attendance-role-tag">
          <UserCheck size={15} /> {roleLabel}
        </div>
      </div>

      {/* Alert / Notification Banner */}
      {alertBanner && (
        <div className={`attendance-alert-banner ${alertBanner.type}`}>
          {alertBanner.type === 'success' && <CheckCircle2 size={18} />}
          {alertBanner.type === 'error' && <AlertCircle size={18} />}
          {alertBanner.type === 'info' && <Sparkles size={18} />}
          <span>{alertBanner.message}</span>
          <button
            type="button"
            onClick={() => setAlertBanner(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── FINAL ATTENDANCE SUMMARY PANEL (SHOWN AFTER SUBMISSION) ── */}
      {isSubmitted && submittedSession && !isEditing && (
        <div className="final-summary-card">
          <div className="final-summary-header">
            <div className="final-summary-header-left">
              <div className="final-summary-badge">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3>Official Attendance Record Finalized</h3>
                <p>
                  Submitted on {submittedSession.date} at {submittedSession.submittedAt || submittedSession.classTime}
                  {submittedSession.updatedAt ? ` (Updated at ${submittedSession.updatedAt})` : ''} · Recorded by {submittedSession.facultyName}
                </p>
              </div>
            </div>
          </div>

          <div className="final-meta-grid">
            <div className="final-meta-item">
              <span>Course</span>
              <strong>{submittedSession.course}</strong>
            </div>
            <div className="final-meta-item">
              <span>Batch</span>
              <strong>{submittedSession.batch}</strong>
            </div>
            <div className="final-meta-item">
              <span>Branch</span>
              <strong>{submittedSession.branch}</strong>
            </div>
            <div className="final-meta-item">
              <span>Section</span>
              <strong>{submittedSession.section}</strong>
            </div>
            <div className="final-meta-item">
              <span>Lecture Date</span>
              <strong>{submittedSession.date}</strong>
            </div>
            <div className="final-meta-item">
              <span>Class Time</span>
              <strong>{submittedSession.classTime}</strong>
            </div>
            <div className="final-meta-item" style={{ gridColumn: 'span 2' }}>
              <span>Topics Covered</span>
              <strong>{submittedSession.topicsCovered || 'Regular Syllabus Lecture'}</strong>
            </div>
          </div>

          {/* Statistics Progress Bar */}
          <div className="final-stats-bar">
            <div className="final-stats-bar-header">
              <span style={{ color: '#16a34a' }}>
                Present: {submittedSession.presentCount} ({totalStudents > 0 ? ((submittedSession.presentCount / totalStudents) * 100).toFixed(1) : 0}%)
              </span>
              <span style={{ color: '#64748b' }}>
                Total Enrolled: {totalStudents}
              </span>
              <span style={{ color: '#dc2626' }}>
                Absent: {submittedSession.absentCount} ({totalStudents > 0 ? ((submittedSession.absentCount / totalStudents) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="final-progress-track">
              <div
                className="final-progress-present"
                style={{ width: `${totalStudents > 0 ? (submittedSession.presentCount / totalStudents) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="final-actions-row">
            <button
              type="button"
              className="btn-view-attendance"
              onClick={() => setShowViewAttendanceTable(prev => !prev)}
            >
              <Eye size={16} />
              {showViewAttendanceTable ? 'Hide Attendance List' : 'View Attendance List'}
            </button>
            <button
              type="button"
              className="btn-update-attendance"
              onClick={handleStartUpdate}
            >
              <Edit3 size={16} />
              Update Attendance
            </button>
            <button
              type="button"
              className="btn-new-attendance"
              onClick={handleRecordNewSession}
            >
              <RotateCcw size={16} />
              Record New Attendance
            </button>
          </div>
        </div>
      )}

      {/* ── 2. CLASS DETAILS FORM ── */}
      {(!isSubmitted || isEditing) && (
        <div className="attendance-card">
          <div className="attendance-card-header">
            <div>
              <h3><BookOpen size={18} color="#2563eb" /> Class Details &amp; Schedule</h3>
              <p>Configure course, batch, branch, section, and lecture topic.</p>
            </div>
            {isEditing && (
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.78rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                EDITING SESSION
              </span>
            )}
          </div>
          <div className="attendance-card-body">
            <div className="class-details-grid">
              {/* Course */}
              <div className="form-group">
                <label>Course <span className="required-star">*</span></label>
                <select
                  className="form-control-select"
                  value={course}
                  onChange={handleCourseChange}
                >
                  {Object.keys(ACADEMIC_PROGRAMS).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div className="form-group">
                <label>Batch <span className="required-star">*</span></label>
                <select
                  className="form-control-select"
                  value={batch}
                  onChange={handleBatchChange}
                >
                  {availableBatches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div className="form-group">
                <label>Branch <span className="required-star">*</span></label>
                <select
                  className="form-control-select"
                  value={branch}
                  onChange={handleBranchChange}
                >
                  {availableBranches.map(br => (
                    <option key={br} value={br}>{br}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="form-group">
                <label>Section <span className="required-star">*</span></label>
                <select
                  className="form-control-select"
                  value={section}
                  onChange={handleSectionChange}
                >
                  {availableSections.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="form-group">
                <label>Date <span className="required-star">*</span></label>
                <input
                  type="date"
                  className="form-control-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Class Time - From Time and To Time */}
              <div className="form-group">
                <label>Class Time (From) <span className="required-star">*</span></label>
                <button
                  type="button"
                  className="form-control-time-btn"
                  onClick={() => openTimePicker('from')}
                  title="Click to select lecture Start Time (From)"
                >
                  <span className={fromTime ? 'time-val' : 'time-placeholder'}>
                    {fromTime || 'Select From Time'}
                  </span>
                  <Clock size={16} color="#2563eb" />
                </button>
              </div>

              <div className="form-group">
                <label>Class Time (To) <span className="required-star">*</span></label>
                <button
                  type="button"
                  className="form-control-time-btn"
                  onClick={() => openTimePicker('to')}
                  title="Click to select lecture End Time (To)"
                >
                  <span className={toTime ? 'time-val' : 'time-placeholder'}>
                    {toTime || 'Select To Time'}
                  </span>
                  <Clock size={16} color="#2563eb" />
                </button>
              </div>
            </div>

            {/* Topics Covered */}
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Topics Covered <span className="required-star">*</span></label>
              <textarea
                className="form-control-textarea"
                rows={2}
                placeholder="Enter lecture topics taught during this session (e.g., Graph Traversals: BFS & DFS Implementations)..."
                value={topicsCovered}
                onChange={(e) => setTopicsCovered(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 7. LIVE ATTENDANCE SUMMARY CARDS ── */}
      {studentsList.length > 0 && (!isSubmitted || isEditing || showViewAttendanceTable) && (
        <div className="attendance-summary-deck">
          {/* Total Students */}
          <div className="summary-card total">
            <div className="summary-card-copy">
              <span>Total Students</span>
              <strong>{totalStudents}</strong>
              <small>Enrolled in {section}</small>
            </div>
            <div className="summary-card-icon">
              <Users size={22} />
            </div>
          </div>

          {/* Present */}
          <div className="summary-card present">
            <div className="summary-card-copy">
              <span>Present</span>
              <strong>{presentCount}</strong>
              <small>
                {totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0}% Attendance Rate
              </small>
            </div>
            <div className="summary-card-icon">
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* Absent */}
          <div className="summary-card absent">
            <div className="summary-card-copy">
              <span>Absent</span>
              <strong>{absentCount}</strong>
              <small>
                {totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : 0}% Absent Rate
              </small>
            </div>
            <div className="summary-card-icon">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      )}

      {/* ── 4 & 5. STUDENT ATTENDANCE TABLE ── */}
      {studentsList.length === 0 ? (
        <div className="attendance-card">
          <div className="attendance-empty-state">
            <AlertCircle size={40} />
            <h4>No Class Selected</h4>
            <p>Please select Course, Batch, Branch, and Section above to generate the student attendance roster.</p>
          </div>
        </div>
      ) : (!isSubmitted || isEditing || showViewAttendanceTable) ? (
        <div className="attendance-card">
          <div className="attendance-card-header">
            <div>
              <h3>
                <Users size={18} color="#2563eb" />
                Student Roster · {course} {branch} ({section})
              </h3>
              <p>Default status is ABSENT. Check student box to mark PRESENT (green tick).</p>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {isSubmitted && !isEditing ? 'ReadOnly Attendance Record' : 'Live Interactive Draft'}
            </span>
          </div>

          <div className="attendance-card-body">
            {/* Table Toolbar (Mark All / Clear All / Search) */}
            {(!isSubmitted || isEditing) && (
              <div className="attendance-toolbar">
                <div className="attendance-quick-buttons">
                  <button
                    type="button"
                    className="btn-mark-all-present"
                    onClick={handleMarkAllPresent}
                    title="Mark all students present"
                  >
                    <Check size={16} /> Mark All Present
                  </button>
                  <button
                    type="button"
                    className="btn-clear-all"
                    onClick={handleClearAll}
                    title="Clear all checkboxes (mark all absent)"
                  >
                    <RotateCcw size={15} /> Clear All
                  </button>
                </div>

                <div className="attendance-search-box">
                  <input
                    type="text"
                    placeholder="Search name or roll no..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                  />
                  {tableSearch && (
                    <button
                      type="button"
                      onClick={() => setTableSearch('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th className="col-present">Present</th>
                    <th>Sl. No. / Roll No.</th>
                    <th>Registration No.</th>
                    <th>Student Name</th>
                    <th>Branch</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        No students match your filter "{tableSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std, idx) => {
                      const isPresent = Boolean(attendanceMap[std.id]);
                      const isDisabled = isSubmitted && !isEditing;
                      return (
                        <tr
                          key={std.id}
                          className={isPresent ? 'row-present' : ''}
                          onClick={() => {
                            if (!isDisabled) handleToggleStudent(std.id);
                          }}
                        >
                          {/* Present Column - Square Checkbox with Green Tick */}
                          <td className="col-present" onClick={(e) => e.stopPropagation()}>
                            <div className="att-checkbox-wrapper">
                              <button
                                type="button"
                                className={`att-square-checkbox ${isPresent ? 'checked' : ''}`}
                                disabled={isDisabled}
                                onClick={() => handleToggleStudent(std.id)}
                                aria-label={`Mark ${std.name} as ${isPresent ? 'absent' : 'present'}`}
                                title={isPresent ? 'Click to mark Absent' : 'Click to mark Present'}
                              >
                                {isPresent && <Check size={16} strokeWidth={3} />}
                              </button>
                            </div>
                          </td>

                          {/* Roll Number */}
                          <td>
                            <strong>{std.rollNumber}</strong>
                          </td>

                          {/* Registration Number */}
                          <td style={{ fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                            {std.registrationNumber}
                          </td>

                          {/* Student Name */}
                          <td>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{std.name}</span>
                          </td>

                          {/* Branch */}
                          <td>
                            <span style={{ color: '#64748b' }}>{std.branch}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Submit / Save Actions Footer */}
            {!isSubmitted && (
              <div className="attendance-submit-footer">
                <button
                  type="button"
                  className="btn-submit-attendance"
                  onClick={handleInitiateSubmit}
                >
                  <Send size={18} /> Submit Attendance
                </button>
              </div>
            )}

            {isEditing && (
              <div className="attendance-submit-footer">
                <button
                  type="button"
                  className="btn-clear-all"
                  onClick={handleCancelUpdate}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-submit-attendance"
                  onClick={handleInitiateUpdateSave}
                  style={{ background: '#16a34a' }}
                >
                  <CheckCircle2 size={18} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── 3. INTERACTIVE CLOCK-STYLE TIME PICKER MODAL ── */}
      {isTimePickerOpen && (
        <div className="attendance-modal-backdrop" onClick={() => setIsTimePickerOpen(false)}>
          <div className="attendance-modal-card clock-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h3>
                <Clock size={18} color="#2563eb" /> Select Class {timePickerTarget === 'from' ? 'Start Time (From)' : 'End Time (To)'}
              </h3>
              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setIsTimePickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="attendance-modal-body" style={{ textAlign: 'center' }}>
              {/* Digital Readout */}
              <div className="clock-digital-readout">
                <button
                  type="button"
                  className={`clock-unit-btn ${clockMode === 'hours' ? 'active' : ''}`}
                  onClick={() => setClockMode('hours')}
                  title="Switch to Hours selection"
                >
                  {draftHour < 10 ? `0${draftHour}` : draftHour}
                </button>
                <span className="clock-colon">:</span>
                <button
                  type="button"
                  className={`clock-unit-btn ${clockMode === 'minutes' ? 'active' : ''}`}
                  onClick={() => setClockMode('minutes')}
                  title="Switch to Minutes selection"
                >
                  {draftMinute < 10 ? `0${draftMinute}` : draftMinute}
                </button>
                <div className="clock-ampm-group">
                  <button
                    type="button"
                    className={`clock-ampm-btn ${draftAmPm === 'AM' ? 'active' : ''}`}
                    onClick={() => setDraftAmPm('AM')}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={`clock-ampm-btn ${draftAmPm === 'PM' ? 'active' : ''}`}
                    onClick={() => setDraftAmPm('PM')}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Radial Clock Face */}
              <div className="clock-dial-container">
                <ClockFace
                  mode={clockMode}
                  hour={draftHour}
                  minute={draftMinute}
                  onSelectHour={(h) => {
                    setDraftHour(h);
                    setClockMode('minutes'); // Auto advance to minutes
                  }}
                  onSelectMinute={(m) => setDraftMinute(m)}
                />
              </div>

              {/* Quick Minutes Chips */}
              <div className="clock-quick-chips">
                {[0, 15, 30, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`clock-chip ${draftMinute === m ? 'active' : ''}`}
                    onClick={() => {
                      setDraftMinute(m);
                      setClockMode('minutes');
                    }}
                  >
                    :{m < 10 ? `0${m}` : m}
                  </button>
                ))}
              </div>
            </div>

            <div className="attendance-modal-footer">
              <button
                type="button"
                className="btn-clear-all"
                onClick={() => setIsTimePickerOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-attendance"
                style={{ padding: '8px 20px', fontSize: '0.88rem' }}
                onClick={confirmTimePicker}
              >
                Confirm {timePickerTarget === 'from' ? 'From Time' : 'To Time'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. SUBMIT ATTENDANCE CONFIRMATION DIALOG ── */}
      {showConfirmModal && (
        <div className="attendance-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="attendance-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h3>
                <CheckCircle2 size={20} color="#2563eb" /> Confirm Class Attendance Submission
              </h3>
              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="attendance-modal-body">
              <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: '#475569' }}>
                Are you sure you want to submit the attendance for this lecture session? Review the session details below:
              </p>

              <div className="final-meta-grid" style={{ marginBottom: '16px' }}>
                <div className="final-meta-item">
                  <span>Class Cohort</span>
                  <strong>{course} · {branch}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Section &amp; Batch</span>
                  <strong>{section} ({batch})</strong>
                </div>
                <div className="final-meta-item">
                  <span>Date &amp; Time</span>
                  <strong>{date} at {classTime}</strong>
                </div>
                <div className="final-meta-item">
                  <span>Topics Covered</span>
                  <strong style={{ fontSize: '0.84rem' }}>{topicsCovered}</strong>
                </div>
              </div>

              {/* Counts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>TOTAL</div>
                  <strong style={{ fontSize: '1.4rem', color: '#1e3a8a' }}>{totalStudents}</strong>
                </div>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>PRESENT</div>
                  <strong style={{ fontSize: '1.4rem', color: '#15803d' }}>{presentCount}</strong>
                </div>
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>ABSENT</div>
                  <strong style={{ fontSize: '1.4rem', color: '#b91c1c' }}>{absentCount}</strong>
                </div>
              </div>
            </div>

            <div className="attendance-modal-footer">
              <button
                type="button"
                className="btn-clear-all"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-attendance"
                onClick={handleConfirmSubmit}
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. UPDATE ATTENDANCE CONFIRMATION DIALOG ── */}
      {showUpdateConfirmModal && (
        <div className="attendance-modal-backdrop" onClick={() => setShowUpdateConfirmModal(false)}>
          <div className="attendance-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="attendance-modal-header">
              <h3>
                <Edit3 size={20} color="#f59e0b" /> Confirm Attendance Update
              </h3>
              <button
                type="button"
                className="attendance-modal-close"
                onClick={() => setShowUpdateConfirmModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="attendance-modal-body">
              <p style={{ margin: '0 0 16px 0', fontSize: '0.92rem', color: '#475569' }}>
                Save updated attendance record for <strong>{course} {branch} ({section})</strong>?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>TOTAL</div>
                  <strong style={{ fontSize: '1.3rem', color: '#1e3a8a' }}>{totalStudents}</strong>
                </div>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>NEW PRESENT</div>
                  <strong style={{ fontSize: '1.3rem', color: '#15803d' }}>{presentCount}</strong>
                </div>
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>NEW ABSENT</div>
                  <strong style={{ fontSize: '1.3rem', color: '#b91c1c' }}>{absentCount}</strong>
                </div>
              </div>
            </div>

            <div className="attendance-modal-footer">
              <button
                type="button"
                className="btn-clear-all"
                onClick={() => setShowUpdateConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-attendance"
                style={{ background: '#16a34a' }}
                onClick={handleConfirmUpdate}
              >
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Circular Clock Face Component
// --------------------------------------------------------------------------
function ClockFace({ mode, hour, minute, onSelectHour, onSelectMinute }) {
  const clockRef = useRef(null);
  const RADIUS = 92;
  const CENTER = 125;

  // Calculate angle for the hand
  const currentAngle = mode === 'hours'
    ? ((hour % 12) / 12) * 360
    : (minute / 60) * 360;

  const rad = (currentAngle - 90) * (Math.PI / 180);
  const handEndX = CENTER + RADIUS * Math.cos(rad);
  const handEndY = CENTER + RADIUS * Math.sin(rad);

  // Numbers to display
  const numbers = mode === 'hours'
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleDialClick = (e) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER;
    const y = e.clientY - rect.top - CENTER;
    let angleDeg = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angleDeg < 0) angleDeg += 360;

    if (mode === 'hours') {
      let h = Math.round(angleDeg / 30);
      if (h === 0) h = 12;
      onSelectHour(h);
    } else {
      let m = Math.round(angleDeg / 6);
      if (m === 60) m = 0;
      onSelectMinute(m);
    }
  };

  return (
    <div
      ref={clockRef}
      className="clock-face"
      onClick={handleDialClick}
    >
      {/* Center Pivot */}
      <div className="clock-center-dot" />

      {/* Hand Line & Tip Knob */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <line
          x1={CENTER}
          y1={CENTER}
          x2={handEndX}
          y2={handEndY}
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <div
        className="clock-hand-knob"
        style={{
          left: `${handEndX}px`,
          top: `${handEndY}px`
        }}
      />

      {/* Radial Numbers */}
      {numbers.map((val) => {
        const itemAngle = mode === 'hours'
          ? ((val % 12) / 12) * 360
          : (val / 60) * 360;
        const itemRad = (itemAngle - 90) * (Math.PI / 180);
        const x = CENTER + RADIUS * Math.cos(itemRad);
        const y = CENTER + RADIUS * Math.sin(itemRad);
        const isSelected = mode === 'hours'
          ? (val === 12 ? (hour === 12 || hour === 0) : hour === val)
          : Math.abs(minute - val) <= 1;

        return (
          <div
            key={val}
            className={`clock-number-item ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${x}px`,
              top: `${y}px`
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (mode === 'hours') {
                onSelectHour(val);
              } else {
                onSelectMinute(val);
              }
            }}
          >
            {mode === 'minutes' && val < 10 ? `0${val}` : val}
          </div>
        );
      })}
    </div>
  );
}
