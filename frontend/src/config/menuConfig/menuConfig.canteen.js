import {
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Home,
  Fingerprint,
  Calendar,
  Utensils,
  Package,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  FileSpreadsheet,
  Server,
  Settings
} from 'lucide-react';

/**
 * Canteen & Mess Role Menu Configuration
 */
export function getCanteenMenuConfig(context = {}) {
  const totalMeals = context.summary?.totalMealsServed || 0;

  return [
    {
      title: 'A. OVERVIEW & REAL-TIME',
      items: [
        { id: 'dashboard', label: 'Fleet Dashboard', icon: LayoutDashboard },
        { id: 'live_meal_verification', label: 'Live Meal Verification', icon: ShieldCheck, badge: 'Live Terminal' },
        { id: 'meal_attendance', label: 'Meal Attendance', icon: UserCheck, badge: `${totalMeals}` },
      ]
    },
    {
      title: 'B. HOSTELLERS & BIOMETRICS',
      items: [
        { id: 'hosteller_management', label: 'Hosteller Management', icon: Home, badge: '520 Active' },
        { id: 'biometric_management', label: 'Biometric Management', icon: Fingerprint, badge: '6 Devices' },
        { id: 'meal_plans', label: 'Meal Plans & Subscriptions', icon: Calendar },
      ]
    },
    {
      title: 'C. KITCHEN & INVENTORY',
      items: [
        { id: 'food_consumption', label: 'Daily Food Consumption', icon: Utensils, badge: 'Computed' },
        { id: 'kitchen_inventory', label: 'Kitchen Inventory', icon: Package, badge: '7 Items' },
        { id: 'special_dishes', label: 'Special Dishes & Orders', icon: UtensilsCrossed },
      ]
    },
    {
      title: 'D. FINANCE & GOVERNANCE',
      items: [
        { id: 'canteen_finance', label: 'Canteen Finance', icon: CreditCard },
        { id: 'hostel_fee_overview', label: 'Hostel Fee Overview', icon: Banknote },
        { id: 'reports_analytics', label: 'Reports & Analytics', icon: FileSpreadsheet },
        { id: 'device_management', label: 'Device Management', icon: Server, badge: 'Online' },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];
};

export default getCanteenMenuConfig;

