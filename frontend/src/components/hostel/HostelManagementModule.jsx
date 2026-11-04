import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building,
  Home,
  Users,
  GraduationCap,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Clock,
  Bed,
  CalendarDays,
  CheckCircle2,
  Wrench,
  Sparkles,
  ShieldCheck,
  Layers,
  UsersRound,
  Utensils,
  CreditCard,
  Settings,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  X,
  Check,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Filter,
  Phone,
  Mail,
  ShieldAlert,
  UserCheck,
  CalendarCheck,
  UserPlus
} from 'lucide-react';

// Store & API
import {
  getAllWardens,
  saveWarden,
  addNewWarden,
  deleteWarden,
  setWardenDutyStatus,
  setWardenAccountStatus,
  syncWardensFromBackend
} from '../../services/wardenManagementStore.js';
import { api } from '../../services/api.js';
import { initialWardens } from '../../data/collegeData.js';
import { getAllStaffLeaves, evaluateAllWardensDutyStatus } from '../../services/hostelStaffLeaveStore.js';
import { getAllHostels } from '../../services/hostelAttendanceStore.js';

// Styles
import '../AdminPortal.css';
import './HostelModules.css';
import './admin/WardenManagement.css';
import './HostelExtraSections.css';
import './HostelManagementModule.css';

// Subcomponents from Hostel Admin
import HostelAdminDashboard from './admin/HostelAdminDashboard.jsx';
import ManageHostelsSection from './ManageHostelsSection.jsx';
import RoomAllotmentSection from './RoomAllotmentSection.jsx';
import HostelLeaveSection from './HostelLeaveSection.jsx';
import HostelAttendanceSection from './HostelAttendanceSection.jsx';
import HostelAdminAttendanceVerification from './admin/HostelAdminAttendanceVerification.jsx';
import HostelMaintenanceSection from './HostelMaintenanceSection.jsx';
import HostelCleanlinessManagementSection from './HostelCleanlinessManagementSection.jsx';
import HostelMessSection from './HostelMessSection.jsx';
import HostelInventorySection from './HostelInventorySection.jsx';
import HostelStaffSection from './HostelStaffSection.jsx';
import HostelFeesSection from './HostelFeesSection.jsx';
import HostelSettingsRulesSection from './HostelSettingsRulesSection.jsx';
import HostelAdminApprovalCenter from './admin/HostelAdminApprovalCenter.jsx';
import HostelDisciplinarySection from './HostelDisciplinarySection.jsx';
import HostelEmergencyIncidentsSection from './HostelEmergencyIncidentsSection.jsx';
import HostelEmergencyContactsSection from './HostelEmergencyContactsSection.jsx';
import HostelAdminAuditLogs from './admin/HostelAdminAuditLogs.jsx';
import ReportGenerationModule from '../ReportGenerationModule.jsx';
import WardenEmployeeProfile from './WardenEmployeeProfile.jsx';
import WardenPendingTasksModal from './admin/WardenPendingTasksModal.jsx';
import AddNewWardenSection from './admin/AddNewWardenSection.jsx';

/**
 * Normalizes and merges wardens between collegeData and wardenManagementStore
 */
