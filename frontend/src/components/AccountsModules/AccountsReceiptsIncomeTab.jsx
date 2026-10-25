import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  X
} from 'lucide-react';

export default function AccountsReceiptsIncomeTab({
  otherIncome,
  transactions,
  onUpdateOtherIncome,
  onAddAuditLog,
  initialSubtab = 'other_income'
}) {
  const [selectedSubtab, setSelectedSubtab] = useState(initialSubtab === 'fee_receipts' ? 'all_receipts' : 'other_income');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(() => {
    if (initialSubtab === 'hostel') return 'Hostel';
    if (initialSubtab === 'transport') return 'Transport';
    if (initialSubtab === 'exam') return 'Examination';
    return 'ALL';
  });
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);

  useEffect(() => {
    if (initialSubtab === 'fee_receipts') {
      setSelectedSubtab('all_receipts');
      setCategoryFilter('ALL');
    } else {
      setSelectedSubtab('other_income');
      if (initialSubtab === 'hostel') setCategoryFilter('Hostel');
      else if (initialSubtab === 'transport') setCategoryFilter('Transport');
      else if (initialSubtab === 'exam') setCategoryFilter('Examination');
      else setCategoryFilter('ALL');
    }
  }, [initialSubtab]);

  const [newIncomeForm, setNewIncomeForm] = useState({
    id: `INC-2026-${String(otherIncome.length + 45).padStart(3, '0')}`,
    date: '24-Oct-2026',
    category: 'Industry R&D Consultancy & Testing Charges',
    payer: 'National Aluminium Company Ltd (NALCO Testing)',
    reference: `NALCO-TEST-${Math.floor(100 + Math.random() * 900)}`,
    amount: '185000',
    mode: 'NEFT Bank Transfer',
    status: 'Realized'
  });

  // Filtered Income
  const filteredIncome = otherIncome.filter(inc => {
    const matchesSearch = inc.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' ? true : inc.category.includes(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const handleAddIncomeSubmit = (e) => {
    e.preventDefault();
    const incAmt = Number(newIncomeForm.amount);
    if (!incAmt || incAmt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newInc = {
      ...newIncomeForm,
      amount: incAmt
    };

    onUpdateOtherIncome([newInc, ...otherIncome]);
    setIsAddIncomeOpen(false);

    onAddAuditLog({
      actionType: 'INSTITUTIONAL_INCOME_RECORDED',
      target: `${newInc.id} (${newInc.payer} - ₹${incAmt})`,
      details: `Category: ${newInc.category}, Mode: ${newInc.mode}, Ref: ${newInc.reference}.`
    });
  };

  const handleExportCSV = () => {
    const headers = ['Income ID', 'Date', 'Income Category', 'Payer', 'Reference Number', 'Amount', 'Payment Mode', 'Status'];
    const rows = otherIncome.map(i => [
      i.id,
      i.date,
      `"${i.category}"`,
      `"${i.payer}"`,
      i.reference,
      i.amount,
      i.mode,
      i.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Other_Institutional_Income_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="accounts-module-wrap">
      {/* Subtab Toggle Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedSubtab('other_income')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'other_income' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Auxiliary &amp; Institutional Income ({otherIncome.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('all_receipts')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'all_receipts' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Fee Receipts Register ({transactions.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Download size={13} /> Export Income CSV
          </button>
          <button
            onClick={() => setIsAddIncomeOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle size={14} /> Record Other Income
          </button>
        </div>
      </div>

      {/* Subtab 1: Auxiliary Income */}
      {selectedSubtab === 'other_income' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search payer, category, reference number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
              >
                <option value="ALL">All Revenue Streams</option>
                <option value="Hostel">Hostel Accommodation</option>
                <option value="Transit">Transport Fleet</option>
                <option value="Examination">Autonomous Examination</option>
                <option value="Consultancy">Industry Testing &amp; R&amp;D</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Receipt Ref &amp; Date</th>
                  <th className="py-3 px-4">Income Category</th>
                  <th className="py-3 px-4">Payer / Client</th>
                  <th className="py-3 px-4">Transaction Mode</th>
                  <th className="py-3 px-4">Realized Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncome.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{inc.id}</div>
                      <div className="text-[10px] text-slate-400">{inc.date} · {inc.reference}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {inc.category}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {inc.payer}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {inc.mode}
                    </td>

                    <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                      +₹{inc.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: All Fee Receipts */}
      {selectedSubtab === 'all_receipts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Student &amp; Roll Number</th>
                <th className="py-3 px-4">Fee Head</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount Received</th>
                <th className="py-3 px-4">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(txn => (
                <tr key={txn.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 font-mono">{txn.receiptNo}</div>
                    <div className="text-[10px] text-slate-400">{txn.date}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {txn.studentName} ({txn.studentId})
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {txn.feeHead}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {txn.mode}
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-700">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Other Income Modal */}
      {isAddIncomeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle size={16} className="text-emerald-400" />
                Record Auxiliary Institutional Revenue
              </h3>
              <button onClick={() => setIsAddIncomeOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddIncomeSubmit} className="p-5 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Income Category</label>
                <select
                  value={newIncomeForm.category}
                  onChange={(e) => setNewIncomeForm({ ...newIncomeForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                >
                  <option value="Industry R&D Consultancy & Testing Charges">Industry R&amp;D Consultancy &amp; Testing</option>
                  <option value="Hostel & Residential Accommodation Dues">Hostel &amp; Residential Accommodation</option>
                  <option value="Campus Transit Fleet Bus Passes">Campus Transit Bus Passes</option>
                  <option value="Autonomous Examination Evaluation Dues">Autonomous Examination Fees</option>
                  <option value="Alumni Trust & Corporate Endowment">Alumni Trust Endowment</option>
                  <option value="Campus Auditorium & Sports Facility Rental">Auditorium / Facility Rental</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payer / Organization / Client</label>
                <input
                  type="text"
                  value={newIncomeForm.payer}
                  onChange={(e) => setNewIncomeForm({ ...newIncomeForm, payer: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Received Amount (₹)</label>
                  <input
                    type="number"
                    value={newIncomeForm.amount}
                    onChange={(e) => setNewIncomeForm({ ...newIncomeForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-bold text-sm text-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={newIncomeForm.mode}
                    onChange={(e) => setNewIncomeForm({ ...newIncomeForm, mode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="NEFT Bank Transfer">NEFT Bank Transfer</option>
                    <option value="RTGS Electronic">RTGS Electronic</option>
                    <option value="UPI / QR Code">UPI / QR Code</option>
                    <option value="Bank Demand Draft">Bank Demand Draft</option>
                    <option value="Cheque Deposit">Cheque Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transaction Reference / UTR Ref</label>
                <input
                  type="text"
                  value={newIncomeForm.reference}
                  onChange={(e) => setNewIncomeForm({ ...newIncomeForm, reference: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddIncomeOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  Record Income Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
