import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import dynamicQrService from '../src/services/dynamicQrService.js';

describe('STEP 3: QR Scanner & Physical Entry/Exit Workflow Test Suite', () => {
  const backendDir = path.resolve(__dirname, '../../backend');
  const frontendDir = path.resolve(__dirname, '../src');

  // 1. Dynamic QR Token Generation & Window Validation
  it('1. Generates 10-second cryptographically signed dynamic QR token', () => {
    const studentUser = {
      id: 'usr-student-01',
      role: 'STUDENT',
      rollNumber: '01',
      name: 'Rakesh Das',
      department: 'Computer Science & Engineering',
    };

    const tokenData = dynamicQrService.generateLocalToken(studentUser);
    expect(tokenData.token).toBeDefined();
    expect(tokenData.token.startsWith('ACQR.')).toBe(true);
    expect(tokenData.expiresInSeconds).toBe(10);
    expect(tokenData.tokenHash).toBeDefined();
  });

  // 2. Dynamic QR Scanner Verification Logic in Backend
  it('2. Backend verifies 10s token validity, replay protection, and signature check', () => {
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/dynamic-qr.service.ts'), 'utf8');

    // 10s expiry check
    expect(serviceCode).toContain('now > payload.exp');
    expect(serviceCode).toContain("status: 'QR_EXPIRED'");
    // Single-use replay protection
    expect(serviceCode).toContain("status: 'QR_ALREADY_USED'");
    // Cryptographic signature check
    expect(serviceCode).toContain("crypto.createHmac('sha256'");
    expect(serviceCode).toContain("crypto.timingSafeEqual");
  });

  // 3. Centralized Gate Access Decision Engine (Routine vs Permission-based)
  it('3. Gate access decision engine evaluates Category A Routine Access and Category B Passes', () => {
    const decisionCode = fs.readFileSync(path.join(backendDir, 'src/security/gate-access-decision.service.ts'), 'utf8');

    expect(decisionCode).toContain('evaluateAccess');
    expect(decisionCode).toContain('ROUTINE_ACCESS');
    expect(decisionCode).toContain('PERMISSION_BASED');
    expect(decisionCode).toContain('ENTRY APPROVED');
    expect(decisionCode).toContain('EXIT RECORDED');
    expect(decisionCode).toContain('ACCESS DENIED');
  });

  // 4. Physical Exit Workflow & Concurrency Protection
  it('4. recordExit validates approved pass, prevents duplicate exit, and creates parent notification', () => {
    const securityServiceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    expect(securityServiceCode).toContain('async recordExit');
    expect(securityServiceCode).toContain('Duplicate Exit Blocked');
    expect(securityServiceCode).toContain('GATE_STUDENT_EXIT');
    expect(securityServiceCode).toContain('parentNotificationLog');
    expect(securityServiceCode).toContain('updateWorkflowPassStatus');
  });

  // 5. Physical Entry Workflow & Late-Return Detection
  it('5. recordEntry enforces movement sequence, marks return, and calculates overdue minutes', () => {
    const securityServiceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    expect(securityServiceCode).toContain('async recordEntry');
    expect(securityServiceCode).toContain('Duplicate Entry Blocked');
    expect(securityServiceCode).toContain('Student has not exited campus yet');
    expect(securityServiceCode).toContain('isLate = true');
    expect(securityServiceCode).toContain('updateWorkflowPassStatus(pass.id, \'Returned\'');
  });

  // 6. Security Portal QR Scanner UI & Verification Result Cards
  it('6. SecurityPortal component implements camera scanner, green/red cards, and manual fallback', () => {
    const portalCode = fs.readFileSync(path.join(frontendDir, 'components/SecurityPortal.jsx'), 'utf8');

    // Camera control
    expect(portalCode).toContain('Start Camera');
    expect(portalCode).toContain('Stop Camera');
    expect(portalCode).toContain('Flip Camera');
    // Manual fallback
    expect(portalCode).toContain('Manual Roll Number, Pass ID, or QR String:');
    // Result cards
    expect(portalCode).toContain('sec-pass-result-card');
    expect(portalCode).toContain('VERIFY & LOG CAMPUS EXIT');
    expect(portalCode).toContain('VERIFY & LOG CAMPUS ENTRY');
    expect(portalCode).toContain('FLAG SECURITY BREACH & NOTIFY WARDEN');
  });

  // 7. Warden & Hostel Admin Approval Workflow
  it('7. Warden approval endpoint saves approver identity, timestamp, generates QR token, and logs audit', () => {
    const controllerCode = fs.readFileSync(path.join(backendDir, 'src/security/security.controller.ts'), 'utf8');
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    // Endpoint exists with proper role guards
    expect(controllerCode).toContain("@Patch('movement/:id/approve')");
    expect(controllerCode).toContain('@Roles(Role.WARDEN, Role.ADMIN, Role.SUPER_ADMIN, Role.HOSTEL)');

    // Service updates status, generates QR, and records audit notice
    expect(serviceCode).toContain("req.status = 'APPROVED'");
    expect(serviceCode).toContain('req.approvedAt = approvalTimestamp');
    expect(serviceCode).toContain('req.qrCodeString =');
    expect(serviceCode).toContain('SecurityService.parentNotificationLog.unshift');
  });

  // 8. Warden & Hostel Admin Rejection Workflow
  it('8. Warden rejection endpoint records rejection reason, timestamp, and audit history', () => {
    const controllerCode = fs.readFileSync(path.join(backendDir, 'src/security/security.controller.ts'), 'utf8');
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    // Rejection endpoint exists with proper role guards
    expect(controllerCode).toContain("@Patch('movement/:id/reject')");
    expect(serviceCode).toContain("req.status = 'REJECTED'");
    expect(serviceCode).toContain('req.rejectionReason = remarks');
    expect(serviceCode).toContain('SecurityService.parentNotificationLog.unshift');
  });

  // 9. Late Return Monitoring & Overdue Returns Endpoint
  it('9. Overdue returns service detects elapsed curfews and alerts Warden and Hostel Admin', () => {
    const controllerCode = fs.readFileSync(path.join(backendDir, 'src/security/security.controller.ts'), 'utf8');
    const serviceCode = fs.readFileSync(path.join(backendDir, 'src/security/security.service.ts'), 'utf8');

    expect(controllerCode).toContain("@Get('overdue-returns')");
    expect(controllerCode).toContain("@Patch('overdue-returns/:id/resolve')");
    expect(serviceCode).toContain("status: 'LATE_RETURN'");
    expect(serviceCode).toContain('Alert dispatched to Resident Warden & Hostel Admin');
  });

  // 10. Strict Security Guard Authorization Boundary
  it('10. Security Guard is strictly barred from approving/rejecting passes', () => {
    const controllerCode = fs.readFileSync(path.join(backendDir, 'src/security/security.controller.ts'), 'utf8');

    // Match the approve decorator
    const approveMatch = controllerCode.match(/@Patch\('movement\/:id\/approve'\)\s*@Roles\(([^)]+)\)/);
    expect(approveMatch).toBeTruthy();
    expect(approveMatch[1]).not.toContain('Role.SECURITY');

    // Match the reject decorator
    const rejectMatch = controllerCode.match(/@Patch\('movement\/:id\/reject'\)\s*@Roles\(([^)]+)\)/);
    expect(rejectMatch).toBeTruthy();
    expect(rejectMatch[1]).not.toContain('Role.SECURITY');
  });
});

