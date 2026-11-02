import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseFloorNumber,
  getFloorsForHostel,
  getRoomsForHostelAndFloor,
  getRoomsForHostel
} from '../src/services/hostelRoomStore.js';
import { getAllHostels } from '../src/services/hostelAttendanceStore.js';

describe('Hostel and Floor Room Number Dropdown Verification', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      };
    } else {
      localStorage.clear();
    }
  });

  it('1. parseFloorNumber accurately normalizes various floor string representations', () => {
    expect(parseFloorNumber('Ground Floor')).toBe(0);
    expect(parseFloorNumber('Floor 0')).toBe(0);
    expect(parseFloorNumber('1st Floor')).toBe(1);
    expect(parseFloorNumber('Floor 1')).toBe(1);
    expect(parseFloorNumber('2nd Floor')).toBe(2);
    expect(parseFloorNumber('Floor 2')).toBe(2);
    expect(parseFloorNumber('3rd Floor')).toBe(3);
    expect(parseFloorNumber('Floor 3')).toBe(3);
    expect(parseFloorNumber('4th Floor')).toBe(4);
    expect(parseFloorNumber(undefined)).toBe(1);
  });

  it('2. getFloorsForHostel returns standard and configured floors', () => {
    const floors = getFloorsForHostel('Gandhi Boys Residence');
    expect(Array.isArray(floors)).toBe(true);
    expect(floors.length).toBeGreaterThanOrEqual(3);
    expect(floors.some(f => f.includes('1') || f.includes('Floor'))).toBe(true);
  });

  it('3. getRoomsForHostelAndFloor returns 1st floor rooms (101-112) for 1st Floor', () => {
    const rooms = getRoomsForHostelAndFloor('Gandhi Boys Residence', '1st Floor');
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThanOrEqual(12);
    expect(rooms.some(r => r.roomNo === '101')).toBe(true);
    expect(rooms.some(r => r.roomNo === '102')).toBe(true);
    expect(rooms.some(r => r.roomNo === '104')).toBe(true);
    expect(rooms.every(r => r.label.startsWith('Room '))).toBe(true);
  });

  it('4. getRoomsForHostelAndFloor returns 2nd floor rooms (201-212) including Room 204 for 2nd Floor', () => {
    const rooms = getRoomsForHostelAndFloor('Sarojini Girls Residence (Block A)', '2nd Floor');
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThanOrEqual(12);
    expect(rooms.some(r => r.roomNo === '201')).toBe(true);
    expect(rooms.some(r => r.roomNo === '204')).toBe(true);
    expect(rooms.find(r => r.roomNo === '204').label).toContain('Room 204');
  });

  it('5. getRoomsForHostelAndFloor returns 3rd floor rooms (301-312) for 3rd Floor', () => {
    const rooms = getRoomsForHostelAndFloor('Kalam Boys Residence', '3rd Floor');
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThanOrEqual(12);
    expect(rooms.some(r => r.roomNo === '301')).toBe(true);
    expect(rooms.some(r => r.roomNo === '305')).toBe(true);
  });

  it('6. getRoomsForHostelAndFloor returns Ground Floor rooms (001-012) for Ground Floor', () => {
    const rooms = getRoomsForHostelAndFloor('Sarojini Girls Residence', 'Ground Floor');
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThanOrEqual(8);
    expect(rooms.some(r => r.roomNo === '001' || r.roomNo === '1')).toBe(true);
  });

  it('7. Integrates with getAllHostels to ensure all existing and newly registered hostels have floor rooms', () => {
    const allHostels = getAllHostels();
    expect(allHostels.length).toBeGreaterThanOrEqual(3);
    allHostels.forEach(h => {
      const floor1Rooms = getRoomsForHostelAndFloor(h.name, '1st Floor');
      const floor2Rooms = getRoomsForHostelAndFloor(h.name, '2nd Floor');
      expect(floor1Rooms.length).toBeGreaterThan(0);
      expect(floor2Rooms.length).toBeGreaterThan(0);
    });
  });
});
