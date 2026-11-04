// Apna Campus ERP — Canteen Finance & Mess Collections Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, TrendingUp, AlertCircle, CheckCircle2, 
  Search, Download, DollarSign, Wallet, ArrowUpRight
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenFinanceSection({ showToast, account }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const financialData = useMemo(() => {
    return canteenStore.getEnterpriseFinancialReport(account?.role || 'canteen');
  }, [account, dataVersion]);

  const payments = useMemo(() => {
    let list = canteenStore.getAllStudentFeeAccounts();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.studentName.toLowerCase().includes(q) ||
        p.studentId.includes(q)
      );
    }
    return list;
  }, [search, dataVersion]);

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Total Mess Fee', 'Amount Paid', 'Pending Balance', 'Status'];
    const rows = payments.map(p => [
      p.studentId, p.studentName, p.totalBilled, p.totalPaid, p.balance, p.balance <= 0 ? 'Cleared' : 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Canteen_Finance_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Finance ledger exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Mess & Food Directorate Finance
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Canteen Revenue, Mess Subscriptions & Dues
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dedicated mess billing partition. Autonomous tracking of meal subscriptions, RFID wallet top-ups, and a-la-carte sales.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-emerald-500" /> Export Finance Ledger
          </button>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Mess Dues Billed</div>
            <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              ₹{financialData.canteenMessFinance.totalMessDuesBilled?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Total Semester Billing</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Collected</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{financialData.canteenMessFinance.totalMessCollected?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Realized Collections</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Pending Mess Dues</div>
            <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
              ₹{financialData.canteenMessFinance.totalMessPending?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Outstanding Balance</div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Special Curries Revenue</div>
            <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{financialData.canteenMessFinance.specialDishesRevenueToday?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">Today's Token Sales</div>
          </div>
        </div>
      </div>

      {/* Student Canteen Fee Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Student-Wise Mess Fee Ledger & Subscriptions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biometric clearance mapped to cleared mess account status.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student ledger..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Pending Dues</th>
                <th className="py-3 px-4">Clearance Status</th>
                <th className="py-3 px-4">Recent Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {payments.map(account => {
                const isCleared = account.balance <= 0;
                return (
                  <tr key={account.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{account.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-400">ID: {account.studentId}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      ₹{account.totalBilled?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{account.totalPaid?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-rose-500">
                      ₹{account.balance?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCleared
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                      }`}>
                        {isCleared ? 'Cleared for Mess Entry' : 'Dues Pending'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {account.payments?.[0]?.receiptNo || 'Verified'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

