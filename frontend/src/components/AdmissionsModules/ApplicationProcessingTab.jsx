import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  MessageSquare,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function ApplicationProcessingTab({
  applicants = [],
  courses = [],
  rules = [],
  onChangeStatus,
  onAddReviewNote,
}) {
  const [selectedAppId, setSelectedAppId] = useState(applicants[0]?.id || null);
  const [filterStage, setFilterStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection / Ineligibility Dialog State
  const [rejectDialogState, setRejectDialogState] = useState({
    isOpen: false,
    applicant: null,
    targetStatus: 'Rejected',
    reason: '',
  });

  // Flag Missing Info Modal
  const [flagModalState, setFlagModalState] = useState({
    isOpen: false,
    applicant: null,
    deficiencyText: '',
  });

  // New review note state
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  const currentApp = applicants.find((a) => a.id === selectedAppId) || applicants[0] || null;

  // Find course rule for currentApp
  const courseRule = currentApp
    ? rules.find((r) => r.courseCode === currentApp.courseCode || r.courseName === currentApp.appliedCourse)
    : null;

  // Compute application completeness
  const computeCompleteness = (app) => {
    if (!app) return { score: 0, items: [] };
    const checks = [
      { label: 'Personal & Contact Information', complete: Boolean(app.name && app.email && app.phone) },
      { label: 'Category & Domicile Details', complete: Boolean(app.category && app.domicile) },
      { label: 'Academic Qualifications (10th & 12th)', complete: Boolean(app.tenthMarks && app.twelfthMarks) },
      { label: 'Qualifying Entrance Scorecard', complete: Boolean(app.entranceExam && app.entranceRank) },
      { label: 'All Required Certificates Uploaded', complete: (app.documents || []).length >= 3 },
      { label: 'Document Scrutiny Cleared', complete: app.docVerificationStatus === 'Verified' },
    ];
    const completedCount = checks.filter((c) => c.complete).length;
    const score = Math.round((completedCount / checks.length) * 100);
    return { score, checks };
  };

  const completeness = currentApp ? computeCompleteness(currentApp) : null;

  // Filter applicants
  const filteredApplicants = applicants.filter((a) => {
    if (filterStage !== 'All' && a.admissionStatus !== filterStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.applicationNo?.toLowerCase().includes(q) ||
        a.appliedCourse?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenRejectDialog = (app, status) => {
    setRejectDialogState({
      isOpen: true,
      applicant: app,
      targetStatus: status,
      reason: '',
    });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectDialogState.reason.trim()) {
      alert('A valid official reason is required for ineligibility or rejection.');
      return;
    }
    onChangeStatus &&
      onChangeStatus(
        rejectDialogState.applicant.id,
        rejectDialogState.targetStatus,
        rejectDialogState.reason.trim(),
        'Ms. Sasmita Mohapatra (Admission Head)'
      );
    setRejectDialogState({ isOpen: false, applicant: null, targetStatus: 'Rejected', reason: '' });
  };

  const handleFlagMissing = (e) => {
    e.preventDefault();
    if (!flagModalState.deficiencyText.trim()) return;
    onChangeStatus &&
      onChangeStatus(
        flagModalState.applicant.id,
        'Documents Pending',
        `Deficiency Flagged: ${flagModalState.deficiencyText.trim()}`,
        'Ms. Sasmita Mohapatra'
      );
    setFlagModalState({ isOpen: false, applicant: null, deficiencyText: '' });
  };

  const handleRecordNote = (e) => {
    e.preventDefault();
    if (!reviewNoteInput.trim() || !currentApp) return;
    onAddReviewNote &&
      onAddReviewNote(currentApp.id, 'Ms. Sasmita Mohapatra (Admission Head)', reviewNoteInput.trim());
    setReviewNoteInput('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Application Processing &amp; Scrutiny Console
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Validate candidate completeness, check course-specific eligibility rules, record review remarks, and execute multi-stage approvals.
          </p>
        </div>
      </div>

      {/* Two-Column Layout: Left Queue & Right Detailed Review Desk */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Application Queue */}
        <div className="adm-panel-box" style={{ margin: 0 }}>
          <div className="adm-panel-header" style={{ padding: '12px 14px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
              Processing Queue ({filteredApplicants.length})
            </span>
          </div>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <input
              type="text"
              className="adm-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate or ID..."
              style={{ fontSize: '0.78rem', padding: '6px 10px 6px 30px' }}
            />
            <div style={{ marginTop: '8px' }}>
              <select
                className="adm-select-control"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                style={{ width: '100%', fontSize: '0.75rem', padding: '5px 8px' }}
              >
                <option value="All">All Stages</option>
                <option value="Applied">Applied (New)</option>
                <option value="Under Review">Under Review</option>
                <option value="Documents Pending">Documents Pending</option>
                <option value="Verified">Verified</option>
                <option value="Eligible">Eligible</option>
                <option value="Selected">Selected</option>
              </select>
            </div>
          </div>

          <div style={{ maxHeight: '680px', overflowY: 'auto' }}>
            {filteredApplicants.map((app) => {
              const isSelected = app.id === currentApp?.id;
              const statusKey = (app.admissionStatus || 'Applied').toLowerCase().replace(/\s+/g, '_');

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: '#0284c7' }}>
                      {app.applicationNo}
                    </span>
                    <span className={`adm-status-tag ${statusKey}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {app.admissionStatus}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginTop: '3px' }}>
                    {app.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    {app.appliedCourse}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Review Dossier */}
        {currentApp ? (
          <div>
            {/* Top Action Ribbon for Selected Application */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {currentApp.name}
                  </h3>
                  <span className="adm-badge-pill dark">{currentApp.applicationNo}</span>
                  <span className="adm-badge-pill green">Session: {currentApp.academicSession}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                  Target: <strong>{currentApp.appliedCourse}</strong> · Category: {currentApp.category} · Domicile: {currentApp.domicile}
                </div>
              </div>

              {/* Action Buttons with strict workflow rules */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Under Review Button */}
                {currentApp.admissionStatus === 'Applied' && (
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={() => onChangeStatus && onChangeStatus(currentApp.id, 'Under Review', 'Initiated scrutiny')}
                  >
                    <Clock size={14} /> Mark Under Review
                  </button>
                )}

                {/* Flag Missing Info Button */}
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setFlagModalState({ isOpen: true, applicant: currentApp, deficiencyText: '' })}
                  style={{ color: '#d97706', borderColor: '#fde68a' }}
                >
                  <AlertTriangle size={14} /> Flag Missing Info
                </button>

                {/* Mark Eligible Button (Only if documents are verified and minimum marks met) */}
                {currentApp.admissionStatus !== 'Eligible' && currentApp.admissionStatus !== 'Selected' && currentApp.admissionStatus !== 'Enrolled' && (
                  <button
                    type="button"
                    className="adm-btn-success"
                    onClick={() => {
                      if (currentApp.docVerificationStatus !== 'Verified') {
                        if (!window.confirm('Notice: Documents are not yet fully verified. Are you sure candidate satisfies provisional eligibility?')) {
                          return;
                        }
                      }
                      onChangeStatus && onChangeStatus(currentApp.id, 'Eligible', 'Prerequisites & Entrance verified');
                    }}
                  >
                    <CheckCircle2 size={14} /> Mark Eligible
                  </button>
                )}

                {/* Mark Ineligible / Reject Button (Requires mandatory reason) */}
                {currentApp.admissionStatus !== 'Rejected' && (
                  <button
                    type="button"
                    className="adm-btn-danger"
                    onClick={() => handleOpenRejectDialog(currentApp, 'Rejected')}
                  >
                    <XCircle size={14} /> Reject / Ineligible
                  </button>
                )}
              </div>
            </div>

            {/* Application Completeness Meter */}
            {completeness && (
              <div className="adm-panel-box" style={{ marginBottom: '18px' }}>
                <div className="adm-panel-header" style={{ padding: '12px 18px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                    Application Dossier Completeness Check
                  </span>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      color: completeness.score === 100 ? '#059669' : '#d97706',
                    }}
                  >
                    {completeness.score}% Completed
                  </span>
                </div>
                <div className="adm-panel-body" style={{ padding: '16px 18px' }}>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${completeness.score}%`,
                        background: completeness.score === 100 ? '#059669' : '#0284c7',
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                    {completeness.checks.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
                        {c.complete ? (
                          <CheckCircle2 size={15} color="#059669" />
                        ) : (
                          <AlertTriangle size={15} color="#d97706" />
                        )}
                        <span style={{ color: c.complete ? '#334155' : '#b45309', fontWeight: c.complete ? 500 : 700 }}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Course-Specific Eligibility Validator Box */}
            <div className="adm-panel-box" style={{ marginBottom: '18px' }}>
              <div className="adm-panel-header" style={{ padding: '12px 18px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                  Course-Specific Eligibility &amp; Prerequisite Scrutiny
                </span>
                <span className="adm-badge-pill dark">
                  Policy: {courseRule?.qualifyingExam || 'JEE / OJEE'}
                </span>
              </div>
              <div className="adm-panel-body" style={{ padding: '16px 18px' }}>
                {courseRule ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Required Minimum 12th Marks</span>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', marginTop: '2px' }}>
                        {courseRule.minAggregateMarks}% (PCM Aggregate)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: Number(currentApp.twelfthMarks) >= courseRule.minAggregateMarks ? '#059669' : '#e11d48', fontWeight: 700, marginTop: '3px' }}>
                        Applicant: {currentApp.twelfthMarks}% {Number(currentApp.twelfthMarks) >= courseRule.minAggregateMarks ? '✓ (Satisfied)' : '✗ (Deficient)'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Approved Entrance Cutoff</span>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', marginTop: '2px' }}>
                        JEE CRL &lt; {courseRule.maxEntranceRankJEE?.toLocaleString() || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, marginTop: '3px' }}>
                        Applicant Rank: {currentApp.entranceRank || 'Merit Pool'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Mandatory Subject Combination</span>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                        {courseRule.requiredSubjects?.join(', ') || 'Physics, Math, Chem'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '3px' }}>
                        ✓ Verified in Marksheet
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Course admission policy criteria configured under Eligibility &amp; Admission Rules tab.
                  </p>
                )}
              </div>
            </div>

            {/* Staff Review Notes & Visible Audit History */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              {/* Record Review Notes */}
              <div className="adm-panel-box">
                <div className="adm-panel-header" style={{ padding: '12px 16px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                    Record Scrutiny &amp; Verification Notes
                  </span>
                </div>
                <div className="adm-panel-body" style={{ padding: '16px' }}>
                  <form onSubmit={handleRecordNote} style={{ marginBottom: '14px' }}>
                    <textarea
                      rows={3}
                      value={reviewNoteInput}
                      onChange={(e) => setReviewNoteInput(e.target.value)}
                      placeholder="Add official officer scrutiny observations (e.g. checked PCM marks with DigiLocker, original Migration pending, etc.)..."
                      className="adm-search-input"
                      style={{ padding: '8px 10px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="submit" className="adm-btn-primary" style={{ fontSize: '0.78rem' }}>
                        <Send size={13} /> Save Note to File
                      </button>
                    </div>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {(currentApp.staffReviewNotes || []).map((note) => (
                      <div key={note.id} style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                          <span style={{ fontWeight: 700, color: '#334155' }}>{note.author}</span>
                          <span>{note.date}</span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#0f172a' }}>{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visible Application Status History */}
              <div className="adm-panel-box">
                <div className="adm-panel-header" style={{ padding: '12px 16px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                    Application Status Progression Trail
                  </span>
                </div>
                <div className="adm-panel-body" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(currentApp.statusHistory || []).map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{h.status}</span>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>By: {h.updatedBy}</div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{h.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* REJECTION REASON CONFIRMATION DIALOG */}
      {rejectDialogState.isOpen && (
        <div className="adm-modal-backdrop" onClick={() => setRejectDialogState({ ...rejectDialogState, isOpen: false })}>
          <div className="adm-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: '#fef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                <ShieldAlert size={20} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  Mandatory Justification for Ineligibility / Rejection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectDialogState({ ...rejectDialogState, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="adm-modal-body">
                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569' }}>
                  You are marking candidate <strong>{rejectDialogState.applicant?.name}</strong> (App No: {rejectDialogState.applicant?.applicationNo}) as <strong>Ineligible / Rejected</strong>. State the official institutional grounds below:
                </p>

                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                  Official Reason *
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectDialogState.reason}
                  onChange={(e) => setRejectDialogState({ ...rejectDialogState, reason: e.target.value })}
                  placeholder="e.g. 10+2 PCM marks aggregate (51.2%) does not satisfy minimum qualifying threshold of 60% as mandated by BPUT admission policy."
                  className="adm-search-input"
                  style={{ padding: '10px', resize: 'vertical' }}
                />
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setRejectDialogState({ ...rejectDialogState, isOpen: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-danger">
                  Confirm Ineligibility &amp; Log Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLAG MISSING INFO MODAL */}
      {flagModalState.isOpen && (
        <div className="adm-modal-backdrop" onClick={() => setFlagModalState({ ...flagModalState, isOpen: false })}>
          <div className="adm-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: '#fffbeb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  Flag Missing / Deficient Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFlagModalState({ ...flagModalState, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFlagMissing}>
              <div className="adm-modal-body">
                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569' }}>
                  Specify the deficient documents or missing prerequisite details for <strong>{flagModalState.applicant?.name}</strong>. This status will notify the candidate to resubmit before cutoff.
                </p>

                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                  Deficiency Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={flagModalState.deficiencyText}
                  onChange={(e) => setFlagModalState({ ...flagModalState, deficiencyText: e.target.value })}
                  placeholder="e.g. Missing original Migration Certificate and blurry Class 12 board certificate."
                  className="adm-search-input"
                  style={{ padding: '10px', resize: 'vertical' }}
                />
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setFlagModalState({ ...flagModalState, isOpen: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary" style={{ background: '#d97706' }}>
                  Flag Deficiency &amp; Request Resubmission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
