// Apna Campus ERP — Meal Plans & Subscriptions Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Search, Plus, Filter, 
  CreditCard, ShieldCheck, Clock, Download, X
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenMealPlansSection({ showToast }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const subscriptions = useMemo(() => {
    let list = canteenStore.getSubscriptions();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.studentName.toLowerCase().includes(q) ||
        s.studentId.includes(q) ||
        s.planName?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      list = list.filter(s => s.status === statusFilter);
    }
    return list;
  }, [search, statusFilter, dataVersion]);

  const mealPlans = [
    {
      id: 'plan-1',
      name: 'Full Board (4 Meals)',
      description: 'Complete nutritional coverage including Breakfast, Lunch, Evening Snacks & Dinner.',
      rate: '₹24,000 / Semester',
      badge: 'Most Popular',
      meals: ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'],
      activeCount: 380
    },
    {
      id: 'plan-2',
      name: 'Standard Board (3 Meals)',
      description: 'Standard residential hostel plan covering Breakfast, Lunch and Dinner.',
      rate: '₹20,000 / Semester',
      meals: ['Breakfast', 'Lunch', 'Dinner'],
      activeCount: 140
    },
    {
      id: 'plan-3',
      name: 'Day Scholar Lunch Pass',
      description: 'Customized daily lunch buffet access for day-scholar students.',
      rate: '₹8,500 / Semester',
      meals: ['Lunch'],
      activeCount: 65
    },
    {
      id: 'plan-4',
      name: 'Sports & High-Protein Diet',
      description: 'Includes extra eggs/paneer and badam milk along with 4 standard meals.',
      rate: '₹28,000 / Semester',
      meals: ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner', 'Special Add-Ons'],
      activeCount: 20
    }
  ];

  return (
    <div className="space-y-6">
      {/* Plans Overview Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
              Approved Dietary Framework
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Institutional Meal Plans & Subscription Directorate
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorized meal subscriptions. Controlled biometric entitlements mapped directly to financial clearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mealPlans.map(plan => (
            <div key={plan.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</h4>
                  {plan.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1.5">{plan.rate}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{plan.description}</p>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {plan.meals.map(m => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center justify-between">
                <span>Active Subscriptions:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{plan.activeCount} students</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Active Student Meal Subscriptions Register
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Valid subscriptions entitled to biometric mess entry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search subscriber..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subscribed Meals</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4">Amount / Ledger</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{sub.studentName}</div>
                    <div className="text-[11px] font-mono text-slate-400">ID: {sub.studentId}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.category}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {sub.meals?.breakfast && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-medium">B'fast</span>}
                      {sub.meals?.lunch && <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">Lunch</span>}
                      {sub.meals?.dinner && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-medium">Dinner</span>}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div>{sub.validFrom} to {sub.validTo}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{sub.academicYear}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{sub.totalAmount?.toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

