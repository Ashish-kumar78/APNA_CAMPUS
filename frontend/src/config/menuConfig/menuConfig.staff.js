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
  Share2,
  Package,
  Layers,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  Clock,
  CheckCircle2,
  Flame,
  FileText,
  DollarSign,
  FolderOpen,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Settings
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
      { id: 'inventory', label: 'Consumables Inventory', icon: Package },
      { id: 'stock_movement', label: 'Stock Movement Register', icon: Layers },
      { id: 'stock_alerts', label: 'Low Stock & Expiry Alerts', icon: AlertTriangle },
      { id: 'damaged_equipment', label: 'Damaged Equipment Register', icon: AlertOctagon },
    ]
  },
  {
    title: 'E. MAINTENANCE & SAFETY',
    items: [
      { id: 'complaints', label: 'Equipment Complaints', icon: AlertTriangle },
      { id: 'maintenance', label: 'Maintenance Work Orders', icon: Wrench },
      { id: 'preventive_maint', label: 'Preventive Maintenance', icon: Clock },
      { id: 'inspection', label: 'Lab Inspection Checklist', icon: ShieldCheck },
      { id: 'safety', label: 'Safety Compliance', icon: CheckCircle2 },
      { id: 'incidents', label: 'Incident & Breakdown Register', icon: Flame },
    ]
  },
  {
    title: 'F. REQUESTS & ADMINISTRATION',
    items: [
      { id: 'requisitions', label: 'Consumable Requisitions', icon: FileText },
      { id: 'purchase_requests', label: 'Equipment Purchase Requests', icon: DollarSign },
      { id: 'approvals', label: 'Approval Tracking', icon: CheckCircle2 },
      { id: 'dispatch', label: 'Office Dispatch & Records', icon: FolderOpen },
      { id: 'handover', label: 'Lab Handover Register', icon: FileCheck2 },
    ]
  },
  {
    title: 'G. REPORTS & ANALYTICS',
    items: [
      { id: 'report_attendance', label: 'Attendance Reports', icon: FileSpreadsheet },
      { id: 'report_utilization', label: 'Lab Utilization Reports', icon: BarChart3 },
      { id: 'report_inventory', label: 'Inventory & Stock Reports', icon: FileSpreadsheet },
      { id: 'report_breakdown', label: 'Equipment Breakdown Analysis', icon: TrendingUp },
    ]
  }
];

export default getStaffMenuConfig;


