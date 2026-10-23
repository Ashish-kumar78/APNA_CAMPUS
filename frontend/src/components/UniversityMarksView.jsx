import React from 'react';
import { AlertTriangle, GraduationCap } from 'lucide-react';
import './UniversityMarksView.css';

export default function UniversityMarksView({ onBack }) {
  return (
    <main className="univ-marks-container" role="status" aria-live="polite">
      <header className="univ-marks-nav-bar">
        <div className="univ-marks-nav-info">
          <div className="univ-marks-tag"><GraduationCap size={15} /><span>Examination results</span></div>
          <h2>Semester marks and grade point average</h2>
          <p>Certified results will appear after they are available from the authenticated examination service.</p>
        </div>
        {onBack && <button className="univ-back-btn" type="button" onClick={onBack}>Back to profile</button>}
      </header>
      <section style={{ marginTop: 20, padding: 22, border: '1px solid #dbe4ef', borderRadius: 14, background: '#fff' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0 }}><AlertTriangle size={18} />Results unavailable</h3>
        <p style={{ marginBottom: 0, color: '#475569', lineHeight: 1.6 }}>Certified semester results are not yet connected to this view. The earlier marks shown here were sample values and were not official records. No grade card can be generated.</p>
      </section>
    </main>
  );
}
