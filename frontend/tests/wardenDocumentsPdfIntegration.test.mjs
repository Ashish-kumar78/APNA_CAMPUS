// Automated Integration Test: Warden Documents PDF Generation, Upload & Download
import assert from 'node:assert/strict';
import {
  generateInstitutionalWardenDocumentPdf,
  downloadWardenDocument,
  getWardenDocumentPreviewUrl
} from '../src/utils/wardenDocumentService.js';
import {
  appendWardenDocument,
  removeWardenDocument,
  getWardenCmsProfile
} from '../../backend/dist/hostel/warden-profiles.data.js';

console.log('--- TEST 1: Institutional PDF Generation for Seeded Documents ---');
const testWarden = {
  employeeId: 'WRD-101',
  name: 'Mr. Rajesh Jena',
  designation: 'Chief Resident Warden (Boys)',
  department: 'Hostel Administration & Student Housing',
  hostelName: 'Gandhi Boys Residence',
  assignedBlocks: 'Block A (Rooms 101-220), Block B (Rooms 201-320)'
};

const documentsToTest = [
  { id: 'doc-1', name: 'Chief Resident Warden Appointment Order', meta: 'Issued 15-07-2018 · Autonomous Secretariat' },
  { id: 'doc-2', name: 'Post Graduate & B.Tech Degree Certificates', meta: 'BPUT Autonomous Verified' },
  { id: 'doc-3', name: 'Identity Proof (Aadhaar & PAN)', meta: 'UIDAI & Income Tax Verified' },
  { id: 'doc-4', name: 'Hostel Night Curfew Management Certification', meta: 'Campus Safety Council' },
  { id: 'doc-5', name: 'Annual Health & Physical Fitness Clearance', meta: 'Issued Oct 2026' }
];

for (const doc of documentsToTest) {
  const pdfInstance = generateInstitutionalWardenDocumentPdf(doc, testWarden);
  assert.ok(pdfInstance, `PDF generation failed for ${doc.name}`);

  // Test datauristring output
  const dataUri = pdfInstance.output('datauristring');
  assert.ok(dataUri.startsWith('data:application/pdf;'), `Data URI must be a valid PDF URI for ${doc.name}`);
  assert.ok(dataUri.length > 500, `PDF size is unexpectedly small (${dataUri.length} chars)`);
  console.log(`✓ Generated official PDF for "${doc.name}" (${dataUri.length} bytes data URI)`);
}
console.log('✓ TEST 1 PASSED: All 5 verified credentials generate authentic institutional PDFs.\n');

console.log('--- TEST 2: Preview URL Generation (Uploaded vs Institutional) ---');
// Case A: Document without custom upload -> should generate institutional PDF data URI
const institutionalPreview = getWardenDocumentPreviewUrl(documentsToTest[0], testWarden);
assert.ok(institutionalPreview.startsWith('data:application/pdf;'), 'Preview URL must be valid PDF data URI');

// Case B: Document with custom uploaded PDF
const dummyPdfDataUri = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...';
const uploadedDoc = {
  id: 'doc-custom-99',
  name: 'BPUT Warden Service Verification Certificate',
  meta: 'Issued by BPUT & Autonomous Campus Directorate · Verified 2026',
  fileData: dummyPdfDataUri,
  fileName: 'warden_service_cert.pdf',
  fileType: 'application/pdf',
  fileSize: 102400
};
const uploadedPreview = getWardenDocumentPreviewUrl(uploadedDoc, testWarden);
assert.equal(uploadedPreview, dummyPdfDataUri, 'Should return the exact uploaded file data URI');
console.log('✓ TEST 2 PASSED: Preview URL accurately differentiates custom uploads vs institutional templates.\n');

console.log('--- TEST 3: Backend Document Upload & Deletion ---');
const uploadedPayload = {
  id: `doc-test-${Date.now()}`,
  name: 'National Fire Safety Warden Certificate',
  meta: 'Odisha State Fire Academy · Verified Oct 2026',
  fileData: 'data:application/pdf;base64,TEST_DATA',
  fileName: 'fire_safety_wrd101.pdf',
  fileType: 'application/pdf',
  fileSize: 45000,
  uploadedAt: new Date().toISOString()
};

const updatedProfile = appendWardenDocument('WRD-101', uploadedPayload);
assert.ok(updatedProfile, 'Profile should be returned');
const foundDoc = updatedProfile.documents.find(d => d.id === uploadedPayload.id);
assert.ok(foundDoc, 'Uploaded document should be present in profile documents array');
assert.equal(foundDoc.name, uploadedPayload.name);
assert.equal(foundDoc.fileName, 'fire_safety_wrd101.pdf');
console.log(`✓ Attached document "${foundDoc.name}" to WRD-101 dossier in backend.`);

// Delete document
const afterDeleteProfile = removeWardenDocument('WRD-101', uploadedPayload.id);
assert.ok(afterDeleteProfile, 'Profile after deletion should be returned');
const deletedDoc = afterDeleteProfile.documents.find(d => d.id === uploadedPayload.id);
assert.equal(deletedDoc, undefined, 'Document should be removed from profile documents array');
console.log(`✓ Successfully removed test document from WRD-101 backend profile.`);
console.log('✓ TEST 3 PASSED: Backend append and remove document persistence verified.\n');

console.log('===========================================================');
console.log('ALL WARDEN DOCUMENTS PDF & UPLOAD INTEGRATION TESTS PASSED!');
console.log('===========================================================');

