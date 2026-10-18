// ══════════════════════════════════════════════════════════════════════════════
// DIGITAL ANSWER SHEET EVALUATION SYSTEM - STATE STORE & BUSINESS LOGIC ENGINE
// Autonomous Examination Cell · GIFT Autonomous, Bhubaneswar (Affiliated to BPUT)
// ══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'gift_digital_evaluation_system_v1';

// ── Exam Marking Scheme Configuration ──
export const EVALUATION_SCHEME = {
  totalQuestions: 30,
  requiredAttempts: 21,
  totalMarks: 100,
  sections: [
    {
      id: 'sec1',
      title: 'Section 1: Short Answer Questions (Compulsory)',
      description: 'Answer all 10 questions. Each question carries 2 marks.',
      questionsAvailable: 10,
      requiredAttempts: 10,
      marksPerQuestion: 2,
      maxMarks: 20,
      isCompulsory: true,
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: `q1_${i + 1}`,
        label: `Q1.${i + 1}`,
        num: i + 1,
        maxMarks: 2,
        desc: [
          'Define Time Complexity and Big-O notation.',
          'Differentiate between mutable and immutable data types in Python.',
          'What is the purpose of an index in relational databases (B-Tree)?',
          'Explain the principle of Locality of Reference in cache memory.',
          'What is a pure virtual function and abstract class in OOP?',
          'Define Deadlock and list the four Coffman conditions.',
          'What is Shannon Channel Capacity theorem in communication?',
          'State Amdahl\'s Law of parallel speedup.',
          'Explain the concept of Generator functions and yield in Python.',
          'What is 3NF (Third Normal Form) in Database Normalization?'
        ][i]
      }))
    },
    {
      id: 'sec2',
      title: 'Section 2: Medium Analytical & Problem Solving Questions',
      description: 'Answer any 5 out of 8 questions. Each question carries 6 marks.',
      questionsAvailable: 8,
      requiredAttempts: 5,
      marksPerQuestion: 6,
      maxMarks: 30,
      isCompulsory: false,
      questions: Array.from({ length: 8 }, (_, i) => ({
        id: `q2_${i + 1}`,
        label: `Q2.${i + 1}`,
        num: i + 1,
        maxMarks: 6,
        desc: [
          'Design an algorithm for QuickSort and derive its average-case recurrence.',
          'Explain Python Decorators with an authentic practical code example.',
          'Describe ACID properties and 2-Phase Locking (2PL) Protocol in DBMS.',
          'Compare RISC vs CISC architectural pipelining hazards.',
          'Solve Banker\'s Algorithm for Deadlock Avoidance given resource matrices.',
          'Explain Bellman-Ford shortest path algorithm for graphs with negative edges.',
          'Construct a Red-Black Tree insertion step-by-step for key sequences.',
          'Explain Python GIL (Global Interpreter Lock) and multiprocessing alternatives.'
        ][i]
      }))
    },
    {
      id: 'sec3',
      title: 'Section 3: Long Comprehensive & Algorithmic Design Questions',
      description: 'Answer any 5 out of 8 questions. Each question carries 8 marks.',
      questionsAvailable: 8,
      requiredAttempts: 5,
      marksPerQuestion: 8,
      maxMarks: 40,
      isCompulsory: false,
      questions: Array.from({ length: 8 }, (_, i) => ({
        id: `q3_${i + 1}`,
        label: `Q3.${i + 1}`,
        num: i + 1,
        maxMarks: 8,
        desc: [
          'Implement a thread-safe LRU Cache in Python using Doubly Linked List & Hash Map.',
          'Explain A* Search heuristic admissibility and solve the 8-puzzle problem.',
          'Design a distributed relational database schema for an ERP Campus with partition keys.',
          'Derive Dijkstra algorithm and analyze time complexity with Min-Heap vs Fibonacci Heap.',
          'Explain Virtual Memory management, Page Fault handling, and LRU Page Replacement.',
          'Design Convolutional Neural Network (CNN) architecture with feature maps & pooling.',
          'Explain Byzantine Generals Problem and Paxos consensus in distributed systems.',
          'Solve Dynamic Programming Matrix Chain Multiplication for sequence optimal parens.'
        ][i]
      }))
    },
    {
      id: 'sec4',
      title: 'Section 4: Advanced System Design & Engineering Case Study',
      description: 'Answer any 1 out of 4 case study questions. Each question carries 10 marks.',
      questionsAvailable: 4,
      requiredAttempts: 1,
      marksPerQuestion: 10,
      maxMarks: 10,
      isCompulsory: false,
      questions: Array.from({ length: 4 }, (_, i) => ({
        id: `q4_${i + 1}`,
        label: `Q4.${i + 1}`,
        num: i + 1,
        maxMarks: 10,
        desc: [
          'Architect an end-to-end Enterprise ERP Digital Answer Sheet Evaluation System with blind barcode anonymization, real-time rubric calculation, and HOD moderation gateway.',
          'Design a high-throughput Distributed Message Queue supporting at-least-once delivery, partition consumer groups, and write-ahead logs.',
          'Design an Autonomous Examination Proctoring system using WebRTC, OpenCV face landmark tracking, and audio anomaly classification.',
          'Architect a Low-Latency Real-Time Collaborative Canvas and Annotation engine with Operational Transformation (OT) / CRDT algorithms.'
        ][i]
      }))
    }
  ]
};

