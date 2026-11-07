import {
  Home,
  CalendarDays,
  Users,
  Ticket,
  Building2,
  FileText,
  CheckCircle2,
  Award,
  RotateCcw,
  FileCheck,
  Key,
  BookOpen,
  UserCheck,
  AlertTriangle,
  Megaphone,
  FileSpreadsheet,
  Sliders
} from 'lucide-react';

/**
 * Examination Cell Role Menu Configuration
 */
export const getExamCellMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ]
  },
  {
    title: 'OPERATIONAL COMMAND',
    items: [
      { id: 'cycles', label: 'Exam Cycles & Schedule', icon: CalendarDays },
      { id: 'registration', label: 'Candidate Registration', icon: Users },
      { id: 'hall_tickets', label: 'Admit Cards & Hall Tickets', icon: Ticket },
      { id: 'seating', label: 'Seating & Center Allocation', icon: Building2 },
    ]
  },
  {
    title: 'EVALUATION & DIGITAL GRADING',
    items: [
      { id: 'digital_evaluation', label: 'Digital Answer Evaluation', icon: FileText },
      { id: 'moderation', label: 'Marks Moderation & Review', icon: CheckCircle2 },
      { id: 'grading', label: 'Grading & Result Computation', icon: Award },
      { id: 'scrutiny', label: 'Re-checking & Scrutiny', icon: RotateCcw },
      { id: 'certificates', label: 'Grade Sheets & Transcripts', icon: FileCheck },
    ]
  },
  {
    title: 'CONFIDENTIAL & COMPLIANCE',
    items: [
      { id: 'question_papers', label: 'Question Paper Depository', icon: Key },
      { id: 'booklets', label: 'Barcode Booklets & Bundles', icon: BookOpen },
      { id: 'examiners', label: 'Examiners & Invigilators', icon: UserCheck },
      { id: 'malpractice_grievances', label: 'Malpractice Committee', icon: AlertTriangle },
      { id: 'circulars', label: 'Exam Notifications & Circulars', icon: Megaphone },
      { id: 'report-generation', label: 'Report Generation', icon: FileSpreadsheet },
      { id: 'exam_settings', label: 'Autonomous Rules & Config', icon: Sliders },
    ]
  }
];

export default getExamCellMenuConfig;

