import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMenuConfigForRole } from '../src/config/menuConfig/index.js';
import { getStaffMenuConfig } from '../src/config/menuConfig/menuConfig.staff.js';
import { getAdminMenuConfig } from '../src/config/menuConfig/menuConfig.admin.js';
import { getSuperAdminMenuConfig } from '../src/config/menuConfig/menuConfig.superAdmin.js';
import { BRANCHES_CONFIG } from '../src/components/StaffModules/labStaffData.js';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 1: Role Authentication, Menu Resolution & Dynamic Branch Routing', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const backendDir = path.resolve(rootDir, 'backend');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. Menu Config Resolver for Staff Lab
  it('1. Resolves complete Staff Lab menu configuration for all lab staff role aliases', () => {
    const staffAliases = ['staff', 'technician', 'lab_assistant', 'lab_incharge', 'lab_technician', 'lab_staff'];

    staffAliases.forEach(alias => {
      const menu = getMenuConfigForRole(alias);
      expect(menu).toBeDefined();
      expect(Array.isArray(menu)).toBe(true);
      expect(menu.length).toBeGreaterThanOrEqual(7);

      const titles = menu.map(m => m.title);
      expect(titles).toContain('OVERVIEW');
      expect(titles).toContain('LABORATORY OPERATIONS');
      expect(titles).toContain('C. ACADEMICS & ATTENDANCE');
      expect(titles).toContain('D. EQUIPMENT & INVENTORY');
      expect(titles).toContain('E. MAINTENANCE & SAFETY');
      expect(titles).toContain('F. REQUESTS & ADMINISTRATION');
      expect(titles).toContain('G. REPORTS & ANALYTICS');
    });
  });

  // 2. Menu Config Resolver for Admin and Super Admin
  it('2. Resolves specialized menu configurations for Admin and Super Admin roles', () => {
    const adminMenu = getMenuConfigForRole('admin');
    expect(adminMenu).toBeDefined();
    expect(Array.isArray(adminMenu)).toBe(true);
    expect(adminMenu.length).toBeGreaterThan(0);

    const superAdminMenu = getMenuConfigForRole('super_admin');
    expect(superAdminMenu).toBeDefined();
    expect(Array.isArray(superAdminMenu)).toBe(true);
    expect(superAdminMenu.length).toBeGreaterThan(0);
  });

  // 3. App.jsx Role-Based Portal Routing
  it('3. App.jsx maps staff, admin, and super_admin roles to their respective portals', () => {
    const appPath = path.join(frontendDir, 'App.jsx');
    const appContent = fs.readFileSync(appPath, 'utf8');

    // Verifies StaffPortal routing
    expect(appContent).toMatch(/account\.role === 'staff'/);
    expect(appContent).toMatch(/<StaffPortal\s+account=\{account\}/);

    // Verifies AdminPortal routing
    expect(appContent).toMatch(/account\.role === 'admin'/);
    expect(appContent).toMatch(/<AdminPortal\s+account=\{account\}/);

    // Verifies SuperAdminPortal routing
    expect(appContent).toMatch(/account\.role === 'super_admin'/);
    expect(appContent).toMatch(/<SuperAdminPortal\s+account=\{account\}/);
  });

  // 4. Dynamic Branches Configuration Completeness
  it('4. BRANCHES_CONFIG includes all key engineering disciplines including Biotechnology and CSE (AI)', () => {
    const requiredBranches = ['CSE', 'CSE_AI', 'ECE', 'MECH', 'CIVIL', 'BIOTECH'];
    requiredBranches.forEach(b => {
      expect(BRANCHES_CONFIG[b]).toBeDefined();
      expect(BRANCHES_CONFIG[b].name).toBeTruthy();
      expect(BRANCHES_CONFIG[b].building).toBeTruthy();
      expect(BRANCHES_CONFIG[b].equipmentCategories.length).toBeGreaterThan(0);
      expect(BRANCHES_CONFIG[b].consumableCategories.length).toBeGreaterThan(0);
      expect(BRANCHES_CONFIG[b].safetyTemplate.length).toBeGreaterThan(0);
    });

    expect(BRANCHES_CONFIG.BIOTECH.name).toBe('Biotechnology');
    expect(BRANCHES_CONFIG.CSE_AI.name).toBe('CSE (Artificial Intelligence)');
  });

  // 5. Dynamic Branch Switching in labStaffStore
  it('5. labStaffStore switches active branch and re-focuses activeLabId correctly', () => {
    // Switch to BIOTECH
    labStaffStore.setBranch('BIOTECH');
    expect(labStaffStore.getBranch()).toBe('BIOTECH');
    expect(labStaffStore.getActiveLabId()).toBe('BIOTECH-LAB-01');

    // Switch to CSE
    labStaffStore.setBranch('CSE');
    expect(labStaffStore.getBranch()).toBe('CSE');
    expect(labStaffStore.getActiveLabId()).toBe('CSE-LAB-02');
  });

  // 6. Backend Demo Users Match Role Architecture
  it('6. Backend demo users correctly seed Mr. Biswajit Sahoo as STAFF and ADM-001 as ADMIN', () => {
    const demoUsersPath = path.join(backendDir, 'src/auth/demo-users.ts');
    const demoContent = fs.readFileSync(demoUsersPath, 'utf8');

    expect(demoContent).toContain('Mr. Biswajit Sahoo');
    expect(demoContent).toContain("role: 'STAFF'");
    expect(demoContent).toContain('Campus Administrator');
    expect(demoContent).toContain("role: 'ADMIN'");
    expect(demoContent).toContain('Chief Systems Architect');
    expect(demoContent).toContain("role: 'SUPER_ADMIN'");
  });

  // 7. Backend Roles Guard Enforcement
  it('7. Backend RolesGuard enforces strict role checks using Prisma Role enum', () => {
    const guardPath = path.join(backendDir, 'src/auth/roles.guard.ts');
    const guardContent = fs.readFileSync(guardPath, 'utf8');

    expect(guardContent).toContain('export class RolesGuard');
    expect(guardContent).toContain('requiredRoles.includes');
    expect(guardContent).toContain('Access restricted to roles:');
  });
});