// ── Initial Mock Answer Sheets Data with Secret Mapping ──
export const INITIAL_ANSWER_SHEETS = [
  {
    id: 'AS-CSE-0001',
    barcode: 'BAR-2026-904128',
    subjectCode: 'BTCS-T-PC-403',
    subjectName: 'Programming with Python',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    department: 'Computer Science & Engineering',
    bundleId: 'BND-2026-04-PY',
    examDate: '06-05-2026',
    totalPages: 8,
    status: 'In Progress', // Assigned, In Progress, Submitted, HOD Approved, Returned
    assignedFaculty: {
      id: 'FAC-042',
      name: 'Dr. S. Mohanty',
      dept: 'CSE',
      assignedDate: '10-05-2026',
      deadline: '24-05-2026'
    },
    // Secret Student Mapping (Visible only to Examination Cell CoE)
    secretStudentMapping: {
      registrationNumber: '2401432265',
      rollNumber: '2401432265',
      name: 'BISHNU PRASAD SAHOO',
      branch: 'Computer Science & Engineering (Artificial Intelligence)',
      section: 'CSE - Genius',
      examHall: 'Hall B-204 (Seat 12)'
    },
    // Pre-populated Marks for realistic demo
    marks: {
      // Sec 1 (Max 20, 10 req)
      q1_1: 2, q1_2: 2, q1_3: 1.5, q1_4: 2, q1_5: 2,
      q1_6: 1.5, q1_7: 2, q1_8: 2, q1_9: 2, q1_10: 1.5,
      // Sec 2 (Max 30, req 5, student attempted 6)
      q2_1: 6, q2_2: 5.5, q2_3: 6, q2_4: 5, q2_5: 6, q2_6: 4,
      // Sec 3 (Max 40, req 5, student attempted 5)
      q3_1: 8, q3_2: 7.5, q3_3: 8, q3_4: 7, q3_5: 8,
      // Sec 4 (Max 10, req 1, student attempted 1)
      q4_1: 9.5
    },
    facultyRemarks: 'Exceptional conceptual clarity in Section 3 LRU cache implementation and clean Pythonic syntax. Algorithm logic well diagrammed.',
    hodReviewStatus: 'Pending Review',
    hodRemarks: '',
    evaluatedDate: '16-05-2026',
    annotations: [
      { page: 2, x: 82, y: 22, type: 'tick', label: '✓ +2' },
      { page: 2, x: 84, y: 48, type: 'tick', label: '✓ +2' },
      { page: 3, x: 80, y: 35, type: 'tick', label: '✓ +6' },
      { page: 5, x: 78, y: 60, type: 'tick', label: '✓ +8' },
      { page: 7, x: 82, y: 45, type: 'tick', label: '✓ +10' }
    ]
  },
  {
    id: 'AS-CSE-0002',
    barcode: 'BAR-2026-904129',
    subjectCode: 'BTCS-T-PC-403',
    subjectName: 'Programming with Python',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    department: 'Computer Science & Engineering',
    bundleId: 'BND-2026-04-PY',
    examDate: '06-05-2026',
    totalPages: 8,
    status: 'Assigned',
    assignedFaculty: {
      id: 'FAC-042',
      name: 'Dr. S. Mohanty',
      dept: 'CSE',
      assignedDate: '10-05-2026',
      deadline: '24-05-2026'
    },
    secretStudentMapping: {
      registrationNumber: '2401432266',
      rollNumber: '2401432266',
      name: 'ANANYA MISHRA',
      branch: 'Computer Science & Engineering',
      section: 'CSE - Genius',
      examHall: 'Hall B-204 (Seat 14)'
    },
    marks: {
      q1_1: 2, q1_2: 1.5, q1_3: 2, q1_4: 1.5, q1_5: 2
    },
    facultyRemarks: '',
    hodReviewStatus: 'Not Submitted',
    hodRemarks: '',
    evaluatedDate: null,
    annotations: []
  },
  {
    id: 'AS-CSE-0003',
    barcode: 'BAR-2026-904130',
    subjectCode: 'BTCS-T-PC-401',
    subjectName: 'Design and Analysis of Algorithms',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    department: 'Computer Science & Engineering',
    bundleId: 'BND-2026-04-DAA',
    examDate: '08-05-2026',
    totalPages: 8,
    status: 'Submitted',
    assignedFaculty: {
      id: 'FAC-042',
      name: 'Dr. S. Mohanty',
      dept: 'CSE',
      assignedDate: '11-05-2026',
      deadline: '25-05-2026'
    },
    secretStudentMapping: {
      registrationNumber: '2401432267',
      rollNumber: '2401432267',
      name: 'SOUMYA RANJAN ROUT',
      branch: 'Computer Science & Engineering',
      section: 'CSE - Genius',
      examHall: 'Hall B-205 (Seat 03)'
    },
    marks: {
      q1_1: 2, q1_2: 2, q1_3: 2, q1_4: 2, q1_5: 2, q1_6: 2, q1_7: 2, q1_8: 2, q1_9: 2, q1_10: 2,
      q2_1: 6, q2_2: 6, q2_3: 5.5, q2_4: 6, q2_5: 5.5,
      q3_1: 8, q3_2: 8, q3_3: 7.5, q3_4: 7.5, q3_5: 8,
      q4_1: 10
    },
    facultyRemarks: 'Flawless recurrence relation proofs. All dynamic programming state transitions rigorously stated.',
    hodReviewStatus: 'Under Review',
    hodRemarks: 'Reviewed by HOD. Verified marks distribution across Sections 1 to 4.',
    evaluatedDate: '15-05-2026',
    annotations: []
  },
  {
    id: 'AS-CSE-0004',
    barcode: 'BAR-2026-904131',
    subjectCode: 'BTCS-T-PC-401',
    subjectName: 'Design and Analysis of Algorithms',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    department: 'Computer Science & Engineering',
    bundleId: 'BND-2026-04-DAA',
    examDate: '08-05-2026',
    totalPages: 8,
    status: 'HOD Approved',
    assignedFaculty: {
      id: 'FAC-018',
      name: 'Prof. S. Mishra',
      dept: 'CSE',
      assignedDate: '11-05-2026',
      deadline: '25-05-2026'
    },
    secretStudentMapping: {
      registrationNumber: '2401432268',
      rollNumber: '2401432268',
      name: 'PRIYANKA PRIYADARSHINI',
      branch: 'Computer Science & Engineering',
      section: 'CSE - Genius',
      examHall: 'Hall B-205 (Seat 08)'
    },
    marks: {
      q1_1: 2, q1_2: 2, q1_3: 1, q1_4: 2, q1_5: 2, q1_6: 2, q1_7: 1.5, q1_8: 2, q1_9: 2, q1_10: 2,
      q2_1: 5.5, q2_2: 6, q2_3: 5, q2_4: 5.5, q2_5: 6,
      q3_1: 7.5, q3_2: 8, q3_3: 7, q3_4: 8, q3_5: 7.5,
      q4_2: 9.5
    },
    facultyRemarks: 'Good graph traversal representation. Case study design covers distributed synchronization nicely.',
    hodReviewStatus: 'Approved',
    hodRemarks: 'Verified and certified by HOD. Approved for result declaration.',
    evaluatedDate: '14-05-2026',
    annotations: []
  },
  {
    id: 'AS-CSE-0005',
    barcode: 'BAR-2026-904132',
    subjectCode: 'BTCS-T-PC-402',
    subjectName: 'Computer Organization & Architecture',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    department: 'Computer Science & Engineering',
    bundleId: 'BND-2026-04-COA',
    examDate: '07-05-2026',
    totalPages: 8,
    status: 'In Progress',
    assignedFaculty: {
      id: 'FAC-029',
      name: 'Dr. R. Sahoo',
      dept: 'CSE',
      assignedDate: '11-05-2026',
      deadline: '25-05-2026'
    },
    secretStudentMapping: {
      registrationNumber: '2401432269',
      rollNumber: '2401432269',
      name: 'DEBASISH NAYAK',
      branch: 'Computer Science & Engineering',
      section: 'CSE - Genius',
      examHall: 'Hall B-201 (Seat 19)'
    },
    marks: {
      q1_1: 2, q1_2: 2, q1_3: 1.5, q1_4: 2, q1_5: 1.5,
      q2_1: 5, q2_2: 6, q2_3: 4.5
    },
    facultyRemarks: '',
    hodReviewStatus: 'Not Submitted',
    hodRemarks: '',
    evaluatedDate: null,
    annotations: []
  },
  {
    id: 'AS-CSE-0006',
    barcode: 'BAR-2026-904133',
    subjectCode: 'BTCS-T-PC-402',
    subjectName: 'Computer Organization & Architecture',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    department: 'Computer Science & Engineering',
    bundleId: 'BND-2026-04-COA',
    examDate: '07-05-2026',
    totalPages: 8,
    status: 'Assigned',
    assignedFaculty: {
      id: 'FAC-029',
      name: 'Dr. R. Sahoo',
      dept: 'CSE',
      assignedDate: '11-05-2026',
      deadline: '25-05-2026'
    },
    secretStudentMapping: {
      registrationNumber: '2401432270',
      rollNumber: '2401432270',
      name: 'CHINMAYA MOHAPATRA',
      branch: 'Computer Science & Engineering',
      section: 'CSE - Genius',
      examHall: 'Hall B-201 (Seat 22)'
    },
    marks: {},
    facultyRemarks: '',
    hodReviewStatus: 'Not Submitted',
    hodRemarks: '',
    evaluatedDate: null,
    annotations: []
  }
];

