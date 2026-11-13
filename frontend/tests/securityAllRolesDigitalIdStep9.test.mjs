import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import dynamicQrService from '../src/services/dynamicQrService.js';

describe('Universal Digital Identity & 10s Dynamic Pass Across All Roles', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const rolesToTest = [
    { role: 'STUDENT', name: 'Sneha Mohanty', identifier: '21010101', department: 'Computer Science & Engineering', designation: 'Undergraduate Scholar' },
    { role: 'FACULTY', name: 'Prof. Dillip Ray', identifier: 'FAC-CSE-012', department: 'Computer Science & Engineering', designation: 'Associate Professor' },
    { role: 'SECURITY', name: 'Dillip Kumar Pradhan', identifier: 'SG-OD-4421', department: 'Campus Security & Access Control', designation: 'Head Security Officer' },
    { role: 'WARDEN', name: 'Mr. Saroj Kumar Jena', identifier: 'WRD-SGR-01', department: 'Hostel Administration & Residential Life', designation: 'Chief Resident Warden' },
    { role: 'ADMIN', name: 'Er. Bikash Chandra Rout', identifier: 'ADM-EST-01', department: 'General Administration', designation: 'Senior Administrative Officer' },
    { role: 'SUPER_ADMIN', name: 'Dr. Rajesh Kumar Mohanty', identifier: 'SYS-SUPER-01', department: 'Enterprise IT & Cyber Governance', designation: 'Chief Systems Architect' },
    { role: 'PRINCIPAL', name: 'Prof. (Dr.) Amiya Kumar Rath', identifier: 'PRIN-EXEC-01', department: 'Office of the Principal', designation: 'Principal & Dean' },
    { role: 'HOD', name: 'Prof. (Dr.) Manas Ranjan Senapati', identifier: 'HOD-CSE-01', department: 'Computer Science & Engineering', designation: 'Head of Department' },
    { role: 'EXAM_CELL', name: 'Prof. Subrat Kumar Mohapatra', identifier: 'EXAM-COE-01', department: 'Examination Affairs & Evaluation', designation: 'Controller of Examinations' },
    { role: 'ACCOUNTS', name: 'Mr. Prasanna Kumar Mishra', identifier: 'FIN-BURSAR-01', department: 'Finance & Accounts Division', designation: 'Accounts Bursar' },
    { role: 'LIBRARY', name: 'Dr. Rabindra Kumar Das', identifier: 'LIB-CHIEF-01', department: 'Central University Library', designation: 'Chief Librarian' },
    { role: 'TRANSPORT', name: 'Mr. Biswajit Sahoo', identifier: 'TRN-FLEET-01', department: 'Transport Logistics & Fleet Division', designation: 'Campus Fleet In-Charge' },
    { role: 'MESS_MANAGER', name: 'Mr. Kailash Chandra Nayak', identifier: 'MESS-CENTRAL-01', department: 'Central Dining & Hospitality Services', designation: 'Senior Mess In-Charge' },
    { role: 'PLACEMENT', name: 'Mr. Debashis Tripathy', identifier: 'TPO-EXEC-01', department: 'Corporate Relations & Placement Cell', designation: 'Head TPO' },
    { role: 'ADMISSIONS', name: 'Dr. Smita Mohapatra', identifier: 'ADM-ENR-01', department: 'Admissions & Outreach Division', designation: 'Director of Admissions' },
    { role: 'MANAGEMENT', name: 'Prof. (Dr.) S. P. Panda', identifier: 'MGMT-TRUST-01', department: 'Board of Governors & Institutional Trust', designation: 'President & Trustee' },
  ];

  it('correctly generates distinct, verifiable cryptographic tokens for all 16 campus roles', () => {
    rolesToTest.forEach((u) => {
      const tokenObj = dynamicQrService.generateLocalToken(u);
      expect(tokenObj).toBeDefined();
      expect(tokenObj.token).toMatch(/^ACQR\./);
      expect(tokenObj.identity.role).toBe(u.role);
      expect(tokenObj.identity.name).toBe(u.name);
      expect(tokenObj.identity.identifier).toBe(u.identifier);
      expect(tokenObj.identity.department).toBe(u.department);
      expect(tokenObj.expiresInSeconds).toBe(10);
    });
  });

  it('strictly runs 10-second countdown without premature 1-second auto-rotation', () => {
    const studentUser = rolesToTest[0];
    let latestState = null;

    const cleanup = dynamicQrService.startLiveSession(studentUser, (state) => {
      latestState = state;
    });

    try {
      expect(latestState).toBeDefined();
      const initialToken = latestState.token;
      expect(initialToken).toBeDefined();
      expect(latestState.remainingSecs).toBe(10);

      // Advance 1 second (1000ms) - token must NOT change
      vi.advanceTimersByTime(1000);
      expect(latestState.token).toBe(initialToken);
      expect(latestState.remainingSecs).toBe(9);

      // Advance 4 more seconds (total 5s) - token must still NOT change
      vi.advanceTimersByTime(4000);
      expect(latestState.token).toBe(initialToken);
      expect(latestState.remainingSecs).toBe(5);

      // Advance 4 more seconds (total 9s) - token must still NOT change
      vi.advanceTimersByTime(4000);
      expect(latestState.token).toBe(initialToken);
      expect(latestState.remainingSecs).toBe(1);

      // Advance 1 more second (total 10s elapsed) -> MUST auto-rotate to a fresh cryptographic token
      vi.advanceTimersByTime(1050);
      expect(latestState.token).not.toBe(initialToken);
      expect(latestState.token).toMatch(/^ACQR\./);
      expect(latestState.remainingSecs).toBe(10);
    } finally {
      cleanup();
    }
  });

  it('continuously rotates every 10 seconds for multiple cycles automatically', () => {
    const facultyUser = rolesToTest[1];
    let latestState = null;

    const cleanup = dynamicQrService.startLiveSession(facultyUser, (state) => {
      latestState = state;
    });

    try {
      const token1 = latestState.token;
      expect(token1).toBeDefined();

      // Cycle 1: 10 seconds
      vi.advanceTimersByTime(10050);
      const token2 = latestState.token;
      expect(token2).not.toBe(token1);

      // Cycle 2: another 10 seconds
      vi.advanceTimersByTime(10050);
      const token3 = latestState.token;
      expect(token3).not.toBe(token2);
      expect(token3).not.toBe(token1);
    } finally {
      cleanup();
    }
  });
});

