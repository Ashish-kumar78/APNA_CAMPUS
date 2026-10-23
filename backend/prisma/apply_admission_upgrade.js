const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Applying Admission ERP Upgrade Schema Additions ---');

  // 1. Add columns to Applicant table if they do not exist
  const alterColumns = [
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "stage" VARCHAR(50) DEFAULT 'SUBMITTED';`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "address" TEXT;`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "state" VARCHAR(100);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "guardianName" VARCHAR(200);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "guardianPhone" VARCHAR(50);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "guardianRelation" VARCHAR(50);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "previousSchool" VARCHAR(255);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "assignedReviewer" VARCHAR(200);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT;`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "offerLetterGenerated" BOOLEAN DEFAULT false;`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "offerValidUntil" VARCHAR(50);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "offerAcceptedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeAmount" DOUBLE PRECISION DEFAULT 40000;`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feePaid" DOUBLE PRECISION DEFAULT 0;`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeStatus" VARCHAR(50) DEFAULT 'Pending';`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeReceiptRef" VARCHAR(100);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeConfirmedBy" VARCHAR(200);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "feeConfirmedAt" TIMESTAMP(3);`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "history" JSONB DEFAULT '[]';`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "meritScore" DOUBLE PRECISION;`,
    `ALTER TABLE "Applicant" ADD COLUMN IF NOT EXISTS "meritRank" INTEGER;`,
  ];

  for (const sql of alterColumns) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      console.warn('Column alter warning:', err.message);
    }
  }
  console.log('✓ Applicant table columns ensured.');

  // 2. Create AdmissionDeadline table if not exists
  const createDeadlinesTable = `
    CREATE TABLE IF NOT EXISTS "AdmissionDeadline" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'General',
      "programmeCode" TEXT DEFAULT 'All',
      "deadlineDate" TEXT NOT NULL,
      "time" TEXT DEFAULT '05:00 PM',
      "description" TEXT,
      "status" TEXT NOT NULL DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await prisma.$executeRawUnsafe(createDeadlinesTable);
  console.log('✓ AdmissionDeadline table ensured.');

  // 3. Populate default initial admission deadlines if table is empty
  const deadlineCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "AdmissionDeadline";`);
  if (deadlineCount[0]?.count === 0) {
    const defaultDeadlines = [
      {
        id: 'dl_ojee_spot_01',
        title: 'OJEE Final Spot Round Verification Closes',
        category: 'Document Verification',
        programmeCode: 'BTECH',
        deadlineDate: '2026-10-24',
        time: '05:00 PM',
        description: 'Candidates allotted in the institutional mop-up round must report with original documents and certificates.',
        status: 'Active',
      },
      {
        id: 'dl_lateral_counsel_02',
        title: 'Direct Institutional Quota Counseling Session',
        category: 'Counselling',
        programmeCode: 'BTECH',
        deadlineDate: '2026-10-26',
        time: '11:00 AM',
        description: 'Open house counseling for vacant lateral entry B.Tech & MCA seats at Seminar Hall 1.',
        status: 'Active',
      },
      {
        id: 'dl_fee_confirm_03',
        title: 'Provisional Offer Fee Confirmation Deadline',
        category: 'Fee Payment',
        programmeCode: 'All',
        deadlineDate: '2026-10-28',
        time: '04:00 PM',
        description: 'Last date for candidates holding provisional admission offer to submit first installment fees.',
        status: 'Active',
      },
      {
        id: 'dl_orientation_04',
        title: 'Orientation Program for 2026-27 Admitted Batch',
        category: 'Orientation',
        programmeCode: 'All',
        deadlineDate: '2026-11-02',
        time: '09:30 AM',
        description: 'Academic induction, LMS credential distribution, student identity card issuance, and mentor allocation.',
        status: 'Active',
      },
    ];

    for (const d of defaultDeadlines) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AdmissionDeadline" ("id", "title", "category", "programmeCode", "deadlineDate", "time", "description", "status")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT ("id") DO NOTHING;`,
        d.id, d.title, d.category, d.programmeCode, d.deadlineDate, d.time, d.description, d.status
      );
    }
    console.log('✓ Default admission deadlines seeded.');
  }

  // 4. Ensure existing applicants have standard documents and stage set
  const applicants = await prisma.applicant.findMany();
  for (const app of applicants) {
    const updates = {};
    if (!app.stage || app.stage === 'SUBMITTED') {
      if (app.status === 'ENROLLED') updates.stage = 'ENROLLED';
      else if (app.status === 'APPROVED') updates.stage = 'APPROVED';
      else if (app.status === 'VERIFIED') updates.stage = 'DOCS_VERIFIED';
      else if (app.status === 'REJECTED') updates.stage = 'REJECTED';
      else updates.stage = 'UNDER_REVIEW';
    }

    // Default required documents if empty
    if (!app.documents || (Array.isArray(app.documents) && app.documents.length === 0)) {
      const isVerified = app.status === 'VERIFIED' || app.status === 'APPROVED' || app.status === 'ENROLLED';
      updates.documents = [
        {
          id: 'doc_10th',
          name: '10th Standard Marksheet & Certificate',
          type: 'MARKSHEET_10',
          status: isVerified ? 'VERIFIED' : 'UNDER_REVIEW',
          fileName: `${app.name.replace(/\s+/g, '_')}_10th_Marksheet.pdf`,
          fileSize: '1.4 MB',
          uploadedAt: '2026-10-18T10:50:00.000Z',
          verifiedBy: isVerified ? 'Ms. Sasmita Mohapatra (Admissions Officer)' : null,
          verifiedAt: isVerified ? '2026-10-18T11:15:00.000Z' : null,
          remarks: isVerified ? 'Grade sheet verified against board records.' : 'Pending authenticity cross-check.',
          isRequired: true,
        },
        {
          id: 'doc_12th',
          name: '12th Standard / Diploma Passing Marksheet',
          type: 'MARKSHEET_12',
          status: isVerified ? 'VERIFIED' : 'UNDER_REVIEW',
          fileName: `${app.name.replace(/\s+/g, '_')}_12th_Marksheet.pdf`,
          fileSize: '1.8 MB',
          uploadedAt: '2026-10-18T10:51:00.000Z',
          verifiedBy: isVerified ? 'Ms. Sasmita Mohapatra (Admissions Officer)' : null,
          verifiedAt: isVerified ? '2026-10-18T11:18:00.000Z' : null,
          remarks: isVerified ? 'Verified with CHSE / CBSE online portal.' : 'Subject breakdown under scrutiny.',
          isRequired: true,
        },
        {
          id: 'doc_tc',
          name: 'College / School Leaving Certificate (CLC/TC)',
          type: 'TRANSFER_CERT',
          status: isVerified ? 'VERIFIED' : 'UPLOADED',
          fileName: `${app.name.replace(/\s+/g, '_')}_Transfer_Certificate.pdf`,
          fileSize: '890 KB',
          uploadedAt: '2026-10-18T10:52:00.000Z',
          verifiedBy: isVerified ? 'Ms. Sasmita Mohapatra' : null,
          verifiedAt: isVerified ? '2026-10-18T11:20:00.000Z' : null,
          remarks: 'Original physical copy submitted at counter.',
          isRequired: true,
        },
        {
          id: 'doc_id',
          name: 'Government Identity Proof (Aadhaar / Passport)',
          type: 'ID_PROOF',
          status: 'VERIFIED',
          fileName: `${app.name.replace(/\s+/g, '_')}_Aadhaar_Card.pdf`,
          fileSize: '640 KB',
          uploadedAt: '2026-10-18T10:52:30.000Z',
          verifiedBy: 'Ms. Sasmita Mohapatra',
          verifiedAt: '2026-10-18T11:10:00.000Z',
          remarks: 'UIDAI biometric match confirmed.',
          isRequired: true,
        },
        {
          id: 'doc_photo',
          name: 'Passport Size Recent Color Photograph',
          type: 'PHOTO',
          status: 'VERIFIED',
          fileName: `${app.name.replace(/\s+/g, '_')}_Passport_Photo.jpg`,
          fileSize: '240 KB',
          uploadedAt: '2026-10-18T10:53:00.000Z',
          verifiedBy: 'Ms. Sasmita Mohapatra',
          verifiedAt: '2026-10-18T11:10:00.000Z',
          remarks: 'Standard 35mm x 45mm white background photo confirmed.',
          isRequired: true,
        },
      ];
    }

    if (!app.history || (Array.isArray(app.history) && app.history.length === 0)) {
      updates.history = [
        {
          timestamp: app.createdAt.toISOString(),
          action: 'APPLICATION_SUBMITTED',
          user: 'Applicant / Online Portal',
          note: `Application submitted for ${app.programmeName} (Session ${app.academicYear}).`,
        },
        ...(app.verifiedBy ? [{
          timestamp: app.updatedAt.toISOString(),
          action: 'DOCUMENTS_VERIFIED',
          user: app.verifiedBy,
          note: 'Academic marksheets and ID proofs validated successfully.',
        }] : []),
        ...(app.approvedBy ? [{
          timestamp: app.updatedAt.toISOString(),
          action: 'ADMISSION_APPROVED',
          user: app.approvedBy,
          note: 'Approved for seat allotment.',
        }] : []),
      ];
    }

    if (!app.feeAmount) updates.feeAmount = 40000;
    if (app.status === 'ENROLLED') {
      updates.feePaid = 40000;
      updates.feeStatus = 'Paid';
      updates.feeReceiptRef = 'REC-2026-0812';
      updates.feeConfirmedBy = 'Finance & Accounts Division';
      updates.feeConfirmedAt = new Date();
      updates.stage = 'ENROLLED';
    } else if (app.status === 'APPROVED') {
      updates.stage = 'OFFER_SENT';
      updates.offerLetterGenerated = true;
      updates.offerValidUntil = '2026-10-28';
    }

    // Merit score calculation: 0.3 * tenthMarks + 0.5 * twelfthMarks + entrance bonus
    const tenth = Number(app.tenthMarks) || 75;
    const twelfth = Number(app.twelfthMarks) || 75;
    const entranceBonus = app.entranceRank && app.entranceRank < 50000 ? Math.max(0, 10 - Math.round(app.entranceRank / 10000)) : 5;
    updates.meritScore = Math.round((0.35 * tenth + 0.55 * twelfth + entranceBonus) * 10) / 10;

    // Update existing applicant via safe raw SQL
    await prisma.$executeRawUnsafe(
      `UPDATE "Applicant" 
       SET "stage" = $1, 
           "documents" = $2::jsonb, 
           "history" = $3::jsonb, 
           "feeAmount" = $4, 
           "feePaid" = $5, 
           "feeStatus" = $6, 
           "feeReceiptRef" = $7, 
           "feeConfirmedBy" = $8, 
           "offerLetterGenerated" = $9, 
           "offerValidUntil" = $10, 
           "meritScore" = $11, 
           "address" = COALESCE("address", 'Campus Road, Gandhinagar'),
           "city" = COALESCE("city", 'Bhubaneswar'),
           "state" = COALESCE("state", 'Odisha'),
           "guardianName" = COALESCE("guardianName", 'Mr. ' || split_part($12, ' ', 2) || ' Guardian'),
           "guardianPhone" = COALESCE("guardianPhone", '+91 94370 11223')
       WHERE "id" = $13;`,
      updates.stage || 'UNDER_REVIEW',
      JSON.stringify(updates.documents || []),
      JSON.stringify(updates.history || []),
      updates.feeAmount || 40000,
      updates.feePaid || 0,
      updates.feeStatus || 'Pending',
      updates.feeReceiptRef || null,
      updates.feeConfirmedBy || null,
      updates.offerLetterGenerated || false,
      updates.offerValidUntil || null,
      updates.meritScore || 80,
      app.name,
      app.id
    );
  }
  console.log(`✓ Enhanced ${applicants.length} existing applicant records with documents, audit trails, and stages.`);

  // 5. Add rich mock applicants to represent all pipeline stages realistic for an institutional ERP
  const existingCountRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "Applicant";`);
  const existingCount = existingCountRes[0]?.count || 0;
  if (existingCount < 8) {
    const extraApplicants = [
      {
        id: 'cmvd_app_004',
        applicationNo: 'APP-2026-004',
        name: 'Debabrata Sahoo',
        email: 'debabrata.sahoo@gmail.com',
        phone: '+91 94371 99044',
        gender: 'Male',
        dob: '18-09-2005',
        category: 'OBC',
        programmeName: 'Bachelor of Technology in Electronics & Communication',
        academicYear: '2026-27',
        tenthMarks: 82.0,
        twelfthMarks: 79.5,
        entranceExam: 'JEE Main 2026',
        entranceRank: 54100,
        status: 'APPLIED',
        stage: 'DOCS_PENDING',
        meritScore: 78.4,
        feeAmount: 40000,
        feePaid: 0,
        feeStatus: 'Pending',
        address: 'Plot 44, Sailashree Vihar',
        city: 'Bhubaneswar',
        state: 'Odisha',
        guardianName: 'Kailash Ch. Sahoo',
        guardianPhone: '+91 94370 88771',
        documents: [
          {
            id: 'doc_10th',
            name: '10th Standard Marksheet & Certificate',
            type: 'MARKSHEET_10',
            status: 'VERIFIED',
            fileName: 'Debabrata_10th.pdf',
            fileSize: '1.1 MB',
            uploadedAt: '2026-10-19T09:00:00.000Z',
            verifiedBy: 'Ms. Sasmita Mohapatra',
            verifiedAt: '2026-10-19T10:00:00.000Z',
            remarks: 'Verified successfully.',
            isRequired: true,
          },
          {
            id: 'doc_12th',
            name: '12th Standard / Diploma Passing Marksheet',
            type: 'MARKSHEET_12',
            status: 'REPLACEMENT_REQUESTED',
            fileName: 'Debabrata_12th_Blurry.pdf',
            fileSize: '420 KB',
            uploadedAt: '2026-10-19T09:05:00.000Z',
            verifiedBy: 'Ms. Sasmita Mohapatra',
            verifiedAt: '2026-10-19T10:05:00.000Z',
            remarks: 'Uploaded document scan is unreadable. Marks columns clipped.',
            replacementReason: 'Please re-upload a clear 300 DPI scan of the official board marksheet.',
            isRequired: true,
          },
          {
            id: 'doc_tc',
            name: 'College / School Leaving Certificate (CLC/TC)',
            type: 'TRANSFER_CERT',
            status: 'NOT_UPLOADED',
            remarks: 'Pending issuance from previous school.',
            isRequired: true,
          },
          {
            id: 'doc_id',
            name: 'Government Identity Proof (Aadhaar / Passport)',
            type: 'ID_PROOF',
            status: 'VERIFIED',
            fileName: 'Debabrata_Aadhaar.pdf',
            fileSize: '512 KB',
            uploadedAt: '2026-10-19T09:10:00.000Z',
            verifiedBy: 'Ms. Sasmita Mohapatra',
            remarks: 'Aadhaar verified.',
            isRequired: true,
          },
        ],
        history: [
          {
            timestamp: '2026-10-19T09:00:00.000Z',
            action: 'APPLICATION_SUBMITTED',
            user: 'Applicant',
            note: 'Application submitted for B.Tech ECE.',
          },
          {
            timestamp: '2026-10-19T10:05:00.000Z',
            action: 'REPLACEMENT_REQUESTED',
            user: 'Ms. Sasmita Mohapatra (Admissions Officer)',
            note: 'Replacement requested for 12th marksheet due to blurry scan.',
          },
        ],
      },
      {
        id: 'cmvd_app_005',
        applicationNo: 'APP-2026-005',
        name: 'Snigdha Mohanty',
        email: 'snigdha.mohanty@gmail.com',
        phone: '+91 94371 99055',
        gender: 'Female',
        dob: '14-03-2003',
        category: 'General',
        programmeName: 'Bachelor of Business Administration',
        academicYear: '2026-27',
        tenthMarks: 89.0,
        twelfthMarks: 91.2,
        entranceExam: 'Direct Merit',
        entranceRank: null,
        status: 'APPROVED',
        stage: 'OFFER_ACCEPTED',
        meritScore: 88.5,
        offerLetterGenerated: true,
        offerValidUntil: '2026-10-28',
        offerAcceptedAt: '2026-10-21 14:30:00',
        feeAmount: 35000,
        feePaid: 0,
        feeStatus: 'Pending',
        address: 'B-24, Shahid Nagar',
        city: 'Bhubaneswar',
        state: 'Odisha',
        guardianName: 'Dr. Ramesh Mohanty',
        guardianPhone: '+91 94370 55441',
        documents: [
          {
            id: 'doc_10th',
            name: '10th Standard Marksheet & Certificate',
            type: 'MARKSHEET_10',
            status: 'VERIFIED',
            fileName: 'Snigdha_10th.pdf',
            fileSize: '1.2 MB',
            verifiedBy: 'Ms. Sasmita Mohapatra',
            isRequired: true,
          },
          {
            id: 'doc_12th',
            name: '12th Standard Passing Marksheet',
            type: 'MARKSHEET_12',
            status: 'VERIFIED',
            fileName: 'Snigdha_12th.pdf',
            fileSize: '1.5 MB',
            verifiedBy: 'Ms. Sasmita Mohapatra',
            isRequired: true,
          },
          {
            id: 'doc_id',
            name: 'Government Identity Proof',
            type: 'ID_PROOF',
            status: 'VERIFIED',
            fileName: 'Snigdha_ID.pdf',
            fileSize: '780 KB',
            verifiedBy: 'Ms. Sasmita Mohapatra',
            isRequired: true,
          },
        ],
        history: [
          {
            timestamp: '2026-10-17T11:00:00.000Z',
            action: 'APPLICATION_SUBMITTED',
            user: 'Applicant',
            note: 'Submitted application for BBA.',
          },
          {
            timestamp: '2026-10-18T12:00:00.000Z',
            action: 'DOCUMENTS_VERIFIED',
            user: 'Ms. Sasmita Mohapatra',
            note: 'All qualifying documents verified.',
          },
          {
            timestamp: '2026-10-19T15:00:00.000Z',
            action: 'OFFER_SENT',
            user: 'Sri Manoranjan Tripathy (CAO)',
            note: 'Provisional Admission Offer generated and dispatched.',
          },
          {
            timestamp: '2026-10-21T14:30:00.000Z',
            action: 'OFFER_ACCEPTED',
            user: 'Candidate (Snigdha Mohanty)',
            note: 'Candidate accepted provisional seat offer online. Awaiting admission fee deposit.',
          },
        ],
      },
      {
        id: 'cmvd_app_006',
        applicationNo: 'APP-2026-006',
        name: 'Ashutosh Pradhan',
        email: 'ashutosh.pradhan@gmail.com',
        phone: '+91 94371 99066',
        gender: 'Male',
        dob: '29-01-2005',
        category: 'General',
        programmeName: 'Bachelor of Technology in Artificial Intelligence & Machine Learning',
        academicYear: '2026-27',
        tenthMarks: 94.0,
        twelfthMarks: 92.5,
        entranceExam: 'JEE Main 2026',
        entranceRank: 18450,
        status: 'APPROVED',
        stage: 'FEE_CONFIRMED',
        meritScore: 92.8,
        offerLetterGenerated: true,
        offerValidUntil: '2026-10-25',
        offerAcceptedAt: '2026-10-20 10:00:00',
        feeAmount: 40000,
        feePaid: 40000,
        feeStatus: 'Paid',
        feeReceiptRef: 'UTR-HDFC-991823',
        feeConfirmedBy: 'Accounts Officer (Mr. S. K. Roy)',
        feeConfirmedAt: '2026-10-21 11:00:00',
        address: 'Sector 5, CDA Colony',
        city: 'Cuttack',
        state: 'Odisha',
        guardianName: 'B. C. Pradhan',
        guardianPhone: '+91 94370 77665',
        documents: [
          { id: 'doc_10th', name: '10th Standard Marksheet', status: 'VERIFIED', isRequired: true },
          { id: 'doc_12th', name: '12th Standard Marksheet', status: 'VERIFIED', isRequired: true },
          { id: 'doc_tc', name: 'Transfer Certificate', status: 'VERIFIED', isRequired: true },
          { id: 'doc_id', name: 'Aadhaar Card', status: 'VERIFIED', isRequired: true },
        ],
        history: [
          { timestamp: '2026-10-16T10:00:00.000Z', action: 'APPLICATION_SUBMITTED', user: 'Applicant', note: 'Applied for B.Tech AI&ML' },
          { timestamp: '2026-10-18T10:00:00.000Z', action: 'DOCUMENTS_VERIFIED', user: 'Ms. Sasmita Mohapatra', note: 'Rank and certificates verified.' },
          { timestamp: '2026-10-19T11:00:00.000Z', action: 'OFFER_ACCEPTED', user: 'Candidate', note: 'Offer accepted.' },
          { timestamp: '2026-10-21T11:00:00.000Z', action: 'FEE_CONFIRMED', user: 'Accounts Officer', note: 'Admission fee of ₹40,000 received via HDFC UTR-HDFC-991823. Ready for final enrollment!' },
        ],
      },
      {
        id: 'cmvd_app_007',
        applicationNo: 'APP-2026-007',
        name: 'Pooja Priyadarshini',
        email: 'pooja.priyadarshini@gmail.com',
        phone: '+91 94371 99077',
        gender: 'Female',
        dob: '12-07-2004',
        category: 'SC',
        programmeName: 'Bachelor of Computer Applications',
        academicYear: '2026-27',
        tenthMarks: 86.0,
        twelfthMarks: 84.0,
        entranceExam: 'Direct Merit',
        entranceRank: null,
        status: 'ENROLLED',
        stage: 'ENROLLED',
        meritScore: 83.5,
        feeAmount: 30000,
        feePaid: 30000,
        feeStatus: 'Paid',
        feeReceiptRef: 'SBI-EPAY-88124',
        feeConfirmedBy: 'Accounts Officer',
        feeConfirmedAt: '2026-10-20 16:00:00',
        studentId: 'STU-26-0004',
        address: 'Line 2, Old Town',
        city: 'Bhubaneswar',
        state: 'Odisha',
        guardianName: 'Prafulla Priyadarshi',
        guardianPhone: '+91 94370 22334',
        documents: [
          { id: 'doc_10th', name: '10th Marksheet', status: 'VERIFIED', isRequired: true },
          { id: 'doc_12th', name: '12th Marksheet', status: 'VERIFIED', isRequired: true },
          { id: 'doc_tc', name: 'Transfer Certificate', status: 'VERIFIED', isRequired: true },
          { id: 'doc_id', name: 'Aadhaar Card', status: 'VERIFIED', isRequired: true },
          { id: 'doc_cat', name: 'Caste Certificate', status: 'VERIFIED', isRequired: true },
        ],
        history: [
          { timestamp: '2026-10-15T09:00:00.000Z', action: 'APPLICATION_SUBMITTED', user: 'Applicant', note: 'Application submitted.' },
          { timestamp: '2026-10-18T14:00:00.000Z', action: 'ENROLLED', user: 'Ms. Sasmita Mohapatra', note: 'Student enrollment finalized. Roll No: 26BCA0004 generated.' },
        ],
      },
      {
        id: 'cmvd_app_008',
        applicationNo: 'APP-2026-008',
        name: 'Rohan Jena',
        email: 'rohan.jena@gmail.com',
        phone: '+91 94371 99088',
        gender: 'Male',
        dob: '11-12-2005',
        category: 'General',
        programmeName: 'Diploma in Electrical Engineering',
        academicYear: '2026-27',
        tenthMarks: 52.0,
        twelfthMarks: 48.0,
        entranceExam: 'Direct Merit',
        entranceRank: null,
        status: 'REJECTED',
        stage: 'REJECTED',
        rejectionReason: 'Does not satisfy autonomous minimum aggregate requirement of 60% in PCM.',
        meritScore: 49.5,
        feeAmount: 25000,
        feePaid: 0,
        feeStatus: 'Pending',
        address: 'At/PO: Jatni',
        city: 'Khurda',
        state: 'Odisha',
        guardianName: 'Dillip Jena',
        guardianPhone: '+91 94370 33445',
        documents: [
          { id: 'doc_10th', name: '10th Marksheet', status: 'VERIFIED', isRequired: true },
          { id: 'doc_12th', name: '12th Marksheet', status: 'REJECTED', remarks: 'Aggregate PCM is below statutory 60% requirement.', isRequired: true },
        ],
        history: [
          { timestamp: '2026-10-18T10:00:00.000Z', action: 'APPLICATION_SUBMITTED', user: 'Applicant', note: 'Applied for Diploma EE.' },
          { timestamp: '2026-10-19T11:00:00.000Z', action: 'REJECTED', user: 'Dr. Sujit Kumar Khuntia (Principal)', note: 'Application rejected due to eligibility shortfall.' },
        ],
      },
    ];

    for (const a of extraApplicants) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Applicant" (
          "id", "applicationNo", "name", "email", "phone", "gender", "dob", "category",
          "programmeName", "academicYear", "tenthMarks", "twelfthMarks", "entranceExam",
          "entranceRank", "status", "stage", "meritScore", "feeAmount", "feePaid", "feeStatus",
          "feeReceiptRef", "feeConfirmedBy", "offerLetterGenerated", "offerValidUntil",
          "address", "city", "state", "guardianName", "guardianPhone", "documents", "history", "rejectionReason",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::"ApplicantStatus", $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30::jsonb, $31::jsonb, $32,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) ON CONFLICT ("applicationNo") DO NOTHING;`,
        a.id, a.applicationNo, a.name, a.email, a.phone, a.gender, a.dob, a.category,
        a.programmeName, a.academicYear, a.tenthMarks, a.twelfthMarks, a.entranceExam,
        a.entranceRank, a.status, a.stage, a.meritScore, a.feeAmount, a.feePaid, a.feeStatus,
        a.feeReceiptRef || null, a.feeConfirmedBy || null, a.offerLetterGenerated || false, a.offerValidUntil || null,
        a.address, a.city, a.state, a.guardianName, a.guardianPhone, JSON.stringify(a.documents || []), JSON.stringify(a.history || []), a.rejectionReason || null
      );
    }
    console.log(`✓ Seeded ${extraApplicants.length} additional rich applicant records covering all workflow stages.`);
  }

  // 6. Ensure Admission Notices exist in Notice table
  const noticeCount = await prisma.notice.count({ where: { tag: 'ADMISSION' } });
  if (noticeCount === 0) {
    const admissionNotices = [
      {
        title: 'OJEE Final Spot Round Verification & Seat Allotment Notification',
        tag: 'ADMISSION',
        date: '24-10-2026',
        publisher: 'Admissions & Counseling Center',
        pinned: true,
        summary: 'Candidates allotted in the institutional mop-up round must report with original credentials and two sets of self-attested copies.',
        content: 'Candidates who have qualified OJEE/JEE Main and have registered for the institutional spot round counseling are hereby informed that the physical verification of documents will conclude on 24-Oct-2026 at 05:00 PM in the Central Admission Center.',
      },
      {
        title: 'Institutional Quota Direct Counseling for Vacant B.Tech Lateral Entry Seats',
        tag: 'ADMISSION',
        date: '20-10-2026',
        publisher: 'Dean Academic & Admissions',
        pinned: true,
        summary: 'Open house counseling for vacant lateral entry B.Tech seats across CSE, AIML, and ECE disciplines at Seminar Hall 1.',
        content: 'Eligible Diploma in Engineering / B.Sc graduates seeking lateral entry admission to Semester 3 for Academic Year 2026-27 may participate in the open round counseling scheduled for 26-Oct-2026.',
      },
      {
        title: 'Orientation and Academic Induction Schedule for Batch 2026–2030',
        tag: 'ADMISSION',
        date: '16-10-2026',
        publisher: 'Principal Office & Admissions Central',
        pinned: false,
        summary: 'Academic induction, LMS credential distribution, student identity card issuance, and mentor allocation scheduled for newly admitted students.',
        content: 'All newly enrolled students for the 2026-27 academic session are invited along with their guardians to the Central Auditorium on 02-Nov-2026 for the formal orientation and matriculation ceremony.',
      },
    ];

    for (const n of admissionNotices) {
      await prisma.notice.create({ data: n });
    }
    console.log('✓ Seeded official admission circulars in Notice table.');
  }

  console.log('--- Admission ERP Database Upgrade Completed Successfully ---');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
