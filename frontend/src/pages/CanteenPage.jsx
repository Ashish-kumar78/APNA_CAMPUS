import React, { useState, useEffect, useMemo } from 'react';
import {
  Fingerprint,
  Utensils,
  CreditCard,
  FileCheck,
  Calendar,
  UtensilsCrossed,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Coffee,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
  Download,
  Flame,
  Check,
  X,
  Info
} from 'lucide-react';
import { canteenStore } from '../services/canteenStore.js';
import { getActiveStudent } from '../services/studentStore.js';
import './CanteenPage.css';

export default function CanteenPage({ account }) {
  const [dataVersion, setDataVersion] = useState(0);

  // Sync listener
  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  // Determine current active student
  const activeStudentProfile = useMemo(() => {
    const active = getActiveStudent();
    const studentId = account?.studentId || account?.rollNumber || active?.studentId || '2401432265';
    const storeStudent = canteenStore.getStudentById(studentId);
    return storeStudent || {
      studentId,
      name: active?.name || account?.name || 'Bishnu Prasad Sahoo',
      category: active?.hostel === 'Yes' ? 'Hosteller' : 'Day Scholar',
      department: active?.department || 'CSE (AI)',
      room: active?.hostel === 'Yes' ? 'Block-A / 304' : 'Day Scholar',
      fingerprintId: 'FP-19181',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
  }, [account, dataVersion]);

  const studentId = activeStudentProfile.studentId;

  // Active student's canteen state
  const myApp = useMemo(() => canteenStore.getApplicationByStudentId(studentId), [studentId, dataVersion]);
  const mySub = useMemo(() => canteenStore.getSubscriptionByStudentId(studentId), [studentId, dataVersion]);
  const myFeeAccount = useMemo(() => canteenStore.getStudentFeeAccount(studentId), [studentId, dataVersion]);
  const myLogs = useMemo(() => canteenStore.getBiometricLogs({ query: studentId }), [studentId, dataVersion]);
  const mySpecialTransactions = useMemo(() => canteenStore.getSpecialTransactions({ studentId }), [studentId, dataVersion]);
  const specialDishes = useMemo(() => canteenStore.getSpecialDishes(), [dataVersion]);

  // Tab State
  const [activeTab, setActiveTab] = useState('meal_records');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Modals & Submissions ---
  // 1. Food Access Application Form
  const [appFormMeals, setAppFormMeals] = useState({ breakfast: true, lunch: true, dinner: true });
  const [appFormRemarks, setAppFormRemarks] = useState('');
  const [isSubmitAppModalOpen, setIsSubmitAppModalOpen] = useState(false);

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    const selected = [];
    if (appFormMeals.breakfast) selected.push('Breakfast');
    if (appFormMeals.lunch) selected.push('Lunch');
    if (appFormMeals.dinner) selected.push('Dinner');

    if (selected.length === 0) {
      showToast('Please select at least one meal preference', 'warning');
      return;
    }

    const res = canteenStore.submitApplication({
      studentId,
      studentName: activeStudentProfile.name,
      category: activeStudentProfile.category,
      department: activeStudentProfile.department,
      requestedMeals: selected,
      remarks: appFormRemarks
    });

    if (res.success) {
      showToast('Food access application submitted successfully!', 'success');
      setIsSubmitAppModalOpen(false);
    } else {
      showToast(res.message, 'warning');
    }
  };

  // 2. Yearly Subscription Selection Form
  const [planMeals, setPlanMeals] = useState({
    breakfast: mySub?.selectedMeals?.breakfast ?? true,
    lunch: mySub?.selectedMeals?.lunch ?? true,
    dinner: mySub?.selectedMeals?.dinner ?? true
  });

  const calculatedAnnualFee = useMemo(() => {
    return (
      (planMeals.breakfast ? 12000 : 0) +
      (planMeals.lunch ? 18000 : 0) +
      (planMeals.dinner ? 18000 : 0)
    );
  }, [planMeals]);

  const handleSaveSubscription = () => {
    if (!myApp || myApp.status !== 'Approved') {
      showToast('You must have an approved food access application before activating subscriptions', 'error');
      return;
    }

    if (!planMeals.breakfast && !planMeals.lunch && !planMeals.dinner) {
      showToast('Please select at least one meal subscription', 'warning');
      return;
    }

    const res = canteenStore.saveSubscription({
      studentId,
      studentName: activeStudentProfile.name,
      category: activeStudentProfile.category,
      selectedMeals: planMeals,
      startDate: '2026-08-01',
      expiryDate: '2027-07-31'
    });

    if (res.success) {
      showToast('Yearly meal subscription activated successfully!', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // 3. Special Dish Order Modal
  const [orderModalDish, setOrderModalDish] = useState(null);
  const [orderMealCategory, setOrderMealCategory] = useState('Lunch');
  const [orderServingDate, setOrderServingDate] = useState('2026-10-27');
  const [orderQuantity, setOrderQuantity] = useState(1);

  const handlePlaceSpecialOrder = (e) => {
    e.preventDefault();
    if (!orderModalDish) return;

    const res = canteenStore.orderSpecialDish({
      studentId,
      dishId: orderModalDish.id,
      mealCategory: orderMealCategory,
      scheduledServingDate: orderServingDate,
      quantity: Number(orderQuantity)
    });

    if (res.success) {
      showToast(`Ordered ${orderQuantity}x ${orderModalDish.name} (₹${orderModalDish.price * orderQuantity})! Charged to Canteen Account.`, 'success');
      setOrderModalDish(null);
      setOrderQuantity(1);
    } else {
      showToast(res.message, 'error');
    }
  };

  // 4. Pay Outstanding Balance Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI (GPay / PhonePe)');

  const handlePayFee = (e) => {
    e.preventDefault();
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) return;

    const res = canteenStore.recordPayment({
      studentId,
      amount: amt,
      paymentMode,
      description: 'Online Student Portal Payment'
    });

    if (res.success) {
      showToast(`Payment of ₹${amt} successful! Receipt: ${res.payment.receiptNo}`, 'success');
      setIsPayModalOpen(false);
      setPaymentAmount('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Spend analytics for special dishes
  const spendTotals = useMemo(() => {
    const list = mySpecialTransactions.filter(t => t.orderStatus !== 'Cancelled');
    const totalSpent = list.reduce((sum, t) => sum + (t.totalAdditionalCharge || 0), 0);
    const thisMonthSpent = list
      .filter(t => t.scheduledServingDate.startsWith('2026-10'))
      .reduce((sum, t) => sum + (t.totalAdditionalCharge || 0), 0);
    return { totalSpent, thisMonthSpent, count: list.length };
  }, [mySpecialTransactions]);

  return (
    <div className="canteen-student-page">
      {/* Toast Alert */}
      {toast && (
        <div className={`canteen-floating-toast ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'error' && <AlertTriangle size={18} />}
          {toast.type === 'warning' && <Info size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="student-canteen-banner">
        <div className="banner-left">
          <div className="student-profile-chip">
            <img src={activeStudentProfile.avatar} alt={activeStudentProfile.name} className="avatar-chip" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="student-welcome-name">{activeStudentProfile.name}</h1>
                <span className={`category-tag ${activeStudentProfile.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                  {activeStudentProfile.category}
                </span>
              </div>
              <div className="student-meta-sub">
                <span>Student ID: <strong>{activeStudentProfile.studentId}</strong></span>
                <span>·</span>
                <span>Room: <strong>{activeStudentProfile.room}</strong></span>
                <span>·</span>
                <span>Fingerprint ID: <strong>{activeStudentProfile.fingerprintId}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="banner-right">
          <div className="canteen-balance-card">
            <span className="balance-label">Outstanding Canteen Balance</span>
            <div className="balance-amount">
              ₹{(myFeeAccount?.outstandingBalance || 0).toLocaleString('en-IN')}
            </div>
            {myFeeAccount?.outstandingBalance > 0 ? (
              <button
                type="button"
                className="btn-pay-balance-sm"
                onClick={() => {
                  setPaymentAmount(String(myFeeAccount.outstandingBalance));
                  setIsPayModalOpen(true);
                }}
              >
                <CreditCard size={13} />
                <span>Pay Balance Online</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                <CheckCircle2 size={13} /> All Dues Cleared
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="student-canteen-tabs">
        <button
          type="button"
          className={`canteen-nav-tab ${activeTab === 'meal_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('meal_records')}
        >
          <Fingerprint size={16} />
          <span>My Biometric Records</span>
        </button>

        <button
          type="button"
          className={`canteen-nav-tab ${activeTab === 'food_application' ? 'active' : ''}`}
          onClick={() => setActiveTab('food_application')}
        >
          <FileCheck size={16} />
          <span>Food Access Application</span>
          {myApp?.status === 'Pending' && <span className="tab-badge amber">Pending</span>}
          {myApp?.status === 'Approved' && <span className="tab-badge green">Approved</span>}
        </button>

        <button
          type="button"
          className={`canteen-nav-tab ${activeTab === 'yearly_subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('yearly_subscription')}
        >
          <Calendar size={16} />
          <span>Yearly Meal Subscription</span>
          {mySub?.status === 'Active' && <span className="tab-badge green">Active</span>}
        </button>

        <button
          type="button"
          className={`canteen-nav-tab ${activeTab === 'special_dishes' ? 'active' : ''}`}
          onClick={() => setActiveTab('special_dishes')}
        >
          <UtensilsCrossed size={16} />
          <span>Special Dishes & Extra Curries</span>
        </button>

        <button
          type="button"
          className={`canteen-nav-tab ${activeTab === 'special_transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('special_transactions')}
        >
          <Receipt size={16} />
          <span>Special Dish Transactions</span>
          {spendTotals.count > 0 && <span className="tab-badge blue">{spendTotals.count}</span>}
        </button>

        <button
          type="button"
          className={`canteen-nav-tab ${activeTab === 'canteen_fees' ? 'active' : ''}`}
          onClick={() => setActiveTab('canteen_fees')}
        >
          <CreditCard size={16} />
          <span>Canteen Fees & Payments</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MY BIOMETRIC RECORDS */}
      {/* ======================================================== */}
      {activeTab === 'meal_records' && (
        <div className="student-content-pane space-y-6">
          {/* Today's Access Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="meal-status-widget breakfast">
              <div className="flex items-center justify-between">
                <span className="widget-label">Today's Breakfast</span>
                <Coffee size={18} className="text-amber-600" />
              </div>
              <div className="widget-status">
                {myLogs.some(l => l.date === '2026-10-27' && l.mealType.toLowerCase() === 'breakfast') ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-sm mt-2">
                    <CheckCircle2 size={16} /> Availed at {myLogs.find(l => l.date === '2026-10-27' && l.mealType.toLowerCase() === 'breakfast')?.time}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium text-xs mt-2 block">
                    Not Availed / Window Closed
                  </span>
                )}
              </div>
            </div>

            <div className="meal-status-widget lunch">
              <div className="flex items-center justify-between">
                <span className="widget-label">Today's Lunch</span>
                <Sun size={18} className="text-blue-600" />
              </div>
              <div className="widget-status">
                {myLogs.some(l => l.date === '2026-10-27' && l.mealType.toLowerCase() === 'lunch') ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-sm mt-2">
                    <CheckCircle2 size={16} /> Availed at {myLogs.find(l => l.date === '2026-10-27' && l.mealType.toLowerCase() === 'lunch')?.time}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium text-xs mt-2 block">
                    Available for Biometric Verification (12:30 - 02:45 PM)
                  </span>
                )}
              </div>
            </div>

            <div className="meal-status-widget dinner">
              <div className="flex items-center justify-between">
                <span className="widget-label">Today's Dinner</span>
                <Moon size={18} className="text-purple-600" />
              </div>
              <div className="widget-status">
                {myLogs.some(l => l.date === '2026-10-27' && l.mealType.toLowerCase() === 'dinner') ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-sm mt-2">
                    <CheckCircle2 size={16} /> Availed at {myLogs.find(l => l.date === '2026-10-27' && l.mealType.toLowerCase() === 'dinner')?.time}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium text-xs mt-2 block">
                    Starts at 07:30 PM (Biometric Terminal)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Access History Table */}
          <div className="canteen-table-card">
            <div className="table-card-header">
              <div>
                <h3 className="table-title">My Biometric Meal Access History</h3>
                <p className="table-sub">Verified access timestamps recorded through the canteen fingerprint terminals</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="canteen-data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Meal Type</th>
                    <th>Biometric Verification Status</th>
                    <th>Terminal / Gate</th>
                    <th>Subscription Validated</th>
                  </tr>
                </thead>
                <tbody>
                  {myLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">
                        No meal access events logged yet.
                      </td>
                    </tr>
                  ) : (
                    myLogs.map(log => (
                      <tr key={log.id}>
                        <td>
                          <div className="font-bold text-slate-800">{log.time}</div>
                          <div className="text-xs text-slate-400">{log.date}</div>
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
                          <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 size={13} />
                            <span>{log.biometricStatus}</span>
                          </div>
                          <div className="text-2xs text-slate-400 font-mono mt-0.5">Template: {log.fingerprintId}</div>
                        </td>
                        <td className="text-xs text-slate-600 font-mono">{log.terminalId}</td>
                        <td>
                          <span className="status-badge active text-xs">
                            {log.subscriptionStatus}
                          </span>
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
      {/* TAB 2: FOOD ACCESS APPLICATION (Section 4) */}
      {/* ======================================================== */}
      {activeTab === 'food_application' && (
        <div className="student-content-pane space-y-6">
          {myApp ? (
            <div className="app-status-overview-card">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Application Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`status-badge ${myApp.status.toLowerCase()} text-sm px-3 py-1`}>
                      {myApp.status === 'Approved' && <CheckCircle2 size={15} />}
                      {myApp.status === 'Pending' && <Clock size={15} />}
                      {myApp.status === 'Rejected' && <AlertTriangle size={15} />}
                      <span>Application {myApp.status.toUpperCase()}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {myApp.id}</span>
                  </div>
                </div>

                {myApp.status === 'Approved' && (
                  <div className="text-right">
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck size={14} /> Eligible for Meal Subscriptions
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Submitted On:</span>
                  <strong className="text-slate-800 text-sm">{myApp.submissionDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Student Category:</span>
                  <span className={`category-tag ${myApp.category === 'Hosteller' ? 'hosteller' : 'day-scholar'}`}>
                    {myApp.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Requested Meal Preferences:</span>
                  <div className="flex gap-1.5 mt-1">
                    {myApp.requestedMeals.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded text-xs bg-slate-100 font-semibold text-slate-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block">Reviewed By:</span>
                  <strong className="text-slate-800 text-sm">{myApp.reviewedBy || 'Pending Review'}</strong>
                  {myApp.reviewDate && <span className="text-slate-400 text-2xs block">On {myApp.reviewDate}</span>}
                </div>
              </div>

              {myApp.remarks && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Administrative Remarks:</span>
                  <p className="text-slate-600">{myApp.remarks}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-application-state">
              <FileCheck size={48} className="text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800 mt-3">No Food Access Application On Record</h3>
              <p className="text-xs text-slate-500 max-w-md text-center mt-1">
                To access the canteen and hostel mess dining facility, submit an official application requesting access for breakfast, lunch, or dinner.
              </p>
              <button
                type="button"
                className="canteen-btn-primary mt-4"
                onClick={() => setIsSubmitAppModalOpen(true)}
              >
                <Plus size={16} />
                <span>Submit Food Access Application</span>
              </button>
            </div>
          )}

          {/* Re-apply or update option if needed */}
          {myApp && myApp.status !== 'Approved' && (
            <div className="flex justify-end">
              <button
                type="button"
                className="canteen-btn-secondary"
                onClick={() => setIsSubmitAppModalOpen(true)}
              >
                <span>Edit / Re-submit Application</span>
              </button>
            </div>
          )}

          {/* Submit Application Modal */}
          {isSubmitAppModalOpen && (
            <div className="canteen-modal-overlay" onClick={() => setIsSubmitAppModalOpen(false)}>
              <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div>
                    <h3 className="modal-title">Apply for Canteen Food Access</h3>
                    <p className="modal-sub">Submit access request for administrative approval</p>
                  </div>
                  <button className="modal-close-btn" onClick={() => setIsSubmitAppModalOpen(false)}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmitApplication}>
                  <div className="modal-body space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400">Student ID:</span>
                        <strong className="block text-slate-800">{activeStudentProfile.studentId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Category:</span>
                        <strong className="block text-slate-800">{activeStudentProfile.category}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Requested Meal Preferences:
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={appFormMeals.breakfast}
                            onChange={(e) => setAppFormMeals(m => ({ ...m, breakfast: e.target.checked }))}
                            className="rounded text-blue-600"
                          />
                          <span>Breakfast (Morning Commuter / Hosteller Mess)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={appFormMeals.lunch}
                            onChange={(e) => setAppFormMeals(m => ({ ...m, lunch: e.target.checked }))}
                            className="rounded text-blue-600"
                          />
                          <span>Lunch (Midday Meal Facility)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={appFormMeals.dinner}
                            onChange={(e) => setAppFormMeals(m => ({ ...m, dinner: e.target.checked }))}
                            className="rounded text-blue-600"
                          />
                          <span>Dinner (Hostel / Evening Dining Facility)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Reason / Dietary Notes:
                      </label>
                      <textarea
                        rows="2"
                        className="canteen-textarea"
                        placeholder="e.g. Hosteller clearance or Day Scholar bus commuter meal requirement..."
                        value={appFormRemarks}
                        onChange={(e) => setAppFormRemarks(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="canteen-btn-secondary"
                      onClick={() => setIsSubmitAppModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="canteen-btn-primary">
                      <Check size={14} />
                      <span>Submit Application</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: YEARLY MEAL SUBSCRIPTION (Section 5) */}
      {/* ======================================================== */}
      {activeTab === 'yearly_subscription' && (
        <div className="student-content-pane space-y-6">
          {/* Eligibility Notice */}
          {myApp?.status !== 'Approved' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm">Food Access Application Clearance Required</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Only students with approved food access applications are eligible to activate yearly meal subscriptions. Current application status: <strong>{myApp ? myApp.status : 'Not Applied'}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Current Active Plan Status Banner */}
          {mySub && (
            <div className="active-sub-card">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <h3 className="font-extrabold text-slate-800 text-base">Active Yearly Meal Subscription</h3>
                </div>
                <span className="status-badge active text-xs">
                  {mySub.renewalNotice}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Subscription ID:</span>
                  <strong className="text-slate-800 font-mono">{mySub.id}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Annual Fee:</span>
                  <strong className="text-blue-700 text-sm font-black">₹{mySub.totalAnnualFee.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Duration:</span>
                  <strong className="text-slate-800">{mySub.startDate} to {mySub.expiryDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Covered Meals:</span>
                  <div className="flex gap-1 mt-0.5">
                    {mySub.selectedMeals.breakfast && <span className="meal-tag breakfast text-2xs">Breakfast</span>}
                    {mySub.selectedMeals.lunch && <span className="meal-tag lunch text-2xs">Lunch</span>}
                    {mySub.selectedMeals.dinner && <span className="meal-tag dinner text-2xs">Dinner</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Independent Meal Selection Section (Section 5) */}
          <div className="canteen-table-card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Customize Your Yearly Meal Subscription Plans
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select one or more independent meal subscriptions according to your preference and eligibility. You may subscribe to breakfast only, lunch only, dinner only, breakfast and lunch, or all three meals.
            </p>

            <div className="space-y-3">
              {/* Breakfast Option */}
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={planMeals.breakfast}
                    onChange={(e) => setPlanMeals(m => ({ ...m, breakfast: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Breakfast Subscription</span>
                      <span className="meal-tag breakfast text-2xs">07:30 - 09:30 AM</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daily morning nutritious breakfast (Idli/Dosa/Puri/Upma + Tea/Coffee/Milk)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <strong className="text-base font-black text-slate-900">₹12,000</strong>
                  <span className="text-2xs text-slate-400 block">/ academic year</span>
                </div>
              </label>

              {/* Lunch Option */}
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={planMeals.lunch}
                    onChange={(e) => setPlanMeals(m => ({ ...m, lunch: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Lunch Subscription</span>
                      <span className="meal-tag lunch text-2xs">12:30 - 02:45 PM</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Complete hot lunch thali: Rice + Rotis + Dal Fry + Seasonal Sabzi + Salad + Curd
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <strong className="text-base font-black text-slate-900">₹18,000</strong>
                  <span className="text-2xs text-slate-400 block">/ academic year</span>
                </div>
              </label>

              {/* Dinner Option */}
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={planMeals.dinner}
                    onChange={(e) => setPlanMeals(m => ({ ...m, dinner: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">Dinner Subscription</span>
                      <span className="meal-tag dinner text-2xs">07:30 - 09:45 PM</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full evening meal: Naan/Phulka + Rice + Paneer/Chicken gravy + Dal + Dessert
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <strong className="text-base font-black text-slate-900">₹18,000</strong>
                  <span className="text-2xs text-slate-400 block">/ academic year</span>
                </div>
              </label>
            </div>

            {/* Total Fee & Action */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Total Applicable Subscription Fee:</span>
                <div className="text-2xl font-black text-blue-700 mt-0.5">
                  ₹{calculatedAnnualFee.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">/ 1 Full Academic Year (Aug 2026 - Jul 2027)</span>
                </div>
              </div>

              <button
                type="button"
                className="canteen-btn-primary"
                onClick={handleSaveSubscription}
                disabled={myApp?.status !== 'Approved'}
              >
                <Check size={16} />
                <span>Confirm & Activate Yearly Subscription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SPECIAL DISHES & EXTRA CURRIES (Section 9.1) */}
      {/* ======================================================== */}
      {activeTab === 'special_dishes' && (
        <div className="student-content-pane space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Special Dishes & Extra Curries</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Order additional side dishes, curries, and desserts apart from your regular subscription. Charges are added to your canteen account.
              </p>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialDishes.map(dish => (
              <div key={dish.id} className="dish-card">
                <div className="dish-card-header">
                  <span className={`diet-pill ${dish.dietType === 'Vegetarian' ? 'veg' : 'non-veg'}`}>
                    <span className="diet-dot"></span>
                    <span>{dish.dietType}</span>
                  </span>
                  <span className="text-2xs text-slate-500 font-medium">
                    {dish.category}
                  </span>
                </div>

                <h3 className="dish-name">{dish.name}</h3>
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
                  {dish.isAvailable ? (
                    <button
                      type="button"
                      className="btn-order-dish"
                      onClick={() => {
                        setOrderModalDish(dish);
                        setOrderMealCategory(dish.mealAvailability[0] || 'Lunch');
                        setOrderQuantity(1);
                      }}
                    >
                      <Plus size={14} />
                      <span>Order Item</span>
                    </button>
                  ) : (
                    <span className="text-xs text-red-500 font-bold">Out of Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Special Dish Modal */}
          {orderModalDish && (
            <div className="canteen-modal-overlay" onClick={() => setOrderModalDish(null)}>
              <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div>
                    <h3 className="modal-title">Request Extra Side Dish / Curry</h3>
                    <p className="modal-sub">{orderModalDish.name} · ₹{orderModalDish.price} per portion</p>
                  </div>
                  <button className="modal-close-btn" onClick={() => setOrderModalDish(null)}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handlePlaceSpecialOrder}>
                  <div className="modal-body space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Serving Date:</label>
                        <input
                          type="date"
                          required
                          className="canteen-input"
                          value={orderServingDate}
                          onChange={(e) => setOrderServingDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Meal Category:</label>
                        <select
                          className="canteen-select"
                          value={orderMealCategory}
                          onChange={(e) => setOrderMealCategory(e.target.value)}
                        >
                          {orderModalDish.mealAvailability.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity (Portions):</label>
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4].map(q => (
                          <button
                            key={q}
                            type="button"
                            className={`px-4 py-2 rounded-lg border text-sm font-bold ${orderQuantity === q ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                            onClick={() => setOrderQuantity(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-amber-900">Total Additional Charge:</span>
                        <strong className="text-base font-black text-amber-900">₹{orderModalDish.price * orderQuantity}</strong>
                      </div>
                      <p className="text-2xs text-amber-700 mt-1">
                        * Note: This charge will be transparently billed to your student canteen account once confirmed.
                      </p>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="canteen-btn-secondary"
                      onClick={() => setOrderModalDish(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="canteen-btn-primary">
                      <Check size={14} />
                      <span>Confirm & Place Order</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SPECIAL DISH TRANSACTIONS (Section 9.3) */}
      {/* ======================================================== */}
      {activeTab === 'special_transactions' && (
        <div className="student-content-pane space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Special Dish Orders & Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete personal history of extra curries and special dish requests, serving statuses, and charges
              </p>
            </div>
          </div>

          {/* Spend Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase">Spent This Month</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹{spendTotals.thisMonthSpent}</h3>
              <span className="text-xs text-slate-400">October 2026 Term</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Spent This Semester</span>
              <h3 className="text-2xl font-black text-amber-600 mt-1">₹{spendTotals.totalSpent}</h3>
              <span className="text-xs text-slate-400">Autumn Semester 2026</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Special Orders Placed</span>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{spendTotals.count} Orders</h3>
              <span className="text-xs text-slate-400">Side Dishes & Curries</span>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="canteen-table-card">
            <div className="table-card-header">
              <h3 className="table-title">Special Dish Orders Register</h3>
              <span className="text-xs text-slate-400">Recorded only once per confirmed order</span>
            </div>

            <div className="overflow-x-auto">
              <table className="canteen-data-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Dish / Curry Item</th>
                    <th>Meal Category</th>
                    <th>Serving Date</th>
                    <th>Qty × Price</th>
                    <th>Total Charge</th>
                    <th>Order Status</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mySpecialTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-slate-400">
                        No special dish orders placed yet.
                      </td>
                    </tr>
                  ) : (
                    mySpecialTransactions.map(trx => (
                      <tr key={trx.id}>
                        <td className="font-mono text-xs font-semibold text-slate-700">{trx.id}</td>
                        <td>
                          <div className="font-bold text-slate-800">{trx.dishName}</div>
                          <div className="text-2xs text-slate-400">Ordered: {trx.orderDate}</div>
                        </td>
                        <td>
                          <span className={`meal-tag ${trx.mealCategory.toLowerCase()} text-xs`}>
                            {trx.mealCategory}
                          </span>
                        </td>
                        <td className="text-xs font-medium text-slate-700">{trx.scheduledServingDate}</td>
                        <td>
                          <span className="text-xs text-slate-600">{trx.quantity} × ₹{trx.pricePerItem}</span>
                        </td>
                        <td>
                          <strong className="text-slate-900 font-bold">₹{trx.totalAdditionalCharge}</strong>
                        </td>
                        <td>
                          <span className={`status-badge ${trx.orderStatus.toLowerCase()}`}>
                            {trx.orderStatus}
                          </span>
                          {trx.servedTimestamp && (
                            <div className="text-2xs text-emerald-600 mt-0.5">
                              Served {trx.servedTimestamp}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${trx.paymentStatus === 'Paid' ? 'active' : 'pending'}`}>
                            {trx.paymentStatus}
                          </span>
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
      {/* TAB 6: CANTEEN FEES & PAYMENTS (Section 9.2) */}
      {/* ======================================================== */}
      {activeTab === 'canteen_fees' && (
        <div className="student-content-pane space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Canteen Fee Account & Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent billing breakdown: Subscriptions + Special-Dish Charges − Payments = Outstanding Balance
              </p>
            </div>
            {myFeeAccount?.outstandingBalance > 0 && (
              <button
                type="button"
                className="canteen-btn-primary"
                onClick={() => {
                  setPaymentAmount(String(myFeeAccount.outstandingBalance));
                  setIsPayModalOpen(true);
                }}
              >
                <CreditCard size={15} />
                <span>Pay Outstanding Dues (₹{myFeeAccount.outstandingBalance})</span>
              </button>
            )}
          </div>

          {/* Formula Breakdown Card */}
          <div className="canteen-fee-formula-card">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Formula-Based Account Calculation</h3>

            <div className="formula-boxes-row">
              <div className="formula-box">
                <span className="box-label">Yearly Subscription Fees</span>
                <span className="box-val">₹{(myFeeAccount?.yearlySubscriptionFee || 0).toLocaleString('en-IN')}</span>
                <span className="box-sub">Full Academic Year</span>
              </div>

              <div className="formula-operator">+</div>

              <div className="formula-box">
                <span className="box-label">Special-Dish Charges</span>
                <span className="box-val amber">₹{(myFeeAccount?.specialDishCharges || 0).toLocaleString('en-IN')}</span>
                <span className="box-sub">Confirmed Extra Items</span>
              </div>

              <div className="formula-operator">=</div>

              <div className="formula-box highlight">
                <span className="box-label">Total Canteen Charges</span>
                <span className="box-val text-blue-700">₹{(myFeeAccount?.totalCanteenCharges || 0).toLocaleString('en-IN')}</span>
                <span className="box-sub">Gross Billed</span>
              </div>

              <div className="formula-operator">−</div>

              <div className="formula-box">
                <span className="box-label">Payments Made</span>
                <span className="box-val emerald">₹{(myFeeAccount?.paymentsMade || 0).toLocaleString('en-IN')}</span>
                <span className="box-sub">Reconciled Credits</span>
              </div>

              <div className="formula-operator">=</div>

              <div className={`formula-box ${myFeeAccount?.outstandingBalance > 0 ? 'alert' : 'cleared'}`}>
                <span className="box-label">Outstanding Balance</span>
                <span className="box-val red">₹{(myFeeAccount?.outstandingBalance || 0).toLocaleString('en-IN')}</span>
                <span className="box-sub">{myFeeAccount?.outstandingBalance > 0 ? 'Payable Amount' : 'Nil Balance'}</span>
              </div>
            </div>
          </div>

          {/* Payments History Table */}
          <div className="canteen-table-card">
            <div className="table-card-header">
              <h3 className="table-title">Payment Receipts History</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="canteen-data-table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Payment Date</th>
                    <th>Amount Paid</th>
                    <th>Payment Mode</th>
                    <th>Reference / Transaction ID</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {!myFeeAccount?.payments || myFeeAccount.payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-6 text-slate-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    myFeeAccount.payments.map(pay => (
                      <tr key={pay.id}>
                        <td className="font-mono text-xs font-bold text-slate-800">{pay.receiptNo}</td>
                        <td className="text-xs text-slate-600">{pay.paymentDate}</td>
                        <td>
                          <strong className="text-emerald-700 font-bold">₹{pay.amount.toLocaleString('en-IN')}</strong>
                        </td>
                        <td className="text-xs text-slate-700 font-medium">{pay.paymentMode}</td>
                        <td className="text-xs font-mono text-slate-500">{pay.referenceNo}</td>
                        <td className="text-xs text-slate-600">{pay.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pay Fee Modal */}
          {isPayModalOpen && (
            <div className="canteen-modal-overlay" onClick={() => setIsPayModalOpen(false)}>
              <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div>
                    <h3 className="modal-title">Pay Canteen Dues Online</h3>
                    <p className="modal-sub">Fast, secure UPI & Net Banking payment gateway</p>
                  </div>
                  <button className="modal-close-btn" onClick={() => setIsPayModalOpen(false)}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handlePayFee}>
                  <div className="modal-body space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Amount (₹):</label>
                      <input
                        type="number"
                        min="1"
                        max={myFeeAccount?.outstandingBalance || 50000}
                        required
                        className="canteen-input font-bold text-lg text-slate-900"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Select Payment Gateway:</label>
                      <select
                        className="canteen-select"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="UPI (GPay / PhonePe)">UPI (Google Pay / PhonePe / Paytm)</option>
                        <option value="Net Banking">Net Banking (SBI / HDFC / ICICI / Axis)</option>
                        <option value="Debit Card">Debit Card / ATM Card</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Billed Charges:</span>
                        <span>₹{myFeeAccount?.totalCanteenCharges.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Payments Recorded:</span>
                        <span>₹{myFeeAccount?.paymentsMade.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-red-600 pt-1 border-t border-slate-200">
                        <span>Balance Due:</span>
                        <span>₹{myFeeAccount?.outstandingBalance.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="canteen-btn-secondary"
                      onClick={() => setIsPayModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="canteen-btn-primary">
                      <Check size={14} />
                      <span>Proceed to Pay ₹{paymentAmount}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
