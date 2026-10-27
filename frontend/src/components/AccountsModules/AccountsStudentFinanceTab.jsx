import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  Calendar,
  Layers,
  Building2,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  CreditCard,
  IndianRupee,
  FileText,
  Award,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import './AccountsStudentFinanceTab.css';
import feesApi from '../../services/feesApi';

export default function AccountsStudentFinanceTab({
  feeStructures = [],
  studentLedgers = [],
  transactions = [],
  onUpdateFeeStructures,
  onUpdateStudentLedgers,
  onUpdateTransactions,
  onAddAuditLog,
  initialSubtab = 'ledger',
  activeTab,
  onNavigateTab
}) {
  const [selectedSubtab, setSelectedSubtab] = useState(initialSubtab);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Synchronize active subtab whenever parent's activeTab / initialSubtab changes
  useEffect(() => {
    if (initialSubtab) {
      setSelectedSubtab(initialSubtab);
    }
  }, [initialSubtab]);

  // Selected Student for 360° Financial Profile Modal
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);

  // Selected Student for No-Dues Certificate Modal
  const [issuedCertificateStudent, setIssuedCertificateStudent] = useState(null);

  // Refund Requests State
  const [refundRequests, setRefundRequests] = useState([
    {
      id: 'REF-2026-001',
      studentId: '2305201019',
      studentName: 'Sourav Panigrahi',
      department: 'Computer Science & Engineering',
      reason: 'Excess examination fee deposited twice via UPI gateway',
      amount: 3500,
      receiptRef: 'RCPT-2026-0898',
      status: 'Pending Approval',
      requestDate: '22-Oct-2026',
      method: 'Bank Transfer (NEFT)'
    },
    {
      id: 'REF-2026-002',
      studentId: '2305201035',
      studentName: 'Alok Kumar Jena',
      department: 'Mechanical Engineering',
      reason: 'Hostel caution deposit refund upon graduating semester',
      amount: 10000,
      receiptRef: 'RCPT-2025-0412',
      status: 'Approved',
      requestDate: '19-Oct-2026',
      method: 'Direct Account Credit'
    },
    {
      id: 'REF-2026-003',
      studentId: '2305201001',
      studentName: 'Rakesh Das',
      department: 'Computer Science & Engineering',
      reason: 'Library caution money settlement',
      amount: 2500,
      receiptRef: 'RCPT-2025-0109',
      status: 'Processed',
      requestDate: '10-Oct-2026',
      method: 'Cheque No. 441029'
    }
  ]);

  // Scholarship Grant State
  const [isGrantScholarshipOpen, setIsGrantScholarshipOpen] = useState(false);
  const [scholarshipForm, setScholarshipForm] = useState({
    studentId: '2305201019',
    schemeName: 'Autonomous Merit-Cum-Means Scholarship',
    fundingSource: 'Institutional Endowments Trust',
    amount: '20000',
    applicableHead: 'Tuition Fee Waiver',
    academicYear: '2026-27',
    approvalRef: 'BOR/CONC/2026-44'
  });

  // Payment Recording State
  const [paymentForm, setPaymentForm] = useState({
    studentId: '2305201019',
    studentName: 'Sourav Panigrahi',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    feeHead: 'Tuition & Development Fee (Tranche 2)',
    amount: '30500',
    mode: 'UPI (Google Pay / PhonePe)',
    reference: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    remarks: 'Autumn semester outstanding balance clearance via campus QR.'
  });

  // Printable Receipt Preview State
  const [printableReceipt, setPrintableReceipt] = useState(null);

  // Create Fee Structure Modal State
  const [isCreateStructureOpen, setIsCreateStructureOpen] = useState(false);
  const [structureForm, setStructureForm] = useState({
    id: `FEE-STR-${String(feeStructures.length + 1).padStart(2, '0')}`,
    program: 'B.Tech Information Technology',
    courseCode: 'BTECH-IT',
    academicYear: '2026-27',
    semester: 'Autumn (Semester 5)',
    tuitionFee: '65000',
    developmentFee: '15000',
    labLibraryFee: '10000',
    examinationFee: '3500',
    hostelMessFee: '42000',
    transportFee: '12000',
    status: 'Active',
    dueDate: '15-Nov-2026'
  });

  // Safe navigation handler: switches local view and informs parent sidebar router if available
  const navigateToPage = (subtabName, portalTabId) => {
    setSelectedSubtab(subtabName);
    if (onNavigateTab && portalTabId) {
      onNavigateTab(portalTabId);
    }
  };

  // Filtered Ledgers
  const filteredLedgers = studentLedgers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.includes(searchTerm) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' ? true : s.department.includes(deptFilter);
    const matchesStatus = statusFilter === 'ALL' ? true :
      statusFilter === 'Cleared' ? s.paymentStatus === 'Cleared' :
      statusFilter === 'Pending' ? s.outstandingBalance > 0 :
      statusFilter === 'Defaulter' ? s.outstandingBalance > 30000 : true;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Calculated aggregate metrics
  const totalAssessedAll = studentLedgers.reduce((sum, s) => sum + (s.totalAssessed || 0), 0);
  const totalPaidAll = studentLedgers.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
  const totalOutstandingAll = studentLedgers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
  const totalConcessionsAll = studentLedgers.reduce((sum, s) => sum + (s.concessions || 0), 0);
  const realizationRate = totalAssessedAll > 0 ? ((totalPaidAll / totalAssessedAll) * 100).toFixed(1) : '0.0';
  const defaultersCount = studentLedgers.filter(s => s.outstandingBalance > 0).length;
  const clearedCount = studentLedgers.filter(s => s.outstandingBalance === 0).length;

  // Handle Recording New Fee Payment
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    const payAmt = Number(paymentForm.amount);
    if (!payAmt || payAmt <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    const receiptNo = `RCPT-2026-${String(transactions.length + 892).padStart(4, '0')}`;
    const newTxnId = `TXN-2026-${String(transactions.length + 892).padStart(4, '0')}`;

    const newTxn = {
      id: newTxnId,
      receiptNo,
      date: 'Today, 11:30 AM',
      studentId: paymentForm.studentId,
      studentName: paymentForm.studentName,
      department: paymentForm.department,
      feeHead: paymentForm.feeHead,
      amount: payAmt,
      mode: paymentForm.mode,
      reference: paymentForm.reference,
      status: 'Verified',
      accountOfficer: 'Mr. S. K. Roy'
    };

    onUpdateTransactions([newTxn, ...transactions]);

    const updatedLedgers = studentLedgers.map(s => {
      if (s.studentId === paymentForm.studentId) {
        const newPaid = s.totalPaid + payAmt;
        const newBalance = Math.max(0, s.totalAssessed - s.concessions - newPaid);
        return {
          ...s,
          totalPaid: newPaid,
          outstandingBalance: newBalance,
          paymentStatus: newBalance === 0 ? 'Cleared' : `Partial (Due ₹${newBalance.toLocaleString('en-IN')})`,
          lastPaymentDate: 'Today',
          receiptNo,
          clearanceStatus: newBalance === 0 ? 'Approved (No Dues Issued)' : 'Pending Balance'
        };
      }
      return s;
    });

    onUpdateStudentLedgers(updatedLedgers);

    const changedStudent = updatedLedgers.find(s => s.studentId === paymentForm.studentId);
    if (changedStudent) {
      feesApi.saveStudentLedger(changedStudent).catch(err => {
        console.warn('Student ledger backend save notice:', err);
      });
    }

    onAddAuditLog({
      actionType: 'FEE_PAYMENT_RECORDED',
      target: `${receiptNo} (${paymentForm.studentName} - ₹${payAmt})`,
      details: `Mode: ${paymentForm.mode}, Ref: ${paymentForm.reference}. Balance updated.`
    });

    setPrintableReceipt({
      ...newTxn,
      studentDetails: studentLedgers.find(s => s.studentId === paymentForm.studentId)
    });
  };

  const handleCreateStructure = (e) => {
    e.preventDefault();
    const tFee = Number(structureForm.tuitionFee) || 0;
    const dFee = Number(structureForm.developmentFee) || 0;
    const lFee = Number(structureForm.labLibraryFee) || 0;
    const eFee = Number(structureForm.examinationFee) || 0;
    const hFee = Number(structureForm.hostelMessFee) || 0;

    const newStr = {
      ...structureForm,
      tuitionFee: tFee,
      developmentFee: dFee,
      labLibraryFee: lFee,
      examinationFee: eFee,
      hostelMessFee: hFee,
      totalBaseFee: tFee + dFee + lFee + eFee,
      totalHostelFee: tFee + dFee + lFee + eFee + hFee
    };

    onUpdateFeeStructures([newStr, ...feeStructures]);
    setIsCreateStructureOpen(false);

    onAddAuditLog({
      actionType: 'FEE_STRUCTURE_CREATED',
      target: `${newStr.id} (${newStr.program})`,
      details: `Base Fee: ₹${newStr.totalBaseFee}, Hostel: ₹${newStr.totalHostelFee}. Active tariff.`
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDefaultersCSV = () => {
    const defaulters = studentLedgers.filter(s => s.outstandingBalance > 0);
    const headers = ['Student ID', 'Name', 'Department', 'Course', 'Semester', 'Assessed Fee', 'Concessions', 'Paid to Date', 'Outstanding Balance', 'Payment Status'];
    const rows = defaulters.map(d => [
      d.studentId,
      `"${d.name}"`,
      `"${d.department}"`,
      d.course,
      d.semester,
      d.totalAssessed,
      d.concessions,
      d.totalPaid,
      d.outstandingBalance,
      d.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Outstanding_Dues_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFullLedgerCSV = () => {
    const headers = ['Student ID', 'Name', 'Department', 'Course', 'Semester', 'Total Assessed', 'Concessions', 'Total Paid', 'Outstanding Balance', 'Payment Status', 'Clearance Status', 'Last Payment Date', 'Receipt Ref'];
    const rows = studentLedgers.map(s => [
      s.studentId,
      `"${s.name}"`,
      `"${s.department}"`,
      s.course || 'B.Tech',
      s.semester,
      s.totalAssessed,
      s.concessions || 0,
      s.totalPaid,
      s.outstandingBalance,
      `"${s.paymentStatus}"`,
      `"${s.clearanceStatus}"`,
      s.lastPaymentDate || '—',
      s.receiptNo || '—'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Institutional_Student_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGrantScholarshipSubmit = (e) => {
    e.preventDefault();
    const grantAmt = Number(scholarshipForm.amount) || 0;
    const targetStudent = studentLedgers.find(s => s.studentId === scholarshipForm.studentId);
    if (!targetStudent) {
      alert('Selected student record not found.');
      return;
    }

    const updatedLedgers = studentLedgers.map(st => {
      if (st.studentId === scholarshipForm.studentId) {
        const newConcessions = (st.concessions || 0) + grantAmt;
        const newOutstanding = Math.max(0, st.totalAssessed - newConcessions - st.totalPaid);
        return {
          ...st,
          concessions: newConcessions,
          outstandingBalance: newOutstanding,
          paymentStatus: newOutstanding === 0 ? 'Cleared' : st.paymentStatus,
          clearanceStatus: newOutstanding === 0 ? 'Approved (No Dues Issued)' : st.clearanceStatus
        };
      }
      return st;
    });

    onUpdateStudentLedgers(updatedLedgers);
    setIsGrantScholarshipOpen(false);

    onAddAuditLog({
      actionType: 'SCHOLARSHIP_CONCESSION_GRANTED',
      target: `${targetStudent.name} (${targetStudent.studentId})`,
      details: `Awarded ₹${grantAmt.toLocaleString('en-IN')} under ${scholarshipForm.schemeName}. Adjusted fee demand.`
    });

    alert(`✓ Scholarship of ₹${grantAmt.toLocaleString('en-IN')} successfully applied to ${targetStudent.name}! Ledger adjusted.`);
  };

  const handleApproveRefund = (refundId) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === refundId) {
        return { ...r, status: 'Approved' };
      }
      return r;
    }));

    onAddAuditLog({
      actionType: 'REFUND_APPLICATION_APPROVED',
      target: refundId,
      details: 'Authorized by Accounts Officer & Institutional Bursar for treasury disbursement.'
    });
  };

  const handleRejectRefund = (refundId) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === refundId) {
        return { ...r, status: 'Rejected' };
      }
      return r;
    }));

    onAddAuditLog({
      actionType: 'REFUND_APPLICATION_REJECTED',
      target: refundId,
      details: 'Claim rejected by Finance Directorate. Non-eligible payment adjustment.'
    });
  };

  const handleProcessRefund = (refund) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === refund.id) {
        return { ...r, status: 'Processed' };
      }
      return r;
    }));

    const updatedLedgers = studentLedgers.map(st => {
      if (st.studentId === refund.studentId) {
        return {
          ...st,
          refunds: (st.refunds || 0) + refund.amount
        };
      }
      return st;
    });
    onUpdateStudentLedgers(updatedLedgers);

    onAddAuditLog({
      actionType: 'REFUND_DISBURSED_TREASURY',
      target: `${refund.id} · ${refund.studentName}`,
      details: `Disbursed ₹${refund.amount.toLocaleString('en-IN')} via ${refund.method}. Ledger updated.`
    });

    alert(`✓ Refund ${refund.id} of ₹${refund.amount.toLocaleString('en-IN')} marked as Processed! Treasury voucher generated.`);
  };

  return (
    <div className="asf-wrap">
      {/* =========================================================================
          PAGE 1: STUDENT FEE MANAGEMENT
          ========================================================================= */}
      {selectedSubtab === 'management' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Executive Summary Cards */}
          <div className="asf-kpi-grid">
            <div className="asf-kpi-card">
              <div className="asf-kpi-header">
                <span className="asf-kpi-title">Total Invoiced Demand</span>
                <Layers size={16} color="#64748b" />
              </div>
              <div className="asf-kpi-val">₹{(totalAssessedAll / 100000).toFixed(2)} L</div>
              <div className="asf-kpi-sub">
                <strong>{studentLedgers.length}</strong> Enrolled Students
              </div>
            </div>

            <div className="asf-kpi-card">
              <div className="asf-kpi-header">
                <span className="asf-kpi-title">Fee Realization</span>
                <TrendingUp size={16} color="#059669" />
              </div>
              <div className="asf-kpi-val" style={{ color: '#059669' }}>
                ₹{(totalPaidAll / 100000).toFixed(2)} L
              </div>
              <div className="asf-kpi-sub" style={{ color: '#059669', fontWeight: 650 }}>
                {realizationRate}% Overall Realization
              </div>
            </div>

            <div className="asf-kpi-card">
              <div className="asf-kpi-header">
                <span className="asf-kpi-title">Outstanding Arrears</span>
                <AlertTriangle size={16} color="#e11d48" />
              </div>
              <div className="asf-kpi-val" style={{ color: '#e11d48' }}>
                ₹{(totalOutstandingAll / 100000).toFixed(2)} L
              </div>
              <div className="asf-kpi-sub" style={{ color: '#e11d48', fontWeight: 600 }}>
                {defaultersCount} Students with Dues
              </div>
            </div>

            <div className="asf-kpi-card">
              <div className="asf-kpi-header">
                <span className="asf-kpi-title">Fee Concessions</span>
                <Award size={16} color="#d97706" />
              </div>
              <div className="asf-kpi-val" style={{ color: '#d97706' }}>
                ₹{(totalConcessionsAll / 100000).toFixed(2)} L
              </div>
              <div className="asf-kpi-sub">
                Institutional &amp; Merit Aid
              </div>
            </div>
          </div>

          {/* Departmental Realization Breakdown Panel */}
          <div className="asf-panel">
            <div className="asf-panel-header">
              <div>
                <h4 className="asf-panel-title">Departmental Fee Realization Matrix</h4>
                <p className="asf-panel-desc">Autonomous session collection progress segmented by academic branch.</p>
              </div>
              <button
                onClick={handleExportFullLedgerCSV}
                className="asf-btn-secondary"
              >
                <Download size={14} /> Export Cohort Report
              </button>
            </div>

            <div className="asf-cohort-grid">
              {['Computer Science & Engineering', 'Electronics & Telecommunication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical & Electronics'].map(dept => {
                const deptStudents = studentLedgers.filter(s => s.department.toLowerCase().includes(dept.toLowerCase().slice(0, 5)));
                const dDemand = deptStudents.reduce((sum, s) => sum + (s.totalAssessed || 0), 0);
                const dPaid = deptStudents.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
                const dPct = dDemand > 0 ? Math.round((dPaid / dDemand) * 100) : 0;

                return (
                  <div key={dept} className="asf-cohort-card">
                    <div className="asf-cohort-header">
                      <span className="asf-cohort-name" title={dept}>{dept}</span>
                      <span className="asf-badge approved">
                        {deptStudents.length} Students
                      </span>
                    </div>

                    <div className="asf-cohort-stats">
                      <span>Collected: <strong>₹{(dPaid / 1000).toFixed(0)}k</strong></span>
                      <span>Demand: <strong>₹{(dDemand / 1000).toFixed(0)}k</strong></span>
                    </div>

                    <div className="asf-progress-track">
                      <div
                        className={`asf-progress-bar ${
                          dPct >= 80 ? 'success' : dPct >= 50 ? '' : 'warning'
                        }`}
                        style={{ width: `${Math.min(100, dPct)}%` }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', paddingTop: '0.2rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>{dPct}% Realized</span>
                      <button
                        onClick={() => {
                          setDeptFilter(dept.slice(0, 4));
                          navigateToPage('ledger', 'fee_ledger');
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 650, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
                      >
                        View Ledgers <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Management Toolbar */}
          <div className="asf-toolbar">
            <div className="asf-search-box">
              <Search size={15} className="asf-search-icon" />
              <input
                type="text"
                placeholder="Search student by name, registration ID, branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="asf-search-input"
              />
            </div>

            <div className="asf-filter-group">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="asf-select"
              >
                <option value="ALL">All Academic Streams</option>
                <option value="CSE">Computer Science</option>
                <option value="AIML">AI &amp; ML</option>
                <option value="ECE">Electronics</option>
                <option value="EEE">Electrical</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="asf-select"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="Cleared">Cleared (Zero Balance)</option>
                <option value="Pending">Pending Installments</option>
                <option value="Defaulter">Overdue Defaulters</option>
              </select>

              <button
                onClick={() => alert('Dispatched automated payment reminder notifications via campus SMS and student email portal.')}
                className="asf-btn-primary"
              >
                <Send size={13} /> Broadcast Dues Notice
              </button>
            </div>
          </div>

          {/* Management Student Directory Table */}
          <div className="asf-table-container">
            <table className="asf-table">
              <thead>
                <tr>
                  <th>Student &amp; Registration ID</th>
                  <th>Department &amp; Sem</th>
                  <th>Assessed Demand</th>
                  <th>Paid to Date</th>
                  <th>Outstanding Balance</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Management Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedgers.map(st => (
                  <tr key={st.studentId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{st.studentId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{st.department}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{st.semester}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{st.totalAssessed.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>
                      ₹{st.totalPaid.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 800 }}>
                      {st.outstandingBalance === 0 ? (
                        <span style={{ color: '#059669' }}>₹0.00</span>
                      ) : (
                        <span style={{ color: '#e11d48' }}>₹{st.outstandingBalance.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td>
                      <span className={`asf-badge ${st.outstandingBalance === 0 ? 'cleared' : 'partial'}`}>
                        {st.paymentStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedProfileStudent(st)}
                          className="asf-btn-secondary asf-btn-sm"
                          title="Open 360° student financial ledger"
                        >
                          <Eye size={12} /> 360° Dossier
                        </button>
                        {st.outstandingBalance > 0 && (
                          <button
                            onClick={() => {
                              setPaymentForm({
                                studentId: st.studentId,
                                studentName: st.name,
                                department: st.department,
                                semester: st.semester,
                                feeHead: 'Tuition & Development Fee',
                                amount: String(st.outstandingBalance),
                                mode: 'UPI (Google Pay / PhonePe)',
                                reference: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                                remarks: 'Counter payment generated from management console.'
                              });
                              navigateToPage('collection', 'fee_collection');
                            }}
                            className="asf-btn-primary asf-btn-emerald asf-btn-sm"
                          >
                            <CreditCard size={12} /> Collect
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: FEE STRUCTURE CONFIGURATION
          ========================================================================= */}
      {selectedSubtab === 'structure' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Action Bar */}
          <div className="asf-panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h4 className="asf-panel-title">
                  <Building2 size={18} color="#2563eb" />
                  Approved Academic Program Fee Tariffs (Session 2026–27)
                </h4>
                <p className="asf-panel-desc">
                  Statutory autonomous tuition schedules, lab dues, development funds, and residential boarding rates.
                </p>
              </div>
              <button
                onClick={() => setIsCreateStructureOpen(true)}
                className="asf-btn-primary"
              >
                <PlusCircle size={14} /> Add New Fee Structure
              </button>
            </div>
          </div>

          {/* Tariffs Grid */}
          <div className="asf-tariff-grid">
            {feeStructures.map(str => (
              <div key={str.id} className="asf-tariff-card">
                <div>
                  <div className="asf-tariff-top">
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                      {str.courseCode} · {str.id}
                    </span>
                    <span className="asf-badge cleared">
                      {str.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0.65rem 0 0.2rem 0' }}>
                    {str.program}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{str.semester}</span>

                  <div className="asf-tariff-breakdown" style={{ marginTop: '0.85rem' }}>
                    <div className="asf-tariff-row">
                      <span>Tuition Fee:</span>
                      <strong>₹{str.tuitionFee.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="asf-tariff-row">
                      <span>Development Fund:</span>
                      <strong>₹{str.developmentFee.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="asf-tariff-row">
                      <span>Lab &amp; Library Dues:</span>
                      <strong>₹{str.labLibraryFee.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="asf-tariff-row">
                      <span>Hostel &amp; Mess:</span>
                      <strong>₹{str.hostelMessFee.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                <div className="asf-tariff-totals">
                  <div>
                    <span style={{ fontSize: '0.69rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>
                      Day Scholar Base
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#2563eb', fontWeight: 800 }}>
                      ₹{str.totalBaseFee.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.69rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>
                      With Hostel &amp; Mess
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                      ₹{str.totalHostelFee.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 3: FEE COLLECTION COUNTER
          ========================================================================= */}
      {selectedSubtab === 'collection' && (
        <div className="asf-counter-grid">
          {/* Payment Form (2 cols) */}
          <div className="asf-panel">
            <div className="asf-panel-header">
              <div>
                <h4 className="asf-panel-title">
                  <Receipt size={18} color="#059669" />
                  Fee Payment Collection &amp; Official Receipt Counter
                </h4>
                <p className="asf-panel-desc">Record counter cash, online UPI, bank challan, or RTGS fee credits.</p>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="asf-form-2col">
                <div className="asf-form-group">
                  <label>Select Enrolled Student</label>
                  <select
                    value={paymentForm.studentId}
                    onChange={(e) => {
                      const sel = studentLedgers.find(s => s.studentId === e.target.value);
                      if (sel) {
                        setPaymentForm({
                          ...paymentForm,
                          studentId: sel.studentId,
                          studentName: sel.name,
                          department: sel.department,
                          semester: sel.semester,
                          amount: String(sel.outstandingBalance > 0 ? sel.outstandingBalance : 30000)
                        });
                      }
                    }}
                    className="asf-form-select"
                  >
                    {studentLedgers.map(s => (
                      <option key={s.studentId} value={s.studentId}>
                        {s.name} ({s.studentId} · Due: ₹{s.outstandingBalance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="asf-form-group">
                  <label>Fee Demand Head</label>
                  <select
                    value={paymentForm.feeHead}
                    onChange={(e) => setPaymentForm({ ...paymentForm, feeHead: e.target.value })}
                    className="asf-form-select"
                  >
                    <option value="Tuition & Development Fee">Tuition &amp; Development Fee</option>
                    <option value="Hostel & Residential Boarding Fee">Hostel &amp; Residential Boarding Fee</option>
                    <option value="Campus Transport Fleet Charge">Campus Transport Fleet Charge</option>
                    <option value="Autonomous Examination Evaluation Dues">Autonomous Examination Fee</option>
                    <option value="Laboratory Consumables & Library Dues">Lab &amp; Library Dues</option>
                  </select>
                </div>
              </div>

              <div className="asf-form-2col">
                <div className="asf-form-group">
                  <label>Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="asf-form-input"
                    style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}
                    required
                  />
                </div>

                <div className="asf-form-group">
                  <label>Payment Channel</label>
                  <select
                    value={paymentForm.mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                    className="asf-form-select"
                  >
                    <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Bank Demand Draft (DD)">Bank Demand Draft (DD)</option>
                    <option value="Online NetBanking / NEFT / RTGS">NetBanking / NEFT / RTGS</option>
                    <option value="Cash Deposit at Bursar Counter">Cash Deposit at Bursar Counter</option>
                    <option value="POS Debit / Credit Card">POS Debit / Credit Card Swipe</option>
                  </select>
                </div>
              </div>

              <div className="asf-form-2col">
                <div className="asf-form-group">
                  <label>Transaction Reference / UTR Number</label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="asf-form-input"
                    style={{ fontFamily: 'monospace' }}
                    required
                  />
                </div>

                <div className="asf-form-group">
                  <label>Cashier Note / Remarks</label>
                  <input
                    type="text"
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    className="asf-form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="asf-btn-primary asf-btn-emerald"
                  style={{ height: '2.5rem', padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
                >
                  <Printer size={15} /> Collect Payment &amp; Issue Official Receipt
                </button>
              </div>
            </form>
          </div>

          {/* Recent Counter Collections */}
          <div className="asf-panel">
            <div className="asf-panel-header">
              <h4 className="asf-panel-title">
                <Clock size={16} color="#2563eb" /> Recent Counter Receipts
              </h4>
              <span className="asf-badge approved">
                {transactions.length} LOGGED
              </span>
            </div>

            <div className="asf-recent-list">
              {transactions.slice(0, 8).map(txn => (
                <div key={txn.id} className="asf-recent-item">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem', display: 'block' }}>
                        {txn.studentName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {txn.studentId || txn.receiptNo}
                      </span>
                    </div>
                    <strong style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 800 }}>
                      +₹{txn.amount.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', paddingTop: '0.35rem', borderTop: '1px solid #e2e8f0' }}>
                    <span>{txn.mode}</span>
                    <button
                      onClick={() => setPrintableReceipt(txn)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}
                    >
                      <Printer size={12} /> Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 4: STUDENT FEE LEDGER (360° Directory)
          ========================================================================= */}
      {selectedSubtab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search & Filter Toolbar */}
          <div className="asf-toolbar">
            <div className="asf-search-box">
              <Search size={15} className="asf-search-icon" />
              <input
                type="text"
                placeholder="Search student name, registration ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="asf-search-input"
              />
            </div>

            <div className="asf-filter-group">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="asf-select"
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">Computer Science</option>
                <option value="AIML">AI &amp; ML</option>
                <option value="ECE">Electronics</option>
                <option value="EEE">Electrical</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="asf-select"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="Cleared">Cleared (Zero Balance)</option>
                <option value="Pending">Pending Installments</option>
                <option value="Defaulter">Overdue Defaulters</option>
              </select>

              <button
                onClick={handleExportFullLedgerCSV}
                className="asf-btn-secondary"
              >
                <Download size={13} /> Export Ledger CSV
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="asf-table-container">
            <table className="asf-table">
              <thead>
                <tr>
                  <th>Student &amp; ID</th>
                  <th>Department &amp; Sem</th>
                  <th>Assessed Fee</th>
                  <th>Scholarship / Aid</th>
                  <th>Paid to Date</th>
                  <th>Outstanding Balance</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedgers.map(st => (
                  <tr key={st.studentId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{st.studentId}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{st.department}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{st.semester}</div>
                    </td>

                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{st.totalAssessed.toLocaleString('en-IN')}
                    </td>

                    <td style={{ fontWeight: 600, color: '#059669' }}>
                      {st.concessions > 0 ? `-₹${st.concessions.toLocaleString('en-IN')}` : '—'}
                    </td>

                    <td style={{ fontWeight: 700, color: '#059669' }}>
                      ₹{st.totalPaid.toLocaleString('en-IN')}
                    </td>

                    <td style={{ fontWeight: 800 }}>
                      {st.outstandingBalance === 0 ? (
                        <span style={{ color: '#059669' }}>₹0 (Zero Due)</span>
                      ) : (
                        <span style={{ color: '#e11d48' }}>₹{st.outstandingBalance.toLocaleString('en-IN')}</span>
                      )}
                    </td>

                    <td>
                      <span className={`asf-badge ${st.outstandingBalance === 0 ? 'cleared' : 'partial'}`}>
                        {st.paymentStatus}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedProfileStudent(st)}
                        className="asf-btn-secondary asf-btn-sm"
                      >
                        <Eye size={12} /> 360° Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 5: OUTSTANDING DUES & DEFAULTERS
          ========================================================================= */}
      {selectedSubtab === 'outstanding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="asf-info-banner urgent">
            <div>
              <strong>Student Outstanding Arrears &amp; Defaulters Register</strong>
              <span>Enrolled candidates with overdue tuition, examination, or residential boarding arrears for Autumn Session 2026.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleExportDefaultersCSV}
                className="asf-btn-secondary asf-btn-sm"
              >
                <Download size={13} /> Export Defaulters CSV
              </button>
              <span className="asf-badge overdue" style={{ fontFamily: 'monospace' }}>
                {studentLedgers.filter(s => s.outstandingBalance > 0).length} CASES OVERDUE
              </span>
            </div>
          </div>

          <div className="asf-table-container">
            <table className="asf-table">
              <thead>
                <tr>
                  <th>Student &amp; Roll Number</th>
                  <th>Department</th>
                  <th>Total Assessed</th>
                  <th>Paid to Date</th>
                  <th>Outstanding Balance</th>
                  <th>Aging Bracket</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentLedgers.filter(s => s.outstandingBalance > 0).map(st => (
                  <tr key={st.studentId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{st.studentId}</div>
                    </td>

                    <td style={{ color: '#334155' }}>
                      {st.department} · {st.semester}
                    </td>

                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{st.totalAssessed.toLocaleString('en-IN')}
                    </td>

                    <td style={{ fontWeight: 700, color: '#059669' }}>
                      ₹{st.totalPaid.toLocaleString('en-IN')}
                    </td>

                    <td style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.85rem' }}>
                      ₹{st.outstandingBalance.toLocaleString('en-IN')}
                    </td>

                    <td>
                      <span className={`asf-badge ${st.outstandingBalance > 40000 ? 'overdue' : 'partial'}`}>
                        {st.outstandingBalance > 40000 ? '> 60 Days Overdue' : '1–30 Days Overdue'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setPaymentForm({
                            studentId: st.studentId,
                            studentName: st.name,
                            department: st.department,
                            semester: st.semester,
                            feeHead: 'Tuition & Development Fee Arrears',
                            amount: String(st.outstandingBalance),
                            mode: 'UPI (Google Pay / PhonePe)',
                            reference: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                            remarks: 'Arrears clearance at accounts counter.'
                          });
                          navigateToPage('collection', 'fee_collection');
                        }}
                        className="asf-btn-primary asf-btn-emerald asf-btn-sm"
                      >
                        <CreditCard size={12} /> Collect Dues
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 6: INSTALLMENT MANAGEMENT
          ========================================================================= */}
      {selectedSubtab === 'installments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="asf-info-banner">
            <div>
              <strong>Autonomous Fee Installment Scheme &amp; Tranche Matrix</strong>
              <span>Approved 3-Tranche Facility (Tranche 1: 40% at Enrollment, Tranche 2: 30% Mid-Semester due 15-Nov, Tranche 3: 30% Pre-Exam due 15-Dec).</span>
            </div>
            <span className="asf-badge approved" style={{ fontFamily: 'monospace' }}>
              3-TRANCHE POLICY
            </span>
          </div>

          <div className="asf-kpi-grid">
            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Installment Enrollees</span>
              <div className="asf-kpi-val">
                {studentLedgers.filter(s => s.paymentStatus.includes('Partial') || s.paymentStatus === 'Cleared').length}
              </div>
              <div className="asf-kpi-sub" style={{ color: '#059669', fontWeight: 600 }}>Approved for Tranche Pay</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Tranche 2 Realized</span>
              <div className="asf-kpi-val" style={{ color: '#2563eb' }}>82.4%</div>
              <div className="asf-kpi-sub">Target: ₹42.8 Lakh</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Upcoming Tranche 3 Due</span>
              <div className="asf-kpi-val">15-Dec-2026</div>
              <div className="asf-kpi-sub" style={{ color: '#2563eb', fontWeight: 600 }}>Pre-Exam Autonomous Dues</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Tranche Overdue Alerts</span>
              <div className="asf-kpi-val" style={{ color: '#e11d48' }}>
                {studentLedgers.filter(s => s.outstandingBalance > 0).length} Cases
              </div>
              <div className="asf-kpi-sub" style={{ color: '#e11d48', fontWeight: 600 }}>Follow-up notifications sent</div>
            </div>
          </div>

          <div className="asf-table-container">
            <table className="asf-table">
              <thead>
                <tr>
                  <th>Student &amp; Roll Number</th>
                  <th>Department &amp; Sem</th>
                  <th>Total Demand</th>
                  <th>Tranche 1 (40%)</th>
                  <th>Tranche 2 (30%)</th>
                  <th>Tranche 3 (30%)</th>
                  <th>Balance</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentLedgers.map(st => {
                  const t1 = Math.round(st.totalAssessed * 0.4);
                  const t2 = Math.round(st.totalAssessed * 0.3);
                  const t3 = st.totalAssessed - t1 - t2;
                  const t1Paid = st.totalPaid >= t1;
                  const t2Paid = st.totalPaid >= (t1 + t2);
                  const t3Paid = st.totalPaid >= st.totalAssessed;

                  return (
                    <tr key={st.studentId}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{st.studentId}</div>
                      </td>
                      <td style={{ color: '#334155' }}>
                        {st.department} · {st.semester}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        ₹{st.totalAssessed.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`asf-badge ${t1Paid ? 'cleared' : 'partial'}`}>
                          {t1Paid ? '✓ Paid' : `₹${t1.toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td>
                        <span className={`asf-badge ${t2Paid ? 'cleared' : 'partial'}`}>
                          {t2Paid ? '✓ Paid' : `Due ₹${t2.toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td>
                        <span className={`asf-badge ${t3Paid ? 'cleared' : 'neutral'}`}>
                          {t3Paid ? '✓ Paid' : `Sched ₹${t3.toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        {st.outstandingBalance === 0 ? (
                          <span style={{ color: '#059669' }}>₹0</span>
                        ) : (
                          <span style={{ color: '#e11d48' }}>₹{st.outstandingBalance.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedProfileStudent(st)}
                          className="asf-btn-secondary asf-btn-sm"
                        >
                          Schedule
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

      {/* =========================================================================
          PAGE 7: SCHOLARSHIPS & CONCESSIONS
          ========================================================================= */}
      {selectedSubtab === 'scholarships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="asf-info-banner">
            <div>
              <strong>Scholarships, Fee Concessions &amp; Financial Aid Ledgers</strong>
              <span>Institutional fee concessions directly adjust student fee assessment without recording cash outflow.</span>
            </div>
            <button
              onClick={() => setIsGrantScholarshipOpen(true)}
              className="asf-btn-primary"
            >
              <PlusCircle size={14} /> Grant Concession / Aid
            </button>
          </div>

          <div className="asf-kpi-grid">
            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Total Waivers Realized</span>
              <div className="asf-kpi-val" style={{ color: '#2563eb' }}>
                ₹{studentLedgers.reduce((s, st) => s + (st.concessions || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="asf-kpi-sub">Autonomous session 2026-27</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Beneficiary Students</span>
              <div className="asf-kpi-val">
                {studentLedgers.filter(s => (s.concessions || 0) > 0).length} Scholars
              </div>
              <div className="asf-kpi-sub" style={{ color: '#059669', fontWeight: 600 }}>Merit, EWS &amp; State Schemes</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Average Concession</span>
              <div className="asf-kpi-val">₹50,000</div>
              <div className="asf-kpi-sub">Per qualified scholar</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Endowment Balance</span>
              <div className="asf-kpi-val" style={{ color: '#059669' }}>₹45.0 Lakh</div>
              <div className="asf-kpi-sub" style={{ color: '#059669', fontWeight: 600 }}>Solvent &amp; Sanctioned</div>
            </div>
          </div>

          <div className="asf-table-container">
            <table className="asf-table">
              <thead>
                <tr>
                  <th>Student &amp; Roll Number</th>
                  <th>Department</th>
                  <th>Admission Category</th>
                  <th>Assessed Tariff</th>
                  <th>Scholarship / Waiver</th>
                  <th>Net Receivable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentLedgers.filter(s => (s.concessions || 0) > 0).map(st => (
                  <tr key={st.studentId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{st.studentId}</div>
                    </td>
                    <td style={{ color: '#334155' }}>
                      {st.department} · {st.course || 'B.Tech'}
                    </td>
                    <td style={{ color: '#475569', fontWeight: 500 }}>
                      {st.admissionCategory}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{st.totalAssessed.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 800, color: '#059669', fontSize: '0.85rem' }}>
                      -₹{st.concessions.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>
                      ₹{(st.totalAssessed - st.concessions).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="asf-badge approved">
                        Sanctioned &amp; Adjusted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 8: REFUND MANAGEMENT
          ========================================================================= */}
      {selectedSubtab === 'refunds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="asf-info-banner">
            <div>
              <strong>Student Refund &amp; Caution Money Disbursement Register</strong>
              <span>Authorized institutional refunds for admission cancellations, duplicate payments, and caution deposits.</span>
            </div>
            <span className="asf-badge approved" style={{ fontFamily: 'monospace' }}>
              TREASURY DISBURSEMENT
            </span>
          </div>

          <div className="asf-kpi-grid">
            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Total Claims Registered</span>
              <div className="asf-kpi-val">{refundRequests.length} Claims</div>
              <div className="asf-kpi-sub">Autonomous session 2026-27</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Pending Approval</span>
              <div className="asf-kpi-val" style={{ color: '#d97706' }}>
                {refundRequests.filter(r => r.status === 'Pending Approval').length} Claims
              </div>
              <div className="asf-kpi-sub" style={{ color: '#d97706', fontWeight: 600 }}>Requires Bursar sign-off</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Approved &amp; Ready</span>
              <div className="asf-kpi-val" style={{ color: '#2563eb' }}>
                {refundRequests.filter(r => r.status === 'Approved').length} Claims
              </div>
              <div className="asf-kpi-sub" style={{ color: '#2563eb', fontWeight: 600 }}>Awaiting treasury NEFT</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Settled to Date</span>
              <div className="asf-kpi-val" style={{ color: '#059669' }}>
                ₹{refundRequests.filter(r => r.status === 'Processed').reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}
              </div>
              <div className="asf-kpi-sub" style={{ color: '#059669', fontWeight: 600 }}>Disbursed via bank transfer</div>
            </div>
          </div>

          <div className="asf-table-container">
            <table className="asf-table">
              <thead>
                <tr>
                  <th>Claim ID &amp; Date</th>
                  <th>Student &amp; Department</th>
                  <th>Refund Reason</th>
                  <th>Original Receipt</th>
                  <th>Refund Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {refundRequests.map(ref => (
                  <tr key={ref.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ref.id}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{ref.requestDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ref.studentName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{ref.studentId} · {ref.department}</div>
                    </td>
                    <td style={{ color: '#334155', maxWidth: '16rem' }}>
                      {ref.reason}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.75rem' }}>
                      {ref.receiptRef}
                    </td>
                    <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                      ₹{ref.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: '#334155' }}>
                      {ref.method}
                    </td>
                    <td>
                      <span className={`asf-badge ${
                        ref.status === 'Processed' ? 'cleared' :
                        ref.status === 'Approved' ? 'approved' : 'partial'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {ref.status === 'Pending Approval' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleApproveRefund(ref.id)}
                            className="asf-btn-primary asf-btn-emerald asf-btn-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRefund(ref.id)}
                            className="asf-btn-danger asf-btn-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {ref.status === 'Approved' && (
                        <button
                          onClick={() => handleProcessRefund(ref)}
                          className="asf-btn-primary asf-btn-sm"
                        >
                          Process Payout
                        </button>
                      )}
                      {ref.status === 'Processed' && (
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 9: STUDENT FINANCIAL CLEARANCE (No-Dues Desk)
          ========================================================================= */}
      {selectedSubtab === 'clearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="asf-info-banner">
            <div>
              <strong>Autonomous Examination &amp; Degree Financial Clearance Console</strong>
              <span>Verification of complete tuition fee settlement prior to issuing Examination Admit Cards and Transcripts.</span>
            </div>
            <span className="asf-badge approved" style={{ fontFamily: 'monospace' }}>
              NO DUES DESK
            </span>
          </div>

          <div className="asf-kpi-grid">
            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Evaluated Candidates</span>
              <div className="asf-kpi-val">{studentLedgers.length}</div>
              <div className="asf-kpi-sub">Autonomous Term 2026-27</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Admit Cards Cleared</span>
              <div className="asf-kpi-val" style={{ color: '#059669' }}>{clearedCount}</div>
              <div className="asf-kpi-sub" style={{ color: '#059669', fontWeight: 600 }}>Zero Outstanding Dues</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Admit Cards on Hold</span>
              <div className="asf-kpi-val" style={{ color: '#e11d48' }}>{defaultersCount}</div>
              <div className="asf-kpi-sub" style={{ color: '#e11d48', fontWeight: 600 }}>Pending Arrears</div>
            </div>

            <div className="asf-kpi-card">
              <span className="asf-kpi-title">Clearance Rate</span>
              <div className="asf-kpi-val" style={{ color: '#2563eb' }}>
                {studentLedgers.length > 0 ? Math.round((clearedCount / studentLedgers.length) * 100) : 0}%
              </div>
              <div className="asf-kpi-sub" style={{ color: '#2563eb', fontWeight: 600 }}>Compliant candidates</div>
            </div>
          </div>

          <div className="asf-table-container">
            <table className="asf-table">
              <thead>
                <tr>
                  <th>Student Name &amp; ID</th>
                  <th>Department &amp; Sem</th>
                  <th>Balance Fee</th>
                  <th>Clearance Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentLedgers.map(st => (
                  <tr key={st.studentId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{st.studentId}</div>
                    </td>
                    <td style={{ color: '#334155' }}>
                      {st.department} · {st.semester}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {st.outstandingBalance === 0 ? (
                        <span style={{ color: '#059669' }}>₹0 (Zero Dues)</span>
                      ) : (
                        <span style={{ color: '#e11d48' }}>₹{st.outstandingBalance.toLocaleString('en-IN')} Due</span>
                      )}
                    </td>
                    <td>
                      <span className={`asf-badge ${st.outstandingBalance === 0 ? 'cleared' : 'overdue'}`}>
                        {st.clearanceStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {st.outstandingBalance === 0 ? (
                        <button
                          onClick={() => setIssuedCertificateStudent(st)}
                          className="asf-btn-primary asf-btn-sm"
                        >
                          <ShieldCheck size={13} /> Issue Certificate
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.72rem' }}>Hold (Arrears)</span>
                          <button
                            onClick={() => {
                              setPaymentForm({
                                studentId: st.studentId,
                                studentName: st.name,
                                department: st.department,
                                semester: st.semester,
                                feeHead: 'Pre-Exam Arrears Clearance',
                                amount: String(st.outstandingBalance),
                                mode: 'UPI (Google Pay / PhonePe)',
                                reference: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                                remarks: 'No-dues clearance payment.'
                              });
                              navigateToPage('collection', 'fee_collection');
                            }}
                            className="asf-btn-secondary asf-btn-sm"
                          >
                            Clear at Counter
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & DRAWERS (Preserved & Enhanced)
          ========================================================================= */}

      {/* Modal: Official No-Dues Certificate */}
      {issuedCertificateStudent && (
        <div className="asf-modal-overlay">
          <div className="asf-modal-card" style={{ maxWidth: '34rem' }}>
            <div className="asf-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#60a5fa" />
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Official Financial No-Dues Certificate</span>
              </div>
              <button
                onClick={() => setIssuedCertificateStudent(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', margin: 0 }}>
                  APNA CAMPUS AUTONOMOUS COLLEGE OF ENGINEERING &amp; TECHNOLOGY
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0' }}>
                  Office of the Bursar &amp; Finance Directorate · Statutory Audit Cleared
                </p>
                <div style={{ marginTop: '0.35rem', fontWeight: 700, fontSize: '0.78rem', color: '#2563eb', letterSpacing: '0.04em' }}>
                  OFFICIAL INSTITUTIONAL NO-DUES CLEARANCE SLIP
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '0.55rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Candidate Name:</span>
                  <strong style={{ color: '#0f172a' }}>{issuedCertificateStudent.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Registration Number:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{issuedCertificateStudent.studentId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Academic Branch &amp; Term:</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>{issuedCertificateStudent.department} · {issuedCertificateStudent.semester}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Assessed Tariff:</span>
                  <span style={{ fontWeight: 600 }}>₹{issuedCertificateStudent.totalAssessed.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Net Paid &amp; Verified:</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>₹{issuedCertificateStudent.totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Outstanding Arrears:</span>
                  <strong style={{ color: '#059669', fontWeight: 800 }}>₹0.00 (Zero Dues Cleared)</strong>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.55rem', color: '#065f46', fontSize: '0.75rem', lineHeight: 1.5 }}>
                ✓ Certified that the above student holds zero outstanding financial dues across Tuition, Lab, Hostel, and Autonomous Examination heads. Eligible for Autonomous Examination Admit Card &amp; Degree Transcript issuance.
              </div>

              <div style={{ paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.72rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block', fontFamily: 'monospace' }}>Date: {new Date().toLocaleDateString('en-IN')}</span>
                  <span style={{ color: '#64748b', display: 'block' }}>Certificate Ref: NODUES-2026-{issuedCertificateStudent.studentId.slice(-4)}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontStyle: 'italic', color: '#0f172a', fontWeight: 700 }}>Mr. S. K. Roy</div>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '2px', fontWeight: 700, color: '#334155', fontSize: '0.69rem' }}>
                    Authorized Accounts Officer
                  </div>
                </div>
              </div>
            </div>

            <div className="asf-modal-footer no-print">
              <button
                onClick={() => setIssuedCertificateStudent(null)}
                className="asf-btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="asf-btn-primary"
              >
                <Printer size={13} /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Scholarship / Concession Modal */}
      {isGrantScholarshipOpen && (
        <div className="asf-modal-overlay">
          <div className="asf-modal-card">
            <div className="asf-modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} color="#fbbf24" />
                Sanction Student Fee Concession
              </h3>
              <button onClick={() => setIsGrantScholarshipOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGrantScholarshipSubmit} className="asf-modal-body">
              <div className="asf-form-group">
                <label>Target Student</label>
                <select
                  value={scholarshipForm.studentId}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, studentId: e.target.value })}
                  className="asf-form-select"
                >
                  {studentLedgers.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name} ({s.studentId}) · Balance: ₹{s.outstandingBalance.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="asf-form-group">
                <label>Scholarship / Concession Scheme</label>
                <select
                  value={scholarshipForm.schemeName}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, schemeName: e.target.value })}
                  className="asf-form-select"
                >
                  <option value="Autonomous Merit-Cum-Means Scholarship">Autonomous Merit-Cum-Means Scholarship</option>
                  <option value="Dean's Honors Academic Excellence Award">Dean's Honors Academic Excellence Award (25% Tuition)</option>
                  <option value="Institutional Sports & Athletic Quota Waiver">Institutional Sports & Athletic Quota Waiver (50% Concession)</option>
                  <option value="EWS Need-Based Institutional Aid">EWS Need-Based Institutional Aid (Full Tuition Waiver)</option>
                  <option value="Institutional Staff Dependent Concession">Institutional Staff Dependent Concession (30% Relief)</option>
                </select>
              </div>

              <div className="asf-form-2col">
                <div className="asf-form-group">
                  <label>Sanctioned Amount (₹)</label>
                  <input
                    type="number"
                    value={scholarshipForm.amount}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                    className="asf-form-input"
                    style={{ fontWeight: 700, color: '#d97706' }}
                    required
                  />
                </div>
                <div className="asf-form-group">
                  <label>Funding Source</label>
                  <input
                    type="text"
                    value={scholarshipForm.fundingSource}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, fundingSource: e.target.value })}
                    className="asf-form-input"
                    required
                  />
                </div>
              </div>

              <div className="asf-form-group">
                <label>Board of Governors Approval Ref</label>
                <input
                  type="text"
                  value={scholarshipForm.approvalRef}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, approvalRef: e.target.value })}
                  className="asf-form-input"
                  style={{ fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div className="asf-modal-footer" style={{ margin: '0.5rem -1.25rem -1.25rem -1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsGrantScholarshipOpen(false)}
                  className="asf-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="asf-btn-primary"
                >
                  Apply Concession to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 360° Student Financial Profile Modal */}
      {selectedProfileStudent && (
        <div className="asf-modal-overlay">
          <div className="asf-modal-card" style={{ maxWidth: '40rem' }}>
            <div className="asf-modal-header">
              <div>
                <span style={{ fontSize: '0.69rem', fontFamily: 'monospace', fontWeight: 700, color: '#93c5fd', display: 'block', textTransform: 'uppercase' }}>
                  360° Student Financial Dossier
                </span>
                <h3 style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff', margin: '0.15rem 0 0 0' }}>
                  {selectedProfileStudent.name} ({selectedProfileStudent.studentId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedProfileStudent(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="asf-modal-body">
              <div className="asf-form-2col">
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.55rem', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.69rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Department &amp; Program</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>{selectedProfileStudent.department} ({selectedProfileStudent.course || 'B.Tech'})</strong>
                </div>
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.55rem', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.69rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Admission Category</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>{selectedProfileStudent.admissionCategory || 'General Merit'}</strong>
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>Fee Assessment &amp; Balance Summary:</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Total Assessed Tariff:</span>
                  <strong style={{ color: '#0f172a' }}>₹{selectedProfileStudent.totalAssessed.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Approved Scholarships &amp; Waivers:</span>
                  <strong style={{ color: '#059669' }}>-₹{(selectedProfileStudent.concessions || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Paid to Date (Verified Credits):</span>
                  <strong style={{ color: '#059669' }}>₹{selectedProfileStudent.totalPaid.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.15rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Outstanding Balance:</span>
                  <strong style={{ color: '#e11d48', fontWeight: 800 }}>₹{selectedProfileStudent.outstandingBalance.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.55rem', color: '#1e40af', fontSize: '0.75rem' }}>
                <strong>Latest Receipt:</strong> {selectedProfileStudent.receiptNo || 'None'} on {selectedProfileStudent.lastPaymentDate || 'N/A'}
              </div>
            </div>

            <div className="asf-modal-footer">
              <button
                onClick={() => setSelectedProfileStudent(null)}
                className="asf-btn-secondary"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Generator Modal */}
      {printableReceipt && (
        <div className="asf-modal-overlay">
          <div className="asf-modal-card" style={{ maxWidth: '32rem' }}>
            <div className="asf-modal-header no-print">
              <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1' }}>
                Official Institutional Fee Receipt
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  onClick={handlePrint}
                  className="asf-btn-primary asf-btn-sm"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => setPrintableReceipt(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div style={{ padding: '1.5rem', background: '#ffffff', color: '#0f172a', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.78rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', margin: 0 }}>
                  APNA CAMPUS AUTONOMOUS ENGINEERING COLLEGE
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0' }}>
                  Directorate of Finance &amp; Accounts · Central Accounts Counter
                </p>
                <div style={{ marginTop: '0.35rem', fontWeight: 700, fontSize: '0.78rem', color: '#2563eb', letterSpacing: '0.04em' }}>
                  STUDENT FEE PAYMENT RECEIPT (AUTONOMOUS DEMAND)
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div>
                  <strong>Receipt No:</strong> {printableReceipt.receiptNo}
                </div>
                <div>
                  <strong>Date:</strong> {printableReceipt.date}
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '0.55rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Student Name:</span>
                  <strong>{printableReceipt.studentName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Registration ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{printableReceipt.studentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Department:</span>
                  <span>{printableReceipt.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Fee Head:</span>
                  <span>{printableReceipt.feeHead}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Mode:</span>
                  <span>{printableReceipt.mode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Transaction Reference:</span>
                  <span style={{ fontFamily: 'monospace' }}>{printableReceipt.reference}</span>
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: '0.55rem', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46' }}>Amount Received:</span>
                <strong style={{ color: '#065f46', fontSize: '1.05rem', fontWeight: 800 }}>
                  ₹{printableReceipt.amount.toLocaleString('en-IN')}.00
                </strong>
              </div>

              <div style={{ paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.72rem' }}>
                <div>
                  <div style={{ height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '0.69rem', color: '#94a3b8' }}>
                    [SBI/HDFC Treasury Stamp]
                  </div>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '2px', textAlign: 'center', fontSize: '0.69rem', color: '#64748b' }}>
                    System Generated Receipt
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#0f172a', fontWeight: 700 }}>
                    Mr. S. K. Roy
                  </div>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '2px', textAlign: 'center', fontWeight: 700, color: '#334155', fontSize: '0.69rem' }}>
                    Authorized Accounts Officer
                  </div>
                </div>
              </div>
            </div>

            <div className="asf-modal-footer no-print">
              <button
                onClick={() => setPrintableReceipt(null)}
                className="asf-btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="asf-btn-primary asf-btn-emerald"
              >
                <Printer size={13} /> Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {isCreateStructureOpen && (
        <div className="asf-modal-overlay">
          <div className="asf-modal-card">
            <div className="asf-modal-header">
              <h3 style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={16} color="#60a5fa" />
                Configure Program Fee Tariff
              </h3>
              <button onClick={() => setIsCreateStructureOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="asf-modal-body">
              <div className="asf-form-group">
                <label>Program / Degree Title</label>
                <input
                  type="text"
                  value={structureForm.program}
                  onChange={(e) => setStructureForm({ ...structureForm, program: e.target.value })}
                  className="asf-form-input"
                  required
                />
              </div>

              <div className="asf-form-2col">
                <div className="asf-form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={structureForm.courseCode}
                    onChange={(e) => setStructureForm({ ...structureForm, courseCode: e.target.value })}
                    className="asf-form-input"
                    required
                  />
                </div>
                <div className="asf-form-group">
                  <label>Academic Session</label>
                  <input
                    type="text"
                    value={structureForm.academicYear}
                    onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                    className="asf-form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="asf-form-group">
                  <label>Tuition (₹)</label>
                  <input
                    type="number"
                    value={structureForm.tuitionFee}
                    onChange={(e) => setStructureForm({ ...structureForm, tuitionFee: e.target.value })}
                    className="asf-form-input"
                    required
                  />
                </div>
                <div className="asf-form-group">
                  <label>Development (₹)</label>
                  <input
                    type="number"
                    value={structureForm.developmentFee}
                    onChange={(e) => setStructureForm({ ...structureForm, developmentFee: e.target.value })}
                    className="asf-form-input"
                    required
                  />
                </div>
                <div className="asf-form-group">
                  <label>Lab/Library (₹)</label>
                  <input
                    type="number"
                    value={structureForm.labLibraryFee}
                    onChange={(e) => setStructureForm({ ...structureForm, labLibraryFee: e.target.value })}
                    className="asf-form-input"
                    required
                  />
                </div>
              </div>

              <div className="asf-form-2col">
                <div className="asf-form-group">
                  <label>Exam Fee (₹)</label>
                  <input
                    type="number"
                    value={structureForm.examinationFee}
                    onChange={(e) => setStructureForm({ ...structureForm, examinationFee: e.target.value })}
                    className="asf-form-input"
                    required
                  />
                </div>
                <div className="asf-form-group">
                  <label>Hostel &amp; Mess (₹)</label>
                  <input
                    type="number"
                    value={structureForm.hostelMessFee}
                    onChange={(e) => setStructureForm({ ...structureForm, hostelMessFee: e.target.value })}
                    className="asf-form-input"
                  />
                </div>
              </div>

              <div className="asf-modal-footer" style={{ margin: '0.5rem -1.25rem -1.25rem -1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateStructureOpen(false)}
                  className="asf-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="asf-btn-primary"
                >
                  Save Fee Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
