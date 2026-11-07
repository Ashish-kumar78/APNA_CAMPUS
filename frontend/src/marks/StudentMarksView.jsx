// src/marks/StudentMarksView.jsx
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  X,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart3,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react'
import {
  SUBJECTS,
  SEMESTER_SUBJECTS,
  getMockSemesterMarks,
  ASSESSMENT_CONFIG,
  computeStudentSubjectTotal,
} from './marksData'

export default function StudentMarksView({
  student,
  marksMap,
  backendMarks = [],
  backendMarksLoaded = false,
  onOpenAnalytics,
  hideHero = false,
}) {
  const [selectedSemester, setSelectedSemester] = useState(() => {
    if (student?.semester && ['sem1', 'sem2', 'sem3', 'sem4', 'sem5'].includes(student.semester)) {
      return student.semester
    }
    return 'sem4'
  })
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedLabNumber, setSelectedLabNumber] = useState(1)
  const [selectedQuizKey, setSelectedQuizKey] = useState('q1')

  const SEMESTER_OPTIONS = [
    { value: 'sem1', label: 'Semester 1' },
    { value: 'sem2', label: 'Semester 2' },
    { value: 'sem3', label: 'Semester 3' },
    { value: 'sem4', label: 'Semester 4' },
    { value: 'sem5', label: 'Semester 5 (Current)' },
  ]

  const currentSemOption = SEMESTER_OPTIONS.find((s) => s.value === selectedSemester) || SEMESTER_OPTIONS[4]
  const currentSubjects = SEMESTER_SUBJECTS[selectedSemester] || SUBJECTS

  const getLabMarksOut60 = (labNum) => {
    if (!selectedSubject) return 52
    const rawMark = backendMarksLoaded
      ? selectedSubject.marksRecord?.lab
      : selectedSubject.marksRecord?.lab || marksMap[selectedSubject.id]?.[student.id]?.lab
    const base = rawMark !== undefined && rawMark !== '' && !isNaN(rawMark)
      ? Math.round(Number(rawMark) > 25 ? Number(rawMark) : (Number(rawMark) / 25) * 60)
      : 54
    const variations = [0, 3, -2, 4, 1, -3, 2, 5, -1, 3]
    const labScore = base + variations[(labNum - 1) % 10]
    return Math.min(60, Math.max(30, labScore))
  }

  // Compute student stats across selected semester subjects
  const subjectScores = currentSubjects.map((subject) => {
    let sMarks
    if (backendMarksLoaded) {
      const record = backendMarks.find((mark) => mark.subjectCode === subject.code)
      sMarks = record
        ? {
            mod1: record.modular1,
            mod2: record.modular2,
            q1: record.quiz1,
            q2: record.quiz2,
            q3: record.quiz3,
            q4: record.quiz4,
            q5: record.quiz5,
            q6: record.quiz6,
            a1: record.assignment1,
            a2: record.assignment2,
            st1: record.surpriseTest1,
            st2: record.surpriseTest2,
            lab: Number(record.labWork || 0) * 6,
          }
        : {
            mod1: '',
            mod2: '',
            q1: '',
            q2: '',
            q3: '',
            q4: '',
            q5: '',
            q6: '',
            a1: '',
            a2: '',
            st1: '',
            st2: '',
            lab: '',
          }
    } else {
      sMarks = marksMap[subject.id]?.[student.id]
      if (!sMarks || Object.keys(sMarks).length === 0) {
        sMarks = getMockSemesterMarks(subject.id, student.id, selectedSemester)
      }
    }
    const stats = computeStudentSubjectTotal(sMarks)
    return {
      ...subject,
      stats,
      marksRecord: sMarks,
    }
  })

  const overallAvg = Math.round(
    subjectScores.reduce((sum, s) => sum + s.stats.pct, 0) / (subjectScores.length || 1)
  )

  return (
    <div className="mm-student-view">
      {/* Student Welcome Hero Header (Only rendered when not embedded inside student profile) */}
      {!hideHero && (
        <div className="mm-student-hero">
          <div className="mm-student-hero-content">
            <div className="mm-student-avatar-lg">
              {(student?.name || 'Student').trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="mm-student-hero-details">
              <span className="mm-student-hero-eyebrow">
                <Sparkles size={13} /> Student Performance Record · {currentSemOption.label}
              </span>
              <h2>{student?.name || 'Student'}</h2>
              <p className="mm-student-hero-sub">
                Roll No: <strong>{student?.rollNo || '—'}</strong> · Registration No: <strong>{student?.regNo || '—'}</strong> · Section: <strong>{student?.section || '—'}</strong>
              </p>
            </div>
          </div>

          <div className="mm-student-overall-badge">
            <div className="mm-overall-score-circle">
              <strong>{overallAvg}%</strong>
              <small>Average</small>
            </div>
            <div className="mm-overall-copy">
              <strong>Cumulative Internal</strong>
              <span>{selectedSemester === 'sem5' ? 'Ongoing Semester' : 'Completed · Passed'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6 Subject Cards Grid (Requirement Section 5) */}
      <div className="mm-section-head">
        <div>
          <h3>Enrolled Subjects ({currentSemOption.label})</h3>
          <p>Continuous internal evaluation across modular exams, quizzes, assignments, surprise tests, and lab.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {hideHero && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>Cumulative Internal:</span>
              <strong style={{ fontSize: '0.95rem', color: '#1d4ed8', fontWeight: 800 }}>{overallAvg}% Average</strong>
            </div>
          )}
          <div className="mm-sem-dropdown-container">
          <label htmlFor="mm-sem-select" className="mm-sem-select-label">
            Semester:
          </label>
          <div className="mm-sem-select-wrapper">
            <select
              id="mm-sem-select"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value)
                setSelectedSubject(null)
              }}
              className="mm-sem-select-box"
            >
              {SEMESTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        </div>
      </div>

      <div className="mm-student-subjects-grid">
        {subjectScores.map((subject) => {
          const pct = subject.stats.pct
          const tone = pct >= 85 ? 'green' : pct >= 75 ? 'blue' : pct >= 60 ? 'amber' : 'purple'

          return (
            <div key={subject.id} className="mm-student-card">
              <div className="mm-student-card-header">
                <div>
                  <span className="mm-card-code">{subject.code}</span>
                  <h4 className="mm-card-title">{subject.name}</h4>
                  <small className="mm-card-faculty">{subject.faculty} · {subject.credits} Credits</small>
                </div>
                <div className={`mm-badge-pct tone-${tone}`}>
                  {pct}%
                </div>
              </div>

              <div className="mm-student-card-body">
                <div className="mm-score-stat-line">
                  <span>Internal Marks:</span>
                  <strong>{pct}% ({subject.stats.earned} / {subject.stats.totalMax})</strong>
                </div>

                <div className="mm-progress-bar-wrapper">
                  <div className="mm-progress-bar-bg">
                    <div
                      className={`mm-progress-bar-fill tone-${tone}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mm-mini-indicators">
                  <span>Mod: 2/2</span>
                  <span>Quiz: 6/6</span>
                  <span>Assign: 2/2</span>
                  <span>ST: 2/2</span>
                  <span>Lab: 1/1</span>
                </div>
              </div>

              <div className="mm-student-card-footer">
                <button
                  type="button"
                  className="mm-btn-view-details"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Subject Details Modal / Breakdown (Requirement Section 6) */}
      {selectedSubject && typeof document !== 'undefined' && createPortal(
        <div className="mm-modal-backdrop" onClick={() => setSelectedSubject(null)} style={{ zIndex: 999999 }}>
          <div
            className="mm-modal-window mm-subject-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mm-modal-header">
              <div className="mm-modal-title-stack">
                <span className="mm-pill-tag">{selectedSubject.code} · {selectedSubject.credits} Credits</span>
                <h3>{selectedSubject.name}</h3>
                <p>Faculty: {selectedSubject.faculty} · {selectedSubject.room}</p>
              </div>
              <button
                type="button"
                className="mm-modal-close-btn"
                onClick={() => setSelectedSubject(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mm-modal-body">
              {/* Modular Exams */}
              <div className="mm-breakdown-section">
                <div className="mm-breakdown-header">
                  <div className="mm-icon-wrap blue"><FileText size={16} /></div>
                  <h4>Modular Exams</h4>
                </div>
                <div className="mm-breakdown-grid">
                  {ASSESSMENT_CONFIG.filter((a) => a.type === 'modular').map((a) => {
                    const mark = selectedSubject.marksRecord?.[a.key] !== undefined
                      ? selectedSubject.marksRecord[a.key]
                      : marksMap[selectedSubject.id]?.[student.id]?.[a.key]
                    const val = mark !== '' && mark !== undefined ? mark : '—'
                    return (
                      <div key={a.key} className="mm-breakdown-row">
                        <span className="mm-row-label">{a.fullName}</span>
                        <strong className="mm-row-val">{val} <small>/ {a.maxMarks}</small></strong>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quizzes */}
              <div className="mm-breakdown-section">
                <div className="mm-breakdown-header">
                  <div className="mm-icon-wrap green"><CheckCircle2 size={16} /></div>
                  <h4>Quizzes</h4>
                </div>
                <div className="mm-breakdown-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="mm-breakdown-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label htmlFor="mm-quiz-select" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mm-ink-secondary)' }}>
                        Select Quiz:
                      </label>
                      <select
                        id="mm-quiz-select"
                        value={selectedQuizKey}
                        onChange={(e) => setSelectedQuizKey(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {ASSESSMENT_CONFIG.filter((a) => a.type === 'quizzes').map((a) => (
                          <option key={a.key} value={a.key}>
                            {a.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(() => {
                      const quizConfig = ASSESSMENT_CONFIG.find((a) => a.key === selectedQuizKey) || { maxMarks: 10 }
                      const mark = selectedSubject.marksRecord?.[selectedQuizKey] !== undefined
                        ? selectedSubject.marksRecord[selectedQuizKey]
                        : marksMap[selectedSubject.id]?.[student.id]?.[selectedQuizKey]
                      const val = mark !== '' && mark !== undefined
                        ? mark
                        : backendMarksLoaded ? '—' : '9'
                      return (
                        <strong className="mm-row-val" style={{ fontSize: '15px', color: '#0f172a' }}>
                          {val} <small style={{ fontSize: '13px', color: '#64748b' }}>/ {quizConfig.maxMarks}</small>
                        </strong>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div className="mm-breakdown-section">
                <div className="mm-breakdown-header">
                  <div className="mm-icon-wrap purple"><BookOpen size={16} /></div>
                  <h4>Assignments</h4>
                </div>
                <div className="mm-breakdown-grid">
                  {ASSESSMENT_CONFIG.filter((a) => a.type === 'assignments').map((a) => {
                    const mark = selectedSubject.marksRecord?.[a.key] !== undefined
                      ? selectedSubject.marksRecord[a.key]
                      : marksMap[selectedSubject.id]?.[student.id]?.[a.key]
                    const val = mark !== '' && mark !== undefined ? mark : '—'
                    return (
                      <div key={a.key} className="mm-breakdown-row">
                        <span className="mm-row-label">{a.fullName}</span>
                        <strong className="mm-row-val">{val} <small>/ {a.maxMarks}</small></strong>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Surprise Tests */}
              <div className="mm-breakdown-section">
                <div className="mm-breakdown-header">
                  <div className="mm-icon-wrap amber"><Sparkles size={16} /></div>
                  <h4>Surprise Tests</h4>
                </div>
                <div className="mm-breakdown-grid">
                  {ASSESSMENT_CONFIG.filter((a) => a.type === 'surprise').map((a) => {
                    const mark = selectedSubject.marksRecord?.[a.key] !== undefined
                      ? selectedSubject.marksRecord[a.key]
                      : marksMap[selectedSubject.id]?.[student.id]?.[a.key]
                    const val = mark !== '' && mark !== undefined ? mark : '—'
                    return (
                      <div key={a.key} className="mm-breakdown-row">
                        <span className="mm-row-label">{a.fullName}</span>
                        <strong className="mm-row-val">{val} <small>/ {a.maxMarks}</small></strong>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Lab */}
              <div className="mm-breakdown-section">
                <div className="mm-breakdown-header">
                  <div className="mm-icon-wrap teal"><Clock size={16} /></div>
                  <h4>Lab Practical</h4>
                </div>
                <div className="mm-breakdown-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="mm-breakdown-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label htmlFor="mm-lab-select" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mm-ink-secondary)' }}>
                        Select Lab:
                      </label>
                      <select
                        id="mm-lab-select"
                        value={selectedLabNumber}
                        onChange={(e) => setSelectedLabNumber(Number(e.target.value))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Lab {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <strong className="mm-row-val" style={{ fontSize: '15px', color: '#0f172a' }}>
                      {getLabMarksOut60(selectedLabNumber)} <small style={{ fontSize: '13px', color: '#64748b' }}>/ 60</small>
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bottom Overall Performance summary */}
              <div className="mm-overall-summary-card">
                <div>
                  <span>Overall Performance</span>
                  <h3>{selectedSubject.stats.pct}%</h3>
                  <small>Total: {selectedSubject.stats.earned} of {selectedSubject.stats.totalMax} Points</small>
                </div>
                <button
                  type="button"
                  className="mm-btn mm-btn-primary"
                  onClick={() => {
                    setSelectedSubject(null)
                    if (onOpenAnalytics) onOpenAnalytics(selectedSubject.id)
                  }}
                >
                  <BarChart3 size={15} />
                  <span>View Performance Analytics</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
