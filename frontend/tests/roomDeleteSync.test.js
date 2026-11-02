import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRoomsForHostelAndFloor,
  getFloorsForHostel,
  deleteRoomFromHostel,
  addRoomToHostel,
  deleteFloorFromHostel,
  addFloorToHostel
} from '../src/services/hostelRoomStore.js';

describe('Hostel Room and Floor Deletion & Synchronization Suite', () => {
  const TEST_HOSTEL = 'Test Deletion Residence';

  beforeEach(() => {
    // Provide clean localStorage mock
    const store = {};
    globalThis.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
    if (typeof window !== 'undefined') {
      window.localStorage = globalThis.localStorage;
    }
  });

  it('initially generates rooms for floor and allows floor discovery', () => {
    const floors = getFloorsForHostel(TEST_HOSTEL);
    expect(floors).toContain('1st Floor');
    expect(floors).toContain('2nd Floor');

    const floor1Rooms = getRoomsForHostelAndFloor(TEST_HOSTEL, '1st Floor');
    expect(floor1Rooms.length).toBeGreaterThan(0);
    const roomNos = floor1Rooms.map(r => r.roomNo);
    expect(roomNos).toContain('101');
  });

  it('deleting a room permanently removes it from getRoomsForHostelAndFloor', () => {
    const initialRooms = getRoomsForHostelAndFloor(TEST_HOSTEL, '1st Floor');
    expect(initialRooms.some(r => r.roomNo === '101')).toBe(true);

    // Delete Room 101
    deleteRoomFromHostel(TEST_HOSTEL, '101', '1st Floor');

    const updatedRooms = getRoomsForHostelAndFloor(TEST_HOSTEL, '1st Floor');
    const roomNos = updatedRooms.map(r => r.roomNo);
    expect(roomNos).not.toContain('101');
  });

  it('adding a previously deleted room restores it in getRoomsForHostelAndFloor', () => {
    deleteRoomFromHostel(TEST_HOSTEL, '102', '1st Floor');
    const before = getRoomsForHostelAndFloor(TEST_HOSTEL, '1st Floor');
    expect(before.some(r => r.roomNo === '102')).toBe(false);

    // Add Room 102 back
    addRoomToHostel(TEST_HOSTEL, {
      roomNo: '102',
      floor: 'Floor 1',
      capacity: 4
    });

    const restoredRooms = getRoomsForHostelAndFloor(TEST_HOSTEL, '1st Floor');
    expect(restoredRooms.some(r => r.roomNo === '102')).toBe(true);
  });

  it('deleting an entire floor removes it from getFloorsForHostel and returns empty rooms array', () => {
    expect(getFloorsForHostel(TEST_HOSTEL)).toContain('2nd Floor');

    deleteFloorFromHostel(TEST_HOSTEL, '2nd Floor');

    const floorsAfter = getFloorsForHostel(TEST_HOSTEL);
    expect(floorsAfter.some(f => f.includes('2'))).toBe(false);

    const roomsOnDeletedFloor = getRoomsForHostelAndFloor(TEST_HOSTEL, '2nd Floor');
    expect(roomsOnDeletedFloor).toEqual([]);
  });

  it('adding a floor restores it to getFloorsForHostel with created rooms', () => {
    deleteFloorFromHostel(TEST_HOSTEL, '3rd Floor');
    expect(getFloorsForHostel(TEST_HOSTEL).some(f => f.includes('3'))).toBe(false);

    addFloorToHostel(TEST_HOSTEL, {
      floorName: 'Floor 3',
      roomCount: 2,
      startRoomNumber: '301',
      roomType: '4-Bed Standard AC',
      bedsPerRoom: 4
    });

    const floors = getFloorsForHostel(TEST_HOSTEL);
    expect(floors.some(f => f.includes('3'))).toBe(true);

    const rooms = getRoomsForHostelAndFloor(TEST_HOSTEL, '3rd Floor');
    const roomNos = rooms.map(r => r.roomNo);
    expect(roomNos).toContain('301');
    expect(roomNos).toContain('302');
  });
});
