// Anonymous Student Grievance Management API Client
// Connects to NestJS Backend (/api/complaints/*) with robust local persistence fallback

import { api } from './api';

const COMPLAINTS_STORAGE_KEY = 'apna_campus_anonymous_complaints_v2';

const initialComplaintsSeed = [
  {
    id: 'cmp-001',
    trackingId: 'CMP-2026-4821',
    category: 'TEACHING_RELATED',
    subject: 'Pacing of Dynamic Programming and Tree Traversals in Data Structures',
    description: 'The lectures on Dynamic Programming (Module 4) were covered very rapidly without sufficient worked-out pseudo-code examples on the whiteboard. Several students in Section A struggled to follow the state transitions. A dedicated revision lecture with step-by-step trace would greatly assist our comprehension.',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    academicYear: '2026-27',
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    facultyId: 'FAC-042',
    facultyName: 'Dr. S. Mohanty',
    attachmentUrl: null,
    attachmentName: null,
    isAnonymous: true,
    status: 'RESPONSE_SUBMITTED',
    isOverdue: false,
    submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    responses: [
      {
        id: 'resp-001',
        complaintId: 'cmp-001',
        facultyName: 'Dr. S. Mohanty',
        facultyDesignation: 'Associate Professor',
        responseComment: 'I appreciate the constructive feedback regarding Dynamic Programming. While we had to adhere to the syllabus schedule before Midterm Modular 2, I completely recognize that additional worked problems are needed for bottom-up tabulation and memoization tables.',
        proposedAction: 'Scheduling a 2-hour compensatory tutorial session on Saturday (11:00 AM - 01:00 PM) in Computing Lab 3. Uploaded supplementary step-by-step DP tutorial notes with state diagrams to Class Notes.',
        resolutionSummary: 'Compensatory weekend tutorial scheduled and detailed visual walkthrough handouts published.',
        responseTimeHours: 42.5,
        submittedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    statusHistory: [
      {
        id: 'hist-001',
        fromStatus: 'NEW',
        toStatus: 'UNDER_REVIEW',
        changedBy: 'Dr. S. Mohanty (Faculty)',
        changedByRole: 'FACULTY',
        remarks: 'Reviewed grievance details. Reviewing lecture plan for revision session.',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'hist-002',
        fromStatus: 'UNDER_REVIEW',
        toStatus: 'RESPONSE_SUBMITTED',
        changedBy: 'Dr. S. Mohanty (Faculty)',
        changedByRole: 'FACULTY',
        remarks: 'Submitted formal response with compensatory tutorial schedule.',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    hodReviews: []
  },
  {
    id: 'cmp-002',
    trackingId: 'CMP-2026-6190',
    category: 'MARKS_AND_ASSESSMENTS',
    subject: 'Surprise Test 2 Rubric Evaluation Discrepancy in CS501',
    description: 'In Surprise Test 2 on AVL Trees Rotation, question 3 asked for single right rotation steps. Marks were deducted for omitting re-balancing height factor recalculations, which was not explicitly stated in the test prompt instructions. Requesting fair reassessment.',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    academicYear: '2026-27',
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    facultyId: 'FAC-042',
    facultyName: 'Dr. S. Mohanty',
    attachmentUrl: null,
    attachmentName: null,
    isAnonymous: true,
    status: 'AWAITING_HOD_REVIEW',
    isOverdue: false,
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    responses: [
      {
        id: 'resp-002',
        complaintId: 'cmp-002',
        facultyName: 'Dr. S. Mohanty',
        facultyDesignation: 'Associate Professor',
        responseComment: 'Reviewed the evaluation rubric with teaching assistants. It is verified that balance factor recalculation was not strictly worded in Question 3 header.',
        proposedAction: 'Awarding 1.5 compensatory moderation marks uniformly to all candidates in Section A who correctly demonstrated the rotation steps. CIA register will reflect this update.',
        resolutionSummary: 'Moderation marks applied across the section.',
        responseTimeHours: 36.0,
        submittedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ],
    statusHistory: [
      {
        id: 'hist-003',
        fromStatus: 'NEW',
        toStatus: 'UNDER_REVIEW',
        changedBy: 'Dr. S. Mohanty (Faculty)',
        changedByRole: 'FACULTY',
        remarks: 'Initiated scrutiny of test question paper and marking scheme.',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'hist-004',
        fromStatus: 'UNDER_REVIEW',
        toStatus: 'AWAITING_HOD_REVIEW',
        changedBy: 'Dr. S. Mohanty (Faculty)',
        changedByRole: 'FACULTY',
        remarks: 'Proposed uniform moderation of 1.5 marks. Submitted to HOD for moderation approval.',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ],
    hodReviews: []
  },
  {
    id: 'cmp-003',
    trackingId: 'CMP-2026-7312',
    category: 'CLASSROOM_ENVIRONMENT',
    subject: 'Computing Lab 3 Projector Display Flickering during Practical Labs',
    description: 'The ceiling projector in Computing Lab 3 has intermittent color distortion and blackouts during the 2-hour practical session on Wednesdays. It is difficult to read the code demonstrations from middle and back rows.',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    academicYear: '2026-27',
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures Lab (Practical)',
    facultyId: 'FAC-042',
    facultyName: 'Dr. S. Mohanty',
    attachmentUrl: null,
    attachmentName: null,
    isAnonymous: true,
    status: 'RESOLVED',
    isOverdue: false,
    submittedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    responses: [
      {
        id: 'resp-003',
        complaintId: 'cmp-003',
        facultyName: 'Dr. S. Mohanty',
        facultyDesignation: 'Associate Professor',
        responseComment: 'Noticed during Wednesday session. Immediately raised a campus IT maintenance ticket #IT-4902 to replace the HDMI transceiver cable and projector lamp.',
        proposedAction: 'Campus IT team replaced the faulty HDMI connector and cleaned optics on 09 Oct 2026. Display verified crisp across all 32 workstations.',
        resolutionSummary: 'Hardware replaced and fully verified in lab.',
        responseTimeHours: 18.0,
        submittedAt: new Date(Date.now() - 8 * 86400000).toISOString()
      }
    ],
    statusHistory: [
      {
        id: 'hist-005',
        fromStatus: 'NEW',
        toStatus: 'RESOLVED',
        changedBy: 'Dr. P. K. Pattnaik (HOD)',
        changedByRole: 'HOD',
        remarks: 'HOD reviewed repair confirmation from Campus Maintenance. Closed.',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    hodReviews: [
      {
        id: 'rev-001',
        hodName: 'Dr. P. K. Pattnaik',
        reviewOutcome: 'Adequate',
        observations: 'Prompt action taken by course faculty and IT maintenance team. Verified lab working condition during physical department inspection.',
        isResponseAdequate: true,
        requiresClarification: false,
        requiresCorrectiveAction: false,
        isEscalated: false,
        finalReviewStatus: 'Reviewed & Resolved',
        reviewedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ]
  },
  {
    id: 'cmp-004',
    trackingId: 'CMP-2026-9041',
    category: 'COURSE_MATERIAL',
    subject: 'Request for Standard Lab Manual and Reference Solution Templates',
    description: 'The laboratory exercises for CS502 Operating Systems require additional starter code templates for Process Synchronization using Semaphores and Mutexes. Currently students are using differing versions of C compiler libraries resulting in confusion during lab evaluation.',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    academicYear: '2026-27',
    semester: 'Semester 5',
    section: 'Section B',
    subjectCode: 'CS502',
    subjectName: 'Operating Systems',
    facultyId: 'FAC-019',
    facultyName: 'Prof. R. K. Sahoo',
    attachmentUrl: null,
    attachmentName: null,
    isAnonymous: true,
    status: 'NEW',
    isOverdue: false,
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    responses: [],
    statusHistory: [
      {
        id: 'hist-006',
        fromStatus: 'NEW',
        toStatus: 'NEW',
        changedBy: 'System (Anonymous Student)',
        changedByRole: 'STUDENT',
        remarks: 'Complaint submitted securely.',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    hodReviews: []
  },
  {
    id: 'cmp-005',
    trackingId: 'CMP-2026-1084',
    category: 'FACULTY_BEHAVIOR',
    subject: 'Concerns Regarding Consultation Hours Availability for Doubt Clearing',
    description: 'Students visiting during designated remedial consultation hours (Tuesday 3-4 PM) found the faculty cabin closed multiple times over the past 3 weeks without prior reschedule notification on the portal notice board.',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    academicYear: '2026-27',
    semester: 'Semester 5',
    section: 'Section C',
    subjectCode: 'CS504',
    subjectName: 'Design & Analysis of Algorithms',
    facultyId: 'FAC-031',
    facultyName: 'Prof. S. K. Swain',
    attachmentUrl: null,
    attachmentName: null,
    isAnonymous: true,
    status: 'ESCALATED',
    isOverdue: true,
    submittedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    responses: [],
    statusHistory: [
      {
        id: 'hist-007',
        fromStatus: 'NEW',
        toStatus: 'ESCALATED',
        changedBy: 'Dr. P. K. Pattnaik (HOD)',
        changedByRole: 'HOD',
        remarks: 'Unresolved grievance exceeded 7-day statutory limit without faculty acknowledgment. Escalated for direct HOD administrative review.',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ],
    hodReviews: [
      {
        id: 'rev-002',
        hodName: 'Dr. P. K. Pattnaik',
        reviewOutcome: 'Clarification Requested',
        observations: 'Faculty member was on sanctioned autonomous examination paper-setting duty during two of the instances. However, reschedule notices should have been broadcasted via Faculty Notification System to prevent student inconvenience.',
        isResponseAdequate: false,
        requiresClarification: true,
        requiresCorrectiveAction: true,
        isEscalated: true,
        escalationReason: 'Pending faculty response exceeding statutory turnaround period.',
        finalReviewStatus: 'Escalated to HOD Office',
        reviewedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ]
  }
];

function loadLocalComplaints() {
  if (typeof localStorage === 'undefined') return initialComplaintsSeed;
  try {
    const raw = localStorage.getItem(COMPLAINTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored complaints:', e);
  }
  localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(initialComplaintsSeed));
  return initialComplaintsSeed;
}

function saveLocalComplaints(data) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('apna_campus_complaints_updated'));
  } catch (e) {
    console.warn('Failed to save complaints:', e);
  }
}

export const complaintsApi = {
  // 1. Submit Anonymous Complaint
  submitComplaint: async (payload) => {
    try {
      const res = await api.submitAnonymousComplaint(payload);
      if (res && res.success) {
        // Also sync local storage
        const current = loadLocalComplaints();
        const localItem = {
          id: `cmp-${Date.now()}`,
          trackingId: res.trackingId,
          category: payload.category || 'TEACHING_RELATED',
          subject: payload.subject,
          description: payload.description,
          facultyName: payload.facultyName,
          department: payload.department || 'Computer Science & Engineering',
          deptCode: payload.deptCode || 'CSE',
          academicYear: payload.academicYear || '2026-27',
          semester: payload.semester || 'Semester 5',
          section: payload.section || 'Section A',
          subjectCode: payload.subjectCode || null,
          subjectName: payload.subjectName || null,
          attachmentUrl: payload.attachmentUrl || null,
          attachmentName: payload.attachmentName || null,
          isAnonymous: true,
          status: 'NEW',
          isOverdue: false,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          responses: [],
          statusHistory: [
            {
              id: `hist-${Date.now()}`,
              fromStatus: 'NEW',
              toStatus: 'NEW',
              changedBy: 'System (Anonymous Student Submission)',
              changedByRole: 'STUDENT',
              remarks: 'Grievance submitted with zero-knowledge identity masking.',
              timestamp: new Date().toISOString()
            }
          ],
          hodReviews: []
        };
        saveLocalComplaints([localItem, ...current]);
        return res;
      }
    } catch {
      // Fallback
    }

    const current = loadLocalComplaints();
    const trackingId = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry = {
      id: `cmp-${Date.now()}`,
      trackingId,
      category: payload.category || 'TEACHING_RELATED',
      subject: payload.subject,
      description: payload.description,
      facultyName: payload.facultyName,
      department: payload.department || 'Computer Science & Engineering',
      deptCode: payload.deptCode || 'CSE',
      academicYear: payload.academicYear || '2026-27',
      semester: payload.semester || 'Semester 5',
      section: payload.section || 'Section A',
      subjectCode: payload.subjectCode || null,
      subjectName: payload.subjectName || null,
      attachmentUrl: payload.attachmentUrl || null,
      attachmentName: payload.attachmentName || null,
      isAnonymous: true,
      status: 'NEW',
      isOverdue: false,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          fromStatus: 'NEW',
          toStatus: 'NEW',
          changedBy: 'System (Anonymous Student Submission)',
          changedByRole: 'STUDENT',
          remarks: 'Grievance submitted with zero-knowledge identity masking.',
          timestamp: new Date().toISOString()
        }
      ],
      hodReviews: []
    };
    saveLocalComplaints([newEntry, ...current]);

    return {
      success: true,
      trackingId,
      status: 'NEW',
      message: 'Your complaint has been submitted anonymously. Please save your Tracking ID to monitor responses and status updates.',
      submittedAt: newEntry.submittedAt
    };
  },

  // 2. Track Complaint by Tracking ID
  trackComplaint: async (trackingId) => {
    try {
      const res = await api.trackAnonymousComplaint(trackingId);
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = loadLocalComplaints();
    const found = current.find(c => c.trackingId.trim().toUpperCase() === trackingId.trim().toUpperCase());
    if (found) return found;
    throw new Error(`No complaint found with Tracking ID "${trackingId}".`);
  },

  // 3. Faculty Complaints List
  getFacultyComplaints: async (facultyName = 'Dr. S. Mohanty', status = 'ALL') => {
    try {
      const res = await api.getFacultyComplaints(status);
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = loadLocalComplaints();
    return current.filter(c => {
      const facultyMatch = !facultyName || c.facultyName.toLowerCase().includes(facultyName.toLowerCase()) || facultyName.toLowerCase().includes(c.facultyName.toLowerCase());
      const statusMatch = !status || status === 'ALL' || c.status === status;
      return facultyMatch && statusMatch;
    });
  },

  // 4. Submit Faculty Response
  submitFacultyResponse: async (complaintId, payload, facultyName = 'Dr. S. Mohanty') => {
    try {
      const res = await api.submitFacultyComplaintResponse(complaintId, payload);
      if (res && res.success) {
        // sync local
        const current = loadLocalComplaints();
        const updated = current.map(c => {
          if (c.id === complaintId || c.trackingId === complaintId) {
            return res.complaint || {
              ...c,
              status: 'RESPONSE_SUBMITTED',
              responses: [
                ...(c.responses || []),
                {
                  id: `resp-${Date.now()}`,
                  facultyName,
                  facultyDesignation: 'Associate Professor',
                  responseComment: payload.responseComment,
                  proposedAction: payload.proposedAction,
                  resolutionSummary: payload.resolutionSummary || payload.proposedAction,
                  responseTimeHours: 24,
                  submittedAt: new Date().toISOString()
                }
              ]
            };
          }
          return c;
        });
        saveLocalComplaints(updated);
        return res;
      }
    } catch {
      // Fallback
    }

    const current = loadLocalComplaints();
    const updated = current.map(c => {
      if (c.id === complaintId || c.trackingId === complaintId) {
        const submissionTime = new Date(c.submittedAt).getTime();
        const hoursTaken = Math.max(0.5, Math.round(((Date.now() - submissionTime) / 3600000) * 10) / 10);
        const resp = {
          id: `resp-${Date.now()}`,
          complaintId: c.id,
          facultyName,
          facultyDesignation: 'Associate Professor',
          responseComment: payload.responseComment,
          proposedAction: payload.proposedAction || 'Action recorded.',
          resolutionSummary: payload.resolutionSummary || payload.proposedAction || 'Response recorded.',
          responseTimeHours: hoursTaken,
          submittedAt: new Date().toISOString()
        };
        const prevStatus = c.status;
        const newHist = {
          id: `hist-${Date.now()}`,
          fromStatus: prevStatus,
          toStatus: 'RESPONSE_SUBMITTED',
          changedBy: `${facultyName} (Faculty)`,
          changedByRole: 'FACULTY',
          remarks: 'Formal response submitted with proposed corrective actions.',
          timestamp: new Date().toISOString()
        };
        return {
          ...c,
          status: 'RESPONSE_SUBMITTED',
          updatedAt: new Date().toISOString(),
          responses: [...(c.responses || []), resp],
          statusHistory: [...(c.statusHistory || []), newHist]
        };
      }
      return c;
    });
    saveLocalComplaints(updated);
    return { success: true, message: 'Response recorded successfully.' };
  },

  // 5. Update Complaint Status (Faculty / Admin)
  updateComplaintStatus: async (complaintId, newStatus, remarks = '', changerName = 'Dr. S. Mohanty') => {
    try {
      const res = await api.updateFacultyComplaintStatus(complaintId, { status: newStatus, remarks });
      if (res && res.success) {
        const current = loadLocalComplaints();
        const updated = current.map(c => {
          if (c.id === complaintId || c.trackingId === complaintId) {
            return res.complaint || { ...c, status: newStatus };
          }
          return c;
        });
        saveLocalComplaints(updated);
        return res;
      }
    } catch {
      // Fallback
    }

    const current = loadLocalComplaints();
    const updated = current.map(c => {
      if (c.id === complaintId || c.trackingId === complaintId) {
        const prevStatus = c.status;
        const hist = {
          id: `hist-${Date.now()}`,
          fromStatus: prevStatus,
          toStatus: newStatus,
          changedBy: `${changerName}`,
          changedByRole: 'FACULTY',
          remarks: remarks || `Status changed from ${prevStatus} to ${newStatus}.`,
          timestamp: new Date().toISOString()
        };
        return {
          ...c,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          statusHistory: [...(c.statusHistory || []), hist]
        };
      }
      return c;
    });
    saveLocalComplaints(updated);
    return { success: true, message: `Status updated to "${newStatus}".` };
  },

  // 6. HOD Complaints List with Filtering
  getHodComplaints: async (filters = {}) => {
    try {
      const res = await api.getHodComplaints(filters);
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }

    const current = loadLocalComplaints();
    return current.filter(c => {
      if (filters.facultyName && filters.facultyName !== 'ALL') {
        if (!c.facultyName.toLowerCase().includes(filters.facultyName.toLowerCase())) return false;
      }
      if (filters.category && filters.category !== 'ALL') {
        if (c.category !== filters.category) return false;
      }
      if (filters.subjectCode && filters.subjectCode !== 'ALL') {
        if (c.subjectCode !== filters.subjectCode) return false;
      }
      if (filters.semester && filters.semester !== 'ALL') {
        if (c.semester.toLowerCase() !== filters.semester.toLowerCase()) return false;
      }
      if (filters.section && filters.section !== 'ALL') {
        if (c.section.toLowerCase() !== filters.section.toLowerCase()) return false;
      }
      if (filters.status && filters.status !== 'ALL') {
        if (c.status !== filters.status) return false;
      }
      if (filters.isOverdue === true || filters.isOverdue === 'true') {
        if (!c.isOverdue) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          c.trackingId.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.facultyName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  },

  // 7. HOD Review & Assessment
  reviewHodComplaint: async (complaintId, reviewData, hodName = 'Dr. P. K. Pattnaik') => {
    try {
      const res = await api.reviewHodComplaint(complaintId, reviewData);
      if (res && res.success) {
        const current = loadLocalComplaints();
        const updated = current.map(c => {
          if (c.id === complaintId || c.trackingId === complaintId) {
            return res.complaint || c;
          }
          return c;
        });
        saveLocalComplaints(updated);
        return res;
      }
    } catch {
      // Fallback
    }

    const current = loadLocalComplaints();
    const updated = current.map(c => {
      if (c.id === complaintId || c.trackingId === complaintId) {
        let nextStatus = c.status;
        if (reviewData.isEscalated) {
          nextStatus = 'ESCALATED';
        } else if (reviewData.requiresClarification) {
          nextStatus = 'UNDER_REVIEW';
        } else if (reviewData.reviewOutcome === 'Reviewed & Closed' || reviewData.reviewOutcome === 'Adequate') {
          nextStatus = 'RESOLVED';
        }

        const reviewRecord = {
          id: `rev-${Date.now()}`,
          hodName,
          reviewOutcome: reviewData.reviewOutcome,
          observations: reviewData.observations,
          isResponseAdequate: reviewData.isResponseAdequate !== undefined ? reviewData.isResponseAdequate : true,
          requiresClarification: Boolean(reviewData.requiresClarification),
          requiresCorrectiveAction: Boolean(reviewData.requiresCorrectiveAction),
          isEscalated: Boolean(reviewData.isEscalated),
          escalationReason: reviewData.escalationReason || null,
          finalReviewStatus: reviewData.finalReviewStatus || 'Reviewed',
          reviewedAt: new Date().toISOString()
        };

        const hist = {
          id: `hist-${Date.now()}`,
          fromStatus: c.status,
          toStatus: nextStatus,
          changedBy: `${hodName} (HOD)`,
          changedByRole: 'HOD',
          remarks: `HOD Review: outcome="${reviewData.reviewOutcome}". ${reviewData.requiresClarification ? 'Returned for clarification. ' : ''}${reviewData.isEscalated ? 'Escalated. ' : ''}`,
          timestamp: new Date().toISOString()
        };

        return {
          ...c,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          hodReviews: [...(c.hodReviews || []), reviewRecord],
          statusHistory: [...(c.statusHistory || []), hist]
        };
      }
      return c;
    });
    saveLocalComplaints(updated);
    return { success: true, message: 'HOD review decision recorded.' };
  },

  // 8. HOD Grievance Analytics
  getHodAnalytics: async (deptCode = 'CSE') => {
    try {
      const res = await api.getHodComplaintAnalytics(deptCode);
      if (res && res.success && res.data) return res.data;
    } catch {
      // Fallback
    }

    const list = loadLocalComplaints().filter(c => !deptCode || c.deptCode.toLowerCase() === deptCode.toLowerCase());
    const total = list.length;
    const resolved = list.filter(c => c.status === 'RESOLVED').length;
    const unresolved = total - resolved;
    const awaitingFaculty = list.filter(c => c.status === 'NEW' || c.status === 'UNDER_REVIEW').length;
    const awaitingHod = list.filter(c => c.status === 'RESPONSE_SUBMITTED' || c.status === 'AWAITING_HOD_REVIEW').length;
    const escalated = list.filter(c => c.status === 'ESCALATED').length;
    const overdue = list.filter(c => c.isOverdue).length;

    const responseTimes = [];
    list.forEach(c => {
      (c.responses || []).forEach(r => {
        if (r.responseTimeHours) responseTimes.push(r.responseTimeHours);
      });
    });
    const avgResponseTimeHours = responseTimes.length > 0
      ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 10) / 10
      : 32.2;

    const categoryCounts = {};
    list.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    const categoryLabels = {
      TEACHING_RELATED: 'Teaching & Pedagogy',
      FACULTY_BEHAVIOR: 'Faculty Communication & Conduct',
      COURSE_MATERIAL: 'Course Syllabus & Resources',
      MARKS_AND_ASSESSMENTS: 'Marks & Internal Assessments',
      CLASSROOM_ENVIRONMENT: 'Classroom & Lab Facilities',
      OTHER_ACADEMIC: 'Other Academic Concerns'
    };

    const categoryBreakdown = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    const facultyCounts = {};
    list.forEach(c => {
      if (!facultyCounts[c.facultyName]) {
        facultyCounts[c.facultyName] = { count: 0, resolved: 0, subjects: new Set() };
      }
      facultyCounts[c.facultyName].count += 1;
      if (c.status === 'RESOLVED') facultyCounts[c.facultyName].resolved += 1;
      if (c.subjectCode) facultyCounts[c.facultyName].subjects.add(c.subjectCode);
    });

    const facultyBreakdown = Object.entries(facultyCounts).map(([name, data]) => ({
      facultyName: name,
      complaintCount: data.count,
      resolvedCount: data.resolved,
      resolutionRate: Math.round((data.resolved / data.count) * 100),
      coursesTaughtCount: Math.max(1, data.subjects.size),
      contextNote: `${data.count} grievance(s) recorded across ${Math.max(1, data.subjects.size)} assigned course cohorts.`
    }));

    const monthlyTrends = [
      { month: 'Jul 2026', received: 1, resolved: 1 },
      { month: 'Aug 2026', received: 2, resolved: 2 },
      { month: 'Sep 2026', received: 4, resolved: 3 },
      { month: 'Oct 2026', received: total, resolved }
    ];

    return {
      department: deptCode,
      kpis: {
        totalComplaints: total,
        resolvedCount: resolved,
        unresolvedCount: unresolved,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 100,
        awaitingFacultyResponse: awaitingFaculty,
        awaitingHodReview: awaitingHod,
        escalatedCount: escalated,
        overdueCount: overdue,
        avgResponseTimeHours,
        avgResponseTimeDays: Math.round((avgResponseTimeHours / 24) * 10) / 10
      },
      categoryBreakdown,
      facultyBreakdown,
      monthlyTrends,
      fairnessDisclaimer: 'Fairness Advisory: Grievance metrics represent student feedback for academic improvement. Data must be evaluated alongside course enrollment sizes, syllabus complexity, and formal departmental reviews.'
    };
  }
};
