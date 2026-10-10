import { describe, expect, it } from 'vitest';

// ── 1. DEPARTMENT DATA SCOPE RECONCILIATION ──
function reconcileDepartmentEnrollment(allStudents, deptCode) {
  // Department count should match active students across all departmental sections
  const deptStudents = allStudents.filter(s => (s.department || 'CSE') === deptCode);
  return {
    totalDepartmentStudents: deptStudents.length,
    bySemester: {
      'Semester 5': deptStudents.filter(s => (s.semester || 'Semester 5') === 'Semester 5').length,
      'Semester 3': deptStudents.filter(s => s.semester === 'Semester 3').length,
      'Semester 1': deptStudents.filter(s => s.semester === 'Semester 1').length,
    }
  };
}

// ── 2. MARKS APPROVAL STATE MACHINE ──
function processHodMarksAction(submission, action, payload = {}) {
  if (action === 'APPROVE') {
    if (submission.status === 'Approved') {
      return { success: false, error: 'Submission is already approved.' };
    }
    return {
      success: true,
      submission: {
        ...submission,
        status: 'Approved',
        reviewedBy: payload.reviewer || 'Dr. P. K. Pattnaik (HOD CSE)',
        reviewedAt: new Date().toISOString(),
        remarks: 'Approved by HOD. Verified continuous internal assessment components.'
      }
    };
  }

  if (action === 'REJECT') {
    if (!payload.reason || !payload.reason.trim()) {
      return { success: false, error: 'Mandatory actionable reason required for returning marks to faculty.' };
    }
    return {
      success: true,
      submission: {
        ...submission,
        status: 'Rejected',
        reviewedBy: payload.reviewer || 'Dr. P. K. Pattnaik (HOD CSE)',
        reviewedAt: new Date().toISOString(),
        remarks: payload.reason.trim()
      }
    };
  }

  if (action === 'UNLOCK') {
    if (submission.status !== 'Approved') {
      return { success: false, error: 'Only approved marks can be unlocked.' };
    }
    return {
      success: true,
      submission: {
        ...submission,
        status: 'Pending',
        reviewedBy: payload.reviewer || 'Dr. P. K. Pattnaik (HOD CSE)',
        remarks: `HOD Reopened for corrections: ${payload.reason || 'Syllabus/Marks modification'}`
      }
    };
  }

  return { success: false, error: 'Invalid workflow action' };
}

// ── 3. AT-RISK DIAGNOSTIC ENGINE ──
function auditStudentAcademicRisk(student) {
  const flags = [];
  if ((student.attendance || 85) < 75) {
    flags.push(`Attendance Shortage (${student.attendance}% < 75% autonomous threshold)`);
  }
  if (Number(student.cgpa) < 6.0) {
    flags.push(`CGPA Distress (${student.cgpa} < 6.0 academic minimum)`);
  }
  if (student.modularScore !== undefined && student.modularScore < 8) {
    flags.push(`Modular Examination Failure (${student.modularScore}/20 < 40%)`);
  }
  return {
    isAtRisk: flags.length > 0,
    severity: flags.length >= 2 ? 'CRITICAL' : flags.length === 1 ? 'HIGH' : 'NORMAL',
    reasons: flags
  };
}

// ── 4. FACULTY WORKLOAD OVERSIGHT ──
function auditFacultyWorkload(facultyMember) {
  const weeklyHours = facultyMember.weeklyHours || 14;
  const maxAllowed = 18;
  const minRequired = 12;
  const isOverloaded = weeklyHours > maxAllowed;
  const isUnderloaded = weeklyHours < minRequired;
  return {
    weeklyHours,
    isCompliant: !isOverloaded && !isUnderloaded,
    status: isOverloaded ? 'OVERLOADED' : isUnderloaded ? 'UNDERLOADED' : 'BALANCED'
  };
}

