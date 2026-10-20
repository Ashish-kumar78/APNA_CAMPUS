export const rolePolicies = {
  super_admin: {
    permissions: ['*'],
  },
  college_admin: {
    permissions: ['student:read','student:write','faculty:read','attendance:write','results:write','fees:read','reports:read','audit:read'],
  },
  faculty: {
    permissions: ['attendance:write','marks:write','marks:read','subjects:read'],
  },
  mentor: {
    permissions: ['student:read:assigned','attendance:read','marks:read'],
  },
  student: {
    permissions: ['student:read:self','attendance:read:self','fees:read:self','documents:read:self','library:read:self','placements:read:self'],
  },
  accounts_staff: {
    permissions: ['fees:read','fees:write','payments:read','payments:write'],
  },
  exam_staff: {
    permissions: ['results:write','exam:read','exam:write'],
  },
  placement_officer: {
    permissions: ['placements:read','placements:write','internships:read'],
  },
  librarian: {
    permissions: ['library:read','library:write'],
  },
  hostel_staff: {
    permissions: ['hostel:read','hostel:write'],
  },
  transport_staff: {
    permissions: ['transport:read','transport:write'],
  },
  admissions: {
    permissions: ['admission:read','admission:write','admission:approve','student:read','student:write'],
  },
  maintenance: {
    permissions: ['complaints:read','complaints:write','maintenance:read','maintenance:write'],
  },
  principal: {
    permissions: ['academics:read', 'approvals:action', 'notices:publish_college', 'timetables:approve', 'timetables:publish', 'reports:read'],
  },
  hod: {
    permissions: ['department:read', 'faculty:read', 'subjects:allocate', 'timetable:manage_dept', 'timetables:manage', 'marks:moderate'],
  },
  non_teaching: {
    permissions: ['staff:read:self','attendance:read:self','leave:read:self','leave:write:self'],
  },
};

export function hasPermission(role, permission) {
  const policy = rolePolicies[role] || { permissions: [] };

  if (policy.permissions.includes('*')) {
    return true;
  }

  return policy.permissions.includes(permission);
}

export function canAccess(role, action) {
  return hasPermission(role, action);
}
