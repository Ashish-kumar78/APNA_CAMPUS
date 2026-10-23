// ==========================================================================
// Autonomous Examination Cell (CoE) Enterprise Data Store
// Apna Campus — Office of the Controller of Examinations
// Handles: Registration, Eligibility, Debarment, Question Papers, Booklets,
// Practical/Viva, External Marks, Results, Certificates, UFM & Grievances
// ==========================================================================

const STORAGE_KEY = 'apna_campus_coe_store_v1';

// Seed Student Registrations (Workflow A & B)
export const initialRegistrations = [
  {
    id: 'REG-2026-001',
    rollNumber: '01',
    regNo: '2305201001',
    name: 'Rakesh Das',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 5',
    category: 'Regular', // Regular, Backlog, Supplementary
    subjects: [
      { code: 'CS501', name: 'Data Structures & Algorithms', type: 'Theory', credits: 4, eligible: true, attendance: 88, iaScore: 19 },
      { code: 'CS502', name: 'Operating Systems', type: 'Theory', credits: 4, eligible: true, attendance: 86, iaScore: 18 },
      { code: 'CS503', name: 'Database Management Systems', type: 'Theory', credits: 4, eligible: true, attendance: 90, iaScore: 19 },
      { code: 'CS504', name: 'Artificial Intelligence', type: 'Theory', credits: 3, eligible: true, attendance: 85, iaScore: 18 },
      { code: 'CS505', name: 'Machine Learning', type: 'Theory', credits: 3, eligible: true, attendance: 92, iaScore: 19 },
      { code: 'CS591', name: 'Data Structures Lab', type: 'Practical', credits: 2, eligible: true, attendance: 94, iaScore: 28 },
      { code: 'CS592', name: 'Operating Systems Lab', type: 'Practical', credits: 2, eligible: true, attendance: 91, iaScore: 27 },
    ],
    totalCredits: 22,
    feeStatus: 'Paid', // Paid, Pending, Exempted, Late Fine Paid
    feeAmount: 2200,
    transactionId: 'TXN-EXAM-99281',
    applicationDate: '24 Sep 2026',
    status: 'Approved', // Pending Verification, Approved, Rejected, Conditionally Approved
    approvedBy: 'Dr. K. C. Patra (CoE)',
    approvalDate: '28 Sep 2026',
    remarks: 'Clearance verified. Attendance aggregate 89.4%.',
  },
  {
    id: 'REG-2026-002',
    rollNumber: '02',
    regNo: '2305201002',
    name: 'Amit Nayak',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 5',
    category: 'Regular',
    subjects: [
      { code: 'CS501', name: 'Data Structures & Algorithms', type: 'Theory', credits: 4, eligible: true, attendance: 82, iaScore: 17 },
      { code: 'CS502', name: 'Operating Systems', type: 'Theory', credits: 4, eligible: true, attendance: 80, iaScore: 16 },
      { code: 'CS503', name: 'Database Management Systems', type: 'Theory', credits: 4, eligible: true, attendance: 84, iaScore: 18 },
      { code: 'CS504', name: 'Artificial Intelligence', type: 'Theory', credits: 3, eligible: true, attendance: 81, iaScore: 17 },
      { code: 'CS505', name: 'Machine Learning', type: 'Theory', credits: 3, eligible: true, attendance: 83, iaScore: 18 },
      { code: 'CS591', name: 'Data Structures Lab', type: 'Practical', credits: 2, eligible: true, attendance: 88, iaScore: 26 },
      { code: 'CS592', name: 'Operating Systems Lab', type: 'Practical', credits: 2, eligible: true, attendance: 86, iaScore: 25 },
    ],
    totalCredits: 22,
    feeStatus: 'Paid',
    feeAmount: 2200,
    transactionId: 'TXN-EXAM-99284',
    applicationDate: '25 Sep 2026',
    status: 'Approved',
    approvedBy: 'Dr. K. C. Patra (CoE)',
    approvalDate: '28 Sep 2026',
    remarks: 'Approved. All criteria met.',
  },
  {
    id: 'REG-2026-003',
    rollNumber: '03',
    regNo: '2305201003',
    name: 'Raj Sahoo',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 5',
    category: 'Regular',
    subjects: [
      { code: 'CS501', name: 'Data Structures & Algorithms', type: 'Theory', credits: 4, eligible: true, attendance: 79, iaScore: 16 },
      { code: 'CS502', name: 'Operating Systems', type: 'Theory', credits: 4, eligible: true, attendance: 78, iaScore: 15 },
      { code: 'CS503', name: 'Database Management Systems', type: 'Theory', credits: 4, eligible: true, attendance: 80, iaScore: 17 },
      { code: 'CS504', name: 'Artificial Intelligence', type: 'Theory', credits: 3, eligible: true, attendance: 78, iaScore: 16 },
      { code: 'CS505', name: 'Machine Learning', type: 'Theory', credits: 3, eligible: true, attendance: 81, iaScore: 17 },
      { code: 'CS591', name: 'Data Structures Lab', type: 'Practical', credits: 2, eligible: true, attendance: 85, iaScore: 25 },
      { code: 'CS592', name: 'Operating Systems Lab', type: 'Practical', credits: 2, eligible: true, attendance: 82, iaScore: 24 },
    ],
    totalCredits: 22,
    feeStatus: 'Paid',
    feeAmount: 2200,
    transactionId: 'TXN-EXAM-99302',
    applicationDate: '26 Sep 2026',
    status: 'Approved',
    approvedBy: 'Dr. K. C. Patra (CoE)',
    approvalDate: '29 Sep 2026',
    remarks: 'Clearance verified. Attendance > 75%.',
  },
  {
    id: 'REG-2026-004',
    rollNumber: '04',
    regNo: '2305201004',
    name: 'Priya Patra',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 5',
    category: 'Regular',
    subjects: [
      { code: 'CS501', name: 'Data Structures & Algorithms', type: 'Theory', credits: 4, eligible: true, attendance: 95, iaScore: 20 },
      { code: 'CS502', name: 'Operating Systems', type: 'Theory', credits: 4, eligible: true, attendance: 94, iaScore: 19 },
      { code: 'CS503', name: 'Database Management Systems', type: 'Theory', credits: 4, eligible: true, attendance: 96, iaScore: 20 },
      { code: 'CS504', name: 'Artificial Intelligence', type: 'Theory', credits: 3, eligible: true, attendance: 92, iaScore: 19 },
      { code: 'CS505', name: 'Machine Learning', type: 'Theory', credits: 3, eligible: true, attendance: 97, iaScore: 20 },
      { code: 'CS591', name: 'Data Structures Lab', type: 'Practical', credits: 2, eligible: true, attendance: 98, iaScore: 30 },
      { code: 'CS592', name: 'Operating Systems Lab', type: 'Practical', credits: 2, eligible: true, attendance: 96, iaScore: 29 },
    ],
    totalCredits: 22,
    feeStatus: 'Paid',
    feeAmount: 2200,
    transactionId: 'TXN-EXAM-99210',
    applicationDate: '22 Sep 2026',
    status: 'Approved',
    approvedBy: 'Dr. K. C. Patra (CoE)',
    approvalDate: '25 Sep 2026',
    remarks: 'Merit scholar. Zero dues.',
  },
  {
    id: 'REG-2026-005',
    rollNumber: '05',
    regNo: '2305201005',
    name: 'Sourav Mohanty',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 5',
    category: 'Backlog',
    subjects: [
      { code: 'CS502', name: 'Operating Systems (Backlog Paper)', type: 'Theory', credits: 4, eligible: true, attendance: 67, iaScore: 12 },
      { code: 'CS301', name: 'Digital Logic & Microprocessors (Arrear)', type: 'Theory', credits: 4, eligible: true, attendance: 72, iaScore: 14 },
    ],
    totalCredits: 8,
    feeStatus: 'Paid',
    feeAmount: 1200,
    transactionId: 'TXN-EXAM-99411',
    applicationDate: '28 Sep 2026',
    status: 'Conditionally Approved',
    approvedBy: 'Dr. K. C. Patra (CoE)',
    approvalDate: '01 Oct 2026',
    remarks: 'Special CoE Attendance Condonation granted on medical appeal (Ref: MED-2026-441).',
  },
  {
    id: 'REG-2026-006',
    rollNumber: '06',
    regNo: '2305201006',
    name: 'Sneha Mohanty',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 5',
    category: 'Regular',
    subjects: [
      { code: 'CS501', name: 'Data Structures & Algorithms', type: 'Theory', credits: 4, eligible: false, attendance: 84, iaScore: 16 },
      { code: 'CS502', name: 'Operating Systems', type: 'Theory', credits: 4, eligible: false, attendance: 82, iaScore: 15 },
      { code: 'CS503', name: 'Database Management Systems', type: 'Theory', credits: 4, eligible: false, attendance: 85, iaScore: 17 },
      { code: 'CS504', name: 'Artificial Intelligence', type: 'Theory', credits: 3, eligible: false, attendance: 81, iaScore: 15 },
      { code: 'CS505', name: 'Machine Learning', type: 'Theory', credits: 3, eligible: false, attendance: 83, iaScore: 16 },
    ],
    totalCredits: 18,
    feeStatus: 'Pending',
    feeAmount: 2200,
    transactionId: null,
    applicationDate: '29 Sep 2026',
    status: 'Pending Verification',
    approvedBy: null,
    approvalDate: null,
    remarks: 'Application awaiting Accounts clearance (Semester Tuition fee ₹12,000 pending).',
  },
  {
    id: 'REG-2026-007',
    rollNumber: '09',
    regNo: '2305201009',
    name: 'Subham Swain',
    course: 'B.Tech',
    branch: 'Electronics & Communication',
    semester: 'Semester 5',
    category: 'Regular',
    subjects: [
      { code: 'EC501', name: 'Microprocessors & Interfacing', type: 'Theory', credits: 4, eligible: false, attendance: 62, iaScore: 11 },
      { code: 'EC502', name: 'Digital Signal Processing', type: 'Theory', credits: 4, eligible: false, attendance: 58, iaScore: 9 },
      { code: 'EC503', name: 'Electromagnetic Field Theory', type: 'Theory', credits: 4, eligible: false, attendance: 64, iaScore: 10 },
    ],
    totalCredits: 12,
    feeStatus: 'Pending',
    feeAmount: 2200,
    transactionId: null,
    applicationDate: '30 Sep 2026',
    status: 'Rejected',
    approvedBy: 'Dr. K. C. Patra (CoE)',
    approvalDate: '02 Oct 2026',
    remarks: 'Debarred from End-Semester Examination due to severe attendance shortage (<65%) and failure to submit medical certificate.',
  },
  {
    id: 'REG-2026-008',
    rollNumber: '11',
    regNo: '2305201011',
    name: 'Tanmay Mohapatra',
    course: 'B.Tech',
    branch: 'Mechanical Engineering',
    semester: 'Semester 5',
    category: 'Supplementary',
    subjects: [
      { code: 'ME302', name: 'Fluid Mechanics (Supplementary)', type: 'Theory', credits: 4, eligible: true, attendance: 80, iaScore: 15 },
      { code: 'ME304', name: 'Kinematics of Machines (Supplementary)', type: 'Theory', credits: 4, eligible: true, attendance: 78, iaScore: 14 },
    ],
    totalCredits: 8,
    feeStatus: 'Paid',
    feeAmount: 1400,
    transactionId: 'TXN-EXAM-99512',
    applicationDate: '01 Oct 2026',
    status: 'Approved',
    approvedBy: 'Dr. K. C. Patra (CoE)',
    approvalDate: '03 Oct 2026',
    remarks: 'Supplementary fee paid including late fine ₹200. Clear for admit card.',
  }
];

