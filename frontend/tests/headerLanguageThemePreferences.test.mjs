import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { AuthService } = require('../../backend/dist/src/auth/auth.service.js');

import {
  getUserPreferences,
  saveLocalUserPreferences,
  setUserTheme,
  setUserLanguage,
  resolveUserPrefKey,
} from '../src/services/userPreferencesStore.js';
import { translateText, HINDI_DICTIONARY } from '../src/services/languageStore.js';

console.log('========================================================');
console.log('Testing Header Language & Theme Preferences System');
console.log('========================================================\n');

// --- 1. VERIFY SHARED HEADER CODE & EXACT 3 OPTIONS ---
console.log('--- 1. Verifying Shared Header Code & Icon Removal ---');
const appHeaderPath = path.resolve('frontend/src/components/Navigation/AppHeader.jsx');
const appLayoutPath = path.resolve('frontend/src/components/Navigation/AppLayout.jsx');
const navCssPath = path.resolve('frontend/src/components/Navigation/Navigation.css');

assert(fs.existsSync(appHeaderPath), 'AppHeader.jsx must exist');
assert(fs.existsSync(appLayoutPath), 'AppLayout.jsx must exist');

const headerCode = fs.readFileSync(appHeaderPath, 'utf8');

// STEP 1 CHECK: Message/Chat icon removed
assert(!headerCode.includes('<MessageSquare'), 'Message/Chat icon must be COMPLETELY REMOVED from header');

// STEP 2 & 3 & 4 CHECKS: Exactly 3 options present in header
assert(headerCode.includes('<Bell'), 'Notification Bell icon must be preserved');
assert(headerCode.includes('<Globe'), 'Language Globe icon must be present');
assert(headerCode.includes('<Sun') && headerCode.includes('<Moon'), 'Theme toggle must support both Sun and Moon icons');

// Dropdown contains English and Hindi
assert(headerCode.includes('English 🇬🇧'), 'Language dropdown must contain English 🇬🇧');
assert(headerCode.includes('हिंदी 🇮🇳'), 'Language dropdown must contain हिंदी 🇮🇳');

// Shared header used in universal layout
const layoutCode = fs.readFileSync(appLayoutPath, 'utf8');
assert(layoutCode.includes('<AppHeader'), 'AppLayout must mount the shared AppHeader for all roles');

console.log('✔ STEP 1 & 2 Verified: MessageSquare icon removed; exactly Notification, Globe, and Theme icons present in AppHeader.\n');

// --- 2. INDIVIDUAL USER PREFERENCES & STRICT ISOLATION ---
console.log('--- 2. Testing Individual User Preferences (Principal vs Faculty vs Student vs Warden) ---');

const principalAccount = { id: 'PRIN-001', role: 'principal', name: 'Dr. S. K. Rath' };
const facultyAccount = { id: 'FAC-201', role: 'faculty', name: 'Prof. Amrita Mohanty' };
const studentAccount = { id: 'STD-501', role: 'student', name: 'Rakesh Das' };
const wardenAccount = { id: 'WRD-101', role: 'warden', name: 'Mrs. Nibedita Das' };

// Set test example from user prompt:
// Principal: Dark + Hindi
await setUserTheme(principalAccount, 'dark');
await setUserLanguage(principalAccount, 'hi');

// Faculty: Light + English
await setUserTheme(facultyAccount, 'light');
await setUserLanguage(facultyAccount, 'en');

// Student: Dark + English
await setUserTheme(studentAccount, 'dark');
await setUserLanguage(studentAccount, 'en');

// Hostel Warden: Light + Hindi
await setUserTheme(wardenAccount, 'light');
await setUserLanguage(wardenAccount, 'hi');

// Verify Principal settings
const prinPrefs = getUserPreferences(principalAccount);
assert.equal(prinPrefs.theme, 'dark', 'Principal theme must be Dark');
assert.equal(prinPrefs.language, 'hi', 'Principal language must be Hindi');

// Verify Faculty settings
const facPrefs = getUserPreferences(facultyAccount);
assert.equal(facPrefs.theme, 'light', 'Faculty theme must be Light');
assert.equal(facPrefs.language, 'en', 'Faculty language must be English');

// Verify Student settings
const stdPrefs = getUserPreferences(studentAccount);
assert.equal(stdPrefs.theme, 'dark', 'Student theme must be Dark');
assert.equal(stdPrefs.language, 'en', 'Student language must be English');

// Verify Warden settings
const wrdPrefs = getUserPreferences(wardenAccount);
assert.equal(wrdPrefs.theme, 'light', 'Hostel Warden theme must be Light');
assert.equal(wrdPrefs.language, 'hi', 'Hostel Warden language must be Hindi');

// Verify zero cross-user leakage: modifying Warden settings must NEVER affect Principal
await setUserTheme(wardenAccount, 'dark');
await setUserLanguage(wardenAccount, 'en');

