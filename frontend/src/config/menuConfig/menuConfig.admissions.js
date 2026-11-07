import {
  GraduationCap,
  Users,
  Layers,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  Award,
  UserCheck,
  Clock,
  Receipt,
  Sparkles,
  Megaphone,
  HelpCircle,
  FileSpreadsheet,
  History,
  Settings
} from 'lucide-react';

/**
 * Admissions Role Menu Configuration
 */
export const getAdmissionsMenuConfig = (context = {}) => {
  const applicantsCount = context.applicants?.length || 42;

  return [
    {
      title: 'ADMISSIONS PIPELINE',
      items: [
        { id: 'dashboard', label: 'Admissions Command', icon: GraduationCap },
        { id: 'applicants', label: 'Applicant Registry', icon: Users, badge: `${applicantsCount}` },
        { id: 'seat_matrix', label: 'Seat Matrix & Vacancy', icon: Layers, badge: '80 Vacant' },
      ]
    },
    {
      title: 'APPLICATION MANAGEMENT',
      items: [
        { id: 'app_processing', label: 'Application Processing', icon: FileCheck2, badge: '25 Active' },
        { id: 'doc_verification', label: 'Document Verification', icon: CheckCircle2, badge: '38 Queue' },
        { id: 'eligibility_rules', label: 'Eligibility & Admission Rules', icon: ShieldCheck },
      ]
    },
    {
      title: 'SELECTION & COUNSELLING',
      items: [
        { id: 'merit_list', label: 'Merit List Management', icon: Award, badge: 'Round 2' },
        { id: 'counselling_allotment', label: 'Counselling & Seat Allotment', icon: UserCheck },
        { id: 'waitlist_rounds', label: 'Waitlist & Admission Rounds', icon: Clock, badge: '5 Ranked' },
      ]
    },
    {
      title: 'ENROLLMENT & COMMUNICATION',
      items: [
        { id: 'fee_verification', label: 'Admission Fee Verification', icon: Receipt, badge: '14 Pending' },
        { id: 'enrollment_conversion', label: 'Enrollment & Student Conversion', icon: Sparkles },
        { id: 'applicant_communication', label: 'Applicant Communication', icon: Megaphone },
        { id: 'admission_helpdesk', label: 'Admission Helpdesk', icon: HelpCircle, badge: '5 Open' },
      ]
    },
    {
      title: 'ADMINISTRATION & REPORTS',
      items: [
        { id: 'reports_analytics', label: 'Admission Reports & NAAC', icon: FileSpreadsheet },
        { id: 'audit_logs', label: 'Admission Audit Logs', icon: History },
        { id: 'admissions_settings', label: 'Admission Settings', icon: Settings },
      ]
    }
  ];
};

export default getAdmissionsMenuConfig;

