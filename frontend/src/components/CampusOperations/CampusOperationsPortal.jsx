import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  X,
  Menu,
  LogOut,
  Calendar,
  FileText,
  Boxes,
  ClipboardList,
  Sparkles,
  Zap,
  Droplets,
  HardHat,
  Eye,
  Check,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Settings,
  Bell,
  MessageSquare,
  Building2,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Activity,
  AlertOctagon,
  RefreshCw,
  Utensils,
  Home,
  CheckSquare,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import './CampusOperationsPortal.css';
import '../../DashboardHome.css';
import '../SuperAdminPortal.css';
import campusOperationsStore from '../../services/campusOperationsStore.js';
import { getGreetingDisplayName } from '../../utils/timeGreeting.js';

export default function CampusOperationsPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCategoryView, setActiveCategoryView] = useState('Campus Supervisor'); // View As role-specific switcher
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Live Time Clock
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeGreetingWish = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  }, [currentTime]);

  const liveTimeString = useMemo(() => {
    return currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  // Store data state
  const [categories, setCategories] = useState(() => campusOperationsStore.getCategories());
  const [staffList, setStaffList] = useState(() => campusOperationsStore.getStaff());
  const [tasks, setTasks] = useState(() => campusOperationsStore.getTasks());
  const [maintenance, setMaintenance] = useState(() => campusOperationsStore.getMaintenanceRequests());
  const [preventive, setPreventive] = useState(() => campusOperationsStore.preventiveMaintenance);
  const [visitors, setVisitors] = useState(() => campusOperationsStore.getVisitors());
  const [housekeeping, setHousekeeping] = useState(() => campusOperationsStore.housekeepingSchedules);
  const [canteenChecks, setCanteenChecks] = useState(() => campusOperationsStore.canteenChecklists);
  const [facilities, setFacilities] = useState(() => campusOperationsStore.getFacilities());
  const [inventory, setInventory] = useState(() => campusOperationsStore.getInventory());
  const [dutyRoster, setDutyRoster] = useState(() => campusOperationsStore.getDutyRoster());
  const [leaveRequests, setLeaveRequests] = useState(() => campusOperationsStore.getLeaveRequests());
  const [incidents, setIncidents] = useState(() => campusOperationsStore.getSafetyIncidents());
  const [notifications, setNotifications] = useState(() => campusOperationsStore.getNotifications());
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals state
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [statusUpdateValue, setStatusUpdateValue] = useState('In Progress');
  const [statusNotesValue, setStatusNotesValue] = useState('');

  const [selectedMntModal, setSelectedMntModal] = useState(null);
  const [mntResolutionNotes, setMntResolutionNotes] = useState('');

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    category: 'Electrician',
    location: 'Academic Block A',
    priority: 'High',
    assignedStaffName: 'Mr. Pramod Kumar Panda',
    dueDate: new Date().toISOString().split('T')[0],
    requiredMaterials: ''
  });

  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    designation: '',
    category: 'Electrician',
    team: 'Maintenance Squad',
    department: 'Estate Maintenance',
    assignedBuilding: 'Academic Block A',
    assignedFloor: 'Ground Floor',
    phone: '+91 94371 ',
    email: '',
    shift: 'General (09:00 - 17:00)',
    experience: '5 Years'
  });

  const [selectedStaffDetail, setSelectedStaffDetail] = useState(null);

  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    organization: '',
    purpose: '',
    hostPerson: '',
    hostDept: '',
    gate: 'Gate 1 (Main Entrance)',
    badgeNo: 'VIS-BADGE-15',
    vehicleNo: '',
    contactPhone: '',
    idProofType: 'Aadhaar / ID Card'
  });

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [issueQty, setIssueQty] = useState(1);
  const [issueWorkOrder, setIssueWorkOrder] = useState('WO-2026-8801');

  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    category: 'Electrical Hazard',
    location: '',
    description: '',
    reportedBy: account?.name || 'Operations Crew',
    severity: 'Medium',
    correctiveAction: ''
  });

  // Filter States
  const [staffSearch, setStaffSearch] = useState('');
  const [staffCategoryFilter, setStaffCategoryFilter] = useState('ALL');

  const [taskSearch, setTaskSearch] = useState('');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('ALL');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('ALL');

  const [mntCategoryFilter, setMntCategoryFilter] = useState('ALL');
  const [mntStatusFilter, setMntStatusFilter] = useState('ALL');

  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL');

  // Metrics computation
  const metrics = useMemo(() => {
    return campusOperationsStore.getDashboardMetrics();
  }, [tasks, maintenance, incidents, staffList, leaveRequests]);

  // Handler: Update Task Status
  const handleSaveTaskStatus = () => {
    if (!selectedTaskModal) return;
    campusOperationsStore.updateTaskStatus(selectedTaskModal.id, statusUpdateValue, statusNotesValue);
    setTasks(campusOperationsStore.getTasks());
    showToast(`Work Order #${selectedTaskModal.id} updated to "${statusUpdateValue}"`);
    setSelectedTaskModal(null);
    setStatusNotesValue('');
  };

  // Handler: Create New Task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    const created = campusOperationsStore.addTask({
      ...newTaskForm,
      assignedStaffId: 'STF-OPS-102',
      assignedTeam: `${newTaskForm.category} Unit`
    });
    setTasks(campusOperationsStore.getTasks());
    setIsNewTaskModalOpen(false);
    showToast(`Created new Work Order #${created.id}: ${created.title}`);
    setNewTaskForm({
      title: '',
      description: '',
      category: 'Electrician',
      location: 'Academic Block A',
      priority: 'High',
      assignedStaffName: 'Mr. Pramod Kumar Panda',
      dueDate: new Date().toISOString().split('T')[0],
      requiredMaterials: ''
    });
  };

  // Handler: Add New Staff
  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!newStaffForm.name.trim()) return;
    const created = campusOperationsStore.addStaff(newStaffForm);
    setStaffList(campusOperationsStore.getStaff());
    setIsNewStaffModalOpen(false);
    showToast(`Added ${created.name} (${created.category}) to staff directory`);
  };

  // Handler: Check-In Visitor
  const handleCheckInVisitor = (e) => {
    e.preventDefault();
    if (!visitorForm.visitorName.trim()) return;
    const created = campusOperationsStore.checkInVisitor(visitorForm);
    setVisitors(campusOperationsStore.getVisitors());
    setIsVisitorModalOpen(false);
    showToast(`Checked in visitor ${created.visitorName} (Badge #${created.badgeNo})`);
  };

  // Handler: Check-Out Visitor
  const handleCheckOutVisitor = (id) => {
    campusOperationsStore.checkOutVisitor(id);
    setVisitors(campusOperationsStore.getVisitors());
    showToast(`Visitor #${id} departure registered successfully.`);
  };

  // Handler: Resolve Maintenance Request
  const handleResolveMaintenance = () => {
    if (!selectedMntModal) return;
    campusOperationsStore.updateMaintenanceStatus(selectedMntModal.id, 'Completed', mntResolutionNotes || 'Maintenance completed and signed off.');
    setMaintenance(campusOperationsStore.getMaintenanceRequests());
    showToast(`Maintenance Request #${selectedMntModal.id} marked as Completed!`);
    setSelectedMntModal(null);
    setMntResolutionNotes('');
  };

  // Handler: Issue Inventory Material
  const handleIssueMaterial = (e) => {
    e.preventDefault();
    if (!selectedInventoryItem) return;
    campusOperationsStore.issueItem(selectedInventoryItem.id, Number(issueQty));
    setInventory(campusOperationsStore.getInventory());
    setIsIssueModalOpen(false);
    showToast(`Issued ${issueQty} ${selectedInventoryItem.unit} of ${selectedInventoryItem.name} to ${issueWorkOrder}`);
  };

  // Handler: Add New Staff Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const updated = campusOperationsStore.addCategory(newCategoryName);
    setCategories(updated);
    setIsNewCategoryModalOpen(false);
    showToast(`Staff category "${newCategoryName}" added successfully.`);
    setNewCategoryName('');
  };

  // Handler: Add Safety Incident
  const handleAddIncident = (e) => {
    e.preventDefault();
    if (!incidentForm.description.trim()) return;
    const created = campusOperationsStore.addSafetyIncident(incidentForm);
    setIncidents(campusOperationsStore.getSafetyIncidents());
    setIsIncidentModalOpen(false);
    showToast(`Safety Incident #${created.id} reported and logged.`);
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchSearch = staffSearch === '' ||
        s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.designation.toLowerCase().includes(staffSearch.toLowerCase());
      const matchCat = staffCategoryFilter === 'ALL' || s.category === staffCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [staffList, staffSearch, staffCategoryFilter]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = taskSearch === '' ||
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.location.toLowerCase().includes(taskSearch.toLowerCase());
      const matchCat = taskCategoryFilter === 'ALL' || t.category === taskCategoryFilter;
      const matchStatus = taskStatusFilter === 'ALL' || t.status === taskStatusFilter;
      const matchPriority = taskPriorityFilter === 'ALL' || t.priority === taskPriorityFilter;
      return matchSearch && matchCat && matchStatus && matchPriority;
    });
  }, [tasks, taskSearch, taskCategoryFilter, taskStatusFilter, taskPriorityFilter]);

  // Filtered Maintenance Requests
  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((m) => {
      const matchCat = mntCategoryFilter === 'ALL' || m.category === mntCategoryFilter;
      const matchStatus = mntStatusFilter === 'ALL' || m.status === mntStatusFilter;
      return matchCat && matchStatus;
    });
  }, [maintenance, mntCategoryFilter, mntStatusFilter]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch = inventorySearch === '' ||
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.code.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchCat = inventoryCategoryFilter === 'ALL' || item.category === inventoryCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [inventory, inventorySearch, inventoryCategoryFilter]);

  // Officer display name
  const officerName = account?.name || 'Mr. Ramesh Chandra Parida';
  const greetingName = getGreetingDisplayName(officerName);

  // Category Focus Details for Role-Specific View
  const categoryFocusDetails = useMemo(() => {
    switch (activeCategoryView) {
      case 'Electrician':
        return {
          title: 'Electrician Operational Console',
          desc: 'High-voltage substations, lighting maintenance, power feeder breakers, generator synch & safety lockouts.',
          chips: ['Substations 1 & 2', '11kV Grid Feeder', 'Solar PV Array 100kWp', 'Emergency Power Line'],
          filteredTasks: tasks.filter(t => t.category === 'Electrician'),
        };
      case 'Plumber':
        return {
          title: 'Plumber & Water Systems Console',
          desc: 'Overhead reservoir pumping, wastewater drainage, pressure valves, bathroom fixtures & RO drinking plant.',
          chips: ['Overhead Tanks 1-4', 'Gravity Header Valve', 'Central RO 2000 LPH', 'Underground Sump'],
          filteredTasks: tasks.filter(t => t.category === 'Plumber'),
        };
      case 'Mechanic':
        return {
          title: 'Equipment & Generator Mechanic Console',
          desc: 'Kirloskar 320kVA backup diesel generators, utility pumps, hydraulic pruners, tractor & workshop equipment.',
          chips: ['DG Sets 1-4', 'Engine Lube Filters', 'Coolant Concentration', 'Hydraulic Jack Kits'],
          filteredTasks: tasks.filter(t => t.category === 'Mechanic'),
        };
      case 'Security Guard':
        return {
          title: 'Security & Perimeter Gate Command',
          desc: 'Gate 1, 2 & 3 barrier access control, visitor badge registrations, vehicle inspection & night rounds.',
          chips: ['Gate 1 (Main Entrance)', 'Gate 2 (Service)', 'RFID Boom Barriers', 'CCTV Monitoring Desk'],
          filteredTasks: tasks.filter(t => t.category === 'Security Guard'),
        };
      case 'Canteen Staff':
        return {
          title: 'Central Dining & Food Court Operations',
          desc: 'Kitchen Bain-Marie food temperature audits, hygienic cutlery sterilization, cooking gas line leak check.',
          chips: ['Commercial Kitchen Line', 'Cutlery Steam Sanitizer', 'Grease Filter Exhaust', 'Dining Hall 400 Seats'],
          filteredTasks: tasks.filter(t => t.category === 'Canteen Staff'),
        };
      case 'Housekeeping Staff':
        return {
          title: 'Housekeeping & Sanitation Workspace',
          desc: 'Building corridor mopping, washroom descaling, soap dispenser refills, bio-waste collection & floor hygiene.',
          chips: ['Academic Block A', 'Academic Block B', 'Tech Tower', 'Restroom Deep Scrub'],
          filteredTasks: tasks.filter(t => t.category === 'Housekeeping Staff'),
        };
      case 'Floor Manager':
        return {
          title: 'Academic Floor Manager Supervision',
          desc: 'Room condition tracking, lecture classroom furniture checks, staff allocation & facility escalation requests.',
          chips: ['Block B Floors 1-4', 'Rooms 201-212', 'Projector Systems', 'Corridor Lighting'],
          filteredTasks: tasks.filter(t => t.category === 'Floor Manager' || t.priority === 'Critical'),
        };
      default:
        return {
          title: 'Campus Operations Central Command (Macro Overview)',
          desc: 'Unified facilities administration, preventive maintenance, multi-category work orders, safety compliance & reports.',
          chips: ['15 Staff Categories', '24/7 Campus Coverage', 'Estate Maintenance', 'Statutory Safety NOCs'],
          filteredTasks: tasks,
        };
    }
  }, [activeCategoryView, tasks]);

  return (
    <div className="ops-portal-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ops-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          LEFT SIDEBAR (17 SECTIONS IN 5 LOGICAL GROUPS)
          ========================================================= */}
      <aside className={`erp-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="erp-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="ops-sidebar-badge">
              <HardHat size={22} />
            </div>
            <div className="erp-brand-text">
              <h2>Apna Campus</h2>
              <span style={{ color: '#38bdf8' }}>Campus Operations</span>
            </div>
          </div>
          <button
            type="button"
            className="role-notif-close"
            onClick={() => setSidebarOpen(false)}
            style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="erp-sidebar-nav">
          {/* GROUP 1: CORE OPERATIONS */}
          <div className="erp-nav-section-title">Core Operations</div>
          <button
            className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            <Activity size={17} />
            <span>Operations Dashboard</span>
            <span className="erp-nav-badge" style={{ background: '#0284c7', color: '#fff' }}>Live</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'staff-directory' ? 'active' : ''}`}
            onClick={() => { setActiveTab('staff-directory'); setSidebarOpen(false); }}
          >
            <Users size={17} />
            <span>Staff Directory</span>
            <span className="erp-nav-badge" style={{ background: '#334155', color: '#fff' }}>{staffList.length}</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'tasks-work-orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tasks-work-orders'); setSidebarOpen(false); }}
          >
            <ClipboardList size={17} />
            <span>Task &amp; Work Orders</span>
            <span className="erp-nav-badge" style={{ background: '#f59e0b', color: '#fff' }}>
              {tasks.filter(t => t.status !== 'Completed').length}
            </span>
          </button>

          {/* GROUP 2: MAINTENANCE & FACILITIES */}
          <div className="erp-nav-section-title">Maintenance &amp; Facilities</div>
          <button
            className={`erp-nav-item ${activeTab === 'maintenance-requests' ? 'active' : ''}`}
            onClick={() => { setActiveTab('maintenance-requests'); setSidebarOpen(false); }}
          >
            <Wrench size={17} />
            <span>Maintenance Requests</span>
            <span className="erp-nav-badge" style={{ background: '#ef4444', color: '#fff' }}>
              {maintenance.filter(m => m.status !== 'Completed').length}
            </span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'preventive-maintenance' ? 'active' : ''}`}
            onClick={() => { setActiveTab('preventive-maintenance'); setSidebarOpen(false); }}
          >
            <RefreshCw size={17} />
            <span>Preventive Maintenance</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'campus-facilities' ? 'active' : ''}`}
            onClick={() => { setActiveTab('campus-facilities'); setSidebarOpen(false); }}
          >
            <Building2 size={17} />
            <span>Campus Facilities &amp; Rooms</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'inventory-spare-parts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inventory-spare-parts'); setSidebarOpen(false); }}
          >
            <Boxes size={17} />
            <span>Inventory &amp; Spare Parts</span>
          </button>

          {/* GROUP 3: FIELD & SPECIALIZED SERVICES */}
          <div className="erp-nav-section-title">Field &amp; Specialist Services</div>
          <button
            className={`erp-nav-item ${activeTab === 'security-gate' ? 'active' : ''}`}
            onClick={() => { setActiveTab('security-gate'); setSidebarOpen(false); }}
          >
            <ShieldCheck size={17} />
            <span>Security &amp; Gate Control</span>
            <span className="erp-nav-badge" style={{ background: '#10b981', color: '#fff' }}>Gate 1</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'housekeeping-cleaning' ? 'active' : ''}`}
            onClick={() => { setActiveTab('housekeeping-cleaning'); setSidebarOpen(false); }}
          >
            <CheckSquare size={17} />
            <span>Housekeeping &amp; Cleaning</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'canteen-operations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('canteen-operations'); setSidebarOpen(false); }}
          >
            <Utensils size={17} />
            <span>Canteen Operations</span>
          </button>

          {/* GROUP 4: WORKFORCE & GRIEVANCES */}
          <div className="erp-nav-section-title">Workforce &amp; Safety</div>
          <button
            className={`erp-nav-item ${activeTab === 'attendance-roster' ? 'active' : ''}`}
            onClick={() => { setActiveTab('attendance-roster'); setSidebarOpen(false); }}
          >
            <UserCheck size={17} />
            <span>Attendance &amp; Duty Roster</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'leave-shift-requests' ? 'active' : ''}`}
            onClick={() => { setActiveTab('leave-shift-requests'); setSidebarOpen(false); }}
          >
            <Clock size={17} />
            <span>Leave &amp; Shift Requests</span>
            {leaveRequests.filter(l => l.supervisorStatus === 'Pending Review').length > 0 && (
              <span className="erp-nav-badge" style={{ background: '#f59e0b', color: '#fff' }}>
                {leaveRequests.filter(l => l.supervisorStatus === 'Pending Review').length}
              </span>
            )}
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'complaints-grievances' ? 'active' : ''}`}
            onClick={() => { setActiveTab('complaints-grievances'); setSidebarOpen(false); }}
          >
            <AlertTriangle size={17} />
            <span>Complaints &amp; Grievances</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'safety-incidents' ? 'active' : ''}`}
            onClick={() => { setActiveTab('safety-incidents'); setSidebarOpen(false); }}
          >
            <ShieldAlert size={17} />
            <span>Safety &amp; Incidents</span>
            {incidents.filter(i => i.resolutionStatus !== 'Closed').length > 0 && (
              <span className="erp-nav-badge" style={{ background: '#ef4444', color: '#fff' }}>
                {incidents.filter(i => i.resolutionStatus !== 'Closed').length}
              </span>
            )}
          </button>

          {/* GROUP 5: GOVERNANCE & CONFIG */}
          <div className="erp-nav-section-title">Governance &amp; Config</div>
          <button
            className={`erp-nav-item ${activeTab === 'notifications-announcements' ? 'active' : ''}`}
            onClick={() => { setActiveTab('notifications-announcements'); setSidebarOpen(false); }}
          >
            <Bell size={17} />
            <span>Notifications &amp; Alerts</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'reports-analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports-analytics'); setSidebarOpen(false); }}
          >
            <FileSpreadsheet size={17} />
            <span>Reports &amp; Analytics</span>
          </button>

          <button
            className={`erp-nav-item ${activeTab === 'settings-permissions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings-permissions'); setSidebarOpen(false); }}
          >
            <Settings size={17} />
            <span>Settings &amp; Permissions</span>
          </button>
        </nav>
      </aside>

      {/* =========================================================
          MAIN CONTENT WRAPPER
          ========================================================= */}
      <main className="erp-main-content">
        {/* Top Operational Header */}
        <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="campus-nav-toggle-btn"
              type="button"
              onClick={() => setSidebarOpen(o => !o)}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardHat size={22} color="#0284c7" />
                Campus Operations &amp; Facilities Console
              </h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                {timeGreetingWish}, {greetingName} • 24/7 Estate Maintenance, Security Gateways, Hygiene &amp; Utility Command
              </p>
            </div>
          </div>

          <div className="erp-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Live Clock Badge */}
            <div style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Clock size={15} color="#0284c7" />
              <span>{liveTimeString}</span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="role-icon-btn"
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="role-bell-dot" />
                )}
              </button>

              {showNotifications && (
                <div className="role-notif-popover" role="dialog" style={{ position: 'absolute', right: 0, top: '45px', width: '320px', zIndex: 9999 }}>
                  <div className="role-notif-head">
                    <strong>Operational Notifications</strong>
                    <button className="role-notif-close" type="button" onClick={() => setShowNotifications(false)}>
                      <X size={15} />
                    </button>
                  </div>
                  <div className="role-notif-list">
                    {notifications.map((n) => (
                      <div key={n.id} className={`role-notif-item ${n.unread ? 'is-unread' : ''}`}>
                        <div className="role-notif-item-top">
                          <span className={`role-notif-tag tag-${n.type === 'URGENT' ? 'red' : 'blue'}`}>{n.type}</span>
                          <span className="role-notif-time">{n.time}</span>
                        </div>
                        <h4 className="role-notif-title">{n.title}</h4>
                        <p className="role-notif-desc">{n.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="role-notif-foot">
                    <button type="button" onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                      showToast('Marked all notifications as read');
                    }}>
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="campus-user-pill" title={`${officerName} (Campus Operations)`}>
              <div className="campus-user-avatar" style={{ background: '#0284c7' }}>OPS</div>
              <div className="campus-user-details">
                <strong>{officerName}</strong>
                <small>{account?.identity || 'OPS-DIR-01'} • Estate Supt</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* ROLE-SPECIFIC CATEGORY VIEW SWITCHER BAR */}
        <div className="ops-category-switcher-bar">
          <div className="ops-category-switcher-left">
            <span className="ops-category-switcher-label">
              <Eye size={15} color="#0284c7" /> View Dashboard As (Role-Aware Context):
            </span>
            <select
              className="ops-category-select"
              value={activeCategoryView}
              onChange={(e) => {
                setActiveCategoryView(e.target.value);
                showToast(`Switched active view context to: ${e.target.value}`);
              }}
            >
              <option value="Campus Supervisor">Campus Supervisor (Full Macro Oversight)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="ops-category-pill-badge">
              <CheckCircle2 size={12} /> {categories.length} Configurable Staff Categories
            </span>
            <button
              className="ops-btn-secondary ops-btn-sm"
              type="button"
              onClick={() => setIsNewCategoryModalOpen(true)}
            >
              <Plus size={13} /> Add Category
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="erp-content-body">
          {/* =========================================================
              TAB A: OPERATIONS DASHBOARD
              ========================================================= */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Top 10 Summary KPI Cards */}
              <div className="ops-stat-grid-10">
                <div className="ops-stat-card info-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Assigned Tasks</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                      <ClipboardList size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.assigned}</div>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>Total active operational docket</small>
                </div>

                <div className="ops-stat-card warning-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Pending Tasks</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
                      <Clock size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.pending}</div>
                  <small style={{ color: '#b45309', fontSize: '0.72rem' }}>Awaiting technician action</small>
                </div>

                <div className="ops-stat-card success-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Completed Tasks</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#dcfce7', color: '#15803d' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.completed}</div>
                  <small style={{ color: '#15803d', fontSize: '0.72rem' }}>Resolved &amp; signed off</small>
                </div>

                <div className="ops-stat-card alert-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Overdue Tasks</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                      <AlertTriangle size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.overdue}</div>
                  <small style={{ color: '#b91c1c', fontSize: '0.72rem' }}>Exceeded target turnaround</small>
                </div>

                <div className="ops-stat-card info-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">New Maintenance</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                      <Wrench size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.newMaintenance}</div>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>Reported today</small>
                </div>

                <div className="ops-stat-card alert-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">High-Priority Issues</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#ffedd5', color: '#c2410c' }}>
                      <AlertOctagon size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.highPriority}</div>
                  <small style={{ color: '#c2410c', fontSize: '0.72rem' }}>Critical electrical &amp; HVAC</small>
                </div>

                <div className="ops-stat-card success-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Staff On Duty</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#dcfce7', color: '#15803d' }}>
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.staffOnDuty} / {staffList.length}</div>
                  <small style={{ color: '#15803d', fontSize: '0.72rem' }}>Active in current shift</small>
                </div>

                <div className="ops-stat-card info-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Scheduled Mnt</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                      <RefreshCw size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.scheduledMaintenance}</div>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>DG, RO &amp; lift certifications</small>
                </div>

                <div className="ops-stat-card alert-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Open Safety Incidents</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                      <ShieldAlert size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.openSafetyIncidents}</div>
                  <small style={{ color: '#b91c1c', fontSize: '0.72rem' }}>Hazard corrective actions</small>
                </div>

                <div className="ops-stat-card warning-border">
                  <div className="ops-stat-top">
                    <span className="ops-stat-label">Pending Approvals</span>
                    <div className="ops-stat-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="ops-stat-val">{metrics.pendingSupervisorApprovals}</div>
                  <small style={{ color: '#b45309', fontSize: '0.72rem' }}>Leaves &amp; work reviews</small>
                </div>
              </div>

              {/* Role-Specific Focus Banner */}
              <div className="ops-role-focus-banner">
                <div>
                  <h3 className="ops-role-focus-title">
                    <Sparkles size={18} color="#38bdf8" />
                    {categoryFocusDetails.title}
                  </h3>
                  <p className="ops-role-focus-desc">{categoryFocusDetails.desc}</p>
                </div>
                <div className="ops-role-focus-chips">
                  {categoryFocusDetails.chips.map((chip, idx) => (
                    <span key={idx} className="ops-focus-chip">{chip}</span>
                  ))}
                </div>
              </div>

              {/* Two Column Grid: Today's Schedule & Quick Action Tasks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Left Card: Priority Work Orders */}
                <div className="ops-card" style={{ margin: 0 }}>
                  <div className="ops-card-header">
                    <div>
                      <h4 className="ops-card-title">
                        <ClipboardList size={18} color="#0284c7" /> Priority Work Orders ({categoryFocusDetails.filteredTasks.length})
                      </h4>
                      <p className="ops-card-subtitle">Active dockets filtered for {activeCategoryView}</p>
                    </div>
                    <button
                      className="ops-btn-primary ops-btn-sm"
                      type="button"
                      onClick={() => setIsNewTaskModalOpen(true)}
                    >
                      <Plus size={14} /> New Work Order
                    </button>
                  </div>

                  <div className="ops-table-wrap">
                    <table className="ops-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Task Title</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryFocusDetails.filteredTasks.slice(0, 5).map((t) => (
                          <tr key={t.id}>
                            <td><strong>{t.id}</strong></td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{t.title}</div>
                              <small style={{ color: '#64748b' }}>{t.location}</small>
                            </td>
                            <td>
                              <span className={`ops-badge ops-badge-${t.priority.toLowerCase()}`}>
                                {t.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`ops-badge ops-badge-${t.status.toLowerCase().replace(' ', '')}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="ops-btn-secondary ops-btn-sm"
                                type="button"
                                onClick={() => {
                                  setSelectedTaskModal(t);
                                  setStatusUpdateValue(t.status);
                                  setStatusNotesValue(t.completionNotes || '');
                                }}
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Card: Maintenance Request Queue */}
                <div className="ops-card" style={{ margin: 0 }}>
                  <div className="ops-card-header">
                    <div>
                      <h4 className="ops-card-title">
                        <Wrench size={18} color="#f59e0b" /> Maintenance Request Queue
                      </h4>
                      <p className="ops-card-subtitle">Reported campus infrastructure tickets</p>
                    </div>
                    <button
                      className="ops-btn-secondary ops-btn-sm"
                      type="button"
                      onClick={() => setActiveTab('maintenance-requests')}
                    >
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="ops-table-wrap">
                    <table className="ops-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Reported Issue</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenance.slice(0, 5).map((m) => (
                          <tr key={m.id}>
                            <td><strong>{m.id}</strong></td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{m.reportedIssue}</div>
                              <small style={{ color: '#64748b' }}>{m.location} • {m.requester}</small>
                            </td>
                            <td><span style={{ fontSize: '0.75rem', color: '#0369a1' }}>{m.category}</span></td>
                            <td>
                              <span className={`ops-badge ops-badge-${m.priority.toLowerCase()}`}>
                                {m.priority}
                              </span>
                            </td>
                            <td>
                              <button
                                className="ops-btn-secondary ops-btn-sm"
                                type="button"
                                onClick={() => {
                                  setSelectedMntModal(m);
                                  setMntResolutionNotes(m.resolutionNotes || '');
                                }}
                              >
                                Resolve
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Upcoming Preventive Maintenance & On-Duty Staff Quick Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
                <div className="ops-card" style={{ margin: 0 }}>
                  <div className="ops-card-header">
                    <h4 className="ops-card-title">
                      <RefreshCw size={18} color="#10b981" /> Upcoming Preventive Maintenance
                    </h4>
                    <span className="ops-badge ops-badge-completed">All Schedules Active</span>
                  </div>
                  <div className="ops-table-wrap">
                    <table className="ops-table">
                      <thead>
                        <tr>
                          <th>Equipment</th>
                          <th>Interval</th>
                          <th>Next Due</th>
                          <th>Assigned Lead</th>
                          <th>Compliance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preventive.slice(0, 4).map((p) => (
                          <tr key={p.id}>
                            <td><strong>{p.equipment}</strong></td>
                            <td>{p.frequency}</td>
                            <td><span style={{ color: '#0369a1', fontWeight: 600 }}>{p.nextScheduled}</span></td>
                            <td><small>{p.assignedLead}</small></td>
                            <td><span className="ops-badge ops-badge-completed">{p.complianceRating}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="ops-card" style={{ margin: 0 }}>
                  <div className="ops-card-header">
                    <h4 className="ops-card-title">
                      <UserCheck size={18} color="#0284c7" /> Staff Shift Status Today
                    </h4>
                    <button
                      className="ops-btn-secondary ops-btn-sm"
                      type="button"
                      onClick={() => setActiveTab('attendance-roster')}
                    >
                      Duty Matrix <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="ops-table-wrap">
                    <table className="ops-table">
                      <thead>
                        <tr>
                          <th>Staff Member</th>
                          <th>Category</th>
                          <th>Shift</th>
                          <th>Assigned Post</th>
                          <th>Duty Check</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dutyRoster.slice(0, 4).map((r) => (
                          <tr key={r.id}>
                            <td><strong>{r.staffName}</strong></td>
                            <td><span style={{ fontSize: '0.75rem' }}>{r.category}</span></td>
                            <td><small>{r.shift}</small></td>
                            <td><small style={{ color: '#64748b' }}>{r.location}</small></td>
                            <td>
                              {r.dutyConfirmed ? (
                                <span className="ops-badge ops-badge-completed">Confirmed</span>
                              ) : (
                                <span className="ops-badge ops-badge-new">Standby</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB B: STAFF DIRECTORY (15 CATEGORIES + CONFIGURABLE)
              ========================================================= */}
          {activeTab === 'staff-directory' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Users size={20} color="#0284c7" /> Institutional Staff Directory ({filteredStaff.length} Members)
                  </h3>
                  <p className="ops-card-subtitle">
                    Comprehensive roster of electricians, plumbers, security guards, housekeeping, canteen &amp; operational personnel
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="ops-btn-secondary"
                    type="button"
                    onClick={() => setIsNewCategoryModalOpen(true)}
                  >
                    <Plus size={15} /> Configure Category
                  </button>
                  <button
                    className="ops-btn-primary"
                    type="button"
                    onClick={() => setIsNewStaffModalOpen(true)}
                  >
                    <Plus size={15} /> Add Staff Member
                  </button>
                </div>
              </div>

              {/* Filter bar */}
              <div className="ops-filter-bar">
                <div className="ops-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by name, staff ID, or designation..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                  />
                  {staffSearch && (
                    <button type="button" onClick={() => setStaffSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Category:</span>
                  <select
                    className="ops-select"
                    value={staffCategoryFilter}
                    onChange={(e) => setStaffCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Staff Profile</th>
                      <th>Category &amp; Team</th>
                      <th>Department</th>
                      <th>Assigned Building &amp; Floor</th>
                      <th>Duty Shift</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={s.avatar} alt={s.name} className="ops-table-avatar" />
                            <div>
                              <strong>{s.name}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.id} • {s.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="ops-focus-chip" style={{ background: '#f1f5f9', color: '#0369a1', borderColor: '#cbd5e1' }}>
                            {s.category}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{s.team}</div>
                        </td>
                        <td><small>{s.department}</small></td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{s.assignedBuilding}</div>
                          <small style={{ color: '#64748b' }}>{s.assignedFloor}</small>
                        </td>
                        <td><small style={{ fontWeight: 600 }}>{s.shift}</small></td>
                        <td>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.phone}</div>
                          <small style={{ color: '#64748b' }}>{s.email}</small>
                        </td>
                        <td>
                          <span className="ops-badge ops-badge-completed">{s.status}</span>
                        </td>
                        <td>
                          <button
                            className="ops-btn-secondary ops-btn-sm"
                            type="button"
                            onClick={() => setSelectedStaffDetail(s)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB C: TASK & WORK ORDERS
              ========================================================= */}
          {activeTab === 'tasks-work-orders' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <ClipboardList size={20} color="#0284c7" /> Task &amp; Work Orders Management
                  </h3>
                  <p className="ops-card-subtitle">
                    Tracking 8 discrete status stages: New, Assigned, Accepted, In Progress, On Hold, Completed, Verified, Cancelled
                  </p>
                </div>
                <button
                  className="ops-btn-primary"
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(true)}
                >
                  <Plus size={15} /> Raise Work Order
                </button>
              </div>

              {/* Filters */}
              <div className="ops-filter-bar">
                <div className="ops-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search work orders by title, ID, location..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    className="ops-select"
                    value={taskCategoryFilter}
                    onChange={(e) => setTaskCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    className="ops-select"
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Verified">Verified</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    className="ops-select"
                    value={taskPriorityFilter}
                    onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Work Order ID</th>
                      <th>Task Title &amp; Description</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Priority</th>
                      <th>Assigned Crew</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((t) => (
                      <tr key={t.id}>
                        <td><strong>{t.id}</strong></td>
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600 }}>{t.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.description}
                          </div>
                        </td>
                        <td><span className="ops-focus-chip">{t.category}</span></td>
                        <td><small style={{ fontWeight: 600 }}>{t.location}</small></td>
                        <td>
                          <span className={`ops-badge ops-badge-${t.priority.toLowerCase()}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{t.assignedStaffName}</div>
                          <small style={{ color: '#64748b' }}>{t.assignedTeam}</small>
                        </td>
                        <td><small>{t.dueDate}</small></td>
                        <td>
                          <span className={`ops-badge ops-badge-${t.status.toLowerCase().replace(' ', '')}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="ops-btn-secondary ops-btn-sm"
                            type="button"
                            onClick={() => {
                              setSelectedTaskModal(t);
                              setStatusUpdateValue(t.status);
                              setStatusNotesValue(t.completionNotes || '');
                            }}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB D: MAINTENANCE REQUESTS
              ========================================================= */}
          {activeTab === 'maintenance-requests' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Wrench size={20} color="#f59e0b" /> Campus Maintenance &amp; Repair Requests
                  </h3>
                  <p className="ops-card-subtitle">
                    Electrical, plumbing, mechanical, furniture, air conditioning, lifts, lighting, washrooms &amp; lab facilities
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="ops-filter-bar">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Issue Category:</span>
                  <select
                    className="ops-select"
                    value={mntCategoryFilter}
                    onChange={(e) => setMntCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">All Maintenance Categories</option>
                    <option value="Electrical problems">Electrical problems</option>
                    <option value="Plumbing and water supply">Plumbing and water supply</option>
                    <option value="Mechanical repairs">Mechanical repairs</option>
                    <option value="Furniture damage">Furniture damage</option>
                    <option value="Air conditioning">Air conditioning</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Lift maintenance">Lift maintenance</option>
                    <option value="Classroom and laboratory facilities">Classroom and laboratory facilities</option>
                    <option value="Washrooms">Washrooms</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</span>
                  <select
                    className="ops-select"
                    value={mntStatusFilter}
                    onChange={(e) => setMntStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Reported Issue</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Requester</th>
                      <th>Priority</th>
                      <th>Assigned Technician</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaintenance.map((m) => (
                      <tr key={m.id}>
                        <td><strong>{m.id}</strong></td>
                        <td style={{ maxWidth: '250px' }}>
                          <div style={{ fontWeight: 600 }}>{m.reportedIssue}</div>
                          <small style={{ color: '#64748b' }}>Reported: {m.requestDate}</small>
                        </td>
                        <td><span className="ops-focus-chip">{m.category}</span></td>
                        <td><small style={{ fontWeight: 600 }}>{m.location}</small></td>
                        <td><small>{m.requester}</small></td>
                        <td>
                          <span className={`ops-badge ops-badge-${m.priority.toLowerCase()}`}>
                            {m.priority}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{m.assignedStaff}</div>
                          <small style={{ color: '#0369a1' }}>{m.assignedCategory}</small>
                        </td>
                        <td>
                          <span className={`ops-badge ops-badge-${m.status.toLowerCase().replace(' ', '')}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="ops-btn-secondary ops-btn-sm"
                            type="button"
                            onClick={() => {
                              setSelectedMntModal(m);
                              setMntResolutionNotes(m.resolutionNotes || '');
                            }}
                          >
                            Resolve Form
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB E: PREVENTIVE MAINTENANCE
              ========================================================= */}
          {activeTab === 'preventive-maintenance' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <RefreshCw size={20} color="#10b981" /> Scheduled Preventive Maintenance (PPM)
                  </h3>
                  <p className="ops-card-subtitle">
                    Automated scheduled servicing for backup power generators, solar PV, lifts, fire NOC equipment, and RO water purification
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {preventive.map((p) => (
                  <div key={p.id} className="ops-card" style={{ margin: 0, border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span className="ops-badge ops-badge-completed">{p.complianceRating}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Frequency: {p.frequency}</span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#0f172a' }}>{p.equipment}</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#64748b' }}>Category: {p.category}</p>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Last Serviced:</span>
                        <strong>{p.lastServiced}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Next Scheduled:</span>
                        <strong style={{ color: '#0284c7' }}>{p.nextScheduled}</strong>
                      </div>
                      <div style={{ marginTop: '6px', color: '#334155' }}>
                        <strong>Lead:</strong> {p.assignedLead}
                      </div>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569' }}>Standard Checklist:</strong>
                      <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '0.75rem', color: '#334155', lineHeight: 1.6 }}>
                        {p.checklist.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB F: SECURITY & GATE MANAGEMENT
              ========================================================= */}
          {activeTab === 'security-gate' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <ShieldCheck size={20} color="#0284c7" /> Security &amp; Perimeter Gate Management
                  </h3>
                  <p className="ops-card-subtitle">
                    Gate 1 (Main Entrance), Gate 2 (Service) &amp; Gate 3 (Hostel). Visitor entry registers, badges, vehicle logs &amp; shift handovers.
                  </p>
                </div>
                <button
                  className="ops-btn-primary"
                  type="button"
                  onClick={() => setIsVisitorModalOpen(true)}
                >
                  <Plus size={15} /> Check-In Visitor
                </button>
              </div>

              {/* Table of Visitors */}
              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Badge #</th>
                      <th>Visitor Name &amp; Org</th>
                      <th>Purpose of Visit</th>
                      <th>Host Official &amp; Dept</th>
                      <th>Gate</th>
                      <th>Vehicle #</th>
                      <th>In Time</th>
                      <th>Out Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v) => (
                      <tr key={v.id}>
                        <td><strong>{v.badgeNo}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.visitorName}</div>
                          <small style={{ color: '#64748b' }}>{v.organization} • {v.contactPhone}</small>
                        </td>
                        <td><small>{v.purpose}</small></td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{v.hostPerson}</div>
                          <small style={{ color: '#64748b' }}>{v.hostDept}</small>
                        </td>
                        <td><small style={{ fontWeight: 600 }}>{v.gate}</small></td>
                        <td><small>{v.vehicleNo || 'Pedestrian'}</small></td>
                        <td><small>{v.entryTime}</small></td>
                        <td><small>{v.exitTime || '—'}</small></td>
                        <td>
                          {v.status === 'Inside Campus' ? (
                            <span className="ops-badge ops-badge-inprogress">{v.status}</span>
                          ) : (
                            <span className="ops-badge ops-badge-completed">{v.status}</span>
                          )}
                        </td>
                        <td>
                          {v.status === 'Inside Campus' && (
                            <button
                              className="ops-btn-secondary ops-btn-sm"
                              type="button"
                              onClick={() => handleCheckOutVisitor(v.id)}
                            >
                              Check-Out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB G: HOUSEKEEPING & CLEANING
              ========================================================= */}
          {activeTab === 'housekeeping-cleaning' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <CheckSquare size={20} color="#10b981" /> Housekeeping Schedules &amp; Hygiene Inspection Records
                  </h3>
                  <p className="ops-card-subtitle">
                    Building-wise daily sanitary routines, washroom audits, soap refills, corridor scrubbing &amp; supervisor verification
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {housekeeping.map((h) => (
                  <div key={h.id} className="ops-card" style={{ margin: 0, border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="ops-badge ops-badge-completed">{h.status}</span>
                      <strong style={{ fontSize: '0.8rem', color: '#16a34a' }}>{h.hygieneScore}</strong>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#0f172a' }}>{h.area}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748b' }}>Assigned: {h.assignedStaff}</p>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '10px' }}>
                      <div><strong>Routine:</strong> {h.routine}</div>
                      <div style={{ marginTop: '4px' }}><strong>Washrooms:</strong> {h.washroomsInspected}</div>
                      <div style={{ marginTop: '4px' }}><strong>Soap Refill:</strong> {h.soapRefilled}</div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#0369a1', fontStyle: 'italic' }}>
                      ✓ {h.supervisorSignoff}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB H: CANTEEN OPERATIONS
              ========================================================= */}
          {activeTab === 'canteen-operations' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Utensils size={20} color="#ea580c" /> Canteen &amp; Dining Hall Operations
                  </h3>
                  <p className="ops-card-subtitle">
                    Daily food hygiene checklists, temperature compliance, kitchen equipment maintenance &amp; meal duty schedules
                  </p>
                </div>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Checklist ID</th>
                      <th>Inspection Item &amp; Food Safety Standard</th>
                      <th>Time Checked</th>
                      <th>Result</th>
                      <th>Verified Official</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canteenChecks.map((ck) => (
                      <tr key={ck.id}>
                        <td><strong>{ck.id}</strong></td>
                        <td>{ck.item}</td>
                        <td>{ck.time}</td>
                        <td><span className="ops-badge ops-badge-completed">{ck.status}</span></td>
                        <td><strong>{ck.verifiedBy}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB I: CAMPUS FACILITIES & ROOMS
              ========================================================= */}
          {activeTab === 'campus-facilities' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Building2 size={20} color="#0284c7" /> Campus Facilities &amp; Room Conditions Directory
                  </h3>
                  <p className="ops-card-subtitle">
                    Real-time status of lecture halls, seminar rooms, laboratories, computing centers &amp; dining areas
                  </p>
                </div>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Room ID</th>
                      <th>Building &amp; Floor</th>
                      <th>Room Type &amp; Capacity</th>
                      <th>Facility Condition</th>
                      <th>Open Issues</th>
                      <th>Last Inspected</th>
                      <th>Current Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map((f) => (
                      <tr key={f.id}>
                        <td><strong>{f.roomNumber}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{f.building}</div>
                          <small style={{ color: '#64748b' }}>{f.floor}</small>
                        </td>
                        <td>{f.type}</td>
                        <td>
                          {f.condition === 'Good' || f.condition === 'Excellent' ? (
                            <span className="ops-badge ops-badge-completed">{f.condition}</span>
                          ) : (
                            <span className="ops-badge ops-badge-high">{f.condition}</span>
                          )}
                        </td>
                        <td>
                          {f.openIssues > 0 ? (
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>{f.openIssues} Issue(s)</span>
                          ) : (
                            <span style={{ color: '#16a34a' }}>0 Issues</span>
                          )}
                        </td>
                        <td><small>{f.lastInspected}</small></td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600 }}>
                            {f.availability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB J: INVENTORY & SPARE PARTS
              ========================================================= */}
          {activeTab === 'inventory-spare-parts' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Boxes size={20} color="#0284c7" /> Inventory &amp; Spare Parts Management
                  </h3>
                  <p className="ops-card-subtitle">
                    Electrical MCBs, plumbing pipes, cleaning chemicals, diesel oil drums &amp; maintenance tools
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="ops-filter-bar">
                <div className="ops-search-input">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search inventory items by code, name..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>

                <select
                  className="ops-select"
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Inventory Categories</option>
                  <option value="Electrical Components">Electrical Components</option>
                  <option value="Plumbing Supplies">Plumbing Supplies</option>
                  <option value="Tools & Equipment">Tools & Equipment</option>
                  <option value="Cleaning Materials">Cleaning Materials</option>
                  <option value="Maintenance Spare Parts">Maintenance Spare Parts</option>
                </select>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Item Description</th>
                      <th>Category</th>
                      <th>Available Qty</th>
                      <th>Storage Bin / Location</th>
                      <th>Min Stock</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.code}</strong></td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td><span className="ops-focus-chip">{item.category}</span></td>
                        <td>
                          <strong style={{ fontSize: '0.95rem', color: item.status === 'Low Stock Alert' ? '#dc2626' : '#0f172a' }}>
                            {item.availableQty} {item.unit}
                          </strong>
                        </td>
                        <td><small style={{ color: '#64748b' }}>{item.location}</small></td>
                        <td><small>{item.minStock} {item.unit}</small></td>
                        <td>
                          {item.status === 'Low Stock Alert' ? (
                            <span className="ops-badge ops-badge-high">{item.status}</span>
                          ) : (
                            <span className="ops-badge ops-badge-completed">{item.status}</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="ops-btn-secondary ops-btn-sm"
                            type="button"
                            onClick={() => {
                              setSelectedInventoryItem(item);
                              setIsIssueModalOpen(true);
                            }}
                          >
                            Issue Material
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB K: ATTENDANCE & DUTY ROSTER
              ========================================================= */}
          {activeTab === 'attendance-roster' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <UserCheck size={20} color="#0284c7" /> Staff Attendance &amp; Shift Duty Roster
                  </h3>
                  <p className="ops-card-subtitle">
                    Shift Timings: Morning (06:00 - 14:00), General (09:00 - 17:00), Evening (14:00 - 22:00), Night (22:00 - 06:00)
                  </p>
                </div>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Category</th>
                      <th>Shift Allocated</th>
                      <th>Designated Work Location</th>
                      <th>Attendance Status</th>
                      <th>Duty Confirmation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dutyRoster.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.staffName}</strong></td>
                        <td><span className="ops-focus-chip">{r.category}</span></td>
                        <td><small style={{ fontWeight: 600 }}>{r.shift}</small></td>
                        <td><small style={{ color: '#64748b' }}>{r.location}</small></td>
                        <td>
                          <span className="ops-badge ops-badge-completed">{r.attendanceStatus}</span>
                        </td>
                        <td>
                          {r.dutyConfirmed ? (
                            <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>✓ Confirmed on Site</span>
                          ) : (
                            <button
                              className="ops-btn-primary ops-btn-sm"
                              type="button"
                              onClick={() => {
                                campusOperationsStore.confirmDuty(r.id);
                                setDutyRoster(campusOperationsStore.getDutyRoster());
                                showToast(`Duty confirmed for ${r.staffName}`);
                              }}
                            >
                              Confirm Duty
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB L: LEAVE & SHIFT REQUESTS
              ========================================================= */}
          {activeTab === 'leave-shift-requests' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Clock size={20} color="#0284c7" /> Leave Applications &amp; Shift Swap Requests
                  </h3>
                  <p className="ops-card-subtitle">
                    Supervisor clearance workflow with designated reliever staff assignment
                  </p>
                </div>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Docket ID</th>
                      <th>Staff Member</th>
                      <th>Category</th>
                      <th>Request Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Reliever Assigned</th>
                      <th>Supervisor Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((l) => (
                      <tr key={l.id}>
                        <td><strong>{l.id}</strong></td>
                        <td><strong>{l.staffName}</strong></td>
                        <td><small>{l.category}</small></td>
                        <td><span className="ops-focus-chip">{l.type}</span></td>
                        <td><small>{l.dates} ({l.days} days)</small></td>
                        <td><small>{l.reason}</small></td>
                        <td><small style={{ color: '#0369a1', fontWeight: 600 }}>{l.relieverStaff}</small></td>
                        <td>
                          {l.supervisorStatus === 'Approved' ? (
                            <span className="ops-badge ops-badge-completed">{l.supervisorStatus}</span>
                          ) : l.supervisorStatus === 'Rejected' ? (
                            <span className="ops-badge ops-badge-critical">{l.supervisorStatus}</span>
                          ) : (
                            <span className="ops-badge ops-badge-new">{l.supervisorStatus}</span>
                          )}
                        </td>
                        <td>
                          {l.supervisorStatus === 'Pending Review' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="ops-btn-primary ops-btn-sm"
                                type="button"
                                onClick={() => {
                                  campusOperationsStore.updateLeaveStatus(l.id, 'Approved');
                                  setLeaveRequests(campusOperationsStore.getLeaveRequests());
                                  showToast(`Approved leave request #${l.id}`);
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="ops-btn-secondary ops-btn-sm"
                                type="button"
                                onClick={() => {
                                  campusOperationsStore.updateLeaveStatus(l.id, 'Rejected');
                                  setLeaveRequests(campusOperationsStore.getLeaveRequests());
                                  showToast(`Rejected leave request #${l.id}`);
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Action Logged</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB M: COMPLAINTS & GRIEVANCES
              ========================================================= */}
          {activeTab === 'complaints-grievances' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <AlertTriangle size={20} color="#dc2626" /> Student &amp; Staff Infrastructure Complaints
                  </h3>
                  <p className="ops-card-subtitle">
                    Centralized grievance resolution desk cross-referenced with student hostel and academic portal filings
                  </p>
                </div>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Title &amp; Problem Statement</th>
                      <th>Assigned Crew</th>
                      <th>Priority</th>
                      <th>SLA Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((m) => (
                      <tr key={m.id}>
                        <td><strong>{m.id}</strong></td>
                        <td><strong>{m.location}</strong></td>
                        <td><span className="ops-focus-chip">{m.category}</span></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{m.reportedIssue}</div>
                          <small style={{ color: '#64748b' }}>Resolution: {m.resolutionNotes || 'In queue'}</small>
                        </td>
                        <td><small>{m.assignedStaff}</small></td>
                        <td>
                          <span className={`ops-badge ops-badge-${m.priority.toLowerCase()}`}>
                            {m.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`ops-badge ops-badge-${m.status.toLowerCase().replace(' ', '')}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB N: SAFETY & INCIDENT REPORTS
              ========================================================= */}
          {activeTab === 'safety-incidents' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <ShieldAlert size={20} color="#dc2626" /> Campus Safety &amp; Incident Reports
                  </h3>
                  <p className="ops-card-subtitle">
                    Occupational health, fire safety hazards, electrical faults, physical slips/falls and emergency corrective actions
                  </p>
                </div>
                <button
                  className="ops-btn-primary"
                  type="button"
                  onClick={() => setIsIncidentModalOpen(true)}
                >
                  <Plus size={15} /> Report New Incident
                </button>
              </div>

              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Incident ID</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Date &amp; Time</th>
                      <th>Description</th>
                      <th>Reported By</th>
                      <th>Severity</th>
                      <th>Corrective Action Taken</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((i) => (
                      <tr key={i.id}>
                        <td><strong>{i.id}</strong></td>
                        <td><span className="ops-focus-chip">{i.category}</span></td>
                        <td><small style={{ fontWeight: 600 }}>{i.location}</small></td>
                        <td><small>{i.dateTime}</small></td>
                        <td style={{ maxWidth: '240px' }}><small>{i.description}</small></td>
                        <td><small>{i.reportedBy}</small></td>
                        <td>
                          <span className={`ops-badge ops-badge-${i.severity.toLowerCase()}`}>
                            {i.severity}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px' }}><small style={{ color: '#0369a1' }}>{i.correctiveAction}</small></td>
                        <td>
                          <span className={`ops-badge ops-badge-${i.resolutionStatus === 'Closed' ? 'completed' : 'high'}`}>
                            {i.resolutionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB O: NOTIFICATIONS & ANNOUNCEMENTS
              ========================================================= */}
          {activeTab === 'notifications-announcements' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Bell size={20} color="#0284c7" /> Operational Directives &amp; Campus Notices
                  </h3>
                  <p className="ops-card-subtitle">
                    Real-time operational alerts, shift changes, storm advisories and task escalations
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: n.unread ? '#f0f9ff' : '#ffffff',
                    borderLeft: `4px solid ${n.type === 'URGENT' ? '#ef4444' : '#0284c7'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className={`ops-badge ops-badge-${n.type === 'URGENT' ? 'critical' : 'inprogress'}`}>{n.type}</span>
                      <small style={{ color: '#64748b' }}>{n.time}</small>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem' }}>{n.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB P: REPORTS & ANALYTICS
              ========================================================= */}
          {activeTab === 'reports-analytics' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <FileSpreadsheet size={20} color="#0284c7" /> Campus Operations Analytics &amp; Reports
                  </h3>
                  <p className="ops-card-subtitle">
                    Weekly task resolution ratios, category-wise breakdowns, shift turnaround times &amp; statutory compliance audits
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="ops-btn-secondary"
                    type="button"
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," +
                        "WorkOrderID,Title,Category,Priority,Status,AssignedStaff\n" +
                        tasks.map(e => `"${e.id}","${e.title}","${e.category}","${e.priority}","${e.status}","${e.assignedStaffName}"`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `Campus_Operations_Report_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast('Exported Campus Operations CSV report');
                    }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button
                    className="ops-btn-secondary"
                    type="button"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Print Dossier
                  </button>
                </div>
              </div>

              {/* Statistical Highlights Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Task Resolution Rate</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {tasks.length > 0 ? Math.round((metrics.completed / tasks.length) * 100) : 100}%
                  </div>
                  <small style={{ color: '#64748b' }}>{metrics.completed} of {tasks.length} tasks closed</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Avg Turnaround Time</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                    3.8 Hours
                  </div>
                  <small style={{ color: '#64748b' }}>Under 4h target SLA</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Preventive Compliance</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    100%
                  </div>
                  <small style={{ color: '#64748b' }}>Zero overdue PPM routines</small>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Hygiene Audit Average</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                    97.2%
                  </div>
                  <small style={{ color: '#64748b' }}>Across 28 campus washrooms</small>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Staff Category</th>
                      <th>Total Staff</th>
                      <th>Assigned Tasks</th>
                      <th>Completed</th>
                      <th>Pending</th>
                      <th>Performance Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => {
                      const count = staffList.filter(s => s.category === cat).length;
                      const catTasks = tasks.filter(t => t.category === cat);
                      const catCompleted = catTasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length;
                      const catPending = catTasks.length - catCompleted;
                      return (
                        <tr key={cat}>
                          <td><strong>{cat}</strong></td>
                          <td>{count} Staff</td>
                          <td>{catTasks.length} Work Orders</td>
                          <td><span style={{ color: '#16a34a', fontWeight: 600 }}>{catCompleted}</span></td>
                          <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>{catPending}</span></td>
                          <td>
                            <span className="ops-badge ops-badge-completed">Optimal (98%)</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB Q: SETTINGS & PERMISSIONS
              ========================================================= */}
          {activeTab === 'settings-permissions' && (
            <div className="ops-card">
              <div className="ops-card-header">
                <div>
                  <h3 className="ops-card-title">
                    <Settings size={20} color="#0284c7" /> Settings &amp; Category Permissions
                  </h3>
                  <p className="ops-card-subtitle">
                    Configure staff categories, shift schedule timings &amp; role-based access levels
                  </p>
                </div>
                <button
                  className="ops-btn-primary"
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                >
                  <Plus size={15} /> Add New Staff Category
                </button>
              </div>

              {/* Configured Categories List */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>
                  Configured Staff Categories ({categories.length} Registered)
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {categories.map((c) => (
                    <span
                      key={c}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={13} color="#0284c7" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Duty Shift Timings Configuration */}
              <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>
                  Standard Duty Shifts &amp; Handover Protocol
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>Morning Shift</strong>
                    <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: 600 }}>06:00 AM – 02:00 PM</div>
                    <small style={{ color: '#64748b' }}>Primary cleaning, gate check-in &amp; power line inspection</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>General Shift</strong>
                    <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: 600 }}>09:00 AM – 05:00 PM</div>
                    <small style={{ color: '#64748b' }}>Routine maintenance, carpenter work &amp; inventory store operations</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>Evening Shift</strong>
                    <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: 600 }}>02:00 PM – 10:00 PM</div>
                    <small style={{ color: '#64748b' }}>Laboratory lock-up, evening dining &amp; hostel gate verification</small>
                  </div>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>Night Shift</strong>
                    <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: 600 }}>10:00 PM – 06:00 AM</div>
                    <small style={{ color: '#64748b' }}>Perimeter patrol, generator standby &amp; campus quiet hours</small>
                  </div>
                </div>
              </div>

              {/* Role-Based Access Hierarchy */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Role-Based Access Hierarchy</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Support Staff</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Sees assigned work orders, own schedule, and materials request interface.
                    </p>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Floor Manager</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Sees assigned building/floor, staff in the zone, room issues &amp; escalation controls.
                    </p>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Campus Supervisor</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Full operational summaries, approvals, shift swaps, task allocations &amp; reports.
                    </p>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Authorized Admin</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Dynamic staff category additions, institutional safety policies &amp; root configs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================
          MODALS & DIALOGS
          ========================================================= */}

      {/* 1. Task Status Update Modal */}
      {selectedTaskModal && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Update Work Order #{selectedTaskModal.id}</h3>
              <button
                type="button"
                onClick={() => setSelectedTaskModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="ops-modal-body">
              <div style={{ marginBottom: '14px' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{selectedTaskModal.title}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {selectedTaskModal.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
                <div><strong>Category:</strong> {selectedTaskModal.category}</div>
                <div><strong>Location:</strong> {selectedTaskModal.location}</div>
                <div><strong>Priority:</strong> {selectedTaskModal.priority}</div>
                <div><strong>Assigned To:</strong> {selectedTaskModal.assignedStaffName}</div>
              </div>

              <div className="ops-form-group">
                <label className="ops-form-label">Task Status</label>
                <select
                  className="ops-form-control"
                  value={statusUpdateValue}
                  onChange={(e) => setStatusUpdateValue(e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Accepted">Accepted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Verified">Verified</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="ops-form-group">
                <label className="ops-form-label">Technician Completion Notes &amp; Observations</label>
                <textarea
                  className="ops-form-control"
                  rows={3}
                  value={statusNotesValue}
                  onChange={(e) => setStatusNotesValue(e.target.value)}
                  placeholder="e.g., Replacement part installed and tested under load. Working normally."
                />
              </div>
            </div>
            <div className="ops-modal-footer">
              <button
                type="button"
                className="ops-btn-secondary"
                onClick={() => setSelectedTaskModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ops-btn-primary"
                onClick={handleSaveTaskStatus}
              >
                Save Status Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Work Order Modal */}
      {isNewTaskModalOpen && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Raise New Campus Work Order</h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="ops-modal-body">
                <div className="ops-form-group">
                  <label className="ops-form-label">Work Order Title *</label>
                  <input
                    type="text"
                    required
                    className="ops-form-control"
                    placeholder="e.g. Repair water tap leaking continuously in washroom"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  />
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Detailed Description</label>
                  <textarea
                    className="ops-form-control"
                    rows={2}
                    placeholder="Describe problem, observed symptoms, and specific equipment involved..."
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Category *</label>
                    <select
                      className="ops-form-control"
                      value={newTaskForm.category}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Priority *</label>
                    <select
                      className="ops-form-control"
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Campus Location *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      placeholder="e.g. Academic Block A · Room 204"
                      value={newTaskForm.location}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                    />
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Due Date *</label>
                    <input
                      type="date"
                      required
                      className="ops-form-control"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Required Materials &amp; Spares</label>
                  <input
                    type="text"
                    className="ops-form-control"
                    placeholder="e.g. 1.5-inch PVC Pipe Coupler, Teflon Tape"
                    value={newTaskForm.requiredMaterials}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, requiredMaterials: e.target.value })}
                  />
                </div>
              </div>
              <div className="ops-modal-footer">
                <button
                  type="button"
                  className="ops-btn-secondary"
                  onClick={() => setIsNewTaskModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ops-btn-primary">
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Staff Member Modal */}
      {isNewStaffModalOpen && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Register New Operational Staff</h3>
              <button
                type="button"
                onClick={() => setIsNewStaffModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateStaff}>
              <div className="ops-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      placeholder="e.g. Mr. Kailash Panda"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    />
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Designation *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      placeholder="e.g. Assistant Electrician"
                      value={newStaffForm.designation}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Category *</label>
                    <select
                      className="ops-form-control"
                      value={newStaffForm.category}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Duty Shift *</label>
                    <select
                      className="ops-form-control"
                      value={newStaffForm.shift}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, shift: e.target.value })}
                    >
                      <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                      <option value="General (09:00 - 17:00)">General (09:00 - 17:00)</option>
                      <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                      <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Assigned Building</label>
                    <input
                      type="text"
                      className="ops-form-control"
                      placeholder="e.g. Academic Block B"
                      value={newStaffForm.assignedBuilding}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, assignedBuilding: e.target.value })}
                    />
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Assigned Floor</label>
                    <input
                      type="text"
                      className="ops-form-control"
                      placeholder="e.g. 2nd & 3rd Floor"
                      value={newStaffForm.assignedFloor}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, assignedFloor: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Phone Contact *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      value={newStaffForm.phone}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Email</label>
                    <input
                      type="email"
                      className="ops-form-control"
                      placeholder="staff@apnacampus.edu.in"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="ops-modal-footer">
                <button
                  type="button"
                  className="ops-btn-secondary"
                  onClick={() => setIsNewStaffModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ops-btn-primary">
                  Save Staff Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Staff Detail View Modal */}
      {selectedStaffDetail && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Staff Profile Dossier</h3>
              <button
                type="button"
                onClick={() => setSelectedStaffDetail(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="ops-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <img
                  src={selectedStaffDetail.avatar}
                  alt={selectedStaffDetail.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284c7' }}
                />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>{selectedStaffDetail.name}</h4>
                  <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.85rem' }}>
                    {selectedStaffDetail.designation}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    {selectedStaffDetail.id} • {selectedStaffDetail.department}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '0.82rem' }}>
                <div><strong>Staff Category:</strong> {selectedStaffDetail.category}</div>
                <div><strong>Assigned Team:</strong> {selectedStaffDetail.team}</div>
                <div><strong>Duty Shift:</strong> {selectedStaffDetail.shift}</div>
                <div><strong>Employment Status:</strong> {selectedStaffDetail.status}</div>
                <div><strong>Assigned Building:</strong> {selectedStaffDetail.assignedBuilding}</div>
                <div><strong>Assigned Floor:</strong> {selectedStaffDetail.assignedFloor}</div>
                <div><strong>Phone Contact:</strong> {selectedStaffDetail.phone}</div>
                <div><strong>Email:</strong> {selectedStaffDetail.email}</div>
                <div><strong>Date of Joining:</strong> {selectedStaffDetail.joiningDate}</div>
                <div><strong>Experience:</strong> {selectedStaffDetail.experience}</div>
              </div>
            </div>
            <div className="ops-modal-footer">
              <button
                type="button"
                className="ops-btn-primary"
                onClick={() => setSelectedStaffDetail(null)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Check-In Visitor Modal */}
      {isVisitorModalOpen && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Perimeter Security · Visitor Entry Check-In</h3>
              <button
                type="button"
                onClick={() => setIsVisitorModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCheckInVisitor}>
              <div className="ops-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Visitor Full Name *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      placeholder="e.g. Mr. Pradeep Mohanty"
                      value={visitorForm.visitorName}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                    />
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Organization / Parent of *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      placeholder="e.g. BPUT University / Parent"
                      value={visitorForm.organization}
                      onChange={(e) => setVisitorForm({ ...visitorForm, organization: e.target.value })}
                    />
                  </div>
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Purpose of Campus Visit *</label>
                  <input
                    type="text"
                    required
                    className="ops-form-control"
                    placeholder="e.g. Placement recruitment drive / Meeting with HOD"
                    value={visitorForm.purpose}
                    onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Host Person *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      placeholder="e.g. Dr. B. K. Sarap (Principal)"
                      value={visitorForm.hostPerson}
                      onChange={(e) => setVisitorForm({ ...visitorForm, hostPerson: e.target.value })}
                    />
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Host Department</label>
                    <input
                      type="text"
                      className="ops-form-control"
                      placeholder="e.g. Office of the Principal"
                      value={visitorForm.hostDept}
                      onChange={(e) => setVisitorForm({ ...visitorForm, hostDept: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Vehicle Registration #</label>
                    <input
                      type="text"
                      className="ops-form-control"
                      placeholder="e.g. OD-02-AX-1020"
                      value={visitorForm.vehicleNo}
                      onChange={(e) => setVisitorForm({ ...visitorForm, vehicleNo: e.target.value })}
                    />
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Visitor Badge # Allocated *</label>
                    <input
                      type="text"
                      required
                      className="ops-form-control"
                      value={visitorForm.badgeNo}
                      onChange={(e) => setVisitorForm({ ...visitorForm, badgeNo: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="ops-modal-footer">
                <button
                  type="button"
                  className="ops-btn-secondary"
                  onClick={() => setIsVisitorModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ops-btn-primary">
                  Issue Visitor Pass &amp; Open Gate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Resolve Maintenance Modal */}
      {selectedMntModal && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Resolve Maintenance Ticket #{selectedMntModal.id}</h3>
              <button
                type="button"
                onClick={() => setSelectedMntModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="ops-modal-body">
              <div style={{ marginBottom: '14px' }}>
                <strong style={{ fontSize: '1rem' }}>{selectedMntModal.reportedIssue}</strong>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  {selectedMntModal.location} • Requested by {selectedMntModal.requester}
                </div>
              </div>

              <div className="ops-form-group">
                <label className="ops-form-label">Resolution Notes &amp; Rectification Report *</label>
                <textarea
                  className="ops-form-control"
                  rows={3}
                  required
                  placeholder="Detail the repair completed, parts replaced, and verification test..."
                  value={mntResolutionNotes}
                  onChange={(e) => setMntResolutionNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="ops-modal-footer">
              <button
                type="button"
                className="ops-btn-secondary"
                onClick={() => setSelectedMntModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ops-btn-primary"
                onClick={handleResolveMaintenance}
              >
                Sign Off &amp; Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Issue Material Modal */}
      {isIssueModalOpen && selectedInventoryItem && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Issue Store Material</h3>
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleIssueMaterial}>
              <div className="ops-modal-body">
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                  <strong>{selectedInventoryItem.name}</strong> ({selectedInventoryItem.code})
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Available Stock: <strong>{selectedInventoryItem.availableQty} {selectedInventoryItem.unit}</strong> • Location: {selectedInventoryItem.location}
                  </div>
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Issue Quantity ({selectedInventoryItem.unit}) *</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedInventoryItem.availableQty}
                    required
                    className="ops-form-control"
                    value={issueQty}
                    onChange={(e) => setIssueQty(e.target.value)}
                  />
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Allocate To Work Order # *</label>
                  <select
                    className="ops-form-control"
                    value={issueWorkOrder}
                    onChange={(e) => setIssueWorkOrder(e.target.value)}
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>{t.id} — {t.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ops-modal-footer">
                <button
                  type="button"
                  className="ops-btn-secondary"
                  onClick={() => setIsIssueModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ops-btn-primary">
                  Confirm Material Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Add Staff Category Configurator Modal */}
      {isNewCategoryModalOpen && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Configure New Staff Category</h3>
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="ops-modal-body">
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px 0' }}>
                  Register additional custom operational categories into the unified Campus Operations system without code redeployment.
                </p>

                <div className="ops-form-group">
                  <label className="ops-form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    className="ops-form-control"
                    placeholder="e.g. Fire Safety Officer, Biometric Technician, Landscaping Crew"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
              </div>
              <div className="ops-modal-footer">
                <button
                  type="button"
                  className="ops-btn-secondary"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ops-btn-primary">
                  Save Staff Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Report Safety Incident Modal */}
      {isIncidentModalOpen && (
        <div className="ops-modal-overlay">
          <div className="ops-modal-card">
            <div className="ops-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Log Workplace Safety Incident</h3>
              <button
                type="button"
                onClick={() => setIsIncidentModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddIncident}>
              <div className="ops-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="ops-form-group">
                    <label className="ops-form-label">Incident Category *</label>
                    <select
                      className="ops-form-control"
                      value={incidentForm.category}
                      onChange={(e) => setIncidentForm({ ...incidentForm, category: e.target.value })}
                    >
                      <option value="Electrical Hazard">Electrical Hazard</option>
                      <option value="Slip & Fall Hazard">Slip & Fall Hazard</option>
                      <option value="Fire Safety Concern">Fire Safety Concern</option>
                      <option value="Equipment Failure">Equipment Failure</option>
                      <option value="Perimeter Security Breach">Perimeter Security Breach</option>
                    </select>
                  </div>

                  <div className="ops-form-group">
                    <label className="ops-form-label">Severity Level *</label>
                    <select
                      className="ops-form-control"
                      value={incidentForm.severity}
                      onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Specific Incident Location *</label>
                  <input
                    type="text"
                    required
                    className="ops-form-control"
                    placeholder="e.g. Block A Staircase 2nd Floor"
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                  />
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Incident Description *</label>
                  <textarea
                    required
                    rows={2}
                    className="ops-form-control"
                    placeholder="Describe sequence of events, observed risks, and conditions..."
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  />
                </div>

                <div className="ops-form-group">
                  <label className="ops-form-label">Immediate Corrective Action</label>
                  <input
                    type="text"
                    className="ops-form-control"
                    placeholder="e.g. Area cordoned off, caution tape placed, power isolated"
                    value={incidentForm.correctiveAction}
                    onChange={(e) => setIncidentForm({ ...incidentForm, correctiveAction: e.target.value })}
                  />
                </div>
              </div>
              <div className="ops-modal-footer">
                <button
                  type="button"
                  className="ops-btn-secondary"
                  onClick={() => setIsIncidentModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ops-btn-primary">
                  Log Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
