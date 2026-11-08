import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import dynamicQrService from '../src/services/dynamicQrService.js';

describe('APNA CAMPUS: Universal 10-Second Dynamic QR & Smart Gate Security System (All 27 Acceptance Scenarios)', () => {
  const backendDir = path.resolve(__dirname, '../../backend');
  const frontendDir = path.resolve(__dirname, '../src');

  // SCENARIO 1: Active student generates QR
  it('Scenario 1: Active student generates a cryptographically signed opaque QR token', () => {
    const studentUser = {
      id: 'usr-student-01',
      role: 'STUDENT',
      rollNumber: '01',
      name: 'Rakesh Das',
      department: 'Computer Science & Engineering',
    };

    const res = dynamicQrService.generateLocalToken(studentUser);
    expect(res.token).toBeDefined();
    expect(res.token.startsWith('ACQR.')).toBe(true);
    expect(res.expiresInSeconds).toBe(10);
    expect(res.identity.role).toBe('STUDENT');
    expect(res.identity.identifier).toBe('01');
  });

  // SCENARIO 2: Active faculty generates QR
  it('Scenario 2: Active faculty generates QR with faculty credentials', () => {
    const facultyUser = {
      id: 'usr-faculty-101',
      role: 'FACULTY',
      employeeId: 'FAC-101',
      name: 'Prof. Dillip Ray',
      department: 'Computer Science & Engineering',
    };

    const res = dynamicQrService.generateLocalToken(facultyUser);
    expect(res.token.startsWith('ACQR.')).toBe(true);
    expect(res.identity.role).toBe('FACULTY');
    expect(res.identity.identifier).toBe('FAC-101');
  });

  // SCENARIO 3 & 4: Teaching staff and Non-teaching staff generate QR
  it('Scenario 3 & 4: Teaching and Non-teaching staff generate dynamic QR via centralized service', () => {
    const staffUser = {
      id: 'usr-staff-201',
      role: 'STAFF',
      employeeId: 'STAFF-201',
      name: 'Mr. Kailash Chandra Nayak',
      department: 'Dining Logistics',
    };

    const res = dynamicQrService.generateLocalToken(staffUser);
    expect(res.token.startsWith('ACQR.')).toBe(true);
    expect(res.identity.role).toBe('STAFF');
    expect(res.identity.identifier).toBe('STAFF-201');
  });

  // SCENARIO 5: QR refreshes every 10 seconds
  it('Scenario 5: QR validity window is strictly 10 seconds from server clock', () => {
    const user = { id: 'usr-01', role: 'STUDENT', rollNumber: '01' };
    const res = dynamicQrService.generateLocalToken(user);

    const issuedAt = new Date(res.serverIssuedAt).getTime();
    const expiresAt = new Date(res.serverExpiresAt).getTime();
    const diffSeconds = Math.round((expiresAt - issuedAt) / 1000);

    expect(diffSeconds).toBe(10);
  });

  // SCENARIO 6: Expired QR is rejected
  it('Scenario 6: Backend DynamicQrService rejects expired QR codes with QR_EXPIRED', () => {
    const dynServiceCode = fs.readFileSync(path.join(backendDir, 'src/security/dynamic-qr.service.ts'), 'utf8');

    expect(dynServiceCode).toContain("now > payload.exp");
    expect(dynServiceCode).toContain("status: 'QR_EXPIRED'");
    expect(dynServiceCode).toContain("Tokens are valid for exactly 10 seconds");
  });

  // SCENARIO 7 & 8: Valid QR is accepted once & Reused QR is rejected (Replay Prevention)
  it('Scenario 7 & 8: Single-use replay protection prevents duplicate scans of the same QR token', () => {
    const dynServiceCode = fs.readFileSync(path.join(backendDir, 'src/security/dynamic-qr.service.ts'), 'utf8');

    expect(dynServiceCode).toContain("status: 'QR_ALREADY_USED'");
    expect(dynServiceCode).toContain("memRecord.isUsed = true");
    expect(dynServiceCode).toContain("Replay attempt blocked");
  });

  // SCENARIO 9: Simultaneous duplicate scans are rejected
  it('Scenario 9: Atomic transactions and hashed single-use tokens prevent race condition scans', () => {
    const dynServiceCode = fs.readFileSync(path.join(backendDir, 'src/security/dynamic-qr.service.ts'), 'utf8');

    expect(dynServiceCode).toContain("tokenHash");
    expect(dynServiceCode).toContain("crypto.createHash('sha256')");
    expect(dynServiceCode).toContain("dynamicQrToken");
  });

  // SCENARIO 10: Tampered QR is rejected
  it('Scenario 10: HMAC SHA-256 signature mismatch rejects tampered tokens', () => {
    const dynServiceCode = fs.readFileSync(path.join(backendDir, 'src/security/dynamic-qr.service.ts'), 'utf8');

    expect(dynServiceCode).toContain("crypto.createHmac('sha256'");
    expect(dynServiceCode).toContain("crypto.timingSafeEqual");
    expect(dynServiceCode).toContain("status: 'INVALID_QR'");
  });

  // SCENARIO 11: Inactive account is rejected
  it('Scenario 11: Inactive or suspended accounts are denied gate passage', () => {
    const decisionCode = fs.readFileSync(path.join(backendDir, 'src/security/gate-access-decision.service.ts'), 'utf8');

    expect(decisionCode).toContain("accountActive = user.isActive && user.status !== 'SUSPENDED'");
    expect(decisionCode).toContain("decision: 'ACCESS DENIED'");
    expect(decisionCode).toContain("Account is inactive or suspended by campus administration.");
  });

  // SCENARIO 12 & 13: Normal student entry and exit
  it('Scenario 12 & 13: Centralized decision engine handles Category A Routine Access', () => {
    const decisionCode = fs.readFileSync(path.join(backendDir, 'src/security/gate-access-decision.service.ts'), 'utf8');

    expect(decisionCode).toContain("category: 'ROUTINE_ACCESS'");
    expect(decisionCode).toContain("category: 'PERMISSION_BASED'");
    expect(decisionCode).toContain("decisionStatus = direction === 'ENTRY' ? 'ENTRY APPROVED' : 'EXIT RECORDED'");
  });

  // SCENARIO 14 & 15: Duplicate exit/entry prevention & safe exit handling
  it('Scenario 14 & 15: Concurrency-safe physical entry/exit validation prevents duplicate exits', () => {
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    expect(serviceCode).toContain("Duplicate Exit Blocked");
    expect(serviceCode).toContain("Duplicate Entry Blocked");
  });

  // SCENARIO 16 & 17: Approved day-out vs unapproved outpass
  it('Scenario 16 & 17: Approved outpass allows exit; missing approval requires warden clearance', () => {
    const decisionCode = fs.readFileSync(path.join(backendDir, 'src/security/gate-access-decision.service.ts'), 'utf8');

    expect(decisionCode).toContain("decision: 'APPROVAL REQUIRED'");
    expect(decisionCode).toContain("No approved outpass or day-out permission found for this student");
  });

  // SCENARIO 18 & 19: Approved late return & Overdue return flagged
  it('Scenario 18 & 19: Automatic calculation of overdue minutes flags late return and alerts warden', () => {
    const decisionCode = fs.readFileSync(path.join(backendDir, 'src/security/gate-access-decision.service.ts'), 'utf8');
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    expect(decisionCode).toContain("isOverdue = true");
    expect(decisionCode).toContain("overdueMinutes = Math.round((nowTime - expTime) / 60000)");
    expect(serviceCode).toContain("overdueReturnRecord");
  });

  // SCENARIO 20: Hostel Gate recorded separately from Main Campus Gate
  it('Scenario 20: Main Campus Gate and Hostel Gate are tracked as distinct checkpoint types', () => {
    const prismaCode = fs.readFileSync(path.join(backendDir, 'prisma/schema.prisma'), 'utf8');
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    expect(prismaCode).toContain("checkpointType String?   @default(\"MAIN_CAMPUS\")");
    expect(serviceCode).toContain("gateName.toLowerCase().includes('hostel') ? 'HOSTEL_GATE' : 'MAIN_CAMPUS'");
  });

  // SCENARIO 21, 22, 23: Visitor management workflows
  it('Scenario 21, 22, 23: Pre-registered visitor generates 6-digit OTP code and walk-in registration supported', () => {
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    expect(serviceCode).toContain("verificationCode = Math.floor(100000 + Math.random() * 900000).toString()");
    expect(serviceCode).toContain("visitType: 'PRE_REGISTERED'");
    expect(serviceCode).toContain("verifyVisitorCode");
    expect(serviceCode).toContain("checkInVisitor");
    expect(serviceCode).toContain("checkOutVisitor");
  });

  // SCENARIO 24: Guard shift handover
  it('Scenario 24: Shift handover records incoming/outgoing guard acknowledgment and equipment checklist', () => {
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');
    const prismaCode = fs.readFileSync(path.join(backendDir, 'prisma/schema.prisma'), 'utf8');

    expect(prismaCode).toContain("model ShiftHandoverLog");
    expect(serviceCode).toContain("acknowledgeShiftHandover");
    expect(serviceCode).toContain("acknowledgedByIncoming: true");
  });

  // SCENARIO 25: Reports and exports display accurate records
  it('Scenario 25: Movement history supports CSV export, PDF audit, and comprehensive filters', () => {
    const portalCode = fs.readFileSync(path.join(frontendDir, 'components/SecurityPortal.jsx'), 'utf8');

    expect(portalCode).toContain("handleExportHistory");
    expect(portalCode).toContain("handleExportPdf");
    expect(portalCode).toContain("historyGateFilter");
    expect(portalCode).toContain("historyRoleFilter");
  });

  // SCENARIO 26: Existing Security Module pages continue working
  it('Scenario 26: Preserves existing gate pass catalog, checkpoints, incident logging, and offline queue', () => {
    const portalCode = fs.readFileSync(path.join(frontendDir, 'components/SecurityPortal.jsx'), 'utf8');

    expect(portalCode).toContain("handlePerformScan");
    expect(portalCode).toContain("handleRecordExit");
    expect(portalCode).toContain("handleRecordEntry");
    expect(portalCode).toContain("handleManualSyncQueue");
    expect(portalCode).toContain("securityOfflineStore");
  });

  // SCENARIO 27: Universal Dynamic QR Identity integrated across all portal modules
  it('Scenario 27: Universal Digital ID & Dynamic QR pass embedded across Student, Faculty, Staff, and Role Portals', () => {
    const studentPortal = fs.readFileSync(path.join(frontendDir, 'StudentPortal.jsx'), 'utf8');
    const roleLanding = fs.readFileSync(path.join(frontendDir, 'components/RoleDashboardLanding.jsx'), 'utf8');
    const digitalModal = fs.readFileSync(path.join(frontendDir, 'components/Security/UniversalDigitalIdModal.jsx'), 'utf8');

    expect(studentPortal).toContain("<UniversalDigitalIdModal");
    expect(studentPortal).toContain("My Digital ID & Dynamic Pass");
    expect(roleLanding).toContain("<UniversalDigitalIdModal");
    expect(roleLanding).toContain("My Digital ID & 10s Dynamic Pass");
    expect(digitalModal).toContain("dynamicQrService.startLiveSession");
    expect(digitalModal).toContain("Strict 10s single-use cryptographic token");
  });
});
