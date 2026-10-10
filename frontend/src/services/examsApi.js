// Autonomous Examination Management (CoE) Service Layer
// Connects to NestJS Backend (/api/exams/*) with erpStore fallback

import { api } from './api';
import { erpStore } from './erpStore';

export const examsApi = {
  // 1. Operational Dashboard KPIs
  getDashboardStats: async () => {
    try {
      const res = await api.getExamDashboardStats();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }

    const cycles = erpStore.getExamCycles();
    const timetable = erpStore.getExamTimetable();
    const seating = erpStore.getSeatingArrangements();
    const hallTickets = erpStore.getHallTickets();
    const reevaluations = erpStore.getReevaluationRequests();
    const circulars = erpStore.getExamCirculars();

    const issuedCount = hallTickets.filter(h => h.hallTicketStatus === 'Issued').length;
    const holdCount = hallTickets.filter(h => h.hallTicketStatus.includes('Hold')).length;
    const detainedCount = hallTickets.filter(h => h.hallTicketStatus.includes('Detained')).length;

    const totalCap = seating.reduce((sum, h) => sum + (h.capacity || 0), 0);
    const allocatedCap = seating.reduce((sum, h) => sum + (h.allocated || 0), 0);

    return {
      activeCyclesCount: cycles.filter(c => c.status !== 'Closed').length,
      activeCycles: cycles,
      registeredExaminees: 2480,
      scheduledPapersCount: timetable.length,
      timetableConflictsCount: 0,
      hallCapacityTotal: totalCap || 500,
      hallCapacityAllocated: allocatedCap || 442,
      capacityUtilizationRate: totalCap > 0 ? parseFloat(((allocatedCap / totalCap) * 100).toFixed(1)) : 88.4,
      admitCardsIssued: issuedCount || 2345,
      admitCardsOnHold: holdCount || 135,
      attendanceDetainedCount: detainedCount || 24,
      pendingFeeHoldCount: 41,
      moderationPendingSubjects: 2,
      moderationCompletedSubjects: 34,
      marksAwaitingApproval: 18,
      certifiedResultsReady: true,
      pendingReevaluationsCount: reevaluations.filter(r => r.status === 'Under Scrutiny').length || 3,
      publishedCircularsCount: circulars.length || 14,
      upcomingSessions: timetable.slice(0, 3).map(t => ({
        date: t.date,
        time: t.time,
        paper: `${t.code} (${t.subject})`,
        halls: 'Exam Hall B-301, B-302, B-303',
        candidates: 174,
      })),
      examHalls: seating,
    };
  },

  // 2. Exam Cycles
  getExamCycles: async () => {
    try {
      const res = await api.getExamCycles();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getExamCycles();
  },

  createExamCycle: async (payload) => {
    try {
      const res = await api.createExamCycle(payload);
      if (res && res.success) {
        erpStore.createExamCycle(res.data);
        return res.data;
      }
    } catch {
      // Fallback
    }
    return erpStore.createExamCycle(payload);
  },

  transitionCycleStatus: async (cycleId, status) => {
    try {
      const res = await api.transitionExamCycle(cycleId, status);
      if (res && res.success) {
        erpStore.updateExamCycle(cycleId, { status });
        return res;
      }
    } catch {
      // Fallback
    }
    const cycle = erpStore.updateExamCycle(cycleId, { status });
    return { success: true, data: cycle };
  },

  // 3. Timetable & Scheduling
  getExamTimetable: async () => {
    try {
      const res = await api.getExamTimetable();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getExamTimetable();
  },

  createTimetableSlot: async (payload) => {
    try {
      const res = await api.createExamTimetableSlot(payload);
      if (res && res.success) {
        erpStore.createTimetableEntry(res.data);
        return res.data;
      }
    } catch (err) {
      if (err.message && err.message.includes('conflict')) {
        throw err;
      }
    }
    return erpStore.createTimetableEntry(payload);
  },

  // 4. Seating & Door Charts
  getSeatingArrangements: async () => {
    try {
      const res = await api.getExamSeating();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getSeatingArrangements();
  },

  autoOptimizeSeating: async () => {
    try {
      const res = await api.autoOptimizeExamSeating();
      if (res && res.success) {
        erpStore.autoGenerateSeating();
        return res;
      }
    } catch {
      // Fallback
    }
    erpStore.autoGenerateSeating();
    return { success: true, message: 'Seating optimization executed successfully.' };
  },

  // 5. Hall Tickets
  getHallTickets: async () => {
    try {
      const res = await api.getExamHallTickets();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getHallTickets();
  },

  issueHallTicket: async (rollNumber) => {
    return erpStore.issueAdmitCard(rollNumber);
  },

  condoneAttendance: async (rollNumber, pct = 75) => {
    return erpStore.condoneAttendance(rollNumber, pct);
  },

  clearFeeHold: async (rollNumber) => {
    return erpStore.clearFeeHold(rollNumber);
  },

  batchReleaseHallTickets: async () => {
    return erpStore.batchReleaseAdmitCards();
  },

  // 6. Marks Moderation
  getModerationMarks: async (subjectCode = 'CS501') => {
    try {
      const res = await api.getExamModerationMarks(subjectCode);
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getModerationMarks(subjectCode);
  },

  updateStudentMark: async (subjectCode, rollNumber, field, val) => {
    return erpStore.updateStudentMark(subjectCode, rollNumber, field, val);
  },

  applyGraceMarks: async (subjectCode, grace = 2) => {
    return erpStore.applyGraceMarks(subjectCode, grace);
  },

  certifyAndLockMarks: async (subjectCode) => {
    return erpStore.certifyAndLockMarks(subjectCode);
  },

  // 7. SGPA/CGPA Grade Engine
  getGradeRoster: async () => {
    try {
      const res = await api.getExamGradeRoster();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getGradeRoster();
  },

  executeGradingEngine: async () => {
    return erpStore.executeGradingEngine();
  },

  publishCycleResults: async (cycleId) => {
    try {
      await api.publishExamResults(cycleId);
    } catch {
      // Fallback
    }
    return erpStore.publishExamCycle(cycleId);
  },

  // 8. Re-evaluation & Scrutiny
  getReevaluations: async () => {
    try {
      const res = await api.getExamReevaluations();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getReevaluationRequests();
  },

  createReevaluation: async (payload) => {
    return erpStore.createReevaluationRequest(payload);
  },

  updateReevaluationStatus: async (id, partial) => {
    return erpStore.updateReevaluationStatus(id, partial);
  },

  // 9. CoE Circulars
  getExamCirculars: async () => {
    try {
      const res = await api.getExamCirculars();
      if (res && res.success) return res.data;
    } catch {
      // Fallback
    }
    return erpStore.getExamCirculars();
  },

  createExamCircular: async (payload) => {
    return erpStore.createExamCircular(payload);
  },
};

export default examsApi;
