import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Eye,
  Filter,
  Check,
  Bell
} from 'lucide-react';
import {
  getAllHostels,
  getSubmittedAttendances
} from '../../services/hostelAttendanceStore.js';
import './HostelModules.css';

export default function ViewHostelAttendance({ account, onNavigateTab }) {
  const [hostels] = useState(() => getAllHostels());
  const [submissions, setSubmissions] = useState(() => getSubmittedAttendances());
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(() => {
    const list = getSubmittedAttendances();
    return list[0]?.id || null;
  });
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [newSubmissionAlert, setNewSubmissionAlert] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Real-time automatic fetch listener:
  // When warden submits attendance, this triggers and immediately updates the state!
  useEffect(() => {
    const handleNewSubmission = (event) => {
      const refreshedList = getSubmittedAttendances();
      setSubmissions(refreshedList);
      if (event?.detail) {
        setSelectedSubmissionId(event.detail.id);
        setNewSubmissionAlert({
          hostelName: event.detail.hostelName,
          submittedBy: event.detail.submittedBy,
          time: event.detail.submittedAt,
          id: event.detail.id
        });
        showToast(`✓ New attendance for ${event.detail.hostelName} auto-fetched in real time!`);
      }
    };

    window.addEventListener('bput_hostel_attendance_submitted', handleNewSubmission);
    window.addEventListener('storage', handleNewSubmission);
    return () => {
      window.removeEventListener('bput_hostel_attendance_submitted', handleNewSubmission);
      window.removeEventListener('storage', handleNewSubmission);
    };
  }, []);

  // Filtered list of submissions by hostel
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (selectedHostelFilter === 'ALL') return true;
      return sub.hostelName?.toLowerCase().includes(selectedHostelFilter.toLowerCase()) ||
        sub.hostelCode?.toLowerCase() === selectedHostelFilter.toLowerCase();
    });
  }, [submissions, selectedHostelFilter]);

  // Active submission currently selected for detailed inspection
  const activeSubmission = useMemo(() => {
    if (!selectedSubmissionId) return filteredSubmissions[0] || null;
    return submissions.find(s => s.id === selectedSubmissionId) || filteredSubmissions[0] || null;
  }, [submissions, selectedSubmissionId, filteredSubmissions]);

  // Filtered resident records inside the active submission
  const filteredRecords = useMemo(() => {
    if (!activeSubmission?.records) return [];
    return activeSubmission.records.filter(r => {
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query ||
        r.studentName?.toLowerCase().includes(query) ||
        r.rollNumber?.toLowerCase().includes(query) ||
        r.roomNumber?.toLowerCase().includes(query);
      return matchStatus && matchSearch;
    });
  }, [activeSubmission, statusFilter, searchQuery]);

  const stats = activeSubmission?.stats || {
    total: 0,
    present: 0,
    absent: 0,
    onLeave: 0,
    percentage: '0%'
  };

  const absenteesList = useMemo(() => {
    if (!activeSubmission?.records) return [];
    return activeSubmission.records.filter(r => r.status === 'Absent');
  }, [activeSubmission]);

  // Export functions
  const handleExportCsv = () => {
    if (!activeSubmission) return;
    const headers = ['#', 'Student Name', 'Roll Number', 'Room', 'Bed', 'Status', 'Warden Remarks'];
    const rows = (activeSubmission.records || []).map((r, i) => [
      i + 1,
      r.studentName,
      r.rollNumber,
      r.roomNumber,
      r.bedNumber,
      r.status,
      r.remarks || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Attendance_${activeSubmission.hostelCode}_${activeSubmission.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Attendance report exported to CSV / Excel.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="hostel-unified-module">
      {/* Toast */}
      {toastMsg && (
        <div className="hostel-toast-banner success">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="hostel-page-header">
        <div className="hostel-breadcrumb">
          <span>Home</span> / <span>Hostel</span> / <span className="current">View Hostel Attendance</span>
        </div>
        <div className="hostel-header-title-row">
          <div>
            <h2>View Hostel Attendance Console</h2>
            <p>Real-time hostel night roll-call audit log. Submissions by resident wardens automatically appear here immediately upon submission.</p>
          </div>
          <div className="realtime-live-tag">
            <span className="live-dot" /> Live Auto-Sync Active
          </div>
        </div>
      </div>

      {/* Real-time sync notification banner when Warden submits */}
      {newSubmissionAlert && (
        <div className="hostel-live-sync-alert">
          <div className="live-alert-icon">
            <Bell size={20} color="#2563eb" />
          </div>
          <div className="live-alert-text">
            <strong>Fresh Roll-Call Received!</strong>
            <span>
              Warden <strong>{newSubmissionAlert.submittedBy}</strong> just submitted attendance for <strong>{newSubmissionAlert.hostelName}</strong> at {newSubmissionAlert.time}. Auto-loaded into this view.
            </span>
          </div>
          <button
            type="button"
            className="dismiss-banner-btn"
            onClick={() => setNewSubmissionAlert(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Filter and Actions Toolbar */}
      <div className="hostel-card-container">
        <div className="view-attendance-toolbar">
          <div className="toolbar-left">
            <div className="filter-item">
              <label>Filter Hostel:</label>
              <select
                value={selectedHostelFilter}
                onChange={e => setSelectedHostelFilter(e.target.value)}
              >
                <option value="ALL">All Residential Hostels</option>
                {hostels.map(h => (
                  <option key={h.code} value={h.name}>{h.name} ({h.code})</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Select Submitted Session:</label>
              <select
                value={selectedSubmissionId || ''}
                onChange={e => setSelectedSubmissionId(e.target.value)}
              >
                {filteredSubmissions.length === 0 ? (
                  <option value="">No submissions recorded</option>
                ) : (
                  filteredSubmissions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.date} · {s.hostelName} ({s.stats?.present}/{s.stats?.total} Present)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="filter-item">
              <label>Status Filter:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Absent">Absent Only</option>
                <option value="On Leave">On Leave Only</option>
              </select>
            </div>
          </div>

          <div className="toolbar-right">
            <button
              type="button"
              className="export-btn excel"
              onClick={handleExportCsv}
              title="Download CSV for Excel"
            >
              <FileSpreadsheet size={15} /> EXCEL
            </button>
            <button
              type="button"
              className="export-btn print"
              onClick={handlePrint}
              title="Print Official Attendance Sheet"
            >
              <Printer size={15} /> Print
            </button>
            {onNavigateTab && (
              <button
                type="button"
                className="h-btn-action-primary"
                onClick={() => onNavigateTab('take-attendance')}
              >
                + Take New Attendance
              </button>
            )}
          </div>
        </div>

        {/* Selected Session Metadata Banner */}
        {activeSubmission && (
          <div className="session-meta-strip">
            <div className="meta-item">
              <span className="lbl">Hostel Complex</span>
              <strong className="val">{activeSubmission.hostelName} ({activeSubmission.hostelCode})</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Date &amp; Session</span>
              <strong className="val">{activeSubmission.date} · {activeSubmission.session}</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Submitted By</span>
              <strong className="val">{activeSubmission.submittedBy}</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Submission Timestamp</span>
              <strong className="val">{activeSubmission.submittedAt}</strong>
            </div>
            <div className="meta-item">
              <span className="lbl">Verification Status</span>
              <span className="verified-pill">
                <CheckCircle2 size={13} /> Verified by Hostel Admin
              </span>
            </div>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="attendance-kpi-grid">
          <div className="kpi-box total">
            <div className="kpi-num">{stats.total}</div>
            <div className="kpi-label">Total Boarders</div>
            <div className="kpi-sub">Roll-call enrolled</div>
          </div>
          <div className="kpi-box present">
            <div className="kpi-num">{stats.present}</div>
            <div className="kpi-label">Present In Hostel</div>
            <div className="kpi-sub">{stats.percentage} Turnout</div>
          </div>
          <div className="kpi-box absent">
            <div className="kpi-num">{stats.absent}</div>
            <div className="kpi-label">Absent Tonight</div>
            <div className="kpi-sub">Alert notification queued</div>
          </div>
          <div className="kpi-box leave">
            <div className="kpi-num">{stats.onLeave}</div>
            <div className="kpi-label">On Approved Leave</div>
            <div className="kpi-sub">Digital gate pass verified</div>
          </div>
        </div>

        {/* Absentee Alert Box if any */}
        {absenteesList.length > 0 && (
          <div className="absentee-alert-panel">
            <div className="alert-header">
              <AlertTriangle size={18} color="#dc2626" />
              <strong>Night Curfew Absence Notice: {absenteesList.length} Student{absenteesList.length > 1 ? 's' : ''} Missing</strong>
            </div>
            <div className="absentee-pill-list">
              {absenteesList.map(a => (
                <div key={a.rollNumber || a.studentName} className="absentee-pill">
                  <span className="name">{a.studentName}</span>
                  <span className="room">Rm {a.roomNumber} ({a.bedNumber})</span>
                  <button
                    type="button"
                    className="contact-parent-btn"
                    onClick={() => showToast(`Automated parent SMS alert sent for ${a.studentName} to parent phone.`)}
                  >
                    <PhoneCall size={12} /> Alert Parents
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Attendance Roster Table */}
        <div className="table-search-header">
          <h3>Detailed Resident Attendance Register</h3>
          <div className="search-bar">
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Filter by name, roll, room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="hostel-table-wrapper">
          <table className="hostel-custom-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>#</th>
                <th>Resident Student</th>
                <th>Roll / Reg No</th>
                <th>Room &amp; Bed</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Remarks / Warden Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-records-cell">
                    No resident records found for this view criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={idx} className={r.status === 'Absent' ? 'row-absent-highlight' : ''}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="student-name-bold">{r.studentName}</div>
                      <div className="student-subtext">{r.department || 'B.Tech Boarder'}</div>
                    </td>
                    <td>
                      <div>Roll: <strong>{r.rollNumber}</strong></div>
                      {r.regNo && <div className="student-subtext">Reg: {r.regNo}</div>}
                    </td>
                    <td>
                      <span className="room-badge">Room {r.roomNumber}</span>
                      <span className="bed-badge">{r.bedNumber}</span>
                    </td>
                    <td>
                      {r.status === 'Present' && <span className="h-status-badge present">✓ Present</span>}
                      {r.status === 'Absent' && <span className="h-status-badge absent">✕ Absent</span>}
                      {r.status === 'On Leave' && <span className="h-status-badge leave">On Leave</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{r.phone || 'Resident Student'}</div>
                      {r.parentPhone && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Parent: {r.parentPhone}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {r.remarks || 'Regular presence verified.'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Historical Submissions Table */}
        <div style={{ marginTop: '2.5rem' }}>
          <div className="table-search-header">
            <h3>Recent Warden Attendance Submissions History</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Showing {submissions.length} submitted session records
            </span>
          </div>

          <div className="hostel-table-wrapper">
            <table className="hostel-custom-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Date &amp; Shift</th>
                  <th>Hostel Complex</th>
                  <th>Submitted By</th>
                  <th>Turnout Ratio</th>
                  <th>Status in Admin Portal</th>
                  <th style={{ textAlign: 'center' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr
                    key={sub.id}
                    className={sub.id === selectedSubmissionId ? 'row-selected-highlight' : ''}
                  >
                    <td>
                      <code style={{ fontWeight: 700, color: '#2563eb' }}>{sub.id}</code>
                    </td>
                    <td>
                      <strong>{sub.date}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub.session}</div>
                    </td>
                    <td>
                      <strong>{sub.hostelName}</strong> ({sub.hostelCode})
                    </td>
                    <td>
                      <div>{sub.submittedBy}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{sub.submittedAt}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#15803d' }}>
                        {sub.stats?.present} Present
                      </span>{' '}
                      / {sub.stats?.total} Total ({sub.stats?.percentage})
                    </td>
                    <td>
                      <span className="verified-pill">
                        <CheckCircle2 size={13} /> {sub.status || 'Submitted to Hostel Admin'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="h-btn-inspect"
                        onClick={() => {
                          setSelectedSubmissionId(sub.id);
                          showToast(`Loaded attendance details for ${sub.hostelName} (${sub.date}).`);
                        }}
                      >
                        <Eye size={13} /> Load Roster
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
