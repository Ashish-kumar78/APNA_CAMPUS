// Apna Campus ERP — Canteen Directorate & Central Mess Operations Portal
import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from './Navigation';
import {
  LayoutDashboard,
  Home,
  Fingerprint,
  ShieldCheck,
  UserCheck,
  Utensils,
  Package,
  Calendar,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  FileSpreadsheet,
  Server,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Receipt,
  Users
} from 'lucide-react';
import { canteenStore } from '../services/canteenStore.js';
import './CanteenPortal.css';

// 14 Dedicated Enterprise Sections
import CanteenDashboardSection from './canteen/CanteenDashboardSection.jsx';
import CanteenHostellersSection from './canteen/CanteenHostellersSection.jsx';
import CanteenBiometricSection from './canteen/CanteenBiometricSection.jsx';
import CanteenLiveVerificationSection from './canteen/CanteenLiveVerificationSection.jsx';
import CanteenMealAttendanceSection from './canteen/CanteenMealAttendanceSection.jsx';
import CanteenFoodConsumptionSection from './canteen/CanteenFoodConsumptionSection.jsx';
import CanteenKitchenInventorySection from './canteen/CanteenKitchenInventorySection.jsx';
import CanteenMealPlansSection from './canteen/CanteenMealPlansSection.jsx';
import CanteenSpecialDishesSection from './canteen/CanteenSpecialDishesSection.jsx';
import CanteenFinanceSection from './canteen/CanteenFinanceSection.jsx';
import CanteenHostelFeeSection from './canteen/CanteenHostelFeeSection.jsx';
import CanteenReportsSection from './canteen/CanteenReportsSection.jsx';
import CanteenDeviceManagementSection from './canteen/CanteenDeviceManagementSection.jsx';
import CanteenSettingsSection from './canteen/CanteenSettingsSection.jsx';

