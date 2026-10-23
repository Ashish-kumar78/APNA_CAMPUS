import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Filter,
  Download,
  Search,
  RotateCcw,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  Award,
  Layers,
  ArrowUpDown,
  BookOpen,
  Building,
  GraduationCap
} from 'lucide-react';
import './ReportGenerationModule.css';
import { api } from '../services/api.js';
import * as XLSX from 'xlsx';

export default function ReportGenerationModule({ account, role }) {
  const userRole = (role || account?.role || '').toLowerCase();
  const isFaculty = userRole === 'faculty';


  // Filter States
  const [branch, setBranch] = useState('All');
  const [academicYear, setAcademicYear] = useState('All');
  const [semester, setSemester] = useState('All');
  const [batch, setBatch] = useState('All');
  const [section, setSection] = useState('All');
  const [subjectCode, setSubjectCode] = useState('');
  const [scopeMode, setScopeMode] = useState(isFaculty ? 'all_assigned' : 'section');
  const [individualStudentRoll, setIndividualStudentRoll] = useState('');
  const [reportType, setReportType] = useState('attendance'); // attendance | cgpa | sgpa | document
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Table Control States
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('slNo');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Attendance-specific manual percentage filter & sort states
  const [attendanceFilterMode, setAttendanceFilterMode] = useState('all'); // 'all' | 'lte' | 'gte' | 'eq'
  const [manualAttendancePct, setManualAttendancePct] = useState('75');
  const [allMatchingRecords, setAllMatchingRecords] = useState([]);

  // Data & Status States
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [filterConfig, setFilterConfig] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Extract official teaching assignments for faculty
  const facultyAssignments = useMemo(() => {
    return filterConfig?.assignedClasses || [];
  }, [filterConfig]);

  // Dependent options for faculty based on teaching responsibilities
  const availableYears = useMemo(() => {
    return Array.from(new Set(facultyAssignments.map((a) => a.academicYear).filter(Boolean))).sort().reverse();
  }, [facultyAssignments]);

  const availableSemesters = useMemo(() => {
    const sems = facultyAssignments
      .filter((a) => academicYear === 'All' || a.academicYear === academicYear)
      .map((a) => a.semester);
    return Array.from(new Set(sems)).sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [facultyAssignments, academicYear]);

  const availableSections = useMemo(() => {
    const secs = facultyAssignments
      .filter((a) => (academicYear === 'All' || a.academicYear === academicYear) && (semester === 'All' || a.semester === semester))
      .map((a) => a.section);
    return Array.from(new Set(secs)).sort();
  }, [facultyAssignments, academicYear, semester]);

  const availableSubjects = useMemo(() => {
    const list = facultyAssignments.filter(
      (a) =>
        (academicYear === 'All' || a.academicYear === academicYear) &&
        (scopeMode === 'subject' || scopeMode === 'all_assigned' || semester === 'All' || a.semester === semester),
    );
    const seen = new Set();
    return list.filter((a) => {
      if (seen.has(a.subjectCode)) return false;
      seen.add(a.subjectCode);
      return true;
    });
  }, [facultyAssignments, academicYear, semester, scopeMode]);


  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 1. Fetch dynamic filter options from backend
  useEffect(() => {
    async function loadFilters() {
      try {
        const res = await api.getReportFilters();
        if (res && res.success) {
          setFilterConfig(res);
          setBranch(res.userScope?.defaultBranch || 'All');
          const firstAssignment = res.assignedClasses?.[0];
          setAcademicYear(firstAssignment?.academicYear || 'All');
          setSemester(firstAssignment?.semester || 'All');
          setSection(firstAssignment?.section || 'All');
          setSubjectCode(firstAssignment?.subjectCode || '');
          setBatch('All');
        }
      } catch (err) {
        console.error('Could not load report filters:', err);
        setFilterConfig({ branches: [], semesters: [], batches: [], sections: [], assignedClasses: [], reportTypes: [], userScope: {} });
        triggerToast('Live report filters are unavailable. Check the backend connection.', 'error');
      }
    }
    loadFilters();
  }, [userRole, account]);

  // 2. Fetch Report Data
  const fetchReport = useCallback(async () => {
    // Validate date range
    if (dateFrom && dateTo) {
      const dFrom = new Date(dateFrom);
      const dTo = new Date(dateTo);
      if (dFrom > dTo) {
        triggerToast('Validation Error: "Date From" cannot be later than "Date To".', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const params = {
        branch,
        semester: isFaculty && scopeMode === 'all_assigned' ? 'All' : semester,
        batch: isFaculty ? academicYear : batch,
        section: isFaculty && ['all_assigned', 'class'].includes(scopeMode) ? 'All' : section,
        subjectCode: isFaculty ? subjectCode : undefined,
        scopeMode: isFaculty ? scopeMode : undefined,
        rollNumber: isFaculty && scopeMode === 'individual' ? (individualStudentRoll || search) : undefined,
        reportType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
        attendanceFilterMode: reportType === 'attendance' ? attendanceFilterMode : undefined,
        manualAttendancePct: reportType === 'attendance' && attendanceFilterMode !== 'all' ? manualAttendancePct : undefined,
        sortBy,
        sortOrder,
        page,
        limit: pageSize,
      };

      let res = null;
      if (reportType === 'attendance') {
        res = await api.getAttendanceReport(params);
      } else if (reportType === 'cgpa') {
        res = await api.getCgpaReport(params);
      } else if (reportType === 'sgpa') {
        res = await api.getSgpaReport(params);
      } else if (reportType === 'document') {
        res = await api.getDocumentReport(params);
      }

      if (res && res.success) {
        let rawList = res.data || [];
        // Apply client-side manual attendance filter guarantee if backend doesn't support the param
        if (reportType === 'attendance' && attendanceFilterMode !== 'all' && manualAttendancePct !== '') {
          const target = Number(manualAttendancePct);
          rawList = rawList.filter((item) => {
            const val = item.rawPct ?? parseFloat(item.attendancePercentage);
            if (isNaN(val)) return true;
            if (attendanceFilterMode === 'lte') return val <= target;
            if (attendanceFilterMode === 'gte') return val >= target;
            if (attendanceFilterMode === 'eq') return Math.abs(val - target) <= 2.5;
            return true;
          });
        }
        setAllMatchingRecords(rawList);
        setReportData(rawList.slice((page - 1) * pageSize, page * pageSize));
        setSummary(res.summary || null);
        setMeta(res.meta || null);
      } else {
        throw new Error(res?.message || 'Failed to load report data');
      }
    } catch (err) {
      console.error('Could not load report data:', err);
      setReportData([]);
      setAllMatchingRecords([]);
      setSummary(null);
      setMeta(null);
      triggerToast(err?.message || 'Report data could not be loaded from the backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    branch,
    semester,
    batch,
    section,
    academicYear,
    subjectCode,
    scopeMode,
    individualStudentRoll,
    reportType,
    dateFrom,
    dateTo,
    search,
    sortBy,
    sortOrder,
    page,
    pageSize,
    isFaculty,
    attendanceFilterMode,
    manualAttendancePct,
  ]);

  // Generate on mount and when filters change
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // 3. Sorting Handler
  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // 4. Reset Filters Handler
  const handleResetFilters = () => {
    const isDeptLocked = filterConfig?.userScope?.isBranchRestricted;
    if (!isDeptLocked) {
      setBranch('All');
    }
    setAcademicYear('All');
    setSemester('All');
    setBatch('All');
    setSection('All');
    setSubjectCode('');
    setScopeMode(isFaculty ? 'all_assigned' : 'section');
    setIndividualStudentRoll('');
    setReportType('attendance');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setAttendanceFilterMode('all');
    setManualAttendancePct('75');
    setSortBy('slNo');
    setSortOrder('asc');
    setPage(1);
    triggerToast('Report filters reset. Results use live backend data.');
  };

  // 5. Excel Download Handler
  const handleDownloadExcel = async () => {
    setExporting(true);
    triggerToast('Preparing high-fidelity Excel (.xlsx) spreadsheet...');
    try {
      const params = {
        branch,
        semester: isFaculty && scopeMode === 'all_assigned' ? 'All' : semester,
        batch: isFaculty ? academicYear : batch,
        section: isFaculty && ['all_assigned', 'class'].includes(scopeMode) ? 'All' : section,
        subjectCode: isFaculty ? subjectCode : undefined,
        scopeMode: isFaculty ? scopeMode : undefined,
        rollNumber: isFaculty && scopeMode === 'individual' ? (individualStudentRoll || search) : undefined,
        reportType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
        attendanceFilterMode: reportType === 'attendance' ? attendanceFilterMode : undefined,
        manualAttendancePct: reportType === 'attendance' && attendanceFilterMode !== 'all' ? manualAttendancePct : undefined,
        sortBy,
        sortOrder,
      };

      try {
        // Attempt backend binary download first
        await api.downloadReportExcel(params);
        triggerToast('Excel report downloaded successfully!');
        setExporting(false);
        return;
      } catch (apiErr) {
        console.warn('Backend export failed, falling back to client-side XLSX generation:', apiErr.message);
      }

      // Client-side fallback workbook generation using all matching filtered/sorted records
      const dataset = allMatchingRecords.length > 0 ? allMatchingRecords : reportData;
      const wb = XLSX.utils.book_new();
      const scopeLabel = isFaculty ? ` | Scope: ${scopeMode.toUpperCase().replace('_', ' ')}` : '';
      const titleBanner = [
        ['APNA CAMPUS — ENTERPRISE ACADEMIC REPORT'],
        [`REPORT TYPE: ${reportType.toUpperCase()}${scopeLabel}`],
        [`Generated On: ${new Date().toLocaleString()} | User: ${account?.name || 'Authorized Official'} (${userRole})`],
        [
          isFaculty
            ? `Filters: Scope: ${scopeMode} | Academic Year: ${academicYear} | Sem: ${semester} | Sec: ${section} | Subject: ${subjectCode} | Date: ${dateFrom || 'N/A'} to ${dateTo || 'N/A'}`
            : `Filters: Branch: ${branch} | Sem: ${semester} | Batch: ${batch} | Section: ${section} | Date: ${dateFrom || 'N/A'} to ${dateTo || 'N/A'}`,
        ],
        reportType === 'attendance' && attendanceFilterMode !== 'all'
          ? [`Attendance Cutoff: ${attendanceFilterMode === 'lte' ? '≤' : attendanceFilterMode === 'gte' ? '≥' : '≈'} ${manualAttendancePct}% | Sort Order: ${sortBy === 'attendancePercentage' ? `Attendance % (${sortOrder.toUpperCase()})` : sortBy} | Total Exported Students: ${dataset.length}`]
          : [`Sort Order: ${sortBy === 'attendancePercentage' ? `Attendance % (${sortOrder.toUpperCase()})` : sortBy} | Total Exported Students: ${dataset.length}`],
        [],
      ];

      let headers = [];
      let rows = [];

      if (reportType === 'attendance') {
        headers = [
          'Sl. No.',
          'Student Name',
          'Registration Number',
          'Branch',
          'Academic Year',
          'Semester',
          'Section',
          'Subject',
          'Total Classes Held',
          'Present',
          'Absent',
          'Attendance Percentage',
        ];
        rows = dataset.map((r) => [
          r.slNo,
          r.studentName,
          r.registrationNumber,
          r.branch,
          r.academicYear || academicYear,
          r.semester,
          r.section,
          r.subjectName ? `${r.subjectCode} - ${r.subjectName}` : subjectCode || 'N/A',
          r.totalClassesHeld,
          r.present,
          r.absent,
          r.attendancePercentage,
        ]);
      } else if (reportType === 'cgpa') {
        headers = [
          'Sl. No.',
          'Student Name',
          'Registration Number',
          'Branch',
          'Academic Year',
          'Semester',
          'Section',
          'Subject',
          'Batch',
          'CGPA',
          'Academic Status',
        ];
        rows = dataset.map((r) => [
          r.slNo,
          r.studentName,
          r.registrationNumber,
          r.branch,
          r.academicYear || academicYear,
          r.semester,
          r.section,
          r.subjectName ? `${r.subjectCode} - ${r.subjectName}` : subjectCode || 'N/A',
          r.batch,
          r.cgpa,
          r.academicStatus,
        ]);
      } else if (reportType === 'sgpa') {
        headers = [
          'Sl. No.',
          'Student Name',
          'Registration Number',
          'Branch',
          'Academic Year',
          'Semester',
          'Section',
          'Subject',
          'Batch',
          'SGPA',
          'Result Status',
        ];
        rows = dataset.map((r) => [
          r.slNo,
          r.studentName,
          r.registrationNumber,
          r.branch,
          r.academicYear || academicYear,
          r.semester,
          r.section,
          r.subjectName ? `${r.subjectCode} - ${r.subjectName}` : subjectCode || 'N/A',
          r.batch,
          r.sgpa,
          r.resultStatus,
        ]);
      } else if (reportType === 'document') {
        headers = [
          'Sl. No.',
          'Student Name',
          'Registration Number',
          'Branch',
          'Academic Year',
          'Semester',
          'Section',
          'Batch',
          'Total Documents Required',
          'Documents Submitted',
          'Documents Verified',
          'Documents Pending',
          'Verification Status',
        ];
        rows = dataset.map((r) => [
          r.slNo,
          r.studentName,
          r.registrationNumber,
          r.branch,
          r.academicYear || academicYear,
          r.semester,
          r.section,
          r.batch,
          r.totalRequired,
          r.submitted,
          r.verified,
          r.pending,
          r.verificationStatus,
        ]);
      }

      const ws = XLSX.utils.aoa_to_sheet([...titleBanner, headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, 'ReportData');

      const dateStr = new Date().toISOString().split('T')[0];
      const filterTag = reportType === 'attendance' && attendanceFilterMode !== 'all' ? `_${attendanceFilterMode}_${manualAttendancePct}pct` : '';
      const sortTag = sortBy === 'attendancePercentage' ? `_sort-${sortOrder}` : '';
      const scopeTag = isFaculty ? `_${scopeMode}` : `_${branch}`;
      const filename = `ApnaCampus_${reportType.toUpperCase()}${scopeTag}${filterTag}${sortTag}_${dateStr}.xlsx`;
      XLSX.writeFile(wb, filename);

      triggerToast(`Downloaded: ${filename} (${dataset.length} students)`);
    } catch (err) {
      alert('Failed to generate Excel download: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Helper for rendering sort arrow
  const renderSortIndicator = (col) => {
    if (sortBy !== col) {
      return <ArrowUpDown size={12} color="#94a3b8" />;
    }
    return sortOrder === 'asc' ? <ChevronUp size={14} color="#1e40af" /> : <ChevronDown size={14} color="#1e40af" />;
  };

  // Helper for status badge rendering
  const renderStatusBadge = (statusStr) => {
    if (!statusStr) return null;
    const s = String(statusStr).toLowerCase();
    if (s.includes('honor') || s.includes('distinction') || s.includes('complete') || s.includes('verified')) {
      return <span className="rg-status-tag rg-status-success"><CheckCircle2 size={12} /> {statusStr}</span>;
    }
    if (s.includes('first class') || s.includes('good standing') || s.includes('pass')) {
      return <span className="rg-status-tag rg-status-primary">{statusStr}</span>;
    }
    if (s.includes('warning') || s.includes('pending') || s.includes('review')) {
      return <span className="rg-status-tag rg-status-warning"><AlertTriangle size={12} /> {statusStr}</span>;
    }
    if (s.includes('fail') || s.includes('backlog') || s.includes('deficient') || s.includes('reject')) {
      return <span className="rg-status-tag rg-status-danger">{statusStr}</span>;
    }
    return <span className="rg-status-tag rg-status-neutral">{statusStr}</span>;
  };

  const isLockedScope = filterConfig?.userScope?.isBranchRestricted;

  return (
    <div className="rg-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`rg-toast ${toastType === 'error' ? 'error' : ''}`}>
          {toastType === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <header className="rg-header">
        <div className="rg-header-text">
          <h1>
            <FileSpreadsheet size={26} color="#1e40af" /> Report Generation
          </h1>
          <p>Generate, analyze, sort, and export student academic and administrative reports.</p>
        </div>

        <div className="rg-header-badges">
          {isLockedScope ? (
            <span className="rg-badge rg-badge-scope" title="Access restricted by departmental governance">
              <ShieldCheck size={14} /> Department-Locked Scope: {filterConfig?.userScope?.department}
            </span>
          ) : (
            <span className="rg-badge rg-badge-status">
              <Building size={14} /> Institution-Wide Scope
            </span>
          )}
          <span className="rg-badge rg-badge-scope">
            Role: {userRole.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Filter Panel */}
      <section className="rg-filter-card" aria-label="Report Filters">
        <div className="rg-filter-head">
          <div className="rg-filter-title">
            <Filter size={18} color="#2563eb" />
            <span>Report Parameters &amp; Filter Criteria</span>
          </div>
          {isLockedScope && (
            <span style={{ fontSize: '0.74rem', color: '#6366f1', fontWeight: 600 }}>
              * Branch filter restricted to authorized department
            </span>
          )}
        </div>

        <div className="rg-filter-grid">
          {isFaculty ? (
            <>
              {/* Faculty Scope Mode */}
              <div className="rg-field" style={{ minWidth: '220px' }}>
                <label htmlFor="filter-scope-mode">Reporting Scope Mode</label>
                <select
                  id="filter-scope-mode"
                  className="rg-select"
                  value={scopeMode}
                  onChange={(e) => {
                    setScopeMode(e.target.value);
                    setPage(1);
                  }}
                  style={{ fontWeight: 700, color: '#1e40af' }}
                >
                  <option value="all_assigned">🌐 Consolidated (All Assigned Classes)</option>
                  <option value="section">👥 Selected Section Cohort</option>
                  <option value="class">🏛️ Selected Class / Semester Cohort</option>
                  <option value="subject">📚 Specific Subject Across Sections</option>
                  <option value="individual">👤 Individual Student</option>
                </select>
              </div>

              {/* Academic Year */}
              <div className="rg-field">
                <label htmlFor="filter-academic-year">Academic Year</label>
                <select
                  id="filter-academic-year"
                  className="rg-select"
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setPage(1);
                  }}
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                  {availableYears.length === 0 && <option value="All">No assigned academic years</option>}
                </select>
              </div>

              {/* Semester */}
              <div className="rg-field">
                <label htmlFor="filter-semester">Semester</label>
                <select
                  id="filter-semester"
                  className="rg-select"
                  value={semester}
                  disabled={scopeMode === 'all_assigned'}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All assigned semesters</option>
                  {availableSemesters.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="rg-field">
                <label htmlFor="filter-section">Section</label>
                <select
                  id="filter-section"
                  className="rg-select"
                  value={section}
                  disabled={scopeMode === 'all_assigned' || scopeMode === 'class'}
                  onChange={(e) => {
                    setSection(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All assigned sections</option>
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Taught */}
              <div className="rg-field" style={{ minWidth: '200px' }}>
                <label htmlFor="filter-subject">Subject Taught</label>
                <select
                  id="filter-subject"
                  className="rg-select"
                  value={subjectCode}
                  disabled={scopeMode === 'all_assigned'}
                  onChange={(e) => {
                    setSubjectCode(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">No subject selected</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.subjectCode} value={sub.subjectCode}>
                      {sub.subjectCode} — {sub.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Individual Student Input */}
              {scopeMode === 'individual' && (
                <div className="rg-field" style={{ minWidth: '180px' }}>
                  <label htmlFor="filter-individual-roll">Student Roll / Reg. No</label>
                  <input
                    id="filter-individual-roll"
                    type="text"
                    className="rg-input"
                    placeholder="e.g. 01 or GIFT-2305..."
                    value={individualStudentRoll}
                    onChange={(e) => {
                      setIndividualStudentRoll(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* 1. Branch Filter */}
              <div className="rg-field">
                <label htmlFor="filter-branch">Branch / Department</label>
                <select
                  id="filter-branch"
                  className="rg-select"
                  value={branch}
                  disabled={isLockedScope}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setPage(1);
                  }}
                >
                  {!isLockedScope && <option value="All">All departments</option>}
                  {(filterConfig?.branches || []).map((b) => (
                    <option key={b.code} value={b.code} disabled={b.isAllowed === false}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                  {(filterConfig?.branches || []).length === 0 && <option value="">No departments configured</option>}
                </select>
              </div>

              {/* 2. Semester Filter */}
              <div className="rg-field">
                <label htmlFor="filter-semester">Semester</label>
                <select
                  id="filter-semester"
                  className="rg-select"
                  value={semester}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All semesters</option>
                  {(filterConfig?.semesters || []).map((item) => (
                    <option key={item.label} value={item.label}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* 3. Batch Filter */}
              <div className="rg-field">
                <label htmlFor="filter-batch">Academic Year</label>
                <select
                  id="filter-batch"
                  className="rg-select"
                  value={batch}
                  onChange={(e) => {
                    setBatch(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All academic years</option>
                  {(filterConfig?.batches || []).map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              {/* 4. Section Filter */}
              <div className="rg-field">
                <label htmlFor="filter-section">Section</label>
                <select
                  id="filter-section"
                  className="rg-select"
                  value={section}
                  onChange={(e) => {
                    setSection(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All sections</option>
                  {(filterConfig?.sections || []).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Report Type Selector */}
          <div className="rg-field">
            <label htmlFor="filter-type">Report Type</label>
            <select
              id="filter-type"
              className="rg-select"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setSortBy('slNo');
                setSortOrder('asc');
                setPage(1);
              }}
              style={{ fontWeight: 700, color: '#1e40af' }}
            >
              <option value="attendance">📊 Attendance Report</option>
              <option value="cgpa">🎓 Cumulative CGPA Report</option>
              <option value="sgpa">📝 Semester SGPA Report</option>
              <option value="document">📑 Document Compliance Report</option>
            </select>
          </div>

          {/* Date From Filter */}
          <div className="rg-field">
            <label htmlFor="filter-date-from">Date From</label>
            <input
              id="filter-date-from"
              type="date"
              className="rg-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To Filter */}
          <div className="rg-field">
            <label htmlFor="filter-date-to">Date To</label>
            <input
              id="filter-date-to"
              type="date"
              className="rg-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Row 2: Attendance Threshold Mode, Manual Cutoff %, & Sort Order */}
          {reportType === 'attendance' && (
            <div className="rg-filter-row rg-filter-row-2">
              {/* Attendance Criteria / Mode */}
              <div className="rg-field">
                <label htmlFor="filter-att-mode">
                  Attendance Criteria / Cutoff
                </label>
                <select
                  id="filter-att-mode"
                  className="rg-select"
                  value={attendanceFilterMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setAttendanceFilterMode(mode);
                    if (mode === 'lte') {
                      setSortBy('attendancePercentage');
                      setSortOrder('asc'); // Lowest attendance first for shortage list
                    } else if (mode === 'gte') {
                      setSortBy('attendancePercentage');
                      setSortOrder('desc'); // Highest attendance first
                    }
                    setPage(1);
                  }}
                  style={{ fontWeight: 600 }}
                >
                  <option value="all">👥 All Students (No Percentage Cutoff)</option>
                  <option value="lte">⚠️ Less than or equal to (≤ Shortage / Defaulters)</option>
                  <option value="gte">✅ Greater than or equal to (≥ Eligible / Good Standing)</option>
                  <option value="eq">🎯 Target Band (≈ ±2.5% Target)</option>
                </select>
              </div>

              {/* Manual Attendance Percentage Input */}
              <div className="rg-field">
                <label htmlFor="filter-att-pct">
                  Manual Attendance Percentage (%)
                </label>
                <div className="rg-input-suffix-wrap">
                  <input
                    id="filter-att-pct"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    className="rg-input"
                    placeholder="e.g. 75"
                    disabled={attendanceFilterMode === 'all'}
                    value={manualAttendancePct}
                    onChange={(e) => {
                      setManualAttendancePct(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      fontWeight: 700,
                      color: attendanceFilterMode === 'lte' ? '#dc2626' : attendanceFilterMode === 'gte' ? '#16a34a' : '#0f172a',
                    }}
                  />
                  <span className="rg-input-suffix">%</span>
                </div>
                {attendanceFilterMode !== 'all' && (
                  <div className="rg-preset-chips">
                    <span className="rg-preset-label">Quick:</span>
                    <button type="button" className="rg-preset-chip" onClick={() => { setManualAttendancePct('75'); setPage(1); }}>75% (Norm)</button>
                    <button type="button" className="rg-preset-chip" onClick={() => { setManualAttendancePct('60'); setPage(1); }}>60% (Critical)</button>
                    <button type="button" className="rg-preset-chip" onClick={() => { setManualAttendancePct('65'); setPage(1); }}>65% (Border)</button>
                    <button type="button" className="rg-preset-chip" onClick={() => { setManualAttendancePct('85'); setPage(1); }}>85% (High)</button>
                  </div>
                )}
              </div>

              {/* Sort by Attendance Percentage */}
              <div className="rg-field">
                <label htmlFor="filter-att-sort">
                  Sort By Attendance %
                </label>
                <select
                  id="filter-att-sort"
                  className="rg-select"
                  value={
                    sortBy === 'attendancePercentage'
                      ? sortOrder === 'asc' ? 'att_asc' : 'att_desc'
                      : sortBy === 'studentName'
                      ? 'name_asc'
                      : 'slNo'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'att_asc') {
                      setSortBy('attendancePercentage');
                      setSortOrder('asc');
                    } else if (val === 'att_desc') {
                      setSortBy('attendancePercentage');
                      setSortOrder('desc');
                    } else if (val === 'name_asc') {
                      setSortBy('studentName');
                      setSortOrder('asc');
                    } else {
                      setSortBy('slNo');
                      setSortOrder('asc');
                    }
                    setPage(1);
                  }}
                  style={{ fontWeight: 600 }}
                >
                  <option value="att_asc">📉 Lowest to Highest % (Defaulters First)</option>
                  <option value="att_desc">📈 Highest to Lowest % (Top Attendees First)</option>
                  <option value="slNo">🔢 Default (Roll Number / Serial No)</option>
                  <option value="name_asc">🔤 Student Name (A → Z)</option>
                </select>
              </div>
            </div>
          )}

        </div>

        {/* Filter Action Buttons */}
        <div className="rg-filter-actions">
          <button
            type="button"
            className="rg-btn rg-btn-secondary"
            onClick={handleResetFilters}
            title="Clear all active filter inputs"
          >
            <RotateCcw size={15} /> Reset Filters
          </button>

          <button
            type="button"
            className="rg-btn rg-btn-primary"
            onClick={fetchReport}
            disabled={loading}
          >
            <Filter size={15} /> Generate Report
          </button>
        </div>
      </section>

      {/* Summary KPI Cards */}
      <section className="rg-kpi-grid" aria-label="Report Metrics Summary">
        {/* Card 1: Total Students */}
        <div className="rg-kpi-card">
          <div className="rg-kpi-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
          <div className="rg-kpi-content">
            <div className="rg-kpi-label">Total Students</div>
            <div className="rg-kpi-value">{summary?.totalStudents ?? 0}</div>
            <div className="rg-kpi-sub">{branch} · {semester} ({section})</div>
          </div>
        </div>

        {/* Card 2: Average Report Metric */}
        <div className="rg-kpi-card">
          <div className="rg-kpi-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
            <TrendingUp size={24} />
          </div>
          <div className="rg-kpi-content">
            <div className="rg-kpi-label">{summary?.metricLabel || 'Average Performance'}</div>
            <div className="rg-kpi-value">
              {summary ? (
                reportType === 'attendance' || reportType === 'document'
                  ? `${summary.averageMetric}%`
                  : summary.averageMetric
              ) : '—'}
            </div>
            <div className="rg-kpi-sub">Calculated across filtered cohort</div>
          </div>
        </div>

        {/* Card 3: Records Requiring Attention */}
        <div className="rg-kpi-card">
          <div className="rg-kpi-icon" style={{ background: '#fffbeb', color: '#b45309' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="rg-kpi-content">
            <div className="rg-kpi-label">{summary?.attentionLabel || 'Attention Required'}</div>
            <div className="rg-kpi-value" style={{ color: (summary?.recordsRequiringAttention || 0) > 0 ? '#b45309' : '#047857' }}>
              {summary?.recordsRequiringAttention ?? 0}
            </div>
            <div className="rg-kpi-sub">
              {(summary?.recordsRequiringAttention || 0) > 0 ? 'Requires immediate administrative review' : 'All records within acceptable threshold'}
            </div>
          </div>
        </div>

        {/* Card 4: Total Matching Records */}
        <div className="rg-kpi-card">
          <div className="rg-kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Layers size={24} />
          </div>
          <div className="rg-kpi-content">
            <div className="rg-kpi-label">Total Matching Records</div>
            <div className="rg-kpi-value">{summary?.totalMatchingRecords ?? 0}</div>
            <div className="rg-kpi-sub">Reflects active search &amp; filters</div>
          </div>
        </div>
      </section>

      {/* Results Section with Table & Export */}
      <section className="rg-table-card" aria-label="Report Data Table">
        {/* Table Toolbar */}
        <div className="rg-table-toolbar">
          <div className="rg-toolbar-left">
            <h2 className="rg-report-title">{meta?.title || 'Report Results'}</h2>
            <div className="rg-filter-pills">
              {isFaculty ? (
                <>
                  <span className="rg-pill" style={{ background: '#eff6ff', color: '#1e40af', fontWeight: 700 }}>
                    Scope: {scopeMode.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className="rg-pill">{academicYear}</span>
                  {scopeMode !== 'all_assigned' && <span className="rg-pill">{semester}</span>}
                  {scopeMode !== 'all_assigned' && scopeMode !== 'class' && <span className="rg-pill">{section}</span>}
                  {scopeMode !== 'all_assigned' && (
                    <span className="rg-pill" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
                      Subject: {subjectCode}
                    </span>
                  )}
                  {scopeMode === 'individual' && individualStudentRoll && (
                    <span className="rg-pill" style={{ background: '#fef3c7', color: '#92400e' }}>
                      Roll: {individualStudentRoll}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="rg-pill">{branch}</span>
                  <span className="rg-pill">{semester}</span>
                  <span className="rg-pill">{section}</span>
                </>
              )}
              {dateFrom && dateTo && (
                <span className="rg-pill" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                  📅 {dateFrom} to {dateTo}
                </span>
              )}
              {reportType === 'attendance' && attendanceFilterMode !== 'all' && manualAttendancePct && (
                <span className="rg-pill" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontWeight: 700 }}>
                  🎯 Attendance {attendanceFilterMode === 'lte' ? '≤' : attendanceFilterMode === 'gte' ? '≥' : '≈'} {manualAttendancePct}%
                </span>
              )}
              {sortBy === 'attendancePercentage' && (
                <span className="rg-pill" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600 }}>
                  ⇅ Attendance % ({sortOrder === 'asc' ? 'Low → High' : 'High → Low'})
                </span>
              )}
            </div>
          </div>

          <div className="rg-toolbar-right">
            {/* Search Input */}
            <div className="rg-search-wrap">
              <Search size={15} className="rg-search-icon" />
              <input
                type="text"
                className="rg-search-input"
                placeholder="Search student or Reg. No..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Page Size Selector */}
            <select
              className="rg-select"
              style={{ width: 'auto', padding: '0.52rem 0.65rem', fontSize: '0.82rem' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              title="Page Size"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {/* Prominent Excel Download Button */}
            <button
              type="button"
              className="rg-btn rg-btn-excel"
              onClick={handleDownloadExcel}
              disabled={exporting || reportData.length === 0}
              title="Download entire dataset as formatted .xlsx file"
            >
              <Download size={16} />
              <span>{exporting ? 'Exporting...' : 'Download Excel'}</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="rg-state-box">
            <div className="rg-spinner" />
            <div className="rg-state-title">Generating Academic Report...</div>
            <div className="rg-state-desc">Querying database, verifying role permissions, and computing metrics.</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && reportData.length === 0 && (
          <div className="rg-state-box">
            <div className="rg-state-icon">
              <FileSpreadsheet size={28} />
            </div>
            <div className="rg-state-title">No Matching Records Found</div>
            <div className="rg-state-desc">
              Try adjusting your branch, semester, section, date range, or search criteria.
            </div>
          </div>
        )}

        {/* Report Data Table */}
        {!loading && reportData.length > 0 && (
          <div className="rg-table-responsive">
            <table className="rg-table">
              <thead>
                {reportType === 'attendance' && (
                  <tr>
                    <th style={{ width: '60px' }} className="center sortable" onClick={() => handleSort('slNo')}>
                      <span className="rg-th-content">Sl. No. {renderSortIndicator('slNo')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('studentName')}>
                      <span className="rg-th-content">Student Name {renderSortIndicator('studentName')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('registrationNumber')}>
                      <span className="rg-th-content">Registration Number {renderSortIndicator('registrationNumber')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('branch')}>
                      <span className="rg-th-content">Branch {renderSortIndicator('branch')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('academicYear')}>
                      <span className="rg-th-content">Academic Year {renderSortIndicator('academicYear')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('semester')}>
                      <span className="rg-th-content">Semester {renderSortIndicator('semester')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('section')}>
                      <span className="rg-th-content">Section {renderSortIndicator('section')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('subjectCode')}>
                      <span className="rg-th-content">Subject {renderSortIndicator('subjectCode')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('totalClassesHeld')}>
                      <span className="rg-th-content">Total Classes Held {renderSortIndicator('totalClassesHeld')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('present')}>
                      <span className="rg-th-content">Present {renderSortIndicator('present')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('absent')}>
                      <span className="rg-th-content">Absent {renderSortIndicator('absent')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('attendancePercentage')}>
                      <span className="rg-th-content">Attendance Percentage {renderSortIndicator('attendancePercentage')}</span>
                    </th>
                  </tr>
                )}

                {reportType === 'cgpa' && (
                  <tr>
                    <th style={{ width: '60px' }} className="center sortable" onClick={() => handleSort('slNo')}>
                      <span className="rg-th-content">Sl. No. {renderSortIndicator('slNo')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('studentName')}>
                      <span className="rg-th-content">Student Name {renderSortIndicator('studentName')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('registrationNumber')}>
                      <span className="rg-th-content">Registration Number {renderSortIndicator('registrationNumber')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('branch')}>
                      <span className="rg-th-content">Branch {renderSortIndicator('branch')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('academicYear')}>
                      <span className="rg-th-content">Academic Year {renderSortIndicator('academicYear')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('semester')}>
                      <span className="rg-th-content">Semester {renderSortIndicator('semester')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('section')}>
                      <span className="rg-th-content">Section {renderSortIndicator('section')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('subjectCode')}>
                      <span className="rg-th-content">Subject {renderSortIndicator('subjectCode')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('batch')}>
                      <span className="rg-th-content">Batch {renderSortIndicator('batch')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('cgpa')}>
                      <span className="rg-th-content">CGPA {renderSortIndicator('cgpa')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('academicStatus')}>
                      <span className="rg-th-content">Academic Status {renderSortIndicator('academicStatus')}</span>
                    </th>
                  </tr>
                )}

                {reportType === 'sgpa' && (
                  <tr>
                    <th style={{ width: '60px' }} className="center sortable" onClick={() => handleSort('slNo')}>
                      <span className="rg-th-content">Sl. No. {renderSortIndicator('slNo')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('studentName')}>
                      <span className="rg-th-content">Student Name {renderSortIndicator('studentName')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('registrationNumber')}>
                      <span className="rg-th-content">Registration Number {renderSortIndicator('registrationNumber')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('branch')}>
                      <span className="rg-th-content">Branch {renderSortIndicator('branch')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('academicYear')}>
                      <span className="rg-th-content">Academic Year {renderSortIndicator('academicYear')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('semester')}>
                      <span className="rg-th-content">Semester {renderSortIndicator('semester')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('section')}>
                      <span className="rg-th-content">Section {renderSortIndicator('section')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('subjectCode')}>
                      <span className="rg-th-content">Subject {renderSortIndicator('subjectCode')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('batch')}>
                      <span className="rg-th-content">Batch {renderSortIndicator('batch')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('sgpa')}>
                      <span className="rg-th-content">SGPA {renderSortIndicator('sgpa')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('resultStatus')}>
                      <span className="rg-th-content">Result Status {renderSortIndicator('resultStatus')}</span>
                    </th>
                  </tr>
                )}

                {reportType === 'document' && (
                  <tr>
                    <th style={{ width: '60px' }} className="center sortable" onClick={() => handleSort('slNo')}>
                      <span className="rg-th-content">Sl. No. {renderSortIndicator('slNo')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('studentName')}>
                      <span className="rg-th-content">Student Name {renderSortIndicator('studentName')}</span>
                    </th>
                    <th className="sortable" onClick={() => handleSort('registrationNumber')}>
                      <span className="rg-th-content">Registration Number {renderSortIndicator('registrationNumber')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('branch')}>
                      <span className="rg-th-content">Branch {renderSortIndicator('branch')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('academicYear')}>
                      <span className="rg-th-content">Academic Year {renderSortIndicator('academicYear')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('semester')}>
                      <span className="rg-th-content">Semester {renderSortIndicator('semester')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('section')}>
                      <span className="rg-th-content">Section {renderSortIndicator('section')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('batch')}>
                      <span className="rg-th-content">Batch {renderSortIndicator('batch')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('totalRequired')}>
                      <span className="rg-th-content">Total Documents Required {renderSortIndicator('totalRequired')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('submitted')}>
                      <span className="rg-th-content">Documents Submitted {renderSortIndicator('submitted')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('verified')}>
                      <span className="rg-th-content">Documents Verified {renderSortIndicator('verified')}</span>
                    </th>
                    <th className="right sortable" onClick={() => handleSort('pending')}>
                      <span className="rg-th-content">Documents Pending {renderSortIndicator('pending')}</span>
                    </th>
                    <th className="center sortable" onClick={() => handleSort('verificationStatus')}>
                      <span className="rg-th-content">Verification Status {renderSortIndicator('verificationStatus')}</span>
                    </th>
                  </tr>
                )}
              </thead>
              <tbody>
                {reportType === 'attendance' &&
                  reportData.map((row) => (
                    <tr key={row.registrationNumber || row.slNo}>
                      <td className="center" style={{ fontWeight: 600, color: '#64748b' }}>{row.slNo}</td>
                      <td>
                        <div className="rg-student-cell">
                          <span className="rg-student-name">{row.studentName}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {row.registrationNumber}
                        </code>
                      </td>
                      <td className="center"><strong>{row.branch}</strong></td>
                      <td className="center"><span className="rg-pill-sub">{row.academicYear || academicYear}</span></td>
                      <td className="center">{row.semester}</td>
                      <td className="center">{row.section}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb' }}>
                          {row.subjectCode || subjectCode}
                        </span>
                        {row.subjectName && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.subjectName}</div>
                        )}
                      </td>
                      <td className="right" style={{ fontWeight: 600 }}>{row.totalClassesHeld}</td>
                      <td className="right" style={{ color: '#047857', fontWeight: 700 }}>{row.present}</td>
                      <td className="right" style={{ color: '#b91c1c', fontWeight: 700 }}>{row.absent}</td>
                      <td className="right">
                        <span
                          style={{
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: parseFloat(row.attendancePercentage) >= (minAttendanceThreshold + 10) ? '#ecfdf5' : parseFloat(row.attendancePercentage) >= minAttendanceThreshold ? '#eff6ff' : '#fef2f2',
                            color: parseFloat(row.attendancePercentage) >= (minAttendanceThreshold + 10) ? '#047857' : parseFloat(row.attendancePercentage) >= minAttendanceThreshold ? '#1d4ed8' : '#b91c1c',
                          }}
                        >
                          {row.attendancePercentage}
                        </span>
                      </td>
                    </tr>
                  ))}

                {reportType === 'cgpa' &&
                  reportData.map((row) => (
                    <tr key={row.registrationNumber || row.slNo}>
                      <td className="center" style={{ fontWeight: 600, color: '#64748b' }}>{row.slNo}</td>
                      <td><span className="rg-student-name">{row.studentName}</span></td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {row.registrationNumber}
                        </code>
                      </td>
                      <td className="center"><strong>{row.branch}</strong></td>
                      <td className="center"><span className="rg-pill-sub">{row.academicYear || academicYear}</span></td>
                      <td className="center">{row.semester}</td>
                      <td className="center">{row.section}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb' }}>
                          {row.subjectCode || subjectCode}
                        </span>
                        {row.subjectName && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.subjectName}</div>
                        )}
                      </td>
                      <td className="center">{row.batch}</td>
                      <td className="right" style={{ fontWeight: 800, color: row.cgpa >= 8.0 ? '#047857' : row.cgpa >= 6.5 ? '#1d4ed8' : '#b45309' }}>
                        {row.cgpa}
                      </td>
                      <td className="center">{renderStatusBadge(row.academicStatus)}</td>
                    </tr>
                  ))}

                {reportType === 'sgpa' &&
                  reportData.map((row) => (
                    <tr key={row.registrationNumber || row.slNo}>
                      <td className="center" style={{ fontWeight: 600, color: '#64748b' }}>{row.slNo}</td>
                      <td><span className="rg-student-name">{row.studentName}</span></td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {row.registrationNumber}
                        </code>
                      </td>
                      <td className="center"><strong>{row.branch}</strong></td>
                      <td className="center"><span className="rg-pill-sub">{row.academicYear || academicYear}</span></td>
                      <td className="center">{row.semester}</td>
                      <td className="center">{row.section}</td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb' }}>
                          {row.subjectCode || subjectCode}
                        </span>
                        {row.subjectName && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.subjectName}</div>
                        )}
                      </td>
                      <td className="center">{row.batch}</td>
                      <td className="right" style={{ fontWeight: 800, color: row.sgpa >= 8.0 ? '#047857' : row.sgpa >= 6.5 ? '#1d4ed8' : '#b91c1c' }}>
                        {row.sgpa}
                      </td>
                      <td className="center">{renderStatusBadge(row.resultStatus)}</td>
                    </tr>
                  ))}

                {reportType === 'document' &&
                  reportData.map((row) => (
                    <tr key={row.registrationNumber || row.slNo}>
                      <td className="center" style={{ fontWeight: 600, color: '#64748b' }}>{row.slNo}</td>
                      <td><span className="rg-student-name">{row.studentName}</span></td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {row.registrationNumber}
                        </code>
                      </td>
                      <td className="center"><strong>{row.branch}</strong></td>
                      <td className="center"><span className="rg-pill-sub">{row.academicYear || academicYear}</span></td>
                      <td className="center">{row.semester}</td>
                      <td className="center">{row.section}</td>
                      <td className="center">{row.batch}</td>
                      <td className="right">{row.totalRequired}</td>
                      <td className="right" style={{ fontWeight: 600 }}>{row.submitted}</td>
                      <td className="right" style={{ fontWeight: 700, color: '#047857' }}>{row.verified}</td>
                      <td className="right" style={{ fontWeight: 700, color: row.pending > 0 ? '#b45309' : '#64748b' }}>
                        {row.pending}
                      </td>
                      <td className="center">{renderStatusBadge(row.verificationStatus)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination */}
        {!loading && reportData.length > 0 && (
          <div className="rg-table-footer">
            <div className="rg-footer-meta">
              <span>
                Showing <strong>{((page - 1) * pageSize) + 1}</strong> to{' '}
                <strong>{Math.min(page * pageSize, summary?.totalMatchingRecords || reportData.length)}</strong> of{' '}
                <strong>{summary?.totalMatchingRecords || reportData.length}</strong> records
              </span>
              <span>·</span>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 500 }}>
                Date basis: {meta?.dateBasis || 'Cumulative academic records'}
              </span>
            </div>

            <div className="rg-pagination">
              <button
                type="button"
                className="rg-page-btn"
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
              >
                Prev
              </button>

              {Array.from({ length: meta?.pagination?.totalPages || 1 }, (_, i) => i + 1).map((p) => {
                if (
                  p === 1 ||
                  p === (meta?.pagination?.totalPages || 1) ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`rg-page-btn ${p === page ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return <span key={p} style={{ padding: '0 4px', color: '#64748b', fontWeight: 600 }}>...</span>;
                }
                return null;
              })}

              <button
                type="button"
                className="rg-page-btn"
                disabled={page >= (meta?.pagination?.totalPages || 1)}
                onClick={() => setPage(prev => Math.min(meta?.pagination?.totalPages || 1, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
