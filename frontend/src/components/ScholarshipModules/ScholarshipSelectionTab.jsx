import React, { useState } from 'react';
import {
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Eye,
  Search,
  Filter,
  FileText,
  ShieldCheck,
  TrendingUp,
  Download,
  Check,
  X,
  AlertTriangle,
  Building,
  GraduationCap
} from 'lucide-react';

export default function ScholarshipSelectionTab({
  applications,
  schemes,
  onUpdateApplications,
  onAddAuditLog
}) {
  const [selectedSubtab, setSelectedSubtab] = useState('ranking'); // 'ranking' | 'committee' | 'letters'
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState('All');
  const [awardLetterApp, setAwardLetterApp] = useState(null);

  // Merit Scoring Logic for Applications
  // Score = (CGPA * 10 * 0.60) + ((300000 - Income) / 10000 * 0.25) + 15
  const scoredApplications = applications
    .filter(a => selectedSchemeFilter === 'All' ? true : a.schemeId === selectedSchemeFilter)
    .map(app => {
      const academicScore = Math.min(60, (app.cgpa / 10) * 60);
      const incomeNeedScore = Math.max(0, Math.min(25, ((300000 - Math.min(app.annualFamilyIncome, 300000)) / 300000) * 25));
      const conductScore = 15; // standard conduct & attendance credit
      const compositeScore = Number((academicScore + incomeNeedScore + conductScore).toFixed(1));

      return {
        ...app,
        compositeScore,
        academicScore: Number(academicScore.toFixed(1)),
        incomeNeedScore: Number(incomeNeedScore.toFixed(1)),
        conductScore
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const handleApproveInQueue = (appId) => {
    const updated = applications.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          reviewStatus: 'Approved',
          approvalStage: 'Final Executive Sanction Granted',
          finalAwardAmount: a.recommendedAmount || a.finalAwardAmount,
          disbursementStatus: 'Scheduled'
        };
      }
      return a;
    });

    onUpdateApplications(updated);

    const appObj = applications.find(a => a.id === appId);
    onAddAuditLog({
      actionType: 'COMMITTEE_AWARD_SANCTIONED',
      target: `${appId} (${appObj?.studentName})`,
      details: `Executive committee sanctioned grant of ₹${appObj?.recommendedAmount} under ${appObj?.schemeName}.`
    });
  };

  const handlePrintLetter = () => {
    window.print();
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Subtab Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSubtab('ranking')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'ranking'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Merit Ranking Console ({scoredApplications.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('committee')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'committee'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Committee Approval Queue ({applications.filter(a => a.reviewStatus !== 'Approved' && a.reviewStatus !== 'Rejected').length})
          </button>
          <button
            onClick={() => setSelectedSubtab('letters')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'letters'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Award Letter Management ({applications.filter(a => a.reviewStatus === 'Approved').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Scheme Filter:</span>
          <select
            value={selectedSchemeFilter}
            onChange={(e) => setSelectedSchemeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 outline-none"
          >
            <option value="All">All Schemes</option>
            {schemes.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* View 1: Merit Ranking Console */}
      {selectedSubtab === 'ranking' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-sm flex items-center gap-2 text-blue-300">
                <TrendingUp size={16} /> Multi-Factor Autonomous Merit Ranking Index
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Composite Score: 60% Academic CGPA + 25% Economic Need Factor + 15% Continuous Institutional Conduct.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase font-mono">Rank Evaluation Cycle</span>
              <strong className="text-amber-300 text-sm">Autumn 2026 Batch</strong>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Rank #</th>
                  <th className="py-3 px-4">Student & Department</th>
                  <th className="py-3 px-4">Scheme Applied</th>
                  <th className="py-3 px-4">Academic (60%)</th>
                  <th className="py-3 px-4">Need (25%)</th>
                  <th className="py-3 px-4">Composite Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scoredApplications.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: {app.studentId} · {app.dept}</div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate" title={app.schemeName}>
                        {app.schemeName}
                      </div>
                      <div className="text-[10px] text-slate-500">{app.category}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{app.academicScore} pts</span>
                      <span className="text-[10px] text-slate-400 block">({app.cgpa} CGPA)</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{app.incomeNeedScore} pts</span>
                      <span className="text-[10px] text-slate-400 block">₹{(app.annualFamilyIncome / 100000).toFixed(1)}L Income</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-blue-700 text-sm">
                        {app.compositeScore} / 100
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.reviewStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        app.reviewStatus === 'Waitlisted' ? 'bg-amber-100 text-amber-800' :
                        app.reviewStatus === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {app.reviewStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {app.reviewStatus !== 'Approved' && (
                        <button
                          onClick={() => handleApproveInQueue(app.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                        >
                          Sanction
                        </button>
                      )}
                      {app.reviewStatus === 'Approved' && (
                        <button
                          onClick={() => setAwardLetterApp(app)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] flex items-center gap-1 ml-auto"
                        >
                          <Printer size={12} /> Letter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Committee Approval Queue */}
      {selectedSubtab === 'committee' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-900 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Standing Scholarship Committee Review Queue</span>
              <p>
                Applications shortlisted by Welfare Coordinators awaiting final executive approval from Chief Scholarship Officer & Principal.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
              3 VOTES NEEDED
            </span>
          </div>

          <div className="space-y-3">
            {applications.filter(a => a.reviewStatus !== 'Approved' && a.reviewStatus !== 'Rejected').map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-600 block">{app.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{app.studentName} — {app.dept}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Scheme: {app.schemeName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Recommended Grant</span>
                    <strong className="text-slate-900 text-sm font-extrabold">₹{app.recommendedAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Academic CGPA</span>
                    <strong className="text-slate-800">{app.cgpa} CGPA</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Declared Family Income</span>
                    <strong className="text-slate-800">₹{app.annualFamilyIncome.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Document Verification</span>
                    <strong className="text-emerald-700">{app.verificationStatus}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded border border-amber-100">
                  <span className="font-bold text-amber-900">Coordinator Remarks: </span>
                  {app.reviewerRemarks || 'Candidate meets academic cut-off with verified documents.'}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleApproveInQueue(app.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Grant Executive Approval
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Award Letter Management */}
      {selectedSubtab === 'letters' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Official Award Sanction Registry</span>
              <p>
                Approved scholarship recipients with formal institutional award letters dispatched or ready for printing.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
              SEAL REGISTERED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.filter(a => a.reviewStatus === 'Approved').map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      SANCTIONED
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{app.finalAwardAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{app.studentName}</h4>
                  <p className="text-xs text-slate-500 font-mono">ID: {app.studentId} · {app.dept}</p>

                  <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-semibold block text-slate-700">{app.schemeName}</span>
                    <span className="text-[11px] text-slate-400">Award Ref: AWD-2026-{app.id.slice(-3)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Autumn 2026 Cycle</span>
                  <button
                    onClick={() => setAwardLetterApp(app)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer size={13} /> Print Letter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Award Letter Modal */}
      {awardLetterApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Official Institutional Award Letter Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintLetter}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded flex items-center gap-1"
                >
                  <Printer size={13} /> Print Official Letter
                </button>
                <button
                  onClick={() => setAwardLetterApp(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Letterhead Document Body */}
            <div className="p-8 text-slate-900 bg-white overflow-y-auto space-y-6 text-xs printable-certificate font-serif">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-lg font-black tracking-wide uppercase text-slate-900">
                  APNA CAMPUS AUTONOMOUS ENGINEERING COLLEGE
                </h2>
                <p className="text-[11px] text-slate-600 font-sans">
                  Approved by AICTE · Permanently Affiliated to BPUT · Accredited 'A+' Grade by NAAC
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  Directorate of Student Welfare & Financial Aid Cell · Academic Block 1
                </p>
              </div>

              {/* Sanction Meta */}
              <div className="flex justify-between items-center text-slate-700 font-sans text-xs">
                <div>
                  <strong>Ref No:</strong> AC/SW/SCH/2026/AWD-{awardLetterApp.id.slice(-3)}
                </div>
                <div>
                  <strong>Date of Sanction:</strong> 24 October 2026
                </div>
              </div>

              {/* Subject */}
              <div className="font-sans font-bold text-sm text-slate-900 border-l-4 border-blue-600 pl-3 py-1">
                SUBJECT: OFFICIAL SANCTION LETTER FOR {awardLetterApp.schemeName.toUpperCase()}
              </div>

              {/* Salutation & Body */}
              <div className="space-y-3 leading-relaxed text-[13px] text-slate-800">
                <p>
                  To,<br />
                  <strong>Mr./Ms. {awardLetterApp.studentName}</strong> (Student Registration ID: {awardLetterApp.studentId})<br />
                  Department of {awardLetterApp.dept}, {awardLetterApp.semester}
                </p>

                <p>
                  Dear Student,
                </p>

                <p>
                  We are pleased to formally communicate that on the recommendation of the Standing Scholarship Committee, the Competent Authority has sanctioned a scholarship grant under the <strong>{awardLetterApp.schemeName}</strong> for the Academic Session 2026–2027.
                </p>

                <div className="my-4 p-4 border border-slate-300 bg-slate-50 font-sans text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Sanctioned Grant Amount:</span>
                    <strong className="text-slate-900 text-sm">₹{awardLetterApp.finalAwardAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Disbursement Mode:</span>
                    <span className="font-semibold text-slate-800">Direct Bank Credit / Fee Invoice Adjustment</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Installment Schedule:</span>
                    <span className="font-semibold text-slate-800">Tranche 1 (50%) Autumn + Tranche 2 (50%) Spring</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  <strong>Conditions of Continuance:</strong> The recipient must maintain continuous minimum academic performance (≥ 7.50 CGPA), observe zero active backlogs, and comply with the mandatory 75% classroom attendance norm. Failure to meet these milestones will result in forfeiture of subsequent tranches.
                </p>

                <p>
                  We congratulate you on your academic achievements and wish you continued excellence in your technical education.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end font-sans text-xs">
                <div className="text-center">
                  <div className="h-10 flex items-center justify-center font-serif italic text-slate-400">
                    [Office Digital Seal]
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    Accounts & Bursar Directorate
                  </div>
                  <div className="text-[10px] text-slate-500">Apna Campus College</div>
                </div>

                <div className="text-center">
                  <div className="h-10 flex items-center justify-center font-serif italic text-blue-900 font-bold">
                    Dr. M. K. Mohapatra
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    Director of Student Welfare
                  </div>
                  <div className="text-[10px] text-slate-500">Chief Scholarship Officer</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                onClick={() => setAwardLetterApp(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={handlePrintLetter}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer size={14} /> Print Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
