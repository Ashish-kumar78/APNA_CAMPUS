import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Building,
  FileText,
  Calendar,
  Check,
  Eye,
  EyeOff,
  Download,
  ArrowLeft,
  Users,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import IdCardVerificationView from './InternshipCell/IdCardVerificationView.jsx';
import './InternshipStudentProfile.css';

// Default Student Profile data matching the exact format from screenshots
export const DEFAULT_INTERNSHIP_PROFILE = {
  prefix: 'Mr.',
  name: 'Bhabani Shankar Jena', // Clean random name matching request
  regNo: '2401432265',
  course: 'B.Tech',
  batch: 'BTECH 2028-P',
  email: 'bhabaniprasad2007@gmail.com',
  mobile: '7735994528',
  session: '2026-2027 (SIP)',
  company: 'Central Tool Room and Training Center',
  courseDetails: 'N/A',
  section: 'CSE AI-GENIUS/5th SEM • 2028 • BTECH 2028-P',
  facultyCoordinator: 'N/A',
  batchGuide: 'Mrs. Aditi Patnaik, Mr. Shantanu Rath',
  studentGuide: 'SUBHRA SUPARNA DAS',
  subBatch: 'BTECH 2028-P/1/CTTC/AI-ML',
  specialBatch: 'N/A',
  // SVG Avatar portrait representation
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=260',
};

// 32-Day Attendance Log matching Image 2
export const ATTENDANCE_LOGS = [
  { sl: 1, date: '17-06-2025', status: 'A' },
  { sl: 2, date: '18-06-2025', status: 'A' },
  { sl: 3, date: '19-06-2025', status: 'P' },
  { sl: 4, date: '20-06-2025', status: 'P' },
  { sl: 5, date: '21-06-2025', status: 'H' },
  { sl: 6, date: '22-06-2025', status: 'H' },
  { sl: 7, date: '23-06-2025', status: 'P' },
  { sl: 8, date: '24-06-2025', status: 'P' },
  { sl: 9, date: '25-06-2025', status: 'P' },
  { sl: 10, date: '26-06-2025', status: 'P' },
  { sl: 11, date: '27-06-2025', status: 'H' },
  { sl: 12, date: '28-06-2025', status: 'H' },
  { sl: 13, date: '29-06-2025', status: 'H' },
  { sl: 14, date: '30-06-2025', status: 'P' },
  { sl: 15, date: '01-07-2025', status: 'P' },
  { sl: 16, date: '02-07-2025', status: 'P' },
  { sl: 17, date: '03-07-2025', status: 'P' },
  { sl: 18, date: '04-07-2025', status: 'P' },
  { sl: 19, date: '05-07-2025', status: 'H' },
  { sl: 20, date: '06-07-2025', status: 'H' },
  { sl: 21, date: '07-07-2025', status: 'P' },
  { sl: 22, date: '08-07-2025', status: 'P' },
  { sl: 23, date: '09-07-2025', status: 'P' },
  { sl: 24, date: '10-07-2025', status: 'P' },
  { sl: 25, date: '11-07-2025', status: 'P' },
  { sl: 26, date: '12-07-2025', status: 'H' },
  { sl: 27, date: '13-07-2025', status: 'H' },
  { sl: 28, date: '14-07-2025', status: 'P' },
  { sl: 29, date: '15-07-2025', status: 'P' },
  { sl: 30, date: '16-07-2025', status: 'P' },
  { sl: 31, date: '17-07-2025', status: 'P' },
  { sl: 32, date: '18-07-2025', status: 'P' },
];

