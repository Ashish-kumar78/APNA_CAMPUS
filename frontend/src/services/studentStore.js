import { generateAllStudents, initialSubjects } from '../data/collegeData.js';

const STORAGE_KEY = 'bput_students_records';
const ACTIVE_STUDENT_KEY = 'bput_active_student_id';

// Default Bishnu Prasad Sahoo complete record matching user screenshots
export const defaultDemoStudent = {
  id: 'std-1',
  studentId: '2401432265',
  rollNumber: '2401432265',
  registrationNumber: '2401432265',
  name: 'BISHNU PRASAD SAHOO',
  firstName: 'BISHNU',
  middleName: 'PRASAD',
  lastName: 'SAHOO',
  title: 'Mr.',
  gender: 'MALE',
  email: 'bishnu.prasad.sahoo@gift.edu.in',
  personalEmail: 'bishnu.prasad.sahoo@gmail.com',
  phone: '7749844291',
  department: 'Computer Science & Engineering (Artificial Intelligence)',
  deptCode: 'CSE (AI)',
  program: 'B.Tech',
  course: 'Bachelor of Technology',
  currentSemester: 3,
  semester: 'Semester 3',
  section: 'CSE (AI) - Genius',
  sectionName: 'CSE (AI) - Genius',
  academicSection: 'CSE (AI) - Genius',
  batch: 'BTECH 2028-P',
  academicYear: '2024-2028',
  status: 'Active',
  lifecycleStatus: 'ACTIVE',
  cgpa: '8.42',
  attendance: 92,
  lastClassAttendanceDate: '14/10/2026',
  lastHostelAttendanceDate: '16/10/2026',
  backlogCount: 0,
  enrolledSubjects: initialSubjects.filter(s => s.semester === 5 && (s.department === 'CSE' || s.deptCode === 'CSE')),

  // 1. Personal Details (Image 1)
  admissionCategory: 'General',
  dob: '2007-03-04',
  dobFormatted: '04-03-2007',
  nationality: 'Indian',
  caste: 'SEBC/OBC',
  religion: 'HINDU',
  bloodGroup: 'O+',
  birthplace: 'GHASIPUT, CUTTACK',
  identificationMark: 'NO',
  thumbId: '19181',
  hostel: 'Yes',
  transport: 'N',
  lunch: 'N',
  nss: 'N',
  languagesKnown: 'odia,hindi,english',
  hobbies: '',

  // 2. Academic Details (Image 2)
  branch: 'Computer Science & Engineering (Artificial Intelligence)',
  house: 'ANAND',
  labGroup: '1',
  honors: 'N',
  minor: 'N',
  valueAdded1: '',
  valueAdded2: '',
  valueAdded3: '',
  admissionDate: '2024-08-05',
  admissionDateFormatted: '05-08-2024',
  entranceExam: 'JEE MAIN',
  rank: '0',
  studentStatus: 'Active',
  activeStatus: 'Active',

  // Qualifications Table (Image 2)
  qualifications: [
    { qualification: '10th', institute: 'ARACHANDI UCHA BIDYAMANDIR,NISTIPUR', year: '2022', marks: '82.50' },
    { qualification: '12th', institute: 'Shanti Institute Of Management,CDA,Cuttack', year: '2024', marks: '80.16' },
    { qualification: 'ITI', institute: '0', year: '', marks: '0.00' },
    { qualification: 'Diploma', institute: '0', year: '', marks: '0.00' },
    { qualification: '+3', institute: '0', year: '', marks: '0.00' },
    { qualification: 'BCA', institute: '0', year: '', marks: '0.00' },
    { qualification: 'BBA', institute: '0', year: '', marks: '0.00' },
    { qualification: 'BTECH', institute: '0', year: '', marks: '0.00' },
  ],

  // 3. Guardians Details (Image 3)
  fatherName: 'AJAY KUMAR SAHOO',
  fatherRelationship: 'Father',
  fatherOccupation: 'FARMER',
  fatherPhone: '7749844291',
  fatherLandline: '',
  fatherIncome: '1LAK',
  fatherEmail: '',
  fatherQualification: '',
  fatherHomeAddress: '',
  fatherOfficeAddress: '',
  fatherIsEmergency: 'No',

  motherName: 'SANJUBALA SAHOO',
  motherRelationship: 'Mother',
  motherOccupation: '',
  motherPhone: '',
  motherLandline: '',
  motherIncome: '0',
  motherEmail: '',
  motherQualification: '',
  motherHomeAddress: '',
  motherOfficeAddress: '',
  motherIsEmergency: 'No',

  // 4. Address Details (Image 4)
  currAddress: 'GHASIPUT, CUTTACK',
  currCity: 'Cuttack',
  currState: 'Odisha',
  currCountry: 'India',
  currHouseNo: '',
  currPin: '754008',
  currPhone: '7749844291',

  permAddress: 'GHASIPUT, CUTTACK',
  permCity: 'Cuttack',
  permState: 'Odisha',
  permCountry: 'India',
  permHouseNo: '',
  permPin: '754008',
  permPhone: '7749844291',

  // 5. Documents Details
  documents: {
    passportPhoto: { name: 'Passport-size photograph', status: 'Uploaded', url: '/passport_photo_male.svg' },
    govtIdProof: { name: 'Aadhaar Card', status: 'Uploaded', type: 'Aadhaar Card' },
    panCard: { name: 'PAN Card', status: 'Uploaded', type: 'PAN Card' },
    nptelCert: { name: 'NPTEL Certificate', status: 'Uploaded', type: 'NPTEL Certificate' },
    class10Cert: { name: 'Class 10 certificate', status: 'Uploaded', board: 'BSE Odisha / CBSE' },
    class12Cert: { name: 'Class 12 certificate', status: 'Uploaded', board: 'CHSE Odisha / CBSE' },
  }
};

