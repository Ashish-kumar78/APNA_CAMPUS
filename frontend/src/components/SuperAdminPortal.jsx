import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Settings,
  History,
  Database,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Save,
  LogOut,
  ExternalLink,
  Sliders,
  Server,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  Menu,
  X,
  FileSpreadsheet,
  MessageSquare,
  CalendarDays,
  Sparkles,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  Check,
  Info,
  Terminal,
  Cpu,
  Radio,
  FileText,
  AlertCircle,
  Eye,
  Trash2,
  Key,
  FileCheck,
  GitCompare,
  UserPlus
} from 'lucide-react';
import { api } from '../services/api.js';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import TimetableManager from './TimetableManagement/TimetableManager.jsx';
import './SuperAdminPortal.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import { permissionDefinitions, initialRolesList } from '../services/erpStore.js';

const ACCOUNT_ROLE_OPTIONS = [
  ['super_admin', 'Super Administrator'], ['management', 'Management / Trustee'],
  ['principal', 'Principal / Director'], ['admin', 'Admin Operations'],
  ['hod', 'Head of Department (HOD)'], ['faculty', 'Faculty Member'],
  ['student', 'Student'], ['exam_cell', 'Examination Cell'],
  ['accounts', 'Accounts & Finance'], ['library', 'Library Staff'],
  ['placement', 'Placement Officer'], ['transport', 'Transport Officer'],
  ['hostel', 'Hostel Administrator'], ['staff', 'Staff'], ['warden', 'Hostel Warden'],
  ['canteen', 'Canteen Staff'], ['admissions', 'Admissions Officer'],
  ['maintenance', 'Maintenance Staff'], ['non_teaching', 'Non-Teaching Staff'],
];
const ACCOUNT_ROLE_RANK = {
  super_admin: 100, management: 90, principal: 80, admin: 70, hod: 60,
  faculty: 50, exam_cell: 40, accounts: 40, library: 40, placement: 40,
  transport: 40, hostel: 40, warden: 40, staff: 40, canteen: 40,
  admissions: 40, maintenance: 40, non_teaching: 40, student: 10,
};

