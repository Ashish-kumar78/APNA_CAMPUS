import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertCircle, CheckCircle2, Clock,
  Search, Filter, ChevronRight, X, Send, Eye, FileSpreadsheet,
  MessageSquare, UserX, AlertTriangle, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { complaintsApi } from '../services/complaintsApi';
import './FacultyComplaintsModule.css';

export default function FacultyComplaintsModule({ account }) {
  const facultyName = account?.name || account?.identifier || 'Dr. S. Mohanty';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Formal response form state
  const [responseComment, setResponseComment] = useState('');
  const [proposedAction, setProposedAction] = useState('');
  const [newStatus, setNewStatus] = useState('RESPONSE_SUBMITTED');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await complaintsApi.getFacultyComplaints(facultyName);
      setComplaints(list);
    } catch (e) {
      console.warn('Failed to load faculty complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('apna_campus_complaints_updated', handleUpdate);
    return () => window.removeEventListener('apna_campus_complaints_updated', handleUpdate);
  }, [facultyName]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = complaints.length;
    const awaitingReview = complaints.filter(c => c.status === 'NEW' || c.status === 'UNDER_REVIEW').length;
    const responseSubmitted = complaints.filter(c => c.status === 'RESPONSE_SUBMITTED' || c.status === 'AWAITING_HOD_REVIEW').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
    const escalated = complaints.filter(c => c.status === 'ESCALATED' || c.isOverdue).length;

    return { total, awaitingReview, responseSubmitted, resolved, escalated };
  }, [complaints]);

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.trackingId.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.subjectName && c.subjectName.toLowerCase().includes(q)) ||
        (c.subjectCode && c.subjectCode.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [complaints, statusFilter, searchQuery]);

  const handleOpenReview = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseComment('');
    setProposedAction('');
    setNewStatus(complaint.status === 'NEW' ? 'UNDER_REVIEW' : 'RESPONSE_SUBMITTED');
  };

  const handleCloseModal = () => {
    setSelectedComplaint(null);
    setResponseComment('');
    setProposedAction('');
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!responseComment.trim()) {
      alert('Please provide a formal response comment.');
      return;
    }

    try {
      setSubmittingResponse(true);
      await complaintsApi.submitFacultyResponse(
        selectedComplaint.id,
        {
          responseComment: responseComment.trim(),
          proposedAction: proposedAction.trim() || 'Corrective action plan formulated.',
          resolutionSummary: proposedAction.trim() || responseComment.trim()
        },
        facultyName
      );

      // If status is different from RESPONSE_SUBMITTED, update status
      if (newStatus && newStatus !== 'RESPONSE_SUBMITTED') {
        await complaintsApi.updateComplaintStatus(
          selectedComplaint.id,
          newStatus,
          `Status transitioned to ${newStatus} upon response submission.`,
          facultyName
        );
      }

      showToast(`Formal response and proposed action submitted for ${selectedComplaint.trackingId}.`);
      handleCloseModal();
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to submit response.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const exportComplaintsToCsv = () => {
    if (!complaints.length) return;
    const header = ['Tracking ID', 'Category', 'Subject', 'Semester', 'Section', 'Subject Code', 'Status', 'Submitted Date', 'Responses Count'];
    const rows = complaints.map(c => [
      c.trackingId,
      c.category,
      `"${(c.subject || '').replace(/"/g, '""')}"`,
      c.semester,
      c.section,
      c.subjectCode || 'N/A',
      c.status,
      new Date(c.submittedAt).toLocaleDateString('en-IN'),
      (c.responses || []).length
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Faculty_Grievance_Register_${facultyName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCategory = (cat) => {
    switch (cat) {
      case 'TEACHING_RELATED': return 'Teaching & Pedagogy';
      case 'FACULTY_BEHAVIOR': return 'Behavior & Conduct';
      case 'COURSE_MATERIAL': return 'Course Syllabus';
      case 'MARKS_AND_ASSESSMENTS': return 'Marks & Assessments';
      case 'CLASSROOM_ENVIRONMENT': return 'Facilities & Lab';
      default: return cat?.replace(/_/g, ' ') || 'Academic';
    }
  };

  return (
    <div className="fac-complaints-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{ background: '#0f766e', color: '#fff', padding: '10px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Header Area */}
      <div className="fac-complaints-header">
        <div className="fac-complaints-title-area">
          <h2>
            <ShieldAlert size={24} color="#0f766e" /> Student Complaints &amp; Grievance Management
          </h2>
          <p>
            Review and formally address student grievances assigned to your teaching cohort. Student identities are strictly masked to ensure a fearless, transparent feedback ecosystem.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="fac-complaints-privacy-badge">
            <ShieldCheck size={16} /> Zero-Knowledge Anonymity Protected
          </div>
          <button
            type="button"
            className="admin-action-btn-secondary"
            onClick={exportComplaintsToCsv}
            style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FileSpreadsheet size={14} /> Export Register (CSV)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="fac-complaints-kpi-grid">
        <div
          className={`fac-kpi-card ${statusFilter === 'ALL' ? 'active-kpi' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          <div className="fac-kpi-top">
            <span className="fac-kpi-label">Total Assigned</span>
            <div className="fac-kpi-icon-wrap blue"><MessageSquare size={18} /></div>
          </div>
          <div className="fac-kpi-val">{kpis.total}</div>
          <div className="fac-kpi-sub">Across Assigned Teaching Cohorts</div>
        </div>

        <div
          className={`fac-kpi-card ${statusFilter === 'NEW' || statusFilter === 'UNDER_REVIEW' ? 'active-kpi' : ''}`}
          onClick={() => setStatusFilter('NEW')}
        >
          <div className="fac-kpi-top">
            <span className="fac-kpi-label">Action Required</span>
            <div className="fac-kpi-icon-wrap amber"><Clock size={18} /></div>
          </div>
          <div className="fac-kpi-val" style={{ color: '#d97706' }}>{kpis.awaitingReview}</div>
          <div className="fac-kpi-sub">Awaiting Faculty Review / Response</div>
        </div>

        <div
          className={`fac-kpi-card ${statusFilter === 'RESPONSE_SUBMITTED' ? 'active-kpi' : ''}`}
          onClick={() => setStatusFilter('RESPONSE_SUBMITTED')}
        >
          <div className="fac-kpi-top">
            <span className="fac-kpi-label">Response Submitted</span>
            <div className="fac-kpi-icon-wrap indigo"><Send size={18} /></div>
          </div>
          <div className="fac-kpi-val" style={{ color: '#4f46e5' }}>{kpis.responseSubmitted}</div>
          <div className="fac-kpi-sub">Awaiting HOD Moderation / Review</div>
        </div>

        <div
          className={`fac-kpi-card ${statusFilter === 'RESOLVED' ? 'active-kpi' : ''}`}
          onClick={() => setStatusFilter('RESOLVED')}
        >
          <div className="fac-kpi-top">
            <span className="fac-kpi-label">Resolved</span>
            <div className="fac-kpi-icon-wrap emerald"><CheckCircle2 size={18} /></div>
          </div>
          <div className="fac-kpi-val" style={{ color: '#059669' }}>{kpis.resolved}</div>
          <div className="fac-kpi-sub">Action Implemented &amp; Cleared</div>
        </div>

        <div
          className={`fac-kpi-card ${statusFilter === 'ESCALATED' ? 'active-kpi' : ''}`}
          onClick={() => setStatusFilter('ESCALATED')}
        >
          <div className="fac-kpi-top">
            <span className="fac-kpi-label">Overdue / Escalated</span>
            <div className="fac-kpi-icon-wrap purple"><AlertTriangle size={18} /></div>
          </div>
          <div className="fac-kpi-val" style={{ color: '#b91c1c' }}>{kpis.escalated}</div>
          <div className="fac-kpi-sub">Under HOD / Council Review</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="fac-complaints-toolbar">
        <div className="fac-filter-pills">
          {[
            { id: 'ALL', label: 'All Complaints', count: kpis.total },
            { id: 'NEW', label: 'New', count: complaints.filter(c => c.status === 'NEW').length },
            { id: 'UNDER_REVIEW', label: 'Under Review', count: complaints.filter(c => c.status === 'UNDER_REVIEW').length },
            { id: 'RESPONSE_SUBMITTED', label: 'Response Submitted', count: complaints.filter(c => c.status === 'RESPONSE_SUBMITTED').length },
            { id: 'AWAITING_HOD_REVIEW', label: 'Awaiting HOD Review', count: complaints.filter(c => c.status === 'AWAITING_HOD_REVIEW').length },
            { id: 'RESOLVED', label: 'Resolved', count: kpis.resolved },
            { id: 'ESCALATED', label: 'Escalated', count: kpis.escalated },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`fac-filter-btn ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
              <span className="counter">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="fac-search-box">
          <Search size={14} className="fac-search-icon" />
          <input
            type="text"
            placeholder="Search by ID, subject, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Complaints Table Card */}
      <div className="fac-table-card">
        <div className="fac-table-wrapper">
          <table className="fac-complaints-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Complainant</th>
                <th>Category</th>
                <th>Subject &amp; Cohort</th>
                <th>Submitted</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <ShieldCheck size={36} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>No complaints found</div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                      {statusFilter !== 'ALL'
                        ? `No complaints match the filter "${statusFilter}".`
                        : 'There are currently no student complaints assigned to your teaching cohort.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(complaint => (
                  <tr key={complaint.id}>
                    <td>
                      <span className="fac-tracking-pill">{complaint.trackingId}</span>
                      {complaint.isOverdue && (
                        <span style={{ marginLeft: '6px', color: '#dc2626', fontSize: '0.68rem', fontWeight: 800 }}>
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="fac-anonymous-complainant">
                        <UserX size={14} color="#64748b" /> Anonymous Student
                      </span>
                    </td>
                    <td>
                      <span className="fac-category-tag">
                        {formatCategory(complaint.category)}
                      </span>
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {complaint.subject}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        {complaint.subjectName || complaint.subjectCode} · {complaint.semester} ({complaint.section})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        {new Date(complaint.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <span className={`fac-status-badge ${complaint.status.toLowerCase()}`}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                        {complaint.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="fac-action-btn-primary"
                        onClick={() => handleOpenReview(complaint)}
                      >
                        <Eye size={13} /> Review &amp; Respond
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Formal Response Modal */}
      {selectedComplaint && (
        <div className="fac-modal-backdrop" onClick={handleCloseModal}>
          <div className="fac-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fac-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="fac-tracking-pill">{selectedComplaint.trackingId}</span>
                <span className={`fac-status-badge ${selectedComplaint.status.toLowerCase()}`}>
                  {selectedComplaint.status.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="fac-modal-body">
              {/* Privacy Notice Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#059669" />
                <span>
                  <strong>Anonymity Guarantee:</strong> Complainant identity is completely omitted. As course instructor, you cannot modify original grievance details or erase audit records.
                </span>
              </div>

              {/* Original Complaint Box (Read-only) */}
              <div className="fac-original-complaint-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span className="fac-category-tag">{formatCategory(selectedComplaint.category)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Submitted on: {new Date(selectedComplaint.submittedAt).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h4 style={{ margin: '0.4rem 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                  {selectedComplaint.subject}
                </h4>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.84rem', color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                  {selectedComplaint.description}
                </p>

                <div className="fac-meta-grid">
                  <div className="fac-meta-item">
                    <dt>Assigned Course</dt>
                    <dd>{selectedComplaint.subjectName || selectedComplaint.subjectCode || 'Data Structures'}</dd>
                  </div>
                  <div className="fac-meta-item">
                    <dt>Cohort</dt>
                    <dd>{selectedComplaint.semester} · {selectedComplaint.section}</dd>
                  </div>
                  <div className="fac-meta-item">
                    <dt>Department</dt>
                    <dd>{selectedComplaint.department || 'CSE'}</dd>
                  </div>
                  <div className="fac-meta-item">
                    <dt>Complainant</dt>
                    <dd style={{ color: '#0f766e' }}>Anonymous Student</dd>
                  </div>
                </div>
              </div>

              {/* Action History & Existing Responses */}
              {((selectedComplaint.responses && selectedComplaint.responses.length > 0) ||
                (selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0)) && (
                <div className="fac-response-history-box">
                  <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                    Auditable Action History &amp; Previous Submissions
                  </h4>

                  {/* Previous responses */}
                  {(selectedComplaint.responses || []).map((resp, idx) => (
                    <div key={resp.id || idx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Faculty Response · {resp.facultyName} ({resp.facultyDesignation || 'Faculty'})</span>
                        <span>{new Date(resp.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#14532d' }}>
                        {resp.responseComment}
                      </p>
                      {resp.proposedAction && (
                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#166534', background: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>
                          <strong>Proposed Corrective Action:</strong> {resp.proposedAction}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Status Timeline */}
                  <div style={{ marginTop: '0.75rem' }}>
                    {(selectedComplaint.statusHistory || []).map((hist, idx) => (
                      <div key={hist.id || idx} className="fac-history-item">
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                          {hist.fromStatus} → <span style={{ color: '#0f766e' }}>{hist.toStatus}</span>
                          <span style={{ fontWeight: 400, color: '#64748b', marginLeft: '6px' }}>by {hist.changedBy}</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>
                          {hist.remarks}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                          {new Date(hist.timestamp).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formal Response Submission Form */}
              <form onSubmit={handleSubmitResponse} className="fac-response-form-card">
                <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.92rem', color: '#134e4a', fontWeight: 800 }}>
                  Submit Formal Response &amp; Proposed Resolution
                </h4>

                <div className="fac-form-group">
                  <label htmlFor="responseComment">Formal Explanation / Assessment of Issue *</label>
                  <textarea
                    id="responseComment"
                    rows={3}
                    placeholder="Provide a formal, constructive response addressing the student's concern..."
                    value={responseComment}
                    onChange={(e) => setResponseComment(e.target.value)}
                    required
                  />
                </div>

                <div className="fac-form-group">
                  <label htmlFor="proposedAction">Proposed Corrective Action or Resolution Plan</label>
                  <textarea
                    id="proposedAction"
                    rows={2}
                    placeholder="e.g. Scheduling supplementary tutorial on Saturday, updating marking rubric, providing revised lecture slides..."
                    value={proposedAction}
                    onChange={(e) => setProposedAction(e.target.value)}
                  />
                </div>

                <div className="fac-form-group">
                  <label htmlFor="newStatus">Update Complaint Workflow Stage</label>
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="RESPONSE_SUBMITTED">Response Submitted (Ready for Student &amp; HOD)</option>
                    <option value="UNDER_REVIEW">Under Review (Investigation in progress)</option>
                    <option value="AWAITING_HOD_REVIEW">Awaiting HOD Review (Requires Head of Department Sign-off)</option>
                    <option value="RESOLVED">Resolved (Corrective action completed)</option>
                    <option value="ESCALATED">Escalate (Requires Department Council Intervention)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="admin-action-btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="fac-action-btn-primary"
                    disabled={submittingResponse}
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem' }}
                  >
                    <Send size={14} /> {submittingResponse ? 'Submitting...' : 'Record Response & Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
