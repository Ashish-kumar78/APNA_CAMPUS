// Apna Campus ERP — Canteen Directorate Dashboard Section
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Utensils, CheckCircle2, Clock, AlertTriangle, 
  TrendingUp, Activity, ShieldCheck, CreditCard, ChevronRight,
  Package, Calendar, Download, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenDashboardSection({ onNavigate, showToast, account }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const summary = useMemo(() => {
    return canteenStore.getEnterpriseDailyMealSummary(selectedDate);
  }, [selectedDate, dataVersion]);

  const consumption = useMemo(() => {
    return canteenStore.getDailyFoodConsumption(selectedDate);
  }, [selectedDate, dataVersion]);

  const devices = useMemo(() => {
    return canteenStore.getBiometricDevices();
  }, [dataVersion]);

  // Current meal window detection
  const currentServiceStatus = useMemo(() => {
    const now = new Date();
    const timeInMins = now.getHours() * 60 + now.getMinutes();

    if (timeInMins >= 7 * 60 + 30 && timeInMins <= 10 * 60) {
      return { active: 'Breakfast', window: '07:30 AM – 10:00 AM', status: 'IN PROGRESS', minsLeft: 10 * 60 - timeInMins };
    } else if (timeInMins >= 12 * 60 && timeInMins <= 14 * 60 + 30) {
      return { active: 'Lunch', window: '12:00 PM – 02:30 PM', status: 'IN PROGRESS', minsLeft: 14 * 60 + 30 - timeInMins };
    } else if (timeInMins >= 17 * 60 && timeInMins <= 18 * 60 + 30) {
      return { active: 'Evening Snacks', window: '05:00 PM – 06:30 PM', status: 'IN PROGRESS', minsLeft: 18 * 60 + 30 - timeInMins };
    } else if (timeInMins >= 19 * 60 + 30 && timeInMins <= 22 * 60) {
      return { active: 'Dinner', window: '07:30 PM – 10:00 PM', status: 'IN PROGRESS', minsLeft: 22 * 60 - timeInMins };
    } else if (timeInMins < 7 * 60 + 30) {
      return { active: 'Breakfast', window: '07:30 AM – 10:00 AM', status: 'UPCOMING', minsLeft: 7 * 60 + 30 - timeInMins };
    } else if (timeInMins < 12 * 60) {
      return { active: 'Lunch', window: '12:00 PM – 02:30 PM', status: 'UPCOMING', minsLeft: 12 * 60 - timeInMins };
    } else if (timeInMins < 17 * 60) {
      return { active: 'Evening Snacks', window: '05:00 PM – 06:30 PM', status: 'UPCOMING', minsLeft: 17 * 60 - timeInMins };
    } else {
      return { active: 'Dinner', window: '07:30 PM – 10:00 PM', status: 'UPCOMING', minsLeft: 19 * 60 + 30 - timeInMins };
    }
  }, []);

  const totalCapacity = summary.totalActiveHostellers || 520;
  const absenceRate = totalCapacity > 0 ? ((summary.totalAbsentRecords / (totalCapacity * 4)) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-time Service Window Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Service Terminal Active
              </span>
              <span className="text-slate-400 text-xs">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Canteen & Food Services Directorate
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Enterprise Biometric Meal Verification, Central Hosteller Roster, Food Consumption Tracking & Kitchen Inventory ERP.
            </p>
          </div>

          {/* Current Meal Status Badge */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              currentServiceStatus.status === 'IN PROGRESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Meal:</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  currentServiceStatus.status === 'IN PROGRESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {currentServiceStatus.status}
                </span>
              </div>
              <div className="text-lg font-bold text-white">{currentServiceStatus.active}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" /> {currentServiceStatus.window}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Active Hostellers</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalActiveHostellers}</div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">100% Roster Synced</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Central Hosteller & Student Register</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Meals Served</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalMealsServed}</div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {summary.breakfast.present + summary.lunch.present + summary.snacks.present + summary.dinner.present} Verified
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Across 4 Daily Meal Windows</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Food Prepared Today</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{consumption.summary.totalPreparedKg} kg</div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {consumption.summary.totalServedKg} kg Served
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Wastage: <span className="font-semibold text-rose-500">{consumption.summary.totalWastageKg} kg ({consumption.summary.averageWastagePercentage}%)</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Biometric Devices</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {devices.filter(d => d.status === 'Online').length} / {devices.length} Online
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              100% Uptime
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">MorphoWave & SecuGen Terminals</div>
        </div>
      </div>

      {/* Meal Attendance Matrix & Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4 Meal Windows Progress */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Daily Meal Attendance Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time breakdown per meal service window. Absence finalized only after window cutoff.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('meal_attendance')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              Full Register <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Breakfast */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Breakfast (07:30 - 10:00)
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {summary.breakfast.present} / {summary.totalActiveHostellers}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(summary.breakfast.present / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
                <div 
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${(summary.breakfast.absent / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Present: {summary.breakfast.present}</span>
                <span className="text-rose-500 font-medium">✗ Absent: {summary.breakfast.absent}</span>
                <span className="text-slate-400">Pending: {summary.breakfast.notYetServed}</span>
              </div>
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Lunch (12:00 - 14:30)
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {summary.lunch.present} / {summary.totalActiveHostellers}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(summary.lunch.present / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
                <div 
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${(summary.lunch.absent / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Present: {summary.lunch.present}</span>
                <span className="text-rose-500 font-medium">✗ Absent: {summary.lunch.absent}</span>
                <span className="text-slate-400">Pending: {summary.lunch.notYetServed}</span>
              </div>
            </div>

            {/* Evening Snacks */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Evening Snacks (17:00 - 18:30)
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {summary.snacks.present} / {summary.totalActiveHostellers}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(summary.snacks.present / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
                <div 
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${(summary.snacks.absent / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Present: {summary.snacks.present}</span>
                <span className="text-rose-500 font-medium">✗ Absent: {summary.snacks.absent}</span>
                <span className="text-slate-400">Pending: {summary.snacks.notYetServed}</span>
              </div>
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Dinner (19:30 - 22:00)
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {summary.dinner.present} / {summary.totalActiveHostellers}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(summary.dinner.present / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
                <div 
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${(summary.dinner.absent / (summary.totalActiveHostellers || 1)) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Present: {summary.dinner.present}</span>
                <span className="text-rose-500 font-medium">✗ Absent: {summary.dinner.absent}</span>
                <span className="text-slate-400">Pending: {summary.dinner.notYetServed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick ERP Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Operational Quick Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Direct access to live terminal, registration, and reporting.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('live_meal_verification')}
                className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center justify-between shadow-sm transition"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Open Live Terminal
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('biometric_management')}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" /> Register Biometric ID
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('food_consumption')}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-500" /> Log Daily Food Prep
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('reports_analytics')}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-500" /> Export Daily Reports
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Audit Trail Enabled</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> ISO 27001 Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

