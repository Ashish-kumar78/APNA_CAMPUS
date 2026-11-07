import {
  Home,
  BarChart2,
  CheckCircle2,
  FileCheck,
  BookOpen,
  ClipboardCheck,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Users,
  ShieldAlert,
  Megaphone,
  FileSpreadsheet,
  FileText,
  Download,
  User
} from 'lucide-react';

/**
 * Head of Department (HOD) Role Menu Configuration
 */
export const getHodMenuConfig = (context = {}) => {
  const pendingCount = context.pendingCount || null;
  const atRiskCount = context.atRiskCount || null;
  const pendingGrievancesCount = context.pendingGrievancesCount || null;
  const docsCount = context.hodDocs?.length || null;

  return [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
      ]
    },
    {
      title: 'ACADEMICS & EVALUATION',
      items: [
        { id: 'marks', label: 'Marks Management', icon: BarChart2 },
        { id: 'approval', label: 'Marks Approval', icon: CheckCircle2, badge: pendingCount, badgeType: 'warning' },
        { id: 'digital-evaluation', label: 'Digital Evaluation & Approval', icon: FileCheck },
        { id: 'subjects', label: 'Department Subjects', icon: BookOpen },
        { id: 'take-attendance', label: 'Take Attendance', icon: ClipboardCheck },
        { id: 'timetable', label: 'Timetable Management', icon: Calendar },
      ]
    },
    {
      title: 'STUDENTS & FACULTY',
      items: [
        { id: 'students', label: 'Department Students', icon: GraduationCap },
        { id: 'at-risk', label: 'At-Risk Students Alert', icon: AlertTriangle, badge: atRiskCount, badgeType: 'danger' },
        { id: 'faculty', label: 'Department Faculty', icon: Users },
        { id: 'complaints', label: 'Grievance Monitoring', icon: ShieldAlert, badge: pendingGrievancesCount, badgeType: 'warning' },
        { id: 'notifications', label: 'Department Notifications', icon: Megaphone },
      ]
    },
    {
      title: 'RECORDS & REPORTS',
      items: [
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
        { id: 'reports', label: 'Department Gazette', icon: FileText },
        { id: 'documents', label: 'Department Documents', icon: Download, badge: docsCount },
      ]
    },
    {
      title: 'PERSONAL & PROFILE',
      items: [
        { id: 'profile', label: 'HOD Official Profile', icon: User },
      ]
    }
  ];
};

export default getHodMenuConfig;