// ── Initial Practical & Lab Evaluation Records (Lab Staff Portal) ──
export const INITIAL_LAB_EVALUATIONS = [
  {
    id: 'LAB-EV-001',
    studentRegNo: '2401432265',
    studentName: 'BISHNU PRASAD SAHOO',
    subjectCode: 'BTCS-P-PC-403',
    subjectName: 'Python Programming Lab',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    section: 'CSE - Genius',
    experimentCount: 12,
    logbookRecordMarks: 19, // Max 20
    continuousInternalAssessment: 19, // Max 20
    vivaVoceMarks: 18.5, // Max 20
    practicalExecutionMarks: 38, // Max 40
    totalMarks: 94.5, // Max 100
    grade: 'O',
    staffEvaluator: 'Mr. Biswajit Sahoo (Lab Supt.)',
    verifiedDate: '14-10-2026',
    status: 'Certified'
  },
  {
    id: 'LAB-EV-002',
    studentRegNo: '2401432266',
    studentName: 'ANANYA MISHRA',
    subjectCode: 'BTCS-P-PC-403',
    subjectName: 'Python Programming Lab',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    section: 'CSE - Genius',
    experimentCount: 12,
    logbookRecordMarks: 18,
    continuousInternalAssessment: 18,
    vivaVoceMarks: 17,
    practicalExecutionMarks: 36,
    totalMarks: 89,
    grade: 'E',
    staffEvaluator: 'Mr. Biswajit Sahoo (Lab Supt.)',
    verifiedDate: '14-10-2026',
    status: 'Certified'
  },
  {
    id: 'LAB-EV-003',
    studentRegNo: '2401432267',
    studentName: 'SOUMYA RANJAN ROUT',
    subjectCode: 'BTCS-P-PC-401',
    subjectName: 'Design & Analysis of Algorithms Lab',
    semester: '4th Semester',
    batch: 'BTECH 2028-P',
    section: 'CSE - Genius',
    experimentCount: 10,
    logbookRecordMarks: 17.5,
    continuousInternalAssessment: 18,
    vivaVoceMarks: 18,
    practicalExecutionMarks: 37,
    totalMarks: 90.5,
    grade: 'O',
    staffEvaluator: 'Mr. Biswajit Sahoo (Lab Supt.)',
    verifiedDate: '15-10-2026',
    status: 'Certified'
  }
];

