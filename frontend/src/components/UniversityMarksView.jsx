import React, { useState, useMemo } from 'react';
import {
  Download,
  ArrowLeft,
  GraduationCap,
  Award,
  Layers,
  Search,
  CheckCircle2,
  BookOpen,
  FlaskConical,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import './UniversityMarksView.css';
import { downloadGradeCardPdf } from '../utils/pdfGenerator';
import { isDemoAccount } from '../utils/authUtils.js';

export const universitySemesterData = [
  {
    id: 4,
    title: 'Semester # 4',
    roman: 'IV',
    academicYear: '2025–26',
    session: 'Even Semester (Jan – Jun 2026)',
    examDate: 'June 2026',
    sgpa: '8.58',
    cgpa: '8.78',
    status: 'PASSED',
    standing: 'First Class with Distinction',
    subjects: [
      { code: 'ETCS-T-PC-401', name: 'Engineering Economics', type: 'T', credit: '3', grade: 'B' },
      { code: 'ETCS-T-PC-402', name: 'Design and Analysis of Algorithms', type: 'T', credit: '3', grade: 'A' },
      { code: 'ETCS-T-PC-403', name: 'Computer Organisation & Architecture', type: 'T', credit: '3', grade: 'A' },
      { code: 'ETCS-T-PC-404', name: 'Programming with Python', type: 'T', credit: '3', grade: 'A' },
      { code: 'ETEC-T-OE-401', name: 'Digital Signal Processing', type: 'T', credit: '3', grade: 'B' },
      { code: 'ETSC-T-AE-401', name: 'Ability Enhancement Training - C', type: 'T', credit: '1', grade: 'C' },
      { code: 'ETMC-T-MC-402', name: 'Essence of Indian knowledge and tradition-I', type: 'T', credit: '0', grade: 'C' },
      { code: 'ETCS-P-PR-401', name: 'Project-II', type: 'P', credit: '2', grade: 'O' },
      { code: 'ETCS-P-PC-401', name: 'Design and Analysis of Algorithms Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETCS-P-PC-402', name: 'Computer Organisation & Architecture Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETCS-P-PC-403', name: 'Programming with Python Lab', type: 'P', credit: '1', grade: 'O' },
    ]
  },
  {
    id: 3,
    title: 'Semester # 3',
    roman: 'III',
    academicYear: '2025–26',
    session: 'Odd Semester (Jul – Dec 2025)',
    examDate: 'December 2025',
    sgpa: '8.78',
    cgpa: '8.85',
    status: 'PASSED',
    standing: 'First Class with Distinction',
    subjects: [
      { code: 'ETCS-T-BS-301', name: 'Mathematics for Computer Science', type: 'T', credit: '3', grade: 'E' },
      { code: 'ETHS-T-HS-301', name: 'Organisational Behavior', type: 'T', credit: '3', grade: 'E' },
      { code: 'ETCS-T-PC-301', name: 'Object Oriented Programming using JAVA', type: 'T', credit: '3', grade: 'B' },
      { code: 'ETCS-T-PC-302', name: 'Database Management System', type: 'T', credit: '3', grade: 'A' },
      { code: 'ETEC-T-OE-301', name: 'Digital Logic Design', type: 'T', credit: '3', grade: 'E' },
      { code: 'ETSC-T-AE-301', name: 'Ability Enhancement Training B', type: 'T', credit: '1', grade: 'B' },
      { code: 'ETMC-T-MC-301', name: 'Environmental Engineering', type: 'T', credit: '0', grade: 'O' },
      { code: 'ETCS-P-IN-301', name: 'Evaluation of Summer Internship-I', type: 'P', credit: '2', grade: 'O' },
      { code: 'ETCS-P-PC-301', name: 'Object Oriented Programming using JAVA Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETCS-P-PC-302', name: 'Database Management System Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETEC-P-OE-301', name: 'Digital Logic Design Lab', type: 'P', credit: '1', grade: 'E' },
      { code: 'ETPS-P-PS-301', name: 'Seminar - I', type: 'P', credit: '1', grade: 'O' },
    ]
  },
  {
    id: 2,
    title: 'Semester # 2',
    roman: 'II',
    academicYear: '2024–25',
    session: 'Even Semester (Jan – Jun 2025)',
    examDate: 'June 2025',
    sgpa: '8.98',
    cgpa: '8.95',
    status: 'PASSED',
    standing: 'First Class with Distinction',
    subjects: [
      { code: 'ETBS-T-BS-201', name: 'Mathematics-II', type: 'T', credit: '3', grade: 'E' },
      { code: 'ETES-T-ES-201', name: 'Basic Electronics Engineering', type: 'T', credit: '3', grade: 'E' },
      { code: 'ETES-T-ES-202', name: 'Programming Using Data Structure', type: 'T', credit: '3', grade: 'A' },
      { code: 'ETBS-T-BS-202', name: 'Applied Chemistry', type: 'T', credit: '3', grade: 'B' },
      { code: 'ETES-T-ES-203', name: 'Basic Civil Engineering', type: 'T', credit: '2', grade: 'E' },
      { code: 'ETHS-T-HS-201', name: 'English for Engineers-II', type: 'T', credit: '1', grade: 'A' },
      { code: 'ETMC-T-MC-201', name: 'Constitution of India', type: 'T', credit: '0', grade: 'O' },
      { code: 'ETES-P-ES-201', name: 'Programming Using Data Structure Lab', type: 'P', credit: '2', grade: 'O' },
      { code: 'ETES-P-ES-202', name: 'Workshop Practice-I', type: 'P', credit: '1.5', grade: 'E' },
      { code: 'ETBS-P-BS-201', name: 'Applied Chemistry Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETES-P-ES-203', name: 'Basic Civil Engineering Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETES-P-ES-204', name: 'Basic Electronics Engineering Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETPS-P-PR-201', name: 'Project-I', type: 'P', credit: '1', grade: 'O' },
    ]
  },
  {
    id: 1,
    title: 'Semester # 1',
    roman: 'I',
    academicYear: '2024–25',
    session: 'Odd Semester (Jul – Dec 2024)',
    examDate: 'December 2024',
    sgpa: '8.92',
    cgpa: '8.92',
    status: 'PASSED',
    standing: 'First Class with Distinction',
    subjects: [
      { code: 'ETBS-T-BS-101', name: 'Mathematics-I', type: 'T', credit: '3', grade: 'E' },
      { code: 'ETES-T-ES-101', name: 'Basic Programming Skills', type: 'T', credit: '3', grade: 'A' },
      { code: 'ETBS-T-BS-102', name: 'Elements of Engineering Physics', type: 'T', credit: '3', grade: 'A' },
      { code: 'ETES-T-ES-102', name: 'Basic Electrical Engg', type: 'T', credit: '3', grade: 'E' },
      { code: 'ETES-T-ES-103', name: 'Basic Mechanical Engineering', type: 'T', credit: '2', grade: 'A' },
      { code: 'ETHS-T-HS-101', name: 'English for Engineer - I', type: 'T', credit: '1', grade: 'B' },
      { code: 'ETES-P-ES-101', name: 'Basic Programming Skills Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETPS-P-PR-101', name: 'Project - III', type: 'P', credit: '2', grade: 'O' },
      { code: 'ETES-P-ES-102', name: 'Engineering Graphics with AutoCAD', type: 'P', credit: '1.5', grade: 'O' },
      { code: 'ETBS-P-BS-101', name: 'Elements of Engineering Physics Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETES-P-ES-103', name: 'Basic Mechanical Engineering Lab', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETES-P-ES-104', name: 'Basic Electrical Engg. Lab', type: 'P', credit: '1', grade: 'E' },
      { code: 'ETHS-P-HS-101', name: 'English For Engineer Lab-I', type: 'P', credit: '1', grade: 'O' },
      { code: 'ETPS-P-PR-102', name: 'Project-I', type: 'P', credit: '1', grade: 'O' },
    ]
  }
];

const GRADE_INFO = {
  O: { label: 'Outstanding', points: 10, badgeClass: 'grade-pill-o' },
  E: { label: 'Excellent', points: 9, badgeClass: 'grade-pill-e' },
  A: { label: 'Very Good', points: 8, badgeClass: 'grade-pill-a' },
  B: { label: 'Good', points: 7, badgeClass: 'grade-pill-b' },
  C: { label: 'Fair', points: 6, badgeClass: 'grade-pill-c' },
  D: { label: 'Pass', points: 5, badgeClass: 'grade-pill-d' },
  F: { label: 'Fail', points: 0, badgeClass: 'grade-pill-f' },
};

export default function UniversityMarksView({ onBack, account }) {
  const [activeSemFilter, setActiveSemFilter] = useState('all'); // 'all', 1, 2, 3, 4
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'T', 'P'
  const [collapsedMap, setCollapsedMap] = useState({});

  const isDemo = isDemoAccount(account);
  const rawSemData = isDemo
    ? universitySemesterData
    : (Array.isArray(account?.universityResults) && account.universityResults.length > 0 ? account.universityResults : []);

  const studentName = account?.name || (isDemo ? 'Rakesh Das' : 'Student');
  const studentRoll = account?.registrationNumber || account?.id || (isDemo ? '2305201001' : '—');
  const studentDept = account?.department || 'Computer Science & Engineering';

  // Toggle semester card collapse in 'all' view
  const toggleCollapse = (semId) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [semId]: !prev[semId],
    }));
  };

  // Cumulative Metrics Calculation
  const cumulativeStats = useMemo(() => {
    let totalCredits = 0;
    let totalSubjects = 0;
    let theoryCount = 0;
    let labCount = 0;
    const gradeCounts = { O: 0, E: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };

    rawSemData.forEach((sem) => {
      sem.subjects?.forEach((sub) => {
        const cr = parseFloat(sub.credit) || 0;
        totalCredits += cr;
        totalSubjects += 1;
        if (sub.type === 'T') theoryCount += 1;
        if (sub.type === 'P') labCount += 1;
        const g = (sub.grade || '').toUpperCase();
        if (gradeCounts[g] !== undefined) {
          gradeCounts[g] += 1;
        }
      });
    });

    const latestSem = rawSemData[0]; // Latest Sem
    const overallCgpa = latestSem ? latestSem.cgpa : (isDemo ? '8.78' : 'N/A');
    const latestSgpa = latestSem ? latestSem.sgpa : (isDemo ? '8.58' : 'N/A');

    return {
      totalCredits: totalCredits.toFixed(1),
      totalSubjects,
      theoryCount,
      labCount,
      overallCgpa,
      latestSgpa,
      gradeCounts,
    };
  }, [rawSemData, isDemo]);

  const handleDownloadMarksheet = (sem) => {
    downloadGradeCardPdf(
      {
        semester: sem.title,
        sgpa: sem.sgpa,
        result: sem.status || 'PASSED',
        subjects: sem.subjects.map((s) => {
          const pt = GRADE_INFO[s.grade]?.points || 8;
          return {
            code: s.code,
            name: s.name,
            credits: parseFloat(s.credit) || 1,
            grade: s.grade,
            internal: Math.round(pt * 1.9),
            external: Math.round(pt * 7.5),
            total: Math.round(pt * 9.4),
            points: pt,
          };
        }),
      },
      {
        name: studentName,
        rollNo: studentRoll,
      }
    );
  };

  const handleDownloadAllSemesters = () => {
    // Generate marksheets for the latest semester or trigger individual downloads
    rawSemData.forEach((sem, idx) => {
      setTimeout(() => {
        handleDownloadMarksheet(sem);
      }, idx * 300);
    });
  };

  // Filtered Semesters and Subjects
  const displayedSemesters = useMemo(() => {
    const list =
      activeSemFilter === 'all'
        ? rawSemData
        : rawSemData.filter((s) => s.id === activeSemFilter);

    if (!searchQuery.trim() && typeFilter === 'ALL') {
      return list;
    }

    const q = searchQuery.toLowerCase().trim();
    return list
      .map((sem) => {
        const filteredSubjects = (sem.subjects || []).filter((sub) => {
          const matchQuery =
            !q ||
            sub.name.toLowerCase().includes(q) ||
            sub.code.toLowerCase().includes(q);
          const matchType = typeFilter === 'ALL' || sub.type === typeFilter;
          return matchQuery && matchType;
        });
        return {
          ...sem,
          subjects: filteredSubjects,
        };
      })
      .filter((sem) => (sem.subjects || []).length > 0 || !q);
  }, [rawSemData, activeSemFilter, searchQuery, typeFilter]);

  if (!isDemo && rawSemData.length === 0) {
    return (
      <div className="univ-marks-container">
        <div className="univ-hero-banner">
          <div className="univ-hero-left">
            <div className="univ-crest-icon">
              <GraduationCap size={28} />
            </div>
            <div>
              <div className="univ-affiliation-tag">
                <Award size={14} />
                <span>Autonomous Examination Branch · Official Record</span>
              </div>
              <h1 className="univ-hero-title">
                Biju Patnaik University of Technology (BPUT)
              </h1>
              <p className="univ-hero-subtitle">
                Official certified semester-wise marks, course credits, and cumulative grade point average (CGPA).
              </p>
            </div>
          </div>
          {onBack && (
            <div className="univ-hero-actions">
              <button className="univ-action-back-btn" type="button" onClick={onBack}>
                <ArrowLeft size={15} /> Back to profile
              </button>
            </div>
          )}
        </div>

        <div className="univ-empty-search" style={{ padding: '3.5rem 1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <GraduationCap size={44} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
          <h2 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 8px' }}>
            No University Examination Results Published Yet
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto 18px', lineHeight: 1.5 }}>
            You are enrolled as a fresh candidate ({account?.name || 'New Student'} · {account?.registrationNumber || account?.studentId || 'New Roll'}). Certified semester-wise marksheets and CGPA records will be generated automatically following end-semester autonomous evaluations.
          </p>
          {onBack && (
            <button
              type="button"
              className="univ-action-back-btn"
              onClick={onBack}
              style={{ display: 'inline-flex', margin: '0 auto' }}
            >
              <ArrowLeft size={14} /> Return to Student Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="univ-marks-container">
      {/* 1. Institutional Top Navbar with Credentials */}
      <div className="univ-hero-banner">
        <div className="univ-hero-left">
          <div className="univ-crest-icon">
            <GraduationCap size={28} />
          </div>
          <div>
            <div className="univ-affiliation-tag">
              <Award size={14} />
              <span>Autonomous Examination Branch · Official Certified</span>
            </div>
            <h1 className="univ-hero-title">
              Biju Patnaik University of Technology (BPUT)
            </h1>
            <p className="univ-hero-subtitle">
              Certified Semester-Wise Academic Marksheet, SGPA Progression, and Cumulative Grade Point Average (CGPA)
            </p>
          </div>
        </div>

        <div className="univ-hero-actions">
          {onBack && (
            <button className="univ-action-back-btn" type="button" onClick={onBack}>
              <ArrowLeft size={15} /> Back to profile
            </button>
          )}
          <button
            type="button"
            className="univ-action-download-all"
            onClick={handleDownloadAllSemesters}
            title="Download verified official marksheets for all completed semesters"
          >
            <Download size={15} />
            <span>Download All Marksheets</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Academic Standing Dashboard (Hero KPI Grid) */}
      <div className="univ-kpi-grid">
        <div className="univ-kpi-card kpi-cgpa">
          <div className="kpi-icon-wrap">
            <Sparkles size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Cumulative GPA (CGPA)</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{cumulativeStats.overallCgpa}</span>
              <span className="kpi-scale">/ 10.00</span>
            </div>
            <span className="kpi-badge badge-distinction">
              ★ First Class with Distinction
            </span>
          </div>
        </div>

        <div className="univ-kpi-card kpi-sgpa">
          <div className="kpi-icon-wrap">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Latest Semester (Sem 4)</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{cumulativeStats.latestSgpa}</span>
              <span className="kpi-scale">SGPA</span>
            </div>
            <span className="kpi-subtext">Consistent Top 5% Performance</span>
          </div>
        </div>

        <div className="univ-kpi-card kpi-credits">
          <div className="kpi-icon-wrap">
            <Layers size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Earned Credits</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{cumulativeStats.totalCredits}</span>
              <span className="kpi-scale">Credits</span>
            </div>
            <div className="kpi-progress-bar-wrap">
              <div
                className="kpi-progress-fill"
                style={{ width: `${Math.min((parseFloat(cumulativeStats.totalCredits) / 160) * 100, 100)}%` }}
              />
            </div>
            <span className="kpi-subtext">90.0 / 160.0 Credits Completed (56.3%)</span>
          </div>
        </div>

        <div className="univ-kpi-card kpi-standing">
          <div className="kpi-icon-wrap">
            <ShieldCheck size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Academic Standing</span>
            <div className="kpi-value-row">
              <span className="kpi-value" style={{ color: '#059669' }}>0</span>
              <span className="kpi-scale" style={{ color: '#059669' }}>Backlogs</span>
            </div>
            <span className="kpi-badge badge-clear">
              ✓ All 50 Subjects Cleared
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Filter & Semester Navigation Bar */}
      <div className="univ-controls-bar">
        {/* Semester Segmented Pills */}
        <div className="univ-sem-selector-group">
          <span className="univ-selector-legend">Select Semester:</span>
          <div className="univ-sem-pills-row">
            <button
              type="button"
              className={`univ-sem-pill ${activeSemFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSemFilter('all')}
            >
              <Layers size={14} />
              <span>All Semesters</span>
              <span className="univ-pill-count">4</span>
            </button>

            {[4, 3, 2, 1].map((semNum) => {
              const semInfo = universitySemesterData.find((s) => s.id === semNum);
              return (
                <button
                  key={semNum}
                  type="button"
                  className={`univ-sem-pill ${activeSemFilter === semNum ? 'active' : ''}`}
                  onClick={() => setActiveSemFilter(semNum)}
                >
                  <span className="sem-pill-title">Sem {semNum}</span>
                  {semInfo && (
                    <span className="sem-pill-gpa">
                      SGPA: {semInfo.sgpa}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Search & Type Filtering */}
        <div className="univ-search-filter-wrap">
          <div className="univ-search-box">
            <Search size={15} className="univ-search-icon" />
            <input
              type="text"
              placeholder="Search by subject name or code (e.g. Python, ETCS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="univ-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="univ-clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="univ-type-filters">
            <button
              type="button"
              className={`univ-type-pill ${typeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setTypeFilter('ALL')}
            >
              All Types
            </button>
            <button
              type="button"
              className={`univ-type-pill ${typeFilter === 'T' ? 'active' : ''}`}
              onClick={() => setTypeFilter('T')}
            >
              <BookOpen size={12} /> Theory
            </button>
            <button
              type="button"
              className={`univ-type-pill ${typeFilter === 'P' ? 'active' : ''}`}
              onClick={() => setTypeFilter('P')}
            >
              <FlaskConical size={12} /> Practical
            </button>
          </div>
        </div>
      </div>

      {/* 4. Redesigned Semester Cards List */}
      <div className="univ-semesters-list">
        {displayedSemesters.length === 0 ? (
          <div className="univ-empty-search">
            <Search size={36} color="#94a3b8" />
            <h3>No subjects match your query</h3>
            <p>We could not find any subject matching "{searchQuery}" in the selected semester filter.</p>
            <button
              type="button"
              className="univ-reset-search-btn"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          displayedSemesters.map((sem) => {
            const isCollapsed = collapsedMap[sem.id];
            const semTotalCredits = sem.subjects
              .reduce((acc, s) => acc + (parseFloat(s.credit) || 0), 0)
              .toFixed(1);
            const theoryCount = sem.subjects.filter((s) => s.type === 'T').length;
            const labCount = sem.subjects.filter((s) => s.type === 'P').length;

            return (
              <div className="univ-semester-card" key={sem.id}>
                {/* Semester Header */}
                <div className="univ-sem-header">
                  <div className="univ-sem-header-left">
                    <div className="univ-sem-emblem">
                      <span>{sem.roman}</span>
                    </div>

                    <div className="univ-sem-header-meta">
                      <div className="univ-sem-title-row">
                        <h2 className="univ-sem-heading">
                          Semester #{sem.id}
                        </h2>
                        <span className="univ-sem-status-badge">
                          <CheckCircle2 size={13} /> Result Published · {sem.standing || 'Passed'}
                        </span>
                      </div>
                      <p className="univ-sem-subinfo">
                        <span>{sem.session}</span>
                        <span className="univ-bullet-sep">•</span>
                        <span>Exam: {sem.examDate}</span>
                        <span className="univ-bullet-sep">•</span>
                        <span>{sem.subjects.length} Enrolled Courses</span>
                      </p>
                    </div>
                  </div>

                  <div className="univ-sem-header-right">
                    <div className="univ-sem-stat-chips">
                      <div className="univ-sgpa-chip">
                        <span className="chip-label">SGPA</span>
                        <span className="chip-val">{sem.sgpa}</span>
                      </div>
                      <div className="univ-credit-chip">
                        <span className="chip-label">Credits</span>
                        <span className="chip-val">{semTotalCredits}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="univ-download-btn"
                      onClick={() => handleDownloadMarksheet(sem)}
                      title={`Download official BPUT certified marksheet PDF for ${sem.title}`}
                    >
                      <Download size={14} />
                      <span>Download Marksheet</span>
                    </button>

                    {activeSemFilter === 'all' && (
                      <button
                        type="button"
                        className="univ-collapse-btn"
                        onClick={() => toggleCollapse(sem.id)}
                        title={isCollapsed ? 'Expand semester details' : 'Collapse semester details'}
                      >
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Content (Collapsible) */}
                {!isCollapsed && (
                  <>
                    <div className="univ-table-responsive">
                      <table className="univ-marks-table">
                        <thead>
                          <tr>
                            <th className="col-idx">#</th>
                            <th className="col-code">Subject Code</th>
                            <th className="col-name">Subject Title</th>
                            <th className="col-type">Course Type</th>
                            <th className="col-credit">Credits</th>
                            <th className="col-grade">Grade Earned</th>
                            <th className="col-points">Grade Points</th>
                            <th className="col-status">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.subjects.map((sub, sIdx) => {
                            const gradeMeta = GRADE_INFO[sub.grade] || {
                              label: 'Passed',
                              points: 7,
                              badgeClass: 'grade-pill-b',
                            };
                            const isTheory = sub.type === 'T';

                            return (
                              <tr key={`${sub.code}-${sIdx}`}>
                                <td className="col-idx">{sIdx + 1}</td>
                                <td className="col-code">
                                  <span className="univ-code-pill font-mono">{sub.code}</span>
                                </td>
                                <td className="col-name">
                                  <div className="univ-subject-title-cell">
                                    <span className="univ-subject-title-text">{sub.name}</span>
                                    {parseFloat(sub.credit) === 0 && (
                                      <span className="univ-noncredit-badge">Audit / Non-Credit</span>
                                    )}
                                  </div>
                                </td>
                                <td className="col-type">
                                  <span className={`univ-type-tag ${isTheory ? 'theory' : 'practical'}`}>
                                    {isTheory ? (
                                      <>
                                        <BookOpen size={12} /> Theory
                                      </>
                                    ) : (
                                      <>
                                        <FlaskConical size={12} /> Practical / Lab
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="col-credit">
                                  <span className="univ-credit-badge">{sub.credit}</span>
                                </td>
                                <td className="col-grade">
                                  <span className={`univ-grade-pill ${gradeMeta.badgeClass}`}>
                                    <span className="grade-letter">{sub.grade}</span>
                                    <span className="grade-desc">({gradeMeta.label})</span>
                                  </span>
                                </td>
                                <td className="col-points">
                                  <span className="univ-points-tag">{gradeMeta.points} / 10</span>
                                </td>
                                <td className="col-status">
                                  <span className="univ-pass-pill">
                                    <CheckCircle2 size={12} /> Pass
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Elevated Semester Footer */}
                    <div className="univ-sem-footer">
                      <div className="univ-footer-breakdown">
                        <div className="breakdown-item">
                          <span className="breakdown-dot theory" />
                          <span>Theory: <strong>{theoryCount}</strong></span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-dot practical" />
                          <span>Practical: <strong>{labCount}</strong></span>
                        </div>
                        <div className="breakdown-item">
                          <span>Total Credits: <strong>{semTotalCredits}</strong></span>
                        </div>
                        <div className="breakdown-item text-muted">
                          <span>Verified by Autonomous CoE Cell</span>
                        </div>
                      </div>

                      <div className="univ-footer-gpa-container">
                        <div className="univ-gpa-card card-sgpa">
                          <span className="gpa-card-title">SEMESTER SGPA</span>
                          <span className="gpa-card-number">{sem.sgpa}</span>
                        </div>
                        <div className="univ-gpa-card card-cgpa">
                          <span className="gpa-card-title">PROGRESSION CGPA</span>
                          <span className="gpa-card-number">{sem.cgpa}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
