import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  Utensils,
  UtensilsCrossed,
  Calendar,
  Star,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Eye,
  RefreshCw,
  Bell,
  Check,
  X,
  Edit2,
  Trash2,
  Copy,
  ChevronRight,
  Sparkles,
  Coffee,
  Sun,
  Sunset,
  Moon,
  MessageSquare,
  ShieldCheck,
  Send,
  Upload,
  Paperclip,
  Download,
  Building2,
  ArrowRightLeft,
  XCircle,
  HelpCircle,
  AlertCircle,
  Pin,
  Home,
  Camera
} from 'lucide-react';
import {
  getWeeklyMessMenu,
  updateMealMenuItem,
  publishWeeklyMenu,
  getMenuPublicationStatus,
  copyPreviousWeekMenu,
  markMealAvailability,
  addFestivalSpecialMeal,
  resetWeeklyMessMenu,
  getAllFoodFeedback,
  getFoodFeedbackAnalytics,
  subscribeFoodFeedback,
  detectRepeatedMealDefects,
  recordFeedbackInvestigationAction
} from '../services/hostelFoodStore.js';
import {
  getAllMessComplaints,
  updateMessComplaintStatus,
  subscribeMessComplaints,
  MESS_COMPLAINT_CATEGORIES,
  MESS_COMPLAINT_STATUSES
} from '../services/messComplaintStore.js';
import {
  getDailyMealAttendanceTelemetry,
  recordActualMealsServed,
  getSkipDeadlines,
  saveSkipDeadlines,
  subscribeMessAttendance,
  DEFAULT_SKIP_DEADLINES
} from '../services/messAttendanceStore.js';
import {
  getMessNotices,
  publishMessNotice,
  updateMessNotice,
  deleteMessNotice,
  togglePinMessNotice,
  getMessNoticeStats,
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  TARGET_HOSTELS,
  TARGET_AUDIENCES
} from '../services/messNoticeStore.js';
import {
  generateMessAnalyticsReport,
  exportFeedbackReportCsv,
  exportComplaintsReportCsv,
  exportAttendanceReportCsv,
  exportExecutiveAuditCsv,
} from '../services/messReportStore.js';
import { exportToCsv, exportToExcel } from '../utils/documentExportUtils.js';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import './AdminPortal.css';
import './MessManagerPortal.css';

