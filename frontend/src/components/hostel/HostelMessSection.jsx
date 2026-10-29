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
  AlertTriangle
} from 'lucide-react';
import { mockMessMenuWeekly, mockSpecialMealRequests } from './hostelData.js';
import {
  getAllFoodFeedback,
  updateFoodFeedbackStatus,
  respondToFoodFeedback,
  addFoodFeedbackInternalNote,
  forwardFoodFeedbackToAdmin,
  getFoodFeedbackAnalytics,
  subscribeFoodFeedback
} from '../../services/hostelFoodStore.js';
import './HostelExtraSections.css';

export default function HostelMessSection({ isHostelAdmin = false, wardenHostel = 'ALL', currentOfficerName = 'Mr. Rajesh Jena' }) {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'feedback' | 'analytics'
  const [toastMsg, setToastMsg] = useState(null);

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
  const [filterHostel, setFilterHostel] = useState(isHostelAdmin ? 'ALL' : (wardenHostel || 'ALL'));
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

  const currentMenu = mockMessMenuWeekly[selectedDay];

  // Filtered feedback list
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(item => {
      if (!isHostelAdmin && wardenHostel !== 'ALL') {
        if (!item.hostelName?.toLowerCase().includes(wardenHostel.toLowerCase())) return false;
      }
      if (filterHostel !== 'ALL' && !item.hostelName?.toLowerCase().includes(filterHostel.toLowerCase())) return false;
      if (filterMealType !== 'ALL' && item.mealType.toLowerCase() !== filterMealType.toLowerCase()) return false;
      if (filterStatus !== 'ALL' && item.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterRating !== 'ALL' && item.overallRating !== Number(filterRating)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.feedbackCode?.toLowerCase().includes(q) ||
          item.studentName?.toLowerCase().includes(q) ||
          item.comments?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.foodItems?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [feedbackList, isHostelAdmin, wardenHostel, filterHostel, filterMealType, filterStatus, filterRating, searchQuery]);

  // Handle Response Submit
  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!responseModalItem || !responseText.trim()) return;

    try {
      await respondToFoodFeedback(
        responseModalItem.id,
        responseText.trim(),
        correctiveActionText.trim(),
        isHostelAdmin ? 'Hostel Administrator' : currentOfficerName
      );
      showToast(`✓ Official response submitted to resident for #${responseModalItem.feedbackCode}`);
      setResponseModalItem(null);
      setResponseText('');
      setCorrectiveActionText('');
      loadFeedbackData();
    } catch (err) {
      alert(err.message || 'Failed to submit response.');
    }
  };

  // Handle Add Internal Note Submit
  const handleInternalNoteSubmit = async (e) => {
    e.preventDefault();
    if (!internalNoteModalItem || !internalNoteText.trim()) return;

    try {
      await addFoodFeedbackInternalNote(
        internalNoteModalItem.id,
        internalNoteText.trim(),
        isHostelAdmin ? 'Hostel Administrator' : currentOfficerName
      );
      showToast(`✓ Internal administrative note appended to #${internalNoteModalItem.feedbackCode}`);
      setInternalNoteModalItem(null);
      setInternalNoteText('');
      loadFeedbackData();
    } catch (err) {
      alert(err.message || 'Failed to add note.');
    }
  };

  // Handle Forward to Admin Submit
  const handleForwardSubmit = async (e) => {
    e.preventDefault();
    if (!forwardModalItem) return;

    try {
      await forwardFoodFeedbackToAdmin(
        forwardModalItem.id,
        forwardNoteText.trim(),
        currentOfficerName
      );
      showToast(`⚠️ Food issue #${forwardModalItem.feedbackCode} forwarded to Hostel Administrator.`);
      setForwardModalItem(null);
      setForwardNoteText('');
      loadFeedbackData();
    } catch (err) {
      alert(err.message || 'Failed to forward issue.');
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
                <span className="h-badge h-badge-medium">{currentMenu.breakfast.time}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.breakfast.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.breakfast.calories}</strong>
              </div>
            </div>

            {/* Lunch */}
            <div className="hostel-item-card" style={{ borderTop: '4px solid #059669' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#047857' }}>
                  <Sun size={18} /> Lunch
                </div>
                <span className="h-badge h-badge-approved">{currentMenu.lunch.time}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.lunch.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.lunch.calories}</strong>
              </div>
            </div>

            {/* Evening Snacks */}
            <div className="hostel-item-card" style={{ borderTop: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#4338ca' }}>
                  <Sunset size={18} /> Evening Snacks
                </div>
                <span className="h-badge h-badge-low">{currentMenu.snacks.time}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.snacks.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.snacks.calories}</strong>
              </div>
            </div>

            {/* Dinner */}
            <div className="hostel-item-card" style={{ borderTop: '4px solid #7c3aed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#6d28d9' }}>
                  <Moon size={18} /> Dinner
                </div>
                <span className="h-badge h-badge-leave">{currentMenu.dinner.time}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, minHeight: '60px' }}>
                {currentMenu.dinner.items}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                Caloric estimate: <strong>{currentMenu.dinner.calories}</strong>
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

          {/* Feedback Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredFeedback.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                <Utensils size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                No student food feedback matches the specified filters.
              </div>
            ) : (
              filteredFeedback.map(comp => (
                <div key={comp.id} className="hostel-item-card" style={{ borderLeft: comp.priority === 'High' ? '4px solid #e11d48' : '4px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.86rem' }}>{comp.feedbackCode}</span>
                        <span className="h-badge h-badge-medium">{comp.category} · {comp.mealType}</span>
                        <span className={`h-badge ${comp.status === 'Resolved' ? 'h-badge-approved' : 'h-badge-low'}`}>{comp.status}</span>
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
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '4px' }}>
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

                    <button
                      type="button"
                      onClick={() => {
                        setResponseModalItem(comp);
                        setResponseText(comp.response || '');
                        setCorrectiveActionText(comp.correctiveAction || '');
                      }}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Official Response
                    </button>

                    {!isHostelAdmin && comp.status !== 'Resolved' && (
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
                {Object.entries(analytics?.ratingsByMeal || {}).map(([meal, data]) => (
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
                {Object.entries(analytics?.categoryDistribution || {}).map(([cat, count]) => (
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
                {Object.entries(analytics?.hostelWiseRatings || {}).map(([hostel, data]) => (
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
    </div>
  );
}
