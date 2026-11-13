import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, UserCheck, Shield, Clock, Building2, Search, Filter, Plus,
  Edit2, Eye, ShieldAlert, Award, FileText, CheckCircle2, XCircle,
  AlertTriangle, RotateCcw, Calendar, Phone, Mail, ArrowRight,
  ExternalLink, Check, X, ShieldCheck, Download, CalendarCheck, UserPlus
} from 'lucide-react';
import './WardenManagement.css';
import AddNewWardenSection from './AddNewWardenSection.jsx';
import WardenPendingTasksModal from './WardenPendingTasksModal.jsx';

import {
  getAllWardens,
  saveWarden,
  setWardenAccountStatus,
  setWardenDutyStatus,
  getAssignmentHistory,
  reassignWarden,
  getWardenPermissions,
  updateWardenPermissions,
  applyPermissionsToAllWardens,
  syncPermissionsFromBackend,
  logAdminAction
} from '../../../services/wardenManagementStore.js';
import { api } from '../../../services/api.js';
import WardenEmployeeProfile from '../WardenEmployeeProfile.jsx';
import { getAllHostels, syncHostelsFromBackend } from '../../../services/hostelAttendanceStore.js';
import { saveHostelComplex } from '../../../services/hostelComplexStore.js';
import {
  getAllStaffLeaves,
  approveStaffLeave,
  rejectStaffLeave,
  applyStaffLeave,
  getLeaveSummary,
  evaluateAllWardensDutyStatus
} from '../../../services/hostelStaffLeaveStore.js';


const STANDARD_BLOCK_OPTIONS = [
  'All Blocks & Wings (Complete Complex)',
  'Block A (Rooms 101-220)',
  'Block B (Rooms 201-320)',
  'Block C (Rooms 301-420)',
  'Block D (Rooms 401-520)',
  'Wing A & Wing B (Floors 1-3)',
  'North Wing (Ground + 3 Floors)',
  'South Wing (Ground + 3 Floors)',
  'East Wing & West Wing',
  'Ground Floor & First Floor'
];

