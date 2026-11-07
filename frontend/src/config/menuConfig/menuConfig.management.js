import {
  Home,
  Building,
  DollarSign,
  Layers,
  Briefcase,
  FileCheck,
  Shield,
  AlertTriangle,
  ClipboardList,
  FileSpreadsheet
} from 'lucide-react';

/**
 * Management / Board of Trustees Role Menu Configuration
 */
export const getManagementMenuConfig = (context = {}) => {
  const pendingApprovalsCount = context.pendingApprovalsCount || undefined;
  const criticalExceptionsCount = context.criticalExceptionsCount || undefined;

  return [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'executive', label: 'Dashboard', icon: Home },
      ]
    },
    {
      title: 'STRATEGIC OVERSIGHT',
      items: [
        { id: 'departments', label: 'Department Analytics', icon: Building },
        { id: 'financials', label: 'Fee & Finance', icon: DollarSign },
        { id: 'budget', label: 'Institutional Budget', icon: Layers },
        { id: 'placements', label: 'Placement & Careers', icon: Briefcase },
      ]
    },
    {
      title: 'GOVERNANCE & APPROVALS',
      items: [
        { id: 'approvals', label: 'Strategic Approvals', icon: FileCheck, badge: pendingApprovalsCount },
        { id: 'governance', label: 'Governance & Notices', icon: Shield },
        { id: 'exceptions', label: 'Risk & Exceptions', icon: AlertTriangle, badge: criticalExceptionsCount, badgeType: 'urgent' },
        { id: 'audit-trail', label: 'Audit Trail', icon: ClipboardList },
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
      ]
    }
  ];
};

export default getManagementMenuConfig;

