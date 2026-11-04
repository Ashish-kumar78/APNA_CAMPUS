// Apna Campus ERP — Daily Food Consumption & Kitchen Operations Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, CheckCircle2, AlertTriangle, TrendingUp, Plus,
  Calendar, Download, RefreshCw, X, Shield, Clock, PieChart, Check
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenFoodConsumptionSection({ showToast, account }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [logMealType, setLogMealType] = useState('Lunch');
  const [logPreparedKg, setLogPreparedKg] = useState('220');
  const [logServedKg, setLogServedKg] = useState('215');
  const [logWasteKg, setLogWasteKg] = useState('5');
  const [logSpecialCount, setLogSpecialCount] = useState('25');
  const [logNotes, setLogNotes] = useState('Special chicken kasa and paneer butter masala add-ons served.');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const consumptionData = useMemo(() => {
    return canteenStore.getDailyFoodConsumption(selectedDate);
  }, [selectedDate, dataVersion]);

  const summary = useMemo(() => {
    return canteenStore.getEnterpriseDailyMealSummary(selectedDate);
  }, [selectedDate, dataVersion]);

  const handleLogSubmit = (e) => {
    e.preventDefault();
    const res = canteenStore.logFoodConsumption({
      date: selectedDate,
      mealType: logMealType,
      actualFoodPreparedKg: Number(logPreparedKg),
      actualFoodServedKg: Number(logServedKg),
      foodWastageKg: Number(logWasteKg),
      specialMealCount: Number(logSpecialCount),
      specialMealNotes: logNotes
    }, account?.name || 'Head Chef & Mess Manager');

    if (res.success) {
      showToast?.(res.message, 'success');
      setIsLogModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and KPI Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5" /> Food Preparation & Wastage Analytics
              </span>
              <span className="text-xs text-slate-400">Date: {selectedDate}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Daily Food Consumption & Kitchen Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Calculates daily food consumed, recipe standard estimates vs. actual cooked portions, and wastage ratios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Log Food Preparation
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Prepared</div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {consumptionData.summary.totalPreparedKg} kg
            </div>
            <div className="text-[10px] text-slate-400">Total Kitchen Batch Weights</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Food Consumed</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {consumptionData.summary.totalServedKg} kg
            </div>
            <div className="text-[10px] text-slate-400">Served to Verified Residents</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Food Wastage</div>
            <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
              {consumptionData.summary.totalWastageKg} kg
            </div>
            <div className="text-[10px] text-slate-400">Excess Plate & Tray Scrapings</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Wastage Efficiency</div>
            <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {consumptionData.summary.averageWastagePercentage}%
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">Target &lt; 3.0% (Passing)</div>
          </div>
        </div>
      </div>

      {/* Meal Consumption Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Meal-by-Meal Consumption & Inventory Consumption Engine
          </h3>
          <span className="text-xs text-slate-400">Standard Recipes Applied</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Meal Category</th>
                <th className="py-3 px-4">Eligible Students</th>
                <th className="py-3 px-4">Actual Served</th>
                <th className="py-3 px-4">Est. Food Required</th>
                <th className="py-3 px-4">Actual Prepared</th>
                <th className="py-3 px-4">Actual Served</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Wastage</th>
                <th className="py-3 px-4">Special Add-Ons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {consumptionData.records.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {record.mealType}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {record.eligibleStudents}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {record.actualServed}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                    {record.estimatedFoodKg} kg
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">
                    {record.actualFoodPreparedKg} kg
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                    {record.actualFoodServedKg} kg
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {record.remainingFoodKg} kg
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-500">
                    {record.foodWastageKg} kg ({record.wastagePercentage}%)
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {record.specialMealCount} Special Curries
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipe Standard Requirement Guidelines */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-xs space-y-3">
        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" /> Configured Institutional Recipe Portion Standards
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Raw ingredient consumption is auto-calculated using actual verified biometric attendance multiplied by institutional dietary standards:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-semibold block">Rice (Basmati/Raw):</span>
            <span className="font-bold text-slate-900 dark:text-white">120 grams / student</span>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-semibold block">Dal & Pulses:</span>
            <span className="font-bold text-slate-900 dark:text-white">60 grams / student</span>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-semibold block">Mixed Vegetables:</span>
            <span className="font-bold text-slate-900 dark:text-white">150 grams / student</span>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-semibold block">Cooking Oil:</span>
            <span className="font-bold text-slate-900 dark:text-white">25 ml / student</span>
          </div>
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-semibold block">Dairy Milk:</span>
            <span className="font-bold text-slate-900 dark:text-white">200 ml / student</span>
          </div>
        </div>
      </div>

      {/* Log Preparation Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Log Kitchen Food Preparation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Record prepared batch weight and wastage</p>
              </div>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Meal Window</label>
                <select
                  value={logMealType}
                  onChange={e => setLogMealType(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snacks">Evening Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Prepared Food (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={logPreparedKg}
                    onChange={e => setLogPreparedKg(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Actual Served (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={logServedKg}
                    onChange={e => setLogServedKg(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Food Wastage (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logWasteKg}
                    onChange={e => setLogWasteKg(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Special Meals Count</label>
                  <input
                    type="number"
                    value={logSpecialCount}
                    onChange={e => setLogSpecialCount(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kitchen Notes</label>
                <textarea
                  rows={2}
                  value={logNotes}
                  onChange={e => setLogNotes(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Consumption Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

