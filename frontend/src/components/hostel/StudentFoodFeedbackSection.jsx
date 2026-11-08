import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Star,
  Calendar,
  Clock,
  Coffee,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send,
  Filter,
  Search,
  Eye,
  Info,
  ChevronRight,
  X,
  AlertTriangle,
  RotateCcw,
  Paperclip,
  CheckCircle,
  XCircle,
  Bell,
  Pin,
  Users
} from 'lucide-react';
import {
  getDailyMessMenu,
  getWeeklyMessMenu,
  getStudentFoodFeedback,
  submitFoodFeedback,
  subscribeFoodFeedback
} from '../../services/hostelFoodStore.js';
import {
  getAllMessComplaints,
  getStudentMessComplaints,
  submitMessComplaint,
  reopenMessComplaint,
  subscribeMessComplaints,
  MESS_COMPLAINT_CATEGORIES,
} from '../../services/messComplaintStore.js';
import {
  getStudentMealSkipStatus,
  submitStudentMealSkip,
  cancelStudentMealSkip,
  subscribeMessAttendance,
} from '../../services/messAttendanceStore.js';
import {
  getMessNotices,
  markNoticeReadByStudent,
} from '../../services/messNoticeStore.js';
import { getActiveStudent } from '../../services/studentStore.js';
import './HostelExtraSections.css';

