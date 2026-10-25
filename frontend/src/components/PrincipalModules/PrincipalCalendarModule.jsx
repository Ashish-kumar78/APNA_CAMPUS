import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Sparkles
} from 'lucide-react';
import { INITIAL_INSTITUTIONAL_EVENTS } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalCalendarModule({ onToast }) {
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_principal_events');
      return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONAL_EVENTS;
    } catch {
      return INITIAL_INSTITUTIONAL_EVENTS;
    }
  });

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('2026-11'); // Nov 2026

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [eventDetailModal, setEventDetailModal] = useState(null);

  const persistEvents = (updated) => {
    setEvents(updated);
    try {
      localStorage.setItem('apna_principal_events', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchCat = categoryFilter === 'All' || ev.category === categoryFilter;
      return matchCat;
    });
  }, [events, categoryFilter]);

  // Handle Create Event
  const handleCreateEvent = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value.trim();
    const category = form.category.value;
    const date = form.date.value;
    const time = form.time.value.trim();
    const venue = form.venue.value.trim();
    const department = form.department.value.trim();
    const description = form.description.value.trim();

    if (!title || !date) {
      if (onToast) onToast('Please enter an event title and scheduled date.');
      return;
    }

    const newEvt = {
      id: `EVT-${Math.floor(10 + Math.random() * 90)}`,
      title,
      category,
      date,
      time: time || '10:00 AM - 01:00 PM',
      venue: venue || 'Campus Main Auditorium',
      department: department || 'Office of the Principal',
      status: 'Confirmed',
      description: description || 'Mandatory institutional event approved by Principal Secretariat.',
    };

    const updated = [newEvt, ...events];
    persistEvents(updated);
    setCreateModal(false);
    if (onToast) onToast(`Event "${title}" added to Institutional Calendar!`);
  };

  // Simple Month Matrix for November 2026 (Starts on Sunday Nov 1, 30 days)
  const novemberDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const getEventsForDay = (dayNum) => {
    const formatted = `2026-11-${String(dayNum).padStart(2, '0')}`;
    return events.filter((e) => e.date === formatted);
  };

  return (
    <div className="principal-module-container">
      {/* Notice Banner */}
      <div className="principal-banner-notice">
        <div className="principal-banner-text">
          <CalendarDays size={18} color="#0284c7" />
          <span>
            <strong>Official Institutional Academic Calendar:</strong> Autonomous semester milestones, examinations, Board of Governors sessions, conferences, and holidays.
          </span>
        </div>
        <div className="principal-banner-badge">Academic Year 2026–27</div>
      </div>

      {/* KPI Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Scheduled Institutional Events</span>
            <CalendarIcon size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val">{events.length} Events</div>
          <div className="principal-stat-box-sub">Across Autumn 2026 Semester</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Autonomous Examinations</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>
            {events.filter((e) => e.category === 'Examination').length} Milestones
          </div>
          <div className="principal-stat-box-sub">Theory &amp; Practical Evaluations</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Executive Governance</span>
            <Building2 size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">
            {events.filter((e) => e.category === 'Governance').length} Meetings
          </div>
          <div className="principal-stat-box-sub">Governing Board &amp; IQAC Sessions</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Conferences &amp; Placement</span>
            <Sparkles size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#d97706' }}>
            {events.filter((e) => e.category === 'Seminar/Workshop' || e.category === 'Placement').length} Events
          </div>
          <div className="principal-stat-box-sub">National Symposiums &amp; Drives</div>
        </div>
      </div>

      {/* Toolbar: View Switch, Filter, New Event */}
      <div className="principal-toolbar">
        <div className="principal-toolbar-left">
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
            <button
              className={`erp-btn ${viewMode === 'list' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', border: 'none' }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} /> List View
            </button>
            <button
              className={`erp-btn ${viewMode === 'calendar' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', border: 'none' }}
              onClick={() => setViewMode('calendar')}
            >
              <Grid size={14} /> Monthly Matrix
            </button>
          </div>

          <select
            className="principal-select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Event Categories</option>
            <option value="Examination">Examinations</option>
            <option value="Governance">Senate &amp; Governance</option>
            <option value="Seminar/Workshop">Seminars &amp; Conferences</option>
            <option value="Placement">Campus Placements</option>
            <option value="Holiday">Institutional Holidays</option>
          </select>
        </div>

        <div className="principal-toolbar-right">
          <button className="erp-btn erp-btn-primary" onClick={() => setCreateModal(true)}>
            <Plus size={15} /> Schedule Institutional Event
          </button>
        </div>
      </div>

      {/* VIEW 1: LIST / AGENDA VIEW */}
      {viewMode === 'list' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Upcoming Institutional Milestones &amp; Events</h3>
              <p>Chronological agenda across academic, administrative, and statutory domains</p>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {filteredEvents.length} Events on Schedule
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.5rem 0.85rem',
                      textAlign: 'center',
                      minWidth: '70px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                      {new Date(evt.date).getDate()}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 2 }}>
                      <span
                        className={`pbadge ${
                          evt.category === 'Examination'
                            ? 'danger'
                            : evt.category === 'Governance'
                            ? 'info'
                            : evt.category === 'Placement'
                            ? 'success'
                            : evt.category === 'Holiday'
                            ? 'warning'
                            : 'purple'
                        }`}
                      >
                        {evt.category}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Ref: {evt.id}</span>
                    </div>
                    <h4 style={{ margin: '2px 0 4px', fontSize: '0.98rem', color: '#0f172a' }}>{evt.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color="#0284c7" /> {evt.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} color="#10b981" /> {evt.venue}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={13} color="#8b5cf6" /> {evt.department}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    className="erp-btn erp-btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                    onClick={() => setEventDetailModal(evt)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CALENDAR MATRIX (November 2026) */}
      {viewMode === 'calendar' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Monthly Institutional Schedule: November 2026</h3>
              <p>Autonomous examination dates, academic deadlines, and campus meetings</p>
            </div>
          </div>

          <div className="p-calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-calendar-day-header">{d}</div>
            ))}

            {novemberDays.map((dayNum) => {
              const dayEvents = getEventsForDay(dayNum);
              return (
                <div key={dayNum} className={`p-calendar-cell ${dayEvents.length > 0 ? 'has-event' : ''}`}>
                  <span className="p-calendar-cell-num">{dayNum}</span>
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-calendar-event-tag ${
                        ev.category === 'Examination'
                          ? 'exam'
                          : ev.category === 'Governance'
                          ? 'gov'
                          : ev.category === 'Placement'
                          ? 'place'
                          : ev.category === 'Holiday'
                          ? 'holi'
                          : 'semi'
                      }`}
                      title={ev.title}
                      onClick={() => setEventDetailModal(ev)}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: SCHEDULE INSTITUTIONAL EVENT                   */}
      {/* ======================================================== */}
      {createModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '540px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Schedule Official Institutional Event</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent}>
              <div className="principal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Event Title *
                  </label>
                  <input
                    name="title"
                    type="text"
                    placeholder="e.g. Academic Council Annual Autonomous Curriculum Revision"
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Event Category
                    </label>
                    <select
                      name="category"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="Governance">Senate &amp; Governance</option>
                      <option value="Examination">Examination Milestone</option>
                      <option value="Seminar/Workshop">Seminar &amp; Workshop</option>
                      <option value="Placement">Campus Placement Drive</option>
                      <option value="Holiday">Institutional Holiday</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Scheduled Date *
                    </label>
                    <input
                      name="date"
                      type="date"
                      defaultValue="2026-11-18"
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Timing
                    </label>
                    <input
                      name="time"
                      type="text"
                      defaultValue="10:00 AM - 01:00 PM"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                      Campus Venue
                    </label>
                    <input
                      name="venue"
                      type="text"
                      defaultValue="Executive Boardroom · Tech Tower"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Responsible Department / Directorate
                  </label>
                  <input
                    name="department"
                    type="text"
                    defaultValue="Office of the Principal"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>
                    Agenda &amp; Description
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Enter agenda items or attendee scope..."
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>
              <div className="principal-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <CheckCircle2 size={15} /> Confirm Event Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EVENT DETAILS PREVIEW                           */}
      {/* ======================================================== */}
      {eventDetailModal && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '520px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Event Dossier: {eventDetailModal.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEventDetailModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <span className="pbadge info" style={{ marginBottom: 4 }}>{eventDetailModal.category}</span>
                <h3 style={{ margin: '4px 0 6px', color: '#0f172a' }}>{eventDetailModal.title}</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Responsible: <strong>{eventDetailModal.department}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Date &amp; Time</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{eventDetailModal.date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>{eventDetailModal.time}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Campus Venue</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{eventDetailModal.venue}</div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Confirmed &amp; Reserved</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                  Event Scope &amp; Agenda
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {eventDetailModal.description}
                </p>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setEventDetailModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