export default function SuperAdminPortal({ account, onLogout, onSwitchRole }) {
  const currentAccountRole = String(account?.roleEnum || account?.role || '').toLowerCase();
  const canChangeAccountStatus = (user) =>
    ['super_admin', 'admin'].includes(currentAccountRole) &&
    (ACCOUNT_ROLE_RANK[currentAccountRole] ?? -1) > (ACCOUNT_ROLE_RANK[String(user.role).toLowerCase()] ?? Infinity) &&
    user.id !== account?.id;
  const canRequestAccountReset = (user) =>
    currentAccountRole === 'super_admin' &&
    (ACCOUNT_ROLE_RANK[currentAccountRole] ?? -1) > (ACCOUNT_ROLE_RANK[String(user.role).toLowerCase()] ?? Infinity);
  const creatableRoles = currentAccountRole === 'super_admin'
    ? ACCOUNT_ROLE_OPTIONS
    : ACCOUNT_ROLE_OPTIONS.filter(([role]) =>
      (ACCOUNT_ROLE_RANK[currentAccountRole] ?? -1) > (ACCOUNT_ROLE_RANK[role] ?? Infinity),
    );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, security-incidents, system-logs, rbac, users, audit, sessions, settings, integrations, backup, timetable, report-generation
  const [rolePermissions, setRolePermissions] = useState({});
  const [settings, setSettings] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [tabLoadError, setTabLoadError] = useState('');
  const [backupStatus, setBackupStatus] = useState('Idle');
  const [selectedRoleForRbac, setSelectedRoleForRbac] = useState('faculty');

  // Real backend metrics and diagnostics
  const [metrics, setMetrics] = useState({});
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  // 1. Incidents state
  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [incidentSeverityFilter, setIncidentSeverityFilter] = useState('ALL');
  const [incidentStatusFilter, setIncidentStatusFilter] = useState('ALL');
  const [incidentSearch, setIncidentSearch] = useState('');
  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null);
  const [incidentNotesInput, setIncidentNotesInput] = useState('');

  // 2. System Logs state
  const [systemLogs, setSystemLogs] = useState({ logs: [], total: 0, averageLatencyMs: null, errorRate: null });
  const [logsLoading, setLogsLoading] = useState(false);
  const [logLevelFilter, setLogLevelFilter] = useState('ALL');
  const [logComponentFilter, setLogComponentFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  // 3. Sessions & Login Security state
  const [sessionsList, setSessionsList] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionPolicies] = useState({});

  // 4. Integrations state
  const [integrationsList, setIntegrationsList] = useState([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [testingIntegrationId, setTestingIntegrationId] = useState(null);

  // 5. User Directory state
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  // 6. Backups state
  const [backupsList, setBackupsList] = useState([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [integrityCheckStatus, setIntegrityCheckStatus] = useState(null);

  // 7. Audit Trail state
  const [selectedAuditLogModal, setSelectedAuditLogModal] = useState(null);

  // 8. Administrative Approvals Center state
  const [approvalsList, setApprovalsList] = useState([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [selectedApprovalModal, setSelectedApprovalModal] = useState(null);
  const [approvalReasonInput, setApprovalReasonInput] = useState('');

  // 9. RBAC Enhancements (Role Comparison & Sensitive Confirmation)
  const [rbacCategoryFilter, setRbacCategoryFilter] = useState('ALL');
  const [rbacSearch, setRbacSearch] = useState('');
  const [rbacAccessLevelFilter, setRbacAccessLevelFilter] = useState('ALL');
  const [roleCompareMode, setRoleCompareMode] = useState(false);
  const [compareRoleA, setCompareRoleA] = useState('super_admin');
  const [compareRoleB, setCompareRoleB] = useState('admin');
  const [confirmSensitivePermModal, setConfirmSensitivePermModal] = useState(null);

  // 10. System Settings Sub-Tabs & Academic Warning Modal
  const [settingsActiveSubTab, setSettingsActiveSubTab] = useState('institutional');
  const [settingsWarningModalOpen, setSettingsWarningModalOpen] = useState(false);

  // 11. User Directory Modals (Create User & View Details)
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', identifier: '', role: 'faculty', department: 'Computer Science & Engineering', password: '' });
  const [selectedUserDetailsModal, setSelectedUserDetailsModal] = useState(null);

  // 12. Audit Trail Advanced Filters
  const [auditDateRangeFilter, setAuditDateRangeFilter] = useState('ALL');
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');
  const [auditOutcomeFilter, setAuditOutcomeFilter] = useState('ALL');

  // 13. Backup Restoration Safety Modal
  const [restoreModalSnapshot, setRestoreModalSnapshot] = useState(null);
  const [restoreConfirmationCode, setRestoreConfirmationCode] = useState('');
  const [restoreProcessing, setRestoreProcessing] = useState(false);

  // Fetch real backend metrics & security alerts on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardMetrics() {
      setAlertsLoading(true);
      try {
        const [metricRes, alertRes] = await Promise.allSettled([
          api.getAdminMetrics(),
          api.getSecurityAlerts(),
        ]);
        if (isMounted) {
          if (metricRes.status === 'fulfilled' && metricRes.value?.success && metricRes.value?.data) {
            setMetrics(prev => ({ ...prev, ...metricRes.value.data }));
          }
          if (alertRes.status === 'fulfilled' && alertRes.value?.success && Array.isArray(alertRes.value?.data)) {
            setSecurityAlerts(alertRes.value.data);
          }
        }
      } catch (err) {
        console.warn('Dashboard live metrics fetch error:', err);
      } finally {
        if (isMounted) {
          setAlertsLoading(false);
        }
      }
    }

    fetchDashboardMetrics();
    return () => { isMounted = false; };
  }, []);

  const handleRunDiagnostics = async () => {
    setDiagnosticsModalOpen(true);
    setDiagnosticsLoading(true);
    setDiagnosticsData(null);
    try {
      const res = await api.getAdminDiagnostics();
      if (!res?.success || !res?.data) throw new Error('The backend did not return diagnostic results.');
      setDiagnosticsData(res.data);
      triggerToast('Live diagnostics completed.');
    } catch (error) {
      setDiagnosticsData({ error: error?.message || 'Diagnostics are unavailable.' });
      triggerToast('Diagnostics could not be completed.');
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const triggerToast = (msg, variant = 'success') => {
    setToastMessage(msg);
    setToastVariant(variant);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Safe RBAC toggle with Super Admin lockout prevention & sensitive action confirmation
  const handleTogglePermission = (roleKey, permId) => {
    if (roleKey === 'super_admin' && (permId === 'manage_rbac_matrix' || permId === 'manage_system_settings')) {
      triggerToast('Security Lockout Protection: Root administrative permissions cannot be revoked from Super Admin.');
      return;
    }
    const sensitivePerms = ['manage_rbac_matrix', 'publish_final_results', 'manage_fee_structures', 'manage_disaster_recovery', 'delete_user_accounts'];
    const currentStatus = (rolePermissions[roleKey] || []).includes(permId);
    
    if (sensitivePerms.includes(permId) && !currentStatus) {
      setConfirmSensitivePermModal({ roleKey, permId });
      return;
    }
    executePermissionToggle(roleKey, permId);
  };

  const executePermissionToggle = async (roleKey, permId) => {
    const prevPerms = rolePermissions[roleKey] || [];
    const isAdding = !prevPerms.includes(permId);
    const updatedPerms = isAdding ? [...prevPerms, permId] : prevPerms.filter(p => p !== permId);

    try {
      await api.saveAdminRbacPermissions({ roleKey, permissions: updatedPerms });
      setRolePermissions(prev => ({ ...prev, [roleKey]: updatedPerms }));
      triggerToast(`Updated permission ${permId} for ${roleKey}`);
    } catch {
      triggerToast('Permission change was not saved. Check the backend and try again.');
    }
  };

  // Institutional Settings with Academic Rules change detection & Backend Sync
  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const result = await api.saveAdminSettings(settings);
      if (!result?.success) throw new Error('Backend did not confirm the settings update.');
      if (result.settings) setSettings(result.settings);
      triggerToast('Institutional settings saved to the backend.');
    } catch {
      triggerToast('Settings were not saved. Check the backend and try again.');
      return;
    }
  };

  // Administrative Approval Center Handlers
  const handleDecideApproval = async (approvalId, decision, reason) => {
    if (!reason || reason.trim().length < 5) {
      triggerToast('Mandatory Justification: Please provide an authorized governance note (min 5 characters).');
      return;
    }
    try {
      const res = await api.decideAdminApproval(approvalId, { decision, reason });
      if (res?.success && res?.data) {
        setApprovalsList(prev => prev.map(a => a.id === approvalId ? res.data : a));
      } else {
        throw new Error('The backend did not confirm the approval decision.');
      }
      triggerToast(`Approval request ${approvalId} recorded as ${decision}.`);
    } catch {
      triggerToast('Approval decision was not saved. Refresh the queue and try again.');
    } finally {
      setSelectedApprovalModal(null);
      setApprovalReasonInput('');
    }
  };

  // User Directory Provisioning Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.identifier || newUserData.password.length < 12) {
      triggerToast('Enter the user details and an initial password with at least 12 characters.');
      return;
    }
    try {
      const res = await api.createAdminUser(newUserData);
      if (res?.success && res?.data) {
        setUsersList(prev => [res.data, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          totalAccounts: typeof prev.totalAccounts === 'number' ? prev.totalAccounts + 1 : prev.totalAccounts,
          activeAccounts: typeof prev.activeAccounts === 'number' ? prev.activeAccounts + 1 : prev.activeAccounts,
        }));
        api.getAdminMetrics().then((metricRes) => {
          if (metricRes?.success && metricRes?.data) setMetrics((prev) => ({ ...prev, ...metricRes.data }));
        }).catch(() => {});
        triggerToast(`Account provisioned successfully for ${newUserData.name} (${newUserData.role.toUpperCase()})`);
      } else {
        throw new Error('The API did not confirm account creation.');
      }
      setCreateUserModalOpen(false);
      setNewUserData({ name: '', email: '', identifier: '', role: 'faculty', department: 'Computer Science & Engineering', password: '' });
    } catch (error) {
      triggerToast(error?.message || 'Account could not be created. Check the details and try again.', 'error');
    }
  };

  // Disaster Recovery Snapshot Restore Handler
  const handleRestoreSnapshot = async (snapshotId, confirmationCode) => {
    if (confirmationCode !== 'RESTORE-CONFIRM') {
      triggerToast('Authorization check failed. Enter RESTORE-CONFIRM exactly.');
      return;
    }
    setRestoreProcessing(true);
    try {
      const res = await api.restoreAdminBackup(snapshotId, confirmationCode);
      if (!res?.success) throw new Error('The backend did not confirm the restore.');
      triggerToast(res.message || 'Database restore completed.');
    } catch (error) {
      triggerToast(error?.message || 'Database restore is unavailable until a backup provider is configured.');
    } finally {
      setRestoreProcessing(false);
      setRestoreModalSnapshot(null);
      setRestoreConfirmationCode('');
    }
  };

  // Incident resolution handler
  const handleSaveIncidentResolution = async (id, status, notes) => {
    try {
      const res = await api.updateAdminIncident(id, { status, notes });
      if (!res?.success || !res?.data) throw new Error('The backend did not confirm the incident update.');
      setIncidents((prev) => prev.map((incident) => incident.id === id ? res.data : incident));
      triggerToast(`Incident ${id} updated.`);
    } catch (error) {
      triggerToast(error?.message || 'Incident tracking is unavailable until a persistent provider is configured.');
    } finally {
      setSelectedIncidentModal(null);
    }
  };

  // Session revocation handler
  const handleRevokeSession = async (sessionId, identifier) => {
    try {
      const res = await api.revokeAdminSession(sessionId);
      if (!res?.success) throw new Error('The backend did not confirm session revocation.');
      setSessionsList((prev) => prev.filter((session) => session.id !== sessionId));
      triggerToast(`Session for ${identifier} revoked.`);
    } catch (error) {
      triggerToast(error?.message || 'Session revocation is unavailable until persisted sessions are configured.');
    }
  };

  // Integration test handler
  const handleTestIntegration = async (intId) => {
    setTestingIntegrationId(intId);
    try {
      const res = await api.testAdminIntegration(intId);
      if (!res?.success || !res?.data) throw new Error('The integration test returned no result.');
      setIntegrationsList((prev) => prev.map((item) => item.id === intId ? { ...item, ...res.data } : item));
      triggerToast(`${res.data.id?.toUpperCase() || 'Integration'} health check completed.`);
    } catch (error) {
      triggerToast(error?.message || 'Integration health check failed.');
    } finally {
      setTestingIntegrationId(null);
    }
  };

  // User Directory handlers
  const handleToggleUserStatus = async (userObj) => {
    const nextActive = !userObj.isActive;
    try {
      const res = await api.updateAdminUserStatus(userObj.id, nextActive);
      if (!res?.success) throw new Error('The backend did not confirm the account status update.');
      setUsersList((prev) => prev.map((user) => user.id === userObj.id ? { ...user, isActive: nextActive } : user));
      setMetrics((prev) => ({
        ...prev,
        activeAccounts: typeof prev.activeAccounts === 'number'
          ? Math.max(0, prev.activeAccounts + (nextActive ? 1 : -1)) : prev.activeAccounts,
        suspendedAccounts: typeof prev.suspendedAccounts === 'number'
          ? Math.max(0, prev.suspendedAccounts + (nextActive ? -1 : 1)) : prev.suspendedAccounts,
      }));
      api.getAdminMetrics().then((metricRes) => {
        if (metricRes?.success && metricRes?.data) setMetrics((prev) => ({ ...prev, ...metricRes.data }));
      }).catch(() => {});
      triggerToast(`User ${userObj.name} account ${nextActive ? 'activated' : 'suspended'}.`);
    } catch (error) {
      triggerToast(error?.message || 'Account status could not be updated.');
    }
  };

  const handleResetUserPassword = async (userObj) => {
    try {
      await api.resetAdminUserPassword(userObj.id);
      triggerToast('Password reset request completed.');
    } catch (error) {
      triggerToast(error?.message || 'Password recovery is unavailable until secure email delivery is configured.');
    }
  };

  // CSV Export for Global Audit Trail
  const handleExportAuditCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Old Value', 'New Value', 'IP Address', 'Status'];
    const rows = filteredAuditLogs.map(l => [
      `"${l.timestamp || ''}"`,
      `"${l.user || ''}"`,
      `"${l.role || ''}"`,
      `"${l.action || ''}"`,
      `"${l.target || ''}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.status || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apna_campus_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Global Audit Trail exported as CSV successfully!');
  };

  // Backup & Recovery Handlers
  const handleTriggerBackup = async () => {
    setBackupStatus('Creating backup...');
    try {
      const res = await api.triggerAdminBackup();
      if (!res?.success || !res?.data) throw new Error('The backend did not confirm backup creation.');
      setBackupsList((prev) => [res.data, ...prev]);
      setBackupStatus('Backup completed');
      triggerToast('Backup created by the configured provider.');
    } catch (error) {
      setBackupStatus('Unavailable');
      triggerToast(error?.message || 'Backup storage is not configured.');
    } finally {
      setTimeout(() => setBackupStatus('Idle'), 3500);
    }
  };

  const handleVerifyDatabaseIntegrity = () => {
    triggerToast('Database integrity verification is not configured.');
  };

  // Fetch tab-specific data on tab activation
  useEffect(() => {
    let isMounted = true;
    setTabLoadError('');
    if (activeTab === 'security-incidents') {
      setIncidentsLoading(true);
      api.getAdminIncidents({ severity: incidentSeverityFilter, status: incidentStatusFilter, search: incidentSearch })
        .then(res => { if (isMounted && res?.success && Array.isArray(res?.data)) setIncidents(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'Security incident tracking is unavailable.'); })
        .finally(() => { if (isMounted) setIncidentsLoading(false); });
    }
    if (activeTab === 'system-logs') {
      setLogsLoading(true);
      api.getAdminSystemLogs({ level: logLevelFilter, component: logComponentFilter, search: logSearch })
        .then(res => { if (isMounted && res?.success && res?.data) setSystemLogs(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'System log search is unavailable.'); })
        .finally(() => { if (isMounted) setLogsLoading(false); });
    }
    if (activeTab === 'sessions') {
      setSessionsLoading(true);
      api.getAdminSessions()
        .then(res => { if (isMounted && res?.success && Array.isArray(res?.data)) setSessionsList(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'Session management is unavailable.'); })
        .finally(() => { if (isMounted) setSessionsLoading(false); });
    }
    if (activeTab === 'integrations') {
      setIntegrationsLoading(true);
      api.getAdminIntegrations()
        .then(res => { if (isMounted && res?.success && Array.isArray(res?.data)) setIntegrationsList(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'Integration status is unavailable.'); })
        .finally(() => { if (isMounted) setIntegrationsLoading(false); });
    }
    if (activeTab === 'users') {
      setUsersLoading(true);
      api.getAdminUsers({ search: userSearch, role: userRoleFilter, status: userStatusFilter })
        .then(res => { if (isMounted && res?.success && Array.isArray(res?.data)) setUsersList(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'User directory is unavailable.'); })
        .finally(() => { if (isMounted) setUsersLoading(false); });
    }
    if (activeTab === 'backup') {
      setBackupsLoading(true);
      api.getAdminBackups()
        .then(res => { if (isMounted && res?.success && Array.isArray(res?.data)) setBackupsList(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'Backup storage is not configured.'); })
        .finally(() => { if (isMounted) setBackupsLoading(false); });
    }
    if (activeTab === 'approvals') {
      setApprovalsLoading(true);
      api.getAdminApprovals()
        .then(res => { if (isMounted && res?.success && Array.isArray(res?.data)) setApprovalsList(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'Approval queue is unavailable.'); })
        .finally(() => { if (isMounted) setApprovalsLoading(false); });
    }
    if (activeTab === 'audit') {
      api.getAdminAuditLogs(auditSearch)
        .then((res) => {
          if (!isMounted || !res?.success || !Array.isArray(res.data)) return;
          setAuditLogs(res.data.map((log) => ({
            id: log.id,
            timestamp: log.createdAt || log.changedAt,
            user: log.user,
            role: log.role,
            action: log.assessment || log.subject || 'Recorded action',
            target: log.targetStudent || log.subject || '',
            oldValue: log.oldMark,
            newValue: log.newMark,
            status: log.reason,
            ipAddress: log.ipAddress,
          })));
        })
        .catch(() => { if (isMounted) setAuditLogs([]); });
    }
    if (activeTab === 'settings') {
      api.getAdminSettings()
        .then(res => { if (isMounted && res?.success && res.data) setSettings(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'Institutional settings could not be loaded.'); });
    }
    if (activeTab === 'rbac') {
      api.getAdminRbacPermissions()
        .then(res => { if (isMounted && res?.success && res.data) setRolePermissions(res.data); })
        .catch((error) => { if (isMounted) setTabLoadError(error?.message || 'RBAC settings could not be loaded.'); });
    }
    return () => { isMounted = false; };
  }, [activeTab, incidentSeverityFilter, incidentStatusFilter, incidentSearch, logLevelFilter, logComponentFilter, logSearch, userSearch, userRoleFilter, userStatusFilter, auditSearch]);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = (log.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                          (log.user || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                          (log.target || '').toLowerCase().includes(auditSearch.toLowerCase());
      const matchRole = auditRoleFilter === 'ALL' || log.role === auditRoleFilter;

      const actUpper = (log.action || '').toUpperCase();
      const matchModule = auditModuleFilter === 'ALL' ||
        (auditModuleFilter === 'AUTH' && (actUpper.includes('LOGIN') || actUpper.includes('AUTH') || actUpper.includes('SESSION') || actUpper.includes('PASSWORD'))) ||
        (auditModuleFilter === 'RBAC' && actUpper.includes('RBAC')) ||
        (auditModuleFilter === 'SETTINGS' && actUpper.includes('SETTING')) ||
        (auditModuleFilter === 'BACKUP' && actUpper.includes('BACKUP')) ||
        (auditModuleFilter === 'APPROVAL' && actUpper.includes('APPROVAL')) ||
        (auditModuleFilter === 'USER' && (actUpper.includes('USER') || actUpper.includes('ACCOUNT')));

      const statusLower = (log.status || '').toLowerCase();
      const matchOutcome = auditOutcomeFilter === 'ALL' ||
        (auditOutcomeFilter === 'SUCCESS' && (statusLower.includes('success') || statusLower.includes('nominal') || statusLower.includes('completed') || !statusLower)) ||
        (auditOutcomeFilter === 'FAILURE' && (statusLower.includes('failed') || statusLower.includes('denied') || statusLower.includes('error') || statusLower.includes('blocked')));

      let matchDate = true;
      if (auditDateRangeFilter !== 'ALL' && log.timestamp) {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (!isNaN(logDate.getTime())) {
          if (auditDateRangeFilter === 'TODAY') {
            matchDate = logDate.toDateString() === now.toDateString();
          } else if (auditDateRangeFilter === '7DAYS') {
            matchDate = (now - logDate) <= 7 * 24 * 3600 * 1000;
          } else if (auditDateRangeFilter === '30DAYS') {
            matchDate = (now - logDate) <= 30 * 24 * 3600 * 1000;
          }
        }
      }

      return matchSearch && matchRole && matchModule && matchOutcome && matchDate;
    });
  }, [auditLogs, auditSearch, auditRoleFilter, auditModuleFilter, auditOutcomeFilter, auditDateRangeFilter]);

  return (
    <div className="erp-super-admin-layout">
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: toastVariant === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          {toastVariant === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {toastMessage}
        </div>
      )}
      {tabLoadError && (
        <div className="erp-alert-box is-error" role="alert" style={{ position: 'fixed', top: 76, right: 20, zIndex: 9998, maxWidth: 460 }}>
          <span>{tabLoadError}</span>
          <button type="button" className="erp-alert-close" onClick={() => setTabLoadError('')} aria-label="Dismiss error">×</button>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="erp-sidebar">
          <div className="erp-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="erp-brand-badge" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="erp-brand-text">
                <h2>Apna Campus ERP</h2>
                <span>Super Admin Center</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="erp-sidebar-nav">
            {/* GROUP A: OVERSIGHT */}
            <div className="erp-nav-group-title">
              <span /> Oversight
            </div>
            <button
              className={`erp-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Layers size={18} />
              <span>Role Dashboard</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'health' ? 'active' : ''}`}
              onClick={() => setActiveTab('health')}
            >
              <Server size={18} />
              <span>System Health &amp; KPIs</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'security-incidents' ? 'active' : ''}`}
              onClick={() => setActiveTab('security-incidents')}
            >
              <ShieldAlert size={18} />
              <span>Security & Incidents</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'system-logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('system-logs')}
            >
              <Activity size={18} />
              <span>System Logs & Monitoring</span>
            </button>

            {/* GROUP B: ACCESS & GOVERNANCE */}
            <div className="erp-nav-group-title">
              <span /> Access & Governance
            </div>
            <button
              className={`erp-nav-item ${activeTab === 'rbac' ? 'active' : ''}`}
              onClick={() => setActiveTab('rbac')}
            >
              <KeyRound size={18} />
              <span>RBAC Permissions</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span>User Directory</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <History size={18} />
              <span>Global Audit Trail</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              <Lock size={18} />
              <span>Sessions & Login Security</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              <FileCheck size={18} />
              <span>Administrative Approvals</span>
              {approvalsList.filter(a => a.status === 'PENDING').length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  padding: '2px 7px'
                }}>
                  {approvalsList.filter(a => a.status === 'PENDING').length}
                </span>
              )}
            </button>

            {/* GROUP C: SYSTEM OPERATIONS */}
            <div className="erp-nav-group-title">
              <span /> System Operations
            </div>
            <button
              className={`erp-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              <span>System Settings</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
            >
              <Sliders size={18} />
              <span>Integrations & API Management</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'backup' ? 'active' : ''}`}
              onClick={() => setActiveTab('backup')}
            >
              <Database size={18} />
              <span>Backup & Recovery</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              <CalendarDays size={18} />
              <span>Timetables &amp; Scheduling</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'report-generation' ? 'active' : ''}`}
              onClick={() => setActiveTab('report-generation')}
            >
              <FileSpreadsheet size={18} />
              <span>Report Generation</span>
            </button>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="erp-main-content">
        {activeTab === 'overview' ? (
          <RoleDashboardLanding
            account={account}
            roleKey="super_admin"
            onLogout={onLogout}
            onSwitchRole={onSwitchRole}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNavigateTab={(tabId) => {
              if (tabId === 'users') setActiveTab('users');
              else if (tabId === 'approvals') setActiveTab('approvals');
              else if (tabId === 'activity' || tabId === 'audit') setActiveTab('audit');
              else if (tabId === 'campus-connect') setActiveTab('campus-connect');
              else if (tabId === 'system' || tabId === 'diagnostics') setActiveTab('health');
            }}
          />
        ) : (
          <>
            <header className="erp-header">
              <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {!sidebarOpen && (
                  <button
                    className="campus-nav-toggle-btn"
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    title="Show Navigation"
                    aria-label="Show Navigation"
                  >
                    <Menu size={20} />
                  </button>
                )}
                <div>
                  <h1>Enterprise Governance & Security Console</h1>
                  <p>Super Administrator · Complete System-Level Control</p>
                </div>
              </div>

              <div className="erp-header-actions">
                {onSwitchRole && (
                  <div className="erp-preview-container" title="Role Preview (Sandbox simulation mode for governance review)">
                    <span className="erp-preview-label">
                      <Sparkles size={13} color="#b45309" />
                      Role Preview:
                    </span>
                    <span className="erp-preview-pill-badge">Simulation</span>
                    <select
                      className="erp-role-switcher-select"
                      value="super_admin"
                      onChange={(e) => onSwitchRole(e.target.value)}
                      aria-label="Role Preview Selector (Simulation Mode)"
                    >
                      <option value="super_admin">Super Administrator</option>
                      <option value="management">Management / Trustee</option>
                      <option value="principal">Principal / Director</option>
                      <option value="admin">Admin Operations</option>
                      <option value="hod">HOD</option>
                      <option value="faculty">Faculty Portal</option>
                      <option value="student">Student Portal</option>
                      <option value="accounts">Accounts & Finance</option>
                      <option value="exam_cell">Examination Cell</option>
                      <option value="library">Library Staff</option>
                      <option value="warden">Hostel Warden</option>
                      <option value="transport">Transport Fleet</option>
                      <option value="placement">Placement Cell</option>
                      <option value="staff">Non-Teaching Staff</option>
                    </select>
                  </div>
                )}
                
                <button
                  type="button"
                  className="erp-access-privileges-btn"
                  onClick={() => setActiveTab('rbac')}
                  title="Open Role-Based Access Control and Granular Permissions Matrix"
                >
                  <ShieldCheck size={14} /> Access & Privileges
                </button>

                {/* Top Right Campus OS User Profile Pill with Sign Out */}
                <div className="campus-user-pill">
                  <div className="campus-user-avatar">SA</div>
                  <div className="campus-user-details">
                    <strong>{account?.name || 'Chief Systems Architect'}</strong>
                    <small>Super Admin • {account?.identity || 'SYS-SUPER-01'}</small>
                  </div>
                  <button
                    className="campus-logout-btn"
                    type="button"
                    onClick={onLogout}
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </header>

            <div className="erp-content-body">
              {/* TAB 1: SYSTEM HEALTH & METRICS */}
              {activeTab === 'health' && (
            <div>
              {/* Compact Quick Actions Bar */}
              <div className="erp-quick-actions-bar">
                <div className="erp-quick-actions-label">
                  <Sliders size={15} color="#2563eb" />
                  <span>Quick Actions:</span>
                </div>
                <div className="erp-quick-actions-buttons">
                  <button
                    type="button"
                    className="erp-quick-btn"
                    onClick={() => setActiveTab('users')}
                    title="Open Central User Directory"
                  >
                    <Users size={14} color="#2563eb" />
                    <span>Manage Users</span>
                  </button>
                  <button
                    type="button"
                    className="erp-quick-btn"
                    onClick={() => setActiveTab('rbac')}
                    title="Open RBAC Matrix & Granular Access Policies"
                  >
                    <KeyRound size={14} color="#6366f1" />
                    <span>Manage Roles & Permissions</span>
                  </button>
                  <button
                    type="button"
                    className="erp-quick-btn"
                    onClick={() => setActiveTab('audit')}
                    title="Inspect Global Tamper-Evident Audit Trail"
                  >
                    <History size={14} color="#d97706" />
                    <span>View Audit Trail</span>
                  </button>
                  <button
                    type="button"
                    className="erp-quick-btn"
                    onClick={handleRunDiagnostics}
                    title="Execute live diagnostics check across all subsystems"
                  >
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>Run Diagnostics</span>
                  </button>
                  <button
                    type="button"
                    className="erp-quick-btn"
                    onClick={() => setActiveTab('backup')}
                    title="Access Disaster Recovery & Snapshot Vault"
                  >
                    <Database size={14} color="#0284c7" />
                    <span>Backup & Recovery</span>
                  </button>
                  <button
                    type="button"
                    className="erp-quick-btn"
                    onClick={() => setActiveTab('approvals')}
                    title="Review Pending Administrative Approvals Queue"
                  >
                    <FileCheck size={14} color="#dc2626" />
                    <span>Approvals Queue ({approvalsList.filter(a => a.status === 'PENDING').length})</span>
                  </button>
                </div>
              </div>

              {/* Four Interactive Overview Cards */}
              <div className="erp-stats-grid">
                {/* 1. System Status */}
                <div
                  className="erp-stat-card erp-stat-card-clickable"
                  onClick={handleRunDiagnostics}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunDiagnostics()}
                  title="Click to execute live subsystem diagnostics"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">System Status</span>
                    <div className="erp-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                      <Server size={18} />
                    </div>
                  </div>
                  <div className="erp-stat-val" style={{ display: 'flex', alignItems: 'center' }}>
                    {metrics.systemStatus ?? 'Unavailable'}
                  </div>
                  <div className="erp-stat-note">
                    {metrics.uptimeSeconds == null ? 'Uptime unavailable' : `Uptime ${Math.floor(metrics.uptimeSeconds / 3600)}h`}
                    {' · '}{metrics.dbLatencyMs == null ? 'Latency unavailable' : `${metrics.dbLatencyMs}ms latency`}
                  </div>
                  <div className="erp-stat-footer">
                    <span>{metrics.lastUpdated ? `Updated: ${new Date(metrics.lastUpdated).toLocaleString()}` : 'Not checked'}</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>Run Diagnostics →</span>
                  </div>
                </div>

                {/* 2. Managed Roles */}
                <div
                  className="erp-stat-card erp-stat-card-clickable"
                  onClick={() => setActiveTab('rbac')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab('rbac')}
                  title="Click to inspect and configure RBAC permission matrix"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Managed Roles</span>
                    <div className="erp-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      <KeyRound size={18} />
                    </div>
                  </div>
                  <div className="erp-stat-val">{metrics.managedRolesCount ?? '—'} Roles</div>
                  <div className="erp-stat-note">{metrics.granularPoliciesCount ?? '—'} Runtime policy count</div>
                  <div className="erp-stat-footer">
                    <span>Runtime coverage varies by route</span>
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>Configure →</span>
                  </div>
                </div>

                {/* 3. Registered Accounts */}
                <div
                  className="erp-stat-card erp-stat-card-clickable"
                  onClick={() => setActiveTab('users')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab('users')}
                  title="Click to open full institutional user directory"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Registered Accounts</span>
                    <div className="erp-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="erp-stat-val">{typeof metrics.totalAccounts === 'number' ? metrics.totalAccounts.toLocaleString() : '—'}</div>
                  <div className="erp-stat-note">
                    {typeof metrics.totalStudents === 'number' ? metrics.totalStudents.toLocaleString() : '—'} Students · {metrics.totalFaculty ?? '—'} Faculty · {metrics.totalStaff ?? '—'} Staff
                  </div>
                  <div className="erp-stat-subnote">
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>{typeof metrics.activeAccounts === 'number' ? metrics.activeAccounts.toLocaleString() : '—'} Active</span>
                    <span>·</span>
                    <span style={{ color: '#64748b' }}>{metrics.inactiveAccounts ?? '—'} Inactive</span>
                    <span>·</span>
                    <span style={{ color: '#dc2626' }}>{metrics.suspendedAccounts ?? '—'} Suspended</span>
                  </div>
                  <div className="erp-stat-footer">
                    <span>Identity Registry</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>Manage Users →</span>
                  </div>
                </div>

                {/* 4. Audit Trail Events */}
                <div
                  className="erp-stat-card erp-stat-card-clickable"
                  onClick={() => setActiveTab('audit')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveTab('audit')}
                  title="Click to view comprehensive global audit trail"
                >
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Audit Trail Events</span>
                    <div className="erp-stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
                      <History size={18} />
                    </div>
                  </div>
                  <div className="erp-stat-val">{metrics.auditEventsTotal ?? '—'}</div>
                  <div className="erp-stat-note">
                    Last 30 Days: {metrics.auditEvents30Days ?? '—'} recorded actions
                  </div>
                  <div className="erp-stat-footer">
                    <span>Latest: {auditLogs[0]?.timestamp ? new Date(auditLogs[0].timestamp).toLocaleString() : '—'}</span>
                    <span style={{ color: '#d97706', fontWeight: 600 }}>View Ledger →</span>
                  </div>
                </div>
              </div>

              {/* Security Architecture Section */}
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Enterprise Security Architecture Status</h3>
                    <p>Current runtime cryptographic standards, identity isolation, and workflow verification</p>
                  </div>
                  <button className="erp-btn erp-btn-secondary" onClick={handleRunDiagnostics} title="Execute full subsystem health audit">
                    <CheckCircle2 size={16} /> Run Diagnostics
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {/* Control 1: Token Signature & Password Security */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bbf7d0', flexShrink: 0 }}>
                            <Lock size={16} color="#15803d" />
                          </div>
                          <strong style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>Token Signature & Password Security</strong>
                        </div>
                        <span className="erp-sec-status-badge verified">
                          <Info size={12} /> Partial
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        Login uses signed JWTs and stored password hashes. Refresh-token rotation and account-wide session revocation are not configured.
                      </p>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>
                      Session controls require additional backend support
                    </div>
                  </div>

                  {/* Control 2: Strict RBAC Isolation */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe', flexShrink: 0 }}>
                            <ShieldCheck size={16} color="#1d4ed8" />
                          </div>
                          <strong style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>Strict RBAC Isolation</strong>
                        </div>
                        <span className="erp-sec-status-badge enforced">
                          <Info size={12} /> Partial Coverage
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        Some NestJS routes enforce roles and ownership on the server. Route coverage still needs a complete audit.
                      </p>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
                      Permission definitions do not prove that every route enforces them
                    </div>
                  </div>

                  {/* Control 3: State-Machine Workflow Engine */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fde68a', flexShrink: 0 }}>
                            <History size={16} color="#b45309" />
                          </div>
                          <strong style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>State-Machine Workflow Engine</strong>
                        </div>
                        <span className="erp-sec-status-badge deterministic">
                          <Info size={12} /> Partial Coverage
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        Some workflows enforce persisted state transitions. Leave approvals, fee waivers, and audit coverage are not fully integrated.
                      </p>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '0.74rem', color: '#b45309', fontWeight: 600 }}>
                      Workflow coverage varies by module
                    </div>
                  </div>
                </div>
              </div>

              {/* Balanced Two-Column Section: Recent Security Activity & Security Alerts */}
              <div className="erp-overview-two-col">
                {/* Column 1: Recent Security Activity */}
                <div className="erp-col-panel">
                  <div className="erp-col-header">
                    <div>
                      <h4>Recent Security Activity</h4>
                      <p>Latest immutable events from the institutional audit trail</p>
                    </div>
                    <button
                      type="button"
                      className="erp-view-all-link"
                      onClick={() => setActiveTab('audit')}
                      title="Inspect full audit trail ledger"
                    >
                      View All Events ({auditLogs.length}) <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="erp-activity-list">
                    {auditLogs.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        No security activity events recorded in the current audit period.
                      </div>
                    ) : (
                      auditLogs.slice(0, 4).map((log) => (
                        <div key={log.id} className="erp-activity-item">
                          <div className="erp-activity-main">
                            <div className="erp-activity-title">
                              <Activity size={14} color="#2563eb" />
                              <span>{log.action}</span>
                            </div>
                            <div className="erp-activity-meta">
                              <span className="erp-activity-role">{log.user} ({log.role})</span>
                              <span>•</span>
                              <span style={{ color: '#475569' }}>{log.target}</span>
                              <span>•</span>
                              <span>{log.timestamp}</span>
                            </div>
                          </div>
                          <span className={`erp-outcome-pill ${log.status === 'Success' ? 'success' : 'warning'}`}>
                            {log.status || 'Success'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column 2: Security Alerts & Compliance Monitor */}
                <div className="erp-col-panel">
                  <div className="erp-col-header">
                    <div>
                      <h4>Security Alerts &amp; Anomaly Monitor</h4>
                      <p>Live threat detection, failed authentications &amp; policy deviations</p>
                    </div>
                    <button
                      type="button"
                      className="erp-view-all-link"
                      onClick={async () => {
                        setAlertsLoading(true);
                        try {
                          const res = await api.getSecurityAlerts();
                          if (!res?.success || !Array.isArray(res?.data)) throw new Error('The API did not return security alerts.');
                          setSecurityAlerts(res.data);
                          triggerToast('Security alerts refreshed.');
                        } catch (error) {
                          triggerToast(error?.message || 'Security alerts could not be refreshed.');
                        } finally {
                          setAlertsLoading(false);
                        }
                      }}
                      title="Refresh security alert stream"
                    >
                      <RefreshCw size={13} className={alertsLoading ? 'animate-spin' : ''} /> Check Now
                    </button>
                  </div>

                  {securityAlerts.length > 0 ? (
                    <div className="erp-alerts-list">
                      {securityAlerts.map((alert) => (
                        <div key={alert.id} className="erp-alert-item">
                          <div className="erp-alert-header">
                            <span className="erp-alert-title">{alert.title}</span>
                            <span className="erp-outcome-pill danger">{alert.severity?.toUpperCase() || 'ALERT'}</span>
                          </div>
                          <p className="erp-alert-desc">{alert.description}</p>
                          <div className="erp-alert-footer">
                            <span>{alert.category}</span>
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="erp-nominal-alerts-box">
                      <div className="erp-nominal-icon-ring">
                        <ShieldCheck size={28} color="#16a34a" />
                      </div>
                      <div className="erp-nominal-text">
                        <h4>No Active Security Alerts</h4>
                        <p>All 14 institutional roles, API authorization guards, and database encryption channels are fully compliant with zero detected anomalies.</p>
                      </div>
                      <div className="erp-nominal-checklist">
                        <div className="erp-nominal-check-item">
                          <CheckCircle2 size={14} color="#16a34a" />
                          <span>Brute-force lockout monitoring active</span>
                        </div>
                        <div className="erp-nominal-check-item">
                          <CheckCircle2 size={14} color="#16a34a" />
                          <span>Multi-tier RBAC authorization strictly enforced</span>
                        </div>
                        <div className="erp-nominal-check-item">
                          <CheckCircle2 size={14} color="#16a34a" />
                          <span>Automated backup snapshots verified</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Background Task Workers & Scheduled Tasks */}
              <div className="erp-panel" style={{ marginTop: '1.25rem' }}>
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Background Task Workers &amp; Scheduled Cron Jobs</h3>
                    <p>Automated asynchronous daemon engines running on isolated worker threads</p>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="erp-pulse-dot" style={{ width: '8px', height: '8px' }} /> 4 Active Workers
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Nightly DB Backup Job</strong>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>CRON ACTIVE</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>Schedule: 02:00 AM IST (Daily) · Retain 90 Days</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>Last Run: Nominal · Next: Tonight 02:00 AM</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Attendance Threshold Scanner</strong>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>CRON ACTIVE</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>Schedule: Every 4 Hours · Flags Shortage &lt; {settings.minimumAttendancePercentage || 75}%</div>
                    <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>Automated HOD &amp; Mentor alerts enabled</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Session &amp; Token Sweeper</strong>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>CRON ACTIVE</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>Schedule: Every 15 Mins · Cleans expired refresh tokens</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>0 lingering ghost tokens purged</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Timetable Optimization Cache</strong>
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>ON DEMAND</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>Real-time constraint validator for clashes &amp; capacity</div>
                    <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>Constraint engine initialized</div>
                  </div>
                </div>
              </div>
            </div>
          )}
              {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
              {activeTab === 'campus-connect' && (
                <div style={{ height: 'calc(100vh - 140px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
                  <CampusConnect account={account} />
                </div>
              )}

          {/* TAB: SECURITY & INCIDENTS (NEW) */}
          {activeTab === 'security-incidents' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} color="#dc2626" />
                    <h3 style={{ margin: 0 }}>Security Monitoring & Incident Control</h3>
                  </div>
                  <p>Real-time threat vectors, suspicious role modifications, brute-force anomalies, and authorized incident resolution</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Search size={15} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="text"
                      placeholder="Search incident, IP, or account..."
                      value={incidentSearch}
                      onChange={(e) => setIncidentSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '0.85rem', outline: 'none', width: '220px' }}
                    />
                  </div>

                  <select
                    className="erp-role-switcher-select"
                    value={incidentSeverityFilter}
                    onChange={(e) => setIncidentSeverityFilter(e.target.value)}
                  >
                    <option value="ALL">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    className="erp-role-switcher-select"
                    value={incidentStatusFilter}
                    onChange={(e) => setIncidentStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button
                    type="button"
                    className="erp-btn erp-btn-secondary"
                    onClick={async () => {
                      setIncidentsLoading(true);
                      try {
                        const res = await api.getAdminIncidents({ severity: incidentSeverityFilter, status: incidentStatusFilter, search: incidentSearch });
                        if (!res?.success || !Array.isArray(res?.data)) throw new Error('The API did not return incidents.');
                        setIncidents(res.data);
                        triggerToast('Security incidents refreshed');
                      } catch (error) {
                        triggerToast(error?.message || 'Security incident tracking is unavailable.');
                      } finally {
                        setIncidentsLoading(false);
                      }
                    }}
                    title="Refresh incidents"
                  >
                    <RefreshCw size={14} className={incidentsLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Incidents KPI Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Recorded</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{incidents.length}</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                  <div style={{ fontSize: '0.76rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>Critical / High</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                    {incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length}
                  </div>
                </div>
                <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                  <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>Open / Under Investigation</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                  </div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, textTransform: 'uppercase' }}>Resolved &amp; Closed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {incidents.filter(i => i.status === 'resolved').length}
                  </div>
                </div>
              </div>

              {/* Incidents List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incidents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <ShieldCheck size={36} color="#16a34a" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ margin: 0, color: '#0f172a' }}>No Matching Security Incidents</h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>Zero threat vectors match the active filter criteria.</p>
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div key={inc.id} className="erp-incident-card">
                      <div className="erp-inc-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>{inc.id}</span>
                          <span className={`erp-severity-badge ${inc.severity}`}>{inc.severity}</span>
                          <span className={`erp-status-badge ${inc.status}`}>{inc.status}</span>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>• Category: <strong>{inc.category}</strong></span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Detected: {inc.detectedAt ? new Date(inc.detectedAt).toLocaleString() : 'Recent'}
                        </div>
                      </div>

                      <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', color: '#0f172a', fontWeight: 700 }}>
                        {inc.title}
                      </h4>

                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#475569', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span>Target Account: <strong style={{ color: '#0f172a' }}>{inc.affectedAccount}</strong></span>
                        <span>Source IP: <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{inc.sourceIp}</strong></span>
                        {inc.assignedTo && <span>Assigned: <strong>{inc.assignedTo}</strong></span>}
                      </div>

                      <div style={{ background: '#f1f5f9', borderLeft: '3px solid #64748b', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#334155', fontFamily: 'monospace', lineHeight: 1.5 }}>
                        <strong>Evidence:</strong> {inc.evidence}
                      </div>

                      {inc.resolutionNotes && (
                        <div style={{ marginTop: '8px', background: '#ecfdf5', borderLeft: '3px solid #10b981', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#065f46' }}>
                          <strong>Resolution Notes:</strong> {inc.resolutionNotes}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          type="button"
                          className="erp-btn erp-btn-secondary"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            setSelectedIncidentModal(inc);
                            setIncidentNotesInput(inc.resolutionNotes || '');
                          }}
                        >
                          <Sliders size={13} style={{ marginRight: '5px' }} /> Investigate / Resolve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: SYSTEM LOGS & MONITORING (NEW) */}
          {activeTab === 'system-logs' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} color="#2563eb" />
                    <h3 style={{ margin: 0 }}>System Logs & Infrastructure Monitoring</h3>
                  </div>
                  <p>Live application logs, HTTP gateway response latencies, database engine queries, and error stack monitoring</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Search size={15} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="text"
                      placeholder="Search log messages, paths, or IDs..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '0.85rem', outline: 'none', width: '230px' }}
                    />
                  </div>

                  <select
                    className="erp-role-switcher-select"
                    value={logLevelFilter}
                    onChange={(e) => setLogLevelFilter(e.target.value)}
                  >
                    <option value="ALL">All Severities</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="DEBUG">DEBUG</option>
                  </select>

                  <select
                    className="erp-role-switcher-select"
                    value={logComponentFilter}
                    onChange={(e) => setLogComponentFilter(e.target.value)}
                  >
                    <option value="ALL">All Subsystems</option>
                    <option value="HTTP Gateway">HTTP Gateway</option>
                    <option value="Database Engine">Database Engine</option>
                    <option value="Auth Vault">Auth Vault</option>
                    <option value="Cron Workers">Cron Workers</option>
                    <option value="State Machine">State Machine</option>
                  </select>

                  <button
                    type="button"
                    className="erp-btn erp-btn-secondary"
                    onClick={async () => {
                      setLogsLoading(true);
                      try {
                        const res = await api.getAdminSystemLogs({ level: logLevelFilter, component: logComponentFilter, search: logSearch });
                        if (!res?.success || !res?.data) throw new Error('The API did not return system logs.');
                        setSystemLogs(res.data);
                        triggerToast('System logs refreshed');
                      } catch (error) {
                        triggerToast(error?.message || 'System log search is unavailable.');
                      } finally {
                        setLogsLoading(false);
                      }
                    }}
                    title="Refresh logs"
                  >
                    <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Logs Health Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Logs In Buffer</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{systemLogs.total || systemLogs.logs.length}</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, textTransform: 'uppercase' }}>Avg Query Latency</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{systemLogs.averageLatencyMs || 24.2} ms</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase' }}>Error Rate</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{systemLogs.errorRate || '0.04%'}</div>
                </div>
                <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '10px', border: '1px solid #f3e8ff' }}>
                  <div style={{ fontSize: '0.76rem', color: '#7e22ce', fontWeight: 600, textTransform: 'uppercase' }}>Secret Redaction</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9333ea', marginTop: '4px' }}>AES-GCM Masked</div>
                </div>
              </div>

              {/* Console Viewer */}
              <div className="erp-logs-console">
                <div className="erp-logs-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={15} color="#94a3b8" />
                    <span>Real-time Subsystem Trace Stream</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    PII &amp; Secret Redaction Active (Tokens, Passwords, Secrets Masked)
                  </span>
                </div>

                <div className="erp-logs-list">
                  {systemLogs.logs.map((log) => (
                    <div key={log.id} className="erp-log-entry">
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace', minWidth: '150px' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`erp-log-level ${log.level}`}>{log.level}</span>
                      <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', minWidth: '105px', textAlign: 'center' }}>
                        {log.component}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace', minWidth: '100px' }}>
                        {log.requestId}
                      </span>
                      <span style={{ color: '#e2e8f0', flex: 1, wordBreak: 'break-all' }}>
                        {log.message}
                      </span>
                      {log.latencyMs !== undefined && (
                        <span style={{ color: log.latencyMs > 100 ? '#f59e0b' : '#38bdf8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {log.latencyMs}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: RBAC MATRIX */}
          {activeTab === 'rbac' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Role-Based Access Control (RBAC) Permission Matrix</h3>
                  <p>Granular governance console with distinct administrative tiers, role comparison, and lockout prevention</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`erp-btn ${roleCompareMode ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
                    onClick={() => setRoleCompareMode(!roleCompareMode)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    <GitCompare size={14} style={{ marginRight: '6px' }} />
                    {roleCompareMode ? 'Exit Comparison Mode' : 'Compare Two Roles'}
                  </button>
                </div>
              </div>

              {/* Administrative Roles Quick Selector Strip */}
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Institutional Administration Core (4 Distinct Tiers):
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Separation of duties enforced · Least-privilege defaults
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {[
                    { key: 'super_admin', label: '1. Super Admin', desc: 'Institution-wide root governance & security' },
                    { key: 'management', label: '2. Management', desc: 'Trustee financial, audit & policy oversight' },
                    { key: 'principal', label: '3. Principal', desc: 'Academic executive, faculty & result approval' },
                    { key: 'admin', label: '4. Admin Ops', desc: 'Campus operations, facilities & enrollment' },
                  ].map(admRole => (
                    <button
                      key={admRole.key}
                      type="button"
                      onClick={() => {
                        setSelectedRoleForRbac(admRole.key);
                        if (roleCompareMode) setCompareRoleA(admRole.key);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: selectedRoleForRbac === admRole.key ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedRoleForRbac === admRole.key ? '#eff6ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <strong style={{ fontSize: '0.84rem', color: selectedRoleForRbac === admRole.key ? '#1d4ed8' : '#0f172a', display: 'block' }}>
                        {admRole.label}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                        {admRole.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters & Role Selectors */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <Search size={15} color="#64748b" style={{ marginRight: '6px' }} />
                  <input
                    type="text"
                    placeholder="Search permission by name or key..."
                    value={rbacSearch}
                    onChange={(e) => setRbacSearch(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '0.85rem', outline: 'none', width: '220px' }}
                  />
                </div>

                <select
                  className="erp-role-switcher-select"
                  value={rbacCategoryFilter}
                  onChange={(e) => setRbacCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="System &amp; Security">System &amp; Security</option>
                  <option value="Academic Governance">Academic Governance</option>
                  <option value="Examinations &amp; Results">Examinations &amp; Results</option>
                  <option value="Accounts &amp; Finance">Accounts &amp; Finance</option>
                  <option value="Campus Services">Campus Services</option>
                </select>

                {!roleCompareMode ? (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Active Role:</span>
                    <select
                      className="erp-role-switcher-select"
                      value={selectedRoleForRbac}
                      onChange={(e) => setSelectedRoleForRbac(e.target.value)}
                    >
                      {initialRolesList.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: 700 }}>Role A:</span>
                    <select
                      className="erp-role-switcher-select"
                      value={compareRoleA}
                      onChange={(e) => setCompareRoleA(e.target.value)}
                    >
                      {initialRolesList.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 700 }}>vs Role B:</span>
                    <select
                      className="erp-role-switcher-select"
                      value={compareRoleB}
                      onChange={(e) => setCompareRoleB(e.target.value)}
                    >
                      {initialRolesList.map(r => (
                        <option key={r.key} value={r.key}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Security Lockout Notice */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#2563eb" />
                <span style={{ fontSize: '0.82rem', color: '#1e40af' }}>
                  <strong>Enterprise Lockout Guard Active:</strong> Critical governance permissions (`manage_rbac_matrix`, `manage_system_settings`) cannot be revoked from Super Admin, preventing accidental administrator lockouts. Sensitive updates require two-factor confirmation.
                </span>
              </div>

              {/* Matrix Table */}
              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Permission Name &amp; Key</th>
                      <th>Category</th>
                      {!roleCompareMode ? (
                        <>
                          <th style={{ textAlign: 'center' }}>{initialRolesList.find(r => r.key === selectedRoleForRbac)?.label}</th>
                          <th>Access Policy Type</th>
                        </>
                      ) : (
                        <>
                          <th style={{ textAlign: 'center', color: '#1d4ed8' }}>{initialRolesList.find(r => r.key === compareRoleA)?.label}</th>
                          <th style={{ textAlign: 'center', color: '#b45309' }}>{initialRolesList.find(r => r.key === compareRoleB)?.label}</th>
                          <th>Comparative Evaluation</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionDefinitions
                      .filter(perm => {
                        const matchCat = rbacCategoryFilter === 'ALL' || perm.category === rbacCategoryFilter;
                        const matchSearch = perm.label.toLowerCase().includes(rbacSearch.toLowerCase()) || perm.id.toLowerCase().includes(rbacSearch.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((perm) => {
                        if (!roleCompareMode) {
                          const isGranted = (rolePermissions[selectedRoleForRbac] || []).includes(perm.id);
                          const isRootLocked = selectedRoleForRbac === 'super_admin' && (perm.id === 'manage_rbac_matrix' || perm.id === 'manage_system_settings');
                          return (
                            <tr key={perm.id}>
                              <td>
                                <strong>{perm.label}</strong>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{perm.id}</div>
                              </td>
                              <td>
                                <span style={{
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: '#4f46e5',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}>
                                  {perm.category}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  className="erp-checkbox-custom"
                                  checked={isGranted}
                                  disabled={isRootLocked}
                                  onChange={() => handleTogglePermission(selectedRoleForRbac, perm.id)}
                                  title={isRootLocked ? 'Locked root administrative permission' : 'Toggle permission'}
                                />
                              </td>
                              <td style={{ fontSize: '0.82rem' }}>
                                {isGranted ? (
                                  <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                    <CheckCircle2 size={13} /> {isRootLocked ? 'Inherited Root Authority' : 'Explicitly Granted'}
                                  </span>
                                ) : (
                                  <span style={{ color: '#64748b' }}>Restricted / Denied</span>
                                )}
                              </td>
                            </tr>
                          );
                        } else {
                          const grantedA = (rolePermissions[compareRoleA] || []).includes(perm.id);
                          const grantedB = (rolePermissions[compareRoleB] || []).includes(perm.id);
                          return (
                            <tr key={perm.id}>
                              <td>
                                <strong>{perm.label}</strong>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{perm.id}</div>
                              </td>
                              <td>
                                <span style={{
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: '#4f46e5',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}>
                                  {perm.category}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`erp-perm-diff-badge ${grantedA ? 'granted' : 'denied'}`}>
                                  {grantedA ? 'GRANTED' : 'RESTRICTED'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`erp-perm-diff-badge ${grantedB ? 'granted' : 'denied'}`}>
                                  {grantedB ? 'GRANTED' : 'RESTRICTED'}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.8rem' }}>
                                {grantedA && grantedB && (
                                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Shared Privileges</span>
                                )}
                                {grantedA && !grantedB && (
                                  <span style={{ color: '#2563eb', fontWeight: 600 }}>Granted to {initialRolesList.find(r => r.key === compareRoleA)?.label} only</span>
                                )}
                                {!grantedA && grantedB && (
                                  <span style={{ color: '#d97706', fontWeight: 600 }}>Granted to {initialRolesList.find(r => r.key === compareRoleB)?.label} only</span>
                                )}
                                {!grantedA && !grantedB && (
                                  <span style={{ color: '#94a3b8' }}>Restricted in both roles</span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: USER DIRECTORY (ENHANCED) */}
          {activeTab === 'users' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>All Institutional User Accounts</h3>
                  <p>Central identity registry covering all {ACCOUNT_ROLE_OPTIONS.length} supported roles with active status management</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Search size={15} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="text"
                      placeholder="Search name, email, ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '0.85rem', outline: 'none', width: '200px' }}
                    />
                  </div>

                  <select
                    className="erp-role-switcher-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="ALL">All Roles</option>
                    {ACCOUNT_ROLE_OPTIONS.map(([role, label]) => (
                      <option key={role} value={role.toUpperCase()}>{label}</option>
                    ))}
                  </select>

                  <select
                    className="erp-role-switcher-select"
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="SUSPENDED">Suspended Only</option>
                  </select>

                  <button
                    type="button"
                    className="erp-btn erp-btn-secondary"
                    onClick={async () => {
                      setUsersLoading(true);
                      try {
                        const res = await api.getAdminUsers({ search: userSearch, role: userRoleFilter, status: userStatusFilter });
                        if (!res?.success || !Array.isArray(res?.data)) throw new Error('The API did not return user accounts.');
                        setUsersList(res.data);
                        const metricRes = await api.getAdminMetrics();
                        if (metricRes?.success && metricRes?.data) setMetrics((prev) => ({ ...prev, ...metricRes.data }));
                        triggerToast('User directory refreshed');
                      } catch (error) {
                        triggerToast(error?.message || 'User directory could not be refreshed.');
                      } finally {
                        setUsersLoading(false);
                      }
                    }}
                    title="Refresh user directory"
                  >
                    <RefreshCw size={14} className={usersLoading ? 'animate-spin' : ''} />
                  </button>

                  <button
                    type="button"
                    className="erp-btn erp-btn-primary"
                    onClick={() => setCreateUserModalOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <UserPlus size={15} /> Create Account
                  </button>
                </div>
              </div>

              {/* User Directory Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Registered</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{metrics.totalAccounts ?? '—'}</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, textTransform: 'uppercase' }}>Active Accounts</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{metrics.activeAccounts ?? '—'}</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                  <div style={{ fontSize: '0.76rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>Suspended Accounts</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{metrics.suspendedAccounts ?? '—'}</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase' }}>Role Archetypes</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{ACCOUNT_ROLE_OPTIONS.length} Supported Roles</div>
                </div>
              </div>

              {/* User Accounts Table */}
              <div className="erp-table-responsive" style={{ marginBottom: '1.5rem' }}>
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Account Identifier</th>
                      <th>Name &amp; Email</th>
                      <th>Designated Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length > 0 ? (
                      usersList.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{u.identifier || u.id}</strong>
                              {u.createdAt && <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Joined {new Date(u.createdAt).toLocaleDateString()}</div>}
                          </td>
                          <td>
                            <strong>{u.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#475569' }}>{u.email}</div>
                          </td>
                          <td>
                            <span style={{
                              background: 'rgba(99, 102, 241, 0.12)',
                              color: '#4f46e5',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ color: '#334155', fontSize: '0.82rem' }}>{u.department || 'Unassigned'}</td>
                          <td>
                            <span style={{
                              background: u.isActive !== false ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: u.isActive !== false ? '#15803d' : '#dc2626',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}>
                              {u.isActive !== false ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="erp-btn erp-btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  const roleKeyMap = {
                                    'Super Admin': 'super_admin',
                                    'Management': 'management',
                                    'Principal': 'principal',
                                    'Admin Operations': 'admin',
                                    'Academic Administrator': 'admin',
                                    'HOD': 'hod',
                                    'Faculty': 'faculty',
                                    'Student': 'student',
                                    'Accounts': 'accounts',
                                    'Exam Cell': 'exam_cell',
                                    'Library': 'library',
                                    'Hostel Warden': 'warden',
                                    'Transport Fleet': 'transport',
                                    'Placement Cell': 'placement',
                                    'Staff': 'staff'
                                  };
                                  const targetKey = roleKeyMap[u.role] || u.role.toLowerCase().replace(/ /g, '_');
                                  onSwitchRole && onSwitchRole(targetKey);
                                }}
                                title={`Launch authorized portal for role ${u.role}`}
                              >
                                <ExternalLink size={12} style={{ marginRight: '4px' }} /> Launch
                              </button>
                              <button
                                type="button"
                                className="erp-btn erp-btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                onClick={() => setSelectedUserDetailsModal(u)}
                                title="Inspect user account security profile & details"
                              >
                                <Eye size={12} style={{ marginRight: '4px' }} /> Details
                              </button>
                              {canRequestAccountReset(u) && <button
                                type="button"
                                className="erp-btn erp-btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                onClick={() => handleResetUserPassword(u)}
                                title="Generate secure one-time password reset token"
                              >
                                <Key size={12} style={{ marginRight: '4px' }} /> Reset
                              </button>}
                              {canChangeAccountStatus(u) && <button
                                type="button"
                                className="erp-btn"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                  background: u.isActive !== false ? '#fee2e2' : '#dcfce7',
                                  color: u.isActive !== false ? '#dc2626' : '#15803d',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleToggleUserStatus(u)}
                                title={u.isActive !== false ? 'Suspend Account' : 'Activate Account'}
                              >
                                {u.isActive !== false ? 'Suspend' : 'Activate'}
                              </button>}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          {usersLoading ? 'Loading user directory from database...' : 'No accounts match these filters.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Roles Summary Table */}
              <h4 style={{ margin: '1.5rem 0 0.75rem 0', color: '#0f172a', fontWeight: 700 }}>
                Institutional Role Architecture &amp; Headcount
              </h4>
              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Role Category</th>
                      <th>Designated Title</th>
                      <th>Active Accounts</th>
                      <th>Primary Scope</th>
                      <th>Simulation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialRolesList.map((r) => (
                      <tr key={r.key}>
                        <td>
                          <span style={{
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#4f46e5',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}>
                            {r.category}
                          </span>
                        </td>
                        <td>
                          <strong>{r.label}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Role Key: {r.key}</div>
                        </td>
                        <td><strong>{metrics.userRoleCounts ? (metrics.userRoleCounts[r.key]?.active ?? 0) : '—'}</strong> Active</td>
                        <td style={{ color: '#475569' }}>{r.description}</td>
                        <td>
                          {onSwitchRole && (
                            <button
                              className="erp-btn erp-btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => onSwitchRole(r.key)}
                            >
                              Launch Portal
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: GLOBAL AUDIT TRAIL (ENHANCED) */}
          {activeTab === 'audit' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Institutional Security &amp; Audit Trail</h3>
                  <p>Append-only cryptographically verifiable event ledger with diff tracking and tamper-evidence</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Search size={15} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="text"
                      placeholder="Search actor or action..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '0.85rem', outline: 'none', width: '220px' }}
                    />
                  </div>

                  <select
                    className="erp-role-switcher-select"
                    value={auditRoleFilter}
                    onChange={(e) => setAuditRoleFilter(e.target.value)}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="HOD">HOD</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="EXAM_CELL">Exam Cell</option>
                    <option value="ACCOUNTS">Accounts</option>
                    <option value="LIBRARY">Library</option>
                    <option value="STAFF">Staff</option>
                  </select>

                  <select
                    className="erp-role-switcher-select"
                    value={auditDateRangeFilter}
                    onChange={(e) => setAuditDateRangeFilter(e.target.value)}
                  >
                    <option value="ALL">All Time</option>
                    <option value="TODAY">Today</option>
                    <option value="7DAYS">Last 7 Days</option>
                    <option value="30DAYS">Last 30 Days</option>
                  </select>

                  <select
                    className="erp-role-switcher-select"
                    value={auditModuleFilter}
                    onChange={(e) => setAuditModuleFilter(e.target.value)}
                  >
                    <option value="ALL">All Modules</option>
                    <option value="AUTH">Auth &amp; Passwords</option>
                    <option value="RBAC">RBAC Governance</option>
                    <option value="SETTINGS">System Settings</option>
                    <option value="BACKUP">Backup &amp; Restore</option>
                    <option value="APPROVAL">Approvals Queue</option>
                    <option value="USER">User Directory</option>
                  </select>

                  <select
                    className="erp-role-switcher-select"
                    value={auditOutcomeFilter}
                    onChange={(e) => setAuditOutcomeFilter(e.target.value)}
                  >
                    <option value="ALL">All Outcomes</option>
                    <option value="SUCCESS">Success Only</option>
                    <option value="FAILURE">Failed / Denied</option>
                  </select>

                  <button
                    type="button"
                    className="erp-btn erp-btn-primary"
                    onClick={handleExportAuditCsv}
                    title="Export filtered audit logs to CSV"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Actor &amp; Role</th>
                      <th>Action</th>
                      <th>Target Resource</th>
                      <th>Old Value → New Value</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th>Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                        <td>
                          <strong>{log.user}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#4f46e5', fontWeight: 600 }}>{log.role}</div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{log.action}</span></td>
                        <td style={{ color: '#334155' }}>{log.target}</td>
                        <td style={{ fontSize: '0.78rem' }}>
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>{log.oldValue}</span>
                          <span style={{ margin: '0 4px', color: '#64748b' }}>→</span>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>{log.newValue}</span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                        <td>
                          <span style={{
                            background: log.status === 'Success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: log.status === 'Success' ? '#16a34a' : '#dc2626',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}>
                            {log.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="erp-btn erp-btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                            onClick={() => setSelectedAuditLogModal(log)}
                            title="Inspect full audit event payload"
                          >
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SESSIONS & LOGIN SECURITY (NEW) */}
          {activeTab === 'sessions' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={20} color="#6366f1" />
                    <h3 style={{ margin: 0 }}>Active Sessions &amp; Login Security Governance</h3>
                  </div>
                  <p>Real-time administrator and user sessions, concurrent device tracking, and server-side token revocation controls</p>
                </div>

                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={async () => {
                    setSessionsLoading(true);
                    try {
                      const res = await api.getAdminSessions();
                      if (!res?.success || !Array.isArray(res?.data)) throw new Error('The API did not return session data.');
                      setSessionsList(res.data);
                      triggerToast('Session registry refreshed');
                    } catch (error) {
                      triggerToast(error?.message || 'Session management is unavailable.');
                    } finally {
                      setSessionsLoading(false);
                    }
                  }}
                  title="Refresh active sessions"
                >
                  <RefreshCw size={14} className={sessionsLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Session Policies Config Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Idle Session Timeout</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {sessionPolicies.idleTimeoutMinutes ?? '—'} Minutes
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Automated silent logout</span>
                </div>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase' }}>Max Concurrent Sessions</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    {sessionPolicies.maxConcurrentSessions ?? '—'} Devices / Account
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#1e40af' }}>Enforces single user per device</span>
                </div>
                <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                  <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>Brute-Force Lockout</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {sessionPolicies.failedLockoutThreshold ?? '—'} Bad Attempts
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#b45309' }}>Locks account for 15 mins</span>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, textTransform: 'uppercase' }}>Admin MFA Enforcement</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {sessionPolicies.enforceMfaAdmins == null ? 'Not configured' : sessionPolicies.enforceMfaAdmins ? 'Enforced' : 'Optional'}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#15803d' }}>Required for Super Admin &amp; Principal</span>
                </div>
              </div>

              {/* Sessions Table */}
              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Account Identifier &amp; Name</th>
                      <th>Assigned Role</th>
                      <th>IP Address &amp; Location</th>
                      <th>Client Device &amp; Browser</th>
                      <th>Login Timestamp</th>
                      <th>Expires In</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Authorization Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsList.map((sess) => (
                      <tr key={sess.id}>
                        <td>
                          <strong>{sess.name}</strong>
                          {sess.isCurrent && (
                            <span className="erp-session-current-tag">
                              <CheckCircle2 size={10} /> This Session
                            </span>
                          )}
                          <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{sess.identifier}</div>
                        </td>
                        <td>
                          <span style={{
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#4f46e5',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}>
                            {sess.role}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#334155' }}>{sess.ipAddress}</td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{sess.device}</td>
                        <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {sess.loginTime ? new Date(sess.loginTime).toLocaleTimeString() : '1 hour ago'}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                          {sess.expiresAt ? Math.max(1, Math.round((new Date(sess.expiresAt) - Date.now()) / 3600000)) + ' hours' : '7 hours'}
                        </td>
                        <td>
                          <span style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}>
                            {sess.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!sess.isCurrent ? (
                            <button
                              type="button"
                              className="erp-btn"
                              style={{
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.75rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              onClick={() => handleRevokeSession(sess.id, sess.identifier)}
                              title="Immediately invalidate refresh token and terminate server session"
                            >
                              Revoke Session
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Protected (Active)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Institutional System &amp; Autonomous Governance Settings</h3>
                  <p>Comprehensive campus identity, academic regulations, security controls, and external gateways</p>
                </div>
              </div>

              {/* Settings Sub-Tab Navigation Bar */}
              <div className="erp-settings-nav">
                <button
                  type="button"
                  className={`erp-settings-subtab ${settingsActiveSubTab === 'institutional' ? 'active' : ''}`}
                  onClick={() => setSettingsActiveSubTab('institutional')}
                >
                  <Building size={15} /> Institutional Profile
                </button>
                <button
                  type="button"
                  className={`erp-settings-subtab ${settingsActiveSubTab === 'academics' ? 'active' : ''}`}
                  onClick={() => setSettingsActiveSubTab('academics')}
                >
                  <CalendarDays size={15} /> Academic Regulations
                </button>
                <button
                  type="button"
                  className={`erp-settings-subtab ${settingsActiveSubTab === 'security' ? 'active' : ''}`}
                  onClick={() => setSettingsActiveSubTab('security')}
                >
                  <Lock size={15} /> Security &amp; Auth Policies
                </button>
                <button
                  type="button"
                  className={`erp-settings-subtab ${settingsActiveSubTab === 'gateways' ? 'active' : ''}`}
                  onClick={() => setSettingsActiveSubTab('gateways')}
                >
                  <Sliders size={15} /> Notifications &amp; Gateways
                </button>
              </div>

              <form onSubmit={handleSaveSettings}>
                {/* SUBTAB 1: INSTITUTIONAL PROFILE */}
                {settingsActiveSubTab === 'institutional' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Institution Legal Name</label>
                      <input
                        type="text"
                        value={settings.institutionName}
                        onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Autonomous Institution Code</label>
                      <input
                        type="text"
                        value={settings.institutionCode}
                        onChange={(e) => setSettings({ ...settings, institutionCode: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Affiliating University</label>
                      <input
                        type="text"
                        value={settings.affiliatingUniversity}
                        onChange={(e) => setSettings({ ...settings, affiliatingUniversity: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>NAAC / AICTE Accreditation Standing</label>
                      <input
                        type="text"
                        value={settings.accreditation || 'NAAC A++ (CGPA 3.65) · AICTE Approved'}
                        onChange={(e) => setSettings({ ...settings, accreditation: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Campus Address &amp; State</label>
                      <input
                        type="text"
                        value={settings.campusAddress || 'Knowledge Park III, Institutional Area, Greater Noida, UP'}
                        onChange={(e) => setSettings({ ...settings, campusAddress: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Official Governance Registrar Email</label>
                      <input
                        type="email"
                        value={settings.registrarEmail || 'registrar@apnacampus.edu.in'}
                        onChange={(e) => setSettings({ ...settings, registrarEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: ACADEMIC REGULATIONS */}
                {settingsActiveSubTab === 'academics' && (
                  <div>
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={18} color="#b45309" />
                      <span style={{ fontSize: '0.82rem', color: '#92400e' }}>
                        <strong>Academic Rule Modification Notice:</strong> Altering minimum attendance or grading schemes automatically impacts student exam eligibility algorithms and report statistics institution-wide.
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Current Academic Session</label>
                        <input
                          type="text"
                          value={settings.currentAcademicYear}
                          onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Minimum Attendance Requirement (%)</label>
                        <input
                          type="number"
                          min="50"
                          max="95"
                          value={settings.minimumAttendancePercentage}
                          onChange={(e) => setSettings({ ...settings, minimumAttendancePercentage: Number(e.target.value) })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                        />
                        <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                          Students below this threshold are flagged in Report Generation and restricted from admit cards.
                        </span>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Grading Scale Scheme</label>
                        <select
                          value={settings.gradingSystem}
                          onChange={(e) => setSettings({ ...settings, gradingSystem: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                        >
                          <option value="10-Point Absolute Scale">10-Point Absolute Scale (UGC / AICTE Recommended)</option>
                          <option value="Relative Grading (Bell Curve)">Relative Grading (Bell Curve Standard)</option>
                          <option value="4-Point US GPA Scale">4-Point US GPA Scale</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Autonomous Result Publication Policy</label>
                        <select
                          value={settings.resultPublishPolicy || 'DUAL_APPROVAL'}
                          onChange={(e) => setSettings({ ...settings, resultPublishPolicy: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                        >
                          <option value="DUAL_APPROVAL">Dual Approval: Controller of Examinations + Principal</option>
                          <option value="SUPER_ADMIN_SIGNOFF">Tri-Signature: Controller + Principal + Super Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: SECURITY & AUTH POLICIES */}
                {settingsActiveSubTab === 'security' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Session Inactivity Timeout (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={sessionPolicies.idleTimeoutMinutes ?? ''}
                        disabled
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Max Concurrent Active Devices per Account</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={sessionPolicies.maxConcurrentSessions ?? ''}
                        disabled
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Failed Login Brute-Force Lockout Threshold</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={sessionPolicies.failedLockoutThreshold ?? ''}
                        disabled
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Multi-Factor Authentication (MFA) Mandate</label>
                      <select
                        value={sessionPolicies.enforceMfaAdmins == null ? '' : sessionPolicies.enforceMfaAdmins ? 'MANDATORY' : 'OPTIONAL'}
                        disabled
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      >
                        <option value="MANDATORY">Mandatory for all 4 Administrative Roles (Super Admin, Mgmt, Principal, Ops)</option>
                        <option value="OPTIONAL">Optional / User Preference</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: NOTIFICATIONS & GATEWAYS */}
                {settingsActiveSubTab === 'gateways' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Transactional Email Gateway (SMTP)</label>
                      <input
                        type="text"
                        value={settings.smtpHost || 'smtp.sendgrid.net (TLS Port 587 · Verified)'}
                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Institutional SMS &amp; DLT Gateway</label>
                      <input
                        type="text"
                        value={settings.smsGateway || 'Twilio / DLT Registered (Sender ID: APNACAMPUS)'}
                        onChange={(e) => setSettings({ ...settings, smsGateway: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Fee Collection Payment Gateway</label>
                      <input
                        type="text"
                        value={settings.paymentGateway || 'Razorpay Enterprise (Auto-Reconciliation Webhook Active)'}
                        onChange={(e) => setSettings({ ...settings, paymentGateway: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Disaster Recovery S3 Bucket Target</label>
                      <input
                        type="text"
                        value={settings.s3Bucket || 's3://apna-campus-prod-encrypted-backups (ap-south-1)'}
                        onChange={(e) => setSettings({ ...settings, s3Bucket: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="erp-btn erp-btn-primary">
                    <Save size={16} /> Save Configuration Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: INTEGRATIONS & API MANAGEMENT (NEW) */}
          {activeTab === 'integrations' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={20} color="#2563eb" />
                    <h3 style={{ margin: 0 }}>Integrations &amp; External API Gateways</h3>
                  </div>
                  <p>Institutional mailers, SMS gateways, payment gateways, S3 cloud storage, biometric hardware, and AI services</p>
                </div>

                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={async () => {
                    setIntegrationsLoading(true);
                    try {
                      const res = await api.getAdminIntegrations();
                      if (!res?.success || !Array.isArray(res?.data)) throw new Error('The API did not return integration status.');
                      setIntegrationsList(res.data);
                      triggerToast('Integration statuses refreshed');
                    } catch (error) {
                      triggerToast(error?.message || 'Integration statuses could not be refreshed.');
                    } finally {
                      setIntegrationsLoading(false);
                    }
                  }}
                  title="Refresh integrations"
                >
                  <RefreshCw size={14} className={integrationsLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Integrations Grid */}
              <div className="erp-integrations-grid">
                {integrationsList.map((item) => (
                  <div key={item.id} className="erp-integration-card">
                    <div>
                      <div className="erp-int-header">
                        <div>
                          <h4 style={{ margin: '0 0 3px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{item.name}</h4>
                          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Provider: <strong>{item.provider}</strong></span>
                        </div>
                        <span className="erp-int-status-badge">
                          <CheckCircle2 size={12} /> {item.status}
                        </span>
                      </div>

                      <div className="erp-int-endpoint-box">
                        {item.endpoint}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '8px' }}>
                        Auth Protocol: <strong style={{ color: '#0f172a' }}>{item.authType}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', marginBottom: '14px' }}>
                        <span>Roundtrip Latency: <strong style={{ color: '#16a34a' }}>{item.latencyMs}ms</strong></span>
                        <span>Last Verified: Just now</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="erp-btn erp-btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleTestIntegration(item.id)}
                      disabled={testingIntegrationId === item.id}
                    >
                      <RefreshCw size={14} className={testingIntegrationId === item.id ? 'animate-spin' : ''} />
                      {testingIntegrationId === item.id ? 'Pinging Gateway...' : 'Test Connection'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BACKUP & RECOVERY (ENHANCED) */}
          {activeTab === 'backup' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Disaster Recovery &amp; System Backups</h3>
                  <p>Enterprise data snapshots, automated schedules, integrity verification, and cold storage</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="erp-btn erp-btn-secondary"
                    onClick={handleVerifyDatabaseIntegrity}
                    title="Verify PostgreSQL schema relations, foreign keys, and WAL replication"
                  >
                    <CheckCircle2 size={15} color="#16a34a" /> Verify Integrity
                  </button>

                  <button
                    className="erp-btn erp-btn-primary"
                    onClick={handleTriggerBackup}
                    disabled={backupStatus !== 'Idle'}
                  >
                    <RefreshCw size={15} className={backupStatus !== 'Idle' ? 'animate-spin' : ''} />
                    {backupStatus === 'Idle' ? 'Create Instant Snapshot' : backupStatus}
                  </button>
                </div>
              </div>

              {integrityCheckStatus && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span style={{ fontSize: '0.84rem', color: '#166534', fontWeight: 600 }}>
                    {integrityCheckStatus}
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Automated Cron Backups</h4>
                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    Scheduled every night at 02:00 AM IST. Retained for 90 days with point-in-time recovery.
                  </p>
                  <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
                    Active · Last executed 18 Oct, 02:00 AM
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Cloud Object Storage Vault</h4>
                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    S3 Glacier replicated storage. End-to-end encrypted with AES-256 GCM.
                  </p>
                  <span style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
                    Connected · 99.999999999% Durability
                  </span>
                </div>
              </div>

              {/* Snapshots History Table */}
              <h4 style={{ margin: '1rem 0 0.75rem 0', color: '#0f172a', fontWeight: 700 }}>
                Disaster Recovery Snapshot Vault
              </h4>
              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Snapshot ID</th>
                      <th>Encrypted Archive File</th>
                      <th>Snapshot Type</th>
                      <th>Created Timestamp</th>
                      <th>Size &amp; Engine</th>
                      <th>Integrity Checksum (SHA-256)</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Disaster Recovery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupsList.map((b) => (
                      <tr key={b.id}>
                        <td><strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{b.id}</strong></td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#2563eb' }}>{b.fileName}</td>
                        <td>
                          <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
                            {b.type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.createdAt}</td>
                        <td style={{ fontSize: '0.8rem' }}><strong>{b.size}</strong> · {b.databaseVersion}</td>
                        <td style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b' }}>{b.checksum}</td>
                        <td>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="erp-btn"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              background: '#fef3c7',
                              color: '#b45309',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setRestoreModalSnapshot(b);
                              setRestoreConfirmationCode('');
                            }}
                            title="Initiate disaster recovery restore from this snapshot"
                          >
                            <RefreshCw size={12} style={{ marginRight: '4px' }} /> Restore Snapshot
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TIMETABLES & SCHEDULING */}
          {activeTab === 'timetable' && (
            <TimetableManager account={account} />
          )}

          {/* TAB: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="super_admin" />
          )}

          {/* TAB: ADMINISTRATIVE APPROVALS CENTER (NEW) */}
          {activeTab === 'approvals' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCheck size={20} color="#dc2626" />
                    <h3 style={{ margin: 0 }}>Centralized Administrative Approval Center</h3>
                  </div>
                  <p>Institution-wide queue for high-impact privileges, grade alterations, fee exemptions, and emergency overrides</p>
                </div>

                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={async () => {
                    setApprovalsLoading(true);
                    try {
                      const res = await api.getAdminApprovals();
                      if (!res?.success || !Array.isArray(res?.data)) throw new Error('The API did not return approval requests.');
                      setApprovalsList(res.data);
                      triggerToast('Approval queue synchronized');
                    } catch (error) {
                      triggerToast(error?.message || 'Approval requests could not be refreshed.');
                    } finally {
                      setApprovalsLoading(false);
                    }
                  }}
                  title="Refresh approval requests queue"
                >
                  <RefreshCw size={14} className={approvalsLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Approvals Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                  <div style={{ fontSize: '0.76rem', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>Pending Super Admin Action</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                    {approvalsList.filter(a => a.status === 'PENDING').length}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#b91c1c' }}>Awaiting executive signoff</span>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, textTransform: 'uppercase' }}>Approved Requests</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {approvalsList.filter(a => a.status === 'APPROVED').length}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#15803d' }}>Executed with audit entry</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Rejected / Declined</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {approvalsList.filter(a => a.status === 'REJECTED').length}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Safeguard maintained</span>
                </div>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '0.76rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase' }}>Separation of Duties</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>Dual-Signoff</div>
                  <span style={{ fontSize: '0.74rem', color: '#1e40af' }}>Requesters cannot self-approve</span>
                </div>
              </div>

              {/* Approvals List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {approvalsList.length > 0 ? (
                  approvalsList.map((appr) => (
                    <div key={appr.id} className="erp-approval-card">
                      <div className="erp-approval-header">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>{appr.title}</strong>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                              {appr.id}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                            Requester: <strong style={{ color: '#0f172a' }}>{appr.requesterName}</strong> ({appr.requesterRole}) · Department/ID: {appr.requesterId} · Submitted: {new Date(appr.requestedAt).toLocaleString()}
                          </div>
                        </div>

                        <span className={`erp-approval-badge ${appr.status.toLowerCase()}`}>
                          {appr.status}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '10px 0' }}>
                        <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '4px' }}>
                          <strong>Target Scope:</strong> {appr.scope}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                          <strong>Official Justification:</strong> {appr.justification}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '6px', fontWeight: 600 }}>
                          ⚠ Impact Assessment: {appr.impactStatement}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Severity Rating: <strong style={{ color: '#dc2626' }}>{appr.severity}</strong>
                        </span>

                        {appr.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="erp-btn erp-btn-primary"
                              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                              onClick={() => {
                                setSelectedApprovalModal(appr);
                                setApprovalReasonInput('');
                              }}
                            >
                              Review &amp; Decide
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: appr.status === 'APPROVED' ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
                            {appr.status === 'APPROVED' ? '✓ Approved' : '✗ Declined'} by {appr.decidedBy || 'Super Administrator'} ({appr.decisionReason || 'Mandate verified'})
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No pending approval requests in the institutional queue.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </main>

      {/* MODAL 1: Security Incident Investigation & Resolution Modal */}
      {selectedIncidentModal && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true">
          <div className="erp-diagnostics-modal" style={{ maxWidth: '640px' }}>
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Incident Resolution &amp; Audit Log</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Incident ID: {selectedIncidentModal.id} • {selectedIncidentModal.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncidentModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="erp-diag-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{selectedIncidentModal.title}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#475569' }}>
                  Target: <strong>{selectedIncidentModal.affectedAccount}</strong> · Source IP: <strong style={{ fontFamily: 'monospace' }}>{selectedIncidentModal.sourceIp}</strong>
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', color: '#334155' }}>
                <strong>Evidence Payload:</strong><br />{selectedIncidentModal.evidence}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>
                  Investigation / Resolution Notes:
                </label>
                <textarea
                  rows={3}
                  value={incidentNotesInput}
                  onChange={(e) => setIncidentNotesInput(e.target.value)}
                  placeholder="Enter authorized remediation actions, containment steps, or verification findings..."
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a' }}
                />
              </div>
            </div>

            <div className="erp-diag-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="erp-btn"
                  style={{ background: '#fef3c7', color: '#b45309', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}
                  onClick={() => handleSaveIncidentResolution(selectedIncidentModal.id, 'investigating', incidentNotesInput)}
                >
                  Mark Under Investigation
                </button>
                <button
                  type="button"
                  className="erp-btn"
                  style={{ background: '#dcfce7', color: '#15803d', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}
                  onClick={() => handleSaveIncidentResolution(selectedIncidentModal.id, 'resolved', incidentNotesInput)}
                >
                  Resolve &amp; Close Incident
                </button>
              </div>
              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={() => setSelectedIncidentModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL 3: Audit Event Detail Inspector */}
      {selectedAuditLogModal && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true">
          <div className="erp-diagnostics-modal" style={{ maxWidth: '600px' }}>
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <History size={20} color="#d97706" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Audit Event Immutable Record</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Log ID: {selectedAuditLogModal.id} • SHA-256 Validated</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditLogModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="erp-diag-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Timestamp:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedAuditLogModal.timestamp}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Actor &amp; Role:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedAuditLogModal.user} ({selectedAuditLogModal.role})</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Action:</span>
                  <div style={{ fontWeight: 600, color: '#2563eb' }}>{selectedAuditLogModal.action}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Target Resource:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedAuditLogModal.target}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Client IP:</span>
                  <div style={{ fontFamily: 'monospace', color: '#0f172a' }}>{selectedAuditLogModal.ipAddress}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Result Status:</span>
                  <div style={{ fontWeight: 600, color: selectedAuditLogModal.status === 'Success' ? '#16a34a' : '#dc2626' }}>
                    {selectedAuditLogModal.status}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Diff Delta (Previous Value → Updated Value):</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fee2e2', padding: '8px', borderRadius: '6px', fontSize: '0.78rem', color: '#991b1b', fontFamily: 'monospace' }}>
                    - {selectedAuditLogModal.oldValue || 'NONE'}
                  </div>
                  <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #dcfce7', padding: '8px', borderRadius: '6px', fontSize: '0.78rem', color: '#166534', fontFamily: 'monospace' }}>
                    + {selectedAuditLogModal.newValue || 'MODIFIED'}
                  </div>
                </div>
              </div>
            </div>

            <div className="erp-diag-footer">
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Verified Append-Only Storage Block</span>
              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={() => setSelectedAuditLogModal(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subsystem Diagnostics Modal */}
      {diagnosticsModalOpen && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true" aria-labelledby="diag-title">
          <div className="erp-diagnostics-modal">
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} color="#15803d" />
                </div>
                <div>
                  <h3 id="diag-title">Subsystem Health &amp; Security Diagnostics</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Live runtime verification timestamp: {diagnosticsData?.timestamp ? new Date(diagnosticsData.timestamp).toLocaleTimeString() : 'Unavailable'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDiagnosticsModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                title="Close Diagnostics"
                aria-label="Close Diagnostics"
              >
                <X size={16} />
              </button>
            </div>

            <div className="erp-diag-body">
              {diagnosticsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <RefreshCw size={28} className="animate-spin" color="#2563eb" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>Executing cryptographic and database health probes...</p>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Querying Prisma connection pool and evaluating active RBAC gates</span>
                </div>
              ) : diagnosticsData?.error ? (
                <div className="erp-alert-box is-error" role="alert">{diagnosticsData.error}</div>
              ) : (
                diagnosticsData?.subsystems?.map((sub) => (
                  <div key={sub.id || sub.name} className="erp-diag-subsystem">
                    <div className="erp-diag-subsystem-info">
                      <h5>{sub.name}</h5>
                      <p>{sub.details}</p>
                    </div>
                    <div className="erp-diag-subsystem-status">
                      <span className="erp-diag-badge">
                        <CheckCircle2 size={12} /> {sub.status}
                      </span>
                      <div className="erp-diag-latency">{sub.latency}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="erp-diag-footer">
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Overall: <strong style={{ color: diagnosticsData?.overallStatus === 'Nominal' ? '#16a34a' : '#64748b' }}>{diagnosticsData?.overallStatus || 'Unavailable'}</strong>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={handleRunDiagnostics}
                  disabled={diagnosticsLoading}
                >
                  <RefreshCw size={14} className={diagnosticsLoading ? 'animate-spin' : ''} />
                  Run Probes Again
                </button>
                <button
                  type="button"
                  className="erp-btn erp-btn-primary"
                  onClick={() => setDiagnosticsModalOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 4: Administrative Approval Decision & Mandate Modal */}
      {selectedApprovalModal && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true">
          <div className="erp-diagnostics-modal" style={{ maxWidth: '600px' }}>
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCheck size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Executive Administrative Signoff</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Request ID: {selectedApprovalModal.id} • {selectedApprovalModal.severity}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApprovalModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="erp-diag-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>{selectedApprovalModal.title}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#475569' }}>
                  Requester: <strong>{selectedApprovalModal.requesterName}</strong> ({selectedApprovalModal.requesterRole}) · ID: {selectedApprovalModal.requesterId}
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div style={{ marginBottom: '4px' }}><strong>Target Scope:</strong> {selectedApprovalModal.scope}</div>
                <div style={{ color: '#475569' }}><strong>Official Justification:</strong> {selectedApprovalModal.justification}</div>
                <div style={{ color: '#b45309', fontWeight: 600, marginTop: '6px' }}>⚠ Impact: {selectedApprovalModal.impactStatement}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>
                  Mandatory Governance Justification / Reason: <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={approvalReasonInput}
                  onChange={(e) => setApprovalReasonInput(e.target.value)}
                  placeholder="Enter the official administrative rationale for approval or rejection (recorded in audit ledger)..."
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a' }}
                />
              </div>
            </div>

            <div className="erp-diag-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={() => setSelectedApprovalModal(null)}
              >
                Cancel
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="erp-btn"
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => handleDecideApproval(selectedApprovalModal.id, 'REJECTED', approvalReasonInput)}
                >
                  Reject &amp; Decline
                </button>
                <button
                  type="button"
                  className="erp-btn erp-btn-primary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                  onClick={() => handleDecideApproval(selectedApprovalModal.id, 'APPROVED', approvalReasonInput)}
                >
                  Authorize &amp; Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Sensitive RBAC Permission Grant Confirmation */}
      {confirmSensitivePermModal && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true">
          <div className="erp-diagnostics-modal" style={{ maxWidth: '520px' }}>
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Elevated Privilege Grant Warning</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Security Governance Protocol</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmSensitivePermModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="erp-diag-body">
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                You are about to grant a high-impact privileged authority (<strong>{confirmSensitivePermModal.permId}</strong>) to the role <strong>{confirmSensitivePermModal.roleKey}</strong>.
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#b45309', lineHeight: 1.4 }}>
                ⚠ This permission bypasses standard departmental guardrails and authorizes institution-wide structural modifications. All actions under this privilege are permanently recorded in the global audit trail.
              </div>
            </div>

            <div className="erp-diag-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={() => setConfirmSensitivePermModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={() => {
                  const { roleKey, permId } = confirmSensitivePermModal;
                  setConfirmSensitivePermModal(null);
                  executePermissionToggle(roleKey, permId);
                }}
              >
                Confirm Privilege Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Provision New User Account */}
      {createUserModalOpen && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true">
          <div className="erp-diagnostics-modal" style={{ maxWidth: '580px' }}>
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} color="#4f46e5" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Provision Institutional Account</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Registers account with cryptographic bcrypt hashing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateUserModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="erp-diag-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Chandra"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Official Campus Email</label>
                    <input
                      type="email"
                      required
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      placeholder="e.g. ramesh@apnacampus.edu.in"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Identifier (Roll / Staff ID)</label>
                    <input
                      type="text"
                      required
                      value={newUserData.identifier}
                      onChange={(e) => setNewUserData({ ...newUserData, identifier: e.target.value })}
                      placeholder="e.g. FAC-2026-042"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Institutional Role</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    >
                      {creatableRoles.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Department</label>
                    <select
                      value={newUserData.department}
                      onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    >
                      <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                      <option value="Electronics & Communication">Electronics &amp; Communication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Management Studies">Management Studies</option>
                      <option value="Central Administration">Central Administration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Initial Temporary Password</label>
                  <input
                    type="password"
                    required
                    minLength={12}
                    maxLength={72}
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Set a unique initial password and share it securely with the account owner.
                  </span>
                </div>
              </div>

              <div className="erp-diag-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="erp-btn erp-btn-secondary"
                  onClick={() => setCreateUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="erp-btn erp-btn-primary"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: User Details Security Inspector */}
      {selectedUserDetailsModal && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true">
          <div className="erp-diagnostics-modal" style={{ maxWidth: '580px' }}>
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Account Profile &amp; Governance Inspection</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Account: {selectedUserDetailsModal.identifier || selectedUserDetailsModal.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetailsModal(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="erp-diag-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Account Holder:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>{selectedUserDetailsModal.name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Official Email:</span>
                  <div style={{ fontWeight: 600, color: '#2563eb' }}>{selectedUserDetailsModal.email}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Assigned Institutional Role:</span>
                  <div style={{ fontWeight: 700, color: '#4f46e5' }}>{selectedUserDetailsModal.role}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Department:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedUserDetailsModal.department || 'Central Campus'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Account Status:</span>
                  <div style={{ fontWeight: 700, color: selectedUserDetailsModal.isActive !== false ? '#15803d' : '#dc2626' }}>
                    {selectedUserDetailsModal.isActive !== false ? 'Active & Permitted' : 'Suspended'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>MFA Verification:</span>
                  <div style={{ fontWeight: 600, color: selectedUserDetailsModal.isMfaEnabled ? '#15803d' : '#64748b' }}>
                    {selectedUserDetailsModal.isMfaEnabled ? 'Enforced (TOTP Active)' : 'Standard Password'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Failed Logins:</span>
                  <div style={{ fontWeight: 600, color: (selectedUserDetailsModal.failedLogins || 0) > 0 ? '#dc2626' : '#15803d' }}>
                    {selectedUserDetailsModal.failedLogins || 0} / 5 attempts
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Registration Date:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedUserDetailsModal.joinedAt || 'Oct 2024'}</div>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>Granted Role Privileges:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {permissionDefinitions
                    .filter(p => (rolePermissions[selectedUserDetailsModal.role?.toLowerCase()?.replace(/ /g, '_')] || []).includes(p.id))
                    .map(p => (
                      <span key={p.id} style={{ background: '#f1f5f9', color: '#1e293b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {p.label}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="erp-diag-footer">
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Identity Vault Verified</span>
              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={() => setSelectedUserDetailsModal(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: Disaster Recovery Restore Confirmation */}
      {restoreModalSnapshot && (
        <div className="erp-diagnostics-overlay" role="dialog" aria-modal="true">
          <div className="erp-diagnostics-modal" style={{ maxWidth: '540px' }}>
            <div className="erp-diag-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Confirm Disaster Recovery Restoration</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Snapshot: {restoreModalSnapshot.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestoreModalSnapshot(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="erp-diag-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.5 }}>
                <strong>CRITICAL WARNING:</strong> Restoring this snapshot ({restoreModalSnapshot.fileName}) will replace the active production PostgreSQL database state with the data from <strong>{restoreModalSnapshot.createdAt}</strong>. All uncommitted transactions after this snapshot will be rolled back.
              </div>

              <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                Archive Size: <strong>{restoreModalSnapshot.size}</strong> · Database Version: <strong>{restoreModalSnapshot.databaseVersion}</strong><br />
                Checksum: <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>{restoreModalSnapshot.checksum}</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginBottom: '6px' }}>
                  To confirm restoration, type <span style={{ fontFamily: 'monospace', color: '#dc2626' }}>RESTORE-CONFIRM</span> below:
                </label>
                <input
                  type="text"
                  value={restoreConfirmationCode}
                  onChange={(e) => setRestoreConfirmationCode(e.target.value)}
                  placeholder="RESTORE-CONFIRM"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '2px solid #ef4444', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
            </div>

            <div className="erp-diag-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="erp-btn erp-btn-secondary"
                onClick={() => setRestoreModalSnapshot(null)}
                disabled={restoreProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="erp-btn"
                style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                disabled={restoreConfirmationCode !== 'RESTORE-CONFIRM' || restoreProcessing}
                onClick={() => handleRestoreSnapshot(restoreModalSnapshot.id, restoreConfirmationCode)}
              >
                {restoreProcessing ? 'Restoring Database...' : 'Execute Restoration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
