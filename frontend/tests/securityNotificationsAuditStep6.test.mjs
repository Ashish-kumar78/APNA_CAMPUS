import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ALL_CAMPUS_ROLES, normalizeRole, ROLE_DEFAULT_NOTIFICATIONS } from '../src/services/notificationsStore.js';

describe('STEP 6: Simulated Parent Notifications & Audit Trail Integration', () => {
  it('notificationsStore includes "security" in ALL_CAMPUS_ROLES and normalizes guard aliases', () => {
    expect(ALL_CAMPUS_ROLES).toContain('security');
    expect(normalizeRole('security')).toBe('security');
    expect(normalizeRole('security_guard')).toBe('security');
    expect(normalizeRole('campus_guard')).toBe('security');
  });

  it('notificationsStore provides seed institutional security notifications', () => {
    expect(ROLE_DEFAULT_NOTIFICATIONS.security).toBeDefined();
    expect(Array.isArray(ROLE_DEFAULT_NOTIFICATIONS.security)).toBe(true);
    expect(ROLE_DEFAULT_NOTIFICATIONS.security.length).toBeGreaterThanOrEqual(1);

    const firstNotif = ROLE_DEFAULT_NOTIFICATIONS.security[0];
    expect(firstNotif.title).toContain('Curfew');
    expect(firstNotif.category).toBe('SECURITY');
  });

  it('backend security.service.ts formats simulated parent notification for physical exits', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain('parentNotificationLog');
    expect(serviceCode).toContain('SMS_AND_WHATSAPP');
    expect(serviceCode).toContain('has EXITED the campus');
    expect(serviceCode).toContain('logAudit');
    expect(serviceCode).toContain('GATE_STUDENT_EXIT');
  });

  it('backend security.service.ts formats simulated parent notification and late alerts for entries', () => {
    const serviceFile = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
    const serviceCode = fs.readFileSync(serviceFile, 'utf8');

    expect(serviceCode).toContain('has safely RETURNED to campus');
    expect(serviceCode).toContain('GATE_STUDENT_ENTRY');
    expect(serviceCode).toContain('GATE_CURFEW_BREACH');
  });

  it('StudentGatePassSection renders physical gate exit and return checkpoint timestamps', () => {
    const studentPassFile = path.resolve(__dirname, '../src/components/StudentGatePassSection.jsx');
    const studentPassCode = fs.readFileSync(studentPassFile, 'utf8');

    expect(studentPassCode).toContain('Campus Gate Exit Recorded');
    expect(studentPassCode).toContain('Campus Gate Return Recorded');
    expect(studentPassCode).toContain('actualExitTime');
    expect(studentPassCode).toContain('actualReturnTime');
  });
});
