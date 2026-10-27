import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive Autonomous College ERP database seeding...');
  const salt = await bcrypt.genSalt(10);
  const defaultHash = await bcrypt.hash('gift123', salt);

  // 1. Seed Users (14 Dedicated Roles + Quick Demo Aliases)
  const usersToCreate = [
    // 1. Super Admin
    {
      identifier: 'SA-001',
      email: 'superadmin@gift.edu.in',
      name: 'Er. Bikramaditya Patra',
      role: Role.SUPER_ADMIN,
      department: 'Office of Information Technology',
      designation: 'Chief Enterprise Systems Architect',
      detail: 'Root System & Security Administrator',
      phone: '+91 94370 00001',
      passwordHash: defaultHash,
      permissions: ['*'],
    },
    {
      identifier: 'superadmin',
      email: 'superadmin.demo@gift.edu.in',
      name: 'Er. Bikramaditya Patra',
      role: Role.SUPER_ADMIN,
      department: 'Office of Information Technology',
      designation: 'Chief Enterprise Systems Architect',
      detail: 'Root System & Security Administrator',
      phone: '+91 94370 00001',
      passwordHash: defaultHash,
      permissions: ['*'],
    },

    // 2. Management
    {
      identifier: 'MGMT-001',
      email: 'management@gift.edu.in',
      name: 'Shri Patitapaban Panda',
      role: Role.MANAGEMENT,
      department: 'Governing Body & Trust Board',
      designation: 'Managing Trustee',
      detail: 'Institutional Governance & Oversight',
      phone: '+91 94370 00002',
      passwordHash: defaultHash,
    },
    {
      identifier: 'management',
      email: 'management.demo@gift.edu.in',
      name: 'Shri Patitapaban Panda',
      role: Role.MANAGEMENT,
      department: 'Governing Body & Trust Board',
      designation: 'Managing Trustee',
      detail: 'Institutional Governance & Oversight',
      phone: '+91 94370 00002',
      passwordHash: defaultHash,
    },

    // 3. Principal
    {
      identifier: 'DIR-001',
      email: 'principal@gift.edu.in',
      name: 'Dr. Sujit Kumar Khuntia',
      role: Role.PRINCIPAL,
      department: 'Office of the Principal',
      designation: 'Principal & Director',
      detail: 'Academic Council & Executive Head',
      phone: '+91 94370 00003',
      passwordHash: defaultHash,
    },
    {
      identifier: 'principal',
      email: 'principal.demo@gift.edu.in',
      name: 'Dr. Sujit Kumar Khuntia',
      role: Role.PRINCIPAL,
      department: 'Office of the Principal',
      designation: 'Principal & Director',
      detail: 'Academic Council & Executive Head',
      phone: '+91 94370 00003',
      passwordHash: defaultHash,
    },

    // 4. Admin Ops
    {
      identifier: 'ADM-001',
      email: 'admin@gift.edu.in',
      name: 'Sri Manoranjan Tripathy',
      role: Role.ADMIN,
      department: 'Administrative Operations',
      designation: 'Chief Administrative Officer',
      detail: 'Admissions, Records & Campus Services',
      phone: '+91 94370 00004',
      passwordHash: defaultHash,
    },
    {
      identifier: 'admin',
      email: 'admin.demo@gift.edu.in',
      name: 'Sri Manoranjan Tripathy',
      role: Role.ADMIN,
      department: 'Administrative Operations',
      designation: 'Chief Administrative Officer',
      detail: 'Admissions, Records & Campus Services',
      phone: '+91 94370 00004',
      passwordHash: defaultHash,
    },

    // 5. HOD
    {
      identifier: 'HOD-CSE',
      email: 'hod@gift.edu.in',
      name: 'Dr. P. K. Pattnaik',
      role: Role.HOD,
      department: 'Computer Science & Engineering',
      designation: 'Professor & Head of Department',
      detail: 'Department Administrator · CSE',
      phone: '+91 94370 00005',
      passwordHash: defaultHash,
    },
    {
      identifier: 'hod',
      email: 'hod.demo@gift.edu.in',
      name: 'Dr. P. K. Pattnaik',
      role: Role.HOD,
      department: 'Computer Science & Engineering',
      designation: 'Professor & Head of Department',
      detail: 'Department Administrator · CSE',
      phone: '+91 94370 00005',
      passwordHash: defaultHash,
    },

    // 6. Faculty
    {
      identifier: 'FAC-042',
      email: 'faculty@gift.edu.in',
      name: 'Dr. S. Mohanty',
      role: Role.FACULTY,
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      detail: 'Faculty · School of Computing',
      phone: '+91 94370 00006',
      passwordHash: defaultHash,
    },
    {
      identifier: 'faculty',
      email: 'faculty.demo@gift.edu.in',
      name: 'Dr. S. Mohanty',
      role: Role.FACULTY,
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      detail: 'Faculty · School of Computing',
      phone: '+91 94370 00006',
      passwordHash: defaultHash,
    },

    // 7. Student
    {
      identifier: '2305201001',
      email: 'student@gift.edu.in',
      name: 'Rakesh Das',
      role: Role.STUDENT,
      department: 'Computer Science & Engineering',
      designation: 'Student',
      detail: 'B.Tech Semester 5 · Section A',
      phone: '+91 98610 23010',
      passwordHash: defaultHash,
    },
    {
      identifier: 'student',
      email: 'student.demo@gift.edu.in',
      name: 'Rakesh Das',
      role: Role.STUDENT,
      department: 'Computer Science & Engineering',
      designation: 'Student',
      detail: 'B.Tech Semester 5 · Section A',
      phone: '+91 98610 23010',
      passwordHash: defaultHash,
    },

    // 8. Exam Cell
    {
      identifier: 'EXAM-001',
      email: 'examcell@gift.edu.in',
      name: 'Prof. S. R. Mahapatra',
      role: Role.EXAM_CELL,
      department: 'Autonomous Examination Cell',
      designation: 'Controller of Examinations',
      detail: 'Autonomous Question Papers, Moderation & Results',
      phone: '+91 94370 00008',
      passwordHash: defaultHash,
    },
    {
      identifier: 'examcell',
      email: 'examcell.demo@gift.edu.in',
      name: 'Prof. S. R. Mahapatra',
      role: Role.EXAM_CELL,
      department: 'Autonomous Examination Cell',
      designation: 'Controller of Examinations',
      detail: 'Autonomous Question Papers, Moderation & Results',
      phone: '+91 94370 00008',
      passwordHash: defaultHash,
    },

    // 9. Accounts
    {
      identifier: 'ACC-012',
      email: 'accounts@gift.edu.in',
      name: 'Mr. S. K. Roy',
      role: Role.ACCOUNTS,
      department: 'Finance & Accounts Division',
      designation: 'Senior Accounts Officer',
      detail: 'Fee Collection, Concessions & Scholarships',
      phone: '+91 94370 00009',
      passwordHash: defaultHash,
    },
    {
      identifier: 'accounts',
      email: 'accounts.demo@gift.edu.in',
      name: 'Mr. S. K. Roy',
      role: Role.ACCOUNTS,
      department: 'Finance & Accounts Division',
      designation: 'Senior Accounts Officer',
      detail: 'Fee Collection, Concessions & Scholarships',
      phone: '+91 94370 00009',
      passwordHash: defaultHash,
    },

    // 10. Library
    {
      identifier: 'LIB-001',
      email: 'library@gift.edu.in',
      name: 'Dr. Bhabani Shankar Dash',
      role: Role.LIBRARY,
      department: 'Central Knowledge Resource Centre',
      designation: 'Chief Librarian',
      detail: 'KOHA Catalog, Digital Repository & RFID Circulation',
      phone: '+91 94370 00010',
      passwordHash: defaultHash,
    },
    {
      identifier: 'library',
      email: 'library.demo@gift.edu.in',
      name: 'Dr. Bhabani Shankar Dash',
      role: Role.LIBRARY,
      department: 'Central Knowledge Resource Centre',
      designation: 'Chief Librarian',
      detail: 'KOHA Catalog, Digital Repository & RFID Circulation',
      phone: '+91 94370 00010',
      passwordHash: defaultHash,
    },

    // 11. Placement
    {
      identifier: 'TPO-001',
      email: 'placement@gift.edu.in',
      name: 'Mr. Ashutosh Nayak',
      role: Role.PLACEMENT,
      department: 'Training & Corporate Relations',
      designation: 'Head - Training & Placements',
      detail: 'Campus Recruitment Drives, Shortlisting & Offers',
      phone: '+91 94370 00011',
      passwordHash: defaultHash,
    },
    {
      identifier: 'placement',
      email: 'placement.demo@gift.edu.in',
      name: 'Mr. Ashutosh Nayak',
      role: Role.PLACEMENT,
      department: 'Training & Corporate Relations',
      designation: 'Head - Training & Placements',
      detail: 'Campus Recruitment Drives, Shortlisting & Offers',
      phone: '+91 94370 00011',
      passwordHash: defaultHash,
    },

    // 12. Transport
    {
      identifier: 'TRN-001',
      email: 'transport@gift.edu.in',
      name: 'Mr. Kailash Ch. Mishra',
      role: Role.TRANSPORT,
      department: 'Campus Logistics & Fleet Operations',
      designation: 'Transport Fleet Supervisor',
      detail: '36 Fleet Buses, GPS Tracking & Pass Allocations',
      phone: '+91 94370 00012',
      passwordHash: defaultHash,
    },
    {
      identifier: 'transport',
      email: 'transport.demo@gift.edu.in',
      name: 'Mr. Kailash Ch. Mishra',
      role: Role.TRANSPORT,
      department: 'Campus Logistics & Fleet Operations',
      designation: 'Transport Fleet Supervisor',
      detail: '36 Fleet Buses, GPS Tracking & Pass Allocations',
      phone: '+91 94370 00012',
      passwordHash: defaultHash,
    },

    // 13. Hostel
    {
      identifier: 'HSTL-001',
      email: 'hostel@gift.edu.in',
      name: 'Mrs. Nibedita Das',
      role: Role.HOSTEL,
      department: 'Hostel Administration',
      designation: 'Chief Resident Warden',
      detail: 'Residences, Room Allocation, Biometric Passes',
      phone: '+91 94370 33445',
      passwordHash: defaultHash,
    },
    {
      identifier: 'hostel',
      email: 'hostel.demo@gift.edu.in',
      name: 'Mrs. Nibedita Das',
      role: Role.HOSTEL,
      department: 'Hostel Administration',
      designation: 'Chief Resident Warden',
      detail: 'Residences, Room Allocation, Biometric Passes',
      phone: '+91 94370 33445',
      passwordHash: defaultHash,
    },
    {
      identifier: 'warden',
      email: 'warden.demo@gift.edu.in',
      name: 'Mrs. Nibedita Das',
      role: Role.WARDEN,
      department: 'Hostel Administration',
      designation: 'Chief Resident Warden',
      detail: 'Residences, Room Allocation, Biometric Passes',
      phone: '+91 94370 33445',
      passwordHash: defaultHash,
    },

    // 14. Staff (Labs)
    {
      identifier: 'LAB-001',
      email: 'staff@gift.edu.in',
      name: 'Mr. Debasis Rout',
      role: Role.STAFF,
      department: 'Central Laboratories & Computing Complex',
      designation: 'Senior Lab Systems Engineer',
      detail: 'High Performance Computing Labs, Equipment & Safety',
      phone: '+91 94370 00014',
      passwordHash: defaultHash,
    },
    {
      identifier: 'staff',
      email: 'staff.demo@gift.edu.in',
      name: 'Mr. Debasis Rout',
      role: Role.STAFF,
      department: 'Central Laboratories & Computing Complex',
      designation: 'Senior Lab Systems Engineer',
      detail: 'High Performance Computing Labs, Equipment & Safety',
      phone: '+91 94370 00014',
      passwordHash: defaultHash,
    },
    {
      identifier: 'canteen',
      email: 'canteen.demo@gift.edu.in',
      name: 'Mr. B. K. Sahoo',
      role: Role.CANTEEN,
      department: 'Hospitality & Dining',
      designation: 'Smart Canteen Supervisor',
      detail: 'Campus Food Court & Smart RFID Dining',
      phone: '+91 94370 00015',
      passwordHash: defaultHash,
    },

    // 15. Admissions Staff
    {
      identifier: 'ADM-OFF-01',
      email: 'admissions@gift.edu.in',
      name: 'Ms. Sasmita Mohapatra',
      role: Role.ADMISSIONS,
      department: 'Admissions & Student Intake Office',
      designation: 'Senior Admissions Officer',
      detail: 'Counseling, Verification & Enrollment',
      phone: '+91 94370 00016',
      passwordHash: defaultHash,
      permissions: ['admission.view', 'admission.verify', 'admission.approve', 'students.create'],
    },
    {
      identifier: 'admissions',
      email: 'admissions.demo@gift.edu.in',
      name: 'Ms. Sasmita Mohapatra',
      role: Role.ADMISSIONS,
      department: 'Admissions & Student Intake Office',
      designation: 'Senior Admissions Officer',
      detail: 'Counseling, Verification & Enrollment',
      phone: '+91 94370 00016',
      passwordHash: defaultHash,
      permissions: ['admission.view', 'admission.verify', 'admission.approve', 'students.create'],
    },

    // 16. Maintenance Staff
    {
      identifier: 'MTN-OPS-01',
      email: 'maintenance@gift.edu.in',
      name: 'Mr. Pradeep Kumar Barik',
      role: Role.MAINTENANCE,
      department: 'Estate Maintenance & Civil Works',
      designation: 'Estate Maintenance Supervisor',
      detail: 'Plumbing, Electrical, Civil & Repairs',
      phone: '+91 94370 00017',
      passwordHash: defaultHash,
      permissions: ['complaints.view', 'complaints.update', 'maintenance.manage'],
    },
    {
      identifier: 'maintenance',
      email: 'maintenance.demo@gift.edu.in',
      name: 'Mr. Pradeep Kumar Barik',
      role: Role.MAINTENANCE,
      department: 'Estate Maintenance & Civil Works',
      designation: 'Estate Maintenance Supervisor',
      detail: 'Plumbing, Electrical, Civil & Repairs',
      phone: '+91 94370 00017',
      passwordHash: defaultHash,
      permissions: ['complaints.view', 'complaints.update', 'maintenance.manage'],
    },

    // 17. Non-teaching Staff
    {
      identifier: 'NT-OFF-01',
      email: 'nonteaching@gift.edu.in',
      name: 'Mr. Ramesh Chandra Jena',
      role: Role.NON_TEACHING,
      department: 'General Administrative Services',
      designation: 'Administrative Officer',
      detail: 'Records, Despatch & Campus Coordination',
      phone: '+91 94370 00018',
      passwordHash: defaultHash,
      permissions: ['records.view', 'general.manage'],
    },
    {
      identifier: 'non_teaching',
      email: 'nonteaching.demo@gift.edu.in',
      name: 'Mr. Ramesh Chandra Jena',
      role: Role.NON_TEACHING,
      department: 'General Administrative Services',
      designation: 'Administrative Officer',
      detail: 'Records, Despatch & Campus Coordination',
      phone: '+91 94370 00018',
      passwordHash: defaultHash,
      permissions: ['records.view', 'general.manage'],
    },
  ];

  for (const u of usersToCreate) {
    await prisma.user.upsert({
      where: { identifier: u.identifier },
      update: {
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        department: u.department,
        designation: u.designation,
        phone: u.phone,
        detail: u.detail,
      },
      create: u,
    });
  }

  // 2. Seed Departments
  const departments = [
    { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. P. K. Pattnaik', hodEmail: 'hod.cse@gift.edu.in', studentsCount: 540, facultyCount: 32, subjectsCount: 48, status: 'Active' },
    { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', hod: 'Dr. S. K. Swain', hodEmail: 'hod.aiml@gift.edu.in', studentsCount: 360, facultyCount: 22, subjectsCount: 38, status: 'Active' },
    { code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. M. R. Senapati', hodEmail: 'hod.ece@gift.edu.in', studentsCount: 380, facultyCount: 24, subjectsCount: 36, status: 'Active' },
    { code: 'EEE', name: 'Electrical & Electronics', hod: 'Dr. S. K. Das', hodEmail: 'hod.eee@gift.edu.in', studentsCount: 290, facultyCount: 18, subjectsCount: 32, status: 'Active' },
    { code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. B. K. Rout', hodEmail: 'hod.mech@gift.edu.in', studentsCount: 320, facultyCount: 22, subjectsCount: 34, status: 'Active' },
    { code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. A. K. Nayak', hodEmail: 'hod.civil@gift.edu.in', studentsCount: 240, facultyCount: 16, subjectsCount: 28, status: 'Active' },
    { code: 'MBA', name: 'Master of Business Administration', hod: 'Dr. Rashmi Mohanty', hodEmail: 'hod.mba@gift.edu.in', studentsCount: 180, facultyCount: 14, subjectsCount: 24, status: 'Active' },
    { code: 'MCA', name: 'Master of Computer Applications', hod: 'Dr. T. P. Tripathy', hodEmail: 'hod.mca@gift.edu.in', studentsCount: 180, facultyCount: 12, subjectsCount: 22, status: 'Active' },
  ];
  for (const d of departments) {
    await prisma.department.upsert({
      where: { code: d.code },
      update: d,
      create: d,
    });
  }

  // 3. Seed Semesters & Sections
  for (let i = 1; i <= 8; i++) {
    await prisma.semester.upsert({
      where: { number: i },
      update: { label: `Semester ${i}`, year: i <= 2 ? '1st Year' : i <= 4 ? '2nd Year' : i <= 6 ? '3rd Year' : '4th Year' },
      create: { number: i, label: `Semester ${i}`, year: i <= 2 ? '1st Year' : i <= 4 ? '2nd Year' : i <= 6 ? '3rd Year' : '4th Year', status: i === 5 ? 'Active' : i < 5 ? 'Closed' : 'Upcoming' },
    });
  }

  // 4. Seed Subjects
  const subjects = [
    { code: 'CS501', name: 'Data Structures & Algorithms', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Dr. S. Mohanty' },
    { code: 'CS502', name: 'Operating Systems & System Kernel', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Prof. Amit Mishra' },
    { code: 'CS503', name: 'Database Management Systems', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Dr. Priya Ranjan' },
    { code: 'CS504', name: 'Artificial Intelligence & Neural Nets', department: 'CSE', semester: 'Semester 5', credits: 3, type: 'Theory', assignedFaculty: 'Dr. Sneha Ray' },
    { code: 'CS505', name: 'Machine Learning & Predictive Modeling', department: 'CSE', semester: 'Semester 5', credits: 4, type: 'Theory + Lab', assignedFaculty: 'Prof. Debashis Jena' },
    { code: 'CS506', name: 'Software Engineering & Enterprise Dev', department: 'CSE', semester: 'Semester 5', credits: 3, type: 'Theory', assignedFaculty: 'Prof. Smita Sahoo' },
  ];
  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
  }

  // 5. Seed Primary Student (Rakesh Das - Roll 01)
  const primaryStudent = await prisma.student.upsert({
    where: { rollNumber: '01' },
    update: { name: 'Rakesh Das', studentId: '2305201001', email: 'rakesh.das@gift.edu.in' },
    create: {
      studentId: '2305201001',
      rollNumber: '01',
      name: 'Rakesh Das',
      email: 'rakesh.das@gift.edu.in',
      phone: '+91 98610 23010',
      gender: 'Male',
      dob: '15-03-2005',
      bloodGroup: 'O+',
      category: 'General',
      religion: 'Hindu',
      department: 'Computer Science & Engineering',
      deptCode: 'CSE',
      semester: 'Semester 5',
      section: 'Section A',
      academicYear: '2026-27',
      status: 'Active',
      cgpa: 8.79,
      attendance: 92,
      walletBalance: 1450.0,
      hostelName: 'Sarojini Girls Residence (Block A)',
      roomNumber: '204',
      bedNumber: 'Bed 01 (Window Side)',
      floor: 'Floor 2',
      wardenName: 'Mrs. Nibedita Das',
      wardenContact: '+91 94370 33445',
    },
  });

  // Seed Guardians & Address for primary student
  await prisma.guardian.deleteMany({ where: { studentId: primaryStudent.id } });
  await prisma.guardian.createMany({
    data: [
      { studentId: primaryStudent.id, name: 'Sanjay Das', relationship: 'Father', contactNumber: '+91 94370 10001', email: 'sanjay.das@example.com' },
      { studentId: primaryStudent.id, name: 'Madhuri Das', relationship: 'Mother', contactNumber: '+91 94370 10002', email: 'madhuri.das@example.com' },
    ],
  });

  await prisma.address.deleteMany({ where: { studentId: primaryStudent.id } });
  await prisma.address.create({
    data: {
      studentId: primaryStudent.id,
      type: 'Permanent',
      addressLine: 'Plot 18, Unit 4',
      city: 'Bhubaneswar',
      state: 'Odisha',
      country: 'India',
      pincode: '751001',
    },
  });

  // 6. Seed Additional 90 Students for section A
  const studentFirstNames = ['Rakesh', 'Amit', 'Raj', 'Priya', 'Sourav', 'Sneha', 'Deepak', 'Puja', 'Bikash', 'Swati', 'Rohit', 'Monika', 'Subham', 'Ipsita', 'Alok', 'Smruti', 'Chandan', 'Tanmay', 'Lipika', 'Manas', 'Pragyan', 'Biswajit', 'Archana', 'Gourab', 'Satyajit', 'Sonali', 'Ashish', 'Kiran', 'Pranab', 'Niharika'];
  const studentLastNames = ['Das', 'Nayak', 'Sahoo', 'Patra', 'Mohanty', 'Barik', 'Rout', 'Behera', 'Pradhan', 'Samal', 'Panda', 'Mishra', 'Tripathy', 'Parida', 'Jena', 'Swain', 'Mangaraj', 'Muduli', 'Kar', 'Acharya'];

  for (let i = 2; i <= 91; i++) {
    const roll = String(i).padStart(2, '0');
    const fName = studentFirstNames[(i - 1) % studentFirstNames.length];
    const lName = studentLastNames[(i * 3) % studentLastNames.length];
    const fullName = `${fName} ${lName}`;
    const studentId = `23052010${roll}`;

    await prisma.student.upsert({
      where: { rollNumber: roll },
      update: { name: fullName, studentId },
      create: {
        studentId,
        rollNumber: roll,
        name: fullName,
        email: `${fName.toLowerCase()}.${roll}@gift.edu.in`,
        phone: `+91 98610 ${String(10000 + i)}`,
        department: 'Computer Science & Engineering',
        deptCode: 'CSE',
        semester: 'Semester 5',
        section: 'Section A',
        status: i > 85 ? 'On Leave' : 'Active',
        cgpa: Number((7.0 + ((i * 17) % 280) / 100).toFixed(2)),
        attendance: 65 + ((i * 13) % 34),
      },
    });
  }

  // 7. Seed Marking Schemes
  const schemes = [
    { assessmentType: 'Continuous Evaluation / Quizzes', count: 6, maxMarks: 30, weightage: 30, formula: 'Best 4 of 6 Quizzes' },
    { assessmentType: 'Mid-Term Modular Tests', count: 2, maxMarks: 40, weightage: 30, formula: 'Average of Modular 1 & 2' },
    { assessmentType: 'Assignments & Surprise Tests', count: 4, maxMarks: 20, weightage: 15, formula: 'Average score' },
    { assessmentType: 'Laboratory Practical & Viva', count: 1, maxMarks: 50, weightage: 25, formula: 'Practical continuous log' },
  ];
  await prisma.markingScheme.deleteMany();
  for (const s of schemes) {
    await prisma.markingScheme.create({ data: s });
  }

  // 8. Seed Approval Queue
  const queues = [
    { subjectCode: 'CS501', subject: 'Data Structures & Algorithms', faculty: 'Dr. S. Mohanty', semester: 'Semester 5', section: 'Section A', submittedDate: '02 Oct 2026', status: 'Approved', hodRemarks: 'All 91 students evaluated with proper quiz/modular breakdown.', reviewedAt: '03 Oct 2026, 11:30 AM' },
    { subjectCode: 'CS502', subject: 'Operating Systems & System Kernel', faculty: 'Prof. Amit Mishra', semester: 'Semester 5', section: 'Section A', submittedDate: '03 Oct 2026', status: 'Pending', hodRemarks: 'Under review by HOD. Quizzes 1-6 uploaded.', reviewedAt: null },
    { subjectCode: 'CS503', subject: 'Database Management Systems', faculty: 'Dr. Priya Ranjan', semester: 'Semester 5', section: 'Section A', submittedDate: '01 Oct 2026', status: 'Rejected', hodRemarks: 'Quiz 4 marks are missing for 8 students. Please complete and resubmit.', reviewedAt: '02 Oct 2026, 04:10 PM' },
    { subjectCode: 'CS504', subject: 'Artificial Intelligence & Neural Nets', faculty: 'Dr. Sneha Ray', semester: 'Semester 5', section: 'Section A', submittedDate: '03 Oct 2026', status: 'Approved', hodRemarks: 'Verified and approved for publication.', reviewedAt: '03 Oct 2026, 03:00 PM' },
  ];
  await prisma.approvalQueue.deleteMany();
  for (const q of queues) {
    await prisma.approvalQueue.create({ data: q });
  }

  // 9. Seed Fee Structures & Transactions
  await prisma.feeStructure.deleteMany();
  await prisma.feeStructure.createMany({
    data: [
      { term: 'Semester 5 (Academic Year 2026-27)', program: 'B.Tech - Computer Science', tuitionFee: 48500, developmentFee: 8500, labLibraryFee: 6000, examinationFee: 3500, hostelMessFee: 32000, total: 98500 },
      { term: 'Semester 6 (Upcoming)', program: 'B.Tech - Computer Science', tuitionFee: 48500, developmentFee: 8500, labLibraryFee: 6000, examinationFee: 3500, hostelMessFee: 32000, total: 98500 },
    ],
  });

  const txns = [
    { studentName: 'Rakesh Das', rollNumber: '01', semester: 'Semester 5', head: 'Tuition & Development Fee', amount: 48500, mode: 'Net Banking (HDFC)', date: '12 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0814' },
    { studentName: 'Rakesh Das', rollNumber: '01', semester: 'Semester 5', head: 'Examination & University Reg.', amount: 3500, mode: 'UPI', date: '15 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0852' },
    { studentName: 'Rakesh Das', rollNumber: '01', semester: 'Semester 5', head: 'Hostel & Mess Charges', amount: 20000, dueAmount: 12000, mode: 'Credit Card', date: '20 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0899' },
    { studentName: 'Amit Nayak', rollNumber: '02', semester: 'Semester 5', head: 'Full Semester Fee', amount: 98500, mode: 'Challan', date: '10 Aug 2026', status: 'Verified', receiptNo: 'RCPT-2026-0801' },
  ];
  for (const t of txns) {
    await prisma.feeTransaction.upsert({
      where: { receiptNo: t.receiptNo },
      update: t,
      create: t,
    });
  }

  // 10. Seed Exam Schedules (Exam Cell)
  await prisma.examSchedule.deleteMany();
  await prisma.examSchedule.createMany({
    data: [
      {
        examCode: 'EXAM-2026-BTECH-S5',
        title: 'B.Tech 5th Semester Autonomous Mid-Term Examination',
        semester: 'Semester 5',
        department: 'All Engineering Departments',
        session: 'Morning (10:00 AM - 01:00 PM)',
        startDate: '2026-10-15',
        endDate: '2026-10-24',
        status: 'Scheduled',
        totalAppeared: 1840,
        passPercentage: 91.4,
        hallTicketLive: true,
      },
      {
        examCode: 'EXAM-2026-BTECH-S4-SUPP',
        title: 'B.Tech 4th Semester Supplementary & Special Examination',
        semester: 'Semester 4',
        department: 'CSE / ECE / EEE',
        session: 'Afternoon (02:00 PM - 05:00 PM)',
        startDate: '2026-09-10',
        endDate: '2026-09-18',
        status: 'Results Published',
        totalAppeared: 142,
        passPercentage: 88.7,
        hallTicketLive: true,
      },
    ],
  });

  // 11. Seed Library Catalog & Transactions (Library)
  await prisma.libraryBook.deleteMany();
  await prisma.libraryBook.createMany({
    data: [
      { isbn: '978-0131103627', title: 'The C Programming Language (2nd Ed)', author: 'Brian W. Kernighan & Dennis M. Ritchie', department: 'CSE', category: 'Textbook', totalCopies: 25, availableCopies: 18, shelfLocation: 'Stack CSE-01' },
      { isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS 3rd Ed)', author: 'Thomas H. Cormen, Charles E. Leiserson', department: 'CSE', category: 'Reference', totalCopies: 30, availableCopies: 22, shelfLocation: 'Stack CSE-03' },
      { isbn: '978-0136006633', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', department: 'AIML', category: 'Textbook', totalCopies: 20, availableCopies: 14, shelfLocation: 'Stack AI-02' },
      { isbn: '978-0070144934', title: 'Digital Design & Computer Architecture', author: 'M. Morris Mano', department: 'ECE', category: 'Core', totalCopies: 15, availableCopies: 11, shelfLocation: 'Stack EC-01' },
      { isbn: '978-8120340077', title: 'Modern Power System Analysis', author: 'D. P. Kothari & I. J. Nagrath', department: 'EEE', category: 'Textbook', totalCopies: 18, availableCopies: 15, shelfLocation: 'Stack EE-04' },
    ],
  });

  await prisma.libraryTransaction.deleteMany();
  await prisma.libraryTransaction.createMany({
    data: [
      { bookId: 'b1', bookTitle: 'Introduction to Algorithms (CLRS 3rd Ed)', studentRoll: '01', studentName: 'Rakesh Das', issueDate: '2026-09-20', dueDate: '2026-10-10', fineAmount: 0, status: 'Issued' },
      { bookId: 'b2', bookTitle: 'Artificial Intelligence: A Modern Approach', studentRoll: '01', studentName: 'Rakesh Das', issueDate: '2026-08-15', dueDate: '2026-09-05', returnDate: '2026-09-04', fineAmount: 0, status: 'Returned' },
      { bookId: 'b3', bookTitle: 'The C Programming Language (2nd Ed)', studentRoll: '02', studentName: 'Amit Nayak', issueDate: '2026-09-22', dueDate: '2026-10-12', fineAmount: 0, status: 'Issued' },
    ],
  });

  // 12. Seed Placement Drives (Placement)
  await prisma.placementDrive.deleteMany();
  await prisma.placementDrive.createMany({
    data: [
      { companyName: 'Tata Consultancy Services (TCS Digital)', roleTitle: 'System Engineer / Digital Specialist', packageLPA: 7.5, minCgpa: 7.0, eligibleBranches: ['CSE', 'AIML', 'ECE'], driveDate: '2026-10-28', venue: 'Central Auditorium', registeredCount: 210, shortlistedCount: 84, selectedCount: 28, status: 'Open' },
      { companyName: 'Infosys (Power Programmer)', roleTitle: 'Specialist Programmer', packageLPA: 9.5, minCgpa: 7.5, eligibleBranches: ['CSE', 'AIML'], driveDate: '2026-11-04', venue: 'Online Assessment Labs', registeredCount: 165, shortlistedCount: 42, selectedCount: 14, status: 'Open' },
      { companyName: 'L&T Technology Services', roleTitle: 'Graduate Engineer Trainee', packageLPA: 6.0, minCgpa: 6.5, eligibleBranches: ['ECE', 'EEE', 'MECH', 'CIVIL'], driveDate: '2026-11-12', venue: 'Seminar Hall 1', registeredCount: 180, shortlistedCount: 60, selectedCount: 22, status: 'Open' },
      { companyName: 'Deloitte USI', roleTitle: 'Analyst - Technology Consulting', packageLPA: 8.2, minCgpa: 7.2, eligibleBranches: ['CSE', 'AIML', 'ECE', 'MCA'], driveDate: '2026-10-18', venue: 'Corporate Placement Hall', registeredCount: 240, shortlistedCount: 95, selectedCount: 31, status: 'Ongoing' },
    ],
  });

  // 13. Seed Transport Routes (Transport)
  await prisma.transportRoute.deleteMany();
  await prisma.transportRoute.createMany({
    data: [
      { routeNumber: 'RT-01', routeName: 'Cuttack Badambadi via NH-16 to Campus', busNumber: 'OD-02-AK-4401', driverName: 'Bikram Sahu', driverContact: '+91 94371 11221', totalCapacity: 52, allocatedCount: 48, departureTime: '06:45 AM', stops: ['Badambadi Bus Stand', 'Link Road Cuttack', 'Phulnakhara Toll', 'Hanspal', 'Rasulgarh Square', 'GIFT Campus'], status: 'Active' },
      { routeNumber: 'RT-02', routeName: 'Bhubaneswar Master Canteen to Campus', busNumber: 'OD-02-BM-8822', driverName: 'Niranjan Swain', driverContact: '+91 94371 22332', totalCapacity: 52, allocatedCount: 50, departureTime: '07:15 AM', stops: ['Master Canteen', 'Rajmahal', 'Kalpana Square', 'Ravi Talkies', 'Samantarapur', 'GIFT Campus'], status: 'Active' },
      { routeNumber: 'RT-03', routeName: 'Khandagiri & Patia Infocity to Campus', busNumber: 'OD-02-CP-1903', driverName: 'Santosh Behera', driverContact: '+91 94371 33443', totalCapacity: 52, allocatedCount: 44, departureTime: '07:00 AM', stops: ['KIIT Square', 'Damana', 'Jaydev Vihar', 'Fire Station', 'Khandagiri', 'GIFT Campus'], status: 'Active' },
      { routeNumber: 'RT-04', routeName: 'Khordha Town to Campus Direct Route', busNumber: 'OD-02-DX-5510', driverName: 'Gopinath Jena', driverContact: '+91 94371 44554', totalCapacity: 45, allocatedCount: 38, departureTime: '07:30 AM', stops: ['Khordha Bus Stand', 'New Bus Stand', 'Palla Toll Gate', 'Jatani Gate', 'GIFT Campus'], status: 'Active' },
    ],
  });

  // 14. Seed Lab Equipment (Staff / Labs)
  await prisma.labEquipment.deleteMany();
  await prisma.labEquipment.createMany({
    data: [
      { equipmentCode: 'EQ-CSE-01', equipmentName: 'NVIDIA DGX A100 Deep Learning Server Cluster', labName: 'Advanced AI & Deep Learning Research Lab', department: 'CSE', condition: 'Operational', lastServiced: '2026-09-15', inCharge: 'Dr. Sneha Ray' },
      { equipmentCode: 'EQ-CSE-02', equipmentName: 'Cisco Catalyst 3850 GigE Switch Racks', labName: 'Computer Networks & Security Lab', department: 'CSE', condition: 'Operational', lastServiced: '2026-08-20', inCharge: 'Prof. Amit Mishra' },
      { equipmentCode: 'EQ-ECE-01', equipmentName: 'Rohde & Schwarz 1GHz Digital Storage Oscilloscope', labName: 'VLSI & Embedded Systems Laboratory', department: 'ECE', condition: 'Operational', lastServiced: '2026-09-10', inCharge: 'Dr. M. R. Senapati' },
      { equipmentCode: 'EQ-MECH-01', equipmentName: 'Universal Testing Machine (UTM 100 Ton)', labName: 'Strength of Materials Laboratory', department: 'MECH', condition: 'Maintenance Required', lastServiced: '2026-07-12', inCharge: 'Dr. B. K. Rout' },
    ],
  });

  // 15. Seed System Settings & Workflow
  await prisma.systemSetting.deleteMany();
  await prisma.systemSetting.createMany({
    data: [
      { key: 'ACADEMIC_YEAR', value: '2026-27', category: 'Academic' },
      { key: 'CURRENT_SEMESTER', value: 'Odd Semester (3rd, 5th, 7th)', category: 'Academic' },
      { key: 'AUTONOMOUS_REGULATION', value: 'APNA CAMPUS Regulation 2024 (CBCS)', category: 'Academic' },
      { key: 'MIN_ATTENDANCE_PERCENT', value: '75', category: 'Policy' },
      { key: 'MAX_CONTINUOUS_MARKS', value: '40', category: 'Exam' },
      { key: 'END_SEM_WEIGHTAGE', value: '60', category: 'Exam' },
      { key: 'CAMPUS_NAME', value: 'APNA CAMPUS (Autonomous Institution)', category: 'General' },
      { key: 'AFFILIATING_UNIVERSITY', value: 'Biju Patnaik University of Technology (BPUT)', category: 'General' },
    ],
  });

  await prisma.workflowRequest.deleteMany();
  await prisma.workflowRequest.createMany({
    data: [
      {
        workflowType: 'LEAVE',
        title: 'Faculty Medical Leave Application (3 Days)',
        requesterId: 'f1',
        requesterName: 'Dr. S. Mohanty',
        requesterRole: 'FACULTY',
        department: 'Computer Science & Engineering',
        details: { fromDate: '2026-10-18', toDate: '2026-10-20', substituteFaculty: 'Prof. Amit Mishra' },
        currentStage: 'HOD_REVIEW',
        status: 'Pending',
      },
      {
        workflowType: 'MARKS_MODERATION',
        title: 'Semester 5 CS501 Data Structures Continuous Evaluation Moderation',
        requesterId: 'f1',
        requesterName: 'Dr. S. Mohanty',
        requesterRole: 'FACULTY',
        department: 'Computer Science & Engineering',
        details: { subjectCode: 'CS501', section: 'Section A', studentCount: 91 },
        currentStage: 'EXAM_CELL_AUDIT',
        status: 'Approved',
        approverName: 'Dr. P. K. Pattnaik (HOD CSE)',
      },
    ],
  });

  // 11. Seed Campus Staff Roster (Plumbers, Electricians, Cleaning, Maintenance, IT)
  await prisma.staffRoster.deleteMany();
  await prisma.staffRoster.createMany({
    data: [
      {
        id: 'STF-PLUMB-01',
        staffType: 'SUPPORT',
        name: 'Suresh Mohapatra',
        gender: 'Male',
        roleOrCategory: 'Plumber & Water Works',
        speciality: 'Plumbing & Sanitary Systems',
        outletOrZone: 'Hostels & Academic Blocks',
        roomOffice: 'Central Maintenance Yard #03',
        phone: '+91 94379 11231',
        email: 'suresh.plumber@apnacampus.edu.in',
        shift: 'Morning Shift (07:00 AM - 03:30 PM)',
        status: 'Active',
        qualification: 'ITI Plumbing & Water Fitting (Govt Certified)',
      },
      {
        id: 'STF-PLUMB-02',
        staffType: 'SUPPORT',
        name: 'Bikram Keshari Jena',
        gender: 'Male',
        roleOrCategory: 'Plumber & Water Works',
        speciality: 'Plumbing',
        outletOrZone: 'Boys & Girls Residences',
        roomOffice: 'Hostel Maintenance Cell',
        phone: '+91 94379 11232',
        email: 'bikram.plumber@apnacampus.edu.in',
        shift: 'Evening Shift (01:00 PM - 09:00 PM)',
        status: 'Active',
        qualification: 'ITI Pipe & Drainage Engineering',
      },
      {
        id: 'STF-ELEC-01',
        staffType: 'SUPPORT',
        name: 'Pramod Panda',
        gender: 'Male',
        roleOrCategory: 'Electrician & Power Maintenance',
        speciality: 'Electrical & Substation',
        outletOrZone: 'Entire Campus & Power Substation',
        roomOffice: 'Substation Control Room',
        phone: '+91 94378 99120',
        email: 'pramod.electrician@apnacampus.edu.in',
        shift: 'General Shift (08:30 AM - 05:00 PM)',
        status: 'Active',
        qualification: 'ITI Electrical & Industrial Wiring',
      },
      {
        id: 'STF-ELEC-02',
        staffType: 'SUPPORT',
        name: 'Manas Ranjan Sahu',
        gender: 'Male',
        roleOrCategory: 'Electrician & Power Maintenance',
        speciality: 'Electrical Appliances',
        outletOrZone: 'Hostel Wings & Mess Blocks',
        roomOffice: 'Electrical Bay B-02',
        phone: '+91 94378 99121',
        email: 'manas.electrician@apnacampus.edu.in',
        shift: 'Afternoon Shift (12:00 PM - 08:30 PM)',
        status: 'Active',
        qualification: 'Diploma in Electrical Engineering',
      },
      {
        id: 'STF-CLEAN-01',
        staffType: 'SUPPORT',
        name: 'Laxmi Parida',
        gender: 'Female',
        roleOrCategory: 'Housekeeping Supervisor',
        speciality: 'Cleaning & Sanitation',
        outletOrZone: 'Sarojini Girls Residence & Block A',
        roomOffice: 'Housekeeping Desk G-01',
        phone: '+91 94380 22342',
        email: 'laxmi.clean@apnacampus.edu.in',
        shift: 'Morning Shift (06:30 AM - 03:00 PM)',
        status: 'Active',
        qualification: 'Senior Facility Management Certificate',
      },
      {
        id: 'STF-CLEAN-02',
        staffType: 'SUPPORT',
        name: 'Gopal Charan Das',
        gender: 'Male',
        roleOrCategory: 'Housekeeping Supervisor',
        speciality: 'Cleaning & Waste Management',
        outletOrZone: 'Gandhi Boys Residence & Block B',
        roomOffice: 'Housekeeping Desk B-01',
        phone: '+91 94381 33453',
        email: 'gopal.clean@apnacampus.edu.in',
        shift: 'Morning Shift (06:30 AM - 03:00 PM)',
        status: 'Active',
        qualification: 'Certified Campus Sanitation Lead',
      },
      {
        id: 'STF-MAINT-01',
        staffType: 'SUPPORT',
        name: 'Santosh Kumar Swain',
        gender: 'Male',
        roleOrCategory: 'Civil & Carpentry Maintenance',
        speciality: 'Maintenance & Furniture',
        outletOrZone: 'Campus Wide Buildings',
        roomOffice: 'Carpentry & Civil Workshop #01',
        phone: '+91 94382 77881',
        email: 'santosh.carpenter@apnacampus.edu.in',
        shift: 'General Shift (08:30 AM - 05:00 PM)',
        status: 'Active',
        qualification: 'Vocational Carpentry & Civil Works',
      },
      {
        id: 'STF-IT-01',
        staffType: 'SUPPORT',
        name: 'Tapan Barik',
        gender: 'Male',
        roleOrCategory: 'Senior Lab & Network Technician',
        speciality: 'Internet/IT & Lab Systems',
        outletOrZone: 'Computer Science Labs & Hostel Wi-Fi',
        roomOffice: 'Server Room & Lab Complex 2',
        phone: '+91 94382 44564',
        email: 'tapan.it@apnacampus.edu.in',
        shift: 'General Shift (09:00 AM - 05:30 PM)',
        status: 'Active',
        qualification: 'B.Sc IT & Cisco CCNA Certified',
      },
    ],
  });

  // 12. Seed Demonstration AI-Assigned Complaints with 72h Deadline & Escalation Workflow
  await prisma.hostelComplaint.deleteMany();
  await prisma.hostelComplaint.createMany({
    data: [
      {
        id: 'CMP-2026-101',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Room 204 Attached Bathroom',
        category: 'Plumbing',
        predictedCategory: 'plumbing',
        confidence: 0.88,
        needsReview: false,
        title: 'Water tap leaking continuously in bathroom',
        description: 'The bathroom wash basin tap is broken at the valve and dripping water constantly.',
        priority: 'High',
        status: 'In Progress',
        assignedStaffId: 'STF-PLUMB-01',
        assignedStaffName: 'Suresh Mohapatra',
        assignedStaffPhone: '+91 94379 11231',
        assignedStaffRole: 'Plumber & Water Works',
        assignedAt: new Date(Date.now() - 3600000 * 24),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 48), // 48 hours remaining
        isEscalated: false,
        filedDate: '10 Oct 2026',
        resolutionNotes: 'Assigned to Suresh Mohapatra. Ceramic washer replacement scheduled for 11:30 AM.',
        statusHistory: [
          { id: 'h-101-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), remarks: 'Complaint registered. Routed to Warden Mrs. Nibedita Das. 72h deadline set.' },
          { id: 'h-101-2', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'Suresh Mohapatra', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), remarks: 'Work execution started. Replacement parts procured.' }
        ]
      },
      {
        id: 'CMP-2026-102',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Study Area Desk #02',
        category: 'Electrical',
        predictedCategory: 'electrical',
        confidence: 0.82,
        needsReview: false,
        title: 'Ceiling fan making screeching noise',
        description: 'The ceiling fan bearing has deteriorated and makes a loud squeaking sound on speed 4 and 5.',
        priority: 'Medium',
        status: 'Assigned',
        assignedStaffId: 'STF-ELEC-01',
        assignedStaffName: 'Pramod Panda',
        assignedStaffPhone: '+91 94378 99120',
        assignedStaffRole: 'Electrician & Power Maintenance',
        assignedAt: new Date(Date.now() - 3600000 * 4),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 68), // 68 hours remaining
        isEscalated: false,
        filedDate: '10 Oct 2026',
        resolutionNotes: 'Allocated to Pramod Panda based on lowest pending electrical workload.',
        statusHistory: [
          { id: 'h-102-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), remarks: 'Complaint submitted and auto-assigned.' }
        ]
      },
      {
        id: 'CMP-2026-103',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Balcony Door Hinge',
        category: 'Civil Works',
        predictedCategory: 'civil',
        confidence: 0.94,
        needsReview: false,
        title: 'Balcony door latch loose and rattling',
        description: 'Metal latch bracket screws came loose in high winds and the latch rattles continuously.',
        priority: 'Medium',
        status: 'Awaiting Student Verification',
        assignedStaffId: 'STF-CARP-01',
        assignedStaffName: 'Manoj Kumar Barik',
        assignedStaffPhone: '+91 94379 77210',
        assignedStaffRole: 'Carpentry & Metal Works',
        assignedAt: new Date(Date.now() - 3600000 * 30),
        workCompletedAt: new Date(Date.now() - 3600000 * 2),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 42),
        isEscalated: false,
        filedDate: '09 Oct 2026',
        resolutionNotes: 'Replaced anchor screws and aligned striker plate. Awaiting student verification.',
        statusHistory: [
          { id: 'h-103-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 30).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-103-2', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), remarks: 'Inspected and repaired.' },
          { id: 'h-103-3', fromStatus: 'In Progress', toStatus: 'Awaiting Student Verification', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), remarks: 'Work marked complete by technician. Sent student verification prompt.' }
        ]
      },
      {
        id: 'CMP-2026-104',
        studentName: 'Amit Nayak',
        rollNumber: '02',
        hostel: 'Gandhi Boys Residence',
        roomNumber: '102',
        location: 'Room 102 Electrical Switchboard',
        category: 'Electrical',
        predictedCategory: 'electrical',
        confidence: 0.95,
        needsReview: false,
        title: 'Geyser MCB trip circuit breaker burning smell',
        description: 'Frequent tripping of geyser 16A circuit breaker with mild burning insulation smell.',
        priority: 'High',
        status: 'Escalated',
        assignedStaffId: 'STF-ELEC-01',
        assignedStaffName: 'Pramod Panda',
        assignedStaffPhone: '+91 94378 99120',
        assignedStaffRole: 'Electrician & Power Maintenance',
        assignedAt: new Date(Date.now() - 3600000 * 80),
        assignedWardenId: 'WRD-B01',
        assignedWardenName: 'Mr. Rajesh Jena',
        assignedWardenContact: '+91 94370 11223',
        resolutionDeadline: new Date(Date.now() - 3600000 * 8), // Overdue by 8 hours
        isEscalated: true,
        escalatedAt: new Date(Date.now() - 3600000 * 8),
        escalationReason: 'Resolution deadline (72 hours) exceeded without verified completion',
        filedDate: '07 Oct 2026',
        resolutionNotes: 'Escalated to Hostel Administrator due to deadline expiry. Urgent breaker replacement needed.',
        statusHistory: [
          { id: 'h-104-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Amit Nayak', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 80).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-104-2', fromStatus: 'Assigned', toStatus: 'Escalated', changedBy: 'System Escalation Daemon', role: 'SYSTEM', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), remarks: 'Automatically escalated to Hostel Administrator: 72-hour mandatory deadline exceeded.' }
        ]
      },
      {
        id: 'CMP-2026-105',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Room 204 Study Desk',
        category: 'Furniture',
        predictedCategory: 'furniture',
        confidence: 0.91,
        needsReview: false,
        title: 'Study chair hydraulic cylinder sinking',
        description: 'Height adjustment lever slips downward when seated.',
        priority: 'Medium',
        status: 'Resolved',
        assignedStaffId: 'STF-CARP-01',
        assignedStaffName: 'Manoj Kumar Barik',
        assignedStaffPhone: '+91 94379 77210',
        assignedStaffRole: 'Carpentry & Metal Works',
        assignedAt: new Date(Date.now() - 3600000 * 48),
        workCompletedAt: new Date(Date.now() - 3600000 * 20),
        studentVerifiedAt: new Date(Date.now() - 3600000 * 18),
        resolvedAt: new Date(Date.now() - 3600000 * 18),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 24),
        isEscalated: false,
        feedbackRating: 5,
        feedbackText: 'Technician promptly replaced the hydraulic cylinder with a brand new unit. Excellent service!',
        feedbackResolved: true,
        feedbackAdminComments: 'Resolved within 24 hours. Very courteous worker.',
        feedbackSubmittedAt: new Date(Date.now() - 3600000 * 18),
        filedDate: '06 Oct 2026',
        resolutionNotes: 'New gas cylinder installed. Student confirmed satisfactory repair.',
        statusHistory: [
          { id: 'h-105-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-105-2', fromStatus: 'Assigned', toStatus: 'Awaiting Student Verification', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 20).toISOString(), remarks: 'Replaced gas cylinder.' },
          { id: 'h-105-3', fromStatus: 'Awaiting Student Verification', toStatus: 'Resolved', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), remarks: 'Student confirmed completion with 5-star rating.' }
        ]
      },
      {
        id: 'CMP-2026-106',
        studentName: 'Priya Patra',
        rollNumber: '04',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Study Area Desk #01',
        category: 'Network / IT',
        predictedCategory: 'network',
        confidence: 0.89,
        needsReview: false,
        title: 'Floor Wi-Fi access point dropping packets',
        description: 'Repeated signal disconnections during online technical assessment tests.',
        priority: 'High',
        status: 'Reopened',
        assignedStaffId: 'STF-IT-01',
        assignedStaffName: 'Tapan Kumar Mohapatra',
        assignedStaffPhone: '+91 94382 44564',
        assignedStaffRole: 'Senior Lab & Network Technician',
        assignedAt: new Date(Date.now() - 3600000 * 36),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 36),
        isEscalated: false,
        reopenedAt: new Date(Date.now() - 3600000 * 3),
        reopenReason: 'Re-occurred within 2 hours of restart. Channel congestion on 2.4 GHz band remains.',
        filedDate: '08 Oct 2026',
        resolutionNotes: 'Ticket reopened by student. Network team dispatched with dual-band 5GHz extender.',
        statusHistory: [
          { id: 'h-106-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Priya Patra', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 36).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-106-2', fromStatus: 'Assigned', toStatus: 'Awaiting Student Verification', changedBy: 'Tapan Kumar Mohapatra', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), remarks: 'Router rebooted.' },
          { id: 'h-106-3', fromStatus: 'Awaiting Student Verification', toStatus: 'Reopened', changedBy: 'Priya Patra', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), remarks: 'Problem reported not resolved by student: Channel congestion persists.' }
        ]
      }
    ],
  });

  // 17. Seed Institution & Campuses
  const inst = await prisma.institution.upsert({
    where: { code: 'GIFT-AUTO' },
    update: {},
    create: {
      code: 'GIFT-AUTO',
      name: 'Gandhi Institute For Technology (Autonomous)',
      tagline: 'Autonomous Institution Affiliated to BPUT, Accredited NAAC Grade A++',
      address: 'Gramadiha, Gangapada, PO: Janla, Bhubaneswar, Odisha 752054',
      website: 'https://gift.edu.in',
      phone: '+91 674 2111666',
      email: 'admissions@gift.edu.in',
      affiliations: ['UGC Autonomous', 'BPUT Odisha', 'AICTE Approved', 'NAAC A++ Grade'],
    },
  });

  const mainCampus = await prisma.campus.upsert({
    where: { code: 'CAMPUS-MAIN' },
    update: {},
    create: {
      institutionId: inst.id,
      code: 'CAMPUS-MAIN',
      name: 'Bhubaneswar Main Campus',
      city: 'Bhubaneswar',
      state: 'Odisha',
      isMainCampus: true,
    },
  });

  await prisma.campus.upsert({
    where: { code: 'CAMPUS-CITY' },
    update: {},
    create: {
      institutionId: inst.id,
      code: 'CAMPUS-CITY',
      name: 'Executive City Learning Campus',
      city: 'Bhubaneswar',
      state: 'Odisha',
      isMainCampus: false,
    },
  });

  // 18. Seed Programmes (Configurable durations & degree types)
  const programmes = [
    { code: 'BTECH-CSE', name: 'Bachelor of Technology in Computer Science & Engineering', degreeType: 'UG', departmentCode: 'CSE', durationYears: 4, totalSemesters: 8, creditsRequired: 160 },
    { code: 'BTECH-AIML', name: 'Bachelor of Technology in Artificial Intelligence & Machine Learning', degreeType: 'UG', departmentCode: 'AIML', durationYears: 4, totalSemesters: 8, creditsRequired: 160 },
    { code: 'BTECH-ECE', name: 'Bachelor of Technology in Electronics & Communication', degreeType: 'UG', departmentCode: 'ECE', durationYears: 4, totalSemesters: 8, creditsRequired: 160 },
    { code: 'BCA', name: 'Bachelor of Computer Applications', degreeType: 'UG', departmentCode: 'CSE', durationYears: 3, totalSemesters: 6, creditsRequired: 120 },
    { code: 'BBA', name: 'Bachelor of Business Administration', degreeType: 'UG', departmentCode: 'MBA', durationYears: 3, totalSemesters: 6, creditsRequired: 120 },
    { code: 'DIPLOMA-EE', name: 'Diploma in Electrical Engineering', degreeType: 'Diploma', departmentCode: 'EEE', durationYears: 3, totalSemesters: 6, creditsRequired: 110 },
  ];

  for (const prog of programmes) {
    await prisma.programme.upsert({
      where: { code: prog.code },
      update: prog,
      create: prog,
    });
  }

  // 19. Seed Academic Years
  await prisma.academicYear.upsert({
    where: { year: '2026-27' },
    update: { isCurrent: true },
    create: { year: '2026-27', isCurrent: true, startDate: '01-07-2026', endDate: '30-06-2027' },
  });
  await prisma.academicYear.upsert({
    where: { year: '2025-26' },
    update: { isCurrent: false },
    create: { year: '2025-26', isCurrent: false, startDate: '01-07-2025', endDate: '30-06-2026' },
  });

  // 20. Seed Applicants (Multi-stage admission pipeline)
  const cseProg = await prisma.programme.findUnique({ where: { code: 'BTECH-CSE' } });
  const bcaProg = await prisma.programme.findUnique({ where: { code: 'BCA' } });
  const bbaProg = await prisma.programme.findUnique({ where: { code: 'BBA' } });

  const applicantsToSeed = [
    {
      applicationNo: 'APP-2026-001',
      name: 'Subhashree Behera',
      email: 'subhashree.app@gmail.com',
      phone: '+91 94371 99011',
      gender: 'Female',
      dob: '12-08-2005',
      category: 'General',
      programmeId: cseProg?.id,
      programmeName: 'B.Tech Computer Science & Engineering',
      academicYear: '2026-27',
      tenthMarks: 88.5,
      twelfthMarks: 86.0,
      entranceExam: 'JEE Main 2026',
      entranceRank: 34120,
      status: 'APPLIED' as any,
    },
    {
      applicationNo: 'APP-2026-002',
      name: 'Manish Kumar Pradhan',
      email: 'manish.app@gmail.com',
      phone: '+91 94371 99022',
      gender: 'Male',
      dob: '05-11-2004',
      category: 'OBC',
      programmeId: cseProg?.id,
      programmeName: 'B.Tech Computer Science & Engineering',
      academicYear: '2026-27',
      tenthMarks: 91.0,
      twelfthMarks: 89.2,
      entranceExam: 'OJEE 2026',
      entranceRank: 1204,
      status: 'VERIFIED' as any,
      verifiedBy: 'Ms. Sasmita Mohapatra (Admissions Officer)',
    },
    {
      applicationNo: 'APP-2026-003',
      name: 'Aditi Priyadarshini',
      email: 'aditi.app@gmail.com',
      phone: '+91 94371 99033',
      gender: 'Female',
      dob: '20-04-2005',
      category: 'General',
      programmeId: bcaProg?.id,
      programmeName: 'Bachelor of Computer Applications',
      academicYear: '2026-27',
      tenthMarks: 84.0,
      twelfthMarks: 81.5,
      entranceExam: 'Direct Merit',
      status: 'APPROVED' as any,
      verifiedBy: 'Ms. Sasmita Mohapatra',
      approvedBy: 'Sri Manoranjan Tripathy (CAO)',
    },
  ];

  for (const app of applicantsToSeed) {
    await prisma.applicant.upsert({
      where: { applicationNo: app.applicationNo },
      update: app,
      create: app,
    });
  }

  // 21. Link existing seeded Student (Rakesh Das) to BTECH-CSE and seed StudentEnrollments
  const enrolledStudent = await prisma.student.findFirst({ where: { rollNumber: '01' } });
  if (enrolledStudent && cseProg) {
    await prisma.student.update({
      where: { id: enrolledStudent.id },
      data: { programmeId: cseProg.id },
    });

    // Seed historical enrollments for semesters 1-4 and current semester 5
    const semestersToEnroll = [
      { semester: 'Semester 1', year: '2024-25', status: 'Completed', sgpa: 8.2, cgpa: 8.2, attendance: 94.0 },
      { semester: 'Semester 2', year: '2024-25', status: 'Completed', sgpa: 8.5, cgpa: 8.35, attendance: 93.5 },
      { semester: 'Semester 3', year: '2025-26', status: 'Completed', sgpa: 8.3, cgpa: 8.33, attendance: 91.0 },
      { semester: 'Semester 4', year: '2025-26', status: 'Completed', sgpa: 8.6, cgpa: 8.40, attendance: 92.5 },
      { semester: 'Semester 5', year: '2026-27', status: 'Enrolled', sgpa: null, cgpa: 8.42, attendance: 92.0 },
    ];

    for (const se of semestersToEnroll) {
      const existingEnrollment = await prisma.studentEnrollment.findFirst({
        where: { studentId: enrolledStudent.id, semester: se.semester, academicYear: se.year },
      });
      if (!existingEnrollment) {
        await prisma.studentEnrollment.create({
          data: {
            studentId: enrolledStudent.id,
            programmeId: cseProg.id,
            academicYear: se.year,
            semester: se.semester,
            section: 'Section A',
            status: se.status,
            sgpa: se.sgpa,
            cgpa: se.cgpa,
            attendanceRate: se.attendance,
          },
        });
      }
    }
  }

  // 22. Seed Course Offerings and Faculty Assignments
  const facultyMember = await prisma.faculty.findFirst({ where: { employeeId: 'FAC-042' } });
  const subjectsToOffer = [
    { code: 'CS501', name: 'Database Management Systems', credits: 4, type: 'Theory + Lab' },
    { code: 'CS502', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory + Lab' },
    { code: 'CS503', name: 'Software Engineering & Agile', credits: 3, type: 'Theory' },
    { code: 'CS504', name: 'Computer Networks', credits: 4, type: 'Theory + Lab' },
    { code: 'CS505', name: 'Artificial Intelligence & Systems', credits: 3, type: 'Theory' },
    { code: 'CS506', name: 'Web Engineering & Cloud Architecture', credits: 4, type: 'Theory + Lab' },
  ];

  for (const s of subjectsToOffer) {
    const offering = await prisma.courseOffering.upsert({
      where: {
        subjectCode_academicYear_semester: {
          subjectCode: s.code,
          academicYear: '2026-27',
          semester: 'Semester 5',
        },
      },
      update: {},
      create: {
        subjectCode: s.code,
        subjectName: s.name,
        programmeId: cseProg?.id,
        department: 'CSE',
        semester: 'Semester 5',
        academicYear: '2026-27',
        credits: s.credits,
        type: s.type,
      },
    });

    if (facultyMember && (s.code === 'CS501' || s.code === 'CS506')) {
      await prisma.facultyAssignment.upsert({
        where: {
          courseOfferingId_facultyId_section: {
            courseOfferingId: offering.id,
            facultyId: facultyMember.id,
            section: 'Section A',
          },
        },
        update: {},
        create: {
          courseOfferingId: offering.id,
          facultyId: facultyMember.id,
          section: 'Section A',
          academicYear: '2026-27',
          role: 'Lead Instructor',
          allocatedHours: 4,
        },
      });
    }
  }

  console.log('✅ Successfully seeded ALL 17 ROLES, normalized academic structures, admission applicants, semester enrollments, and course allocations!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
