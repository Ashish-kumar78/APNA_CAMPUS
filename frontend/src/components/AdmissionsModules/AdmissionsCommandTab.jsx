import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Calendar,
  FileCheck2,
  Receipt,
  UserCheck,
  ChevronRight,
  FileText,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import {
  ADMISSION_OFFICER,
  EXECUTIVE_KPI,
  APPLICATION_TIMELINE,
  ADMISSION_PROGRESS_FUNNEL,
  PENDING_ACTION_ITEMS,
  ADMISSION_DEADLINES,
} from './admissionsData.js';

export default function AdmissionsCommandTab({
  courses = [],
  applicants = [],
  onNavigate,
}) {
  // Compute live aggregates from store/applicants if available
  const totalApps = applicants.length > 0 ? applicants.length : EXECUTIVE_KPI.totalApplications;
  const verifiedCount = applicants.filter((a) => a.docVerificationStatus === 'Verified').length || 1180;
  const eligibleCount = applicants.filter((a) => a.eligibilityStatus === 'Eligible').length || 1180;
  const selectedCount = applicants.filter((a) => a.admissionStatus === 'Selected' || a.admissionStatus === 'Offer Accepted' || a.admissionStatus === 'Enrolled').length || 685;
  const enrolledCount = applicants.filter((a) => a.admissionStatus === 'Enrolled').length || 640;
  const pendingDocsCount = applicants.filter((a) => a.admissionStatus === 'Documents Pending' || a.docVerificationStatus === 'Pending').length || 29;
  const awaitingVerification = applicants.filter((a) => a.docVerificationStatus === 'Pending' || a.admissionStatus === 'Under Review').length || 38;

  // Course aggregate calculations
  const totalApprovedIntake = courses.reduce((acc, c) => acc + (c.approvedIntake || 0), 0) || 720;
  const totalConfirmed = courses.reduce((acc, c) => acc + (c.confirmedAdmissions || 0), 0) || 640;
  const totalVacant = Math.max(0, totalApprovedIntake - totalConfirmed);

  return (
    <div>
      {/* Officer Authorized Scope Banner */}
      <div className="adm-officer-banner">
        <div className="adm-officer-meta">
          <div className="adm-officer-avatar">SM</div>
          <div>
            <h2 className="adm-officer-title">
              {ADMISSION_OFFICER.name}
              <span className="adm-badge-pill green">
                <ShieldCheck size={12} /> Active Officer In-Charge
              </span>
            </h2>
            <p className="adm-officer-sub">
              {ADMISSION_OFFICER.designation} · {ADMISSION_OFFICER.department} · Employee ID: {ADMISSION_OFFICER.employeeCode}
            </p>
          </div>
        </div>
        <div className="adm-officer-chips">
          <span className="adm-badge-pill dark">Academic Session: 2026–2027</span>
          <span className="adm-badge-pill dark">Intake Round: Round 2 Active</span>
          <span className="adm-badge-pill dark">Approved Intake: 720 Seats</span>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => onNavigate && onNavigate('applicants')}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            Applicant Registry <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 8 Executive Summary Cards */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card blue">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Total Applications</span>
            <div className="adm-kpi-icon-wrap"><Users size={16} color="#0284c7" /></div>
          </div>
          <div className="adm-kpi-value">{totalApps.toLocaleString()}</div>
          <div className="adm-kpi-foot" style={{ color: '#0284c7', fontWeight: 600 }}>
            <TrendingUp size={13} /> Active Session 2026-27
          </div>
        </div>

        <div className="adm-kpi-card teal">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Received Today</span>
            <div className="adm-kpi-icon-wrap"><Clock size={16} color="#0d9488" /></div>
          </div>
          <div className="adm-kpi-value">+{EXECUTIVE_KPI.applicationsToday}</div>
          <div className="adm-kpi-foot">
            Across online & direct intake
          </div>
        </div>

        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Awaiting Verification</span>
            <div className="adm-kpi-icon-wrap"><AlertCircle size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">{awaitingVerification}</div>
          <div className="adm-kpi-foot" style={{ color: '#d97706', fontWeight: 600 }}>
            Queue pending scrutiny
          </div>
        </div>

        <div className="adm-kpi-card rose">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Incomplete Docs</span>
            <div className="adm-kpi-icon-wrap"><AlertTriangle size={16} color="#e11d48" /></div>
          </div>
          <div className="adm-kpi-value">{pendingDocsCount}</div>
          <div className="adm-kpi-foot" style={{ color: '#e11d48' }}>
            Flagged for resubmission
          </div>
        </div>

        <div className="adm-kpi-card green">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Eligible Applicants</span>
            <div className="adm-kpi-icon-wrap"><CheckCircle2 size={16} color="#059669" /></div>
          </div>
          <div className="adm-kpi-value">{eligibleCount.toLocaleString()}</div>
          <div className="adm-kpi-foot" style={{ color: '#059669' }}>
            Criteria & cutoffs cleared
          </div>
        </div>

        <div className="adm-kpi-card violet">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Candidates Selected</span>
            <div className="adm-kpi-icon-wrap"><Award size={16} color="#7c3aed" /></div>
          </div>
          <div className="adm-kpi-value">{selectedCount.toLocaleString()}</div>
          <div className="adm-kpi-foot">
            Round 1 & 2 allotments
          </div>
        </div>

        <div className="adm-kpi-card indigo">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Confirmed Admissions</span>
            <div className="adm-kpi-icon-wrap"><ShieldCheck size={16} color="#4f46e5" /></div>
          </div>
          <div className="adm-kpi-value">{totalConfirmed.toLocaleString()}</div>
          <div className="adm-kpi-foot" style={{ color: '#4f46e5', fontWeight: 600 }}>
            88.9% Intake Realization
          </div>
        </div>

        <div className="adm-kpi-card cyan">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Vacant Seats</span>
            <div className="adm-kpi-icon-wrap"><Layers size={16} color="#0891b2" /></div>
          </div>
          <div className="adm-kpi-value">{totalVacant}</div>
          <div className="adm-kpi-foot">
            Remaining of {totalApprovedIntake} intake
          </div>
        </div>
      </div>

      {/* SECTION A: APPLICATION STATISTICS */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <TrendingUp size={18} color="#0284c7" /> A. Application Statistics & Intake Trajectory
            </h3>
            <p className="adm-panel-desc">
              Weekly candidate submission volumes, course-wise intake demand, and completion ratios for Session 2026–27
            </p>
          </div>
          <span className="adm-badge-pill green">Completion Rate: 94.2%</span>
        </div>
        <div className="adm-panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Intake Timeline Bars */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>Applications Received Over Time (Weekly)</span>
                <span style={{ color: '#0284c7' }}>1,420 Cumulative</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {APPLICATION_TIMELINE.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.74rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>{item.week}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>+{item.count} ({item.cumulative})</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(item.cumulative / 1420) * 100}%`,
                          background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course-wise Application Distribution */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>Course-Wise Application Distribution</span>
                <span style={{ color: '#10b981' }}>7 Programs Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {courses.map((course) => {
                  const sharePct = ((course.applicationsReceived / 1420) * 100).toFixed(1);
                  return (
                    <div key={course.id} style={{ fontSize: '0.74rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ color: '#334155', fontWeight: 600 }}>{course.name} ({course.code})</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{course.applicationsReceived} ({sharePct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${sharePct * 2.5}%`,
                            background: '#0d9488',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: ADMISSION PROGRESS FUNNEL */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <Sparkles size={18} color="#7c3aed" /> B. Admission Progress & Lifecycle Funnel
            </h3>
            <p className="adm-panel-desc">
              Multi-stage progression from initial submission to scrutiny, eligibility, selection, fee clearance, and final enrollment
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Overall Conversion: <strong>{EXECUTIVE_KPI.conversionRate}</strong>
          </span>
        </div>
        <div className="adm-panel-body">
          <div className="adm-funnel-grid">
            {ADMISSION_PROGRESS_FUNNEL.map((funnel, idx) => (
              <div className="adm-funnel-item" key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: funnel.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>{funnel.stage}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: funnel.color }}>
                    {funnel.count.toLocaleString()}
                  </span>
                </div>
                <div className="adm-funnel-bar-bg">
                  <div
                    className="adm-funnel-bar-fill"
                    style={{
                      width: funnel.pct,
                      backgroundColor: funnel.color,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>{funnel.desc}</span>
                  <span style={{ fontWeight: 700 }}>{funnel.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION C: COURSE-WISE ADMISSION OVERVIEW TABLE */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <Layers size={18} color="#059669" /> C. Course-Wise Admission Overview & Matrix
            </h3>
            <p className="adm-panel-desc">
              Approved intake, applications scrutinised, eligible candidates, seats allotted, confirmed admissions, and vacancies
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => onNavigate && onNavigate('seat_matrix')}
          >
            Full Matrix &amp; Quotas <ChevronRight size={14} />
          </button>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Academic Course & Code</th>
                <th>Approved Intake</th>
                <th>Applications</th>
                <th>Eligible Pool</th>
                <th>Seats Allotted</th>
                <th>Confirmed Admissions</th>
                <th>Vacant Seats</th>
                <th>Seat Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const fillRatio = Math.round((course.confirmedAdmissions / course.approvedIntake) * 100);
                const badgeColor =
                  fillRatio >= 95 ? '#059669' : fillRatio >= 85 ? '#0284c7' : fillRatio >= 75 ? '#d97706' : '#e11d48';

                return (
                  <tr key={course.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{course.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {course.code} · {course.degree} · Fee: ₹{(course.semesterFee / 1000).toFixed(0)}k/sem
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>
                      {course.approvedIntake}
                    </td>
                    <td style={{ fontWeight: 600, color: '#0284c7', textAlign: 'center' }}>
                      {course.applicationsReceived}
                    </td>
                    <td style={{ fontWeight: 600, color: '#059669', textAlign: 'center' }}>
                      {course.eligibleApplicants}
                    </td>
                    <td style={{ fontWeight: 700, color: '#7c3aed', textAlign: 'center' }}>
                      {course.seatsAllotted}
                    </td>
                    <td style={{ fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
                      {course.confirmedAdmissions}
                    </td>
                    <td style={{ fontWeight: 700, color: course.vacantSeats > 0 ? '#b45309' : '#64748b', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: course.vacantSeats > 0 ? '#fef3c7' : '#f1f5f9',
                          color: course.vacantSeats > 0 ? '#92400e' : '#475569',
                          fontWeight: 700,
                        }}
                      >
                        {course.vacantSeats} {course.vacantSeats === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, fillRatio)}%`,
                              background: badgeColor,
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: badgeColor, minWidth: '36px' }}>
                          {fillRatio}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Grand Total Row */}
              <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                <td style={{ color: '#0f172a', fontWeight: 800 }}>Institutional Total (All Programs)</td>
                <td style={{ textAlign: 'center' }}>{totalApprovedIntake}</td>
                <td style={{ textAlign: 'center', color: '#0284c7' }}>1,420</td>
                <td style={{ textAlign: 'center', color: '#059669' }}>1,180</td>
                <td style={{ textAlign: 'center', color: '#7c3aed' }}>685</td>
                <td style={{ textAlign: 'center' }}>{totalConfirmed}</td>
                <td style={{ textAlign: 'center', color: '#b45309' }}>{totalVacant} Vacant</td>
                <td>
                  <span style={{ fontWeight: 800, color: '#059669' }}>
                    {Math.round((totalConfirmed / totalApprovedIntake) * 100)}% Overall Fill
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION D & E: PENDING ACTIONS & IMPORTANT DEADLINES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        {/* SECTION D: PENDING ACTIONS */}
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <AlertCircle size={18} color="#e11d48" /> D. Urgent Pending Actions
              </h3>
              <p className="adm-panel-desc">Scrutiny, approval, and verification queues requiring attention</p>
            </div>
            <span className="adm-badge-pill dark">5 Active Categories</span>
          </div>
          <div className="adm-panel-body" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PENDING_ACTION_ITEMS.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => onNavigate && onNavigate(item.targetTab)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                        {item.category}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: item.priority === 'Urgent' ? '#fee2e2' : '#fef3c7',
                          color: item.priority === 'Urgent' ? '#b91c1c' : '#b45309',
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                      {item.desc}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#0284c7',
                        background: '#eff6ff',
                        padding: '4px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      {item.count}
                    </span>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION E: IMPORTANT DEADLINES */}
        <div className="adm-panel-box">
          <div className="adm-panel-header">
            <div>
              <h3 className="adm-panel-title">
                <Calendar size={18} color="#0284c7" /> E. Important Admission Deadlines
              </h3>
              <p className="adm-panel-desc">Mandatory regulatory and institutional cutoff timelines</p>
            </div>
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={() => onNavigate && onNavigate('calendar_config')}
              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            >
              Full Calendar <ChevronRight size={12} />
            </button>
          </div>
          <div className="adm-panel-body" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ADMISSION_DEADLINES.map((dl) => (
                <div
                  key={dl.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    borderLeft: dl.daysLeft.includes('2 Days') ? '4px solid #ef4444' : '4px solid #0284c7',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                        {dl.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        {dl.desc}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: dl.daysLeft.includes('2 Days') ? '#fee2e2' : '#f0f9ff',
                        color: dl.daysLeft.includes('2 Days') ? '#b91c1c' : '#0284c7',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dl.daysLeft}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.73rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Cutoff: {dl.date}</span>
                    <span style={{ color: '#64748b' }}>Category: {dl.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
