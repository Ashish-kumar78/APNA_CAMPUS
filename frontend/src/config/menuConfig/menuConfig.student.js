import {
  Home,
  BookOpen,
  ClipboardList,
  Building2,
  LibraryBig,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  MessageSquare,
  Award,
  FileCheck
} from 'lucide-react';

/**
 * Student Role Menu Configuration
 */
export const getStudentMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', page: 'dashboard', label: 'Dashboard', icon: Home },
    ]
  },
  {
    title: 'ACADEMICS',
    items: [
      { id: 'academics', page: 'academics', label: 'Academics', icon: BookOpen },
      { id: 'online-exam', page: 'online-exam', label: 'Online Examination', icon: ClipboardList },
    ]
  },
  {
    title: 'CAMPUS',
    items: [
      { id: 'hostel', page: 'hostel', label: 'Hostel Residence', icon: Building2 },
      { id: 'library', page: 'library', label: 'Library', icon: LibraryBig },
      { id: 'placement', page: 'placement', label: 'Self Development & Placement', icon: TrendingUp },
      { id: 'internship', page: 'internship', label: 'Internship', icon: Briefcase },
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { id: 'anonymous-complaints', page: 'anonymous-complaints', label: 'Anonymous Complaints', icon: ShieldCheck },
      { id: 'feedback', page: 'feedback', label: 'Feedback/Appraisal/Survey', icon: MessageSquare },
    ]
  },
  {
    title: 'SCHOLARSHIP AND BONAFIDE CERTIFICATES',
    items: [
      { id: 'apply-scholarship', page: 'apply-scholarship', label: 'Apply Scholarship', icon: Award },
      { id: 'bonafide', page: 'bonafide', label: 'Apply Bonafide Certificate', icon: FileCheck },
    ]
  }
];

export default getStudentMenuConfig;

