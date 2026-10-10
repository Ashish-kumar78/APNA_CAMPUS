import React from 'react';
import { CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import './HandwrittenApplicationLetter.css';

export default function HandwrittenApplicationLetter({ pass, doc }) {
  // Extract or fall back to realistic defaults
  const studentName = pass?.studentName || doc?.studentName || 'Rakesh Das';
  const rollNumber = pass?.rollNumber || doc?.rollNumber || '01';
  const registrationNumber = pass?.registrationNumber || doc?.registrationNumber || '2305201001';
  const department = pass?.department || 'Computer Science & Engineering';
  const semester = pass?.semester || 'Semester 5';
  const hostelName = pass?.hostelName || 'Gandhi Boys Residence (Hostel 1)';
  const roomNumber = pass?.roomNumber || 'Room 101';
  const bedNo = pass?.bedNo || 'Bed 01';
  const purposeType = pass?.purposeType || 'Home Visit';
  const destination = pass?.destination || 'Plot 18, Unit 4, Bhubaneswar / Bargarh, Odisha';
  const outDateTime = pass?.outDateTime ? pass.outDateTime.replace('T', ' ') : '08-Oct-2026 09:00 AM';
  const inDateTime = pass?.inDateTime ? pass.inDateTime.replace('T', ' ') : '12-Oct-2026 06:00 PM';
  const studentPhone = pass?.studentPhone || '+91 98610 23010';
  const parentPhone = pass?.parentPhone || pass?.emergencyContact || '+91 94370 10001';

  // Mentor Details
  const mentorName = pass?.mentorName || 'Dr. Siba Prasad Tripathy';
  const mentorEmpId = pass?.mentorEmpId || 'FAC-CSE-018';
  const mentorDepartment = pass?.mentorDepartment || department;
  const mentorRemarks = pass?.mentorRemarks || 'Verified attendance (92%) & internal assessment clearance. Outstation travel recommended.';
  const mentorVerifiedAt = pass?.mentorVerifiedAt || '05-Oct-2026';

  // Generate cursive mentor signature from name
  const getMentorSignature = (name) => {
    if (name.includes('Tripathy')) return 'Dr. S. P. Tripathy';
    if (name.includes('Mishra')) return 'Prof. A. Mishra';
    if (name.includes('Swain')) return 'Dr. D. Swain';
    return name;
  };

  return (
    <div className="handwritten-letter-container">
      <div className="handwritten-paper">
        {/* Binder punch holes on the left margin */}
        <div className="handwritten-punch-hole punch-top" />
        <div className="handwritten-punch-hole punch-mid" />
        <div className="handwritten-punch-hole punch-bottom" />

        {/* Top Header with Date */}
        <div className="handwritten-top-row">
          <div style={{ fontSize: '1rem', color: '#64748b', fontStyle: 'italic', letterSpacing: '0.04em' }}>
            [Handwritten Student Leave Application · Regd Copy]
          </div>
          <div className="handwritten-date">
            Date: 05-Oct-2026
          </div>
        </div>

        {/* Addressed To */}
        <div className="handwritten-address-block">
          <div>To,</div>
          <div>The Resident Warden,</div>
          <div style={{ fontWeight: 600 }}>{hostelName},</div>
          <div>Apna Campus, Bhubaneswar</div>
        </div>

        {/* Subject */}
        <div className="handwritten-subject">
          Sub: Application for outstation gate pass for {purposeType}.
        </div>

        {/* Salutation */}
        <div style={{ marginBottom: '0.5rem' }}>
          Respected Warden Sir,
        </div>

        {/* Letter Body in natural human handwriting */}
        <div className="handwritten-body-text">
          With humble respect, I am <strong>{studentName}</strong>, pursuing B.Tech in <strong>{department}</strong> ({semester}), Roll No: <strong>{rollNumber}</strong>, Regd No: <strong>{registrationNumber}</strong>. I am currently accommodating at <strong>{hostelName}</strong>, <strong>{roomNumber}</strong> ({bedNo}).
        </div>

        <div className="handwritten-body-text" style={{ marginTop: '-0.5rem' }}>
          I kindly request you to grant me an outstation gate pass to visit my home at <strong>{destination}</strong> for <strong>{purposeType}</strong>. My parents have consented to this journey.
        </div>

        {/* Schedule lines on paper */}
        <div style={{ margin: '0.5rem 0 1rem 1rem', lineHeight: '30px' }}>
          <div>• <strong>Departure Date &amp; Time :</strong> {outDateTime}</div>
          <div>• <strong>Expected Return Date  :</strong> {inDateTime}</div>
          <div>• <strong>Parent / Guardian Phone:</strong> {parentPhone} (Consent Confirmed)</div>
        </div>

        <div className="handwritten-body-text">
          My Faculty Mentor, <strong>{mentorName}</strong>, has verified my attendance and academic assessment clearance and endorsed his approval below. Kindly grant me permission and issue the gate pass.
        </div>

        {/* Signatures Row */}
        <div className="handwritten-signatures-grid">
          {/* Student Sign */}
          <div className="handwritten-student-sign-box">
            <div>Yours obediently,</div>
            <div className="cursive-sign-student">
              {studentName}
            </div>
            <div className="student-meta-handwritten">
              <strong>{studentName}</strong><br />
              Roll: {rollNumber} · {roomNumber}<br />
              Ph: {studentPhone}
            </div>
          </div>

          {/* Mentor Approval Box with Official Stamp & Sign */}
          <div className="handwritten-mentor-approval-box">
            {/* Rubber Stamp Watermark */}
            <div className="mentor-circular-seal">
              <div className="seal-ring-inner">APNA CAMPUS</div>
              <div className="seal-center-text">✓ VERIFIED</div>
              <div className="seal-ring-inner">FACULTY MENTOR</div>
            </div>

            <div className="mentor-stamp-ribbon">
              <CheckCircle2 size={13} /> Mentor Endorsed &amp; Approved
            </div>

            <div className="mentor-remarks-handwritten">
              "{mentorRemarks}"
            </div>

            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Signature of Academic Mentor:
              </div>
              <div className="cursive-sign-mentor">
                {getMentorSignature(mentorName)}
              </div>
              <div className="mentor-details-text">
                <strong>{mentorName}</strong><br />
                <span>Faculty Advisor (Emp ID: {mentorEmpId})</span><br />
                <span>Dept. of {mentorDepartment}</span><br />
                <span style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 600 }}>Date: {mentorVerifiedAt}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
