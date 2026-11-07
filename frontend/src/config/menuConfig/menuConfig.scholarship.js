import {
  Home,
  Eye,
  Layers,
  Building,
  Award,
  GraduationCap,
  DollarSign,
  BookmarkCheck,
  Briefcase,
  Scale,
  Calendar,
  Users,
  FolderOpen,
  FileText,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  History,
  ClipboardList,
  FileCheck,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

/**
 * Scholarship & Aid Role Menu Configuration
 */
export const getScholarshipMenuConfig = (context = {}) => {
  const schemesCount = context.schemes?.length || 12;
  const appsCount = context.applications?.length || 45;
  const docsCount = context.documents?.length || 8;

  return [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home }
      ]
    },
    {
      title: 'SCHOLARSHIPS & AID (STUDENT VIEW)',
      items: [
        { id: 'public_portal', label: 'Scholarships & Aid (Student View)', icon: Eye }
      ]
    },
    {
      title: 'SCHEME MANAGEMENT',
      items: [
        { id: 'schemes_all', label: 'All Scholarship Schemes', icon: Layers, badge: `${schemesCount}` },
        { id: 'schemes_govt', label: 'Government Scholarships', icon: Building },
        { id: 'schemes_inst', label: 'Institutional Scholarships', icon: Award },
        { id: 'schemes_merit', label: 'Merit-Based Schemes', icon: GraduationCap },
        { id: 'schemes_need', label: 'Need-Based Aid', icon: DollarSign },
        { id: 'schemes_category', label: 'Category-Based Programs', icon: BookmarkCheck },
        { id: 'schemes_private', label: 'Private & CSR Sponsored', icon: Briefcase },
        { id: 'schemes_rules', label: 'Scheme Eligibility Rules', icon: Scale },
        { id: 'schemes_deadlines', label: 'Application Deadlines', icon: Calendar }
      ]
    },
    {
      title: 'APPLICATION MANAGEMENT',
      items: [
        { id: 'apps_all', label: 'All Applications', icon: Users, badge: `${appsCount}` },
        { id: 'apps_new', label: 'New Applications', icon: FolderOpen },
        { id: 'apps_draft', label: 'Draft Applications', icon: FileText },
        { id: 'apps_submitted', label: 'Submitted Applications', icon: Send },
        { id: 'apps_incomplete', label: 'Incomplete Applications', icon: AlertTriangle },
        { id: 'apps_review', label: 'Applications Under Review', icon: Clock },
        { id: 'apps_approved', label: 'Approved Applications', icon: CheckCircle2 },
        { id: 'apps_rejected', label: 'Rejected Applications', icon: AlertTriangle },
        { id: 'apps_waitlist', label: 'Waiting List', icon: History },
        { id: 'apps_history', label: 'Application History', icon: ClipboardList }
      ]
    },
    {
      title: 'ELIGIBILITY & VERIFICATION',
      items: [
        { id: 'bonafide_applications', label: 'Bonafide Applications Queue', icon: FileCheck },
        { id: 'verif_screening', label: 'Eligibility Screening', icon: ShieldCheck },
        { id: 'verif_academic', label: 'Academic Verification', icon: GraduationCap },
        { id: 'verif_income', label: 'Income Certificate Check', icon: DollarSign },
        { id: 'verif_category', label: 'Identity & Category Check', icon: BookmarkCheck },
        { id: 'verif_docs', label: 'Supporting Document Review', icon: FileCheck, badge: `${docsCount}` },
        { id: 'verif_discrepancy', label: 'Discrepancy Management', icon: AlertTriangle },
        { id: 'verif_history', label: 'Verification History', icon: History }
      ]
    },
    {
      title: 'STUDENT RECORDS',
      items: [
        { id: 'student_profiles', label: 'Student Scholarship Profiles', icon: Users },
        { id: 'student_prev_awards', label: 'Previous Awards Register', icon: Award },
        { id: 'student_history', label: 'Scholarship History', icon: History },
        { id: 'student_renewals', label: 'Renewal Eligibility', icon: RefreshCw },
        { id: 'student_progress', label: 'Academic Progress Review', icon: TrendingUp }
      ]
    },
    {
      title: 'SELECTION & APPROVALS',
      items: [
        { id: 'sel_shortlist', label: 'Application Shortlisting', icon: FolderOpen },
        { id: 'sel_ranking', label: 'Merit Ranking Index', icon: TrendingUp },
        { id: 'sel_committee', label: 'Committee Review Console', icon: Users },
        { id: 'sel_approval_queue', label: 'Executive Approval Queue', icon: CheckCircle2 },
        { id: 'sel_award_letters', label: 'Award Letter Management', icon: Award },
        { id: 'sel_appeals', label: 'Appeals & Reconsideration', icon: HelpCircle }
      ]
    }
  ];
};

export default getScholarshipMenuConfig;

