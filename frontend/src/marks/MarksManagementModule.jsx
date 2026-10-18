// src/marks/MarksManagementModule.jsx
import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  Award,
  Layers,
  BarChart3,
  Calendar,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Save,
  Upload,
  Search,
  ChevronDown,
} from 'lucide-react'
import {
  SUBJECTS,
  SEMESTERS,
  SECTIONS,
  ACADEMIC_YEARS,
  ASSESSMENT_CONFIG,
  generateStudents,
  generateInitialMarks,
  INITIAL_ASSESSMENT_STATUS,
  computeClassStats,
} from './marksData'
import TeacherOverview from './TeacherOverview'
import TeacherMarksTable from './TeacherMarksTable'
import IndividualAssessmentView from './IndividualAssessmentView'
import StudentMarksView from './StudentMarksView'
import MarksAnalytics from './MarksAnalytics'
import BulkMarksUploadModal from './BulkMarksUploadModal'
import './MarksManagement.css'

export default function MarksManagementModule({ initialRole = 'teacher', currentStudentId = 's-4' }) {
  const isStudentOnly = initialRole === 'student'

  // Role Mode: 'teacher' | 'student'
  const [activeRole, setActiveRole] = useState(initialRole)

  // Sub-navigation view within module
  // 'overview' | 'matrix' | 'individual' | 'student-view' | 'analytics'
  const [activeView, setActiveView] = useState(isStudentOnly ? 'student-view' : 'matrix')

  // Filter state
  const [selectedSubjectId, setSelectedSubjectId] = useState('dsa')
  const [selectedSemester, setSelectedSemester] = useState('5th')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026-27')
  const [selectedAssessmentKey, setSelectedAssessmentKey] = useState('q3')

  // 91 Students and continuous marks state
  const [students] = useState(() => generateStudents())
  const [marksMap, setMarksMap] = useState(() => generateInitialMarks(generateStudents()))
  const [assessmentStatus, setAssessmentStatus] = useState(INITIAL_ASSESSMENT_STATUS)

  // Bulk Upload Modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

  // Toast notification state
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Active Subject object
  const currentSubject = useMemo(() => {
    return SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0]
  }, [selectedSubjectId])

  // Active Assessment object
  const currentAssessment = useMemo(() => {
    return ASSESSMENT_CONFIG.find((a) => a.key === selectedAssessmentKey) || ASSESSMENT_CONFIG[0]
  }, [selectedAssessmentKey])

  // Current active student for Student View (defaults to Rakesh Das)
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === currentStudentId) || students[3] // Rakesh Das is index 3
  }, [students, currentStudentId])

  // Compute Class Overview Stats (Requirement Section 1)
  const classStats = useMemo(() => {
    return computeClassStats(students, marksMap[selectedSubjectId])
  }, [students, marksMap, selectedSubjectId])

  // Handlers for modifying marks
  function handleUpdateMarks(subjectId, studentId, assessmentKey, value) {
    setMarksMap((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [studentId]: {
          ...prev[subjectId]?.[studentId],
          [assessmentKey]: value,
        },
      },
    }))
  }

  function handleSaveDraft(subjectId, assessmentKey) {
    if (assessmentKey === 'all') {
      showToast(`All draft changes saved for ${currentSubject.name}.`, 'info')
      return
    }
    setAssessmentStatus((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [assessmentKey]: 'draft',
      },
    }))
    const aName = ASSESSMENT_CONFIG.find((a) => a.key === assessmentKey)?.fullName || assessmentKey
    showToast(`Draft saved successfully for ${aName}.`, 'info')
  }

  function handleFinalize(subjectId, assessmentKey) {
    setAssessmentStatus((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [assessmentKey]: 'finalized',
      },
    }))
    const aName = ASSESSMENT_CONFIG.find((a) => a.key === assessmentKey)?.fullName || assessmentKey
    showToast(`${aName} marks have been finalized and locked for grade generation.`, 'success')
  }

  function handleImportComplete(count) {
    showToast(`Successfully imported ${count} valid student records for ${currentSubject.name}.`, 'success')
  }

  function handleResetFilters() {
    setSelectedSubjectId('dsa')
    setSelectedSemester('5th')
    setSelectedSection('A')
    setSelectedAcademicYear('2026-27')
    showToast('Filters reset to default values.', 'info')
  }

  function handleOpenIndividualAssessment(assessmentKey) {
    setSelectedAssessmentKey(assessmentKey)
    setActiveView('individual')
  }

  return (
    <div className="mm-root-shell">
      {/* Toast Notification Notification Pill */}
      {toast && (
        <div className={`mm-toast-alert mm-toast-${toast.type}`} role="alert">
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Application Bar with Role Mode Switcher */}
      <div className="mm-top-role-bar">
        <div className="mm-role-info">
          <div className="mm-module-icon">
            <Award size={20} />
          </div>
          <div>
            <h1 className="mm-module-title">Marks Management Module</h1>
            <p className="mm-module-subtitle">Autonomous College Continuous Internal Assessment (CIA) & Grading Engine</p>
          </div>
        </div>

        {/* Seamless Role View Switcher - Only visible to Teacher, HOD, Faculty, Admin (Hidden from Student) */}
        {!isStudentOnly && (
          <div className="mm-role-switcher" role="radiogroup" aria-label="Portal Mode">
            <button
              type="button"
              className={`mm-role-btn ${activeRole === 'teacher' ? 'active' : ''}`}
              onClick={() => {
                setActiveRole('teacher')
                if (activeView === 'student-view') setActiveView('matrix')
              }}
            >
              <UserCheck size={15} />
              <span>Faculty / Teacher View</span>
            </button>
            <button
              type="button"
              className={`mm-role-btn ${activeRole === 'student' ? 'active' : ''}`}
              onClick={() => {
                setActiveRole('student')
                setActiveView('student-view')
              }}
            >
              <GraduationCap size={15} />
              <span>Student View ({currentStudent.name})</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Level Section 1: Marks Management Dashboard Stats Bar */}
      {activeRole === 'teacher' && (
        <div className="mm-stats-overview-grid">
          <div className="mm-kpi-card tone-blue">
            <div className="mm-kpi-icon"><Users size={20} /></div>
            <div>
              <span className="mm-kpi-label">Total Students</span>
              <strong className="mm-kpi-value">{students.length}</strong>
              <small className="mm-kpi-sub">Enrolled in 5th Sem</small>
            </div>
          </div>

          <div className="mm-kpi-card tone-purple">
            <div className="mm-kpi-icon"><BookOpen size={20} /></div>
            <div>
              <span className="mm-kpi-label">Total Subjects</span>
              <strong className="mm-kpi-value">{SUBJECTS.length}</strong>
              <small className="mm-kpi-sub">Continuous Evaluation</small>
            </div>
          </div>

          <div className="mm-kpi-card tone-green">
            <div className="mm-kpi-icon"><CheckCircle2 size={20} /></div>
            <div>
              <span className="mm-kpi-label">Completed Assessments</span>
              <strong className="mm-kpi-value">{classStats.completedPct}%</strong>
              <small className="mm-kpi-sub">Marks Entered</small>
            </div>
          </div>

          <div className="mm-kpi-card tone-amber">
            <div className="mm-kpi-icon"><AlertCircle size={20} /></div>
            <div>
              <span className="mm-kpi-label">Pending Marks</span>
              <strong className="mm-kpi-value">{classStats.pendingTotal}</strong>
              <small className="mm-kpi-sub">Awaiting Entry</small>
            </div>
          </div>

          <div className="mm-kpi-card tone-teal">
            <div className="mm-kpi-icon"><TrendingUp size={20} /></div>
            <div>
              <span className="mm-kpi-label">Average Class Marks</span>
              <strong className="mm-kpi-value">{classStats.avgPct}%</strong>
              <small className="mm-kpi-sub">{currentSubject.shortName} Class Cohort</small>
            </div>
          </div>

          <div className="mm-kpi-card tone-indigo">
            <div className="mm-kpi-icon"><Award size={20} /></div>
            <div>
              <span className="mm-kpi-label">Overall Performance</span>
              <strong className="mm-kpi-value">{classStats.highestPct}%</strong>
              <small className="mm-kpi-sub">Top Score in Course</small>
            </div>
          </div>
        </div>
      )}

      {/* Global Filter Bar (Requirement Section 1 & 8) */}
      {activeRole === 'teacher' && (
        <div className="mm-filter-bar-card">
          <div className="mm-filter-bar-grid">
            {/* Subject Selector */}
            <div className="mm-select-field">
              <label>Select Subject</label>
              <div className="mm-select-wrap">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="mm-select-arrow" />
              </div>
            </div>

            {/* Semester Selector */}
            <div className="mm-select-field">
              <label>Semester</label>
              <div className="mm-select-wrap">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="mm-select-arrow" />
              </div>
            </div>

            {/* Section Selector */}
            <div className="mm-select-field">
              <label>Section</label>
              <div className="mm-select-wrap">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  {SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="mm-select-arrow" />
              </div>
            </div>

            {/* Academic Year Selector */}
            <div className="mm-select-field">
              <label>Academic Year</label>
              <div className="mm-select-wrap">
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="mm-select-arrow" />
              </div>
            </div>

            {/* Reset Filters button */}
            <div className="mm-filter-reset-wrap">
              <button
                type="button"
                className="mm-btn mm-btn-ghost"
                onClick={handleResetFilters}
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Navigation Tabs (Teacher Mode) */}
      {activeRole === 'teacher' && (
        <div className="mm-view-nav-tabs">
          <button
            type="button"
            className={`mm-vnav-btn ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <Sparkles size={16} />
            <span>Teacher Overview</span>
          </button>

          <button
            type="button"
            className={`mm-vnav-btn ${activeView === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveView('matrix')}
          >
            <Layers size={16} />
            <span>Marks Entry Matrix (All Assessments)</span>
          </button>

          <button
            type="button"
            className={`mm-vnav-btn ${activeView === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveView('individual')}
          >
            <CheckCircle2 size={16} />
            <span>Individual Assessment Entry ({currentAssessment.label})</span>
          </button>

          <button
            type="button"
            className={`mm-vnav-btn ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            <BarChart3 size={16} />
            <span>Marks Analytics</span>
          </button>
        </div>
      )}

      {/* Sub-view Content Panels */}
      <div className="mm-module-content">
        {activeRole === 'student' ? (
          <StudentMarksView
            student={currentStudent}
            marksMap={marksMap}
            onOpenAnalytics={() => {
              if (!isStudentOnly) {
                setActiveRole('teacher')
                setActiveView('analytics')
              }
            }}
          />
        ) : activeView === 'overview' ? (
          <TeacherOverview
            subjects={SUBJECTS}
            currentSubjectId={selectedSubjectId}
            onSelectSubject={(id) => setSelectedSubjectId(id)}
            studentsCount={students.length}
            onSwitchToTable={() => setActiveView('matrix')}
          />
        ) : activeView === 'individual' ? (
          <IndividualAssessmentView
            subject={currentSubject}
            assessment={currentAssessment}
            students={students}
            marksMap={marksMap}
            onUpdateMarks={handleUpdateMarks}
            onSaveDraft={handleSaveDraft}
            onFinalize={handleFinalize}
            assessmentStatus={assessmentStatus}
            onBackToMatrix={() => setActiveView('matrix')}
            onSwitchAssessment={(k) => setSelectedAssessmentKey(k)}
            assessmentList={ASSESSMENT_CONFIG}
          />
        ) : activeView === 'analytics' ? (
          <MarksAnalytics
            students={students}
            marksMap={marksMap}
            currentSubjectId={selectedSubjectId}
            onSelectSubject={(id) => setSelectedSubjectId(id)}
          />
        ) : (
          /* Default: Teacher Marks Matrix Table (Requirements 2, 3, 8, 10) */
          <TeacherMarksTable
            subject={currentSubject}
            students={students}
            marksMap={marksMap}
            onUpdateMarks={handleUpdateMarks}
            onSaveDraft={handleSaveDraft}
            onFinalize={handleFinalize}
            assessmentStatus={assessmentStatus}
            onOpenIndividualAssessment={handleOpenIndividualAssessment}
            onOpenBulkUpload={() => setIsBulkModalOpen(true)}
          />
        )}
      </div>

      {/* Bulk Marks Upload Modal (Requirement Section 9) */}
      <BulkMarksUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        subject={currentSubject}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}
