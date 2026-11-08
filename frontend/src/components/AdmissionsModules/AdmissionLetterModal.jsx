import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Award,
  GraduationCap,
  Calendar,
  Building2,
  CheckCircle2,
  QrCode,
  User,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

export default function AdmissionLetterModal({ applicant, student, onClose }) {
  const printRef = useRef(null);

  if (!applicant) return null;

  const appData = applicant || {};
  const studentData = student || {};

  const applicationNo = appData.applicationNo || 'APP-2026-XXXX';
  const studentId = studentData.studentId || appData.studentId || 'AC-2026-XXXX';
  const rollNumber = studentData.rollNumber || appData.rollNumber || '26CSEXXXX';
  const studentName = appData.name || studentData.name || 'Candidate Name';
  const programmeName = appData.appliedCourse || appData.programmeName || studentData.department || 'Bachelor of Technology in Computer Science & Engineering';
  const department = studentData.department || appData.department || 'Computer Science & Engineering';
  const academicSession = appData.academicSession || appData.academicYear || '2026-27';
  const officialEmail = studentData.email || `${studentId.toLowerCase()}@apnacampus.edu.in`;
  const personalEmail = appData.email || studentData.personalEmail || '';
  const phone = appData.phone || studentData.phone || '';
  const dob = appData.dob || studentData.dob || '15-08-2005';
  const bloodGroup = appData.bloodGroup || studentData.bloodGroup || 'O+';
  const category = appData.category || studentData.category || 'General';

  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="adm-modal-backdrop" onClick={onClose} style={{ zIndex: 999999 }}>
      <div
        className="adm-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          width: 'min(880px, 96vw)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Modal Top Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 24px',
            background: '#0f172a',
            color: '#fff',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.96rem', letterSpacing: '0.02em' }}>
              OFFICIAL ADMISSION CREDENTIAL DOSSIER
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Scroll Container */}
        <div
          ref={printRef}
          style={{
            padding: '36px 40px',
            overflowY: 'auto',
            background: '#f8fafc',
            color: '#0f172a',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {/* =================================================== */}
          {/* DOCUMENT 1: PROVISIONAL ADMISSION OFFER LETTER     */}
          {/* =================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              marginBottom: '32px',
              position: 'relative',
            }}
          >
            {/* Watermark Emblem */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.035,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <Building2 size={380} />
            </div>

            {/* Letterhead */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid #0284c7',
                paddingBottom: '20px',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #0284c7, #1e3a8a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    APNA CAMPUS AUTONOMOUS COLLEGE
                  </h1>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    NAAC A++ ACCREDITED · AUTONOMOUS HIGHER EDUCATION INSTITUTION · AICTE APPROVED
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                    Institutional Campus: Knowledge City, Bhubaneswar - 751024, Odisha, India
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#16a34a',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                >
                  OFFICIAL ADMISSION LETTER
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                  Ref: <strong style={{ color: '#0f172a' }}>AC/ADM/{academicSession.replace('-', '')}/{applicationNo.replace('APP-', '')}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Date: <strong style={{ color: '#0f172a' }}>{issueDate}</strong>
                </div>
              </div>
            </div>

            {/* Letter Body Content */}
            <div style={{ position: 'relative', zIndex: 1, fontSize: '0.88rem', lineHeight: 1.65 }}>
              <div style={{ marginBottom: '18px' }}>
                <div>To,</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{studentName}</div>
                <div style={{ color: '#475569', fontSize: '0.82rem' }}>
                  Application No: <strong>{applicationNo}</strong> · Category: <strong>{category}</strong>
                </div>
                <div style={{ color: '#475569', fontSize: '0.82rem' }}>
                  Contact: {phone} · {personalEmail}
                </div>
              </div>

              <div
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.92rem', marginBottom: '4px' }}>
                  Subject: Provisional Admission Offer &amp; Enrollment Confirmation for Academic Session {academicSession}
                </div>
                <p style={{ margin: 0, color: '#0c4a6e', fontSize: '0.84rem' }}>
                  Dear <strong>{studentName}</strong>, congratulations! We are pleased to inform you that upon thorough verification of your academic qualifications and entrance merit, you have been granted official admission into <strong>Apna Campus</strong>.
                </p>
              </div>

              {/* Allotment Details Table */}
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '16px 0 8px', color: '#1e293b' }}>
                Allotted Institutional Academic Profile
              </h3>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.82rem',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <tbody>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', width: '25%' }}>Permanent Student ID</td>
                    <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0284c7', width: '25%' }}>{studentId}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', width: '25%' }}>Academic Roll No</td>
                    <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a', width: '25%' }}>{rollNumber}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>Degree Program</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }} colSpan={3}>{programmeName}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>Academic Department</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{department}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>Academic Session</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{academicSession}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>Allotted Semester</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>Semester 1 (Section A)</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>Official Campus Email</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0284c7' }}>{officialEmail}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>Document Clearance</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>VERIFIED &amp; APPROVED</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>Admission Fee Status</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>CONFIRMED</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '24px' }}>
                <p style={{ margin: '0 0 6px' }}>
                  <strong>Key Instructions for Candidate:</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Your official institutional Student Portal account has been activated with login ID <strong>{studentId}</strong>.</li>
                  <li>Orientation schedule and timetable details are accessible through the Apna Campus Smart ERP portal.</li>
                  <li>Carry this Admission Letter along with your original documents during physical verification at the Registrar's Office.</li>
                </ul>
              </div>

              {/* Signatures Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '1px dashed #cbd5e1',
                }}
              >
                <div>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      border: '2px solid #0284c7',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      textAlign: 'center',
                      padding: 4,
                      lineHeight: 1.1,
                      transform: 'rotate(-8deg)',
                    }}
                  >
                    <span>APNA CAMPUS</span>
                    <span style={{ fontSize: '0.55rem', color: '#16a34a' }}>★ ADMITTED ★</span>
                    <span>2026-27</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Institutional Registrar Seal</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: '1.4rem', color: '#1e3a8a' }}>
                    Dr. B. K. Mohapatra
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Dean of Academic Admissions</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Apna Campus Autonomous Directorate</div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================== */}
          {/* DOCUMENT 2: OFFICIAL STUDENT IDENTITY CARD (ID)   */}
          {/* =================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={18} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                Digital Smart Identity Card (Card View)
              </h3>
            </div>

            {/* Smart ID Card Card Design */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '16px',
                border: '1px solid #334155',
                padding: '20px',
                color: '#fff',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Cyan decorative glow */}
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 140,
                  height: 140,
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
                  borderRadius: '50%',
                }}
              />

              {/* ID Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.02em', color: '#f8fafc' }}>APNA CAMPUS</div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>STUDENT IDENTITY CARD</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 9999, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  VALID: {academicSession}
                </span>
              </div>

              {/* ID Card Core Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: '14px', alignItems: 'center' }}>
                {/* Photo Container */}
                <div
                  style={{
                    width: 84,
                    height: 98,
                    background: '#1e293b',
                    borderRadius: '8px',
                    border: '2px solid #38bdf8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    overflow: 'hidden',
                  }}
                >
                  <User size={40} color="#64748b" />
                  <span style={{ fontSize: '0.58rem', marginTop: 2, color: '#94a3b8' }}>PHOTO</span>
                </div>

                {/* Student Info */}
                <div style={{ fontSize: '0.74rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                    {studentName}
                  </div>
                  <div style={{ color: '#38bdf8', fontWeight: 700, margin: '2px 0 6px', fontSize: '0.78rem' }}>
                    ID: {studentId}
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                    <strong>Course:</strong> {programmeName}
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>
                    <strong>Roll No:</strong> {rollNumber} · <strong>Blood:</strong> {bloodGroup}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.66rem', marginTop: 4 }}>
                    {officialEmail}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 14,
                  paddingTop: 8,
                  borderTop: '1px solid #334155',
                  fontSize: '0.64rem',
                  color: '#94a3b8',
                }}
              >
                <div>
                  Emergency: <strong>{phone}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <QrCode size={14} color="#38bdf8" />
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>SECURE QR VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}

