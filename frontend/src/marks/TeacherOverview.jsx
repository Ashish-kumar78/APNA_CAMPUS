// src/marks/TeacherOverview.jsx
import React from 'react'
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react'
import { useTimeGreeting } from '../utils/timeGreeting.js'

export default function TeacherOverview({
  subjects = [],
  onSelectSubject,
  currentSubjectId,
  studentsCount,
  onSwitchToTable,
  assignedClasses = [],
  onSelectClass,
}) {
  const greeting = useTimeGreeting()
  const displayClasses = assignedClasses && assignedClasses.length > 0 ? assignedClasses : subjects

  // Aggregate stats across all assigned classes
  const totalEnrolled = assignedClasses.reduce((sum, c) => sum + (c.studentCount || c.totalStudents || 30), 0)
  const totalPending = assignedClasses.reduce((sum, c) => sum + (c.pendingMarksCount || 0), 0)
  const avgCompletion = assignedClasses.length > 0
    ? Math.round(assignedClasses.reduce((sum, c) => sum + (c.completionPct || c.marksEnteredPct || 80), 0) / assignedClasses.length)
    : 84

  return (
    <div className="mm-teacher-overview">
      {/* Welcome Banner */}
      <div className="mm-welcome-banner">
        <div className="mm-welcome-copy">
          <div className="mm-welcome-badge">
            <Sparkles size={14} />
            <span>Faculty Academic Evaluation Workspace</span>
          </div>
          <h2>{greeting}, Dr. S. Mohanty 👋</h2>
          <p>
            Consolidated marks management overview across your assigned classes, sections, and semesters.
            Enter continuous evaluation scores, finalize internal assessments, and review grade distribution.
          </p>
          <div className="mm-welcome-actions">
            <button
              type="button"
              className="mm-btn mm-btn-primary"
              onClick={onSwitchToTable}
            >
              <CheckCircle2 size={16} />
              <span>Enter Marks in Active Class</span>
              <ArrowRight size={15} />
            </button>
            <span className="mm-academic-pill">Autonomous Regulation · Continuous Internal Assessment (CIA)</span>
          </div>
        </div>
        <div className="mm-welcome-metrics">
          <div className="mm-metric-box">
            <Award size={20} className="mm-text-blue" />
            <div>
              <strong>{displayClasses.length}</strong>
              <span>Assigned Classes</span>
            </div>
          </div>
          <div className="mm-metric-box">
            <Users size={20} className="mm-text-green" />
            <div>
              <strong>{totalEnrolled}</strong>
              <span>Total Students</span>
            </div>
          </div>
          <div className="mm-metric-box">
            <TrendingUp size={20} className="mm-text-purple" />
            <div>
              <strong>{avgCompletion}%</strong>
              <span>Overall Completion</span>
            </div>
          </div>
          <div className="mm-metric-box">
            <Clock size={20} className="mm-text-amber" />
            <div>
              <strong>{totalPending}</strong>
              <span>Pending Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Classes Section */}
      <div className="mm-section-head">
        <div>
          <h3>Consolidated Teaching Responsibilities ({displayClasses.length} Assigned Cohorts)</h3>
          <p>Individual assessment records are kept strictly organized by subject, section, semester, and academic year.</p>
        </div>
      </div>

      <div className="mm-subjects-grid">
        {displayClasses.map((item) => {
          const isSelected = item.subjectId === currentSubjectId || item.id === currentSubjectId
          const pct = item.completionPct || item.marksEnteredPct || 80
          const tone = pct === 100 ? 'green' : pct >= 80 ? 'blue' : pct >= 70 ? 'amber' : 'purple'
          const sCount = item.studentCount || item.totalStudents || 32
          const pCount = item.pendingMarksCount !== undefined ? item.pendingMarksCount : 0

          return (
            <div
              key={item.id}
              className={`mm-subject-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => {
                if (onSelectClass) onSelectClass(item)
                else if (onSelectSubject) onSelectSubject(item.subjectId || item.id)
              }}
            >
              <div className="mm-subject-card-head">
                <div className={`mm-subject-icon tone-${tone}`}>
                  <BookOpen size={20} />
                </div>
                <div className="mm-subject-code-wrap">
                  <span className="mm-subj-code">{item.subjectCode || item.code}</span>
                  <span className="mm-subj-credits">{item.credits || 4} Credits</span>
                </div>
              </div>

              <h4 className="mm-subject-title">{item.subjectName || item.name}</h4>
              <p className="mm-subject-meta">
                <span style={{ fontWeight: 700, color: '#1e40af' }}>
                  {item.semester ? `Semester ${item.semester.replace(/[^0-9]/g, '')}` : 'Sem 5'} · Section {item.section}
                </span>{' '}
                • <span>AY {item.academicYear || '2026-27'}</span> • <span>{item.room || 'Block B - 302'}</span>
              </p>

              <div className="mm-subject-stats-row">
                <div className="mm-stat-mini">
                  <Users size={14} />
                  <span>{sCount} Students</span>
                </div>
                <div className="mm-stat-mini">
                  <Clock size={14} />
                  <span>{pct}% Marks Entered</span>
                </div>
              </div>

              {pCount > 0 ? (
                <div style={{ margin: '6px 0 2px', fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                  ⚠️ {pCount} students with pending marks
                </div>
              ) : (
                <div style={{ margin: '6px 0 2px', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  ✓ All component marks entered
                </div>
              )}

              <div className="mm-progress-track">
                <div
                  className={`mm-progress-fill tone-${tone}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mm-subject-footer">
                <button
                  type="button"
                  className={`mm-btn-manage ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onSelectClass) onSelectClass(item)
                    else if (onSelectSubject) onSelectSubject(item.subjectId || item.id)
                    if (onSwitchToTable) onSwitchToTable()
                  }}
                >
                  <span>Enter / Edit Marks</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
