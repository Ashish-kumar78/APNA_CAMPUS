import { describe, expect, it } from 'vitest';

// Pure utility calculations mirroring backend & frontend report generators
export function calculateAttendancePercentage(present, totalClasses) {
  if (!totalClasses || totalClasses <= 0) return 'N/A';
  return ((present / totalClasses) * 100).toFixed(2) + '%';
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return { valid: true };
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  if (start > end) {
    return { valid: false, error: 'Start Date cannot be later than End Date' };
  }
  return { valid: true };
}

export function determineAcademicStatus(cgpa) {
  const score = parseFloat(cgpa);
  if (isNaN(score)) return 'Under Review';
  if (score >= 8.5) return "Distinction / Dean's List";
  if (score >= 6.5) return 'Good Standing';
  if (score >= 5.0) return 'Satisfactory';
  return 'Academic Review / Warning';
}

export function determineResultStatus(sgpa, isPublished = true) {
  if (!isPublished) return 'Pending / Under Evaluation';
  const score = parseFloat(sgpa);
  if (isNaN(score)) return 'Incomplete';
  return score >= 5.0 ? 'Pass' : 'Fail / Backlog';
}

export function calculateDocumentVerification(requiredDocsCount, submittedDocs, verifiedDocs) {
  const pending = Math.max(0, requiredDocsCount - (verifiedDocs || 0));
  let status = 'Pending Verification';
  if (verifiedDocs >= requiredDocsCount) {
    status = 'Fully Verified';
  } else if (verifiedDocs > 0) {
    status = 'Partially Verified';
  } else if (submittedDocs > 0) {
    status = 'Submitted / Under Audit';
  }
  return {
    totalRequired: requiredDocsCount,
    submitted: submittedDocs,
    verified: verifiedDocs,
    pending,
    status,
  };
}

export function resolveRoleDepartmentScope(userRole, userDepartment) {
  const collegeWideRoles = ['management', 'principal', 'admin', 'super_admin', 'exam_cell'];
  const normalizedRole = (userRole || '').toLowerCase();
  
  if (collegeWideRoles.includes(normalizedRole)) {
    return { isRestricted: false, allowedDepartment: null };
  }
  if (normalizedRole === 'hod' || normalizedRole === 'faculty') {
    return { isRestricted: true, allowedDepartment: userDepartment || 'CSE' };
  }
  return { isRestricted: false, allowedDepartment: null };
}

