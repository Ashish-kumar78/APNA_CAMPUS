import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';

export default function AdmissionCalendarTab({
  calendarEvents = [],
  onAddCalendarEvent,
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-10-30',
    category: 'Merit List',
    desc: '',
    status: 'Upcoming',
  });

  const filteredEvents = calendarEvents.filter((ev) => {
    if (categoryFilter !== 'All' && ev.category !== categoryFilter) return false;
    return true;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    onAddCalendarEvent && onAddCalendarEvent(newEvent);
    setIsAddEventOpen(false);
    setNewEvent({
      title: '',
      date: '2026-10-30',
      category: 'Merit List',
      desc: '',
      status: 'Upcoming',
    });
  };

  // Calendar view mock grid generation for October 2026
  const daysInOctober = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Institutional Admissions Master Calendar &amp; Configuration
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Academic Session 2026–2027 · Regulated deadlines for scrutiny, merit releases, counselling, and university freeze.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Chronological List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'calendar' ? '#ffffff' : 'transparent',
                color: viewMode === 'calendar' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Month Grid View
            </button>
          </div>

          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => setIsAddEventOpen(true)}
          >
            <Plus size={15} /> Add Calendar Milestone
          </button>
        </div>
      </div>

      {/* Overdue & Schedule Conflict Warnings Banner */}
      <div
        style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#9f1239',
        }}
      >
        <AlertTriangle size={20} color="#e11d48" />
        <div>
          <strong>Regulatory Timeline Warning:</strong> Round 2 Document Scrutiny closes in <strong>48 hours (28 Oct 2026, 05:00 PM)</strong>. Ensure all pending dossiers in the verification queue are certified before cutoff to prevent automatic forfeiture.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="adm-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>Filter Events:</span>
        </div>
        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Application Window">Application Window</option>
            <option value="Verification">Document Verification</option>
            <option value="Merit List">Merit List Publication</option>
            <option value="Counselling">Counselling &amp; Allotment</option>
            <option value="Fee">Fee Payment</option>
            <option value="Enrollment">Enrollment Freeze</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: CHRONOLOGICAL LIST VIEW */}
      {viewMode === 'list' && (
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <CalendarDays size={18} color="#0284c7" /> Master Institutional Timeline ({filteredEvents.length} Milestones)
              </h3>
              <p className="adm-panel-desc">Key milestones ordered chronologically for Session 2026-2027</p>
            </div>
          </div>

          <div className="adm-panel-body" style={{ padding: '20px' }}>
            <div style={{ position: 'relative', paddingLeft: '28px' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '12px',
                  bottom: '12px',
                  width: '2px',
                  background: '#e2e8f0',
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {filteredEvents.map((ev) => {
                  const isCompleted = ev.status === 'Completed';
                  const isActive = ev.status === 'Active';

                  return (
                    <div key={ev.id} style={{ position: 'relative' }}>
                      {/* Node dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '6px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: isCompleted ? '#059669' : isActive ? '#0284c7' : '#cbd5e1',
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 0 2px ' + (isCompleted ? '#bbf7d0' : isActive ? '#bae6fd' : '#e2e8f0'),
                        }}
                      />

                      <div
                        style={{
                          background: isActive ? '#f0f9ff' : '#ffffff',
                          border: isActive ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                              {ev.title}
                            </span>
                            <span className="adm-badge-pill dark">{ev.category}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0284c7' }}>
                              {ev.date}
                            </span>
                            <span
                              className={`adm-status-tag ${
                                isCompleted ? 'verified' : isActive ? 'selected' : 'under_review'
                              }`}
                            >
                              {ev.status}
                            </span>
                          </div>
                        </div>

                        <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                          {ev.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MONTH GRID VIEW */}
      {viewMode === 'calendar' && (
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <Calendar size={18} color="#0284c7" /> October 2026 · Admission Milestone Month
              </h3>
              <p className="adm-panel-desc">Visual distribution of cutoff dates and scrutiny windows</p>
            </div>
          </div>

          <div className="adm-panel-body" style={{ padding: '20px' }}>
            <div className="adm-calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="adm-cal-day-header">
                  {d}
                </div>
              ))}

              {/* October 1 2026 starts on Thursday (index 4) so 4 empty cells */}
              <div className="adm-cal-cell" style={{ background: '#f8fafc', opacity: 0.5 }}></div>
              <div className="adm-cal-cell" style={{ background: '#f8fafc', opacity: 0.5 }}></div>
              <div className="adm-cal-cell" style={{ background: '#f8fafc', opacity: 0.5 }}></div>
              <div className="adm-cal-cell" style={{ background: '#f8fafc', opacity: 0.5 }}></div>

              {daysInOctober.map((day) => {
                const dayStr = day < 10 ? `0${day}` : `${day}`;
                const fullDate = `2026-10-${dayStr}`;
                const dayEvents = calendarEvents.filter((ev) => ev.date === fullDate);
                const isToday = day === 26; // Today is Oct 26 2026

                return (
                  <div
                    key={day}
                    className={`adm-cal-cell ${isToday ? 'today' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: isToday ? 800 : 600, color: isToday ? '#0284c7' : '#0f172a' }}>
                        {day}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '1px 4px', borderRadius: '4px' }}>
                          TODAY
                        </span>
                      )}
                    </div>

                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="adm-cal-event-pill"
                        title={ev.title}
                        style={{
                          background: ev.status === 'Completed' ? '#ecfdf5' : '#eff6ff',
                          color: ev.status === 'Completed' ? '#047857' : '#0284c7',
                          border: '1px solid ' + (ev.status === 'Completed' ? '#a7f3d0' : '#bfdbfe'),
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADD CALENDAR MILESTONE MODAL */}
      {isAddEventOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddEventOpen(false)}>
          <div className="adm-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Add Institutional Calendar Milestone
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="adm-modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Milestone Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g. Round 2 Merit List Publication"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Milestone Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    >
                      <option value="Merit List">Merit List Publication</option>
                      <option value="Verification">Document Verification</option>
                      <option value="Counselling">Counselling &amp; Allotment</option>
                      <option value="Fee">Fee Payment</option>
                      <option value="Enrollment">Enrollment Cutoff</option>
                      <option value="Academic">Academic Class Start</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Detailed Directive &amp; Instructions
                  </label>
                  <textarea
                    rows={3}
                    className="adm-search-input"
                    style={{ padding: '10px', resize: 'vertical' }}
                    value={newEvent.desc}
                    onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                    placeholder="e.g. Mandatory publication on central web portal and notice board at 11:00 AM."
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsAddEventOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
