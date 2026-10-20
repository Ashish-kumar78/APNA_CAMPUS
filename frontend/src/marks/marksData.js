// src/marks/marksData.js
// Mock Data and helper models for Marks Management Module

export const ACADEMIC_YEARS = ['2026-27', '2025-26', '2024-25']
export const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
export const SECTIONS = ['A', 'B', 'C']

// Dr. S. Mohanty's multi-class, multi-section, multi-semester teaching assignments
export const ASSIGNED_CLASSES = [
  {
    id: 'fa-1',
    subjectId: 'dsa',
    academicYear: '2026-27',
    semester: '5th',
    semNumber: 5,
    section: 'A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    credits: 4,
    room: 'Block B - 302',
    labRoom: 'Computing Lab 3',
    studentCount: 32,
    completionPct: 84,
    pendingMarksCount: 3,
    avgScore: 78.4,
  },
  {
    id: 'fa-1b',
    subjectId: 'dsa_b',
    academicYear: '2026-27',
    semester: '5th',
    semNumber: 5,
    section: 'B',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    credits: 4,
    room: 'Block B - 303',
    labRoom: 'Computing Lab 3',
    studentCount: 30,
    completionPct: 78,
    pendingMarksCount: 5,
    avgScore: 76.1,
  },
  {
    id: 'fa-2',
    subjectId: 'os',
    academicYear: '2026-27',
    semester: '5th',
    semNumber: 5,
    section: 'A',
    subjectCode: 'CS502',
    subjectName: 'Operating Systems',
    credits: 4,
    room: 'Block B - 304',
    labRoom: null,
    studentCount: 32,
    completionPct: 100,
    pendingMarksCount: 0,
    avgScore: 82.5,
  },
  {
    id: 'fa-3',
    subjectId: 'oop',
    academicYear: '2026-27',
    semester: '3rd',
    semNumber: 3,
    section: 'A',
    subjectCode: 'CS301',
    subjectName: 'Object Oriented Programming with Java',
    credits: 4,
    room: 'Block B - 201',
    labRoom: 'Computing Lab 1',
    studentCount: 34,
    completionPct: 80,
    pendingMarksCount: 4,
    avgScore: 75.8,
  },
  {
    id: 'fa-3b',
    subjectId: 'oop_b',
    academicYear: '2026-27',
    semester: '3rd',
    semNumber: 3,
    section: 'B',
    subjectCode: 'CS301',
    subjectName: 'Object Oriented Programming with Java',
    credits: 4,
    room: 'Block B - 202',
    labRoom: 'Computing Lab 1',
    studentCount: 32,
    completionPct: 75,
    pendingMarksCount: 6,
    avgScore: 74.2,
  },
  {
    id: 'fa-4',
    subjectId: 'c_prog',
    academicYear: '2026-27',
    semester: '1st',
    semNumber: 1,
    section: 'A',
    subjectCode: 'CS101',
    subjectName: 'Problem Solving & C Programming',
    credits: 4,
    room: 'Block B - 101',
    labRoom: 'Computing Lab 2',
    studentCount: 36,
    completionPct: 72,
    pendingMarksCount: 8,
    avgScore: 71.9,
  },
  {
    id: 'fa-5',
    subjectId: 'daa',
    academicYear: '2025-26',
    semester: '4th',
    semNumber: 4,
    section: 'A',
    subjectCode: 'CS402',
    subjectName: 'Design & Analysis of Algorithms',
    credits: 4,
    room: 'Block B - 205',
    labRoom: 'Computing Lab 2',
    studentCount: 30,
    completionPct: 100,
    pendingMarksCount: 0,
    avgScore: 85.3,
  },
  {
    id: 'fa-6',
    subjectId: 'compiler',
    academicYear: '2025-26',
    semester: '6th',
    semNumber: 6,
    section: 'A',
    subjectCode: 'CS601',
    subjectName: 'Compiler Design & Automata',
    credits: 4,
    room: 'Block B - 305',
    labRoom: null,
    studentCount: 28,
    completionPct: 100,
    pendingMarksCount: 0,
    avgScore: 88.0,
  },
]

