// HOD API adapter. The backend is the only source of operational records.
import { api } from './api'

function requireResult(result, message) {
  if (!result?.success) throw new Error(message)
  return result
}

export const hodApi = {
  getDashboard: async (deptCode) => requireResult(
    await api.getHodDashboard(deptCode),
    'Department dashboard data is unavailable from the server.',
  ),

  getApprovalQueue: async () => {
    const result = await api.getHodApprovalQueue()
    if (!result?.success || !Array.isArray(result.data)) throw new Error('The marks approval queue is unavailable from the server.')
    return result.data
  },

  approveMarks: async (id) => requireResult(await api.hodApproveMarks(id), 'Marks approval was not saved by the server.'),
  rejectMarks: async (id, reason) => requireResult(await api.hodRejectMarks(id, reason), 'Marks review decision was not saved by the server.'),
  unlockMarks: async (id, reason) => requireResult(await api.hodUnlockMarks(id, reason), 'Marks unlock was not saved by the server.'),

  getAtRiskStudents: async () => {
    const result = await api.getHodAtRiskStudents()
    if (!result?.success || !Array.isArray(result.data)) throw new Error('At-risk student data is unavailable from the server.')
    return result
  },

  logIntervention: async (payload) => requireResult(await api.logHodIntervention(payload), 'The intervention was not saved by the server.'),
  bulkDispatchNotices: async (count) => requireResult(await api.bulkDispatchHodNotices(count), 'Notices were not dispatched by the server.'),

  getFacultyList: async () => { throw new Error('The department faculty directory is not connected to a persistent API yet.') },
  getSubjectsList: async () => { throw new Error('The department subject directory is not connected to a persistent API yet.') },
}
