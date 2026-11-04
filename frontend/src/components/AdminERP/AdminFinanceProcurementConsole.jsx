import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  X,
  FileCheck,
  Check,
  Receipt,
  ShoppingCart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../../services/api';

export default function AdminFinanceProcurementConsole({ account }) {
  const [subTab, setSubTab] = useState('budgets'); // 'budgets', 'requisitions', 'vendors', 'invoices'
  const [budgetData, setBudgetData] = useState(null);
  const [requisitions, setRequisitions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [prForm, setPrForm] = useState({
    department: 'Computer Science & Engineering',
    itemDescription: '',
    quantity: 1,
    estimatedCost: 100000,
    priority: 'Normal',
    requiredByDate: '2026-11-30',
    justification: '',
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [budRes, prRes, vndRes, invRes] = await Promise.allSettled([
        api.getAdminFinanceBudgets('2026-27'),
        api.getAdminFinancePurchaseRequisitions(),
        api.getAdminFinanceVendors(),
        api.getAdminFinanceInvoices(),
      ]);

      if (budRes.status === 'fulfilled' && budRes.value?.data) {
        setBudgetData(budRes.value.data);
      }
      if (prRes.status === 'fulfilled' && Array.isArray(prRes.value?.data)) {
        setRequisitions(prRes.value.data);
      }
      if (vndRes.status === 'fulfilled' && Array.isArray(vndRes.value?.data)) {
        setVendors(vndRes.value.data);
      }
      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value?.data)) {
        setInvoices(invRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleCreatePr = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAdminFinancePurchaseRequisition(prForm);
      if (res?.data) {
        setRequisitions([res.data, ...requisitions]);
        setIsPrModalOpen(false);
        showToast(`Purchase requisition ${res.data.prNumber} submitted!`);
      }
    } catch (err) {
      alert('Error submitting PR: ' + err.message);
    }
  };

  const handleDecidePr = async (id, decision) => {
    try {
      const res = await api.decideAdminFinancePurchaseRequisition(id, {
        decision,
        remarks: decision === 'APPROVED' ? 'Approved for procurement tender' : 'Budget allocation limit exceeded',
      });
      if (res?.data) {
        setRequisitions(requisitions.map(p => p.id === id ? res.data : p));
        showToast(`Requisition ${id} ${decision.toLowerCase()}!`);
      }
    } catch (err) {
      alert('Error updating PR: ' + err.message);
    }
  };

  const handleVerifyInvoice = async (id) => {
    try {
      const res = await api.verifyAdminFinanceInvoice(id, {
        status: 'VERIFIED',
        notes: '3-way matching verified against PO and Good Receipt Note (GRN)',
      });
      if (res?.data) {
        setInvoices(invoices.map(i => i.id === id ? res.data : i));
        showToast(`Invoice ${id} verified for payment release!`);
      }
    } catch (err) {
      alert('Error verifying invoice: ' + err.message);
    }
  };

  const totalAllocatedCr = budgetData?.totalAllocated ? (budgetData.totalAllocated / 10000000).toFixed(2) : '38.50';
  const totalUtilizedCr = budgetData?.totalUtilized ? (budgetData.totalUtilized / 10000000).toFixed(2) : '29.15';
  const totalRemainingCr = budgetData?.remaining ? (budgetData.remaining / 10000000).toFixed(2) : '4.55';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981',
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="admin-view-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <DollarSign size={13} />
            Institutional Finance &amp; Procurement ERP
          </div>
          <h2>Administrative Budgets, Procurement &amp; Vendor Settlement</h2>
          <p>
            Autonomous department budget allocations, capital expenditure tracking, purchase requisitions (PR) and PO approvals, and 3-way invoice reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {subTab === 'requisitions' && (
            <button className="admin-action-btn-primary" onClick={() => setIsPrModalOpen(true)}>
              <Plus size={14} /> New Purchase Requisition
            </button>
          )}
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '8px',
      }}>
        {[
          { id: 'budgets', label: 'Budget vs Actuals', icon: DollarSign },
          { id: 'requisitions', label: 'Purchase Requisitions', icon: ShoppingCart, count: requisitions.filter(r => r.status === 'PENDING_APPROVAL').length },
          { id: 'vendors', label: 'Empanelled Vendors', icon: Briefcase, count: vendors.length },
          { id: 'invoices', label: 'Invoices & 3-Way Match', icon: Receipt, count: invoices.filter(i => i.status === 'PENDING_AUDIT').length },
        ].map(t => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              <Icon size={14} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  borderRadius: '12px',
                  padding: '1px 6px',
                  fontSize: '11px',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Budgets vs Actuals */}
      {subTab === 'budgets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Annual Sanctioned Budget</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>₹{totalAllocatedCr} Cr</div>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Governing Body Approved</div>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Utilized Expenditure</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>₹{totalUtilizedCr} Cr</div>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>{budgetData?.utilizationRatePct || 75.7}% Disbursed to date</div>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Encumbered / Committed</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>₹4.80 Cr</div>
              <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>Active POs in pipeline</div>
            </div>

            <div className="admin-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Unencumbered Balance</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>₹{totalRemainingCr} Cr</div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Available for FY 2026-27</div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="admin-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
              Department-Level Budget Allocations &amp; Variance
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Sanctioned Budget</th>
                    <th>Actual Spent</th>
                    <th>Committed (POs)</th>
                    <th>Remaining Balance</th>
                    <th>Utilization %</th>
                  </tr>
                </thead>
                <tbody>
                  {(budgetData?.departmentAllocations || []).map(dept => (
                    <tr key={dept.code}>
                      <td>
                        <strong>{dept.name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {dept.code}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{(dept.allocated / 10000000).toFixed(2)} Cr</td>
                      <td style={{ color: '#7c3aed', fontWeight: 600 }}>₹{(dept.spent / 10000000).toFixed(2)} Cr</td>
                      <td style={{ color: '#d97706' }}>₹{(dept.committed / 10000000).toFixed(2)} Cr</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>₹{(dept.remaining / 10000000).toFixed(2)} Cr</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${dept.utilizationPct}%`, height: '100%', background: '#2563eb' }} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>{dept.utilizationPct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Purchase Requisitions (PR) */}
      {subTab === 'requisitions' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Procurement Demands &amp; Purchase Requisitions (PR)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Departmental procurement requests requiring administrative sanction and PO release.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PR Reference</th>
                  <th>Requester &amp; Dept</th>
                  <th>Item Description</th>
                  <th>Qty</th>
                  <th>Estimated Cost</th>
                  <th>Required By</th>
                  <th>Status &amp; PO</th>
                  <th>Administrative Action</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map(pr => (
                  <tr key={pr.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {pr.prNumber}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{pr.requester}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{pr.department}</div>
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600, maxWidth: '280px' }}>
                      {pr.itemDescription}
                      {pr.justification && (
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>
                          Justification: {pr.justification}
                        </div>
                      )}
                    </td>
                    <td>{pr.quantity}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(pr.estimatedCost).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#475569' }}>{pr.requiredByDate}</td>
                    <td>
                      <span className={`admin-badge ${pr.status === 'APPROVED' ? 'active' : pr.status === 'REJECTED' ? 'rejected' : 'pending'}`}>
                        {pr.status}
                      </span>
                      {pr.poRef && (
                        <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                          PO: {pr.poRef}
                        </div>
                      )}
                    </td>
                    <td>
                      {pr.status === 'PENDING_APPROVAL' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleDecidePr(pr.id, 'APPROVED')}
                            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Sanction
                          </button>
                          <button
                            onClick={() => handleDecidePr(pr.id, 'REJECTED')}
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {pr.decisionRemarks || 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Empanelled Vendors */}
      {subTab === 'vendors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
          {vendors.map(vnd => (
            <div key={vnd.id} className="admin-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                  {vnd.category}
                </span>
                <span className="admin-badge active" style={{ fontSize: '11px' }}>
                  {vnd.empanelmentStatus}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {vnd.name}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <div>🏢 Vendor Code: <strong>{vnd.vendorCode}</strong></div>
                <div>👤 Contact: <strong>{vnd.contactPerson}</strong> ({vnd.phone})</div>
                <div>✉ Email: <strong>{vnd.email}</strong></div>
                <div>📑 GSTIN: <code>{vnd.gstin}</code></div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700 }}>
                  ★ {vnd.performanceRating} Institutional Rating
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                  {vnd.activeContracts} Active Contracts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 4: Invoices & 3-Way Match */}
      {subTab === 'invoices' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Vendor Invoices &amp; 3-Way Matching Verification
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Reconciling Purchase Order (PO), Goods Receipt Note (GRN), and Vendor Tax Invoice.
              </p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>PO Reference</th>
                  <th>Vendor Entity</th>
                  <th>Invoice Date</th>
                  <th>Base Amount</th>
                  <th>GST (18%)</th>
                  <th>Total Payable</th>
                  <th>3-Way Match Status</th>
                  <th>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {inv.invoiceNo}
                      </code>
                    </td>
                    <td>
                      <strong>{inv.poRef}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{inv.vendorName}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{inv.invoiceDate}</td>
                    <td>₹{Number(inv.baseAmount).toLocaleString()}</td>
                    <td>₹{Number(inv.gstAmount).toLocaleString()}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(inv.totalPayable).toLocaleString()}
                    </td>
                    <td>
                      <span className={`admin-badge ${inv.matchingStatus === '3-WAY-MATCHED' ? 'active' : 'pending'}`}>
                        {inv.matchingStatus}
                      </span>
                    </td>
                    <td>
                      {inv.status === 'PENDING_AUDIT' ? (
                        <button
                          onClick={() => handleVerifyInvoice(inv.id)}
                          className="admin-action-btn-primary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          Verify &amp; Release
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                          ✓ {inv.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Purchase Requisition */}
      {isPrModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '500px', width: '100%', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setIsPrModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px 0' }}>
              Create Purchase Requisition
            </h3>
            <form onSubmit={handleCreatePr} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Requisitioning Department</label>
                <select
                  value={prForm.department}
                  onChange={(e) => setPrForm({ ...prForm, department: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Central Library">Central Library</option>
                  <option value="Campus Estate">Campus Estate &amp; Facilities</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Item Description &amp; Technical Specs</label>
                <input
                  type="text"
                  required
                  value={prForm.itemDescription}
                  onChange={(e) => setPrForm({ ...prForm, itemDescription: e.target.value })}
                  placeholder="e.g. 10 kVA Online UPS Battery Bank"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={prForm.quantity}
                    onChange={(e) => setPrForm({ ...prForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Estimated Cost (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={prForm.estimatedCost}
                    onChange={(e) => setPrForm({ ...prForm, estimatedCost: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Required By Date</label>
                <input
                  type="date"
                  value={prForm.requiredByDate}
                  onChange={(e) => setPrForm({ ...prForm, requiredByDate: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Institutional Justification</label>
                <textarea
                  rows={2}
                  value={prForm.justification}
                  onChange={(e) => setPrForm({ ...prForm, justification: e.target.value })}
                  placeholder="Required for autonomous lab expansion / equipment replacement..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsPrModalOpen(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