export const SUBJECTS = [
  {
    id: 'dsa',
    code: 'CS501',
    name: 'Data Structures & Algorithms (Sec A)',
    shortName: 'DSA - A',
    semester: '5th',
    section: 'A',
    academicYear: '2026-27',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 302',
    totalStudents: 32,
    marksEnteredPct: 84,
    color: '#2563eb',
  },
  {
    id: 'dsa_b',
    code: 'CS501',
    name: 'Data Structures & Algorithms (Sec B)',
    shortName: 'DSA - B',
    semester: '5th',
    section: 'B',
    academicYear: '2026-27',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 303',
    totalStudents: 30,
    marksEnteredPct: 78,
    color: '#3b82f6',
  },
  {
    id: 'os',
    code: 'CS502',
    name: 'Operating Systems',
    shortName: 'OS',
    semester: '5th',
    section: 'A',
    academicYear: '2026-27',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 304',
    totalStudents: 32,
    marksEnteredPct: 100,
    color: '#059669',
  },
  {
    id: 'oop',
    code: 'CS301',
    name: 'Object Oriented Programming with Java (Sec A)',
    shortName: 'OOP - A',
    semester: '3rd',
    section: 'A',
    academicYear: '2026-27',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 201',
    totalStudents: 34,
    marksEnteredPct: 80,
    color: '#7c3aed',
  },
  {
    id: 'oop_b',
    code: 'CS301',
    name: 'Object Oriented Programming with Java (Sec B)',
    shortName: 'OOP - B',
    semester: '3rd',
    section: 'B',
    academicYear: '2026-27',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 202',
    totalStudents: 32,
    marksEnteredPct: 75,
    color: '#9333ea',
  },
  {
    id: 'c_prog',
    code: 'CS101',
    name: 'Problem Solving & C Programming',
    shortName: 'C Prog',
    semester: '1st',
    section: 'A',
    academicYear: '2026-27',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 101',
    totalStudents: 36,
    marksEnteredPct: 72,
    color: '#d97706',
  },
  {
    id: 'daa',
    code: 'CS402',
    name: 'Design & Analysis of Algorithms',
    shortName: 'DAA',
    semester: '4th',
    section: 'A',
    academicYear: '2025-26',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 205',
    totalStudents: 30,
    marksEnteredPct: 100,
    color: '#0284c7',
  },
  {
    id: 'compiler',
    code: 'CS601',
    name: 'Compiler Design & Automata',
    shortName: 'Compiler',
    semester: '6th',
    section: 'A',
    academicYear: '2025-26',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Block B - 305',
    totalStudents: 28,
    marksEnteredPct: 100,
    color: '#e11d48',
  },
]

