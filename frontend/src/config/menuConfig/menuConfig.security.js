import {
  Home,
  ShieldCheck,
  QrCode,
  FileCheck2,
  Clock,
  Users,
  History,
  AlertTriangle,
  FileText,
  Shield,
  BarChart3,
} from 'lucide-react';

/**
 * Campus Security Guard Role Menu Configuration
 * Standardized across the Apna Campus ERP design system.
 */
export const getSecurityMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Security Guard Dashboard', icon: Home },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'scanner', label: 'QR Scanner', icon: QrCode },
      {
        id: 'passes',
        label: 'Approved Gate Passes',
        icon: FileCheck2,
        badge: context.passesBadge || undefined,
      },
      {
        id: 'overdue',
        label: 'Overdue Returns',
        icon: Clock,
        badge: context.overdueBadge || undefined,
      },
      {
        id: 'visitors',
        label: 'Visitor Management',
        icon: Users,
        badge: context.visitorsBadge || undefined,
      },
    ],
  },
  {
    title: 'MONITORING & LOGS',
    items: [
      { id: 'history', label: 'Movement History', icon: History },
      { id: 'reports', label: 'Daily Security Reports', icon: BarChart3 },
      { id: 'audit', label: 'Audit Trail & Corrections', icon: FileCheck2 },
      {
        id: 'alerts',
        label: 'Security Alerts',
        icon: AlertTriangle,
        badge: context.alertsBadge || undefined,
      },
      { id: 'shift-notes', label: 'Shift Handover Notes', icon: FileText },
    ],
  },
];

export default getSecurityMenuConfig;