const FEMALE_FIRST_NAMES = new Set([
  'Priya', 'Sneha', 'Puja', 'Swati', 'Monika', 'Ipsita', 'Smruti', 'Lipika',
  'Archana', 'Sonali', 'Niharika', 'Ananya', 'Pooja', 'Shreya', 'Ankita', 'Divya'
]);

/**
 * Normalizes student demographics for realistic section, semester, and gender distribution
 */
function normalizeStudentData(student, index) {
  const rollNum = parseInt(student.rollNumber) || (index + 1);
  const fName = (student.firstName || (student.name || '').split(' ')[0] || '').trim();
  const isFemale = FEMALE_FIRST_NAMES.has(fName) || student.gender === 'Female';
  const gender = isFemale ? 'Female' : 'Male';
  const title = isFemale ? 'Ms.' : 'Mr.';

  // Section distribution across cohort: 1-32: Sec A, 33-64: Sec B, 65-91: Sec C
  let section = student.section;
  if (!section || section === 'CSE · Section A' || section === 'Section A') {
    if (rollNum <= 32) section = 'Section A';
    else if (rollNum <= 64) section = 'Section B';
    else section = 'Section C';
  }

  // Semester distribution across cohort: 1-45: Sem 5, 46-65: Sem 3, 66-78: Sem 7, 79-91: Sem 1
  let semester = student.semester;
  if (!semester || semester === 'Semester 5') {
    if (rollNum <= 45) semester = 'Semester 5';
    else if (rollNum <= 65) semester = 'Semester 3';
    else if (rollNum <= 78) semester = 'Semester 7';
    else semester = 'Semester 1';
  }

  const studentId = student.studentId || `GIFT-2023-${1000 + rollNum}`;

  return {
    ...student,
    studentId,
    gender,
    title: student.title || title,
    section,
    semester,
    academicSection: `${student.deptCode || 'CSE'} · ${section}`
  };
}

/**
 * Fetch all students from storage or initialize
 */
