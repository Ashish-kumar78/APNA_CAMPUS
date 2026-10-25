import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  Search,
  Filter,
  Download,
  RotateCcw,
  Check,
  X,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
  Printer,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { INITIAL_CHART_OF_ACCOUNTS } from './accountsData';

export default function AccountsGeneralLedgerTab({
  chartOfAccounts = INITIAL_CHART_OF_ACCOUNTS,
  journalEntries = [],
  studentLedgers = [],
  vendorBills = [],
  bankReconciliations = [],
  onUpdateJournalEntries,
  onUpdateChartOfAccounts,
  onUpdateBankReconciliations,
  onAddAuditLog,
  initialSubtab = 'chart'
}) {
  const [activeSubtab, setActiveSubtab] = useState(initialSubtab); // 'chart' | 'journal' | 'ledger' | 'cash_bank' | 'ar_ap' | 'reconciliation' | 'closing'

  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(initialSubtab);
    }
  }, [initialSubtab]);

  // Chart of Accounts filter
  const [coCategoryFilter, setCoCategoryFilter] = useState('ALL');
  const [coSearch, setCoSearch] = useState('');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    code: '',
    name: '',
    category: 'Assets',
    type: 'Current Asset',
    balance: ''
  });

  // Journal Entries Filter & Modal
  const [journalStatusFilter, setJournalStatusFilter] = useState('ALL');
  const [journalSearch, setJournalSearch] = useState('');
  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    debitAccount: '1020 - State Bank of India (Treasury A/c 3020491)',
    creditAccount: '4010 - Tuition & Academic Development Fee Income',
    debitAmount: '',
    creditAmount: '',
    preparedBy: 'Mr. S. K. Roy (Senior Accounts Officer)'
  });
  const [voucherError, setVoucherError] = useState('');

  // General Ledger selected account
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState('1020');

  // Bank Reconciliation State
  const [selectedBankId, setSelectedBankId] = useState('BREC-2026-10');
  const [reconChecklist, setReconChecklist] = useState({
    check1: true,
    check2: true,
    check3: true
  });
  const [isReconSuccess, setIsReconSuccess] = useState(false);

  // Period Closing Checklist State
  const [closingSteps, setClosingSteps] = useState([
    { id: 1, title: 'All Daily Counter & UPI Fee Collections Banked', passed: true, note: 'HDFC Collection A/c synchronized' },
    { id: 2, title: 'Vendor Bills & Invoices Fully Approved', passed: true, note: 'All bills verified against store receipts' },
    { id: 3, title: 'Monthly Salary Disbursement Provisioned', passed: true, note: 'October payroll ₹82.40L provisioned' },
    { id: 4, title: 'Bank Reconciliation Completed with 0 Variance', passed: true, note: 'SBI Treasury & HDFC verified' },
    { id: 5, title: 'Fixed Asset Depreciation & Amortization Booked', passed: true, note: 'Standard campus SLM rate applied' },
    { id: 6, title: 'Unbalanced Journal Vouchers Audited & Posted', passed: true, note: 'All debits = credits verified' }
  ]);
  const [isPeriodClosed, setIsPeriodClosed] = useState(false);

  // Filtered Chart of Accounts
  const filteredAccounts = chartOfAccounts.filter(acc => {
    const matchCat = coCategoryFilter === 'ALL' || acc.category === coCategoryFilter;
    const matchSearch = coSearch === '' ||
      acc.name.toLowerCase().includes(coSearch.toLowerCase()) ||
      acc.code.includes(coSearch);
    return matchCat && matchSearch;
  });

  // Category totals
  const totalAssets = chartOfAccounts.filter(a => a.category === 'Assets').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = chartOfAccounts.filter(a => a.category === 'Liabilities').reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = chartOfAccounts.filter(a => a.category === 'Equity').reduce((sum, a) => sum + a.balance, 0);
  const totalIncome = chartOfAccounts.filter(a => a.category === 'Income').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = chartOfAccounts.filter(a => a.category === 'Expenses').reduce((sum, a) => sum + a.balance, 0);

  // Filtered Journals
  const filteredJournals = journalEntries.filter(j => {
    const matchStatus = journalStatusFilter === 'ALL' || j.status === journalStatusFilter;
    const matchSearch = journalSearch === '' ||
      j.description.toLowerCase().includes(journalSearch.toLowerCase()) ||
      j.id.toLowerCase().includes(journalSearch.toLowerCase()) ||
      (j.reference && j.reference.toLowerCase().includes(journalSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Handle Add Account
  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAccountForm.code || !newAccountForm.name) return;
    const newAcc = {
      code: newAccountForm.code.trim(),
      name: newAccountForm.name.trim(),
      category: newAccountForm.category,
      type: newAccountForm.type,
      balance: parseFloat(newAccountForm.balance) || 0
    };
    if (onUpdateChartOfAccounts) {
      onUpdateChartOfAccounts([...chartOfAccounts, newAcc]);
    }
    if (onAddAuditLog) {
      onAddAuditLog({
        actionType: 'ACCOUNT_CREATED',
        target: `${newAcc.code} - ${newAcc.name}`,
        details: `Created new general ledger account under ${newAcc.category} with opening balance ₹${newAcc.balance.toLocaleString('en-IN')}`
      });
    }
    setIsAddAccountModalOpen(false);
    setNewAccountForm({ code: '', name: '', category: 'Assets', type: 'Current Asset', balance: '' });
  };

  // Handle Create Journal Entry (Strict Validation: Debits must equal Credits)
  const handleCreateVoucher = (e) => {
    e.preventDefault();
    const debit = parseFloat(newVoucher.debitAmount);
    const credit = parseFloat(newVoucher.creditAmount);

    if (isNaN(debit) || debit <= 0 || isNaN(credit) || credit <= 0) {
      setVoucherError('Debit and Credit amounts must be positive numeric figures.');
      return;
    }
    if (Math.abs(debit - credit) > 0.01) {
      setVoucherError(`Out of balance! Debit (₹${debit.toLocaleString('en-IN')}) does not equal Credit (₹${credit.toLocaleString('en-IN')}). Difference: ₹${Math.abs(debit - credit).toLocaleString('en-IN')}`);
      return;
    }

    setVoucherError('');
    const newEntry = {
      id: `JRN-2026-${String(journalEntries.length + 95).padStart(3, '0')}`,
      date: newVoucher.date,
      description: newVoucher.description.trim() || 'General Ledger Transfer Adjustment',
      reference: newVoucher.reference.trim() || `REF-${Date.now().toString().slice(-6)}`,
      debitAccount: newVoucher.debitAccount,
      creditAccount: newVoucher.creditAccount,
      debitAmount: debit,
      creditAmount: credit,
      status: 'Posted',
      preparedBy: newVoucher.preparedBy
    };

    if (onUpdateJournalEntries) {
      onUpdateJournalEntries([newEntry, ...journalEntries]);
    }
    if (onAddAuditLog) {
      onAddAuditLog({
        actionType: 'JOURNAL_ENTRY_POSTED',
        target: `${newEntry.id} (₹${debit.toLocaleString('en-IN')})`,
        details: `Posted balanced double-entry voucher: DR [${newEntry.debitAccount}] / CR [${newEntry.creditAccount}]`
      });
    }

    setIsNewVoucherModalOpen(false);
    setNewVoucher({
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
      debitAccount: '1020 - State Bank of India (Treasury A/c 3020491)',
      creditAccount: '4010 - Tuition & Academic Development Fee Income',
      debitAmount: '',
      creditAmount: '',
      preparedBy: 'Mr. S. K. Roy (Senior Accounts Officer)'
    });
  };

  // Handle Reversal of an existing Journal Entry
  const handleReverseJournal = (entry) => {
    if (entry.status === 'Reversed') return;
    const reversal = {
      id: `REV-${entry.id}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      description: `Correction Reversal of ${entry.id}: ${entry.description}`,
      reference: `REV-OF-${entry.reference || entry.id}`,
      debitAccount: entry.creditAccount,
      creditAccount: entry.debitAccount,
      debitAmount: entry.creditAmount,
      creditAmount: entry.debitAmount,
      status: 'Posted',
      preparedBy: 'Mr. S. K. Roy (Accounts Officer)'
    };

    const updated = journalEntries.map(j => j.id === entry.id ? { ...j, status: 'Reversed' } : j);
    if (onUpdateJournalEntries) {
      onUpdateJournalEntries([reversal, ...updated]);
    }
    if (onAddAuditLog) {
      onAddAuditLog({
        actionType: 'JOURNAL_ENTRY_REVERSED',
        target: `${entry.id} (₹${entry.debitAmount.toLocaleString('en-IN')})`,
        details: `Generated linked reversal entry ${reversal.id} swapping DR and CR accounts.`
      });
    }
  };

  // General Ledger drilldown data
  const currentAcc = chartOfAccounts.find(a => a.code === selectedLedgerAccount) || chartOfAccounts[0];
  const ledgerLines = journalEntries.filter(
    j => j.debitAccount.includes(currentAcc.code) || j.creditAccount.includes(currentAcc.code)
  );

  // Bank Reconciliation selected object
  const activeRecon = bankReconciliations.find(b => b.id === selectedBankId) || bankReconciliations[0];

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Pills */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'chart', label: 'Chart of Accounts', icon: Layers },
            { id: 'journal', label: 'Journal Entries & Vouchers', icon: FileText, count: journalEntries.length },
            { id: 'ledger', label: 'General Ledger Drilldown', icon: BookOpen },
            { id: 'cash_bank', label: 'Cash & Bank Books', icon: Landmark },
            { id: 'ar_ap', label: 'A/R & A/P Registers', icon: TrendingUp },
            { id: 'reconciliation', label: 'Bank Reconciliation (BRS)', icon: ShieldCheck },
            { id: 'closing', label: 'Period Closing Checklist', icon: CheckCircle2 }
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
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {activeSubtab === 'chart' && (
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <PlusCircle size={14} /> Add GL Account
            </button>
          )}
          {activeSubtab === 'journal' && (
            <button
              onClick={() => setIsNewVoucherModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <PlusCircle size={14} /> New Journal Voucher
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 1: CHART OF ACCOUNTS
      ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'chart' && (
        <div className="space-y-5">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">1000 - Assets</span>
              <div className="text-lg font-black text-blue-700 mt-1">₹{(totalAssets / 100000).toFixed(2)} L</div>
              <span className="text-[10px] text-slate-400">Cash, Bank, Equipment, Dues</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">2000 - Liabilities</span>
              <div className="text-lg font-black text-rose-700 mt-1">₹{(totalLiabilities / 100000).toFixed(2)} L</div>
              <span className="text-[10px] text-slate-400">Payables, Deposits, Salary</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">3000 - Equity &amp; Fund</span>
              <div className="text-lg font-black text-purple-700 mt-1">₹{(totalEquity / 100000).toFixed(2)} L</div>
              <span className="text-[10px] text-slate-400">Governing Fund &amp; Endowments</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">4000 - Income</span>
              <div className="text-lg font-black text-emerald-700 mt-1">₹{(totalIncome / 100000).toFixed(2)} L</div>
              <span className="text-[10px] text-slate-400">Tuition, Hostel, Bus, Exam</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">5000 - Expenses</span>
              <div className="text-lg font-black text-amber-700 mt-1">₹{(totalExpenses / 100000).toFixed(2)} L</div>
              <span className="text-[10px] text-slate-400">Salaries, Power, Maintenance</span>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search account code or title (e.g. 1020, SBI, Salary)..."
                  value={coSearch}
                  onChange={(e) => setCoSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Category:</span>
              {['ALL', 'Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCoCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                    coCategoryFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Standard Chart of Accounts (COA)</h3>
                <p className="text-xs text-slate-500">Autonomous Institute Multi-Tier Accounting Ledger Structure</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 border border-slate-200 rounded-md">
                {filteredAccounts.length} Accounts Configured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Account Code</th>
                    <th className="py-3 px-4">Account Title &amp; Description</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Subtype</th>
                    <th className="py-3 px-4 text-right">Current Balance (₹)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map(acc => {
                    const isDebitNormal = acc.category === 'Assets' || acc.category === 'Expenses';
                    return (
                      <tr key={acc.code} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {acc.code}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 text-sm block">{acc.name}</span>
                          <span className="text-[11px] text-slate-400">Normal Balance: {isDebitNormal ? 'Debit (DR)' : 'Credit (CR)'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.category === 'Assets' ? 'bg-blue-100 text-blue-700' :
                            acc.category === 'Liabilities' ? 'bg-rose-100 text-rose-700' :
                            acc.category === 'Equity' ? 'bg-purple-100 text-purple-700' :
                            acc.category === 'Income' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {acc.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {acc.type}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          ₹{Number(acc.balance).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedLedgerAccount(acc.code);
                              setActiveSubtab('ledger');
                            }}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                          >
                            <BookOpen size={12} /> Drilldown
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 2: JOURNAL ENTRIES & BALANCED VOUCHERS
      ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'journal' && (
        <div className="space-y-5">
          {/* Status Filter & Search */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search journal entries, references or descriptions..."
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              {['ALL', 'Posted', 'Draft', 'Reversed'].map(st => (
                <button
                  key={st}
                  onClick={() => setJournalStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                    journalStatusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Journal Entries List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institutional Double-Entry Journal Register</h3>
                <p className="text-xs text-slate-500">Every posted voucher satisfies: Total Debits (DR) ≡ Total Credits (CR)</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Strict Double-Entry Enforced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Posting Date</th>
                    <th className="py-3 px-4">Description &amp; Reference</th>
                    <th className="py-3 px-4">Debit Account (DR)</th>
                    <th className="py-3 px-4">Credit Account (CR)</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJournals.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {entry.id}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block">{entry.description}</span>
                        <span className="text-[11px] text-slate-400">Ref: {entry.reference || 'N/A'} · By: {entry.preparedBy}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span className="text-blue-700 font-bold mr-1">DR:</span>
                        {entry.debitAccount}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span className="text-emerald-700 font-bold mr-1">CR:</span>
                        {entry.creditAccount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{Number(entry.debitAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.status === 'Posted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          entry.status === 'Reversed' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {entry.status === 'Posted' && !entry.id.startsWith('REV-') ? (
                          <button
                            onClick={() => handleReverseJournal(entry)}
                            className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-semibold px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition"
                            title="Generate offsetting reversal voucher"
                          >
                            <RotateCcw size={11} /> Reverse
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 3: GENERAL LEDGER DRILLDOWN
      ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'ledger' && (
        <div className="space-y-5">
          {/* Account Selector Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <BookOpen size={22} className="text-blue-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Select General Ledger Account</h4>
                <p className="text-xs text-slate-500">Real-time debit, credit and closing balance audit trail</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedLedgerAccount}
                onChange={(e) => setSelectedLedgerAccount(e.target.value)}
                className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 shadow-xs outline-none focus:border-blue-500"
              >
                {chartOfAccounts.map(acc => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} — {acc.name} ({acc.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Account Profile Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Active Account Head</span>
              <h3 className="text-xl font-bold mt-0.5">{currentAcc.code} — {currentAcc.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Classification: {currentAcc.category} · Subtype: {currentAcc.type}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Current Realized Balance</span>
              <div className="text-3xl font-black text-emerald-400 mt-0.5">
                ₹{Number(currentAcc.balance).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400">Audited Closing Position</span>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Transaction History for {currentAcc.name}
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {ledgerLines.length} Ledger Line(s) Found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Voucher No</th>
                    <th className="py-2.5 px-4">Particulars / Counter-Account</th>
                    <th className="py-2.5 px-4 text-right">Debit (₹)</th>
                    <th className="py-2.5 px-4 text-right">Credit (₹)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerLines.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No secondary journal postings for this account in current test batch.
                      </td>
                    </tr>
                  ) : (
                    ledgerLines.map(line => {
                      const isDebit = line.debitAccount.includes(currentAcc.code);
                      const counterAcc = isDebit ? line.creditAccount : line.debitAccount;
                      return (
                        <tr key={line.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{line.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">{line.id}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 block">{line.description}</span>
                            <span className="text-[11px] text-slate-500">Offset: {counterAcc}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                            {isDebit ? `₹${Number(line.debitAmount).toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            {!isDebit ? `₹${Number(line.creditAmount).toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {line.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 4: CASH & BANK BOOKS
      ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'cash_bank' && (
        <div className="space-y-5">
          {/* Bank & Cash Balances Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Cash In Hand</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">Vault 1010</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">₹4,50,000</div>
              <p className="text-xs text-slate-500 mt-1">Admin Cash Counter Vault Balance</p>
            </div>

            <div className="bg-white border border-blue-200 bg-blue-50/20 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase">State Bank of India</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">Treasury A/c 3020491</span>
              </div>
              <div className="text-2xl font-black text-blue-800 mt-2">₹1,25,40,000</div>
              <p className="text-xs text-blue-600 mt-1">Principal Institutional Treasury Account</p>
            </div>

            <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase">HDFC Bank Limited</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">Collection A/c 501002</span>
              </div>
              <div className="text-2xl font-black text-emerald-800 mt-2">₹54,60,000</div>
              <p className="text-xs text-emerald-600 mt-1">Direct Student NetBanking &amp; UPI Collection</p>
            </div>
          </div>

          {/* Cash & Bank Log Strip */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Institutional Bank Movements (Oct 2026)</h4>
                <p className="text-xs text-slate-500">Live feed of inward fee receipts and sanctioned vendor cheques</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                Total Available Liquid Funds: ₹1,84,50,000
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Bank / Channel</th>
                    <th className="py-2.5 px-3">Transaction Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Inflow (₹)</th>
                    <th className="py-2.5 px-3 text-right">Outflow (₹)</th>
                    <th className="py-2.5 px-3 text-right">Running Book Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-600">18-Oct-2026</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">HDFC Collection A/c</td>
                    <td className="py-2.5 px-3">Batch 44 Student Online Tuition Collection</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Inflow</span></td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">₹4,85,000</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹54,60,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-600">15-Oct-2026</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">SBI Treasury A/c</td>
                    <td className="py-2.5 px-3">BSNL Leased Line Internet Chq #491024</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Outflow</span></td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">₹1,45,000</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹1,25,40,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-600">10-Oct-2026</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">Accounts Cash Vault</td>
                    <td className="py-2.5 px-3">Daily Fee Counter Realization Deposit to SBI</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Contra</span></td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">₹2,00,000</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹4,50,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 5: A/R & A/P CONSOLIDATED REGISTERS
      ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'ar_ap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Accounts Receivable (A/R) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Asset 1040</span>
                <h4 className="text-sm font-bold text-slate-900">Accounts Receivable (Student Arrears)</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-rose-600">₹51,30,000</span>
                <span className="text-[10px] text-slate-400 block">Total Dues</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Current Not Due (&lt; 15 Days)</span>
                  <span className="text-slate-500 text-[11px]">Due Date: 15-Nov-2026</span>
                </div>
                <span className="font-bold font-mono text-emerald-600">₹32,40,000</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-900 block">1–30 Days Overdue</span>
                  <span className="text-amber-700 text-[11px]">Late penalty notices dispatched</span>
                </div>
                <span className="font-bold font-mono text-amber-800">₹14,50,000</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-rose-900 block">&gt; 30 Days Overdue (Critical Defaulters)</span>
                  <span className="text-rose-700 text-[11px]">Accounts holding semester clearance</span>
                </div>
                <span className="font-bold font-mono text-rose-700">₹4,40,000</span>
              </div>
            </div>
          </div>

          {/* Accounts Payable (A/P) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Liability 2010</span>
                <h4 className="text-sm font-bold text-slate-900">Accounts Payable (Vendor &amp; Salary)</h4>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900">₹89,20,000</span>
                <span className="text-[10px] text-slate-400 block">Total Outstanding</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Faculty &amp; Staff Salary Payables</span>
                  <span className="text-slate-500 text-[11px]">Monthly salary provision for 222 personnel</span>
                </div>
                <span className="font-bold font-mono text-slate-900">₹82,40,000</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">Vendor &amp; Contractor Invoices</span>
                  <span className="text-blue-700 text-[11px]">TechCore, Utkal Scientific, Eastern Books</span>
                </div>
                <span className="font-bold font-mono text-blue-800">₹6,80,000</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-900 block">Statutory Deductions (EPF &amp; TDS)</span>
                  <span className="text-purple-700 text-[11px]">To be remitted before 7th of next month</span>
                </div>
                <span className="font-bold font-mono text-purple-800">₹9,40,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 6: BANK RECONCILIATION STATEMENT (BRS)
      ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'reconciliation' && (
        <div className="space-y-5">
          {/* Bank selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Institutional Bank Reconciliation (BRS)</h4>
              <p className="text-xs text-slate-500">Compare internal cash book records against official bank statement feeds</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 shadow-xs outline-none focus:border-blue-500"
              >
                {bankReconciliations.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} — {b.statementDate}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BRS Calculation Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">{activeRecon.bankName}</span>
                <h3 className="text-base font-bold text-slate-900">Reconciliation as on {activeRecon.statementDate}</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={13} /> {activeRecon.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-bold block">Internal Book Balance</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  ₹{Number(activeRecon.bookBalance).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">Recorded in College GL</span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-[11px] text-blue-700 font-bold block">Bank Statement Balance</span>
                <span className="text-lg font-black text-blue-800 mt-1 block">
                  ₹{Number(activeRecon.bankStatementBalance).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-600">Per Bank e-Statement</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-[11px] text-amber-800 font-bold block">Unpresented Cheques (+)</span>
                <span className="text-lg font-black text-amber-900 mt-1 block">
                  ₹{Number(activeRecon.unpresentedCheques).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-700">Issued but not debited by bank</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[11px] text-emerald-800 font-bold block">Calculated Variance</span>
                <span className="text-lg font-black text-emerald-800 mt-1 block">
                  ₹0.00
                </span>
                <span className="text-[10px] text-emerald-600">Perfect 100% Match</span>
              </div>
            </div>

            {/* Reconciliation Verification Checks */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Auditor Clearance Checklist
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reconChecklist.check1}
                    onChange={(e) => setReconChecklist({ ...reconChecklist, check1: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>All Direct Student Net Banking and UPI credits matched with payment gateway logs.</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reconChecklist.check2}
                    onChange={(e) => setReconChecklist({ ...reconChecklist, check2: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>All outward vendor and salary NEFT disbursements verified against bank debit advices.</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reconChecklist.check3}
                    onChange={(e) => setReconChecklist({ ...reconChecklist, check3: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Bank interest earned and service charges recorded via contra journal entries.</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Reconciled by: <strong className="text-slate-800">{activeRecon.reconciledBy}</strong> on {activeRecon.dateCompleted}
                </span>

                <button
                  onClick={() => {
                    setIsReconSuccess(true);
                    setTimeout(() => setIsReconSuccess(false), 3000);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 size={14} /> Re-verify BRS Statement
                </button>
              </div>

              {isReconSuccess && (
                <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2">
                  <CheckCircle2 size={16} /> BRS Statement re-verified. 0 variance confirmed for {activeRecon.bankName}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 7: FINANCIAL PERIOD CLOSING
      ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'closing' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Fiscal Governance</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Financial Period Closing Checklist — October 2026
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Freeze institutional ledgers, prevent back-dated alterations, and generate audit-ready trial balance
                </p>
              </div>

              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                isPeriodClosed
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {isPeriodClosed ? 'Period Locked / Read-Only' : 'Open for Fiscal Postings'}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {closingSteps.map(step => (
                <div
                  key={step.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{step.title}</span>
                      <span className="text-[11px] text-slate-500">{step.note}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Passed (100%)
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong>Simulated Period Closing Warning:</strong> Freezing the fiscal period locks all journal vouchers, fee adjustments, and expense entries up to 31-Oct-2026. Any further adjustments must be booked in subsequent open periods through rectification vouchers.
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsPeriodClosed(!isPeriodClosed);
                  if (onAddAuditLog) {
                    onAddAuditLog({
                      actionType: isPeriodClosed ? 'PERIOD_REOPENED' : 'PERIOD_CLOSED_LOCKED',
                      target: 'October 2026 Financial Period',
                      details: isPeriodClosed ? 'Authorized reopening of October period.' : 'Successfully locked October 2026 period after completing all 6 verification checks.'
                    });
                  }
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition ${
                  isPeriodClosed
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <ShieldCheck size={15} />
                {isPeriodClosed ? 'Unlock Fiscal Period (Demo)' : 'Lock & Finalize October 2026 Ledger'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: ADD GL ACCOUNT
      ───────────────────────────────────────────────────────────── */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Add New General Ledger Account</h3>
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Code</label>
                <input
                  type="text"
                  placeholder="e.g. 1060 or 5050"
                  value={newAccountForm.code}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Solar Energy Maintenance Fund"
                  value={newAccountForm.name}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newAccountForm.category}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium bg-white"
                  >
                    <option value="Assets">Assets (1000)</option>
                    <option value="Liabilities">Liabilities (2000)</option>
                    <option value="Equity">Equity (3000)</option>
                    <option value="Income">Income (4000)</option>
                    <option value="Expenses">Expenses (5000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Subtype</label>
                  <input
                    type="text"
                    placeholder="e.g. Current Asset"
                    value={newAccountForm.type}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newAccountForm.balance}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: NEW BALANCED JOURNAL VOUCHER
      ───────────────────────────────────────────────────────────── */}
      {isNewVoucherModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Create Double-Entry Journal Voucher</h3>
                <p className="text-[11px] text-slate-500">Debits must strictly equal credits before posting</p>
              </div>
              <button
                onClick={() => {
                  setIsNewVoucherModalOpen(false);
                  setVoucherError('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-5 space-y-4 text-xs">
              {voucherError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                  <span>{voucherError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Voucher Date</label>
                  <input
                    type="date"
                    value={newVoucher.date}
                    onChange={(e) => setNewVoucher({ ...newVoucher, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">External Reference / Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-OCT-45"
                    value={newVoucher.reference}
                    onChange={(e) => setNewVoucher({ ...newVoucher, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transaction Description / Particulars</label>
                <input
                  type="text"
                  placeholder="e.g. Tuition fee realization credit from HDFC to operating fund"
                  value={newVoucher.description}
                  onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              {/* Debit Side */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase">Debit Account (DR)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={newVoucher.debitAccount}
                      onChange={(e) => setNewVoucher({ ...newVoucher, debitAccount: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      {chartOfAccounts.map(acc => (
                        <option key={acc.code} value={`${acc.code} - ${acc.name}`}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="DR Amount ₹"
                      value={newVoucher.debitAmount}
                      onChange={(e) => setNewVoucher({ ...newVoucher, debitAmount: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Credit Side */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Credit Account (CR)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={newVoucher.creditAccount}
                      onChange={(e) => setNewVoucher({ ...newVoucher, creditAccount: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                    >
                      {chartOfAccounts.map(acc => (
                        <option key={acc.code} value={`${acc.code} - ${acc.name}`}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="CR Amount ₹"
                      value={newVoucher.creditAmount}
                      onChange={(e) => setNewVoucher({ ...newVoucher, creditAmount: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewVoucherModalOpen(false);
                    setVoucherError('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Validate &amp; Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
