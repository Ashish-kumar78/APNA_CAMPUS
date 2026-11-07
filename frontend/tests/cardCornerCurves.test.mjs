import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Dashboard 4-Corner Card Curve Consistency Suite', () => {
  it('1. CalendarWidget section has 18px border radius and overflow hidden', () => {
    const filePath = path.resolve(__dirname, '../src/components/CalendarWidget.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toMatch(/<section[^>]*className=\{`dash-card dash-calendar \$\{className\}`\}[^>]*style=\{\{[^}]*borderRadius:\s*['"]18px['"][^}]*overflow:\s*['"]hidden['"][^}]*\}\}/);
  });

  it('2. HolidayListWidget section has 18px border radius and overflow hidden', () => {
    const filePath = path.resolve(__dirname, '../src/components/HolidayListWidget.jsx');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toMatch(/<section[^>]*className=\{`dash-card dash-holidays \$\{className\}`\}[^>]*style=\{\{[^}]*borderRadius:\s*['"]18px['"][^}]*overflow:\s*['"]hidden['"][^}]*\}\}/);
  });

  it('3. FacultyPortal.css ensures .fac-card and .dash-card have matching 18px curves', () => {
    const filePath = path.resolve(__dirname, '../src/components/FacultyPortal.css');
    const css = fs.readFileSync(filePath, 'utf8');

    // .fac-card has 18px curve
    expect(css).toMatch(/\.fac-card\s*\{[^}]*border-radius:\s*18px;/);

    // .fac-dashboard-row-2col > .dash-card has 18px curve and overflow hidden
    expect(css).toMatch(/\.fac-dashboard-row-2col\s*>\s*\.dash-card[^}]*border-radius:\s*18px;/);
    expect(css).toMatch(/\.fac-dashboard-row-2col\s*>\s*\.dash-card[^}]*overflow:\s*hidden;/);

    // .fac-calendar-widget-card has 18px curve and overflow hidden
    expect(css).toMatch(/\.fac-calendar-widget-card\s*\{[^}]*border-radius:\s*18px\s*!important;/);
    expect(css).toMatch(/\.fac-calendar-widget-card\s*\{[^}]*overflow:\s*hidden\s*!important;/);
  });

  it('4. DashboardHome.css provides fallback 18px radius on .dash-card', () => {
    const filePath = path.resolve(__dirname, '../src/DashboardHome.css');
    const css = fs.readFileSync(filePath, 'utf8');

    expect(css).toMatch(/\.dash-card\s*\{[^}]*border-radius:\s*var\(--d-radius,\s*18px\);/);
    expect(css).toMatch(/\.dash-card\s*\{[^}]*overflow:\s*hidden;/);
  });

  it('5. index.css establishes universal 18px curve on dash cards', () => {
    const filePath = path.resolve(__dirname, '../src/index.css');
    const css = fs.readFileSync(filePath, 'utf8');

    expect(css).toMatch(/\.dash-card,\s*\.dash-calendar,\s*\.dash-holidays\s*\{[^}]*border-radius:\s*18px;/);
  });
});

