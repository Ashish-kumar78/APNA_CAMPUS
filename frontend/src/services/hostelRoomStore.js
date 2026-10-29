// Centralized Persistent Hostel Room, Bed & Floor Store
// Synchronizes room structure and bed allocations between Hostel Admin and Hostel Warden

const ROOMS_STORAGE_KEY = 'apna_campus_hostel_rooms_matrix_v1';

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
    window.dispatchEvent(new CustomEvent('hostel-rooms-updated', { detail: data }));
  } catch (err) {
    console.warn('Error writing hostel rooms store:', err);
  }
}

/**
 * Retrieve all rooms for a specific hostel.
 */
export function getRoomsForHostel(hostelName) {
  const store = getStoredData();
  const rooms = store[hostelName] || DEFAULT_INITIAL_ROOMS[hostelName];
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
  store[hostelName] = initial;
  saveStoredData(store);
  return initial;
}

/**
 * Add a new room to a hostel.
 */
export function addRoomToHostel(hostelName, { roomNo, floor, type, capacity = 4 }) {
  const store = getStoredData();
  const currentRooms = store[hostelName] ? [...store[hostelName]] : [...(DEFAULT_INITIAL_ROOMS[hostelName] || [])];

  const trimmedRoomNo = String(roomNo).trim();
  const existingIdx = currentRooms.findIndex(r => r.roomNo === trimmedRoomNo);
  if (existingIdx >= 0) {
    throw new Error(`Room ${trimmedRoomNo} already exists in ${hostelName}.`);
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
  store[hostelName] = currentRooms;
  saveStoredData(store);
  return currentRooms;
}

/**
 * Add a bed to an existing room in a hostel.
 */
export function addBedToRoom(hostelName, roomNo, customBedNo = null) {
  const store = getStoredData();
  const currentRooms = store[hostelName] ? [...store[hostelName]] : [...(DEFAULT_INITIAL_ROOMS[hostelName] || [])];

  const room = currentRooms.find(r => r.roomNo === String(roomNo).trim());
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

  store[hostelName] = currentRooms;
  saveStoredData(store);
  return currentRooms;
}

/**
 * Add an entire floor with multiple initial rooms and beds to a hostel.
 */
export function addFloorToHostel(hostelName, { floorName, roomCount = 2, startRoomNumber = '301', roomType = '4-Bed Standard AC', bedsPerRoom = 4 }) {
  const store = getStoredData();
  const currentRooms = store[hostelName] ? [...store[hostelName]] : [...(DEFAULT_INITIAL_ROOMS[hostelName] || [])];

  const parsedRoomCount = Math.max(1, parseInt(roomCount, 10) || 2);
  const parsedBeds = Math.max(1, parseInt(bedsPerRoom, 10) || 4);
  const baseNum = parseInt(startRoomNumber, 10) || 301;

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

  store[hostelName] = currentRooms;
  saveStoredData(store);
  return currentRooms;
}

/**
 * Save updated rooms array directly for a hostel.
 */
export function updateRoomsForHostel(hostelName, updatedRooms) {
  const store = getStoredData();
  store[hostelName] = updatedRooms;
  saveStoredData(store);
  return updatedRooms;
}

/**
 * Reactive subscription for room store updates across tabs/components.
 */
export function subscribeHostelRooms(callback) {
  if (typeof window === 'undefined') return () => {};

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
