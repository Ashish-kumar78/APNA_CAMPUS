import api from './api.js';
import { getRoomsForHostel } from './hostelRoomStore.js';

const HOSTEL_COMPLEXES_STORAGE_KEY = 'bput_hostel_complexes_v2';

export const DEFAULT_HOSTEL_COMPLEXES = [
  {
    id: 'hostel-b1',
    name: 'Gandhi Boys Residence (Hostel 1)',
    type: 'Boys',
    totalFloors: 3,
    totalRooms: 60,
    totalBeds: 180,
    occupiedBeds: 168,
    availableBeds: 12,
    warden: 'Mr. Rajesh Jena',
    contact: '+91 94370 11223',
    amenities: ['500 Mbps Wi-Fi', '24x7 Power Backup', 'Biometric Turnstiles', 'Pure RO Water & Mess']
  },
  {
    id: 'hostel-b2',
    name: 'Kalam Boys Residence (Hostel 2)',
    type: 'Boys',
    totalFloors: 3,
    totalRooms: 60,
    totalBeds: 180,
    occupiedBeds: 172,
    availableBeds: 8,
    warden: 'Mr. Manoj Sahoo',
    contact: '+91 94370 22334',
    amenities: ['500 Mbps Wi-Fi', '24x7 Power Backup', 'Biometric Turnstiles', 'Pure RO Water & Mess']
  },
  {
    id: 'hostel-g1',
    name: 'Sarojini Girls Residence (Hostel 1)',
    type: 'Girls',
    totalFloors: 3,
    totalRooms: 50,
    totalBeds: 150,
    occupiedBeds: 142,
    availableBeds: 8,
    warden: 'Mrs. Nibedita Das',
    contact: '+91 94370 33445',
    amenities: ['500 Mbps Wi-Fi', '24x7 Power Backup', 'Biometric Turnstiles', 'Pure RO Water & Mess']
  }
];

export function getAllHostelComplexes() {
  if (typeof window === 'undefined') return DEFAULT_HOSTEL_COMPLEXES;
  try {
    const raw = localStorage.getItem(HOSTEL_COMPLEXES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HOSTEL_COMPLEXES_STORAGE_KEY, JSON.stringify(DEFAULT_HOSTEL_COMPLEXES));
      return DEFAULT_HOSTEL_COMPLEXES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Error reading hostel complexes from storage:', err);
  }
  return DEFAULT_HOSTEL_COMPLEXES;
}

export async function syncHostelsWithBackend() {
  try {
    const res = await api.getHostelComplexes().catch(() => api.getHostels());
    const backendList = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(backendList) && backendList.length > 0) {
      const current = getAllHostelComplexes();
      const map = new Map();
      current.forEach(h => map.set(h.id || h.name, h));
      backendList.forEach(bh => {
        const key = bh.id || bh.name;
        if (!map.has(key)) {
          map.set(key, {
            id: bh.id || `hostel-${Date.now().toString().slice(-4)}`,
            name: bh.name,
            type: bh.type || 'Boys',
            totalFloors: Number(bh.totalFloors) || 3,
            totalRooms: Number(bh.totalRooms) || 50,
            totalBeds: Number(bh.totalBeds) || 150,
            occupiedBeds: Number(bh.occupiedBeds) || 0,
            availableBeds: Number(bh.availableBeds) || (Number(bh.totalBeds || 150) - Number(bh.occupiedBeds || 0)),
            warden: bh.warden || 'Resident Warden',
            contact: bh.contact || '+91 94370 00000',
            amenities: ['500 Mbps Wi-Fi', '24x7 Power Backup', 'Biometric Turnstiles', 'Pure RO Water & Mess']
          });
        }
      });
      const merged = Array.from(map.values());
      if (typeof window !== 'undefined') {
        localStorage.setItem(HOSTEL_COMPLEXES_STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem('bput_manage_hostels_v2', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('bput_hostel_complexes_updated', { detail: merged }));
        window.dispatchEvent(new CustomEvent('bput_hostels_updated', { detail: merged }));
        window.dispatchEvent(new Event('storage'));
      }
      return merged;
    }
  } catch (err) {
    console.warn('Backend hostel complexes sync fallback:', err);
  }
  return getAllHostelComplexes();
}

