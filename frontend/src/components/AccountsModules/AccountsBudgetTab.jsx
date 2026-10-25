import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Download,
  Filter,
  Search,
  Building2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { INITIAL_BUDGETS } from './accountsData';

export default function AccountsBudgetTab({
  budgets = INITIAL_BUDGETS,
  onUpdateBudgets,
  onAddAuditLog,
  initialSubtab = 'annual'
}) {
  const [activeSubtab, setActiveSubtab] = useState(initialSubtab); // 'annual' | 'departments' | 'variance'

  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(initialSubtab);
    }
  }, [initialSubtab]);
  const [selectedFY, setSelectedFY] = useState('FY 2026-27');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);

  const [newBudgetForm, setNewBudgetForm] = useState({
    department: 'Computer Science & Engineering',
    category: 'Advanced Cloud Computing & AI Lab',
    allocated: '',
    committed: '0',
    justification: ''
  });

  // Calculate master totals
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalActual = budgets.reduce((sum, b) => sum + b.actualSpent, 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + b.committed, 0);
  const totalAvailable = totalAllocated - totalActual - totalCommitted;
  const overallUtilization = totalAllocated > 0 ? ((totalActual / totalAllocated) * 100).toFixed(1) : 0;

  // Filtered Budgets
  const filteredBudgets = budgets.filter(b => {
    return deptFilter === 'ALL' || b.department === deptFilter;
  });

  // Chart Data
  const chartData = budgets.map(b => ({
    name: b.department
      .replace('Computer Science & Engineering', 'CSE')
      .replace('AI & Machine Learning', 'AIML')
      .replace('Electronics & Communication', 'ECE')
      .replace('Estate Maintenance & Operations', 'Estate')
      .replace('Central University Library', 'Library'),
    Allocated: b.allocated / 100000,
    ActualSpent: b.actualSpent / 100000,
    Committed: b.committed / 100000
  }));

  // Handle Add Budget
  const handleAddBudget = (e) => {
    e.preventDefault();
    const allocatedNum = parseFloat(newBudgetForm.allocated);
    if (isNaN(allocatedNum) || allocatedNum <= 0) return;

    const newEntry = {
      department: newBudgetForm.department,
      category: newBudgetForm.category,
      allocated: allocatedNum,
      actualSpent: 0,
      committed: parseFloat(newBudgetForm.committed) || 0,
      balance: allocatedNum - (parseFloat(newBudgetForm.committed) || 0),
      utilizationRate: 0,
      status: 'Newly Sanctioned'
    };

    if (onUpdateBudgets) {
      onUpdateBudgets([...budgets, newEntry]);
    }
    if (onAddAuditLog) {
      onAddAuditLog({
        actionType: 'BUDGET_ALLOCATION_SANCTIONED',
        target: `${newEntry.department} — ₹${allocatedNum.toLocaleString('en-IN')}`,
        details: `Approved budget allocation for ${newEntry.category}. Justification: ${newBudgetForm.justification || 'Annual Fiscal Plan'}`
      });
    }

    setIsAddBudgetModalOpen(false);
    setNewBudgetForm({
      department: 'Computer Science & Engineering',
      category: 'Advanced Cloud Computing & AI Lab',
      allocated: '',
      committed: '0',
      justification: ''
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'Department,Category,Allocated (INR),Actual Spent (INR),Committed (INR),Balance (INR),Utilization Rate (%)\n';
    const rows = budgets.map(b =>
      `"${b.department}","${b.category}",${b.allocated},${b.actualSpent},${b.committed},${b.balance},${b.utilizationRate}%`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apna_campus_budgets_${selectedFY.replace(/ /g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'annual', label: 'Annual Master Budget', icon: Layers },
            { id: 'departments', label: 'Departmental Allocations', icon: Building2 },
            { id: 'variance', label: 'Variance & Forecast Analysis', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubtab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubtab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setIsAddBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle size={14} /> Propose Allocation
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sanctioned Budget</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{(totalAllocated / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-slate-500">Academic &amp; Operations Allocation</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Spent</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ₹{(totalActual / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">{overallUtilization}% Utilized</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Committed Orders</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            ₹{(totalCommitted / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-slate-500">Sanctioned POs in transit</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Surplus</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">
            ₹{(totalAvailable / 100000).toFixed(2)} L
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">Unallocated Fiscal Balance</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: BUDGET VS ACTUAL EXPENDITURE CHART
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Departmental Budget vs. Actual Spend (in Lakhs ₹)</h3>
            <p className="text-xs text-slate-500">Visual comparison of sanctioned fiscal envelope against actual realized disbursements</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            {selectedFY}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis unit="L" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`₹${value.toFixed(2)} Lakhs`, '']} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="Allocated" fill="#93c5fd" name="Sanctioned Allocation (₹ L)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ActualSpent" fill="#2563eb" name="Actual Expenditure (₹ L)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Committed" fill="#f59e0b" name="Committed POs (₹ L)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: DEPARTMENT BUDGET DIRECTORY TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Budget Utilization Register</h3>
            <p className="text-xs text-slate-500">Department allocations, actual spend, encumbrances, and variance thresholds</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Departments</option>
              {Array.from(new Set(budgets.map(b => b.department))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Department &amp; Head</th>
                <th className="py-3 px-4">Budget Category</th>
                <th className="py-3 px-4 text-right">Sanctioned (₹)</th>
                <th className="py-3 px-4 text-right">Actual Spent (₹)</th>
                <th className="py-3 px-4 text-right">Committed (₹)</th>
                <th className="py-3 px-4 text-right">Balance Available (₹)</th>
                <th className="py-3 px-4 text-center">Utilization</th>
                <th className="py-3 px-4 text-center">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.map((b, idx) => {
                const util = b.utilizationRate;
                const isWarning = util >= 90;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 text-sm block">{b.department}</span>
                      <span className="text-[11px] text-slate-400">Autonomous Engineering Division</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {b.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{Number(b.allocated).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                      ₹{Number(b.actualSpent).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700 font-medium">
                      ₹{Number(b.committed).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{Number(b.balance).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-[10px] font-bold mb-0.5">
                          <span>{util}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              util >= 92 ? 'bg-rose-500' :
                              util >= 85 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(util, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isWarning ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PROPOSE BUDGET ALLOCATION
      ───────────────────────────────────────────────────────────── */}
      {isAddBudgetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Propose New Fiscal Budget Allocation</h3>
              <button
                onClick={() => setIsAddBudgetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Department</label>
                <select
                  value={newBudgetForm.department}
                  onChange={(e) => setNewBudgetForm({ ...newBudgetForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication</option>
                  <option value="Estate Maintenance & Operations">Estate Maintenance &amp; Operations</option>
                  <option value="Central University Library">Central University Library</option>
                  <option value="Civil & Mechanical Workshop">Civil &amp; Mechanical Workshop</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Budget Category / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. NextGen Robotics Research Cell"
                  value={newBudgetForm.category}
                  onChange={(e) => setNewBudgetForm({ ...newBudgetForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Allocated Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500000"
                    value={newBudgetForm.allocated}
                    onChange={(e) => setNewBudgetForm({ ...newBudgetForm, allocated: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Committed (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newBudgetForm.committed}
                    onChange={(e) => setNewBudgetForm({ ...newBudgetForm, committed: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Governing Body Justification</label>
                <textarea
                  rows={3}
                  placeholder="State academic reason, student count benefited, and expected outcomes..."
                  value={newBudgetForm.justification}
                  onChange={(e) => setNewBudgetForm({ ...newBudgetForm, justification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Submit Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
