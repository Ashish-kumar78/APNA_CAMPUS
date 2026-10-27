import React, { useState } from 'react';
import {
  IndianRupee,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Download,
  PlusCircle,
  FileText,
  ShieldCheck,
  RotateCcw,
  BarChart2,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  Receipt,
  Landmark
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import './AccountsDashboardTab.css';

export default function AccountsDashboardTab({
  feeStructures,
  studentLedgers,
  transactions,
  payrollEmployees,
  vendorBills,
  expenses,
  budgets,
  onNavigateTab,
  onOpenRecordPayment,
  onOpenAddBill
}) {
  const [selectedFY, setSelectedFY] = useState('FY 2026-27');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [chartView, setChartView] = useState('trends'); // 'trends' | 'incomex' | 'budget'

  // Financial Metric Calculations Derived from Shared State
  const totalAssessed = studentLedgers.reduce((sum, s) => sum + s.totalAssessed, 0);
  const totalConcessions = studentLedgers.reduce((sum, s) => sum + (s.concessions || 0), 0);
  const totalCollected = transactions
    .filter(t => t.status === 'Verified')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutstanding = studentLedgers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
  const collectionRate = totalAssessed > 0 ? ((totalCollected / (totalAssessed - totalConcessions)) * 100).toFixed(1) : 0;

  const totalMonthlyPayroll = payrollEmployees.reduce((sum, e) => sum + e.netSalary, 0);
  const totalOperatingExpenses = expenses.reduce((sum, ex) => sum + ex.amount, 0);
  const pendingApprovalsCount = vendorBills.filter(b => b.status === 'Pending Payment').length + 2;
  const overdueVendorPayments = vendorBills
    .filter(b => b.status.includes('Overdue') || b.balance > 0)
    .reduce((sum, b) => sum + b.balance, 0);

  const availableBankBalance = 12540000 + 5460000 + 450000; // SBI Treasury + HDFC Collection + Vault

  // Chart 1: Monthly Trends
  const monthlyTrends = [
    { month: 'Jun 2026', assessed: 8200000, collected: 7100000, expenses: 1400000 },
    { month: 'Jul 2026', assessed: 12500000, collected: 11200000, expenses: 2200000 },
    { month: 'Aug 2026', assessed: 9800000, collected: 8900000, expenses: 1950000 },
    { month: 'Sep 2026', assessed: 6400000, collected: 5600000, expenses: 1800000 },
    { month: 'Oct 2026 (Live)', assessed: totalAssessed, collected: totalCollected, expenses: totalOperatingExpenses },
    { month: 'Nov 2026 (Proj)', assessed: 4800000, collected: 4200000, expenses: 1750000 }
  ];

  // Chart 2: Outstanding Dues by Department
  const deptDuesMap = {};
  studentLedgers.forEach(s => {
    const deptKey = s.department.replace('Computer Science & Engineering', 'CSE')
      .replace('AI & Machine Learning', 'AIML')
      .replace('Electronics & Communication', 'ECE')
      .replace('Electrical & Electronics', 'EEE')
      .replace('Mechanical Engineering', 'MECH')
      .replace('Civil Engineering', 'CIVIL');
    deptDuesMap[deptKey] = (deptDuesMap[deptKey] || 0) + s.outstandingBalance;
  });
  const deptDuesChartData = Object.entries(deptDuesMap).map(([dept, dues]) => ({
    dept,
    dues
  }));

  // Chart 3: Fee Category Breakdown
  const feeHeadDistribution = [
    { name: 'Tuition Fee (55%)', value: 22753500, color: '#3b82f6' },
    { name: 'Development Fund (18%)', value: 7446600, color: '#10b981' },
    { name: 'Hostel & Mess (15%)', value: 6205500, color: '#f59e0b' },
    { name: 'Transport Fleet (7%)', value: 2895900, color: '#8b5cf6' },
    { name: 'Exam & Evaluation (5%)', value: 2068500, color: '#ec4899' }
  ];

  // Chart 4: Payment Channel Distribution
  const paymentChannelData = [
    { name: 'Online Net Banking', value: 52, color: '#2563eb' },
    { name: 'Campus UPI / QR', value: 34, color: '#10b981' },
    { name: 'Bank Challan (SBI)', value: 10, color: '#f59e0b' },
    { name: 'Accounts Cash', value: 4, color: '#64748b' }
  ];

  return (
    <div className="accounts-module-wrap accounts-dashboard">
      {/* Strategic Fiscal Header Banner */}
      <div className="accounts-banner accounts-dashboard__banner">
        <div className="accounts-banner-left accounts-dashboard__banner-copy">
          <Landmark size={20} className="text-blue-600" />
          <div>
            <span className="font-bold text-slate-900 text-sm">
              Central Institutional Treasury &amp; Bursar Operations
            </span>
            <span className="text-slate-500 text-xs ml-2">
              Autonomous College of Engineering &amp; Technology
            </span>
          </div>
          <span className="accounts-cycle-tag">{selectedFY} Active Fiscal Year</span>
        </div>

        <div className="accounts-dashboard__actions">
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="accounts-dashboard__year-select text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 shadow-xs outline-none focus:border-blue-500"
          >
            <option value="FY 2026-27">Financial Year 2026–2027 (Active)</option>
            <option value="FY 2025-26">Financial Year 2025–2026 (Audited)</option>
          </select>

          <button
            onClick={() => onNavigateTab('rep_audit_trail')}
            className="accounts-dashboard__action accounts-dashboard__audit-action text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-slate-700 font-medium shadow-xs transition"
          >
            <ShieldCheck size={14} /> Audit Trail
          </button>

          <button
            onClick={onOpenRecordPayment}
            className="accounts-dashboard__action accounts-dashboard__record-action text-xs flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow-xs transition"
          >
            <Receipt size={14} /> Record Fee Payment
          </button>
        </div>
      </div>

      {/* 10 Executive Summary Cards */}
      <div className="accounts-kpi-grid accounts-dashboard__kpi-grid">
        {/* 1. Total Fees Assessed */}
        <div
          onClick={() => onNavigateTab('fee_management')}
          className="accounts-kpi-card accounts-dashboard__kpi-card cursor-pointer group hover:border-blue-300"
        >
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Total Fees Assessed</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition">
              <Layers size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val">₹{(totalAssessed / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-footer text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Tuition, Hostel &amp; Bus</span>
            <span className="text-blue-600 font-semibold flex items-center">Tariffs <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 2. Total Fees Collected */}
        <div
          onClick={() => onNavigateTab('fee_collection')}
          className="accounts-kpi-card accounts-dashboard__kpi-card accounts-dashboard__kpi-card--income bg-emerald-950 text-white border-emerald-900 cursor-pointer"
        >
          <div className="accounts-kpi-card-header">
            <span className="text-emerald-300 font-semibold text-xs tracking-wider uppercase">Total Realized Fees</span>
            <div className="p-2 rounded-lg bg-emerald-900/80 text-emerald-300">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-200">₹{(totalCollected / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-note accounts-dashboard__kpi-note--income text-xs text-emerald-400 mt-1">
            Reconciled bank &amp; counter credits
          </div>
        </div>

        {/* 3. Outstanding Student Dues */}
        <div
          onClick={() => onNavigateTab('fee_outstanding')}
          className="accounts-kpi-card accounts-dashboard__kpi-card cursor-pointer group hover:border-rose-300"
        >
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Outstanding Student Dues</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val text-rose-600">₹{(totalOutstanding / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-footer text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Autumn Term Arrears</span>
            <span className="text-rose-600 font-semibold flex items-center">Defaulters <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 4. Collection Rate */}
        <div className="accounts-kpi-card accounts-dashboard__kpi-card">
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Collection Rate</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val text-sky-700">{collectionRate}%</div>
          <div className="accounts-dashboard__kpi-note text-xs text-slate-500 mt-1">
            Exceeding 85% fiscal milestone
          </div>
        </div>

        {/* 5. Total Monthly Payroll */}
        <div
          onClick={() => onNavigateTab('payroll_staff')}
          className="accounts-kpi-card accounts-dashboard__kpi-card cursor-pointer group hover:border-purple-300"
        >
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Monthly Payroll (Net)</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition">
              <Users size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val text-purple-700">₹{(totalMonthlyPayroll / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-footer text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>222 Faculty &amp; Staff</span>
            <span className="text-purple-600 font-semibold flex items-center">Salary <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 6. Total Operating Expenses */}
        <div
          onClick={() => onNavigateTab('expense_register')}
          className="accounts-kpi-card accounts-dashboard__kpi-card cursor-pointer group hover:border-amber-300"
        >
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Operating Expenses</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val text-amber-600">₹{(totalOperatingExpenses / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-footer text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Power, Labs, Leased Lines</span>
            <span className="text-amber-600 font-semibold flex items-center">Bills <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 7. Pending Approvals */}
        <div
          onClick={() => onNavigateTab('expense_approvals')}
          className="accounts-kpi-card accounts-dashboard__kpi-card cursor-pointer group hover:border-indigo-300"
        >
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Pending Vouchers</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition">
              <Clock size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val text-indigo-700">{pendingApprovalsCount} Items</div>
          <div className="accounts-dashboard__kpi-footer text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Bursar clearance queue</span>
            <span className="text-indigo-600 font-semibold flex items-center">Queue <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 8. Available Liquid Cash & Bank */}
        <div className="accounts-kpi-card accounts-dashboard__kpi-card accounts-dashboard__kpi-card--liquidity bg-slate-900 text-white border-slate-800">
          <div className="accounts-kpi-card-header">
            <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Liquid Cash &amp; Bank</span>
            <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">₹{(availableBankBalance / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-note accounts-dashboard__kpi-note--liquidity text-xs text-slate-400 mt-1">
            SBI Treasury + HDFC Collection
          </div>
        </div>

        {/* 9. Overdue Vendor Payables */}
        <div
          onClick={() => onNavigateTab('vendor_bills')}
          className="accounts-kpi-card accounts-dashboard__kpi-card cursor-pointer group hover:border-orange-300"
        >
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Vendor Accounts Payable</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600 group-hover:scale-105 transition">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val text-orange-700">₹{(overdueVendorPayments / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-footer text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Suppliers &amp; Hardware AMCs</span>
            <span className="text-orange-600 font-semibold flex items-center">Payables <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 10. Scholarships & Concessions */}
        <div
          onClick={() => onNavigateTab('fee_scholarships')}
          className="accounts-kpi-card accounts-dashboard__kpi-card cursor-pointer group hover:border-teal-300"
        >
          <div className="accounts-kpi-card-header">
            <span className="accounts-kpi-title">Fee Waivers &amp; Aid</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:scale-105 transition">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="accounts-kpi-val text-teal-700">₹{(totalConcessions / 100000).toFixed(2)} L</div>
          <div className="accounts-dashboard__kpi-footer text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>State DBT &amp; Chairman Trust</span>
            <span className="text-teal-600 font-semibold flex items-center">Grants <ChevronRight size={13} /></span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 accounts-dashboard__chart-grid">
        {/* Left Chart: Monthly Trends (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between accounts-dashboard__panel accounts-dashboard__trend-panel">
          <div className="accounts-dashboard__chart-header flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-600" />
                Fee Collection Inflow vs Operational Expenditures
              </h3>
              <p className="text-xs text-slate-500">
                Monthly assessment realizations versus institutional cash outflows
              </p>
            </div>
            <div className="accounts-dashboard__chart-toggles flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setChartView('trends')}
                className={`accounts-dashboard__chart-toggle ${chartView === 'trends' ? 'is-active' : ''}`}
              >
                Inflow vs Outflow
              </button>
              <button
                onClick={() => setChartView('deptdues')}
                className={`accounts-dashboard__chart-toggle ${chartView === 'deptdues' ? 'is-active' : ''}`}
              >
                Dept Arrears
              </button>
            </div>
          </div>

          <div className="accounts-dashboard__trend-chart" style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'trends' ? (
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="collected" name="Fee Realized Inflow" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" />
                  <Area type="monotone" dataKey="expenses" name="Operational Outflows" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              ) : (
                <BarChart data={deptDuesChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Outstanding Dues']}
                  />
                  <Bar dataKey="dues" name="Outstanding Dues (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Fee Head Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between accounts-dashboard__panel accounts-dashboard__breakdown">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieIcon size={16} className="text-purple-600" />
              Fee Assessment Component Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-2">Tuition, infrastructure, and auxiliary services</p>
          </div>

          <div style={{ width: '100%', height: 180 }} className="accounts-dashboard__donut relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeHeadDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {feeHeadDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-extrabold text-slate-800">₹4.13 Cr</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Fee Base</span>
            </div>
          </div>

          <div className="accounts-dashboard__breakdown-list grid grid-cols-1 gap-1.5 text-xs pt-2 border-t border-slate-100">
            {feeHeadDistribution.map(f => (
              <div key={f.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                  <span className="text-slate-600 truncate">{f.name}</span>
                </div>
                <span className="font-bold text-slate-800 ml-2">₹{(f.value / 100000).toFixed(1)}L</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 accounts-dashboard__operations">
        {/* Widget 1: Recent Fee Transactions & Counter Receipts */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs accounts-dashboard__panel">
          <div className="accounts-dashboard__widget-header flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Receipt size={14} className="text-blue-600" />
              Latest Fee Receipts Issued
            </span>
            <button
              onClick={() => onNavigateTab('receipt_register')}
              className="accounts-dashboard__inline-action text-[11px] text-blue-600 font-semibold hover:underline"
            >
              All Receipts
            </button>
          </div>

          <div className="accounts-dashboard__receipts space-y-2.5">
            {transactions.slice(0, 3).map(txn => (
              <div key={txn.id} className="accounts-dashboard__receipt-row p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{txn.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{txn.receiptNo} · {txn.mode}</div>
                  </div>
                  <strong className="text-emerald-700 text-xs font-extrabold">
                    +₹{txn.amount.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>{txn.feeHead}</span>
                  <span>{txn.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Overdue Arrears & Payables Alert */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs accounts-dashboard__panel">
          <div className="accounts-dashboard__widget-header flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              Immediate Financial Action Alerts
            </span>
            <button
              onClick={() => onNavigateTab('fee_outstanding')}
              className="text-[11px] text-amber-600 font-semibold hover:underline"
            >
              Arrears Desk
            </button>
          </div>

          <div className="space-y-2">
            <div className="accounts-dashboard__alert-item accounts-dashboard__alert-item--risk p-2.5 rounded-lg border border-rose-100 bg-rose-50/60 flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-rose-900">Alok Kumar Jena (MECH Sem 5)</div>
                <div className="text-rose-700 text-[11px]">₹58,000 overdue &gt;60 days. Final clearance reminder issued.</div>
              </div>
            </div>

            <div className="accounts-dashboard__alert-item accounts-dashboard__alert-item--due p-2.5 rounded-lg border border-amber-100 bg-amber-50/60 flex items-start gap-2.5">
              <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-amber-900">TechCore AI Server GPU Invoice</div>
                <div className="text-amber-700 text-[11px]">₹2,50,000 remaining bill balance due by 11-Nov-2026.</div>
              </div>
            </div>

            <div className="accounts-dashboard__alert-item accounts-dashboard__alert-item--schedule p-2.5 rounded-lg border border-blue-100 bg-blue-50/60 flex items-start gap-2.5">
              <Calendar size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-blue-900">November Faculty Salary Disbursement</div>
                <div className="text-blue-700 text-[11px]">Scheduled for release on 01-Nov-2026 via SBI Treasury.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Statutory Treasury & Audit Gateway */}
        <div className="accounts-dashboard__panel accounts-dashboard__treasury-panel bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-5 text-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                Treasury &amp; Fiscal Compliance
              </span>
              <span className="text-[10px] bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded font-mono">
                AUTONOMOUS ERP
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Real-time banking gateway telemetry, statutory ledger audit, and treasury liquidity.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-white/10 rounded-lg flex items-center justify-between border border-white/10">
              <span className="text-slate-200 flex items-center gap-1.5 font-medium"><Landmark size={14} className="text-emerald-300" /> SBI Treasury Gateway</span>
              <span className="text-[11px] font-bold text-emerald-400">● Reconciled</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-lg flex items-center justify-between border border-white/10">
              <span className="text-slate-200 flex items-center gap-1.5 font-medium"><CreditCard size={14} className="text-sky-300" /> Campus Smart Pay / UPI</span>
              <span className="text-[11px] font-bold text-sky-400">● 0-Wait Webhook</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-lg flex items-center justify-between border border-white/10">
              <span className="text-slate-200 flex items-center gap-1.5 font-medium"><ShieldCheck size={14} className="text-purple-300" /> Statutory GST &amp; TDS Audit</span>
              <span className="text-[11px] font-bold text-purple-300">Compliant (FY27)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
