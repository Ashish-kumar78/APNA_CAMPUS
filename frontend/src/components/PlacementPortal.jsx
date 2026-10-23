import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  DollarSign,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Menu,
  X,
  FileText,
  Printer,
  Download,
  Check,
  Slash,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  UserCheck,
  Sparkles,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import './PlacementPortal.css';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import { api } from '../services/api.js';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';

export default function PlacementPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, drives, companies, applicants, offers, stats

  // Core Data States
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [applicantPipeline, setApplicantPipeline] = useState([]);
  const [offersList, setOffersList] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);

  // Search & Filter
  const [driveSearch, setDriveSearch] = useState('');
  const [driveFilter, setDriveFilter] = useState('ALL');
  const [companySearch, setCompanySearch] = useState('');
  const [companyTierFilter, setCompanyTierFilter] = useState('ALL');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStageFilter, setApplicantStageFilter] = useState('ALL');

  // Modals & UI States
  const [toastMessage, setToastMessage] = useState('');
  const [selectedDriveForEligibility, setSelectedDriveForEligibility] = useState(null);
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAdvanceStageModal, setShowAdvanceStageModal] = useState(false);
  const [selectedAppForAdvance, setSelectedAppForAdvance] = useState(null);
  const [showReleaseOfferModal, setShowReleaseOfferModal] = useState(false);
  const [selectedAppForOffer, setSelectedAppForOffer] = useState(null);
  const [showPrintOfferModal, setShowPrintOfferModal] = useState(false);
  const [selectedOfferForPrint, setSelectedOfferForPrint] = useState(null);

  // Forms
  const [newDriveForm, setNewDriveForm] = useState({
    company: '',
    role: '',
    packageLPA: '',
    minCgpa: '',
    maxBacklogs: 0,
    allowedBranches: '',
    driveDate: '',
    venue: '',
    employmentType: 'Full-time',
  });

  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    category: '',
    hrContact: '',
    email: '',
    phone: '',
    packageRange: '',
    tier: 'Active Partner',
    mouStatus: 'Under Review',
    officeLocation: '',
  });

  const [advanceStageForm, setAdvanceStageForm] = useState({
    nextStage: 'Technical Round 1 Cleared',
    nextStatus: 'In Interview Pipeline',
    notes: '',
    score: '8.5 / 10',
  });

  const [releaseOfferForm, setReleaseOfferForm] = useState({
    packageOffered: '₹7.5 LPA',
    joiningDate: '2027-07-01',
    validityDeadline: '2026-12-15',
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Placement records are sourced from the API; failed requests remain visible as errors.
  useEffect(() => {
    async function loadData() {
      const results = await Promise.allSettled([
        api.getPlacementDashboardStats(),
        api.getPlacementCompanies(),
        api.getPlacementDrives(),
        api.getPlacementApplications(),
        api.getPlacementOffers(),
      ]);
      const errors = [];
      const [statsRes, companiesRes, drivesRes, appsRes, offersRes] = results;
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) setDashboardStats(statsRes.value.data);
      else errors.push('placement metrics');
      if (companiesRes.status === 'fulfilled' && companiesRes.value?.success) setCompanies(companiesRes.value.data || []);
      else errors.push('companies');
      if (drivesRes.status === 'fulfilled' && drivesRes.value?.success) setDrives(drivesRes.value.data || []);
      else errors.push('drives');
      if (appsRes.status === 'fulfilled' && appsRes.value?.success) setApplicantPipeline(appsRes.value.data || []);
      else errors.push('applications');
      if (offersRes.status === 'fulfilled' && offersRes.value?.success) setOffersList(offersRes.value.data || []);
      else errors.push('offers');
      setLoadError(errors.length ? `Some placement data could not be loaded: ${errors.join(', ')}.` : '');
    }
    loadData();
  }, []);

  // Handlers
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!newDriveForm.company || !newDriveForm.role || !newDriveForm.packageLPA || !newDriveForm.minCgpa || !newDriveForm.driveDate || !newDriveForm.venue || !newDriveForm.allowedBranches.trim()) {
      alert('Fill the company, role, package, CGPA cutoff, branches, drive date, and venue.');
      return;
    }
    try {
      const payload = {
        ...newDriveForm,
        allowedBranches: newDriveForm.allowedBranches.split(',').map(b => b.trim()),
      };
      const response = await api.createPlacementDrive(payload);
      if (!response?.success || !response.data) throw new Error(response?.message || 'The drive was not saved.');
      const added = response.data;
      setDrives((current) => [added, ...current]);
      setShowAddDriveModal(false);
      setNewDriveForm({
        company: '',
        role: '',
        packageLPA: '',
        minCgpa: '',
        maxBacklogs: 0,
        allowedBranches: '',
        driveDate: '',
        venue: '',
        employmentType: 'Full-time',
      });
      triggerToast(`Recruitment drive for ${added.company} registered successfully.`);
    } catch (err) {
      alert('Error creating drive: ' + err.message);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyForm.name || !newCompanyForm.email) {
      alert('Please fill company name and HR email.');
      return;
    }
    try {
      const response = await api.createPlacementCompany(newCompanyForm);
      if (!response?.success || !response.data) throw new Error(response?.message || 'The company was not saved.');
      const added = response.data;
      setCompanies((current) => [added, ...current]);
      setShowAddCompanyModal(false);
      setNewCompanyForm({
        name: '',
        category: '',
        hrContact: '',
        email: '',
        phone: '',
        packageRange: '',
        tier: 'Active Partner',
        mouStatus: 'Under Review',
        officeLocation: '',
      });
      triggerToast(`Partner ${added.name} enrolled in recruiting directory.`);
    } catch (err) {
      alert('Error adding company: ' + err.message);
    }
  };

  const handleShortlistCandidate = (student, drive) => {
    void student;
    void drive;
    triggerToast('Eligibility can be calculated, but shortlisting is not saved because a persistent shortlist endpoint is not implemented.');
  };

  const handleEvaluateDrive = async (drive) => {
    setSelectedDriveForEligibility(drive);
    setEligibilityResult(null);
    try {
      const response = await api.evaluateDriveEligibility(drive.id);
      if (!response?.success || !response.data) throw new Error(response?.message || 'Eligibility could not be calculated.');
      setEligibilityResult(response.data);
    } catch (error) {
      triggerToast(error?.message || 'Eligibility could not be calculated from persisted records.');
    }
  };

  const handleAdvanceStageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppForAdvance) return;
    try {
      const response = await api.advancePlacementApplicationStage(selectedAppForAdvance.id, advanceStageForm);
      if (!response?.success) throw new Error(response?.message || 'Application stage was not saved.');
      const refreshed = await api.getPlacementApplications();
      setApplicantPipeline(refreshed?.data || []);
      setShowAdvanceStageModal(false);
      setSelectedAppForAdvance(null);
      triggerToast(`Candidate advanced to "${advanceStageForm.nextStage}".`);
    } catch (err) {
      alert('Error advancing candidate: ' + err.message);
    }
  };

  const handleReleaseOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppForOffer) return;
    try {
      const payload = {
        applicationId: selectedAppForOffer.id,
        packageOffered: releaseOfferForm.packageOffered,
        joiningDate: releaseOfferForm.joiningDate,
        validityDeadline: releaseOfferForm.validityDeadline,
      };
      const response = await api.releasePlacementOffer(payload);
      if (!response?.success || !response.data) throw new Error(response?.message || 'The offer was not saved.');
      const newOffer = response.data;
      setOffersList((current) => [newOffer, ...current]);
      const refreshed = await api.getPlacementApplications();
      setApplicantPipeline(refreshed?.data || []);
      setShowReleaseOfferModal(false);
      setSelectedAppForOffer(null);
      triggerToast(`Offer record saved for ${newOffer.studentName}; delivery is not configured.`);
    } catch (err) {
      alert('Error releasing offer: ' + err.message);
    }
  };

  // CSV Exports
  const exportCensusCSV = () => {
    const headers = ['Branch Code,Branch Name,Eligible Students,Placed Students,Offers Count,Placement Rate (%),Average CTC,Highest CTC\n'];
    const rows = (dashboardStats?.branchStats || []).map(b =>
      `"${b.code}","${b.branch}","${b.eligible}","${b.placed}","${b.offers}","${b.placementRate}%","${b.avgCTC}","${b.highestCTC}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIFT_Autonomous_Placement_Census_2026.csv`;
    a.click();
    triggerToast('Placement Census CSV downloaded.');
  };

  const exportOffersCSV = () => {
    const headers = ['Offer ID,Student Name,Reg No,Department,Company,Role,Package CTC,Joining Date,Validity Deadline,Status\n'];
    const rows = offersList.map(o =>
      `"${o.id}","${o.studentName}","${o.regNo}","${o.department}","${o.company}","${o.role}","${o.packageOffered}","${o.joiningDate}","${o.validityDeadline}","${o.status}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaCampus_Offers_Manifest_2026.csv`;
    a.click();
    triggerToast('Offers Manifest CSV downloaded.');
  };

  const exportAtsCSV = () => {
    const headers = ['Applicant ID,Student Name,Reg No,Branch,CGPA,Company,Role,Current Stage,Status,Score,CTC\n'];
    const rows = applicantPipeline.map(a =>
      `"${a.id}","${a.studentName}","${a.regNo}","${a.branch}","${a.cgpa}","${a.company}","${a.role}","${a.stage}","${a.status}","${a.roundScore || 'N/A'}","${a.ctcOffered || 'N/A'}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApnaCampus_ATS_Candidate_Pipeline_2026.csv`;
    a.click();
    triggerToast('Candidate ATS Pipeline CSV downloaded.');
  };

  // Filtered views
  const filteredDrives = drives.filter(d => {
    const matchesSearch = (d.company || '').toLowerCase().includes(driveSearch.toLowerCase()) ||
      (d.role || '').toLowerCase().includes(driveSearch.toLowerCase());
    if (driveFilter === 'ALL') return matchesSearch;
    return matchesSearch && (d.status || '').toLowerCase().includes(driveFilter.toLowerCase());
  });

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.hrContact || '').toLowerCase().includes(companySearch.toLowerCase());
    if (companyTierFilter === 'ALL') return matchesSearch;
    return matchesSearch && (c.tier || c.status || '').toLowerCase().includes(companyTierFilter.toLowerCase());
  });

  const filteredApplicants = applicantPipeline.filter(a => {
    const matchesSearch = (a.studentName || '').toLowerCase().includes(applicantSearch.toLowerCase()) ||
      (a.regNo || '').toLowerCase().includes(applicantSearch.toLowerCase()) ||
      (a.company || '').toLowerCase().includes(applicantSearch.toLowerCase()) ||
      (a.role || '').toLowerCase().includes(applicantSearch.toLowerCase());
    if (applicantStageFilter === 'ALL') return matchesSearch;
    return matchesSearch && (a.stage || a.status || '').toLowerCase().includes(applicantStageFilter.toLowerCase());
  });

  return (
    <div className="erp-placement-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #ec4899, #db2777)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`erp-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="erp-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="erp-place-badge" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div className="erp-brand-text">
              <h2>Apna Campus</h2>
              <span>Training &amp; Placement Cell</span>
            </div>
          </div>
          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="erp-sidebar-nav">
          <button
            className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <TrendingUp size={18} />
            <span>Placement Dashboard</span>
            <span style={{ marginLeft: 'auto', background: '#db2777', color: '#fff', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '10px' }}>Live</span>
          </button>
          <button
            className={`erp-nav-item ${activeTab === 'drives' ? 'active' : ''}`}
            onClick={() => setActiveTab('drives')}
          >
            <Briefcase size={18} />
            <span>Campus Drives</span>
          </button>
          <button
            className={`erp-nav-item ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            <Building size={18} />
            <span>Recruiting Partners CRM</span>
          </button>
          <button
            className={`erp-nav-item ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            <Users size={18} />
            <span>Applicant ATS Pipeline</span>
            <span style={{
              marginLeft: 'auto',
              background: '#db2777',
              color: '#ffffff',
              fontSize: '0.7rem',
              padding: '2px 7px',
              borderRadius: '9999px',
              fontWeight: 700,
            }}>
              {applicantPipeline.length}
            </span>
          </button>
          <button
            className={`erp-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <Award size={18} />
            <span>Offer Letters &amp; Outcomes</span>
            <span style={{
              marginLeft: 'auto',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '0.7rem',
              padding: '2px 7px',
              borderRadius: '9999px',
              fontWeight: 700,
            }}>
              {offersList.length}
            </span>
          </button>
          <button
            className={`erp-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <TrendingUp size={18} />
            <span>Placement Analytics</span>
          </button>
          <button
            className={`erp-nav-item ${activeTab === 'report-generation' ? 'active' : ''}`}
            onClick={() => setActiveTab('report-generation')}
          >
            <FileSpreadsheet size={18} />
            <span>Report Generation</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="erp-main-content">
        {activeTab === 'dashboard' ? (
          <RoleDashboardLanding
            roleKey="placement"
            account={account}
            onLogout={onLogout}
            onSwitchRole={onSwitchRole}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            onNavigate={(target) => {
              if (target === 'place-drives') setActiveTab('drives');
              else if (target === 'place-recruiters') setActiveTab('companies');
              else if (target === 'place-stats') setActiveTab('stats');
              else setActiveTab('drives');
            }}
          />
        ) : (
          <>
        <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation"
                aria-label="Show Navigation"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <Menu size={20} color="#0f172a" />
              </button>
            )}
            <div>
              <h1>Training &amp; Placement Cell Operations (T&amp;P)</h1>
              <p>Corporate Relations, Campus Recruitment, Deterministic Eligibility &amp; Offer Lifecycle</p>
            </div>
          </div>

          <div className="erp-header-actions">
            <div className="erp-role-badge">
              <ShieldCheck size={14} /> Placement Officer Access
            </div>

            <div className="campus-user-pill">
              <div className="campus-user-avatar">TNP</div>
              <div className="campus-user-details">
                <strong>{account?.name || 'Head - Training & Placement'}</strong>
                <small>Corporate Relations &amp; T&amp;P Cell</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {loadError && <div role="status" style={{ margin: '0 1.5rem 1rem', padding: '12px 16px', borderRadius: 8, background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>{loadError}</div>}

        <div className="erp-content-body">
          {/* STATS ROW (CLICKABLE TO OPEN FILTERED VIEWS) */}
          <div className="erp-stats-grid">
            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('stats')}
              title="View cohort analytics"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Placement Rate</span>
                <TrendingUp size={18} color="#db2777" />
              </div>
              <div className="erp-stat-val">{dashboardStats?.placementRate == null ? '—' : `${dashboardStats.placementRate}%`}</div>
              <div className="erp-stat-sub" style={{ color: '#10b981' }}>
                {dashboardStats?.placedStudents ?? '—'} / {dashboardStats?.eligibleCohort ?? '—'} eligible placed
              </div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('drives')}
              title="View recruitment drives"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Highest CTC</span>
                <DollarSign size={18} color="#f59e0b" />
              </div>
              <div className="erp-stat-val">{dashboardStats?.highestCTC == null ? '—' : `₹${dashboardStats.highestCTC} LPA`}</div>
              <div className="erp-stat-note">Based on persisted placement records</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('stats')}
              title="View package metrics"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Average Package</span>
                <Award size={18} color="#3b82f6" />
              </div>
              <div className="erp-stat-val">{dashboardStats?.averageCTC == null ? '—' : `₹${dashboardStats.averageCTC} LPA`}</div>
              <div className="erp-stat-note">Median: {dashboardStats?.medianCTC == null ? '—' : `₹${dashboardStats.medianCTC} LPA`}</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('companies')}
              title="View recruiter directory"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Visiting Recruiters</span>
                <Building size={18} color="#10b981" />
              </div>
              <div className="erp-stat-val">{companies.length} Companies</div>
              <div className="erp-stat-note">Tier 1 MNCs &amp; Product Houses</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('drives')}
              title="Active campus drives"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Active Drives</span>
                <Briefcase size={18} color="#8b5cf6" />
              </div>
              <div className="erp-stat-val">{drives.length} Drives</div>
              <div className="erp-stat-note">Live screening &amp; interview rounds</div>
            </div>

            <div
              className="erp-stat-card erp-stat-card-clickable"
              onClick={() => setActiveTab('offers')}
              title="View generated offers"
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Total Job Offers</span>
                <Sparkles size={18} color="#ec4899" />
              </div>
              <div className="erp-stat-val">{dashboardStats?.totalOffers ?? '—'} Offers</div>
              <div className="erp-stat-note">{offersList.length} persisted in portal</div>
            </div>
          </div>

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 140px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB 1: CAMPUS RECRUITMENT DRIVES */}
          {activeTab === 'drives' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Active Campus Recruitment Drives</h3>
                  <p>Job specifications, deterministic eligibility cut-offs, and applicant pipeline</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-primary" onClick={() => setShowAddDriveModal(true)}>
                    <Plus size={16} /> Schedule Recruitment Drive
                  </button>
                </div>
              </div>

              <div className="erp-filter-bar">
                <div className="erp-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search drive by company, role, branch..."
                    value={driveSearch}
                    onChange={(e) => setDriveSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#64748b" />
                  <select
                    value={driveFilter}
                    onChange={(e) => setDriveFilter(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="ALL">All Drive Stages</option>
                    <option value="Registration">Registration Open</option>
                    <option value="Interview">Interview Rounds</option>
                    <option value="Shortlisting">Shortlisting Completed</option>
                  </select>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Company &amp; Role</th>
                      <th>Compensation (CTC)</th>
                      <th>Event Date &amp; Venue</th>
                      <th>Eligibility Criteria</th>
                      <th>Registered / Shortlisted</th>
                      <th>Status</th>
                      <th>Deterministic Engine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrives.map(d => (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.company}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.role}</div>
                        </td>
                        <td>
                          <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>{d.packageOffered}</strong>
                        </td>
                        <td>
                          <div>{d.driveDate}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.venue}</div>
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                            Min CGPA: <strong>{d.eligibilityCriteria?.minCgpa || 6.5}</strong> · Backlogs: Max {d.eligibilityCriteria?.maxBacklogs ?? 0}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#db2777', fontWeight: 600 }}>
                            Disciplines: {Array.isArray(d.eligibilityCriteria?.allowedBranches) ? d.eligibilityCriteria.allowedBranches.join(', ') : d.eligibilityCriteria?.allowedBranches}
                          </div>
                        </td>
                        <td>
                          <div><strong>{d.registeredCount || 0}</strong> Registered</div>
                          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                            {d.shortlistedCount || 0} Shortlisted ({d.selectedCount || 0} Offers)
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status ${d.status?.includes('Shortlisting') ? 'active' : d.status?.includes('Registration') ? 'pink' : 'warning'}`}>
                            {d.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="erp-btn-primary erp-btn-sm"
                            onClick={() => handleEvaluateDrive(d)}
                            style={{ background: 'linear-gradient(135deg, #db2777, #be185d)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Run deterministic criteria engine across student cohort"
                          >
                            <Sparkles size={12} /> Run Eligibility Engine
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: RECRUITING PARTNERS CRM */}
          {activeTab === 'companies' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Corporate Partners &amp; Recruiter Directory</h3>
                  <p>HR relationships, past campus hiring records, partner tiers, and industry MoUs</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-primary" onClick={() => setShowAddCompanyModal(true)}>
                    <Plus size={16} /> Enroll Corporate Partner
                  </button>
                </div>
              </div>

              <div className="erp-filter-bar">
                <div className="erp-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search company by name, HR contact, category..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#64748b" />
                  <select
                    value={companyTierFilter}
                    onChange={(e) => setCompanyTierFilter(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="ALL">All Partner Tiers</option>
                    <option value="Dream">Super Dream / Dream Tier</option>
                    <option value="Tier 1">Tier 1 IT Services</option>
                    <option value="Active">Active Partners</option>
                  </select>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Industry Category</th>
                      <th>HR Point of Contact</th>
                      <th>Typical CTC Range</th>
                      <th>Past Alumni Hired</th>
                      <th>Partner Tier &amp; MoU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map(c => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.officeLocation || 'Pan-India'}</div>
                        </td>
                        <td style={{ color: '#475569' }}>{c.category}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.hrContact}</div>
                          <div style={{ fontSize: '0.74rem', color: '#db2777', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={11} /> {c.email}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#f59e0b' }}>{c.packageRange}</strong>
                        </td>
                        <td>
                          <strong>{c.totalHiredFromCampus || 0} Engineers</strong>
                        </td>
                        <td>
                          <span className={`badge-status ${(c.tier || c.status)?.includes('Dream') ? 'warning' : 'active'}`}>
                            {c.tier || c.status}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            MoU: {c.mouStatus || 'Active'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: APPLICANT TRACKING SYSTEM (ATS PIPELINE) */}
          {activeTab === 'applicants' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Applicant Tracking System (ATS Pipeline)</h3>
                  <p>Student candidate progress across screening, technical rounds, HR evaluations, and selection decisions</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-secondary" onClick={exportAtsCSV}>
                    <Download size={14} /> Export ATS Manifest
                  </button>
                </div>
              </div>

              <div className="erp-filter-bar">
                <div className="erp-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search applicant by student, reg no, company..."
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#64748b" />
                  <select
                    value={applicantStageFilter}
                    onChange={(e) => setApplicantStageFilter(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      background: '#ffffff',
                    }}
                  >
                    <option value="ALL">All Pipeline Stages</option>
                    <option value="Technical">Technical Rounds</option>
                    <option value="HR">HR Interview</option>
                    <option value="Selected">Selected Candidates</option>
                    <option value="Offer">Offer Released</option>
                  </select>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Student Candidate</th>
                      <th>Branch &amp; CGPA</th>
                      <th>Applied Drive &amp; Role</th>
                      <th>Current Round Stage</th>
                      <th>Interviewer Notes / Score</th>
                      <th>Status / Outcome</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map(app => (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.studentName}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#db2777', fontWeight: 600 }}>Reg: {app.regNo}</div>
                        </td>
                        <td>
                          <div>{app.branch}</div>
                          <strong style={{ color: '#10b981' }}>CGPA {app.cgpa}</strong>
                        </td>
                        <td>
                          <strong>{app.company}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{app.role}</div>
                        </td>
                        <td>
                          <div style={{ color: '#0284c7', fontWeight: 700 }}>{app.stage}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem', color: '#334155', maxWidth: '240px', lineHeight: '1.3' }}>
                            {app.interviewerNotes || 'Evaluation in progress'}
                          </div>
                          {app.roundScore && (
                            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                              Score: {app.roundScore}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge-status ${(app.status || '').includes('Offer') ? 'active' : (app.status || '').includes('Selected') ? 'pink' : 'warning'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              className="erp-btn-secondary erp-btn-sm"
                              onClick={() => {
                                setSelectedAppForAdvance(app);
                                setAdvanceStageForm({
                                  nextStage: app.stage.includes('Technical Round 1') ? 'Technical Round 2 Cleared' : app.stage.includes('Technical Round 2') ? 'HR Interview Cleared' : 'Selected',
                                  nextStatus: app.stage.includes('Technical Round 2') ? 'In Interview Pipeline' : 'Selected',
                                  notes: '',
                                  score: '9.0 / 10',
                                });
                                setShowAdvanceStageModal(true);
                              }}
                            >
                              Advance Stage
                            </button>
                            {!app.status.includes('Offer') && (
                              <button
                                className="erp-btn-primary erp-btn-sm"
                                onClick={() => {
                                  setSelectedAppForOffer(app);
                                  setReleaseOfferForm({
                                    packageOffered: app.ctcOffered || '₹7.5 LPA',
                                    joiningDate: '2027-07-01',
                                    validityDeadline: '2026-12-15',
                                  });
                                  setShowReleaseOfferModal(true);
                                }}
                              >
                                Release Offer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: JOB OFFERS & OUTCOMES */}
          {activeTab === 'offers' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Offer Letters &amp; Joining Lifecycle</h3>
                  <p>Certified corporate employment contracts, CTC breakdown, student acceptance tracking, and digital letter generation</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-secondary" onClick={exportOffersCSV}>
                    <Download size={14} /> Export Offers CSV
                  </button>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Offer Token</th>
                      <th>Student Candidate</th>
                      <th>Company &amp; Role</th>
                      <th>Package (CTC)</th>
                      <th>Joining Date</th>
                      <th>Validity Deadline</th>
                      <th>Acceptance Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offersList.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.id}</strong>
                          <div style={{ fontSize: '0.7rem', color: '#db2777', fontWeight: 600 }}>{o.offerToken}</div>
                        </td>
                        <td>
                          <strong>{o.studentName}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {o.regNo}</div>
                        </td>
                        <td>
                          <strong>{o.company}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{o.role}</div>
                        </td>
                        <td>
                          <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>{o.packageOffered}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.joiningDate}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.validityDeadline}</div>
                        </td>
                        <td>
                          <span className={`badge-status ${o.status.includes('Accepted') ? 'active' : 'pink'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              className="erp-btn-secondary erp-btn-sm"
                              onClick={() => {
                                setSelectedOfferForPrint(o);
                                setShowPrintOfferModal(true);
                              }}
                            >
                              View Offer Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PLACEMENT ANALYTICS & INSTITUTIONAL REPORTING */}
          {activeTab === 'stats' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Autonomous Institutional Placement Statistics</h3>
                  <p>Branch-wise conversion rates, cohort placement percentages, and verified package distributions</p>
                </div>
                <div className="erp-panel-actions">
                  <button className="erp-btn-secondary" onClick={() => window.print()}>
                    <Printer size={14} /> Print Analytics
                  </button>
                  <button className="erp-btn-primary" onClick={exportCensusCSV}>
                    <Download size={14} /> Download Placement Census
                  </button>
                </div>
              </div>

              <div className="erp-content-body">
                {/* Cohort Formula Explanation Box */}
                <div style={{
                  background: '#fdf2f8',
                  border: '1px solid #fbcfe8',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                  <div>
                    <strong style={{ color: '#be185d', fontSize: '0.9rem' }}>Institutional Metric Calculation Standard:</strong>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                      Placement Rate = unique placed students ÷ eligible cohort × 100. Current result: <strong>{dashboardStats?.placementRate == null ? 'Unavailable' : `${dashboardStats.placementRate}%`}</strong> ({dashboardStats?.placedStudents ?? '—'} ÷ {dashboardStats?.eligibleCohort ?? '—'}).
                    </div>
                  </div>
                  <div style={{ fontSize: '0.74rem', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fbcfe8', fontWeight: 600, color: '#be185d' }}>
                    Total Offers Generated: {dashboardStats?.totalOffers ?? 'Unavailable'}
                  </div>
                </div>

                {/* Branch-Wise Matrix Table */}
                <div style={{ marginTop: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#0f172a' }}>
                    Branch-Wise Placement Conversion Breakdown (Graduation Batch 2026-27)
                  </h4>
                  <div className="erp-table-responsive">
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Academic Department / Branch</th>
                          <th>Eligible Cohort</th>
                          <th>Students Placed</th>
                          <th>Total Offers</th>
                          <th>Placement Rate</th>
                          <th>Average CTC</th>
                          <th>Highest Verified CTC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardStats?.branchStats || []).map(b => (
                          <tr key={b.code}>
                            <td>
                              <strong>{b.branch}</strong>
                              <div style={{ fontSize: '0.74rem', color: '#db2777', fontWeight: 700 }}>{b.code}</div>
                            </td>
                            <td>{b.eligible} Candidates</td>
                            <td><strong style={{ color: '#10b981' }}>{b.placed} Placed</strong></td>
                            <td>{b.offers} Offers</td>
                            <td>
                              <strong style={{ color: '#db2777' }}>{b.placementRate}%</strong>
                              <div style={{ width: '80px', height: '5px', background: '#e2e8f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${b.placementRate}%`, height: '100%', background: '#db2777' }}></div>
                              </div>
                            </td>
                            <td>{b.avgCTC}</td>
                            <td><strong style={{ color: '#f59e0b' }}>{b.highestCTC}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Package Tier Distribution */}
                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {(dashboardStats?.tierStats || []).map(t => (
                    <div
                      key={t.tier}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{t.tier}</strong>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#db2777', margin: '6px 0' }}>
                        {t.offersCount} Offers ({t.percentage}%)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Participating Corporate Partners: <strong>{t.companiesCount} Companies</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="placement" />
          )}
        </div>
          </>
        )}
      </main>

      {/* MODAL 1: SCHEDULE RECRUITMENT DRIVE */}
      {showAddDriveModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card">
            <div className="erp-modal-header">
              <h3>Schedule Campus Recruitment Drive</h3>
              <button
                type="button"
                onClick={() => setShowAddDriveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDrive}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon Development Centre"
                      value={newDriveForm.company}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, company: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Job Designation / Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Graduate Software Development Engineer"
                      value={newDriveForm.role}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, role: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Annual Compensation (CTC in LPA) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newDriveForm.packageLPA}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, packageLPA: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Minimum CGPA Cutoff</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newDriveForm.minCgpa}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, minCgpa: e.target.value })}
                    />
                  </div>
                </div>
                <div className="erp-form-group">
                  <label>Allowed Academic Branches (Comma-separated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE, ECE, EEE"
                    value={newDriveForm.allowedBranches}
                    onChange={(e) => setNewDriveForm({ ...newDriveForm, allowedBranches: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Drive Date</label>
                    <input
                      type="date"
                      value={newDriveForm.driveDate}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, driveDate: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Campus Venue</label>
                    <input
                      type="text"
                      placeholder="e.g. Auditorium / Computing Complex"
                      value={newDriveForm.venue}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, venue: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddDriveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENROLL CORPORATE PARTNER */}
      {showAddCompanyModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card">
            <div className="erp-modal-header">
              <h3>Enroll Corporate Recruiting Partner</h3>
              <button
                type="button"
                onClick={() => setShowAddCompanyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCompany}>
              <div className="erp-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Company Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Microsoft India"
                      value={newCompanyForm.name}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Industry Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Cloud & Software Products"
                      value={newCompanyForm.category}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, category: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>HR Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={newCompanyForm.hrContact}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, hrContact: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Official HR Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="university.relations@microsoft.com"
                      value={newCompanyForm.email}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Package Range</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹14.0 LPA - ₹28.0 LPA"
                      value={newCompanyForm.packageRange}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, packageRange: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Partner Tier</label>
                    <select
                      value={newCompanyForm.tier}
                      onChange={(e) => setNewCompanyForm({ ...newCompanyForm, tier: e.target.value })}
                    >
                      <option value="Super Dream Recruiter">Super Dream Recruiter (₹12+ LPA)</option>
                      <option value="Dream Recruiter">Dream Recruiter (₹6 - ₹12 LPA)</option>
                      <option value="Tier 1 IT Services">Tier 1 IT Services</option>
                      <option value="Core Engineering">Core Engineering</option>
                      <option value="Active Partner">Active Partner</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAddCompanyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Enroll Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DETERMINISTIC ELIGIBILITY ENGINE PREVIEW */}
      {selectedDriveForEligibility && (() => {
        const evaluatedCandidates = eligibilityResult?.evaluated || [];
        const eligibleList = evaluatedCandidates.filter(c => c.isEligible);
        const ineligibleList = evaluatedCandidates.filter(c => !c.isEligible);

        return (
          <div className="erp-modal-overlay">
            <div className="erp-modal-card" style={{ maxWidth: '820px' }}>
              <div className="erp-modal-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#db2777', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                      DETERMINISTIC ELIGIBILITY ENGINE
                    </span>
                    <h3 style={{ margin: 0 }}>
                      {selectedDriveForEligibility.company} — {selectedDriveForEligibility.role}
                    </h3>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Package: <strong style={{ color: '#f59e0b' }}>{selectedDriveForEligibility.packageOffered}</strong> · Scheduled: {selectedDriveForEligibility.driveDate}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDriveForEligibility(null)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="erp-modal-body">
                {/* Criteria Matrix */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Min CGPA Cutoff</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7' }}>
                      {selectedDriveForEligibility.eligibilityCriteria?.minCgpa || 6.5}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Allowed Backlogs</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7' }}>
                      Max {selectedDriveForEligibility.eligibilityCriteria?.maxBacklogs ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Eligible Disciplines</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                      {Array.isArray(selectedDriveForEligibility.eligibilityCriteria?.allowedBranches) ? selectedDriveForEligibility.eligibilityCriteria.allowedBranches.join(', ') : selectedDriveForEligibility.eligibilityCriteria?.allowedBranches}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Attendance Cutoff</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>75% Minimum</div>
                  </div>
                </div>

                {/* Eligible Students List */}
                <div>
                  <h4 style={{ margin: '0 0 8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem' }}>
                    <CheckCircle size={15} /> Eligible Qualified Candidates ({eligibleList.length} Students)
                  </h4>
                  {eligibleList.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No students meet all eligibility parameters for this drive.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {eligibleList.map(({ student }) => (
                        <div
                          key={student.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                        >
                          <div>
                            <strong>{student.name}</strong> <span style={{ fontSize: '0.76rem', color: '#64748b' }}>({student.rollNumber || student.rollNo})</span>
                            <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                              Dept: {student.department} · CGPA: <strong style={{ color: '#10b981' }}>{student.cgpa}</strong> · Attendance: {student.attendance}%
                            </div>
                          </div>
                          <button
                            type="button"
                            className="erp-btn-primary erp-btn-sm"
                            onClick={() => handleShortlistCandidate(student, selectedDriveForEligibility)}
                            style={{ background: '#10b981' }}
                          >
                            Shortlist for ATS
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ineligible Students List with Explanations */}
                <div>
                  <h4 style={{ margin: '0 0 8px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem' }}>
                    <Clock size={15} /> Ineligible Students with Deterministic Reason ({ineligibleList.length} Students)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {ineligibleList.map(({ student, reasons }) => (
                      <div
                        key={student.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}
                      >
                        <div>
                          <strong>{student.name}</strong> <span style={{ fontSize: '0.76rem', color: '#64748b' }}>({student.rollNumber || student.rollNo})</span>
                          <div style={{ fontSize: '0.72rem', color: '#b91c1c' }}>
                            Failed: {reasons.join(' · ')}
                          </div>
                        </div>
                        <span className="badge-status danger">Disqualified</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setSelectedDriveForEligibility(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 4: ADVANCE APPLICANT STAGE (ATS) */}
      {showAdvanceStageModal && selectedAppForAdvance && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card" style={{ maxWidth: '480px' }}>
            <div className="erp-modal-header">
              <h3>Advance Round: {selectedAppForAdvance.studentName}</h3>
              <button
                type="button"
                onClick={() => setShowAdvanceStageModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdvanceStageSubmit}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Next Recruitment Round Stage</label>
                  <select
                    value={advanceStageForm.nextStage}
                    onChange={(e) => setAdvanceStageForm({ ...advanceStageForm, nextStage: e.target.value })}
                  >
                    <option value="Technical Round 1 Cleared">Technical Round 1 Cleared</option>
                    <option value="Technical Round 2 Cleared">Technical Round 2 Cleared</option>
                    <option value="HR Interview Cleared">HR Interview Cleared</option>
                    <option value="Selected for Job Offer">Selected for Job Offer</option>
                    <option value="Rejected / Exited">Rejected / Exited</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>Interviewer Panel Score</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 / 10"
                    value={advanceStageForm.score}
                    onChange={(e) => setAdvanceStageForm({ ...advanceStageForm, score: e.target.value })}
                  />
                </div>
                <div className="erp-form-group">
                  <label>Technical / HR Evaluation Feedback Notes</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Strong system architecture design and clear algorithmic problem solving."
                    value={advanceStageForm.notes}
                    onChange={(e) => setAdvanceStageForm({ ...advanceStageForm, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowAdvanceStageModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  Update Candidate Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RELEASE OFFICIAL JOB OFFER */}
      {showReleaseOfferModal && selectedAppForOffer && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card" style={{ maxWidth: '480px' }}>
            <div className="erp-modal-header">
              <h3>Issue Placement Offer: {selectedAppForOffer.studentName}</h3>
              <button
                type="button"
                onClick={() => setShowReleaseOfferModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReleaseOfferSubmit}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label>Company &amp; Role</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedAppForOffer.company} — ${selectedAppForOffer.role}`}
                  />
                </div>
                <div className="erp-form-group">
                  <label>Agreed Compensation (CTC)</label>
                  <input
                    type="text"
                    required
                    value={releaseOfferForm.packageOffered}
                    onChange={(e) => setReleaseOfferForm({ ...releaseOfferForm, packageOffered: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="erp-form-group">
                    <label>Tentative Joining Date</label>
                    <input
                      type="date"
                      value={releaseOfferForm.joiningDate}
                      onChange={(e) => setReleaseOfferForm({ ...releaseOfferForm, joiningDate: e.target.value })}
                    />
                  </div>
                  <div className="erp-form-group">
                    <label>Offer Validity Deadline</label>
                    <input
                      type="date"
                      value={releaseOfferForm.validityDeadline}
                      onChange={(e) => setReleaseOfferForm({ ...releaseOfferForm, validityDeadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="erp-modal-footer">
                <button type="button" className="erp-btn-secondary" onClick={() => setShowReleaseOfferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary" style={{ background: '#10b981' }}>
                  Create Offer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: VIEW & PRINT DIGITAL OFFER LETTER */}
      {showPrintOfferModal && selectedOfferForPrint && (
        <div className="erp-modal-overlay">
          <div className="erp-modal-card" style={{ maxWidth: '580px' }}>
            <div className="erp-modal-header">
              <h3>Campus Placement Offer Record</h3>
              <button
                type="button"
                onClick={() => setShowPrintOfferModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="erp-modal-body">
              <div className="digital-offer-card">
                <div className="offer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>APNA CAMPUS</h3>
                      <span style={{ fontSize: '0.76rem', color: '#db2777', fontWeight: 600 }}>Placement Offer Record</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#db2777' }}>{selectedOfferForPrint.id}</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Recorded: {selectedOfferForPrint.issuedAt || selectedOfferForPrint.issuedDate || '—'}</div>
                  </div>
                </div>

                <div className="offer-field-grid">
                  <div className="offer-field">
                    <label>Candidate Name</label>
                    <strong>{selectedOfferForPrint.studentName}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Registration Number</label>
                    <strong style={{ color: '#db2777' }}>{selectedOfferForPrint.regNo}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Selected Employer</label>
                    <strong>{selectedOfferForPrint.company}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Designation / Role</label>
                    <strong>{selectedOfferForPrint.role}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Compensation Package</label>
                    <strong style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{selectedOfferForPrint.packageOffered}</strong>
                  </div>
                  <div className="offer-field">
                    <label>Expected Joining Date</label>
                    <strong>{selectedOfferForPrint.joiningDate}</strong>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569', lineHeight: '1.4' }}>
                  This is a placement offer record stored in Apna Campus. It is not a signed employer letter, and no delivery to the student or employer is recorded.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>Offer Token: <strong>{selectedOfferForPrint.offerToken}</strong></span>
                  <span className={`badge-status ${selectedOfferForPrint.status.includes('Accepted') ? 'active' : 'pink'}`}>
                    {selectedOfferForPrint.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="erp-modal-footer">
              <button type="button" className="erp-btn-secondary" onClick={() => setShowPrintOfferModal(false)}>
                Close
              </button>
              <button
                type="button"
                className="erp-btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Offer Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
