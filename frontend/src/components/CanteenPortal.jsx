import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  Fingerprint,
  Utensils,
  Users,
  Home,
  FileCheck,
  Calendar,
  UtensilsCrossed,
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Check,
  X,
  FileText,
  DollarSign,
  Coffee,
  Sun,
  Moon,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { canteenStore } from '../services/canteenStore.js';
import './CanteenPortal.css';

export default function CanteenPortal({ account, onLogout }) {
  // Navigation Modules (8 strictly specified modules)
  const [activeTab, setActiveTab] = useState('biometric_records');
  const [dataVersion, setDataVersion] = useState(0);

  // Sync listener for canteen data updates
  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  // Toast notifications
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Summary Counts ---
  const todaySummary = useMemo(() => {
    return canteenStore.getTodaySummaryCounts('2026-10-27');
  }, [dataVersion]);

  // --- Biometric Terminal State ---
  const [selectedStudentId, setSelectedStudentId] = useState('2401432265');
  const [terminalMealType, setTerminalMealType] = useState('Lunch');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Quick scan action
  const handleSimulateScan = () => {
    if (!selectedStudentId) {
      showToast('Please select a student or enter Student ID', 'error');
      return;
    }
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const res = canteenStore.verifyBiometricMealAccess(
        selectedStudentId,
        terminalMealType,
        'BIO-TERM-01 (Mess Entry Main Bay)'
      );
      setScanResult(res);

      if (res.success) {
        showToast(`Identity verified: ${res.student.name} granted ${terminalMealType}!`, 'success');
      } else if (res.code === 'DUPLICATE_CLAIM') {
        showToast(res.message, 'error');
      } else {
        showToast(res.message, 'warning');
      }
    }, 700);
  };

  // Confirm special dish served
  const handleConfirmSpecialDishServed = (orderId) => {
    canteenStore.markSpecialDishServed(orderId, account?.name || 'Kailash Sahoo (Canteen In-Charge)');
    showToast(`Order ${orderId} confirmed as SERVED!`, 'success');
    // Refresh current scanResult special dish list
    if (scanResult?.specialDishOrders) {
      setScanResult(prev => ({
        ...prev,
        specialDishOrders: prev.specialDishOrders.map(o => o.id === orderId ? { ...o, orderStatus: 'Served' } : o)
      }));
    }
  };

  // --- Daily Records Filter States ---
  const [recordDate, setRecordDate] = useState('2026-10-27');
  const [recordCategory, setRecordCategory] = useState('All'); // All, Day Scholar, Hosteller
  const [recordMealType, setRecordMealType] = useState('All'); // All, Breakfast, Lunch, Dinner
  const [recordSearch, setRecordSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return canteenStore.getBiometricLogs({
      date: recordDate,
      category: recordCategory,
      mealType: recordMealType,
      query: recordSearch
    });
  }, [recordDate, recordCategory, recordMealType, recordSearch, dataVersion]);

  // Day Scholar specific logs
  const dayScholarLogs = useMemo(() => {
    return canteenStore.getBiometricLogs({
      date: recordDate,
      category: 'Day Scholar',
      mealType: recordMealType,
      query: recordSearch
    });
  }, [recordDate, recordMealType, recordSearch, dataVersion]);

  // Hosteller specific logs
  const hostellerLogs = useMemo(() => {
    return canteenStore.getBiometricLogs({
      date: recordDate,
      category: 'Hosteller',
      mealType: recordMealType,
      query: recordSearch
    });
  }, [recordDate, recordMealType, recordSearch, dataVersion]);

  // --- Food Access Applications State ---
  const applications = useMemo(() => canteenStore.getApplications(), [dataVersion]);
  const [appFilterStatus, setAppFilterStatus] = useState('All');
  const [appSearch, setAppSearch] = useState('');
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchStatus = appFilterStatus === 'All' || app.status === appFilterStatus;
      const matchSearch = !appSearch ||
        app.studentName.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.studentId.includes(appSearch);
      return matchStatus && matchSearch;
    });
  }, [applications, appFilterStatus, appSearch]);

  const handleReviewAction = (status) => {
    if (!reviewModalApp) return;
    canteenStore.updateApplicationStatus(
      reviewModalApp.id,
      status,
      account?.name || 'Mr. Kailash Chandra Sahoo',
      reviewRemarks
    );
    showToast(`Application for ${reviewModalApp.studentName} marked as ${status.toUpperCase()}!`, 'success');
    setReviewModalApp(null);
    setReviewRemarks('');
  };

  // --- Subscriptions State ---
  const subscriptions = useMemo(() => canteenStore.getSubscriptions(), [dataVersion]);
  const [subSearch, setSubSearch] = useState('');
  const [editSubModalStudent, setEditSubModalStudent] = useState(null);
  const [subFormMeals, setSubFormMeals] = useState({ breakfast: true, lunch: true, dinner: true });

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(s =>
      !subSearch ||
      s.studentName.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.studentId.includes(subSearch)
    );
  }, [subscriptions, subSearch]);

  const handleSaveSubscription = () => {
    if (!editSubModalStudent) return;
    const res = canteenStore.saveSubscription({
      studentId: editSubModalStudent.studentId,
      studentName: editSubModalStudent.name,
      category: editSubModalStudent.category,
      selectedMeals: subFormMeals,
      startDate: '2026-08-01',
      expiryDate: '2027-07-31'
    });
    if (res.success) {
      showToast(`Yearly subscription updated for ${editSubModalStudent.name}!`, 'success');
      setEditSubModalStudent(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  // --- Special Dishes Management State ---
  const specialDishes = useMemo(() => canteenStore.getSpecialDishes(), [dataVersion]);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [newDishForm, setNewDishForm] = useState({
    name: '',
    category: 'Special Curry',
    price: 60,
    dietType: 'Vegetarian',
    description: '',
    mealAvailability: ['Lunch', 'Dinner'],
    orderingCutoff: '11:45 AM (Lunch) / 06:45 PM (Dinner)'
  });

  const handleAddDish = (e) => {
    e.preventDefault();
    if (!newDishForm.name) return;
    canteenStore.addSpecialDish(newDishForm);
    showToast(`Added "${newDishForm.name}" to special dishes menu!`, 'success');
    setIsAddDishModalOpen(false);
    setNewDishForm({
      name: '',
      category: 'Special Curry',
      price: 60,
      dietType: 'Vegetarian',
      description: '',
      mealAvailability: ['Lunch', 'Dinner'],
      orderingCutoff: '11:45 AM (Lunch) / 06:45 PM (Dinner)'
    });
  };

  // --- Special Dish Transactions State ---
  const [trxDate, setTrxDate] = useState('2026-10-27');
  const [trxMeal, setTrxMeal] = useState('All');
  const [trxOrderStatus, setTrxOrderStatus] = useState('All');
  const [trxPaymentStatus, setTrxPaymentStatus] = useState('All');
  const [trxSearch, setTrxSearch] = useState('');

  const specialTransactions = useMemo(() => {
    return canteenStore.getSpecialTransactions({
      date: trxDate === 'All' ? null : trxDate,
      mealCategory: trxMeal,
      orderStatus: trxOrderStatus,
      paymentStatus: trxPaymentStatus,
      query: trxSearch
    });
  }, [trxDate, trxMeal, trxOrderStatus, trxPaymentStatus, trxSearch, dataVersion]);

  // --- Canteen Fees Accounts State ---
  const feeAccounts = useMemo(() => canteenStore.getAllStudentFeeAccounts(), [dataVersion]);
  const [feeSearch, setFeeSearch] = useState('');
  const [paymentModalAccount, setPaymentModalAccount] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI (GPay)');

  const filteredFeeAccounts = useMemo(() => {
    return feeAccounts.filter(acc =>
      !feeSearch ||
      acc.student.name.toLowerCase().includes(feeSearch.toLowerCase()) ||
      acc.student.studentId.includes(feeSearch)
    );
  }, [feeAccounts, feeSearch]);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentModalAccount || !paymentAmount || Number(paymentAmount) <= 0) return;
    const res = canteenStore.recordPayment({
      studentId: paymentModalAccount.student.studentId,
      amount: Number(paymentAmount),
      paymentMode,
      description: `Payment towards Canteen Charges (Outstanding: ₹${paymentModalAccount.outstandingBalance})`
    });
    if (res.success) {
      showToast(`Payment of ₹${paymentAmount} recorded for ${paymentModalAccount.student.name}!`, 'success');
      setPaymentModalAccount(null);
      setPaymentAmount('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Export Daily Register to CSV
  const handleExportCsv = (logs, title = 'Canteen_Meal_Register') => {
    if (!logs.length) {
      showToast('No records to export', 'warning');
      return;
    }
    const headers = ['Record ID', 'Student ID', 'Student Name', 'Category', 'Meal Type', 'Date', 'Time', 'Biometric Status', 'Terminal'];
    const rows = logs.map(l => [
      l.id,
      l.studentId,
      `"${l.studentName}"`,
      l.category,
      l.mealType,
      l.date,
      l.time,
      `"${l.biometricStatus}"`,
      `"${l.terminalId}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daily meal register exported successfully!', 'success');
  };

  // 8 Navigation Sections matching exact user prompt
  const navSections = [
    {
      title: 'Biometric Operations',
      items: [
        { id: 'biometric_records', label: 'Biometric Meal Records', icon: Fingerprint, badge: 'Live Terminal' },
        { id: 'day_scholars', label: 'Day Scholars', icon: Users, badge: `${todaySummary.lunch.dayScholars + todaySummary.breakfast.dayScholars}` },
        { id: 'hostellers', label: 'Hostellers', icon: Home, badge: `${todaySummary.lunch.hostellers + todaySummary.breakfast.hostellers}` }
      ]
    },
    {
      title: 'Access & Subscriptions',
      items: [
        { id: 'food_applications', label: 'Food Access Applications', icon: FileCheck, badge: todaySummary.pendingApplications > 0 ? `${todaySummary.pendingApplications} Pending` : null },
        { id: 'yearly_subscriptions', label: 'Yearly Meal Subscriptions', icon: Calendar, badge: `${todaySummary.activeSubscriptions} Active` }
      ]
    },
    {
      title: 'Special Dishes & Billing',
      items: [
        { id: 'special_dishes', label: 'Special Dishes & Extra Curries', icon: UtensilsCrossed },
        { id: 'special_transactions', label: 'Special Dish Transactions', icon: Receipt, badge: `${todaySummary.todaySpecialDishOrders} Today` },
        { id: 'canteen_fees', label: 'Canteen Fees & Payments', icon: CreditCard }
      ]
    }
  ];

  return (
    <AppLayout
      account={account}
      portalName="Canteen Directorate"
      portalSubtitle="Biometric Food Management System"
      portalHomeTab="biometric_records"
      navSections={navSections}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      pageTitle={
        activeTab === 'biometric_records' ? 'Biometric Meal Access Records' :
        activeTab === 'day_scholars' ? 'Day Scholars Meal Records' :
        activeTab === 'hostellers' ? 'Hostellers Mess Records' :
        activeTab === 'food_applications' ? 'Food Access Applications' :
        activeTab === 'yearly_subscriptions' ? 'Yearly Meal Subscriptions' :
        activeTab === 'special_dishes' ? 'Special Dishes & Extra Curries' :
        activeTab === 'special_transactions' ? 'Special Dish Transactions' :
        'Canteen Fees & Student Accounts'
      }
      pageSubtitle={
        activeTab === 'biometric_records' ? 'Real-time fingerprint biometric verification, daily dining records & duplicate claim control' :
        activeTab === 'day_scholars' ? 'Dedicated attendance logs and lunch/breakfast access register for day-commuter students' :
        activeTab === 'hostellers' ? 'Full 3-meal mess dining records, hostel block allocation and resident verification' :
        activeTab === 'food_applications' ? 'Review student facility access requests, eligibility clearance and approval workflows' :
        activeTab === 'yearly_subscriptions' ? 'Manage independent breakfast, lunch, and dinner yearly meal plans and validity' :
        activeTab === 'special_dishes' ? 'Manage extra curries, sides, prices, availability cutoff and chef special requests' :
        activeTab === 'special_transactions' ? 'Full transaction log, fulfillment tracking, serving confirmations and billing status' :
        'Total charges formula breakdown, payments reconciliation and outstanding fee recovery'
      }
    >
      <div className="canteen-portal-root">
        {/* Toast Alert */}
        {toast && (
          <div className={`canteen-floating-toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <XCircle size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: BIOMETRIC MEAL RECORDS (TERMINAL + TODAY'S USAGE) */}
        {/* ======================================================== */}
        {activeTab === 'biometric_records' && (
          <div className="canteen-tab-content space-y-6">
            {/* Top KPI Summary Counters as specified in Section 6 */}
            <div className="canteen-summary-grid">
              {/* Breakfast Card */}
              <div className="canteen-kpi-card breakfast">
                <div className="kpi-header">
                  <div className="kpi-icon-wrap bf">
                    <Coffee size={22} />
                  </div>
                  <div>
                    <span className="kpi-label">Breakfast Served</span>
                    <h3 className="kpi-number">{todaySummary.breakfast.total}</h3>
                  </div>
                </div>
                <div className="kpi-split">
                  <div className="split-pill ds">
                    <span className="pill-dot"></span>
                    <span>Day Scholars: <strong>{todaySummary.breakfast.dayScholars}</strong></span>
                  </div>
                  <div className="split-pill hs">
                    <span className="pill-dot"></span>
                    <span>Hostellers: <strong>{todaySummary.breakfast.hostellers}</strong></span>
                  </div>
                </div>
              </div>

              {/* Lunch Card */}
              <div className="canteen-kpi-card lunch">
                <div className="kpi-header">
                  <div className="kpi-icon-wrap lunch">
                    <Sun size={22} />
                  </div>
                  <div>
                    <span className="kpi-label">Lunch Served</span>
                    <h3 className="kpi-number">{todaySummary.lunch.total}</h3>
                  </div>
                </div>
                <div className="kpi-split">
                  <div className="split-pill ds">
                    <span className="pill-dot"></span>
                    <span>Day Scholars: <strong>{todaySummary.lunch.dayScholars}</strong></span>
                  </div>
                  <div className="split-pill hs">
                    <span className="pill-dot"></span>
                    <span>Hostellers: <strong>{todaySummary.lunch.hostellers}</strong></span>
                  </div>
                </div>
              </div>

              {/* Dinner Card */}
              <div className="canteen-kpi-card dinner">
                <div className="kpi-header">
                  <div className="kpi-icon-wrap dinner">
                    <Moon size={22} />
                  </div>
                  <div>
                    <span className="kpi-label">Dinner Served</span>
                    <h3 className="kpi-number">{todaySummary.dinner.total}</h3>
                  </div>
                </div>
                <div className="kpi-split">
                  <div className="split-pill ds">
                    <span className="pill-dot"></span>
                    <span>Day Scholars: <strong>{todaySummary.dinner.dayScholars}</strong></span>
                  </div>
                  <div className="split-pill hs">
                    <span className="pill-dot"></span>
                    <span>Hostellers: <strong>{todaySummary.dinner.hostellers}</strong></span>
                  </div>
                </div>
              </div>

              {/* Active Subscriptions Card */}
              <div className="canteen-kpi-card sub">
                <div className="kpi-header">
                  <div className="kpi-icon-wrap sub">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <span className="kpi-label">Active Subscriptions</span>
                    <h3 className="kpi-number">{todaySummary.activeSubscriptions}</h3>
                  </div>
                </div>
                <div className="kpi-split">
                  <div className="split-pill pending">
                    <span className="pill-dot"></span>
                    <span>Pending Apps: <strong>{todaySummary.pendingApplications}</strong></span>
                  </div>
                  <div className="split-pill active">
                    <span className="pill-dot"></span>
                    <span>Specials: <strong>{todaySummary.todaySpecialDishOrders}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE BIOMETRIC IDENTIFICATION TERMINAL */}
            <div className="biometric-terminal-card">
              <div className="terminal-header">
                <div className="terminal-title-group">
                  <div className="terminal-badge">
                    <span className="pulse-indicator"></span>
                    <span>BIOMETRIC TERMINAL ONLINE</span>
                  </div>
                  <h2 className="terminal-heading">Optical Fingerprint Meal Verification</h2>
                  <p className="terminal-sub">Hardware Terminal #BIO-TERM-01 · Central Canteen Gate A · 500 DPI Optical Sensor</p>
                </div>
                <div className="terminal-meal-selector">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Serving Meal Type</label>
                  <div className="meal-btn-group">
                    {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                      <button
                        key={meal}
                        type="button"
                        className={`meal-pill-btn ${terminalMealType === meal ? 'active ' + meal.toLowerCase() : ''}`}
                        onClick={() => { setTerminalMealType(meal); setScanResult(null); }}
                      >
                        {meal === 'Breakfast' && <Coffee size={14} />}
                        {meal === 'Lunch' && <Sun size={14} />}
                        {meal === 'Dinner' && <Moon size={14} />}
                        <span>{meal}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="terminal-body-grid">
                {/* Fingerprint Scanner Pad Simulator */}
                <div className="scanner-bay">
                  <div className={`fingerprint-sensor-pad ${isScanning ? 'scanning' : ''} ${scanResult ? (scanResult.success ? 'verified' : 'failed') : ''}`}>
                    <div className="sensor-glass">
                      <Fingerprint size={96} className="fp-icon" />
                      {isScanning && <div className="laser-scan-line"></div>}
                      <div className="sensor-glow-ring"></div>
                    </div>
                  </div>

                  <div className="quick-student-select">
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">
                      Simulate Student Biometric Scan:
                    </label>
                    <select
                      className="canteen-select w-full"
                      value={selectedStudentId}
                      onChange={(e) => { setSelectedStudentId(e.target.value); setScanResult(null); }}
                    >
                      {canteenStore.getAllStudents().map(s => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.name} ({s.studentId}) · {s.category} [FP: {s.fingerprintId}]
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="btn-trigger-scan"
                      onClick={handleSimulateScan}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Reading Biometric Template...</span>
                        </>
                      ) : (
                        <>
                          <Fingerprint size={18} />
                          <span>Place Finger & Verify Meal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Verification Feedback & Student Details Display */}
                <div className="verification-display-bay">
                  {!scanResult && !isScanning && (
                    <div className="scanner-idle-state">
                      <div className="idle-radar">
                        <Fingerprint size={48} className="text-slate-400" />
                      </div>
                      <h4 className="text-slate-700 font-semibold mt-3">Awaiting Student Fingerprint</h4>
                      <p className="text-slate-500 text-xs max-w-sm text-center mt-1">
                        Select a student from the dropdown or test sensor. The system will match biometric templates, check subscription validity, block duplicate claims, and alert staff for special dish orders.
                      </p>
                    </div>
                  )}

                  {isScanning && (
                    <div className="scanner-processing-state">
                      <div className="animate-spin text-blue-600 mb-3">
                        <RefreshCw size={40} />
                      </div>
                      <h4 className="font-bold text-slate-800">Matching Biometric Pattern...</h4>
                      <p className="text-xs text-slate-500">Querying authorized campus biometric database</p>
                    </div>
                  )}

                  {scanResult && (
                    <div className={`scan-result-card ${scanResult.success ? 'success' : 'denied'}`}>
                      {/* Status Header */}
                      <div className="result-header">
                        <div className="result-status-badge">
                          {scanResult.success ? (
                            <>
                              <CheckCircle2 size={18} />
                              <span>BIOMETRIC VERIFIED · ACCESS GRANTED</span>
                            </>
                          ) : scanResult.code === 'DUPLICATE_CLAIM' ? (
                            <>
                              <AlertTriangle size={18} />
                              <span>DUPLICATE MEAL CLAIM BLOCKED</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={18} />
                              <span>VERIFICATION REJECTED</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      {/* Student Details Grid (Section 2) */}
                      {scanResult.student && (
                        <div className="student-verified-profile">
                          <img
                            src={scanResult.student.avatar}
                            alt={scanResult.student.name}
                            className="student-avatar-img"
                          />
                          <div className="student-profile-info">
                            <div className="flex items-center gap-2">
                              <h3 className="student-name">{scanResult.student.name}</h3>
                              <span className={`category-tag ${scanResult.student.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                                {scanResult.student.category}
                              </span>
                            </div>
                            <div className="profile-meta-row">
                              <span><strong>ID:</strong> {scanResult.student.studentId}</span>
                              <span>·</span>
                              <span><strong>Dept:</strong> {scanResult.student.department}</span>
                              <span>·</span>
                              <span><strong>Room/Loc:</strong> {scanResult.student.room}</span>
                            </div>

                            <div className="verification-badges-row">
                              <span className="meta-badge fp">
                                <Fingerprint size={12} />
                                {scanResult.success ? scanResult.log.biometricStatus : `Template: ${scanResult.student.fingerprintId}`}
                              </span>
                              <span className="meta-badge meal">
                                {terminalMealType} Access
                              </span>
                              <span className={`meta-badge sub ${scanResult.success ? 'valid' : 'invalid'}`}>
                                {scanResult.success ? 'Yearly Subscribed' : scanResult.code}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error or Duplicate Alert Banner */}
                      {!scanResult.success && (
                        <div className="rejection-reason-box">
                          <AlertTriangle size={18} className="shrink-0" />
                          <div>
                            <strong>{scanResult.message}</strong>
                            {scanResult.duplicateLog && (
                              <p className="text-xs mt-1 text-red-600">
                                Previous access: {scanResult.duplicateLog.date} at {scanResult.duplicateLog.time} via {scanResult.duplicateLog.terminalId}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* INTEGRATION WITH SPECIAL DISHES (Section 9.4) */}
                      {/* Prominent staff alert: Fingerprint scan ALONE must NOT mark served! Staff clicks Confirm Served */}
                      {scanResult.success && scanResult.specialDishOrders && scanResult.specialDishOrders.length > 0 && (
                        <div className="special-dish-alert-box">
                          <div className="special-alert-header">
                            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                              <UtensilsCrossed size={16} />
                              <span>Confirmed Special Dish Order Detected for this Meal!</span>
                            </div>
                            <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-semibold">
                              Action Required by Canteen Staff
                            </span>
                          </div>

                          <div className="special-orders-list mt-2 space-y-2">
                            {scanResult.specialDishOrders.map(dishOrder => (
                              <div key={dishOrder.id} className="special-order-row">
                                <div>
                                  <div className="font-semibold text-slate-800 text-sm">
                                    {dishOrder.quantity}x {dishOrder.dishName}
                                  </div>
                                  <div className="text-xs text-slate-500 font-mono">
                                    {dishOrder.id} · Scheduled: {dishOrder.scheduledServingDate} ({dishOrder.mealCategory}) · ₹{dishOrder.totalAdditionalCharge}
                                  </div>
                                </div>
                                <div>
                                  {dishOrder.orderStatus === 'Served' ? (
                                    <span className="status-badge served">
                                      <CheckCircle2 size={12} /> Served
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn-confirm-served"
                                      onClick={() => handleConfirmSpecialDishServed(dishOrder.id)}
                                    >
                                      <Check size={14} />
                                      <span>Confirm Served</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-amber-700 mt-2 italic">
                            * Note: Per canteen regulations, biometric scan alone does not mark special items as served. Staff must hand over dish and click "Confirm Served".
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DAILY MEAL RECORDS REGISTER (Section 3) */}
            <div className="canteen-table-card">
              <div className="table-card-header">
                <div>
                  <h3 className="table-title">Daily Meal Records Register</h3>
                  <p className="table-sub">Verified students who successfully accessed breakfast, lunch, or dinner on the selected date</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="canteen-btn-secondary"
                    onClick={() => handleExportCsv(filteredLogs, `Daily_Meal_Register_${recordDate}`)}
                  >
                    <Download size={14} />
                    <span>Export Register (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="table-filters-bar">
                <div className="filter-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    className="canteen-input-sm"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Student Category:</label>
                  <select
                    className="canteen-select-sm"
                    value={recordCategory}
                    onChange={(e) => setRecordCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Day Scholar">Day Scholars</option>
                    <option value="Hosteller">Hostellers</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Meal Type:</label>
                  <select
                    className="canteen-select-sm"
                    value={recordMealType}
                    onChange={(e) => setRecordMealType(e.target.value)}
                  >
                    <option value="All">All Meals (Breakfast, Lunch, Dinner)</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div className="search-filter-box">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student ID or name..."
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Records Table */}
              <div className="overflow-x-auto">
                <table className="canteen-data-table">
                  <thead>
                    <tr>
                      <th>Time & Date</th>
                      <th>Student Details</th>
                      <th>Category</th>
                      <th>Meal Type</th>
                      <th>Biometric Verification</th>
                      <th>Subscription</th>
                      <th>Terminal / Station</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">
                          No biometric meal records found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td>
                            <div className="font-semibold text-slate-800">{log.time}</div>
                            <div className="text-xs text-slate-400">{log.date}</div>
                          </td>
                          <td>
                            <div className="font-bold text-slate-800">{log.studentName}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {log.studentId}</div>
                          </td>
                          <td>
                            <span className={`category-tag ${log.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                              {log.category}
                            </span>
                          </td>
                          <td>
                            <span className={`meal-tag ${log.mealType.toLowerCase()}`}>
                              {log.mealType === 'Breakfast' && <Coffee size={12} />}
                              {log.mealType === 'Lunch' && <Sun size={12} />}
                              {log.mealType === 'Dinner' && <Moon size={12} />}
                              <span>{log.mealType}</span>
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 size={14} />
                              <span>{log.biometricStatus}</span>
                            </div>
                            <div className="text-2xs text-slate-400 font-mono mt-0.5">
                              ID: {log.fingerprintId}
                            </div>
                          </td>
                          <td>
                            <span className="status-badge active text-2xs">
                              {log.subscriptionStatus}
                            </span>
                          </td>
                          <td className="text-xs text-slate-600 font-mono">
                            {log.terminalId}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DAY SCHOLARS (FOCUSED REGISTER) */}
        {/* ======================================================== */}
        {activeTab === 'day_scholars' && (
          <div className="canteen-tab-content space-y-6">
            <div className="section-banner day-scholar">
              <div>
                <span className="badge-tag">Day Scholar Directorate</span>
                <h2 className="banner-heading">Day Scholar Dining Records</h2>
                <p className="banner-sub">
                  Filtered records of day-commuter students authorized for canteen facility (Breakfast & Lunch programs)
                </p>
              </div>
              <button
                type="button"
                className="canteen-btn-primary"
                onClick={() => handleExportCsv(dayScholarLogs, 'Day_Scholars_Meal_Register')}
              >
                <Download size={15} />
                <span>Download Day Scholar Register</span>
              </button>
            </div>

            {/* Quick summary for Day Scholars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase">Breakfast Today</span>
                  <h3 className="text-2xl font-bold text-slate-800">{todaySummary.breakfast.dayScholars} Day Scholars</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Coffee size={20} />
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase">Lunch Today</span>
                  <h3 className="text-2xl font-bold text-slate-800">{todaySummary.lunch.dayScholars} Day Scholars</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sun size={20} />
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase">Total Day Scholar Logins</span>
                  <h3 className="text-2xl font-bold text-slate-800">{todaySummary.breakfast.dayScholars + todaySummary.lunch.dayScholars + todaySummary.dinner.dayScholars}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="canteen-table-card">
              <div className="table-card-header">
                <h3 className="table-title">Day Scholars Verified Meal Log</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="canteen-input-sm"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Search day scholars..."
                    className="canteen-input-sm"
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="canteen-data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Student Name & ID</th>
                      <th>Meal Accessed</th>
                      <th>Biometric Match</th>
                      <th>Authorized Terminal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayScholarLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-slate-400">
                          No Day Scholar records found for this date.
                        </td>
                      </tr>
                    ) : (
                      dayScholarLogs.map(log => (
                        <tr key={log.id}>
                          <td>
                            <strong className="text-slate-800">{log.time}</strong>
                            <div className="text-xs text-slate-400">{log.date}</div>
                          </td>
                          <td>
                            <div className="font-bold text-slate-800">{log.studentName}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {log.studentId}</div>
                          </td>
                          <td>
                            <span className={`meal-tag ${log.mealType.toLowerCase()}`}>
                              {log.mealType}
                            </span>
                          </td>
                          <td>
                            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                              <CheckCircle2 size={13} /> {log.biometricStatus}
                            </span>
                          </td>
                          <td className="text-xs text-slate-500 font-mono">{log.terminalId}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: HOSTELLERS (FOCUSED REGISTER) */}
        {/* ======================================================== */}
        {activeTab === 'hostellers' && (
          <div className="canteen-tab-content space-y-6">
            <div className="section-banner hosteller">
              <div>
                <span className="badge-tag">Hostel Dining Directorate</span>
                <h2 className="banner-heading">Hostellers Mess Records</h2>
                <p className="banner-sub">
                  Complete 3-meal (Breakfast, Lunch, Dinner) boarding register for resident hostellers
                </p>
              </div>
              <button
                type="button"
                className="canteen-btn-primary"
                onClick={() => handleExportCsv(hostellerLogs, 'Hosteller_Mess_Register')}
              >
                <Download size={15} />
                <span>Download Hostellers Register</span>
              </button>
            </div>

            {/* Quick summary for Hostellers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Breakfast</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{todaySummary.breakfast.hostellers}</h3>
                <span className="text-xs text-emerald-600 font-medium">Resident Boarders</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Lunch</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{todaySummary.lunch.hostellers}</h3>
                <span className="text-xs text-emerald-600 font-medium">Resident Boarders</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Dinner</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{todaySummary.dinner.hostellers}</h3>
                <span className="text-xs text-emerald-600 font-medium">Resident Boarders</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Meals Today</span>
                <h3 className="text-2xl font-bold text-purple-700 mt-1">
                  {todaySummary.breakfast.hostellers + todaySummary.lunch.hostellers + todaySummary.dinner.hostellers}
                </h3>
                <span className="text-xs text-slate-400">Hostel Mess Bay</span>
              </div>
            </div>

            {/* Table */}
            <div className="canteen-table-card">
              <div className="table-card-header">
                <h3 className="table-title">Hostellers Verified Mess Dining Log</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="canteen-input-sm"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Search hostellers..."
                    className="canteen-input-sm"
                    value={recordSearch}
                    onChange={(e) => setRecordSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="canteen-data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Student Name & ID</th>
                      <th>Meal Accessed</th>
                      <th>Biometric Verification</th>
                      <th>Hostel Mess Terminal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hostellerLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-slate-400">
                          No Hosteller records found for this date.
                        </td>
                      </tr>
                    ) : (
                      hostellerLogs.map(log => (
                        <tr key={log.id}>
                          <td>
                            <strong className="text-slate-800">{log.time}</strong>
                            <div className="text-xs text-slate-400">{log.date}</div>
                          </td>
                          <td>
                            <div className="font-bold text-slate-800">{log.studentName}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {log.studentId}</div>
                          </td>
                          <td>
                            <span className={`meal-tag ${log.mealType.toLowerCase()}`}>
                              {log.mealType}
                            </span>
                          </td>
                          <td>
                            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                              <CheckCircle2 size={13} /> {log.biometricStatus}
                            </span>
                          </td>
                          <td className="text-xs text-slate-500 font-mono">{log.terminalId}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: FOOD ACCESS APPLICATIONS (Section 4) */}
        {/* ======================================================== */}
        {activeTab === 'food_applications' && (
          <div className="canteen-tab-content space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Food Access Applications</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Separate review queue for students requesting canteen facility access. Only approved students can activate meal subscriptions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>{applications.filter(a => a.status === 'Pending').length} Applications Awaiting Review</span>
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill-btn ${appFilterStatus === st ? 'active' : ''}`}
                    onClick={() => setAppFilterStatus(st)}
                  >
                    {st === 'Pending' && <span className="status-dot amber"></span>}
                    {st === 'Approved' && <span className="status-dot green"></span>}
                    {st === 'Rejected' && <span className="status-dot red"></span>}
                    <span>{st} Applications</span>
                  </button>
                ))}
              </div>
              <div className="search-filter-box">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Applications Table */}
            <div className="canteen-table-card">
              <div className="overflow-x-auto">
                <table className="canteen-data-table">
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Student Details</th>
                      <th>Category</th>
                      <th>Submission Date</th>
                      <th>Requested Meals</th>
                      <th>Application Status</th>
                      <th>Subscription Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-400">
                          No food access applications found.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map(app => {
                        const isPending = app.status === 'Pending';
                        return (
                          <tr key={app.id} className={isPending ? 'pending-highlight-row' : ''}>
                            <td className="font-mono text-xs font-semibold text-slate-700">{app.id}</td>
                            <td>
                              <div className="font-bold text-slate-800">{app.studentName}</div>
                              <div className="text-xs text-slate-500 font-mono">ID: {app.studentId} · {app.department}</div>
                            </td>
                            <td>
                              <span className={`category-tag ${app.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                                {app.category}
                              </span>
                            </td>
                            <td className="text-xs text-slate-600">{app.submissionDate}</td>
                            <td>
                              <div className="flex gap-1 flex-wrap">
                                {app.requestedMeals.map(m => (
                                  <span key={m} className="px-2 py-0.5 rounded text-xs bg-slate-100 font-medium text-slate-700">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${app.status.toLowerCase()}`}>
                                {app.status === 'Pending' && <Clock size={11} />}
                                {app.status === 'Approved' && <CheckCircle2 size={11} />}
                                {app.status === 'Rejected' && <XCircle size={11} />}
                                <span>{app.status}</span>
                              </span>
                            </td>
                            <td>
                              <span className={`text-xs font-medium ${app.status === 'Approved' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {app.subscriptionStatus}
                              </span>
                            </td>
                            <td>
                              {isPending ? (
                                <button
                                  type="button"
                                  className="btn-review-app"
                                  onClick={() => { setReviewModalApp(app); setReviewRemarks(''); }}
                                >
                                  <span>Review</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="text-xs text-blue-600 hover:underline font-semibold"
                                  onClick={() => { setReviewModalApp(app); setReviewRemarks(app.remarks || ''); }}
                                >
                                  Details
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Application Review Modal */}
            {reviewModalApp && (
              <div className="canteen-modal-overlay" onClick={() => setReviewModalApp(null)}>
                <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title">Review Food Access Application</h3>
                      <p className="modal-sub">Application ID: {reviewModalApp.id}</p>
                    </div>
                    <button className="modal-close-btn" onClick={() => setReviewModalApp(null)}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="modal-body space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Student Name:</span>
                        <strong className="text-slate-800 text-sm">{reviewModalApp.studentName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Student ID:</span>
                        <strong className="text-slate-800 font-mono text-sm">{reviewModalApp.studentId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Category:</span>
                        <span className={`category-tag ${reviewModalApp.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                          {reviewModalApp.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Requested Meals:</span>
                        <span className="font-semibold text-slate-800">{reviewModalApp.requestedMeals.join(', ')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Administrative Remarks / Verification Notes:
                      </label>
                      <textarea
                        className="canteen-textarea"
                        rows="3"
                        placeholder="e.g. Identity verified with hostel warden / day scholar registration cleared."
                        value={reviewRemarks}
                        onChange={(e) => setReviewRemarks(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="canteen-btn-secondary"
                      onClick={() => setReviewModalApp(null)}
                    >
                      Close
                    </button>
                    {reviewModalApp.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="canteen-btn-danger"
                          onClick={() => handleReviewAction('Rejected')}
                        >
                          <X size={14} />
                          <span>Reject Application</span>
                        </button>
                        <button
                          type="button"
                          className="canteen-btn-primary"
                          onClick={() => handleReviewAction('Approved')}
                        >
                          <Check size={14} />
                          <span>Approve Access</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: YEARLY MEAL SUBSCRIPTIONS (Section 5) */}
        {/* ======================================================== */}
        {activeTab === 'yearly_subscriptions' && (
          <div className="canteen-tab-content space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Yearly Meal Subscriptions Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Approved students can choose any combination of yearly breakfast, lunch, and dinner plans.
                </p>
              </div>
              <div className="search-filter-box">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subscriber..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Meal Plan Reference Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-2xs uppercase font-bold px-3 py-1 rounded-bl-lg">
                  Annual Option 1
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Breakfast Subscription</h4>
                    <span className="text-xs text-slate-400">Yearly Morning Meal Plan</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  ₹12,000 <span className="text-xs font-normal text-slate-500">/ academic year</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Available to both Day Scholars & Hostellers</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-2xs uppercase font-bold px-3 py-1 rounded-bl-lg">
                  Annual Option 2
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Sun size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Lunch Subscription</h4>
                    <span className="text-xs text-slate-400">Yearly Midday Meal Plan</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  ₹18,000 <span className="text-xs font-normal text-slate-500">/ academic year</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Standard full meal thali + seasonal curry</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-2xs uppercase font-bold px-3 py-1 rounded-bl-lg">
                  Annual Option 3
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Moon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Dinner Subscription</h4>
                    <span className="text-xs text-slate-400">Yearly Night Meal Plan</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  ₹18,000 <span className="text-xs font-normal text-slate-500">/ academic year</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Dinner + dessert combo (Hostel & late boarders)</p>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="canteen-table-card">
              <div className="table-card-header">
                <h3 className="table-title">Active Yearly Subscribers Register</h3>
                <span className="text-xs text-slate-500">Duration: 01 Aug 2026 – 31 Jul 2027</span>
              </div>

              <div className="overflow-x-auto">
                <table className="canteen-data-table">
                  <thead>
                    <tr>
                      <th>Subscription ID</th>
                      <th>Student Name & ID</th>
                      <th>Category</th>
                      <th>Subscribed Meal Plans</th>
                      <th>Annual Fee</th>
                      <th>Validity Duration</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map(sub => (
                      <tr key={sub.id}>
                        <td className="font-mono text-xs font-semibold text-slate-700">{sub.id}</td>
                        <td>
                          <div className="font-bold text-slate-800">{sub.studentName}</div>
                          <div className="text-xs text-slate-500 font-mono">ID: {sub.studentId}</div>
                        </td>
                        <td>
                          <span className={`category-tag ${sub.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                            {sub.category}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1.5 flex-wrap">
                            {sub.selectedMeals.breakfast && (
                              <span className="meal-tag breakfast text-xs">
                                <Coffee size={11} /> Breakfast (₹12k)
                              </span>
                            )}
                            {sub.selectedMeals.lunch && (
                              <span className="meal-tag lunch text-xs">
                                <Sun size={11} /> Lunch (₹18k)
                              </span>
                            )}
                            {sub.selectedMeals.dinner && (
                              <span className="meal-tag dinner text-xs">
                                <Moon size={11} /> Dinner (₹18k)
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong className="text-slate-900 font-bold">
                            ₹{sub.totalAnnualFee.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <div className="text-xs font-medium text-slate-700">{sub.startDate} to {sub.expiryDate}</div>
                          <div className="text-2xs text-emerald-600 font-semibold">{sub.renewalNotice}</div>
                        </td>
                        <td>
                          <span className="status-badge active text-xs">
                            <CheckCircle2 size={11} /> {sub.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="text-xs text-blue-600 font-semibold hover:underline"
                            onClick={() => {
                              const std = canteenStore.getStudentById(sub.studentId);
                              setEditSubModalStudent(std || { studentId: sub.studentId, name: sub.studentName, category: sub.category });
                              setSubFormMeals(sub.selectedMeals);
                            }}
                          >
                            Modify Plans
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modify Subscription Modal */}
            {editSubModalStudent && (
              <div className="canteen-modal-overlay" onClick={() => setEditSubModalStudent(null)}>
                <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title">Configure Yearly Meal Subscription</h3>
                      <p className="modal-sub">Student: {editSubModalStudent.name} ({editSubModalStudent.studentId})</p>
                    </div>
                    <button className="modal-close-btn" onClick={() => setEditSubModalStudent(null)}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="modal-body space-y-4">
                    <p className="text-xs text-slate-600">
                      Select one or more independent meal subscriptions according to student eligibility and preference:
                    </p>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={subFormMeals.breakfast}
                            onChange={(e) => setSubFormMeals(m => ({ ...m, breakfast: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">Breakfast Subscription</span>
                            <span className="text-xs text-slate-400">07:30 AM – 09:30 AM (Daily)</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">₹12,000 / yr</span>
                      </label>

                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={subFormMeals.lunch}
                            onChange={(e) => setSubFormMeals(m => ({ ...m, lunch: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">Lunch Subscription</span>
                            <span className="text-xs text-slate-400">12:30 PM – 02:45 PM (Daily)</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">₹18,000 / yr</span>
                      </label>

                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={subFormMeals.dinner}
                            onChange={(e) => setSubFormMeals(m => ({ ...m, dinner: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">Dinner Subscription</span>
                            <span className="text-xs text-slate-400">07:30 PM – 09:45 PM (Daily)</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">₹18,000 / yr</span>
                      </label>
                    </div>

                    <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">Calculated Annual Fee:</span>
                      <strong className="text-lg font-black text-blue-700">
                        ₹{(
                          (subFormMeals.breakfast ? 12000 : 0) +
                          (subFormMeals.lunch ? 18000 : 0) +
                          (subFormMeals.dinner ? 18000 : 0)
                        ).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="canteen-btn-secondary"
                      onClick={() => setEditSubModalStudent(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="canteen-btn-primary"
                      onClick={handleSaveSubscription}
                    >
                      <Check size={14} />
                      <span>Save & Activate Plan</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: SPECIAL DISHES & EXTRA CURRIES (Section 9.1) */}
        {/* ======================================================== */}
        {activeTab === 'special_dishes' && (
          <div className="canteen-tab-content space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Special Dishes & Extra Curries Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side dishes and special curries available for student orders apart from regular subscription
                </p>
              </div>
              <button
                type="button"
                className="canteen-btn-primary"
                onClick={() => setIsAddDishModalOpen(true)}
              >
                <Plus size={15} />
                <span>Add Special Item</span>
              </button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {specialDishes.map(dish => (
                <div key={dish.id} className="dish-card">
                  <div className="dish-card-header">
                    <span className={`diet-pill ${dish.dietType === 'Vegetarian' ? 'veg' : 'non-veg'}`}>
                      <span className="diet-dot"></span>
                      <span>{dish.dietType}</span>
                    </span>
                    <button
                      type="button"
                      className={`stock-toggle-btn ${dish.isAvailable ? 'available' : 'out-of-stock'}`}
                      onClick={() => canteenStore.toggleSpecialDishAvailability(dish.id)}
                    >
                      {dish.isAvailable ? 'Available' : 'Out of Stock'}
                    </button>
                  </div>

                  <h3 className="dish-name">{dish.name}</h3>
                  <span className="dish-category">{dish.category}</span>
                  <p className="dish-desc">{dish.description}</p>

                  <div className="dish-meta-info">
                    <div className="text-2xs text-slate-500">
                      <strong>Servings:</strong> {dish.mealAvailability.join(', ')}
                    </div>
                    <div className="text-2xs text-amber-700 font-mono mt-0.5">
                      Cutoff: {dish.orderingCutoff}
                    </div>
                  </div>

                  <div className="dish-footer">
                    <div className="dish-price">₹{dish.price}</div>
                    <span className="text-2xs text-slate-400 font-mono">ID: {dish.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Special Dish Modal */}
            {isAddDishModalOpen && (
              <div className="canteen-modal-overlay" onClick={() => setIsAddDishModalOpen(false)}>
                <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title">Add Special Dish / Extra Curry</h3>
                      <p className="modal-sub">Set dish details, pricing, and ordering cutoff times</p>
                    </div>
                    <button className="modal-close-btn" onClick={() => setIsAddDishModalOpen(false)}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleAddDish}>
                    <div className="modal-body space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Dish Name:</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kadhai Paneer / Mutton Rogan Josh"
                          className="canteen-input"
                          value={newDishForm.name}
                          onChange={(e) => setNewDishForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Category:</label>
                          <select
                            className="canteen-select"
                            value={newDishForm.category}
                            onChange={(e) => setNewDishForm(f => ({ ...f, category: e.target.value }))}
                          >
                            <option value="Special Curry">Special Curry</option>
                            <option value="Special Non-Veg Curry">Special Non-Veg Curry</option>
                            <option value="Special Non-Veg Side">Special Non-Veg Side</option>
                            <option value="Curry / Side Dish">Curry / Side Dish</option>
                            <option value="Dessert & Sweets">Dessert & Sweets</option>
                            <option value="Dairy & Dessert">Dairy & Dessert</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Price per Portion (₹):</label>
                          <input
                            type="number"
                            min="10"
                            max="500"
                            required
                            className="canteen-input"
                            value={newDishForm.price}
                            onChange={(e) => setNewDishForm(f => ({ ...f, price: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Diet Type:</label>
                          <select
                            className="canteen-select"
                            value={newDishForm.dietType}
                            onChange={(e) => setNewDishForm(f => ({ ...f, dietType: e.target.value }))}
                          >
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Ordering Cutoff Time:</label>
                          <input
                            type="text"
                            placeholder="e.g. 11:30 AM (Lunch)"
                            className="canteen-input"
                            value={newDishForm.orderingCutoff}
                            onChange={(e) => setNewDishForm(f => ({ ...f, orderingCutoff: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Description:</label>
                        <textarea
                          rows="2"
                          className="canteen-textarea"
                          placeholder="Brief description of preparation, ingredients, or allergens..."
                          value={newDishForm.description}
                          onChange={(e) => setNewDishForm(f => ({ ...f, description: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="canteen-btn-secondary"
                        onClick={() => setIsAddDishModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="canteen-btn-primary">
                        <Plus size={14} />
                        <span>Add Dish to Menu</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: SPECIAL DISH TRANSACTIONS (Section 9.3) */}
        {/* ======================================================== */}
        {activeTab === 'special_transactions' && (
          <div className="canteen-tab-content space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Special Dish Transactions Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed administrative log of special dish orders, preparation fulfillment, serving confirmations, and payment statuses.
                </p>
              </div>
              <button
                type="button"
                className="canteen-btn-secondary"
                onClick={() => {
                  const headers = ['Trx ID', 'Student ID', 'Student Name', 'Dish', 'Meal', 'Serving Date', 'Qty', 'Price', 'Total', 'Order Status', 'Payment Status'];
                  const rows = specialTransactions.map(t => [
                    t.id, t.studentId, `"${t.studentName}"`, `"${t.dishName}"`, t.mealCategory, t.scheduledServingDate, t.quantity, t.pricePerItem, t.totalAdditionalCharge, t.orderStatus, t.paymentStatus
                  ]);
                  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const link = document.createElement('a');
                  link.href = encodeURI(csv);
                  link.download = `Special_Dish_Transactions_${trxDate}.csv`;
                  link.click();
                  showToast('Exported special dish transactions report!', 'success');
                }}
              >
                <Download size={14} />
                <span>Export Transaction Report (CSV)</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="table-filters-bar">
              <div className="filter-group">
                <label>Serving Date:</label>
                <select
                  className="canteen-select-sm"
                  value={trxDate}
                  onChange={(e) => setTrxDate(e.target.value)}
                >
                  <option value="2026-10-27">Today (27 Oct 2026)</option>
                  <option value="2026-10-26">Yesterday (26 Oct 2026)</option>
                  <option value="All">All Historical Dates</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Meal Category:</label>
                <select
                  className="canteen-select-sm"
                  value={trxMeal}
                  onChange={(e) => setTrxMeal(e.target.value)}
                >
                  <option value="All">All Meals</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Breakfast">Breakfast</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Order Status:</label>
                <select
                  className="canteen-select-sm"
                  value={trxOrderStatus}
                  onChange={(e) => setTrxOrderStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Requested">Requested</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Prepared">Prepared</option>
                  <option value="Served">Served</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Payment:</label>
                <select
                  className="canteen-select-sm"
                  value={trxPaymentStatus}
                  onChange={(e) => setTrxPaymentStatus(e.target.value)}
                >
                  <option value="All">All Payments</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="search-filter-box">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or dish..."
                  value={trxSearch}
                  onChange={(e) => setTrxSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="canteen-table-card">
              <div className="overflow-x-auto">
                <table className="canteen-data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Student Details</th>
                      <th>Dish / Curry Item</th>
                      <th>Meal & Date</th>
                      <th>Qty & Price</th>
                      <th>Total Charge</th>
                      <th>Order Status</th>
                      <th>Payment Status</th>
                      <th>Fulfillment Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-8 text-slate-400">
                          No special dish transactions match current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      specialTransactions.map(trx => (
                        <tr key={trx.id}>
                          <td className="font-mono text-xs font-semibold text-slate-700">{trx.id}</td>
                          <td>
                            <div className="font-bold text-slate-800">{trx.studentName}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {trx.studentId}</div>
                          </td>
                          <td>
                            <div className="font-semibold text-slate-800">{trx.dishName}</div>
                          </td>
                          <td>
                            <div className="font-medium text-slate-800">{trx.scheduledServingDate}</div>
                            <span className="text-xs text-slate-400">({trx.mealCategory})</span>
                          </td>
                          <td>
                            <span className="text-xs text-slate-700">
                              {trx.quantity} × ₹{trx.pricePerItem}
                            </span>
                          </td>
                          <td>
                            <strong className="text-slate-900 font-bold">
                              ₹{trx.totalAdditionalCharge}
                            </strong>
                          </td>
                          <td>
                            <span className={`status-badge ${trx.orderStatus.toLowerCase()}`}>
                              {trx.orderStatus}
                            </span>
                            {trx.servedTimestamp && (
                              <div className="text-2xs text-slate-400 mt-0.5">
                                {trx.servedTimestamp}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${trx.paymentStatus === 'Paid' ? 'active' : 'pending'}`}>
                              {trx.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              {trx.orderStatus !== 'Served' && trx.orderStatus !== 'Cancelled' ? (
                                <button
                                  type="button"
                                  className="btn-action-sm served"
                                  title="Mark as Served"
                                  onClick={() => {
                                    canteenStore.markSpecialDishServed(trx.id, account?.name || 'Kailash Sahoo');
                                    showToast(`Order ${trx.id} marked as SERVED!`, 'success');
                                  }}
                                >
                                  <Check size={12} />
                                  <span>Mark Served</span>
                                </button>
                              ) : null}

                              {trx.paymentStatus === 'Pending' && (
                                <button
                                  type="button"
                                  className="btn-action-sm pay"
                                  title="Record Payment"
                                  onClick={() => {
                                    canteenStore.updatePaymentStatus(trx.id, 'Paid');
                                    showToast(`Payment recorded for ${trx.id}!`, 'success');
                                  }}
                                >
                                  <span>Mark Paid</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: CANTEEN FEES & PAYMENTS (Section 9.2) */}
        {/* ======================================================== */}
        {activeTab === 'canteen_fees' && (
          <div className="canteen-tab-content space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Canteen Fees & Student Accounts</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculation Formula: <strong>Total Charges = Yearly Subscription Fees + Special-Dish Charges</strong> | <strong>Outstanding Balance = Total Charges − Payments Made</strong>
                </p>
              </div>
              <div className="search-filter-box">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student fee account..."
                  value={feeSearch}
                  onChange={(e) => setFeeSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Total Balance Overview KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Yearly Subscription Charges</span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">
                  ₹{feeAccounts.reduce((sum, a) => sum + a.yearlySubscriptionFee, 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-xs text-slate-400">All registered meal plans</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Special-Dish Charges</span>
                <h3 className="text-xl font-bold text-amber-600 mt-1">
                  ₹{feeAccounts.reduce((sum, a) => sum + a.specialDishCharges, 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-xs text-slate-400">Side dishes & extra curries</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Payments Collected</span>
                <h3 className="text-xl font-bold text-emerald-600 mt-1">
                  ₹{feeAccounts.reduce((sum, a) => sum + a.paymentsMade, 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-xs text-slate-400">Receipts reconciled</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-red-50 to-white">
                <span className="text-xs text-red-600 font-bold uppercase">Total Outstanding Balance</span>
                <h3 className="text-xl font-extrabold text-red-700 mt-1">
                  ₹{feeAccounts.reduce((sum, a) => sum + a.outstandingBalance, 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-xs text-red-500 font-medium">Pending student recovery</span>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="canteen-table-card">
              <div className="table-card-header">
                <h3 className="table-title">Individual Student Canteen Fee Ledger</h3>
                <span className="text-xs text-slate-400">Billed transparently once per confirmed order / yearly plan</span>
              </div>

              <div className="overflow-x-auto">
                <table className="canteen-data-table">
                  <thead>
                    <tr>
                      <th>Student Details</th>
                      <th>Category</th>
                      <th>Yearly Sub Fees</th>
                      <th>Special-Dish Charges</th>
                      <th>Total Charges</th>
                      <th>Payments Made</th>
                      <th>Outstanding Balance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeeAccounts.map(acc => (
                      <tr key={acc.student.studentId}>
                        <td>
                          <div className="font-bold text-slate-800">{acc.student.name}</div>
                          <div className="text-xs text-slate-500 font-mono">ID: {acc.student.studentId} · {acc.student.department}</div>
                        </td>
                        <td>
                          <span className={`category-tag ${acc.student.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                            {acc.student.category}
                          </span>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-800">
                            ₹{acc.yearlySubscriptionFee.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <span className="font-semibold text-amber-600">
                            ₹{acc.specialDishCharges.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <strong className="text-slate-900 font-bold">
                            ₹{acc.totalCanteenCharges.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <span className="text-emerald-700 font-semibold">
                            ₹{acc.paymentsMade.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <strong className={`font-black ${acc.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            ₹{acc.outstandingBalance.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-record-payment"
                            onClick={() => {
                              setPaymentModalAccount(acc);
                              setPaymentAmount(String(acc.outstandingBalance > 0 ? acc.outstandingBalance : ''));
                            }}
                          >
                            <CreditCard size={12} />
                            <span>Collect Payment</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Record Payment Modal */}
            {paymentModalAccount && (
              <div className="canteen-modal-overlay" onClick={() => setPaymentModalAccount(null)}>
                <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title">Record Canteen Fee Payment</h3>
                      <p className="modal-sub">Student: {paymentModalAccount.student.name} ({paymentModalAccount.student.studentId})</p>
                    </div>
                    <button className="modal-close-btn" onClick={() => setPaymentModalAccount(null)}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleRecordPayment}>
                    <div className="modal-body space-y-4">
                      {/* Financial breakdown overview */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Yearly Subscription Fees:</span>
                          <span className="font-bold">₹{paymentModalAccount.yearlySubscriptionFee.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Special-Dish Charges:</span>
                          <span className="font-bold text-amber-600">₹{paymentModalAccount.specialDishCharges.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1">
                          <span className="font-bold text-slate-700">Total Billed Charges:</span>
                          <span className="font-bold text-slate-900">₹{paymentModalAccount.totalCanteenCharges.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payments Previously Made:</span>
                          <span className="font-bold text-emerald-600">₹{paymentModalAccount.paymentsMade.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1 text-sm">
                          <span className="font-extrabold text-red-600">Current Outstanding Balance:</span>
                          <span className="font-black text-red-600">₹{paymentModalAccount.outstandingBalance.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Amount (₹):</label>
                        <input
                          type="number"
                          min="1"
                          max={paymentModalAccount.outstandingBalance > 0 ? paymentModalAccount.outstandingBalance : 50000}
                          required
                          className="canteen-input font-bold text-base"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Mode:</label>
                        <select
                          className="canteen-select"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                        >
                          <option value="UPI (GPay / PhonePe)">UPI (GPay / PhonePe / Paytm)</option>
                          <option value="Net Banking">Net Banking (NEFT/RTGS)</option>
                          <option value="Debit Card / Credit Card">Debit Card / Credit Card</option>
                          <option value="Cash Deposit">Cash Deposit at Bursar Counter</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="canteen-btn-secondary"
                        onClick={() => setPaymentModalAccount(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="canteen-btn-primary">
                        <CreditCard size={14} />
                        <span>Confirm & Generate Receipt</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
