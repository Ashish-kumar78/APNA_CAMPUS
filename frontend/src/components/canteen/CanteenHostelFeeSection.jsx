// Apna Campus ERP — Hostel Fee Overview (Role-Scoped Governance Section)
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Banknote, Shield, Lock, Search, Filter, CheckCircle2, 
  AlertCircle, Download, FileText, ChevronRight
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenHostelFeeSection({ account, showToast }) {
  const [dataVersion, setDataVersion] = useState(0);
  const userRole = account?.role ? String(account.role).toLowerCase() : 'canteen';
  const isFullFinancialRole = ['super_admin', 'admin', 'accounts'].includes(userRole);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [hostelFilter, setHostelFilter] = useState('All');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const feeStatusData = useMemo(() => {
    return canteenStore.getHostelFeeStatus({
      search,
      status: statusFilter,
      hostel: hostelFilter
    }, userRole);
  }, [search, statusFilter, hostelFilter, userRole, dataVersion]);

  const allHostellers = useMemo(() => {
    return canteenStore.getHostellers({}, userRole);
  }, [userRole, dataVersion]);

  const uniqueHostels = useMemo(() => {
    return Array.from(new Set(allHostellers.map(h => h.hostelName)));
  }, [allHostellers]);

  const handleExportCSV = () => {
    if (!isFullFinancialRole || !feeStatusData.success) {
      showToast?.('Exporting restricted financial data is not permitted for your role.', 'error');
      return;
    }

    const headers = ['Student ID', 'Roll Number', 'Name', 'Hostel', 'Room', 'Total Fee', 'Paid Amount', 'Pending Amount', 'Status', 'Receipt'];
    const rows = feeStatusData.data.map(h => [
      h.studentId, h.rollNumber, h.name, h.hostelName, h.roomNumber,
      h.hostelFee.totalHostelFee, h.hostelFee.paidAmount, h.hostelFee.pendingAmount,
      h.hostelFee.paymentStatus, h.hostelFee.receiptNo
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Accommodation_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Hostel Fee Ledger exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Role Security Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isFullFinancialRole 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              }`}>
                <Shield className="w-3.5 h-3.5" />
                {isFullFinancialRole ? 'Full Financial Access (Admin/Accounts)' : 'Scoped Role Access (Canteen Staff)'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Hostel Accommodation Fee Overview & Reconciliation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maintains strict partition between residential hostel accommodation fees and canteen food subscriptions.
            </p>
          </div>

          {isFullFinancialRole && (
            <button
              onClick={handleExportCSV}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-emerald-500" /> Export Fee Ledger
            </button>
          )}
        </div>

        {/* If Canteen Staff: Show Explanatory Card */}
        {!isFullFinancialRole ? (
          <div className="mt-5 p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-3">
            <div className="flex items-center gap-3 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              Partitioned Financial Category
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              In accordance with institutional financial compliance rules, <strong>Hostel Accommodation Fees</strong> and <strong>Canteen Mess Subscription Fees</strong> remain separate financial categories.
            </p>
            <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li>Canteen staff have full access to meal eligibility, mess subscription status, and food ordering ledger.</li>
              <li>Unrestricted hostel accommodation accounts and room billing are strictly isolated for the <strong>Accounts Directorate, Super Admin, and Hostel Wardens</strong>.</li>
            </ul>
          </div>
        ) : (
          /* Full Financial Summary Cards for Admin / Super Admin / Accounts */
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Billed</div>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                ₹{feeStatusData.summary?.totalAccommodationBilled?.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Total Accommodation Fees</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Realized</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{feeStatusData.summary?.totalAccommodationCollected?.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Received into Treasury</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Pending Dues</div>
              <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                ₹{feeStatusData.summary?.totalAccommodationPending?.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">{feeStatusData.summary?.overdueCount} Accounts Overdue</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Accounts Status</div>
              <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {feeStatusData.summary?.fullyPaidCount} Paid
              </div>
              <div className="text-[10px] text-slate-400">{feeStatusData.summary?.partialCount} Partial Payments</div>
            </div>
          </div>
        )}
      </div>

      {/* Authorized Table (Shown only for authorized roles) */}
      {isFullFinancialRole && feeStatusData.success && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">
              Hostel Accommodation Accounting Register ({feeStatusData.count} Hostellers)
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Fee Status</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Hostel & Room</th>
                  <th className="py-3 px-4">Total Fee</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {feeStatusData.data.map(h => (
                  <tr key={h.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{h.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">Roll: {h.rollNumber}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <div>{h.hostelName}</div>
                      <div className="text-[11px] text-slate-400">Room {h.roomNumber}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      ₹{h.hostelFee.totalHostelFee.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{h.hostelFee.paidAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-rose-500">
                      ₹{h.hostelFee.pendingAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        h.hostelFee.paymentStatus === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                        h.hostelFee.paymentStatus === 'Partial' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                        'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                      }`}>
                        {h.hostelFee.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {h.hostelFee.nextDueDate}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      {h.hostelFee.receiptNo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

