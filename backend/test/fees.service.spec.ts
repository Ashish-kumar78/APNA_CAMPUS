import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException, ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { FeesService } from '../src/fees/fees.service';

test('empty financial collections remain empty and GET handlers do not seed demo records', async () => {
  let createCalls = 0;
  const service = new FeesService({
    workflowRequest: {
      findMany: async () => [],
      create: async () => { createCalls += 1; return {}; },
    },
    feeTransaction: { findMany: async () => [] },
    feeStructure: { findMany: async () => [] },
  } as any);

  assert.deepEqual(await service.getPaymentVerifications(), []);
  assert.deepEqual(await service.getTransactions(), []);
  assert.deepEqual(await service.getFeeStructures(), []);
  assert.deepEqual(await service.getScholarships(), []);
  assert.deepEqual(await service.getStudentFinancialDocuments(), []);
  assert.equal(createCalls, 0);
});

test('financial dashboard marks unmodeled fee assessments and trends as unavailable', async () => {
  const service = new FeesService({
    workflowRequest: { findMany: async () => [] },
    feeTransaction: { findMany: async () => [] },
  } as any);

  const result = await service.getFinancialDashboardStats();

  assert.equal(result.totalCollected, 0);
  assert.equal(result.totalAssessed, null);
  assert.equal(result.totalOutstanding, null);
  assert.equal(result.collectionRate, null);
  assert.deepEqual(result.monthlyTrends, []);
});

test('student statement does not return fabricated dues without persisted assessment data', async () => {
  const service = new FeesService({} as any);
  await assert.rejects(service.getStudentStatement('R-001'), ServiceUnavailableException);
});

test('payment proof upload stores identity from the linked student and rejects duplicate references', async () => {
  const creates: any[] = [];
  const service = new FeesService({
    $transaction: async (callback: (tx: any) => Promise<any>) => callback({
      workflowRequest: {
        create: async ({ data }: any) => { creates.push(data); return { id: data.id }; },
      },
    }),
  } as any);
  const result = await service.uploadPaymentProof({
    amount: 1000,
    paymentDate: '2026-10-21',
    paymentMethod: 'UPI',
    transactionId: 'UTR-12345',
    referenceNumber: 'REF-12345',
    fileData: 'data:image/png;base64,iVBORw0KGgo=',
    fileName: '../../receipt.png',
    fileType: 'image/png',
  }, {
    id: 'student-db-id', name: 'Verified Student', rollNumber: 'R-100',
    department: 'CSE', semester: 'Semester 3',
  });

  assert.equal(creates.length, 2);
  assert.equal(creates[0].requesterId, 'student-db-id');
  assert.equal(creates[0].details.studentName, 'Verified Student');
  assert.equal(creates[0].details.rollNumber, 'R-100');
  assert.equal(creates[0].details.fileStored, true);
  assert.equal((creates[0].details as any).fileData, undefined);
  assert.equal(creates[1].workflowType, 'PAYMENT_PROOF_FILE');
  assert.equal(creates[1].details.fileData, 'data:image/png;base64,iVBORw0KGgo=');
  assert.equal(result.fileName, 'receipt.png');
  assert.equal((result as any).fileData, undefined);
});

test('payment proof upload rejects invalid or oversized attachment data', async () => {
  const service = new FeesService({} as any);
  await assert.rejects(service.uploadPaymentProof({
    amount: 1000, paymentDate: '2026-10-21', paymentMethod: 'UPI', transactionId: 'UTR-12345',
    fileData: 'https://example.invalid/proof.png', fileName: 'proof.png', fileType: 'image/png',
  } as any, { id: 's1', name: 'Student', rollNumber: 'R-1', department: 'CSE', semester: 'S1' }), BadRequestException);
});

test('student payment proof history is scoped to the linked student and omits file bytes and private identifiers', async () => {
  let query: any;
  const service = new FeesService({
    workflowRequest: {
      findMany: async (args: any) => {
        query = args;
        return [{
          id: 'proof-1', status: 'PENDING', createdAt: new Date('2026-10-21T00:00:00.000Z'),
          details: {
            studentId: 'student-1', fileData: 'data:image/png;base64,secret', fileStored: true,
            amount: 500, paymentDate: '2026-10-20', paymentMethod: 'UPI', transactionId: 'UTR-1',
            submittedAt: '2026-10-21T00:00:00.000Z',
          },
        }];
      },
    },
  } as any);

  const proofs = await service.getStudentPaymentProofs('student-1');
  assert.deepEqual(query.where, { workflowType: 'PAYMENT_PROOF', requesterId: 'student-1' });
  assert.equal(proofs[0].amount, 500);
  assert.equal(proofs[0].proofAvailable, true);
  assert.equal('studentId' in proofs[0], false);
  assert.equal('fileData' in proofs[0], false);
});