function normalizeWardensList() {
  try {
    const storeWardens = Array.isArray(getAllWardens()) ? getAllWardens() : [];
    const staffLeaves = Array.isArray(getAllStaffLeaves()) ? getAllStaffLeaves() : [];
    const today = new Date().toISOString().split('T')[0];

    const map = new Map();

    // 1. Seed with initialWardens (the 4 from the screenshot)
    if (Array.isArray(initialWardens)) {
      initialWardens.forEach(w => {
        if (!w || !w.id) return;
        map.set(w.id, {
          id: String(w.id),
          name: String(w.name || 'Warden'),
          gender: w.gender || (String(w.hostelCategory || '').includes('Girls') ? 'Female' : 'Male'),
          hostelCategory: w.hostelCategory || 'Boys Hostel',
          assignedHostel: w.assignedHostel || 'Gandhi Boys Residence (Hostel 1)',
          roomOffice: w.roomOffice || 'Ground Floor, Warden Office A-01',
          shift: w.shift || '24x7 Resident Duty',
          phone: String(w.phone || '+91 94370 11223'),
          email: String(w.email || 'warden@apnacampus.edu.in'),
          residentsCount: Number(w.residentsCount || 160),
          totalBeds: Number(w.totalBeds || 180),
          status: w.status || 'Active',
          dutyStatus: w.dutyStatus || (w.status === 'On Leave' ? 'On Leave' : 'On Duty'),
          joiningYear: String(w.joiningYear || '2024')
        });
      });
    }

    // 2. Merge storeWardens
    storeWardens.forEach(sw => {
      if (!sw) return;
      const swId = sw.id ? String(sw.id) : null;
      const swName = String(sw.name || '').trim();

      const existingKey = Array.from(map.keys()).find(k => {
        const item = map.get(k);
        const itemName = String(item?.name || '').trim();
        return (swId && k === swId) || (swName && itemName && itemName.toLowerCase() === swName.toLowerCase());
      });

      const isGirls = (String(sw.designation || '') + ' ' + String(sw.hostelName || '') + ' ' + String(sw.hostelCategory || '')).toLowerCase().includes('girl');

      let activeStatus = sw.accountStatus === 'Active' ? 'Active' : (sw.accountStatus || 'Active');
      let dutySt = sw.dutyStatus || 'On Duty';

      // Check if on leave in staffLeaves
      const hasActiveLeave = staffLeaves.some(l => {
        if (!l) return false;
        const matchWarden = (swId && l.wardenId === swId) || (existingKey && l.wardenId === existingKey) || (l.applicantName && swName && String(l.applicantName).toLowerCase().includes(swName.toLowerCase()));
        const isApproved = String(l.status || '').toUpperCase() === 'APPROVED';
        const inDateRange = (!l.startDate || l.startDate <= today) && (!l.endDate || l.endDate >= today);
        return matchWarden && isApproved && inDateRange;
      });

      if (hasActiveLeave) {
        activeStatus = 'On Leave';
        dutySt = 'On Leave';
      }

      const effectiveId = swId || existingKey || (isGirls ? `WRD-G0${map.size + 1}` : `WRD-B0${map.size + 1}`);

      const mergedItem = {
        id: effectiveId,
        name: swName || 'Warden',
        gender: sw.gender || (isGirls ? 'Female' : 'Male'),
        hostelCategory: sw.hostelCategory || (isGirls ? 'Girls Hostel' : 'Boys Hostel'),
        assignedHostel: sw.assignedHostel || sw.hostelName || 'Gandhi Boys Residence',
        roomOffice: sw.roomOffice || sw.assignedCabin || 'Warden Office Station',
        shift: sw.shift || sw.dutyShift || '24x7 Resident Duty',
        phone: String(sw.phone || sw.mobileNo || '+91 94370 11223'),
        email: String(sw.email || sw.emailId || 'warden@apnacampus.edu.in'),
        residentsCount: Number(sw.residentsCount || sw.activeResidentsCount || 150),
        totalBeds: Number(sw.totalBeds || sw.totalBedsSupervised || 180),
        status: activeStatus,
        dutyStatus: dutySt,
        joiningYear: sw.joiningDate ? String(sw.joiningDate).slice(0, 4) : '2024',
        pendingTasks: Number(sw.pendingTasks || 0)
      };

      if (existingKey) {
        map.set(existingKey, { ...map.get(existingKey), ...mergedItem, id: existingKey });
      } else {
        map.set(effectiveId, mergedItem);
      }
    });

    return Array.from(map.values());
  } catch (err) {
    console.warn('normalizeWardensList fallback:', err);
    return Array.isArray(initialWardens) ? initialWardens : [];
  }
}

