/**
 * Central Notification Events & Constants for Apna Campus
 */

export const NOTIFICATION_EVENTS = {
  // Examination Cell
  EXAM_NOTICE_PUBLISHED: 'exam.notice.published',
  EXAM_TIMETABLE_UPDATED: 'exam.timetable.updated',
  EXAM_HALL_TICKET_RELEASED: 'exam.hall_ticket.released',
  EXAM_SEATING_PUBLISHED: 'exam.seating.published',
  RESULT_PUBLISHED: 'result.published',
  RESULT_CORRECTION_REQUIRED: 'result.correction_required',
  REEVALUATION_UPDATED: 'reevaluation.updated',

  // Faculty & Academics
  CLASS_SCHEDULE_UPDATED: 'class.schedule.updated',
  CLASS_CANCELLED: 'class.cancelled',
  CLASS_RESCHEDULED: 'class.rescheduled',
  ASSIGNMENT_PUBLISHED: 'assignment.published',
  ASSIGNMENT_DEADLINE: 'assignment.deadline',
  ATTENDANCE_MARKED: 'attendance.marked',
  ATTENDANCE_LOW_THRESHOLD: 'attendance.low_threshold',

  // Head of Department
  HOD_CIRCULAR_PUBLISHED: 'hod.circular.published',
  HOD_MARKS_APPROVED: 'hod.marks.approved',
  HOD_MARKS_REJECTED: 'hod.marks.rejected',
  TIMETABLE_SUBMITTED: 'timetable.submitted',
  TIMETABLE_APPROVED: 'timetable.approved',
  TIMETABLE_REJECTED: 'timetable.rejected',
  TIMETABLE_PUBLISHED: 'timetable.published',

  // Accounts & Finance
  FEE_PAYMENT_CONFIRMED: 'fee.payment.confirmed',
  FEE_PAYMENT_REJECTED: 'fee.payment.rejected',
  FEE_DUE_REMINDER: 'fee.due.reminder',
  SCHOLARSHIP_SANCTIONED: 'scholarship.sanctioned',
  FINANCE_BUDGET_ALERT: 'finance.budget.alert',

  // Admin Office & Documents
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_VERIFICATION_COMPLETED: 'document.verification.completed',
  DOCUMENT_CORRECTION_REQUESTED: 'document.correction_requested',
  BONAFIDE_STAGE_CHANGED: 'bonafide.stage_changed',
  BONAFIDE_CERTIFICATE_ISSUED: 'bonafide.certificate_issued',
  ADMISSION_STATUS_UPDATED: 'admission.status.updated',

  // Training & Placement
  PLACEMENT_DRIVE_PUBLISHED: 'placement.drive.published',
  PLACEMENT_APPLICATION_UPDATED: 'placement.application.updated',
  PLACEMENT_SHORTLIST_PUBLISHED: 'placement.shortlist.published',

  // Smart Complaints
  COMPLAINT_REGISTERED: 'complaint.registered',
  COMPLAINT_ASSIGNED: 'complaint.assigned',
  COMPLAINT_STATUS_CHANGED: 'complaint.status_changed',
  COMPLAINT_RESOLVED: 'complaint.resolved',

  // Campus Operations & Services
  HOSTEL_APPLICATION_UPDATED: 'hostel.application.updated',
  HOSTEL_ROOM_ALLOCATED: 'hostel.room.allocated',
  TRANSPORT_ROUTE_CHANGED: 'transport.route.changed',
  LIBRARY_DUE_REMINDER: 'library.due.reminder',
  MAINTENANCE_TICKET_UPDATED: 'maintenance.ticket.updated',

  // Leadership & Institution-Wide
  ANNOUNCEMENT_PUBLISHED: 'announcement.published',
  INSTITUTIONAL_DIRECTIVE: 'institutional.directive',
  ACCOUNT_SECURITY_ALERT: 'account.security_alert',
  SYSTEM_HEALTH_ALERT: 'system.health_alert',
} as const;

export const NotificationEventType = NOTIFICATION_EVENTS;
export type NotificationEventType = typeof NOTIFICATION_EVENTS[keyof typeof NOTIFICATION_EVENTS];

export const NotificationPriority = {
  NORMAL: 'NORMAL',
  IMPORTANT: 'IMPORTANT',
  HIGH: 'IMPORTANT',
  URGENT: 'URGENT',
} as const;
export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

export const NotificationCategory = {
  EXAMINATION: 'EXAMINATION',
  ACADEMIC: 'ACADEMIC',
  FEES: 'FEES',
  FINANCE: 'FEES',
  ADMISSION: 'ADMISSION',
  ADMIN: 'ADMISSION',
  PLACEMENT: 'PLACEMENT',
  CAREER: 'PLACEMENT',
  COMPLAINT: 'COMPLAINT',
  SUPPORT: 'COMPLAINT',
  HOSTEL: 'HOSTEL',
  TRANSPORT: 'TRANSPORT',
  LIBRARY: 'LIBRARY',
  SYSTEM: 'SYSTEM',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  CAMPUS: 'ANNOUNCEMENT',
  SECURITY: 'SECURITY',
} as const;
export type NotificationCategory = typeof NotificationCategory[keyof typeof NotificationCategory];

export interface NotificationTargetFilter {
  roles?: string[]; // e.g. ['STUDENT', 'FACULTY', 'HOD', 'PRINCIPAL']
  department?: string;
  departments?: string[]; // e.g. ['CSE', 'Computer Science & Engineering']
  semester?: string;
  semesters?: string[]; // e.g. ['Semester 5', '5', 'Sem 5']
  section?: string;
  sections?: string[]; // e.g. ['Section A', 'Section B']
  studentRollNumbers?: string[]; // direct student roll numbers
  studentIds?: string[];
  facultyEmployeeIds?: string[];
  userIds?: string[];
  excludeUserIds?: string[];
  minCgpa?: number;
  hasFeeDues?: boolean;
  attendanceBelow?: number; // e.g. 75
}

export interface NotificationDispatchInput {
  title: string;
  message: string;
  category?: NotificationCategory | string;
  priority?: NotificationPriority | string;
  sourceModule: string; // 'exam_cell' | 'faculty' | 'hod' | 'accounts' | 'admin' | 'placement' | 'complaints' | etc.
  eventType?: NotificationEventType | string;
  actionTab?: string; // Authorized portal tab navigation target
  actionLabel?: string;
  actionUrl?: string; // Authorized deep link destination
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  senderDept?: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  targetScope?: string; // e.g. 'DEPT:CSE:SEM:5', 'ROLE:STUDENT'
  dedupKey?: string; // Idempotency key to prevent duplicates
  metadata?: Record<string, any>;
  targetFilter?: NotificationTargetFilter;
  target?: NotificationTargetFilter; // Alias for targetFilter
}