// Seed Debarment Records (Workflow B)
export const initialDebarments = [
  {
    id: 'DEBAR-2026-001',
    rollNumber: '09',
    regNo: '2305201009',
    name: 'Subham Swain',
    department: 'Electronics & Communication',
    semester: 'Semester 5',
    reason: 'Critical Attendance Deficit (Aggregate 61.3% < 75% threshold)',
    debarredPapers: ['EC501', 'EC502', 'EC503', 'EC591'],
    orderNo: 'GIFT/COE/DEBAR/2026/14',
    orderDate: '02 Oct 2026',
    authorizedOfficer: 'Dr. K. C. Patra (Controller of Examinations)',
    appealStatus: 'Appeal Rejected by Academic Council',
    status: 'Active Debarment',
  },
  {
    id: 'DEBAR-2026-002',
    rollNumber: '18',
    regNo: '2305201018',
    name: 'Bibek Samal',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    reason: 'Unfair Means Case (Mobile Device Confiscation in Mid-Term Cycle)',
    debarredPapers: ['CS503'],
    orderNo: 'GIFT/COE/DEBAR/2026/09',
    orderDate: '26 Sep 2026',
    authorizedOfficer: 'Dr. K. C. Patra (Controller of Examinations)',
    appealStatus: 'Debarred for 1 Paper Only',
    status: 'Active Debarment',
  }
];

