import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Search,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  getAllHostels,
  getStudentsRoster,
  submitHostelAttendance
} from '../../services/hostelAttendanceStore.js';
import './HostelModules.css';

export default function TakeHostelAttendance({ account, onNavigateTab }) {
  const [hostels, setHostels] = useState(() => getAllHostels());
  const [selectedHostel, setSelectedHostel] = useState('Bhabani Hostel-1');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Night Roll Call (08:30 PM)');
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [lastSubmittedId, setLastSubmittedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize student records for the selected hostel
  const [students, setStudents] = useState(() => {
    const list = getStudentsRoster('Bhabani Hostel-1');
    return list.map(s => ({
      ...s,
      status: s.status || 'Present',
      customRemarks: s.remarks || ''
    }));
  });

  // When selected hostel changes, reload roster
  useEffect(() => {
    const list = getStudentsRoster(selectedHostel);
    setStudents(list.map(s => ({
      ...s,
      status: 'Present',
      customRemarks: ''
    })));
  }, [selectedHostel]);

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 3800);
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleRemarkChange = (studentId, text) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, customRemarks: text } : s))
    );
  };

  const markAllStatus = (newStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status: newStatus })));
    showToast(`Marked all ${students.length} students as ${newStatus}.`);
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
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
      hostelName: selectedHostel,
      hostelCode: targetHostelObj.code || 'BN1',
      date: attendanceDate,
      session,
      submittedBy: submitterName,
      records: submissionRecords,
      remarks: remarks || `Daily roll call taken by ${submitterName}.`
    });

    setLastSubmittedId(result.id);
    setIsSubmitting(false);
    showToast(
      `✓ Attendance for ${selectedHostel} submitted successfully! Automatically fetched to Hostel Admin view.`
    );
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

      {/* Submission Success Alert Banner */}
      {lastSubmittedId && (
        <div className="hostel-success-banner">
          <div className="banner-left">
            <CheckCircle2 size={24} color="#15803d" />
            <div>
              <strong>Roll-Call Session Dispatched! (Record ID: {lastSubmittedId})</strong>
              <p>Attendance is saved and instantly fetched to the <strong>Hostel Admin</strong> console for review and audit.</p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              className="h-btn-action-primary"
              onClick={() => onNavigateTab('view-attendance')}
            >
              View Hostel Attendance Console →
            </button>
          )}
        </div>
      )}

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
              onClick={() => markAllStatus('Present')}
            >
              <UserCheck size={14} /> Mark All Present
            </button>
            <button
              type="button"
              className="bulk-btn mark-absent"
              onClick={() => markAllStatus('Absent')}
            >
              <UserX size={14} /> Mark All Absent
            </button>
            <button
              type="button"
              className="bulk-btn reset"
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
          <table className="hostel-custom-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>#</th>
                <th>Resident Details</th>
                <th>Room &amp; Bed</th>
                <th>Branch &amp; Sem</th>
                <th>Contact Phone</th>
                <th style={{ minWidth: '220px', textAlign: 'center' }}>Attendance Status</th>
                <th>Warden Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-records-cell">
                    No resident boarders found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const isAbsent = std.status === 'Absent';
                  return (
                    <tr key={std.id} className={isAbsent ? 'row-absent-highlight' : ''}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="student-name-bold">{std.studentName}</div>
                        <div className="student-subtext">Roll: {std.rollNumber} · Reg: {std.regNo}</div>
                      </td>
                      <td>
                        <span className="room-badge">Room {std.roomNumber}</span>
                        <span className="bed-badge">{std.bedNumber}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>{std.department}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{std.semester}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{std.phone}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Parent: {std.parentPhone}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="status-toggle-buttons">
                          <button
                            type="button"
                            className={`status-btn present ${std.status === 'Present' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(std.id, 'Present')}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            className={`status-btn absent ${std.status === 'Absent' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(std.id, 'Absent')}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            className={`status-btn leave ${std.status === 'On Leave' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(std.id, 'On Leave')}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-inline-input"
                          placeholder={std.status === 'Absent' ? 'Reason for absence...' : 'Optional remarks...'}
                          value={std.customRemarks}
                          onChange={e => handleRemarkChange(std.id, e.target.value)}
                        />
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

            <button
              type="button"
              className="submit-attendance-btn"
              disabled={isSubmitting}
              onClick={handleSubmitAttendance}
            >
              <Send size={16} />
              {isSubmitting ? 'Dispatching...' : 'Submit Attendance & Fetch to Hostel Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
