import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 4: Frontend Security Portal (SecurityPortal.jsx & CSS)', () => {
  const portalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
  const cssPath = path.resolve(__dirname, '../src/components/SecurityPortal.css');

  it('SecurityPortal component defines all 6 operational sections', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain("activeTab === 'overview'");
    expect(code).toContain("activeTab === 'scanner'");
    expect(code).toContain("activeTab === 'passes'");
    expect(code).toContain("activeTab === 'visitors'");
    expect(code).toContain("activeTab === 'history'");
    expect(code).toContain("activeTab === 'alerts'");
  });

  it('Scanner section provides camera controls and manual roll lookup', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain('videoRef');
    expect(code).toContain('cameraActive');
    expect(code).toContain('Start Camera');
    expect(code).toContain('Stop Camera');
    expect(code).toContain('Manual Roll Number, Pass ID, or QR String:');
    expect(code).toContain('handlePerformScan');
  });

  it('Scanner provides physical EXIT and ENTRY verification buttons', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain('VERIFY & LOG CAMPUS EXIT');
    expect(code).toContain('VERIFY & LOG CAMPUS ENTRY');
    expect(code).toContain('FLAG SECURITY BREACH');
    expect(code).toContain('handleRecordExit');
    expect(code).toContain('handleRecordEntry');
  });

  it('Displays simulated parent SMS notification box on movement logging', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain('Parent SMS / WhatsApp Notification Dispatched:');
    expect(code).toContain('parentNotice.message');
  });

  it('Approved Passes catalog provides filters for status and hostel', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain('passFilterStatus');
    expect(code).toContain('passFilterHostel');
    expect(code).toContain('PENDING_EXIT');
    expect(code).toContain('OUT');
    expect(code).toContain('RETURNED');
    expect(code).toContain('LATE');
  });

  it('Visitor management provides pre-approval verification and walk-in registration', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain('handleVerifyVisitorCode');
    expect(code).toContain('handleWalkInSubmit');
    expect(code).toContain('handleCheckOutVisitor');
    expect(code).toContain('Sign Out / Return Badge');
    expect(code).toContain('Enter 6-Digit Visitor Pass Code:');
  });

  it('History section supports CSV export and filtering', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain('handleExportHistory');
    expect(code).toContain('exportToCsv');
    expect(code).toContain('Export to Excel / CSV');
  });

  it('Security incidents modal allows reporting unauthorized exit attempts', () => {
    const code = fs.readFileSync(portalPath, 'utf8');
    expect(code).toContain('Report Security Incident');
    expect(code).toContain('handleIncidentSubmit');
    expect(code).toContain('Dispatch Alert to Warden & Admin');
  });

  it('CSS includes high-contrast, mobile-first responsive rules', () => {
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('.sec-portal-wrapper');
    expect(css).toContain('.sec-laser-line');
    expect(css).toContain('.sec-btn-emerald');
    expect(css).toContain('.sec-btn-sky');
    expect(css).toContain('@media (max-width: 640px)');
  });
});
