import React, { useState } from 'react';
import {
  BookOpen,
  FlaskConical,
  Clock,
  MapPin,
  UserCheck,
  AlertTriangle,
  Move,
  CheckCircle,
  X,
  Sparkles,
  Info
} from 'lucide-react';

export default function TimetableGrid({
  timetable,
  config,
  onSlotClick,
  onMoveEntry,
  canEdit = false,
}) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [targetDay, setTargetDay] = useState('');
  const [targetPeriod, setTargetPeriod] = useState(0);
  const [targetRoom, setTargetRoom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const workingDays = config?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periodsCount = config?.periodsPerDay || 8;
  const slotTimings = config?.slotTimings || [
    { period: 1, startTime: '08:30 AM', endTime: '09:30 AM', isBreak: false, label: 'Period 1' },
    { period: 2, startTime: '09:30 AM', endTime: '10:30 AM', isBreak: false, label: 'Period 2' },
    { period: 3, startTime: '10:30 AM', endTime: '11:30 AM', isBreak: false, label: 'Period 3' },
    { period: 4, startTime: '11:30 AM', endTime: '12:30 PM', isBreak: false, label: 'Period 4' },
    { period: 5, startTime: '12:30 PM', endTime: '01:30 PM', isBreak: true, label: 'Lunch Break' },
    { period: 6, startTime: '01:30 PM', endTime: '02:30 PM', isBreak: false, label: 'Period 5' },
    { period: 7, startTime: '02:30 PM', endTime: '03:30 PM', isBreak: false, label: 'Period 6' },
    { period: 8, startTime: '03:30 PM', endTime: '04:30 PM', isBreak: false, label: 'Period 7' },
  ];

  const entries = timetable?.entries || [];

  const handleOpenEdit = (entry) => {
    if (!canEdit) return;
    setEditingEntry(entry);
    setTargetDay(entry.dayOfWeek);
    setTargetPeriod(entry.periodIndex);
    setTargetRoom(entry.roomNumber || '');
    setValidationError('');
  };

  const handleSaveMove = async (e) => {
    e.preventDefault();
    if (!editingEntry || !onMoveEntry) return;

    setIsSubmitting(true);
    setValidationError('');

    try {
      await onMoveEntry(editingEntry.id, {
        dayOfWeek: targetDay,
        periodIndex: Number(targetPeriod),
        roomNumber: targetRoom,
      });
      setEditingEntry(null);
    } catch (err) {
      setValidationError(err?.message || 'Conflict detected: The proposed move violates a scheduling constraint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tt-grid-wrapper">
      <table className="tt-grid-table">
        <thead>
          <tr>
            <th className="time-col">Timing</th>
            {workingDays.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: periodsCount }).map((_, pIdx) => {
            const slot = slotTimings[pIdx] || {
              startTime: `${8 + pIdx}:30 AM`,
              endTime: `${9 + pIdx}:30 AM`,
              isBreak: pIdx === 4,
              label: pIdx === 4 ? 'Lunch Break' : `Period ${pIdx + 1}`,
            };

            const isLunch = slot.isBreak;

            if (isLunch) {
              return (
                <tr key={`break-${pIdx}`} className="tt-break-row">
                  <td className="time-cell">
                    {slot.startTime} - {slot.endTime}
                    <small>Recess</small>
                  </td>
                  <td colSpan={workingDays.length}>
                    🍽️ INSTITUTIONAL LUNCH &amp; REFRESHMENT BREAK ({slot.startTime} – {slot.endTime})
                  </td>
                </tr>
              );
            }

            return (
              <tr key={`period-${pIdx}`}>
                <td className="time-cell">
                  {slot.startTime} - {slot.endTime}
                  <small>{slot.label}</small>
                </td>
                {workingDays.map((day) => {
                  const item = entries.find(
                    (e) => e.dayOfWeek === day && e.periodIndex === pIdx,
                  );

                  if (!item) {
                    return (
                      <td key={`${day}-${pIdx}`}>
                        <div
                          className="tt-empty-slot"
                          title="Free Period - No Session Scheduled"
                        >
                          <span>Free Slot</span>
                        </div>
                      </td>
                    );
                  }

                  const isLab = item.sessionType === 'LAB' || item.isConsecutive;

                  return (
                    <td key={`${day}-${pIdx}`}>
                      <div
                        className={`tt-slot-card ${isLab ? 'lab' : 'theory'} ${item.isConsecutive ? 'consecutive' : ''}`}
                        onClick={() => handleOpenEdit(item)}
                        title={canEdit ? 'Click to inspect or manually move slot' : `${item.subjectName} (${item.subjectCode})`}
                      >
                        <div>
                          <div className="tt-slot-header">
                            <span className="tt-sub-code">{item.subjectCode}</span>
                            <span className={`tt-type-pill ${isLab ? 'lb' : 'th'}`}>
                              {isLab ? 'LAB' : 'TH'}
                            </span>
                          </div>
                          <div className="tt-sub-name" title={item.subjectName}>
                            {item.subjectName}
                          </div>
                        </div>

                        <div className="tt-slot-footer">
                          <span className="tt-slot-rm" title="Classroom / Lab">
                            <MapPin size={11} /> {item.roomNumber || 'Rm TBA'}
                          </span>
                          <span className="tt-slot-fac" title={item.facultyName || 'Faculty'}>
                            {item.facultyName || 'Instructor'}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Manual Slot Reassignment Modal */}
      {editingEntry && (
        <div className="tt-modal-overlay">
          <div className="tt-modal-card" style={{ maxWidth: '480px' }}>
            <div className="tt-modal-header">
              <h3>
                <Move size={18} color="#2563eb" /> Manual Slot Editor &amp; Revalidation
              </h3>
              <button className="tt-modal-close" onClick={() => setEditingEntry(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMove}>
              <div className="tt-modal-body">
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {editingEntry.subjectCode} · {editingEntry.subjectName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                    Section: <strong>{editingEntry.section}</strong> · Faculty: <strong>{editingEntry.facultyName}</strong>
                  </div>
                </div>

                {validationError && (
                  <div className="tt-conflict-alert" style={{ fontSize: '0.82rem', padding: '10px' }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Move Blocked by Constraint Engine:</strong>
                      <div style={{ marginTop: '3px' }}>{validationError}</div>
                    </div>
                  </div>
                )}

                <div className="tt-form-row">
                  <div className="tt-form-group">
                    <label>Target Day of Week</label>
                    <select
                      className="tt-form-select"
                      value={targetDay}
                      onChange={(e) => setTargetDay(e.target.value)}
                    >
                      {workingDays.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="tt-form-group">
                    <label>Target Period</label>
                    <select
                      className="tt-form-select"
                      value={targetPeriod}
                      onChange={(e) => setTargetPeriod(e.target.value)}
                    >
                      {slotTimings.map((s, idx) => (
                        <option key={idx} value={idx} disabled={s.isBreak}>
                          {s.label} ({s.startTime}) {s.isBreak ? '- Break' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="tt-form-group">
                  <label>Room Allocation</label>
                  <input
                    type="text"
                    className="tt-form-input"
                    value={targetRoom}
                    onChange={(e) => setTargetRoom(e.target.value)}
                    placeholder="e.g. Room 301 or CS Lab-1"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>
                    Moving a session automatically validates against faculty, section, and room double-bookings.
                  </small>
                </div>

                <div className="tt-assistant-box">
                  <Info size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Conflict-Resolution Safeguard:</strong> Changes will only commit if the new slot satisfies all institutional constraints.
                  </div>
                </div>
              </div>

              <div className="tt-modal-footer">
                <button
                  type="button"
                  className="tt-btn tt-btn-secondary"
                  onClick={() => setEditingEntry(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tt-btn tt-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Validating...' : 'Apply & Revalidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
