import React, { useState, useEffect } from 'react';
import { AppLayout } from './Navigation';
import {
  Wrench,
  Building2,
  Calendar,
  Clock,
  PlayCircle,
  ClipboardCheck,
  Key,
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
  ShieldCheck,
  Flame,
  FileText,
  DollarSign,
  CheckCircle2,
  FolderOpen,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Bell,
  User,
  HelpCircle,
  CheckCircle
} from 'lucide-react';

import './StaffPortal.css';
import './SuperAdminPortal.css';

// Central Reactive Store & Multi-Branch Configuration
import { labStaffStore } from '../services/labStaffStore.js';
import { BRANCHES_CONFIG } from './StaffModules/labStaffData.js';

// Modular Feature Tabs
import StaffBranchPill from './StaffModules/StaffBranchPill.jsx';
import QuickActionModal from './StaffModules/QuickActionModal.jsx';
import StaffDashboardTab from './StaffModules/StaffDashboardTab.jsx';
import LabOperationsTab from './StaffModules/LabOperationsTab.jsx';
import AcademicsAttendanceTab from './StaffModules/AcademicsAttendanceTab.jsx';
import EquipmentInventoryTab from './StaffModules/EquipmentInventoryTab.jsx';
import MaintenanceSafetyTab from './StaffModules/MaintenanceSafetyTab.jsx';
import RequestsAdminTab from './StaffModules/RequestsAdminTab.jsx';
import ReportsAnalyticsTab from './StaffModules/ReportsAnalyticsTab.jsx';
import ProfileSettingsTab from './StaffModules/ProfileSettingsTab.jsx';

