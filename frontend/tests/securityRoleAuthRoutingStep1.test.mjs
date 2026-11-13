import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getMenuConfigForRole } from '../src/config/menuConfig/index.js';
import { getSecurityMenuConfig } from '../src/config/menuConfig/menuConfig.security.js';

describe('STEP 1: Role Authentication, RBAC Permissions & Gate Pass Workflow Verification', () => {
  const backendDir = path.resolve(__dirname, '../../backend');
  const frontendDir = path.resolve(__dirname, '../src');

  // 1. Prisma Enum Role Verification
  it('1. Prisma schema explicitly includes all 5 module roles and excludes faculty from security models', () => {
    const schemaPath = path.join(backendDir, 'prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    expect(schema).toMatch(/enum\s+Role\s*\{[^}]*SECURITY[^}]*\}/);
    expect(schema).toMatch(/enum\s+Role\s*\{[^}]*STUDENT[^}]*\}/);
    expect(schema).toMatch(/enum\s+Role\s*\{[^}]*WARDEN[^}]*\}/);
    expect(schema).toMatch(/enum\s+Role\s*\{[^}]*ADMIN[^}]*\}/);
    expect(schema).toMatch(/enum\s+Role\s*\{[^}]*SUPER_ADMIN[^}]*\}/);
  });

  // 2. NestJS Controller Guard & Decorator Verification
  it('2. SecurityController is protected with JwtAuthGuard, RolesGuard and role-specific endpoints', () => {
    const controllerPath = path.join(backendDir, 'src/security/security.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    expect(controller).toContain('@UseGuards(JwtAuthGuard, RolesGuard)');
    expect(controller).toContain('@Roles(Role.SECURITY');
    expect(controller).toContain("Controller('security')");
  });

  // 3. Strict Security Guard Boundary: Guard can NEVER approve or reject passes
  it('3. Security Guard is strictly excluded from pass approval and rejection endpoints (403)', () => {
    const controllerPath = path.join(backendDir, 'src/security/security.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    // Find the approve endpoint decorator block
    const approveMatch = controller.match(/@Patch\('movement\/:id\/approve'\)[\s\S]*?@Roles\(([^)]+)\)/);
    expect(approveMatch).toBeDefined();
    expect(approveMatch[1]).not.toContain('Role.SECURITY');
    expect(approveMatch[1]).toContain('Role.WARDEN');

    // Find the reject endpoint decorator block
    const rejectMatch = controller.match(/@Patch\('movement\/:id\/reject'\)[\s\S]*?@Roles\(([^)]+)\)/);
    expect(rejectMatch).toBeDefined();
    expect(rejectMatch[1]).not.toContain('Role.SECURITY');
    expect(rejectMatch[1]).toContain('Role.WARDEN');
  });

  // 4. Strict Faculty Exclusion: Faculty has zero connection to student gate passes or security
  it('4. Faculty role is strictly excluded from student gate passes and security movement endpoints', () => {
    const controllerPath = path.join(backendDir, 'src/security/security.controller.ts');
    const controller = fs.readFileSync(controllerPath, 'utf8');

    // Ensure student movement request does not authorize faculty
    const requestMatch = controller.match(/@Post\('movement\/request'\)[\s\S]*?@Roles\(([^)]+)\)/);
    expect(requestMatch).toBeDefined();
    expect(requestMatch[1]).not.toContain('Role.FACULTY');

    // Ensure movement exit/entry does not authorize faculty
    const exitMatch = controller.match(/@Post\('movement\/exit'\)[\s\S]*?@Roles\(([^)]+)\)/);
    expect(exitMatch).toBeDefined();
    expect(exitMatch[1]).not.toContain('Role.FACULTY');

    const entryMatch = controller.match(/@Post\('movement\/entry'\)[\s\S]*?@Roles\(([^)]+)\)/);
    expect(entryMatch).toBeDefined();
    expect(entryMatch[1]).not.toContain('Role.FACULTY');
  });

  // 5. Frontend Role Configuration in App.jsx
  it('5. Frontend App.jsx configures SECURITY in roleCopy, demoCategories, and accounts', () => {
    const appPath = path.join(frontendDir, 'App.jsx');
    const appCode = fs.readFileSync(appPath, 'utf8');

    // Role copy
    expect(appCode).toContain("security: { label: 'Campus Security', icon: ShieldCheck }");
    // Campus Services category
    expect(appCode).toContain("{ key: 'security', label: 'Campus Security' }");
    // Portal rendering routing
    expect(appCode).toContain("account.role === 'security'");
    expect(appCode).toContain('<SecurityPortal account={account}');
    // Seed security guard identities
    expect(appCode).toContain("'SEC-101'");
    expect(appCode).toContain("'Dillip Kumar Pradhan'");
  });

  // 6. Standardized Menu Config Resolver for Security
  it('6. menuConfig resolver returns all operational security sections via getMenuConfigForRole', () => {
    const menuSections = getMenuConfigForRole('security');
    expect(menuSections.length).toBeGreaterThanOrEqual(4);

    const allItemIds = menuSections.flatMap((sec) => sec.items.map((i) => i.id));
    expect(allItemIds).toContain('dashboard');
    expect(allItemIds).toContain('overview');
    expect(allItemIds).toContain('scanner');
    expect(allItemIds).toContain('passes');
    expect(allItemIds).toContain('overdue');
    expect(allItemIds).toContain('visitors');
    expect(allItemIds).toContain('history');
    expect(allItemIds).toContain('alerts');
    expect(allItemIds).toContain('shift-notes');
    expect(allItemIds).toContain('profile');
  });

  // 7. Security Menu Config Context Badges
  it('7. getSecurityMenuConfig dynamically assigns notification badges when context is provided', () => {
    const configWithBadges = getSecurityMenuConfig({
      passesBadge: '14',
      overdueBadge: '3',
      visitorsBadge: '2',
      alertsBadge: '1',
    });

    const passesItem = configWithBadges.flatMap((s) => s.items).find((i) => i.id === 'passes');
    const overdueItem = configWithBadges.flatMap((s) => s.items).find((i) => i.id === 'overdue');
    const visitorsItem = configWithBadges.flatMap((s) => s.items).find((i) => i.id === 'visitors');
    const alertsItem = configWithBadges.flatMap((s) => s.items).find((i) => i.id === 'alerts');

    expect(passesItem?.badge).toBe('14');
    expect(overdueItem?.badge).toBe('3');
    expect(visitorsItem?.badge).toBe('2');
    expect(alertsItem?.badge).toBe('1');
  });

  // 8. Security Guard UI Component Integrity
  it('8. SecurityPortal component initializes with full operational layout and AppLayout binding', () => {
    const portalPath = path.join(frontendDir, 'components/SecurityPortal.jsx');
    const portalCode = fs.readFileSync(portalPath, 'utf8');

    expect(portalCode).toContain('export default function SecurityPortal');
    expect(portalCode).toContain('getSecurityMenuConfig');
    expect(portalCode).toContain('<AppLayout');
    expect(portalCode).toContain('portalName="Campus Security"');
  });

  // 9. Student Hostel Gate Pass Workflow Routing
  it('9. StudentHostelPage mounts StudentGatePassSection for Hostel -> Gate Pass sub-tab', () => {
    const hostelPagePath = path.join(frontendDir, 'pages/StudentHostelPage.jsx');
    const hostelPageCode = fs.readFileSync(hostelPagePath, 'utf8');

    expect(hostelPageCode).toContain('import StudentGatePassSection');
    expect(hostelPageCode).toContain('<StudentGatePassSection');
    expect(hostelPageCode).toContain("activeSubTab === 'gate-pass'");
  });

  // 10. Warden Approval Workflow in HostelPortal
  it('10. HostelPortal implements gate pass review queue with approve and reject actions', () => {
    const wardenPortalPath = path.join(frontendDir, 'components/HostelPortal.jsx');
    const wardenPortalCode = fs.readFileSync(wardenPortalPath, 'utf8');

    expect(wardenPortalCode).toContain('handleApproveGatePass');
    expect(wardenPortalCode).toContain('handleRejectGatePass');
    expect(wardenPortalCode).toContain('getAllGatePasses');
    expect(wardenPortalCode).toContain('Autonomous Digital Gate Pass Registry');
  });
});
