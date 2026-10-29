import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  Building,
  Home,
  Star,
  Send,
  X,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Users,
  FileText,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Wrench,
  Check
} from 'lucide-react';
import {
  getAllCleanlinessComplaints,
  updateCleanlinessComplaintStatus,
  addCleanlinessInternalNote,
  resolveCleanlinessComplaint,
  reopenCleanlinessComplaint,
  escalateCleanlinessComplaint,
  getCleanlinessAnalytics,
  subscribeCleanlinessComplaints
} from '../../services/cleanlinessComplaintStore.js';
import './HostelExtraSections.css';

const CLEANING_STAFF_ROSTER = [
  { id: 'STF-HK-01', name: 'Mrs. Laxmi Das (Senior Housekeeping)', phone: '+91 94370 77101', role: 'Housekeeping' },
  { id: 'STF-HK-02', name: 'Mr. Ramesh Nayak (Housekeeping Assistant)', phone: '+91 94370 77102', role: 'Housekeeping' },
  { id: 'STF-PL-01', name: 'Mr. Kailash Barik (Plumbing & Sanitation)', phone: '+91 94370 77103', role: 'Plumbing' },
  { id: 'STF-PEST-01', name: 'Central Pest Control Agency Specialist', phone: '+91 94370 77104', role: 'Pest Control' }
];

