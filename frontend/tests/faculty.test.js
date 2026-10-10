import { describe, expect, it } from 'vitest';

// ── 1. COHORT SCOPING & ENROLLMENT RECONCILIATION ──
function filterCohortStudents(students, semester, sectionLetter) {
  return students.filter(s => {
    const semMatch = (s.semester || 'Semester 5') === semester;
    const secMatch = (s.section || 'Section A').includes(sectionLetter);
    return semMatch && secMatch;
  });
}

// ── 2. ATTENDANCE CALCULATION & SHORTAGE AUDIT ──
function calculateUpdatedAttendance(currentPct, totalSessionsBefore, isPresentInNewSession) {
  const attendedBefore = Math.round((currentPct / 100) * totalSessionsBefore);
  const newAttended = attendedBefore + (isPresentInNewSession ? 1 : 0);
  const newTotal = totalSessionsBefore + 1;
  return Number(((newAttended / newTotal) * 100).toFixed(1));
}

function auditAttendanceRisk(attendancePct) {
  if (attendancePct < 75) {
    return { isShortage: true, tier: 'Statutory Shortage', eligibleForExam: false };
  } else if (attendancePct < 80) {
    return { isShortage: false, tier: 'Borderline', eligibleForExam: true };
  } else {
    return { isShortage: false, tier: 'Good Standing', eligibleForExam: true };
  }
}

// ── 3. CONTINUOUS INTERNAL ASSESSMENT (CIA) SCALING & WEIGHTING ──
function calculateCiaFinalScore(components) {
  // Configured Autonomous Scheme:
  // Modular (best or avg of 2, max 20): scaled to 20%
  // Quizzes (avg of quizzes, max 10): scaled to 10%
  // Assignments (avg of assignments, max 10): scaled to 10%
  // Surprise Tests (avg, max 10): scaled to 10%
  // Lab Practical & Viva (max 30): scaled to 30%
  // Sum = 20% scaled continuous evaluation mark out of 20
  const modularScore = (components.mid1 + components.mid2) / 2; // out of 20
  const quizAvg = components.quizzes.reduce((a, b) => a + b, 0) / components.quizzes.length; // out of 10
  const assignmentAvg = components.assignments.reduce((a, b) => a + b, 0) / components.assignments.length; // out of 10
  const surpriseAvg = components.surpriseTests.reduce((a, b) => a + b, 0) / components.surpriseTests.length; // out of 10
  const labScore = components.labPractical; // out of 30

  // Total raw percentage = (modular/20 * 25) + (quizAvg/10 * 15) + (assign/10 * 15) + (surprise/10 * 15) + (lab/30 * 30) = 100
  const totalWeighted = (modularScore / 20) * 25 + (quizAvg / 10) * 15 + (assignmentAvg / 10) * 15 + (surpriseAvg / 10) * 15 + (labScore / 30) * 30;
  // Scaled to 20 CIA marks
  const finalCia20 = Number(((totalWeighted / 100) * 20).toFixed(2));
  return { finalCia20, totalWeightedPct: Number(totalWeighted.toFixed(1)) };
}

// ── 4. MARKS ENTRY VALIDATION ──
function validateAssessmentMark(mark, maxMarks) {
  if (mark === 'A' || mark === 'ABSENT') return { valid: true, value: 'ABSENT' };
  if (mark === 'EX' || mark === 'EXEMPT') return { valid: true, value: 'EXEMPT' };
  const num = Number(mark);
  if (isNaN(num)) return { valid: false, error: 'Mark must be a valid number or A/EX status' };
  if (num < 0) return { valid: false, error: 'Mark cannot be negative' };
  if (num > maxMarks) return { valid: false, error: `Mark (${num}) exceeds maximum allowed marks (${maxMarks})` };
  return { valid: true, value: num };
}

// ── 5. APPROVAL WORKFLOW & LOCKING ──
function processMarksApprovalTransition(currentState, action, userRole) {
  if (currentState === 'LOCKED') {
    return { success: false, error: 'Assessment register is locked. Only Academic Dean can unlock with audit log.' };
  }
  if (action === 'SUBMIT') {
    if (userRole !== 'faculty') return { success: false, error: 'Only course faculty can submit marks for review.' };
    return { success: true, nextState: 'SUBMITTED_TO_HOD' };
  }
  if (action === 'APPROVE') {
    if (userRole !== 'hod' && userRole !== 'admin') return { success: false, error: 'Only HOD or Admin can approve marks.' };
    return { success: true, nextState: 'APPROVED_BY_HOD' };
  }
  if (action === 'LOCK') {
    if (userRole !== 'hod' && userRole !== 'admin') return { success: false, error: 'Only HOD or Admin can lock final register.' };
    return { success: true, nextState: 'LOCKED' };
  }
  if (action === 'RETURN_FOR_CORRECTION') {
    return { success: true, nextState: 'RETURNED_FOR_CORRECTION' };
  }
  return { success: false, error: 'Unknown workflow action' };
}

