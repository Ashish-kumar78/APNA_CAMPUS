// Central Data Store for College Management System
// Shared across Admin, HOD, Faculty, Student, and Executive portals
// Reflects: ONE COLLEGE -> MULTIPLE DEPARTMENTS -> MULTIPLE PROGRAMS -> BATCHES -> SECTIONS -> SUBJECTS -> FACULTY

export const initialPrograms = [
  {
    id: 'prog-btech',
    code: 'B.Tech',
    name: 'Bachelor of Technology',
    type: 'Undergraduate (UG)',
    degree: 'B.Tech',
    departmentCode: 'CSE',
    durationYears: 4,
    semestersCount: 8,
    intakeCapacity: 480,
    eligibility: '10+2 with Physics, Mathematics & Chem/CS (Min 50%) + JEE Main / OJEE',
    academicRegulation: 'AR-2023 (Autonomous Outcome-Based Curriculum)',
    status: 'Active',
    branches: ['CSE', 'AI&ML', 'ECE', 'EEE', 'MECH', 'CIVIL']
  },
  {
    id: 'prog-bca',
    code: 'BCA',
    name: 'Bachelor of Computer Applications',
    type: 'Undergraduate (UG)',
    degree: 'BCA',
    departmentCode: 'CA',
    durationYears: 3,
    semestersCount: 6,
    intakeCapacity: 120,
    eligibility: '10+2 in any stream with Mathematics or Computer Applications (Min 45%)',
    academicRegulation: 'AR-2024 (Industry-Aligned Computing Framework)',
    status: 'Active',
    branches: ['Computer Applications', 'Cloud & Mobile Tech']
  },
  {
    id: 'prog-mca',
    code: 'MCA',
    name: 'Master of Computer Applications',
    type: 'Postgraduate (PG)',
    degree: 'MCA',
    departmentCode: 'CA',
    durationYears: 2,
    semestersCount: 4,
    intakeCapacity: 120,
    eligibility: 'BCA / B.Sc / B.Com with Mathematics at 10+2 or Graduation level (OJEE / NIMCET)',
    academicRegulation: 'AR-2024 (AICTE Autonomous PG Guidelines)',
    status: 'Active',
    branches: ['Software Architecture', 'Data Science & Analytics']
  },
  {
    id: 'prog-mba',
    code: 'MBA',
    name: 'Master of Business Administration',
    type: 'Postgraduate (PG)',
    degree: 'MBA',
    departmentCode: 'MGMT',
    durationYears: 2,
    semestersCount: 4,
    intakeCapacity: 180,
    eligibility: 'Graduation in any discipline (Min 50%) + CAT / MAT / XAT / OJEE',
    academicRegulation: 'AR-2024 (Executive Management & Analytics)',
    status: 'Active',
    branches: ['Finance', 'Marketing', 'HR & Analytics', 'Operations']
  },
  {
    id: 'prog-diploma',
    code: 'Diploma',
    name: 'Diploma in Engineering (Polytechnic)',
    type: 'Diploma',
    degree: 'Diploma',
    departmentCode: 'DIPLOMA',
    durationYears: 3,
    semestersCount: 6,
    intakeCapacity: 300,
    eligibility: 'Matriculation (10th) with Science & Mathematics (Min 35%)',
    academicRegulation: 'SCTE&VT Autonomous Technical Curriculum',
    status: 'Active',
    branches: ['Civil', 'Mechanical', 'Electrical', 'Mining']
  },
  {
    id: 'prog-mtech',
    code: 'M.Tech',
    name: 'Master of Technology',
    type: 'Postgraduate (PG)',
    degree: 'M.Tech',
    departmentCode: 'CSE',
    durationYears: 2,
    semestersCount: 4,
    intakeCapacity: 36,
    eligibility: 'B.Tech / B.E in relevant branch + GATE / OJEE PG score',
    academicRegulation: 'AR-2023 (Research & Advanced Computing)',
    status: 'Active',
    branches: ['Computer Science', 'VLSI Design']
  }
];

export const initialBatches = [
  { id: 'batch-2023-27', label: 'B.Tech Batch 2023–2027 (Sem 5-6)', year: '3rd Year', academicYear: '2026-27', program: 'B.Tech', status: 'Active' },
  { id: 'batch-2024-28', label: 'B.Tech Batch 2024–2028 (Sem 3-4)', year: '2nd Year', academicYear: '2026-27', program: 'B.Tech', status: 'Active' },
  { id: 'batch-2025-29', label: 'B.Tech Batch 2025–2029 (Sem 1-2)', year: '1st Year', academicYear: '2026-27', program: 'B.Tech', status: 'Active' },
  { id: 'batch-2026-30', label: 'B.Tech Batch 2026–2030 (Fresh Admissions)', year: '1st Year', academicYear: '2026-27', program: 'B.Tech', status: 'Admissions Open' },
  { id: 'batch-bca-2024-27', label: 'BCA Batch 2024–2027 (Sem 3)', year: '2nd Year', academicYear: '2026-27', program: 'BCA', status: 'Active' },
  { id: 'batch-mca-2025-27', label: 'MCA Batch 2025–2027 (Sem 1)', year: '1st Year', academicYear: '2026-27', program: 'MCA', status: 'Active' },
  { id: 'batch-mba-2025-27', label: 'MBA Batch 2025–2027 (Sem 1)', year: '1st Year', academicYear: '2026-27', program: 'MBA', status: 'Active' },
  { id: 'batch-dip-2024-27', label: 'Diploma Batch 2024–2027 (Sem 3)', year: '2nd Year', academicYear: '2026-27', program: 'Diploma', status: 'Active' },
];

