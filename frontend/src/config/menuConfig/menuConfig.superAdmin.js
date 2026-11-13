import {
  Sparkles,
  Server,
  ShieldAlert,
  Terminal,
  Radio,
  Users,
  KeyRound,
  Bus,
  Utensils,
  Building,
  History,
  FileCheck,
  Plug,
  Database,
  FileSpreadsheet,
  Settings,
  FlaskConical
} from 'lucide-react';

/**
 * Super Admin Role Menu Configuration
 */
export const getSuperAdminMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'overview', label: 'Dashboard', icon: Sparkles },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'health', label: 'System Health', icon: Server },
      { id: 'security-incidents', label: 'Security Incidents', icon: ShieldAlert },
      { id: 'system-logs', label: 'System Logs', icon: Terminal },
      { id: 'sessions', label: 'Active Sessions', icon: Radio },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'rbac', label: 'RBAC & Permissions', icon: KeyRound },
      { id: 'laboratory-management', label: 'Laboratory Management', icon: FlaskConical },
      { id: 'transport-management', label: 'Transport Management', icon: Bus },
      { id: 'canteen-management', label: 'Canteen & Mess Management', icon: Utensils },
      { id: 'hostel-management', label: 'Hostel & Warden Management', icon: Building },
      { id: 'audit', label: 'Audit Trail', icon: History },
      { id: 'approvals', label: 'Pending Approvals', icon: FileCheck },
    ]
  },
  {
    title: 'INFRASTRUCTURE',
    items: [
      { id: 'integrations', label: 'Integrations', icon: Plug },
      { id: 'backup', label: 'Backup & Recovery', icon: Database },
      { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
      { id: 'settings', label: 'System Settings', icon: Settings },
    ]
  }
];

export default getSuperAdminMenuConfig;