export default function CanteenPortal({ account, onLogout }) {
  // Navigation State (Defaults to Dashboard)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dataVersion, setDataVersion] = useState(0);

  // Sync listener for canteen data updates
  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  // Floating Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Summary Metrics
  const summary = useMemo(() => {
    return canteenStore.getEnterpriseDailyMealSummary();
  }, [dataVersion]);

  // 14 Sections Sidebar Navigation Architecture
  const navSections = [
    {
      title: 'A. OVERVIEW & REAL-TIME',
      items: [
        { id: 'dashboard', label: 'Fleet Dashboard', icon: LayoutDashboard },
        { id: 'live_meal_verification', label: 'Live Meal Verification', icon: ShieldCheck, badge: 'Live Terminal' },
        { id: 'meal_attendance', label: 'Meal Attendance', icon: UserCheck, badge: `${summary.totalMealsServed || 0}` },
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

  // Resolve legacy alias navigation
  const resolvedTab = useMemo(() => {
    switch (activeTab) {
      case 'biometric_records': return 'live_meal_verification';
      case 'day_scholars': return 'meal_plans';
      case 'hostellers': return 'hosteller_management';
      case 'food_applications': return 'meal_plans';
      case 'yearly_subscriptions': return 'meal_plans';
      case 'special_transactions': return 'special_dishes';
      case 'canteen_fees': return 'canteen_finance';
      default: return activeTab;
    }
  }, [activeTab]);

  const pageTitleMap = {
    dashboard: 'Canteen Directorate Dashboard',
    hosteller_management: 'Complete Hosteller Management & Registry',
    biometric_management: 'Biometric ID Registration & Device Management',
    live_meal_verification: 'Live Meal Verification & Biometric Bay',
    meal_attendance: 'Daily Meal Attendance Register',
    food_consumption: 'Daily Food Consumption & Kitchen Management',
    kitchen_inventory: 'Kitchen Raw Materials & Inventory',
    meal_plans: 'Meal Plans & Subscriptions Directorate',
    special_dishes: 'Special Dishes & Kitchen Order Tokens',
    canteen_finance: 'Canteen Directorate Finance & Mess Ledger',
    hostel_fee_overview: 'Hostel Accommodation Fee Overview',
    reports_analytics: 'Reports & Multi-Format Operational Analytics',
    device_management: 'Biometric & RFID Hardware Device Management',
    settings: 'Canteen Operations & RBAC Security Settings'
  };

  const pageSubtitleMap = {
    dashboard: 'Real-time dining metrics, meal service status, kitchen efficiency, and operational health.',
    hosteller_management: 'Central hosteller database integration with separate hostel accommodation vs. mess fee status.',
    biometric_management: 'Unique student reference IDs, simulation DEMO mode, and privacy-compliant mapping.',
    live_meal_verification: 'Instant fingerprint verification with duplicate claim prevention and subscription eligibility.',
    meal_attendance: 'Breakfast, Lunch, Snacks, Dinner attendance. Absences finalized strictly after service cutoff.',
    food_consumption: 'Recipe standard requirements vs. actual prepared food and zero-waste compliance metrics.',
    kitchen_inventory: 'Stock register tracking Rice, Dal, Vegetables, Cooking Oil, Milk, and Spices.',
    meal_plans: 'Semester and annual meal subscriptions mapped directly to verified dining entitlement.',
    special_dishes: 'A-la-carte add-on curries, live order tokens queue, and RFID smart card payments.',
    canteen_finance: 'Dedicated mess collections, special dishes revenue, and student fee ledgers.',
    hostel_fee_overview: 'Role-scoped hostel accommodation fee oversight with restricted canteen staff view.',
    reports_analytics: 'Generate formal daily, monthly, student-wise, and financial statements with PDF/Excel/CSV exports.',
    device_management: 'Hardware status, firmware telemetry, sensor calibration diagnostics, and heartbeat sync.',
    settings: 'Configure service window schedules, recipe portion sizes, and RBAC governance matrix.'
  };

  return (
    <AppLayout
      account={account}
      portalName="Canteen Directorate"
      portalSubtitle="Enterprise Food Management ERP"
      portalHomeTab="dashboard"
      navSections={navSections}
      activeTab={resolvedTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
      pageTitle={pageTitleMap[resolvedTab] || 'Canteen Directorate'}
      pageSubtitle={pageSubtitleMap[resolvedTab] || 'Enterprise Food Operations & Fleet Management'}
    >
      <div className="canteen-portal-root space-y-6">
        {/* Toast Alert */}
        {toast && (
          <div className={`canteen-floating-toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <XCircle size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 14 ENTERPRISE CANTEEN MODULE SECTIONS */}
        {/* ======================================================== */}
        {resolvedTab === 'dashboard' && (
          <CanteenDashboardSection
            account={account}
            showToast={showToast}
            onNavigate={setActiveTab}
          />
        )}

        {resolvedTab === 'hosteller_management' && (
          <CanteenHostellersSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'biometric_management' && (
          <CanteenBiometricSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'live_meal_verification' && (
          <CanteenLiveVerificationSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'meal_attendance' && (
          <CanteenMealAttendanceSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'food_consumption' && (
          <CanteenFoodConsumptionSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'kitchen_inventory' && (
          <CanteenKitchenInventorySection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'meal_plans' && (
          <CanteenMealPlansSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'special_dishes' && (
          <CanteenSpecialDishesSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'canteen_finance' && (
          <CanteenFinanceSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'hostel_fee_overview' && (
          <CanteenHostelFeeSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'reports_analytics' && (
          <CanteenReportsSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'device_management' && (
          <CanteenDeviceManagementSection
            account={account}
            showToast={showToast}
          />
        )}

        {resolvedTab === 'settings' && (
          <CanteenSettingsSection
            account={account}
            showToast={showToast}
          />
        )}
      </div>
    </AppLayout>
  );
}