export default function MessManagerPortal({ account, onLogout, onSwitchRole }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const managerName = account?.name || 'Mr. Kailash Chandra Nayak';
  const managerBadge = account?.identity || 'MESS-101';
  const assignedHostels = 'Gandhi Boys & Sarojini Girls Dining Halls';

  // --- TOAST NOTIFICATION ---
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // --- STATE 1: WEEKLY MENU ---
  const [weeklyMenu, setWeeklyMenu] = useState(() => getWeeklyMessMenu());
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [pubStatus, setPubStatus] = useState(() => getMenuPublicationStatus());
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals for Weekly Menu Management (Step 2)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState({
    day: 'Monday',
    mealType: 'breakfast',
    items: '',
    time: '07:30 - 09:30 AM',
    calories: '520 kcal',
    description: '',
    isSpecial: false,
    specialOccasion: '',
    isAvailable: true,
    unavailabilityReason: '',
  });

  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);
  const [festivalForm, setFestivalForm] = useState({
    day: 'Sunday',
    mealType: 'dinner',
    occasion: 'Sunday Special Biryani Feast',
    items: 'Hyderabadi Dum Biryani, Mirchi Ka Salan, Onion Raita, Double Ka Meetha, Gulab Jamun',
    time: '08:00 - 10:30 PM',
    calories: '980 kcal',
    description: 'Special campus festive dinner curated for all hostel residents.',
  });

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [unavailabilityModal, setUnavailabilityModal] = useState({
    isOpen: false,
    day: '',
    mealKey: '',
    reason: 'Kitchen equipment maintenance & sanitization',
  });

  // Handlers for Weekly Menu Management (Step 2)
  const handleOpenEditMeal = (day, mealKey) => {
    const meal = weeklyMenu[day]?.[mealKey] || {};
    setEditingMeal({
      day,
      mealType: mealKey,
      items: meal.items || '',
      time: meal.time || 'Standard Hours',
      calories: meal.calories || '500 kcal',
      description: meal.description || '',
      isSpecial: meal.isSpecial || false,
      specialOccasion: meal.specialOccasion || '',
      isAvailable: meal.isAvailable !== false,
      unavailabilityReason: meal.unavailabilityReason || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditMeal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await updateMealMenuItem({
        day: editingMeal.day,
        mealType: editingMeal.mealType,
        items: editingMeal.items,
        time: editingMeal.time,
        calories: editingMeal.calories,
        description: editingMeal.description,
        isSpecial: editingMeal.isSpecial,
        specialOccasion: editingMeal.specialOccasion,
        isAvailable: editingMeal.isAvailable,
        unavailabilityReason: editingMeal.unavailabilityReason,
        lastUpdatedBy: managerName,
      });
      setWeeklyMenu(getWeeklyMessMenu());
      showToast(`Updated ${editingMeal.day} ${editingMeal.mealType} menu successfully!`);
      setIsEditModalOpen(false);
    } catch (err) {
      alert(`Failed to save meal: ${err.message}`);
    }
  };

  const handleClearMeal = async (day, mealKey) => {
    if (!window.confirm(`Clear menu for ${day} ${mealKey}?`)) return;
    await updateMealMenuItem({
      day,
      mealType: mealKey,
      items: 'Menu to be announced',
      description: '',
      isSpecial: false,
      specialOccasion: '',
      isAvailable: true,
      unavailabilityReason: '',
      lastUpdatedBy: managerName,
    });
    setWeeklyMenu(getWeeklyMessMenu());
    showToast(`Cleared ${day} ${mealKey} menu.`);
  };

  const handleResetBaseline = () => {
    if (!window.confirm('Reset weekly rotational menu to standard baseline?')) return;
    resetWeeklyMessMenu();
    setWeeklyMenu(getWeeklyMessMenu());
    showToast('Reset weekly rotational menu to campus baseline.');
  };

  const handleCopyPreviousWeek = () => {
    const copied = copyPreviousWeekMenu({ copiedBy: managerName });
    setWeeklyMenu(copied);
    showToast("Previous week's menu duplicated successfully with fresh timestamps!");
  };

  const handleAddFestivalMealSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await addFestivalSpecialMeal({
        day: festivalForm.day,
        mealType: festivalForm.mealType,
        occasion: festivalForm.occasion,
        items: festivalForm.items,
        time: festivalForm.time,
        calories: festivalForm.calories,
        description: festivalForm.description,
        officerName: managerName,
      });
      setWeeklyMenu(getWeeklyMessMenu());
      setIsFestivalModalOpen(false);
      showToast(`Scheduled festival feast for ${festivalForm.day} ${festivalForm.mealType}!`);
    } catch (err) {
      alert(`Failed to add festival meal: ${err.message}`);
    }
  };

  const handleToggleAvailability = (day, mealKey) => {
    const meal = weeklyMenu[day]?.[mealKey] || {};
    if (meal.isAvailable !== false) {
      setUnavailabilityModal({
        isOpen: true,
        day,
        mealKey,
        reason: 'Kitchen equipment maintenance & sanitization',
      });
    } else {
      markMealAvailability({
        day,
        mealType: mealKey,
        isAvailable: true,
        reason: '',
        officerName: managerName,
      });
      setWeeklyMenu(getWeeklyMessMenu());
      showToast(`Marked ${day} ${mealKey} available.`);
    }
  };

  const handleConfirmUnavailable = async () => {
    const { day, mealKey, reason } = unavailabilityModal;
    await markMealAvailability({
      day,
      mealType: mealKey,
      isAvailable: false,
      reason,
      officerName: managerName,
    });
    setWeeklyMenu(getWeeklyMessMenu());
    setUnavailabilityModal({ isOpen: false, day: '', mealKey: '', reason: '' });
    showToast(`Marked ${day} ${mealKey} unavailable.`);
  };

  const handlePublishMenu = async () => {
    setIsPublishing(true);
    try {
      const res = publishWeeklyMenu({
        publishedBy: managerName,
        targetHostels: assignedHostels,
      });
      setPubStatus(res);
      showToast(`Weekly Menu published college-wide! Notification dispatched to students of ${assignedHostels}.`);
    } finally {
      setIsPublishing(false);
    }
  };

  // --- STATE 2: FEEDBACK & RATINGS ---
  const [feedbackList, setFeedbackList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedbackFilterRating, setFeedbackFilterRating] = useState('ALL');
  const [feedbackFilterMeal, setFeedbackFilterMeal] = useState('ALL');
  const [feedbackFilterHostel, setFeedbackFilterHostel] = useState('ALL');
  const [feedbackFilterDate, setFeedbackFilterDate] = useState('');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [onlyLowRated, setOnlyLowRated] = useState(false);

  // Investigation & Corrective Action Modal (Step 3)
  const [investigationModal, setInvestigationModal] = useState({
    isOpen: false,
    feedback: null,
    status: 'Action Taken',
    internalNotes: '',
    correctiveAction: '',
    response: '',
    isSubmitting: false,
  });

  const handleOpenInvestigation = (fb) => {
    // Constraint: DO NOT automatically mark resolved on open
    setInvestigationModal({
      isOpen: true,
      feedback: fb,
      status: fb.status === 'Pending' ? 'Action Taken' : (fb.status || 'Under Review'),
      internalNotes: fb.internalNotes || '',
      correctiveAction: fb.correctiveAction || '',
      response: fb.response || '',
      isSubmitting: false,
    });
  };

  const handleSaveInvestigation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!investigationModal.feedback) return;
    setInvestigationModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await recordFeedbackInvestigationAction({
        id: investigationModal.feedback.id,
        status: investigationModal.status,
        internalNotes: investigationModal.internalNotes,
        correctiveAction: investigationModal.correctiveAction,
        response: investigationModal.response,
        officerName: managerName,
      });
      const updated = await getAllFoodFeedback();
      setFeedbackList(updated);
      showToast(`Corrective action recorded for ${investigationModal.feedback.feedbackCode}. Status: ${investigationModal.status}.`);
      setInvestigationModal({
        isOpen: false,
        feedback: null,
        status: 'Action Taken',
        internalNotes: '',
        correctiveAction: '',
        response: '',
        isSubmitting: false,
      });
    } catch (err) {
      alert(`Failed to save action: ${err.message}`);
      setInvestigationModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // --- STATE 3: COMPLAINTS & ISSUES (REQUEST ENGINE - STEP 4) ---
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintFilterStatus, setComplaintFilterStatus] = useState('ALL');
  const [complaintFilterCategory, setComplaintFilterCategory] = useState('ALL');
  const [complaintFilterHostel, setComplaintFilterHostel] = useState('ALL');
  const [complaintFilterMeal, setComplaintFilterMeal] = useState('ALL');
  const [complaintSearch, setComplaintSearch] = useState('');

  // Complaint Inspection & Resolution Modal
  const [inspectingComplaint, setInspectingComplaint] = useState(null);
  const [complaintActionForm, setComplaintActionForm] = useState({
    status: 'In Progress',
    internalNotes: '',
    resolutionNote: '',
    resolutionImageUrl: '',
    isSubmitting: false,
  });

  const handleOpenComplaintModal = (c) => {
    setInspectingComplaint(c);
    setComplaintActionForm({
      status: c.status === 'Pending' ? 'In Progress' : c.status,
      internalNotes: '',
      resolutionNote: c.resolutionNote || '',
      resolutionImageUrl: c.resolutionImageUrl || '',
      isSubmitting: false,
    });
  };

  const handleSaveComplaintAction = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inspectingComplaint) return;
    setComplaintActionForm((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateMessComplaintStatus({
        id: inspectingComplaint.id,
        status: complaintActionForm.status,
        internalNotes: complaintActionForm.internalNotes,
        resolutionNote: complaintActionForm.resolutionNote,
        resolutionImageUrl: complaintActionForm.resolutionImageUrl || null,
        officerName: managerName,
      });
      const updated = await getAllMessComplaints();
      setComplaintsList(updated);
      showToast(`Ticket #${inspectingComplaint.trackingId} updated to ${complaintActionForm.status}. Notification dispatched to student!`);
      setInspectingComplaint(null);
    } catch (err) {
      alert(`Failed to update complaint: ${err.message}`);
      setComplaintActionForm((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // --- STATE 4: MEAL ATTENDANCE / COUNT (STEP 5) ---
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mealAttendanceTelemetry, setMealAttendanceTelemetry] = useState(() => getDailyMealAttendanceTelemetry());
  const [skipDeadlines, setSkipDeadlines] = useState(() => getSkipDeadlines());
  const [isDeadlinesModalOpen, setIsDeadlinesModalOpen] = useState(false);
  const [deadlinesForm, setDeadlinesForm] = useState(() => getSkipDeadlines());
  const [actualServedModal, setActualServedModal] = useState({ isOpen: false, mealType: '', count: '' });
  const [skipSearchQuery, setSkipSearchQuery] = useState('');
  const [skipMealFilter, setSkipMealFilter] = useState('ALL');

  const refreshAttendanceTelemetry = () => {
    const data = getDailyMealAttendanceTelemetry(attendanceDate);
    setMealAttendanceTelemetry(data);
    setSkipDeadlines(getSkipDeadlines());
  };

  useEffect(() => {
    refreshAttendanceTelemetry();
    const unsub = subscribeMessAttendance(() => {
      refreshAttendanceTelemetry();
    });
    return unsub;
  }, [attendanceDate]);

  const handleSaveDeadlines = (e) => {
    e.preventDefault();
    saveSkipDeadlines(deadlinesForm);
    setIsDeadlinesModalOpen(false);
    refreshAttendanceTelemetry();
    showToast('✓ Mess skip cutoff deadlines updated successfully!');
  };

  const handleSaveActualServed = (e) => {
    e.preventDefault();
    recordActualMealsServed({
      date: attendanceDate,
      mealType: actualServedModal.mealType,
      count: actualServedModal.count,
    });
    setActualServedModal({ isOpen: false, mealType: '', count: '' });
    refreshAttendanceTelemetry();
    showToast(`✓ Recorded actual meals served for ${actualServedModal.mealType}!`);
  };

  const mealAttendanceData = useMemo(() => {
    const meals = mealAttendanceTelemetry?.meals || {};
    return {
      totalHostellers: mealAttendanceTelemetry?.totalResidents || 520,
      breakfast: {
        expected: meals.Breakfast?.expectedCount || 480,
        skipped: meals.Breakfast?.skippedCount || 0,
        actual: meals.Breakfast?.actualServed || 0,
        rating: 4.6,
        status: meals.Breakfast?.status || 'Scheduled',
      },
      lunch: {
        expected: meals.Lunch?.expectedCount || 505,
        skipped: meals.Lunch?.skippedCount || 0,
        actual: meals.Lunch?.actualServed || 0,
        rating: 4.2,
        status: meals.Lunch?.status || 'In Service',
      },
      snacks: {
        expected: meals['Evening Snacks']?.expectedCount || 420,
        skipped: meals['Evening Snacks']?.skippedCount || 0,
        actual: meals['Evening Snacks']?.actualServed || 0,
        rating: 4.8,
        status: meals['Evening Snacks']?.status || 'Scheduled',
      },
      dinner: {
        expected: meals.Dinner?.expectedCount || 510,
        skipped: meals.Dinner?.skippedCount || 0,
        actual: meals.Dinner?.actualServed || 0,
        rating: 4.5,
        status: meals.Dinner?.status || 'Scheduled',
      },
    };
  }, [mealAttendanceTelemetry]);

  // --- STATE 5: NOTICES (STEP 6) ---
  const [noticesList, setNoticesList] = useState(() => getMessNotices());
  const [noticeFilterCategory, setNoticeFilterCategory] = useState('ALL');
  const [noticeFilterHostel, setNoticeFilterHostel] = useState('All Hostels');
  const [noticeSearch, setNoticeSearch] = useState('');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeStats, setNoticeStats] = useState(() => getMessNoticeStats());
  const [newNoticeForm, setNewNoticeForm] = useState({
    title: '',
    description: '',
    category: 'Special Festival Menu',
    priority: 'NORMAL',
    targetHostel: 'All Hostels',
    targetAudience: 'All Residents & Day Boarders',
    publishDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    isPinned: false,
    broadcast: true,
  });

  const refreshNotices = () => {
    setNoticesList(
      getMessNotices({
        category: noticeFilterCategory,
        targetHostel: noticeFilterHostel,
        search: noticeSearch,
      })
    );
    setNoticeStats(getMessNoticeStats());
  };

  useEffect(() => {
    refreshNotices();
    const handleNoticesUpdate = () => refreshNotices();
    window.addEventListener('apna_campus_mess_notices_updated', handleNoticesUpdate);
    window.addEventListener('storage', handleNoticesUpdate);
    return () => {
      window.removeEventListener('apna_campus_mess_notices_updated', handleNoticesUpdate);
      window.removeEventListener('storage', handleNoticesUpdate);
    };
  }, [noticeFilterCategory, noticeFilterHostel, noticeSearch]);

  // --- STATE 6: REPORTS & ANALYTICS (STEP 7) ---
  const [reportTimeframe, setReportTimeframe] = useState('weekly');
  const [reportHostel, setReportHostel] = useState('All Hostels');
  const [reportMealType, setReportMealType] = useState('ALL');
  const [reportCustomStart, setReportCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [reportCustomEnd, setReportCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));

  const analyticsReport = useMemo(() => {
    return generateMessAnalyticsReport({
      timeframe: reportTimeframe,
      hostel: reportHostel,
      mealType: reportMealType,
      customStartDate: reportCustomStart,
      customEndDate: reportCustomEnd,
    });
  }, [reportTimeframe, reportHostel, reportMealType, reportCustomStart, reportCustomEnd, feedbackList, complaintsList, noticesList]);

  // Load Feedback Data
  useEffect(() => {
    getAllFoodFeedback().then((data) => setFeedbackList(data));
    getFoodFeedbackAnalytics().then((data) => setAnalytics(data));

    const unsub = subscribeFoodFeedback(() => {
      getAllFoodFeedback().then((data) => setFeedbackList(data));
      getFoodFeedbackAnalytics().then((data) => setAnalytics(data));
    });
    return unsub;
  }, []);

  // Load Complaints & Issues (Request Management Engine - Step 4)
  useEffect(() => {
    getAllMessComplaints().then((data) => setComplaintsList(data));
    const unsub = subscribeMessComplaints((data) => {
      setComplaintsList(data);
    });
    return unsub;
  }, []);

  // Sync Weekly Menu changes
  useEffect(() => {
    const handleMenuSync = () => setWeeklyMenu(getWeeklyMessMenu());
    window.addEventListener('apna_campus_mess_menu_updated', handleMenuSync);
    window.addEventListener('storage', handleMenuSync);
    return () => {
      window.removeEventListener('apna_campus_mess_menu_updated', handleMenuSync);
      window.removeEventListener('storage', handleMenuSync);
    };
  }, []);

  // Today's Meals mapping
  const todayMeals = useMemo(() => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayData = weeklyMenu[todayName] || weeklyMenu['Monday'] || {};
    return {
      breakfast: dayData.breakfast?.items || 'Idli, Sambar, Medu Vada, Coconut Chutney, Tea/Coffee',
      lunch: dayData.lunch?.items || 'Steamed Rice, Dal Tadka, Paneer Butter Masala, Mixed Veg, Curd, Papad',
      snacks: dayData.snacks?.items || 'Vegetable Samosa / Poha, Mint Chutney, Special Masala Tea',
      dinner: dayData.dinner?.items || 'Phulka Chapati, Jeera Rice, Dal Makhani, Kadai Paneer, Gulab Jamun',
    };
  }, [weeklyMenu]);

  // Derived Summary KPIs
  const totalFeedbackCount = feedbackList.length;
  const avgRating = totalFeedbackCount > 0
    ? (feedbackList.reduce((acc, curr) => acc + (curr.overallRating || 0), 0) / totalFeedbackCount).toFixed(1)
    : '4.4';
  const lowRatedCount = feedbackList.filter((f) => (f.overallRating || 0) < 3).length;
  const openComplaintsCount = complaintsList.filter((c) => c.status !== 'Resolved').length;
  const resolvedComplaintsCount = complaintsList.filter((c) => c.status === 'Resolved').length;
  const totalMealsServedToday =
    (mealAttendanceData.breakfast.actual || 0) +
    (mealAttendanceData.lunch.actual || 0) +
    (mealAttendanceData.snacks.actual || 0) +
    (mealAttendanceData.dinner.actual || 0);

  // Granular Rating Distribution (5★, 4★, 3★, 2★, 1★)
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbackList.forEach((f) => {
      const r = Math.min(5, Math.max(1, Math.round(Number(f.overallRating) || 5)));
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [feedbackList]);

  // Repeated Defect Clusters Detection (< 3★ on same date & meal)
  const repeatedDefects = useMemo(() => {
    return detectRepeatedMealDefects(feedbackList);
  }, [feedbackList]);

  // Multi-dimensional Filtered Feedback List
  const filteredFeedbacks = useMemo(() => {
    return feedbackList.filter((f) => {
      if (onlyLowRated && (Number(f.overallRating) || 0) >= 3) return false;
      if (feedbackFilterRating !== 'ALL') {
        if (feedbackFilterRating === 'LOW_ONLY') {
          if ((Number(f.overallRating) || 0) >= 3) return false;
        } else if (Math.round(Number(f.overallRating)) !== Number(feedbackFilterRating)) {
          return false;
        }
      }
      if (feedbackFilterMeal !== 'ALL' && (f.mealType || '').toLowerCase() !== feedbackFilterMeal.toLowerCase()) {
        return false;
      }
      if (feedbackFilterHostel !== 'ALL' && !(f.hostelName || '').toLowerCase().includes(feedbackFilterHostel.toLowerCase())) {
        return false;
      }
      if (feedbackFilterDate && f.mealDate !== feedbackFilterDate) {
        return false;
      }
      if (feedbackSearch.trim()) {
        const q = feedbackSearch.toLowerCase().trim();
        const matches =
          (f.studentName || '').toLowerCase().includes(q) ||
          (f.rollNumber || '').toLowerCase().includes(q) ||
          (f.foodItems || '').toLowerCase().includes(q) ||
          (f.comments || '').toLowerCase().includes(q) ||
          (f.feedbackCode || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [feedbackList, onlyLowRated, feedbackFilterRating, feedbackFilterMeal, feedbackFilterHostel, feedbackFilterDate, feedbackSearch]);

  // Multi-dimensional Filtered Complaints List (Request Engine)
  const filteredComplaints = useMemo(() => {
    return complaintsList.filter((c) => {
      if (complaintFilterStatus !== 'ALL' && (c.status || '').toLowerCase() !== complaintFilterStatus.toLowerCase()) {
        return false;
      }
      if (complaintFilterCategory !== 'ALL' && (c.category || '').toLowerCase() !== complaintFilterCategory.toLowerCase()) {
        return false;
      }
      if (complaintFilterHostel !== 'ALL' && !(c.hostelName || '').toLowerCase().includes(complaintFilterHostel.toLowerCase())) {
        return false;
      }
      if (complaintFilterMeal !== 'ALL' && (c.mealType || '').toLowerCase() !== complaintFilterMeal.toLowerCase()) {
        return false;
      }
      if (complaintSearch.trim()) {
        const q = complaintSearch.toLowerCase().trim();
        const matches =
          (c.trackingId || '').toLowerCase().includes(q) ||
          (c.studentName || '').toLowerCase().includes(q) ||
          (c.rollNumber || '').toLowerCase().includes(q) ||
          (c.title || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [complaintsList, complaintFilterStatus, complaintFilterCategory, complaintFilterHostel, complaintFilterMeal, complaintSearch]);

  // Filtered Student Skip Declarations for Selected Date (Step 5)
  const filteredSkips = useMemo(() => {
    const list = mealAttendanceTelemetry?.allSkipsForDate || [];
    return list.filter((s) => {
      if (skipMealFilter !== 'ALL' && !(s.skippedMeals || []).includes(skipMealFilter)) return false;
      if (skipSearchQuery.trim()) {
        const q = skipSearchQuery.toLowerCase().trim();
        return (
          (s.studentName || '').toLowerCase().includes(q) ||
          (s.rollNumber || '').toLowerCase().includes(q) ||
          (s.hostelName || '').toLowerCase().includes(q) ||
          (s.roomNumber || '').toLowerCase().includes(q) ||
          (s.reason || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mealAttendanceTelemetry, skipMealFilter, skipSearchQuery]);

  const handleExportAttendanceCsv = () => {
    const meals = mealAttendanceTelemetry?.meals || {};
    const rows = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'].map((m) => {
      const data = meals[m] || {};
      return {
        'Date': attendanceDate,
        'Meal Session': m,
        'Cutoff Deadline': data.deadline || '-',
        'Total Enrolled Residents': data.totalResidents || 520,
        'Approved Outstation Leaves': data.approvedLeaves || 12,
        'Student Skip Requests': data.skippedCount || 0,
        'Expected Headcount': data.expectedCount || 0,
        'Actual Meals Served': data.actualServed || 0,
        'Turnout Percentage': data.turnoutRatio || '-',
        'Status': data.status || '-',
      };
    });
    exportToCsv(`Mess_Attendance_Telemetry_${attendanceDate}`, rows);
  };

  // Navigation Architecture (With OVERVIEW section like Hostel Admin & Security)
  const messNavSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Mess Manager Dashboard', icon: Home },
      ],
    },
    {
      title: 'DINING OPERATIONS',
      items: [
        { id: 'overview', label: 'Mess Overview', icon: Utensils },
        { id: 'menu', label: 'Weekly Menu', icon: Calendar },
        {
          id: 'feedback',
          label: 'Meal Feedback',
          icon: Star,
          badge: lowRatedCount > 0 ? `${lowRatedCount} Low` : undefined,
        },
        {
          id: 'complaints',
          label: 'Complaints & Issues',
          icon: AlertTriangle,
          badge: openComplaintsCount > 0 ? `${openComplaintsCount} Open` : undefined,
        },
      ],
    },
    {
      title: 'MANAGEMENT & LOGS',
      items: [
        { id: 'attendance', label: 'Meal Count / Attendance', icon: Users },
        { id: 'notices', label: 'Notices', icon: Bell, badge: String(noticesList.length) },
        { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
      ],
    },
  ];

  // Dynamic Page Heading
  const getPageHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: "Mess Manager Dashboard",
          subtitle: "Central campus dining operations, dietary satisfaction, nutritional logistics & meal telemetry.",
        };
      case 'overview':
        return {
          title: "Mess Manager Executive Console",
          subtitle: "Real-time meal service telemetry, student dietary ratings, weekly menu publishing, and complaint resolution.",
        };
      case 'menu':
        return {
          title: "Weekly Rotational Menu Directorate",
          subtitle: "Publish weekly student breakfast, lunch, snacks, and dinner schedules across residential dining halls.",
        };
      case 'feedback':
        return {
          title: "Meal Feedback & Low-Rating Detection",
          subtitle: "Granular 5-star student food quality audits, portion sizing feedback, and repeated complaint alerts.",
        };
      case 'complaints':
        return {
          title: "Food Quality Complaints & Request Engine",
          subtitle: "Investigate and resolve student meal issues with photo evidence, corrective actions, and status updates.",
        };
      case 'attendance':
        return {
          title: "Meal Count & Student Attendance Registry",
          subtitle: "Expected vs. actual dining turnouts, student meal-skip forecasts, and kitchen consumption planning.",
        };
      case 'notices':
        return {
          title: "Mess Notices & Operational Circulars",
          subtitle: "Broadcast dining schedule adjustments, festival menus, and maintenance advisories to hostellers.",
        };
      case 'reports':
        return {
          title: "Mess Performance Analytics & Export",
          subtitle: "Meal-wise rating trends, defect recurrence summaries, and institutional Excel/CSV returns.",
        };
      default:
        return {
          title: "Mess Management Portal",
          subtitle: "Campus Dining, Food Safety & Logistics Directorate",
        };
    }
  };

  const heading = getPageHeading();

  // Export Reports
  const handleExportCsv = () => {
    const reportData = feedbackList.map((f, i) => ({
      'Sl No': i + 1,
      'Feedback Code': f.feedbackCode || f.id,
      'Date': f.mealDate,
      'Meal Type': f.mealType,
      'Student Name': f.studentName,
      'Roll Number': f.rollNumber,
      'Hostel': f.hostelName,
      'Overall Rating': f.overallRating,
      'Quality': f.qualityRating,
      'Taste': f.tasteRating,
      'Hygiene': f.hygieneRating,
      'Quantity': f.quantity,
      'Comments': f.comments || '',
      'Status': f.status,
    }));
    exportToCsv(`Apna_Campus_Mess_Feedback_${new Date().toISOString().slice(0, 10)}.csv`, reportData);
  };

  return (
    <AppLayout
      account={account}
      portalName="Mess Management"
      portalSubtitle="Food Quality, Menu Logistics & Dining Feedback"
      portalHomeTab="dashboard"
      navSections={messNavSections}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      pageTitle={heading.title}
      pageSubtitle={heading.subtitle}
      pageActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div className="mess-duty-chip">
            <span className="mess-duty-pulse"></span>
            <span>MESS SUPERVISOR ON DUTY</span>
          </div>
          <div className="mess-hostel-badge">
            <Building2 size={13} style={{ display: 'inline', marginRight: 4 }} />
            Gandhi & Sarojini Halls
          </div>
          {onSwitchRole && (
            <button className="mess-btn-switch" onClick={() => onSwitchRole('admin')}>
              <ArrowRightLeft size={14} /> Switch Role
            </button>
          )}
        </div>
      }
    >
      <div className="mess-portal-wrapper">
        {/* =========================================================================
            SECTION 0: MESS MANAGER DASHBOARD (ROLE DASHBOARD LANDING LIKE HOSTEL ADMIN)
            ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="mess-dashboard-landing-container">
            <RoleDashboardLanding
              roleKey="mess_manager"
              account={account}
              onLogout={onLogout}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSwitchRole={onSwitchRole}
            />
          </div>
        )}

        {/* =========================================================================
            SECTION 1: OVERVIEW EXECUTIVE CONSOLE
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div>
            {/* Executive Header */}
            <div className="mess-executive-header">
              <div className="mess-executive-title-group">
                <h1>
                  Mess Manager Executive Console
                  <span className="mess-executive-badge">Live Dining Service</span>
                </h1>
                <p className="mess-executive-subtitle">
                  Supervising central food preparation, student satisfaction metrics, menu compliance, and complaint resolutions.
                </p>
              </div>
              <div className="mess-quick-actions">
                <button className="mess-btn-primary" onClick={() => setActiveTab('menu')}>
                  <Calendar size={14} /> Manage Weekly Menu
                </button>
              </div>
            </div>

            {/* Top KPI Cards Grid */}
            <div className="mess-kpi-grid">
              <div className="mess-kpi-card" onClick={() => setActiveTab('feedback')}>
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Average Food Rating</span>
                  <div className="mess-kpi-icon amber"><Star size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: Number(avgRating) >= 4 ? '#d97706' : '#e11d48' }}>
                  {avgRating} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 5.0</span>
                </div>
                <div className="mess-kpi-sub">
                  <span>Based on {totalFeedbackCount} student reviews</span>
                </div>
              </div>

              <div className="mess-kpi-card" onClick={() => setActiveTab('feedback')}>
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Total Feedback Received</span>
                  <div className="mess-kpi-icon blue"><MessageSquare size={18} /></div>
                </div>
                <div className="mess-kpi-val">{totalFeedbackCount}</div>
                <div className="mess-kpi-sub">
                  <span>Reviews submitted this month</span>
                </div>
              </div>

              <div className="mess-kpi-card" onClick={() => setActiveTab('feedback')}>
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Low-Rated Meals (&lt; 3★)</span>
                  <div className="mess-kpi-icon rose"><AlertCircle size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: lowRatedCount > 0 ? '#e11d48' : '#059669' }}>
                  {lowRatedCount}
                </div>
                <div className="mess-kpi-sub">
                  <span style={{ color: lowRatedCount > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                    {lowRatedCount > 0 ? 'Requires recipe investigation' : 'No critical low scores'}
                  </span>
                </div>
              </div>

              <div className="mess-kpi-card" onClick={() => setActiveTab('complaints')}>
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Open Mess Complaints</span>
                  <div className="mess-kpi-icon amber"><AlertTriangle size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: openComplaintsCount > 0 ? '#d97706' : '#059669' }}>
                  {openComplaintsCount}
                </div>
                <div className="mess-kpi-sub">
                  <span>{resolvedComplaintsCount} marked resolved</span>
                </div>
              </div>

              <div className="mess-kpi-card" onClick={() => setActiveTab('attendance')}>
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Total Meals Served Today</span>
                  <div className="mess-kpi-icon emerald"><Users size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#059669' }}>{totalMealsServedToday}</div>
                <div className="mess-kpi-sub">
                  <span>Out of {mealAttendanceData.totalHostellers} enrolled residents</span>
                </div>
              </div>
            </div>

            {/* Today's 4-Meal Summary Cards */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Coffee size={17} color="#d97706" /> Today's Prepared Food Menus
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="mess-meal-card">
                <div className="mess-meal-header">
                  <span className="mess-meal-title"><Coffee size={15} color="#d97706" /> Breakfast</span>
                  <span className="mess-badge available">Served</span>
                </div>
                <div className="mess-meal-time">07:30 AM - 09:30 AM</div>
                <div className="mess-meal-items">{todayMeals.breakfast}</div>
              </div>

              <div className="mess-meal-card">
                <div className="mess-meal-header">
                  <span className="mess-meal-title"><Sun size={15} color="#0284c7" /> Lunch</span>
                  <span className="mess-badge available">Active Now</span>
                </div>
                <div className="mess-meal-time">12:15 PM - 02:30 PM</div>
                <div className="mess-meal-items">{todayMeals.lunch}</div>
              </div>

              <div className="mess-meal-card">
                <div className="mess-meal-header">
                  <span className="mess-meal-title"><Sunset size={15} color="#d97706" /> Evening Snacks</span>
                  <span className="mess-badge pending">Prepping</span>
                </div>
                <div className="mess-meal-time">05:00 PM - 06:15 PM</div>
                <div className="mess-meal-items">{todayMeals.snacks}</div>
              </div>

              <div className="mess-meal-card">
                <div className="mess-meal-header">
                  <span className="mess-meal-title"><Moon size={15} color="#7c3aed" /> Dinner</span>
                  <span className="mess-badge available">Scheduled</span>
                </div>
                <div className="mess-meal-time">07:30 PM - 09:45 PM</div>
                <div className="mess-meal-items">{todayMeals.dinner}</div>
              </div>
            </div>

            {/* Multi-Column Monitoring Sections Grid */}
            <div className="mess-sections-grid">
              {/* SECTION 1: Today's Mess Overview Table */}
              <div className="mess-card mess-col-8">
                <div className="mess-card-header">
                  <h3 className="mess-card-title">
                    <UtensilsCrossed size={17} color="#d97706" /> Today's Mess Overview & Service Roster
                  </h3>
                  <button className="mess-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => setActiveTab('menu')}>
                    Edit Weekly Menu →
                  </button>
                </div>
                <div className="mess-table-container">
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Meal</th>
                        <th>Menu Items</th>
                        <th>Expected Students</th>
                        <th>Feedback Rating</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Breakfast</strong></td>
                        <td style={{ maxWidth: 280 }}><div style={{ fontSize: '0.78rem', color: '#475569' }}>{todayMeals.breakfast}</div></td>
                        <td><strong>{mealAttendanceData.breakfast.expected}</strong></td>
                        <td><span style={{ color: '#d97706', fontWeight: 700 }}>★ {mealAttendanceData.breakfast.rating}</span></td>
                        <td><span className="mess-badge available">Available</span></td>
                      </tr>
                      <tr>
                        <td><strong>Lunch</strong></td>
                        <td style={{ maxWidth: 280 }}><div style={{ fontSize: '0.78rem', color: '#475569' }}>{todayMeals.lunch}</div></td>
                        <td><strong>{mealAttendanceData.lunch.expected}</strong></td>
                        <td><span style={{ color: '#d97706', fontWeight: 700 }}>★ {mealAttendanceData.lunch.rating}</span></td>
                        <td><span className="mess-badge available">Available</span></td>
                      </tr>
                      <tr>
                        <td><strong>Snacks</strong></td>
                        <td style={{ maxWidth: 280 }}><div style={{ fontSize: '0.78rem', color: '#475569' }}>{todayMeals.snacks}</div></td>
                        <td><strong>{mealAttendanceData.snacks.expected}</strong></td>
                        <td><span style={{ color: '#d97706', fontWeight: 700 }}>★ {mealAttendanceData.snacks.rating}</span></td>
                        <td><span className="mess-badge available">Available</span></td>
                      </tr>
                      <tr>
                        <td><strong>Dinner</strong></td>
                        <td style={{ maxWidth: 280 }}><div style={{ fontSize: '0.78rem', color: '#475569' }}>{todayMeals.dinner}</div></td>
                        <td><strong>{mealAttendanceData.dinner.expected}</strong></td>
                        <td><span style={{ color: '#d97706', fontWeight: 700 }}>★ {mealAttendanceData.dinner.rating}</span></td>
                        <td><span className="mess-badge available">Available</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: Recent Activities */}
              <div className="mess-card mess-col-4">
                <div className="mess-card-header">
                  <h3 className="mess-card-title">
                    <Clock size={17} color="#0284c7" /> Recent Activities
                  </h3>
                  <span className="mess-badge available">LIVE</span>
                </div>
                <div className="mess-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Latest Student Feedback · 10m ago</div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Priya Patra (Roll 04) gave 5★ for Breakfast</strong>
                    <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '0.2rem' }}>"Crispy vadas and hot sambar."</div>
                  </div>

                  <div style={{ background: '#fff1f2', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #ffe4e6' }}>
                    <div style={{ fontSize: '0.72rem', color: '#e11d48' }}>Food Complaint Logged · 45m ago</div>
                    <strong style={{ fontSize: '0.82rem', color: '#9f1239' }}>Amit Nayak: Paneer gravy excessive salt</strong>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>Status: In Progress by Chef</div>
                  </div>

                  <div style={{ background: '#ecfdf5', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#059669' }}>Menu Updated · Today, 09:30 AM</div>
                    <strong style={{ fontSize: '0.82rem', color: '#065f46' }}>Weekly Menu published by Mess Manager</strong>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>Notified all 520 boarders</div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.72rem', color: '#2563eb' }}>Notice Broadcast · 2d ago</div>
                    <strong style={{ fontSize: '0.82rem', color: '#1e40af' }}>Diwali Festive Feast Announcement</strong>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>Read by 486 students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2: WEEKLY MENU MANAGEMENT (STEP 2)
            ========================================================================= */}
        {activeTab === 'menu' && (
          <div className="mess-card">
            <div className="mess-card-header">
              <div>
                <h3 className="mess-card-title">
                  <Calendar size={18} color="#d97706" />
                  Rotational Weekly Mess Menu Directorate
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  Status: <span className={`mess-badge ${pubStatus?.isPublished ? 'available' : 'pending'}`}>
                    {pubStatus?.isPublished ? `Published (${pubStatus?.targetHostels || 'All Hostels'})` : 'Draft / Unsaved'}
                  </span>
                  {pubStatus?.lastPublishedAt && (
                    <span style={{ marginLeft: 6 }}>
                      &bull; Last Published: {new Date(pubStatus.lastPublishedAt).toLocaleDateString()} by {pubStatus.publishedBy}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  onClick={() => handleOpenEditMeal(selectedDay, 'breakfast')}
                >
                  <Plus size={13} /> Add / Edit Meal
                </button>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  onClick={handleCopyPreviousWeek}
                >
                  <Copy size={13} /> Copy Previous Week
                </button>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  style={{ borderColor: '#fde68a', background: '#fffbeb', color: '#b45309' }}
                  onClick={() => setIsFestivalModalOpen(true)}
                >
                  <Sparkles size={13} color="#d97706" /> + Add Festival Meal
                </button>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  onClick={() => setIsPreviewModalOpen(true)}
                >
                  <Eye size={13} /> Preview Timetable
                </button>
                <button
                  type="button"
                  className="mess-btn-primary"
                  disabled={isPublishing}
                  onClick={handlePublishMenu}
                >
                  <Send size={13} /> {isPublishing ? 'Publishing...' : 'Publish Weekly Menu'}
                </button>
              </div>
            </div>

            <div className="mess-card-body">
              {/* Day Selector Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const dayData = weeklyMenu[day] || {};
                  const hasSpecial = Object.values(dayData).some((m) => m?.isSpecial);
                  const hasUnavailable = Object.values(dayData).some((m) => m?.isAvailable === false);
                  return (
                    <button
                      key={day}
                      type="button"
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: selectedDay === day ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                        background: selectedDay === day ? '#fef3c7' : '#ffffff',
                        color: selectedDay === day ? '#b45309' : '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => setSelectedDay(day)}
                    >
                      <span>{day}</span>
                      {hasSpecial && <Sparkles size={12} color="#d97706" />}
                      {hasUnavailable && <AlertTriangle size={12} color="#dc2626" />}
                    </button>
                  );
                })}
              </div>

              {/* Day Subheader with Baseline Reset */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>{selectedDay} Meal Timetable</h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>4 Dining sessions scheduled across central residential mess kitchens</div>
                </div>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
                  onClick={handleResetBaseline}
                >
                  <RefreshCw size={12} /> Reset to Baseline
                </button>
              </div>

              {/* Day Meals View */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealKey) => {
                  const meal = weeklyMenu[selectedDay]?.[mealKey] || {};
                  const isAvailable = meal.isAvailable !== false;
                  return (
                    <div
                      key={mealKey}
                      className="mess-meal-card"
                      style={{
                        background: isAvailable ? '#ffffff' : '#f8fafc',
                        borderColor: isAvailable ? (meal.isSpecial ? '#fde68a' : '#e2e8f0') : '#fca5a5',
                      }}
                    >
                      <div className="mess-meal-header">
                        <span className="mess-meal-title" style={{ textTransform: 'capitalize' }}>
                          {mealKey === 'breakfast' && <Coffee size={16} color="#d97706" />}
                          {mealKey === 'lunch' && <Sun size={16} color="#0284c7" />}
                          {mealKey === 'snacks' && <Sunset size={16} color="#d97706" />}
                          {mealKey === 'dinner' && <Moon size={16} color="#7c3aed" />}
                          {mealKey}
                        </span>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          {meal.isSpecial && (
                            <span className="mess-badge special" title={meal.specialOccasion || 'Special Feast'}>
                              <Sparkles size={10} /> {meal.specialOccasion || 'Special Feast'}
                            </span>
                          )}
                          <span className={`mess-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      <div className="mess-meal-time">
                        <Clock size={12} /> {meal.time || 'Standard Hours'} &bull; {meal.calories || '450 kcal'}
                      </div>

                      <p style={{ margin: '0.45rem 0 0.5rem 0', fontSize: '0.85rem', color: isAvailable ? '#334155' : '#94a3b8', minHeight: 48, fontWeight: 500 }}>
                        {meal.items || 'Standard rotational menu'}
                      </p>

                      {meal.description && (
                        <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                          Note: {meal.description}
                        </div>
                      )}

                      {!isAvailable && meal.unavailabilityReason && (
                        <div style={{ fontSize: '0.74rem', color: '#b91c1c', background: '#fee2e2', padding: '0.35rem 0.5rem', borderRadius: 4, marginBottom: '0.5rem' }}>
                          Unavailable: {meal.unavailabilityReason}
                        </div>
                      )}

                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                        Last updated by: {meal.lastUpdatedBy || 'Mr. Kailash Chandra Nayak'}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="mess-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                          onClick={() => handleOpenEditMeal(selectedDay, mealKey)}
                        >
                          <Edit2 size={11} /> Edit Meal
                        </button>
                        <button
                          type="button"
                          className="mess-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: isAvailable ? '#dc2626' : '#059669' }}
                          onClick={() => handleToggleAvailability(selectedDay, mealKey)}
                        >
                          {isAvailable ? 'Mark Meal Unavailable' : 'Mark Available'}
                        </button>
                        <button
                          type="button"
                          className="mess-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#64748b' }}
                          onClick={() => handleClearMeal(selectedDay, mealKey)}
                        >
                          <Trash2 size={11} /> Clear Meal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 3: MEAL FEEDBACK & LOW-RATED DETECTION (STEP 3)
            ========================================================================= */}
        {activeTab === 'feedback' && (
          <div className="mess-card">
            <div className="mess-card-header">
              <h3 className="mess-card-title">
                <Star size={18} color="#d97706" />
                Student Meal Feedback & Food Quality Intelligence
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`mess-filter-toggle ${onlyLowRated ? 'active' : ''}`}
                  onClick={() => setOnlyLowRated(!onlyLowRated)}
                >
                  <AlertTriangle size={13} color={onlyLowRated ? '#dc2626' : '#d97706'} />
                  Low-Rated Only (&lt; 3★) ({lowRatedCount})
                </button>
                <button className="mess-btn-secondary" onClick={handleExportCsv}>
                  <Download size={13} /> Export Feedback CSV
                </button>
              </div>
            </div>

            <div className="mess-card-body">
              {/* 7 KPI Rating Distribution Grid */}
              <div className="mess-feedback-dist-grid">
                {/* 1. Total Feedback */}
                <div className="mess-feedback-dist-card">
                  <div className="mess-dist-header">
                    <span>Total Feedback</span>
                    <FileText size={13} color="#64748b" />
                  </div>
                  <div className="mess-dist-val">{totalFeedbackCount}</div>
                  <div className="mess-dist-sub">
                    <span>All dining sessions</span>
                    <span>100%</span>
                  </div>
                  <div className="mess-dist-bar-track">
                    <div className="mess-dist-bar-fill" style={{ width: '100%', background: '#64748b' }} />
                  </div>
                </div>

                {/* 2. Average Rating */}
                <div className="mess-feedback-dist-card">
                  <div className="mess-dist-header">
                    <span>Average Rating</span>
                    <Star size={13} color="#d97706" />
                  </div>
                  <div className="mess-dist-val" style={{ color: Number(avgRating) >= 3.5 ? '#d97706' : '#dc2626' }}>
                    ★ {avgRating}
                  </div>
                  <div className="mess-dist-sub">
                    <span>Target: 4.5+ ★</span>
                    <span>{Math.round((Number(avgRating) / 5) * 100)}%</span>
                  </div>
                  <div className="mess-dist-bar-track">
                    <div className="mess-dist-bar-fill" style={{ width: `${(Number(avgRating) / 5) * 100}%`, background: '#d97706' }} />
                  </div>
                </div>

                {/* 3. 5-Star Feedback */}
                <div className="mess-feedback-dist-card">
                  <div className="mess-dist-header">
                    <span>5 Stars</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>★★★★★</span>
                  </div>
                  <div className="mess-dist-val" style={{ color: '#059669' }}>{starCounts[5]}</div>
                  <div className="mess-dist-sub">
                    <span>Excellent</span>
                    <span>{totalFeedbackCount ? Math.round((starCounts[5] / totalFeedbackCount) * 100) : 0}%</span>
                  </div>
                  <div className="mess-dist-bar-track">
                    <div className="mess-dist-bar-fill" style={{ width: `${totalFeedbackCount ? (starCounts[5] / totalFeedbackCount) * 100 : 0}%`, background: '#059669' }} />
                  </div>
                </div>

                {/* 4. 4-Star Feedback */}
                <div className="mess-feedback-dist-card">
                  <div className="mess-dist-header">
                    <span>4 Stars</span>
                    <span style={{ color: '#0284c7', fontWeight: 700 }}>★★★★</span>
                  </div>
                  <div className="mess-dist-val" style={{ color: '#0284c7' }}>{starCounts[4]}</div>
                  <div className="mess-dist-sub">
                    <span>Good</span>
                    <span>{totalFeedbackCount ? Math.round((starCounts[4] / totalFeedbackCount) * 100) : 0}%</span>
                  </div>
                  <div className="mess-dist-bar-track">
                    <div className="mess-dist-bar-fill" style={{ width: `${totalFeedbackCount ? (starCounts[4] / totalFeedbackCount) * 100 : 0}%`, background: '#0284c7' }} />
                  </div>
                </div>

                {/* 5. 3-Star Feedback */}
                <div className="mess-feedback-dist-card">
                  <div className="mess-dist-header">
                    <span>3 Stars</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>★★★</span>
                  </div>
                  <div className="mess-dist-val" style={{ color: '#f59e0b' }}>{starCounts[3]}</div>
                  <div className="mess-dist-sub">
                    <span>Average</span>
                    <span>{totalFeedbackCount ? Math.round((starCounts[3] / totalFeedbackCount) * 100) : 0}%</span>
                  </div>
                  <div className="mess-dist-bar-track">
                    <div className="mess-dist-bar-fill" style={{ width: `${totalFeedbackCount ? (starCounts[3] / totalFeedbackCount) * 100 : 0}%`, background: '#f59e0b' }} />
                  </div>
                </div>

                {/* 6. 2-Star Feedback */}
                <div className={`mess-feedback-dist-card ${starCounts[2] > 0 ? 'warning' : ''}`}>
                  <div className="mess-dist-header">
                    <span>2 Stars</span>
                    <span style={{ color: '#ea580c', fontWeight: 700 }}>★★</span>
                  </div>
                  <div className="mess-dist-val" style={{ color: '#ea580c' }}>{starCounts[2]}</div>
                  <div className="mess-dist-sub">
                    <span>Poor</span>
                    <span>{totalFeedbackCount ? Math.round((starCounts[2] / totalFeedbackCount) * 100) : 0}%</span>
                  </div>
                  <div className="mess-dist-bar-track">
                    <div className="mess-dist-bar-fill" style={{ width: `${totalFeedbackCount ? (starCounts[2] / totalFeedbackCount) * 100 : 0}%`, background: '#ea580c' }} />
                  </div>
                </div>

                {/* 7. 1-Star Feedback */}
                <div className={`mess-feedback-dist-card ${starCounts[1] > 0 ? 'critical' : ''}`}>
                  <div className="mess-dist-header">
                    <span>1 Star</span>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>★</span>
                  </div>
                  <div className="mess-dist-val" style={{ color: '#dc2626' }}>{starCounts[1]}</div>
                  <div className="mess-dist-sub">
                    <span>Critical Defect</span>
                    <span>{totalFeedbackCount ? Math.round((starCounts[1] / totalFeedbackCount) * 100) : 0}%</span>
                  </div>
                  <div className="mess-dist-bar-track">
                    <div className="mess-dist-bar-fill" style={{ width: `${totalFeedbackCount ? (starCounts[1] / totalFeedbackCount) * 100 : 0}%`, background: '#dc2626' }} />
                  </div>
                </div>
              </div>

              {/* Repeated Defect Alerts Banner */}
              {repeatedDefects.length > 0 && (
                <div className="mess-defect-banner">
                  <div className="mess-defect-banner-header">
                    <div className="mess-defect-banner-title">
                      <AlertTriangle size={18} color="#e11d48" />
                      <span>REPEATED FOOD DEFECT DETECTED ({repeatedDefects.length} Active Issue Clusters)</span>
                    </div>
                    <span className="mess-badge unavailable">Immediate Action Required</span>
                  </div>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#881337' }}>
                    Multiple students independently reported low ratings (&lt; 3★) for the same meal session. Review clusters below to initiate corrective kitchen action.
                  </p>
                  <div className="mess-defect-cluster-list">
                    {repeatedDefects.map((cluster) => (
                      <div key={cluster.clusterKey} className="mess-defect-cluster-item">
                        <div className="mess-defect-cluster-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="mess-defect-cluster-badge">
                              <AlertCircle size={12} />
                              {cluster.count} Students Reported
                            </span>
                            <strong>{cluster.mealType} · {cluster.mealDate}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({cluster.affectedHostels.join(', ')})</span>
                            <span style={{ color: '#e11d48', fontWeight: 700, fontSize: '0.8rem' }}>★ {cluster.averageRating} Avg</span>
                          </div>
                          <div className="mess-defect-quote">
                            &ldquo;{cluster.sampleComments[0]?.comment || 'Reported unsatisfactory food quality'}&rdquo;
                            {cluster.sampleComments[1] && (
                              <span> &bull; &ldquo;{cluster.sampleComments[1].comment}&rdquo;</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="mess-btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                            onClick={() => {
                              setFeedbackFilterDate(cluster.mealDate);
                              setFeedbackFilterMeal(cluster.mealType);
                              setOnlyLowRated(true);
                              showToast(`Filtered view to ${cluster.mealType} on ${cluster.mealDate}`);
                            }}
                          >
                            Filter to This Meal
                          </button>
                          <button
                            type="button"
                            className="mess-btn-investigate"
                            onClick={() => handleOpenInvestigation(cluster.items[0])}
                          >
                            <AlertTriangle size={12} /> Investigate Cluster
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Dimensional Feedback Filters Bar */}
              <div className="mess-filter-bar" style={{ padding: '0.75rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <div className="mess-filter-group">
                  <Calendar size={14} color="#0284c7" />
                  <span>Date:</span>
                  <input
                    type="date"
                    className="mess-filter-select"
                    value={feedbackFilterDate}
                    onChange={(e) => setFeedbackFilterDate(e.target.value)}
                  />
                </div>

                <div className="mess-filter-group">
                  <Coffee size={14} color="#0284c7" />
                  <span>Meal Type:</span>
                  <select className="mess-filter-select" value={feedbackFilterMeal} onChange={(e) => setFeedbackFilterMeal(e.target.value)}>
                    <option value="ALL">All Meals</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div className="mess-filter-group">
                  <Building2 size={14} color="#64748b" />
                  <span>Hostel:</span>
                  <select className="mess-filter-select" value={feedbackFilterHostel} onChange={(e) => setFeedbackFilterHostel(e.target.value)}>
                    <option value="ALL">All Hostels</option>
                    <option value="Gandhi Boys">Gandhi Boys Residence</option>
                    <option value="Sarojini Girls">Sarojini Girls Residence</option>
                  </select>
                </div>

                <div className="mess-filter-group">
                  <Star size={14} color="#d97706" />
                  <span>Rating:</span>
                  <select className="mess-filter-select" value={feedbackFilterRating} onChange={(e) => setFeedbackFilterRating(e.target.value)}>
                    <option value="ALL">All Ratings</option>
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Critical Defect)</option>
                    <option value="LOW_ONLY">Low-Rated Only (&lt; 3★)</option>
                  </select>
                </div>

                <div className="mess-filter-group" style={{ flex: 1, minWidth: 160 }}>
                  <Search size={14} color="#64748b" />
                  <input
                    type="text"
                    className="mess-filter-select"
                    style={{ width: '100%' }}
                    placeholder="Search student, roll, comments..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                  />
                </div>

                {(feedbackFilterDate || feedbackFilterMeal !== 'ALL' || feedbackFilterHostel !== 'ALL' || feedbackFilterRating !== 'ALL' || feedbackSearch || onlyLowRated) && (
                  <button
                    type="button"
                    className="mess-btn-secondary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.74rem' }}
                    onClick={() => {
                      setFeedbackFilterDate('');
                      setFeedbackFilterMeal('ALL');
                      setFeedbackFilterHostel('ALL');
                      setFeedbackFilterRating('ALL');
                      setFeedbackSearch('');
                      setOnlyLowRated(false);
                      showToast('All feedback filters reset.');
                    }}
                  >
                    <X size={12} /> Reset Filters
                  </button>
                )}
              </div>

              {/* Feedback Table */}
              <div className="mess-table-container">
                <table className="mess-table">
                  <thead>
                    <tr>
                      <th>Student & Roll</th>
                      <th>Meal Session & Date</th>
                      <th>Ratings (Overall & Dimensions)</th>
                      <th>Portion</th>
                      <th>Student Comment & Issue</th>
                      <th>Status</th>
                      <th>Manager Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>No meal feedback matches the specified filters.</p>
                          <small>Try adjusting the date, rating tier, or meal type selection.</small>
                        </td>
                      </tr>
                    ) : (
                      filteredFeedbacks.map((fb) => {
                        const isLowRated = (Number(fb.overallRating) || 0) < 3;
                        return (
                          <tr key={fb.id} className={isLowRated ? 'mess-low-rated-row' : ''}>
                            <td>
                              <strong>{fb.studentName}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Roll: {fb.rollNumber} &bull; {fb.hostelName}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {fb.feedbackCode}
                              </div>
                            </td>
                            <td>
                              <strong>{fb.mealType}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{fb.mealDate}</div>
                              <div style={{ fontSize: '0.68rem', color: '#0284c7', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {fb.foodItems}
                              </div>
                            </td>
                            <td>
                              <div style={{ color: isLowRated ? '#dc2626' : (fb.overallRating >= 4 ? '#059669' : '#d97706'), fontWeight: 800, fontSize: '0.9rem' }}>
                                ★ {fb.overallRating} / 5
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: 2 }}>
                                <span>Taste: {fb.tasteRating || '-'}</span>
                                <span>Hygiene: {fb.hygieneRating || '-'}</span>
                                <span>Quality: {fb.qualityRating || '-'}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`mess-badge ${fb.quantity === 'Appropriate' ? 'available' : 'unavailable'}`} style={{ fontSize: '0.7rem' }}>
                                {fb.quantity || 'Appropriate'}
                              </span>
                            </td>
                            <td style={{ maxWidth: 280 }}>
                              <div style={{ fontSize: '0.8rem', color: isLowRated ? '#991b1b' : '#334155', fontWeight: isLowRated ? 600 : 400 }}>
                                {fb.comments ? `"${fb.comments}"` : 'No written comment provided.'}
                              </div>
                              {fb.correctiveAction && (
                                <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: 4 }}>
                                  <strong>Action:</strong> {fb.correctiveAction}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`mess-badge ${fb.status === 'Resolved' ? 'available' : (fb.status === 'Action Taken' ? 'inprogress' : (isLowRated ? 'unavailable' : 'pending'))}`}>
                                {fb.status}
                              </span>
                            </td>
                            <td>
                              {isLowRated ? (
                                <button
                                  type="button"
                                  className="mess-btn-investigate"
                                  onClick={() => handleOpenInvestigation(fb)}
                                >
                                  <AlertTriangle size={12} /> Investigate &amp; Take Action
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="mess-btn-review"
                                  onClick={() => handleOpenInvestigation(fb)}
                                >
                                  <Eye size={12} /> Review &amp; Respond
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
          </div>
        )}

        {/* =========================================================================
            SECTION 4: COMPLAINTS & ISSUES (REQUEST ENGINE - STEP 4)
            ========================================================================= */}
        {activeTab === 'complaints' && (
          <div className="mess-card">
            <div className="mess-card-header">
              <div>
                <h3 className="mess-card-title">
                  <AlertTriangle size={18} color="#e11d48" />
                  Food Quality Complaints &amp; Request Management Engine
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  Centralized campus grievance pipeline &bull; Tracking resolution evidence, audit notes, and student push notifications.
                </div>
              </div>

              {/* Status Summary Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="mess-badge unavailable" title="Pending Action">
                  {complaintsList.filter(c => c.status === 'Pending').length} Pending
                </span>
                <span className="mess-badge inprogress" title="In Progress">
                  {complaintsList.filter(c => c.status === 'In Progress').length} In Progress
                </span>
                <span className="mess-badge available" title="Resolved">
                  {complaintsList.filter(c => c.status === 'Resolved').length} Resolved
                </span>
                <span className="mess-badge special" title="Reopened Tickets">
                  {complaintsList.filter(c => c.status === 'Reopened').length} Reopened
                </span>
              </div>
            </div>

            <div className="mess-card-body">
              {/* Multi-Dimensional Complaints Filters Bar */}
              <div className="mess-filter-bar" style={{ padding: '0.75rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <div className="mess-filter-group">
                  <Filter size={14} color="#0284c7" />
                  <span>Status:</span>
                  <select className="mess-filter-select" value={complaintFilterStatus} onChange={(e) => setComplaintFilterStatus(e.target.value)}>
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Reopened">Reopened</option>
                  </select>
                </div>

                <div className="mess-filter-group">
                  <AlertCircle size={14} color="#e11d48" />
                  <span>Category:</span>
                  <select className="mess-filter-select" value={complaintFilterCategory} onChange={(e) => setComplaintFilterCategory(e.target.value)}>
                    <option value="ALL">All Categories</option>
                    {MESS_COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mess-filter-group">
                  <Building2 size={14} color="#64748b" />
                  <span>Hostel:</span>
                  <select className="mess-filter-select" value={complaintFilterHostel} onChange={(e) => setComplaintFilterHostel(e.target.value)}>
                    <option value="ALL">All Hostels</option>
                    <option value="Gandhi Boys">Gandhi Boys Residence</option>
                    <option value="Sarojini Girls">Sarojini Girls Residence</option>
                  </select>
                </div>

                <div className="mess-filter-group">
                  <Coffee size={14} color="#0284c7" />
                  <span>Meal:</span>
                  <select className="mess-filter-select" value={complaintFilterMeal} onChange={(e) => setComplaintFilterMeal(e.target.value)}>
                    <option value="ALL">All Meals</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Evening Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div className="mess-filter-group" style={{ flex: 1, minWidth: 160 }}>
                  <Search size={14} color="#64748b" />
                  <input
                    type="text"
                    className="mess-filter-select"
                    style={{ width: '100%' }}
                    placeholder="Search ticket ID, student, issue..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                  />
                </div>

                {(complaintFilterStatus !== 'ALL' || complaintFilterCategory !== 'ALL' || complaintFilterHostel !== 'ALL' || complaintFilterMeal !== 'ALL' || complaintSearch) && (
                  <button
                    type="button"
                    className="mess-btn-secondary"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.74rem' }}
                    onClick={() => {
                      setComplaintFilterStatus('ALL');
                      setComplaintFilterCategory('ALL');
                      setComplaintFilterHostel('ALL');
                      setComplaintFilterMeal('ALL');
                      setComplaintSearch('');
                      showToast('Complaint filters reset.');
                    }}
                  >
                    <X size={12} /> Reset Filters
                  </button>
                )}
              </div>

              {/* Complaints Data Table */}
              <div className="mess-table-container">
                <table className="mess-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Complainant &amp; Room</th>
                      <th>Meal Session</th>
                      <th>Category &amp; Grievance Title</th>
                      <th>Status</th>
                      <th>Resolution Summary</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>No complaints match the specified search parameters.</p>
                          <small>All food quality tickets in this category have been processed or cleared.</small>
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((c) => {
                        const isReopened = c.status === 'Reopened';
                        return (
                          <tr key={c.id} style={{ background: isReopened ? '#fff1f2' : 'transparent' }}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{c.trackingId}</strong>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : 'Recent'}
                              </div>
                            </td>
                            <td>
                              <strong>{c.studentName}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Roll: {c.rollNumber} &bull; Room {c.roomNumber || '-'} ({c.hostelName})
                              </div>
                            </td>
                            <td>
                              <strong>{c.mealType}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.mealDate}</div>
                            </td>
                            <td style={{ maxWidth: 280 }}>
                              <div style={{ display: 'inline-block', marginBottom: 2 }}>
                                <span className="mess-badge special" style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                                  {c.category}
                                </span>
                              </div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>
                                {c.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.description}
                              </div>
                              {c.attachmentUrl && (
                                <div style={{ fontSize: '0.7rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <Camera size={11} /> 📷 Evidence Photo Attached
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`mess-badge ${
                                c.status === 'Resolved' ? 'available' :
                                (c.status === 'In Progress' ? 'inprogress' :
                                (c.status === 'Reopened' ? 'unavailable' : 'pending'))
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ maxWidth: 220 }}>
                              {c.status === 'Resolved' ? (
                                <div style={{ fontSize: '0.76rem', color: '#059669' }}>
                                  <strong>✓ {c.resolutionNote || 'Kitchen action verified.'}</strong>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Pending manager resolution</span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="mess-btn-investigate"
                                style={{
                                  background: c.status === 'Resolved' ? '#0284c7' : '#e11d48',
                                  padding: '0.3rem 0.65rem',
                                  fontSize: '0.74rem',
                                }}
                                onClick={() => handleOpenComplaintModal(c)}
                              >
                                <Eye size={12} /> Inspect Ticket
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 5: MEAL COUNT / ATTENDANCE (STEP 5)
            ========================================================================= */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header & Date Controls Card */}
            <div className="mess-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 className="mess-card-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                    <Users size={20} color="#059669" />
                    Daily Meal Count &amp; Dining Attendance Telemetry
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    4-Meal Resident Expectations, Student Skip Opt-Outs &amp; Counter Headcounts (Fretbox PS07)
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Calendar size={15} color="#2563eb" />
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Date:</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', outline: 'none' }}
                    />
                  </div>
                  <button
                    className="mess-btn-secondary"
                    onClick={() => {
                      setDeadlinesForm(skipDeadlines);
                      setIsDeadlinesModalOpen(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                  >
                    <Clock size={14} color="#0284c7" /> Configure Skip Deadlines
                  </button>
                  <button
                    className="mess-btn-secondary"
                    onClick={handleExportAttendanceCsv}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              {/* 4 Summary Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem', marginTop: '1.25rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.9rem' }}>
                  <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled Boarders</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    {mealAttendanceTelemetry?.totalResidents || 520}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '2px' }}>Assigned Hostels Total</div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.9rem' }}>
                  <div style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Outstation Leaves</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                    {mealAttendanceTelemetry?.approvedLeavesCount || 12}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', marginTop: '2px' }}>Approved Warden Leaves</div>
                </div>

                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.9rem' }}>
                  <div style={{ fontSize: '0.74rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>Student Skips Registered</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                    {mealAttendanceTelemetry?.allSkipsForDate?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#991b1b', marginTop: '2px' }}>Opt-out Declarations Today</div>
                </div>

                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '0.9rem' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>Actual Meals Served</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                    {totalMealsServedToday}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6b21a8', marginTop: '2px' }}>Recorded Plate Headcount</div>
                </div>
              </div>

              {/* Explanatory Notice */}
              <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '0.65rem 0.85rem', borderRadius: '6px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={16} color="#0284c7" />
                <span style={{ fontSize: '0.78rem', color: '#334155' }}>
                  <strong>Fretbox PS07 Rule:</strong> Expected Headcount is calculated as <code>[Enrolled Boarders - (Sanctioned Leaves + Student Skip Opt-Outs)]</code>. Expected count is strictly separated from actual attendance.
                </span>
              </div>
            </div>

            {/* 4-Meal Telemetry Matrix Table */}
            <div className="mess-card">
              <div className="mess-card-header">
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Session Telemetry Matrix ({attendanceDate})
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Live synchronized with Central Kitchen counters</span>
              </div>

              <div className="mess-card-body">
                <div className="mess-table-container">
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Meal Session</th>
                        <th>Cutoff Deadline</th>
                        <th>Enrolled Boarders</th>
                        <th>Approved Leaves</th>
                        <th>Skip Opt-Outs</th>
                        <th>Expected Headcount</th>
                        <th>Actual Served</th>
                        <th>Turnout Ratio</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'].map((meal) => {
                        const data = mealAttendanceTelemetry?.meals?.[meal] || {};
                        return (
                          <tr key={meal}>
                            <td>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{meal}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {meal === 'Breakfast' ? '07:30 - 09:30 AM' : (meal === 'Lunch' ? '12:30 - 02:30 PM' : (meal === 'Evening Snacks' ? '05:00 - 06:15 PM' : '08:00 - 10:00 PM'))}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: data.isDeadlinePassed ? '#64748b' : '#0284c7' }}>
                                <Clock size={12} /> {data.deadline || '-'}
                                {data.isDeadlinePassed ? (
                                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>(Passed)</span>
                                ) : (
                                  <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>(Active)</span>
                                )}
                              </div>
                            </td>
                            <td>{data.totalResidents || 520}</td>
                            <td><span style={{ color: '#2563eb', fontWeight: 600 }}>{data.approvedLeaves || 12} Leaves</span></td>
                            <td>
                              <span style={{ color: '#dc2626', fontWeight: 700, background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                                {data.skippedCount || 0} Skips
                              </span>
                            </td>
                            <td>
                              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                                {data.expectedCount}
                              </strong>
                            </td>
                            <td>
                              {data.actualServed > 0 ? (
                                <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{data.actualServed}</strong>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not recorded</span>
                              )}
                            </td>
                            <td>
                              {data.turnoutRatio !== '-' ? (
                                <span style={{ fontWeight: 700, color: '#0284c7' }}>{data.turnoutRatio}</span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>-</span>
                              )}
                            </td>
                            <td>
                              <span className={`mess-badge ${
                                data.status === 'Completed' ? 'available' : (data.status === 'In Service' ? 'inprogress' : 'pending')
                              }`}>
                                {data.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="mess-btn-secondary"
                                onClick={() => setActualServedModal({ isOpen: true, mealType: meal, count: data.actualServed || '' })}
                                style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Edit2 size={11} /> {data.actualServed > 0 ? 'Edit Count' : 'Record Count'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Student Skip Opt-Outs Ledger */}
            <div className="mess-card">
              <div className="mess-card-header">
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Student Skip Opt-Outs Register ({filteredSkips.length})
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    Individual student declarations submitted before cutoff deadlines
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className="mess-input"
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                    value={skipMealFilter}
                    onChange={(e) => setSkipMealFilter(e.target.value)}
                  >
                    <option value="ALL">All Meals</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Evening Snacks">Evening Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search student or roll..."
                    className="mess-input"
                    style={{ fontSize: '0.78rem', padding: '4px 8px', width: 160 }}
                    value={skipSearchQuery}
                    onChange={(e) => setSkipSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="mess-card-body">
                <div className="mess-table-container">
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Hostel &amp; Room</th>
                        <th>Skipped Meal(s)</th>
                        <th>Opt-Out Reason</th>
                        <th>Logged At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSkips.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                            No student skip requests registered for {attendanceDate}.
                          </td>
                        </tr>
                      ) : (
                        filteredSkips.map((skip) => (
                          <tr key={skip.id}>
                            <td><strong>{skip.studentName}</strong></td>
                            <td style={{ color: '#2563eb', fontWeight: 600 }}>{skip.rollNumber}</td>
                            <td>{skip.hostelName} &bull; Room {skip.roomNumber || '-'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {(skip.skippedMeals || []).map((m) => (
                                  <span
                                    key={m}
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: '#fee2e2',
                                      color: '#991b1b',
                                      border: '1px solid #fecaca',
                                    }}
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: 260 }}>
                              {skip.reason || 'Personal preference'}
                            </td>
                            <td style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {skip.submittedAt ? new Date(skip.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Before Cutoff'}
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
            SECTION 6: NOTICES (STEP 6)
            ========================================================================= */}
        {activeTab === 'notices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Metric Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Active Circulars</span>
                  <div className="mess-kpi-icon blue"><Bell size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#2563eb' }}>{noticeStats.active}</div>
                <div className="mess-kpi-sub">Out of {noticeStats.total} total notices</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Urgent &amp; High Priority</span>
                  <div className="mess-kpi-icon rose"><AlertTriangle size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: noticeStats.urgent > 0 ? '#dc2626' : '#64748b' }}>
                  {noticeStats.urgent}
                </div>
                <div className="mess-kpi-sub">Student dining dashboard alerts</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Total Student Reads</span>
                  <div className="mess-kpi-icon emerald"><CheckCircle2 size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#059669' }}>{noticeStats.totalReads.toLocaleString()}</div>
                <div className="mess-kpi-sub">Verified boarder acknowledgments</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Average Boarder Reach</span>
                  <div className="mess-kpi-icon purple"><Users size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#7c3aed' }}>
                  {Math.min(100, Math.round((noticeStats.avgReadPerNotice / 520) * 100))}%
                </div>
                <div className="mess-kpi-sub">Avg {noticeStats.avgReadPerNotice} reads / 520 boarders</div>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="mess-card">
              <div className="mess-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '260px' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="mess-input"
                      placeholder="Search circulars by title or keyword..."
                      style={{ paddingLeft: '2rem', width: '100%' }}
                      value={noticeSearch}
                      onChange={(e) => setNoticeSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="mess-input"
                    value={noticeFilterCategory}
                    onChange={(e) => setNoticeFilterCategory(e.target.value)}
                    style={{ minWidth: '180px' }}
                  >
                    <option value="ALL">All Categories</option>
                    {NOTICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    className="mess-input"
                    value={noticeFilterHostel}
                    onChange={(e) => setNoticeFilterHostel(e.target.value)}
                    style={{ minWidth: '180px' }}
                  >
                    {TARGET_HOSTELS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="mess-btn-primary" onClick={() => setIsNoticeModalOpen(true)}>
                    <Plus size={14} /> Publish New Circular
                  </button>
                </div>
              </div>

              {/* Notice Cards List */}
              <div className="mess-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {noticesList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Bell size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No mess circulars found matching the filter criteria.</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>Publish an operational notice or clear current filters.</p>
                  </div>
                ) : (
                  noticesList.map((notice) => {
                    const reachPct = Math.min(100, Math.round(((notice.readCount || 0) / 520) * 100));
                    const isUrgent = notice.priority === 'URGENT';
                    const isHigh = notice.priority === 'HIGH';

                    return (
                      <div
                        key={notice.id}
                        className={`mess-notice-card ${notice.isPinned ? 'pinned' : ''} ${isUrgent ? 'urgent' : ''}`}
                      >
                        {/* Notice Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {notice.isPinned && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                                <Pin size={11} /> Pinned
                              </span>
                            )}
                            <span className="mess-badge special">{notice.category}</span>
                            <span className={`mess-notice-priority-badge ${notice.priority ? notice.priority.toLowerCase() : 'normal'}`}>
                              {notice.priority || 'NORMAL'}
                            </span>
                            <span className={`mess-badge ${notice.status === 'Active' ? 'resolved' : 'draft'}`}>
                              {notice.status}
                            </span>
                          </div>

                          {/* Quick Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              className="mess-btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem' }}
                              onClick={() => {
                                togglePinMessNotice(notice.id);
                                refreshNotices();
                                showToast(notice.isPinned ? 'Notice unpinned.' : 'Notice pinned to student top.');
                              }}
                              title={notice.isPinned ? 'Unpin notice' : 'Pin to top of student dashboard'}
                            >
                              <Pin size={12} color={notice.isPinned ? '#2563eb' : '#64748b'} />
                              <span>{notice.isPinned ? 'Unpin' : 'Pin'}</span>
                            </button>
                            <button
                              className="mess-btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem' }}
                              onClick={() => setEditingNotice({ ...notice })}
                              title="Edit notice details"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="mess-btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem' }}
                              onClick={() => {
                                publishMessNotice(
                                  { ...notice, id: `ntc-resend-${Date.now()}` },
                                  account,
                                  true
                                );
                                showToast('Push notification re-broadcasted to students.');
                              }}
                              title="Re-broadcast push notification"
                            >
                              <Send size={12} color="#059669" />
                              <span>Broadcast</span>
                            </button>
                            <button
                              className="mess-btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.74rem', color: '#dc2626' }}
                              onClick={() => {
                                if (window.confirm(`Delete circular "${notice.title}"?`)) {
                                  deleteMessNotice(notice.id);
                                  refreshNotices();
                                  showToast('Notice deleted.');
                                }
                              }}
                              title="Delete notice"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.02rem', fontWeight: 700 }}>
                            {notice.title}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.55 }}>
                            {notice.description}
                          </p>
                        </div>

                        {/* Target & Schedule Metadata */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.4rem', borderTop: '1px dashed #e2e8f0' }}>
                          <span className="mess-notice-meta-chip">
                            <Building2 size={12} /> {notice.targetHostel}
                          </span>
                          <span className="mess-notice-meta-chip">
                            <Users size={12} /> {notice.targetAudience}
                          </span>
                          <span className="mess-notice-meta-chip">
                            <Calendar size={12} /> Published: {notice.publishDate}
                          </span>
                          {notice.expiryDate && (
                            <span className="mess-notice-meta-chip" style={{ color: notice.status === 'Expired' ? '#dc2626' : '#475569' }}>
                              <Clock size={12} /> Valid till: {notice.expiryDate}
                            </span>
                          )}
                          <span className="mess-notice-meta-chip" style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#64748b' }}>
                            {notice.publishedBy || 'Mess Administration'}
                          </span>
                        </div>

                        {/* Student Read Tracking Bar */}
                        <div style={{ background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              Student Read Tracking: <strong>{notice.readCount || 0}</strong> of 520 boarders acknowledged
                            </span>
                            <span style={{ fontWeight: 700, color: reachPct >= 70 ? '#059669' : '#d97706' }}>
                              {reachPct}% Reach
                            </span>
                          </div>
                          <div className="mess-reach-progress-bar">
                            <div className="mess-reach-progress-fill" style={{ width: `${reachPct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 7: REPORTS & STATISTICS (STEP 7)
            ========================================================================= */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Filter & Export Toolbar */}
            <div className="mess-card">
              <div className="mess-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Timeframe:</span>
                    <select
                      className="mess-input"
                      value={reportTimeframe}
                      onChange={(e) => setReportTimeframe(e.target.value)}
                      style={{ minWidth: '150px' }}
                    >
                      <option value="daily">Daily (Today)</option>
                      <option value="weekly">Weekly (Last 7 Days)</option>
                      <option value="monthly">Monthly (Last 30 Days)</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  </div>

                  {reportTimeframe === 'custom' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="date"
                        className="mess-input"
                        value={reportCustomStart}
                        onChange={(e) => setReportCustomStart(e.target.value)}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>to</span>
                      <input
                        type="date"
                        className="mess-input"
                        value={reportCustomEnd}
                        onChange={(e) => setReportCustomEnd(e.target.value)}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Hostel:</span>
                    <select
                      className="mess-input"
                      value={reportHostel}
                      onChange={(e) => setReportHostel(e.target.value)}
                      style={{ minWidth: '160px' }}
                    >
                      {TARGET_HOSTELS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Session:</span>
                    <select
                      className="mess-input"
                      value={reportMealType}
                      onChange={(e) => setReportMealType(e.target.value)}
                      style={{ minWidth: '140px' }}
                    >
                      <option value="ALL">All Meals</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Evening Snacks">Evening Snacks</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                  </div>
                </div>

                {/* Export Dropdown / Action Strip */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    className="mess-btn-primary"
                    onClick={() => {
                      exportExecutiveAuditCsv(analyticsReport);
                      showToast('Full Executive Audit CSV exported.');
                    }}
                    title="Export complete institutional executive return"
                  >
                    <Download size={14} /> Full Audit (CSV)
                  </button>
                  <button
                    className="mess-btn-secondary"
                    onClick={() => {
                      exportFeedbackReportCsv(analyticsReport);
                      showToast('Feedback dataset exported to CSV.');
                    }}
                    title="Export all student feedback rows"
                  >
                    <Download size={13} /> Feedback CSV
                  </button>
                  <button
                    className="mess-btn-secondary"
                    onClick={() => {
                      exportComplaintsReportCsv(analyticsReport);
                      showToast('Complaints dataset exported to CSV.');
                    }}
                    title="Export all mess grievance rows"
                  >
                    <Download size={13} /> Grievances CSV
                  </button>
                  <button
                    className="mess-btn-secondary"
                    onClick={() => {
                      exportAttendanceReportCsv(analyticsReport);
                      showToast('Attendance telemetry exported to CSV.');
                    }}
                    title="Export 4-meal attendance headcount telemetry"
                  >
                    <Download size={13} /> Headcount CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Top 6 Executive KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Average Satisfaction</span>
                  <div className="mess-kpi-icon amber"><Star size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: analyticsReport.summary.avgOverall >= 4 ? '#d97706' : '#e11d48' }}>
                  {analyticsReport.summary.avgOverall} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 5.0</span>
                </div>
                <div className="mess-kpi-sub">Across {analyticsReport.summary.totalFeedbackCount} boarder reviews</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Total Feedback Records</span>
                  <div className="mess-kpi-icon blue"><FileText size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#2563eb' }}>
                  {analyticsReport.summary.totalFeedbackCount}
                </div>
                <div className="mess-kpi-sub">{reportTimeframe.toUpperCase()} evaluation period</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Quality &amp; Taste Index</span>
                  <div className="mess-kpi-icon emerald"><Utensils size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#059669', fontSize: '1.25rem' }}>
                  Q: {analyticsReport.summary.avgQuality}★ · T: {analyticsReport.summary.avgTaste}★
                </div>
                <div className="mess-kpi-sub">Palatability &amp; preparation metrics</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Hygiene Compliance</span>
                  <div className="mess-kpi-icon cyan"><ShieldCheck size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#0891b2' }}>
                  {analyticsReport.summary.avgHygiene} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 5.0</span>
                </div>
                <div className="mess-kpi-sub">Food safety &amp; hall cleanliness</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Grievance Resolution</span>
                  <div className="mess-kpi-icon emerald"><CheckCircle2 size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: '#059669' }}>
                  {analyticsReport.summary.resolutionRate}%
                </div>
                <div className="mess-kpi-sub">{analyticsReport.summary.resolvedComplaints} of {analyticsReport.summary.totalComplaints} tickets resolved</div>
              </div>

              <div className="mess-kpi-card">
                <div className="mess-kpi-card-header">
                  <span className="mess-kpi-label">Quality Defect Rate</span>
                  <div className="mess-kpi-icon rose"><AlertTriangle size={18} /></div>
                </div>
                <div className="mess-kpi-val" style={{ color: analyticsReport.summary.defectRate <= 10 ? '#059669' : '#dc2626' }}>
                  {analyticsReport.summary.defectRate}%
                </div>
                <div className="mess-kpi-sub">Reviews with rating &lt; 3.0 stars</div>
              </div>
            </div>

            {/* SECTION 1: Meal-Wise Performance Matrix */}
            <div className="mess-card">
              <div className="mess-card-header">
                <h3 className="mess-card-title">
                  <Clock size={18} color="#2563eb" />
                  Meal-Wise Rating Matrix &amp; Sub-Dimension Performance
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Auditing Breakfast, Lunch, Snacks, and Dinner separately
                </span>
              </div>
              <div className="mess-card-body" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Meal Session</th>
                        <th>Student Reviews</th>
                        <th>Overall Rating</th>
                        <th>Food Quality (★)</th>
                        <th>Taste Index (★)</th>
                        <th>Hygiene Compliance (★)</th>
                        <th>Operational Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsReport.mealWiseMatrix.map((m) => (
                        <tr key={m.session}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{m.session}</strong>
                          </td>
                          <td>
                            <span className="mess-badge draft">{m.reviewsCount} reviews</span>
                          </td>
                          <td>
                            <strong style={{ color: m.averageRating >= 4 ? '#d97706' : '#e11d48', fontSize: '0.96rem' }}>
                              ★ {m.averageRating.toFixed(2)}
                            </strong>
                          </td>
                          <td>{m.quality.toFixed(2)}★</td>
                          <td>{m.taste.toFixed(2)}★</td>
                          <td>{m.hygiene.toFixed(2)}★</td>
                          <td>
                            <span className={`mess-badge ${m.status === 'Satisfactory' ? 'resolved' : (m.status === 'Action Recommended' ? 'investigating' : 'urgent')}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SECTION 2: Best-Rated Meals vs. Lowest-Rated Defect Hotspots */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Best-Rated Meals */}
              <div className="mess-card">
                <div className="mess-card-header">
                  <h3 className="mess-card-title">
                    <Sparkles size={18} color="#059669" />
                    Top Student-Favorite Meals
                  </h3>
                  <span className="mess-badge resolved">Highest Rated</span>
                </div>
                <div className="mess-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analyticsReport.bestRatedMeals.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.84rem' }}>No high-rated meals found for this filter.</div>
                  ) : (
                    analyticsReport.bestRatedMeals.map((meal, idx) => (
                      <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <strong style={{ color: '#166534', fontSize: '0.92rem' }}>
                            #{idx + 1} {meal.mealType} ({meal.date})
                          </strong>
                          <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.9rem' }}>
                            ★ {meal.overallRating.toFixed(1)} / 5
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#14532d', marginBottom: '0.3rem' }}>
                          <strong>Menu:</strong> {meal.menuItems}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534', fontStyle: 'italic' }}>
                          "{meal.studentComment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lowest-Rated Meals & Defect Hotspots */}
              <div className="mess-card">
                <div className="mess-card-header">
                  <h3 className="mess-card-title">
                    <AlertTriangle size={18} color="#dc2626" />
                    Lowest-Rated Meals &amp; Defect Watchlist
                  </h3>
                  <span className="mess-badge urgent">Defect Alerts</span>
                </div>
                <div className="mess-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analyticsReport.lowestRatedMeals.length === 0 ? (
                    <div style={{ color: '#059669', fontSize: '0.84rem' }}>✓ Zero severe defect meals detected in this reporting window.</div>
                  ) : (
                    analyticsReport.lowestRatedMeals.map((meal, idx) => (
                      <div key={idx} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <strong style={{ color: '#9f1239', fontSize: '0.92rem' }}>
                            {meal.mealType} ({meal.date})
                          </strong>
                          <span style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.9rem' }}>
                            ★ {meal.overallRating.toFixed(1)} / 5
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.78rem', color: '#881337', fontStyle: 'italic' }}>
                          Defect Feedback: "{meal.studentComment}"
                        </p>
                        <div style={{ fontSize: '0.74rem', color: '#475569', borderTop: '1px dashed #fda4af', paddingTop: '0.35rem' }}>
                          <strong>Corrective Action:</strong> {meal.actionTaken}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Repeated Food Quality Defects & Cluster Analysis */}
            <div className="mess-card">
              <div className="mess-card-header">
                <h3 className="mess-card-title">
                  <Filter size={18} color="#d97706" />
                  Repeated Food Quality Defects &amp; Cluster Analysis
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Aggregating recurring issues to prevent institutional food safety failures
                </span>
              </div>
              <div className="mess-card-body" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Defect Cluster Description</th>
                        <th>Occurrence Count</th>
                        <th>Sample Meal Session</th>
                        <th>Affected Dining Hall</th>
                        <th>Last Detected Date</th>
                        <th>Remedial Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsReport.repeatedDefects.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            ✓ No recurring food quality defect clusters identified in this reporting range.
                          </td>
                        </tr>
                      ) : (
                        analyticsReport.repeatedDefects.map((def, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{def.defectTitle}</strong>
                              {def.sampleComment && (
                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                  e.g. "{def.sampleComment}"
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="mess-badge urgent">
                                {def.occurrences} {def.occurrences === 1 ? 'Report' : 'Reports'}
                              </span>
                            </td>
                            <td>{def.sampleMeal}</td>
                            <td>{def.affectedHostel}</td>
                            <td>{def.lastReportedDate}</td>
                            <td>
                              <span className={`mess-badge ${def.remedialStatus.includes('Logged') ? 'resolved' : 'investigating'}`}>
                                {def.remedialStatus}
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

            {/* SECTION 4: Headcount Attendance vs Plate Consumption Variance */}
            <div className="mess-card">
              <div className="mess-card-header">
                <h3 className="mess-card-title">
                  <Users size={18} color="#059669" />
                  Dining Turnout, Expected Headcount &amp; Kitchen Consumption Telemetry ({analyticsReport.endDate})
                </h3>
                <button
                  className="mess-btn-secondary"
                  onClick={() => {
                    exportAttendanceReportCsv(analyticsReport);
                    showToast('Attendance report exported to CSV.');
                  }}
                >
                  <Download size={13} /> Export Headcount Audit
                </button>
              </div>
              <div className="mess-card-body" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Meal Session</th>
                        <th>Service Timing</th>
                        <th>Total Boarders</th>
                        <th>Outstation Leaves</th>
                        <th>Student Skips</th>
                        <th>Expected Headcount</th>
                        <th>Actual Plates Served</th>
                        <th>Turnout Ratio</th>
                        <th>Headcount Variance</th>
                        <th>Operational Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsReport.attendanceTelemetry.sessions.map((sess) => {
                        const variance = sess.actualServed !== null ? sess.actualServed - sess.expectedCount : null;

                        return (
                          <tr key={sess.mealType}>
                            <td><strong>{sess.mealType}</strong></td>
                            <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{sess.timing}</td>
                            <td>{sess.totalResidents}</td>
                            <td style={{ color: '#ea580c' }}>{sess.approvedLeaves}</td>
                            <td style={{ color: '#e11d48' }}>{sess.skippedCount}</td>
                            <td><strong style={{ color: '#2563eb' }}>{sess.expectedCount}</strong></td>
                            <td><strong>{sess.actualServed !== null ? sess.actualServed : 'Pending'}</strong></td>
                            <td>
                              <span className="mess-badge active">{sess.turnoutRatio}</span>
                            </td>
                            <td>
                              {variance !== null ? (
                                <span style={{ color: variance >= 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>
                                  {variance > 0 ? `+${variance}` : variance} plates
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td>
                              <span className={`mess-badge ${sess.status === 'Completed' ? 'resolved' : (sess.status === 'In Service' ? 'active' : 'draft')}`}>
                                {sess.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: FEEDBACK INVESTIGATION & CORRECTIVE ACTION (STEP 3)
          ========================================================================= */}
      {investigationModal.isOpen && investigationModal.feedback && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setInvestigationModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: 620,
              width: '100%',
              padding: '1.5rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 45px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={18} color="#d97706" />
                  Investigate Feedback &amp; Record Kitchen Action
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  Tracking Code: <strong>{investigationModal.feedback.feedbackCode}</strong> &bull; Submitted {investigationModal.feedback.createdAt ? new Date(investigationModal.feedback.createdAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setInvestigationModal((prev) => ({ ...prev, isOpen: false }))}
              >
                <X size={18} />
              </button>
            </div>

            {/* Student & Meal Defect Box */}
            <div className="mess-investigation-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{investigationModal.feedback.studentName}</strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 6 }}>
                    (Roll: {investigationModal.feedback.rollNumber}) &bull; {investigationModal.feedback.hostelName}
                  </span>
                </div>
                <span className={`mess-badge ${(investigationModal.feedback.overallRating || 0) < 3 ? 'unavailable' : 'available'}`}>
                  ★ {investigationModal.feedback.overallRating} / 5 Overall
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem' }}>
                <strong>Session:</strong> {investigationModal.feedback.mealType} on {investigationModal.feedback.mealDate}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#0284c7', marginBottom: '0.6rem' }}>
                <strong>Items:</strong> {investigationModal.feedback.foodItems || 'Standard meal rotation'}
              </div>

              {/* Sub-ratings Breakdown */}
              <div className="mess-subrating-grid">
                <div className="mess-subrating-item">
                  <span>Taste</span>
                  <strong>★ {investigationModal.feedback.tasteRating || '-'} / 5</strong>
                </div>
                <div className="mess-subrating-item">
                  <span>Hygiene</span>
                  <strong>★ {investigationModal.feedback.hygieneRating || '-'} / 5</strong>
                </div>
                <div className="mess-subrating-item">
                  <span>Quality</span>
                  <strong>★ {investigationModal.feedback.qualityRating || '-'} / 5</strong>
                </div>
                <div className="mess-subrating-item">
                  <span>Portion</span>
                  <strong>{investigationModal.feedback.quantity || 'Appropriate'}</strong>
                </div>
              </div>

              {/* Student Comment */}
              <div style={{ marginTop: '0.75rem', background: (investigationModal.feedback.overallRating || 0) < 3 ? '#fff1f2' : '#ffffff', border: `1px solid ${(investigationModal.feedback.overallRating || 0) < 3 ? '#fecdd3' : '#e2e8f0'}`, borderRadius: 6, padding: '0.65rem 0.85rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: (investigationModal.feedback.overallRating || 0) < 3 ? '#991b1b' : '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Student Comment / Issue Report:
                </span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: (investigationModal.feedback.overallRating || 0) < 3 ? '#991b1b' : '#1e293b', fontStyle: 'italic' }}>
                  &ldquo;{investigationModal.feedback.comments || 'No written commentary provided.'}&rdquo;
                </p>
              </div>
            </div>

            {/* Investigation & Action Form */}
            <form onSubmit={handleSaveInvestigation}>
              {/* Status Selection */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Investigation Status *
                </label>
                <select
                  className="mess-input"
                  style={{ width: '100%' }}
                  value={investigationModal.status}
                  onChange={(e) => setInvestigationModal({ ...investigationModal, status: e.target.value })}
                >
                  <option value="Under Review">Under Review (Inspection in progress)</option>
                  <option value="Action Taken">Action Taken (Kitchen corrective action applied)</option>
                  <option value="Resolved">Resolved (Resolution verified & closed)</option>
                </select>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>
                  &bull; Rule: Opening this feedback does not mark it resolved. Resolution is only recorded when you submit this form.
                </div>
              </div>

              {/* Internal Notes */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Internal Investigation Notes (Mess Directorate Only)
                </label>
                <textarea
                  rows={2}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="e.g. Consulted head cook; inspected salt bin and ghee containers; checked heating tray thermometer..."
                  value={investigationModal.internalNotes}
                  onChange={(e) => setInvestigationModal({ ...investigationModal, internalNotes: e.target.value })}
                />
              </div>

              {/* Corrective Kitchen Action */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Corrective Kitchen Action Taken *
                </label>
                <textarea
                  required
                  rows={2}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="e.g. Vendor lot returned; recipe salt proportion recalibrated; kitchen shift cook retrained on dough rest time..."
                  value={investigationModal.correctiveAction}
                  onChange={(e) => setInvestigationModal({ ...investigationModal, correctiveAction: e.target.value })}
                />
              </div>

              {/* Official Response to Student */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Official Response Dispatched to Student Portal
                </label>
                <textarea
                  rows={2}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="e.g. Thank you for reporting this. The mess manager inspected the cooking batch and instructed the cook to calibrate seasoning."
                  value={investigationModal.response}
                  onChange={(e) => setInvestigationModal({ ...investigationModal, response: e.target.value })}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  onClick={() => setInvestigationModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={investigationModal.isSubmitting}
                  className="mess-btn-primary"
                  style={{ background: '#059669', borderColor: '#059669' }}
                >
                  <ShieldCheck size={14} />
                  {investigationModal.isSubmitting ? 'Saving...' : 'Record Action & Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* =========================================================================
          MODALS FOR WEEKLY MENU MANAGEMENT (STEP 2)
          ========================================================================= */}

      {/* MODAL 1: EDIT MEAL MODAL */}
      {isEditModalOpen && (
        <div className="mess-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="mess-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mess-modal-header">
              <h3 className="mess-modal-title">
                <Edit2 size={16} color="#d97706" /> Configure Meal Menu Entry
              </h3>
              <button type="button" className="mess-modal-close" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditMeal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="mess-label">Day of Week</label>
                  <input type="text" readOnly className="mess-input" style={{ width: '100%', background: '#f8fafc' }} value={editingMeal.day} />
                </div>
                <div>
                  <label className="mess-label">Meal Session</label>
                  <input type="text" readOnly className="mess-input" style={{ width: '100%', background: '#f8fafc', textTransform: 'capitalize' }} value={editingMeal.mealType} />
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="mess-label">Menu Items (Comma separated) *</label>
                <textarea
                  required
                  rows={2}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  value={editingMeal.items}
                  onChange={(e) => setEditingMeal({ ...editingMeal, items: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="mess-label">Service Timing</label>
                  <input type="text" className="mess-input" style={{ width: '100%' }} value={editingMeal.time} onChange={(e) => setEditingMeal({ ...editingMeal, time: e.target.value })} />
                </div>
                <div>
                  <label className="mess-label">Calories (Estimated)</label>
                  <input type="text" className="mess-input" style={{ width: '100%' }} value={editingMeal.calories} onChange={(e) => setEditingMeal({ ...editingMeal, calories: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="mess-label">Chef / Dietary Description (Optional)</label>
                <input type="text" className="mess-input" style={{ width: '100%' }} value={editingMeal.description} onChange={(e) => setEditingMeal({ ...editingMeal, description: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.65rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                  <input type="checkbox" checked={editingMeal.isSpecial} onChange={(e) => setEditingMeal({ ...editingMeal, isSpecial: e.target.checked })} />
                  <span>Mark as Special Festival / Celebration Meal</span>
                </label>
                {editingMeal.isSpecial && (
                  <input
                    type="text"
                    className="mess-input"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    placeholder="Occasion (e.g. Diwali Grand Feast)"
                    value={editingMeal.specialOccasion}
                    onChange={(e) => setEditingMeal({ ...editingMeal, specialOccasion: e.target.value })}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="mess-btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="mess-btn-primary">Save Menu Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD FESTIVAL SPECIAL MEAL */}
      {isFestivalModalOpen && (
        <div className="mess-modal-backdrop" onClick={() => setIsFestivalModalOpen(false)}>
          <div className="mess-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mess-modal-header">
              <h3 className="mess-modal-title">
                <Sparkles size={16} color="#d97706" /> Schedule Special Festival Feast
              </h3>
              <button type="button" className="mess-modal-close" onClick={() => setIsFestivalModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddFestivalMealSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="mess-label">Target Day *</label>
                  <select className="mess-input" style={{ width: '100%' }} value={festivalForm.day} onChange={(e) => setFestivalForm({ ...festivalForm, day: e.target.value })}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mess-label">Meal Session *</label>
                  <select className="mess-input" style={{ width: '100%' }} value={festivalForm.mealType} onChange={(e) => setFestivalForm({ ...festivalForm, mealType: e.target.value })}>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Evening Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="mess-label">Festival / Celebration Occasion *</label>
                <input required type="text" className="mess-input" style={{ width: '100%' }} placeholder="e.g. Durga Puja Special / New Year Banquet" value={festivalForm.occasion} onChange={(e) => setFestivalForm({ ...festivalForm, occasion: e.target.value })} />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="mess-label">Grand Feast Items *</label>
                <textarea required rows={2} className="mess-input" style={{ width: '100%', resize: 'vertical' }} value={festivalForm.items} onChange={(e) => setFestivalForm({ ...festivalForm, items: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="mess-btn-secondary" onClick={() => setIsFestivalModalOpen(false)}>Cancel</button>
                <button type="submit" className="mess-btn-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>Schedule Feast</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MARK MEAL UNAVAILABLE */}
      {unavailabilityModal.isOpen && (
        <div className="mess-modal-backdrop" onClick={() => setUnavailabilityModal({ isOpen: false, day: '', mealKey: '', reason: '' })}>
          <div className="mess-modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="mess-modal-header">
              <h3 className="mess-modal-title" style={{ color: '#dc2626' }}>
                <AlertTriangle size={16} color="#dc2626" /> Mark Meal Unavailable
              </h3>
              <button type="button" className="mess-modal-close" onClick={() => setUnavailabilityModal({ isOpen: false, day: '', mealKey: '', reason: '' })}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
              Marking <strong>{unavailabilityModal.day} {unavailabilityModal.mealKey}</strong> as unavailable. Hostellers will see this notice immediately.
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="mess-label">Reason for Unavailability *</label>
              <textarea
                required
                rows={2}
                className="mess-input"
                style={{ width: '100%', resize: 'vertical' }}
                value={unavailabilityModal.reason}
                onChange={(e) => setUnavailabilityModal({ ...unavailabilityModal, reason: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="mess-btn-secondary" onClick={() => setUnavailabilityModal({ isOpen: false, day: '', mealKey: '', reason: '' })}>Cancel</button>
              <button type="button" className="mess-btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={handleConfirmUnavailable}>Confirm Unavailable</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PREVIEW WEEKLY TIMETABLE MATRIX */}
      {isPreviewModalOpen && (
        <div className="mess-modal-backdrop" onClick={() => setIsPreviewModalOpen(false)}>
          <div className="mess-modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mess-modal-header">
              <h3 className="mess-modal-title">
                <Calendar size={18} color="#0284c7" /> Comprehensive Weekly Mess Timetable Matrix
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="mess-btn-secondary" onClick={() => {
                  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                  const rows = days.map(d => ({
                    Day: d,
                    Breakfast: weeklyMenu[d]?.breakfast?.items || '',
                    Lunch: weeklyMenu[d]?.lunch?.items || '',
                    Snacks: weeklyMenu[d]?.snacks?.items || '',
                    Dinner: weeklyMenu[d]?.dinner?.items || '',
                  }));
                  exportToCsv('Apna_Campus_Weekly_Mess_Matrix.csv', rows);
                }}>
                  <Download size={13} /> Export CSV
                </button>
                <button type="button" className="mess-modal-close" onClick={() => setIsPreviewModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
              <table className="mess-matrix-table">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Day</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Snacks</th>
                    <th>Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <tr key={day}>
                      <td className="mess-matrix-day">{day}</td>
                      <td>{weeklyMenu[day]?.breakfast?.items || '-'}</td>
                      <td>{weeklyMenu[day]?.lunch?.items || '-'}</td>
                      <td>{weeklyMenu[day]?.snacks?.items || '-'}</td>
                      <td>{weeklyMenu[day]?.dinner?.items || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: COMPLAINT INSPECTION & RESOLUTION (STEP 4)
          ========================================================================= */}
      {inspectingComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setInspectingComplaint(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: 640,
              width: '100%',
              padding: '1.5rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 45px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="#e11d48" />
                  Mess Grievance Ticket #{inspectingComplaint.trackingId}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  Filed: {inspectingComplaint.submittedAt ? new Date(inspectingComplaint.submittedAt).toLocaleString() : 'Recent'} &bull; Assigned Manager: {inspectingComplaint.assignedManager || 'Mr. Kailash Chandra Nayak'}
                </div>
              </div>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setInspectingComplaint(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Complainant & Incident Box */}
            <div className="mess-investigation-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{inspectingComplaint.studentName}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Roll: {inspectingComplaint.rollNumber} &bull; Room {inspectingComplaint.roomNumber || '-'} ({inspectingComplaint.hostelName})
                    {inspectingComplaint.studentPhone && <span> &bull; Phone: {inspectingComplaint.studentPhone}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span className="mess-badge special">{inspectingComplaint.category}</span>
                  <span className={`mess-badge ${inspectingComplaint.status === 'Resolved' ? 'available' : (inspectingComplaint.status === 'In Progress' ? 'inprogress' : 'pending')}`}>
                    {inspectingComplaint.status}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>
                <strong>Meal Session:</strong> {inspectingComplaint.mealType} on {inspectingComplaint.mealDate}
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>
                {inspectingComplaint.title}
              </div>

              <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', background: '#ffffff', padding: '0.65rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                {inspectingComplaint.description}
              </p>

              {/* Complainant Evidence Photo */}
              {inspectingComplaint.attachmentUrl && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Student Photo Evidence Attachment:
                  </div>
                  <img
                    src={inspectingComplaint.attachmentUrl}
                    alt="Defect Evidence"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}

              {/* Reopen notice if reopened */}
              {inspectingComplaint.status === 'Reopened' && inspectingComplaint.reopenReason && (
                <div style={{ marginTop: '0.75rem', background: '#fff1f2', border: '1px solid #fecdd3', padding: '0.6rem 0.8rem', borderRadius: 6, color: '#991b1b', fontSize: '0.8rem' }}>
                  <strong>Student Reopened Ticket:</strong> &ldquo;{inspectingComplaint.reopenReason}&rdquo;
                </div>
              )}
            </div>

            {/* Audit Trail & Status History */}
            {inspectingComplaint.statusHistory && inspectingComplaint.statusHistory.length > 0 && (
              <div style={{ marginBottom: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                  Grievance Resolution History &amp; Audit Trail
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {inspectingComplaint.statusHistory.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong style={{ color: '#0f172a' }}>{h.status}:</strong> {h.remarks || 'Status modified'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {h.changedBy}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manager Action Form */}
            <form onSubmit={handleSaveComplaintAction}>
              {/* Status Selector */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Update Grievance Status *
                </label>
                <select
                  className="mess-input"
                  style={{ width: '100%' }}
                  value={complaintActionForm.status}
                  onChange={(e) => setComplaintActionForm({ ...complaintActionForm, status: e.target.value })}
                >
                  <option value="Pending">Pending (Awaiting initial review)</option>
                  <option value="In Progress">In Progress (Kitchen investigation active)</option>
                  <option value="Resolved">Resolved (Corrective action implemented)</option>
                  <option value="Reopened">Reopened (Follow-up investigation)</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Internal Staff Investigation Notes (Mess Directorate Only)
                </label>
                <textarea
                  rows={2}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="e.g. Consulted head cook; inspected salt bin; checked morning bread crate expiry..."
                  value={complaintActionForm.internalNotes}
                  onChange={(e) => setComplaintActionForm({ ...complaintActionForm, internalNotes: e.target.value })}
                />
              </div>

              {/* Resolution Note (Sent to Student) */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Official Resolution Statement (Dispatched to Student) {complaintActionForm.status === 'Resolved' && '*'}
                </label>
                <textarea
                  required={complaintActionForm.status === 'Resolved'}
                  rows={2}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="e.g. Extra dough batch buffer increased; supplier warned; dispenser tray drained and cleaned..."
                  value={complaintActionForm.resolutionNote}
                  onChange={(e) => setComplaintActionForm({ ...complaintActionForm, resolutionNote: e.target.value })}
                />
              </div>

              {/* Resolution Evidence Image URL */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Resolution Photo Evidence URL (Optional proof of fix)
                </label>
                <input
                  type="url"
                  className="mess-input"
                  style={{ width: '100%' }}
                  placeholder="https://images.unsplash.com/... or uploaded photo link"
                  value={complaintActionForm.resolutionImageUrl}
                  onChange={(e) => setComplaintActionForm({ ...complaintActionForm, resolutionImageUrl: e.target.value })}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="mess-btn-secondary"
                  onClick={() => setInspectingComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={complaintActionForm.isSubmitting}
                  className="mess-btn-primary"
                  style={{
                    background: complaintActionForm.status === 'Resolved' ? '#059669' : '#0284c7',
                    borderColor: complaintActionForm.status === 'Resolved' ? '#059669' : '#0284c7',
                  }}
                >
                  <CheckCircle2 size={14} />
                  {complaintActionForm.isSubmitting ? 'Updating...' : (
                    complaintActionForm.status === 'Resolved' ? 'Mark Resolved & Notify Student' : 'Save Status & Notify'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIGURE SKIP DEADLINES (STEP 5)
          ========================================================================= */}
      {isDeadlinesModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsDeadlinesModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: 480,
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Configure Meal Skip Cutoff Deadlines</h3>
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setIsDeadlinesModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Set daily cutoff times after which students cannot modify their meal skip choices for the day.
            </p>
            <form onSubmit={handleSaveDeadlines}>
              {['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'].map((m) => (
                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{m} Cutoff:</label>
                  <input
                    type="time"
                    required
                    className="mess-input"
                    value={deadlinesForm[m] || '10:00'}
                    onChange={(e) => setDeadlinesForm({ ...deadlinesForm, [m]: e.target.value })}
                    style={{ width: 140, padding: '4px 8px', fontSize: '0.85rem' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="mess-btn-secondary" onClick={() => setIsDeadlinesModalOpen(false)}>Cancel</button>
                <button type="submit" className="mess-btn-primary">Save Cutoff Deadlines</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD ACTUAL MEALS SERVED (STEP 5)
          ========================================================================= */}
      {actualServedModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setActualServedModal({ isOpen: false, mealType: '', count: '' })}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: 420,
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                Record Actual Meals Served: {actualServedModal.mealType}
              </h3>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setActualServedModal({ isOpen: false, mealType: '', count: '' })}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveActualServed}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Actual Plates / Biometric Headcount for {attendanceDate} *
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  required
                  autoFocus
                  placeholder="e.g. 485"
                  className="mess-input"
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                  value={actualServedModal.count}
                  onChange={(e) => setActualServedModal({ ...actualServedModal, count: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="mess-btn-secondary" onClick={() => setActualServedModal({ isOpen: false, mealType: '', count: '' })}>
                  Cancel
                </button>
                <button type="submit" className="mess-btn-primary">
                  Save Actual Headcount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NOTICE (STEP 6) */}
      {isNoticeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setIsNoticeModalOpen(false)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: 560, width: '100%', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Publish Mess Operational Notice</h3>
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setIsNoticeModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              try {
                publishMessNotice(newNoticeForm, account, newNoticeForm.broadcast);
                setIsNoticeModalOpen(false);
                refreshNotices();
                showToast('✓ Mess notice published and broadcasted to students!');
                setNewNoticeForm({
                  title: '',
                  description: '',
                  category: 'Special Festival Menu',
                  priority: 'NORMAL',
                  targetHostel: 'All Hostels',
                  targetAudience: 'All Residents & Day Boarders',
                  publishDate: new Date().toISOString().slice(0, 10),
                  expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                  isPinned: false,
                  broadcast: true,
                });
              } catch (err) {
                alert(err.message || 'Failed to publish notice.');
              }
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Notice Title *</label>
                <input
                  type="text"
                  required
                  className="mess-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Dining Hall Deep Sanitation & Water Filter Renewal"
                  value={newNoticeForm.title}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Category *</label>
                  <select
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={newNoticeForm.category}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, category: e.target.value })}
                  >
                    {NOTICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Priority *</label>
                  <select
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={newNoticeForm.priority}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, priority: e.target.value })}
                  >
                    {NOTICE_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p} {p === 'URGENT' ? '(Alert Banner in Student Dashboard)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Target Hostel</label>
                  <select
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={newNoticeForm.targetHostel}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, targetHostel: e.target.value })}
                  >
                    {TARGET_HOSTELS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Target Audience</label>
                  <select
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={newNoticeForm.targetAudience}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, targetAudience: e.target.value })}
                  >
                    {TARGET_AUDIENCES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Publication Date</label>
                  <input
                    type="date"
                    required
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={newNoticeForm.publishDate}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, publishDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Expiry Date (Optional)</label>
                  <input
                    type="date"
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={newNoticeForm.expiryDate}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Notice Description &amp; Details *</label>
                <textarea
                  required
                  rows={4}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Explain meal arrangements, alternative timings, dietary guidelines, or closure reasons..."
                  value={newNoticeForm.description}
                  onChange={(e) => setNewNoticeForm({ ...newNoticeForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#1e293b', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={newNoticeForm.broadcast}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, broadcast: e.target.checked })}
                  />
                  <span>Broadcast push notification to Student Portal via notificationsStore</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#1e293b', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={newNoticeForm.isPinned}
                    onChange={(e) => setNewNoticeForm({ ...newNoticeForm, isPinned: e.target.checked })}
                  />
                  <span>Pin this circular to the top of Student Dining Section</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="mess-btn-secondary" onClick={() => setIsNoticeModalOpen(false)}>Cancel</button>
                <button type="submit" className="mess-btn-primary">
                  <Send size={14} /> Publish &amp; Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT NOTICE (STEP 6) */}
      {editingNotice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setEditingNotice(null)}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: 560, width: '100%', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Edit Mess Circular</h3>
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setEditingNotice(null)}><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              try {
                updateMessNotice(editingNotice.id, editingNotice);
                setEditingNotice(null);
                refreshNotices();
                showToast('Mess notice updated successfully.');
              } catch (err) {
                alert(err.message || 'Failed to update notice.');
              }
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Notice Title *</label>
                <input
                  type="text"
                  required
                  className="mess-input"
                  style={{ width: '100%' }}
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Category *</label>
                  <select
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={editingNotice.category}
                    onChange={(e) => setEditingNotice({ ...editingNotice, category: e.target.value })}
                  >
                    {NOTICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Priority *</label>
                  <select
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={editingNotice.priority}
                    onChange={(e) => setEditingNotice({ ...editingNotice, priority: e.target.value })}
                  >
                    {NOTICE_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Target Hostel</label>
                  <select
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={editingNotice.targetHostel}
                    onChange={(e) => setEditingNotice({ ...editingNotice, targetHostel: e.target.value })}
                  >
                    {TARGET_HOSTELS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Expiry Date</label>
                  <input
                    type="date"
                    className="mess-input"
                    style={{ width: '100%' }}
                    value={editingNotice.expiryDate || ''}
                    onChange={(e) => setEditingNotice({ ...editingNotice, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem', fontWeight: 600 }}>Notice Description *</label>
                <textarea
                  required
                  rows={4}
                  className="mess-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  value={editingNotice.description}
                  onChange={(e) => setEditingNotice({ ...editingNotice, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="mess-btn-secondary" onClick={() => setEditingNotice(null)}>Cancel</button>
                <button type="submit" className="mess-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

