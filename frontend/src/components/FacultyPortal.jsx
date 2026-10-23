import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, CalendarCheck, Check, Clock3, LogOut, RefreshCw, ShieldAlert, Users } from 'lucide-react';
import { api } from '../services/api.js';

const panelStyle = { background: '#fff', border: '1px solid #dbe4ef', borderRadius: 16, padding: 20, boxShadow: '0 6px 18px rgba(15,23,42,.05)' };
const buttonStyle = { border: '1px solid #cbd5e1', background: '#fff', color: '#172033', borderRadius: 9, padding: '9px 13px', cursor: 'pointer', fontWeight: 600 };

/** Faculty UI limited to authenticated assignment and attendance APIs. */
export default function FacultyPortal({ account, onLogout }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [assignmentsState, setAssignmentsState] = useState({ loading: true, error: '' });
  const [roster, setRoster] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [sessions, setSessions] = useState([]);
  const [rosterState, setRosterState] = useState({ loading: false, error: '' });
  const [sessionsState, setSessionsState] = useState({ loading: false, error: '' });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState('');
  const [submitState, setSubmitState] = useState({ saving: false, error: '', success: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  const selected = useMemo(() => assignments.find((item) => item.id === selectedId) || null, [assignments, selectedId]);

  useEffect(() => {
    let active = true;
    setAssignmentsState({ loading: true, error: '' });
    api.getFacultyAssignments()
      .then((result) => {
        if (!result?.success || !Array.isArray(result.data)) throw new Error('The server returned an invalid assignments response.');
        if (!active) return;
        setAssignments(result.data);
        setSelectedId((current) => result.data.some((item) => item.id === current) ? current : (result.data[0]?.id || ''));
      })
      .catch((error) => { if (active) setAssignmentsState({ loading: false, error: error.message || 'Assignments could not be loaded.' }); })
      .finally(() => { if (active) setAssignmentsState((state) => ({ ...state, loading: false })); });
    return () => { active = false; };
  }, [refreshKey]);

  const loadAssignmentData = useCallback(async () => {
    if (!selected) {
      setRoster([]);
      setSessions([]);
      setRosterState({ loading: false, error: '' });
      setSessionsState({ loading: false, error: '' });
      return;
    }
    let active = true;
    setRosterState({ loading: true, error: '' });
    setSessionsState({ loading: true, error: '' });
    const [rosterResult, sessionsResult] = await Promise.allSettled([
      api.getFacultyAttendanceRoster(selected.subjectCode, selected.section),
      api.getFacultyAttendanceSessions(selected.subjectCode, selected.section),
    ]);
    if (!active) return;
    if (rosterResult.status === 'fulfilled' && rosterResult.value?.success && Array.isArray(rosterResult.value.data)) {
      setRoster(rosterResult.value.data);
      setAttendance(Object.fromEntries(rosterResult.value.data.map((student) => [student.rollNumber, null])));
      setRosterState({ loading: false, error: '' });
    } else {
      setRoster([]);
      setRosterState({ loading: false, error: rosterResult.status === 'rejected' ? rosterResult.reason?.message || 'Roster could not be loaded.' : 'The server returned an invalid roster response.' });
    }
    if (sessionsResult.status === 'fulfilled' && sessionsResult.value?.success && Array.isArray(sessionsResult.value.data)) {
      setSessions(sessionsResult.value.data);
      setSessionsState({ loading: false, error: '' });
    } else {
      setSessions([]);
      setSessionsState({ loading: false, error: sessionsResult.status === 'rejected' ? sessionsResult.reason?.message || 'Attendance history could not be loaded.' : 'The server returned an invalid attendance history response.' });
    }
    return () => { active = false; };
  }, [selected]);

  useEffect(() => { loadAssignmentData(); }, [loadAssignmentData, refreshKey]);

  const setAllAttendance = (present) => {
    setAttendance(Object.fromEntries(roster.map((student) => [student.rollNumber, present])));
  };

  const submitAttendance = async (event) => {
    event.preventDefault();
    setSubmitState({ saving: false, error: '', success: '' });
    if (!selected) return setSubmitState({ saving: false, error: 'Select a persisted teaching assignment first.', success: '' });
    if (!period.trim()) return setSubmitState({ saving: false, error: 'Enter the class period before submitting attendance.', success: '' });
    if (!roster.length || roster.some((student) => typeof attendance[student.rollNumber] !== 'boolean')) {
      return setSubmitState({ saving: false, error: 'Mark every student present or absent before submitting.', success: '' });
    }
    setSubmitState({ saving: true, error: '', success: '' });
    try {
      const result = await api.submitFacultyAttendance({
        subjectCode: selected.subjectCode,
        section: selected.section,
        date,
        period: period.trim(),
        attendanceMap: attendance,
      });
      if (!result?.success) throw new Error('The server did not confirm the attendance submission.');
      setSubmitState({ saving: false, error: '', success: result.message || 'Attendance saved by the server.' });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setSubmitState({ saving: false, error: error.message || 'Attendance was not saved.', success: '' });
    }
  };

  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 18px 48px', color: '#172033' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: 13 }}>Authenticated Faculty Workspace</p>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Welcome{account?.name ? `, ${account.name}` : ''}</h1>
          <p style={{ margin: '7px 0 0', color: '#64748b' }}>Assignments and attendance below are loaded from the campus backend.</p>
        </div>
        <button type="button" onClick={onLogout} style={buttonStyle}><LogOut size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />Sign out</button>
      </header>

      {assignmentsState.error && <div role="alert" style={{ ...panelStyle, marginBottom: 16, color: '#991b1b', borderColor: '#fecaca' }}><AlertCircle size={17} style={{ verticalAlign: 'middle', marginRight: 8 }} />{assignmentsState.error}</div>}
      {assignmentsState.loading ? <div style={panelStyle}>Loading assigned classes…</div> : assignments.length === 0 ? (
        <section style={panelStyle} role="status">
          <h2 style={{ marginTop: 0 }}>No teaching assignments found</h2>
          <p style={{ color: '#64748b', marginBottom: 0 }}>This account has no linked active faculty assignment in the database. Ask an administrator to link your faculty profile and course assignments.</p>
        </section>
      ) : (
        <>
          <section style={{ ...panelStyle, marginBottom: 18 }}>
            <label htmlFor="faculty-assignment" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Assigned class</label>
            <select id="faculty-assignment" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setSubmitState({ saving: false, error: '', success: '' }); }} style={{ width: '100%', maxWidth: 620, padding: 11, border: '1px solid #cbd5e1', borderRadius: 9, background: '#fff' }}>
              {assignments.map((item) => <option key={item.id} value={item.id}>{item.subjectCode} · {item.subjectName} · {item.semester} · {item.section} · {item.academicYear}</option>)}
            </select>
            {selected && <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14, color: '#475569', fontSize: 14 }}>
              <span><BookOpen size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />{selected.department}</span>
              <span><Users size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />{selected.sectionEnrollment} students in this section</span>
              <span><Clock3 size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />{selected.credits ?? '—'} credits</span>
            </div>}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, alignItems: 'start' }}>
            <section style={panelStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '1.15rem' }}><CalendarCheck size={19} style={{ verticalAlign: 'middle', marginRight: 7 }} />Record attendance</h2>
                <button type="button" style={buttonStyle} aria-label="Reload class data" onClick={() => setRefreshKey((key) => key + 1)}><RefreshCw size={15} /></button>
              </div>
              {rosterState.loading ? <p>Loading the enrolled roster…</p> : rosterState.error ? <p role="alert" style={{ color: '#991b1b' }}>{rosterState.error}</p> : roster.length === 0 ? <p role="status" style={{ color: '#64748b' }}>No active students are recorded for this assignment.</p> : (
                <form onSubmit={submitAttendance}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    <label style={{ fontSize: 13 }}>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required style={{ display: 'block', marginTop: 4, padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }} /></label>
                    <label style={{ fontSize: 13, flex: 1, minWidth: 160 }}>Period<input value={period} onChange={(event) => setPeriod(event.target.value)} maxLength={80} placeholder="e.g. Period 2" required style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 4, padding: 9, border: '1px solid #cbd5e1', borderRadius: 8 }} /></label>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <button type="button" style={buttonStyle} onClick={() => setAllAttendance(true)}>Mark all present</button>
                    <button type="button" style={buttonStyle} onClick={() => setAllAttendance(false)}>Mark all absent</button>
                  </div>
                  <div style={{ maxHeight: 390, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                    {roster.map((student) => {
                      const value = attendance[student.rollNumber];
                      return <div key={student.id || student.rollNumber} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid #edf2f7' }}>
                        <span><strong style={{ marginRight: 9 }}>{student.rollNumber}</strong>{student.name}</span>
                        <button type="button" aria-pressed={value === true} onClick={() => setAttendance((state) => ({ ...state, [student.rollNumber]: !state[student.rollNumber] }))} style={{ ...buttonStyle, minWidth: 105, color: value === true ? '#166534' : value === false ? '#991b1b' : '#475569', borderColor: value === true ? '#86efac' : value === false ? '#fca5a5' : '#cbd5e1' }}>
                          {value === true ? <><Check size={14} /> Present</> : value === false ? 'Absent' : 'Mark status'}
                        </button>
                      </div>;
                    })}
                  </div>
                  {submitState.error && <p role="alert" style={{ color: '#991b1b' }}>{submitState.error}</p>}
                  {submitState.success && <p role="status" style={{ color: '#166534' }}>{submitState.success}</p>}
                  <button type="submit" disabled={submitState.saving || rosterState.loading} style={{ ...buttonStyle, marginTop: 13, background: '#155eef', color: '#fff', borderColor: '#155eef', opacity: submitState.saving ? .65 : 1 }}>
                    {submitState.saving ? 'Saving…' : 'Submit attendance'}
                  </button>
                </form>
              )}
            </section>

            <section style={panelStyle}>
              <h2 style={{ margin: '0 0 14px', fontSize: '1.15rem' }}>Saved attendance sessions</h2>
              {sessionsState.loading ? <p>Loading history…</p> : sessionsState.error ? <p role="alert" style={{ color: '#991b1b' }}>{sessionsState.error}</p> : sessions.length === 0 ? <p role="status" style={{ color: '#64748b' }}>No attendance sessions have been saved for this class.</p> : <div style={{ display: 'grid', gap: 10 }}>
                {sessions.map((session) => <article key={session.id} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <strong>{session.date} · {session.period}</strong>
                  <div style={{ marginTop: 5, color: '#475569', fontSize: 14 }}>{session.presentCount} present · {session.absentCount} absent · {session.percentage}%</div>
                  <small style={{ color: '#64748b' }}>Recorded by {session.facultyName}</small>
                </article>)}
              </div>}
            </section>
          </div>
          <section style={{ ...panelStyle, marginTop: 18 }} role="status">
            <h2 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}><ShieldAlert size={17} style={{ verticalAlign: 'middle', marginRight: 7 }} />Other faculty tools</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Quiz authoring, timetable, risk analytics, remedial interventions, digital evaluation, and dashboard work queues are unavailable until authenticated persistent endpoints are implemented.</p>
          </section>
        </>
      )}
    </main>
  );
}
