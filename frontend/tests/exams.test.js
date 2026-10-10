import { describe, expect, it } from 'vitest';

// Grade point mapping function
function getGradePoints(grade) {
  const map = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0
  };
  return map[grade] ?? 0;
}

// SGPA Credit-weighted engine
function calculateSgpa(courses) {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    if (c.credits > 0) {
      totalPoints += c.credits * getGradePoints(c.grade);
      totalCredits += c.credits;
    }
  }
  return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
}

// Admit card eligibility verification
function verifyAdmitCardEligibility(student) {
  if (student.attendance < 75 && !student.isCondoned) {
    return { eligible: false, reason: 'Attendance deficit (< 75%) without approved condonation' };
  }
  if (student.feePending > 0 && !student.feeWaiverApproved) {
    return { eligible: false, reason: 'Pending semester dues without institutional waiver' };
  }
  return { eligible: true, reason: 'Verified and Cleared' };
}

// Timetable scheduling conflict check
function detectTimetableConflicts(existingSchedule, newPaper) {
  const conflicts = [];
  for (const paper of existingSchedule) {
    if (paper.date === newPaper.date && paper.time === newPaper.time) {
      // Check room clash
      if (paper.room && newPaper.room && paper.room === newPaper.room) {
        conflicts.push(`Room collision: ${paper.room} is already booked for ${paper.code}`);
      }
      // Check student cohort clash
      const sameBranch = paper.branches.some(b => newPaper.branches.includes(b));
      if (paper.semester === newPaper.semester && sameBranch) {
        conflicts.push(`Student schedule clash: ${paper.semester} semester cohort already has ${paper.code} in this slot`);
      }
    }
  }
  return conflicts;
}

// Marks moderation rule (max grace 2 points for borderline)
function applyModerationRule(currentMarks, passingThreshold, maxGrace = 2) {
  if (currentMarks >= passingThreshold) {
    return { awarded: 0, finalMarks: currentMarks, passed: true };
  }
  const shortfall = passingThreshold - currentMarks;
  if (shortfall <= maxGrace) {
    return { awarded: shortfall, finalMarks: passingThreshold, passed: true, rule: 'COE_BORDERLINE_GRACE_V1' };
  }
  return { awarded: 0, finalMarks: currentMarks, passed: false, rule: 'EXCEEDS_MAX_GRACE_LIMIT' };
}

describe('Controller of Examinations (CoE) Engine Unit Tests', () => {
  it('correctly calculates SGPA using credit-weighted grade points', () => {
    const courses = [
      { code: 'CS501', credits: 4, grade: 'O' },  // 4 * 10 = 40
      { code: 'CS502', credits: 4, grade: 'A+' }, // 4 * 9 = 36
      { code: 'CS503', credits: 4, grade: 'A+' }, // 4 * 9 = 36
      { code: 'CS504', credits: 3, grade: 'A' },  // 3 * 8 = 24
      { code: 'CS505', credits: 2, grade: 'O' },  // 2 * 10 = 20
      { code: 'CS506', credits: 2, grade: 'A+' }  // 2 * 9 = 18
    ];
    // Total points: 40 + 36 + 36 + 24 + 20 + 18 = 174
    // Total credits: 4 + 4 + 4 + 3 + 2 + 2 = 19
    // SGPA: 174 / 19 = 9.1578... -> 9.16
    const sgpa = calculateSgpa(courses);
    expect(sgpa).toBe(9.16);
  });

  it('correctly evaluates admit card clearance with attendance and fee rules', () => {
    // Normal student with good attendance and clear fees
    expect(verifyAdmitCardEligibility({ attendance: 82, feePending: 0 }).eligible).toBe(true);

    // Attendance deficit without condonation -> Denied
    const lowAtt = verifyAdmitCardEligibility({ attendance: 68, feePending: 0, isCondoned: false });
    expect(lowAtt.eligible).toBe(false);
    expect(lowAtt.reason).toContain('Attendance deficit');

    // Attendance deficit with medical condonation -> Approved
    const condoned = verifyAdmitCardEligibility({ attendance: 68, feePending: 0, isCondoned: true });
    expect(condoned.eligible).toBe(true);

    // Fee dues without waiver -> Denied
    const feeDue = verifyAdmitCardEligibility({ attendance: 85, feePending: 25000, feeWaiverApproved: false });
    expect(feeDue.eligible).toBe(false);
    expect(feeDue.reason).toContain('Pending semester dues');
  });

  it('detects timetable schedule clashes for room and candidate branch slots', () => {
    const existing = [
      {
        code: 'CS501',
        date: '2026-10-15',
        time: '10:00 AM - 01:00 PM',
        room: 'Hall-A',
        semester: '5th',
        branches: ['CSE', 'CSIT']
      }
    ];

    // Same room clash
    const roomClash = detectTimetableConflicts(existing, {
      code: 'EC501',
      date: '2026-10-15',
      time: '10:00 AM - 01:00 PM',
      room: 'Hall-A',
      semester: '5th',
      branches: ['ECE']
    });
    expect(roomClash.length).toBe(1);
    expect(roomClash[0]).toContain('Room collision: Hall-A');

    // Cohort student clash (different room, but same branch and semester at same time)
    const cohortClash = detectTimetableConflicts(existing, {
      code: 'CS502',
      date: '2026-10-15',
      time: '10:00 AM - 01:00 PM',
      room: 'Hall-B',
      semester: '5th',
      branches: ['CSE']
    });
    expect(cohortClash.length).toBe(1);
    expect(cohortClash[0]).toContain('Student schedule clash');

    // No clash (different date)
    const validSlot = detectTimetableConflicts(existing, {
      code: 'CS502',
      date: '2026-10-17',
      time: '10:00 AM - 01:00 PM',
      room: 'Hall-A',
      semester: '5th',
      branches: ['CSE']
    });
    expect(validSlot.length).toBe(0);
  });

  it('moderates borderline CIE marks strictly according to institutional grace caps', () => {
    // 38 marks with 40 pass mark -> 2 shortfall -> within +2 cap
    const borderline = applyModerationRule(38, 40, 2);
    expect(borderline.passed).toBe(true);
    expect(borderline.awarded).toBe(2);
    expect(borderline.finalMarks).toBe(40);

    // 36 marks with 40 pass mark -> 4 shortfall -> exceeds +2 cap
    const failing = applyModerationRule(36, 40, 2);
    expect(failing.passed).toBe(false);
    expect(failing.awarded).toBe(0);
    expect(failing.finalMarks).toBe(36);
  });
});
