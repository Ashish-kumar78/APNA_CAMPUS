// Apna Campus ERP — Daily Meal Attendance Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserCheck, Users, Clock, AlertTriangle, CheckCircle2, 
  Search, Filter, Calendar, Download, RefreshCw, XCircle, Shield
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenMealAttendanceSection({ showToast }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState('All'); // All, Breakfast, Lunch, Evening Snacks, Dinner
  const [selectedHostel, setSelectedHostel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const summary = useMemo(() => {
    return canteenStore.getEnterpriseDailyMealSummary(selectedDate);
  }, [selectedDate, dataVersion]);

  const allHostellers = useMemo(() => {
    return canteenStore.getHostellers({}, 'admin');
  }, [dataVersion]);

  // Generate complete roster status for the selected date & meal
  const attendanceRoster = useMemo(() => {
    const meals = selectedMeal === 'All' 
      ? ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'] 
      : [selectedMeal];

    const records = [];

    allHostellers.forEach(h => {
      if (selectedHostel !== 'All' && h.hostelName !== selectedHostel) return;

      meals.forEach(m => {
        const status = canteenStore.resolveStudentMealStatus(h.studentId, m, selectedDate);
        if (selectedStatus !== 'All' && status !== selectedStatus) return;

        // Find existing record if any
        const existingRecord = canteenStore.getMealAttendance({ date: selectedDate, mealType: m }).find(r => r.studentId === h.studentId);

        if (search) {
          const q = search.toLowerCase();
          const match = h.name.toLowerCase().includes(q) ||
                        h.studentId.includes(q) ||
                        h.rollNumber.toLowerCase().includes(q) ||
                        h.roomNumber.toLowerCase().includes(q);
          if (!match) return;
        }

        records.push({
          id: existingRecord ? existingRecord.id : `virt-${selectedDate}-${m}-${h.studentId}`,
          studentId: h.studentId,
          studentName: h.name,
          registrationNumber: h.registrationNumber,
          rollNumber: h.rollNumber,
          photo: h.photo,
          hostel: h.hostelName,
          roomNumber: h.roomNumber,
          mealType: m,
          mealDate: selectedDate,
          verificationTime: existingRecord ? existingRecord.verificationTime : '—',
          biometricId: h.biometricId,
          attendanceStatus: status,
          verificationMethod: existingRecord ? existingRecord.verificationMethod : 'Biometric Terminal',
          parentContact: h.parentContact
        });
      });
    });

    return records;
  }, [allHostellers, selectedMeal, selectedHostel, selectedStatus, selectedDate, search, dataVersion]);

  const uniqueHostels = useMemo(() => {
    return Array.from(new Set(allHostellers.map(h => h.hostelName)));
  }, [allHostellers]);

  const handleExportCSV = () => {
    const headers = [
      'Date', 'Meal Type', 'Student Name', 'Roll Number', 'Student ID',
      'Hostel', 'Room Number', 'Biometric ID', 'Time', 'Status', 'Method'
    ];
    const rows = attendanceRoster.map(r => [
      r.mealDate, r.mealType, r.studentName, r.rollNumber, r.studentId,
      r.hostel, r.roomNumber, r.biometricId, r.verificationTime, r.attendanceStatus, r.verificationMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Meal_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Attendance register exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Hostellers</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary.totalActiveHostellers}</div>
          <div className="text-[10px] text-slate-400">All Blocks</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Eligible Subscribed</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{summary.totalEligibleStudents}</div>
          <div className="text-[10px] text-slate-400">Valid Meal Plans</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Breakfast Served</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.breakfast.present}</div>
          <div className="text-[10px] text-slate-400">Absent: {summary.breakfast.absent}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Lunch Served</div>
          <div className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.lunch.present}</div>
          <div className="text-[10px] text-slate-400">Absent: {summary.lunch.absent}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Snacks Served</div>
          <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.snacks.present}</div>
          <div className="text-[10px] text-slate-400">Absent: {summary.snacks.absent}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Dinner Served</div>
          <div className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.dinner.present}</div>
          <div className="text-[10px] text-slate-400">Absent: {summary.dinner.absent}</div>
        </div>
      </div>

      {/* Strict Absence Rule Banner */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Service Window Cutoff Policy:</strong> Absence is strictly calculated only AFTER the service window ends (Breakfast: 10:00 AM, Lunch: 02:30 PM, Snacks: 06:30 PM, Dinner: 10:00 PM). Unserved students during active hours remain marked as <strong>"Not Yet Served"</strong>.
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Meal Attendance Register & Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generated from biometric hardware and supervisor entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-emerald-500" /> Export CSV
            </button>
            <span className="text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold border border-indigo-200 dark:border-indigo-800/40">
              {attendanceRoster.length} Records
            </span>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Meal Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Meal Window</label>
            <select
              value={selectedMeal}
              onChange={e => setSelectedMeal(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All 4 Meal Windows</option>
              <option value="Breakfast">Breakfast (07:30 - 10:00)</option>
              <option value="Lunch">Lunch (12:00 - 14:30)</option>
              <option value="Evening Snacks">Evening Snacks (17:00 - 18:30)</option>
              <option value="Dinner">Dinner (19:30 - 22:00)</option>
            </select>
          </div>

          {/* Hostel Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hostel</label>
            <select
              value={selectedHostel}
              onChange={e => setSelectedHostel(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Hostels</option>
              {uniqueHostels.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Attendance Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent (Closed Window)</option>
              <option value="Not Yet Served">Not Yet Served (Pending)</option>
              <option value="Manual Verification">Manual Verification</option>
              <option value="Excused">Excused (Leave / Sanctioned)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Student</label>
            <input
              type="text"
              placeholder="Name, roll, room..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Meal Period</th>
                <th className="py-3 px-4">Hostel & Room</th>
                <th className="py-3 px-4">Biometric Ref</th>
                <th className="py-3 px-4">Verification Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {attendanceRoster.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={row.photo}
                        alt={row.studentName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{row.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-400">Roll: {row.rollNumber}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{row.mealType}</span>
                    <div className="text-[10px] text-slate-400">{row.mealDate}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{row.hostel}</div>
                    <div className="text-slate-400 text-[11px]">Room {row.roomNumber}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {row.biometricId}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {row.verificationTime}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      row.attendanceStatus === 'Present' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                      row.attendanceStatus === 'Manual Verification' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                      row.attendanceStatus === 'Absent' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' :
                      row.attendanceStatus === 'Excused' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {row.attendanceStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {row.verificationMethod}
                  </td>
                </tr>
              ))}

              {attendanceRoster.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No attendance records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

