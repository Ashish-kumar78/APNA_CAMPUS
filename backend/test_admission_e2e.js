const BASE_URL = 'http://localhost:4000/api';

async function testAdmissionWorkflows() {
  console.log('=== STARTING END-TO-END ADMISSION WORKFLOW VERIFICATION ===\n');

  // 1. Authenticate as Admissions Officer
  console.log('1. Authenticating as admissions officer (admissions)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admissions', password: 'gift123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.accessToken) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.accessToken;
  console.log('✓ Successfully authenticated! Officer:', loginData.user.name, `(${loginData.user.role})`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Test Get Admission Stats
  console.log('\n2. Testing GET /admission/stats...');
  const statsRes = await fetch(`${BASE_URL}/admission/stats`, { headers: authHeaders });
  const statsData = await statsRes.json();
  if (!statsData.success) throw new Error(`Stats fetch failed: ${JSON.stringify(statsData)}`);
  console.log('✓ Real Database Stats Retrieved:');
  console.log('  Total Applications:', statsData.data.total);
  console.log('  Awaiting Review:', statsData.data.awaitingReview);
  console.log('  Documents Pending:', statsData.data.documentsPending);
  console.log('  Approved Applications:', statsData.data.approved);
  console.log('  Offers Awaiting Acceptance:', statsData.data.offersAwaitingAcceptance);
  console.log('  Enrolled Students:', statsData.data.enrolled);
  console.log('  Conversion Rate:', statsData.data.conversionRate);
  console.log('  Priority Pending Tasks Count:', statsData.data.pendingTasks.length);

  // 3. Test Search & Filter Applicants
  console.log('\n3. Testing GET /admission/applicants (filtering & pagination)...');
  const applicantsRes = await fetch(`${BASE_URL}/admission/applicants?limit=10&page=1`, { headers: authHeaders });
  const applicantsData = await applicantsRes.json();
  if (!applicantsData.success) throw new Error(`Applicants fetch failed: ${JSON.stringify(applicantsData)}`);
  console.log(`✓ Retrieved ${applicantsData.applicants.length} applicants (Total: ${applicantsData.total}, Pages: ${applicantsData.totalPages})`);
  const sample = applicantsData.applicants[0];
  console.log(`  Sample: ${sample.applicationNo} - ${sample.name} (${sample.programmeName}, Stage: ${sample.stage})`);

  // 4. Test Single Applicant Retrieval
  console.log(`\n4. Testing GET /admission/applicants/${sample.id}...`);
  const singleRes = await fetch(`${BASE_URL}/admission/applicants/${sample.id}`, { headers: authHeaders });
  const singleData = await singleRes.json();
  if (!singleData.success) throw new Error(`Single applicant fetch failed`);
  console.log(`✓ Complete Applicant Record Loaded with ${(singleData.data.documents || []).length} documents and ${(singleData.data.history || []).length} audit entries.`);

  // 5. Test Registering a New Applicant
  console.log('\n5. Testing POST /admission/applicants (Registration)...');
  const newEmail = `test.applicant.${Date.now()}@example.com`;
  const createRes = await fetch(`${BASE_URL}/admission/applicants`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Rutuparna Mohapatra',
      email: newEmail,
      phone: '+91 94371 88099',
      gender: 'Female',
      dob: '2005-06-18',
      category: 'General',
      programmeName: 'Bachelor of Technology in Computer Science & Engineering',
      academicYear: '2026-27',
      tenthMarks: 91.5,
      twelfthMarks: 89.0,
      entranceExam: 'JEE Main 2026',
      entranceRank: 24500,
      address: 'Plot 88, Kalinga Nagar',
      city: 'Bhubaneswar',
      state: 'Odisha',
      guardianName: 'P. K. Mohapatra',
      guardianPhone: '+91 94370 99887',
    }),
  });
  const createData = await createRes.json();
  if (!createData.success) throw new Error(`Applicant registration failed: ${JSON.stringify(createData)}`);
  const testApp = createData.data;
  console.log(`✓ Applicant registered successfully! App No: ${testApp.applicationNo}, ID: ${testApp.id}`);

  // 6. Test Document Verification on New Applicant
  console.log('\n6. Testing PATCH /admission/applicants/:id/document/:docId (Document Verification)...');
  const docId = testApp.documents[0].id; // e.g. doc_10th
  const verifyDocRes = await fetch(`${BASE_URL}/admission/applicants/${testApp.id}/document/${docId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'VERIFIED',
      remarks: 'Certified copy verified against CBSE DigiLocker.',
    }),
  });
  const verifyDocData = await verifyDocRes.json();
  if (!verifyDocData.success) throw new Error(`Doc verify failed: ${JSON.stringify(verifyDocData)}`);
  console.log(`✓ Document ${docId} verified successfully!`);

  // 7. Test Bulk Verification on Remaining Docs
  console.log('\n7. Testing POST /admission/applicants/bulk-verify...');
  const bulkRes = await fetch(`${BASE_URL}/admission/applicants/bulk-verify`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ applicantIds: [testApp.id] }),
  });
  const bulkData = await bulkRes.json();
  console.log(`✓ Bulk verification completed for applicant. Count: ${bulkData.count}`);

  // 8. Test Review Decision (Approve)
  console.log('\n8. Testing POST /admission/applicants/:id/review (Approval)...');
  const reviewRes = await fetch(`${BASE_URL}/admission/applicants/${testApp.id}/review`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      decision: 'APPROVE',
      notes: 'Eligible for Institutional Merit Quota in Computer Science.',
      bypassIncompleteDocs: true,
    }),
  });
  const reviewData = await reviewRes.json();
  if (!reviewData.success) throw new Error(`Review decision failed: ${JSON.stringify(reviewData)}`);
  console.log(`✓ Application approved! Status: ${reviewData.data.status}, Stage: ${reviewData.data.stage}`);

  // 9. Test Generating Admission Offer
  console.log('\n9. Testing POST /admission/applicants/:id/offer (Offer Letter Generation)...');
  const offerRes = await fetch(`${BASE_URL}/admission/applicants/${testApp.id}/offer`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      validUntil: '2026-10-31',
      conditions: 'Provisional allocation subject to tuition installment payment.',
    }),
  });
  const offerData = await offerRes.json();
  if (!offerData.success) throw new Error(`Offer generation failed: ${JSON.stringify(offerData)}`);
  console.log(`✓ Provisional offer letter dispatched! Message: ${offerData.message}`);

  // 10. Test Candidate Responding to Offer (Accept)
  console.log('\n10. Testing POST /admission/applicants/:id/offer/respond (Candidate Accept)...');
  const respondRes = await fetch(`${BASE_URL}/admission/applicants/${testApp.id}/offer/respond`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ action: 'ACCEPT' }),
  });
  const respondData = await respondRes.json();
  if (!respondData.success) throw new Error(`Offer response failed: ${JSON.stringify(respondData)}`);
  console.log(`✓ Candidate accepted offer! Stage: ${respondData.data.stage}`);

  // 11. Test Confirming Admission Fee
  console.log('\n11. Testing POST /admission/applicants/:id/fee-confirm (Fee Payment)...');
  const feeRes = await fetch(`${BASE_URL}/admission/applicants/${testApp.id}/fee-confirm`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 40000,
      receiptRef: `UTR-TEST-${Date.now()}`,
      paymentMode: 'Online Transfer (NEFT/RTGS)',
      remarks: 'First semester tuition fee credited to institutional account.',
    }),
  });
  const feeData = await feeRes.json();
  if (!feeData.success) throw new Error(`Fee confirmation failed: ${JSON.stringify(feeData)}`);
  console.log(`✓ Fee confirmed! Status: ${feeData.data.feeStatus}, Receipt: ${feeData.data.feeReceiptRef}, Stage: ${feeData.data.stage}`);

  // 12. Test Final Institutional Enrollment & Account Provisioning
  console.log('\n12. Testing POST /admission/applicants/:id/enroll (Atomic Enrollment)...');
  const enrollRes = await fetch(`${BASE_URL}/admission/applicants/${testApp.id}/enroll`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ semester: 'Semester 1', section: 'Section A' }),
  });
  const enrollData = await enrollRes.json();
  if (!enrollData.success) throw new Error(`Enrollment failed: ${JSON.stringify(enrollData)}`);
  console.log('✓ ATOMIC ENROLLMENT SUCCEEDED!');
  console.log('  Student Registration ID:', enrollData.data.studentId);
  console.log('  Institutional Roll Number:', enrollData.data.rollNumber);
  console.log('  User Login ID:', enrollData.data.loginId);
  console.log('  Activation Token Issued:', enrollData.data.activationToken ? 'Yes' : 'No');
  console.log('  Activation URL:', enrollData.data.activationUrl);

  // 13. Test Deadlines & Notices
  console.log('\n13. Testing Deadlines & Notices APIs...');
  const dlRes = await fetch(`${BASE_URL}/admission/deadlines`, { headers: authHeaders });
  const dlData = await dlRes.json();
  console.log(`✓ Retrieved ${dlData.data.length} admission deadlines.`);

  const noticeRes = await fetch(`${BASE_URL}/admission/notices`, { headers: authHeaders });
  const noticeData = await noticeRes.json();
  console.log(`✓ Retrieved ${noticeData.data.length} official admission circulars.`);

  // 14. Test Merit List
  console.log('\n14. Testing GET /admission/merit-list...');
  const meritRes = await fetch(`${BASE_URL}/admission/merit-list`, { headers: authHeaders });
  const meritData = await meritRes.json();
  console.log(`✓ Merit list generated with ${meritData.data.totalCandidates} ranked candidates.`);
  console.log(`  Top Candidate: ${meritData.data.meritList[0].name} (Merit Score: ${meritData.data.meritList[0].meritScore})`);

  console.log('\n======================================================');
  console.log('🎉 ALL 14 ADMISSION WORKFLOW VERIFICATION TESTS PASSED!');
  console.log('======================================================\n');
}

testAdmissionWorkflows().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
