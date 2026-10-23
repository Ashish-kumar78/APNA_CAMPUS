import { useState } from 'react';
import { AlertCircle, CalendarDays, FileCheck2, GraduationCap } from 'lucide-react';
import './ExaminationPage.css';

const features = {
  schedule: {
    title: 'Exam timetable and hall tickets',
    detail: 'The backend does not yet have persisted exam-paper schedules, seating allocations, or hall-ticket issuance.',
  },
  results: {
    title: 'Certified examination results',
    detail: 'Certified grades and semester result records are not yet available from the backend.',
  },
  grades: {
    title: 'Grade card',
    detail: 'A grade card can only be generated from certified, persisted results. No sample marks or grades are shown here.',
  },
};

export default function ExaminationPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const feature = features[activeTab];
  const Icon = activeTab === 'schedule' ? CalendarDays : activeTab === 'results' ? GraduationCap : FileCheck2;

  return (
    <main className="examination-page">
      <header className="examination-header">
        <div>
          <p className="examination-kicker"><GraduationCap size={13} /> EXAMINATIONS</p>
          <h2>Examination</h2>
          <p className="examination-caption">Official examination information appears here when it is available from the campus backend.</p>
        </div>
      </header>
      <div className="examination-tabs" role="tablist" aria-label="Examination information">
        {[
          ['schedule', 'Timetable'],
          ['results', 'Results'],
          ['grades', 'Grade card'],
        ].map(([key, label]) => (
          <button key={key} type="button" className={activeTab === key ? 'active' : ''} role="tab" aria-selected={activeTab === key} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>
      <section className="exam-schedule-view" role="tabpanel" aria-live="polite" style={{ padding: 24, border: '1px solid #dbe4ef', borderRadius: 14, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={21} aria-hidden="true" />
          <h3 style={{ margin: 0 }}>{feature.title}</h3>
        </div>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>{feature.detail}</p>
        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#76520a', marginBottom: 0 }}>
          <AlertCircle size={17} aria-hidden="true" style={{ flex: '0 0 auto', marginTop: 2 }} />
          No exam dates, student identity, marks, grades, or downloadable official documents are being fabricated.
        </p>
      </section>
    </main>
  );
}