// Seed Question Paper Vault & Submissions (Workflow C)
export const initialQuestionPapers = [
  {
    id: 'QP-2026-CS501',
    code: 'CS501',
    subject: 'Data Structures & Algorithms',
    course: 'B.Tech CSE / AI&DS',
    semester: 'Semester 5',
    examCycle: 'Autumn End-Semester 2026',
    paperSetter: 'Dr. Debabrata Jena (External - VSSUT Burla)',
    moderator: 'Prof. S. K. Pradhan (Senior Faculty)',
    setsAvailable: ['Set A (Master)', 'Set B (Reserve 1)', 'Set C (Reserve 2)'],
    selectedSet: 'Set A (Master)',
    securityStatus: 'Encrypted & Cryptographically Sealed',
    vaultRef: 'VAULT-SEC-2026-081',
    encryptionAlgorithm: 'AES-256 GCM (Dual Keycard Auth)',
    submissionDate: '15 Sep 2026',
    scrutinyDate: '22 Sep 2026',
    coEApprovalDate: '29 Sep 2026',
    status: 'Approved & Sealed in Strongroom',
    versionHistory: [
      { version: 'v1.0', date: '15 Sep 2026', author: 'External Setter', notes: 'Initial 5 modules question paper set uploaded' },
      { version: 'v1.1', date: '22 Sep 2026', author: 'Moderation Board', notes: 'Corrected marks distribution in Q4 and Bloom level alignment' },
      { version: 'v2.0-Final', date: '29 Sep 2026', author: 'Dr. K. C. Patra (CoE)', notes: 'Final sign-off, encrypted and transferred to vault' },
    ],
    maxMarks: 80,
    duration: '3 Hours',
    bloomTaxonomy: { remember: 20, understand: 25, apply: 30, analyze: 15, evaluate: 10 }
  },
  {
    id: 'QP-2026-CS502',
    code: 'CS502',
    subject: 'Operating Systems',
    course: 'B.Tech CSE / ECE',
    semester: 'Semester 5',
    examCycle: 'Autumn End-Semester 2026',
    paperSetter: 'Dr. Priya Ranjan (Internal - Associate Prof)',
    moderator: 'Dr. B. K. Mishra (External - OUTR)',
    setsAvailable: ['Set A (Master)', 'Set B (Reserve)'],
    selectedSet: 'Set A (Master)',
    securityStatus: 'Encrypted & Cryptographically Sealed',
    vaultRef: 'VAULT-SEC-2026-082',
    encryptionAlgorithm: 'AES-256 GCM (Dual Keycard Auth)',
    submissionDate: '18 Sep 2026',
    scrutinyDate: '24 Sep 2026',
    coEApprovalDate: '30 Sep 2026',
    status: 'Approved & Sealed in Strongroom',
    versionHistory: [
      { version: 'v1.0', date: '18 Sep 2026', author: 'Internal Setter', notes: 'Sets A and B submitted with answer blueprints' },
      { version: 'v2.0-Final', date: '30 Sep 2026', author: 'Dr. K. C. Patra (CoE)', notes: 'Sealed in confidential server' }
    ],
    maxMarks: 80,
    duration: '3 Hours',
    bloomTaxonomy: { remember: 15, understand: 30, apply: 30, analyze: 15, evaluate: 10 }
  },
  {
    id: 'QP-2026-CS503',
    code: 'CS503',
    subject: 'Database Management Systems',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    examCycle: 'Autumn End-Semester 2026',
    paperSetter: 'Dr. R. K. Das (External - NIT Rourkela)',
    moderator: 'Prof. Debashis Jena',
    setsAvailable: ['Set A', 'Set B', 'Set C'],
    selectedSet: 'Pending Random Selection',
    securityStatus: 'Under Scrutiny Committee Review',
    vaultRef: 'VAULT-STAGE-449',
    encryptionAlgorithm: 'AES-256 GCM',
    submissionDate: '28 Sep 2026',
    scrutinyDate: 'Pending',
    coEApprovalDate: 'Pending',
    status: 'Scrutiny In Progress',
    versionHistory: [
      { version: 'v1.0', date: '28 Sep 2026', author: 'External Setter', notes: 'Submitted via confidential portal' }
    ],
    maxMarks: 80,
    duration: '3 Hours',
    bloomTaxonomy: { remember: 20, understand: 20, apply: 35, analyze: 15, evaluate: 10 }
  },
  {
    id: 'QP-2026-CS504',
    code: 'CS504',
    subject: 'Artificial Intelligence',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    examCycle: 'Autumn End-Semester 2026',
    paperSetter: 'Prof. Amit Mishra',
    moderator: 'Dr. Priya Ranjan',
    setsAvailable: ['Set A', 'Set B'],
    selectedSet: 'Pending Random Selection',
    securityStatus: 'Draft Submitted',
    vaultRef: 'VAULT-DRAFT-109',
    encryptionAlgorithm: 'Standard SSL',
    submissionDate: '02 Oct 2026',
    scrutinyDate: 'Pending',
    coEApprovalDate: 'Pending',
    status: 'Awaiting Scrutiny',
    versionHistory: [
      { version: 'v1.0', date: '02 Oct 2026', author: 'Faculty Setter', notes: 'Initial submission' }
    ],
    maxMarks: 80,
    duration: '3 Hours',
    bloomTaxonomy: { remember: 20, understand: 25, apply: 25, analyze: 20, evaluate: 10 }
  }
];