export default function HostelCleanlinessManagementSection({ isHostelAdmin = false, currentWardenName = 'Mr. Rajesh Jena', assignedHostel = 'ALL' }) {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'insights'
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);
  const [assignStaffModal, setAssignStaffModal] = useState(null); // complaint
  const [internalNoteModal, setInternalNoteModal] = useState(null); // complaint
  const [escalateModal, setEscalateModal] = useState(null); // complaint
  const [rejectModal, setRejectModal] = useState(null); // complaint

  // Form states
  const [selectedStaffId, setSelectedStaffId] = useState('STF-HK-01');
  const [cleaningInstructionsInput, setCleaningInstructionsInput] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [escalateReasonInput, setEscalateReasonInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Filters
  const [filterHostel, setFilterHostel] = useState(isHostelAdmin ? 'ALL' : (assignedHostel || 'ALL'));
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = () => {
    getAllCleanlinessComplaints().then(data => {
      setComplaints(data);
    });
    getCleanlinessAnalytics().then(data => {
      setAnalytics(data);
    });
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeCleanlinessComplaints(() => {
      loadData();
    });
    return unsub;
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return complaints.filter(item => {
      if (!isHostelAdmin && assignedHostel !== 'ALL') {
        if (!item.hostel?.toLowerCase().includes(assignedHostel.toLowerCase())) return false;
      }
      if (filterHostel !== 'ALL' && !item.hostel?.toLowerCase().includes(filterHostel.toLowerCase())) return false;
      if (filterCategory !== 'ALL' && item.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
      if (filterPriority !== 'ALL' && item.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
      if (filterStatus !== 'ALL' && item.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.complaintCode?.toLowerCase().includes(q) ||
          item.studentName?.toLowerCase().includes(q) ||
          item.rollNumber?.toLowerCase().includes(q) ||
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.roomNumber?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [complaints, isHostelAdmin, assignedHostel, filterHostel, filterCategory, filterPriority, filterStatus, searchQuery]);

  // Handle Acknowledge
  const handleAcknowledge = async (item) => {
    try {
      await updateCleanlinessComplaintStatus(
        item.id,
        'Acknowledged',
        `Complaint acknowledged by ${isHostelAdmin ? 'Hostel Administrator' : 'Hostel Warden'}`,
        item.assignedStaffId,
        item.assignedStaffName,
        null,
        isHostelAdmin ? 'Hostel Administrator' : currentWardenName
      );
      showToast(`✓ Complaint #${item.complaintCode} marked as Acknowledged.`);
      loadData();
    } catch (err) {
      alert(err.message || 'Action failed.');
    }
  };

  // Handle Assign Staff Submit
  const handleAssignStaffSubmit = async (e) => {
    e.preventDefault();
    if (!assignStaffModal) return;

    const staffObj = CLEANING_STAFF_ROSTER.find(s => s.id === selectedStaffId) || CLEANING_STAFF_ROSTER[0];
    try {
      await updateCleanlinessComplaintStatus(
        assignStaffModal.id,
        'Assigned',
        `Assigned to ${staffObj.name}. Instructions: "${cleaningInstructionsInput || 'Sanitize room and fixtures'}"`,
        staffObj.id,
        staffObj.name,
        null,
        isHostelAdmin ? 'Hostel Administrator' : currentWardenName
      );
      showToast(`✓ Assigned ${staffObj.name} to complaint #${assignStaffModal.complaintCode}`);
      setAssignStaffModal(null);
      setCleaningInstructionsInput('');
      loadData();
    } catch (err) {
      alert(err.message || 'Assignment failed.');
    }
  };

  // Handle Mark Completed (Submit for verification)
  const handleMarkCompleted = async (item) => {
    try {
      await resolveCleanlinessComplaint(
        item.id,
        'Cleaning completed by on-duty housekeeping staff. Dispatched for resident verification.',
        item.cleaningInstructions,
        isHostelAdmin ? 'Hostel Administrator' : currentWardenName
      );
      showToast(`✓ Complaint #${item.complaintCode} marked completed & submitted for resident verification.`);
      loadData();
    } catch (err) {
      alert(err.message || 'Action failed.');
    }
  };

  // Handle Add Internal Note Submit
  const handleAddInternalNoteSubmit = async (e) => {
    e.preventDefault();
    if (!internalNoteModal || !internalNoteInput.trim()) return;

    try {
      await addCleanlinessInternalNote(
        internalNoteModal.id,
        internalNoteInput.trim(),
        isHostelAdmin ? 'Hostel Administrator' : currentWardenName
      );
      showToast(`✓ Internal administrative note appended to #${internalNoteModal.complaintCode}`);
      setInternalNoteModal(null);
      setInternalNoteInput('');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to add note.');
    }
  };

  // Handle Escalate Submit
  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateModal || !escalateReasonInput.trim()) return;

    try {
      await escalateCleanlinessComplaint(
        escalateModal.id,
        escalateReasonInput.trim(),
        isHostelAdmin ? 'Hostel Administrator' : currentWardenName
      );
      showToast(`🚨 Complaint #${escalateModal.complaintCode} escalated to Hostel Administrator.`);
      setEscalateModal(null);
      setEscalateReasonInput('');
      loadData();
    } catch (err) {
      alert(err.message || 'Escalation failed.');
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal || !rejectionReasonInput.trim()) {
      alert('Mandatory rejection reason required.');
      return;
    }

    try {
      await updateCleanlinessComplaintStatus(
        rejectModal.id,
        'Rejected',
        `Complaint rejected: ${rejectionReasonInput.trim()}`,
        null,
        null,
        rejectionReasonInput.trim(),
        isHostelAdmin ? 'Hostel Administrator' : currentWardenName
      );
      showToast(`Complaint #${rejectModal.complaintCode} marked Rejected.`);
      setRejectModal(null);
      setRejectionReasonInput('');
      loadData();
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return 'h-badge-approved';
      case 'In Progress': return 'h-badge-medium';
      case 'Awaiting Verification': return 'h-badge-leave';
      case 'Reopened': return 'h-badge-urgent';
      case 'Rejected': return 'h-badge-rejected';
      case 'Acknowledged': return 'h-badge-low';
      case 'Assigned': return 'h-badge-medium';
      default: return 'h-badge-low';
    }
  };

  return (
    <div className="hostel-section-container" style={{ gap: '1.25rem' }}>
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
          <h2>
            <Sparkles size={24} color="#7c3aed" />{' '}
            {isHostelAdmin
              ? 'Hostel Administrator Central Cleanliness & Hygiene Console'
              : 'Hostel Warden Room Cleanliness Complaint Management'}
          </h2>
          <p>
            {isHostelAdmin
              ? 'Multi-Hostel Sanitation Governance · Staff Workload · Resolution Audits & Cleanliness Insights'
              : 'Resident Room Sanitation Desk · Housekeeping Roster Assignments · Verification & Escalation'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            <FileText size={14} /> Print Cleanliness Docket
          </button>
        </div>
      </div>

      {/* KPI Summaries */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple">
            <Sparkles size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{analytics?.totalComplaints || complaints.length}</span>
            <span className="hostel-kpi-title">{isHostelAdmin ? 'Total Cleanliness Complaints' : 'Total Hostel Complaints'}</span>
            <span className="hostel-kpi-subtitle">Logged This Term</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue">
            <Clock size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{analytics?.newComplaints || 0}</span>
            <span className="hostel-kpi-title">New / Awaiting Action</span>
            <span className="hostel-kpi-subtitle">Needs Assignment</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber">
            <AlertTriangle size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{analytics?.inProgress || 0}</span>
            <span className="hostel-kpi-title">Complaints In Progress</span>
            <span className="hostel-kpi-subtitle">Housekeeping On Duty</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon rose">
            <AlertCircle size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{analytics?.urgentComplaints || 0}</span>
            <span className="hostel-kpi-title">Urgent Complaints</span>
            <span className="hostel-kpi-subtitle">High Priority Sanitation</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{analytics?.resolvedComplaints || 0}</span>
            <span className="hostel-kpi-title">Resolved Complaints</span>
            <span className="hostel-kpi-subtitle">Verified Cleaned</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hostel-tab-pills">
        <button
          className={`hostel-tab-pill ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <Layers size={14} /> Cleanliness Complaint Register ({filteredList.length})
        </button>
        <button
          className={`hostel-tab-pill ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <TrendingUp size={14} /> Hostel Cleanliness Insights &amp; SLA
        </button>
      </div>

      {/* TAB 1: COMPLAINT REGISTER */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filters Bar */}
          <div className="hostel-filter-strip">
            <div className="hostel-search-input" style={{ flex: 1, minWidth: '220px' }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search complaint code, student roll, title, or room..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hostel-filter-group">
              {isHostelAdmin && (
                <select
                  className="hostel-select"
                  value={filterHostel}
                  onChange={e => setFilterHostel(e.target.value)}
                >
                  <option value="ALL">All Hostels</option>
                  <option value="Gandhi Boys">Gandhi Boys Residence</option>
                  <option value="Kalam Boys">APJ Abdul Kalam Residence</option>
                  <option value="Sarojini Girls">Sarojini Girls Residence</option>
                  <option value="Kalpana Chawla">Kalpana Chawla Girls Residence</option>
                </select>
              )}

              <select
                className="hostel-select"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="Room Cleaning">Room Cleaning</option>
                <option value="Bathroom / Toilet Cleaning">Bathroom / Toilet Cleaning</option>
                <option value="Dustbin Not Emptied">Dustbin Not Emptied</option>
                <option value="Dirty Floor">Dirty Floor</option>
                <option value="Unclean Bedding">Unclean Bedding</option>
                <option value="Bad Odour">Bad Odour</option>
                <option value="Pest or Insect Issue">Pest or Insect Issue</option>
                <option value="Common Area Cleaning">Common Area Cleaning</option>
                <option value="Corridor Cleaning">Corridor Cleaning</option>
              </select>

              <select
                className="hostel-select"
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              <select
                className="hostel-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Awaiting Verification">Awaiting Verification</option>
                <option value="Resolved">Resolved</option>
                <option value="Reopened">Reopened</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="hostel-table-container">
            <div className="hostel-table-scroll">
              <table className="hostel-data-table">
                <thead>
                  <tr>
                    <th>ID &amp; Date</th>
                    <th>Student Particulars</th>
                    <th>Hostel &amp; Room</th>
                    <th>Cleanliness Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned Staff</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                        <Sparkles size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                        No complaints match the specified filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: '#7c3aed' }}>{item.complaintCode}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.studentName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Roll: {item.rollNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.hostel}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            Room {item.roomNumber} ({item.block || 'Block A'} · {item.floor || 'Floor 1'})
                          </div>
                        </td>
                        <td style={{ maxWidth: '220px' }}>
                          <span className="h-badge h-badge-medium" style={{ fontSize: '0.7rem', marginBottom: '2px' }}>
                            {item.category}
                          </span>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.84rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </div>
                        </td>
                        <td>
                          <span className={`h-badge ${
                            item.priority === 'Urgent' ? 'h-badge-urgent' :
                            item.priority === 'High' ? 'h-badge-leave' : 'h-badge-low'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`h-badge ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#334155' }}>
                          {item.assignedStaffName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedDetailModal(item)}
                              title="View Complaint Dossier"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={12} />
                            </button>

                            {/* Acknowledge if Submitted */}
                            {item.status === 'Submitted' && (
                              <button
                                type="button"
                                onClick={() => handleAcknowledge(item)}
                                title="Acknowledge Complaint"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #93c5fd',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Ack
                              </button>
                            )}

                            {/* Assign Cleaning Staff */}
                            {item.status !== 'Resolved' && item.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignStaffModal(item);
                                  setSelectedStaffId(item.assignedStaffId || 'STF-HK-01');
                                  setCleaningInstructionsInput(item.cleaningInstructions || '');
                                }}
                                title="Assign Cleaning Staff"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#2563eb',
                                  color: '#ffffff',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Assign
                              </button>
                            )}

                            {/* Mark Completed (for verification) */}
                            {(item.status === 'Assigned' || item.status === 'In Progress') && (
                              <button
                                type="button"
                                onClick={() => handleMarkCompleted(item)}
                                title="Mark Cleaning Completed"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Done
                              </button>
                            )}

                            {/* Internal Note */}
                            <button
                              type="button"
                              onClick={() => {
                                setInternalNoteModal(item);
                                setInternalNoteInput('');
                              }}
                              title="Internal Note"
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#475569',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Note
                            </button>

                            {/* Escalate button for Warden */}
                            {!isHostelAdmin && !item.isEscalated && item.status !== 'Resolved' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEscalateModal(item);
                                  setEscalateReasonInput('');
                                }}
                                title="Escalate to Hostel Admin"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #fca5a5',
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Escalate
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
        </div>
      )}

      {/* TAB 2: CLEANLINESS INSIGHTS */}
      {activeTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* By Category */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                Complaints by Category
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(analytics?.complaintsByCategory || {}).map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569' }}>{cat}</span>
                    <span style={{ fontWeight: 800, color: '#0f172a', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Hostel */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                Hostel Building Distribution
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(analytics?.complaintsByHostel || {}).map(([hostel, count]) => (
                  <div key={hostel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569' }}>{hostel}</span>
                    <span style={{ fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                      {count} tickets
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Reported Problem Rooms */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                Frequently Reported Locations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(analytics?.frequentlyReportedRooms || {}).map(([room, count]) => (
                  <div key={room} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#475569' }}>{room}</span>
                    <span style={{ fontWeight: 800, color: count > 1 ? '#dc2626' : '#64748b', background: count > 1 ? '#fef2f2' : '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>
                      {count} logs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Indicators */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                Key Operational SLA Indicators
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Average Resolution Time:</span>
                  <strong>{analytics?.averageResolutionHours || 14.5} Hours</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Overdue Tickets (&gt;72h):</span>
                  <strong style={{ color: analytics?.overdueComplaints > 0 ? '#dc2626' : '#16a34a' }}>
                    {analytics?.overdueComplaints || 0} Tickets
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Reopened Tickets:</span>
                  <strong style={{ color: analytics?.reopenedCount > 0 ? '#d97706' : '#16a34a' }}>
                    {analytics?.reopenedCount || 0} Tickets
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>SLA Compliance Rate:</span>
                  <strong style={{ color: '#16a34a' }}>96.4% Compliance</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ASSIGN CLEANING STAFF                             */}
      {/* ======================================================== */}
      {assignStaffModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setAssignStaffModal(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: '#f8fafc',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                Assign Staff: #{assignStaffModal.complaintCode}
              </h4>
              <button type="button" onClick={() => setAssignStaffModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignStaffSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Select Cleaning / Maintenance Personnel *
                </label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff'
                  }}
                >
                  {CLEANING_STAFF_ROSTER.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Cleaning Instructions &amp; Disinfectant Directives
                </label>
                <textarea
                  rows={3}
                  value={cleaningInstructionsInput}
                  onChange={e => setCleaningInstructionsInput(e.target.value)}
                  placeholder="e.g. Bring drain snake &amp; industrial floor disinfectant. Inspect floor trap."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAssignStaffModal(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INTERNAL ADMINISTRATIVE NOTE                      */}
      {/* ======================================================== */}
      {internalNoteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setInternalNoteModal(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: '#f8fafc',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  Internal Administrative Note: #{internalNoteModal.complaintCode}
                </h4>
                <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>
                  🔒 Confidential — Never visible to student
                </div>
              </div>
              <button type="button" onClick={() => setInternalNoteModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInternalNoteSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Internal Supervisory Note *
                </label>
                <textarea
                  rows={4}
                  value={internalNoteInput}
                  onChange={e => setInternalNoteInput(e.target.value)}
                  placeholder="Record internal staff observations, contractor notes, material requisition status..."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {internalNoteModal.internalNotes && (
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', maxHeight: '120px', overflowY: 'auto' }}>
                  <strong>Prior Internal Notes:</strong>
                  <pre style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#475569' }}>
                    {internalNoteModal.internalNotes}
                  </pre>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setInternalNoteModal(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Save Internal Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ESCALATE TO HOSTEL ADMIN                          */}
      {/* ======================================================== */}
      {escalateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setEscalateModal(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: '#fff1f2',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #fecdd3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} color="#e11d48" />
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#9f1239' }}>
                  Escalate Complaint to Hostel Administrator
                </h4>
              </div>
              <button type="button" onClick={() => setEscalateModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEscalateSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Escalation Reason &amp; Administrative Support Required *
                </label>
                <textarea
                  rows={3}
                  value={escalateReasonInput}
                  onChange={e => setEscalateReasonInput(e.target.value)}
                  placeholder="e.g. Repeated sewage backup requiring external municipal tanker or structural plumbing contractor."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fca5a5',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEscalateModal(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#e11d48', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem' }}
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FULL COMPLAINT DOSSIER VIEW                       */}
      {/* ======================================================== */}
      {selectedDetailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setSelectedDetailModal(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: '#f8fafc',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  Complaint Dossier: #{selectedDetailModal.complaintCode}
                </h4>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {selectedDetailModal.hostel} · Room {selectedDetailModal.roomNumber}
                </div>
              </div>
              <button type="button" onClick={() => setSelectedDetailModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Student:</strong> {selectedDetailModal.studentName} ({selectedDetailModal.rollNumber})</div>
                <div><strong>Category:</strong> {selectedDetailModal.category}</div>
                <div><strong>Location:</strong> {selectedDetailModal.location}</div>
                <div><strong>Priority:</strong> {selectedDetailModal.priority}</div>
                <div><strong>Status:</strong> {selectedDetailModal.status}</div>
                <div><strong>Preferred Time:</strong> {selectedDetailModal.preferredTime || 'Anytime'}</div>
                <div><strong>Assigned Staff:</strong> {selectedDetailModal.assignedStaffName || 'Unassigned'}</div>
                <div><strong>Assigned Warden:</strong> {selectedDetailModal.assignedWardenName || 'Warden'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>Description:</div>
                <div style={{ fontSize: '0.86rem', color: '#1e293b', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                  "{selectedDetailModal.description}"
                </div>
              </div>

              {selectedDetailModal.internalNotes && (
                <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                    🔒 Internal Supervisory Notes (Hidden from Student)
                  </div>
                  <pre style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.82rem', color: '#78350f' }}>
                    {selectedDetailModal.internalNotes}
                  </pre>
                </div>
              )}

              {/* Status Audit History */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  Chronological Status History:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '2px solid #cbd5e1', paddingLeft: '12px', marginLeft: '6px' }}>
                  {(selectedDetailModal.statusHistory || []).map((step, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#334155' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{step.status}</span>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', marginLeft: '6px' }}>
                        {step.timestamp ? new Date(step.timestamp).toLocaleString() : ''}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        "{step.note}" — <strong>{step.actor || 'Staff'}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailModal(null)}
                style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.84rem', fontWeight: 700 }}
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