export const initialDepartments = [
  { id: 'dept-cse', code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. P. K. Pattnaik', hodEmail: 'hod.cse@apnacampus.edu.in', programs: ['B.Tech', 'M.Tech'], studentsCount: 540, facultyCount: 32, subjectsCount: 48, status: 'Active' },
  { id: 'dept-aiml', code: 'AI&ML', name: 'CSE - Artificial Intelligence & Machine Learning', hod: 'Dr. Sneha Ray', hodEmail: 'hod.aiml@apnacampus.edu.in', programs: ['B.Tech'], studentsCount: 180, facultyCount: 12, subjectsCount: 24, status: 'Active' },
  { id: 'dept-ece', code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. M. R. Senapati', hodEmail: 'hod.ece@apnacampus.edu.in', programs: ['B.Tech', 'M.Tech'], studentsCount: 380, facultyCount: 24, subjectsCount: 36, status: 'Active' },
  { id: 'dept-eee', code: 'EEE', name: 'Electrical & Electronics', hod: 'Dr. S. K. Das', hodEmail: 'hod.eee@apnacampus.edu.in', programs: ['B.Tech'], studentsCount: 290, facultyCount: 18, subjectsCount: 32, status: 'Active' },
  { id: 'dept-mech', code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. B. K. Rout', hodEmail: 'hod.mech@apnacampus.edu.in', programs: ['B.Tech'], studentsCount: 320, facultyCount: 22, subjectsCount: 34, status: 'Active' },
  { id: 'dept-civil', code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. A. K. Nayak', hodEmail: 'hod.civil@apnacampus.edu.in', programs: ['B.Tech'], studentsCount: 240, facultyCount: 16, subjectsCount: 28, status: 'Active' },
  { id: 'dept-it', code: 'IT', name: 'Information Technology', hod: 'Dr. R. C. Balabantaray', hodEmail: 'hod.it@apnacampus.edu.in', programs: ['B.Tech'], studentsCount: 210, facultyCount: 14, subjectsCount: 26, status: 'Active' },
  { id: 'dept-ca', code: 'CA', name: 'Computer Applications (BCA & MCA)', hod: 'Dr. Manas Ranjan Patra', hodEmail: 'hod.ca@apnacampus.edu.in', programs: ['BCA', 'MCA'], studentsCount: 240, facultyCount: 16, subjectsCount: 32, status: 'Active' },
  { id: 'dept-mgmt', code: 'MGMT', name: 'Management Studies (MBA & BBA)', hod: 'Dr. Sujata Mohapatra', hodEmail: 'hod.mgmt@apnacampus.edu.in', programs: ['MBA'], studentsCount: 180, facultyCount: 14, subjectsCount: 28, status: 'Active' },
  { id: 'dept-diploma', code: 'DIPLOMA', name: 'Diploma Engineering Wing', hod: 'Prof. K. C. Pradhan', hodEmail: 'hod.poly@apnacampus.edu.in', programs: ['Diploma'], studentsCount: 300, facultyCount: 18, subjectsCount: 30, status: 'Active' },
];

export const initialHods = [
  { id: 'hod-001', name: 'Dr. P. K. Pattnaik', email: 'hod.cse@apnacampus.edu.in', phone: '+91 94371 22890', department: 'Computer Science & Engineering', deptCode: 'CSE', experience: '18 Years', qualification: 'Ph.D in AI & Systems', status: 'Active' },
  { id: 'hod-002', name: 'Dr. M. R. Senapati', email: 'hod.ece@apnacampus.edu.in', phone: '+91 94372 88123', department: 'Electronics & Communication', deptCode: 'ECE', experience: '15 Years', qualification: 'Ph.D in VLSI Design', status: 'Active' },
  { id: 'hod-003', name: 'Dr. S. K. Das', email: 'hod.eee@apnacampus.edu.in', phone: '+91 94375 77124', department: 'Electrical & Electronics', deptCode: 'EEE', experience: '16 Years', qualification: 'Ph.D in Power Systems', status: 'Active' },
  { id: 'hod-004', name: 'Dr. B. K. Rout', email: 'hod.mech@apnacampus.edu.in', phone: '+91 94376 99012', department: 'Mechanical Engineering', deptCode: 'MECH', experience: '20 Years', qualification: 'Ph.D in Thermal Engg', status: 'Active' },
  { id: 'hod-005', name: 'Dr. A. K. Nayak', email: 'hod.civil@apnacampus.edu.in', phone: '+91 94378 11200', department: 'Civil Engineering', deptCode: 'CIVIL', experience: '14 Years', qualification: 'Ph.D in Structural Engg', status: 'Active' },
  { id: 'hod-006', name: 'Dr. Manas Ranjan Patra', email: 'hod.ca@apnacampus.edu.in', phone: '+91 94379 33410', department: 'Computer Applications', deptCode: 'CA', experience: '16 Years', qualification: 'Ph.D in Software Computing', status: 'Active' },
  { id: 'hod-007', name: 'Dr. Sujata Mohapatra', email: 'hod.mgmt@apnacampus.edu.in', phone: '+91 94370 55670', department: 'Management Studies', deptCode: 'MGMT', experience: '15 Years', qualification: 'Ph.D in Strategic Marketing', status: 'Active' },
  { id: 'hod-008', name: 'Prof. K. C. Pradhan', email: 'hod.poly@apnacampus.edu.in', phone: '+91 94373 77890', department: 'Diploma Engineering Wing', deptCode: 'DIPLOMA', experience: '19 Years', qualification: 'M.Tech in Manufacturing', status: 'Active' },
];

export const initialFaculty = [
  { id: 'FAC-042', name: 'Dr. S. Mohanty', email: 'faculty@apnacampus.edu.in', phone: '+91 98610 44211', department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Associate Professor', experience: '12 Years', assignedSubjects: ['Data Structures', 'Operating Systems'], assignedSections: ['B.Tech Sem 5 - Sec A', 'B.Tech Sem 5 - Sec B'], status: 'Active', teachingHoursWeek: 16 },
  { id: 'FAC-043', name: 'Prof. Rahul Sharma', email: 'rahul.cse@apnacampus.edu.in', phone: '+91 98611 77332', department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Assistant Professor', experience: '7 Years', assignedSubjects: ['Data Structures', 'Database Management Systems', 'Programming in C'], assignedSections: ['B.Tech Sem 1 - Sec A', 'B.Tech Sem 5 - Sec A'], status: 'Active', teachingHoursWeek: 18 },
  { id: 'FAC-044', name: 'Prof. Amit Mishra', email: 'amit.cse@apnacampus.edu.in', phone: '+91 98612 88443', department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Assistant Professor', experience: '8 Years', assignedSubjects: ['Operating Systems'], assignedSections: ['B.Tech Sem 5 - Sec A', 'B.Tech Sem 5 - Sec C'], status: 'Active', teachingHoursWeek: 14 },
  { id: 'FAC-045', name: 'Dr. Priya Ranjan', email: 'priya.cse@apnacampus.edu.in', phone: '+91 98613 99554', department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Associate Professor', experience: '11 Years', assignedSubjects: ['Database Management Systems'], assignedSections: ['B.Tech Sem 5 - Sec A', 'B.Tech Sem 5 - Sec B'], status: 'Active', teachingHoursWeek: 16 },
  { id: 'FAC-046', name: 'Dr. Sneha Ray', email: 'sneha.cse@apnacampus.edu.in', phone: '+91 98614 11665', department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Professor', experience: '16 Years', assignedSubjects: ['Artificial Intelligence'], assignedSections: ['B.Tech Sem 5 - Sec A'], status: 'Active', teachingHoursWeek: 12 },
  { id: 'FAC-047', name: 'Prof. Debashis Jena', email: 'debashis.cse@apnacampus.edu.in', phone: '+91 98615 22776', department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Assistant Professor', experience: '6 Years', assignedSubjects: ['Machine Learning'], assignedSections: ['B.Tech Sem 5 - Sec A', 'B.Tech Sem 5 - Sec B'], status: 'Active', teachingHoursWeek: 18 },
  { id: 'FAC-048', name: 'Prof. Smita Sahoo', email: 'smita.cse@apnacampus.edu.in', phone: '+91 98616 33887', department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Assistant Professor', experience: '5 Years', assignedSubjects: ['Software Engineering'], assignedSections: ['B.Tech Sem 5 - Sec A'], status: 'Active', teachingHoursWeek: 14 },
  { id: 'FAC-049', name: 'Prof. K. K. Sahoo', email: 'kk.sahoo@apnacampus.edu.in', phone: '+91 98617 44998', department: 'Computer Applications', deptCode: 'CA', designation: 'Assistant Professor', experience: '9 Years', assignedSubjects: ['Fundamentals of Computing', 'Web Technologies'], assignedSections: ['BCA Sem 1 - Sec A'], status: 'Active', teachingHoursWeek: 16 },
  { id: 'FAC-050', name: 'Dr. Ananya Mishra', email: 'ananya.mgmt@apnacampus.edu.in', phone: '+91 98618 55112', department: 'Management Studies', deptCode: 'MGMT', designation: 'Associate Professor', experience: '13 Years', assignedSubjects: ['Organizational Behavior', 'Managerial Economics'], assignedSections: ['MBA Sem 1 - Sec A'], status: 'Active', teachingHoursWeek: 14 },
  { id: 'FAC-051', name: 'Prof. T. K. Das', email: 'tk.poly@apnacampus.edu.in', phone: '+91 98619 66223', department: 'Diploma Engineering Wing', deptCode: 'DIPLOMA', designation: 'Senior Lecturer', experience: '14 Years', assignedSubjects: ['Applied Physics & Labs', 'Mechanics'], assignedSections: ['Diploma Sem 1 - Sec A'], status: 'Active', teachingHoursWeek: 20 },
];

export const initialSemesters = [
  { id: 'sem-1', number: 1, label: 'Semester 1', year: '1st Year', academicYear: '2026-27', status: 'Active', subjectsCount: 6, studentsCount: 520 },
  { id: 'sem-2', number: 2, label: 'Semester 2', year: '1st Year', academicYear: '2026-27', status: 'Upcoming', subjectsCount: 6, studentsCount: 520 },
  { id: 'sem-3', number: 3, label: 'Semester 3', year: '2nd Year', academicYear: '2026-27', status: 'Active', subjectsCount: 6, studentsCount: 510 },
  { id: 'sem-4', number: 4, label: 'Semester 4', year: '2nd Year', academicYear: '2026-27', status: 'Upcoming', subjectsCount: 6, studentsCount: 510 },
  { id: 'sem-5', number: 5, label: 'Semester 5', year: '3rd Year', academicYear: '2026-27', status: 'Active', subjectsCount: 6, studentsCount: 540 },
  { id: 'sem-6', number: 6, label: 'Semester 6', year: '3rd Year', academicYear: '2026-27', status: 'Upcoming', subjectsCount: 6, studentsCount: 540 },
  { id: 'sem-7', number: 7, label: 'Semester 7', year: '4th Year', academicYear: '2026-27', status: 'Active', subjectsCount: 5, studentsCount: 480 },
  { id: 'sem-8', number: 8, label: 'Semester 8', year: '4th Year', academicYear: '2026-27', status: 'Upcoming', subjectsCount: 4, studentsCount: 480 },
];

export const initialSections = [
  // B.Tech CSE Sections
  { id: 'sec-5a', program: 'B.Tech', semester: 'Semester 5', section: 'A', department: 'CSE', studentsCount: 91, classRepresentative: 'Rakesh Das', room: 'Block B - 302', facultyCoordinator: 'Dr. S. Mohanty' },
  { id: 'sec-5b', program: 'B.Tech', semester: 'Semester 5', section: 'B', department: 'CSE', studentsCount: 86, classRepresentative: 'Rohan Meher', room: 'Block B - 304', facultyCoordinator: 'Prof. Rahul Sharma' },
  { id: 'sec-5c', program: 'B.Tech', semester: 'Semester 5', section: 'C', department: 'CSE', studentsCount: 72, classRepresentative: 'Pooja Samal', room: 'Block B - 306', facultyCoordinator: 'Prof. Amit Mishra' },
  { id: 'sec-1a', program: 'B.Tech', semester: 'Semester 1', section: 'A', department: 'CSE', studentsCount: 64, classRepresentative: 'Rahul Kumar', room: 'Block B - 101', facultyCoordinator: 'Prof. Rahul Sharma' },
  { id: 'sec-7a', program: 'B.Tech', semester: 'Semester 7', section: 'A', department: 'CSE', studentsCount: 82, classRepresentative: 'Vivek Mohapatra', room: 'Block A - 401', facultyCoordinator: 'Dr. Sneha Ray' },
  // BCA Sections
  { id: 'sec-bca-1a', program: 'BCA', semester: 'Semester 1', section: 'A', department: 'CA', studentsCount: 58, classRepresentative: 'Debasish Swain', room: 'Block C - 201', facultyCoordinator: 'Prof. K. K. Sahoo' },
  { id: 'sec-bca-3a', program: 'BCA', semester: 'Semester 3', section: 'A', department: 'CA', studentsCount: 54, classRepresentative: 'Alok Panda', room: 'Block C - 203', facultyCoordinator: 'Prof. K. K. Sahoo' },
  // MBA Sections
  { id: 'sec-mba-1a', program: 'MBA', semester: 'Semester 1', section: 'A', department: 'MGMT', studentsCount: 60, classRepresentative: 'Priyanka Tripathy', room: 'MBA Exec Hall 1', facultyCoordinator: 'Dr. Ananya Mishra' },
  // Diploma Sections
  { id: 'sec-dip-1a', program: 'Diploma', semester: 'Semester 1', section: 'A', department: 'DIPLOMA', studentsCount: 65, classRepresentative: 'Subham Pradhan', room: 'Poly Block - 104', facultyCoordinator: 'Prof. T. K. Das' },
];

export const initialSubjects = [
  // B.Tech CSE Semester 5
  { id: 'sub-dsa', code: 'CS501', name: 'Data Structures', program: 'B.Tech', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Dr. S. Mohanty', facultyId: 'FAC-042', maxMarks: 100, passMarks: 40, status: 'Active' },
  { id: 'sub-os', code: 'CS502', name: 'Operating Systems', program: 'B.Tech', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Prof. Amit Mishra', facultyId: 'FAC-044', maxMarks: 100, passMarks: 40, status: 'Active' },
  { id: 'sub-dbms', code: 'CS503', name: 'Database Management Systems', program: 'B.Tech', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Dr. Priya Ranjan', facultyId: 'FAC-045', maxMarks: 100, passMarks: 40, status: 'Active' },
  { id: 'sub-ai', code: 'CS504', name: 'Artificial Intelligence', program: 'B.Tech', department: 'CSE', semester: 'Semester 5', credits: 3, type: 'Theory', assignedFaculty: 'Dr. Sneha Ray', facultyId: 'FAC-046', maxMarks: 100, passMarks: 40, status: 'Active' },
  { id: 'sub-ml', code: 'CS505', name: 'Machine Learning', program: 'B.Tech', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Prof. Debashis Jena', facultyId: 'FAC-047', maxMarks: 100, passMarks: 40, status: 'Active' },
  { id: 'sub-se', code: 'CS506', name: 'Software Engineering', program: 'B.Tech', department: 'CSE', semester: 'Semester 5', credits: 3, type: 'Theory', assignedFaculty: 'Prof. Smita Sahoo', facultyId: 'FAC-048', maxMarks: 100, passMarks: 40, status: 'Active' },

  // B.Tech Semester 1 Core
  { id: 'sub-c101', code: 'CS101', name: 'Programming in C & Logic', program: 'B.Tech', department: 'CSE', semester: 'Semester 1', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Prof. Rahul Sharma', facultyId: 'FAC-043', maxMarks: 100, passMarks: 40, status: 'Active' },
  { id: 'sub-m101', code: 'MA101', name: 'Engineering Mathematics I', program: 'B.Tech', department: 'CSE', semester: 'Semester 1', credits: 4, type: 'Theory', assignedFaculty: 'Dr. S. Mohanty', facultyId: 'FAC-042', maxMarks: 100, passMarks: 40, status: 'Active' },

  // BCA Program Subjects
  { id: 'sub-bca101', code: 'BCA101', name: 'Fundamentals of Computing & IT', program: 'BCA', department: 'CA', semester: 'Semester 1', credits: 4, type: 'Theory', assignedFaculty: 'Prof. K. K. Sahoo', facultyId: 'FAC-049', maxMarks: 100, passMarks: 40, status: 'Active' },
  { id: 'sub-bca102', code: 'BCA102', name: 'Digital Electronics & Logic Design', program: 'BCA', department: 'CA', semester: 'Semester 1', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Prof. K. K. Sahoo', facultyId: 'FAC-049', maxMarks: 100, passMarks: 40, status: 'Active' },

  // MBA Program Subjects
  { id: 'sub-mba101', code: 'MBA101', name: 'Organizational Behavior & HR Dynamics', program: 'MBA', department: 'MGMT', semester: 'Semester 1', credits: 4, type: 'Theory', assignedFaculty: 'Dr. Ananya Mishra', facultyId: 'FAC-050', maxMarks: 100, passMarks: 50, status: 'Active' },
  { id: 'sub-mba102', code: 'MBA102', name: 'Managerial Economics & Decisions', program: 'MBA', department: 'MGMT', semester: 'Semester 1', credits: 4, type: 'Theory', assignedFaculty: 'Dr. Ananya Mishra', facultyId: 'FAC-050', maxMarks: 100, passMarks: 50, status: 'Active' },

  // Diploma Program Subjects
  { id: 'sub-dip101', code: 'DIP101', name: 'Applied Physics & Technical Measurements', program: 'Diploma', department: 'DIPLOMA', semester: 'Semester 1', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Prof. T. K. Das', facultyId: 'FAC-051', maxMarks: 100, passMarks: 35, status: 'Active' },
  { id: 'sub-dip102', code: 'DIP102', name: 'Basic Mechanical & Electrical Workshop', program: 'Diploma', department: 'DIPLOMA', semester: 'Semester 1', credits: 3, type: 'Practical Lab', assignedFaculty: 'Prof. T. K. Das', facultyId: 'FAC-051', maxMarks: 100, passMarks: 35, status: 'Active' },
];

// Relational Mapping: Faculty -> Subject -> Program -> Semester -> Section -> Room
export const initialFacultyAssignments = [
  // Dr. S. Mohanty (FAC-042) - Multi-Class, Multi-Section, Multi-Semester Teaching Assignments
  { id: 'fa-1', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section A', subjectCode: 'CS501', subjectName: 'Data Structures & Algorithms', room: 'Block B - 302', periodsPerWeek: 5, sectionEnrollment: 32, type: 'Theory + Lab' },
  { id: 'fa-1b', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section B', subjectCode: 'CS501', subjectName: 'Data Structures & Algorithms', room: 'Block B - 303', periodsPerWeek: 5, sectionEnrollment: 30, type: 'Theory + Lab' },
  { id: 'fa-2', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section A', subjectCode: 'CS502', subjectName: 'Operating Systems', room: 'Block B - 304', periodsPerWeek: 4, sectionEnrollment: 32, type: 'Theory' },
  { id: 'fa-3', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 3', section: 'Section A', subjectCode: 'CS301', subjectName: 'Object Oriented Programming with Java', room: 'Block B - 201', periodsPerWeek: 4, sectionEnrollment: 34, type: 'Theory + Lab' },
  { id: 'fa-3b', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 3', section: 'Section B', subjectCode: 'CS301', subjectName: 'Object Oriented Programming with Java', room: 'Block B - 202', periodsPerWeek: 4, sectionEnrollment: 32, type: 'Theory + Lab' },
  { id: 'fa-4', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 1', section: 'Section A', subjectCode: 'CS101', subjectName: 'Problem Solving & C Programming', room: 'Block B - 101', periodsPerWeek: 4, sectionEnrollment: 36, type: 'Theory + Lab' },
  { id: 'fa-5', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2025-26', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 4', section: 'Section A', subjectCode: 'CS402', subjectName: 'Design & Analysis of Algorithms', room: 'Block B - 205', periodsPerWeek: 4, sectionEnrollment: 30, type: 'Theory + Lab' },
  { id: 'fa-6', facultyId: 'FAC-042', facultyName: 'Dr. S. Mohanty', academicYear: '2025-26', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 6', section: 'Section A', subjectCode: 'CS601', subjectName: 'Compiler Design & Automata', room: 'Block B - 305', periodsPerWeek: 4, sectionEnrollment: 28, type: 'Theory' },

  // Other Department Faculty Assignments
  { id: 'fa-other-2', facultyId: 'FAC-044', facultyName: 'Prof. Amit Mishra', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section B', subjectCode: 'CS502', subjectName: 'Operating Systems', room: 'Block B - 304', periodsPerWeek: 4, sectionEnrollment: 30, type: 'Theory' },
  { id: 'fa-other-3', facultyId: 'FAC-045', facultyName: 'Dr. Priya Ranjan', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section A', subjectCode: 'CS503', subjectName: 'Database Management Systems', room: 'Block B - 302', periodsPerWeek: 5, sectionEnrollment: 32, type: 'Theory + Lab' },
  { id: 'fa-other-4', facultyId: 'FAC-046', facultyName: 'Dr. Sneha Ray', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section A', subjectCode: 'CS504', subjectName: 'Artificial Intelligence', room: 'Block B - 302', periodsPerWeek: 4, sectionEnrollment: 32, type: 'Theory' },
  { id: 'fa-other-5', facultyId: 'FAC-047', facultyName: 'Prof. Debashis Jena', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section A', subjectCode: 'CS505', subjectName: 'Machine Learning', room: 'Block B - 302', periodsPerWeek: 5, sectionEnrollment: 32, type: 'Theory + Lab' },
  { id: 'fa-other-6', facultyId: 'FAC-048', facultyName: 'Prof. Smita Sahoo', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 5', section: 'Section A', subjectCode: 'CS506', subjectName: 'Software Engineering', room: 'Block B - 302', periodsPerWeek: 3, sectionEnrollment: 32, type: 'Theory' },
  { id: 'fa-other-7', facultyId: 'FAC-043', facultyName: 'Prof. Rahul Sharma', academicYear: '2026-27', program: 'B.Tech', deptCode: 'CSE', semester: 'Semester 1', section: 'Section B', subjectCode: 'CS101', subjectName: 'Problem Solving & C Programming', room: 'Block B - 102', periodsPerWeek: 4, sectionEnrollment: 34, type: 'Theory + Lab' },
  { id: 'fa-other-8', facultyId: 'FAC-049', facultyName: 'Prof. K. K. Sahoo', academicYear: '2026-27', program: 'BCA', deptCode: 'CA', semester: 'Semester 1', section: 'Section A', subjectCode: 'BCA101', subjectName: 'Fundamentals of Computing & IT', room: 'Block C - 201', periodsPerWeek: 4, sectionEnrollment: 40, type: 'Theory' },
  { id: 'fa-other-9', facultyId: 'FAC-050', facultyName: 'Dr. Ananya Mishra', academicYear: '2026-27', program: 'MBA', deptCode: 'MGMT', semester: 'Semester 1', section: 'Section A', subjectCode: 'MBA101', subjectName: 'Organizational Behavior & HR Dynamics', room: 'MBA Exec Hall 1', periodsPerWeek: 4, sectionEnrollment: 45, type: 'Theory' },
  { id: 'fa-other-10', facultyId: 'FAC-051', facultyName: 'Prof. T. K. Das', academicYear: '2026-27', program: 'Diploma', deptCode: 'DIPLOMA', semester: 'Semester 1', section: 'Section A', subjectCode: 'DIP101', subjectName: 'Applied Physics & Technical Measurements', room: 'Poly Block - 104', periodsPerWeek: 4, sectionEnrollment: 35, type: 'Theory + Lab' },
];

// Configurable Marking Scheme
export const initialMarkingScheme = [
  { id: 'scheme-mod', assessmentType: 'Modular Exams', count: 2, maxMarks: 20, weightage: 30, formula: 'Average of 2 modulars (30%)', status: 'Active' },
  { id: 'scheme-quiz', assessmentType: 'Quizzes', count: 6, maxMarks: 10, weightage: 20, formula: 'Best 5 of 6 quizzes (20%)', status: 'Active' },
  { id: 'scheme-asgn', assessmentType: 'Assignments', count: 2, maxMarks: 10, weightage: 10, formula: 'Average of 2 assignments (10%)', status: 'Active' },
  { id: 'scheme-st', assessmentType: 'Surprise Tests', count: 2, maxMarks: 10, weightage: 10, formula: 'Average of 2 surprise tests (10%)', status: 'Active' },
  { id: 'scheme-lab', assessmentType: 'Lab Work / Practical', count: 1, maxMarks: 10, weightage: 30, formula: 'Continuous lab experiments + viva (30%)', status: 'Active' },
];

// Initial Audit History
export const initialAuditLogs = [
  { id: 'audit-01', user: 'Dr. S. Mohanty (Faculty)', role: 'FACULTY', targetStudent: 'Rakesh Das (Roll 01)', subject: 'Data Structures', assessment: 'Quiz 3', oldMark: 7, newMark: 9, changedAt: '03 Oct 2026, 10:30 PM', reason: 'Correction after student rechecking paper' },
  { id: 'audit-02', user: 'Dr. P. K. Pattnaik (HOD)', role: 'HOD', targetStudent: 'Whole Section A', subject: 'Operating Systems', assessment: 'Internal Review', oldMark: 'Pending', newMark: 'Approved', changedAt: '03 Oct 2026, 09:15 PM', reason: 'HOD approved finalized internal marks for Sem 5 Sec A' },
  { id: 'audit-03', user: 'Campus Administrator', role: 'ADMIN', targetStudent: 'System-wide', subject: 'Marking Scheme', assessment: 'Modular Weightage', oldMark: '25%', newMark: '30%', changedAt: '02 Oct 2026, 04:00 PM', reason: 'Autonomous Academic Council 2026 Revision' },
  { id: 'audit-04', user: 'Prof. Rahul Sharma', role: 'FACULTY', targetStudent: 'Amit Nayak (Roll 02)', subject: 'Data Structures', assessment: 'Modular 2', oldMark: 14, newMark: 18, changedAt: '01 Oct 2026, 02:45 PM', reason: 'Evaluation recount verified' },
];

// Initial HOD Approval Status Queue
export const initialApprovalQueue = [
  { id: 'appr-01', subjectCode: 'CS501', subject: 'Data Structures', faculty: 'Dr. S. Mohanty', semester: 'Semester 5', section: 'Section A', submittedDate: '02 Oct 2026', status: 'Approved', hodRemarks: 'All 91 students evaluated with proper quiz/modular breakdown.', reviewedAt: '03 Oct 2026, 11:30 AM' },
  { id: 'appr-02', subjectCode: 'CS502', subject: 'Operating Systems', faculty: 'Prof. Amit Mishra', semester: 'Semester 5', section: 'Section A', submittedDate: '03 Oct 2026', status: 'Pending', hodRemarks: 'Under review by HOD. Quizzes 1-6 uploaded.', reviewedAt: null },
  { id: 'appr-03', subjectCode: 'CS503', subject: 'Database Management Systems', faculty: 'Dr. Priya Ranjan', semester: 'Semester 5', section: 'Section A', submittedDate: '01 Oct 2026', status: 'Rejected', hodRemarks: 'Quiz 4 marks are missing for 8 students. Please complete and resubmit.', reviewedAt: '02 Oct 2026, 04:10 PM' },
  { id: 'appr-04', subjectCode: 'CS504', subject: 'Artificial Intelligence', faculty: 'Dr. Sneha Ray', semester: 'Semester 5', section: 'Section A', submittedDate: '03 Oct 2026', status: 'Approved', hodRemarks: 'Verified and approved for publication.', reviewedAt: '03 Oct 2026, 03:00 PM' },
  { id: 'appr-05', subjectCode: 'CS505', subject: 'Machine Learning', faculty: 'Prof. Debashis Jena', semester: 'Semester 5', section: 'Section A', submittedDate: '29 Sep 2026', status: 'Approved', hodRemarks: 'All components match autonomous syllabus guidelines.', reviewedAt: '30 Sep 2026, 05:20 PM' },
  { id: 'appr-06', subjectCode: 'CS506', subject: 'Software Engineering', faculty: 'Prof. Smita Sahoo', semester: 'Semester 5', section: 'Section A', submittedDate: '02 Oct 2026', status: 'Pending', hodRemarks: 'Awaiting submission of Lab marks verification.', reviewedAt: null },
];

// Multi-Cohort Students generator across academic classes, semesters & sections
const studentFirstNames = ['Rakesh', 'Amit', 'Raj', 'Priya', 'Sourav', 'Sneha', 'Deepak', 'Puja', 'Bikash', 'Swati', 'Rohit', 'Monika', 'Subham', 'Ipsita', 'Alok', 'Smruti', 'Chandan', 'Tanmay', 'Lipika', 'Manas', 'Pragyan', 'Biswajit', 'Archana', 'Gourab', 'Satyajit', 'Sonali', 'Ashish', 'Kiran', 'Pranab', 'Niharika', 'Debasis', 'Kavita', 'Manoj', 'Anjali', 'Tapan', 'Rupali'];
const studentLastNames = ['Das', 'Nayak', 'Sahoo', 'Patra', 'Mohanty', 'Barik', 'Rout', 'Behera', 'Pradhan', 'Samal', 'Panda', 'Mishra', 'Tripathy', 'Parida', 'Jena', 'Swain', 'Mangaraj', 'Muduli', 'Kar', 'Acharya'];

export function generateAllStudents() {
  const cohortConfigs = [
    { semester: 'Semester 5', section: 'Section A', academicYear: '2026-27', count: 32, prefix: '5A' },
    { semester: 'Semester 5', section: 'Section B', academicYear: '2026-27', count: 30, prefix: '5B' },
    { semester: 'Semester 3', section: 'Section A', academicYear: '2026-27', count: 34, prefix: '3A' },
    { semester: 'Semester 3', section: 'Section B', academicYear: '2026-27', count: 32, prefix: '3B' },
    { semester: 'Semester 1', section: 'Section A', academicYear: '2026-27', count: 36, prefix: '1A' },
    { semester: 'Semester 4', section: 'Section A', academicYear: '2025-26', count: 30, prefix: '4A' },
    { semester: 'Semester 6', section: 'Section A', academicYear: '2025-26', count: 28, prefix: '6A' },
  ];

  const students = [];

  cohortConfigs.forEach(cohort => {
    const semNum = cohort.semester.replace(/[^0-9]/g, '');
    const yrCode = cohort.academicYear === '2025-26' ? '22' : '23';

    for (let i = 1; i <= cohort.count; i++) {
      const rollStr = String(i).padStart(2, '0');
      const fName = studentFirstNames[(i - 1 + parseInt(semNum, 10) * 3) % studentFirstNames.length];
      const lName = studentLastNames[(i * 2 + (cohort.section === 'Section B' ? 5 : 0)) % studentLastNames.length];
      const isLead = i === 1 && cohort.semester === 'Semester 5' && cohort.section === 'Section A';
      const name = isLead ? 'Rakesh Das' : `${fName} ${lName}`;
      const studentId = `GIFT-${yrCode}05-${cohort.prefix}${rollStr}`;

      const attendance = Math.min(100, Math.max(58, Math.floor(70 + ((i * 13 + parseInt(semNum, 10) * 7) % 29))));
      const cgpa = Number((7.1 + (((i * 17 + parseInt(semNum, 10) * 9) % 270) / 100)).toFixed(2));

      students.push({
        id: `std-${cohort.prefix}-${rollStr}`,
        studentId,
        registrationNumber: studentId,
        rollNumber: rollStr,
        name,
        email: `${fName.toLowerCase()}.${rollStr.toLowerCase()}@apnacampus.edu.in`,
        phone: `+91 ${9861000000 + (i * 111 + parseInt(semNum, 10) * 1000) % 900000}`,
        department: 'Computer Science & Engineering',
        deptCode: 'CSE',
        program: 'B.Tech',
        semester: cohort.semester,
        section: cohort.section,
        academicYear: cohort.academicYear,
        status: i % 25 === 0 ? 'On Leave' : 'Active',
        cgpa,
        attendance,
      });
    }
  });

  return students;
}

// -------------------------------------------------------------
// ACCOUNTS / FEES DATASET
// -------------------------------------------------------------
export const initialFeeStructures = [
  { id: 'fee-str-1', term: 'Semester 5 (Academic Year 2026-27)', program: 'B.Tech - Computer Science & Engineering', tuitionFee: 48500, developmentFee: 8500, labLibraryFee: 6000, examinationFee: 3500, hostelMessFee: 32000, total: 98500 },
  { id: 'fee-str-2', term: 'Semester 1 (Fresh Admissions 2026-27)', program: 'B.Tech - Engineering Branches', tuitionFee: 52000, developmentFee: 10000, labLibraryFee: 7500, examinationFee: 3500, hostelMessFee: 32000, total: 105000 },
  { id: 'fee-str-3', term: 'Semester 1 (Academic Year 2026-27)', program: 'BCA - Bachelor of Computer Applications', tuitionFee: 30000, developmentFee: 5000, labLibraryFee: 4000, examinationFee: 2500, hostelMessFee: 30000, total: 71500 },
  { id: 'fee-str-4', term: 'Semester 1 (Academic Year 2026-27)', program: 'MCA - Master of Computer Applications', tuitionFee: 42000, developmentFee: 6000, labLibraryFee: 5000, examinationFee: 3000, hostelMessFee: 32000, total: 88000 },
  { id: 'fee-str-5', term: 'Semester 1 (Academic Year 2026-27)', program: 'MBA - Master of Business Administration', tuitionFee: 55000, developmentFee: 8000, labLibraryFee: 5000, examinationFee: 3500, hostelMessFee: 32000, total: 103500 },
  { id: 'fee-str-6', term: 'Semester 1 (Academic Year 2026-27)', program: 'Diploma - Engineering Wing', tuitionFee: 22000, developmentFee: 4000, labLibraryFee: 3500, examinationFee: 2000, hostelMessFee: 28000, total: 59500 },
  { id: 'fee-str-7', term: 'Semester 1 (Academic Year 2026-27)', program: 'M.Tech - Advanced Computing', tuitionFee: 46000, developmentFee: 7000, labLibraryFee: 6000, examinationFee: 3500, hostelMessFee: 32000, total: 94500 },
];

export const initialFeeTransactions = [
  { id: 'TXN-98421', studentName: 'Rakesh Das', rollNumber: '01', semester: 'Semester 5', head: 'Tuition & Development Fee', amount: 48500, mode: 'Net Banking (HDFC)', date: '12 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0814' },
  { id: 'TXN-98422', studentName: 'Rakesh Das', rollNumber: '01', semester: 'Semester 5', head: 'Examination & University Reg.', amount: 3500, mode: 'UPI', date: '15 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0852' },
  { id: 'TXN-98423', studentName: 'Rakesh Das', rollNumber: '01', semester: 'Semester 5', head: 'Hostel & Mess Charges', amount: 20000, mode: 'Credit Card', date: '20 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0899', dueAmount: 12000 },
  { id: 'TXN-98425', studentName: 'Amit Nayak', rollNumber: '02', semester: 'Semester 5', head: 'Full Semester Fee', amount: 98500, mode: 'Challan', date: '10 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0801' },
  { id: 'TXN-98426', studentName: 'Raj Sahoo', rollNumber: '03', semester: 'Semester 5', head: 'Tuition Installment 1', amount: 35000, mode: 'UPI', date: '14 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0840', dueAmount: 22000 },
  { id: 'TXN-98427', studentName: 'Priya Patra', rollNumber: '04', semester: 'Semester 5', head: 'Full Semester Fee', amount: 98500, mode: 'Net Banking', date: '11 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0819' },
  { id: 'TXN-98428', studentName: 'Sourav Mohanty', rollNumber: '05', semester: 'Semester 5', head: 'Partial Fee', amount: 40000, mode: 'UPI', date: '18 Aug 2026', status: 'Pending Verification', receiptNo: 'RCPT-2026-0881', dueAmount: 18500 },
];

export const initialScholarships = [
  { id: 'sch-01', name: 'PRERANA Post-Matric State Scholarship', authority: 'Govt of Odisha (ST & SC Dev Dept)', benefit: '₹45,000 / year', beneficiaries: 142, status: 'Active' },
  { id: 'sch-02', name: 'National Scholarship Portal (NSP)', authority: 'Ministry of Electronics & IT, GoI', benefit: '₹30,000 / year', beneficiaries: 88, status: 'Active' },
  { id: 'sch-03', name: 'Apna Campus Academic Merit Waiver', authority: 'Apna Campus Trust Board', benefit: '₹25,000 / year', beneficiaries: 35, status: 'Active' },
];

// -------------------------------------------------------------
// HOSTEL MANAGEMENT DATASET
// -------------------------------------------------------------
export const initialHostels = [
  { id: 'hostel-b1', name: 'Gandhi Boys Residence (Hostel 1)', type: 'Boys', totalFloors: 3, totalRooms: 60, totalBeds: 180, occupiedBeds: 168, availableBeds: 12, warden: 'Mr. Rajesh Jena', contact: '+91 94370 11223' },
  { id: 'hostel-b2', name: 'Kalam Boys Residence (Hostel 2)', type: 'Boys', totalFloors: 3, totalRooms: 60, totalBeds: 180, occupiedBeds: 172, availableBeds: 8, warden: 'Mr. Manoj Sahoo', contact: '+91 94370 22334' },
  { id: 'hostel-g1', name: 'Sarojini Girls Residence (Hostel 1)', type: 'Girls', totalFloors: 3, totalRooms: 50, totalBeds: 150, occupiedBeds: 142, availableBeds: 8, warden: 'Mrs. Nibedita Das', contact: '+91 94370 33445' },
];

export const initialHostelRooms = [
  { id: 'rm-101', hostelId: 'hostel-g1', hostelName: 'Sarojini Girls Residence', floor: 'Floor 1', roomNumber: '101', capacity: 3, occupied: 3, type: 'Non-AC Triple' },
  { id: 'rm-102', hostelId: 'hostel-g1', hostelName: 'Sarojini Girls Residence', floor: 'Floor 1', roomNumber: '102', capacity: 3, occupied: 2, type: 'Non-AC Triple' },
  { id: 'rm-204', hostelId: 'hostel-g1', hostelName: 'Sarojini Girls Residence', floor: 'Floor 2', roomNumber: '204', capacity: 3, occupied: 3, type: 'AC Triple Deluxe' },
  { id: 'rm-b101', hostelId: 'hostel-b1', hostelName: 'Gandhi Boys Residence', floor: 'Floor 1', roomNumber: '101', capacity: 3, occupied: 3, type: 'Non-AC Triple' },
  { id: 'rm-b102', hostelId: 'hostel-b1', hostelName: 'Gandhi Boys Residence', floor: 'Floor 1', roomNumber: '102', capacity: 3, occupied: 2, type: 'Non-AC Triple' },
  { id: 'rm-b201', hostelId: 'hostel-b1', hostelName: 'Gandhi Boys Residence', floor: 'Floor 2', roomNumber: '201', capacity: 3, occupied: 3, type: 'AC Triple Deluxe' },
];

export const initialStudentHostelDetail = {
  hostelName: 'Sarojini Girls Residence (Block A)',
  roomNumber: '204',
  bedNumber: 'Bed 01 (Window Side)',
  floor: 'Floor 2',
  wardenName: 'Mrs. Nibedita Das',
  wardenContact: '+91 94370 33445',
  roommates: [
    { name: 'Priya Patra', roll: '04', branch: 'CSE - Sem 5', bed: 'Bed 02' },
    { name: 'Sneha Mohanty', roll: '06', branch: 'CSE - Sem 5', bed: 'Bed 03' },
  ],
  rules: [
    'Night curfews strictly implemented at 8:30 PM.',
    'Biometric attendance check-in compulsory before 8:45 PM.',
    'Mess timings: Breakfast 7:30 - 9:00 AM, Dinner 7:30 - 9:30 PM.',
    'Electric heating appliances and immersion rods strictly prohibited.'
  ]
};

export const initialHostelComplaints = [
  { id: 'CMP-201', studentName: 'Rakesh Das', rollNumber: '01', hostel: 'Sarojini Boys Residence', roomNumber: '204', category: 'Electrical', title: 'Ceiling fan speed regulator broken', description: 'The speed regulator of the ceiling fan in Room 204 started making a buzzing sound from 28 Sep onwards. When switched to speed 3 or above, it sparks briefly and then the fan stops. It is affecting sleep due to heat. The issue has been present for 4 days now.', priority: 'Medium', status: 'In Progress', filedDate: '02 Oct 2026', resolutionNotes: 'Electrician assigned for inspection today.', imageUrl: null },
  { id: 'CMP-202', studentName: 'Amit Nayak', rollNumber: '02', hostel: 'Gandhi Boys Residence', roomNumber: '102', category: 'Plumbing', title: 'Bathroom tap leaking continuously', priority: 'High', status: 'Pending', filedDate: '03 Oct 2026', resolutionNotes: 'Plumber queued for block inspection.' },
  { id: 'CMP-203', studentName: 'Priya Patra', rollNumber: '04', hostel: 'Sarojini Girls Residence', roomNumber: '204', category: 'Internet / Wi-Fi', title: 'Wi-Fi repeater access drop in evening', priority: 'Low', status: 'Resolved', filedDate: '29 Sep 2026', resolutionNotes: 'IT team reconfigured floor 2 access point.' },
  { id: 'CMP-204', studentName: 'Sourav Mohanty', rollNumber: '05', hostel: 'Gandhi Boys Residence', roomNumber: '201', category: 'Carpentry', title: 'Study table drawer lock stuck', priority: 'Low', status: 'Resolved', filedDate: '28 Sep 2026', resolutionNotes: 'Replaced cylinder lock.' },
];

export const initialHostelVisitors = [
  { id: 'VIS-401', visitorName: 'Mr. Suresh Nayak', relation: 'Father', studentName: 'Rakesh Das', rollNumber: '01', inTime: '04:15 PM', outTime: '05:30 PM', passNumber: 'PASS-781', purpose: 'Delivering semester study materials & clothes' },
  { id: 'VIS-402', visitorName: 'Mr. Subrat Nayak', relation: 'Brother', studentName: 'Amit Nayak', rollNumber: '02', inTime: '02:00 PM', outTime: '03:15 PM', passNumber: 'PASS-782', purpose: 'Family visit' },
];

// -------------------------------------------------------------
// CANTEEN MANAGEMENT DATASET
// -------------------------------------------------------------
export const initialFoodItems = [
  { id: 'food-01', name: 'Veg Hyderabadi Biryani', category: 'Main Course', price: 60, isAvailable: true, prepTime: '10 mins', calories: '420 kcal' },
  { id: 'food-02', name: 'Chicken Dum Biryani', category: 'Main Course', price: 110, isAvailable: true, prepTime: '12 mins', calories: '580 kcal' },
  { id: 'food-03', name: 'Paneer Butter Masala Combo (3 Rotis)', category: 'Main Course', price: 80, isAvailable: true, prepTime: '15 mins', calories: '480 kcal' },
  { id: 'food-04', name: 'South Indian Masala Dosa', category: 'Breakfast/Snacks', price: 45, isAvailable: true, prepTime: '8 mins', calories: '290 kcal' },
  { id: 'food-05', name: 'Idli Sambhar (3 Pcs) with Chutney', category: 'Breakfast/Snacks', price: 30, isAvailable: true, prepTime: '5 mins', calories: '180 kcal' },
  { id: 'food-06', name: 'Executive Thali (Rice, 2 Roti, Dal, Sabzi, Papad, Curd)', category: 'Main Course', price: 65, isAvailable: true, prepTime: '5 mins', calories: '550 kcal' },
  { id: 'food-07', name: 'Fresh Cold Coffee with Ice Cream', category: 'Beverages', price: 35, isAvailable: true, prepTime: '4 mins', calories: '190 kcal' },
  { id: 'food-08', name: 'GIFT Special Samosa Chat (2 Pcs)', category: 'Breakfast/Snacks', price: 35, isAvailable: true, prepTime: '5 mins', calories: '310 kcal' },
];

export const initialCanteenOrders = [
  { id: 'ORD-7891', studentName: 'Rakesh Das', rollNumber: '01', items: [{ name: 'Veg Hyderabadi Biryani', qty: 1, price: 60 }, { name: 'Cold Coffee', qty: 1, price: 35 }], totalAmount: 95, status: 'Preparing', paymentMode: 'RFID Smart Card', orderedAt: '12:45 PM', token: 'TOKEN-42' },
  { id: 'ORD-7892', studentName: 'Amit Nayak', rollNumber: '02', items: [{ name: 'Chicken Dum Biryani', qty: 1, price: 110 }], totalAmount: 110, status: 'Ready', paymentMode: 'UPI', orderedAt: '12:40 PM', token: 'TOKEN-39' },
  { id: 'ORD-7893', studentName: 'Raj Sahoo', rollNumber: '03', items: [{ name: 'Masala Dosa', qty: 2, price: 90 }], totalAmount: 90, status: 'Completed', paymentMode: 'RFID Smart Card', orderedAt: '12:20 PM', token: 'TOKEN-28' },
  { id: 'ORD-7894', studentName: 'Priya Patra', rollNumber: '04', items: [{ name: 'Executive Thali', qty: 1, price: 65 }], totalAmount: 65, status: 'Pending', paymentMode: 'Cash at Counter', orderedAt: '12:55 PM', token: 'TOKEN-48' },
];

// -------------------------------------------------------------
// NOTIFICATIONS SYSTEM DATASET
// -------------------------------------------------------------
export const initialNotifications = [
  { id: 'notif-01', role: 'student', title: 'Marks Published: Data Structures', message: 'HOD Dr. P. K. Pattnaik has approved Continuous Internal Assessment marks for CS501.', time: '10 mins ago', unread: true },
  { id: 'notif-02', role: 'student', title: 'Hostel Complaint Update', message: 'CMP-201 (Ceiling fan) status changed to "In Progress". Electrician assigned.', time: '1 hour ago', unread: true },
  { id: 'notif-03', role: 'student', title: 'Canteen Order Status', message: 'Order ORD-7891 is currently being prepared. Token #42.', time: '20 mins ago', unread: false },
  { id: 'notif-04', role: 'faculty', title: 'Marks Approved by HOD', message: 'Data Structures (CS501) continuous assessment officially published for Section A.', time: '1 hour ago', unread: true },
  { id: 'notif-05', role: 'hod', title: 'New Assessment Submission', message: 'Faculty Prof. Amit Mishra has submitted Operating Systems (CS502) internal marks for moderation.', time: '2 hours ago', unread: true },
  { id: 'notif-06', role: 'accounts', title: 'Fee Payment Received', message: 'Student Amit Nayak paid full Semester 5 fee ₹98,500 via Challan.', time: '3 hours ago', unread: true },
  { id: 'notif-07', role: 'warden', title: 'New Hostel Maintenance Complaint', message: 'CMP-202 (Plumbing) logged by Room 102 (Gandhi Boys Residence).', time: '15 mins ago', unread: true },
  { id: 'notif-08', role: 'canteen', title: 'New Online Order Placed', message: 'Order ORD-7894 from Priya Patra (Executive Thali) waiting for acceptance.', time: '5 mins ago', unread: true },
  { id: 'notif-09', role: 'admin', title: 'System-wide Attendance Threshold', message: 'Autonomous examination compliance report generated. 92% students eligible.', time: '4 hours ago', unread: false },
];

// -------------------------------------------------------------
// CAMPUS & ADMINISTRATIVE STAFF ROSTERS
// -------------------------------------------------------------

// Hostel Wardens Roster - explicitly categorizing Boys and Girls Hostel Wardens
export const initialWardens = [
  {
    id: 'WRD-B01',
    name: 'Mr. Rajesh Jena',
    gender: 'Male',
    hostelCategory: 'Boys Hostel',
    assignedHostel: 'Gandhi Boys Residence (Hostel 1)',
    roomOffice: 'Ground Floor, Warden Office A-01',
    phone: '+91 94370 11223',
    email: 'warden.b1@apnacampus.edu.in',
    shift: '24x7 Resident Duty',
    residentsCount: 168,
    totalBeds: 180,
    status: 'Active',
    joiningYear: '2021',
  },
  {
    id: 'WRD-B02',
    name: 'Mr. Manoj Sahoo',
    gender: 'Male',
    hostelCategory: 'Boys Hostel',
    assignedHostel: 'Kalam Boys Residence (Hostel 2)',
    roomOffice: 'Floor 1, Block B Administration',
    phone: '+91 94370 22334',
    email: 'warden.b2@apnacampus.edu.in',
    shift: 'Day Shift (08:00 AM - 08:00 PM)',
    residentsCount: 172,
    totalBeds: 180,
    status: 'Active',
    joiningYear: '2022',
  },
  {
    id: 'WRD-G01',
    name: 'Mrs. Nibedita Das',
    gender: 'Female',
    hostelCategory: 'Girls Hostel',
    assignedHostel: 'Sarojini Girls Residence (Hostel 1)',
    roomOffice: 'Main Wing, Warden Suite G-02',
    phone: '+91 94370 33445',
    email: 'warden.g1@apnacampus.edu.in',
    shift: '24x7 Resident Duty',
    residentsCount: 142,
    totalBeds: 150,
    status: 'Active',
    joiningYear: '2020',
  },
  {
    id: 'WRD-G02',
    name: 'Mrs. Pratima Mohapatra',
    gender: 'Female',
    hostelCategory: 'Girls Hostel',
    assignedHostel: 'Kalpana Chawla Girls Residence (Hostel 2)',
    roomOffice: 'Block A, Office 101',
    phone: '+91 94370 44556',
    email: 'warden.g2@apnacampus.edu.in',
    shift: 'Evening & Night Shift (04:00 PM - 08:00 AM)',
    residentsCount: 130,
    totalBeds: 140,
    status: 'Active',
    joiningYear: '2023',
  },
];

// Security Guards Roster
export const initialSecurityGuards = [
  {
    id: 'SEC-101',
    name: 'Dillip Kumar Pradhan',
    badgeNumber: 'SG-OD-4421',
    postLocation: 'Main Campus Gate 1 (Front Entrance)',
    shift: 'Morning Shift (06:00 AM - 02:00 PM)',
    phone: '+91 94371 55671',
    emergencyContact: '+91 98610 88210',
    assignedAgency: 'Falcon Security Services',
    bloodGroup: 'B+',
    status: 'On Duty',
  },
  {
    id: 'SEC-102',
    name: 'Bhuban Mohan Senapati',
    badgeNumber: 'SG-OD-4422',
    postLocation: 'Girls Hostel Gate & Boundary Checkpoint',
    shift: 'Evening Shift (02:00 PM - 10:00 PM)',
    phone: '+91 94371 66782',
    emergencyContact: '+91 98610 99321',
    assignedAgency: 'Falcon Security Services',
    bloodGroup: 'O+',
    status: 'On Duty',
  },
  {
    id: 'SEC-103',
    name: 'Ramesh Chandra Behera',
    badgeNumber: 'SG-OD-4423',
    postLocation: 'Boys Hostel Complex & Parking Bay',
    shift: 'Night Patrol (10:00 PM - 06:00 AM)',
    phone: '+91 94371 77893',
    emergencyContact: '+91 98611 11234',
    assignedAgency: 'Falcon Security Services',
    bloodGroup: 'A+',
    status: 'On Duty',
  },
  {
    id: 'SEC-104',
    name: 'Sunita Biswal',
    badgeNumber: 'SG-OD-4424',
    postLocation: 'Girls Hostel Reception & Visitor Desk',
    shift: 'Morning Shift (06:00 AM - 02:00 PM)',
    phone: '+91 94371 88904',
    emergencyContact: '+91 98612 22345',
    assignedAgency: 'Falcon Security Services',
    bloodGroup: 'AB+',
    status: 'On Duty',
  },
  {
    id: 'SEC-105',
    name: 'Kailash Chandra Sahu',
    badgeNumber: 'SG-OD-4425',
    postLocation: 'Academic Block B & Central Computing Lab',
    shift: 'Evening Shift (02:00 PM - 10:00 PM)',
    phone: '+91 94371 99015',
    emergencyContact: '+91 98613 33456',
    assignedAgency: 'Falcon Security Services',
    bloodGroup: 'O+',
    status: 'On Duty',
  },
  {
    id: 'SEC-106',
    name: 'Niranjan Nayak',
    badgeNumber: 'SG-OD-4426',
    postLocation: 'Back Gate 2 & Sports Complex',
    shift: 'Night Patrol (10:00 PM - 06:00 AM)',
    phone: '+91 94372 00126',
    emergencyContact: '+91 98614 44567',
    assignedAgency: 'Falcon Security Services',
    bloodGroup: 'B+',
    status: 'On Leave',
  },
];

// Canteen Staff Roster
export const initialCanteenStaff = [
  {
    id: 'CNT-01',
    name: 'Santosh Nayak',
    role: 'Canteen Supervisor / In-Charge',
    outlet: 'Central Food Court & Mess Hall',
    shift: 'Full Day Shift (07:00 AM - 08:30 PM)',
    phone: '+91 98612 33411',
    fssaiLicense: 'FSSAI-OD-2024-9981',
    speciality: 'Mess Operations & Inventory Management',
    status: 'Active',
  },
  {
    id: 'CNT-02',
    name: 'Bikram Keshari Rout',
    role: 'Head Chef / Kitchen Lead',
    outlet: 'Hostel Dining Hall A (Main Kitchen)',
    shift: 'Morning Prep & Lunch (06:00 AM - 03:00 PM)',
    phone: '+91 98613 44522',
    fssaiLicense: 'FSSAI-OD-2024-9982',
    speciality: 'North & South Indian Thali, Biryani',
    status: 'Active',
  },
  {
    id: 'CNT-03',
    name: 'Sita Devi',
    role: 'Senior Cook',
    outlet: 'Girls Hostel Dining Section',
    shift: 'Evening & Dinner (02:00 PM - 10:00 PM)',
    phone: '+91 98614 55633',
    fssaiLicense: 'FSSAI-OD-2024-9983',
    speciality: 'Home-style meals, Roti & Curries',
    status: 'Active',
  },
  {
    id: 'CNT-04',
    name: 'Kuna Barik',
    role: 'Counter Cashier & POS Operator',
    outlet: 'Cafeteria & Snacks Counter',
    shift: 'Morning & Afternoon (08:30 AM - 05:30 PM)',
    phone: '+91 98615 66744',
    fssaiLicense: 'FSSAI-OD-2024-9984',
    speciality: 'Smart Card & RFID Token Billing',
    status: 'Active',
  },
  {
    id: 'CNT-05',
    name: 'Arun Kumar Swain',
    role: 'Assistant Cook & Prep Lead',
    outlet: 'Central Food Court',
    shift: 'Morning Prep (06:00 AM - 02:00 PM)',
    phone: '+91 98616 77855',
    fssaiLicense: 'FSSAI-OD-2024-9985',
    speciality: 'Breakfast, Snacks & Bakery',
    status: 'Active',
  },
];

// Other Campus & Support Members Roster
export const initialOtherStaff = [
  {
    id: 'STF-01',
    name: 'Pramod Panda',
    category: 'Electrician & Power Maintenance',
    zone: 'Entire Campus & Substation',
    shift: 'General Shift (08:30 AM - 05:00 PM)',
    phone: '+91 94378 99120',
    emergencyDuty: 'Yes (On-Call 24x7)',
    qualification: 'ITI Electrical, Govt Certified',
    status: 'Active',
  },
  {
    id: 'STF-02',
    name: 'Suresh Mohapatra',
    category: 'Plumber & Water Works',
    zone: 'Hostels & Academic Blocks',
    shift: 'Morning Shift (07:00 AM - 03:30 PM)',
    phone: '+91 94379 11231',
    emergencyDuty: 'Yes',
    qualification: 'ITI Plumbing & Water Fitting',
    status: 'Active',
  },
  {
    id: 'STF-03',
    name: 'Laxmi Parida',
    category: 'Housekeeping Supervisor',
    zone: 'Sarojini Girls Residence & Block A',
    shift: 'Morning Shift (06:30 AM - 03:00 PM)',
    phone: '+91 94380 22342',
    emergencyDuty: 'No',
    qualification: 'Senior Facility Operations',
    status: 'Active',
  },
  {
    id: 'STF-04',
    name: 'Gopal Charan Das',
    category: 'Housekeeping Supervisor',
    zone: 'Gandhi Boys Residence & Block B',
    shift: 'Morning Shift (06:30 AM - 03:00 PM)',
    phone: '+91 94381 33453',
    emergencyDuty: 'No',
    qualification: 'Senior Facility Operations',
    status: 'Active',
  },
  {
    id: 'STF-05',
    name: 'Tapan Barik',
    category: 'Senior Lab Technician',
    zone: 'Computer Science Labs (Lab 1 - 4)',
    shift: 'General Shift (09:00 AM - 05:30 PM)',
    phone: '+91 94382 44564',
    emergencyDuty: 'No',
    qualification: 'Diploma in Computer Science & Networking',
    status: 'Active',
  },
  {
    id: 'STF-06',
    name: 'Hemant Tripathy',
    category: 'Senior Library Attendant',
    zone: 'Central Knowledge Resource Center',
    shift: 'Evening Shift (01:00 PM - 09:00 PM)',
    phone: '+91 94383 55675',
    emergencyDuty: 'No',
    qualification: 'Bachelor of Library Science (B.Lib)',
    status: 'Active',
  },
  {
    id: 'STF-07',
    name: 'Bijay Kumar Mallick',
    category: 'Transport & Bus Supervisor',
    zone: 'Fleet Parking & Logistics Depot',
    shift: 'Split Shift (06:30 AM - 10:30 AM & 04:00 PM - 08:00 PM)',
    phone: '+91 94384 66786',
    emergencyDuty: 'Yes',
    qualification: 'Heavy Vehicle Commercial License',
    status: 'Active',
  },
];

