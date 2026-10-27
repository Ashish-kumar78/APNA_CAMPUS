import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HelpCircle,
  Layers,
  LayoutGrid,
  List,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
  User,
  Users,
  Building2,
  X
} from 'lucide-react';
import './ScholarshipPage.css';

// Master Data & Models
import {
  INITIAL_SCHOLARSHIP_SCHEMES,
  INITIAL_APPLICATIONS,
  SCHOLARSHIP_OFFICER
} from '../components/ScholarshipModules/scholarshipData.js';
import { getActiveStudent } from '../services/studentStore.js';

export default function ScholarshipPage({ account }) {
  // Retrieve Active Student from Store / Account
  const student = useMemo(() => {
    try {
      const active = getActiveStudent();
      if (active) return active;
    } catch {}
    return {
      name: account?.name || 'BISHNU PRASAD SAHOO',
      rollNumber: account?.registrationNumber || account?.rollNumber || '2401432265',
      department: account?.department || 'Computer Science & Engineering (Artificial Intelligence)',
      program: 'B.Tech',
      semester: 'Semester 3',
      cgpa: 8.42,
      caste: 'OBC/SEBC',
      annualFamilyIncome: 180000,
      gender: 'MALE'
    };
  }, [account]);

  const studentCgpa = parseFloat(student?.cgpa) || 8.42;
  const studentRoll = student.rollNumber || student.studentId || '2401432265';

  // Master Schemes State
  const [schemes, setSchemes] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_schemes');
      return stored ? JSON.parse(stored) : INITIAL_SCHOLARSHIP_SCHEMES;
    } catch {
      return INITIAL_SCHOLARSHIP_SCHEMES;
    }
  });

  // Applications State
  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_applications');
      return stored ? JSON.parse(stored) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  // Saved Bookmarks State
  const [savedSchemeIds, setSavedSchemeIds] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_saved_scholarships');
      return stored ? JSON.parse(stored) : ['SCH-SCHEME-01', 'SCH-SCHEME-03'];
    } catch {
      return ['SCH-SCHEME-01', 'SCH-SCHEME-03'];
    }
  });

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem('apna_saved_scholarships', JSON.stringify(savedSchemeIds));
    } catch {}
  }, [savedSchemeIds]);

  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_applications', JSON.stringify(applications));
    } catch {}
  }, [applications]);

  // Active Tab: 'available' | 'my_applications' | 'guidelines' | 'saved'
  const [activeTab, setActiveTab] = useState('available');

  // View Mode: 'table' | 'grid'
  const [viewMode, setViewMode] = useState('table');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [degreeFilter, setDegreeFilter] = useState('All');
  const [cgpaFilter, setCgpaFilter] = useState('All');
  const [onlyEligible, setOnlyEligible] = useState(false);

  // Modals State
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0);

  // Application Modal State
  const [applyingScheme, setApplyingScheme] = useState(null);
  const [applyStep, setApplyStep] = useState(1);
  const [applyFormData, setApplyFormData] = useState({
    fullName: '',
    rollNumber: '',
    department: '',
    semester: '',
    cgpa: '',
    category: '',
    familyIncome: '180000',
    fatherName: 'Prakash Sahoo',
    fatherOccupation: 'Agriculture & Small Enterprise',
    bankAccount: '918820109923',
    bankIfsc: 'SBIN0001234',
    bankBranch: 'Main University Branch, Bhubaneswar',
    rationCardNo: 'RC-OD-2026-9921',
    agreedToTerms: false
  });
  const [submittedApplicationRef, setSubmittedApplicationRef] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student's Submitted Applications
  const myApplications = useMemo(() => {
    return applications.filter(
      (a) => a.studentId === studentRoll || a.studentName?.toLowerCase() === student.name?.toLowerCase()
    );
  }, [applications, studentRoll, student.name]);

  // Derived Summary Metric Counts
  const availableCount = schemes.filter((s) => s.status !== 'Closed').length;
  const eligibleCount = useMemo(() => {
    return schemes.filter((s) => {
      if (s.status === 'Closed') return false;
      return !s.minCgpa || studentCgpa >= s.minCgpa;
    }).length;
  }, [schemes, studentCgpa]);

  const inReviewCount = useMemo(() => {
    return myApplications.filter(
      (a) =>
        a.reviewStatus === 'Under Review' ||
        a.reviewStatus === 'Submitted' ||
        a.verificationStatus?.includes('Scrutiny') ||
        a.verificationStatus?.includes('Verification')
    ).length;
  }, [myApplications]);

  // Bookmark Toggle
  const handleToggleBookmark = (e, schemeId) => {
    e.stopPropagation();
    if (savedSchemeIds.includes(schemeId)) {
      setSavedSchemeIds(savedSchemeIds.filter((id) => id !== schemeId));
      showToast('Removed from saved scholarships.');
    } else {
      setSavedSchemeIds([...savedSchemeIds, schemeId]);
      showToast('Added to saved scholarships bookmarks!');
    }
  };

  // Filter Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      if (activeTab === 'saved') {
        if (!savedSchemeIds.includes(s.id)) return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          s.name?.toLowerCase().includes(query) ||
          s.sponsorName?.toLowerCase().includes(query) ||
          s.provider?.toLowerCase().includes(query) ||
          s.category?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Category Filter
      if (categoryFilter !== 'All') {
        if (categoryFilter === 'Government' && s.type !== 'Government') return false;
        if (categoryFilter === 'Institutional' && s.type !== 'Institutional') return false;
        if (categoryFilter === 'Need' && !s.category?.includes('Need') && s.type !== 'Need-Based') return false;
        if (categoryFilter === 'CSR' && !s.type?.includes('Private') && !s.type?.includes('Sponsored')) return false;
      }

      // Degree Filter
      if (degreeFilter !== 'All') {
        if (s.educationLevels && !s.educationLevels.includes(degreeFilter)) return false;
      }

      // CGPA Cutoff Filter
      if (cgpaFilter !== 'All') {
        const cutoff = parseFloat(cgpaFilter);
        if (s.minCgpa && s.minCgpa > cutoff) return false;
      }

      // Only Eligible Toggle
      if (onlyEligible) {
        if (s.minCgpa && studentCgpa < s.minCgpa) return false;
      }

      return true;
    });
  }, [
    schemes,
    activeTab,
    savedSchemeIds,
    searchTerm,
    categoryFilter,
    degreeFilter,
    cgpaFilter,
    onlyEligible,
    studentCgpa
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setDegreeFilter('All');
    setCgpaFilter('All');
    setOnlyEligible(false);
  };

  // Open Details Modal
  const handleOpenDetails = (scheme) => {
    setSelectedSchemeForDetails(scheme);
    setDetailTab('overview');
    setExpandedFaqIndex(0);
  };

  // Open Apply Modal
  const handleOpenApplyModal = (scheme) => {
    const existing = myApplications.find((a) => a.schemeId === scheme.id);
    if (existing) {
      showToast(`You have already submitted an application (${existing.id}) for this scheme.`);
      setActiveTab('my_applications');
      return;
    }

    setApplyingScheme(scheme);
    setApplyStep(1);
    setSubmittedApplicationRef(null);
    setApplyFormData({
      fullName: student.name || 'BISHNU PRASAD SAHOO',
      rollNumber: studentRoll,
      department: student.department || 'Computer Science & Engineering (Artificial Intelligence)',
      semester: student.semester || 'Semester 3',
      cgpa: student.cgpa || '8.42',
      category: student.caste || 'OBC/SEBC',
      familyIncome: '180000',
      fatherName: 'Prakash Sahoo',
      fatherOccupation: 'Agriculture & Small Enterprise',
      bankAccount: '918820109923',
      bankIfsc: 'SBIN0001234',
      bankBranch: 'Main University Branch, Bhubaneswar',
      rationCardNo: 'RC-OD-2026-9921',
      agreedToTerms: false
    });
  };

  // Submit Application
  const handleSubmitApplication = (e) => {
    e.preventDefault();
    if (!applyFormData.agreedToTerms) {
      alert('Please check and confirm the declaration before submitting.');
      return;
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newAppId = `APP-2026-${randomSuffix}`;
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newApp = {
      id: newAppId,
      studentId: studentRoll,
      studentName: applyFormData.fullName,
      dept: applyFormData.department,
      semester: applyFormData.semester,
      cgpa: parseFloat(applyFormData.cgpa) || 8.42,
      annualFamilyIncome: Number(applyFormData.familyIncome) || 180000,
      category: applyFormData.category || 'OBC',
      gender: student.gender || 'Male',
      schemeId: applyingScheme.id,
      schemeName: applyingScheme.name,
      applicationType: 'New',
      submissionDate: todayStr,
      completeness: '100% Complete',
      eligibilityStatus: 'Eligible',
      verificationStatus: 'Under Scrutiny',
      reviewStatus: 'Under Review',
      approvalStage: 'Welfare Directorate Document Scrutiny',
      recommendedAmount: applyingScheme.awardAmount,
      finalAwardAmount: applyingScheme.awardAmount,
      assignedReviewer: SCHOLARSHIP_OFFICER.name,
      disbursementStatus: 'Pending Verification',
      documentsCount: 4,
      reviewerRemarks: 'Application submitted online via Student Financial Aid Portal. Awaiting nodal document verification.'
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    setSubmittedApplicationRef(newAppId);
    setApplyStep(5);

    const updatedSchemes = schemes.map((s) => {
      if (s.id === applyingScheme.id) {
        return { ...s, filledSlots: Math.min(s.totalSlots, (s.filledSlots || 0) + 1) };
      }
      return s;
    });
    setSchemes(updatedSchemes);
    showToast(`Application ${newAppId} successfully submitted!`);
  };

  return (
    <div className="scholarship-page">
      {/* ─── 1. UNIFORM PORTAL HEADER ─────────────────────────────────────────── */}
      <div className="scholarship-header">
        <div>
          <h1 className="scholarship-title">Scholarships &amp; Financial Aid</h1>
          <p className="scholarship-subtitle">
            Explore state statutory grants (PRERANA, NSP), institutional merit fellowships, and track online verification.
          </p>
        </div>

        <div className="scholarship-header-actions">
          <button
            type="button"
            className="btn-pay-now"
            onClick={() => {
              const openScheme = schemes.find((s) => s.status === 'Open') || schemes[0];
              handleOpenApplyModal(openScheme);
            }}
          >
            <Plus size={16} /> Apply for Scholarship
          </button>

          <button
            type="button"
            className="btn-receipt"
            onClick={() => setActiveTab('my_applications')}
          >
            <Clock size={15} /> Track My Applications ({myApplications.length})
          </button>
        </div>
      </div>

      {/* ─── 2. UNIFORM KPI METRICS STRIP ─────────────────────────────────────── */}
      <div className="scholarship-metrics">
        {/* Metric 1 */}
        <div
          className="scholarship-metric-card interactive"
          onClick={() => {
            setActiveTab('available');
            handleResetFilters();
          }}
          title="Click to view all available schemes"
        >
          <div className="scholarship-metric-icon blue">
            <Award size={22} />
          </div>
          <div className="scholarship-metric-body">
            <h4>Available Schemes</h4>
            <div className="metric-val">{schemes.length} Schemes</div>
            <div className="metric-sub">Govt + Institutional + CSR</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="scholarship-metric-card interactive"
          onClick={() => {
            setActiveTab('available');
            setOnlyEligible(!onlyEligible);
          }}
          title="Click to filter scholarships matched to your CGPA"
        >
          <div className="scholarship-metric-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="scholarship-metric-body">
            <h4>Eligible for You</h4>
            <div className="metric-val">{eligibleCount} Matched</div>
            <div className="metric-sub">Matched to {studentCgpa} CGPA</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="scholarship-metric-card interactive"
          onClick={() => setActiveTab('my_applications')}
          title="Click to track your submitted applications"
        >
          <div className="scholarship-metric-icon purple">
            <Clock size={22} />
          </div>
          <div className="scholarship-metric-body">
            <h4>My Applications</h4>
            <div className="metric-val">{myApplications.length} Submissions</div>
            <div className="metric-sub">{inReviewCount > 0 ? `${inReviewCount} In Scrutiny` : 'Up to Date'}</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          className="scholarship-metric-card interactive"
          onClick={() => {
            setActiveTab('available');
            showToast('Annual Direct Benefit Transfer (DBT) aid pool.');
          }}
          title="Total Sanctioned Aid Pool"
        >
          <div className="scholarship-metric-icon amber">
            <DollarSign size={22} />
          </div>
          <div className="scholarship-metric-body">
            <h4>Direct Aid Pool</h4>
            <div className="metric-val">₹2.8 Cr+</div>
            <div className="metric-sub">100% DBT Bank Credit</div>
          </div>
        </div>
      </div>

      {/* ─── 3. UNIFORM NAVIGATION TABS ───────────────────────────────────────── */}
      <div className="scholarship-tabs">
        <button
          type="button"
          className={`scholarship-tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Scholarship Schemes ({schemes.length})
        </button>

        <button
          type="button"
          className={`scholarship-tab-btn ${activeTab === 'my_applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_applications')}
        >
          My Applications &amp; Status ({myApplications.length})
        </button>

        <button
          type="button"
          className={`scholarship-tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidelines')}
        >
          Eligibility &amp; Document Guidelines
        </button>

        <button
          type="button"
          className={`scholarship-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Bookmarks ({savedSchemeIds.length})
        </button>
      </div>

      {/* ─── TAB 1 & 4: AVAILABLE & SAVED SCHEMES ──────────────────────────────── */}
      {(activeTab === 'available' || activeTab === 'saved') && (
        <div className="scholarship-section-card">
          {/* Header & Controls Toolbar */}
          <div className="scholarship-sec-header">
            <div>
              <h3>
                {activeTab === 'saved'
                  ? `Saved Scholarship Bookmarks (${filteredSchemes.length})`
                  : `Active Scholarship Schemes (${filteredSchemes.length})`}
              </h3>
              <p className="sec-sub">
                Official funding opportunities for Academic Session 2026–2027. Review eligibility criteria and submit verified dossiers.
              </p>
            </div>

            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} /> Table
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
              >
                <LayoutGrid size={16} /> Cards
              </button>
            </div>
          </div>

          {/* Unified Filter Toolbar */}
          <div className="scholarship-filter-bar">
            <div className="scholarship-search-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search by scheme name, awarding body, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              className="scholarship-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Funding Categories</option>
              <option value="Government">Government (State &amp; Central)</option>
              <option value="Institutional">Institutional (Apna Campus)</option>
              <option value="Need">Need-Based &amp; Welfare</option>
              <option value="CSR">Corporate CSR &amp; Alumni</option>
            </select>

            <select
              className="scholarship-select"
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
            >
              <option value="All">All Degree Levels</option>
              <option value="B.Tech">B.Tech (Undergraduate)</option>
              <option value="M.Tech">M.Tech (Postgraduate)</option>
              <option value="MCA">MCA</option>
              <option value="Diploma">Diploma Engineering</option>
            </select>

            <select
              className="scholarship-select"
              value={cgpaFilter}
              onChange={(e) => setCgpaFilter(e.target.value)}
            >
              <option value="All">All CGPA Requirements</option>
              <option value="6.5">Minimum 6.5 CGPA</option>
              <option value="7.0">Minimum 7.0 CGPA</option>
              <option value="7.5">Minimum 7.5 CGPA</option>
              <option value="8.0">Minimum 8.0 CGPA</option>
            </select>

            <button
              type="button"
              className={`filter-pill-btn ${onlyEligible ? 'active' : ''}`}
              onClick={() => setOnlyEligible(!onlyEligible)}
            >
              <Check size={13} /> Only schemes I qualify for ({studentCgpa} CGPA)
            </button>

            {(searchTerm || categoryFilter !== 'All' || degreeFilter !== 'All' || cgpaFilter !== 'All' || onlyEligible) && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={handleResetFilters}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>

          {/* LISTINGS PRESENTATION */}
          {filteredSchemes.length === 0 ? (
            <div className="scholarship-empty-state">
              <div className="empty-icon-wrap">
                <Filter size={26} />
              </div>
              <h4>No Scholarships Match Your Filter</h4>
              <p>We couldn't find any scholarships matching your search criteria. Try clearing your filters or selecting All Categories.</p>
              <button
                type="button"
                className="btn-receipt"
                style={{ marginTop: '12px' }}
                onClick={handleResetFilters}
              >
                <RotateCcw size={14} /> Clear All Filters
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW (Standard ERP Table) */
            <div className="scholarship-table-wrap">
              <table className="scholarship-table">
                <thead>
                  <tr>
                    <th>Scheme Name &amp; Provider</th>
                    <th>Category</th>
                    <th>Academic Eligibility</th>
                    <th>Sanction Grant</th>
                    <th>Application Deadline</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchemes.map((scheme) => {
                    const isBookmarked = savedSchemeIds.includes(scheme.id);
                    const isApplied = myApplications.some((a) => a.schemeId === scheme.id);
                    const meetsCgpa = !scheme.minCgpa || studentCgpa >= scheme.minCgpa;

                    return (
                      <tr key={scheme.id}>
                        <td>
                          <div className="scheme-title-col">
                            <strong>{scheme.name}</strong>
                            <span className="scheme-provider-sub">
                              {scheme.provider || scheme.sponsorName}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className={`cat-tag ${scheme.type === 'Government' ? 'gov' : scheme.type === 'Institutional' ? 'inst' : 'csr'}`}>
                            {scheme.category || scheme.type}
                          </span>
                        </td>

                        <td>
                          <div className="eligibility-col">
                            <span className={meetsCgpa ? 'pass' : 'fail'}>
                              {meetsCgpa ? '✓ ' : ''}Min. {scheme.minCgpa || '6.0'} CGPA
                            </span>
                            <small>{scheme.educationLevels?.slice(0, 2).join(', ') || 'All Degrees'}</small>
                          </div>
                        </td>

                        <td>
                          <div className="amount-col">
                            <strong>₹{scheme.awardAmount?.toLocaleString('en-IN')}</strong>
                            <small>{scheme.awardType?.includes('Month') ? '/ Month' : '/ Year'}</small>
                          </div>
                        </td>

                        <td>
                          <div className="deadline-col">
                            <span>{scheme.closingDate}</span>
                            <small>{scheme.status === 'Closing Soon' ? 'Closing Soon' : 'Academic Cycle'}</small>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`scholarship-badge ${
                              isApplied
                                ? 'applied'
                                : scheme.status === 'Open'
                                ? 'open'
                                : scheme.status === 'Closing Soon'
                                ? 'closing'
                                : 'closed'
                            }`}
                          >
                            {isApplied ? 'Applied' : scheme.status}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions-cell">
                            <button
                              type="button"
                              className={`btn-bookmark ${isBookmarked ? 'active' : ''}`}
                              onClick={(e) => handleToggleBookmark(e, scheme.id)}
                              title={isBookmarked ? 'Remove bookmark' : 'Bookmark scheme'}
                            >
                              <Heart size={14} className={isBookmarked ? 'fill-current' : ''} />
                            </button>

                            <button
                              type="button"
                              className="btn-details"
                              onClick={() => handleOpenDetails(scheme)}
                            >
                              Details
                            </button>

                            {isApplied ? (
                              <button
                                type="button"
                                className="btn-applied-pill"
                                onClick={() => setActiveTab('my_applications')}
                              >
                                <Check size={12} /> Applied
                              </button>
                            ) : scheme.status === 'Closed' ? (
                              <span className="btn-closed-pill">Closed</span>
                            ) : (
                              <button
                                type="button"
                                className="btn-apply-primary"
                                onClick={() => handleOpenApplyModal(scheme)}
                              >
                                Apply Now <ChevronRight size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID CARDS VIEW (Standard Card Layout) */
            <div className="scholarship-grid-cards">
              {filteredSchemes.map((scheme) => {
                const isBookmarked = savedSchemeIds.includes(scheme.id);
                const isApplied = myApplications.some((a) => a.schemeId === scheme.id);
                const meetsCgpa = !scheme.minCgpa || studentCgpa >= scheme.minCgpa;

                return (
                  <div key={scheme.id} className="scholarship-card-item">
                    <div className="card-top-bar">
                      <span className={`cat-tag ${scheme.type === 'Government' ? 'gov' : scheme.type === 'Institutional' ? 'inst' : 'csr'}`}>
                        {scheme.category || scheme.type}
                      </span>
                      <div className="card-top-right">
                        <span
                          className={`scholarship-badge ${
                            isApplied
                              ? 'applied'
                              : scheme.status === 'Open'
                              ? 'open'
                              : scheme.status === 'Closing Soon'
                              ? 'closing'
                              : 'closed'
                          }`}
                        >
                          {isApplied ? 'Applied' : scheme.status}
                        </span>
                        <button
                          type="button"
                          className={`btn-bookmark ${isBookmarked ? 'active' : ''}`}
                          onClick={(e) => handleToggleBookmark(e, scheme.id)}
                        >
                          <Heart size={14} className={isBookmarked ? 'fill-current' : ''} />
                        </button>
                      </div>
                    </div>

                    <h4 className="card-scheme-title">{scheme.name}</h4>
                    <span className="card-provider-name">{scheme.provider || scheme.sponsorName}</span>

                    <p className="card-scheme-desc">{scheme.description}</p>

                    <div className="card-info-box">
                      <div className="card-info-row">
                        <span>Grant Amount:</span>
                        <strong className="text-grant">
                          ₹{scheme.awardAmount?.toLocaleString('en-IN')}{' '}
                          <small>{scheme.awardType?.includes('Month') ? '/mo' : '/yr'}</small>
                        </strong>
                      </div>
                      <div className="card-info-row">
                        <span>Min. CGPA:</span>
                        <strong className={meetsCgpa ? 'text-pass' : 'text-fail'}>
                          {meetsCgpa ? '✓ ' : ''}{scheme.minCgpa || '6.0'}
                        </strong>
                      </div>
                      <div className="card-info-row">
                        <span>Deadline:</span>
                        <span>{scheme.closingDate}</span>
                      </div>
                    </div>

                    <div className="card-actions-row">
                      <button
                        type="button"
                        className="btn-details"
                        style={{ flex: 1 }}
                        onClick={() => handleOpenDetails(scheme)}
                      >
                        View Details
                      </button>

                      {isApplied ? (
                        <button
                          type="button"
                          className="btn-applied-pill"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => setActiveTab('my_applications')}
                        >
                          <Check size={13} /> Applied
                        </button>
                      ) : scheme.status === 'Closed' ? (
                        <span className="btn-closed-pill" style={{ flex: 1, textAlign: 'center' }}>
                          Closed
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-apply-primary"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => handleOpenApplyModal(scheme)}
                        >
                          Apply Now <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: MY APPLICATIONS & STATUS TRACKER ──────────────────────────── */}
      {activeTab === 'my_applications' && (
        <div className="scholarship-section-card">
          <div className="scholarship-sec-header">
            <div>
              <h3>Submitted Scholarship Applications &amp; Verification Tracker</h3>
              <p className="sec-sub">
                Track your student dossier scrutiny, committee sanction, and Direct Benefit Transfer (DBT) disbursement status.
              </p>
            </div>

            <button
              type="button"
              className="btn-receipt"
              onClick={() => setActiveTab('available')}
            >
              <Plus size={14} /> Apply for New Scheme
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="scholarship-empty-state">
              <div className="empty-icon-wrap">
                <FileText size={26} />
              </div>
              <h4>No Applications on Record</h4>
              <p>You haven't submitted any scholarship applications for Academic Session 2026–2027 yet. Explore available schemes and apply before upcoming deadlines.</p>
              <button
                type="button"
                className="btn-pay-now"
                style={{ marginTop: '14px' }}
                onClick={() => setActiveTab('available')}
              >
                Browse Scholarships Catalog <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="scholarship-table-wrap">
              <table className="scholarship-table">
                <thead>
                  <tr>
                    <th>Application Ref &amp; Date</th>
                    <th>Scholarship Scheme</th>
                    <th>Sanctioned Grant</th>
                    <th>Verification Stage</th>
                    <th>Status</th>
                    <th>Official Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="scheme-title-col">
                          <strong className="ref-code">{app.id}</strong>
                          <span className="scheme-provider-sub">Submitted: {app.submissionDate}</span>
                        </div>
                      </td>

                      <td>
                        <div className="scheme-title-col">
                          <strong>{app.schemeName}</strong>
                          <span className="scheme-provider-sub">Applicant: {app.studentName} ({app.studentId})</span>
                        </div>
                      </td>

                      <td>
                        <span className="text-grant" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          ₹{(app.finalAwardAmount || app.recommendedAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td>
                        <div className="stage-stepper-wrap">
                          <span className="stage-name">{app.approvalStage || 'Document Scrutiny'}</span>
                          <div className="mini-stepper">
                            <span className="step-dot completed" title="Application Submitted">1</span>
                            <span className={`step-bar ${app.verificationStatus === 'Verified' ? 'completed' : ''}`} />
                            <span className={`step-dot ${app.verificationStatus === 'Verified' ? 'completed' : 'active'}`} title="Document Verification">2</span>
                            <span className={`step-bar ${app.reviewStatus === 'Approved' ? 'completed' : ''}`} />
                            <span className={`step-dot ${app.reviewStatus === 'Approved' ? 'completed' : ''}`} title="Directorate Review">3</span>
                            <span className="step-bar" />
                            <span className="step-dot" title="DBT Sanction">4</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`scholarship-badge ${
                            app.reviewStatus === 'Approved'
                              ? 'open'
                              : app.reviewStatus === 'Under Review'
                              ? 'applied'
                              : 'closing'
                          }`}
                        >
                          {app.reviewStatus}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn-receipt"
                          onClick={() => window.print()}
                          title="Print submission acknowledgement slip"
                        >
                          <Printer size={13} /> Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: ELIGIBILITY & DOCUMENT GUIDELINES ──────────────────────────── */}
      {activeTab === 'guidelines' && (
        <div className="scholarship-section-card">
          <div className="scholarship-sec-header">
            <div>
              <h3>Scholarship Verification &amp; Document Guidelines</h3>
              <p className="sec-sub">
                Autonomous College Student Welfare Directorate standards for online scrutiny, revenue certificate verification, and DBT disbursement.
              </p>
            </div>
          </div>

          <div className="guidelines-grid">
            <div className="guideline-card">
              <div className="guideline-icon blue">
                <FileCheck size={22} />
              </div>
              <h4>Mandatory Revenue Documents</h4>
              <p>
                Income certificates must be issued by a Revenue Authority not below the rank of Additional Tehsildar, valid for Financial Year 2026–2027.
              </p>
              <ul>
                <li>Annual income certificate in original PDF.</li>
                <li>Permanent resident domicile certificate.</li>
                <li>Valid caste certificate for SC/ST/OBC categories.</li>
              </ul>
            </div>

            <div className="guideline-card">
              <div className="guideline-icon green">
                <ShieldCheck size={22} />
              </div>
              <h4>Academic Compliance</h4>
              <p>
                Students must have passed all preceding semester examinations with zero standing active backlogs at the time of scrutiny.
              </p>
              <ul>
                <li>Autonomous Controller of Examinations verified marksheets.</li>
                <li>Minimum aggregate biometric attendance of 75%.</li>
                <li>No active disciplinary suspension on record.</li>
              </ul>
            </div>

            <div className="guideline-card">
              <div className="guideline-icon amber">
                <DollarSign size={22} />
              </div>
              <h4>Direct Benefit Transfer (DBT)</h4>
              <p>
                Government grants and statutory fellowships are disbursed strictly through NPCI Aadhaar Payment Bridge (APB) to seeded bank accounts.
              </p>
              <ul>
                <li>Savings bank account must be actively linked with Aadhaar.</li>
                <li>Joint accounts and minor accounts are strictly disallowed.</li>
                <li>Branch IFSC code must be verified on bank passbook.</li>
              </ul>
            </div>

            <div className="guideline-card">
              <div className="guideline-icon purple">
                <HelpCircle size={22} />
              </div>
              <h4>Welfare Directorate Helpdesk</h4>
              <p>
                In case of document discrepancy or rectification notices, report to the Student Welfare Complex in Academic Block 1.
              </p>
              <ul>
                <li>Nodal Officer: <strong>{SCHOLARSHIP_OFFICER.name}</strong></li>
                <li>Office: {SCHOLARSHIP_OFFICER.office}</li>
                <li>Helpdesk Email: {SCHOLARSHIP_OFFICER.email}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. PROSPECTUS DETAILS MODAL ───────────────────────────────────────── */}
      {selectedSchemeForDetails && (
        <div
          className="payment-modal-backdrop"
          onClick={() => setSelectedSchemeForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="payment-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="payment-modal-close"
              onClick={() => setSelectedSchemeForDetails(null)}
            >
              <X size={20} />
            </button>

            <div className="modal-head-row">
              <span className="modal-sub-kicker">
                {selectedSchemeForDetails.provider || selectedSchemeForDetails.sponsorName}
              </span>
              <h2 className="modal-main-title">{selectedSchemeForDetails.name}</h2>
            </div>

            {/* 4-Stat Strip */}
            <div className="modal-stats-row">
              <div className="modal-stat-box">
                <span className="lbl">Grant Amount</span>
                <span className="val" style={{ color: '#059669' }}>
                  ₹{selectedSchemeForDetails.awardAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="modal-stat-box">
                <span className="lbl">Min. CGPA</span>
                <span className="val">≥ {selectedSchemeForDetails.minCgpa || '6.0'}</span>
              </div>
              <div className="modal-stat-box">
                <span className="lbl">Income Cap</span>
                <span className="val">
                  {selectedSchemeForDetails.incomeCeiling
                    ? `≤ ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(1)}L`
                    : 'No Cap'}
                </span>
              </div>
              <div className="modal-stat-box">
                <span className="lbl">Deadline</span>
                <span className="val" style={{ color: '#d97706' }}>
                  {selectedSchemeForDetails.closingDate}
                </span>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="scholarship-tabs" style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className={`scholarship-tab-btn ${detailTab === 'overview' ? 'active' : ''}`}
                onClick={() => setDetailTab('overview')}
              >
                Overview
              </button>
              <button
                type="button"
                className={`scholarship-tab-btn ${detailTab === 'eligibility' ? 'active' : ''}`}
                onClick={() => setDetailTab('eligibility')}
              >
                Eligibility
              </button>
              <button
                type="button"
                className={`scholarship-tab-btn ${detailTab === 'documents' ? 'active' : ''}`}
                onClick={() => setDetailTab('documents')}
              >
                Documents
              </button>
              <button
                type="button"
                className={`scholarship-tab-btn ${detailTab === 'faqs' ? 'active' : ''}`}
                onClick={() => setDetailTab('faqs')}
              >
                FAQs
              </button>
            </div>

            {/* Tab: Overview */}
            {detailTab === 'overview' && (
              <div className="modal-tab-body">
                <h4>Program Overview</h4>
                <p>{selectedSchemeForDetails.description}</p>

                <h4>Financial Coverage &amp; Benefits</h4>
                <ul className="modal-bullets">
                  {(
                    selectedSchemeForDetails.benefits || [
                      'Direct tuition fee reimbursement credited to student bank account.',
                      'Annual book and stationery grant allowance included.',
                      'Exemption from selected college laboratory and assessment fees.'
                    ]
                  ).map((b, i) => (
                    <li key={i}>
                      <CheckCircle2 size={15} color="#059669" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab: Eligibility */}
            {detailTab === 'eligibility' && (
              <div className="modal-tab-body">
                <h4>Qualification Checklist</h4>
                <ul className="modal-bullets">
                  <li>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Academic CGPA: Minimum ≥ {selectedSchemeForDetails.minCgpa || '6.0'} with zero active backlogs.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>
                      {selectedSchemeForDetails.incomeCeiling
                        ? `Annual Family Income: Gross total income must not exceed ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(1)} Lakhs.`
                        : 'No family income limit applicable.'}
                    </span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} color="#059669" />
                    <span>Degree Programs: Enrolled in regular full-time {selectedSchemeForDetails.educationLevels?.join(', ')}.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Tab: Documents */}
            {detailTab === 'documents' && (
              <div className="modal-tab-body">
                <h4>Required Verification Documents</h4>
                <ul className="modal-bullets">
                  {(selectedSchemeForDetails.requiredDocs || [
                    'Income Certificate (Certified by Revenue Authority for FY 2026-27)',
                    'Autonomous Semester Grade Marksheets',
                    'Aadhaar-Seeded Bank Passbook Copy with IFSC Code',
                    'College Identity Card Copy'
                  ]).map((doc, idx) => (
                    <li key={idx}>
                      <FileCheck size={15} color="#2563eb" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab: FAQs */}
            {detailTab === 'faqs' && (
              <div className="modal-tab-body">
                <h4>Frequently Asked Questions</h4>
                <div className="faqs-stack">
                  {(
                    selectedSchemeForDetails.faqs || [
                      {
                        q: 'Can I apply for multiple scholarships simultaneously?',
                        a: 'You can apply for multiple schemes. However, government statutory norms allow receiving only one tuition fee subsidy at a time.'
                      },
                      {
                        q: 'When will the scholarship be credited?',
                        a: 'Government grants are credited via DBT within 60 to 90 days after institutional scrutiny and district approval.'
                      }
                    ]
                  ).map((f, i) => (
                    <div key={i} className="faq-box">
                      <strong>{f.q}</strong>
                      <p>{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer-row">
              <button
                type="button"
                className="btn-receipt"
                onClick={() => setSelectedSchemeForDetails(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn-pay-now"
                disabled={selectedSchemeForDetails.status === 'Closed'}
                onClick={() => {
                  const s = selectedSchemeForDetails;
                  setSelectedSchemeForDetails(null);
                  handleOpenApplyModal(s);
                }}
              >
                Apply for Scholarship <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. 4-STEP APPLICATION WIZARD MODAL ─────────────────────────────────── */}
      {applyingScheme && (
        <div
          className="payment-modal-backdrop"
          onClick={() => setApplyingScheme(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="payment-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="payment-modal-close"
              onClick={() => setApplyingScheme(null)}
            >
              <X size={20} />
            </button>

            <div className="modal-head-row">
              <span className="modal-sub-kicker">Application Form · Academic Session 2026–2027</span>
              <h2 className="modal-main-title">{applyingScheme.name}</h2>
            </div>

            {/* Step Wizard Header */}
            {applyStep <= 4 && (
              <div className="wizard-stepper-bar">
                <div className={`wizard-step ${applyStep === 1 ? 'active' : applyStep > 1 ? 'done' : ''}`}>
                  <span>{applyStep > 1 ? '✓' : '1'}</span> Dossier
                </div>
                <div className={`wizard-step-line ${applyStep > 1 ? 'done' : ''}`} />
                <div className={`wizard-step ${applyStep === 2 ? 'active' : applyStep > 2 ? 'done' : ''}`}>
                  <span>{applyStep > 2 ? '✓' : '2'}</span> Income &amp; Bank
                </div>
                <div className={`wizard-step-line ${applyStep > 2 ? 'done' : ''}`} />
                <div className={`wizard-step ${applyStep === 3 ? 'active' : applyStep > 3 ? 'done' : ''}`}>
                  <span>{applyStep > 3 ? '✓' : '3'}</span> Documents
                </div>
                <div className={`wizard-step-line ${applyStep > 3 ? 'done' : ''}`} />
                <div className={`wizard-step ${applyStep === 4 ? 'active' : ''}`}>
                  <span>4</span> Declaration
                </div>
              </div>
            )}

            {/* STEP 1: Dossier */}
            {applyStep === 1 && (
              <div className="modal-form-stack">
                <div className="form-grid-2">
                  <div>
                    <label className="field-lbl">Student Full Name</label>
                    <input type="text" className="fee-input" value={applyFormData.fullName} readOnly />
                  </div>
                  <div>
                    <label className="field-lbl">Registration Number</label>
                    <input type="text" className="fee-input" value={applyFormData.rollNumber} readOnly />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="field-lbl">Department</label>
                    <input type="text" className="fee-input" value={applyFormData.department} readOnly />
                  </div>
                  <div>
                    <label className="field-lbl">Semester &amp; CGPA</label>
                    <input type="text" className="fee-input" value={`${applyFormData.semester} · ${applyFormData.cgpa} CGPA`} readOnly />
                  </div>
                </div>

                <div>
                  <label className="field-lbl">Social / Affirmative Category</label>
                  <input
                    type="text"
                    className="fee-input"
                    value={applyFormData.category}
                    onChange={(e) => setApplyFormData({ ...applyFormData, category: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Income & Bank */}
            {applyStep === 2 && (
              <div className="modal-form-stack">
                <div className="form-grid-2">
                  <div>
                    <label className="field-lbl">Father's Full Name</label>
                    <input
                      type="text"
                      className="fee-input"
                      value={applyFormData.fatherName}
                      onChange={(e) => setApplyFormData({ ...applyFormData, fatherName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-lbl">Father's Occupation</label>
                    <input
                      type="text"
                      className="fee-input"
                      value={applyFormData.fatherOccupation}
                      onChange={(e) => setApplyFormData({ ...applyFormData, fatherOccupation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="field-lbl">Annual Family Income (INR)</label>
                    <input
                      type="number"
                      className="fee-input"
                      value={applyFormData.familyIncome}
                      onChange={(e) => setApplyFormData({ ...applyFormData, familyIncome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-lbl">Ration Card / BPL Number (Optional)</label>
                    <input
                      type="text"
                      className="fee-input"
                      value={applyFormData.rationCardNo}
                      onChange={(e) => setApplyFormData({ ...applyFormData, rationCardNo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="field-lbl">Aadhaar-Seeded Bank Account</label>
                    <input
                      type="text"
                      className="fee-input"
                      value={applyFormData.bankAccount}
                      onChange={(e) => setApplyFormData({ ...applyFormData, bankAccount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-lbl">Bank IFSC Code</label>
                    <input
                      type="text"
                      className="fee-input"
                      value={applyFormData.bankIfsc}
                      onChange={(e) => setApplyFormData({ ...applyFormData, bankIfsc: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Documents */}
            {applyStep === 3 && (
              <div className="modal-form-stack">
                <div
                  className="upload-dropzone"
                  onClick={() => showToast('Attached additional supporting document successfully!')}
                >
                  <UploadCloud size={26} color="#2563eb" />
                  <strong>Click to upload additional verified documents</strong>
                  <small>PDF or JPG format (Max 2MB per document)</small>
                </div>

                <div className="verified-docs-stack">
                  <div className="verified-doc-item">
                    <FileCheck size={16} color="#059669" />
                    <span>Income Certificate (Revenue Authority FY 2026-27).pdf</span>
                    <strong className="verified-tag">✓ Verified</strong>
                  </div>
                  <div className="verified-doc-item">
                    <FileCheck size={16} color="#059669" />
                    <span>Previous Semester Grade Marksheet (Autonomous Cell).pdf</span>
                    <strong className="verified-tag">✓ Verified</strong>
                  </div>
                  <div className="verified-doc-item">
                    <FileCheck size={16} color="#059669" />
                    <span>Bank Passbook Copy (Aadhaar Seeded).jpg</span>
                    <strong className="verified-tag">✓ Verified</strong>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Declaration */}
            {applyStep === 4 && (
              <div className="modal-form-stack">
                <div className="summary-preview-card">
                  <strong>Application Dossier Summary</strong>
                  <p>Scheme: <strong>{applyingScheme.name}</strong></p>
                  <p>Applicant: <strong>{applyFormData.fullName}</strong> ({applyFormData.rollNumber})</p>
                  <p>Program: <strong>{applyFormData.department}</strong> · CGPA: <strong>{applyFormData.cgpa}</strong></p>
                  <p>Annual Income: <strong>₹{Number(applyFormData.familyIncome).toLocaleString('en-IN')}</strong></p>
                  <p>DBT Account: <strong>{applyFormData.bankAccount}</strong> (IFSC: {applyFormData.bankIfsc})</p>
                </div>

                <label className="declaration-check-row">
                  <input
                    type="checkbox"
                    checked={applyFormData.agreedToTerms}
                    onChange={(e) => setApplyFormData({ ...applyFormData, agreedToTerms: e.target.checked })}
                  />
                  <span>
                    I hereby solemnly declare that all information furnished above and documents attached are true, correct, and complete to the best of my knowledge. I understand that any false disclosure shall render my scholarship liable to instant forfeiture and disciplinary proceedings under college rules.
                  </span>
                </label>
              </div>
            )}

            {/* STEP 5: Success Receipt */}
            {applyStep === 5 && submittedApplicationRef && (
              <div className="modal-success-pane">
                <div className="success-icon-wrap">
                  <CheckCircle2 size={36} color="#059669" />
                </div>
                <h3>Application Successfully Submitted!</h3>
                <p>Your scholarship application has been transmitted to the Directorate of Student Welfare &amp; Financial Aid for online document scrutiny.</p>

                <div className="ref-id-pill">
                  <small>OFFICIAL REFERENCE ID</small>
                  <strong>{submittedApplicationRef}</strong>
                </div>

                <div className="modal-success-actions">
                  <button
                    type="button"
                    className="btn-receipt"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Print Receipt
                  </button>

                  <button
                    type="button"
                    className="btn-pay-now"
                    onClick={() => {
                      setApplyingScheme(null);
                      setActiveTab('my_applications');
                    }}
                  >
                    Track in My Applications <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            {applyStep <= 4 && (
              <div className="modal-footer-row">
                {applyStep > 1 && (
                  <button
                    type="button"
                    className="btn-receipt"
                    onClick={() => setApplyStep(applyStep - 1)}
                  >
                    Back
                  </button>
                )}

                {applyStep < 4 ? (
                  <button
                    type="button"
                    className="btn-pay-now"
                    onClick={() => setApplyStep(applyStep + 1)}
                  >
                    Continue to Step {applyStep + 1} <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-pay-now"
                    disabled={!applyFormData.agreedToTerms}
                    onClick={handleSubmitApplication}
                  >
                    Submit Official Application <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 6. FLOATING TOAST NOTIFICATION ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="fees-toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
