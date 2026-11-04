// Apna Campus ERP — Canteen Settings & RBAC Governance Section
import React, { useState, useEffect } from 'react';
import { 
  Settings, ShieldCheck, Clock, Utensils, Save, CheckCircle2, 
  Lock, Users, AlertCircle, RefreshCw
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenSettingsSection({ showToast, account }) {
  const [settings, setSettings] = useState(() => canteenStore.getSettings());

  const handleSave = (e) => {
    e.preventDefault();
    const res = canteenStore.updateSettings(settings);
    if (res.success) {
      showToast?.(res.message, 'success');
    }
  };

  const rbacRoles = [
    {
      role: 'Super Admin',
      badge: 'Institution-Wide',
      description: 'Full institutional authority across all portals, hostellers, financial statements, and audit logs.',
      permissions: [
        'View all canteen operations & live terminals',
        'View complete hosteller database & room allocations',
        'View student-wise & hostel-wise meal consumption analytics',
        'View full authorized hostel accommodation fee ledgers',
        'Manage biometric hardware settings & firmware triggers',
        'Export institution-wide reports in PDF, Excel, and CSV',
        'Access full system audit trails and security logs'
      ]
    },
    {
      role: 'Institutional Admin',
      badge: 'Administrative Scope',
      description: 'Institutional administrative access to student registers, attendance records, and authorized fee statuses.',
      permissions: [
        'View all hostellers within institutional scope',
        'View meal attendance and absentee reports',
        'View daily food consumption and kitchen metrics',
        'View authorized hostel accommodation payment statuses',
        'Export permitted operations and attendance reports'
      ]
    },
    {
      role: 'Canteen Admin / Mess In-Charge',
      badge: 'Operational Authority',
      description: 'Day-to-day food operations, kitchen inventory, biometric verifications, and special dishes.',
      permissions: [
        'Manage live meal verification and terminal bays',
        'Manage kitchen raw ingredients stock & replenishment',
        'Log daily food preparation batch weights and wastage',
        'Issue a-la-carte tokens & manage RFID smart card orders',
        'View mess fee clearance status (Hostel accommodation financial accounts are partitioned)',
        'Generate daily & monthly operational reports'
      ]
    },
    {
      role: 'Accounts Directorate',
      badge: 'Financial Governance',
      description: 'Financial posting, treasury reconciliation, fee receipts, and refund adjustments.',
      permissions: [
        'Reconcile daily and monthly canteen collections',
        'Manage full hostel accommodation fee and mess ledgers',
        'Verify bank transfers, UPI transactions, and cash receipts',
        'Generate statutory institutional financial statements'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" /> Institutional Configuration
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Canteen Operations & RBAC Security Governance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure service window cutoff schedules, recipe portion standards, and review role-based access control matrix.
        </p>
      </div>

      {/* RBAC Governance Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Role-Based Access Control (RBAC) Governance Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enforces institutional data partitioning and privacy mandates.
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            RBAC Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rbacRoles.map(role => (
            <div key={role.role} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{role.role}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  {role.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{role.description}</p>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1">
                {role.permissions.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Window Timing & Standard Portions Configuration Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Meal Service Windows & Cutoff Schedules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Absences are automatically finalized when each service window reaches its end time.
            </p>
          </div>

          <button
            type="submit"
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" /> Save Operational Settings
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">Breakfast Window</span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.Breakfast?.start || '07:30'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    Breakfast: { ...settings.serviceWindows.Breakfast, start: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">End / Cutoff Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.Breakfast?.end || '10:00'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    Breakfast: { ...settings.serviceWindows.Breakfast, end: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">Lunch Window</span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.Lunch?.start || '12:00'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    Lunch: { ...settings.serviceWindows.Lunch, start: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">End / Cutoff Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.Lunch?.end || '14:30'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    Lunch: { ...settings.serviceWindows.Lunch, end: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">Snacks Window</span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.['Evening Snacks']?.start || '17:00'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    'Evening Snacks': { ...settings.serviceWindows['Evening Snacks'], start: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">End / Cutoff Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.['Evening Snacks']?.end || '18:30'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    'Evening Snacks': { ...settings.serviceWindows['Evening Snacks'], end: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">Dinner Window</span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.Dinner?.start || '19:30'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    Dinner: { ...settings.serviceWindows.Dinner, start: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">End / Cutoff Time</label>
              <input
                type="text"
                value={settings.serviceWindows?.Dinner?.end || '22:00'}
                onChange={e => setSettings({
                  ...settings,
                  serviceWindows: {
                    ...settings.serviceWindows,
                    Dinner: { ...settings.serviceWindows.Dinner, end: e.target.value }
                  }
                })}
                className="w-full py-1.5 px-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

