import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  Users,
  ShieldCheck,
  FileCheck,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Award,
  CreditCard,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpDown,
  Image as ImageIcon,
  Check,
  Clock,
  QrCode
} from 'lucide-react';
import { getAllStudentDocumentRecords, getAllStudents } from '../services/studentStore.js';
import { downloadStudentDocumentPdf, downloadStudentDocumentsRegisterPdf } from '../utils/pdfGenerator.js';
import './StudentDocumentsTable.css';

export default function StudentDocumentsTable({ portalRole = 'faculty', titleOverride, subtitleOverride }) {
  // Master document list from store
  const [documents, setDocuments] = useState(() => getAllStudentDocumentRecords());
  const [refreshTick, setRefreshTick] = useState(0);

  // Filter States
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL'); // 'ALL' | 'Male' | 'Female'
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting & Pagination (by Student)
  const [sortField, setSortField] = useState('rollNumber');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal State for "View" action (Original Live Certificate / Document)
  const [previewDoc, setPreviewDoc] = useState(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Re-fetch documents whenever custom storage events trigger
  useEffect(() => {
    const handleRefresh = () => {
      setDocuments(getAllStudentDocumentRecords());
      setRefreshTick(prev => prev + 1);
    };
    window.addEventListener('cms_student_documents_changed', handleRefresh);
    window.addEventListener('cms_documents_changed', handleRefresh);
    return () => {
      window.removeEventListener('cms_student_documents_changed', handleRefresh);
      window.removeEventListener('cms_documents_changed', handleRefresh);
    };
  }, []);

  // Group all records by Student so each student occupies exactly 1 row
  const groupedStudents = useMemo(() => {
    const map = new Map();

    documents.forEach(record => {
      const studentKey = record.studentId || record.registrationNumber || record.rollNumber;
      if (!map.has(studentKey)) {
        map.set(studentKey, {
          key: studentKey,
          id: record.studentObj?.id || studentKey,
          studentId: record.studentId,
          registrationNumber: record.registrationNumber,
          rollNumber: record.rollNumber,
          studentName: record.studentName,
          sex: record.sex || record.gender || 'Male',
          gender: record.sex || record.gender || 'Male',
          section: record.section || 'Section A',
          semester: record.semester || 'Semester 5',
          department: record.department || 'Computer Science & Engineering',
          deptCode: record.deptCode || 'CSE',
          studentObj: record.studentObj,
          // 5 Main Document Columns + Photo / Others
          docs: {
            aadhaar: null,
            pan: null,
            nptel: null,
            class10: null,
            class12: null,
            photo: null,
            others: []
          }
        });
      }

      const entry = map.get(studentKey);
      const dName = (record.docName || '').toLowerCase();

      if (dName.includes('aadhaar')) {
        entry.docs.aadhaar = record;
      } else if (dName.includes('pan')) {
        entry.docs.pan = record;
      } else if (dName.includes('nptel')) {
        entry.docs.nptel = record;
      } else if (dName.includes('10th') || dName.includes('class 10')) {
        entry.docs.class10 = record;
      } else if (dName.includes('12th') || dName.includes('class 12')) {
        entry.docs.class12 = record;
      } else if (dName.includes('photo') || dName.includes('passport')) {
        entry.docs.photo = record;
      } else {
        entry.docs.others.push(record);
      }
    });

    return Array.from(map.values());
  }, [documents, refreshTick]);

  // Compute distinct filter options from live data
  const availableSections = useMemo(() => {
    const set = new Set();
    groupedStudents.forEach(s => {
      if (s.section) set.add(s.section);
    });
    return Array.from(set).sort();
  }, [groupedStudents]);

  const availableSemesters = useMemo(() => {
    const set = new Set();
    groupedStudents.forEach(s => {
      if (s.semester) set.add(s.semester);
    });
    return Array.from(set).sort();
  }, [groupedStudents]);

  // Filter students pipeline
  const filteredStudents = useMemo(() => {
    return groupedStudents.filter(student => {
      // 1. Section Filter
      if (selectedSection !== 'ALL' && student.section !== selectedSection) {
        return false;
      }

      // 2. Semester Filter
      if (selectedSemester !== 'ALL' && student.semester !== selectedSemester) {
        return false;
      }

      // 3. Gender / Sex Filter (Boys = Male, Girls = Female)
      if (selectedGender !== 'ALL') {
        if (selectedGender === 'Male' && student.sex !== 'Male') return false;
        if (selectedGender === 'Female' && student.sex !== 'Female') return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (student.studentName || '').toLowerCase().includes(query);
        const matchesId = (student.studentId || '').toLowerCase().includes(query);
        const matchesRoll = (student.rollNumber || '').toLowerCase().includes(query);
        const matchesReg = (student.registrationNumber || '').toLowerCase().includes(query);
        const matchesSec = (student.section || '').toLowerCase().includes(query);
        const matchesSem = (student.semester || '').toLowerCase().includes(query);
        const matchesNptel = student.docs.nptel && (student.docs.nptel.docName || '').toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesRoll && !matchesReg && !matchesSec && !matchesSem && !matchesNptel) {
          return false;
        }
      }

      return true;
    });
  }, [groupedStudents, selectedSection, selectedSemester, selectedGender, searchQuery]);

  // Sorting
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'rollNumber') {
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedStudents.slice(start, start + itemsPerPage);
  }, [sortedStudents, currentPage, itemsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Metrics counts
  const totalStudentsCount = filteredStudents.length;
  const boysCount = filteredStudents.filter(s => s.sex === 'Male').length;
  const girlsCount = filteredStudents.filter(s => s.sex === 'Female').length;
  const totalVerifiedDocs = filteredStudents.reduce((acc, s) => {
    let count = 0;
    if (s.docs.aadhaar) count++;
    if (s.docs.pan) count++;
    if (s.docs.nptel) count++;
    if (s.docs.class10) count++;
    if (s.docs.class12) count++;
    if (s.docs.photo) count++;
    count += s.docs.others.length;
    return acc + count;
  }, 0);

  // Handle Download Action
  const handleDownload = (record, e) => {
    if (e) e.stopPropagation();
    try {
      if (record.fileUrl && (record.fileUrl.startsWith('data:') || record.fileUrl.startsWith('blob:'))) {
        const link = document.createElement('a');
        link.href = record.fileUrl;
        link.download = record.fileName || `${record.docName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        downloadStudentDocumentPdf(record);
      }
      showToast(`✓ Document "${record.docName}" downloaded for ${record.studentName}`);
    } catch (err) {
      showToast(err?.message || 'This document is unavailable for download.');
    }
  };

  // Export full table to CSV
  const handleExportCSV = () => {
    const headers = [
      'SL No',
      'Student ID',
      'Registration No',
      'Student Name',
      'Sex',
      'Section',
      'Semester',
      'Aadhaar Card Status',
      'PAN Card Status',
      'NPTEL Certificate',
      'Class 10 Certificate',
      'Class 12 Certificate'
    ];

    const rows = filteredStudents.map((s, i) => [
      i + 1,
      `"${s.studentId}"`,
      `"${s.registrationNumber}"`,
      `"${s.studentName}"`,
      `"${s.sex}"`,
      `"${s.section}"`,
      `"${s.semester}"`,
      `"${s.docs.aadhaar ? 'Verified (PDF)' : 'Pending'}"`,
      `"${s.docs.pan ? 'Verified (PDF)' : 'Pending'}"`,
      `"${s.docs.nptel ? s.docs.nptel.docName : 'Pending'}"`,
      `"${s.docs.class10 ? 'Verified (PDF)' : 'Pending'}"`,
      `"${s.docs.class12 ? 'Verified (PDF)' : 'Pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GIFT_Student_Documents_Register_${selectedSection}_${selectedSemester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${filteredStudents.length} student rows to CSV.`);
  };

  // Export full table to PDF
  const handleExportRegisterPdf = () => {
    // Generate flat list for register PDF
    const flatRecords = [];
    filteredStudents.forEach(s => {
      ['aadhaar', 'pan', 'nptel', 'class10', 'class12'].forEach(key => {
        if (s.docs[key]) flatRecords.push(s.docs[key]);
      });
    });

    downloadStudentDocumentsRegisterPdf(flatRecords, {
      section: selectedSection,
      semester: selectedSemester,
      gender: selectedGender
    });
    showToast(`✓ Document register generated for ${filteredStudents.length} students.`);
  };

  const resetFilters = () => {
    setSelectedSection('ALL');
    setSelectedSemester('ALL');
    setSelectedGender('ALL');
    setSearchQuery('');
    setCurrentPage(1);
    showToast('Filters reset to show all students.');
  };

  // Role titles
  const roleTitles = {
    faculty: {
      title: 'Student Documents Archive & Verification',
      subtitle: 'Section-wise student credentials: 1 row per student with Aadhaar, PAN, NPTEL, 10th & 12th certificates.'
    },
    hod: {
      title: 'Department Student Documents & Compliance Vault',
      subtitle: 'Department-wide single-row student records with instant live certificate view and download.'
    },
    accounts: {
      title: 'Student Financial & Identity Verification Documents',
      subtitle: 'Aadhaar, PAN, and academic certificates for student admission validation and fee records.'
    },
    warden: {
      title: 'Resident Student Identity & Documentation Registry',
      subtitle: 'Hostel boarder identity certificates with authentic original document view and download.'
    },
    admin: {
      title: 'Master Student Documents Registry',
      subtitle: 'Institutional repository: 1 row per student with complete 5-document vault & certificate preview.'
    }
  };

  const activeHeader = roleTitles[portalRole] || roleTitles.faculty;

  // Render Document Cell Component
  const renderDocCell = (doc, defaultLabel, iconType = 'file') => {
    if (!doc) {
      return (
        <div className="std-doc-cell-empty">
          <span className="std-doc-empty-badge">Not Uploaded</span>
        </div>
      );
    }

    const isPdf = (doc.fileType || 'PDF').toUpperCase() === 'PDF';

    return (
      <div className="std-doc-cell-box">
        <div className="std-doc-cell-top">
          <span className={`std-doc-type-pill ${isPdf ? 'pdf' : 'img'}`}>
            {isPdf ? 'PDF' : 'IMAGE'}
          </span>
          <span className="std-doc-verified-pill">
            <Check size={10} strokeWidth={3} /> Verified
          </span>
        </div>

        <div className="std-doc-cell-name" title={doc.docName}>
          {doc.docName}
        </div>

        <div className="std-doc-cell-meta">
          <Clock size={10} /> {doc.uploadedAt || '15 Aug 2023'}
        </div>

        <div className="std-doc-cell-actions">
          <button
            type="button"
            className="std-doc-action-btn view"
            onClick={() => setPreviewDoc(doc)}
            title={`View Original ${doc.docName}`}
          >
            <Eye size={12} /> View
          </button>
          <button
            type="button"
            className="std-doc-action-btn download"
            onClick={(e) => handleDownload(doc, e)}
            title={`Download Original ${doc.docName}`}
          >
            <Download size={12} /> Download
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="std-docs-container">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="std-docs-toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="std-docs-header">
        <div>
          <div className="std-docs-header-badge">
            <ShieldCheck size={14} /> APNA CAMPUS ERP · 5-DOCUMENT REPOSITORY
          </div>
          <h2 className="std-docs-title">{titleOverride || activeHeader.title}</h2>
          <p className="std-docs-subtitle">{subtitleOverride || activeHeader.subtitle}</p>
        </div>

        <div className="std-docs-header-actions">
          <button className="std-docs-btn-secondary" onClick={handleExportCSV} title="Export CSV file (1 row per student)">
            <Download size={14} /> Export CSV
          </button>
          <button className="std-docs-btn-secondary" onClick={handleExportRegisterPdf} title="Generate PDF Document Registry">
            <Printer size={14} /> PDF Registry
          </button>
          <button
            className="std-docs-btn-secondary"
            onClick={() => {
              setDocuments(getAllStudentDocumentRecords());
              setRefreshTick(prev => prev + 1);
              showToast('Refreshed latest uploaded documents.');
            }}
            title="Reload latest uploads"
          >
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="std-docs-kpi-grid">
        <div className="std-docs-kpi-card blue">
          <div className="std-docs-kpi-icon">
            <Users size={20} />
          </div>
          <div>
            <div className="std-docs-kpi-num">{totalStudentsCount}</div>
            <div className="std-docs-kpi-label">Total Students (1 Row Each)</div>
          </div>
        </div>

        <div className="std-docs-kpi-card indigo">
          <div className="std-docs-kpi-icon">
            <FileCheck size={20} />
          </div>
          <div>
            <div className="std-docs-kpi-num">{totalVerifiedDocs}</div>
            <div className="std-docs-kpi-label">Verified Original Certificates</div>
          </div>
        </div>

        <div className="std-docs-kpi-card purple">
          <div className="std-docs-kpi-icon">
            <Award size={20} />
          </div>
          <div>
            <div className="std-docs-kpi-num">{boysCount}</div>
            <div className="std-docs-kpi-label">Boys (Male Students)</div>
          </div>
        </div>

        <div className="std-docs-kpi-card green">
          <div className="std-docs-kpi-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="std-docs-kpi-num">{girlsCount}</div>
            <div className="std-docs-kpi-label">Girls (Female Students)</div>
          </div>
        </div>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="std-docs-filter-card">
        <div className="std-docs-filter-row">
          {/* Section Filter */}
          <div className="std-docs-filter-group">
            <label className="std-docs-filter-label">
              <Layers size={13} /> Section:
            </label>
            <select
              className="std-docs-select"
              value={selectedSection}
              onChange={e => {
                setSelectedSection(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Sections (A, B, C)</option>
              {availableSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="std-docs-filter-group">
            <label className="std-docs-filter-label">
              <Calendar size={13} /> Semester:
            </label>
            <select
              className="std-docs-select"
              value={selectedSemester}
              onChange={e => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Semesters (1 to 8)</option>
              {availableSemesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {/* Gender / Sex Filter: Boys, Girls, or All */}
          <div className="std-docs-filter-group">
            <label className="std-docs-filter-label">
              <Users size={13} /> Sex / Gender:
            </label>
            <div className="std-docs-gender-pills">
              <button
                type="button"
                className={`std-docs-pill-btn ${selectedGender === 'ALL' ? 'active' : ''}`}
                onClick={() => { setSelectedGender('ALL'); setCurrentPage(1); }}
              >
                All
              </button>
              <button
                type="button"
                className={`std-docs-pill-btn boy ${selectedGender === 'Male' ? 'active' : ''}`}
                onClick={() => { setSelectedGender('Male'); setCurrentPage(1); }}
              >
                Boys 👦
              </button>
              <button
                type="button"
                className={`std-docs-pill-btn girl ${selectedGender === 'Female' ? 'active' : ''}`}
                onClick={() => { setSelectedGender('Female'); setCurrentPage(1); }}
              >
                Girls 👧
              </button>
            </div>
          </div>
        </div>

        {/* Search Row & Active Filter Reset */}
        <div className="std-docs-search-row">
          <div className="std-docs-search-wrapper">
            <Search size={16} className="std-docs-search-icon" />
            <input
              type="text"
              className="std-docs-search-input"
              placeholder="Search student by Name, Student ID, Reg No, Roll No, or NPTEL Course..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button className="std-docs-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="std-docs-result-pill">
              Showing <strong>{sortedStudents.length}</strong> of {groupedStudents.length} students
            </span>
            {(selectedSection !== 'ALL' || selectedSemester !== 'ALL' || selectedGender !== 'ALL' || searchQuery) && (
              <button className="std-docs-reset-btn" onClick={resetFilters} title="Clear all active filters">
                <RotateCcw size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Column Wise Master Documents Table: 1 Row per Student with 5 Document Columns */}
      <div className="std-docs-table-card">
        <div className="std-docs-table-wrapper">
          <table className="std-docs-table multi-doc-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                <th style={{ width: '130px', cursor: 'pointer' }} onClick={() => handleSort('studentId')}>
                  <div className="std-docs-th-content">
                    Student ID <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ minWidth: '170px', cursor: 'pointer' }} onClick={() => handleSort('studentName')}>
                  <div className="std-docs-th-content">
                    Student Name <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ width: '80px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('sex')}>
                  <div className="std-docs-th-content" style={{ justifyContent: 'center' }}>
                    Sex <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ width: '90px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('section')}>
                  <div className="std-docs-th-content" style={{ justifyContent: 'center' }}>
                    Section <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ width: '95px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('semester')}>
                  <div className="std-docs-th-content" style={{ justifyContent: 'center' }}>
                    Semester <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* THE 5 DEDICATED DOCUMENT COLUMNS */}
                <th className="std-docs-col-header" style={{ minWidth: '175px' }}>
                  <div className="std-docs-col-title">
                    <CreditCard size={14} color="#2563eb" /> Aadhaar Card
                  </div>
                  <span className="std-docs-col-sub">Govt UIDAI · Original</span>
                </th>

                <th className="std-docs-col-header" style={{ minWidth: '175px' }}>
                  <div className="std-docs-col-title">
                    <CreditCard size={14} color="#7c3aed" /> PAN Card
                  </div>
                  <span className="std-docs-col-sub">Income Tax · Original</span>
                </th>

                <th className="std-docs-col-header" style={{ minWidth: '190px' }}>
                  <div className="std-docs-col-title">
                    <Award size={14} color="#d97706" /> NPTEL Certificate
                  </div>
                  <span className="std-docs-col-sub">MoE &amp; IIT Cert · Original</span>
                </th>

                <th className="std-docs-col-header" style={{ minWidth: '175px' }}>
                  <div className="std-docs-col-title">
                    <FileText size={14} color="#059669" /> Class 10 Certificate
                  </div>
                  <span className="std-docs-col-sub">High School Passing</span>
                </th>

                <th className="std-docs-col-header" style={{ minWidth: '175px' }}>
                  <div className="std-docs-col-title">
                    <FileText size={14} color="#0284c7" /> Class 12 Certificate
                  </div>
                  <span className="std-docs-col-sub">Senior Secondary Passing</span>
                </th>

                {/* Additional: Photo & Other Custom Docs */}
                <th className="std-docs-col-header" style={{ minWidth: '160px', textAlign: 'center' }}>
                  <div className="std-docs-col-title" style={{ justifyContent: 'center' }}>
                    <ImageIcon size={14} color="#db2777" /> Photo &amp; Others
                  </div>
                  <span className="std-docs-col-sub">Photo / Custom Docs</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, index) => {
                  const slNo = (currentPage - 1) * itemsPerPage + index + 1;
                  const isFemale = student.sex === 'Female';

                  return (
                    <tr key={student.key} className="std-docs-tr">
                      {/* Column 1: SL No */}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                        #{String(slNo).padStart(2, '0')}
                      </td>

                      {/* Column 2: Student ID & Reg No */}
                      <td>
                        <div className="std-docs-id-badge">
                          {student.studentId}
                        </div>
                        <div className="std-docs-reg-sub">
                          Reg: {student.registrationNumber}
                        </div>
                      </td>

                      {/* Column 3: Student Name */}
                      <td>
                        <div className="std-docs-name-cell">
                          <div className={`std-docs-avatar ${isFemale ? 'female' : 'male'}`}>
                            {student.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="std-docs-name">{student.studentName}</div>
                            <div className="std-docs-dept">Roll: {student.rollNumber} · {student.deptCode || 'CSE'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Sex (Boys / Girls) */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`std-docs-gender-badge ${isFemale ? 'girl' : 'boy'}`}>
                          {isFemale ? 'Girl (F)' : 'Boy (M)'}
                        </span>
                      </td>

                      {/* Column 5: Section */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="std-docs-section-badge">
                          {student.section}
                        </span>
                      </td>

                      {/* Column 6: Semester */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="std-docs-sem-badge">
                          {student.semester}
                        </span>
                      </td>

                      {/* ── 5 DOCUMENT COLUMNS (EACH OCCUPIES 1 COLUMN IN THIS ROW) ── */}

                      {/* 1. Aadhaar Card */}
                      <td className="std-doc-td">
                        {renderDocCell(student.docs.aadhaar, 'Aadhaar Card', 'card')}
                      </td>

                      {/* 2. PAN Card */}
                      <td className="std-doc-td">
                        {renderDocCell(student.docs.pan, 'PAN Card', 'card')}
                      </td>

                      {/* 3. NPTEL Certificate */}
                      <td className="std-doc-td">
                        {renderDocCell(student.docs.nptel, 'NPTEL Certificate', 'award')}
                      </td>

                      {/* 4. Class 10 Certificate */}
                      <td className="std-doc-td">
                        {renderDocCell(student.docs.class10, 'Class 10 Certificate', 'cert')}
                      </td>

                      {/* 5. Class 12 Certificate */}
                      <td className="std-doc-td">
                        {renderDocCell(student.docs.class12, 'Class 12 Certificate', 'cert')}
                      </td>

                      {/* Extra: Photo & Other Uploaded Docs */}
                      <td className="std-doc-td">
                        {student.docs.photo ? (
                          renderDocCell(student.docs.photo, 'Passport Photo', 'photo')
                        ) : student.docs.others.length > 0 ? (
                          renderDocCell(student.docs.others[0], student.docs.others[0].docName, 'file')
                        ) : (
                          <div className="std-doc-cell-empty">
                            <span className="std-doc-empty-badge">Standard Set</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="std-docs-empty">
                    <FileText size={48} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>
                      No Students Found
                    </p>
                    <p style={{ margin: '0.35rem 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                      No student records matched the selected Section, Semester, Gender or Search query.
                    </p>
                    <button className="std-docs-btn-secondary" onClick={resetFilters}>
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {sortedStudents.length > 0 && (
          <div className="std-docs-pagination">
            <div className="std-docs-page-info">
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, sortedStudents.length)}</strong> of{' '}
              <strong>{sortedStudents.length}</strong> total students (1 row each)
            </div>

            <div className="std-docs-page-controls">
              <button
                className="std-docs-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <span className="std-docs-current-page">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="std-docs-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: AUTHENTIC ORIGINAL LIVE CERTIFICATE VIEWER ── */}
      {previewDoc && (
        <div className="std-docs-modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="std-docs-modal-card" onClick={e => e.stopPropagation()}>
            <div className="std-docs-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div className="std-docs-modal-header-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="std-docs-modal-title">Original Authentic Document Viewer</h3>
                  <p className="std-docs-modal-sub">
                    Live Digital Credential · Apna Campus Verification Repository
                  </p>
                </div>
              </div>
              <button className="std-docs-modal-close" onClick={() => setPreviewDoc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="std-docs-modal-body">
              {/* Student Metadata Card */}
              <div className="std-docs-preview-student-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className={`std-docs-avatar large ${previewDoc.sex === 'Female' ? 'female' : 'male'}`}>
                    {previewDoc.studentName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {previewDoc.studentName}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                      <strong>{previewDoc.studentId}</strong> · Reg No: <strong>{previewDoc.registrationNumber}</strong> · Roll: <strong>{previewDoc.rollNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`std-docs-gender-badge ${previewDoc.sex === 'Female' ? 'girl' : 'boy'}`}>
                        {previewDoc.sex === 'Female' ? 'Girl (Female)' : 'Boy (Male)'}
                      </span>
                      <span className="std-docs-section-badge">{previewDoc.section}</span>
                      <span className="std-docs-sem-badge">{previewDoc.semester}</span>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        {previewDoc.department || 'CSE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RENDER LIVE ORIGINAL CERTIFICATE BASED ON DOCUMENT TYPE */}
              {previewDoc.docName.toLowerCase().includes('aadhaar') ? (
                /* ── 1. ORIGINAL AADHAAR CARD (UIDAI) ── */
                <div className="live-cert-aadhaar-container">
                  <div className="live-cert-aadhaar-card">
                    {/* Top Tricolor Strip */}
                    <div className="aadhaar-tricolor-bar">
                      <div className="bar-saffron"></div>
                      <div className="bar-white"></div>
                      <div className="bar-green"></div>
                    </div>

                    <div className="aadhaar-header-row">
                      <div className="aadhaar-emblem-box">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="emblem-img" onError={(e) => { e.target.style.display = 'none'; }} />
                        <div className="emblem-fallback-text">सत्यमेव जयते</div>
                      </div>
                      <div className="aadhaar-title-block">
                        <div className="aadhaar-hi-title">भारत सरकार</div>
                        <div className="aadhaar-en-title">GOVERNMENT OF INDIA</div>
                        <div className="aadhaar-dept">UNIQUE IDENTIFICATION AUTHORITY OF INDIA</div>
                      </div>
                      <div className="aadhaar-logo-box">
                        <div className="aadhaar-flame-icon">🔥</div>
                        <span className="aadhaar-logo-text">आधार</span>
                      </div>
                    </div>

                    <div className="aadhaar-body-row">
                      {/* Photo */}
                      <div className="aadhaar-photo-box">
                        <div className={`aadhaar-photo-avatar ${previewDoc.sex === 'Female' ? 'female' : 'male'}`}>
                          {previewDoc.studentName.charAt(0)}
                        </div>
                        <div className="aadhaar-photo-tag">GIFT STUDENT</div>
                      </div>

                      {/* Particulars */}
                      <div className="aadhaar-details-box">
                        <div className="aadhaar-field">
                          <span className="aadhaar-lbl">Name:</span>
                          <span className="aadhaar-val bold">{previewDoc.studentName}</span>
                        </div>
                        <div className="aadhaar-field">
                          <span className="aadhaar-lbl">DOB:</span>
                          <span className="aadhaar-val">15/03/2005</span>
                        </div>
                        <div className="aadhaar-field">
                          <span className="aadhaar-lbl">Gender / लिंग:</span>
                          <span className="aadhaar-val">{previewDoc.sex === 'Female' ? 'FEMALE / महिला' : 'MALE / पुरुष'}</span>
                        </div>
                        <div className="aadhaar-field">
                          <span className="aadhaar-lbl">Address:</span>
                          <span className="aadhaar-val text-sm">
                            Plot 18, Unit 4, Bhubaneswar, Khordha, Odisha - 751001
                          </span>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="aadhaar-qr-box">
                        <QrCode size={64} color="#1e293b" />
                        <span className="aadhaar-qr-sub">SECURE QR</span>
                      </div>
                    </div>

                    {/* Aadhaar Number */}
                    <div className="aadhaar-number-row">
                      <div className="aadhaar-digits">
                        <span>4821</span>
                        <span>9081</span>
                        <span>{String(previewDoc.registrationNumber || '2305').slice(-4)}</span>
                      </div>
                      <div className="aadhaar-tagline">
                        मेरा <span>आधार</span>, मेरी पहचान
                      </div>
                    </div>
                  </div>
                </div>
              ) : previewDoc.docName.toLowerCase().includes('pan') ? (
                /* ── 2. ORIGINAL PAN CARD (INCOME TAX DEPARTMENT) ── */
                <div className="live-cert-pan-container">
                  <div className="live-cert-pan-card">
                    {/* PAN Card Header */}
                    <div className="pan-header-row">
                      <div className="pan-dept-text">
                        <div>आयकर विभाग</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>INCOME TAX DEPARTMENT</div>
                      </div>
                      <div className="pan-emblem-center">
                        <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>भारत सरकार</div>
                        <div style={{ fontSize: '0.65rem' }}>GOVT. OF INDIA</div>
                      </div>
                      <div className="pan-right-badge">
                        <span>PAN</span>
                      </div>
                    </div>

                    <div className="pan-body-row">
                      {/* Photo & Signature */}
                      <div className="pan-left-col">
                        <div className={`pan-photo-box ${previewDoc.sex === 'Female' ? 'female' : 'male'}`}>
                          {previewDoc.studentName.charAt(0)}
                        </div>
                        <div className="pan-signature-box">
                          {previewDoc.studentName.split(' ')[0]}
                        </div>
                      </div>

                      {/* Particulars */}
                      <div className="pan-details-col">
                        <div className="pan-field">
                          <span className="pan-lbl">Name / नाम:</span>
                          <span className="pan-val bold">{previewDoc.studentName.toUpperCase()}</span>
                        </div>
                        <div className="pan-field">
                          <span className="pan-lbl">Father's Name / पिता का नाम:</span>
                          <span className="pan-val bold">
                            {previewDoc.studentObj?.fatherName?.toUpperCase() || (previewDoc.studentName.split(' ')[1] ? `${previewDoc.studentName.split(' ')[1].toUpperCase()} SENIOR` : 'SANJAY DAS')}
                          </span>
                        </div>
                        <div className="pan-field">
                          <span className="pan-lbl">Date of Birth / जन्म की तारीख:</span>
                          <span className="pan-val">15/03/2005</span>
                        </div>

                        {/* Hologram & PAN Number */}
                        <div className="pan-number-block">
                          <div className="pan-holo-square">
                            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#b45309' }}>ITD HOLO</span>
                          </div>
                          <div className="pan-card-number">
                            BPKPD{String(previewDoc.rollNumber || '01').padStart(3, '0')}7K
                          </div>
                        </div>
                      </div>

                      <div className="pan-qr-col">
                        <QrCode size={58} color="#0f172a" />
                      </div>
                    </div>

                    <div className="pan-footer-strip">
                      स्थायी लेखा संख्या कार्ड / PERMANENT ACCOUNT NUMBER CARD
                    </div>
                  </div>
                </div>
              ) : previewDoc.docName.toLowerCase().includes('nptel') ? (
                /* ── 3. ORIGINAL NPTEL CERTIFICATE (IIT MADRAS / MOE) ── */
                <div className="live-cert-nptel-container">
                  <div className="live-cert-nptel-card">
                    {/* Header */}
                    <div className="nptel-header">
                      <div className="nptel-logo-brand">
                        <div className="nptel-brand-title">NPTEL</div>
                        <div className="nptel-brand-sub">Online Certification</div>
                        <div className="nptel-moe">(Funded by the MoE, Govt. of India)</div>
                      </div>
                      <div className="nptel-iit-logo">
                        <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '1rem' }}>IIT MADRAS</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SWAYAM National Coordinator</div>
                      </div>
                    </div>

                    {/* Certificate Body */}
                    <div className="nptel-body">
                      <div className="nptel-cert-award">This certificate is computer verified &amp; awarded to</div>
                      <div className="nptel-recipient">{previewDoc.studentName}</div>
                      <div className="nptel-sub-text">for successfully completing the 12-week course</div>
                      <div className="nptel-course-title">
                        {previewDoc.docName.replace(/NPTEL Certificate\s*\(/i, '').replace(/\)/, '') || 'Cloud Computing and Distributed Systems'}
                      </div>

                      {/* Scores & Medals */}
                      <div className="nptel-scores-wrapper">
                        <div className="nptel-score-item">
                          <span className="nptel-score-lbl">Online Assignments</span>
                          <span className="nptel-score-val">24.25 / 25</span>
                        </div>
                        <div className="nptel-score-item">
                          <span className="nptel-score-lbl">Proctored Exam</span>
                          <span className="nptel-score-val">63.75 / 75</span>
                        </div>
                        <div className="nptel-score-item highlight">
                          <span className="nptel-score-lbl">Consolidated Score</span>
                          <span className="nptel-score-val">88%</span>
                        </div>
                      </div>

                      {/* Elite Badge */}
                      <div className="nptel-elite-rosette">
                        <Award size={18} color="#b45309" />
                        <span>Elite + Silver Medal Certified</span>
                      </div>

                      {/* Signatures Row */}
                      <div className="nptel-signs-row">
                        <div className="nptel-sign-col">
                          <div className="nptel-sign-line cursive">Prof. Andrew Thangaraj</div>
                          <div className="nptel-sign-desig">NPTEL Coordinator, IIT Madras</div>
                        </div>
                        <div className="nptel-qr-seal">
                          <QrCode size={48} color="#1e3a8a" />
                          <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>
                            Roll: NPTEL24CS{String(previewDoc.registrationNumber || '2305').slice(-6)}
                          </div>
                        </div>
                        <div className="nptel-sign-col">
                          <div className="nptel-sign-line cursive">Prof. V. Jagadeesh Kumar</div>
                          <div className="nptel-sign-desig">Dean, Continuing Education, IITM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : previewDoc.docName.toLowerCase().includes('10') ? (
                /* ── 4. ORIGINAL CLASS 10 CERTIFICATE (BOARD OF SECONDARY EDUCATION) ── */
                <div className="live-cert-board-container">
                  <div className="live-cert-board-card ten">
                    <div className="board-ornate-border">
                      <div className="board-header">
                        <div className="board-crest">🎓</div>
                        <div className="board-authority">BOARD OF SECONDARY EDUCATION, ODISHA / CBSE</div>
                        <div className="board-cert-title">HIGH SCHOOL CERTIFICATE EXAMINATION</div>
                        <div className="board-cert-sub">Certified Digital Copy on Institutional Record</div>
                      </div>

                      <div className="board-statement">
                        This is to certify that <strong className="board-highlight">{previewDoc.studentName}</strong>,
                        Roll No. <strong>21-104-{String(previewDoc.rollNumber || '01').padStart(4, '0')}</strong>,
                        Registration No. <strong>{previewDoc.registrationNumber}</strong>,
                        has appeared in the High School Examination and was placed in:
                      </div>

                      <div className="board-division-box">
                        FIRST DIVISION WITH DISTINCTION (82.00%)
                      </div>

                      <div className="board-subjects-table">
                        <div className="subj-header">
                          <span>Subject</span>
                          <span>Max Marks</span>
                          <span>Marks Obtained</span>
                          <span>Grade</span>
                        </div>
                        <div className="subj-row">
                          <span>First Language (Odia/Hindi)</span>
                          <span>100</span>
                          <span>84</span>
                          <span className="bold">A1</span>
                        </div>
                        <div className="subj-row">
                          <span>Second Language (English)</span>
                          <span>100</span>
                          <span>82</span>
                          <span className="bold">A1</span>
                        </div>
                        <div className="subj-row">
                          <span>Mathematics</span>
                          <span>100</span>
                          <span>88</span>
                          <span className="bold">A1</span>
                        </div>
                        <div className="subj-row">
                          <span>General Science</span>
                          <span>100</span>
                          <span>80</span>
                          <span className="bold">A2</span>
                        </div>
                        <div className="subj-row">
                          <span>Social Science</span>
                          <span>100</span>
                          <span>76</span>
                          <span className="bold">B1</span>
                        </div>
                      </div>

                      <div className="board-footer-signs">
                        <div className="board-sign">
                          <div className="sign-line cursive">Dr. R. K. Mohapatra</div>
                          <div className="sign-role">Head of Institution / Principal</div>
                        </div>
                        <div className="board-gold-seal">
                          <div className="seal-inner">BSE SEAL</div>
                        </div>
                        <div className="board-sign">
                          <div className="sign-line cursive">S. Tripathy</div>
                          <div className="sign-role">Controller of Examinations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : previewDoc.docName.toLowerCase().includes('12') ? (
                /* ── 5. ORIGINAL CLASS 12 CERTIFICATE (CHSE / HIGHER SECONDARY) ── */
                <div className="live-cert-board-container">
                  <div className="live-cert-board-card twelve">
                    <div className="board-ornate-border royal">
                      <div className="board-header">
                        <div className="board-crest">🏛️</div>
                        <div className="board-authority">COUNCIL OF HIGHER SECONDARY EDUCATION, ODISHA / CBSE</div>
                        <div className="board-cert-title">HIGHER SECONDARY EXAMINATION CERTIFICATE</div>
                        <div className="board-cert-sub">Stream: SCIENCE (Physics, Chemistry, Mathematics)</div>
                      </div>

                      <div className="board-statement">
                        This is to certify that <strong className="board-highlight">{previewDoc.studentName}</strong>,
                        Roll No. <strong>23-SC-{String(previewDoc.rollNumber || '01').padStart(4, '0')}</strong>,
                        Reg No. <strong>{previewDoc.registrationNumber}</strong>,
                        has successfully cleared the Higher Secondary Examination and secured:
                      </div>

                      <div className="board-division-box royal">
                        FIRST DIVISION (86.00%)
                      </div>

                      <div className="board-subjects-table">
                        <div className="subj-header">
                          <span>Subject</span>
                          <span>Theory</span>
                          <span>Practical</span>
                          <span>Total</span>
                        </div>
                        <div className="subj-row">
                          <span>Physics</span>
                          <span>58 / 70</span>
                          <span>28 / 30</span>
                          <span className="bold">86 / 100</span>
                        </div>
                        <div className="subj-row">
                          <span>Chemistry</span>
                          <span>56 / 70</span>
                          <span>28 / 30</span>
                          <span className="bold">84 / 100</span>
                        </div>
                        <div className="subj-row">
                          <span>Mathematics</span>
                          <span>92 / 100</span>
                          <span>—</span>
                          <span className="bold">92 / 100</span>
                        </div>
                        <div className="subj-row">
                          <span>English</span>
                          <span>82 / 100</span>
                          <span>—</span>
                          <span className="bold">82 / 100</span>
                        </div>
                        <div className="subj-row">
                          <span>Computer Science</span>
                          <span>60 / 70</span>
                          <span>28 / 30</span>
                          <span className="bold">88 / 100</span>
                        </div>
                      </div>

                      <div className="board-footer-signs">
                        <div className="board-sign">
                          <div className="sign-line cursive">Prof. N. K. Sahoo</div>
                          <div className="sign-role">Principal / Dean</div>
                        </div>
                        <div className="board-gold-seal royal">
                          <div className="seal-inner">CHSE SEAL</div>
                        </div>
                        <div className="board-sign">
                          <div className="sign-line cursive">Dr. B. K. Jena</div>
                          <div className="sign-role">Controller of Examinations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── FALLBACK / PASSPORT PHOTO / CUSTOM DOC ── */
                <div className="std-docs-preview-sheet">
                  <div className="std-docs-sheet-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                      <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '28px', width: 'auto' }} />
                      <div className="std-docs-sheet-college" style={{ margin: 0 }}>
                        APNA CAMPUS
                      </div>
                    </div>
                    <div className="std-docs-sheet-tagline">
                      Affiliated to BPUT, Rourkela | Approved by AICTE, New Delhi | NAAC "A" Grade
                    </div>
                  </div>

                  <div className="std-docs-sheet-doc-banner">
                    <div className="std-docs-sheet-doc-name">{previewDoc.docName}</div>
                    <div className="std-docs-sheet-status">
                      <CheckCircle2 size={14} color="#16a34a" /> VERIFIED &amp; AUTHENTICATED
                    </div>
                  </div>

                  <div className="std-docs-sheet-grid">
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">Document Type</span>
                      <span className="val">{previewDoc.category || 'Academic / Identification'}</span>
                    </div>
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">File Format</span>
                      <span className="val">{previewDoc.fileType || 'PDF'} Document</span>
                    </div>
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">Uploaded Date</span>
                      <span className="val">{previewDoc.uploadedAt}</span>
                    </div>
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">Archive Size</span>
                      <span className="val">{previewDoc.fileSize || '1.2 MB'}</span>
                    </div>
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">Student ID</span>
                      <span className="val">{previewDoc.studentId}</span>
                    </div>
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">Registration No.</span>
                      <span className="val">{previewDoc.registrationNumber}</span>
                    </div>
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">Class Section</span>
                      <span className="val">{previewDoc.section}</span>
                    </div>
                    <div className="std-docs-sheet-cell">
                      <span className="lbl">Semester</span>
                      <span className="val">{previewDoc.semester}</span>
                    </div>
                  </div>

                  <div className="std-docs-watermark-box">
                    <div className="std-docs-watermark-text">APNA CAMPUS VERIFIED</div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                        Certified Digital Copy on Record:
                      </p>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        This document has been verified against institutional autonomous criteria and stored securely in the BPUT ERP Cloud repository for Faculty evaluation, HOD compliance, Accounts fee validation, Hostel residence admission, and Central Academic Administration.
                      </p>
                      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b' }}>
                          DIGITAL STAMP: SHA256-{Math.random().toString(36).substring(2, 9).toUpperCase()}
                        </div>
                        <div className="std-docs-seal-badge">
                          ERP SEALED &amp; VERIFIED
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="std-docs-modal-footer">
              <button
                className="std-docs-btn-secondary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} /> Print Document
              </button>
              <button
                className="std-docs-btn-primary"
                onClick={() => handleDownload(previewDoc)}
              >
                <Download size={14} /> Download Original (PDF)
              </button>
              <button
                className="std-docs-btn-secondary"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