// ── TEST SUITE ──
describe('CollegeFlow Enterprise HOD Academic Governance Test Suite', () => {

  describe('1. Department Data Scope & Enrollment Reconciliation', () => {
    const mockStudents = Array.from({ length: 60 }, (_, i) => ({
      id: `S-${i + 1}`,
      rollNumber: String(i + 1).padStart(2, '0'),
      department: 'CSE',
      semester: i < 30 ? 'Semester 5' : 'Semester 3',
      section: i % 2 === 0 ? 'Section A' : 'Section B'
    }));

    it('should calculate total department students across all cohorts', () => {
      const summary = reconcileDepartmentEnrollment(mockStudents, 'CSE');
      expect(summary.totalDepartmentStudents).toBe(60);
      expect(summary.bySemester['Semester 5']).toBe(30);
      expect(summary.bySemester['Semester 3']).toBe(30);
    });
  });

  describe('2. Marks Moderation Approval Workflow', () => {
    const sampleSubmission = {
      id: 'AQ-101',
      subjectCode: 'CS501',
      subject: 'Data Structures',
      status: 'Pending',
      faculty: 'Dr. S. Mohanty'
    };

    it('should transition submission from Pending to Approved with reviewer and timestamp', () => {
      const res = processHodMarksAction(sampleSubmission, 'APPROVE', { reviewer: 'Dr. P. K. Pattnaik (HOD)' });
      expect(res.success).toBe(true);
      expect(res.submission.status).toBe('Approved');
      expect(res.submission.reviewedBy).toBe('Dr. P. K. Pattnaik (HOD)');
      expect(res.submission.reviewedAt).toBeDefined();
    });

    it('should reject marks submission with mandatory actionable feedback', () => {
      const reason = 'Quiz 4 marks missing for 4 students. Please complete and resubmit.';
      const res = processHodMarksAction(sampleSubmission, 'REJECT', { reason });
      expect(res.success).toBe(true);
      expect(res.submission.status).toBe('Rejected');
      expect(res.submission.remarks).toBe(reason);
    });

    it('should reject rejection attempt if reason is empty or whitespace', () => {
      const res = processHodMarksAction(sampleSubmission, 'REJECT', { reason: '   ' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('Mandatory actionable reason required');
    });

    it('should allow controlled unlocking of approved marks for faculty corrections', () => {
      const approvedSub = { ...sampleSubmission, status: 'Approved' };
      const res = processHodMarksAction(approvedSub, 'UNLOCK', { reason: 'Permitted correction of re-evaluated lab viva' });
      expect(res.success).toBe(true);
      expect(res.submission.status).toBe('Pending');
      expect(res.submission.remarks).toContain('HOD Reopened for corrections');
    });
  });

  describe('3. Department Academic At-Risk Diagnostic Engine', () => {
    it('should trigger CRITICAL alert when student has both attendance shortage and GPA distress', () => {
      const distressedStudent = {
        name: 'Debasish Panda',
        rollNumber: '32',
        attendance: 64, // <75%
        cgpa: '5.4',    // <6.0
        modularScore: 6 // <8
      };
      const audit = auditStudentAcademicRisk(distressedStudent);
      expect(audit.isAtRisk).toBe(true);
      expect(audit.severity).toBe('CRITICAL');
      expect(audit.reasons.length).toBe(3);
      expect(audit.reasons[0]).toContain('Attendance Shortage');
      expect(audit.reasons[1]).toContain('CGPA Distress');
      expect(audit.reasons[2]).toContain('Modular Examination Failure');
    });

    it('should clear students in good academic standing', () => {
      const goodStudent = {
        name: 'Rakesh Das',
        rollNumber: '01',
        attendance: 94,
        cgpa: '8.8',
        modularScore: 19
      };
      const audit = auditStudentAcademicRisk(goodStudent);
      expect(audit.isAtRisk).toBe(false);
      expect(audit.severity).toBe('NORMAL');
      expect(audit.reasons.length).toBe(0);
    });
  });

  describe('4. Faculty Workload & Allocation Oversight', () => {
    it('should verify balanced workload for faculty teaching 14 hours per week', () => {
      const faculty = { name: 'Dr. S. Mohanty', weeklyHours: 14 };
      const audit = auditFacultyWorkload(faculty);
      expect(audit.isCompliant).toBe(true);
      expect(audit.status).toBe('BALANCED');
    });

    it('should flag overloaded faculty teaching more than 18 hours per week', () => {
      const faculty = { name: 'Overworked Prof', weeklyHours: 22 };
      const audit = auditFacultyWorkload(faculty);
      expect(audit.isCompliant).toBe(false);
      expect(audit.status).toBe('OVERLOADED');
    });
  });
});