export const SEMESTER_SUBJECTS = {
  sem1: [
    {
      id: 'sem1_m1',
      code: 'CS101',
      name: 'Mathematics-I',
      shortName: 'MATH-1',
      credits: 4,
      faculty: 'Dr. K. R. Mohapatra',
      room: 'Room 101',
      color: '#2563eb',
    },
    {
      id: 'sem1_bps',
      code: 'CS102',
      name: 'Basic Programming Skills',
      shortName: 'BPS',
      credits: 4,
      faculty: 'Dr. S. S. Ray',
      room: 'Room 102',
      color: '#059669',
    },
    {
      id: 'sem1_phy',
      code: 'CS103',
      name: 'Elements of Engineering Physics',
      shortName: 'PHYS',
      credits: 3,
      faculty: 'Prof. A. Pradhan',
      room: 'Room 103',
      color: '#7c3aed',
    },
    {
      id: 'sem1_bee',
      code: 'CS104',
      name: 'Basic Electrical Engineering',
      shortName: 'BEE',
      credits: 3,
      faculty: 'Prof. B. K. Jena',
      room: 'Room 104',
      color: '#d97706',
    },
    {
      id: 'sem1_bme',
      code: 'CS105',
      name: 'Basic Mechanical Engineering',
      shortName: 'BME',
      credits: 3,
      faculty: 'Prof. M. K. Sahoo',
      room: 'Room 105',
      color: '#0284c7',
    },
    {
      id: 'sem1_eng1',
      code: 'CS106',
      name: 'English for Engineer - I',
      shortName: 'ENG-1',
      credits: 3,
      faculty: 'Dr. R. N. Rath',
      room: 'Room 106',
      color: '#e11d48',
    },
  ],
  sem2: [
    {
      id: 'sem2_m2',
      code: 'CS201',
      name: 'Mathematics-II',
      shortName: 'MATH-2',
      credits: 4,
      faculty: 'Dr. K. R. Mohapatra',
      room: 'Room 101',
      color: '#2563eb',
    },
    {
      id: 'sem2_bee',
      code: 'CS202',
      name: 'Basic Electronics Engineering',
      shortName: 'BEX',
      credits: 4,
      faculty: 'Prof. P. K. Tripathy',
      room: 'Room 102',
      color: '#059669',
    },
    {
      id: 'sem2_pds',
      code: 'CS203',
      name: 'Programming using Data Structure',
      shortName: 'PDS',
      credits: 4,
      faculty: 'Dr. S. Mohanty',
      room: 'Room 204',
      color: '#7c3aed',
    },
    {
      id: 'sem2_chem',
      code: 'CS204',
      name: 'Applied Chemistry',
      shortName: 'CHEM',
      credits: 3,
      faculty: 'Dr. L. N. Mishra',
      room: 'Room 105',
      color: '#d97706',
    },
    {
      id: 'sem2_bce',
      code: 'CS205',
      name: 'Basic Civil Engineering',
      shortName: 'BCE',
      credits: 3,
      faculty: 'Prof. S. P. Behera',
      room: 'Room 108',
      color: '#0284c7',
    },
    {
      id: 'sem2_eng2',
      code: 'CS206',
      name: 'English for Engineers-II',
      shortName: 'ENG-2',
      credits: 2,
      faculty: 'Dr. R. N. Rath',
      room: 'Room 106',
      color: '#e11d48',
    },
  ],
  sem3: [
    {
      id: 'sem3_mcs',
      code: 'CS301',
      name: 'Mathematics for Computer Science',
      shortName: 'MCS',
      credits: 4,
      faculty: 'Dr. K. R. Mohapatra',
      room: 'Room 201',
      color: '#2563eb',
    },
    {
      id: 'sem3_ob',
      code: 'CS302',
      name: 'Organisational Behavior',
      shortName: 'OB',
      credits: 3,
      faculty: 'Dr. M. R. Samal',
      room: 'Room 202',
      color: '#059669',
    },
    {
      id: 'sem3_java',
      code: 'CS303',
      name: 'Object Oriented Programming using Java',
      shortName: 'JAVA',
      credits: 4,
      faculty: 'Prof. R. K. Nayak',
      room: 'Room 203',
      color: '#7c3aed',
    },
    {
      id: 'sem3_dbms',
      code: 'CS304',
      name: 'Database Management System',
      shortName: 'DBMS',
      credits: 4,
      faculty: 'Dr. P. Mohapatra',
      room: 'Room 302',
      color: '#d97706',
    },
    {
      id: 'sem3_dld',
      code: 'CS305',
      name: 'Digital Logic Design',
      shortName: 'DLD',
      credits: 3,
      faculty: 'Prof. S. K. Swain',
      room: 'Room 205',
      color: '#0284c7',
    },
    {
      id: 'sem3_env',
      code: 'CS306',
      name: 'Environmental Engineering',
      shortName: 'ENV',
      credits: 2,
      faculty: 'Dr. S. K. Dash',
      room: 'Room 206',
      color: '#e11d48',
    },
  ],
  sem4: [
    {
      id: 'sem4_eco',
      code: 'CS401',
      name: 'Engineering Economics',
      shortName: 'EE',
      credits: 3,
      faculty: 'Dr. M. R. Samal',
      room: 'Room 301',
      color: '#2563eb',
    },
    {
      id: 'sem4_daa',
      code: 'CS402',
      name: 'Design and Analysis of Algorithms',
      shortName: 'DAA',
      credits: 4,
      faculty: 'Dr. S. Mohanty',
      room: 'Room 204',
      color: '#059669',
    },
    {
      id: 'sem4_coa',
      code: 'CS403',
      name: 'Computer Organisation & Architecture',
      shortName: 'COA',
      credits: 4,
      faculty: 'Prof. M. Mishra',
      room: 'Room 303',
      color: '#7c3aed',
    },
    {
      id: 'sem4_py',
      code: 'CS404',
      name: 'Programming with Python',
      shortName: 'PYTHON',
      credits: 3,
      faculty: 'Prof. S. Das',
      room: 'Room 304',
      color: '#d97706',
    },
    {
      id: 'sem4_dsp',
      code: 'CS405',
      name: 'Digital Signal Processing',
      shortName: 'DSP',
      credits: 3,
      faculty: 'Prof. P. K. Tripathy',
      room: 'Room 305',
      color: '#0284c7',
    },
    {
      id: 'sem4_aet',
      code: 'CS406',
      name: 'Ability Enhancement Training - C',
      shortName: 'AET',
      credits: 3,
      faculty: 'Prof. A. K. Panda',
      room: 'Room 306',
      color: '#e11d48',
    },
  ],
  sem5: SUBJECTS,
}

