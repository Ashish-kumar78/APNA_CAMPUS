import React, { useState } from 'react';
import {
  X,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  Edit3,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  User,
  DollarSign,
  Briefcase,
  Award,
  Users,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import BonafideDocPreviewModal from './BonafideDocPreviewModal';
import './BonafideModal.css';

export default function BonafideDetailsModal({
  isOpen,
  onClose,
  application,
  onEditResubmit,
  onWithdrawSuccess,
  isStaff = false,
  onReviewAction = null, // for staff reviewer
}) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | details | revisions
  const [docPreviewOpen, setDocPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  if (!isOpen || !application) return null;

  const isIssued = application.status === 'CERTIFICATE_ISSUED';
  const isRejected = application.status === 'REJECTED';
  const isChangesRequested = application.status === 'CHANGES_REQUESTED';
  const canWithdraw = ['SUBMITTED', 'UNDER_REVIEW'].includes(application.status) && !isStaff;
  const canEditResubmit = (isRejected || isChangesRequested) && !isStaff;

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      await api.withdrawBonafideApplication(application.id, withdrawReason || 'Withdrawn by student');
      setShowWithdrawConfirm(false);
      onWithdrawSuccess && onWithdrawSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      setDownloading(true);
      await api.downloadBonafideCertificatePdf(application.id, `Bonafide_${application.applicationNumber}.pdf`);
    } catch (err) {
      alert(err.message || 'Could not download certificate');
    } finally {
      setDownloading(false);
    }
  };

  // Determine workflow stages based on purpose
  const getWorkflowStages = () => {
    if (application.purpose === 'INTERNSHIP') {
      return [
        {
          stageKey: 'STUDENT_SUBMISSION',
          matchKeys: ['STUDENT_SUBMISSION', 'SUBMITTED'],
          label: 'Application Submission',
          dept: 'Student',
        },
        {
          stageKey: 'PLACEMENT_VERIFICATION',
          matchKeys: ['PLACEMENT_VERIFICATION', 'PLACEMENT_REVIEW'],
          label: 'Placement Dept Verification',
          dept: 'Training & Placement Cell',
        },
        {
          stageKey: 'COMPLETED',
          matchKeys: ['COMPLETED', 'CERTIFICATE_ISSUED'],
          label: 'Certificate Generation & Issuance',
          dept: 'Placement Office',
        },
      ];
    } else {
      // SCHOLARSHIP_HOSTELLER, STUDY_LOAN, EXTERNAL_EVENT
      return [
        {
          stageKey: 'STUDENT_SUBMISSION',
          matchKeys: ['STUDENT_SUBMISSION', 'SUBMITTED'],
          label: 'Application Submission',
          dept: 'Student',
        },
        {
          stageKey: 'SCHOLARSHIP_INITIAL_VERIFICATION',
          matchKeys: ['SCHOLARSHIP_INITIAL_VERIFICATION', 'SCHOLARSHIP_VERIFICATION_1'],
          label: 'Initial Record Verification',
          dept: 'Scholarship Cell',
        },
        {
          stageKey: 'PRINCIPAL_APPROVAL',
          matchKeys: ['PRINCIPAL_APPROVAL'],
          label: 'Institutional Approval',
          dept: 'Office of the Principal',
        },
        {
          stageKey: 'SCHOLARSHIP_FINAL_APPROVAL',
          matchKeys: ['SCHOLARSHIP_FINAL_APPROVAL'],
          label: 'Final Scholarship Issuance Review',
          dept: 'Scholarship Cell',
        },
        {
          stageKey: 'COMPLETED',
          matchKeys: ['COMPLETED', 'CERTIFICATE_ISSUED'],
          label: 'Certificate Issuance & Release',
          dept: 'GIFT Academic Administration',
        },
      ];
    }
  };

  const stages = getWorkflowStages();

  // Determine active stage index in pipeline
  const getActiveStageIndex = () => {
    if (application.status === 'CERTIFICATE_ISSUED' || application.currentStage === 'COMPLETED') {
      return stages.length; // All stages completed
    }

    const cur = application.currentStage;
    for (let i = 0; i < stages.length; i++) {
      if (stages[i].stageKey === cur || (stages[i].matchKeys && stages[i].matchKeys.includes(cur))) {
        return i;
      }
    }

    if (application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') {
      return 1;
    }

    if (application.status === 'DRAFT') {
      return 0;
    }

    return 1;
  };

  const activeStageIdx = getActiveStageIndex();
  const allStagesCompleted = activeStageIdx >= stages.length || application.status === 'CERTIFICATE_ISSUED';

  // Helper to determine state of each stage (Green = Completed, Red = Pending / Rejected)
  const getStageStatus = (stageItem, index) => {
    const reviews = application.reviews || [];
    const stageReview = reviews.find((r) =>
      stageItem.matchKeys ? stageItem.matchKeys.includes(r.stage) : r.stage === stageItem.stageKey
    );

    // If an explicit rejection review exists
    if (stageReview && (stageReview.action === 'REJECT' || stageReview.action === 'REJECTED')) {
      return { status: 'REJECTED', label: 'Rejected', review: stageReview };
    }

    // If changes requested review
    if (stageReview && (stageReview.action === 'REQUEST_CHANGES' || stageReview.action === 'CHANGES_REQUESTED')) {
      return { status: 'CHANGES_REQUESTED', label: 'Changes Requested', review: stageReview };
    }

    // If active stage is in rejected/changes_requested state
    if (index === activeStageIdx && isRejected) {
      return { status: 'REJECTED', label: 'Rejected', review: reviews[reviews.length - 1] };
    }
    if (index === activeStageIdx && isChangesRequested) {
      return { status: 'CHANGES_REQUESTED', label: 'Changes Requested', review: reviews[reviews.length - 1] };
    }

    // If this stage is completed/approved (turns GREEN)
    if (allStagesCompleted || index < activeStageIdx || (stageReview && (stageReview.action === 'APPROVED' || stageReview.action === 'APPROVE'))) {
      if (index === 0) {
        return {
          status: 'APPROVED',
          label: 'Completed',
          actionInfo: {
            reviewerName: application.student?.name || application.studentName || 'Student',
            reviewerRole: 'STUDENT',
            date: application.submissionDate || application.createdAt,
            note: 'Application submitted successfully with verified supportive document.',
          },
        };
      }
      return {
        status: 'APPROVED',
        label: 'Completed',
        review: stageReview,
      };
    }

    // Otherwise, this stage is pending approval -> shows RED
    return {
      status: 'PENDING',
      label: 'Pending',
    };
  };

  const data = application.formData || {};
  const purposeName = {
    INTERNSHIP: 'Internship Bonafide Certificate',
    SCHOLARSHIP_HOSTELLER: 'Scholarship Bonafide & Hostel Declaration',
    STUDY_LOAN: 'Education / Study Loan & Fee Structure',
    EXTERNAL_EVENT: 'External Event / Hackathon Authorization',
  }[application.purpose] || application.purpose;

  return (
    <div className="bonafide-modal-backdrop" onClick={onClose}>
      <div
        className="bonafide-modal-card bonafide-modal-large"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className="bonafide-modal-header">
          <div className="bonafide-modal-header-info">
            <div className="bonafide-modal-icon-wrap" style={{ backgroundColor: '#2563eb15', color: '#2563eb' }}>
              <FileCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="bonafide-modal-title">Application #{application.applicationNumber}</h2>
                <span className={`bonafide-status-pill status-${application.status.toLowerCase()}`}>
                  {application.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="bonafide-modal-subtitle">{purposeName} • Submitted on {new Date(application.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          <button className="bonafide-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bonafide-details-tabs">
          <button
            className={`bonafide-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Approval Timeline & Tracking
          </button>
          <button
            className={`bonafide-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Application Details
          </button>
          {application.revisions && application.revisions.length > 1 && (
            <button
              className={`bonafide-tab-btn ${activeTab === 'revisions' ? 'active' : ''}`}
              onClick={() => setActiveTab('revisions')}
            >
              Revision History ({application.revisions.length})
            </button>
          )}
        </div>

        {/* Body */}
        <div className="bonafide-modal-body">
          {/* Rejection / Correction Required Alert Banner */}
          {(isRejected || isChangesRequested) && (
            <div className="bonafide-rejection-callout">
              <div className="bonafide-callout-top">
                <AlertTriangle size={20} color="#b91c1c" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#991b1b' }}>
                    {isRejected ? 'Application Rejected by Reviewer' : 'Action Required: Corrections Requested'}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#b91c1c' }}>
                    Stage: {application.currentStage?.replace(/_/g, ' ')} • Reason: <strong>{application.rejectionReason || 'Institutional criteria not met'}</strong>
                  </p>
                </div>
              </div>
              {application.reviews && application.reviews.length > 0 && (
                <div className="bonafide-callout-comment">
                  <strong>Reviewer Remarks:</strong> &ldquo;{application.reviews[application.reviews.length - 1]?.comments || 'Please revise student or document details.'}&rdquo;
                </div>
              )}
              {canEditResubmit && (
                <div style={{ marginTop: '10px' }}>
                  <button
                    className="bonafide-btn-primary"
                    style={{ background: '#b91c1c', borderColor: '#991b1b' }}
                    onClick={() => {
                      onClose();
                      onEditResubmit && onEditResubmit(application);
                    }}
                  >
                    <Edit3 size={15} />
                    <span>Edit and Resubmit Application</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Certificate Ready Banner */}
          {isIssued && (
            <div className="bonafide-issued-callout">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#059669" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#065f46' }}>
                    Official Certificate Issued & Ready
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#047857' }}>
                    Certificate Ref: <strong>{application.certificate?.certificateNumber || `GIFT/BONA/${application.applicationNumber}`}</strong> • Digitally signed & verified
                  </p>
                </div>
              </div>
              <button
                className="bonafide-btn-primary"
                style={{ background: '#059669', borderColor: '#047857' }}
                onClick={handleDownloadCertificate}
                disabled={downloading}
              >
                <Download size={16} />
                <span>{downloading ? 'Downloading...' : 'Download Official PDF'}</span>
              </button>
            </div>
          )}

          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bonafide-timeline-container">
              <div className="bonafide-timeline-steps">
                {stages.map((stageItem, index) => {
                  const info = getStageStatus(stageItem, index);
                  const isDone = info.status === 'APPROVED';
                  const isErr = info.status === 'REJECTED';
                  const isWarn = info.status === 'CHANGES_REQUESTED';
                  const isPending = info.status === 'PENDING';

                  return (
                    <div key={stageItem.stageKey} className={`bonafide-timeline-item state-${info.status.toLowerCase()}`}>
                      <div className="bonafide-timeline-left">
                        <div className="bonafide-timeline-icon">
                          {isDone ? (
                            <div className="bonafide-timeline-step-icon is-green" title="Completed">
                              <CheckCircle2 size={18} color="#059669" />
                            </div>
                          ) : isErr ? (
                            <div className="bonafide-timeline-step-icon is-red-error" title="Rejected">
                              <XCircle size={18} color="#dc2626" />
                            </div>
                          ) : isWarn ? (
                            <div className="bonafide-timeline-step-icon is-orange" title="Changes Requested">
                              <AlertTriangle size={18} color="#ea580c" />
                            </div>
                          ) : (
                            /* Pending shows RED */
                            <div className="bonafide-timeline-step-icon is-red-pending" title="Pending Approval">
                              <div className="bonafide-timeline-dot is-red" />
                            </div>
                          )}
                        </div>
                        {index < stages.length - 1 && (
                          <div
                            className={`bonafide-timeline-line ${
                              index < activeStageIdx - 1 || allStagesCompleted ? 'is-green' : 'is-pending'
                            }`}
                          />
                        )}
                      </div>

                      <div className="bonafide-timeline-content">
                        <div className="bonafide-timeline-row">
                          <strong className={`bonafide-timeline-stage-title ${isDone ? 'is-green' : isPending ? 'is-pending' : ''}`}>
                            {stageItem.label}
                          </strong>
                          <span
                            className={`bonafide-timeline-badge ${
                              isDone
                                ? 'badge-completed'
                                : isErr
                                ? 'badge-rejected'
                                : isWarn
                                ? 'badge-changes_requested'
                                : 'badge-pending-red'
                            }`}
                          >
                            {info.label || (isDone ? 'Completed' : 'Pending')}
                          </span>
                        </div>
                        <div className="bonafide-timeline-dept">
                          <span>Responsible Role: <strong>{stageItem.dept}</strong></span>
                        </div>

                        {/* Submission note for student stage */}
                        {info.actionInfo && (
                          <div className="bonafide-timeline-review-box is-green-box">
                            <div className="bonafide-timeline-reviewer">
                              <span>Submitted by: <strong>{info.actionInfo.reviewerName}</strong> ({info.actionInfo.reviewerRole})</span>
                              <span>{new Date(info.actionInfo.date).toLocaleString('en-GB')}</span>
                            </div>
                            <p className="bonafide-timeline-remarks" style={{ color: '#047857' }}>
                              &ldquo;{info.actionInfo.note}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Reviewer remarks if stage reviewed */}
                        {info.review && (
                          <div className={`bonafide-timeline-review-box ${isDone ? 'is-green-box' : isErr ? 'is-red-box' : ''}`}>
                            <div className="bonafide-timeline-reviewer">
                              <span>Action by: <strong>{info.review.reviewerName || 'Institutional Officer'}</strong> ({info.review.reviewerRole})</span>
                              <span>{new Date(info.review.reviewedAt || info.review.createdAt).toLocaleString('en-GB')}</span>
                            </div>
                            {info.review.comments && (
                              <p className="bonafide-timeline-remarks">
                                &ldquo;{info.review.comments}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DOWNLOAD OPTION WHEN ALL STAGES ARE COMPLETED */}
              {allStagesCompleted && (
                <div className="bonafide-timeline-download-card">
                  <div className="bonafide-timeline-download-left">
                    <div className="bonafide-cert-success-icon">
                      <CheckCircle2 size={24} color="#059669" />
                    </div>
                    <div>
                      <h4 className="bonafide-cert-success-title">
                        All Stages Completed & Bonafide Certificate Ready
                      </h4>
                      <p className="bonafide-cert-success-subtitle">
                        Certificate ID: <strong>{application.certificate?.certificateNumber || `GIFT/BONA/${application.applicationNumber}`}</strong> • Digitally signed & verified by Institutional Authority
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bonafide-btn-primary bonafide-download-btn-pulse"
                    onClick={handleDownloadCertificate}
                    disabled={downloading}
                  >
                    <Download size={16} />
                    <span>{downloading ? 'Downloading...' : 'Download Official PDF'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLICATION DETAILS */}
          {activeTab === 'details' && (
            <div className="bonafide-details-grid">
              {/* Student Profile Card */}
              <div className="bonafide-info-card">
                <div className="bonafide-info-header">
                  <User size={16} />
                  <strong>Student Academic Profile</strong>
                </div>
                <div className="bonafide-info-content">
                  <div className="info-pair"><span>Name:</span> <strong>{data.studentName || application.student?.name}</strong></div>
                  <div className="info-pair"><span>Roll / Reg No:</span> <strong>{data.registrationNumber || application.student?.registrationNumber}</strong></div>
                  <div className="info-pair"><span>Programme:</span> <strong>{data.course || 'B.Tech'}</strong></div>
                  <div className="info-pair"><span>Branch:</span> <strong>{data.department || 'Computer Science & Engineering'}</strong></div>
                  <div className="info-pair"><span>Year & Semester:</span> <strong>{data.currentYear} • {data.currentSemester}</strong></div>
                  <div className="info-pair"><span>Parent Name:</span> <strong>{data.parentName || '—'}</strong></div>
                </div>
              </div>

              {/* Purpose Specific Information */}
              <div className="bonafide-info-card">
                <div className="bonafide-info-header">
                  <FileText size={16} />
                  <strong>Purpose Information & Requirements</strong>
                </div>
                <div className="bonafide-info-content">
                  {application.purpose === 'INTERNSHIP' && (
                    <>
                      <div className="info-pair"><span>Company:</span> <strong>{data.companyName}</strong></div>
                      <div className="info-pair"><span>Designation:</span> <strong>{data.internshipRole}</strong></div>
                      <div className="info-pair"><span>Dates:</span> <strong>{data.startDate} to {data.endDate}</strong></div>
                      <div className="info-pair"><span>Location / Mode:</span> <strong>{data.locationMode} ({data.internshipLocation})</strong></div>
                      <div className="info-pair"><span>Purpose:</span> <span>{data.internshipPurpose}</span></div>
                    </>
                  )}

                  {application.purpose === 'SCHOLARSHIP_HOSTELLER' && (
                    <>
                      <div className="info-pair"><span>Scheme:</span> <strong>{data.scholarshipScheme}</strong></div>
                      <div className="info-pair"><span>Hostel Residence:</span> <strong>{data.hostelName} (Room {data.roomNumber})</strong></div>
                      <div className="info-pair"><span>Residency Category:</span> <strong>{data.hostelStatus}</strong></div>
                      <div className="info-pair"><span>Category:</span> <strong>{data.studentCategory}</strong></div>
                      <div className="info-pair"><span>Hostel Fee Details:</span> <span>{data.hostelFeeRemarks}</span></div>
                    </>
                  )}

                  {application.purpose === 'STUDY_LOAN' && (
                    <>
                      <div className="info-pair"><span>Bank / Institution:</span> <strong>{data.bankName}</strong></div>
                      <div className="info-pair"><span>Branch:</span> <strong>{data.bankBranch}</strong></div>
                      <div className="info-pair"><span>Residency Type:</span> <strong>{data.isHostellerLoan ? 'Hosteller (Academic + Hostel)' : 'Day Scholar'}</strong></div>
                      {data.feeStructure && (
                        <div className="info-pair">
                          <span>4-Year Grand Total:</span>
                          <strong className="text-indigo-800">₹{data.feeStructure.grandTotal?.toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                    </>
                  )}

                  {application.purpose === 'EXTERNAL_EVENT' && (
                    <>
                      <div className="info-pair"><span>Event Name:</span> <strong>{data.eventName}</strong></div>
                      <div className="info-pair"><span>Organizer:</span> <strong>{data.organizerName}</strong></div>
                      <div className="info-pair"><span>Location & Dates:</span> <strong>{data.eventLocation} ({data.eventStartDate} to {data.eventEndDate})</strong></div>
                      <div className="info-pair"><span>Participation:</span> <strong>{data.participationType} {data.teamName ? `(${data.teamName})` : ''}</strong></div>
                      <div className="info-pair"><span>Team Members:</span> <span>{data.teamMembers}</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Supporting Verification Documents Card */}
              <div className="bonafide-info-card" style={{ gridColumn: '1 / -1' }}>
                <div className="bonafide-info-header">
                  <FileText size={16} />
                  <strong>Supportive Verification Documents</strong>
                </div>
                <div className="bonafide-info-content">
                  {(() => {
                    const supportingDocsList = (application.supportingDocs && application.supportingDocs.length > 0)
                      ? application.supportingDocs
                      : [data.offerLetterDoc, data.scholarshipDoc, data.loanDoc, data.eventDoc].filter(Boolean);

                    if (supportingDocsList.length > 0) {
                      return supportingDocsList.map((doc, idx) => {
                        const docName = doc.fileName || doc.name || `Supportive Document #${idx + 1}`;
                        const docSize = doc.fileSize || (doc.sizeInBytes ? `${(doc.sizeInBytes / (1024 * 1024)).toFixed(2)} MB` : 'Attached');
                        const isPdf = doc.fileType?.includes('pdf') || docName.toLowerCase().endsWith('.pdf');
                        const isImage = doc.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(docName);

                        return (
                          <div key={idx} className="bonafide-supportive-doc-card">
                            <div className="bonafide-supportive-doc-left">
                              <div className={`bonafide-uploaded-icon-box ${isPdf ? 'is-pdf' : 'is-doc'}`} style={{ width: '38px', height: '38px' }}>
                                <FileText size={18} />
                              </div>
                              <div className="bonafide-supportive-doc-info">
                                <span className="bonafide-supportive-doc-name" title={docName}>{docName}</span>
                                <div className="bonafide-supportive-doc-sub">
                                  <span className="bonafide-file-size-pill">{docSize}</span>
                                  <span>•</span>
                                  <span style={{ color: '#059669', fontWeight: 500 }}>Uploaded Document</span>
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                className="bonafide-upload-action-btn view-btn"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setDocPreviewOpen(true);
                                }}
                              >
                                <Eye size={13} />
                                <span>Preview</span>
                              </button>
                              {doc.dataUrl && (
                                <button
                                  type="button"
                                  className="bonafide-upload-action-btn replace-btn"
                                  onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = doc.dataUrl;
                                    a.download = docName;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                  }}
                                >
                                  <Download size={13} />
                                  <span>Download</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    }

                    if (data.offerLetterUrl || data.supportingDocUrl) {
                      return (
                        <div className="info-pair">
                          <span>Document Reference:</span>
                          <strong>{data.offerLetterUrl || data.supportingDocUrl}</strong>
                        </div>
                      );
                    }

                    return (
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
                        No separate supportive document uploaded for this application.
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVISIONS */}
          {activeTab === 'revisions' && (
            <div className="bonafide-revisions-list">
              {application.revisions?.map((rev, idx) => (
                <div key={rev.id || idx} className="bonafide-revision-item">
                  <div className="bonafide-revision-top">
                    <strong>Revision #{rev.revisionNumber}</strong>
                    <span>{new Date(rev.createdAt).toLocaleString('en-GB')}</span>
                  </div>
                  {rev.changeSummary && (
                    <p className="bonafide-revision-summary">
                      Changes: {rev.changeSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bonafide-modal-footer">
          <div className="bonafide-footer-left">
            {canWithdraw && !showWithdrawConfirm && (
              <button
                className="bonafide-btn-ghost text-red-600"
                onClick={() => setShowWithdrawConfirm(true)}
              >
                Withdraw Application
              </button>
            )}
            {showWithdrawConfirm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Reason for withdrawal..."
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <button
                  className="bonafide-btn-primary"
                  style={{ background: '#dc2626', borderColor: '#b91c1c', padding: '6px 12px' }}
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdraw'}
                </button>
                <button className="bonafide-btn-ghost" onClick={() => setShowWithdrawConfirm(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="bonafide-footer-right">
            <button className="bonafide-btn-secondary" onClick={onClose}>
              Close
            </button>
            {isIssued && (
              <button
                className="bonafide-btn-primary"
                style={{ background: '#059669', borderColor: '#047857' }}
                onClick={handleDownloadCertificate}
                disabled={downloading}
              >
                <Download size={16} />
                <span>{downloading ? 'Downloading...' : 'Download Certificate PDF'}</span>
              </button>
            )}
            {canEditResubmit && (
              <button
                className="bonafide-btn-primary"
                onClick={() => {
                  onClose();
                  onEditResubmit && onEditResubmit(application);
                }}
              >
                <Edit3 size={16} />
                <span>Edit & Resubmit</span>
              </button>
            )}
          </div>
        </div>
        {/* Document Preview Modal */}
        {docPreviewOpen && selectedDoc && (
          <BonafideDocPreviewModal
            isOpen={docPreviewOpen}
            onClose={() => {
              setDocPreviewOpen(false);
              setSelectedDoc(null);
            }}
            doc={selectedDoc}
          />
        )}
      </div>
    </div>
  );
}
