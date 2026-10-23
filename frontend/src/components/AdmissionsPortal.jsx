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
  Award
} from 'lucide-react';
import { api } from '../services/api.js';

export default function AdmissionsPortal({ account, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState(null);

  const [applicants, setApplicants] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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

  // Onboarding credential modal (after one-click approve & enroll)
  const [enrolledStudentInfo, setEnrolledStudentInfo] = useState(null);

  // New applicant form state
  const [formData, setFormData] = useState({
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
        alert(res?.message || 'Failed to register applicant.');
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
      const res = await api.verifyApplicant(id);
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
      const res = await api.approveAndEnrollApplicant(id);
      if (res && res.success && res.data) {
        setEnrolledStudentInfo(res.data);
        showToast(`Student ${res.data.name} admitted successfully!`);
        await loadData();
      } else {
        alert(res?.message || 'Failed to enroll applicant.');
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
      const res = await api.rejectApplicant(id, reason);
      if (res && res.success) {
        showToast(`Applicant ${name} marked as REJECTED.`);
        await loadData();
      }
    } catch (err) {
      alert(err?.message || 'Failed to reject applicant.');
    } finally {
      setPendingApplicantId('');
    }
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
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 500,
          }}
        >
          <Sparkles size={18} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Admissions & Intake Central
            </h1>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Autonomous Institutional Admissions, Eligibility Verification & Account Provisioning
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setActiveView('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '9px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            ← Overview Dashboard
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
            <Plus size={16} /> Register New Applicant
          </button>
          <button
            onClick={loadData}
            title="Refresh Data"
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 12px',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              padding: '9px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} /> Logout
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

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Intake Conversion</span>
              <Sparkles size={18} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', marginTop: '8px' }}>{stats?.conversionRate ?? '—'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Inquiry-to-enrollment</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, application number, email, or contact..."
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} color="#64748b" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}
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
                <option value="All">All Programmes</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
                            {app.status}
                          </span>
                          {app.verifiedBy && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                              Ver: {app.verifiedBy.split(' ')[0]}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => openApplicantDetails(app.id)} disabled={detailsLoading} style={{ padding: '6px 10px', fontSize: '.76rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}>Details</button>
                            {app.status === 'APPLIED' && (
                              <button
                                onClick={() => handleVerify(app.id, app.name)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  background: '#f0fdf4',
                                  color: '#15803d',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                              >
                                Verify Eligibility
                              </button>
                            )}

                            {(app.status === 'VERIFIED' || app.status === 'APPROVED') && (
                              <button
                                onClick={() => handleApproveAndEnroll(app.id)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  background: '#2563eb',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                                }}
                              >
                                <UserCheck size={14} /> Approve & Enroll
                              </button>
                            )}

                            {app.status === 'ENROLLED' && (
                              <span style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 600 }}>
                                Enrolled (ID: {app.studentId?.slice(-6) || 'Active'})
                              </span>
                            )}

                            {app.status !== 'ENROLLED' && app.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleReject(app.id, app.name)}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  border: '1px solid #fecdd3',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
        </>
      )}

      {/* Register New Applicant Modal */}
      {isRegisterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Register New Institutional Applicant</h3>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterApplicant} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Candidate Name"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.edu"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Phone Contact *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter applicant phone number"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Target Academic Programme *
                </label>
                <select
                  value={formData.programmeId}
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
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code} · {p.durationYears} Years)
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Entrance Rank
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', color: '#475569' }}
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

      {/* Onboarding Credential Modal (Shown after approval and enrollment) */}
      {enrolledStudentInfo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
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

            <div style={{ padding: '24px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Student Name:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{enrolledStudentInfo.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Assigned Roll / Login ID:</span>
                  <span style={{ fontWeight: 800, color: '#0369a1', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    {enrolledStudentInfo.rollNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Registered Email:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{enrolledStudentInfo.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Programme & Term:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{enrolledStudentInfo.department} (Sem 1)</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px', padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', color: '#9a3412', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Student portal activation is pending. Secure email delivery is not configured, so no activation link has been issued.
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
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
                  Done
                </button>
              </div>
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
