import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('STEP 7: Warden & Admin Portal Integrations with Security Role', () => {
  it('HostelPortal tracks outside students and overdue passes for warden oversight', () => {
    const hostelFile = path.resolve(__dirname, '../src/components/HostelPortal.jsx');
    const hostelCode = fs.readFileSync(hostelFile, 'utf8');

    // Warden pass status filters
    expect(hostelCode).toContain('Exited Campus');
    expect(hostelCode).toContain('overduePasses');
    expect(hostelCode).toContain('Gate Security Exit Checkpoint');
    expect(hostelCode).toContain('Gate Security Return Checkpoint');
  });

  it('AdminPortal contains Security tab and Gate Checkpoint Telemetry analytics', () => {
    const adminFile = path.resolve(__dirname, '../src/components/AdminPortal.jsx');
    const adminCode = fs.readFileSync(adminFile, 'utf8');

    expect(adminCode).toContain("activeTab === 'security'");
    expect(adminCode).toContain('Gate Checkpoint & Turnstile Access Telemetry');
    expect(adminCode).toContain('Open Security Guard Portal');
    expect(adminCode).toContain('Students Outside Campus');
    expect(adminCode).toContain('Today Gate Movements');
    expect(adminCode).toContain('Curfew Overdue Alerts');
    expect(adminCode).toContain('Active Campus Visitors');
  });
});
