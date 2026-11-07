import {
  Home,
  CalendarDays,
  Building2,
  Users,
  Award,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  FileCheck,
  Briefcase,
  BookOpen,
  UserCheck,
  Megaphone
} from 'lucide-react';

/**
 * Placement Cell Role Menu Configuration
 */
export const getPlacementMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ]
  },
  {
    title: 'RECRUITMENT & DRIVES',
    items: [
      { id: 'drives', label: 'Placement Drives', icon: CalendarDays },
      { id: 'companies', label: 'Corporate Partners', icon: Building2 },
    ]
  },
  {
    title: 'STUDENTS & OUTCOMES',
    items: [
      { id: 'candidates', label: 'Eligible Candidates', icon: Users },
      { id: 'offers', label: 'Job Offers & Packages', icon: Award },
      { id: 'stats', label: 'Salary & CTC Distribution', icon: TrendingUp },
      { id: 'report-generation', label: 'NAAC Placement Reports', icon: FileSpreadsheet },
    ]
  },
  {
    title: 'TRAINING & INTERNSHIPS',
    items: [
      { id: 'internship-cell', label: 'Internship Cell & ID Cards', icon: ShieldCheck },
      { id: 'bonafide-verification', label: 'Bonafide Verification', icon: FileCheck },
      { id: 'internships', label: 'Internship Drives & Ops', icon: Briefcase },
      { id: 'training', label: 'Training & Skill Development', icon: BookOpen },
    ]
  },
  {
    title: 'APPLICATIONS & COMMUNICATION',
    items: [
      { id: 'applications', label: 'Student Applications', icon: UserCheck },
      { id: 'notices', label: 'Placement Notices', icon: Megaphone },
    ]
  }
];

export default getPlacementMenuConfig;

