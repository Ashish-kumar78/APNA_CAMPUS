import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Star,
  Coffee,
  Sun,
  Sunset,
  Moon,
  MessageSquare,
  Sparkles,
  FileText,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Send,
  X,
  AlertTriangle,
  Edit2
} from 'lucide-react';
import { mockMessMenuWeekly, mockSpecialMealRequests } from './hostelData.js';
import {
  getAllFoodFeedback,
  updateFoodFeedbackStatus,
  approveFoodFeedback,
  respondToFoodFeedback,
  addFoodFeedbackInternalNote,
  forwardFoodFeedbackToAdmin,
  getFoodFeedbackAnalytics,
  subscribeFoodFeedback,
  getWeeklyMessMenu,
  updateMealMenuItem
} from '../../services/hostelFoodStore.js';
import { getWardenIdFromAccount, getWardenPermissions, isWardenSuspended } from '../../services/wardenManagementStore.js';
import './HostelExtraSections.css';

export default function HostelMessSection({
  isHostelAdmin = false,
  wardenHostel = 'ALL',
  assignedHostel,
  currentOfficerName = 'Mr. Rajesh Jena',
  account
}) {
  const effectiveHostel = assignedHostel || wardenHostel || 'ALL';
  const wardenId = account ? getWardenIdFromAccount(account) : null;
  const [isSuspended, setIsSuspended] = useState(() => !isHostelAdmin && isWardenSuspended(currentOfficerName));
  const [permsTick, setPermsTick] = useState(0);

  useEffect(() => {
    const handleStatusSync = () => {
      setIsSuspended(!isHostelAdmin && isWardenSuspended(currentOfficerName));
      setPermsTick(t => t + 1);
    };
    window.addEventListener('bput_warden_status_changed', handleStatusSync);
    window.addEventListener('bput_warden_permissions_changed', handleStatusSync);
    window.addEventListener('storage', handleStatusSync);
    return () => {
      window.removeEventListener('bput_warden_status_changed', handleStatusSync);
      window.removeEventListener('bput_warden_permissions_changed', handleStatusSync);
      window.removeEventListener('storage', handleStatusSync);
    };
  }, [isHostelAdmin, currentOfficerName]);

  const canApprove = useMemo(() => {
    if (isHostelAdmin) return true;
    if (isSuspended) return false;
    if (!wardenId) return true;
    const perms = getWardenPermissions(wardenId);
    return perms.manageComplaints !== false && perms.approveOperationalRequests !== false;
  }, [isHostelAdmin, isSuspended, wardenId, permsTick]);

  const canEditMenu = isHostelAdmin || !isSuspended;

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'feedback' | 'analytics'
  const [toastMsg, setToastMsg] = useState(null);

  // Dynamic Weekly Mess Menu
  const [weeklyMenu, setWeeklyMenu] = useState(() => getWeeklyMessMenu());
  const [isEditingMealModalOpen, setIsEditingMealModalOpen] = useState(false);
  const [editingMealKey, setEditingMealKey] = useState('');
  const [editingMealTitle, setEditingMealTitle] = useState('');
  const [editMealForm, setEditMealForm] = useState({
    items: '',
    time: '',
    calories: ''
  });
  const [isSavingMeal, setIsSavingMeal] = useState(false);

  useEffect(() => {
    const handleMenuSync = () => {
      setWeeklyMenu(getWeeklyMessMenu());
    };
    window.addEventListener('apna_campus_mess_menu_updated', handleMenuSync);
    window.addEventListener('storage', handleMenuSync);
    return () => {
      window.removeEventListener('apna_campus_mess_menu_updated', handleMenuSync);
      window.removeEventListener('storage', handleMenuSync);
    };
  }, []);

  // Data from store
  const [feedbackList, setFeedbackList] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Modals
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);
  const [responseModalItem, setResponseModalItem] = useState(null);
  const [internalNoteModalItem, setInternalNoteModalItem] = useState(null);
  const [forwardModalItem, setForwardModalItem] = useState(null);

  // Modal form inputs
  const [responseText, setResponseText] = useState('');
  const [correctiveActionText, setCorrectiveActionText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [forwardNoteText, setForwardNoteText] = useState('');

  // Filters
  const [filterMealType, setFilterMealType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRating, setFilterRating] = useState('ALL');
  const [filterHostel, setFilterHostel] = useState(isHostelAdmin ? 'ALL' : (effectiveHostel || 'ALL'));
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadFeedbackData = () => {
    getAllFoodFeedback().then(data => {
      setFeedbackList(data);
    });
    getFoodFeedbackAnalytics().then(data => {
      setAnalytics(data);
    });
  };

  useEffect(() => {
    loadFeedbackData();
    const unsub = subscribeFoodFeedback(() => {
      loadFeedbackData();
    });
    return unsub;
  }, []);

  const currentMenu = (weeklyMenu && weeklyMenu[selectedDay]) || mockMessMenuWeekly[selectedDay] || {};

  // Live reactive analytics derived directly from student feedback + backend sync
  const effectiveAnalytics = useMemo(() => {
    const list = feedbackList;
    const totalFeedback = list.length;
    const avgRating = totalFeedback > 0 ? (list.reduce((acc, curr) => acc + (Number(curr.overallRating) || 5), 0) / totalFeedback).toFixed(1) : (analytics?.averageRating || 4.5);

    const meals = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];
    const ratingsByMeal = {};
    meals.forEach(m => {
      const subset = list.filter(f => (f.mealType || '').toLowerCase() === m.toLowerCase());
      const sum = subset.reduce((acc, curr) => acc + (Number(curr.overallRating) || 5), 0);
      ratingsByMeal[m] = {
        count: subset.length,
        avgRating: subset.length > 0 ? Number((sum / subset.length).toFixed(1)) : (analytics?.ratingsByMeal?.[m]?.avgRating || 4.5)
      };
    });

    const categoryDistribution = {};
    list.forEach(f => {
      const cat = f.category || 'Food Quality';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    const hostelWiseRatings = {};
    list.forEach(f => {
      const hName = f.hostelName || 'General Campus Dining';
      if (!hostelWiseRatings[hName]) {
        hostelWiseRatings[hName] = { count: 0, avgRating: 0 };
      }
      hostelWiseRatings[hName].count += 1;
    });
    Object.keys(hostelWiseRatings).forEach(h => {
      const subset = list.filter(f => (f.hostelName || 'General Campus Dining') === h);
      const sum = subset.reduce((acc, curr) => acc + (Number(curr.overallRating) || 5), 0);
      hostelWiseRatings[h].avgRating = Number((sum / subset.length).toFixed(1));
    });

    return {
      ...(analytics || {}),
      totalFeedback: totalFeedback || analytics?.totalFeedback || 0,
      averageRating: Number(avgRating),
      ratingsByMeal: Object.keys(ratingsByMeal).length > 0 ? ratingsByMeal : (analytics?.ratingsByMeal || {}),
      categoryDistribution: Object.keys(categoryDistribution).length > 0 ? categoryDistribution : (analytics?.categoryDistribution || {}),
      hostelWiseRatings: Object.keys(hostelWiseRatings).length > 0 ? hostelWiseRatings : (analytics?.hostelWiseRatings || {})
    };
  }, [feedbackList, analytics]);

  // Filtered feedback list
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(item => {
      if (!isHostelAdmin && effectiveHostel !== 'ALL') {
        if (!item.hostelName?.toLowerCase().includes(effectiveHostel.toLowerCase())) return false;
      }
      if (filterHostel !== 'ALL' && !item.hostelName?.toLowerCase().includes(filterHostel.toLowerCase())) return false;
      if (filterMealType !== 'ALL' && item.mealType.toLowerCase() !== filterMealType.toLowerCase()) return false;
      if (filterStatus !== 'ALL') {
        const itemStatus = (item.status || '').toLowerCase();
        const selStatus = filterStatus.toLowerCase();
        if (selStatus === 'pending' && itemStatus !== 'pending' && itemStatus !== 'submitted') return false;
        if (selStatus === 'approved' && itemStatus !== 'approved' && itemStatus !== 'resolved') return false;
        if (selStatus !== 'pending' && selStatus !== 'approved' && itemStatus !== selStatus) return false;
      }
      if (filterRating !== 'ALL' && item.overallRating !== Number(filterRating)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.feedbackCode?.toLowerCase().includes(q) ||
          item.studentName?.toLowerCase().includes(q) ||
          item.comments?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.foodItems?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [feedbackList, isHostelAdmin, effectiveHostel, filterHostel, filterMealType, filterStatus, filterRating, searchQuery]);

  // Handle Quick Approve Feedback
  const handleApproveFeedback = (item) => {
    if (isSuspended) {
      showToast('⚠️ Action blocked: Warden account is suspended.');
      return;
    }
    if (!canApprove) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }

    const officer = isHostelAdmin ? 'Hostel Administrator' : (account?.name || currentOfficerName || 'Hostel Warden');

    // 1. Instantly update table state and show toast (<1ms)
    setFeedbackList(prev => prev.map(f => (f.id === item.id || f.feedbackCode === item.feedbackCode) ? {
      ...f,
      status: 'Approved',
      response: `Approved by ${officer}. Meal quality inspected and verified with kitchen staff.`,
      respondedBy: officer,
      respondedAt: new Date().toISOString()
    } : f));
    showToast(`✓ Food Feedback #${item.feedbackCode} approved successfully!`);

    // 2. Persist in store and sync backend
    approveFoodFeedback(
      item.id,
      `Approved by ${officer}. Meal quality inspected and verified with kitchen staff.`,
      officer,
      'Regular kitchen quality inspection confirmed.'
    ).then(() => {
      loadFeedbackData();
    }).catch(err => {
      console.warn('Failed to approve feedback:', err);
    });
  };

  // Handle Response Submit (Approve & Respond)
  const handleResponseSubmit = (e) => {
    e.preventDefault();
    if (isSuspended) {
      showToast('⚠️ Action blocked: Warden account is suspended.');
      return;
    }
    if (!canApprove) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    if (!responseModalItem || !responseText.trim()) return;

    const targetItem = responseModalItem;
    const responseMsg = responseText.trim();
    const correctiveAction = correctiveActionText.trim();
    const officer = isHostelAdmin ? 'Hostel Administrator' : (account?.name || currentOfficerName);

    // 1. Instantly update table state, close modal, and show toast (<1ms)
    setFeedbackList(prev => prev.map(f => (f.id === targetItem.id || f.feedbackCode === targetItem.feedbackCode) ? {
      ...f,
      status: 'Approved',
      response: responseMsg,
      correctiveAction,
      respondedBy: officer,
      respondedAt: new Date().toISOString()
    } : f));
    setResponseModalItem(null);
    setResponseText('');
    setCorrectiveActionText('');
    showToast(`✓ Feedback #${targetItem.feedbackCode} approved and response sent to resident.`);

    // 2. Persist in store and sync backend
    approveFoodFeedback(
      targetItem.id,
      responseMsg,
      officer,
      correctiveAction
    ).then(() => {
      loadFeedbackData();
    }).catch(err => {
      console.warn('Failed to submit response:', err);
    });
  };

  // Handle Add Internal Note Submit
  const handleInternalNoteSubmit = (e) => {
    e.preventDefault();
    if (isSuspended) {
      showToast('⚠️ Action blocked: Warden account is suspended.');
      return;
    }
    if (!canApprove) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    if (!internalNoteModalItem || !internalNoteText.trim()) return;

    const targetItem = internalNoteModalItem;
    const note = internalNoteText.trim();
    const author = isHostelAdmin ? 'Hostel Administrator' : currentOfficerName;

    // 1. Instantly update table state, close modal, and show toast (<1ms)
    setFeedbackList(prev => prev.map(f => (f.id === targetItem.id || f.feedbackCode === targetItem.feedbackCode) ? {
      ...f,
      internalNotes: f.internalNotes ? `${f.internalNotes}\n[${author}]: ${note}` : `[${author}]: ${note}`
    } : f));
    setInternalNoteModalItem(null);
    setInternalNoteText('');
    showToast(`✓ Internal administrative note appended to #${targetItem.feedbackCode}`);

    // 2. Persist in store and sync backend
    addFoodFeedbackInternalNote(
      targetItem.id,
      note,
      author
    ).then(() => {
      loadFeedbackData();
    }).catch(err => {
      console.warn('Failed to add note:', err);
    });
  };

  // Handle Forward to Admin Submit
  const handleForwardSubmit = (e) => {
    e.preventDefault();
    if (isSuspended) {
      showToast('⚠️ Action blocked: Warden account is suspended.');
      return;
    }
    if (!forwardModalItem) return;

    const targetItem = forwardModalItem;
    const note = forwardNoteText.trim();

    // 1. Instantly update table state, close modal, and show toast (<1ms)
    setFeedbackList(prev => prev.map(f => (f.id === targetItem.id || f.feedbackCode === targetItem.feedbackCode) ? {
      ...f,
      status: 'Action Required',
      priority: 'High',
      internalNotes: f.internalNotes ? `${f.internalNotes}\n[FORWARDED TO ADMIN]: ${note}` : `[FORWARDED TO ADMIN]: ${note}`
    } : f));
    setForwardModalItem(null);
    setForwardNoteText('');
    showToast(`⚠️ Food issue #${targetItem.feedbackCode} forwarded to Hostel Administrator.`);

    // 2. Persist in store and sync backend
    forwardFoodFeedbackToAdmin(
      targetItem.id,
      note,
      currentOfficerName
    ).then(() => {
      loadFeedbackData();
    }).catch(err => {
      console.warn('Failed to forward issue:', err);
    });
  };

  const handleOpenEditModal = (mealKey, mealTitle, mealData) => {
    setEditingMealKey(mealKey);
    setEditingMealTitle(mealTitle);
    setEditMealForm({
      items: mealData?.items || '',
      time: mealData?.time || '',
      calories: mealData?.calories || ''
    });
    setIsEditingMealModalOpen(true);
  };

  const handleSaveMealEdit = async (e) => {
    e?.preventDefault();
    if (!editMealForm.items.trim()) {
      showToast('Please enter the menu items.');
      return;
    }
    setIsSavingMeal(true);
    try {
      const updated = await updateMealMenuItem({
        day: selectedDay,
        mealType: editingMealKey,
        items: editMealForm.items,
        time: editMealForm.time,
        calories: editMealForm.calories
      });
      setWeeklyMenu(updated);
      setIsEditingMealModalOpen(false);
      showToast(`✓ Updated ${selectedDay} ${editingMealTitle} menu successfully!`);
    } catch (err) {
      console.error('Failed to update meal menu:', err);
      showToast(`Failed to update menu: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSavingMeal(false);
    }
  };

  return (
    <div className="hostel-section-container">
      {/* Toast */}
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
          <h2><Utensils size={24} color="#2563eb" /> Mess &amp; Central Dining Management</h2>
          <p>Nutritional Diet Scheduling · Weekly Menu Roster · Student Food Quality Feedback &amp; Responses</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            <FileText size={14} /> Print Mess Chart
          </button>
        </div>
      </div>

      {/* Mess Operating Hours Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
            <Coffee size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', opacity: 0.8, textTransform: 'uppercase' }}>Breakfast Slot</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800 }}>07:30 - 09:30 AM</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
            <Sun size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', opacity: 0.8, textTransform: 'uppercase' }}>Lunch Slot</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800 }}>12:30 - 02:30 PM</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
            <Sunset size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', opacity: 0.8, textTransform: 'uppercase' }}>Evening Snacks</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800 }}>05:00 - 06:15 PM</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
            <Moon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', opacity: 0.8, textTransform: 'uppercase' }}>Dinner Slot</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800 }}>08:00 - 10:00 PM</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hostel-tab-pills">
        <button
          className={`hostel-tab-pill ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <Calendar size={14} /> Weekly Menu Schedule
        </button>
        <button
          className={`hostel-tab-pill ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <MessageSquare size={14} /> Student Food Quality Feedback ({filteredFeedback.length})
        </button>
        <button
          className={`hostel-tab-pill ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={14} /> Food Quality Analytics &amp; Inspections
        </button>
      </div>

      {/* TAB 1: WEEKLY MENU SCHEDULE */}
      {activeTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Day Selector */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <button
                key={day}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: selectedDay === day ? '1px solid #2563eb' : '1px solid transparent',
                  background: selectedDay === day ? '#eff6ff' : 'transparent',
                  color: selectedDay === day ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Meals for Selected Day */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Breakfast */}
            <div className="hostel-item-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#b45309' }}>
                  <Coffee size={18} /> Breakfast
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="h-badge h-badge-medium">{currentMenu.breakfast?.time || '07:30 - 09:30 AM'}</span>
                  {canEditMenu && (
                    <button
                      type="button"
                      className="h-btn-edit-meal"
                      onClick={() => handleOpenEditModal('breakfast', 'Breakfast', currentMenu.breakfast)}
                      title={`Edit ${selectedDay} Breakfast Menu`}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.breakfast?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.breakfast?.calories}</strong>
              </div>
            </div>

            {/* Lunch */}
            <div className="hostel-item-card" style={{ borderTop: '4px solid #059669' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#047857' }}>
                  <Sun size={18} /> Lunch
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="h-badge h-badge-approved">{currentMenu.lunch?.time || '12:30 - 02:30 PM'}</span>
                  {canEditMenu && (
                    <button
                      type="button"
                      className="h-btn-edit-meal"
                      onClick={() => handleOpenEditModal('lunch', 'Lunch', currentMenu.lunch)}
                      title={`Edit ${selectedDay} Lunch Menu`}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.lunch?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.lunch?.calories}</strong>
              </div>
            </div>

            {/* Evening Snacks */}
            <div className="hostel-item-card" style={{ borderTop: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#4338ca' }}>
                  <Sunset size={18} /> Evening Snacks
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="h-badge h-badge-low">{currentMenu.snacks?.time || '05:00 - 06:15 PM'}</span>
                  {canEditMenu && (
                    <button
                      type="button"
                      className="h-btn-edit-meal"
                      onClick={() => handleOpenEditModal('snacks', 'Evening Snacks', currentMenu.snacks)}
                      title={`Edit ${selectedDay} Evening Snacks Menu`}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.snacks?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.snacks?.calories}</strong>
              </div>
            </div>

            {/* Dinner */}
            <div className="hostel-item-card" style={{ borderTop: '4px solid #7c3aed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#6d28d9' }}>
                  <Moon size={18} /> Dinner
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="h-badge h-badge-leave">{currentMenu.dinner?.time || '08:00 - 10:00 PM'}</span>
                  {canEditMenu && (
                    <button
                      type="button"
                      className="h-btn-edit-meal"
                      onClick={() => handleOpenEditModal('dinner', 'Dinner', currentMenu.dinner)}
                      title={`Edit ${selectedDay} Dinner Menu`}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.dinner?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.dinner?.calories}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT FOOD FEEDBACK LIST & ACTIONS */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filters Strip */}
          <div className="hostel-filter-strip">
            <div className="hostel-search-input" style={{ flex: 1, minWidth: '220px' }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search feedback code, student name, or item..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hostel-filter-group">
              {isHostelAdmin && (
                <select
                  className="hostel-select"
                  value={filterHostel}
                  onChange={e => setFilterHostel(e.target.value)}
                >
                  <option value="ALL">All Hostels</option>
                  <option value="Gandhi Boys">Gandhi Boys Residence</option>
                  <option value="Kalam Boys">APJ Abdul Kalam Residence</option>
                  <option value="Sarojini Girls">Sarojini Girls Residence</option>
                  <option value="Kalpana Chawla">Kalpana Chawla Girls Residence</option>
                </select>
              )}

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

          {/* Feedback Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredFeedback.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                <Utensils size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                No student food feedback matches the specified filters.
              </div>
            ) : (
              filteredFeedback.map(comp => (
                <div key={comp.id} className="hostel-item-card" style={{ borderLeft: comp.priority === 'High' ? '4px solid #e11d48' : (comp.status === 'Approved' || comp.status === 'Resolved' ? '4px solid #10b981' : '4px solid #f59e0b') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.86rem' }}>{comp.feedbackCode}</span>
                        <span className="h-badge h-badge-medium">{comp.category} · {comp.mealType}</span>
                        <span className={`h-badge ${
                          comp.status === 'Approved' || comp.status === 'Resolved' ? 'h-badge-approved' :
                          comp.status === 'Pending' || comp.status === 'Submitted' ? 'h-badge-leave' :
                          comp.status === 'Under Review' ? 'h-badge-medium' : 'h-badge-low'
                        }`} style={
                          comp.status === 'Pending' || comp.status === 'Submitted' ? {
                            background: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700
                          } : comp.status === 'Approved' || comp.status === 'Resolved' ? {
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700
                          } : undefined
                        }>
                          {(comp.status === 'Pending' || comp.status === 'Submitted') && <Clock size={12} />}
                          {(comp.status === 'Approved' || comp.status === 'Resolved') && <CheckCircle2 size={12} />}
                          {comp.status === 'Submitted' ? 'Pending' : (comp.status === 'Resolved' ? 'Approved' : comp.status)}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        Resident: <strong>{comp.studentName}</strong> (Roll: {comp.rollNumber}) · {comp.hostelName} · Meal Date: {comp.mealDate}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star
                          key={st}
                          size={15}
                          color={st <= comp.overallRating ? '#f59e0b' : '#cbd5e1'}
                          fill={st <= comp.overallRating ? '#f59e0b' : 'none'}
                        />
                      ))}
                      <span style={{ fontWeight: 800, color: '#b45309', marginLeft: '4px', fontSize: '0.85rem' }}>{comp.overallRating}/5</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginTop: '6px' }}>
                    "{comp.comments || 'No written text provided'}"
                  </div>

                  {comp.response && (
                    <div style={{ fontSize: '0.82rem', color: '#047857', background: '#ecfdf5', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                      <strong>✓ Official Response ({comp.respondedBy || 'Warden'}):</strong> "{comp.response}"
                      {comp.correctiveAction && (
                        <div style={{ marginTop: '2px', fontStyle: 'italic', color: '#065f46' }}>
                          Action: {comp.correctiveAction}
                        </div>
                      )}
                    </div>
                  )}

                  {comp.internalNotes && (
                    <div style={{ fontSize: '0.78rem', color: '#92400e', background: '#fffbeb', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                      <strong>🔒 Internal Note:</strong> {comp.internalNotes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailModal(comp)}
                      style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInternalNoteModalItem(comp);
                        setInternalNoteText('');
                      }}
                      style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Internal Note
                    </button>

                    {comp.status !== 'Approved' && comp.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => handleApproveFeedback(comp)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#10b981',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 3px rgba(16,185,129,0.3)'
                        }}
                      >
                        <CheckCircle2 size={13} /> Approve Feedback
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setResponseModalItem(comp);
                        setResponseText(comp.response || '');
                        setCorrectiveActionText(comp.correctiveAction || '');
                      }}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Send size={12} /> {comp.status === 'Approved' || comp.status === 'Resolved' ? 'Update Response' : 'Approve & Respond'}
                    </button>

                    {!isHostelAdmin && comp.status !== 'Resolved' && comp.status !== 'Approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForwardModalItem(comp);
                          setForwardNoteText('');
                        }}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff1f2', color: '#e11d48', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Forward to Admin
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTIVE FOOD QUALITY ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Ratings by Meal */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                Average Ratings by Meal Type
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(effectiveAnalytics?.ratingsByMeal || {}).map(([meal, data]) => (
                  <div key={meal} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569' }}>{meal}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 800, color: '#b45309' }}>⭐ {data.avgRating}/5</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>({data.count} reviews)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                Feedback Category Distribution
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(effectiveAnalytics?.categoryDistribution || {}).map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569' }}>{cat}</span>
                    <span style={{ fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                      {count} logs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hostel-wise comparison */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                Hostel Dining Ratings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(effectiveAnalytics?.hostelWiseRatings || {}).map(([hostel, data]) => (
                  <div key={hostel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569' }}>{hostel}</span>
                    <span style={{ fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                      ⭐ {data.avgRating}/5
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: OFFICIAL RESPONSE & CORRECTIVE ACTION             */}
      {/* ======================================================== */}
      {responseModalItem && (
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
        }} onClick={() => setResponseModalItem(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '540px',
            width: '100%',
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
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                Official Response to #{responseModalItem.feedbackCode}
              </h4>
              <button type="button" onClick={() => setResponseModalItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResponseSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <strong>Resident Comment:</strong> "{responseModalItem.comments || 'No text'}"
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Student-Visible Response *
                </label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="e.g. Mess supervisor inspected kitchen spices and instructed cook to re-test soup temperature."
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
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Kitchen Corrective Action Record (Optional)
                </label>
                <input
                  type="text"
                  value={correctiveActionText}
                  onChange={e => setCorrectiveActionText(e.target.value)}
                  placeholder="e.g. Changed oil vendor batch #29; calibrated digital steamer."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setResponseModalItem(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Dispatch Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INTERNAL ADMINISTRATIVE NOTE                      */}
      {/* ======================================================== */}
      {internalNoteModalItem && (
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
        }} onClick={() => setInternalNoteModalItem(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
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
                  Internal Note: #{internalNoteModalItem.feedbackCode}
                </h4>
                <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>
                  🔒 Confidential — Never visible to student
                </div>
              </div>
              <button type="button" onClick={() => setInternalNoteModalItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInternalNoteSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Supervisory Note *
                </label>
                <textarea
                  rows={4}
                  value={internalNoteText}
                  onChange={e => setInternalNoteText(e.target.value)}
                  placeholder="Record internal remarks, mess vendor warnings, caterer penalty records..."
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setInternalNoteModalItem(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FORWARD TO ADMIN                                  */}
      {/* ======================================================== */}
      {forwardModalItem && (
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
        }} onClick={() => setForwardModalItem(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: '#fff1f2',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #fecdd3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#9f1239' }}>
                Forward Food Issue to Hostel Administrator
              </h4>
              <button type="button" onClick={() => setForwardModalItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleForwardSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Escalation Note for Hostel Administrator
                </label>
                <textarea
                  rows={3}
                  value={forwardNoteText}
                  onChange={e => setForwardNoteText(e.target.value)}
                  placeholder="e.g. Multiple residents reported milk freshness issues; kitchen supplier contract review recommended."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fca5a5',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setForwardModalItem(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#e11d48', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Forward Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DETAIL VIEW                                       */}
      {/* ======================================================== */}
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
            maxWidth: '580px',
            width: '100%',
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
                  Food Review Dossier: #{selectedDetailModal.feedbackCode}
                </h4>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {selectedDetailModal.hostelName} · {selectedDetailModal.mealType} · {selectedDetailModal.mealDate}
                </div>
              </div>
              <button type="button" onClick={() => setSelectedDetailModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div><strong>Resident:</strong> {selectedDetailModal.studentName} ({selectedDetailModal.rollNumber})</div>
              <div><strong>Category:</strong> {selectedDetailModal.category}</div>
              <div><strong>Overall Rating:</strong> ⭐ {selectedDetailModal.overallRating}/5</div>
              <div><strong>Quantity:</strong> {selectedDetailModal.quantity}</div>
              <div><strong>Quality:</strong> ⭐ {selectedDetailModal.qualityRating}/5 | <strong>Taste:</strong> ⭐ {selectedDetailModal.tasteRating}/5 | <strong>Hygiene:</strong> ⭐ {selectedDetailModal.hygieneRating}/5</div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong>Comment:</strong> "{selectedDetailModal.comments || 'No written comment'}"
              </div>
              {selectedDetailModal.response && (
                <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#064e3b' }}>
                  <strong>Official Response:</strong> "{selectedDetailModal.response}"
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailModal(null)}
                style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.84rem', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DAILY MESS MENU ITEM (MEAL CARD)             */}
      {/* ======================================================== */}
      {isEditingMealModalOpen && (
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
        }} onClick={() => setIsEditingMealModalOpen(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '540px',
            width: '100%',
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
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                  Edit {selectedDay} · {editingMealTitle}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Live Daily Rotational Student Mess Menu Management
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingMealModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMealEdit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Food Items & Detailed Preparation *
                </label>
                <textarea
                  rows={4}
                  value={editMealForm.items}
                  onChange={e => setEditMealForm(f => ({ ...f, items: e.target.value }))}
                  placeholder="e.g. Idli, Medu Vada, Coconut Chutney, Sambar, Boiled Egg / Banana, Tea & Coffee"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Serving Slot Time
                  </label>
                  <input
                    type="text"
                    value={editMealForm.time}
                    onChange={e => setEditMealForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="e.g. 07:30 - 09:30 AM"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Caloric Estimate
                  </label>
                  <input
                    type="text"
                    value={editMealForm.calories}
                    onChange={e => setEditMealForm(f => ({ ...f, calories: e.target.value }))}
                    placeholder="e.g. 520 kcal"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingMealModalOpen(false)}
                  disabled={isSavingMeal}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMeal}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: isSavingMeal ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isSavingMeal ? 'Saving...' : 'Save & Update Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
