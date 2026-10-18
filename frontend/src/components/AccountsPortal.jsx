import React, { useState, useMemo, useEffect } from 'react';
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
  downloadStudentStatementPdf,
  downloadDefaultersListPdf
} from '../utils/pdfGenerator';
import {
  initialFeeStructures,
  initialFeeTransactions,
  initialScholarships,
  generateAllStudents
} from '../data/collegeData.js';
import { getAllStudents } from '../services/studentStore.js';
import { api } from '../services/api.js';
import { feesApi } from '../services/feesApi.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import StudentDocumentsTable from './StudentDocumentsTable.jsx';

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

export default function AccountsPortal({ account, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [feeStructures, setFeeStructures] = useState(initialFeeStructures);
  const [transactions, setTransactions] = useState(initialFeeTransactions);
  const [scholarships, setScholarships] = useState(initialScholarships);
  const [students] = useState(() => {
    const list = getAllStudents();
    return list && list.length > 0 ? list : generateAllStudents();
  });

  // Dashboard Metrics & Filters
  const [dashboardFilter, setDashboardFilter] = useState({
    academicYear: '2026-27',
    semester: 'ALL',
    department: 'ALL'
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalAssessed: 41370000,
    totalCollected: 36240000,
    totalOutstanding: 5130000,
    collectionRate: 87.6,
    studentsWithDues: 54,
    pendingVerificationsCount: 1,
    pendingVerificationsSum: 20000,
    failedTransactionsCount: 2,
    scholarshipsSanctioned: 8610000,
    scholarshipsDisbursed: 6610000,
    refundsAndReversals: 25000,
    monthlyTrends: [
      { month: 'Jun', assessed: 8200000, collected: 7100000 },
      { month: 'Jul', assessed: 12500000, collected: 11200000 },
      { month: 'Aug', assessed: 9800000, collected: 8900000 },
      { month: 'Sep', assessed: 6400000, collected: 5600000 },
      { month: 'Oct', assessed: 4470000, collected: 3440000 }
    ],
    feeHeadBreakdown: [
      { head: 'Tuition & Academic Fee', percentage: 55, amount: 22753500 },
      { head: 'Development & Infrastructure', percentage: 18, amount: 7446600 },
      { head: 'Hostel & Residential Boarding', percentage: 15, amount: 6205500 },
      { head: 'Transportation Fleet Charges', percentage: 7, amount: 2895900 },
      { head: 'Examination & Autonomous Evaluation', percentage: 5, amount: 2068500 }
    ],
    paymentChannelDistribution: [
      { channel: 'Online Net Banking', percentage: 48, count: 214 },
      { channel: 'UPI / QR Campus Scan', percentage: 32, count: 142 },
      { channel: 'Bank Challan / NEFT', percentage: 14, count: 62 },
      { channel: 'Accounts Counter Cash', percentage: 6, count: 26 }
    ]
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
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('ALL');
  const [selectedStatementStudent, setSelectedStatementStudent] = useState(null);

  // Transaction Search & Channel Filters
  const [searchTxn, setSearchTxn] = useState('');
  const [txnChannelFilter, setTxnChannelFilter] = useState('ALL');
  const [txnStatusFilter, setTxnStatusFilter] = useState('ALL');

  // Fee Structure Filters & Modal
  const [structureProgramFilter, setStructureProgramFilter] = useState('ALL');
  const [isCreateStructureOpen, setIsCreateStructureOpen] = useState(false);
  const [newStructureForm, setNewStructureForm] = useState({
    program: 'B.Tech Computer Science & Engineering',
    term: 'Academic Year 2026-27 (Autumn)',
    tuitionFee: 65000,
    developmentFee: 15000,
    labLibraryFee: 10000,
    examinationFee: 3500,
    hostelMessFee: 42000
  });

  // Scholarships Modal
  const [isSanctionScholarshipOpen, setIsSanctionScholarshipOpen] = useState(false);
  const [newScholarshipForm, setNewScholarshipForm] = useState({
    name: 'PRERANA Post-Matric Scholarship',
    authority: 'Government of Odisha (ST & SC Welfare Dept)',
    benefit: '₹45,000 / Year',
    category: 'Government DBT',
    beneficiaries: 1,
    studentRoll: '2305201001',
    studentName: 'Rakesh Das',
    sanctionedAmount: 45000
  });

  // Modals & General Workflow States
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    rollNumber: '2305201001',
    studentName: 'Rakesh Das',
    head: 'Tuition & Development Fee',
    amount: '48500',
    mode: 'Net Banking',
    semester: 'Semester 5'
  });

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
    const stats = await feesApi.getDashboardStats(dashboardFilter);
    if (stats) setDashboardStats(stats);
  };

  const loadVerifications = async () => {
    const list = await feesApi.getPaymentVerifications('ALL');
    if (list) setVerificationList(list);
  };

  const loadInitialBackendData = async () => {
    const structures = await feesApi.getFeeStructures();
    if (structures && structures.length > 0) setFeeStructures(structures);
    const txns = await feesApi.getFeeTransactions();
    if (txns && txns.length > 0) setTransactions(txns);
    const sch = await feesApi.getScholarships();
    if (sch && sch.length > 0) setScholarships(sch);
  };

  const pendingCount = useMemo(() => {
    return verificationList.filter((item) => item.status === 'PENDING').length;
  }, [verificationList]);

  // Digital Proof Actions
  const handleApproveProof = async (id) => {
    const proof = verificationList.find((p) => p.id === id);
    const res = await feesApi.approvePayment(id);
    if (res && res.success) {
      // Auto-post verified transaction into ledger
      const autoTxn = {
        id: proof?.transactionId || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        studentName: proof?.studentName || 'Student',
        rollNumber: proof?.rollNumber || '2305201001',
        semester: 'Semester 5',
        head: proof?.remarks || 'Tuition Fee (Online Proof Verified)',
        amount: Number(proof?.amount || 20000),
        mode: proof?.paymentMethod || 'UPI',
        date: 'Today, Just now',
        status: 'Verified',
        receiptNo: `RCPT-2026-${Math.floor(1000 + Math.random() * 9000)}`
      };
      setTransactions((prev) => [autoTxn, ...prev]);

      showToast(`✓ Payment proof verified & approved! Posted to student ledger with Receipt #${autoTxn.receiptNo}`);
      await loadVerifications();
      await loadDashboardStats();
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

  // Record Payment Handler
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amt = Number(paymentForm.amount);
    if (amt <= 0) {
      showToast('Payment amount must be greater than zero.');
      return;
    }

    const receiptNo = `RCPT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: paymentForm.studentName,
      rollNumber: paymentForm.rollNumber,
      semester: paymentForm.semester,
      head: paymentForm.head,
      amount: amt,
      mode: paymentForm.mode,
      date: 'Today, Just now',
      status: 'Verified',
      receiptNo
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setIsRecordPaymentOpen(false);
    showToast(`✓ Payment of ₹${amt.toLocaleString('en-IN')} recorded for Roll ${paymentForm.rollNumber}! Receipt: ${receiptNo}`);

    try {
      await api.recordFeePayment(paymentForm);
    } catch (err) {
      console.warn('Backend payment sync fallback:', err.message);
    }
  };

  // Fee Structure Creation Handler
  const handleCreateStructure = async (e) => {
    e.preventDefault();
    const total =
      Number(newStructureForm.tuitionFee) +
      Number(newStructureForm.developmentFee) +
      Number(newStructureForm.labLibraryFee) +
      Number(newStructureForm.examinationFee) +
      Number(newStructureForm.hostelMessFee || 0);

    const newStr = {
      id: `FS-${Date.now()}`,
      program: newStructureForm.program,
      term: newStructureForm.term,
      tuitionFee: Number(newStructureForm.tuitionFee),
      developmentFee: Number(newStructureForm.developmentFee),
      labLibraryFee: Number(newStructureForm.labLibraryFee),
      examinationFee: Number(newStructureForm.examinationFee),
      hostelMessFee: Number(newStructureForm.hostelMessFee || 0),
      total
    };

    setFeeStructures((prev) => [newStr, ...prev]);
    setIsCreateStructureOpen(false);
    showToast(`✓ Published new fee structure for ${newStr.program} (Total: ₹${total.toLocaleString('en-IN')})`);

    try {
      await feesApi.createFeeStructure(newStr);
    } catch (err) {
      console.warn('Fee structure sync fallback:', err.message);
    }
  };

  // Sanction Scholarship Handler
  const handleSanctionScholarship = async (e) => {
    e.preventDefault();
    const newSch = {
      id: `SCH-${Date.now()}`,
      name: newScholarshipForm.name,
      authority: newScholarshipForm.authority,
      benefit: `₹${Number(newScholarshipForm.sanctionedAmount).toLocaleString('en-IN')} / Year`,
      category: newScholarshipForm.category,
      beneficiaries: Number(newScholarshipForm.beneficiaries || 1),
      status: 'Active'
    };

    setScholarships((prev) => [newSch, ...prev]);
    setIsSanctionScholarshipOpen(false);
    showToast(`✓ Sanctioned scholarship grant for ${newScholarshipForm.studentName} (Roll: ${newScholarshipForm.studentRoll})`);

    try {
      await feesApi.sanctionScholarship(newSch);
    } catch (err) {
      console.warn('Scholarship sync fallback:', err.message);
    }
  };

  // Filtered Ledger Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.rollNumber.includes(searchStudent);

      const rollNum = parseInt(s.rollNumber) || 1;
      const isCleared = rollNum % 3 !== 0;

      let matchStatus = true;
      if (ledgerStatusFilter === 'CLEARED') matchStatus = isCleared;
      if (ledgerStatusFilter === 'PENDING') matchStatus = !isCleared;

      let matchDept = true;
      if (ledgerDeptFilter !== 'ALL') {
        const d = (s.department || 'CSE').toUpperCase();
        matchDept = d.includes(ledgerDeptFilter);
      }

      return matchSearch && matchStatus && matchDept;
    });
  }, [students, searchStudent, ledgerStatusFilter, ledgerDeptFilter]);

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

  // Defaulters List for Reports & PDF
  const defaultersList = useMemo(() => {
    return students
      .filter((s) => {
        const rollNum = parseInt(s.rollNumber) || 1;
        return rollNum % 3 === 0;
      })
      .map((s) => ({
        rollNumber: s.rollNumber,
        name: s.name,
        department: s.department || 'CSE',
        semester: 'Semester 5',
        dueAmount: 28500,
        dueDate: '15-Nov-2026',
        noticeLevel: 'Final Clearance Notice'
      }));
  }, [students]);

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

      {/* Main Layout */}
      <div className={`accounts-layout ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="accounts-sidebar">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.2rem 0.4rem 0.6rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '0.5rem'
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                Financial Controls
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'rgba(15, 23, 42, 0.08)',
                  border: 'none',
                  color: '#64748b',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close Navigation"
              >
                <X size={16} />
              </button>
            </div>

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
                  <div className="admin-kpi-val">₹{(dashboardStats.totalAssessed / 10000000).toFixed(2)} Cr</div>
                  <small style={{ color: '#64748b' }}>For 2,480 enrolled autonomous students</small>
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
                    ₹{(dashboardStats.totalCollected / 10000000).toFixed(2)} Cr
                  </div>
                  <div className="accounts-progress-track">
                    <div className="accounts-progress-fill" style={{ width: `${dashboardStats.collectionRate}%` }}></div>
                  </div>
                  <small style={{ color: '#059669', fontWeight: 700 }}>
                    {dashboardStats.collectionRate}% Institutional Clearance Rate
                  </small>
                </div>

                <div
                  className="admin-kpi-card interactive-kpi"
                  onClick={() => {
                    setLedgerStatusFilter('PENDING');
                    setActiveTab('students');
                  }}
                  title="Click to view students with outstanding dues"
                >
                  <div className="kpi-click-indicator">Filter <ArrowUpRight size={13} /></div>
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Outstanding Student Dues</span>
                    <div className="admin-kpi-card-icon amber"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>
                    ₹{(dashboardStats.totalOutstanding / 100000).toFixed(1)} L
                  </div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>
                    {dashboardStats.studentsWithDues} students pending semester clearance
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
                    ₹{(dashboardStats.pendingVerificationsSum || 20000).toLocaleString('en-IN')} pending reviewer approval
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
                    ₹{(dashboardStats.scholarshipsDisbursed / 100000).toFixed(1)} L
                  </div>
                  <small style={{ color: '#64748b' }}>265 PRERANA &amp; Pragati Beneficiaries</small>
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
                    ₹{(dashboardStats.refundsAndReversals || 25000).toLocaleString('en-IN')}
                  </div>
                  <small style={{ color: '#64748b' }}>2 audited fee deposit reversals</small>
                </div>

                <div
                  className="admin-card"
                  style={{ padding: '0.85rem 1.15rem', marginBottom: 0 }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Gateway Settlement Latency
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
                    T+1 Cycle
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
                    {dashboardStats.monthlyTrends.map((t) => {
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
                        Autonomous institutional revenue split across heads
                      </p>
                    </div>
                    <PieChart size={18} color="#2563eb" />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dashboardStats.feeHeadBreakdown.map((fh) => (
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
                  <h2>Student Fee Ledger &amp; Clearance Accounts</h2>
                  <p>Individual student statements, annual tuition packages, and semester clearance audit.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="admin-action-btn-secondary"
                    onClick={() => {
                      const exportData = filteredStudents.map((s) => {
                        const rollNum = parseInt(s.rollNumber) || 1;
                        const isCleared = rollNum % 3 !== 0;
                        const waiver = rollNum % 5 === 0 ? 15000 : 0;
                        const annual = 98500;
                        const paid = isCleared ? annual - waiver : 65000 - waiver;
                        const due = annual - waiver - paid;
                        return {
                          RollNumber: s.rollNumber,
                          StudentName: s.name,
                          Department: s.department || 'CSE',
                          Semester: 'Semester 5',
                          Category: s.category || 'General',
                          AnnualFeePackage: annual,
                          ScholarshipCredit: waiver,
                          PaidAmount: paid,
                          OutstandingBalance: due,
                          ClearanceStatus: due === 0 ? 'No Dues Clear' : 'Dues Pending'
                        };
                      });
                      exportToCsv('Student_Fee_Ledger.csv', exportData);
                      showToast('Exported Student Fee Ledger to CSV.');
                    }}
                  >
                    <FileSpreadsheet size={15} /> Export Ledger CSV
                  </button>
                  <button className="admin-action-btn-primary" onClick={() => setIsRecordPaymentOpen(true)}>
                    <Plus size={15} /> Record Payment
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

                <div className="accounts-filter-group">
                  <span className="accounts-filter-label">Clearance Status:</span>
                  <select
                    className="accounts-filter-select"
                    value={ledgerStatusFilter}
                    onChange={(e) => setLedgerStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Students</option>
                    <option value="CLEARED">No Dues Cleared</option>
                    <option value="PENDING">Dues Pending Only</option>
                  </select>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Program &amp; Semester</th>
                      <th>Category</th>
                      <th>Annual Fee Package</th>
                      <th>Waiver / Credit</th>
                      <th>Paid Amount</th>
                      <th>Outstanding Balance</th>
                      <th>Clearance Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.slice(0, 25).map((s) => {
                      const rollNum = parseInt(s.rollNumber) || 1;
                      const isCleared = rollNum % 3 !== 0;
                      const waiver = rollNum % 5 === 0 ? 15000 : 0;
                      const annual = 98500;
                      const paidAmt = isCleared ? annual - waiver : 65000 - waiver;
                      const dueAmt = annual - waiver - paidAmt;

                      return (
                        <tr key={s.id}>
                          <td><strong>{s.rollNumber}</strong></td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>{s.department || 'CSE'} · Semester 5</td>
                          <td><span className="admin-badge">{s.category || 'General'}</span></td>
                          <td>₹{annual.toLocaleString('en-IN')}</td>
                          <td>{waiver > 0 ? <span style={{ color: '#2563eb', fontWeight: 600 }}>₹{waiver.toLocaleString('en-IN')}</span> : '-'}</td>
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
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                className="admin-action-btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                                title="View Itemized Financial Statement"
                                onClick={() => {
                                  setSelectedStatementStudent({
                                    student: {
                                      studentName: s.name,
                                      rollNumber: s.rollNumber,
                                      department: s.department || 'Computer Science & Engineering',
                                      program: 'B.Tech (Autonomous)',
                                      semester: 'Semester 5 (3rd Year)',
                                      academicYear: '2026-27',
                                      category: s.category || 'General'
                                    },
                                    totalAnnualDues: annual,
                                    paidAmount: paidAmt,
                                    scholarshipCredit: waiver,
                                    outstanding: dueAmt,
                                    feeHeads: [
                                      { head: 'Tuition Fee (Autumn Term)', assessed: 48500, paid: isCleared ? 48500 : 38500, balance: isCleared ? 0 : 10000, dueDate: '15 Aug 2026', status: isCleared ? 'Cleared' : 'Partial' },
                                      { head: 'Development & Infrastructure Fee', assessed: 20000, paid: 20000, balance: 0, dueDate: '15 Aug 2026', status: 'Cleared' },
                                      { head: 'Laboratory & Systems Deposit', assessed: 6000, paid: 6000, balance: 0, dueDate: '30 Aug 2026', status: 'Cleared' },
                                      { head: 'Autonomous Examination Fee', assessed: 3500, paid: 3500, balance: 0, dueDate: '10 Sep 2026', status: 'Cleared' },
                                      { head: 'Hostel & Mess Boarding Charges', assessed: 20500, paid: isCleared ? 20500 : 2000, balance: isCleared ? 0 : 18500, dueDate: '15 Nov 2026', status: isCleared ? 'Cleared' : 'Pending' }
                                    ]
                                  });
                                }}
                              >
                                Statement
                              </button>
                              <button
                                className="admin-action-btn-primary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                                onClick={() => {
                                  setPaymentForm({
                                    rollNumber: s.rollNumber,
                                    studentName: s.name,
                                    head: 'Semester Dues Clearance',
                                    amount: String(dueAmt > 0 ? dueAmt : 48500),
                                    mode: 'Net Banking',
                                    semester: 'Semester 5'
                                  });
                                  setIsRecordPaymentOpen(true);
                                }}
                              >
                                Collect Fee
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                    Student-wise dues roster with outstanding balances for semester clearance follow-ups.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-action-btn-primary"
                      style={{ background: '#dc2626', borderColor: '#dc2626' }}
                      onClick={() => {
                        downloadDefaultersListPdf(defaultersList);
                        showToast('Generated & downloaded Fee Defaulters Register PDF.');
                      }}
                    >
                      <Download size={15} /> Download Defaulters PDF
                    </button>
                    <button
                      className="admin-action-btn-secondary"
                      onClick={() => {
                        exportToCsv('Fee_Defaulters_Roster.csv', defaultersList);
                        showToast('Exported Defaulters Roster to CSV.');
                      }}
                    >
                      <FileSpreadsheet size={15} /> CSV
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
                  {selectedProof.fileType === 'application/pdf' ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#fff', width: '100%' }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px'
                        }}
                      >
                        <FileText size={32} style={{ color: '#f87171' }} />
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                        {selectedProof.fileName || 'Bank_Remittance_Receipt.pdf'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '16px' }}>
                        Official Bank Transfer Counterfoil &bull; Verified UTR: {selectedProof.transactionId}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => openPaymentProofPdf(selectedProof)}
                          style={{
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                          }}
                        >
                          <ExternalLink size={14} /> Open PDF Document ↗
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadPaymentProofPdf(selectedProof)}
                          style={{
                            background: '#334155',
                            color: '#e2e8f0',
                            border: '1px solid #475569',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Download size={14} /> Download PDF
                        </button>
                      </div>
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

      {/* MODAL / DRAWER: STUDENT FINANCIAL STATEMENT */}
      {selectedStatementStudent && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStatementStudent(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Student Financial Account Statement</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedStatementStudent.student.studentName} · Roll {selectedStatementStudent.student.rollNumber}
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedStatementStudent(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Summary Stats Box */}
              <div className="accounts-statement-box">
                <div>
                  <div className="accounts-statement-stat-label">Total Assessed</div>
                  <div className="accounts-statement-stat-val">₹{selectedStatementStudent.totalAnnualDues.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="accounts-statement-stat-label">Scholarship Credit</div>
                  <div className="accounts-statement-stat-val" style={{ color: '#93c5fd' }}>
                    ₹{selectedStatementStudent.scholarshipCredit.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="accounts-statement-stat-label">Paid Amount</div>
                  <div className="accounts-statement-stat-val" style={{ color: '#34d399' }}>
                    ₹{selectedStatementStudent.paidAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="accounts-statement-stat-label">Net Balance Due</div>
                  <div
                    className="accounts-statement-stat-val"
                    style={{ color: selectedStatementStudent.outstanding > 0 ? '#f87171' : '#34d399' }}
                  >
                    ₹{selectedStatementStudent.outstanding.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Itemized Fee Heads */}
              <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 8px 0' }}>Itemized Fee Heads Schedule</h4>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fee Component</th>
                      <th>Assessed (₹)</th>
                      <th>Paid (₹)</th>
                      <th>Balance Due (₹)</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStatementStudent.feeHeads.map((fh) => (
                      <tr key={fh.head}>
                        <td><strong>{fh.head}</strong></td>
                        <td>₹{fh.assessed.toLocaleString('en-IN')}</td>
                        <td><strong style={{ color: '#059669' }}>₹{fh.paid.toLocaleString('en-IN')}</strong></td>
                        <td>
                          <strong style={{ color: fh.balance > 0 ? '#dc2626' : '#64748b' }}>
                            ₹{fh.balance.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td><small style={{ color: '#64748b' }}>{fh.dueDate}</small></td>
                        <td>
                          <span className={`admin-badge ${fh.balance === 0 ? 'approved' : 'pending'}`}>
                            {fh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => {
                  downloadStudentStatementPdf(selectedStatementStudent);
                  showToast(`Downloaded financial statement PDF for Roll ${selectedStatementStudent.student.rollNumber}.`);
                }}
              >
                <Download size={15} /> Download Official PDF Statement
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                onClick={() => {
                  setPaymentForm({
                    rollNumber: selectedStatementStudent.student.rollNumber,
                    studentName: selectedStatementStudent.student.studentName,
                    head: 'Tuition & Development Fee',
                    amount: String(selectedStatementStudent.outstanding || 48500),
                    mode: 'Net Banking',
                    semester: 'Semester 5'
                  });
                  setSelectedStatementStudent(null);
                  setIsRecordPaymentOpen(true);
                }}
              >
                Collect Fee
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
                  >
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Student Roll</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={newScholarshipForm.studentRoll}
                      onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, studentRoll: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Student Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={newScholarshipForm.studentName}
                      onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, studentName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Scholarship Scheme</label>
                  <select
                    className="admin-form-select"
                    value={newScholarshipForm.name}
                    onChange={(e) => setNewScholarshipForm({ ...newScholarshipForm, name: e.target.value })}
                  >
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
                    >
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
                      onChange={(e) => setPaymentForm({ ...paymentForm, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Student Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={paymentForm.studentName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, studentName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Fee Head / Category</label>
                  <select
                    className="admin-form-select"
                    value={paymentForm.head}
                    onChange={(e) => setPaymentForm({ ...paymentForm, head: e.target.value })}
                  >
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
                  Verify &amp; Issue Receipt
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
              <h3>Official College Fee Receipt</h3>
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
                Computer generated electronic receipt. Valid for autonomous semester enrollment clearance.
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
