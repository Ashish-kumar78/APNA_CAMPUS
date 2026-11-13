// Centralized Persistent Hostel Room, Bed & Floor Store
// Synchronizes room structure and bed allocations between Hostel Admin and Hostel Warden
import api from './api.js';

const ROOMS_STORAGE_KEY = 'apna_campus_hostel_rooms_matrix_v1';
const DELETED_ROOMS_KEY = 'apna_campus_hostel_deleted_rooms_v1';
const DELETED_FLOORS_KEY = 'apna_campus_hostel_deleted_floors_v1';

export function normalizeHostelKey(name) {
  if (!name) return '';
  return String(name)
    .replace(/\s*\(hostel\s*\d+\)/i, '')
    .replace(/\s*\([a-z0-9\-]+\)/gi, '')
    .trim()
    .toLowerCase();
}

function resolveHostelKey(store, hostelName) {
  if (!hostelName) return 'Gandhi Boys Residence';
  if (store && store[hostelName]) return hostelName;
  const target = normalizeHostelKey(hostelName);
  if (store) {
    for (const k of Object.keys(store)) {
      const normK = normalizeHostelKey(k);
      if (normK === target || (normK && target && (normK.includes(target) || target.includes(normK)))) {
        return k;
      }
    }
  }
  for (const k of Object.keys(DEFAULT_INITIAL_ROOMS)) {
    const normK = normalizeHostelKey(k);
    if (normK === target || (normK && target && (normK.includes(target) || target.includes(normK)))) {
      return k;
    }
  }
  return hostelName;
}

function getDeletedRoomsStore() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(DELETED_ROOMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDeletedRoomsStore(data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(DELETED_ROOMS_KEY, JSON.stringify(data));
  } catch {}
}

function getDeletedFloorsStore() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(DELETED_FLOORS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDeletedFloorsStore(data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(DELETED_FLOORS_KEY, JSON.stringify(data));
  } catch {}
}

export function getDeletedRooms(hostelName) {
  const store = getDeletedRoomsStore();
  return store[hostelName] || [];
}

export function getDeletedFloors(hostelName) {
  const store = getDeletedFloorsStore();
  return store[hostelName] || [];
}

export const DEFAULT_INITIAL_ROOMS = {
  'Bhabani Hostel-1': [
    {
      roomNo: '101',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Rakesh Das (2305201001)', roll: '01', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Amit Pattnaik (2305201003)', roll: '03', branch: 'ECE', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '102',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Sourav Mohanty (2305201005)', roll: '05', branch: 'EE', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Debabrata Jena (2305201006)', roll: '06', branch: 'ME', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '103',
      floor: 'Floor 1',
      type: '4-Bed Non-AC Deluxe',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Bikash Rout (2305201008)', roll: '08', branch: 'Civil', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Manoj Tripathy (2305201009)', roll: '09', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '201',
      floor: 'Floor 2',
      type: '4-Bed Deluxe AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Kishore Sethi (2305201011)', roll: '11', branch: 'ME', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Deepak Kumar Barik (2305201012)', roll: '12', branch: 'IT', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '202',
      floor: 'Floor 2',
      type: '4-Bed Deluxe AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 02', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    }
  ],
  'Gandhi Boys Residence': [
    {
      roomNo: '101',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Rakesh Das (2305201001)', roll: '01', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Amit Nayak (2305201002)', roll: '02', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: 'Raj Sahoo (2305201003)', roll: '03', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 04', resident: 'Sourav Mohanty (2305201005)', roll: '05', branch: 'CSE', status: 'Occupied' }
      ]
    },
    {
      roomNo: '102',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Debabrata Jena (2305201006)', roll: '06', branch: 'ME', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Bikash Rout (2305201008)', roll: '08', branch: 'Civil', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    },
    {
      roomNo: '201',
      floor: 'Floor 2',
      type: '4-Bed Deluxe AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: 'Manoj Tripathy (2305201009)', roll: '09', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Kishore Sethi (2305201011)', roll: '11', branch: 'ME', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    }
  ],
  'Sarojini Girls Residence': [
    {
      roomNo: '101',
      floor: 'Floor 1',
      type: '3-Bed Non-AC Triple',
      capacity: 3,
      beds: [
        { bedNo: 'Bed 01', resident: 'Priyanka Das (2305201021)', roll: '21', branch: 'CSE', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Sneha Mohanty (2305201022)', roll: '22', branch: 'EE', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: 'Pooja Patra (2305201023)', roll: '23', branch: 'ECE', status: 'Occupied' }
      ]
    },
    {
      roomNo: '102',
      floor: 'Floor 1',
      type: '3-Bed Non-AC Triple',
      capacity: 3,
      beds: [
        { bedNo: 'Bed 01', resident: 'Ananya Sahu (2305201024)', roll: '24', branch: 'IT', status: 'Occupied' },
        { bedNo: 'Bed 02', resident: 'Madhusmita Nayak (2305201025)', roll: '25', branch: 'Civil', status: 'Occupied' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    }
  ]
};

function getStoredData() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_INITIAL_ROOMS;
  }
  try {
    const raw = window.localStorage.getItem(ROOMS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_ROOMS));
      return DEFAULT_INITIAL_ROOMS;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : DEFAULT_INITIAL_ROOMS;
  } catch (err) {
    console.warn('Error reading hostel rooms store:', err);
    return DEFAULT_INITIAL_ROOMS;
  }
}

