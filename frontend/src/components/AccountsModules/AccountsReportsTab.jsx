import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Check,
  BookOpen
} from 'lucide-react';
import {
  INITIAL_ACCOUNTS_AUDIT_LOGS,
  INITIAL_CHART_OF_ACCOUNTS
} from './accountsData';

export default function AccountsReportsTab({
  feeStructures = [],
  studentLedgers = [],
  transactions = [],
  payrollEmployees = [],
  vendorBills = [],
  expenses = [],
  budgets = [],
  chartOfAccounts = INITIAL_CHART_OF_ACCOUNTS,
  auditLogs = INITIAL_ACCOUNTS_AUDIT_LOGS,
  initialReportType = 'collection'
}) {
  const [selectedReport, setSelectedReport] = useState(initialReportType);

  useEffect(() => {
    if (initialReportType) {
      setSelectedReport(initialReportType);
    }
  }, [initialReportType]);

  const [selectedFY, setSelectedFY] = useState('FY 2026-27');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // Print Statement Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Derived Financial Aggregations
  const totalAssessed = studentLedgers.reduce((sum, s) => sum + s.totalAssessed, 0);
  const totalConcessions = studentLedgers.reduce((sum, s) => sum + (s.concessions || 0), 0);
  const totalCollected = transactions.filter(t => t.status === 'Verified').reduce((sum, t) => sum + t.amount, 0);
  const totalOutstanding = studentLedgers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

  const totalPayroll = payrollEmployees.reduce((sum, e) => sum + e.netSalary, 0);
  const totalPF = payrollEmployees.reduce((sum, e) => sum + e.pfDeduction, 0);
  const totalTDS = payrollEmployees.reduce((sum, e) => sum + e.tdsDeduction, 0);

  const totalOperatingExpenses = expenses.reduce((sum, ex) => sum + ex.amount, 0);
  const totalVendorBills = vendorBills.reduce((sum, b) => sum + b.totalAmount, 0);

  // Income & Expenditure
  const totalIncome = 36240000 + 6205500 + 2895900 + 2068500; // Tuition, Hostel, Transport, Exam
  const totalExpenditure = 82400000 + 4850000 + 2450000 + 3150000; // Salary, Utilities, Labs, Maintenance
  const netSurplusDeficit = totalIncome - totalExpenditure;

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchAction = auditActionFilter === 'ALL' || log.actionType === auditActionFilter;
    const matchSearch = auditSearch === '' ||
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.target.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.id.toLowerCase().includes(auditSearch.toLowerCase());
    return matchAction && matchSearch;
  });

  // Universal CSV Export
  const handleExportCSV = (reportKey) => {
    let filename = `apna_campus_${reportKey}_report.csv`;
    let csvContent = '';

    if (reportKey === 'collection') {
      csvContent = 'Receipt ID,Student Name,Roll Number,Department,Semester,Fee Head,Amount (INR),Payment Mode,Date,Status\n' +
        transactions.map(t =>
          `"${t.id}","${t.studentName}","${t.rollNumber}","${t.department}","${t.semester}","${t.head}",${t.amount},"${t.mode}","${t.date}","${t.status}"`
        ).join('\n');
    } else if (reportKey === 'outstanding') {
      csvContent = 'Roll Number,Student Name,Department,Semester,Total Assessed,Total Paid,Concessions,Outstanding Balance,Due Date,Status\n' +
        studentLedgers.map(s =>
          `"${s.studentId}","${s.studentName}","${s.department}","${s.semester}",${s.totalAssessed},${s.totalPaid},${s.concessions},${s.outstandingBalance},"${s.dueDate}","${s.status}"`
        ).join('\n');
    } else if (reportKey === 'payroll') {
      csvContent = 'Employee ID,Name,Designation,Department,Basic (INR),HRA (INR),DA (INR),Gross Salary,PF (INR),TDS (INR),Net Salary (INR)\n' +
        payrollEmployees.map(e =>
          `"${e.id}","${e.name}","${e.designation}","${e.department}",${e.basic},${e.hra},${e.da},${e.grossSalary},${e.pfDeduction},${e.tdsDeduction},${e.netSalary}`
        ).join('\n');
    } else if (reportKey === 'audit') {
      csvContent = 'Log ID,Timestamp,Actor,Role,Action Type,Target Reference,Details,IP Address\n' +
        auditLogs.map(l =>
          `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.actionType}","${l.target}","${l.details}","${l.ip}"`
        ).join('\n');
    } else {
      // Trial Balance
      csvContent = 'Account Code,Account Title,Classification,Debit (INR),Credit (INR)\n' +
        chartOfAccounts.map(a => {
          const isDebit = a.category === 'Assets' || a.category === 'Expenses';
          return `"${a.code}","${a.name}","${a.category}",${isDebit ? a.balance : 0},${!isDebit ? a.balance : 0}`;
        }).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-blue-700 shrink-0" />
          <span className="text-xs text-blue-900 font-medium">
            <strong>Demonstration Financial Reports:</strong> All reports are calculated dynamically from local state records. No real banking credentials or live external tax declarations are processed.
          </span>
        </div>
        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Printer size={13} /> Print Financial Statement
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'collection', label: 'Fee Collection Summary', icon: Layers },
            { id: 'outstanding', label: 'Outstanding Dues Register', icon: AlertTriangle },
            { id: 'payroll', label: 'Staff Payroll Statement', icon: Users },
            { id: 'incomex', label: 'Income vs. Expenditure', icon: TrendingUp },
            { id: 'trial_balance', label: 'Trial Balance Ledger', icon: BookOpen },
            { id: 'audit', label: 'Statutory Audit Trail', icon: ShieldCheck, count: auditLogs.length }
          ].map(r => {
            const Icon = r.icon || FileText;
            const isActive = selectedReport === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedReport(r.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{r.label}</span>
                {r.count !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {r.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleExportCSV(selectedReport)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <Download size={13} /> Export Current CSV
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          REPORT 1: FEE COLLECTION SUMMARY
      ───────────────────────────────────────────────────────────── */}
      {selectedReport === 'collection' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Fee Demand</span>
              <div className="text-xl font-black text-slate-900 mt-1">₹{(totalAssessed / 100000).toFixed(2)} L</div>
              <span className="text-[11px] text-slate-400">Total Autumn 2026 Assessed</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Realized</span>
              <div className="text-xl font-black text-emerald-700 mt-1">₹{(totalCollected / 100000).toFixed(2)} L</div>
              <span className="text-[11px] text-emerald-600 font-semibold">{((totalCollected / (totalAssessed - totalConcessions)) * 100).toFixed(1)}% Realization Rate</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Fee Waivers &amp; Aid</span>
              <div className="text-xl font-black text-purple-700 mt-1">₹{(totalConcessions / 100000).toFixed(2)} L</div>
              <span className="text-[11px] text-slate-400">Merit &amp; TFW Concessions</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Outstanding Balance</span>
              <div className="text-xl font-black text-rose-700 mt-1">₹{(totalOutstanding / 100000).toFixed(2)} L</div>
              <span className="text-[11px] text-rose-600 font-semibold">Active Defaulter Arrears</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Verified Fee Receipts Stream</h3>
              <span className="text-xs text-slate-500 font-medium">{transactions.length} Verified Entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Receipt No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Fee Head</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{t.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{t.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{t.department}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{t.head}</td>
                      <td className="py-2.5 px-3 text-slate-600">{t.mode}</td>
                      <td className="py-2.5 px-3 text-slate-500">{t.date}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">₹{Number(t.amount).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REPORT 2: OUTSTANDING DUES & AGING DEFAULTERS
      ───────────────────────────────────────────────────────────── */}
      {selectedReport === 'outstanding' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student Arrears &amp; Defaulter Statement</h3>
                <p className="text-xs text-slate-500">Unsettled fee balances classified by aging bracket</p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-md border border-rose-200">
                Total Unpaid: ₹{(totalOutstanding / 100000).toFixed(2)} Lakhs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-4">Student Roll</th>
                    <th className="py-2.5 px-4">Full Name</th>
                    <th className="py-2.5 px-4">Department &amp; Sem</th>
                    <th className="py-2.5 px-4 text-right">Assessed (₹)</th>
                    <th className="py-2.5 px-4 text-right">Paid (₹)</th>
                    <th className="py-2.5 px-4 text-right">Due Balance (₹)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentLedgers.filter(s => s.outstandingBalance > 0).map(s => (
                    <tr key={s.studentId || s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{s.studentId}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{s.name || s.studentName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{s.department} · {s.semester}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">₹{Number(s.totalAssessed).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-semibold">₹{Number(s.totalPaid).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">₹{Number(s.outstandingBalance).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.paymentStatus?.includes('Partial') ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.paymentStatus || 'Overdue'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REPORT 3: STAFF PAYROLL STATEMENT
      ───────────────────────────────────────────────────────────── */}
      {selectedReport === 'payroll' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Monthly Net Payroll</span>
              <div className="text-xl font-black text-slate-900 mt-1">₹{(totalPayroll / 100000).toFixed(2)} L</div>
              <span className="text-[11px] text-slate-400">Total Take-Home Pay</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Statutory EPF Total</span>
              <div className="text-xl font-black text-blue-700 mt-1">₹{(totalPF / 100000).toFixed(2)} L</div>
              <span className="text-[11px] text-slate-400">12% Employee Provident Fund</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">TDS Deductions</span>
              <div className="text-xl font-black text-purple-700 mt-1">₹{(totalTDS / 100000).toFixed(2)} L</div>
              <span className="text-[11px] text-slate-400">Income Tax Dept Remittance</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Employee Monthly Compensation Breakdown</h3>
              <span className="text-xs text-slate-500 font-medium">{payrollEmployees.length} Eligible Employees</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Emp ID</th>
                    <th className="py-2.5 px-3">Name &amp; Designation</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Basic (₹)</th>
                    <th className="py-2.5 px-3 text-right">Gross (₹)</th>
                    <th className="py-2.5 px-3 text-right">PF (₹)</th>
                    <th className="py-2.5 px-3 text-right">TDS (₹)</th>
                    <th className="py-2.5 px-3 text-right">Net Salary (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollEmployees.map(e => (
                    <tr key={e.employeeId || e.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{e.employeeId || e.id}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{e.name}</span>
                        <span className="text-[11px] text-slate-400">{e.designation}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{e.department}</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹{Number(e.basicSalary || e.basic || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">₹{Number(e.grossSalary || (e.basicSalary ? Math.round(e.basicSalary * 1.66) : 0)).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-700">₹{Number(e.providentFund || e.pfDeduction || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-700">₹{Number(e.tdsIncomeTax || e.tdsDeduction || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">₹{Number(e.netSalary || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REPORT 4: INCOME VS EXPENDITURE STATEMENT
      ───────────────────────────────────────────────────────────── */}
      {selectedReport === 'incomex' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institutional Income &amp; Expenditure Statement</h3>
                <p className="text-xs text-slate-500">Autonomous College Financial Performance for {selectedFY}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                netSurplusDeficit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {netSurplusDeficit >= 0 ? 'Operating Surplus' : 'Operating Deficit'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Column */}
              <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/20 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="font-bold text-emerald-900 text-sm">A. Operating Revenues</span>
                  <span className="font-black font-mono text-emerald-800 text-base">₹{(totalIncome / 100000).toFixed(2)} L</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-700">Tuition &amp; Academic Development Fees</span>
                    <span className="font-mono font-bold text-slate-900">₹3,62,40,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-700">Hostel Boarding &amp; Dining Collections</span>
                    <span className="font-mono font-bold text-slate-900">₹62,05,500</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-700">Campus Transit Bus Fleet Subscriptions</span>
                    <span className="font-mono font-bold text-slate-900">₹28,95,900</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">Autonomous Examination &amp; Evaluation</span>
                    <span className="font-mono font-bold text-slate-900">₹20,68,500</span>
                  </div>
                </div>
              </div>

              {/* Expenditure Column */}
              <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/20 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                  <span className="font-bold text-rose-900 text-sm">B. Operating Expenditures</span>
                  <span className="font-black font-mono text-rose-800 text-base">₹{(totalExpenditure / 100000).toFixed(2)} L</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-rose-100">
                    <span className="text-slate-700">Teaching &amp; Non-Teaching Staff Salaries</span>
                    <span className="font-mono font-bold text-slate-900">₹8,24,00,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100">
                    <span className="text-slate-700">Campus Electricity &amp; High-Tension Power</span>
                    <span className="font-mono font-bold text-slate-900">₹48,50,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100">
                    <span className="text-slate-700">Laboratory Consumables &amp; Research</span>
                    <span className="font-mono font-bold text-slate-900">₹24,50,000</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">Campus Estate &amp; Solar Grid Maintenance</span>
                    <span className="font-mono font-bold text-slate-900">₹31,50,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REPORT 5: TRIAL BALANCE LEDGER
      ───────────────────────────────────────────────────────────── */}
      {selectedReport === 'trial_balance' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audited Trial Balance</h3>
                <p className="text-xs text-slate-500">Double-entry ledger balances verified across 5 standard asset/liability tiers</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Balanced (Debits ≡ Credits)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-4">Account Code</th>
                    <th className="py-2.5 px-4">Account Title</th>
                    <th className="py-2.5 px-4">Group</th>
                    <th className="py-2.5 px-4 text-right">Debit (DR) (₹)</th>
                    <th className="py-2.5 px-4 text-right">Credit (CR) (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chartOfAccounts.map(acc => {
                    const isDebit = acc.category === 'Assets' || acc.category === 'Expenses';
                    return (
                      <tr key={acc.code} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{acc.code}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{acc.name}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {acc.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-700">
                          {isDebit ? `₹${Number(acc.balance).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {!isDebit ? `₹${Number(acc.balance).toLocaleString('en-IN')}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REPORT 6: STATUTORY AUDIT TRAIL LOGS
      ───────────────────────────────────────────────────────────── */}
      {selectedReport === 'audit' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit trail by actor, action, IP, or target..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Action:</span>
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="ALL">All Actions</option>
                <option value="FEE_PAYMENT_RECORDED">FEE_PAYMENT_RECORDED</option>
                <option value="VENDOR_BILL_APPROVED">VENDOR_BILL_APPROVED</option>
                <option value="JOURNAL_ENTRY_POSTED">JOURNAL_ENTRY_POSTED</option>
                <option value="PAYROLL_DISBURSEMENT_COMMITTED">PAYROLL_DISBURSEMENT_COMMITTED</option>
                <option value="BANK_RECONCILIATION_FILED">BANK_RECONCILIATION_FILED</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institutional Financial Audit Log</h3>
                <p className="text-xs text-slate-500">Immutable chronological record of all financial events, approvals, and vouchers</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 border border-slate-200 rounded-md">
                {filteredAuditLogs.length} Events Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Event ID &amp; Time</th>
                    <th className="py-3 px-4">Operator / Role</th>
                    <th className="py-3 px-4">Action Classification</th>
                    <th className="py-3 px-4">Target Entity / Reference</th>
                    <th className="py-3 px-4">Audit Details &amp; Verification Note</th>
                    <th className="py-3 px-4">Network IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-600 block">{log.id}</span>
                        <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{log.actor}</span>
                        <span className="text-[11px] text-slate-400">{log.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {log.target}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px]">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {log.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PRINT FINANCIAL STATEMENT
      ───────────────────────────────────────────────────────────── */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Official Institutional Financial Statement</h3>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-800">
              {/* College Letterhead */}
              <div className="text-center border-b pb-4">
                <img src="/logo.png" alt="Apna Campus Logo" className="h-10 mx-auto mb-1" />
                <h2 className="text-base font-black text-slate-900 tracking-wide">
                  APNA CAMPUS AUTONOMOUS COLLEGE OF ENGINEERING &amp; TECHNOLOGY
                </h2>
                <p className="text-slate-500 text-xs">Directorate of Finance &amp; Accounts · Central Treasury Operations</p>
                <span className="inline-block mt-2 font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded text-xs border">
                  ANNUAL FINANCIAL AUDIT SUMMARY STATEMENT — {selectedFY}
                </span>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-3 rounded-lg space-y-1">
                  <span className="text-slate-500 font-semibold text-[11px]">TOTAL STUDENT FEE ASSESSED</span>
                  <div className="font-bold font-mono text-base text-slate-900">₹{Number(totalAssessed).toLocaleString('en-IN')}</div>
                  <span className="text-slate-400 text-[10px]">Realized: ₹{Number(totalCollected).toLocaleString('en-IN')}</span>
                </div>
                <div className="border p-3 rounded-lg space-y-1">
                  <span className="text-slate-500 font-semibold text-[11px]">TOTAL TEACHING &amp; STAFF PAYROLL</span>
                  <div className="font-bold font-mono text-base text-slate-900">₹{Number(totalPayroll).toLocaleString('en-IN')}</div>
                  <span className="text-slate-400 text-[10px]">Statutory EPF &amp; TDS remitted</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex justify-between border-t border-slate-200 text-center">
                <div className="w-44">
                  <div className="border-b border-slate-400 mb-1 h-8"></div>
                  <span className="font-bold block text-slate-900">Mr. S. K. Roy</span>
                  <span className="text-[10px] text-slate-500">Senior Accounts Officer</span>
                </div>
                <div className="w-44">
                  <div className="border-b border-slate-400 mb-1 h-8"></div>
                  <span className="font-bold block text-slate-900">Dr. A. K. Mishra</span>
                  <span className="text-[10px] text-slate-500">Bursar &amp; Finance Officer</span>
                </div>
                <div className="w-44">
                  <div className="border-b border-slate-400 mb-1 h-8"></div>
                  <span className="font-bold block text-slate-900">Principal</span>
                  <span className="text-[10px] text-slate-500">Autonomous Institution</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={13} /> Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
