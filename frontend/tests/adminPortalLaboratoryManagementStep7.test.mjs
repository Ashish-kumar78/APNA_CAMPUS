import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAdminMenuConfig } from '../src/config/menuConfig/menuConfig.admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 7: Admin Portal Laboratory Management Console', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. Admin Menu Configuration Wiring
  it('1. getAdminMenuConfig includes dedicated LABORATORY MANAGEMENT section with laboratory-management route', () => {
    const config = getAdminMenuConfig();
    const labSection = config.find(s => s.title === 'LABORATORY MANAGEMENT');
    expect(labSection).toBeDefined();

    const labItem = labSection.items.find(i => i.id === 'laboratory-management');
    expect(labItem).toBeDefined();
    expect(labItem.label).toBe('Laboratory Management');
  });

  // 2. AdminPortal.jsx Integration
  it('2. AdminPortal imports and renders AdminLaboratoryManagementModule with heading support', () => {
    const adminPortalPath = path.join(frontendDir, 'components/AdminPortal.jsx');
    const content = fs.readFileSync(adminPortalPath, 'utf8');

    expect(content).toContain("import AdminLaboratoryManagementModule from './laboratory/AdminLaboratoryManagementModule.jsx';");
    expect(content).toContain("id: 'laboratory-management'");
    expect(content).toContain("case 'laboratory-management':");
    expect(content).toContain("<AdminLaboratoryManagementModule account={account} />");
  });

  // 3. AdminLaboratoryManagementModule Structural Components
  it('3. AdminLaboratoryManagementModule exposes dynamic branch selector and all 5 requested tabs', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    // Dynamic Branch selection options
    expect(modContent).toContain('All Disciplines (Institutional)');
    expect(modContent).toMatch(/Computer Science\s*(&|&amp;)\s*Engineering/);
    expect(modContent).toMatch(/CSE\s*\(Artificial Intelligence\)/);
    expect(modContent).toContain('Biotechnology');
    expect(modContent).toMatch(/Electronics\s*(&|&amp;)\s*Communication/);
    expect(modContent).toContain('Mechanical Engineering');
    expect(modContent).toContain('Civil Engineering');

    // All 5 master tabs (A to E)
    expect(modContent).toContain('A. Laboratory Management');
    expect(modContent).toMatch(/B\.\s+Equipment\s*(&|&amp;)\s*Inventory/);
    expect(modContent).toMatch(/C\.\s+Complaints\s*(&|&amp;)\s*Maintenance/);
    expect(modContent).toMatch(/D\.\s+Academic Laboratory\s*(&|&amp;)\s*Attendance/);
    expect(modContent).toContain('E. Laboratory Reports');
  });

  // 4. Executive KPI Metrics Cards
  it('4. Module computes and displays executive KPI metrics', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toContain('TOTAL LABORATORIES');
    expect(modContent).toContain('ACTIVE ASSETS / INSTRUMENTS');
    expect(modContent).toContain('PENDING REQUISITIONS');
    expect(modContent).toContain('DAMAGED / COMPLAINTS');
    expect(modContent).toContain('SCHEDULED SESSIONS');
  });

  // 5. Admin Governance Modals
  it('5. Module includes Add Laboratory, Edit Laboratory, and Inspect Asset Detail modals', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toContain('Register New Laboratory');
    expect(modContent).toContain('Edit Laboratory:');
    expect(modContent).toContain('Asset Inspection Card');
    expect(modContent).toContain('Export Register');
  });

  // 6. Reactivity & Data Store Subscription
  it('6. Module subscribes to labStaffStore for real-time synchronization', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toContain('labStaffStore.subscribe');
    expect(modContent).toContain('labStaffStore.syncWithBackend');
  });
});
