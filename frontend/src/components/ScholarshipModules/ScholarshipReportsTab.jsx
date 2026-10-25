import React, { useState } from 'react';
import {
  FileText,
  BarChart2,
  PieChart as PieIcon,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  Award,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ScholarshipReportsTab({
  schemes,
  applications,
  disbursements,
  fundingSources,
  auditLogs,
  initialReportType = 'applications'
}) {
  const [selectedReport, setSelectedReport] = useState(initialReportType); // 'applications' | 'awards' | 'funds' | 'audit'
  const [sessionFilter, setSessionFilter] = useState('2026-2027');

  // Aggregated Department Report Data
  const deptStats = {};
  applications.forEach(a => {
    const deptName = a.dept;
    if (!deptStats[deptName]) {
      deptStats[deptName] = { name: deptName, totalApps: 0, approved: 0, totalAmount: 0 };
    }
    deptStats[deptName].totalApps += 1;
    if (a.reviewStatus === 'Approved') {
      deptStats[deptName].approved += 1;
      deptStats[deptName].totalAmount += (a.finalAwardAmount || a.recommendedAmount || 0);
    }
  });
  const deptReportList = Object.values(deptStats);

  // Scheme-Wise Utilization Data
  const schemeReportList = schemes.map(s => {
    const appList = applications.filter(a => a.schemeId === s.id);
    const approvedList = appList.filter(a => a.reviewStatus === 'Approved');
    const totalSanctioned = approvedList.reduce((sum, a) => sum + (a.finalAwardAmount || a.recommendedAmount || 0), 0);

    return {
      id: s.id,
      name: s.name,
      type: s.type,
      slots: s.totalSlots,
      applications: appList.length,
      approved: approvedList.length,
      totalSanctioned
    };
  });

  const handleExportReportCSV = () => {
    let headers = [];
    let rows = [];

    if (selectedReport === 'applications') {
      headers = ['Application ID', 'Student ID', 'Student Name', 'Department', 'Semester', 'Scheme Name', 'CGPA', 'Income', 'Status', 'Recommended Amount'];
      rows = applications.map(a => [
        a.id,
        a.studentId,
        `"${a.studentName}"`,
        `"${a.dept}"`,
        a.semester,
        `"${a.schemeName}"`,
        a.cgpa,
        a.annualFamilyIncome,
        a.reviewStatus,
        a.recommendedAmount
      ]);
    } else if (selectedReport === 'funds') {
      headers = ['Funding Source ID', 'Funding Name', 'Category', 'Total Allocated', 'Committed Amount', 'Disbursed Amount', 'Remaining Buffer'];
      rows = fundingSources.map(f => [
        f.id,
        `"${f.name}"`,
        f.category,
        f.totalAllocated,
        f.committedAmount,
        f.disbursedAmount,
        f.remainingAllocation
      ]);
    } else {
      headers = ['Audit ID', 'Timestamp', 'Actor', 'Role', 'Action Type', 'Target Reference', 'Details'];
      rows = auditLogs.map(l => [
        l.id,
        `"${l.timestamp}"`,
        `"${l.actor}"`,
        `"${l.role}"`,
        l.actionType,
        `"${l.target}"`,
        `"${l.details}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Scholarship_MIS_Report_${selectedReport}_${sessionFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Report Command Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedReport('applications')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedReport === 'applications'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Departmental Applications Statement
          </button>
          <button
            onClick={() => setSelectedReport('schemes')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedReport === 'schemes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Scheme Quota & Award Utilization
          </button>
          <button
            onClick={() => setSelectedReport('funds')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedReport === 'funds'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sponsor Fund Allocation MIS
          </button>
          <button
            onClick={() => setSelectedReport('audit')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedReport === 'audit'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Statutory Audit Trail ({auditLogs.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 outline-none"
          >
            <option value="2026-2027">Session 2026–2027</option>
            <option value="2025-2026">Session 2025–2026</option>
          </select>

          <button
            onClick={handleExportReportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer size={13} /> Print Report
          </button>
        </div>
      </div>

      {/* Report 1: Departmental Intake & Sanction */}
      {selectedReport === 'applications' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-mono text-blue-300 block uppercase">
                Official Directorate MIS Report · Session {sessionFilter}
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Department-Wise Financial Aid Distribution & Intake Statement
              </h3>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded font-mono">
              CONFIDENTIAL · GOVERNING BODY
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Academic Department</th>
                  <th className="py-3 px-4">Total Applications</th>
                  <th className="py-3 px-4">Sanctioned Awards</th>
                  <th className="py-3 px-4">Selection Ratio</th>
                  <th className="py-3 px-4 text-right">Cumulative Grant Sanctioned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptReportList.map(dept => {
                  const ratio = Math.round((dept.approved / dept.totalApps) * 100) || 0;

                  return (
                    <tr key={dept.name} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {dept.name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {dept.totalApps} Applicants
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {dept.approved} Sanctions
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {ratio}% Success Rate
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                        ₹{dept.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Scheme Quota & Award Utilization */}
      {selectedReport === 'schemes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Scholarship Scheme Slot Utilization & Expenditure
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Comparing configured scheme quota limits against actual awarded beneficiaries.
            </p>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Scheme Title</th>
                  <th className="py-3 px-4">Scheme Category</th>
                  <th className="py-3 px-4">Available Quota</th>
                  <th className="py-3 px-4">Beneficiaries Selected</th>
                  <th className="py-3 px-4">Quota Saturation</th>
                  <th className="py-3 px-4 text-right">Committed Aid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemeReportList.map(sch => {
                  const sat = Math.round((sch.approved / sch.slots) * 100);

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sch.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{sch.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {sch.type}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-bold">
                        {sch.slots} Slots
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {sch.approved} Awarded
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          sat > 80 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sat}% Filled
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ₹{sch.totalSanctioned.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Funding Sources & Budget Allocation */}
      {selectedReport === 'funds' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Sponsor Funding Sources & Allocation Audit
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              State treasury, central ministry, and corporate endowment fund reconciliations.
            </p>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Funding Source & Ledger</th>
                  <th className="py-3 px-4">Sponsor Category</th>
                  <th className="py-3 px-4">Total Sanctioned Pool</th>
                  <th className="py-3 px-4">Award Commitments</th>
                  <th className="py-3 px-4">Actual Disbursed</th>
                  <th className="py-3 px-4 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fundingSources.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{f.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {f.category}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{f.totalAllocated.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">
                      ₹{f.committedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{f.disbursedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-blue-700">
                      ₹{f.remainingAllocation.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 4: Statutory Audit Trail Log */}
      {selectedReport === 'audit' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 block uppercase font-bold">
                Directorate Statutory Audit Ledger
              </span>
              <h3 className="font-bold text-sm text-white mt-0.5">
                Cryptographic Traceability of All Scholarship & Welfare Decisions
              </h3>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded font-mono">
              COMPLIANCE AUDITED
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Audit ID & Timestamp</th>
                  <th className="py-3 px-4">Authorized Actor & Role</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Target Reference</th>
                  <th className="py-3 px-4">Audit Remarks</th>
                  <th className="py-3 px-4 text-right">IP Subnet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono text-[11px]">{log.id}</div>
                      <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{log.actor}</div>
                      <div className="text-[10px] text-slate-500">{log.role}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {log.actionType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 text-xs">
                      {log.target}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-[220px] truncate" title={log.details}>
                      {log.details}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-400">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
