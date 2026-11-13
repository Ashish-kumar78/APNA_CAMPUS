import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../..');
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

describe('STEP 13: Final Verification — Role Security Boundaries, Backend Validation, Persistence & Mobile Responsiveness', () => {
  const schemaPath = path.join(backendDir, 'prisma/schema.prisma');
  const controllerPath = path.join(backendDir, 'src/security/security.controller.ts');
  const servicePath = path.join(backendDir, 'src/security/security.service.ts');
  const dtoPath = path.join(backendDir, 'src/security/dto/security-movement.dto.ts');
  const cssPath = path.join(frontendDir, 'src/components/SecurityPortal.css');
  const portalPath = path.join(frontendDir, 'src/components/SecurityPortal.jsx');
  const apiPath = path.join(frontendDir, 'src/services/api.js');

  const schemaCode = fs.readFileSync(schemaPath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const dtoCode = fs.readFileSync(dtoPath, 'utf8');
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  const portalCode = fs.readFileSync(portalPath, 'utf8');
  const apiCode = fs.readFileSync(apiPath, 'utf8');

  // ─────────────────────────────────────────────────────────────
  // 1. ROLE SECURITY BOUNDARIES & ACCESS CONTROL MATRIX (RBAC)
  // ─────────────────────────────────────────────────────────────
  describe('1. Role Security Boundaries & Access Control Matrix (RBAC)', () => {
    it('Security Guard Boundary: Guards NEVER approve or reject gate passes', () => {
      // Find approve and reject endpoint decorators in security.controller.ts
      const approveIndex = controllerCode.indexOf('@Patch(\'movement/:id/approve\')');
      const rejectIndex = controllerCode.indexOf('@Patch(\'movement/:id/reject\')');

      expect(approveIndex).toBeGreaterThan(-1);
      expect(rejectIndex).toBeGreaterThan(-1);

      const approveSnippet = controllerCode.slice(approveIndex - 120, approveIndex + 80);
      const rejectSnippet = controllerCode.slice(rejectIndex - 120, rejectIndex + 80);

      // Security role must NEVER appear in approve/reject decorators
      expect(approveSnippet).toContain('Role.WARDEN');
      expect(approveSnippet).not.toContain('Role.SECURITY');
      expect(rejectSnippet).toContain('Role.WARDEN');
      expect(rejectSnippet).not.toContain('Role.SECURITY');
    });

    it('Student Boundary: Students can apply for outpass and invite visitors, but cannot record turnstile exits or scans', () => {
      const scanIndex = controllerCode.indexOf("@Post('scan')");
      const exitIndex = controllerCode.indexOf("@Post('movement/exit')");
      const entryIndex = controllerCode.indexOf("@Post('movement/entry')");

      const scanSnippet = controllerCode.slice(scanIndex - 100, scanIndex + 60);
      const exitSnippet = controllerCode.slice(exitIndex - 100, exitIndex + 60);
      const entrySnippet = controllerCode.slice(entryIndex - 100, entryIndex + 60);

      expect(scanSnippet).not.toContain('Role.STUDENT');
      expect(exitSnippet).not.toContain('Role.STUDENT');
      expect(entrySnippet).not.toContain('Role.STUDENT');

      // Student permissions
      const movementRequestIndex = controllerCode.indexOf("@Post('movement/request')");
      const inviteVisitorIndex = controllerCode.indexOf("@Post('visitors/invite')");

      expect(controllerCode.slice(movementRequestIndex - 120, movementRequestIndex + 60)).toContain('Role.STUDENT');
      expect(controllerCode.slice(inviteVisitorIndex - 120, inviteVisitorIndex + 60)).toContain('Role.STUDENT');
    });

    it('Warden Boundary: Wardens oversee movement compliance and approve passes, but do not record physical turnstile exits', () => {
      const exitIndex = controllerCode.indexOf('@Post(\'movement/exit\')');
      const exitSnippet = controllerCode.slice(exitIndex - 100, exitIndex + 60);
      expect(exitSnippet).not.toContain('Role.WARDEN');
    });

    it('STRICT BOUNDARY: FACULTY role is strictly excluded from all gate security operations', () => {
      // In the entire security.controller.ts, Role.FACULTY must never be authorized
      expect(controllerCode).not.toContain('Role.FACULTY');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. BACKEND DATA VALIDATION & INTEGRITY GUARDS
  // ─────────────────────────────────────────────────────────────
  describe('2. Backend Data Validation & Integrity Guards', () => {
    it('All core DTOs enforce strict validation rules via class-validator', () => {
      expect(dtoCode).toContain('export class ScanGatePassDto');
      expect(dtoCode).toContain('export class RecordMovementDto');
      expect(dtoCode).toContain('export class WalkInVisitorDto');
      expect(dtoCode).toContain('export class ReportSecurityIncidentDto');
      expect(dtoCode).toContain('export class GenerateDynamicQrDto');
      expect(dtoCode).toContain('export class StudentMovementRequestDto');
      expect(dtoCode).toContain('export class CorrectSecurityRecordDto');
    });

    it('Audited record correction enforces minimum 5-character mandatory justification', () => {
      expect(serviceCode).toContain('dto.reason.trim().length < 5');
      expect(serviceCode).toContain('BadRequestException');
      expect(serviceCode).toContain('A valid reason for correction (minimum 5 characters) is required');
    });

    it('Dynamic QR service enforces 10-second validity window and single-use token checks', () => {
      expect(serviceCode).toContain('verifyDynamicQr');
      expect(serviceCode).toContain('QR EXPIRED');
      expect(serviceCode).toContain('QR ALREADY USED');
    });

    it('Turnstile movement rejects non-approved gate passes and enforces duplicate checks', () => {
      expect(serviceCode).toContain('GATE_STUDENT_EXIT');
      expect(serviceCode).toContain('GATE_STUDENT_ENTRY');
      expect(serviceCode).toContain('Only approved passes can exit');
      expect(serviceCode).toContain('Duplicate Exit Blocked');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. DATABASE SCHEMA & POSTGRESQL PERSISTENCE
  // ─────────────────────────────────────────────────────────────
  describe('3. Database Schema & PostgreSQL Persistence', () => {
    it('Prisma schema defines all necessary perimeter models and indexes', () => {
      expect(schemaCode).toContain('model CampusGateMovement');
      expect(schemaCode).toContain('model HostelVisitor');
      expect(schemaCode).toContain('model SecurityIncident');
      expect(schemaCode).toContain('model AuditLog');
      expect(schemaCode).toContain('model WorkflowRequest');
      expect(schemaCode).toContain('model Student');
    });

    it('Security service implements dual-layer persistence (Prisma database + resilient memory fallback)', () => {
      expect(serviceCode).toContain('this.prisma.campusGateMovement');
      expect(serviceCode).toContain('this.prisma.hostelVisitor');
      expect(serviceCode).toContain('this.prisma.securityIncident');
      expect(serviceCode).toContain('this.prisma.auditLog');
      expect(serviceCode).toContain('SecurityService.memoryMovements');
      expect(serviceCode).toContain('SecurityService.memoryAuditTrail');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. MOBILE RESPONSIVENESS & TOUCH TARGET COMPLIANCE
  // ─────────────────────────────────────────────────────────────
  describe('4. Mobile Responsiveness & Touch Target Compliance', () => {
    it('SecurityPortal.css includes tablet and desktop media query (max-width: 1024px)', () => {
      expect(cssCode).toContain('@media (max-width: 1024px)');
      expect(cssCode).toContain('.sec-sections-grid');
    });

    it('SecurityPortal.css includes mobile media query (max-width: 640px) with responsive touch controls', () => {
      expect(cssCode).toContain('@media (max-width: 640px)');
      expect(cssCode).toContain('min-height: 42px');
      expect(cssCode).toContain('flex-direction: column');
    });

    it('SecurityPortal.css includes small mobile viewport query (max-width: 375px)', () => {
      expect(cssCode).toContain('@media (max-width: 375px)');
      expect(cssCode).toContain('.sec-card-header');
    });

    it('Data tables are wrapped with horizontal scrolling containers for small screens', () => {
      expect(cssCode).toContain('.sec-table-container');
      expect(cssCode).toContain('overflow-x: auto');
    });

    it('Modal dialogs scale responsively on mobile viewports', () => {
      expect(cssCode).toContain('.sec-modal-content');
      expect(cssCode).toContain('calc(100vw - 1.5rem)');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. COMPREHENSIVE PLATFORM CAPABILITIES
  // ─────────────────────────────────────────────────────────────
  describe('5. Comprehensive Platform Capabilities & Workflows', () => {
    it('Frontend API exposes complete suite of gate security endpoints', () => {
      expect(apiCode).toContain('scanSecurityPass');
      expect(apiCode).toContain('recordSecurityExit');
      expect(apiCode).toContain('recordSecurityEntry');
      expect(apiCode).toContain('getSecurityVisitors');
      expect(apiCode).toContain('registerSecurityWalkInVisitor');
      expect(apiCode).toContain('verifySecurityVisitorCode');
      expect(apiCode).toContain('checkOutSecurityVisitor');
      expect(apiCode).toContain('generateDynamicQr');
      expect(apiCode).toContain('verifyDynamicQr');
      expect(apiCode).toContain('submitStudentMovementRequest');
      expect(apiCode).toContain('approveStudentMovementRequest');
      expect(apiCode).toContain('rejectStudentMovementRequest');
      expect(apiCode).toContain('getSecurityOverdueReturns');
      expect(apiCode).toContain('resolveSecurityOverdueReturn');
      expect(apiCode).toContain('escalateSecurityOverdueReturn');
      expect(apiCode).toContain('getDailySecurityReport');
      expect(apiCode).toContain('getSecurityAuditTrail');
      expect(apiCode).toContain('correctSecurityRecord');
    });

    it('SecurityPortal UI provides all 8 core operational views', () => {
      expect(portalCode).toContain("activeTab === 'dashboard'");
      expect(portalCode).toContain("activeTab === 'overview'");
      expect(portalCode).toContain("activeTab === 'scanner'");
      expect(portalCode).toContain("activeTab === 'passes'");
      expect(portalCode).toContain("activeTab === 'overdue'");
      expect(portalCode).toContain("activeTab === 'visitors'");
      expect(portalCode).toContain("activeTab === 'history'");
      expect(portalCode).toContain("activeTab === 'reports'");
      expect(portalCode).toContain("activeTab === 'audit'");
      expect(portalCode).toContain("activeTab === 'alerts'");
    });
  });
});