// Seed Examination Centres (Workflow D & Capability 6)
export const initialCentres = [
  {
    id: 'CTR-01',
    name: 'Academic Block B Examination Centre',
    location: 'Main Campus · Floors 2 & 3',
    roomsCount: 8,
    totalCapacity: 480,
    allocatedDesks: 424,
    chiefSuperintendent: 'Dr. Priya Ranjan (Assoc. Prof)',
    contactNumber: '+91 94371 22891',
    cctvOperational: true,
    jammersActive: true,
    rooms: [
      { hall: 'B-301', capacity: 60, allocated: 58, rows: 6, cols: 10, supervisor: 'Prof. N. K. Sahoo' },
      { hall: 'B-302', capacity: 60, allocated: 60, rows: 6, cols: 10, supervisor: 'Prof. Ananya Ray' },
      { hall: 'B-303', capacity: 60, allocated: 56, rows: 6, cols: 10, supervisor: 'Prof. B. C. Panda' },
      { hall: 'B-304', capacity: 60, allocated: 54, rows: 6, cols: 10, supervisor: 'Prof. J. K. Mahapatra' },
    ]
  },
  {
    id: 'CTR-02',
    name: 'Central University Auditorium',
    location: 'Ground & Mezzanine Floors',
    roomsCount: 2,
    totalCapacity: 240,
    allocatedDesks: 220,
    chiefSuperintendent: 'Dr. Sneha Ray (Senior Professor)',
    contactNumber: '+91 94370 88124',
    cctvOperational: true,
    jammersActive: true,
    rooms: [
      { hall: 'Auditorium Hall 1', capacity: 120, allocated: 116, rows: 12, cols: 10, supervisor: 'Dr. M. K. Sethi' },
      { hall: 'Auditorium Hall 2', capacity: 120, allocated: 104, rows: 12, cols: 10, supervisor: 'Dr. P. K. Swain' },
    ]
  },
  {
    id: 'CTR-03',
    name: 'Technology Block C Centre',
    location: 'Tech Complex · 1st Floor',
    roomsCount: 4,
    totalCapacity: 200,
    allocatedDesks: 184,
    chiefSuperintendent: 'Dr. S. K. Nayak (Professor & Head)',
    contactNumber: '+91 94372 19830',
    cctvOperational: true,
    jammersActive: false,
    rooms: [
      { hall: 'C-101', capacity: 50, allocated: 48, rows: 5, cols: 10, supervisor: 'Prof. T. K. Dash' },
      { hall: 'C-102', capacity: 50, allocated: 46, rows: 5, cols: 10, supervisor: 'Prof. P. R. Mohanty' },
    ]
  }
];

// Seed Invigilation Squad (Workflow D & Capability 7)
export const initialInvigilationRoster = [
  {
    id: 'INV-01',
    facultyName: 'Dr. Priya Ranjan',
    employeeId: 'EMP-FAC-014',
    department: 'CSE',
    designation: 'Associate Professor',
    assignedHall: 'Exam Hall B-301',
    date: '2026-11-10',
    session: 'Morning (10:00 AM - 01:00 PM)',
    paperCode: 'CS501',
    role: 'Chief Room Superintendent',
    status: 'Confirmed', // Confirmed, Pending Acceptance, Replacement Requested, Clash Detected
    conflictDetected: false,
    conflictReason: null,
  },
  {
    id: 'INV-02',
    facultyName: 'Prof. Amit Mishra',
    employeeId: 'EMP-FAC-028',
    department: 'CSE',
    designation: 'Assistant Professor',
    assignedHall: 'Exam Hall B-302',
    date: '2026-11-10',
    session: 'Morning (10:00 AM - 01:00 PM)',
    paperCode: 'CS501',
    role: 'Invigilator',
    status: 'Confirmed',
    conflictDetected: false,
    conflictReason: null,
  },
  {
    id: 'INV-03',
    facultyName: 'Prof. Debashis Jena',
    employeeId: 'EMP-FAC-035',
    department: 'CSE',
    designation: 'Assistant Professor',
    assignedHall: 'Exam Hall B-303',
    date: '2026-11-10',
    session: 'Morning (10:00 AM - 01:00 PM)',
    paperCode: 'CS501',
    role: 'Invigilator',
    status: 'Confirmed',
    conflictDetected: false,
    conflictReason: null,
  },
  {
    id: 'INV-04',
    facultyName: 'Dr. Sneha Ray',
    employeeId: 'EMP-FAC-008',
    department: 'ECE',
    designation: 'Professor',
    assignedHall: 'Central Aud. Floor 1',
    date: '2026-11-10',
    session: 'Morning (10:00 AM - 01:00 PM)',
    paperCode: 'CS501',
    role: 'Chief Superintendent',
    status: 'Confirmed',
    conflictDetected: false,
    conflictReason: null,
  },
  {
    id: 'INV-05',
    facultyName: 'Prof. Soumya Ranjan Panda',
    employeeId: 'EMP-FAC-049',
    department: 'CSE',
    designation: 'Assistant Professor',
    assignedHall: 'Exam Hall B-301',
    date: '2026-11-13',
    session: 'Morning (10:00 AM - 01:00 PM)',
    paperCode: 'CS502',
    role: 'Invigilator',
    status: 'Pending Acceptance',
    conflictDetected: false,
    conflictReason: null,
  },
  {
    id: 'INV-06',
    facultyName: 'Prof. Lipsa Mohapatra',
    employeeId: 'EMP-FAC-055',
    department: 'CSE',
    designation: 'Assistant Professor',
    assignedHall: 'Exam Hall B-302',
    date: '2026-11-13',
    session: 'Morning (10:00 AM - 01:00 PM)',
    paperCode: 'CS502',
    role: 'Invigilator',
    status: 'Clash Detected',
    conflictDetected: true,
    conflictReason: 'Double booked on 13 Nov Morning in Lab C-201 and Hall B-302.',
  },
  {
    id: 'INV-07',
    facultyName: 'Dr. Manoj Kumar Sethi',
    employeeId: 'EMP-FAC-019',
    department: 'Basic Sciences',
    designation: 'Associate Professor',
    assignedHall: 'Flying Squad Patrol 1',
    date: '2026-11-10',
    session: 'Full Day Vigilance',
    paperCode: 'All Sessions',
    role: 'Flying Squad Convener',
    status: 'Confirmed',
    conflictDetected: false,
    conflictReason: null,
  }
];

