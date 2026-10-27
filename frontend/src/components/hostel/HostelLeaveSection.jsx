import React, { useState, useMemo } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { mockLeaveApplications } from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelLeaveSection({ onNavigateApplyLeave }) {
  const [leaves, setLeaves] = useState(mockLeaveApplications);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'Approved' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaveModal, setSelectedLeaveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
      const matchSearch = !searchQuery ||
        l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.hostelName.toLowerCase().includes(searchQuery.toLowerCase());
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
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved', returned: false } : l));
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(prev => ({ ...prev, status: 'Approved', returned: false }));
    }
    showToast(`Leave application ${id} approved successfully`);
  };

  const handleReject = (id) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(prev => ({ ...prev, status: 'Rejected' }));
    }
    showToast(`Leave application ${id} rejected`);
  };

  const handleMarkReturned = (id) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, returned: true } : l));
    if (selectedLeaveModal?.id === id) {
      setSelectedLeaveModal(prev => ({ ...prev, returned: true }));
    }
    showToast(`Student recorded as returned to hostel`);
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
              setLeaves(mockLeaveApplications);
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
            <span className="hostel-kpi-subtitle">Consent Lacking</span>
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
                        color: leave.guardianStatus.includes('Verified') ? '#059669' : '#d97706',
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
                      {leave.status === 'Rejected' && <span className="h-badge h-badge-rejected">Rejected</span>}
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
                              onClick={() => handleReject(leave.id)}
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

      {/* MODAL: VIEW DETAILS */}
      {selectedLeaveModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedLeaveModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
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
                  <button className="h-btn h-btn-danger" onClick={() => handleReject(selectedLeaveModal.id)}>
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
    </div>
  );
}
