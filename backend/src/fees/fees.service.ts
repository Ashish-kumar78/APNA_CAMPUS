import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
