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
  DollarSign
} from 'lucide-react';

export default function AccountsStudentFinanceTab({
  feeStructures,
  studentLedgers,
  transactions,
  onUpdateFeeStructures,
  onUpdateStudentLedgers,
  onUpdateTransactions,
  onAddAuditLog,
  initialSubtab = 'ledger'
}) {
  const [selectedSubtab, setSelectedSubtab] = useState(initialSubtab);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (initialSubtab) {
      setSelectedSubtab(initialSubtab);
    }
  }, [initialSubtab]);

  // Selected Student for 360° Financial Profile
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);

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

    // Update transactions list
    onUpdateTransactions([newTxn, ...transactions]);

    // Recalculate student ledger outstanding balance
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

    onAddAuditLog({
      actionType: 'FEE_PAYMENT_RECORDED',
      target: `${receiptNo} (${paymentForm.studentName} - ₹${payAmt})`,
      details: `Mode: ${paymentForm.mode}, Ref: ${paymentForm.reference}. Balance updated.`
    });

    // Display receipt immediately
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
    <div className="accounts-module-wrap">
      {/* Subtab Navigation Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedSubtab('ledger')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'ledger' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Student Fee Ledgers ({studentLedgers.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('collection')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'collection' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Fee Collection Counter
          </button>
          <button
            onClick={() => setSelectedSubtab('structure')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'structure' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Fee Structures ({feeStructures.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('outstanding')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'outstanding' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Outstanding Dues
          </button>
          <button
            onClick={() => setSelectedSubtab('installments')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'installments' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Installment Plans
          </button>
          <button
            onClick={() => setSelectedSubtab('scholarships')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'scholarships' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Scholarships &amp; Waivers
          </button>
          <button
            onClick={() => setSelectedSubtab('refunds')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'refunds' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Refunds ({refundRequests.filter(r => r.status === 'Pending Approval').length})
          </button>
          <button
            onClick={() => setSelectedSubtab('clearance')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'clearance' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            No-Dues Clearance
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedSubtab === 'outstanding' && (
            <button
              onClick={handleExportDefaultersCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} /> Export Defaulters CSV
            </button>
          )}
          {selectedSubtab === 'structure' && (
            <button
              onClick={() => setIsCreateStructureOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle size={14} /> Add Fee Structure
            </button>
          )}
          {selectedSubtab === 'scholarships' && (
            <button
              onClick={() => setIsGrantScholarshipOpen(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle size={14} /> Grant Concession / Aid
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Student Fee Ledgers */}
      {selectedSubtab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student name, registration ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
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
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="Cleared">Cleared (Zero Balance)</option>
                <option value="Pending">Pending Installments</option>
                <option value="Defaulter">Overdue Defaulters</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student &amp; ID</th>
                  <th className="py-3 px-4">Department &amp; Sem</th>
                  <th className="py-3 px-4">Assessed Fee</th>
                  <th className="py-3 px-4">Scholarship / Aid</th>
                  <th className="py-3 px-4">Paid to Date</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedgers.map(st => (
                  <tr key={st.studentId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{st.studentId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{st.department}</div>
                      <div className="text-[10px] text-slate-400">{st.semester} · {st.residenceType}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ₹{st.totalAssessed.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-teal-700">
                      {st.concessions > 0 ? `-₹${st.concessions.toLocaleString('en-IN')}` : '₹0'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{st.totalPaid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-extrabold text-sm ${st.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        ₹{st.outstandingBalance.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        st.outstandingBalance === 0 ? 'bg-emerald-100 text-emerald-800' :
                        st.outstandingBalance > 40000 ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {st.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedProfileStudent(st)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold rounded-md transition text-xs flex items-center gap-1 ml-auto"
                      >
                        <Eye size={13} /> Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Fee Collection Counter */}
      {selectedSubtab === 'collection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Payment Form (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt size={16} className="text-emerald-600" />
                Fee Payment Collection &amp; Receipt Generator Counter
              </h4>
              <p className="text-slate-500">Record counter cash, online UPI, bank challan, or RTGS fee credits.</p>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Student</label>
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
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500"
                  >
                    {studentLedgers.map(s => (
                      <option key={s.studentId} value={s.studentId}>
                        {s.name} ({s.studentId} · Due: ₹{s.outstandingBalance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fee Demand Head</label>
                  <select
                    value={paymentForm.feeHead}
                    onChange={(e) => setPaymentForm({ ...paymentForm, feeHead: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="Tuition & Development Fee">Tuition &amp; Development Fee</option>
                    <option value="Hostel & Residential Boarding Fee">Hostel &amp; Residential Boarding Fee</option>
                    <option value="Campus Transport Fleet Charge">Campus Transport Fleet Charge</option>
                    <option value="Autonomous Examination Evaluation Dues">Autonomous Examination Fee</option>
                    <option value="Laboratory Consumables & Library Dues">Lab &amp; Library Dues</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-bold text-sm text-slate-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Mode</label>
                  <select
                    value={paymentForm.mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="UPI (Google Pay / PhonePe)">UPI (QR Scan / PhonePe / GPay)</option>
                    <option value="Net Banking (SBI / HDFC)">Online Net Banking</option>
                    <option value="Bank Challan (SBI Treasury)">Bank Challan (SBI)</option>
                    <option value="Accounts Counter Cash">Accounts Counter Cash</option>
                    <option value="Debit / Credit Card (POS)">Debit / Credit Card (POS)</option>
                    <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transaction Reference / UTR Number</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Accounts Counter Remarks</label>
                <textarea
                  rows="2"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Collect Fee &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>

          {/* Quick Guidelines Panel (1 col) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Autonomous Fee Policy Guidelines</h4>
            <ul className="space-y-2 text-slate-600 leading-relaxed list-disc pl-4">
              <li>Receipts are generated immediately with distinct numbering and cryptographic verification tags.</li>
              <li>Partial payments automatically decrement the student ledger balance.</li>
              <li>Scholarship waivers adjust tuition demand directly without cash outflow.</li>
              <li>All payments are credited directly into institutional treasury accounts (SBI/HDFC).</li>
            </ul>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 mt-4">
              <strong>Bursar Desk Contact:</strong> Ext 104 · Room 104 Admin Block for disputed transactions.
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Fee Structures & Program Tariffs */}
      {selectedSubtab === 'structure' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Approved Program Fee Tariffs (Academic Session 2026–27)</h4>
              <p className="text-xs text-slate-500">Autonomous syllabus, laboratory, development, and residential boarding rates.</p>
            </div>
            <button
              onClick={() => setIsCreateStructureOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle size={14} /> Add Tariff
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map(str => (
              <div key={str.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {str.courseCode} · {str.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {str.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{str.program}</h4>
                  <span className="text-xs text-slate-500">{str.semester}</span>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tuition Fee:</span>
                      <strong className="text-slate-800">₹{str.tuitionFee.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Development Fund:</span>
                      <strong className="text-slate-800">₹{str.developmentFee.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lab &amp; Library Dues:</span>
                      <strong className="text-slate-800">₹{str.labLibraryFee.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hostel &amp; Mess:</span>
                      <strong className="text-slate-800">₹{str.hostelMessFee.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Base (Day Scholar)</span>
                    <strong className="text-blue-700 font-extrabold text-sm">₹{str.totalBaseFee.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">With Hostel</span>
                    <strong className="text-slate-900 font-extrabold text-sm">₹{str.totalHostelFee.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Outstanding Dues & Defaulters */}
      {selectedSubtab === 'outstanding' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Student Outstanding Dues &amp; Aging Ledger</span>
              <p>
                Enrolled students with overdue tuition, examination, or hostel boarding arrears for Autumn Session 2026.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
              ARREARS ACTIVE
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student &amp; Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Total Assessed</th>
                  <th className="py-3 px-4">Paid to Date</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">Aging Bracket</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentLedgers.filter(s => s.outstandingBalance > 0).map(st => (
                  <tr key={st.studentId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{st.studentId}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {st.department} · {st.semester}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ₹{st.totalAssessed.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{st.totalPaid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-rose-600 text-sm">
                      ₹{st.outstandingBalance.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        st.outstandingBalance > 40000 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {st.outstandingBalance > 40000 ? '> 60 Days Overdue' : '1–30 Days Overdue'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
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
                          setSelectedSubtab('collection');
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                      >
                        Collect Dues
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 5: Financial No-Dues Clearance */}
      {selectedSubtab === 'clearance' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-900 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Autonomous Examination &amp; Degree Financial Clearance Console</span>
              <p>
                Verification of complete tuition fee settlement prior to issuing Autonomous Examination Admit Cards and Final Transcripts.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
              NO DUES DESK
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student Name &amp; ID</th>
                  <th className="py-3 px-4">Department &amp; Sem</th>
                  <th className="py-3 px-4">Balance Fee</th>
                  <th className="py-3 px-4">Clearance Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentLedgers.map(st => (
                  <tr key={st.studentId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{st.name} ({st.studentId})</td>
                    <td className="py-3.5 px-4 text-slate-700">{st.department} · {st.semester}</td>
                    <td className="py-3.5 px-4 font-bold">
                      {st.outstandingBalance === 0 ? (
                        <span className="text-emerald-700">₹0 (Zero Dues)</span>
                      ) : (
                        <span className="text-rose-600">₹{st.outstandingBalance.toLocaleString('en-IN')} Due</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        st.outstandingBalance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {st.clearanceStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {st.outstandingBalance === 0 ? (
                        <button
                          onClick={() => alert(`Official No-Dues Certificate issued for ${st.name} (${st.studentId}). Admit card released.`)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded text-[11px]"
                        >
                          Issue Certificate
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Hold (Arrears)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 6: Installment Plans & Management */}
      {selectedSubtab === 'installments' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-950 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Autonomous Fee Installment Scheme &amp; Tranche Matrix</span>
              <p className="text-indigo-800">
                Approved 3-Tranche Installment Facility (Tranche 1: 40% at Enrollment, Tranche 2: 30% Mid-Semester Due 15-Nov, Tranche 3: 30% Pre-Exam Due 15-Dec).
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
              3-TRANCHE POLICY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Installment Enrollees</span>
              <strong className="text-lg font-black text-slate-900 mt-1 block">
                {studentLedgers.filter(s => s.paymentStatus.includes('Partial') || s.paymentStatus === 'Cleared').length} Students
              </strong>
              <span className="text-[10px] text-emerald-600 font-bold">Approved for Tranche Pay</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Tranche 2 Realized</span>
              <strong className="text-lg font-black text-indigo-700 mt-1 block">82.4%</strong>
              <span className="text-[10px] text-slate-500">Target: ₹42.8 Lakh</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Upcoming Tranche 3 Due</span>
              <strong className="text-lg font-black text-slate-900 mt-1 block">15-Dec-2026</strong>
              <span className="text-[10px] text-blue-600 font-semibold">Pre-Exam Autonomous Dues</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Tranche Overdue Alerts</span>
              <strong className="text-lg font-black text-rose-600 mt-1 block">
                {studentLedgers.filter(s => s.outstandingBalance > 0).length} Cases
              </strong>
              <span className="text-[10px] text-rose-600 font-semibold">Follow-up notifications sent</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student &amp; Roll Number</th>
                  <th className="py-3 px-4">Department &amp; Sem</th>
                  <th className="py-3 px-4">Total Demand</th>
                  <th className="py-3 px-4">Tranche 1 (40%)</th>
                  <th className="py-3 px-4">Tranche 2 (30%)</th>
                  <th className="py-3 px-4">Tranche 3 (30%)</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentLedgers.map(st => {
                  const t1 = Math.round(st.totalAssessed * 0.4);
                  const t2 = Math.round(st.totalAssessed * 0.3);
                  const t3 = st.totalAssessed - t1 - t2;
                  const t1Paid = st.totalPaid >= t1;
                  const t2Paid = st.totalPaid >= (t1 + t2);
                  const t3Paid = st.totalPaid >= st.totalAssessed;

                  return (
                    <tr key={st.studentId} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{st.studentId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {st.department} · {st.semester}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{st.totalAssessed.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t1Paid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {t1Paid ? 'Paid (₹' + t1.toLocaleString('en-IN') + ')' : 'Due ₹' + t1.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t2Paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {t2Paid ? 'Paid (₹' + t2.toLocaleString('en-IN') + ')' : 'Due ₹' + t2.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t3Paid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {t3Paid ? 'Paid (₹' + t3.toLocaleString('en-IN') + ')' : 'Due 15-Dec'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-xs">
                        {st.outstandingBalance === 0 ? (
                          <span className="text-emerald-700">₹0 Cleared</span>
                        ) : (
                          <span className="text-rose-600">₹{st.outstandingBalance.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {st.outstandingBalance > 0 && (
                          <button
                            onClick={() => {
                              setPaymentForm({
                                studentId: st.studentId,
                                studentName: st.name,
                                department: st.department,
                                semester: st.semester,
                                feeHead: 'Installment Tranche Payment',
                                amount: String(Math.min(st.outstandingBalance, 30000)),
                                mode: 'UPI (Google Pay / PhonePe)',
                                reference: `INST/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                                remarks: 'Installment payment realization at accounts counter.'
                              });
                              setSelectedSubtab('collection');
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-[11px]"
                          >
                            Collect Tranche
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 7: Scholarships & Concessions */}
      {selectedSubtab === 'scholarships' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-950 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Scholarships, Fee Concessions &amp; Financial Aid Ledgers</span>
              <p className="text-amber-800">
                Institutional fee concessions directly adjust student fee assessment without recording cash outflow. All awards require Board of Governors authorization.
              </p>
            </div>
            <button
              onClick={() => setIsGrantScholarshipOpen(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle size={14} /> Grant Concession / Aid
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Total Waivers Realized</span>
              <strong className="text-lg font-black text-amber-700 mt-1 block">
                ₹{studentLedgers.reduce((s, st) => s + (st.concessions || 0), 0).toLocaleString('en-IN')}
              </strong>
              <span className="text-[10px] text-slate-500">Autonomous session 2026-27</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Beneficiary Students</span>
              <strong className="text-lg font-black text-slate-900 mt-1 block">
                {studentLedgers.filter(s => (s.concessions || 0) > 0).length} Scholars
              </strong>
              <span className="text-[10px] text-emerald-600 font-bold">Merit, EWS &amp; State Schemes</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Average Concession</span>
              <strong className="text-lg font-black text-slate-900 mt-1 block">₹50,000</strong>
              <span className="text-[10px] text-slate-500">Per qualified scholar</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Endowment Balance</span>
              <strong className="text-lg font-black text-blue-700 mt-1 block">₹45.0 Lakh</strong>
              <span className="text-[10px] text-emerald-600 font-semibold">Solvent &amp; Sanctioned</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student &amp; Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Admission Category</th>
                  <th className="py-3 px-4">Assessed Tariff</th>
                  <th className="py-3 px-4">Scholarship / Waiver</th>
                  <th className="py-3 px-4">Net Receivable</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentLedgers.filter(s => (s.concessions || 0) > 0).map(st => (
                  <tr key={st.studentId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{st.studentId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {st.department} · {st.course}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {st.admissionCategory}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{st.totalAssessed.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-700 text-sm">
                      -₹{st.concessions.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-800">
                      ₹{(st.totalAssessed - st.concessions).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
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

      {/* Subtab 8: Refund Management */}
      {selectedSubtab === 'refunds' && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-teal-950 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Student Refund &amp; Caution Money Disbursement Register</span>
              <p className="text-teal-800">
                Authorized institutional refunds for admission cancellations, duplicate payment adjustments, and graduated student caution deposits.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded">
              TREASURY DISBURSEMENT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Total Claims Registered</span>
              <strong className="text-lg font-black text-slate-900 mt-1 block">{refundRequests.length} Claims</strong>
              <span className="text-[10px] text-slate-500">Autonomous session 2026-27</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Pending Approval</span>
              <strong className="text-lg font-black text-amber-600 mt-1 block">
                {refundRequests.filter(r => r.status === 'Pending Approval').length} Claims
              </strong>
              <span className="text-[10px] text-amber-700 font-semibold">Requires Bursar sign-off</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Approved &amp; Ready</span>
              <strong className="text-lg font-black text-blue-600 mt-1 block">
                {refundRequests.filter(r => r.status === 'Approved').length} Claims
              </strong>
              <span className="text-[10px] text-blue-700 font-semibold">Awaiting treasury NEFT</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">Settled to Date</span>
              <strong className="text-lg font-black text-emerald-600 mt-1 block">
                ₹{refundRequests.filter(r => r.status === 'Processed').reduce((s, r) => s + r.amount, 0).toLocaleString('en-IN')}
              </strong>
              <span className="text-[10px] text-emerald-700 font-semibold">Disbursed via bank transfer</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Claim ID &amp; Date</th>
                  <th className="py-3 px-4">Student &amp; Department</th>
                  <th className="py-3 px-4">Refund Reason</th>
                  <th className="py-3 px-4">Original Receipt</th>
                  <th className="py-3 px-4">Refund Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refundRequests.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ref.id}</div>
                      <div className="text-[10px] text-slate-500">{ref.requestDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ref.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ref.studentId} · {ref.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                      {ref.reason}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {ref.receiptRef}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                      ₹{ref.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {ref.method}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        ref.status === 'Processed' ? 'bg-emerald-100 text-emerald-800' :
                        ref.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ref.status === 'Pending Approval' && (
                        <button
                          onClick={() => handleApproveRefund(ref.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-[11px]"
                        >
                          Approve
                        </button>
                      )}
                      {ref.status === 'Approved' && (
                        <button
                          onClick={() => handleProcessRefund(ref)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                        >
                          Process Payout
                        </button>
                      )}
                      {ref.status === 'Processed' && (
                        <span className="text-emerald-700 font-bold text-[11px]">✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grant Scholarship / Concession Modal */}
      {isGrantScholarshipOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                Sanction Student Fee Concession
              </h3>
              <button onClick={() => setIsGrantScholarshipOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGrantScholarshipSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Student</label>
                <select
                  value={scholarshipForm.studentId}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, studentId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                >
                  {studentLedgers.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name} ({s.studentId}) · Balance: ₹{s.outstandingBalance.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scholarship / Concession Scheme</label>
                <select
                  value={scholarshipForm.schemeName}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, schemeName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                >
                  <option value="Autonomous Merit-Cum-Means Scholarship">Autonomous Merit-Cum-Means Scholarship</option>
                  <option value="Dean's Honors Academic Excellence Award">Dean's Honors Academic Excellence Award (25% Tuition)</option>
                  <option value="Institutional Sports & Athletic Quota Waiver">Institutional Sports & Athletic Quota Waiver (50% Concession)</option>
                  <option value="EWS Need-Based Institutional Aid">EWS Need-Based Institutional Aid (Full Tuition Waiver)</option>
                  <option value="Institutional Staff Dependent Concession">Institutional Staff Dependent Concession (30% Relief)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sanctioned Amount (₹)</label>
                  <input
                    type="number"
                    value={scholarshipForm.amount}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none font-bold text-amber-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Funding Source</label>
                  <input
                    type="text"
                    value={scholarshipForm.fundingSource}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, fundingSource: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Board of Governors Approval Ref</label>
                <input
                  type="text"
                  value={scholarshipForm.approvalRef}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, approvalRef: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsGrantScholarshipOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-300 block">
                  360° STUDENT FINANCIAL DOSSIER
                </span>
                <h3 className="font-bold text-sm text-white">
                  {selectedProfileStudent.name} ({selectedProfileStudent.studentId})
                </h3>
              </div>
              <button
                onClick={() => setSelectedProfileStudent(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department &amp; Program</span>
                  <strong className="text-slate-800">{selectedProfileStudent.department} ({selectedProfileStudent.course})</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Admission Category</span>
                  <strong className="text-slate-800">{selectedProfileStudent.admissionCategory}</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-800 block">Fee Assessment &amp; Balance Summary:</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Assessed Tariff:</span>
                  <strong className="text-slate-900">₹{selectedProfileStudent.totalAssessed.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Approved Scholarships &amp; Waivers:</span>
                  <strong className="text-teal-700">-₹{selectedProfileStudent.concessions.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Paid to Date (Verified Credits):</span>
                  <strong className="text-emerald-700">₹{selectedProfileStudent.totalPaid.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="font-bold text-slate-800">Outstanding Balance:</span>
                  <strong className="text-rose-600">₹{selectedProfileStudent.outstandingBalance.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-blue-900">
                <strong>Latest Receipt:</strong> {selectedProfileStudent.receiptNo} on {selectedProfileStudent.lastPaymentDate}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProfileStudent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Generator Modal */}
      {printableReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Official Institutional Fee Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded flex items-center gap-1"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => setPrintableReceipt(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 text-slate-900 bg-white overflow-y-auto space-y-4 text-xs font-sans">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h3 className="text-base font-black uppercase text-slate-900">
                  APNA CAMPUS AUTONOMOUS ENGINEERING COLLEGE
                </h3>
                <p className="text-[10px] text-slate-500">
                  Directorate of Finance &amp; Accounts · Central Accounts Counter
                </p>
                <div className="mt-1 font-bold text-xs text-blue-900 tracking-wider">
                  STUDENT FEE PAYMENT RECEIPT (AUTONOMOUS DEMAND)
                </div>
              </div>

              <div className="flex justify-between text-xs py-1">
                <div>
                  <strong>Receipt No:</strong> {printableReceipt.receiptNo}
                </div>
                <div>
                  <strong>Date:</strong> {printableReceipt.date}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Student Name:</span>
                  <strong>{printableReceipt.studentName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Registration ID:</span>
                  <span className="font-mono font-bold">{printableReceipt.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Department:</span>
                  <span>{printableReceipt.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fee Head:</span>
                  <span>{printableReceipt.feeHead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Mode:</span>
                  <span>{printableReceipt.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transaction Reference:</span>
                  <span className="font-mono">{printableReceipt.reference}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex justify-between items-center text-sm">
                <span className="font-bold text-emerald-950">Amount Received:</span>
                <strong className="text-emerald-900 text-base">₹{printableReceipt.amount.toLocaleString('en-IN')}.00</strong>
              </div>

              <div className="pt-6 flex justify-between items-end text-xs">
                <div>
                  <div className="h-8 flex items-center justify-center font-mono text-[10px] text-slate-400">
                    [SBI/HDFC Treasury Stamp]
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 text-center text-[10px] text-slate-500">
                    System Generated Receipt
                  </div>
                </div>

                <div className="text-center">
                  <div className="h-8 flex items-center justify-center italic text-blue-900 font-bold">
                    Mr. S. K. Roy
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 text-center font-bold text-slate-800 text-[10px]">
                    Authorized Accounts Officer
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                onClick={() => setPrintableReceipt(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer size={13} /> Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {isCreateStructureOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle size={16} className="text-blue-400" />
                Configure Program Fee Tariff
              </h3>
              <button onClick={() => setIsCreateStructureOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="p-5 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Program / Degree Title</label>
                <input
                  type="text"
                  value={structureForm.program}
                  onChange={(e) => setStructureForm({ ...structureForm, program: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course Code</label>
                  <input
                    type="text"
                    value={structureForm.courseCode}
                    onChange={(e) => setStructureForm({ ...structureForm, courseCode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={structureForm.academicYear}
                    onChange={(e) => setStructureForm({ ...structureForm, academicYear: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={structureForm.tuitionFee}
                    onChange={(e) => setStructureForm({ ...structureForm, tuitionFee: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Development (₹)</label>
                  <input
                    type="number"
                    value={structureForm.developmentFee}
                    onChange={(e) => setStructureForm({ ...structureForm, developmentFee: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lab/Library (₹)</label>
                  <input
                    type="number"
                    value={structureForm.labLibraryFee}
                    onChange={(e) => setStructureForm({ ...structureForm, labLibraryFee: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Exam Fee (₹)</label>
                  <input
                    type="number"
                    value={structureForm.examinationFee}
                    onChange={(e) => setStructureForm({ ...structureForm, examinationFee: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hostel &amp; Mess (₹)</label>
                  <input
                    type="number"
                    value={structureForm.hostelMessFee}
                    onChange={(e) => setStructureForm({ ...structureForm, hostelMessFee: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateStructureOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs"
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
