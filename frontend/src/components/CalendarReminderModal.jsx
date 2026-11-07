import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Check,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  getTodayIST,
  getPendingCalendarReminders,
  submitCalendarNote,
  subscribeToCalendarNotes,
  resolveUserId,
  formatEventTimeRange,
} from '../services/calendarNotesStore.js';

// In-memory fallback set for session dismissal tracking
const memorySessionDismissed = new Set();

function getSessionDismissKey(userId) {
  return `apna_calendar_dismissed_${userId}`;
}

export function isSessionDismissed(userId) {
  if (!userId) return false;
  if (memorySessionDismissed.has(userId)) return true;
  if (typeof sessionStorage !== 'undefined') {
    try {
      return sessionStorage.getItem(getSessionDismissKey(userId)) === 'true';
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function setSessionDismissed(userId) {
  if (!userId) return;
  memorySessionDismissed.add(userId);
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(getSessionDismissKey(userId), 'true');
    } catch (e) {}
  }
}

export function clearSessionDismissal(userId) {
  if (!userId) return;
  memorySessionDismissed.delete(userId);
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(getSessionDismissKey(userId));
    } catch (e) {}
  }
}

export default function CalendarReminderModal({ account }) {
  const [pendingReminders, setPendingReminders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  const prevUserIdRef = useRef(null);

  // Today's date string YYYY-MM-DD in Asia/Kolkata (IST) timezone
  const getTodayStr = () => getTodayIST().dateStr;

  const loadReminders = useCallback(async () => {
    if (!account) {
      setIsOpen(false);
      setPendingReminders([]);
      return;
    }

    const userId = resolveUserId(account);

    // If already dismissed for this login session, do NOT show
    if (isSessionDismissed(userId)) {
      setIsOpen(false);
      return;
    }

    try {
      const todayStr = getTodayStr();
      const list = await getPendingCalendarReminders(account, todayStr);
      if (Array.isArray(list) && list.length > 0) {
        setPendingReminders(list);
        setIsOpen(true);
      } else {
        setPendingReminders([]);
        setIsOpen(false);
      }
    } catch (e) {
      console.warn('Failed to load pending reminders:', e);
    }
  }, [account]);

  // Handle fresh login / account changes
  useEffect(() => {
    if (!account) {
      prevUserIdRef.current = null;
      setIsOpen(false);
      return;
    }

    const currentUserId = resolveUserId(account);

    // If new login (different user or transition from null -> user), reset dismissal for this session
    if (prevUserIdRef.current !== currentUserId) {
      clearSessionDismissal(currentUserId);
      prevUserIdRef.current = currentUserId;
    }

    loadReminders();
  }, [account?.id, account?.email, account?.role, loadReminders]);

  // Subscribe to calendar updates; reload only if not dismissed for this session
  useEffect(() => {
    const unsubscribe = subscribeToCalendarNotes(() => {
      if (!account) return;
      const userId = resolveUserId(account);
      if (!isSessionDismissed(userId)) {
        loadReminders();
      }
    });
    return () => unsubscribe();
  }, [account, loadReminders]);

  // MANDATORY ACCESS CONTROL: Prevent Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen]);

  if (!isOpen || pendingReminders.length === 0) {
    return null;
  }

  const todayStr = getTodayStr();

  // Option 1: CLOSE (Review Later)
  // Dismisses modal for the CURRENT logged-in session.
  // Will NOT show again immediately or while navigating.
  // Reappears upon next login if tasks are still uncompleted.
  const handleClose = () => {
    if (account) {
      const userId = resolveUserId(account);
      setSessionDismissed(userId);
    }
    setIsOpen(false);
  };

  // Option 2: SUBMIT (Marks this specific task as COMPLETED)
  // Permanently dismisses this task; will never appear again on future logins.
  const handleSubmitNote = async (noteId) => {
    try {
      setSubmittingId(noteId);
      await submitCalendarNote(account, noteId);
      // Remove completed note from active list immediately
      const remaining = pendingReminders.filter((n) => n.id !== noteId);
      setPendingReminders(remaining);
      if (remaining.length === 0) {
        setIsOpen(false);
      }
    } catch (e) {
      alert(`Could not submit note: ${e?.message || 'Unknown error'}`);
    } finally {
      setSubmittingId(null);
    }
  };

  const formatDateDisplay = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <div
      className="calendar-reminder-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      // Mandatory Access Control: clicking outside does NOT dismiss
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="calendar-reminder-modal"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Matches image design */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                display: 'grid',
                placeItems: 'center',
                color: '#60a5fa',
              }}
            >
              <BellRing size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
                Pending Calendar Reminders & Tasks
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                You have {pendingReminders.length} pending scheduled task{pendingReminders.length > 1 ? 's' : ''} requiring attention.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={13} />
            Mandatory Notice
          </div>
        </div>

        {/* Informational banner */}
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: '#eff6ff',
            borderBottom: '1px solid #dbeafe',
            fontSize: '12.5px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0, color: '#2563eb' }} />
          <span>
            Click <strong>Submit</strong> once a task is completed to permanently dismiss it. Click <strong>Close</strong> to proceed to dashboard and keep pending for next login.
          </span>
        </div>

        {/* Reminders List Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 220px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {pendingReminders.map((note) => {
            const isOverdue = note.scheduledDate < todayStr;
            const isToday = note.scheduledDate === todayStr;

            return (
              <div
                key={note.id}
                style={{
                  border: isOverdue ? '1px solid #fecaca' : isToday ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: isOverdue ? '#fffbfb' : isToday ? '#fbfdff' : '#f8fafc',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          backgroundColor: isOverdue ? '#fee2e2' : '#dbeafe',
                          color: isOverdue ? '#b91c1c' : '#1d4ed8',
                          border: isOverdue ? '1px solid #fca5a5' : '1px solid #93c5fd',
                        }}
                      >
                        {isOverdue ? 'OVERDUE (PENDING)' : isToday ? 'DUE TODAY (PENDING)' : 'PENDING'}
                      </span>

                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Calendar size={13} />
                        Scheduled: {formatDateDisplay(note.scheduledDate)}
                        {formatEventTimeRange(note.startTime, note.endTime) && (
                          <span style={{ color: '#2563eb', marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            • <Clock size={12} /> {formatEventTimeRange(note.startTime, note.endTime)}
                          </span>
                        )}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: '1.4',
                      }}
                    >
                      {note.title}
                    </h4>

                    {note.description ? (
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: '13.5px',
                          color: '#475569',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {note.description}
                      </p>
                    ) : (
                      <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                        No additional description provided.
                      </p>
                    )}
                  </div>

                  {/* Submit Action for this specific note */}
                  <button
                    type="button"
                    onClick={() => handleSubmitNote(note.id)}
                    disabled={submittingId === note.id}
                    title="Mark task as completed (permanently dismisses this reminder)"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)',
                      flexShrink: 0,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                  >
                    <Check size={15} />
                    {submittingId === note.id ? 'Submitting...' : 'Submit (Complete)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            User: <strong>{account?.name || account?.displayName || account?.role || 'Authenticated User'}</strong> (Private Notes)
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Option 1: CLOSE (Allow dashboard access, keep status Pending) */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <X size={15} />
              Close (Review Later)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
