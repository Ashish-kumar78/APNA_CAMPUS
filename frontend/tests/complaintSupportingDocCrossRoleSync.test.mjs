import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getLocalCleanlinessComplaints,
  submitCleanlinessComplaint,
  uploadCleanlinessComplaintDocument,
  getAllCleanlinessComplaints
} from '../src/services/cleanlinessComplaintStore.js';

console.log('Testing Complaint Supporting Document Cross-Role Synchronization...');

// --- 1. Verify Code Structure & Column Presence ---
const adminCleanlinessPath = path.resolve('frontend/src/components/hostel/HostelCleanlinessManagementSection.jsx');
const studentCleanlinessPath = path.resolve('frontend/src/components/hostel/StudentCleanlinessSection.jsx');
const portalPath = path.resolve('frontend/src/components/HostelPortal.jsx');
const maintenancePath = path.resolve('frontend/src/components/hostel/HostelMaintenanceSection.jsx');
const backendControllerPath = path.resolve('backend/src/hostel/hostel.controller.ts');
const backendServicePath = path.resolve('backend/src/hostel/hostel.service.ts');

const adminCleanlinessContent = fs.readFileSync(adminCleanlinessPath, 'utf8');
const studentCleanlinessContent = fs.readFileSync(studentCleanlinessPath, 'utf8');
const portalContent = fs.readFileSync(portalPath, 'utf8');
const maintenanceContent = fs.readFileSync(maintenancePath, 'utf8');
const controllerContent = fs.readFileSync(backendControllerPath, 'utf8');
const serviceContent = fs.readFileSync(backendServicePath, 'utf8');

// 1.1 Verify "Supporting Document" column in all tables
assert.ok(
  adminCleanlinessContent.includes('<th>Supporting Document</th>'),
  'HostelCleanlinessManagementSection must contain <th>Supporting Document</th>'
);
assert.ok(
  studentCleanlinessContent.includes('<th>Supporting Document</th>'),
  'StudentCleanlinessSection must contain <th>Supporting Document</th>'
);
assert.ok(
  portalContent.includes('<th>Supporting Document</th>'),
  'HostelPortal must contain <th>Supporting Document</th>'
);
assert.ok(
  maintenanceContent.includes('<th>Supporting Document</th>'),
  'HostelMaintenanceSection must contain <th>Supporting Document</th>'
);

// 1.2 Verify "View" button and Document Viewer Modal in components
assert.ok(
  adminCleanlinessContent.includes('Supporting Document / Photograph') && adminCleanlinessContent.includes('setViewingDocModal'),
  'HostelCleanlinessManagementSection must feature Document Viewer Modal'
);
assert.ok(
  studentCleanlinessContent.includes('Supporting Document / Photograph') && studentCleanlinessContent.includes('setViewingDocModal'),
  'StudentCleanlinessSection must feature Document Viewer Modal'
);
assert.ok(
  portalContent.includes('Supporting Document / Photograph') && portalContent.includes('setViewingDocModal'),
  'HostelPortal must feature Document Viewer Modal'
);
assert.ok(
  maintenanceContent.includes('Supporting Document / Photograph') && maintenanceContent.includes('setViewingDocModal'),
  'HostelMaintenanceSection must feature Document Viewer Modal'
);

// 1.3 Verify backend endpoints
assert.ok(
  controllerContent.includes("cleanliness-complaints/:id/document"),
  'HostelController must have cleanliness-complaints/:id/document endpoint'
);
assert.ok(
  controllerContent.includes("complaints/:id/document"),
  'HostelController must have complaints/:id/document endpoint'
);
assert.ok(
  serviceContent.includes('attachCleanlinessComplaintDocument'),
  'HostelService must implement attachCleanlinessComplaintDocument'
);
assert.ok(
  serviceContent.includes('attachComplaintDocument'),
  'HostelService must implement attachComplaintDocument'
);

console.log('✓ Code structure and "Supporting Document" columns verified across all interfaces.');

// --- 2. Test Student Upload Flow -> Visible to Warden & Admin ---
const studentSamplePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const studentComplaintPayload = {
  category: 'Room Cleaning',
  title: 'Spill stain on desk and bedframe',
  description: 'Water seepage caused a watermark on the study table.',
  location: 'My Room',
  priority: 'High',
  preferredTime: 'Morning Shift',
  attachmentUrl: studentSamplePhoto,
  studentName: 'Aman Sharma',
  rollNumber: '2305201099',
  hostel: 'Gandhi Boys Residence',
  roomNumber: '102',
  block: 'Block A',
  floor: 'Floor 1'
};

const lodgedComplaint = await submitCleanlinessComplaint(studentComplaintPayload);
assert.ok(lodgedComplaint, 'Student complaint should be created');
assert.ok(
  lodgedComplaint.attachmentUrl === studentSamplePhoto || lodgedComplaint.supportingDocument === studentSamplePhoto,
  'Student complaint must preserve uploaded photo as attachmentUrl/supportingDocument'
);

// Verify that Warden and Admin fetching complaints immediately receives the student photo
const allComplaintsForWardenAndAdmin = await getAllCleanlinessComplaints();
const foundInWardenView = allComplaintsForWardenAndAdmin.find(c => c.id === lodgedComplaint.id || c.complaintCode === lodgedComplaint.complaintCode);

assert.ok(foundInWardenView, 'Complaint must be present in Warden / Admin complaints list');
assert.strictEqual(
  foundInWardenView.attachmentUrl,
  studentSamplePhoto,
  'Student uploaded photo must be visible to Warden and Admin'
);
console.log('✓ Student uploaded photo in hostel residence is immediately visible to both Warden and Admin!');

// --- 3. Test Warden Photo Upload -> Visible in Supporting Document column ---
const wardenEvidencePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const updatedWithWardenPhoto = await uploadCleanlinessComplaintDocument(
  lodgedComplaint.id,
  wardenEvidencePhoto,
  'Mr. Rajesh Jena (Hostel Warden)'
);

assert.ok(updatedWithWardenPhoto, 'Complaint should be updated with photo');
assert.strictEqual(
  updatedWithWardenPhoto.attachmentUrl,
  wardenEvidencePhoto,
  'Warden uploaded photo must be saved as attachmentUrl'
);
assert.strictEqual(
  updatedWithWardenPhoto.supportingDocument,
  wardenEvidencePhoto,
  'Warden uploaded photo must be saved as supportingDocument'
);

// Verify history entry was appended
const hasWardenHistory = (updatedWithWardenPhoto.statusHistory || []).some(
  h => h.note && h.note.includes('Supporting document / photograph uploaded by Mr. Rajesh Jena')
);
assert.ok(hasWardenHistory, 'Status history should audit the warden photo upload');

// Verify reflection in global store for Admin and Student views
const refreshedList = getLocalCleanlinessComplaints();
const reflectedRecord = refreshedList.find(c => c.id === lodgedComplaint.id || c.complaintCode === lodgedComplaint.complaintCode);

assert.strictEqual(
  reflectedRecord.attachmentUrl,
  wardenEvidencePhoto,
  'Warden photo must be synchronized across both Admin and Student portals'
);

console.log('✓ Warden uploaded complaint photo is saved, audited in history, and synchronized across all portals!');
console.log('ALL TESTS PASSED CLEANLY!');