export function getMockSemesterMarks(subjectId, studentId, semester = 'sem5') {
  if (semester === 'sem5') {
    return {
      mod1: 17,
      mod2: 16,
      q1: 9,
      q2: 8,
      q3: 8,
      q4: 9,
      q5: 8,
      q6: 9,
      a1: 9,
      a2: 8,
      st1: 9,
      st2: 7,
      lab: 54,
    }
  }

  const hash = (subjectId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + (semester === 'sem1' ? 11 : semester === 'sem2' ? 22 : semester === 'sem3' ? 33 : 44)) % 10

  const mod1 = 17 + (hash % 3)
  const mod2 = 18 + ((hash + 1) % 3)
  const q1 = 9 + (hash % 2)
  const q2 = 8 + (hash % 3)
  const q3 = 9 + ((hash + 1) % 2)
  const q4 = 9 + (hash % 2)
  const q5 = 8 + ((hash + 2) % 3)
  const q6 = 9 + (hash % 2)
  const a1 = 9 + (hash % 2)
  const a2 = 10
  const st1 = 9 + (hash % 2)
  const st2 = 8 + ((hash + 1) % 3)
  const lab = 53 + (hash % 7)

  return {
    mod1,
    mod2,
    q1,
    q2,
    q3,
    q4,
    q5,
    q6,
    a1,
    a2,
    st1,
    st2,
    lab,
  }
}

export const ASSESSMENT_TYPES = [
  { key: 'all', label: 'All Assessments' },
  { key: 'modular', label: 'Modular' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'surprise', label: 'Surprise Tests' },
  { key: 'lab', label: 'Lab' },
]

