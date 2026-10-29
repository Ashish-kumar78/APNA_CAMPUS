import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  UserRound,
  GraduationCap,
  Award,
  UsersRound,
  MapPin,
  Fingerprint,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Eye,
  UploadCloud,
  Check,
  X,
  Sparkles,
  Calendar,
  Clock,
  Coffee,
  Sun,
  Moon,
  IdCard,
  Download,
  ExternalLink,
  Info
} from 'lucide-react';
import { saveStudent, getAllStudents, setActiveStudent, addStudentDocument } from '../services/studentStore.js';
import { canteenStore } from '../services/canteenStore.js';
import { api } from '../services/api.js';
import './RegisterStudentWizard.css';

// Initial default blank student form state matching Section 1 - 7
export const initialRegistrationState = {
  // 1. Personal Details
  admissionCategory: 'General',
  title: 'Mr.',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: 'Male',
  dob: '2006-03-15',
  nationality: 'Indian',
  caste: 'General',
  religion: 'Hindu',
  bloodGroup: 'O+',
  birthplace: 'Bhubaneswar, Odisha',
  identificationMark: 'None',
  thumbId: '',
  studentType: 'Day Scholar', // Auto-derived from hostel
  hostel: 'No',
  transport: 'No',
  lunch: 'No',
  nss: 'No',
  languagesKnown: 'Odia, English, Hindi',
  hobbies: 'Coding, Reading',

  // 2. Academic Details
  course: 'Bachelor of Technology',
  appliedCourse: 'B.Tech Computer Science & Engineering',
  batch: 'BTECH 2026–2030',
  branch: 'Computer Science & Engineering',
  deptCode: 'CSE',
  semester: 'Semester 1',
  section: 'Section A',
  academicSection: 'CSE · Section A',
  house: 'ANAND',
  labGroup: 'Group 1',
  honors: 'No',
  minor: 'No',
  valueAdded1: 'Full Stack Web Development (Node & React)',
  valueAdded2: 'Python for Data Science',
  valueAdded3: 'AI & Deep Learning Foundations',
  admissionDate: '2026-08-05',
  entranceExam: 'JEE MAIN',
  rank: '18450',
  rankType: 'All India Rank (AIR)',
  email: '',
  phone: '+91 94371 00215',

  // 3. Educational Qualifications
  qualifications: [
    { qualification: '10th', institute: 'Secondary Board High School, Cuttack', year: '2022', marks: '84.50%', maxMarks: '600', status: 'Passed' },
    { qualification: '12th', institute: 'Higher Secondary Science College, Bhubaneswar', year: '2024', marks: '82.00%', maxMarks: '600', status: 'Passed' },
    { qualification: 'ITI', institute: '', year: '', marks: '', maxMarks: '', status: 'Not Applicable' },
    { qualification: 'Diploma', institute: '', year: '', marks: '', maxMarks: '', status: 'Not Applicable' },
    { qualification: '+3', institute: '', year: '', marks: '', maxMarks: '', status: 'Not Applicable' },
    { qualification: 'BCA', institute: '', year: '', marks: '', maxMarks: '', status: 'Not Applicable' },
    { qualification: 'BBA', institute: '', year: '', marks: '', maxMarks: '', status: 'Not Applicable' },
    { qualification: 'B.Tech', institute: 'Apna Campus (Enrolled)', year: '2026', marks: 'Pursuing', maxMarks: '10.0 CGPA', status: 'Appearing' }
  ],

  // 4. Guardian Details
  guardians: [
    {
      id: 'g-1',
      name: 'Ramesh Chandra Mohapatra',
      relationship: 'Father',
      occupation: 'Government Service',
      phone: '+91 94370 12345',
      altPhone: '+91 674 2301122',
      income: '₹4,50,000 / annum',
      email: 'ramesh.mohapatra@example.com',
      qualification: 'Post Graduate (M.Sc)',
      homeAddress: 'Plot 42, Saheed Nagar, Bhubaneswar, Odisha',
      officeAddress: 'Secretariat Office, Sachivalaya Marg, Bhubaneswar',
      isEmergency: 'Yes'
    },
    {
      id: 'g-2',
      name: 'Minati Mohapatra',
      relationship: 'Mother',
      occupation: 'Homemaker',
      phone: '+91 94370 67890',
      altPhone: '',
      income: '0',
      email: 'minati.mohapatra@example.com',
      qualification: 'Graduate (B.A)',
      homeAddress: 'Plot 42, Saheed Nagar, Bhubaneswar, Odisha',
      officeAddress: 'N/A',
      isEmergency: 'No'
    }
  ],

  // 5. Address Information
  currAddress: 'Plot 42, Saheed Nagar',
  currCity: 'Bhubaneswar',
  currState: 'Odisha',
  currCountry: 'India',
  currHouseNo: '42',
  currPin: '751007',
  currPhone: '+91 94371 00215',

  isSameAsCurrent: true,
  permAddress: 'Plot 42, Saheed Nagar',
  permCity: 'Bhubaneswar',
  permState: 'Odisha',
  permCountry: 'India',
  permHouseNo: '42',
  permPin: '751007',
  permPhone: '+91 94371 00215',

  // 6. Biometric and Canteen Information
  biometricStatus: 'Enrolled',
  studentCategory: 'Day Scholar',
  hostelName: 'Sarojini Girls Residence (Block A)',
  roomNumber: '304',
  bedNumber: 'Bed 01 (Window Side)',
  canteenAccess: 'Yes',
  foodAccessStatus: 'Approved',
  subBreakfast: false,
  subLunch: true,
  subDinner: false,

  // 7. Documents Details
  documentsList: [
    {
      id: 'doc-aadhaar',
      name: 'Aadhaar Card',
      category: 'Identification',
      fileName: 'aadhaar_card_verified.pdf',
      fileSize: '1.2 MB',
      fileType: 'PDF',
      uploadDate: '2026-08-01',
      status: 'Verified',
      remarks: 'UIDAI barcode verified'
    },
    {
      id: 'doc-pan',
      name: 'PAN Card',
      category: 'Identification',
      fileName: 'pan_card_student.pdf',
      fileSize: '0.8 MB',
      fileType: 'PDF',
      uploadDate: '2026-08-01',
      status: 'Verified',
      remarks: 'Income Tax portal verified'
    },
    {
      id: 'doc-10th',
      name: 'Class 10 Certificate',
      category: 'Academic',
      fileName: 'class_10_marksheet_cert.pdf',
      fileSize: '1.5 MB',
      fileType: 'PDF',
      uploadDate: '2026-08-01',
      status: 'Verified',
      remarks: 'Verified with BSE/CBSE repository'
    },
    {
      id: 'doc-12th',
      name: 'Class 12 Certificate',
      category: 'Academic',
      fileName: 'class_12_science_certificate.pdf',
      fileSize: '1.8 MB',
      fileType: 'PDF',
      uploadDate: '2026-08-01',
      status: 'Verified',
      remarks: 'CHSE/CBSE qualifying marks verified'
    },
    {
      id: 'doc-photo',
      name: 'Passport-size Photograph',
      category: 'Identification',
      fileName: 'student_passport_formal.jpg',
      fileSize: '0.4 MB',
      fileType: 'IMAGE',
      uploadDate: '2026-08-01',
      status: 'Verified',
      remarks: 'White background institutional standard'
    },
    {
      id: 'doc-entrance',
      name: 'Entrance Examination Scorecard (JEE Main)',
      category: 'Entrance Scorecard',
      fileName: 'jee_main_2026_scorecard.pdf',
      fileSize: '1.1 MB',
      fileType: 'PDF',
      uploadDate: '2026-08-01',
      status: 'Verified',
      remarks: 'Rank 18450 verified with NTA'
    }
  ]
};

