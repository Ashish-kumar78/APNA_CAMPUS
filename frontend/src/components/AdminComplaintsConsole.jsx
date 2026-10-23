import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  RotateCcw,
  UserCheck,
  Brain,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  X,
  Phone,
  BarChart2
} from 'lucide-react';
import { api } from '../services/api.js';

export default function AdminComplaintsConsole() {
  const [complaints, setComplaints] = useState([]);

  const [staffRoster, setStaffRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterReviewOnly, setFilterReviewOnly] = useState(false);

  // Reassignment modal
  const [reassignModalTicket, setReassignModalTicket] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [customOverrideCategory, setCustomOverrideCategory] = useState('');
  const [reassignNotes, setReassignNotes] = useState('');

  // AI Metrics Modal
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [aiMetrics, setAiMetrics] = useState(null);
  const [aiMetricsLoading, setAiMetricsLoading] = useState(false);
  const [aiMetricsError, setAiMetricsError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const openAiMetrics = async () => {
    setShowMetricsModal(true);
    setAiMetrics(null);
    setAiMetricsError('');
    setAiMetricsLoading(true);
    try {
      const response = await api.getAiModelMetrics();
      if (!response?.success) throw new Error('AI metrics request failed.');
      setAiMetrics(response.data);
    } catch {
      setAiMetricsError('AI model metrics are unavailable. Check the backend and configured AI service.');
    } finally {
      setAiMetricsLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, staffRes] = await Promise.all([
        api.getComplaints(),
        api.getStaffRosterWithWorkload().catch(() => ({ data: [] })),
      ]);
      setComplaints(Array.isArray(compRes?.data) ? compRes.data : []);
      setStaffRoster(Array.isArray(staffRes?.data) ? staffRes.data : []);
      setLoadError('');
    } catch (err) {
      console.warn('Failed to refresh complaints console:', err);
      setLoadError('Complaint data could not be loaded. Check the connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const s = search.toLowerCase();
      const matchSearch =
        c.title.toLowerCase().includes(s) ||
        (c.description && c.description.toLowerCase().includes(s)) ||
        (c.studentName && c.studentName.toLowerCase().includes(s)) ||
        (c.id && c.id.toLowerCase().includes(s)) ||
        (c.location && c.location.toLowerCase().includes(s));

      const matchCat = filterCategory === 'ALL' || c.category?.toLowerCase() === filterCategory.toLowerCase();
      const matchStat = filterStatus === 'ALL' || c.status === filterStatus;
      const matchReview = !filterReviewOnly || c.needsReview;

      return matchSearch && matchCat && matchStat && matchReview;
    });
  }, [complaints, search, filterCategory, filterStatus, filterReviewOnly]);

  // Handle Supervisor Review & Reassignment
  const handleOpenReassign = (ticket) => {
    setReassignModalTicket(ticket);
    setSelectedStaffId(ticket.assignedStaffId || '');
    setCustomOverrideCategory(ticket.category || 'General');
    setReassignNotes(ticket.resolutionNotes || '');
  };

  const handleSaveReassignment = async () => {
    if (!reassignModalTicket) return;
    const staff = staffRoster.find(s => s.id === selectedStaffId);
    const assignedName = staff ? staff.name : (selectedStaffId ? 'Selected Staff' : 'Unassigned');

    try {
      await api.updateComplaintStatus(reassignModalTicket.id, {
        status: staff ? 'Assigned' : 'Needs Review',
        assignedStaff: assignedName,
        assignedStaffId: selectedStaffId || null,
        resolutionNotes: reassignNotes || `Reassigned to ${assignedName} by campus administrator.`,
      });
      triggerToast(`Ticket #${reassignModalTicket.id} updated! Assigned to: ${assignedName}`);
      loadData();
    } catch {
      triggerToast('Assignment was not saved. Check the connection and try again.');
      return;
    }
    setReassignModalTicket(null);
  };

  const totalComplaints = complaints.length;
  const needsReviewCount = complaints.filter(c => c.needsReview || c.status === 'Needs Review').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Top Banner & AI Controls */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: '14px',
        padding: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center' }}>
            <Brain size={26} color="#c7d2fe" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
              AI Complaint Management &amp; Staff Assignment Engine
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#c7d2fe' }}>
              TF-IDF text classification · Workload-balanced automated dispatch · Supervisor triage queue
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={openAiMetrics}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart2 size={15} /> AI Model Metrics &amp; Evaluation
          </button>
          <button
            onClick={loadData}
            style={{
              background: '#4f46e5',
              border: 'none',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={15} /> Refresh Live Data
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Complaints</span>
            <Wrench size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {totalComplaints}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Active Institutional Registry</span>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Requires Supervisor Review</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309', margin: '4px 0' }}>
            {needsReviewCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Low confidence / Ambiguous AI tags</span>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>In Progress / Assigned</span>
            <Clock size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', margin: '4px 0' }}>
            {inProgressCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Under active technician resolution</span>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Resolved &amp; Closed</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
            {resolvedCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            {totalComplaints > 0 ? `${Math.round((resolvedCount / totalComplaints) * 100)}% resolution rate` : '100%'}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        background: '#ffffff',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 260px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by student, ticket ID, title, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '0.85rem',
              width: '100%',
              maxWidth: '320px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Internet/IT">Internet/IT</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button
            onClick={() => setFilterReviewOnly(r => !r)}
            style={{
              background: filterReviewOnly ? '#fef3c7' : '#f1f5f9',
              border: filterReviewOnly ? '1px solid #f59e0b' : '1px solid #cbd5e1',
              color: filterReviewOnly ? '#b45309' : '#475569',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={14} color={filterReviewOnly ? '#b45309' : '#64748b'} />
            Triage Queue ({needsReviewCount})
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="admin-table-container" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket ID &amp; Student</th>
              <th>Issue &amp; Location</th>
              <th>AI Classification &amp; Confidence</th>
              <th>Assigned Staff &amp; Role</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Admin Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(c => {
              const confPercent = Math.round((c.confidence || 0.85) * 100);
              return (
                <tr key={c.id}>
                  <td>
                    <strong>{c.id}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {c.studentName} ({c.rollNumber})
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                      {c.filedDate}
                    </div>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{c.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      📍 {c.location || 'Campus'}
                    </div>
                    {c.description && (
                      <p style={{ fontSize: '0.76rem', color: '#475569', margin: '4px 0 0', lineHeight: 1.3 }}>
                        {c.description}
                      </p>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span className="admin-badge active" style={{ width: 'fit-content' }}>
                        {c.category}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: c.needsReview ? '#b45309' : '#6d28d9', fontWeight: 600 }}>
                        ✨ AI: {c.predictedCategory || c.category} ({confPercent}%)
                      </span>
                      {c.needsReview && (
                        <span style={{ fontSize: '0.7rem', color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, width: 'fit-content' }}>
                          ⚠️ Low Confidence
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {c.assignedStaffName ? (
                      <div>
                        <strong>{c.assignedStaffName}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {c.assignedStaffRole || 'Technician'}
                        </div>
                        {c.assignedStaffPhone && (
                          <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>
                            📞 {c.assignedStaffPhone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#b45309', fontSize: '0.8rem', fontWeight: 600 }}>
                        Unassigned (Queued)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge ${c.priority === 'High' ? 'rejected' : 'pending'}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${c.status === 'Resolved' ? 'approved' : c.status === 'In Progress' ? 'active' : c.status === 'Needs Review' ? 'pending' : 'boys'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-action-btn-primary"
                      style={{ padding: '5px 10px', fontSize: '0.75rem', background: '#4f46e5' }}
                      onClick={() => handleOpenReassign(c)}
                    >
                      <UserCheck size={13} /> {c.assignedStaffName ? 'Reassign' : 'Triage & Assign'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontWeight: 500 }}>
            Loading complaint records…
          </div>
        )}
        {!loading && loadError && (
          <div role="alert" style={{ textAlign: 'center', padding: '2.5rem', color: '#b91c1c', fontWeight: 500 }}>
            {loadError}
          </div>
        )}
        {!loading && !loadError && filteredComplaints.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontWeight: 500 }}>
            No persisted complaint records match the selected filters.
          </div>
        )}
      </div>

      {/* REASSIGNMENT & TRIAGE MODAL */}
      {reassignModalTicket && (
        <div className="admin-modal-backdrop" onClick={() => setReassignModalTicket(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Triage &amp; Assign Staff: #{reassignModalTicket.id}</h3>
              <button className="admin-table-action-btn" onClick={() => setReassignModalTicket(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{reassignModalTicket.title}</strong>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Student: {reassignModalTicket.studentName} · 📍 {reassignModalTicket.location}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#7c3aed', marginTop: '4px', fontWeight: 600 }}>
                  AI Predicted: {reassignModalTicket.predictedCategory} ({Math.round((reassignModalTicket.confidence || 0.85) * 100)}% Confidence)
                </div>
              </div>

              <div className="admin-form-group">
                <label>Category Tag</label>
                <select
                  className="admin-form-select"
                  value={customOverrideCategory}
                  onChange={e => setCustomOverrideCategory(e.target.value)}
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Internet/IT">Internet/IT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Select Qualified Staff (Showing Live Workload)</label>
                <select
                  className="admin-form-select"
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                >
                  <option value="">-- Leave Unassigned in Triage --</option>
                  {staffRoster.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roleOrCategory || s.speciality}) — {s.activeWorkload !== undefined ? `${s.activeWorkload} active tasks` : 'Available'}
                    </option>
                  ))}

                </select>
              </div>

              <div className="admin-form-group">
                <label>Supervisor Instructions &amp; Triage Notes</label>
                <textarea
                  rows={2}
                  className="admin-form-input"
                  value={reassignNotes}
                  onChange={e => setReassignNotes(e.target.value)}
                  placeholder="e.g. Verified tap valve leak. Scheduled for immediate morning replacement."
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => setReassignModalTicket(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                style={{ background: '#4f46e5' }}
                onClick={handleSaveReassignment}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics are fetched through the authenticated backend proxy. */}
      {showMetricsModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowMetricsModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0 }}>AI Model Metrics</h3>
              <button className="admin-table-action-btn" onClick={() => setShowMetricsModal(false)} aria-label="Close metrics">
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              {aiMetricsLoading && <p>Loading model evaluation metadata…</p>}
              {!aiMetricsLoading && aiMetricsError && <p role="alert">{aiMetricsError}</p>}
              {!aiMetricsLoading && !aiMetricsError && aiMetrics && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <strong>Model:</strong> {aiMetrics.model_type || 'Unspecified'}<br />
                    <strong>Training samples:</strong> {aiMetrics.num_training_samples ?? 'Unavailable'} ·{' '}
                    <strong>Test samples:</strong> {aiMetrics.num_test_samples ?? 'Unavailable'}<br />
                    <strong>Accuracy:</strong> {aiMetrics.evaluation_metrics?.accuracy == null
                      ? 'Unavailable'
                      : `${(aiMetrics.evaluation_metrics.accuracy * 100).toFixed(2)}%`} ·{' '}
                    <strong>Macro F1:</strong> {aiMetrics.evaluation_metrics?.macro_f1 == null
                      ? 'Unavailable'
                      : aiMetrics.evaluation_metrics.macro_f1.toFixed(4)}
                  </div>
                  {aiMetrics.synthetic_notice && (
                    <div role="note" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px', fontSize: '0.82rem', color: '#92400e' }}>
                      {aiMetrics.synthetic_notice}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