export default function HostelManagementModule({
  account,
  userRole = 'ADMIN',
  initialTab = 'wardens',
  showToast: propShowToast
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg) => {
    if (propShowToast) {
      propShowToast(msg);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3500);
    }
  }, [propShowToast]);

  // Wardens state
  const [wardenList, setWardenList] = useState(() => normalizeWardensList());
  const [wardenSearch, setWardenSearch] = useState('');
  const [wardenCategoryFilter, setWardenCategoryFilter] = useState('All'); // 'All', 'Boys Hostel', 'Girls Hostel'
  const [wardenStatusFilter, setWardenStatusFilter] = useState('All'); // 'All', 'Active', 'On Leave', 'Inactive'

  // Modals state
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedWarden, setSelectedWarden] = useState(null);
  const [viewingProfileWardenId, setViewingProfileWardenId] = useState(null);
  const [viewingPendingTasksWarden, setViewingPendingTasksWarden] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    hostelCategory: 'Boys Hostel',
    assignedHostel: 'Gandhi Boys Residence (Hostel 1)',
    roomOffice: 'Ground Floor, Warden Office A-01',
    shift: '24x7 Resident Duty',
    phone: '+91 94370 11223',
    email: 'warden.new@apnacampus.edu.in',
    residentsCount: 160,
    totalBeds: 180,
    status: 'Active',
    dutyStatus: 'On Duty'
  });

  // Re-sync wardens whenever leaves or warden store updates
  const refreshWardens = useCallback(() => {
    setWardenList(normalizeWardensList());
  }, []);

  useEffect(() => {
    syncWardensFromBackend().then(() => {
      refreshWardens();
    }).catch(err => console.warn('Warden backend sync fallback:', err?.message || err));

    window.addEventListener('bput_wardens_updated', refreshWardens);
    window.addEventListener('bput_staff_leaves_updated', refreshWardens);
    window.addEventListener('storage', refreshWardens);

    return () => {
      window.removeEventListener('bput_wardens_updated', refreshWardens);
      window.removeEventListener('bput_staff_leaves_updated', refreshWardens);
      window.removeEventListener('storage', refreshWardens);
    };
  }, [refreshWardens]);

  // KPI Calculations
  const stats = useMemo(() => {
    const list = Array.isArray(wardenList) ? wardenList : [];
    const total = list.length;
    const boys = list.filter(w => w && w.hostelCategory === 'Boys Hostel').length;
    const girls = list.filter(w => w && w.hostelCategory === 'Girls Hostel').length;
    const residents = list.reduce((acc, curr) => acc + Number(curr?.residentsCount || 0), 0);
    const active = list.filter(w => w && w.status === 'Active').length;
    const onLeave = list.filter(w => w && (w.status === 'On Leave' || w.dutyStatus === 'On Leave')).length;
    return { total, boys, girls, residents, active, onLeave };
  }, [wardenList]);

  // Filtered wardens
  const filteredWardens = useMemo(() => {
    const list = Array.isArray(wardenList) ? wardenList : [];
    const q = String(wardenSearch || '').toLowerCase().trim();
    return list.filter(w => {
      if (!w) return false;
      const name = String(w.name || '').toLowerCase();
      const id = String(w.id || '').toLowerCase();
      const hostel = String(w.assignedHostel || '').toLowerCase();
      const phone = String(w.phone || '');
      const email = String(w.email || '').toLowerCase();

      const matchSearch =
        !q ||
        name.includes(q) ||
        id.includes(q) ||
        hostel.includes(q) ||
        phone.includes(q) ||
        email.includes(q);

      const matchCategory =
        wardenCategoryFilter === 'All' || w.hostelCategory === wardenCategoryFilter;

      const matchStatus =
        wardenStatusFilter === 'All' || w.status === wardenStatusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [wardenList, wardenSearch, wardenCategoryFilter, wardenStatusFilter]);

  // Handlers for Appoint / Edit / Delete
  const handleOpenAppoint = () => {
    const prefix = 'WRD-B';
    setFormData({
      name: '',
      gender: 'Male',
      hostelCategory: 'Boys Hostel',
      assignedHostel: 'Gandhi Boys Residence (Hostel 1)',
      roomOffice: 'Ground Floor, Warden Office A-01',
      shift: '24x7 Resident Duty',
      phone: '+91 94370 11223',
      email: 'warden.new@apnacampus.edu.in',
      residentsCount: 160,
      totalBeds: 180,
      status: 'Active',
      dutyStatus: 'On Duty'
    });
    setSelectedWarden(null);
    setIsAppointModalOpen(true);
  };

  const handleOpenEdit = (w) => {
    setSelectedWarden(w);
    setFormData({ ...w });
    setIsEditModalOpen(true);
  };

  const handleOpenReassign = (w) => {
    setSelectedWarden(w);
    setFormData({ ...w });
    setIsReassignModalOpen(true);
  };

  const handleSaveAppoint = (e) => {
    e.preventDefault();
    const isGirls = formData.hostelCategory === 'Girls Hostel';
    const prefix = isGirls ? 'WRD-G' : 'WRD-B';
    const num = wardenList.filter(w => w.hostelCategory === formData.hostelCategory).length + 1;
    const newId = `${prefix}0${num}`;

    const newWarden = {
      ...formData,
      id: newId,
      employeeId: newId,
      assignedBlocks: ['Ground & 1st Floor'],
      dutyShift: formData.shift,
      accountStatus: formData.status,
      dutyStatus: formData.status === 'On Leave' ? 'On Leave' : 'On Duty'
    };

    addNewWarden(newWarden);
    api.createWarden(newWarden, account).catch(err => console.warn('Backend create warden sync:', err));

    refreshWardens();
    setIsAppointModalOpen(false);
    showToast(`✓ Hostel Warden ${newWarden.name} (${newId}) appointed successfully!`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedWarden) return;

    const updated = {
      ...selectedWarden,
      ...formData,
      accountStatus: formData.status,
      dutyStatus: formData.status === 'On Leave' ? 'On Leave' : 'On Duty'
    };

    saveWarden(updated);
    api.updateWardenProfile(updated.id, updated).catch(err => console.warn('Backend edit warden sync:', err));

    refreshWardens();
    setIsEditModalOpen(false);
    showToast(`✓ Warden ${updated.name} details updated.`);
  };

  const handleSaveReassign = (e) => {
    e.preventDefault();
    if (!selectedWarden) return;

    const updated = {
      ...selectedWarden,
      assignedHostel: formData.assignedHostel,
      hostelName: formData.assignedHostel,
      roomOffice: formData.roomOffice,
      shift: formData.shift,
      dutyShift: formData.shift
    };

    saveWarden(updated);
    api.updateWardenProfile(updated.id, updated).catch(err => console.warn('Backend reassign sync:', err));

    refreshWardens();
    setIsReassignModalOpen(false);
    showToast(`✓ Warden ${updated.name} assigned to ${formData.assignedHostel}.`);
  };

  const handleDeleteWarden = (w) => {
    if (window.confirm(`Are you sure you want to remove warden ${w.name} (${w.id})? This will unassign them from ${w.assignedHostel}.`)) {
      deleteWarden(w.id);
      api.deleteWarden(w.id).catch(err => console.warn('Backend delete warden sync:', err));
      refreshWardens();
      showToast(`Warden ${w.name} removed from active roster.`);
    }
  };

  const handleToggleDutyStatus = (w) => {
    const nextStatus = w.status === 'Active' ? 'On Leave' : 'Active';
    const nextDuty = nextStatus === 'On Leave' ? 'On Leave' : 'On Duty';

    setWardenDutyStatus(w.id, nextDuty);
    const updated = { ...w, status: nextStatus, dutyStatus: nextDuty };
    saveWarden(updated);
    refreshWardens();
    showToast(`Warden ${w.name} status updated to: ${nextStatus}.`);
  };

  // Subtabs configuration
  const SUBTABS = [
    { id: 'wardens', label: 'Hostel Wardens', icon: Home, badge: stats.total },
    { id: 'dashboard', label: 'Executive Console', icon: Building },
    { id: 'manage-hostels', label: 'Buildings & Blocks', icon: Layers },
    { id: 'room-allotment', label: 'Room Allotment', icon: Bed },
    { id: 'resident-leaves-admin', label: 'Student Leaves', icon: CalendarDays },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'attendance-verification', label: 'Biometric Overrides', icon: CheckCircle2 },
    { id: 'complaints', label: 'Maintenance SLA', icon: Wrench },
    { id: 'cleanliness-complaints', label: 'Cleanliness SLA', icon: Sparkles },
    { id: 'mess-dining', label: 'Mess & Food', icon: Utensils },
    { id: 'inventory-assets', label: 'Inventory & Assets', icon: Layers },
    { id: 'staff-mgmt', label: 'Staff Roster', icon: UsersRound },
    { id: 'fees-dues', label: 'Fee Ledger', icon: CreditCard },
    { id: 'settings-rules', label: 'Rules & Curfew', icon: Settings },
    { id: 'approval-center', label: 'Approval Center', icon: CheckCircle2 },
    { id: 'disciplinary', label: 'Discipline', icon: AlertTriangle },
    { id: 'emergency-contacts', label: 'Emergency Safety', icon: ShieldAlert },
    { id: 'report-generation', label: 'Reports', icon: FileSpreadsheet },
    { id: 'audit-logs', label: 'Audit Trail', icon: FileText }
  ];

  return (
    <div className="hostel-mgmt-container">
      {/* Toast alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-navigation Strip for all Hostel Modules */}
      <div className="hostel-mgmt-nav-bar">
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`hostel-mgmt-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setViewingProfileWardenId(null);
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="hostel-mgmt-tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW WARDEN EMPLOYEE PROFILE (When profile eye icon clicked) */}
      {viewingProfileWardenId && (
        <div className="admin-card" style={{ padding: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} color="#2563eb" />
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                Warden Employee Dossier &amp; Credentials (#{viewingProfileWardenId})
              </strong>
            </div>
            <button
              className="admin-action-btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setViewingProfileWardenId(null)}
            >
              ← Back to Wardens Directory
            </button>
          </div>
          <div style={{ padding: '1rem' }}>
            <WardenEmployeeProfile
              account={account}
              wardenId={viewingProfileWardenId}
              onBack={() => setViewingProfileWardenId(null)}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: HOSTEL WARDENS ADMINISTRATION (SCREENSHOT REPLICA)      */}
      {/* ============================================================== */}
      {!viewingProfileWardenId && activeTab === 'wardens' && (
        <div>
          {/* Header */}
          <div className="admin-view-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Hostel Wardens Administration</h2>
                <span className="office-supervision-badge">
                  {userRole === 'SUPER_ADMIN' ? 'SUPER ADMIN SUPERVISION' : 'OFFICE SUPERVISION'}
                </span>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Supervise residential hostel administration, student welfare, room allocation, and night curfew enforcement.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button className="admin-action-btn-primary" onClick={handleOpenAppoint}>
                <Plus size={15} /> Appoint Hostel Warden
              </button>
            </div>
          </div>

          {/* KPI Cards (Matches Reference Screenshot) */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <div className="admin-kpi-card-header">
                <span className="admin-kpi-label">Total Wardens</span>
                <div className="admin-kpi-card-icon purple"><Home size={18} /></div>
              </div>
              <div className="admin-kpi-val">{stats.total}</div>
              <small style={{ color: '#64748b' }}>Residential staff appointed</small>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-card-header">
                <span className="admin-kpi-label">Boys Hostel Wardens</span>
                <div className="admin-kpi-card-icon blue"><Users size={18} /></div>
              </div>
              <div className="admin-kpi-val">{stats.boys}</div>
              <small style={{ color: '#1d4ed8', fontWeight: 600 }}>Gandhi &amp; Kalam Residences</small>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-card-header">
                <span className="admin-kpi-label">Girls Hostel Wardens</span>
                <div className="admin-kpi-card-icon rose"><Users size={18} /></div>
              </div>
              <div className="admin-kpi-val">{stats.girls}</div>
              <small style={{ color: '#be185d', fontWeight: 600 }}>Sarojini &amp; Kalpana Residences</small>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-card-header">
                <span className="admin-kpi-label">Total Residents Supervised</span>
                <div className="admin-kpi-card-icon emerald"><GraduationCap size={18} /></div>
              </div>
              <div className="admin-kpi-val">{stats.residents}</div>
              <small style={{ color: '#059669', fontWeight: 600 }}>Across 4 Hostels</small>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div className="admin-toolbar" style={{ margin: 0, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="admin-search-wrap" style={{ flex: '1 1 320px', minWidth: '260px' }}>
                <Search size={16} />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search warden name, assigned hostel, phone..."
                  value={wardenSearch}
                  onChange={(e) => setWardenSearch(e.target.value)}
                />
              </div>

              <div className="admin-filters-wrap" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div className="admin-filter-pills">
                  <button
                    className={`admin-filter-pill-btn ${wardenCategoryFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setWardenCategoryFilter('All')}
                  >
                    All Wardens ({stats.total})
                  </button>
                  <button
                    className={`admin-filter-pill-btn ${wardenCategoryFilter === 'Boys Hostel' ? 'active' : ''}`}
                    onClick={() => setWardenCategoryFilter('Boys Hostel')}
                  >
                    <span style={{ color: '#1d4ed8' }}>●</span> Boys Hostel ({stats.boys})
                  </button>
                  <button
                    className={`admin-filter-pill-btn ${wardenCategoryFilter === 'Girls Hostel' ? 'active' : ''}`}
                    onClick={() => setWardenCategoryFilter('Girls Hostel')}
                  >
                    <span style={{ color: '#be185d' }}>●</span> Girls Hostel ({stats.girls})
                  </button>
                </div>

                <div className="admin-filter-pills">
                  <button
                    className={`admin-filter-pill-btn ${wardenStatusFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setWardenStatusFilter('All')}
                  >
                    All Status
                  </button>
                  <button
                    className={`admin-filter-pill-btn ${wardenStatusFilter === 'Active' ? 'active' : ''}`}
                    onClick={() => setWardenStatusFilter('Active')}
                  >
                    <span style={{ color: '#10b981' }}>●</span> Active ({stats.active})
                  </button>
                  <button
                    className={`admin-filter-pill-btn ${wardenStatusFilter === 'On Leave' ? 'active' : ''}`}
                    onClick={() => setWardenStatusFilter('On Leave')}
                  >
                    <span style={{ color: '#f59e0b' }}>●</span> On Leave ({stats.onLeave})
                  </button>
                </div>

                {(wardenSearch || wardenCategoryFilter !== 'All' || wardenStatusFilter !== 'All') && (
                  <button
                    className="admin-action-btn-secondary"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      setWardenSearch('');
                      setWardenCategoryFilter('All');
                      setWardenStatusFilter('All');
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Wardens Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Warden ID</th>
                  <th>Warden Name</th>
                  <th>Hostel Category</th>
                  <th>Assigned Residence</th>
                  <th>Office / Cabin</th>
                  <th>Duty Schedule</th>
                  <th>Contact Phone &amp; Email</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWardens.map(w => {
                  const isGirls = w.hostelCategory === 'Girls Hostel';
                  const isOnLeave = w.status === 'On Leave' || w.dutyStatus === 'On Leave';

                  return (
                    <tr key={w.id}>
                      <td><strong>{w.id}</strong></td>
                      <td style={{ fontWeight: 600 }}>
                        <div
                          style={{ cursor: 'pointer', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => setViewingProfileWardenId(w.id)}
                          title="Click to view full employee profile"
                        >
                          <span>{w.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${isGirls ? 'girls' : 'boys'}`}>
                          {w.hostelCategory}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#1e293b' }}>{w.assignedHostel}</td>
                      <td style={{ color: '#64748b' }}>{w.roomOffice}</td>
                      <td>
                        <span style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: '#475569'
                        }}>
                          {w.shift}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{w.phone}</div>
                        <small style={{ color: '#64748b' }}>{w.email}</small>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#059669' }}>{w.residentsCount}</span>
                        <span style={{ color: '#64748b', fontWeight: 500 }}> / {w.totalBeds} beds</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${isOnLeave ? 'amber' : (w.status === 'Active' ? 'active' : 'inactive')}`}>
                          {isOnLeave ? 'On Leave' : w.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                          <button
                            className="admin-table-action-btn"
                            title="View Warden CMS Profile"
                            onClick={() => setViewingProfileWardenId(w.id)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="admin-table-action-btn"
                            title="Edit Warden Details"
                            onClick={() => handleOpenEdit(w)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="admin-table-action-btn"
                            title="Reassign Hostel Complex"
                            onClick={() => handleOpenReassign(w)}
                          >
                            <Building size={15} />
                          </button>
                          <button
                            className="admin-table-action-btn"
                            title={isOnLeave ? 'Mark Warden On Duty' : 'Mark Warden On Leave'}
                            onClick={() => handleToggleDutyStatus(w)}
                          >
                            {isOnLeave ? <Check size={15} color="#10b981" /> : <Clock size={15} color="#f59e0b" />}
                          </button>
                          <button
                            className="admin-table-action-btn delete"
                            title="Remove Warden"
                            onClick={() => handleDeleteWarden(w)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredWardens.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No wardens found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* OTHER REUSED HOSTEL ADMIN MODULES                              */}
      {/* ============================================================== */}
      {!viewingProfileWardenId && activeTab === 'dashboard' && (
        <HostelAdminDashboard
          account={account}
          onNavigateTab={setActiveTab}
          showToast={showToast}
        />
      )}

      {!viewingProfileWardenId && activeTab === 'manage-hostels' && (
        <ManageHostelsSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'room-allotment' && (
        <RoomAllotmentSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'resident-leaves-admin' && (
        <HostelLeaveSection
          account={account}
          isHostelAdmin={true}
          onNavigateApplyLeave={() => setActiveTab('resident-leaves-admin')}
        />
      )}

      {!viewingProfileWardenId && activeTab === 'attendance' && (
        <HostelAttendanceSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'attendance-verification' && (
        <HostelAdminAttendanceVerification account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'complaints' && (
        <HostelMaintenanceSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'cleanliness-complaints' && (
        <HostelCleanlinessManagementSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'mess-dining' && (
        <HostelMessSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'inventory-assets' && (
        <HostelInventorySection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'staff-mgmt' && (
        <HostelStaffSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'fees-dues' && (
        <HostelFeesSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'settings-rules' && (
        <HostelSettingsRulesSection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'approval-center' && (
        <HostelAdminApprovalCenter account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'disciplinary' && (
        <HostelDisciplinarySection account={account} />
      )}

      {!viewingProfileWardenId && activeTab === 'emergency-contacts' && (
        <div>
          <HostelEmergencyContactsSection account={account} />
          <div style={{ marginTop: '1.5rem' }}>
            <HostelEmergencyIncidentsSection account={account} />
          </div>
        </div>
      )}

      {!viewingProfileWardenId && activeTab === 'report-generation' && (
        <ReportGenerationModule account={account} userRole={userRole} />
      )}

      {!viewingProfileWardenId && activeTab === 'audit-logs' && (
        <HostelAdminAuditLogs account={account} />
      )}

      {/* ============================================================== */}
      {/* MODAL: APPOINT HOSTEL WARDEN                                   */}
      {/* ============================================================== */}
      {isAppointModalOpen && (
        <div className="hostel-modal-overlay">
          <div className="hostel-modal-card">
            <div className="hostel-modal-header">
              <div>
                <h3>Appoint New Hostel Warden</h3>
                <p>Register official residential life staff, assign complexes, and establish duty shifts.</p>
              </div>
              <button
                className="admin-table-action-btn"
                onClick={() => setIsAppointModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAppoint}>
              <div className="hostel-modal-body">
                <div className="hostel-form-grid">
                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="hostel-form-input"
                      placeholder="e.g. Dr. Rajesh Jena"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Hostel Category *</label>
                    <select
                      className="hostel-form-select"
                      value={formData.hostelCategory}
                      onChange={e => setFormData({ ...formData, hostelCategory: e.target.value })}
                    >
                      <option value="Boys Hostel">Boys Hostel</option>
                      <option value="Girls Hostel">Girls Hostel</option>
                    </select>
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Assigned Residence *</label>
                    <select
                      className="hostel-form-select"
                      value={formData.assignedHostel}
                      onChange={e => setFormData({ ...formData, assignedHostel: e.target.value })}
                    >
                      <option value="Gandhi Boys Residence (Hostel 1)">Gandhi Boys Residence (Hostel 1)</option>
                      <option value="Kalam Boys Residence (Hostel 2)">Kalam Boys Residence (Hostel 2)</option>
                      <option value="Sarojini Girls Residence (Hostel 1)">Sarojini Girls Residence (Hostel 1)</option>
                      <option value="Kalpana Chawla Girls Residence (Hostel 2)">Kalpana Chawla Girls Residence (Hostel 2)</option>
                    </select>
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Office / Cabin *</label>
                    <input
                      type="text"
                      required
                      className="hostel-form-input"
                      placeholder="e.g. Ground Floor, Warden Office A-01"
                      value={formData.roomOffice}
                      onChange={e => setFormData({ ...formData, roomOffice: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Duty Schedule / Shift *</label>
                    <select
                      className="hostel-form-select"
                      value={formData.shift}
                      onChange={e => setFormData({ ...formData, shift: e.target.value })}
                    >
                      <option value="24x7 Resident Duty">24x7 Resident Duty</option>
                      <option value="Day Shift (08:00 AM - 08:00 PM)">Day Shift (08:00 AM - 08:00 PM)</option>
                      <option value="Evening & Night Shift (04:00 PM - 08:00 AM)">Evening & Night Shift (04:00 PM - 08:00 AM)</option>
                      <option value="Night Relief Shift (08:00 PM - 06:00 AM)">Night Relief Shift (08:00 PM - 06:00 AM)</option>
                    </select>
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Phone Contact *</label>
                    <input
                      type="text"
                      required
                      className="hostel-form-input"
                      placeholder="+91 94370 11223"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Official Email *</label>
                    <input
                      type="email"
                      required
                      className="hostel-form-input"
                      placeholder="warden@apnacampus.edu.in"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Total Bed Capacity</label>
                    <input
                      type="number"
                      className="hostel-form-input"
                      value={formData.totalBeds}
                      onChange={e => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="hostel-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setIsAppointModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Appoint Warden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT WARDEN DETAILS                                     */}
      {/* ============================================================== */}
      {isEditModalOpen && selectedWarden && (
        <div className="hostel-modal-overlay">
          <div className="hostel-modal-card">
            <div className="hostel-modal-header">
              <div>
                <h3>Edit Warden Profile: {selectedWarden.name}</h3>
                <p>Update contact information, assigned residence, and office cabin.</p>
              </div>
              <button
                className="admin-table-action-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="hostel-modal-body">
                <div className="hostel-form-grid">
                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="hostel-form-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Hostel Category *</label>
                    <select
                      className="hostel-form-select"
                      value={formData.hostelCategory}
                      onChange={e => setFormData({ ...formData, hostelCategory: e.target.value })}
                    >
                      <option value="Boys Hostel">Boys Hostel</option>
                      <option value="Girls Hostel">Girls Hostel</option>
                    </select>
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Assigned Residence *</label>
                    <select
                      className="hostel-form-select"
                      value={formData.assignedHostel}
                      onChange={e => setFormData({ ...formData, assignedHostel: e.target.value })}
                    >
                      <option value="Gandhi Boys Residence (Hostel 1)">Gandhi Boys Residence (Hostel 1)</option>
                      <option value="Kalam Boys Residence (Hostel 2)">Kalam Boys Residence (Hostel 2)</option>
                      <option value="Sarojini Girls Residence (Hostel 1)">Sarojini Girls Residence (Hostel 1)</option>
                      <option value="Kalpana Chawla Girls Residence (Hostel 2)">Kalpana Chawla Girls Residence (Hostel 2)</option>
                    </select>
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Office / Cabin</label>
                    <input
                      type="text"
                      className="hostel-form-input"
                      value={formData.roomOffice}
                      onChange={e => setFormData({ ...formData, roomOffice: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Duty Schedule</label>
                    <select
                      className="hostel-form-select"
                      value={formData.shift}
                      onChange={e => setFormData({ ...formData, shift: e.target.value })}
                    >
                      <option value="24x7 Resident Duty">24x7 Resident Duty</option>
                      <option value="Day Shift (08:00 AM - 08:00 PM)">Day Shift (08:00 AM - 08:00 PM)</option>
                      <option value="Evening & Night Shift (04:00 PM - 08:00 AM)">Evening & Night Shift (04:00 PM - 08:00 AM)</option>
                      <option value="Night Relief Shift (08:00 PM - 06:00 AM)">Night Relief Shift (08:00 PM - 06:00 AM)</option>
                    </select>
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Phone Contact</label>
                    <input
                      type="text"
                      className="hostel-form-input"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Official Email</label>
                    <input
                      type="email"
                      className="hostel-form-input"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Account Status</label>
                    <select
                      className="hostel-form-select"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="hostel-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REASSIGN HOSTEL & DUTY                                  */}
      {/* ============================================================== */}
      {isReassignModalOpen && selectedWarden && (
        <div className="hostel-modal-overlay">
          <div className="hostel-modal-card" style={{ maxWidth: '520px' }}>
            <div className="hostel-modal-header">
              <div>
                <h3>Reassign Hostel Complex: {selectedWarden.name}</h3>
                <p>Transfer residential supervision to another campus hostel block.</p>
              </div>
              <button
                className="admin-table-action-btn"
                onClick={() => setIsReassignModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReassign}>
              <div className="hostel-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Target Hostel Complex *</label>
                    <select
                      className="hostel-form-select"
                      value={formData.assignedHostel}
                      onChange={e => setFormData({ ...formData, assignedHostel: e.target.value })}
                    >
                      <option value="Gandhi Boys Residence (Hostel 1)">Gandhi Boys Residence (Hostel 1)</option>
                      <option value="Kalam Boys Residence (Hostel 2)">Kalam Boys Residence (Hostel 2)</option>
                      <option value="Sarojini Girls Residence (Hostel 1)">Sarojini Girls Residence (Hostel 1)</option>
                      <option value="Kalpana Chawla Girls Residence (Hostel 2)">Kalpana Chawla Girls Residence (Hostel 2)</option>
                    </select>
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">New Office / Cabin Station</label>
                    <input
                      type="text"
                      className="hostel-form-input"
                      value={formData.roomOffice}
                      onChange={e => setFormData({ ...formData, roomOffice: e.target.value })}
                    />
                  </div>

                  <div className="hostel-form-group">
                    <label className="hostel-form-label">Duty Shift Schedule</label>
                    <select
                      className="hostel-form-select"
                      value={formData.shift}
                      onChange={e => setFormData({ ...formData, shift: e.target.value })}
                    >
                      <option value="24x7 Resident Duty">24x7 Resident Duty</option>
                      <option value="Day Shift (08:00 AM - 08:00 PM)">Day Shift (08:00 AM - 08:00 PM)</option>
                      <option value="Evening & Night Shift (04:00 PM - 08:00 AM)">Evening & Night Shift (04:00 PM - 08:00 AM)</option>
                      <option value="Night Relief Shift (08:00 PM - 06:00 AM)">Night Relief Shift (08:00 PM - 06:00 AM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="hostel-modal-footer">
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setIsReassignModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PENDING TASKS MODAL */}
      {viewingPendingTasksWarden && (
        <WardenPendingTasksModal
          warden={viewingPendingTasksWarden}
          onClose={() => setViewingPendingTasksWarden(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