// ── Strict Business Rules Engine: Calculate Section Marks & Total ──
export function calculateEvaluationSummary(marks = {}) {
  const result = {
    sections: {},
    grandTotal: 0,
    maxPossibleMarks: 100,
    totalAttemptedQuestions: 0,
    totalCountedQuestions: 0,
    percentage: 0,
    grade: 'F',
    hasViolation: false,
    violationMessages: []
  };

  let cumulativeMarks = 0;
  let cumulativeAttempts = 0;

  EVALUATION_SCHEME.sections.forEach((section) => {
    const secId = section.id;
    const attemptedQuestions = [];

    section.questions.forEach((q) => {
      const val = marks[q.id];
      if (val !== undefined && val !== null && val !== '' && !isNaN(val)) {
        const score = Math.max(0, Math.min(Number(val), q.maxMarks));
        attemptedQuestions.push({
          id: q.id,
          label: q.label,
          num: q.num,
          score,
          maxMarks: q.maxMarks
        });
      }
    });

    const attemptCount = attemptedQuestions.length;
    cumulativeAttempts += attemptCount;

    // Rule: Sort attempts by score descending to pick the BEST N attempts!
    const sortedAttempts = [...attemptedQuestions].sort((a, b) => b.score - a.score);

    const countedAttempts = sortedAttempts.slice(0, section.requiredAttempts);
    const extraAttempts = sortedAttempts.slice(section.requiredAttempts);

    // Sum counted scores
    let sectionTotal = countedAttempts.reduce((sum, item) => sum + item.score, 0);

    // Cap strictly at section maxMarks
    sectionTotal = Math.min(sectionTotal, section.maxMarks);

    // Create a lookup for UI badging
    const countedIds = new Set(countedAttempts.map(a => a.id));
    const extraIds = new Set(extraAttempts.map(a => a.id));

    result.sections[secId] = {
      sectionId: secId,
      title: section.title,
      maxMarks: section.maxMarks,
      requiredAttempts: section.requiredAttempts,
      questionsAvailable: section.questionsAvailable,
      attemptCount,
      countedAttemptsCount: countedAttempts.length,
      extraAttemptsCount: extraAttempts.length,
      countedIds,
      extraIds,
      sectionTotal: parseFloat(sectionTotal.toFixed(2)),
      isCapped: extraAttempts.length > 0
    };

    cumulativeMarks += sectionTotal;
    result.totalCountedQuestions += countedAttempts.length;
  });

  result.totalAttemptedQuestions = cumulativeAttempts;
  result.grandTotal = parseFloat(cumulativeMarks.toFixed(2));
  result.percentage = parseFloat(((result.grandTotal / 100) * 100).toFixed(1));

  // Determine Letter Grade (BPUT Standard)
  if (result.percentage >= 90) result.grade = 'O (Outstanding)';
  else if (result.percentage >= 80) result.grade = 'E (Excellent)';
  else if (result.percentage >= 70) result.grade = 'A (Very Good)';
  else if (result.percentage >= 60) result.grade = 'B (Good)';
  else if (result.percentage >= 50) result.grade = 'C (Fair)';
  else if (result.percentage >= 40) result.grade = 'D (Pass)';
  else result.grade = 'F (Fail)';

  return result;
}

