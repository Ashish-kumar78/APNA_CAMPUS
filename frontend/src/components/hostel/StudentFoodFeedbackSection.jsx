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
  X
} from 'lucide-react';
import {
  getDailyMessMenu,
  getStudentFoodFeedback,
  submitFoodFeedback,
  subscribeFoodFeedback
} from '../../services/hostelFoodStore.js';
import { getActiveStudent } from '../../services/studentStore.js';
import './HostelExtraSections.css';

export default function StudentFoodFeedbackSection() {
  const activeStudent = getActiveStudent();
  const studentRoll = activeStudent?.rollNumber || '2305200001';
  const studentName = activeStudent?.name || 'Rakesh Das';
  const studentHostel = activeStudent?.hostelName || 'Sarojini Girls Residence (Block A)';

  const [activeMainTab, setActiveMainTab] = useState('menu'); // 'menu' | 'feedback'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyMenu, setDailyMenu] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);

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

  // Load feedback list
  const refreshFeedback = () => {
    getStudentFoodFeedback(studentRoll).then(list => {
      setFeedbackList(list);
    });
  };

  useEffect(() => {
    refreshFeedback();
    const unsub = subscribeFoodFeedback(() => {
      refreshFeedback();
    });
    return unsub;
  }, [studentRoll]);

  // Food items derived from menu for the selected form date and meal type
  const formFoodItems = useMemo(() => {
    if (!dailyMenu?.meals) return 'Standard Institutional Meal';
    const mealKey = formMealType === 'Evening Snacks' ? 'snacks' : formMealType.toLowerCase();
    return dailyMenu.meals[mealKey]?.items || 'Standard Institutional Meal';
  }, [dailyMenu, formMealType]);

  // Metric summaries
  const totalSubmitted = feedbackList.length;
  const pendingFeedback = feedbackList.filter(f => f.status !== 'Resolved').length;
  const avgStudentRating = totalSubmitted > 0
    ? (feedbackList.reduce((acc, curr) => acc + curr.overallRating, 0) / totalSubmitted).toFixed(1)
    : '4.8';

  // Filtered History
  const filteredHistory = useMemo(() => {
    return feedbackList.filter(f => {
      if (filterMealType !== 'ALL' && f.mealType.toLowerCase() !== filterMealType.toLowerCase()) return false;
      if (filterStatus !== 'ALL' && f.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterRating !== 'ALL' && f.overallRating !== Number(filterRating)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          f.feedbackCode?.toLowerCase().includes(q) ||
          f.comments?.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q) ||
          f.foodItems?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [feedbackList, filterMealType, filterStatus, filterRating, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split('T')[0];
    if (formMealDate > todayStr) {
      alert('Feedback can only be submitted for meals that have already been served (today or earlier).');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitFoodFeedback({
        studentId: activeStudent?.id || 'std-active',
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
        comments
      });

      showToast(`✓ Food Feedback #${created.feedbackCode} submitted to Hostel Warden.`);
      setComments('');
      refreshFeedback();
    } catch (err) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Clock size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{pendingFeedback}</span>
            <span className="hostel-kpi-title">Pending Feedback</span>
            <span className="hostel-kpi-subtitle">Awaiting Warden Review</span>
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
          <MessageSquare size={15} /> Submit Feedback &amp; Feedback History ({feedbackList.length})
        </button>
      </div>

      {/* TAB 1: DAILY FOOD MENU */}
      {activeMainTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Date Selector Strip */}
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
              <Calendar size={18} color="#2563eb" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                  {dailyMenu?.day} Menu ({dailyMenu?.date})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Hostel Central Kitchen: {studentHostel}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
              />
            </div>
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
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                {dailyMenu?.meals?.breakfast?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Caloric value: <strong>{dailyMenu?.meals?.breakfast?.calories || '520 kcal'}</strong></span>
                <span style={{ color: '#059669', fontWeight: 700 }}>Nutritionally Balanced</span>
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
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                {dailyMenu?.meals?.lunch?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Caloric value: <strong>{dailyMenu?.meals?.lunch?.calories || '820 kcal'}</strong></span>
                <span style={{ color: '#059669', fontWeight: 700 }}>High Protein</span>
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
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                {dailyMenu?.meals?.snacks?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Caloric value: <strong>{dailyMenu?.meals?.snacks?.calories || '340 kcal'}</strong></span>
                <span style={{ color: '#4338ca', fontWeight: 700 }}>Hot Beverages</span>
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
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '65px' }}>
                {dailyMenu?.meals?.dinner?.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Caloric value: <strong>{dailyMenu?.meals?.dinner?.calories || '750 kcal'}</strong></span>
                <span style={{ color: '#7c3aed', fontWeight: 700 }}>Dessert Included</span>
              </div>
            </div>
          </div>
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
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Action Required">Action Required</option>
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
                              item.status === 'Resolved' ? 'h-badge-approved' :
                              item.status === 'Under Review' ? 'h-badge-medium' :
                              item.status === 'Action Required' ? 'h-badge-leave' : 'h-badge-low'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ maxWidth: '200px', fontSize: '0.8rem' }}>
                            {item.response ? (
                              <span style={{ color: '#059669', fontWeight: 700 }}>
                                ✓ Responded by {item.respondedBy || 'Warden'}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Response</span>
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
    </div>
  );
}
