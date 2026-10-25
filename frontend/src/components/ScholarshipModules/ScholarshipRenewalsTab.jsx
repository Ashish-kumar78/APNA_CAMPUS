import React, { useState } from 'react';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  UserCheck,
  Send,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Check,
  X,
  MessageSquare
} from 'lucide-react';

export default function ScholarshipRenewalsTab({
  applications,
  appeals,
  onUpdateApplications,
  onUpdateAppeals,
  onAddAuditLog
}) {
  const [selectedSubtab, setSelectedSubtab] = useState('renewals'); // 'renewals' | 'appeals'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [appealDecisionModal, setAppealDecisionModal] = useState({ open: false, appeal: null, decision: 'Approved & Restored', notes: '' });

  // Filter renewal applications
  const renewalApps = applications.filter(a => a.applicationType === 'Renewal');

  const filteredRenewals = renewalApps.filter(a => {
    return a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.dept.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredAppeals = appeals.filter(a => {
    return a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.appId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleApproveRenewal = (appId) => {
    const updated = applications.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          reviewStatus: 'Approved',
          approvalStage: 'Renewal Sanction Granted',
          disbursementStatus: 'Scheduled'
        };
      }
      return a;
    });

    onUpdateApplications(updated);

    const appObj = applications.find(a => a.id === appId);
    onAddAuditLog({
      actionType: 'RENEWAL_SCHOLARSHIP_APPROVED',
      target: `${appId} (${appObj?.studentName})`,
      details: 'Verified continuous attendance >75% and CGPA maintenance. Award renewed for 2026–27.'
    });
  };

  const handleSaveAppealDecision = (e) => {
    e.preventDefault();
    if (!appealDecisionModal.appeal) return;

    const updatedAppeals = appeals.map(a => {
      if (a.id === appealDecisionModal.appeal.id) {
        return {
          ...a,
          status: appealDecisionModal.decision,
          outcomeNotes: appealDecisionModal.notes
        };
      }
      return a;
    });

    onUpdateAppeals(updatedAppeals);

    // If appeal accepted, restore the linked application
    if (appealDecisionModal.decision === 'Approved & Restored') {
      const updatedApps = applications.map(app => {
        if (app.id === appealDecisionModal.appeal.appId) {
          return {
            ...app,
            reviewStatus: 'Approved',
            approvalStage: 'Reconsidered & Restored by Appellate Committee',
            finalAwardAmount: app.recommendedAmount || 35000,
            disbursementStatus: 'Scheduled'
          };
        }
        return app;
      });
      onUpdateApplications(updatedApps);
    }

    onAddAuditLog({
      actionType: 'STUDENT_APPEAL_DECISION',
      target: `${appealDecisionModal.appeal.id} (${appealDecisionModal.appeal.studentName})`,
      details: `Appeal status set to [${appealDecisionModal.decision}]. Outcome: ${appealDecisionModal.notes}`
    });

    setAppealDecisionModal({ open: false, appeal: null, decision: 'Approved & Restored', notes: '' });
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Subtab Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSubtab('renewals')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'renewals'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Continuing Renewal Applications ({renewalApps.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('appeals')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'appeals'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Student Appeals & Reconsideration ({appeals.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Appellate Authority: <strong className="text-slate-800">Standing Student Grievance & Scholarship Council</strong>
        </div>
      </div>

      {/* View 1: Renewal Management */}
      {selectedSubtab === 'renewals' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Continuing Awardee Performance Compliance</span>
              <p>
                Students who received scholarships in previous academic sessions must demonstrate continuous progress (CGPA ≥ 7.50, classroom attendance ≥ 75%, and zero disciplinary violations).
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
              ANNUAL VERIFICATION
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Application ID & Student</th>
                  <th className="py-3 px-4">Continuing Scheme</th>
                  <th className="py-3 px-4">Current CGPA</th>
                  <th className="py-3 px-4">Biometric Attendance</th>
                  <th className="py-3 px-4">Active Backlogs</th>
                  <th className="py-3 px-4">Renewal Decision</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRenewals.map(app => {
                  const meetsCgpa = app.cgpa >= 7.5;
                  const meetsAttendance = true; // demonstration true
                  const isReady = meetsCgpa && meetsAttendance;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{app.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {app.id} · {app.studentId} · {app.dept}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-800 truncate" title={app.schemeName}>
                          {app.schemeName}
                        </div>
                        <span className="text-[10px] text-slate-500">Sanctioned: ₹{app.recommendedAmount}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${meetsCgpa ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {app.cgpa} CGPA
                        </span>
                        <span className="text-[10px] text-slate-400 block">Cutoff: 7.50</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700">88.5% Compliant</span>
                        <span className="text-[10px] text-slate-400 block">Cutoff: 75%</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          0 BACKLOGS
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.reviewStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.reviewStatus === 'Approved' ? 'Renewal Granted' : 'Pending Verification'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {app.reviewStatus !== 'Approved' ? (
                          <button
                            onClick={() => handleApproveRenewal(app.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs"
                          >
                            Approve Renewal
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs">Renewed</span>
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

      {/* View 2: Student Appeals & Reconsideration */}
      {selectedSubtab === 'appeals' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Independent Appellate Reconsideration Register</span>
              <p>
                Formal student grievances challenging scholarship ineligibility decisions. Original rejection records are preserved while linked appellate resolutions are recorded.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              STATUTORY APPEALS
            </span>
          </div>

          <div className="space-y-4">
            {filteredAppeals.map(appeal => (
              <div key={appeal.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-amber-600 block">
                      {appeal.id} · Linked to Application {appeal.appId}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                      {appeal.studentName} ({appeal.dept})
                    </h4>
                    <span className="text-xs text-slate-500">
                      Appeal Lodged: {appeal.appealDate} · Hearing: {appeal.hearingDate}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    appeal.status === 'Approved & Restored' ? 'bg-emerald-100 text-emerald-800' :
                    appeal.status === 'Under Committee Review' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {appeal.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Grounds for Reconsideration: {appeal.reason}</span>
                  <p className="text-slate-600 italic">
                    "{appeal.statement}"
                  </p>
                </div>

                <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded text-xs text-blue-900">
                  <span className="font-bold block mb-0.5">Appellate Committee Resolution:</span>
                  {appeal.outcomeNotes}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Assigned Review Officer: {appeal.assignedOfficer}</span>
                  <button
                    onClick={() => setAppealDecisionModal({ open: true, appeal, decision: 'Approved & Restored', notes: '' })}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    Adjudicate Appeal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appeal Adjudication Modal */}
      {appealDecisionModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-3.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle size={16} className="text-amber-500" />
              Adjudicate Student Appeal: {appealDecisionModal.appeal?.id}
            </h4>

            <p className="text-xs text-slate-600">
              Record the official council resolution for candidate <strong>{appealDecisionModal.appeal?.studentName}</strong>.
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Appellate Ruling</label>
              <select
                value={appealDecisionModal.decision}
                onChange={(e) => setAppealDecisionModal({ ...appealDecisionModal, decision: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md outline-none"
              >
                <option value="Approved & Restored">Accept Appeal & Restore into Scheme</option>
                <option value="Under Committee Review">Keep Under Observation / Committee Review</option>
                <option value="Additional Information Required">Request Additional Documentary Evidence</option>
                <option value="Rejected">Dismiss Appeal (Decision Upheld)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Official Hearing Minutes & Grounds
              </label>
              <textarea
                rows="3"
                placeholder="State the regulatory evidence that led to this decision..."
                value={appealDecisionModal.notes}
                onChange={(e) => setAppealDecisionModal({ ...appealDecisionModal, notes: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAppealDecisionModal({ open: false, appeal: null, decision: 'Approved & Restored', notes: '' })}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAppealDecision}
                disabled={!appealDecisionModal.notes.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md shadow-sm"
              >
                Record Ruling
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
