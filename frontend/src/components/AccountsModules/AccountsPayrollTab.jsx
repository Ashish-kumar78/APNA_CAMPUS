import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  DollarSign,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Calendar,
  Briefcase,
  FileText,
  X,
  CreditCard,
  IndianRupee,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function AccountsPayrollTab({
  payrollEmployees,
  onUpdatePayrollEmployees,
  onAddAuditLog,
  initialSubtab = 'directory'
}) {
  const mapInitialTab = (tab) => {
    if (tab === 'advances') return 'reimbursements';
    if (tab === 'roster') return 'directory';
    return tab || 'directory';
  };

  const [selectedSubtab, setSelectedSubtab] = useState(mapInitialTab(initialSubtab));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedEmployeeForPayslip, setSelectedEmployeeForPayslip] = useState(null);
  const [isPayrollDisbursed, setIsPayrollDisbursed] = useState(false);

  useEffect(() => {
    if (initialSubtab) {
      setSelectedSubtab(mapInitialTab(initialSubtab));
    }
  }, [initialSubtab]);

  // Filtered Employees
  const filteredEmployees = payrollEmployees.filter(e => {
    return e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalBasic = payrollEmployees.reduce((sum, e) => sum + e.basicSalary, 0);
  const totalAllowances = payrollEmployees.reduce((sum, e) => sum + (e.hra + e.da + e.specialAllowance + e.travelAllowance), 0);
  const totalDeductions = payrollEmployees.reduce((sum, e) => sum + (e.providentFund + e.professionalTax + e.tdsIncomeTax), 0);
  const totalNetSalary = payrollEmployees.reduce((sum, e) => sum + e.netSalary, 0);

  const handleDisbursePayroll = () => {
    setIsPayrollDisbursed(true);
    onAddAuditLog({
      actionType: 'PAYROLL_DISBURSED',
      target: `PAYROLL-${selectedMonth.replace(' ', '-')}`,
      details: `Disbursed ₹${totalNetSalary.toLocaleString('en-IN')} across ${payrollEmployees.length} employees via SBI Treasury NEFT.`
    });
    alert(`✓ ${selectedMonth} Institutional Payroll successfully committed! NEFT batch file generated for SBI Treasury.`);
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="accounts-module-wrap">
      {/* Subtab Navigation Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedSubtab('directory')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'directory' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Employee Salary Roster ({payrollEmployees.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('processing')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'processing' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Monthly Payroll Processing
          </button>
          <button
            onClick={() => setSelectedSubtab('payslips')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'payslips' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Payslip Management &amp; Dispatch
          </button>
          <button
            onClick={() => setSelectedSubtab('reimbursements')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'reimbursements' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Staff Reimbursements &amp; Advances
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-700 outline-none"
          >
            <option value="October 2026">Payroll Cycle: October 2026</option>
            <option value="September 2026">Payroll Cycle: September 2026</option>
            <option value="November 2026">Payroll Cycle: November 2026 (Scheduled)</option>
          </select>
        </div>
      </div>

      {/* Financial Health Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Basic Earnings</span>
          <strong className="text-slate-900 text-base font-extrabold">₹{totalBasic.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-slate-500 block mt-0.5">Approved 7th Pay Scales</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Allowances (DA/HRA)</span>
          <strong className="text-blue-700 text-base font-extrabold">+₹{totalAllowances.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-slate-500 block mt-0.5">50% DA + 16% HRA</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statutory Deductions (PF/TDS)</span>
          <strong className="text-rose-600 text-base font-extrabold">-₹{totalDeductions.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-slate-500 block mt-0.5">12% PF + Monthly TDS</span>
        </div>
        <div className="bg-emerald-950 text-white p-3.5 rounded-xl border border-emerald-900">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Total Net Salary Outflow</span>
          <strong className="text-emerald-200 text-lg font-black">₹{totalNetSalary.toLocaleString('en-IN')}</strong>
          <span className="text-[11px] text-emerald-400 block mt-0.5">Monthly Commitment</span>
        </div>
      </div>

      {/* Subtab 1: Employee Salary Roster */}
      {selectedSubtab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex justify-between items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee by name, ID, department, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Showing {filteredEmployees.length} employees
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Employee &amp; ID</th>
                  <th className="py-3 px-4">Designation &amp; Dept</th>
                  <th className="py-3 px-4">Basic Salary</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Monthly Salary</th>
                  <th className="py-3 px-4">Disbursement Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => (
                  <tr key={emp.employeeId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.employeeId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{emp.designation}</div>
                      <div className="text-[10px] text-slate-400">{emp.department} · {emp.employmentType}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ₹{emp.basicSalary.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-blue-700">
                      +₹{(emp.hra + emp.da + emp.specialAllowance + emp.travelAllowance).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-rose-600">
                      -₹{(emp.providentFund + emp.professionalTax + emp.tdsIncomeTax).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      ₹{emp.netSalary.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {emp.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEmployeeForPayslip(emp)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <Printer size={12} /> Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Monthly Payroll Processing */}
      {selectedSubtab === 'processing' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Monthly Institutional Payroll Processing Console</h4>
              <p className="text-slate-500">Calculate, verify deductions, and generate Treasury NEFT batch for {selectedMonth}.</p>
            </div>
            <button
              onClick={handleDisbursePayroll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5"
            >
              <Send size={14} /> Commit &amp; Generate NEFT Batch
            </button>
          </div>

          <div className="space-y-3">
            {[
              { step: '1. Biometric Attendance Sync', status: 'Completed', detail: '222 Teaching and non-teaching employee biometric clockings verified.' },
              { step: '2. Allowances & DA Computation', status: 'Completed', detail: 'Dearness Allowance (50%) & HRA (16%) calculated per UGC norms.' },
              { step: '3. Statutory Deductions Ledger', status: 'Completed', detail: 'EPFO 12% contribution + state professional tax reconciled.' },
              { step: '4. Executive Bursar Sign-off', status: 'Sanctioned', detail: 'Office of the Principal & Director executive approval granted.' }
            ].map((st, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block text-xs">{st.step}</strong>
                  <span className="text-slate-500 text-[11px]">{st.detail}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {st.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Payslips */}
      {selectedSubtab === 'payslips' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Monthly Digital Payslip Roster ({selectedMonth})
            </h4>
            <p className="text-xs text-slate-500 mb-4">Click to inspect and print formal employee salary vouchers.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {payrollEmployees.map(emp => (
                <div key={emp.employeeId} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 text-xs block">{emp.name}</strong>
                    <span className="text-[11px] text-slate-500">{emp.designation} · {emp.department}</span>
                    <span className="text-[11px] font-extrabold text-emerald-700 block mt-1">₹{emp.netSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => setSelectedEmployeeForPayslip(emp)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1"
                  >
                    <Printer size={12} /> View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Reimbursements */}
      {selectedSubtab === 'reimbursements' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Official Faculty Reimbursements &amp; Travel Claims</h4>
          <p className="text-slate-500">Official conference travel, research contingencies, and laboratory consumables claims.</p>

          <div className="space-y-2 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900 block">Dr. S. Mohanty (CSE)</strong>
                <span className="text-slate-500">IEEE International Conference Travel Grant (New Delhi)</span>
              </div>
              <div className="text-right">
                <strong className="text-slate-900 block text-xs">₹18,500</strong>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Approved &amp; Paid</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-900 block">Dr. S. K. Swain (AIML)</strong>
                <span className="text-slate-500">GPU Deep Learning Benchmark License Consumables</span>
              </div>
              <div className="text-right">
                <strong className="text-slate-900 block text-xs">₹24,000</strong>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pending Clearance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {selectedEmployeeForPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Official Employee Payslip Voucher
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPayslip}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded flex items-center gap-1"
                >
                  <Printer size={13} /> Print Payslip
                </button>
                <button
                  onClick={() => setSelectedEmployeeForPayslip(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-8 text-slate-900 bg-white overflow-y-auto space-y-4 text-xs font-sans">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h3 className="text-base font-black uppercase text-slate-900">
                  APNA CAMPUS AUTONOMOUS ENGINEERING COLLEGE
                </h3>
                <p className="text-[10px] text-slate-500">
                  Directorate of Finance &amp; Accounts · Monthly Salary Disbursal Voucher
                </p>
                <div className="mt-1 font-bold text-xs text-blue-900 tracking-wider">
                  PAYSLIP FOR THE MONTH OF {selectedMonth.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Employee Name:</span>
                  <strong className="text-slate-900">{selectedEmployeeForPayslip.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Employee ID:</span>
                  <strong className="text-slate-900 font-mono">{selectedEmployeeForPayslip.employeeId}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Designation:</span>
                  <span>{selectedEmployeeForPayslip.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Department:</span>
                  <span>{selectedEmployeeForPayslip.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Pay Scale Grade:</span>
                  <span>{selectedEmployeeForPayslip.payScale}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank Account:</span>
                  <span className="font-mono">{selectedEmployeeForPayslip.bankAccount}</span>
                </div>
              </div>

              {/* Two Column Earnings & Deductions */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded p-3 space-y-1.5">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-xs">
                    Earnings Breakdown
                  </div>
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <strong>₹{selectedEmployeeForPayslip.basicSalary.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dearness Allowance (DA 50%):</span>
                    <strong>₹{selectedEmployeeForPayslip.da.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent Allowance (HRA 16%):</span>
                    <strong>₹{selectedEmployeeForPayslip.hra.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Special Allowance:</span>
                    <strong>₹{selectedEmployeeForPayslip.specialAllowance.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel Allowance:</span>
                    <strong>₹{selectedEmployeeForPayslip.travelAllowance.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900">
                    <span>Gross Earnings:</span>
                    <span>
                      ₹{(selectedEmployeeForPayslip.basicSalary + selectedEmployeeForPayslip.da + selectedEmployeeForPayslip.hra + selectedEmployeeForPayslip.specialAllowance + selectedEmployeeForPayslip.travelAllowance).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded p-3 space-y-1.5">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-xs">
                    Deductions Breakdown
                  </div>
                  <div className="flex justify-between">
                    <span>Provident Fund (EPFO 12%):</span>
                    <strong className="text-rose-700">₹{selectedEmployeeForPayslip.providentFund.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax:</span>
                    <strong className="text-rose-700">₹{selectedEmployeeForPayslip.professionalTax.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>TDS Income Tax:</span>
                    <strong className="text-rose-700">₹{selectedEmployeeForPayslip.tdsIncomeTax.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-rose-700 mt-auto">
                    <span>Total Deductions:</span>
                    <span>
                      ₹{(selectedEmployeeForPayslip.providentFund + selectedEmployeeForPayslip.professionalTax + selectedEmployeeForPayslip.tdsIncomeTax).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay Banner */}
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 flex justify-between items-center text-sm">
                <span className="font-bold text-emerald-950">Net Disbursed Take-Home Pay:</span>
                <strong className="text-emerald-900 text-base font-black">
                  ₹{selectedEmployeeForPayslip.netSalary.toLocaleString('en-IN')}.00
                </strong>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs">
                <div>
                  <div className="h-8 flex items-center justify-center font-mono text-[10px] text-slate-400">
                    [Treasury NEFT Cleared]
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 text-center text-[10px] text-slate-500">
                    Disbursed via SBI Core Banking
                  </div>
                </div>

                <div className="text-center">
                  <div className="h-8 flex items-center justify-center italic text-blue-900 font-bold">
                    Dr. A. K. Mishra
                  </div>
                  <div className="border-t border-slate-400 pt-0.5 text-center font-bold text-slate-800 text-[10px]">
                    Institutional Bursar &amp; Finance Officer
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 no-print">
              <button
                onClick={() => setSelectedEmployeeForPayslip(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
              <button
                onClick={handlePrintPayslip}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Printer size={13} /> Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