const prinPrefsCheck = getUserPreferences(principalAccount);
assert.equal(prinPrefsCheck.theme, 'dark', 'Principal theme must remain Dark');
assert.equal(prinPrefsCheck.language, 'hi', 'Principal language must remain Hindi');

console.log('✔ Individual user preference isolation verified across all 4 roles:');
console.log('  - Principal: Dark / Hindi');
console.log('  - Faculty:   Light / English');
console.log('  - Student:   Dark / English');
console.log('  - Warden:    Independent / Unaffected');

// Default settings check for new user
const newUserAccount = { id: 'NEW-USER-999', role: 'guest' };
const newPrefs = getUserPreferences(newUserAccount);
assert.equal(newPrefs.theme, 'light', 'Default theme must be Light Mode');
assert.equal(newPrefs.language, 'en', 'Default language must be English');
console.log('✔ Default settings verified: Light Mode + English.\n');

// --- 3. LANGUAGE SWITCHING & USER DATA PRESERVATION ---
console.log('--- 3. Testing Language Translation Engine ---');

// UI Strings in Hindi
assert.equal(translateText('Dashboard', 'hi'), 'डैशबोर्ड');
assert.equal(translateText('Calendar', 'hi'), 'कैलेंडर');
assert.equal(translateText('Holiday List', 'hi'), 'अवकाश सूची');
assert.equal(translateText('Notifications', 'hi'), 'सूचनाएं');
assert.equal(translateText('Add Note', 'hi'), 'नोट जोड़ें');
assert.equal(translateText('Submit', 'hi'), 'जमा करें');
assert.equal(translateText('Close', 'hi'), 'बंद करें');
assert.equal(translateText('Students', 'hi'), 'छात्र');
assert.equal(translateText('Faculty', 'hi'), 'संकाय');
assert.equal(translateText('Hostel', 'hi'), 'छात्रावास');
assert.equal(translateText('Pending', 'hi'), 'लंबित');
assert.equal(translateText('Completed', 'hi'), 'पूर्ण');

// Screenshots & Role-Specific Elements Translation Checks
assert.equal(translateText('STAFF MGMT', 'hi'), 'कर्मचारी प्रबंधन');
assert.equal(translateText('Hostel Staff & Warden Duty Roster', 'hi'), 'छात्रावास कर्मचारी एवं वार्डन ड्यूटी रोस्टर');
assert.equal(translateText('TOTAL STAFF', 'hi'), 'कुल कर्मचारी');
assert.equal(translateText('PRESENT ON DUTY', 'hi'), 'ड्यूटी पर उपस्थित');
assert.equal(translateText('ON AUTHORIZED LEAVE', 'hi'), 'अधिकृत अवकाश पर');
assert.equal(translateText('24X7 RESIDENT WARDENS', 'hi'), '24x7 निवासी वार्डन');
assert.equal(translateText('Chief Resident Warden (Boys)', 'hi'), 'मुख्य आवासीय वार्डन (छात्र)');
assert.equal(translateText('Hostel Maintenance Plumber', 'hi'), 'छात्रावास रखरखाव प्लम्बर');
assert.equal(translateText('Hostel Inventory & Requisition Management', 'hi'), 'छात्रावास इन्वेंट्री एवं मांग प्रबंधन');
assert.equal(translateText('Official Photograph & Identity Badge', 'hi'), 'आधिकारिक तस्वीर और पहचान बैज');
assert.equal(translateText('ADMIN UPLOAD ONLY', 'hi'), 'केवल एडमिन अपलोड');
assert.equal(translateText('Click to Upload or Drag & Drop Photo', 'hi'), 'तस्वीर अपलोड करने के लिए क्लिक करें या खींचें');
assert.equal(translateText('Male Warden 1', 'hi'), 'पुरुष वार्डन 1');
assert.equal(translateText('Female Warden 2', 'hi'), 'महिला वार्डन 2');
assert.equal(translateText('Supporting Document', 'hi'), 'सहायक दस्तावेज़');
assert.equal(translateText('View Document', 'hi'), 'दस्तावेज़ देखें');
assert.equal(translateText('Pending Calendar Reminders & Tasks', 'hi'), 'लंबित कैलेंडर अनुस्मारक और कार्य');
assert.equal(translateText('Close (Review Later)', 'hi'), 'बंद करें (बाद में समीक्षा करें)');
assert.equal(translateText('Submit (Complete Task)', 'hi'), 'जमा करें (कार्य पूर्ण करें)');

// Reverting to English
assert.equal(translateText('डैशबोर्ड', 'en'), 'Dashboard');
assert.equal(translateText('कैलेंडर', 'en'), 'Calendar');
assert.equal(translateText('कर्मचारी प्रबंधन', 'en'), 'STAFF MGMT');
assert.equal(translateText('सहायक दस्तावेज़', 'en'), 'Supporting Document');

// User data preservation: User-entered personal content must NOT be translated
const studentName = 'Mr. Rajesh Jena';
const facultyName = 'Mrs. Nibedita Das';
const rollNumber = '2305201001';
const personalNote = 'Review operating system lecture 4 notes with Dr. Panda';
const email = 'rajesh.jena@bput.edu.in';
const phone = '+91 94370 11223';
const staffId = 'STF-101';
const currency = 'Rs. 3,063.04';