// Evaluation and Marks matching Image 3
export const EVALUATION_ITEMS = [
  {
    id: 1,
    subject: 'Summer Internship (2024–25)',
    category: '(Attendance(EXT))',
    batch: 'Batch: BTECH 2028-P/12/GLUCIAN (Python)',
    fullMarks: 10,
    obtainedMarks: 9,
  },
  {
    id: 2,
    subject: 'Summer Internship (2024–25)',
    category: '(QUIZ-5)',
    batch: 'Batch: BTECH 2028-P/12/GLUCIAN (Python)',
    fullMarks: 10,
    obtainedMarks: 10,
  },
  {
    id: 3,
    subject: 'Summer Internship (2024–25)',
    category: '(QUIZ-3)',
    batch: 'Batch: BTECH 2028-P/12/GLUCIAN (Python)',
    fullMarks: 10,
    obtainedMarks: 10,
  },
  {
    id: 4,
    subject: 'Summer Internship (2024–25)',
    category: '(QUIZ-4)',
    batch: 'Batch: BTECH 2028-P/12/GLUCIAN (Python)',
    fullMarks: 10,
    obtainedMarks: 10,
  },
  {
    id: 5,
    subject: 'Summer Internship (2024–25)',
    category: '(QUIZ-1)',
    batch: 'Batch: BTECH 2028-P/12/GLUCIAN (Python)',
    fullMarks: 10,
    obtainedMarks: 10,
  },
  {
    id: 6,
    subject: 'Summer Internship (2024–25)',
    category: '(QUIZ-2)',
    batch: 'Batch: BTECH 2028-P/12/GLUCIAN (Python)',
    fullMarks: 10,
    obtainedMarks: 9,
  },
  {
    id: 7,
    subject: 'Summer Internship (2024–25)',
    category: '(EXTERNAL(EXT))',
    batch: 'Batch: BTECH 2028-P/12/GLUCIAN (Python)',
    fullMarks: 25,
    obtainedMarks: 25,
  },
  {
    id: 8,
    subject: 'Summer Internship (2024–25)',
    category: '(INTERNAL(INT))',
    batch: 'Section: CSE - Genius/3RD SEM',
    fullMarks: 55,
    obtainedMarks: 51,
  },
];

