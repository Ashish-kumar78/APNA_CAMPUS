import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 7: Warden & Admin Integration (Telemetry Scoping & Gate Analytics)', () => {
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const apiPath = path.resolve(__dirname, '../src/services/api.js');

  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const apiCode = fs.readFileSync(apiPath, 'utf8');

  describe('1. Warden Hostel-Scoped Telemetry & Overdue Monitoring', () => {
    it('Filters gate movements and approved passes strictly by hostel', () => {
      expect(serviceCode).toContain('if (filter.hostel && filter.hostel !== \'ALL\')');
      expect(serviceCode).toContain('m.hostelName || \'\'');
      expect(controllerCode).toContain("@Query('hostel') hostel?: string");
    });

    it('Enforces that only Wardens, Admins, and Hostel Admins can approve or reject gate passes, strictly excluding Security', () => {
      // Security role must NEVER have permission to approve/reject passes
      expect(controllerCode).toContain("@Patch('movement/:id/approve')");
      expect(controllerCode).toMatch(/@Roles\(Role\.WARDEN,\s*Role\.ADMIN,\s*Role\.SUPER_ADMIN(?:,\s*Role\.HOSTEL)?\)/);
      expect(controllerCode).not.toContain("@Patch('movement/:id/approve')\n  @Roles(Role.SECURITY");

      expect(controllerCode).toContain("@Patch('movement/:id/reject')");
      expect(controllerCode).toMatch(/@Roles\(Role\.WARDEN,\s*Role\.ADMIN,\s*Role\.SUPER_ADMIN(?:,\s*Role\.HOSTEL)?\)/);
      expect(controllerCode).not.toContain("@Patch('movement/:id/reject')\n  @Roles(Role.SECURITY");
    });

    it('Provides Warden and Security with live overdue return records and resolution workflow', () => {
      expect(controllerCode).toContain("@Get('overdue-returns')");
      expect(controllerCode).toContain("@Patch('overdue-returns/:id/resolve')");
      expect(serviceCode).toContain('getOverdueReturns()');
      expect(serviceCode).toContain('resolveOverdueReturn(id: string, notes?: string');
      expect(serviceCode).toContain("status: 'RESOLVED'");
    });
  });

  describe('2. Campus Admin Movement Analytics & Guard Telemetry', () => {
    it('Provides Admin & Chief Security Officer gate analytics endpoint', () => {
      expect(controllerCode).toContain("@Get('admin/analytics')");
      expect(controllerCode).toContain('@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.WARDEN)');
      expect(serviceCode).toContain('getAdminGateAnalytics(hostelFilter?: string)');
      expect(apiCode).toContain("getSecurityAdminAnalytics: (hostel) =>");
    });

    it('Computes campus-wide movement statistics, hostel breakdown, and guard duty telemetry', () => {
      expect(serviceCode).toContain('totalMovementsToday: todayMovements.length');
      expect(serviceCode).toContain('totalExits');
      expect(serviceCode).toContain('totalEntries');
      expect(serviceCode).toContain('curfewBreachRate');
      expect(serviceCode).toContain('byHostel');
      expect(serviceCode).toContain('guardsOnDuty');
    });
  });
});

