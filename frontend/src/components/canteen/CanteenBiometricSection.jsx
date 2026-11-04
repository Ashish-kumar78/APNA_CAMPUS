// Apna Campus ERP — Biometric Registration & Device Management Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Fingerprint, Search, Plus, CheckCircle2, 
  AlertTriangle, RefreshCw, X, Radio, Eye, Lock, Smartphone,
  Activity, Sliders, History, Ban, Check
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenBiometricSection({ showToast, account }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('mappings'); // mappings, devices, audit_log
  
  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regStudentId, setRegStudentId] = useState('');
  const [regBiometricId, setRegBiometricId] = useState('');
  const [regDeviceId, setRegDeviceId] = useState('BIO-DEV-MESS-01');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  // Manual Override Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualMealType, setManualMealType] = useState('Lunch');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const biometricStudents = useMemo(() => {
    return canteenStore.getBiometricStudents(search);
  }, [search, dataVersion]);

  const devices = useMemo(() => {
    return canteenStore.getBiometricDevices();
  }, [dataVersion]);

  const auditLogs = useMemo(() => {
    return canteenStore.getAuditLogs(search);
  }, [search, dataVersion]);

  const allHostellers = useMemo(() => {
    return canteenStore.getHostellers({}, 'admin');
  }, [dataVersion]);

  // Handle Register Biometric
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regStudentId || !regBiometricId) {
      showToast?.('Please specify both Student and Biometric Reference ID.', 'error');
      return;
    }

    const res = canteenStore.registerBiometric({
      studentId: regStudentId,
      biometricId: regBiometricId,
      deviceId: regDeviceId
    }, account?.name || 'Biometric Supervisor');

    if (res.success) {
      showToast?.(res.message, 'success');
      setIsRegisterModalOpen(false);
      setRegStudentId('');
      setRegBiometricId('');
    } else {
      showToast?.(res.message, 'error');
    }
  };

  // Simulate DEMO Fingerprint Capture
  const handleSimulateDemoCapture = () => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      const generatedRef = `BIO-FP-${Math.floor(10000 + Math.random() * 90000)}`;
      setRegBiometricId(generatedRef);
      setIsSimulatingScan(false);
      showToast?.(`DEMO Simulator: Captured optical fingerprint template signature -> Reference ${generatedRef}`, 'success');
    }, 800);
  };

  // Handle Manual Verification Override
  const handleManualOverrideSubmit = (e) => {
    e.preventDefault();
    if (!manualStudentId || !manualReason) {
      showToast?.('Student ID and mandatory supervisor justification are required.', 'error');
      return;
    }

    const res = canteenStore.verifyEnterpriseMealAccess({
      studentId: manualStudentId,
      mealType: manualMealType,
      terminalId: 'BIO-DEV-MESS-01',
      isManual: true,
      manualReason
    }, account?.name || 'Chief Warden / Canteen In-Charge');

    if (res.success) {
      showToast?.(`Authorized Manual Entry Approved: ${res.student.name} granted ${manualMealType}!`, 'success');
      setIsManualModalOpen(false);
      setManualStudentId('');
      setManualReason('');
    } else {
      showToast?.(res.message, 'error');
    }
  };

  const handleToggleStatus = (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    const res = canteenStore.toggleBiometricStatus(studentId, nextStatus, account?.name || 'Supervisor');
    if (res.success) {
      showToast?.(res.message, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Security Guidelines */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5" /> Hardware Device & Reference Registry
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                Simulation DEMO Enabled
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Biometric ID Management & Hardware Terminals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Unique biometric reference mapping. Raw biometric templates are never stored in plain tables in compliance with data privacy mandates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Sliders className="w-4 h-4" /> Authorized Manual Override
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Register Biometric Reference
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex border-b border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('mappings')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'mappings'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" /> Student Biometric Mappings ({biometricStudents.length})
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'devices'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" /> Hardware Terminals ({devices.length})
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'audit_log'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> Security & Verification Audit Log
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, biometric ID, device, or audit action..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tab 1: Student Biometric Mappings */}
      {activeTab === 'mappings' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Biometric ID Reference</th>
                  <th className="py-3 px-4">Student Name & Photo</th>
                  <th className="py-3 px-4">Hostel Allocation</th>
                  <th className="py-3 px-4">Primary Hardware Terminal</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4">Last Verification</th>
                  <th className="py-3 px-4 text-center">Toggle Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {biometricStudents.map(mapping => (
                  <tr key={mapping.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                    {/* Biometric ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {mapping.biometricId}
                          </div>
                          <div className="text-[10px] text-slate-400">Reg: {mapping.registeredAt?.slice(0, 10)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={mapping.photo}
                          alt={mapping.studentName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{mapping.studentName}</div>
                          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            ID: {mapping.studentId} • Reg: {mapping.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Hostel Allocation */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{mapping.hostelName}</div>
                      <div className="text-slate-500 dark:text-slate-400">Room {mapping.roomNumber}</div>
                    </td>

                    {/* Device ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-slate-700 dark:text-slate-300">{mapping.deviceId}</div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {mapping.deviceConnectionStatus}
                      </div>
                    </td>

                    {/* Registration Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        mapping.registrationStatus === 'Active'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                      }`}>
                        {mapping.registrationStatus}
                      </span>
                    </td>

                    {/* Last Verification */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{mapping.lastVerification || 'Pending First Scan'}</div>
                      <div className="text-[10px] text-slate-400">{mapping.lastTerminal || 'N/A'}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(mapping.studentId, mapping.registrationStatus)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          mapping.registrationStatus === 'Active'
                            ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'
                        }`}
                      >
                        {mapping.registrationStatus === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Hardware Terminals */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(dev => (
            <div key={dev.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{dev.deviceId}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{dev.terminalName}</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {dev.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">{dev.location}</p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400">IP:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{dev.ipAddress}</span>
                </div>
                <div>
                  <span className="text-slate-400">MAC:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{dev.macAddress}</span>
                </div>
                <div>
                  <span className="text-slate-400">Firmware:</span> <span className="text-slate-700 dark:text-slate-300">{dev.firmwareVersion}</span>
                </div>
                <div>
                  <span className="text-slate-400">Today's Scans:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400">{dev.totalScansToday}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Heartbeat: Just now</span>
                <button
                  onClick={() => {
                    canteenStore.triggerDeviceSync(dev.deviceId);
                    showToast?.(`Sync signal dispatched to ${dev.terminalName}. All local logs cleared.`, 'success');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Sync Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Security & Verification Audit Log */}
      {activeTab === 'audit_log' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">{log.action}</span>
                    <span className="text-slate-400">• Actor: <strong className="text-indigo-600 dark:text-indigo-400">{log.actor}</strong> ({log.actorRole})</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 mt-1">{log.details}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Target Student ID / Reference: {log.target}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No security audit events recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register Biometric Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Register Biometric Reference</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Link student record to unique scanner reference</p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
                <select
                  value={regStudentId}
                  onChange={e => setRegStudentId(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Hosteller Student --</option>
                  {allHostellers.map(h => (
                    <option key={h.studentId} value={h.studentId}>
                      {h.name} ({h.rollNumber} • {h.studentId}) — {h.hostelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biometric Reference ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. BIO-FP-19181"
                    value={regBiometricId}
                    onChange={e => setRegBiometricId(e.target.value)}
                    className="flex-1 py-2 px-3 font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSimulateDemoCapture}
                    disabled={isSimulatingScan}
                    className="py-2 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
                  >
                    {isSimulatingScan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
                    Capture (DEMO)
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Unique reference identifier supplied by MorphoWave or SecuGen hardware API.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Enrollment Terminal</label>
                <select
                  value={regDeviceId}
                  onChange={e => setRegDeviceId(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {devices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.deviceId} — {d.terminalName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Mapping Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Override Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Authorized Manual Verification Override</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Supervisor approval for sensor smudges or physical injury</p>
              </div>
            </div>

            <form onSubmit={handleManualOverrideSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Hosteller</label>
                <select
                  value={manualStudentId}
                  onChange={e => setManualStudentId(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Hosteller Student --</option>
                  {allHostellers.map(h => (
                    <option key={h.studentId} value={h.studentId}>
                      {h.name} ({h.rollNumber}) — {h.hostelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Meal Window</label>
                <select
                  value={manualMealType}
                  onChange={e => setManualMealType(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snacks">Evening Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Supervisor Justification
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Temporary skin lesion/bandage on index finger, confirmed resident identity via student ID card and hostel warden."
                  value={manualReason}
                  onChange={e => setManualReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Authorize Manual Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

