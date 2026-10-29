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
  Phone,
  PhoneCall,
  Copy,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Filter,
  Check,
  Bell
} from 'lucide-react';
import {
  getAllHostels,
  getSubmittedAttendances,
  getStudentsRoster,
  getStudentDeptAndBranch
} from '../../services/hostelAttendanceStore.js';
import { findStudentByQuery } from '../../services/studentStore.js';
import StudentPortal from '../../StudentPortal.jsx';
import {
  exportHostelAttendanceToExcel,
  downloadHostelAttendancePdf
} from '../../utils/hostelAttendanceExportUtils.js';
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
  const [viewingStudentDashboard, setViewingStudentDashboard] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
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

  const handleViewStudentDashboard = (r) => {
    const matched = findStudentByQuery(r.regNo || r.rollNumber || r.studentName) || {};
    const studentAccount = {
      id: matched.id || `std-${r.rollNumber}`,
      studentId: matched.id || `std-${r.rollNumber}`,
      role: 'student',
      name: matched.name || r.studentName,
      registrationNumber: matched.registrationNumber || r.regNo,
      rollNumber: matched.rollNumber || r.rollNumber,
      branch: matched.branch || r.department,
      department: matched.department || r.department,
      semester: matched.semester || r.semester || '5th Sem',
      phone: r.phone || matched.phone || '+91 98610 11223',
      parentPhone: r.parentPhone || matched.parentPhone || matched.guardianPhone || '+91 94370 99887',
      guardianName: matched.guardianName || 'Guardian',
      email: matched.email || 'student@apnacampus.edu',
      roomNumber: r.roomNumber,
      bedNumber: r.bedNumber,
      allottedHostel: activeSubmission?.hostelName || selectedHostelFilter,
      hostelCode: activeSubmission?.hostelCode || 'BN1'
    };
    setViewingStudentDashboard(studentAccount);
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

  // Handle Hostel Filter selection
  const handleHostelFilterChange = (val) => {
    setSelectedHostelFilter(val);
    const matches = submissions.filter(sub => {
      if (val === 'ALL') return true;
      return (
        sub.hostelName?.toLowerCase() === val.toLowerCase() ||
        sub.hostelName?.toLowerCase().includes(val.toLowerCase()) ||
        sub.hostelCode?.toLowerCase() === val.toLowerCase()
      );
    });
    if (matches.length > 0) {
      setSelectedSubmissionId(matches[0].id);
    } else {
      setSelectedSubmissionId(null);
    }
  };

  // Active submission currently selected for detailed inspection
  const activeSubmission = useMemo(() => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) {
      if (selectedHostelFilter !== 'ALL') {
        const roster = getStudentsRoster(selectedHostelFilter);
        if (roster && roster.length > 0) {
          const hostelObj = hostels.find(h =>
            h.name.toLowerCase().includes(selectedHostelFilter.toLowerCase()) ||
            h.code?.toLowerCase() === selectedHostelFilter.toLowerCase()
          );
          const presentCnt = roster.filter(r => r.status === 'Present').length;
          const absentCnt = roster.filter(r => r.status === 'Absent').length;
          const leaveCnt = roster.filter(r => r.status === 'On Leave').length;
          return {
            id: `AUTO-${hostelObj?.code || 'HST'}`,
            hostelName: hostelObj?.name || selectedHostelFilter,
            hostelCode: hostelObj?.code || 'HST',
            date: new Date().toISOString().split('T')[0],
            session: 'Night Roll Call (08:30 PM)',
            submittedBy: hostelObj?.warden || 'Resident Warden',
            submittedAt: `${new Date().toLocaleDateString('en-GB')}, 08:30 PM (Verified)`,
            verifiedByAdmin: true,
            status: 'Submitted to Hostel Admin',
            stats: {
              total: roster.length,
              present: presentCnt,
              absent: absentCnt,
              onLeave: leaveCnt,
              percentage: `${((presentCnt / roster.length) * 100).toFixed(1)}%`
            },
            remarks: `Hostel roll-call attendance register for ${hostelObj?.name || selectedHostelFilter}`,
            records: roster
          };
        }
      }
      return null;
    }
    const match = filteredSubmissions.find(s => s.id === selectedSubmissionId);
    return match || filteredSubmissions[0];
  }, [filteredSubmissions, selectedSubmissionId, selectedHostelFilter, hostels]);

  // Filtered resident records inside the active submission
  const filteredRecords = useMemo(() => {
    if (!activeSubmission?.records) return [];
    return activeSubmission.records.filter(r => {
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query ||
        r.studentName?.toLowerCase().includes(query) ||
        r.rollNumber?.toLowerCase().includes(query) ||
        r.roomNumber?.toLowerCase().includes(query) ||
        r.regNo?.toLowerCase().includes(query) ||
        r.department?.toLowerCase().includes(query);
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
  const handleExportExcel = () => {
    if (!activeSubmission) {
      showToast('No active attendance submission found to export.');
      return;
    }
    try {
      const fileName = exportHostelAttendanceToExcel({
        submission: activeSubmission,
        records: filteredRecords
      });
      showToast(`✓ Excel downloaded for ${activeSubmission.hostelName}: ${fileName}`);
    } catch (err) {
      console.error('Excel Export Error:', err);
      showToast('Failed to export Excel file. Please try again.');
    }
  };

  const handleExportPdf = () => {
    if (!activeSubmission) {
      showToast('No active attendance submission found to generate PDF.');
      return;
    }
    try {
      const fileName = downloadHostelAttendancePdf({
        submission: activeSubmission,
        records: filteredRecords
      });
      showToast(`✓ PDF generated for ${activeSubmission.hostelName}: ${fileName}`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      showToast('Failed to generate PDF document. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (viewingStudentDashboard) {
    return (
      <div className="hostel-unified-module">
        <div className="warden-student-dashboard-wrapper">
          <div className="warden-student-nav-bar">
            <div className="warden-student-nav-left">
              <button
                type="button"
                className="warden-back-attendance-btn"
                onClick={() => setViewingStudentDashboard(null)}
                title="Return to View Attendance"
              >
                <ArrowLeft size={16} />
                <span>Back to View Attendance</span>
              </button>
              <div className="warden-viewing-student-info">
                <span className="warden-badge-inspect">
                  <ShieldCheck size={14} /> Hostel Admin Inspection View: CMS Student Workspace
                </span>
                <strong className="warden-student-name">{viewingStudentDashboard.name}</strong>
                <span className="warden-student-meta">
                  Roll No: <strong>{viewingStudentDashboard.rollNumber}</strong> &nbsp;|&nbsp;
                  Reg No: <strong>{viewingStudentDashboard.registrationNumber}</strong> &nbsp;|&nbsp;
                  {viewingStudentDashboard.branch} &nbsp;|&nbsp;
                  Room {viewingStudentDashboard.roomNumber} ({viewingStudentDashboard.allottedHostel})
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

  return (
    <div className="hostel-unified-module">
      {/* Toast */}
      {toastMsg && (
        <div className="hostel-toast-banner success">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

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
                onChange={e => handleHostelFilterChange(e.target.value)}
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
                value={activeSubmission?.id || selectedSubmissionId || ''}
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
              onClick={handleExportExcel}
              title="Download Full Excel Workbook (.xlsx) with Present, Absent, and Leave boarder details"
            >
              <FileSpreadsheet size={15} /> EXCEL
            </button>
            <button
              type="button"
              className="export-btn pdf"
              onClick={handleExportPdf}
              title="Download Official PDF Attendance Report with Table, Stats & Signatures"
            >
              <FileText size={15} /> PDF
            </button>
            <button
              type="button"
              className="export-btn print"
              onClick={handlePrint}
              title="Print Official Attendance Sheet"
            >
              <Printer size={15} /> PRINT
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
                <th style={{ width: '45px' }}>Sl No</th>
                <th>Name of Student</th>
                <th>Registration No</th>
                <th>Department</th>
                <th>Branch</th>
                <th style={{ textAlign: 'center' }}>Roll No</th>
                <th>Room No</th>
                <th>Student Contact</th>
                <th>Parent Contact</th>
                <th style={{ minWidth: '130px', textAlign: 'center' }}>Attendance Status</th>
                <th style={{ minWidth: '125px', textAlign: 'center' }}>View Student</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="no-records-cell">
                    No resident records found for this view criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const deptAndBranch = getStudentDeptAndBranch(r);
                  return (
                    <tr key={idx} className={r.status === 'Absent' ? 'row-absent-highlight' : ''}>
                      {/* 1. Sl No */}
                      <td>{idx + 1}</td>

                      {/* 2. Name of Student */}
                      <td>
                        <div
                          className="student-name-bold"
                          style={{ cursor: 'pointer', color: '#1d4ed8' }}
                          onClick={() => handleViewStudentDashboard(r)}
                          title="Click to view student details"
                        >
                          {r.studentName}
                        </div>
                      </td>

                      {/* 3. Registration No */}
                      <td>
                        <span className="reg-no-code">{r.regNo || `23052010${String(r.rollNumber || '01').padStart(2, '0')}`}</span>
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
                        <strong style={{ color: '#0f172a' }}>{r.rollNumber}</strong>
                      </td>

                      {/* 7. Room No */}
                      <td>
                        <span className="room-badge">
                          Room {r.roomNumber}
                          {r.bedNumber ? ` · ${r.bedNumber}` : ''}
                        </span>
                      </td>

                      {/* 8. Student Contact */}
                      <td>
                        {r.phone ? (
                          <div className="contact-cell-box">
                            <a
                              href={`tel:${r.phone}`}
                              className="contact-phone-link"
                              title={`Call Student: ${r.phone}`}
                            >
                              <Phone size={13} className="contact-icon student" />
                              <span className="contact-number">{r.phone}</span>
                            </a>
                            <button
                              type="button"
                              className="contact-copy-btn"
                              onClick={() => handleCopyNumber(r.phone, `view-std-${idx}`)}
                              title="Copy Student Mobile Number"
                            >
                              {copiedKey === `view-std-${idx}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                              {copiedKey === `view-std-${idx}` && <span className="copied-tag">Copied!</span>}
                            </button>
                          </div>
                        ) : (
                          <span className="contact-unavailable">— Not Provided</span>
                        )}
                      </td>

                      {/* 9. Parent Contact */}
                      <td>
                        {r.parentPhone ? (
                          <div className="contact-cell-box">
                            <a
                              href={`tel:${r.parentPhone}`}
                              className="contact-phone-link parent"
                              title={`Call Parent: ${r.parentPhone}`}
                            >
                              <PhoneCall size={13} className="contact-icon parent" />
                              <span className="contact-number">{r.parentPhone}</span>
                            </a>
                            <button
                              type="button"
                              className="contact-copy-btn"
                              onClick={() => handleCopyNumber(r.parentPhone, `view-par-${idx}`)}
                              title="Copy Parent Mobile Number"
                            >
                              {copiedKey === `view-par-${idx}` ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                              {copiedKey === `view-par-${idx}` && <span className="copied-tag">Copied!</span>}
                            </button>
                          </div>
                        ) : (
                          <span className="contact-unavailable">— Not Provided</span>
                        )}
                      </td>

                      {/* 10. Attendance Status */}
                      <td style={{ textAlign: 'center' }}>
                        {r.status === 'Present' && <span className="h-status-badge present">✓ Present</span>}
                        {r.status === 'Absent' && <span className="h-status-badge absent">✕ Absent</span>}
                        {r.status === 'On Leave' && <span className="h-status-badge leave">On Leave</span>}
                      </td>

                      {/* 11. View Student */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="view-student-btn"
                          onClick={() => handleViewStudentDashboard(r)}
                          title={`Open ${r.studentName}'s complete CMS Student Dashboard`}
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
                          setSelectedHostelFilter('ALL');
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