export function saveHostelComplex(complexData) {
  const current = getAllHostelComplexes();
  const totalFloors = Math.max(1, Number(complexData.totalFloors) || 3);
  const totalRooms = Math.max(1, Number(complexData.totalRooms) || 50);
  const totalBeds = Math.max(totalRooms, Number(complexData.totalBeds) || (totalRooms * 3));
  const occupiedBeds = Math.max(0, Number(complexData.occupiedBeds) || 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  const newComplex = {
    id: complexData.id || `hostel-${Date.now().toString().slice(-5)}`,
    name: complexData.name?.trim() || 'New Residential Block',
    type: complexData.type || 'Boys',
    totalFloors,
    totalRooms,
    totalBeds,
    occupiedBeds,
    availableBeds,
    warden: complexData.warden?.trim() || 'Resident Warden',
    contact: complexData.contact?.trim() || '+91 94370 00000',
    amenities: complexData.amenities || ['500 Mbps Wi-Fi', '24x7 Power Backup', 'Biometric Turnstiles', 'Pure RO Water & Mess']
  };

  const existingIdx = current.findIndex(
    h => (h.id && h.id === newComplex.id) || h.name.toLowerCase() === newComplex.name.toLowerCase()
  );

  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...newComplex };
  } else {
    updatedList = [...current, newComplex];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(HOSTEL_COMPLEXES_STORAGE_KEY, JSON.stringify(updatedList));

    // Also synchronize into bput_hostels_v1 so all attendance & warden dropdowns reflect it immediately
    try {
      const rawHostels = localStorage.getItem('bput_hostels_v1');
      let currentHostels = rawHostels ? JSON.parse(rawHostels) : [];
      if (!Array.isArray(currentHostels)) currentHostels = [];
      const code = (newComplex.name.match(/\b([A-Z])/g) || ['H']).join('').slice(0, 4);
      const attendanceItem = {
        id: newComplex.id,
        name: newComplex.name,
        code,
        totalBeds: newComplex.totalBeds,
        warden: newComplex.warden,
        contact: newComplex.contact,
        type: newComplex.type,
        floors: newComplex.totalFloors,
        status: 'Active',
        bedRooms: { 4: `${Math.round(newComplex.totalRooms * 0.7)} Rooms`, 3: `${Math.round(newComplex.totalRooms * 0.3)} Rooms` }
      };
      const hIdx = currentHostels.findIndex(x => x.name?.toLowerCase() === newComplex.name.toLowerCase());
      if (hIdx >= 0) {
        currentHostels[hIdx] = { ...currentHostels[hIdx], ...attendanceItem };
      } else {
        currentHostels.push(attendanceItem);
      }
      localStorage.setItem('bput_hostels_v1', JSON.stringify(currentHostels));
      window.dispatchEvent(new CustomEvent('bput_hostels_updated', { detail: currentHostels }));
    } catch (e) {
      console.warn('Sync bput_hostels_v1 fallback:', e);
    }

    window.dispatchEvent(new CustomEvent('bput_hostel_complexes_updated', { detail: updatedList }));
    window.dispatchEvent(new Event('storage'));
  }

  // Persist to backend API asynchronously (both complexes and create routes)
  api.createHostelComplex(newComplex).catch(err => {
    console.warn('Backend createHostelComplex sync warning:', err?.message || err);
  });
  api.createHostel(newComplex).catch(() => {});

  return newComplex;
}