export function getAllStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s, idx) => normalizeStudentData(s, idx));
      }
    }
  } catch (e) {
    console.error('Error reading students storage:', e);
  }

  // Initialize with generateAllStudents and demo details
  const initialList = generateAllStudents().map((s, idx) => {
    if (s.id === 'std-1' || s.rollNumber === '01') {
      return normalizeStudentData({ ...s, ...defaultDemoStudent }, idx);
    }
    const rollNum = parseInt(s.rollNumber) || (idx + 1);
    const fName = s.name.split(' ')[0];
    const isFemale = FEMALE_FIRST_NAMES.has(fName);
    return normalizeStudentData({
      ...s,
      registrationNumber: `230520${s.rollNumber.padStart(4, '0')}`,
      admissionCategory: 'General',
      title: isFemale ? 'Ms.' : 'Mr.',
      firstName: fName,
      lastName: s.name.split(' ').slice(1).join(' ') || 'Kumar',
      middleName: 'Not provided',
      gender: isFemale ? 'Female' : 'Male',
      dob: '2005-04-10',
      dobFormatted: '10-04-2005',
      nationality: 'Indian',
      caste: 'General',
      religion: 'Hindu',
      bloodGroup: 'B+',
      birthplace: 'Bhubaneswar, Odisha',
      identificationMark: 'Not provided',
      thumbId: `GFT230520${s.rollNumber.padStart(4, '0')}`,
      hostel: 'No',
      transport: 'No',
      lunch: 'No',
      nss: 'No',
      languagesKnown: 'Odia, English, Hindi',
      hobbies: 'Not provided',

      course: 'Bachelor of Technology',
      batch: 'BTECH 2023–2027',
      branch: s.department,
      academicSection: `${s.deptCode || 'CSE'} · ${s.section}`,
      house: 'Not assigned',
      labGroup: '1',
      honors: 'No',
      minor: 'No',
      valueAdded1: 'Not selected',
      valueAdded2: 'Not selected',
      valueAdded3: 'Not selected',
      admissionDate: '2023-08-05',
      admissionDateFormatted: '05-08-2023',
      entranceExam: 'JEE (Main)',
      rank: 'Not provided',
      studentStatus: s.status,
      activeStatus: s.status,

      qualifications: defaultDemoStudent.qualifications,

      fatherName: `${s.name.split(' ').slice(1).join(' ') || 'Guardian'} Senior`,
      fatherRelationship: 'Father',
      fatherPhone: s.phone,
      fatherEmail: `guardian.${s.email}`,
      motherName: 'Mother Guardian',
      motherRelationship: 'Mother',
      motherPhone: s.phone,
      motherEmail: `mother.${s.email}`,

      permAddress: 'Campus Road, Gandarpur',
      permCity: 'Bhubaneswar',
      permState: 'Odisha',
      permCountry: 'India',
      permPin: '751010',

      currAddress: 'Campus Hostel, Apna Campus',
      currCity: 'Bhubaneswar',
      currState: 'Odisha',
      currCountry: 'India',
      currPin: '751054',

      documents: defaultDemoStudent.documents
    }, idx);
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList));
  } catch (err) {
    // Ignore quota errors
  }

  return initialList;
}

/**
 * Save new student or update existing
 */