export const ASSESSMENT_CONFIG = [
  { key: 'mod1', label: 'Mod 1', fullName: 'Modular Exam 1', type: 'modular', maxMarks: 20, weightage: 20 },
  { key: 'mod2', label: 'Mod 2', fullName: 'Modular Exam 2', type: 'modular', maxMarks: 20, weightage: 20 },
  { key: 'q1', label: 'Q1', fullName: 'Quiz 1', type: 'quizzes', maxMarks: 10, weightage: 5 },
  { key: 'q2', label: 'Q2', fullName: 'Quiz 2', type: 'quizzes', maxMarks: 10, weightage: 5 },
  { key: 'q3', label: 'Q3', fullName: 'Quiz 3', type: 'quizzes', maxMarks: 10, weightage: 5 },
  { key: 'q4', label: 'Q4', fullName: 'Quiz 4', type: 'quizzes', maxMarks: 10, weightage: 5 },
  { key: 'q5', label: 'Q5', fullName: 'Quiz 5', type: 'quizzes', maxMarks: 10, weightage: 5 },
  { key: 'q6', label: 'Q6', fullName: 'Quiz 6', type: 'quizzes', maxMarks: 10, weightage: 5 },
  { key: 'a1', label: 'A1', fullName: 'Assignment 1', type: 'assignments', maxMarks: 10, weightage: 5 },
  { key: 'a2', label: 'A2', fullName: 'Assignment 2', type: 'assignments', maxMarks: 10, weightage: 5 },
  { key: 'st1', label: 'ST1', fullName: 'Surprise Test 1', type: 'surprise', maxMarks: 10, weightage: 5 },
  { key: 'st2', label: 'ST2', fullName: 'Surprise Test 2', type: 'surprise', maxMarks: 10, weightage: 5 },
  { key: 'lab', label: 'Lab', fullName: 'Lab Practical', type: 'lab', maxMarks: 60, weightage: 15 },
]

// 91 Realistically generated students
const firstNames = [
  'Rahul', 'Amit', 'Raj', 'Rakesh', 'Priya', 'Sneha', 'Deepak', 'Rohit', 'Pooja', 'Siddharth',
  'Rohit', 'Vikram', 'Neha', 'Sunita', 'Abhishek', 'Swati', 'Manish', 'Kavita', 'Sanjay', 'Aditya',
  'Megha', 'Alok', 'Smita', 'Varun', 'Tarun', 'Ankit', 'Kiran', 'Suresh', 'Bhavna', 'Gaurav',
  'Arun', 'Shalini', 'Kunal', 'Jyoti', 'Nikhil', 'Tanvi', 'Mohit', 'Payal', 'Harish', 'Preeti',
  'Sumit', 'Divya', 'Prateek', 'Shweta', 'Ashish', 'Rashmi', 'Vivek', 'Monika', 'Hemant', 'Richa',
  'Ajay', 'Komal', 'Saurabh', 'Pallavi', 'Girish', 'Sakshi', 'Umesh', 'Ritu', 'Pawan', 'Aarti',
  'Chandan', 'Madhu', 'Lokesh', 'Sheetal', 'Kailash', 'Sonal', 'Mukesh', 'Garima', 'Subhash', 'Nupur',
  'Dinesh', 'Vandana', 'Mahesh', 'Prachi', 'Vinod', 'Barkha', 'Jitendra', 'Isha', 'Satish', 'Simran',
  'Manoj', 'Neelam', 'Santosh', 'Anjali', 'Raman', 'Seema', 'Suraj', 'Geeta', 'Anil', 'Anita', 'Bikash'
]

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Das', 'Verma', 'Rout', 'Sahoo', 'Mohanty', 'Nayak', 'Mishra',
  'Singh', 'Panda', 'Pradhan', 'Behera', 'Tripathy', 'Samal', 'Jena', 'Barik', 'Lenka', 'Biswal',
  'Mallick', 'Mahapatra', 'Sethy', 'Swain', 'Acharya', 'Bhoi', 'Dasgupta', 'Ghosh', 'Chatterjee', 'Banerjee'
]

import { generateAllStudents } from '../data/collegeData'

