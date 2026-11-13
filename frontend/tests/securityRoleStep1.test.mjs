import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 1: Role Definition, Auth & Routing for SECURITY Role', () => {
  const schemaPath = path.resolve(__dirname, '../../backend/prisma/schema.prisma');
  const rbacPath = path.resolve(__dirname, '../../backend/src/rbac/rbac.ts');
  const demoUsersPath = path.resolve(__dirname, '../../backend/src/auth/demo-users.ts');
  const appJsxPath = path.resolve(__dirname, '../src/App.jsx');
  const securityPortalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');

  it('Prisma schema contains SECURITY in Role enum', () => {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    expect(schemaContent).toMatch(/enum Role\s*{[^}]*SECURITY[^}]*}/);
  });

  it('RBAC policy defines security role with appropriate scoped permissions', () => {
    const rbacContent = fs.readFileSync(rbacPath, 'utf8');
    expect(rbacContent).toContain('security: {');
    expect(rbacContent).toContain("'security.view_dashboard'");
    expect(rbacContent).toContain("'security.scan_qr'");
    expect(rbacContent).toContain("'security.verify_gate_pass'");
    expect(rbacContent).toContain("'security.record_movement'");
    expect(rbacContent).toContain("'security.manage_visitors'");
    expect(rbacContent).toContain("'security.report_incident'");
    expect(rbacContent).toContain("'security.view_history'");
    
    // Security guards must never have approval or academic modification permissions
    expect(rbacContent).not.toMatch(/security:\s*{[^}]*hostel\.allocate[^}]*}/);
    expect(rbacContent).not.toMatch(/security:\s*{[^}]*results\.approve[^}]*}/);
  });

  it('Demo users include security guards (SEC-101 and SEC-102)', () => {
    const demoContent = fs.readFileSync(demoUsersPath, 'utf8');
    expect(demoContent).toContain("'sec-101'");
    expect(demoContent).toContain("'sec-102'");
    expect(demoContent).toContain("'security'");
    expect(demoContent).toContain('Dillip Kumar Pradhan');
    expect(demoContent).toContain('Bhuban Mohan Senapati');
    expect(demoContent).toContain("role: 'SECURITY'");
  });

  it('App.jsx configures Campus Security under Campus Services demo categories', () => {
    const appContent = fs.readFileSync(appJsxPath, 'utf8');
    expect(appContent).toContain("import SecurityPortal from './components/SecurityPortal.jsx'");
    expect(appContent).toContain("security: { label: 'Campus Security', icon: ShieldCheck }");
    expect(appContent).toContain("{ key: 'security', label: 'Campus Security' }");
    expect(appContent).toContain("account.role === 'security'");
  });

  it('SecurityPortal component exists and includes required operational tabs', () => {
    expect(fs.existsSync(securityPortalPath)).toBe(true);
    const portalContent = fs.readFileSync(securityPortalPath, 'utf8');
    expect(portalContent).toContain('Gate Overview');
    expect(portalContent).toContain('QR Scanner');
    expect(portalContent).toContain('Approved Gate Passes');
    expect(portalContent).toContain('Visitor Management');
    expect(portalContent).toContain('Movement History');
    expect(portalContent).toContain('Security Alerts');
  });
});