const STEPS = [
  { id: 1, label: 'Personal Details', short: 'Personal', icon: UserRound },
  { id: 2, label: 'Academic Details', short: 'Academic', icon: GraduationCap },
  { id: 3, label: 'Educational Qualifications', short: 'Qualifications', icon: Award },
  { id: 4, label: 'Guardian Details', short: 'Guardians', icon: UsersRound },
  { id: 5, label: 'Address Information', short: 'Address', icon: MapPin },
  { id: 6, label: 'Biometric & Canteen', short: 'Biometrics', icon: Fingerprint },
  { id: 7, label: 'Documents Upload', short: 'Documents', icon: FileText },
  { id: 8, label: 'Review & Submit', short: 'Review', icon: CheckCircle2 }
];

export default function RegisterStudentWizard({
  isOpen,
  onClose,
  initialStudent = null,
  onStudentRegistered
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialRegistrationState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCredential, setSubmittedCredential] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Document upload modal in Step 7
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [docUploadForm, setDocUploadForm] = useState({
    name: 'Migration Certificate',
    category: 'Academic',
    fileName: 'student_document.pdf',
    remarks: 'Official verified document'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Prepopulate if editing existing student or draft
  useEffect(() => {
    if (initialStudent) {
      setFormData(prev => ({
        ...prev,
        ...initialStudent,
        firstName: initialStudent.firstName || initialStudent.name?.split(' ')[0] || '',
        lastName: initialStudent.lastName || initialStudent.name?.split(' ').slice(1).join(' ') || '',
        middleName: initialStudent.middleName || '',
        hostel: initialStudent.hostel || (initialStudent.category === 'Hosteller' ? 'Yes' : 'No'),
        studentType: initialStudent.category || (initialStudent.hostel === 'Yes' ? 'Hosteller' : 'Day Scholar'),
        qualifications: initialStudent.qualifications || prev.qualifications,
        guardians: initialStudent.guardians || prev.guardians,
        documentsList: initialStudent.documentsList || prev.documentsList
      }));
    } else {
      // Check for saved draft in localStorage
      try {
        const draft = localStorage.getItem('apna_student_registration_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          setFormData(parsed);
        }
      } catch (e) {}
    }
  }, [initialStudent, isOpen]);

  // Handle Hostel -> Student Type automatic synchronization (Section 1 & 6)
  const handleHostelChange = (val) => {
    const isHosteller = val === 'Yes';
    setFormData(prev => ({
      ...prev,
      hostel: val,
      studentType: isHosteller ? 'Hosteller' : 'Day Scholar',
      studentCategory: isHosteller ? 'Hosteller' : 'Day Scholar',
      subDinner: isHosteller ? true : prev.subDinner // Hostellers usually need dinner
    }));
  };

  // Handle Address Same As Current Synchronization (Section 5)
  const handleSameAddressToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      isSameAsCurrent: checked,
      ...(checked ? {
        permAddress: prev.currAddress,
        permCity: prev.currCity,
        permState: prev.currState,
        permCountry: prev.currCountry,
        permHouseNo: prev.currHouseNo,
        permPin: prev.currPin,
        permPhone: prev.currPhone
      } : {})
    }));
  };

  // Save draft functionality (Section 9)
  const handleSaveDraft = () => {
    try {
      localStorage.setItem('apna_student_registration_draft', JSON.stringify(formData));
      showToast('Registration draft saved successfully!');
    } catch (e) {
      showToast('Failed to save draft to storage.');
    }
  };

  // Autofill sample demo data for rapid testing
  const handleAutofillDemoData = () => {
    setFormData({
      ...initialRegistrationState,
      firstName: 'Bishnu',
      middleName: 'Prasad',
      lastName: 'Sahoo',
      title: 'Mr.',
      gender: 'Male',
      dob: '2007-03-04',
      nationality: 'Indian',
      caste: 'SEBC/OBC',
      religion: 'Hindu',
      bloodGroup: 'O+',
      birthplace: 'Ghasiput, Cuttack',
      identificationMark: 'Small scar near left eyebrow',
      thumbId: 'FP-19181',
      studentType: 'Hosteller',
      hostel: 'Yes',
      hostelName: 'Sarojini Boys Residence (Block A)',
      roomNumber: '304',
      bedNumber: 'Bed 01',
      transport: 'No',
      lunch: 'Yes',
      nss: 'Yes',
      languagesKnown: 'Odia, English, Hindi',
      hobbies: 'AI Modeling, Cricket',
      course: 'Bachelor of Technology',
      appliedCourse: 'B.Tech Computer Science & Engineering (Artificial Intelligence)',
      branch: 'Computer Science & Engineering (Artificial Intelligence)',
      deptCode: 'CSE (AI)',
      section: 'CSE (AI) - Genius',
      academicSection: 'CSE (AI) - Genius',
      batch: 'BTECH 2026–2030',
      admissionDate: '2026-08-05',
      entranceExam: 'JEE MAIN',
      rank: '12490',
      email: 'bishnu.prasad.sahoo@gift.edu.in',
      phone: '+91 77498 44291',
      currAddress: 'Ghasiput, Banki',
      currCity: 'Cuttack',
      currState: 'Odisha',
      currPin: '754008',
      isSameAsCurrent: true,
      permAddress: 'Ghasiput, Banki',
      permCity: 'Cuttack',
      permState: 'Odisha',
      permPin: '754008',
      canteenAccess: 'Yes',
      subBreakfast: true,
      subLunch: true,
      subDinner: true
    });
    showToast('✨ Form autofilled with comprehensive student demo data!');
  };

  // Step Validation (Section 10)
  const validateStep = (stepNum) => {
    const errs = {};
    if (stepNum === 1) {
      if (!formData.firstName.trim()) errs.firstName = 'First Name is required.';
      if (!formData.lastName.trim()) errs.lastName = 'Last Name is required.';
      if (!formData.dob) errs.dob = 'Date of Birth is required.';
      if (!formData.gender) errs.gender = 'Gender is required.';
    } else if (stepNum === 2) {
      if (!formData.course) errs.course = 'Course is required.';
      if (!formData.branch) errs.branch = 'Branch is required.';
      if (!formData.admissionDate) errs.admissionDate = 'Admission Date is required.';
      if (!formData.email || !formData.email.includes('@')) errs.email = 'Valid Email Address is required.';
      if (!formData.phone) errs.phone = 'Phone Number is required.';
    } else if (stepNum === 4) {
      if (!formData.guardians || formData.guardians.length === 0) {
        errs.guardians = 'At least one Guardian record must be provided.';
      } else {
        const first = formData.guardians[0];
        if (!first.name.trim()) errs.guardianName = 'Primary Guardian Name is required.';
        if (!first.phone.trim()) errs.guardianPhone = 'Primary Guardian Phone is required.';
      }
    } else if (stepNum === 5) {
      if (!formData.currAddress.trim()) errs.currAddress = 'Current Address is required.';
      if (!formData.currCity.trim()) errs.currCity = 'City is required.';
      if (!formData.currPin.trim()) errs.currPin = 'Valid PIN Code is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep(prev => Math.min(prev + 1, 8));
    } else {
      showToast('Please fix the highlighted required fields before proceeding.', 'error');
    }
  };

  const handlePrev = () => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Step 3 Qualification Helpers
  const handleQualificationChange = (index, field, val) => {
    const updated = [...formData.qualifications];
    updated[index] = { ...updated[index], [field]: val };
    setFormData(prev => ({ ...prev, qualifications: updated }));
  };

  const handleAddQualificationRow = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { qualification: 'Other Certificate', institute: '', year: '', marks: '', maxMarks: '', status: 'Passed' }
      ]
    }));
  };

  const handleRemoveQualificationRow = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, idx) => idx !== index)
    }));
  };

  // Step 4 Guardian Helpers
  const handleGuardianChange = (index, field, val) => {
    const updated = [...formData.guardians];
    updated[index] = { ...updated[index], [field]: val };
    setFormData(prev => ({ ...prev, guardians: updated }));
  };

  const handleAddGuardian = () => {
    setFormData(prev => ({
      ...prev,
      guardians: [
        ...prev.guardians,
        {
          id: `g-${Date.now()}`,
          name: '',
          relationship: 'Local Guardian',
          occupation: '',
          phone: '',
          altPhone: '',
          income: '',
          email: '',
          qualification: '',
          homeAddress: '',
          officeAddress: '',
          isEmergency: 'No'
        }
      ]
    }));
  };

  const handleRemoveGuardian = (index) => {
    if (formData.guardians.length <= 1) {
      showToast('At least one guardian is required.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      guardians: prev.guardians.filter((_, idx) => idx !== index)
    }));
  };

  // Step 7 Documents Upload Helper
  const handleAddCustomDocument = (e) => {
    e.preventDefault();
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: docUploadForm.name,
      category: docUploadForm.category,
      fileName: docUploadForm.fileName || 'student_document.pdf',
      fileSize: '1.2 MB',
      fileType: docUploadForm.fileName?.endsWith('.jpg') || docUploadForm.fileName?.endsWith('.png') ? 'IMAGE' : 'PDF',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Verified',
      remarks: docUploadForm.remarks
    };

    setFormData(prev => ({
      ...prev,
      documentsList: [...prev.documentsList, newDoc]
    }));
    setIsUploadDocModalOpen(false);
    showToast(`Uploaded document: ${newDoc.name}`);
  };

  const handleDeleteDocument = (docId) => {
    setFormData(prev => ({
      ...prev,
      documentsList: prev.documentsList.filter(d => d.id !== docId)
    }));
  };

  // Final Registration Submission (Section 11 & 12)
  const handleSubmitRegistration = async () => {
    // Validate final checks
    for (let s = 1; s <= 7; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        showToast(`Please complete required fields in Step ${s}: ${STEPS[s - 1].label}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const all = getAllStudents();
      const admissionYear = new Date(formData.admissionDate || '2026-08-05').getFullYear();
      const deptCodeClean = (formData.deptCode || 'CSE').replace(/[^A-Z0-9]/g, '');
      const yearStr = `${admissionYear}`;
      const seqStr = String(100 + all.length).padStart(4, '0');
      const institutionalRegNo = initialStudent?.registrationNumber || `AC/${yearStr}/${deptCodeClean}/00${seqStr}`;
      const assignedRoll = initialStudent?.rollNumber || `${yearStr.slice(-2)}${deptCodeClean.slice(-3)}${seqStr.slice(-2)}`;
      const studentId = initialStudent?.studentId || `STU-${yearStr.slice(-2)}-${seqStr}`;
      const defaultPassword = `Apna@${admissionYear}`;

      const fullName = `${formData.firstName.trim()} ${formData.middleName.trim() ? formData.middleName.trim() + ' ' : ''}${formData.lastName.trim()}`;

      // Assemble full payload with all sections
      const studentPayload = {
        ...formData,
        id: initialStudent?.id || `std-${Date.now()}`,
        name: fullName,
        role: 'student',
        registrationNumber: institutionalRegNo,
        rollNumber: assignedRoll,
        studentId,
        thumbId: formData.thumbId || `FP-${seqStr}`,
        defaultPassword,
        category: formData.studentType,
        lifecycleStatus: 'ADMITTED',
        status: 'Active',
        academicYear: `${admissionYear}-${admissionYear + 4}`,
        cgpa: initialStudent?.cgpa || 8.42,
        attendance: initialStudent?.attendance || 92,
        walletBalance: 1450.0,
        // Map primary father/mother for instant compatibility with legacy components
        fatherName: formData.guardians.find(g => g.relationship === 'Father')?.name || formData.guardians[0]?.name || '',
        fatherPhone: formData.guardians.find(g => g.relationship === 'Father')?.phone || formData.guardians[0]?.phone || '',
        fatherRelationship: formData.guardians.find(g => g.relationship === 'Father')?.relationship || 'Father',
        motherName: formData.guardians.find(g => g.relationship === 'Mother')?.name || '',
        motherPhone: formData.guardians.find(g => g.relationship === 'Mother')?.phone || '',
        motherRelationship: 'Mother',
        // Map primary qualifications
        qual10thInstitute: formData.qualifications.find(q => q.qualification === '10th')?.institute || '',
        qual10thYear: formData.qualifications.find(q => q.qualification === '10th')?.year || '',
        qual10thMarks: formData.qualifications.find(q => q.qualification === '10th')?.marks || '',
        qual12thInstitute: formData.qualifications.find(q => q.qualification === '12th')?.institute || '',
        qual12thYear: formData.qualifications.find(q => q.qualification === '12th')?.year || '',
        qual12thMarks: formData.qualifications.find(q => q.qualification === '12th')?.marks || ''
      };

      // 1. Asynchronously submit into Backend Admission REST API
      try {
        const appRes = await api.createApplicant({
          name: fullName,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          alternatePhone: formData.currPhone || null,
          gender: formData.gender,
          dob: formData.dob,
          bloodGroup: formData.bloodGroup,
          nationality: formData.nationality || 'Indian',
          religion: formData.religion,
          category: formData.admissionCategory || formData.caste || 'General',
          programmeName: formData.appliedCourse || formData.course,
          courseCode: deptCodeClean,
          departmentCode: deptCodeClean,
          academicYear: `${admissionYear}-${(admissionYear + 1).toString().slice(-2)}`,
          tenthMarks: parseFloat(formData.qualifications.find(q => q.qualification === '10th')?.marks) || 85.0,
          twelfthMarks: parseFloat(formData.qualifications.find(q => q.qualification === '12th')?.marks) || 82.0,
          entranceExam: formData.entranceExam,
          entranceRank: parseInt(formData.rank, 10) || null,
          guardians: formData.guardians,
          addressDetails: {
            permanent: {
              addressLine: formData.permAddress,
              city: formData.permCity,
              state: formData.permState,
              country: formData.permCountry || 'India',
              pincode: formData.permPin
            },
            correspondence: {
              addressLine: formData.currAddress,
              city: formData.currCity,
              state: formData.currState,
              country: formData.currCountry || 'India',
              pincode: formData.currPin
            }
          },
          qualifications: formData.qualifications,
          hostelRequired: formData.hostel === 'Yes',
          documents: formData.documentsList,
          isDraft: false
        });

        if (appRes && appRes.data && appRes.data.id) {
          const enrollRes = await api.approveAndEnrollApplicant(appRes.data.id);
          if (enrollRes && enrollRes.data) {
            studentPayload.registrationNumber = enrollRes.data.registrationNumber;
            studentPayload.rollNumber = enrollRes.data.rollNumber;
            studentPayload.studentId = enrollRes.data.studentId;
            studentPayload.activationToken = enrollRes.data.activationToken;
            studentPayload.activationUrl = enrollRes.data.activationUrl;
          }
        }
      } catch (apiErr) {
        console.warn('Backend admission sync fallback:', apiErr.message);
      }

      // 2. Save to central studentStore
      const savedStudent = saveStudent(studentPayload);
      setActiveStudent(savedStudent.id);

      // 3. Save all uploaded documents into student repository
      if (formData.documentsList && formData.documentsList.length > 0) {
        formData.documentsList.forEach(doc => {
          addStudentDocument(savedStudent.id, {
            name: doc.name,
            category: doc.category,
            fileName: doc.fileName,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            fileUrl: null,
            remarks: doc.remarks
          });
        });
      }

      // 3. Integrate with Canteen System (Section 6 & 12)
      if (formData.canteenAccess === 'Yes') {
        const requestedMeals = [];
        if (formData.subBreakfast) requestedMeals.push('Breakfast');
        if (formData.subLunch) requestedMeals.push('Lunch');
        if (formData.subDinner) requestedMeals.push('Dinner');

        canteenStore.submitApplication({
          studentId: savedStudent.studentId,
          studentName: savedStudent.name,
          category: savedStudent.category,
          department: savedStudent.department || savedStudent.branch,
          requestedMeals: requestedMeals.length > 0 ? requestedMeals : ['Lunch'],
          remarks: `Admissions clearance: ${savedStudent.category} campus dining registration`
        });

        // Automatically activate chosen meal subscription if application approved
        if (formData.foodAccessStatus === 'Approved' && requestedMeals.length > 0) {
          const app = canteenStore.getApplicationByStudentId(savedStudent.studentId);
          if (app) {
            canteenStore.updateApplicationStatus(app.id, 'Approved', 'Academic Registrar');
            canteenStore.saveSubscription({
              studentId: savedStudent.studentId,
              studentName: savedStudent.name,
              category: savedStudent.category,
              selectedMeals: {
                breakfast: formData.subBreakfast,
                lunch: formData.subLunch,
                dinner: formData.subDinner
              },
              startDate: '2026-08-01',
              expiryDate: '2027-07-31'
            });
          }
        }
      }

      // 4. Asynchronously notify backend API
      try {
        await api.createStudent({
          name: savedStudent.name,
          rollNumber: savedStudent.rollNumber,
          studentId: savedStudent.studentId,
          email: savedStudent.email,
          phone: savedStudent.phone,
          department: savedStudent.department,
          deptCode: savedStudent.deptCode,
          semester: savedStudent.semester,
          section: savedStudent.section,
          gender: savedStudent.gender,
          bloodGroup: savedStudent.bloodGroup,
          category: savedStudent.category,
          academicYear: savedStudent.academicYear,
          status: savedStudent.status
        });
      } catch (err) {
        console.warn('Backend student sync (offline fallback active):', err.message);
      }

      // 5. Clear draft
      localStorage.removeItem('apna_student_registration_draft');

      // 6. Set success credentials
      setSubmittedCredential({
        name: savedStudent.name,
        regNo: savedStudent.registrationNumber,
        studentId: savedStudent.studentId,
        rollNumber: savedStudent.rollNumber,
        program: savedStudent.appliedCourse || savedStudent.course,
        department: savedStudent.branch,
        category: savedStudent.category,
        password: defaultPassword,
        savedStudent
      });

      if (onStudentRegistered) {
        onStudentRegistered(savedStudent);
      }

      showToast(`Student ${savedStudent.name} successfully registered in institution database!`);
    } catch (err) {
      console.error('Registration failed:', err);
      showToast('Registration failed. Please check form inputs.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reg-wizard-overlay" onClick={onClose}>
      <div className="reg-wizard-container" onClick={e => e.stopPropagation()}>
        {/* Toast Alert */}
        {toastMessage && (
          <div className="reg-wizard-toast">
            <Info size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Wizard Header Bar */}
        <div className="reg-wizard-header">
          <div className="header-branding">
            <div className="wizard-icon-box">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="wizard-title">
                  {initialStudent ? 'Edit Student Official Record' : 'Register New Student (Institutional Enrollment)'}
                </h2>
                <span className="badge-official">Autonomous ERP Form</span>
              </div>
              <p className="wizard-subtitle">
                Complete all student details including personal, academic, qualifications, guardians, addresses, biometric &amp; documents.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn-autofill-demo"
              onClick={handleAutofillDemoData}
              title="Populate all 8 steps with realistic candidate test data"
            >
              <Sparkles size={14} />
              <span>Autofill Sample Data</span>
            </button>

            <button
              type="button"
              className="btn-save-draft"
              onClick={handleSaveDraft}
              title="Save current progress as a draft"
            >
              <Save size={14} />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              className="btn-wizard-close"
              onClick={onClose}
              title="Close Registration Wizard"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Stepper Bar (Section 9) */}
        <div className="reg-stepper-bar">
          {STEPS.map(st => {
            const isCurrent = currentStep === st.id;
            const isCompleted = currentStep > st.id;
            const Icon = st.icon;

            return (
              <button
                key={st.id}
                type="button"
                className={`stepper-step-btn ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(st.id)}
              >
                <div className="step-indicator">
                  {isCompleted ? <Check size={14} className="stroke-[3]" /> : <Icon size={14} />}
                </div>
                <div className="step-label-group">
                  <span className="step-number">Step {st.id}</span>
                  <span className="step-name">{st.short}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Wizard Body Scroll Area */}
        <div className="reg-wizard-body">
          {/* ======================================================== */}
          {/* STEP 1: PERSONAL DETAILS (Section 1) */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="wizard-step-pane">
              <div className="section-title-strip">
                <UserRound size={18} className="text-blue-600" />
                <h3>1. Personal Details</h3>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Admission Category <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.admissionCategory}
                    onChange={e => setFormData({ ...formData, admissionCategory: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="SEBC/OBC">SEBC/OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="TFWS">TFWS (Tuition Fee Waiver)</option>
                    <option value="Lateral Entry">Lateral Entry (Diploma / B.Sc)</option>
                    <option value="Management Quota">Management Quota</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Title <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Mx.">Mx.</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Gender <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>First Name <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bishnu"
                    className={`reg-input ${errors.firstName ? 'error' : ''}`}
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  {errors.firstName && <span className="err-msg">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prasad"
                    className="reg-input"
                    value={formData.middleName}
                    onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahoo"
                    className={`reg-input ${errors.lastName ? 'error' : ''}`}
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  />
                  {errors.lastName && <span className="err-msg">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Date of Birth <span className="req">*</span></label>
                  <input
                    type="date"
                    required
                    className="reg-input"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Nationality <span className="req">*</span></label>
                  <input
                    type="text"
                    className="reg-input"
                    value={formData.nationality}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Blood Group <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
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

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Caste</label>
                  <input
                    type="text"
                    placeholder="e.g. SEBC/OBC, General, SC"
                    className="reg-input"
                    value={formData.caste}
                    onChange={e => setFormData({ ...formData, caste: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Religion</label>
                  <input
                    type="text"
                    placeholder="e.g. Hindu"
                    className="reg-input"
                    value={formData.religion}
                    onChange={e => setFormData({ ...formData, religion: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Birthplace</label>
                  <input
                    type="text"
                    placeholder="e.g. Ghasiput, Cuttack"
                    className="reg-input"
                    value={formData.birthplace}
                    onChange={e => setFormData({ ...formData, birthplace: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Identification Mark</label>
                  <input
                    type="text"
                    placeholder="e.g. Mole on left cheek or None"
                    className="reg-input"
                    value={formData.identificationMark}
                    onChange={e => setFormData({ ...formData, identificationMark: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Thumb ID / Biometric Reference ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 19181 or FP-19181 (Auto-assigned if empty)"
                    className="reg-input"
                    value={formData.thumbId}
                    onChange={e => setFormData({ ...formData, thumbId: e.target.value })}
                  />
                </div>
              </div>

              {/* Residential & Facilities Toggles (Section 1) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Residential Classification &amp; Campus Facilities
                  </h4>
                  <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    Classified: {formData.studentType}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="form-group">
                    <label>Hostel Accommodation</label>
                    <select
                      className="reg-input"
                      value={formData.hostel}
                      onChange={e => handleHostelChange(e.target.value)}
                    >
                      <option value="Yes">Yes (Hosteller)</option>
                      <option value="No">No (Day Scholar)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Transport Facility</label>
                    <select
                      className="reg-input"
                      value={formData.transport}
                      onChange={e => setFormData({ ...formData, transport: e.target.value })}
                    >
                      <option value="Yes">Yes (Bus Commuter)</option>
                      <option value="No">No (Self Transport)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Lunch Facility</label>
                    <select
                      className="reg-input"
                      value={formData.lunch}
                      onChange={e => setFormData({ ...formData, lunch: e.target.value })}
                    >
                      <option value="Yes">Yes (Mess Lunch)</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>NSS Membership</label>
                    <select
                      className="reg-input"
                      value={formData.nss}
                      onChange={e => setFormData({ ...formData, nss: e.target.value })}
                    >
                      <option value="Yes">Yes (Volunteer)</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Hostel Block Details */}
                {formData.hostel === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div className="form-group">
                      <label className="text-2xs">Assigned Hostel Residence</label>
                      <input
                        type="text"
                        className="reg-input-sm"
                        value={formData.hostelName}
                        onChange={e => setFormData({ ...formData, hostelName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-2xs">Room Number</label>
                      <input
                        type="text"
                        className="reg-input-sm"
                        value={formData.roomNumber}
                        onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-2xs">Bed Number</label>
                      <input
                        type="text"
                        className="reg-input-sm"
                        value={formData.bedNumber}
                        onChange={e => setFormData({ ...formData, bedNumber: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Languages Known</label>
                  <input
                    type="text"
                    placeholder="e.g. Odia, English, Hindi"
                    className="reg-input"
                    value={formData.languagesKnown}
                    onChange={e => setFormData({ ...formData, languagesKnown: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Hobbies &amp; Extracurriculars</label>
                  <input
                    type="text"
                    placeholder="e.g. Coding, Football, Robotics, Reading"
                    className="reg-input"
                    value={formData.hobbies}
                    onChange={e => setFormData({ ...formData, hobbies: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: ACADEMIC DETAILS (Section 2) */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="wizard-step-pane">
              <div className="section-title-strip">
                <GraduationCap size={18} className="text-blue-600" />
                <h3>2. Academic Details &amp; Entrance Performance</h3>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Academic Course <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                  >
                    <option value="Bachelor of Technology">Bachelor of Technology (B.Tech)</option>
                    <option value="Master of Technology">Master of Technology (M.Tech)</option>
                    <option value="Master of Computer Applications">Master of Computer Applications (MCA)</option>
                    <option value="Master of Business Administration">Master of Business Administration (MBA)</option>
                    <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                    <option value="BBA">Bachelor of Business Administration (BBA)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Branch / Specialization <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.branch}
                    onChange={e => {
                      const br = e.target.value;
                      let code = 'CSE';
                      if (br.includes('AI')) code = 'CSE (AI)';
                      else if (br.includes('Electronics')) code = 'ECE';
                      else if (br.includes('Mechanical')) code = 'MECH';
                      else if (br.includes('Civil')) code = 'CIVIL';
                      else if (br.includes('Electrical')) code = 'EEE';
                      setFormData({
                        ...formData,
                        branch: br,
                        appliedCourse: `B.Tech ${br}`,
                        deptCode: code,
                        academicSection: `${code} · ${formData.section}`
                      });
                    }}
                  >
                    <option value="Computer Science & Engineering (Artificial Intelligence)">Computer Science & Engineering (Artificial Intelligence)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Computer Science & Engineering (Data Science)">Computer Science & Engineering (Data Science)</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Batch Duration <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.batch}
                    onChange={e => setFormData({ ...formData, batch: e.target.value })}
                  >
                    <option value="BTECH 2026–2030">BTECH 2026–2030 (4-Year Regular)</option>
                    <option value="BTECH 2025–2029">BTECH 2025–2029</option>
                    <option value="BTECH 2024–2028">BTECH 2024–2028</option>
                    <option value="BTECH 2026–2029 (LE)">BTECH 2026–2029 (Lateral Entry)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Section Assignment <span className="req">*</span></label>
                  <select
                    className="reg-input"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value, academicSection: `${formData.deptCode} · ${e.target.value}` })}
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                    <option value="CSE (AI) - Genius">CSE (AI) - Genius</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>House Assignment</label>
                  <select
                    className="reg-input"
                    value={formData.house}
                    onChange={e => setFormData({ ...formData, house: e.target.value })}
                  >
                    <option value="ANAND">House ANAND</option>
                    <option value="PRATAP">House PRATAP</option>
                    <option value="SHIVAJI">House SHIVAJI</option>
                    <option value="TAGORE">House TAGORE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Lab Group</label>
                  <select
                    className="reg-input"
                    value={formData.labGroup}
                    onChange={e => setFormData({ ...formData, labGroup: e.target.value })}
                  >
                    <option value="Group 1">Group 1</option>
                    <option value="Group 2">Group 2</option>
                    <option value="Group 3">Group 3</option>
                    <option value="Group 4">Group 4</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Honors Degree Enrollment</label>
                  <select
                    className="reg-input"
                    value={formData.honors}
                    onChange={e => setFormData({ ...formData, honors: e.target.value })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Honors Degree)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Interdisciplinary Minor Degree</label>
                  <select
                    className="reg-input"
                    value={formData.minor}
                    onChange={e => setFormData({ ...formData, minor: e.target.value })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Minor Degree)</option>
                  </select>
                </div>
              </div>

              {/* Value Added Courses (Section 2) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Value Added &amp; Skill Development Courses (Autonomous Curriculum)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="text-2xs">Value added course-1</label>
                    <input
                      type="text"
                      className="reg-input"
                      value={formData.valueAdded1}
                      onChange={e => setFormData({ ...formData, valueAdded1: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-2xs">Value added course-2</label>
                    <input
                      type="text"
                      className="reg-input"
                      value={formData.valueAdded2}
                      onChange={e => setFormData({ ...formData, valueAdded2: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-2xs">Value added course-3</label>
                    <input
                      type="text"
                      className="reg-input"
                      value={formData.valueAdded3}
                      onChange={e => setFormData({ ...formData, valueAdded3: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Admission & Entrance Examination Details */}
              <div className="form-grid-4">
                <div className="form-group">
                  <label>Admission Date <span className="req">*</span></label>
                  <input
                    type="date"
                    required
                    className="reg-input"
                    value={formData.admissionDate}
                    onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Entrance Examination</label>
                  <select
                    className="reg-input"
                    value={formData.entranceExam}
                    onChange={e => setFormData({ ...formData, entranceExam: e.target.value })}
                  >
                    <option value="JEE MAIN">JEE MAIN</option>
                    <option value="OJEE">OJEE (Odisha JEE)</option>
                    <option value="GATE">GATE</option>
                    <option value="CAT/MAT">CAT / MAT</option>
                    <option value="Institutional Merit">Institutional Merit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Entrance Rank</label>
                  <input
                    type="text"
                    placeholder="e.g. 18450"
                    className="reg-input"
                    value={formData.rank}
                    onChange={e => setFormData({ ...formData, rank: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Rank / Merit Category</label>
                  <select
                    className="reg-input"
                    value={formData.rankType}
                    onChange={e => setFormData({ ...formData, rankType: e.target.value })}
                  >
                    <option value="All India Rank (AIR)">All India Rank (AIR)</option>
                    <option value="State Merit Rank">State Merit Rank</option>
                    <option value="Category Rank">Category Rank</option>
                    <option value="Institutional Quota">Institutional Quota</option>
                  </select>
                </div>
              </div>

              {/* Contact Credentials */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Official / Student Email Address <span className="req">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="student.name@gift.edu.in"
                    className={`reg-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Student Contact Mobile Number <span className="req">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94371 00000"
                    className={`reg-input ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && <span className="err-msg">{errors.phone}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: EDUCATIONAL QUALIFICATIONS (Section 3) */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="wizard-step-pane">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="section-title-strip m-0">
                  <Award size={18} className="text-blue-600" />
                  <h3>3. Educational Qualifications</h3>
                </div>
                <button
                  type="button"
                  className="btn-add-table-row"
                  onClick={handleAddQualificationRow}
                >
                  <Plus size={14} />
                  <span>Add Additional Qualification Record</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Record all past academic qualifications (10th, 12th, ITI, Diploma, etc.). Unused qualification rows can remain empty without validation errors.
              </p>

              <div className="reg-table-card">
                <table className="reg-interactive-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Qualification</th>
                      <th style={{ width: '42%' }}>Institute / Board Name</th>
                      <th style={{ width: '14%' }}>Passout Year</th>
                      <th style={{ width: '14%' }}>Marks / CGPA</th>
                      <th style={{ width: '15%' }}>Result Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.qualifications.map((q, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            className="table-input font-bold text-slate-800"
                            value={q.qualification}
                            onChange={e => handleQualificationChange(idx, 'qualification', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Name of school, college or board..."
                            className="table-input"
                            value={q.institute}
                            onChange={e => handleQualificationChange(idx, 'institute', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="e.g. 2022"
                            className="table-input"
                            value={q.year}
                            onChange={e => handleQualificationChange(idx, 'year', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="e.g. 84.50%"
                            className="table-input"
                            value={q.marks}
                            onChange={e => handleQualificationChange(idx, 'marks', e.target.value)}
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <select
                              className="table-select text-xs"
                              value={q.status}
                              onChange={e => handleQualificationChange(idx, 'status', e.target.value)}
                            >
                              <option value="Passed">Passed</option>
                              <option value="Appearing">Appearing</option>
                              <option value="Awaiting Result">Awaiting Result</option>
                              <option value="Not Applicable">Not Applicable</option>
                            </select>
                            {idx >= 8 && (
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700 p-1"
                                onClick={() => handleRemoveQualificationRow(idx)}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: GUARDIAN DETAILS (Section 4) */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="wizard-step-pane">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="section-title-strip m-0">
                  <UsersRound size={18} className="text-blue-600" />
                  <h3>4. Guardian Details (Parents / Legal Representatives)</h3>
                </div>
                <button
                  type="button"
                  className="btn-add-table-row"
                  onClick={handleAddGuardian}
                >
                  <Plus size={14} />
                  <span>Add Another Guardian</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Record details for Father, Mother, or authorized legal guardians. At least one emergency contact should be designated.
              </p>

              <div className="space-y-4">
                {formData.guardians.map((g, idx) => (
                  <div key={g.id || idx} className="guardian-card-box">
                    <div className="guardian-card-header">
                      <div className="flex items-center gap-2">
                        <span className="guardian-index-badge">{idx + 1}</span>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {g.name ? `${g.name} (${g.relationship})` : `Guardian ${idx + 1}`}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="emergency-check-pill">
                          <span>Emergency Contact:</span>
                          <select
                            className="bg-transparent font-bold text-xs outline-none"
                            value={g.isEmergency}
                            onChange={e => handleGuardianChange(idx, 'isEmergency', e.target.value)}
                          >
                            <option value="Yes">Yes (Primary Alert)</option>
                            <option value="No">No</option>
                          </select>
                        </label>

                        {formData.guardians.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => handleRemoveGuardian(idx)}
                            title="Remove Guardian"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="form-grid-3">
                        <div className="form-group">
                          <label>Guardian Full Name <span className="req">*</span></label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ajay Kumar Sahoo"
                            className="reg-input"
                            value={g.name}
                            onChange={e => handleGuardianChange(idx, 'name', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Relationship <span className="req">*</span></label>
                          <select
                            className="reg-input"
                            value={g.relationship}
                            onChange={e => handleGuardianChange(idx, 'relationship', e.target.value)}
                          >
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Legal Guardian">Legal Guardian</option>
                            <option value="Local Guardian">Local Guardian</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Occupation</label>
                          <input
                            type="text"
                            placeholder="e.g. Farmer / Business / Engineer"
                            className="reg-input"
                            value={g.occupation}
                            onChange={e => handleGuardianChange(idx, 'occupation', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-grid-4">
                        <div className="form-group">
                          <label>Mobile Number <span className="req">*</span></label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 94370 00000"
                            className="reg-input"
                            value={g.phone}
                            onChange={e => handleGuardianChange(idx, 'phone', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Alternate Phone</label>
                          <input
                            type="tel"
                            placeholder="Landline / Alternate"
                            className="reg-input"
                            value={g.altPhone}
                            onChange={e => handleGuardianChange(idx, 'altPhone', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Annual Income</label>
                          <input
                            type="text"
                            placeholder="e.g. ₹1,50,000"
                            className="reg-input"
                            value={g.income}
                            onChange={e => handleGuardianChange(idx, 'income', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            placeholder="guardian@example.com"
                            className="reg-input"
                            value={g.email}
                            onChange={e => handleGuardianChange(idx, 'email', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Home Residence Address</label>
                          <input
                            type="text"
                            placeholder="At/PO, District, State"
                            className="reg-input"
                            value={g.homeAddress}
                            onChange={e => handleGuardianChange(idx, 'homeAddress', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Office / Workplace Address</label>
                          <input
                            type="text"
                            placeholder="Office Name, City"
                            className="reg-input"
                            value={g.officeAddress}
                            onChange={e => handleGuardianChange(idx, 'officeAddress', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: ADDRESS INFORMATION (Section 5) */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="wizard-step-pane">
              <div className="section-title-strip">
                <MapPin size={18} className="text-blue-600" />
                <h3>5. Address Information</h3>
              </div>

              {/* Subsection A: Current Address */}
              <div className="address-section-block">
                <div className="address-subhead">A. Current / Present Address</div>
                <div className="form-grid-2 mt-3">
                  <div className="form-group col-span-2">
                    <label>Street Address / Locality <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Plot No, Street, Landmark"
                      className="reg-input"
                      value={formData.currAddress}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          currAddress: val,
                          ...(prev.isSameAsCurrent ? { permAddress: val } : {})
                        }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>City <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhubaneswar"
                      className="reg-input"
                      value={formData.currCity}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          currCity: val,
                          ...(prev.isSameAsCurrent ? { permCity: val } : {})
                        }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>State <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Odisha"
                      className="reg-input"
                      value={formData.currState}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          currState: val,
                          ...(prev.isSameAsCurrent ? { permState: val } : {})
                        }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      className="reg-input"
                      value={formData.currCountry}
                      onChange={e => setFormData({ ...formData, currCountry: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>House / Plot Number</label>
                    <input
                      type="text"
                      placeholder="House No."
                      className="reg-input"
                      value={formData.currHouseNo}
                      onChange={e => setFormData({ ...formData, currHouseNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>PIN Code <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 751001"
                      className="reg-input"
                      value={formData.currPin}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          currPin: val,
                          ...(prev.isSameAsCurrent ? { permPin: val } : {})
                        }));
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 ..."
                      className="reg-input"
                      value={formData.currPhone}
                      onChange={e => setFormData({ ...formData, currPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox synchronization (Section 5) */}
              <label className="same-address-checkbox-pill">
                <input
                  type="checkbox"
                  checked={formData.isSameAsCurrent}
                  onChange={e => handleSameAddressToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold text-slate-800 text-sm">
                  Permanent address is the same as current address.
                </span>
              </label>

              {/* Subsection B: Permanent Address */}
              <div className="address-section-block">
                <div className="address-subhead">B. Permanent Address</div>
                <div className="form-grid-2 mt-3">
                  <div className="form-group col-span-2">
                    <label>Street Address / Locality <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      disabled={formData.isSameAsCurrent}
                      placeholder="Plot No, Street, Landmark"
                      className={`reg-input ${formData.isSameAsCurrent ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                      value={formData.permAddress}
                      onChange={e => setFormData({ ...formData, permAddress: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>City <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      disabled={formData.isSameAsCurrent}
                      placeholder="City"
                      className={`reg-input ${formData.isSameAsCurrent ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                      value={formData.permCity}
                      onChange={e => setFormData({ ...formData, permCity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>State <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      disabled={formData.isSameAsCurrent}
                      placeholder="State"
                      className={`reg-input ${formData.isSameAsCurrent ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                      value={formData.permState}
                      onChange={e => setFormData({ ...formData, permState: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      disabled={formData.isSameAsCurrent}
                      className={`reg-input ${formData.isSameAsCurrent ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                      value={formData.permCountry}
                      onChange={e => setFormData({ ...formData, permCountry: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>House / Plot Number</label>
                    <input
                      type="text"
                      disabled={formData.isSameAsCurrent}
                      placeholder="House No."
                      className={`reg-input ${formData.isSameAsCurrent ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                      value={formData.permHouseNo}
                      onChange={e => setFormData({ ...formData, permHouseNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>PIN Code <span className="req">*</span></label>
                    <input
                      type="text"
                      required
                      disabled={formData.isSameAsCurrent}
                      placeholder="PIN Code"
                      className={`reg-input ${formData.isSameAsCurrent ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                      value={formData.permPin}
                      onChange={e => setFormData({ ...formData, permPin: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone Number</label>
                    <input
                      type="tel"
                      disabled={formData.isSameAsCurrent}
                      placeholder="+91 ..."
                      className={`reg-input ${formData.isSameAsCurrent ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                      value={formData.permPhone}
                      onChange={e => setFormData({ ...formData, permPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: BIOMETRIC AND CANTEEN INFORMATION (Section 6) */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="wizard-step-pane">
              <div className="section-title-strip">
                <Fingerprint size={18} className="text-blue-600" />
                <h3>6. Biometric Identification &amp; Canteen Access Registration</h3>
              </div>

              {/* Biometrics Block */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Fingerprint size={16} className="text-emerald-600" />
                  <span>Biometric Optical Identity Enrollment</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label>Biometric Enrollment Status</label>
                    <select
                      className="reg-input"
                      value={formData.biometricStatus}
                      onChange={e => setFormData({ ...formData, biometricStatus: e.target.value })}
                    >
                      <option value="Enrolled">Enrolled &amp; Active</option>
                      <option value="Pending Fingerprint Capture">Pending Fingerprint Capture</option>
                      <option value="Exempted">Exempted (Medical Clearance)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Thumb ID / Biometric Template Code</label>
                    <input
                      type="text"
                      placeholder="e.g. FP-19181 or 19181"
                      className="reg-input font-mono font-bold"
                      value={formData.thumbId}
                      onChange={e => setFormData({ ...formData, thumbId: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Student Category</label>
                    <select
                      className="reg-input font-bold"
                      value={formData.studentCategory}
                      onChange={e => {
                        const cat = e.target.value;
                        setFormData({
                          ...formData,
                          studentCategory: cat,
                          studentType: cat,
                          hostel: cat === 'Hosteller' ? 'Yes' : 'No'
                        });
                      }}
                    >
                      <option value="Day Scholar">Day Scholar</option>
                      <option value="Hosteller">Hosteller</option>
                    </select>
                  </div>
                </div>

                <p className="text-2xs text-slate-500 italic">
                  * Note: Actual biometric fingerprint template enrollment occurs through authorized optical scanners. Only template hashes and reference IDs are stored.
                </p>
              </div>

              {/* Canteen & Meal Subscriptions (Section 6) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Coffee size={16} className="text-amber-600" />
                    <span>Canteen &amp; Mess Dining Access Program</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">Canteen Access Required:</label>
                    <select
                      className="reg-input-sm"
                      value={formData.canteenAccess}
                      onChange={e => setFormData({ ...formData, canteenAccess: e.target.value })}
                    >
                      <option value="Yes">Yes (Activate Access)</option>
                      <option value="No">No Access</option>
                    </select>
                  </div>
                </div>

                {formData.canteenAccess === 'Yes' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="form-group">
                      <label>Food Access Application Status</label>
                      <select
                        className="reg-input"
                        value={formData.foodAccessStatus}
                        onChange={e => setFormData({ ...formData, foodAccessStatus: e.target.value })}
                      >
                        <option value="Approved">Approved (Admissions Fast-Track Clearance)</option>
                        <option value="Pending Approval">Pending Administrative Review</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Yearly Meal Subscription Preferences (Section 5 &amp; 6):
                      </label>

                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.subBreakfast}
                            onChange={e => setFormData({ ...formData, subBreakfast: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">Breakfast Subscription</span>
                            <span className="text-2xs text-slate-400">07:30 - 09:30 AM (Daily)</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-xs">₹12,000 / yr</span>
                      </label>

                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.subLunch}
                            onChange={e => setFormData({ ...formData, subLunch: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">Lunch Subscription</span>
                            <span className="text-2xs text-slate-400">12:30 - 02:45 PM (Daily)</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-xs">₹18,000 / yr</span>
                      </label>

                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.subDinner}
                            onChange={e => setFormData({ ...formData, subDinner: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">Dinner Subscription</span>
                            <span className="text-2xs text-slate-400">07:30 - 09:45 PM (Daily)</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-xs">₹18,000 / yr</span>
                      </label>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-900">Total Annual Canteen Subscription Charges:</span>
                      <strong className="text-sm font-black text-blue-900">
                        ₹{(
                          (formData.subBreakfast ? 12000 : 0) +
                          (formData.subLunch ? 18000 : 0) +
                          (formData.subDinner ? 18000 : 0)
                        ).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 7: DOCUMENTS UPLOAD & DETAILS (Section 7) */}
          {/* ======================================================== */}
          {currentStep === 7 && (
            <div className="wizard-step-pane">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="section-title-strip m-0">
                  <FileText size={18} className="text-blue-600" />
                  <h3>7. Documents Details &amp; Upload</h3>
                </div>
                <button
                  type="button"
                  className="btn-add-table-row"
                  onClick={() => setIsUploadDocModalOpen(true)}
                >
                  <UploadCloud size={14} />
                  <span>Upload Document</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Supported document categories: Aadhaar Card, PAN Card, Class 10/12 Certificates, Entrance Scorecard, TC, Migration, and Photos.
              </p>

              <div className="reg-table-card">
                <table className="reg-interactive-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Document Name</th>
                      <th style={{ width: '18%' }}>Category</th>
                      <th style={{ width: '22%' }}>File Reference</th>
                      <th style={{ width: '15%' }}>Status</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.documentsList.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-blue-600 shrink-0" />
                            <strong className="text-slate-800 text-xs">{doc.name}</strong>
                          </div>
                          {doc.remarks && <span className="text-2xs text-slate-400 block">{doc.remarks}</span>}
                        </td>
                        <td>
                          <span className="category-pill">{doc.category}</span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-600">{doc.fileName}</span>
                          <span className="text-2xs text-slate-400 block">{doc.fileSize} · {doc.uploadDate}</span>
                        </td>
                        <td>
                          <span className="status-pill verified">
                            <CheckCircle2 size={12} /> {doc.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-action-icon text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteDocument(doc.id)}
                            title="Delete Document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upload Document Modal */}
              {isUploadDocModalOpen && (
                <div className="canteen-modal-overlay" onClick={() => setIsUploadDocModalOpen(false)}>
                  <div className="canteen-modal-card" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <div>
                        <h3 className="modal-title">Upload Student Document</h3>
                        <p className="modal-sub">Add official verification certificate</p>
                      </div>
                      <button className="modal-close-btn" onClick={() => setIsUploadDocModalOpen(false)}>
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleAddCustomDocument}>
                      <div className="modal-body space-y-3">
                        <div className="form-group">
                          <label>Document Category</label>
                          <select
                            className="reg-input"
                            value={docUploadForm.category}
                            onChange={e => setDocUploadForm({ ...docUploadForm, category: e.target.value })}
                          >
                            <option value="Academic">Academic Certificate</option>
                            <option value="Identification">Identification (Govt ID)</option>
                            <option value="Entrance Scorecard">Entrance Examination Scorecard</option>
                            <option value="Category Verification">Caste / Category Verification</option>
                            <option value="Transfer / Migration">Transfer / Migration Certificate</option>
                            <option value="Supporting">Other Supporting Document</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Document Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Migration Certificate / Caste Certificate"
                            className="reg-input"
                            value={docUploadForm.name}
                            onChange={e => setDocUploadForm({ ...docUploadForm, name: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>File Upload (PDF / JPG / PNG)</label>
                          <input
                            type="file"
                            className="reg-input text-xs"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setDocUploadForm(prev => ({ ...prev, fileName: file.name }));
                              }
                            }}
                          />
                        </div>

                        <div className="form-group">
                          <label>Verification Remarks</label>
                          <input
                            type="text"
                            placeholder="e.g. Original physically verified"
                            className="reg-input"
                            value={docUploadForm.remarks}
                            onChange={e => setDocUploadForm({ ...docUploadForm, remarks: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn-wizard-nav prev"
                          onClick={() => setIsUploadDocModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-wizard-nav next">
                          <Check size={14} />
                          <span>Attach Document</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 8: REVIEW & FINAL SUBMIT (Section 9 & 12) */}
          {/* ======================================================== */}
          {currentStep === 8 && (
            <div className="wizard-step-pane">
              <div className="section-title-strip">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3>8. Review &amp; Submit Registration</h3>
              </div>

              <div className="review-summary-container space-y-4">
                {/* 1. Personal Details Summary */}
                <div className="review-card">
                  <div className="review-card-header">
                    <h4>1. Personal Details</h4>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-blue-600 text-xs font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="review-grid-3 text-xs">
                    <div><span className="text-slate-400">Full Name:</span> <strong>{formData.title} {formData.firstName} {formData.middleName} {formData.lastName}</strong></div>
                    <div><span className="text-slate-400">Gender / DOB:</span> <strong>{formData.gender} · {formData.dob}</strong></div>
                    <div><span className="text-slate-400">Category:</span> <strong>{formData.admissionCategory} ({formData.caste})</strong></div>
                    <div><span className="text-slate-400">Nationality / Religion:</span> <strong>{formData.nationality} · {formData.religion}</strong></div>
                    <div><span className="text-slate-400">Blood Group:</span> <strong className="text-red-600">{formData.bloodGroup}</strong></div>
                    <div><span className="text-slate-400">Residential Status:</span> <strong>{formData.studentType} (Hostel: {formData.hostel})</strong></div>
                  </div>
                </div>

                {/* 2. Academic Summary */}
                <div className="review-card">
                  <div className="review-card-header">
                    <h4>2. Academic Program Details</h4>
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-blue-600 text-xs font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="review-grid-3 text-xs">
                    <div><span className="text-slate-400">Course &amp; Batch:</span> <strong>{formData.course} · {formData.batch}</strong></div>
                    <div><span className="text-slate-400">Branch &amp; Dept:</span> <strong>{formData.branch} ({formData.deptCode})</strong></div>
                    <div><span className="text-slate-400">Section &amp; House:</span> <strong>{formData.section} · House {formData.house}</strong></div>
                    <div><span className="text-slate-400">Entrance &amp; Rank:</span> <strong>{formData.entranceExam} · Rank {formData.rank}</strong></div>
                    <div><span className="text-slate-400">Email:</span> <strong>{formData.email}</strong></div>
                    <div><span className="text-slate-400">Mobile:</span> <strong>{formData.phone}</strong></div>
                  </div>
                </div>

                {/* 3. Qualifications Summary */}
                <div className="review-card">
                  <div className="review-card-header">
                    <h4>3. Educational Qualifications ({formData.qualifications.filter(q => q.institute).length} Recorded)</h4>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-blue-600 text-xs font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-xs space-y-1">
                    {formData.qualifications.filter(q => q.institute).map((q, i) => (
                      <div key={i} className="flex justify-between border-b border-slate-100 pb-1">
                        <span><strong>{q.qualification}</strong>: {q.institute} ({q.year})</span>
                        <strong className="text-blue-700">{q.marks} ({q.status})</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Guardians Summary */}
                <div className="review-card">
                  <div className="review-card-header">
                    <h4>4. Guardians ({formData.guardians.length})</h4>
                    <button type="button" onClick={() => setCurrentStep(4)} className="text-blue-600 text-xs font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-xs space-y-1">
                    {formData.guardians.map((g, i) => (
                      <div key={i} className="flex justify-between border-b border-slate-100 pb-1">
                        <span><strong>{g.relationship}</strong>: {g.name} · {g.occupation}</span>
                        <span><strong>{g.phone}</strong> {g.isEmergency === 'Yes' && <span className="text-amber-600 font-bold">[Emergency]</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Address Summary */}
                <div className="review-card">
                  <div className="review-card-header">
                    <h4>5. Address Information</h4>
                    <button type="button" onClick={() => setCurrentStep(5)} className="text-blue-600 text-xs font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold">Current Address:</span>
                      <span>{formData.currAddress}, {formData.currCity}, {formData.currState} - {formData.currPin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Permanent Address:</span>
                      <span>{formData.permAddress}, {formData.permCity}, {formData.permState} - {formData.permPin}</span>
                    </div>
                  </div>
                </div>

                {/* 6. Biometrics & Canteen Summary */}
                <div className="review-card">
                  <div className="review-card-header">
                    <h4>6. Biometrics &amp; Canteen Program</h4>
                    <button type="button" onClick={() => setCurrentStep(6)} className="text-blue-600 text-xs font-bold hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="review-grid-3 text-xs">
                    <div><span className="text-slate-400">Biometric Template:</span> <strong className="font-mono">{formData.thumbId || 'FP-AUTO-ASSIGNED'}</strong></div>
                    <div><span className="text-slate-400">Canteen Facility:</span> <strong>{formData.canteenAccess} ({formData.foodAccessStatus})</strong></div>
                    <div>
                      <span className="text-slate-400">Active Meal Plans:</span>{' '}
                      <strong>
                        {[
                          formData.subBreakfast ? 'Breakfast' : null,
                          formData.subLunch ? 'Lunch' : null,
                          formData.subDinner ? 'Dinner' : null
                        ].filter(Boolean).join(', ') || 'None'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Verification Sign-Off */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <ShieldCheck size={24} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900">
                    <strong className="block font-bold text-sm mb-0.5">Autonomous Academic Registry Declaration</strong>
                    <p>
                      I verify that all personal particulars, academic records, entrance ranks, guardian contacts, residence proofs, and uploaded documents have been inspected according to institutional compliance policies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation Controls */}
        <div className="reg-wizard-footer">
          <div className="footer-left">
            <span className="text-xs text-slate-500 font-semibold">
              Step {currentStep} of 8: {STEPS[currentStep - 1].label}
            </span>
          </div>

          <div className="footer-right">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-wizard-nav prev"
                onClick={handlePrev}
                disabled={isSubmitting}
              >
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                className="btn-wizard-nav next"
                onClick={handleNext}
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-wizard-nav submit"
                onClick={handleSubmitRegistration}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    <span>Enrolling Student in Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Submit Complete Registration</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REGISTRATION SUCCESS CREDENTIAL MODAL (Section 12) */}
      {submittedCredential && (
        <div className="canteen-modal-overlay" onClick={() => setSubmittedCredential(null)}>
          <div className="canteen-modal-card max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header bg-emerald-700 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={24} className="text-emerald-200" />
                <div>
                  <h3 className="modal-title text-white">Student Registration Confirmed!</h3>
                  <p className="modal-sub text-emerald-100">Official Institutional Enrollment Complete</p>
                </div>
              </div>
            </div>

            <div className="modal-body space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">Student Legal Name:</span>
                  <strong className="text-slate-900 text-sm">{submittedCredential.name}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">Registration Number:</span>
                  <strong className="text-blue-700 font-mono text-sm font-bold">{submittedCredential.regNo}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">Roll Number / Serial:</span>
                  <strong className="text-slate-900 font-mono">{submittedCredential.rollNumber}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">Student ID:</span>
                  <strong className="text-slate-900 font-mono">{submittedCredential.studentId}</strong>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">Academic Program:</span>
                  <strong className="text-slate-900">{submittedCredential.department}</strong>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 font-semibold">Default LMS Password:</span>
                  <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {submittedCredential.password}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                Data has been permanently committed to the student database, canteen biometric ledger, and official institutional directory.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-wizard-nav prev"
                onClick={() => {
                  setSubmittedCredential(null);
                  onClose();
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-wizard-nav submit"
                onClick={() => {
                  // Switch active student in storage and open student profile
                  setActiveStudent(submittedCredential.regNo);
                  window.location.hash = 'profile';
                  setSubmittedCredential(null);
                  onClose();
                }}
              >
                <ExternalLink size={14} />
                <span>View Complete Student Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
