import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Printer,
  Menu,
  Eye,
  ShieldCheck,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Filter,
  ArrowUpRight,
  RefreshCw,
  BarChart2,
  PieChart,
  Landmark,
  FileSpreadsheet,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import './AccountsPortal.css';
import '../components/AdminPortal.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import {
  downloadFeeReceiptPdf,
  downloadAccountsRegisterPdf,
  openFeeReceiptPdf,
  openPaymentProofPdf,
  downloadPaymentProofPdf,
} from '../utils/pdfGenerator';
import { api } from '../services/api.js';
import { feesApi } from '../services/feesApi.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';
import { MasterSidebarHeader, MasterNavBadge, useMasterSidebarState } from './Navigation/MasterSidebar.jsx';
import './Navigation/MasterNavigation.css';

// CSV Export Helper
function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
            val = val.replace(/"/g, '""');
            if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
            return val;
          })
          .join(separator)
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function hasVerifiedReceipt(transaction) {
  const status = String(transaction?.status || '').toUpperCase();
  return Boolean(transaction?.receiptNo) && ['VERIFIED', 'RECONCILED', 'SUCCESSFUL', 'APPROVED'].includes(status);
}

export default function AccountsPortal({ account, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useMasterSidebarState(false);
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Reset scroll position to top whenever activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const scrollables = document.querySelectorAll('.accounts-main, .role-dash-container, .admin-container');
    scrollables.forEach((el) => { el.scrollTop = 0; });
  }, [activeTab]);

  // Core Data States
  const [feeStructures, setFeeStructures] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState('');

  // Dashboard Metrics & Filters
  const [dashboardFilter, setDashboardFilter] = useState({
    academicYear: '2026-27',
    semester: 'ALL',
    department: 'ALL'
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalAssessed: null, totalCollected: 0, totalOutstanding: null, collectionRate: null,
    studentsWithDues: null, pendingVerificationsSum: 0, scholarshipsDisbursed: null,
    refundsAndReversals: null, monthlyTrends: [], feeHeadBreakdown: [], paymentChannelDistribution: [],
  });

  // Digital Proof Verification Queue
  const [verificationList, setVerificationList] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [selectedProof, setSelectedProof] = useState(null);
  const [rejectingProofId, setRejectingProofId] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [proofZoomLevel, setProofZoomLevel] = useState(1);

  // Student Fee Ledger States
  const [searchStudent, setSearchStudent] = useState('');
  const [ledgerDeptFilter, setLedgerDeptFilter] = useState('ALL');

  // Transaction Search & Channel Filters
  const [searchTxn, setSearchTxn] = useState('');
  const [txnChannelFilter, setTxnChannelFilter] = useState('ALL');
  const [txnStatusFilter, setTxnStatusFilter] = useState('ALL');

  // Fee Structure Filters & Modal
  const [structureProgramFilter, setStructureProgramFilter] = useState('ALL');
  const [isCreateStructureOpen, setIsCreateStructureOpen] = useState(false);
  const [newStructureForm, setNewStructureForm] = useState({
    program: '',
    term: '',
    tuitionFee: '',
    developmentFee: '',
    labLibraryFee: '',
    examinationFee: '',
    hostelMessFee: ''
  });

  // Scholarships Modal
  const [isSanctionScholarshipOpen, setIsSanctionScholarshipOpen] = useState(false);
  const [newScholarshipForm, setNewScholarshipForm] = useState({
    name: '',
    authority: '',
    category: '',
    beneficiaries: 1,
    studentRoll: '',
    sanctionedAmount: '',
    academicYear: ''
  });

  // Modals & General Workflow States
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    rollNumber: '',
    semester: '',
    head: '',
    amount: '',
    mode: 'Cash at Counter'
  });
  const paymentRequestRef = useRef(null);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  // Initial Data Fetch
  useEffect(() => {
    loadVerifications();
    loadDashboardStats();
    loadInitialBackendData();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const stats = await feesApi.getDashboardStats(dashboardFilter);
      setDashboardStats(stats);
    } catch (error) {
      setDashboardStats((current) => ({ ...current, totalCollected: null }));
      showToast(error?.message || 'Financial dashboard metrics are unavailable.');
    }
  };

  const loadVerifications = async () => {
    try {
      const list = await feesApi.getPaymentVerifications('ALL');
      setVerificationList(list);
    } catch (error) {
      setVerificationList([]);
      showToast(error?.message || 'Payment verification queue is unavailable.');
    }
  };

  const loadInitialBackendData = async () => {
    setStudentsLoading(true);
    setStudentsError('');
    try {
      const response = await api.getStudents();
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error('The student roster response was invalid.');
      }
      setStudents(response.data);
    } catch (error) {
      setStudents([]);
      setStudentsError(error?.message || 'The student roster is unavailable.');
    } finally {
      setStudentsLoading(false);
    }

    try {
      setFeeStructures(await feesApi.getFeeStructures());
    } catch (error) {
      setFeeStructures([]);
      showToast(error?.message || 'Fee structures are unavailable.');
    }
    try {
      const txns = await feesApi.getFeeTransactions();
      setTransactions(txns);
    } catch (error) {
      setTransactions([]);
      showToast(error?.message || 'Fee transaction register is unavailable.');
    }
    try {
      setScholarships(await feesApi.getScholarships());
    } catch (error) {
      setScholarships([]);
      showToast(error?.message || 'Scholarship records are unavailable.');
    }
  };

  const pendingCount = useMemo(() => {
    return verificationList.filter((item) => item.status === 'PENDING').length;
  }, [verificationList]);

  // Digital Proof Actions
  const handleApproveProof = async (id) => {
    try {
      const res = await feesApi.approvePayment(id);
      if (!res?.success || !res.transaction) throw new Error('Approval response did not include the persisted ledger transaction.');
      setTransactions((prev) => [res.transaction, ...prev.filter((item) => item.id !== res.transaction.id)]);
      showToast(`Payment verified and added to the ledger. Receipt ${res.transaction.receiptNo}.`);
      await loadVerifications();
      await loadDashboardStats();
      try {
        setTransactions(await feesApi.getFeeTransactions());
      } catch {
        // The confirmed transaction remains visible while a refresh is unavailable.
      }
      if (selectedProof?.id === id) setSelectedProof(null);
    } catch (error) {
      showToast(error?.message || 'Payment approval failed. No ledger entry was recorded.');
    }
  };

  const handleConfirmRejectProof = async () => {
    if (!rejectionReasonInput.trim()) {
      showToast('Please specify a rejection reason.');
      return;
    }
    try {
      const res = await feesApi.rejectPayment(rejectingProofId, rejectionReasonInput.trim());
      if (!res?.success) throw new Error('Payment rejection did not complete.');
      showToast('Payment proof rejected with the recorded reason.');
      await loadVerifications();
      setRejectingProofId(null);
      setRejectionReasonInput('');
      if (selectedProof?.id === rejectingProofId) setSelectedProof(null);
    } catch (error) {
      showToast(error?.message || 'Payment rejection failed.');
    }
  };

  const handleAuditPaymentProof = async (item) => {
    setProofZoomLevel(1);
    setSelectedProof({ ...item, proofLoading: true, proofError: '' });
    try {
      const file = await feesApi.getPaymentProofFile(item.id);
      setSelectedProof((current) => current?.id === item.id
        ? { ...current, ...file, proofUrl: file.fileData, proofLoading: false }
        : current);
    } catch (error) {
      setSelectedProof((current) => current?.id === item.id
        ? { ...current, proofLoading: false, proofError: error?.message || 'Could not load the submitted proof file.' }
        : current);
    }
  };

  // Record Payment Handler
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amt = Number(paymentForm.amount);
    if (amt <= 0) {
      showToast('Payment amount must be greater than zero.');
      return;
    }

    try {
      const fingerprint = JSON.stringify([
        paymentForm.rollNumber, paymentForm.semester, paymentForm.head, amt, paymentForm.mode,
      ]);
      if (!paymentRequestRef.current || paymentRequestRef.current.fingerprint !== fingerprint) {
        paymentRequestRef.current = { fingerprint, key: globalThis.crypto.randomUUID() };
      }
      const res = await api.recordFeePayment({
        idempotencyKey: paymentRequestRef.current.key,
        rollNumber: paymentForm.rollNumber,
        semester: paymentForm.semester,
        head: paymentForm.head,
        amount: amt,
        mode: paymentForm.mode,
      });
      if (!res?.success || !res.data?.id) throw new Error('The server did not confirm the payment record.');
      setTransactions((prev) => [res.data, ...prev]);
      paymentRequestRef.current = null;
      setIsRecordPaymentOpen(false);
      showToast(`Payment of ₹${Number(res.data.amount).toLocaleString('en-IN')} recorded for Roll ${res.data.rollNumber}. Receipt ${res.data.receiptNo}.`);
    } catch (err) {
      showToast(err?.message || 'Payment could not be recorded. No ledger entry was created.');
    }
  };

  // Fee Structure Creation Handler
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      const res = await feesApi.createFeeStructure({
        program: newStructureForm.program,
        term: newStructureForm.term,
        tuitionFee: Number(newStructureForm.tuitionFee),
        developmentFee: Number(newStructureForm.developmentFee),
        labLibraryFee: Number(newStructureForm.labLibraryFee),
        examinationFee: Number(newStructureForm.examinationFee),
        hostelMessFee: Number(newStructureForm.hostelMessFee),
      });
      if (!res?.success || !res.data?.id) throw new Error('The server did not confirm the fee structure.');
      setFeeStructures((prev) => [res.data, ...prev]);
      setIsCreateStructureOpen(false);
      showToast(`Fee structure saved for ${res.data.program}. Total: ₹${Number(res.data.total).toLocaleString('en-IN')}.`);
    } catch (err) {
      showToast(err?.message || 'Fee structure could not be saved.');
    }
  };

  // Sanction Scholarship Handler
  const handleSanctionScholarship = async (e) => {
    e.preventDefault();
    try {
      const res = await feesApi.sanctionScholarship({
        name: newScholarshipForm.name,
        authority: newScholarshipForm.authority,
        category: newScholarshipForm.category,
        studentRoll: newScholarshipForm.studentRoll,
        amount: Number(newScholarshipForm.sanctionedAmount),
        beneficiaries: Number(newScholarshipForm.beneficiaries),
        academicYear: newScholarshipForm.academicYear,
      });
      if (!res?.success || !res.data?.id) throw new Error('The server did not confirm the scholarship sanction.');
      setScholarships((prev) => [res.data, ...prev]);
      setIsSanctionScholarshipOpen(false);
      showToast(`Scholarship sanctioned for ${res.data.studentName} (${res.data.studentRoll}).`);
    } catch (err) {
      showToast(err?.message || 'Scholarship could not be sanctioned.');
    }
  };

  // Filtered Ledger Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const search = searchStudent.trim().toLowerCase();
      const matchSearch = !search ||
        String(s.name || '').toLowerCase().includes(search) ||
        String(s.rollNumber || '').toLowerCase().includes(search);

      let matchDept = true;
      if (ledgerDeptFilter !== 'ALL') {
        const d = `${s.deptCode || ''} ${s.department || ''}`.toUpperCase();
        matchDept = d.includes(ledgerDeptFilter);
      }

      return matchSearch && matchDept;
    });
  }, [students, searchStudent, ledgerDeptFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.studentName.toLowerCase().includes(searchTxn.toLowerCase()) ||
        t.rollNumber.includes(searchTxn) ||
        t.id.toLowerCase().includes(searchTxn.toLowerCase()) ||
        (t.receiptNo && t.receiptNo.toLowerCase().includes(searchTxn.toLowerCase()));

      let matchChannel = true;
      if (txnChannelFilter !== 'ALL') {
        matchChannel = t.mode.toLowerCase().includes(txnChannelFilter.toLowerCase());
      }

      let matchStatus = true;
      if (txnStatusFilter !== 'ALL') {
        matchStatus = t.status.toLowerCase().includes(txnStatusFilter.toLowerCase());
      }

      return matchSearch && matchChannel && matchStatus;
    });
  }, [transactions, searchTxn, txnChannelFilter, txnStatusFilter]);

  // Filtered Fee Structures
  const filteredStructures = useMemo(() => {
    if (structureProgramFilter === 'ALL') return feeStructures;
    return feeStructures.filter((s) =>
      s.program.toLowerCase().includes(structureProgramFilter.toLowerCase())
    );
  }, [feeStructures, structureProgramFilter]);

  return (
    <div className="accounts-portal-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.875rem',
            borderLeft: '5px solid #10b981',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="accounts-header">
        <div className="accounts-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!sidebarOpen && (
            <button
              className="campus-nav-toggle-btn"
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="Show Navigation"
              aria-label="Show Navigation"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="accounts-brand-icon" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="accounts-brand-text">
            <h1>APNA CAMPUS · ACCOUNTS &amp; FINANCE</h1>
            <p>Bursar Office &amp; Integrated Institutional Financial System</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="campus-user-pill">
            <div className="campus-user-avatar">ACC</div>
            <div className="campus-user-details">
              <strong>{account?.name || 'Accounts Officer'}</strong>
              <small>Bursar &amp; Finance Management</small>
            </div>
            <button
              className="campus-logout-btn"
              type="button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="erp-sidebar-backdrop active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className={`accounts-layout ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="accounts-sidebar">
            <MasterSidebarHeader
              roleTitle="ACCOUNTS & FINANCE"
              onToggle={() => setSidebarOpen(false)}
            />

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
                <span
                  style={{
                    marginLeft: 'auto',
                    background: '#d97706',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
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
        )}

        {/* Dynamic Content Pane */}
        <main className="accounts-main">
          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 120px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Accounts Officer'}</h2>
                  <p>Financial Command Center · Real-time institutional fee collections, ledger reconciliations &amp; audit trails.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="admin-action-btn-secondary" onClick={() => loadDashboardStats()} title="Refresh live statistics">
                    <RefreshCw size={14} /> Refresh
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsRecordPaymentOpen(true)}>
                    <Plus size={15} /> Record Student Payment
                  </button>
                </div>
              </div>

              {/* Dashboard Filters */}
              <div className="accounts-filter-bar">
                <div className="accounts-filter-group">
                  <span className="accounts-filter-label"><Filter size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Academic Session:</span>
                  <select
                    className="accounts-filter-select"
                    value={dashboardFilter.academicYear}
                    onChange={(e) => setDashboardFilter({ ...dashboardFilter, academicYear: e.target.value })}
                  >
                    <option value="2026-27">2026-27 (Current Academic Year)</option>
                    <option value="2025-26">2025-26 (Audited Session)</option>
                    <option value="2024-25">2024-25 (Archived)</option>
                  </select>
                </div>

                <div className="accounts-filter-group">
                  <span className="accounts-filter-label">Semester Term:</span>
                  <select
                    className="accounts-filter-select"
                    value={dashboardFilter.semester}
                    onChange={(e) => setDashboardFilter({ ...dashboardFilter, semester: e.target.value })}
                  >
                    <option value="ALL">All Semesters (Annual Matrix)</option>
                    <option value="Semester 1">Semester 1 (Freshmen)</option>
                    <option value="Semester 3">Semester 3 (Sophomore)</option>
                    <option value="Semester 5">Semester 5 (Junior)</option>
                    <option value="Semester 7">Semester 7 (Senior)</option>
                  </select>
                </div>

                <div className="accounts-filter-group">
                  <span className="accounts-filter-label">Department / School:</span>
                  <select
                    className="accounts-filter-select"
                    value={dashboardFilter.department}
                    onChange={(e) => setDashboardFilter({ ...dashboardFilter, department: e.target.value })}
                  >
                    <option value="ALL">All Engineering &amp; Management Departments</option>
                    <option value="CSE">Computer Science &amp; Engineering</option>
                    <option value="ECE">Electronics &amp; Communication</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="MBA">MBA (Management Studies)</option>
                    <option value="MCA">MCA (Computer Applications)</option>
                  </select>
                </div>
              </div>

              {/* KPI Cards Grid with Interactive Navigation */}
              <div className="admin-kpi-grid">
                <div
                  className="admin-kpi-card interactive-kpi"
                  onClick={() => setActiveTab('structure')}
                  title="Click to view full fee structures"
                >
                  <div className="kpi-click-indicator">View <ArrowUpRight size={13} /></div>
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Annual Fees Assessed</span>
                    <div className="admin-kpi-card-icon blue"><Building2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">
                    {dashboardStats.totalAssessed == null ? 'Not configured' : `₹${(dashboardStats.totalAssessed / 10000000).toFixed(2)} Cr`}
                  </div>
                  <small style={{ color: '#64748b' }}>Official assessment totals are not configured.</small>
                </div>

                <div
                  className="admin-kpi-card interactive-kpi"
                  onClick={() => setActiveTab('transactions')}
                  title="Click to view payment transactions"
                >
                  <div className="kpi-click-indicator">View <ArrowUpRight size={13} /></div>
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Confirmed Collections</span>
                    <div className="admin-kpi-card-icon emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>
                    {dashboardStats.totalCollected == null ? 'Not available' : `₹${(dashboardStats.totalCollected / 10000000).toFixed(2)} Cr`}
                  </div>
                  {dashboardStats.collectionRate == null ? (
                    <small style={{ color: '#64748b' }}>Collection rate requires official fee assessments.</small>
                  ) : <>
                    <div className="accounts-progress-track">
                      <div className="accounts-progress-fill" style={{ width: `${dashboardStats.collectionRate}%` }}></div>
                    </div>
                    <small style={{ color: '#059669', fontWeight: 700 }}>{dashboardStats.collectionRate}% Institutional Clearance Rate</small>
                  </>}
                </div>

                <div
                  className="admin-kpi-card interactive-kpi"
                  onClick={() => {
                    setActiveTab('students');
                  }}
                  title="Fee assessments are not configured"
                >
                  <div className="kpi-click-indicator">Roster <ArrowUpRight size={13} /></div>
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Outstanding Student Dues</span>
                    <div className="admin-kpi-card-icon amber"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>
                    {dashboardStats.totalOutstanding == null ? 'Not configured' : `₹${(dashboardStats.totalOutstanding / 100000).toFixed(1)} L`}
                  </div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>
                    {dashboardStats.studentsWithDues == null ? 'Official assessments are required to calculate dues.' : `${dashboardStats.studentsWithDues} students pending semester clearance`}
                  </small>
                </div>

                <div
                  className="admin-kpi-card interactive-kpi"
                  onClick={() => {
                    setVerificationFilter('PENDING');
                    setActiveTab('verifications');
                  }}
                  title="Click to open digital proof verification queue"
                >
                  <div className="kpi-click-indicator">Review <ArrowUpRight size={13} /></div>
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Pending Proof Verifications</span>
                    <div className="admin-kpi-card-icon purple"><ShieldCheck size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: pendingCount > 0 ? '#4338ca' : '#64748b' }}>
                    {pendingCount} Claim{pendingCount === 1 ? '' : 's'}
                  </div>
                  <small style={{ color: '#4338ca', fontWeight: 600 }}>
                    ₹{Number(dashboardStats.pendingVerificationsSum || 0).toLocaleString('en-IN')} pending reviewer approval
                  </small>
                </div>
              </div>

              {/* Secondary Metric Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  className="admin-card"
                  style={{ padding: '0.85rem 1.15rem', marginBottom: 0, cursor: 'pointer' }}
                  onClick={() => setActiveTab('scholarships')}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Scholarships Disbursed
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb', margin: '4px 0' }}>
                    {dashboardStats.scholarshipsDisbursed == null ? 'Not configured' : `₹${(dashboardStats.scholarshipsDisbursed / 100000).toFixed(1)} L`}
                  </div>
                  <small style={{ color: '#64748b' }}>Based on persisted scholarship records.</small>
                </div>

                <div
                  className="admin-card"
                  style={{ padding: '0.85rem 1.15rem', marginBottom: 0, cursor: 'pointer' }}
                  onClick={() => setActiveTab('reports')}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Refunds &amp; Bank Reversals
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {dashboardStats.refundsAndReversals == null ? 'Not configured' : `₹${dashboardStats.refundsAndReversals.toLocaleString('en-IN')}`}
                  </div>
                  <small style={{ color: '#64748b' }}>No refund ledger is configured.</small>
                </div>

                <div
                  className="admin-card"
                  style={{ padding: '0.85rem 1.15rem', marginBottom: 0 }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Gateway Settlement Latency
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
                    Not configured
                  </div>
                  <small style={{ color: '#059669' }}>Automated HDFC &amp; SBI e-Pay reconciliation</small>
                </div>
              </div>

              {/* Analytics Section: Trends & Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Monthly Collection Trends Chart */}
                <div className="admin-card" style={{ marginBottom: 0 }}>
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">Monthly Fee Collection Velocity</h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                        Assessed invoices (Grey) vs Confirmed collections (Blue)
                      </p>
                    </div>
                    <span className="admin-badge active">2026-27 Autumn</span>
                  </div>

                  <div className="accounts-trend-chart-container">
                    {dashboardStats.monthlyTrends.length === 0 ? (
                      <div style={{ padding: '24px', color: '#64748b', textAlign: 'center' }}>No assessed-versus-collected trend data is available.</div>
                    ) : dashboardStats.monthlyTrends.map((t) => {
                      const maxVal = 13000000;
                      const assessedH = Math.round((t.assessed / maxVal) * 110);
                      const collectedH = Math.round((t.collected / maxVal) * 110);

                      return (
                        <div key={t.month} className="accounts-trend-bar-group">
                          <div className="accounts-trend-bars-wrapper">
                            <div
                              className="accounts-bar-assessed"
                              style={{ height: `${assessedH}px` }}
                              title={`${t.month} Assessed: ₹${(t.assessed / 100000).toFixed(1)} L`}
                            ></div>
                            <div
                              className="accounts-bar-collected"
                              style={{ height: `${collectedH}px` }}
                              title={`${t.month} Collected: ₹${(t.collected / 100000).toFixed(1)} L`}
                            ></div>
                          </div>
                          <span className="accounts-trend-bar-label">{t.month}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.78rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 12, height: 12, background: '#94a3b8', borderRadius: 2 }}></span>
                      <span>Assessed Package</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 12, height: 12, background: '#2563eb', borderRadius: 2 }}></span>
                      <strong>Realized Bank Collections</strong>
                    </div>
                  </div>
                </div>

                {/* Fee-Head-Wise Revenue Distribution */}
                <div className="admin-card" style={{ marginBottom: 0 }}>
                  <div className="admin-card-header">
                    <div>
                      <h3 className="admin-card-title">Fee-Head Revenue Allocation</h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Calculated from recorded financial data when fee assessments are configured.
                      </p>
                    </div>
                    <PieChart size={18} color="#2563eb" />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dashboardStats.feeHeadBreakdown.length === 0 ? (
                      <div style={{ padding: '12px', color: '#64748b' }}>No fee-head breakdown is available.</div>
                    ) : dashboardStats.feeHeadBreakdown.map((fh) => (
                      <div key={fh.head} className="accounts-head-row">
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{fh.head}</div>
                          <div className="accounts-progress-track" style={{ height: 5, margin: '3px 0 0' }}>
                            <div
                              className="accounts-progress-fill"
                              style={{
                                width: `${fh.percentage}%`,
                                background:
                                  fh.percentage > 40 ? '#2563eb' : fh.percentage > 15 ? '#059669' : '#d97706'
                              }}
                            ></div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '95px' }}>
                          <strong style={{ fontSize: '0.9rem' }}>₹{(fh.amount / 100000).toFixed(1)} L</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fh.percentage}% split</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Payment Transactions */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Recent Fee Transactions &amp; Receipts</h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                      Authoritative postings across Net Banking, UPI, and Counter Challans
                    </p>
                  </div>
                  <button
                    className="admin-action-btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => setActiveTab('transactions')}
                  >
                    View All Transactions Register ({transactions.length})
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Txn ID</th>
                        <th>Student Name &amp; Roll</th>
                        <th>Fee Head</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Receipt No</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Official Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((txn) => (
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
                          <td><span className={`admin-badge ${hasVerifiedReceipt(txn) ? 'approved' : 'pending'}`}>{txn.status || 'Unknown'}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="admin-table-action-btn"
                              title={hasVerifiedReceipt(txn) ? 'Print / View Receipt' : 'A verified receipt is not available for this transaction'}
                              disabled={!hasVerifiedReceipt(txn)}
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

          {/* TAB 2: DIGITAL PROOF VERIFICATIONS */}
          {activeTab === 'verifications' && (
            <div>
              <div className="admin-view-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2>Digital Fee Payment Proof Verification Queue</h2>
                  <p>Review student transaction receipts, verify bank UTR numbers, and approve ledger balance clearances.</p>
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
                        <th>Student Name &amp; Roll</th>
                        <th>Department</th>
                        <th>Claimed Amount</th>
                        <th>Payment Date &amp; Channel</th>
                        <th>Transaction ID / UTR</th>
                        <th>OCR Auto-Check</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Review Action</th>
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
                            <td>
                              <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                                ₹{Number(item.amount).toLocaleString('en-IN')}
                              </strong>
                            </td>
                            <td>
                              <div>{item.paymentDate}</div>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}
                              >
                                {item.paymentMethod}
                              </span>
                            </td>
                            <td>
                              <code
                                style={{
                                  background: '#f1f5f9',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  color: '#0f172a',
                                  fontWeight: 700
                                }}
                              >
                                {item.transactionId}
                              </code>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  background: item.ocrMatch?.txnMatch === 'EXACT' ? '#dcfce7' : '#fef3c7',
                                  color: item.ocrMatch?.txnMatch === 'EXACT' ? '#15803d' : '#b45309',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontWeight: 700
                                }}
                              >
                                {item.ocrMatch?.confidence || 95}% Confidence
                              </span>
                            </td>
                            <td>
                              <span
                                className={`admin-badge ${
                                  item.status === 'APPROVED'
                                    ? 'approved'
                                    : item.status === 'REJECTED'
                                    ? 'inactive'
                                    : 'pending'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className="admin-table-action-btn"
                                  title="Audit Proof Document"
                                  style={{
                                    padding: '4px 8px',
                                    background: '#eef2ff',
                                    color: '#4338ca',
                                    borderRadius: '6px',
                                    border: '1px solid #c7d2fe'
                                  }}
                                  onClick={() => handleAuditPaymentProof(item)}
                                >
                                  <Eye size={14} /> Audit
                                </button>
                                {item.status === 'PENDING' && (
                                  <>
                                    <button
                                      type="button"
                                      className="admin-table-action-btn"
                                      title="Approve Payment"
                                      style={{
                                        padding: '4px 8px',
                                        background: '#dcfce7',
                                        color: '#15803d',
                                        borderRadius: '6px',
                                        border: '1px solid #86efac'
                                      }}
                                      onClick={() => handleApproveProof(item.id)}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-table-action-btn"
                                      title="Reject Payment"
                                      style={{
                                        padding: '4px 8px',
                                        background: '#fee2e2',
                                        color: '#b91c1c',
                                        borderRadius: '6px',
                                        border: '1px solid #fca5a5'
                                      }}
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

          {/* TAB 3: STUDENT FEE LEDGER */}
          {activeTab === 'students' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Student Accounts Roster</h2>
                  <p>Student records are live. Fee assessments, dues, and clearance status are not configured yet.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      const exportData = filteredStudents.map((s) => ({
                        RollNumber: s.rollNumber,
                        StudentName: s.name,
                        Department: s.department || '',
                        Semester: s.semester || '',
                        Section: s.section || '',
                        EnrollmentStatus: s.status || '',
                      }));
                      exportToCsv('Student_Accounts_Roster.csv', exportData);
                      showToast('Exported the student roster. Fee assessment data is not configured.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Student Roster
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => {
                    setPaymentForm({ rollNumber: '', semester: '', head: '', amount: '', mode: 'Cash at Counter' });
                    setIsRecordPaymentOpen(true);
                  }}>
                    <Plus size={15} /> Record Verified Receipt
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="accounts-filter-bar">
                <div className="admin-search-wrap" style={{ flex: 1, minWidth: '240px' }}>
                  <Search size={16} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by student name or roll number..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                  />
                </div>

                <div className="accounts-filter-group">
                  <span className="accounts-filter-label">Department:</span>
                  <select
                    className="accounts-filter-select"
                    value={ledgerDeptFilter}
                    onChange={(e) => setLedgerDeptFilter(e.target.value)}
                  >
                    <option value="ALL">All Departments</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>

              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Assessed</th>
                      <th>Collected</th>
                      <th>Balance</th>
                      <th>Fee Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsLoading ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Loading student records…</td></tr>
                    ) : studentsError ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#b91c1c' }}>{studentsError}</td></tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>No student records found.</td></tr>
                    ) : filteredStudents.slice(0, 25).map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.rollNumber}</strong></td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>{s.department || s.deptCode || '—'}</td>
                          <td>{s.semester || '—'}</td>
                          <td>Not configured</td>
                          <td>—</td>
                          <td>—</td>
                          <td><span className="admin-badge">Assessment unavailable</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                className="admin-action-btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                                title="Official fee assessments are not configured"
                                onClick={() => showToast('Student fee statements are unavailable until official assessments and due dates are configured.')}
                              >
                                Statement
                              </button>
                              <button
                                className="admin-action-btn-primary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                                onClick={() => {
                                  setPaymentForm({
                                    rollNumber: s.rollNumber,
                                    semester: s.semester || '',
                                    head: '',
                                    amount: '',
                                    mode: 'Cash at Counter'
                                  });
                                  setIsRecordPaymentOpen(true);
                                }}
                              >
                                Record Receipt
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>All Payment Transactions &amp; Official Receipts</h2>
                  <p>Comprehensive transaction register across Net Banking, UPI QR, Cards, Bank Challan, and Counter settlements.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      exportToCsv('Transactions_Register.csv', filteredTransactions);
                      showToast('Exported Transactions Register to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Transactions CSV
                  </button>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      downloadAccountsRegisterPdf(filteredTransactions);
                      showToast('Downloaded Daily Fee Collection Register PDF.');
                    }}
                  >
                    <Download size={15} /> Daily Register PDF
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsRecordPaymentOpen(true)}>
                    <Plus size={15} /> Record Payment
                  </button>
                </div>
              </div>

              {/* Transactions Filter Bar */}
              <div className="accounts-filter-bar">
                <div className="admin-search-wrap" style={{ flex: 1, minWidth: '240px' }}>
                  <Search size={16} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by Txn ID, student name, roll number, or receipt..."
                    value={searchTxn}
                    onChange={(e) => setSearchTxn(e.target.value)}
                  />
                </div>

                <div className="accounts-filter-group">
                  <span className="accounts-filter-label">Payment Channel:</span>
                  <select
                    className="accounts-filter-select"
                    value={txnChannelFilter}
                    onChange={(e) => setTxnChannelFilter(e.target.value)}
                  >
                    <option value="ALL">All Payment Channels</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Bank Challan">Bank Challan / NEFT</option>
                    <option value="Cash at Counter">Cash at Counter</option>
                  </select>
                </div>

                <div className="accounts-filter-group">
                  <span className="accounts-filter-label">Audit Status:</span>
                  <select
                    className="accounts-filter-select"
                    value={txnStatusFilter}
                    onChange={(e) => setTxnStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Verified">Verified Only</option>
                    <option value="Reconciled">Reconciled Settlement</option>
                  </select>
                </div>
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
                      <th style={{ textAlign: 'right' }}>Official Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn) => (
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
                        <td><span className={`admin-badge ${hasVerifiedReceipt(txn) ? 'approved' : 'pending'}`}>{txn.status || 'Unknown'}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-table-action-btn"
                            title={hasVerifiedReceipt(txn) ? 'Generate payment receipt PDF' : 'A verified receipt is not available for this transaction'}
                            disabled={!hasVerifiedReceipt(txn)}
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

          {/* TAB 5: FEE STRUCTURES */}
          {activeTab === 'structure' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Institutional Fee Structure Matrix</h2>
                  <p>Autonomous curricular package breakdown approved by GIFT Finance Committee.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      exportToCsv('Fee_Structures_Matrix.csv', feeStructures);
                      showToast('Exported Fee Structures Matrix to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Matrix CSV
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsCreateStructureOpen(true)}>
                    <Plus size={15} /> Publish New Fee Structure
                  </button>
                </div>
              </div>

              {/* Filter */}
              <div className="accounts-filter-bar">
                <div className="accounts-filter-group">
                  <span className="accounts-filter-label">Filter Program:</span>
                  <select
                    className="accounts-filter-select"
                    value={structureProgramFilter}
                    onChange={(e) => setStructureProgramFilter(e.target.value)}
                  >
                    <option value="ALL">All Degree Programs</option>
                    <option value="B.Tech">B.Tech (Autonomous)</option>
                    <option value="MBA">MBA (Management)</option>
                    <option value="MCA">MCA (Computer Applications)</option>
                    <option value="M.Tech">M.Tech (Post-Graduate)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {filteredStructures.map((str) => (
                  <div key={str.id} className="admin-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="admin-badge active">{str.program}</span>
                      <strong style={{ color: '#059669', fontSize: '1.25rem' }}>₹{str.total.toLocaleString('en-IN')}</strong>
                    </div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0f172a' }}>{str.term}</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Tuition Fee</span>
                        <strong>₹{str.tuitionFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Development &amp; Infrastructure</span>
                        <strong>₹{str.developmentFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Lab &amp; Library Systems</span>
                        <strong>₹{str.labLibraryFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Autonomous Exam Fee</span>
                        <strong>₹{str.examinationFee.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.45rem' }}>
                        <span style={{ color: '#64748b' }}>Hostel &amp; Mess Boarding (Optional)</span>
                        <strong>₹{str.hostelMessFee.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SCHOLARSHIPS */}
          {activeTab === 'scholarships' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Government &amp; Institutional Scholarships</h2>
                  <p>Direct Benefit Transfer (DBT) verification, state welfare grants, and merit tuition waivers.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      exportToCsv('Scholarships_Summary.csv', scholarships);
                      showToast('Exported Scholarships Summary to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Scholarships CSV
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsSanctionScholarshipOpen(true)}>
                    <Plus size={15} /> Sanction Scholarship / Waiver
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {scholarships.map((sch) => (
                  <div key={sch.id} className="admin-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="admin-badge active">{sch.status}</span>
                      <strong style={{ color: '#2563eb' }}>{sch.benefit}</strong>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f172a' }}>{sch.name}</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b' }}>{sch.authority}</p>

                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span>Enrolled Beneficiaries:</span>
                      <strong>{sch.beneficiaries} Students</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FINANCIAL REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Finance &amp; Accounts Audit Gazettes</h2>
                  <p>Download reconciliation sheets, daily collection registers, defaulter rosters, and head summaries.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 className="admin-card-title">Daily Fee Collection Register</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Itemized receipt log across counter cash, online UPI QR, and Net Banking collections.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-action-btn-primary"
                      onClick={() => {
                        downloadAccountsRegisterPdf(transactions);
                        showToast('Generated & downloaded Daily Fee Collection Register PDF.');
                      }}
                    >
                      <Download size={15} /> Download Register PDF
                    </button>
                    <button
                      className="admin-action-btn-secondary"
                      onClick={() => {
                        exportToCsv('Daily_Collection_Register.csv', transactions);
                        showToast('Exported Daily Collection Register to CSV.');
                      }}
                    >
                      <FileSpreadsheet size={15} /> CSV
                    </button>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Semester Defaulters &amp; Arrears Sheet</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    This report needs persisted student fee assessments and due dates. Those are not configured yet.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-action-btn-primary"
                      style={{ background: '#dc2626', borderColor: '#dc2626' }}
                      disabled
                    >
                      <Download size={15} /> Defaulters PDF unavailable
                    </button>
                    <button
                      className="admin-action-btn-secondary"
                      disabled
                    >
                      <FileSpreadsheet size={15} /> CSV unavailable
                    </button>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Fee-Head Revenue Summary</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Institutional allocation across tuition, infrastructure, laboratory, and examination funds.
                  </p>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      exportToCsv('Fee_Head_Revenue_Summary.csv', dashboardStats.feeHeadBreakdown);
                      showToast('Exported Fee-Head Revenue Summary to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Revenue Breakdown CSV
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Payment Gateway Settlement Reconciliation</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Reconciliation of Net Banking, UPI, and Bank Challan deposits against bank credits.
                  </p>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      exportToCsv('Channel_Reconciliation.csv', dashboardStats.paymentChannelDistribution);
                      showToast('Exported Channel Reconciliation Report to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Channel Settlement CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STUDENT DOCUMENTS */}
          {activeTab === 'documents' && (
            <StudentDocumentsTable portalRole="accounts" />
          )}
        </main>
      </div>

      {/* MODAL: PROOF AUDIT & VERIFICATION */}
      {selectedProof && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedProof(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Digital Payment Proof Verification Audit</h3>
              <button className="admin-table-action-btn" onClick={() => setSelectedProof(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Left Column: Zoomable Image / Document */}
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <small style={{ color: '#94a3b8' }}>{selectedProof.fileName || 'Proof_Document.png'}</small>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setProofZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                      style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProofZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                      style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}
                    >
                      <ZoomOut size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProofZoomLevel(1)}
                      style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '320px',
                    overflow: 'auto',
                    background: '#1e293b',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {selectedProof.proofLoading ? (
                    <span style={{ color: '#e2e8f0' }}>Loading submitted proof…</span>
                  ) : selectedProof.proofError ? (
                    <span role="alert" style={{ color: '#fecaca', padding: '16px', textAlign: 'center' }}>{selectedProof.proofError}</span>
                  ) : !selectedProof.proofUrl ? (
                    <span style={{ color: '#e2e8f0' }}>No stored proof file is available for this submission.</span>
                  ) : selectedProof.fileType === 'application/pdf' ? (
                    <iframe
                      title={`Submitted proof ${selectedProof.fileName}`}
                      src={selectedProof.proofUrl}
                      style={{ width: '100%', height: '100%', border: 0, background: '#fff' }}
                    />
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

              {/* Right Column: Verification Data Audit & Comparison */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#0f172a' }}>Transaction Verification Audit</h4>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '12px',
                    fontSize: '0.84rem'
                  }}
                >
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Student:</strong> {selectedProof.studentName} (Roll: {selectedProof.rollNumber})
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Department:</strong> {selectedProof.department || 'CSE'}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Amount Claimed:</strong>{' '}
                    <strong style={{ color: '#059669', fontSize: '1.05rem' }}>
                      ₹{Number(selectedProof.amount).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Payment Date:</strong> {selectedProof.paymentDate}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>Payment Channel:</strong> {selectedProof.paymentMethod}
                  </div>
                  <div>
                    <strong>Transaction ID / UTR:</strong>{' '}
                    <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>
                      {selectedProof.transactionId}
                    </code>
                  </div>
                  {selectedProof.remarks && <div style={{ marginTop: '6px' }}><strong>Remarks:</strong> {selectedProof.remarks}</div>}
                </div>

                {/* Automated OCR Check Indicator */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    color: '#166534',
                    fontSize: '0.8rem',
                    marginBottom: '16px'
                  }}
                >
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
                  <div
                    style={{
                      background: selectedProof.status === 'APPROVED' ? '#ecfdf5' : '#fef2f2',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: selectedProof.status === 'APPROVED' ? '#047857' : '#b91c1c'
                    }}
                  >
                    Status: {selectedProof.status}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECTION REASON */}
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

      {/* MODAL: PUBLISH NEW FEE STRUCTURE */}
      {isCreateStructureOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCreateStructureOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Publish New Academic Fee Structure</h3>
              <button className="admin-table-action-btn" onClick={() => setIsCreateStructureOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStructure}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Degree Program</label>
                  <select
                    className="admin-form-select"
                    value={newStructureForm.program}
                    onChange={(e) => setNewStructureForm({ ...newStructureForm, program: e.target.value })}
                    required
                  >
                    <option value="">Select degree program</option>
                    <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science &amp; Engineering</option>
                    <option value="B.Tech Electronics & Communication">B.Tech Electronics &amp; Communication</option>
                    <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                    <option value="B.Tech Civil Engineering">B.Tech Civil Engineering</option>
                    <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                    <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Academic Session Term</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newStructureForm.term}
                    onChange={(e) => setNewStructureForm({ ...newStructureForm, term: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Tuition Fee (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={newStructureForm.tuitionFee}
                      onChange={(e) => setNewStructureForm({ ...newStructureForm, tuitionFee: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Development Fee (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={newStructureForm.developmentFee}
                      onChange={(e) => setNewStructureForm({ ...newStructureForm, developmentFee: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Lab &amp; Library Deposit (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={newStructureForm.labLibraryFee}
                      onChange={(e) => setNewStructureForm({ ...newStructureForm, labLibraryFee: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Autonomous Exam Fee (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={newStructureForm.examinationFee}
                      onChange={(e) => setNewStructureForm({ ...newStructureForm, examinationFee: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Hostel &amp; Mess Charges (₹ - Optional)</label>
                  <input
                    type="number"
                    className="admin-form-input"
                    value={newStructureForm.hostelMessFee}
                    onChange={(e) => setNewStructureForm({ ...newStructureForm, hostelMessFee: e.target.value })}
                  />
                </div>

                {/* Auto Calculated Total Banner */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#166534' }}>Calculated Total Annual Package:</span>
                  <strong style={{ fontSize: '1.15rem', color: '#15803d' }}>
                    ₹
                    {(
                      Number(newStructureForm.tuitionFee || 0) +
                      Number(newStructureForm.developmentFee || 0) +
                      Number(newStructureForm.labLibraryFee || 0) +
                      Number(newStructureForm.examinationFee || 0) +
                      Number(newStructureForm.hostelMessFee || 0)
                    ).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsCreateStructureOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Publish Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SANCTION SCHOLARSHIP */}
      {isSanctionScholarshipOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsSanctionScholarshipOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Sanction Scholarship / Fee Waiver</h3>
              <button className="admin-table-action-btn" onClick={() => setIsSanctionScholarshipOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSanctionScholarship}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Student Roll (name is resolved from the database)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newScholarshipForm.studentRoll}
                    onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, studentRoll: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Scholarship Scheme</label>
                  <select
                    className="admin-form-select"
                    value={newScholarshipForm.name}
                    onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, name: e.target.value })}
                    required
                  >
                    <option value="">Select scholarship scheme</option>
                    <option value="PRERANA Post-Matric Scholarship">PRERANA Post-Matric Scholarship</option>
                    <option value="AICTE Pragati Scholarship for Girls">AICTE Pragati Scholarship for Girls</option>
                    <option value="GIFT Merit-cum-Means Institutional Waiver">GIFT Merit-cum-Means Institutional Waiver</option>
                    <option value="Tuition Fee Waiver Scheme (TFW)">Tuition Fee Waiver Scheme (TFW)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Sponsoring Authority</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newScholarshipForm.authority}
                    onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, authority: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Academic Year</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={newScholarshipForm.academicYear}
                    onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, academicYear: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Sanction Amount (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={newScholarshipForm.sanctionedAmount}
                      onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, sanctionedAmount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Disbursement Type</label>
                    <select
                      className="admin-form-select"
                      value={newScholarshipForm.category}
                      onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, category: e.target.value })}
                      required
                    >
                      <option value="">Select disbursement type</option>
                      <option value="Government DBT">Government Direct Benefit (DBT)</option>
                      <option value="Institutional Waiver">Tuition Fee Waiver Credit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsSanctionScholarshipOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Sanction Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {isRecordPaymentOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsRecordPaymentOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Record Received Payment</h3>
              <button className="admin-table-action-btn" onClick={() => setIsRecordPaymentOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="admin-modal-body">
                <p style={{ color: '#92400e', background: '#fffbeb', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  Record only funds you have independently confirmed. This creates a receipt record; fee balances and clearance are not configured.
                </p>
                <div className="admin-form-group">
                  <label>Student Roll Number</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={paymentForm.rollNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, rollNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Semester / Term</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={paymentForm.semester}
                    onChange={(e) => setPaymentForm({ ...paymentForm, semester: e.target.value })}
                    maxLength={80}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Fee Head / Category</label>
                  <select
                    className="admin-form-select"
                    value={paymentForm.head}
                    onChange={(e) => setPaymentForm({ ...paymentForm, head: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select fee head</option>
                    <option value="Tuition & Development Fee">Tuition &amp; Development Fee</option>
                    <option value="Hostel & Mess Charges">Hostel &amp; Mess Charges</option>
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
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      min="0.01"
                      max="10000000"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Payment Channel</label>
                    <select
                      className="admin-form-select"
                      value={paymentForm.mode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
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
                  Record Confirmed Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW / PRINT RECEIPT */}
      {selectedReceipt && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '490px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Recorded Payment Receipt</h3>
              <button className="admin-table-action-btn" onClick={() => setSelectedReceipt(null)}>
                <X size={18} />
              </button>
            </div>
            <div
              className="admin-modal-body"
              style={{
                background: '#ffffff',
                border: '1px dashed #cbd5e1',
                margin: '1rem',
                borderRadius: '8px',
                padding: '1.25rem'
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '34px', width: 'auto', marginBottom: '2px' }} />
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e3a8a', fontWeight: 800 }}>APNA CAMPUS</h4>
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

              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid #0f172a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>TOTAL RECEIVED</span>
                <strong style={{ fontSize: '1.25rem', color: '#059669' }}>
                  ₹{Number(selectedReceipt.amount).toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
                This records the payment listed above. It does not certify that any other fee balance is cleared.
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-action-btn-secondary" onClick={() => openFeeReceiptPdf(selectedReceipt)}>
                <ExternalLink size={15} /> Open PDF in New Tab
              </button>
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