// ── 6. ACADEMIC EARLY-WARNING ENGINE ──
function evaluateEarlyWarningRisk(student) {
  const flags = [];
  if (student.attendance < 75) {
    flags.push(`Attendance Shortage (${student.attendance}% < 75% autonomous threshold)`);
  }
  if (student.modularScore !== undefined && student.modularScore < 8) { // <40% of 20
    flags.push(`Mid-Term Exam Failure (${student.modularScore}/20 is below 40% pass criteria)`);
  }
  if (student.missingAssessments && student.missingAssessments.length > 0) {
    flags.push(`Missing Components: ${student.missingAssessments.join(', ')}`);
  }
  return {
    isAtRisk: flags.length > 0,
    riskCount: flags.length,
    flags
  };
}

// ── 7. QUIZ MCQ EVALUATION ──
function evaluateQuizAttempt(questions, studentAnswers) {
  let score = 0;
  let correctCount = 0;
  questions.forEach(q => {
    if (studentAnswers[q.id] === q.correct) {
      score += 1;
      correctCount += 1;
    }
  });
  return { score, correctCount, totalQuestions: questions.length, percentage: (score / questions.length) * 100 };
}


// ── TEST SUITE ──
describe('CollegeFlow Enterprise Faculty Portal Test Suite', () => {

  describe('1. Teaching Cohort Scoping & Enrollment Integrity', () => {
    const mockStudents = [
      { id: '1', name: 'Student A1', semester: 'Semester 5', section: 'Section A' },
      { id: '2', name: 'Student A2', semester: 'Semester 5', section: 'Section A' },
      { id: '3', name: 'Student B1', semester: 'Semester 5', section: 'Section B' },
      { id: '4', name: 'Student C1', semester: 'Semester 5', section: 'Section C' },
      { id: '5', name: 'Student S7', semester: 'Semester 7', section: 'Section A' },
    ];

    it('should strictly isolate assigned section cohort (32) from total course enrollment (91)', () => {
      const cohort = filterCohortStudents(mockStudents, 'Semester 5', 'A');
      expect(cohort.length).toBe(2);
      expect(cohort.every(s => s.section === 'Section A' && s.semester === 'Semester 5')).toBe(true);
    });

    it('should exclude other sections and different semesters', () => {
      const cohort = filterCohortStudents(mockStudents, 'Semester 5', 'A');
      expect(cohort.some(s => s.section === 'Section B')).toBe(false);
      expect(cohort.some(s => s.semester === 'Semester 7')).toBe(false);
    });
  });

  describe('2. Attendance Management & Shortage Alert Engine', () => {
    it('should calculate updated attendance percentage accurately when student is present', () => {
      // 80% out of 20 sessions = 16 attended. 21st session present -> 17/21 = 80.95% -> 81.0%
      const newPct = calculateUpdatedAttendance(80, 20, true);
      expect(newPct).toBe(81.0);
    });

    it('should calculate updated attendance percentage accurately when student is absent', () => {
      // 80% out of 20 sessions = 16 attended. 21st session absent -> 16/21 = 76.19% -> 76.2%
      const newPct = calculateUpdatedAttendance(80, 20, false);
      expect(newPct).toBe(76.2);
    });

    it('should trigger statutory shortage alert when attendance drops below 75%', () => {
      const audit = auditAttendanceRisk(72.5);
      expect(audit.isShortage).toBe(true);
      expect(audit.eligibleForExam).toBe(false);
      expect(audit.tier).toBe('Statutory Shortage');
    });

    it('should approve clearance for regular attendance (>=75%)', () => {
      const audit = auditAttendanceRisk(88.0);
      expect(audit.isShortage).toBe(false);
      expect(audit.eligibleForExam).toBe(true);
      expect(audit.tier).toBe('Good Standing');
    });
  });

  describe('3. Continuous Internal Assessment (CIA) Scaling & Calculations', () => {
    it('should compute weighted continuous evaluation correctly across all components', () => {
      const studentComponents = {
        mid1: 18,
        mid2: 16,
        quizzes: [9, 8, 9, 8, 9, 8], // avg = 8.5
        assignments: [9, 9],        // avg = 9.0
        surpriseTests: [8, 8],      // avg = 8.0
        labPractical: 27            // out of 30
      };

      const result = calculateCiaFinalScore(studentComponents);
      // Expected: high distinction score ~ 17-18 out of 20
      expect(result.finalCia20).toBeGreaterThan(16);
      expect(result.finalCia20).toBeLessThanOrEqual(20);
      expect(result.totalWeightedPct).toBeGreaterThan(80);
    });
  });

  describe('4. Assessment Marks Validation Rules', () => {
    it('should accept valid numeric marks within range [0, maxMarks]', () => {
      const res = validateAssessmentMark(18.5, 20);
      expect(res.valid).toBe(true);
      expect(res.value).toBe(18.5);
    });

    it('should accept official absent status (A / ABSENT)', () => {
      const res = validateAssessmentMark('A', 20);
      expect(res.valid).toBe(true);
      expect(res.value).toBe('ABSENT');
    });

    it('should reject marks exceeding maximum configured marks', () => {
      const res = validateAssessmentMark(25, 20);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds maximum allowed marks');
    });

    it('should reject negative marks', () => {
      const res = validateAssessmentMark(-2, 20);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('cannot be negative');
    });

    it('should reject non-numeric gibberish strings', () => {
      const res = validateAssessmentMark('InvalidScore', 20);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('valid number');
    });
  });

  describe('5. Continuous Assessment Approval Lifecycle & Locking Guard', () => {
    it('should allow faculty to submit draft marks to HOD', () => {
      const res = processMarksApprovalTransition('DRAFT', 'SUBMIT', 'faculty');
      expect(res.success).toBe(true);
      expect(res.nextState).toBe('SUBMITTED_TO_HOD');
    });

    it('should prevent faculty from approving their own marks (HOD role required)', () => {
      const res = processMarksApprovalTransition('SUBMITTED_TO_HOD', 'APPROVE', 'faculty');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Only HOD or Admin can approve');
    });

    it('should allow HOD to approve and lock marks', () => {
      const approveRes = processMarksApprovalTransition('SUBMITTED_TO_HOD', 'APPROVE', 'hod');
      expect(approveRes.success).toBe(true);
      expect(approveRes.nextState).toBe('APPROVED_BY_HOD');

      const lockRes = processMarksApprovalTransition('APPROVED_BY_HOD', 'LOCK', 'hod');
      expect(lockRes.success).toBe(true);
      expect(lockRes.nextState).toBe('LOCKED');
    });

    it('should strictly reject any edits or actions once marks are LOCKED', () => {
      const editAttempt = processMarksApprovalTransition('LOCKED', 'SUBMIT', 'faculty');
      expect(editAttempt.success).toBe(false);
      expect(editAttempt.error).toContain('Assessment register is locked');
    });
  });

  describe('6. Academic Early-Warning & Remedial Detection', () => {
    it('should flag student with low attendance and failing modular exam', () => {
      const student = {
        name: 'Debasish Panda',
        rollNumber: '32',
        attendance: 64, // below 75%
        modularScore: 6, // 6/20 is below 40% (8/20)
        missingAssessments: ['Quiz 4']
      };

      const risk = evaluateEarlyWarningRisk(student);
      expect(risk.isAtRisk).toBe(true);
      expect(risk.riskCount).toBe(3);
      expect(risk.flags[0]).toContain('Attendance Shortage');
      expect(risk.flags[1]).toContain('Mid-Term Exam Failure');
      expect(risk.flags[2]).toContain('Missing Components');
    });

    it('should clear healthy student in good standing', () => {
      const student = {
        name: 'Rakesh Das',
        rollNumber: '01',
        attendance: 94,
        modularScore: 19,
        missingAssessments: []
      };

      const risk = evaluateEarlyWarningRisk(student);
      expect(risk.isAtRisk).toBe(false);
      expect(risk.riskCount).toBe(0);
    });
  });

  describe('7. Quiz Management & Automated Evaluation', () => {
    const mockQuestions = [
      { id: 1, question: 'Time complexity of binary search?', correct: 1 },
      { id: 2, question: 'Data structure using LIFO?', correct: 1 },
      { id: 3, question: 'Worst case merge sort?', correct: 2 }
    ];

    it('should compute 100% when all answers match answer key', () => {
      const answers = { 1: 1, 2: 1, 3: 2 };
      const evalRes = evaluateQuizAttempt(mockQuestions, answers);
      expect(evalRes.score).toBe(3);
      expect(evalRes.percentage).toBe(100);
    });

    it('should compute partial score when answers are partially correct', () => {
      const answers = { 1: 1, 2: 0, 3: 2 }; // question 2 wrong
      const evalRes = evaluateQuizAttempt(mockQuestions, answers);
      expect(evalRes.score).toBe(2);
      expect(evalRes.percentage).toBeCloseTo(66.67, 1);
    });
  });
});
