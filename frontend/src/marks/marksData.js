// src/marks/marksData.js
// Mock Data and helper models for Marks Management Module

export const ACADEMIC_YEARS = ['2026-27', '2025-26', '2024-25']
export const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
export const SECTIONS = ['A', 'B', 'C']

export const SUBJECTS = [
  {
    id: 'dsa',
    code: 'CS501',
    name: 'Data Structures',
    shortName: 'DSA',
    credits: 4,
    faculty: 'Dr. S. Mohanty',
    room: 'Room 204',
    totalStudents: 91,
    marksEnteredPct: 82,
    color: '#2563eb',
  },
  {
    id: 'os',
    code: 'CS502',
    name: 'Operating Systems',
    shortName: 'OS',
    credits: 4,
    faculty: 'Prof. R. K. Nayak',
    room: 'Room 206',
    totalStudents: 91,
    marksEnteredPct: 100,
    color: '#059669',
  },
  {
    id: 'dbms',
    code: 'CS503',
    name: 'Database Management Systems',
    shortName: 'DBMS',
    credits: 4,
    faculty: 'Dr. P. Mohapatra',
    room: 'Room 302',
    totalStudents: 91,
    marksEnteredPct: 65,
    color: '#7c3aed',
  },
  {
    id: 'ai',
    code: 'CS504',
    name: 'Artificial Intelligence',
    shortName: 'AI',
    credits: 3,
    faculty: 'Dr. A. K. Panda',
    room: 'Hall-A',
    totalStudents: 91,
    marksEnteredPct: 74,
    color: '#d97706',
  },
  {
    id: 'ml',
    code: 'CS505',
    name: 'Machine Learning',
    shortName: 'ML',
    credits: 4,
    faculty: 'Prof. M. Mishra',
    room: 'Hall-B',
    totalStudents: 91,
    marksEnteredPct: 89,
    color: '#0284c7',
  },
  {
    id: 'se',
    code: 'CS506',
    name: 'Software Engineering',
    shortName: 'SE',
    credits: 3,
    faculty: 'Prof. S. Das',
    room: 'Room 108',
    totalStudents: 91,
    marksEnteredPct: 83,
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

export function generateStudents() {
  const students = []
  for (let i = 1; i <= 91; i++) {
    const rollNo = i.toString().padStart(2, '0')
    const regNo = `23052010${rollNo}`
    const fn = firstNames[(i - 1) % firstNames.length]
    const ln = lastNames[(i * 3) % lastNames.length]
    const name = i === 1 ? 'Rahul Sharma' : i === 2 ? 'Amit Patel' : i === 3 ? 'Raj Kumar' : i === 4 ? 'Rakesh Das' : `${fn} ${ln}`
    students.push({
      id: `s-${i}`,
      rollNo,
      regNo,
      name,
      section: i <= 46 ? 'A' : 'B',
      semester: '5th',
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.apnacampus.edu.in`,
    })
  }
  return students
}

// Generate marks table for each subject and student
export function generateInitialMarks(students) {
  const marksMap = {}

  SUBJECTS.forEach((subject, sIdx) => {
    marksMap[subject.id] = {}

    students.forEach((student, stdIdx) => {
      // Seeded pseudorandom marks based on student index and subject index for consistent deterministic data
      const seed = (stdIdx * 17 + sIdx * 31) % 100
      const ability = 0.65 + (stdIdx % 23) * 0.015 // baseline 65% to 99%

      // Some students have pending marks to demonstrate teacher entry
      const isPendingQuiz3 = subject.id === 'dsa' && (stdIdx === 2 || stdIdx === 5 || stdIdx === 8)
      const isPendingLab = subject.id === 'dbms' && stdIdx > 70
      const isPendingST2 = subject.id === 'ai' && stdIdx % 4 === 0

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