// Seed Answer Booklets & Tracking (Workflow E)
export const initialBooklets = [
  {
    id: 'BKT-CS501-001',
    barcode: 'BC990218101',
    bundleNo: 'BUN-CS501-A1',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    examDate: '2026-11-10',
    session: 'Morning',
    totalScripts: 30,
    scriptsRange: '2305201001 to 2305201030',
    currentLocation: 'Digital Evaluation Scanning Vault',
    custodyHolder: 'Mr. A. K. Behera (Scanning Supervisor)',
    evaluatorAssigned: 'Dr. S. K. Pradhan (External Evaluator - OUTR)',
    dispatchDate: '11 Nov 2026',
    expectedReturnDate: '18 Nov 2026',
    evaluationStatus: 'In Evaluation', // In Strongroom, Dispatched, In Evaluation, Evaluated, Scrutinized, Archived
    verificationStatus: 'Under Scrutiny',
    scannedDocRef: 'SCAN-CS501-B1.pdf (High-Res 300DPI)',
    movementHistory: [
      { timestamp: '10 Nov 2026, 01:15 PM', from: 'Exam Hall B-301', to: 'CoE Confidential Room', handler: 'Dr. Priya Ranjan', note: 'Sealed bundle collected from chief invigilator' },
      { timestamp: '10 Nov 2026, 03:00 PM', from: 'CoE Confidential Room', to: 'Barcode & Scanning Desk', handler: 'Examination Officer', note: 'Physical barcode stickers affixed and counted (30/30)' },
      { timestamp: '11 Nov 2026, 10:30 AM', from: 'Barcode Desk', to: 'Digital Evaluation System', handler: 'Mr. A. K. Behera', note: 'Booklets scanned and encrypted for blind digital evaluation' },
    ]
  },
  {
    id: 'BKT-CS501-002',
    barcode: 'BC990218102',
    bundleNo: 'BUN-CS501-A2',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    examDate: '2026-11-10',
    session: 'Morning',
    totalScripts: 30,
    scriptsRange: '2305201031 to 2305201060',
    currentLocation: 'External Evaluation Centre',
    custodyHolder: 'Dr. R. K. Das (NIT Rourkela)',
    evaluatorAssigned: 'Dr. R. K. Das',
    dispatchDate: '11 Nov 2026',
    expectedReturnDate: '18 Nov 2026',
    evaluationStatus: 'Evaluated',
    verificationStatus: 'Verified & Moderated',
    scannedDocRef: 'SCAN-CS501-B2.pdf',
    movementHistory: [
      { timestamp: '10 Nov 2026, 01:18 PM', from: 'Exam Hall B-302', to: 'CoE Confidential Room', handler: 'Prof. Amit Mishra', note: 'Count 30 scripts received intact' },
      { timestamp: '11 Nov 2026, 11:00 AM', from: 'CoE Room', to: 'Insured Courier Service', handler: 'CoE Dispatch Desk', note: 'Speed Post Waybill #EW992818919IN' },
      { timestamp: '14 Nov 2026, 04:20 PM', from: 'External Evaluator', to: 'CoE Portal', handler: 'Dr. R. K. Das', note: 'Marks uploaded and digitally signed' }
    ]
  },
  {
    id: 'BKT-CS502-001',
    barcode: 'BC990218201',
    bundleNo: 'BUN-CS502-A1',
    subjectCode: 'CS502',
    subjectName: 'Operating Systems',
    examDate: '2026-11-13',
    session: 'Morning',
    totalScripts: 30,
    scriptsRange: '2305201001 to 2305201030',
    currentLocation: 'CoE Central Strongroom Vault',
    custodyHolder: 'Dr. K. C. Patra (CoE)',
    evaluatorAssigned: 'Pending Assignment',
    dispatchDate: null,
    expectedReturnDate: null,
    evaluationStatus: 'In Strongroom',
    verificationStatus: 'Pending Scanning',
    scannedDocRef: 'Pending Digitization',
    movementHistory: [
      { timestamp: '13 Nov 2026, 01:25 PM', from: 'Exam Hall B-301', to: 'CoE Strongroom', handler: 'Invigilator Squad', note: 'Received directly from session superintendent' }
    ]
  }
];

// Seed Practical & Viva Examinations (Workflow F)
export const initialPracticalExams = [
  {
    id: 'PRAC-CS591',
    code: 'CS591',
    subject: 'Data Structures & Algorithms Laboratory',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    date: '2026-10-28',
    labRoom: 'Software Lab 3 (Advanced Computing Wing)',
    internalExaminer: 'Prof. Amit Mishra (Internal)',
    externalExaminer: 'Dr. B. K. Sarangi (External - Silicon University)',
    batch: 'Batch A (Roll 01 - 30)',
    maxPractical: 30,
    maxViva: 20,
    maxTotal: 50,
    status: 'Completed & Certified',
    students: [
      { rollNumber: '01', regNo: '2305201001', name: 'Rakesh Das', practical: 28, viva: 19, total: 47, attendance: 'Present', remarks: 'Flawless BST & AVL rotation code implementation' },
      { rollNumber: '02', regNo: '2305201002', name: 'Amit Nayak', practical: 26, viva: 17, total: 43, attendance: 'Present', remarks: 'Good graph BFS/DFS traversal' },
      { rollNumber: '03', regNo: '2305201003', name: 'Raj Sahoo', practical: 24, viva: 16, total: 40, attendance: 'Present', remarks: 'Solved hashing problem' },
      { rollNumber: '04', regNo: '2305201004', name: 'Priya Patra', practical: 30, viva: 20, total: 50, attendance: 'Present', remarks: 'Outstanding performance in all viva segments' },
      { rollNumber: '05', regNo: '2305201005', name: 'Sourav Mohanty', practical: 18, viva: 12, total: 30, attendance: 'Present', remarks: 'Basic dynamic programming logic gaps' },
    ]
  },
  {
    id: 'PRAC-CS592',
    code: 'CS592',
    subject: 'Operating Systems Laboratory',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    date: '2026-10-30',
    labRoom: 'Systems Lab 1 (Tech Block)',
    internalExaminer: 'Prof. Debashis Jena',
    externalExaminer: 'Dr. S. R. Pattnaik (External - BPUT)',
    batch: 'Batch A (Roll 01 - 30)',
    maxPractical: 30,
    maxViva: 20,
    maxTotal: 50,
    status: 'Marks Submission In Progress',
    students: [
      { rollNumber: '01', regNo: '2305201001', name: 'Rakesh Das', practical: 27, viva: 18, total: 45, attendance: 'Present', remarks: 'Fork process synchronization logic correct' },
      { rollNumber: '02', regNo: '2305201002', name: 'Amit Nayak', practical: 25, viva: 16, total: 41, attendance: 'Present', remarks: 'Semaphore implementation demonstrated' },
      { rollNumber: '03', regNo: '2305201003', name: 'Raj Sahoo', practical: 24, viva: 15, total: 39, attendance: 'Present', remarks: 'Page replacement algorithms working' },
      { rollNumber: '04', regNo: '2305201004', name: 'Priya Patra', practical: 29, viva: 19, total: 48, attendance: 'Present', remarks: 'Shell scripting and kernel modules' },
      { rollNumber: '05', regNo: '2305201005', name: 'Sourav Mohanty', practical: 0, viva: 0, total: 0, attendance: 'Absent', remarks: 'Absent for practical evaluation' },
    ]
  }
];

