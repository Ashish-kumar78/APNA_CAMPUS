import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, UserCheck, Shield, Clock, Building2, Search, Filter, Plus,
  Edit2, Eye, ShieldAlert, Award, FileText, CheckCircle2, XCircle,
  AlertTriangle, RotateCcw, Calendar, Phone, Mail, ArrowRight,
  ExternalLink, Check, X, ShieldCheck, Download, CalendarCheck
} from 'lucide-react';
import './WardenManagement.css';

import {
  getAllWardens,
  saveWarden,
  setWardenAccountStatus,
  getAssignmentHistory,
  reassignWarden,
  getWardenPermissions,
  updateWardenPermissions,
  logAdminAction
} from '../../../services/wardenManagementStore.js';
import { getAllHostels } from '../../../services/hostelAttendanceStore.js';
import {
  getAllStaffLeaves,
  approveStaffLeave,
  rejectStaffLeave,
  getLeaveSummary
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

export default function WardenManagementSection({ account, initialTab = 'directory', showToast }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [wardens, setWardens] = useState(() => getAllWardens());
  const [hostels] = useState(() => getAllHostels());
  const [assignmentHistory, setAssignmentHistory] = useState(() => getAssignmentHistory());

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hostelFilter, setHostelFilter] = useState('ALL');

  // Modals state
  const [selectedProfileWarden, setSelectedProfileWarden] = useState(null);
  const [profileModalTab, setProfileModalTab] = useState('overview');

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
    if (showToast) showToast(`✓ Leave sanctioned for ${applicantName}`);
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
    if (showToast) showToast(`Leave rejected for ${applicantName}`);
  };

  const [selectedPermWarden, setSelectedPermWarden] = useState(null);
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
    const confirmMsg = `Are you sure you want to ${newStatus === 'Suspended' ? 'suspend' : 'reactivate'} access for ${warden.name}?`;
    if (!window.confirm(confirmMsg)) return;

    setWardenAccountStatus(warden.id, newStatus, 'Administrative executive action');
    reloadData();
    if (showToast) showToast(`Warden ${warden.name} account status updated to ${newStatus}`);
  };

  // Handle Reassign Submit
  const handleReassignSubmit = (e) => {
    e.preventDefault();
    try {
      reassignWarden({
        ...reassignForm,
        adminUser: account?.name || 'Chief Administrator'
      });
      setIsReassignModalOpen(false);
      reloadData();
      if (showToast) showToast(`✓ Warden successfully reassigned to ${reassignForm.newHostelName}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Permissions Modal
  const handleOpenPermissions = (warden) => {
    setSelectedPermWarden(warden);
    setPermsState(getWardenPermissions(warden.id));
  };

  // Save Permissions
  const handleSavePermissions = () => {
    if (!selectedPermWarden) return;
    updateWardenPermissions(selectedPermWarden.id, permsState, 'Hostel Admin permission modification');
    setSelectedPermWarden(null);
    if (showToast) showToast(`✓ Operational permissions updated for ${selectedPermWarden.name}`);
  };

  return (
    <div className="wm-container">
      {/* Header */}
      <div className="wm-header">
        <div className="wm-title">
          <h1>
            {activeTab === 'assignments' && 'Warden Assignments & Reliever Console'}
            {activeTab === 'permissions' && 'Granular Scoped Permissions Matrix for Wardens'}
            {activeTab === 'duty-leaves' && 'Warden Duty Rosters & Leave Management'}
            {activeTab === 'performance' && 'Warden Performance & Compliance Indicators'}
            {(activeTab === 'directory' || !activeTab) && 'Warden Directory & Operational Staffing'}
            <span className="wm-badge">Administrative Authority</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            {activeTab === 'assignments' && 'Reassign wardens to hostel complexes, rebalance residential blocks, and review handover audit history.'}
            {activeTab === 'permissions' && 'Configure operational permissions across attendance, room transfers, and material indents.'}
            {activeTab === 'duty-leaves' && 'Active shifts, rotational roll-call relief rosters, and official staff leave sanctions.'}
            {activeTab === 'performance' && 'Objective metrics: on-time roll call rate, 72h complaint resolution speed, and supervisory notes.'}
            {(activeTab === 'directory' || !activeTab) && 'Active resident wardens, assigned hostels, contact records, and employment status.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className="had-btn had-btn-primary"
            onClick={() => handleOpenReassignModal()}
          >
            <Plus size={14} /> Assign / Reassign Warden
          </button>
        </div>
      </div>

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
                  <th>Attendance Compliance</th>
                  <th>Pending Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWardens.map(w => (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>ID: {w.id} · {w.designation}</div>
                      <div style={{ fontSize: '0.72rem', color: '#0284c7' }}>{w.email} · {w.phone}</div>
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
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Duty: {w.dutyStatus}</div>
                    </td>
                    <td>
                      <strong>{w.attendanceCompliance}%</strong>
                      <div className="had-progress-bar" style={{ width: '90px' }}>
                        <div
                          className={`had-progress-fill ${w.attendanceCompliance >= 95 ? 'emerald' : 'amber'}`}
                          style={{ width: `${w.attendanceCompliance}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`had-badge ${w.pendingTasks > 0 ? 'warning' : 'neutral'}`}>
                        {w.pendingTasks} Pending
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          title="View Complete 13-Tab Dossier"
                          onClick={() => {
                            setSelectedProfileWarden(w);
                            setProfileModalTab('overview');
                          }}
                        >
                          <Eye size={12} /> Profile
                        </button>
                        <button
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          title="Configure Granular Permissions"
                          onClick={() => handleOpenPermissions(w)}
                        >
                          <Shield size={12} /> Perms
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
                        <strong>{assignedWarden ? assignedWarden.name : (h.warden || 'Unassigned')}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{assignedWarden?.email || h.contact}</div>
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
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', color: '#0f172a' }}>
              Granular Scoped Permissions Matrix for Wardens
            </h3>
            <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b' }}>
              Hostel Admin can customize operational privileges for each warden. High-privilege policies (curfew configuration, institutional exports, staff rosters) are locked to Hostel Admin by default.
            </p>
          </div>

          <table className="had-table">
            <thead>
              <tr>
                <th>Warden</th>
                <th>Hostel Scope</th>
                <th>Attendance</th>
                <th>Room Alloc</th>
                <th>Leaves &amp; Passes</th>
                <th>Complaints</th>
                <th>Indents</th>
                <th>Config / Policy</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {wardens.map(w => {
                const p = getWardenPermissions(w.id);
                return (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{w.id}</div>
                    </td>
                    <td>{w.hostelName}</td>
                    <td>
                      <span className={`had-badge ${p.submitAttendance ? 'success' : 'neutral'}`}>
                        {p.submitAttendance ? 'Submit' : 'View Only'}
                      </span>
                    </td>
                    <td>
                      <span className={`had-badge ${p.manageRoomAllocations ? 'success' : 'neutral'}`}>
                        {p.manageRoomAllocations ? 'Manage' : 'View'}
                      </span>
                    </td>
                    <td>
                      <span className={`had-badge ${p.manageGatePasses ? 'success' : 'neutral'}`}>
                        {p.manageGatePasses ? 'Approved' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <span className={`had-badge ${p.manageComplaints ? 'success' : 'neutral'}`}>
                        {p.manageComplaints ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <span className={`had-badge ${p.createInventoryRequisitions ? 'success' : 'neutral'}`}>
                        {p.createInventoryRequisitions ? 'Can Indent' : 'Read Only'}
                      </span>
                    </td>
                    <td>
                      <span className={`had-badge ${p.editHostelConfiguration ? 'danger' : 'neutral'}`}>
                        {p.editHostelConfiguration ? 'Granted' : 'Admin Only'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="had-btn had-btn-primary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => handleOpenPermissions(w)}
                      >
                        Edit Matrix
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      
      {/* TAB 4: DUTY ROSTER & LEAVE MANAGEMENT */}
      {activeTab === 'duty-leaves' && (
        <div>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <span className="wm-kpi-label">Active Wardens on Duty</span>
                <div className="wm-kpi-icon green"><UserCheck size={18} /></div>
              </div>
              <div className="wm-kpi-val">{wardens.filter(w => w.dutyStatus === 'On Duty').length}</div>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Active residential coverage</span>
            </div>

            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <span className="wm-kpi-label">Wardens / Staff on Leave</span>
                <div className="wm-kpi-icon amber"><Clock size={18} /></div>
              </div>
              <div className="wm-kpi-val">{wardens.filter(w => w.dutyStatus === 'On Leave').length}</div>
              <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600 }}>Covered by relief wardens</span>
            </div>

            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <span className="wm-kpi-label">Pending Leave Requests</span>
                <div className="wm-kpi-icon purple"><Calendar size={18} /></div>
              </div>
              <div className="wm-kpi-val">{staffLeaves.filter(l => l.status === 'Pending Approval').length}</div>
              <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>Awaiting Admin Sanction</span>
            </div>

            <div className="wm-kpi-card">
              <div className="wm-kpi-header">
                <span className="wm-kpi-label">Total Staff Sanctions</span>
                <div className="wm-kpi-icon blue"><CheckCircle2 size={18} /></div>
              </div>
              <div className="wm-kpi-val">{staffLeaves.filter(l => l.status === 'Approved by Hostel Admin').length}</div>
              <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>Official leaves approved</span>
            </div>
          </div>

          {/* Section A: Active Warden Duty Shift Rosters */}
          <div className="wm-table-card" style={{ marginBottom: '1.5rem' }}>
            <div className="wm-table-card-header">
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a' }}>
                  Warden Shift Rosters &amp; Roll-Call Allocations
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
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
                  <th>Duty Shift</th>
                  <th>Duty Status</th>
                  <th>Relieving Official</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wardens.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{w.name}</div>
                      <small style={{ color: '#64748b' }}>{w.id}</small>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{w.designation}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{w.hostelName}</div>
                      <small style={{ color: '#64748b' }}>{Array.isArray(w.assignedBlocks) ? w.assignedBlocks.join(', ') : w.assignedBlocks}</small>
                    </td>
                    <td>
                      <span className="had-badge neutral">{w.dutyShift || 'General / 24x7 Resident'}</span>
                    </td>
                    <td>
                      <span className={`had-badge ${w.dutyStatus === 'On Duty' ? 'green' : 'amber'}`}>
                        {w.dutyStatus === 'On Duty' ? '● On Duty' : '○ On Leave'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {w.relievingWarden || 'None Assigned'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>{w.phone}</div>
                    </td>
                    <td>
                      <button
                        className="had-btn had-btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
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
                        Edit Roster
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section B: Staff & Warden Leave Applications & Sanction Console */}
          <div className="wm-table-card">
            <div className="wm-table-card-header">
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a' }}>
                  Warden &amp; Staff Leave Applications &amp; Sanctions
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Review leave applications, verify alternative duty arrangements, and grant official administrative sanctions.
                </p>
              </div>
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
                {staffLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>{leave.id}</div>
                      <small style={{ color: '#94a3b8' }}>Applied: {leave.appliedOn}</small>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{leave.applicantName}</div>
                      <small style={{ color: '#64748b' }}>{leave.designation} · {leave.employeeId}</small>
                    </td>
                    <td>
                      <span className="had-badge purple">{leave.leaveType}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{leave.days} Day(s)</div>
                      <small style={{ color: '#64748b' }}>{leave.startDate} to {leave.endDate}</small>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#1e293b' }}>{leave.reason}</div>
                      {leave.alternativeArrangement && (
                        <div style={{ fontSize: '0.76rem', color: '#059669', marginTop: '0.25rem' }}>
                          <strong>Handover:</strong> {leave.alternativeArrangement}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`had-badge ${
                        leave.status === 'Approved by Hostel Admin' ? 'green' :
                        leave.status === 'Rejected by Hostel Admin' ? 'red' : 'amber'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Pending Approval' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="had-btn had-btn-primary"
                            style={{ padding: '0.28rem 0.6rem', fontSize: '0.72rem' }}
                            onClick={() => handleApproveLeave(leave.id, leave.applicantName)}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            className="had-btn had-btn-danger"
                            style={{ padding: '0.28rem 0.6rem', fontSize: '0.72rem' }}
                            onClick={() => handleRejectLeave(leave.id, leave.applicantName)}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <small style={{ color: '#64748b' }}>
                          {leave.approvedBy ? `By ${leave.approvedBy}` : 'Processed'}
                        </small>
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
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px' }}>
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

              <div style={{ fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '0.65rem', borderRadius: '6px' }}>
                <strong>Supervisor Note:</strong> {w.notes || 'Reliable operational execution.'}
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
                        <option key={h.id} value={h.name}>{h.name} ({h.type})</option>
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
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                  Operational Permissions: {selectedPermWarden.name} ({selectedPermWarden.id})
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Scope: {selectedPermWarden.hostelName}
                </span>
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
            </div>
            <div className="wm-modal-footer">
              <button
                className="had-btn had-btn-secondary"
                onClick={() => setSelectedPermWarden(null)}
              >
                Cancel
              </button>
              <button
                className="had-btn had-btn-primary"
                onClick={handleSavePermissions}
              >
                Save Permissions
              </button>
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
    </div>
  );
}

