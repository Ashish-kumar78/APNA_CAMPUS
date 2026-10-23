// Fee API client. Business results come from the authenticated NestJS API.

import { api } from './api';

export const feesApi = {
  // 1. Fetch Financial Dashboard Metrics & KPIs
  getDashboardStats: async (query = {}) => {
    const res = await api.getFeeDashboardStats(query);
    if (!res?.success) throw new Error('Financial dashboard service returned an invalid response.');
    return res.data;
  },

  // 2. Fetch the authenticated student's official fee statement.
  getFeeStatement: async (rollNumber = '') => {
    const res = await api.getFeeStatement(rollNumber);
    if (!res?.success) throw new Error('Fee statement service returned an invalid response.');
    return res.data;
  },

  // 3. Upload Fee Payment Proof
  uploadPaymentProof: async (payload) => {
    return api.uploadPaymentProof(payload);
  },

  getMyPaymentProofs: async () => {
    const res = await api.getMyPaymentProofs();
    if (!res?.success || !Array.isArray(res.data)) throw new Error('Payment proof history is unavailable.');
    return res.data;
  },

  // 4. Fetch All Pending/Reviewed Payment Proofs
  getPaymentVerifications: async (statusFilter = 'ALL', search = '') => {
    const res = await api.getPaymentVerifications(statusFilter, search);
    if (!res?.success || !Array.isArray(res.data)) throw new Error('Payment verification service returned an invalid response.');
    return res.data;
  },

  getPaymentProofFile: async (id) => {
    const res = await api.getPaymentProofFile(id);
    if (!res?.success || !res.data?.fileData) throw new Error('Payment proof file is unavailable.');
    return res.data;
  },

  // 5. Approve Payment Verification
  approvePayment: async (id) => {
    return api.approvePaymentProof(id);
  },

  // 6. Reject Payment Verification
  rejectPayment: async (id, rejectionReason) => {
    return api.rejectPaymentProof(id, rejectionReason);
  },

  // 7. Fee Structures
  getFeeStructures: async () => {
    const res = await api.getFeeStructures();
    if (!res?.success || !Array.isArray(res.data)) throw new Error('Fee structure service returned an invalid response.');
    return res.data;
  },

  createFeeStructure: async (payload) => {
    return api.createFeeStructure(payload);
  },

  // 8. Fee Transactions
  getFeeTransactions: async (search = '') => {
    const res = await api.getFeeTransactions(search);
    if (!res?.success || !Array.isArray(res.data)) throw new Error('Fee transaction service returned an invalid response.');
    return res.data;
  },

  recordFeePayment: async (payload) => {
    return api.recordFeePayment(payload);
  },

  // 9. Scholarships
  getScholarships: async () => {
    const res = await api.getScholarships();
    if (!res?.success || !Array.isArray(res.data)) throw new Error('Scholarship service returned an invalid response.');
    return res.data;
  },

  sanctionScholarship: async (payload) => {
    return api.sanctionScholarship(payload);
  },

  // 10. Financial Reports & Documents
  getFinancialReports: async (type = 'DAILY_COLLECTION') => {
    const res = await api.getFinancialReports(type);
    if (!res?.success) throw new Error('Financial report service returned an invalid response.');
    return res.data;
  },

  getStudentDocuments: async (rollNumber = '') => {
    const res = await api.getStudentFinancialDocuments(rollNumber);
    if (!res?.success || !Array.isArray(res.data)) throw new Error('Financial document service returned an invalid response.');
    return res.data;
  },
};
export default feesApi;