// Seed Certificates & Degree Requests (Workflow J)
export const initialCertificates = [
  {
    id: 'CERT-REQ-2026-081',
    studentName: 'Bikash Mohanty',
    rollNumber: '2005201014',
    regNo: '2005201014',
    course: 'B.Tech (CSE)',
    passingYear: 2024,
    requestType: 'Provisional Degree Certificate',
    cgpa: 8.45,
    requiredDocuments: { noDues: true, feeReceipt: true, idProof: true },
    feePaid: '₹1,000 (Verified)',
    requestDate: '26 Sep 2026',
    status: 'Ready for Collection', // Under Verification, Approved, Printing, Ready for Collection, Dispatched, Rejected
    issueMode: 'Counter Pickup',
    trackingNumber: null,
    approvedBy: 'Dr. K. C. Patra (CoE)',
    certificateNo: 'PDC-2026-AUT-0142',
  },
  {
    id: 'CERT-REQ-2026-082',
    studentName: 'Sasmita Sahoo',
    rollNumber: '2105201032',
    regNo: '2105201032',
    course: 'B.Tech (ECE)',
    passingYear: 2025,
    requestType: 'Official Academic Transcript (WES Format)',
    cgpa: 8.89,
    requiredDocuments: { noDues: true, feeReceipt: true, idProof: true },
    feePaid: '₹2,500 (Verified)',
    requestDate: '28 Sep 2026',
    status: 'Dispatched via Speed Post',
    issueMode: 'Registered Speed Post',
    trackingNumber: 'EW883918293IN',
    approvedBy: 'Dr. K. C. Patra (CoE)',
    certificateNo: 'TRN-2026-WES-0091',
  },
  {
    id: 'CERT-REQ-2026-083',
    studentName: 'Abinash Dash',
    rollNumber: '2205201008',
    regNo: '2205201008',
    course: 'B.Tech (Civil)',
    passingYear: 2026,
    requestType: 'Duplicate Grade Card (Semester 3)',
    cgpa: 7.62,
    requiredDocuments: { noDues: true, feeReceipt: true, idProof: false },
    feePaid: '₹500 (Verified)',
    requestDate: '01 Oct 2026',
    status: 'Under Verification',
    issueMode: 'Counter Pickup',
    trackingNumber: null,
    approvedBy: 'Pending Verification',
    certificateNo: null,
  },
  {
    id: 'CERT-REQ-2026-084',
    studentName: 'Priyabrata Jena',
    rollNumber: '1905201019',
    regNo: '1905201019',
    course: 'B.Tech (Mechanical)',
    passingYear: 2023,
    requestType: 'Migration Certificate',
    cgpa: 7.91,
    requiredDocuments: { noDues: true, feeReceipt: true, idProof: true },
    feePaid: '₹800 (Verified)',
    requestDate: '03 Oct 2026',
    status: 'Approved & In Printing',
    issueMode: 'Counter Pickup',
    trackingNumber: null,
    approvedBy: 'Dr. K. C. Patra (CoE)',
    certificateNo: 'MIG-2026-0045',
  }
];

// Seed Malpractice & Grievances (Workflow K)
export const initialMalpracticeCases = [
  {
    id: 'UFM-2026-01',
    caseNo: 'GIFT/COE/UFM/2026/01',
    rollNumber: '18',
    regNo: '2305201018',
    studentName: 'Bibek Samal',
    course: 'B.Tech CSE · Sem 5',
    paperCode: 'CS503',
    paperName: 'Database Management Systems',
    examDate: '17 Oct 2026',
    hall: 'Exam Hall B-302',
    detectingOfficer: 'Prof. Amit Mishra (Chief Invigilator) & Flying Squad',
    offenseType: 'Possession of Digital Watch with Internet Connectivity',
    confiscatedMaterial: 'Smartwatch containing photo notes of SQL normalization',
    studentStatement: 'Admitted possession during hall interrogation',
    committeeHearingDate: '24 Oct 2026',
    verdict: 'Paper Cancelled & Debarred from CS503 for Current Cycle',
    penaltyLevel: 'Category B Penalty (Paper Cancellation)',
    status: 'Verdict Finalized',
    isRestricted: true, // Restricted to CoE & Principal
  },
  {
    id: 'UFM-2026-02',
    caseNo: 'GIFT/COE/UFM/2026/02',
    rollNumber: '31',
    regNo: '2305201031',
    studentName: 'Prateek Tripathy',
    course: 'B.Tech CSE · Sem 5',
    paperCode: 'CS501',
    paperName: 'Data Structures & Algorithms',
    examDate: '10 Oct 2026',
    hall: 'Exam Hall B-301',
    detectingOfficer: 'Dr. Manoj Kumar Sethi (Flying Squad Convener)',
    offenseType: 'Possession of Unauthorized Handwritten Paper Slips',
    confiscatedMaterial: 'Micro-slips with AVL Tree rotation formulas',
    studentStatement: 'Claimed notes were brought inadvertently inside geometry box',
    committeeHearingDate: '24 Oct 2026',
    verdict: 'Committee Hearing Scheduled',
    penaltyLevel: 'Pending Committee Recommendation',
    status: 'Under Investigation',
    isRestricted: true,
  }
];

export const initialGrievances = [
  {
    id: 'GRV-2026-01',
    ticketNo: 'GIFT/EXAM/GRV/2026/41',
    rollNumber: '05',
    regNo: '2305201005',
    studentName: 'Sourav Mohanty',
    category: 'Marks Discrepancy',
    subjectCode: 'CS502',
    description: 'Internal assessment assignment marks recorded as 10/20 in portal, whereas faculty returned 16/20 in verified test copy.',
    dateSubmitted: '02 Oct 2026',
    priority: 'High',
    status: 'Under Investigation',
    assignedOfficer: 'Prof. Debashis Jena (Department Coordinator)',
    resolutionNotes: 'Subject teacher summoned to reconcile attendance register mark sheet.',
  },
  {
    id: 'GRV-2026-02',
    ticketNo: 'GIFT/EXAM/GRV/2026/42',
    rollNumber: '08',
    regNo: '2305201008',
    studentName: 'Ananya Mishra',
    category: 'Admit Card Hall Correction',
    subjectCode: 'General',
    description: 'Mother name misspelled on downloaded Hall Ticket as "Sunita" instead of "Suneeta Mishra".',
    dateSubmitted: '03 Oct 2026',
    priority: 'Normal',
    status: 'Resolved & Closed',
    assignedOfficer: 'Exam Cell Office',
    resolutionNotes: 'Verified with Class X CBSE Certificate. Typo amended in master registry and fresh admit card re-generated.',
  }
];

