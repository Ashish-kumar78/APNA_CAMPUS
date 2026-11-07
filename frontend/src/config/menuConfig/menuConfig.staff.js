import {
  Home,
  Building2,
  Calendar,
  PlayCircle,
  ShieldCheck,
  Key,
  ClipboardCheck,
  FlaskConical,
  Users,
  Award,
  FileCheck2,
  HardDrive,
  Share2
} from 'lucide-react';

/**
 * Lab Technician / Technical Staff Role Menu Configuration
 */
export const getStaffMenuConfig = (context = {}) => [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ]
  },
  {
    title: 'LABORATORY OPERATIONS',
    items: [
      { id: 'laboratories', label: 'My Laboratories', icon: Building2 },
      { id: 'timetable', label: 'Lab Timetable', icon: Calendar },
      { id: 'sessions', label: 'Practical Session Management', icon: PlayCircle },
      { id: 'readiness', label: 'Lab Readiness Checklist', icon: ShieldCheck },
      { id: 'opening_closing', label: 'Opening & Closing Register', icon: Key },
    ]
  },
  {
    title: 'C. ACADEMICS & ATTENDANCE',
    items: [
      { id: 'attendance', label: 'Practical Attendance', icon: ClipboardCheck },
      { id: 'experiments', label: 'Experiment Management', icon: FlaskConical },
      { id: 'batches', label: 'Practical Batches', icon: Users },
      { id: 'evaluation', label: 'Experiment Evaluation', icon: Award },
      { id: 'completion_records', label: 'Completion Records', icon: FileCheck2 },
    ]
  },
  {
    title: 'D. EQUIPMENT & INVENTORY',
    items: [
      { id: 'equipment', label: 'Equipment Register', icon: HardDrive },
      { id: 'issue_return', label: 'Issue & Return Log', icon: Share2 },
      { id: 'calibration', label: 'Equipment Calibration', icon: Calendar },
    ]
  }
];

export default getStaffMenuConfig;

