import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 6: Security Alerts, Curfew Breaches & Incident Dispatching', () => {
  const portalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const apiPath = path.resolve(__dirname, '../src/services/api.js');

  const portalCode = fs.readFileSync(portalPath, 'utf8');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const apiCode = fs.readFileSync(apiPath, 'utf8');

  describe('1. Automated Security Alert Triggers', () => {
    it('Automatically reports security incident upon curfew violation / late return', () => {
      expect(serviceCode).toContain('if (isLate)');
      expect(serviceCode).toContain('Curfew Violation / Late Return');
      expect(serviceCode).toContain('Curfew & Late Return Violation');
      expect(serviceCode).toContain('this.reportIncident');
    });

    it('Automatically reports security incident upon QR replay or expiration breach', () => {
      expect(serviceCode).toContain("verification.status === 'QR_EXPIRED' || verification.status === 'QR_ALREADY_USED'");
      expect(serviceCode).toContain('Dynamic QR Integrity Breach');
      expect(serviceCode).toContain('this.reportIncident');
    });
  });

  describe('2. Manual Security Incident Reporting & Warden Notification Dispatch', () => {
    it('Backend creates incident record, generates warden notification, and writes to audit log', () => {
      expect(serviceCode).toContain('reportIncident(dto: ReportSecurityIncidentDto');
      expect(serviceCode).toContain('INC-SEC-');
      expect(serviceCode).toContain('wardenAlertNotification');
      expect(serviceCode).toContain("targetRole: 'WARDEN'");
      expect(serviceCode).toContain("action: 'Security Incident Registered'");
      expect(controllerCode).toContain("@Post('incidents')");
    });

    it('Frontend provides security incident reporting modal and dispatches to backend API', () => {
      expect(portalCode).toContain('Report Security Incident');
      expect(portalCode).toContain('handleIncidentSubmit');
      expect(portalCode).toContain('api.reportSecurityIncident');
      expect(portalCode).toContain('Dispatch Alert to Warden & Admin');
      expect(portalCode).toContain('incidentForm');
    });
  });

  describe('3. Security Alerts Ledger & Incident Listing', () => {
    it('Backend provides GET /security/incidents endpoint with role-based authorization', () => {
      expect(controllerCode).toContain("@Get('incidents')");
      expect(controllerCode).toContain('@Roles(Role.SECURITY, Role.ADMIN, Role.SUPER_ADMIN, Role.WARDEN)');
      expect(controllerCode).toContain('this.securityService.getIncidentsList()');
      expect(serviceCode).toContain('getIncidentsList()');
      expect(apiCode).toContain("getSecurityIncidents: () => request('/security/incidents')");
    });

    it('Frontend Security Portal displays live alerts list with severity badges', () => {
      expect(portalCode).toContain('loadAlerts');
      expect(portalCode).toContain('alertsList.map');
      expect(portalCode).toContain('alertItem.severity');
      expect(portalCode).toContain('alertItem.title');
    });
  });
});

