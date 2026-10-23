// Faculty API adapter. Business records are never synthesized in the browser.
import { api } from './api'

function requireServerResult(result, message) {
  if (!result?.success || result.data == null) throw new Error(message)
  return result.data
}

export const facultyApi = {
  getAssignments: async () => {
    const result = await api.getFacultyAssignments()
    if (!result?.success || !Array.isArray(result.data)) throw new Error('Teaching assignments could not be loaded from the server.')
    return result.data
  },

  getDashboardData: async () => requireServerResult(
    await api.getFacultyDashboard(),
    'Faculty dashboard data is unavailable from the server.',
  ),

  getAttendanceRoster: async (subjectCode, section) => {
    const result = await api.getFacultyAttendanceRoster(subjectCode, section)
    if (!result?.success || !Array.isArray(result.data)) throw new Error('The attendance roster could not be loaded from the server.')
    return result
  },

  getAttendanceSessions: async (subjectCode, section) => {
    const result = await api.getFacultyAttendanceSessions(subjectCode, section)
    if (!result?.success || !Array.isArray(result.data)) throw new Error('Attendance history could not be loaded from the server.')
    return result
  },

  submitAttendanceSession: async (payload) => {
    const result = await api.submitFacultyAttendance(payload)
    if (!result?.success || !result.data) throw new Error('Attendance was not saved by the server.')
    return result
  },

  getClassPerformance: async (subjectCode, section) => requireServerResult(
    await api.getFacultyPerformance(subjectCode, section),
    'Class performance data is unavailable from the server.',
  ),

  logRemedialIntervention: async (payload) => {
    const result = await api.logFacultyIntervention(payload)
    if (!result?.success) throw new Error('The intervention was not saved by the server.')
    return result
  },
}