export default function StaffPortal({ account, onLogout, onSwitchRole }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState('');
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState('record-attendance');

  // Reactive store state
  const [storeState, setStoreState] = useState(() => labStaffStore.data);

  useEffect(() => {
    const unsubscribe = labStaffStore.subscribe((nextState) => {
      setStoreState({ ...nextState });
    });
    return () => unsubscribe();
  }, []);

  const currentBranch = storeState.currentBranch || 'CSE';
  const activeLabId = storeState.activeLabId || 'CSE-LAB-02';
  const profile = storeState.profile;
  const laboratories = storeState.laboratories;
  const timetable = storeState.timetable;
  const equipment = storeState.equipment;
  const consumables = storeState.consumables;
  const maintenanceOrders = storeState.maintenanceOrders;
  const requisitions = storeState.requisitions;
  const safetyInspections = storeState.safetyInspections;
  const notifications = storeState.notifications;
  const issueReturn = storeState.issueReturn;
  const stockMovements = storeState.stockMovements;
  const purchaseRequests = storeState.purchaseRequests;
  const dispatchRecords = storeState.dispatchRecords;
  const handovers = storeState.handovers;
  const students = storeState.students;
  const experiments = storeState.experiments;
  const preventiveSchedule = storeState.preventiveSchedule;

  // Unread badge counts
  const unreadNotifs = notifications.filter(n => n.unread).length;
  const lowStockCount = consumables.filter(c => c.department === currentBranch && (c.status === 'Low Stock' || c.status === 'Critical / Out of Stock')).length;
  const openTicketsCount = maintenanceOrders.filter(m => m.department === currentBranch && (m.status === 'Open' || m.status === 'Assigned')).length;
  const pendingReqsCount = requisitions.filter(r => r.department === currentBranch && (r.status === 'Pending Approval' || r.status === 'Submitted')).length;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenQuickAction = (type = 'record-attendance') => {
    setQuickActionType(type);
    setQuickActionOpen(true);
  };

  const handleToggleRole = () => {
    const nextRole = labStaffStore.toggleRole();
    triggerToast(`Demonstration role toggled to "${nextRole}"!`);
  };

  const handleBranchChange = (newBranch) => {
    labStaffStore.setBranch(newBranch);
    triggerToast(`Switched active discipline to ${BRANCHES_CONFIG[newBranch]?.name || newBranch}`);
  };

  const handleLabChange = (newLabId) => {
    labStaffStore.setActiveLabId(newLabId);
    triggerToast(`Focused on laboratory: ${newLabId}`);
  };

  // Master Navigation Sections matching the Master Prompt specifications exactly
  const staffNavSections = [
    {
      title: 'A. DASHBOARD',
      collapsible: false,
      items: [
        { id: 'dashboard', label: 'Staff Dashboard', icon: Wrench },
      ]
    },
    {
      title: 'B. LABORATORY OPERATIONS',
      collapsible: true,
      defaultCollapsed: false,
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
      collapsible: true,
      defaultCollapsed: false,
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
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'equipment', label: 'Equipment Register', icon: HardDrive },
        { id: 'issue_return', label: 'Issue & Return Log', icon: Share2 },
        { id: 'calibration', label: 'Equipment Calibration', icon: Calendar },
        { id: 'inventory', label: 'Consumables Inventory', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null, badgeType: 'apna-badge-danger' },
        { id: 'stock_movement', label: 'Stock Movement Register', icon: Layers },
        { id: 'stock_alerts', label: 'Low Stock & Expiry Alerts', icon: AlertTriangle },
        { id: 'damaged_equipment', label: 'Damaged Equipment Register', icon: AlertOctagon },
      ]
    },
    {
      title: 'E. MAINTENANCE & SAFETY',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'maintenance', label: 'Maintenance Work Orders', icon: Wrench, badge: openTicketsCount > 0 ? openTicketsCount : null, badgeType: 'apna-badge-warning' },
        { id: 'preventive_maint', label: 'Preventive Maintenance', icon: Clock },
        { id: 'inspection', label: 'Lab Inspection Checklist', icon: ShieldCheck },
        { id: 'safety', label: 'Safety Compliance', icon: CheckCircle2 },
        { id: 'incidents', label: 'Incident & Breakdown Register', icon: Flame },
      ]
    },
    {
      title: 'F. REQUESTS & ADMINISTRATION',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'requisitions', label: 'Consumable Requisitions', icon: FileText, badge: pendingReqsCount > 0 ? pendingReqsCount : null, badgeType: 'apna-badge-info' },
        { id: 'purchase_requests', label: 'Equipment Purchase Requests', icon: DollarSign },
        { id: 'approvals', label: 'Approval Tracking', icon: CheckCircle2 },
        { id: 'dispatch', label: 'Office Dispatch & Records', icon: FolderOpen },
        { id: 'handover', label: 'Lab Handover Register', icon: FileCheck2 },
      ]
    },
    {
      title: 'G. REPORTS & ANALYTICS',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'report_attendance', label: 'Attendance Reports', icon: FileSpreadsheet },
        { id: 'report_utilization', label: 'Laboratory Utilization', icon: BarChart3 },
        { id: 'report_inventory', label: 'Inventory Consumption Reports', icon: Layers },
        { id: 'report_maintenance', label: 'Maintenance Reports', icon: Wrench },
        { id: 'report_completion', label: 'Practical Completion Reports', icon: FileCheck2 },
        { id: 'report_safety', label: 'Safety & Inspection Reports', icon: ShieldCheck },
      ]
    },
    {
      title: 'H. PERSONAL WORKSPACE',
      collapsible: true,
      defaultCollapsed: true,
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : null, badgeType: 'apna-badge-info' },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'help', label: 'Help & Documentation', icon: HelpCircle },
      ]
    }
  ];

  const getStaffHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Laboratory Operations & Staff Command',
          subtitle: `Active discipline: ${BRANCHES_CONFIG[currentBranch]?.name || currentBranch} · Campus Technical & Operational Support.`
        };
      case 'laboratories':
        return {
          title: 'My Laboratories & Workshop Facilities',
          subtitle: 'Operational status, bench capacities, equipment density, and lab in-charges.'
        };
      case 'timetable':
        return {
          title: 'Laboratory Timetable & Practical Turns',
          subtitle: 'Day, week, and list schedule views for autonomous engineering sessions.'
        };
      case 'sessions':
        return {
          title: 'Practical Session Management Console',
          subtitle: 'Equipment checkout, bench readiness checklists, and active session execution.'
        };
      case 'readiness':
        return {
          title: 'Pre-Session Laboratory Readiness Protocol',
          subtitle: 'Mandatory morning power, equipment, first aid, and cleanliness validation.'
        };
      case 'opening_closing':
        return {
          title: 'Laboratory Opening & Closing Register',
          subtitle: 'Key distribution, unsealing times, end-of-day power switch off, and locking signatures.'
        };
      case 'attendance':
      case 'take-attendance':
        return {
          title: 'Student Practical Attendance Roster',
          subtitle: 'Continuous practical session roll call, batch rosters, and CSV exports.'
        };
      case 'experiments':
        return {
          title: 'Curriculum Practical Experiment Catalog',
          subtitle: 'Syllabus-aligned experimental modules, apparatus requirements, and lab manuals.'
        };
      case 'batches':
        return {
          title: 'Practical Batch & Bench Allocations',
          subtitle: 'Student cohort divisions, timings, and assigned faculty instructors.'
        };
      case 'evaluation':
      case 'lab-evaluation':
        return {
          title: 'Continuous Practical Evaluation Rubrics',
          subtitle: 'Experimentation, viva voce, record work, and timeliness assessments.'
        };
      case 'completion_records':
        return {
          title: 'Practical Completion & Certification Ledger',
          subtitle: 'Semester practical experiment sign-offs for end-semester autonomous viva eligibility.'
        };
      case 'equipment':
        return {
          title: 'Laboratory Equipment & Asset Register',
          subtitle: 'Searchable master ledger with warranty, calibration schedules, and condition status.'
        };
      case 'issue_return':
        return {
          title: 'Equipment Custody, Issue & Return Log',
          subtitle: 'Active student, faculty, and research scholar apparatus loans and returns.'
        };
      case 'calibration':
        return {
          title: 'Apparatus Calibration & Metrology Register',
          subtitle: 'Traceable NABL / ISO-17025 verification dates and certificate repository.'
        };
      case 'inventory':
        return {
          title: 'Consumables & Laboratory Stock Inventory',
          subtitle: 'Stock balances, reorder points, batch codes, and chemical safety classifications.'
        };
      case 'stock_movement':
        return {
          title: 'Stock Movement & Transaction Ledger',
          subtitle: 'Audit log of material receipts, practical dispensations, and inventory adjustments.'
        };
      case 'stock_alerts':
        return {
          title: 'Critical Low Stock & Expiry Alerts',
          subtitle: 'Automated warnings for materials requiring immediate replenishment.'
        };
      case 'damaged_equipment':
        return {
          title: 'Damaged & Decommissioned Equipment Ledger',
          subtitle: 'Condemnation audit register and disposal/repair workflows.'
        };
      case 'maintenance':
      case 'tickets':
        return {
          title: 'Maintenance & Facility Work Orders',
          subtitle: 'Active support tickets, equipment repairs, priority levels, and technician assignments.'
        };
      case 'preventive_maint':
        return {
          title: 'Preventive Maintenance & AMC Schedules',
          subtitle: 'Periodic filter cleaning, UPS battery impedance testing, and service cycles.'
        };
      case 'inspection':
      case 'safety':
        return {
          title: 'Safety Compliance & Inspection Audits',
          subtitle: 'AICTE / Tier-1 safety checklist inspection certificates and findings.'
        };
      case 'incidents':
        return {
          title: 'Incident, Spill & Breakdown Register',
          subtitle: 'Statutory near-miss, chemical spill, and machine failure incident reporting.'
        };
      case 'requisitions':
        return {
          title: 'Consumable Requisitions & Indents',
          subtitle: 'Electronic purchase indents with multi-stage approval workflow.'
        };
      case 'purchase_requests':
        return {
          title: 'Equipment Purchase Proposals (Capex)',
          subtitle: 'High-value capital research equipment proposals and technical justifications.'
        };
      case 'approvals':
        return {
          title: 'Laboratory Approvals & Oversight Hub',
          subtitle: 'Consolidated approval queue for requisitions, work orders, and safety sign-offs.'
        };
      case 'dispatch':
      case 'clerical':
        return {
          title: 'Administrative Clerical Dispatch & Vault',
          subtitle: 'Inward university circulars, inspection notices, and outward dispatches.'
        };
      case 'handover':
        return {
          title: 'Laboratory Shift Handover Register',
          subtitle: 'Daily custody exchange, equipment status notes, and pending turn sign-offs.'
        };
      case 'report_attendance':
      case 'report-generation':
        return {
          title: 'Practical Attendance & Headcount Analytics',
          subtitle: 'Interactive charts and downloadable statistical attendance reports.'
        };
      case 'report_utilization':
        return {
          title: 'Laboratory Capacity & Bench Utilization',
          subtitle: 'Time slot occupancy rates and workbench load factor reports.'
        };
      case 'report_inventory':
        return {
          title: 'Consumables Consumption & Cost Ledger',
          subtitle: 'Material dispensation expenditure and batch consumption audit.'
        };
      case 'report_maintenance':
        return {
          title: 'Equipment Reliability & MTTR Reports',
          subtitle: 'Downtime tracking, breakdown frequencies, and resolution metrics.'
        };
      case 'report_completion':
        return {
          title: 'Semester Practical Completion Ledger',
          subtitle: 'Batch practical qualification status and certification rates.'
        };
      case 'report_safety':
        return {
          title: 'Institutional Safety Audit Reports',
          subtitle: 'Statutory compliance certificates and periodic safety scorecards.'
        };
      case 'notifications':
        return {
          title: 'Laboratory Alert & Notification Center',
          subtitle: 'Real-time alerts on timetable turns, low stock, and maintenance.'
        };
      case 'profile':
        return {
          title: 'Laboratory Staff Profile & Scope',
          subtitle: 'Personnel details, cadre, assigned laboratories, and reporting hierarchy.'
        };
      case 'help':
        return {
          title: 'Standard Operating Procedures & SOPs',
          subtitle: 'Department safety guidelines, chemical handling rules, and user documentation.'
        };
      case 'visitors':
        return {
          title: 'Campus Visitor Logs & Gate Passes',
          subtitle: 'Reception inward guest registry and security badges.'
        };
      default:
        return {
          title: (activeTab || 'Staff Portal').replace(/_/g, ' ').toUpperCase(),
          subtitle: 'Campus Operations & Laboratory Staff Management'
        };
    }
  };

  const staffHeading = getStaffHeading();

  // Create customized account object so Authorized Scope footer reflects demonstration profile
  const staffAccount = {
    ...account,
    role: 'staff',
    name: profile.name || account?.name || 'Mr. Biswajit Sahoo'
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
          animation: 'apna-fade-in 0.2s ease-out'
        }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Universal Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        initialAction={quickActionType}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setQuickActionOpen(false);
        }}
        onSuccessToast={triggerToast}
      />

      {/* Standard Enterprise AppLayout Shell */}
      <AppLayout
        account={staffAccount}
        portalName="Staff Portal"
        portalSubtitle="Campus Technical & Operational Support"
        portalHomeTab="dashboard"
        navSections={staffNavSections}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        pageTitle={staffHeading.title}
        pageSubtitle={staffHeading.subtitle}
        defaultSidebarOpen={true}
      >
        <div className="staff-portal-content-wrap" style={{ padding: '0 20px 40px', maxWidth: '1600px', margin: '0 auto' }}>
          {/* Universal Branch Selector & Active Lab Pill Bar */}
          <StaffBranchPill
            currentBranch={currentBranch}
            onSelectBranch={handleBranchChange}
            activeLabId={activeLabId}
            onSelectLab={handleLabChange}
            laboratories={laboratories}
            profile={profile}
            onToggleRole={handleToggleRole}
            onOpenQuickAction={() => handleOpenQuickAction('record-attendance')}
          />

          {/* ========================================================================= */}
          {/* SECTION A: DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <StaffDashboardTab
              currentBranch={currentBranch}
              activeLabId={activeLabId}
              profile={profile}
              laboratories={laboratories}
              timetable={timetable}
              equipment={equipment}
              consumables={consumables}
              maintenanceOrders={maintenanceOrders}
              requisitions={requisitions}
              safetyInspections={safetyInspections}
              onNavigateTab={setActiveTab}
              onOpenQuickAction={handleOpenQuickAction}
              onStartSession={(sessionId) => {
                labStaffStore.updateSessionStatus(sessionId, 'In-Progress');
                triggerToast('Session started and bench setup initialized!');
              }}
              onCompleteSession={(sessionId) => {
                labStaffStore.updateSessionStatus(sessionId, 'Completed');
                triggerToast('Session marked as Completed!');
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION B: LABORATORY OPERATIONS */}
          {/* ========================================================================= */}
          {(activeTab === 'laboratories' || activeTab === 'timetable' || activeTab === 'sessions' || activeTab === 'readiness' || activeTab === 'opening_closing') && (
            <LabOperationsTab
              subTab={
                activeTab === 'laboratories' ? 'my-labs' :
                activeTab === 'timetable' ? 'timetable' :
                activeTab === 'sessions' ? 'session-mgmt' :
                activeTab === 'readiness' ? 'readiness' : 'opening-closing'
              }
              currentBranch={currentBranch}
              activeLabId={activeLabId}
              profile={profile}
              laboratories={laboratories}
              timetable={timetable}
              equipment={equipment}
              onSuccessToast={triggerToast}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION C: ACADEMICS & ATTENDANCE */}
          {/* ========================================================================= */}
          {(activeTab === 'attendance' || activeTab === 'take-attendance' || activeTab === 'experiments' || activeTab === 'batches' || activeTab === 'evaluation' || activeTab === 'lab-evaluation' || activeTab === 'completion_records') && (
            <AcademicsAttendanceTab
              subTab={
                (activeTab === 'attendance' || activeTab === 'take-attendance') ? 'attendance' :
                activeTab === 'experiments' ? 'experiments' :
                activeTab === 'batches' ? 'batches' :
                (activeTab === 'evaluation' || activeTab === 'lab-evaluation') ? 'evaluations' : 'completion'
              }
              currentBranch={currentBranch}
              activeLabId={activeLabId}
              profile={profile}
              timetable={timetable}
              experiments={experiments}
              students={students}
              onSuccessToast={triggerToast}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION D: EQUIPMENT & INVENTORY */}
          {/* ========================================================================= */}
          {(activeTab === 'equipment' || activeTab === 'issue_return' || activeTab === 'calibration' || activeTab === 'inventory' || activeTab === 'stock_movement' || activeTab === 'stock_alerts' || activeTab === 'damaged_equipment') && (
            <EquipmentInventoryTab
              subTab={
                activeTab === 'equipment' ? 'register' :
                activeTab === 'issue_return' ? 'issue-return' :
                activeTab === 'calibration' ? 'calibration' :
                (activeTab === 'inventory' || activeTab === 'stock_alerts') ? 'inventory' :
                activeTab === 'stock_movement' ? 'movements' : 'damaged'
              }
              currentBranch={currentBranch}
              activeLabId={activeLabId}
              profile={profile}
              equipment={equipment}
              issueReturn={issueReturn}
              consumables={consumables}
              stockMovements={stockMovements}
              onSuccessToast={triggerToast}
              onOpenQuickAction={handleOpenQuickAction}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION E: MAINTENANCE & SAFETY */}
          {/* ========================================================================= */}
          {(activeTab === 'maintenance' || activeTab === 'tickets' || activeTab === 'preventive_maint' || activeTab === 'inspection' || activeTab === 'safety' || activeTab === 'incidents') && (
            <MaintenanceSafetyTab
              subTab={
                (activeTab === 'maintenance' || activeTab === 'tickets') ? 'work-orders' :
                activeTab === 'preventive_maint' ? 'preventive' :
                (activeTab === 'inspection' || activeTab === 'safety') ? 'safety-compliance' : 'incidents'
              }
              currentBranch={currentBranch}
              activeLabId={activeLabId}
              profile={profile}
              maintenanceOrders={maintenanceOrders}
              preventiveSchedule={preventiveSchedule}
              safetyInspections={safetyInspections}
              equipment={equipment}
              onSuccessToast={triggerToast}
              onOpenQuickAction={handleOpenQuickAction}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION F: REQUESTS & ADMINISTRATION */}
          {/* ========================================================================= */}
          {(activeTab === 'requisitions' || activeTab === 'purchase_requests' || activeTab === 'approvals' || activeTab === 'dispatch' || activeTab === 'clerical' || activeTab === 'handover') && (
            <RequestsAdminTab
              subTab={
                activeTab === 'requisitions' ? 'requisitions' :
                activeTab === 'purchase_requests' ? 'capex' :
                activeTab === 'approvals' ? 'requisitions' :
                (activeTab === 'dispatch' || activeTab === 'clerical') ? 'dispatch' : 'handover'
              }
              currentBranch={currentBranch}
              activeLabId={activeLabId}
              profile={profile}
              requisitions={requisitions}
              purchaseRequests={purchaseRequests}
              dispatchRecords={dispatchRecords}
              handovers={handovers}
              onSuccessToast={triggerToast}
              onOpenQuickAction={handleOpenQuickAction}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION G: REPORTS & ANALYTICS */}
          {/* ========================================================================= */}
          {(activeTab === 'report_attendance' || activeTab === 'report-generation' || activeTab === 'report_utilization' || activeTab === 'report_inventory' || activeTab === 'report_maintenance' || activeTab === 'report_completion' || activeTab === 'report_safety') && (
            <ReportsAnalyticsTab
              subTab={
                (activeTab === 'report_attendance' || activeTab === 'report-generation') ? 'attendance' :
                activeTab === 'report_utilization' ? 'utilization' :
                activeTab === 'report_inventory' ? 'consumption' :
                activeTab === 'report_maintenance' ? 'maintenance' : 'safety'
              }
              currentBranch={currentBranch}
              laboratories={laboratories}
              timetable={timetable}
              equipment={equipment}
              consumables={consumables}
              maintenanceOrders={maintenanceOrders}
              onSuccessToast={triggerToast}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION H: PERSONAL WORKSPACE */}
          {/* ========================================================================= */}
          {(activeTab === 'notifications' || activeTab === 'profile' || activeTab === 'help') && (
            <ProfileSettingsTab
              subTab={activeTab}
              profile={profile}
              currentBranch={currentBranch}
              notifications={notifications}
              onSuccessToast={triggerToast}
              onSwitchBranch={handleBranchChange}
            />
          )}

          {/* Visitor Logs (Preserved for backward compatibility) */}
          {activeTab === 'visitors' && (
            <div className="erp-panel" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div className="erp-panel-header" style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Reception Desk &amp; Campus Visitor Gate Passes</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Inward guest registry and campus security badge allocations</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '12px 14px' }}>Gate Pass ID</th>
                      <th style={{ padding: '12px 14px' }}>Guest Name</th>
                      <th style={{ padding: '12px 14px' }}>Organization</th>
                      <th style={{ padding: '12px 14px' }}>Purpose</th>
                      <th style={{ padding: '12px 14px' }}>Phone</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'VIS-901', name: 'Mr. Arvind Krishnan', org: 'Cognizant Campus Team', purpose: 'Campus Drive Coordination', phone: '+91 98450 11200', status: 'Inside Campus (Badge #04)' },
                      { id: 'VIS-902', name: 'Dr. R. C. Mohanty', org: 'AICTE / BPUT Inspector', purpose: 'Autonomy Annual Inspection', phone: '+91 94371 44550', status: 'Inside Campus (Badge #01)' },
                      { id: 'VIS-903', name: 'Mr. Rajesh Jena', org: 'Voltas HVAC Services', purpose: 'Central AC Maintenance', phone: '+91 94378 22114', status: 'Departed' }
                    ].map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{v.id}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{v.name}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{v.org}</td>
                        <td style={{ padding: '12px 14px', color: '#1e293b' }}>{v.purpose}</td>
                        <td style={{ padding: '12px 14px', color: '#0284c7', fontWeight: 600 }}>{v.phone}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            color: v.status.includes('Inside') ? '#16a34a' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
