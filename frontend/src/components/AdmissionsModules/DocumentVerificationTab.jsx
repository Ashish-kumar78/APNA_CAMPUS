import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Check,
  X,
  RotateCcw,
  ShieldCheck,
  Clock,
  ExternalLink,
  ZoomIn,
  Download,
  AlertTriangle,
} from 'lucide-react';

export default function DocumentVerificationTab({
  applicants = [],
  onVerifyDocument,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Preview Modal State
  const [previewDocState, setPreviewDocState] = useState(null);

  // Verification Remarks Modal State
  const [remarkModalState, setRemarkModalState] = useState({
    isOpen: false,
    appId: null,
    applicantName: '',
    doc: null,
    action: 'Verified',
    remarks: '',
  });

  // Flatten all documents across applicants into a unified scrutiny queue
  const documentQueue = useMemo(() => {
    const list = [];
    applicants.forEach((app) => {
      (app.documents || []).forEach((doc) => {
        list.push({
          ...doc,
          appId: app.id,
          applicationNo: app.applicationNo,
          applicantName: app.name,
          course: app.appliedCourse,
        });
      });
    });
    return list;
  }, [applicants]);

  const filteredQueue = useMemo(() => {
    return documentQueue.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.applicantName?.toLowerCase().includes(q) ||
          item.applicationNo?.toLowerCase().includes(q) ||
          item.filename?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [documentQueue, categoryFilter, statusFilter, searchQuery]);

  const verifiedCount = documentQueue.filter((d) => d.status === 'Verified').length;
  const pendingCount = documentQueue.filter((d) => d.status === 'Pending').length;
  const resubmitCount = documentQueue.filter((d) => d.status === 'Resubmission Required').length;
  const rejectedCount = documentQueue.filter((d) => d.status === 'Rejected').length;

  const handleOpenRemarkModal = (item, action) => {
    setRemarkModalState({
      isOpen: true,
      appId: item.appId,
      applicantName: item.applicantName,
      doc: item,
      action,
      remarks:
        action === 'Verified'
          ? 'Digitally authenticated against state academic board database.'
          : action === 'Resubmission Required'
          ? 'Scan is blurry or incomplete. Please upload high resolution PDF.'
          : 'Document does not meet institutional qualifying criteria.',
    });
  };

  const handleConfirmVerification = (e) => {
    e.preventDefault();
    if (!remarkModalState.doc) return;
    onVerifyDocument &&
      onVerifyDocument(
        remarkModalState.appId,
        remarkModalState.doc.id,
        remarkModalState.action,
        remarkModalState.remarks,
        'Er. B. K. Jena (Scrutiny Officer)'
      );
    setRemarkModalState({ isOpen: false, appId: null, applicantName: '', doc: null, action: 'Verified', remarks: '' });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Central Document Scrutiny &amp; Verification Desk
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Scrutinize certificates, examine mark sheets, cross-verify entrance scorecards, and certify applicant credentials.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card green">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Verified Dossiers</span>
            <div className="adm-kpi-icon-wrap"><CheckCircle2 size={16} color="#059669" /></div>
          </div>
          <div className="adm-kpi-value">{verifiedCount}</div>
          <div className="adm-kpi-foot">Authenticated &amp; cleared</div>
        </div>

        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Pending Scrutiny</span>
            <div className="adm-kpi-icon-wrap"><Clock size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">{pendingCount}</div>
          <div className="adm-kpi-foot" style={{ color: '#d97706', fontWeight: 600 }}>
            In active verification queue
          </div>
        </div>

        <div className="adm-kpi-card rose">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Resubmissions</span>
            <div className="adm-kpi-icon-wrap"><RotateCcw size={16} color="#e11d48" /></div>
          </div>
          <div className="adm-kpi-value">{resubmitCount}</div>
          <div className="adm-kpi-foot">Deficient scans flagged</div>
        </div>

        <div className="adm-kpi-card indigo">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Rejected / Invalid</span>
            <div className="adm-kpi-icon-wrap"><AlertCircle size={16} color="#4f46e5" /></div>
          </div>
          <div className="adm-kpi-value">{rejectedCount}</div>
          <div className="adm-kpi-foot">Criteria unmet</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="adm-filter-bar">
        <div className="adm-search-input-wrap">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, application ID, or filename..."
          />
        </div>

        <div className="adm-filter-group">
          {/* Document Category Filter */}
          <select
            className="adm-select-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Document Categories</option>
            <option value="Photograph">Photograph</option>
            <option value="Signature">Signature Specimen</option>
            <option value="Class 10 Certificate">Class 10 Certificate</option>
            <option value="Class 12 Mark Sheet">Class 12 Mark Sheet</option>
            <option value="OJEE Rank Card">Entrance Scorecard / Rank Card</option>
            <option value="Identity Proof">Identity Documentation</option>
            <option value="Caste Certificate (SC)">Category / Caste Certificate</option>
            <option value="College Leaving / Transfer Cert">Transfer / Migration Certificate</option>
          </select>

          {/* Verification Status Filter */}
          <select
            className="adm-select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Scrutiny Statuses</option>
            <option value="Pending">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="Resubmission Required">Resubmission Required</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <FileText size={18} color="#0284c7" /> Verification Queue ({filteredQueue.length} Documents)
            </h3>
            <p className="adm-panel-desc">
              Demonstration metadata and simulated document certificates. Sensitive personal data masked for privacy.
            </p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Applicant ID &amp; Name</th>
                <th>Applied Course</th>
                <th>Document Category</th>
                <th>Uploaded Filename</th>
                <th>Upload Date</th>
                <th>Scrutiny Status</th>
                <th>Assigned Verifier</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'right' }}>Scrutiny Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No documents match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr key={`${item.appId}-${item.id}`}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.applicantName}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#0284c7' }}>
                        {item.applicationNo}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                      {item.course}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.category}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.74rem', color: '#0284c7', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.filename}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {item.uploadDate}
                    </td>
                    <td>
                      <span
                        className={`adm-status-tag ${
                          item.status === 'Verified'
                            ? 'verified'
                            : item.status === 'Rejected'
                            ? 'rejected'
                            : item.status === 'Resubmission Required'
                            ? 'documents_pending'
                            : 'under_review'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                      {item.verifier || 'Er. B. K. Jena'}
                    </td>
                    <td style={{ fontSize: '0.74rem', color: '#334155', maxWidth: '200px' }}>
                      {item.remarks || 'Standard document scrutiny'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Preview Document Button */}
                        <button
                          type="button"
                          className="adm-btn-secondary"
                          onClick={() => setPreviewDocState(item)}
                          style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                          title="Simulate Document Preview"
                        >
                          <Eye size={13} /> Preview
                        </button>

                        {/* Mark Verified */}
                        {item.status !== 'Verified' && (
                          <button
                            type="button"
                            className="adm-btn-success"
                            onClick={() => handleOpenRemarkModal(item, 'Verified')}
                            style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                          >
                            <Check size={13} /> Verify
                          </button>
                        )}

                        {/* Request Resubmission */}
                        {item.status !== 'Resubmission Required' && (
                          <button
                            type="button"
                            className="adm-btn-secondary"
                            onClick={() => handleOpenRemarkModal(item, 'Resubmission Required')}
                            style={{ padding: '4px 8px', fontSize: '0.73rem', color: '#d97706', borderColor: '#fde68a' }}
                          >
                            <RotateCcw size={13} /> Resubmit
                          </button>
                        )}

                        {/* Reject */}
                        {item.status !== 'Rejected' && (
                          <button
                            type="button"
                            className="adm-btn-danger"
                            onClick={() => handleOpenRemarkModal(item, 'Rejected')}
                            style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                          >
                            <X size={13} /> Reject
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

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocState && (
        <div className="adm-modal-backdrop" onClick={() => setPreviewDocState(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  Document Preview · {previewDocState.category}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  {previewDocState.applicantName} ({previewDocState.applicationNo}) · File: {previewDocState.filename}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocState(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="adm-modal-body">
              {/* Simulated Document Preview Container */}
              <div className="adm-doc-preview-frame">
                <div className="adm-doc-watermark">CONFIDENTIAL · APNA CAMPUS ADMISSIONS</div>
                <FileText size={48} color="#0284c7" style={{ marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {previewDocState.category}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Official Institutional Digital Copy · Uploaded: {previewDocState.uploadDate}
                </p>
                <div
                  style={{
                    marginTop: '16px',
                    padding: '8px 14px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#334155',
                    textAlign: 'left',
                    width: '100%',
                    maxWidth: '420px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Certificate Status:</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>Authentic Digital Record</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Issued Authority:</span>
                    <span style={{ fontWeight: 600 }}>Recognized Educational Board</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Scrutiny Verifier:</span>
                    <span style={{ fontWeight: 600 }}>{previewDocState.verifier || 'Er. B. K. Jena'}</span>
                  </div>
                </div>

                <p style={{ margin: '14px 0 0', fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Note: Sensitive identity details masked to protect applicant privacy.
                </p>
              </div>

              {/* Remarks info */}
              <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Current Scrutiny Remarks:</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#0f172a' }}>
                  {previewDocState.remarks || 'Pending officer remarks.'}
                </p>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setPreviewDocState(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION REMARKS ACTION MODAL */}
      {remarkModalState.isOpen && (
        <div className="adm-modal-backdrop" onClick={() => setRemarkModalState({ ...remarkModalState, isOpen: false })}>
          <div className="adm-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Certify Document: {remarkModalState.doc?.category}
              </h3>
              <button
                type="button"
                onClick={() => setRemarkModalState({ ...remarkModalState, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmVerification}>
              <div className="adm-modal-body">
                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569' }}>
                  Candidate: <strong>{remarkModalState.applicantName}</strong> ({remarkModalState.doc?.filename})
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Select Action Status *
                  </label>
                  <select
                    className="adm-select-control"
                    style={{ width: '100%' }}
                    value={remarkModalState.action}
                    onChange={(e) => setRemarkModalState({ ...remarkModalState, action: e.target.value })}
                  >
                    <option value="Verified">Verified (Certify Document Authentic)</option>
                    <option value="Resubmission Required">Resubmission Required (Flag Deficient Scan)</option>
                    <option value="Rejected">Rejected (Ineligible / Fails Prerequisite)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Reviewer Scrutiny Remarks *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={remarkModalState.remarks}
                    onChange={(e) => setRemarkModalState({ ...remarkModalState, remarks: e.target.value })}
                    className="adm-search-input"
                    style={{ padding: '10px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setRemarkModalState({ ...remarkModalState, isOpen: false })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={
                    remarkModalState.action === 'Verified'
                      ? 'adm-btn-success'
                      : remarkModalState.action === 'Rejected'
                      ? 'adm-btn-danger'
                      : 'adm-btn-primary'
                  }
                >
                  Confirm &amp; Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
