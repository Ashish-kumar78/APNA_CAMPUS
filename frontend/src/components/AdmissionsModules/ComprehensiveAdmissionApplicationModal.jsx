import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Calendar,
  Building2,
  ShieldCheck,
  ChevronRight,
  Eye,
  Trash2,
  FileCheck,
  Check,
  Key,
  Copy,
  Printer,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.js';

// Verhoeff Algorithm lookup tables for Aadhaar checksum verification
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function validateVerhoeff(str) {
  const digits = String(str || '').replace(/\D/g, '');
  if (digits.length !== 12) return false;
  if (digits[0] === '0' || digits[0] === '1') return false;
  let c = 0;
  const reversed = digits.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][reversed[i]]];
  }
  return c === 0;
}

function computeAadhaarCheckDigit(first11Digits) {
  const digits = String(first11Digits || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length !== 11) return null;
  let c = 0;
  const reversed = digits.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][reversed[i]]];
  }
  return String(VERHOEFF_INV[c]);
}

function formatAadhaarDisplay(val) {
  const digits = String(val || '').replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

function isValidIndianMobile(val) {
  const digits = String(val || '').replace(/\D/g, '');
  const clean = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(clean);
}

function cleanIndianMobile(val) {
  const digits = String(val || '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

const STEPS = [
  { id: 1, title: 'Personal Information', short: 'Personal', icon: User },
  { id: 2, title: 'Parent & Guardian Details', short: 'Parents', icon: Users },
  { id: 3, title: 'Academic Qualifications', short: 'Academics', icon: GraduationCap },
  { id: 4, title: 'Entrance Examination', short: 'Entrance', icon: Award },
  { id: 5, title: 'Course & Program Selection', short: 'Course', icon: BookOpen },
  { id: 6, title: 'Document Uploads', short: 'Documents', icon: FileText },
  { id: 7, title: 'Review & Submit', short: 'Review', icon: CheckCircle2 },
];

const REQUIRED_DOCUMENTS = [
  { id: 'photo', name: 'Recent Passport Size Photograph', required: true },
  { id: 'signature', name: 'Applicant Signature', required: true },
  { id: 'tenth_marksheet', name: 'Class 10th Marksheet', required: true },
  { id: 'tenth_certificate', name: 'Class 10th Pass Certificate', required: false },
  { id: 'twelfth_marksheet', name: 'Class 12th / Intermediate Marksheet', required: true },
  { id: 'twelfth_certificate', name: 'Class 12th Pass Certificate', required: false },
  { id: 'transfer_cert', name: 'College Leaving / Transfer Certificate (CLC/TC)', required: false },
  { id: 'migration_cert', name: 'Migration Certificate', required: false },
  { id: 'character_cert', name: 'Conduct / Character Certificate', required: false },
  { id: 'entrance_scorecard', name: 'Entrance Exam Scorecard (JEE / OJEE / CUET)', required: false },
  { id: 'caste_cert', name: 'Caste Certificate (SC/ST/OBC/EWS)', required: false },
  { id: 'income_cert', name: 'Income Certificate', required: false },
  { id: 'domicile_cert', name: 'Resident / Domicile Certificate', required: false },
  { id: 'aadhaar_card', name: 'Aadhaar / Photo Identity Proof', required: false },
  { id: 'graduation_cert', name: 'Graduation / Diploma Marksheet (for PG/Lateral)', required: false },
];

export default function ComprehensiveAdmissionApplicationModal({
  isOpen,
  onClose,
  programmes = [],
  onApplicantCreated,
  isPublicMode = false,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Loaded programmes if not passed in
  const [availableProgrammes, setAvailableProgrammes] = useState(programmes);

  useEffect(() => {
    if (programmes && programmes.length > 0) {
      setAvailableProgrammes(programmes);
    } else {
      api.getProgrammes()
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setAvailableProgrammes(list);
        })
        .catch(() => {
          api.getPublicAdmissionProgrammes()
            .then((res) => setAvailableProgrammes(res?.data || []))
            .catch(() => {});
        });
    }
  }, [programmes]);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Personal
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    nationality: 'Indian',
    religion: 'Hindu',
    category: 'General',
    aadhaarNumber: '',
    maritalStatus: 'Unmarried',
    mobileNumber: '',
    alternateMobile: '',
    email: '',
    permAddress: '',
    permCity: '',
    permDistrict: '',
    permState: 'Odisha',
    permPin: '',
    permCountry: 'India',
    sameAddress: true,
    presAddress: '',
    presCity: '',
    presDistrict: '',
    presState: 'Odisha',
    presPin: '',
    presCountry: 'India',
    domicileState: 'Odisha',
    disability: 'No',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Father',

    // Step 2: Parent / Guardian
    fatherName: '',
    fatherOccupation: '',
    fatherMobile: '',
    fatherEmail: '',
    fatherIncome: '',
    fatherQualification: '',
    motherName: '',
    motherOccupation: '',
    motherMobile: '',
    motherEmail: '',
    motherIncome: '',
    motherQualification: '',
    guardianName: '',
    guardianRelation: '',
    guardianContact: '',
    guardianEmail: '',
    guardianAddress: '',
    familyAnnualIncome: '₹ 4,50,000',
    primaryContact: 'Father',

    // Step 3: Academic Qualifications
    tenthBoard: 'CBSE',
    tenthSchool: '',
    tenthYear: '2024',
    tenthRoll: '',
    tenthTotalMarks: '500',
    tenthObtainedMarks: '425',
    tenthPercentage: '85.0',
    tenthCgpa: '8.5',

    twelfthBoard: 'CHSE Odisha',
    twelfthCollege: '',
    twelfthYear: '2026',
    twelfthStream: 'Science',
    twelfthRoll: '',
    physicsMarks: '85',
    chemistryMarks: '82',
    mathMarks: '88',
    biologyMarks: '',
    englishMarks: '80',
    twelfthTotalMarks: '500',
    twelfthObtainedMarks: '415',
    twelfthPercentage: '83.0',
    twelfthCgpa: '8.3',

    hasDiploma: false,
    diplomaBranch: '',
    diplomaInstitute: '',
    diplomaYear: '',
    diplomaPercentage: '',

    hasGraduation: false,
    gradDegree: '',
    gradSpecialization: '',
    gradUniversity: '',
    gradYear: '',
    gradCgpa: '',

    // Step 4: Entrance Exams
    hasEntrance: true,
    entranceExamName: 'JEE Main',
    entranceExamYear: '2026',
    entranceRollNo: '',
    entranceScore: '89.5',
    entrancePercentile: '92.4',
    entranceRank: '24150',
    entranceCategoryRank: '12400',

    // Step 5: Course Selection
    academicYear: '2026-27',
    programmeId: '',
    studyMode: 'Full-Time Regular',
    admissionQuota: 'Merit (State/National)',
    secondPreference: '',
    thirdPreference: '',

    // Step 6: Documents
    documents: [],

    // Step 7: Agreement & Direct Provisioning
    agreedToTerms: false,
    directEnroll: !isPublicMode,
    initialPassword: 'Student@2026',
  });

  const fileInputRef = useRef(null);
  const [activeDocForUpload, setActiveDocForUpload] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Keep full name auto-synchronized
  const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ') || '';

  // Auto-fill present address if sameAddress is true
  useEffect(() => {
    if (form.sameAddress) {
      setForm((prev) => ({
        ...prev,
        presAddress: prev.permAddress,
        presCity: prev.permCity,
        presDistrict: prev.permDistrict,
        presState: prev.permState,
        presPin: prev.permPin,
        presCountry: prev.permCountry,
      }));
    }
  }, [form.sameAddress, form.permAddress, form.permCity, form.permDistrict, form.permState, form.permPin, form.permCountry]);

  // Pre-select first programme if available
  useEffect(() => {
    if (!form.programmeId && availableProgrammes.length > 0) {
      setForm((prev) => ({ ...prev, programmeId: availableProgrammes[0].id }));
    }
  }, [availableProgrammes, form.programmeId]);

  if (!isOpen) return null;

  const selectedProgramme = availableProgrammes.find((p) => p.id === form.programmeId) || availableProgrammes[0];

  const handleNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!form.firstName.trim() || !form.mobileNumber.trim() || !form.email.trim()) {
        setErrorMsg('Please enter candidate First Name, Mobile Number, and Email Address.');
        return;
      }
      if (!isValidIndianMobile(form.mobileNumber)) {
        setErrorMsg('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
        return;
      }
      const rawAadhaar = String(form.aadhaarNumber || '').replace(/\D/g, '');
      if (rawAadhaar.length > 0 && rawAadhaar.length !== 12) {
        setErrorMsg('Aadhaar Number must be exactly 12 digits (or leave it empty if optional).');
        return;
      }
      if (rawAadhaar.length === 12 && !validateVerhoeff(rawAadhaar)) {
        setErrorMsg('The entered 12-digit Aadhaar number has an invalid Verhoeff checksum. Click "Auto-Fix Check Digit" or re-enter accurately.');
        return;
      }
    } else if (currentStep === 2) {
      if (!form.fatherName.trim() && !form.motherName.trim() && !form.guardianName.trim()) {
        setErrorMsg('Please provide Father, Mother, or Guardian details.');
        return;
      }
    } else if (currentStep === 3) {
      if (!form.tenthPercentage || !form.twelfthPercentage) {
        setErrorMsg('Please enter Class 10th and 12th marks/percentage.');
        return;
      }
    } else if (currentStep === 5) {
      if (!form.programmeId) {
        setErrorMsg('Please select a course / programme of study.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const triggerDocUpload = (docId) => {
    setActiveDocForUpload(docId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocForUpload) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Selected file exceeds the 5MB size limit. Please upload a smaller file.');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const docMeta = REQUIRED_DOCUMENTS.find((d) => d.id === activeDocForUpload);
      setForm((prev) => {
        const remaining = prev.documents.filter((d) => d.id !== activeDocForUpload);
        return {
          ...prev,
          documents: [
            ...remaining,
            {
              id: activeDocForUpload,
              name: docMeta?.name || activeDocForUpload,
              fileName: file.name,
              fileSize: (file.size / 1024).toFixed(1) + ' KB',
              fileType: file.type,
              dataUrl: reader.result,
              status: 'Uploaded',
              uploadedAt: new Date().toISOString(),
            },
          ],
        };
      });
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docId) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));
  };

  const fixAadhaarDigit = () => {
    const raw = String(form.aadhaarNumber || '').replace(/\D/g, '');
    if (raw.length >= 11) {
      const prefix = raw.slice(0, 11);
      const correctLast = computeAadhaarCheckDigit(prefix);
      if (correctLast !== null) {
        const fixed = prefix + correctLast;
        setForm((prev) => ({ ...prev, aadhaarNumber: formatAadhaarDisplay(fixed) }));
        setErrorMsg('');
      }
    }
  };

  const copyCredentialsToClipboard = () => {
    if (!submittedData?.enrollment) return;
    const creds = `=== APNA CAMPUS ADMISSION CREDENTIALS ===
Student Name: ${submittedData.name}
Student ID / Login ID: ${submittedData.enrollment.studentId}
Roll Number: ${submittedData.enrollment.rollNumber}
Initial Password: ${submittedData.enrollment.initialPassword || 'Student@2026'}
Institutional Email: ${submittedData.enrollment.email}
Department: ${submittedData.enrollment.department}
Student Portal: http://localhost:5173
Status: ENROLLED (Active)`;
    navigator.clipboard.writeText(creds).then(() => {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.agreedToTerms) {
      setErrorMsg('Please agree to the institutional admissions declaration before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const prog = selectedProgramme || availableProgrammes[0];
    const payload = {
      name: fullName || 'Candidate',
      email: form.email.trim(),
      phone: cleanIndianMobile(form.mobileNumber),
      gender: form.gender,
      dob: form.dob || '2005-08-15',
      category: form.category,
      programmeId: prog.id,
      programmeName: prog.name,
      academicYear: form.academicYear,
      tenthMarks: parseFloat(form.tenthPercentage) || 85.0,
      twelfthMarks: parseFloat(form.twelfthPercentage) || 85.0,
      entranceExam: form.hasEntrance ? form.entranceExamName : 'Direct Merit',
      entranceRank: form.hasEntrance && form.entranceRank ? parseInt(form.entranceRank, 10) : null,
      documents: form.documents,
      directEnroll: !isPublicMode && form.directEnroll,
      initialPassword: form.initialPassword || 'Student@2026',
      // Comprehensive details stored inside JSON payload
      personalDetails: {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        bloodGroup: form.bloodGroup,
        nationality: form.nationality,
        religion: form.religion,
        aadhaarNumber: form.aadhaarNumber,
        maritalStatus: form.maritalStatus,
        alternateMobile: form.alternateMobile,
        permanentAddress: {
          address: form.permAddress,
          city: form.permCity,
          district: form.permDistrict,
          state: form.permState,
          pin: form.permPin,
          country: form.permCountry,
        },
        presentAddress: {
          address: form.presAddress,
          city: form.presCity,
          district: form.presDistrict,
          state: form.presState,
          pin: form.presPin,
          country: form.presCountry,
        },
        domicileState: form.domicileState,
        disability: form.disability,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation,
        },
      },
      parentDetails: {
        fatherName: form.fatherName,
        fatherOccupation: form.fatherOccupation,
        fatherMobile: form.fatherMobile,
        fatherEmail: form.fatherEmail,
        fatherIncome: form.fatherIncome,
        fatherQualification: form.fatherQualification,
        motherName: form.motherName,
        motherOccupation: form.motherOccupation,
        motherMobile: form.motherMobile,
        motherEmail: form.motherEmail,
        motherIncome: form.motherIncome,
        motherQualification: form.motherQualification,
        guardianName: form.guardianName,
        guardianRelation: form.guardianRelation,
        guardianContact: form.guardianContact,
        guardianEmail: form.guardianEmail,
        guardianAddress: form.guardianAddress,
        familyAnnualIncome: form.familyAnnualIncome,
        primaryContact: form.primaryContact,
      },
      academicDetails: {
        tenth: {
          board: form.tenthBoard,
          school: form.tenthSchool,
          year: form.tenthYear,
          roll: form.tenthRoll,
          total: form.tenthTotalMarks,
          obtained: form.tenthObtainedMarks,
          percentage: form.tenthPercentage,
          cgpa: form.tenthCgpa,
        },
        twelfth: {
          board: form.twelfthBoard,
          college: form.twelfthCollege,
          year: form.twelfthYear,
          stream: form.twelfthStream,
          roll: form.twelfthRoll,
          physics: form.physicsMarks,
          chemistry: form.chemistryMarks,
          mathematics: form.mathMarks,
          biology: form.biologyMarks,
          english: form.englishMarks,
          total: form.twelfthTotalMarks,
          obtained: form.twelfthObtainedMarks,
          percentage: form.twelfthPercentage,
        },
        diploma: form.hasDiploma ? {
          branch: form.diplomaBranch,
          institute: form.diplomaInstitute,
          year: form.diplomaYear,
          percentage: form.diplomaPercentage,
        } : null,
        graduation: form.hasGraduation ? {
          degree: form.gradDegree,
          specialization: form.gradSpecialization,
          university: form.gradUniversity,
          year: form.gradYear,
          cgpa: form.gradCgpa,
        } : null,
      },
      entranceDetails: form.hasEntrance ? {
        examName: form.entranceExamName,
        year: form.entranceExamYear,
        rollNo: form.entranceRollNo,
        score: form.entranceScore,
        percentile: form.entrancePercentile,
        rank: form.entranceRank,
        categoryRank: form.entranceCategoryRank,
      } : null,
      preferences: {
        first: prog.name,
        second: form.secondPreference || 'B.Tech Computer Science & Engineering',
        third: form.thirdPreference || 'B.Tech Electronics & Communication',
      },
    };

    try {
      let res;
      if (isPublicMode) {
        res = await api.applyPublicAdmission(payload);
      } else {
        res = await api.createApplicant(payload);
      }

      const applicantData = res?.data || res?.applicant || res;
      const enrollmentData = res?.enrollment || res?.data?.enrollment || applicantData?.enrollment || null;

      // Cache student passport photo for immediate portal appearance
      const uploadedPhotoDoc = form.documents.find((d) => d.id === 'photo' || /passport|photo/i.test(d.name || d.fileName || ''));
      const photoDataUrl = uploadedPhotoDoc?.dataUrl || enrollmentData?.photo;
      if (photoDataUrl && enrollmentData) {
        try {
          if (enrollmentData.studentId) localStorage.setItem(`apna_student_photo_${enrollmentData.studentId}`, photoDataUrl);
          if (enrollmentData.rollNumber) localStorage.setItem(`apna_student_photo_${enrollmentData.rollNumber}`, photoDataUrl);
        } catch (_) {}
      }

      setSubmittedData({
        applicationNo: applicantData.applicationNo,
        name: applicantData.name,
        email: applicantData.email,
        programmeName: prog.name,
        session: form.academicYear,
        enrollment: enrollmentData,
        photoUrl: photoDataUrl,
      });

      if (onApplicantCreated) {
        onApplicantCreated(applicantData);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit admission application. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-backdrop" onClick={onClose} style={{ zIndex: 99998 }}>
      <div
        className="adm-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: 'min(920px, 96vw)',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                APNA CAMPUS · ADMISSION APPLICATION (2026-27)
              </h2>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Complete Institutional Student Onboarding &amp; Registration Lifecycle
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        {!submittedData && (
          <div
            style={{
              display: 'flex',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              overflowX: 'auto',
              padding: '10px 16px',
              gap: '8px',
            }}
          >
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.id;
              const isPast = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    border: isCurrent
                      ? '1px solid #0284c7'
                      : isPast
                      ? '1px solid #bbf7d0'
                      : '1px solid #e2e8f0',
                    background: isCurrent
                      ? '#e0f2fe'
                      : isPast
                      ? '#f0fdf4'
                      : '#ffffff',
                    color: isCurrent
                      ? '#0284c7'
                      : isPast
                      ? '#16a34a'
                      : '#64748b',
                    fontSize: '0.74rem',
                    fontWeight: isCurrent ? 700 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={13} />
                  <span>{step.id}. {step.short}</span>
                  {isPast && <Check size={12} color="#16a34a" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Form Scroll Body */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            background: '#ffffff',
          }}
        >
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.84rem',
                marginBottom: '18px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUCCESS CONFIRMATION SCREEN                              */}
          {/* ========================================================= */}
          {submittedData ? (
            <div style={{ textAlign: 'center', padding: '30px 16px' }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={38} color="#16a34a" />
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                {submittedData.enrollment ? 'Student Profile & Admission Confirmed!' : 'Application Registered Successfully!'}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.86rem', margin: '0 0 20px' }}>
                {submittedData.enrollment
                  ? 'Official permanent student profile, institutional email, and portal credentials have been generated.'
                  : 'Your institutional application has been accepted into the admissions registry for scrutiny.'}
              </p>

              {/* Official Credential Slip if Enrolled */}
              {submittedData.enrollment ? (
                <div
                  style={{
                    maxWidth: '560px',
                    margin: '0 auto 24px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {submittedData.photoUrl && (
                        <img
                          src={submittedData.photoUrl}
                          alt={submittedData.name}
                          style={{
                            width: '46px',
                            height: '56px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid #cbd5e1',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                          }}
                        />
                      )}
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Apna Campus · Official Student Credentials Slip
                        </span>
                        <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {submittedData.name}
                        </h4>
                      </div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> ENROLLED
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>
                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Student ID / Login ID
                      </span>
                      <strong style={{ color: '#0284c7', fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                        {submittedData.enrollment.studentId}
                      </strong>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        University Roll Number
                      </span>
                      <strong style={{ color: '#0f172a', fontSize: '1.05rem', letterSpacing: '0.02em' }}>
                        {submittedData.enrollment.rollNumber}
                      </strong>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Initial Portal Password
                      </span>
                      <strong style={{ color: '#dc2626', fontSize: '1rem', fontFamily: 'monospace' }}>
                        {submittedData.enrollment.initialPassword || form.initialPassword || 'Student@2026'}
                      </strong>
                    </div>

                    <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Enrolled Programme &amp; Dept
                      </span>
                      <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>
                        {submittedData.enrollment.department || submittedData.programmeName}
                      </strong>
                    </div>
                  </div>

                  <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span style={{ color: '#64748b' }}>Official Institutional Email:</span>
                      <strong style={{ color: '#0f172a' }}>{submittedData.enrollment.email}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span style={{ color: '#64748b' }}>Application Reference:</span>
                      <strong style={{ color: '#0284c7' }}>{submittedData.applicationNo}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span style={{ color: '#64748b' }}>Academic Session:</span>
                      <strong style={{ color: '#0f172a' }}>{submittedData.session}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={copyCredentialsToClipboard}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Copy size={14} />
                      {copiedNotice ? '✓ Credentials Copied!' : 'Copy Credentials'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Printer size={14} />
                      Print Admission Slip
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    maxWidth: '460px',
                    margin: '0 auto 24px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '0.84rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Application Number</span>
                    <strong style={{ color: '#0284c7', fontSize: '0.96rem' }}>{submittedData.applicationNo}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Applicant Name</span>
                    <strong style={{ color: '#0f172a' }}>{submittedData.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Programme</span>
                    <strong style={{ color: '#0f172a' }}>{submittedData.programmeName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: '#64748b' }}>Academic Session</span>
                    <strong style={{ color: '#0f172a' }}>{submittedData.session}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="adm-btn-primary"
                onClick={onClose}
                style={{ padding: '10px 26px', fontSize: '0.9rem', borderRadius: '8px' }}
              >
                Close &amp; Return to Registry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* ===================================================== */}
              {/* STEP 1: PERSONAL INFORMATION                         */}
              {/* ===================================================== */}
              {currentStep === 1 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    1. Student Personal &amp; Contact Details
                  </h3>

                  {/* Row 1: Candidate Names (3 Equal Columns) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      First Name *
                      <input
                        className="adm-search-input"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="Rahul"
                        style={{ marginTop: '4px' }}
                      />
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Middle Name
                      <input
                        className="adm-search-input"
                        value={form.middleName}
                        onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                        placeholder="Kumar"
                        style={{ marginTop: '4px' }}
                      />
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Last Name *
                      <input
                        className="adm-search-input"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Sahoo"
                        style={{ marginTop: '4px' }}
                      />
                    </label>
                  </div>

                  {/* Row 2: Demographic Identity (Full Name 2fr, DOB 1fr, Gender 1fr) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Full Legal Name
                      <input
                        className="adm-search-input"
                        readOnly
                        value={fullName || 'Auto-generated from first & last name'}
                        style={{ background: '#f8fafc', color: '#334155', fontWeight: 700, marginTop: '4px' }}
                      />
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Date of Birth *
                      <input
                        className="adm-search-input"
                        type="date"
                        required
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        style={{ marginTop: '4px' }}
                      />
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Gender *
                      <select
                        className="adm-select-control"
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        style={{ marginTop: '4px' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                  </div>

                  {/* Row 3: Institutional & Demographic Details (4 Columns) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Category *
                      <select
                        className="adm-select-control"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        style={{ marginTop: '4px' }}
                      >
                        <option value="General">General / Open</option>
                        <option value="OBC">OBC (Other Backward Class)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="EWS">EWS (Economically Weaker Section)</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Blood Group
                      <select
                        className="adm-select-control"
                        value={form.bloodGroup}
                        onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                        style={{ marginTop: '4px' }}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Nationality
                      <input
                        className="adm-search-input"
                        value={form.nationality}
                        onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                        placeholder="Indian"
                        style={{ marginTop: '4px' }}
                      />
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Religion
                      <input
                        className="adm-search-input"
                        value={form.religion}
                        onChange={(e) => setForm({ ...form, religion: e.target.value })}
                        placeholder="Hindu / Muslim / Christian / Sikh"
                        style={{ marginTop: '4px' }}
                      />
                    </label>
                  </div>

                  {/* Row 4: Contact & Identity (4 Columns with Indian Mobile & Verified Aadhaar) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
                    {/* Mobile Number with Indian Validation */}
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Mobile Number *
                      <div style={{ display: 'flex', marginTop: '4px' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRight: 'none',
                            borderRadius: '6px 0 0 6px',
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          +91
                        </span>
                        <input
                          className="adm-search-input"
                          type="tel"
                          required
                          value={form.mobileNumber}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setForm({ ...form, mobileNumber: cleaned });
                          }}
                          placeholder="9876543210"
                          style={{ borderRadius: '0 6px 6px 0' }}
                        />
                      </div>
                      {form.mobileNumber && (
                        <div style={{ marginTop: '4px', fontSize: '0.68rem' }}>
                          {isValidIndianMobile(form.mobileNumber) ? (
                            <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Valid Indian Mobile</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>10 digits starting with 6, 7, 8, or 9</span>
                          )}
                        </div>
                      )}
                    </label>

                    {/* Alternate Mobile */}
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Alternate Mobile
                      <input
                        className="adm-search-input"
                        type="tel"
                        value={form.alternateMobile}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setForm({ ...form, alternateMobile: cleaned });
                        }}
                        placeholder="Optional 10-digit number"
                        style={{ marginTop: '4px' }}
                      />
                    </label>

                    {/* Personal Email */}
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Personal Email Address *
                      <input
                        className="adm-search-input"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="candidate@gmail.com"
                        style={{ marginTop: '4px' }}
                      />
                      {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                        <span style={{ color: '#dc2626', fontSize: '0.68rem', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                          Enter a valid email address
                        </span>
                      )}
                    </label>

                    {/* Aadhaar Number with Verhoeff Checksum & Auto-Fix */}
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Aadhaar Number (UIDAI)
                      <input
                        className="adm-search-input"
                        value={form.aadhaarNumber}
                        onChange={(e) => {
                          const formatted = formatAadhaarDisplay(e.target.value);
                          setForm({ ...form, aadhaarNumber: formatted });
                        }}
                        placeholder="XXXX XXXX XXXX"
                        style={{ marginTop: '4px', letterSpacing: '0.04em' }}
                      />
                      {form.aadhaarNumber && (
                        <div style={{ marginTop: '4px', fontSize: '0.68rem' }}>
                          {String(form.aadhaarNumber).replace(/\D/g, '').length === 12 ? (
                            validateVerhoeff(form.aadhaarNumber) ? (
                              <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Check size={11} /> ✓ Verified UIDAI Aadhaar Number
                              </span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ Invalid Checksum</span>
                                <button
                                  type="button"
                                  onClick={fixAadhaarDigit}
                                  style={{
                                    background: '#0284c7',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Auto-Fix Check Digit
                                </button>
                              </div>
                            )
                          ) : (
                            <span style={{ color: '#64748b' }}>
                              {12 - String(form.aadhaarNumber).replace(/\D/g, '').length} digits remaining
                            </span>
                          )}
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Permanent Address */}
                  <h4 style={{ margin: '18px 0 10px', fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Permanent Address
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <input
                      className="adm-search-input"
                      placeholder="Street / House No / Landmark"
                      value={form.permAddress}
                      onChange={(e) => setForm({ ...form, permAddress: e.target.value })}
                    />
                    <input
                      className="adm-search-input"
                      placeholder="City / Town"
                      value={form.permCity}
                      onChange={(e) => setForm({ ...form, permCity: e.target.value })}
                    />
                    <input
                      className="adm-search-input"
                      placeholder="State"
                      value={form.permState}
                      onChange={(e) => setForm({ ...form, permState: e.target.value })}
                    />
                    <input
                      className="adm-search-input"
                      placeholder="PIN Code"
                      value={form.permPin}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setForm({ ...form, permPin: digits });
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.sameAddress}
                        onChange={(e) => setForm({ ...form, sameAddress: e.target.checked })}
                      />
                      Present Address Same as Permanent Address
                    </label>
                  </div>

                  {!form.sameAddress && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <input
                        className="adm-search-input"
                        placeholder="Present Street / Hostel / Address"
                        value={form.presAddress}
                        onChange={(e) => setForm({ ...form, presAddress: e.target.value })}
                      />
                      <input
                        className="adm-search-input"
                        placeholder="Present City"
                        value={form.presCity}
                        onChange={(e) => setForm({ ...form, presCity: e.target.value })}
                      />
                      <input
                        className="adm-search-input"
                        placeholder="Present State"
                        value={form.presState}
                        onChange={(e) => setForm({ ...form, presState: e.target.value })}
                      />
                      <input
                        className="adm-search-input"
                        placeholder="PIN Code"
                        value={form.presPin}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setForm({ ...form, presPin: digits });
                        }}
                      />
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <h4 style={{ margin: '18px 0 10px', fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Primary Emergency Contact
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Emergency Contact Name
                      <input
                        className="adm-search-input"
                        value={form.emergencyName}
                        onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                        placeholder="Father / Guardian Name"
                        style={{ marginTop: '4px' }}
                      />
                    </label>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Emergency Contact Mobile
                      <input
                        className="adm-search-input"
                        type="tel"
                        value={form.emergencyPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setForm({ ...form, emergencyPhone: digits });
                        }}
                        placeholder="10-digit mobile number"
                        style={{ marginTop: '4px' }}
                      />
                    </label>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Relationship with Student
                      <input
                        className="adm-search-input"
                        value={form.emergencyRelation}
                        onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                        placeholder="Father / Mother / Guardian"
                        style={{ marginTop: '4px' }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 2: PARENT & GUARDIAN DETAILS                    */}
              {/* ===================================================== */}
              {currentStep === 2 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    2. Parent &amp; Guardian Information
                  </h3>

                  {/* Father's Details */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      Father's Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Full Name
                        <input className="adm-search-input" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="Sanjay Mohapatra" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Occupation
                        <input className="adm-search-input" value={form.fatherOccupation} onChange={(e) => setForm({ ...form, fatherOccupation: e.target.value })} placeholder="Government / Business" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Mobile Number
                        <input className="adm-search-input" type="tel" value={form.fatherMobile} onChange={(e) => setForm({ ...form, fatherMobile: e.target.value })} placeholder="+91 94370 12345" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Annual Income
                        <input className="adm-search-input" value={form.fatherIncome} onChange={(e) => setForm({ ...form, fatherIncome: e.target.value })} placeholder="₹ 6,00,000" />
                      </label>
                    </div>
                  </div>

                  {/* Mother's Details */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      Mother's Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Full Name
                        <input className="adm-search-input" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} placeholder="Meenakshi Mohapatra" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Occupation
                        <input className="adm-search-input" value={form.motherOccupation} onChange={(e) => setForm({ ...form, motherOccupation: e.target.value })} placeholder="Homemaker / Teacher" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Mobile Number
                        <input className="adm-search-input" type="tel" value={form.motherMobile} onChange={(e) => setForm({ ...form, motherMobile: e.target.value })} placeholder="+91 94370 67890" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Annual Income
                        <input className="adm-search-input" value={form.motherIncome} onChange={(e) => setForm({ ...form, motherIncome: e.target.value })} placeholder="₹ 3,50,000" />
                      </label>
                    </div>
                  </div>

                  {/* Contact Preference */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Primary Parent Contact Preference
                      <select
                        className="adm-select-control"
                        value={form.primaryContact}
                        onChange={(e) => setForm({ ...form, primaryContact: e.target.value })}
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Family Combined Annual Income
                      <input
                        className="adm-search-input"
                        value={form.familyAnnualIncome}
                        onChange={(e) => setForm({ ...form, familyAnnualIncome: e.target.value })}
                        placeholder="₹ 5,00,000"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 3: ACADEMIC QUALIFICATIONS                      */}
              {/* ===================================================== */}
              {currentStep === 3 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    3. Academic Background &amp; Subject Results
                  </h3>

                  {/* Class 10 */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      Class 10th (Secondary) Examination Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Board
                        <input className="adm-search-input" value={form.tenthBoard} onChange={(e) => setForm({ ...form, tenthBoard: e.target.value })} placeholder="CBSE / ICSE / State" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Passing Year
                        <input className="adm-search-input" value={form.tenthYear} onChange={(e) => setForm({ ...form, tenthYear: e.target.value })} placeholder="2024" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Roll Number
                        <input className="adm-search-input" value={form.tenthRoll} onChange={(e) => setForm({ ...form, tenthRoll: e.target.value })} placeholder="1245892" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Percentage (%) *
                        <input className="adm-search-input" type="number" step="0.1" required value={form.tenthPercentage} onChange={(e) => setForm({ ...form, tenthPercentage: e.target.value })} placeholder="85.5" />
                      </label>
                    </div>
                  </div>

                  {/* Class 12 */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      Class 12th / Intermediate Examination Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Board
                        <input className="adm-search-input" value={form.twelfthBoard} onChange={(e) => setForm({ ...form, twelfthBoard: e.target.value })} placeholder="CBSE / CHSE" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Stream
                        <select className="adm-select-control" value={form.twelfthStream} onChange={(e) => setForm({ ...form, twelfthStream: e.target.value })}>
                          <option value="Science">Science (PCM / PCB)</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts / Humanities</option>
                          <option value="Other">Vocational / Other</option>
                        </select>
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Passing Year
                        <input className="adm-search-input" value={form.twelfthYear} onChange={(e) => setForm({ ...form, twelfthYear: e.target.value })} placeholder="2026" />
                      </label>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600 }}>Overall Percentage (%) *
                        <input className="adm-search-input" type="number" step="0.1" required value={form.twelfthPercentage} onChange={(e) => setForm({ ...form, twelfthPercentage: e.target.value })} placeholder="84.2" />
                      </label>
                    </div>

                    {form.twelfthStream === 'Science' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600 }}>Physics
                          <input className="adm-search-input" value={form.physicsMarks} onChange={(e) => setForm({ ...form, physicsMarks: e.target.value })} placeholder="85" />
                        </label>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600 }}>Chemistry
                          <input className="adm-search-input" value={form.chemistryMarks} onChange={(e) => setForm({ ...form, chemistryMarks: e.target.value })} placeholder="82" />
                        </label>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600 }}>Mathematics
                          <input className="adm-search-input" value={form.mathMarks} onChange={(e) => setForm({ ...form, mathMarks: e.target.value })} placeholder="88" />
                        </label>
                        <label style={{ fontSize: '0.72rem', fontWeight: 600 }}>English
                          <input className="adm-search-input" value={form.englishMarks} onChange={(e) => setForm({ ...form, englishMarks: e.target.value })} placeholder="80" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 4: ENTRANCE EXAMINATIONS                         */}
              {/* ===================================================== */}
              {currentStep === 4 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    4. Entrance Examination Ranks &amp; Percentiles
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.hasEntrance}
                        onChange={(e) => setForm({ ...form, hasEntrance: e.target.checked })}
                      />
                      Appeared in National / State Entrance Examination (JEE / OJEE / CUET / NEET / CAT)
                    </label>
                  </div>

                  {form.hasEntrance && (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          Examination Name
                          <select
                            className="adm-select-control"
                            value={form.entranceExamName}
                            onChange={(e) => setForm({ ...form, entranceExamName: e.target.value })}
                          >
                            <option value="JEE Main">JEE Main</option>
                            <option value="JEE Advanced">JEE Advanced</option>
                            <option value="OJEE">OJEE (Odisha JEE)</option>
                            <option value="CUET">CUET (UG / PG)</option>
                            <option value="NEET">NEET</option>
                            <option value="CAT">CAT (for MBA)</option>
                            <option value="Institutional Merit">Apna Campus Merit</option>
                          </select>
                        </label>

                        <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          Examination Year
                          <input
                            className="adm-search-input"
                            value={form.entranceExamYear}
                            onChange={(e) => setForm({ ...form, entranceExamYear: e.target.value })}
                            placeholder="2026"
                          />
                        </label>

                        <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          Application / Roll Number
                          <input
                            className="adm-search-input"
                            value={form.entranceRollNo}
                            onChange={(e) => setForm({ ...form, entranceRollNo: e.target.value })}
                            placeholder="26031024589"
                          />
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          All-India Rank (AIR)
                          <input
                            className="adm-search-input"
                            type="number"
                            value={form.entranceRank}
                            onChange={(e) => setForm({ ...form, entranceRank: e.target.value })}
                            placeholder="24500"
                          />
                        </label>

                        <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          Percentile
                          <input
                            className="adm-search-input"
                            value={form.entrancePercentile}
                            onChange={(e) => setForm({ ...form, entrancePercentile: e.target.value })}
                            placeholder="92.4 %"
                          />
                        </label>

                        <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          Category Rank (if applicable)
                          <input
                            className="adm-search-input"
                            value={form.entranceCategoryRank}
                            onChange={(e) => setForm({ ...form, entranceCategoryRank: e.target.value })}
                            placeholder="8200"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 5: COURSE & PROGRAM SELECTION                   */}
              {/* ===================================================== */}
              {currentStep === 5 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    5. Academic Programme Selection &amp; Course Preferences
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '18px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Primary Desired Academic Programme *
                      <select
                        className="adm-select-control"
                        required
                        value={form.programmeId}
                        onChange={(e) => setForm({ ...form, programmeId: e.target.value })}
                        style={{ fontSize: '0.88rem', padding: '10px 12px' }}
                      >
                        {availableProgrammes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Academic Session
                      <input
                        className="adm-search-input"
                        readOnly
                        value={form.academicYear}
                        style={{ background: '#f8fafc', fontWeight: 700 }}
                      />
                    </label>
                  </div>

                  {/* Program Detail Card */}
                  {selectedProgramme && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        border: '1px solid #bae6fd',
                        borderRadius: '12px',
                        padding: '18px',
                        marginBottom: '20px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                          Degree: {selectedProgramme.degreeType || 'Undergraduate (UG)'} · Dept: {selectedProgramme.departmentCode || 'Engineering'}
                        </span>
                        <span className="adm-badge-pill verified">Admissions Open</span>
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0c4a6e' }}>
                        {selectedProgramme.name}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '12px', fontSize: '0.78rem' }}>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Duration</span>
                          <div style={{ fontWeight: 700 }}>{selectedProgramme.durationYears || 4} Years ({selectedProgramme.totalSemesters || 8} Sems)</div>
                        </div>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Credits</span>
                          <div style={{ fontWeight: 700 }}>{selectedProgramme.creditsRequired || 160} Credits</div>
                        </div>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Eligibility</span>
                          <div style={{ fontWeight: 700 }}>10+2 PCM &ge; 45%</div>
                        </div>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Semester Fee</span>
                          <div style={{ fontWeight: 700, color: '#0284c7' }}>₹ 45,000 / Sem</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Second Preference (Alternative Branch)
                      <select
                        className="adm-select-control"
                        value={form.secondPreference}
                        onChange={(e) => setForm({ ...form, secondPreference: e.target.value })}
                      >
                        <option value="">Choose alternative branch</option>
                        {availableProgrammes.map((p) => (
                          <option key={`2nd-${p.id}`} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </label>

                    <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Third Preference
                      <select
                        className="adm-select-control"
                        value={form.thirdPreference}
                        onChange={(e) => setForm({ ...form, thirdPreference: e.target.value })}
                      >
                        <option value="">Choose alternative branch</option>
                        {availableProgrammes.map((p) => (
                          <option key={`3rd-${p.id}`} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 6: DOCUMENT UPLOADS                             */}
              {/* ===================================================== */}
              {currentStep === 6 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    6. Upload Mandatory Qualification Documents
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b' }}>
                    Accepted formats: PDF, JPG, PNG (Max 5MB each). Real file uploads are archived for institutional verification.
                  </p>

                  {/* Hidden Native File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                    {REQUIRED_DOCUMENTS.map((doc) => {
                      const uploadedDoc = form.documents.find((d) => d.id === doc.id);
                      const isUploaded = !!uploadedDoc;
                      return (
                        <div
                          key={doc.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: isUploaded ? '#f0fdf4' : '#f8fafc',
                            border: isUploaded ? '1px solid #86efac' : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            gap: '10px',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.name} {doc.required && <span style={{ color: '#b91c1c' }}>*</span>}
                            </div>
                            {isUploaded ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>
                                  ✓ Uploaded
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#64748b', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {uploadedDoc.fileName} ({uploadedDoc.fileSize})
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                Pending upload
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isUploaded && (
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(uploadedDoc)}
                                title="Preview Document"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#e0f2fe',
                                  color: '#0284c7',
                                  border: 'none',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <Eye size={12} />
                                <span style={{ marginLeft: '4px' }}>View</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => triggerDocUpload(doc.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: isUploaded ? '#dcfce7' : '#0284c7',
                                color: isUploaded ? '#15803d' : '#ffffff',
                                border: 'none',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Upload size={12} />
                              {isUploaded ? 'Replace' : 'Upload File'}
                            </button>

                            {isUploaded && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(doc.id)}
                                title="Remove Document"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: 'none',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* STEP 7: REVIEW & FINAL SUBMIT                        */}
              {/* ===================================================== */}
              {currentStep === 7 && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    7. Application Review &amp; Declaration
                  </h3>

                  {/* Summary Dossier Box */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '18px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Candidate Name</span>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{fullName || 'Candidate'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Applied Programme</span>
                        <div style={{ fontWeight: 800, color: '#0284c7' }}>{selectedProgramme?.name}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Academic Session</span>
                        <div style={{ fontWeight: 700 }}>{form.academicYear}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Contact Info</span>
                        <div style={{ fontWeight: 600 }}>+91 {form.mobileNumber} · {form.email}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>10th Score</span>
                        <div style={{ fontWeight: 700 }}>{form.tenthPercentage}% ({form.tenthBoard})</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>12th Score</span>
                        <div style={{ fontWeight: 700 }}>{form.twelfthPercentage}% ({form.twelfthStream})</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Entrance Exam</span>
                        <div style={{ fontWeight: 700 }}>{form.hasEntrance ? `${form.entranceExamName} (Rank: ${form.entranceRank || 'N/A'})` : 'Direct Merit'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Documents Uploaded</span>
                        <div style={{ fontWeight: 700, color: form.documents.length > 0 ? '#16a34a' : '#64748b' }}>
                          {form.documents.length} Files Attached
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Staff Mode: Immediate Student Account & ID Generation */}
                  {!isPublicMode && (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '10px',
                        padding: '16px',
                        marginBottom: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.86rem', color: '#166534' }}>
                          <input
                            type="checkbox"
                            checked={form.directEnroll}
                            onChange={(e) => setForm({ ...form, directEnroll: e.target.checked })}
                          />
                          ⚡ Immediate Student ID &amp; Portal Account Generation
                        </label>
                        <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          Admission Cell Desk
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: '0.76rem', color: '#166534' }}>
                        When enabled, the system instantly provisions a permanent Student ID, Roll Number, official institutional email, and sets their initial portal password so the student can log in directly without any activation step.
                      </p>
                      {form.directEnroll && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534' }}>Initial Student Portal Password</label>
                            <input
                              className="adm-search-input"
                              value={form.initialPassword}
                              onChange={(e) => setForm({ ...form, initialPassword: e.target.value })}
                              placeholder="Student@2026"
                              style={{ background: '#ffffff', fontWeight: 600, marginTop: '3px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534' }}>Onboarding Status</label>
                            <input
                              className="adm-search-input"
                              readOnly
                              value="ENROLLED · Direct Portal Login Ready"
                              style={{ background: '#ffffff', fontWeight: 700, color: '#16a34a', marginTop: '3px' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Declaration */}
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      marginBottom: '20px',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8rem', color: '#92400e', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        required
                        checked={form.agreedToTerms}
                        onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        I hereby declare that all particulars stated in this application are true, complete, and correct to the best of my knowledge and belief. I agree to abide by the rules and regulations of Apna Campus Autonomous College.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="adm-btn-secondary"
                      onClick={handlePrev}
                      disabled={submitting}
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  {currentStep < 7 ? (
                    <button
                      type="button"
                      className="adm-btn-primary"
                      onClick={handleNext}
                    >
                      Next Step <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="adm-btn-primary"
                      disabled={submitting || !form.agreedToTerms}
                      style={{ background: '#16a34a', borderColor: '#16a34a' }}
                    >
                      {submitting ? 'Submitting Application…' : (form.directEnroll ? '✓ Confirm Admission & Generate ID' : '✓ Final Submit Application')}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Document In-Modal Preview */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px',
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  {previewDoc.name}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {previewDoc.fileName} · {previewDoc.fileSize}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', textAlign: 'center', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewDoc.fileType?.startsWith('image/') || previewDoc.dataUrl?.startsWith('data:image/') ? (
                <img
                  src={previewDoc.dataUrl}
                  alt={previewDoc.name}
                  style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '6px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <FileText size={56} color="#0284c7" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: '0 0 6px' }}>
                    {previewDoc.fileName}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 16px' }}>
                    PDF Document ({previewDoc.fileSize})
                  </p>
                  <a
                    href={previewDoc.dataUrl}
                    download={previewDoc.fileName}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      background: '#0284c7',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <ExternalLink size={14} /> Open / Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