export default function StudentFoodFeedbackSection({ account }) {
  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('collegeflow_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const activeStudent = getActiveStudent();
  const effectiveUser = account || storedUser || activeStudent;

  const studentRoll = effectiveUser?.registrationNumber || effectiveUser?.rollNumber || effectiveUser?.identifier || activeStudent?.registrationNumber || activeStudent?.rollNumber || '2305201001';
  const studentName = effectiveUser?.name || activeStudent?.name || 'Aman Kumar Sharma';
  const studentHostel = effectiveUser?.hostelName || activeStudent?.hostelName || 'Sarojini Girls Residence (Block A)';

  const [activeMainTab, setActiveMainTab] = useState('menu'); // 'menu' | 'feedback' | 'complaints' | 'notices'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyMenu, setDailyMenu] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);

  // Menu & Rotational Schedule State (Step 8: Full Student Integration)
  const [menuViewMode, setMenuViewMode] = useState('daily'); // 'daily' | 'weekly'
  const [weeklyMenuData, setWeeklyMenuData] = useState(() => getWeeklyMessMenu());
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()] || 'Monday';
  });

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const handleQuickRateMeal = (mealType, mealDate) => {
    setFormMealDate(mealDate || selectedDate);
    setFormMealType(mealType === 'Evening Snacks' ? 'Evening Snacks' : mealType);
    setActiveMainTab('feedback');
    showToast(`Quick feedback activated for ${mealType} (${mealDate || selectedDate})`);
  };

  const handleQuickReportDefect = (mealType, mealDate) => {
    setComplaintForm(prev => ({
      ...prev,
      mealDate: mealDate || selectedDate,
      mealType: mealType,
    }));
    setActiveMainTab('complaints');
    showToast(`Grievance filing opened for ${mealType} (${mealDate || selectedDate})`);
  };

  // Complaints State (Step 4: Request Management Engine Integration)
  const [studentComplaints, setStudentComplaints] = useState([]);
  const [complaintForm, setComplaintForm] = useState({
    mealDate: new Date().toISOString().split('T')[0],
    mealType: 'Lunch',
    category: 'Poor Food Quality',
    title: '',
    description: '',
    attachmentUrl: '',
  });
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintDetailModal, setComplaintDetailModal] = useState(null);
  const [reopenModal, setReopenModal] = useState({ isOpen: false, complaint: null, reason: '' });
  const [complaintFilterStatus, setComplaintFilterStatus] = useState('ALL');
  const [complaintSearch, setComplaintSearch] = useState('');

  // Skip-Meal State (Step 5: Attendance & Skip-Meal Opt-Out)
  const [skipStatusData, setSkipStatusData] = useState(() => getStudentMealSkipStatus(studentRoll, selectedDate));
  const [skipModal, setSkipModal] = useState({ isOpen: false, mealType: '', reason: '' });

  const refreshSkipStatus = () => {
    setSkipStatusData(getStudentMealSkipStatus(studentRoll, selectedDate));
  };

  useEffect(() => {
    refreshSkipStatus();
    const unsub = subscribeMessAttendance(() => {
      refreshSkipStatus();
    });
    return unsub;
  }, [studentRoll, selectedDate]);

  // Mess Notices State (Step 6: Circulars & Operational Advisories)
  const [studentNotices, setStudentNotices] = useState(() =>
    getMessNotices({ targetHostel: studentHostel, activeOnly: true })
  );
  const [noticeFilterCategory, setNoticeFilterCategory] = useState('ALL');

  const refreshStudentNotices = () => {
    setStudentNotices(getMessNotices({ targetHostel: studentHostel, activeOnly: true }));
  };

  useEffect(() => {
    refreshStudentNotices();
    const handleNoticesUpdate = () => refreshStudentNotices();
    window.addEventListener('apna_campus_mess_notices_updated', handleNoticesUpdate);
    window.addEventListener('storage', handleNoticesUpdate);
    return () => {
      window.removeEventListener('apna_campus_mess_notices_updated', handleNoticesUpdate);
      window.removeEventListener('storage', handleNoticesUpdate);
    };
  }, [studentHostel]);

  const urgentNotice = useMemo(() => {
    return (
      studentNotices.find((n) => n.priority === 'URGENT') ||
      studentNotices.find((n) => n.priority === 'HIGH') ||
      null
    );
  }, [studentNotices]);

  const filteredStudentNotices = useMemo(() => {
    if (noticeFilterCategory === 'ALL') return studentNotices;
    return studentNotices.filter((n) => n.category === noticeFilterCategory);
  }, [studentNotices, noticeFilterCategory]);

  const handleToggleSkipMeal = (mealType) => {
    const mealStatus = skipStatusData?.statusPerMeal?.[mealType];
    if (mealStatus?.isDeadlinePassed) {
      alert(`The skip cutoff deadline for ${mealType} (${mealStatus.deadline}) has passed for ${selectedDate}.`);
      return;
    }

    if (mealStatus?.isSkipped) {
      try {
        cancelStudentMealSkip({ rollNumber: studentRoll, date: selectedDate, mealType });
        refreshSkipStatus();
        showToast(`✓ Meal skip cancelled for ${mealType}. You are marked as Attending!`);
      } catch (err) {
        alert(err.message);
      }
    } else {
      setSkipModal({ isOpen: true, mealType, reason: '' });
    }
  };

  const handleConfirmSkip = (e) => {
    e.preventDefault();
    try {
      const currentSkipped = skipStatusData?.record?.skippedMeals || [];
      const updatedSkipped = [...currentSkipped, skipModal.mealType];
      submitStudentMealSkip({
        studentId: effectiveUser?.id || activeStudent?.id || 'std-active',
        studentName,
        rollNumber: studentRoll,
        hostelName: studentHostel,
        roomNumber: effectiveUser?.roomNumber || '204',
        date: selectedDate,
        skippedMeals: updatedSkipped,
        reason: skipModal.reason,
      });
      setSkipModal({ isOpen: false, mealType: '', reason: '' });
      refreshSkipStatus();
      showToast(`✓ Skip opt-out logged for ${skipModal.mealType}! Kitchen headcount updated.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Form State
  const [formMealDate, setFormMealDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formMealType, setFormMealType] = useState('Lunch');
  const [formCategory, setFormCategory] = useState('Taste');
  const [formQuantity, setFormQuantity] = useState('Appropriate');
  const [qualityRating, setQualityRating] = useState(4);
  const [tasteRating, setTasteRating] = useState(4);
  const [temperatureRating, setTemperatureRating] = useState(5);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [overallRating, setOverallRating] = useState(4);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters for History
  const [filterMealType, setFilterMealType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRating, setFilterRating] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load daily menu whenever date changes
  useEffect(() => {
    let mounted = true;
    setIsLoadingMenu(true);
    getDailyMessMenu(selectedDate).then(data => {
      if (mounted) {
        setDailyMenu(data);
        setIsLoadingMenu(false);
      }
    });
    return () => { mounted = false; };
  }, [selectedDate]);

  // Synchronize live menu updates from Mess Manager
  useEffect(() => {
    const handleMenuLiveUpdate = () => {
      setIsLoadingMenu(true);
      getDailyMessMenu(selectedDate).then(data => {
        setDailyMenu(data);
        setIsLoadingMenu(false);
      });
      setWeeklyMenuData(getWeeklyMessMenu());
      showToast('✨ Mess menu has been updated with the latest kitchen schedule!');
    };
    window.addEventListener('apna_campus_weekly_menu_updated', handleMenuLiveUpdate);
    window.addEventListener('storage', handleMenuLiveUpdate);
    return () => {
      window.removeEventListener('apna_campus_weekly_menu_updated', handleMenuLiveUpdate);
      window.removeEventListener('storage', handleMenuLiveUpdate);
    };
  }, [selectedDate]);

  // Load feedback list
  const refreshFeedback = () => {
    getStudentFoodFeedback(studentRoll, { studentName }).then(list => {
      setFeedbackList(list);
    });
  };

  useEffect(() => {
    refreshFeedback();
    const unsub = subscribeFoodFeedback(() => {
      refreshFeedback();
    });
    return unsub;
  }, [studentRoll, studentName]);

  // Load and subscribe to student mess grievances (Step 4)
  const refreshComplaints = () => {
    getStudentMessComplaints(studentRoll).then((list) => {
      if (list && list.length > 0) {
        setStudentComplaints(list);
      } else {
        // Fallback to display seed complaints during demo so user can test tracking & reopening immediately
        getAllMessComplaints().then((all) => setStudentComplaints(all || []));
      }
    });
  };

  useEffect(() => {
    refreshComplaints();
    const unsub = subscribeMessComplaints(() => {
      refreshComplaints();
    });
    return unsub;
  }, [studentRoll]);

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    if (complaintForm.mealDate > todayStr) {
      alert('Complaints can only be filed for meals served today or in the past.');
      return;
    }
    if (!complaintForm.title.trim()) {
      alert('Please enter a brief complaint title.');
      return;
    }
    if (!complaintForm.description.trim()) {
      alert('Please explain the mess issue in detail.');
      return;
    }

    setIsSubmittingComplaint(true);
    try {
      const created = await submitMessComplaint({
        studentId: effectiveUser?.id || activeStudent?.id || 'std-active',
        studentName,
        rollNumber: studentRoll,
        studentPhone: effectiveUser?.phone || '+91 94370 11999',
        hostelName: studentHostel,
        roomNumber: effectiveUser?.roomNumber || '204',
        mealDate: complaintForm.mealDate,
        mealType: complaintForm.mealType,
        category: complaintForm.category,
        title: complaintForm.title,
        description: complaintForm.description,
        attachmentUrl: complaintForm.attachmentUrl || null,
      });

      setComplaintForm({
        mealDate: new Date().toISOString().split('T')[0],
        mealType: 'Lunch',
        category: 'Poor Food Quality',
        title: '',
        description: '',
        attachmentUrl: '',
      });

      refreshComplaints();
      showToast(`✓ Ticket #${created.trackingId} created! Mess Manager notified.`);
    } catch (err) {
      alert(err.message || 'Failed to submit mess complaint.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const handleReopenComplaint = async (e) => {
    e.preventDefault();
    if (!reopenModal.complaint || !reopenModal.reason.trim()) {
      alert('Please provide a specific reason explaining why the issue is not resolved.');
      return;
    }

    try {
      await reopenMessComplaint({
        id: reopenModal.complaint.id,
        reason: reopenModal.reason.trim(),
        studentName,
      });
      setReopenModal({ isOpen: false, complaint: null, reason: '' });
      if (complaintDetailModal?.id === reopenModal.complaint.id) {
        setComplaintDetailModal(null);
      }
      refreshComplaints();
      showToast(`✓ Ticket #${reopenModal.complaint.trackingId} reopened and escalated to Mess Manager!`);
    } catch (err) {
      alert(err.message || 'Failed to reopen complaint.');
    }
  };

  // Food items derived from menu for the selected form date and meal type
  const formFoodItems = useMemo(() => {
    if (!dailyMenu?.meals) return 'Standard Institutional Meal';
    const mealKey = formMealType === 'Evening Snacks' ? 'snacks' : formMealType.toLowerCase();
    return dailyMenu.meals[mealKey]?.items || 'Standard Institutional Meal';
  }, [dailyMenu, formMealType]);

  // Metric summaries
  const totalSubmitted = feedbackList.length;
  const pendingFeedback = feedbackList.filter(f => f.status === 'Pending' || f.status === 'Submitted' || f.status === 'Under Review' || (f.status !== 'Approved' && f.status !== 'Resolved')).length;
  const avgStudentRating = totalSubmitted > 0
    ? (feedbackList.reduce((acc, curr) => acc + curr.overallRating, 0) / totalSubmitted).toFixed(1)
    : '4.8';

  // Filtered History
  const filteredHistory = useMemo(() => {
    return feedbackList.filter(f => {
      if (filterMealType !== 'ALL' && f.mealType.toLowerCase() !== filterMealType.toLowerCase()) return false;
      if (filterStatus !== 'ALL') {
        const itemStatus = (f.status || '').toLowerCase();
        const selStatus = filterStatus.toLowerCase();
        if (selStatus === 'pending' && itemStatus !== 'pending' && itemStatus !== 'submitted') return false;
        if (selStatus === 'approved' && itemStatus !== 'approved' && itemStatus !== 'resolved') return false;
        if (selStatus !== 'pending' && selStatus !== 'approved' && itemStatus !== selStatus) return false;
      }
      if (filterRating !== 'ALL' && f.overallRating !== Number(filterRating)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          f.feedbackCode?.toLowerCase().includes(q) ||
          f.comments?.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q) ||
          f.foodItems?.toLowerCase().includes(q) ||
          f.status?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [feedbackList, filterMealType, filterStatus, filterRating, searchQuery]);

  // Filtered Mess Grievances (Step 4)
  const filteredComplaints = useMemo(() => {
    return studentComplaints.filter((c) => {
      if (complaintFilterStatus !== 'ALL' && (c.status || '').toLowerCase() !== complaintFilterStatus.toLowerCase()) {
        return false;
      }
      if (complaintSearch) {
        const q = complaintSearch.toLowerCase();
        return (
          (c.trackingId || '').toLowerCase().includes(q) ||
          (c.title || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q) ||
          (c.mealType || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [studentComplaints, complaintFilterStatus, complaintSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split('T')[0];
    if (formMealDate > todayStr) {
      alert('Feedback can only be submitted for meals that have already been served (today or earlier).');
      return;
    }

    const payload = {
      studentId: effectiveUser?.id || activeStudent?.id || 'std-active',
      studentName,
      rollNumber: studentRoll,
      hostelName: studentHostel,
      mealDate: formMealDate,
      mealType: formMealType,
      foodItems: formFoodItems,
      qualityRating,
      tasteRating,
      temperatureRating,
      hygieneRating,
      quantity: formQuantity,
      overallRating,
      category: formCategory,
      comments,
      status: 'Pending'
    };

    // 1. Immediately create optimistic record and display in history (<1ms)
    const optimisticRecord = {
      id: `ffb-opt-${Date.now()}`,
      feedbackCode: `FFB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFeedbackList(prev => [optimisticRecord, ...prev.filter(f => f.id !== optimisticRecord.id)]);

    // 2. Instantly reset inputs and show toast (<1ms)
    setComments('');
    setIsSubmitting(false);
    showToast(`✓ Food Feedback #${optimisticRecord.feedbackCode} submitted with Pending status.`);

    // 3. Persist locally and sync in background
    submitFoodFeedback(payload)
      .then((created) => {
        setFeedbackList(prev => prev.map(f => f.id === optimisticRecord.id ? created : f));
        refreshFeedback();
      })
      .catch((err) => {
        setFeedbackList(prev => prev.filter(f => f.id !== optimisticRecord.id));
        alert(err.message || 'Failed to submit feedback.');
      });
  };

  const renderStarSelector = (val, setVal, label) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: star <= val ? '#f59e0b' : '#cbd5e1',
              transition: 'transform 0.15s ease'
            }}
          >
            <Star size={18} fill={star <= val ? '#f59e0b' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hostel-section-container" style={{ gap: '1.25rem' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Utensils size={24} color="#2563eb" /> Food Feedback &amp; Mess Review Portal</h2>
          <p>Inspect Daily Mess Nutrition · Submit Meal Ratings · Track Warden Responses</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue">
            <Utensils size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{dailyMenu?.day || 'Today'}</span>
            <span className="hostel-kpi-title">Today's Mess Menu</span>
            <span className="hostel-kpi-subtitle">4 Scheduled Meals</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{totalSubmitted}</span>
            <span className="hostel-kpi-title">Feedback Submitted</span>
            <span className="hostel-kpi-subtitle">By You This Semester</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber">
            <AlertTriangle size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{studentComplaints.length}</span>
            <span className="hostel-kpi-title">Mess Grievances</span>
            <span className="hostel-kpi-subtitle">
              {studentComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress' || c.status === 'Reopened').length} Active / Tracking
            </span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple">
            <Star size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{avgStudentRating} / 5</span>
            <span className="hostel-kpi-title">Average Food Rating</span>
            <span className="hostel-kpi-subtitle">Based on Your History</span>
          </div>
        </div>
      </div>

      {/* Main Tab Pills */}
      <div className="hostel-tab-pills">
        <button
          type="button"
          className={`hostel-tab-pill ${activeMainTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('menu')}
        >
          <Calendar size={15} /> Today's Food Menu
        </button>
        <button
          type="button"
          className={`hostel-tab-pill ${activeMainTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('feedback')}
        >
          <MessageSquare size={15} /> Submit Feedback &amp; History ({feedbackList.length})
        </button>
        <button
          type="button"
          className={`hostel-tab-pill ${activeMainTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('complaints')}
        >
          <AlertTriangle size={15} /> Food Complaints &amp; Grievances ({studentComplaints.length})
        </button>
        <button
          type="button"
          className={`hostel-tab-pill ${activeMainTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('notices')}
        >
          <Bell size={15} /> Mess Notices &amp; Circulars ({studentNotices.length})
        </button>
      </div>

      {/* TAB 1: DAILY FOOD MENU */}
      {activeMainTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Urgent Mess Advisory Banner (if active) */}
          {urgentNotice && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={18} color="#dc2626" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                    <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {urgentNotice.priority}
                    </span>
                    <strong style={{ color: '#991b1b', fontSize: '0.92rem' }}>{urgentNotice.title}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#b91c1c', lineHeight: 1.4 }}>
                    {urgentNotice.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="hostel-action-btn primary"
                style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem', whiteSpace: 'nowrap' }}
                onClick={() => setActiveMainTab('notices')}
              >
                View Circulars &rarr;
              </button>
            </div>
          )}

          {/* Date Selector & Mode Strip */}
          <div style={{
            background: '#ffffff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {menuViewMode === 'weekly' ? 'Weekly Rotational Schedule' : `${dailyMenu?.day || ''} Dining Menu (${dailyMenu?.date || selectedDate})`}
                  {selectedDate === todayIso && menuViewMode === 'daily' && (
                    <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                      Today
                    </span>
                  )}
                  {selectedDate === tomorrowIso && menuViewMode === 'daily' && (
                    <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                      Tomorrow
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Central Mess Dining Hall &bull; {studentHostel}
                </div>
              </div>
            </div>

            {/* Quick Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(todayIso);
                  setMenuViewMode('daily');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: '1px solid',
                  background: selectedDate === todayIso && menuViewMode === 'daily' ? '#2563eb' : '#f8fafc',
                  color: selectedDate === todayIso && menuViewMode === 'daily' ? '#ffffff' : '#334155',
                  borderColor: selectedDate === todayIso && menuViewMode === 'daily' ? '#2563eb' : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sun size={13} /> Today's Menu
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDate(tomorrowIso);
                  setMenuViewMode('daily');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: '1px solid',
                  background: selectedDate === tomorrowIso && menuViewMode === 'daily' ? '#059669' : '#f8fafc',
                  color: selectedDate === tomorrowIso && menuViewMode === 'daily' ? '#ffffff' : '#334155',
                  borderColor: selectedDate === tomorrowIso && menuViewMode === 'daily' ? '#059669' : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Clock size={13} /> Tomorrow's Menu
              </button>

              <button
                type="button"
                onClick={() => setMenuViewMode(menuViewMode === 'weekly' ? 'daily' : 'weekly')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: '1px solid',
                  background: menuViewMode === 'weekly' ? '#7c3aed' : '#f8fafc',
                  color: menuViewMode === 'weekly' ? '#ffffff' : '#334155',
                  borderColor: menuViewMode === 'weekly' ? '#7c3aed' : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Calendar size={13} /> {menuViewMode === 'weekly' ? '← Daily View' : '7-Day Weekly Schedule'}
              </button>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginLeft: '0.25rem' }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setMenuViewMode('daily');
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#1e293b'
                  }}
                />
              </div>
            </div>
          </div>

          {/* VIEW MODE: 7-DAY ROTATIONAL WEEKLY MENU */}
          {menuViewMode === 'weekly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                      <Calendar size={18} color="#7c3aed" /> 7-Day Rotational Weekly Mess Menu
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Published institutional rotational meal schedule &bull; Central Mess Authority
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuViewMode('daily')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#1e293b',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    &larr; Switch to Daily View
                  </button>
                </div>

                {/* Day Selector Pills */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const isSelected = selectedWeeklyDay === day;
                    const dayMenu = weeklyMenuData?.[day] || {};
                    const hasSpecial = Object.values(dayMenu).some(m => m?.isSpecial);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedWeeklyDay(day)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: '1px solid',
                          cursor: 'pointer',
                          background: isSelected ? '#7c3aed' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          borderColor: isSelected ? '#7c3aed' : '#cbd5e1',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {day}
                        {hasSpecial && (
                          <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px' }}>
                            ★ Feast
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Selected 4 Meals Grid */}
              {(() => {
                const activeDayData = weeklyMenuData?.[selectedWeeklyDay] || {};
                const meals = [
                  { key: 'breakfast', title: 'Breakfast', icon: Coffee, color: '#f59e0b', data: activeDayData.breakfast || {} },
                  { key: 'lunch', title: 'Lunch', icon: Sun, color: '#059669', data: activeDayData.lunch || {} },
                  { key: 'snacks', title: 'Evening Snacks', icon: Sunset, color: '#6366f1', data: activeDayData.snacks || {} },
                  { key: 'dinner', title: 'Dinner', icon: Moon, color: '#7c3aed', data: activeDayData.dinner || {} },
                ];

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    {meals.map(({ key, title, icon: Icon, color, data }) => (
                      <div
                        key={key}
                        className="hostel-item-card"
                        style={{ borderTop: `4px solid ${color}`, background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.96rem', color }}>
                            <Icon size={17} /> {title}
                          </div>
                          <span className="h-badge" style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569' }}>
                            {data.time || 'Standard Hours'}
                          </span>
                        </div>

                        {data.isSpecial && (
                          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={13} color="#d97706" /> Special Festive Feast: {data.specialOccasion || 'Celebration Feast'}
                          </div>
                        )}

                        {data.isAvailable === false && (
                          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={13} color="#dc2626" /> Unavailable: {data.unavailabilityReason || 'Operational maintenance'}
                          </div>
                        )}

                        <div style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                          {data.items || 'Standard institutional menu schedule'}
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <span>Calories: <strong>{data.calories || 'Balanced'}</strong></span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>Institutional Recipe</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW MODE: DAILY LIVE MEAL PLAN */}
          {menuViewMode === 'daily' && (
            <>
              {/* Skip-Meal Advisory Banner (Step 5) */}
              <div style={{
                background: (skipStatusData?.record?.skippedMeals?.length || 0) > 0 ? '#fff1f2' : '#f0fdf4',
                border: (skipStatusData?.record?.skippedMeals?.length || 0) > 0 ? '1px solid #fecdd3' : '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color={(skipStatusData?.record?.skippedMeals?.length || 0) > 0 ? '#e11d48' : '#16a34a'} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: (skipStatusData?.record?.skippedMeals?.length || 0) > 0 ? '#9f1239' : '#166534' }}>
                      Dining Attendance &amp; Meal Skip System (Fretbox PS07)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {(skipStatusData?.record?.skippedMeals?.length || 0) > 0 ? (
                        <span>You are registered to skip: <strong>{skipStatusData.record.skippedMeals.join(', ')}</strong> on {selectedDate}. Kitchen headcount adjusted.</span>
                      ) : (
                        <span>You are currently marked as attending all scheduled meals on {selectedDate}. To skip a meal, click the button on any meal card before its cutoff.</span>
                      )}
                    </div>
                  </div>
                </div>
                {(skipStatusData?.record?.skippedMeals?.length || 0) > 0 && (
                  <span style={{ fontSize: '0.72rem', background: '#ffe4e6', color: '#be123c', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {skipStatusData.record.skippedMeals.length} Skip(s) Active
                  </span>
                )}
              </div>

              {/* 4 Meal Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' }}>
                {/* Breakfast */}
                <div className="hostel-item-card" style={{ borderTop: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#b45309' }}>
                      <Coffee size={18} /> Breakfast
                    </div>
                    <span className="h-badge h-badge-medium">{dailyMenu?.meals?.breakfast?.time || '07:30 - 09:30 AM'}</span>
                  </div>

                  {dailyMenu?.meals?.breakfast?.isSpecial && (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <Sparkles size={13} color="#d97706" /> Special Festive Feast: {dailyMenu?.meals?.breakfast?.specialOccasion || 'Celebration'}
                    </div>
                  )}

                  {dailyMenu?.meals?.breakfast?.isAvailable === false && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <AlertTriangle size={13} color="#dc2626" /> Unavailable: {dailyMenu?.meals?.breakfast?.unavailabilityReason || 'Operational maintenance'}
                    </div>
                  )}

                  <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                    {dailyMenu?.meals?.breakfast?.items}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Caloric value: <strong>{dailyMenu?.meals?.breakfast?.calories || '520 kcal'}</strong></span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Nutritionally Balanced</span>
                  </div>

                  {/* Skip Action Strip */}
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                        Cutoff: <strong>{skipStatusData?.statusPerMeal?.Breakfast?.deadline || '06:30'}</strong>
                      </span>
                      {skipStatusData?.statusPerMeal?.Breakfast?.isDeadlinePassed ? (
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>Cutoff Elapsed</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Active</span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={skipStatusData?.statusPerMeal?.Breakfast?.isDeadlinePassed}
                      onClick={() => handleToggleSkipMeal('Breakfast')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: skipStatusData?.statusPerMeal?.Breakfast?.isSkipped ? '1px solid #10b981' : '1px solid #cbd5e1',
                        background: skipStatusData?.statusPerMeal?.Breakfast?.isSkipped ? '#f0fdf4' : '#ffffff',
                        color: skipStatusData?.statusPerMeal?.Breakfast?.isSkipped ? '#059669' : (skipStatusData?.statusPerMeal?.Breakfast?.isDeadlinePassed ? '#94a3b8' : '#334155'),
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: skipStatusData?.statusPerMeal?.Breakfast?.isDeadlinePassed ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: skipStatusData?.statusPerMeal?.Breakfast?.isDeadlinePassed ? 0.6 : 1,
                      }}
                    >
                      {skipStatusData?.statusPerMeal?.Breakfast?.isSkipped ? (
                        <>
                          <CheckCircle size={12} color="#059669" /> Opted Out (Cancel)
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Skip Breakfast
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Action Strip (Rate / Report Defect) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickRateMeal('Breakfast', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Star size={11} color="#2563eb" /> Rate Meal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickReportDefect('Breakfast', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fed7aa',
                        background: '#fff7ed',
                        color: '#c2410c',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={11} color="#ea580c" /> Report Issue
                    </button>
                  </div>
                </div>

                {/* Lunch */}
                <div className="hostel-item-card" style={{ borderTop: '4px solid #059669' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#047857' }}>
                      <Sun size={18} /> Lunch
                    </div>
                    <span className="h-badge h-badge-approved">{dailyMenu?.meals?.lunch?.time || '12:30 - 02:30 PM'}</span>
                  </div>

                  {dailyMenu?.meals?.lunch?.isSpecial && (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <Sparkles size={13} color="#d97706" /> Special Festive Feast: {dailyMenu?.meals?.lunch?.specialOccasion || 'Celebration'}
                    </div>
                  )}

                  {dailyMenu?.meals?.lunch?.isAvailable === false && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <AlertTriangle size={13} color="#dc2626" /> Unavailable: {dailyMenu?.meals?.lunch?.unavailabilityReason || 'Operational maintenance'}
                    </div>
                  )}

                  <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                    {dailyMenu?.meals?.lunch?.items}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Caloric value: <strong>{dailyMenu?.meals?.lunch?.calories || '820 kcal'}</strong></span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>High Protein</span>
                  </div>

                  {/* Skip Action Strip */}
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                        Cutoff: <strong>{skipStatusData?.statusPerMeal?.Lunch?.deadline || '10:30'}</strong>
                      </span>
                      {skipStatusData?.statusPerMeal?.Lunch?.isDeadlinePassed ? (
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>Cutoff Elapsed</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Active</span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={skipStatusData?.statusPerMeal?.Lunch?.isDeadlinePassed}
                      onClick={() => handleToggleSkipMeal('Lunch')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: skipStatusData?.statusPerMeal?.Lunch?.isSkipped ? '1px solid #10b981' : '1px solid #cbd5e1',
                        background: skipStatusData?.statusPerMeal?.Lunch?.isSkipped ? '#f0fdf4' : '#ffffff',
                        color: skipStatusData?.statusPerMeal?.Lunch?.isSkipped ? '#059669' : (skipStatusData?.statusPerMeal?.Lunch?.isDeadlinePassed ? '#94a3b8' : '#334155'),
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: skipStatusData?.statusPerMeal?.Lunch?.isDeadlinePassed ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: skipStatusData?.statusPerMeal?.Lunch?.isDeadlinePassed ? 0.6 : 1,
                      }}
                    >
                      {skipStatusData?.statusPerMeal?.Lunch?.isSkipped ? (
                        <>
                          <CheckCircle size={12} color="#059669" /> Opted Out (Cancel)
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Skip Lunch
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Action Strip (Rate / Report Defect) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickRateMeal('Lunch', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Star size={11} color="#2563eb" /> Rate Meal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickReportDefect('Lunch', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fed7aa',
                        background: '#fff7ed',
                        color: '#c2410c',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={11} color="#ea580c" /> Report Issue
                    </button>
                  </div>
                </div>

                {/* Snacks */}
                <div className="hostel-item-card" style={{ borderTop: '4px solid #6366f1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#4338ca' }}>
                      <Sunset size={18} /> Evening Snacks
                    </div>
                    <span className="h-badge h-badge-low">{dailyMenu?.meals?.snacks?.time || '05:00 - 06:15 PM'}</span>
                  </div>

                  {dailyMenu?.meals?.snacks?.isSpecial && (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <Sparkles size={13} color="#d97706" /> Special Festive Feast: {dailyMenu?.meals?.snacks?.specialOccasion || 'Celebration'}
                    </div>
                  )}

                  {dailyMenu?.meals?.snacks?.isAvailable === false && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <AlertTriangle size={13} color="#dc2626" /> Unavailable: {dailyMenu?.meals?.snacks?.unavailabilityReason || 'Operational maintenance'}
                    </div>
                  )}

                  <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                    {dailyMenu?.meals?.snacks?.items}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Caloric value: <strong>{dailyMenu?.meals?.snacks?.calories || '340 kcal'}</strong></span>
                    <span style={{ color: '#4338ca', fontWeight: 700 }}>Hot Beverages</span>
                  </div>

                  {/* Skip Action Strip */}
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                        Cutoff: <strong>{skipStatusData?.statusPerMeal?.['Evening Snacks']?.deadline || '15:30'}</strong>
                      </span>
                      {skipStatusData?.statusPerMeal?.['Evening Snacks']?.isDeadlinePassed ? (
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>Cutoff Elapsed</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Active</span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={skipStatusData?.statusPerMeal?.['Evening Snacks']?.isDeadlinePassed}
                      onClick={() => handleToggleSkipMeal('Evening Snacks')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: skipStatusData?.statusPerMeal?.['Evening Snacks']?.isSkipped ? '1px solid #10b981' : '1px solid #cbd5e1',
                        background: skipStatusData?.statusPerMeal?.['Evening Snacks']?.isSkipped ? '#f0fdf4' : '#ffffff',
                        color: skipStatusData?.statusPerMeal?.['Evening Snacks']?.isSkipped ? '#059669' : (skipStatusData?.statusPerMeal?.['Evening Snacks']?.isDeadlinePassed ? '#94a3b8' : '#334155'),
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: skipStatusData?.statusPerMeal?.['Evening Snacks']?.isDeadlinePassed ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: skipStatusData?.statusPerMeal?.['Evening Snacks']?.isDeadlinePassed ? 0.6 : 1,
                      }}
                    >
                      {skipStatusData?.statusPerMeal?.['Evening Snacks']?.isSkipped ? (
                        <>
                          <CheckCircle size={12} color="#059669" /> Opted Out (Cancel)
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Skip Snacks
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Action Strip (Rate / Report Defect) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickRateMeal('Evening Snacks', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Star size={11} color="#2563eb" /> Rate Meal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickReportDefect('Evening Snacks', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fed7aa',
                        background: '#fff7ed',
                        color: '#c2410c',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={11} color="#ea580c" /> Report Issue
                    </button>
                  </div>
                </div>

                {/* Dinner */}
                <div className="hostel-item-card" style={{ borderTop: '4px solid #7c3aed' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#6d28d9' }}>
                      <Moon size={18} /> Dinner
                    </div>
                    <span className="h-badge h-badge-leave">{dailyMenu?.meals?.dinner?.time || '08:00 - 10:00 PM'}</span>
                  </div>

                  {dailyMenu?.meals?.dinner?.isSpecial && (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <Sparkles size={13} color="#d97706" /> Special Festive Feast: {dailyMenu?.meals?.dinner?.specialOccasion || 'Celebration'}
                    </div>
                  )}

                  {dailyMenu?.meals?.dinner?.isAvailable === false && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: '0.4rem 0' }}>
                      <AlertTriangle size={13} color="#dc2626" /> Unavailable: {dailyMenu?.meals?.dinner?.unavailabilityReason || 'Operational maintenance'}
                    </div>
                  )}

                  <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                    {dailyMenu?.meals?.dinner?.items}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Caloric value: <strong>{dailyMenu?.meals?.dinner?.calories || '750 kcal'}</strong></span>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>Dessert Included</span>
                  </div>

                  {/* Skip Action Strip */}
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                        Cutoff: <strong>{skipStatusData?.statusPerMeal?.Dinner?.deadline || '18:30'}</strong>
                      </span>
                      {skipStatusData?.statusPerMeal?.Dinner?.isDeadlinePassed ? (
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>Cutoff Elapsed</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Active</span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={skipStatusData?.statusPerMeal?.Dinner?.isDeadlinePassed}
                      onClick={() => handleToggleSkipMeal('Dinner')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: skipStatusData?.statusPerMeal?.Dinner?.isSkipped ? '1px solid #10b981' : '1px solid #cbd5e1',
                        background: skipStatusData?.statusPerMeal?.Dinner?.isSkipped ? '#f0fdf4' : '#ffffff',
                        color: skipStatusData?.statusPerMeal?.Dinner?.isSkipped ? '#059669' : (skipStatusData?.statusPerMeal?.Dinner?.isDeadlinePassed ? '#94a3b8' : '#334155'),
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: skipStatusData?.statusPerMeal?.Dinner?.isDeadlinePassed ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: skipStatusData?.statusPerMeal?.Dinner?.isDeadlinePassed ? 0.6 : 1,
                      }}
                    >
                      {skipStatusData?.statusPerMeal?.Dinner?.isSkipped ? (
                        <>
                          <CheckCircle size={12} color="#059669" /> Opted Out (Cancel)
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Skip Dinner
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Action Strip (Rate / Report Defect) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickRateMeal('Dinner', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Star size={11} color="#2563eb" /> Rate Meal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickReportDefect('Dinner', dailyMenu?.date)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fed7aa',
                        background: '#fff7ed',
                        color: '#c2410c',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={11} color="#ea580c" /> Report Issue
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: SUBMIT FEEDBACK & HISTORY */}
      {activeMainTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Submit Feedback Form Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Lodge Meal Quality Feedback &amp; Suggestions
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Meal Date *
                  </label>
                  <input
                    type="date"
                    value={formMealDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setFormMealDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Meal Type *
                  </label>
                  <select
                    value={formMealType}
                    onChange={e => setFormMealType(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Breakfast">Breakfast (07:30 - 09:30 AM)</option>
                    <option value="Lunch">Lunch (12:30 - 02:30 PM)</option>
                    <option value="Evening Snacks">Evening Snacks (05:00 - 06:15 PM)</option>
                    <option value="Dinner">Dinner (08:00 - 10:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Feedback Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Taste">Taste</option>
                    <option value="Food Quality">Food Quality</option>
                    <option value="Hygiene">Hygiene &amp; Cleanliness</option>
                    <option value="Quantity">Quantity / Serving Size</option>
                    <option value="Menu Variety">Menu Variety</option>
                    <option value="Food Temperature">Food Temperature</option>
                    <option value="Other">Other Issues</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Food Quantity *
                  </label>
                  <select
                    value={formQuantity}
                    onChange={e => setFormQuantity(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Too Little">Too Little</option>
                    <option value="Appropriate">Appropriate (Sufficient)</option>
                    <option value="Too Much">Too Much</option>
                  </select>
                </div>
              </div>

              {/* Multi-Criteria Star Ratings Strip */}
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem'
              }}>
                {renderStarSelector(qualityRating, setQualityRating, 'Quality Rating')}
                {renderStarSelector(tasteRating, setTasteRating, 'Taste Rating')}
                {renderStarSelector(temperatureRating, setTemperatureRating, 'Temperature')}
                {renderStarSelector(hygieneRating, setHygieneRating, 'Hygiene Rating')}
                {renderStarSelector(overallRating, setOverallRating, 'Overall Satisfaction')}
              </div>

              {/* Written Feedback / Comments */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Written Feedback or Suggestions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="e.g. Rice was well-cooked, but dal lacked salt. Drinking water counter near door needed refill."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  <Send size={15} /> {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback History Header & Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                My Submitted Food Feedback History ({filteredHistory.length})
              </h3>
            </div>

            {/* Filter Bar */}
            <div className="hostel-filter-strip">
              <div className="hostel-search-input" style={{ flex: 1, minWidth: '200px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search feedback code, items, or comments..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="hostel-filter-group">
                <select
                  className="hostel-select"
                  value={filterMealType}
                  onChange={e => setFilterMealType(e.target.value)}
                >
                  <option value="ALL">All Meals</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snacks">Evening Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>

                <select
                  className="hostel-select"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  className="hostel-select"
                  value={filterRating}
                  onChange={e => setFilterRating(e.target.value)}
                >
                  <option value="ALL">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>

            {/* Feedback Table */}
            <div className="hostel-table-container">
              <div className="hostel-table-scroll">
                <table className="hostel-data-table">
                  <thead>
                    <tr>
                      <th>Feedback Code</th>
                      <th>Meal &amp; Date</th>
                      <th>Category</th>
                      <th>Rating</th>
                      <th>Summary Comments</th>
                      <th>Status</th>
                      <th>Warden Response</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                          <Info size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                          No food feedback records match the chosen filters.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800, color: '#2563eb' }}>
                            {item.feedbackCode}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.mealType}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.mealDate}</div>
                          </td>
                          <td>
                            <span className="h-badge h-badge-medium">{item.category}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800, color: '#b45309' }}>
                              <Star size={14} fill="#f59e0b" color="#f59e0b" /> {item.overallRating}/5
                            </div>
                          </td>
                          <td style={{ maxWidth: '240px', fontSize: '0.82rem', color: '#334155' }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.comments || 'No written text'}
                            </div>
                          </td>
                          <td>
                            <span className={`h-badge ${
                              item.status === 'Approved' || item.status === 'Resolved' ? 'h-badge-approved' :
                              item.status === 'Pending' || item.status === 'Submitted' ? 'h-badge-leave' :
                              item.status === 'Under Review' ? 'h-badge-medium' : 'h-badge-low'
                            }`} style={
                              item.status === 'Pending' || item.status === 'Submitted' ? {
                                background: '#fffbeb',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 700
                              } : item.status === 'Approved' || item.status === 'Resolved' ? {
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: 700
                              } : undefined
                            }>
                              {(item.status === 'Pending' || item.status === 'Submitted') && <Clock size={12} />}
                              {(item.status === 'Approved' || item.status === 'Resolved') && <CheckCircle2 size={12} />}
                              {item.status === 'Submitted' ? 'Pending' : (item.status === 'Resolved' ? 'Approved' : item.status)}
                            </span>
                          </td>
                          <td style={{ maxWidth: '240px', fontSize: '0.8rem' }}>
                            {item.response || item.status === 'Approved' || item.status === 'Resolved' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={13} color="#059669" /> Approved by {item.respondedBy || 'Hostel Administration'}
                                </span>
                                {item.response && (
                                  <span style={{ fontSize: '0.76rem', color: '#334155', fontStyle: 'italic', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    "{item.response}"
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#d97706', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Pending Warden Review
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => setSelectedDetailModal(item)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#1e293b',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FOOD COMPLAINTS & GRIEVANCE TRACKING (STEP 4)
          ========================================================================= */}
      {activeMainTab === 'complaints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Lodge Complaint Form Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fed7aa',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ background: '#ffedd5', padding: '6px', borderRadius: '8px', color: '#c2410c' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Report Food Quality Defect or Mess Grievance
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  Directly dispatched to Chief Mess Manager via Institutional Request Management Engine
                </p>
              </div>
            </div>

            <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Meal Incident Date *
                  </label>
                  <input
                    type="date"
                    value={complaintForm.mealDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setComplaintForm({ ...complaintForm, mealDate: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Meal Session *
                  </label>
                  <select
                    value={complaintForm.mealType}
                    onChange={(e) => setComplaintForm({ ...complaintForm, mealType: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Breakfast">Breakfast (07:30 - 09:30 AM)</option>
                    <option value="Lunch">Lunch (12:30 - 02:30 PM)</option>
                    <option value="Evening Snacks">Evening Snacks (05:00 - 06:15 PM)</option>
                    <option value="Dinner">Dinner (08:00 - 10:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Grievance Category *
                  </label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    {MESS_COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Issue Summary / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tough paneer cubes and excessive salt in lunch curry"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Detailed Description of Mess Issue *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe specifically what occurred: e.g. Dining hall batch served at 1:15 PM had sour-tasting curd and chapatis were cold..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Photo / Evidence URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://... photo link of meal defect or hygiene violation"
                  value={complaintForm.attachmentUrl}
                  onChange={(e) => setComplaintForm({ ...complaintForm, attachmentUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
                {complaintForm.attachmentUrl && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={complaintForm.attachmentUrl}
                      alt="defect preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                      style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>Preview loaded</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isSubmittingComplaint}
                  style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 22px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: isSubmittingComplaint ? 0.7 : 1
                  }}
                >
                  <Send size={15} /> {isSubmittingComplaint ? 'Dispatching...' : 'Lodge Grievance Ticket'}
                </button>
              </div>
            </form>
          </div>

          {/* Grievance Tracking List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Mess Grievance History &amp; Resolution Tracking ({filteredComplaints.length})
              </h3>
            </div>

            {/* Filter Bar */}
            <div className="hostel-filter-strip">
              <div className="hostel-search-input" style={{ flex: 1, minWidth: '220px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search tracking ID, title, description, or category..."
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                />
              </div>

              <div className="hostel-filter-group">
                <select
                  className="hostel-select"
                  value={complaintFilterStatus}
                  onChange={(e) => setComplaintFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Reopened">Reopened</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="hostel-table-container">
              <div className="hostel-table-scroll">
                <table className="hostel-data-table">
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Meal Session</th>
                      <th>Category</th>
                      <th>Issue Title</th>
                      <th>Attachment</th>
                      <th>Status</th>
                      <th>Kitchen Resolution</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                          <Info size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                          No mess grievance records match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 800, color: '#c2410c' }}>
                            {item.trackingId}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.mealType}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.mealDate}</div>
                          </td>
                          <td>
                            <span className="h-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ maxWidth: '220px' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.description}
                            </div>
                          </td>
                          <td>
                            {item.attachmentUrl ? (
                              <a
                                href={item.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}
                              >
                                <Paperclip size={13} /> Photo
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None</span>
                            )}
                          </td>
                          <td>
                            <span className={`h-badge ${
                              item.status === 'Resolved' ? 'h-badge-approved' :
                              item.status === 'In Progress' ? 'h-badge-medium' :
                              item.status === 'Reopened' ? 'h-badge-low' : 'h-badge-leave'
                            }`} style={
                              item.status === 'Resolved' ? { background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' } :
                              item.status === 'In Progress' ? { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' } :
                              item.status === 'Reopened' ? { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' } :
                              { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }
                            }>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ maxWidth: '240px', fontSize: '0.8rem' }}>
                            {item.status === 'Resolved' && item.resolutionNote ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle size={13} color="#059669" /> Corrective Action Taken
                                </span>
                                <span style={{ fontSize: '0.76rem', color: '#334155', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  "{item.resolutionNote}"
                                </span>
                              </div>
                            ) : item.status === 'In Progress' ? (
                              <span style={{ color: '#1d4ed8', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Kitchen audit under inspection
                              </span>
                            ) : item.status === 'Reopened' ? (
                              <span style={{ color: '#b91c1c', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <RotateCcw size={12} /> Reopened for escalation
                              </span>
                            ) : (
                              <span style={{ color: '#d97706', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Pending Manager Review
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setComplaintDetailModal(item)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#f8fafc',
                                  color: '#1e293b',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Eye size={12} /> Dossier
                              </button>
                              {item.status === 'Resolved' && (
                                <button
                                  type="button"
                                  onClick={() => setReopenModal({ isOpen: true, complaint: item, reason: '' })}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #fecaca',
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    fontWeight: 700,
                                    fontSize: '0.76rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <RotateCcw size={12} /> Reopen
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
        </div>
      )}

      {/* =========================================================================
          TAB 4: MESS NOTICES & OPERATIONAL CIRCULARS (STEP 6)
          ========================================================================= */}
      {activeMainTab === 'notices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header & Category Filter */}
          <div style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={20} color="#2563eb" />
                  Mess Notices, Menus &amp; Dietary Circulars
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Official announcements from Chief Mess Manager regarding dining hours, festive feasts, and water sanitation.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 600 }}>
                {studentNotices.length} Active Circulars
              </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              {['ALL', 'Dining Timing Change', 'Special Festival Menu', 'Mess Closure / Maintenance', 'Special Food Arrangement', 'Dietary & Hygiene Advisory'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNoticeFilterCategory(cat)}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: noticeFilterCategory === cat ? '#2563eb' : '#ffffff',
                    color: noticeFilterCategory === cat ? '#ffffff' : '#475569',
                    borderColor: noticeFilterCategory === cat ? '#2563eb' : '#cbd5e1',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat === 'ALL' ? 'All Notices' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notices Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredStudentNotices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <Bell size={36} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No notices found under "{noticeFilterCategory}".</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Check back later or select "All Notices".</p>
              </div>
            ) : (
              filteredStudentNotices.map((n) => {
                const isRead = Array.isArray(n.readBy) && n.readBy.includes(studentRoll);
                const isUrgent = n.priority === 'URGENT';
                const isHigh = n.priority === 'HIGH';

                return (
                  <div
                    key={n.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderLeft: isUrgent ? '4px solid #dc2626' : (n.isPinned ? '4px solid #2563eb' : '1px solid #e2e8f0'),
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {n.isPinned && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                            <Pin size={11} /> Pinned
                          </span>
                        )}
                        <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.74rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                          {n.category}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          background: isUrgent ? '#fee2e2' : (isHigh ? '#fef3c7' : '#f1f5f9'),
                          color: isUrgent ? '#dc2626' : (isHigh ? '#d97706' : '#475569')
                        }}>
                          {n.priority || 'NORMAL'}
                        </span>
                      </div>

                      {/* Read / Acknowledged status */}
                      <div>
                        {isRead ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.76rem', fontWeight: 600, background: '#ecfdf5', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                            <CheckCircle2 size={13} /> Acknowledged
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              markNoticeReadByStudent(n.id, studentRoll);
                              refreshStudentNotices();
                              showToast('✓ Notice marked as acknowledged!');
                            }}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Eye size={12} /> Mark as Read
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.02rem', fontWeight: 700 }}>
                        {n.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.55 }}>
                        {n.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>Hostel: <strong>{n.targetHostel}</strong></span>
                      <span>•</span>
                      <span>Published: {n.publishDate}</span>
                      {n.expiryDate && (
                        <>
                          <span>•</span>
                          <span>Valid till: {n.expiryDate}</span>
                        </>
                      )}
                      <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
                        {n.publishedBy || 'Mess Manager Office'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: STUDENT COMPLAINT DOSSIER (STEP 4)
          ========================================================================= */}
      {complaintDetailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setComplaintDetailModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: '#f8fafc',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  Grievance Dossier #{complaintDetailModal.trackingId}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Filed: {new Date(complaintDetailModal.submittedAt || complaintDetailModal.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComplaintDetailModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Session:</strong> {complaintDetailModal.mealType} ({complaintDetailModal.mealDate})</div>
                <div><strong>Category:</strong> <span style={{ color: '#c2410c', fontWeight: 700 }}>{complaintDetailModal.category}</span></div>
                <div><strong>Assigned Manager:</strong> {complaintDetailModal.assignedManager || 'Mr. Kailash Chandra Nayak'}</div>
                <div><strong>Current Status:</strong> <span style={{ fontWeight: 800 }}>{complaintDetailModal.status}</span></div>
              </div>

              <div style={{ background: '#fff7ed', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>
                  Student Issue Statement
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginTop: '4px' }}>
                  {complaintDetailModal.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                  {complaintDetailModal.description}
                </div>
                {complaintDetailModal.attachmentUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Photo Evidence Provided:</div>
                    <img
                      src={complaintDetailModal.attachmentUrl}
                      alt="Student evidence"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                )}
              </div>

              {/* Resolution Section if available */}
              {complaintDetailModal.resolutionNote && (
                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                    Mess Manager Resolution Statement
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#064e3b', marginTop: '4px', fontStyle: 'italic' }}>
                    "{complaintDetailModal.resolutionNote}"
                  </div>
                  {complaintDetailModal.resolutionImageUrl && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>Resolution Photographic Evidence:</div>
                      <img
                        src={complaintDetailModal.resolutionImageUrl}
                        alt="Resolution evidence"
                        style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: '6px', border: '1px solid #a7f3d0' }}
                      />
                    </div>
                  )}
                  {complaintDetailModal.resolvedAt && (
                    <div style={{ fontSize: '0.74rem', color: '#047857', marginTop: '6px' }}>
                      Resolved at: {new Date(complaintDetailModal.resolvedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Reopened Banner */}
              {complaintDetailModal.status === 'Reopened' && complaintDetailModal.reopenReason && (
                <div style={{ background: '#fef2f2', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
                    Escalated / Reopened Reason
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#991b1b', marginTop: '4px' }}>
                    "{complaintDetailModal.reopenReason}"
                  </div>
                  {complaintDetailModal.reopenedAt && (
                    <div style={{ fontSize: '0.74rem', color: '#b91c1c', marginTop: '4px' }}>
                      Reopened at: {new Date(complaintDetailModal.reopenedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Status History Timeline */}
              {complaintDetailModal.statusHistory && complaintDetailModal.statusHistory.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    Lifecycle &amp; Audit Trail
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {complaintDetailModal.statusHistory.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '0.78rem',
                          background: '#f8fafc',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#0f172a' }}>{step.status}</strong> &bull; {step.remarks || 'Status update'}
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>By: {step.changedBy}</span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                          {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {complaintDetailModal.status === 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = complaintDetailModal;
                      setComplaintDetailModal(null);
                      setReopenModal({ isOpen: true, complaint: item, reason: '' });
                    }}
                    style={{
                      background: '#fef2f2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCcw size={13} /> Reopen Ticket
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setComplaintDetailModal(null)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REOPEN GRIEVANCE (STEP 4)
          ========================================================================= */}
      {reopenModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setReopenModal({ isOpen: false, complaint: null, reason: '' })}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={18} color="#b91c1c" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Reopen Ticket #{reopenModal.complaint?.trackingId}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setReopenModal({ isOpen: false, complaint: null, reason: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
              If the kitchen's corrective action did not resolve the problem or the issue recurred, please explain what is still amiss so the Mess Manager can re-investigate.
            </p>

            <form onSubmit={handleReopenComplaint}>
              <textarea
                rows={4}
                required
                placeholder="Explain why the resolution was unsatisfactory or what food defect persisted..."
                value={reopenModal.reason}
                onChange={(e) => setReopenModal({ ...reopenModal, reason: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  marginBottom: '1rem',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReopenModal({ isOpen: false, complaint: null, reason: '' })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#b91c1c',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Reopen &amp; Escalate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedDetailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setSelectedDetailModal(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: '#f8fafc',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  Food Feedback Dossier: {selectedDetailModal.feedbackCode}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {selectedDetailModal.mealType} · {selectedDetailModal.mealDate}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                  Served Menu Items
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                  {selectedDetailModal.foodItems}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Category:</strong> {selectedDetailModal.category}</div>
                <div><strong>Quantity:</strong> {selectedDetailModal.quantity}</div>
                <div><strong>Overall Rating:</strong> ⭐ {selectedDetailModal.overallRating}/5</div>
                <div><strong>Quality:</strong> ⭐ {selectedDetailModal.qualityRating}/5</div>
                <div><strong>Taste:</strong> ⭐ {selectedDetailModal.tasteRating}/5</div>
                <div><strong>Temperature:</strong> ⭐ {selectedDetailModal.temperatureRating}/5</div>
                <div><strong>Hygiene:</strong> ⭐ {selectedDetailModal.hygieneRating}/5</div>
                <div><strong>Status:</strong> {selectedDetailModal.status}</div>
              </div>

              {selectedDetailModal.comments && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Student Comments:</div>
                  <div style={{ fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                    "{selectedDetailModal.comments}"
                  </div>
                </div>
              )}

              {selectedDetailModal.response && (
                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                    Official Warden Response
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#064e3b', marginTop: '4px', fontStyle: 'italic' }}>
                    "{selectedDetailModal.response}"
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#047857', marginTop: '4px' }}>
                    Responded by: <strong>{selectedDetailModal.respondedBy || 'Hostel Administration'}</strong> on {selectedDetailModal.respondedAt ? new Date(selectedDetailModal.respondedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailModal(null)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          MODAL: STUDENT MEAL SKIP OPT-OUT (STEP 5)
          ========================================================================= */}
      {skipModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setSkipModal({ isOpen: false, mealType: '', reason: '' })}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={18} color="#dc2626" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Opt-Out: Skip {skipModal.mealType}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSkipModal({ isOpen: false, mealType: '', reason: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
              You are opting out of <strong>{skipModal.mealType}</strong> on <strong>{selectedDate}</strong>. The Central Kitchen will exclude your portion from food preparation.
            </p>
            <form onSubmit={handleConfirmSkip}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Reason for Opting Out (Optional):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Fasting, project meeting off campus, attending family function..."
                value={skipModal.reason}
                onChange={(e) => setSkipModal({ ...skipModal, reason: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  marginBottom: '1rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  onClick={() => setSkipModal({ isOpen: false, mealType: '', reason: '' })}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Skip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