export function saveStudent(studentData) {
  const all = getAllStudents();
  let updatedList = [];
  let savedRecord = null;

  if (studentData.id) {
    // Update existing
    updatedList = all.map(s => {
      if (s.id === studentData.id) {
        savedRecord = { ...s, ...studentData };
        return savedRecord;
      }
      return s;
    });
  } else {
    // Add new student
    const newId = `std-${Date.now()}`;
    const regNo = studentData.registrationNumber || `230520${String(studentData.rollNumber || (all.length + 1)).padStart(4, '0')}`;
    const studentId = studentData.studentId || `GIFT-2023-${1000 + all.length + 1}`;
    const thumbId = studentData.thumbId || `GFT${regNo}`;

    // Format DOB if needed
    let dobFormatted = studentData.dob || '15-03-2005';
    if (studentData.dob && studentData.dob.includes('-')) {
      const parts = studentData.dob.split('-');
      if (parts[0].length === 4) {
        dobFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Format Admission Date if needed
    let admissionDateFormatted = studentData.admissionDate || '05-08-2023';
    if (studentData.admissionDate && studentData.admissionDate.includes('-')) {
      const parts = studentData.admissionDate.split('-');
      if (parts[0].length === 4) {
        admissionDateFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const fullName = `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || studentData.name || 'New Student';

    savedRecord = {
      ...studentData,
      id: newId,
      name: fullName,
      role: 'student',
      detail: `${studentData.course || 'B.Tech'} · ${studentData.department || studentData.branch || 'CSE'} · ${studentData.semester || 'Sem 1'}`,
      department: studentData.department || studentData.branch || 'Computer Science & Engineering',
      studentId,
      registrationNumber: regNo,
      thumbId,
      dobFormatted,
      admissionDateFormatted,
      cgpa: studentData.cgpa || '8.20',
      attendance: studentData.attendance || 90,
      backlogCount: studentData.backlogCount !== undefined ? Number(studentData.backlogCount) : 0,
      status: studentData.status || 'Active',
      lifecycleStatus: studentData.lifecycleStatus || 'ADMITTED',
      program: studentData.program || studentData.course || 'Bachelor of Technology',
      batch: studentData.batch || 'BTECH 2026–2030',
      academicSection: `${studentData.deptCode || 'CSE'} · ${studentData.section || 'Section A'}`,
      enrolledSubjects: studentData.enrolledSubjects || initialSubjects
        .filter(sub => sub.program === (studentData.program || 'B.Tech') || sub.department === (studentData.deptCode || 'CSE'))
        .map(sub => sub.name),
      qualifications: studentData.qualifications && studentData.qualifications.length > 0
        ? studentData.qualifications
        : [
            { qualification: '10th', institute: studentData.qual10thInstitute || 'High School', year: studentData.qual10thYear || '2021', marks: studentData.qual10thMarks || '80.00%' },
            { qualification: '12th', institute: studentData.qual12thInstitute || 'Senior Secondary', year: studentData.qual12thYear || '2023', marks: studentData.qual12thMarks || '84.00%' },
            { qualification: 'ITI', institute: studentData.qualItiInstitute || 'Not applicable', year: studentData.qualItiYear || '—', marks: studentData.qualItiMarks || '—' },
            { qualification: 'Diploma', institute: studentData.qualDiplomaInstitute || 'Not applicable', year: studentData.qualDiplomaYear || '—', marks: studentData.qualDiplomaMarks || '—' },
            { qualification: '+3', institute: studentData.qualPlus3Institute || 'Not applicable', year: studentData.qualPlus3Year || '—', marks: studentData.qualPlus3Marks || '—' },
            { qualification: 'BCA', institute: studentData.qualBcaInstitute || 'Not applicable', year: studentData.qualBcaYear || '—', marks: studentData.qualBcaMarks || '—' },
            { qualification: 'BBA', institute: studentData.qualBbaInstitute || 'Not applicable', year: studentData.qualBbaYear || '—', marks: studentData.qualBbaMarks || '—' },
            { qualification: 'BTECH', institute: studentData.qualBtechInstitute || 'Apna Campus, Bhubaneswar', year: studentData.qualBtechYear || '2027', marks: studentData.qualBtechMarks || 'In progress' },
          ],
      documents: {
        passportPhoto: {
          name: 'Passport-size photograph',
          status: 'Uploaded',
          url: studentData.passportPhotoUrl || '/passport_photo_male.svg',
          filename: studentData.passportPhotoName || 'passport_photo.jpg'
        },
        govtIdProof: {
          name: 'Government ID proof',
          status: 'Uploaded',
          type: studentData.govtIdType || 'Aadhaar Card',
          filename: studentData.govtIdFilename || 'govt_id_proof.pdf'
        },
        class10Cert: {
          name: 'Class 10 certificate',
          status: 'Uploaded',
          board: studentData.class10Board || 'CBSE/BSE',
          filename: studentData.class10Filename || 'class_10_certificate.pdf'
        },
        class12Cert: {
          name: 'Class 12 certificate',
          status: 'Uploaded',
          board: studentData.class12Board || 'CBSE/CHSE',
          filename: studentData.class12Filename || 'class_12_certificate.pdf'
        }
      }
    };

    // Prepend new student so they appear at the top
    updatedList = [savedRecord, ...all];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    if (savedRecord) {
      localStorage.setItem(ACTIVE_STUDENT_KEY, savedRecord.id);
    }
    // Dispatch custom event to notify all components in the app
    window.dispatchEvent(new CustomEvent('cms_students_changed', { detail: savedRecord }));
  } catch (err) {
    console.error('Error saving student to localStorage:', err);
  }

  return savedRecord;
}

/**
 * Get the currently active student record for student section view
 */
export function getActiveStudent() {
  const all = getAllStudents();
  const activeId = localStorage.getItem(ACTIVE_STUDENT_KEY);
  if (activeId) {
    const found = all.find(s => s.id === activeId || s.registrationNumber === activeId || s.rollNumber === activeId);
    if (found) return found;
  }
  return all[0] || defaultDemoStudent;
}

/**
 * Set active student by ID or roll number
 */
export function setActiveStudent(studentIdOrRoll) {
  localStorage.setItem(ACTIVE_STUDENT_KEY, studentIdOrRoll);
  window.dispatchEvent(new CustomEvent('cms_active_student_changed', { detail: studentIdOrRoll }));
}

/**
 * Find student by registration number, roll number, email, or name
 */
export function findStudentByQuery(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  const all = getAllStudents();
  return all.find(s => 
    (s.registrationNumber && s.registrationNumber.toLowerCase() === q) ||
    (s.rollNumber && s.rollNumber.toLowerCase() === q) ||
    (s.email && s.email.toLowerCase() === q) ||
    (s.name && s.name.toLowerCase() === q) ||
    (s.studentId && s.studentId.toLowerCase() === q)
  );
}

// ── CAMPUS DOCUMENT STORE ──────────────────────────────────────────────────────

const DOCS_STORAGE_KEY = 'bput_campus_documents';

const initialDocuments = [
  {
    id: 'doc-001',
    title: 'Academic Calendar 2026-27',
    description: 'Full academic calendar for all departments including exam schedules, holidays, and events.',
    category: 'Academic',
    uploadedBy: 'Campus Administrator',
    uploaderRole: 'admin',
    uploadedAt: '2026-09-01T10:00:00Z',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    fileName: 'academic_calendar_2026-27.pdf',
    fileUrl: null,
    visibleTo: ['admin', 'faculty', 'hod', 'student'],
    tags: ['calendar', 'schedule', 'exams']
  },
  {
    id: 'doc-002',
    title: 'Examination Guidelines – End Semester 2026',
    description: 'Rules, seating arrangements, dress code and conduct instructions for all students appearing in end semester exams.',
    category: 'Examination',
    uploadedBy: 'Campus Administrator',
    uploaderRole: 'admin',
    uploadedAt: '2026-09-15T09:30:00Z',
    fileType: 'PDF',
    fileSize: '850 KB',
    fileName: 'exam_guidelines_sem_2026.pdf',
    fileUrl: null,
    visibleTo: ['admin', 'faculty', 'hod', 'student'],
    tags: ['exams', 'guidelines', 'semester']
  },
  {
    id: 'doc-003',
    title: 'Faculty Training Workshop – Session Notes',
    description: 'Summarized notes and resource links from the Faculty Pedagogy and ICT Integration workshop held in September 2026.',
    category: 'Training',
    uploadedBy: 'Dr. P. K. Pattnaik',
    uploaderRole: 'hod',
    uploadedAt: '2026-09-22T14:00:00Z',
    fileType: 'DOCX',
    fileSize: '640 KB',
    fileName: 'faculty_workshop_notes_sep2026.docx',
    fileUrl: null,
    visibleTo: ['admin', 'faculty', 'hod'],
    tags: ['faculty', 'workshop', 'training']
  }
];

/**
 * Get all campus documents
 */
export function getAllDocuments() {
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading documents storage:', e);
  }
  // Initialize with default
  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(initialDocuments));
  } catch (err) {}
  return initialDocuments;
}

/**
 * Save (add/update) a campus document
 */
export function saveDocument(docData) {
  const all = getAllDocuments();
  let updatedList;
  let savedDoc;

  if (docData.id && all.some(d => d.id === docData.id)) {
    // Update existing
    updatedList = all.map(d => {
      if (d.id === docData.id) {
        savedDoc = { ...d, ...docData };
        return savedDoc;
      }
      return d;
    });
  } else {
    // Add new
    savedDoc = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      visibleTo: docData.visibleTo || ['admin', 'faculty', 'hod']
    };
    updatedList = [savedDoc, ...all];
  }

  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('cms_documents_changed', { detail: savedDoc }));
  } catch (err) {
    console.error('Error saving document:', err);
  }
  return savedDoc;
}

/**
 * Delete a campus document by id
 */
export function deleteDocument(docId) {
  const all = getAllDocuments();
  const updated = all.filter(d => d.id !== docId);
  try {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cms_documents_changed', { detail: { deleted: docId } }));
  } catch (err) {}
}

/**
 * Get documents visible to a specific role
 */
export function getDocumentsForRole(role) {
  return getAllDocuments().filter(d => d.visibleTo && d.visibleTo.includes(role));
}

const STUDENT_DOCS_KEY = 'bput_student_custom_docs';

/**
 * Get all documents for a specific student (standard verified docs + custom uploads)
 */
export function getStudentDocuments(studentQuery) {
  const student = findStudentByQuery(studentQuery) || {};
  const studentKey = student.id || student.registrationNumber || 'std-1';
  const rollNum = parseInt(student.rollNumber) || 1;

  // NPTEL courses rotated by student roll number
  const nptelCourses = [
    'Cloud Computing & Distributed Systems',
    'Python for Data Science',
    'Data Structures & Algorithms in Java',
    'Introduction to Machine Learning',
    'Cyber Security & Cryptography',
    'Database Management Systems',
    'Artificial Intelligence & Deep Learning',
    'Full Stack Web Development with Node'
  ];
  const assignedNptel = nptelCourses[(rollNum - 1) % nptelCourses.length];

  // Base verified student documents with Aadhaar, PAN, NPTEL, 10th, 12th, and Photo
  const standardDocs = [
    {
      id: `${studentKey}-aadhaar`,
      name: 'Aadhaar Card',
      category: 'Identification',
      status: 'Verified',
      fileType: 'PDF',
      fileName: student.documents?.govtIdProof?.filename || `aadhaar_card_${student.rollNumber || '01'}.pdf`,
      fileUrl: student.documents?.govtIdProof?.fileUrl || null,
      uploadedAt: '12 Aug 2023',
      verified: true
    },
    {
      id: `${studentKey}-pan`,
      name: 'PAN Card',
      category: 'Identification',
      status: 'Verified',
      fileType: 'PDF',
      fileName: `pan_card_${student.rollNumber || '01'}.pdf`,
      fileUrl: null,
      uploadedAt: '14 Aug 2023',
      verified: true
    },
    {
      id: `${studentKey}-nptel`,
      name: `NPTEL Certificate (${assignedNptel})`,
      category: 'Certification',
      status: 'Verified',
      fileType: 'PDF',
      fileName: `nptel_cert_${(student.name || 'student').toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileUrl: null,
      uploadedAt: '20 Jan 2024',
      verified: true
    },
    {
      id: `${studentKey}-class10`,
      name: 'Class 10 Certificate',
      category: 'Academic',
      status: 'Verified',
      fileType: 'PDF',
      fileName: student.documents?.class10Cert?.filename || `class_10_certificate_${student.rollNumber || '01'}.pdf`,
      fileUrl: student.documents?.class10Cert?.fileUrl || null,
      uploadedAt: '15 Aug 2023',
      verified: true
    },
    {
      id: `${studentKey}-class12`,
      name: 'Class 12 Certificate',
      category: 'Academic',
      status: 'Verified',
      fileType: 'PDF',
      fileName: student.documents?.class12Cert?.filename || `class_12_certificate_${student.rollNumber || '01'}.pdf`,
      fileUrl: student.documents?.class12Cert?.fileUrl || null,
      uploadedAt: '15 Aug 2023',
      verified: true
    },
    {
      id: `${studentKey}-passport`,
      name: 'Passport-size Photograph',
      category: 'Identification',
      status: 'Verified',
      fileType: 'IMAGE',
      fileName: student.documents?.passportPhoto?.filename || 'passport_photo.jpg',
      fileUrl: student.documents?.passportPhoto?.url || '/passport_photo.svg',
      uploadedAt: '10 Aug 2023',
      verified: true
    }
  ];

  // Retrieve custom uploaded documents for this student
  let customDocs = [];
  try {
    const raw = localStorage.getItem(`${STUDENT_DOCS_KEY}_${studentKey}`);
    if (raw) {
      customDocs = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading student custom docs:', e);
  }

  // Also check if student object in store has customDocuments
  if (Array.isArray(student.customDocuments)) {
    student.customDocuments.forEach(doc => {
      if (!customDocs.some(d => d.id === doc.id || d.name === doc.name)) {
        customDocs.push(doc);
      }
    });
  }

  return [...standardDocs, ...customDocs];
}

/**
 * Get all document records across all students for the master documents table
 */
export function getAllStudentDocumentRecords() {
  const students = getAllStudents();
  const records = [];

  students.forEach((student, studentIndex) => {
    const studentDocs = getStudentDocuments(student.id || student.registrationNumber || student.rollNumber);
    studentDocs.forEach((doc, docIndex) => {
      const rollNum = parseInt(student.rollNumber) || (studentIndex + 1);
      const studentId = student.studentId || `GIFT-2023-${1000 + rollNum}`;
      records.push({
        id: `${student.id || student.rollNumber || studentIndex}-${doc.id || docIndex}`,
        studentId,
        registrationNumber: student.registrationNumber || `230520${String(rollNum).padStart(4, '0')}`,
        rollNumber: student.rollNumber || String(rollNum).padStart(2, '0'),
        studentName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
        sex: student.gender === 'Female' ? 'Female' : 'Male',
        gender: student.gender === 'Female' ? 'Female' : 'Male',
        section: student.section || 'Section A',
        semester: student.semester || 'Semester 5',
        department: student.department || 'Computer Science & Engineering',
        deptCode: student.deptCode || 'CSE',
        docId: doc.id,
        docName: doc.name,
        category: doc.category || 'Academic',
        status: doc.status || 'Verified',
        fileType: doc.fileType || 'PDF',
        fileName: doc.fileName || `${doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
        fileSize: doc.fileSize || '1.2 MB',
        fileUrl: doc.fileUrl || null,
        uploadedAt: doc.uploadedAt || '15 Aug 2023',
        verified: doc.verified !== false,
        studentObj: student,
        rawDoc: doc
      });
    });
  });

  return records;
}

/**
 * Add a new uploaded document for a student
 * Persists to student custom docs AND adds to shared campus repository for Admin, Faculty, HOD
 */
export function addStudentDocument(studentQuery, docData) {
  const student = findStudentByQuery(studentQuery) || { id: 'std-1', name: 'Rakesh Das', rollNumber: '01', registrationNumber: '2305201001' };
  const studentKey = student.id || student.registrationNumber || 'std-1';

  const newDoc = {
    id: `doc-std-${Date.now()}`,
    name: docData.name,
    category: docData.category || 'Academic',
    status: 'Uploaded',
    fileName: docData.fileName || `${docData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
    fileType: docData.fileType || 'PDF',
    fileSize: docData.fileSize || '1.2 MB',
    fileUrl: docData.fileUrl || null,
    uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    verified: true,
    studentId: student.id,
    studentName: student.name,
    studentReg: student.registrationNumber,
    remarks: docData.remarks || 'Verified Student Upload'
  };

  // 1. Save in student-specific localStorage key
  try {
    const current = getStudentDocuments(studentKey).filter(d => !d.id.endsWith('-passport') && !d.id.endsWith('-govtid') && !d.id.endsWith('-class10') && !d.id.endsWith('-class12'));
    const updated = [...current, newDoc];
    localStorage.setItem(`${STUDENT_DOCS_KEY}_${studentKey}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Error writing student custom docs:', e);
  }

  // 2. Also attach to student in getAllStudents()
  try {
    const all = getAllStudents();
    const updatedList = all.map(s => {
      if (s.id === student.id || s.registrationNumber === student.registrationNumber) {
        const existingDocs = s.customDocuments || [];
        return {
          ...s,
          customDocuments: [...existingDocs, newDoc]
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {}

  // 3. Save into shared campus documents repository so Admin, Faculty, and HOD can see it immediately!
  saveDocument({
    title: `${newDoc.name} · ${student.name}`,
    description: `Official document (${newDoc.category}) uploaded for ${student.name} (Reg No: ${student.registrationNumber || student.rollNumber}). File: ${newDoc.fileName}`,
    category: 'Student Records',
    uploadedBy: student.name || 'Student',
    uploaderRole: 'student',
    fileName: newDoc.fileName,
    fileType: newDoc.fileType,
    fileSize: newDoc.fileSize,
    fileUrl: newDoc.fileUrl,
    visibleTo: ['admin', 'faculty', 'hod', 'student'],
    studentId: student.id,
    studentName: student.name,
    studentReg: student.registrationNumber,
    studentRoll: student.rollNumber,
    tags: ['student', 'document', newDoc.category.toLowerCase()]
  });

  // 4. Notify app components via custom event
  window.dispatchEvent(new CustomEvent('cms_student_documents_changed', { detail: { studentKey, doc: newDoc } }));

  return newDoc;
}

