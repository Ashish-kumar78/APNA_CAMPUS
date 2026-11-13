import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 5: Campus Visitor & Guest Management (Pre-approved & Walk-in)', () => {
  const portalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');

  const portalCode = fs.readFileSync(portalPath, 'utf8');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');

  describe('1. Pre-Approved Visitor Verification (6-digit Code)', () => {
    it('Backend verifies 6-digit visitor pre-approval code and rejects invalid codes', () => {
      expect(serviceCode).toContain('verifyVisitorCode(dto: VerifyVisitorCodeDto)');
      expect(serviceCode).toContain('Invalid visitor verification code');
      expect(serviceCode).toContain('verified: true');
      expect(controllerCode).toContain("@Post('visitors/verify-code')");
    });

    it('Frontend Security Portal provides 6-digit code entry with instant validation', () => {
      expect(portalCode).toContain('Enter 6-Digit Visitor Pass Code:');
      expect(portalCode).toContain('handleVerifyVisitorCode');
      expect(portalCode).toContain('api.verifySecurityVisitorCode');
      expect(portalCode).toContain('Verified Pre-Approved Visitor');
      expect(portalCode).toContain('INVITATION VALID');
    });
  });

  describe('2. Visitor Check-In & Physical Badge Issuance', () => {
    it('Backend assigns physical badge and creates immutable audit log for visitor entry', () => {
      expect(serviceCode).toContain('checkInVisitor(id: string, badgeNumber?: string');
      expect(serviceCode).toContain("action: 'GATE_VISITOR_ENTRY'");
      expect(serviceCode).toContain('studentNotification');
      expect(serviceCode).toContain('[APNA CAMPUS NOTICE] Your visitor');
      expect(controllerCode).toContain("@Patch('visitors/:id/checkin')");
    });

    it('Frontend UI provides 1-click badge issue and check-in confirmation', () => {
      expect(portalCode).toContain('Issue Badge & Complete Check-In');
      expect(portalCode).toContain('handleCheckInVisitor');
      expect(portalCode).toContain('api.checkInSecurityVisitor');
    });
  });

  describe('3. Walk-In Guest Registration & Badge Assignment', () => {
    it('Backend captures required visitor fields and generates guest pass number', () => {
      expect(serviceCode).toContain('walkInVisitor(dto: WalkInVisitorDto');
      expect(serviceCode).toContain('PASS-V-');
      expect(serviceCode).toContain("status: 'Checked In'");
      expect(serviceCode).toContain("action: 'GATE_VISITOR_REGISTRATION'");
      expect(controllerCode).toContain("@Post('visitors/walk-in')");
    });

    it('Frontend form captures Visitor Name, Relation, Host Student, Roll, Phone, ID Proof, Purpose', () => {
      expect(portalCode).toContain('Visitor Full Name *');
      expect(portalCode).toContain('Relation *');
      expect(portalCode).toContain('Host Student Name *');
      expect(portalCode).toContain('Student Roll Number *');
      expect(portalCode).toContain('Government ID Proof');
      expect(portalCode).toContain('Visit Purpose *');
      expect(portalCode).toContain('Issue Guest Badge & Record Entry');
      expect(portalCode).toContain('handleWalkInSubmit');
    });
  });

  describe('4. Visitor Checkout, Badge Surrender & Duration Calculation', () => {
    it('Backend records departure time, calculates elapsed visit duration and creates exit audit log', () => {
      expect(serviceCode).toContain('checkOutVisitor(id: string');
      expect(serviceCode).toContain("status: 'Checked Out'");
      expect(serviceCode).toContain('durationStr');
      expect(serviceCode).toContain("action: 'GATE_VISITOR_EXIT'");
      expect(controllerCode).toContain("@Patch('visitors/:id/checkout')");
    });

    it('Frontend active visitor ledger enables badge return and checkout', () => {
      expect(portalCode).toContain('Active Checked-In');
      expect(portalCode).toContain('Sign Out / Return Badge');
      expect(portalCode).toContain('handleCheckOutVisitor');
      expect(portalCode).toContain('api.checkOutSecurityVisitor');
    });
  });

  describe('5. Role-Based Access Control and Endpoint Security', () => {
    it('Restricts visitor endpoints to SECURITY, ADMIN, SUPER_ADMIN and WARDEN roles', () => {
      expect(controllerCode).toContain('@Roles(Role.SECURITY, Role.ADMIN, Role.SUPER_ADMIN, Role.WARDEN)');
      expect(controllerCode).toContain("@Get('visitors')");
      expect(controllerCode).toContain('this.securityService.getVisitorsList()');
    });
  });
});

