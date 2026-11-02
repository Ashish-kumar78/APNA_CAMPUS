import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllHostelComplexes,
  saveHostelComplex,
  generateHostelRoomsWithResidents,
  getStoredResidentOverrides,
  setStoredResidentOverrides,
  getStoredVacatedBeds,
  setStoredVacatedBeds,
  saveResidentAllocation,
  transferResidentAllocation,
  vacateResidentBed,
  updateResidentDetails,
  syncResidentsWithBackend
} from '../src/services/hostelComplexStore.js';
import { saveHostel, getAllHostels } from '../src/services/hostelAttendanceStore.js';
import api from '../src/services/api.js';

describe('Section 1: Hostel Residence Synchronization (Admin & Warden Roles)', () => {
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
    if (typeof globalThis.window === 'undefined') {
      globalThis.window = {
        dispatchEvent: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
    vi.restoreAllMocks();
  });

  it('1. Initializes default hostel complexes and retrieves stored complexes', () => {
    const complexes = getAllHostelComplexes();
    expect(complexes).toBeDefined();
    expect(complexes.length).toBeGreaterThanOrEqual(3);
    expect(complexes[0].name).toContain('Gandhi Boys Residence');
  });

  it('2. Allocating a bed updates persistent overrides, clears vacated status, and syncs to backend api.allocateBed', async () => {
    const allocateBedSpy = vi.spyOn(api, 'allocateBed').mockResolvedValue({ success: true });

    const student = {
      name: 'Ashish Kumar',
      rollNumber: '42',
      registrationNumber: '2305201042',
      department: 'Computer Science & Engineering',
      phone: '+91 98610 42424',
      fatherPhone: '+91 94370 42424'
    };

    const res = await saveResidentAllocation({
      hostelId: 'hostel-b1',
      hostelName: 'Gandhi Boys Residence',
      roomNumber: '105',
      bedNumber: 'Bed 02 (Study Side)',
      student
    });

    expect(res.targetKey).toBe('hostel-b1-rm-105-bed-2');
    expect(res.resident.name).toBe('Ashish Kumar');
    expect(res.resident.rollNumber).toBe('42');

    // Verify persisted in store
    const storedOverrides = getStoredResidentOverrides();
    expect(storedOverrides['hostel-b1-rm-105-bed-2']).toBeDefined();
    expect(storedOverrides['hostel-b1-rm-105-bed-2'].name).toBe('Ashish Kumar');

    const vacatedBeds = getStoredVacatedBeds();
    expect(vacatedBeds.has('hostel-b1-rm-105-bed-2')).toBe(false);

    // Verify backend API called
    expect(allocateBedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        studentRoll: '42',
        roomNumber: '105',
        bedNumber: 'Bed 02 (Study Side)'
      })
    );
  });

  it('3. Transferring a resident moves allocation from source bed to target bed and syncs to api.transferBed', async () => {
    const transferBedSpy = vi.spyOn(api, 'transferBed').mockResolvedValue({ success: true });

    // Seed student in bed 105-2
    setStoredResidentOverrides({
      'hostel-b1-rm-105-bed-2': {
        name: 'Ashish Kumar',
        rollNumber: '42',
        bedNo: 'Bed 02 (Study Side)'
      }
    });

    const res = await transferResidentAllocation({
      studentRoll: '42',
      studentName: 'Ashish Kumar',
      currentRoomNumber: '105',
      currentHostelId: 'hostel-b1',
      targetHostelId: 'hostel-b1',
      targetHostelName: 'Gandhi Boys Residence',
      targetRoomNumber: '201',
      targetBedNumber: 'Bed 01 (Window Side)',
      reason: 'Prefers 2nd floor'
    });

    expect(res.targetKey).toBe('hostel-b1-rm-201-bed-1');
    const stored = getStoredResidentOverrides();
    expect(stored['hostel-b1-rm-105-bed-2']).toBeUndefined();
    expect(stored['hostel-b1-rm-201-bed-1']).toBeDefined();
    expect(stored['hostel-b1-rm-201-bed-1'].name).toBe('Ashish Kumar');

    const vacated = getStoredVacatedBeds();
    expect(vacated.has('hostel-b1-rm-105-bed-2')).toBe(true);

    expect(transferBedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        studentRoll: '42',
        newRoomNumber: '201',
        newBedNumber: 'Bed 01 (Window Side)'
      })
    );
  });

  it('4. Vacating a resident bed marks it vacant, updates storage, and calls api.vacateBed', async () => {
    const vacateBedSpy = vi.spyOn(api, 'vacateBed').mockResolvedValue({ success: true });

    setStoredResidentOverrides({
      'hostel-b1-rm-201-bed-1': {
        name: 'Ashish Kumar',
        rollNumber: '42',
        bedNo: 'Bed 01 (Window Side)'
      }
    });

    await vacateResidentBed('hostel-b1-rm-201-bed-1', '42', 'Student graduated');

    const stored = getStoredResidentOverrides();
    expect(stored['hostel-b1-rm-201-bed-1']).toBeUndefined();

    const vacated = getStoredVacatedBeds();
    expect(vacated.has('hostel-b1-rm-201-bed-1')).toBe(true);

    expect(vacateBedSpy).toHaveBeenCalledWith('42', 'Student graduated');
  });

  it('5. Updating resident details reflects in storage and calls api.updateHostelResident', async () => {
    const updateResidentSpy = vi.spyOn(api, 'updateHostelResident').mockResolvedValue({ success: true });

    setStoredResidentOverrides({
      'hostel-b1-rm-101-bed-1': {
        name: 'Rakesh Das',
        rollNumber: '01',
        phone: '+91 98610 00101'
      }
    });

    await updateResidentDetails('01', 'hostel-b1-rm-101-bed-1', {
      phone: '+91 77359 99999',
      fatherPhone: '+91 94370 77777'
    });

    const stored = getStoredResidentOverrides();
    expect(stored['hostel-b1-rm-101-bed-1'].phone).toBe('+91 77359 99999');
    expect(stored['hostel-b1-rm-101-bed-1'].fatherPhone).toBe('+91 94370 77777');

    expect(updateResidentSpy).toHaveBeenCalledWith(
      '01',
      expect.objectContaining({
        phone: '+91 77359 99999'
      })
    );
  });

  it('6. Creating a new hostel automatically cross-syncs between attendance and complex stores', () => {
    const newHostel = saveHostel({
      name: 'Ramanujan Boys Residence',
      code: 'RBR',
      floors: 4,
      totalRooms: 40,
      totalBeds: 160,
      warden: 'Dr. A. K. Nayak',
      contact: '+91 94370 88990',
      type: 'Boys'
    });

    expect(newHostel).toBeDefined();

    // Verify it is present in getAllHostelComplexes
    const complexes = getAllHostelComplexes();
    const found = complexes.find(c => c.name === 'Ramanujan Boys Residence');
    expect(found).toBeDefined();
    expect(found.totalBeds).toBe(160);
    expect(found.warden).toBe('Dr. A. K. Nayak');
  });

  it('7. syncResidentsWithBackend fetches backend residents and integrates them into resident overrides', async () => {
    vi.spyOn(api, 'getHostelResidents').mockResolvedValue({
      success: true,
      data: [
        {
          id: 'GIFT-2023-88',
          name: 'Sunil Verma',
          rollNumber: '88',
          registrationNumber: '2305201088',
          department: 'Civil Engineering',
          hostelName: 'Gandhi Boys Residence',
          roomNumber: '102',
          bedNumber: 'Bed 03 (Inner Side)',
          phone: '+91 98610 88888',
          guardianName: 'Sanjay Verma',
          guardianPhone: '+91 94370 88888'
        }
      ]
    });

    const { overrides } = await syncResidentsWithBackend();
    expect(overrides['hostel-b1-rm-102-bed-3']).toBeDefined();
    expect(overrides['hostel-b1-rm-102-bed-3'].name).toBe('Sunil Verma');
    expect(overrides['hostel-b1-rm-102-bed-3'].rollNumber).toBe('88');
  });

  it('8. generateHostelRoomsWithResidents produces matching room structures for both Admin and Warden', () => {
    const complexes = getAllHostelComplexes();
    const gandhiHostel = complexes[0];

    const overrides = {
      [`${gandhiHostel.id}-rm-1-bed-1`]: {
        name: 'Custom Resident X',
        rollNumber: '99',
        bedNo: 'Bed 01 (Window Side)'
      }
    };
    const vacated = new Set([`${gandhiHostel.id}-rm-1-bed-2`]);

    const rooms = generateHostelRoomsWithResidents(gandhiHostel, [], overrides, vacated);
    expect(rooms.length).toBeGreaterThan(0);

    const room1 = rooms.find(r => r.roomNumber === '1');
    expect(room1).toBeDefined();

    // Bed 1 has overridden student
    expect(room1.residents[0].name).toBe('Custom Resident X');
    expect(room1.residents[0].rollNumber).toBe('99');
    expect(room1.residents[0].isVacant).toBe(false);

    // Bed 2 is marked vacated
    expect(room1.residents[1].isVacant).toBe(true);
    expect(room1.residents[1].name).toContain('Vacant Bed');
  });
});