test('Accounts payment proof queue omits file contents and internal student keys', async () => {
  const service = new FeesService({
    workflowRequest: {
      findMany: async () => [{
        id: 'proof-queue-1', status: 'PENDING',
        details: {
          studentId: 'private-student-id', fileData: 'data:image/png;base64,private', fileStored: true,
          studentName: 'Student', rollNumber: 'R-5', amount: 500, transactionId: 'UTR-5',
        },
      }],
    },
  } as any);

  const list = await service.getPaymentVerifications();
  assert.equal(list[0].proofAvailable, true);
  assert.equal(list[0].studentName, 'Student');
  assert.equal('studentId' in list[0], false);
  assert.equal('fileStored' in list[0], false);
  assert.equal('fileData' in list[0], false);
});

test('payment proof attachment reads are constrained to the requesting student when supplied', async () => {
  const lookups: any[] = [];
  const service = new FeesService({
    workflowRequest: {
      findFirst: async (args: any) => {
        lookups.push(args.where);
        if (args.where.requesterId === 'student-owner') {
          return { id: 'proof-1', details: { fileData: 'data:image/png;base64,abc', fileName: 'proof.png', fileType: 'image/png' } };
        }
        return null;
      },
    },
  } as any);

  const file = await service.getPaymentProofFile('proof-1', 'student-owner');
  assert.equal(file.fileName, 'proof.png');
  await assert.rejects(service.getPaymentProofFile('proof-1', 'another-student'), NotFoundException);
  assert.deepEqual(lookups, [
    { id: 'proof-1', workflowType: 'PAYMENT_PROOF', requesterId: 'student-owner' },
    { id: 'proof-1', workflowType: 'PAYMENT_PROOF', requesterId: 'another-student' },
  ]);
});

test('payment proof approval updates review state and ledger entry in one transaction', async () => {
  let transactionStarted = false;
  let proofUpdate: any;
  let ledgerWrite: any;
  const service = new FeesService({
    workflowRequest: {
      findFirst: async () => ({
        id: 'proof-1', workflowType: 'PAYMENT_PROOF', status: 'PENDING',
        details: { studentName: 'Verified Student', rollNumber: 'R-100', semester: 'Semester 3', amount: 1200, paymentMethod: 'UPI' },
      }),
    },
    $transaction: async (callback: (tx: any) => Promise<any>) => {
      transactionStarted = true;
      return callback({
        workflowRequest: { updateMany: async (args: any) => { proofUpdate = args; return { count: 1 }; } },
        feeTransaction: { create: async (args: any) => { ledgerWrite = args; return { id: 'ledger-1', ...args.data }; } },
      });
    },
  } as any);

  const result = await service.approvePayment('proof-1', { id: 'accounts-1', name: 'Accounts User' });
  assert.equal(transactionStarted, true);
  assert.deepEqual(proofUpdate.where, { id: 'proof-1', workflowType: 'PAYMENT_PROOF', status: 'PENDING' });
  assert.equal(proofUpdate.data.approverId, 'accounts-1');
  assert.equal(ledgerWrite.data.rollNumber, 'R-100');
  assert.equal(ledgerWrite.data.amount, 1200);
  assert.equal(result.transaction.id, 'ledger-1');
  assert.equal(result.data.status, 'APPROVED');
});

test('payment proof cannot be approved twice or after a concurrent review', async () => {
  let createCalls = 0;
  const service = new FeesService({
    workflowRequest: {
      findFirst: async () => ({ id: 'proof-1', workflowType: 'PAYMENT_PROOF', status: 'PENDING', details: { studentName: 'S', rollNumber: 'R', amount: 1 } }),
    },
    $transaction: async (callback: (tx: any) => Promise<any>) => callback({
      workflowRequest: { updateMany: async () => ({ count: 0 }) },
      feeTransaction: { create: async () => { createCalls += 1; return {}; } },
    }),
  } as any);

  await assert.rejects(service.approvePayment('proof-1', { id: 'a1', name: 'Accounts' }), ConflictException);
  assert.equal(createCalls, 0);

  const reviewed = new FeesService({
    workflowRequest: { findFirst: async () => ({ id: 'proof-1', workflowType: 'PAYMENT_PROOF', status: 'APPROVED' }) },
  } as any);
  await assert.rejects(reviewed.approvePayment('proof-1', { id: 'a1', name: 'Accounts' }), ConflictException);
});