// Seed Examiners & Evaluators Directory (Workflow L)
export const initialExaminers = [
  {
    id: 'EXM-001',
    name: 'Dr. Priya Ranjan',
    type: 'Internal',
    institution: 'Apna Campus (Autonomous)',
    designation: 'Associate Professor',
    department: 'CSE',
    specialization: 'Distributed Systems & Cloud Computing',
    experienceYears: 14,
    phone: '+91 94371 22891',
    email: 'priyaranjan@apnacampus.edu.in',
    assignedBooklets: 60,
    evaluatedBooklets: 60,
    pendingBooklets: 0,
    turnaroundDays: 4,
    remunerationRate: 35, // INR per answer script
    totalRemuneration: 2100,
    paymentStatus: 'Processed & Cleared',
  },
  {
    id: 'EXM-002',
    name: 'Dr. S. K. Pradhan',
    type: 'External',
    institution: 'Odisha University of Technology & Research (OUTR), Bhubaneswar',
    designation: 'Professor',
    department: 'Information Technology',
    specialization: 'Algorithms & Computational Geometry',
    experienceYears: 22,
    phone: '+91 94370 44102',
    email: 'skpradhan@outr.ac.in',
    assignedBooklets: 90,
    evaluatedBooklets: 60,
    pendingBooklets: 30,
    turnaroundDays: 6,
    remunerationRate: 40,
    totalRemuneration: 3600,
    paymentStatus: 'Pending Final Evaluation Sign-off',
  },
  {
    id: 'EXM-003',
    name: 'Dr. Debabrata Jena',
    type: 'External',
    institution: 'Veer Surendra Sai University of Technology (VSSUT), Burla',
    designation: 'Associate Professor',
    department: 'Computer Science',
    specialization: 'Database Systems & Big Data Mining',
    experienceYears: 16,
    phone: '+91 98610 88921',
    email: 'djena@vssut.ac.in',
    assignedBooklets: 60,
    evaluatedBooklets: 60,
    pendingBooklets: 0,
    turnaroundDays: 5,
    remunerationRate: 40,
    totalRemuneration: 2400,
    paymentStatus: 'Processed & Cleared',
  },
  {
    id: 'EXM-004',
    name: 'Dr. R. K. Das',
    type: 'External',
    institution: 'National Institute of Technology (NIT), Rourkela',
    designation: 'Associate Professor',
    department: 'Computer Engineering',
    specialization: 'Operating Systems & Security Protocols',
    experienceYears: 18,
    phone: '+91 94378 11902',
    email: 'rkdas@nitrkl.ac.in',
    assignedBooklets: 60,
    evaluatedBooklets: 45,
    pendingBooklets: 15,
    turnaroundDays: 5,
    remunerationRate: 40,
    totalRemuneration: 2400,
    paymentStatus: 'Under Evaluation',
  }
];

// Seed Examination Settings & Policies (Workflow M)
export const initialSettings = {
  gradingScale: [
    { grade: 'O', description: 'Outstanding', minMarks: 90, maxMarks: 100, points: 10 },
    { grade: 'A+', description: 'Excellent', minMarks: 80, maxMarks: 89, points: 9 },
    { grade: 'A', description: 'Very Good', minMarks: 70, maxMarks: 79, points: 8 },
    { grade: 'B+', description: 'Good', minMarks: 60, maxMarks: 69, points: 7 },
    { grade: 'B', description: 'Above Average', minMarks: 50, maxMarks: 59, points: 6 },
    { grade: 'C', description: 'Average', minMarks: 45, maxMarks: 49, points: 5 },
    { grade: 'P', description: 'Pass', minMarks: 40, maxMarks: 44, points: 4 },
    { grade: 'F', description: 'Fail (Backlog)', minMarks: 0, maxMarks: 39, points: 0 },
  ],
  passingCriteria: {
    minInternalPercentage: 40, // 8 out of 20
    minExternalPercentage: 35, // 28 out of 80
    minAggregatePercentage: 40, // 40 out of 100
    condonationAttendanceFloor: 65, // Below 65% is strictly un-condonable
    mandatoryRegularAttendance: 75,
    graceMarksCap: 2, // Maximum grace marks awarded by Academic Council
    maxGraceSubjects: 1,
  },
  deadlines: {
    regularExamFormLastDate: '2026-10-15',
    lateFeeFineAmount: 500,
    lateFeeFormLastDate: '2026-10-22',
    superLateFineAmount: 1500,
    superLateFormLastDate: '2026-10-26',
    hallTicketDownloadOpens: '2026-10-28',
    reEvaluationWindowDays: 14,
  },
  policies: [
    { title: 'Answer Booklet Retention Period', value: '3 Years in CoE High-Security Records Vault' },
    { title: 'Blind Evaluation Anonymization', value: 'Mandatory Double-Foil Barcode Concealment' },
    { title: 'Flying Squad Authority', value: 'Unrestricted entry, search, and body frisking by authorized personnel' },
    { title: 'Grace Marks Delegation', value: 'CoE Moderation Council sole authority to award up to 2 marks' },
  ]
};

// Seed Academic Calendar Milestones (Capability 18)
export const initialCalendar = [
  { event: 'Autumn End-Sem Examination Notification Released', date: '20 Sep 2026', type: 'Notification', status: 'Completed' },
  { event: 'Regular Examination Form Fill-up Commences', date: '24 Sep 2026', type: 'Registration', status: 'Completed' },
  { event: 'Continuous Internal Evaluation (CIE) Moderation Lock', date: '12 Oct 2026', type: 'Moderation', status: 'In Progress' },
  { event: 'Autonomous Hall Ticket Release on Portal', date: '28 Oct 2026', type: 'Hall Ticket', status: 'Upcoming' },
  { event: 'End-Semester Theory Examinations Begin', date: '10 Nov 2026', type: 'Examination', status: 'Upcoming' },
  { event: 'End-Semester Theory Examinations Conclude', date: '28 Nov 2026', type: 'Examination', status: 'Upcoming' },
  { event: 'Digital Answer Script Evaluation Window', date: '15 Nov - 05 Dec 2026', type: 'Evaluation', status: 'Upcoming' },
  { event: 'Official Result Publication & Gazette Release', date: '18 Dec 2026', type: 'Results', status: 'Upcoming' },
];

