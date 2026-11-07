import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getMenuConfigForRole } from '../src/config/menuConfig/index.js';

describe('Fixed Universal Sidebar & Shared AppLayout Suite', () => {
  const resolveSrc = (rel) => {
    if (fs.existsSync(path.resolve('src', rel))) return path.resolve('src', rel);
    return path.resolve('frontend/src', rel);
  };
  const sidebarJsx = fs.readFileSync(resolveSrc('components/Navigation/Sidebar.jsx'), 'utf8');
  const appLayoutJsx = fs.readFileSync(resolveSrc('components/Navigation/AppLayout.jsx'), 'utf8');
  const navCss = fs.readFileSync(resolveSrc('components/Navigation/Navigation.css'), 'utf8');
  const sidebarItemJsx = fs.readFileSync(resolveSrc('components/Navigation/SidebarItem.jsx'), 'utf8');
  const sidebarSectionJsx = fs.readFileSync(resolveSrc('components/Navigation/SidebarSection.jsx'), 'utf8');

  it('1. AppLayout integrates the unified fixed Sidebar component and role menuConfig resolver', () => {
    expect(appLayoutJsx).toContain("import Sidebar from './Sidebar.jsx'");
    expect(appLayoutJsx).toContain("import { getMenuConfigForRole } from '../../config/menuConfig/index.js'");
    expect(appLayoutJsx).toContain('getMenuConfigForRole(account?.role');
    expect(appLayoutJsx).toContain('<Sidebar');
  });

  it('2. Sidebar component contains exactly 3 zones (Header, Nav Menu, Footer)', () => {
    // Zone 1: Top Identity Header
    expect(sidebarJsx).toContain('apna-sidebar-header');
    expect(sidebarJsx).toContain('apna-sidebar-brand-btn');
    expect(sidebarJsx).toContain('apna-sidebar-logo-frame');
    expect(sidebarJsx).toContain('apna-sidebar-title');

    // Zone 2: Navigation Menu
    expect(sidebarJsx).toContain('apna-sidebar-nav');
    expect(sidebarJsx).toContain('<SidebarSection');
    expect(sidebarJsx).toContain('<SidebarItem');

    // Zone 3: Bottom Footer
    expect(sidebarJsx).toContain('apna-sidebar-footer');
    expect(sidebarJsx).toContain('apna-sidebar-online-status');
    expect(sidebarJsx).toContain('System Online');
    expect(sidebarJsx).toContain('apna-sidebar-sync-time');
    expect(sidebarJsx).toContain('AUTHORIZED SCOPE');
    expect(sidebarJsx).toContain('apna-sidebar-role-card');
  });

  it('3. Fixed position behavior and CSS variables in Navigation.css', () => {
    // CSS Variables for sidebar sizing
    expect(navCss).toMatch(/--sidebar-expanded-width:\s*17rem/);
    expect(navCss).toMatch(/--sidebar-collapsed-width:\s*4\.5rem/);
    expect(navCss).toContain('--sidebar-width: var(--sidebar-expanded-width)');

    // Fixed sidebar pinned at top: 0, left: 0, height: 100vh / 100dvh
    expect(navCss).toContain('position: fixed');
    expect(navCss).toMatch(/\.apna-sidebar\s*\{[\s\S]*?position:\s*fixed;/);
    expect(navCss).toMatch(/\.apna-sidebar\s*\{[\s\S]*?top:\s*0;/);
    expect(navCss).toMatch(/\.apna-sidebar\s*\{[\s\S]*?left:\s*0;/);
    expect(navCss).toMatch(/\.apna-sidebar\s*\{[\s\S]*?height:\s*100vh;/);
    expect(navCss).toMatch(/\.apna-sidebar\s*\{[\s\S]*?height:\s*100dvh;/);
    expect(navCss).toMatch(/\.apna-sidebar\s*\{[\s\S]*?width:\s*var\(--sidebar-width\);/);

    // Fixed topbar offset by sidebar width
    expect(navCss).toMatch(/\.apna-topbar\s*\{[\s\S]*?left:\s*var\(--sidebar-width\);/);

    // Fixed breadcrumb offset by sidebar width
    expect(navCss).toMatch(/\.apna-breadcrumb-bar\s*\{[\s\S]*?left:\s*var\(--sidebar-width\);/);

    // Independent main workspace margin-left
    expect(navCss).toMatch(/\.apna-main-workspace\s*\{[\s\S]*?margin-left:\s*var\(--sidebar-width\);/);

    // Scrollable navigation inside Zone 2 only
    expect(navCss).toMatch(/\.apna-sidebar-nav\s*\{[\s\S]*?overflow-y:\s*auto;/);
  });

  it('4. Mobile responsive off-canvas drawer (<1024px)', () => {
    // Media query resets topbar and workspace left offset
    expect(navCss).toMatch(/@media\s*\(max-width:\s*1024px\)\s*\{[\s\S]*?\.apna-topbar\s*\{[\s\S]*?left:\s*0\s*!important;/);
    expect(navCss).toMatch(/@media\s*\(max-width:\s*1024px\)\s*\{[\s\S]*?\.apna-main-workspace\s*\{[\s\S]*?margin-left:\s*0\s*!important;/);

    // Off-canvas transform
    expect(navCss).toMatch(/@media\s*\(max-width:\s*1024px\)\s*\{[\s\S]*?\.apna-sidebar\s*\{[\s\S]*?transform:\s*translateX\(-100%\);/);
    expect(navCss).toMatch(/\.apna-sidebar\.mobile-open\s*\{[\s\S]*?transform:\s*translateX\(0\);/);

    // Backdrop overlay
    expect(navCss).toContain('.apna-sidebar-backdrop');
    expect(sidebarJsx).toContain('apna-sidebar-backdrop');
  });

  it('5. State persistence and active route auto-expand in localStorage', () => {
    expect(sidebarJsx).toContain('apna_sidebar_collapsed_sections');
    expect(sidebarJsx).toContain('localStorage.getItem');
    expect(sidebarJsx).toContain('localStorage.setItem');
    expect(appLayoutJsx).toContain('apna_sidebar_open');

    // Auto-expand section containing active tab
    expect(sidebarJsx).toContain('hasActive');
  });

  it('6. Text Display Scaling compatibility and truncation bounds', () => {
    // SidebarItem has truncate and title tooltip
    expect(sidebarItemJsx).toContain('truncate min-w-0');
    expect(sidebarItemJsx).toContain('title={item.label}');

    // SidebarSection title has truncate and title tooltip
    expect(sidebarSectionJsx).toContain('truncate min-w-0');
    expect(sidebarSectionJsx).toContain('title={title}');

    // Sidebar header and footer have truncate
    expect(sidebarJsx).toContain('truncate min-w-0');
  });

  it('7. Role safety: all 18 platform roles resolve valid navigation sections with items', () => {
    const roles = [
      'faculty',
      'student',
      'admin',
      'hod',
      'super_admin',
      'principal',
      'accounts',
      'exam_cell',
      'warden',
      'library',
      'placement',
      'transport',
      'canteen',
      'admissions',
      'campus_ops',
      'management',
      'scholarship',
      'staff'
    ];

    for (const role of roles) {
      const config = getMenuConfigForRole(role);
      expect(Array.isArray(config), `Role ${role} should return array`).toBe(true);
      expect(config.length, `Role ${role} should have at least 1 section`).toBeGreaterThan(0);

      for (const section of config) {
        expect(Array.isArray(section.items), `Section ${section.title} in ${role} should have items`).toBe(true);
        expect(section.items.length, `Section ${section.title} in ${role} should not be empty`).toBeGreaterThan(0);

        for (const item of section.items) {
          expect(item.id || item.page || item.route, `Item ${item.label} in ${role} must have id`).toBeDefined();
          expect(typeof item.label, `Item in ${role} must have string label`).toBe('string');
          expect(item.icon, `Item ${item.label} in ${role} must have an icon`).toBeDefined();
        }
      }
    }
  });

  it('8. Independent dashboard scrolling architecture: sidebar fixed, workspace scrolls independently', () => {
    // Layout and body containers lock outer viewport scroll
    expect(navCss).toMatch(/\.apna-app-layout\s*\{[\s\S]*?overflow:\s*hidden;/);
    expect(navCss).toMatch(/\.apna-layout-body\s*\{[\s\S]*?overflow:\s*hidden;/);

    // Workspace independently scrolls with overflow-y: auto
    expect(navCss).toMatch(/\.apna-main-workspace\s*\{[\s\S]*?overflow-y:\s*auto;/);
    expect(navCss).toMatch(/\.apna-main-workspace\s*\{[\s\S]*?overscroll-behavior:\s*contain;/);
    expect(navCss).toMatch(/\.apna-main-workspace\s*\{[\s\S]*?height:\s*calc\(100vh -/);
    expect(navCss).toMatch(/\.apna-main-workspace\s*\{[\s\S]*?height:\s*calc\(100dvh -/);

    // AppLayout resets scroll position to top on navigation/tab change
    expect(appLayoutJsx).toContain('mainWorkspaceRef');
    expect(appLayoutJsx).toContain('mainWorkspaceRef.current.scrollTo');
  });
});

