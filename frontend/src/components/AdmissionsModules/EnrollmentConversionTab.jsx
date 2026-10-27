import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  Award,
  Layers,
  Building2,
  FileCheck2,
  Clock,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function EnrollmentConversionTab({
  applicants = [],
  courses = [],
  onEnrollStudent,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('All');

  // Conversion Checklist Modal
  const [conversionModalState, setConversionModalState] = useState({
    isOpen: false,
    applicant: null,
    rollNumber: '',
    section: 'Section A',
  });

  // Success summary modal
  const [convertedStudent, setConvertedStudent] = useState(null);

  // Eligible pool: candidates who are Selected, Offer Accepted, or Enrolled
  const candidatePool = applicants.filter((app) => {
    return (
      app.admissionStatus === 'Selected' ||
      app.admissionStatus === 'Offer Accepted' ||
      app.admissionStatus === 'Enrolled' ||
      app.docVerificationStatus === 'Verified'
    );
  });

  const filteredCandidates = candidatePool.filter((app) => {
    if (courseFilter !== 'All' && app.appliedCourse !== courseFilter && app.courseCode !== courseFilter) {
      return false;
    }
    if (enrollmentStatusFilter === 'Enrolled' && app.admissionStatus !== 'Enrolled') return false;
    if (enrollmentStatusFilter === 'Ready for Conversion' && app.admissionStatus === 'Enrolled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.name?.toLowerCase().includes(q) ||
        app.applicationNo?.toLowerCase().includes(q) ||
        app.enrollmentRecord?.rollNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const enrolledCount = applicants.filter((a) => a.admissionStatus === 'Enrolled').length;
  const readyForConversionCount = candidatePool.filter((a) => a.admissionStatus === 'Offer Accepted' || a.admissionStatus === 'Selected').length;

  const handleOpenConversionModal = (app) => {
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const suggestedRoll = `26${app.courseCode?.slice(-3) || 'ENG'}0${randomSuffix}`;

    setConversionModalState({
      isOpen: true,
      applicant: app,
      rollNumber: suggestedRoll,
      section: 'Section A',
    });
  };

  const handleConfirmConversion = (e) => {
    e.preventDefault();
    if (!conversionModalState.applicant) return;

    const res = onEnrollStudent &&
      onEnrollStudent(
        conversionModalState.applicant.id,
        conversionModalState.rollNumber,
        conversionModalState.section
      );

    if (res && res.success && res.data) {
      setConvertedStudent(res.data);
    }

    setConversionModalState({ isOpen: false, applicant: null, rollNumber: '', section: 'Section A' });
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Final Institutional Enrollment &amp; Student Conversion
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Transform confirmed applicants into enrolled university students, allocate academic cohorts, and provision roll numbers.
          </p>
        </div>
      </div>

      {/* Demonstration Notice */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '18px',
          fontSize: '0.8rem',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <ShieldCheck size={18} color="#0284c7" />
        <div>
          <strong>Frontend Demonstration Workflow:</strong> This interface simulates the 7-step institutional conversion pipeline. Generating registration numbers allocates mock academic records without altering production student databases.
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card green">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Fully Enrolled</span>
            <div className="adm-kpi-icon-wrap"><CheckCircle2 size={16} color="#059669" /></div>
          </div>
          <div className="adm-kpi-value">{enrolledCount}</div>
          <div className="adm-kpi-foot">Roll numbers provisioned</div>
        </div>

        <div className="adm-kpi-card teal">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Ready for Conversion</span>
            <div className="adm-kpi-icon-wrap"><UserCheck size={16} color="#0d9488" /></div>
          </div>
          <div className="adm-kpi-value">{readyForConversionCount}</div>
          <div className="adm-kpi-foot" style={{ color: '#0d9488', fontWeight: 600 }}>
            Fee &amp; Scrutiny cleared
          </div>
        </div>

        <div className="adm-kpi-card blue">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Approved Intake</span>
            <div className="adm-kpi-icon-wrap"><Building2 size={16} color="#0284c7" /></div>
          </div>
          <div className="adm-kpi-value">720</div>
          <div className="adm-kpi-foot">Session 2026-27 total</div>
        </div>

        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Intake Remaining</span>
            <div className="adm-kpi-icon-wrap"><Layers size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">{720 - enrolledCount}</div>
          <div className="adm-kpi-foot">80 Vacant across core branches</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="adm-filter-bar">
        <div className="adm-search-input-wrap">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, application ID, or assigned roll number..."
          />
        </div>

        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="All">All Disciplines</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            className="adm-select-control"
            value={enrollmentStatusFilter}
            onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
          >
            <option value="All">All Stages</option>
            <option value="Ready for Conversion">Ready for Conversion</option>
            <option value="Enrolled">Fully Enrolled</option>
          </select>
        </div>
      </div>

      {/* Confirmed Candidate List Table */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <UserCheck size={18} color="#059669" /> Confirmed Candidate Enrollment Roster ({filteredCandidates.length})
            </h3>
            <p className="adm-panel-desc">
              All listed candidates have met academic prerequisites and are eligible for institutional conversion
            </p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Applicant ID &amp; Name</th>
                <th>Course &amp; Department</th>
                <th>Documents Scrutiny</th>
                <th>Fee Verification</th>
                <th>Enrollment Status</th>
                <th>Student Roll Number</th>
                <th>Academic Section</th>
                <th style={{ textAlign: 'right' }}>Conversion Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((app) => {
                const isEnrolled = app.admissionStatus === 'Enrolled';
                const isFeeVerified = app.feeDetails?.status === 'Verified' || app.feeDetails?.status === 'Paid';
                const isDocsVerified = app.docVerificationStatus === 'Verified';

                return (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#0284c7' }}>
                        {app.applicationNo}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{app.appliedCourse}</div>
                      <div style={{ fontSize: '0.71rem', color: '#64748b' }}>Round: {app.admissionRound}</div>
                    </td>
                    <td>
                      <span
                        className={`adm-status-tag ${
                          isDocsVerified ? 'verified' : 'documents_pending'
                        }`}
                      >
                        {app.docVerificationStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`adm-status-tag ${
                          isFeeVerified ? 'verified' : 'documents_pending'
                        }`}
                      >
                        {app.feeDetails?.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`adm-status-tag ${
                          isEnrolled ? 'enrolled' : 'selected'
                        }`}
                      >
                        {isEnrolled ? 'Enrolled & Active' : 'Provisional'}
                      </span>
                    </td>
                    <td>
                      {app.enrollmentRecord?.rollNumber ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '0.86rem' }}>
                          {app.enrollmentRecord.rollNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          Not Provisioned
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                      {app.enrollmentRecord?.section || 'Pending Allocation'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!isEnrolled ? (
                        <button
                          type="button"
                          className="adm-btn-primary"
                          onClick={() => handleOpenConversionModal(app)}
                          style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        >
                          <Sparkles size={13} /> Complete Enrollment
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Enrolled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GUIDED 7-STEP ENROLLMENT CHECKLIST MODAL */}
      {conversionModalState.isOpen && (
        <div className="adm-modal-backdrop" onClick={() => setConversionModalState({ ...conversionModalState, isOpen: false })}>
          <div className="adm-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={24} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    7-Step Institutional Enrollment &amp; Conversion Checklist
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
                    Candidate: {conversionModalState.applicant?.name} ({conversionModalState.applicant?.applicationNo})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConversionModalState({ ...conversionModalState, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmConversion}>
              <div className="adm-modal-body">
                <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#475569' }}>
                  Verify that all 7 institutional enrollment conditions are certified before provisioning student credentials:
                </p>

                {/* 7 Guided Checklist Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                  <div className="adm-step-item completed">
                    <div className="adm-step-number">1</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Application Approved:</strong> Online application scrutinised and verified by Admissions Cell.
                    </div>
                  </div>

                  <div className="adm-step-item completed">
                    <div className="adm-step-number">2</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Required Documents Verified:</strong> 10th/12th marksheets, rank card, and identity documents authenticated.
                    </div>
                  </div>

                  <div className="adm-step-item completed">
                    <div className="adm-step-number">3</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Admission Conditions Satisfied:</strong> Cutoff rank, minimum marks, and mandatory subject requirements cleared.
                    </div>
                  </div>

                  <div className="adm-step-item completed">
                    <div className="adm-step-number">4</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Applicable Fees Verified:</strong> Central Accounts Directorate confirmed receipt of admission fee.
                    </div>
                  </div>

                  <div className="adm-step-item completed">
                    <div className="adm-step-number">5</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Enrollment Authorized:</strong> Admission Head (Ms. Sasmita Mohapatra) authorized institutional intake.
                    </div>
                  </div>

                  <div className="adm-step-item completed">
                    <div className="adm-step-number">6</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Student Record Prepared:</strong> Autonomous student dossier initialized in college registry.
                    </div>
                  </div>

                  <div className="adm-step-item completed">
                    <div className="adm-step-number">7</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      <strong>Registration Number &amp; Academic Allocation:</strong> Assigned Roll Number and Section configured below.
                    </div>
                  </div>
                </div>

                {/* Configuration Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                      Assigned College Roll / ID *
                    </label>
                    <input
                      type="text"
                      required
                      className="adm-search-input"
                      style={{ paddingLeft: '12px', fontFamily: 'monospace', fontWeight: 700 }}
                      value={conversionModalState.rollNumber}
                      onChange={(e) => setConversionModalState({ ...conversionModalState, rollNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                      Allocated Academic Section *
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={conversionModalState.section}
                      onChange={(e) => setConversionModalState({ ...conversionModalState, section: e.target.value })}
                    >
                      <option value="Section A">Section A (Morning Cohort)</option>
                      <option value="Section B">Section B (Afternoon Cohort)</option>
                      <option value="Section C">Section C (Honors Group)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setConversionModalState({ ...conversionModalState, isOpen: false })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn-primary"
                  style={{ background: '#0f766e' }}
                >
                  <CheckCircle2 size={16} /> Execute Conversion &amp; Issue Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERSION SUCCESS DOCKET MODAL */}
      {convertedStudent && (
        <div className="adm-modal-backdrop" onClick={() => setConvertedStudent(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '24px', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={32} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Student Successfully Enrolled</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', opacity: 0.9 }}>
                    Autonomous Campus ERP Registration Generated
                  </p>
                </div>
              </div>
            </div>

            <div className="adm-modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>Student Legal Name:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{convertedStudent.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>Assigned Roll / Registration ID:</span>
                  <span style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                    {convertedStudent.rollNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>Program Enrolled:</span>
                  <span style={{ fontWeight: 600 }}>{convertedStudent.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>College ERP ID:</span>
                  <span style={{ fontWeight: 700 }}>{convertedStudent.studentId}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', background: '#f0fdfa', padding: '12px', borderRadius: '8px', border: '1px solid #99f6e4', fontSize: '0.75rem', color: '#0f766e' }}>
                <strong>LMS Activation Token Issued:</strong> {convertedStudent.activationToken}. The student can access their new portal account immediately.
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-primary"
                onClick={() => setConvertedStudent(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
