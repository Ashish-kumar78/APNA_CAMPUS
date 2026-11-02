import test from 'node:test';
import assert from 'node:assert';
import { getAllHostels, syncHostelsFromBackend } from '../src/services/hostelAttendanceStore.js';
import { saveHostelComplex, getAllHostelComplexes } from '../src/services/hostelComplexStore.js';
import {
  getAllWardens,
  reassignWarden,
  getAssignmentHistory
} from '../src/services/wardenManagementStore.js';
import { api } from '../src/services/api.js';

// Setup storage and window mocks
const mockStore = {};
globalThis.localStorage = {
  getItem: (k) => mockStore[k] || null,
  setItem: (k, v) => { mockStore[k] = String(v); },
  removeItem: (k) => { delete mockStore[k]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};

const dispatchedEvents = [];
globalThis.window = {
  dispatchEvent: (e) => dispatchedEvents.push(e),
  addEventListener: () => {},
  removeEventListener: () => {}
};

test('Hostel Backend Sync & Warden Reassignment to New Hostels', async () => {
  // 1. syncHostelsFromBackend fetches new hostels from backend API and updates getAllHostels()
  const mockBackendHostels = [
    { id: 'hst-new-1', name: 'Aryabhatta Research Hostel', code: 'ARH', totalRooms: 40, totalBeds: 120, type: 'Boys' },
    { id: 'hst-new-2', name: 'Kalpana Chawla Hall', code: 'KCH', totalRooms: 50, totalBeds: 150, type: 'Girls' }
  ];

  const origGetHostelComplexes = api.getHostelComplexes;
  api.getHostelComplexes = async () => ({
    success: true,
    data: mockBackendHostels
  });

  const synced = await syncHostelsFromBackend();
  assert.ok(synced);

  const names = synced.map(h => h.name);
  assert.ok(names.includes('Aryabhatta Research Hostel'));
  assert.ok(names.includes('Kalpana Chawla Hall'));

  // Also verify getAllHostels reflects it
  const allHostels = getAllHostels();
  assert.ok(allHostels.map(h => h.name).includes('Aryabhatta Research Hostel'));

  // 2. saveHostelComplex adds a new hostel complex and synchronizes across stores
  let createCalledWith = null;
  const origCreateHostelComplex = api.createHostelComplex;
  api.createHostelComplex = async (payload) => {
    createCalledWith = payload;
    return { success: true };
  };

  const newComplex = saveHostelComplex({
    name: 'Ramanujan Mathematical Residency',
    type: 'Boys',
    totalFloors: 4,
    totalRooms: 60,
    totalBeds: 180,
    warden: 'Mr. Rajesh Jena',
    contact: '+91 94370 22334'
  });

  assert.strictEqual(newComplex.name, 'Ramanujan Mathematical Residency');
  assert.strictEqual(newComplex.totalBeds, 180);

  const complexes = getAllHostelComplexes();
  assert.ok(complexes.map(c => c.name).includes('Ramanujan Mathematical Residency'));

  const updatedHostels = getAllHostels();
  assert.ok(updatedHostels.map(h => h.name).includes('Ramanujan Mathematical Residency'));
  assert.strictEqual(createCalledWith.name, 'Ramanujan Mathematical Residency');

  // 3. reassignWarden reassigns warden to new hostel and triggers backend sync
  let updateWardenCalledWith = null;
  const origUpdateWardenProfile = api.updateWardenProfile;
  api.updateWardenProfile = async (id, payload) => {
    updateWardenCalledWith = { id, payload };
    return { success: true };
  };

  const wardens = getAllWardens();
  const targetWarden = wardens[0];
  assert.ok(targetWarden);

  const hist = reassignWarden({
    wardenId: targetWarden.id,
    newHostelId: 'hst-ramanujan',
    newHostelName: 'Ramanujan Mathematical Residency',
    assignedBlocks: ['North Wing (Ground + 3 Floors)'],
    dutyShift: 'General / 24x7 Resident',
    shiftTimings: '06:00 AM - 10:00 PM',
    effectiveDate: '2026-11-02',
    reason: 'Operational handover to new complex',
    adminUser: 'Chief Hostel Administrator'
  });

  assert.strictEqual(hist.newHostel, 'Ramanujan Mathematical Residency');

  const refreshedWardens = getAllWardens();
  const refreshedTarget = refreshedWardens.find(w => w.id === targetWarden.id);
  assert.strictEqual(refreshedTarget.hostelName, 'Ramanujan Mathematical Residency');

  const history = getAssignmentHistory();
  assert.strictEqual(history[0].newHostel, 'Ramanujan Mathematical Residency');
  assert.strictEqual(updateWardenCalledWith.id, targetWarden.id);
  assert.strictEqual(updateWardenCalledWith.payload.hostelName, 'Ramanujan Mathematical Residency');

  // Cleanup mocks
  api.getHostelComplexes = origGetHostelComplexes;
  api.createHostelComplex = origCreateHostelComplex;
  api.updateWardenProfile = origUpdateWardenProfile;
});

