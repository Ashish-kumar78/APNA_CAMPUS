import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Calendar,
  Layers,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  FileText,
  Sliders,
  Users,
  AlertTriangle,
  Lock,
  Building
} from 'lucide-react';

export default function ScholarshipSettingsTab({
  onResetDemoData,
  onAddAuditLog
}) {
  const [activeSection, setActiveSection] = useState('academic_year'); // 'academic_year' | 'criteria' | 'workflows' | 'roles'
  const [saveToast, setSaveToast] = useState(false);

  // Settings form states
  const [academicSession, setAcademicSession] = useState('2026-2027');
  const [autumnCycleStatus, setAutumnCycleStatus] = useState('Active');
  const [springCycleStatus, setSpringCycleStatus] = useState('Scheduled');

  const [minAttendance, setMinAttendance] = useState('75');
  const [defaultIncomeCeiling, setDefaultIncomeCeiling] = useState('250000');
  const [meritWeight, setMeritWeight] = useState('60');
  const [needWeight, setNeedWeight] = useState('25');
  const [conductWeight, setConductWeight] = useState('15');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);

    onAddAuditLog({
      actionType: 'SETTINGS_CONFIG_UPDATED',
      target: 'DIRECTORATE_POLICY_PARAMETERS',
      details: `Academic Session: ${academicSession}, Attendance: ${minAttendance}%, Merit Weight: ${meritWeight}%.`
    });
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Settings Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('academic_year')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeSection === 'academic_year'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Academic Session & Windows
          </button>
          <button
            onClick={() => setActiveSection('criteria')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeSection === 'criteria'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Eligibility & Merit Weights
          </button>
          <button
            onClick={() => setActiveSection('workflows')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeSection === 'workflows'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Review Stages & Workflows
          </button>
          <button
            onClick={() => setActiveSection('roles')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeSection === 'roles'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Role Demonstration Matrix
          </button>
        </div>

        <button
          onClick={onResetDemoData}
          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
        >
          <RotateCcw size={13} /> Reset Demo Data
        </button>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Settings parameters successfully updated and persisted to local demonstration cache.
        </div>
      )}

      {/* Section 1: Academic Session & Application Windows */}
      {activeSection === 'academic_year' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Academic Year & Active Financial Aid Cycles</h4>
            <p className="text-slate-500">Configure institutional application opening windows and fiscal year bindings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Active Academic Session</label>
              <select
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
              >
                <option value="2026-2027">2026–2027 (Current Active Cycle)</option>
                <option value="2027-2028">2027–2028 (Upcoming Session Planning)</option>
                <option value="2025-2026">2025–2026 (Archived Session)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Autumn 2026 Cycle Status</label>
              <select
                value={autumnCycleStatus}
                onChange={(e) => setAutumnCycleStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              >
                <option value="Active">Active (Intake Open)</option>
                <option value="Closing Soon">Closing Soon (Final Week)</option>
                <option value="Closed">Closed (Evaluation Only)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="font-bold text-slate-800 block">Configured Application Windows:</span>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Government Scholarships (PRERANA / NSP):</span>
              <strong className="text-slate-900">01 Aug 2026 – 30 Nov 2026</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-600">Chairman Endowment Fellowship:</span>
              <strong className="text-slate-900">01 Sep 2026 – 20 Nov 2026</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600">Tata Trust Women in Tech CSR:</span>
              <strong className="text-slate-900">01 Aug 2026 – 05 Nov 2026</strong>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save size={14} /> Save Session Settings
            </button>
          </div>
        </form>
      )}

      {/* Section 2: Eligibility & Merit Weights */}
      {activeSection === 'criteria' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Autonomous Eligibility Rules & Multi-Factor Scoring</h4>
            <p className="text-slate-500">Tune regulatory parameters used by the ranking engine and screening desk.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Minimum Biometric Attendance Cutoff (%)</label>
              <input
                type="number"
                value={minAttendance}
                onChange={(e) => setMinAttendance(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Campus RFID gate pass & smart classroom tracker.</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Standard Need-Based Income Ceiling (₹/Year)</label>
              <input
                type="number"
                value={defaultIncomeCeiling}
                onChange={(e) => setDefaultIncomeCeiling(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default threshold when scheme doesn't specify otherwise.</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
            <span className="font-bold text-slate-800 block">Ranking Formula Weights (Must total 100%):</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Academic CGPA Weight</label>
                <input
                  type="number"
                  value={meritWeight}
                  onChange={(e) => setMeritWeight(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Economic Need Weight</label>
                <input
                  type="number"
                  value={needWeight}
                  onChange={(e) => setNeedWeight(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Conduct & Attendance</label>
                <input
                  type="number"
                  value={conductWeight}
                  onChange={(e) => setConductWeight(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-bold"
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              Total Weight: <strong className="text-blue-600">{Number(meritWeight) + Number(needWeight) + Number(conductWeight)}%</strong>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save size={14} /> Update Scoring Rules
            </button>
          </div>
        </form>
      )}

      {/* Section 3: Review Stages & Workflows */}
      {activeSection === 'workflows' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Configured Multi-Stage Review Pipeline</h4>
            <p className="text-slate-500">Sequential approval hurdles ensuring compliance before grant release.</p>
          </div>

          <div className="space-y-3">
            {[
              { stage: '1. Online Registration', actor: 'Applicant Student', desc: 'Submission of application form, income affidavit, and marks transcripts.' },
              { stage: '2. Document Verification Desk', actor: 'Mr. P. C. Behera', desc: 'Validating barcode digital signatures with state revenue and examination cell.' },
              { stage: '3. Welfare Coordinator Review', actor: 'Prof. K. N. Sahoo', desc: 'Departmental shortlisting and merit ranking index computation.' },
              { stage: '4. Executive Committee Sanction', actor: 'Dr. M. K. Mohapatra', desc: 'Directorate sign-off, quota allotment, and generation of formal award letter.' },
              { stage: '5. Accounts DBT Release', actor: 'Accounts & Bursar Directorate', desc: 'Direct benefit transfer or tuition invoice fee offset reconciliation.' }
            ].map((step, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block text-xs">{step.stage}</strong>
                  <span className="text-slate-500 text-[11px]">{step.desc}</span>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded">
                  {step.actor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Role Demonstration Matrix */}
      {activeSection === 'roles' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Role-Based Access Demonstration Matrix</h4>
            <p className="text-slate-500">Privilege scopes configured for different officers in the financial aid cell.</p>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Role Profile</th>
                <th className="py-2.5 px-3">Scheme Setup</th>
                <th className="py-2.5 px-3">Doc Verification</th>
                <th className="py-2.5 px-3">Committee Sign</th>
                <th className="py-2.5 px-3">Disbursements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Scholarship Officer / Director</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">Full Access</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">Executive Veto</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">Full Sanction</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Verification Officer (Mr. Behera)</td>
                <td className="py-3 px-3 text-slate-400">View Only</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">Primary Stamp</td>
                <td className="py-3 px-3 text-slate-400">View Only</td>
                <td className="py-3 px-3 text-slate-400">None</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">Welfare Coordinator (Prof. Sahoo)</td>
                <td className="py-3 px-3 text-slate-400">View Only</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">Review Desk</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">Shortlist Vote</td>
                <td className="py-3 px-3 text-slate-400">View Only</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