class ExaminationStore {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      registrations: initialRegistrations,
      debarments: initialDebarments,
      questionPapers: initialQuestionPapers,
      centres: initialCentres,
      invigilationRoster: initialInvigilationRoster,
      booklets: initialBooklets,
      practicalExams: initialPracticalExams,
      certificates: initialCertificates,
      malpracticeCases: initialMalpracticeCases,
      grievances: initialGrievances,
      examiners: initialExaminers,
      settings: initialSettings,
      calendar: initialCalendar,
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new Event('examination_store_updated'));
    } catch {
      // ignore
    }
  }

  // --- Registrations ---
  getRegistrations() {
    return this.state.registrations || initialRegistrations;
  }

  updateRegistrationStatus(id, newStatus, remarks = '') {
    const reg = (this.state.registrations || []).find(r => r.id === id);
    if (reg) {
      reg.status = newStatus;
      if (remarks) reg.remarks = remarks;
      if (newStatus === 'Approved') {
        reg.approvedBy = 'Dr. K. C. Patra (CoE)';
        reg.approvalDate = new Date().toLocaleDateString('en-GB');
      }
      this.save();
    }
    return reg;
  }

  addRegistration(data) {
    const newReg = {
      id: `REG-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...data,
      applicationDate: new Date().toLocaleDateString('en-GB'),
      status: 'Pending Verification',
    };
    this.state.registrations = [newReg, ...(this.state.registrations || [])];
    this.save();
    return newReg;
  }

  // --- Debarments ---
  getDebarments() {
    return this.state.debarments || initialDebarments;
  }

  addDebarment(record) {
    const newRecord = {
      id: `DEBAR-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...record,
      orderDate: new Date().toLocaleDateString('en-GB'),
      status: 'Active Debarment',
      authorizedOfficer: 'Dr. K. C. Patra (Controller of Examinations)',
    };
    this.state.debarments = [newRecord, ...(this.state.debarments || [])];
    this.save();
    return newRecord;
  }

  revokeDebarment(id, reason) {
    const item = (this.state.debarments || []).find(d => d.id === id);
    if (item) {
      item.status = 'Condoned & Restored';
      item.appealStatus = `Restored: ${reason}`;
      this.save();
    }
    return item;
  }

  // --- Question Papers ---
  getQuestionPapers() {
    return this.state.questionPapers || initialQuestionPapers;
  }

  addQuestionPaper(paperData) {
    const newPaper = {
      id: `QP-2026-${paperData.code || 'UNKNOWN'}`,
      ...paperData,
      submissionDate: new Date().toLocaleDateString('en-GB'),
      status: 'Awaiting Scrutiny',
      versionHistory: [
        { version: 'v1.0', date: new Date().toLocaleDateString('en-GB'), author: 'Faculty Setter', notes: 'Initial set submitted' }
      ]
    };
    this.state.questionPapers = [newPaper, ...(this.state.questionPapers || [])];
    this.save();
    return newPaper;
  }

  approveQuestionPaper(id) {
    const paper = (this.state.questionPapers || []).find(p => p.id === id);
    if (paper) {
      paper.status = 'Approved & Sealed in Strongroom';
      paper.coEApprovalDate = new Date().toLocaleDateString('en-GB');
      paper.securityStatus = 'Encrypted & Cryptographically Sealed';
      paper.versionHistory.push({
        version: `v${paper.versionHistory.length + 1}.0-Vault`,
        date: new Date().toLocaleDateString('en-GB'),
        author: 'Dr. K. C. Patra (CoE)',
        notes: 'CoE Digital Key Authorization signed. Vault custody activated.'
      });
      this.save();
    }
    return paper;
  }

  // --- Centres ---
  getCentres() {
    return this.state.centres || initialCentres;
  }

  // --- Invigilation ---
  getInvigilationRoster() {
    return this.state.invigilationRoster || initialInvigilationRoster;
  }

  addInvigilatorDuty(duty) {
    const newDuty = {
      id: `INV-${Math.floor(10 + Math.random() * 90)}`,
      ...duty,
      status: 'Confirmed',
      conflictDetected: false,
    };
    this.state.invigilationRoster = [...(this.state.invigilationRoster || []), newDuty];
    this.save();
    return newDuty;
  }

  // --- Booklets ---
  getBooklets() {
    return this.state.booklets || initialBooklets;
  }

  updateBookletStatus(id, newStatus, location, handler, note) {
    const bkt = (this.state.booklets || []).find(b => b.id === id);
    if (bkt) {
      bkt.evaluationStatus = newStatus;
      if (location) bkt.currentLocation = location;
      if (handler) bkt.custodyHolder = handler;
      bkt.movementHistory.push({
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        from: bkt.currentLocation,
        to: location || bkt.currentLocation,
        handler: handler || 'CoE Officer',
        note: note || `Status updated to ${newStatus}`
      });
      this.save();
    }
    return bkt;
  }

  // --- Practical / Viva ---
  getPracticalExams() {
    return this.state.practicalExams || initialPracticalExams;
  }

  updatePracticalMarks(examId, rollNumber, practicalMarks, vivaMarks, remarks) {
    const exam = (this.state.practicalExams || []).find(e => e.id === examId);
    if (exam) {
      const student = exam.students.find(s => s.rollNumber === rollNumber);
      if (student) {
        student.practical = Number(practicalMarks);
        student.viva = Number(vivaMarks);
        student.total = student.practical + student.viva;
        if (remarks) student.remarks = remarks;
        this.save();
      }
    }
    return exam;
  }

  // --- Certificates ---
  getCertificates() {
    return this.state.certificates || initialCertificates;
  }

  updateCertificateStatus(id, newStatus, certNo = null, trackingNo = null) {
    const cert = (this.state.certificates || []).find(c => c.id === id);
    if (cert) {
      cert.status = newStatus;
      if (certNo) cert.certificateNo = certNo;
      if (trackingNo) cert.trackingNumber = trackingNo;
      if (newStatus === 'Ready for Collection' || newStatus === 'Dispatched via Speed Post') {
        cert.approvedBy = 'Dr. K. C. Patra (CoE)';
      }
      this.save();
    }
    return cert;
  }

  // --- Malpractice & Grievances ---
  getMalpracticeCases() {
    return this.state.malpracticeCases || initialMalpracticeCases;
  }

  updateMalpracticeVerdict(id, verdict, penaltyLevel) {
    const item = (this.state.malpracticeCases || []).find(m => m.id === id);
    if (item) {
      item.verdict = verdict;
      item.penaltyLevel = penaltyLevel;
      item.status = 'Verdict Finalized';
      this.save();
    }
    return item;
  }

  getGrievances() {
    return this.state.grievances || initialGrievances;
  }

  resolveGrievance(id, resolutionNotes) {
    const item = (this.state.grievances || []).find(g => g.id === id);
    if (item) {
      item.status = 'Resolved & Closed';
      item.resolutionNotes = resolutionNotes;
      this.save();
    }
    return item;
  }

  // --- Examiners ---
  getExaminers() {
    return this.state.examiners || initialExaminers;
  }

  // --- Settings ---
  getSettings() {
    return this.state.settings || initialSettings;
  }

  updateSettings(partial) {
    this.state.settings = { ...(this.state.settings || initialSettings), ...partial };
    this.save();
    return this.state.settings;
  }

  // --- Calendar ---
  getCalendar() {
    return this.state.calendar || initialCalendar;
  }
}

export const examinationStore = new ExaminationStore();
