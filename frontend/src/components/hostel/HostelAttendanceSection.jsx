import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Eye,
  Check,
  X
} from 'lucide-react';
import { mockHostelAttendanceList, mockHostelCorrectionRequests } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelAttendanceSection() {
  const [attendanceDate, setAttendanceDate] = useState('2026-10-19');
  const [selectedHostel, setSelectedHostel] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('daily-roll'); // 'daily-roll' | 'corrections' | 'repeated-absence'
  const [attendanceData, setAttendanceData] = useState(mockHostelAttendanceList);
  const [correctionRequests, setCorrectionRequests] = useState(mockHostelCorrectionRequests);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = attendanceData.length;
    const present = attendanceData.filter(a => a.status === 'Present').length;
    const absent = attendanceData.filter(a => a.status === 'Absent').length;
    const onLeave = attendanceData.filter(a => a.status === 'On Leave').length;
    const notRecorded = attendanceData.filter(a => a.status === 'Not Recorded').length;
    const repeatedAbsentees = attendanceData.filter(a => a.consecutiveAbsences >= 3).length;
    return { total, present, absent, onLeave, notRecorded, repeatedAbsentees };
  }, [attendanceData]);

  // Filtered List
  const filteredList = useMemo(() => {
    return attendanceData.filter(item => {
      const matchHostel = selectedHostel === 'ALL' || item.hostelName.toLowerCase().includes(selectedHostel.toLowerCase());
      const matchRoom = selectedRoom === 'ALL' || item.roomNumber === selectedRoom;
      const matchSearch = !searchQuery ||
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchHostel && matchRoom && matchSearch;
    });
  }, [attendanceData, selectedHostel, selectedRoom, searchQuery]);

  // Quick mark status
  const handleStatusChange = (id, newStatus) => {
    setAttendanceData(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          checkInTime: newStatus === 'Present' ? '08:45 PM' : (newStatus === 'Absent' ? '--:--' : item.checkInTime),
          biometricVerified: newStatus === 'Present'
        };
      }
      return item;
    }));
    showToast(`Updated attendance status to ${newStatus}`);
  };

  // Correction Action
  const handleCorrectionAction = (id, newStatus) => {
    setCorrectionRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`Correction request ${id} ${newStatus.toLowerCase()} successfully`);
  };

  return (
    <div className="hostel-section-container">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Users size={24} color="#2563eb" /> Hostel Night Attendance Management</h2>
          <p>Real-time Biometric Check-in Verification · Curfew Compliance · Consecutive Absence Alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>
            <Calendar size={15} color="#2563eb" />
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: '#0f172a' }}
            />
          </div>
          <button
            className="h-btn h-btn-secondary"
            onClick={() => {
              setAttendanceData(mockHostelAttendanceList);
              showToast('Attendance refreshed from biometric logs.');
            }}
          >
            <RotateCcw size={14} /> Sync Device Logs
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Users size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{stats.total}</span>
            <span className="hostel-kpi-title">Total Residents</span>
            <span className="hostel-kpi-subtitle">Enrolled in 3 Blocks</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><UserCheck size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>{stats.present}</span>
            <span className="hostel-kpi-title">Present In Hostel</span>
            <span className="hostel-kpi-subtitle">Biometric Verified</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose"><UserX size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#e11d48' }}>{stats.absent}</span>
            <span className="hostel-kpi-title">Absent Tonight</span>
            <span className="hostel-kpi-subtitle">Unreported absence</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>{stats.notRecorded}</span>
            <span className="hostel-kpi-title">Not Recorded</span>
            <span className="hostel-kpi-subtitle">Pending Floor Swipe</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><AlertTriangle size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#7c3aed' }}>{stats.repeatedAbsentees}</span>
            <span className="hostel-kpi-title">Repeated Absences</span>
            <span className="hostel-kpi-subtitle">≥3 Nights Missing</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="hostel-tab-pills">
        <button
          className={`hostel-tab-pill ${activeSubTab === 'daily-roll' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('daily-roll')}
        >
          <FileText size={14} /> Daily Resident Roll ({filteredList.length})
        </button>
        <button
          className={`hostel-tab-pill ${activeSubTab === 'repeated-absence' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('repeated-absence')}
        >
          <AlertTriangle size={14} /> Repeated Absence Alerts ({stats.repeatedAbsentees})
        </button>
        <button
          className={`hostel-tab-pill ${activeSubTab === 'corrections' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('corrections')}
        >
          <RotateCcw size={14} /> Correction Requests ({correctionRequests.filter(c => c.status === 'Pending').length})
        </button>
      </div>

      {/* SUB-TAB 1: DAILY RESIDENT ROLL */}
      {activeSubTab === 'daily-roll' && (
        <>
          <div className="hostel-filter-strip">
            <div className="hostel-filter-group">
              <div className="hostel-search-input">
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search resident name or registration number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="hostel-select"
                value={selectedHostel}
                onChange={e => setSelectedHostel(e.target.value)}
              >
                <option value="ALL">All Hostels &amp; Blocks</option>
                <option value="Gandhi">Gandhi Boys Residence</option>
                <option value="Kalam">Kalam Boys Residence</option>
                <option value="Sarojini">Sarojini Girls Residence</option>
              </select>

              <select
                className="hostel-select"
                value={selectedRoom}
                onChange={e => setSelectedRoom(e.target.value)}
              >
                <option value="ALL">All Rooms</option>
                <option value="101">Room 101</option>
                <option value="102">Room 102</option>
                <option value="103">Room 103</option>
                <option value="105">Room 105</option>
                <option value="106">Room 106</option>
                <option value="201">Room 201</option>
                <option value="204">Room 204</option>
              </select>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Showing {filteredList.length} of {attendanceData.length} boarders
            </div>
          </div>

          <div className="hostel-table-container">
            <div className="hostel-table-scroll">
              <table className="hostel-data-table">
                <thead>
                  <tr>
                    <th>Resident / Roll</th>
                    <th>Hostel &amp; Room</th>
                    <th>Biometric Time</th>
                    <th>Current Status</th>
                    <th>Consecutive Absences</th>
                    <th style={{ textAlign: 'center' }}>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No resident attendance records matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map(item => {
                      const isAlert = item.consecutiveAbsences >= 3;
                      return (
                        <tr key={item.id} style={{ background: isAlert ? '#fff9f9' : 'transparent' }}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.studentName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {item.rollNumber}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.hostelName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                              Room {item.roomNumber} · {item.bedNumber}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                              <Clock size={13} color={item.biometricVerified ? '#059669' : '#94a3b8'} />
                              {item.checkInTime}
                            </div>
                            {item.biometricVerified && (
                              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                                ✓ Biometric Verified
                              </span>
                            )}
                          </td>
                          <td>
                            {item.status === 'Present' && <span className="h-badge h-badge-present">✓ Present</span>}
                            {item.status === 'Absent' && <span className="h-badge h-badge-absent">✕ Absent</span>}
                            {item.status === 'On Leave' && <span className="h-badge h-badge-leave">On Approved Leave</span>}
                            {item.status === 'Late Check-in' && <span className="h-badge h-badge-late">⚠️ Late Curfew</span>}
                            {item.status === 'Not Recorded' && <span className="h-badge h-badge-low">Pending Swipe</span>}
                          </td>
                          <td>
                            {item.consecutiveAbsences > 0 ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: isAlert ? '#fee2e2' : '#fef3c7',
                                color: isAlert ? '#991b1b' : '#92400e',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800
                              }}>
                                <AlertTriangle size={12} />
                                {item.consecutiveAbsences} {item.consecutiveAbsences === 1 ? 'Night' : 'Nights'} Missing
                              </span>
                            ) : (
                              <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}>Consistent</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                              <button
                                className="h-btn h-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="View attendance history"
                                onClick={() => setSelectedStudentHistory(item)}
                              >
                                <Eye size={13} /> History
                              </button>
                              <button
                                className="h-btn"
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.74rem',
                                  background: item.status === 'Present' ? '#fee2e2' : '#ecfdf5',
                                  color: item.status === 'Present' ? '#991b1b' : '#065f46',
                                  border: `1px solid ${item.status === 'Present' ? '#fca5a5' : '#a7f3d0'}`
                                }}
                                onClick={() => handleStatusChange(item.id, item.status === 'Present' ? 'Absent' : 'Present')}
                              >
                                {item.status === 'Present' ? 'Mark Absent' : 'Mark Present'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: REPEATED ABSENCE ALERTS */}
      {activeSubTab === 'repeated-absence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="#e11d48" />
            <div>
              <div style={{ fontWeight: 800, color: '#9f1239', fontSize: '0.92rem' }}>
                High Priority: Boarders Missing for ≥ 3 Consecutive Nights
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#be123c' }}>
                As per BPUT Hostel Code Section 4.2, students absent for 3 consecutive roll-calls without approved gate pass must be flagged to parents and Dean Student Welfare immediately.
              </p>
            </div>
          </div>

          <div className="hostel-cards-grid">
            {attendanceData.filter(a => a.consecutiveAbsences >= 3).map(student => (
              <div key={student.id} className="hostel-item-card" style={{ borderColor: '#fca5a5', borderLeft: '4px solid #e11d48' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>{student.studentName}</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Reg: {student.rollNumber}</p>
                  </div>
                  <span className="h-badge h-badge-urgent">
                    {student.consecutiveAbsences} Nights Absent
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div><strong>Hostel:</strong> {student.hostelName}</div>
                  <div><strong>Room:</strong> {student.roomNumber} ({student.bedNumber})</div>
                  <div><strong>Last Seen:</strong> 15 Oct, 08:15 PM</div>
                  <div><strong>Gate Pass:</strong> None Active</div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#991b1b', background: '#fef2f2', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                  <strong>Warden Action Note:</strong> {student.alertNote}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    className="h-btn h-btn-primary"
                    style={{ flex: 1, fontSize: '0.78rem' }}
                    onClick={() => showToast(`Automated SMS sent to parents of ${student.studentName}`)}
                  >
                    Alert Parents (SMS)
                  </button>
                  <button
                    className="h-btn h-btn-secondary"
                    style={{ flex: 1, fontSize: '0.78rem' }}
                    onClick={() => showToast(`Escalated incident to DSW Office for ${student.studentName}`)}
                  >
                    Report to DSW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CORRECTION REQUESTS */}
      {activeSubTab === 'corrections' && (
        <div className="hostel-table-container">
          <div className="hostel-table-scroll">
            <table className="hostel-data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student / Roll</th>
                  <th>Date</th>
                  <th>Discrepancy Reason &amp; Proof</th>
                  <th>Requested Change</th>
                  <th>Review Status</th>
                  <th style={{ textAlign: 'center' }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {correctionRequests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{req.id}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{req.studentName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{req.rollNumber}</div>
                    </td>
                    <td>{req.date}</td>
                    <td>
                      <div style={{ fontSize: '0.84rem', color: '#0f172a' }}>{req.reason}</div>
                      <div style={{ fontSize: '0.74rem', color: '#059669', fontStyle: 'italic', marginTop: '2px' }}>
                        Proof: {req.proofNote}
                      </div>
                    </td>
                    <td>
                      <span className="h-badge h-badge-present">→ {req.requestedStatus}</span>
                    </td>
                    <td>
                      {req.status === 'Pending' && <span className="h-badge h-badge-pending">Pending Review</span>}
                      {req.status === 'Approved' && <span className="h-badge h-badge-approved">Approved</span>}
                      {req.status === 'Rejected' && <span className="h-badge h-badge-rejected">Rejected</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            className="h-btn h-btn-success"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleCorrectionAction(req.id, 'Approved')}
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            className="h-btn h-btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleCorrectionAction(req.id, 'Rejected')}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Decision Recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: RESIDENT ATTENDANCE HISTORY */}
      {selectedStudentHistory && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStudentHistory(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Attendance Log · {selectedStudentHistory.studentName}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedStudentHistory.hostelName} · Room {selectedStudentHistory.roomNumber}
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedStudentHistory(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div><strong>Monthly Average:</strong> 93.4%</div>
                <div><strong>Consecutive Absence:</strong> {selectedStudentHistory.consecutiveAbsences}</div>
                <div><strong>Curfew Violations:</strong> 0</div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem' }}>
                Recent Biometric Check-in Log (Past 5 Days):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { d: '19 Oct 2026', t: selectedStudentHistory.checkInTime, s: selectedStudentHistory.status },
                  { d: '18 Oct 2026', t: '08:24 PM', s: 'Present' },
                  { d: '17 Oct 2026', t: '08:15 PM', s: 'Present' },
                  { d: '16 Oct 2026', t: '08:30 PM', s: 'Present' },
                  { d: '15 Oct 2026', t: '08:12 PM', s: 'Present' }
                ].map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem' }}>
                    <div><strong>{log.d}</strong></div>
                    <div style={{ color: '#64748b' }}>Time: {log.t}</div>
                    <div>
                      {log.s === 'Present' && <span className="h-badge h-badge-present">Present</span>}
                      {log.s === 'Absent' && <span className="h-badge h-badge-absent">Absent</span>}
                      {log.s === 'On Leave' && <span className="h-badge h-badge-leave">On Leave</span>}
                      {log.s === 'Late Check-in' && <span className="h-badge h-badge-late">Late Check-in</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="h-btn h-btn-primary" onClick={() => setSelectedStudentHistory(null)}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