// ── Store Controller Class ──
class DigitalEvaluationStore {
  constructor() {
    this.sheets = [];
    this.labRecords = [];
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.sheets = parsed.sheets || INITIAL_ANSWER_SHEETS;
        this.labRecords = parsed.labRecords || INITIAL_LAB_EVALUATIONS;
        return;
      }
    } catch (e) {
      console.warn('Error reading evaluation store, resetting to initial dataset:', e);
    }
    this.sheets = INITIAL_ANSWER_SHEETS;
    this.labRecords = INITIAL_LAB_EVALUATIONS;
    this.save();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sheets: this.sheets,
        labRecords: this.labRecords
      }));
      window.dispatchEvent(new CustomEvent('digital_evaluation_store_updated'));
    } catch (e) {
      console.error('Error saving evaluation store:', e);
    }
  }

  // Sheets methods
  getAllSheets() {
    return [...this.sheets];
  }

  getSheetById(id) {
    return this.sheets.find(s => s.id === id);
  }

  getSheetsByFaculty(facultyId = 'FAC-042') {
    return this.sheets.filter(s => s.assignedFaculty?.id === facultyId);
  }

  getSheetsBySubject(subjectCode) {
    if (!subjectCode || subjectCode === 'ALL') return [...this.sheets];
    return this.sheets.filter(s => s.subjectCode === subjectCode);
  }

  saveDraftMarks(sheetId, marks, facultyRemarks, annotations = []) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (!sheet) return false;

    sheet.marks = { ...marks };
    sheet.facultyRemarks = facultyRemarks;
    sheet.annotations = [...annotations];
    sheet.status = 'In Progress';
    this.save();
    return true;
  }

  submitEvaluationToHod(sheetId, marks, facultyRemarks, annotations = []) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (!sheet) return false;

    sheet.marks = { ...marks };
    sheet.facultyRemarks = facultyRemarks;
    sheet.annotations = [...annotations];
    sheet.status = 'Submitted';
    sheet.evaluatedDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    sheet.hodReviewStatus = 'Under Review';
    this.save();
    return true;
  }

  hodApproveEvaluation(sheetId, hodRemarks = '') {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (!sheet) return false;

    sheet.status = 'HOD Approved';
    sheet.hodReviewStatus = 'Approved';
    sheet.hodRemarks = hodRemarks || 'Verified and approved by Head of Department.';
    this.save();
    return true;
  }

  hodReturnEvaluation(sheetId, hodRemarks = '') {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (!sheet) return false;

    sheet.status = 'Returned';
    sheet.hodReviewStatus = 'Returned for Correction';
    sheet.hodRemarks = hodRemarks || 'Please review Section 2 question scoring calibration.';
    this.save();
    return true;
  }

  assignFacultyToBundle(sheetIds, facultyObj) {
    this.sheets.forEach(s => {
      if (sheetIds.includes(s.id)) {
        s.assignedFaculty = { ...facultyObj };
        s.status = 'Assigned';
      }
    });
    this.save();
    return true;
  }

  uploadNewBundle(newSheets = []) {
    this.sheets = [...newSheets, ...this.sheets];
    this.save();
    return true;
  }

  // Lab records methods
  getLabRecords() {
    return [...this.labRecords];
  }

  addLabRecord(record) {
    this.labRecords.unshift(record);
    this.save();
    return true;
  }

  resetToDefault() {
    this.sheets = INITIAL_ANSWER_SHEETS;
    this.labRecords = INITIAL_LAB_EVALUATIONS;
    this.save();
  }
}

export const digitalEvalStore = new DigitalEvaluationStore();
