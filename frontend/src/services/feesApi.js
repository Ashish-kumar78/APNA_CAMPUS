// Fee Payment Proof & Verification API Handler with Live Endpoint Calling and Initial Mock Fallback

import { api } from './api';

// Mock In-Memory Storage for dynamic testing when backend is offline
let mockPaymentProofs = [
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

export const feesApi = {
  // 1. Fetch Financial Dashboard Metrics & KPIs
  getDashboardStats: async (query = {}) => {
    try {
      const res = await api.getFeeDashboardStats(query);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return {
      totalAssessed: 41370000,
      totalCollected: 36240000,
      totalOutstanding: 5130000,
      collectionRate: 87.6,
      studentsWithDues: 54,
      pendingVerificationsCount: mockPaymentProofs.filter(p => p.status === 'PENDING').length,
      pendingVerificationsSum: mockPaymentProofs.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0),
      failedTransactionsCount: 2,
      scholarshipsSanctioned: 8610000,
      scholarshipsDisbursed: 6610000,
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
  },

  // 2. Fetch Fee Statement & Payment History for Student
  getFeeStatement: async (rollNumber = '2305201001') => {
    try {
      const res = await api.getFeeStatement(rollNumber);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    const studentHistory = mockPaymentProofs.filter(
      (item) => item.rollNumber === rollNumber || item.rollNumber === '2305201037' || item.rollNumber === '2305201001'
    );
    return {
      student: {
        studentName: 'Rakesh Das',
        rollNumber: '2305201001',
        department: 'Computer Science & Engineering',
        program: 'B.Tech (Autonomous)',
        semester: 'Semester 7 (4th Year)',
        academicYear: '2026-27',
        category: 'General',
        quota: 'State Counselling (OJEE)',
      },
      totalAnnualDues: 98500,
      paidAmount: 86500,
      scholarshipCredit: 15000,
      outstanding: 12000,
      nextDueDate: '15 Nov 2026',
      feeHeads: [
        { id: 'FH-01', head: 'Tuition Fee (Autumn Term)', assessed: 38000, paid: 38000, balance: 0, dueDate: '15 Aug 2026', status: 'Cleared' },
        { id: 'FH-02', head: 'Development & Infrastructure Fee', assessed: 10500, paid: 10500, balance: 0, dueDate: '15 Aug 2026', status: 'Cleared' },
        { id: 'FH-03', head: 'Laboratory & Computing Systems Fee', assessed: 6000, paid: 6000, balance: 0, dueDate: '30 Aug 2026', status: 'Cleared' },
        { id: 'FH-04', head: 'Autonomous Semester Examination Fee', assessed: 2500, paid: 2500, balance: 0, dueDate: '10 Sep 2026', status: 'Cleared' },
        { id: 'FH-05', head: 'Central Library & Digital ERP Access', assessed: 1500, paid: 1500, balance: 0, dueDate: '10 Sep 2026', status: 'Cleared' },
        { id: 'FH-06', head: 'Hostel & Residential Boarding', assessed: 28000, paid: 20000, balance: 8000, dueDate: '15 Nov 2026', status: 'Partial' },
        { id: 'FH-07', head: 'Mess Catering Charges (Installment 2)', assessed: 12000, paid: 8000, balance: 4000, dueDate: '15 Nov 2026', status: 'Partial' },
      ],
      paymentHistory: studentHistory,
    };
  },

  // 3. Upload Fee Payment Proof
  uploadPaymentProof: async (payload) => {
    try {
      const res = await api.uploadPaymentProof(payload);
      if (res && res.success) return res;
    } catch {
      // Fallback
    }

    const newProof = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: payload.studentName || 'Rakesh Das',
      rollNumber: payload.rollNumber || '2305201001',
      department: payload.department || 'Computer Science & Engineering',
      amount: Number(payload.amount),
      paymentDate: payload.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: payload.paymentMethod || 'UPI',
      transactionId: payload.transactionId || `TXN${Date.now()}`,
      referenceNumber: payload.referenceNumber || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: payload.remarks || '',
      proofUrl: payload.previewUrl || payload.fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      fileName: payload.fileName || 'payment_proof.jpg',
      fileType: payload.fileType || 'image/jpeg',
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      rejectionReason: null,
      ocrMatch: { txnMatch: 'VERIFYING', amountMatch: 'MATCH', confidence: 95 },
    };

    mockPaymentProofs.unshift(newProof);
    return {
      success: true,
      message: 'Payment proof submitted successfully for verification!',
      data: newProof,
    };
  },

  // 4. Fetch All Pending/Reviewed Payment Proofs
  getPaymentVerifications: async (statusFilter = 'ALL', search = '') => {
    try {
      const res = await api.getPaymentVerifications(statusFilter, search);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }

    let filtered = [...mockPaymentProofs];
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.rollNumber.toLowerCase().includes(q) ||
          item.transactionId.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  // 5. Approve Payment Verification
  approvePayment: async (id) => {
    try {
      const res = await api.approvePaymentProof(id);
      if (res && res.success) return res;
    } catch {
      // Fallback
    }

    mockPaymentProofs = mockPaymentProofs.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'APPROVED',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
          verifiedAt: new Date().toISOString(),
          rejectionReason: null,
        };
      }
      return item;
    });

    return {
      success: true,
      message: 'Payment verified and approved! Student fee ledger updated.',
    };
  },

  // 6. Reject Payment Verification
  rejectPayment: async (id, rejectionReason) => {
    try {
      const res = await api.rejectPaymentProof(id, rejectionReason);
      if (res && res.success) return res;
    } catch {
      // Fallback
    }

    mockPaymentProofs = mockPaymentProofs.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'REJECTED',
          verifiedBy: 'Accounts Officer (Subhashree Jena)',
          verifiedAt: new Date().toISOString(),
          rejectionReason: rejectionReason || 'Transaction proof could not be validated.',
        };
      }
      return item;
    });

    return {
      success: true,
      message: 'Payment rejected. Reason sent to student.',
    };
  },

  // 7. Fee Structures
  getFeeStructures: async () => {
    try {
      const res = await api.getFeeStructures();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  createFeeStructure: async (payload) => {
    return api.createFeeStructure(payload);
  },

  // 8. Fee Transactions
  getFeeTransactions: async (search = '') => {
    try {
      const res = await api.getFeeTransactions(search);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  recordFeePayment: async (payload) => {
    return api.recordFeePayment(payload);
  },

  // 9. Scholarships
  getScholarships: async () => {
    try {
      const res = await api.getScholarships();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  sanctionScholarship: async (payload) => {
    return api.sanctionScholarship(payload);
  },

  // 10. Financial Reports & Documents
  getFinancialReports: async (type = 'DAILY_COLLECTION') => {
    try {
      const res = await api.getFinancialReports(type);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  getStudentDocuments: async (rollNumber = '') => {
    try {
      const res = await api.getStudentFinancialDocuments(rollNumber);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  // 11. Institutional Finance Configuration
  getFinanceConfig: async (key) => {
    try {
      const res = await api.getFinanceConfig(key);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  saveFinanceConfig: async (key, payload) => {
    try {
      const res = await api.saveFinanceConfig(key, payload);
      if (res && res.success) return res.data;
    } catch (err) {
      console.warn(`Failed to save config for ${key}:`, err);
    }
    return payload;
  },

  // 12. Student Fee Ledgers
  getStudentLedgers: async (search = '') => {
    try {
      const res = await api.getStudentLedgers(search);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  saveStudentLedger: async (payload) => {
    return api.saveStudentLedger(payload);
  },

  // 13. Vendors & Invoices
  getFinanceVendors: async (search = '') => {
    try {
      const res = await api.getFinanceVendors(search);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  saveFinanceVendor: async (payload) => {
    return api.saveFinanceVendor(payload);
  },

  getFinanceVendorBills: async (status = 'ALL', search = '') => {
    try {
      const res = await api.getFinanceVendorBills(status, search);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  saveFinanceVendorBill: async (payload) => {
    return api.saveFinanceVendorBill(payload);
  },

  approveFinanceVendorBill: async (id, notes = '') => {
    return api.approveFinanceVendorBill(id, notes);
  },

  payFinanceVendorBill: async (id, payload) => {
    return api.payFinanceVendorBill(id, payload);
  },

  // 14. Chart of Accounts & General Ledger
  getChartOfAccounts: async () => {
    try {
      const res = await api.getChartOfAccounts();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  saveChartOfAccounts: async (payload) => {
    return api.saveChartOfAccounts(payload);
  },

  getJournalEntries: async (search = '') => {
    try {
      const res = await api.getJournalEntries(search);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  saveJournalEntry: async (payload) => {
    return api.saveJournalEntry(payload);
  },

  // 15. Financial Audit Logs
  getFinancialAuditLogs: async (search = '') => {
    try {
      const res = await api.getFinancialAuditLogs(search);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  addFinancialAuditLog: async (payload) => {
    try {
      const res = await api.addFinancialAuditLog(payload);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return null;
  },

  // 16. Sandbox Reset (Super Admin ONLY)
  resetFinanceDemoData: async (confirmToken) => {
    return api.resetFinanceDemoData(confirmToken);
  },
};
export default feesApi;

