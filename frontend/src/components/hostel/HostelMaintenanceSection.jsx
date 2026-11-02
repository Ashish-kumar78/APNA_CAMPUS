import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Plus,
  RotateCcw,
  Eye,
  X,
  Check,
  Building,
  DollarSign,
  FileText
} from 'lucide-react';
import { mockMaintenanceRequests, mockHostelStaffList } from './hostelData.js';
import { isWardenSuspended, getWardenPermissions, getWardenIdFromAccount } from '../../services/wardenManagementStore.js';
import { getRoomsForHostelAndFloor } from '../../services/hostelRoomStore.js';
import { getAllHostels } from '../../services/hostelAttendanceStore.js';
import './HostelExtraSections.css';

export default function HostelMaintenanceSection({ account, isHostelAdmin = false, isSuspended: propIsSuspended }) {
  const [isSuspended, setIsSuspended] = useState(() => Boolean(propIsSuspended || (!isHostelAdmin && isWardenSuspended(account))));
  const [permsTick, setPermsTick] = useState(0);
  const [hostelList, setHostelList] = useState(() => getAllHostels());

  const wardenId = useMemo(() => getWardenIdFromAccount(account), [account]);

  React.useEffect(() => {
    const handleStatusSync = () => {
      setIsSuspended(Boolean(propIsSuspended || (!isHostelAdmin && isWardenSuspended(account))));
    };
    const handlePermSync = () => setPermsTick(t => t + 1);
    const handleHostelsSync = () => setHostelList(getAllHostels());

    window.addEventListener('bput_warden_status_changed', handleStatusSync);
    window.addEventListener('bput_warden_permissions_changed', handlePermSync);
    window.addEventListener('bput_hostels_updated', handleHostelsSync);
    window.addEventListener('storage', handleStatusSync);
    window.addEventListener('storage', handlePermSync);
    window.addEventListener('storage', handleHostelsSync);

    return () => {
      window.removeEventListener('bput_warden_status_changed', handleStatusSync);
      window.removeEventListener('bput_warden_permissions_changed', handlePermSync);
      window.removeEventListener('bput_hostels_updated', handleHostelsSync);
      window.removeEventListener('storage', handleStatusSync);
      window.removeEventListener('storage', handlePermSync);
      window.removeEventListener('storage', handleHostelsSync);
    };
  }, [propIsSuspended, isHostelAdmin, account]);

  const canManageComplaints = useMemo(() => {
    if (isHostelAdmin) return true;
    if (isSuspended) return false;
    const perms = getWardenPermissions(wardenId);
    return perms.manageComplaints !== false;
  }, [isHostelAdmin, isSuspended, wardenId, permsTick]);
  const [requests, setRequests] = useState(mockMaintenanceRequests);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestModal, setSelectedRequestModal] = useState(null);
  const [viewingDocModal, setViewingDocModal] = useState(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [maintenanceFloor, setMaintenanceFloor] = useState('1st Floor');
  const [newForm, setNewForm] = useState({
    category: 'Electrical',
    title: '',
    hostelName: 'Gandhi Boys Residence',
    roomOrArea: 'Room 101',
    priority: 'Medium',
    assignedStaff: 'Mr. Bipin Sethi (Electrician)',
    notes: ''
  });
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchCat = categoryFilter === 'ALL' || r.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchSearch = !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roomOrArea.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [requests, categoryFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      inProgress: requests.filter(r => r.status === 'In Progress').length,
      completed: requests.filter(r => r.status === 'Completed').length,
      urgent: requests.filter(r => r.priority === 'Urgent').length
    };
  }, [requests]);

  const handleUpdateStatus = (id, newStatus) => {
    if (isSuspended) {
      showToast('⚠️ Action blocked: Warden account is suspended. Maintenance actions are locked to Read-Only.');
      return;
    }
    if (!canManageComplaints) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedRequestModal?.id === id) {
      setSelectedRequestModal(prev => ({ ...prev, status: newStatus }));
    }
    showToast(`Work order ${id} marked as ${newStatus}`);
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!canManageComplaints) {
      showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
      return;
    }
    if (!newForm.title || !newForm.roomOrArea) {
      alert('Please fill all required fields');
      return;
    }
    const newId = `MNT-${Math.floor(300 + Math.random() * 700)}`;
    const newEntry = {
      id: newId,
      ...newForm,
      filedDate: '2026-10-19',
      status: 'Pending',
      estimatedCost: '₹350',
      completionTarget: '2026-10-21'
    };
    setRequests(prev => [newEntry, ...prev]);
    setIsNewRequestModalOpen(false);
    setNewForm({
      category: 'Electrical',
      title: '',
      hostelName: 'Gandhi Boys Residence',
      roomOrArea: '',
      priority: 'Medium',
      assignedStaff: 'Mr. Bipin Sethi (Electrician)',
      notes: ''
    });
    showToast(`New maintenance order ${newId} logged successfully!`);
  };

  return (
    <div className="hostel-section-container">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Wrench size={24} color="#2563eb" /> Hostel Maintenance &amp; Asset Repairs</h2>
          <p>Work Order Dispatch · Electrical, Plumbing, Carpentry &amp; Civil Sanitation Tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <div
            style={{ display: 'inline-block' }}
            onClick={() => {
              if (!canManageComplaints) {
                showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
              }
            }}
          >
            <button
              className="h-btn h-btn-primary"
              disabled={!canManageComplaints}
              style={!canManageComplaints ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
              onClick={() => {
                if (!canManageComplaints) {
                  showToast('⚠️ Permission Denied: You have not been given the permission to work on it. Please contact Hostel Administration.');
                  return;
                }
                setIsNewRequestModalOpen(true);
              }}
              title={!canManageComplaints ? 'Permission restricted by Hostel Administration' : 'Log Maintenance Request'}
            >
              <Plus size={15} /> Log Maintenance Request
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Wrench size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{stats.total}</span>
            <span className="hostel-kpi-title">Total Work Orders</span>
            <span className="hostel-kpi-subtitle">Current Month</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#e11d48' }}>{stats.pending}</span>
            <span className="hostel-kpi-title">Pending Dispatch</span>
            <span className="hostel-kpi-subtitle">Technician Unassigned</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><AlertTriangle size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>{stats.inProgress}</span>
            <span className="hostel-kpi-title">In-Progress Repairs</span>
            <span className="hostel-kpi-subtitle">On-site execution</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>{stats.completed}</span>
            <span className="hostel-kpi-title">Completed &amp; Closed</span>
            <span className="hostel-kpi-subtitle">Inspected by Warden</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><AlertTriangle size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#7c3aed' }}>{stats.urgent}</span>
            <span className="hostel-kpi-title">Urgent Breakdown</span>
            <span className="hostel-kpi-subtitle">Immediate Safety</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-filter-group">
          <div className="hostel-search-input">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search request ID, description, or room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="hostel-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Furniture">Furniture</option>
            <option value="Cleaning">Cleaning &amp; Sanitation</option>
            <option value="Civil">Civil / Carpentry</option>
          </select>

          <select
            className="hostel-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredRequests.length} maintenance orders
        </div>
      </div>

      {/* Table */}
      <div className="hostel-table-container">
        <div className="hostel-table-scroll">
          <table className="hostel-data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Category</th>
                <th>Issue Description</th>
                <th>Hostel &amp; Location</th>
                <th>Supporting Document</th>
                <th>Priority</th>
                <th>Assigned Technician</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No maintenance orders match current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{item.id}</td>
                    <td>
                      <span className="h-badge h-badge-medium">{item.category}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Logged on: {item.filedDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.hostelName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#475569' }}>{item.roomOrArea}</div>
                    </td>
                    <td>
                      {item.attachmentUrl || item.supportingDocument ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setViewingDocModal({
                              url: item.attachmentUrl || item.supportingDocument,
                              code: item.id,
                              title: item.title,
                              studentName: item.reportedBy || 'Resident',
                              rollNumber: item.rollNumber || 'N/A',
                              hostel: item.hostelName,
                              room: item.roomOrArea,
                              date: item.filedDate
                            })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 9px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="View supporting document/photograph"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>Attached</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>None</span>
                      )}
                    </td>
                    <td>
                      {item.priority === 'Urgent' && <span className="h-badge h-badge-urgent">Urgent</span>}
                      {item.priority === 'High' && <span className="h-badge h-badge-high">High</span>}
                      {item.priority === 'Medium' && <span className="h-badge h-badge-medium">Medium</span>}
                      {item.priority === 'Low' && <span className="h-badge h-badge-low">Low</span>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                        {item.assignedStaff}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Target: {item.completionTarget}
                      </div>
                    </td>
                    <td>
                      {item.status === 'Pending' && <span className="h-badge h-badge-pending">Pending</span>}
                      {item.status === 'In Progress' && <span className="h-badge h-badge-late">In Progress</span>}
                      {item.status === 'Completed' && <span className="h-badge h-badge-approved">Completed</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button
                          className="h-btn h-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                          onClick={() => setSelectedRequestModal(item)}
                        >
                          <Eye size={13} /> View
                        </button>
                        {item.status === 'Pending' && (
                          <button
                            className="h-btn h-btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleUpdateStatus(item.id, 'In Progress')}
                          >
                            Dispatch
                          </button>
                        )}
                        {item.status === 'In Progress' && (
                          <button
                            className="h-btn h-btn-success"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            onClick={() => handleUpdateStatus(item.id, 'Completed')}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VIEW & UPDATE WORK ORDER */}
      {selectedRequestModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedRequestModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Work Order · {selectedRequestModal.id}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {selectedRequestModal.category} Repair · BPUT Estate Maintenance Desk
                </p>
              </div>
              <button className="admin-table-action-btn" onClick={() => setSelectedRequestModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div><strong>Hostel:</strong> {selectedRequestModal.hostelName}</div>
                <div><strong>Location:</strong> {selectedRequestModal.roomOrArea}</div>
                <div><strong>Submission Date:</strong> {selectedRequestModal.filedDate}</div>
                <div><strong>Target Completion:</strong> {selectedRequestModal.completionTarget}</div>
                <div><strong>Estimated Cost:</strong> {selectedRequestModal.estimatedCost}</div>
                <div><strong>Priority:</strong> {selectedRequestModal.priority}</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Issue Description
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{selectedRequestModal.title}</div>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Technician Inspection Notes: {selectedRequestModal.notes || 'Inspection in progress.'}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem' }}>
                <strong>Assigned Staff:</strong> {selectedRequestModal.assignedStaff}
              </div>
            </div>
            <div className="admin-modal-footer">
              {selectedRequestModal.status !== 'Completed' && (
                <button
                  className="h-btn h-btn-success"
                  onClick={() => handleUpdateStatus(selectedRequestModal.id, 'Completed')}
                >
                  <Check size={14} /> Mark Completed &amp; Inspected
                </button>
              )}
              {selectedRequestModal.status === 'Pending' && (
                <button
                  className="h-btn h-btn-primary"
                  onClick={() => handleUpdateStatus(selectedRequestModal.id, 'In Progress')}
                >
                  Start Work (In-Progress)
                </button>
              )}
              <button className="h-btn h-btn-secondary" onClick={() => setSelectedRequestModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE WORK ORDER */}
      {isNewRequestModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsNewRequestModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateRequest}>
              <div className="admin-modal-header">
                <h3 style={{ margin: 0 }}>Log New Maintenance Work Order</h3>
                <button type="button" className="admin-table-action-btn" onClick={() => setIsNewRequestModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Issue Title / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Geyser heating element short circuit in Room 204"
                    value={newForm.title}
                    onChange={e => setNewForm({ ...newForm, title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newForm.category}
                      onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                    >
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Cleaning">Cleaning &amp; Sanitation</option>
                      <option value="Civil">Civil / Carpentry</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Priority *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newForm.priority}
                      onChange={e => setNewForm({ ...newForm, priority: e.target.value })}
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Hostel Residence *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newForm.hostelName}
                      onChange={e => {
                        const newHostel = e.target.value;
                        const available = getRoomsForHostelAndFloor(newHostel, maintenanceFloor);
                        setNewForm({
                          ...newForm,
                          hostelName: newHostel,
                          roomOrArea: available[0]?.label || 'Room 101'
                        });
                      }}
                    >
                      {hostelList.map(h => (
                        <option key={h.id || h.code} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Floor *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={maintenanceFloor}
                      onChange={e => {
                        const newFloor = e.target.value;
                        setMaintenanceFloor(newFloor);
                        const available = getRoomsForHostelAndFloor(newForm.hostelName, newFloor);
                        setNewForm({
                          ...newForm,
                          roomOrArea: available[0]?.label || 'Room 101'
                        });
                      }}
                    >
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="3rd Floor">3rd Floor</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Room Number *
                    </label>
                    <select
                      className="hostel-select"
                      style={{ width: '100%' }}
                      value={newForm.roomOrArea}
                      onChange={e => setNewForm({ ...newForm, roomOrArea: e.target.value })}
                      required
                    >
                      {getRoomsForHostelAndFloor(newForm.hostelName, maintenanceFloor).map(r => (
                        <option key={r.roomNo} value={r.label}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Assigned Maintenance Technician
                  </label>
                  <select
                    className="hostel-select"
                    style={{ width: '100%' }}
                    value={newForm.assignedStaff}
                    onChange={e => setNewForm({ ...newForm, assignedStaff: e.target.value })}
                  >
                    <option value="Mr. Bipin Sethi (Electrician)">Mr. Bipin Sethi (Electrician)</option>
                    <option value="Mr. Kailash Barik (Senior Plumber)">Mr. Kailash Barik (Senior Plumber)</option>
                    <option value="Mr. Jagabandhu Nayak (Carpenter)">Mr. Jagabandhu Nayak (Carpenter)</option>
                    <option value="Mrs. Laxmi Das (Housekeeping Lead)">Mrs. Laxmi Das (Housekeeping Lead)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="h-btn h-btn-secondary" onClick={() => setIsNewRequestModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="h-btn h-btn-primary">
                  Submit Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Supporting Document Viewer Modal */}
      {viewingDocModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
          onClick={() => setViewingDocModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Supporting Document / Photograph
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Order ID: <strong style={{ color: '#7c3aed' }}>{viewingDocModal.code}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDocModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, textAlign: 'center', background: '#0b1120' }}>
              <img
                src={viewingDocModal.url}
                alt={'Supporting evidence for ' + viewingDocModal.code}
                style={{
                  maxWidth: '100%',
                  maxHeight: '440px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}
              />
            </div>

            <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.78rem', color: '#475569', marginBottom: '12px' }}>
                <div>👤 <strong>Reported By:</strong> {viewingDocModal.studentName} ({viewingDocModal.rollNumber})</div>
                <div>🏠 <strong>Hostel &amp; Area:</strong> {viewingDocModal.hostel} · {viewingDocModal.room}</div>
                <div>📋 <strong>Issue:</strong> {viewingDocModal.title}</div>
                <div>📅 <strong>Date:</strong> {viewingDocModal.date}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Verified Supporting Evidence Document
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={viewingDocModal.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#334155',
                      textDecoration: 'none'
                    }}
                  >
                    Open Full Size
                  </a>
                  <button
                    type="button"
                    onClick={() => setViewingDocModal(null)}
                    style={{
                      padding: '6px 16px',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    Done Viewing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
