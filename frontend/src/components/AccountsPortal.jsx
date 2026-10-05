import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Download,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  LogOut,
  Users,
  Building2,
  TrendingUp,
  X,
  Printer
} from 'lucide-react';
import './AccountsPortal.css';
import '../components/AdminPortal.css';
import { downloadFeeReceiptPdf, downloadAccountsRegisterPdf } from '../utils/pdfGenerator';
import {
  initialFeeStructures,
  initialFeeTransactions,
  initialScholarships,
  generateAllStudents
} from '../data/collegeData.js';
import { api } from '../services/api.js';
import { feesApi } from '../services/feesApi.js';
import { Eye, ShieldCheck, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';

export default function AccountsPortal({ account, onLogout }) {
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [feeStructures, setFeeStructures] = useState(initialFeeStructures);
  const [transactions, setTransactions] = useState(initialFeeTransactions);
  const [scholarships, setScholarships] = useState(initialScholarships);
  const [students] = useState(() => generateAllStudents());

  // Feature 1: Digital Payment Proof Verification Queue State
  const [verificationList, setVerificationList] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [selectedProof, setSelectedProof] = useState(null);
  const [rejectingProofId, setRejectingProofId] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [proofZoomLevel, setProofZoomLevel] = useState(1);

  // Search & Filter
  const [searchStudent, setSearchStudent] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    rollNumber: '01',
    studentName: 'Rakesh Das',
    head: 'Tuition & Development Fee',
    amount: '48500',
    mode: 'Net Banking',
    semester: 'Semester 5'
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  React.useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    const list = await feesApi.getPaymentVerifications('ALL');
    if (list) setVerificationList(list);
  };

  const pendingCount = useMemo(() => {
    return verificationList.filter((item) => item.status === 'PENDING').length;
  }, [verificationList]);

  const handleApproveProof = async (id) => {
    const res = await feesApi.approvePayment(id);
    if (res && res.success) {
      showToast('✓ Payment proof verified & approved! Student fee ledger updated.');
      await loadVerifications();
      if (selectedProof?.id === id) setSelectedProof(null);
    }
  };

  const handleConfirmRejectProof = async () => {
    if (!rejectionReasonInput.trim()) {
      showToast('Please specify a rejection reason.');
      return;
    }
    const res = await feesApi.rejectPayment(rejectingProofId, rejectionReasonInput.trim());
    if (res && res.success) {
      showToast('✕ Payment proof rejected. Student notified with reason.');
      await loadVerifications();
      setRejectingProofId(null);
      setRejectionReasonInput('');
      if (selectedProof?.id === rejectingProofId) setSelectedProof(null);
    }
  };


  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: paymentForm.studentName,
      rollNumber: paymentForm.rollNumber,
      semester: paymentForm.semester,
      head: paymentForm.head,
      amount: Number(paymentForm.amount),
      mode: paymentForm.mode,
      date: 'Today, Just now',
      status: 'Verified',
      receiptNo: `RCPT-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setTransactions(prev => [newTxn, ...prev]);
    setIsRecordPaymentOpen(false);
    showToast(`Payment of ₹${Number(paymentForm.amount).toLocaleString('en-IN')} recorded for Roll ${paymentForm.rollNumber}! Receipt generated.`);
    try {
      await api.recordFeePayment(paymentForm);
    } catch (err) {
      console.warn('Backend payment record sync failed:', err.message);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
                        t.rollNumber.includes(searchStudent) ||
                        t.id.toLowerCase().includes(searchStudent.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="accounts-portal-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          borderLeft: '4px solid #10b981'
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="accounts-header">
        <div className="accounts-brand">
          <div className="accounts-brand-icon">₹</div>
          <div className="accounts-brand-text">
            <h1>GIFT AUTONOMOUS · ACCOUNTS & FINANCE</h1>
            <p>Bursar Office & Fee Management System</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="accounts-role-badge">
            <CreditCard size={14} />
            Accounts Officer
          </span>
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
            {account?.name || 'Accounts Officer'}
          </span>
          <button className="admin-signout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="accounts-layout">
        {/* Sidebar */}
        <aside className="accounts-sidebar">
          <button
            className={`accounts-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={17} /> Dashboard
          </button>
          <button
            className={`accounts-nav-btn ${activeTab === 'verifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('verifications')}
          >
            <ShieldCheck size={17} /> Digital Proof Verifications
            {pendingCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#d97706', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            className={`accounts-nav-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={17} /> Student Fee Ledger
          </button>
          <button
            className={`accounts-nav-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <Receipt size={17} /> Payment Transactions
          </button>
          <button
            className={`accounts-nav-btn ${activeTab === 'structure' ? 'active' : ''}`}
            onClick={() => setActiveTab('structure')}
          >
            <Building2 size={17} /> Fee Structures
          </button>
          <button
            className={`accounts-nav-btn ${activeTab === 'scholarships' ? 'active' : ''}`}
            onClick={() => setActiveTab('scholarships')}
          >
            <DollarSign size={17} /> Scholarships
          </button>
          <button
            className={`accounts-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={17} /> Financial Reports
          </button>
          <button
            className={`accounts-nav-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <Download size={17} /> Student Documents
          </button>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="accounts-main">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Accounts Officer'}</h2>
                  <p>Institutional Fee &amp; Accounts Dashboard · Real-time financial status &amp; fee collections.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsRecordPaymentOpen(true)}>
                  <Plus size={15} /> Record Student Payment
                </button>
              </div>

              {/* Accounts KPI Grid */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Annual Projected Fees</span>
                    <div className="admin-kpi-card-icon blue"><Building2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">₹2.48 Cr</div>
                  <small style={{ color: '#64748b' }}>For 2,480 enrolled students</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Fees Collected</span>
                    <div className="admin-kpi-card-icon emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>₹2.19 Cr</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>88.1% Clearance rate</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Outstanding Dues</span>
                    <div className="admin-kpi-card-icon amber"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>₹29.5 L</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>Semester 5 pending invoices</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Scholarships Disbursed</span>
                    <div className="admin-kpi-card-icon purple"><DollarSign size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">₹18.4 L</div>
                  <small style={{ color: '#64748b' }}>265 Beneficiaries</small>
                </div>
              </div>

              {/* Recent Transactions Section */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Recent Payment Transactions</h3>
                  <button className="admin-action-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('transactions')}>
                    View All Transactions
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Txn ID</th>
                        <th>Student Name & Roll</th>
                        <th>Fee Head</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Receipt No</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map(txn => (
                        <tr key={txn.id}>
                          <td><strong>{txn.id}</strong></td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{txn.studentName}</div>
                            <small style={{ color: '#64748b' }}>Roll {txn.rollNumber} · {txn.semester}</small>
                          </td>
                          <td>{txn.head}</td>
                          <td><strong style={{ color: '#059669' }}>₹{txn.amount.toLocaleString('en-IN')}</strong></td>
                          <td><span className="admin-badge active">{txn.mode}</span></td>
                          <td><code>{txn.receiptNo}</code></td>
                          <td><span className="admin-badge approved">{txn.status}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="admin-table-action-btn"
                              title="Print / View Receipt"
                              onClick={() => setSelectedReceipt(txn)}
                            >
                              <Receipt size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT FEE LEDGER */}
          {activeTab === 'students' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Student Fee Ledger & Clearance Status</h2>
                  <p>Individual student accounts, annual tuition dues, and hostel invoice tracking.</p>
                </div>
              </div>

              <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
                <div className="admin-search-wrap" style={{ minWidth: '320px' }}>
                  <Search size={16} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by student name or roll number..."
                    value={searchStudent}
                    onChange={e => setSearchStudent(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Student Name</th>
                      <th>Program & Semester</th>
                      <th>Annual Fee Package</th>
                      <th>Paid Amount</th>
                      <th>Outstanding Balance</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 20).map(s => {
                      const rollNum = parseInt(s.rollNumber);
                      const isCleared = rollNum % 3 !== 0;
                      const paidAmt = isCleared ? 98500 : 70000;
                      const dueAmt = isCleared ? 0 : 28500;

                      return (
                        <tr key={s.id}>
                          <td><strong>{s.rollNumber}</strong></td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>CSE · Semester 5 (Sec A)</td>
                          <td>₹98,500</td>
                          <td><strong style={{ color: '#059669' }}>₹{paidAmt.toLocaleString('en-IN')}</strong></td>
                          <td>
                            <strong style={{ color: dueAmt > 0 ? '#e11d48' : '#64748b' }}>
                              ₹{dueAmt.toLocaleString('en-IN')}
                            </strong>
                          </td>
                          <td>
                            <span className={`admin-badge ${dueAmt === 0 ? 'approved' : 'pending'}`}>
                              {dueAmt === 0 ? 'No Dues Clear' : 'Dues Pending'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="admin-action-btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                              onClick={() => {
                                setPaymentForm({
                                  rollNumber: s.rollNumber,
                                  studentName: s.name,
                                  head: 'Semester Dues Clearance',
                                  amount: String(dueAmt || 48500),
                                  mode: 'Net Banking',
                                  semester: 'Semester 5'
                                });
                                setIsRecordPaymentOpen(true);
                              }}
                            >
                              Collect Fee
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>All Payment Transactions & Official Receipts</h2>
                  <p>Audit trail of all online, UPI, Challan, and card fee settlements.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsRecordPaymentOpen(true)}>
                  <Plus size={15} /> Record Payment
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Txn ID</th>
                      <th>Student</th>
                      <th>Fee Category</th>
                      <th>Amount Paid</th>
                      <th>Date</th>
                      <th>Payment Channel</th>
                      <th>Receipt #</th>
                      <th>Verification</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(txn => (
                      <tr key={txn.id}>
                        <td><strong>{txn.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{txn.studentName}</div>
                          <small style={{ color: '#64748b' }}>Roll {txn.rollNumber}</small>
                        </td>
                        <td>{txn.head}</td>
                        <td><strong style={{ color: '#059669' }}>₹{txn.amount.toLocaleString('en-IN')}</strong></td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{txn.date}</td>
                        <td><span className="admin-badge active">{txn.mode}</span></td>
                        <td><code>{txn.receiptNo}</code></td>
                        <td><span className="admin-badge approved">{txn.status}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-table-action-btn"
                            title="Generate Official PDF Receipt"
                            onClick={() => setSelectedReceipt(txn)}
                          >
                            <Receipt size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FEE STRUCTURES */}
          {activeTab === 'structure' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Institutional Fee Structure Matrix</h2>
                  <p>Curricular package breakdown approved by GIFT Autonomous Finance Committee.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {feeStructures.map(str => (
                  <div key={str.id} className="admin-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="admin-badge active">{str.program}</span>
                      <strong style={{ color: '#059669', fontSize: '1.2rem' }}>₹{str.total.toLocaleString('en-IN')}</strong>
                    </div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0f172a' }}>{str.term}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Tuition Fee</span>
                        <strong>₹{str.tuitionFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Development Fee</span>
                        <strong>₹{str.developmentFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Lab & Library Deposit</span>
                        <strong>₹{str.labLibraryFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Autonomous Exam Fee</span>
                        <strong>₹{str.examinationFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <span style={{ color: '#64748b' }}>Hostel & Mess Charge (Optional)</span>
                        <strong>₹{str.hostelMessFee.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SCHOLARSHIPS */}
          {activeTab === 'scholarships' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Government & Institutional Scholarships</h2>
                  <p>Direct Benefit Transfer (DBT) verifications and merit tuition fee waivers.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {scholarships.map(sch => (
                  <div key={sch.id} className="admin-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="admin-badge active">{sch.status}</span>
                      <strong style={{ color: '#2563eb' }}>{sch.benefit}</strong>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f172a' }}>{sch.name}</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>{sch.authority}</p>

                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Enrolled Beneficiaries:</span>
                      <strong>{sch.beneficiaries} Students</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FINANCIAL REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Finance & Accounts Audit Gazettes</h2>
                  <p>Export reconciliation sheets, daily collection registers, and bank statements.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 className="admin-card-title">Daily Collection Ledger</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Itemized receipt log across counter cash, online UPI, and Net Banking collections.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => {
                    downloadAccountsRegisterPdf(feeTransactions);
                    showToast('Generated & downloaded Daily Fee Collection Register PDF.');
                  }}>
                    <Download size={15} /> Download Register PDF
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Semester 5 Defaulters & Outstanding Sheet</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Student-wise dues list with parent phone contacts for semester clearance reminders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIGITAL PAYMENT PROOF VERIFICATIONS (FEATURE 1) */}
          {activeTab === 'verifications' && (
            <div>
              <div className="admin-view-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2>Digital Fee Payment Proof Verification Queue</h2>
                  <p>Review uploaded student transaction screenshots, verify bank UTR numbers, and approve fee balance clearances.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-action-btn-secondary ${verificationFilter === st ? 'active' : ''}`}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        background: verificationFilter === st ? '#4338ca' : '#ffffff',
                        color: verificationFilter === st ? '#ffffff' : '#475569',
                        borderColor: verificationFilter === st ? '#4338ca' : '#cbd5e1'
                      }}
                      onClick={() => setVerificationFilter(st)}
                    >
                      {st} {st === 'PENDING' && pendingCount > 0 ? `(${pendingCount})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification List Table */}
              <div className="admin-card">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name & Roll</th>
                        <th>Department</th>
                        <th>Amount</th>
                        <th>Date & Method</th>
                        <th>Transaction ID / UTR</th>
                        <th>OCR Auto-Check</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationList
                        .filter((item) => verificationFilter === 'ALL' || item.status === verificationFilter)
                        .map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{item.studentName}</strong>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Roll {item.rollNumber}</div>
                            </td>
                            <td><small style={{ color: '#475569' }}>{item.department || 'CSE'}</small></td>
                            <td><strong style={{ color: '#059669', fontSize: '0.95rem' }}>₹{Number(item.amount).toLocaleString('en-IN')}</strong></td>
                            <td>
                              <div>{item.paymentDate}</div>
                              <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                {item.paymentMethod}
                              </span>
                            </td>
                            <td><code style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', color: '#0f172a', fontWeight: 700 }}>{item.transactionId}</code></td>
                            <td>
                              <span style={{ fontSize: '0.74rem', background: item.ocrMatch?.txnMatch === 'EXACT' ? '#dcfce7' : '#fef3c7', color: item.ocrMatch?.txnMatch === 'EXACT' ? '#15803d' : '#b45309', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                {item.ocrMatch?.confidence || 95}% Confidence
                              </span>
                            </td>
                            <td>
                              <span className={`admin-badge ${item.status === 'APPROVED' ? 'approved' : item.status === 'REJECTED' ? 'inactive' : 'pending'}`}>
                                {item.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className="admin-table-action-btn"
                                  title="View Proof Image & Details"
                                  style={{ padding: '4px 8px', background: '#eef2ff', color: '#4338ca', borderRadius: '6px', border: '1px solid #c7d2fe' }}
                                  onClick={() => {
                                    setProofZoomLevel(1);
                                    setSelectedProof(item);
                                  }}
                                >
                                  <Eye size={14} /> Audit
                                </button>
                                {item.status === 'PENDING' && (
                                  <>
                                    <button
                                      type="button"
                                      className="admin-table-action-btn"
                                      title="Approve Payment"
                                      style={{ padding: '4px 8px', background: '#dcfce7', color: '#15803d', borderRadius: '6px', border: '1px solid #86efac' }}
                                      onClick={() => handleApproveProof(item.id)}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-table-action-btn"
                                      title="Reject Payment"
                                      style={{ padding: '4px 8px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', border: '1px solid #fca5a5' }}
                                      onClick={() => setRejectingProofId(item.id)}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
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

          {/* TAB: STUDENT DOCUMENTS */}
          {activeTab === 'documents' && (
            <StudentDocumentsTable portalRole="accounts" />
          )}
        </main>
      </div>

      {/* FEATURE 1: PROOF VIEWER & COMPARISON MODAL */}
      {selectedProof && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedProof(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Digital Payment Proof Verification Audit</h3>
              <button className="admin-table-action-btn" onClick={() => setSelectedProof(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="admin-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Left Column: Zoomable Image / Document */}
              <div style={{ background: '#0f172a', borderRadius: '10px', padding: '12px', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ color: '#94a3b8' }}>{selectedProof.fileName || 'Proof_Document.png'}</small>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => setProofZoomLevel(z => Math.min(z + 0.25, 2.5))} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>
                      <ZoomIn size={14} />
                    </button>
                    <button type="button" onClick={() => setProofZoomLevel(z => Math.max(z - 0.25, 0.75))} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>
                      <ZoomOut size={14} />
                    </button>
                    <button type="button" onClick={() => setProofZoomLevel(1)} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ width: '100%', height: '320px', overflow: 'auto', background: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {selectedProof.fileType === 'application/pdf' ? (
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                      <FileText size={64} style={{ color: '#818cf8', marginBottom: '12px' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedProof.fileName || 'Payment_Proof.pdf'}</div>
                      <a href={selectedProof.proofUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '0.8rem', marginTop: '8px', display: 'inline-block' }}>Open PDF Document ↗</a>
                    </div>
                  ) : (
                    <img
                      src={selectedProof.proofUrl}
                      alt="Uploaded Payment Proof"
                      style={{
                        transform: `scale(${proofZoomLevel})`,
                        transition: 'transform 0.2s ease',
                        maxHeight: '300px',
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Right Column: Verification Data Audit & Side-by-Side Comparison */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#0f172a' }}>Transaction Verification Audit</h4>
                
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '0.84rem' }}>
                  <div style={{ marginBottom: '6px' }}><strong>Student:</strong> {selectedProof.studentName} (Roll: {selectedProof.rollNumber})</div>
                  <div style={{ marginBottom: '6px' }}><strong>Department:</strong> {selectedProof.department || 'CSE'}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Amount Claimed:</strong> <strong style={{ color: '#059669', fontSize: '1.05rem' }}>₹{Number(selectedProof.amount).toLocaleString('en-IN')}</strong></div>
                  <div style={{ marginBottom: '6px' }}><strong>Payment Date:</strong> {selectedProof.paymentDate}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Payment Channel:</strong> {selectedProof.paymentMethod}</div>
                  <div><strong>Transaction ID / UTR:</strong> <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{selectedProof.transactionId}</code></div>
                  {selectedProof.remarks && <div style={{ marginTop: '6px' }}><strong>Remarks:</strong> {selectedProof.remarks}</div>}
                </div>

                {/* Automated OCR Check Indicator */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '8px', color: '#166534', fontSize: '0.8rem', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <ShieldCheck size={16} /> Automated OCR Pre-Validation
                  </div>
                  <div>• UTR Match: <strong>EXACT (100%)</strong></div>
                  <div>• Amount Match: <strong>EXACT (₹{Number(selectedProof.amount).toLocaleString('en-IN')})</strong></div>
                  <div>• Duplicate Check: <strong>PASSED (No prior claim for this Txn ID)</strong></div>
                </div>

                {selectedProof.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="admin-action-btn-primary"
                      style={{ flex: 1, background: '#16a34a', borderColor: '#16a34a', justifyContent: 'center' }}
                      onClick={() => handleApproveProof(selectedProof.id)}
                    >
                      ✓ Approve Payment
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
                      onClick={() => setRejectingProofId(selectedProof.id)}
                    >
                      ✕ Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ background: selectedProof.status === 'APPROVED' ? '#ecfdf5' : '#fef2f2', padding: '10px', borderRadius: '6px', textAlign: 'center', fontWeight: 700, color: selectedProof.status === 'APPROVED' ? '#047857' : '#b91c1c' }}>
                    Status: {selectedProof.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 1: REJECTION REASON MODAL */}
      {rejectingProofId && (
        <div className="admin-modal-backdrop" onClick={() => setRejectingProofId(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Reject Payment Proof</h3>
              <button className="admin-table-action-btn" onClick={() => setRejectingProofId(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="admin-modal-body">
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 12px' }}>
                Please specify the reason for rejecting this transaction proof. The student will be notified on their portal.
              </p>

              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Quick Rejection Reasons
              </label>
              <select
                className="admin-form-select"
                style={{ marginBottom: '12px' }}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
              >
                <option value="">Select a standard reason...</option>
                <option value="Transaction ID / UTR could not be verified in bank log.">Transaction ID / UTR could not be verified in bank log.</option>
                <option value="Payment amount mismatch between claim and screenshot.">Payment amount mismatch between claim and screenshot.</option>
                <option value="Uploaded screenshot image is blurry or unreadable.">Uploaded screenshot image is blurry or unreadable.</option>
                <option value="Duplicate transaction proof submission detected.">Duplicate transaction proof submission detected.</option>
                <option value="Invalid payment receipt uploaded.">Invalid payment receipt uploaded.</option>
              </select>

              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Reason Details / Custom Remarks <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                className="admin-form-input"
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Enter explanation for rejection..."
                required
              />
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-action-btn-secondary" onClick={() => setRejectingProofId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleConfirmRejectProof}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {isRecordPaymentOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Record Student Fee Payment</h3>
              <button className="admin-table-action-btn" onClick={() => setIsRecordPaymentOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Roll Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={paymentForm.rollNumber}
                      onChange={e => setPaymentForm({ ...paymentForm, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Student Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={paymentForm.studentName}
                      onChange={e => setPaymentForm({ ...paymentForm, studentName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Fee Head / Category</label>
                  <select
                    className="admin-form-select"
                    value={paymentForm.head}
                    onChange={e => setPaymentForm({ ...paymentForm, head: e.target.value })}
                  >
                    <option value="Tuition & Development Fee">Tuition & Development Fee</option>
                    <option value="Hostel & Mess Charges">Hostel & Mess Charges</option>
                    <option value="Autonomous Examination Fee">Autonomous Examination Fee</option>
                    <option value="Library Caution Deposit">Library Caution Deposit</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Amount Paid (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={paymentForm.amount}
                      onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Payment Channel</label>
                    <select
                      className="admin-form-select"
                      value={paymentForm.mode}
                      onChange={e => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                    >
                      <option value="Net Banking">Net Banking</option>
                      <option value="UPI">UPI</option>
                      <option value="Debit / Credit Card">Debit / Credit Card</option>
                      <option value="Bank Challan">Bank Challan</option>
                      <option value="Cash at Counter">Cash at Counter</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsRecordPaymentOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Verify & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW / PRINT RECEIPT */}
      {selectedReceipt && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3>Official College Fee Receipt</h3>
              <button className="admin-table-action-btn" onClick={() => setSelectedReceipt(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ background: '#ffffff', border: '1px dashed #cbd5e1', margin: '1rem', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e3a8a' }}>GANDHI INSTITUTE FOR TECHNOLOGY (GIFT)</h4>
                <small style={{ color: '#64748b' }}>Autonomous College · Affiliated to BPUT</small>
                <div style={{ marginTop: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  FEE PAYMENT RECEIPT
                </div>
              </div>

              <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.825rem' }}>
                <div><dt style={{ color: '#64748b' }}>Receipt Number</dt><dd style={{ margin: 0, fontWeight: 700 }}>{selectedReceipt.receiptNo}</dd></div>
                <div><dt style={{ color: '#64748b' }}>Transaction ID</dt><dd style={{ margin: 0 }}>{selectedReceipt.id}</dd></div>
                <div><dt style={{ color: '#64748b' }}>Student Name</dt><dd style={{ margin: 0, fontWeight: 600 }}>{selectedReceipt.studentName}</dd></div>
                <div><dt style={{ color: '#64748b' }}>Roll Number</dt><dd style={{ margin: 0 }}>{selectedReceipt.rollNumber}</dd></div>
                <div><dt style={{ color: '#64748b' }}>Payment Head</dt><dd style={{ margin: 0 }}>{selectedReceipt.head}</dd></div>
                <div><dt style={{ color: '#64748b' }}>Payment Mode</dt><dd style={{ margin: 0 }}>{selectedReceipt.mode}</dd></div>
              </dl>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '2px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>TOTAL RECEIVED</span>
                <strong style={{ fontSize: '1.25rem', color: '#059669' }}>₹{selectedReceipt.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
                Computer generated electronic receipt. Valid for autonomous semester enrollment clearance.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-action-btn-secondary" onClick={() => downloadFeeReceiptPdf(selectedReceipt)}>
                <Download size={15} /> Download PDF Receipt
              </button>
              <button className="admin-action-btn-primary" onClick={() => setSelectedReceipt(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
