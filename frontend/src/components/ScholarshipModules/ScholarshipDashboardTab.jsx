import React, { useState } from 'react';
import {
  Award,
  Users,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Calendar,
  Layers,
  ChevronRight,
  Download,
  PlusCircle,
  Eye,
  FileText,
  ShieldCheck,
  Send,
  RefreshCw,
  Sparkles,
  BarChart2
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

export default function ScholarshipDashboardTab({
  schemes,
  applications,
  disbursements,
  fundingSources,
  onNavigateTab,
  onSelectApplication,
  onOpenCreateScheme
}) {
  const [selectedCycle, setSelectedCycle] = useState('2026-2027');
  const [chartView, setChartView] = useState('dept'); // 'dept' | 'monthly' | 'funds'

  // Calculated Metrics from Shared State
  const totalSchemes = schemes.length;
  const totalApplications = applications.length;
  const submittedApps = applications.filter(a => a.reviewStatus !== 'Draft').length;
  const pendingVerification = applications.filter(a => a.verificationStatus === 'Under Verification' || a.verificationStatus === 'Discrepancy Found').length;
  const pendingApproval = applications.filter(a => a.reviewStatus === 'Under Review' || a.reviewStatus === 'Recommended').length;
  const approvedAwards = applications.filter(a => a.reviewStatus === 'Approved').length;
  const rejectedApps = applications.filter(a => a.reviewStatus === 'Rejected').length;

  const totalAwardAmount = applications
    .filter(a => a.reviewStatus === 'Approved' || a.reviewStatus === 'Recommended')
    .reduce((sum, a) => sum + (a.finalAwardAmount || a.recommendedAmount || 0), 0);

  const amountDisbursed = disbursements
    .filter(d => d.status === 'Disbursed')
    .reduce((sum, d) => sum + (d.disbursedAmount || 0), 0);

  const amountPendingDisbursement = totalAwardAmount - amountDisbursed > 0
    ? totalAwardAmount - amountDisbursed
    : 0;

  // Chart Data: Applications by Department
  const deptMap = {};
  applications.forEach(a => {
    const deptKey = a.dept.replace('Computer Science & Engineering', 'CSE')
      .replace('AI & Machine Learning', 'AIML')
      .replace('Electronics & Communication', 'ECE')
      .replace('Electrical & Electronics Engineering', 'EEE')
      .replace('Mechanical Engineering', 'MECH')
      .replace('Civil Engineering', 'CIVIL');
    deptMap[deptKey] = (deptMap[deptKey] || 0) + 1;
  });
  const deptChartData = Object.entries(deptMap).map(([dept, count]) => ({
    name: dept,
    applications: count,
    approved: applications.filter(a => a.dept.includes(dept) && a.reviewStatus === 'Approved').length
  }));

  // Chart Data: Status Distribution
  const statusColors = {
    Approved: '#10b981',
    'Under Review': '#3b82f6',
    Recommended: '#8b5cf6',
    Waitlisted: '#f59e0b',
    Rejected: '#ef4444'
  };
  const statusDistribution = [
    { name: 'Approved', value: approvedAwards, color: '#10b981' },
    { name: 'Under Review', value: applications.filter(a => a.reviewStatus === 'Under Review').length, color: '#3b82f6' },
    { name: 'Recommended', value: applications.filter(a => a.reviewStatus === 'Recommended').length, color: '#8b5cf6' },
    { name: 'Waitlisted', value: applications.filter(a => a.reviewStatus === 'Waitlisted').length, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedApps, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Chart Data: Monthly Application Inflow
  const monthlyData = [
    { month: 'Jul 2026', applications: 28, verified: 26, disbursed: 120000 },
    { month: 'Aug 2026', applications: 94, verified: 88, disbursed: 650000 },
    { month: 'Sep 2026', applications: 135, verified: 122, disbursed: 920000 },
    { month: 'Oct 2026 (Live)', applications: applications.length * 8, verified: 48, disbursed: amountDisbursed },
    { month: 'Nov 2026 (Proj)', applications: 60, verified: 55, disbursed: 780000 },
  ];

  // Chart Data: Category Distribution
  const catMap = {};
  applications.forEach(a => {
    catMap[a.category] = (catMap[a.category] || 0) + 1;
  });
  const categoryData = Object.entries(catMap).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <div className="scholarship-module-wrap">
      {/* Strategic Header Banner */}
      <div className="scholarship-banner">
        <div className="scholarship-banner-left">
          <Award size={20} className="text-sky-600" />
          <div>
            <span className="font-semibold text-slate-800">
              Autumn 2026 Financial Aid & Welfare Cycle
            </span>
            <span className="text-slate-500 text-xs ml-2">
              Autonomous Central Directorate of Student Welfare
            </span>
          </div>
          <span className="scholarship-cycle-tag">Cycle {selectedCycle} Active</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 shadow-sm outline-none focus:border-blue-500"
          >
            <option value="2026-2027">Academic Session 2026–2027</option>
            <option value="2025-2026">Academic Session 2025–2026 (Archived)</option>
          </select>

          <button
            onClick={() => onNavigateTab('rep_audit')}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-slate-700 font-medium shadow-sm transition"
          >
            <FileText size={14} /> Audit Trail
          </button>

          <button
            onClick={onOpenCreateScheme}
            className="text-xs flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow-sm transition"
          >
            <PlusCircle size={14} /> Create Scheme
          </button>
        </div>
      </div>

      {/* 10 Executive Summary Cards */}
      <div className="scholarship-kpi-grid">
        {/* 1. Total Schemes */}
        <div
          onClick={() => onNavigateTab('schemes_all')}
          className="scholarship-kpi-card cursor-pointer group hover:border-blue-300"
        >
          <div className="scholarship-kpi-card-header">
            <span className="scholarship-kpi-title">Active Schemes</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition">
              <Layers size={18} />
            </div>
          </div>
          <div className="scholarship-kpi-val">{totalSchemes}</div>
          <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Govt + Institutional + CSR</span>
            <span className="text-blue-600 font-medium flex items-center">View <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 2. Total Applications */}
        <div
          onClick={() => onNavigateTab('apps_all')}
          className="scholarship-kpi-card cursor-pointer group hover:border-indigo-300"
        >
          <div className="scholarship-kpi-card-header">
            <span className="scholarship-kpi-title">Total Applications</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition">
              <Users size={18} />
            </div>
          </div>
          <div className="scholarship-kpi-val">{totalApplications}</div>
          <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>{submittedApps} Submitted online</span>
            <span className="text-indigo-600 font-medium flex items-center">Registry <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 3. Pending Verification */}
        <div
          onClick={() => onNavigateTab('verif_screening')}
          className="scholarship-kpi-card cursor-pointer group hover:border-amber-300"
        >
          <div className="scholarship-kpi-card-header">
            <span className="scholarship-kpi-title">Pending Verification</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition">
              <Clock size={18} />
            </div>
          </div>
          <div className="scholarship-kpi-val text-amber-600">{pendingVerification}</div>
          <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Income & Caste Desk</span>
            <span className="text-amber-600 font-medium flex items-center">Review <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 4. Pending Approval */}
        <div
          onClick={() => onNavigateTab('sel_approval_queue')}
          className="scholarship-kpi-card cursor-pointer group hover:border-purple-300"
        >
          <div className="scholarship-kpi-card-header">
            <span className="scholarship-kpi-title">Pending Approval</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="scholarship-kpi-val text-purple-700">{pendingApproval}</div>
          <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Committee queue</span>
            <span className="text-purple-600 font-medium flex items-center">Sign-off <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 5. Approved Awards */}
        <div
          onClick={() => onNavigateTab('award_register')}
          className="scholarship-kpi-card cursor-pointer group hover:border-emerald-300"
        >
          <div className="scholarship-kpi-card-header">
            <span className="scholarship-kpi-title">Approved Awards</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="scholarship-kpi-val text-emerald-600">{approvedAwards}</div>
          <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>Final sanction granted</span>
            <span className="text-emerald-600 font-medium flex items-center">Register <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 6. Rejected Applications */}
        <div
          onClick={() => onNavigateTab('apps_rejected')}
          className="scholarship-kpi-card cursor-pointer group hover:border-rose-300"
        >
          <div className="scholarship-kpi-card-header">
            <span className="scholarship-kpi-title">Rejected / Non-Eligible</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition">
              <XCircle size={18} />
            </div>
          </div>
          <div className="scholarship-kpi-val text-rose-600">{rejectedApps}</div>
          <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
            <span>With mandatory remarks</span>
            <span className="text-rose-600 font-medium flex items-center">Logs <ChevronRight size={13} /></span>
          </div>
        </div>

        {/* 7. Total Award Amount */}
        <div className="scholarship-kpi-card bg-slate-900 text-white border-slate-800">
          <div className="scholarship-kpi-card-header">
            <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">
              Total Award Sanction
            </span>
            <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300">
            ₹{(totalAwardAmount / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Institutional & Govt commitments
          </div>
        </div>

        {/* 8. Amount Disbursed */}
        <div className="scholarship-kpi-card bg-emerald-950 text-white border-emerald-900">
          <div className="scholarship-kpi-card-header">
            <span className="text-emerald-300 font-semibold text-xs tracking-wider uppercase">
              Amount Disbursed (Actual)
            </span>
            <div className="p-2 rounded-lg bg-emerald-900/80 text-emerald-300">
              <Send size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-200">
            ₹{(amountDisbursed / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            Credited via Bank DBT / Fee Offset
          </div>
        </div>

        {/* 9. Pending Disbursement */}
        <div className="scholarship-kpi-card bg-blue-950 text-white border-blue-900">
          <div className="scholarship-kpi-card-header">
            <span className="text-blue-300 font-semibold text-xs tracking-wider uppercase">
              Pending Disbursement
            </span>
            <div className="p-2 rounded-lg bg-blue-900/80 text-blue-300">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-200">
            ₹{(amountPendingDisbursement / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-xs text-blue-400 mt-1">
            Scheduled for Spring Tranche 2
          </div>
        </div>

        {/* 10. Renewal Success Rate */}
        <div className="scholarship-kpi-card">
          <div className="scholarship-kpi-card-header">
            <span className="scholarship-kpi-title">Renewal Retention Rate</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="scholarship-kpi-val text-sky-700">92.4%</div>
          <div className="text-xs text-slate-500 mt-1">
            Continuing awardees meeting CGPA
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Chart: Applications & Awards (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-600" />
                Application Distribution & Grant Progress
              </h3>
              <p className="text-xs text-slate-500">
                Departmental intake and cumulative selection status
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setChartView('dept')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  chartView === 'dept' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Department
              </button>
              <button
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  chartView === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Flow
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'dept' ? (
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="applications" name="Applications Received" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Sanctioned Awards" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="applications" name="Applications" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApps)" />
                  <Area type="monotone" dataKey="verified" name="Verified Clear" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Application Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieChart size={16} className="text-purple-600" />
              Application Status Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-2">Live workflow stages for current cycle</p>
          </div>

          <div style={{ width: '100%', height: 180 }} className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-800">{totalApplications}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Apps</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {statusDistribution.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 truncate">{s.name}:</span>
                <span className="font-bold text-slate-800 ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Widget 1: Upcoming Scholarship Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Calendar size={14} className="text-blue-600" />
              Upcoming Scheme Deadlines
            </span>
            <button
              onClick={() => onNavigateTab('schemes_deadlines')}
              className="text-[11px] text-blue-600 font-semibold hover:underline"
            >
              All Deadlines
            </button>
          </div>

          <div className="space-y-2.5">
            {schemes.slice(0, 3).map(s => (
              <div key={s.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-xs text-slate-800 truncate max-w-[200px]">
                    {s.name}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    s.status === 'Closing Soon' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Closing Date: <strong className="text-slate-700">{s.closingDate}</strong></span>
                  <span>{s.filledSlots}/{s.totalSlots} Slots</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Pending Document Verification Alert Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              Missing & Verification Alerts
            </span>
            <button
              onClick={() => onNavigateTab('verif_screening')}
              className="text-[11px] text-amber-600 font-semibold hover:underline"
            >
              Verification Desk
            </button>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/60 flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-rose-900">Alok Kumar Jena (MECH)</div>
                <div className="text-rose-700 text-[11px]">Expired Revenue Income Certificate (Valid till March 2025). Re-upload requested.</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-amber-100 bg-amber-50/60 flex items-start gap-2.5">
              <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-amber-900">Sourav Panigrahi (CSE)</div>
                <div className="text-amber-700 text-[11px]">NPCI Aadhaar DBT Mapper response pending from Central Bank server.</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-blue-100 bg-blue-50/60 flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-blue-900">Debashis Rout (EEE)</div>
                <div className="text-blue-700 text-[11px]">Tehsildar barcode verified. Ready for Committee sign-off.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Statutory Compliance & Gateways */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                Statutory Directorate Gateways
              </span>
              <span className="text-[10px] bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded font-mono">
                AUTONOMOUS ERP
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Live API synchronization status with central scholarship portals and DBT servers.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-white/10 rounded-lg flex items-center justify-between border border-white/10">
              <span className="text-slate-200 flex items-center gap-1.5 font-medium"><ShieldCheck size={14} className="text-emerald-300" /> PFMS DBT Gateway</span>
              <span className="text-[11px] font-bold text-emerald-400">● Live Connected</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-lg flex items-center justify-between border border-white/10">
              <span className="text-slate-200 flex items-center gap-1.5 font-medium"><FileCheck size={14} className="text-sky-300" /> State Post-Matric Portal</span>
              <span className="text-[11px] font-bold text-sky-400">● Synchronized</span>
            </div>
            <div className="p-2.5 bg-white/10 rounded-lg flex items-center justify-between border border-white/10">
              <span className="text-slate-200 flex items-center gap-1.5 font-medium"><Award size={14} className="text-purple-300" /> Institutional Endowment Fund</span>
              <span className="text-[11px] font-bold text-purple-300">100% Solvency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
