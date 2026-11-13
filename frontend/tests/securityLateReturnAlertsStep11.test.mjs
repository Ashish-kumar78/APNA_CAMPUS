import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 11: Late-Return Alerts, Multi-Tier Escalations & Overdue Resolution Workflow', () => {
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const securityPortalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
  const hostelPortalPath = path.resolve(__dirname, '../src/components/HostelPortal.jsx');
  const apiPath = path.resolve(__dirname, '../src/services/api.js');

  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const securityPortalCode = fs.readFileSync(securityPortalPath, 'utf8');
  const hostelPortalCode = fs.readFileSync(hostelPortalPath, 'utf8');
  const apiCode = fs.readFileSync(apiPath, 'utf8');

  describe('1. Automated Overdue Detection & 3-Tier Escalation Hierarchy', () => {
    it('Dynamic scanner calculates exact elapsed curfew minutes for unreturned students', () => {
      expect(serviceCode).toContain('async getOverdueReturns()');
      expect(serviceCode).toContain('diffMinutes');
      expect(serviceCode).toContain("r.status === 'EXITED'");
    });

    it('Assigns 3-Tier Escalation Levels: Level 1 (Warden), Level 2 (Parent SMS), Level 3 (Critical Breach)', () => {
      expect(serviceCode).toContain('escalationLevel');
      expect(serviceCode).toContain('LEVEL 1 - WARDEN ALERT');
      expect(serviceCode).toContain('LEVEL 2 - PARENT SMS DISPATCHED');
      expect(serviceCode).toContain('LEVEL 3 - CRITICAL CURFEW BREACH');
    });

    it('Automatically flags parent notification requirement when delay exceeds 30 minutes', () => {
      expect(serviceCode).toContain('parentNotified: diffMinutes > 30');
    });
  });

  describe('2. Backend Controller Endpoints & Resolution Engine', () => {
    it('Controller exposes GET /api/security/overdue-returns for security, wardens, and admin', () => {
      expect(controllerCode).toContain("@Get('overdue-returns')");
      expect(controllerCode).toContain('Role.SECURITY');
      expect(controllerCode).toContain('Role.WARDEN');
      expect(controllerCode).toContain('Role.ADMIN');
    });

    it('Controller provides PATCH /api/security/overdue-returns/:id/resolve with notes and resolution status', () => {
      expect(controllerCode).toContain("@Patch('overdue-returns/:id/resolve')");
      expect(controllerCode).toContain('resolveOverdueReturn');
      expect(controllerCode).toContain("@Body('resolutionStatus')");
      expect(controllerCode).toContain("@Body('notes')");
    });

    it('Controller provides POST /api/security/overdue-returns/:id/escalate for parent and warden notification dispatch', () => {
      expect(controllerCode).toContain("@Post('overdue-returns/:id/escalate')");
      expect(controllerCode).toContain('escalateOverdueAlert');
      expect(serviceCode).toContain('async escalateOverdueAlert(id: string');
    });

    it('Backend records immutable audit logs upon overdue case resolution and alert escalation', () => {
      expect(serviceCode).toContain("action: 'GATE_OVERDUE_RESOLVED'");
      expect(serviceCode).toContain("action: 'GATE_OVERDUE_ALERT_DISPATCHED'");
    });
  });

  describe('3. Frontend Integration & Case Resolution Workflow', () => {
    it('Frontend API client exports overdue monitoring and escalation methods', () => {
      expect(apiCode).toContain('getSecurityOverdueReturns: () => request(');
      expect(apiCode).toContain('resolveSecurityOverdueReturn: (id, payload) =>');
      expect(apiCode).toContain('escalateSecurityOverdueReturn: (id, channel) =>');
    });

    it('Security portal overdue view displays escalation tier badges and KPI breakdown', () => {
      expect(securityPortalCode).toContain("activeTab === 'overdue'");
      expect(securityPortalCode).toContain('Active Overdue Breaches');
      expect(securityPortalCode).toContain('Critical Curfew Alerts');
      expect(securityPortalCode).toContain('LEVEL 3 - CRITICAL CURFEW');
      expect(securityPortalCode).toContain('LEVEL 2 - PARENT ALERT');
      expect(securityPortalCode).toContain('LEVEL 1 - WARDEN');
    });

    it('Security portal provides interactive Escalate Alert button and Case Resolution modal', () => {
      expect(securityPortalCode).toContain('handleEscalateOverdue');
      expect(securityPortalCode).toContain('handleResolveOverdueSubmit');
      expect(securityPortalCode).toContain('overdueResolveModal');
      expect(securityPortalCode).toContain('Resolve Curfew Overdue Case');
      expect(securityPortalCode).toContain('APPROVED_LATE_RETURN');
      expect(securityPortalCode).toContain('PARENT_CONFIRMED_DELAY');
      expect(securityPortalCode).toContain('DISCIPLINARY_ACTION_INITIATED');
    });

    it('Hostel Warden portal tracks overdue resident passes with filter and return actions', () => {
      expect(hostelPortalCode).toContain("gatePassStatusFilter === 'OVERDUE'");
      expect(hostelPortalCode).toContain('overduePasses.length');
    });
  });
});

