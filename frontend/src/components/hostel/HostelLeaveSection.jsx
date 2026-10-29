import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Phone,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  FileText,
  RotateCcw,
  Check,
  X,
  Eye,
  ArrowRight,
  AlertTriangle,
  Send,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import {
  getAllResidentLeaves,
  approveResidentLeave,
  rejectResidentLeave,
  markResidentReturned
} from '../../services/hostelResidentLeaveStore.js';
import './HostelExtraSections.css';

const PRESET_REJECTION_REASONS = [
  'Parent / Guardian telephonic consent could not be verified by hostel office.',
  'Upcoming internal mid-semester examinations and scheduled laboratory evaluations.',
  'Disciplinary curfew violation / attendance shortage recorded in current term.',
  'Incomplete outstation transit address and department mentor recommendation missing.',
  'Outstation duration exceeds maximum permissible consecutive days per hostel rules.'
];

export default function HostelLeaveSection({ onNavigateApplyLeave, account, isHostelAdmin: propIsHostelAdmin }) {
  const [leaves, setLeaves] = useState(() => getAllResidentLeaves());
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'Approved' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaveModal, setSelectedLeaveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Rejection modal states
  const [rejectModalTarget, setRejectModalTarget] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const isHostelAdmin = typeof propIsHostelAdmin === 'boolean'
    ? propIsHostelAdmin
    : Boolean(
        account?.role === 'hostel_admin' ||
        account?.role === 'admin' ||
        account?.role === 'super_admin' ||
        account?.identity === 'WRD-ADM-01' ||
        account?.detail?.toLowerCase().includes('administrator')
      );

  // Listen to storage events for real-time synchronization with Student Portal
  useEffect(() => {
    const handleSync = () => {
      setLeaves(getAllResidentLeaves());
    };
    window.addEventListener('bput_hostel_leaves_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bput_hostel_leaves_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query ||
        l.studentName.toLowerCase().includes(query) ||
        l.rollNumber.toLowerCase().includes(query) ||
        l.hostelName.toLowerCase().includes(query);
      return matchStatus && matchSearch;
    });
  }, [leaves, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'Pending').length,
      approved: leaves.filter(l => l.status === 'Approved').length,
      rejected: leaves.filter(l => l.status === 'Rejected').length,
      currentlyAway: leaves.filter(l => l.status === 'Approved' && !l.returned).length
    };
  }, [leaves]);

  const handleApprove = (id) => {
    const submitterName = account?.name
      ? `${account.name} (${isHostelAdmin ? 'Hostel Admin' : 'Resident Warden'})`
      : 'Mr. Rajesh Jena (Resident Warden)';

    const updated = approveResidentLeave(id, submitterName);
    setLeaves(updated);
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(updated.find(l => l.id === id));
    }
    showToast(`✓ Leave application ${id} approved successfully`);
  };

  const handleInitiateReject = (leave) => {
    setRejectModalTarget(leave);
    setRejectionReasonText('');
    setRejectionError('');
  };

  const handleConfirmReject = () => {
    if (!rejectionReasonText.trim()) {
      setRejectionError('Please provide a specific reason for rejection to inform the student.');
      return;
    }

    const submitterName = account?.name
      ? `${account.name} (${isHostelAdmin ? 'Hostel Admin' : 'Resident Warden'})`
      : 'Mr. Rajesh Jena (Resident Warden)';

    const updated = rejectResidentLeave({
      leaveId: rejectModalTarget.id,
      reason: rejectionReasonText.trim(),
      rejectedBy: submitterName
    });

    setLeaves(updated);
    if (selectedLeaveModal?.id === rejectModalTarget.id) {
      setSelectedLeaveModal(updated.find(l => l.id === rejectModalTarget.id));
    }

    const studentName = rejectModalTarget.studentName;
    const leaveId = rejectModalTarget.id;
    setRejectModalTarget(null);
    showToast(`✓ Leave application ${leaveId} rejected. Reason recorded and notified to ${studentName}.`);
  };

  const handleMarkReturned = (id) => {
    const updated = markResidentReturned(id);
    setLeaves(updated);
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(updated.find(l => l.id === id));
    }
    showToast(`✓ Student recorded as returned to hostel`);
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
          <h2><Calendar size={24} color="#2563eb" /> Hostel Resident Leave Management</h2>
          <p>Overnight Outstation Leaves · Parent/Guardian Consent Verification · Return Confirmation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {onNavigateApplyLeave && (
            <button
              className="h-btn h-btn-primary"
              onClick={onNavigateApplyLeave}
              title="Apply Staff / Warden Leave & View Institutional Guidelines"
            >
              <CalendarCheck size={14} /> Apply Staff Leave &amp; Rules
            </button>
          )}
          <button
            className="h-btn h-btn-secondary"
            onClick={() => {
              setLeaves(getAllResidentLeaves());
              showToast('Leave queue synchronized');
            }}
          >
            <RotateCcw size={14} /> Refresh Requests
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Calendar size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{stats.total}</span>
            <span className="hostel-kpi-title">Total Applications</span>
            <span className="hostel-kpi-subtitle">Current Academic Term</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>{stats.pending}</span>
            <span className="hostel-kpi-title">Awaiting Approval</span>
            <span className="hostel-kpi-subtitle">Requires Warden Sign-off</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>{stats.approved}</span>
            <span className="hostel-kpi-title">Sanctioned Leaves</span>
            <span className="hostel-kpi-subtitle">Guardian Confirmed</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><UserCheck size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#7c3aed' }}>{stats.currentlyAway}</span>
            <span className="hostel-kpi-title">Currently Outstation</span>
            <span className="hostel-kpi-subtitle">Expected to Return</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose"><XCircle size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#e11d48' }}>{stats.rejected}</span>
            <span className="hostel-kpi-title">Rejected</span>
            <span className="hostel-kpi-subtitle">With Specified Reason</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group">
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search resident name, reg number, or hostel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hostel-tab-pills">
            {['ALL', 'Pending', 'Approved', 'Rejected'].map(s => (
              <button
                key={s}
                className={`hostel-tab-pill ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'ALL' ? 'All Leaves' : s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredLeaves.length} records
        </div>
      </div>

      {/* Table */}
      <div className="hostel-table-container">
        <div className="hostel-table-scroll">
          <table className="hostel-data-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Student / Roll</th>
                <th>Hostel &amp; Room</th>
                <th>Leave Duration</th>
                <th>Reason</th>
                <th>Guardian Verification</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No leave applications matching selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{leave.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{leave.studentName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {leave.rollNumber}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>📞 {leave.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{leave.hostelName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#475569' }}>Room {leave.roomNumber}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {leave.startDate} → {leave.endDate}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                        {leave.days} Days Total
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem', maxWidth: '240px', color: '#334155' }}>
                        {leave.reason}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                        {leave.guardianName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{leave.guardianPhone}</div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: leave.guardianStatus?.includes('Verified') ? '#059669' : '#d97706',
                        marginTop: '2px'
                      }}>
                        ● {leave.guardianStatus}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Pending' && <span className="h-badge h-badge-pending">Pending Review</span>}
                      {leave.status === 'Approved' && (
                        <div>
                          <span className="h-badge h-badge-approved">Approved</span>
                          <div style={{ marginTop: '4px' }}>
                            {leave.returned ? (
                              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>✓ Returned</span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 700 }}>⏳ Away</span>
                            )}
                          </div>
                        </div>
                      )}
                      {leave.status === 'Rejected' && (
                        <div>
                          <span className="h-badge h-badge-rejected">Rejected</span>
                          {leave.rejectionReason && (
                            <div className="leave-rejection-chip" title={leave.rejectionReason}>
                              <AlertCircle size={11} color="#e11d48" style={{ flexShrink: 0 }} />
                              <span><strong>Reason:</strong> {leave.rejectionReason}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          className="h-btn h-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => setSelectedLeaveModal(leave)}
                        >
                          <Eye size={13} /> View
                        </button>
                        {leave.status === 'Pending' && (
                          <>
                            <button
                              className="h-btn h-btn-success"
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                              onClick={() => handleApprove(leave.id)}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              className="h-btn h-btn-danger"
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                              onClick={() => handleInitiateReject(leave)}
                              title="Reject leave and mention reason"
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                        {leave.status === 'Approved' && !leave.returned && (
                          <button
                            className="h-btn h-btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleMarkReturned(leave.id)}
                          >
                            Mark Returned
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW DETAILS */}
      {selectedLeaveModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedLeaveModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Leave Dossier · {selectedLeaveModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Applied On {selectedLeaveModal.appliedOn} · BPUT Student Resident Welfare
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedLeaveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Student Name:</strong> {selectedLeaveModal.studentName}</div>
                <div><strong>Registration:</strong> {selectedLeaveModal.rollNumber}</div>
                <div><strong>Hostel:</strong> {selectedLeaveModal.hostelName}</div>
                <div><strong>Room No:</strong> {selectedLeaveModal.roomNumber}</div>
                <div><strong>Contact:</strong> {selectedLeaveModal.phone}</div>
                <div><strong>Total Duration:</strong> {selectedLeaveModal.days} Days ({selectedLeaveModal.startDate} to {selectedLeaveModal.endDate})</div>
              </div>

              {/* If Rejected: Prominent Rejection Card showing Reason */}
              {selectedLeaveModal.status === 'Rejected' && (
                <div className="modal-rejection-card">
                  <div className="rejection-card-head">
                    <XCircle size={18} color="#e11d48" />
                    <strong>Leave Application Rejected by Hostel Office</strong>
                  </div>
                  <div className="rejection-card-body">
                    <span className="reason-label">Reason Stated by Warden / Admin:</span>
                    <p className="reason-quote">
                      "{selectedLeaveModal.rejectionReason || 'Parent/Guardian telephonic consent could not be verified by hostel office.'}"
                    </p>
                    <div className="rejection-meta">
                      <span>Decided by: <strong>{selectedLeaveModal.rejectedBy || 'Resident Warden'}</strong></span>
                      <span>•</span>
                      <span>Date: <strong>{selectedLeaveModal.rejectedAt || selectedLeaveModal.appliedOn}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Declared Purpose of Leave
                </div>
                <div style={{ fontSize: '0.88rem', color: '#0f172a' }}>{selectedLeaveModal.reason}</div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Parent / Guardian Verification Note
                </div>
                <div style={{ fontSize: '0.84rem', color: '#14532d' }}>
                  <strong>{selectedLeaveModal.guardianName}</strong> ({selectedLeaveModal.guardianPhone})
                  <div style={{ marginTop: '3px' }}>Status: {selectedLeaveModal.guardianStatus}</div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              {selectedLeaveModal.status === 'Pending' && (
                <>
                  <button className="h-btn h-btn-danger" onClick={() => handleInitiateReject(selectedLeaveModal)}>
                    <X size={14} /> Reject Application
                  </button>
                  <button className="h-btn h-btn-success" onClick={() => handleApprove(selectedLeaveModal.id)}>
                    <Check size={14} /> Sanction Leave
                  </button>
                </>
              )}
              {selectedLeaveModal.status === 'Approved' && !selectedLeaveModal.returned && (
                <button className="h-btn h-btn-primary" onClick={() => handleMarkReturned(selectedLeaveModal.id)}>
                  Mark Student Returned
                </button>
              )}
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedLeaveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MENTION REASON FOR REJECTION */}
      {rejectModalTarget && (
        <div className="reject-modal-backdrop" onClick={() => setRejectModalTarget(null)}>
          <div className="reject-modal-card" onClick={e => e.stopPropagation()}>
            <div className="reject-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="reject-icon-badge">
                  <ShieldAlert size={20} color="#e11d48" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                    Reject Leave Application
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Application ID: <strong>{rejectModalTarget.id}</strong> · Student: <strong>{rejectModalTarget.studentName}</strong>
                  </p>
                </div>
              </div>
              <button className="admin-table-action-btn" onClick={() => setRejectModalTarget(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="reject-modal-body">
              {/* Application Details Summary */}
              <div className="reject-summary-banner">
                <div className="summary-col">
                  <span className="lbl">Student:</span>
                  <strong>{rejectModalTarget.studentName} ({rejectModalTarget.rollNumber})</strong>
                </div>
                <div className="summary-col">
                  <span className="lbl">Residence:</span>
                  <strong>{rejectModalTarget.hostelName} · Room {rejectModalTarget.roomNumber}</strong>
                </div>
                <div className="summary-col">
                  <span className="lbl">Duration:</span>
                  <strong>{rejectModalTarget.startDate} to {rejectModalTarget.endDate} ({rejectModalTarget.days} Days)</strong>
                </div>
                <div className="summary-col">
                  <span className="lbl">Student's Stated Reason:</span>
                  <span style={{ color: '#334155' }}>"{rejectModalTarget.reason}"</span>
                </div>
              </div>

              {/* Mandatory Rejection Reason Input */}
              <div className="reject-input-group">
                <label className="reject-label">
                  Mention Rejection Reason *
                  <span className="reject-subtext">This specific reason will be displayed directly to the student on their portal</span>
                </label>
                <textarea
                  className="reject-textarea"
                  rows={4}
                  placeholder="Specify the reason why this leave cannot be granted (e.g. Parent consent not verified over phone call, upcoming exams, attendance shortage, etc.)..."
                  value={rejectionReasonText}
                  onChange={e => {
                    setRejectionReasonText(e.target.value);
                    setRejectionError('');
                  }}
                />

                {rejectionError && (
                  <div className="reject-error-msg">
                    <AlertCircle size={14} /> {rejectionError}
                  </div>
                )}
              </div>

              {/* Quick Preset Reason Chips */}
              <div className="reject-presets-wrap">
                <span className="presets-label">Quick Suggestion Chips (Click to fill):</span>
                <div className="presets-chips">
                  {PRESET_REJECTION_REASONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-chip-btn"
                      onClick={() => {
                        setRejectionReasonText(preset);
                        setRejectionError('');
                      }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="reject-modal-footer">
              <button
                type="button"
                className="h-btn h-btn-secondary"
                onClick={() => setRejectModalTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-btn h-btn-danger"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                onClick={handleConfirmReject}
              >
                <X size={15} /> Confirm &amp; Reject Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
