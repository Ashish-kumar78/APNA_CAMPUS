import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 8: Pre-Registered Visitor Management (Student, Security, Warden & Admin Integration)', () => {
  const visitorSectionPath = path.resolve(__dirname, '../src/components/StudentVisitorRegistrationSection.jsx');
  const hostelPagePath = path.resolve(__dirname, '../src/pages/StudentHostelPage.jsx');
  const gatePassSectionPath = path.resolve(__dirname, '../src/components/StudentGatePassSection.jsx');
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const dtoPath = path.resolve(__dirname, '../../backend/src/security/dto/security-movement.dto.ts');
  const securityPortalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');

  const visitorSectionCode = fs.readFileSync(visitorSectionPath, 'utf8');
  const hostelPageCode = fs.readFileSync(hostelPagePath, 'utf8');
  const gatePassSectionCode = fs.readFileSync(gatePassSectionPath, 'utf8');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const dtoCode = fs.readFileSync(dtoPath, 'utf8');
  const securityPortalCode = fs.readFileSync(securityPortalPath, 'utf8');

  describe('1. Student Dashboard Visitor Registration Form', () => {
    it('provides Visitor Registration tab in Student Hostel dashboard and link from Gate Pass section', () => {
      expect(hostelPageCode).toContain('Visitor Registration');
      expect(hostelPageCode).toContain('<StudentVisitorRegistrationSection');
      expect(gatePassSectionCode).toContain('Pre-Register Visitor');
    });

    it('captures all 8 required fields: name, contact, ID proof, purpose, host student, date, arrival, departure, visitor count', () => {
      expect(visitorSectionCode).toContain('Visitor Full Name *');
      expect(visitorSectionCode).toContain('Contact Phone Number *');
      expect(visitorSectionCode).toContain('Relation to Student *');
      expect(visitorSectionCode).toContain('Purpose of Visit *');
      expect(visitorSectionCode).toContain('Host Student (You)');
      expect(visitorSectionCode).toContain('Expected Visit Date *');
      expect(visitorSectionCode).toContain('Expected Arrival Time');
      expect(visitorSectionCode).toContain('Expected Departure Time');
      expect(visitorSectionCode).toContain('Accompanying Visitors Count');
      expect(visitorSectionCode).toContain('ID Verification Status / Govt Proof');
    });

    it('submits invitation via backend API and displays 6-digit gate clearance code and QR badge', () => {
      expect(visitorSectionCode).toContain('api.inviteSecurityVisitor(payload)');
      expect(visitorSectionCode).toContain('verificationCode');
      expect(visitorSectionCode).toContain('6-Digit Gate Entry Verification Code');
      expect(visitorSectionCode).toContain('<QrSvgRenderer');
      expect(visitorSectionCode).toContain('ACVR.');
    });
  });

  describe('2. Backend Pre-Registration & 6-Digit Verification Code Engine', () => {
    it('accepts InviteVisitorDto with all metadata in security controller and DTO', () => {
      expect(controllerCode).toContain("@Post('visitors/invite')");
      expect(dtoCode).toContain('export class InviteVisitorDto');
      expect(dtoCode).toContain('visitorName');
      expect(dtoCode).toContain('expectedVisitDate');
      expect(dtoCode).toContain('numberOfVisitors');
      expect(serviceCode).toContain('async inviteVisitor(dto: InviteVisitorDto');
    });

    it('generates unpredictable 6-digit code and pre-approved pass number', () => {
      expect(serviceCode).toContain('Math.floor(100000 + Math.random() * 900000)');
      expect(serviceCode).toContain('PASS-V-');
      expect(serviceCode).toContain("status: 'Pre-Approved'");
      expect(serviceCode).toContain("visitType: 'PRE_REGISTERED'");
    });
  });

  describe('3. Security Guard Gate Verification & Badge Check-In', () => {
    it('Security portal provides 6-digit code entry and instant pre-approved visitor validation', () => {
      expect(securityPortalCode).toContain('Enter 6-Digit Visitor Pass Code:');
      expect(securityPortalCode).toContain('handleVerifyVisitorCode');
      expect(securityPortalCode).toContain('api.verifySecurityVisitorCode');
      expect(securityPortalCode).toContain('Verified Pre-Approved Visitor');
      expect(securityPortalCode).toContain('INVITATION VALID');
    });

    it('verifies code on backend and checks against host student information', () => {
      expect(serviceCode).toContain('verifyVisitorCode(dto: VerifyVisitorCodeDto)');
      expect(serviceCode).toContain('v.verificationCode === code');
      expect(serviceCode).toContain('verified: true');
    });

    it('assigns physical visitor badge and executes seamless check-in with immutable audit log', () => {
      expect(securityPortalCode).toContain('Issue Badge & Complete Check-In');
      expect(serviceCode).toContain('checkInVisitor(id: string, badgeNumber?: string');
      expect(serviceCode).toContain("action: 'GATE_VISITOR_ENTRY'");
      expect(serviceCode).toContain('[APNA CAMPUS NOTICE] Your visitor');
    });
  });
});
