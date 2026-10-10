export type DataScope = 'OWN' | 'DEPARTMENT' | 'COLLEGE' | 'SYSTEM' | 'MODULE';

export interface RolePolicy {
  scope: DataScope;
  permissions: string[];
}

export const rolePolicies: Record<string, RolePolicy> = {
  // 1. Super Admin: Technical/system administrator. Root configuration, user accounts, audit.
  super_admin: {
    scope: 'SYSTEM',
    permissions: [
      'users.create',
      'users.edit',
      'users.disable',
      'users.activate',
      'users.reset_password',
      'roles.create',
      'roles.assign',
      'permissions.manage',
      'system.manage',
      'system.config',
      'system.backup',
      'audit.view',
      'students.view_all',
      'faculty.view_all',
      'departments.manage',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 2. Management: High-level institutional analytics, read-only KPI reports across college.
  management: {
    scope: 'COLLEGE',
    permissions: [
      'analytics.view',
      'reports.view',
      'reports.generate',
      'reports.export',
      'students.view_all',
      'faculty.view_all',
      'departments.view',
      'academics.view',
      'fees.view_summary',
      'placement.view_stats',
      'hostel.view_stats',
      'transport.view_stats',
      'attendance.view_summary',
    ],
  },

  // 3. Principal: College-wide academic & admin oversight, approvals, governance.
  principal: {
    scope: 'COLLEGE',
    permissions: [
      'students.view_all',
      'faculty.view_all',
      'departments.view',
      'attendance.view',
      'results.view',
      'results.approve',
      'leave.approve',
      'approvals.review',
      'approvals.action',
      'notices.publish_college',
      'complaints.view_all',
      'reports.view',
      'reports.generate',
      'reports.export',
      'fees.view_summary',
      'placement.view',
    ],
  },

  // 4. Admin Ops: Operational student records, admissions, rosters, certificates, ID cards.
  admin: {
    scope: 'COLLEGE',
    permissions: [
      'students.view_all',
      'students.create',
      'students.edit',
      'faculty.view_all',
      'staff.manage',
      'certificates.generate',
      'documents.manage',
      'notices.manage',
      'complaints.manage',
      'attendance.view',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 5. HOD: Restricted strictly to their department. Students, faculty, subject allocation, moderation.
  hod: {
    scope: 'DEPARTMENT',
    permissions: [
      'students.view_department',
      'faculty.view_department',
      'faculty.workload',
      'academics.department',
      'subjects.allocate',
      'timetable.manage_dept',
      'attendance.view_department',
      'results.verify',
      'marks.moderate',
      'marks.approve',
      'marks.review',
      'marks.unlock',
      'early_warning.manage',
      'curriculum.manage',
      'interventions.manage',
      'documents.view',
      'leave.approve_department',
      'reports.department',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 6. Faculty: Assigned classes, student continuous assessment, attendance marking.
  faculty: {
    scope: 'DEPARTMENT',
    permissions: [
      'attendance.mark',
      'attendance.edit',
      'attendance.view',
      'marks.enter',
      'marks.edit',
      'assignments.create',
      'assignments.grade',
      'students.view_assigned',
      'subjects.view_assigned',
      'quizzes.manage',
      'quizzes.create',
      'quizzes.grade',
      'resources.verify',
      'notes.moderate',
      'analytics.view',
      'reports.view',
      'reports.generate',
      'reports.export',
      'early_warning.manage',
      'documents.view',
      'leave.apply',
      'notices.view',
    ],
  },

  // 7. Student: Restricted strictly to own records.
  student: {
    scope: 'OWN',
    permissions: [
      'students.view_own',
      'attendance.view_own',
      'results.view_own',
      'marks.view_own',
      'timetable.view_own',
      'fees.view_own',
      'library.view_own',
      'hostel.view_own',
      'placement.view_eligible',
      'placement.apply',
      'assignments.submit',
      'complaints.create',
      'leave.apply_own',
      'profile.update_allowed',
    ],
  },

  // 8. Exam Cell: Autonomous examination cycles, seating, marks collection, verification & publishing.
  exam_cell: {
    scope: 'MODULE',
    permissions: [
      'exams.create',
      'exams.schedule',
      'exams.manage',
      'exams.cycles',
      'exams.timetable',
      'exams.seating',
      'exams.hall_tickets',
      'exams.moderation',
      'exams.grading',
      'exams.scrutiny',
      'exams.circulars',
      'exams.analytics',
      'results.enter',
      'results.verify',
      'results.publish',
      'hall_tickets.generate',
      'grade_cards.generate',
      'reports.exam',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 9. Accounts: Tuition, fees, transactions, scholarships, receipts, verification & financial summaries.
  accounts: {
    scope: 'MODULE',
    permissions: [
      'fees.view',
      'fees.collect',
      'fees.refund',
      'fees.approve',
      'fees.verify_proofs',
      'fees.manage_structures',
      'fees.waivers',
      'scholarships.manage',
      'receipts.generate',
      'documents.finance',
      'reports.finance',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 10. Library: Book catalog, physical copies, circulation, returns, fines, reservations, acquisitions & digital resources.
  library: {
    scope: 'MODULE',
    permissions: [
      'library.view',
      'library.manage_books',
      'library.copies',
      'library.circulation',
      'library.issue',
      'library.return',
      'library.renew',
      'library.reservations',
      'library.fines',
      'library.waive',
      'library.acquisitions',
      'library.digital_resources',
      'library.policies',
      'reports.library',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 11. Placement: Corporate drives, companies, eligibility engine, ATS pipeline, interview rounds, offers & analytics.
  placement: {
    scope: 'MODULE',
    permissions: [
      'placement.view',
      'placement.manage_companies',
      'placement.manage_drives',
      'placement.eligibility_engine',
      'placement.manage_students',
      'placement.shortlist',
      'placement.advance_stage',
      'placement.interviews',
      'placement.offers',
      'placement.publish_results',
      'placement.analytics',
      'reports.placement',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 12. Transport: Fleet vehicles, driver rosters, routes, student bus passes, trip operations & compliance.
  transport: {
    scope: 'MODULE',
    permissions: [
      'transport.view',
      'transport.manage_fleet',
      'transport.manage_drivers',
      'transport.manage_routes',
      'transport.assign_vehicle',
      'transport.manage_allocations',
      'transport.manage_passes',
      'transport.trips',
      'transport.incidents',
      'transport.fees',
      'transport.gps',
      'reports.transport',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 13. Hostel: Residence blocks, room bed allocation, hostel fees, resident complaints.
  hostel: {
    scope: 'MODULE',
    permissions: [
      'hostel.view',
      'hostel.allocate',
      'hostel.manage_rooms',
      'hostel.complaints',
      'hostel.visitors',
      'hostel.gate_passes',
      'hostel.documents',
      'reports.hostel',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // 14. Staff (Labs & Campus Operations): Technical support tickets, visitor passes, dispatch register, lab maintenance.
  staff: {
    scope: 'MODULE',
    permissions: [
      'staff.view',
      'staff.manage_equipment',
      'staff.lab_schedule',
      'staff.maintenance',
      'tickets.view',
      'tickets.create',
      'tickets.assign',
      'tickets.update',
      'visitors.view',
      'visitors.create',
      'visitors.checkin',
      'visitors.checkout',
      'dispatch.view',
      'dispatch.create',
      'dispatch.update',
      'reports.lab',
      'reports.operations',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  // Backward compatibility alias for warden
  warden: {
    scope: 'MODULE',
    permissions: [
      'hostel.view',
      'hostel.allocate',
      'hostel.manage_rooms',
      'hostel.complaints',
      'hostel.visitors',
      'hostel.gate_passes',
      'hostel.documents',
      'reports.hostel',
      'reports.view',
      'reports.generate',
      'reports.export',
    ],
  },

  canteen: {
    scope: 'MODULE',
    permissions: ['canteen.manage', 'canteen.orders'],
  },
};

/**
 * Normalizes role string to canonical key in rolePolicies
 */
export function normalizeRole(role: string): string {
  if (!role) return '';
  const cleaned = role.toLowerCase().replace(/[\s-]+/g, '_');
  if (cleaned === 'superadmin' || cleaned === 'super_admin') return 'super_admin';
  if (cleaned === 'principal' || cleaned === 'director') return 'principal';
  if (cleaned === 'management' || cleaned === 'trustee' || cleaned === 'chairman') return 'management';
  if (cleaned === 'admin' || cleaned === 'admin_ops' || cleaned === 'college_admin') return 'admin';
  if (cleaned === 'exam_cell' || cleaned === 'exam' || cleaned === 'exam_staff' || cleaned === 'coe' || cleaned === 'controller_of_examinations') return 'exam_cell';
  if (cleaned === 'accounts' || cleaned === 'finance' || cleaned === 'accounts_staff') return 'accounts';
  if (cleaned === 'library' || cleaned === 'librarian') return 'library';
  if (cleaned === 'placement' || cleaned === 'training_placement' || cleaned === 'placement_officer') return 'placement';
  if (cleaned === 'transport' || cleaned === 'transport_staff') return 'transport';
  if (cleaned === 'hostel' || cleaned === 'warden' || cleaned === 'hostel_staff') return 'hostel';
  if (cleaned === 'staff' || cleaned === 'labs' || cleaned === 'lab_staff') return 'staff';
  if (cleaned === 'hod' || cleaned === 'head_of_department') return 'hod';
  if (cleaned === 'faculty' || cleaned === 'teacher' || cleaned === 'professor' || cleaned === 'assistant_professor' || cleaned === 'associate_professor' || cleaned === 'lecturer') return 'faculty';
  return cleaned;
}

/**
 * Checks if a user role has a specific permission
 */
export function hasPermission(role: string, permission: string): boolean {
  const norm = normalizeRole(role);
  const policy = rolePolicies[norm];
  if (!policy) return false;

  // Normal users never get '*' permissions unless super_admin
  if (norm === 'super_admin') return true;

  return policy.permissions.includes(permission);
}

/**
 * Check resource ownership / data scope.
 * Prevents horizontal privilege escalation across departments and between students.
 */
export function checkScope(
  user: { role: string; department?: string; identifier?: string; id?: string },
  targetDepartment?: string,
  targetOwnerId?: string,
): boolean {
  const norm = normalizeRole(user.role);
  const policy = rolePolicies[norm];
  if (!policy) return false;

  // Super Admin, Principal, and Management have institutional visibility
  if (policy.scope === 'SYSTEM' || policy.scope === 'COLLEGE') {
    return true;
  }

  // HOD & Faculty are strictly scoped to their department
  if (policy.scope === 'DEPARTMENT') {
    if (!targetDepartment) return true;
    return (user.department || '').toLowerCase() === targetDepartment.toLowerCase();
  }

  // Student is strictly scoped to their OWN identifier / id
  if (policy.scope === 'OWN') {
    if (!targetOwnerId) return true;
    return (
      (user.identifier && user.identifier.toLowerCase() === targetOwnerId.toLowerCase()) ||
      user.id === targetOwnerId
    );
  }

  return true;
}
