import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Users,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
  DollarSign,
  HelpCircle,
  Hash
} from 'lucide-react';
import { ACCOUNTS_OFFICER } from './accountsData';

export default function AccountsSettingsTab({
  onResetDemoData,
  onAddAuditLog,
  initialSubtab = 'institution'
}) {
  const [activeSection, setActiveSection] = useState(initialSubtab); // 'institution' | 'fee_heads' | 'salary_rules' | 'numbering' | 'gateways' | 'approvals' | 'safety'

  useEffect(() => {
    if (initialSubtab) {
      setActiveSection(initialSubtab);
    }
  }, [initialSubtab]);

  // Settings State
  const [instSettings, setInstSettings] = useState({
    name: 'Apna Campus Autonomous College of Engineering & Technology',
    affiliation: 'Autonomous Institution · Affiliated to BPUT Odisha',
    directorate: 'Directorate of Finance, Accounts & Institutional Bursar',
    address: 'Central Administrative Building, Ground Floor Room 104',
    academicYear: '2026–2027',
    financialYear: 'FY 2026–2027',
    currency: 'INR (₹)',
    dateFormat: 'DD-MMM-YYYY',
    numberFormat: 'Indian Numbering System (e.g. ₹12,50,000.00)'
  });

  const [feeRules, setFeeRules] = useState({
    gracePeriodDays: 15,
    lateFeePerDay: 50,
    maxLateFeeLimit: 2500,
    concessionApprovalRequired: true,
    installmentFacilityAllowed: true
  });

  const [salaryRules, setSalaryRules] = useState({
    daPercentage: 50,
    hraPercentage: 16,
    pfPercentage: 12,
    profTaxFixed: 200,
    tdsApplicable: true
  });

  const [numberingPrefixes, setNumberingPrefixes] = useState({
    receiptPrefix: 'RCPT-2026-',
    invoicePrefix: 'INV-2026-',
    vendorBillPrefix: 'BILL-2026-',
    journalPrefix: 'JRN-2026-',
    refundPrefix: 'REF-2026-'
  });

  const [channels, setChannels] = useState({
    upiQr: true,
    netBanking: true,
    cards: true,
    bankChallan: true,
    cashCounter: true,
    maxCashDailyLimit: 50000
  });

  const [thresholds, setThresholds] = useState({
    accountsOfficerLimit: 50000,
    bursarLimit: 500000,
    principalLimit: 2500000
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (sectionName) => {
    setSaveSuccessMsg(`${sectionName} configurations saved to local persistent storage.`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);

    if (onAddAuditLog) {
      onAddAuditLog({
        actionType: 'FINANCE_CONFIG_UPDATED',
        target: sectionName,
        details: `Updated parameters under ${sectionName} by ${ACCOUNTS_OFFICER.name}`
      });
    }
  };

  const handleConfirmReset = () => {
    if (onResetDemoData) {
      onResetDemoData();
    }
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'institution', label: 'Institutional Profile', icon: Building2 },
            { id: 'fee_heads', label: 'Fee Heads & Late Rules', icon: Layers },
            { id: 'salary_rules', label: 'Salary & Statutory Rules', icon: Users },
            { id: 'numbering', label: 'Voucher Numbering', icon: Hash },
            { id: 'gateways', label: 'Payment Channels', icon: CreditCard },
            { id: 'approvals', label: 'Approval Thresholds', icon: ShieldCheck },
            { id: 'safety', label: 'Safety & Reset Demo', icon: RotateCcw }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: INSTITUTIONAL PROFILE
      ───────────────────────────────────────────────────────────── */}
      {activeSection === 'institution' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Institutional &amp; Fiscal Profile</h3>
              <p className="text-xs text-slate-500">Autonomous College Identification &amp; Master Period Control</p>
            </div>
            <button
              onClick={() => handleSaveSettings('Institutional Profile')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save size={13} /> Save Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Institution Legal Name</label>
              <input
                type="text"
                value={instSettings.name}
                onChange={(e) => setInstSettings({ ...instSettings, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Autonomous Status / Affiliation</label>
              <input
                type="text"
                value={instSettings.affiliation}
                onChange={(e) => setInstSettings({ ...instSettings, affiliation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Active Academic Year</label>
              <input
                type="text"
                value={instSettings.academicYear}
                onChange={(e) => setInstSettings({ ...instSettings, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Active Financial Fiscal Year</label>
              <input
                type="text"
                value={instSettings.financialYear}
                onChange={(e) => setInstSettings({ ...instSettings, financialYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Currency Symbol</label>
              <input
                type="text"
                value={instSettings.currency}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Number Formatting Convention</label>
              <input
                type="text"
                value={instSettings.numberFormat}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: FEE HEADS & LATE RULES
      ───────────────────────────────────────────────────────────── */}
      {activeSection === 'fee_heads' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fee Heads &amp; Late Penalty Policies</h3>
              <p className="text-xs text-slate-500">Autonomous Fee Tariff rules and defaulter grace configurations</p>
            </div>
            <button
              onClick={() => handleSaveSettings('Fee & Late Rules')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save size={13} /> Save Rules
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grace Period (Days after Due Date)</label>
              <input
                type="number"
                value={feeRules.gracePeriodDays}
                onChange={(e) => setFeeRules({ ...feeRules, gracePeriodDays: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">No penalty assessed within grace period</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Late Fee Penalty per Day (₹)</label>
              <input
                type="number"
                value={feeRules.lateFeePerDay}
                onChange={(e) => setFeeRules({ ...feeRules, lateFeePerDay: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Accrued daily after grace expires</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Maximum Late Fee Cap (₹)</label>
              <input
                type="number"
                value={feeRules.maxLateFeeLimit}
                onChange={(e) => setFeeRules({ ...feeRules, maxLateFeeLimit: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Ceiling limit on penal charges</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: SALARY & STATUTORY RULES
      ───────────────────────────────────────────────────────────── */}
      {activeSection === 'salary_rules' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7th Pay Commission Salary &amp; Statutory Formulas</h3>
              <p className="text-xs text-slate-500">Autonomous institutional allowance percentages and statutory deductions</p>
            </div>
            <button
              onClick={() => handleSaveSettings('Salary Components')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save size={13} /> Save Components
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Dearness Allowance (DA %)</label>
              <input
                type="number"
                value={salaryRules.daPercentage}
                onChange={(e) => setSalaryRules({ ...salaryRules, daPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">50% of Basic Pay</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">House Rent Allowance (HRA %)</label>
              <input
                type="number"
                value={salaryRules.hraPercentage}
                onChange={(e) => setSalaryRules({ ...salaryRules, hraPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">16% of Basic Pay</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Employee Provident Fund (PF %)</label>
              <input
                type="number"
                value={salaryRules.pfPercentage}
                onChange={(e) => setSalaryRules({ ...salaryRules, pfPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">12% Statutory EPF</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Professional Tax (₹ / Month)</label>
              <input
                type="number"
                value={salaryRules.profTaxFixed}
                onChange={(e) => setSalaryRules({ ...salaryRules, profTaxFixed: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">State Government Slab</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: VOUCHER & RECEIPT NUMBERING
      ───────────────────────────────────────────────────────────── */}
      {activeSection === 'numbering' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Document &amp; Voucher Numbering Prefixes</h3>
              <p className="text-xs text-slate-500">Autonomous sequence standards for receipts, invoices, and journal entries</p>
            </div>
            <button
              onClick={() => handleSaveSettings('Numbering Prefixes')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save size={13} /> Save Prefixes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 font-sans">Fee Receipt Prefix</label>
              <input
                type="text"
                value={numberingPrefixes.receiptPrefix}
                onChange={(e) => setNumberingPrefixes({ ...numberingPrefixes, receiptPrefix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block font-sans">e.g. RCPT-2026-0941</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 font-sans">Fee Invoice Prefix</label>
              <input
                type="text"
                value={numberingPrefixes.invoicePrefix}
                onChange={(e) => setNumberingPrefixes({ ...numberingPrefixes, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block font-sans">e.g. INV-2026-052</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 font-sans">Journal Voucher Prefix</label>
              <input
                type="text"
                value={numberingPrefixes.journalPrefix}
                onChange={(e) => setNumberingPrefixes({ ...numberingPrefixes, journalPrefix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block font-sans">e.g. JRN-2026-091</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: PAYMENT CHANNELS
      ───────────────────────────────────────────────────────────── */}
      {activeSection === 'gateways' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Collection Channels &amp; Gateway Toggles</h3>
              <p className="text-xs text-slate-500">Configure allowed student collection methods and daily cash thresholds</p>
            </div>
            <button
              onClick={() => handleSaveSettings('Payment Channels')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save size={13} /> Save Channels
            </button>
          </div>

          <div className="space-y-3">
            {[
              { key: 'upiQr', label: 'UPI / BharatQR Instant Collection Counter', desc: 'Zero merchant discount rate (MDR) direct credit to HDFC Collection A/c' },
              { key: 'netBanking', label: 'Online NetBanking & Payment Gateway Portal', desc: 'Integration with SBI and HDFC online net banking portals' },
              { key: 'cards', label: 'Point-of-Sale (POS) Debit & Credit Cards', desc: 'Accounts counter RuPay / Visa swipe terminal' },
              { key: 'bankChallan', label: 'Offline Bank Challan (SBI Treasury)', desc: 'Printed 3-part bank challan deposited directly at college branch' },
              { key: 'cashCounter', label: 'Physical Cash Collection Counter', desc: 'Subject to maximum daily receipt threshold compliance' }
            ].map(ch => (
              <div key={ch.key} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{ch.label}</span>
                  <span className="text-[11px] text-slate-500">{ch.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={channels[ch.key]}
                  onChange={(e) => setChannels({ ...channels, [ch.key]: e.target.checked })}
                  className="rounded text-blue-600 h-4 w-4"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: APPROVAL THRESHOLDS
      ───────────────────────────────────────────────────────────── */}
      {activeSection === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Tier Financial Approval Delegation</h3>
              <p className="text-xs text-slate-500">Autonomous institutional spending sanction thresholds</p>
            </div>
            <button
              onClick={() => handleSaveSettings('Approval Thresholds')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Save size={13} /> Save Thresholds
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
              <span className="text-xs font-bold text-blue-900 block">Senior Accounts Officer Limit</span>
              <p className="text-[11px] text-blue-700 mt-1">Autonomous approval for routine utility and minor bills</p>
              <div className="mt-3">
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Max Sanction Limit (₹)</label>
                <input
                  type="number"
                  value={thresholds.accountsOfficerLimit}
                  onChange={(e) => setThresholds({ ...thresholds, accountsOfficerLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg">
              <span className="text-xs font-bold text-purple-900 block">Bursar &amp; Finance Officer Limit</span>
              <p className="text-[11px] text-purple-700 mt-1">Sanction for departmental lab consumables and AMC bills</p>
              <div className="mt-3">
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Max Sanction Limit (₹)</label>
                <input
                  type="number"
                  value={thresholds.bursarLimit}
                  onChange={(e) => setThresholds({ ...thresholds, bursarLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <span className="text-xs font-bold text-emerald-900 block">Principal &amp; Governing Body</span>
              <p className="text-[11px] text-emerald-700 mt-1">Capital infrastructure, high-performance computing, civil works</p>
              <div className="mt-3">
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Sanction Threshold (₹)</label>
                <input
                  type="number"
                  value={thresholds.principalLimit}
                  onChange={(e) => setThresholds({ ...thresholds, principalLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: SAFETY & RESET DEMO DATA
      ───────────────────────────────────────────────────────────── */}
      {activeSection === 'safety' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Frontend Demonstration Governance &amp; LocalStorage State</h3>
            <p className="text-xs text-slate-500">Reset browser simulation state and restore factory test datasets</p>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle size={16} className="text-rose-600" />
                <span>Reset All Demo Financial Data</span>
              </div>
              <p className="text-xs text-rose-800">
                This will wipe out all temporary changes stored in your browser's LocalStorage (including newly recorded student fee payments, posted journal entries, new vendor bills, and budget amendments) and restore the default state.
              </p>
            </div>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw size={14} /> Reset Demo Data
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CONFIRMATION MODAL: RESET DEMO DATA
      ───────────────────────────────────────────────────────────── */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Confirm Reset of Demo Data?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to restore the Accounts &amp; Finance module to its pristine initial mock state?
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Yes, Reset All Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