export function generateStudents(semester, section, academicYear) {
  const allGenerated = generateAllStudents()
  const allStudents = allGenerated.map((s) => ({
    id: s.id,
    rollNo: s.rollNo,
    regNo: s.studentId || `23052010${s.rollNo}`,
    name: s.name,
    section: s.section.replace('Section ', ''),
    semester: s.semester.replace('Semester ', '') + (s.semester.includes('1') ? 'st' : s.semester.includes('2') ? 'nd' : s.semester.includes('3') ? 'rd' : 'th'),
    semesterRaw: s.semester,
    academicYear: s.academicYear,
    email: s.email,
    cgpa: s.cgpa,
    attendance: s.attendance,
  }))

  if (!semester && !section && !academicYear) {
    // Default to Sem 5 Sec A
    return allStudents.filter((s) => s.semesterRaw === 'Semester 5' && s.section === 'A')
  }

  return allStudents.filter((s) => {
    if (academicYear && academicYear !== 'all') {
      if (s.academicYear !== academicYear) return false
    }
    if (semester && semester !== 'all') {
      const sNum = s.semesterRaw.replace(/[^0-9]/g, '')
      const targetNum = String(semester).replace(/[^0-9]/g, '')
      if (sNum !== targetNum) return false
    }
    if (section && section !== 'all') {
      const targetSec = String(section).replace('Section ', '').toUpperCase()
      if (s.section.toUpperCase() !== targetSec) return false
    }
    return true
  })
}

// Generate marks table for each subject and student
export function generateInitialMarks(students) {
  const marksMap = {}
  const targetStudents = students && students.length > 0 ? students : generateStudents('all', 'all', 'all')

  SUBJECTS.forEach((subject, sIdx) => {
    marksMap[subject.id] = {}

    targetStudents.forEach((student, stdIdx) => {
      // Seeded pseudorandom marks based on student index and subject index for consistent deterministic data
      const seed = (stdIdx * 17 + sIdx * 31) % 100
      const ability = 0.65 + (stdIdx % 23) * 0.015 // baseline 65% to 99%

      // Some students have pending marks to demonstrate teacher entry
      const isPendingQuiz3 = (subject.id === 'dsa' || subject.id === 'dsa_b') && (stdIdx === 2 || stdIdx === 5 || stdIdx === 8)
      const isPendingLab = subject.id === 'oop' && stdIdx > 30
      const isPendingST2 = subject.id === 'c_prog' && stdIdx % 4 === 0

      marksMap[subject.id][student.id] = {
        mod1: Math.min(20, Math.max(8, Math.round(20 * ability + ((seed % 5) - 2)))),
        mod2: Math.min(20, Math.max(8, Math.round(20 * (ability - 0.02) + (((seed + 3) % 5) - 2)))),
        q1: Math.min(10, Math.max(4, Math.round(10 * ability))),
        q2: Math.min(10, Math.max(4, Math.round(10 * ability + 1))),
        q3: isPendingQuiz3 ? '' : Math.min(10, Math.max(3, Math.round(10 * ability - 1))),
        q4: Math.min(10, Math.max(4, Math.round(10 * ability))),
        q5: Math.min(10, Math.max(4, Math.round(10 * ability + 1))),
        q6: Math.min(10, Math.max(4, Math.round(10 * ability))),
        a1: Math.min(10, Math.max(5, Math.round(10 * (ability + 0.05)))),
        a2: Math.min(10, Math.max(5, Math.round(10 * ability))),
        st1: Math.min(10, Math.max(3, Math.round(10 * ability))),
        st2: isPendingST2 ? '' : Math.min(10, Math.max(3, Math.round(10 * (ability - 0.04)))),
        lab: isPendingLab ? '' : Math.min(25, Math.max(12, Math.round(25 * (ability + 0.02)))),
      }
    })
  })

  return marksMap
}