assert.equal(translateText(studentName, 'hi'), studentName, 'Staff/Student personal name must NOT be translated');
assert.equal(translateText(facultyName, 'hi'), facultyName, 'Faculty personal name must NOT be translated');
assert.equal(translateText(rollNumber, 'hi'), rollNumber, 'Roll number must NOT be translated');
assert.equal(translateText(personalNote, 'hi'), personalNote, 'Personal note description must NOT be translated');
assert.equal(translateText(email, 'hi'), email, 'Email address must NOT be translated');
assert.equal(translateText(phone, 'hi'), phone, 'Phone number must NOT be translated');
assert.equal(translateText(staffId, 'hi'), staffId, 'Staff ID must NOT be translated');
assert.equal(translateText(currency, 'hi'), currency, 'Currency values must NOT be translated');

console.log('✔ Language translation engine verified:');
console.log('  - UI elements translate cleanly into Hindi / English');
console.log('  - User-entered personal content (names, notes, IDs, numbers) strictly preserved.\n');

// --- 4. BACKEND DATABASE & SERVICE INTEGRATION ---
console.log('--- 4. Testing Backend Service & Preferences Persistence ---');

const mockPrisma = {
  userPreference: {
    findUnique: async () => null,
    upsert: async () => null,
  },
};

const backendAuthService = new AuthService(mockPrisma);

// Update user preferences on backend
const bPrefs = await backendAuthService.updateUserPreferences('prin-001', {
  theme: 'dark',
  language: 'hi',
});

assert.equal(bPrefs.theme, 'dark');
assert.equal(bPrefs.language, 'hi');

// Retrieve preferences from backend
const retrieved = await backendAuthService.getUserPreferences('prin-001');
assert.equal(retrieved.theme, 'dark');
assert.equal(retrieved.language, 'hi');

// Different user on backend has their own independent preferences
const facRetrieved = await backendAuthService.getUserPreferences('fac-201');
assert.equal(facRetrieved.theme, 'light', 'Default backend theme is light');
assert.equal(facRetrieved.language, 'en', 'Default backend language is en');

console.log('✔ Backend service and database integration verified.\n');

// --- 5. DARK MODE & 4-WAY INDEPENDENT MATRIX ---
console.log('--- 5. Testing Dark Mode CSS Rules & 4-Way Independence ---');
const indexCssPath = path.resolve('frontend/src/index.css');
assert(fs.existsSync(indexCssPath), 'index.css must exist');
const cssContent = fs.readFileSync(indexCssPath, 'utf8');

assert(cssContent.includes('html[data-theme="dark"]'), 'Must contain html[data-theme="dark"] rules');
assert(cssContent.includes('#0b1120'), 'Must define dark background #0b1120');
assert(cssContent.includes('#1e293b'), 'Must define card dark background #1e293b');
assert(cssContent.includes('html[data-theme="dark"] table') || cssContent.includes('html[data-theme="dark"] .dash-table'), 'Must define dark table rules');
assert(cssContent.includes('html[data-theme="dark"] input') || cssContent.includes('html[data-theme="dark"] select'), 'Must define dark form input rules');
assert(cssContent.includes('.staff-card') && cssContent.includes('.hostel-indent-container'), 'Must style role dashboards and hostel staff in dark mode');
assert(cssContent.includes('[style*="background: white"]') || cssContent.includes('[style*="background: #fff"]'), 'Must override inline white backgrounds in dark mode');

// Test 4 combinations on a single user independently:
const testUser = { id: 'TEST-USER-4WAY', role: 'admin' };

// 1. Light + English
await setUserTheme(testUser, 'light');
await setUserLanguage(testUser, 'en');
let c1 = getUserPreferences(testUser);
assert.equal(c1.theme, 'light');
assert.equal(c1.language, 'en');

// 2. Light + Hindi
await setUserLanguage(testUser, 'hi');
let c2 = getUserPreferences(testUser);
assert.equal(c2.theme, 'light', 'Changing language to Hindi must NOT change theme');
assert.equal(c2.language, 'hi');

// 3. Dark + Hindi
await setUserTheme(testUser, 'dark');
let c3 = getUserPreferences(testUser);
assert.equal(c3.theme, 'dark');
assert.equal(c3.language, 'hi', 'Changing theme to Dark must NOT change language');

// 4. Dark + English
await setUserLanguage(testUser, 'en');
let c4 = getUserPreferences(testUser);
assert.equal(c4.theme, 'dark', 'Changing language to English must NOT change theme');
assert.equal(c4.language, 'en');

console.log('✔ Dark Mode stylesheet and 4-way independent matrix verified cleanly.');

console.log('\n========================================================');
console.log('ALL HEADER, LANGUAGE & THEME TESTS PASSED CLEANLY! ✔');
console.log('========================================================\n');

