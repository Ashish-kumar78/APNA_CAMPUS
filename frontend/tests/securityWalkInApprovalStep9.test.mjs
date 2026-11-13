import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 9: Walk-In Visitor Approval Workflow (Security Guard Gate Walk-In & Host Student Live In-App Approval)', () => {
  const visitorSectionPath = path.resolve(__dirname, '../src/components/StudentVisitorRegistrationSection.jsx');
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const dtoPath = path.resolve(__dirname, '../../backend/src/security/dto/security-movement.dto.ts');
  const securityPortalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
  const apiPath = path.resolve(__dirname, '../src/services/api.js');

  const visitorSectionCode = fs.readFileSync(visitorSectionPath, 'utf8');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const dtoCode = fs.readFileSync(dtoPath, 'utf8');
  const securityPortalCode = fs.readFileSync(securityPortalPath, 'utf8');
  const apiCode = fs.readFileSync(apiPath, 'utf8');

  describe('1. Security Guard Walk-In Registration with Student Approval Option', () => {
    it('WalkInVisitorDto supports requiresStudentApproval boolean flag', () => {
      expect(dtoCode).toContain('export class WalkInVisitorDto');
      expect(dtoCode).toContain('requiresStudentApproval?: boolean;');
    });

    it('Security portal walk-in form provides toggle for requiring host student approval before badge issuance', () => {
      expect(securityPortalCode).toContain('walkInForm');
      expect(securityPortalCode).toContain('requiresStudentApproval');
      expect(securityPortalCode).toContain('Require Host Student Live In-App Approval');
      expect(securityPortalCode).toContain('Request Live Student Approval & Register Walk-In');
    });

    it('Backend walkInVisitor initializes status as Awaiting Student Approval when flag is enabled', () => {
      expect(serviceCode).toContain("const requiresStudentApproval = dto.requiresStudentApproval ?? false;");
      expect(serviceCode).toContain("const initialStatus = requiresStudentApproval ? 'Awaiting Student Approval' : 'Checked In';");
      expect(serviceCode).toContain("const inTime = requiresStudentApproval ? 'Pending Approval' : timeStr;");
    });
  });

  describe('2. Host Student Live In-App Approval & Rejection Workflow', () => {
    it('Backend controller provides dedicated endpoints for student approval and rejection', () => {
      expect(controllerCode).toContain("@Patch('visitors/:id/student-approve')");
      expect(controllerCode).toContain("@Patch('visitors/:id/student-reject')");
      expect(controllerCode).toContain('studentApproveVisitor');
      expect(controllerCode).toContain('studentRejectVisitor');
    });

    it('Frontend API client exports studentApproveSecurityVisitor and studentRejectSecurityVisitor', () => {
      expect(apiCode).toContain('studentApproveSecurityVisitor: (id) =>');
      expect(apiCode).toContain('studentRejectSecurityVisitor: (id, remarks) =>');
      expect(apiCode).toContain("request(`/security/visitors/${id}/student-approve`");
      expect(apiCode).toContain("request(`/security/visitors/${id}/student-reject`");
    });

    it('Student dashboard surfaces incoming walk-in approval banner with live Approve and Reject actions', () => {
      expect(visitorSectionCode).toContain('pendingStudentApprovals');
      expect(visitorSectionCode).toContain('Walk-in Visitor Approval Request at Gate Checkpoint');
      expect(visitorSectionCode).toContain('handleStudentApprove');
      expect(visitorSectionCode).toContain('handleStudentReject');
      expect(visitorSectionCode).toContain('Approve Visitor Entry');
      expect(visitorSectionCode).toContain('Decline Visit');
    });

    it('Backend studentApproveVisitor transitions status to Pre-Approved and logs immutable audit trail', () => {
      expect(serviceCode).toContain("async studentApproveVisitor(id: string, user: any)");
      expect(serviceCode).toContain("vis.status = 'Pre-Approved';");
      expect(serviceCode).toContain("vis.studentApprovedAt = new Date().toISOString();");
      expect(serviceCode).toContain("action: 'GATE_VISITOR_STUDENT_APPROVED'");
    });

    it('Backend studentRejectVisitor transitions status to Rejected by Student and logs immutable audit trail', () => {
      expect(serviceCode).toContain("async studentRejectVisitor(id: string, remarks: string, user: any)");
      expect(serviceCode).toContain("vis.status = 'Rejected by Student';");
      expect(serviceCode).toContain("vis.studentRejectedAt = new Date().toISOString();");
      expect(serviceCode).toContain("action: 'GATE_VISITOR_STUDENT_REJECTED'");
    });
  });

  describe('3. Gate Access Control & Security Verification Guardrails', () => {
    it('checkInVisitor blocks check-in if visitor is Awaiting Student Approval or Rejected by Student', () => {
      expect(serviceCode).toContain("if (existing.status === 'Awaiting Student Approval')");
      expect(serviceCode).toContain("throw new BadRequestException");
      expect(serviceCode).toContain("Walk-in visit is awaiting approval from host student");
      expect(serviceCode).toContain("if (existing.status === 'Rejected by Student')");
      expect(serviceCode).toContain("Walk-in visit was rejected by host student");
    });

    it('SecurityPortal displays real-time status chips and enables badge issuance upon student approval', () => {
      expect(securityPortalCode).toContain('Awaiting Student Approval');
      expect(securityPortalCode).toContain('✓ Approved by Student');
      expect(securityPortalCode).toContain('✕ Declined by Student');
      expect(securityPortalCode).toContain('Issue Badge & Check In');
      expect(securityPortalCode).toContain('Sign Out / Return Badge');
    });

    it('Authorizes Role.STUDENT to fetch visitor list for in-app approval notifications', () => {
      expect(controllerCode).toContain("@Get('visitors')");
      expect(controllerCode).toContain("Role.STUDENT");
    });
  });
});
