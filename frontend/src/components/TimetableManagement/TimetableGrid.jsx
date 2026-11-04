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
  Info,
  Lock,
  Unlock,
  Trash2,
  Calendar,
  Layers,
  Palette,
  Coffee
} from 'lucide-react';

/**
 * 30-Minute Base Unit Timing Helper
 */
function getSlotTiming(unitIndex, durationUnits = 1, baseHour = 8, baseMinute = 30) {
  const startTotalMinutes = baseHour * 60 + baseMinute + unitIndex * 30;
  const endTotalMinutes = startTotalMinutes + durationUnits * 30;

  const format = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mm = m < 10 ? `0${m}` : `${m}`;
    return `${h12 < 10 ? '0' + h12 : h12}:${mm} ${ampm}`;
  };

  return {
    startTime: format(startTotalMinutes),
    endTime: format(endTotalMinutes),
    label: `${format(startTotalMinutes)} – ${format(endTotalMinutes)}`,
  };
}

export default function TimetableGrid({
  timetable,
  config,
  onSlotClick,
  onMoveEntry,
  onToggleLock,
  onDeleteEntry,
  canEdit = true,
}) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [targetDay, setTargetDay] = useState('');
  const [targetPeriod, setTargetPeriod] = useState(0);
  const [targetRoom, setTargetRoom] = useState('');
  const [targetFaculty, setTargetFaculty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const workingDays = config?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const unitsCount = config?.periodsPerDay || 16; // 16 units of 30 min (08:30 to 16:30)

  const entries = timetable?.entries || [];

  const handleOpenEdit = (entry) => {
    if (!canEdit || entry.sessionType === 'LUNCH') return;
    setEditingEntry(entry);
    setTargetDay(entry.dayOfWeek);
    setTargetPeriod(entry.periodIndex);
    setTargetRoom(entry.roomNumber || '');
    setTargetFaculty(entry.facultyName || '');
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
        facultyName: targetFaculty,
      });
      setEditingEntry(null);
    } catch (err) {
      setValidationError(err?.message || 'Constraint Conflict: Move violates a 60-min gap or double-booking constraint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLockClick = async () => {
    if (!editingEntry || !onToggleLock) return;
    try {
      await onToggleLock(editingEntry.id);
      setEditingEntry(null);
    } catch (err) {
      setValidationError(err?.message || 'Failed to toggle session lock state.');
    }
  };

  const handleDeleteClick = async () => {
    if (!editingEntry || !onDeleteEntry) return;
    if (!window.confirm(`Delete ${editingEntry.subjectCode} session on ${editingEntry.dayOfWeek}?`)) return;
    try {
      await onDeleteEntry(editingEntry.id);
      setEditingEntry(null);
    } catch (err) {
      setValidationError(err?.message || 'Failed to delete session.');
    }
  };

  return (
    <div className="tt-grid-wrapper">
      <table className="tt-grid-table">
        <thead>
          <tr>
            <th className="time-col">Timing (30-Min Resolution)</th>
            {workingDays.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: unitsCount }).map((_, uIdx) => {
            const slotTiming = getSlotTiming(uIdx, 1);

            return (
              <tr key={`unit-${uIdx}`}>
                <td className="time-cell">
                  {slotTiming.startTime} - {slotTiming.endTime}
                  <small>Slot #{uIdx + 1}</small>
                </td>

                {workingDays.map((day) => {
                  // Check if any entry covers this day & unit index
                  const coveringEntry = entries.find((e) => {
                    const dur = e.durationPeriods || 1;
                    return e.dayOfWeek === day && uIdx >= e.periodIndex && uIdx < e.periodIndex + dur;
                  });

                  // If coveringEntry started at an earlier unit, skip this <td> (rowSpan covers it)
                  if (coveringEntry && coveringEntry.periodIndex < uIdx) {
                    return null;
                  }

                  // If coveringEntry starts at this unit, render with rowSpan
                  if (coveringEntry && coveringEntry.periodIndex === uIdx) {
                    const durUnits = coveringEntry.durationPeriods || 1;
                    const isLunch = coveringEntry.sessionType === 'LUNCH';
                    const isHobby = coveringEntry.sessionType === 'HOBBY_CLUB';
                    const isLibrary = coveringEntry.sessionType === 'LIBRARY';
                    const isLab = coveringEntry.sessionType === 'LAB' || coveringEntry.sessionType === 'PRACTICAL';
                    const isTut = coveringEntry.sessionType === 'TUTORIAL';
                    const isLocked = coveringEntry.isLocked || coveringEntry.notes?.includes('[LOCKED]');

                    let cardClass = 'theory';
                    if (isLunch) cardClass = 'lunch';
                    else if (isHobby) cardClass = 'hobby_club';
                    else if (isLibrary) cardClass = 'library';
                    else if (isLab) cardClass = 'lab';
                    else if (isTut) cardClass = 'tutorial';

                    return (
                      <td
                        key={`${day}-${uIdx}`}
                        rowSpan={durUnits}
                        style={{ height: `${durUnits * 46}px` }}
                      >
                        <div
                          className={`tt-slot-card ${cardClass} ${isLocked ? 'locked-card' : ''}`}
                          onClick={() => handleOpenEdit(coveringEntry)}
                          title={isLunch ? 'Staggered 30-Min Lunch Break' : (canEdit ? 'Click to inspect, reassign or lock session' : `${coveringEntry.subjectName}`)}
                        >
                          <div>
                            <div className="tt-slot-header">
                              <span className="tt-sub-code">
                                {isLunch ? '🍽️ LUNCH' : coveringEntry.subjectCode}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {isLocked && <Lock size={11} color="#64748b" title="Session Locked (Preserved during re-generation)" />}
                                <span className={`tt-type-pill ${cardClass}`}>
                                  {isLunch ? '30m' : (durUnits === 3 ? '1.5h' : (durUnits === 4 ? '2.0h' : (durUnits === 6 ? '3.0h' : '1.0h')))}
                                </span>
                              </div>
                            </div>
                            <div className="tt-sub-name" title={coveringEntry.subjectName}>
                              {coveringEntry.subjectName}
                            </div>
                          </div>

                          <div className="tt-slot-footer">
                            <span className="tt-slot-rm" title="Classroom or Lab">
                              <MapPin size={11} /> {coveringEntry.roomNumber || 'Room TBA'}
                            </span>
                            <span className="tt-slot-fac" title={coveringEntry.facultyName || 'Instructor'}>
                              {coveringEntry.facultyName ? (
                                <>
                                  <UserCheck size={11} /> {coveringEntry.facultyName.split(' ').slice(0, 2).join(' ')}
                                </>
                              ) : (
                                'Faculty TBA'
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  // No entry covers this unit: render free 30-min slot
                  return (
                    <td key={`${day}-${uIdx}`} className="tt-empty-cell">
                      <div
                        className="tt-empty-slot"
                        title="Free 30-min window"
                        onClick={() => {
                          if (onSlotClick) onSlotClick(day, uIdx);
                        }}
                      >
                        <span>Free</span>
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
          <div className="tt-modal-card" style={{ maxWidth: '500px' }}>
            <div className="tt-modal-header">
              <h3>
                <Move size={18} color="#2563eb" /> Inspect &amp; Reassign Session
              </h3>
              <button className="tt-modal-close" onClick={() => setEditingEntry(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMove}>
              <div className="tt-modal-body">
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{editingEntry.subjectCode} · {editingEntry.subjectName}</span>
                    <span style={{ fontSize: '0.78rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                      {editingEntry.durationPeriods ? `${editingEntry.durationPeriods * 30} mins` : '60 mins'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Section: <strong>{editingEntry.section}</strong> · Current Time: <strong>{editingEntry.startTime} – {editingEntry.endTime}</strong>
                  </div>
                </div>

                {validationError && (
                  <div className="tt-conflict-alert" style={{ fontSize: '0.82rem', padding: '10px', marginTop: '10px' }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Move Blocked:</strong>
                      <div style={{ marginTop: '2px' }}>{validationError}</div>
                    </div>
                  </div>
                )}

                <div className="tt-form-row" style={{ marginTop: '12px' }}>
                  <div className="tt-form-group">
                    <label>Target Day</label>
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
                    <label>Target Start Slot</label>
                    <select
                      className="tt-form-select"
                      value={targetPeriod}
                      onChange={(e) => setTargetPeriod(Number(e.target.value))}
                    >
                      {Array.from({ length: unitsCount }).map((_, idx) => {
                        const t = getSlotTiming(idx, editingEntry.durationPeriods || 2);
                        return (
                          <option key={idx} value={idx}>
                            {t.startTime} – {t.endTime} (Slot #{idx + 1})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="tt-form-row">
                  <div className="tt-form-group">
                    <label>Assigned Room</label>
                    <input
                      type="text"
                      className="tt-form-input"
                      value={targetRoom}
                      onChange={(e) => setTargetRoom(e.target.value)}
                      placeholder="e.g. Room 301, CS Lab-1"
                    />
                  </div>

                  <div className="tt-form-group">
                    <label>Assigned Faculty</label>
                    <input
                      type="text"
                      className="tt-form-input"
                      value={targetFaculty}
                      onChange={(e) => setTargetFaculty(e.target.value)}
                      placeholder="e.g. Dr. P. Mohapatra"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="tt-btn tt-btn-secondary"
                    style={{ flex: 1, fontSize: '0.78rem' }}
                    onClick={handleToggleLockClick}
                  >
                    {editingEntry.isLocked || editingEntry.notes?.includes('[LOCKED]') ? (
                      <>
                        <Unlock size={14} color="#059669" /> Unlock Session
                      </>
                    ) : (
                      <>
                        <Lock size={14} color="#d97706" /> Pin / Lock Session
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="tt-btn tt-btn-secondary"
                    style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.78rem' }}
                    onClick={handleDeleteClick}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

                <div className="tt-assistant-box" style={{ marginTop: '12px' }}>
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Constraint-Protected Reassignment:</strong> The system verifies that the instructor has a minimum 60-minute gap and that no section or room double-booking occurs.
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
                  {isSubmitting ? 'Validating Constraints...' : 'Commit & Revalidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
