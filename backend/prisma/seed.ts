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

  console.log('✅ Successfully seeded ALL 14 ROLES, complete Autonomous College entities, exam schedules, library catalog, placement drives, transit fleet, labs, and system settings!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
