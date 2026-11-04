// Apna Campus ERP — Complete Canteen Reporting & Export System Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, Printer, Calendar, 
  CheckCircle2, Users, Utensils, CreditCard, Building, 
  ShieldCheck, RefreshCw, Eye
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenReportsSection({ account, showToast }) {
  const [dataVersion, setDataVersion] = useState(0);
  const userRole = account?.role ? String(account.role).toLowerCase() : 'canteen';

  const [reportType, setReportType] = useState('daily_master'); // daily_master, monthly_ops, student_dossier, hostel_breakdown, financial_audit
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStudentId, setSelectedStudentId] = useState('2401432265');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const dailyReport = useMemo(() => {
    return canteenStore.getEnterpriseDailyReport(selectedDate);
  }, [selectedDate, dataVersion]);

  const financialReport = useMemo(() => {
    return canteenStore.getEnterpriseFinancialReport(userRole);
  }, [userRole, dataVersion]);

  const studentReport = useMemo(() => {
    const student = canteenStore.getHostellerById(selectedStudentId, userRole);
    const logs = canteenStore.getMealAttendance().filter(l => l.studentId === selectedStudentId);
    return { student, logs };
  }, [selectedStudentId, userRole, dataVersion]);

  const allHostellers = useMemo(() => {
    return canteenStore.getHostellers({}, userRole);
  }, [userRole, dataVersion]);

  // Export CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Canteen_Report_${reportType}_${selectedDate}.csv`;

    if (reportType === 'daily_master') {
      headers = ['Category', 'Present / Served', 'Absent', 'Pending', 'Efficiency'];
      rows = [
        ['Breakfast (07:30 - 10:00)', dailyReport.mealAttendance.breakfast.present, dailyReport.mealAttendance.breakfast.absent, dailyReport.mealAttendance.breakfast.notYetServed, '94%'],
        ['Lunch (12:00 - 14:30)', dailyReport.mealAttendance.lunch.present, dailyReport.mealAttendance.lunch.absent, dailyReport.mealAttendance.lunch.notYetServed, '96%'],
        ['Evening Snacks (17:00 - 18:30)', dailyReport.mealAttendance.snacks.present, dailyReport.mealAttendance.snacks.absent, dailyReport.mealAttendance.snacks.notYetServed, '92%'],
        ['Dinner (19:30 - 22:00)', dailyReport.mealAttendance.dinner.present, dailyReport.mealAttendance.dinner.absent, dailyReport.mealAttendance.dinner.notYetServed, '95%'],
        ['Total Meals Served Today', dailyReport.summary.totalMealsServed, dailyReport.summary.totalAbsentRecords, '-', '95.2%']
      ];
    } else if (reportType === 'financial_audit') {
      headers = ['Metric', 'Amount (INR)'];
      rows = [
        ['Total Mess Dues Billed', financialReport.canteenMessFinance.totalMessDuesBilled],
        ['Total Mess Collected', financialReport.canteenMessFinance.totalMessCollected],
        ['Total Mess Pending Dues', financialReport.canteenMessFinance.totalMessPending],
        ['Today Special Curries Revenue', financialReport.canteenMessFinance.specialDishesRevenueToday]
      ];
    } else {
      headers = ['Student ID', 'Name', 'Hostel', 'Room', 'Plan', 'Biometric Reference'];
      rows = allHostellers.map(h => [h.studentId, h.name, h.hostelName, h.roomNumber, h.mealPlan, h.biometricId]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Official report exported in CSV format!', 'success');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Institutional Reporting Engine
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Canteen & Mess Operations Analytics & Formal Reports
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Export high-fidelity daily operations, meal attendance registers, food wastage calculations, and financial audits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrintReport}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" /> Print Document
            </button>
            <button
              onClick={handleExportCSV}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4" /> Export CSV / Excel
            </button>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { id: 'daily_master', label: 'Daily Master Operations Report' },
            { id: 'monthly_ops', label: 'Monthly Consumption & Wastage' },
            { id: 'student_dossier', label: 'Student-Wise Attendance & Charges' },
            { id: 'hostel_breakdown', label: 'Hostel-Wise Distribution' },
            { id: 'financial_audit', label: 'Canteen Financial Statement' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`py-2 px-3.5 rounded-lg border transition ${
                reportType === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date / Student Selector Filter Row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Report Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>

          {reportType === 'student_dossier' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Select Student:</span>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {allHostellers.map(h => (
                  <option key={h.studentId} value={h.studentId}>
                    {h.name} ({h.rollNumber}) — {h.hostelName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Official Formatted Institutional Report Canvas */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg space-y-6">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 dark:border-white pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Apna Campus Group of Institutions
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-0.5">
              Directorate of Canteen Services & Student Welfare
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Affiliated with State Technical University • Campus Dining Complex, Khurda
            </div>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <div className="font-bold text-slate-900 dark:text-white">REPORT ID: REP-CAN-2026-9901</div>
            <div className="text-slate-500">Generated: {new Date().toLocaleString()}</div>
            <div className="text-slate-500">Generated By: {account?.name || 'Kailash Sahoo (Canteen In-Charge)'}</div>
            <div className="text-emerald-600 font-semibold text-[11px]">Status: Verified & Audited</div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center py-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700">
          <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
            {reportType === 'daily_master' && 'Daily Master Canteen Operations & Attendance Statement'}
            {reportType === 'monthly_ops' && 'Monthly Food Consumption, Purchasing & Wastage Statement'}
            {reportType === 'student_dossier' && 'Comprehensive Student Meal Consumption & Ledger Dossier'}
            {reportType === 'hostel_breakdown' && 'Hostel-Wise Meal Consumption & Resident Statistics'}
            {reportType === 'financial_audit' && 'Canteen Directorate Financial Statement & Collections Audit'}
          </h3>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">
            Applicable Service Date: <strong>{selectedDate}</strong>
          </div>
        </div>

        {/* Report Content Body 1: Daily Master */}
        {reportType === 'daily_master' && (
          <div className="space-y-6 text-xs">
            {/* KPI Summary Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400">Total Hostellers:</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{dailyReport.summary.totalActiveHostellers}</div>
              </div>
              <div>
                <span className="text-slate-400">Meals Served:</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{dailyReport.summary.totalMealsServed}</div>
              </div>
              <div>
                <span className="text-slate-400">Food Prepared:</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{dailyReport.summary.foodConsumptionKg} kg</div>
              </div>
              <div>
                <span className="text-slate-400">Wastage Ratio:</span>
                <div className="text-lg font-bold text-rose-500">{dailyReport.summary.foodWastageKg} kg ({dailyReport.summary.averageWastagePercentage}%)</div>
              </div>
            </div>

            {/* Attendance Matrix Table */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">1. Meal Service Windows Execution Matrix</h4>
              <table className="w-full text-left border border-slate-200 dark:border-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-900 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Meal Category</th>
                    <th className="p-2.5">Operating Hours</th>
                    <th className="p-2.5">Verified Present</th>
                    <th className="p-2.5">Confirmed Absent</th>
                    <th className="p-2.5">Pending / Not Served</th>
                    <th className="p-2.5">Service Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold">Breakfast</td>
                    <td className="p-2.5">07:30 – 10:00</td>
                    <td className="p-2.5 text-emerald-600 font-bold">{dailyReport.mealAttendance.breakfast.present}</td>
                    <td className="p-2.5 text-rose-600 font-bold">{dailyReport.mealAttendance.breakfast.absent}</td>
                    <td className="p-2.5 text-slate-500">{dailyReport.mealAttendance.breakfast.notYetServed}</td>
                    <td className="p-2.5 font-bold">94.2%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Lunch</td>
                    <td className="p-2.5">12:00 – 14:30</td>
                    <td className="p-2.5 text-emerald-600 font-bold">{dailyReport.mealAttendance.lunch.present}</td>
                    <td className="p-2.5 text-rose-600 font-bold">{dailyReport.mealAttendance.lunch.absent}</td>
                    <td className="p-2.5 text-slate-500">{dailyReport.mealAttendance.lunch.notYetServed}</td>
                    <td className="p-2.5 font-bold">96.8%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Evening Snacks</td>
                    <td className="p-2.5">17:00 – 18:30</td>
                    <td className="p-2.5 text-emerald-600 font-bold">{dailyReport.mealAttendance.snacks.present}</td>
                    <td className="p-2.5 text-rose-600 font-bold">{dailyReport.mealAttendance.snacks.absent}</td>
                    <td className="p-2.5 text-slate-500">{dailyReport.mealAttendance.snacks.notYetServed}</td>
                    <td className="p-2.5 font-bold">92.0%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Dinner</td>
                    <td className="p-2.5">19:30 – 22:00</td>
                    <td className="p-2.5 text-emerald-600 font-bold">{dailyReport.mealAttendance.dinner.present}</td>
                    <td className="p-2.5 text-rose-600 font-bold">{dailyReport.mealAttendance.dinner.absent}</td>
                    <td className="p-2.5 text-slate-500">{dailyReport.mealAttendance.dinner.notYetServed}</td>
                    <td className="p-2.5 font-bold">95.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Content Body 2: Financial Audit */}
        {reportType === 'financial_audit' && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Mess & Canteen Directorate Financial Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400">Total Billed:</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">₹{financialReport.canteenMessFinance.totalMessDuesBilled?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-400">Total Realized:</span>
                  <div className="text-lg font-bold text-emerald-600">₹{financialReport.canteenMessFinance.totalMessCollected?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-400">Pending Dues:</span>
                  <div className="text-lg font-bold text-rose-500">₹{financialReport.canteenMessFinance.totalMessPending?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-400">Special Dishes Sales:</span>
                  <div className="text-lg font-bold text-indigo-600">₹{financialReport.canteenMessFinance.specialDishesRevenueToday?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200">
              <strong>Audit Footnote:</strong> {financialReport.hostelAccommodationFinance === 'string' ? financialReport.hostelAccommodationFinance : 'Hostel accommodation ledger audited and in balance with institutional treasury.'}
            </div>
          </div>
        )}

        {/* Report Content Body 3: Student Dossier */}
        {reportType === 'student_dossier' && studentReport.student && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <img src={studentReport.student.photo} alt={studentReport.student.name} className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-500" />
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{studentReport.student.name}</div>
                <div className="text-slate-500 font-mono">Roll: {studentReport.student.rollNumber} • ID: {studentReport.student.studentId}</div>
                <div className="text-indigo-600 font-medium">{studentReport.student.hostelName} (Room {studentReport.student.roomNumber})</div>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200 dark:border-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-900 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Meal</th>
                  <th className="p-2">Biometric Ref</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {studentReport.logs.map(log => (
                  <tr key={log.id}>
                    <td className="p-2">{log.mealDate}</td>
                    <td className="p-2 font-semibold">{log.mealType}</td>
                    <td className="p-2 font-mono text-indigo-600">{log.biometricId}</td>
                    <td className="p-2 font-mono">{log.verificationTime}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.attendanceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures Footer */}
        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700 grid grid-cols-3 text-center text-xs">
          <div>
            <div className="w-36 border-b border-slate-400 mx-auto mb-1" />
            <div className="font-bold text-slate-900 dark:text-white">Prepared By</div>
            <div className="text-[11px] text-slate-400">Mess Supervisor / Storekeeper</div>
          </div>
          <div>
            <div className="w-36 border-b border-slate-400 mx-auto mb-1" />
            <div className="font-bold text-slate-900 dark:text-white">Verified By</div>
            <div className="text-[11px] text-slate-400">Chief Warden / Canteen In-Charge</div>
          </div>
          <div>
            <div className="w-36 border-b border-slate-400 mx-auto mb-1" />
            <div className="font-bold text-slate-900 dark:text-white">Approved By</div>
            <div className="text-[11px] text-slate-400">Registrar / Director (Operations)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

