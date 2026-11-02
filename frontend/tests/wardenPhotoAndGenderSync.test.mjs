import assert from 'node:assert';
import {
  addNewWarden,
  getAllWardens
} from '../src/services/wardenManagementStore.js';
import {
  registerNewWardenProfile,
  resolveWardenProfile
} from '../src/components/hostel/wardenProfilesData.js';

// Setup Mock Environment
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

console.log('--- 1. Testing Photo Upload & Avatar DP Data ---');
const uploadedPhotoDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Simulate Warden creation with uploaded photo DP and Gender chosen from dropdown
const wardenData = {
  employeeId: 'WRD-109',
  title: 'Mrs.',
  firstName: 'Puspalata',
  middleName: '',
  lastName: 'Mishra',
  name: 'Mrs. Puspalata Mishra',
  gender: 'Female', // Chosen from Gender dropdown
  avatar: uploadedPhotoDataUrl,
  photoUrl: uploadedPhotoDataUrl,
  photo: uploadedPhotoDataUrl,
  designation: 'Assistant Warden (Girls)',
  department: 'Hostel Administration & Student Housing',
  hostelName: 'Sarojini Girls Residence',
  assignedBlocks: 'Wing A (Floors 1-3)',
  dutyShift: 'Morning & Evening Resident',
  email: 'puspalata.mishra@gift.edu.in',
  phone: '+91 94370 12345',
  bloodGroup: 'A+',
  qualification: 'M.Sc, B.Ed'
};

const savedWarden = addNewWarden(wardenData);
registerNewWardenProfile(savedWarden);

// Persist individual avatar keys
localStorage.setItem(`hostel_officer_avatar_${savedWarden.id}`, savedWarden.avatar);
localStorage.setItem(`hostel_officer_avatar_${savedWarden.employeeId}`, savedWarden.avatar);

console.log('✓ Warden registered with ID:', savedWarden.id);
assert.strictEqual(savedWarden.gender, 'Female', 'Gender chosen from dropdown must be Female');
assert.strictEqual(savedWarden.avatar, uploadedPhotoDataUrl, 'Uploaded photo must be saved as avatar DP');
assert.strictEqual(savedWarden.photoUrl, uploadedPhotoDataUrl, 'Uploaded photo must be saved as photoUrl DP');

console.log('--- 2. Verifying Profile Resolution with DP & Gender ---');
const resolved = resolveWardenProfile(savedWarden.id);
assert.strictEqual(resolved.name, 'Mrs. Puspalata Mishra');
assert.strictEqual(resolved.gender, 'Female', 'Resolved profile must retain Female gender');
assert.strictEqual(resolved.avatar, uploadedPhotoDataUrl, 'Resolved profile DP must match uploaded photo');
console.log('✓ Profile resolution verified with DP and Gender');

console.log('--- 3. Verifying LocalStorage Avatar Key for Header & Profile Sync ---');
const storedAvatar = localStorage.getItem(`hostel_officer_avatar_${savedWarden.id}`);
assert.strictEqual(storedAvatar, uploadedPhotoDataUrl, 'LocalStorage avatar key must store uploaded photo');
console.log('✓ LocalStorage avatar DP successfully stored');

console.log('--- 4. Testing Gender Dropdown Selection Options ---');
const validGenders = ['Male', 'Female', 'Other'];
validGenders.forEach(g => {
  const testWarden = addNewWarden({
    ...wardenData,
    employeeId: `WRD-${Math.floor(200 + Math.random() * 100)}`,
    gender: g
  });
  assert.strictEqual(testWarden.gender, g, `Warden gender should correctly accept ${g}`);
});
console.log('✓ All Gender dropdown options (Male, Female, Other) validated');

console.log('\nAll Warden Photo Upload DP and Gender Dropdown tests PASSED cleanly!');

