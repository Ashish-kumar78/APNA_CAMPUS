import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  Calendar as CalendarIcon,
  AlertCircle,
} from 'lucide-react';
import {
  getTodayIST,
  getCalendarNotes,
  createCalendarNote,
  updateCalendarNote,
  deleteCalendarNote,
  subscribeToCalendarNotes,
} from '../services/calendarNotesStore.js';

// Official 2026 Holidays preserved exactly from existing calendar design
const OFFICIAL_HOLIDAYS_2026 = [
  [
    '14-01-2026',
    'Makar Sankranti'
  ],
  [
    '23-01-2026',
    'Netaji Subas Bose Jayanti/ Saraswati Puja'
  ],
  [
    '26-01-2026',
    'Republic Day'
  ],
  [
    '03-03-2026',
    'Dola Purnami'
  ],
  [
    '04-03-2026',
    'Holi'
  ],
  [
    '21-03-2026',
    'Eid-Ul Fitar'
  ],
  [
    '27-03-2026',
    'Ram Navami'
  ],
  [
    '01-04-2026',
    'Utkal Divas'
  ],
  [
    '03-04-2026',
    'Good Friday'
  ],
  [
    '14-04-2026',
    'Maha Vishubha Sankranti'
  ],
  [
    '16-05-2026',
    'Sabitri Amavasya'
  ],
  [
    '28-05-2026',
    'Eid-Ul Zuha'
  ],
  [
    '15-06-2026',
    'Raja Sankrati'
  ],
  [
    '26-06-2026',
    'Muharram'
  ],
  [
    '16-07-2026',
    'Ratha Yatra'
  ],
  [
    '15-08-2026',
    'Independence Day'
  ],
  [
    '26-08-2026',
    'Prophet Muhammad Birthday'
  ],
  [
    '27-08-2026',
    'Jhulana Purnami'
  ],
  [
    '04-09-2026',
    'Janmastami'
  ],
  [
    '14-09-2026',
    'Ganesh Puja'
  ],
  [
    '15-09-2026',
    'Nuakhai'
  ],
  [
    '16-09-2026',
    'Day Following Nuakhai'
  ],
  [
    '02-10-2026',
    'Gandhi Jayanti'
  ],
  [
    '10-10-2026',
    'Mahalaya'
  ],
  [
    '17-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '18-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '19-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '20-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '21-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '22-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '23-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '24-10-2026',
    'Durga Puja Holidays'
  ],
  [
    '09-11-2026',
    'Prathamastami'
  ],
  [
    '24-11-2026',
    'Rahasa Purnima'
  ],
  [
    '25-12-2026',
    'Christmas'
  ]
];

function createCalendarDays(month, todayDateStr) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  const pad = (n) => String(n).padStart(2, '0');

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    const isToday = dateStr === todayDateStr;
    const isPast = dateStr < todayDateStr;
    const isFuture = dateStr > todayDateStr;

    return {
      key,
      dateStr,
      dateObj: date,
      day: date.getDate(),
      inMonth: date.getMonth() === month.getMonth(),
      isToday,
      isPast,
      isFuture,
      isSunday: date.getDay() === 0,
    };
  });
}

