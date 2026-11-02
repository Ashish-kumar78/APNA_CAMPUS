export interface WardenPermissions {
  viewHostelRecords: boolean;
  manageAttendance: boolean;
  submitAttendance: boolean;
  viewRoomAllocations: boolean;
  manageRoomAllocations: boolean;
  reviewStudentLeaves: boolean;
  approveOperationalRequests: boolean;
  manageGatePasses: boolean;
  registerVisitors: boolean;
  recordDisciplinaryIncidents: boolean;
  manageComplaints: boolean;
  createInventoryRequisitions: boolean;
  manageStaffDutyRosters: boolean;
  viewReports: boolean;
  exportReports: boolean;
  editHostelConfiguration: boolean;
}

export const DEFAULT_WARDEN_PERMISSIONS: WardenPermissions = {
  viewHostelRecords: true,
  manageAttendance: true,
  submitAttendance: true,
  viewRoomAllocations: true,
  manageRoomAllocations: true,
  reviewStudentLeaves: true,
  approveOperationalRequests: false, // Protected: Admin authority
  manageGatePasses: true,
  registerVisitors: true,
  recordDisciplinaryIncidents: true,
  manageComplaints: true,
  createInventoryRequisitions: true,
  manageStaffDutyRosters: false, // Protected: Admin authority
  viewReports: true,
  exportReports: false, // Protected: Sensitive PII export
  editHostelConfiguration: false, // Protected: Curfew & institutional policies
};

// In-memory persistent cache for warden permissions
const wardenPermissionsCache: Record<string, WardenPermissions> = {
  'WRD-101': { ...DEFAULT_WARDEN_PERMISSIONS },
  'WRD-102': { ...DEFAULT_WARDEN_PERMISSIONS, submitAttendance: false, editHostelConfiguration: true },
  'WRD-103': { ...DEFAULT_WARDEN_PERMISSIONS },
  'WRD-104': { ...DEFAULT_WARDEN_PERMISSIONS },
  'WRD-105': { ...DEFAULT_WARDEN_PERMISSIONS, editHostelConfiguration: true },
  'WRD-106': { ...DEFAULT_WARDEN_PERMISSIONS },
};

// Global default matrix
let globalMatrix: WardenPermissions = { ...DEFAULT_WARDEN_PERMISSIONS };

export function getWardenPermissionsData(wardenId: string): WardenPermissions {
  if (wardenPermissionsCache[wardenId]) {
    return { ...wardenPermissionsCache[wardenId] };
  }
  return { ...globalMatrix };
}

export function getAllWardenPermissionsData(): {
  wardenPermissions: Record<string, WardenPermissions>;
  globalMatrix: WardenPermissions;
} {
  return {
    wardenPermissions: { ...wardenPermissionsCache },
    globalMatrix: { ...globalMatrix },
  };
}

export function hydrateWardenPermissionsData(entries: Array<{ wardenId: string; permissions: unknown }>): void {
  for (const entry of entries) {
    if (entry.wardenId === '__ALL__') {
      globalMatrix = { ...DEFAULT_WARDEN_PERMISSIONS, ...(entry.permissions as Partial<WardenPermissions>) };
    } else if (entry.permissions && typeof entry.permissions === 'object') {
      wardenPermissionsCache[entry.wardenId] = {
        ...DEFAULT_WARDEN_PERMISSIONS,
        ...(entry.permissions as Partial<WardenPermissions>),
      };
    }
  }
}

export function updateWardenPermissionsData(
  wardenId: string,
  updates: Partial<WardenPermissions>,
  applyToAll: boolean = false
): WardenPermissions {
  if (applyToAll) {
    return applyPermissionsToAllWardensData(updates);
  }

  const current = getWardenPermissionsData(wardenId);
  const updated = { ...current, ...updates };
  wardenPermissionsCache[wardenId] = updated;
  return updated;
}

export function applyPermissionsToAllWardensData(
  updates: Partial<WardenPermissions>
): WardenPermissions {
  // Update global matrix
  globalMatrix = { ...globalMatrix, ...updates };

  // Apply to all existing wardens in cache
  const allKnownIds = Object.keys(wardenPermissionsCache);
  const standardIds = ['WRD-101', 'WRD-102', 'WRD-103', 'WRD-104', 'WRD-105', 'WRD-106'];
  const uniqueIds = Array.from(new Set([...allKnownIds, ...standardIds]));

  uniqueIds.forEach((id) => {
    wardenPermissionsCache[id] = {
      ...(wardenPermissionsCache[id] || DEFAULT_WARDEN_PERMISSIONS),
      ...updates,
    };
  });

  return { ...globalMatrix };
}

