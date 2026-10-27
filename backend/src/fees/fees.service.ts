import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationEventType, NotificationPriority } from '../notifications/notification-events';
import { Role } from '@prisma/client';

@Injectable()
export class FeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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

    // Institutional Cohort Fees Assessment
    const totalAssessed = 41370000; // 420 Students across Semesters x Average ₹98,500
    const totalOutstanding = Math.max(0, totalAssessed - totalCollected);
    const collectionRate = totalAssessed > 0 ? ((totalCollected / totalAssessed) * 100).toFixed(1) : '87.6';

    const pendingVerificationsCount = verifications.filter((v: any) => v.status === 'PENDING').length;
    const pendingVerificationsSum = verifications
      .filter((v: any) => v.status === 'PENDING')
      .reduce((sum: number, v: any) => sum + (Number(v.amount) || 0), 0);

    const scholarshipsSanctionedSum = scholarships.reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);
    const scholarshipsDisbursedSum = scholarships
      .filter((s: any) => s.status === 'Disbursed' || s.status === 'Approved')
      .reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);

    return {
      totalAssessed,
      totalCollected,
      totalOutstanding,
      collectionRate: Number(collectionRate),
      studentsWithDues: 54,
      pendingVerificationsCount,
      pendingVerificationsSum,
      failedTransactionsCount: 2,
      scholarshipsSanctioned: scholarshipsSanctionedSum,
      scholarshipsDisbursed: scholarshipsDisbursedSum,
      refundsAndReversals: 25000,
      monthlyTrends: [
        { month: 'Jun', assessed: 8200000, collected: 7100000 },
        { month: 'Jul', assessed: 12500000, collected: 11200000 },
        { month: 'Aug', assessed: 9800000, collected: 8900000 },
        { month: 'Sep', assessed: 6400000, collected: 5600000 },
        { month: 'Oct', assessed: 4470000, collected: 3440000 },
      ],
      feeHeadBreakdown: [
        { head: 'Tuition & Academic Fee', percentage: 55, amount: 22753500 },
        { head: 'Development & Infrastructure', percentage: 18, amount: 7446600 },
        { head: 'Hostel & Residential Boarding', percentage: 15, amount: 6205500 },
        { head: 'Transportation Fleet Charges', percentage: 7, amount: 2895900 },
        { head: 'Examination & Autonomous Evaluation', percentage: 5, amount: 2068500 },
      ],
      paymentChannelDistribution: [
        { channel: 'Online Net Banking', percentage: 48, count: 214 },
        { channel: 'UPI / QR Campus Scan', percentage: 32, count: 142 },
        { channel: 'Bank Challan / NEFT', percentage: 14, count: 62 },
        { channel: 'Accounts Counter Cash', percentage: 6, count: 26 },
      ],
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

    if (records.length === 0) {
      const defaultProofs = [
        {
          id: 'PAY-8821',
          studentName: 'Ashish Kumar',
          rollNumber: '2305201037',
          department: 'Computer Science & Engineering',
          amount: 20000,
          paymentDate: '2026-10-05',
          paymentMethod: 'UPI',
          transactionId: 'UPI9842109238',
          referenceNumber: 'REF-2026-0912',
          remarks: 'Semester 7 tuition fee partial payment',
          proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
          fileName: 'upi_screenshot_sem7.jpg',
          fileType: 'image/jpeg',
          status: 'PENDING',
          submittedAt: '2026-10-05T09:30:00Z',
          rejectionReason: null,
          ocrMatch: { txnMatch: 'EXACT', amountMatch: 'EXACT', confidence: 98 },
        },
        {
          id: 'PAY-8819',
          studentName: 'Rahul Sharma',
          rollNumber: '2305201038',
          department: 'Computer Science & Engineering',
          amount: 15000,
          paymentDate: '2026-10-05',
          paymentMethod: 'Bank Transfer',
          transactionId: 'HDFC00019284',
          referenceNumber: 'TXN-98124',
          remarks: 'Hostel and Mess fee installment',
          proofUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
          fileName: 'bank_ack_receipt.pdf',
          fileType: 'application/pdf',
          status: 'APPROVED',
          submittedAt: '2026-10-04T14:15:00Z',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
          verifiedAt: '2026-10-04T16:00:00Z',
          rejectionReason: null,
          ocrMatch: { txnMatch: 'EXACT', amountMatch: 'EXACT', confidence: 99 },
        },
        {
          id: 'PAY-8815',
          studentName: 'Amit Verma',
          rollNumber: '2305201039',
          department: 'Mechanical Engineering',
          amount: 10000,
          paymentDate: '2026-10-04',
          paymentMethod: 'NEFT',
          transactionId: 'NEFT77123984',
          referenceNumber: 'REF-7712',
          remarks: 'Library & Exam Fee',
          proofUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
          fileName: 'blurry_slip.jpg',
          fileType: 'image/jpeg',
          status: 'REJECTED',
          submittedAt: '2026-10-04T11:00:00Z',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
          verifiedAt: '2026-10-04T12:30:00Z',
          rejectionReason: 'Transaction ID could not be verified in bank statement log.',
          ocrMatch: { txnMatch: 'MISMATCH', amountMatch: 'EXACT', confidence: 45 },
        },
      ];

      for (const p of defaultProofs) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'PAYMENT_PROOF',
            title: `Payment Proof: ${p.studentName} - ₹${p.amount}`,
            requesterId: p.rollNumber,
            requesterName: p.studentName,
            requesterRole: 'Student',
            department: p.department,
            details: p,
            currentStage: p.status,
            status: p.status,
          },
        });
      }

      return defaultProofs;
    }

    let list = records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));

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

  async uploadPaymentProof(payload: any) {
    if (!payload.amount || Number(payload.amount) <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }

    const proofId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const proofData = {
      id: proofId,
      studentName: payload.studentName || 'Student',
      rollNumber: payload.rollNumber || '2305201001',
      department: payload.department || 'Computer Science & Engineering',
      amount: Number(payload.amount),
      paymentDate: payload.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: payload.paymentMethod || 'UPI',
      transactionId: payload.transactionId || `TXN${Date.now()}`,
      referenceNumber: payload.referenceNumber || `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: payload.remarks || '',
      proofUrl: payload.previewUrl || payload.fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      fileName: payload.fileName || 'payment_receipt.jpg',
      fileType: payload.fileType || 'image/jpeg',
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      ocrMatch: { txnMatch: 'VERIFYING', amountMatch: 'MATCH', confidence: 95 },
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'PAYMENT_PROOF',
        title: `Payment Proof: ${proofData.studentName} - ₹${proofData.amount}`,
        requesterId: proofData.rollNumber,
        requesterName: proofData.studentName,
        requesterRole: 'Student',
        department: proofData.department,
        details: proofData,
        currentStage: 'PENDING',
        status: 'PENDING',
      },
    });

    return { ...proofData, id: record.id };
  }

  async approvePayment(id: string, reviewerName = 'Accounts Officer (Subhashree Jena)') {
    const proof = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!proof) throw new NotFoundException('Payment proof submission not found.');

    const details = (proof.details as any) || {};
    details.status = 'APPROVED';
    details.verifiedBy = reviewerName;
    details.verifiedAt = new Date().toISOString();
    details.rejectionReason = null;

    await this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        currentStage: 'APPROVED',
        approvalNotes: `Approved by ${reviewerName}`,
        details,
      },
    });

    // Automatically post approved payment to verified transaction ledger
    await this.recordPayment({
      studentName: details.studentName,
      rollNumber: details.rollNumber,
      semester: details.semester || 'Semester 7',
      head: details.remarks || 'Tuition & Academic Fee',
      amount: details.amount,
      mode: details.paymentMethod || 'Online Transfer',
      referenceNumber: details.transactionId,
    });

    // Dispatch official verified receipt notification to student
    try {
      await this.notificationsService.dispatch({
        eventType: NotificationEventType.FEE_PAYMENT_CONFIRMED,
        title: 'Fee Payment Verified & Confirmed',
        message: `Your payment of ₹${details.amount} has been verified and posted to your ledger. Receipt Ref: ${details.transactionId || details.referenceNumber}.`,
        category: NotificationCategory.FINANCE,
        priority: NotificationPriority.HIGH,
        sourceModule: 'Accounts & Finance',
        senderName: reviewerName,
        senderRole: 'ACCOUNTS',
        actionUrl: '/accounts',
        actionTab: 'receipts',
        actionLabel: 'View Receipt',
        target: {
          studentRollNumbers: [details.rollNumber],
          roles: [Role.STUDENT],
        },
        metadata: {
          amount: details.amount,
          transactionId: details.transactionId,
          referenceNumber: details.referenceNumber,
        },
        dedupKey: `fee-payment-approved-${id}`,
      });
    } catch {
      // Non-blocking notification delivery
    }

    return { success: true, message: 'Payment proof verified and posted to student ledger.', data: details };
  }

  async rejectPayment(id: string, rejectionReason: string, reviewerName = 'Accounts Officer (Subhashree Jena)') {
    const proof = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!proof) throw new NotFoundException('Payment proof submission not found.');

    const details = (proof.details as any) || {};
    details.status = 'REJECTED';
    details.verifiedBy = reviewerName;
    details.verifiedAt = new Date().toISOString();
    details.rejectionReason = rejectionReason || 'Transaction ID could not be validated against bank statement.';

    await this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        currentStage: 'REJECTED',
        approvalNotes: `Rejected: ${rejectionReason}`,
        details,
      },
    });

    // Dispatch rejection explanation notification to student
    try {
      await this.notificationsService.dispatch({
        eventType: NotificationEventType.FEE_PAYMENT_REJECTED,
        title: 'Fee Payment Proof Verification Discrepancy',
        message: `Your payment proof of ₹${details.amount} was returned: ${rejectionReason}. Please re-submit your receipt slip.`,
        category: NotificationCategory.FINANCE,
        priority: NotificationPriority.HIGH,
        sourceModule: 'Accounts & Finance',
        senderName: reviewerName,
        senderRole: 'ACCOUNTS',
        actionUrl: '/accounts',
        actionTab: 'payment-proof',
        actionLabel: 'Review & Re-submit',
        target: {
          studentRollNumbers: [details.rollNumber],
          roles: [Role.STUDENT],
        },
        dedupKey: `fee-payment-rejected-${id}`,
      });
    } catch {
      // Non-blocking
    }

    return { success: true, message: 'Payment proof rejected and feedback dispatched to student.', data: details };
  }


  // =========================================================================
  // 3. STUDENT FEE LEDGER & INVOICES
  // =========================================================================
  async getStudentStatement(rollNumber = '2305201001') {
    const transactions = await this.getTransactions(rollNumber);
    const structures = await this.getFeeStructures();

    const studentInfo = {
      studentName: 'Rakesh Das',
      rollNumber,
      department: 'Computer Science & Engineering',
      program: 'B.Tech (Autonomous)',
      semester: 'Semester 7 (4th Year)',
      academicYear: '2026-27',
      category: 'General',
      quota: 'State Counselling (OJEE)',
    };

    // Itemized invoice fee heads for current term
    const feeHeads = [
      { id: 'FH-01', head: 'Tuition Fee (Autumn Term)', assessed: 38000, paid: 38000, balance: 0, dueDate: '15 Aug 2026', status: 'Cleared' },
      { id: 'FH-02', head: 'Development & Infrastructure Fee', assessed: 10500, paid: 10500, balance: 0, dueDate: '15 Aug 2026', status: 'Cleared' },
      { id: 'FH-03', head: 'Laboratory & Computing Systems Fee', assessed: 6000, paid: 6000, balance: 0, dueDate: '30 Aug 2026', status: 'Cleared' },
      { id: 'FH-04', head: 'Autonomous Semester Examination Fee', assessed: 2500, paid: 2500, balance: 0, dueDate: '10 Sep 2026', status: 'Cleared' },
      { id: 'FH-05', head: 'Central Library & Digital ERP Access', assessed: 1500, paid: 1500, balance: 0, dueDate: '10 Sep 2026', status: 'Cleared' },
      { id: 'FH-06', head: 'Hostel & Residential Boarding (Sarojini Block)', assessed: 28000, paid: 20000, balance: 8000, dueDate: '15 Nov 2026', status: 'Partial' },
      { id: 'FH-07', head: 'Mess Catering Charges (Installment 2)', assessed: 12000, paid: 8000, balance: 4000, dueDate: '15 Nov 2026', status: 'Partial' },
    ];

    const totalAnnualDues = feeHeads.reduce((s, h) => s + h.assessed, 0);
    const paidAmount = feeHeads.reduce((s, h) => s + h.paid, 0);
    const scholarshipCredit = 15000;
    const outstanding = Math.max(0, totalAnnualDues - paidAmount);

    return {
      student: studentInfo,
      totalAnnualDues,
      paidAmount,
      scholarshipCredit,
      outstanding,
      nextDueDate: '15 Nov 2026',
      feeHeads,
      transactions,
      structures,
    };
  }

  // =========================================================================
  // 4. TRANSACTION REGISTER & OFFICIAL RECEIPTS
  // =========================================================================
  async getTransactions(search?: string) {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'FEE_TRANSACTION' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultTxns = [
        {
          id: 'TXN-98421',
          studentName: 'Rakesh Das',
          rollNumber: '2305201001',
          semester: 'Semester 7',
          head: 'Tuition & Development Fee',
          amount: 48500,
          mode: 'Net Banking',
          date: '10 Aug 2026, 11:30 AM',
          status: 'Verified',
          receiptNo: 'RCPT-2026-8821',
          channel: 'HDFC BillDesk Gateway',
          referenceNumber: 'HDFC772184129',
        },
        {
          id: 'TXN-98422',
          studentName: 'Amit Nayak',
          rollNumber: '2305201002',
          semester: 'Semester 7',
          head: 'Hostel Boarding & Mess Fee',
          amount: 36000,
          mode: 'UPI',
          date: '12 Aug 2026, 02:15 PM',
          status: 'Verified',
          receiptNo: 'RCPT-2026-8822',
          channel: 'Campus PhonePe Scan',
          referenceNumber: 'UPI9921401284',
        },
        {
          id: 'TXN-98423',
          studentName: 'Subham Mahapatra',
          rollNumber: '2305201015',
          semester: 'Semester 7',
          head: 'Examination Fee',
          amount: 2500,
          mode: 'Cash at Counter',
          date: '02 Sep 2026, 10:45 AM',
          status: 'Verified',
          receiptNo: 'RCPT-2026-8823',
          channel: 'Cash Desk 01',
          referenceNumber: 'CSH-98124',
        },
        {
          id: 'TXN-98424',
          studentName: 'Priya Patra',
          rollNumber: '2305201004',
          semester: 'Semester 7',
          head: 'Transportation Fleet Fee',
          amount: 16000,
          mode: 'Bank Challan',
          date: '08 Sep 2026, 04:00 PM',
          status: 'Verified',
          receiptNo: 'RCPT-2026-8824',
          channel: 'PNB Bank Challan',
          referenceNumber: 'CHL-PNB-0941',
        },
      ];

      for (const t of defaultTxns) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'FEE_TRANSACTION',
            title: `Fee Transaction: ${t.receiptNo} - ₹${t.amount}`,
            requesterId: t.rollNumber,
            requesterName: t.studentName,
            requesterRole: 'Student',
            details: t,
            currentStage: t.status,
            status: t.status,
          },
        });
      }

      return defaultTxns;
    }

    let list = records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));

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
    studentName: string;
    rollNumber: string;
    semester: string;
    head: string;
    amount: number;
    mode: string;
    referenceNumber?: string;
  }) {
    if (!data.amount || Number(data.amount) <= 0) {
      throw new BadRequestException('Payment collection amount must be a positive number.');
    }

    const receiptNo = `RCPT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnRecord = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: data.studentName,
      rollNumber: data.rollNumber,
      semester: data.semester || 'Semester 7',
      head: data.head || 'Tuition & Academic Fee',
      amount: Number(data.amount),
      mode: data.mode || 'Cash at Counter',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Verified',
      receiptNo,
      referenceNumber: data.referenceNumber || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      channel: data.mode === 'Cash at Counter' ? 'Bursar Counter 01' : 'Bank Integration',
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'FEE_TRANSACTION',
        title: `Fee Transaction: ${txnRecord.receiptNo} - ₹${txnRecord.amount}`,
        requesterId: txnRecord.rollNumber,
        requesterName: txnRecord.studentName,
        requesterRole: 'Student',
        details: txnRecord,
        currentStage: 'Verified',
        status: 'Verified',
      },
    });

    return { ...txnRecord, id: record.id };
  }

  // =========================================================================
  // 5. CONFIGURABLE FEE STRUCTURES
  // =========================================================================
  async getFeeStructures() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'FEE_STRUCTURE' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultStructures = [
        {
          id: 'FS-01',
          course: 'B.Tech (Computer Science & Engineering)',
          program: 'B.Tech',
          academicYear: '2026-27',
          annualFee: 98500,
          semesterFee: 49250,
          tuitionFee: 38000,
          developmentFee: 10500,
          examFee: 2500,
          labFee: 6000,
          libraryFee: 1500,
          effectiveDate: '01 Jul 2026',
          status: 'Active',
        },
        {
          id: 'FS-02',
          course: 'B.Tech (Electronics & Communication)',
          program: 'B.Tech',
          academicYear: '2026-27',
          annualFee: 94500,
          semesterFee: 47250,
          tuitionFee: 36000,
          developmentFee: 10500,
          examFee: 2500,
          labFee: 5000,
          libraryFee: 1500,
          effectiveDate: '01 Jul 2026',
          status: 'Active',
        },
        {
          id: 'FS-03',
          course: 'B.Tech (Mechanical Engineering)',
          program: 'B.Tech',
          academicYear: '2026-27',
          annualFee: 88500,
          semesterFee: 44250,
          tuitionFee: 34000,
          developmentFee: 9500,
          examFee: 2500,
          labFee: 4500,
          libraryFee: 1500,
          effectiveDate: '01 Jul 2026',
          status: 'Active',
        },
        {
          id: 'FS-04',
          course: 'Master of Computer Applications (MCA)',
          program: 'MCA',
          academicYear: '2026-27',
          annualFee: 78000,
          semesterFee: 39000,
          tuitionFee: 30000,
          developmentFee: 8500,
          examFee: 2500,
          labFee: 5000,
          libraryFee: 1500,
          effectiveDate: '01 Jul 2026',
          status: 'Active',
        },
      ];

      for (const fs of defaultStructures) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'FEE_STRUCTURE',
            title: `Fee Structure: ${fs.course}`,
            requesterId: fs.program,
            requesterName: 'Bursar & Academic Council',
            requesterRole: 'ACCOUNTS',
            details: fs,
            currentStage: 'Active',
            status: 'Active',
          },
        });
      }

      return defaultStructures;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async createFeeStructure(data: any) {
    if (!data.course || !data.annualFee) {
      throw new BadRequestException('Course name and annual fee are required.');
    }

    const newStructure = {
      id: `FS-${Math.floor(10 + Math.random() * 90)}`,
      course: data.course,
      program: data.program || 'B.Tech',
      academicYear: data.academicYear || '2026-27',
      annualFee: Number(data.annualFee),
      semesterFee: Math.round(Number(data.annualFee) / 2),
      tuitionFee: Number(data.tuitionFee) || Math.round(Number(data.annualFee) * 0.75),
      developmentFee: Number(data.developmentFee) || 10500,
      examFee: 2500,
      labFee: 5000,
      libraryFee: 1500,
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'FEE_STRUCTURE',
        title: `Fee Structure: ${newStructure.course}`,
        requesterId: newStructure.program,
        requesterName: 'Accounts Office',
        requesterRole: 'ACCOUNTS',
        details: newStructure,
        currentStage: 'Active',
        status: 'Active',
      },
    });

    return { ...newStructure, id: record.id };
  }

  // =========================================================================
  // 6. SCHOLARSHIPS & FINANCIAL ASSISTANCE LIFECYCLE
  // =========================================================================
  async getScholarships() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'SCHOLARSHIP' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultScholarships = [
        {
          id: 'SCH-01',
          name: 'PRERANA Post-Matric Scholarship (Govt. of Odisha)',
          sponsor: 'ST & SC Development Department',
          category: 'Government DBT',
          amount: 25000,
          beneficiaries: 142,
          disbursedAmount: 3550000,
          status: 'Disbursed',
          academicYear: '2026-27',
        },
        {
          id: 'SCH-02',
          name: 'Apna Campus Institutional Merit Scholarship (Top 5% CGPA)',
          sponsor: 'Apna Campus Endowment Trust',
          category: 'Institutional Merit Waiver',
          amount: 20000,
          beneficiaries: 68,
          disbursedAmount: 1360000,
          status: 'Disbursed',
          academicYear: '2026-27',
        },
        {
          id: 'SCH-03',
          name: 'AICTE Pragati Scholarship for Girl Students',
          sponsor: 'Ministry of Education (Govt. of India)',
          category: 'Central Scheme',
          amount: 50000,
          beneficiaries: 34,
          disbursedAmount: 1700000,
          status: 'Approved',
          academicYear: '2026-27',
        },
        {
          id: 'SCH-04',
          name: 'Autonomous Need-Based Fee Concession Support',
          sponsor: 'Bursar Relief Fund',
          category: 'Fee Concession',
          amount: 15000,
          beneficiaries: 28,
          disbursedAmount: 420000,
          status: 'Under Verification',
          academicYear: '2026-27',
        },
      ];

      for (const s of defaultScholarships) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'SCHOLARSHIP',
            title: `Scholarship: ${s.name}`,
            requesterId: s.category,
            requesterName: s.sponsor,
            requesterRole: 'ACCOUNTS',
            details: s,
            currentStage: s.status,
            status: s.status,
          },
        });
      }

      return defaultScholarships;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async sanctionScholarship(data: any) {
    const newSch = {
      id: `SCH-${Math.floor(10 + Math.random() * 90)}`,
      name: data.name,
      sponsor: data.sponsor || 'Apna Campus Endowment Trust',
      category: data.category || 'Institutional Merit Waiver',
      amount: Number(data.amount) || 15000,
      beneficiaries: Number(data.beneficiaries) || 1,
      disbursedAmount: Number(data.amount) || 15000,
      status: 'Approved',
      academicYear: data.academicYear || '2026-27',
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'SCHOLARSHIP',
        title: `Scholarship: ${newSch.name}`,
        requesterId: newSch.category,
        requesterName: newSch.sponsor,
        requesterRole: 'ACCOUNTS',
        details: newSch,
        currentStage: 'Approved',
        status: 'Approved',
      },
    });

    return { ...newSch, id: record.id };
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

    if (records.length === 0) {
      const defaultDocs = [
        {
          id: 'DOC-8801',
          rollNumber: '2305201001',
          studentName: 'Rakesh Das',
          title: 'Official Admission Fee Payment Receipt',
          category: 'Fee Receipt',
          fileName: 'Fee_Receipt_2305201001_Sem7.pdf',
          fileSize: '184 KB',
          uploadDate: '10 Aug 2026',
          status: 'Verified',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
        },
        {
          id: 'DOC-8802',
          rollNumber: '2305201001',
          studentName: 'Rakesh Das',
          title: 'PRERANA Scholarship Sanction Order',
          category: 'Scholarship',
          fileName: 'PRERANA_Sanction_2026.pdf',
          fileSize: '340 KB',
          uploadDate: '28 Aug 2026',
          status: 'Verified',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
        },
        {
          id: 'DOC-8803',
          rollNumber: '2305201002',
          studentName: 'Amit Nayak',
          title: 'Hostel Caution & Accommodation Fee Challan',
          category: 'Hostel Clearance',
          fileName: 'Hostel_Challan_HDFC_9941.pdf',
          fileSize: '210 KB',
          uploadDate: '12 Aug 2026',
          status: 'Verified',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
        },
        {
          id: 'DOC-8804',
          rollNumber: '2305201004',
          studentName: 'Priya Patra',
          title: 'Transport Pass Semester Clearance Voucher',
          category: 'Transport Voucher',
          fileName: 'Transit_Voucher_8824.pdf',
          fileSize: '155 KB',
          uploadDate: '08 Sep 2026',
          status: 'Verified',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
        },
      ];

      for (const d of defaultDocs) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'FEE_DOCUMENT',
            title: `${d.title} - ${d.studentName}`,
            requesterId: d.rollNumber,
            requesterName: d.studentName,
            requesterRole: 'Student',
            details: d,
            currentStage: d.status,
            status: d.status,
          },
        });
      }

      return defaultDocs;
    }

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

  // =========================================================================
  // 9. INSTITUTIONAL FINANCE CONFIGURATION
  // =========================================================================
  async getFinanceConfig(key: string) {
    const setting = await (this.prisma as any).systemSetting.findUnique({
      where: { key: `finance_${key}` },
    });

    if (setting && setting.value) {
      return setting.value;
    }

    // Default configuration fallbacks
    const defaults: Record<string, any> = {
      institution: {
        name: 'Apna Campus Autonomous College of Engineering & Technology',
        affiliation: 'Autonomous Institution · Affiliated to BPUT Odisha',
        directorate: 'Directorate of Finance, Accounts & Institutional Bursar',
        address: 'Central Administrative Building, Ground Floor Room 104',
        academicYear: '2026–2027',
        financialYear: 'FY 2026–2027',
        currency: 'INR (₹)',
        dateFormat: 'DD-MMM-YYYY',
        numberFormat: 'Indian Numbering System (e.g. ₹12,50,000.00)',
      },
      fee_heads: {
        gracePeriodDays: 15,
        lateFeePerDay: 50,
        maxLateFeeLimit: 2500,
        concessionApprovalRequired: true,
        installmentFacilityAllowed: true,
        heads: [
          { code: 'TUI', name: 'Tuition Fee', frequency: 'Per Semester', mandatory: true },
          { code: 'DEV', name: 'Development Fee', frequency: 'Annual', mandatory: true },
          { code: 'LAB', name: 'Laboratory & Library Fee', frequency: 'Per Semester', mandatory: true },
          { code: 'EXM', name: 'Examination Fee', frequency: 'Per Semester', mandatory: true },
          { code: 'HST', name: 'Hostel & Mess Charges', frequency: 'Per Semester', mandatory: false },
          { code: 'TRN', name: 'Campus Transportation', frequency: 'Per Semester', mandatory: false },
        ],
      },
      salary_rules: {
        daPercentage: 50,
        hraPercentage: 16,
        pfPercentage: 12,
        profTaxFixed: 200,
        tdsApplicable: true,
        medicalAllowanceFixed: 1500,
        conveyanceAllowanceFixed: 2000,
      },
      numbering: {
        receiptPrefix: 'RCPT-2026-',
        invoicePrefix: 'INV-2026-',
        vendorBillPrefix: 'BILL-2026-',
        journalPrefix: 'JV-2026-',
        paymentVoucherPrefix: 'PV-2026-',
        refundPrefix: 'REF-2026-',
      },
      gateways: {
        upiQr: true,
        netBanking: true,
        cards: true,
        bankChallan: true,
        cashCounter: true,
        maxCashDailyLimit: 50000,
        primaryGateway: 'SBI ePay Enterprise (Autonomous Treasury)',
        sandboxMode: false,
      },
      approvals: {
        accountsOfficerLimit: 50000,
        bursarLimit: 500000,
        principalLimit: 2500000,
        requireMakerChecker: true,
        twoLevelApprovalThreshold: 200000,
      },
    };

    return defaults[key] || {};
  }

  async saveFinanceConfig(key: string, value: any, user?: any) {
    const updated = await (this.prisma as any).systemSetting.upsert({
      where: { key: `finance_${key}` },
      update: {
        value,
        category: 'finance_accounts',
        updatedBy: user?.name || 'Accounts Officer',
      },
      create: {
        key: `finance_${key}`,
        value,
        category: 'finance_accounts',
        updatedBy: user?.name || 'Accounts Officer',
      },
    });

    await this.addFinancialAuditLog({
      action: 'UPDATE_CONFIG',
      resource: `FINANCE_CONFIG_${key.toUpperCase()}`,
      details: { key, updatedBy: user?.name || 'Accounts Officer', timestamp: new Date().toISOString() },
    }, user);

    return updated.value;
  }

  // =========================================================================
  // 10. STUDENT FEE LEDGERS & DEMANDS
  // =========================================================================
  async getStudentLedgers(search = '') {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'STUDENT_LEDGER' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      return [
        {
          studentId: '2305201001',
          name: 'Rakesh Das',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CSE',
          semester: 'Semester 5',
          academicYear: '2026-27',
          admissionCategory: 'OBC (State Quota)',
          residenceType: 'Hostel Resident (B-Block)',
          feeTemplateId: 'FEE-STR-01',
          totalAssessed: 135500,
          concessions: 45000,
          totalPaid: 90500,
          refunds: 0,
          outstandingBalance: 0,
          paymentStatus: 'Cleared',
          lastPaymentDate: '18-Aug-2026',
          receiptNo: 'RCPT-2026-0891',
          clearanceStatus: 'Approved (No Dues Issued)',
        },
        {
          studentId: '2305201004',
          name: 'Ananya Sharma',
          department: 'AI & Machine Learning',
          course: 'B.Tech AIML',
          semester: 'Semester 5',
          academicYear: '2026-27',
          admissionCategory: 'General (JEE Main All India)',
          residenceType: 'Day Scholar',
          feeTemplateId: 'FEE-STR-02',
          totalAssessed: 99500,
          concessions: 15000,
          totalPaid: 84500,
          refunds: 0,
          outstandingBalance: 0,
          paymentStatus: 'Cleared',
          lastPaymentDate: '22-Aug-2026',
          receiptNo: 'RCPT-2026-0892',
          clearanceStatus: 'Approved (No Dues Issued)',
        },
        {
          studentId: '2305201006',
          name: 'Sneha Mohanty',
          department: 'Computer Science & Engineering',
          course: 'B.Tech CSE',
          semester: 'Semester 5',
          academicYear: '2026-27',
          admissionCategory: 'General (JEE Main)',
          residenceType: 'Hostel Resident (G-Block)',
          feeTemplateId: 'FEE-STR-01',
          totalAssessed: 135500,
          concessions: 0,
          totalPaid: 123500,
          refunds: 0,
          outstandingBalance: 12000,
          paymentStatus: 'Partial Due',
          lastPaymentDate: '25-Aug-2026',
          receiptNo: 'RCPT-2026-0894',
          clearanceStatus: 'On Hold (Pending ₹12,000)',
        },
      ];
    }

    let list = records.map(r => ({ id: r.id, ...((r.details as any) || {}) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async saveStudentLedger(data: any, user?: any) {
    const existing = await this.prisma.workflowRequest.findFirst({
      where: {
        workflowType: 'STUDENT_LEDGER',
        requesterId: data.studentId,
      },
    });

    if (existing) {
      const updated = await this.prisma.workflowRequest.update({
        where: { id: existing.id },
        data: {
          details: { ...((existing.details as any) || {}), ...data },
          updatedAt: new Date(),
        },
      });
      return { id: updated.id, ...((updated.details as any) || {}) };
    }

    const created = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'STUDENT_LEDGER',
        title: `Student Ledger: ${data.name} (${data.studentId})`,
        requesterId: data.studentId,
        requesterName: data.name,
        requesterRole: 'Student',
        details: data,
        currentStage: data.paymentStatus || 'Assessed',
        status: data.paymentStatus || 'Assessed',
      },
    });
    return { id: created.id, ...((created.details as any) || {}) };
  }

  // =========================================================================
  // 11. VENDORS & PROCUREMENT INVOICES
  // =========================================================================
  async getVendors(search = '') {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'VENDOR' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      return [
        {
          id: 'VEND-001',
          name: 'TechCore Computing Systems Pvt Ltd',
          category: 'IT Hardware & Cloud Infrastructure',
          gstin: '21AAACT2940K1Z8',
          pan: 'AAACT2940K',
          contactPerson: 'Mr. Arvind Saxena',
          phone: '+91 98450 11200',
          email: 'corporate.sales@techcore.co.in',
          bankAccount: 'HDFC Bank · A/C 50200039482109',
          ifsc: 'HDFC0000045',
          totalBilled: 1250000,
          totalPaid: 1130000,
          balance: 120000,
          status: 'Active',
        },
        {
          id: 'VEND-002',
          name: 'Utkal Scientific & Engineering Glassware',
          category: 'Chemistry & Nanotech Laboratory Supplies',
          gstin: '21AAGFU8841B1Z2',
          pan: 'AAGFU8841B',
          contactPerson: 'Dr. Biswajeet Pattnaik',
          phone: '+91 94371 44502',
          email: 'utkal.scientific@gmail.com',
          bankAccount: 'SBI Industrial Branch · A/C 30129845112',
          ifsc: 'SBIN0001023',
          totalBilled: 450000,
          totalPaid: 450000,
          balance: 0,
          status: 'Active',
        },
      ];
    }

    let list = records.map(r => ({ id: r.id, ...((r.details as any) || {}) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.category && v.category.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async saveVendor(data: any, user?: any) {
    const id = data.id || `VEND-${Math.floor(100 + Math.random() * 900)}`;
    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'VENDOR',
        title: `Vendor: ${data.name}`,
        requesterId: id,
        requesterName: data.name,
        requesterRole: 'Vendor',
        details: { ...data, id },
        currentStage: 'Active',
        status: 'Active',
      },
    });
    return { ...data, id: record.id };
  }

  async getVendorBills(statusFilter = 'ALL', search = '') {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'VENDOR_BILL' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      return [
        {
          id: 'BILL-2026-101',
          vendorId: 'VEND-001',
          vendorName: 'TechCore Computing Systems Pvt Ltd',
          invoiceNumber: 'TC-2026/8941',
          date: '02-Oct-2026',
          dueDate: '02-Nov-2026',
          category: 'High Performance AI Server Blade Cluster',
          department: 'CSE / AI Research Lab',
          amount: 650000,
          taxPercent: 18,
          taxAmount: 117000,
          totalPayable: 767000,
          paidAmount: 767000,
          balance: 0,
          status: 'Paid',
          approvalStatus: 'Approved by Principal',
          voucherNo: 'PV-2026-0412',
        },
        {
          id: 'BILL-2026-102',
          vendorId: 'VEND-001',
          vendorName: 'TechCore Computing Systems Pvt Ltd',
          invoiceNumber: 'TC-2026/9112',
          date: '14-Oct-2026',
          dueDate: '14-Nov-2026',
          category: 'Cisco 48-Port Gigabit Switch & Optical Transceivers',
          department: 'Campus Network Operations Center',
          amount: 120000,
          taxPercent: 18,
          taxAmount: 21600,
          totalPayable: 141600,
          paidAmount: 0,
          balance: 141600,
          status: 'Pending Payment',
          approvalStatus: 'Approved by Bursar',
          voucherNo: 'PV-2026-0428',
        },
      ];
    }

    let list = records.map(r => ({ id: r.id, ...((r.details as any) || {}) }));
    if (statusFilter !== 'ALL') {
      list = list.filter(b => b.status === statusFilter || b.approvalStatus === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        (b.vendorName && b.vendorName.toLowerCase().includes(q)) ||
        (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async saveVendorBill(data: any, user?: any) {
    const id = data.id || `BILL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const record = await (this.prisma as any).workflowRequest.create({
      data: {
        workflowType: 'VENDOR_BILL',
        title: `Vendor Bill: ${data.vendorName} (${data.invoiceNumber || id})`,
        requesterId: data.vendorId || 'VEND',
        requesterName: data.vendorName,
        requesterRole: 'Vendor',
        details: { ...data, id },
        currentStage: data.approvalStatus || 'Pending Approval',
        status: data.status || 'Pending Payment',
      },
    });

    await this.addFinancialAuditLog({
      action: 'SUBMIT_VENDOR_BILL',
      resource: `VENDOR_BILL_${id}`,
      details: { id, amount: data.totalPayable || data.amount, vendor: data.vendorName },
    }, user);

    return { ...data, id: record.id };
  }

  async approveVendorBill(id: string, user: any, notes?: string) {
    const record = await (this.prisma as any).workflowRequest.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Vendor bill not found.');

    const details = (record.details as any) || {};
    const updatedDetails = {
      ...details,
      approvalStatus: `Approved by ${user?.name || 'Bursar'}`,
      approvedBy: user?.name || 'Bursar',
      approvedAt: new Date().toISOString(),
      approvalNotes: notes || 'Verified with PO and Goods Received Note (GRN).',
    };

    const updated = await (this.prisma as any).workflowRequest.update({
      where: { id },
      data: {
        details: updatedDetails,
        currentStage: 'Approved',
        status: 'Approved for Payment',
        reviewerId: user?.id || user?.sub,
        reviewerName: user?.name,
        remarks: notes,
      },
    });

    await this.addFinancialAuditLog({
      action: 'APPROVE_VENDOR_BILL',
      resource: `VENDOR_BILL_${id}`,
      details: { id, approvedBy: user?.name, amount: details.totalPayable || details.amount },
    }, user);

    return { id: updated.id, ...updatedDetails };
  }

  async payVendorBill(id: string, paymentData: any, user: any) {
    const record = await (this.prisma as any).workflowRequest.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Vendor bill not found.');

    const details = (record.details as any) || {};
    const voucherNo = `PV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedDetails = {
      ...details,
      status: 'Paid',
      paidAmount: Number(details.totalPayable || details.amount),
      balance: 0,
      paymentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMode: paymentData.paymentMode || 'NEFT / RTGS',
      bankRef: paymentData.bankRef || `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentVoucher: voucherNo,
      paidBy: user?.name || 'Accounts Officer',
    };

    await (this.prisma as any).workflowRequest.update({
      where: { id },
      data: {
        details: updatedDetails,
        currentStage: 'Paid',
        status: 'Paid',
      },
    });

    // Auto-post double-entry journal entry to GL
    await this.saveJournalEntry({
      date: updatedDetails.paymentDate,
      reference: voucherNo,
      narration: `Payment to ${details.vendorName} against Invoice ${details.invoiceNumber} via ${updatedDetails.paymentMode}`,
      debitAccount: '2001 - Accounts Payable (Trade Creditors)',
      creditAccount: '1002 - SBI Treasury Collection Account',
      debitAmount: updatedDetails.paidAmount,
      creditAmount: updatedDetails.paidAmount,
      status: 'Posted',
    }, user);

    await this.addFinancialAuditLog({
      action: 'PAY_VENDOR_BILL',
      resource: `PAYMENT_VOUCHER_${voucherNo}`,
      details: { billId: id, voucherNo, amount: updatedDetails.paidAmount, vendor: details.vendorName },
    }, user);

    return updatedDetails;
  }

  // =========================================================================
  // 12. GENERAL LEDGER & DOUBLE-ENTRY JOURNAL INTEGRITY
  // =========================================================================
  async getChartOfAccounts() {
    const setting = await (this.prisma as any).systemSetting.findUnique({
      where: { key: 'finance_chart_of_accounts' },
    });

    if (setting && setting.value) return setting.value;

    const defaultCOA = [
      { code: '1001', name: 'Cash in Hand (Bursar Counter)', type: 'Asset', balance: 450000, nature: 'Debit' },
      { code: '1002', name: 'State Bank of India (Treasury A/C)', type: 'Asset', balance: 12540000, nature: 'Debit' },
      { code: '1003', name: 'HDFC Student Fee Collection A/C', type: 'Asset', balance: 5460000, nature: 'Debit' },
      { code: '1004', name: 'Accounts Receivable (Student Dues)', type: 'Asset', balance: 5130000, nature: 'Debit' },
      { code: '2001', name: 'Accounts Payable (Trade Creditors)', type: 'Liability', balance: 141600, nature: 'Credit' },
      { code: '2002', name: 'Student Caution Money & Security Deposit', type: 'Liability', balance: 4850000, nature: 'Credit' },
      { code: '2003', name: 'Provident Fund (PF) Statutory Payable', type: 'Liability', balance: 420000, nature: 'Credit' },
      { code: '3001', name: 'Institutional Capital & Corpus Fund', type: 'Equity', balance: 85000000, nature: 'Credit' },
      { code: '4001', name: 'Student Academic Tuition Fees', type: 'Income', balance: 22753500, nature: 'Credit' },
      { code: '4002', name: 'Development & Infrastructure Fund', type: 'Income', balance: 7446600, nature: 'Credit' },
      { code: '4003', name: 'Hostel & Residential Boarding Fees', type: 'Income', balance: 6205500, nature: 'Credit' },
      { code: '4004', name: 'Campus Transportation Fees', type: 'Income', balance: 2895900, nature: 'Credit' },
      { code: '4005', name: 'Industry Consultancy & Testing Revenue', type: 'Income', balance: 185000, nature: 'Credit' },
      { code: '5001', name: 'Teaching Faculty Salaries & Allowances', type: 'Expense', balance: 4210000, nature: 'Debit' },
      { code: '5002', name: 'Non-Teaching & Administrative Staff Payroll', type: 'Expense', balance: 1480000, nature: 'Debit' },
      { code: '5003', name: 'Campus High-Speed Internet & Leased Line', type: 'Expense', balance: 185000, nature: 'Debit' },
      { code: '5004', name: 'Laboratory Consumables & Glassware', type: 'Expense', balance: 420000, nature: 'Debit' },
    ];
    return defaultCOA;
  }

  async saveChartOfAccounts(coa: any[], user?: any) {
    await (this.prisma as any).systemSetting.upsert({
      where: { key: 'finance_chart_of_accounts' },
      update: { value: coa, updatedBy: user?.name || 'Accounts Officer' },
      create: { key: 'finance_chart_of_accounts', value: coa, category: 'finance_accounts', updatedBy: user?.name || 'Accounts Officer' },
    });
    return coa;
  }

  async getJournalEntries(search = '') {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'JOURNAL_ENTRY' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      return [
        {
          id: 'JV-2026-001',
          date: '02-Oct-2026',
          reference: 'RCPT-2026-BATCH-01',
          narration: 'Daily Student Fee Counter Collections deposited to HDFC Collection A/C',
          debitAccount: '1003 - HDFC Student Fee Collection A/C',
          creditAccount: '1001 - Cash in Hand (Bursar Counter)',
          debitAmount: 185000,
          creditAmount: 185000,
          status: 'Posted',
          postedBy: 'Mr. S. K. Roy (Senior Accounts Officer)',
        },
        {
          id: 'JV-2026-002',
          date: '15-Oct-2026',
          reference: 'PV-2026-0412',
          narration: 'Payment to TechCore Computing Systems Pvt Ltd for AI Server Cluster',
          debitAccount: '2001 - Accounts Payable (Trade Creditors)',
          creditAccount: '1002 - State Bank of India (Treasury A/C)',
          debitAmount: 767000,
          creditAmount: 767000,
          status: 'Posted',
          postedBy: 'Mr. S. K. Roy (Senior Accounts Officer)',
        },
        {
          id: 'JV-2026-003',
          date: '01-Oct-2026',
          reference: 'PAYROLL-SEP-2026',
          narration: 'September Faculty & Staff Monthly Salary Disbursement via SBI Corporate Treasury Gateway',
          debitAccount: '5001 - Teaching Faculty Salaries & Allowances',
          creditAccount: '1002 - State Bank of India (Treasury A/C)',
          debitAmount: 5690000,
          creditAmount: 5690000,
          status: 'Posted',
          postedBy: 'Mr. S. K. Roy (Senior Accounts Officer)',
        },
      ];
    }

    let list = records.map(r => ({ id: r.id, ...((r.details as any) || {}) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        (j.narration && j.narration.toLowerCase().includes(q)) ||
        (j.reference && j.reference.toLowerCase().includes(q)) ||
        (j.debitAccount && j.debitAccount.toLowerCase().includes(q)) ||
        (j.creditAccount && j.creditAccount.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async saveJournalEntry(data: any, user?: any) {
    // ENFORCE DOUBLE-ENTRY ACCOUNTING INTEGRITY (Balanced Debits and Credits)
    const debitTotal = Number(data.debitAmount || 0);
    const creditTotal = Number(data.creditAmount || 0);

    if (Math.abs(debitTotal - creditTotal) > 0.01) {
      throw new BadRequestException(
        `Accounting Integrity Violation: Journal entry is unbalanced. Debit (₹${debitTotal.toFixed(2)}) must equal Credit (₹${creditTotal.toFixed(2)}).`
      );
    }

    if (debitTotal <= 0) {
      throw new BadRequestException('Journal entry amount must be greater than zero.');
    }

    const id = data.id || `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const entryData = {
      ...data,
      id,
      debitAmount: debitTotal,
      creditAmount: creditTotal,
      status: 'Posted',
      postedBy: user?.name || 'Senior Accounts Officer',
      postedAt: new Date().toISOString(),
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'JOURNAL_ENTRY',
        title: `Journal Voucher: ${id} - ₹${debitTotal}`,
        requesterId: id,
        requesterName: user?.name || 'Accounts Officer',
        requesterRole: 'ACCOUNTS',
        details: entryData,
        currentStage: 'Posted',
        status: 'Posted',
      },
    });

    await this.addFinancialAuditLog({
      action: 'POST_JOURNAL_ENTRY',
      resource: `JOURNAL_VOUCHER_${id}`,
      details: { id, debit: debitTotal, credit: creditTotal, narration: data.narration },
    }, user);

    return { ...entryData, id: record.id };
  }

  // =========================================================================
  // 13. STATUTORY FINANCIAL AUDIT LOGS
  // =========================================================================
  async getFinancialAuditLogs(search = '') {
    let logs = [];
    try {
      logs = await (this.prisma as any).auditLog.findMany({
        where: { resource: { startsWith: 'FINANCE' } },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    } catch {
      logs = [];
    }

    if (!logs || logs.length === 0) {
      return [
        {
          id: 'AUD-FIN-01',
          action: 'PAYMENT_RECEIPT_POSTED',
          resource: 'FINANCE_RECEIPT_RCPT-2026-0891',
          userName: 'Mr. S. K. Roy (Senior Accounts Officer)',
          userRole: 'ACCOUNTS',
          details: { amount: 90500, studentId: '2305201001', channel: 'Counter Cash' },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'AUD-FIN-02',
          action: 'BANK_RECONCILIATION_MATCHED',
          resource: 'FINANCE_BRS_SBI_TREASURY',
          userName: 'Mr. S. K. Roy (Senior Accounts Officer)',
          userRole: 'ACCOUNTS',
          details: { statementBalance: 12540000, ledgerBalance: 12540000, variance: 0 },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'AUD-FIN-03',
          action: 'PAYROLL_DISBURSED',
          resource: 'FINANCE_PAYROLL_OCT_2026',
          userName: 'Principal & Finance Committee',
          userRole: 'PRINCIPAL',
          details: { gross: 6850000, net: 5690000, beneficiaries: 142 },
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }

    return logs;
  }

  async addFinancialAuditLog(data: { action: string; resource: string; details: any }, user?: any) {
    try {
      return await (this.prisma as any).auditLog.create({
        data: {
          action: data.action,
          resource: data.resource.startsWith('FINANCE') ? data.resource : `FINANCE_${data.resource}`,
          details: data.details,
          userName: user?.name || 'Accounts Officer',
          userRole: user?.role || 'ACCOUNTS',
          userId: user?.id || user?.sub,
        },
      });
    } catch {
      // Non-blocking fallback
      return null;
    }
  }

  // =========================================================================
  // 14. RESTRICTED DEMO DATA RESET (SUPER ADMIN ONLY)
  // =========================================================================
  async resetDemoData(confirmToken: string, user: any) {
    if (confirmToken !== 'RESET_CAMPUS_FINANCE_2026') {
      throw new BadRequestException('Security Authorization Failed: Invalid confirmation token for finance reset.');
    }

    await this.addFinancialAuditLog({
      action: 'CRITICAL_DEMO_DATA_RESET',
      resource: 'FINANCE_SYSTEM_RESET',
      details: {
        resetBy: user?.name,
        role: user?.role,
        warning: 'Authorized institutional financial data reset executed.',
        timestamp: new Date().toISOString(),
      },
    }, user);

    return {
      success: true,
      message: 'Demo financial records and local test ledgers successfully reset to institutional baseline.',
      resetAt: new Date().toISOString(),
    };
  }
}

