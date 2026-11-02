import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllHostelComplexes,
  saveHostelComplex,
  deleteHostelComplex,
  generateHostelRoomsWithResidents
} from '../src/services/hostelComplexStore.js';
import { getAllHostels } from '../src/services/hostelAttendanceStore.js';

describe('Hostel Complex Infrastructure & Dynamic Room Roster (Image Replica)', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    globalThis.localStorage = {
      getItem: (key) => mockStorage[key] || null,
      setItem: (key, val) => {
        mockStorage[key] = String(val);
      },
      removeItem: (key) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      }
    };
    globalThis.window = {
      dispatchEvent: vi.fn()
    };
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, eventInitDict) {
        this.type = type;
        this.detail = eventInitDict?.detail;
      }
    };
    globalThis.Event = class Event {
      constructor(type) {
        this.type = type;
      }
    };
  });

  it('1. Loads initial hostels including Gandhi Boys, Kalam Boys, and Sarojini Girls', () => {
    const hostels = getAllHostelComplexes();
    expect(hostels.length).toBeGreaterThanOrEqual(3);

    const sarojini = hostels.find(h => h.name.includes('Sarojini'));
    expect(sarojini).toBeDefined();
    expect(sarojini.type).toBe('Girls');
    expect(sarojini.totalRooms).toBe(50);
    expect(sarojini.totalFloors).toBe(3);
    expect(sarojini.warden).toBe('Mrs. Nibedita Das');

    const gandhi = hostels.find(h => h.name.includes('Gandhi'));
    expect(gandhi).toBeDefined();
    expect(gandhi.type).toBe('Boys');
    expect(gandhi.totalRooms).toBe(60);

    const kalam = hostels.find(h => h.name.includes('Kalam'));
    expect(kalam).toBeDefined();
    expect(kalam.totalRooms).toBe(60);
  });

  it('2. Dynamically generates Sarojini Girls Residence Room 1 matching screenshot exactly', () => {
    const hostels = getAllHostelComplexes();
    const sarojini = hostels.find(h => h.name.includes('Sarojini'));
    const rooms = generateHostelRoomsWithResidents(sarojini, []);

    expect(rooms.length).toBe(50);
    const room1 = rooms[0];
    expect(room1.roomNumber).toBe('1');
    expect(room1.displayTitle).toBe('Room 1');
    expect(room1.floor).toBe('Floor 1');
    expect(room1.type).toBe('4-Bed Quad Non-AC Standard');
    expect(room1.capacity).toBe(4);
    expect(room1.occupiedCount).toBe(4);

    // Verify 4 resident students matching screenshot
    expect(room1.residents[0].name).toBe('Priya Patra');
    expect(room1.residents[0].rollNumber).toBe('04');
    expect(room1.residents[0].registrationNumber).toBe('2305201004');
    expect(room1.residents[0].department).toBe('Computer Science & Engineering');
    expect(room1.residents[0].phone).toBe('+91 9861000444');
    expect(room1.residents[0].fatherPhone).toBe('+91 9437000300');
    expect(room1.residents[0].biometricStatus).toContain('In Hostel (Biometric Verified · 08:15 PM)');

    expect(room1.residents[1].name).toBe('Sneha Barik');
    expect(room1.residents[1].rollNumber).toBe('06');
    expect(room1.residents[1].registrationNumber).toBe('2305201006');
    expect(room1.residents[1].biometricStatus).toContain('In Hostel (Biometric Verified · 07:50 PM)');

    expect(room1.residents[2].name).toBe('Puja Behera');
    expect(room1.residents[2].rollNumber).toBe('08');
    expect(room1.residents[2].biometricStatus).toContain('Campus Central Library (Study Pass)');

    expect(room1.residents[3].name).toBe('Swati Kamal');
    expect(room1.residents[3].rollNumber).toBe('10');
    expect(room1.residents[3].biometricStatus).toContain('In Hostel (Biometric Verified · 08:35 PM)');
  });

  it('3. Dynamically generates custom floors and rooms for newly created hostel complex', () => {
    const created = saveHostelComplex({
      name: 'Aryabhata Boys Residence',
      type: 'Boys',
      totalFloors: 4,
      totalRooms: 40,
      totalBeds: 160,
      occupiedBeds: 80,
      warden: 'Dr. A. K. Nayak',
      contact: '+91 94370 77889'
    });

    expect(created.name).toBe('Aryabhata Boys Residence');
    expect(created.totalFloors).toBe(4);
    expect(created.totalRooms).toBe(40);

    const generatedRooms = generateHostelRoomsWithResidents(created, []);
    expect(generatedRooms.length).toBe(40);

    // Verify rooms are divided across 4 floors
    const floor1Rooms = generatedRooms.filter(r => r.floor === 'Floor 1');
    const floor2Rooms = generatedRooms.filter(r => r.floor === 'Floor 2');
    const floor3Rooms = generatedRooms.filter(r => r.floor === 'Floor 3');
    const floor4Rooms = generatedRooms.filter(r => r.floor === 'Floor 4');

    expect(floor1Rooms.length).toBe(10);
    expect(floor2Rooms.length).toBe(10);
    expect(floor3Rooms.length).toBe(10);
    expect(floor4Rooms.length).toBe(10);
  });

  it('4. Automatically synchronizes newly created hostel to attendance store dropdowns', () => {
    saveHostelComplex({
      name: 'CV Raman Tech Residence',
      type: 'Boys',
      totalFloors: 3,
      totalRooms: 30,
      totalBeds: 90,
      warden: 'Prof. Subhashree Sen',
      contact: '+91 94370 88990'
    });

    const allHostelsForAttendance = getAllHostels();
    const cvRaman = allHostelsForAttendance.find(h => h.name.includes('CV Raman'));
    expect(cvRaman).toBeDefined();
    expect(cvRaman.totalBeds).toBe(90);
  });

  it('5. Allows deleting a hostel complex and updates state', () => {
    const listBefore = getAllHostelComplexes();
    const created = saveHostelComplex({
      name: 'Temporary Block X',
      type: 'Boys',
      totalFloors: 1,
      totalRooms: 10,
      totalBeds: 30
    });

    const listWithNew = getAllHostelComplexes();
    expect(listWithNew.length).toBe(listBefore.length + 1);

    const listAfterDelete = deleteHostelComplex(created.id);
    expect(listAfterDelete.find(h => h.id === created.id)).toBeUndefined();
  });

  it('6. Verifies Recent Warden Attendance Submissions History table is deleted from Warden role and only visible to Admin', async () => {
    const fsMod = await import('fs');
    const viewCode = fsMod.readFileSync('src/components/hostel/ViewHostelAttendance.jsx', 'utf8');

    // Confirm the table is guarded by isHostelAdmin
    expect(viewCode).toContain('{isHostelAdmin && (');
    expect(viewCode).toContain('Recent Warden Attendance Submissions History');

    // Verify HostelPortal passes isHostelAdmin to ViewHostelAttendance
    const portalCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');
    expect(portalCode).toContain('<ViewHostelAttendance account={account} isHostelAdmin={isHostelAdmin}');
  });

  it('7. Verifies TakeHostelAttendance has useMemo imported and real-time sync between Admin and Warden roles', async () => {
    const fsMod = await import('fs');
    const takeCode = fsMod.readFileSync('src/components/hostel/TakeHostelAttendance.jsx', 'utf8');

    // Confirm useMemo is imported
    expect(takeCode).toMatch(/import\s+React,\s*\{[^}]*useMemo[^}]*\}\s+from\s+['"]react['"]/);

    // Confirm real-time synchronization listeners for attendance update
    expect(takeCode).toContain('bput_hostel_attendance_submitted');
    expect(takeCode).toContain('bput_hostel_attendance_updated');

    // Confirm HostelPortal passes isHostelAdmin to TakeHostelAttendance
    const portalCode = fsMod.readFileSync('src/components/HostelPortal.jsx', 'utf8');
    expect(portalCode).toContain('<TakeHostelAttendance account={account} isHostelAdmin={isHostelAdmin}');
  });
});
