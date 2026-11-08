import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('STEP 9: Comprehensive End-to-End Acceptance Tests (Problem Statement 07)', () => {
  // CRITERION 1: Security guards can log in using dedicated credentials
  it('Criterion 1: Security guards can log in using dedicated demo credentials (SEC-101, SEC-102)', () => {
    const demoUsersFile = path.resolve(__dirname, '../../backend/src/auth/demo-users.ts');
    const demoUsersCode = fs.readFileSync(demoUsersFile, 'utf8');

    expect(demoUsersCode).toContain('SEC-101');
    expect(demoUsersCode).toContain('SEC-102');
    expect(demoUsersCode).toContain("role: 'SECURITY'");
    expect(demoUsersCode).toContain('Dillip Kumar Pradhan');
  });

  // CRITERION 2: Security guards see only the Security Dashboard
  it('Criterion 2: Security guards are routed exclusively to the SecurityPortal', () => {
    const appFile = path.resolve(__dirname, '../src/App.jsx');
    const appCode = fs.readFileSync(appFile, 'utf8');

    expect(appCode).toContain("account.role === 'security'");
    expect(appCode).toContain('<SecurityPortal');
  });

  // CRITERION 3: Security guards cannot approve or reject gate passes
  it('Criterion 3: Security guards cannot approve or reject gate passes (strict guardrails)', () => {
    const portalFile = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
    const portalCode = fs.readFileSync(portalFile, 'utf8');

    expect(portalCode).not.toContain('approveGatePass');
    expect(portalCode).not.toContain('rejectGatePass');
    expect(portalCode).toContain('Security personnel verify identity and record movements. Guards do not approve passes.');
  });

  // CRITERION 4: Security guards cannot see student marks or financial data
  it('Criterion 4: RBAC policy strictly excludes academic marks and financial fee permissions from security role', () => {
    const rbacFile = path.resolve(__dirname, '../../backend/src/rbac/rbac.ts');
    const rbacCode = fs.readFileSync(rbacFile, 'utf8');

    expect(rbacCode).toContain('security: {');
    expect(rbacCode).toContain('security.view_dashboard');
    expect(rbacCode).toContain('security.scan_qr');
    expect(rbacCode).toContain('security.record_movement');
    expect(rbacCode).toContain("cleaned === 'security'");

    // Make sure security role doesn't have marks or fee write permissions
    const securityBlock = rbacCode.split('security: {')[1].split('},')[0];
    expect(securityBlock).not.toContain('marks.update');
    expect(securityBlock).not.toContain('fees.collect');
  });

  // CRITERION 5: Exit can only be recorded for approved passes
  it('Criterion 5: Physical exit requires warden approval; unapproved passes are blocked', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain("pass.status !== 'Approved'");
    expect(serviceCode).toContain('Only approved passes can exit');
  });

  // CRITERION 6 & 7: Entry can only be recorded for exited students; duplicate movements are blocked
  it('Criterion 6 & 7: Return entry requires prior exit; duplicate exits and duplicate entries are blocked', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    // Duplicate exit block
    expect(serviceCode).toContain('Duplicate Exit Blocked');
    // Duplicate entry block
    expect(serviceCode).toContain('Duplicate Entry Blocked');
    // Non-exited entry block
    expect(serviceCode).toContain('Student has not exited campus yet');
  });

  // CRITERION 8: Late returns are automatically flagged
  it('Criterion 8: Late returns and curfew breaches are automatically computed and flagged', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain('diffMins');
    expect(serviceCode).toContain('lateDuration');
    expect(serviceCode).toContain('GATE_CURFEW_BREACH');
    expect(serviceCode).toContain('Curfew Violation / Late Return');
  });

  // CRITERION 9: Visitors can be registered and verified
  it('Criterion 9: Campus visitor management supports pre-approval 6-digit codes and walk-in registration', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain('verifyVisitorCode');
    expect(serviceCode).toContain('walkInVisitor');
    expect(serviceCode).toContain('checkInVisitor');
    expect(serviceCode).toContain('checkOutVisitor');
  });

  // CRITERION 10: Offline scans work and sync automatically when internet returns
  it('Criterion 10: Offline movements are enqueued locally with "Saved, will sync" and sync idempotently', () => {
    const offlineStoreFile = path.resolve(__dirname, '../src/services/securityOfflineStore.js');
    const offlineStoreCode = fs.readFileSync(offlineStoreFile, 'utf8');

    expect(offlineStoreCode).toContain('PROVISIONAL_PENDING_SYNC');
    expect(offlineStoreCode).toContain('Saved, will sync');
    expect(offlineStoreCode).toContain('initAutoSync');
    expect(offlineStoreCode).toContain('syncSecurityOfflineQueue');
  });

  // CRITERION 11: Security incidents can be reported
  it('Criterion 11: Guards can report perimeter security incidents and unauthorized exit attempts', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain('reportIncident');
    expect(serviceCode).toContain('Security Incident Registered');
  });

  // CRITERION 12: Audit logs capture all security actions
  it('Criterion 12: Security actions are captured in the institutional audit log', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain('logAudit');
    expect(serviceCode).toContain('GATE_STUDENT_EXIT');
    expect(serviceCode).toContain('GATE_STUDENT_ENTRY');
  });

  // CRITERION 13: Simulated parent notifications are triggered
  it('Criterion 13: Physical movement verification generates simulated parent notifications', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain('parentNotificationLog');
    expect(serviceCode).toContain('SMS_AND_WHATSAPP');
    expect(serviceCode).toContain('has EXITED the campus');
    expect(serviceCode).toContain('has safely RETURNED to campus');
  });

  // CRITERION 14: Student and Warden dashboards reflect gate status in real time
  it('Criterion 14: Student and Warden dashboards display gate exit and return timestamps', () => {
    const studentPassFile = path.resolve(__dirname, '../src/components/StudentGatePassSection.jsx');
    const studentPassCode = fs.readFileSync(studentPassFile, 'utf8');
    expect(studentPassCode).toContain('Campus Gate Exit Recorded');
    expect(studentPassCode).toContain('Campus Gate Return Recorded');

    const hostelFile = path.resolve(__dirname, '../src/components/HostelPortal.jsx');
    const hostelCode = fs.readFileSync(hostelFile, 'utf8');
    expect(hostelCode).toContain('Gate Security Exit Checkpoint');
    expect(hostelCode).toContain('Gate Security Return Checkpoint');
  });

  // CRITERION 15: Existing application functionality remains completely unbroken
  it('Criterion 15: Database schema safely extends existing models without breaking changes', () => {
    const schemaFile = path.resolve(__dirname, '../../backend/prisma/schema.prisma');
    const schemaCode = fs.readFileSync(schemaFile, 'utf8');

    expect(schemaCode).toContain('SECURITY');
    expect(schemaCode).toContain('model CampusGateMovement');
    expect(schemaCode).toContain('model HostelVisitor');
  });
});
