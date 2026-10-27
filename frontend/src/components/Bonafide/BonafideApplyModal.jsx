import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck,
  Briefcase,
  Award,
  GraduationCap,
  Calendar,
  Building2,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  Users,
  ShieldCheck,
  Eye,
  Send,
  Save,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import BonafideDocUpload from './BonafideDocUpload';
import BonafideDocPreviewModal from './BonafideDocPreviewModal';
import './BonafideModal.css';

const PURPOSES = [
  {
    id: 'INTERNSHIP',
    title: 'Internship Bonafide Certificate',
    tag: 'Placement Department',
    icon: Briefcase,
    color: '#2563eb',
    badge: 'Template A',
    description: 'For students selected for summer/winter industrial internships, corporate training, or project work requiring official institutional verification.',
    approvalFlow: 'Student → Placement Dept Review → Approved & Issued',
  },
  {
    id: 'SCHOLARSHIP_HOSTELLER',
    title: 'Scholarship Bonafide & Hostel Declaration',
    tag: 'Scholarship Cell & Principal',
    icon: Award,
    color: '#059669',
    badge: 'Template B',
    description: 'Official declaration of enrolled student and verified hosteller/boarder status for PRERANA, NSP, and State/Central post-matric scholarship schemes.',
    approvalFlow: 'Student → Scholarship Cell (Stage 1) → Principal (Stage 2) → Scholarship Cell (Stage 3) → Issued',
  },
  {
    id: 'STUDY_LOAN',
    title: 'Education / Study Loan & Fee Structure',
    tag: 'Scholarship & Accounts',
    icon: DollarSign,
    color: '#d97706',
    badge: 'Template C',
    description: 'Bonafide certificate with official 4-Year B.Tech course fee structure, hostel/mess breakdown, and institutional bank details for education loan applications.',
    approvalFlow: 'Student → Scholarship Cell (Stage 1) → Principal (Stage 2) → Scholarship Cell (Stage 3) → Issued',
  },
  {
    id: 'EXTERNAL_EVENT',
    title: 'External Event / Hackathon Authorization',
    tag: 'Academic & Principal',
    icon: Users,
    color: '#7c3aed',
    badge: 'Template D',
    description: 'Official institutional authorization letter for participation in national hackathons, BPUT competitions, technical conferences, or external seminars.',
    approvalFlow: 'Student → Scholarship Cell (Stage 1) → Principal (Stage 2) → Scholarship Cell (Stage 3) → Issued',
  },
];

// Master fee structure components for B.Tech
const STANDARD_FEE_COMPONENTS = {
  tuitionFee: 130000,
  developmentFee: 30000,
  labLibraryFee: 20000,
  examFee: 7000,
  hostelFee: 48000,
  messFee: 36000,
};