function saveStoredData(data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hostel-rooms-updated', { detail: data }));
      window.dispatchEvent(new CustomEvent('bput_hostel_rooms_changed', { detail: data }));
      window.dispatchEvent(new CustomEvent('bput_hostel_rooms_updated', { detail: data }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.warn('Error writing hostel rooms store:', err);
  }
}

/**
 * Retrieve all rooms for a specific hostel.
 */
export function getRoomsForHostel(hostelName) {
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  const rooms = store[key] || DEFAULT_INITIAL_ROOMS[key] || store[hostelName] || DEFAULT_INITIAL_ROOMS[hostelName];
  if (rooms) return [...rooms];

  // If a new hostel has no custom rooms yet, create initial default rooms
  const initial = [
    {
      roomNo: '101',
      floor: 'Floor 1',
      type: '4-Bed Standard AC',
      capacity: 4,
      beds: [
        { bedNo: 'Bed 01', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 02', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 03', resident: null, roll: null, branch: null, status: 'Vacant' },
        { bedNo: 'Bed 04', resident: null, roll: null, branch: null, status: 'Vacant' }
      ]
    }
  ];
  store[key] = initial;
  if (key !== hostelName) store[hostelName] = initial;
  saveStoredData(store);
  return initial;
}

/**
 * Add a new room to a hostel.
 */
export function addRoomToHostel(hostelName, { roomNo, floor, type, capacity = 4 }) {
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  const currentRooms = store[key] ? [...store[key]] : [...(DEFAULT_INITIAL_ROOMS[key] || [])];

  const trimmedRoomNo = String(roomNo).trim();
  const existingIdx = currentRooms.findIndex(r => r.roomNo === trimmedRoomNo);
  if (existingIdx >= 0) {
    throw new Error(`Room ${trimmedRoomNo} already exists in ${hostelName}.`);
  }

  // Remove room from deleted rooms if previously deleted
  const delRoomsStore = getDeletedRoomsStore();
  if (delRoomsStore[key]) {
    delRoomsStore[key] = delRoomsStore[key].filter(r => r !== trimmedRoomNo);
    saveDeletedRoomsStore(delRoomsStore);
  }
  if (delRoomsStore[hostelName]) {
    delRoomsStore[hostelName] = delRoomsStore[hostelName].filter(r => r !== trimmedRoomNo);
    saveDeletedRoomsStore(delRoomsStore);
  }

  const numBeds = Math.max(1, parseInt(capacity, 10) || 4);
  const beds = [];
  for (let i = 1; i <= numBeds; i++) {
    beds.push({
      bedNo: `Bed 0${i}`,
      resident: null,
      roll: null,
      branch: null,
      status: 'Vacant'
    });
  }

  const newRoom = {
    roomNo: trimmedRoomNo,
    floor: floor || 'Floor 1',
    type: type || '4-Bed Standard AC',
    capacity: numBeds,
    beds
  };

  currentRooms.push(newRoom);
  store[key] = currentRooms;
  if (key !== hostelName) store[hostelName] = currentRooms;
  saveStoredData(store);

  // Sync with backend API
  if (api && typeof api.createHostelRoom === 'function') {
    api.createHostelRoom({
      hostelName: key || hostelName,
      roomNumber: trimmedRoomNo,
      floor: floor || 'Floor 1',
      type: type || '4-Bed Standard AC',
      capacity: numBeds,
    }).catch(err => console.warn('Backend sync createHostelRoom warning:', err?.message));
  }

  return currentRooms;
}

/**
 * Permanently delete a room from a hostel.
 */
export function deleteRoomFromHostel(hostelName, roomNo, floor) {
  const trimmedRoomNo = String(roomNo).trim();
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  const currentRooms = store[key] ? [...store[key]] : [...(DEFAULT_INITIAL_ROOMS[key] || [])];

  const updatedRooms = currentRooms.filter(r => String(r.roomNo).trim() !== trimmedRoomNo);
  store[key] = updatedRooms;
  if (key !== hostelName) store[hostelName] = updatedRooms;
  saveStoredData(store);

  const delRoomsStore = getDeletedRoomsStore();
  const deletedList = new Set(delRoomsStore[key] || []);
  deletedList.add(trimmedRoomNo);
  delRoomsStore[key] = Array.from(deletedList);
  delRoomsStore[hostelName] = Array.from(deletedList);
  saveDeletedRoomsStore(delRoomsStore);

  // Sync with backend API
  if (api && typeof api.deleteHostelRoom === 'function') {
    api.deleteHostelRoom({
      hostelName: key || hostelName,
      roomNumber: trimmedRoomNo,
      floor,
    }).catch(err => console.warn('Backend sync deleteHostelRoom warning:', err?.message));
  }

  return updatedRooms;
}

/**
 * Permanently delete an entire floor from a hostel.
 */
export function deleteFloorFromHostel(hostelName, floorName) {
  const floorNum = parseFloorNumber(floorName);
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  const currentRooms = store[key] ? [...store[key]] : [...(DEFAULT_INITIAL_ROOMS[key] || [])];

  const updatedRooms = currentRooms.filter(r => parseFloorNumber(r.floor) !== floorNum);
  store[key] = updatedRooms;
  if (key !== hostelName) store[hostelName] = updatedRooms;
  saveStoredData(store);

  const delFloorsStore = getDeletedFloorsStore();
  const deletedList = new Set(delFloorsStore[key] || []);
  deletedList.add(floorNum);
  deletedList.add(floorName);
  delFloorsStore[key] = Array.from(deletedList);
  delFloorsStore[hostelName] = Array.from(deletedList);
  saveDeletedFloorsStore(delFloorsStore);

  // Sync with backend API
  if (api && typeof api.deleteHostelFloor === 'function') {
    api.deleteHostelFloor({
      hostelName: key || hostelName,
      floor: floorName,
    }).catch(err => console.warn('Backend sync deleteHostelFloor warning:', err?.message));
  }

  return updatedRooms;
}

/**
 * Add a bed to an existing room in a hostel.
 */
export function addBedToRoom(hostelName, roomNo, customBedNo = null) {
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  const currentRooms = store[key] ? [...store[key]] : [...(DEFAULT_INITIAL_ROOMS[key] || [])];

  const room = currentRooms.find(r => String(r.roomNo).trim() === String(roomNo).trim());
  if (!room) {
    throw new Error(`Room ${roomNo} not found in ${hostelName}.`);
  }

  const nextBedIndex = room.beds.length + 1;
  const bedNo = customBedNo || `Bed ${String(nextBedIndex).padStart(2, '0')}`;

  room.beds.push({
    bedNo,
    resident: null,
    roll: null,
    branch: null,
    status: 'Vacant'
  });
  room.capacity = room.beds.length;

  store[key] = currentRooms;
  if (key !== hostelName) store[hostelName] = currentRooms;
  saveStoredData(store);

  // Sync with backend API
  if (api && typeof api.createHostelBed === 'function') {
    api.createHostelBed({
      hostelName: key || hostelName,
      roomNumber: String(roomNo).trim(),
      bedNumber: bedNo,
    }).catch(err => console.warn('Backend sync createHostelBed warning:', err?.message));
  }

  return currentRooms;
}

/**
 * Reduce / remove a bed from an existing room in a hostel.
 */
export function reduceBedFromRoom(hostelName, roomNo, bedNo = null) {
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  const currentRooms = store[key] ? [...store[key]] : [...(DEFAULT_INITIAL_ROOMS[key] || [])];

  const room = currentRooms.find(r => String(r.roomNo).trim() === String(roomNo).trim());
  if (!room) {
    throw new Error(`Room ${roomNo} not found in ${hostelName}.`);
  }

  if (room.beds.length <= 1) {
    throw new Error(`Cannot reduce bed in Room ${roomNo}: room must retain at least 1 bed.`);
  }

  let targetBedIndex = -1;
  if (bedNo) {
    targetBedIndex = room.beds.findIndex(b => b.bedNo === bedNo);
    if (targetBedIndex === -1) {
      throw new Error(`Bed ${bedNo} not found in Room ${roomNo}.`);
    }
    const targetBed = room.beds[targetBedIndex];
    if (targetBed.status === 'Occupied') {
      throw new Error(`Cannot remove ${bedNo}: it is currently occupied by ${targetBed.resident}. Please vacate or transfer the resident first.`);
    }
  } else {
    // Find the last vacant bed
    for (let i = room.beds.length - 1; i >= 0; i--) {
      if (room.beds[i].status !== 'Occupied') {
        targetBedIndex = i;
        break;
      }
    }
    if (targetBedIndex === -1) {
      throw new Error(`Cannot reduce bed capacity in Room ${roomNo}: all ${room.beds.length} beds are currently occupied by students.`);
    }
  }

  const removedBed = room.beds[targetBedIndex];
  room.beds.splice(targetBedIndex, 1);
  room.capacity = room.beds.length;

  store[key] = currentRooms;
  if (key !== hostelName) store[hostelName] = currentRooms;
  saveStoredData(store);

  // Sync with backend API
  if (api && typeof api.deleteHostelBed === 'function') {
    api.deleteHostelBed({
      hostelName: key || hostelName,
      roomNumber: String(roomNo).trim(),
      bedNumber: removedBed?.bedNo,
    }).catch(err => console.warn('Backend sync deleteHostelBed warning:', err?.message));
  }

  return currentRooms;
}

/**
 * Add an entire floor with multiple initial rooms and beds to a hostel.
 */
export function addFloorToHostel(hostelName, { floorName, roomCount = 2, startRoomNumber = '301', roomType = '4-Bed Standard AC', bedsPerRoom = 4 }) {
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  const currentRooms = store[key] ? [...store[key]] : [...(DEFAULT_INITIAL_ROOMS[key] || [])];

  const parsedRoomCount = Math.max(1, parseInt(roomCount, 10) || 2);
  const parsedBeds = Math.max(1, parseInt(bedsPerRoom, 10) || 4);
  const baseNum = parseInt(startRoomNumber, 10) || 301;

  // Un-tombstone floor and room numbers
  const floorNum = parseFloorNumber(floorName);
  const delFloorsStore = getDeletedFloorsStore();
  if (delFloorsStore[key]) {
    delFloorsStore[key] = delFloorsStore[key].filter(f => f !== floorNum && f !== floorName);
    saveDeletedFloorsStore(delFloorsStore);
  }
  if (delFloorsStore[hostelName]) {
    delFloorsStore[hostelName] = delFloorsStore[hostelName].filter(f => f !== floorNum && f !== floorName);
    saveDeletedFloorsStore(delFloorsStore);
  }

  const delRoomsStore = getDeletedRoomsStore();
  for (let r = 0; r < parsedRoomCount; r++) {
    const rmNo = String(baseNum + r);
    if (delRoomsStore[key]) delRoomsStore[key] = delRoomsStore[key].filter(num => num !== rmNo);
    if (delRoomsStore[hostelName]) delRoomsStore[hostelName] = delRoomsStore[hostelName].filter(num => num !== rmNo);
  }
  saveDeletedRoomsStore(delRoomsStore);

  for (let r = 0; r < parsedRoomCount; r++) {
    const rmNo = String(baseNum + r);
    if (!currentRooms.some(existing => existing.roomNo === rmNo)) {
      const beds = [];
      for (let b = 1; b <= parsedBeds; b++) {
        beds.push({
          bedNo: `Bed 0${b}`,
          resident: null,
          roll: null,
          branch: null,
          status: 'Vacant'
        });
      }
      currentRooms.push({
        roomNo: rmNo,
        floor: floorName || 'Floor 3',
        type: roomType,
        capacity: parsedBeds,
        beds
      });
    }
  }

  store[key] = currentRooms;
  if (key !== hostelName) store[hostelName] = currentRooms;
  saveStoredData(store);

  // Sync with backend API
  if (api && typeof api.createHostelFloor === 'function') {
    api.createHostelFloor({
      hostelName: key || hostelName,
      floor: floorName || 'Floor 3',
      roomCount: parsedRoomCount,
      startRoomNumber: String(baseNum),
      roomType,
      capacity: parsedBeds,
    }).catch(err => console.warn('Backend sync createHostelFloor warning:', err?.message));
  }

  return currentRooms;
}

/**
 * Save updated rooms array directly for a hostel.
 */
export function updateRoomsForHostel(hostelName, updatedRooms) {
  const store = getStoredData();
  const key = resolveHostelKey(store, hostelName);
  store[key] = updatedRooms;
  if (key !== hostelName) store[hostelName] = updatedRooms;
  saveStoredData(store);
  return updatedRooms;
}

/**
 * Reactive subscription for room store updates across tabs/components.
 */
export function subscribeHostelRooms(callback) {
  if (typeof window === 'undefined') return () => { };

  const handleCustomEvent = (e) => {
    callback(e.detail);
  };
  const handleStorage = (e) => {
    if (e.key === ROOMS_STORAGE_KEY) {
      callback(getStoredData());
    }
  };

  window.addEventListener('hostel-rooms-updated', handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('hostel-rooms-updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Parse numeric floor index from various floor representations (e.g. "2nd Floor", "Floor 2", "Ground Floor", 2).
 */
export function parseFloorNumber(floorInput) {
  if (floorInput === undefined || floorInput === null) return 1;
  const s = String(floorInput).trim().toLowerCase();
  if (s.includes('ground') || s === '0') return 0;
  const match = s.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

/**
 * Returns available floors for a given hostel (or standard 1st, 2nd, 3rd floors).
 */
export function getFloorsForHostel(hostelName) {
  const deletedFloors = getDeletedFloors(hostelName);
  const rooms = getRoomsForHostel(hostelName);
  const floorSet = new Set(['1st Floor', '2nd Floor', '3rd Floor']);
  if (Array.isArray(rooms) && rooms.length > 0) {
    rooms.forEach(r => {
      if (r.floor) floorSet.add(r.floor);
    });
  }

  return Array.from(floorSet)
    .filter(f => !deletedFloors.includes(parseFloorNumber(f)) && !deletedFloors.includes(f))
    .sort((a, b) => parseFloorNumber(a) - parseFloorNumber(b));
}

/**
 * Returns list of rooms for a hostel and floor as objects: { roomNo: '204', label: 'Room 204', raw: ... }
 * Automatically synchronizes with stored rooms and generates standard floor room numbers (e.g. 101-112, 201-212, 301-312).
 */
export function getRoomsForHostelAndFloor(hostelName, floorInput) {
  const floorNum = parseFloorNumber(floorInput);
  const deletedFloors = getDeletedFloors(hostelName);
  if (deletedFloors.includes(floorNum) || deletedFloors.includes(String(floorInput))) {
    return [];
  }
  const deletedRooms = getDeletedRooms(hostelName);

  const allHostelRooms = getRoomsForHostel(hostelName);

  const matchingStoredRooms = allHostelRooms.filter(r => {
    return parseFloorNumber(r.floor) === floorNum && !deletedRooms.includes(String(r.roomNo).trim());
  });

  const roomMap = new Map();

  // Add stored rooms first
  matchingStoredRooms.forEach(r => {
    const rawNo = String(r.roomNo).replace(/^room\s*/i, '').trim();
    if (!deletedRooms.includes(rawNo)) {
      roomMap.set(rawNo, {
        roomNo: rawNo,
        label: `Room ${rawNo}${r.type ? ` (${r.type})` : ''}`,
        raw: r
      });
    }
  });

  // Ensure standard rooms exist for this floor (e.g. 101 to 112, 201 to 212, etc.)
  const baseNum = floorNum === 0 ? 1 : floorNum * 100 + 1;
  const count = 12;
  for (let i = 0; i < count; i++) {
    const rawNo = floorNum === 0 ? String(baseNum + i).padStart(3, '0') : String(baseNum + i);
    if (!roomMap.has(rawNo) && !deletedRooms.includes(rawNo)) {
      roomMap.set(rawNo, {
        roomNo: rawNo,
        label: `Room ${rawNo}`,
        raw: { roomNo: rawNo, floor: `Floor ${floorNum}`, type: 'Standard' }
      });
    }
  }

  return Array.from(roomMap.values()).sort((a, b) => {
    const numA = parseInt(a.roomNo, 10) || 0;
    const numB = parseInt(b.roomNo, 10) || 0;
    return numA - numB;
  });
}

