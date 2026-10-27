import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Building,
  GraduationCap,
  ExternalLink,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  Sparkles,
  Users,
  Layers,
  ArrowRight,
  UploadCloud,
  FileCheck,
  Send,
  HelpCircle,
  RotateCcw,
  BookOpen,
  BookmarkCheck,
  Printer
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

  // Schemes State from LocalStorage / Initial
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

  // Bookmarks State (Saved Schemes)
  const [savedSchemeIds, setSavedSchemeIds] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_saved_scholarships');
      return stored ? JSON.parse(stored) : ['SCH-SCHEME-01', 'SCH-SCHEME-03'];
    } catch {
      return ['SCH-SCHEME-01', 'SCH-SCHEME-03'];
    }
  });

  // Persist Bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('apna_saved_scholarships', JSON.stringify(savedSchemeIds));
    } catch {}
  }, [savedSchemeIds]);

  // Persist Applications
  useEffect(() => {
    try {
      localStorage.setItem('apna_scholarship_applications', JSON.stringify(applications));
    } catch {}
  }, [applications]);

  // UI View States: 'catalog' | 'my-applications'
  const [currentView, setCurrentView] = useState('catalog');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [educationFilter, setEducationFilter] = useState('All');
  const [cgpaFilter, setCgpaFilter] = useState('All');
  const [amountFilter, setAmountFilter] = useState('All');
  const [deadlineFilter, setDeadlineFilter] = useState('All');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Modals
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0);

  // Apply Now Modal State
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
  const [uploadedFiles, setUploadedFiles] = useState({
    incomeCert: true,
    marksheet: true,
    bankPassbook: true,
    casteCert: true
  });
  const [submittedApplicationRef, setSubmittedApplicationRef] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student's Submitted Applications
  const studentRoll = student.rollNumber || student.studentId || '2401432265';
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
      const meetsCgpa = !s.minCgpa || studentCgpa >= s.minCgpa;
      return meetsCgpa;
    }).length;
  }, [schemes, studentCgpa]);
  const appsInProgressCount = myApplications.length;
  const upcomingDeadlinesCount = schemes.filter(
    (s) => s.status === 'Closing Soon' || s.closingDate?.includes('Nov') || s.closingDate?.includes('Dec')
  ).length;

  // Bookmark Toggle
  const handleToggleBookmark = (e, schemeId) => {
    e.stopPropagation();
    if (savedSchemeIds.includes(schemeId)) {
      setSavedSchemeIds(savedSchemeIds.filter((id) => id !== schemeId));
      showToast('Removed scholarship from bookmarks.');
    } else {
      setSavedSchemeIds([...savedSchemeIds, schemeId]);
      showToast('Scholarship bookmarked to your saved list!');
    }
  };

  // Filter & Search Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          s.name?.toLowerCase().includes(query) ||
          s.sponsorName?.toLowerCase().includes(query) ||
          s.provider?.toLowerCase().includes(query) ||
          s.id?.toLowerCase().includes(query) ||
          s.category?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Type filter
      if (typeFilter !== 'All') {
        if (typeFilter === 'Government' && s.type !== 'Government') return false;
        if (typeFilter === 'Institutional' && s.type !== 'Institutional') return false;
        if (typeFilter === 'Merit' && !s.category?.includes('Merit') && s.type !== 'Merit-Based') return false;
        if (typeFilter === 'Need' && !s.category?.includes('Need') && s.type !== 'Need-Based') return false;
        if (typeFilter === 'Category' && !s.category?.includes('Category')) return false;
        if (typeFilter === 'Private' && !s.type?.includes('Private') && !s.type?.includes('Sponsored')) return false;
      }

      // Education Level
      if (educationFilter !== 'All') {
        if (s.educationLevels && !s.educationLevels.includes(educationFilter)) return false;
      }

      // CGPA Cutoff
      if (cgpaFilter !== 'All') {
        const minReq = parseFloat(cgpaFilter);
        if (s.minCgpa && s.minCgpa > minReq) return false;
      }

      // Funding Amount Range
      if (amountFilter !== 'All') {
        if (amountFilter === 'under40' && s.awardAmount > 40000) return false;
        if (amountFilter === '40to60' && (s.awardAmount < 40000 || s.awardAmount > 60000)) return false;
        if (amountFilter === 'above60' && s.awardAmount < 60000) return false;
        if (amountFilter === 'waiver' && !s.fundingRange?.toLowerCase().includes('waiver') && !s.awardType?.toLowerCase().includes('waiver')) return false;
      }

      // Deadline Filter
      if (deadlineFilter !== 'All') {
        if (deadlineFilter === 'Closing Soon' && s.status !== 'Closing Soon') return false;
        if (deadlineFilter === 'Open' && s.status !== 'Open') return false;
      }

      // Only Eligible Toggle
      if (onlyEligible) {
        if (s.minCgpa && studentCgpa < s.minCgpa) return false;
      }

      // Only Bookmarked Toggle
      if (onlyBookmarked) {
        if (!savedSchemeIds.includes(s.id)) return false;
      }

      return true;
    });
  }, [
    schemes,
    searchTerm,
    typeFilter,
    educationFilter,
    cgpaFilter,
    amountFilter,
    deadlineFilter,
    onlyEligible,
    onlyBookmarked,
    studentCgpa,
    savedSchemeIds
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setEducationFilter('All');
    setCgpaFilter('All');
    setAmountFilter('All');
    setDeadlineFilter('All');
    setOnlyEligible(false);
    setOnlyBookmarked(false);
  };

  // Open Details Modal
  const handleOpenDetails = (scheme) => {
    setSelectedSchemeForDetails(scheme);
    setDetailTab('overview');
    setExpandedFaqIndex(0);
  };

  // Open Apply Modal
  const handleOpenApplyModal = (scheme) => {
    // Check if already applied
    const existing = myApplications.find((a) => a.schemeId === scheme.id);
    if (existing) {
      showToast(`You have already submitted an application (${existing.id}) for this scheme.`);
      setCurrentView('my-applications');
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
      alert('Please check and confirm the honor code declaration before submitting.');
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
      verificationStatus: 'Under Verification',
      reviewStatus: 'Under Review',
      approvalStage: 'Welfare Cell Initial Screening',
      recommendedAmount: applyingScheme.awardAmount,
      finalAwardAmount: applyingScheme.awardAmount,
      assignedReviewer: SCHOLARSHIP_OFFICER.name,
      disbursementStatus: 'Pending Verification',
      documentsCount: 4,
      reviewerRemarks: 'Application submitted online via Student Financial Aid Portal. Awaiting nodal document scrutiny.'
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    setSubmittedApplicationRef(newAppId);
    setApplyStep(5); // Success state

    // Also increment filledSlots in scheme
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
    <div className="scholarship-page-root">
      {/* ─── 1. TOP HEADER & NAVIGATION BAR ─────────────────────────────────────── */}
      <header className="sch-header-bar">
        <div className="sch-header-titles">
          <h1>
            <span className="sch-header-icon">
              <Award size={26} />
            </span>
            Scholarships & Financial Aid
          </h1>
          <p>
            Explore institutional fellowships, government statutory schemes, merit grants, and corporate CSR funding to support your academic journey.
          </p>
        </div>

        <div className="sch-header-actions">
          <button
            type="button"
            className={`sch-top-btn ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => setCurrentView('catalog')}
          >
            <Layers size={16} />
            <span>Opportunities Catalog</span>
          </button>

          <button
            type="button"
            className={`sch-top-btn ${currentView === 'my-applications' ? 'active' : ''}`}
            onClick={() => setCurrentView('my-applications')}
          >
            <BookmarkCheck size={16} />
            <span>My Applications</span>
            {myApplications.length > 0 && (
              <span className="sch-top-btn-badge">{myApplications.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`sch-top-btn ${onlyBookmarked ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('catalog');
              setOnlyBookmarked(!onlyBookmarked);
            }}
          >
            <Heart size={16} className={onlyBookmarked ? 'fill-current text-rose-500' : ''} />
            <span>Saved ({savedSchemeIds.length})</span>
          </button>
        </div>
      </header>

      {/* ─── 2. HERO HIGHLIGHT BANNER ───────────────────────────────────────────── */}
      <section className="sch-hero-card" aria-label="Scholarship Highlights">
        <div className="sch-hero-badge-row">
          <span className="sch-hero-badge highlight">
            <Sparkles size={13} /> Academic Session 2026–2027 Opportunities Open
          </span>
          <span className="sch-hero-badge">
            <ShieldCheck size={13} /> Verified DBT & Institutional Cell
          </span>
        </div>

        <div className="sch-hero-content">
          <h2>Empowering Merit, Supporting Need, Fulfilling Aspirations</h2>
          <p>
            Over ₹2.4+ Crore in tuition assistance, research fellowships, and government grants available across undergraduate, postgraduate, and technical diploma courses. Transparent online verification and direct bank transfer.
          </p>

          <div className="sch-hero-features">
            <div className="sch-hero-feat-item">
              <CheckCircle2 size={16} />
              <span>100% Online Application & Scrutiny</span>
            </div>
            <div className="sch-hero-feat-item">
              <CheckCircle2 size={16} />
              <span>Direct Benefit Transfer (DBT) via NPCI</span>
            </div>
            <div className="sch-hero-feat-item">
              <CheckCircle2 size={16} />
              <span>Dedicated Directorate Support Desk</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. KPI SUMMARY CARDS ───────────────────────────────────────────────── */}
      <section className="sch-kpi-grid" aria-label="Key Scholarship Metrics">
        {/* Card 1: Available Scholarships */}
        <div
          className={`sch-kpi-card ${typeFilter === 'All' && !onlyEligible ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('catalog');
            handleResetFilters();
          }}
          title="Click to view all active scholarship opportunities"
        >
          <div className="sch-kpi-card-header">
            <span className="sch-kpi-title">Available Scholarships</span>
            <div className="sch-kpi-icon-wrap sch-kpi-icon-blue">
              <Layers size={20} />
            </div>
          </div>
          <div className="sch-kpi-val">{availableCount}</div>
          <div className="sch-kpi-sub">
            <span>Govt + Institutional + CSR</span>
            <span className="sch-kpi-tag">Active Schemes</span>
          </div>
        </div>

        {/* Card 2: Eligible Opportunities */}
        <div
          className={`sch-kpi-card ${onlyEligible ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('catalog');
            setOnlyEligible(!onlyEligible);
          }}
          title="Click to filter scholarships you qualify for"
        >
          <div className="sch-kpi-card-header">
            <span className="sch-kpi-title">Eligible For You</span>
            <div className="sch-kpi-icon-wrap sch-kpi-icon-emerald">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="sch-kpi-val">{eligibleCount}</div>
          <div className="sch-kpi-sub">
            <span>Matched to {studentCgpa} CGPA</span>
            <span className="sch-kpi-tag eligible">Qualify Now</span>
          </div>
        </div>

        {/* Card 3: Applications In Progress */}
        <div
          className={`sch-kpi-card ${currentView === 'my-applications' ? 'active-filter' : ''}`}
          onClick={() => setCurrentView('my-applications')}
          title="Click to track your submitted scholarship applications"
        >
          <div className="sch-kpi-card-header">
            <span className="sch-kpi-title">Applications In Progress</span>
            <div className="sch-kpi-icon-wrap sch-kpi-icon-purple">
              <Clock size={20} />
            </div>
          </div>
          <div className="sch-kpi-val">{appsInProgressCount}</div>
          <div className="sch-kpi-sub">
            <span>{appsInProgressCount > 0 ? 'Tracking verification' : 'None submitted yet'}</span>
            <span className="sch-kpi-tag">{appsInProgressCount > 0 ? 'In Review' : 'Start Apply'}</span>
          </div>
        </div>

        {/* Card 4: Upcoming Deadlines */}
        <div
          className={`sch-kpi-card ${deadlineFilter === 'Closing Soon' ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('catalog');
            setDeadlineFilter(deadlineFilter === 'Closing Soon' ? 'All' : 'Closing Soon');
          }}
          title="Click to view schemes closing in the next 30 days"
        >
          <div className="sch-kpi-card-header">
            <span className="sch-kpi-title">Upcoming Deadlines</span>
            <div className="sch-kpi-icon-wrap sch-kpi-icon-amber">
              <Calendar size={20} />
            </div>
          </div>
          <div className="sch-kpi-val">{upcomingDeadlinesCount}</div>
          <div className="sch-kpi-sub">
            <span>Closing in November & December</span>
            <span className="sch-kpi-tag">Urgent</span>
          </div>
        </div>
      </section>

      {/* ─── CONDITIONAL VIEW 1: MY APPLICATIONS TRACKER ────────────────────────── */}
      {currentView === 'my-applications' ? (
        <section className="sch-my-apps-container">
          <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              My Scholarship Applications ({myApplications.length})
            </h2>
            <button
              type="button"
              className="sch-top-btn"
              onClick={() => setCurrentView('catalog')}
            >
              <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
              <span>Back to Catalog</span>
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="sch-empty-state">
              <div className="sch-empty-icon">
                <FileText size={26} />
              </div>
              <h3>No Applications Submitted Yet</h3>
              <p>
                You have not submitted any scholarship applications for Academic Session 2026–2027. Browse through our catalog and click "Apply Now" to get started.
              </p>
              <button
                type="button"
                className="sch-btn-apply"
                style={{ width: 'auto', padding: '0.65rem 1.4rem' }}
                onClick={() => setCurrentView('catalog')}
              >
                Browse Scholarships Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myApplications.map((app) => (
                <article key={app.id} className="sch-app-card">
                  <div className="sch-app-card-header">
                    <div>
                      <span className="sch-badge-id" style={{ marginRight: '8px' }}>
                        {app.id}
                      </span>
                      <span
                        className={`sch-status-badge ${
                          app.reviewStatus === 'Approved'
                            ? 'open'
                            : app.reviewStatus === 'Under Review'
                            ? 'applied'
                            : 'closing-soon'
                        }`}
                      >
                        {app.reviewStatus}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Submitted on: <strong style={{ color: '#0f172a' }}>{app.submissionDate}</strong>
                    </span>
                  </div>

                  <div>
                    <h3 className="sch-app-title">{app.schemeName}</h3>
                    <div className="sch-app-meta-row" style={{ marginTop: '4px' }}>
                      <span>
                        Applicant: <strong>{app.studentName}</strong> ({app.studentId})
                      </span>
                      <span>·</span>
                      <span>
                        Department: <strong>{app.dept}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Sanctioned Amount: <strong style={{ color: '#059669' }}>₹{(app.finalAwardAmount || app.recommendedAmount || 0).toLocaleString('en-IN')}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Stepper */}
                  <div className="sch-app-stepper">
                    <div className="sch-app-step done">
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ Step 1</span>
                      <span>Submitted Online</span>
                    </div>
                    <div
                      className={`sch-app-step ${
                        app.verificationStatus === 'Verified' ? 'done' : 'active'
                      }`}
                    >
                      <span>{app.verificationStatus === 'Verified' ? '✓' : '●'} Step 2</span>
                      <span>{app.verificationStatus}</span>
                    </div>
                    <div
                      className={`sch-app-step ${
                        app.reviewStatus === 'Approved'
                          ? 'done'
                          : app.reviewStatus === 'Under Review'
                          ? 'active'
                          : ''
                      }`}
                    >
                      <span>{app.reviewStatus === 'Approved' ? '✓' : '●'} Step 3</span>
                      <span>Directorate Scrutiny</span>
                    </div>
                    <div
                      className={`sch-app-step ${
                        app.disbursementStatus?.includes('Disbursed') ? 'done' : ''
                      }`}
                    >
                      <span>Step 4</span>
                      <span>{app.disbursementStatus || 'DBT Sanction'}</span>
                    </div>
                  </div>

                  {app.reviewerRemarks && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.82rem',
                        color: '#475569'
                      }}
                    >
                      <strong style={{ color: '#0f172a' }}>Directorate Remarks: </strong>
                      {app.reviewerRemarks}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed #e2e8f0'
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      Reviewer: {app.assignedReviewer || SCHOLARSHIP_OFFICER.name}
                    </span>
                    <button
                      type="button"
                      className="sch-btn-view"
                      style={{ padding: '0.45rem 0.85rem' }}
                      onClick={() => window.print()}
                    >
                      <Printer size={14} />
                      <span>Print Acknowledgment Slip</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* ─── CONDITIONAL VIEW 2: SCHOLARSHIPS CATALOG ───────────────────────── */
        <>
          {/* ─── 4. SEARCH & MULTI-FACET FILTER CONTROLS ───────────────────────── */}
          <section className="sch-filter-container" aria-label="Search and Filter Scholarships">
            {/* Search Input Row */}
            <div className="sch-search-row">
              <div className="sch-search-input-wrap">
                <Search size={18} className="sch-search-icon" />
                <input
                  type="text"
                  placeholder="Search by scholarship name, provider, funding body, category, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="sch-search-input"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="sch-search-clear"
                    onClick={() => setSearchTerm('')}
                    title="Clear search query"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown Filters Grid */}
            <div className="sch-dropdown-grid">
              {/* Type Filter */}
              <div className="sch-filter-select-wrap">
                <label className="sch-filter-label">Scheme Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="sch-select"
                >
                  <option value="All">All Types & Funding</option>
                  <option value="Government">Government Statutory (PRERANA, NSP, AICTE)</option>
                  <option value="Institutional">Institutional Aid & Merit</option>
                  <option value="Merit">Merit-Based Programs</option>
                  <option value="Need">Need-Based Financial Aid</option>
                  <option value="Category">Category-Based Affirmative Aid</option>
                  <option value="Private">Corporate CSR & Alumni Grants</option>
                </select>
              </div>

              {/* Education Level Filter */}
              <div className="sch-filter-select-wrap">
                <label className="sch-filter-label">Education Level</label>
                <select
                  value={educationFilter}
                  onChange={(e) => setEducationFilter(e.target.value)}
                  className="sch-select"
                >
                  <option value="All">All Levels (B.Tech, M.Tech, etc.)</option>
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                  <option value="M.Tech">M.Tech (Postgraduate)</option>
                  <option value="BCA">BCA (Computer Applications)</option>
                  <option value="MCA">MCA (Master of Computer Apps)</option>
                  <option value="Diploma">Diploma Engineering</option>
                </select>
              </div>

              {/* Minimum CGPA Requirement */}
              <div className="sch-filter-select-wrap">
                <label className="sch-filter-label">Eligibility (Min CGPA)</label>
                <select
                  value={cgpaFilter}
                  onChange={(e) => setCgpaFilter(e.target.value)}
                  className="sch-select"
                >
                  <option value="All">Any CGPA</option>
                  <option value="6.5">Minimum 6.5 CGPA</option>
                  <option value="7.0">Minimum 7.0 CGPA</option>
                  <option value="7.5">Minimum 7.5 CGPA</option>
                  <option value="8.0">Minimum 8.0 CGPA</option>
                  <option value="9.0">Distinction (≥ 9.0 CGPA)</option>
                </select>
              </div>

              {/* Funding Amount Range */}
              <div className="sch-filter-select-wrap">
                <label className="sch-filter-label">Award Amount</label>
                <select
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="sch-select"
                >
                  <option value="All">All Funding Amounts</option>
                  <option value="under40">Up to ₹40,000 / Year</option>
                  <option value="40to60">₹40,000 – ₹60,000 / Year</option>
                  <option value="above60">Above ₹60,000 / Year</option>
                  <option value="waiver">100% Tuition Fee Waiver</option>
                </select>
              </div>

              {/* Deadline Status */}
              <div className="sch-filter-select-wrap">
                <label className="sch-filter-label">Application Status</label>
                <select
                  value={deadlineFilter}
                  onChange={(e) => setDeadlineFilter(e.target.value)}
                  className="sch-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Currently Open</option>
                  <option value="Closing Soon">Closing Soon (Urgent)</option>
                </select>
              </div>
            </div>

            {/* Quick Pills & Reset Row */}
            <div className="sch-pills-row">
              <div className="sch-pills-left">
                <button
                  type="button"
                  className={`sch-pill-tag ${onlyEligible ? 'active-green' : ''}`}
                  onClick={() => setOnlyEligible(!onlyEligible)}
                >
                  <CheckCircle2 size={13} />
                  <span>Eligible For Me (CGPA: {studentCgpa})</span>
                </button>

                <button
                  type="button"
                  className={`sch-pill-tag ${onlyBookmarked ? 'active' : ''}`}
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                >
                  <Heart size={13} className={onlyBookmarked ? 'fill-current' : ''} />
                  <span>Bookmarked / Saved ({savedSchemeIds.length})</span>
                </button>

                <button
                  type="button"
                  className={`sch-pill-tag ${deadlineFilter === 'Closing Soon' ? 'active' : ''}`}
                  onClick={() =>
                    setDeadlineFilter(deadlineFilter === 'Closing Soon' ? 'All' : 'Closing Soon')
                  }
                >
                  <Clock size={13} />
                  <span>Closing Soon</span>
                </button>

                <button
                  type="button"
                  className={`sch-pill-tag ${typeFilter === 'Government' ? 'active' : ''}`}
                  onClick={() => setTypeFilter(typeFilter === 'Government' ? 'All' : 'Government')}
                >
                  <Building size={13} />
                  <span>Government Schemes</span>
                </button>
              </div>

              <div className="sch-pills-right">
                <span className="sch-results-count">
                  Showing <strong>{filteredSchemes.length}</strong> of {schemes.length} schemes
                </span>
                {(searchTerm ||
                  typeFilter !== 'All' ||
                  educationFilter !== 'All' ||
                  cgpaFilter !== 'All' ||
                  amountFilter !== 'All' ||
                  deadlineFilter !== 'All' ||
                  onlyEligible ||
                  onlyBookmarked) && (
                  <button
                    type="button"
                    className="sch-btn-reset"
                    onClick={handleResetFilters}
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ─── 5. SCHOLARSHIP CARDS GRID ─────────────────────────────────────── */}
          {filteredSchemes.length === 0 ? (
            <div className="sch-empty-state">
              <div className="sch-empty-icon">
                <AlertCircle size={26} />
              </div>
              <h3>No Matching Scholarships Found</h3>
              <p>
                We couldn't find any scholarship schemes matching your filter criteria. Try adjusting your search query, widening the CGPA cutoff, or clearing your active filters.
              </p>
              <button
                type="button"
                className="sch-btn-view"
                style={{ width: 'auto', padding: '0.6rem 1.4rem' }}
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="sch-cards-grid">
              {filteredSchemes.map((scheme) => {
                const isBookmarked = savedSchemeIds.includes(scheme.id);
                const isApplied = myApplications.some((a) => a.schemeId === scheme.id);
                const percentFilled = Math.min(
                  100,
                  Math.round(((scheme.filledSlots || 0) / (scheme.totalSlots || 1)) * 100)
                );
                const meetsCgpa = !scheme.minCgpa || studentCgpa >= scheme.minCgpa;

                return (
                  <article key={scheme.id} className="sch-card">
                    {/* Card Top Header */}
                    <div>
                      <div className="sch-card-top-bar">
                        <div className="sch-scheme-badges">
                          <span className="sch-badge-id">{scheme.id}</span>
                          <span
                            className={`sch-badge-type ${
                              scheme.type === 'Government'
                                ? 'government'
                                : scheme.type === 'Institutional'
                                ? 'institutional'
                                : 'private'
                            }`}
                          >
                            {scheme.type}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`sch-btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                          onClick={(e) => handleToggleBookmark(e, scheme.id)}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this scholarship'}
                        >
                          <Heart size={18} />
                        </button>
                      </div>

                      {/* Card Info Body */}
                      <div className="sch-card-body" style={{ marginTop: '0.75rem' }}>
                        <div className="sch-card-provider">
                          <Building size={14} />
                          <span>{scheme.provider || scheme.sponsorName}</span>
                        </div>

                        <h3 className="sch-card-title">{scheme.name}</h3>

                        <p className="sch-card-desc">{scheme.description}</p>

                        {/* Amount Highlight Box */}
                        <div className="sch-card-amount-box">
                          <div>
                            <span className="sch-amount-label">Award Value</span>
                            <div className="sch-amount-val">
                              ₹{scheme.awardAmount?.toLocaleString('en-IN') || '0'}
                            </div>
                          </div>
                          <span className="sch-amount-tag">
                            {scheme.awardType || 'Annual Grant'}
                          </span>
                        </div>

                        {/* Criteria Grid */}
                        <div className="sch-card-criteria-grid">
                          <div className="sch-criteria-pill">
                            <span className="sch-criteria-lbl">Eligibility CGPA</span>
                            <span
                              className={`sch-criteria-val ${
                                meetsCgpa ? 'eligible-match' : ''
                              }`}
                            >
                              {meetsCgpa && <CheckCircle2 size={12} />}
                              ≥ {scheme.minCgpa || '6.0'} CGPA
                            </span>
                          </div>

                          <div className="sch-criteria-pill">
                            <span className="sch-criteria-lbl">Income Ceiling</span>
                            <span className="sch-criteria-val">
                              {scheme.incomeCeiling
                                ? `≤ ₹${(scheme.incomeCeiling / 100000).toFixed(1)} Lakhs`
                                : 'No Ceiling (Merit)'}
                            </span>
                          </div>

                          <div className="sch-criteria-pill">
                            <span className="sch-criteria-lbl">Education Levels</span>
                            <span className="sch-criteria-val">
                              {scheme.educationLevels?.slice(0, 2).join(', ') || 'All Programs'}
                            </span>
                          </div>

                          <div className="sch-criteria-pill">
                            <span className="sch-criteria-lbl">Semesters</span>
                            <span className="sch-criteria-val">
                              {scheme.eligibleSemesters?.includes('All Semesters')
                                ? 'All Semesters'
                                : scheme.eligibleSemesters?.join(', ') || 'All Semesters'}
                            </span>
                          </div>
                        </div>

                        {/* Quota meter */}
                        <div className="sch-quota-wrap">
                          <div className="sch-quota-header">
                            <span>Quota Slots</span>
                            <span>
                              <strong>{scheme.filledSlots || 0}</strong> / {scheme.totalSlots} Filled ({percentFilled}%)
                            </span>
                          </div>
                          <div className="sch-quota-bar-track">
                            <div
                              className={`sch-quota-bar-fill ${
                                percentFilled > 85
                                  ? 'full'
                                  : percentFilled > 60
                                  ? 'warning'
                                  : 'normal'
                              }`}
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer & Action Buttons */}
                    <div className="sch-card-footer">
                      <div className="sch-deadline-row">
                        <div className="sch-deadline-info">
                          <Calendar size={14} />
                          <span>Last Date: <strong>{scheme.closingDate}</strong></span>
                        </div>

                        <span
                          className={`sch-status-badge ${
                            isApplied
                              ? 'applied'
                              : scheme.status === 'Open'
                              ? 'open'
                              : scheme.status === 'Closing Soon'
                              ? 'closing-soon'
                              : 'closed'
                          }`}
                        >
                          {isApplied ? 'Applied' : scheme.status}
                        </span>
                      </div>

                      <div className="sch-card-actions">
                        <button
                          type="button"
                          className="sch-btn-view"
                          onClick={() => handleOpenDetails(scheme)}
                        >
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          className={`sch-btn-apply ${isApplied ? 'already-applied' : ''}`}
                          disabled={scheme.status === 'Closed'}
                          onClick={() => handleOpenApplyModal(scheme)}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Send size={14} />
                              <span>Apply Now</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── 6. DETAILS MODAL ───────────────────────────────────────────────────── */}
      {selectedSchemeForDetails && (
        <div
          className="sch-modal-overlay"
          onClick={() => setSelectedSchemeForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sch-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sch-modal-header">
              <div className="sch-modal-header-titles">
                <h2>{selectedSchemeForDetails.name}</h2>
                <div className="sch-modal-header-sub">
                  <Building size={14} />
                  <span>{selectedSchemeForDetails.provider || selectedSchemeForDetails.sponsorName}</span>
                  <span>·</span>
                  <span className="sch-badge-id">{selectedSchemeForDetails.id}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`sch-btn-bookmark ${
                    savedSchemeIds.includes(selectedSchemeForDetails.id) ? 'bookmarked' : ''
                  }`}
                  onClick={(e) => handleToggleBookmark(e, selectedSchemeForDetails.id)}
                  title="Bookmark"
                >
                  <Heart size={20} />
                </button>
                <button
                  type="button"
                  className="sch-modal-close-btn"
                  onClick={() => setSelectedSchemeForDetails(null)}
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="sch-modal-body">
              {/* Highlights strip */}
              <div className="sch-modal-highlights">
                <div className="sch-hl-item">
                  <span className="sch-hl-label">Annual Award</span>
                  <span className="sch-hl-value" style={{ color: '#2563eb' }}>
                    ₹{selectedSchemeForDetails.awardAmount?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="sch-hl-item">
                  <span className="sch-hl-label">Min CGPA</span>
                  <span className="sch-hl-value">
                    ≥ {selectedSchemeForDetails.minCgpa || '6.0'}
                  </span>
                </div>

                <div className="sch-hl-item">
                  <span className="sch-hl-label">Income Limit</span>
                  <span className="sch-hl-value">
                    {selectedSchemeForDetails.incomeCeiling
                      ? `≤ ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(1)}L`
                      : 'No Limit'}
                  </span>
                </div>

                <div className="sch-hl-item">
                  <span className="sch-hl-label">Closing Date</span>
                  <span className="sch-hl-value" style={{ color: '#d97706' }}>
                    {selectedSchemeForDetails.closingDate}
                  </span>
                </div>

                <div className="sch-hl-item">
                  <span className="sch-hl-label">Quota</span>
                  <span className="sch-hl-value">
                    {selectedSchemeForDetails.filledSlots} / {selectedSchemeForDetails.totalSlots}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="sch-modal-tabs">
                <button
                  type="button"
                  className={`sch-modal-tab-btn ${detailTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setDetailTab('overview')}
                >
                  Overview & Benefits
                </button>
                <button
                  type="button"
                  className={`sch-modal-tab-btn ${detailTab === 'eligibility' ? 'active' : ''}`}
                  onClick={() => setDetailTab('eligibility')}
                >
                  Eligibility Requirements
                </button>
                <button
                  type="button"
                  className={`sch-modal-tab-btn ${detailTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setDetailTab('documents')}
                >
                  Required Documents
                </button>
                <button
                  type="button"
                  className={`sch-modal-tab-btn ${detailTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setDetailTab('timeline')}
                >
                  Application Process
                </button>
                <button
                  type="button"
                  className={`sch-modal-tab-btn ${detailTab === 'faqs' ? 'active' : ''}`}
                  onClick={() => setDetailTab('faqs')}
                >
                  FAQs & Nodal Desk
                </button>
              </div>

              {/* Tab 1: Overview & Benefits */}
              {detailTab === 'overview' && (
                <div className="sch-tab-content-pane">
                  <div>
                    <h4>Scheme Description</h4>
                    <p>{selectedSchemeForDetails.description}</p>
                  </div>

                  <div>
                    <h4>Key Entitlements & Financial Benefits</h4>
                    <ul className="sch-checklist">
                      {(
                        selectedSchemeForDetails.benefits || [
                          'Direct tuition fee reimbursement credited to student bank account or institutional ledger.',
                          'Annual book and learning materials grant.',
                          'Exemption from selected campus laboratory and examination fees.',
                          'Valid throughout the normal program duration subject to academic renewal.'
                        ]
                      ).map((benefit, idx) => (
                        <li key={idx} className="sch-checklist-item">
                          <CheckCircle2 size={16} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Funding Source</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedSchemeForDetails.fundingSource}
                      </div>
                    </div>
                    {selectedSchemeForDetails.applicationUrl && (
                      <a
                        href={selectedSchemeForDetails.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sch-btn-view"
                        style={{ padding: '0.45rem 0.85rem', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                        <span>Official Portal</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Eligibility Requirements */}
              {detailTab === 'eligibility' && (
                <div className="sch-tab-content-pane">
                  <h4>Mandatory Eligibility Criteria</h4>
                  <ul className="sch-checklist">
                    <li className="sch-checklist-item">
                      <CheckCircle2 size={16} />
                      <div>
                        <strong>Academic Performance: </strong>
                        Minimum CGPA of <strong>≥ {selectedSchemeForDetails.minCgpa || '6.0'}</strong> in preceding semester evaluations with zero standing backlogs.
                        <div style={{ fontSize: '0.76rem', color: studentCgpa >= (selectedSchemeForDetails.minCgpa || 6.0) ? '#059669' : '#dc2626', marginTop: '2px', fontWeight: 600 }}>
                          {studentCgpa >= (selectedSchemeForDetails.minCgpa || 6.0)
                            ? `✓ You qualify! Your CGPA is ${studentCgpa}`
                            : `✕ Minimum required is ${selectedSchemeForDetails.minCgpa}, your current CGPA is ${studentCgpa}`}
                        </div>
                      </div>
                    </li>

                    <li className="sch-checklist-item">
                      <CheckCircle2 size={16} />
                      <div>
                        <strong>Family Income Ceiling: </strong>
                        {selectedSchemeForDetails.incomeCeiling
                          ? `Total annual gross income from all sources must not exceed ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(2)} Lakhs per annum.`
                          : 'No income ceiling applicable. Pure merit-based award.'}
                      </div>
                    </li>

                    <li className="sch-checklist-item">
                      <CheckCircle2 size={16} />
                      <div>
                        <strong>Eligible Programs & Semesters: </strong>
                        Enrolled in {selectedSchemeForDetails.educationLevels?.join(', ') || 'B.Tech/M.Tech'} · {selectedSchemeForDetails.eligibleSemesters?.join(', ') || 'All Semesters'}.
                      </div>
                    </li>

                    <li className="sch-checklist-item">
                      <CheckCircle2 size={16} />
                      <div>
                        <strong>Minimum Attendance Requirement: </strong>
                        Must have maintained at least 75% aggregate biometric class attendance during the term.
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {/* Tab 3: Required Documents */}
              {detailTab === 'documents' && (
                <div className="sch-tab-content-pane">
                  <h4>Checklist of Mandatory Documents</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Please ensure clear scanned copies in PDF or JPG format (maximum 2MB per document) are ready for upload:
                  </p>
                  <ul className="sch-checklist">
                    {(selectedSchemeForDetails.requiredDocs || [
                      'Latest Tehsildar Certified Annual Income Certificate (FY 2026-27)',
                      'Autonomous Controller of Examinations Verified Grade Sheets',
                      'Active Savings Bank Account Passbook Copy with visible IFSC Code',
                      'Student Aadhaar Card and College Identity Card Copy',
                      'Permanent Resident / Domicile Certificate'
                    ]).map((doc, idx) => (
                      <li key={idx} className="sch-checklist-item">
                        <FileCheck size={16} />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tab 4: Process & Timeline */}
              {detailTab === 'timeline' && (
                <div className="sch-tab-content-pane">
                  <h4>Application & Sanction Workflow</h4>
                  <div className="sch-timeline-list">
                    {(
                      selectedSchemeForDetails.timeline || [
                        { step: 1, title: 'Step 1: Online Application', desc: 'Complete profile disclosure and upload required credentials', date: selectedSchemeForDetails.openingDate + ' – ' + selectedSchemeForDetails.closingDate },
                        { step: 2, title: 'Step 2: Nodal Verification', desc: 'Scrutiny of marksheets and income certificates by College Welfare Directorate', date: 'Within 7 working days' },
                        { step: 3, title: 'Step 3: Senate Committee Sanction', desc: 'Executive committee sanction and merit ranking validation', date: 'December 2026' },
                        { step: 4, title: 'Step 4: Fund Disbursement', desc: 'Direct Benefit Transfer (DBT) credit into Aadhaar-seeded bank account', date: 'January 2027' }
                      ]
                    ).map((t) => (
                      <div key={t.step} className="sch-timeline-item">
                        <div className="sch-timeline-dot">{t.step}</div>
                        <div className="sch-timeline-title">{t.title}</div>
                        <div className="sch-timeline-desc">{t.desc}</div>
                        <div className="sch-timeline-date">{t.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: FAQs & Nodal Desk */}
              {detailTab === 'faqs' && (
                <div className="sch-tab-content-pane">
                  <h4>Frequently Asked Questions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {(
                      selectedSchemeForDetails.faqs || [
                        {
                          q: 'Can I apply for more than one scholarship concurrently?',
                          a: 'Students may apply for multiple schemes. However, as per government statutory norms, a student can typically draw only one government tuition assistance grant at a time.'
                        },
                        {
                          q: 'How will I receive the sanctioned scholarship amount?',
                          a: 'Government grants are directly credited to your Aadhaar-seeded bank account via NPCI DBT. Institutional fellowships are credited against your tuition fee balance.'
                        },
                        {
                          q: 'What should I do if my document verification fails?',
                          a: 'You will receive a notification in your student dashboard detailing the discrepancy. You may upload a rectified document within 7 calendar days.'
                        }
                      ]
                    ).map((faq, idx) => {
                      const isExpanded = expandedFaqIndex === idx;
                      return (
                        <div key={idx} className="sch-faq-item">
                          <button
                            type="button"
                            className="sch-faq-question"
                            onClick={() => setExpandedFaqIndex(isExpanded ? -1 : idx)}
                          >
                            <span>{faq.q}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {isExpanded && <div className="sch-faq-answer">{faq.a}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Nodal Officer Contact Card */}
                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#2563eb',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                        Nodal Directorate Helpdesk
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {SCHOLARSHIP_OFFICER.name} · {SCHOLARSHIP_OFFICER.designation}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Email: {SCHOLARSHIP_OFFICER.email} · Phone: {SCHOLARSHIP_OFFICER.phone}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sch-modal-footer">
              <button
                type="button"
                className="sch-btn-view"
                onClick={() => setSelectedSchemeForDetails(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="sch-btn-apply"
                disabled={selectedSchemeForDetails.status === 'Closed'}
                onClick={() => {
                  const scheme = selectedSchemeForDetails;
                  setSelectedSchemeForDetails(null);
                  handleOpenApplyModal(scheme);
                }}
              >
                <Send size={15} />
                <span>Apply For Scholarship</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. APPLY NOW MULTI-STEP APPLICATION MODAL ──────────────────────────── */}
      {applyingScheme && (
        <div
          className="sch-modal-overlay"
          onClick={() => setApplyingScheme(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sch-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sch-modal-header">
              <div className="sch-modal-header-titles">
                <h2>Application: {applyingScheme.name}</h2>
                <div className="sch-modal-header-sub">
                  <span>Award: ₹{applyingScheme.awardAmount?.toLocaleString('en-IN')}</span>
                  <span>·</span>
                  <span>Target Session: 2026–2027</span>
                </div>
              </div>
              <button
                type="button"
                className="sch-modal-close-btn"
                onClick={() => setApplyingScheme(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="sch-modal-body">
              {/* Progress Stepper Bar */}
              {applyStep <= 4 && (
                <div className="sch-stepper-bar">
                  <div
                    className={`sch-step-node ${
                      applyStep === 1 ? 'active' : applyStep > 1 ? 'completed' : ''
                    }`}
                  >
                    <span className="sch-step-num">{applyStep > 1 ? '✓' : '1'}</span>
                    <span>Student Profile</span>
                  </div>

                  <div
                    className={`sch-step-node ${
                      applyStep === 2 ? 'active' : applyStep > 2 ? 'completed' : ''
                    }`}
                  >
                    <span className="sch-step-num">{applyStep > 2 ? '✓' : '2'}</span>
                    <span>Income & Bank</span>
                  </div>

                  <div
                    className={`sch-step-node ${
                      applyStep === 3 ? 'active' : applyStep > 3 ? 'completed' : ''
                    }`}
                  >
                    <span className="sch-step-num">{applyStep > 3 ? '✓' : '3'}</span>
                    <span>Documents</span>
                  </div>

                  <div className={`sch-step-node ${applyStep === 4 ? 'active' : ''}`}>
                    <span className="sch-step-num">4</span>
                    <span>Declaration</span>
                  </div>
                </div>
              )}

              {/* STEP 1: Student Profile */}
              {applyStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="sch-form-grid-2">
                    <div className="sch-form-group">
                      <label>Student Full Name</label>
                      <input
                        type="text"
                        value={applyFormData.fullName}
                        readOnly
                      />
                    </div>

                    <div className="sch-form-group">
                      <label>Registration / Roll Number</label>
                      <input
                        type="text"
                        value={applyFormData.rollNumber}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="sch-form-grid-2">
                    <div className="sch-form-group">
                      <label>Academic Department</label>
                      <input
                        type="text"
                        value={applyFormData.department}
                        readOnly
                      />
                    </div>

                    <div className="sch-form-group">
                      <label>Current Semester</label>
                      <input
                        type="text"
                        value={applyFormData.semester}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="sch-form-grid-2">
                    <div className="sch-form-group">
                      <label>Current Cumulative CGPA</label>
                      <input
                        type="text"
                        value={applyFormData.cgpa}
                        readOnly
                      />
                    </div>

                    <div className="sch-form-group">
                      <label>Social / Reservation Category</label>
                      <input
                        type="text"
                        value={applyFormData.category}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, category: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Income & Bank Details */}
              {applyStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="sch-form-grid-2">
                    <div className="sch-form-group">
                      <label>Father's / Guardian's Full Name</label>
                      <input
                        type="text"
                        value={applyFormData.fatherName}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, fatherName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="sch-form-group">
                      <label>Father's Occupation</label>
                      <input
                        type="text"
                        value={applyFormData.fatherOccupation}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, fatherOccupation: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="sch-form-grid-2">
                    <div className="sch-form-group">
                      <label>Total Annual Family Income (INR)</label>
                      <input
                        type="number"
                        value={applyFormData.familyIncome}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, familyIncome: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="sch-form-group">
                      <label>Ration Card / BPL Number (Optional)</label>
                      <input
                        type="text"
                        value={applyFormData.rationCardNo}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, rationCardNo: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="sch-form-grid-2">
                    <div className="sch-form-group">
                      <label>Bank Account Number (Aadhaar Linked)</label>
                      <input
                        type="text"
                        value={applyFormData.bankAccount}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, bankAccount: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="sch-form-group">
                      <label>Bank IFSC Code</label>
                      <input
                        type="text"
                        value={applyFormData.bankIfsc}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, bankIfsc: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="sch-form-group">
                    <label>Bank Branch Name</label>
                    <input
                      type="text"
                      value={applyFormData.bankBranch}
                      onChange={(e) =>
                        setApplyFormData({ ...applyFormData, bankBranch: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Supporting Documents */}
              {applyStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="sch-file-dropzone" onClick={() => showToast('Documents attached automatically from verified profile!')}>
                    <UploadCloud size={28} color="#2563eb" />
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>
                        Click to upload additional documents
                      </strong>
                      <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '4px 0 0' }}>
                        Supported formats: PDF, JPG, PNG (Max 2MB per file)
                      </p>
                    </div>
                  </div>

                  <div className="sch-upload-list">
                    <div className="sch-upload-item">
                      <div className="sch-upload-item-left">
                        <FileCheck size={16} color="#059669" />
                        <span>Annual Income Certificate (FY 2026-27).pdf</span>
                      </div>
                      <span className="sch-upload-status">✓ Verified</span>
                    </div>

                    <div className="sch-upload-item">
                      <div className="sch-upload-item-left">
                        <FileCheck size={16} color="#059669" />
                        <span>Semester Grade Marksheet (Autonomous Cell).pdf</span>
                      </div>
                      <span className="sch-upload-status">✓ Verified</span>
                    </div>

                    <div className="sch-upload-item">
                      <div className="sch-upload-item-left">
                        <FileCheck size={16} color="#059669" />
                        <span>Bank Account Passbook (Aadhaar Linked).jpg</span>
                      </div>
                      <span className="sch-upload-status">✓ Verified</span>
                    </div>

                    <div className="sch-upload-item">
                      <div className="sch-upload-item-left">
                        <FileCheck size={16} color="#059669" />
                        <span>Student Aadhaar & College ID Card.pdf</span>
                      </div>
                      <span className="sch-upload-status">✓ Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Declaration */}
              {applyStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                      Application Summary
                    </div>
                    <div>Scheme: <strong>{applyingScheme.name}</strong></div>
                    <div>Applicant: <strong>{applyFormData.fullName}</strong> ({applyFormData.rollNumber})</div>
                    <div>Department: <strong>{applyFormData.department}</strong> · CGPA: <strong>{applyFormData.cgpa}</strong></div>
                    <div>Annual Family Income: <strong>₹{Number(applyFormData.familyIncome).toLocaleString('en-IN')}</strong></div>
                    <div>Bank Account: <strong>{applyFormData.bankAccount}</strong> (IFSC: {applyFormData.bankIfsc})</div>
                  </div>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      fontSize: '0.82rem',
                      color: '#334155',
                      cursor: 'pointer',
                      background: '#eff6ff',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={applyFormData.agreedToTerms}
                      onChange={(e) =>
                        setApplyFormData({ ...applyFormData, agreedToTerms: e.target.checked })
                      }
                      style={{ marginTop: '3px' }}
                    />
                    <span>
                      I hereby solemnly declare that all information furnished above and documents attached are true, correct, and complete to the best of my knowledge. I understand that any false disclosure shall render my scholarship liable to instant forfeiture and disciplinary proceedings under college rules.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 5: Success Screen */}
              {applyStep === 5 && submittedApplicationRef && (
                <div className="sch-success-view">
                  <div className="sch-success-icon">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#0f172a' }}>
                      Application Successfully Submitted!
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, maxWidth: '480px' }}>
                      Your scholarship application has been transmitted to the Directorate of Student Welfare & Financial Aid for initial document screening.
                    </p>
                  </div>

                  <div className="sch-ref-card">
                    <span className="sch-ref-title">Application Reference Number</span>
                    <span className="sch-ref-code">{submittedApplicationRef}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="sch-btn-view"
                      onClick={() => window.print()}
                    >
                      <Printer size={15} />
                      <span>Download Submission Receipt</span>
                    </button>

                    <button
                      type="button"
                      className="sch-btn-apply"
                      onClick={() => {
                        setApplyingScheme(null);
                        setCurrentView('my-applications');
                      }}
                    >
                      <span>Track In My Applications</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            {applyStep <= 4 && (
              <div className="sch-modal-footer">
                {applyStep > 1 && (
                  <button
                    type="button"
                    className="sch-btn-view"
                    onClick={() => setApplyStep(applyStep - 1)}
                  >
                    Back
                  </button>
                )}

                {applyStep < 4 ? (
                  <button
                    type="button"
                    className="sch-btn-apply"
                    onClick={() => setApplyStep(applyStep + 1)}
                  >
                    <span>Continue to Step {applyStep + 1}</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sch-btn-apply"
                    disabled={!applyFormData.agreedToTerms}
                    onClick={handleSubmitApplication}
                  >
                    <Send size={15} />
                    <span>Submit Official Application</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 8. FLOATING TOAST NOTIFICATION ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="sch-toast" role="status" aria-live="polite">
          <CheckCircle2 size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
