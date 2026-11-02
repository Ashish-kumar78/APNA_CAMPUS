import assert from 'node:assert';
import {
  getAllHostelComplexes,
  saveHostelComplex,
  generateHostelRoomsWithResidents,
  saveResidentAllocation,
  getStoredResidentOverrides,
  getStoredVacatedBeds
} from '../src/services/hostelComplexStore.js';
import {
  getRoomsForHostel,
  addRoomToHostel,
  addFloorToHostel,
  addBedToRoom
} from '../src/services/hostelRoomStore.js';

// Setup Mock Window & LocalStorage
const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
const eventLog = [];
global.window = {
  localStorage: global.localStorage,
  dispatchEvent: (evt) => {
    eventLog.push(evt.type || evt);
    return true;
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.CustomEvent = class {
  constructor(type, eventInitDict) {
    this.type = type;
    this.detail = eventInitDict?.detail;
  }
};
global.Event = class {
  constructor(type) {
    this.type = type;
  }
};

console.log('--- 1. Testing Initial Hostel Complexes and Structure ---');
const complexes = getAllHostelComplexes();
assert.ok(complexes.length >= 3, 'Should have initial complexes');
const targetHostel = complexes[0]; // Gandhi Boys Residence (Hostel 1)
const initialFloors = targetHostel.totalFloors || 3;
console.log(`✓ Initial hostel: ${targetHostel.name} has ${initialFloors} floors`);

console.log('--- 2. Action 1: Adding a Floor (+ Add Floor) ---');
const newFloorName = `Floor ${initialFloors + 1}`;
addFloorToHostel(targetHostel.name, {
  floorName: newFloorName,
  roomCount: 5,
  roomType: '3-Bed Triple Non-AC Standard',
  bedsPerRoom: 3
});
saveHostelComplex({
  ...targetHostel,
  totalFloors: initialFloors + 1,
  totalRooms: (targetHostel.totalRooms || 60) + 5,
  totalBeds: (targetHostel.totalBeds || 180) + 15
});

const updatedComplexes = getAllHostelComplexes();
const reloaded = updatedComplexes.find(h => h.name === targetHostel.name);
assert.strictEqual(reloaded.totalFloors, initialFloors + 1, 'Floors count should increment by 1');
console.log(`✓ + Add Floor succeeded: ${reloaded.name} now has ${reloaded.totalFloors} floors`);

console.log('--- 3. Action 2: Adding a Room (+ Add Room) ---');
const newRoomNo = '401';
addRoomToHostel(targetHostel.name, {
  roomNo: newRoomNo,
  floor: newFloorName,
  type: '3-Bed Triple Non-AC Standard',
  capacity: 3
});

const hostelRooms = getRoomsForHostel(targetHostel.name);
const addedRoom = hostelRooms.find(r => r.roomNo === newRoomNo);
assert.ok(addedRoom, 'Newly added room 401 should exist');
assert.strictEqual(addedRoom.capacity, 3, 'Room 401 should have capacity 3');
assert.strictEqual(addedRoom.beds.length, 3, 'Room 401 should have 3 beds');
console.log(`✓ + Add Room succeeded: Room ${newRoomNo} created on ${newFloorName} with 3 beds`);

console.log('--- 4. Action 3: Adding an Extra Bed (+ Add Bed) ---');
addBedToRoom(targetHostel.name, newRoomNo, 'Bed 04 (Extra Bed)');
const roomsAfterBed = getRoomsForHostel(targetHostel.name);
const roomWithExtraBed = roomsAfterBed.find(r => r.roomNo === newRoomNo);
assert.strictEqual(roomWithExtraBed.capacity, 4, 'Room 401 capacity should now be 4');
assert.strictEqual(roomWithExtraBed.beds.length, 4, 'Room 401 should now have 4 beds');
assert.strictEqual(roomWithExtraBed.beds[3].bedNo, 'Bed 04 (Extra Bed)', 'Bed 4 should have custom label');
console.log(`✓ + Add Bed succeeded: Room ${newRoomNo} now has 4 beds (${roomWithExtraBed.beds[3].bedNo})`);

console.log('--- 5. Action 4: Allocating a Resident (+ Allocate New Bed) ---');
const studentToAllocate = {
  name: 'Sourav Mohanty',
  rollNumber: '05',
  registrationNumber: '2305201005',
  department: 'Electrical Engineering',
  phone: '+91 98610 55667',
  fatherPhone: '+91 94370 55445'
};

const allocResult = await saveResidentAllocation({
  hostelId: targetHostel.id,
  hostelName: targetHostel.name,
  roomNumber: newRoomNo,
  bedNumber: 'Bed 01',
  student: studentToAllocate
});

assert.ok(allocResult.targetKey, 'Allocation should generate targetKey');
assert.strictEqual(allocResult.resident.name, 'Sourav Mohanty', 'Allocated resident name should match');
assert.strictEqual(allocResult.resident.rollNumber, '05', 'Allocated roll number should match');
console.log('✓ + Allocate New Bed succeeded: Sourav Mohanty allocated to Room 401 Bed 01');

console.log('--- 6. Verifying Cross-Role Display Sync (Admin & Warden) ---');
// Verify events dispatched for instant sync across both users
assert.ok(eventLog.includes('bput_hostel_complexes_updated'), 'bput_hostel_complexes_updated should be dispatched');
assert.ok(eventLog.includes('bput_hostel_rooms_updated'), 'bput_hostel_rooms_updated should be dispatched');
assert.ok(eventLog.includes('bput_hostel_residents_changed'), 'bput_hostel_residents_changed should be dispatched');

// Generate hostel rooms with residents to ensure UI reflects all changes
const uiRooms = generateHostelRoomsWithResidents(
  reloaded,
  [studentToAllocate],
  getStoredResidentOverrides(),
  getStoredVacatedBeds()
);

const uiRoom401 = uiRooms.find(r => r.roomNumber === newRoomNo);
assert.ok(uiRoom401, 'UI rooms generator should include custom Room 401');
assert.strictEqual(uiRoom401.floor, newFloorName, `Room 401 should be on ${newFloorName}`);
assert.strictEqual(uiRoom401.residents[0].name, 'Sourav Mohanty', 'Room 401 Bed 01 resident should be Sourav Mohanty');
assert.strictEqual(uiRoom401.residents[0].isVacant, false, 'Bed 01 should be marked Occupied');

console.log('✓ Cross-role display sync verified: UI rooms list reflects added Floor, Room, Bed, and Resident!');
console.log('\nAll 4 Action Options & Cross-Role Sync tests PASSED cleanly!');

