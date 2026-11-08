import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 3: Backend Security Module (SecurityService & SecurityController)', () => {
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const modulePath = path.resolve(__dirname, '../../backend/src/security/security.module.ts');
  const appModulePath = path.resolve(__dirname, '../../backend/src/app.module.ts');
  const apiPath = path.resolve(__dirname, '../src/services/api.js');

  it('SecurityModule is registered and exported properly in app.module.ts', () => {
    const appModuleContent = fs.readFileSync(appModulePath, 'utf8');
    expect(appModuleContent).toContain("import { SecurityModule } from './security/security.module'");
    expect(appModuleContent).toContain('SecurityModule,');

    const moduleContent = fs.readFileSync(modulePath, 'utf8');
    expect(moduleContent).toContain('controllers: [SecurityController]');
    expect(moduleContent).toContain('providers: [SecurityService]');
  });

  it('SecurityController defines required REST endpoints with Role.SECURITY guards', () => {
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    expect(controllerContent).toContain("@Controller('security')");
    expect(controllerContent).toContain('@UseGuards(JwtAuthGuard, RolesGuard)');
    expect(controllerContent).toContain('@Roles(Role.SECURITY');

    // Endpoints
    expect(controllerContent).toContain("@Post('scan')");
    expect(controllerContent).toContain("@Post('movement/exit')");
    expect(controllerContent).toContain("@Post('movement/entry')");
    expect(controllerContent).toContain("@Get('overview-stats')");
    expect(controllerContent).toContain("@Get('passes/approved')");
    expect(controllerContent).toContain("@Get('movements/history')");
    expect(controllerContent).toContain("@Post('visitors/verify-code')");
    expect(controllerContent).toContain("@Post('visitors/walk-in')");
    expect(controllerContent).toContain("@Post('incidents')");
    expect(controllerContent).toContain("@Post('sync-offline-queue')");

    // Must NEVER have approve or reject endpoints for security
    expect(controllerContent).not.toMatch(/@Post\(['"]gate-passes\/:\w+\/approve['"]\)/);
    expect(controllerContent).not.toMatch(/@Post\(['"]gate-passes\/:\w+\/reject['"]\)/);
  });

  it('SecurityService implements concurrency-safe exit check blocking duplicate exits', () => {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    expect(serviceContent).toContain('Duplicate Exit Blocked');
    expect(serviceContent).toContain('has ALREADY exited campus');
    expect(serviceContent).toContain("direction: 'EXIT'");
    expect(serviceContent).toContain('parentNotificationLog');
  });

  it('SecurityService implements late-return detection and automated incident creation', () => {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    expect(serviceContent).toContain('Duplicate Entry Blocked');
    expect(serviceContent).toContain('isLate = true');
    expect(serviceContent).toContain('lateDuration');
    expect(serviceContent).toContain('Curfew Violation / Late Return');
    expect(serviceContent).toContain("direction: 'ENTRY'");
  });

  it('SecurityService provides offline queue idempotent sync support', () => {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    expect(serviceContent).toContain('syncOfflineQueue');
    expect(serviceContent).toContain('offlineSyncId');
    expect(serviceContent).toContain('syncedCount');
  });

  it('Frontend api.js contains all corresponding client methods for security endpoints', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    expect(apiContent).toContain('scanSecurityPass:');
    expect(apiContent).toContain('recordSecurityExit:');
    expect(apiContent).toContain('recordSecurityEntry:');
    expect(apiContent).toContain('getSecurityOverviewStats:');
    expect(apiContent).toContain('getSecurityApprovedPasses:');
    expect(apiContent).toContain('getSecurityMovementsHistory:');
    expect(apiContent).toContain('verifySecurityVisitorCode:');
    expect(apiContent).toContain('registerSecurityWalkInVisitor:');
    expect(apiContent).toContain('reportSecurityIncident:');
    expect(apiContent).toContain('syncSecurityOfflineQueue:');
  });
});

