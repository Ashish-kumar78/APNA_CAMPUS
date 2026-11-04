import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Printer,
  ShieldCheck,
  Calendar,
  Building2,
  CreditCard,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import AdmissionLetterModal from '../components/AdmissionsModules/AdmissionLetterModal.jsx';

export default function MyAdmissionPage({ account }) {
  const [showLetterModal, setShowLetterModal] = useState(false);

  const student = account || {};
  const studentId = student.studentId || student.registrationNumber || student.identifier || 'AC-2026-0004';
  const studentName = student.name || 'Enrolled Student';
  const department = student.department || 'Computer Science & Engineering';
  const academicSession = student.academicYear || '2026-27';
  const semester = student.semester || 'Semester 1';
  const section = student.section || 'Section A';
  const rollNumber = student.rollNumber || '26CSE0004';
  const officialEmail = student.email || `${studentId.toLowerCase()}@apnacampus.edu.in`;

  const applicationNo = `APP-${academicSession.slice(0, 4)}-${studentId.replace(/[^0-9]/g, '').slice(-4) || '0004'}`;

  const submittedDocs = [
    { name: 'Recent Passport Size Photograph', status: 'VERIFIED', date: '15 Oct 2026' },
    { name: 'Student Signature Specimen', status: 'VERIFIED', date: '15 Oct 2026' },
    { name: 'Class 10th Board Marksheet & Certificate', status: 'VERIFIED', date: '15 Oct 2026' },
    { name: 'Class 12th / Intermediate Marksheet', status: 'VERIFIED', date: '15 Oct 2026' },
    { name: 'College Leaving / Transfer Certificate (TC)', status: 'VERIFIED', date: '18 Oct 2026' },
    { name: 'Conduct / Character Certificate', status: 'VERIFIED', date: '18 Oct 2026' },
    { name: 'National Entrance Exam Scorecard (JEE / OJEE)', status: 'VERIFIED', date: '15 Oct 2026' },
    { name: 'Resident / Domicile Certificate', status: 'VERIFIED', date: '18 Oct 2026' },
  ];

  const applicantDossier = {
    applicationNo,
    name: studentName,
    studentId,
    rollNumber,
    appliedCourse: department,
    department,
    academicSession,
    email: student.personalEmail || officialEmail,
    phone: student.phone || '+91 98765 43210',
    dob: student.dob || '15-08-2005',
    category: student.category || 'General',
    bloodGroup: student.bloodGroup || 'O+',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 0 40px' }}>
      {/* Top Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #1e40af 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(2, 132, 199, 0.25)',
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.18)', padding: '4px 12px', borderRadius: 9999, fontSize: '0.74rem', fontWeight: 700, marginBottom: 8 }}>
            <ShieldCheck size={14} /> ADMISSION STATUS: CONFIRMED &amp; ENROLLED
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800 }}>
            Official Admission &amp; Onboarding Dossier
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.88rem', maxWidth: 640 }}>
            Your institutional admission to Apna Campus has been ratified. Review your confirmed academic profile, submitted documents clearance, and official admission letter.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowLetterModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: '#ffffff',
              color: '#0284c7',
              border: 'none',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Printer size={16} /> Official Admission Letter &amp; ID
          </button>
        </div>
      </div>

      {/* Grid: Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>PERMANENT STUDENT ID</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: 4 }}>{studentId}</div>
          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>✓ Unique Institutional Identity</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>APPLICATION NUMBER</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{applicationNo}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Session {academicSession}</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>ALLOTTED CLASS</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{semester}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Section: {section} · Roll: {rollNumber}</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>FEE CLEARANCE STATUS</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: 4 }}>CONFIRMED</div>
          <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>Semester 1 Fee Paid in Full</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left Column: Academic & Document Verification */}
        <div>
          {/* Confirmed Academic Allotment Box */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={18} color="#0284c7" />
              Confirmed Academic Program Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Enrolled Program</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{department}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Academic Department</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{department}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Official Student Email</span>
                <div style={{ fontWeight: 700, color: '#0284c7' }}>{officialEmail}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Mode of Study</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>Full-Time Regular (Campus)</div>
              </div>
            </div>
          </div>

          {/* Document Verification Scrutiny Status */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCheck2 size={18} color="#16a34a" />
                Submitted Documents &amp; Verification Status
              </h3>
              <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: 9999, background: '#f0fdf4', color: '#16a34a', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                All 8 Documents Verified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {submittedDocs.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.name}</div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Scrutinized &amp; Approved · {doc.date}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 6 }}>
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Contacts & Quick Actions */}
        <div>
          {/* Quick Actions Card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Admissions Actions
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowLetterModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 8,
                  color: '#0369a1',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>Download Admission Offer Letter</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setShowLetterModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>Print Student Smart ID Card</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Admission Office Helpdesk Contact */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, fontSize: '0.82rem' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Admissions Directorate Office
            </h4>
            <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.78rem' }}>
              For queries regarding subject electives, hostel room booking, or original certificate return, contact the admissions desk:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#334155' }}>
              <div><strong>Email:</strong> admissions@apnacampus.edu.in</div>
              <div><strong>Helpline:</strong> +91 94370 00004 / Ext: 104</div>
              <div><strong>Office:</strong> Administrative Block, Ground Floor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Admission Letter / ID Card Modal */}
      {showLetterModal && (
        <AdmissionLetterModal
          applicant={applicantDossier}
          student={student}
          onClose={() => setShowLetterModal(false)}
        />
      )}
    </div>
  );
}

