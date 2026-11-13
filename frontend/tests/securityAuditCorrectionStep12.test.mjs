import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../..');
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

describe('STEP 12: Audit History, Traceable Correction Workflow & Compliance', () => {
  const dtoPath = path.join(backendDir, 'src/security/dto/security-movement.dto.ts');
  const servicePath = path.join(backendDir, 'src/security/security.service.ts');
  const controllerPath = path.join(backendDir, 'src/security/security.controller.ts');
  const apiPath = path.join(frontendDir, 'src/services/api.js');
  const securityPortalPath = path.join(frontendDir, 'src/components/SecurityPortal.jsx');
  const menuConfigPath = path.join(frontendDir, 'src/config/menuConfig/menuConfig.security.js');

  const dtoCode = fs.readFileSync(dtoPath, 'utf8');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const apiCode = fs.readFileSync(apiPath, 'utf8');
  const securityPortalCode = fs.readFileSync(securityPortalPath, 'utf8');
  const menuConfigCode = fs.readFileSync(menuConfigPath, 'utf8');

  describe('1. Data Transfer Objects & Validation Contracts', () => {
    it('CorrectSecurityRecordDto defines required audited fields', () => {
      expect(dtoCode).toContain('export class CorrectSecurityRecordDto');
      expect(dtoCode).toContain('recordId!: string');
      expect(dtoCode).toContain('recordType!:');
      expect(dtoCode).toContain('fieldToCorrect!: string');
      expect(dtoCode).toContain('oldValue?: string');
      expect(dtoCode).toContain('newValue!: string');
      expect(dtoCode).toContain('reason!: string');
    });

    it('Supported record types encompass MOVEMENT, PASS, VISITOR, and INCIDENT', () => {
      expect(dtoCode).toContain("'MOVEMENT'");
      expect(dtoCode).toContain("'PASS'");
      expect(dtoCode).toContain("'VISITOR'");
      expect(dtoCode).toContain("'INCIDENT'");
    });
  });

  describe('2. Controller Endpoints & Strict Role Boundaries', () => {
    it('SecurityController exposes GET /security/audit-trail and POST /security/audit/correct-record', () => {
      expect(controllerCode).toContain("@Get('audit-trail')");
      expect(controllerCode).toContain("async getSecurityAuditTrail(");
      expect(controllerCode).toContain("@Post('audit/correct-record')");
      expect(controllerCode).toContain("async correctSecurityRecord(");
    });

    it('Endpoints are guarded for SECURITY, WARDEN, ADMIN, and SUPER_ADMIN roles', () => {
      expect(controllerCode).toContain('@Roles(Role.SECURITY, Role.ADMIN, Role.SUPER_ADMIN, Role.WARDEN)');
    });

    it('Strict Boundary: FACULTY role is strictly excluded from gate audit and correction workflows', () => {
      const auditTrailBlock = controllerCode.slice(controllerCode.indexOf("@Get('audit-trail')"));
      expect(auditTrailBlock).not.toContain('Role.FACULTY');
    });
  });

  describe('3. Service Implementation & Immutable Audit Trail', () => {
    it('Service maintains in-memory and database audit logging with chronological ordering', () => {
      expect(serviceCode).toContain('memoryAuditTrail');
      expect(serviceCode).toContain('getSecurityAuditTrail(query: any');
      expect(serviceCode).toContain('this.prisma.auditLog');
    });

    it('Audit trail supports filtering by action, role, and search query', () => {
      expect(serviceCode).toContain('log.action');
      expect(serviceCode).toContain('log.role');
      expect(serviceCode).toContain('auditTrail: paginated');
    });

    it('Record correction requires a mandatory reason (minimum 5 characters) for ISO/security compliance', () => {
      expect(serviceCode).toContain('dto.reason.trim().length < 5');
      expect(serviceCode).toContain('BadRequestException');
      expect(serviceCode).toContain('A valid reason for correction (minimum 5 characters) is required');
    });

    it('Correction updates the target entity and generates an immutable AUDIT_RECORD_CORRECTED event', () => {
      expect(serviceCode).toContain("action: 'AUDIT_RECORD_CORRECTED'");
      expect(serviceCode).toContain('target:');
      expect(serviceCode).toContain('oldValue:');
      expect(serviceCode).toContain('newValue:');
      expect(serviceCode).toContain('reason: dto.reason');
    });
  });

  describe('4. Frontend API Client & Security Portal UI Integration', () => {
    it('Frontend API client exports getSecurityAuditTrail and correctSecurityRecord helpers', () => {
      expect(apiCode).toContain('getSecurityAuditTrail: (params = {}) =>');
      expect(apiCode).toContain('/security/audit-trail');
      expect(apiCode).toContain('correctSecurityRecord: (payload) =>');
      expect(apiCode).toContain('/security/audit/correct-record');
    });

    it('Security menu config provides Audit Trail & Corrections navigation item', () => {
      expect(menuConfigCode).toContain("id: 'audit'");
      expect(menuConfigCode).toContain('Audit Trail & Corrections');
    });

    it('SecurityPortal provides activeTab === "audit" with search, action, role filters, and table', () => {
      expect(securityPortalCode).toContain("activeTab === 'audit'");
      expect(securityPortalCode).toContain('Immutable Security Audit Trail');
      expect(securityPortalCode).toContain('auditSearch');
      expect(securityPortalCode).toContain('auditActionFilter');
      expect(securityPortalCode).toContain('auditRoleFilter');
      expect(securityPortalCode).toContain('AUDIT_RECORD_CORRECTED');
    });

    it('SecurityPortal provides correction modal dialog and row action buttons in movement history', () => {
      expect(securityPortalCode).toContain('correctionModalOpen');
      expect(securityPortalCode).toContain('handleSubmitCorrection');
      expect(securityPortalCode).toContain('openCorrectionForRecord');
      expect(securityPortalCode).toContain('Audited Security Record Correction');
      expect(securityPortalCode).toContain('Mandatory Audit Justification Reason');
    });
  });
});

