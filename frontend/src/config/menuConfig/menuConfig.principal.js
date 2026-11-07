import {
  Home,
  Award,
  CalendarDays,
  GraduationCap,
  FileText,
  TrendingUp,
  Users,
  Wrench,
  CalendarCheck,
  Megaphone,
  FileSpreadsheet,
  MessageSquare,
  User
} from 'lucide-react';

/**
 * Principal Role Menu Configuration
 */
export const getPrincipalMenuConfig = (context = {}) => {
  const pendingLeavesCount = context.pendingLeavesCount || undefined;
  const pendingNoticesCount = context.pendingNoticesCount || undefined;

  return [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
      ]
    },
    {
      title: 'EXECUTIVE GOVERNANCE',
      items: [
        { id: 'academic_health', label: 'Academic Performance', icon: Award },
        { id: 'timetable', label: 'Timetables & Approval', icon: CalendarDays },
      ]
    },
    {
      title: 'ACADEMIC & DEPARTMENT MANAGEMENT',
      items: [
        { id: 'departments', label: 'Department & HOD Management', icon: GraduationCap },
        { id: 'examinations', label: 'Examination & Results Oversight', icon: FileText },
      ]
    },
    {
      title: 'FINANCE & INSTITUTIONAL RESOURCES',
      items: [
        { id: 'finance', label: 'Finance & Budget Oversight', icon: TrendingUp },
        { id: 'faculty_staff', label: 'Faculty & Staff Overview', icon: Users },
        { id: 'infrastructure', label: 'Infrastructure & Facilities', icon: Wrench },
      ]
    },
    {
      title: 'APPROVALS & COMMUNICATION',
      items: [
        { id: 'leaves', label: 'Leave Approvals', icon: CalendarCheck, badge: pendingLeavesCount },
        { id: 'notices', label: 'Official Circulars', icon: Megaphone, badge: pendingNoticesCount },
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
        { id: 'campus-connect', label: 'Campus Connect Broadcast', icon: MessageSquare },
      ]
    },
    {
      title: 'PERSONAL & PROFILE',
      items: [
        { id: 'profile', label: 'Principal Official Profile', icon: User },
      ]
    }
  ];
};

export default getPrincipalMenuConfig;

