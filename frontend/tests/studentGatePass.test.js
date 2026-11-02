import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import { getRoomsForHostelAndFloor } from '../src/services/hostelRoomStore.js';
import { createGatePass, getStudentGatePasses, getAllGatePasses } from '../src/services/gatePassStore.js';

describe('Student Gate Pass Modal & Submission Tests', () => {
  it('1. Verifies getRoomsForHostelAndFloor returns object array with roomNo and label', () => {
    const rooms = getRoomsForHostelAndFloor('Gandhi Boys Residence (Hostel 1)', '1st Floor');
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms[0]).toHaveProperty('roomNo');
    expect(rooms[0]).toHaveProperty('label');
  });

  it('2. Verifies StudentGatePassSection.jsx does not call rm.replace directly on room objects', () => {
    const content = fs.readFileSync('src/components/StudentGatePassSection.jsx', 'utf8');
    // Ensure rm.replace is not called directly on room objects
    expect(content).not.toMatch(/rm\.replace/);
    expect(content).not.toMatch(/rms\[0\]\.replace/);
    expect(content).toContain('rms[0]?.roomNo');
  });

  it('3. Verifies student gate pass creation and retrieval', () => {
    const newPass = createGatePass({
      studentId: 'std-test-1',
      studentName: 'Aman Kumar Sharma',
      rollNumber: '2305201001',
      hostelName: 'Gandhi Boys Residence (Hostel 1)',
      roomNumber: 'Room 101',
      bedNo: 'Bed 01',
      purposeType: 'Home Visit',
      destination: 'Bhubaneswar',
      outDateTime: '2026-11-02T10:00',
      inDateTime: '2026-11-04T18:00',
      emergencyContact: '+91 94370 11999',
    });

    expect(newPass).toBeDefined();
    expect(newPass.id).toMatch(/^GP-/);
    expect(newPass.status).toBe('Pending Warden Approval');

    const passes = getStudentGatePasses('std-test-1');
    expect(passes.some(p => p.id === newPass.id)).toBe(true);
  });
});