test('counter collection derives student name from Atlas and is retry-safe by idempotency key', async () => {
  let creates = 0;
  let savedTransaction: any;
  let requestRecord: any = null;
  const service = new FeesService({
    workflowRequest: {
      findFirst: async () => requestRecord,
    },
    student: {
      findUnique: async () => ({ name: 'Database Student', rollNumber: 'R-200' }),
    },
    feeTransaction: {
      create: async ({ data }: any) => {
        creates += 1;
        savedTransaction = { id: 'ledger-2', ...data };
        return savedTransaction;
      },
      findUnique: async () => savedTransaction,
    },
    $transaction: async (callback: (tx: any) => Promise<any>) => callback({
      feeTransaction: { create: async ({ data }: any) => { creates += 1; savedTransaction = { id: 'ledger-2', ...data }; return savedTransaction; } },
      workflowRequest: { create: async ({ data }: any) => { requestRecord = { ...data }; return requestRecord; } },
    }),
  } as any);
  const payload = {
    idempotencyKey: '32fda83a-56e3-4eb5-91b8-655fc82b7a21', rollNumber: 'R-200',
    semester: 'Semester 4', head: 'Tuition', amount: 1500, mode: 'Cash',
  };

  const first = await service.recordPayment(payload, { id: 'accounts-1', name: 'Accounts User', role: 'ACCOUNTS' });
  const retry = await service.recordPayment(payload, { id: 'accounts-1', name: 'Accounts User', role: 'ACCOUNTS' });
  assert.equal(first.studentName, 'Database Student');
  assert.equal(retry.id, first.id);
  assert.equal(creates, 1);
});

test('counter collection rejects an unknown student instead of writing an unlinked payment', async () => {
  const service = new FeesService({
    workflowRequest: { findFirst: async () => null },
    student: { findUnique: async () => null },
  } as any);
  await assert.rejects(service.recordPayment({
    idempotencyKey: '32fda83a-56e3-4eb5-91b8-655fc82b7a21', rollNumber: 'MISSING',
    semester: 'S1', head: 'Tuition', amount: 100, mode: 'Cash',
  }, { id: 'accounts-1', name: 'Accounts User', role: 'ACCOUNTS' }), NotFoundException);
});

test('fee structure total is calculated by the server and duplicate program-term records are rejected', async () => {
  let captured: any;
  const service = new FeesService({
    feeStructure: {
      create: async ({ data }: any) => { captured = data; return { ...data }; },
    },
  } as any);
  const structure = await service.createFeeStructure({
    program: 'B.Tech CSE', term: '2026-27', tuitionFee: 100, developmentFee: 20,
    labLibraryFee: 10, examinationFee: 5, hostelMessFee: 15,
  });
  assert.equal(captured.total, 150);
  assert.equal(structure.total, 150);
  assert.match(captured.id, /^fee-structure_/);

  const duplicate = new FeesService({
    feeStructure: { create: async () => { throw { code: 'P2002' }; } },
  } as any);
  await assert.rejects(duplicate.createFeeStructure({
    program: 'B.Tech CSE', term: '2026-27', tuitionFee: 100, developmentFee: 20,
    labLibraryFee: 10, examinationFee: 5, hostelMessFee: 15,
  }), ConflictException);
});

test('scholarship sanction resolves the student identity and does not count an award as disbursed', async () => {
  let captured: any;
  const service = new FeesService({
    student: { findUnique: async () => ({ id: 'student-id', name: 'Verified Student', rollNumber: 'R-3', department: 'CSE' }) },
    workflowRequest: { create: async ({ data }: any) => { captured = data; return { id: data.id }; } },
  } as any);
  const scholarship = await service.sanctionScholarship({
    name: 'Merit Award', authority: 'Trust', category: 'Institutional', studentRoll: 'R-3',
    amount: 25000, beneficiaries: 1, academicYear: '2026-27',
  }, { id: 'accounts-id', name: 'Accounts User', role: 'ACCOUNTS' });
  assert.equal(captured.details.studentName, 'Verified Student');
  assert.equal(captured.details.studentId, 'student-id');
  assert.equal(captured.details.amount, 25000);
  assert.equal(captured.details.disbursedAmount, 0);
  assert.equal(scholarship.status, 'Approved');
});
