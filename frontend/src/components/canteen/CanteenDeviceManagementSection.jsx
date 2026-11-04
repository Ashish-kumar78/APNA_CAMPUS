// Apna Campus ERP — Biometric & Hardware Device Management Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Server, Shield, Radio, CheckCircle2, AlertTriangle, 
  RefreshCw, Activity, Cpu, Wifi, Smartphone, HardDrive, X, Check
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenDeviceManagementSection({ showToast }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const devices = useMemo(() => canteenStore.getBiometricDevices(), [dataVersion]);

  const handleSyncDevice = (deviceId) => {
    const res = canteenStore.triggerDeviceSync(deviceId);
    if (res.success) {
      showToast?.(res.message, 'success');
    }
  };

  const handleRunDiagnostic = (deviceId) => {
    const res = canteenStore.runDeviceDiagnostic(deviceId);
    setDiagnosticResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Server className="w-3.5 h-3.5" /> Hardware Device Management Bay
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {devices.filter(d => d.status === 'Online').length} / {devices.length} Online
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Biometric & RFID Hardware Infrastructure
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time telemetry, optical sensor health, IP subnet addressing, and firmware sync across mess gate terminals.
            </p>
          </div>

          <button
            onClick={() => {
              devices.forEach(d => canteenStore.triggerDeviceSync(d.deviceId));
              showToast?.('Broadcasting sync signal to all 6 biometric counters...', 'success');
            }}
            className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" /> Synchronize All Terminals
          </button>
        </div>
      </div>

      {/* Hardware Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {devices.map(dev => (
          <div key={dev.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{dev.deviceId}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{dev.terminalName}</h3>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{dev.deviceName}</div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {dev.status}
                </span>
              </div>

              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-1.5 border border-slate-200/60 dark:border-slate-700/40">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{dev.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Subnet:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{dev.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MAC Address:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{dev.macAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Firmware Build:</span>
                  <span className="text-slate-700 dark:text-slate-300">{dev.firmwareVersion}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Today's Scans:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{dev.totalScansToday} verified</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSyncDevice(dev.deviceId)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Force Sync
              </button>

              <button
                onClick={() => handleRunDiagnostic(dev.deviceId)}
                className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <Activity className="w-3.5 h-3.5" /> Diagnostic
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostic Modal */}
      {diagnosticResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setDiagnosticResult(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Terminal Self-Test Diagnostic</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{diagnosticResult.terminalName} ({diagnosticResult.deviceId})</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">System State:</span>
                <span className="font-bold text-emerald-600">{diagnosticResult.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Firmware:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{diagnosticResult.firmware}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Optical Sensor Calibration:</span>
                <span className="font-bold text-emerald-600">{diagnosticResult.opticalSensorStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ping Latency:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{diagnosticResult.networkLatency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Packets Synced:</span>
                <span className="font-bold text-slate-900 dark:text-white">{diagnosticResult.packetsSynced} scans</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDiagnosticResult(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

