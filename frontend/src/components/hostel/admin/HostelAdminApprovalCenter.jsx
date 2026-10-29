import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Filter, Search,
  Clock, FileText, Layers, ShieldCheck, UserCheck, ShieldAlert,
  ArrowRight, Check, X, RefreshCw, Send, Eye
} from 'lucide-react';
import './HostelAdminDashboard.css';

import {
  getUnifiedPendingApprovals,
  logAdminAction
} from '../../../services/wardenManagementStore.js';
import { approveIndentByAdmin, rejectIndentByAdmin } from '../../../services/hostelIndentStore.js';

export default function HostelAdminApprovalCenter({ account, showToast }) {
  const [approvals, setApprovals] = useState(() => getUnifiedPendingApprovals());
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Decision Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionType, setDecisionType] = useState('APPROVE'); // 'APPROVE' | 'REJECT' | 'RETURN'
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadQueue = () => {
    setApprovals(getUnifiedPendingApprovals());
  };

  const filteredApprovals = useMemo(() => {
    return approvals.filter(item => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hostel.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchSearch && matchCat && matchPriority;
    });
  }, [approvals, searchTerm, categoryFilter, priorityFilter]);

  const handleOpenDecision = (item, type) => {
    setSelectedRequest(item);
    setDecisionType(type);
    setDecisionRemarks(
      type === 'APPROVE'
        ? 'Reviewed and officially sanctioned by Hostel Administrator.'
        : type === 'REJECT'
        ? 'Rejected due to missing guardian confirmation or institutional safety policy.'
        : 'Returned to resident warden for clarification and correction.'
    );
  };

  const handleSubmitDecision = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmitting(true);

    const adminName = account?.name ? `${account.name} (Hostel Admin)` : 'Chief Hostel Administrator';
    const now = new Date().toISOString();

    try {
      // 1. Sync to Underlying Domain Store
      if (selectedRequest.category === 'Material Requisition') {
        if (decisionType === 'APPROVE') {
          approveIndentByAdmin(selectedRequest.id, adminName);
        } else {
          rejectIndentByAdmin(selectedRequest.id, decisionRemarks, adminName);
        }
      } else if (selectedRequest.category === 'Student Resident Leave') {
        try {
          const raw = localStorage.getItem('bput_hostel_resident_leaves_v2');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map(l => {
              if (l.id === selectedRequest.id) {
                return {
                  ...l,
                  status: decisionType === 'APPROVE' ? 'Approved' : 'Rejected',
                  rejectionReason: decisionType !== 'APPROVE' ? decisionRemarks : '',
                  rejectedBy: decisionType !== 'APPROVE' ? adminName : null,
                  rejectedAt: now
                };
              }
              return l;
            });
            localStorage.setItem('bput_hostel_resident_leaves_v2', JSON.stringify(updated));
          }
        } catch (err) {}
      } else if (selectedRequest.category === 'Staff & Warden Leave') {
        try {
          const raw = localStorage.getItem('bput_hostel_staff_leaves_v1');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map(sl => {
              if (sl.id === selectedRequest.id) {
                return {
                  ...sl,
                  status: decisionType === 'APPROVE' ? 'Approved by Hostel Admin' : 'Rejected by Hostel Admin',
                  adminRemarks: decisionRemarks,
                  approvedBy: adminName,
                  approvedAt: now
                };
              }
              return sl;
            });
            localStorage.setItem('bput_hostel_staff_leaves_v1', JSON.stringify(updated));
          }
        } catch (err) {}
      } else if (selectedRequest.category === 'Attendance Certification') {
        try {
          const raw = localStorage.getItem('bput_hostel_attendance_records_v2');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map(a => {
              if (a.id === selectedRequest.id) {
                return {
                  ...a,
                  status: decisionType === 'APPROVE' ? 'Verified' : 'Returned for Correction',
                  verificationStatus: decisionType === 'APPROVE' ? 'Admin Verified' : 'Correction Requested',
                  verifiedBy: adminName,
                  verifiedAt: now,
                  adminNotes: decisionRemarks
                };
              }
              return a;
            });
            localStorage.setItem('bput_hostel_attendance_records_v2', JSON.stringify(updated));
          }
        } catch (err) {}
      }

      // 2. Audit Event Logging
      logAdminAction({
        action: `ADMIN_${decisionType}`,
        targetEntity: selectedRequest.category,
        recordId: selectedRequest.id,
        hostelScope: selectedRequest.hostel,
        previousValue: `Status: Pending (${selectedRequest.title})`,
        newValue: `Status: ${decisionType} (By ${adminName})`,
        reason: decisionRemarks,
        actingUser: adminName
      });

      // 3. Refresh queue
      reloadQueue();
      setSelectedRequest(null);
      if (showToast) {
        showToast(`✓ Request #${selectedRequest.id} marked as ${decisionType}! Synchronized across system.`);
      }
    } catch (e) {
      alert(`Error processing decision: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            Centralized Administrative Approval Center
            <span className="had-title-badge">Unified Queue</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Consolidated queue for resident leaves, warden leaves, materials indents, and night roll call certifications requiring Hostel Admin authorization.
          </p>
        </div>
        <button className="had-btn had-btn-secondary" onClick={reloadQueue}>
          <RefreshCw size={14} /> Refresh Queue ({approvals.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="had-filter-bar">
        <div className="wm-search-box" style={{ width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search request ID, requester, hostel..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="had-filter-group">
          <Filter size={15} color="#7c3aed" />
          <span>Category:</span>
          <select className="had-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="ALL">All Request Categories ({approvals.length})</option>
            <option value="Student Resident Leave">Student Resident Leaves</option>
            <option value="Staff & Warden Leave">Staff & Warden Leaves</option>
            <option value="Material Requisition">Material Requisitions & Indents</option>
            <option value="Attendance Certification">Attendance Roll Calls</option>
          </select>
        </div>

        <div className="had-filter-group">
          <span>Priority:</span>
          <select className="had-filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority Only</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="had-table">
          <thead>
            <tr>
              <th>Request Details</th>
              <th>Category</th>
              <th>Hostel &amp; Scope</th>
              <th>Requester</th>
              <th>Submission Date</th>
              <th>Priority</th>
              <th>Administrative Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovals.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                  <strong>Zero Pending Authorizations</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>All warden and resident requests have been processed.</div>
                </td>
              </tr>
            ) : (
              filteredApprovals.map(req => (
                <tr key={req.id}>
                  <td>
                    <strong>{req.title}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Ref: #{req.id}</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>{req.details}</div>
                  </td>
                  <td>
                    <span className="had-badge info">{req.category}</span>
                  </td>
                  <td>
                    <strong>{req.hostel}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{req.blockOrRoom}</div>
                  </td>
                  <td>
                    <strong>{req.requester}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{req.submittedDate}</span>
                  </td>
                  <td>
                    <span className={`had-badge ${req.priority === 'High' ? 'danger' : 'neutral'}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="had-btn had-btn-primary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', background: '#059669' }}
                        title="Approve Request"
                        onClick={() => handleOpenDecision(req, 'APPROVE')}
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        className="had-btn had-btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', color: '#dc2626', borderColor: '#fecaca' }}
                        title="Reject Request"
                        onClick={() => handleOpenDecision(req, 'REJECT')}
                      >
                        <X size={13} /> Reject
                      </button>
                      <button
                        className="had-btn had-btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        title="Return for Correction"
                        onClick={() => handleOpenDecision(req, 'RETURN')}
                      >
                        Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DECISION MODAL */}
      {selectedRequest && (
        <div className="wm-modal-backdrop" onClick={() => setSelectedRequest(null)}>
          <div className="wm-modal" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                  {decisionType === 'APPROVE' ? 'Grant Administrative Approval' : decisionType === 'REJECT' ? 'Reject Request' : 'Return Request for Correction'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Ref: #{selectedRequest.id} · {selectedRequest.category}
                </span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedRequest(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitDecision}>
              <div className="wm-modal-body">
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{selectedRequest.title}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.25rem' }}>{selectedRequest.details}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Submitted by: <strong>{selectedRequest.requester}</strong> · {selectedRequest.hostel}
                  </div>
                </div>

                <div>
                  <label className="wm-form-label">
                    Mandatory Administrative Remarks / Justification *
                  </label>
                  <textarea
                    rows={4}
                    className="wm-form-textarea"
                    value={decisionRemarks}
                    onChange={e => setDecisionRemarks(e.target.value)}
                    required
                    placeholder="Enter official remarks recorded in audit history..."
                  />
                </div>
              </div>
              <div className="wm-modal-footer">
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="had-btn had-btn-primary"
                  style={{
                    background: decisionType === 'APPROVE' ? '#059669' : decisionType === 'REJECT' ? '#dc2626' : '#d97706'
                  }}
                  disabled={isSubmitting}
                >
                  Confirm {decisionType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