export const INITIAL_ASSESSMENT_STATUS = {
  dsa: {
    mod1: 'finalized',
    mod2: 'finalized',
    q1: 'finalized',
    q2: 'finalized',
    q3: 'draft',
    q4: 'pending',
    q5: 'draft',
    q6: 'pending',
    a1: 'finalized',
    a2: 'draft',
    st1: 'finalized',
    st2: 'draft',
    lab: 'finalized',
  },
  os: {
    mod1: 'finalized',
    mod2: 'finalized',
    q1: 'finalized',
    q2: 'finalized',
    q3: 'finalized',
    q4: 'finalized',
    q5: 'finalized',
    q6: 'finalized',
    a1: 'finalized',
    a2: 'finalized',
    st1: 'finalized',
    st2: 'finalized',
    lab: 'finalized',
  },
  dbms: {
    mod1: 'finalized',
    mod2: 'draft',
    q1: 'finalized',
    q2: 'finalized',
    q3: 'draft',
    q4: 'pending',
    q5: 'pending',
    q6: 'pending',
    a1: 'finalized',
    a2: 'draft',
    st1: 'draft',
    st2: 'pending',
    lab: 'pending',
  },
  ai: {
    mod1: 'finalized',
    mod2: 'draft',
    q1: 'finalized',
    q2: 'finalized',
    q3: 'finalized',
    q4: 'draft',
    q5: 'pending',
    q6: 'pending',
    a1: 'finalized',
    a2: 'finalized',
    st1: 'draft',
    st2: 'pending',
    lab: 'draft',
  },
  ml: {
    mod1: 'finalized',
    mod2: 'finalized',
    q1: 'finalized',
    q2: 'finalized',
    q3: 'finalized',
    q4: 'finalized',
    q5: 'draft',
    q6: 'pending',
    a1: 'finalized',
    a2: 'draft',
    st1: 'finalized',
    st2: 'finalized',
    lab: 'finalized',
  },
  se: {
    mod1: 'finalized',
    mod2: 'finalized',
    q1: 'finalized',
    q2: 'finalized',
    q3: 'draft',
    q4: 'draft',
    q5: 'pending',
    q6: 'pending',
    a1: 'finalized',
    a2: 'finalized',
    st1: 'draft',
    st2: 'draft',
    lab: 'finalized',
  },
}

// Compute total obtainable marks across all assessments
export const TOTAL_MAX_MARKS = ASSESSMENT_CONFIG.reduce((sum, item) => sum + item.maxMarks, 0) // 165 total

// Calculation utilities
export function computeStudentSubjectTotal(marksRecord) {
  if (!marksRecord) return { total: 0, maxTotal: TOTAL_MAX_MARKS, pct: 0, pendingCount: ASSESSMENT_CONFIG.length }

  let earned = 0
  let totalMax = 0
  let pendingCount = 0

  ASSESSMENT_CONFIG.forEach((assessment) => {
    const val = marksRecord[assessment.key]
    if (val !== '' && val !== null && val !== undefined && !isNaN(Number(val))) {
      earned += Number(val)
      totalMax += assessment.maxMarks
    } else {
      pendingCount++
    }
  })

  const pct = totalMax > 0 ? Math.round((earned / totalMax) * 100) : 0
  return { earned, totalMax, pct, pendingCount }
}

export function computeClassStats(students, subjectMarks) {
  if (!subjectMarks) return { avgPct: 0, highestPct: 0, lowestPct: 0, pendingTotal: 0, completedPct: 0 }

  let sumPct = 0
  let highest = 0
  let lowest = 100
  let pendingTotal = 0
  let totalEntriesPossible = students.length * ASSESSMENT_CONFIG.length
  let filledEntries = 0

  students.forEach((student) => {
    const m = subjectMarks[student.id]
    if (m) {
      const { pct, pendingCount } = computeStudentSubjectTotal(m)
      sumPct += pct
      if (pct > highest) highest = pct
      if (pct < lowest) lowest = pct
      pendingTotal += pendingCount
      filledEntries += (ASSESSMENT_CONFIG.length - pendingCount)
    }
  })

  const avgPct = students.length > 0 ? Math.round(sumPct / students.length) : 0
  const completedPct = totalEntriesPossible > 0 ? Math.round((filledEntries / totalEntriesPossible) * 100) : 0

  return {
    avgPct,
    highestPct: highest,
    lowestPct: lowest === 100 ? 0 : lowest,
    pendingTotal,
    completedPct,
  }
}
