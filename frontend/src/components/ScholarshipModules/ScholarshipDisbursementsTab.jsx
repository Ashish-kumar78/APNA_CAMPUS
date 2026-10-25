import React, { useState } from 'react';
import {
  Send,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Building2,
  Calendar,
  Layers,
  FileSpreadsheet,
  PlusCircle,
  FileText,
  X,
  CreditCard,
  Briefcase
} from 'lucide-react';

export default function ScholarshipDisbursementsTab({
  disbursements,
  fundingSources,
  applications,
  onUpdateDisbursements,
  onAddAuditLog
}) {
  const [selectedSubtab, setSelectedSubtab] = useState('disbursements'); // 'disbursements' | 'sponsors' | 'reconciliation'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form for Recording Mock Disbursement
  const [recordForm, setRecordForm] = useState({
    id: '',
    awardId: 'AWD-2026-44',
    studentId: '2305201001',
    studentName: 'Rakesh Das',
    schemeName: 'PRERANA Post-Matric State Scholarship',
    tranche: 'Tranche 2 (50%)',
    scheduledAmount: 22500,
    disbursedAmount: 22500,
    disbursedDate: '24 Oct 2026',
    utrNumber: 'SBIN0048291048291',
    fundingSource: 'State Govt. ST/SC Dept DBT Fund',
    remarks: 'Autumn semester clearance certified; DBT credit verified.'
  });

  // Calculate totals
  const totalCommitted = disbursements.reduce((sum, d) => sum + d.scheduledAmount, 0);
  const totalDisbursed = disbursements
    .filter(d => d.status === 'Disbursed')
    .reduce((sum, d) => sum + d.disbursedAmount, 0);
  const totalPending = totalCommitted - totalDisbursed;

  // Filter disbursements
  const filteredDisbursements = disbursements.filter(d => {
    const matchesSearch = d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.utrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.schemeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenRecordModal = (disb) => {
    setRecordForm({
      id: disb ? disb.id : `DISB-2026-${String(disbursements.length + 1).padStart(3, '0')}`,
      awardId: disb ? disb.awardId : 'AWD-2026-47',
      studentId: disb ? disb.studentId : '2401432265',
      studentName: disb ? disb.studentName : 'Bishnu Prasad Sahoo',
      schemeName: disb ? disb.schemeName : 'PRERANA Post-Matric State Scholarship',
      tranche: disb ? disb.tranche : 'Tranche 1 (50%)',
      scheduledAmount: disb ? disb.scheduledAmount : 22500,
      disbursedAmount: disb ? disb.scheduledAmount : 22500,
      disbursedDate: '24 Oct 2026',
      utrNumber: `SBIN${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      fundingSource: disb ? disb.fundingSource : 'State Govt. ST/SC Dept DBT Fund',
      remarks: 'Automated treasury batch release credit recorded.'
    });
    setIsRecordModalOpen(true);
  };

  const handleSaveDisbursement = (e) => {
    e.preventDefault();
    const existing = disbursements.find(d => d.id === recordForm.id);
    let updated;

    if (existing) {
      updated = disbursements.map(d => {
        if (d.id === recordForm.id) {
          return {
            ...d,
            status: 'Disbursed',
            disbursedAmount: Number(recordForm.disbursedAmount),
            disbursedDate: recordForm.disbursedDate,
            utrNumber: recordForm.utrNumber,
            remarks: recordForm.remarks
          };
        }
        return d;
      });
    } else {
      updated = [
        {
          ...recordForm,
          status: 'Disbursed',
          scheduledAmount: Number(recordForm.scheduledAmount),
          disbursedAmount: Number(recordForm.disbursedAmount)
        },
        ...disbursements
      ];
    }

    onUpdateDisbursements(updated);
    setIsRecordModalOpen(false);

    onAddAuditLog({
      actionType: 'MOCK_DISBURSEMENT_RECORDED',
      target: `${recordForm.id} (${recordForm.studentName} - ₹${recordForm.disbursedAmount})`,
      details: `UTR: ${recordForm.utrNumber} recorded under ${recordForm.fundingSource}. Demonstration entry.`
    });
  };

  const handleExportCSV = () => {
    const headers = ['Disbursement ID', 'Award ID', 'Student Name', 'Scheme', 'Tranche', 'Scheduled Amount', 'Disbursed Amount', 'Status', 'UTR Number', 'Date'];
    const rows = disbursements.map(d => [
      d.id,
      d.awardId,
      d.studentName,
      `"${d.schemeName}"`,
      d.tranche,
      d.scheduledAmount,
      d.disbursedAmount,
      d.status,
      d.utrNumber,
      d.disbursedDate || d.scheduledDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Scholarship_Disbursements_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Financial Health Summary Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Approved Award Commitment
            </span>
            <div className="text-2xl font-black text-amber-300 mt-0.5">
              ₹{(totalCommitted / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Sanctioned for Session 2026–27</span>
          </div>
          <div className="p-3 bg-slate-800 text-amber-300 rounded-lg">
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Actual Disbursed to Date
            </span>
            <div className="text-2xl font-black text-emerald-200 mt-0.5">
              ₹{(totalDisbursed / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-xs text-emerald-400 mt-1 block">
              Reconciled Bank UTR / Fee Credit
            </span>
          </div>
          <div className="p-3 bg-emerald-900/80 text-emerald-300 rounded-lg">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-blue-950 text-white rounded-xl p-4 border border-blue-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
              Outstanding Scheduled Tranche
            </span>
            <div className="text-2xl font-black text-blue-200 mt-0.5">
              ₹{(totalPending / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-xs text-blue-400 mt-1 block">
              Spring Tranche 2 Pending Attendance
            </span>
          </div>
          <div className="p-3 bg-blue-900/80 text-blue-300 rounded-lg">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Subtab Toggle and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSubtab('disbursements')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'disbursements'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Disbursement Register ({disbursements.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('sponsors')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'sponsors'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sponsor Funding Pools ({fundingSources.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('reconciliation')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'reconciliation'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Disbursement Reconciliation Audit
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Download size={13} /> Export CSV Ledger
          </button>
          <button
            onClick={() => handleOpenRecordModal(null)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle size={13} /> Record Disbursement
          </button>
        </div>
      </div>

      {/* Subtab 1: Disbursement Register */}
      {selectedSubtab === 'disbursements' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipient, UTR reference, disbursement ID, or scheme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
              >
                <option value="All">All Disbursement Statuses</option>
                <option value="Disbursed">Disbursed (Credited)</option>
                <option value="Scheduled">Scheduled (Future)</option>
                <option value="Pending Release">Pending Release</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Disbursement ID & Award</th>
                  <th className="py-3 px-4">Recipient Student</th>
                  <th className="py-3 px-4">Scheme & Tranche</th>
                  <th className="py-3 px-4">Scheduled / Disbursed</th>
                  <th className="py-3 px-4">Bank Transaction UTR</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDisbursements.map(disb => (
                  <tr key={disb.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">{disb.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{disb.awardId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{disb.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {disb.studentId}</div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate" title={disb.schemeName}>
                        {disb.schemeName}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mt-1 inline-block">
                        {disb.tranche}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        ₹{(disb.disbursedAmount || disb.scheduledAmount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Date: {disb.disbursedDate || disb.scheduledDate}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                      {disb.utrNumber}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        disb.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-800' :
                        disb.status === 'Pending Release' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {disb.status === 'Disbursed' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {disb.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {disb.status !== 'Disbursed' ? (
                        <button
                          onClick={() => handleOpenRecordModal(disb)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                        >
                          Record UTR
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Sponsor Funding Pools */}
      {selectedSubtab === 'sponsors' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                <Building2 size={16} /> Statutory & Sponsored Endowment Funding Ledgers
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Centralized allocation tracking across Government Grants, Trustee Endowment, and Corporate CSR.
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-900/60 text-blue-200 px-2.5 py-1 rounded border border-blue-800">
              AUDITED 2026-27
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fundingSources.map(fund => {
              const utilPercent = Math.round((fund.committedAmount / fund.totalAllocated) * 100);

              return (
                <div key={fund.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {fund.id} · {fund.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{fund.name}</h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      {fund.beneficiaries} Awardees
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanctioned Pool</span>
                      <strong className="text-slate-800">₹{(fund.totalAllocated / 100000).toFixed(2)}L</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Committed</span>
                      <strong className="text-amber-700">₹{(fund.committedAmount / 100000).toFixed(2)}L</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Disbursed (Cash)</span>
                      <strong className="text-emerald-700">₹{(fund.disbursedAmount / 100000).toFixed(2)}L</strong>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Fund Commitment Level</span>
                      <strong className="text-slate-800">{utilPercent}% Committed</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${utilPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Uncommitted Buffer:</span>
                    <strong className="text-slate-900">₹{(fund.remainingAllocation / 100000).toFixed(2)} Lakhs</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 3: Reconciliation Audit */}
      {selectedSubtab === 'reconciliation' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Disbursement Reconciliation & Statutory Clearing</h4>
              <p className="text-xs text-slate-500">Comparison of college approved sanction registers with bank DBT statement.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Zero Variance Logged
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900 block">State Treasury Batch #DBT-2026-SEP</strong>
                <span className="text-slate-500">PRERANA Post-Matric Tranche 1 release to student bank accounts</span>
              </div>
              <div className="text-right">
                <strong className="text-emerald-700 text-sm">Reconciled 100%</strong>
                <span className="text-[10px] text-slate-400 block">SBI Treasury Server Match</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900 block">Chairman Fellowship Fee Waiver Adjustments</strong>
                <span className="text-slate-500">Accounts bursar tuition invoice ledger credits</span>
              </div>
              <div className="text-right">
                <strong className="text-emerald-700 text-sm">Reconciled 100%</strong>
                <span className="text-[10px] text-slate-400 block">Accounts Portal Sync</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Mock Disbursement Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-400" />
                Record Scholarship Disbursement Entry
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDisbursement} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <strong>Simulated Financial Operation:</strong> This module registers institutional ledger entries and fictional bank reference codes without initiating live banking calls.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Disbursement ID</label>
                  <input
                    type="text"
                    value={recordForm.id}
                    disabled
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-slate-50 font-mono text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Award Reference ID</label>
                  <input
                    type="text"
                    value={recordForm.awardId}
                    onChange={(e) => setRecordForm({ ...recordForm, awardId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={recordForm.studentName}
                    onChange={(e) => setRecordForm({ ...recordForm, studentName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Student College ID</label>
                  <input
                    type="text"
                    value={recordForm.studentId}
                    onChange={(e) => setRecordForm({ ...recordForm, studentId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Disbursed Amount (₹)</label>
                  <input
                    type="number"
                    value={recordForm.disbursedAmount}
                    onChange={(e) => setRecordForm({ ...recordForm, disbursedAmount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bank Transaction UTR Ref</label>
                  <input
                    type="text"
                    value={recordForm.utrNumber}
                    onChange={(e) => setRecordForm({ ...recordForm, utrNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Funding Ledger Source</label>
                <select
                  value={recordForm.fundingSource}
                  onChange={(e) => setRecordForm({ ...recordForm, fundingSource: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                >
                  <option value="State Govt. ST/SC Dept DBT Fund">State Govt. ST/SC Dept DBT Fund</option>
                  <option value="Institutional Chairman Fellowship Fund">Institutional Chairman Fellowship Fund</option>
                  <option value="National Scholarship Portal MoE Pool">National Scholarship Portal MoE Pool</option>
                  <option value="Tata Community Trust CSR Fund">Tata Community Trust CSR Fund</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reconciliation Remarks</label>
                <textarea
                  rows="2"
                  value={recordForm.remarks}
                  onChange={(e) => setRecordForm({ ...recordForm, remarks: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm"
                >
                  Record Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