export default function BonafideApplyModal({
  isOpen,
  onClose,
  account,
  onSuccess,
  editApplication = null, // if passed, editing rejected or draft
}) {
  const [step, setStep] = useState(editApplication ? 2 : 1);
  const [selectedPurpose, setSelectedPurpose] = useState(
    editApplication?.purpose || 'INTERNSHIP'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Supportive Documents State (PDF, JPG, PNG, DOCX)
  const [internshipDoc, setInternshipDoc] = useState(null);
  const [scholarshipDoc, setScholarshipDoc] = useState(null);
  const [loanDoc, setLoanDoc] = useState(null);
  const [eventDoc, setEventDoc] = useState(null);

  // Document preview modal
  const [docPreviewModalOpen, setDocPreviewModalOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Student Auto-populated fields
    studentName: account?.name || 'Rakesh Das',
    registrationNumber: account?.registrationNumber || account?.rollNumber || '2305201001',
    parentName: account?.fatherName || account?.parentName || 'Mr. B. K. Das',
    course: account?.course || account?.program || 'B.Tech',
    department: account?.department || account?.branch || 'Computer Science & Engineering',
    currentYear: account?.year || '3rd Year',
    currentSemester: account?.semester || '6th Semester',
    academicYear: '2026-2027',
    collegeName: 'Gandhi Institute For Technology (GIFT) Autonomous, Bhubaneswar',
    collegeEmail: account?.email || 'rakesh.das@gift.edu.in',
    contactNumber: account?.phone || '+91 98610 23010',

    // Template A: Internship
    companyName: '',
    internshipRole: '',
    startDate: '',
    endDate: '',
    locationMode: 'On-site',
    internshipLocation: 'Bhubaneswar, Odisha',
    internshipPurpose: 'Industrial Internship for academic curriculum credit',
    offerLetterUrl: '',
    additionalRemarks: '',

    // Template B: Scholarship Hosteller
    scholarshipScheme: 'PRERANA Post-Matric Scholarship Scheme',
    scholarshipAcademicYear: '2026-2027',
    studentCategory: 'OBC',
    hostelStatus: account?.hostelName ? 'Hosteller' : 'Hosteller',
    hostelName: account?.hostelName || 'Sarojini Girls Residence (Block A)',
    roomNumber: account?.roomNumber || '204',
    hostelAdmissionDate: '2024-08-10',
    hostelFeeRemarks: '₹42,000 per semester (Boarding & Lodging as per GIFT Autonomous Hostel Rules)',
    supportingDocUrl: '',

    // Template C: Study Loan
    bankName: 'State Bank of India',
    bankBranch: 'GIFT Autonomous Square Branch, Bhubaneswar',
    loanApplicationRef: '',
    loanPurpose: 'B.Tech 4-Year Professional Degree Education Financing',
    isHostellerLoan: true,
    hostelAccommodationRequired: 'Yes',

    // Template D: External Event
    eventName: 'BPUT Inter-College Hackathon 2026',
    organizerName: 'Biju Patnaik University of Technology (BPUT), Rourkela',
    eventLocation: 'BPUT Central Campus, Rourkela',
    eventStartDate: '',
    eventEndDate: '',
    eventWebsite: 'https://bput.ac.in/hackathon2026',
    participationType: 'Team',
    teamName: 'ByteBuilders GIFT',
    teamMembers: `${account?.name || 'Rakesh Das'} (Lead, ${account?.registrationNumber || '2305201001'}), Priya Sahu (2305201015), Rohan Verma (2305201042)`,
    facultyMentor: 'Prof. S. K. Mohapatra (Dept. of CSE)',
    eventPurpose: 'Final round algorithmic software development and live prototype demonstration',
    collegeSponsorship: 'Nominated by College Technical Committee',

    // Common
    requiredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    declarationAccepted: false,
  });

  // Populate from editApplication if present
  useEffect(() => {
    if (editApplication) {
      setSelectedPurpose(editApplication.purpose);
      const data = editApplication.formData || {};
      setFormData((prev) => ({
        ...prev,
        ...data,
        declarationAccepted: false,
      }));

      // Restore supportive document if present
      const docs = editApplication.supportingDocs || [];
      const primaryDoc = docs[0] || data.offerLetterDoc || data.scholarshipDoc || data.loanDoc || data.eventDoc;
      if (primaryDoc) {
        if (editApplication.purpose === 'INTERNSHIP') setInternshipDoc(primaryDoc);
        else if (editApplication.purpose === 'SCHOLARSHIP_HOSTELLER') setScholarshipDoc(primaryDoc);
        else if (editApplication.purpose === 'STUDY_LOAN') setLoanDoc(primaryDoc);
        else if (editApplication.purpose === 'EXTERNAL_EVENT') setEventDoc(primaryDoc);
      }
      setStep(2);
    }
  }, [editApplication]);

  // Update hostel details if account has hostel info
  useEffect(() => {
    if (account?.hostelName) {
      setFormData((prev) => ({
        ...prev,
        hostelName: account.hostelName,
        roomNumber: account.roomNumber || prev.roomNumber,
      }));
    }
  }, [account]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateFeeStructure = (isHosteller) => {
    const years = ['1st Year (2024-25)', '2nd Year (2025-26)', '3rd Year (2026-27)', '4th Year (2027-28)'];
    const academicAnnual =
      STANDARD_FEE_COMPONENTS.tuitionFee +
      STANDARD_FEE_COMPONENTS.developmentFee +
      STANDARD_FEE_COMPONENTS.labLibraryFee +
      STANDARD_FEE_COMPONENTS.examFee; // 1,87,000

    const hostelAnnual = isHosteller
      ? STANDARD_FEE_COMPONENTS.hostelFee + STANDARD_FEE_COMPONENTS.messFee // 84,000
      : 0;

    const totalAnnual = academicAnnual + hostelAnnual;

    return {
      years,
      academicAnnual,
      hostelAnnual,
      totalAnnual,
      grandTotal: totalAnnual * 4,
      academicGrandTotal: academicAnnual * 4,
      hostelGrandTotal: hostelAnnual * 4,
    };
  };

  const feeData = calculateFeeStructure(formData.isHostellerLoan);

  const handleSubmit = async (isDraft = false) => {
    setErrorMessage('');

    if (!isDraft && !formData.declarationAccepted) {
      setErrorMessage('Please accept the institutional declaration before submitting.');
      return;
    }

    if (!isDraft) {
      // Validate purpose-specific required fields
      if (selectedPurpose === 'INTERNSHIP') {
        if (!formData.companyName || !formData.internshipRole || !formData.startDate || !formData.endDate) {
          setErrorMessage('Please fill in all mandatory internship fields (Company, Role, and Dates).');
          return;
        }
      } else if (selectedPurpose === 'SCHOLARSHIP_HOSTELLER') {
        if (!formData.scholarshipScheme) {
          setErrorMessage('Please specify the scholarship scheme / name.');
          return;
        }
      } else if (selectedPurpose === 'STUDY_LOAN') {
        if (!formData.bankName) {
          setErrorMessage('Please specify the Bank or Financial Institution name.');
          return;
        }
      } else if (selectedPurpose === 'EXTERNAL_EVENT') {
        if (!formData.eventName || !formData.organizerName || !formData.eventStartDate) {
          setErrorMessage('Please enter the event name, organizer, and event start date.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const activeDoc =
        selectedPurpose === 'INTERNSHIP' ? internshipDoc :
        selectedPurpose === 'SCHOLARSHIP_HOSTELLER' ? scholarshipDoc :
        selectedPurpose === 'STUDY_LOAN' ? loanDoc :
        eventDoc;

      const supportingDocsList = activeDoc ? [activeDoc] : [];

      const payload = {
        purpose: selectedPurpose,
        purposeTitle: selectedPurposeObj?.title || selectedPurpose,
        isDraft,
        formData: {
          ...formData,
          feeStructure: selectedPurpose === 'STUDY_LOAN' ? feeData : undefined,
          supportingDocs: supportingDocsList,
          offerLetterDoc: selectedPurpose === 'INTERNSHIP' ? internshipDoc : undefined,
          scholarshipDoc: selectedPurpose === 'SCHOLARSHIP_HOSTELLER' ? scholarshipDoc : undefined,
          loanDoc: selectedPurpose === 'STUDY_LOAN' ? loanDoc : undefined,
          eventDoc: selectedPurpose === 'EXTERNAL_EVENT' ? eventDoc : undefined,
          offerLetterUrl: internshipDoc ? (internshipDoc.fileName || internshipDoc.name) : (formData.offerLetterUrl || ''),
          supportingDocUrl: scholarshipDoc ? (scholarshipDoc.fileName || scholarshipDoc.name) : (formData.supportingDocUrl || ''),
        },
        supportingDocs: supportingDocsList,
      };

      if (editApplication?.id) {
        // Resubmit or update draft
        if (editApplication.status === 'DRAFT') {
          await api.updateBonafideDraft(editApplication.id, payload);
        } else {
          await api.resubmitBonafideApplication(editApplication.id, {
            formData: payload.formData,
            resubmissionNotes: 'Updated application with corrected details as requested.',
            supportingDocs: payload.supportingDocs,
          });
        }
      } else {
        await api.createBonafideApplication(payload);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit bonafide application:', err);
      setErrorMessage(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPurposeObj = PURPOSES.find((p) => p.id === selectedPurpose);

  return (
    <div className="bonafide-modal-backdrop" onClick={onClose}>
      <div
        className="bonafide-modal-card bonafide-modal-large"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bonafide-modal-title"
      >
        {/* Modal Header */}
        <div className="bonafide-modal-header">
          <div className="bonafide-modal-header-info">
            <div className="bonafide-modal-icon-wrap" style={{ backgroundColor: `${selectedPurposeObj?.color}15`, color: selectedPurposeObj?.color }}>
              <FileCheck size={24} />
            </div>
            <div>
              <h2 id="bonafide-modal-title" className="bonafide-modal-title">
                {editApplication ? `Update Bonafide Application (#${editApplication.applicationNumber})` : 'Apply for Official Bonafide Certificate'}
              </h2>
              <p className="bonafide-modal-subtitle">
                Gandhi Institute For Technology (GIFT) Autonomous, Bhubaneswar • Student Services Portal
              </p>
            </div>
          </div>
          <button className="bonafide-modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        {!editApplication && (
          <div className="bonafide-steps-bar">
            <div className={`bonafide-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="bonafide-step-number">{step > 1 ? <Check size={14} /> : '1'}</div>
              <span className="bonafide-step-label">Select Purpose</span>
            </div>
            <div className="bonafide-step-divider" />
            <div className={`bonafide-step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="bonafide-step-number">{step > 2 ? <Check size={14} /> : '2'}</div>
              <span className="bonafide-step-label">Complete Details</span>
            </div>
            <div className="bonafide-step-divider" />
            <div className={`bonafide-step-item ${step === 3 ? 'active' : ''}`}>
              <div className="bonafide-step-number">3</div>
              <span className="bonafide-step-label">Review & Submit</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bonafide-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="bonafide-modal-body">
          {/* STEP 1: PURPOSE SELECTION */}
          {step === 1 && (
            <div className="bonafide-purpose-grid">
              <div className="bonafide-section-head">
                <h3>Select Certificate Purpose</h3>
                <p>Choose the official purpose for your certificate. Each purpose has a dedicated institutional template and verified workflow.</p>
              </div>

              <div className="bonafide-purposes-cards">
                {PURPOSES.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPurpose === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`bonafide-purpose-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedPurpose(p.id)}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="bonafide-purpose-top">
                        <div className="bonafide-purpose-icon" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                          <Icon size={22} />
                        </div>
                        <span className="bonafide-template-badge" style={{ borderColor: p.color, color: p.color }}>
                          {p.badge}
                        </span>
                      </div>
                      <h4 className="bonafide-purpose-title">{p.title}</h4>
                      <p className="bonafide-purpose-desc">{p.description}</p>
                      <div className="bonafide-purpose-flow">
                        <span className="bonafide-flow-label">Approval Route:</span>
                        <span className="bonafide-flow-text">{p.approvalFlow}</span>
                      </div>
                      <div className="bonafide-purpose-select-indicator">
                        {isSelected ? <CheckCircle2 size={18} color="#2563eb" /> : <div className="bonafide-radio-circle" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC FORM */}
          {step === 2 && (
            <div className="bonafide-form-container">
              {/* Purpose Banner */}
              <div className="bonafide-purpose-banner" style={{ borderLeftColor: selectedPurposeObj?.color }}>
                <div>
                  <span className="bonafide-banner-badge">{selectedPurposeObj?.badge}</span>
                  <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 600 }}>{selectedPurposeObj?.title}</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>Workflow: {selectedPurposeObj?.approvalFlow}</p>
                </div>
                {!editApplication && (
                  <button className="bonafide-change-purpose-btn" onClick={() => setStep(1)}>
                    Change Purpose
                  </button>
                )}
              </div>

              {/* 1. Verified Student Profile (Auto-populated) */}
              <div className="bonafide-form-section">
                <div className="bonafide-section-title">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>1. Verified Student Academic Profile (Auto-Populated from GIFT Records)</span>
                </div>
                <div className="bonafide-grid-3">
                  <div className="bonafide-field">
                    <label>Full Student Name</label>
                    <input type="text" name="studentName" value={formData.studentName} readOnly className="readonly-input" />
                  </div>
                  <div className="bonafide-field">
                    <label>Registration / Roll Number</label>
                    <input type="text" name="registrationNumber" value={formData.registrationNumber} readOnly className="readonly-input" />
                  </div>
                  <div className="bonafide-field">
                    <label>Parent / Guardian Name</label>
                    <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} />
                  </div>
                  <div className="bonafide-field">
                    <label>Programme / Course</label>
                    <input type="text" name="course" value={formData.course} readOnly className="readonly-input" />
                  </div>
                  <div className="bonafide-field">
                    <label>Department / Branch</label>
                    <input type="text" name="department" value={formData.department} readOnly className="readonly-input" />
                  </div>
                  <div className="bonafide-field">
                    <label>Current Semester & Year</label>
                    <input type="text" value={`${formData.currentYear} (${formData.currentSemester})`} readOnly className="readonly-input" />
                  </div>
                  <div className="bonafide-field">
                    <label>Academic Year</label>
                    <input type="text" name="academicYear" value={formData.academicYear} readOnly className="readonly-input" />
                  </div>
                  <div className="bonafide-field">
                    <label>Institutional Email</label>
                    <input type="text" name="collegeEmail" value={formData.collegeEmail} readOnly className="readonly-input" />
                  </div>
                  <div className="bonafide-field">
                    <label>Contact Phone</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* 2. Dynamic Purpose Fields */}

              {/* TEMPLATE A: INTERNSHIP BONAFIDE */}
              {selectedPurpose === 'INTERNSHIP' && (
                <div className="bonafide-form-section">
                  <div className="bonafide-section-title">
                    <Briefcase size={16} className="text-blue-600" />
                    <span>2. Internship & Corporate Engagement Details</span>
                  </div>
                  <div className="bonafide-grid-2">
                    <div className="bonafide-field">
                      <label>Internship Company / Organization <span className="req">*</span></label>
                      <input
                        type="text"
                        name="companyName"
                        placeholder="e.g. Tata Consultancy Services, Microsoft, Tech Mahindra"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Internship Designation / Role <span className="req">*</span></label>
                      <input
                        type="text"
                        name="internshipRole"
                        placeholder="e.g. Full Stack Developer Intern, Data Science Intern"
                        value={formData.internshipRole}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Internship Start Date <span className="req">*</span></label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                    </div>
                    <div className="bonafide-field">
                      <label>Internship End Date <span className="req">*</span></label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                    </div>
                    <div className="bonafide-field">
                      <label>Location or Mode</label>
                      <select name="locationMode" value={formData.locationMode} onChange={handleChange}>
                        <option value="On-site">On-site (Physical Office)</option>
                        <option value="Remote">Remote (Virtual Internship)</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="bonafide-field">
                      <label>City / Work Location</label>
                      <input
                        type="text"
                        name="internshipLocation"
                        placeholder="e.g. Bhubaneswar / Bengaluru / Remote"
                        value={formData.internshipLocation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="bonafide-field" style={{ marginTop: '12px' }}>
                    <label>Internship Purpose & Verification Requirement</label>
                    <input
                      type="text"
                      name="internshipPurpose"
                      value={formData.internshipPurpose}
                      onChange={handleChange}
                    />
                  </div>

                  <BonafideDocUpload
                    label="Supporting Offer Letter / Selection Proof"
                    hint="Upload official offer letter, selection email, or training letter from the hiring organization (PDF, JPG, PNG, DOCX — Max 10 MB)."
                    value={internshipDoc}
                    onChange={setInternshipDoc}
                    maxSizeMB={10}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  />

                  <div className="bonafide-field" style={{ marginTop: '12px' }}>
                    <label>Additional Remarks for Training & Placement Department</label>
                    <textarea
                      name="additionalRemarks"
                      rows={2}
                      placeholder="Any specific instructions, company HR email for CC, or format requirements..."
                      value={formData.additionalRemarks}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* TEMPLATE B: SCHOLARSHIP HOSTELLER */}
              {selectedPurpose === 'SCHOLARSHIP_HOSTELLER' && (
                <div className="bonafide-form-section">
                  <div className="bonafide-section-title">
                    <Award size={16} className="text-emerald-600" />
                    <span>2. Scholarship Scheme & Authoritative Hostel Boarder Records</span>
                  </div>

                  <div className="bonafide-grid-2">
                    <div className="bonafide-field">
                      <label>Scholarship Name / Scheme <span className="req">*</span></label>
                      <input
                        type="text"
                        name="scholarshipScheme"
                        placeholder="e.g. PRERANA Post-Matric Scholarship, National Scholarship Portal (NSP)"
                        value={formData.scholarshipScheme}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Scholarship Academic Year</label>
                      <input
                        type="text"
                        name="scholarshipAcademicYear"
                        value={formData.scholarshipAcademicYear}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Student Category / Social Reservation</label>
                      <select name="studentCategory" value={formData.studentCategory} onChange={handleChange}>
                        <option value="General">General / Unreserved</option>
                        <option value="OBC">OBC (Other Backward Classes)</option>
                        <option value="SEBC">SEBC (Socially & Educationally Backward)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="EWS">EWS (Economically Weaker Section)</option>
                      </select>
                    </div>
                    <div className="bonafide-field">
                      <label>Hostel Residency Status</label>
                      <select name="hostelStatus" value={formData.hostelStatus} onChange={handleChange}>
                        <option value="Hosteller">Verified Hosteller / Boarder (On-Campus)</option>
                        <option value="Outside Resident">Day Scholar / Outside Resident</option>
                      </select>
                    </div>
                  </div>

                  {/* Authoritative Hostel Verification Box */}
                  <div className="bonafide-hostel-verified-card">
                    <div className="bonafide-hostel-badge">
                      <CheckCircle2 size={16} color="#059669" />
                      <strong>Authoritative Hostel Record Linked</strong>
                    </div>
                    <p className="bonafide-hostel-note">
                      Per GIFT Autonomous Institutional Registry, hostel boarder declarations are verified against actual hostel allocation ledgers.
                    </p>
                    <div className="bonafide-grid-3" style={{ marginTop: '8px' }}>
                      <div className="bonafide-field">
                        <label>Hostel Name / Block</label>
                        <input
                          type="text"
                          name="hostelName"
                          value={formData.hostelName}
                          onChange={handleChange}
                          placeholder="e.g. Sarojini Girls Residence / Aryabhatta Block"
                        />
                      </div>
                      <div className="bonafide-field">
                        <label>Room Number</label>
                        <input
                          type="text"
                          name="roomNumber"
                          value={formData.roomNumber}
                          onChange={handleChange}
                          placeholder="e.g. 204"
                        />
                      </div>
                      <div className="bonafide-field">
                        <label>Admission / Occupancy Date</label>
                        <input
                          type="date"
                          name="hostelAdmissionDate"
                          value={formData.hostelAdmissionDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bonafide-field" style={{ marginTop: '12px' }}>
                    <label>Hostel Fee & Mess Boarding Details</label>
                    <input
                      type="text"
                      name="hostelFeeRemarks"
                      value={formData.hostelFeeRemarks}
                      onChange={handleChange}
                      placeholder="e.g. ₹42,000/sem as per GIFT Autonomous Hostel Gazette"
                    />
                  </div>

                  <BonafideDocUpload
                    label="Supporting Scholarship Portal Application / Document"
                    hint="Upload PRERANA / NSP portal drafted application acknowledgement, caste certificate, or income proof (PDF, JPG, PNG, DOCX — Max 10 MB)."
                    value={scholarshipDoc}
                    onChange={setScholarshipDoc}
                    maxSizeMB={10}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  />
                </div>
              )}

              {/* TEMPLATE C: STUDY LOAN & 4-YEAR FEE SCHEDULE */}
              {selectedPurpose === 'STUDY_LOAN' && (
                <div className="bonafide-form-section">
                  <div className="bonafide-section-title">
                    <DollarSign size={16} className="text-amber-600" />
                    <span>2. Banking Institution & 4-Year B.Tech Approved Course Fee Schedule</span>
                  </div>

                  <div className="bonafide-grid-2">
                    <div className="bonafide-field">
                      <label>Bank / Financial Institution Name <span className="req">*</span></label>
                      <input
                        type="text"
                        name="bankName"
                        placeholder="e.g. State Bank of India, Punjab National Bank, Canara Bank"
                        value={formData.bankName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Bank Branch & IFSC / Address</label>
                      <input
                        type="text"
                        name="bankBranch"
                        placeholder="e.g. GIFT Autonomous Square Branch, Bhubaneswar"
                        value={formData.bankBranch}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Loan Application Reference / Account ID (if allotted)</label>
                      <input
                        type="text"
                        name="loanApplicationRef"
                        placeholder="e.g. SBI-EDU-2026-904812"
                        value={formData.loanApplicationRef}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Purpose of Loan</label>
                      <input
                        type="text"
                        name="loanPurpose"
                        value={formData.loanPurpose}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Supporting Document Upload for Education Loan */}
                  <BonafideDocUpload
                    label="Supporting Loan Application / Bank Sanction / Fee Estimate Slip"
                    hint="Upload bank loan application copy, sanction letter, or provisional course fee estimate slip (PDF, JPG, PNG, DOCX — Max 10 MB)."
                    value={loanDoc}
                    onChange={setLoanDoc}
                    maxSizeMB={10}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  />

                  {/* Residency Selection determining fee schedule */}
                  <div className="bonafide-residency-toggle-box">
                    <label className="bonafide-residency-label">Student Residency for Course Fee Computation:</label>
                    <div className="bonafide-residency-options">
                      <label className={`bonafide-residency-pill ${formData.isHostellerLoan ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="isHostellerLoan"
                          checked={formData.isHostellerLoan === true}
                          onChange={() => setFormData((p) => ({ ...p, isHostellerLoan: true }))}
                        />
                        <span>Hosteller (Includes Academic Fees + Hostel Accommodation + Mess Charges)</span>
                      </label>
                      <label className={`bonafide-residency-pill ${!formData.isHostellerLoan ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="isHostellerLoan"
                          checked={formData.isHostellerLoan === false}
                          onChange={() => setFormData((p) => ({ ...p, isHostellerLoan: false }))}
                        />
                        <span>Day Scholar / Outside Resident (Academic & Institutional Fees Only)</span>
                      </label>
                    </div>
                  </div>

                  {/* Live 4-Year Course Fee Table */}
                  <div className="bonafide-fee-table-wrap">
                    <div className="bonafide-fee-table-header">
                      <strong>Official 4-Year B.Tech Fee Structure (GIFT Autonomous Approved Schedule)</strong>
                      <span className="bonafide-fee-currency">All figures in INR (₹)</span>
                    </div>
                    <table className="bonafide-fee-table">
                      <thead>
                        <tr>
                          <th>Fee Head / Component</th>
                          <th>1st Year</th>
                          <th>2nd Year</th>
                          <th>3rd Year</th>
                          <th>4th Year</th>
                          <th>4-Year Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Tuition Fee (Approved by Govt of Odisha Fee Reg. Committee)</td>
                          <td>₹1,30,000</td>
                          <td>₹1,30,000</td>
                          <td>₹1,30,000</td>
                          <td>₹1,30,000</td>
                          <td><strong>₹5,20,000</strong></td>
                        </tr>
                        <tr>
                          <td>Institutional Development & Infrastructure Fee</td>
                          <td>₹30,000</td>
                          <td>₹30,000</td>
                          <td>₹30,000</td>
                          <td>₹30,000</td>
                          <td><strong>₹1,20,000</strong></td>
                        </tr>
                        <tr>
                          <td>Laboratory, Library & Technical Consumables</td>
                          <td>₹20,000</td>
                          <td>₹20,000</td>
                          <td>₹20,000</td>
                          <td>₹20,000</td>
                          <td><strong>₹80,000</strong></td>
                        </tr>
                        <tr>
                          <td>University Registration & Examination Charges</td>
                          <td>₹7,000</td>
                          <td>₹7,000</td>
                          <td>₹7,000</td>
                          <td>₹7,000</td>
                          <td><strong>₹28,000</strong></td>
                        </tr>
                        <tr className="fee-subtotal-row">
                          <td><strong>Academic Subtotal (A)</strong></td>
                          <td><strong>₹1,87,000</strong></td>
                          <td><strong>₹1,87,000</strong></td>
                          <td><strong>₹1,87,000</strong></td>
                          <td><strong>₹1,87,000</strong></td>
                          <td><strong className="text-blue-700">₹7,48,000</strong></td>
                        </tr>
                        {formData.isHostellerLoan && (
                          <>
                            <tr className="hostel-fee-row">
                              <td>Hostel Accommodation & Amenities Charge</td>
                              <td>₹48,000</td>
                              <td>₹48,000</td>
                              <td>₹48,000</td>
                              <td>₹48,000</td>
                              <td><strong>₹1,92,000</strong></td>
                            </tr>
                            <tr className="hostel-fee-row">
                              <td>Hostel Mess & Fooding Charge</td>
                              <td>₹36,000</td>
                              <td>₹36,000</td>
                              <td>₹36,000</td>
                              <td>₹36,000</td>
                              <td><strong>₹1,44,000</strong></td>
                            </tr>
                            <tr className="fee-subtotal-row">
                              <td><strong>Hostel & Mess Subtotal (B)</strong></td>
                              <td><strong>₹84,000</strong></td>
                              <td><strong>₹84,000</strong></td>
                              <td><strong>₹84,000</strong></td>
                              <td><strong>₹84,000</strong></td>
                              <td><strong className="text-emerald-700">₹3,36,000</strong></td>
                            </tr>
                          </>
                        )}
                        <tr className="fee-grand-total-row">
                          <td><strong>GRAND TOTAL ESTIMATED EXPENSES ({formData.isHostellerLoan ? 'A + B' : 'A'})</strong></td>
                          <td><strong>₹{feeData.totalAnnual.toLocaleString('en-IN')}</strong></td>
                          <td><strong>₹{feeData.totalAnnual.toLocaleString('en-IN')}</strong></td>
                          <td><strong>₹{feeData.totalAnnual.toLocaleString('en-IN')}</strong></td>
                          <td><strong>₹{feeData.totalAnnual.toLocaleString('en-IN')}</strong></td>
                          <td><strong className="text-indigo-900" style={{ fontSize: '15px' }}>₹{feeData.grandTotal.toLocaleString('en-IN')}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TEMPLATE D: EXTERNAL EVENT / HACKATHON AUTHORIZATION */}
              {selectedPurpose === 'EXTERNAL_EVENT' && (
                <div className="bonafide-form-section">
                  <div className="bonafide-section-title">
                    <Users size={16} className="text-purple-600" />
                    <span>2. External Event, Hackathon or Competition Details</span>
                  </div>

                  <div className="bonafide-grid-2">
                    <div className="bonafide-field">
                      <label>Event / Competition Name <span className="req">*</span></label>
                      <input
                        type="text"
                        name="eventName"
                        placeholder="e.g. BPUT Inter-College Hackathon 2026, Smart India Hackathon"
                        value={formData.eventName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Organizing Institution / University <span className="req">*</span></label>
                      <input
                        type="text"
                        name="organizerName"
                        placeholder="e.g. Biju Patnaik University of Technology (BPUT), Rourkela"
                        value={formData.organizerName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Event Venue / Location</label>
                      <input
                        type="text"
                        name="eventLocation"
                        placeholder="e.g. BPUT Campus, Rourkela / IIT Bhubaneswar"
                        value={formData.eventLocation}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Event Website / Portal</label>
                      <input
                        type="text"
                        name="eventWebsite"
                        value={formData.eventWebsite}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Event Start Date <span className="req">*</span></label>
                      <input type="date" name="eventStartDate" value={formData.eventStartDate} onChange={handleChange} required />
                    </div>
                    <div className="bonafide-field">
                      <label>Event End Date</label>
                      <input type="date" name="eventEndDate" value={formData.eventEndDate} onChange={handleChange} />
                    </div>
                    <div className="bonafide-field">
                      <label>Participation Format</label>
                      <select name="participationType" value={formData.participationType} onChange={handleChange}>
                        <option value="Team">Team Participation</option>
                        <option value="Individual">Individual Participation</option>
                      </select>
                    </div>
                    <div className="bonafide-field">
                      <label>Team Name (if applicable)</label>
                      <input
                        type="text"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleChange}
                        placeholder="e.g. ByteBuilders GIFT"
                      />
                    </div>
                  </div>

                  <div className="bonafide-field" style={{ marginTop: '12px' }}>
                    <label>Team Members (Name & Registration Numbers)</label>
                    <textarea
                      name="teamMembers"
                      rows={2}
                      placeholder="e.g. Rakesh Das (2305201001), Priya Sahu (2305201015)..."
                      value={formData.teamMembers}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bonafide-grid-2" style={{ marginTop: '12px' }}>
                    <div className="bonafide-field">
                      <label>Faculty Mentor / Department Coordinator</label>
                      <input
                        type="text"
                        name="facultyMentor"
                        placeholder="e.g. Prof. S. K. Mohapatra (Dept. of CSE)"
                        value={formData.facultyMentor}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bonafide-field">
                      <label>Institutional Nomination / Sponsorship</label>
                      <input
                        type="text"
                        name="collegeSponsorship"
                        placeholder="e.g. Nominated by College Technical Committee"
                        value={formData.collegeSponsorship}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="bonafide-field" style={{ marginTop: '12px' }}>
                    <label>Event Purpose & Academic Objectives</label>
                    <input
                      type="text"
                      name="eventPurpose"
                      value={formData.eventPurpose}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Supporting Document Upload for External Event */}
                  <BonafideDocUpload
                    label="Supporting Event Brochure / Invitation / Selection Letter"
                    hint="Upload official hackathon brochure, event selection confirmation, or organizer invitation letter (PDF, JPG, PNG, DOCX — Max 10 MB)."
                    value={eventDoc}
                    onChange={setEventDoc}
                    maxSizeMB={10}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  />
                </div>
              )}

              {/* 3. Common Certificate Delivery Date & Institutional Declaration */}
              <div className="bonafide-form-section">
                <div className="bonafide-section-title">
                  <Calendar size={16} className="text-slate-700" />
                  <span>3. Required Certificate Date & Student Declaration</span>
                </div>

                <div className="bonafide-grid-2">
                  <div className="bonafide-field">
                    <label>Certificate Required By (Target Date)</label>
                    <input
                      type="date"
                      name="requiredDate"
                      value={formData.requiredDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="bonafide-declaration-box">
                  <label className="bonafide-declaration-label">
                    <input
                      type="checkbox"
                      name="declarationAccepted"
                      checked={formData.declarationAccepted}
                      onChange={handleChange}
                    />
                    <span>
                      I hereby declare that all information furnished above is true, accurate, and verified against my bona fide enrolment records at GIFT Autonomous, Bhubaneswar. I understand that misrepresentation of details or fraudulent certificate requests shall attract disciplinary action under institutional regulations.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & LIVE DRAFT PREVIEW */}
          {step === 3 && (
            <div className="bonafide-review-summary">
              <div className="bonafide-review-header">
                <CheckCircle2 size={32} color="#059669" />
                <div>
                  <h3>Ready for Submission</h3>
                  <p>Please review your details before submitting to the authorized review department.</p>
                </div>
              </div>

              <div className="bonafide-review-card">
                <div className="bonafide-review-row">
                  <span className="bonafide-review-label">Certificate Purpose</span>
                  <strong className="bonafide-review-value">{selectedPurposeObj?.title}</strong>
                </div>
                <div className="bonafide-review-row">
                  <span className="bonafide-review-label">Student Name & Roll</span>
                  <span className="bonafide-review-value">{formData.studentName} ({formData.registrationNumber})</span>
                </div>
                <div className="bonafide-review-row">
                  <span className="bonafide-review-label">Programme & Branch</span>
                  <span className="bonafide-review-value">{formData.course} in {formData.department}</span>
                </div>
                <div className="bonafide-review-row">
                  <span className="bonafide-review-label">Current Academic Level</span>
                  <span className="bonafide-review-value">{formData.currentYear} • {formData.currentSemester}</span>
                </div>

                {selectedPurpose === 'INTERNSHIP' && (
                  <>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Company & Role</span>
                      <span className="bonafide-review-value">{formData.companyName} — {formData.internshipRole}</span>
                    </div>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Internship Duration</span>
                      <span className="bonafide-review-value">{formData.startDate} to {formData.endDate} ({formData.locationMode})</span>
                    </div>
                  </>
                )}

                {selectedPurpose === 'SCHOLARSHIP_HOSTELLER' && (
                  <>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Scholarship Scheme</span>
                      <span className="bonafide-review-value">{formData.scholarshipScheme} ({formData.scholarshipAcademicYear})</span>
                    </div>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Hostel Residence</span>
                      <span className="bonafide-review-value">{formData.hostelName}, Room {formData.roomNumber}</span>
                    </div>
                  </>
                )}

                {selectedPurpose === 'STUDY_LOAN' && (
                  <>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Bank & Branch</span>
                      <span className="bonafide-review-value">{formData.bankName} ({formData.bankBranch})</span>
                    </div>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Residency Category</span>
                      <span className="bonafide-review-value">{formData.isHostellerLoan ? 'Hosteller (Academic + Hostel Fees)' : 'Day Scholar (Academic Fees Only)'}</span>
                    </div>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">4-Year Grand Total</span>
                      <strong className="bonafide-review-value text-indigo-800">₹{feeData.grandTotal.toLocaleString('en-IN')}</strong>
                    </div>
                  </>
                )}

                {selectedPurpose === 'EXTERNAL_EVENT' && (
                  <>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Event & Organizer</span>
                      <span className="bonafide-review-value">{formData.eventName} — {formData.organizerName}</span>
                    </div>
                    <div className="bonafide-review-row">
                      <span className="bonafide-review-label">Event Dates</span>
                      <span className="bonafide-review-value">{formData.eventStartDate} to {formData.eventEndDate || 'Same Day'}</span>
                    </div>
                  </>
                )}

                {/* Uploaded Supporting Document Row */}
                {(() => {
                  const activeDoc =
                    selectedPurpose === 'INTERNSHIP' ? internshipDoc :
                    selectedPurpose === 'SCHOLARSHIP_HOSTELLER' ? scholarshipDoc :
                    selectedPurpose === 'STUDY_LOAN' ? loanDoc :
                    eventDoc;

                  if (!activeDoc) return null;

                  return (
                    <div className="bonafide-review-row" style={{ alignItems: 'center' }}>
                      <span className="bonafide-review-label">Supporting Document</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="bonafide-review-value" style={{ fontWeight: 600 }}>
                          {activeDoc.fileName || activeDoc.name}
                        </span>
                        <span className="bonafide-file-size-pill">
                          {activeDoc.fileSize}
                        </span>
                        <button
                          type="button"
                          className="bonafide-upload-action-btn view-btn"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => {
                            setSelectedPreviewDoc(activeDoc);
                            setDocPreviewModalOpen(true);
                          }}
                        >
                          <Eye size={12} />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div className="bonafide-review-row">
                  <span className="bonafide-review-label">Routing Queue</span>
                  <span className="bonafide-review-value text-blue-700 font-semibold">{selectedPurposeObj?.approvalFlow}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bonafide-modal-footer">
          <div className="bonafide-footer-left">
            {step === 2 && !editApplication && (
              <button className="bonafide-btn-secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back to Purpose
              </button>
            )}
            {step === 3 && (
              <button className="bonafide-btn-secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Edit Details
              </button>
            )}
          </div>

          <div className="bonafide-footer-right">
            <button className="bonafide-btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>

            {step === 2 && (
              <>
                <button
                  className="bonafide-btn-outline"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  title="Save draft to edit later"
                >
                  <Save size={16} />
                  <span>Save Draft</span>
                </button>
                <button
                  className="bonafide-btn-primary"
                  onClick={() => {
                    if (!formData.declarationAccepted) {
                      setErrorMessage('Please accept the institutional declaration before proceeding.');
                      return;
                    }
                    setErrorMessage('');
                    setStep(3);
                  }}
                >
                  <span>Review Application</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}

            {step === 1 && (
              <button className="bonafide-btn-primary" onClick={() => setStep(2)}>
                <span>Proceed to Form</span>
                <ArrowRight size={16} />
              </button>
            )}

            {step === 3 && (
              <button
                className="bonafide-btn-primary"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Confirm & Submit Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {/* Document Preview Modal */}
        {docPreviewModalOpen && selectedPreviewDoc && (
          <BonafideDocPreviewModal
            isOpen={docPreviewModalOpen}
            onClose={() => {
              setDocPreviewModalOpen(false);
              setSelectedPreviewDoc(null);
            }}
            doc={selectedPreviewDoc}
          />
        )}
      </div>
    </div>
  );
}
