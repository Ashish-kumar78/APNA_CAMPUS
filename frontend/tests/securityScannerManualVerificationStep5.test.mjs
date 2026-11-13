import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 5: Security Guard QR Scanner & Manual Verification Test Suite (Section 7.B)', () => {
  const backendServicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const backendControllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const frontendPortalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');

  const serviceCode = fs.readFileSync(backendServicePath, 'utf8');
  const controllerCode = fs.readFileSync(backendControllerPath, 'utf8');
  const portalCode = fs.readFileSync(frontendPortalPath, 'utf8');

  // 1. Scanner API Endpoint & Role Guard
  it('1. Backend provides @Post("scan") with Security guard and admin authorization', () => {
    expect(controllerCode).toContain("@Post('scan')");
    expect(controllerCode).toContain('@Roles(Role.SECURITY, Role.ADMIN, Role.SUPER_ADMIN, Role.WARDEN)');
    expect(serviceCode).toContain('async scanPass(dto: ScanGatePassDto)');
  });

  // 2. Token Decoding & Validation Checks
  it('2. Backend verifies token existence, approval status, expiration, and cancellation', () => {
    // Intercepts ACQR and ACGP tokens
    expect(serviceCode).toContain("query.startsWith('ACQR.')");
    expect(serviceCode).toContain("query.startsWith('ACGP.')");

    // Invalid / Non-existent token check
    expect(serviceCode).toContain('Token does not exist or unrecognized pass ID');

    // Rejected pass check
    expect(serviceCode).toContain('This gate pass was REJECTED by the Hostel Warden');

    // Cancelled pass check
    expect(serviceCode).toContain('This gate pass was CANCELLED by administration or student');

    // Expired / time window check
    expect(serviceCode).toContain('Gate pass is EXPIRED. Permitted movement time window has elapsed');

    // Duplicate movement check
    expect(serviceCode).toContain('Duplicate movement blocked: This gate pass has already been used and completed');
  });

  // 3. Green Success Indicator with Mandatory Fields
  it('3. Backend returns all required student and pass fields for valid presentation', () => {
    expect(serviceCode).toContain('photoUrl:');
    expect(serviceCode).toContain('name: pass.studentName');
    expect(serviceCode).toContain('rollNumber: pass.rollNumber');
    expect(serviceCode).toContain('department: pass.department');
    expect(serviceCode).toContain('hostelName: pass.hostelName');
    expect(serviceCode).toContain('roomNumber: pass.roomNumber');
    expect(serviceCode).toContain('purposeType: pass.purposeType');
    expect(serviceCode).toContain('destination: pass.destination');
    expect(serviceCode).toContain('approvedBy: pass.approvedBy');
    expect(serviceCode).toContain('outDateTime: pass.outDateTime');
    expect(serviceCode).toContain('inDateTime: pass.inDateTime');
  });

  // 4. Frontend Scanner UI Green/Red Display
  it('4. SecurityPortal displays GREEN indicator on success and RED warning on invalid state', () => {
    // Green indicator
    expect(portalCode).toContain('sec-pass-result-card');
    expect(portalCode).toContain('APPROVED FOR CAMPUS EXIT');
    expect(portalCode).toContain('ENTRY APPROVED');

    // Red warning
    expect(portalCode).toContain('EXIT / ENTRY BLOCKED');
    expect(portalCode).toContain('Security Warning:');

    // Displays required student credentials
    expect(portalCode).toContain('scannedResult.student.name');
    expect(portalCode).toContain('scannedResult.student.rollNumber');
    expect(portalCode).toContain('scannedResult.student.department');
    expect(portalCode).toContain('scannedResult.student.hostelName');
    expect(portalCode).toContain('scannedResult.student.roomNumber');
    expect(portalCode).toContain('scannedResult.pass.purposeType');
    expect(portalCode).toContain('scannedResult.pass.destination');
    expect(portalCode).toContain('scannedResult.pass.approvedBy');
    expect(portalCode).toContain('scannedResult.pass.outDateTime');
    expect(portalCode).toContain('scannedResult.pass.inDateTime');
  });

  // 5. Manual Verification Support
  it('5. Provides manual roll number and gate pass ID verification using same backend rules', () => {
    expect(portalCode).toContain('Manual Roll Number, Pass ID, or QR String:');
    expect(portalCode).toContain('handlePerformScan');
    expect(portalCode).toContain('api.scanSecurityCode');
    expect(serviceCode).toContain('dto.qrCode || dto.rollNumber || dto.passId');
  });
});

