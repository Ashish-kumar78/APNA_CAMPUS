import React from 'react';
import { FileCheck2, ShieldAlert } from 'lucide-react';

/** Legacy marks module contained locally generated students and score sheets. */
export default function MarksManagementModule({ initialRole = 'teacher' }) {
  const isStudent = initialRole === 'student';
  return (
    <section role="status" aria-live="polite" style={{ maxWidth: 860, margin: '1.5rem auto', padding: 24, border: '1px solid #dbe4ef', borderRadius: 16, background: '#fff', color: '#172033' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 0 }}><FileCheck2 size={21} />{isStudent ? 'My marks' : 'Assessment marks'}</h2>
      <p style={{ color: '#475569', lineHeight: 1.6 }}>This view is unavailable until it is connected to the role-scoped assessment and moderation APIs. Its previous score sheets and student records were generated in the browser and were not official.</p>
      <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0, color: '#76520a' }}><ShieldAlert size={17} />No marks were changed, approved, or submitted from this screen.</p>
    </section>
  );
}
