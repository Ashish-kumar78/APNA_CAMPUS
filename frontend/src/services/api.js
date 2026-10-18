// Central API Client connecting Frontend to NestJS Backend (http://localhost:4000/api)

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getAuthHeader() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('collegeflow_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`API call to ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // 1. Authentication
  login: async (identifier, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.success && res.accessToken) {
      localStorage.setItem('collegeflow_token', res.accessToken);
      localStorage.setItem('collegeflow_user', JSON.stringify(res.user));
    }
    return res;
  },

  getMe: () => request('/auth/me'),

  logout: () => {
    localStorage.removeItem('collegeflow_token');
    localStorage.removeItem('collegeflow_user');
    return request('/auth/logout', { method: 'POST' }).catch(() => ({}));
  },

  // 2. Students & Profile
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? '?' + query : ''}`);
  },

  getProfile: () => request('/students/profile'),

  saveTransferPreference: (campus, city, confirmed = true) =>
    request('/students/transfer-preference', {
      method: 'POST',
      body: JSON.stringify({ campus, city, confirmed }),
    }),

  // 3. Marks & Continuous Assessment
  getStudentMarks: (rollNumber = '01') => request(`/marks/student?rollNumber=${rollNumber}`),

  getSectionMarks: (subjectCode, section = 'Section A') =>
    request(`/marks/section/${subjectCode}?section=${section}`),

  updateCellMark: (payload) =>
    request('/marks/cell', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getApprovalQueue: () => request('/marks/approval-queue'),

  submitMarksToHod: (payload) =>
    request('/marks/submit-to-hod', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  approveMarks: (id) =>
    request('/marks/hod/approve', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  rejectMarks: (id, rejectionReason) =>
    request('/marks/hod/reject', {
      method: 'POST',
      body: JSON.stringify({ id, rejectionReason }),
    }),

  unlockMarks: (id) =>
    request('/marks/hod/unlock', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),

  getMarkingScheme: () => request('/marks/scheme'),

  // 4. Academics
  getDepartments: () => request('/academics/departments'),
  getSemesters: () => request('/academics/semesters'),
  getSections: () => request('/academics/sections'),
  getSubjects: (dept, sem) => {
    const query = new URLSearchParams({ department: dept || '', semester: sem || '' }).toString();
    return request(`/academics/subjects?${query}`);
  },
  getTimetable: () => request('/academics/timetable'),

  // 5. Fees & Accounts
  getFeeStatement: (rollNumber = '01') => request(`/fees/statement?rollNumber=${rollNumber}`),
  getFeeTransactions: (search = '') => request(`/fees/transactions?search=${encodeURIComponent(search)}`),
  recordFeePayment: (payload) =>
    request('/fees/record', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // 6. Hostel
  getHostels: () => request('/hostel/list'),
  getHostelDashboardStats: () => request('/hostel/dashboard-stats'),
  getHostelRooms: (hostelId, floor) => {
    const q = new URLSearchParams();
    if (hostelId) q.append('hostelId', hostelId);
    if (floor) q.append('floor', floor);
    const qs = q.toString();
    return request(`/hostel/rooms${qs ? '?' + qs : ''}`);
  },
  allocateBed: (payload) =>
    request('/hostel/allocate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  transferBed: (payload) =>
    request('/hostel/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  vacateBed: (studentRoll, reason) =>
    request('/hostel/vacate', {
      method: 'POST',
      body: JSON.stringify({ studentRoll, reason }),
    }),
  getMyResidence: (rollNumber = '01') => request(`/hostel/my-residence?rollNumber=${rollNumber}`),
  getComplaints: (params = {}) => {
    // Supports both legacy string (rollNumber) or object payload with filters
    let q = new URLSearchParams();
    if (typeof params === 'string') {
      q.append('rollNumber', params);
    } else if (typeof params === 'object' && params !== null) {
      if (params.rollNumber) q.append('rollNumber', params.rollNumber);
      if (params.category && params.category !== 'ALL') q.append('category', params.category);
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.assignedStaffId) q.append('assignedStaffId', params.assignedStaffId);
      if (params.needsReview !== undefined) q.append('needsReview', String(params.needsReview));
      if (params.search) q.append('search', params.search);
    }
    const qs = q.toString();
    return request(`/hostel/complaints${qs ? '?' + qs : ''}`);
  },
  previewAIComplaint: (text, categoryHint) =>
    request('/hostel/complaints/preview-ai', {
      method: 'POST',
      body: JSON.stringify({ text, categoryHint }),
    }),
  previewVisionComplaint: (imageBase64, filename, locationHint) =>
    request('/hostel/complaints/preview-vision', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename, locationHint }),
    }),
  lodgeComplaint: (payload) =>
    request('/hostel/complaints', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTriageComplaints: () => request('/hostel/complaints/triage'),
  updateComplaintStatus: (id, statusOrPayload, assignedStaff, resolutionNotes) => {
    const body = typeof statusOrPayload === 'object'
      ? statusOrPayload
      : { status: statusOrPayload, assignedStaff, resolutionNotes };
    return request(`/hostel/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  reassignComplaint: (id, payload) =>
    request(`/hostel/complaints/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getStaffRosterWithWorkload: () => request('/hostel/staff-roster'),
  getVisitors: () => request('/hostel/visitors'),
  issueVisitorPass: (payload) =>
    request('/hostel/visitors', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  checkInVisitor: (id, badgeNumber) =>
    request(`/hostel/visitors/${id}/checkin`, {
      method: 'PATCH',
      body: JSON.stringify({ badgeNumber }),
    }),
  checkOutVisitor: (id) =>
    request(`/hostel/visitors/${id}/checkout`, {
      method: 'PATCH',
    }),
  getHostelGatePasses: (status, hostel) => {
    const q = new URLSearchParams();
    if (status) q.append('status', status);
    if (hostel) q.append('hostel', hostel);
    const qs = q.toString();
    return request(`/hostel/gate-passes${qs ? '?' + qs : ''}`);
  },
  createHostelGatePass: (payload) =>
    request('/hostel/gate-passes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  actionHostelGatePass: (id, action, remarks) =>
    request(`/hostel/gate-passes/${id}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ action, remarks }),
    }),
  getHostelDocuments: (rollNumber) =>
    request(`/hostel/documents${rollNumber ? '?rollNumber=' + rollNumber : ''}`),
  verifyHostelDocument: (id, status, notes) =>
    request(`/hostel/documents/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // 7. Canteen
  getCanteenMenu: () => request('/canteen/menu'),
  addFoodItem: (payload) =>
    request('/canteen/menu', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  toggleFoodAvailability: (id) => request(`/canteen/menu/${id}/toggle`, { method: 'PATCH' }),
  getCanteenOrders: () => request('/canteen/orders'),
  placeCanteenOrder: (payload) =>
    request('/canteen/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCanteenOrderStatus: (id, status) =>
    request(`/canteen/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  topUpCanteenWallet: (amount, rollNumber = '01') =>
    request('/canteen/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, rollNumber }),
    }),

  // 8. CMS (Notices, Holidays, Blogs, Feedback)
  getNotices: (search = '', tag = '') =>
    request(`/cms/notices?search=${encodeURIComponent(search)}&tag=${encodeURIComponent(tag)}`),
  getHolidays: () => request('/cms/holidays'),
  getBlogs: (tag = '') => request(`/cms/blogs?tag=${encodeURIComponent(tag)}`),
  createBlog: (payload) =>
    request('/cms/blogs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  likeBlog: (id) => request(`/cms/blogs/${id}/like`, { method: 'POST' }),
  submitFeedback: (payload) =>
    request('/cms/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getBiometricLogs: (direction = 'ALL') => request(`/cms/biometric-logs?direction=${direction}`),

  // 9. Admin & Staff Rosters
  getAdminMetrics: () => request('/admin/metrics'),
  getStaffRosters: (type = 'All', search = '') =>
    request(`/admin/staff?type=${type}&search=${encodeURIComponent(search)}`),
  createStaff: (payload) =>
    request('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteStaff: (id) => request(`/admin/staff/${id}`, { method: 'DELETE' }),
  getAuditLogs: (search = '') => request(`/admin/audit-logs?search=${encodeURIComponent(search)}`),

  // 10. AI Campus Assistant
  askChatbot: (message, history = [], context = {}, user = null) =>
    request('/chatbot/query', {
      method: 'POST',
      body: JSON.stringify({ message, history, context, user }),
    }),

  // 11. Autonomous Examination Management (CoE)
  getExamDashboardStats: () => request('/exams/dashboard-stats'),
  getExamCycles: () => request('/exams/cycles'),
  createExamCycle: (payload) =>
    request('/exams/cycles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  transitionExamCycle: (id, status) =>
    request(`/exams/cycles/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  getExamTimetable: () => request('/exams/timetable'),
  createExamTimetableSlot: (payload) =>
    request('/exams/timetable', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getExamSeating: () => request('/exams/seating'),
  autoOptimizeExamSeating: () =>
    request('/exams/seating/auto-optimize', {
      method: 'POST',
    }),
  getExamHallTickets: () => request('/exams/hall-tickets'),
  getExamModerationMarks: (subjectCode = 'CS501') =>
    request(`/exams/moderation/${subjectCode}`),
  getExamGradeRoster: () => request('/exams/results/roster'),
  getExamReevaluations: () => request('/exams/re-evaluation'),
  getExamCirculars: () => request('/exams/circulars'),
  getExamSchedules: () => request('/exam-cell/schedules'),
  createExamSchedule: (payload) =>
    request('/exam-cell/schedules', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  publishExamResults: (examCode) =>
    request('/exam-cell/publish-results', {
      method: 'POST',
      body: JSON.stringify({ examCode }),
    }),

  // 12. Central Library Information System
  getLibraryDashboardStats: () => request('/library/dashboard-stats'),
  getLibraryBooks: (search = '', department = '', category = '') => {
    const q = new URLSearchParams({ search, department, category }).toString();
    return request(`/library/books?${q}`);
  },
  createLibraryBook: (payload) =>
    request('/library/books', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getLibraryCopies: (bookId = '') =>
    request(`/library/copies${bookId ? `?bookId=${bookId}` : ''}`),
  registerLibraryCopy: (payload) =>
    request('/library/copies', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateLibraryCopyStatus: (copyId, payload) =>
    request(`/library/copies/${copyId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getLibraryTransactions: (studentRoll = '', status = '') => {
    const q = new URLSearchParams();
    if (studentRoll) q.append('studentRoll', studentRoll);
    if (status) q.append('status', status);
    return request(`/library/transactions?${q.toString()}`);
  },
  issueLibraryBook: (payload) =>
    request('/library/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  issueBook: (payload) =>
    request('/library/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  returnLibraryBook: (transactionId) =>
    request('/library/return', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    }),
  returnBook: (transactionId) =>
    request('/library/return', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    }),
  renewLibraryBook: (transactionId) =>
    request('/library/renew', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    }),
  getLibraryReservations: () => request('/library/reservations'),
  createLibraryReservation: (payload) =>
    request('/library/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancelLibraryReservation: (id) =>
    request(`/library/reservations/${id}`, {
      method: 'DELETE',
    }),
  getLibraryFines: () => request('/library/fines'),
  settleLibraryFine: (payload) =>
    request('/library/fines/settle', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  waiveLibraryFine: (payload) =>
    request('/library/fines/waive', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getLibraryAcquisitions: () => request('/library/acquisitions'),
  createLibraryAcquisition: (payload) =>
    request('/library/acquisitions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getLibraryDigitalResources: (search = '') =>
    request(`/library/digital-resources${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getLibraryPolicies: () => request('/library/policies'),

  // 13. Placement
  getPlacementDrives: () => request('/placement/drives'),
  createPlacementDrive: (payload) =>
    request('/placement/drives', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  applyToPlacementDrive: (driveId, cgpa) =>
    request('/placement/apply', {
      method: 'POST',
      body: JSON.stringify({ driveId, cgpa }),
    }),
  getPlacementApplications: (driveId) =>
    request(`/placement/applications${driveId ? '?driveId=' + driveId : ''}`),

  // 14. Transport Fleet
  getTransportRoutes: () => request('/transport/routes'),
  createTransportRoute: (payload) =>
    request('/transport/routes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // 15. Staff (Labs & Campus Operations)
  getLabEquipment: (department = '') =>
    request(`/staff/equipment${department ? '?department=' + department : ''}`),
  updateEquipmentStatus: (code, condition) =>
    request(`/staff/equipment/${code}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ condition }),
    }),
  getStaffDashboardStats: () => request('/staff/dashboard-stats'),
  getStaffTickets: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/staff/tickets${q ? '?' + q : ''}`);
  },
  createStaffTicket: (payload) =>
    request('/staff/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateStaffTicketStatus: (id, status, resolutionDetails, cancelReason) =>
    request(`/staff/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionDetails, cancelReason }),
    }),
  assignStaffTicket: (id, assignedTo) =>
    request(`/staff/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    }),
  addStaffTicketComment: (id, comment, isInternal = false) =>
    request(`/staff/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, isInternal }),
    }),
  getStaffVisitors: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/staff/visitors${q ? '?' + q : ''}`);
  },
  createStaffVisitor: (payload) =>
    request('/staff/visitors', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  actionStaffVisitor: (id, action, badgeNumber) =>
    request(`/staff/visitors/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, badgeNumber }),
    }),
  getStaffDispatches: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/staff/dispatches${q ? '?' + q : ''}`);
  },
  createStaffDispatch: (payload) =>
    request('/staff/dispatches', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateStaffDispatchStatus: (id, status, notes) =>
    request(`/staff/dispatches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // 16. Workflow & Multi-Stage Approvals
  getWorkflowRequests: () => request('/workflow/requests'),
  createWorkflowRequest: (payload) =>
    request('/workflow/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  actionWorkflowRequest: (id, action, notes) =>
    request(`/workflow/requests/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),

  // 18. Campus Transit & Logistics Operations
  getTransportDashboardStats: () => request('/transport/dashboard-stats'),
  getTransportFleet: () => request('/transport/fleet'),
  createTransportVehicle: (payload) =>
    request('/transport/fleet', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateVehicleStatus: (id, status, notes) =>
    request(`/transport/fleet/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  updateVehicleCompliance: (id, compliance) =>
    request(`/transport/fleet/${id}/compliance`, {
      method: 'PATCH',
      body: JSON.stringify(compliance),
    }),
  getTransportDrivers: () => request('/transport/drivers'),
  createTransportDriver: (payload) =>
    request('/transport/drivers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTransportRoutes: () => request('/transport/routes'),
  createTransportRoute: (payload) =>
    request('/transport/routes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRouteDisruption: (id, disruptionNotice) =>
    request(`/transport/routes/${id}/disruption`, {
      method: 'PATCH',
      body: JSON.stringify({ disruptionNotice }),
    }),
  getTransportPasses: () => request('/transport/passes'),
  allocateTransport: (payload) =>
    request('/transport/passes/allocate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  actionTransportPass: (id, action, notes) =>
    request(`/transport/passes/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),
  getTransportTrips: () => request('/transport/trips'),
  actionTransportTrip: (id, action, payload = {}) =>
    request(`/transport/trips/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, ...payload }),
    }),
  getTransportTelemetry: () => request('/transport/telemetry'),

  // 19. Training & Placement Cell Operations
  getPlacementDashboardStats: () => request('/placement/dashboard-stats'),
  getPlacementCompanies: () => request('/placement/companies'),
  createPlacementCompany: (payload) =>
    request('/placement/companies', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getPlacementDrives: () => request('/placement/drives'),
  createPlacementDrive: (payload) =>
    request('/placement/drives', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updatePlacementDriveStatus: (id, status) =>
    request(`/placement/drives/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  evaluateDriveEligibility: (id) => request(`/placement/drives/${id}/evaluate`),
  applyToPlacementDrive: (driveId, cgpa) =>
    request('/placement/apply', {
      method: 'POST',
      body: JSON.stringify({ driveId, cgpa }),
    }),
  getPlacementApplications: (driveId) =>
    request(`/placement/applications${driveId ? '?driveId=' + driveId : ''}`),
  advancePlacementApplicationStage: (id, payload) =>
    request(`/placement/applications/${id}/advance`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  releasePlacementOffer: (payload) =>
    request('/placement/offers/release', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  actionPlacementOffer: (id, action, notes) =>
    request(`/placement/offers/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),

  // 14. Accounts & Finance
  getFeeDashboardStats: (query = {}) => {
    const q = new URLSearchParams(query).toString();
    return request(`/fees/dashboard-stats${q ? '?' + q : ''}`);
  },
  getPaymentVerifications: (status = 'ALL', search = '') => {
    const q = new URLSearchParams({ status, search }).toString();
    return request(`/fees/payment-verifications?${q}`);
  },
  uploadPaymentProof: (payload) =>
    request('/fees/payment-proof', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  approvePaymentProof: (id) =>
    request(`/fees/payment-verifications/${id}/approve`, {
      method: 'POST',
    }),
  rejectPaymentProof: (id, rejectionReason) =>
    request(`/fees/payment-verifications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    }),
  getFeeStructures: () => request('/fees/structures'),
  createFeeStructure: (payload) =>
    request('/fees/structures', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getFeeTransactions: (search = '') =>
    request(`/fees/transactions${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  recordFeePayment: (payload) =>
    request('/fees/record', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getFeeStatement: (rollNumber = '2305201001') =>
    request(`/fees/statement?rollNumber=${encodeURIComponent(rollNumber)}`),
  getScholarships: () => request('/fees/scholarships'),
  sanctionScholarship: (payload) =>
    request('/fees/scholarships', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getFinancialReports: (type = 'DAILY_COLLECTION') =>
    request(`/fees/reports?type=${encodeURIComponent(type)}`),
  getStudentFinancialDocuments: (rollNumber = '') =>
    request(`/fees/documents${rollNumber ? `?rollNumber=${encodeURIComponent(rollNumber)}` : ''}`),

  // 22. Faculty Portal Academic Operations
  getFacultyDashboard: () => request('/faculty/dashboard'),
  getFacultyAssignments: () => request('/faculty/assignments'),
  getFacultyAttendanceSessions: (subjectCode = 'CS501', section = 'Section A') =>
    request(`/faculty/attendance/sessions?subjectCode=${encodeURIComponent(subjectCode)}&section=${encodeURIComponent(section)}`),
  submitFacultyAttendance: (payload) =>
    request('/faculty/attendance/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getFacultyQuizzes: (subjectCode = '', section = '') =>
    request(`/faculty/quizzes?subjectCode=${encodeURIComponent(subjectCode)}&section=${encodeURIComponent(section)}`),
  createFacultyQuiz: (payload) =>
    request('/faculty/quizzes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  publishFacultyQuiz: (id) =>
    request(`/faculty/quizzes/${id}/publish`, {
      method: 'PUT',
    }),
  getFacultyPerformance: (subjectCode = 'CS501', section = 'Section A') =>
    request(`/faculty/performance?subjectCode=${encodeURIComponent(subjectCode)}&section=${encodeURIComponent(section)}`),
  getFacultyEarlyWarning: (subjectCode = 'CS501', section = 'Section A') =>
    request(`/faculty/early-warning?subjectCode=${encodeURIComponent(subjectCode)}&section=${encodeURIComponent(section)}`),
  logFacultyIntervention: (payload) =>
    request('/faculty/early-warning/intervention', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // 23. HOD Department Academic Governance Operations
  getHodDashboard: (deptCode = 'CSE') =>
    request(`/hod/dashboard?deptCode=${encodeURIComponent(deptCode)}`),
  getHodApprovalQueue: () => request('/hod/approval-queue'),
  hodApproveMarks: (id) =>
    request('/hod/approve', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
  hodRejectMarks: (id, rejectionReason) =>
    request('/hod/reject', {
      method: 'POST',
      body: JSON.stringify({ id, rejectionReason }),
    }),
  hodUnlockMarks: (id, reason = '') =>
    request('/hod/unlock', {
      method: 'POST',
      body: JSON.stringify({ id, reason }),
    }),
  getHodAtRiskStudents: () => request('/hod/at-risk'),
  logHodIntervention: (payload) =>
    request('/hod/interventions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  bulkDispatchHodNotices: (count = 3) =>
    request('/hod/interventions/bulk-dispatch', {
      method: 'POST',
      body: JSON.stringify({ count }),
    }),
  getHodAuditLogs: () => request('/hod/audit-logs'),

  // 24. Report Generation Module APIs
  getReportFilters: () => request('/reports/filters'),
  getAttendanceReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/attendance${q ? '?' + q : ''}`);
  },
  getCgpaReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/cgpa${q ? '?' + q : ''}`);
  },
  getSgpaReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/sgpa${q ? '?' + q : ''}`);
  },
  getDocumentReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/documents${q ? '?' + q : ''}`);
  },
  downloadReportExcel: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const token = localStorage.getItem('collegeflow_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE_URL}/reports/export${q ? '?' + q : ''}`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to export report: HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition');
    let filename = `ApnaCampus_Report_${params.reportType || 'data'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return { success: true, filename };
  },

  // 25. Admissions & Intake Pipeline
  getAdmissionStats: () => request('/admission/stats'),
  getApplicants: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admission/applicants${q ? '?' + q : ''}`);
  },
  getApplicantById: (id) => request(`/admission/applicants/${id}`),
  createApplicant: (data) =>
    request('/admission/applicants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyApplicant: (id) =>
    request(`/admission/applicants/${id}/verify`, {
      method: 'PATCH',
    }),
  rejectApplicant: (id, reason) =>
    request(`/admission/applicants/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  approveAndEnrollApplicant: (id) =>
    request(`/admission/applicants/${id}/approve`, {
      method: 'POST',
    }),

  // 26. Account Activation & Password Recovery
  verifyActivationToken: (token) => request(`/auth/verify-activation-token?token=${encodeURIComponent(token)}`),
  activateAccount: (token, newPassword) =>
    request('/auth/activate-account', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
  forgotPassword: (identifier) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),
  resetPassword: (resetToken, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    }),

  // 27. Normalized Academic Hierarchy & Course Allocation
  getProgrammes: () => request('/academics/programmes'),
  createProgramme: (data) =>
    request('/academics/programmes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProgramme: (id, data) =>
    request(`/academics/programmes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAcademicYears: () => request('/academics/academic-years'),
  createAcademicYear: (data) =>
    request('/academics/academic-years', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCourseOfferings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/academics/course-offerings${q ? '?' + q : ''}`);
  },
  createCourseOffering: (data) =>
    request('/academics/course-offerings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  assignFacultyToCourse: (data) =>
    request('/academics/faculty-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getStudentEnrollments: (studentId) => request(`/academics/enrollments/${studentId}`),
  promoteStudentSemester: (data) =>
    request('/academics/progression/promote', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


export { feesApi } from './feesApi';
export { notesApi } from './notesApi';
export { facultyApi } from './facultyApi';
export { hodApi } from './hodApi';
export default api;

