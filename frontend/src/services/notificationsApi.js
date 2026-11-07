// Faculty-to-Student Academic Notification System API Client
// Connects to NestJS Backend (/api/notifications/*) with robust local persistence fallback

import { api } from './api.js';

function unwrapList(response) {
  if (Array.isArray(response)) return response;
  if (response?.success === false) {
    throw new Error(response.message || 'The notification service request failed.');
  }
  if (Array.isArray(response?.data)) return response.data;
  throw new Error('The notification service returned an invalid list.');
}

export const notificationsApi = {
  getCampusNotices: async (search = '', tag = '') =>
    unwrapList(await api.getNotices(search, tag)),

  getFacultyNotifications: async () => unwrapList(await api.getFacultyNotifications()),

  getFacultyAssignments: async () => unwrapList(await api.getFacultyAssignments()),

  previewRecipients: async (target) => {
    const response = await api.previewNotificationRecipients(target);
    if (!response?.success) {
      throw new Error(response?.message || 'Unable to preview notification recipients.');
    }

    return {
      ...response,
      eligibleStudentsCount: response.count,
      targetGroupLabel: [
        target.program,
        target.semester,
        target.section === 'ALL_ASSIGNED' ? 'All assigned sections' : target.section,
      ].filter(Boolean).join(' · '),
    };
  },

  createNotification: async (payload) => {
    const response = await api.createFacultyNotification(payload);
    if (!response?.success) {
      throw new Error(response?.message || 'Unable to publish notification.');
    }
    return response;
  },

  cancelNotification: (id) => api.cancelFacultyNotification(id),

  getStudentNotifications: async () => {
    const response = await api.getMyNotifications({ page: 1, limit: 50 });
    return unwrapList(response).map((notification) => ({
      ...notification,
      facultyName: notification.senderName,
      publishedAt: notification.createdAt || notification.timestamp || notification.publishedAt,
      isRead: notification.isRead ?? !notification.unread,
    }));
  },

  markAsRead: (id) => api.markNotificationRead(id),

  acknowledgeNotification: (id) => api.acknowledgeNotification(id),

  togglePin: (id, isPinned) => api.togglePinNotification(id, isPinned),

  estimateRecipients: (target) => api.estimateNotificationRecipients(target),

  publishNotice: (payload) => api.publishInstitutionalNotice(payload),

  getNoticeAnalytics: (id) => api.getNotificationAnalytics(id),

  withdrawNotice: (id) => api.withdrawNotification(id),

  markAllAsRead: () => api.markAllNotificationsRead(),
};
