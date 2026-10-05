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
  subjects,
  onSelectSubject,
  currentSubjectId,
  studentsCount,
  onSwitchToTable,
}) {
  const greeting = useTimeGreeting()
  return (
    <div className="mm-teacher-overview">
      {/* Welcome Banner */}
      <div className="mm-welcome-banner">
        <div className="mm-welcome-copy">
          <div className="mm-welcome-badge">
            <Sparkles size={14} />
            <span>Faculty Workspace · School of Computing</span>
          </div>
          <h2>{greeting}, Teacher 👋</h2>
          <p>
            Welcome to the Central Marks Management Portal. Manage all 6 internal subjects,
            enter marks, finalize continuous assessment records, and track class analytics.
          </p>
          <div className="mm-welcome-actions">
            <button
              type="button"
              className="mm-btn mm-btn-primary"
              onClick={onSwitchToTable}
            >
              <CheckCircle2 size={16} />
              <span>Enter Marks Now</span>
              <ArrowRight size={15} />
            </button>
            <span className="mm-academic-pill">Academic Year 2026–27 · Semester 5</span>
          </div>
        </div>
        <div className="mm-welcome-metrics">
          <div className="mm-metric-box">
            <Award size={20} className="mm-text-blue" />
            <div>
              <strong>6</strong>
              <span>Subjects Taught</span>
            </div>
          </div>
          <div className="mm-metric-box">
            <Users size={20} className="mm-text-green" />
            <div>
              <strong>{studentsCount}</strong>
              <span>Total Students</span>
            </div>
          </div>
          <div className="mm-metric-box">
            <TrendingUp size={20} className="mm-text-purple" />
            <div>
              <strong>84%</strong>
              <span>Term Completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Subjects Section */}
      <div className="mm-section-head">
        <div>
          <h3>My Assigned Subjects</h3>
          <p>Select any subject to jump directly into its marks entry matrix or single assessment view.</p>
        </div>
      </div>

      <div className="mm-subjects-grid">
        {subjects.map((subj) => {
          const isSelected = subj.id === currentSubjectId
          const pct = subj.marksEnteredPct
          const tone = pct === 100 ? 'green' : pct >= 80 ? 'blue' : pct >= 70 ? 'amber' : 'purple'

          return (
            <div
              key={subj.id}
              className={`mm-subject-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectSubject(subj.id)}
            >
              <div className="mm-subject-card-head">
                <div className={`mm-subject-icon tone-${tone}`}>
                  <BookOpen size={20} />
                </div>
                <div className="mm-subject-code-wrap">
                  <span className="mm-subj-code">{subj.code}</span>
                  <span className="mm-subj-credits">{subj.credits} Credits</span>
                </div>
              </div>

              <h4 className="mm-subject-title">{subj.name}</h4>
              <p className="mm-subject-meta">
                <span>{subj.faculty}</span> • <span>{subj.room}</span>
              </p>

              <div className="mm-subject-stats-row">
                <div className="mm-stat-mini">
                  <Users size={14} />
                  <span>{subj.totalStudents} Students</span>
                </div>
                <div className="mm-stat-mini">
                  <Clock size={14} />
                  <span>{pct}% Marks Entered</span>
                </div>
              </div>

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
                    onSelectSubject(subj.id)
                    if (onSwitchToTable) onSwitchToTable()
                  }}
                >
                  <span>Manage Marks</span>
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
