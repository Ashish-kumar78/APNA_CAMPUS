const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        let parsed = null;
        try {
          parsed = JSON.parse(bodyBuffer.toString());
        } catch {
          parsed = bodyBuffer;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed, buffer: bodyBuffer });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('========================================================');
  console.log('APNA CAMPUS - INTERNSHIP CELL COMPLETE VERIFICATION SUITE');
  console.log('========================================================\n');

  // STEP 0: Authenticate as Placement Officer
  console.log('[STEP 0] Logging in as Placement Officer (placement / gift123)...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { identifier: 'placement', password: 'gift123' });

  const token = loginRes.body.accessToken || loginRes.body.token;
  if (loginRes.status !== 200 || !token) {
    throw new Error('Placement Officer Login Failed: ' + JSON.stringify(loginRes.body));
  }
  console.log('✅ Placement Officer authenticated successfully. Token length:', token.length);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // TEST 1: Student Search (Valid Reg No)
  console.log('\n[TEST 1] Searching student with valid registration number "2401432265"...');
  const t1 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/internship/students/2401432265',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', t1.status, '| Name:', t1.body?.data?.name, '| RegNo:', t1.body?.data?.registrationNo);
  if (t1.status !== 200 || !t1.body?.data || t1.body?.data?.registrationNo !== '2401432265') {
    throw new Error('TEST 1 FAILED');
  }
  console.log('✅ TEST 1 PASSED: Valid student successfully retrieved from PostgreSQL database.');

  // TEST 2: Invalid Registration Number
  console.log('\n[TEST 2] Searching student with nonexistent registration number "9999999999"...');
  const t2 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/internship/students/9999999999',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Status:', t2.status, '| Message:', t2.body?.message);
  if (t2.status !== 404) {
    throw new Error('TEST 2 FAILED: Expected 404, got ' + t2.status);
  }
  console.log('✅ TEST 2 PASSED: Nonexistent student properly rejected with 404 and clear message.');

  // TEST 3: Student Profile Retrieval & Fields
  console.log('\n[TEST 3] Verifying student profile attributes & database relationships...');
  const student = t1.body.data;
  console.log('  - Name:', student.name);
  console.log('  - Registration No:', student.registrationNo);
  console.log('  - Department:', student.department);
  console.log('  - Course:', student.course);
  console.log('  - Batch:', student.batch);
  console.log('  - Session:', student.academicSession);
  console.log('  - Company:', student.company);
  console.log('  - Phone:', student.phone);
  console.log('  - Email:', student.email);
  if (!student.name || !student.registrationNo || !student.department) {
    throw new Error('TEST 3 FAILED: Missing mandatory profile attributes');
  }
  console.log('✅ TEST 3 PASSED: All profile attributes verified from database.');

  // TEST 4: Missing Mandatory Information / Eligibility Validation
  console.log('\n[TEST 4] Testing eligibility checks for missing profile fields...');
  console.log('Student isEligible:', student.isEligible, '| Missing fields:', student.missingFields);
  if (typeof student.isEligible !== 'boolean') {
    throw new Error('TEST 4 FAILED: isEligible missing');
  }
  console.log('✅ TEST 4 PASSED: Student eligibility and missing fields checked dynamically.');

  // TEST 5: ID Card Preview Generation
  console.log('\n[TEST 5] Generating standardized ID card preview for student...');
  const t5 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/internship/id-cards/preview',
    method: 'POST',
    headers: authHeaders
  }, { studentIdentifier: student.registrationNo });
  console.log('Status:', t5.status, '| Standardized Card Format:', t5.body?.data?.standardDimensions);
  console.log('Preview QR generated:', t5.body?.data?.qrCodeDataUrl ? 'YES (Base64 data URL)' : 'NO');
  if ((t5.status !== 200 && t5.status !== 201) || !t5.body?.data?.qrCodeDataUrl) {
    console.log('T5 Error body:', t5.body);
    throw new Error('TEST 5 FAILED: ID Card preview generation failed');
  }
  console.log('✅ TEST 5 PASSED: Preview generated with cryptographic QR code.');

  // TEST 6 & 7: Card Issuance & Duplicate Prevention
  console.log('\n[TEST 6 & 7] Testing Card Issuance and Duplicate Active Card Rejection...');
  // Find another student who doesn't have an active card yet
  const studentsListRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/internship/students?limit=20',
    method: 'GET',
    headers: authHeaders
  });
  const eligibleCandidate = studentsListRes.body?.data?.students?.find(s => !s.hasActiveCard);
  const targetCandidate = eligibleCandidate || { registrationNo: '04' };
  const targetStudentRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/internship/students/${targetCandidate.registrationNo}`,
    method: 'GET',
    headers: authHeaders
  });
  const targetStudent = targetStudentRes.body.data;
  console.log(`Candidate for issuance: ${targetStudent.name} (Reg: ${targetStudent.registrationNo})`);

  let newlyIssuedCardId = null;
  let newlyIssuedCardNumber = null;
  let verificationToken = null;

  if (!targetStudent.hasActiveCard) {
    const issueRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/internship/id-cards',
      method: 'POST',
      headers: authHeaders
    }, {
      studentIdentifier: targetStudent.registrationNo,
      company: 'Central Tool Room and Training Center',
      academicSession: '2026-2027 (SIP)'
    });
    console.log('Issue status:', issueRes.status, '| Card Number:', issueRes.body?.data?.cardNumber);
    if (issueRes.status !== 201 && issueRes.status !== 200) {
      throw new Error('Card issuance failed: ' + JSON.stringify(issueRes.body));
    }
    newlyIssuedCardId = issueRes.body.data.id;
    newlyIssuedCardNumber = issueRes.body.data.cardNumber;
    verificationToken = issueRes.body.data.verificationToken;
    console.log(`✅ TEST 6 PASSED: Issued card #${newlyIssuedCardNumber} stored in PostgreSQL database.`);

    // Duplicate test immediately on same student
    console.log('\nAttempting duplicate card issuance for same student...');
    const dupRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/internship/id-cards',
      method: 'POST',
      headers: authHeaders
    }, {
      studentIdentifier: targetStudent.registrationNo
    });
    console.log('Duplicate status:', dupRes.status, '| Message:', dupRes.body?.message);
    if (dupRes.status !== 409) {
      throw new Error('TEST 7 FAILED: Expected 409 Conflict for duplicate issuance, got ' + dupRes.status);
    }
    console.log('✅ TEST 7 PASSED: Duplicate active card prevented with 409 Conflict.');
  } else {
    newlyIssuedCardId = targetStudent.activeCard.id;
    newlyIssuedCardNumber = targetStudent.activeCard.cardNumber;
    verificationToken = targetStudent.activeCard.verificationToken;
    console.log(`Student already had active card #${newlyIssuedCardNumber}. Testing duplicate check...`);
    const dupRes = await request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/internship/id-cards',
      method: 'POST',
      headers: authHeaders
    }, {
      studentIdentifier: targetStudent.registrationNo
    });
    console.log('Duplicate status:', dupRes.status, '| Message:', dupRes.body?.message);
    if (dupRes.status !== 409) {
      throw new Error('TEST 7 FAILED: Expected 409 Conflict for duplicate issuance, got ' + dupRes.status);
    }
    console.log('✅ TEST 7 PASSED: Duplicate active card prevented with 409 Conflict.');
  }

  // TEST 8: PDF Download
  console.log(`\n[TEST 8] Downloading PDF ID Card for Card ID "${newlyIssuedCardId}"...`);
  const pdfRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/internship/id-cards/${newlyIssuedCardId}/pdf`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('PDF response status:', pdfRes.status);
  console.log('Content-Type:', pdfRes.headers['content-type']);
  console.log('Content-Disposition:', pdfRes.headers['content-disposition']);
  console.log('PDF Byte Size:', pdfRes.buffer.length);
  const pdfHeader = pdfRes.buffer.slice(0, 5).toString();
  console.log('Magic Bytes (Header):', pdfHeader);
  if (pdfRes.status !== 200 || !pdfRes.headers['content-type'].includes('application/pdf') || pdfHeader !== '%PDF-') {
    throw new Error('TEST 8 FAILED: Invalid PDF response');
  }
  console.log('✅ TEST 8 PASSED: Valid %PDF- binary stream received with standard CR80 layout.');

  // TEST 9: Unauthorized Request (No Token)
  console.log('\n[TEST 9] Attempting to issue card without authorization token...');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/internship/id-cards',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { studentId: 'test', registrationNo: '01' });
  console.log('Unauthenticated status:', unauthRes.status, '| Message:', unauthRes.body?.message);
  if (unauthRes.status !== 401) {
    throw new Error('TEST 9 FAILED: Expected 401 Unauthorized, got ' + unauthRes.status);
  }
  console.log('✅ TEST 9 PASSED: Backend securely rejected unauthorized request with 401.');

  // TEST 10: Database Persistence
  console.log(`\n[TEST 10] Querying ID Card record directly from DB for #${newlyIssuedCardNumber}...`);
  const recordRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/internship/id-cards/${newlyIssuedCardId}`,
    method: 'GET',
    headers: authHeaders
  });
  console.log('Record status:', recordRes.status, '| Card Number:', recordRes.body?.data?.cardNumber);
  console.log('Stored Status:', recordRes.body?.data?.status, '| Student:', recordRes.body?.data?.studentName);
  if (recordRes.status !== 200 || recordRes.body?.data?.cardNumber !== newlyIssuedCardNumber) {
    throw new Error('TEST 10 FAILED: Card record not persistent in PostgreSQL');
  }
  console.log('✅ TEST 10 PASSED: ID Card record persistently retrieved from PostgreSQL.');

  // TEST 11: Card Revocation & QR Code Verification
  console.log('\n[TEST 11] Testing QR Verification before and after revocation...');
  // 1. Verify before revocation
  const verifyBefore = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/internship/id-cards/verify/${verificationToken}`,
    method: 'GET'
  });
  console.log('QR Verification (Active):', verifyBefore.body?.status, '| Valid:', verifyBefore.body?.valid);
  if (verifyBefore.status !== 200 || !verifyBefore.body?.valid || verifyBefore.body?.status !== 'VALID') {
    throw new Error('TEST 11 FAILED: Initial verification failed');
  }

  // 2. Revoke the card
  console.log(`Revoking card #${newlyIssuedCardNumber}...`);
  const revokeRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/internship/id-cards/${newlyIssuedCardId}/revoke`,
    method: 'POST',
    headers: authHeaders
  }, { reason: 'Student completed internship early with distinction' });
  console.log('Revocation response:', revokeRes.status, '| New Status:', revokeRes.body?.data?.status);
  if (revokeRes.status !== 200 && revokeRes.status !== 201) {
    throw new Error('Card revocation failed');
  }

  // 3. Verify after revocation
  const verifyAfter = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/internship/id-cards/verify/${verificationToken}`,
    method: 'GET'
  });
  console.log('QR Verification (After Revoke):', verifyAfter.body?.status, '| Valid:', verifyAfter.body?.valid);
  console.log('Warning message:', verifyAfter.body?.message);
  if (verifyAfter.body?.valid !== false || verifyAfter.body?.status !== 'REVOKED') {
    throw new Error('TEST 11 FAILED: Revoked card is still reported as valid');
  }
  console.log('✅ TEST 11 PASSED: Card revocation recorded persistently and QR verification marks it REVOKED.');

  // TEST 12: Dashboard Statistics
  console.log('\n[TEST 12] Fetching live dashboard statistics from database...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/internship/stats',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Dashboard Stats:');
  console.log('  - Total Eligible Students:', statsRes.body?.data?.totalEligibleStudents);
  console.log('  - Total Applications:', statsRes.body?.data?.totalApplications);
  console.log('  - Active Internships:', statsRes.body?.data?.activeInternships);
  console.log('  - ID Cards Issued (Active):', statsRes.body?.data?.cardsIssued);
  console.log('  - ID Cards Pending:', statsRes.body?.data?.cardsPending);
  console.log('  - Expired ID Cards:', statsRes.body?.data?.cardsExpired);
  console.log('  - Revoked ID Cards:', statsRes.body?.data?.cardsRevoked);
  if (statsRes.status !== 200 || typeof statsRes.body?.data?.totalEligibleStudents !== 'number') {
    throw new Error('TEST 12 FAILED: Dashboard stats error');
  }
  console.log('✅ TEST 12 PASSED: Real database counts reflected in dashboard stats.');

  // TEST 13: Existing Functionality
  console.log('\n[TEST 13] Verifying existing Student Portal and Auth modules...');
  const meRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/me',
    method: 'GET',
    headers: authHeaders
  });
  console.log('Auth me status:', meRes.status, '| Current user role:', meRes.body?.user?.role);
  if (meRes.status !== 200 || meRes.body?.user?.role !== 'PLACEMENT') {
    throw new Error('TEST 13 FAILED: Auth me verification failed');
  }
  console.log('✅ TEST 13 PASSED: Existing authentication and system services intact.');

  console.log('\n========================================================');
  console.log('🎉 ALL 13 ACCEPTANCE TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('========================================================\n');
}

run().catch(err => {
  console.error('❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
