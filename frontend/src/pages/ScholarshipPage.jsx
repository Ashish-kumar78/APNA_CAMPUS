import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  DollarSign,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  Home,
  Layers,
  Printer,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UploadCloud,
  Users,
  Building,
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

// Authority / Organization Crest & Logo helper
function AuthorityCrest({ type, provider = '', name = '' }) {
  const p = (provider + ' ' + name).toLowerCase();

  let crest = 'AC';
  let bg = '#5a2a8a'; // Institutional purple

  if (p.includes('odisha') || p.includes('prerana') || p.includes('medhabruti') || p.includes('sudakshya')) {
    crest = 'OD';
    bg = '#1a5276';
  } else if (p.includes('ministry of education') || p.includes('moe') || p.includes('national scholarship') || p.includes('nsp')) {
    crest = 'IN';
    bg = '#007DC6';
  } else if (p.includes('aicte') || p.includes('pragati')) {
    crest = 'AICTE';
    bg = '#005eb8';
  } else if (p.includes('tata')) {
    crest = 'TT';
    bg = '#1e3a8a';
  } else if (p.includes('infosys')) {
    crest = 'INF';
    bg = '#0284c7';
  } else if (p.includes('alumni')) {
    crest = 'ALM';
    bg = '#6D28D9';
  } else if (p.includes('need') || p.includes('hardship') || p.includes('waiver')) {
    crest = 'AC';
    bg = '#059669';
  }

  return (
    <div className="company-logo sch-logo" style={{ background: bg }} title={provider}>
      {crest}
    </div>
  );
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

  // Synchronize to localStorage
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

  // Current Main View: 'catalog' | 'my-applications'
  const [currentView, setCurrentView] = useState('catalog');

  // Active Tab: 'all' | 'govt' | 'inst' | 'need' | 'csr' | 'saved' | 'my-applications'
  const [activeTab, setActiveTab] = useState('all');

  // Search & Secondary Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [educationLevelFilter, setEducationLevelFilter] = useState('All');
  const [cgpaRequirementFilter, setCgpaRequirementFilter] = useState('All');
  const [onlyEligibleToggle, setOnlyEligibleToggle] = useState(false);
  const [onlySavedToggle, setOnlySavedToggle] = useState(false);

  // Modals State
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0);

  // Apply Wizard Modal State
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

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Student's Submitted Applications
  const myApplications = useMemo(() => {
    return applications.filter(
      (a) => a.studentId === studentRoll || a.studentName?.toLowerCase() === student.name?.toLowerCase()
    );
  }, [applications, studentRoll, student.name]);

  // Derived Metrics for Summary Strip
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
    ).length || (myApplications.length > 0 ? myApplications.length : 0);
  }, [myApplications]);

  const approvedCount = useMemo(() => {
    return myApplications.filter((a) => a.reviewStatus === 'Approved').length;
  }, [myApplications]);

  // Bookmark Toggle
  const handleToggleBookmark = (e, schemeId) => {
    e.stopPropagation();
    if (savedSchemeIds.includes(schemeId)) {
      setSavedSchemeIds(savedSchemeIds.filter((id) => id !== schemeId));
      showToast('Removed from saved scholarships.');
    } else {
      setSavedSchemeIds([...savedSchemeIds, schemeId]);
      showToast('Added to your saved scholarships bookmarks!');
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

      // Tab Filtering
      if (activeTab === 'govt' && s.type !== 'Government') return false;
      if (activeTab === 'inst' && s.type !== 'Institutional') return false;
      if (activeTab === 'need' && !s.category?.includes('Need') && s.type !== 'Need-Based') return false;
      if (activeTab === 'csr' && !s.type?.includes('Private') && !s.type?.includes('Sponsored') && !s.sponsorName?.includes('Tata') && !s.sponsorName?.includes('Infosys')) return false;
      if (activeTab === 'saved' && !savedSchemeIds.includes(s.id)) return false;

      // Degree Level Filter
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
    activeTab,
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
    setActiveTab('all');
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
      setActiveTab('my-applications');
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
      alert('Please check and confirm the mandatory declaration before submitting.');
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

  // Helper for Status Badge Class
  const getStatusBadge = (status, isApplied = false) => {
    if (isApplied) {
      return <span className="sch-badge sch-badge-applied"><Check size={11} /> Application Submitted</span>;
    }
    switch (status) {
      case 'Open':
        return <span className="sch-badge sch-badge-open">Open for Applications</span>;
      case 'Closing Soon':
        return <span className="sch-badge sch-badge-closing">Closing Soon</span>;
      case 'Approved':
        return <span className="sch-badge sch-badge-approved">Approved</span>;
      case 'Under Review':
        return <span className="sch-badge sch-badge-review">Under Review</span>;
      case 'Pending':
        return <span className="sch-badge sch-badge-pending">Pending Review</span>;
      case 'Rejected':
        return <span className="sch-badge sch-badge-rejected">Rejected</span>;
      case 'Closed':
        return <span className="sch-badge sch-badge-closed">Applications Closed</span>;
      default:
        return <span className="sch-badge sch-badge-open">{status || 'Active'}</span>;
    }
  };

  return (
    <div className="placement-page sch-page">
      {/* ─── 1. BREADCRUMB & PAGE HEADER (Placement Style) ───────────────────────── */}
      <div className="sch-breadcrumb">
        <Home size={12} />
        <span>Home</span>
        <span>/</span>
        <span>Campus</span>
        <span>/</span>
        <strong className="sch-breadcrumb-active">Scholarships &amp; Financial Aid</strong>
      </div>

      <div className="placement-header sch-header">
        <div>
          <p className="placement-kicker sch-kicker">
            <Award size={13} /> SCHOLARSHIPS &amp; FINANCIAL AID
          </p>
          <h2>Scholarships &amp; Financial Aid</h2>
          <p className="placement-caption">
            Discover institutional fellowships, government statutory aid (PRERANA, NSP), and corporate CSR endowments designed to support your education.
          </p>
        </div>

        <div className="sch-header-right">
          <div className="placement-eligibility sch-eligibility">
            <Check size={16} />
            <div>
              <strong>Scholarship Eligible</strong>
              <small>CGPA {studentCgpa} · All Requirements Met · Active</small>
            </div>
          </div>

          <div className="sch-header-cta-group">
            <button
              type="button"
              className={`sch-btn-header-cta ${currentView === 'catalog' && activeTab === 'all' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('catalog');
                setActiveTab('all');
              }}
            >
              <Compass size={14} />
              <span>Explore Scholarships</span>
            </button>

            <button
              type="button"
              className={`sch-btn-header-cta ${currentView === 'my-applications' || activeTab === 'my-applications' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('my-applications');
                setActiveTab('my-applications');
              }}
            >
              <Clock size={14} />
              <span>Track My Applications</span>
              {myApplications.length > 0 && (
                <span className="sch-header-badge-count">{myApplications.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. OFFICIAL SCHOLARSHIP BROADCAST CHANNEL BANNER ───────────────────── */}
      <div className="sch-broadcast-banner">
        <div className="sch-broadcast-left">
          <div className="sch-broadcast-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="sch-broadcast-title-row">
              <span className="sch-broadcast-tag">Active Cycle 2026–2027</span>
              <strong>📢 Featured Scholarship Opportunities &amp; Deadlines</strong>
            </div>
            <span className="sch-broadcast-sub">
              State &amp; Central statutory portal verification is active. PRERANA Post-Matric &amp; National Scholarship Portal (NSP) applications close on 30 Nov 2026.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sch-broadcast-btn"
          onClick={() => {
            setCurrentView('catalog');
            setActiveTab('govt');
            showToast('Showing state and central government scholarship schemes.');
          }}
        >
          Explore Opportunities <ChevronRight size={13} />
        </button>
      </div>

      {/* ─── 3. COLORFUL OVERVIEW SUMMARY METRICS ROW ───────────────────────────── */}
      <div className="sch-summary-grid">
        {/* Card 1: Available */}
        <div
          className={`sch-summary-card sch-summary-blue ${activeTab === 'all' && currentView === 'catalog' ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('catalog');
            handleResetFilters();
          }}
          title="Click to view all available scholarships"
        >
          <div className="sch-summary-icon-box">
            <Layers size={18} />
          </div>
          <div className="sch-summary-info">
            <strong>{availableCount} Schemes</strong>
            <small>Available Scholarships</small>
          </div>
        </div>

        {/* Card 2: Eligible */}
        <div
          className={`sch-summary-card sch-summary-emerald ${onlyEligibleToggle ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('catalog');
            setOnlyEligibleToggle(!onlyEligibleToggle);
          }}
          title="Click to filter scholarships you qualify for"
        >
          <div className="sch-summary-icon-box">
            <CheckCircle2 size={18} />
          </div>
          <div className="sch-summary-info">
            <strong>{eligibleCount} Schemes</strong>
            <small>Eligible for {studentCgpa} CGPA</small>
          </div>
        </div>

        {/* Card 3: Submitted */}
        <div
          className={`sch-summary-card sch-summary-purple ${currentView === 'my-applications' ? 'active-filter' : ''}`}
          onClick={() => {
            setCurrentView('my-applications');
            setActiveTab('my-applications');
          }}
          title="Click to view your submitted applications"
        >
          <div className="sch-summary-icon-box">
            <Send size={18} />
          </div>
          <div className="sch-summary-info">
            <strong>{myApplications.length} Dossiers</strong>
            <small>Applications Submitted</small>
          </div>
        </div>

        {/* Card 4: Under Review */}
        <div
          className="sch-summary-card sch-summary-amber"
          onClick={() => {
            setCurrentView('my-applications');
            setActiveTab('my-applications');
          }}
          title="Applications in verification pipeline"
        >
          <div className="sch-summary-icon-box">
            <Clock size={18} />
          </div>
          <div className="sch-summary-info">
            <strong>{inReviewCount} Active</strong>
            <small>Applications Under Review</small>
          </div>
        </div>

        {/* Card 5: Award Pool */}
        <div
          className="sch-summary-card sch-summary-indigo"
          onClick={() => {
            setCurrentView('catalog');
            showToast('Direct Benefit Transfer pool for Academic Session 2026–2027.');
          }}
          title="Total Aid Allocated"
        >
          <div className="sch-summary-icon-box">
            <Award size={18} />
          </div>
          <div className="sch-summary-info">
            <strong>₹2.8 Cr+</strong>
            <small>Direct DBT Aid Pool</small>
          </div>
        </div>
      </div>

      {/* ─── 4. MODERN PLACEMENT-STYLE TABS ─────────────────────────────────────── */}
      <div className="placement-tabs sch-tabs" role="tablist">
        {[
          { key: 'all', label: `All Scholarships (${schemes.length})` },
          { key: 'govt', label: '🏛️ Government Schemes' },
          { key: 'inst', label: '🎓 Institutional Merit' },
          { key: 'need', label: '🤝 Need-Based Aid' },
          { key: 'csr', label: '🏢 Corporate CSR & Alumni' },
          { key: 'my-applications', label: `📋 My Applications (${myApplications.length})` },
          { key: 'saved', label: `❤️ Saved (${savedSchemeIds.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={(currentView === 'my-applications' && key === 'my-applications') || (currentView === 'catalog' && activeTab === key) ? 'active' : ''}
            role="tab"
            onClick={() => {
              if (key === 'my-applications') {
                setCurrentView('my-applications');
                setActiveTab('my-applications');
              } else {
                setCurrentView('catalog');
                setActiveTab(key);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── VIEW 1: MY APPLICATIONS TRACKER ───────────────────────────────────── */}
      {currentView === 'my-applications' || activeTab === 'my-applications' ? (
        <div className="sch-tracker-section">
          <div className="sch-tracker-head">
            <div>
              <h3>Submitted Applications &amp; Verification Tracker</h3>
              <p>Track your student dossier scrutiny, committee sanction, and Direct Benefit Transfer (DBT) disbursement status.</p>
            </div>
            <button
              type="button"
              className="sch-btn-secondary"
              onClick={() => {
                setCurrentView('catalog');
                setActiveTab('all');
              }}
            >
              Browse Catalog <ChevronRight size={13} />
            </button>
          </div>

          {myApplications.length === 0 ? (
            <div className="sch-empty-state">
              <div className="sch-empty-icon">
                <FileText size={28} />
              </div>
              <h4>No Applications on Record</h4>
              <p>You haven't submitted any scholarship applications for Academic Session 2026–2027 yet. Explore available schemes and apply before deadlines.</p>
              <button
                type="button"
                className="company-register-btn"
                style={{ margin: '12px auto 0' }}
                onClick={() => {
                  setCurrentView('catalog');
                  setActiveTab('all');
                }}
              >
                Explore Available Scholarships <ChevronRight size={13} />
              </button>
            </div>
          ) : (
            <div className="placement-drive-list sch-drive-list">
              {myApplications.map((app) => (
                <div key={app.id} className="company-card sch-app-card">
                  <AuthorityCrest provider={app.schemeName} name={app.schemeName} />

                  <div className="company-body sch-card-body">
                    <div className="sch-app-card-title-line">
                      <span className="sch-app-ref-tag">Ref: {app.id}</span>
                      <h3>{app.schemeName}</h3>
                      {getStatusBadge(app.reviewStatus)}
                    </div>

                    <div className="company-meta sch-card-meta">
                      <span><User size={11} />Applicant: <strong>{app.studentName}</strong></span>
                      <span><DollarSign size={11} />Sanctioned: <strong style={{ color: '#059669' }}>₹{(app.finalAwardAmount || app.recommendedAmount || 0).toLocaleString('en-IN')}</strong></span>
                      <span><Calendar size={11} />Submitted: <strong>{app.submissionDate}</strong></span>
                      <span><Clock size={11} />Stage: <strong>{app.approvalStage || 'Scrutiny'}</strong></span>
                    </div>

                    {/* Visual 4-Step Verification Stepper */}
                    <div className="sch-stepper-strip">
                      <div className="sch-stepper-step completed">
                        <span className="sch-step-bullet">✓</span>
                        <span className="sch-step-label">Submitted</span>
                      </div>
                      <div className="sch-step-line completed" />
                      <div className={`sch-stepper-step ${app.verificationStatus === 'Verified' ? 'completed' : 'active'}`}>
                        <span className="sch-step-bullet">{app.verificationStatus === 'Verified' ? '✓' : '2'}</span>
                        <span className="sch-step-label">{app.verificationStatus || 'Document Scrutiny'}</span>
                      </div>
                      <div className="sch-step-line" />
                      <div className={`sch-stepper-step ${app.reviewStatus === 'Approved' ? 'completed' : app.reviewStatus === 'Under Review' ? 'active' : ''}`}>
                        <span className="sch-step-bullet">{app.reviewStatus === 'Approved' ? '✓' : '3'}</span>
                        <span className="sch-step-label">Directorate Review</span>
                      </div>
                      <div className="sch-step-line" />
                      <div className={`sch-stepper-step ${app.disbursementStatus?.includes('Disbursed') ? 'completed' : ''}`}>
                        <span className="sch-step-bullet">4</span>
                        <span className="sch-step-label">{app.disbursementStatus || 'DBT Sanction'}</span>
                      </div>
                    </div>

                    {app.reviewerRemarks && (
                      <div className="sch-app-remarks">
                        <strong>Directorate Notes:</strong> {app.reviewerRemarks}
                      </div>
                    )}
                  </div>

                  <div className="company-action sch-card-action">
                    <button
                      type="button"
                      className="sch-btn-receipt"
                      onClick={() => window.print()}
                      title="Download official receipt"
                    >
                      <Printer size={13} /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─── VIEW 2: SCHOLARSHIPS CATALOG ───────────────────────────────────── */
        <div className="sch-catalog-section">
          {/* Search and Secondary Filter Controls Strip */}
          <div className="sch-filter-strip">
            <div className="sch-search-input-wrap">
              <Search size={14} className="sch-search-ico" />
              <input
                type="text"
                placeholder="Search scholarships by scheme name, sponsor, category, or degree program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="sch-search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="sch-select-wrap">
              <GraduationCap size={13} />
              <select
                value={educationLevelFilter}
                onChange={(e) => setEducationLevelFilter(e.target.value)}
              >
                <option value="All">All Degree Levels</option>
                <option value="B.Tech">B.Tech (Undergraduate)</option>
                <option value="M.Tech">M.Tech (Postgraduate)</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="Diploma">Diploma Engineering</option>
              </select>
            </div>

            <div className="sch-select-wrap">
              <Target size={13} />
              <select
                value={cgpaRequirementFilter}
                onChange={(e) => setCgpaRequirementFilter(e.target.value)}
              >
                <option value="All">All CGPA Requirements</option>
                <option value="6.5">Minimum 6.5 CGPA</option>
                <option value="7.0">Minimum 7.0 CGPA</option>
                <option value="7.5">Minimum 7.5 CGPA</option>
                <option value="8.0">Minimum 8.0 CGPA</option>
                <option value="9.0">Distinction (≥ 9.0)</option>
              </select>
            </div>

            <button
              type="button"
              className={`sch-filter-pill-btn ${onlyEligibleToggle ? 'active' : ''}`}
              onClick={() => setOnlyEligibleToggle(!onlyEligibleToggle)}
            >
              <Check size={12} />
              <span>Eligible for my {studentCgpa} CGPA</span>
            </button>

            <button
              type="button"
              className={`sch-filter-pill-btn ${onlySavedToggle ? 'active' : ''}`}
              onClick={() => setOnlySavedToggle(!onlySavedToggle)}
            >
              <Heart size={12} className={onlySavedToggle ? 'fill-current' : ''} />
              <span>Saved ({savedSchemeIds.length})</span>
            </button>

            {(searchTerm ||
              activeTab !== 'all' ||
              educationLevelFilter !== 'All' ||
              cgpaRequirementFilter !== 'All' ||
              onlyEligibleToggle ||
              onlySavedToggle) && (
              <button
                type="button"
                className="sch-btn-reset-filters"
                onClick={handleResetFilters}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Scheme Listings Stream */}
          {filteredSchemes.length === 0 ? (
            <div className="sch-empty-state">
              <div className="sch-empty-icon">
                <Filter size={28} />
              </div>
              <h4>No Scholarships Match Your Filter</h4>
              <p>We couldn't find any scholarships matching your active search and filter combination. Try resetting your criteria.</p>
              <button
                type="button"
                className="company-register-btn"
                style={{ margin: '12px auto 0' }}
                onClick={handleResetFilters}
              >
                Clear All Filters <RotateCcw size={13} />
              </button>
            </div>
          ) : (
            <div className="placement-drive-list sch-drive-list">
              {filteredSchemes.map((scheme) => {
                const isBookmarked = savedSchemeIds.includes(scheme.id);
                const isApplied = myApplications.some((a) => a.schemeId === scheme.id);
                const meetsCgpa = !scheme.minCgpa || studentCgpa >= scheme.minCgpa;

                return (
                  <div key={scheme.id} className="company-card sch-card">
                    {/* Left: Crest Avatar */}
                    <AuthorityCrest
                      type={scheme.type}
                      provider={scheme.provider || scheme.sponsorName}
                      name={scheme.name}
                    />

                    {/* Center: Main Info & Metadata */}
                    <div className="company-body sch-card-body">
                      <div className="sch-card-head-line">
                        <h3>{scheme.name}</h3>
                        <span className="sch-card-provider-pill">
                          {scheme.provider || scheme.sponsorName}
                        </span>
                      </div>

                      <p className="sch-card-desc">{scheme.description}</p>

                      <div className="company-meta sch-card-meta">
                        <span className="sch-meta-amount">
                          <DollarSign size={11} />
                          <strong>₹{scheme.awardAmount?.toLocaleString('en-IN') || '0'}</strong> {scheme.awardType?.includes('Month') ? '/ Month' : '/ Year'}
                        </span>

                        <span>
                          <GraduationCap size={11} />
                          {scheme.educationLevels?.slice(0, 2).join(', ') || 'All Degrees'}
                        </span>

                        <span className={meetsCgpa ? 'sch-meta-eligible' : ''}>
                          <Target size={11} />
                          {meetsCgpa ? '✓ ' : ''}Min CGPA: {scheme.minCgpa || '6.0'}
                        </span>

                        <span>
                          <Calendar size={11} />
                          Deadline: <strong>{scheme.closingDate}</strong>
                        </span>

                        {scheme.incomeCeiling ? (
                          <span>
                            <Building size={11} />
                            Income ≤ ₹{(scheme.incomeCeiling / 100000).toFixed(1)}L
                          </span>
                        ) : (
                          <span>
                            <Award size={11} />
                            {scheme.category || scheme.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Badges & Action Buttons */}
                    <div className="company-action sch-card-action">
                      <div className="sch-card-action-top">
                        {getStatusBadge(scheme.status, isApplied)}

                        <button
                          type="button"
                          className={`sch-heart-btn ${isBookmarked ? 'active' : ''}`}
                          onClick={(e) => handleToggleBookmark(e, scheme.id)}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark scholarship'}
                        >
                          <Heart size={14} className={isBookmarked ? 'fill-current' : ''} />
                        </button>
                      </div>

                      <div className="sch-card-action-buttons">
                        <button
                          type="button"
                          className="sch-btn-details"
                          onClick={() => handleOpenDetails(scheme)}
                        >
                          View Details
                        </button>

                        {isApplied ? (
                          <button
                            type="button"
                            className="sch-btn-applied-pill"
                            onClick={() => {
                              setCurrentView('my-applications');
                              setActiveTab('my-applications');
                            }}
                          >
                            <Check size={12} /> Applied
                          </button>
                        ) : scheme.status === 'Closed' ? (
                          <span className="sch-btn-closed-pill">
                            Closed
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="company-register-btn sch-btn-apply-now"
                            onClick={() => handleOpenApplyModal(scheme)}
                          >
                            Apply Now <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. REFINED PROSPECTUS DETAILS MODAL ───────────────────────────────── */}
      {selectedSchemeForDetails && (
        <div
          className="sch-modal-backdrop"
          onClick={() => setSelectedSchemeForDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sch-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sch-modal-header">
              <div>
                <span className="sch-modal-kicker">
                  {selectedSchemeForDetails.provider || selectedSchemeForDetails.sponsorName}
                </span>
                <h2>{selectedSchemeForDetails.name}</h2>
              </div>

              <div className="sch-modal-actions-right">
                <button
                  type="button"
                  className={`sch-heart-btn ${savedSchemeIds.includes(selectedSchemeForDetails.id) ? 'active' : ''}`}
                  onClick={(e) => handleToggleBookmark(e, selectedSchemeForDetails.id)}
                  title="Bookmark scheme"
                >
                  <Heart size={16} className={savedSchemeIds.includes(selectedSchemeForDetails.id) ? 'fill-current' : ''} />
                </button>
                <button
                  type="button"
                  className="sch-modal-close-x"
                  onClick={() => setSelectedSchemeForDetails(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="sch-modal-body">
              {/* 4-Stat Strip */}
              <div className="placement-stats-strip sch-modal-stats-strip">
                <div>
                  <strong style={{ color: '#2563EB' }}>
                    ₹{selectedSchemeForDetails.awardAmount?.toLocaleString('en-IN')}
                  </strong>
                  <small>Grant Amount ({selectedSchemeForDetails.awardType?.includes('Month') ? 'Monthly' : 'Per Year'})</small>
                </div>
                <div>
                  <strong>≥ {selectedSchemeForDetails.minCgpa || '6.0'}</strong>
                  <small>Minimum CGPA</small>
                </div>
                <div>
                  <strong>
                    {selectedSchemeForDetails.incomeCeiling
                      ? `≤ ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(1)}L`
                      : 'No Income Cap'}
                  </strong>
                  <small>Annual Family Income</small>
                </div>
                <div>
                  <strong style={{ color: '#d97706' }}>
                    {selectedSchemeForDetails.closingDate}
                  </strong>
                  <small>Application Deadline</small>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="placement-tabs sch-modal-tabs">
                {[
                  { key: 'overview', label: 'Overview & Coverage' },
                  { key: 'eligibility', label: 'Eligibility Checklist' },
                  { key: 'documents', label: 'Required Documents' },
                  { key: 'timeline', label: 'Disbursement Process' },
                  { key: 'faqs', label: 'FAQs & Helpdesk' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={detailTab === key ? 'active' : ''}
                    onClick={() => setDetailTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab: Overview */}
              {detailTab === 'overview' && (
                <div className="sch-modal-tab-content">
                  <div>
                    <h4>Program Scope &amp; Purpose</h4>
                    <p>{selectedSchemeForDetails.description}</p>
                  </div>

                  <div>
                    <h4>Financial Coverage Breakdown</h4>
                    <ul className="sch-benefits-list">
                      {(
                        selectedSchemeForDetails.benefits || [
                          'Direct tuition fee reimbursement credited to student bank account or institutional ledger.',
                          'Annual book and learning materials allowance included in grant.',
                          'Exemption from selected campus laboratory and examination fees.',
                          'Renewable throughout the normal program duration subject to academic progress.'
                        ]
                      ).map((item, idx) => (
                        <li key={idx}>
                          <CheckCircle2 size={15} color="#059669" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="sch-awarding-authority-box">
                    <div>
                      <small>Awarding Authority</small>
                      <strong>{selectedSchemeForDetails.fundingSource || selectedSchemeForDetails.provider}</strong>
                    </div>

                    {selectedSchemeForDetails.applicationUrl && (
                      <a
                        href={selectedSchemeForDetails.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sch-btn-official"
                      >
                        <ExternalLink size={13} />
                        <span>Official Portal</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Eligibility */}
              {detailTab === 'eligibility' && (
                <div className="sch-modal-tab-content">
                  <h4>Mandatory Qualification Criteria</h4>
                  <div className="sch-checklist-stack">
                    <div className="sch-check-item">
                      <CheckCircle2 size={16} color="#059669" />
                      <div>
                        <strong>Academic Performance: </strong>
                        Minimum CGPA of <strong>≥ {selectedSchemeForDetails.minCgpa || '6.0'}</strong> in preceding semester evaluations with zero standing backlogs.
                        <div className={`sch-inline-eval ${studentCgpa >= (selectedSchemeForDetails.minCgpa || 6.0) ? 'pass' : 'fail'}`}>
                          {studentCgpa >= (selectedSchemeForDetails.minCgpa || 6.0)
                            ? `✓ You qualify! Your current CGPA is ${studentCgpa}`
                            : `✕ Minimum required is ${selectedSchemeForDetails.minCgpa}, your current CGPA is ${studentCgpa}`}
                        </div>
                      </div>
                    </div>

                    <div className="sch-check-item">
                      <CheckCircle2 size={16} color="#059669" />
                      <div>
                        <strong>Annual Family Income Limit: </strong>
                        {selectedSchemeForDetails.incomeCeiling
                          ? `Total annual gross income from all sources must not exceed ₹${(selectedSchemeForDetails.incomeCeiling / 100000).toFixed(2)} Lakhs per annum.`
                          : 'No income ceiling applicable. Pure merit-based fellowship.'}
                      </div>
                    </div>

                    <div className="sch-check-item">
                      <CheckCircle2 size={16} color="#059669" />
                      <div>
                        <strong>Eligible Programs &amp; Semesters: </strong>
                        Enrolled in regular full-time {selectedSchemeForDetails.educationLevels?.join(', ') || 'B.Tech/M.Tech'} · {selectedSchemeForDetails.eligibleSemesters?.join(', ') || 'All Semesters'}.
                      </div>
                    </div>

                    <div className="sch-check-item">
                      <CheckCircle2 size={16} color="#059669" />
                      <div>
                        <strong>Attendance Compliance: </strong>
                        Must have maintained at least 75% aggregate biometric class attendance during the term.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Documents */}
              {detailTab === 'documents' && (
                <div className="sch-modal-tab-content">
                  <h4>Documents Required for Verification</h4>
                  <p className="sch-tab-sub">Please ensure clear scanned copies in PDF or JPG format (maximum 2MB per document) are ready:</p>
                  <ul className="sch-benefits-list">
                    {(selectedSchemeForDetails.requiredDocs || [
                      'Latest Tehsildar Certified Annual Income Certificate (FY 2026-27)',
                      'Autonomous Controller of Examinations Verified Grade Sheets',
                      'Active Savings Bank Account Passbook Copy with visible IFSC Code',
                      'Student Aadhaar Card and College Identity Card Copy',
                      'Permanent Resident / Domicile Certificate'
                    ]).map((doc, idx) => (
                      <li key={idx}>
                        <FileCheck size={15} color="#2563EB" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tab: Timeline */}
              {detailTab === 'timeline' && (
                <div className="sch-modal-tab-content">
                  <h4>Application &amp; Sanction Timeline</h4>
                  <div className="sch-timeline-stack">
                    {(
                      selectedSchemeForDetails.timeline || [
                        { step: 1, title: 'Step 1: Online Application', desc: 'Submit your profile disclosure and verified credentials online', date: selectedSchemeForDetails.openingDate + ' – ' + selectedSchemeForDetails.closingDate },
                        { step: 2, title: 'Step 2: Nodal Directorate Scrutiny', desc: 'Verification of marksheets and revenue certificates by College Welfare Directorate', date: 'Within 7 working days' },
                        { step: 3, title: 'Step 3: Executive Sanction', desc: 'Merit ranking validation and executive council approval', date: 'December 2026' },
                        { step: 4, title: 'Step 4: Fund Disbursement', desc: 'Direct Benefit Transfer (DBT) credit into Aadhaar-seeded bank account', date: 'January 2027' }
                      ]
                    ).map((t) => (
                      <div key={t.step} className="sch-timeline-row">
                        <div className="sch-timeline-step-badge">{t.step}</div>
                        <div>
                          <strong>{t.title}</strong>
                          <p>{t.desc}</p>
                          <small>{t.date}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: FAQs */}
              {detailTab === 'faqs' && (
                <div className="sch-modal-tab-content">
                  <h4>Frequently Asked Questions</h4>
                  <div className="sch-faq-stack">
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
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                          {isExpanded && <div className="sch-faq-answer">{faq.a}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Nodal Officer Contact Card */}
                  <div className="sch-officer-contact-box">
                    <div className="sch-officer-avatar">
                      <Users size={18} />
                    </div>
                    <div>
                      <small>Welfare Directorate Nodal Desk</small>
                      <strong>{SCHOLARSHIP_OFFICER.name} · {SCHOLARSHIP_OFFICER.designation}</strong>
                      <p>Email: {SCHOLARSHIP_OFFICER.email} · Phone: {SCHOLARSHIP_OFFICER.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sch-modal-footer">
              <button
                type="button"
                className="sch-btn-secondary"
                onClick={() => setSelectedSchemeForDetails(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="company-register-btn"
                disabled={selectedSchemeForDetails.status === 'Closed'}
                onClick={() => {
                  const scheme = selectedSchemeForDetails;
                  setSelectedSchemeForDetails(null);
                  handleOpenApplyModal(scheme);
                }}
              >
                Apply for Scholarship <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. MULTI-STEP APPLICATION WIZARD MODAL ─────────────────────────────── */}
      {applyingScheme && (
        <div
          className="sch-modal-backdrop"
          onClick={() => setApplyingScheme(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sch-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sch-modal-header">
              <div>
                <span className="sch-modal-kicker">Application Form · Academic Session 2026–2027</span>
                <h2>{applyingScheme.name}</h2>
              </div>
              <button
                type="button"
                className="sch-modal-close-x"
                onClick={() => setApplyingScheme(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sch-modal-body">
              {/* Stepper */}
              {applyStep <= 4 && (
                <div className="sch-stepper-strip" style={{ marginBottom: '16px' }}>
                  <div className={`sch-stepper-step ${applyStep === 1 ? 'active' : applyStep > 1 ? 'completed' : ''}`}>
                    <span className="sch-step-bullet">{applyStep > 1 ? '✓' : '1'}</span>
                    <span className="sch-step-label">Dossier</span>
                  </div>
                  <div className={`sch-step-line ${applyStep > 1 ? 'completed' : ''}`} />

                  <div className={`sch-stepper-step ${applyStep === 2 ? 'active' : applyStep > 2 ? 'completed' : ''}`}>
                    <span className="sch-step-bullet">{applyStep > 2 ? '✓' : '2'}</span>
                    <span className="sch-step-label">Income &amp; Bank</span>
                  </div>
                  <div className={`sch-step-line ${applyStep > 2 ? 'completed' : ''}`} />

                  <div className={`sch-stepper-step ${applyStep === 3 ? 'active' : applyStep > 3 ? 'completed' : ''}`}>
                    <span className="sch-step-bullet">{applyStep > 3 ? '✓' : '3'}</span>
                    <span className="sch-step-label">Documents</span>
                  </div>
                  <div className={`sch-step-line ${applyStep > 3 ? 'completed' : ''}`} />

                  <div className={`sch-stepper-step ${applyStep === 4 ? 'active' : ''}`}>
                    <span className="sch-step-bullet">4</span>
                    <span className="sch-step-label">Declaration</span>
                  </div>
                </div>
              )}

              {/* STEP 1: Student Dossier */}
              {applyStep === 1 && (
                <div className="sch-form-grid">
                  <div className="sch-form-field">
                    <label>Student Full Name</label>
                    <input type="text" value={applyFormData.fullName} readOnly />
                  </div>
                  <div className="sch-form-field">
                    <label>Registration / Roll Number</label>
                    <input type="text" value={applyFormData.rollNumber} readOnly />
                  </div>
                  <div className="sch-form-field">
                    <label>Department &amp; Program</label>
                    <input type="text" value={applyFormData.department} readOnly />
                  </div>
                  <div className="sch-form-field">
                    <label>Semester &amp; CGPA</label>
                    <input type="text" value={`${applyFormData.semester} · ${applyFormData.cgpa} CGPA`} readOnly />
                  </div>
                  <div className="sch-form-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Social / Reservation Category</label>
                    <input
                      type="text"
                      value={applyFormData.category}
                      onChange={(e) => setApplyFormData({ ...applyFormData, category: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Income & Bank */}
              {applyStep === 2 && (
                <div className="sch-form-grid">
                  <div className="sch-form-field">
                    <label>Father's / Guardian's Full Name</label>
                    <input
                      type="text"
                      value={applyFormData.fatherName}
                      onChange={(e) => setApplyFormData({ ...applyFormData, fatherName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sch-form-field">
                    <label>Father's Occupation</label>
                    <input
                      type="text"
                      value={applyFormData.fatherOccupation}
                      onChange={(e) => setApplyFormData({ ...applyFormData, fatherOccupation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sch-form-field">
                    <label>Annual Family Income (INR)</label>
                    <input
                      type="number"
                      value={applyFormData.familyIncome}
                      onChange={(e) => setApplyFormData({ ...applyFormData, familyIncome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sch-form-field">
                    <label>Ration Card / BPL Number (Optional)</label>
                    <input
                      type="text"
                      value={applyFormData.rationCardNo}
                      onChange={(e) => setApplyFormData({ ...applyFormData, rationCardNo: e.target.value })}
                    />
                  </div>
                  <div className="sch-form-field">
                    <label>Aadhaar-Linked Bank Account Number</label>
                    <input
                      type="text"
                      value={applyFormData.bankAccount}
                      onChange={(e) => setApplyFormData({ ...applyFormData, bankAccount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sch-form-field">
                    <label>Bank IFSC Code</label>
                    <input
                      type="text"
                      value={applyFormData.bankIfsc}
                      onChange={(e) => setApplyFormData({ ...applyFormData, bankIfsc: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Documents Checklist */}
              {applyStep === 3 && (
                <div className="sch-upload-container">
                  <div
                    className="sch-dropzone"
                    onClick={() => showToast('Attached additional supporting document successfully!')}
                  >
                    <UploadCloud size={24} color="#2563EB" />
                    <strong>Click to attach additional supporting documents</strong>
                    <small>PDF or JPG format (Max 2MB per file)</small>
                  </div>

                  <div className="sch-doc-list">
                    <div className="sch-doc-item">
                      <div className="sch-doc-name">
                        <FileCheck size={15} color="#059669" />
                        <span>Income Certificate (Revenue Authority FY 2026-27).pdf</span>
                      </div>
                      <span className="sch-doc-tag">✓ Verified</span>
                    </div>

                    <div className="sch-doc-item">
                      <div className="sch-doc-name">
                        <FileCheck size={15} color="#059669" />
                        <span>Previous Semester Grade Marksheet (Autonomous Cell).pdf</span>
                      </div>
                      <span className="sch-doc-tag">✓ Verified</span>
                    </div>

                    <div className="sch-doc-item">
                      <div className="sch-doc-name">
                        <FileCheck size={15} color="#059669" />
                        <span>Bank Passbook Copy (Aadhaar Seeded).jpg</span>
                      </div>
                      <span className="sch-doc-tag">✓ Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Declaration */}
              {applyStep === 4 && (
                <div className="sch-declaration-box">
                  <div className="sch-summary-preview">
                    <strong>Application Dossier Summary</strong>
                    <p>Scheme: <strong>{applyingScheme.name}</strong></p>
                    <p>Applicant: <strong>{applyFormData.fullName}</strong> ({applyFormData.rollNumber})</p>
                    <p>Program: <strong>{applyFormData.department}</strong> · CGPA: <strong>{applyFormData.cgpa}</strong></p>
                    <p>Annual Income: <strong>₹{Number(applyFormData.familyIncome).toLocaleString('en-IN')}</strong></p>
                    <p>DBT Account: <strong>{applyFormData.bankAccount}</strong> (IFSC: {applyFormData.bankIfsc})</p>
                  </div>

                  <label className="sch-affirmation-label">
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
                <div className="sch-success-view">
                  <div className="sch-success-icon">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3>Application Successfully Submitted!</h3>
                  <p>Your scholarship application has been transmitted to the Directorate of Student Welfare &amp; Financial Aid for document scrutiny.</p>

                  <div className="sch-ref-card">
                    <small>Official Reference ID</small>
                    <strong>{submittedApplicationRef}</strong>
                  </div>

                  <div className="sch-success-buttons">
                    <button
                      type="button"
                      className="sch-btn-secondary"
                      onClick={() => window.print()}
                    >
                      <Printer size={13} /> Print Submission Receipt
                    </button>

                    <button
                      type="button"
                      className="company-register-btn"
                      onClick={() => {
                        setApplyingScheme(null);
                        setCurrentView('my-applications');
                        setActiveTab('my-applications');
                      }}
                    >
                      Track in My Applications <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {applyStep <= 4 && (
              <div className="sch-modal-footer">
                {applyStep > 1 && (
                  <button
                    type="button"
                    className="sch-btn-secondary"
                    onClick={() => setApplyStep(applyStep - 1)}
                  >
                    Back
                  </button>
                )}

                {applyStep < 4 ? (
                  <button
                    type="button"
                    className="company-register-btn"
                    onClick={() => setApplyStep(applyStep + 1)}
                  >
                    Continue to Step {applyStep + 1} <ChevronRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="company-register-btn"
                    disabled={!applyFormData.agreedToTerms}
                    onClick={handleSubmitApplication}
                  >
                    Submit Official Application <ChevronRight size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 7. FLOATING TOAST ALERT ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="placement-register-msg sch-toast" role="alert">
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
