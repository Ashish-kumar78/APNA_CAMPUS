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
  Printer,
  Compass,
  Check
} from 'lucide-react';
import './ScholarshipPage.css';

// Master Data & Models
import {
  INITIAL_SCHOLARSHIP_SCHEMES,
  INITIAL_APPLICATIONS,
  SCHOLARSHIP_OFFICER
} from '../components/ScholarshipModules/scholarshipData.js';
import { getActiveStudent } from '../services/studentStore.js';

// Authority / Organization Crest helper
function AuthorityCrest({ type, provider }) {
  if (provider?.includes('Odisha') || provider?.includes('Government of Odisha')) {
    return <div className="sch-crest-avatar crest-govt" title="Government of Odisha">OD</div>;
  }
  if (provider?.includes('Ministry of Education') || provider?.includes('MoE') || provider?.includes('National')) {
    return <div className="sch-crest-avatar crest-govt" title="Government of India">IN</div>;
  }
  if (provider?.includes('Tata')) {
    return <div className="sch-crest-avatar crest-tata" title="Tata Community Initiatives Trust">TT</div>;
  }
  if (provider?.includes('Infosys')) {
    return <div className="sch-crest-avatar crest-corp" title="Infosys Foundation">INF</div>;
  }
  if (provider?.includes('AICTE')) {
    return <div className="sch-crest-avatar crest-govt" title="All India Council for Technical Education">AICTE</div>;
  }
  if (provider?.includes('Alumni')) {
    return <div className="sch-crest-avatar crest-corp" title="Global Alumni Trust">ALM</div>;
  }
  return <div className="sch-crest-avatar crest-inst" title="Apna Campus Institutional Trust">AC</div>;
}

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

  // Schemes State
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

  // Bookmarks State
  const [savedSchemeIds, setSavedSchemeIds] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_saved_scholarships');
      return stored ? JSON.parse(stored) : ['SCH-SCHEME-01', 'SCH-SCHEME-03'];
    } catch {
      return ['SCH-SCHEME-01', 'SCH-SCHEME-03'];
    }
  });

  // Sync to LocalStorage
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

  // Current View: 'catalog' | 'my-applications'
  const [currentView, setCurrentView] = useState('catalog');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [educationLevelFilter, setEducationLevelFilter] = useState('All');
  const [cgpaRequirementFilter, setCgpaRequirementFilter] = useState('All');
  const [onlyEligibleToggle, setOnlyEligibleToggle] = useState(false);
  const [onlySavedToggle, setOnlySavedToggle] = useState(false);

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
      showToast('Removed from saved scholarships.');
    } else {
      setSavedSchemeIds([...savedSchemeIds, schemeId]);
      showToast('Saved to your scholarship bookmarks!');
    }
  };

  // Filter Logic
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
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

      // Category Tab
      if (activeCategoryTab !== 'all') {
        if (activeCategoryTab === 'govt' && s.type !== 'Government') return false;
        if (activeCategoryTab === 'inst' && s.type !== 'Institutional') return false;
        if (activeCategoryTab === 'need' && !s.category?.includes('Need') && s.type !== 'Need-Based') return false;
        if (activeCategoryTab === 'csr' && !s.type?.includes('Private') && !s.type?.includes('Sponsored')) return false;
        if (activeCategoryTab === 'women' && !s.name?.toLowerCase().includes('women') && !s.name?.toLowerCase().includes('girl')) return false;
        if (activeCategoryTab === 'pg' && (!s.educationLevels || !s.educationLevels.includes('M.Tech'))) return false;
      }

      // Education Level Filter
      if (educationLevelFilter !== 'All') {
        if (s.educationLevels && !s.educationLevels.includes(educationLevelFilter)) return false;
      }

      // CGPA Cutoff Filter
      if (cgpaRequirementFilter !== 'All') {
        const cutoff = parseFloat(cgpaRequirementFilter);
        if (s.minCgpa && s.minCgpa > cutoff) return false;
      }

      // Only Eligible Toggle
      if (onlyEligibleToggle) {
        if (s.minCgpa && studentCgpa < s.minCgpa) return false;
      }

      // Only Saved Toggle
      if (onlySavedToggle) {
        if (!savedSchemeIds.includes(s.id)) return false;
      }

      return true;
    });
  }, [
    schemes,
    searchTerm,
    activeCategoryTab,
    educationLevelFilter,
    cgpaRequirementFilter,
    onlyEligibleToggle,
    onlySavedToggle,
    studentCgpa,
    savedSchemeIds
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveCategoryTab('all');
    setEducationLevelFilter('All');
    setCgpaRequirementFilter('All');
    setOnlyEligibleToggle(false);
    setOnlySavedToggle(false);
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
      verificationStatus: 'Under Verification',
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
    setApplyStep(5); // Confirmation screen

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
            <span className="sch-header-icon-badge">
              <Award size={22} />
            </span>
            Scholarships & Financial Aid
          </h1>
          <p>
            Explore institutional fellowships, government statutory aid, and corporate CSR endowments designed to support your academic journey at Apna Campus.
          </p>
        </div>

        <div className="sch-header-actions">
          <button
            type="button"
            className={`sch-nav-pill-btn ${currentView === 'catalog' ? 'active' : ''}`}
            onClick={() => setCurrentView('catalog')}
          >
            <Compass size={16} />
            <span>Opportunities Catalog</span>
          </button>

          <button
            type="button"
            className={`sch-nav-pill-btn ${currentView === 'my-applications' ? 'active' : ''}`}
            onClick={() => setCurrentView('my-applications')}
          >
            <BookmarkCheck size={16} />
            <span>My Applications</span>
            {myApplications.length > 0 && (
              <span className="sch-nav-badge">{myApplications.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`sch-nav-pill-btn ${onlySavedToggle ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('catalog');
              setOnlySavedToggle(!onlySavedToggle);
            }}
          >
            <Heart size={16} className={onlySavedToggle ? 'fill-current text-rose-500' : ''} />
            <span>Saved ({savedSchemeIds.length})</span>
          </button>
        </div>
      </header>

      {/* ─── 2. REFINED EDITORIAL HERO BANNER ───────────────────────────────────── */}
      <section className="sch-editorial-hero" aria-label="Scholarship Overview">
        <div className="sch-hero-left">
          <div className="sch-hero-trust-tag">
            <Sparkles size={13} /> Academic Session 2026–2027 Opportunities Open
          </div>
          <h2>Financial Support for Every Step of Your Education</h2>
          <p>
            Browse over 10 active institutional, state, and corporate funding schemes. Check eligibility in real time and submit your application with verified academic credentials.
          </p>
          <div className="sch-hero-bullet-row">
            <div className="sch-hero-bullet">
              <CheckCircle2 size={16} />
              <span>Transparent Online Scrutiny</span>
            </div>
            <div className="sch-hero-bullet">
              <CheckCircle2 size={16} />
              <span>Direct Bank Transfer (DBT)</span>
            </div>
            <div className="sch-hero-bullet">
              <CheckCircle2 size={16} />
              <span>Welfare Directorate Assistance</span>
            </div>
          </div>
        </div>

        {/* Refined Stats Strip on the Right */}
        <div className="sch-hero-stats-panel">
          <div className="sch-stat-box">
            <span className="sch-stat-num">₹2.8 Cr+</span>
            <span className="sch-stat-lbl">Aid Allocated</span>
          </div>
          <div className="sch-stat-divider" />
          <div className="sch-stat-box">
            <span className="sch-stat-num">1,420+</span>
            <span className="sch-stat-lbl">Scholars Funded</span>
          </div>
          <div className="sch-stat-divider" />
          <div className="sch-stat-box">
            <span className="sch-stat-num">100%</span>
            <span className="sch-stat-lbl">Direct DBT</span>
          </div>
        </div>
      </section>

      {/* ─── 3. REFINED KPI METRIC CARDS ────────────────────────────────────────── */}
      <section className="sch-kpi-grid" aria-label="Key Scholarship Highlights">
        {/* Card 1: Available Opportunities */}
        <div
          className={`sch-kpi-card ${activeCategoryTab === 'all' && !onlyEligibleToggle ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('catalog');
            handleResetFilters();
          }}
          title="Click to view all active scholarship opportunities"
        >
          <div className="sch-kpi-top">
            <span className="sch-kpi-label">Available Schemes</span>
            <div className="sch-kpi-icon-pill sch-kpi-icon-blue">
              <Layers size={18} />
            </div>
          </div>
          <div className="sch-kpi-figure">{availableCount}</div>
          <div className="sch-kpi-footer">
            <span>Govt + Institutional + CSR</span>
            <span className="sch-kpi-status-tag">Active</span>
          </div>
        </div>

        {/* Card 2: Matched To Your Profile */}
        <div
          className={`sch-kpi-card ${onlyEligibleToggle ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('catalog');
            setOnlyEligibleToggle(!onlyEligibleToggle);
          }}
          title="Click to filter scholarships you qualify for"
        >
          <div className="sch-kpi-top">
            <span className="sch-kpi-label">Matched For You</span>
            <div className="sch-kpi-icon-pill sch-kpi-icon-emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="sch-kpi-figure">{eligibleCount}</div>
          <div className="sch-kpi-footer">
            <span>Matched to {studentCgpa} CGPA</span>
            <span className="sch-kpi-status-tag eligible">You Qualify</span>
          </div>
        </div>

        {/* Card 3: My Applications */}
        <div
          className={`sch-kpi-card ${currentView === 'my-applications' ? 'active-filter' : ''}`}
          onClick={() => setCurrentView('my-applications')}
          title="Click to view your submitted applications"
        >
          <div className="sch-kpi-top">
            <span className="sch-kpi-label">My Applications</span>
            <div className="sch-kpi-icon-pill sch-kpi-icon-purple">
              <Clock size={18} />
            </div>
          </div>
          <div className="sch-kpi-figure">{appsInProgressCount}</div>
          <div className="sch-kpi-footer">
            <span>{appsInProgressCount > 0 ? 'Tracking verification' : 'None submitted yet'}</span>
            <span className="sch-kpi-status-tag">{appsInProgressCount > 0 ? 'In Review' : 'Start Apply'}</span>
          </div>
        </div>

        {/* Card 4: Approaching Deadlines */}
        <div
          className="sch-kpi-card"
          onClick={() => {
            setCurrentView('catalog');
            showToast('Showing schemes closing this month');
          }}
          title="Upcoming cutoff dates"
        >
          <div className="sch-kpi-top">
            <span className="sch-kpi-label">Closing Soon</span>
            <div className="sch-kpi-icon-pill sch-kpi-icon-amber">
              <Calendar size={18} />
            </div>
          </div>
          <div className="sch-kpi-figure">{upcomingDeadlinesCount}</div>
          <div className="sch-kpi-footer">
            <span>Autumn Cycle Deadlines</span>
            <span className="sch-kpi-status-tag" style={{ background: '#fef3c7', color: '#92400e' }}>
              Action Needed
            </span>
          </div>
        </div>
      </section>

      {/* ─── CONDITIONAL VIEW 1: MY APPLICATIONS TRACKER ────────────────────────── */}
      {currentView === 'my-applications' ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Submitted Applications &amp; Verification Tracker ({myApplications.length})
            </h2>
            <button
              type="button"
              className="sch-nav-pill-btn"
              onClick={() => setCurrentView('catalog')}
            >
              <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
              <span>Back to Catalog</span>
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="sch-empty-dossier">
              <div className="sch-empty-crest">
                <FileText size={24} />
              </div>
              <h3>No Applications on Record</h3>
              <p>
                You haven't submitted any applications for Academic Session 2026–2027 yet. Browse available schemes in our catalog and apply before upcoming deadlines.
              </p>
              <button
                type="button"
                className="sch-btn-apply-primary"
                style={{ width: 'auto', padding: '0.65rem 1.4rem' }}
                onClick={() => setCurrentView('catalog')}
              >
                Browse Scholarships Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myApplications.map((app) => (
                <article
                  key={app.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '1.4rem 1.6rem',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: '#334155'
                        }}
                      >
                        Ref: {app.id}
                      </span>
                      <span
                        className={`sch-status-pill ${
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
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#0f172a' }}>
                      {app.schemeName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span>Applicant: <strong>{app.studentName}</strong> ({app.studentId})</span>
                      <span>·</span>
                      <span>Program: <strong>{app.dept}</strong></span>
                      <span>·</span>
                      <span>Sanctioned Grant: <strong style={{ color: '#059669' }}>₹{(app.finalAwardAmount || app.recommendedAmount || 0).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>

                  {/* Visual 4-Step Verification Timeline */}
                  <div className="sch-flow-stepper">
                    <div className="sch-flow-node completed">
                      <span className="sch-flow-circle">✓</span>
                      <span>Submitted</span>
                    </div>

                    <div className={`sch-flow-node ${app.verificationStatus === 'Verified' ? 'completed' : 'active'}`}>
                      <span className="sch-flow-circle">{app.verificationStatus === 'Verified' ? '✓' : '2'}</span>
                      <span>{app.verificationStatus || 'Document Scrutiny'}</span>
                    </div>

                    <div className={`sch-flow-node ${app.reviewStatus === 'Approved' ? 'completed' : app.reviewStatus === 'Under Review' ? 'active' : ''}`}>
                      <span className="sch-flow-circle">{app.reviewStatus === 'Approved' ? '✓' : '3'}</span>
                      <span>Directorate Review</span>
                    </div>

                    <div className={`sch-flow-node ${app.disbursementStatus?.includes('Disbursed') ? 'completed' : ''}`}>
                      <span className="sch-flow-circle">4</span>
                      <span>{app.disbursementStatus || 'DBT Sanction'}</span>
                    </div>
                  </div>

                  {app.reviewerRemarks && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem 1.15rem',
                        fontSize: '0.84rem',
                        color: '#475569'
                      }}
                    >
                      <strong style={{ color: '#0f172a' }}>Directorate Notes: </strong>
                      {app.reviewerRemarks}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px dashed #e2e8f0',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Review Officer: <strong>{app.assignedReviewer || SCHOLARSHIP_OFFICER.name}</strong>
                    </span>

                    <button
                      type="button"
                      className="sch-btn-prospectus"
                      style={{ padding: '0.45rem 0.95rem' }}
                      onClick={() => window.print()}
                    >
                      <Printer size={14} />
                      <span>Print Submission Receipt</span>
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
          {/* ─── 4. REFINED SEARCH & CATEGORY FILTER BAR ───────────────────────── */}
          <section className="sch-filter-shell" aria-label="Search and Filter Scholarships">
            {/* Top Search Input */}
            <div className="sch-search-bar-row">
              <div className="sch-unified-search-input">
                <Search size={18} className="search-ico" />
                <input
                  type="text"
                  placeholder="Search by scholarship name, awarding body, keyword, or degree program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="sch-search-clear-btn"
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="sch-category-tabs-row">
              <button
                type="button"
                className={`sch-category-tab ${activeCategoryTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('all')}
              >
                All Opportunities ({schemes.length})
              </button>

              <button
                type="button"
                className={`sch-category-tab ${activeCategoryTab === 'govt' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('govt')}
              >
                🏛️ Government Statutory (DBT)
              </button>

              <button
                type="button"
                className={`sch-category-tab ${activeCategoryTab === 'inst' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('inst')}
              >
                🎓 Institutional Merit Fellowships
              </button>

              <button
                type="button"
                className={`sch-category-tab ${activeCategoryTab === 'need' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('need')}
              >
                🤝 Need-Based &amp; Welfare Aid
              </button>

              <button
                type="button"
                className={`sch-category-tab ${activeCategoryTab === 'csr' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('csr')}
              >
                🏢 Corporate CSR &amp; Alumni
              </button>

              <button
                type="button"
                className={`sch-category-tab ${activeCategoryTab === 'women' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('women')}
              >
                👩‍💻 Women in STEM
              </button>

              <button
                type="button"
                className={`sch-category-tab ${activeCategoryTab === 'pg' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('pg')}
              >
                🔬 Postgraduate &amp; GATE
              </button>
            </div>

            {/* Secondary Refinement Strip */}
            <div className="sch-secondary-filters-row">
              <div className="sch-filter-selects-group">
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Filter by:
                </span>

                <select
                  value={educationLevelFilter}
                  onChange={(e) => setEducationLevelFilter(e.target.value)}
                  className="sch-compact-select"
                >
                  <option value="All">All Degree Levels</option>
                  <option value="B.Tech">B.Tech (Undergraduate)</option>
                  <option value="M.Tech">M.Tech (Postgraduate)</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="Diploma">Diploma Engineering</option>
                </select>

                <select
                  value={cgpaRequirementFilter}
                  onChange={(e) => setCgpaRequirementFilter(e.target.value)}
                  className="sch-compact-select"
                >
                  <option value="All">All CGPA Requirements</option>
                  <option value="6.5">Minimum 6.5 CGPA</option>
                  <option value="7.0">Minimum 7.0 CGPA</option>
                  <option value="7.5">Minimum 7.5 CGPA</option>
                  <option value="8.0">Minimum 8.0 CGPA</option>
                  <option value="9.0">Distinction (≥ 9.0)</option>
                </select>
              </div>

              <div className="sch-filter-toggles-group">
                <button
                  type="button"
                  className={`sch-filter-toggle-pill ${onlyEligibleToggle ? 'active' : ''}`}
                  onClick={() => setOnlyEligibleToggle(!onlyEligibleToggle)}
                >
                  <Check size={13} />
                  <span>Only schemes I qualify for ({studentCgpa} CGPA)</span>
                </button>

                <button
                  type="button"
                  className={`sch-filter-toggle-pill ${onlySavedToggle ? 'active' : ''}`}
                  onClick={() => setOnlySavedToggle(!onlySavedToggle)}
                >
                  <Heart size={13} className={onlySavedToggle ? 'fill-current' : ''} />
                  <span>Saved Schemes ({savedSchemeIds.length})</span>
                </button>

                {(searchTerm ||
                  activeCategoryTab !== 'all' ||
                  educationLevelFilter !== 'All' ||
                  cgpaRequirementFilter !== 'All' ||
                  onlyEligibleToggle ||
                  onlySavedToggle) && (
                  <button
                    type="button"
                    className="sch-reset-link"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ─── 5. REFINED REALISTIC SCHOLARSHIP CARDS ────────────────────────── */}
          {filteredSchemes.length === 0 ? (
            <div className="sch-empty-dossier">
              <div className="sch-empty-crest">
                <AlertCircle size={24} />
              </div>
              <h3>No Scholarships Found</h3>
              <p>
                No active funding opportunities matched your current filter selection. Try selecting "All Opportunities" or clearing your CGPA criteria.
              </p>
              <button
                type="button"
                className="sch-btn-prospectus"
                style={{ width: 'auto', padding: '0.6rem 1.4rem' }}
                onClick={handleResetFilters}
              >
                Clear Active Filters
              </button>
            </div>
          ) : (
            <div className="sch-cards-stream">
              {filteredSchemes.map((scheme) => {
                const isBookmarked = savedSchemeIds.includes(scheme.id);
                const isApplied = myApplications.some((a) => a.schemeId === scheme.id);
                const meetsCgpa = !scheme.minCgpa || studentCgpa >= scheme.minCgpa;

                return (
                  <article key={scheme.id} className="sch-award-card">
                    <div>
                      {/* Card Header: Crest + Authority Name + Bookmark */}
                      <div className="sch-card-head">
                        <div className="sch-authority-info">
                          <AuthorityCrest type={scheme.type} provider={scheme.provider || scheme.sponsorName} />
                          <div className="sch-authority-copy">
                            <span className="sch-authority-name">
                              {scheme.provider || scheme.sponsorName}
                            </span>
                            <span className="sch-scheme-nature-tag">
                              {scheme.category || scheme.type}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`sch-heart-btn ${isBookmarked ? 'bookmarked' : ''}`}
                          onClick={(e) => handleToggleBookmark(e, scheme.id)}
                          title={isBookmarked ? 'Remove bookmark' : 'Save scholarship'}
                        >
                          <Heart size={18} />
                        </button>
                      </div>

                      {/* Card Main Body */}
                      <div className="sch-card-main" style={{ marginTop: '0.85rem' }}>
                        <h3 className="sch-card-title">{scheme.name}</h3>

                        <p className="sch-card-desc">{scheme.description}</p>

                        {/* Financial Grant Strip */}
                        <div className="sch-grant-strip">
                          <div>
                            <span className="sch-grant-amount">
                              ₹{scheme.awardAmount?.toLocaleString('en-IN') || '0'}
                            </span>
                            <span className="sch-grant-period">
                              {scheme.awardType?.includes('Month') ? '/ Month' : '/ Academic Year'}
                            </span>
                          </div>

                          <span className="sch-grant-type-pill">
                            {scheme.awardType || 'Direct Grant'}
                          </span>
                        </div>

                        {/* Natural Inline Criteria (No blocky 2x2 grid!) */}
                        <div className="sch-inline-criteria">
                          <span className="sch-crit-item">
                            🎓 {scheme.educationLevels?.slice(0, 2).join(', ') || 'All Degrees'}
                          </span>

                          <span className={`sch-crit-item ${meetsCgpa ? 'match' : ''}`}>
                            {meetsCgpa ? '✓ ' : ''}Min. {scheme.minCgpa || '6.0'} CGPA
                          </span>

                          <span className="sch-crit-item">
                            {scheme.incomeCeiling
                              ? `Income ≤ ₹${(scheme.incomeCeiling / 100000).toFixed(1)}L`
                              : 'No Income Cap'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer & Action Buttons */}
                    <div className="sch-card-bottom">
                      <div className="sch-deadline-status-line">
                        <div className="sch-deadline-date">
                          <Clock size={14} />
                          <span>Deadline: <strong>{scheme.closingDate}</strong></span>
                        </div>

                        <span
                          className={`sch-status-pill ${
                            isApplied
                              ? 'applied'
                              : scheme.status === 'Open'
                              ? 'open'
                              : scheme.status === 'Closing Soon'
                              ? 'closing-soon'
                              : 'closed'
                          }`}
                        >
                          {isApplied ? 'Application Submitted' : scheme.status}
                        </span>
                      </div>

                      <div className="sch-card-btn-duo">
                        <button
                          type="button"
                          className="sch-btn-prospectus"
                          onClick={() => handleOpenDetails(scheme)}
                        >
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          className={`sch-btn-apply-primary ${isApplied ? 'applied-state' : ''}`}
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

      {/* ─── 6. REFINED PROSPECTUS DETAILS MODAL ───────────────────────────────── */}
      {selectedSchemeForDetails && (
        <div
          className="sch-modal-backdrop"
          onClick={() => setSelectedSchemeForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sch-prospectus-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sch-prospectus-header">
              <div>
                <div className="sch-prospectus-authority-line">
                  <Building size={14} />
                  <span>{selectedSchemeForDetails.provider || selectedSchemeForDetails.sponsorName}</span>
                </div>
                <h2 className="sch-prospectus-title">{selectedSchemeForDetails.name}</h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`sch-heart-btn ${
                    savedSchemeIds.includes(selectedSchemeForDetails.id) ? 'bookmarked' : ''
                  }`}
                  onClick={(e) => handleToggleBookmark(e, selectedSchemeForDetails.id)}
                  title="Save scheme"
                >
                  <Heart size={20} />
                </button>
                <button
                  type="button"
                  className="sch-close-modal-x"
                  onClick={() => setSelectedSchemeForDetails(null)}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="sch-prospectus-body">
              {/* 4-Stat Strip */}
              <div className="sch-prospectus-stat-strip">
                <div className="sch-pstat-col">
                  <span className="sch-pstat-label">Grant Amount</span>
                  <span className="sch-pstat-value" style={{ color: '#2563eb' }}>
                    ₹{selectedSchemeForDetails.awardAmount?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="sch-pstat-col">
                  <span className="sch-pstat-label">Minimum CGPA</span>
                  <span className="sch-pstat-value">
                    ≥ {selectedSchemeForDetails.minCgpa || '6.0'}
                  </span>
                </div>

                <div className="sch-pstat-col">
                  <span className="sch-pstat-label">Income Ceiling</span>
                  <span className="sch-pstat-value">
                    {selectedSchemeForDetails.incomeCeiling
                      ? `≤ ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(1)}L`
                      : 'No Income Cap'}
                  </span>
                </div>

                <div className="sch-pstat-col">
                  <span className="sch-pstat-label">Deadline</span>
                  <span className="sch-pstat-value" style={{ color: '#d97706' }}>
                    {selectedSchemeForDetails.closingDate}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="sch-prospectus-tabs">
                <button
                  type="button"
                  className={`sch-prospectus-tab-btn ${detailTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setDetailTab('overview')}
                >
                  Overview &amp; Coverage
                </button>
                <button
                  type="button"
                  className={`sch-prospectus-tab-btn ${detailTab === 'eligibility' ? 'active' : ''}`}
                  onClick={() => setDetailTab('eligibility')}
                >
                  Eligibility Checklist
                </button>
                <button
                  type="button"
                  className={`sch-prospectus-tab-btn ${detailTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setDetailTab('documents')}
                >
                  Documents Needed
                </button>
                <button
                  type="button"
                  className={`sch-prospectus-tab-btn ${detailTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => setDetailTab('timeline')}
                >
                  Disbursement Process
                </button>
                <button
                  type="button"
                  className={`sch-prospectus-tab-btn ${detailTab === 'faqs' ? 'active' : ''}`}
                  onClick={() => setDetailTab('faqs')}
                >
                  FAQs &amp; Helpdesk
                </button>
              </div>

              {/* Tab 1: Overview & Coverage */}
              {detailTab === 'overview' && (
                <div className="sch-prospectus-pane">
                  <div>
                    <h4>Program Scope &amp; Purpose</h4>
                    <p>{selectedSchemeForDetails.description}</p>
                  </div>

                  <div>
                    <h4>Financial Coverage Breakdown</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(
                        selectedSchemeForDetails.benefits || [
                          'Direct tuition fee reimbursement credited to student bank account or institutional ledger.',
                          'Annual book and learning materials allowance.',
                          'Exemption from selected campus laboratory and examination fees.',
                          'Renewable throughout the normal program duration subject to academic progress.'
                        ]
                      ).map((item, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.65rem',
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            borderRadius: '8px',
                            padding: '0.65rem 0.85rem'
                          }}
                        >
                          <CheckCircle2 size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{item}</span>
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
                      <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Awarding Authority
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedSchemeForDetails.fundingSource}
                      </div>
                    </div>

                    {selectedSchemeForDetails.applicationUrl && (
                      <a
                        href={selectedSchemeForDetails.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sch-btn-prospectus"
                        style={{ padding: '0.45rem 0.85rem', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                        <span>Official Portal</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Eligibility Checklist */}
              {detailTab === 'eligibility' && (
                <div className="sch-prospectus-pane">
                  <h4>Mandatory Qualification Criteria</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem'
                      }}
                    >
                      <CheckCircle2 size={18} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Academic Performance: </strong>
                        Minimum CGPA of <strong>≥ {selectedSchemeForDetails.minCgpa || '6.0'}</strong> in preceding semester evaluations with zero standing backlogs.
                        <div style={{ fontSize: '0.78rem', color: studentCgpa >= (selectedSchemeForDetails.minCgpa || 6.0) ? '#059669' : '#dc2626', marginTop: '3px', fontWeight: 600 }}>
                          {studentCgpa >= (selectedSchemeForDetails.minCgpa || 6.0)
                            ? `✓ You qualify! Your current CGPA is ${studentCgpa}`
                            : `✕ Minimum required is ${selectedSchemeForDetails.minCgpa}, your current CGPA is ${studentCgpa}`}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem'
                      }}
                    >
                      <CheckCircle2 size={18} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Annual Family Income Limit: </strong>
                        {selectedSchemeForDetails.incomeCeiling
                          ? `Total annual gross income from all sources must not exceed ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(2)} Lakhs per annum.`
                          : 'No income ceiling applicable. Pure merit-based fellowship.'}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem'
                      }}
                    >
                      <CheckCircle2 size={18} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Eligible Programs &amp; Semesters: </strong>
                        Enrolled in regular full-time {selectedSchemeForDetails.educationLevels?.join(', ') || 'B.Tech/M.Tech'} · {selectedSchemeForDetails.eligibleSemesters?.join(', ') || 'All Semesters'}.
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem'
                      }}
                    >
                      <CheckCircle2 size={18} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Attendance Compliance: </strong>
                        Must have maintained at least 75% aggregate biometric class attendance during the term.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Documents Needed */}
              {detailTab === 'documents' && (
                <div className="sch-prospectus-pane">
                  <h4>Documents Required for Verification</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Please ensure clear scanned copies in PDF or JPG format (maximum 2MB per document) are ready:
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(selectedSchemeForDetails.requiredDocs || [
                      'Latest Tehsildar Certified Annual Income Certificate (FY 2026-27)',
                      'Autonomous Controller of Examinations Verified Grade Sheets',
                      'Active Savings Bank Account Passbook Copy with visible IFSC Code',
                      'Student Aadhaar Card and College Identity Card Copy',
                      'Permanent Resident / Domicile Certificate'
                    ]).map((doc, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          fontSize: '0.84rem'
                        }}
                      >
                        <FileCheck size={16} color="#2563eb" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tab 4: Timeline & Sanction */}
              {detailTab === 'timeline' && (
                <div className="sch-prospectus-pane">
                  <h4>Application &amp; Sanction Timeline</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {(
                      selectedSchemeForDetails.timeline || [
                        { step: 1, title: 'Step 1: Online Application', desc: 'Submit your profile disclosure and verified credentials online', date: selectedSchemeForDetails.openingDate + ' – ' + selectedSchemeForDetails.closingDate },
                        { step: 2, title: 'Step 2: Nodal Directorate Scrutiny', desc: 'Verification of marksheets and revenue certificates by College Welfare Directorate', date: 'Within 7 working days' },
                        { step: 3, title: 'Step 3: Executive Sanction', desc: 'Merit ranking validation and executive council approval', date: 'December 2026' },
                        { step: 4, title: 'Step 4: Fund Disbursement', desc: 'Direct Benefit Transfer (DBT) credit into Aadhaar-seeded bank account', date: 'January 2027' }
                      ]
                    ).map((t) => (
                      <div
                        key={t.step}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.85rem',
                          padding: '0.85rem 1rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px'
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#2563eb',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          {t.step}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{t.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>{t.desc}</div>
                          <div style={{ color: '#2563eb', fontSize: '0.76rem', fontWeight: 600, marginTop: '4px' }}>{t.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: FAQs & Helpdesk */}
              {detailTab === 'faqs' && (
                <div className="sch-prospectus-pane">
                  <h4>Frequently Asked Questions</h4>
                  <div className="sch-prospectus-faq-wrap">
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
                        <div key={idx} className="sch-prospectus-faq-item">
                          <button
                            type="button"
                            className="sch-prospectus-faq-q"
                            onClick={() => setExpandedFaqIndex(isExpanded ? -1 : idx)}
                          >
                            <span>{faq.q}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {isExpanded && <div className="sch-prospectus-faq-a">{faq.a}</div>}
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
                      <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                        Welfare Directorate Nodal Desk
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

            {/* Footer */}
            <div className="sch-prospectus-footer">
              <button
                type="button"
                className="sch-btn-prospectus"
                onClick={() => setSelectedSchemeForDetails(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="sch-btn-apply-primary"
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

      {/* ─── 7. REFINED APPLICATION WORKFLOW MODAL ─────────────────────────────── */}
      {applyingScheme && (
        <div
          className="sch-modal-backdrop"
          onClick={() => setApplyingScheme(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sch-prospectus-card" onClick={(e) => e.stopPropagation()}>
            <div className="sch-prospectus-header">
              <div>
                <div className="sch-prospectus-authority-line">
                  <span>Application Form · Academic Session 2026–2027</span>
                </div>
                <h2 className="sch-prospectus-title">{applyingScheme.name}</h2>
              </div>
              <button
                type="button"
                className="sch-close-modal-x"
                onClick={() => setApplyingScheme(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sch-prospectus-body">
              {/* Stepper */}
              {applyStep <= 4 && (
                <div className="sch-flow-stepper">
                  <div className={`sch-flow-node ${applyStep === 1 ? 'active' : applyStep > 1 ? 'completed' : ''}`}>
                    <span className="sch-flow-circle">{applyStep > 1 ? '✓' : '1'}</span>
                    <span>Student Dossier</span>
                  </div>

                  <div className={`sch-flow-node ${applyStep === 2 ? 'active' : applyStep > 2 ? 'completed' : ''}`}>
                    <span className="sch-flow-circle">{applyStep > 2 ? '✓' : '2'}</span>
                    <span>Income &amp; Bank</span>
                  </div>

                  <div className={`sch-flow-node ${applyStep === 3 ? 'active' : applyStep > 3 ? 'completed' : ''}`}>
                    <span className="sch-flow-circle">{applyStep > 3 ? '✓' : '3'}</span>
                    <span>Documents</span>
                  </div>

                  <div className={`sch-flow-node ${applyStep === 4 ? 'active' : ''}`}>
                    <span className="sch-flow-circle">4</span>
                    <span>Declaration</span>
                  </div>
                </div>
              )}

              {/* STEP 1: Student Dossier */}
              {applyStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Student Name</label>
                      <input
                        type="text"
                        value={applyFormData.fullName}
                        readOnly
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Roll Number</label>
                      <input
                        type="text"
                        value={applyFormData.rollNumber}
                        readOnly
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Department</label>
                      <input
                        type="text"
                        value={applyFormData.department}
                        readOnly
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Semester &amp; CGPA</label>
                      <input
                        type="text"
                        value={`${applyFormData.semester} · ${applyFormData.cgpa} CGPA`}
                        readOnly
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Social / Affirmative Category</label>
                    <input
                      type="text"
                      value={applyFormData.category}
                      onChange={(e) => setApplyFormData({ ...applyFormData, category: e.target.value })}
                      style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#0f172a' }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Income & Bank */}
              {applyStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Father's / Guardian's Full Name</label>
                      <input
                        type="text"
                        value={applyFormData.fatherName}
                        onChange={(e) => setApplyFormData({ ...applyFormData, fatherName: e.target.value })}
                        required
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Father's Occupation</label>
                      <input
                        type="text"
                        value={applyFormData.fatherOccupation}
                        onChange={(e) => setApplyFormData({ ...applyFormData, fatherOccupation: e.target.value })}
                        required
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Annual Family Income (INR)</label>
                      <input
                        type="number"
                        value={applyFormData.familyIncome}
                        onChange={(e) => setApplyFormData({ ...applyFormData, familyIncome: e.target.value })}
                        required
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Ration Card / BPL Number (Optional)</label>
                      <input
                        type="text"
                        value={applyFormData.rationCardNo}
                        onChange={(e) => setApplyFormData({ ...applyFormData, rationCardNo: e.target.value })}
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Aadhaar-Linked Savings Account Number</label>
                      <input
                        type="text"
                        value={applyFormData.bankAccount}
                        onChange={(e) => setApplyFormData({ ...applyFormData, bankAccount: e.target.value })}
                        required
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Bank IFSC Code</label>
                      <input
                        type="text"
                        value={applyFormData.bankIfsc}
                        onChange={(e) => setApplyFormData({ ...applyFormData, bankIfsc: e.target.value })}
                        required
                        style={{ padding: '0.55rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Supporting Documents */}
              {applyStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => showToast('Attached additional supporting document successfully!')}
                  >
                    <UploadCloud size={26} color="#2563eb" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                      Click to upload additional documents
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      PDF, JPG, or PNG (Max 2MB per file)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <FileCheck size={16} color="#059669" />
                        <span>Income Certificate (Revenue Authority FY 2026-27).pdf</span>
                      </div>
                      <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.76rem' }}>✓ Verified</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <FileCheck size={16} color="#059669" />
                        <span>Previous Semester Grade Marksheet (Autonomous Cell).pdf</span>
                      </div>
                      <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.76rem' }}>✓ Verified</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <FileCheck size={16} color="#059669" />
                        <span>Bank Passbook Copy (Aadhaar Seeded).jpg</span>
                      </div>
                      <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.76rem' }}>✓ Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Declaration */}
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
                      gap: '0.4rem',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                      Application Summary
                    </div>
                    <div>Scheme: <strong>{applyingScheme.name}</strong></div>
                    <div>Applicant: <strong>{applyFormData.fullName}</strong> ({applyFormData.rollNumber})</div>
                    <div>Program: <strong>{applyFormData.department}</strong> · CGPA: <strong>{applyFormData.cgpa}</strong></div>
                    <div>Declared Annual Income: <strong>₹{Number(applyFormData.familyIncome).toLocaleString('en-IN')}</strong></div>
                    <div>Disbursement Bank Account: <strong>{applyFormData.bankAccount}</strong> (IFSC: {applyFormData.bankIfsc})</div>
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
                      onChange={(e) => setApplyFormData({ ...applyFormData, agreedToTerms: e.target.checked })}
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.75rem 1rem', gap: '1rem' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle2 size={34} />
                  </div>

                  <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#0f172a' }}>
                      Application Successfully Submitted!
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, maxWidth: '480px' }}>
                      Your scholarship application has been transmitted to the Directorate of Student Welfare &amp; Financial Aid for document screening.
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      minWidth: '260px'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Application Reference ID
                    </span>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                      {submittedApplicationRef}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="sch-btn-prospectus"
                      onClick={() => window.print()}
                    >
                      <Printer size={15} />
                      <span>Download Submission Receipt</span>
                    </button>

                    <button
                      type="button"
                      className="sch-btn-apply-primary"
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
              <div className="sch-prospectus-footer">
                {applyStep > 1 && (
                  <button
                    type="button"
                    className="sch-btn-prospectus"
                    onClick={() => setApplyStep(applyStep - 1)}
                  >
                    Back
                  </button>
                )}

                {applyStep < 4 ? (
                  <button
                    type="button"
                    className="sch-btn-apply-primary"
                    onClick={() => setApplyStep(applyStep + 1)}
                  >
                    <span>Continue to Step {applyStep + 1}</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="sch-btn-apply-primary"
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
        <div className="sch-toast-alert" role="status" aria-live="polite">
          <CheckCircle2 size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
