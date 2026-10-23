import React from 'react';
import { ClipboardCheck, ShieldAlert } from 'lucide-react';

/** The selector-based legacy attendance screen used generated student rosters. */
export default function TakeAttendanceModule({ role = 'faculty', onBackToDashboard }) {
  const facultyCanUseAssignmentFlow = role === 'faculty';
  return (
    <section role="status" aria-live="polite" style={{ maxWidth: 760, margin: '2rem auto', padding: 24, border: '1px solid #dbe4ef', borderRadius: 16, background: '#fff', color: '#172033' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ClipboardCheck size={22} aria-hidden="true" />
        <h2 style={{ margin: 0 }}>Attendance</h2>
      </div>
      <p style={{ color: '#475569', lineHeight: 1.6 }}>
        This legacy selector used generated student records and has been disabled. {facultyCanUseAssignmentFlow
          ? 'Open your assigned class in the Faculty workspace to record attendance against the authenticated roster.'
          : 'Attendance recording is unavailable here until a role scoped backend workflow is provided.'}
      </p>
      <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#76520a', fontSize: '.9rem' }}>
        <ShieldAlert size={17} aria-hidden="true" /> No attendance was recorded from this screen.
      </p>
      {onBackToDashboard && <button type="button" onClick={onBackToDashboard}>Back to dashboard</button>}
    </section>
  );
}
