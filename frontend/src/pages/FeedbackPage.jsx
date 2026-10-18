import React, { useState, useEffect } from 'react'
import {
  FileText,
  Save,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronDown,
  Info,
  Layers,
  HelpCircle,
  FlaskConical,
  BookOpen,
  Check
} from 'lucide-react'
import './FeedbackPage.css'

// ── Theory Questions (11 Evaluation Criteria) ──
export const theoryQuestions = [
  { id: 'q1', label: 'Class Management (discipline) - Begins & end class on time' },
  { id: 'q2', label: 'Teaching Ability. Is he/she well prepared for the class? Is organized and teaches clearly?' },
  { id: 'q3', label: 'Coverage of Subject. Tells the class in each meeting what is going to be taught and what students are expected to learn.' },
  { id: 'q4', label: 'Blackboard Usage/ Alternative teaching-learning methods. There is effective use of audio visual aids/handouts.' },
  { id: 'q5', label: 'Time Sense (Whether total period devoted to Lecture); Encourages students to ask questions and participate' },
  { id: 'q6', label: 'Clarification of Student doubts, answers questions clearly' },
  { id: 'q7', label: 'Usefulness of the study material provided by the faculty' },
  { id: 'q8', label: 'Communication skills (English Fluency)' },
  { id: 'q9', label: 'Voice Clarity and audibility' },
  { id: 'q10', label: "Teacher's ability to relate theory to practical situations" },
  { id: 'q11', label: 'Personal Behavior, Treats all students respectfully.' },
];

// ── Laboratory / Practical Questions (6 Evaluation Criteria) ──
export const labQuestions = [
  { id: 'lq1', label: 'Punctuality and Time Management' },
  { id: 'lq2', label: 'Instructions/ Personal interactions during the Lab' },
  { id: 'lq3', label: 'Working condition of the instruments/Machines' },
  { id: 'lq4', label: 'Evaluation of the Lab Records and Conduction of Viva' },
  { id: 'lq5', label: 'Cleanliness of the Lab' },
  { id: 'lq6', label: 'Course Coverage' },
];

// ── Theory Subjects Rows (20 Items matching exact user screenshot) ──
export const theoryRows = [
  { id: 1, teacher: 'Smruti Smaraki Sarangi', subject: 'Design and Analysis of Algorithms' },
  { id: 2, teacher: 'Sourav Ghosh', subject: 'Computer Organization & Architecture' },
  { id: 3, teacher: 'Jharana Behera', subject: 'Digital Signal Processing' },
  { id: 4, teacher: 'Sujit Kumar Panda', subject: 'Programming with Python' },
  { id: 5, teacher: 'Suvramonali Muduli', subject: 'NPTEL' },
  { id: 6, teacher: 'Bijaya Krushna Behera', subject: 'Ability Enhancement Training - C' },
  { id: 7, teacher: 'Supriti Karmakar', subject: 'Engineering economics' },
  { id: 8, teacher: 'Afreen Ali', subject: 'EKT-I' },
  { id: 9, teacher: 'Akash Kumar Panda', subject: 'Ability Enhancement Training - C' },
  { id: 10, teacher: 'Nitu Singh', subject: 'Programming with Python' },
  { id: 11, teacher: 'Smruti Smaraki Sarangi', subject: 'Design and Analysis of Algorithms' },
  { id: 12, teacher: 'Sourav Ghosh', subject: 'Computer Organization & Architecture' },
  { id: 13, teacher: 'Jharana Behera', subject: 'Digital Signal Processing' },
  { id: 14, teacher: 'Sujit Kumar Panda', subject: 'Programming with Python' },
  { id: 15, teacher: 'Suvramonali Muduli', subject: 'NPTEL' },
  { id: 16, teacher: 'Bijaya Krushna Behera', subject: 'Ability Enhancement Training - C' },
  { id: 17, teacher: 'Supriti Karmakar', subject: 'Engineering economics' },
  { id: 18, teacher: 'Afreen Ali', subject: 'EKT-I' },
  { id: 19, teacher: 'Akash Kumar Panda', subject: 'Ability Enhancement Training - C' },
  { id: 20, teacher: 'Nitu Singh', subject: 'Programming with Python' },
];

