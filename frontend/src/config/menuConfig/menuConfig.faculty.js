import {
  Layers,
  ClipboardCheck,
  Calendar,
  BookOpen,
  GraduationCap,
  BarChart2,
  FileText,
  FileSpreadsheet,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Megaphone,
  Download,
  CalendarDays,
  Settings,
  HelpCircle,
  User
} from 'lucide-react';

/**
 * Faculty Role Menu Configuration
 */
export const getFacultyMenuConfig = (context = {}) => {
  const studentCount = context.scopedStudents?.length || 150;
  const docsCount = context.campusDocs?.length || 3;
  const atRiskCount = context.atRiskStudents?.length || null;

  return [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Faculty Dashboard', icon: Layers },
      ]
    },
    {
      title: 'TEACHING & CLASSES',
      items: [
        { id: 'take-attendance', label: 'Take Attendance', icon: ClipboardCheck },
        { id: 'timetable', label: 'My Timetable', icon: Calendar },
        { id: 'subjects', label: 'My Subjects', icon: BookOpen },
        { id: 'students', label: `My Students (${studentCount})`, icon: GraduationCap },
      ]
    },
    {
      title: 'ASSESSMENT',
      items: [
        { id: 'marks', label: 'Marks Management', icon: BarChart2 },
        { id: 'digital-evaluation', label: 'Answer Sheet Evaluation', icon: FileText },
        { id: 'assignments', label: 'Assignment Management', icon: FileSpreadsheet, badge: 'CIA' },
        { id: 'quiz', label: 'Quiz Management', icon: ClipboardList },
        { id: 'performance', label: 'Class Performance', icon: Sparkles },
        { id: 'reports', label: 'Grade Reports', icon: FileText },
        { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
      ]
    },
    {
      title: 'ACADEMIC RESOURCES',
      items: [
        { id: 'note-sharing', label: 'Notes & Study Materials', icon: FileText, badge: 'Active' },
        { id: 'awaiting-verification', label: 'Resources Awaiting Verification', icon: ShieldCheck, badge: atRiskCount },
        { id: 'notes-moderation', label: 'Notes Moderation', icon: ShieldCheck },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'complaints', label: 'Student Grievances', icon: ShieldAlert },
        { id: 'notifications', label: 'Notifications & Announcements', icon: Megaphone },
        { id: 'documents', label: 'Official Documents', icon: Download, badge: docsCount },
      ]
    },
    {
      title: 'PERSONAL',
      items: [
        { id: 'profile', label: 'Faculty Official Profile', icon: User },
        { id: 'leave-management', label: 'Leave Management', icon: CalendarDays },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
      ]
    }
  ];
};

export default getFacultyMenuConfig;

