import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
  Award,
  Briefcase,
  DollarSign,
  Users,
  FileText,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import BonafideDetailsModal from './BonafideDetailsModal';
import BonafideDocPreviewModal from './BonafideDocPreviewModal';
import './BonafideReviewQueue.css';

const REJECTION_REASONS = [
  'Incorrect student or enrolment details',
  'Invalid or missing supporting document / offer letter',
  'Hostel residency status could not be verified against hostel ledger',
  'Incorrect or unverified external event / hackathon details',
  'Fee structure or academic year discrepancy',
  'Internship duration overlaps with mandatory exam schedule',
  'Incomplete student declaration or missing signature',
  'Other (detailed reason specified in comments)',
];

export default function BonafideReviewQueue({ role = 'placement', account }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [purposeFilter, setPurposeFilter] = useState('ALL');

  // Modal states
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);

  // Decision Form State
  const [decisionAction, setDecisionAction] = useState('APPROVED');
  const [rejectionCategory, setRejectionCategory] = useState(REJECTION_REASONS[0]);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState('');
  const [docPreviewOpen, setDocPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getBonafideReviewQueue();
      if (res && res.queue) {
        setQueue(res.queue);
      } else {
        setQueue([]);
      }
    } catch (err) {
      console.warn('Failed to load bonafide review queue:', err.message);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [role]);

  const filteredQueue = queue.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.applicationNumber.toLowerCase().includes(q) ||
      (item.student?.name || '').toLowerCase().includes(q) ||
      (item.student?.registrationNumber || '').toLowerCase().includes(q) ||
      (item.formData?.companyName || '').toLowerCase().includes(q) ||
      (item.formData?.eventName || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    const matchesPurpose =
      purposeFilter === 'ALL' || item.purpose === purposeFilter;

    return matchesSearch && matchesStatus && matchesPurpose;
  });

  // Stats
  const pendingCount = queue.filter((i) => i.status === 'UNDER_REVIEW' || i.status === 'SUBMITTED').length;
  const approvedCount = queue.filter((i) => i.status === 'APPROVED' || i.status === 'CERTIFICATE_ISSUED').length;
  const rejectedCount = queue.filter((i) => i.status === 'REJECTED' || i.status === 'CHANGES_REQUESTED').length;

  const handleOpenDecision = (app) => {
    setSelectedApp(app);
    setDecisionAction('APPROVED');
    setRejectionCategory(REJECTION_REASONS[0]);
    setDecisionRemarks('');
    setDecisionError('');
    setDecisionModalOpen(true);
  };

  const submitDecision = async () => {
    if (!selectedApp) return;
    setDecisionError('');

    if ((decisionAction === 'REJECTED' || decisionAction === 'CHANGES_REQUESTED') && !decisionRemarks.trim()) {
      setDecisionError('Please provide mandatory reviewer remarks explaining the decision.');
      return;
    }

    setIsSubmittingDecision(true);
    try {
      const backendAction =
        decisionAction === 'APPROVED' ? 'APPROVE' :
        decisionAction === 'CHANGES_REQUESTED' ? 'REQUEST_CHANGES' :
        decisionAction === 'REJECTED' ? 'REJECT' : decisionAction;

      const remarksText = decisionRemarks.trim() || (backendAction === 'APPROVE' ? 'Approved upon institutional verification.' : 'Action recorded.');

      await api.reviewBonafideApplication(selectedApp.id, {
        action: backendAction,
        remarks: remarksText,
        comments: remarksText,
        rejectionCategory: backendAction !== 'APPROVE' ? rejectionCategory : undefined,
        rejectionReason: backendAction !== 'APPROVE' ? rejectionCategory : undefined,
      });

      setDecisionModalOpen(false);
      await fetchQueue();
    } catch (err) {
      setDecisionError(err.message || 'Failed to submit review decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const getPurposeBadge = (purpose) => {
    switch (purpose) {
      case 'INTERNSHIP':
        return { label: 'Internship', color: '#2563eb', bg: '#eff6ff', icon: Briefcase };
      case 'SCHOLARSHIP_HOSTELLER':
        return { label: 'Scholarship Hosteller', color: '#059669', bg: '#ecfdf5', icon: Award };
      case 'STUDY_LOAN':
        return { label: 'Study Loan & Fee', color: '#d97706', bg: '#fffbeb', icon: DollarSign };
      case 'EXTERNAL_EVENT':
        return { label: 'External Event', color: '#7c3aed', bg: '#f5f3ff', icon: Users };
      default:
        return { label: purpose, color: '#475569', bg: '#f1f5f9', icon: FileCheck };
    }
  };

  return (
    <div className="bonafide-review-queue-container">
      {/* Header */}
      <div className="bonafide-queue-header">
        <div>
          <h2 className="bonafide-queue-title">
            Bonafide Verification Queue ({role.toUpperCase()})
          </h2>
          <p className="bonafide-queue-subtitle">
            Review, verify authoritative records, and approve bonafide certificate requests under your institutional jurisdiction.
          </p>
        </div>
        <button className="bonafide-refresh-btn" onClick={fetchQueue} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="bonafide-queue-kpis">
        <div className="bonafide-kpi-card border-blue">
          <div className="kpi-icon-wrap bg-blue-50 text-blue-600">
            <Clock size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pending Verification</span>
            <strong className="kpi-value text-blue-600">{pendingCount}</strong>
          </div>
        </div>

        <div className="bonafide-kpi-card border-emerald">
          <div className="kpi-icon-wrap bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Approved & Released</span>
            <strong className="kpi-value text-emerald-600">{approvedCount}</strong>
          </div>
        </div>

        <div className="bonafide-kpi-card border-amber">
          <div className="kpi-icon-wrap bg-amber-50 text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Corrections / Rejected</span>
            <strong className="kpi-value text-amber-600">{rejectedCount}</strong>
          </div>
        </div>

        <div className="bonafide-kpi-card border-slate">
          <div className="kpi-icon-wrap bg-slate-100 text-slate-700">
            <FileCheck size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Assigned</span>
            <strong className="kpi-value text-slate-800">{queue.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bonafide-queue-filters">
        <div className="bonafide-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by ID, Student Name, Roll No, Company, or Event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bonafide-filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)}>
            <option value="ALL">All Purposes</option>
            <option value="INTERNSHIP">Internship Bonafide</option>
            <option value="SCHOLARSHIP_HOSTELLER">Scholarship Hosteller</option>
            <option value="STUDY_LOAN">Study Loan & Fee</option>
            <option value="EXTERNAL_EVENT">External Event</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bonafide-queue-table-wrap">
        <table className="bonafide-queue-table">
          <thead>
            <tr>
              <th>App ID</th>
              <th>Certificate Purpose</th>
              <th>Student Details</th>
              <th>Key Specifics</th>
              <th>Current Stage</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="bonafide-table-empty">
                  Loading verification queue...
                </td>
              </tr>
            ) : filteredQueue.length === 0 ? (
              <tr>
                <td colSpan={8} className="bonafide-table-empty">
                  No bonafide applications in your queue matching the filters.
                </td>
              </tr>
            ) : (
              filteredQueue.map((item) => {
                const badge = getPurposeBadge(item.purpose);
                const Icon = badge.icon;
                const d = item.formData || {};
                const canTakeAction = ['SUBMITTED', 'UNDER_REVIEW'].includes(item.status);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong className="bonafide-app-id">#{item.applicationNumber}</strong>
                    </td>
                    <td>
                      <div className="bonafide-table-purpose-badge" style={{ color: badge.color, background: badge.bg }}>
                        <Icon size={13} />
                        <span>{badge.label}</span>
                      </div>
                    </td>
                    <td>
                      <div className="bonafide-table-student">
                        <strong>{item.student?.name || d.studentName || 'Student'}</strong>
                        <small>{item.student?.registrationNumber || d.registrationNumber} • {d.course || 'B.Tech'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="bonafide-table-specifics">
                        {item.purpose === 'INTERNSHIP' && (
                          <span>{d.companyName} ({d.internshipRole})</span>
                        )}
                        {item.purpose === 'SCHOLARSHIP_HOSTELLER' && (
                          <span>{d.hostelName} • Room {d.roomNumber} ({d.hostelStatus})</span>
                        )}
                        {item.purpose === 'STUDY_LOAN' && (
                          <span>{d.bankName} • 4Y: ₹{d.feeStructure?.grandTotal?.toLocaleString('en-IN') || '10,84,000'}</span>
                        )}
                        {item.purpose === 'EXTERNAL_EVENT' && (
                          <span>{d.eventName} ({d.organizerName})</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="bonafide-stage-tag">
                        {item.currentStage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`bonafide-status-pill status-${item.status.toLowerCase()}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <small className="text-slate-500">
                        {new Date(item.submissionDate || item.createdAt || item.appliedDate || Date.now()).toLocaleDateString('en-GB')}
                      </small>
                    </td>
                    <td>
                      <div className="bonafide-table-actions">
                        {canTakeAction ? (
                          <button
                            className="bonafide-btn-action-primary"
                            onClick={() => handleOpenDecision(item)}
                          >
                            <span>Verify & Decide</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <button
                            className="bonafide-btn-action-view"
                            onClick={() => {
                              setSelectedApp(item);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        )}

                        {item.status === 'CERTIFICATE_ISSUED' && (
                          <button
                            className="bonafide-btn-action-download"
                            onClick={() => api.downloadBonafideCertificatePdf(item.id)}
                            title="Download Certificate PDF"
                          >
                            <Download size={13} />
                          </button>
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

      {/* Review Decision Modal */}
      {decisionModalOpen && selectedApp && (
        <div className="bonafide-modal-backdrop" onClick={() => setDecisionModalOpen(false)}>
          <div
            className="bonafide-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bonafide-modal-header">
              <div className="bonafide-modal-header-info">
                <div className="bonafide-modal-icon-wrap" style={{ background: '#2563eb15', color: '#2563eb' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="bonafide-modal-title">
                    Record Institutional Review Decision
                  </h3>
                  <p className="bonafide-modal-subtitle">
                    Application #{selectedApp.applicationNumber} • Stage: {selectedApp.currentStage?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <button className="bonafide-modal-close-btn" onClick={() => setDecisionModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="bonafide-modal-body">
              {decisionError && (
                <div className="bonafide-error-banner" style={{ marginBottom: '16px' }}>
                  <AlertTriangle size={16} />
                  <span>{decisionError}</span>
                </div>
              )}

              {/* Student Summary */}
              <div className="bonafide-decision-student-summary">
                <div className="info-pair">
                  <span>Student:</span>
                  <strong>{selectedApp.student?.name || selectedApp.formData?.studentName} ({selectedApp.student?.registrationNumber || selectedApp.formData?.registrationNumber})</strong>
                </div>
                <div className="info-pair">
                  <span>Purpose:</span>
                  <strong>{selectedApp.purpose.replace(/_/g, ' ')}</strong>
                </div>
                {selectedApp.formData?.hostelName && (
                  <div className="info-pair">
                    <span>Hostel Record:</span>
                    <strong className="text-emerald-700">{selectedApp.formData.hostelName} (Room {selectedApp.formData.roomNumber})</strong>
                  </div>
                )}
                {selectedApp.formData?.companyName && (
                  <div className="info-pair">
                    <span>Company:</span>
                    <strong>{selectedApp.formData.companyName} ({selectedApp.formData.internshipRole})</strong>
                  </div>
                )}
              </div>

              {/* Student's Uploaded Supportive Document Preview */}
              {(() => {
                const docs = (selectedApp.supportingDocs && selectedApp.supportingDocs.length > 0)
                  ? selectedApp.supportingDocs
                  : [selectedApp.formData?.offerLetterDoc, selectedApp.formData?.scholarshipDoc, selectedApp.formData?.loanDoc, selectedApp.formData?.eventDoc].filter(Boolean);

                if (docs.length === 0) return null;

                return (
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FileText size={14} color="#2563eb" />
                        Uploaded Supportive Document (Proof)
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Submitted by Student</span>
                    </div>
                    {docs.map((rawDoc, idx) => {
                      const doc = typeof rawDoc === 'string' ? { fileName: rawDoc, dataUrl: rawDoc, name: rawDoc } : rawDoc;
                      const docName = doc.fileName || doc.name || `Document #${idx + 1}`;
                      const docSize = doc.fileSize || (doc.sizeInBytes ? `${(doc.sizeInBytes / (1024 * 1024)).toFixed(2)} MB` : 'Attached');
                      const isPdf = doc.fileType?.includes('pdf') || docName.toLowerCase().endsWith('.pdf');

                      return (
                        <div key={idx} className="bonafide-supportive-doc-card" style={{ background: '#ffffff', margin: 0 }}>
                          <div className="bonafide-supportive-doc-left">
                            <div className={`bonafide-uploaded-icon-box ${isPdf ? 'is-pdf' : 'is-doc'}`} style={{ width: '34px', height: '34px' }}>
                              <FileText size={16} />
                            </div>
                            <div className="bonafide-supportive-doc-info">
                              <span className="bonafide-supportive-doc-name" title={docName}>{docName}</span>
                              <div className="bonafide-supportive-doc-sub">
                                <span className="bonafide-file-size-pill">{docSize}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="bonafide-upload-action-btn view-btn"
                            onClick={() => {
                              setPreviewDoc(doc);
                              setDocPreviewOpen(true);
                            }}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Decision Selector */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Verification Decision <span className="req">*</span>
                </label>
                <div className="bonafide-decision-radios">
                  <label className={`bonafide-decision-radio ${decisionAction === 'APPROVED' ? 'active-approve' : ''}`}>
                    <input
                      type="radio"
                      name="decisionAction"
                      checked={decisionAction === 'APPROVED'}
                      onChange={() => setDecisionAction('APPROVED')}
                    />
                    <div>
                      <strong>Approve Application</strong>
                      <small>Proceed to next institutional stage or issue certificate</small>
                    </div>
                  </label>

                  <label className={`bonafide-decision-radio ${decisionAction === 'CHANGES_REQUESTED' ? 'active-change' : ''}`}>
                    <input
                      type="radio"
                      name="decisionAction"
                      checked={decisionAction === 'CHANGES_REQUESTED'}
                      onChange={() => setDecisionAction('CHANGES_REQUESTED')}
                    />
                    <div>
                      <strong>Request Corrections</strong>
                      <small>Send back to student to update specific fields</small>
                    </div>
                  </label>

                  <label className={`bonafide-decision-radio ${decisionAction === 'REJECTED' ? 'active-reject' : ''}`}>
                    <input
                      type="radio"
                      name="decisionAction"
                      checked={decisionAction === 'REJECTED'}
                      onChange={() => setDecisionAction('REJECTED')}
                    />
                    <div>
                      <strong>Reject Application</strong>
                      <small>Decline request with mandatory institutional grounds</small>
                    </div>
                  </label>
                </div>
              </div>

              {/* Structured Reason Category (mandatory if rejected or changes requested) */}
              {decisionAction !== 'APPROVED' && (
                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Standard Reason Category <span className="req">*</span>
                  </label>
                  <select
                    value={rejectionCategory}
                    onChange={(e) => setRejectionCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {REJECTION_REASONS.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mandatory Detailed Remarks */}
              <div style={{ marginTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Reviewer Remarks & Verification Notes {decisionAction !== 'APPROVED' && <span className="req">*</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    decisionAction === 'APPROVED'
                      ? 'e.g. Verified against official department ledger and offer letter proof.'
                      : 'Provide explicit guidance on what details must be corrected or why rejected...'
                  }
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div className="bonafide-modal-footer">
              <button
                className="bonafide-btn-ghost"
                onClick={() => setDecisionModalOpen(false)}
                disabled={isSubmittingDecision}
              >
                Cancel
              </button>
              <button
                className="bonafide-btn-primary"
                style={{
                  background: decisionAction === 'APPROVED' ? '#059669' : decisionAction === 'CHANGES_REQUESTED' ? '#d97706' : '#dc2626',
                  borderColor: decisionAction === 'APPROVED' ? '#047857' : decisionAction === 'CHANGES_REQUESTED' ? '#b45309' : '#b91c1c',
                }}
                onClick={submitDecision}
                disabled={isSubmittingDecision}
              >
                {isSubmittingDecision ? 'Recording Decision...' : `Confirm ${decisionAction.replace(/_/g, ' ')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedApp && (
        <BonafideDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          application={selectedApp}
          isStaff={true}
        />
      )}

      {/* Supportive Document Preview Modal */}
      {docPreviewOpen && previewDoc && (
        <BonafideDocPreviewModal
          isOpen={docPreviewOpen}
          onClose={() => {
            setDocPreviewOpen(false);
            setPreviewDoc(null);
          }}
          doc={previewDoc}
        />
      )}
    </div>
  );
}
