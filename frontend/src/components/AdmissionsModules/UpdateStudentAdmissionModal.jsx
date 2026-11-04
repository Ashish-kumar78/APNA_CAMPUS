import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Layers,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldCheck,
  Building2,
  Users,
  MapPin,
  Sparkles,
  CreditCard,
  Droplet
} from 'lucide-react';

export default function UpdateStudentAdmissionModal({
  isOpen,
  onClose,
  applicant,
  courses = [],
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    category: 'General',
    bloodGroup: 'O+',
    aadhaarNumber: '',
    rollNumber: '',
    section: 'Section A',
    programmeId: '',
    programmeName: '',
    academicYear: '2026-27',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    annualIncome: '',
    permanentAddress: '',
    city: '',
    state: 'Odisha',
    pinCode: '',
    tenthMarks: '',
    twelfthMarks: '',
    entranceExam: '',
    entranceRank: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'academic' | 'parents' | 'qualifications'

  useEffect(() => {
    if (applicant) {
      const pDetails = applicant.personalDetails || {};
      const parDetails = applicant.parentDetails || {};
      const aDetails = applicant.academicDetails || {};
      const enRecord = applicant.enrollmentRecord || {};

      setFormData({
        name: applicant.name || '',
        email: applicant.email || '',
        phone: applicant.phone || '',
        gender: applicant.gender || pDetails.gender || 'Male',
        dob: applicant.dob || pDetails.dob || '',
        category: applicant.category || pDetails.category || 'General',
        bloodGroup: applicant.bloodGroup || pDetails.bloodGroup || 'O+',
        aadhaarNumber: applicant.aadhaarNumber || pDetails.aadhaarNumber || '',
        rollNumber: enRecord.rollNumber || applicant.rollNumber || applicant.registrationNumber || '',
        section: enRecord.section || applicant.section || 'Section A',
        programmeId: applicant.programmeId || '',
        programmeName: applicant.appliedCourse || applicant.programmeName || '',
        academicYear: applicant.academicSession || applicant.academicYear || '2026-27',
        fatherName: parDetails.fatherName || applicant.fatherName || '',
        motherName: parDetails.motherName || applicant.motherName || '',
        parentPhone: parDetails.parentPhone || applicant.parentPhone || '',
        annualIncome: parDetails.annualIncome || applicant.annualIncome || '',
        permanentAddress: pDetails.permanentAddress || applicant.permanentAddress || '',
        city: pDetails.city || applicant.city || '',
        state: pDetails.state || applicant.state || 'Odisha',
        pinCode: pDetails.pinCode || applicant.pinCode || '',
        tenthMarks: applicant.tenthMarks !== undefined ? applicant.tenthMarks : (aDetails.tenthPercentage || ''),
        twelfthMarks: applicant.twelfthMarks !== undefined ? applicant.twelfthMarks : (aDetails.twelfthPercentage || ''),
        entranceExam: applicant.entranceExam || aDetails.entranceExamName || '',
        entranceRank: applicant.entranceRank !== undefined ? applicant.entranceRank : (aDetails.entranceRank || ''),
      });
      setErrorMsg('');
      setActiveTab('personal');
    }
  }, [applicant]);

  if (!isOpen || !applicant) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Candidate full name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Contact phone number is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dob: formData.dob,
        category: formData.category,
        bloodGroup: formData.bloodGroup,
        section: formData.section,
        rollNumber: formData.rollNumber.trim(),
        tenthMarks: formData.tenthMarks === '' ? undefined : Number(formData.tenthMarks),
        twelfthMarks: formData.twelfthMarks === '' ? undefined : Number(formData.twelfthMarks),
        entranceExam: formData.entranceExam.trim() || undefined,
        entranceRank: formData.entranceRank === '' ? undefined : Number(formData.entranceRank),
        personalDetails: {
          gender: formData.gender,
          dob: formData.dob,
          category: formData.category,
          bloodGroup: formData.bloodGroup,
          aadhaarNumber: formData.aadhaarNumber.trim(),
          permanentAddress: formData.permanentAddress.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pinCode: formData.pinCode.trim(),
        },
        parentDetails: {
          fatherName: formData.fatherName.trim(),
          motherName: formData.motherName.trim(),
          parentPhone: formData.parentPhone.trim(),
          annualIncome: formData.annualIncome,
        },
        enrollmentRecord: {
          rollNumber: formData.rollNumber.trim(),
          section: formData.section,
        },
      };

      await onSave(applicant.id, payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update student details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isEnrolled = applicant.admissionStatus === 'Enrolled';

  return (
    <div className="adm-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="adm-modal-card"
        style={{ maxWidth: '820px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="adm-modal-header" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                  Update Student Admission Details
                </h3>
                {isEnrolled && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#10b981', color: '#ffffff' }}>
                    ✓ ENROLLED
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#e0f2fe' }}>
                Application No: <strong>{applicant.applicationNo}</strong> · Candidate: <strong>{applicant.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'personal' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'personal' ? '3px solid #0284c7' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <User size={15} /> Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'academic' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'academic' ? '3px solid #0284c7' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <GraduationCap size={15} /> Academic &amp; Cohort Allocation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parents')}
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'parents' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'parents' ? '3px solid #0284c7' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Users size={15} /> Parent &amp; Guardian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualifications')}
            style={{
              padding: '12px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'qualifications' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'qualifications' ? '3px solid #0284c7' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={15} /> Prior Qualifications
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: 14 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Student Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="adm-input-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Personal Mobile (+91) *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="adm-input-control"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Personal Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="adm-input-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: 14 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Gender</label>
                  <select name="gender" className="adm-select-control" value={formData.gender} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="adm-input-control"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Social Category</label>
                  <select name="category" className="adm-select-control" value={formData.category} onChange={handleChange}>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Blood Group</label>
                  <select name="bloodGroup" className="adm-select-control" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: 14 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Aadhaar Card Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    className="adm-input-control"
                    placeholder="12 digit Aadhaar number"
                    maxLength={14}
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Permanent Address</label>
                  <input
                    type="text"
                    name="permanentAddress"
                    className="adm-input-control"
                    placeholder="Street / Village / Landmark"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">City / Town</label>
                  <input
                    type="text"
                    name="city"
                    className="adm-input-control"
                    placeholder="Bhubaneswar"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="adm-input-control"
                    placeholder="Odisha"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">PIN Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    className="adm-input-control"
                    placeholder="751024"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC & COHORT ALLOCATION */}
          {activeTab === 'academic' && (
            <div>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <strong style={{ fontSize: '0.85rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} /> Institutional Academic Cohort Allocation
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#0284c7' }}>
                  Updating the roll number or academic section will automatically synchronize the student's timetable, class notes sharing, and attendance roster.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: 14 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Assigned Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    className="adm-input-control"
                    placeholder="e.g. 26AIML0001 or 2305201001"
                    value={formData.rollNumber}
                    onChange={handleChange}
                  />
                  <small style={{ fontSize: '0.72rem', color: '#64748b' }}>Used for student portal login &amp; examination marksheets</small>
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Academic Section *</label>
                  <select
                    name="section"
                    className="adm-select-control"
                    value={formData.section}
                    onChange={handleChange}
                    required
                  >
                    <option value="Section A">Section A (Room 301 · Morning Shift)</option>
                    <option value="Section B">Section B (Room 302 · Regular Shift)</option>
                    <option value="Section C">Section C (Room 303 · Core Shift)</option>
                    <option value="Section D">Section D (Room 304 · Allied Shift)</option>
                  </select>
                  <small style={{ fontSize: '0.72rem', color: '#64748b' }}>Controls class notes access &amp; cohort study groups</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Admitted Programme</label>
                  <input
                    type="text"
                    className="adm-input-control"
                    value={formData.programmeName}
                    disabled
                    style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#475569' }}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Academic Session</label>
                  <input
                    type="text"
                    className="adm-input-control"
                    value={formData.academicYear}
                    disabled
                    style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#475569' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARENT & GUARDIAN DETAILS */}
          {activeTab === 'parents' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: 14 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Father's Full Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    className="adm-input-control"
                    placeholder="Father's Name"
                    value={formData.fatherName}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Mother's Full Name</label>
                  <input
                    type="text"
                    name="motherName"
                    className="adm-input-control"
                    placeholder="Mother's Name"
                    value={formData.motherName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Parent / Guardian Contact Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    className="adm-input-control"
                    placeholder="+91 98765 43210"
                    value={formData.parentPhone}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Family Annual Income (₹)</label>
                  <input
                    type="text"
                    name="annualIncome"
                    className="adm-input-control"
                    placeholder="e.g. ₹ 4,50,000"
                    value={formData.annualIncome}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIOR QUALIFICATIONS & ENTRANCE */}
          {activeTab === 'qualifications' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: 14 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Class 10th Aggregate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="tenthMarks"
                    className="adm-input-control"
                    placeholder="85.5"
                    value={formData.tenthMarks}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Class 12th / Intermediate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="twelfthMarks"
                    className="adm-input-control"
                    placeholder="82.0"
                    value={formData.twelfthMarks}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Entrance Exam Name</label>
                  <input
                    type="text"
                    name="entranceExam"
                    className="adm-input-control"
                    placeholder="JEE Main / OJEE / CUET"
                    value={formData.entranceExam}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-form-label">Entrance Rank</label>
                  <input
                    type="number"
                    name="entranceRank"
                    className="adm-input-control"
                    placeholder="e.g. 14250"
                    value={formData.entranceRank}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn-primary"
              disabled={saving}
              style={{ padding: '8px 22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {saving ? (
                <>Saving Changes...</>
              ) : (
                <>
                  <Save size={16} /> Save &amp; Synchronize Student Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

