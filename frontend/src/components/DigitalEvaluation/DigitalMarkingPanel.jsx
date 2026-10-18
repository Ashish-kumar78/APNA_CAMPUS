import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Save,
  Send,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Award,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Sparkles,
  Lock
} from 'lucide-react';
import { EVALUATION_SCHEME, calculateEvaluationSummary } from '../../services/digitalEvaluationStore.js';

export default function DigitalMarkingPanel({
  sheet,
  marks = {},
  facultyRemarks = '',
  onMarksChange,
  onRemarksChange,
  onSaveDraft,
  onSubmitEvaluation,
  onResetMarks,
  readOnly = false,
  isHodReview = false,
  onHodApprove,
  onHodReturn
}) {
  const [collapsedSections, setCollapsedSections] = useState({
    sec1: false,
    sec2: false,
    sec3: false,
    sec4: false
  });
  const [hodComment, setHodComment] = useState(sheet?.hodRemarks || '');

  // Calculate live summary with business rule validation
  const summary = useMemo(() => calculateEvaluationSummary(marks), [marks]);

  const toggleSection = (secId) => {
    setCollapsedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleInputChange = (qId, val, maxMarks) => {
    if (readOnly) return;
    if (val === '') {
      onMarksChange(qId, '');
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return;
    // Cap between 0 and maxMarks
    const clamped = Math.max(0, Math.min(num, maxMarks));
    onMarksChange(qId, clamped);
  };

  const handleQuickScore = (qId, score) => {
    if (readOnly) return;
    onMarksChange(qId, score);
  };

  return (
    <div className="eval-marking-panel">
      {/* ── Top Header & Grand Total Widget ── */}
      <div className="marking-panel-header">
        <div className="marking-title-row">
          <div>
            <span className="marking-sub-kicker">AUTONOMOUS RUBRIC ENGINE</span>
            <h3 className="marking-main-title">Digital Marking Panel</h3>
            <span className="marking-sheet-tag">Script: <strong>{sheet?.id || 'AS-CSE-0001'}</strong></span>
          </div>

          <div className="marking-grand-total-card">
            <div className="grand-total-score">
              <span className="total-num">{summary.grandTotal}</span>
              <span className="total-den">/ 100</span>
            </div>
            <div className="grand-total-grade">
              Grade: <strong>{summary.grade}</strong>
            </div>
          </div>
        </div>

        {/* Real-Time Rule Engine Status Bar */}
        <div className="marking-status-bar">
          <div className="status-metric">
            <span>Questions Attempted:</span>
            <strong>{summary.totalAttemptedQuestions} / {EVALUATION_SCHEME.totalQuestions}</strong>
          </div>
          <div className="status-metric">
            <span>Counted Answers:</span>
            <strong>{summary.totalCountedQuestions} / {EVALUATION_SCHEME.requiredAttempts}</strong>
          </div>
          <div className="status-metric">
            <span>Score Percentage:</span>
            <strong>{summary.percentage}%</strong>
          </div>
        </div>
      </div>

      {/* ── Section-by-Section Marking Accordions ── */}
      <div className="marking-sections-container">
        {EVALUATION_SCHEME.sections.map((sec) => {
          const secSummary = summary.sections[sec.id] || {
            sectionTotal: 0,
            attemptCount: 0,
            countedIds: new Set(),
            extraIds: new Set(),
            isCapped: false
          };

          const isCollapsed = collapsedSections[sec.id];

          return (
            <div key={sec.id} className={`marking-section-card ${sec.id}`}>
              {/* Section Header */}
              <div className="section-card-head" onClick={() => toggleSection(sec.id)}>
                <div className="sec-head-left">
                  <div className="sec-title-wrap">
                    <h4>{sec.title}</h4>
                    <p className="sec-instruction-text">{sec.description}</p>
                  </div>
                  <div className="sec-rules-chips">
                    <span className="chip-req">
                      {sec.isCompulsory ? 'Compulsory (All 10)' : `Answer Any ${sec.requiredAttempts} of ${sec.questionsAvailable}`}
                    </span>
                    <span className="chip-marks-per-q">{sec.marksPerQuestion} Marks / Question</span>
                  </div>
                </div>

                <div className="sec-head-right">
                  <div className="sec-score-summary">
                    <strong className="sec-score-value">{secSummary.sectionTotal}</strong>
                    <span className="sec-score-max">/ {sec.maxMarks}</span>
                  </div>
                  <button type="button" className="btn-toggle-sec" aria-label="Toggle Section">
                    {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                </div>
              </div>

              {/* Attempt Rule Enforcement Alert (if student attempted extra questions) */}
              {!isCollapsed && secSummary.isCapped && (
                <div className="capping-alert-banner">
                  <AlertCircle size={14} />
                  <span>
                    <strong>Attempt Capping Enforced:</strong> Student answered {secSummary.attemptCount} questions. System automatically selected the <strong>Best {sec.requiredAttempts}</strong> highest responses to award maximum {sec.maxMarks} marks.
                  </span>
                </div>
              )}

              {/* Questions List */}
              {!isCollapsed && (
                <div className="section-questions-list">
                  {sec.questions.map((q) => {
                    const rawVal = marks[q.id];
                    const isAttempted = rawVal !== undefined && rawVal !== null && rawVal !== '';
                    const isCounted = isAttempted && secSummary.countedIds.has(q.id);
                    const isExtra = isAttempted && secSummary.extraIds.has(q.id);

                    return (
                      <div
                        key={q.id}
                        className={`question-mark-row ${isAttempted ? 'is-attempted' : 'not-attempted'} ${isCounted ? 'is-counted' : ''} ${isExtra ? 'is-extra-attempt' : ''}`}
                      >
                        <div className="q-left-info">
                          <div className="q-label-badge">
                            <strong>{q.label}</strong>
                            <small>Max: {q.maxMarks}M</small>
                          </div>
                          <div className="q-desc-copy">
                            <span className="q-desc-text">{q.desc}</span>
                            {/* Attempt Rule Status Badge */}
                            {isCounted && (
                              <span className="badge-counted-rule">
                                <CheckCircle2 size={11} /> Counted in Total
                              </span>
                            )}
                            {isExtra && (
                              <span className="badge-extra-rule">
                                <AlertCircle size={11} /> Extra Attempt (Capped)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="q-right-input">
                          {/* Quick Score Buttons */}
                          {!readOnly && (
                            <div className="quick-score-buttons">
                              <button
                                type="button"
                                className={`btn-qs ${rawVal === 0 ? 'selected' : ''}`}
                                onClick={() => handleQuickScore(q.id, 0)}
                                title="0 Marks"
                              >
                                0
                              </button>
                              <button
                                type="button"
                                className={`btn-qs ${rawVal === q.maxMarks / 2 ? 'selected' : ''}`}
                                onClick={() => handleQuickScore(q.id, q.maxMarks / 2)}
                                title="Half Marks"
                              >
                                {q.maxMarks / 2}
                              </button>
                              <button
                                type="button"
                                className={`btn-qs ${rawVal === q.maxMarks ? 'selected' : ''}`}
                                onClick={() => handleQuickScore(q.id, q.maxMarks)}
                                title="Full Marks"
                              >
                                {q.maxMarks}
                              </button>
                            </div>
                          )}

                          {/* Direct Number Input */}
                          <div className="score-input-wrap">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={q.maxMarks}
                              className={`score-num-field ${isAttempted ? 'has-value' : ''}`}
                              placeholder="—"
                              value={rawVal ?? ''}
                              disabled={readOnly}
                              onChange={(e) => handleInputChange(q.id, e.target.value, q.maxMarks)}
                            />
                            <span className="score-unit">/ {q.maxMarks}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Evaluator Remarks & Official Submission ── */}
      <div className="marking-panel-footer">
        <div className="remarks-box">
          <label className="remarks-label">
            <span>Evaluator Assessment Remarks &amp; Feedback:</span>
            <small>Visible in HOD review &amp; student audit transcript</small>
          </label>
          <textarea
            rows={2}
            className="remarks-textarea"
            placeholder="Enter qualitative comments, problem analysis, strengths and areas of improvement..."
            value={facultyRemarks}
            disabled={readOnly}
            onChange={(e) => onRemarksChange && onRemarksChange(e.target.value)}
          />
        </div>

        {/* HOD Review Controls (When viewed by HOD) */}
        {isHodReview && (
          <div className="hod-review-action-box">
            <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: '#0f172a' }}>HOD Moderation &amp; Verification</h4>
            <textarea
              rows={2}
              className="remarks-textarea"
              placeholder="Enter HOD moderation remarks or re-evaluation instructions..."
              value={hodComment}
              onChange={(e) => setHodComment(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-hod-return"
                onClick={() => onHodReturn && onHodReturn(sheet.id, hodComment)}
              >
                Return to Faculty with Feedback
              </button>
              <button
                type="button"
                className="btn-hod-approve"
                onClick={() => onHodApprove && onHodApprove(sheet.id, hodComment)}
              >
                <ShieldCheck size={14} /> Approve &amp; Certify Marks
              </button>
            </div>
          </div>
        )}

        {/* Standard Evaluator Action Buttons */}
        {!readOnly && !isHodReview && (
          <div className="marking-action-buttons">
            <button
              type="button"
              className="btn-eval-reset"
              onClick={onResetMarks}
              title="Reset all question marks to blank"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="button"
              className="btn-eval-draft"
              onClick={onSaveDraft}
              title="Save work as draft to resume later"
            >
              <Save size={14} /> Save Draft
            </button>
            <button
              type="button"
              className="btn-eval-submit"
              onClick={onSubmitEvaluation}
              title="Sign and submit evaluation to Head of Department"
            >
              <Send size={14} /> Submit Evaluation to HOD →
            </button>
          </div>
        )}

        {readOnly && !isHodReview && (
          <div className="marking-locked-banner">
            <Lock size={15} />
            <span>
              Evaluation {sheet?.status === 'HOD Approved' ? 'Approved by HOD' : 'Submitted'}. Script marks are locked against modifications.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
