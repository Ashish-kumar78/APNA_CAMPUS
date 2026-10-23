import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  X,
  Building2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Award,
  Eye,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Megaphone,
  HelpCircle,
  Layers,
  CheckSquare,
  Square,
  FileCheck,
  FileSpreadsheet,
  AlertTriangle,
  Send,
  DollarSign,
  CreditCard,
  ChevronDown,
  Bell,
  UserRound,
  Zap,
  Info,
  SlidersHorizontal,
  Menu,
} from 'lucide-react';
import { api } from '../services/api.js';

export default function AdmissionsPortal({ account, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState(null);

  const [applicants, setApplicants] = useState([]);
  const [totalApplicantsCount, setTotalApplicantsCount] = useState(0);
  const [programmes, setProgrammes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [progFilter, setProgFilter] = useState('All');
  const [academicYearFilter, setAcademicYearFilter] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingApplicantId, setPendingApplicantId] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const loadSequence = useRef(0);

  // Selected applicant for Dossier Modal
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [dossierActiveTab, setDossierActiveTab] = useState('personal'); // personal, academic, documents, review, offer, fee, audit
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Document preview state
  const [previewDocument, setPreviewDocument] = useState(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isDeadlinesModalOpen, setIsDeadlinesModalOpen] = useState(false);
  const [isMeritModalOpen, setIsMeritModalOpen] = useState(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [enrolledStudentInfo, setEnrolledStudentInfo] = useState(null);

  // Form state for new applicant
  const [newApplicantForm, setNewApplicantForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    category: '',
    programmeId: '',
    academicYear: '',
    tenthMarks: '',
    twelfthMarks: '',
    entranceExam: '',
    entranceRank: '',
  });
  const [holidayView, setHolidayView] = useState('all');

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(currentTime);
  }, [currentTime]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'long',
      year: 'numeric',
    }).format(currentMonth);
  }, [currentMonth]);

  // Load backend data
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [statusFilter, progFilter, academicYearFilter, debouncedSearch]);

  async function loadData() {
    const sequence = ++loadSequence.current;
    setIsLoading(true);
    const results = await Promise.allSettled([
      api.getAdmissionStats(),
      api.getApplicants({ status: statusFilter, programmeId: progFilter, academicYear: academicYearFilter, search: debouncedSearch }),
      api.getProgrammes(),
      api.getAcademicYears(),
    ]);
    if (sequence !== loadSequence.current) return;
    const errors = [];
    const [statsRes, applicantsRes, progRes, yearsRes] = results;
    if (statsRes.status === 'fulfilled' && statsRes.value?.data) setStats(statsRes.value.data);
    else { setStats(null); errors.push('admission statistics'); }
    if (applicantsRes.status === 'fulfilled' && Array.isArray(applicantsRes.value?.data)) setApplicants(applicantsRes.value.data);
    else { setApplicants([]); errors.push('applicant records'); }
    if (progRes.status === 'fulfilled' && Array.isArray(progRes.value?.data)) setProgrammes(progRes.value.data.filter((p) => String(p.status).toLowerCase() === 'active'));
    else { setProgrammes([]); errors.push('active programmes'); }
    if (yearsRes.status === 'fulfilled' && Array.isArray(yearsRes.value?.data)) {
      const years = yearsRes.value.data;
      setAcademicYears(years);
      const currentYear = years.find((year) => year.isCurrent)?.year;
      if (currentYear) setFormData((previous) => previous.academicYear ? previous : { ...previous, academicYear: currentYear });
    } else { setAcademicYears([]); errors.push('academic years'); }
    setLoadError(errors.length ? `Could not load ${errors.join(', ')} from the backend.` : '');
    setIsLoading(false);
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  }

  async function handleRegisterApplicant(e) {
    e.preventDefault();
    if (!formData.programmeId || !academicYears.some((year) => year.year === formData.academicYear)) {
      setLoadError('Choose an active programme and an academic year configured in Academic Setup.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tenthMarks: formData.tenthMarks === '' ? undefined : Number(formData.tenthMarks),
        twelfthMarks: formData.twelfthMarks === '' ? undefined : Number(formData.twelfthMarks),
        entranceExam: formData.entranceExam || undefined,
        entranceRank: formData.entranceRank === '' ? undefined : Number(formData.entranceRank),
      };
      const res = await api.createApplicant(payload);
      if (res && res.success) {
        showToast(`Application ${res.data?.applicationNo || ''} saved.`);
        setIsRegisterModalOpen(false);
        setActiveView('applicants');
        setFormData({ name: '', email: '', phone: '', gender: '', dob: '', category: '', programmeId: '', academicYear: '', tenthMarks: '', twelfthMarks: '', entranceExam: '', entranceRank: '' });
        await loadData();
      } else {
        alert(res?.message || 'Failed to update document status.');
      }
    } catch (err) {
      alert(err?.message || 'Error creating application. Please check input details.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(id, name) {
    if (!window.confirm(`Confirm that ${name}'s admission eligibility was reviewed through your institution's approved process? This portal does not store uploaded documents.`)) return;
    setPendingApplicantId(id);
    try {
      const res = await api.confirmAdmissionFee(selectedApplicant.id, feeForm);
      if (res && res.success) {
        showToast(`Application ${res.data?.applicationNo || ''} marked verified.`);
        await loadData();
      }
    } catch (err) {
      alert(err?.message || 'Failed to verify applicant.');
    } finally {
      setPendingApplicantId('');
    }
  }

  async function handleApproveAndEnroll(id) {
    if (!window.confirm('Approve this admission and create the student and enrollment records?')) return;
    setPendingApplicantId(id);
    try {
      const res = await api.approveAndEnrollApplicant(selectedApplicant.id);
      if (res && res.success && res.data) {
        setEnrolledStudentInfo(res.data);
        showToast(`Student ${res.data.name} admitted successfully!`);
        await loadData();
      } else {
        alert(res?.message || 'Failed to finalize enrollment.');
      }
    } catch (err) {
      alert(err?.message || 'Enrollment transaction failed.');
    } finally {
      setPendingApplicantId('');
    }
  }

  async function handleReject(id, name) {
    const reason = window.prompt(`Enter the documented rejection reason for ${name}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert('A rejection reason is required.');
      return;
    }
    setPendingApplicantId(id);
    try {
      const res = await api.createAdmissionDeadline(deadlineForm);
      if (res && res.success) {
        showToast(`Applicant ${name} marked as REJECTED.`);
        await loadData();
      }
    } catch (err) {
      alert(err?.message || 'Failed to reject applicant.');
    } finally {
      setPendingApplicantId('');
    }
    const headers = [
      'Application No',
      'Name',
      'Email',
      'Phone',
      'Gender',
      'Category',
      'Programme',
      'Academic Year',
      '10th Marks (%)',
      '12th Marks (%)',
      'Merit Score',
      'Status',
      'Stage',
      'Fee Status',
      'Fee Paid',
      'Student ID',
      'Submission Date',
    ];

    const rows = applicants.map((a) => [
      `"${a.applicationNo || ''}"`,
      `"${a.name || ''}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.gender || ''}"`,
      `"${a.category || ''}"`,
      `"${a.programmeName || ''}"`,
      `"${a.academicYear || ''}"`,
      a.tenthMarks || '',
      a.twelfthMarks || '',
      a.meritScore || '',
      `"${a.status || ''}"`,
      `"${a.stage || ''}"`,
      `"${a.feeStatus || 'Pending'}"`,
      a.feePaid || 0,
      `"${a.studentId || ''}"`,
      `"${new Date(a.createdAt).toLocaleDateString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ApnaCampus_Admissions_Report_${academicYearFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Admissions CSV report downloaded.');
  }

  async function openApplicantDetails(id) {
    setDetailsLoading(true);
    setSelectedApplicant(null);
    try {
      const response = await api.getApplicantById(id);
      if (response?.success && response.data) setSelectedApplicant(response.data);
      else throw new Error(response?.message || 'Applicant details were not returned.');
    } catch (error) {
      alert(error?.message || 'Could not load applicant details.');
    } finally {
      setDetailsLoading(false);
    }
  }

  const filteredApplicants = applicants.filter((a) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return a.name?.toLowerCase().includes(q) || a.applicationNo?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.phone?.includes(q);
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {activeView === 'dashboard' ? (
        <>
          <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: 800 }}>Admissions &amp; Intake</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '.85rem' }}>Application records and decisions from the admissions backend.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#475569', fontSize: '.85rem' }}>{account?.name || account?.identifier || 'Signed-in account'}</span>
              <button type="button" onClick={onLogout} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '9px 13px', cursor: 'pointer' }}><LogOut size={15} /> Sign out</button>
            </div>
          </header>
          <main style={{ maxWidth: 1440, margin: '0 auto', padding: '28px' }}>
            {loadError && <div role="alert" style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c' }}>{loadError} <button type="button" onClick={loadData} style={{ marginLeft: 10 }}>Retry</button></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <div><h2 style={{ margin: 0, fontSize: '1.1rem' }}>Admissions pipeline</h2><p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '.82rem' }}>{isLoading ? 'Refreshing persisted records…' : 'Live counts from saved applicant records.'}</p></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setStatusFilter('All'); setProgFilter('All'); setAcademicYearFilter('All'); setActiveView('applicants'); }} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 9, cursor: 'pointer' }}>View applications</button>
                <button type="button" disabled={!programmes.length || !academicYears.length} onClick={() => setIsRegisterModalOpen(true)} style={{ padding: '10px 14px', border: 0, background: '#0284c7', color: '#fff', borderRadius: 9, fontWeight: 700, cursor: 'pointer', opacity: !programmes.length || !academicYears.length ? .5 : 1 }}><Plus size={15} /> Register applicant</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 22 }}>
              {[
                ['Total applications', stats?.total], ['Applied', stats?.applied], ['Verified', stats?.verified],
                ['Approved', stats?.approved], ['Enrolled', stats?.enrolled], ['Rejected', stats?.rejected],
              ].map(([label, value]) => <article key={label} style={{ padding: 18, border: '1px solid #e2e8f0', background: '#fff', borderRadius: 12 }}><div style={{ color: '#64748b', fontSize: '.78rem', fontWeight: 700 }}>{label}</div><div style={{ marginTop: 8, fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>{value ?? '—'}</div></article>)}
            </div>
            <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}><div><h3 style={{ margin: 0 }}>Recent applications</h3><p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '.8rem' }}>Latest records returned by the backend.</p></div><button type="button" onClick={() => setActiveView('applicants')} style={{ border: 0, color: '#0369a1', background: 'transparent', cursor: 'pointer' }}>Open register <ArrowRight size={14} /></button></div>
              {applicants.length ? <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '.84rem' }}><thead><tr style={{ background: '#f8fafc' }}>{['Application', 'Applicant', 'Programme', 'Academic year', 'Status'].map((heading) => <th key={heading} style={{ padding: '12px 16px', color: '#475569' }}>{heading}</th>)}</tr></thead><tbody>{applicants.slice(0, 5).map((app) => <tr key={app.id} style={{ borderTop: '1px solid #e2e8f0' }}><td style={{ padding: '13px 16px', fontFamily: 'monospace' }}>{app.applicationNo}</td><td style={{ padding: '13px 16px', fontWeight: 700 }}>{app.name}<div style={{ color: '#64748b', fontSize: '.75rem', fontWeight: 400 }}>{app.email}</div></td><td style={{ padding: '13px 16px' }}>{app.programme?.name || app.programmeName}</td><td style={{ padding: '13px 16px' }}>{app.academicYear}</td><td style={{ padding: '13px 16px' }}>{app.status}</td></tr>)}</tbody></table></div> : <div style={{ padding: 34, textAlign: 'center', color: '#64748b' }}>{isLoading ? 'Loading applications…' : 'No admission applications have been recorded yet.'}</div>}
            </section>
          </main>
        </>
      ) : (
        <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <Sparkles size={18} color="#ffffff" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <aside className="erp-sidebar">
          <MasterSidebarHeader
            roleTitle="ADMISSIONS CENTRAL"
            onToggle={() => setSidebarOpen(false)}
          />

        <nav className="erp-sidebar-nav">
          <div className="erp-nav-section-title" style={{ padding: '0.4rem 0.6rem 0.2rem', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Core Workflows
          </div>

          <button
            className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={18} />
            <span>Dashboard Overview</span>
            <span style={{ marginLeft: 'auto', background: '#3b82f6', color: '#fff', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>Live</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('All');
              setStageFilter('All');
              setActiveTab('applicants');
            }}
          >
            <Users size={18} />
            <span>Applications Directory</span>
            <span className="erp-nav-badge">{totalApplicantsCount}</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('DOCS_PENDING');
              setActiveTab('verification');
            }}
          >
            <CheckCircle2 size={18} />
            <span>Document Verification</span>
            {stats.documentsPending > 0 && (
              <span className="erp-nav-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                {stats.documentsPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            disabled={!programmes.length || !academicYears.length}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: programmes.length && academicYears.length ? 'pointer' : 'not-allowed',
              opacity: programmes.length && academicYears.length ? 1 : .55,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Award size={18} />
            <span>Review & Decisions</span>
            {stats.awaitingReview > 0 && (
              <span className="erp-nav-badge" style={{ background: '#8b5cf6', color: '#ffffff' }}>
                {stats.awaitingReview}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('OFFER_ISSUED');
              setActiveTab('offers');
            }}
          >
            <Send size={18} />
            <span>Offer Letters &amp; Acceptance</span>
            {stats.offersAwaitingAcceptance > 0 && (
              <span className="erp-nav-badge" style={{ background: '#0284c7', color: '#ffffff' }}>
                {stats.offersAwaitingAcceptance}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'fee' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('OFFER_ACCEPTED');
              setActiveTab('fee');
            }}
          >
            <CreditCard size={18} />
            <span>Fee Clearance & Ledger</span>
            {stats.feeConfirmed > 0 && (
              <span className="erp-nav-badge" style={{ background: '#10b981', color: '#ffffff' }}>
                {stats.feeConfirmed}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'enrollment' ? 'active' : ''}`}
            onClick={() => {
              setStageFilter('FEE_CONFIRMED');
              setActiveTab('enrollment');
            }}
          >
            <ShieldCheck size={18} />
            <span>Student Enrollment</span>
            {stats.enrolled > 0 && (
              <span className="erp-nav-badge" style={{ background: '#059669', color: '#ffffff' }}>
                {stats.enrolled}
              </span>
            )}
          </button>

          <div className="erp-nav-section-title" style={{ padding: '0.8rem 0.6rem 0.2rem', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Academic & Governance
          </div>

          <button
            className={`erp-nav-item ${activeTab === 'deadlines' ? 'active' : ''}`}
            onClick={() => setActiveTab('deadlines')}
          >
            <Calendar size={18} />
            <span>Deadlines & Milestones</span>
            {deadlines.length > 0 && (
              <span className="erp-nav-badge blue">{deadlines.length}</span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <Megaphone size={18} />
            <span>Circulars & Notices</span>
            {notices.length > 0 && (
              <span className="erp-nav-badge blue">{notices.length}</span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'merit' ? 'active' : ''}`}
            onClick={() => setActiveTab('merit')}
          >
            <SlidersHorizontal size={18} />
            <span>Merit List & Allocation</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileSpreadsheet size={18} />
            <span>Report Generation</span>
          </button>
        </nav>

        {/* Sidebar Footer with Quick CTA */}
        <div className="erp-sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <Plus size={16} /> New Application
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px' }}>
        {loadError && <div role="alert" style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c' }}>{loadError} <button type="button" onClick={loadData} style={{ marginLeft: 10 }}>Retry</button></div>}
        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Applications</span>
              <Users size={18} color="#0284c7" />
            </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>{stats?.total ?? '—'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>Persisted applications</div>
          </div>

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Eligibility Reviews</span>
              <CheckCircle2 size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '8px' }}>{stats?.verified ?? '—'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Eligibility reviews recorded</div>
          </div>

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Approved for Admission</span>
              <Award size={18} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '8px' }}>{stats?.approved ?? '—'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Awaiting student enrollment</div>
          </div>

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Enrolled & Provisioned</span>
              <ShieldCheck size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '8px' }}>{stats?.enrolled ?? '—'}</div>
            <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>Enrollment records created</div>
          </div>

            <div style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '5px 10px', borderRadius: '12px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              Cycle 2026–27
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', marginTop: '8px' }}>{stats?.conversionRate ?? '—'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Inquiry-to-enrollment</div>
          </div>
        </div>

            <div className="erp-role-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              <ShieldCheck size={14} /> Senior Admissions Officer
            </div>

            {onSwitchRole && (
              <button
                type="button"
                className="role-action-btn"
                onClick={() => onSwitchRole('student')}
                title="Switch Portal Role"
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value="All">All Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="VERIFIED">Verified</option>
                <option value="APPROVED">Approved</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Academic year:</span>
              <select value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}>
                <option value="All">All years</option>
                {academicYears.map((year) => <option key={year.id} value={year.year}>{year.year}{year.isCurrent ? ' (current)' : ''}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={15} color="#64748b" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Programme:</span>
              <select
                value={progFilter}
                onChange={(e) => setProgFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Applicant Records Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Applicant Master Register</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Showing {filteredApplicants.length} records from the selected backend filters
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>App Number</th>
                  <th style={{ padding: '12px 16px' }}>Applicant Name & Contact</th>
                  <th style={{ padding: '12px 16px' }}>Programme & Batch</th>
                  <th style={{ padding: '12px 16px' }}>Category &amp; Exam Scores</th>
                  <th style={{ padding: '12px 16px' }}>Stage Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      {isLoading ? 'Loading applicant records…' : loadError ? 'Applicant records could not be loaded. Use Retry above.' : 'No saved applicant records match these filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app) => {
                    const statusColors = {
                      APPLIED: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
                      VERIFIED: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
                      APPROVED: { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
                      ENROLLED: { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
                      REJECTED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
                    };
                    const badge = statusColors[app.status] || statusColors.APPLIED;

                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, fontFamily: 'monospace', color: '#0369a1' }}>
                          {app.applicationNo}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.email} · {app.phone}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{app.programme?.name || app.programmeName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Term: {app.academicYear}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 500 }}>{app.category} · {app.gender}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {[app.entranceExam, app.entranceRank != null ? `Rank ${app.entranceRank}` : null, app.tenthMarks != null ? `10th ${app.tenthMarks}%` : null, app.twelfthMarks != null ? `12th ${app.twelfthMarks}%` : null].filter(Boolean).join(' · ') || 'No examination scores recorded'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            View Student Dossier
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Finalize enrollment for ${app.name}? This will provision their official Student record and generate login credentials.`)) return;
                            const res = await api.approveAndEnrollApplicant(app.id);
                            if (res && res.success && res.data) {
                              setEnrolledStudentInfo(res.data);
                              showToast(`Student ${res.data.name} enrolled successfully! Student ID: ${res.data.studentId}`);
                              loadAllData();
                            } else {
                              alert(res?.message || 'Enrollment failed.');
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                          }}
                        >
                          <ShieldCheck size={16} /> Finalize &amp; Provision Student Account
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 8: DEDICATED ADMISSION DEADLINES & MILESTONES
            ========================================================== */}
        {activeTab === 'deadlines' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Academic Calendar &amp; Statutory Deadlines
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Milestones &amp; Deadlines
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Configure cut-off dates for online registration, document verification, seat withdrawal, and spot round counseling.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeadlinesModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  }}
                >
                  <Plus size={16} /> Add Admission Deadline
                </button>
              </div>
            </div>

            {/* Deadlines Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {deadlines.map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px' }}>
                        {d.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>
                        {d.deadlineDate}
                      </span>
                    </div>
                    <h3 style={{ margin: '10px 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {d.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      {d.description || 'Statutory intake milestone for all autonomous engineering streams.'}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '10px' }}>
                      Applicable: {d.programmeCode || 'All Programmes'} · Closing Time: {d.time || '05:00 PM'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Delete deadline "${d.title}"?`)) return;
                        await api.deleteAdmissionDeadline(d.id);
                        showToast('Deadline removed.');
                        loadAllData();
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Delete Milestone
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 9: DEDICATED CIRCULARS & NOTICES BOARD
            ========================================================== */}
        {activeTab === 'notices' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Official Circulars &amp; Public Bulletins
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Notices &amp; Announcements
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Publish official admission circulars, spot round rules, scholarship guidelines, and fee concession notifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                  }}
                >
                  <Plus size={16} /> Publish New Notice
                </button>
              </div>
            </div>

            {/* Notices List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {notices.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '20px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px' }}>
                        {n.tag || 'ADMISSION'}
                      </span>
                      {n.pinned && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef08a', color: '#854d0e', padding: '3px 8px', borderRadius: '4px' }}>
                          PINNED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Published: {n.date}</span>
                  </div>
                  <h3 style={{ margin: '10px 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {n.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                    {n.summary}
                  </p>
                  {n.content && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', borderLeft: '3px solid #2563eb' }}>
                      {n.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 10: DEDICATED MERIT LIST & SEAT ALLOCATION
            ========================================================== */}
        {activeTab === 'merit' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Autonomous Admissions Engine
                  </span>
                  <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    Merit List &amp; Seat Allocation Analysis
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Calculated composite ranking based on formula: (35% × 10th Marks) + (55% × 12th Science) + (Normalized Entrance Exam Rank Factor).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportAdmissionCSV}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={15} /> Export Official Merit CSV
                </button>
              </div>
            </div>

            {/* Merit Table */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Merit Rank</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Application No</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Candidate Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>10th Marks</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>12th Marks</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Entrance Exam</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Merit Score</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Seat Allotment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(meritList.length > 0 ? meritList : applicants
                      .map((a, idx) => ({ ...a, calcRank: idx + 1 }))
                      .sort((a, b) => (Number(b.meritScore) || 0) - (Number(a.meritScore) || 0)))
                      .map((app, index) => {
                        const rank = app.meritRank || index + 1;
                        return (
                          <tr key={app.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: rank <= 3 ? '#d97706' : '#0f172a' }}>
                              #{rank}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>{app.applicationNo}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                              {app.name}
                              {app.eligibilityStatus && (
                                <span style={{ marginLeft: '8px', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: app.eligibilityStatus === 'Eligible' ? '#dcfce7' : '#fef3c7', color: app.eligibilityStatus === 'Eligible' ? '#15803d' : '#b45309', fontWeight: 700 }}>
                                  {app.eligibilityStatus}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#334155' }}>{app.tenthMarks ? `${app.tenthMarks}%` : '—'}</td>
                            <td style={{ padding: '12px 14px', color: '#334155' }}>{app.twelfthMarks ? `${app.twelfthMarks}%` : '—'}</td>
                            <td style={{ padding: '12px 14px', color: '#64748b' }}>
                              {app.entranceExam || 'JEE'}: Rank {app.entranceRank || 'Direct'}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: '#2563eb' }}>
                              {app.meritScore || '—'} / 100
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                                {app.programmeName?.split(' ')[0] || 'B.Tech'} Regular Allotment
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================================
            VIEW 11: DEDICATED REPORT GENERATION & ANALYTICS
            ========================================================== */}
        {activeTab === 'reports' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Statutory &amp; Autonomous Admissions Auditing
                </span>
                <h2 style={{ margin: '4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  Admission Intelligence &amp; Report Generation
                </h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Generate regulatory AICTE &amp; State Higher Education compliance reports, admission pipeline funnels, and category reservation distribution manifests.
                </p>
              </div>

              {/* 3 Instant CSV Exports */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Admission Census Report</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    Complete list of all candidate applications with full contact, academic scores, and verification stages.
                  </div>
                  <button
                    type="button"
                    onClick={exportAdmissionCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      marginTop: '12px',
                    }}
                  >
                    <Download size={14} /> Download Census CSV
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Pipeline Funnel Conversion</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    Conversion drop-off across all 7 stages from registration to final university matriculation.
                  </div>
                  <button
                    type="button"
                    onClick={exportPipelineFunnelCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      marginTop: '12px',
                    }}
                  >
                    <Download size={14} /> Download Funnel CSV
                  </button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Category Quota Distribution</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    General, OBC, SC, ST, EWS quota breakdown and compliance with state statutory reservation norms.
                  </div>
                  <button
                    type="button"
                    onClick={exportCategoryDistributionCSV}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      marginTop: '12px',
                    }}
                  >
                    <Download size={14} /> Download Category CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Integrated Standard Report Generation Module */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <ReportGenerationModule account={account} role="admissions" />
            </div>
          </section>
        )}

        </div>
      </main>

      {/* ==========================================================
          MODALS ECOSYSTEM
          ========================================================== */}

      {/* 1. APPLICATION DOSSIER & WORKFLOW DETAILS MODAL */}
      {isDossierModalOpen && selectedApplicant && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{selectedApplicant.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                    {selectedApplicant.applicationNo}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                    Stage: {selectedApplicant.stage}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedApplicant.programmeName} · Session {selectedApplicant.academicYear} · Merit Score: {selectedApplicant.meritScore || '—'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDossierModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '0 20px', overflowX: 'auto' }}>
              {[
                { id: 'personal', label: '1. Personal Details' },
                { id: 'academic', label: '2. Academic Qualifications' },
                { id: 'documents', label: `3. Documents Verification (${(selectedApplicant.documents || []).length})` },
                { id: 'review', label: '4. Decision & Scrutiny' },
                { id: 'offer', label: '5. Offer Letter' },
                { id: 'fee', label: '6. Fee Confirmation' },
                { id: 'enroll', label: '7. Final Enrollment' },
                { id: 'audit', label: '8. Audit History' },
              ].map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setDossierActiveTab(tb.id)}
                  style={{
                    padding: '12px 16px',
                    fontWeight: dossierActiveTab === tb.id ? 800 : 600,
                    fontSize: '0.82rem',
                    background: dossierActiveTab === tb.id ? '#ffffff' : 'transparent',
                    color: dossierActiveTab === tb.id ? '#2563eb' : '#64748b',
                    border: 'none',
                    borderBottom: dossierActiveTab === tb.id ? '2px solid #2563eb' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* TAB 1: PERSONAL DETAILS */}
              {dossierActiveTab === 'personal' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Candidate Identity &amp; Contact Records
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <DetailRow label="Full Legal Name" value={selectedApplicant.name} />
                    <DetailRow label="Date of Birth" value={selectedApplicant.dob || '—'} />
                    <DetailRow label="Gender" value={selectedApplicant.gender} />
                    <DetailRow label="Reservation Category" value={selectedApplicant.category} />
                    <DetailRow label="Primary Phone" value={selectedApplicant.phone} />
                    <DetailRow label="Registered Email" value={selectedApplicant.email} />
                    <DetailRow label="Father / Guardian Name" value={selectedApplicant.guardianName || '—'} />
                    <DetailRow label="Guardian Phone" value={selectedApplicant.guardianPhone || '—'} />
                    <DetailRow label="Residential Address" value={selectedApplicant.address || '—'} />
                    <DetailRow label="City & State" value={`${selectedApplicant.city || 'Bhubaneswar'}, ${selectedApplicant.state || 'Odisha'}`} />
                  </div>
                </div>
              )}

              {/* TAB 2: ACADEMIC QUALIFICATIONS */}
              {dossierActiveTab === 'academic' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Prior Educational Record &amp; Entrance Rankings
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <DetailRow label="Previous School / College" value={selectedApplicant.previousSchool || 'Senior Secondary School'} />
                    <DetailRow label="Class 10th / Matriculation Marks" value={`${selectedApplicant.tenthMarks || '—'}%`} />
                    <DetailRow label="Class 12th / Intermediate Marks" value={`${selectedApplicant.twelfthMarks || '—'}%`} />
                    <DetailRow label="Entrance Exam Taken" value={selectedApplicant.entranceExam || 'Direct Merit'} />
                    <DetailRow label="Entrance Exam Rank / Score" value={selectedApplicant.entranceRank ? `#${selectedApplicant.entranceRank}` : 'Direct Intake'} />
                    <DetailRow label="Calculated Institutional Merit Score" value={`${selectedApplicant.meritScore || '—'} / 100`} />
                    <DetailRow label="Allotted Program" value={selectedApplicant.programmeName} />
                    <DetailRow label="Target Academic Session" value={selectedApplicant.academicYear} />
                  </div>
                </div>
              )}

              {/* TAB 3: DOCUMENTS VERIFICATION CHECKLIST */}
              {dossierActiveTab === 'documents' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Mandatory Document Scrutiny &amp; Verification Workflow
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      All items marked (Mandatory) must be verified prior to formal seat approval.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(selectedApplicant.documents || []).map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          background: doc.status === 'VERIFIED' ? '#f0fdf4' : doc.status === 'REPLACEMENT_REQUESTED' ? '#fff7ed' : '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{doc.name}</span>
                            {doc.isRequired && (
                              <span style={{ marginLeft: '6px', fontSize: '0.68rem', fontWeight: 800, color: '#e11d48' }}>
                                (Mandatory)
                              </span>
                            )}
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                              File: {doc.fileName || 'Not Uploaded'} {doc.fileSize ? `(${doc.fileSize})` : ''}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => openApplicantDetails(app.id)} disabled={detailsLoading} style={{ padding: '6px 10px', fontSize: '.76rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}>Details</button>
                            {app.status === 'APPLIED' && (
                              <button
                                type="button"
                                onClick={() => setPreviewDocument(doc)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Eye size={13} /> View File
                              </button>
                            )}

                            {doc.status !== 'VERIFIED' && (
                              <button
                                type="button"
                                onClick={() => handleVerifyDocument(doc.id, 'VERIFIED', 'Verified against council records.')}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                ✓ Verify
                              </button>
                            )}

                            {doc.status !== 'REPLACEMENT_REQUESTED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const reason = window.prompt(`Request replacement for ${doc.name}:`, 'Scan is blurry or incomplete');
                                  if (reason) handleVerifyDocument(doc.id, 'REPLACEMENT_REQUESTED', 'Clarification required', reason);
                                }}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#fff7ed',
                                  color: '#c2410c',
                                  border: '1px solid #fed7aa',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Request Replacement
                              </button>
                            )}
                          </div>
                        </div>

                        {doc.remarks && (
                          <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#475569', background: 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: '6px' }}>
                            <strong>Verification Note:</strong> {doc.remarks} {doc.verifiedBy ? `— by ${doc.verifiedBy}` : ''}
                          </div>
                        )}

                        {doc.replacementReason && (
                          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#b91c1c', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>
                            <strong>Replacement Note to Applicant:</strong> {doc.replacementReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DECISION & WORKFLOW */}
              {dossierActiveTab === 'review' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Review &amp; Statutory Seat Decision
                  </h4>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Eligibility Scrutiny Summary
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                      • Minimum Aggregate Criteria: 60% in qualifying board (Candidate: {selectedApplicant.twelfthMarks || 0}%)<br />
                      • Mandatory Document Clearance: {(selectedApplicant.documents || []).filter((d) => d.isRequired && d.status === 'VERIFIED').length} of {(selectedApplicant.documents || []).filter((d) => d.isRequired).length} verified.<br />
                      • Current Application Stage: <strong>{selectedApplicant.stage}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Reviewer Observations &amp; Decision Remarks
                      </label>
                      <textarea
                        rows={3}
                        value={reviewForm.notes}
                        onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                        placeholder="Add verification and approval notes regarding seat quota, lateral eligibility..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
                      <input
                        type="checkbox"
                        id="bypassIncomplete"
                        checked={reviewForm.bypassIncompleteDocs}
                        onChange={(e) => setReviewForm({ ...reviewForm, bypassIncompleteDocs: e.target.checked })}
                      />
                      <label htmlFor="bypassIncomplete" style={{ cursor: 'pointer' }}>
                        Record authorized institutional provisional exception (e.g. awaiting final board marksheets)
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleRecordDecision('APPROVE')}
                        style={{
                          padding: '10px 18px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Approve Application for Admission
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const r = window.prompt('Documented Rejection Reason:', 'Does not satisfy autonomous qualifying criteria');
                          if (r) {
                            setReviewForm((prev) => ({ ...prev, reason: r }));
                            handleRecordDecision('REJECT');
                          }
                        }}
                        style={{
                          padding: '10px 18px',
                          background: '#fff1f2',
                          color: '#e11d48',
                          border: '1px solid #fecdd3',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✗ Reject Application
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRecordDecision('WAITLIST')}
                        style={{
                          padding: '10px 18px',
                          background: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                        }}
                      >
                        Place on Waitlist
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: OFFER LETTER */}
              {dossierActiveTab === 'offer' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      Official Provisional Admission Offer
                    </h4>
                    {selectedApplicant.offerLetterGenerated && (
                      <button
                        type="button"
                        onClick={() => window.print()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Printer size={14} /> Print Letter
                      </button>
                    )}
                  </div>

                  {selectedApplicant.status !== 'APPROVED' && selectedApplicant.status !== 'ENROLLED' ? (
                    <div style={{ padding: '24px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', color: '#b45309', fontSize: '0.84rem' }}>
                      Application must be in <strong>APPROVED</strong> status before an admission offer letter can be generated. Please approve the candidate under the Decision tab first.
                    </div>
                  ) : (
                    <div>
                      {/* Printable Letter Container */}
                      <div
                        style={{
                          border: '2px solid #cbd5e1',
                          borderRadius: '12px',
                          padding: '30px',
                          background: '#ffffff',
                          fontFamily: 'serif',
                          lineHeight: 1.6,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '20px' }}>
                          <h2 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#1e3a8a' }}>
                            Apna Campus College of Engineering &amp; Technology
                          </h2>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            Autonomous Institution Accredited by NAAC Grade ‘A+’ · Approved by AICTE, New Delhi
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '6px', textDecoration: 'underline' }}>
                            PROVISIONAL ADMISSION OFFER LETTER — ACADEMIC YEAR {selectedApplicant.academicYear}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '14px' }}>
                          <div>
                            <strong>Ref No:</strong> AC-ADM-{selectedApplicant.applicationNo}<br />
                            <strong>Date of Issue:</strong> {new Date().toLocaleDateString('en-IN')}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong>Offer Valid Until:</strong> {selectedApplicant.offerValidUntil || offerForm.validUntil}
                          </div>
                        </div>

                        <p style={{ fontSize: '0.86rem' }}>
                          Dear <strong>{selectedApplicant.name}</strong>,
                        </p>
                        <p style={{ fontSize: '0.84rem' }}>
                          We are pleased to inform you that based on your performance in qualifying examination / entrance counseling, you have been provisionally granted admission to the following program:
                        </p>

                        <div style={{ background: '#f8fafc', padding: '12px 18px', borderRadius: '8px', margin: '14px 0', fontSize: '0.84rem', borderLeft: '4px solid #2563eb' }}>
                          <strong>Offered Program:</strong> {selectedApplicant.programmeName}<br />
                          <strong>Admission Category:</strong> {selectedApplicant.category}<br />
                          <strong>Session:</strong> {selectedApplicant.academicYear} (Semester 1 Intake)<br />
                          <strong>Prescribed Package:</strong> ₹{(selectedApplicant.feeAmount || 40000).toLocaleString('en-IN')}
                        </div>

                        <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                          Please confirm your acceptance of this offer and deposit the initial semester package prior to the validity deadline to ensure seat allotment. Failure to respond before the validity date will cause the offer to lapse.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '0.82rem' }}>
                          <div>
                            ____________________________<br />
                            Candidate / Guardian Signature
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            ____________________________<br />
                            <strong>Dean (Admissions &amp; Intake)</strong><br />
                            Apna Campus Autonomous Authority
                          </div>
                        </div>
                      </div>

                      {/* Offer Controls */}
                      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {!selectedApplicant.offerLetterGenerated ? (
                          <button
                            type="button"
                            onClick={handleGenerateOffer}
                            style={{
                              padding: '10px 18px',
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                            }}
                          >
                            Dispatch Provisional Offer Letter
                          </button>
                        ) : selectedApplicant.stage === 'OFFER_SENT' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOfferResponse('ACCEPT')}
                              style={{
                                padding: '10px 18px',
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Candidate Accepts Offer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOfferResponse('DECLINE')}
                              style={{
                                padding: '10px 18px',
                                background: '#fff1f2',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✗ Candidate Declines
                            </button>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#059669' }}>
                            ✓ Offer has been accepted by candidate on {selectedApplicant.offerAcceptedAt ? new Date(selectedApplicant.offerAcceptedAt).toLocaleDateString('en-IN') : 'Record'}.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: FEE CONFIRMATION */}
              {dossierActiveTab === 'fee' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Admission Fee &amp; Transaction Verification
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Prescribed Fee</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        ₹{(selectedApplicant.feeAmount || 40000).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Confirmed Payment Amount</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: selectedApplicant.feeStatus === 'Paid' ? '#059669' : '#d97706', marginTop: '4px' }}>
                        ₹{(selectedApplicant.feePaid || 0).toLocaleString('en-IN')} ({selectedApplicant.feeStatus || 'Pending'})
                      </div>
                    </div>
                  </div>

                  {selectedApplicant.feeStatus === 'Paid' ? (
                    <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.88rem' }}>
                        ✓ Payment Verified &amp; Confirmed
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '4px' }}>
                        Receipt / UTR Ref: <strong>{selectedApplicant.feeReceiptRef}</strong><br />
                        Confirmed by: {selectedApplicant.feeConfirmedBy || 'Accounts Division'}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleConfirmFee} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Verified Receipt / Transaction Reference (UTR)*
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. UTR-HDFC-991823, SBI-EPAY-88124..."
                          value={feeForm.receiptRef}
                          onChange={(e) => setFeeForm({ ...feeForm, receiptRef: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Amount Deposited (₹)
                          </label>
                          <input
                            type="number"
                            value={feeForm.amount}
                            onChange={(e) => setFeeForm({ ...feeForm, amount: Number(e.target.value) })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Payment Gateway / Mode
                          </label>
                          <select
                            value={feeForm.paymentMode}
                            onChange={(e) => setFeeForm({ ...feeForm, paymentMode: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', background: '#fff' }}
                          >
                            <option>Online Transfer (NEFT/RTGS)</option>
                            <option>SBI Collect / Institutional Gateway</option>
                            <option>Demand Draft (DD)</option>
                            <option>Cash Receipt at Accounts Counter</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        style={{
                          marginTop: '10px',
                          padding: '10px 18px',
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        Confirm Admission Fee Payment
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 7: FINAL ENROLLMENT */}
              {dossierActiveTab === 'enroll' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Institutional Student Matriculation &amp; Account Provisioning
                  </h4>

                  {selectedApplicant.status === 'ENROLLED' ? (
                    <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#065f46', fontSize: '1rem' }}>
                        <ShieldCheck size={20} /> Student Enrollment Finalized!
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#047857', marginTop: '6px' }}>
                        Permanent Roll Number: <strong>{selectedApplicant.studentId ? `STU-26-000${selectedApplicant.studentId.slice(-1)}` : 'Enrolled'}</strong><br />
                        Approved By: {selectedApplicant.approvedBy || 'Dean Admissions'}<br />
                        Student LMS Portal Account provisioned with Role STUDENT.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                        Executing final enrollment will atomically:
                        <br />1. Generate institutional Registration Number and Roll Number.
                        <br />2. Create permanent <strong>Student</strong> database record.
                        <br />3. Create Semester 1 <strong>StudentEnrollment</strong> entry.
                        <br />4. Provision <strong>User</strong> login credentials with cryptographic activation token.
                        <br />5. Mark applicant status as <strong>ENROLLED</strong> and log audit trail.
                      </p>

                      <div style={{ marginTop: '16px', padding: '14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e' }}>
                        <strong>Validation Guard:</strong> Fee must be confirmed or candidate offer approved before final enrollment is finalized.
                      </div>

                      <button
                        type="button"
                        onClick={handleFinalizeEnrollment}
                        style={{
                          marginTop: '20px',
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                        }}
                      >
                        ⚡ Finalize Student Enrollment &amp; Issue Roll Number
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: AUDIT HISTORY */}
              {dossierActiveTab === 'audit' && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Immutable Compliance Audit Trail &amp; Lifecycle Timeline
                  </h4>
                  {(selectedApplicant.history || []).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                      No audit history entries recorded yet for this applicant.
                    </div>
                  ) : (
                    <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Vertical connecting line */}
                      <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: '#e2e8f0' }} />
                      {(selectedApplicant.history || []).map((ev, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          {/* Dot on line */}
                          <div style={{
                            position: 'absolute',
                            left: '-24px',
                            top: '4px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: ev.action?.includes('ENROLL') ? '#10b981' : ev.action?.includes('REJECT') ? '#ef4444' : ev.action?.includes('OFFER') ? '#8b5cf6' : ev.action?.includes('FEE') ? '#059669' : '#2563eb',
                            border: '3px solid #ffffff',
                            boxShadow: '0 0 0 2px #cbd5e1'
                          }} />
                          <div style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                                {ev.action}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {new Date(ev.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, {new Date(ev.timestamp).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                              Actor: {ev.user}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                              {ev.note}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. REGISTER NEW APPLICANT MODAL */}
      {isRegisterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Register New Student Applicant
              </h3>
              <button type="button" onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewApplicant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Full Legal Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicantForm.name}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address*
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.edu"
                    required
                    value={newApplicantForm.email}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number*
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter applicant phone number"
                    required
                    value={newApplicantForm.phone}
                    onChange={(e) => setNewApplicantForm({ ...newApplicantForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                  >
                    <option value="">Select category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Target Academic Programme*
                </label>
                <select
                  value={newApplicantForm.programmeName}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      programmeId: e.target.value,
                    });
                  }}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                >
                  <option value="">Select an active programme</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>Academic year *</label>
                <select required value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.86rem', background: '#fff' }}>
                  <option value="">Select a configured academic year</option>
                  {academicYears.map((year) => <option key={year.id} value={year.year}>{year.year}{year.isCurrent ? ' (current)' : ''}</option>)}
                </select>
                {!academicYears.length && <p role="alert" style={{ color: '#b91c1c', fontSize: '.78rem' }}>No academic years are configured. Add one in Academic Setup before registering an applicant.</p>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>Date of birth *</label>
                <input type="date" required max={new Date().toISOString().slice(0, 10)} value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '.86rem', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    10th Marks (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.tenthMarks}
                    onChange={(e) => setFormData({ ...formData, tenthMarks: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    12th Marks (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.twelfthMarks}
                    onChange={(e) => setFormData({ ...formData, twelfthMarks: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Entrance Exam
                  </label>
                  <input
                    type="text"
                    value={formData.entranceExam}
                    onChange={(e) => setFormData({ ...formData, entranceExam: e.target.value })}
                    placeholder="Enter entrance exam name"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Entrance Exam Rank
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.entranceRank}
                    onChange={(e) => setFormData({ ...formData, entranceRank: e.target.value })}
                    placeholder="Rank"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !programmes.length || !academicYears.length}
                  style={{ padding: '10px 20px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CREATE ADMISSION NOTICE MODAL */}
      {isNoticeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', padding: '24px', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Student Enrolled</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                    The student record and enrollment have been saved.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notice Title*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OJEE Final Spot Round Document Verification Closes..."
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px', padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', color: '#9a3412', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Student portal activation is pending. Secure email delivery is not configured, so no activation link has been issued.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Circular Text*
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive details, physical reporting timing, venue..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setEnrolledStudentInfo(null)}
                  style={{
                    padding: '12px 20px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MANAGE ADMISSION DEADLINES MODAL */}
      {isDeadlinesModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Manage Admission Phases &amp; Deadlines
              </h3>
              <button type="button" onClick={() => setIsDeadlinesModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Active Statutory Deadlines:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {deadlines.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Category: {d.category} · Phase: {d.programmeCode}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: '#d97706' }}>{d.deadlineDate}</span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateDeadline} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>Add New Milestone:</div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Milestone title (e.g. Document Verification Closes)..."
                  value={deadlineForm.title}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="date"
                  required
                  value={deadlineForm.deadlineDate}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, deadlineDate: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
                <input
                  type="text"
                  placeholder="Target Time (e.g. 05:00 PM)"
                  value={deadlineForm.time}
                  onChange={(e) => setDeadlineForm({ ...deadlineForm, time: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>
              <button
                type="submit"
                style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', alignSelf: 'flex-start' }}
              >
                + Add Deadline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. MERIT LIST & SEAT ALLOCATION MODAL */}
      {isMeritModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Merit List &amp; Seat Allocation Analysis
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Calculated based on standard autonomous scoring formula: 35% (10th) + 55% (12th) + Entrance Exam weightage.
                </span>
              </div>
              <button type="button" onClick={() => setIsMeritModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px' }}>Rank</th>
                    <th style={{ padding: '10px 12px' }}>Applicant</th>
                    <th style={{ padding: '10px 12px' }}>Programme</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Board Marks</th>
                    <th style={{ padding: '10px 12px' }}>Merit Score</th>
                    <th style={{ padding: '10px 12px' }}>Seat Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...applicants]
                    .sort((a, b) => (b.meritScore || 0) - (a.meritScore || 0))
                    .map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#2563eb' }}>#{idx + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                          {item.name}
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.applicationNo}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{item.programmeName}</td>
                        <td style={{ padding: '10px 12px' }}>{item.category}</td>
                        <td style={{ padding: '10px 12px' }}>
                          10th: {item.tenthMarks || '—'}% · 12th: {item.twelfthMarks || '—'}%
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#059669' }}>
                          {item.meritScore || '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: item.status === 'ENROLLED' ? '#15803d' : '#2563eb' }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIGURE ADMISSION CYCLE MODAL */}
      {isCycleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Configure Active Admission Cycle
              </h3>
              <button type="button" onClick={() => setIsCycleModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
              <DetailRow label="Academic Year" value="2026–2027" />
              <DetailRow label="Approved B.Tech Intake" value="720 Seats" />
              <DetailRow label="Approved MCA Intake" value="160 Seats" />
              <DetailRow label="Approved MBA Intake" value="180 Seats" />
              <DetailRow label="Total Institutional Capacity" value="1,060 Seats" />
              <DetailRow label="Active Admissions Desk" value="Phase II — Open Mop-up Round" />
              <DetailRow label="Statutory Affiliation" value="Autonomous under BPUT & AICTE" />
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ENROLLED CREDENTIALS NOTIFICATION MODAL */}
      {enrolledStudentInfo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Student Enrollment Finalized!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#64748b' }}>
              <strong>{enrolledStudentInfo.name}</strong> has been enrolled and matriculated into <strong>{enrolledStudentInfo.department}</strong>.
            </p>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.84rem',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Institutional Roll No:</span>
                <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{enrolledStudentInfo.rollNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Registration Student ID:</span>
                <strong>{enrolledStudentInfo.studentId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Portal Login ID:</span>
                <strong>{enrolledStudentInfo.loginId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Initial Password:</span>
                <span style={{ fontStyle: 'italic', color: '#475569' }}>Self-activation required</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={copyActivationLink}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: copiedLink ? '#059669' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink ? 'Copied Link!' : 'Copy Activation Link'}
              </button>

              <button
                type="button"
                onClick={() => setEnrolledStudentInfo(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {(detailsLoading || selectedApplicant) && (
        <div role="dialog" aria-modal="true" aria-label="Applicant details" style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,23,42,.65)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <section style={{ width: 'min(620px, 100%)', maxHeight: '85vh', overflow: 'auto', background: '#fff', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}><h2 style={{ margin: 0 }}>Applicant details</h2><button type="button" onClick={() => { setSelectedApplicant(null); setDetailsLoading(false); }} aria-label="Close details"><X /></button></div>
            {detailsLoading ? <p>Loading applicant from backend…</p> : selectedApplicant && <>
              <p style={{ color: '#64748b' }}>Application {selectedApplicant.applicationNo} · {selectedApplicant.status}</p>
              <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, .7fr) 1.3fr', gap: 10 }}>
                {[
                  ['Name', selectedApplicant.name], ['Email', selectedApplicant.email], ['Phone', selectedApplicant.phone],
                  ['Date of birth', selectedApplicant.dob], ['Gender', selectedApplicant.gender], ['Category', selectedApplicant.category],
                  ['Programme', selectedApplicant.programme?.name || selectedApplicant.programmeName], ['Academic year', selectedApplicant.academicYear],
                  ['10th marks', selectedApplicant.tenthMarks == null ? 'Not recorded' : `${selectedApplicant.tenthMarks}%`],
                  ['12th marks', selectedApplicant.twelfthMarks == null ? 'Not recorded' : `${selectedApplicant.twelfthMarks}%`],
                  ['Entrance exam', selectedApplicant.entranceExam || 'Not recorded'], ['Entrance rank', selectedApplicant.entranceRank ?? 'Not recorded'],
                  ['Reviewed by', selectedApplicant.verifiedBy || 'Not reviewed'], ['Rejection reason', selectedApplicant.rejectionReason || '—'],
                ].map(([label, value]) => <React.Fragment key={label}><dt style={{ color: '#64748b' }}>{label}</dt><dd style={{ margin: 0, overflowWrap: 'anywhere' }}>{value}</dd></React.Fragment>)}
              </dl>
              <p style={{ marginTop: 20, padding: 12, background: '#fff7ed', color: '#9a3412', borderRadius: 8, fontSize: '.84rem' }}>Document attachments are not stored by this admissions module. Eligibility review records the staff decision only.</p>
            </>}
          </section>
        </div>
      )}

    </div>
  );
}
