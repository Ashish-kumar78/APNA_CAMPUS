import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeStructureDto, SanctionScholarshipDto, UploadPaymentProofDto } from './fees.dto';

@Injectable()
export class FeesService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // 1. FINANCIAL DASHBOARD METRICS & COMMAND CENTER
  // =========================================================================
  async getFinancialDashboardStats(query?: { academicYear?: string; semester?: string }) {
    const transactions = await this.getTransactions();
    const verifications = await this.getPaymentVerifications('ALL');
    const scholarships = await this.getScholarships();

    // Calculate actual confirmed collections from verified transactions
    const totalCollected = transactions
      .filter((t: any) => t.status === 'Verified' || t.status === 'Reconciled' || t.status === 'Successful')
      .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

    const pendingVerificationsCount = verifications.filter((v: any) => v.status === 'PENDING').length;
    const pendingVerificationsSum = verifications
      .filter((v: any) => v.status === 'PENDING')
      .reduce((sum: number, v: any) => sum + (Number(v.amount) || 0), 0);

    const scholarshipsSanctionedSum = scholarships.reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);
    const scholarshipsDisbursedSum = scholarships
      .filter((s: any) => s.status === 'Disbursed')
      .reduce((sum: number, s: any) => sum + (Number(s.disbursedAmount) || 0), 0);

    return {
      totalAssessed: null,
      totalCollected,
      totalOutstanding: null,
      collectionRate: null,
      studentsWithDues: null,
      pendingVerificationsCount,
      pendingVerificationsSum,
      failedTransactionsCount: null,
      scholarshipsSanctioned: scholarshipsSanctionedSum,
      scholarshipsDisbursed: scholarshipsDisbursedSum,
      refundsAndReversals: null,
      monthlyTrends: [],
      feeHeadBreakdown: [],
      paymentChannelDistribution: [],
    };
  }

  // =========================================================================
  // 2. DIGITAL PAYMENT PROOF VERIFICATION WORKFLOW
  // =========================================================================
  async getPaymentVerifications(statusFilter = 'ALL', search = '') {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'PAYMENT_PROOF' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) return [];



    let list: any[] = records.map(r => {
      const { fileData, fileStored, ...details } = this.asDetails(r.details);
      delete details.studentId;
      return {
        id: r.id,
        ...details,
        proofAvailable: fileStored === true || (typeof fileData === 'string' && fileData.startsWith('data:')),
        status: r.status,
      };
    });

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter(item => item.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        item =>
          item.studentName?.toLowerCase().includes(q) ||
          item.rollNumber?.toLowerCase().includes(q) ||
          item.transactionId?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getStudentPaymentProofs(studentId: string) {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'PAYMENT_PROOF', requesterId: studentId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, details: true, createdAt: true },
    });

    return records.map((record) => {
      const details = this.asDetails(record.details);
      return {
        id: record.id,
        amount: details.amount,
        paymentDate: details.paymentDate,
        paymentMethod: details.paymentMethod,
        transactionId: details.transactionId,
        referenceNumber: details.referenceNumber,
        remarks: details.remarks,
        head: details.head,
        fileName: details.fileName,
        fileType: details.fileType,
        proofAvailable: details.fileStored === true,
        status: record.status,
        submittedAt: details.submittedAt || record.createdAt.toISOString(),
        verifiedAt: details.verifiedAt || null,
        verifiedBy: details.verifiedBy || null,
        rejectionReason: details.rejectionReason || null,
        receiptNo: details.receiptNo || null,
      };
    });
  }

  async uploadPaymentProof(
    payload: UploadPaymentProofDto,
    student: { id: string; name: string; rollNumber: string; department: string; semester: string },
  ) {
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }

    const dataUri = /^data:(image\/jpeg|image\/png|image\/webp|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/.exec(payload.fileData);
    if (!dataUri || dataUri[1] !== payload.fileType) {
      throw new BadRequestException('Payment proof must be a valid JPG, PNG, WEBP, or PDF file.');
    }
    const fileBytes = Buffer.from(dataUri[2], 'base64');
    if (fileBytes.length === 0 || fileBytes.length > 5 * 1024 * 1024 || fileBytes.toString('base64') !== dataUri[2]) {
      throw new BadRequestException('Payment proof file must be smaller than 5 MB and contain valid base64 data.');
    }
    const mimeMatchesContent = dataUri[1] === 'image/jpeg'
      ? fileBytes[0] === 0xff && fileBytes[1] === 0xd8 && fileBytes[2] === 0xff
      : dataUri[1] === 'image/png'
        ? fileBytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : dataUri[1] === 'image/webp'
          ? fileBytes.subarray(0, 4).toString('ascii') === 'RIFF' && fileBytes.subarray(8, 12).toString('ascii') === 'WEBP'
          : fileBytes.subarray(0, 5).toString('ascii') === '%PDF-';
    if (!mimeMatchesContent) {
      throw new BadRequestException('The payment proof file content does not match its declared file type.');
    }

    const transactionId = payload.transactionId.trim();
    const duplicateKey = transactionId.replace(/\s+/g, '').toUpperCase();
    const proofId = `payproof_${createHash('sha256').update(duplicateKey).digest('hex')}`;
    const fileName = payload.fileName.split(/[\\/]/).pop()!.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 128);
    const submittedAt = new Date().toISOString();
    const proofData = {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      semester: student.semester,
      amount: payload.amount,
      paymentDate: payload.paymentDate,
      paymentMethod: payload.paymentMethod,
      transactionId,
      referenceNumber: payload.referenceNumber?.trim() || null,
      remarks: payload.remarks?.trim() || '',
      head: payload.head?.trim() || 'Payment proof submission',
      fileName,
      fileType: dataUri[1],
      fileStored: true,
      status: 'PENDING',
      submittedAt,
    };

    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const createdProof = await tx.workflowRequest.create({
          data: {
            id: proofId,
            workflowType: 'PAYMENT_PROOF',
            title: `Payment proof: ${student.rollNumber} - ${payload.amount}`,
            requesterId: student.id,
            requesterName: student.name,
            requesterRole: 'STUDENT',
            department: student.department,
            details: proofData,
            currentStage: 'PENDING',
            status: 'PENDING',
          },
        });
        await tx.workflowRequest.create({
          data: {
            id: this.paymentProofFileId(proofId),
            workflowType: 'PAYMENT_PROOF_FILE',
            title: `Payment proof file: ${student.rollNumber}`,
            requesterId: student.id,
            requesterName: student.name,
            requesterRole: 'STUDENT',
            department: student.department,
            details: { paymentProofId: proofId, fileData: payload.fileData, fileName, fileType: dataUri[1] },
            currentStage: 'STORED',
            status: 'STORED',
          },
        });
        return createdProof;
      });
      return { ...proofData, proofAvailable: true, id: record.id };
    } catch (error) {
      if ((error as any)?.code === 'P2002') {
        throw new ConflictException('A payment proof with this transaction ID has already been submitted.');
      }
      throw error;
    }
  }

  async getPaymentProofFile(id: string, studentId?: string) {
    const proof = await this.prisma.workflowRequest.findFirst({
      where: {
        id,
        workflowType: 'PAYMENT_PROOF',
        ...(studentId ? { requesterId: studentId } : {}),
      },
    });
    if (!proof) throw new NotFoundException('Payment proof submission not found.');
    const details = this.asDetails(proof.details);
    if (typeof details.fileData === 'string') {
      return { fileData: details.fileData, fileName: details.fileName, fileType: details.fileType };
    }
    const storedFile = await this.prisma.workflowRequest.findFirst({
      where: { id: this.paymentProofFileId(id), workflowType: 'PAYMENT_PROOF_FILE' },
    });
    const file = this.asDetails(storedFile?.details);
    if (!storedFile || typeof file.fileData !== 'string') {
      throw new NotFoundException('The submitted payment proof file is not available.');
    }
    return { fileData: file.fileData, fileName: file.fileName, fileType: file.fileType };
  }

  async approvePayment(id: string, reviewer: { id: string; name: string }) {
    const proof = await this.prisma.workflowRequest.findFirst({ where: { id, workflowType: 'PAYMENT_PROOF' } });
    if (!proof) throw new NotFoundException('Payment proof submission not found.');
    if (proof.status !== 'PENDING') throw new ConflictException(`Payment proof is already ${proof.status.toLowerCase()}.`);

    const details = this.asDetails(proof.details);
    if (!details.rollNumber || !details.studentName || !Number.isFinite(Number(details.amount)) || Number(details.amount) <= 0) {
      throw new BadRequestException('Payment proof is missing valid student or amount details.');
    }
    const verifiedAt = new Date();
    const reviewerName = reviewer.name;
    const receiptNo = `RCPT-${verifiedAt.getUTCFullYear()}-${randomUUID()}`;
    const updatedDetails = {
      ...details,
      status: 'APPROVED',
      verifiedBy: reviewerName,
      verifiedAt: verifiedAt.toISOString(),
      rejectionReason: null,
      receiptNo,
    };

    const transaction = await this.prisma.$transaction(async (tx) => {
      const changed = await tx.workflowRequest.updateMany({
        where: { id, workflowType: 'PAYMENT_PROOF', status: 'PENDING' },
        data: {
          status: 'APPROVED',
          currentStage: 'APPROVED',
          approverId: reviewer.id,
          approverName: reviewerName,
          approvalNotes: `Approved by ${reviewerName}`,
          details: updatedDetails,
        },
      });
      if (changed.count !== 1) {
        throw new ConflictException('This payment proof was already reviewed. Refresh the verification queue.');
      }

      return tx.feeTransaction.create({
        data: {
          studentName: details.studentName,
          rollNumber: details.rollNumber,
          semester: details.semester || 'Unspecified',
          head: details.head || 'Payment proof submission',
          amount: Number(details.amount),
          mode: details.paymentMethod || 'Other',
          date: verifiedAt.toISOString(),
          status: 'Verified',
          receiptNo,
        },
      });
    });

    return {
      success: true,
      message: 'Payment proof verified and posted to the fee transaction ledger.',
      data: updatedDetails,
      transaction,
    };
  }

  async rejectPayment(id: string, rejectionReason: string, reviewer: { id: string; name: string }) {
    const proof = await this.prisma.workflowRequest.findFirst({ where: { id, workflowType: 'PAYMENT_PROOF' } });
    if (!proof) throw new NotFoundException('Payment proof submission not found.');
    if (proof.status !== 'PENDING') throw new ConflictException(`Payment proof is already ${proof.status.toLowerCase()}.`);

    const details = this.asDetails(proof.details);
    const reviewerName = reviewer.name;
    const reason = rejectionReason.trim();
    const updatedDetails = {
      ...details,
      status: 'REJECTED',
      verifiedBy: reviewerName,
      verifiedAt: new Date().toISOString(),
      rejectionReason: reason,
    };
    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id, workflowType: 'PAYMENT_PROOF', status: 'PENDING' },
      data: {
        status: 'REJECTED',
        currentStage: 'REJECTED',
        approverId: reviewer.id,
        approverName: reviewerName,
        approvalNotes: `Rejected: ${reason}`,
        details: updatedDetails,
      },
    });
    if (changed.count !== 1) {
      throw new ConflictException('This payment proof was already reviewed. Refresh the verification queue.');
    }

    return { success: true, message: 'Payment proof rejected with the supplied reason.', data: updatedDetails };
  }

  // =========================================================================
  // 3. STUDENT FEE LEDGER & INVOICES
  // =========================================================================
  async getStudentStatement(_rollNumber?: string) {
    throw new ServiceUnavailableException(
      'Student fee statements are unavailable until official student fee assessments and due dates are configured.',
    );
  }

  // =========================================================================
  // 4. TRANSACTION REGISTER & OFFICIAL RECEIPTS
  // =========================================================================
  async getTransactions(search?: string) {
    const [transactions, records] = await Promise.all([
      this.prisma.feeTransaction.findMany({ orderBy: { createdAt: 'desc' } }),
      this.prisma.workflowRequest.findMany({
        where: { workflowType: 'FEE_TRANSACTION' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let list: any[] = [
      ...transactions,
      ...records.map((r) => ({
        id: r.id,
        ...this.asDetails(r.details),
        status: r.status,
      })),
    ];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        t =>
          t.studentName?.toLowerCase().includes(q) ||
          t.rollNumber?.toLowerCase().includes(q) ||
          t.receiptNo?.toLowerCase().includes(q) ||
          t.referenceNumber?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async recordPayment(data: {
    idempotencyKey: string;
    rollNumber: string;
    semester: string;
    head: string;
    amount: number;
    mode: string;
  }, recordedBy: { id: string; name: string; role: string }) {
    if (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0) {
      throw new BadRequestException('Payment collection amount must be a positive number.');
    }
    if (!data.rollNumber.trim() || !data.semester.trim() || !data.head.trim() || !data.mode.trim()) {
      throw new BadRequestException('Student roll number, semester, fee head, and payment mode are required.');
    }
    const paymentRequestId = `counter-payment_${createHash('sha256').update(data.idempotencyKey).digest('hex')}`;
    const requestFingerprint = createHash('sha256').update(JSON.stringify([
      data.rollNumber.trim(), data.semester.trim(), data.head.trim(), Number(data.amount), data.mode.trim(),
    ])).digest('hex');

    const prior = await this.prisma.workflowRequest.findFirst({
      where: { id: paymentRequestId, workflowType: 'COUNTER_PAYMENT' },
    });
    if (prior) return this.getIdempotentPayment(prior, requestFingerprint);

    const student = await this.prisma.student.findUnique({
      where: { rollNumber: data.rollNumber.trim() },
      select: { name: true, rollNumber: true },
    });
    if (!student) throw new NotFoundException('Student record for this roll number was not found.');

    const createdAt = new Date();
    const receiptNo = `RCPT-${createdAt.getUTCFullYear()}-${randomUUID()}`;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const transaction = await tx.feeTransaction.create({
          data: {
            studentName: student.name,
            rollNumber: student.rollNumber,
            semester: data.semester.trim(),
            head: data.head.trim(),
            amount: Number(data.amount),
            mode: data.mode.trim(),
            date: createdAt.toISOString(),
            status: 'Verified',
            receiptNo,
          },
        });
        await tx.workflowRequest.create({
          data: {
            id: paymentRequestId,
            workflowType: 'COUNTER_PAYMENT',
            title: `Counter payment receipt ${receiptNo}`,
            requesterId: recordedBy.id,
            requesterName: recordedBy.name,
            requesterRole: recordedBy.role,
            details: { receiptNo, transactionId: transaction.id, requestFingerprint },
            currentStage: 'RECORDED',
            status: 'RECORDED',
          },
        });
        return transaction;
      });
    } catch (error) {
      if ((error as any)?.code !== 'P2002') throw error;
      const createdByConcurrentRequest = await this.prisma.workflowRequest.findFirst({
        where: { id: paymentRequestId, workflowType: 'COUNTER_PAYMENT' },
      });
      if (createdByConcurrentRequest) return this.getIdempotentPayment(createdByConcurrentRequest, requestFingerprint);
      throw error;
    }
  }

  // =========================================================================
  // 5. CONFIGURABLE FEE STRUCTURES
  // =========================================================================
  async getFeeStructures() {
    return this.prisma.feeStructure.findMany({ orderBy: { term: 'desc' } });
  }

  async createFeeStructure(data: CreateFeeStructureDto) {
    const program = data.program.trim();
    const term = data.term.trim();
    const amounts = [data.tuitionFee, data.developmentFee, data.labLibraryFee, data.examinationFee, data.hostelMessFee];
    if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
      throw new BadRequestException('Every fee component must be a valid non-negative amount.');
    }
    const id = `fee-structure_${createHash('sha256').update(`${program.toLowerCase()}|${term.toLowerCase()}`).digest('hex')}`;
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    if (total <= 0) throw new BadRequestException('The total fee structure must be greater than zero.');
    try {
      return await this.prisma.feeStructure.create({
        data: {
          id,
          program,
          term,
          tuitionFee: data.tuitionFee,
          developmentFee: data.developmentFee,
          labLibraryFee: data.labLibraryFee,
          examinationFee: data.examinationFee,
          hostelMessFee: data.hostelMessFee,
          total,
        },
      });
    } catch (error) {
      if ((error as any)?.code === 'P2002') {
        throw new ConflictException('A fee structure already exists for this program and term.');
      }
      throw error;
    }
  }

  // =========================================================================
  // 6. SCHOLARSHIPS & FINANCIAL ASSISTANCE LIFECYCLE
  // =========================================================================
  async getScholarships() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'SCHOLARSHIP' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) return [];



    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async sanctionScholarship(data: SanctionScholarshipDto, sanctionedBy: { id: string; name: string; role: string }) {
    const student = await this.prisma.student.findUnique({
      where: { rollNumber: data.studentRoll.trim() },
      select: { id: true, name: true, rollNumber: true, department: true },
    });
    if (!student) throw new NotFoundException('Student record for this roll number was not found.');

    const name = data.name.trim();
    const academicYear = data.academicYear.trim();
    const id = `scholarship_${createHash('sha256').update(`${student.id}|${name.toLowerCase()}|${academicYear}`).digest('hex')}`;
    const scholarship = {
      name,
      authority: data.authority.trim(),
      category: data.category.trim(),
      studentId: student.id,
      studentRoll: student.rollNumber,
      studentName: student.name,
      department: student.department,
      amount: data.amount,
      benefit: `₹${data.amount.toLocaleString('en-IN')} / Year`,
      beneficiaries: data.beneficiaries,
      disbursedAmount: 0,
      status: 'Approved',
      academicYear,
      sanctionedById: sanctionedBy.id,
      sanctionedByName: sanctionedBy.name,
      sanctionedAt: new Date().toISOString(),
    };

    try {
      const record = await this.prisma.workflowRequest.create({
        data: {
          id,
          workflowType: 'SCHOLARSHIP',
          title: `Scholarship: ${name} for ${student.rollNumber}`,
          requesterId: sanctionedBy.id,
          requesterName: sanctionedBy.name,
          requesterRole: sanctionedBy.role,
          department: student.department,
          details: scholarship,
          currentStage: 'Approved',
          status: 'Approved',
        },
      });
      return { ...scholarship, id: record.id };
    } catch (error) {
      if ((error as any)?.code === 'P2002') {
        throw new ConflictException('This scholarship has already been sanctioned for the student in this academic year.');
      }
      throw error;
    }
  }

  // =========================================================================
  // 7. FINANCIAL REPORTS & AUDIT TRAIL
  // =========================================================================
  async getFinancialReportsData(reportType = 'DAILY_COLLECTION') {
    const transactions = await this.getTransactions();
    const verifications = await this.getPaymentVerifications();

    return {
      reportType,
      generatedAt: new Date().toISOString(),
      institution: 'Apna Campus, Bhubaneswar',
      totalRecords: transactions.length,
      verifiedTransactions: transactions,
      verificationsSummary: {
        total: verifications.length,
        pending: verifications.filter((v: any) => v.status === 'PENDING').length,
        approved: verifications.filter((v: any) => v.status === 'APPROVED').length,
        rejected: verifications.filter((v: any) => v.status === 'REJECTED').length,
      },
    };
  }

  // =========================================================================
  // 8. STUDENT DOCUMENTS REPOSITORY
  // =========================================================================
  async getStudentFinancialDocuments(rollNumber?: string) {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'FEE_DOCUMENT' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) return [];



    let list = records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));

    if (rollNumber) {
      list = list.filter(d => d.rollNumber === rollNumber);
    }

    return list;
  }

  private asDetails(value: unknown): Record<string, any> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return { ...(value as Record<string, any>) };
    }
    return {};
  }

  private paymentProofFileId(proofId: string) {
    return `payment-proof-file_${createHash('sha256').update(proofId).digest('hex')}`;
  }

  private async getIdempotentPayment(record: any, requestFingerprint: string) {
    const details = this.asDetails(record.details);
    if (details.requestFingerprint !== requestFingerprint) {
      throw new ConflictException('This payment request key was already used for different payment details.');
    }
    const transaction = await this.prisma.feeTransaction.findUnique({ where: { receiptNo: details.receiptNo } });
    if (!transaction) throw new ConflictException('The existing payment request has no ledger transaction. Contact Accounts support.');
    return transaction;
  }
}
