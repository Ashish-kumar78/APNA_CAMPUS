import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  X,
  Truck,
  Send,
  Eye
} from 'lucide-react';
import feesApi from '../../services/feesApi';

export default function AccountsExpensesProcurementTab({
  expenses,
  vendors,
  vendorBills,
  onUpdateExpenses,
  onUpdateVendors,
  onUpdateVendorBills,
  onAddAuditLog,
  initialSubtab = 'expenses'
}) {
  const mapInitialTab = (tab) => {
    if (tab === 'approvals') return 'approval_queue';
    return tab || 'expenses';
  };

  const [selectedSubtab, setSelectedSubtab] = useState(mapInitialTab(initialSubtab));
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);

  useEffect(() => {
    if (initialSubtab) {
      setSelectedSubtab(mapInitialTab(initialSubtab));
    }
  }, [initialSubtab]);

  // New Vendor Bill Form
  const [newBillForm, setNewBillForm] = useState({
    id: `BILL-2026-${String(vendorBills.length + 104).padStart(3, '0')}`,
    vendorId: 'VEND-001',
    vendorName: 'TechCore Computing Systems Pvt Ltd',
    invoiceNumber: `TC-2026/${Math.floor(1000 + Math.random() * 9000)}`,
    date: '24-Oct-2026',
    dueDate: '24-Nov-2026',
    category: 'Computer Science High Speed Networking Switches',
    department: 'CSE Networking Lab',
    amount: '120000',
    taxPercent: '18',
    status: 'Pending Payment',
    approvalStatus: 'Approved by Bursar'
  });

  // Supplier Payment Form
  const [supplierPayForm, setSupplierPayForm] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer (RTGS/NEFT)',
    reference: `NEFT${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    remarks: 'Approved supplier invoice tranche payment.'
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter(e => {
    return e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filtered Bills
  const filteredBills = vendorBills.filter(b => {
    return b.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddBillSubmit = (e) => {
    e.preventDefault();
    const baseAmt = Number(newBillForm.amount);
    const taxAmt = Math.round((baseAmt * Number(newBillForm.taxPercent)) / 100);
    const totalAmt = baseAmt + taxAmt;

    const vendorObj = vendors.find(v => v.id === newBillForm.vendorId) || vendors[0];

    const newBill = {
      id: newBillForm.id,
      vendorId: vendorObj.id,
      vendorName: vendorObj.name,
      invoiceNumber: newBillForm.invoiceNumber,
      date: newBillForm.date,
      dueDate: newBillForm.dueDate,
      category: newBillForm.category,
      department: newBillForm.department,
      amount: baseAmt,
      tax: taxAmt,
      totalAmount: totalAmt,
      paidAmount: 0,
      balance: totalAmt,
      status: 'Pending Payment',
      approvalStatus: 'Approved by Bursar'
    };

    onUpdateVendorBills([newBill, ...vendorBills]);
    setIsAddBillOpen(false);

    feesApi.saveFinanceVendorBill(newBill).catch(err => {
      console.warn('Vendor bill backend save notice:', err);
    });

    onAddAuditLog({
      actionType: 'VENDOR_BILL_REGISTERED',
      target: `${newBill.invoiceNumber} (${vendorObj.name} - ₹${totalAmt})`,
      details: `Department: ${newBill.department}, Base: ₹${baseAmt}, GST: ₹${taxAmt}.`
    });
  };

  const handlePayBillSubmit = (e) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    const payAmt = Number(supplierPayForm.amount);

    const updatedBills = vendorBills.map(b => {
      if (b.id === selectedBillForPayment.id) {
        const newPaid = b.paidAmount + payAmt;
        const newBal = Math.max(0, b.totalAmount - newPaid);
        return {
          ...b,
          paidAmount: newPaid,
          balance: newBal,
          status: newBal === 0 ? 'Fully Paid' : 'Partially Paid'
        };
      }
      return b;
    });

    onUpdateVendorBills(updatedBills);
    setIsRecordPaymentOpen(false);

    feesApi.payFinanceVendorBill(selectedBillForPayment.id, {
      amount: payAmt,
      paymentMethod: supplierPayForm.paymentMethod,
      reference: supplierPayForm.reference,
      remarks: supplierPayForm.remarks
    }).catch(err => {
      console.warn('Vendor bill payment backend notice:', err);
    });

    onAddAuditLog({
      actionType: 'SUPPLIER_PAYMENT_RELEASED',
      target: `${selectedBillForPayment.invoiceNumber} (${selectedBillForPayment.vendorName} - ₹${payAmt})`,
      details: `Ref: ${supplierPayForm.reference}, Mode: ${supplierPayForm.paymentMethod}.`
    });

    alert(`✓ Payment of ₹${payAmt.toLocaleString('en-IN')} successfully released to ${selectedBillForPayment.vendorName}.`);
  };

  return (
    <div className="accounts-module-wrap">
      {/* Subtab Toggle Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedSubtab('expenses')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'expenses' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Operating Expense Register ({expenses.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('bills')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'bills' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Vendor Bills &amp; Payables ({vendorBills.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('vendors')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'vendors' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Vendor Directory ({vendors.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('approval_queue')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'approval_queue' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Procurement Approval Queue
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddBillOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle size={14} /> Add Vendor Bill
          </button>
        </div>
      </div>

      {/* Subtab 1: Operating Expense Register */}
      {selectedSubtab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense description, payee, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total Recorded: ₹{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Expense ID &amp; Date</th>
                  <th className="py-3 px-4">Category / Item</th>
                  <th className="py-3 px-4">Department &amp; Payee</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{exp.id}</div>
                      <div className="text-[10px] text-slate-400">{exp.date}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {exp.category}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{exp.payee}</div>
                      <div className="text-[10px] text-slate-400">{exp.department}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {exp.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 font-black text-rose-700 text-sm">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        exp.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Vendor Bills & Payables */}
      {selectedSubtab === 'bills' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Invoice # &amp; Vendor</th>
                  <th className="py-3 px-4">Category &amp; Dept</th>
                  <th className="py-3 px-4">Bill Date &amp; Due Date</th>
                  <th className="py-3 px-4">Total Amount (Inc. GST)</th>
                  <th className="py-3 px-4">Paid to Date</th>
                  <th className="py-3 px-4">Outstanding Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.vendorName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Invoice: {b.invoiceNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{b.category}</div>
                      <div className="text-[10px] text-slate-400">{b.department}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>Issued: {b.date}</div>
                      <div className="text-rose-600 font-semibold">Due: {b.dueDate}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{b.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{b.paidAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-rose-600 text-sm">
                      ₹{b.balance.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        b.balance === 0 ? 'bg-emerald-100 text-emerald-800' :
                        b.status.includes('Overdue') ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {b.balance > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedBillForPayment(b);
                            setSupplierPayForm({
                              ...supplierPayForm,
                              amount: String(b.balance)
                            });
                            setIsRecordPaymentOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                        >
                          Pay Bill
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Vendor Directory */}
      {selectedSubtab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {v.id} · GSTIN: {v.gstin}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{v.name}</h4>
                  <span className="text-xs text-slate-500">{v.category}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {v.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Billed</span>
                  <strong className="text-slate-800">₹{(v.totalBilled / 100000).toFixed(2)}L</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Paid to Date</span>
                  <strong className="text-emerald-700">₹{(v.totalPaid / 100000).toFixed(2)}L</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payable Balance</span>
                  <strong className="text-rose-600">₹{(v.outstandingPayable / 100000).toFixed(2)}L</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>Contact: {v.contactPerson}</span>
                <span className="font-medium text-slate-700">{v.paymentTerms}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 4: Approval Queue */}
      {selectedSubtab === 'approval_queue' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Procurement Requisitions &amp; Vouchers Awaiting Clearance</h4>
          <p className="text-slate-500">Capital expenditure and laboratory upgrade requisitions awaiting Bursar / Finance Manager sanction.</p>

          <div className="space-y-2 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900 block">Surya Green Power Solutions AMC (#BILL-2026-102)</strong>
                <span className="text-slate-500">Solar Inverter Annual Maintenance Contract · ₹3,50,000</span>
              </div>
              <button
                onClick={() => alert('Procurement voucher approved by Finance Manager.')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
              >
                Sanction Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Bill Modal */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PlusCircle size={16} className="text-purple-400" />
                Register Vendor Bill &amp; Accounts Payable
              </h3>
              <button onClick={() => setIsAddBillOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBillSubmit} className="p-5 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Vendor</label>
                  <select
                    value={newBillForm.vendorId}
                    onChange={(e) => {
                      const sel = vendors.find(v => v.id === e.target.value);
                      if (sel) {
                        setNewBillForm({ ...newBillForm, vendorId: sel.id, vendorName: sel.name });
                      }
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vendor Invoice #</label>
                  <input
                    type="text"
                    value={newBillForm.invoiceNumber}
                    onChange={(e) => setNewBillForm({ ...newBillForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item / Service Description</label>
                <input
                  type="text"
                  value={newBillForm.category}
                  onChange={(e) => setNewBillForm({ ...newBillForm, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Amount (₹)</label>
                  <input
                    type="number"
                    value={newBillForm.amount}
                    onChange={(e) => setNewBillForm({ ...newBillForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GST Tax %</label>
                  <select
                    value={newBillForm.taxPercent}
                    onChange={(e) => setNewBillForm({ ...newBillForm, taxPercent: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="18">18% GST</option>
                    <option value="12">12% GST</option>
                    <option value="5">5% GST</option>
                    <option value="0">0% (Exempt)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newBillForm.department}
                    onChange={(e) => setNewBillForm({ ...newBillForm, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddBillOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  Register Payable Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Bill Modal */}
      {isRecordPaymentOpen && selectedBillForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-3.5 text-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-emerald-600">
              <CreditCard size={18} /> Release Supplier Payment
            </h4>
            <p className="text-slate-600">
              Paying vendor <strong>{selectedBillForPayment.vendorName}</strong> for invoice {selectedBillForPayment.invoiceNumber}.
            </p>

            <form onSubmit={handlePayBillSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={supplierPayForm.amount}
                  onChange={(e) => setSupplierPayForm({ ...supplierPayForm, amount: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-bold text-sm text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={supplierPayForm.paymentMethod}
                  onChange={(e) => setSupplierPayForm({ ...supplierPayForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                >
                  <option value="Bank Transfer (RTGS/NEFT)">Bank Transfer (RTGS / NEFT via SBI)</option>
                  <option value="Account Payee Cheque">Institutional Cheque</option>
                  <option value="Corporate Net Banking">Corporate Net Banking (HDFC)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bank Transaction Reference / Cheque #</label>
                <input
                  type="text"
                  value={supplierPayForm.reference}
                  onChange={(e) => setSupplierPayForm({ ...supplierPayForm, reference: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs"
                >
                  Confirm &amp; Debit Treasury
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