export default function InternshipStudentProfile({ account, onBack }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'attendance' | 'marks' | 'idcard'
  const [showDayWise, setShowDayWise] = useState(true);
  const [dbStudent, setDbStudent] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [verifyingToken, setVerifyingToken] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Derive target registration number
  const targetReg = account?.registrationNumber || account?.rollNumber || account?.rollNo || account?.regNo || '2401432265';

  // Fetch real verified student record and active card from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        if (api && typeof api.getInternshipStudent === 'function') {
          const res = await api.getInternshipStudent(targetReg);
          if (isMounted && res?.success && res?.data) {
            setDbStudent(res.data);
            if (res.data.activeCard) {
              setActiveCard(res.data.activeCard);
            }
          }
        }
      } catch (err) {
        console.warn('Backend student fetch notice:', err?.message || err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [targetReg]);

  // Derive student profile dynamically with DB fallback
  const student = {
    prefix: DEFAULT_INTERNSHIP_PROFILE.prefix,
    name: dbStudent?.name || (account?.name ? account.name.toUpperCase() : DEFAULT_INTERNSHIP_PROFILE.name.toUpperCase()),
    regNo: dbStudent?.registrationNo || targetReg,
    course: dbStudent?.course || (account?.department ? `B.Tech ${account.department}` : DEFAULT_INTERNSHIP_PROFILE.course),
    batch: dbStudent?.batch || account?.batch || DEFAULT_INTERNSHIP_PROFILE.batch,
    email: dbStudent?.email || account?.email || DEFAULT_INTERNSHIP_PROFILE.email,
    mobile: dbStudent?.phone || account?.phone || account?.mobile || DEFAULT_INTERNSHIP_PROFILE.mobile,
    session: dbStudent?.academicSession || DEFAULT_INTERNSHIP_PROFILE.session,
    company: activeCard?.company || dbStudent?.company || DEFAULT_INTERNSHIP_PROFILE.company,
    courseDetails: dbStudent?.course || DEFAULT_INTERNSHIP_PROFILE.courseDetails,
    section: dbStudent?.section || DEFAULT_INTERNSHIP_PROFILE.section,
    facultyCoordinator: DEFAULT_INTERNSHIP_PROFILE.facultyCoordinator,
    batchGuide: DEFAULT_INTERNSHIP_PROFILE.batchGuide,
    studentGuide: DEFAULT_INTERNSHIP_PROFILE.studentGuide,
    subBatch: DEFAULT_INTERNSHIP_PROFILE.subBatch,
    specialBatch: DEFAULT_INTERNSHIP_PROFILE.specialBatch,
    photoUrl: dbStudent?.photoUrl || account?.avatar || DEFAULT_INTERNSHIP_PROFILE.photoUrl,
    activeCard: activeCard || dbStudent?.activeCard,
  };

  const handleDownloadIdCard = async () => {
    if (student.activeCard?.id) {
      setDownloading(true);
      try {
        await api.downloadInternshipIdCardPdf(
          student.activeCard.id,
          `Internship_ID_Card_${student.regNo}_${student.activeCard.cardNumber}.pdf`
        );
      } catch (err) {
        alert(err.message || 'Download failed. Please try again.');
      } finally {
        setDownloading(false);
      }
    } else {
      alert(`Official ID Card for ${student.prefix} ${student.name} (Reg: ${student.regNo}) is currently pending issuance by the Internship Cell.\n\nPlease contact the Internship Cell to authorize your official card.`);
    }
  };

  return (
    <div className="isp-container">
      {/* ── Top Header Bar (Matching Screenshot 1) ── */}
      <div className="isp-header-bar">
        <div className="isp-header-left">
          <div className="isp-header-icon-circle">
            <User size={18} />
          </div>
          <div>
            <h2>Internship Student Profile</h2>
            <p>
              {student.prefix} {student.name} • {student.course} • {student.batch}
            </p>
          </div>
        </div>
        {onBack && (
          <button type="button" className="isp-btn-back" onClick={onBack}>
            <ArrowLeft size={13} /> Back
          </button>
        )}
      </div>

      {/* ── Main 2-Column Body Layout ── */}
      <div className="isp-main-layout">
        {/* Left Column: Student Bio Card (Matching Left Pane) */}
        <aside className="isp-left-card">
          <div className="isp-avatar-wrap">
            {/* Crisp portrait photo */}
            <svg viewBox="0 0 100 100" className="isp-avatar-img">
              <rect width="100" height="100" fill="#dbeafe" />
              <circle cx="50" cy="40" r="22" fill="#3b82f6" />
              <circle cx="50" cy="38" r="18" fill="#fbd38d" />
              <path d="M50 54 Q40 64 30 76 Q30 92 70 92 Q70 76 50 54 Z" fill="#1e40af" />
              <circle cx="50" cy="30" r="12" fill="#1e293b" />
            </svg>
          </div>

          <h3 className="isp-student-name">
            {student.prefix} {student.name}
          </h3>

          <div className="isp-student-pills">
            <span className="isp-pill-tag">
              <GraduationCap size={12} /> {student.course}
            </span>
            <span className="isp-pill-tag">
              <Users size={12} /> {student.batch}
            </span>
          </div>

          <div className="isp-status-wrap">
            <span className="isp-status-badge">
              <Check size={12} /> Active
            </span>
          </div>

          {/* Bio Details Table */}
          <div className="isp-bio-table-card">
            <table className="isp-bio-table">
              <tbody>
                <tr>
                  <th>Registration No</th>
                  <td style={{ fontWeight: 700 }}>{student.regNo}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>
                    <strong>
                      {student.prefix} {student.name}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <th>Course</th>
                  <td>{student.course}</td>
                </tr>
                <tr>
                  <th>Batch</th>
                  <td>{student.batch}</td>
                </tr>
                <tr>
                  <th>Email ID</th>
                  <td>
                    <a href={`mailto:${student.email}`} className="isp-link">
                      {student.email}
                    </a>
                  </td>
                </tr>
                <tr>
                  <th>Mobile No</th>
                  <td className="isp-mobile-text">{student.mobile}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </aside>

        {/* Right Column: 4 Sub-Tabs & Content ── */}
        <section className="isp-right-content">
          {/* Sub-Tabs Nav: Info | Attendance | Evaluation & Marks | ID Card */}
          <div className="isp-tabs-nav" role="tablist">
            <button
              type="button"
              className={`isp-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <User size={14} /> Info
            </button>
            <button
              type="button"
              className={`isp-tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <GraduationCap size={14} /> Attendance
            </button>
            <button
              type="button"
              className={`isp-tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
              onClick={() => setActiveTab('marks')}
            >
              <Building size={14} /> Evaluation &amp; Marks
            </button>
            <button
              type="button"
              className={`isp-tab-btn ${activeTab === 'idcard' ? 'active' : ''}`}
              onClick={() => setActiveTab('idcard')}
            >
              <FileText size={14} /> ID Card
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: INFO (EXACT REPLICA OF IMAGE 1)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'info' && (
            <div className="isp-details-box">
              {/* Header Title */}
              <div className="isp-details-header">
                <CreditCard size={18} color="#2563eb" />
                <span>Student Details</span>
              </div>

              {/* Pills Bar */}
              <div className="isp-details-pills-row">
                <span className="isp-subtle-pill">
                  <Calendar size={12} /> {student.session}
                </span>
                <span className="isp-subtle-pill">
                  <Building size={12} /> {student.company}
                </span>
                <span className="isp-subtle-pill">🏛️ N/A</span>
              </div>

              {/* Active Badge */}
              <div style={{ marginBottom: 12 }}>
                <span className="isp-active-pill">
                  <Check size={12} /> {student.session}
                </span>
              </div>

              {/* 2x2 Grid Cards */}
              <div className="isp-info-grid-2x2">
                {/* 1. Overview */}
                <div className="isp-card-block">
                  <h4 className="isp-card-block-title">
                    <User size={14} color="#2563eb" /> Overview
                  </h4>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Session :</span>
                    <span className="isp-field-val">{student.session}</span>
                  </div>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Company :</span>
                    <span className="isp-field-val">{student.company}</span>
                  </div>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Course :</span>
                    <span className="isp-field-val">{student.courseDetails}</span>
                  </div>
                </div>

                {/* 2. Academic */}
                <div className="isp-card-block">
                  <h4 className="isp-card-block-title">
                    <Building size={14} color="#2563eb" /> Academic
                  </h4>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Section :</span>
                    <span className="isp-field-val">{student.section}</span>
                  </div>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Faculty Coordinator :</span>
                    <span className="isp-field-val">{student.facultyCoordinator}</span>
                  </div>
                </div>

                {/* 3. Guides */}
                <div className="isp-card-block">
                  <h4 className="isp-card-block-title">
                    <Users size={14} color="#2563eb" /> Guides
                  </h4>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Batch Guide :</span>
                    <span className="isp-field-val">{student.batchGuide}</span>
                  </div>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Student Guide :</span>
                    <span className="isp-field-val">{student.studentGuide}</span>
                  </div>
                </div>

                {/* 4. Batch & Links */}
                <div className="isp-card-block">
                  <h4 className="isp-card-block-title">
                    <Users size={14} color="#2563eb" /> Batch &amp; Links
                  </h4>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Batch :</span>
                    <span className="isp-field-val">{student.subBatch}</span>
                  </div>
                  <div className="isp-field-row">
                    <span className="isp-field-label">Special Batch :</span>
                    <span className="isp-field-val">{student.specialBatch}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: ATTENDANCE (EXACT REPLICA OF IMAGE 2)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'attendance' && (
            <div>
              {/* Blue Banner */}
              <div className="isp-blue-ribbon">
                2025-2026 (SIP) / Semester 3
              </div>

              <h4 className="isp-sub-heading">Subject-wise Attendance</h4>

              {/* Subject Summary Table */}
              <div className="isp-table-wrap">
                <table className="isp-data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '50%' }}>Subject</th>
                      <th>P</th>
                      <th>A</th>
                      <th>H</th>
                      <th>%</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'left', fontWeight: 600 }}>Summer Internship (2024–25)</td>
                      <td><strong>19</strong></td>
                      <td><span className="status-badge-a">2</span></td>
                      <td>11</td>
                      <td><strong style={{ color: '#16a34a' }}>90.48%</strong></td>
                      <td>
                        <button
                          type="button"
                          className="isp-btn-toggle-view"
                          onClick={() => setShowDayWise((v) => !v)}
                        >
                          {showDayWise ? <EyeOff size={11} /> : <Eye size={11} />}
                          <span>{showDayWise ? 'Hide' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Day-Wise Attendance Table */}
              {showDayWise && (
                <div>
                  <h4 className="isp-sub-heading" style={{ marginTop: 20 }}>
                    Day-wise Attendance:
                  </h4>
                  <div className="isp-table-wrap">
                    <table className="isp-data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '20%' }}>Sl No.</th>
                          <th style={{ width: '50%' }}>Date</th>
                          <th style={{ width: '30%' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ATTENDANCE_LOGS.map((item) => (
                          <tr key={item.sl}>
                            <td>{item.sl}</td>
                            <td>{item.date}</td>
                            <td>
                              <span
                                className={
                                  item.status === 'P'
                                    ? 'status-badge-p'
                                    : item.status === 'A'
                                    ? 'status-badge-a'
                                    : 'status-badge-h'
                                }
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: EVALUATION & MARKS (EXACT REPLICA OF IMAGE 3)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'marks' && (
            <div>
              {/* Blue Banner */}
              <div className="isp-blue-ribbon">
                2025-2026 (SIP) / Semester 3
              </div>

              <h4 className="isp-sub-heading">Evaluation</h4>

              <div className="isp-table-wrap">
                <table className="isp-data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', width: '60%' }}>Subject (Category)</th>
                      <th style={{ width: '20%' }}>Full Marks</th>
                      <th style={{ width: '20%' }}>Obtained Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EVALUATION_ITEMS.map((item) => (
                      <tr key={item.id}>
                        <td className="marks-subject-cell">
                          <span className="marks-subject-name">{item.subject}</span>
                          <span className="marks-category">{item.category}</span>
                          <span className="marks-batch-tag">{item.batch}</span>
                        </td>
                        <td><strong>{item.fullMarks}</strong></td>
                        <td>
                          <strong style={{ color: '#16a34a', fontSize: '13px' }}>
                            {item.obtainedMarks}
                          </strong>
                        </td>
                      </tr>
                    ))}
                    {/* Summary row */}
                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                      <td style={{ textAlign: 'left', fontWeight: 800 }}>
                        Total Aggregate Score (Grade: O · Outstanding)
                      </td>
                      <td><strong>150</strong></td>
                      <td>
                        <strong style={{ color: '#15803d', fontSize: '14px' }}>
                          144 (96.0%)
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: ID CARD (EXACT REPLICA OF IMAGE 4)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'idcard' && (
            <div className="isp-idcard-tab-wrap">
              <div className="isp-idcard-top-action" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                {student.activeCard?.verificationToken && (
                  <button
                    type="button"
                    className="isp-btn-download-idcard"
                    style={{ background: '#0284c7' }}
                    onClick={() => setVerifyingToken(student.activeCard.verificationToken)}
                  >
                    <ShieldCheck size={14} /> Verify Credential
                  </button>
                )}
                <button
                  type="button"
                  className="isp-btn-download-idcard"
                  onClick={handleDownloadIdCard}
                  disabled={downloading}
                >
                  <Download size={14} /> {downloading ? 'Downloading...' : 'Download ID Card'}
                </button>
              </div>

              <div className="isp-idcard-center-stage">
                {/* Physical ID Card Badge Graphic */}
                <div className="isp-id-badge" style={{ position: 'relative' }}>
                  {/* Top Header */}
                  <div className="isp-id-badge-header">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" fill="#dc2626" />
                      <path d="M12 6L14 10L18 10L15 13L16 17L12 14L8 17L9 13L6 10L10 10Z" fill="#ffffff" />
                    </svg>
                    <span className="isp-id-header-text">
                      GIFT | Autonomous, Bhubaneswar
                    </span>
                  </div>

                  {/* Body with Portrait & Fields */}
                  <div className="isp-id-badge-body" style={{ position: 'relative' }}>
                    <div className="isp-id-photo-frame">
                      <svg viewBox="0 0 100 120" className="isp-id-photo">
                        <rect width="100" height="120" fill="#e0f2fe" />
                        <circle cx="50" cy="45" r="24" fill="#1e3a8a" />
                        <circle cx="50" cy="42" r="20" fill="#fbd38d" />
                        <path d="M50 62 Q35 75 22 92 Q22 110 78 110 Q78 75 50 62 Z" fill="#1e40af" />
                      </svg>
                    </div>

                    <div className="isp-id-fields-list">
                      <div>
                        <strong>Name:</strong> {student.prefix} {student.name}
                      </div>
                      <div>
                        <strong>Reg. No.:</strong> {student.regNo}
                      </div>
                      <div>
                        <strong>Session:</strong> {student.session}
                      </div>
                      <div>
                        <strong>Company:</strong> {student.company}
                      </div>
                      <div>
                        <strong>Course:</strong> {student.courseDetails}
                      </div>
                      <div>
                        <strong>Batch:</strong> {student.batch || 'N/A'}
                      </div>
                      <div>
                        <strong>Mobile:</strong> {student.mobile}
                      </div>
                    </div>

                    {/* QR Code if issued */}
                    {student.activeCard?.qrCodeDataUrl && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#ffffff',
                          padding: '3px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                        onClick={() => setVerifyingToken(student.activeCard.verificationToken)}
                        title="Click to authenticate card credentials"
                      >
                        <img
                          src={student.activeCard.qrCodeDataUrl}
                          alt="Verification QR"
                          style={{ width: '42px', height: '42px', display: 'block' }}
                        />
                        <span style={{ fontSize: '0.45rem', fontWeight: 800, color: '#0f2b48', marginTop: '1px' }}>
                          VERIFY
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Red Banner */}
                  <div className="isp-id-badge-footer">
                    <span className="isp-id-footer-title">Internship ID Card</span>
                    <span className="isp-id-footer-sub">
                      This card is valid for training/internship purposes only.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Verification Modal */}
      {verifyingToken && (
        <IdCardVerificationView
          token={verifyingToken}
          onClose={() => setVerifyingToken(null)}
        />
      )}
    </div>
  );
}