export default function WardenManagementSection({ account, initialTab = 'directory', showToast, onOpenProfile }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [wardens, setWardens] = useState(() => getAllWardens());
  const [hostels, setHostels] = useState(() => getAllHostels());
  const [assignmentHistory, setAssignmentHistory] = useState(() => getAssignmentHistory());

  // Real-time listener for hostel complex creation/updates and wardens updates, with backend synchronization
  useEffect(() => {
    let isMounted = true;
    syncHostelsFromBackend()
      .then(list => {
        if (isMounted && list && list.length > 0) {
          setHostels(list);
        }
      })
      .catch(err => {
        console.warn('Backend hostels sync fallback:', err?.message || err);
      });

    const handleHostelsUpdate = () => {
      setHostels(getAllHostels());
    };
    window.addEventListener('bput_hostels_updated', handleHostelsUpdate);
    window.addEventListener('bput_hostel_complexes_updated', handleHostelsUpdate);
    window.addEventListener('storage', handleHostelsUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('bput_hostels_updated', handleHostelsUpdate);
      window.removeEventListener('bput_hostel_complexes_updated', handleHostelsUpdate);
      window.removeEventListener('storage', handleHostelsUpdate);
    };
  }, []);

  // Fetch live wardens from backend API
  useEffect(() => {
    let isMounted = true;
    api.getWardens()
      .then(res => {
        if (isMounted && res) {
          const list = Array.isArray(res) ? res : (res.data && Array.isArray(res.data) ? res.data : null);
          if (list && list.length > 0) {
            setWardens(list);
          }
        }
      })
      .catch(err => {
        console.warn('Backend wardens fetch fallback:', err.message);
      });

    syncPermissionsFromBackend();
    return () => { isMounted = false; };
  }, []);

  // Sync tab when initialTab prop updates
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Real-time listener for wardens updates across all tabs and components
  useEffect(() => {
    const handleWardensUpdate = () => {
      reloadData();
    };
    window.addEventListener('bput_wardens_updated', handleWardensUpdate);
    window.addEventListener('bput_warden_created', handleWardensUpdate);
    window.addEventListener('bput_warden_status_changed', handleWardensUpdate);
    window.addEventListener('bput_warden_duty_changed', handleWardensUpdate);
    window.addEventListener('hostel_staff_leave_updated', handleWardensUpdate);
    window.addEventListener('storage', handleWardensUpdate);
    return () => {
      window.removeEventListener('bput_wardens_updated', handleWardensUpdate);
      window.removeEventListener('bput_warden_created', handleWardensUpdate);
      window.removeEventListener('bput_warden_status_changed', handleWardensUpdate);
      window.removeEventListener('bput_warden_duty_changed', handleWardensUpdate);
      window.removeEventListener('hostel_staff_leave_updated', handleWardensUpdate);
      window.removeEventListener('storage', handleWardensUpdate);
    };
  }, []);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hostelFilter, setHostelFilter] = useState('ALL');

  // Pending tasks modal state
  const [selectedWardenForTasks, setSelectedWardenForTasks] = useState(null);
  const [isPendingTasksModalOpen, setIsPendingTasksModalOpen] = useState(false);

  const handleOpenPendingTasks = (warden) => {
    setSelectedWardenForTasks(warden);
    setIsPendingTasksModalOpen(true);
  };

  // Real-time listener for task updates
  useEffect(() => {
    const handleTaskUpdate = (e) => {
      if (e.detail && e.detail.wardenId) {
        setWardens(prev => prev.map(w => {
          if ((w.id || '').toUpperCase() === (e.detail.wardenId || '').toUpperCase()) {
            return { ...w, pendingTasks: e.detail.pendingCount };
          }
          return w;
        }));
      }
    };
    window.addEventListener('apna_warden_tasks_updated', handleTaskUpdate);
    return () => window.removeEventListener('apna_warden_tasks_updated', handleTaskUpdate);
  }, []);

  // Modals state
  const [selectedProfileWarden, setSelectedProfileWarden] = useState(null);
  const [profileModalTab, setProfileModalTab] = useState('overview');

  const [isAddHostelModalOpen, setIsAddHostelModalOpen] = useState(false);
  const [addHostelForm, setAddHostelForm] = useState({
    name: '',
    type: 'Boys',
    totalFloors: 2,
    totalRooms: 50,
    bedsPerRoom: 3,
    totalBeds: 150,
    warden: '',
    contact: ''
  });

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignForm, setReassignForm] = useState({
    wardenId: '',
    newHostelId: 'hst-3',
    newHostelName: 'Gandhi Boys Residence',
    assignedBlocks: 'Block A (Rooms 101-220)',
    dutyShift: 'General / 24x7 Resident',
    shiftTimings: '06:00 AM - 10:00 PM',
    effectiveDate: new Date().toISOString().split('T')[0],
    relievingWarden: 'None',
    reason: 'Operational rebalancing for autumn semester'
  });

  const [isCustomBlock, setIsCustomBlock] = useState(false);
  const [customBlockInput, setCustomBlockInput] = useState('');
  const [isCustomRelieving, setIsCustomRelieving] = useState(false);
  const [customRelievingInput, setCustomRelievingInput] = useState('');

  const handleOpenReassignModal = (initialData = {}) => {
    const baseWardenId = initialData.wardenId || wardens[0]?.id || '';
    const assignedBlocks = initialData.assignedBlocks || 'Block A (Rooms 101-220)';
    const relievingWarden = initialData.relievingWarden || 'None';

    const isCustomB = !STANDARD_BLOCK_OPTIONS.includes(assignedBlocks);
    setIsCustomBlock(isCustomB);
    setCustomBlockInput(isCustomB ? assignedBlocks : '');

    const matchingWardenOption = wardens.some(w =>
      relievingWarden === w.name ||
      relievingWarden === `${w.name} (${w.id})`
    );
    const isCustomR = relievingWarden !== 'None' && !matchingWardenOption;
    setIsCustomRelieving(isCustomR);
    setCustomRelievingInput(isCustomR ? relievingWarden : '');

    setReassignForm({
      wardenId: baseWardenId,
      newHostelId: initialData.newHostelId || 'hst-3',
      newHostelName: initialData.newHostelName || 'Gandhi Boys Residence',
      assignedBlocks: assignedBlocks,
      dutyShift: initialData.dutyShift || 'General / 24x7 Resident',
      shiftTimings: initialData.shiftTimings || '06:00 AM - 10:00 PM',
      effectiveDate: initialData.effectiveDate || new Date().toISOString().split('T')[0],
      relievingWarden: relievingWarden,
      reason: initialData.reason || 'Operational rebalancing for autumn semester'
    });
    setIsReassignModalOpen(true);
  };

  // Evaluate and sync warden duty status based on active leaves
  useEffect(() => {
    const evaluated = evaluateAllWardensDutyStatus();
    if (evaluated && evaluated.length > 0) {
      setWardens(evaluated);
    }
  }, []);

  const [staffLeaves, setStaffLeaves] = useState(() => getAllStaffLeaves());
  const [leaveSummary, setLeaveSummary] = useState(() => getLeaveSummary());

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleApproveLeave = (leaveId, applicantName) => {
    const { updatedLeaves, summary } = approveStaffLeave(
      leaveId,
      'Approved and sanctioned by Hostel Administrator',
      account?.name || 'Hostel Admin'
    );
    setStaffLeaves(updatedLeaves);
    setLeaveSummary(summary);
    const evaluated = evaluateAllWardensDutyStatus();
    setWardens(evaluated);
    if (showToast) showToast(`✓ Leave sanctioned for ${applicantName}. Duty status updated.`);
  };

  const handleRejectLeave = (leaveId, applicantName) => {
    const reason = prompt('Enter administrative reason for rejecting leave application:');
    if (reason === null) return;
    const { updatedLeaves, summary } = rejectStaffLeave(
      leaveId,
      reason || 'Administrative rejection',
      account?.name || 'Hostel Admin'
    );
    setStaffLeaves(updatedLeaves);
    setLeaveSummary(summary);
    const evaluated = evaluateAllWardensDutyStatus();
    setWardens(evaluated);
    if (showToast) showToast(`Leave rejected for ${applicantName}`);
  };

  const handleResumeDuty = (wardenId, wardenName) => {
    if (window.confirm(`Mark ${wardenName} as back On Duty? This will conclude active leave and restore standard shift roster.`)) {
      setWardenDutyStatus(wardenId, 'On Duty', 'Warden reported back on campus duty', 'None Assigned');
      setWardens(getAllWardens());
      if (showToast) showToast(`✓ ${wardenName} resumed active resident duty.`);
    }
  };

  const [isRecordLeaveModalOpen, setIsRecordLeaveModalOpen] = useState(false);
  const [recordLeaveForm, setRecordLeaveForm] = useState({
    applicantWardenId: '',
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
    alternativeArrangement: '',
    relievingWarden: 'None Assigned',
    status: 'Approved by Hostel Admin'
  });

  const handleRecordStaffLeave = (e) => {
    e.preventDefault();
    const applicantWarden = wardens.find(w => w.id === recordLeaveForm.applicantWardenId) || wardens[0];
    if (!applicantWarden) {
      if (showToast) showToast('Please select an applicant official.');
      return;
    }
    const diffTime = Math.abs(new Date(recordLeaveForm.endDate) - new Date(recordLeaveForm.startDate));
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const payload = {
      applicantName: applicantWarden.name,
      employeeId: applicantWarden.id,
      designation: applicantWarden.designation,
      department: applicantWarden.department || 'Hostel Administration',
      leaveType: recordLeaveForm.leaveType,
      startDate: recordLeaveForm.startDate,
      endDate: recordLeaveForm.endDate,
      days,
      reason: recordLeaveForm.reason || 'Official administrative leave sanctioned.',
      alternativeArrangement: recordLeaveForm.alternativeArrangement || (recordLeaveForm.relievingWarden !== 'None Assigned' ? `Relieving Warden ${recordLeaveForm.relievingWarden} assigned to cover residential roll-call and emergency duties.` : 'Senior Caretaker will supervise roll-call duties.'),
      status: recordLeaveForm.status || 'Approved by Hostel Admin',
      approvedBy: account?.name || 'Mr. Rajesh Jena (Hostel Admin)'
    };

    applyStaffLeave(payload);
    setStaffLeaves(getAllStaffLeaves());
    const evaluated = evaluateAllWardensDutyStatus();
    setWardens(evaluated);
    setIsRecordLeaveModalOpen(false);
    if (showToast) showToast(`✓ Staff leave application registered and sanctioned for ${applicantWarden.name}`);
  };

  const getWardenInitials = (name) => {
    if (!name) return 'W';
    const clean = name.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.)\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0] || 'W').substring(0, 2).toUpperCase();
  };

  const getAvatarTheme = (idx) => {
    const themes = ['', 'purple', 'teal', 'amber'];
    return themes[idx % themes.length];
  };
  const [applyToAllWardensCheck, setApplyToAllWardensCheck] = useState(false);
  const [selectedPermWarden, setSelectedPermWarden] = useState(null);
  const [permRefreshKey, setPermRefreshKey] = useState(0);
  const [permsState, setPermsState] = useState({});

  // Reload wardens
  const reloadData = () => {
    setWardens(getAllWardens());
    setAssignmentHistory(getAssignmentHistory());
  };

  // Filtered wardens
  const filteredWardens = useMemo(() => {
    return wardens.filter(w => {
      const matchSearch =
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.hostelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || w.accountStatus === statusFilter;
      const matchHostel = hostelFilter === 'ALL' || w.hostelName === hostelFilter;

      return matchSearch && matchStatus && matchHostel;
    });
  }, [wardens, searchTerm, statusFilter, hostelFilter]);

  // Handle account suspension/reactivation
  const handleToggleStatus = (warden) => {
    const newStatus = warden.accountStatus === 'Active' ? 'Suspended' : 'Active';
    const confirmMsg = `Are you sure you want to ${newStatus === 'Suspended' ? 'suspend' : 'reactivate'} access for ${warden.name}?${
      newStatus === 'Suspended'
        ? '\n\nWhen suspended, this warden will be unable to take attendance, approve gate passes, or manage leaves/rooms in CMS, and will only have Read-Only view access.'
        : ''
    }`;
    if (!window.confirm(confirmMsg)) return;

    setWardenAccountStatus(warden.id, newStatus, 'Administrative executive action');
    reloadData();
    if (showToast) {
      if (newStatus === 'Suspended') {
        showToast(`⚠️ Warden ${warden.name} suspended. All CMS operations locked to Read-Only.`);
      } else {
        showToast(`✓ Warden ${warden.name} reactivated. Operational privileges restored.`);
      }
    }
  };

  // Handle Reassign Submit
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    try {
      reassignWarden({
        ...reassignForm,
        adminUser: account?.name || 'Chief Administrator'
      });
      setIsReassignModalOpen(false);
      reloadData();
      if (showToast) showToast(`✓ Warden successfully reassigned to ${reassignForm.newHostelName}!`);

      // Sync reassignment to backend API
      try {
        await api.updateWardenProfile(reassignForm.wardenId, {
          hostelName: reassignForm.newHostelName,
          assignedHostelOrPost: reassignForm.newHostelName,
          assignedBlocks: Array.isArray(reassignForm.assignedBlocks) ? reassignForm.assignedBlocks : [reassignForm.assignedBlocks],
          dutyShift: reassignForm.dutyShift,
          shiftTimings: reassignForm.shiftTimings
        });
        reloadData();
      } catch (backendErr) {
        console.warn('Backend warden reassignment sync warning:', backendErr?.message || backendErr);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Add Hostel Complex Submit
  const handleAddHostelSubmit = async (e) => {
    e.preventDefault();
    if (!addHostelForm.name.trim()) {
      alert('Please enter a valid hostel complex name.');
      return;
    }
    try {
      const created = saveHostelComplex({
        name: addHostelForm.name.trim(),
        type: addHostelForm.type,
        totalFloors: Number(addHostelForm.totalFloors) || 3,
        totalRooms: Number(addHostelForm.totalRooms) || 50,
        totalBeds: Number(addHostelForm.totalBeds) || 150,
        warden: addHostelForm.warden || 'Resident Warden',
        contact: addHostelForm.contact || '+91 94370 00000'
      });
      setHostels(getAllHostels());
      setIsAddHostelModalOpen(false);
      setAddHostelForm({
        name: '',
        type: 'Boys',
        totalFloors: 3,
        totalRooms: 50,
        totalBeds: 150,
        warden: '',
        contact: ''
      });
      if (showToast) showToast(`✓ Hostel complex "${created.name}" registered and synced to backend!`);
      // Re-sync with backend to ensure fresh complex list
      syncHostelsFromBackend().then(list => {
        if (list && list.length > 0) setHostels(list);
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Permissions Modal
  const handleOpenPermissions = async (warden) => {
    setSelectedPermWarden(warden);
    setPermsState(getWardenPermissions(warden.id));
    setApplyToAllWardensCheck(false);
    try {
      const response = await api.getWardenPermissions(warden.id);
      const savedPermissions = response?.data?.data;
      if (savedPermissions && typeof savedPermissions === 'object') {
        setPermsState(savedPermissions);
      }
    } catch (error) {
      console.warn('Backend warden permissions fetch fallback:', error?.message || error);
    }
  };

  // Save Permissions with Apply to All Wardens support
  const handleSavePermissions = async (forceApplyAll = false) => {
    if (!selectedPermWarden) return;
    const shouldApplyAll = forceApplyAll === true || applyToAllWardensCheck || selectedPermWarden.id === 'ALL';
    const targetWardenId = selectedPermWarden.id;
    const targetWardenName = selectedPermWarden.name;
    const targetPerms = { ...permsState };

    // 1. Immediately persist locally and broadcast reactive state
    if (shouldApplyAll) {
      applyPermissionsToAllWardens(targetPerms, 'Hostel Admin bulk matrix update for all wardens', false);
    } else {
      updateWardenPermissions(targetWardenId, targetPerms, 'Hostel Admin permission modification', false, false);
    }

    // 2. Automatically close modal immediately upon submit (User requirement)
    setSelectedPermWarden(null);
    setApplyToAllWardensCheck(false);
    setPermRefreshKey(k => k + 1);

    if (showToast) {
      showToast(shouldApplyAll
        ? '✓ Permissions updated for all hostel wardens and synced to backend!'
        : `✓ Operational permissions updated for ${targetWardenName} and synced to backend!`);
    }

    // 3. Persist to backend and database asynchronously in background
    if (shouldApplyAll) {
      api.applyWardenPermissionsToAll(targetPerms).catch(error => {
        console.warn('Backend warden permissions sync fallback:', error?.message || error);
      });
    } else {
      api.updateWardenPermissions(targetWardenId, targetPerms, false).catch(error => {
        console.warn('Backend warden permissions sync fallback:', error?.message || error);
      });
    }
  };

  if (selectedProfileWarden) {
    return (
      <WardenEmployeeProfile
        account={account}
        warden={selectedProfileWarden}
        onBack={() => setSelectedProfileWarden(null)}
      />
    );
  }

  return (
    <div className="wm-container">
      {/* Header - hide redundant duplicate title on duty-leaves or show compact toolbar */}
      {activeTab === 'duty-leaves' ? (
        <div className="wm-action-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="wm-badge" style={{ background: '#ede9fe', color: '#7c3aed' }}>Administrative Authority</span>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>
              Live Residential Lifecycle &amp; Warden Administration · Synchronized with Central Registry
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="had-btn had-btn-secondary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}
              onClick={() => handleOpenReassignModal()}
            >
              <RotateCcw size={13} /> Assign / Reassign Warden
            </button>
            <button
              type="button"
              className="had-btn had-btn-primary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => {
                setRecordLeaveForm({
                  applicantWardenId: wardens[0]?.id || '',
                  leaveType: 'Casual Leave',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                  reason: '',
                  alternativeArrangement: '',
                  relievingWarden: 'None Assigned',
                  status: 'Approved by Hostel Admin'
                });
                setIsRecordLeaveModalOpen(true);
              }}
            >
              <Plus size={13} /> Record Staff Leave
            </button>
          </div>
        </div>
      ) : (
        <div className="wm-header">
          <div className="wm-title">
            <h1>
              {activeTab === 'add-warden' && 'Register New Warden (Employee Onboarding)'}
              {activeTab === 'assignments' && 'Warden Assignments & Reliever Console'}
              {activeTab === 'permissions' && 'Granular Scoped Permissions Matrix for Wardens'}
              {activeTab === 'performance' && 'Warden Performance & Compliance Indicators'}
              {(activeTab === 'directory' || !activeTab) && 'Warden Directory & Operational Staffing'}
              <span className="wm-badge">Administrative Authority</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              {activeTab === 'add-warden' && 'Complete employment dossier, upload photograph, allocate residential block, and set operational credentials.'}
              {activeTab === 'assignments' && 'Reassign wardens to hostel complexes, rebalance residential blocks, and review handover audit history.'}
              {activeTab === 'permissions' && 'Configure operational permissions across attendance, room transfers, and material indents.'}
              {activeTab === 'performance' && 'Objective metrics: on-time roll call rate, 72h complaint resolution speed, and supervisory notes.'}
              {(activeTab === 'directory' || !activeTab) && 'Active resident wardens, assigned hostels, contact records, and employment status.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {activeTab === 'add-warden' && (
            <button
              className="had-btn had-btn-secondary"
              onClick={() => setActiveTab('directory')}
              style={{ border: '1px solid #cbd5e1' }}
            >
              ← Back to Directory
            </button>
          )}
        </div>
      </div>
      )}

      {/* TAB: ADD NEW WARDEN */}
      {activeTab === 'add-warden' && (
        <AddNewWardenSection
          showToast={showToast}
          onCancel={() => setActiveTab('directory')}
          onWardenCreated={(newWarden) => {
            reloadData();
            setActiveTab('directory');
            if (showToast) showToast(`✓ ${newWarden.name} (${newWarden.id}) registered into Warden Directory!`);
          }}
        />
      )}

      {/* TAB 1: WARDEN DIRECTORY */}
      {activeTab === 'directory' && (
        <div>
          {/* Filter Bar */}
          <div className="wm-controls-bar">
            <div className="wm-search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search warden by name, ID, hostel, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="had-filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Account Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>

              <select
                className="had-filter-select"
                value={hostelFilter}
                onChange={e => setHostelFilter(e.target.value)}
              >
                <option value="ALL">All Hostels ({hostels.length})</option>
                {hostels.map(h => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Warden Details</th>
                  <th>Assigned Hostel &amp; Blocks</th>
                  <th>Duty Shift</th>
                  <th>Account Status</th>
                  <th>Pending Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWardens.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '2px solid #3b82f6',
                          background: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.15)'
                        }}>
                          {w.avatar || w.photoUrl || w.photo ? (
                            <img
                              src={w.avatar || w.photoUrl || w.photo}
                              alt={w.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) {
                                  e.target.parentElement.innerText = getWardenInitials(w.name);
                                }
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8' }}>
                              {getWardenInitials(w.name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{w.name}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>ID: {w.id} · {w.designation}</div>
                          <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>{w.email} · {w.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{w.hostelName}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {Array.isArray(w.assignedBlocks) ? w.assignedBlocks.join(', ') : w.assignedBlocks}
                      </div>
                    </td>
                    <td>
                      <span className="had-badge neutral">{w.dutyShift}</span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>{w.shiftTimings}</div>
                    </td>
                    <td>
                      <span className={`had-badge ${w.accountStatus === 'Active' ? 'success' : 'danger'}`}>
                        {w.accountStatus}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: w.dutyStatus === 'On Leave' ? '#d97706' : '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: w.dutyStatus === 'On Leave' ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
                        Duty: {w.dutyStatus || 'On Duty'}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`wm-pending-badge-btn ${w.pendingTasks > 0 ? 'warning' : 'neutral'}`}
                        onClick={() => handleOpenPendingTasks(w)}
                        title={`Click to view all pending tasks and operational docket for ${w.name}`}
                      >
                        {w.pendingTasks > 0 ? (
                          <span className="pulse-dot" />
                        ) : (
                          <Clock size={12} />
                        )}
                        <span>{w.pendingTasks} Pending</span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          title="View Complete 13-Tab Dossier"
                          onClick={() => {
                            if (onOpenProfile) {
                              onOpenProfile(w);
                            } else {
                              setSelectedProfileWarden(w);
                            }
                          }}
                        >
                          <Eye size={12} /> Profile
                        </button>
                        <button
                          className="had-btn had-btn-secondary"
                          style={{
                            padding: '0.25rem 0.55rem',
                            fontSize: '0.72rem',
                            color: w.accountStatus === 'Active' ? '#dc2626' : '#059669',
                            borderColor: w.accountStatus === 'Active' ? '#fecaca' : '#a7f3d0'
                          }}
                          onClick={() => handleToggleStatus(w)}
                        >
                          {w.accountStatus === 'Active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WARDEN ASSIGNMENTS & REASSIGNMENT HISTORY */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Active Residential Hostels &amp; Supervising Wardens</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Current primary and relief warden allocation per building complex.
                </p>
              </div>
              <button
                className="had-btn had-btn-primary"
                onClick={() => handleOpenReassignModal()}
              >
                <Plus size={14} /> Reassign Warden
              </button>
            </div>

            <table className="had-table">
              <thead>
                <tr>
                  <th>Hostel Complex</th>
                  <th>Type &amp; Beds</th>
                  <th>Primary Warden</th>
                  <th>Assigned Blocks</th>
                  <th>Shift &amp; Duty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map(h => {
                  const assignedWarden = wardens.find(w => w.hostelName === h.name || w.hostelId === h.id);
                  return (
                    <tr key={h.id}>
                      <td>
                        <strong>{h.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Code: {h.code}</div>
                      </td>
                      <td>
                        <span className="had-badge info">{h.type}</span> · {h.totalBeds} Beds
                      </td>
                      <td>
                        {assignedWarden ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: '1.5px solid #3b82f6',
                              background: '#eff6ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {assignedWarden.avatar || assignedWarden.photoUrl || assignedWarden.photo ? (
                                <img
                                  src={assignedWarden.avatar || assignedWarden.photoUrl || assignedWarden.photo}
                                  alt={assignedWarden.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.parentElement) {
                                      e.target.parentElement.innerText = getWardenInitials(assignedWarden.name);
                                    }
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8' }}>
                                  {getWardenInitials(assignedWarden.name)}
                                </span>
                              )}
                            </div>
                            <div>
                              <strong>{assignedWarden.name}</strong>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{assignedWarden.email || h.contact}</div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <strong>{h.warden || 'Unassigned'}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{h.contact}</div>
                          </div>
                        )}
                      </td>
                      <td>
                        {assignedWarden?.assignedBlocks ? assignedWarden.assignedBlocks.join(', ') : 'All Blocks'}
                      </td>
                      <td>
                        <span className="had-badge neutral">{assignedWarden?.dutyShift || 'General'}</span>
                      </td>
                      <td>
                        <button
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          onClick={() => {
                            handleOpenReassignModal({
                              wardenId: assignedWarden?.id || wardens[0]?.id || '',
                              newHostelId: h.id,
                              newHostelName: h.name,
                              assignedBlocks: 'All Blocks & Wings (Complete Complex)',
                              dutyShift: assignedWarden?.dutyShift || 'General / 24x7 Resident',
                              relievingWarden: 'None',
                              reason: 'Administrative adjustment'
                            });
                          }}
                        >
                          Modify Assignment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Historical Log */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem', color: '#0f172a' }}>
              Warden Assignment &amp; Transfer Historical Audit Log ({assignmentHistory.length})
            </h3>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Effective Date</th>
                  <th>Warden</th>
                  <th>Previous Post</th>
                  <th>New Post &amp; Blocks</th>
                  <th>Authorized By</th>
                  <th>Relieving Official</th>
                  <th>Reason &amp; Handover Notes</th>
                </tr>
              </thead>
              <tbody>
                {assignmentHistory.map(hist => (
                  <tr key={hist.id}>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{hist.effectiveDate}</td>
                    <td><strong>{hist.wardenName}</strong></td>
                    <td>{hist.previousHostel}</td>
                    <td>
                      <strong style={{ color: '#7c3aed' }}>{hist.newHostel}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{hist.assignedBlocks}</div>
                    </td>
                    <td>{hist.assignedBy}</td>
                    <td>{hist.relievingWarden}</td>
                    <td style={{ maxWidth: '300px', fontSize: '0.75rem' }}>
                      <strong>{hist.reason}</strong>
                      <div style={{ color: '#059669', marginTop: '0.15rem' }}>{hist.handoverNotes}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WARDEN PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }} key={permRefreshKey}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', color: '#0f172a' }}>
                Granular Scoped Permissions Matrix for Wardens
              </h3>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b' }}>
                Hostel Admin can customize operational privileges for each warden. When admin gives or updates permission, it can be applied to all hostel wardens instantly.
              </p>
            </div>
            <button
              className="had-btn had-btn-primary"
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title="Configure matrix and apply to all resident wardens simultaneously"
              onClick={() => {
                setSelectedPermWarden({ id: 'ALL', name: 'All Resident Wardens', hostelName: 'All Campus Hostels' });
                setPermsState(getWardenPermissions('WRD-101'));
                setApplyToAllWardensCheck(true);
              }}
            >
              <ShieldCheck size={15} /> Apply Permissions to All Wardens
            </button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
            <table className="had-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '40%', padding: '0.9rem 1.25rem' }}>Warden</th>
                  <th style={{ width: '40%', padding: '0.9rem 1.25rem' }}>Hostel Scope</th>
                  <th style={{ width: '20%', padding: '0.9rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {wardens.map(w => (
                  <tr key={w.id}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '2px solid #3b82f6',
                          background: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.15)'
                        }}>
                          {w.avatar || w.photoUrl || w.photo ? (
                            <img
                              src={w.avatar || w.photoUrl || w.photo}
                              alt={w.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) {
                                  e.target.parentElement.innerText = getWardenInitials(w.name);
                                }
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8' }}>
                              {getWardenInitials(w.name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '0.92rem', display: 'block' }}>{w.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ID: {w.id} · {w.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.9rem', display: 'block' }}>{w.hostelName}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '3px' }}>
                        {Array.isArray(w.assignedBlocks) ? w.assignedBlocks.join(', ') : (w.assignedBlocks || 'All Blocks & Wings')}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        className="had-btn had-btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => handleOpenPermissions(w)}
                      >
                        <ShieldCheck size={14} /> Edit Matrix
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      {/* TAB 4: DUTY ROSTER & LEAVE MANAGEMENT */}
      {activeTab === 'duty-leaves' && (
        <div>
          {/* Summary KPI Cards */}
          <div className="wm-duty-kpi-grid">
            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <div className="wm-kpi-header-left">
                  <div className="wm-kpi-icon green"><UserCheck size={20} /></div>
                  <span className="wm-kpi-label">Active Wardens on Duty</span>
                </div>
                <span className="wm-kpi-badge green">
                  {wardens.filter(w => w.dutyStatus === 'On Duty').length} Active
                </span>
              </div>
              <div className="wm-kpi-val">
                {wardens.filter(w => w.dutyStatus === 'On Duty').length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Wardens</span>
              </div>
              <div className="wm-kpi-subtext" style={{ color: '#059669' }}>
                <span style={{ fontSize: '0.75rem' }}>●</span> Active 24×7 residential coverage
              </div>
            </div>

            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <div className="wm-kpi-header-left">
                  <div className="wm-kpi-icon amber"><Clock size={20} /></div>
                  <span className="wm-kpi-label">Wardens / Staff on Leave</span>
                </div>
                <span className="wm-kpi-badge amber">Relief Roster</span>
              </div>
              <div className="wm-kpi-val">
                {wardens.filter(w => w.dutyStatus === 'On Leave').length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Staff</span>
              </div>
              <div className="wm-kpi-subtext" style={{ color: '#d97706' }}>
                <span style={{ fontSize: '0.75rem' }}>○</span> Covered by assigned relief wardens
              </div>
            </div>

            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <div className="wm-kpi-header-left">
                  <div className="wm-kpi-icon purple"><Calendar size={20} /></div>
                  <span className="wm-kpi-label">Pending Leave Requests</span>
                </div>
                <span className="wm-kpi-badge purple">
                  {staffLeaves.filter(l => l.status === 'Pending Approval').length} Pending
                </span>
              </div>
              <div className="wm-kpi-val">
                {staffLeaves.filter(l => l.status === 'Pending Approval').length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Requests</span>
              </div>
              <div className="wm-kpi-subtext" style={{ color: '#7c3aed' }}>
                <span>⚡</span> Awaiting Administrative Sanction
              </div>
            </div>

            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <div className="wm-kpi-header-left">
                  <div className="wm-kpi-icon blue"><CheckCircle2 size={20} /></div>
                  <span className="wm-kpi-label">Total Staff Sanctions</span>
                </div>
                <span className="wm-kpi-badge blue">Authorized</span>
              </div>
              <div className="wm-kpi-val">
                {staffLeaves.filter(l => l.status === 'Approved by Hostel Admin').length} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Sanctions</span>
              </div>
              <div className="wm-kpi-subtext" style={{ color: '#0284c7' }}>
                <span>✓</span> Official sanctioned institutional leaves
              </div>
            </div>
          </div>

          {/* Section A: Active Warden Duty Shift Rosters */}
          <div className="wm-table-card">
            <div className="wm-table-card-header">
              <div>
                <h4>
                  <CalendarCheck size={18} color="#2563eb" /> Warden Shift Rosters &amp; Roll-Call Allocations
                </h4>
                <p>
                  Live operational duty shifts, residential complex allocation, and relieving warden arrangements.
                </p>
              </div>
              <button
                className="had-btn had-btn-primary"
                onClick={() => handleOpenReassignModal()}
              >
                <Plus size={14} /> Adjust Duty / Shift
              </button>
            </div>

            <table className="had-table">
              <thead>
                <tr>
                  <th>Warden</th>
                  <th>Designation</th>
                  <th>Assigned Hostel &amp; Blocks</th>
                  <th>Duty Status</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wardens.map((w, idx) => {
                  const safeHostel = w.hostelName && w.hostelName.length > 1
                    ? w.hostelName
                    : (w.hostelName ? `Hostel Complex ${w.hostelName.toUpperCase()}` : 'General Campus Complex');

                  return (
                    <tr key={w.id}>
                      <td>
                        <div className="wm-avatar-cell">
                          <div className={`wm-avatar-circle ${getAvatarTheme(idx)}`} style={{ overflow: 'hidden', padding: 0 }}>
                            {w.avatar || w.photoUrl || w.photo ? (
                              <img
                                src={w.avatar || w.photoUrl || w.photo}
                                alt={w.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.parentElement) {
                                    e.target.parentElement.innerText = getWardenInitials(w.name);
                                  }
                                }}
                              />
                            ) : (
                              getWardenInitials(w.name)
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.name}</div>
                            <small style={{ color: '#64748b', fontFamily: 'monospace' }}>{w.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>{w.designation}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{safeHostel}</div>
                        <small style={{ color: '#64748b' }}>
                          {Array.isArray(w.assignedBlocks) ? w.assignedBlocks.join(', ') : (w.assignedBlocks || 'All Blocks')}
                        </small>
                      </td>
                      <td>
                        <span className={`wm-status-pill ${w.dutyStatus === 'On Duty' ? 'on-duty' : 'on-leave'}`}>
                          <span className="wm-pulse-dot" />
                          {w.dutyStatus === 'On Duty' ? 'On Duty' : 'On Leave'}
                        </span>
                      </td>
                      <td>
                        <a href={`tel:${w.phone}`} className="wm-phone-pill" title="Call Warden">
                          <Phone size={12} /> {w.phone}
                        </a>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            className="had-btn had-btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              handleOpenReassignModal({
                                wardenId: w.id,
                                newHostelId: w.hostelId || 'hst-1',
                                newHostelName: w.hostelName,
                                assignedBlocks: Array.isArray(w.assignedBlocks) ? w.assignedBlocks[0] : w.assignedBlocks,
                                dutyShift: w.dutyShift || 'General / 24x7 Resident',
                                relievingWarden: w.relievingWarden || 'None',
                                reason: 'Shift & roster adjustment'
                              });
                            }}
                          >
                            <Edit2 size={12} /> Edit Roster
                          </button>
                          {w.dutyStatus === 'On Leave' && (
                            <button
                              className="had-btn had-btn-success"
                              style={{
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.74rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0'
                              }}
                              title="Early return / Warden has reported back on duty"
                              onClick={() => handleResumeDuty(w.id, w.name)}
                            >
                              <CheckCircle2 size={12} /> Resume Duty
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section B: Staff & Warden Leave Applications & Sanction Console */}
          <div className="wm-table-card">
            <div className="wm-table-card-header">
              <div>
                <h4>
                  <FileText size={18} color="#7c3aed" /> Warden &amp; Staff Leave Applications &amp; Sanctions
                </h4>
                <p>
                  Review leave applications, verify alternative duty arrangements, and grant official administrative sanctions.
                </p>
              </div>
              <button
                className="had-btn had-btn-secondary"
                style={{ border: '1px solid #cbd5e1' }}
                onClick={() => {
                  setRecordLeaveForm({
                    applicantWardenId: wardens[0]?.id || '',
                    leaveType: 'Casual Leave',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    reason: '',
                    alternativeArrangement: '',
                    relievingWarden: 'None Assigned',
                    status: 'Approved by Hostel Admin'
                  });
                  setIsRecordLeaveModalOpen(true);
                }}
              >
                <Plus size={14} /> Record Staff Leave
              </button>
            </div>

            <table className="had-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applicant Official</th>
                  <th>Leave Type</th>
                  <th>Duration &amp; Dates</th>
                  <th>Reason &amp; Handover Arrangement</th>
                  <th>Status</th>
                  <th>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffLeaves.map((leave, lIdx) => (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{leave.id}</div>
                      <small style={{ color: '#94a3b8' }}>Applied: {leave.appliedOn}</small>
                    </td>
                    <td>
                      <div className="wm-avatar-cell">
                        <div className={`wm-avatar-circle ${getAvatarTheme(lIdx + 1)}`} style={{ overflow: 'hidden', padding: 0 }}>
                          {leave.applicantAvatar || leave.avatar ? (
                            <img
                              src={leave.applicantAvatar || leave.avatar}
                              alt={leave.applicantName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement) {
                                  e.target.parentElement.innerText = getWardenInitials(leave.applicantName);
                                }
                              }}
                            />
                          ) : (
                            getWardenInitials(leave.applicantName)
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{leave.applicantName}</div>
                          <small style={{ color: '#64748b' }}>{leave.designation} · {leave.employeeId}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="had-badge purple" style={{ fontWeight: 700 }}>{leave.leaveType}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{leave.days} Day(s)</div>
                      <small style={{ color: '#64748b' }}>{leave.startDate} to {leave.endDate}</small>
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#1e293b' }}>{leave.reason}</div>
                      {leave.alternativeArrangement && (
                        <div className="wm-handover-box">
                          <strong style={{ color: '#059669' }}>Handover Arrangement:</strong> {leave.alternativeArrangement}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`had-badge ${
                        leave.status === 'Approved by Hostel Admin' ? 'green' :
                        leave.status === 'Rejected by Hostel Admin' ? 'red' : 'amber'
                      }`} style={{ fontWeight: 700 }}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Pending Approval' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="had-btn had-btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                            onClick={() => handleApproveLeave(leave.id, leave.applicantName)}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            className="had-btn had-btn-danger"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                            onClick={() => handleRejectLeave(leave.id, leave.applicantName)}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {leave.approvedBy ? `By ${leave.approvedBy}` : 'Processed'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PERFORMANCE & COMPLIANCE INDICATORS */}
      {activeTab === 'performance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {wardens.map(w => (
            <div key={w.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a' }}>{w.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.designation} · {w.hostelName}</div>
                </div>
                <span className="had-badge success">{w.attendanceCompliance}% Compliance</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed' }}>
                    {w.attendanceCompliance >= 98 ? '0' : '2'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Delayed Roll Calls</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                    18.4 hrs
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Avg Complaint Turnaround</div>
                </div>
                <div
                  style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onClick={() => handleOpenPendingTasks(w)}
                  title="Click to view all pending reviews & dockets"
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
                    {w.pendingTasks}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pending Reviews</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Roster Adherence</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.65rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.78rem', color: '#475569', flex: 1 }}>
                  <strong>Supervisor Note:</strong> {w.notes || 'Reliable operational execution.'}
                </div>
                <button
                  className="had-btn had-btn-secondary"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                  title="View Complete Warden CMS Profile"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile(w);
                    else setSelectedProfileWarden(w);
                  }}
                >
                  <Eye size={12} /> Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: REASSIGN WARDEN FORM */}
      {isReassignModalOpen && (
        <div className="wm-modal-backdrop" onClick={() => setIsReassignModalOpen(false)}>
          <div className="wm-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Assign / Reassign Warden</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setIsReassignModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReassignSubmit}>
              <div className="wm-modal-body">
                <div className="wm-form-grid">
                  <div className="wm-form-col-2">
                    <label className="wm-form-label">Select Warden *</label>
                    <select
                      className="wm-form-select"
                      value={reassignForm.wardenId}
                      onChange={e => setReassignForm({ ...reassignForm, wardenId: e.target.value })}
                      required
                    >
                      {wardens.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.id}) — Currently: {w.hostelName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="wm-form-label">Target Hostel Complex *</label>
                    <select
                      className="wm-form-select"
                      value={reassignForm.newHostelName}
                      onChange={e => {
                        const h = hostels.find(x => x.name === e.target.value);
                        setReassignForm({
                          ...reassignForm,
                          newHostelName: e.target.value,
                          newHostelId: h?.id || 'hst-1'
                        });
                      }}
                      required
                    >
                      {hostels.map(h => (
                        <option key={h.id} value={h.name}>{h.name}{h.type ? ` (${h.type})` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="wm-form-label">Authorized Residential Blocks *</label>
                    <select
                      className="wm-form-select"
                      value={isCustomBlock ? 'CUSTOM' : reassignForm.assignedBlocks}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'CUSTOM') {
                          setIsCustomBlock(true);
                          setReassignForm(prev => ({ ...prev, assignedBlocks: customBlockInput || '' }));
                        } else {
                          setIsCustomBlock(false);
                          setReassignForm(prev => ({ ...prev, assignedBlocks: val }));
                        }
                      }}
                      required
                    >
                      {STANDARD_BLOCK_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="CUSTOM">Custom / Other (Specify Manually)</option>
                    </select>

                    {isCustomBlock && (
                      <input
                        type="text"
                        className="wm-form-input"
                        style={{ marginTop: '0.45rem' }}
                        value={customBlockInput}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomBlockInput(val);
                          setReassignForm(prev => ({ ...prev, assignedBlocks: val }));
                        }}
                        placeholder="Type custom residential block(s) name..."
                        required
                        autoFocus
                      />
                    )}
                  </div>

                  <div>
                    <label className="wm-form-label">Duty Shift *</label>
                    <select
                      className="wm-form-select"
                      value={reassignForm.dutyShift}
                      onChange={e => setReassignForm({ ...reassignForm, dutyShift: e.target.value })}
                      required
                    >
                      <option value="General / 24x7 Resident">General / 24x7 Resident</option>
                      <option value="Morning Shift (07:00 AM - 03:00 PM)">Morning Shift (07:00 AM - 03:00 PM)</option>
                      <option value="Evening Shift (03:00 PM - 11:00 PM)">Evening Shift (03:00 PM - 11:00 PM)</option>
                      <option value="Night Shift (11:00 PM - 07:00 AM)">Night Shift (11:00 PM - 07:00 AM)</option>
                      <option value="Rotational Relief Shift">Rotational Relief Shift</option>
                    </select>
                  </div>

                  <div>
                    <label className="wm-form-label">Effective Date *</label>
                    <input
                      type="date"
                      className="wm-form-input"
                      value={reassignForm.effectiveDate}
                      onChange={e => setReassignForm({ ...reassignForm, effectiveDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="wm-form-label">Relieving Warden (if applicable)</label>
                    <select
                      className="wm-form-select"
                      value={isCustomRelieving ? 'CUSTOM' : (reassignForm.relievingWarden || 'None')}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'CUSTOM') {
                          setIsCustomRelieving(true);
                          setReassignForm(prev => ({ ...prev, relievingWarden: customRelievingInput || '' }));
                        } else {
                          setIsCustomRelieving(false);
                          setReassignForm(prev => ({ ...prev, relievingWarden: val }));
                        }
                      }}
                    >
                      <option value="None">None (No Relieving Warden)</option>
                      {wardens
                        .filter(w => w.id !== reassignForm.wardenId)
                        .map(w => (
                          <option key={w.id} value={`${w.name} (${w.id})`}>
                            {w.name} ({w.id}) — {w.designation}
                          </option>
                        ))}
                      <option value="CUSTOM">Custom / Other Official (Specify Manually)</option>
                    </select>

                    {isCustomRelieving && (
                      <input
                        type="text"
                        className="wm-form-input"
                        style={{ marginTop: '0.45rem' }}
                        value={customRelievingInput}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomRelievingInput(val);
                          setReassignForm(prev => ({ ...prev, relievingWarden: val }));
                        }}
                        placeholder="Type relieving warden name, ID, or designation..."
                        autoFocus
                      />
                    )}
                  </div>

                  <div className="wm-form-col-2">
                    <label className="wm-form-label">Administrative Justification / Reason *</label>
                    <textarea
                      rows={3}
                      className="wm-form-textarea"
                      value={reassignForm.reason}
                      onChange={e => setReassignForm({ ...reassignForm, reason: e.target.value })}
                      placeholder="Specify reason for reassignment (e.g. load rebalancing, new block commissioning)..."
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="wm-modal-footer">
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  onClick={() => setIsReassignModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="had-btn had-btn-primary">
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GRANULAR PERMISSIONS MATRIX */}
      {selectedPermWarden && (
        <div className="wm-modal-backdrop" onClick={() => setSelectedPermWarden(null)}>
          <div className="wm-modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(selectedPermWarden.avatar || selectedPermWarden.photoUrl || selectedPermWarden.photo) && (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid #3b82f6',
                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)'
                  }}>
                    <img
                      src={selectedPermWarden.avatar || selectedPermWarden.photoUrl || selectedPermWarden.photo}
                      alt={selectedPermWarden.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                    Operational Permissions: {selectedPermWarden.name} ({selectedPermWarden.id})
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Scope: {selectedPermWarden.hostelName}
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedPermWarden(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="wm-modal-body">
              <div className="wm-perm-grid">
                {[
                  { key: 'viewHostelRecords', label: 'View Hostel Records' },
                  { key: 'manageAttendance', label: 'Take & Record Roll Call' },
                  { key: 'submitAttendance', label: 'Submit Attendance to Admin' },
                  { key: 'viewRoomAllocations', label: 'View Bed Allotments' },
                  { key: 'manageRoomAllocations', label: 'Execute Bed Transfers' },
                  { key: 'reviewStudentLeaves', label: 'Review Resident Leaves' },
                  { key: 'approveOperationalRequests', label: 'Approve Operational Requests' },
                  { key: 'manageGatePasses', label: 'Verify Digital Gate Passes' },
                  { key: 'registerVisitors', label: 'Register Visitors at Reception' },
                  { key: 'recordDisciplinaryIncidents', label: 'Record Disciplinary Incidents' },
                  { key: 'manageComplaints', label: 'Assign & Complete Complaints' },
                  { key: 'createInventoryRequisitions', label: 'Raise Indents & Requisitions' },
                  { key: 'manageStaffDutyRosters', label: 'Configure Staff Rosters' },
                  { key: 'viewReports', label: 'View Operational Reports' },
                  { key: 'exportReports', label: 'Export Data (PII Protected)' },
                  { key: 'editHostelConfiguration', label: 'Edit Curfew & Policies' }
                ].map(item => (
                  <div key={item.key} className="wm-perm-item">
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>{item.label}</span>
                    <label className="wm-switch">
                      <input
                        type="checkbox"
                        checked={Boolean(permsState[item.key])}
                        onChange={e => setPermsState({ ...permsState, [item.key]: e.target.checked })}
                      />
                      <span className="wm-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              {/* Apply to All Wardens Switch */}
              <div style={{ marginTop: '1.25rem', padding: '0.9rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Apply this permission matrix to ALL Hostel Wardens</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    When enabled, saving will immediately update the permissions for every warden in the system and backend.
                  </div>
                </div>
                <label className="wm-switch">
                  <input
                    type="checkbox"
                    checked={applyToAllWardensCheck}
                    onChange={e => setApplyToAllWardensCheck(e.target.checked)}
                  />
                  <span className="wm-slider"></span>
                </label>
              </div>
            </div>
            <div className="wm-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                className="had-btn had-btn-secondary"
                onClick={() => {
                  setSelectedPermWarden(null);
                  setApplyToAllWardensCheck(false);
                }}
              >
                Cancel
              </button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {selectedPermWarden.id !== 'ALL' && (
                  <button
                    className="had-btn had-btn-secondary"
                    onClick={() => handleSavePermissions(false)}
                    title="Save only for this warden"
                  >
                    Save for {selectedPermWarden.name} Only
                  </button>
                )}
                <button
                  className="had-btn had-btn-primary"
                  onClick={() => handleSavePermissions(selectedPermWarden.id === 'ALL' || applyToAllWardensCheck)}
                >
                  {applyToAllWardensCheck || selectedPermWarden.id === 'ALL' ? '✓ Apply to ALL Hostel Wardens' : 'Save Permissions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: WARDEN PROFILE DOSSIER (13 TABS) */}
      {selectedProfileWarden && (
        <div className="wm-modal-backdrop" onClick={() => setSelectedProfileWarden(null)}>
          <div className="wm-modal" style={{ maxWidth: '850px', maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                  Warden Official Profile: {selectedProfileWarden.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  ID: {selectedProfileWarden.id} · {selectedProfileWarden.designation} · {selectedProfileWarden.hostelName}
                </span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedProfileWarden(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 1rem', overflowX: 'auto' }}>
              {[
                { id: 'overview', label: '1. Overview' },
                { id: 'details', label: '2. Personal/Official' },
                { id: 'hostels', label: '3. Hostels & Blocks' },
                { id: 'roster', label: '4. Shift & Roster' },
                { id: 'attendance', label: '5. Roll Call Compliance' },
                { id: 'compliance', label: '6. Performance & SLA' },
                { id: 'permissions', label: '7. Scoped Permissions' }
              ].map(t => (
                <button
                  key={t.id}
                  style={{
                    padding: '0.65rem 0.95rem',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: profileModalTab === t.id ? '#7c3aed' : '#64748b',
                    borderBottom: profileModalTab === t.id ? '2px solid #7c3aed' : '2px solid transparent',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => setProfileModalTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="wm-modal-body">
              {profileModalTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Status</span>
                      <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>{selectedProfileWarden.accountStatus}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Duty Status</span>
                      <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.95rem' }}>{selectedProfileWarden.dutyStatus}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Roll Call Compliance</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{selectedProfileWarden.attendanceCompliance}%</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Operational Summary</h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                    {selectedProfileWarden.name} is the primary supervising warden for <strong>{selectedProfileWarden.hostelName}</strong>, overseeing {selectedProfileWarden.activeResidentsCount || 160} residents across {selectedProfileWarden.totalBedsSupervised || 180} beds. He has maintained a {selectedProfileWarden.attendanceCompliance}% attendance submission compliance rate with zero unverified absences this semester.
                  </p>
                </div>
              )}

              {profileModalTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                  <div><strong>Full Name:</strong> {selectedProfileWarden.name}</div>
                  <div><strong>Employee/Warden ID:</strong> {selectedProfileWarden.id}</div>
                  <div><strong>Official Email:</strong> {selectedProfileWarden.email}</div>
                  <div><strong>Contact Phone:</strong> {selectedProfileWarden.phone}</div>
                  <div><strong>Qualifications:</strong> {selectedProfileWarden.qualification || 'B.Tech / MCA'}</div>
                  <div><strong>Office Location:</strong> {selectedProfileWarden.roomOffice || 'Ground Floor'}</div>
                  <div><strong>Emergency Contact:</strong> {selectedProfileWarden.emergencyContact || 'Available on file'}</div>
                  <div><strong>Joining Date:</strong> {selectedProfileWarden.joiningDate}</div>
                </div>
              )}

              {profileModalTab === 'hostels' && (
                <div>
                  <h4>Primary Assigned Complex</h4>
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <strong>{selectedProfileWarden.hostelName}</strong>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      Assigned Blocks: {Array.isArray(selectedProfileWarden.assignedBlocks) ? selectedProfileWarden.assignedBlocks.join(', ') : selectedProfileWarden.assignedBlocks}
                    </div>
                  </div>
                </div>
              )}

              {profileModalTab === 'roster' && (
                <div>
                  <h4>Duty Shift &amp; Timings</h4>
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
                    <div><strong>Shift Type:</strong> {selectedProfileWarden.dutyShift}</div>
                    <div style={{ marginTop: '0.35rem' }}><strong>Operating Timings:</strong> {selectedProfileWarden.shiftTimings}</div>
                    <div style={{ marginTop: '0.35rem', color: '#059669', fontWeight: 600 }}>Active Status: {selectedProfileWarden.dutyStatus}</div>
                  </div>
                </div>
              )}

              {profileModalTab === 'attendance' && (
                <div>
                  <h4>Night Roll Call &amp; Attendance Records</h4>
                  <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                    Submissions are synced directly to the Hostel Admin verification desk. Current overall score: <strong>{selectedProfileWarden.attendanceCompliance}%</strong>.
                  </p>
                </div>
              )}

              {profileModalTab === 'compliance' && (
                <div>
                  <h4>Performance &amp; SLA Compliance</h4>
                  <p style={{ fontSize: '0.825rem', color: '#475569' }}>
                    Warden compliance is tracked automatically against the 72-hour maintenance ticket SLA, daily 10:00 PM roll call certification, and 24-hour gate-pass turnaround policy.
                  </p>
                </div>
              )}

              {profileModalTab === 'permissions' && (
                <div>
                  <h4>Current Active Permissions</h4>
                  <button
                    className="had-btn had-btn-primary"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => {
                      setSelectedProfileWarden(null);
                      handleOpenPermissions(selectedProfileWarden);
                    }}
                  >
                    Open Permissions Matrix Editor
                  </button>
                </div>
              )}
            </div>

            <div className="wm-modal-footer">
              <button
                className="had-btn had-btn-secondary"
                onClick={() => setSelectedProfileWarden(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD HOSTEL COMPLEX MODAL */}
      {isAddHostelModalOpen && (
        <div className="wm-modal-overlay" onClick={() => setIsAddHostelModalOpen(false)}>
          <div className="wm-modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Building2 size={20} color="#2563eb" />
                <div>
                  <h3 className="wm-modal-title">Register New Hostel Complex</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Connects directly to backend API and database infrastructure
                  </p>
                </div>
              </div>
              <button className="wm-modal-close" onClick={() => setIsAddHostelModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHostelSubmit} className="wm-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="wm-form-label">Hostel Complex Name *</label>
                  <input
                    type="text"
                    className="wm-form-input"
                    placeholder="e.g., Kalam Boys Residence Phase 2"
                    value={addHostelForm.name}
                    onChange={e => setAddHostelForm({ ...addHostelForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="wm-form-label">Hostel Category *</label>
                    <select
                      className="wm-form-select"
                      value={addHostelForm.type}
                      onChange={e => setAddHostelForm({ ...addHostelForm, type: e.target.value })}
                    >
                      <option value="Boys">Boys Residence</option>
                      <option value="Girls">Girls Residence</option>
                      <option value="Co-Ed">Co-Ed Campus Facility</option>
                    </select>
                  </div>

                  <div>
                    <label className="wm-form-label">Total Floors *</label>
                    <input
                      type="number"
                      min="1"
                      className="wm-form-input"
                      value={addHostelForm.totalFloors}
                      onChange={e => setAddHostelForm({ ...addHostelForm, totalFloors: Number(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="wm-form-label">Total Rooms *</label>
                    <input
                      type="number"
                      min="1"
                      className="wm-form-input"
                      value={addHostelForm.totalRooms}
                      onChange={e => {
                        const roomsVal = Number(e.target.value) || 0;
                        const bpr = Number(addHostelForm.bedsPerRoom) || 3;
                        setAddHostelForm({
                          ...addHostelForm,
                          totalRooms: roomsVal,
                          totalBeds: roomsVal * bpr
                        });
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="wm-form-label">Beds in One Room (Sharing) *</label>
                    <input
                      type="number"
                      min="1"
                      className="wm-form-input"
                      value={addHostelForm.bedsPerRoom}
                      onChange={e => {
                        const bprVal = Number(e.target.value) || 0;
                        const rooms = Number(addHostelForm.totalRooms) || 0;
                        setAddHostelForm({
                          ...addHostelForm,
                          bedsPerRoom: bprVal,
                          totalBeds: rooms * bprVal
                        });
                      }}
                      placeholder="e.g. 3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="wm-form-label">Total Bed Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    className="wm-form-input"
                    value={addHostelForm.totalBeds}
                    onChange={e => setAddHostelForm({ ...addHostelForm, totalBeds: Number(e.target.value) || 1 })}
                    required
                  />
                  <small style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                    {Number(addHostelForm.totalRooms) > 0 && Number(addHostelForm.bedsPerRoom) > 0
                      ? `✓ Auto-calculated: ${addHostelForm.totalRooms} rooms × ${addHostelForm.bedsPerRoom} beds = ${Number(addHostelForm.totalRooms) * Number(addHostelForm.bedsPerRoom)} beds`
                      : 'Auto-calculates bed capacity'}
                  </small>
                </div>

                <div>
                  <label className="wm-form-label">Initial Supervising Warden (Optional)</label>
                  <select
                    className="wm-form-select"
                    value={addHostelForm.warden}
                    onChange={e => {
                      const selectedWName = e.target.value;
                      const matchedWarden = wardens.find(w => w.name === selectedWName);
                      setAddHostelForm({
                        ...addHostelForm,
                        warden: selectedWName,
                        contact: matchedWarden?.phone || matchedWarden?.mobileNo || addHostelForm.contact
                      });
                    }}
                  >
                    <option value="">-- Choose Assigned Warden from Register --</option>
                    {wardens.map(w => (
                      <option key={w.id} value={w.name}>
                        {w.name} ({w.id}) — {w.designation} [{w.hostelName || 'General'}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="wm-form-label">Emergency Helpline / Desk (Optional)</label>
                  <input
                    type="text"
                    className="wm-form-input"
                    placeholder="+91 94370 00000"
                    value={addHostelForm.contact}
                    onChange={e => setAddHostelForm({ ...addHostelForm, contact: e.target.value })}
                  />
                </div>
              </div>

              <div className="wm-modal-footer" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  onClick={() => setIsAddHostelModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="had-btn had-btn-primary"
                  style={{ background: '#2563eb', color: '#ffffff' }}
                >
                  <Building2 size={14} /> Register &amp; Sync Hostel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD STAFF LEAVE MODAL */}
      {isPendingTasksModalOpen && selectedWardenForTasks && (
        <WardenPendingTasksModal
          warden={selectedWardenForTasks}
          onClose={() => {
            setIsPendingTasksModalOpen(false);
            setSelectedWardenForTasks(null);
          }}
          showToast={showToast}
          onTaskUpdated={(wId, newCount) => {
            setWardens(prev => prev.map(w => (w.id || '').toUpperCase() === (wId || '').toUpperCase() ? { ...w, pendingTasks: newCount } : w));
          }}
        />
      )}

      {isRecordLeaveModalOpen && (
        <div className="wm-modal-backdrop" onClick={() => setIsRecordLeaveModalOpen(false)}>
          <div className="wm-modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Calendar size={20} color="#7c3aed" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Record &amp; Sanction Staff Leave</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Authorizes institutional leave for resident wardens and allocates relieving staff
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="had-btn had-btn-secondary"
                style={{ padding: '0.2rem 0.5rem', border: 'none', background: 'transparent' }}
                onClick={() => setIsRecordLeaveModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordStaffLeave} className="wm-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="wm-form-label">Applicant Official / Warden *</label>
                  <select
                    className="wm-form-select"
                    value={recordLeaveForm.applicantWardenId}
                    onChange={e => setRecordLeaveForm({ ...recordLeaveForm, applicantWardenId: e.target.value })}
                    required
                  >
                    <option value="">-- Select Warden / Official --</option>
                    {wardens.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.id}) — {w.designation} [{w.hostelName || 'General'}]
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="wm-form-label">Leave Type *</label>
                    <select
                      className="wm-form-select"
                      value={recordLeaveForm.leaveType}
                      onChange={e => setRecordLeaveForm({ ...recordLeaveForm, leaveType: e.target.value })}
                    >
                      <option value="Casual Leave">Casual Leave (CL)</option>
                      <option value="Special Leave">Special Leave (SL)</option>
                      <option value="Earned Leave">Earned Leave (EL)</option>
                      <option value="Duty Outside Campus">Duty Outside Campus (OD)</option>
                      <option value="Medical Emergency">Medical Emergency (Half Pay)</option>
                    </select>
                  </div>

                  <div>
                    <label className="wm-form-label">Sanction Decision *</label>
                    <select
                      className="wm-form-select"
                      value={recordLeaveForm.status}
                      onChange={e => setRecordLeaveForm({ ...recordLeaveForm, status: e.target.value })}
                    >
                      <option value="Approved by Hostel Admin">Direct Sanction (Approved)</option>
                      <option value="Pending Approval">Awaiting Verification (Pending)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="wm-form-label">Start Date *</label>
                    <input
                      type="date"
                      className="wm-form-input"
                      value={recordLeaveForm.startDate}
                      onChange={e => setRecordLeaveForm({ ...recordLeaveForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="wm-form-label">End Date *</label>
                    <input
                      type="date"
                      className="wm-form-input"
                      value={recordLeaveForm.endDate}
                      onChange={e => setRecordLeaveForm({ ...recordLeaveForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="wm-form-label">Relieving / Handover Official (Optional)</label>
                  <select
                    className="wm-form-select"
                    value={recordLeaveForm.relievingWarden}
                    onChange={e => setRecordLeaveForm({ ...recordLeaveForm, relievingWarden: e.target.value })}
                  >
                    <option value="None Assigned">-- None (Caretaker Supervised) --</option>
                    {wardens.filter(w => w.id !== recordLeaveForm.applicantWardenId).map(w => (
                      <option key={w.id} value={w.name}>
                        {w.name} ({w.id}) — {w.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="wm-form-label">Official Reason *</label>
                  <textarea
                    rows={2}
                    className="wm-form-input"
                    placeholder="Provide official grounds for leave sanction..."
                    value={recordLeaveForm.reason}
                    onChange={e => setRecordLeaveForm({ ...recordLeaveForm, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="wm-modal-footer" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="had-btn had-btn-secondary"
                  onClick={() => setIsRecordLeaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="had-btn had-btn-primary"
                  style={{ background: '#7c3aed', color: '#ffffff' }}
                >
                  <CheckCircle2 size={14} /> Record &amp; Sanction Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

