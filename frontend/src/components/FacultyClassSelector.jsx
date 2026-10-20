import React, { useMemo } from 'react';
import {
  Layers,
  BookOpen,
  Calendar,
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  Building,
} from 'lucide-react';
import './FacultyClassSelector.css';

export default function FacultyClassSelector({
  assignments = [],
  selectedAssignmentId = 'fa-1',
  onSelectAssignment,
  isConsolidated = false,
  onToggleConsolidated,
  totalStudentsCount,
  pendingMarksCount,
  moduleTitle,
  moduleSubtitle,
  actions,
  showConsolidatedOption = true,
}) {
  // Extract unique academic years
  const academicYears = useMemo(() => {
    return Array.from(new Set(assignments.map(a => a.academicYear || '2026-27')));
  }, [assignments]);

  // Current selected assignment
  const currentAssignment = useMemo(() => {
    return assignments.find(a => a.id === selectedAssignmentId) || assignments[0] || {};
  }, [assignments, selectedAssignmentId]);

  // Available semesters for the active assignment's academic year
  const activeYear = currentAssignment.academicYear || academicYears[0] || '2026-27';
  const availableSemesters = useMemo(() => {
    const sems = assignments
      .filter(a => (a.academicYear || '2026-27') === activeYear)
      .map(a => a.semester);
    return Array.from(new Set(sems));
  }, [assignments, activeYear]);

  // Available sections for the active year and semester
  const availableSections = useMemo(() => {
    const secs = assignments
      .filter(
        a =>
          (a.academicYear || '2026-27') === activeYear &&
          a.semester === currentAssignment.semester
      )
      .map(a => a.section);
    return Array.from(new Set(secs));
  }, [assignments, activeYear, currentAssignment.semester]);

  // Available subjects for the active year, semester, and section
  const availableSubjects = useMemo(() => {
    return assignments.filter(
      a =>
        (a.academicYear || '2026-27') === activeYear &&
        a.semester === currentAssignment.semester &&
        a.section === currentAssignment.section
    );
  }, [assignments, activeYear, currentAssignment.semester, currentAssignment.section]);

  // Handlers for dependent dropdown changes
  const handleYearChange = (newYear) => {
    if (isConsolidated && onToggleConsolidated) {
      onToggleConsolidated(false);
    }
    const match = assignments.find(a => (a.academicYear || '2026-27') === newYear);
    if (match && onSelectAssignment) onSelectAssignment(match);
  };

  const handleSemesterChange = (newSem) => {
    if (isConsolidated && onToggleConsolidated) {
      onToggleConsolidated(false);
    }
    const match = assignments.find(
      a => (a.academicYear || '2026-27') === activeYear && a.semester === newSem
    );
    if (match && onSelectAssignment) onSelectAssignment(match);
  };

  const handleSectionChange = (newSec) => {
    if (isConsolidated && onToggleConsolidated) {
      onToggleConsolidated(false);
    }
    const match = assignments.find(
      a =>
        (a.academicYear || '2026-27') === activeYear &&
        a.semester === currentAssignment.semester &&
        a.section === newSec
    );
    if (match && onSelectAssignment) onSelectAssignment(match);
  };

  const handleSubjectChange = (subjectCode) => {
    if (isConsolidated && onToggleConsolidated) {
      onToggleConsolidated(false);
    }
    const match = assignments.find(
      a =>
        (a.academicYear || '2026-27') === activeYear &&
        a.semester === currentAssignment.semester &&
        a.section === currentAssignment.section &&
        a.subjectCode === subjectCode
    );
    if (match && onSelectAssignment) onSelectAssignment(match);
  };

  // Quick switch pill click
  const handlePillClick = (assignment) => {
    if (isConsolidated && onToggleConsolidated) {
      onToggleConsolidated(false);
    }
    if (onSelectAssignment) {
      onSelectAssignment(assignment);
    }
  };

  // Total students enrolled across all active assigned classes
  const totalEnrolledAcrossAll = useMemo(() => {
    return assignments
      .filter(a => a.academicYear === '2026-27')
      .reduce((sum, a) => sum + (a.sectionEnrollment || 30), 0);
  }, [assignments]);

  return (
    <div className="faculty-class-selector-card">
      {/* Module Title & Context Header */}
      {(moduleTitle || actions) && (
        <div className="fcs-header-row">
          <div>
            {moduleTitle && <h2 className="fcs-module-title">{moduleTitle}</h2>}
            {moduleSubtitle && <p className="fcs-module-subtitle">{moduleSubtitle}</p>}
          </div>
          {actions && <div className="fcs-actions-wrap">{actions}</div>}
        </div>
      )}

      {/* Quick Teaching Assignment Switcher Pills */}
      <div className="fcs-pills-scroll-container">
        <span className="fcs-pills-label">
          <Sparkles size={14} className="fcs-sparkle-icon" /> Teaching Assignments:
        </span>
        <div className="fcs-pills-track">
          {assignments.map(a => {
            const isSelected = !isConsolidated && a.id === selectedAssignmentId;
            return (
              <button
                key={a.id}
                type="button"
                className={`fcs-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handlePillClick(a)}
                title={`${a.subjectName} (${a.subjectCode}) · ${a.program} ${a.semester} ${a.section} · ${a.academicYear}`}
              >
                <span className="fcs-pill-code">{a.subjectCode}</span>
                <span className="fcs-pill-details">
                  {a.semester.replace('Semester ', 'Sem ')} · {a.section.replace('Section ', 'Sec ')}
                </span>
                <span className="fcs-pill-count">{a.sectionEnrollment || 32}s</span>
              </button>
            );
          })}

          {showConsolidatedOption && (
            <button
              type="button"
              className={`fcs-pill-btn fcs-consolidated-pill ${isConsolidated ? 'active' : ''}`}
              onClick={() => {
                if (onToggleConsolidated) onToggleConsolidated(!isConsolidated);
              }}
              title="View all students and classes across all assigned responsibilities"
            >
              <Layers size={13} />
              <span>★ Consolidated All Classes</span>
              <span className="fcs-pill-count">{totalEnrolledAcrossAll}s</span>
            </button>
          )}
        </div>
      </div>

      {/* Detailed Dependent Dropdowns Row */}
      <div className="fcs-filter-row">
        {/* 1. Academic Year */}
        <div className="fcs-field-group">
          <label className="fcs-label">
            <Calendar size={13} /> Academic Year
          </label>
          <div className="fcs-select-wrap">
            <select
              className="fcs-select"
              value={activeYear}
              disabled={isConsolidated}
              onChange={e => handleYearChange(e.target.value)}
            >
              {academicYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr} {yr === '2026-27' ? '(Current Academic Term)' : '(Archive Term)'}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="fcs-chevron" />
          </div>
        </div>

        {/* 2. Semester */}
        <div className="fcs-field-group">
          <label className="fcs-label">
            <GraduationCap size={13} /> Semester
          </label>
          <div className="fcs-select-wrap">
            <select
              className="fcs-select"
              value={currentAssignment.semester || ''}
              disabled={isConsolidated}
              onChange={e => handleSemesterChange(e.target.value)}
            >
              {availableSemesters.map(sem => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="fcs-chevron" />
          </div>
        </div>

        {/* 3. Class / Program */}
        <div className="fcs-field-group">
          <label className="fcs-label">
            <Building size={13} /> Class / Program
          </label>
          <div className="fcs-select-wrap">
            <select
              className="fcs-select"
              value={currentAssignment.program || 'B.Tech'}
              disabled={isConsolidated}
              onChange={() => {}}
            >
              <option value="B.Tech">B.Tech (Computer Science &amp; Engineering)</option>
            </select>
            <ChevronDown size={14} className="fcs-chevron" />
          </div>
        </div>

        {/* 4. Section */}
        <div className="fcs-field-group">
          <label className="fcs-label">
            <Users size={13} /> Section
          </label>
          <div className="fcs-select-wrap">
            <select
              className="fcs-select"
              value={currentAssignment.section || ''}
              disabled={isConsolidated}
              onChange={e => handleSectionChange(e.target.value)}
            >
              {availableSections.map(sec => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="fcs-chevron" />
          </div>
        </div>

        {/* 5. Subject Taught */}
        <div className="fcs-field-group fcs-subject-field">
          <label className="fcs-label">
            <BookOpen size={13} /> Subject Taught
          </label>
          <div className="fcs-select-wrap">
            <select
              className="fcs-select"
              value={currentAssignment.subjectCode || ''}
              disabled={isConsolidated}
              onChange={e => handleSubjectChange(e.target.value)}
            >
              {availableSubjects.map(sub => (
                <option key={sub.id} value={sub.subjectCode}>
                  {sub.subjectName} ({sub.subjectCode})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="fcs-chevron" />
          </div>
        </div>
      </div>

      {/* Selected Academic Context Status Banner */}
      <div className={`fcs-context-banner ${isConsolidated ? 'consolidated' : ''}`}>
        <div className="fcs-context-left">
          <div className="fcs-context-indicator">
            <span className="fcs-pulse-dot" />
            <strong className="fcs-context-heading">
              {isConsolidated ? (
                <>All Assigned Classes &amp; Cohorts (Consolidated View)</>
              ) : (
                <>
                  {currentAssignment.subjectName} ({currentAssignment.subjectCode}) · {currentAssignment.semester} · {currentAssignment.section}
                </>
              )}
            </strong>
          </div>
          <div className="fcs-context-meta">
            {isConsolidated ? (
              <span>
                Covering all {assignments.length} assigned classes across semesters {Array.from(new Set(assignments.map(a => a.semester))).join(', ')} without duplicate student counting.
              </span>
            ) : (
              <span>
                Program: <strong>{currentAssignment.program || 'B.Tech'} {currentAssignment.deptCode || 'CSE'}</strong> · Academic Year: <strong>{activeYear}</strong> · Room: <strong>{currentAssignment.room || 'Block B - 302'}</strong> · Component: <strong>{currentAssignment.type || 'Theory + Lab'}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="fcs-context-badges">
          <div className="fcs-badge fcs-badge-students">
            <Users size={14} />
            <span>
              <strong>{totalStudentsCount !== undefined ? totalStudentsCount : currentAssignment.sectionEnrollment || 32}</strong> Students Enrolled
            </span>
          </div>

          {pendingMarksCount !== undefined && (
            <div className={`fcs-badge ${pendingMarksCount > 0 ? 'fcs-badge-warning' : 'fcs-badge-success'}`}>
              {pendingMarksCount > 0 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              <span>
                <strong>{pendingMarksCount}</strong> Marks Pending
              </span>
            </div>
          )}

          <div className="fcs-badge fcs-badge-faculty">
            <GraduationCap size={14} />
            <span>{currentAssignment.facultyName || 'Dr. S. Mohanty'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
