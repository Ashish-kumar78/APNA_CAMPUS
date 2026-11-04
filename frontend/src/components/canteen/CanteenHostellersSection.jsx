// Apna Campus ERP — Complete Hosteller Management Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Search, Filter, Home, Phone, Mail, CheckCircle2, 
  AlertCircle, Download, Eye, Shield, CreditCard, Calendar,
  ChevronDown, X, RefreshCw, FileText
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenHostellersSection({ account, showToast }) {
  const [dataVersion, setDataVersion] = useState(0);
  const userRole = account?.role ? String(account.role).toLowerCase() : 'canteen';

  // Filters
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState('All');
  const [hostelStatusFilter, setHostelStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [academicYearFilter, setAcademicYearFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const hostellers = useMemo(() => {
    return canteenStore.getHostellers({
      search,
      hostel: hostelFilter,
      feeStatus: feeStatusFilter,
      status: hostelStatusFilter,
      branch: branchFilter,
      academicYear: academicYearFilter
    }, userRole);
  }, [search, hostelFilter, feeStatusFilter, hostelStatusFilter, branchFilter, academicYearFilter, dataVersion, userRole]);

  // Unique hostels for filter dropdown
  const uniqueHostels = useMemo(() => {
    const all = canteenStore.getHostellers({}, userRole);
    return Array.from(new Set(all.map(h => h.hostelName)));
  }, [userRole]);

  const isFullFinancialRole = ['super_admin', 'admin', 'accounts'].includes(userRole);

  const handleExportCSV = () => {
    const headers = [
      'Student ID', 'Roll Number', 'Registration Number', 'Name', 
      'Department', 'Hostel', 'Block', 'Room Number', 'Warden', 
      'Meal Plan', 'Biometric ID', 'Meal Subscription', 
      'Hostel Fee Status', 'Mess Fee Status'
    ];
    const rows = hostellers.map(h => [
      h.studentId, h.rollNumber, h.registrationNumber, h.name,
      h.department, h.hostelName, h.hostelBlock, h.roomNumber, h.hostelWarden,
      h.mealPlan, h.biometricId, h.mealSubscriptionStatus,
      isFullFinancialRole ? h.hostelFee.paymentStatus : 'Restricted',
      h.messFee.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hosteller_Canteen_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Hosteller Register exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-500" /> Complete Hosteller & Meal Registry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Synchronized with Central Student & Hostel Management databases. Real-time meal entitlement & separate mess vs. hostel fees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-emerald-500" /> Export CSV
            </button>
            <span className="text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold border border-indigo-200 dark:border-indigo-800/40">
              {hostellers.length} Students Listed
            </span>
          </div>
        </div>

        {/* Security Role Scope Notice */}
        {!isFullFinancialRole ? (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Shield className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Role Privacy Notice:</strong> Canteen Staff can view Mess/Meal fee eligibility and biometric clearance. Unrestricted hostel accommodation financials are strictly partitioned for Accounts and Hostel Admin.
            </span>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <Shield className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Administrative View:</strong> Authorized access granted. Full hostel accommodation fees and canteen mess subscriptions are visible.
            </span>
          </div>
        )}

        {/* Filters Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, roll, reg no, room..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Hostel Filter */}
          <div>
            <select
              value={hostelFilter}
              onChange={e => setHostelFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Hostels</option>
              {uniqueHostels.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Fee Status Filter */}
          <div>
            <select
              value={feeStatusFilter}
              onChange={e => setFeeStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Fee Status</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Branches</option>
              <option value="Computer Science">CSE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Civil">Civil</option>
              <option value="Electronics">ECE</option>
            </select>
          </div>

          {/* Hostel Status Filter */}
          <div>
            <select
              value={hostelStatusFilter}
              onChange={e => setHostelStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Residents</option>
              <option value="Inactive">Inactive / Vacated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hosteller Register Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Student Info</th>
                <th className="py-3 px-4">Hostel Allocation</th>
                <th className="py-3 px-4">Warden & Contact</th>
                <th className="py-3 px-4">Meal Plan & Biometric</th>
                <th className="py-3 px-4">Hostel Fee Status</th>
                <th className="py-3 px-4">Mess Fee (Canteen)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {hostellers.map(student => (
                <tr key={student.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition">
                  {/* Student Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          Roll: {student.rollNumber} • ID: {student.studentId}
                        </div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                          {student.department} ({student.semester})
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Hostel Allocation */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{student.hostelName}</div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {student.hostelBlock} • Room <span className="font-bold text-slate-700 dark:text-slate-300">{student.roomNumber}</span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {student.hostelStatus}
                    </span>
                  </td>

                  {/* Warden & Contact */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{student.hostelWarden}</div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {student.studentContact}
                    </div>
                    <div className="text-[11px] text-slate-400">Parent: {student.parentContact}</div>
                  </td>

                  {/* Meal Plan & Biometric */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{student.mealPlan}</div>
                    <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      Bio Ref: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{student.biometricId}</span>
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      student.mealSubscriptionStatus === 'Active' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                    }`}>
                      {student.mealSubscriptionStatus}
                    </span>
                  </td>

                  {/* Hostel Fee Status */}
                  <td className="py-3.5 px-4">
                    {isFullFinancialRole ? (
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          ₹{student.hostelFee.paidAmount.toLocaleString()} / ₹{student.hostelFee.totalHostelFee.toLocaleString()}
                        </div>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.hostelFee.paymentStatus === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                          student.hostelFee.paymentStatus === 'Partial' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                          'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                        }`}>
                          {student.hostelFee.paymentStatus}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Due: {student.hostelFee.nextDueDate}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Restricted to Accounts</span>
                    )}
                  </td>

                  {/* Mess Fee (Canteen) */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      ₹{student.messFee.paidAmount.toLocaleString()} / ₹{student.messFee.totalMessFee.toLocaleString()}
                    </div>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                      student.messFee.paymentStatus === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                      student.messFee.paymentStatus === 'Partial' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                      'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                    }`}>
                      {student.messFee.paymentStatus}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{student.messFee.receiptNo}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition"
                      title="View Complete Hosteller Dossier"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {hostellers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hostellers matching the selected filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <img
                src={selectedStudent.photo}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 shadow-md"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Roll: {selectedStudent.rollNumber} • Registration: {selectedStudent.registrationNumber}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                    {selectedStudent.department}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    {selectedStudent.hostelStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Hostel & Accommodation</div>
                <div><strong>Hostel:</strong> {selectedStudent.hostelName}</div>
                <div><strong>Block & Room:</strong> {selectedStudent.hostelBlock} / Room {selectedStudent.roomNumber}</div>
                <div><strong>Warden:</strong> {selectedStudent.hostelWarden}</div>
                <div><strong>Admission Date:</strong> {selectedStudent.hostelAdmissionDate}</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Meal Plan & Biometrics</div>
                <div><strong>Plan:</strong> {selectedStudent.mealPlan}</div>
                <div><strong>Biometric Reference:</strong> <span className="font-mono text-indigo-600 font-semibold">{selectedStudent.biometricId}</span></div>
                <div><strong>Subscription Status:</strong> {selectedStudent.mealSubscriptionStatus}</div>
                <div><strong>Mess Payment Status:</strong> {selectedStudent.messFee.paymentStatus}</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Emergency & Parental Contacts</div>
                <div><strong>Student Contact:</strong> {selectedStudent.studentContact}</div>
                <div><strong>Parent Contact:</strong> {selectedStudent.parentContact}</div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/40">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">Financial Partition</div>
                {isFullFinancialRole ? (
                  <>
                    <div><strong>Hostel Accommodation Total:</strong> ₹{selectedStudent.hostelFee.totalHostelFee.toLocaleString()}</div>
                    <div><strong>Hostel Amount Paid:</strong> ₹{selectedStudent.hostelFee.paidAmount.toLocaleString()}</div>
                    <div><strong>Pending Dues:</strong> ₹{selectedStudent.hostelFee.pendingAmount.toLocaleString()}</div>
                    <div><strong>Receipt:</strong> {selectedStudent.hostelFee.receiptNo}</div>
                  </>
                ) : (
                  <div className="text-slate-400 italic">
                    Accommodation financial ledger is restricted to Accounts Directorate. Canteen staff can verify mess subscription fee: ₹{selectedStudent.messFee.paidAmount.toLocaleString()} ({selectedStudent.messFee.paymentStatus}).
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

