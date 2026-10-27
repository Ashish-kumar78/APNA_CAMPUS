import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  X,
  AlertCircle,
  Building,
  Check,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import './ScholarshipApplyPage.css';
import {
  INITIAL_SCHOLARSHIP_SCHEMES,
  INITIAL_APPLICATIONS,
  SCHOLARSHIP_OFFICER
} from '../components/ScholarshipModules/scholarshipData.js';

export default function ScholarshipApplyPage({ account, onNavigate }) {
  // Tabs: 'schemes', 'my_applications', 'guidelines'
  const [activeTab, setActiveTab] = useState('schemes');

  // Persistence State
  const [schemes] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_schemes');
      return stored ? JSON.parse(stored) : INITIAL_SCHOLARSHIP_SCHEMES;
    } catch {
      return INITIAL_SCHOLARSHIP_SCHEMES;
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem('apna_scholarship_applications');
      return stored ? JSON.parse(stored) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);

  // Stepper state in Apply Modal (1: Profile, 2: Financial/Bank, 3: Docs, 4: Declaration)
  const [applyStep, setApplyStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const studentRoll = account?.registrationNumber || account?.rollNumber || '2305201001';
  const studentName = account?.name || 'Rakesh Das';
  const studentDept = account?.department || 'Computer Science & Engineering';
  const studentSem = account?.currentSemester ? `Semester ${account.currentSemester}` : 'Semester 5';
  const studentCgpa = account?.cgpa || 8.85;

  const [formData, setFormData] = useState({
    schemeId: '',
    schemeName: '',
    annualIncome: '180000',
    category: 'OBC',
    gender: 'Male',
    fatherName: 'S. N. Das',
    fatherOccupation: 'Agriculture & Small Business',
    bankName: 'State Bank of India',
    bankBranch: 'Campus Autonomous Extension Counter',
    accountNumber: '38920194829',
    ifscCode: 'SBIN0010243',
    applicationType: 'New',
    uploadedDocs: {
      incomeCert: 'Income_Certificate_Tehsildar.pdf',
      marksheet: 'Semester_4_Autonomous_Marksheet.pdf',
      casteCert: 'OBC_State_Reservation_Cert.pdf',
      bankPassbook: 'SBI_Passbook_Front_Page.pdf',
      aadhaar: 'Aadhaar_Card_Verified.pdf'
    },
    declarationAccepted: false,
  });

  // Filter student's applications (matches student's roll or default sample Rakesh Das)
  const studentApplications = applications.filter(
    (app) => app.studentId === studentRoll || app.studentName?.toLowerCase() === studentName.toLowerCase()
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenApplyModal = (scheme) => {
    setSelectedSchemeForApply(scheme);
    setFormData((prev) => ({
      ...prev,
      schemeId: scheme.id,
      schemeName: scheme.name,
      applicationType: scheme.name.toLowerCase().includes('prerana') ? 'Renewal' : 'New',
    }));
    setApplyStep(1);
    setIsApplyModalOpen(true);
  };

  const handleNextStep = () => {
    if (applyStep === 1) {
      if (!formData.schemeId) {
        alert('Please select a scheme to proceed.');
        return;
      }
    } else if (applyStep === 2) {
      if (!formData.accountNumber || !formData.ifscCode) {
        alert('Please provide complete bank account details for DBT subsidy credit.');
        return;
      }
    }
    setApplyStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setApplyStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    if (!formData.declarationAccepted) {
      alert('Please check the mandatory self-declaration affirmation checkbox to submit.');
      return;
    }

    setSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppId = `APP-2026-${randomSuffix}`;

    const newApplication = {
      id: newAppId,
      studentId: studentRoll,
      studentName: studentName,
      dept: studentDept,
      semester: studentSem,
      cgpa: Number(studentCgpa),
      annualFamilyIncome: Number(formData.annualIncome),
      category: formData.category,
      gender: formData.gender,
      schemeId: formData.schemeId,
      schemeName: formData.schemeName,
      applicationType: formData.applicationType,
      submissionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      completeness: '100% Complete',
      eligibilityStatus: 'Eligible',
      verificationStatus: 'Under Scrutiny',
      reviewStatus: 'Submitted',
      approvalStage: 'Application Submitted & Registered',
      recommendedAmount: selectedSchemeForApply?.awardAmount || 45000,
      finalAwardAmount: selectedSchemeForApply?.awardAmount || 45000,
      assignedReviewer: SCHOLARSHIP_OFFICER.name,
      disbursementStatus: 'Awaiting Verification',
      documentsCount: 5,
      reviewerRemarks: 'Application successfully submitted through Student Portal. Awaiting department document verification.'
    };

    setTimeout(() => {
      const updated = [newApplication, ...applications];
      setApplications(updated);
      try {
        localStorage.setItem('apna_scholarship_applications', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not store applications:', err);
      }

      setSubmitting(false);
      setIsApplyModalOpen(false);
      showToast(`Application ${newAppId} successfully submitted! Tracking docket activated.`);
      setActiveTab('my_applications');
    }, 600);
  };

  const handleDownloadReceipt = (app) => {
    const slipText = `
========================================================================
             APNA CAMPUS AUTONOMOUS HIGHER EDUCATION
          OFFICIAL SCHOLARSHIP APPLICATION ACKNOWLEDGEMENT SLIP
========================================================================
Application Reference ID : ${app.id}
Date of Submission       : ${app.submissionDate}
Student Name             : ${app.studentName}
Registration / Roll No   : ${app.studentId}
Department               : ${app.dept} (${app.semester})
Academic CGPA            : ${app.cgpa}

Scholarship Scheme       : ${app.schemeName}
Application Type         : ${app.applicationType}
Grant / Subsidy Amount   : ₹${app.recommendedAmount?.toLocaleString('en-IN') || '45,000'} / year
Current Scrutiny Status  : ${app.reviewStatus}
Approval Stage           : ${app.approvalStage}
Reviewing Directorate    : ${app.assignedReviewer || SCHOLARSHIP_OFFICER.name}

Supporting Uploads       : Verified (${app.documentsCount || 5} Dossiers Registered)
Official Notice          : Keep this acknowledgement slip for college welfare records.
========================================================================
Generated on ${new Date().toLocaleString()} · Apna Campus ERP Portal
    `.trim();

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Scholarship_Acknowledgement_${app.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded Acknowledgement Slip for ${app.id}`);
  };

  // Filtered schemes
  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fundingSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="sch-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
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
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Hero Banner */}
      <div className="sch-hero">
        <div className="sch-hero-top">
          <div>
            <div className="sch-hero-badge">
              <Sparkles size={13} />
              <span>Student Financial Aid &amp; Welfare Directorate</span>
            </div>
            <h1>Scholarship &amp; Financial Aid Portal</h1>
            <p className="sch-hero-subtitle">
              Apply for government welfare grants (PRERANA, NSP), institutional merit fellowships,
              fee waivers, and private endowments with instant digital document verification.
            </p>
          </div>

          <div className="sch-hero-actions">
            <button
              type="button"
              className="sch-primary-btn"
              onClick={() => {
                const firstAvailable = schemes[0] || INITIAL_SCHOLARSHIP_SCHEMES[0];
                handleOpenApplyModal(firstAvailable);
              }}
            >
              <Plus size={16} />
              <span>Apply for Scholarship</span>
            </button>
            <button
              type="button"
              className="sch-secondary-btn"
              onClick={() => setActiveTab('my_applications')}
            >
              <Clock size={16} />
              <span>Track My Applications ({studentApplications.length})</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="sch-kpi-grid">
          <div className="sch-kpi-card">
            <div className="sch-kpi-icon">
              <Award size={22} />
            </div>
            <div className="sch-kpi-info">
              <small>Available Schemes</small>
              <strong>{schemes.length} Active Schemes</strong>
            </div>
          </div>

          <div className="sch-kpi-card">
            <div className="sch-kpi-icon" style={{ color: '#10b981' }}>
              <FileCheck size={22} />
            </div>
            <div className="sch-kpi-info">
              <small>My Applications</small>
              <strong>{studentApplications.length} Registered</strong>
            </div>
          </div>

          <div className="sch-kpi-card">
            <div className="sch-kpi-icon" style={{ color: '#f59e0b' }}>
              <TrendingUp size={22} />
            </div>
            <div className="sch-kpi-info">
              <small>Maximum Grant Potential</small>
              <strong>₹75,000 / year</strong>
            </div>
          </div>

          <div className="sch-kpi-card">
            <div className="sch-kpi-icon" style={{ color: '#a855f7' }}>
              <ShieldCheck size={22} />
            </div>
            <div className="sch-kpi-info">
              <small>Welfare Clearance Desk</small>
              <strong>{SCHOLARSHIP_OFFICER.name}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="sch-tabs-container">
        <div className="sch-nav-tabs">
          <button
            type="button"
            className={`sch-nav-tab ${activeTab === 'schemes' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemes')}
          >
            <Award size={16} />
            <span>Available Scholarship Schemes</span>
            <span className="sch-nav-tab-badge">{filteredSchemes.length}</span>
          </button>

          <button
            type="button"
            className={`sch-nav-tab ${activeTab === 'my_applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('my_applications')}
          >
            <Clock size={16} />
            <span>My Applications &amp; Status</span>
            <span className="sch-nav-tab-badge">{studentApplications.length}</span>
          </button>

          <button
            type="button"
            className={`sch-nav-tab ${activeTab === 'guidelines' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidelines')}
          >
            <BookOpen size={16} />
            <span>Eligibility &amp; Document Checklist</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AVAILABLE SCHOLARSHIP SCHEMES */}
      {activeTab === 'schemes' && (
        <div>
          {/* Search & Filter Bar */}
          <div className="sch-filter-bar">
            <div className="sch-search-wrap">
              <Search className="sch-search-icon" size={16} />
              <input
                type="text"
                className="sch-search-input"
                placeholder="Search schemes by name, sponsor, category, or authority..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="sch-filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Funding Types</option>
              <option value="Government">Government (State &amp; Central)</option>
              <option value="Institutional">Institutional (Apna Campus)</option>
              <option value="Private/Sponsored">Corporate CSR &amp; Alumni</option>
            </select>
          </div>

          {/* Scheme Cards Grid */}
          <div className="sch-schemes-grid">
            {filteredSchemes.map((scheme) => {
              const alreadyApplied = studentApplications.some((a) => a.schemeId === scheme.id);
              const tagClass =
                scheme.type === 'Government'
                  ? 'sch-tag-gov'
                  : scheme.type === 'Institutional'
                  ? 'sch-tag-inst'
                  : 'sch-tag-corp';

              return (
                <div key={scheme.id} className="sch-scheme-card">
                  <div>
                    <div className="sch-scheme-header">
                      <span className={`sch-tag ${tagClass}`}>{scheme.type}</span>
                      <span
                        className={`sch-status-badge ${
                          scheme.status === 'Closing Soon' ? 'sch-status-closing' : 'sch-status-open'
                        }`}
                      >
                        {scheme.status}
                      </span>
                    </div>

                    <h3 className="sch-scheme-title">{scheme.name}</h3>
                    <div className="sch-scheme-sponsor">
                      <Building size={14} />
                      <span>{scheme.sponsorName}</span>
                    </div>

                    <p className="sch-scheme-desc">{scheme.description}</p>

                    <div className="sch-scheme-award-box">
                      <span className="sch-award-label">Annual Benefit</span>
                      <strong className="sch-award-value">₹{scheme.awardAmount.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="sch-criteria-list">
                      <div className="sch-criteria-item">
                        <span>Min CGPA:</span>
                        <strong>{scheme.minCgpa ? `${scheme.minCgpa} CGPA` : 'Open'}</strong>
                      </div>
                      <div className="sch-criteria-item">
                        <span>Income Ceiling:</span>
                        <strong>
                          {scheme.incomeCeiling ? `₹${(scheme.incomeCeiling / 100000).toFixed(1)} Lakhs` : 'No Ceiling'}
                        </strong>
                      </div>
                      <div className="sch-criteria-item">
                        <span>Category:</span>
                        <strong>{scheme.category}</strong>
                      </div>
                      <div className="sch-criteria-item">
                        <span>Eligible Branches:</span>
                        <strong>{scheme.eligibleDepts.join(', ')}</strong>
                      </div>
                    </div>

                    <div className="sch-docs-chips">
                      {scheme.requiredDocs?.slice(0, 3).map((doc, idx) => (
                        <span key={idx} className="sch-doc-chip">
                          • {doc}
                        </span>
                      ))}
                      {scheme.requiredDocs?.length > 3 && (
                        <span className="sch-doc-chip">+{scheme.requiredDocs.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="sch-card-footer">
                    <div className="sch-card-deadline">
                      Deadline: <strong>{scheme.closingDate}</strong>
                    </div>

                    {alreadyApplied ? (
                      <button type="button" className="sch-card-btn sch-card-btn-applied">
                        <Check size={14} /> Applied
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="sch-card-btn"
                        onClick={() => handleOpenApplyModal(scheme)}
                      >
                        <span>Apply Now</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="sch-empty-box">
              <div className="sch-empty-icon">
                <Search size={28} />
              </div>
              <h3>No scholarship schemes found</h3>
              <p>Try refining your search terms or clearing the funding type filter.</p>
              <button
                type="button"
                className="sch-secondary-btn"
                style={{ color: '#0284c7', borderColor: '#bae6fd' }}
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & STATUS TRACKING */}
      {activeTab === 'my_applications' && (
        <div>
          {studentApplications.length > 0 ? (
            <div className="sch-table-container">
              <table className="sch-table">
                <thead>
                  <tr>
                    <th>Docket ID</th>
                    <th>Scholarship Scheme</th>
                    <th>Type</th>
                    <th>Award Amount</th>
                    <th>Submission Date</th>
                    <th>Stage &amp; Review</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentApplications.map((app) => {
                    const isApproved = app.reviewStatus?.toLowerCase().includes('approved') || app.approvalStage?.includes('Sanction');
                    const isRejected = app.reviewStatus?.toLowerCase().includes('rejected');
                    const pillClass = isApproved ? 'stage-approved' : isRejected ? 'stage-rejected' : 'stage-pending';

                    return (
                      <tr key={app.id}>
                        <td>
                          <span className="sch-app-id">{app.id}</span>
                        </td>
                        <td>
                          <div className="sch-scheme-name-cell">
                            <strong>{app.schemeName}</strong>
                            <small>{app.assignedReviewer || 'Welfare Directorate'}</small>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              background: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {app.applicationType}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#0369a1', fontSize: '0.92rem' }}>
                            ₹{app.recommendedAmount?.toLocaleString('en-IN') || '45,000'}
                          </strong>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.82rem' }}>
                          {app.submissionDate}
                        </td>
                        <td>
                          <span className={`sch-stage-pill ${pillClass}`}>
                            {isApproved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                            <span>{app.approvalStage || app.reviewStatus}</span>
                          </span>
                        </td>
                        <td>
                          <div className="sch-action-btn-group">
                            <button
                              type="button"
                              className="sch-action-icon-btn"
                              title="View Full Application Dossier"
                              onClick={() => {
                                setSelectedAppForDetails(app);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className="sch-action-icon-btn"
                              title="Download Official Acknowledgement Slip"
                              onClick={() => handleDownloadReceipt(app)}
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="sch-empty-box" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div className="sch-empty-icon">
                <Award size={28} />
              </div>
              <h3>No scholarship applications submitted yet</h3>
              <p>Explore the list of active schemes and submit your application online.</p>
              <button
                type="button"
                className="sch-primary-btn"
                onClick={() => setActiveTab('schemes')}
              >
                <span>Browse Available Scholarships</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GUIDELINES & DOCUMENT CHECKLIST */}
      {activeTab === 'guidelines' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <ShieldCheck size={20} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Mandatory Documents Checklist</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Ensure high-resolution, clear PDF/JPEG scans (under 2MB each) are uploaded during your submission.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { title: 'Income Certificate', desc: 'Issued by Revenue Officer / Tehsildar (Valid for FY 2026-27).' },
                { title: 'Caste & Category Certificate', desc: 'SC/ST/OBC/SEBC/EWS certificate from competent authority.' },
                { title: 'Previous Semester Marksheet', desc: 'Autonomous Controller of Exams verified marks transcript.' },
                { title: 'Aadhaar Card Copy', desc: 'Linked with active mobile number and bank account.' },
                { title: 'Bank Passbook Front Page', desc: 'Showing clear IFSC, Account Number & Applicant Name.' },
                { title: 'Hostel Resident Certificate', desc: 'Required specifically for Scholarship Hosteller applications.' },
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{item.title}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Building size={20} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Directorate Welfare Helpdesk</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              For queries regarding state portal biometric KYC, DBT credit issues, or institutional fellowship criteria:
            </p>

            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bae6fd', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.95rem', marginBottom: '4px' }}>
                {SCHOLARSHIP_OFFICER.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#0284c7', marginBottom: '8px' }}>
                {SCHOLARSHIP_OFFICER.designation} · {SCHOLARSHIP_OFFICER.department}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                📍 {SCHOLARSHIP_OFFICER.office}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '4px' }}>
                📧 {SCHOLARSHIP_OFFICER.email} | 📞 {SCHOLARSHIP_OFFICER.phone}
              </div>
            </div>

            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: '#0f172a' }}>Important State Portal Links:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="https://scholarship.odisha.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0284c7',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>State Scholarship Portal (PRERANA / Medhabruti)</span>
                <ArrowRight size={14} />
              </a>
              <a
                href="https://scholarships.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#0284c7',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>National Scholarship Portal (NSP Central Sector)</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: APPLY SCHOLARSHIP MULTI-STEP WIZARD                          */}
      {/* ===================================================================== */}
      {isApplyModalOpen && (
        <div className="sch-modal-overlay" onClick={() => setIsApplyModalOpen(false)}>
          <div className="sch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sch-modal-header">
              <div className="sch-modal-title-wrap">
                <h2>Scholarship Application Form · 2026–27</h2>
                <p>{formData.schemeName || 'Institutional Welfare Scheme'}</p>
              </div>
              <button
                type="button"
                className="sch-modal-close-btn"
                onClick={() => setIsApplyModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sch-modal-body">
              {/* Stepper Header */}
              <div className="sch-stepper">
                <div
                  className={`sch-step-node ${applyStep >= 1 ? (applyStep > 1 ? 'done' : 'active') : ''}`}
                  onClick={() => setApplyStep(1)}
                >
                  <div className="sch-step-circle">1</div>
                  <span className="sch-step-label">Academic Info</span>
                </div>
                <div
                  className={`sch-step-node ${applyStep >= 2 ? (applyStep > 2 ? 'done' : 'active') : ''}`}
                  onClick={() => setApplyStep(2)}
                >
                  <div className="sch-step-circle">2</div>
                  <span className="sch-step-label">Family &amp; Bank</span>
                </div>
                <div
                  className={`sch-step-node ${applyStep >= 3 ? (applyStep > 3 ? 'done' : 'active') : ''}`}
                  onClick={() => setApplyStep(3)}
                >
                  <div className="sch-step-circle">3</div>
                  <span className="sch-step-label">Documents</span>
                </div>
                <div
                  className={`sch-step-node ${applyStep >= 4 ? 'active' : ''}`}
                  onClick={() => setApplyStep(4)}
                >
                  <div className="sch-step-circle">4</div>
                  <span className="sch-step-label">Declaration</span>
                </div>
              </div>

              {/* Step 1: Academic & Scheme Details */}
              {applyStep === 1 && (
                <div>
                  <div className="sch-form-grid">
                    <div className="sch-form-group full-width">
                      <label className="sch-form-label">Selected Scholarship Scheme</label>
                      <select
                        className="sch-form-select"
                        value={formData.schemeId}
                        onChange={(e) => {
                          const sc = schemes.find((s) => s.id === e.target.value);
                          setFormData({
                            ...formData,
                            schemeId: e.target.value,
                            schemeName: sc?.name || '',
                          });
                        }}
                      >
                        {schemes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (₹{s.awardAmount.toLocaleString('en-IN')}/yr - {s.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Student Name</label>
                      <input type="text" className="sch-form-input" value={studentName} disabled />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Registration / Roll No</label>
                      <input type="text" className="sch-form-input" value={studentRoll} disabled />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Department / Branch</label>
                      <input type="text" className="sch-form-input" value={studentDept} disabled />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Current Academic Semester</label>
                      <input type="text" className="sch-form-input" value={studentSem} disabled />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Cumulative CGPA</label>
                      <input type="text" className="sch-form-input" value={`${studentCgpa} (Compliant)`} disabled />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Application Nature</label>
                      <select
                        className="sch-form-select"
                        value={formData.applicationType}
                        onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                      >
                        <option value="New">Fresh New Grant Application</option>
                        <option value="Renewal">Renewal for Current Academic Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Family & Bank Account (DBT) */}
              {applyStep === 2 && (
                <div>
                  <div className="sch-form-grid">
                    <div className="sch-form-group">
                      <label className="sch-form-label">Social Reservation Category</label>
                      <select
                        className="sch-form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="General">General / Open Merit</option>
                        <option value="OBC">OBC / SEBC</option>
                        <option value="SC">Scheduled Caste (SC)</option>
                        <option value="ST">Scheduled Tribe (ST)</option>
                        <option value="EWS">Economically Weaker Section (EWS)</option>
                      </select>
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Annual Family Income (in ₹) *</label>
                      <input
                        type="number"
                        className="sch-form-input"
                        placeholder="e.g. 180000"
                        value={formData.annualIncome}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        required
                      />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Father / Guardian Full Name</label>
                      <input
                        type="text"
                        className="sch-form-input"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Guardian Primary Occupation</label>
                      <input
                        type="text"
                        className="sch-form-input"
                        value={formData.fatherOccupation}
                        onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      />
                    </div>

                    <div className="sch-form-group full-width" style={{ marginTop: '0.5rem' }}>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: '#166534' }}>
                        💳 <strong>Direct Benefit Transfer (DBT) Bank Mandate:</strong> Scholarship subsidies are disbursed directly to your Aadhaar-linked savings bank account.
                      </div>
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Bank Name *</label>
                      <input
                        type="text"
                        className="sch-form-input"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Bank Branch *</label>
                      <input
                        type="text"
                        className="sch-form-input"
                        value={formData.bankBranch}
                        onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                      />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Savings Account Number *</label>
                      <input
                        type="text"
                        className="sch-form-input"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="sch-form-group">
                      <label className="sch-form-label">Branch IFSC Code *</label>
                      <input
                        type="text"
                        className="sch-form-input"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Document Uploads */}
              {applyStep === 3 && (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                    Uploaded certificates have been automatically linked from your student profile and verified:
                  </p>

                  <div className="sch-dropzone">
                    <UploadCloud className="sch-dropzone-icon" size={32} />
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      Drag &amp; drop updated PDFs or browse documents
                    </div>
                    <small style={{ color: '#64748b' }}>Supports PDF, JPG, PNG up to 5MB</small>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(formData.uploadedDocs).map(([key, filename]) => (
                      <div key={key} className="sch-upload-item">
                        <div className="sch-upload-name">
                          <FileText size={16} color="#0284c7" />
                          <span>{filename}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Self-Declaration */}
              {applyStep === 4 && (
                <div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#0f172a' }}>Application Summary Review</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <div>Scheme: <strong>{formData.schemeName}</strong></div>
                      <div>Applicant: <strong>{studentName} ({studentRoll})</strong></div>
                      <div>Department: <strong>{studentDept}</strong></div>
                      <div>CGPA: <strong>{studentCgpa}</strong></div>
                      <div>Annual Income: <strong>₹{Number(formData.annualIncome).toLocaleString('en-IN')}</strong></div>
                      <div>Category: <strong>{formData.category}</strong></div>
                      <div>Bank Account: <strong>{formData.accountNumber} ({formData.ifscCode})</strong></div>
                      <div>Documents: <strong>5 Files Attached</strong></div>
                    </div>
                  </div>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      color: '#334155',
                      background: '#fffbeb',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.declarationAccepted}
                      onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                      style={{ marginTop: '2px', cursor: 'pointer' }}
                    />
                    <span>
                      I solemnly affirm that the information furnished above is true and authentic. I understand that
                      providing false income or academic records will result in summary cancellation of the grant and
                      disciplinary action under Autonomous Academic Regulations.
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="sch-modal-footer">
              {applyStep > 1 && (
                <button
                  type="button"
                  className="sch-secondary-btn"
                  style={{ color: '#0f172a' }}
                  onClick={handlePrevStep}
                >
                  Previous
                </button>
              )}

              {applyStep < 4 ? (
                <button
                  type="button"
                  className="sch-primary-btn"
                  onClick={handleNextStep}
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  className="sch-primary-btn"
                  disabled={submitting || !formData.declarationAccepted}
                  onClick={handleSubmitApplication}
                >
                  {submitting ? 'Registering Docket...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: APPLICATION DOSSIER DETAILS                                  */}
      {/* ===================================================================== */}
      {isDetailsModalOpen && selectedAppForDetails && (
        <div className="sch-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="sch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sch-modal-header">
              <div className="sch-modal-title-wrap">
                <h2>Application Dossier · {selectedAppForDetails.id}</h2>
                <p>{selectedAppForDetails.schemeName}</p>
              </div>
              <button
                type="button"
                className="sch-modal-close-btn"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sch-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Applicant Roll</small>
                  <div style={{ fontWeight: 700 }}>{selectedAppForDetails.studentId}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Sanctioned Grant</small>
                  <div style={{ fontWeight: 700, color: '#0369a1' }}>
                    ₹{selectedAppForDetails.recommendedAmount?.toLocaleString('en-IN') || '45,000'} / year
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Submission Date</small>
                  <div style={{ fontWeight: 700 }}>{selectedAppForDetails.submissionDate}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b' }}>Reviewing Officer</small>
                  <div style={{ fontWeight: 700 }}>{selectedAppForDetails.assignedReviewer || SCHOLARSHIP_OFFICER.name}</div>
                </div>
              </div>

              {/* Scrutiny Timeline */}
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: '#0f172a' }}>Verification &amp; Disbursement Timeline</h4>
              <div className="sch-timeline">
                <div className="sch-timeline-step completed">
                  <div className="sch-timeline-dot" />
                  <div className="sch-timeline-title">Stage 1: Application Registered &amp; Documents Scanned</div>
                  <p className="sch-timeline-desc">Completed on {selectedAppForDetails.submissionDate}. 5 documents registered.</p>
                </div>
                <div className="sch-timeline-step completed">
                  <div className="sch-timeline-dot" />
                  <div className="sch-timeline-title">Stage 2: Departmental &amp; HOD Academic Scrutiny</div>
                  <p className="sch-timeline-desc">Syllabus progression &amp; 8.85 CGPA verified compliant.</p>
                </div>
                <div className="sch-timeline-step active">
                  <div className="sch-timeline-dot" />
                  <div className="sch-timeline-title">Stage 3: {selectedAppForDetails.approvalStage || 'Directorate Final Sanction'}</div>
                  <p className="sch-timeline-desc">{selectedAppForDetails.reviewerRemarks || 'Under executive sanction clearance.'}</p>
                </div>
                <div className="sch-timeline-step">
                  <div className="sch-timeline-dot" />
                  <div className="sch-timeline-title">Stage 4: Direct Benefit Transfer (DBT) Bank Credit</div>
                  <p className="sch-timeline-desc">Status: {selectedAppForDetails.disbursementStatus || 'Scheduled'}.</p>
                </div>
              </div>
            </div>

            <div className="sch-modal-footer">
              <button
                type="button"
                className="sch-secondary-btn"
                style={{ color: '#0f172a' }}
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="sch-primary-btn"
                onClick={() => handleDownloadReceipt(selectedAppForDetails)}
              >
                <Download size={15} />
                <span>Download Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