export function deleteHostelComplex(hostelId) {
  const current = getAllHostelComplexes();
  const updatedList = current.filter(h => h.id !== hostelId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(HOSTEL_COMPLEXES_STORAGE_KEY, JSON.stringify(updatedList));

    try {
      const rawHostels = localStorage.getItem('bput_hostels_v1');
      if (rawHostels) {
        const currentHostels = JSON.parse(rawHostels);
        if (Array.isArray(currentHostels)) {
          const filtered = currentHostels.filter(h => h.id !== hostelId);
          localStorage.setItem('bput_hostels_v1', JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent('bput_hostels_updated', { detail: filtered }));
        }
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('bput_hostel_complexes_updated', { detail: updatedList }));
    window.dispatchEvent(new Event('storage'));
  }
  return updatedList;
}

const BED_POSITIONS = [
  'Bed 01 (Window Side)',
  'Bed 02 (Study Side)',
  'Bed 03 (Inner Side)',
  'Bed 04 (Door Side)'
];

const BIOMETRIC_STATUSES = [
  'In Hostel (Biometric Verified · 08:15 PM)',
  'In Hostel (Biometric Verified · 07:50 PM)',
  'Campus Central Library (Study Pass)',
  'In Hostel (Biometric Verified · 08:35 PM)'
];

const SAMPLE_GIRLS_ROOM1 = [
  {
    bedIndex: 1,
    bedNo: 'Bed 01 (Window Side)',
    studentId: 'GIFT-2023-1004',
    name: 'Priya Patra',
    rollNumber: '04',
    registrationNumber: '2305201004',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    phone: '+91 9861000444',
    fatherName: 'Prafulla Patra',
    fatherPhone: '+91 9437000300',
    biometricStatus: 'In Hostel (Biometric Verified · 08:15 PM)',
    gender: 'Female',
    bloodGroup: 'B+',
    cgpa: '8.7',
    attendance: 94,
    permAddress: 'Plot 412, Saheed Nagar, Bhubaneswar'
  },
  {
    bedIndex: 2,
    bedNo: 'Bed 02 (Study Side)',
    studentId: 'GIFT-2023-1006',
    name: 'Sneha Barik',
    rollNumber: '06',
    registrationNumber: '2305201006',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    phone: '+91 9861000466',
    fatherName: 'Rabindra Barik',
    fatherPhone: '+91 9437000500',
    biometricStatus: 'In Hostel (Biometric Verified · 07:50 PM)',
    gender: 'Female',
    bloodGroup: 'O+',
    cgpa: '8.4',
    attendance: 91,
    permAddress: 'Quarter C-12, Sector 4, Rourkela'
  },
  {
    bedIndex: 3,
    bedNo: 'Bed 03 (Inner Side)',
    studentId: 'GIFT-2023-1008',
    name: 'Puja Behera',
    rollNumber: '08',
    registrationNumber: '2305201008',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    phone: '+91 9861000488',
    fatherName: 'Birendra Behera',
    fatherPhone: '+91 9437000700',
    biometricStatus: 'Campus Central Library (Study Pass)',
    gender: 'Female',
    bloodGroup: 'A+',
    cgpa: '8.9',
    attendance: 96,
    permAddress: 'Main Road, Ranihat, Cuttack'
  },
  {
    bedIndex: 4,
    bedNo: 'Bed 04 (Door Side)',
    studentId: 'GIFT-2023-1010',
    name: 'Swati Kamal',
    rollNumber: '10',
    registrationNumber: '2305201010',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    phone: '+91 9861000110',
    fatherName: 'Kamal Lochan Jena',
    fatherPhone: '+91 9437000110',
    biometricStatus: 'In Hostel (Biometric Verified · 08:35 PM)',
    gender: 'Female',
    bloodGroup: 'AB+',
    cgpa: '8.2',
    attendance: 89,
    permAddress: 'Hill View Enclave, Berhampur'
  }
];

const SAMPLE_BOYS_ROOM1 = [
  {
    bedIndex: 1,
    bedNo: 'Bed 01 (Window Side)',
    studentId: 'GIFT-2023-1001',
    name: 'Rakesh Das',
    rollNumber: '01',
    registrationNumber: '2305201001',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    phone: '+91 9861000101',
    fatherName: 'Sudhakar Das',
    fatherPhone: '+91 9437000100',
    biometricStatus: 'In Hostel (Biometric Verified · 08:15 PM)',
    gender: 'Male',
    bloodGroup: 'O+',
    cgpa: '8.5',
    attendance: 92,
    permAddress: 'Plot 105, Nayapalli, Bhubaneswar'
  },
  {
    bedIndex: 2,
    bedNo: 'Bed 02 (Study Side)',
    studentId: 'GIFT-2023-1002',
    name: 'Bishnu Prasad Sahoo',
    rollNumber: '02',
    registrationNumber: '2401432265',
    department: 'Computer Science & Engineering (AI)',
    semester: 'Semester 3',
    section: 'CSE (AI) - Genius',
    phone: '7749844291',
    fatherName: 'Pradeep Sahoo',
    fatherPhone: '+91 9437000200',
    biometricStatus: 'In Hostel (Biometric Verified · 07:50 PM)',
    gender: 'Male',
    bloodGroup: 'O+',
    cgpa: '8.42',
    attendance: 92,
    permAddress: 'Ghasiput, Cuttack, Odisha'
  },
  {
    bedIndex: 3,
    bedNo: 'Bed 03 (Inner Side)',
    studentId: 'GIFT-2023-1003',
    name: 'Rajesh Sethi',
    rollNumber: '03',
    registrationNumber: '2305201003',
    department: 'Mechanical Engineering',
    semester: 'Semester 5',
    section: 'Section B',
    phone: '+91 9861000103',
    fatherName: 'Maheswar Sethi',
    fatherPhone: '+91 9437000300',
    biometricStatus: 'Campus Central Library (Study Pass)',
    gender: 'Male',
    bloodGroup: 'A+',
    cgpa: '8.1',
    attendance: 88,
    permAddress: 'Chhatra Bazar, Cuttack'
  },
  {
    bedIndex: 4,
    bedNo: 'Bed 04 (Door Side)',
    studentId: 'GIFT-2023-1005',
    name: 'Amit Kumar Panda',
    rollNumber: '05',
    registrationNumber: '2305201005',
    department: 'Electrical Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    phone: '+91 9861000105',
    fatherName: 'Kailash Panda',
    fatherPhone: '+91 9437000400',
    biometricStatus: 'In Hostel (Biometric Verified · 08:35 PM)',
    gender: 'Male',
    bloodGroup: 'B+',
    cgpa: '8.3',
    attendance: 90,
    permAddress: 'Medical Road, Sambalpur'
  }
];

export function generateHostelRoomsWithResidents(
  hostel,
  studentsPool = [],
  residentOverrides = {},
  vacatedResidentBeds = new Set()
) {
  if (!hostel) return [];
  const floorsCount = Math.max(1, Number(hostel.totalFloors) || 3);
  const roomsCount = Math.max(1, Number(hostel.totalRooms) || 50);
  const bedsPerRoom = hostel.name?.includes('Sarojini') ? 4 : Math.max(1, Math.round((Number(hostel.totalBeds) || (roomsCount * 4)) / roomsCount) || 4);
  const totalBeds = roomsCount * bedsPerRoom;
  const occupiedTarget = Number(hostel.occupiedBeds) !== undefined ? Number(hostel.occupiedBeds) : Math.round(totalBeds * 0.9);

  const isGirls = (hostel.type || '').toLowerCase().includes('girl');
  const isSarojiniHostel = hostel.id === 'hostel-g1' || (hostel.name || '').toLowerCase().includes('sarojini');

  // Filter students by gender
  const pool = isGirls
    ? studentsPool.filter(s => (s.gender || '').toLowerCase().startsWith('f'))
    : studentsPool.filter(s => !(s.gender || '').toLowerCase().startsWith('f'));

  const roomsPerFloor = Math.ceil(roomsCount / floorsCount);
  const generatedRooms = [];

  let globalRoomIdx = 1;

  for (let floorNum = 1; floorNum <= floorsCount; floorNum++) {
    const roomsOnThisFloor = Math.min(roomsPerFloor, roomsCount - (floorNum - 1) * roomsPerFloor);

    for (let r = 1; r <= roomsOnThisFloor; r++) {
      const roomNum = globalRoomIdx;
      globalRoomIdx++;

      const roomType =
        bedsPerRoom === 4
          ? floorNum === 1
            ? '4-Bed Quad Non-AC Standard'
            : floorNum === 2
            ? '4-Bed Quad AC Deluxe'
            : '4-Bed Quad Premium'
          : bedsPerRoom === 3
          ? floorNum === 1
            ? '3-Bed Triple Non-AC Standard'
            : '3-Bed Triple AC Deluxe'
          : '2-Bed Double AC Deluxe';

      const amenities = [
        `${bedsPerRoom}x Study Desk`,
        `${bedsPerRoom}x Steel Wardrobe`,
        'High-Speed Wi-Fi AP',
        'Ceiling Fan & LED'
      ];

      const roomResidents = [];
      let occupiedInThisRoom = 0;

      for (let b = 1; b <= bedsPerRoom; b++) {
        const residentKey = `${hostel.id}-rm-${roomNum}-bed-${b}`;
        const isVacated = vacatedResidentBeds.has(residentKey);
        const override = residentOverrides[residentKey] || {};

        // Overall bed index across the complex to match occupiedBeds ratio
        const globalBedIndex = (roomNum - 1) * bedsPerRoom + (b - 1);
        const shouldBeOccupied = globalBedIndex < occupiedTarget && !isVacated;

        if (isVacated || !shouldBeOccupied) {
          roomResidents.push({
            residentKey,
            bedNo: override.bedNo || BED_POSITIONS[b - 1] || `Bed 0${b}`,
            bedIndex: b,
            roomNumber: String(roomNum),
            isVacant: true,
            name: 'Vacant Bed (Unassigned)',
            studentId: '—',
            rollNumber: '—',
            registrationNumber: '—',
            department: '—',
            semester: '—',
            section: '—',
            phone: '—',
            fatherName: '—',
            fatherPhone: '—',
            biometricStatus: 'Vacant (Ready for Allotment)',
            gender: isGirls ? 'Female' : 'Male',
            bloodGroup: '—',
            cgpa: '—',
            attendance: '—',
            permAddress: '—'
          });
        } else {
          occupiedInThisRoom++;

          // Match screenshot exactly for Room 1
          let studentData;
          if (roomNum === 1) {
            studentData = isGirls ? SAMPLE_GIRLS_ROOM1[b - 1] : SAMPLE_BOYS_ROOM1[b - 1];
          }

          if (!studentData) {
            const studentIdx = (globalBedIndex + (isGirls ? 12 : 24)) % (pool.length || 1);
            const poolStudent = pool[studentIdx] || {};
            const bioIdx = (globalBedIndex + b) % BIOMETRIC_STATUSES.length;

            studentData = {
              bedIndex: b,
              bedNo: BED_POSITIONS[b - 1] || `Bed 0${b}`,
              studentId: poolStudent.studentId || `GIFT-2023-${1000 + globalBedIndex}`,
              name: poolStudent.name || (isGirls ? `Resident Student ${globalBedIndex + 1}` : `Resident Scholar ${globalBedIndex + 1}`),
              rollNumber: poolStudent.rollNumber || String(globalBedIndex + 1).padStart(2, '0'),
              registrationNumber: poolStudent.registrationNumber || `2305201${String(globalBedIndex + 1).padStart(3, '0')}`,
              department: poolStudent.department || 'Computer Science & Engineering',
              semester: poolStudent.semester || 'Semester 5',
              section: poolStudent.section || 'Section A',
              phone: poolStudent.phone || `+91 986100${String(globalBedIndex).padStart(4, '0')}`,
              fatherName: poolStudent.fatherName || 'Parent / Guardian',
              fatherPhone: poolStudent.fatherPhone || `+91 943700${String(globalBedIndex).padStart(4, '0')}`,
              biometricStatus: BIOMETRIC_STATUSES[bioIdx],
              gender: isGirls ? 'Female' : 'Male',
              bloodGroup: poolStudent.bloodGroup || 'B+',
              cgpa: poolStudent.cgpa || '8.5',
              attendance: poolStudent.attendance || 92,
              permAddress: poolStudent.permAddress || 'Odisha, India'
            };
          }

          roomResidents.push({
            residentKey,
            bedNo: override.bedNo || studentData.bedNo,
            bedIndex: b,
            roomNumber: String(roomNum),
            isVacant: false,
            studentId: override.studentId || studentData.studentId,
            name: override.name || studentData.name,
            rollNumber: override.rollNumber || studentData.rollNumber,
            registrationNumber: override.registrationNumber || studentData.registrationNumber,
            department: override.department || studentData.department,
            semester: override.semester || studentData.semester,
            section: override.section || studentData.section,
            phone: override.phone || studentData.phone,
            fatherName: override.fatherName || studentData.fatherName,
            fatherPhone: override.fatherPhone || studentData.fatherPhone,
            biometricStatus: override.biometricStatus || studentData.biometricStatus,
            gender: studentData.gender,
            bloodGroup: studentData.bloodGroup,
            cgpa: studentData.cgpa,
            attendance: studentData.attendance,
            permAddress: studentData.permAddress
          });
        }
      }

      generatedRooms.push({
        id: `${hostel.id}-rm-${roomNum}`,
        roomNumber: String(roomNum),
        displayTitle: `Room ${roomNum}`,
        floor: `Floor ${floorNum}`,
        floorNumber: floorNum,
        type: roomType,
        capacity: bedsPerRoom,
        occupiedCount: occupiedInThisRoom,
        amenities,
        residents: roomResidents
      });
    }
  }

  // Merge any custom rooms or extra beds added dynamically via Room / Bed management
  try {
    const customRooms = getRoomsForHostel(hostel.name);
    if (Array.isArray(customRooms)) {
      customRooms.forEach(cr => {
        const cleanNo = String(cr.roomNo).replace(/^room\s*/i, '').trim();
        const existing = generatedRooms.find(gr => String(gr.roomNumber).replace(/^room\s*/i, '').trim() === cleanNo);
        if (!existing) {
          const roomBeds = (cr.beds || []).map((b, idx) => {
            const bIdx = idx + 1;
            const residentKey = `${hostel.id}-rm-${cleanNo}-bed-${bIdx}`;
            const isVacated = vacatedResidentBeds.has(residentKey);
            const override = residentOverrides[residentKey] || {};
            if (b.status === 'Occupied' || (!isVacated && override.name)) {
              return {
                residentKey,
                bedNo: b.bedNo || `Bed 0${bIdx}`,
                bedIndex: bIdx,
                roomNumber: cleanNo,
                isVacant: false,
                name: override.name || b.resident?.split(' (')[0] || 'Resident Student',
                studentId: override.studentId || `GIFT-2023-${b.roll || '101'}`,
                rollNumber: override.rollNumber || b.roll || '01',
                registrationNumber: override.registrationNumber || `2305201${b.roll || '01'}`,
                department: override.department || b.branch || 'Engineering',
                semester: override.semester || 'Semester 5',
                section: override.section || 'Section A',
                phone: override.phone || '+91 98610 00000',
                fatherName: override.fatherName || 'Parent / Guardian',
                fatherPhone: override.fatherPhone || '+91 94370 00000',
                biometricStatus: override.biometricStatus || 'In Hostel (Biometric Verified · Active)',
                gender: isGirls ? 'Female' : 'Male',
                bloodGroup: 'B+',
                cgpa: '8.5',
                attendance: 90,
                permAddress: 'Campus Residence'
              };
            }
            return {
              residentKey,
              bedNo: b.bedNo || `Bed 0${bIdx}`,
              bedIndex: bIdx,
              roomNumber: cleanNo,
              isVacant: true,
              name: 'Vacant Bed (Unassigned)',
              studentId: '—',
              rollNumber: '—',
              registrationNumber: '—',
              department: '—',
              semester: '—',
              section: '—',
              phone: '—',
              fatherName: '—',
              fatherPhone: '—',
              biometricStatus: 'Vacant (Ready for Allotment)',
              gender: isGirls ? 'Female' : 'Male',
              bloodGroup: '—',
              cgpa: '—',
              attendance: '—',
              permAddress: '—'
            };
          });

          const occCount = roomBeds.filter(b => !b.isVacant).length;
          generatedRooms.push({
            id: `${hostel.id}-rm-${cleanNo}`,
            roomNumber: cleanNo,
            displayTitle: `Room ${cleanNo}`,
            floor: cr.floor || 'Floor 1',
            floorNumber: parseInt(String(cr.floor).replace(/\D/g, ''), 10) || 1,
            type: cr.type || '3-Bed Triple Non-AC Standard',
            capacity: cr.capacity || roomBeds.length || 3,
            occupiedCount: occCount,
            amenities: [`${cr.capacity || 3}x Study Desk`, `${cr.capacity || 3}x Steel Wardrobe`, 'High-Speed Wi-Fi AP', 'Ceiling Fan & LED'],
            residents: roomBeds
          });
        } else if (cr.capacity > existing.capacity || (cr.beds && cr.beds.length > existing.residents.length)) {
          // Extra beds were added
          existing.capacity = cr.capacity || (cr.beds ? cr.beds.length : existing.capacity);
          while (existing.residents.length < existing.capacity) {
            const nextBedIdx = existing.residents.length + 1;
            const extraKey = `${hostel.id}-rm-${cleanNo}-bed-${nextBedIdx}`;
            existing.residents.push({
              residentKey: extraKey,
              bedNo: `Bed 0${nextBedIdx} (Extra Bed)`,
              bedIndex: nextBedIdx,
              roomNumber: cleanNo,
              isVacant: true,
              name: 'Vacant Bed (Unassigned)',
              studentId: '—',
              rollNumber: '—',
              registrationNumber: '—',
              department: '—',
              semester: '—',
              section: '—',
              phone: '—',
              fatherName: '—',
              fatherPhone: '—',
              biometricStatus: 'Vacant (Ready for Allotment)',
              gender: isGirls ? 'Female' : 'Male',
              bloodGroup: '—',
              cgpa: '—',
              attendance: '—',
              permAddress: '—'
            });
          }
        }
      });
    }
  } catch (e) {
    console.warn('generateHostelRoomsWithResidents customRooms merge fallback:', e);
  }

  return generatedRooms;
}

// ============================================================================
// RESIDENT OVERRIDES, VACATED BEDS & BACKEND SYNCHRONIZATION STORE
// Keeps Bed Allocations, Transfers & Residents synchronized across Admin & Warden
// ============================================================================

const RESIDENT_OVERRIDES_KEY = 'bput_hostel_resident_overrides_v1';
const VACATED_BEDS_KEY = 'bput_hostel_vacated_beds_v1';

export function getStoredResidentOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(RESIDENT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setStoredResidentOverrides(overrides) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RESIDENT_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent('bput_hostel_residents_changed', { detail: { overrides } }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Failed to save resident overrides:', err);
  }
}

export function getStoredVacatedBeds() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(VACATED_BEDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function setStoredVacatedBeds(vacatedBeds) {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(vacatedBeds instanceof Set ? vacatedBeds : new Set(vacatedBeds));
    localStorage.setItem(VACATED_BEDS_KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('bput_hostel_residents_changed', { detail: { vacatedBeds: arr } }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Failed to save vacated beds:', err);
  }
}

/**
 * Fetches residents from backend and merges into persistent resident store
 */
export async function syncResidentsWithBackend() {
  try {
    const res = await api.getHostelResidents().catch(() => null);
    const backendResidents = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(backendResidents) && backendResidents.length > 0) {
      const overrides = getStoredResidentOverrides();
      const vacated = getStoredVacatedBeds();
      let changed = false;

      backendResidents.forEach(s => {
        if (!s.rollNumber) return;
        const bedNum = s.bedNumber || 'Bed 01 (Window Side)';
        const bIdx = bedNum.includes('01') ? 1 : bedNum.includes('02') ? 2 : bedNum.includes('03') ? 3 : 4;
        const hostelId = s.hostelId || (s.hostelName?.toLowerCase().includes('sarojini') ? 'hostel-g1' : s.hostelName?.toLowerCase().includes('kalam') ? 'hostel-b2' : 'hostel-b1');
        const rmNum = s.roomNumber || '101';
        const key = `${hostelId}-rm-${rmNum}-bed-${bIdx}`;

        if (vacated.has(key)) {
          vacated.delete(key);
          changed = true;
        }

        overrides[key] = {
          name: s.name,
          studentId: s.id || `GIFT-2023-${s.rollNumber}`,
          rollNumber: s.rollNumber,
          registrationNumber: s.registrationNumber || `230520${s.rollNumber}`,
          department: s.department || 'Computer Science & Engineering',
          semester: s.semester || 'Semester 5',
          section: s.section || 'Section A',
          phone: s.phone || `+91 98610 ${s.rollNumber}`,
          fatherName: s.guardianName || 'Parent / Guardian',
          fatherPhone: s.guardianPhone || `+91 94370 ${s.rollNumber}`,
          biometricStatus: 'In Hostel (Biometric Verified · Active)',
          bedNo: bedNum
        };
        changed = true;
      });

      if (changed && typeof window !== 'undefined') {
        localStorage.setItem(RESIDENT_OVERRIDES_KEY, JSON.stringify(overrides));
        localStorage.setItem(VACATED_BEDS_KEY, JSON.stringify(Array.from(vacated)));
        window.dispatchEvent(new CustomEvent('bput_hostel_residents_changed', { detail: { overrides, vacated: Array.from(vacated) } }));
      }
      return { overrides, vacated };
    }
  } catch (err) {
    console.warn('syncResidentsWithBackend fallback:', err);
  }
  return { overrides: getStoredResidentOverrides(), vacated: getStoredVacatedBeds() };
}

/**
 * Saves a new bed allocation both to persistent storage and backend API
 */
export async function saveResidentAllocation({ hostelId, hostelName, roomNumber, bedNumber, student }) {
  const overrides = getStoredResidentOverrides();
  const vacated = getStoredVacatedBeds();

  const bedIdx = bedNumber?.includes('01') ? 1 :
                 bedNumber?.includes('02') ? 2 :
                 bedNumber?.includes('03') ? 3 : 4;
  const targetKey = `${hostelId}-rm-${roomNumber}-bed-${bedIdx}`;

  vacated.delete(targetKey);
  overrides[targetKey] = {
    name: student.name,
    rollNumber: student.rollNumber,
    registrationNumber: student.registrationNumber || `230520${student.rollNumber}`,
    studentId: student.studentId || `GIFT-2023-${student.rollNumber}`,
    department: student.department || 'Computer Science & Engineering',
    semester: student.semester || 'Semester 5',
    section: student.section || 'Section A',
    phone: student.phone || student.studentPhone || student.contactNumber || `+91 98610 ${student.rollNumber}`,
    fatherName: student.fatherName || 'Parent / Guardian',
    fatherPhone: student.fatherPhone || student.guardianPhone || `+91 94370 ${student.rollNumber}`,
    biometricStatus: 'In Hostel (Biometric Verified · Active)',
    bedNo: bedNumber
  };

  setStoredResidentOverrides(overrides);
  setStoredVacatedBeds(vacated);

  try {
    await api.allocateBed({
      studentRoll: student.rollNumber,
      hostelName: hostelName || hostelId,
      roomNumber: String(roomNumber),
      bedNumber
    });
  } catch (err) {
    console.warn('Backend allocateBed warning:', err);
  }

  return { targetKey, resident: overrides[targetKey] };
}

/**
 * Executes a bed transfer across rooms or hostels
 */
export async function transferResidentAllocation({ studentRoll, studentName, currentRoomNumber, currentHostelId, targetHostelId, targetHostelName, targetRoomNumber, targetBedNumber, reason }) {
  const overrides = getStoredResidentOverrides();
  const vacated = getStoredVacatedBeds();

  let sourceKey = null;
  let sourceStudentData = null;
  for (const [k, r] of Object.entries(overrides)) {
    if (r.rollNumber === studentRoll) {
      sourceKey = k;
      sourceStudentData = r;
      break;
    }
  }

  if (sourceKey) {
    delete overrides[sourceKey];
    vacated.add(sourceKey);
  } else if (currentRoomNumber) {
    const srcHostel = currentHostelId || 'hostel-b1';
    for (let b = 1; b <= 4; b++) {
      vacated.add(`${srcHostel}-rm-${currentRoomNumber}-bed-${b}`);
    }
  }

  const targetBedIdx = targetBedNumber?.includes('01') ? 1 :
                       targetBedNumber?.includes('02') ? 2 :
                       targetBedNumber?.includes('03') ? 3 : 4;
  const targetKey = `${targetHostelId}-rm-${targetRoomNumber}-bed-${targetBedIdx}`;

  vacated.delete(targetKey);
  overrides[targetKey] = {
    ...(sourceStudentData || {}),
    name: studentName || sourceStudentData?.name || `Student ${studentRoll}`,
    rollNumber: studentRoll,
    registrationNumber: sourceStudentData?.registrationNumber || `230520${studentRoll}`,
    studentId: sourceStudentData?.studentId || `GIFT-2023-${studentRoll}`,
    department: sourceStudentData?.department || 'Computer Science & Engineering',
    semester: sourceStudentData?.semester || 'Semester 5',
    section: sourceStudentData?.section || 'Section A',
    phone: sourceStudentData?.phone || `+91 98610 ${studentRoll}`,
    fatherPhone: sourceStudentData?.fatherPhone || `+91 94370 ${studentRoll}`,
    biometricStatus: 'In Hostel (Biometric Verified · Active)',
    bedNo: targetBedNumber
  };

  setStoredResidentOverrides(overrides);
  setStoredVacatedBeds(vacated);

  try {
    await api.transferBed({
      studentRoll,
      newHostelName: targetHostelName || targetHostelId,
      newRoomNumber: String(targetRoomNumber),
      newBedNumber: targetBedNumber,
      transferReason: reason
    });
  } catch (err) {
    console.warn('Backend transferBed warning:', err);
  }

  return { targetKey, resident: overrides[targetKey] };
}

/**
 * Vacates a resident bed and releases capacity
 */
export async function vacateResidentBed(residentKey, studentRoll, reason) {
  const overrides = getStoredResidentOverrides();
  const vacated = getStoredVacatedBeds();

  if (residentKey) {
    delete overrides[residentKey];
    vacated.add(residentKey);
  }

  if (studentRoll) {
    for (const [k, r] of Object.entries(overrides)) {
      if (r.rollNumber === studentRoll) {
        delete overrides[k];
        vacated.add(k);
      }
    }
  }

  setStoredResidentOverrides(overrides);
  setStoredVacatedBeds(vacated);

  if (studentRoll) {
    try {
      await api.vacateBed(studentRoll, reason);
    } catch (err) {
      console.warn('Backend vacateBed warning:', err);
    }
  }

  return { vacatedKey: residentKey };
}

/**
 * Updates resident details in persistent store and backend
 */
export async function updateResidentDetails(rollNumber, residentKey, updates) {
  const overrides = getStoredResidentOverrides();
  const current = overrides[residentKey] || {};
  overrides[residentKey] = {
    ...current,
    ...updates
  };

  setStoredResidentOverrides(overrides);

  if (rollNumber) {
    try {
      await api.updateHostelResident(rollNumber, updates);
    } catch (err) {
      console.warn('Backend updateHostelResident warning:', err);
    }
  }

  return overrides[residentKey];
}
