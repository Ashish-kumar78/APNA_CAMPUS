import {
  Home,
  ShieldCheck,
  Users,
  DollarSign,
  Wrench,
  ShieldAlert,
  FileText,
  BarChart2,
  FileSpreadsheet,
  Bell,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  UserCheck,
  Clock,
  FlaskConical
} from 'lucide-react';

/**
 * Admin Role Menu Configuration
 */
export const getAdminMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ]
  },
  {
    title: 'EXECUTIVE GOVERNANCE & ERP',
    items: [
      { id: 'governance', label: 'Governance & Councils', icon: ShieldCheck },
      { id: 'hr-workforce', label: 'Human Resources & Staff', icon: Users },
      { id: 'finance-procurement', label: 'Finance & Procurement', icon: DollarSign },
      { id: 'facilities-workorders', label: 'Facilities & Work Orders', icon: Wrench },
      { id: 'compliance-risk', label: 'Compliance & Risk (CAPA)', icon: ShieldAlert },
      { id: 'document-vault', label: 'Official Records & Vault', icon: FileText },
    ]
  },
  {
    title: 'INSTITUTIONAL OVERVIEW',
    items: [
      { id: 'institutional-analytics', label: 'Institutional Analytics', icon: BarChart2 },
      { id: 'report-generation', label: 'Compliance Reports', icon: FileSpreadsheet },
      { id: 'notification-center', label: 'Broadcast Feeds', icon: Bell },
    ]
  },
  {
    title: 'ACADEMIC ADMINISTRATION',
    items: [
      { id: 'students', label: 'Student Directory', icon: GraduationCap },
      { id: 'faculty', label: 'Faculty Directory', icon: Users },
      { id: 'departments', label: 'Departments', icon: Building2 },
      { id: 'programs', label: 'Degree Programs', icon: BookOpen },
      { id: 'semesters', label: 'Academic Semesters', icon: Calendar },
      { id: 'sections', label: 'Class Sections', icon: Layers },
      { id: 'subjects', label: 'Course Catalog', icon: BookOpen },
      { id: 'faculty-allocations', label: 'Faculty Allocations', icon: UserCheck },
      { id: 'timetable', label: 'Timetables & Slots', icon: Calendar },
      { id: 'attendance-monitoring', label: 'Attendance Tracking', icon: Clock },
    ]
  },
  {
    title: 'LABORATORY MANAGEMENT',
    items: [
      { id: 'laboratory-management', label: 'Laboratory Management', icon: FlaskConical },
    ]
  }
];

export default getAdminMenuConfig;

