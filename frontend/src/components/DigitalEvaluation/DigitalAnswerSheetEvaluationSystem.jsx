import React from 'react';
import { FileCheck2, ShieldAlert } from 'lucide-react';
import './DigitalAnswerSheetEvaluationSystem.css';

/**
 * The former marking workspace used fabricated answer sheets and browser-only
 * marks. Do not present it as an operational exam workflow until the NestJS API
 * provides authenticated sheet assignment, mark persistence, and moderation.
 */
export default function DigitalAnswerSheetEvaluationSystem({ onClose }) {
  return (
    <main
      role="status"
      aria-live="polite"
      style={{
        maxWidth: 820,
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #dbe4ef',
        borderRadius: 18,
        background: 'linear-gradient(145deg, #fff, #f5f8fc)',
        color: '#172033',
        boxShadow: '0 12px 32px rgba(15, 23, 42, .08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <FileCheck2 size={25} aria-hidden="true" />
        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Digital Answer Sheet Evaluation</h2>
      </div>
      <p style={{ margin: '0 0 1rem', lineHeight: 1.6, color: '#475569' }}>
        Evaluation is unavailable until answer sheets, marks, and moderation decisions are stored
        through the authenticated backend. The previous workspace used sample students and local-only
        changes; those records were not official exam data.
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, color: '#76520a', fontSize: '.9rem' }}>
        <ShieldAlert size={18} aria-hidden="true" style={{ flex: '0 0 auto', marginTop: 2 }} />
        <span>No marks or exam decisions were submitted or saved.</span>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} style={{ marginTop: 20, padding: '9px 14px', cursor: 'pointer' }}>
          Close
        </button>
      )}
    </main>
  );
}