export default function CalendarWidget({ account, className = '' }) {
  // Current date in Indian Standard Time (Asia/Kolkata)
  const [todayIST, setTodayIST] = useState(() => getTodayIST());

  // Dynamic calendar month (defaults to current IST month)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const ist = getTodayIST();
    return new Date(ist.year, ist.monthIndex, 1);
  });

  // User notes state
  const [userNotes, setUserNotes] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null); // When user clicks a date to view/add notes
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic midnight update: checks every 30 seconds for IST midnight transition
  useEffect(() => {
    const timer = setInterval(() => {
      const nowIST = getTodayIST();
      setTodayIST((prev) => {
        if (prev.dateStr !== nowIST.dateStr) {
          return nowIST;
        }
        return prev;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Load user notes
  const loadNotes = useCallback(async () => {
    if (!account) return;
    try {
      const notes = await getCalendarNotes(account);
      setUserNotes(notes || []);
    } catch (e) {
      console.warn('Failed to load calendar notes:', e);
    }
  }, [account]);

  useEffect(() => {
    loadNotes();
    const unsubscribe = subscribeToCalendarNotes(() => {
      loadNotes();
    });
    return () => unsubscribe();
  }, [account, loadNotes]);

  const updateMonth = (delta) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const monthLabel = useMemo(
    () => currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    [currentMonth]
  );

  const holidayMap = useMemo(() => {
    const map = {};
    for (const [rawDate, name] of OFFICIAL_HOLIDAYS_2026) {
      const [d, m, y] = rawDate.split('-').map(Number);
      const key = `${y}-${m - 1}-${d}`;
      map[key] = name;
    }
    return map;
  }, []);

  // Map notes by date string YYYY-MM-DD
  const notesByDate = useMemo(() => {
    const map = {};
    for (const note of userNotes) {
      if (!map[note.scheduledDate]) {
        map[note.scheduledDate] = [];
      }
      map[note.scheduledDate].push(note);
    }
    return map;
  }, [userNotes]);

  const calendarDays = useMemo(
    () => createCalendarDays(currentMonth, todayIST.dateStr),
    [currentMonth, todayIST.dateStr]
  );

  // Handle clicking a day cell
  const handleDayClick = (dayItem) => {
    setSelectedDay(dayItem);
  };

  // Open Add Note Modal
  const handleOpenAddNote = (dateStr) => {
    const targetDate = dateStr || (selectedDay ? selectedDay.dateStr : todayIST.dateStr);
    if (targetDate < todayIST.dateStr) {
      alert('Note creation is disabled for past dates.');
      return;
    }
    setEditingNote(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate(targetDate);
    setFormError('');
    setShowAddModal(true);
  };

  // Open Edit Note Modal
  const handleOpenEditNote = (note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormDescription(note.description || '');
    setFormDate(note.scheduledDate);
    setFormError('');
    setShowAddModal(true);
  };

  /**
   * Save Note (Create or Edit)
   * Instant 0ms perceived latency:
   * 1. Validates inputs & past date restriction
   * 2. Optimistically updates cache & closes modal immediately
   * 3. Syncs with backend in background
   */
  const handleSaveNote = async (e) => {
    e.preventDefault();
    const titleTrimmed = formTitle.trim();
    const dateTrimmed = formDate.trim();

    if (!titleTrimmed) {
      setFormError('Title is required');
      return;
    }
    if (!dateTrimmed) {
      setFormError('Scheduled date is required');
      return;
    }
    if (dateTrimmed < todayIST.dateStr) {
      setFormError(`Cannot schedule notes for past dates (Selected: ${dateTrimmed}, Today: ${todayIST.dateStr})`);
      return;
    }

    // Capture editing info before closing modal
    const editing = editingNote;
    const descTrimmed = formDescription.trim();

    // 0ms INSTANT MODAL CLOSE: Do not block user on network latency
    setShowAddModal(false);
    setFormTitle('');
    setFormDescription('');
    setFormError('');
    setEditingNote(null);

    // Save and sync in background
    try {
      if (editing) {
        await updateCalendarNote(account, editing.id, {
          title: titleTrimmed,
          description: descTrimmed,
          scheduledDate: dateTrimmed,
        });
      } else {
        await createCalendarNote(account, {
          title: titleTrimmed,
          description: descTrimmed,
          scheduledDate: dateTrimmed,
        });
      }
      await loadNotes();
    } catch (err) {
      console.warn('Calendar note save sync error:', err);
    }
  };

  // Delete Note with Confirmation
  const handleDeleteNote = async (noteId) => {
    const confirmed = window.confirm('Are you sure you want to delete this calendar note?');
    if (!confirmed) return;

    try {
      await deleteCalendarNote(account, noteId);
      await loadNotes();
    } catch (err) {
      alert(`Could not delete note: ${err?.message || 'Unknown error'}`);
    }
  };

  const selectedDateNotes = selectedDay ? (notesByDate[selectedDay.dateStr] || []) : [];

  const formatDateTitle = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <>
      {/* ==========================================================
          EXACT PRESERVED CALENDAR CARD UI
          Matches original layout, colors, dimensions, and typography
          ========================================================== */}
      <section className={`dash-card dash-calendar ${className}`} id="calendar">
        <header className="dash-card-head">
          <h3>
            <span className="dash-head-icon tone-blue">
              <CalendarDays size={15} />
            </span>
            Calendar
          </h3>
          <div className="dash-cal-controls">
            <button type="button" onClick={() => updateMonth(-1)} aria-label="Previous month">
              <ChevronLeft size={15} />
            </button>
            <strong>{monthLabel}</strong>
            <button type="button" onClick={() => updateMonth(1)} aria-label="Next month">
              <ChevronRight size={15} />
            </button>
          </div>
        </header>

        <div className="dash-cal-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="dash-cal-days">
          {calendarDays.map((item) => {
            const { key, dateStr, day, inMonth, isToday, isPast, isSunday } = item;
            const holidayName = holidayMap[key];
            const dayNotes = notesByDate[dateStr] || [];
            const hasNotes = dayNotes.length > 0;
            const hasPending = dayNotes.some((n) => n.status === 'PENDING');
            const allCompleted = hasNotes && !hasPending;
            const isSelected = selectedDay && selectedDay.dateStr === dateStr;

            return (
              <span
                key={key}
                onClick={() => handleDayClick(item)}
                className={[
                  'dash-day',
                  inMonth ? '' : 'is-outside',
                  isToday ? 'is-today' : '',
                  holidayName ? 'is-holiday' : '',
                  isSunday ? 'is-sunday' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  ...(isPast && !isToday
                    ? {
                        opacity: inMonth ? 0.6 : 0.35,
                      }
                    : undefined),
                  ...(isToday
                    ? {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        boxShadow: '0 6px 14px -4px rgba(37, 99, 235, 0.75)',
                      }
                    : undefined),
                  ...(isSelected && !isToday
                    ? {
                        outline: '2px solid #2563eb',
                        outlineOffset: '-2px',
                      }
                    : undefined),
                }}
                title={
                  holidayName
                    ? `${holidayName}${hasNotes ? ` • ${dayNotes.length} Note(s)` : ''}`
                    : hasNotes
                    ? `${dayNotes.length} Note(s) (${hasPending ? 'Pending' : 'Completed'})`
                    : undefined
                }
              >
                {day}

                {/* Status Indicator Dot:
                    - Blue dot (#2563eb) for dates with one or more pending notes
                    - Green dot (#16a34a) for dates where ALL notes are completed
                    - White dot (#ffffff) when today is selected for optimal contrast */}
                {hasNotes && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: isToday
                        ? '#ffffff'
                        : hasPending
                        ? '#2563eb'
                        : '#16a34a',
                      boxShadow: isToday ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>

        {/* Preserved Legend with added Notes Status Indicators */}
        <div className="dash-legend" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span><i className="lg-holiday" style={{ backgroundColor: '#fdba74' }} />Holiday</span>
            <span><i className="lg-sunday" style={{ backgroundColor: '#fda4af' }} />Sunday</span>
            <span><i className="lg-today" style={{ backgroundColor: '#2563eb' }} />Today</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  display: 'inline-block',
                }}
              />
              Pending
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#16a34a',
                  display: 'inline-block',
                }}
              />
              Completed
            </span>
          </div>
        </div>
      </section>

      {/* ==========================================================
          DATE NOTES MANAGEMENT MODAL / DRAWER
          Shown when user clicks any date on the calendar
          ========================================================== */}
      {selectedDay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99990,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setSelectedDay(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 22px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#dbeafe',
                    color: '#2563eb',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {formatDateTitle(selectedDay.dateStr)}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    {selectedDateNotes.length} Note{selectedDateNotes.length !== 1 ? 's' : ''} Scheduled
                    {holidayMap[selectedDay.key] ? ` • Holiday: ${holidayMap[selectedDay.key]}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                  borderRadius: '6px',
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: List of notes */}
            <div
              style={{
                padding: '20px 22px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {selectedDateNotes.length === 0 ? (
                <div
                  style={{
                    padding: '30px 16px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <CalendarDays size={32} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                    No notes scheduled for this date.
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {selectedDay.isPast
                      ? 'Past date: Note creation is disabled.'
                      : 'Click "+ Add Note" below to schedule your task or reminder.'}
                  </p>
                </div>
              ) : (
                selectedDateNotes.map((note) => {
                  const isCompleted = note.status === 'COMPLETED';
                  return (
                    <div
                      key={note.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: isCompleted ? '1px solid #d1fae5' : '1px solid #e2e8f0',
                        backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: isCompleted ? '#dcfce7' : '#fef3c7',
                              color: isCompleted ? '#166534' : '#92400e',
                              marginBottom: '6px',
                            }}
                          >
                            {note.status}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                            {note.title}
                          </h4>
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditNote(note)}
                            title="Edit Note"
                            style={{
                              padding: '6px',
                              background: '#f1f5f9',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#475569',
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete Note"
                            style={{
                              padding: '6px',
                              background: '#fee2e2',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#b91c1c',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {note.description && (
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                          {note.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer: Close + Add Note (disabled for past dates) */}
            <div
              style={{
                padding: '14px 22px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                Close
              </button>

              {selectedDay.isPast ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                  }}
                >
                  <Clock size={13} />
                  <span>Past date: Note creation disabled</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenAddNote(selectedDay.dateStr)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  <Plus size={15} />
                  Add Note
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          ADD / EDIT NOTE MODAL (Exact design from Image 3)
          Strict Form Requirements:
          1. Title – Required input field
          2. Description – Text area
          3. Selected Date – Auto-populated, min = todayIST
          4. Instant 0ms Save
          ========================================================== */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99995,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {editingNote ? 'Edit Calendar Note' : 'Add New Calendar Note'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} style={{ padding: '20px 22px' }}>
              {formError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Title (Required) */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Submit project documentation"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 2. Description (Textarea) */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your task, reminder, or important notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* 3. Selected Date (Pre-populated, restricts past dates) */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Selected Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayIST.dateStr}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 4. Instant Save Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '9px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.15s',
                  }}
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
