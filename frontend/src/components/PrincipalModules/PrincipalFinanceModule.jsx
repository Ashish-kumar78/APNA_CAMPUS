import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Printer,
  DollarSign,
  Coins,
  FileText,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { FINANCIAL_OVERVIEW, INITIAL_PURCHASE_REQUISITIONS, INITIAL_DEPARTMENTS } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalFinanceModule({ onToast }) {
  const [financeOverview, setFinanceOverview] = useState(FINANCIAL_OVERVIEW);
  const [requisitions, setRequisitions] = useState(INITIAL_PURCHASE_REQUISITIONS);
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);

  // Filters
  const [reqCategoryFilter, setReqCategoryFilter] = useState('All');
  const [reqStatusFilter, setReqStatusFilter] = useState('All');

  // Modals
  const [previewReportModal, setPreviewReportModal] = useState(false);
  const [actionReqModal, setActionReqModal] = useState(null); // null or { item: req, type: 'APPROVE' | 'REJECT' }
  const [rejectReason, setRejectReason] = useState('');

  // Format INR in Crores / Lakhs
  const formatInrCr = (val) => `₹${(val / 10000000).toFixed(2)} Cr`;
  const formatInrLakh = (val) => `₹${(val / 100000).toFixed(2)} L`;

  // Filtered Requisitions
  const filteredRequisitions = requisitions.filter((r) => {
    const matchCat = reqCategoryFilter === 'All' || r.category === reqCategoryFilter;
    const matchStatus =
      reqStatusFilter === 'All' ||
      (reqStatusFilter === 'Pending' && r.status.includes('Pending')) ||
      (reqStatusFilter === 'Approved' && r.status.includes('Approved'));
    return matchCat && matchStatus;
  });

  const pendingReqsCount = requisitions.filter((r) => r.status.includes('Pending')).length;

  // Handle Requisition Action
  const handleConfirmReqAction = () => {
    if (!actionReqModal) return;
    const targetId = actionReqModal.item.id;

    if (actionReqModal.type === 'APPROVE') {
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === targetId
            ? {
                ...r,
                status: 'Approved by Principal',
                sanctionedDate: new Date().toLocaleDateString('en-GB'),
              }
            : r
        )
      );
      if (onToast) onToast(`Requisition ${targetId} sanctioned for ₹${(actionReqModal.item.amount / 100000).toFixed(2)} Lakhs.`);
    } else {
      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === targetId
            ? {
                ...r,
                status: 'Returned for Clarification',
                rejectionRemarks: rejectReason || 'Insufficient technical justification.',
              }
            : r
        )
      );
      if (onToast) onToast(`Requisition ${targetId} returned to ${actionReqModal.item.department} for review.`);
    }

    setActionReqModal(null);
    setRejectReason('');
  };

  return (
    <div className="principal-module-container">
      {/* Statutory Disclaimer Notice */}
      <div className="principal-banner-notice warning">
        <div className="principal-banner-text">
          <ShieldAlert size={18} color="#b45309" />
          <span>
            <strong>Simulated Institutional Financial Sandbox:</strong> All figures and budget allocations shown are for academic strategic governance modeling only.
          </span>
        </div>
        <div className="principal-banner-badge">Audited Sample AY 2026–27</div>
      </div>

      {/* Primary Financial Overview Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Annual Institutional Budget</span>
            <Coins size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val">{formatInrCr(financeOverview.annualBudgetAllocated)}</div>
          <div className="principal-stat-box-sub">Sanctioned by Board of Governors</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Expenditure Incurred</span>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>
            {formatInrCr(financeOverview.expenditureIncurred)}
          </div>
          <div className="principal-stat-box-sub">{financeOverview.budgetUtilizationPct}% Utilization YTD</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Remaining Unspent Capital</span>
            <CreditCard size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">{formatInrCr(financeOverview.remainingBudget)}</div>
          <div className="principal-stat-box-sub">Available for Capex &amp; Operations</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Fee Collections YTD</span>
            <CheckCircle2 size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#0284c7' }}>
            {formatInrCr(financeOverview.feeCollected)}
          </div>
          <div className="principal-stat-box-sub">
            {financeOverview.feeCollectionPct}% of target · {formatInrCr(financeOverview.outstandingFees)} Pending
          </div>
        </div>
      </div>

      {/* Two Column Layout: Department Budget Pace & Fee Collection Trends */}
      <div className="principal-two-col">
        {/* Department Budget Allocation vs Expenditure */}
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Department-Wise Budget Allocation &amp; Utilization</h3>
              <p>Operational capex and opex utilization across 8 academic departments</p>
            </div>
            <button
              className="erp-btn erp-btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => setPreviewReportModal(true)}
            >
              <FileSpreadsheet size={13} /> Financial Report
            </button>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Allocated</th>
                  <th>Utilized</th>
                  <th>Pace (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => {
                  const pct = Math.round(((d.budgetUtilized || 18000000) / (d.budgetAllocated || 25000000)) * 100);
                  return (
                    <tr key={d.code}>
                      <td>
                        <strong>{d.code}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.name}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatInrCr(d.budgetAllocated)}</td>
                      <td style={{ fontWeight: 600, color: '#15803d' }}>{formatInrCr(d.budgetUtilized)}</td>
                      <td style={{ minWidth: '100px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="p-progress-track" style={{ flex: 1 }}>
                            <div
                              className="p-progress-fill"
                              style={{
                                width: `${pct}%`,
                                background: pct > 85 ? '#ef4444' : pct > 70 ? '#10b981' : '#0284c7',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`pbadge ${pct > 85 ? 'warning' : 'success'}`}>
                          {pct > 85 ? 'Threshold Alert' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Category Breakdown & Fee Collection Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="erp-panel">
            <div className="erp-panel-header">
              <div className="erp-panel-title">
                <h3>Institutional Capex &amp; Opex Breakdown</h3>
                <p>Major expense categories across campus infrastructure</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Faculty & Staff Payroll / Benefits', amount: '₹14.80 Cr', pct: 61, color: '#0284c7' },
                { name: 'Laboratory Equipment & High-Performance Computing', amount: '₹3.65 Cr', pct: 15, color: '#10b981' },
                { name: 'Campus Utilities, Substation & Maintenance', amount: '₹2.80 Cr', pct: 12, color: '#f59e0b' },
                { name: 'Digital Library, Scopus & Software Licenses', amount: '₹1.50 Cr', pct: 6, color: '#8b5cf6' },
                { name: 'Student Development, Sports & FDP Grants', amount: '₹1.40 Cr', pct: 6, color: '#ec4899' },
              ].map((item, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                    <span style={{ color: '#1e293b' }}>{item.name}</span>
                    <span style={{ color: '#0f172a' }}>{item.amount} ({item.pct}%)</span>
                  </div>
                  <div className="p-progress-track">
                    <div className="p-progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="erp-panel">
            <div className="erp-panel-header">
              <div className="erp-panel-title">
                <h3>Fee Collection &amp; Scholarship Realization</h3>
                <p>Tuition dues and autonomous welfare concessions</p>
              </div>
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Realized Tuition Fees</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>₹24.60 Cr</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Outstanding Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309' }}>₹2.00 Cr</div>
                </div>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#3b82f6', marginTop: 6 }}>
                2,310 of 2,480 scholars fully cleared. Final overdue reminder notices dispatched by Bursar office.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Capital Requisitions Approval Queue (Principal's Authority) */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Principal Capital Expenditure (Capex) Approval Queue</h3>
            <p>High-value equipment and operational purchase requisitions requiring Principal executive endorsement</p>
          </div>
          <span className="pbadge warning">{pendingReqsCount} Awaiting Sanction</span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Requisition ID &amp; Item</th>
                <th>Department</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Vendor / Payee</th>
                <th>Recommended By</th>
                <th>Status</th>
                <th>Executive Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequisitions.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Ref: {req.id} · {req.date}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2, fontStyle: 'italic' }}>
                      "{req.justification}"
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{req.department}</td>
                  <td>
                    <span className="pbadge slate">{req.category}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                      {formatInrLakh(req.amount)}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#334155' }}>{req.vendor}</td>
                  <td style={{ fontSize: '0.78rem', color: '#475569' }}>{req.recommendedBy}</td>
                  <td>
                    <span
                      className={`pbadge ${
                        req.status.includes('Approved')
                          ? 'success'
                          : req.status.includes('Pending')
                          ? 'warning'
                          : 'danger'
                      }`}
                    >
                      {req.status}
                    </span>
                    {req.rejectionRemarks && (
                      <div style={{ fontSize: '0.7rem', color: '#b91c1c', marginTop: 2 }}>
                        Note: {req.rejectionRemarks}
                      </div>
                    )}
                  </td>
                  <td>
                    {req.status.includes('Pending') ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="erp-btn erp-btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Sanction Capital Expenditure"
                          onClick={() => setActionReqModal({ item: req, type: 'APPROVE' })}
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#dc2626' }}
                          title="Return for Clarification"
                          onClick={() => setActionReqModal({ item: req, type: 'REJECT' })}
                        >
                          <X size={13} /> Query
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ACTION REQUISITION (APPROVE / REJECT)            */}
      {/* ======================================================== */}
      {actionReqModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '580px' }}>
            <div className="principal-modal-header">
              <h3 style={{ margin: 0, color: actionReqModal.type === 'APPROVE' ? '#0f172a' : '#dc2626' }}>
                {actionReqModal.type === 'APPROVE'
                  ? 'Sanction Capital Expenditure Requisition'
                  : 'Return Requisition for Committee Clarification'}
              </h3>
              <button
                type="button"
                onClick={() => setActionReqModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{actionReqModal.item.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
                  Dept: {actionReqModal.item.department} · Recommended by: {actionReqModal.item.recommendedBy}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', marginTop: 6 }}>
                  Total Amount: {formatInrLakh(actionReqModal.item.amount)}
                </div>
              </div>

              {actionReqModal.type === 'REJECT' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Clarification Query / Justification Remarks *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific directions for department resubmission..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              )}
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setActionReqModal(null)}>
                Cancel
              </button>
              <button
                className={`erp-btn ${actionReqModal.type === 'APPROVE' ? 'erp-btn-primary' : 'erp-btn-danger'}`}
                onClick={handleConfirmReqAction}
              >
                {actionReqModal.type === 'APPROVE' ? 'Confirm Financial Sanction' : 'Return Requisition'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FINANCIAL REPORT PREVIEW                          */}
      {/* ======================================================== */}
      {previewReportModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '750px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Executive Financial Statement (Autonomous AY 2026–27)</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReportModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>FINANCIAL AUDIT &amp; ALLOCATION LEDGER</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Office of the Principal · Autonomous Campus Fund Statement</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                  <div>Report Date: {new Date().toLocaleDateString('en-GB')}</div>
                  <div style={{ color: '#b45309', fontWeight: 600 }}>Simulated Data Snapshot</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Total Allocated</small>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>₹32.50 Cr</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Total Expended</small>
                  <div style={{ fontWeight: 800, color: '#15803d' }}>₹24.15 Cr</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Balance Reserve</small>
                  <div style={{ fontWeight: 800, color: '#0284c7' }}>₹8.35 Cr</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Fee Collection Rate</small>
                  <div style={{ fontWeight: 800, color: '#7c3aed' }}>92.5%</div>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                Summary prepared for Board of Governors Finance Sub-Committee. Capital investments in GPU computing labs and solar electrical substation modernization comply with autonomous financial allocation bylaws.
              </p>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setPreviewReportModal(false)}>
                Close
              </button>
              <button className="erp-btn erp-btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
