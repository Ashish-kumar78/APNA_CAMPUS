import React, { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, CalendarDays, GraduationCap } from 'lucide-react';
import { api } from '../services/api.js';
import './AcademicsPage.css';

export default function AcademicsPage({ account }) {
  const [enrollments, setEnrollments] = useState([]);
  const [state, setState] = useState({ loading: true, error: '' });
  const studentKey = account?.student?.id || account?.identifier || account?.identity || '';

  useEffect(() => {
    let active = true;
    if (!studentKey) {
      setState({ loading: false, error: 'A linked student identity is required to load academic records.' });
      return () => { active = false; };
    }
    setState({ loading: true, error: '' });
    api.getStudentEnrollments(studentKey)
      .then((result) => {
        const rows = Array.isArray(result) ? result : result?.data;
        if (!Array.isArray(rows)) throw new Error('The server returned an invalid enrollment response.');
        if (active) setEnrollments(rows);
      })
      .catch((error) => { if (active) setState({ loading: false, error: error.message || 'Academic records could not be loaded.' }); })
      .finally(() => { if (active) setState((current) => ({ ...current, loading: false })); });
    return () => { active = false; };
  }, [studentKey]);

  return (
    <main className="examination-page">
      <header className="examination-header">
        <div>
          <p className="examination-kicker"><GraduationCap size={13} /> ACADEMICS</p>
          <h2>My academic record</h2>
          <p className="examination-caption">Enrollment history is loaded for the authenticated student account.</p>
        </div>
      </header>
      {state.error && <div role="alert" style={{ margin: '16px 0', padding: 14, border: '1px solid #fecaca', borderRadius: 10, color: '#991b1b', background: '#fff' }}><AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 7 }} />{state.error}</div>}
      {state.loading ? <p role="status">Loading enrollment records…</p> : enrollments.length === 0 ? (
        <section role="status" style={{ marginTop: 18, padding: 22, border: '1px solid #dbe4ef', borderRadius: 14, background: '#fff' }}>
          <BookOpen size={21} />
          <h3>No enrollment history found</h3>
          <p style={{ color: '#64748b', marginBottom: 0 }}>No academic enrollment records are currently linked to this account.</p>
        </section>
      ) : (
        <section style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          {enrollments.map((item) => <article key={item.id} style={{ padding: 18, border: '1px solid #dbe4ef', borderRadius: 14, background: '#fff' }}>
            <h3 style={{ margin: '0 0 10px' }}>{item.semester || 'Semester not recorded'}</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#475569', fontSize: 14 }}>
              <span><CalendarDays size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{item.academicYear || 'Academic year not recorded'}</span>
              <span>Section: {item.section || 'Not recorded'}</span>
              <span>Status: {item.status || 'Not recorded'}</span>
              <span>SGPA: {item.sgpa ?? 'Not recorded'}</span>
              <span>CGPA: {item.cgpa ?? 'Not recorded'}</span>
            </div>
          </article>)}
        </section>
      )}
      <section role="status" style={{ marginTop: 20, padding: 18, border: '1px solid #e2e8f0', borderRadius: 12, color: '#64748b', background: '#f8fafc' }}>
        Exam timetable, admit cards, certified marks, syllabus files, and class-note uploads are not available here because their persistent student-scoped APIs are not yet connected.
      </section>
    </main>
  );
}
