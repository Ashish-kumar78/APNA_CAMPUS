import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Award
} from 'lucide-react';
import { api } from '../services/api.js';
import AccountActivationModal from './AccountActivationModal.jsx';

export default function AdmissionsPortal({ account, onLogout, onSwitchRole }) {
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    verified: 0,
    approved: 0,
    enrolled: 0,
    rejected: 0,
    conversionRate: '0%',
  });

  const [applicants, setApplicants] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [progFilter, setProgFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Onboarding credential modal (after one-click approve & enroll)
  const [enrolledStudentInfo, setEnrolledStudentInfo] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Direct activation simulation modal
  const [activationTokenToSimulate, setActivationTokenToSimulate] = useState('');

  // New applicant form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Female',
    dob: '2005-08-15',
    category: 'General',
    programmeId: '',
    programmeName: 'B.Tech Computer Science & Engineering',
    tenthMarks: '88.5',
    twelfthMarks: '86.0',
    entranceExam: 'JEE Main 2026',
    entranceRank: '32500',
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, progFilter]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [statsRes, applicantsRes, progRes] = await Promise.allSettled([
        api.getAdmissionStats(),
        api.getApplicants({ status: statusFilter, programmeId: progFilter }),
        api.getProgrammes(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
      if (applicantsRes.status === 'fulfilled' && applicantsRes.value?.data) {
        setApplicants(applicantsRes.value.data);
      }
      if (progRes.status === 'fulfilled' && progRes.value?.data) {
        setProgrammes(progRes.value.data);
        if (!formData.programmeId && progRes.value.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            programmeId: progRes.value.data[0].id,
            programmeName: progRes.value.data[0].name,
          }));
        }
      }
    } catch (err) {
      console.warn('Error loading admissions data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  }

  async function handleRegisterApplicant(e) {
    e.preventDefault();
    try {
      const res = await api.createApplicant(formData);
      if (res && res.success) {
        showToast(`Applicant ${formData.name} registered successfully!`);
        setIsRegisterModalOpen(false);
        loadData();
      } else {
        alert(res?.message || 'Failed to register applicant.');
      }
    } catch (err) {
      alert(err?.message || 'Error creating application. Please check input details.');
    }
  }

  async function handleVerify(id, name) {
    try {
      const res = await api.verifyApplicant(id);
      if (res && res.success) {
        showToast(`Applicant ${name} marked as VERIFIED.`);
        loadData();
      }
    } catch (err) {
      alert(err?.message || 'Failed to verify applicant.');
    }
  }

  async function handleApproveAndEnroll(id) {
    if (!window.confirm('Approve admission and provision student account, enrollment and activation link?')) return;
    try {
      const res = await api.approveAndEnrollApplicant(id);
      if (res && res.success && res.data) {
        setEnrolledStudentInfo(res.data);
        showToast(`Student ${res.data.name} admitted successfully!`);
        loadData();
      } else {
        alert(res?.message || 'Failed to enroll applicant.');
      }
    } catch (err) {
      alert(err?.message || 'Enrollment transaction failed.');
    }
  }

  async function handleReject(id, name) {
    const reason = window.prompt(`Please provide a rejection reason for ${name}:`, 'Incomplete academic prerequisites');
    if (reason === null) return;
    try {
      const res = await api.rejectApplicant(id, reason);
      if (res && res.success) {
        showToast(`Applicant ${name} marked as REJECTED.`);
        loadData();
      }
    } catch (err) {
      alert(err?.message || 'Failed to reject applicant.');
    }
  }

  function copyActivationLink(url) {
    const fullUrl = `${window.location.origin}/#activate?token=${enrolledStudentInfo.activationToken}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  const filteredApplicants = applicants.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.applicationNo?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.includes(q)
    );
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
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
            onClick={() => setIsRegisterModalOpen(true)}
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
              cursor: 'pointer',
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
        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Applications</span>
              <Users size={18} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>{stats.total || applicants.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 500 }}>Active session 2026-27</div>
          </div>

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Verified Documents</span>
              <CheckCircle2 size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '8px' }}>{stats.verified}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Ready for seat allocation</div>
          </div>

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Approved for Admission</span>
              <Award size={18} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '8px' }}>{stats.approved}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Awaiting student enrollment</div>
          </div>

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Enrolled & Provisioned</span>
              <ShieldCheck size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '8px' }}>{stats.enrolled}</div>
            <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>Accounts generated</div>
          </div>

          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Intake Conversion</span>
              <Sparkles size={18} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', marginTop: '8px' }}>{stats.conversionRate || '25%'}</div>
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
                Showing {filteredApplicants.length} applicant records in current intake cycle
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
                  <th style={{ padding: '12px 16px' }}>Category & Merit</th>
                  <th style={{ padding: '12px 16px' }}>Stage Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      No applicant records matched your filters.
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
                            {app.entranceExam ? `${app.entranceExam} (Rank: ${app.entranceRank || 'Merit'})` : '10th & 12th Merit'}
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
                    placeholder="student@example.com"
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
                    placeholder="+91 94370 00000"
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
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                  >
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
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                  >
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
                    const selected = programmes.find((p) => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      programmeId: e.target.value,
                      programmeName: selected ? selected.name : 'Computer Science',
                    });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code} · {p.durationYears} Years)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    10th Marks (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
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
                    placeholder="JEE Main / OJEE"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Entrance Rank
                  </label>
                  <input
                    type="number"
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
                  style={{ padding: '10px 20px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Submit Application
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
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Student Enrolled & Account Provisioned</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                    Multi-table atomic transaction committed to PostgreSQL database
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

              {/* Secure Activation Link Box */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Unique Student Portal Activation Link
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/#activate?token=${enrolledStudentInfo.activationToken}`}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      background: '#f8fafc',
                      color: '#334155',
                    }}
                  />
                  <button
                    onClick={() => copyActivationLink()}
                    style={{
                      padding: '10px 14px',
                      background: copiedLink ? '#059669' : '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  The student uses this one-time link to set their own password and access their student portal.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setActivationTokenToSimulate(enrolledStudentInfo.activationToken);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f0fdfa',
                    color: '#0f766e',
                    border: '1.5px solid #99f6e4',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ExternalLink size={16} /> Test Student Activation Now
                </button>
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

      {/* Direct Test Activation Modal */}
      {activationTokenToSimulate && (
        <AccountActivationModal
          initialToken={activationTokenToSimulate}
          onClose={() => setActivationTokenToSimulate('')}
          onActivationSuccess={(user, token) => {
            showToast(`Account for ${user.name} activated successfully!`);
            setActivationTokenToSimulate('');
          }}
        />
      )}
    </div>
  );
}
