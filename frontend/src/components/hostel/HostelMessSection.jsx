import React, { useState } from 'react';
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
  Heart,
  Plus,
  RotateCcw,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  mockMessMenuWeekly,
  mockMessComplaints,
  mockSpecialMealRequests
} from './hostelData.js';
import './HostelExtraSections.css';

export default function HostelMessSection() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [complaints, setComplaints] = useState(mockMessComplaints);
  const [specialMeals, setSpecialMeals] = useState(mockSpecialMealRequests);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'special-meals' | 'feedback' | 'hours'
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const currentMenu = mockMessMenuWeekly[selectedDay];

  const handleToggleSpecialMeal = (id) => {
    setSpecialMeals(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status.includes('Serving') ? 'Completed' : 'Approved & Serving';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
    showToast(`Updated diet service status for request ${id}`);
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
          <p>Nutritional Diet Scheduling · Weekly Menu Roster · Student Feedback</p>
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
          <MessageSquare size={14} /> Food Quality Feedback ({complaints.length})
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

          {/* Mess Announcements */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
              📢 Central Mess Bulletins &amp; Hygiene Standards
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
                <strong>Weekly Caterer Inspection:</strong> FSSAI certification and spice quality audit completed by Food Inspector on 15 Oct 2026. Grade: A+.
              </div>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
                <strong>Sunday Special Feast:</strong> Chicken Dum Biryani &amp; Paneer Tikka scheduled every Sunday lunch for all registered mess residents.
              </div>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #d97706' }}>
                <strong>Wastage Reduction Campaign:</strong> Residents are requested to take only what can be consumed. Daily food waste is weighed and published on mess boards.
              </div>
            </div>
          </div>
        </div>
      )}


      {/* TAB 3: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map(comp => (
            <div key={comp.id} className="hostel-item-card" style={{ borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{comp.category} · {comp.meal}</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Submitted by {comp.studentName} ({comp.rollNumber}) on {comp.date}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(st => (
                    <Star
                      key={st}
                      size={14}
                      color={st <= comp.rating ? '#f59e0b' : '#cbd5e1'}
                      fill={st <= comp.rating ? '#f59e0b' : 'none'}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                "{comp.comment}"
              </div>
              <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                ✓ Warden Redressal: {comp.wardenNote}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
