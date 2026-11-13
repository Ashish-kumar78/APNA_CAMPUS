import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  Building2,
  HardDrive,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  FileSpreadsheet,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  Check,
  X,
  UserCheck,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Package,
  Activity,
  Trash2,
  Bell
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';
import { BRANCHES_CONFIG } from '../StaffModules/labStaffData.js';

export default function AdminLaboratoryManagementModule({ account, isSuperAdmin = false }) {
  const isSuperAdminRole = Boolean(isSuperAdmin || account?.role === 'SUPER_ADMIN' || account?.role === 'super_admin');

  // Active Navigation & Filters
  const [activeTab, setActiveTab] = useState('labs'); // 'labs', 'inventory', 'maintenance', 'academics', 'reports'
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Super Admin Overrides & Audit Modal
  const [showSuperAdminAuditModal, setShowSuperAdminAuditModal] = useState(false);
  const [superAdminOverrideModal, setSuperAdminOverrideModal] = useState(null); // { type: 'complaint'|'requisition', data }
  const [superAdminOverrideStatus, setSuperAdminOverrideStatus] = useState('');
  const [superAdminOverrideRemarks, setSuperAdminOverrideRemarks] = useState('');

  // Academic Practical Session Attendance & Roster Inspector Modal
  const [inspectingSessionRoster, setInspectingSessionRoster] = useState(null);

  // Real-Time Broadcast & Alert Modals State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('Safety & Hazard');
  const [broadcastPriority, setBroadcastPriority] = useState('Critical');
  const [broadcastTargetBranch, setBroadcastTargetBranch] = useState('ALL');
  const [broadcastTargetRole, setBroadcastTargetRole] = useState('ALL');

  // Local state synced from labStaffStore
  const [storeState, setStoreState] = useState(() => labStaffStore.data);

  const activeBroadcastAlerts = useMemo(() => {
    return (storeState.notifications || []).filter(n => {
      const matchBranch = selectedBranch === 'ALL' || !n.branch || n.branch === 'ALL' || n.branch === selectedBranch;
      return n.unread && (n.isBroadcast || n.priority === 'Critical') && matchBranch;
    });
  }, [storeState.notifications, selectedBranch]);

  useEffect(() => {
    const unsub = labStaffStore.subscribe((next) => {
      setStoreState({ ...next });
    });
    // Trigger sync with backend
    labStaffStore.syncWithBackend().catch(() => {});
    return () => unsub();
  }, []);

  // Filtered dataset according to selectedBranch
  const laboratories = useMemo(() => {
    const list = storeState.laboratories || [];
    return selectedBranch === 'ALL' ? list : list.filter(l => l.department === selectedBranch);
  }, [storeState.laboratories, selectedBranch]);

  const equipment = useMemo(() => {
    const list = storeState.equipment || [];
    return selectedBranch === 'ALL' ? list : list.filter(e => e.department === selectedBranch);
  }, [storeState.equipment, selectedBranch]);

  const requisitions = useMemo(() => {
    const list = storeState.requisitions || [];
    return selectedBranch === 'ALL' ? list : list.filter(r => r.department === selectedBranch);
  }, [storeState.requisitions, selectedBranch]);

  const complaints = useMemo(() => {
    const list = storeState.complaints || [];
    return selectedBranch === 'ALL' ? list : list.filter(c => c.department === selectedBranch);
  }, [storeState.complaints, selectedBranch]);

  const maintenanceOrders = useMemo(() => {
    const list = storeState.maintenanceOrders || [];
    return selectedBranch === 'ALL' ? list : list.filter(m => m.department === selectedBranch);
  }, [storeState.maintenanceOrders, selectedBranch]);

  const timetable = useMemo(() => {
    const list = storeState.timetable || [];
    return selectedBranch === 'ALL' ? list : list.filter(t => t.department === selectedBranch);
  }, [storeState.timetable, selectedBranch]);

  // Executive KPI calculations
  const totalLabsCount = laboratories.length;
  const totalEquipmentCount = equipment.length;
  const pendingReqsCount = requisitions.filter(r => r.status === 'Pending Approval' || r.status === 'Submitted').length;
  const activeComplaintsCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Pending Admin Approval' || c.status === 'Approved' || c.status === 'In Progress').length;
  const damagedEquipmentCount = equipment.filter(e => e.status === 'Damaged' || e.condition === 'Damaged').length;

  // Modals state
  const [editingLabModal, setEditingLabModal] = useState(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [newLabForm, setNewLabForm] = useState({
    code: '',
    name: '',
    department: 'CSE',
    building: 'Turing Block-C',
    room: 'Room 301',
    capacity: 40,
    assignedStaff: 'Mr. Biswajit Sahoo',
    inChargeName: 'Prof. R. N. Mohanty'
  });

  // Filters for sub-sections
  const [inventoryFilter, setInventoryFilter] = useState('ALL'); // ALL, Requests, Approved, Issued, LowStock, Damaged
  const [maintenanceFilter, setMaintenanceFilter] = useState('ALL'); // ALL, Pending, Approved, InProgress, Completed

  // Requisitions & Stock Workflow Modals State
  const [reviewingReqModal, setReviewingReqModal] = useState(null);
  const [issuingStockModal, setIssuingStockModal] = useState(null);
  const [inspectingReqTimeline, setInspectingReqTimeline] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('APPROVE');
  const [adminReviewRemarks, setAdminReviewRemarks] = useState('');
  const [issuingQuantity, setIssuingQuantity] = useState(1);
  const [issuingStockNotes, setIssuingStockNotes] = useState('');

  const handleReviewRequisition = (e) => {
    e.preventDefault();
    if (!reviewingReqModal) return;
    try {
      const updated = labStaffStore.reviewRequisition(reviewingReqModal.id, {
        action: reviewDecision,
        adminRemarks: adminReviewRemarks,
        reviewerName: account?.name || 'Campus Administrator'
      });
      alert(`Requisition #${updated.requisitionNo || updated.id} review recorded: ${updated.status}`);
      setReviewingReqModal(null);
      setAdminReviewRemarks('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmStockIssuance = (e) => {
    e.preventDefault();
    if (!issuingStockModal) return;
    try {
      const qty = Number(issuingQuantity) || Number(issuingStockModal.quantity) || 1;
      labStaffStore.issueRequisitionStock(issuingStockModal.id, {
        issuedQuantity: qty,
        adminRemarks: issuingStockNotes,
        issuerName: account?.name || 'Central Store Officer'
      });
      alert(`Stock Issued: ${qty} units of "${issuingStockModal.itemName}" successfully credited to ${issuingStockModal.labId} (${issuingStockModal.department})!`);
      setIssuingStockModal(null);
      setIssuingStockNotes('');
      setIssuingQuantity(1);
    } catch (err) {
      alert(err.message);
    }
  };

  // Complaint Review & Work Order Progress Modals State
  const [reviewingComplaintModal, setReviewingComplaintModal] = useState(null);
  const [updatingWorkOrderModal, setUpdatingWorkOrderModal] = useState(null);
  const [inspectingComplaintWorkflow, setInspectingComplaintWorkflow] = useState(null);
  const [complaintAction, setComplaintAction] = useState('APPROVE');
  const [assignedTechnicianInput, setAssignedTechnicianInput] = useState('Central Engineering Services');
  const [complaintAdminRemarks, setComplaintAdminRemarks] = useState('');
  const [workOrderStatusInput, setWorkOrderStatusInput] = useState('Completed');
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');

  const handleReviewComplaint = (e) => {
    e.preventDefault();
    if (!reviewingComplaintModal) return;
    try {
      const updated = labStaffStore.reviewComplaint(reviewingComplaintModal.id, {
        action: complaintAction,
        assignedTechnician: complaintAction === 'APPROVE' ? assignedTechnicianInput : null,
        adminRemarks: complaintAdminRemarks,
        reviewerName: account?.name || 'Campus Administrator'
      });
      alert(`Complaint #${updated.complaintNumber || updated.id} review recorded: ${updated.status} ${updated.workOrderNumber ? `(Work Order #${updated.workOrderNumber})` : ''}`);
      setReviewingComplaintModal(null);
      setComplaintAdminRemarks('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateWorkOrder = (e) => {
    e.preventDefault();
    if (!updatingWorkOrderModal) return;
    try {
      const updated = labStaffStore.updateWorkOrderProgress(updatingWorkOrderModal.id, {
        status: workOrderStatusInput,
        resolutionNotes: resolutionNotesInput,
        technicianName: account?.name || 'Authorized Field Engineer'
      });
      alert(`Work Order #${updated.workOrderNumber || updated.id} progress updated to: ${updated.status}`);
      setUpdatingWorkOrderModal(null);
      setResolutionNotesInput('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Action handlers
  const handleSaveLab = (e) => {
    e.preventDefault();
    if (!newLabForm.code || !newLabForm.name) {
      alert('Lab code and name are required.');
      return;
    }
    const created = {
      id: newLabForm.code,
      code: newLabForm.code,
      name: newLabForm.name,
      department: newLabForm.department,
      building: newLabForm.building,
      room: newLabForm.room,
      capacity: Number(newLabForm.capacity) || 30,
      assignedStaff: newLabForm.assignedStaff,
      inCharge: newLabForm.inChargeName,
      safetyStatus: 'Audited & Compliant',
      status: 'Operational'
    };

    labStaffStore.data.laboratories = [created, ...(labStaffStore.data.laboratories || [])];
    labStaffStore.save();
    setShowAddLabModal(false);
    alert(`Laboratory ${created.code} successfully registered!`);
  };

  const handleUpdateLab = (e) => {
    e.preventDefault();
    if (!editingLabModal) return;
    labStaffStore.data.laboratories = labStaffStore.data.laboratories.map(l =>
      l.id === editingLabModal.id || l.code === editingLabModal.code ? { ...l, ...editingLabModal } : l
    );
    labStaffStore.save();
    setEditingLabModal(null);
    alert(`Laboratory ${editingLabModal.code || editingLabModal.id} updated!`);
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const rows = [
      ['Lab Code', 'Laboratory Name', 'Department', 'Building', 'Room', 'Capacity', 'Staff In-Charge'],
      ...laboratories.map(l => [
        l.code || l.id,
        `"${l.name}"`,
        l.department,
        `"${l.building || ''}"`,
        `"${l.room || ''}"`,
        l.capacity || 40,
        `"${l.assignedStaff || l.inCharge || ''}"`
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apna_campus_laboratories_${selectedBranch.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuperAdminOverrideSubmit = (e) => {
    e.preventDefault();
    if (!superAdminOverrideModal) return;

    try {
      if (superAdminOverrideModal.type === 'complaint') {
        labStaffStore.superAdminOverrideComplaint(superAdminOverrideModal.data.id, {
          newStatus: superAdminOverrideStatus,
          adminRemarks: superAdminOverrideRemarks,
          overriddenBy: account?.name || 'Super Administrator'
        });
      } else if (superAdminOverrideModal.type === 'requisition') {
        labStaffStore.superAdminOverrideRequisition(superAdminOverrideModal.data.id, {
          newStatus: superAdminOverrideStatus,
          adminRemarks: superAdminOverrideRemarks,
          overriddenBy: account?.name || 'Super Administrator'
        });
      }
      setSuperAdminOverrideModal(null);
    } catch (err) {
      alert(`Override failed: ${err.message}`);
    }
  };

  const handleDispatchBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    labStaffStore.broadcastNotification({
      title: broadcastTitle,
      message: broadcastMessage,
      category: broadcastCategory,
      priority: broadcastPriority,
      branch: broadcastTargetBranch,
      targetRole: broadcastTargetRole,
      sender: account?.name || (isSuperAdminRole ? 'Super Administrator' : 'Campus Administration')
    });

    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER & BRANCH SELECTION CONTROLS */}
      {/* ========================================================================= */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
          }}>
            <FlaskConical size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Central Laboratory Administration &amp; Governance
              </h2>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                Institutional ERP
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Multi-discipline lab supervision, equipment registers, requisition approvals, and repair work order oversight.
            </p>
          </div>
        </div>

        {/* Global Branch Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <Filter size={15} color="#64748b" />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>Discipline:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Disciplines (Institutional)</option>
              <option value="CSE">Computer Science &amp; Engineering</option>
              <option value="CSE_AI">CSE (Artificial Intelligence)</option>
              <option value="BIOTECH">Biotechnology</option>
              <option value="ECE">Electronics &amp; Communication</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="EEE">Electrical &amp; Electronics</option>
              <option value="CIVIL">Civil Engineering</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Export Register
          </button>

          <button
            type="button"
            onClick={() => setShowAddLabModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={15} /> Add Laboratory
          </button>

          {isSuperAdminRole && (
            <button
              type="button"
              onClick={() => setShowSuperAdminAuditModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
              }}
            >
              <ShieldCheck size={15} /> Super Admin Audit Trail
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
            }}
          >
            <Bell size={15} /> Dispatch Broadcast
          </button>
        </div>
      </div>

      {/* REAL-TIME CRITICAL BROADCAST ALERT BANNER */}
      {activeBroadcastAlerts.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{activeBroadcastAlerts[0].title}</span>
                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                  {activeBroadcastAlerts[0].priority}
                </span>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                  {activeBroadcastAlerts[0].branch}
                </span>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                  {activeBroadcastAlerts[0].category}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7f1d1d', marginTop: '2px' }}>
                {activeBroadcastAlerts[0].message} • <span style={{ color: '#64748b' }}>{activeBroadcastAlerts[0].sender || 'Campus Administration'} ({activeBroadcastAlerts[0].time})</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => labStaffStore.markNotificationRead(activeBroadcastAlerts[0].id)}
            style={{
              background: '#ffffff',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* SUPER ADMIN ROOT GOVERNANCE BANNER */}
      {isSuperAdminRole && (
        <div style={{
          background: 'linear-gradient(90deg, #f5f3ff, #ede9fe)',
          border: '1px solid #c4b5fd',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#5b21b6',
          fontSize: '0.84rem'
        }}>
          <ShieldCheck size={20} color="#7c3aed" />
          <div>
            <strong>Super Admin Root Governance Mode Active:</strong> Full cross-branch authority, emergency status overrides, direct stock provisioning &amp; institutional audit synchronization.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE KPI CARDS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>TOTAL LABORATORIES</span>
            <Building2 size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{totalLabsCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>● All 100% Operational</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>ACTIVE ASSETS / INSTRUMENTS</span>
            <HardDrive size={16} color="#0891b2" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{totalEquipmentCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Across {selectedBranch === 'ALL' ? '7 Disciplines' : selectedBranch}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>PENDING REQUISITIONS</span>
            <ClipboardCheck size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: pendingReqsCount > 0 ? '#b45309' : '#0f172a', marginTop: '6px' }}>{pendingReqsCount}</div>
          <div style={{ fontSize: '0.72rem', color: pendingReqsCount > 0 ? '#d97706' : '#16a34a', marginTop: '2px' }}>
            {pendingReqsCount > 0 ? 'Requires Admin Approval' : 'All Clear'}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>DAMAGED / COMPLAINTS</span>
            <AlertTriangle size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: activeComplaintsCount > 0 ? '#dc2626' : '#0f172a', marginTop: '6px' }}>{activeComplaintsCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#b91c1c', marginTop: '2px' }}>{damagedEquipmentCount} Damaged Units Linked</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>SCHEDULED SESSIONS</span>
            <Calendar size={16} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{timetable.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>Practical Classes Today</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5-SECTION MODULE NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '4px',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('labs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            borderBottom: activeTab === 'labs' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'labs' ? '#ffffff' : 'transparent',
            color: activeTab === 'labs' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <Building2 size={16} /> A. Laboratory Management ({laboratories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            borderBottom: activeTab === 'inventory' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'inventory' ? '#ffffff' : 'transparent',
            color: activeTab === 'inventory' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <HardDrive size={16} /> B. Equipment &amp; Inventory ({equipment.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maintenance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            borderBottom: activeTab === 'maintenance' ? '3px solid #ef4444' : '3px solid transparent',
            background: activeTab === 'maintenance' ? '#ffffff' : 'transparent',
            color: activeTab === 'maintenance' ? '#ef4444' : '#64748b',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <Wrench size={16} /> C. Complaints &amp; Maintenance ({complaints.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            borderBottom: activeTab === 'academics' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'academics' ? '#ffffff' : 'transparent',
            color: activeTab === 'academics' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <ClipboardCheck size={16} /> D. Academic Laboratory &amp; Attendance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            borderBottom: activeTab === 'reports' ? '3px solid #2563eb' : '3px solid transparent',
            background: activeTab === 'reports' ? '#ffffff' : 'transparent',
            color: activeTab === 'reports' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <FileSpreadsheet size={16} /> E. Laboratory Reports
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: LABORATORY MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'labs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Lab Code</th>
                    <th style={{ padding: '12px 16px' }}>Laboratory Name</th>
                    <th style={{ padding: '12px 16px' }}>Branch / Discipline</th>
                    <th style={{ padding: '12px 16px' }}>Location</th>
                    <th style={{ padding: '12px 16px' }}>Capacity</th>
                    <th style={{ padding: '12px 16px' }}>Staff In-Charge</th>
                    <th style={{ padding: '12px 16px' }}>Safety Audit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {laboratories.map((lab, idx) => (
                    <tr key={lab.code || lab.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>{lab.code || lab.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>{lab.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: '#eff6ff',
                          color: '#2563eb'
                        }}>
                          {lab.department}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.78rem' }}>
                        {lab.building || 'Campus Lab Block'}, {lab.room || 'Room 101'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {lab.capacity || 40} Stations
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{lab.assignedStaff || 'Mr. Biswajit Sahoo'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>HOD: {lab.inCharge || 'Department HOD'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: '#dcfce7',
                          color: '#15803d'
                        }}>
                          ✓ Audited &amp; Safe
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setEditingLabModal(lab)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: EQUIPMENT & INVENTORY MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'Requests', 'Approved', 'Issued', 'LowStock', 'Damaged'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setInventoryFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: inventoryFilter === f ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  background: inventoryFilter === f ? '#eff6ff' : '#ffffff',
                  color: inventoryFilter === f ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {f === 'ALL' ? 'All Instruments' :
                 f === 'Requests' ? `Equipment Requests (${requisitions.length})` :
                 f === 'Approved' ? 'Approved Requisitions' :
                 f === 'Issued' ? 'Issued Instruments' :
                 f === 'LowStock' ? 'Low Stock Alerts' : 'Damaged Equipment'}
              </button>
            ))}
          </div>

          {/* Conditionally Render Requisitions Console vs Instruments Table */}
          {(inventoryFilter === 'Requests' || inventoryFilter === 'Approved') ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    Laboratory Instrument Requisitions &amp; Stock Issuance Approvals
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Two-Tier Authority: Staff submits → Admin Reviews &amp; Approves → Stock Issued &amp; Inventory Automatically Incremented.
                  </p>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Requisition #</th>
                      <th style={{ padding: '12px 16px' }}>Instrument &amp; Category</th>
                      <th style={{ padding: '12px 16px' }}>Target Branch &amp; Lab</th>
                      <th style={{ padding: '12px 16px' }}>Qty &amp; Budget</th>
                      <th style={{ padding: '12px 16px' }}>Requester &amp; Reason</th>
                      <th style={{ padding: '12px 16px' }}>Priority</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisitions
                      .filter(r => {
                        if (inventoryFilter === 'Approved') return r.status === 'Approved' || r.status === 'Issued';
                        return true;
                      })
                      .map((req, idx) => (
                        <tr key={req.id || req.requisitionNo} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                            {req.requisitionNo || req.id}
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{req.requestDate}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.itemName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{req.category || 'Instruments'}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>
                              {req.department}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{req.labId}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{req.quantity || 1} Units</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Est. ₹{(req.estimatedBudget || req.estimatedCost || 15000).toLocaleString()}</div>
                          </td>
                          <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                            <div style={{ fontWeight: 600, color: '#334155' }}>{req.requestingStaff || 'Lab In-Charge'}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>{req.reason}</div>
                            {req.adminRemarks && (
                              <div style={{ fontSize: '0.72rem', color: '#d97706', marginTop: '2px' }}>
                                Admin: {req.adminRemarks}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              background: req.priority === 'Critical' ? '#fee2e2' : (req.priority === 'High' ? '#ffedd5' : '#f1f5f9'),
                              color: req.priority === 'Critical' ? '#b91c1c' : (req.priority === 'High' ? '#c2410c' : '#475569')
                            }}>
                              {req.priority || 'Normal'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background:
                                req.status === 'Issued' ? '#dcfce7' :
                                req.status === 'Approved' ? '#e0e7ff' :
                                req.status === 'Changes Requested' ? '#fffbeb' :
                                req.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                              color:
                                req.status === 'Issued' ? '#15803d' :
                                req.status === 'Approved' ? '#4338ca' :
                                req.status === 'Changes Requested' ? '#b45309' :
                                req.status === 'Rejected' ? '#b91c1c' : '#b45309',
                              border: `1px solid ${
                                req.status === 'Issued' ? '#bbf7d0' :
                                req.status === 'Approved' ? '#c7d2fe' :
                                req.status === 'Changes Requested' ? '#fde68a' :
                                req.status === 'Rejected' ? '#fecaca' : '#fde68a'
                              }`
                            }}>
                              {req.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                              {(req.status === 'Pending Approval' || req.status === 'Submitted') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewingReqModal(req);
                                    setReviewDecision('APPROVE');
                                    setAdminReviewRemarks('');
                                  }}
                                  style={{
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Review &amp; Decide
                                </button>
                              )}
                              {req.status === 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIssuingStockModal(req);
                                    setIssuingQuantity(req.quantity || 1);
                                    setIssuingStockNotes('');
                                  }}
                                  style={{
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Issue Stock
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setInspectingReqTimeline(req)}
                                style={{
                                  background: '#f8fafc',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Timeline
                              </button>
                              {isSuperAdminRole && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSuperAdminOverrideModal({ type: 'requisition', data: req });
                                    setSuperAdminOverrideStatus(req.status);
                                    setSuperAdminOverrideRemarks('');
                                  }}
                                  style={{
                                    background: '#7c3aed',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Root Override
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Instruments Register Table */
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Equipment ID</th>
                    <th style={{ padding: '12px 16px' }}>Instrument Name &amp; Category</th>
                    <th style={{ padding: '12px 16px' }}>Branch</th>
                    <th style={{ padding: '12px 16px' }}>Laboratory</th>
                    <th style={{ padding: '12px 16px' }}>Qty (Avail/Total)</th>
                    <th style={{ padding: '12px 16px' }}>Condition</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment
                    .filter(e => {
                      if (inventoryFilter === 'Damaged') return e.status === 'Damaged' || e.condition === 'Damaged';
                      if (inventoryFilter === 'Issued') return (e.issuedQuantity || 0) > 0;
                      return true;
                    })
                    .map((eq, idx) => (
                      <tr key={eq.id || eq.equipmentCode} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>{eq.id || eq.equipmentCode}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{eq.name || eq.equipmentName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{eq.category}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>
                            {eq.department}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.78rem' }}>{eq.assignedLab || eq.labCode}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          <span style={{ color: '#16a34a' }}>{eq.availableQuantity ?? (eq.quantity || 1)}</span> / {eq.quantity || 1}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: eq.condition === 'Damaged' ? '#fee2e2' : '#dcfce7',
                            color: eq.condition === 'Damaged' ? '#b91c1c' : '#15803d'
                          }}>
                            {eq.condition || 'Operational / Good'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background:
                              eq.status === 'Available' ? '#dcfce7' :
                              eq.status === 'Issued' ? '#eff6ff' :
                              eq.status === 'Under Maintenance' ? '#e0f2fe' :
                              eq.status === 'Damaged' ? '#fee2e2' : '#fef3c7',
                            color:
                              eq.status === 'Available' ? '#15803d' :
                              eq.status === 'Issued' ? '#1d4ed8' :
                              eq.status === 'Under Maintenance' ? '#0369a1' :
                              eq.status === 'Damaged' ? '#b91c1c' : '#b45309'
                          }}>
                            {eq.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedAssetDetail(eq)}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Inspect
                          </button>
                          {isSuperAdminRole && eq.status !== 'Decommissioned' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Decommission and write-off equipment "${eq.name || eq.equipmentName}"?`)) {
                                  labStaffStore.superAdminDecommissionEquipment(eq.id, {
                                    reason: 'Authorized asset lifecycle decommissioning & write-off',
                                    decommissionedBy: account?.name || 'Super Administrator'
                                  });
                                }
                              }}
                              style={{
                                marginLeft: '6px',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Decommission
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
      </div>
    )}

      {/* ========================================================================= */}
      {/* TAB C: COMPLAINT & MAINTENANCE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'Pending', 'Approved', 'Assigned', 'InProgress', 'Completed'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setMaintenanceFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: maintenanceFilter === f ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  background: maintenanceFilter === f ? '#fef2f2' : '#ffffff',
                  color: maintenanceFilter === f ? '#ef4444' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {f === 'ALL' ? 'All Complaints & Orders' :
                 f === 'Pending' ? `Pending Admin Review (${complaints.filter(c => c.status === 'Submitted' || c.status === 'Pending Admin Approval').length})` :
                 f === 'Approved' ? 'Approved Work Orders' :
                 f === 'Assigned' ? 'Assigned Technicians' :
                 f === 'InProgress' ? 'In Progress' : 'Completed Repairs'}
              </button>
            ))}
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Ticket #</th>
                    <th style={{ padding: '12px 16px' }}>Equipment / Asset</th>
                    <th style={{ padding: '12px 16px' }}>Discipline &amp; Lab</th>
                    <th style={{ padding: '12px 16px' }}>Issue Category</th>
                    <th style={{ padding: '12px 16px' }}>Priority</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Work Order #</th>
                    <th style={{ padding: '12px 16px' }}>Technician</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints
                    .filter(c => {
                      if (maintenanceFilter === 'Pending') return c.status === 'Submitted' || c.status === 'Pending Admin Approval';
                      if (maintenanceFilter === 'Approved') return c.status === 'Approved' || c.status === 'Assigned';
                      if (maintenanceFilter === 'Assigned') return c.status === 'Assigned';
                      if (maintenanceFilter === 'InProgress') return c.status === 'In Progress' || c.status === 'Waiting for Parts';
                      if (maintenanceFilter === 'Completed') return c.status === 'Completed' || c.status === 'Closed';
                      return true;
                    })
                    .map((c, idx) => (
                      <tr key={c.id || c.complaintNumber} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                          {c.complaintNumber || c.id}
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.reportedDate}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.equipmentName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Code: {c.equipmentId || 'Facility'}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>
                            {c.department}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{c.labId}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, background: '#f1f5f9', color: '#334155' }}>
                            {c.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: c.priority === 'Critical' ? '#fee2e2' : (c.priority === 'High' ? '#ffedd5' : '#f1f5f9'),
                            color: c.priority === 'Critical' ? '#b91c1c' : (c.priority === 'High' ? '#c2410c' : '#475569')
                          }}>
                            {c.priority}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background:
                              c.status === 'Completed' ? '#dcfce7' :
                              c.status === 'Approved' ? '#e0e7ff' :
                              c.status === 'In Progress' ? '#e0f2fe' :
                              c.status === 'Assigned' ? '#f3e8ff' : '#fef3c7',
                            color:
                              c.status === 'Completed' ? '#15803d' :
                              c.status === 'Approved' ? '#4338ca' :
                              c.status === 'In Progress' ? '#0369a1' :
                              c.status === 'Assigned' ? '#7e22ce' : '#b45309'
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: c.workOrderNumber ? '#0f172a' : '#94a3b8' }}>
                          {c.workOrderNumber || 'Awaiting Review'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#334155' }}>
                          {c.assignedTechnician || 'Unassigned'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                            {(c.status === 'Submitted' || c.status === 'Pending Admin Approval') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewingComplaintModal(c);
                                  setComplaintAction('APPROVE');
                                  setComplaintAdminRemarks('');
                                  setAssignedTechnicianInput('Central Engineering Services');
                                }}
                                style={{
                                  background: '#2563eb',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Review &amp; Authorize
                              </button>
                            )}
                            {(c.status === 'Approved' || c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Waiting for Parts') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setUpdatingWorkOrderModal(c);
                                  setWorkOrderStatusInput(c.status === 'Waiting for Parts' ? 'In Progress' : 'Completed');
                                  setResolutionNotesInput('');
                                }}
                                style={{
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Update Progress
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setInspectingComplaintWorkflow(c)}
                              style={{
                                background: '#f8fafc',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Timeline
                            </button>
                            {isSuperAdminRole && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSuperAdminOverrideModal({ type: 'complaint', data: c });
                                  setSuperAdminOverrideStatus(c.status);
                                  setSuperAdminOverrideRemarks('');
                                }}
                                style={{
                                  background: '#7c3aed',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Root Override
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB D: ACADEMIC LABORATORY MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'academics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* PRACTICAL SESSIONS TABLE */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>Today's Practical Sessions &amp; Attendance Tracking</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Cross-branch real-time attendance verification for undergraduate practical laboratories.</p>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Time Slot</th>
                    <th style={{ padding: '12px 16px' }}>Practical Subject &amp; Experiment</th>
                    <th style={{ padding: '12px 16px' }}>Discipline &amp; Lab</th>
                    <th style={{ padding: '12px 16px' }}>Batch</th>
                    <th style={{ padding: '12px 16px' }}>Faculty &amp; Technician</th>
                    <th style={{ padding: '12px 16px' }}>Attendance Marked</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((t, idx) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{t.timeSlot || t.time}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.subject}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Exp: {t.experiment}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>
                          {t.department}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{t.labId}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{t.batch}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{t.faculty}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tech: {t.technician || 'Central Lab Staff'}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16a34a' }}>
                        {t.attendanceTaken || t.attendanceMarked
                          ? `${t.presentCount ?? t.attendancePresent ?? 31} / ${t.expectedStudents ?? t.attendanceTotal ?? 32} (${Math.round(((t.presentCount ?? t.attendancePresent ?? 31) / (t.expectedStudents ?? t.attendanceTotal ?? 32)) * 100)}%)`
                          : 'Not Marked Yet'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: t.status === 'Completed' ? '#dcfce7' : (t.status === 'In-Progress' || t.status === 'In Progress' ? '#e0f2fe' : '#f1f5f9'),
                          color: t.status === 'Completed' ? '#15803d' : (t.status === 'In-Progress' || t.status === 'In Progress' ? '#0369a1' : '#475569')
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setInspectingSessionRoster(t)}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          View Roster
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* APPROVED EXPERIMENT SYLLABI REGISTER */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>Approved Practical Experiment Syllabi &amp; Continuous Evaluation</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Curriculum-aligned laboratory experiments with safety protocols and evaluation criteria.</p>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Experiment Code</th>
                    <th style={{ padding: '12px 16px' }}>Subject &amp; Title</th>
                    <th style={{ padding: '12px 16px' }}>Discipline</th>
                    <th style={{ padding: '12px 16px' }}>Target Lab</th>
                    <th style={{ padding: '12px 16px' }}>Required Instruments</th>
                    <th style={{ padding: '12px 16px' }}>Safety Protocols</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(storeState.experiments || [])
                    .filter(e => selectedBranch === 'ALL' || e.department === selectedBranch)
                    .map((exp, idx) => (
                      <tr key={exp.id || exp.code} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>{exp.code || exp.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{exp.title || exp.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{exp.subject}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb' }}>
                            {exp.department}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#475569' }}>{exp.labId || exp.targetLab || 'Core Lab'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#334155' }}>
                          {Array.isArray(exp.equipmentRequired) ? exp.equipmentRequired.join(', ') : (exp.equipmentRequired || 'Standard Instruments')}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.76rem', color: '#b91c1c' }}>
                          {exp.safetyProtocols || 'Standard Lab PPE, safety goggles & earthing checks'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {exp.status || 'Approved'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB E: LABORATORY REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
              Discipline-Wise Laboratory Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.keys(BRANCHES_CONFIG).map(branchKey => {
                const count = storeState.laboratories.filter(l => l.department === branchKey).length;
                return (
                  <div key={branchKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>{BRANCHES_CONFIG[branchKey]?.name || branchKey}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#2563eb' }}>{count} Labs</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
              Institutional Compliance &amp; Audit Readiness
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>AICTE / NBA Laboratory Norms:</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>100% Compliant</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Annual Safety Inspections Conducted:</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>Completed (Oct 2026)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Traceable Instrument Calibration:</span>
                <span style={{ fontWeight: 700, color: '#d97706' }}>92% Calibrated (2 Overdue)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Capital Asset Value:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>₹ 1,48,25,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD LABORATORY */}
      {/* ========================================================================= */}
      {showAddLabModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>Register New Laboratory</div>
              <button type="button" onClick={() => setShowAddLabModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveLab} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Lab Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE-LAB-05"
                    value={newLabForm.code}
                    onChange={(e) => setNewLabForm({ ...newLabForm, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Discipline *</label>
                  <select
                    value={newLabForm.department}
                    onChange={(e) => setNewLabForm({ ...newLabForm, department: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="CSE">CSE</option>
                    <option value="CSE_AI">CSE (AI)</option>
                    <option value="BIOTECH">Biotechnology</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">Mechanical</option>
                    <option value="EEE">Electrical</option>
                    <option value="CIVIL">Civil</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Laboratory Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Computing & Virtualization Lab"
                  value={newLabForm.name}
                  onChange={(e) => setNewLabForm({ ...newLabForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Building Block</label>
                  <input
                    type="text"
                    value={newLabForm.building}
                    onChange={(e) => setNewLabForm({ ...newLabForm, building: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Room Number</label>
                  <input
                    type="text"
                    value={newLabForm.room}
                    onChange={(e) => setNewLabForm({ ...newLabForm, room: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Student Capacity</label>
                  <input
                    type="number"
                    value={newLabForm.capacity}
                    onChange={(e) => setNewLabForm({ ...newLabForm, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Assigned Lab Staff</label>
                  <input
                    type="text"
                    value={newLabForm.assignedStaff}
                    onChange={(e) => setNewLabForm({ ...newLabForm, assignedStaff: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddLabModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Laboratory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT LABORATORY */}
      {/* ========================================================================= */}
      {editingLabModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>Edit Laboratory: {editingLabModal.code || editingLabModal.id}</div>
              <button type="button" onClick={() => setEditingLabModal(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateLab} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Laboratory Name</label>
                <input
                  type="text"
                  required
                  value={editingLabModal.name}
                  onChange={(e) => setEditingLabModal({ ...editingLabModal, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Building Block</label>
                  <input
                    type="text"
                    value={editingLabModal.building || ''}
                    onChange={(e) => setEditingLabModal({ ...editingLabModal, building: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Room Number</label>
                  <input
                    type="text"
                    value={editingLabModal.room || ''}
                    onChange={(e) => setEditingLabModal({ ...editingLabModal, room: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Capacity</label>
                  <input
                    type="number"
                    value={editingLabModal.capacity || 40}
                    onChange={(e) => setEditingLabModal({ ...editingLabModal, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Staff In-Charge</label>
                  <input
                    type="text"
                    value={editingLabModal.assignedStaff || ''}
                    onChange={(e) => setEditingLabModal({ ...editingLabModal, assignedStaff: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingLabModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INSPECT ASSET DETAIL */}
      {/* ========================================================================= */}
      {selectedAssetDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Asset Inspection Card</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{selectedAssetDetail.id || selectedAssetDetail.equipmentCode}</div>
              </div>
              <button type="button" onClick={() => setSelectedAssetDetail(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{selectedAssetDetail.name || selectedAssetDetail.equipmentName}</h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedAssetDetail.category} | Discipline: {selectedAssetDetail.department} | Lab: {selectedAssetDetail.assignedLab || selectedAssetDetail.labCode}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Total Quantity</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{selectedAssetDetail.quantity || 1}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Available</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>{selectedAssetDetail.availableQuantity ?? (selectedAssetDetail.quantity || 1)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Issued</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>{selectedAssetDetail.issuedQuantity || 0}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Condition:</strong> {selectedAssetDetail.condition || 'Operational / Good'}</div>
                <div><strong>Current Status:</strong> {selectedAssetDetail.status}</div>
                <div><strong>Purchase Info:</strong> {selectedAssetDetail.purchaseInfo || 'PO-2024-CENTRAL | GeM Govt Portal'}</div>
                <div><strong>Responsible Staff:</strong> {selectedAssetDetail.responsibleStaff || 'Mr. Biswajit Sahoo'}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAssetDetail(null)}
                  style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN REQUISITION DECISION (Approve / Reject / Changes) */}
      {/* ========================================================================= */}
      {reviewingReqModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '580px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Review Instrument Requisition</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{reviewingReqModal.requisitionNo || reviewingReqModal.id}</div>
              </div>
              <button type="button" onClick={() => setReviewingReqModal(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReviewRequisition} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>{reviewingReqModal.itemName}</div>
                <div style={{ color: '#64748b', marginTop: '2px' }}>
                  Requested: {reviewingReqModal.quantity || 1} Units for {reviewingReqModal.labId} ({reviewingReqModal.department})
                </div>
                <div style={{ color: '#334155', marginTop: '4px' }}>
                  <strong>Justification:</strong> {reviewingReqModal.reason || 'None provided'}
                </div>
                <div style={{ color: '#2563eb', fontWeight: 700, marginTop: '4px' }}>
                  Requester: {reviewingReqModal.requestingStaff} | Est. Budget: ₹{(reviewingReqModal.estimatedBudget || 15000).toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>Administrative Decision *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVE')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: reviewDecision === 'APPROVE' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: reviewDecision === 'APPROVE' ? '#dcfce7' : '#ffffff',
                      color: reviewDecision === 'APPROVE' ? '#15803d' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('REQUEST_CHANGES')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: reviewDecision === 'REQUEST_CHANGES' ? '2px solid #d97706' : '1px solid #cbd5e1',
                      background: reviewDecision === 'REQUEST_CHANGES' ? '#fef3c7' : '#ffffff',
                      color: reviewDecision === 'REQUEST_CHANGES' ? '#b45309' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⚠ Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('REJECT')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: reviewDecision === 'REJECT' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: reviewDecision === 'REJECT' ? '#fee2e2' : '#ffffff',
                      color: reviewDecision === 'REJECT' ? '#b91c1c' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Review Remarks / Allocation Budget Code</label>
                <textarea
                  rows={3}
                  placeholder="Specify approval conditions, GeM procurement budget allocation or change notes..."
                  value={adminReviewRemarks}
                  onChange={(e) => setAdminReviewRemarks(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setReviewingReqModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: reviewDecision === 'APPROVE' ? '#16a34a' : (reviewDecision === 'REJECT' ? '#dc2626' : '#d97706'),
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Submit Administrative Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ISSUE EQUIPMENT STOCK */}
      {/* ========================================================================= */}
      {issuingStockModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#16a34a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Issue Equipment Stock &amp; Update Inventory</div>
                <div style={{ fontSize: '0.74rem', color: '#dcfce7' }}>Approved Requisition #{issuingStockModal.requisitionNo || issuingStockModal.id}</div>
              </div>
              <button type="button" onClick={() => setIssuingStockModal(null)} style={{ background: 'none', border: 'none', color: '#dcfce7', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmStockIssuance} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>{issuingStockModal.itemName}</div>
                <div style={{ color: '#64748b', marginTop: '2px' }}>
                  Target Lab: <strong>{issuingStockModal.labId}</strong> | Department: <strong>{issuingStockModal.department}</strong>
                </div>
                <div style={{ color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                  ✓ Approved Quantity: {issuingStockModal.quantity || 1} Units
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Quantity to Issue *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={issuingQuantity}
                  onChange={(e) => setIssuingQuantity(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Stock Storage Rack / Allocation Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched from Central Store Bay 3, Rack A2"
                  value={issuingStockNotes}
                  onChange={(e) => setIssuingStockNotes(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px', fontSize: '0.74rem', color: '#1e40af' }}>
                <strong>Strict ERP Inventory Rule:</strong> Confirming stock issuance will automatically increment the active available equipment inventory for {issuingStockModal.department} in PostgreSQL and notify the lab staff.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIssuingStockModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Issue &amp; Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REQUISITION TIMELINE & AUDIT TRAIL */}
      {/* ========================================================================= */}
      {inspectingReqTimeline && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '620px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Requisition Lifecycle &amp; Audit Trail</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{inspectingReqTimeline.requisitionNo || inspectingReqTimeline.id}</div>
              </div>
              <button type="button" onClick={() => setInspectingReqTimeline(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{inspectingReqTimeline.itemName} ({inspectingReqTimeline.quantity || 1} Units)</div>
                <div style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '2px' }}>
                  Target: {inspectingReqTimeline.labId} ({inspectingReqTimeline.department}) | Status: <strong>{inspectingReqTimeline.status}</strong>
                </div>
              </div>

              {/* Timeline Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(inspectingReqTimeline.approvalTimeline || [
                  { step: 'Requisition Drafted', by: inspectingReqTimeline.requestingStaff, date: inspectingReqTimeline.requestDate, status: 'Completed' },
                  { step: 'HOD Recommendation', by: 'Head of Department', date: inspectingReqTimeline.requestDate, status: 'Completed' },
                  { step: `Admin Decision: ${inspectingReqTimeline.status}`, by: inspectingReqTimeline.reviewedBy || 'Campus Admin', date: inspectingReqTimeline.reviewedAt || 'Recorded', status: inspectingReqTimeline.status }
                ]).map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: step.status === 'Completed' || step.status === 'Approved' || step.status === 'Issued' ? '#dcfce7' : '#eff6ff',
                      color: step.status === 'Completed' || step.status === 'Approved' || step.status === 'Issued' ? '#15803d' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>{step.step}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>By {step.by} on {step.date}</div>
                      {step.notes && (
                        <div style={{ fontSize: '0.76rem', color: '#1e293b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', marginTop: '2px' }}>
                          Note: {step.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setInspectingReqTimeline(null)}
                  style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN COMPLAINT REVIEW & WORK ORDER ISSUANCE */}
      {/* ========================================================================= */}
      {reviewingComplaintModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Review Equipment Complaint &amp; Work Order</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Ticket #{reviewingComplaintModal.complaintNumber || reviewingComplaintModal.id}</div>
              </div>
              <button type="button" onClick={() => setReviewingComplaintModal(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReviewComplaint} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>{reviewingComplaintModal.equipmentName}</div>
                <div style={{ color: '#64748b', marginTop: '2px' }}>
                  Code: <strong>{reviewingComplaintModal.equipmentId || 'Facility'}</strong> | Lab: <strong>{reviewingComplaintModal.labId}</strong> ({reviewingComplaintModal.department})
                </div>
                <div style={{ color: '#334155', marginTop: '4px' }}>
                  <strong>Reported Fault:</strong> {reviewingComplaintModal.description}
                </div>
                <div style={{ color: '#dc2626', fontWeight: 700, marginTop: '4px' }}>
                  Category: {reviewingComplaintModal.category} | Priority: {reviewingComplaintModal.priority}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>Administrative Action *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setComplaintAction('APPROVE')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: complaintAction === 'APPROVE' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: complaintAction === 'APPROVE' ? '#dcfce7' : '#ffffff',
                      color: complaintAction === 'APPROVE' ? '#15803d' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Approve &amp; Issue Work Order
                  </button>

                  <button
                    type="button"
                    onClick={() => setComplaintAction('REJECT')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: complaintAction === 'REJECT' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: complaintAction === 'REJECT' ? '#fee2e2' : '#ffffff',
                      color: complaintAction === 'REJECT' ? '#b91c1c' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Reject Complaint
                  </button>
                </div>
              </div>

              {complaintAction === 'APPROVE' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Assign Maintenance Team / Technician *</label>
                  <select
                    value={assignedTechnicianInput}
                    onChange={(e) => setAssignedTechnicianInput(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                  >
                    <option value="Central Engineering Services">Central Engineering Services (Campus Substation)</option>
                    <option value="Electronics Calibration Cell (CIF)">Electronics Calibration Cell (Central Instrument Facility)</option>
                    <option value="HP Enterprise On-Site Support">HP Enterprise On-Site Support</option>
                    <option value="Eppendorf Field Service Cell">Eppendorf Field Service Cell</option>
                    <option value="Keysight TechSupport">Keysight TechSupport Regional Team</option>
                    <option value="Central Workshop Division">Central Workshop Maintenance Division</option>
                    <option value="Aimil Metrology Services">Aimil Metrology &amp; Hydraulic Services</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Review Remarks / Directives</label>
                <textarea
                  rows={2}
                  placeholder="Specify repair directives, OEM dispatch instructions or rejection justification..."
                  value={complaintAdminRemarks}
                  onChange={(e) => setComplaintAdminRemarks(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.74rem', color: '#991b1b' }}>
                <strong>Strict Governance Rule:</strong> Approving this repair generates a formal <strong>Work Order Number (WO-***)</strong> in PostgreSQL and transitions the equipment condition to <strong>"Under Maintenance"</strong>.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setReviewingComplaintModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: complaintAction === 'APPROVE' ? '#16a34a' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {complaintAction === 'APPROVE' ? 'Authorize Work Order' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPDATE WORK ORDER PROGRESS / RESOLUTION */}
      {/* ========================================================================= */}
      {updatingWorkOrderModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0284c7', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Update Maintenance &amp; Repair Status</div>
                <div style={{ fontSize: '0.74rem', color: '#e0f2fe' }}>Work Order #{updatingWorkOrderModal.workOrderNumber || updatingWorkOrderModal.id}</div>
              </div>
              <button type="button" onClick={() => setUpdatingWorkOrderModal(null)} style={{ background: 'none', border: 'none', color: '#e0f2fe', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateWorkOrder} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{updatingWorkOrderModal.equipmentName}</div>
                <div style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '2px' }}>
                  Lab: {updatingWorkOrderModal.labId} | Assigned: <strong>{updatingWorkOrderModal.assignedTechnician || 'Central Maintenance'}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Next Progress Stage *</label>
                <select
                  value={workOrderStatusInput}
                  onChange={(e) => setWorkOrderStatusInput(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  <option value="In Progress">In Progress (Active Bench Servicing)</option>
                  <option value="Waiting for Parts">Waiting for Parts (Spares Ordered / Requisitioned)</option>
                  <option value="Completed">Completed (Repair Verified &amp; Tested)</option>
                  <option value="Closed">Closed (Archived in Maintenance History)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Service, Parts Replaced &amp; Resolution Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail technical actions performed, replacement components, calibration values, and test pass confirmation..."
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              {workOrderStatusInput === 'Completed' && (
                <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.74rem', color: '#166534' }}>
                  <strong>ERP Auto-Restoration Rule:</strong> Marking this repair as Completed will immediately restore the equipment condition to <strong>"Operational / Good"</strong> and status to <strong>"Available"</strong> for laboratory practicals.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setUpdatingWorkOrderModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Progress Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPLAINT & WORK ORDER LIFECYCLE AUDIT STEPPER */}
      {/* ========================================================================= */}
      {inspectingComplaintWorkflow && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '640px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Equipment Repair Workflow Audit</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Ticket #{inspectingComplaintWorkflow.complaintNumber || inspectingComplaintWorkflow.id}
                  {inspectingComplaintWorkflow.workOrderNumber ? ` | Work Order #${inspectingComplaintWorkflow.workOrderNumber}` : ''}
                </div>
              </div>
              <button type="button" onClick={() => setInspectingComplaintWorkflow(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{inspectingComplaintWorkflow.equipmentName}</div>
                <div style={{ color: '#64748b', fontSize: '0.76rem', marginTop: '2px' }}>
                  Discipline: {inspectingComplaintWorkflow.department} | Lab: {inspectingComplaintWorkflow.labId} | Current Status: <strong>{inspectingComplaintWorkflow.status}</strong>
                </div>
              </div>

              {/* 5-Stage Stepper */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>1. Complaint Lodged by Staff Lab</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>By {inspectingComplaintWorkflow.reportedBy} on {inspectingComplaintWorkflow.reportedDate}</div>
                    <div style={{ fontSize: '0.76rem', color: '#334155', marginTop: '2px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                      {inspectingComplaintWorkflow.description}
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: inspectingComplaintWorkflow.workOrderNumber ? '#dcfce7' : '#fef3c7',
                    color: inspectingComplaintWorkflow.workOrderNumber ? '#15803d' : '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {inspectingComplaintWorkflow.workOrderNumber ? '✓' : '2'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>2. Admin Approval &amp; Work Order Generation</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Status: {inspectingComplaintWorkflow.status} | Work Order #: {inspectingComplaintWorkflow.workOrderNumber || 'Awaiting Authorization'}
                    </div>
                    {inspectingComplaintWorkflow.adminRemarks && (
                      <div style={{ fontSize: '0.76rem', color: '#d97706', marginTop: '2px' }}>
                        Admin Directive: {inspectingComplaintWorkflow.adminRemarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: inspectingComplaintWorkflow.assignedTechnician ? '#dcfce7' : '#f1f5f9',
                    color: inspectingComplaintWorkflow.assignedTechnician ? '#15803d' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {inspectingComplaintWorkflow.assignedTechnician ? '✓' : '3'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>3. Technician Assignment</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Assigned: {inspectingComplaintWorkflow.assignedTechnician || 'Unassigned'}
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: inspectingComplaintWorkflow.status === 'Completed' || inspectingComplaintWorkflow.status === 'Closed' ? '#dcfce7' : (inspectingComplaintWorkflow.status === 'In Progress' ? '#e0f2fe' : '#f1f5f9'),
                    color: inspectingComplaintWorkflow.status === 'Completed' || inspectingComplaintWorkflow.status === 'Closed' ? '#15803d' : (inspectingComplaintWorkflow.status === 'In Progress' ? '#0369a1' : '#94a3b8'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {inspectingComplaintWorkflow.status === 'Completed' || inspectingComplaintWorkflow.status === 'Closed' ? '✓' : '4'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>4. Repair Servicing &amp; Resolution</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Status: {inspectingComplaintWorkflow.status}</div>
                    {inspectingComplaintWorkflow.resolutionNotes && (
                      <div style={{ fontSize: '0.76rem', color: '#15803d', marginTop: '2px', background: '#f0fdf4', padding: '4px 8px', borderRadius: '4px' }}>
                        Service Log: {inspectingComplaintWorkflow.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 5 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: inspectingComplaintWorkflow.status === 'Completed' || inspectingComplaintWorkflow.status === 'Closed' ? '#dcfce7' : '#f1f5f9',
                    color: inspectingComplaintWorkflow.status === 'Completed' || inspectingComplaintWorkflow.status === 'Closed' ? '#15803d' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {inspectingComplaintWorkflow.status === 'Completed' || inspectingComplaintWorkflow.status === 'Closed' ? '✓' : '5'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>5. Restoration to Available Equipment Stock</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {inspectingComplaintWorkflow.status === 'Completed' || inspectingComplaintWorkflow.status === 'Closed'
                        ? 'Equipment condition restored to Operational / Good and status reset to Available.'
                        : 'Awaiting repair completion and sign-off before returning to active stock.'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setInspectingComplaintWorkflow(null)}
                  style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUPER ADMIN ROOT GOVERNANCE OVERRIDE */}
      {/* ========================================================================= */}
      {superAdminOverrideModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
            border: '2px solid #7c3aed'
          }}>
            <div style={{ background: '#7c3aed', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>Super Admin Root Authority Override</div>
                  <div style={{ fontSize: '0.74rem', color: '#ede9fe' }}>
                    Mutating {superAdminOverrideModal.type === 'complaint' ? 'Repair Ticket' : 'Requisition'} #{superAdminOverrideModal.data.complaintNumber || superAdminOverrideModal.data.requisitionNo || superAdminOverrideModal.data.id}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setSuperAdminOverrideModal(null)} style={{ background: 'none', border: 'none', color: '#ede9fe', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSuperAdminOverrideSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#4c1d95' }}>
                  {superAdminOverrideModal.data.equipmentName || superAdminOverrideModal.data.itemName}
                </div>
                <div style={{ color: '#6d28d9', fontSize: '0.76rem', marginTop: '2px' }}>
                  Branch: <strong>{superAdminOverrideModal.data.department}</strong> | Current Status: <strong>{superAdminOverrideModal.data.status}</strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Force Override Status To *</label>
                <select
                  value={superAdminOverrideStatus}
                  onChange={(e) => setSuperAdminOverrideStatus(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  {superAdminOverrideModal.type === 'complaint' ? (
                    <>
                      <option value="Submitted">Submitted (Pending Initial Review)</option>
                      <option value="Approved">Approved (Work Order Generated)</option>
                      <option value="Assigned">Assigned (Technician Dispatched)</option>
                      <option value="In Progress">In Progress (Active Bench Servicing)</option>
                      <option value="Waiting for Parts">Waiting for Parts</option>
                      <option value="Completed">Completed (Auto-Restore to Available)</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Closed">Closed</option>
                    </>
                  ) : (
                    <>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Issued">Issued (Stock Added)</option>
                      <option value="Changes Requested">Changes Requested</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Administrative Override Justification *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State root directive, council exception, or emergency audit order..."
                  value={superAdminOverrideRemarks}
                  onChange={(e) => setSuperAdminOverrideRemarks(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.74rem', color: '#991b1b' }}>
                <strong>Root Authority Override Action:</strong> This action bypasses standard departmental approval queues and directly mutates ERP state. An immutable event will be recorded in the institutional audit trail.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSuperAdminOverrideModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Root Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUPER ADMIN INSTITUTIONAL AUDIT TRAIL */}
      {/* ========================================================================= */}
      {showSuperAdminAuditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '850px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ background: '#1e1b4b', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#a78bfa" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>Laboratory System-Wide Governance &amp; Audit Trail</div>
                  <div style={{ fontSize: '0.74rem', color: '#c7d2fe' }}>Immutable log of administrative overrides, status mutations &amp; stock issuance</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowSuperAdminAuditModal(false)} style={{ background: 'none', border: 'none', color: '#c7d2fe', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {labStaffStore.getAuditLogs().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <ShieldCheck size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>No Administrative Overrides Logged</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Standard operating procedures are currently being followed across all branches.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '10px 14px' }}>Timestamp</th>
                      <th style={{ padding: '10px 14px' }}>Administrator</th>
                      <th style={{ padding: '10px 14px' }}>Action &amp; Target</th>
                      <th style={{ padding: '10px 14px' }}>Transition</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labStaffStore.getAuditLogs().map((log, idx) => (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.76rem' }}>{log.timestamp}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.user}</div>
                          <div style={{ fontSize: '0.72rem', color: '#7c3aed' }}>{log.role}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.action}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.target}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>{log.oldValue || 'None'}</span>
                          {' → '}
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>{log.newValue}</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {log.status || 'Success'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowSuperAdminAuditModal(false)}
                style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Audit Inspector
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: PRACTICAL SESSION ATTENDANCE ROSTER & READINESS INSPECTOR */}
      {/* ========================================================================= */}
      {inspectingSessionRoster && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '780px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ background: '#0284c7', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>Practical Session Attendance Roster &amp; Readiness</div>
                <div style={{ fontSize: '0.74rem', color: '#e0f2fe' }}>
                  {inspectingSessionRoster.subject} • {inspectingSessionRoster.batch} ({inspectingSessionRoster.department})
                </div>
              </div>
              <button type="button" onClick={() => setInspectingSessionRoster(null)} style={{ background: 'none', border: 'none', color: '#e0f2fe', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>REGISTERED</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{inspectingSessionRoster.expectedStudents || 32}</div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>PRESENT</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{inspectingSessionRoster.presentCount ?? 31}</div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600 }}>ABSENT</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>{inspectingSessionRoster.absentCount ?? 1}</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600 }}>LAB READINESS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    {inspectingSessionRoster.readinessCompleted ? 'Verified ✓' : 'Pending'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Lab: <strong>{inspectingSessionRoster.labId}</strong> | Faculty: <strong>{inspectingSessionRoster.faculty}</strong> | Experiment: <strong>{inspectingSessionRoster.experiment}</strong>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem' }}>
                    <tr>
                      <th style={{ padding: '10px 14px' }}>Roll Number</th>
                      <th style={{ padding: '10px 14px' }}>Registration #</th>
                      <th style={{ padding: '10px 14px' }}>Student Name</th>
                      <th style={{ padding: '10px 14px' }}>Attendance Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Continuous Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(storeState.students || []).slice(0, 15).map(st => (
                      <tr key={st.roll} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{st.roll}</td>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>{st.regNo}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{st.name}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: st.attendanceStatus === 'Present' ? '#dcfce7' : (st.attendanceStatus === 'Late' ? '#fef3c7' : '#fee2e2'),
                            color: st.attendanceStatus === 'Present' ? '#15803d' : (st.attendanceStatus === 'Late' ? '#b45309' : '#b91c1c')
                          }}>
                            {st.attendanceStatus}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                          {st.lastGrade || 'A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setInspectingSessionRoster(null)}
                style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISPATCH LABORATORY BROADCAST ALERT */}
      {/* ========================================================================= */}
      {showBroadcastModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '580px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
            border: '2px solid #ea580c'
          }}>
            <div style={{ background: '#ea580c', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>Dispatch Laboratory Broadcast Alert</div>
                  <div style={{ fontSize: '0.74rem', color: '#ffedd5' }}>Real-time push notification across laboratory staff, faculty and administration</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowBroadcastModal(false)} style={{ background: 'none', border: 'none', color: '#ffedd5', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDispatchBroadcast} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hazardous Fume Exhaust Malfunction - Immediate Evacuation"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Broadcast Message Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide comprehensive instructions, safety protocol directives, and contact points..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Category *</label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                  >
                    <option value="Safety & Hazard">Safety &amp; Hazard Alert</option>
                    <option value="Equipment & Spares">Equipment &amp; Spares</option>
                    <option value="Maintenance & Repairs">Maintenance &amp; Repairs</option>
                    <option value="Academics & Timetable">Academics &amp; Practical Schedule</option>
                    <option value="General Laboratory Announcement">General Announcement</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Priority Level *</label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="Critical">Critical (Immediate Action Required)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low / Informational</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Target Engineering Discipline *</label>
                  <select
                    value={broadcastTargetBranch}
                    onChange={(e) => setBroadcastTargetBranch(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                  >
                    <option value="ALL">All Disciplines (Institution-Wide)</option>
                    <option value="CSE">Computer Science &amp; Engineering</option>
                    <option value="CSE_AI">CSE (AI &amp; ML)</option>
                    <option value="BIOTECH">Biotechnology</option>
                    <option value="ECE">Electronics &amp; Communication</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="EEE">Electrical &amp; Electronics</option>
                    <option value="CIVIL">Civil Engineering</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Target Audience Role *</label>
                  <select
                    value={broadcastTargetRole}
                    onChange={(e) => setBroadcastTargetRole(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }}
                  >
                    <option value="ALL">All Roles (Staff, Faculty &amp; Admins)</option>
                    <option value="STAFF">Laboratory Technical Staff</option>
                    <option value="FACULTY">Practical Course Instructors</option>
                    <option value="ADMIN">Department Administrators</option>
                    <option value="SUPER_ADMIN">Super Administrators</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.74rem', color: '#9a3412' }}>
                <strong>Broadcast Rule:</strong> Critical priority broadcasts are automatically elevated to top-of-screen emergency alert banners and permanently logged in the institutional compliance audit trail.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Transmit Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

