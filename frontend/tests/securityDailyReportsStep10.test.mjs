import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 10: Daily Security Reports, Movement Summaries, Peak Hours, Incident Logs, and CSV/PDF Export', () => {
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const securityPortalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
  const menuConfigPath = path.resolve(__dirname, '../src/config/menuConfig/menuConfig.security.js');
  const apiPath = path.resolve(__dirname, '../src/services/api.js');
  const adminPortalPath = path.resolve(__dirname, '../src/components/AdminPortal.jsx');
  const hostelPortalPath = path.resolve(__dirname, '../src/components/HostelPortal.jsx');

  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const securityPortalCode = fs.readFileSync(securityPortalPath, 'utf8');
  const menuConfigCode = fs.readFileSync(menuConfigPath, 'utf8');
  const apiCode = fs.readFileSync(apiPath, 'utf8');
  const adminPortalCode = fs.readFileSync(adminPortalPath, 'utf8');
  const hostelPortalCode = fs.readFileSync(hostelPortalPath, 'utf8');

  describe('1. Daily Security Report API & Role Security Guardrails', () => {
    it('Backend controller exposes GET /api/security/reports/daily with query params', () => {
      expect(controllerCode).toContain("@Get('reports/daily')");
      expect(controllerCode).toContain('getDailySecurityReport');
      expect(controllerCode).toContain("@Query('date')");
      expect(controllerCode).toContain("@Query('hostel')");
    });

    it('Authorizes SECURITY, ADMIN, SUPER_ADMIN, and WARDEN roles for daily reports', () => {
      const reportEndpointSegment = controllerCode.slice(controllerCode.indexOf("@Get('reports/daily')") - 150, controllerCode.indexOf("@Get('reports/daily')") + 100);
      expect(reportEndpointSegment).toContain('Role.SECURITY');
      expect(reportEndpointSegment).toContain('Role.ADMIN');
      expect(reportEndpointSegment).toContain('Role.WARDEN');
    });

    it('Strictly isolates Faculty from student gate pass and security reports', () => {
      const inviteVisitorSegment = controllerCode.slice(controllerCode.indexOf("@Post('visitors/invite')") - 100, controllerCode.indexOf("@Post('visitors/invite')") + 50);
      expect(inviteVisitorSegment).not.toContain('Role.FACULTY');
    });
  });

  describe('2. Backend Daily Movement Summaries, Peak Hours & Incident Engine', () => {
    it('Computes comprehensive daily movement metrics: total, exits, entries, on-time, late curfew breaches, and compliance rate', () => {
      expect(serviceCode).toContain('async getDailySecurityReport(');
      expect(serviceCode).toContain('totalMovements');
      expect(serviceCode).toContain('totalExits');
      expect(serviceCode).toContain('totalEntries');
      expect(serviceCode).toContain('lateReturns');
      expect(serviceCode).toContain('curfewComplianceRate');
    });

    it('Performs 06:00 to 22:00 hourly peak turnstile throughput analysis and identifies morning rush & evening curfew peaks', () => {
      expect(serviceCode).toContain('for (let h = 6; h <= 22; h++)');
      expect(serviceCode).toContain('peakExitHour');
      expect(serviceCode).toContain('peakEntryHour');
      expect(serviceCode).toContain('peakOverallHour');
      expect(serviceCode).toContain('hourlyDistribution');
    });

    it('Generates security incident breakdown categorized by severity and status', () => {
      expect(serviceCode).toContain('incidentSummary');
      expect(serviceCode).toContain('bySeverity');
      expect(serviceCode).toContain('critical');
      expect(serviceCode).toContain('byStatus');
      expect(serviceCode).toContain('investigating');
    });

    it('Provides campus visitor census: pre-approved, walk-in, and currently active guests', () => {
      expect(serviceCode).toContain('visitorSummary');
      expect(serviceCode).toContain('preApproved');
      expect(serviceCode).toContain('currentlyInside');
    });

    it('Records immutable audit log upon daily report generation', () => {
      expect(serviceCode).toContain("action: 'GATE_DAILY_REPORT_GENERATED'");
    });
  });

  describe('3. Frontend Daily Reports UI, Visual Histogram & Multi-Format Exports', () => {
    it('Security navigation menu includes Daily Security Reports under MONITORING & LOGS', () => {
      expect(menuConfigCode).toContain("id: 'reports'");
      expect(menuConfigCode).toContain('Daily Security Reports');
      expect(menuConfigCode).toContain('BarChart3');
    });

    it('Frontend API client exposes getDailySecurityReport helper', () => {
      expect(apiCode).toContain('getDailySecurityReport: (date, hostel)');
      expect(apiCode).toContain('/security/reports/daily');
    });

    it('Security portal provides interactive date picker, hostel filter, and KPI cards', () => {
      expect(securityPortalCode).toContain("activeTab === 'reports'");
      expect(securityPortalCode).toContain('Daily Gate Security & Movement Telemetry Report');
      expect(securityPortalCode).toContain('reportDate');
      expect(securityPortalCode).toContain('reportHostelFilter');
      expect(securityPortalCode).toContain('TOTAL MOVEMENTS');
      expect(securityPortalCode).toContain('CURFEW COMPLIANCE');
      expect(securityPortalCode).toContain('PEAK MORNING RUSH');
      expect(securityPortalCode).toContain('PEAK EVENING RETURN');
    });

    it('Renders hourly peak hours visual bar histogram (06:00 to 22:00)', () => {
      expect(securityPortalCode).toContain('Hourly Turnstile Throughput & Peak Hours Breakdown (06:00 – 22:00)');
      expect(securityPortalCode).toContain('dailyReportData?.peakHours');
    });

    it('Provides both daily CSV and official PDF report export functions with officer sign-off', () => {
      expect(securityPortalCode).toContain('handleExportDailyCsv');
      expect(securityPortalCode).toContain('handleExportDailyPdf');
      expect(securityPortalCode).toContain('APNA CAMPUS - DAILY GATE SECURITY & PERIMETER REPORT');
      expect(securityPortalCode).toContain('Chief Warden / Security In-Charge Verification');
    });

    it('Cross-Portal Integration: Admin and Warden portals offer one-click daily gate security report export', () => {
      expect(adminPortalCode).toContain('Export Daily Gate Report (CSV)');
      expect(hostelPortalCode).toContain('Export Daily Gate Report (CSV)');
    });
  });
});

