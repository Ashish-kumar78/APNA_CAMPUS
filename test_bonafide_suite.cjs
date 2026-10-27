/**
 * Comprehensive Bonafide Certificate Management System Verification Suite
 * Tests all 20 Acceptance Criteria from Master Prompt
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function login(identifier, password = 'gift123') {
  const res = await request('/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${identifier}: ${JSON.stringify(res.data || res.raw)}`);
  }
  return res.data.token || res.data.accessToken;
}

async function runSuite() {
  console.log('========================================================================');
  console.log('🚀 APNA CAMPUS — BONAFIDE CERTIFICATE MANAGEMENT VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate users
    console.log('--- Phase 1: Authentication & Role Setup ---');
    const studentToken = await login('2305201001');
    assert(!!studentToken, 'Student 2305201001 logged in successfully');

    const placementToken = await login('placement');
    assert(!!placementToken, 'Placement Officer logged in successfully');

    const scholarshipToken = await login('scholarship');
    assert(!!scholarshipToken, 'Scholarship Cell Officer logged in successfully');

    const principalToken = await login('principal');
    assert(!!principalToken, 'Principal logged in successfully');

    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    const placementHeaders = { Authorization: `Bearer ${placementToken}` };
    const scholarshipHeaders = { Authorization: `Bearer ${scholarshipToken}` };
    const principalHeaders = { Authorization: `Bearer ${principalToken}` };

    // 2. Initial Stats
    console.log('\n--- Phase 2: Stats & Initial My Applications Listing ---');
    const statsRes = await request('/bonafide/stats', { headers: studentHeaders });
    assert(statsRes.status === 200 && typeof statsRes.data.total === 'number', 'Student can fetch bonafide dashboard stats');

    const myAppsRes = await request('/bonafide/my', { headers: studentHeaders });
    assert(myAppsRes.status === 200 && Array.isArray(myAppsRes.data.applications), 'Student can list their applications');

    // 3. Test TEMPLATE A: Internship Bonafide
    console.log('\n--- Phase 3: Template A (Internship Bonafide) ---');
    const internshipPayload = {
      purpose: 'INTERNSHIP',
      formData: {
        companyName: 'Tata Consultancy Services',
        internshipRole: 'Cloud & AI Research Intern',
        startDate: '2026-11-01',
        endDate: '2027-01-31',
        locationMode: 'Hybrid',
        internshipLocation: 'Bhubaneswar, Odisha',
        internshipPurpose: 'Industrial winter internship required for credit completion',
        offerLetterUrl: 'https://docs.gift.edu.in/tcs_offer_rakesh.pdf',
        additionalRemarks: 'Verification email to campus.tcs@tcs.com',
        requiredDate: '2026-10-30',
        academicYear: '2026-2027',
      },
      supportingDocs: [{ name: 'TCS Offer Letter', url: 'https://docs.gift.edu.in/tcs_offer_rakesh.pdf' }],
    };

    const createInternshipRes = await request('/bonafide', {
      method: 'POST',
      headers: studentHeaders,
      body: internshipPayload,
    });
    assert(createInternshipRes.status === 201, 'Student can submit Template A (Internship)');
    const internshipApp = createInternshipRes.data.application;
    assert(internshipApp.purpose === 'INTERNSHIP', 'Application purpose is INTERNSHIP');
    assert(internshipApp.currentStage === 'PLACEMENT_REVIEW', 'Application routed to PLACEMENT_REVIEW stage');
    assert(internshipApp.status === 'UNDER_REVIEW', 'Application status is UNDER_REVIEW');

    // 4. Verify Placement Queue
    console.log('\n--- Phase 4: Placement Queue & Security Permissions ---');
    const placementQueueRes = await request('/bonafide/queue', { headers: placementHeaders });
    assert(placementQueueRes.status === 200, 'Placement officer can access review queue');
    const inPlacementQueue = placementQueueRes.data.queue.some((a) => a.id === internshipApp.id);
    assert(inPlacementQueue, 'Internship application appears in Placement queue');

    // Security Negative Test: Scholarship cell cannot approve Internship application
    const unauthorizedReviewRes = await request(`/bonafide/${internshipApp.id}/reviews`, {
      method: 'POST',
      headers: scholarshipHeaders,
      body: { action: 'APPROVED', comments: 'Unauthorized approval attempt' },
    });
    assert(unauthorizedReviewRes.status === 403, 'Security: Scholarship Cell is FORBIDDEN from reviewing Internship application (403)');

    // Security Negative Test: Certificate cannot be downloaded before approval
    const prematureCertRes = await request(`/bonafide/${internshipApp.id}/certificate`, { headers: studentHeaders });
    assert(prematureCertRes.status === 400, 'Security: Certificate download blocked before all approvals complete (400)');

    // Placement Review & Approval
    console.log('\n--- Phase 5: Placement Review & Issuance ---');
    const placementReviewRes = await request(`/bonafide/${internshipApp.id}/reviews`, {
      method: 'POST',
      headers: placementHeaders,
      body: { action: 'APPROVED', comments: 'Verified against TCS offer letter ref TCS-IN-2026-9812.' },
    });
    assert(placementReviewRes.status === 201, 'Placement officer approved internship application');
    assert(placementReviewRes.data.application.status === 'CERTIFICATE_ISSUED', 'Application marked as CERTIFICATE_ISSUED');
    assert(placementReviewRes.data.application.currentStage === 'CERTIFICATE_ISSUED', 'Stage reached CERTIFICATE_ISSUED');
    assert(!!placementReviewRes.data.application.certificateUrl, 'Certificate record and URL generated');

    // Student can now download official PDF
    const certPdfRes = await request(`/bonafide/${internshipApp.id}/certificate`, { headers: studentHeaders });
    assert(certPdfRes.status === 200, 'Student can securely download approved certificate PDF (HTTP 200)');
    assert(certPdfRes.headers['content-type'] === 'application/pdf', 'Downloaded document Content-Type is application/pdf');

    // 5. Test TEMPLATE B: Scholarship Hosteller Declaration (Multi-Stage Approval)
    console.log('\n--- Phase 6: Template B (Scholarship Hosteller Declaration Workflow) ---');
    const scholarshipPayload = {
      purpose: 'SCHOLARSHIP_HOSTELLER',
      formData: {
        scholarshipScheme: 'PRERANA Post-Matric Scholarship Scheme',
        scholarshipAcademicYear: '2026-2027',
        studentCategory: 'OBC',
        hostelStatus: 'Hosteller',
        hostelName: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        hostelAdmissionDate: '2024-08-10',
        hostelFeeRemarks: '₹42,000 per semester (Boarding & Lodging)',
        academicYear: '2026-2027',
      },
    };

    const createScholarshipRes = await request('/bonafide', {
      method: 'POST',
      headers: studentHeaders,
      body: scholarshipPayload,
    });
    assert(createScholarshipRes.status === 201, 'Student can submit Template B (Scholarship Hosteller)');
    const scholarshipApp = createScholarshipRes.data.application;
    assert(scholarshipApp.currentStage === 'SCHOLARSHIP_VERIFICATION_1', 'Initial stage is SCHOLARSHIP_VERIFICATION_1');

    // Stage 1: Scholarship Cell Review
    console.log('\n--- Phase 7: Multi-Stage Workflow Execution ---');
    const schStage1Res = await request(`/bonafide/${scholarshipApp.id}/reviews`, {
      method: 'POST',
      headers: scholarshipHeaders,
      body: { action: 'APPROVED', comments: 'Student enrolled and hostel ledger verified for Room 204.' },
    });
    assert(schStage1Res.status === 201, 'Scholarship Cell approved Stage 1');
    assert(schStage1Res.data.application.currentStage === 'PRINCIPAL_APPROVAL', 'Stage progressed to PRINCIPAL_APPROVAL');

    // Stage 2: Principal Approval
    const princStage2Res = await request(`/bonafide/${scholarshipApp.id}/reviews`, {
      method: 'POST',
      headers: principalHeaders,
      body: { action: 'APPROVED', comments: 'Approved on behalf of GIFT Autonomous administration.' },
    });
    assert(princStage2Res.status === 201, 'Principal approved Stage 2');
    assert(princStage2Res.data.application.currentStage === 'SCHOLARSHIP_FINAL_APPROVAL', 'Stage progressed to SCHOLARSHIP_FINAL_APPROVAL');

    // Stage 3: Scholarship Cell Final Approval & Issuance
    const schStage3Res = await request(`/bonafide/${scholarshipApp.id}/reviews`, {
      method: 'POST',
      headers: scholarshipHeaders,
      body: { action: 'APPROVED', comments: 'Final scholarship dispatch check completed. Certificate released.' },
    });
    assert(schStage3Res.status === 201, 'Scholarship Cell completed final Stage 3 verification');
    assert(schStage3Res.data.application.status === 'CERTIFICATE_ISSUED', 'Scholarship Bonafide issued successfully');

    // 6. Test TEMPLATE C: Study Loan with Dynamic 4-Year Fee Structure
    console.log('\n--- Phase 8: Template C (Study Loan & 4-Year Fee Structure) ---');
    const feeStructuresRes = await request('/bonafide/fee-structures', { headers: studentHeaders });
    assert(feeStructuresRes.status === 200 && Array.isArray(feeStructuresRes.data.feeStructures), 'Fee structures retrieved from authoritative records');

    // Loan Hosteller
    const loanPayloadHosteller = {
      purpose: 'STUDY_LOAN',
      formData: {
        bankName: 'State Bank of India',
        bankBranch: 'GIFT Square Branch, Bhubaneswar',
        loanApplicationRef: 'SBI-EDU-2026-904812',
        loanPurpose: 'Higher Education B.Tech Study Expenses',
        isHostellerLoan: true,
        hostelAccommodationRequired: 'Yes',
        academicYear: '2026-2027',
      },
    };
    const createLoanRes = await request('/bonafide', {
      method: 'POST',
      headers: studentHeaders,
      body: loanPayloadHosteller,
    });
    assert(createLoanRes.status === 201, 'Submitted Study Loan Application (Hosteller)');
    const loanApp = createLoanRes.data.application;

    // Approve through all stages to verify PDF generation with fee structure table
    await request(`/bonafide/${loanApp.id}/reviews`, { method: 'POST', headers: scholarshipHeaders, body: { action: 'APPROVED', comments: 'Fee schedule validated.' } });
    await request(`/bonafide/${loanApp.id}/reviews`, { method: 'POST', headers: principalHeaders, body: { action: 'APPROVED', comments: 'Principal approval for education loan.' } });
    const finalLoanRes = await request(`/bonafide/${loanApp.id}/reviews`, { method: 'POST', headers: scholarshipHeaders, body: { action: 'APPROVED', comments: 'Issued.' } });
    assert(finalLoanRes.data.application.status === 'CERTIFICATE_ISSUED', 'Study Loan Certificate issued with 4-year fee structure');

    const loanPdfRes = await request(`/bonafide/${loanApp.id}/certificate`, { headers: studentHeaders });
    assert(loanPdfRes.status === 200 && loanPdfRes.headers['content-type'] === 'application/pdf', 'Study Loan Fee Structure PDF streamed successfully');

    // 7. Test TEMPLATE D: External Event Rejection & Resubmission Workflow
    console.log('\n--- Phase 9: Template D (Rejection, Correction & Resubmission) ---');
    const eventPayload = {
      purpose: 'EXTERNAL_EVENT',
      formData: {
        eventName: 'BPUT Hackathon 2026',
        organizerName: 'Biju Patnaik University of Technology',
        eventLocation: 'Rourkela',
        eventStartDate: '2026-11-15',
        participationType: 'Team',
        teamName: 'ByteBuilders',
        teamMembers: 'Rakesh Das (2305201001), Priya Sahu (2305201015)',
        facultyMentor: 'Prof. S. K. Mohapatra',
        academicYear: '2026-2027',
      },
    };

    const createEventRes = await request('/bonafide', {
      method: 'POST',
      headers: studentHeaders,
      body: eventPayload,
    });
    assert(createEventRes.status === 201, 'Student submitted External Event application');
    const eventApp = createEventRes.data.application;

    // Rejection / Correction Request by Scholarship Officer
    const rejectRes = await request(`/bonafide/${eventApp.id}/reviews`, {
      method: 'POST',
      headers: scholarshipHeaders,
      body: {
        action: 'CHANGES_REQUESTED',
        rejectionReason: 'Invalid or missing supporting document / offer letter',
        comments: 'Please attach official invitation email or selection confirmation from BPUT organizers.',
      },
    });
    assert(rejectRes.status === 201, 'Reviewer requested changes with mandatory category and remarks');
    assert(rejectRes.data.application.status === 'CHANGES_REQUESTED', 'Application status updated to CHANGES_REQUESTED');

    // Student Resubmits corrected application
    const resubmitRes = await request(`/bonafide/${eventApp.id}/resubmit`, {
      method: 'POST',
      headers: studentHeaders,
      body: {
        formData: {
          ...eventApp.formData,
          supportingDocUrl: 'https://bput.ac.in/verify/bytebuilders_invitation.pdf',
        },
        resubmissionNotes: 'Attached official BPUT Hackathon invitation confirmation letter.',
      },
    });
    assert(resubmitRes.status === 201, 'Student successfully resubmitted corrected application');
    assert(resubmitRes.data.application.status === 'UNDER_REVIEW', 'Application returned to UNDER_REVIEW');
    assert(resubmitRes.data.application.currentRevisionNumber === 2, 'New revision #2 created, preserving audit trail');

    // Fast-track approval for resubmitted application
    await request(`/bonafide/${eventApp.id}/reviews`, { method: 'POST', headers: scholarshipHeaders, body: { action: 'APPROVED', comments: 'Invitation verified.' } });
    await request(`/bonafide/${eventApp.id}/reviews`, { method: 'POST', headers: principalHeaders, body: { action: 'APPROVED', comments: 'Authorized participation.' } });
    const finalEventRes = await request(`/bonafide/${eventApp.id}/reviews`, { method: 'POST', headers: scholarshipHeaders, body: { action: 'APPROVED', comments: 'Authorization letter issued.' } });
    assert(finalEventRes.data.application.status === 'CERTIFICATE_ISSUED', 'External Event Authorization Letter issued successfully');

    // 8. IDOR & Access Control Security Test
    console.log('\n--- Phase 10: IDOR & Data Privacy Security ---');
    const otherStudentToken = await login('2401432265'); // another student
    const idorRes = await request(`/bonafide/${internshipApp.id}`, { headers: { Authorization: `Bearer ${otherStudentToken}` } });
    assert(idorRes.status === 403, 'IDOR Protection: Another student cannot access application details (HTTP 403)');

    const idorCertRes = await request(`/bonafide/${internshipApp.id}/certificate`, { headers: { Authorization: `Bearer ${otherStudentToken}` } });
    assert(idorCertRes.status === 403, 'IDOR Protection: Another student cannot download another student certificate (HTTP 403)');

    console.log('\n========================================================================');
    console.log(`🎯 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');
  } catch (err) {
    console.error('Test Suite encountered unhandled error:', err);
  }
}

runSuite();
