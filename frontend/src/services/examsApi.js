import { api } from './api';

function requireData(response, label) {
  if (!response?.success || response.data === undefined) {
    throw new Error(`${label} returned an invalid response.`);
  }
  return response.data;
}

export const examsApi = {
  getDashboardStats: async () => requireData(await api.getExamDashboardStats(), 'Exam dashboard'),

  getExamCycles: async () => {
    const data = requireData(await api.getExamCycles(), 'Examination cycles');
    if (!Array.isArray(data)) throw new Error('The examination cycle service returned an invalid list.');
    return data;
  },

  createExamCycle: async (payload) => requireData(await api.createExamCycle(payload), 'Examination cycle creation'),

  transitionCycleStatus: async (cycleId, status) => {
    const response = await api.transitionExamCycle(cycleId, status);
    if (!response?.success || !response.data) throw new Error('The examination cycle could not be advanced.');
    return response;
  },

  getExamTimetable: async () => requireData(await api.getExamTimetable(), 'Exam timetable'),
  createTimetableSlot: async (payload) => requireData(await api.createExamTimetableSlot(payload), 'Exam timetable update'),
  getSeatingArrangements: async () => requireData(await api.getExamSeating(), 'Exam seating'),
  autoOptimizeSeating: async () => api.autoOptimizeExamSeating(),
  getHallTickets: async () => requireData(await api.getExamHallTickets(), 'Hall ticket roster'),

  // Internal assessment marks are persisted through the canonical marks API.
  getModerationMarks: async (subjectCode = 'CS501') =>
    requireData(await api.getExamModerationMarks(subjectCode), 'Moderation marks'),
  updateStudentMark: async (subjectCode, rollNumber, field, score) =>
    api.updateCellMark({ subjectCode, rollNumber, assessment: field, score: Number(score) }),

  getGradeRoster: async () => requireData(await api.getExamGradeRoster(), 'Certified result roster'),
  executeGradingEngine: async () => {
    throw new Error('Result calculation is unavailable until certified grade storage is implemented.');
  },
  publishCycleResults: async (cycleId) => api.transitionExamCycle(cycleId, 'Published'),

  getReevaluations: async () => requireData(await api.getExamReevaluations(), 'Re-evaluation requests'),
  createReevaluation: async () => {
    throw new Error('Re-evaluation requests cannot be submitted until persistent request storage is implemented.');
  },
  updateReevaluationStatus: async () => {
    throw new Error('Re-evaluation decisions cannot be saved until persistent request storage is implemented.');
  },

  getExamCirculars: async () => {
    const response = await api.getExamCirculars();
    const data = requireData(response, 'Examination circulars');
    if (!Array.isArray(data)) throw new Error('The examination circular service returned an invalid list.');
    return data;
  },
  createExamCircular: async () => {
    throw new Error('Circular creation is unavailable until a persistent examination circular workflow is implemented.');
  },
};

export default examsApi;
