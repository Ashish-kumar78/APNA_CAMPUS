// Apna Campus ERP — Enterprise Canteen Management ERP Unified Module
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Home, Fingerprint, ShieldCheck, 
  Utensils, UserCheck, Package, Calendar, UtensilsCrossed, 
  CreditCard, Banknote, FileSpreadsheet, Server, Settings,
  AlertTriangle, RefreshCw
} from 'lucide-react';

import CanteenDashboardSection from './CanteenDashboardSection';
import CanteenHostellersSection from './CanteenHostellersSection';
import CanteenBiometricSection from './CanteenBiometricSection';
import CanteenLiveVerificationSection from './CanteenLiveVerificationSection';
import CanteenMealAttendanceSection from './CanteenMealAttendanceSection';
import CanteenFoodConsumptionSection from './CanteenFoodConsumptionSection';
import CanteenKitchenInventorySection from './CanteenKitchenInventorySection';
import CanteenMealPlansSection from './CanteenMealPlansSection';
import CanteenSpecialDishesSection from './CanteenSpecialDishesSection';
import CanteenFinanceSection from './CanteenFinanceSection';
import CanteenHostelFeeSection from './CanteenHostelFeeSection';
import CanteenReportsSection from './CanteenReportsSection';
import CanteenDeviceManagementSection from './CanteenDeviceManagementSection';
import CanteenSettingsSection from './CanteenSettingsSection';

export default function CanteenManagementModule({ account, initialTab = 'dashboard', onNavigate }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 14 Required Sections
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hosteller_management', label: 'Hosteller Management', icon: Home },
    { id: 'biometric_management', label: 'Biometric Management', icon: Fingerprint },
    { id: 'live_meal_verification', label: 'Live Meal Verification', icon: ShieldCheck },
    { id: 'meal_attendance', label: 'Meal Attendance', icon: UserCheck },
    { id: 'food_consumption', label: 'Daily Food Consumption', icon: Utensils },
    { id: 'kitchen_inventory', label: 'Kitchen Inventory', icon: Package },
    { id: 'meal_plans', label: 'Meal Plans & Subscriptions', icon: Calendar },
    { id: 'special_dishes', label: 'Special Dishes & Orders', icon: UtensilsCrossed },
    { id: 'canteen_finance', label: 'Canteen Finance', icon: CreditCard },
    { id: 'hostel_fee_overview', label: 'Hostel Fee Overview', icon: Banknote },
    { id: 'reports_analytics', label: 'Reports & Analytics', icon: FileSpreadsheet },
    { id: 'device_management', label: 'Device Management', icon: Server },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Resolve active section including legacy aliases
  const resolvedTab = (() => {
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
  })();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 py-3 px-5 rounded-xl shadow-2xl text-xs font-semibold text-white transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600' : toast.type === 'warning' ? 'bg-amber-600' : 'bg-emerald-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Embedded Sub-Navigation Pills (for when rendered within Admin or Super Admin portals) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = resolvedTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div>
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
    </div>
  );
}

