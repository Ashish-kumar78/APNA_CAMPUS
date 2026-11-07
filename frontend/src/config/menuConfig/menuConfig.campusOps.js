import {
  Home,
  Users,
  ClipboardList,
  CheckSquare,
  Calendar,
  Wrench,
  Settings,
  Building2,
  Boxes,
  ShieldCheck,
  Sparkles,
  Utensils,
  ShieldAlert,
  MessageSquare,
  Bell,
  FileText
} from 'lucide-react';

/**
 * Campus Operations Role Menu Configuration
 */
export const getCampusOpsMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ]
  },
  {
    title: 'WORKFORCE',
    items: [
      { id: 'staff-directory', label: 'Staff Directory', icon: Users },
      { id: 'tasks-work-orders', label: 'Tasks & Work Orders', icon: ClipboardList },
      { id: 'attendance-roster', label: 'Attendance Roster', icon: CheckSquare },
      { id: 'leave-shift-requests', label: 'Leave & Shift Requests', icon: Calendar },
    ]
  },
  {
    title: 'MAINTENANCE',
    items: [
      { id: 'maintenance-requests', label: 'Maintenance Requests', icon: Wrench },
      { id: 'preventive-maintenance', label: 'Preventive Maintenance', icon: Settings },
      { id: 'campus-facilities', label: 'Campus Facilities', icon: Building2 },
      { id: 'inventory-spare-parts', label: 'Inventory & Spare Parts', icon: Boxes },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'security-gate', label: 'Security & Gate', icon: ShieldCheck },
      { id: 'housekeeping-cleaning', label: 'Housekeeping', icon: Sparkles },
      { id: 'canteen-operations', label: 'Canteen Operations', icon: Utensils },
      { id: 'safety-incidents', label: 'Safety & Incidents', icon: ShieldAlert },
      { id: 'complaints-grievances', label: 'Complaints & Grievances', icon: MessageSquare },
    ]
  },
  {
    title: 'REPORTS',
    items: [
      { id: 'notifications-announcements', label: 'Notifications', icon: Bell },
      { id: 'reports-analytics', label: 'Reports & Analytics', icon: FileText },
      { id: 'settings-permissions', label: 'Settings & Permissions', icon: Settings },
    ]
  }
];

export default getCampusOpsMenuConfig;