describe('Report Generation Module - Unit & Calculation Tests', () => {
  describe('Attendance Calculations', () => {
    it('accurately calculates attendance percentage with standard inputs', () => {
      // 54 present out of 60 classes -> 90.00%
      expect(calculateAttendancePercentage(54, 60)).toBe('90.00%');
      // 57 present out of 60 classes -> 95.00%
      expect(calculateAttendancePercentage(57, 60)).toBe('95.00%');
      // 48 present out of 60 classes -> 80.00%
      expect(calculateAttendancePercentage(48, 60)).toBe('80.00%');
    });

    it('handles floating point precision properly (e.g. 1/3)', () => {
      expect(calculateAttendancePercentage(1, 3)).toBe('33.33%');
      expect(calculateAttendancePercentage(2, 3)).toBe('66.67%');
    });

    it('safely handles zero classes held period without division by zero', () => {
      expect(calculateAttendancePercentage(0, 0)).toBe('N/A');
      expect(calculateAttendancePercentage(5, 0)).toBe('N/A');
      expect(calculateAttendancePercentage(0, -10)).toBe('N/A');
    });

    it('handles 100% and 0% attendance boundaries', () => {
      expect(calculateAttendancePercentage(50, 50)).toBe('100.00%');
      expect(calculateAttendancePercentage(0, 50)).toBe('0.00%');
    });
  });

  describe('Date Range Filtering & Validation', () => {
    it('approves valid date ranges where start date precedes end date', () => {
      const res = validateDateRange('2026-07-01', '2026-10-09');
      expect(res.valid).toBe(true);
    });

    it('approves identical start and end dates (single day range)', () => {
      const res = validateDateRange('2026-10-09', '2026-10-09');
      expect(res.valid).toBe(true);
    });

    it('strictly rejects when start date is later than end date', () => {
      const res = validateDateRange('2026-10-15', '2026-10-01');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Start Date cannot be later than End Date');
    });

    it('handles empty date strings gracefully', () => {
      expect(validateDateRange('', '').valid).toBe(true);
      expect(validateDateRange('2026-01-01', '').valid).toBe(true);
    });
  });

  describe('CGPA & Academic Status Classification', () => {
    it('classifies CGPA >= 8.5 as Distinction / Dean\'s List', () => {
      expect(determineAcademicStatus(9.2)).toBe("Distinction / Dean's List");
      expect(determineAcademicStatus(8.5)).toBe("Distinction / Dean's List");
    });

    it('classifies CGPA between 6.5 and 8.49 as Good Standing', () => {
      expect(determineAcademicStatus(8.49)).toBe('Good Standing');
      expect(determineAcademicStatus(7.2)).toBe('Good Standing');
      expect(determineAcademicStatus(6.5)).toBe('Good Standing');
    });

    it('classifies CGPA between 5.0 and 6.49 as Satisfactory', () => {
      expect(determineAcademicStatus(5.5)).toBe('Satisfactory');
      expect(determineAcademicStatus(5.0)).toBe('Satisfactory');
    });

    it('flags CGPA < 5.0 for Academic Review / Warning', () => {
      expect(determineAcademicStatus(4.85)).toBe('Academic Review / Warning');
      expect(determineAcademicStatus(3.2)).toBe('Academic Review / Warning');
    });
  });

  describe('SGPA & Semester Result Status Classification', () => {
    it('marks passing SGPA as Pass for finalized results', () => {
      expect(determineResultStatus(7.8, true)).toBe('Pass');
      expect(determineResultStatus(5.0, true)).toBe('Pass');
    });

    it('marks SGPA below 5.0 as Fail / Backlog', () => {
      expect(determineResultStatus(4.3, true)).toBe('Fail / Backlog');
      expect(determineResultStatus(2.0, true)).toBe('Fail / Backlog');
    });

    it('respects unfinalized / unpublished results', () => {
      expect(determineResultStatus(8.5, false)).toBe('Pending / Under Evaluation');
    });
  });

  describe('Document Verification Status Engine', () => {
    it('computes Fully Verified when all 5 required documents are verified', () => {
      const doc = calculateDocumentVerification(5, 5, 5);
      expect(doc.totalRequired).toBe(5);
      expect(doc.submitted).toBe(5);
      expect(doc.verified).toBe(5);
      expect(doc.pending).toBe(0);
      expect(doc.status).toBe('Fully Verified');
    });

    it('computes Partially Verified when some documents are verified', () => {
      const doc = calculateDocumentVerification(5, 4, 3);
      expect(doc.verified).toBe(3);
      expect(doc.pending).toBe(2);
      expect(doc.status).toBe('Partially Verified');
    });

    it('computes Submitted / Under Audit when submitted but 0 verified', () => {
      const doc = calculateDocumentVerification(5, 4, 0);
      expect(doc.pending).toBe(5);
      expect(doc.status).toBe('Submitted / Under Audit');
    });

    it('computes Pending Verification when 0 submitted and 0 verified', () => {
      const doc = calculateDocumentVerification(5, 0, 0);
      expect(doc.pending).toBe(5);
      expect(doc.status).toBe('Pending Verification');
    });
  });

  describe('Role-Based Access Control and Branch Scoping', () => {
    it('locks HOD to their authorized department', () => {
      const hodScope = resolveRoleDepartmentScope('hod', 'Computer Science & Engineering');
      expect(hodScope.isRestricted).toBe(true);
      expect(hodScope.allowedDepartment).toBe('Computer Science & Engineering');
    });

    it('locks Faculty to their department', () => {
      const facultyScope = resolveRoleDepartmentScope('faculty', 'ECE');
      expect(facultyScope.isRestricted).toBe(true);
      expect(facultyScope.allowedDepartment).toBe('ECE');
    });

    it('grants institution-wide scope to Management, Principal, Admin, and Super Admin', () => {
      expect(resolveRoleDepartmentScope('management').isRestricted).toBe(false);
      expect(resolveRoleDepartmentScope('principal').isRestricted).toBe(false);
      expect(resolveRoleDepartmentScope('admin').isRestricted).toBe(false);
      expect(resolveRoleDepartmentScope('super_admin').isRestricted).toBe(false);
      expect(resolveRoleDepartmentScope('exam_cell').isRestricted).toBe(false);
    });
  });
});