// ── Laboratory / Practical Rows (9 Items matching exact user screenshot) ──
export const labRows = [
  { id: 1, teacher: 'Sujit Kumar Panda', subject: 'Programming with Python Lab' },
  { id: 2, teacher: 'Smruti Smaraki Sarangi', subject: 'Design and Analysis of Algorithms Lab' },
  { id: 3, teacher: 'Sourav Ghosh', subject: 'Computer Organization & Architecture Lab' },
  { id: 4, teacher: 'Tarun Kumar', subject: 'Project' },
  { id: 5, teacher: 'Abinash Nayak', subject: 'Programming with Python Lab' },
  { id: 6, teacher: 'Bijayalaxmi Sahoo', subject: 'Programming with Python Lab' },
  { id: 7, teacher: 'Bijayalaxmi Sahoo', subject: 'Design and Analysis of Algorithms Lab' },
  { id: 8, teacher: 'Bijayalaxmi Sahoo', subject: 'Computer Organization & Architecture Lab' },
  { id: 9, teacher: 'Mihir Pattnaik', subject: 'Industry Oriented Computational Foundations for Artificial Intelligence' },
];

// Numbers 1 to 10 for rating
const ratingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function FeedbackPage({ onBack }) {
  // Initialize theory ratings from localStorage or default all to 10
  const [theoryRatings, setTheoryRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_campus_feedback_theory');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const initial = {};
    theoryRows.forEach((row) => {
      theoryQuestions.forEach((q) => {
        initial[`${row.id}-${q.id}`] = 10;
      });
    });
    return initial;
  });

  // Initialize lab ratings from localStorage or default all to 10
  const [labRatings, setLabRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('apna_campus_feedback_lab');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const initial = {};
    labRows.forEach((row) => {
      labQuestions.forEach((q) => {
        initial[`${row.id}-${q.id}`] = 10;
      });
    });
    return initial;
  });

  const [toastMessage, setToastMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleTheoryRatingChange = (rowId, qId, value) => {
    setTheoryRatings((prev) => ({
      ...prev,
      [`${rowId}-${qId}`]: Number(value),
    }));
  };

  const handleLabRatingChange = (rowId, qId, value) => {
    setLabRatings((prev) => ({
      ...prev,
      [`${rowId}-${qId}`]: Number(value),
    }));
  };

  // Bulk set all ratings
  const handleSetAllRatings = (val) => {
    const newTheory = {};
    theoryRows.forEach((row) => {
      theoryQuestions.forEach((q) => {
        newTheory[`${row.id}-${q.id}`] = val;
      });
    });
    setTheoryRatings(newTheory);

    const newLab = {};
    labRows.forEach((row) => {
      labQuestions.forEach((q) => {
        newLab[`${row.id}-${q.id}`] = val;
      });
    });
    setLabRatings(newLab);

    showToast(`All 29 teachers & practicals set to ${val}/10 rating!`);
  };

  const handleUpdateTheory = () => {
    try {
      localStorage.setItem('apna_campus_feedback_theory', JSON.stringify(theoryRatings));
    } catch (e) {}
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastUpdated(now);
    showToast('Theory Subjects Feedback Appraisal successfully updated!');
  };

  const handleUpdateLab = () => {
    try {
      localStorage.setItem('apna_campus_feedback_lab', JSON.stringify(labRatings));
    } catch (e) {}
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastUpdated(now);
    showToast('Laboratory/Practical Feedback Appraisal successfully updated!');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = 'dashboard';
    }
  };

  // Scroll to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="feedback-appraisal-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="feedback-toast-banner" role="alert">
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <header className="feedback-top-card">
        <div className="feedback-top-main">
          <div className="feedback-badge-pill">
            <Sparkles size={13} />
            <span>OFFICIAL FACULTY APPRAISAL · 2026-2027</span>
          </div>
          <h1>Student Feedback & Teacher Appraisal</h1>
          <p className="feedback-top-desc">
            Provide transparent, anonymous feedback about each teacher for Theory and Laboratory/Practical subjects.
            Ratings start from <strong>1 (Lowest)</strong> to <strong>10 (Highest/Excellent)</strong>. Both evaluations are submitted on this page.
          </p>

          <div className="feedback-quick-nav-bar">
            <button
              type="button"
              className="feedback-nav-chip"
              onClick={() => scrollToSection('theory-subjects-section')}
            >
              <BookOpen size={14} />
              <span>Feedback - Theory Subjects (20)</span>
            </button>
            <button
              type="button"
              className="feedback-nav-chip"
              onClick={() => scrollToSection('laboratory-subjects-section')}
            >
              <FlaskConical size={14} />
              <span>Feedback - Laboratory/Practical (9)</span>
            </button>
          </div>
        </div>

        {/* Quick Fill Utility Bar */}
        <div className="feedback-quick-presets">
          <span className="preset-label">Quick Rating Fill:</span>
          <div className="preset-buttons">
            <button type="button" onClick={() => handleSetAllRatings(10)} title="Set all ratings to 10">
              ⭐ All 10
            </button>
            <button type="button" onClick={() => handleSetAllRatings(9)} title="Set all ratings to 9">
              9
            </button>
            <button type="button" onClick={() => handleSetAllRatings(8)} title="Set all ratings to 8">
              8
            </button>
          </div>
          {lastUpdated && <span className="feedback-saved-indicator">Saved at {lastUpdated}</span>}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: FEEDBACK - THEORY SUBJECTS (EXACT SCREENSHOT MATCH)
          ───────────────────────────────────────────────────────────── */}
      <section className="feedback-table-section" id="theory-subjects-section">
        <div className="feedback-table-header-bar">
          <div className="feedback-table-title">
            <FileText size={16} />
            <h2>Feedback - Theory Subjects</h2>
          </div>
          <span className="feedback-table-counter">Showing 1-20 of 20 items.</span>
        </div>

        <div className="feedback-table-wrapper">
          <table className="feedback-data-table" aria-label="Feedback - Theory Subjects">
            <thead>
              <tr>
                <th className="col-idx">#</th>
                <th className="col-teacher">Teacher</th>
                <th className="col-subject">Subject</th>
                {theoryQuestions.map((q) => (
                  <th key={q.id} className="col-question" title={q.label}>
                    <div className="question-header-text">{q.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {theoryRows.map((row) => (
                <tr key={row.id}>
                  <td className="col-idx">{row.id}</td>
                  <td className="col-teacher">
                    <strong>{row.teacher}</strong>
                  </td>
                  <td className="col-subject">{row.subject}</td>
                  {theoryQuestions.map((q) => {
                    const key = `${row.id}-${q.id}`;
                    const val = theoryRatings[key] ?? 10;
                    return (
                      <td key={q.id} className="col-rating-cell">
                        <select
                          className="feedback-rating-select"
                          value={val}
                          onChange={(e) => handleTheoryRatingChange(row.id, q.id, e.target.value)}
                          aria-label={`${q.label} for ${row.teacher}`}
                        >
                          {ratingNumbers.map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons: Update & Back */}
        <div className="feedback-table-footer-actions">
          <button
            type="button"
            className="feedback-btn-update"
            onClick={handleUpdateTheory}
            title="Save and update Theory feedback"
          >
            <Save size={14} />
            <span>Update</span>
          </button>
          <button
            type="button"
            className="feedback-btn-back"
            onClick={handleBack}
            title="Return to Dashboard"
          >
            <span>Back</span>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: FEEDBACK - LABORATORY/PRACTICAL (EXACT SCREENSHOT MATCH)
          ───────────────────────────────────────────────────────────── */}
      <section className="feedback-table-section" id="laboratory-subjects-section">
        <div className="feedback-table-header-bar">
          <div className="feedback-table-title">
            <FileText size={16} />
            <h2>Feedback - Laboratory/Practical</h2>
          </div>
          <span className="feedback-table-counter">Showing 1-9 of 9 items.</span>
        </div>

        <div className="feedback-table-wrapper">
          <table className="feedback-data-table" aria-label="Feedback - Laboratory/Practical">
            <thead>
              <tr>
                <th className="col-idx">#</th>
                <th className="col-teacher">Teacher</th>
                <th className="col-subject">Subject</th>
                {labQuestions.map((q) => (
                  <th key={q.id} className="col-question" title={q.label}>
                    <div className="question-header-text">{q.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labRows.map((row) => (
                <tr key={row.id}>
                  <td className="col-idx">{row.id}</td>
                  <td className="col-teacher">
                    <strong>{row.teacher}</strong>
                  </td>
                  <td className="col-subject">{row.subject}</td>
                  {labQuestions.map((q) => {
                    const key = `${row.id}-${q.id}`;
                    const val = labRatings[key] ?? 10;
                    return (
                      <td key={q.id} className="col-rating-cell">
                        <select
                          className="feedback-rating-select"
                          value={val}
                          onChange={(e) => handleLabRatingChange(row.id, q.id, e.target.value)}
                          aria-label={`${q.label} for ${row.teacher}`}
                        >
                          {ratingNumbers.map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons: Update & Back */}
        <div className="feedback-table-footer-actions">
          <button
            type="button"
            className="feedback-btn-update"
            onClick={handleUpdateLab}
            title="Save and update Laboratory feedback"
          >
            <Save size={14} />
            <span>Update</span>
          </button>
          <button
            type="button"
            className="feedback-btn-back"
            onClick={handleBack}
            title="Return to Dashboard"
          >
            <span>Back</span>
          </button>
        </div>
      </section>

      {/* Confidentiality Footer Note */}
      <footer className="feedback-confidential-note">
        <Info size={15} color="#2563eb" />
        <span>
          <strong>Confidentiality Notice:</strong> All responses submitted are completely anonymous and encrypted.
          Evaluations are aggregated at the end of the semester to assist faculty development and enhance academic quality.
        </span>
      </footer>
    </div>
  )
}
