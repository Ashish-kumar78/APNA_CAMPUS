import React, { useState, useMemo } from 'react';
import {
  Clock, CheckCircle2, AlertTriangle, ShieldCheck, Search, Filter,
  Calendar, RotateCcw, Edit2, Eye, Download, Users, Check, X
} from 'lucide-react';
import './HostelAdminDashboard.css';

import {
  getSubmittedAttendances,
  updateHostelAttendance,
  getAllHostels
} from '../../../services/hostelAttendanceStore.js';
import { logAdminAction } from '../../../services/wardenManagementStore.js';

export default function HostelAdminAttendanceVerification({ account, showToast }) {
  const [attendances, setAttendances] = useState(() => getSubmittedAttendances());
  const [hostels] = useState(() => getAllHostels());

  const [selectedHostel, setSelectedHostel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected session for detailed inspection & override
  const [inspectSession, setInspectSession] = useState(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('Present');
  const [overrideReason, setOverrideReason] = useState('Hospital medical slip verified with guardian');

  const reloadData = () => {
    setAttendances(getSubmittedAttendances());
  };

  const filteredList = useMemo(() => {
    return attendances.filter(att => {
      const matchHostel = selectedHostel === 'ALL' || att.hostelName === selectedHostel;
      const matchStatus = selectedStatus === 'ALL' || att.status === selectedStatus || att.verificationStatus === selectedStatus;
      const matchSearch =
        att.hostelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (att.submittedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchHostel && matchStatus && matchSearch;
    });
  }, [attendances, selectedHostel, selectedStatus, searchTerm]);

  // Certify Session by Admin
  const handleCertifySession = (session) => {
    const adminName = account?.name ? `${account.name} (Hostel Admin)` : 'Chief Administrator';
    updateHostelAttendance(session.id, {
      status: 'Verified',
      verificationStatus: 'Admin Certified',
      verifiedBy: adminName,
      verifiedAt: new Date().toISOString()
    });

    logAdminAction({
      action: 'ATTENDANCE_CERTIFICATION',
      targetEntity: 'HostelAttendanceSession',
      recordId: session.id,
      hostelScope: session.hostelName,
      previousValue: `Status: ${session.status}`,
      newValue: 'Status: Verified & Certified',
      reason: 'Roll call records verified by Hostel Admin desk.',
      actingUser: adminName
    });

    reloadData();
    if (inspectSession?.id === session.id) {
      setInspectSession(prev => ({ ...prev, status: 'Verified', verificationStatus: 'Admin Certified' }));
    }
    if (showToast) showToast(`✓ Attendance for ${session.hostelName} (${session.date}) officially certified.`);
  };

  // Submit Student Attendance Override
  const handleConfirmOverride = (e) => {
    e.preventDefault();
    if (!inspectSession || !targetStudent) return;

    const adminName = account?.name ? `${account.name} (Hostel Admin)` : 'Chief Administrator';
    const prevStatus = targetStudent.status || 'Absent';

    // Update attendance record roster in session
    const updatedRecords = (inspectSession.records || []).map(r => {
      if (r.rollNumber === targetStudent.rollNumber) {
        return {
          ...r,
          status: overrideStatus,
          correctedBy: adminName,
          correctedAt: new Date().toISOString(),
          correctionReason: overrideReason
        };
      }
      return r;
    });

    // Recalculate present / absent counts
    const presentCount = updatedRecords.filter(r => r.status === 'Present').length;
    const absentCount = updatedRecords.filter(r => r.status === 'Absent').length;
    const onLeaveCount = updatedRecords.filter(r => r.status === 'Leave' || r.status === 'On Approved Leave').length;
    const turnout = Math.round((presentCount / (updatedRecords.length || 1)) * 100);

    updateHostelAttendance(inspectSession.id, {
      records: updatedRecords,
      presentCount,
      absentCount,
      onLeaveCount,
      turnout,
      lastModifiedBy: adminName
    });

    // Log in Audit Trail
    logAdminAction({
      action: 'ATTENDANCE_RECORD_OVERRIDE',
      targetEntity: 'StudentAttendanceRecord',
      recordId: `${inspectSession.id}-${targetStudent.rollNumber}`,
      hostelScope: inspectSession.hostelName,
      previousValue: `Roll ${targetStudent.rollNumber} (${targetStudent.name}): ${prevStatus}`,
      newValue: `Roll ${targetStudent.rollNumber} (${targetStudent.name}): ${overrideStatus}`,
      reason: overrideReason,
      actingUser: adminName
    });

    reloadData();
    setInspectSession(prev => ({
      ...prev,
      records: updatedRecords,
      presentCount,
      absentCount,
      onLeaveCount,
      turnout
    }));
    setIsOverrideModalOpen(false);
    setTargetStudent(null);
    if (showToast) {
      showToast(`✓ Attendance corrected for ${targetStudent.name}: ${overrideStatus}`);
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            Attendance Verification &amp; Override Desk
            <span className="had-title-badge">Curfew Audit</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Inspect warden roll-call submissions, compare biometric turnout, officially certify attendance, or execute authorized corrections with mandatory audit reasons.
          </p>
        </div>
        <button className="had-btn had-btn-secondary" onClick={reloadData}>
          <RotateCcw size={14} /> Refresh Sessions
        </button>
      </div>

      {/* Filter Bar */}
      <div className="had-filter-bar">
        <div className="wm-search-box" style={{ width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by hostel or warden..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="had-filter-group">
          <Filter size={15} color="#7c3aed" />
          <span>Hostel:</span>
          <select className="had-filter-select" value={selectedHostel} onChange={e => setSelectedHostel(e.target.value)}>
            <option value="ALL">All Residential Complexes</option>
            {hostels.map(h => (
              <option key={h.id} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="had-filter-group">
          <span>Status:</span>
          <select className="had-filter-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Pending Verification</option>
            <option value="Verified">Verified &amp; Certified</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: inspectSession ? '1fr 1.2fr' : '1fr', gap: '1.25rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="had-table">
            <thead>
              <tr>
                <th>Session &amp; Date</th>
                <th>Hostel Complex</th>
                <th>Submitted By</th>
                <th>Turnout</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(session => (
                <tr
                  key={session.id}
                  style={{
                    background: inspectSession?.id === session.id ? '#ede9fe' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => setInspectSession(session)}
                >
                  <td>
                    <strong>{session.date}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{session.session || 'Night Roll Call'}</div>
                  </td>
                  <td>
                    <strong>{session.hostelName}</strong>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: #{session.id}</div>
                  </td>
                  <td>{session.submittedBy}</td>
                  <td>
                    <strong>{session.presentCount} / {session.totalStudents}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>{session.turnout}%</div>
                  </td>
                  <td>
                    <span className={`had-badge ${session.status === 'Verified' ? 'success' : 'warning'}`}>
                      {session.status || 'Submitted'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="had-btn had-btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectSession(session);
                      }}
                    >
                      <Eye size={12} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Inspector Pane */}
        {inspectSession && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                  Session Inspector: {inspectSession.hostelName} ({inspectSession.date})
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Submitted by {inspectSession.submittedBy} · {inspectSession.presentCount} Present, {inspectSession.absentCount} Absent
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {inspectSession.status !== 'Verified' && (
                  <button
                    className="had-btn had-btn-primary"
                    style={{ background: '#059669', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => handleCertifySession(inspectSession)}
                  >
                    <CheckCircle2 size={14} /> Certify Session
                  </button>
                )}
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setInspectSession(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Student Records List */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '520px' }}>
              <table className="had-table">
                <thead>
                  <tr>
                    <th>Roll &amp; Student</th>
                    <th>Room</th>
                    <th>Recorded Status</th>
                    <th>Admin Override</th>
                  </tr>
                </thead>
                <tbody>
                  {(inspectSession.records && inspectSession.records.length > 0
                    ? inspectSession.records
                    : [
                        { rollNumber: '2305200001', name: 'Rakesh Das', roomNumber: '101', status: 'Present' },
                        { rollNumber: '2305200002', name: 'Amit Nayak', roomNumber: '102', status: 'Absent' },
                        { rollNumber: '2305200005', name: 'Sourav Mohanty', roomNumber: '201', status: 'Leave' },
                        { rollNumber: '2305200008', name: 'Tanmay Tripathy', roomNumber: '103', status: 'Present' }
                      ]
                  ).map(st => (
                    <tr key={st.rollNumber}>
                      <td>
                        <strong>{st.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Roll: {st.rollNumber}</div>
                      </td>
                      <td>Room {st.roomNumber}</td>
                      <td>
                        <span className={`had-badge ${st.status === 'Present' ? 'success' : st.status === 'Absent' ? 'danger' : 'info'}`}>
                          {st.status}
                        </span>
                        {st.correctionReason && (
                          <div style={{ fontSize: '0.68rem', color: '#7c3aed', marginTop: '0.2rem' }}>
                            Corrected: {st.correctionReason}
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                          onClick={() => {
                            setTargetStudent(st);
                            setOverrideStatus(st.status === 'Present' ? 'Absent' : 'Present');
                            setIsOverrideModalOpen(true);
                          }}
                        >
                          <Edit2 size={11} /> Correct
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* OVERRIDE MODAL */}
      {isOverrideModalOpen && targetStudent && (
        <div className="wm-modal-backdrop" onClick={() => setIsOverrideModalOpen(false)}>
          <div className="wm-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                Administrative Attendance Correction
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setIsOverrideModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmOverride}>
              <div className="wm-modal-body">
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <strong>{targetStudent.name}</strong> (Roll: {targetStudent.rollNumber}) · Room {targetStudent.roomNumber}
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Currently Marked: <strong>{targetStudent.status}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="wm-form-label">Corrected Status *</label>
                  <select
                    className="wm-form-select"
                    value={overrideStatus}
                    onChange={e => setOverrideStatus(e.target.value)}
                    required
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="On Approved Leave">On Approved Leave</option>
                    <option value="Official Duty / OD">Official Duty / OD</option>
                  </select>
                </div>

                <div>
                  <label className="wm-form-label">Mandatory Administrative Reason *</label>
                  <textarea
                    rows={3}
                    className="wm-form-textarea"
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    required
                    placeholder="Document mandatory reason (e.g., Parent confirmation verified, medical emergency)..."
                  />
                </div>
              </div>
              <div className="wm-modal-footer">
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  onClick={() => setIsOverrideModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="had-btn had-btn-primary">
                  Save Correction &amp; Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

