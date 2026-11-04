// Apna Campus ERP — Live Meal Verification & Biometric Terminal Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Fingerprint, ShieldCheck, AlertCircle, CheckCircle2, Clock, 
  RefreshCw, Radio, UserCheck, Utensils, X, Search, Sparkles
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenLiveVerificationSection({ showToast, account }) {
  const [dataVersion, setDataVersion] = useState(0);

  // Terminal State
  const [selectedTerminal, setSelectedTerminal] = useState('BIO-DEV-MESS-01');
  const [selectedMealType, setSelectedMealType] = useState('Lunch');
  const [studentInput, setStudentInput] = useState('2401432265');
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const devices = useMemo(() => canteenStore.getBiometricDevices(), [dataVersion]);
  const allHostellers = useMemo(() => canteenStore.getHostellers({}, 'admin'), [dataVersion]);
  const recentLogs = useMemo(() => canteenStore.getMealAttendance({ mealType: selectedMealType }), [selectedMealType, dataVersion]);

  // Current meal window detection
  const mealWindowInfo = useMemo(() => {
    switch (selectedMealType) {
      case 'Breakfast': return { window: '07:30 AM – 10:00 AM', status: 'IN PROGRESS' };
      case 'Lunch': return { window: '12:00 PM – 02:30 PM', status: 'IN PROGRESS' };
      case 'Evening Snacks': return { window: '05:00 PM – 06:30 PM', status: 'IN PROGRESS' };
      case 'Dinner': return { window: '07:30 PM – 10:00 PM', status: 'IN PROGRESS' };
      default: return { window: 'Active Window', status: 'IN PROGRESS' };
    }
  }, [selectedMealType]);

  const handleSimulateScan = () => {
    if (!studentInput) {
      showToast?.('Please enter or select a Student ID / Roll Number', 'error');
      return;
    }

    setIsScanning(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const res = canteenStore.verifyEnterpriseMealAccess({
        studentId: studentInput,
        mealType: selectedMealType,
        terminalId: selectedTerminal
      }, account?.name || 'Mess Entry Bay Scanner');

      setVerificationResult(res);

      if (res.success) {
        showToast?.(`Identity Verified: ${res.student.name} granted ${selectedMealType}!`, 'success');
      } else if (res.code === 'DUPLICATE_CLAIM') {
        showToast?.(res.message, 'error');
      } else {
        showToast?.(res.message, 'warning');
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Verification Terminal
              </span>
              <span className="text-slate-400 text-xs">MorphoWave & SecuGen Optical Interface</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Biometric Access Scanner Bay
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Zero-latency fingerprint verification. Automated duplicate claim prevention and subscription eligibility validation.
            </p>
          </div>

          {/* Terminal & Window Selectors */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-xl">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Terminal</label>
              <select
                value={selectedTerminal}
                onChange={e => setSelectedTerminal(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-900 text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.terminalName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Service Window</label>
              <select
                value={selectedMealType}
                onChange={e => setSelectedMealType(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-900 text-slate-200 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Breakfast">Breakfast (07:30 - 10:00)</option>
                <option value="Lunch">Lunch (12:00 - 14:30)</option>
                <option value="Evening Snacks">Evening Snacks (17:00 - 18:30)</option>
                <option value="Dinner">Dinner (19:30 - 22:00)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Scanner Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scanner Box */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Optical Sensor Simulation (DEMO)
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                {selectedMealType}
              </span>
            </div>

            {/* Quick Student Selector */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student / Enter Roll / ID
                </label>
                <div className="flex gap-2">
                  <select
                    value={studentInput}
                    onChange={e => setStudentInput(e.target.value)}
                    className="flex-1 py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Hosteller --</option>
                    {allHostellers.map(h => (
                      <option key={h.studentId} value={h.studentId}>
                        {h.name} ({h.rollNumber}) — {h.hostelName} (Room {h.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sensor Pad Box */}
              <div 
                onClick={!isScanning ? handleSimulateScan : undefined}
                className={`cursor-pointer rounded-2xl p-8 border-2 border-dashed flex flex-col items-center justify-center text-center transition ${
                  isScanning
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition transform ${
                  isScanning
                    ? 'bg-indigo-600 text-white scale-110 animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <Fingerprint className="w-10 h-10" />
                </div>
                <div className="mt-4 font-bold text-slate-900 dark:text-white text-sm">
                  {isScanning ? 'Verifying Optical Fingerprint Signature...' : 'Click to Simulate Biometric Touch (DEMO)'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  MorphoWave touchless scanner interface. Reads minutiae points in &lt; 0.7s.
                </p>
              </div>

              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" /> Trigger Verification Scan
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex items-center justify-between">
            <span>Terminal: {selectedTerminal}</span>
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sensor Calibrated
            </span>
          </div>
        </div>

        {/* Right Column: Verification Result Display & Details */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Real-Time Scanner Outcome
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {new Date().toLocaleTimeString()}
              </span>
            </div>

            {verificationResult ? (
              <div className="mt-6 space-y-5">
                {/* Status Alert Banner */}
                {verificationResult.success ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                        MEAL ACCESS GRANTED
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {verificationResult.message}
                      </div>
                    </div>
                  </div>
                ) : verificationResult.code === 'DUPLICATE_CLAIM' ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                        DUPLICATE MEAL CLAIM BLOCKED
                      </div>
                      <div className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                        {verificationResult.message}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                        ACCESS DENIED
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                        {verificationResult.message}
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Verified Dossier Card */}
                {verificationResult.student && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={verificationResult.student.photo}
                        alt={verificationResult.student.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 shadow-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          {verificationResult.student.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Roll: {verificationResult.student.rollNumber} • ID: {verificationResult.student.studentId}
                        </div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                          {verificationResult.student.department}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200 dark:border-slate-700/60">
                      <div>
                        <span className="text-slate-400">Hostel & Room:</span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {verificationResult.student.hostelName} / {verificationResult.student.roomNumber}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Entitled Meal Plan:</span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {verificationResult.student.mealPlan}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Biometric Reference:</span>
                        <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {verificationResult.student.biometricId}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Mess Fee Status:</span>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {verificationResult.student.messFee.paymentStatus} (Cleared)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <div className="text-sm font-semibold">Terminal Ready for Scan</div>
                <p className="text-xs max-w-sm mx-auto">
                  Select student and trigger fingerprint verification on the left panel to test live verification.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex items-center justify-between">
            <span>Terminal Security Check: Active</span>
            <span>Prevents duplicate claims per meal</span>
          </div>
        </div>
      </div>

      {/* Stream of Today's Verifications */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" /> Today's Live Attendance Stream ({recentLogs.length} Scans)
          </h3>
          <span className="text-xs text-slate-400">Filtered by {selectedMealType}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Roll / ID</th>
                <th className="py-2.5 px-3">Hostel & Room</th>
                <th className="py-2.5 px-3">Biometric Ref</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {recentLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                  <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">{log.verificationTime}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{log.studentName}</td>
                  <td className="py-2 px-3 font-mono text-slate-500">{log.registrationNumber}</td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{log.hostel} ({log.roomNumber})</td>
                  <td className="py-2 px-3 font-mono text-indigo-600 dark:text-indigo-400">{log.biometricId}</td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{log.verificationMethod}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {log.attendanceStatus}
                    </span>
                  </td>
                </tr>
              ))}

              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No scans registered for this meal period yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

