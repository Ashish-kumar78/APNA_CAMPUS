import {
  Home,
  Users,
  Building2,
  ShieldCheck,
  CalendarCheck,
  Award,
  Bed,
  Clock,
  CheckCircle2,
  CalendarDays,
  AlertTriangle,
  Sparkles,
  Wrench,
  Layers,
  UsersRound,
  Utensils,
  CreditCard,
  Settings,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

/**
 * Hostel & Warden Role Menu Configuration
 */
export const getHostelMenuConfig = (context = {}) => {
  const isHostelAdmin = context.account?.role === 'hostel_admin';

  if (isHostelAdmin) {
    return [
      {
        title: 'OVERVIEW',
        items: [
          { id: 'dashboard', label: 'Hostel Admin Dashboard', icon: Home },
        ]
      },
      {
        title: 'WARDEN MANAGEMENT',
        items: [
          { id: 'warden-directory', label: 'Warden Directory', icon: Users },
          { id: 'warden-assignments', label: 'Warden Assignments', icon: Building2 },
          { id: 'warden-permissions', label: 'Warden Permissions', icon: ShieldCheck },
          { id: 'warden-duty-leaves', label: 'Duty & Leave Management', icon: CalendarCheck },
          { id: 'warden-performance', label: 'Warden Performance', icon: Award },
        ]
      },
      {
        title: 'RESIDENTIAL OPERATIONS',
        items: [
          { id: 'manage-hostels', label: 'Hostel Buildings & Blocks', icon: Building2 },
          { id: 'rooms', label: 'Rooms & Bed Capacity', icon: Bed },
          { id: 'room-allotment', label: 'Room Allotment', icon: Bed },
        ]
      },
      {
        title: 'ATTENDANCE & MOVEMENT',
        items: [
          { id: 'attendance', label: 'Attendance Monitoring', icon: Clock },
          { id: 'attendance-verification', label: 'Attendance Verification & Override', icon: CheckCircle2 },
          { id: 'resident-leaves-admin', label: 'Student Leave Approvals', icon: CalendarDays },
          { id: 'gatepasses', label: 'Digital Gate Passes', icon: ShieldCheck },
          { id: 'visitors', label: 'Visitor Register', icon: Users },
        ]
      },
      {
        title: 'SAFETY & DISCIPLINE',
        items: [
          { id: 'disciplinary', label: 'Disciplinary Reviews', icon: AlertTriangle },
          { id: 'emergency-contacts', label: 'Emergency Contacts', icon: ShieldCheck },
        ]
      },
      {
        title: 'SERVICES & ASSETS',
        items: [
          { id: 'cleanliness-complaints', label: 'Room Cleanliness Complaints & SLA', icon: Sparkles },
          { id: 'complaints', label: 'Maintenance Complaints & SLA', icon: Wrench },
          { id: 'inventory-assets', label: 'Furniture & Inventory Requisitions', icon: Layers },
          { id: 'staff-mgmt', label: 'Staff & Caretaker Roster', icon: UsersRound },
          { id: 'mess-dining', label: 'Mess & Food Feedback Management', icon: Utensils },
          { id: 'fees-dues', label: 'Hostel Fee Ledger', icon: CreditCard },
        ]
      },
      {
        title: 'POLICIES & REPORTS',
        items: [
          { id: 'settings-rules', label: 'Hostel Rules & Curfew', icon: Settings },
          { id: 'approval-center', label: 'Central Approval Center', icon: CheckCircle2, badge: 'Unified' },
          { id: 'report-generation', label: 'Reports & Compliance Analytics', icon: FileSpreadsheet },
          { id: 'audit-logs', label: 'Administrative Audit Logs', icon: FileText },
        ]
      }
    ];
  }

  // Warden default view
  return [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Hostel Dashboard', icon: Home },
      ]
    },
    {
      title: 'RESIDENT MANAGEMENT',
      items: [
        { id: 'residents', label: 'Student Residents', icon: Users },
        { id: 'rooms', label: 'Room Occupancy', icon: Bed },
        { id: 'attendance', label: 'Night Roll Call', icon: Clock },
        { id: 'resident-leaves-admin', label: 'Leave Requests', icon: CalendarDays },
        { id: 'gatepasses', label: 'Digital Gate Passes', icon: ShieldCheck },
      ]
    },
    {
      title: 'OPERATIONS & COMPLAINTS',
      items: [
        { id: 'mess-dining', label: 'Mess & Food Feedback', icon: Utensils },
        { id: 'cleanliness-complaints', label: 'Room Cleanliness Complaints', icon: Sparkles },
        { id: 'complaints', label: 'Room Maintenance Complaints', icon: Wrench },
        { id: 'inventory-assets', label: 'Furniture & Inventory', icon: Layers },
        { id: 'staff-mgmt', label: 'Warden & Caretaker Roster', icon: UsersRound },
      ]
    },
    {
      title: 'REPORTS & POLICIES',
      items: [
        { id: 'settings-rules', label: 'Hostel Rules & Curfew', icon: Settings },
      ]
    }
  ];
};

export default getHostelMenuConfig;

