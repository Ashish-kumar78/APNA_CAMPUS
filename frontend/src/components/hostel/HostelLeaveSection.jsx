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
  ShieldAlert,
  Building,
  Trash2,
  Edit3
} from 'lucide-react';
import {
  getAllResidentLeaves,
  approveResidentLeave,
  rejectResidentLeave,
  markResidentReturned,
  fetchResidentLeavesFromBackend,
  normalizeLeaveStatus,
  deleteResidentLeave,
  updateResidentLeave
} from '../../services/hostelResidentLeaveStore.js';
import { isWardenSuspended, getWardenPermissions, getWardenIdFromAccount, getWardenAssignedHostel } from '../../services/wardenManagementStore.js';
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
  const [hostelFilter, setHostelFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaveModal, setSelectedLeaveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Rejection modal states
  const [rejectModalTarget, setRejectModalTarget] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  // Admin Edit and Delete modal states
  const [editModalTarget, setEditModalTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Pending',
    rejectionReason: '',
    startDate: '',
    endDate: '',
    days: 1,
    reason: '',
    guardianStatus: ''
  });
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const isHostelAdmin = typeof propIsHostelAdmin === 'boolean'
    ? propIsHostelAdmin
    : Boolean(
        account?.role === 'hostel_admin' ||
        account?.role === 'admin' ||
        account?.role === 'super_admin' ||
        account?.identity === 'WRD-ADM-01' ||
        account?.detail?.toLowerCase().includes('administrator')
      );

  const isAdminRole = Boolean(
    account?.role === 'admin' ||
    account?.role === 'super_admin' ||
    account?.role === 'hostel_admin' ||
    isHostelAdmin ||
    account?.identity === 'WRD-ADM-01'
  );

  // Listen to storage events for real-time synchronization with Student Portal
  const [wardenStatusTick, setWardenStatusTick] = useState(0);

  useEffect(() => {
    fetchResidentLeavesFromBackend();
    const handleSync = () => {
      setLeaves(getAllResidentLeaves());
    };
    const handleStatusSync = () => setWardenStatusTick(t => t + 1);

    window.addEventListener('bput_hostel_leaves_updated', handleSync);
    window.addEventListener('bput_warden_status_changed', handleStatusSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bput_hostel_leaves_updated', handleSync);
      window.removeEventListener('bput_warden_status_changed', handleStatusSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const isSuspended = useMemo(() => {
    if (isHostelAdmin) return false;
    return isWardenSuspended(account);
  }, [isHostelAdmin, account, wardenStatusTick]);

  const wardenId = useMemo(() => getWardenIdFromAccount(account), [account]);
  const [wardenPermsTick, setWardenPermsTick] = useState(0);

  useEffect(() => {
    const handlePermsSync = () => setWardenPermsTick(t => t + 1);
    window.addEventListener('bput_warden_permissions_changed', handlePermsSync);
    window.addEventListener('storage', handlePermsSync);
    return () => {
      window.removeEventListener('bput_warden_permissions_changed', handlePermsSync);
      window.removeEventListener('storage', handlePermsSync);
    };
  }, []);

  const permissions = useMemo(() => {
    if (isHostelAdmin) {
      return { reviewStudentLeaves: true };
    }
    return getWardenPermissions(wardenId);
  }, [isHostelAdmin, wardenId, wardenStatusTick, wardenPermsTick]);

  const canReviewLeaves = isHostelAdmin || (!isSuspended && permissions.reviewStudentLeaves !== false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const normStatus = (s) => normalizeLeaveStatus(s);

  // List of distinct hostels for filtering
  const distinctHostels = useMemo(() => {
    const set = new Set();
    leaves.forEach(l => {
      if (l.hostelName) set.add(l.hostelName);
    });
    return Array.from(set);
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const currentNorm = normStatus(l.status);
      const matchStatus = statusFilter === 'ALL' || currentNorm === statusFilter;
      const matchHostel = hostelFilter === 'ALL' || (l.hostelName && l.hostelName.toLowerCase().includes(hostelFilter.toLowerCase()));
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query ||
        (l.studentName && l.studentName.toLowerCase().includes(query)) ||
        (l.rollNumber && l.rollNumber.toLowerCase().includes(query)) ||
        (l.regNo && l.regNo.toLowerCase().includes(query)) ||
        (l.hostelName && l.hostelName.toLowerCase().includes(query)) ||
        (l.id && l.id.toLowerCase().includes(query));
      return matchStatus && matchHostel && matchSearch;
    });
  }, [leaves, statusFilter, hostelFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter(l => normStatus(l.status) === 'Pending').length,
      approved: leaves.filter(l => normStatus(l.status) === 'Approved').length,
      rejected: leaves.filter(l => normStatus(l.status) === 'Rejected').length,
      currentlyAway: leaves.filter(l => normStatus(l.status) === 'Approved' && !l.returned).length
    };
  }, [leaves]);

  const handleApprove = (id) => {
    if (isSuspended) {
      showToast('⚠️ Warden Account Suspended: Leave approvals are disabled. Read-only mode.');
      return;
    }
    if (!canReviewLeaves) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    const submitterName = account?.name
      ? `${account.name} (${isHostelAdmin ? 'Hostel Admin' : 'Resident Warden'})`
      : isHostelAdmin ? 'Mr. Rajesh Jena (Hostel Admin)' : 'Mr. Rajesh Jena (Resident Warden)';

    const updated = approveResidentLeave(id, submitterName);
    setLeaves(updated);
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(updated.find(l => l.id === id));
    }
    showToast(`✓ Leave application ${id} approved successfully`);
  };

  const handleInitiateReject = (leave) => {
    if (isSuspended) {
      showToast('⚠️ Warden Account Suspended: Leave rejections are disabled. Read-only mode.');
      return;
    }
    if (!canReviewLeaves) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    setRejectModalTarget(leave);
    setRejectionReasonText('');
    setRejectionError('');
  };

  const handleConfirmReject = () => {
    if (isSuspended) {
      showToast('⚠️ Warden Account Suspended: Leave rejections are disabled. Read-only mode.');
      return;
    }
    if (!canReviewLeaves) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    if (!rejectionReasonText.trim()) {
      setRejectionError('Please provide a specific reason for rejection to inform the student.');
      return;
    }

    const submitterName = account?.name
      ? `${account.name} (${isHostelAdmin ? 'Hostel Admin' : 'Resident Warden'})`
      : isHostelAdmin ? 'Mr. Rajesh Jena (Hostel Admin)' : 'Mr. Rajesh Jena (Resident Warden)';

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
    if (isSuspended) {
      showToast('⚠️ Warden Account Suspended: Status modifications are disabled in read-only mode.');
      return;
    }
    if (!canReviewLeaves) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    const updated = markResidentReturned(id);
    setLeaves(updated);
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(updated.find(l => l.id === id));
    }
    showToast(`✓ Student recorded as returned to hostel`);
  };

  const handleOpenEdit = (leave) => {
    setEditModalTarget(leave);
    setEditForm({
      status: normalizeLeaveStatus(leave.status),
      rejectionReason: leave.rejectionReason || '',
      startDate: leave.startDate || '',
      endDate: leave.endDate || '',
      days: leave.days || 1,
      reason: leave.reason || '',
      guardianStatus: leave.guardianStatus || 'Consent Form Submitted Online'
    });
  };

  const handleSaveEdit = () => {
    if (!editModalTarget) return;
    const finalStatus = normalizeLeaveStatus(editForm.status);
    const updates = {
      ...editForm,
      status: finalStatus,
      rejectionReason: finalStatus === 'Rejected' ? (editForm.rejectionReason || 'Declined by administration.') : '',
      approvedBy: finalStatus === 'Approved' ? (account?.name || 'Hostel Administration') : editModalTarget.approvedBy,
      rejectedBy: finalStatus === 'Rejected' ? (account?.name || 'Hostel Administration') : editModalTarget.rejectedBy,
      returned: finalStatus === 'Approved' ? Boolean(editModalTarget.returned) : false
    };

    const updated = updateResidentLeave(editModalTarget.id, updates);
    setLeaves(updated);
    if (selectedLeaveModal?.id === editModalTarget.id) {
      setSelectedLeaveModal(updated.find(l => l.id === editModalTarget.id));
    }
    setEditModalTarget(null);
    showToast(`✓ Leave application ${editModalTarget.id} updated successfully by Admin`);
  };

  const handleDeleteLeave = (id) => {
    const updated = deleteResidentLeave(id);
    setLeaves(updated);
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(null);
    }
    setDeleteConfirmTarget(null);
    showToast(`✓ Leave application ${id} permanently deleted.`);
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

      {/* Account Suspended Warning Banner */}
      {isSuspended && (
        <div className="hostel-suspended-banner" style={{
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#991b1b',
          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.06)'
        }}>
          <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#b91c1c' }}>
              ⚠️ Warden Account Suspended by Hostel Administration
            </div>
            <div style={{ fontSize: '0.82rem', color: '#7f1d1d', marginTop: '2px' }}>
              Your account is currently in <strong>Suspended</strong> status. You have <strong>Read-Only view access</strong> to inspect student leave records. Approving or rejecting leave applications is disabled.
            </div>
          </div>
          <span style={{
            marginLeft: 'auto',
            background: '#fee2e2',
            color: '#dc2626',
            fontWeight: 800,
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #fca5a5',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            flexShrink: 0
          }}>
            READ-ONLY MODE
          </span>
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Calendar size={24} color="#2563eb" /> Overnight Leave Applications</h2>
          <p>Resident Overnight Outstation Leaves · Parent/Guardian Consent Verification · Real-Time Warden &amp; Admin Sync</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            className="h-btn h-btn-secondary"
            onClick={async () => {
              await fetchResidentLeavesFromBackend();
              setLeaves(getAllResidentLeaves());
              showToast('Leave queue synchronized from backend');
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
        <div className="hostel-filter-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search resident name, reg number, or hostel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {distinctHostels.length > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Building size={15} color="#64748b" />
              <select
                className="admin-form-select"
                style={{ padding: '6px 10px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', minWidth: '170px' }}
                value={hostelFilter}
                onChange={e => setHostelFilter(e.target.value)}
              >
                <option value="ALL">All Hostels ({leaves.length})</option>
                {distinctHostels.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          )}

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
                filteredLeaves.map(leave => {
                  const st = normStatus(leave.status);
                  return (
                    <tr key={leave.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{leave.id}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{leave.studentName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {leave.rollNumber || leave.regNo}</div>
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
                        {(() => {
                          const raw = leave.status || 'Pending';
                          const normalized = normStatus(raw);
                          const isRejected = normalized === 'Rejected' || raw === 'Rejected';
                          const isApproved = normalized === 'Approved' || raw === 'Approved' || raw === 'Returned' || Boolean(leave.returned);

                          if (isRejected) {
                            return (
                              <div>
                                <span className="h-badge h-badge-rejected" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.78rem' }}>
                                  <XCircle size={12} /> Rejected
                                </span>
                                <div
                                  className="leave-rejection-chip"
                                  title={leave.rejectionReason}
                                  style={{
                                    background: '#fff1f2',
                                    border: '1px solid #fecdd3',
                                    borderRadius: '6px',
                                    padding: '5px 8px',
                                    marginTop: '4px',
                                    fontSize: '0.74rem',
                                    color: '#9f1239',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '5px',
                                    lineHeight: '1.3'
                                  }}
                                >
                                  <AlertCircle size={12} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                                  <span><strong>Reason:</strong> {leave.rejectionReason || 'Parent / Guardian telephonic consent could not be verified by hostel office.'}</span>
                                </div>
                              </div>
                            );
                          }

                          if (isApproved) {
                            return (
                              <div>
                                <span className="h-badge h-badge-approved" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.78rem' }}>
                                  <CheckCircle2 size={12} /> Approved
                                </span>
                                <div style={{ marginTop: '4px' }}>
                                  {leave.returned || raw === 'Returned' ? (
                                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>✓ Returned</span>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>⏳ Away</span>
                                  )}
                                </div>
                                {leave.approvedBy && (
                                  <div style={{ fontSize: '0.69rem', color: '#166534', marginTop: '2px', fontWeight: 500 }}>
                                    Sanctioned: {leave.approvedBy}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Default to Pending Review (GUARANTEED NEVER BLANK!)
                          return (
                            <div>
                              <span className="h-badge h-badge-pending" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.78rem' }}>
                                <Clock size={12} /> Pending Review
                              </span>
                              <div style={{ fontSize: '0.69rem', color: '#92400e', marginTop: '3px' }}>
                                Awaiting Warden Review
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            className="h-btn h-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => setSelectedLeaveModal(leave)}
                            title="View full dossier"
                          >
                            <Eye size={13} /> View
                          </button>
                          {st === 'Pending' && (
                            isSuspended && !isAdminRole ? (
                              <span className="had-badge neutral" style={{ fontSize: '0.72rem', padding: '3px 7px' }} title="Approvals locked while warden account is suspended">
                                Read Only (Suspended)
                              </span>
                            ) : (!canReviewLeaves && !isAdminRole) ? (
                              <span
                                className="had-badge neutral"
                                style={{ fontSize: '0.72rem', padding: '3px 7px', cursor: 'pointer' }}
                                title="Leave review permission restricted by Hostel Administrator"
                                onClick={() => showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.')}
                              >
                                Read Only (Restricted)
                              </span>
                            ) : (
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
                            )
                          )}
                          {st === 'Approved' && !leave.returned && (isAdminRole || (!isSuspended && canReviewLeaves)) && (
                            <button
                              className="h-btn h-btn-primary"
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                              onClick={() => handleMarkReturned(leave.id)}
                            >
                              Mark Returned
                            </button>
                          )}
                          {isAdminRole && (
                            <>
                              <button
                                className="h-btn h-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}
                                onClick={() => handleOpenEdit(leave)}
                                title="Update leave details & status (Admin)"
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              <button
                                className="h-btn h-btn-danger"
                                style={{ padding: '4px 8px', fontSize: '0.74rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}
                                onClick={() => setDeleteConfirmTarget(leave)}
                                title="Permanently delete leave record (Admin)"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </>
                          )}
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

      {/* MODAL 1: VIEW DETAILS */}
      {selectedLeaveModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedLeaveModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Leave Dossier · {selectedLeaveModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Submitted on {selectedLeaveModal.appliedOn} · Status: <strong>{normStatus(selectedLeaveModal.status)}</strong>
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedLeaveModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div><strong>Student Name:</strong> {selectedLeaveModal.studentName}</div>
                <div><strong>Registration:</strong> {selectedLeaveModal.rollNumber || selectedLeaveModal.regNo}</div>
                <div><strong>Hostel:</strong> {selectedLeaveModal.hostelName}</div>
                <div><strong>Room No:</strong> {selectedLeaveModal.roomNumber}</div>
                <div><strong>Contact:</strong> {selectedLeaveModal.phone}</div>
                <div><strong>Total Duration:</strong> {selectedLeaveModal.days} Days ({selectedLeaveModal.startDate} to {selectedLeaveModal.endDate})</div>
              </div>

              {/* If Approved: Sanction Details */}
              {normStatus(selectedLeaveModal.status) === 'Approved' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Official Approval Recorded
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#166534' }}>
                    Sanctioned by: <strong>{selectedLeaveModal.approvedBy || 'Hostel Administration'}</strong> · {selectedLeaveModal.approvedAt || 'Active Term'}
                  </div>
                </div>
              )}

              {/* If Rejected: Prominent Rejection Card showing Reason */}
              {normStatus(selectedLeaveModal.status) === 'Rejected' && (
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
              {normStatus(selectedLeaveModal.status) === 'Pending' && (
                isSuspended ? (
                  <span style={{ color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600, marginRight: 'auto' }}>
                    🔒 Decisions Locked (Warden Account Suspended)
                  </span>
                ) : !canReviewLeaves ? (
                  <span style={{ color: '#b45309', fontSize: '0.82rem', fontWeight: 600, marginRight: 'auto' }}>
                    🔒 Review Decisions Restricted by Hostel Administration
                  </span>
                ) : (
                  <>
                    <button className="h-btn h-btn-danger" onClick={() => handleInitiateReject(selectedLeaveModal)}>
                      <X size={14} /> Reject Application
                    </button>
                    <button className="h-btn h-btn-success" onClick={() => handleApprove(selectedLeaveModal.id)}>
                      <Check size={14} /> Sanction Leave
                    </button>
                  </>
                )
              )}
              {normStatus(selectedLeaveModal.status) === 'Approved' && !selectedLeaveModal.returned && !isSuspended && canReviewLeaves && (
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
                  <strong>{rejectModalTarget.studentName} ({rejectModalTarget.rollNumber || rejectModalTarget.regNo})</strong>
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

      {/* MODAL 3: ADMIN EDIT & UPDATE LEAVE APPLICATION */}
      {editModalTarget && (
        <div className="reject-modal-backdrop" onClick={() => setEditModalTarget(null)}>
          <div className="reject-modal-card" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="reject-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                    Edit Leave Application · {editModalTarget.id}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Administrative update for <strong>{editModalTarget.studentName}</strong> ({editModalTarget.rollNumber || editModalTarget.regNo})
                  </p>
                </div>
              </div>
              <button className="admin-table-action-btn" onClick={() => setEditModalTarget(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="reject-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Application Status *
                </label>
                <select
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a' }}
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Pending">Pending (Under Review)</option>
                  <option value="Approved">Approved (Sanctioned for Campus Exit)</option>
                  <option value="Rejected">Rejected (Declined with Reason)</option>
                </select>
              </div>

              {editForm.status === 'Rejected' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#b91c1c', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff1f2', fontSize: '0.85rem', color: '#9f1239', boxSizing: 'border-box' }}
                    placeholder="Provide specific reason for rejection..."
                    value={editForm.rejectionReason}
                    onChange={e => setEditForm({ ...editForm, rejectionReason: e.target.value })}
                  />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {PRESET_REJECTION_REASONS.slice(0, 3).map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fecdd3', background: '#ffffff', color: '#9f1239', cursor: 'pointer' }}
                        onClick={() => setEditForm({ ...editForm, rejectionReason: r })}
                      >
                        + {r.slice(0, 38)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    START DATE
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    value={editForm.startDate}
                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    END DATE
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    value={editForm.endDate}
                    onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  PURPOSE / REASON FOR LEAVE
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  value={editForm.reason}
                  onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  GUARDIAN VERIFICATION STATUS
                </label>
                <select
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                  value={editForm.guardianStatus}
                  onChange={e => setEditForm({ ...editForm, guardianStatus: e.target.value })}
                >
                  <option value="Consent Form Submitted Online">Consent Form Submitted Online</option>
                  <option value="Verified via Phone Call">Verified via Phone Call</option>
                  <option value="SMS Awaiting Confirmation">SMS Awaiting Confirmation</option>
                  <option value="Faculty & Guardian Consent Letter Attached">Faculty & Guardian Consent Letter Attached</option>
                  <option value="Guardian Disapproved">Guardian Disapproved</option>
                </select>
              </div>
            </div>

            <div className="reject-modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="h-btn h-btn-secondary"
                onClick={() => setEditModalTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-btn h-btn-primary"
                style={{ background: '#2563eb', color: '#ffffff', padding: '8px 18px', fontSize: '0.88rem' }}
                onClick={handleSaveEdit}
              >
                <Check size={15} /> Save &amp; Update Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN DELETE CONFIRMATION */}
      {deleteConfirmTarget && (
        <div className="reject-modal-backdrop" onClick={() => setDeleteConfirmTarget(null)}>
          <div className="reject-modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="reject-modal-header" style={{ borderBottom: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '8px', color: '#b91c1c' }}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#991b1b' }}>
                    Delete Leave Application?
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Application ID: <strong>{deleteConfirmTarget.id}</strong>
                  </p>
                </div>
              </div>
              <button className="admin-table-action-btn" onClick={() => setDeleteConfirmTarget(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="reject-modal-body" style={{ paddingTop: '14px', fontSize: '0.88rem', color: '#334155', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 10px 0' }}>
                Are you sure you want to permanently delete the outstation leave application for <strong>{deleteConfirmTarget.studentName}</strong> ({deleteConfirmTarget.hostelName})?
              </p>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px 12px', fontSize: '0.78rem', color: '#991b1b' }}>
                ⚠️ <strong>Permanent Action:</strong> This record will be removed from Warden, Hostel Admin, Executive Admin, and Security Guard registers.
              </div>
            </div>

            <div className="reject-modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="h-btn h-btn-secondary"
                onClick={() => setDeleteConfirmTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-btn h-btn-danger"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                onClick={() => handleDeleteLeave(deleteConfirmTarget.id)}
              >
                <Trash2 size={15} /> Confirm &amp; Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
