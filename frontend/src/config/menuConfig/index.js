import { getFacultyMenuConfig } from './menuConfig.faculty.js';
import { getStudentMenuConfig } from './menuConfig.student.js';
import { getAdminMenuConfig } from './menuConfig.admin.js';
import { getHodMenuConfig } from './menuConfig.hod.js';
import { getSuperAdminMenuConfig } from './menuConfig.superAdmin.js';
import { getPrincipalMenuConfig } from './menuConfig.principal.js';
import { getAccountsMenuConfig } from './menuConfig.accounts.js';
import { getExamCellMenuConfig } from './menuConfig.examCell.js';
import { getHostelMenuConfig } from './menuConfig.hostel.js';
import { getLibraryMenuConfig } from './menuConfig.library.js';
import { getPlacementMenuConfig } from './menuConfig.placement.js';
import { getTransportMenuConfig } from './menuConfig.transport.js';
import getCanteenMenuConfigDefault, { getCanteenMenuConfig as getCanteenMenuConfigNamed } from './menuConfig.canteen.js';
import { getAdmissionsMenuConfig } from './menuConfig.admissions.js';

const getCanteenMenuConfig = getCanteenMenuConfigNamed || getCanteenMenuConfigDefault;
import { getCampusOpsMenuConfig } from './menuConfig.campusOps.js';
import { getManagementMenuConfig } from './menuConfig.management.js';
import { getScholarshipMenuConfig } from './menuConfig.scholarship.js';
import { getStaffMenuConfig } from './menuConfig.staff.js';

export {
  getFacultyMenuConfig,
  getStudentMenuConfig,
  getAdminMenuConfig,
  getHodMenuConfig,
  getSuperAdminMenuConfig,
  getPrincipalMenuConfig,
  getAccountsMenuConfig,
  getExamCellMenuConfig,
  getHostelMenuConfig,
  getLibraryMenuConfig,
  getPlacementMenuConfig,
  getTransportMenuConfig,
  getCanteenMenuConfig,
  getAdmissionsMenuConfig,
  getCampusOpsMenuConfig,
  getManagementMenuConfig,
  getScholarshipMenuConfig,
  getStaffMenuConfig
};

/**
 * Universal Menu Configuration Resolver by User Role
 * Returns the exact array of sections for any of the 18 platform roles.
 */
export function getMenuConfigForRole(role, context = {}) {
  const normalized = String(role || '').toLowerCase().trim();

  switch (normalized) {
    case 'faculty':
    case 'teacher':
      return getFacultyMenuConfig(context);

    case 'student':
      return getStudentMenuConfig(context);

    case 'admin':
      return getAdminMenuConfig(context);

    case 'hod':
    case 'department_head':
      return getHodMenuConfig(context);

    case 'super_admin':
      return getSuperAdminMenuConfig(context);

    case 'principal':
    case 'director':
      return getPrincipalMenuConfig(context);

    case 'accounts':
    case 'finance':
      return getAccountsMenuConfig(context);

    case 'exam_cell':
    case 'examination':
    case 'controller_of_examinations':
      return getExamCellMenuConfig(context);

    case 'warden':
    case 'hostel':
    case 'hostel_admin':
      return getHostelMenuConfig(context);

    case 'library':
    case 'librarian':
      return getLibraryMenuConfig(context);

    case 'placement':
    case 'tpo':
      return getPlacementMenuConfig(context);

    case 'transport':
    case 'transport_manager':
      return getTransportMenuConfig(context);

    case 'canteen':
    case 'mess':
      return getCanteenMenuConfig(context);

    case 'admissions':
    case 'admission_officer':
      return getAdmissionsMenuConfig(context);

    case 'campus_operations':
    case 'campus_ops':
    case 'campusops':
    case 'operations':
      return getCampusOpsMenuConfig(context);

    case 'management':
    case 'trustee':
      return getManagementMenuConfig(context);

    case 'scholarship':
      return getScholarshipMenuConfig(context);

    case 'staff':
    case 'technician':
    case 'lab_assistant':
      return getStaffMenuConfig(context);

    default:
      return [];
  }
}

export default getMenuConfigForRole;
