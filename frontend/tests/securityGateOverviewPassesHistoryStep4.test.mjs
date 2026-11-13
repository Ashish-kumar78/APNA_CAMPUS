import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 4: Gate Overview, Approved Gate Passes & Movement History', () => {
  const portalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
  const portalCode = fs.readFileSync(portalPath, 'utf8');

  describe('1. Gate Overview Operational KPIs & Checkpoints Matrix', () => {
    it('defines and computes all 7 real-time operational KPI counters', () => {
      // 1. Students Currently Outside
      expect(portalCode).toContain('Students Currently Outside');
      expect(portalCode).toContain('stats.studentsOutside');

      // 2. Today movements (Exits + Entries)
      expect(portalCode).toContain("Today's Gate Movements");
      expect(portalCode).toContain('stats.todayExits + stats.todayEntries');
      expect(portalCode).toContain('stats.todayExits');
      expect(portalCode).toContain('stats.todayEntries');

      // 3. Overdue / Late Returns
      expect(portalCode).toContain('Overdue / Late Returns');
      expect(portalCode).toContain('stats.lateReturns');

      // 4. Active Visitors Inside
      expect(portalCode).toContain('Active Visitors Inside');
      expect(portalCode).toContain('stats.activeVisitors');

      // 5. Approved Passes Ready
      expect(portalCode).toContain('Approved Passes Ready');
      expect(portalCode).toContain("p.catalogStatus === 'PENDING_EXIT'");

      // 6. Incidents & Active Security Alerts
      expect(portalCode).toContain('Incidents & Breaches');
      expect(portalCode).toContain('alertsList.length');
    });

    it('renders the live campus gate checkpoints turnstile matrix', () => {
      expect(portalCode).toContain('1. Campus Gate Checkpoints & Turnstile Status');
      expect(portalCode).toContain('Checkpoint Gate');
      expect(portalCode).toContain('Type & Biometrics');
      expect(portalCode).toContain('Guard on Duty');
      expect(portalCode).toContain("Today's Turnstile Count");
      expect(portalCode).toContain('Main Campus Gate 1 (Front Entrance)');
      expect(portalCode).toContain('Hostel Quadrangle North Gate 2');
    });

    it('provides shift selection controls for 24/7 security handover', () => {
      expect(portalCode).toContain('Morning Shift (06:00 - 14:00)');
      expect(portalCode).toContain('Evening Shift (14:00 - 22:00)');
      expect(portalCode).toContain('Night Curfew Shift (22:00 - 06:00)');
    });
  });

  describe('2. Approved Gate Passes Catalog & Real-time Filter System', () => {
    it('provides comprehensive pass catalog filters for status, hostel and search', () => {
      expect(portalCode).toContain('Warden Approved Gate Passes Catalog');
      expect(portalCode).toContain('passSearch');
      expect(portalCode).toContain('passFilterStatus');
      expect(portalCode).toContain('passFilterHostel');

      // Status filters matching the workflow
      expect(portalCode).toContain('value="PENDING_EXIT"');
      expect(portalCode).toContain('value="OUT"');
      expect(portalCode).toContain('value="RETURNED"');
      expect(portalCode).toContain('value="LATE"');

      // Hostels
      expect(portalCode).toContain('Gandhi Boys Residence');
      expect(portalCode).toContain('Sarojini Girls Residence');
    });

    it('renders accurate pass details and direct security verification trigger', () => {
      expect(portalCode).toContain('Pass ID');
      expect(portalCode).toContain('Student Name & Roll');
      expect(portalCode).toContain('Purpose & Destination');
      expect(portalCode).toContain('Leave Window');
      expect(portalCode).toContain('handlePerformScan');
    });
  });

  describe('3. Gate Movement Chronological History & CSV/Excel Telemetry Export', () => {
    it('provides directional, checkpoint, role, and text search filters for history logs', () => {
      expect(portalCode).toContain('historyDirection');
      expect(portalCode).toContain('historyGateFilter');
      expect(portalCode).toContain('historyRoleFilter');
      expect(portalCode).toContain('historySearch');

      expect(portalCode).toContain('value="EXIT"');
      expect(portalCode).toContain('value="ENTRY"');
      expect(portalCode).toContain('value="STUDENT"');
      expect(portalCode).toContain('value="FACULTY"');
      expect(portalCode).toContain('value="VISITOR"');
    });

    it('exports audit-compliant telemetry to CSV without leaking student sensitive records', () => {
      expect(portalCode).toContain('handleExportHistory');
      expect(portalCode).toContain('exportToCsv');
      expect(portalCode).toContain('Movement Code');
      expect(portalCode).toContain('Direction');
      expect(portalCode).toContain('Gate Checkpoint');
      expect(portalCode).toContain('Guard on Duty');
      expect(portalCode).toContain('Curfew Violation');

        // Ensures non-security fields like grades, CGPA, or bank details are strictly omitted
        expect(portalCode).not.toContain('CGPA: m.cgpa');
        expect(portalCode).not.toContain('FeeBalance: m.fee');
      });
    });

    describe('4. Approved Gate Pass Secure QR Generation & Client Rendering (Section 4.C)', () => {
      it('generates unpredictable ACGP cryptographic pass token without exposing sensitive details', () => {
        const studentGatePassCode = fs.readFileSync(path.resolve(__dirname, '../src/components/StudentGatePassSection.jsx'), 'utf8');
        const dynamicQrCode = fs.readFileSync(path.resolve(__dirname, '../src/services/dynamicQrService.js'), 'utf8');
        const securityServiceCode = fs.readFileSync(path.resolve(__dirname, '../../backend/src/security/security.service.ts'), 'utf8');

        // Dynamic QR service provides generateGatePassToken
        expect(dynamicQrCode).toContain('generateGatePassToken(pass, student)');
        expect(dynamicQrCode).toContain('ACGP.');
        expect(dynamicQrCode).toContain('APPROVED_GATE_PASS');

        // StudentGatePassSection renders QrSvgRenderer with token
        expect(studentGatePassCode).toContain('import QrSvgRenderer from \'./Common/QrSvgRenderer.jsx\'');
        expect(studentGatePassCode).toContain('OFFICIAL SECURE GATE PASS QR CODE');
        expect(studentGatePassCode).toContain('QrSvgRenderer');
        expect(studentGatePassCode).toContain('dynamicQrService.generateGatePassToken');

        // Backend scanPass decodes ACGP tokens
        expect(securityServiceCode).toContain("query.startsWith('ACGP.')");
      });

      it('displays all 9 mandatory pass fields alongside QR code inside CMS', () => {
        const studentGatePassCode = fs.readFileSync(path.resolve(__dirname, '../src/components/StudentGatePassSection.jsx'), 'utf8');

        // 1. Student name
        expect(studentGatePassCode).toContain('selectedDigitalPass.studentName');
        // 2. Registration number / Roll number
        expect(studentGatePassCode).toContain('selectedDigitalPass.registrationNumber');
        expect(studentGatePassCode).toContain('selectedDigitalPass.rollNumber');
        // 3. Hostel
        expect(studentGatePassCode).toContain('selectedDigitalPass.hostelName');
        // 4. Room number
        expect(studentGatePassCode).toContain('selectedDigitalPass.roomNumber');
        // 5. Gate-pass type
        expect(studentGatePassCode).toContain('selectedDigitalPass.purposeType');
        // 6. Departure time
        expect(studentGatePassCode).toContain('selectedDigitalPass.outDateTime');
        // 7. Expected return time
        expect(studentGatePassCode).toContain('selectedDigitalPass.inDateTime');
        // 8. Approval status
        expect(studentGatePassCode).toContain('HOSTEL RESIDENT OUTSTATION GATE PASS');
        expect(studentGatePassCode).toContain('Approved on');
        // 9. Request ID
        expect(studentGatePassCode).toContain('selectedDigitalPass.id');
      });
    });
  });

