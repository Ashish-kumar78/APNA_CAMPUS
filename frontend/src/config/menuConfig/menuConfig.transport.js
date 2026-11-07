import {
  Bus,
  AlertTriangle,
  Clock,
  Truck,
  MapPin,
  Navigation,
  Radio,
  Calendar,
  SquareParking,
  FileText,
  Ticket,
  QrCode,
  ArrowRightLeft,
  CreditCard,
  Users,
  CalendarDays,
  UserCheck,
  FileCheck2,
  Fuel,
  Wrench,
  ShieldAlert,
  FileCheck,
  PhoneCall,
  MessageSquare,
  FileSpreadsheet,
  Settings
} from 'lucide-react';

/**
 * Transport Role Menu Configuration
 */
export const getTransportMenuConfig = (context = {}) => [
  {
    title: 'A. TRANSPORT OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Fleet Dashboard', icon: Bus },
      { id: 'overview-alerts', label: 'Operational Alerts & Tasks', icon: AlertTriangle },
      { id: 'overview-daily-summary', label: 'Daily Operations Summary', icon: Clock },
    ]
  },
  {
    title: 'B. FLEET & ROUTE OPERATIONS',
    items: [
      { id: 'fleet', label: 'Vehicle Registry', icon: Truck },
      { id: 'routes', label: 'Routes & Stops', icon: MapPin },
      { id: 'trips', label: 'Trip & Dispatch Management', icon: Navigation },
      { id: 'telemetry', label: 'Live GPS Tracking', icon: Radio },
      { id: 'schedule-calendar', label: 'Transport Scheduling', icon: Calendar },
      { id: 'parking', label: 'Depot & Parking Bays', icon: SquareParking },
    ]
  },
  {
    title: 'C. STUDENT TRANSPORT SERVICES',
    items: [
      { id: 'student-applications', label: 'Student Applications', icon: FileText },
      { id: 'passes', label: 'Student Bus Pass Management', icon: Ticket },
      { id: 'boarding', label: 'QR Boarding & Drop Logs', icon: QrCode },
      { id: 'requests', label: 'Route Change Requests', icon: ArrowRightLeft },
      { id: 'fees-dues', label: 'Transport Fee Status', icon: CreditCard },
    ]
  },
  {
    title: 'D. STAFF & CREW MANAGEMENT',
    items: [
      { id: 'drivers', label: 'Driver & Conductor Directory', icon: Users },
      { id: 'duty-roster', label: 'Duty Roster & Shifts', icon: CalendarDays },
      { id: 'staff-attendance', label: 'Staff Attendance & Leave', icon: UserCheck },
      { id: 'license-verification', label: 'Licence & Verification', icon: FileCheck2 },
    ]
  },
  {
    title: 'E. MAINTENANCE, SAFETY & COMPLIANCE',
    items: [
      { id: 'fuel', label: 'Fuel & Mileage Logging', icon: Fuel },
      { id: 'maintenance', label: 'Service & Maintenance Logs', icon: Wrench },
      { id: 'incidents', label: 'Incidents & Breakdowns', icon: ShieldAlert },
      { id: 'compliance', label: 'Pollution, Fitness & Permits', icon: FileCheck },
      { id: 'emergency', label: 'Emergency SOS Console', icon: PhoneCall },
      { id: 'feedback', label: 'Complaints & Feedback', icon: MessageSquare },
      { id: 'reports', label: 'Transport Reports & Analytics', icon: FileSpreadsheet },
      { id: 'settings', label: 'Fleet System Settings', icon: Settings },
    ]
  }
];

export default getTransportMenuConfig;

