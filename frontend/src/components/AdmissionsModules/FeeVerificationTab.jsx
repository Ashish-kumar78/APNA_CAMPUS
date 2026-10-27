import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  X,
  ShieldAlert,
  RotateCcw,
  Building2,
  FileText,
} from 'lucide-react';

export default function FeeVerificationTab({
  applicants = [],
  courses = [],
  onVerifyFee,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // Receipt Preview Modal
  const [previewReceiptState, setPreviewReceiptState] = useState(null);

  // Verification Remarks Modal
  const [actionModalState, setActionModalState] = useState({
    isOpen: false,
    applicant: null,
    targetStatus: 'Verified',
    remarks: '',
  });

  // Extract fee records from applicants
  const feeRecords = applicants.map((app) => {
    const fee = app.feeDetails || {
      amount: 115000,
      paidAmount: 0,
      status: 'Pending',
      txnRef: 'N/A',
      date: null,
      receiptNo: null,
      verifier: null,
    };
    return {
      appId: app.id,
      applicationNo: app.applicationNo,
      applicantName: app.name,
      course: app.appliedCourse,
      courseCode: app.courseCode,
      feeAmount: fee.amount || 115000,
      paidAmount: fee.paidAmount || 0,
      paymentStatus: fee.status || 'Pending',
      txnRef: fee.txnRef || 'N/A',
      paymentDate: fee.date || 'Pending',
      receiptNo: fee.receiptNo || 'Pending',
      verifier: fee.verifier || 'Accounts Office',
      remarks: fee.remarks || '',
    };
  });

  const filteredRecords = feeRecords.filter((rec) => {
    if (courseFilter !== 'All' && rec.course !== courseFilter && rec.courseCode !== courseFilter) {
      return false;
    }
    if (paymentStatusFilter !== 'All' && rec.paymentStatus !== paymentStatusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.applicantName?.toLowerCase().includes(q) ||
        rec.applicationNo?.toLowerCase().includes(q) ||
        rec.txnRef?.toLowerCase().includes(q) ||
        rec.receiptNo?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFeeCollected = feeRecords.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
  const verifiedCount = feeRecords.filter((r) => r.paymentStatus === 'Verified').length;
  const underVerificationCount = feeRecords.filter((r) => r.paymentStatus === 'Under Verification').length;
  const pendingCount = feeRecords.filter((r) => r.paymentStatus === 'Pending').length;

  const handleOpenActionModal = (rec, status) => {
    setActionModalState({
      isOpen: true,
      applicant: rec,
      targetStatus: status,
      remarks:
        status === 'Verified'
          ? 'Confirmed ledger credit with State Bank of India Campus Branch UTR.'
          : status === 'Refund Requested'
          ? 'Candidate requested seat cancellation and pro-rata statutory fee refund.'
          : 'Bank reconciliation discrepancy flagged. Awaiting bank advice.',
    });
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!actionModalState.applicant) return;
    onVerifyFee &&
      onVerifyFee(
        actionModalState.applicant.appId,
        actionModalState.targetStatus,
        actionModalState.remarks,
        'Mr. S. K. Roy (Accounts Officer)'
      );
    setActionModalState({ isOpen: false, applicant: null, targetStatus: 'Verified', remarks: '' });
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Admission Fee Clearance &amp; Ledger Verification
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Reconcile seat acceptance deposits, verify transaction references (UTR), scrutinize bank receipts, and clear accounts audit.
          </p>
        </div>
      </div>

      {/* Security Compliance Warning */}
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#92400e',
        }}
      >
        <ShieldAlert size={20} color="#d97706" />
        <div>
          <strong>Financial Audit Rule:</strong> Unverified payment screenshots or client slips must never be accepted as proof of successful settlement. Official enrollment requires bank ledger credit confirmation by the Central Accounts Directorate.
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card green">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Verified Payments</span>
            <div className="adm-kpi-icon-wrap"><CheckCircle2 size={16} color="#059669" /></div>
          </div>
          <div className="adm-kpi-value">{verifiedCount}</div>
          <div className="adm-kpi-foot">Reconciled in college ledger</div>
        </div>

        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Under Verification</span>
            <div className="adm-kpi-icon-wrap"><Clock size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">{underVerificationCount}</div>
          <div className="adm-kpi-foot" style={{ color: '#d97706', fontWeight: 600 }}>
            NEFT/RTGS UTR in audit
          </div>
        </div>

        <div className="adm-kpi-card rose">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Pending Payment</span>
            <div className="adm-kpi-icon-wrap"><AlertCircle size={16} color="#e11d48" /></div>
          </div>
          <div className="adm-kpi-value">{pendingCount}</div>
          <div className="adm-kpi-foot">Selected but unpaid</div>
        </div>

        <div className="adm-kpi-card blue">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Realized Inflow</span>
            <div className="adm-kpi-icon-wrap"><Receipt size={16} color="#0284c7" /></div>
          </div>
          <div className="adm-kpi-value" style={{ fontSize: '1.4rem' }}>
            ₹{(totalFeeCollected / 10000000).toFixed(2)} Cr
          </div>
          <div className="adm-kpi-foot">Session 2026-27 Autumn</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="adm-filter-bar">
        <div className="adm-search-input-wrap">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, application ID, transaction reference (UTR)..."
          />
        </div>

        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="All">All Disciplines</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            className="adm-select-control"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="All">All Payment Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Paid">Paid (Pending Scrutiny)</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refund Requested">Refund Requested</option>
          </select>
        </div>
      </div>

      {/* Master Fee Reconciliation Table */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <Receipt size={18} color="#0284c7" /> Fee Scrutiny Roster ({filteredRecords.length} Transactions)
            </h3>
            <p className="adm-panel-desc">
              Cross-checked against college bank settlement ledger before official student registration is provisioned
            </p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Applicant ID &amp; Name</th>
                <th>Course Applied</th>
                <th>Admission Fee</th>
                <th>Paid Amount</th>
                <th>Payment Status</th>
                <th>Transaction Ref (UTR)</th>
                <th>Payment Date</th>
                <th>Receipt No</th>
                <th>Auditor</th>
                <th style={{ textAlign: 'right' }}>Scrutiny Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => {
                const isVerified = rec.paymentStatus === 'Verified';
                const isUnderVer = rec.paymentStatus === 'Under Verification';
                const isPending = rec.paymentStatus === 'Pending';

                return (
                  <tr key={rec.appId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.applicantName}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#0284c7' }}>
                        {rec.applicationNo}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#334155' }}>
                      {rec.course}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{rec.feeAmount?.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 800, color: rec.paidAmount > 0 ? '#059669' : '#e11d48' }}>
                      ₹{rec.paidAmount?.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`adm-status-tag ${
                          isVerified
                            ? 'verified'
                            : isUnderVer
                            ? 'under_review'
                            : isPending
                            ? 'documents_pending'
                            : 'rejected'
                        }`}
                      >
                        {rec.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.74rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0369a1' }}>
                        {rec.txnRef}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.74rem', color: '#475569' }}>
                      {rec.paymentDate}
                    </td>
                    <td style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#475569' }}>
                      {rec.receiptNo}
                    </td>
                    <td style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {rec.verifier}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Preview Receipt */}
                        <button
                          type="button"
                          className="adm-btn-secondary"
                          onClick={() => setPreviewReceiptState(rec)}
                          style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                        >
                          <Eye size={12} /> Receipt
                        </button>

                        {/* Verify Payment */}
                        {!isVerified && rec.paidAmount > 0 && (
                          <button
                            type="button"
                            className="adm-btn-success"
                            onClick={() => handleOpenActionModal(rec, 'Verified')}
                            style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                          >
                            <Check size={12} /> Verify
                          </button>
                        )}

                        {/* Discrepancy / Refund */}
                        {isVerified && (
                          <button
                            type="button"
                            className="adm-btn-danger"
                            onClick={() => handleOpenActionModal(rec, 'Refund Requested')}
                            style={{ padding: '4px 8px', fontSize: '0.73rem' }}
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      {previewReceiptState && (
        <div className="adm-modal-backdrop" onClick={() => setPreviewReceiptState(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  Institutional Fee Receipt Docket
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  Receipt No: {previewReceiptState.receiptNo} · UTR: {previewReceiptState.txnRef}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReceiptState(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="adm-modal-body">
              <div
                style={{
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>APNA CAMPUS</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Central Accounts &amp; Treasury Directorate</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>
                      {previewReceiptState.paymentStatus.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Date: {previewReceiptState.paymentDate}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', marginBottom: '16px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Student Name:</span>
                    <div style={{ fontWeight: 700 }}>{previewReceiptState.applicantName}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Application No:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{previewReceiptState.applicationNo}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Program Enrolled:</span>
                    <div style={{ fontWeight: 600 }}>{previewReceiptState.course}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Bank Reference (UTR):</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0369a1' }}>{previewReceiptState.txnRef}</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Fee Component</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>Tuition &amp; Academic Development Fee</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                        ₹{(previewReceiptState.feeAmount * 0.75).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>Institutional Infrastructure &amp; Lab Fund</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                        ₹{(previewReceiptState.feeAmount * 0.15).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>Refundable Caution Deposit</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                        ₹{(previewReceiptState.feeAmount * 0.1).toLocaleString()}
                      </td>
                    </tr>
                    <tr style={{ background: '#f0fdf4', fontWeight: 800 }}>
                      <td style={{ padding: '8px', color: '#166534' }}>Total Amount Paid</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#166534', fontSize: '0.95rem' }}>
                        ₹{previewReceiptState.paidAmount?.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Verified Officer: {previewReceiptState.verifier}</span>
                  <span>BPUT Affiliated Institutional Record</span>
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setPreviewReceiptState(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION REMARKS MODAL */}
      {actionModalState.isOpen && (
        <div className="adm-modal-backdrop" onClick={() => setActionModalState({ ...actionModalState, isOpen: false })}>
          <div className="adm-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Certify Fee Clearance · {actionModalState.applicant?.applicantName}
              </h3>
              <button
                type="button"
                onClick={() => setActionModalState({ ...actionModalState, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAction}>
              <div className="adm-modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Target Verification Status *
                  </label>
                  <select
                    className="adm-select-control"
                    style={{ width: '100%' }}
                    value={actionModalState.targetStatus}
                    onChange={(e) => setActionModalState({ ...actionModalState, targetStatus: e.target.value })}
                  >
                    <option value="Verified">Verified (Confirmed Ledger Settlement)</option>
                    <option value="Under Verification">Under Verification (Audit in Progress)</option>
                    <option value="Failed">Failed (Discrepancy / Payment Bounced)</option>
                    <option value="Refund Requested">Refund Requested (Seat Withdrawn)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Accounts Officer Audit Remarks *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={actionModalState.remarks}
                    onChange={(e) => setActionModalState({ ...actionModalState, remarks: e.target.value })}
                    className="adm-search-input"
                    style={{ padding: '10px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setActionModalState({ ...actionModalState, isOpen: false })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={actionModalState.targetStatus === 'Verified' ? 'adm-btn-success' : 'adm-btn-primary'}
                >
                  Save Fee Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
