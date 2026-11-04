import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Calendar,
  BarChart2,
  CreditCard,
  User,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Send,
  Clock,
  ShieldCheck,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import { getStudentComprehensiveDetails, getParentNoticesForStudent } from '../../services/parentNoticeService.js';

export default function Student360DossierModal({
  isOpen,
  onClose,
  student,
  sender,
  onOpenParentNoticeModal
}) {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'marks', 'fees', 'profile', 'notices'

  if (!isOpen || !student) return null;

  const details = getStudentComprehensiveDetails(student);
  const notices = getParentNoticesForStudent(details.studentId || details.rollNumber);

  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 99998,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}
            >
              #{details.rollNumber}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {details.name}
                </h3>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {details.semester || 'Semester 5'} · {details.section || 'Section A'}
                </span>
                {details.isCriticalShortage && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    Attendance &lt; 50%
                  </span>
                )}
                {details.fees?.hasHighDues && (
                  <span
                    style={{
                      background: '#ea580c',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    High Dues
                  </span>
                )}
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                <code>{details.registrationNumber || details.studentId}</code> · {details.department || 'Computer Science & Engineering'} · {details.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => onOpenParentNoticeModal && onOpenParentNoticeModal(details)}
              style={{
                background: details.isCriticalShortage
                  ? '#dc2626'
                  : details.fees?.hasHighDues
                  ? '#ea580c'
                  : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Send size={13} /> Send Parent Notice
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            padding: '14px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          {/* Attendance KPI */}
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Overall Attendance</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: details.isCriticalShortage ? '#dc2626' : details.isShortage ? '#d97706' : '#059669'
                }}
              >
                {details.attendance}%
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                ({details.attendedLectures}/{details.totalLectures} Classes)
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: details.isCriticalShortage ? '#dc2626' : '#64748b', marginTop: '2px' }}>
              {details.attendanceStatus}
            </div>
          </div>

          {/* Marks & CGPA KPI */}
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Academic Marks &amp; CGPA</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb' }}>
                {details.marks?.cgpa || '8.4'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                CIA: <strong>{details.marks?.totalInternal}/100</strong>
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#059669', marginTop: '2px' }}>
              Backlogs: <strong>{details.marks?.backlogCount || 0}</strong>
            </div>
          </div>

          {/* Fees & Dues KPI */}
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Fee Clearance &amp; Dues</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: details.fees?.hasHighDues ? '#dc2626' : details.fees?.dueFees > 0 ? '#d97706' : '#059669'
                }}
              >
                ₹{Number(details.fees?.dueFees || 0).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Due</span>
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: details.fees?.hasHighDues ? '#dc2626' : '#059669', marginTop: '2px' }}>
              {details.fees?.feeStatus}
            </div>
          </div>

          {/* Guardian Info */}
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parent Contact</span>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginTop: '2px' }}>
              {details.parent?.fatherName}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
              📞 {details.parent?.phone}
            </div>
          </div>
        </div>

        {/* TABS HEADER */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 24px', background: '#ffffff' }}>
          {[
            { id: 'attendance', label: 'Attendance Details', icon: Calendar },
            { id: 'marks', label: 'Continuous Marks & Exams', icon: BarChart2 },
            { id: 'fees', label: 'Fees & Accounts Status', icon: CreditCard },
            { id: 'profile', label: 'Personal & Parent Profile', icon: User },
            { id: 'notices', label: `Parent Notices (${notices.length})`, icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: 'none',
                  borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  background: 'none',
                  color: isActive ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: '60vh' }}>
          {/* 1. ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                    Subject-Wise Class Turnout &amp; Attendance Breakdown
                  </h4>
                  <small style={{ color: '#64748b' }}>Autonomous threshold: 75% for exam eligibility · &lt;50% is Critical Debarment</small>
                </div>
                {details.isCriticalShortage && (
                  <button
                    type="button"
                    onClick={() => onOpenParentNoticeModal && onOpenParentNoticeModal(details)}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <AlertTriangle size={12} /> Issue Parent Attendance Warning
                  </button>
                )}
              </div>

              <div className="admin-table-container">
                <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Faculty Member</th>
                      <th>Turnout (Attended / Total)</th>
                      <th>Percentage</th>
                      <th>Academic Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.subjectAttendance?.map((sub) => (
                      <tr key={sub.code}>
                        <td><code>{sub.code}</code></td>
                        <td><strong>{sub.name}</strong></td>
                        <td style={{ color: '#475569' }}>{sub.faculty}</td>
                        <td>{sub.attended} / {sub.total} Classes</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong
                              style={{
                                color: sub.isCritical ? '#dc2626' : sub.isShortage ? '#d97706' : '#059669',
                                minWidth: '40px'
                              }}
                            >
                              {sub.percentage}%
                            </strong>
                            <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${sub.percentage}%`,
                                  height: '100%',
                                  background: sub.isCritical ? '#dc2626' : sub.isShortage ? '#d97706' : '#059669',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          {sub.isCritical ? (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                              Critical (&lt;50%)
                            </span>
                          ) : sub.isShortage ? (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                              Shortage (&lt;75%)
                            </span>
                          ) : (
                            <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                              Eligible (≥75%)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. MARKS TAB */}
          {activeTab === 'marks' && (
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#0f172a' }}>
                Continuous Internal Assessment (CIA) &amp; Mid-Term Marks
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>MID-TERM 1</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {details.marks?.mid1} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/ 30</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>MID-TERM 2</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {details.marks?.mid2} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/ 30</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ASSIGNMENTS</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {details.marks?.assignmentMarks} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/ 20</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>QUIZZES</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {details.marks?.quizMarks} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/ 10</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>LAB WORK</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {details.marks?.labMarks} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/ 10</span>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 800 }}>TOTAL INTERNAL</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8', marginTop: '2px' }}>
                    {details.marks?.totalInternal} <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>/ 100</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <h5 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#0f172a' }}>
                  Semester-Wise Academic Progression (SGPA Record)
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  {[
                    { sem: 'Sem 1', sgpa: 8.2 },
                    { sem: 'Sem 2', sgpa: 8.4 },
                    { sem: 'Sem 3', sgpa: 8.6 },
                    { sem: 'Sem 4', sgpa: 8.8 },
                    { sem: 'Sem 5 (Current)', sgpa: details.marks?.cgpa || 8.4 },
                  ].map((s) => (
                    <div key={s.sem} style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.sem}</span>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#059669' }}>{s.sgpa} SGPA</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. FEES TAB */}
          {activeTab === 'fees' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                    Institutional Fee Account Ledger &amp; Due Statement
                  </h4>
                  <small style={{ color: '#64748b' }}>Accounts reconciliation for Academic Session 2026-27</small>
                </div>
                {details.fees?.hasHighDues && (
                  <button
                    type="button"
                    onClick={() => onOpenParentNoticeModal && onOpenParentNoticeModal(details)}
                    style={{
                      background: '#fff7ed',
                      border: '1px solid #ffedd5',
                      color: '#c2410c',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CreditCard size={12} /> Issue Parent Fee Dues Notice
                  </button>
                )}
              </div>

              <div className="admin-table-container" style={{ marginBottom: '14px' }}>
                <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Fee Head</th>
                      <th>Assessed Amount</th>
                      <th>Paid Amount</th>
                      <th>Balance Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.fees?.feeHeads?.map((fh) => (
                      <tr key={fh.head}>
                        <td><strong>{fh.head}</strong></td>
                        <td>₹{fh.assessed.toLocaleString('en-IN')}</td>
                        <td style={{ color: '#059669', fontWeight: 600 }}>₹{fh.paid.toLocaleString('en-IN')}</td>
                        <td style={{ color: fh.balance > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                          ₹{fh.balance.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span
                            style={{
                              background: fh.status === 'Cleared' ? '#ecfdf5' : '#fff7ed',
                              color: fh.status === 'Cleared' ? '#047857' : '#c2410c',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            {fh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                      <td>TOTAL ACADEMIC FEES</td>
                      <td>₹{details.fees?.totalFees.toLocaleString('en-IN')}</td>
                      <td style={{ color: '#059669' }}>₹{details.fees?.paidFees.toLocaleString('en-IN')}</td>
                      <td style={{ color: details.fees?.dueFees > 0 ? '#dc2626' : '#059669' }}>
                        ₹{details.fees?.dueFees.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span
                          style={{
                            background: details.fees?.feeStatus === 'Cleared' ? '#ecfdf5' : '#fee2e2',
                            color: details.fees?.feeStatus === 'Cleared' ? '#047857' : '#b91c1c',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}
                        >
                          {details.fees?.feeStatus}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 4. PROFILE TAB */}
          {activeTab === 'profile' && (
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#0f172a' }}>
                Student &amp; Parent Institutional Dossier
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 800 }}>
                    Academic Identity
                  </h5>
                  <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px', fontSize: '0.78rem' }}>
                    <dt style={{ color: '#64748b' }}>Roll Number:</dt>
                    <dd style={{ margin: 0, fontWeight: 700 }}>#{details.rollNumber}</dd>
                    <dt style={{ color: '#64748b' }}>Registration No:</dt>
                    <dd style={{ margin: 0 }}><code>{details.registrationNumber || details.studentId}</code></dd>
                    <dt style={{ color: '#64748b' }}>Program &amp; Branch:</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>{details.department || 'B.Tech CSE'}</dd>
                    <dt style={{ color: '#64748b' }}>Semester / Sec:</dt>
                    <dd style={{ margin: 0 }}>{details.semester} · {details.section}</dd>
                    <dt style={{ color: '#64748b' }}>Student Email:</dt>
                    <dd style={{ margin: 0 }}>{details.email}</dd>
                    <dt style={{ color: '#64748b' }}>Student Mobile:</dt>
                    <dd style={{ margin: 0 }}>{details.phone || '+91 98610 23010'}</dd>
                  </dl>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 800 }}>
                    Parents &amp; Guardians Information
                  </h5>
                  <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px', fontSize: '0.78rem' }}>
                    <dt style={{ color: '#64748b' }}>Father Name:</dt>
                    <dd style={{ margin: 0, fontWeight: 700 }}>{details.parent?.fatherName}</dd>
                    <dt style={{ color: '#64748b' }}>Mother Name:</dt>
                    <dd style={{ margin: 0 }}>{details.parent?.motherName}</dd>
                    <dt style={{ color: '#64748b' }}>Primary Phone:</dt>
                    <dd style={{ margin: 0, fontWeight: 700, color: '#0284c7' }}>{details.parent?.phone}</dd>
                    <dt style={{ color: '#64748b' }}>Parent Email:</dt>
                    <dd style={{ margin: 0 }}>{details.parent?.email}</dd>
                    <dt style={{ color: '#64748b' }}>Permanent Address:</dt>
                    <dd style={{ margin: 0 }}>{details.parent?.address}</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* 5. NOTICES TAB */}
          {activeTab === 'notices' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                    Dispatched Parent Notices &amp; Warnings
                  </h4>
                  <small style={{ color: '#64748b' }}>Official institutional communications sent to {details.parent?.fatherName}</small>
                </div>
                <button
                  type="button"
                  className="admin-action-btn-primary"
                  onClick={() => onOpenParentNoticeModal && onOpenParentNoticeModal(details)}
                  style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={13} /> Compose New Parent Notice
                </button>
              </div>

              {notices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                  <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <strong>No pending warnings for this student</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>No official attendance shortage or fee default notices have been sent yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notices.map((n) => (
                    <div key={n.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                background: n.noticeType.includes('ATTENDANCE') ? '#fee2e2' : '#ffedd5',
                                color: n.noticeType.includes('ATTENDANCE') ? '#b91c1c' : '#c2410c',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              {n.id} · {n.noticeType}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                              {n.title}
                            </span>
                          </div>
                          <small style={{ color: '#64748b', fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>
                            By <strong>{n.sentBy}</strong> on {n.formattedDate}
                          </small>
                        </div>
                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800 }}>
                          ✓ DELIVERED
                        </span>
                      </div>
                      <p style={{ margin: '6px 0', fontSize: '0.8rem', color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                        "{n.message}"
                      </p>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Channels: <strong>{n.channels.join(' · ')}</strong> · Sent to <strong>{n.parentName} ({n.parentPhone})</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Academic Examination Status: <strong style={{ color: details.isCriticalShortage || details.fees?.hasHighDues ? '#dc2626' : '#059669' }}>{details.examEligibility}</strong>
          </div>
          <button
            type="button"
            className="admin-action-btn-secondary"
            onClick={onClose}
            style={{ padding: '6px 16px', fontSize: '0.8rem' }}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
