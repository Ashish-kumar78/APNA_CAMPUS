import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
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
  Upload,
  Image,
  Info
} from 'lucide-react';
import {
  getStudentCleanlinessComplaints,
  submitCleanlinessComplaint,
  verifyCleanlinessComplaint,
  reopenCleanlinessComplaint,
  subscribeCleanlinessComplaints
} from '../../services/cleanlinessComplaintStore.js';
import { getActiveStudent } from '../../services/studentStore.js';
import './HostelExtraSections.css';

export default function StudentCleanlinessSection() {
  const activeStudent = getActiveStudent();
  const studentRoll = activeStudent?.rollNumber || '2305200001';
  const studentName = activeStudent?.name || 'Rakesh Das';
  const studentHostel = activeStudent?.hostelName || 'Sarojini Girls Residence (Block A)';
  const studentBlock = activeStudent?.block || 'Block A';
  const studentFloor = activeStudent?.floor || 'Floor 2';
  const studentRoom = activeStudent?.roomNumber || '204';

  const [complaints, setComplaints] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);
  const [verificationModalComplaint, setVerificationModalComplaint] = useState(null);
  const [reopenModalComplaint, setReopenModalComplaint] = useState(null);

  // Submit Form State
  const [formCategory, setFormCategory] = useState('Room Cleaning');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('My Room');
  const [formPriority, setFormPriority] = useState('Normal');
  const [formPreferredTime, setFormPreferredTime] = useState('10:00 AM - 12:00 PM');
  const [formAttachment, setFormAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification Form State
  const [verifyResult, setVerifyResult] = useState('Confirmed Cleaned'); // 'Confirmed Cleaned' | 'Unresolved'
  const [verifyRating, setVerifyRating] = useState(5);
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [verifyUnresolvedReason, setVerifyUnresolvedReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Reopen Form State
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshComplaints = () => {
    getStudentCleanlinessComplaints(studentRoll).then(list => {
      setComplaints(list);
    });
  };

  useEffect(() => {
    refreshComplaints();
    const unsub = subscribeCleanlinessComplaints(() => {
      refreshComplaints();
    });
    return unsub;
  }, [studentRoll]);

  // Metric Summaries
  const totalSubmitted = complaints.length;
  const newComplaints = complaints.filter(c => c.status === 'Submitted' || c.status === 'Acknowledged').length;
  const inProgress = complaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (filterCategory !== 'ALL' && c.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
      if (filterPriority !== 'ALL' && c.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
      if (filterStatus !== 'ALL' && c.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.complaintCode?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [complaints, filterCategory, filterPriority, filterStatus, searchQuery]);

  // Handle Submit Cleanliness Complaint
  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a complaint title.');
      return;
    }
    if (!formDescription.trim()) {
      alert('Please provide a detailed description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitCleanlinessComplaint({
        studentId: activeStudent?.id || 'std-active',
        studentName,
        rollNumber: studentRoll,
        hostel: studentHostel,
        block: studentBlock,
        floor: studentFloor,
        roomNumber: studentRoom,
        category: formCategory,
        title: formTitle,
        description: formDescription,
        location: formLocation,
        priority: formPriority,
        preferredTime: formPreferredTime,
        attachmentUrl: formAttachment
      });

      showToast(`✓ Cleanliness Complaint #${created.complaintCode} submitted to Housekeeping & Warden.`);
      setIsSubmitModalOpen(false);
      setFormTitle('');
      setFormDescription('');
      setFormAttachment(null);
      refreshComplaints();
    } catch (err) {
      alert(err.message || 'Failed to lodge cleanliness complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verification Submit
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verificationModalComplaint) return;

    if (verifyResult === 'Unresolved' && !verifyUnresolvedReason.trim()) {
      alert('Please specify why the cleaning remains unresolved.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyCleanlinessComplaint(
        verificationModalComplaint.id,
        verifyResult,
        verifyResult === 'Confirmed Cleaned' ? verifyRating : undefined,
        verifyResult === 'Confirmed Cleaned' ? verifyFeedback : undefined,
        verifyResult === 'Unresolved' ? verifyUnresolvedReason : undefined,
        studentName
      );

      if (verifyResult === 'Confirmed Cleaned') {
        showToast(`✓ Cleanliness complaint #${verificationModalComplaint.complaintCode} confirmed as Resolved.`);
      } else {
        showToast(`⚠️ Complaint #${verificationModalComplaint.complaintCode} returned and reopened for re-cleaning.`);
      }
      setVerificationModalComplaint(null);
      setVerifyFeedback('');
      setVerifyUnresolvedReason('');
      refreshComplaints();
    } catch (err) {
      alert(err.message || 'Failed to submit verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Reopen Submit
  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenModalComplaint) return;
    if (!reopenReason.trim()) {
      alert('Please state why the complaint needs to be reopened.');
      return;
    }

    setIsReopening(true);
    try {
      await reopenCleanlinessComplaint(reopenModalComplaint.id, reopenReason, null, studentName);
      showToast(`⚠️ Cleanliness complaint #${reopenModalComplaint.complaintCode} reopened.`);
      setReopenModalComplaint(null);
      setReopenReason('');
      refreshComplaints();
    } catch (err) {
      alert(err.message || 'Failed to reopen complaint.');
    } finally {
      setIsReopening(false);
    }
  };

  const getStatusBadgeClass = (status) => {
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
          <h2><Sparkles size={24} color="#7c3aed" /> Hostel Room Cleanliness Complaint Management</h2>
          <p>Report Housekeeping &amp; Sanitation Issues · Auto-Allocated Room Tracking · Verification Workflow</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="h-btn h-btn-primary"
            style={{ background: '#7c3aed', color: '#ffffff', border: 'none' }}
            onClick={() => setIsSubmitModalOpen(true)}
          >
            <Plus size={16} /> + Submit New Complaint
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple">
            <Sparkles size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{totalSubmitted}</span>
            <span className="hostel-kpi-title">Total Complaints</span>
            <span className="hostel-kpi-subtitle">Submitted by You</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue">
            <Clock size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{newComplaints}</span>
            <span className="hostel-kpi-title">New Complaints</span>
            <span className="hostel-kpi-subtitle">Awaiting Assignment</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber">
            <AlertTriangle size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{inProgress}</span>
            <span className="hostel-kpi-title">In Progress</span>
            <span className="hostel-kpi-subtitle">Housekeeping Staff On Duty</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{resolved}</span>
            <span className="hostel-kpi-title">Resolved Complaints</span>
            <span className="hostel-kpi-subtitle">Cleaned &amp; Verified</span>
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="hostel-filter-strip">
        <div className="hostel-search-input" style={{ flex: 1, minWidth: '220px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search complaint code, room, or defect description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hostel-filter-group">
          <select
            className="hostel-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="ALL">All Cleanliness Categories</option>
            <option value="Room Cleaning">Room Cleaning</option>
            <option value="Bathroom / Toilet Cleaning">Bathroom / Toilet Cleaning</option>
            <option value="Dustbin Not Emptied">Dustbin Not Emptied</option>
            <option value="Dirty Floor">Dirty Floor</option>
            <option value="Unclean Bedding">Unclean Bedding</option>
            <option value="Bad Odour">Bad Odour</option>
            <option value="Pest or Insect Issue">Pest or Insect Issue</option>
            <option value="Common Area Cleaning">Common Area Cleaning</option>
            <option value="Corridor Cleaning">Corridor Cleaning</option>
            <option value="Other Cleanliness Issue">Other Cleanliness Issue</option>
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

      {/* Cleanliness Complaints Table */}
      <div className="hostel-table-container">
        <div className="hostel-table-scroll">
          <table className="hostel-data-table">
            <thead>
              <tr>
                <th>Complaint Code</th>
                <th>Lodged Date</th>
                <th>Category &amp; Location</th>
                <th>Room Particulars</th>
                <th>Title &amp; Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                    <Sparkles size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                    No cleanliness complaints found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 800, color: '#7c3aed' }}>
                      {item.complaintCode}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.category}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>📍 {item.location}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Room {item.roomNumber}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.block} · {item.floor}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.86rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      <span className={`h-badge ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#334155' }}>
                      {item.assignedStaffName || 'Pending Assignment'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDetailModal(item)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={13} /> View
                        </button>

                        {/* Student Verification Action if work marked complete */}
                        {item.status === 'Awaiting Verification' && (
                          <button
                            type="button"
                            onClick={() => {
                              setVerificationModalComplaint(item);
                              setVerifyResult('Confirmed Cleaned');
                              setVerifyRating(5);
                              setVerifyFeedback('');
                              setVerifyUnresolvedReason('');
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#16a34a',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={13} /> Verify
                          </button>
                        )}

                        {/* Reopen Action for resolved issues that re-emerge */}
                        {item.status === 'Resolved' && (
                          <button
                            type="button"
                            onClick={() => {
                              setReopenModalComplaint(item);
                              setReopenReason('');
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #fca5a5',
                              background: '#fef2f2',
                              color: '#991b1b',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <RotateCcw size={13} /> Reopen
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

      {/* ======================================================== */}
      {/* MODAL 1: SUBMIT NEW CLEANLINESS COMPLAINT                 */}
      {/* ======================================================== */}
      {isSubmitModalOpen && (
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
        }} onClick={() => setIsSubmitModalOpen(false)}>
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
              padding: '1.1rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#7c3aed" />
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                  Lodge Room Cleanliness Complaint
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLodgeComplaint} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Auto-populated read-only student details banner */}
              <div style={{
                background: '#f1f5f9',
                borderRadius: '10px',
                padding: '1rem',
                border: '1px solid #cbd5e1'
              }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Resident Allotment Details (Locked to Authenticated Profile)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div><strong>Student:</strong> {studentName} ({studentRoll})</div>
                  <div><strong>Hostel:</strong> {studentHostel}</div>
                  <div><strong>Block &amp; Floor:</strong> {studentBlock} · {studentFloor}</div>
                  <div><strong>Room Allotted:</strong> Room {studentRoom}</div>
                </div>
              </div>

              {/* Form Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Complaint Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Room Cleaning">Room Cleaning</option>
                    <option value="Bathroom / Toilet Cleaning">Bathroom / Toilet Cleaning</option>
                    <option value="Dustbin Not Emptied">Dustbin Not Emptied</option>
                    <option value="Dirty Floor">Dirty Floor</option>
                    <option value="Unclean Bedding">Unclean Bedding</option>
                    <option value="Bad Odour">Bad Odour</option>
                    <option value="Pest or Insect Issue">Pest or Insect Issue</option>
                    <option value="Common Area Cleaning">Common Area Cleaning</option>
                    <option value="Corridor Cleaning">Corridor Cleaning</option>
                    <option value="Other Cleanliness Issue">Other Cleanliness Issue</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Location in Hostel *
                  </label>
                  <select
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="My Room">My Room (Room {studentRoom})</option>
                    <option value="Attached Bathroom">Attached Bathroom</option>
                    <option value="Common Bathroom">Common Floor Washroom</option>
                    <option value="Corridor">Floor Corridor</option>
                    <option value="Common Area">Common Room / Study Hall</option>
                    <option value="Other">Other Area</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Priority *
                  </label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Normal">Normal (Routine Cleaning - 24-48 hrs)</option>
                    <option value="High">High (Needs Attention Today)</option>
                    <option value="Urgent">Urgent (Immediate Hygiene Risk)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Preferred Cleaning Time Slot
                  </label>
                  <select
                    value={formPreferredTime}
                    onChange={e => setFormPreferredTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="09:00 AM - 11:00 AM">Morning (09:00 AM - 11:00 AM)</option>
                    <option value="11:00 AM - 01:00 PM">Late Morning (11:00 AM - 01:00 PM)</option>
                    <option value="03:00 PM - 05:00 PM">Afternoon (03:00 PM - 05:00 PM)</option>
                    <option value="Anytime today">Anytime Today (When Staff Available)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Complaint Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Washroom floor tiles sticky; dustbins need clearance"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Provide complete details so housekeeping staff can bring proper disinfectants and tools."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Photo Attachment (Optional) */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Photo Attachment (Optional)
                </label>
                <div style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#f8fafc'
                }}>
                  <Upload size={20} color="#64748b" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = () => setFormAttachment(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
                {formAttachment && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={formAttachment} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>✓ Image uploaded &amp; attached</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#7c3aed',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={15} /> {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RESOLUTION VERIFICATION MODAL                   */}
      {/* ======================================================== */}
      {verificationModalComplaint && (
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
        }} onClick={() => setVerificationModalComplaint(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '560px',
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
                  Verify Cleaning Resolution ({verificationModalComplaint.complaintCode})
                </h4>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {verificationModalComplaint.category} · Room {verificationModalComplaint.roomNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerificationModalComplaint(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerificationSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                  Staff Work Completion Note
                </div>
                <div style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '2px' }}>
                  {verificationModalComplaint.cleaningInstructions || 'Housekeeping has sanitized the specified area and marked work complete.'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  Did housekeeping adequately clean and resolve the problem?
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setVerifyResult('Confirmed Cleaned')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: verifyResult === 'Confirmed Cleaned' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: verifyResult === 'Confirmed Cleaned' ? '#f0fdf4' : '#ffffff',
                      color: verifyResult === 'Confirmed Cleaned' ? '#166534' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Yes, Room Cleaned
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyResult('Unresolved')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: verifyResult === 'Unresolved' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: verifyResult === 'Unresolved' ? '#fef2f2' : '#ffffff',
                      color: verifyResult === 'Unresolved' ? '#991b1b' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✗ No, Still Unclean
                  </button>
                </div>
              </div>

              {verifyResult === 'Confirmed Cleaned' ? (
                <>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Cleanliness Satisfaction Rating
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setVerifyRating(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: star <= verifyRating ? '#f59e0b' : '#cbd5e1'
                          }}
                        >
                          <Star size={22} fill={star <= verifyRating ? '#f59e0b' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Comments / Feedback (Optional)
                    </label>
                    <input
                      type="text"
                      value={verifyFeedback}
                      onChange={e => setVerifyFeedback(e.target.value)}
                      placeholder="e.g. Thoroughly cleaned, bathroom is spotless."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', display: 'block', marginBottom: '4px' }}>
                    Reason Unresolved (Mandatory for Reopening) *
                  </label>
                  <textarea
                    rows={3}
                    value={verifyUnresolvedReason}
                    onChange={e => setVerifyUnresolvedReason(e.target.value)}
                    placeholder="Specify what remains unclean or what staff missed."
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #fca5a5',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setVerificationModalComplaint(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: verifyResult === 'Confirmed Cleaned' ? '#16a34a' : '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    opacity: isVerifying ? 0.7 : 1
                  }}
                >
                  {isVerifying ? 'Saving...' : verifyResult === 'Confirmed Cleaned' ? 'Confirm Resolution' : 'Reopen Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REOPEN COMPLAINT MODAL                          */}
      {/* ======================================================== */}
      {reopenModalComplaint && (
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
        }} onClick={() => setReopenModalComplaint(null)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              background: '#fef2f2',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #fecaca',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={18} color="#dc2626" />
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#991b1b' }}>
                  Reopen Cleanliness Complaint ({reopenModalComplaint.complaintCode})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setReopenModalComplaint(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReopenSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Why does this complaint need to be reopened? *
                </label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={e => setReopenReason(e.target.value)}
                  placeholder="Explain why the problem has recurred or what remains incomplete."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReopenModalComplaint(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReopening}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    opacity: isReopening ? 0.7 : 1
                  }}
                >
                  {isReopening ? 'Reopening...' : 'Reopen Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: FULL COMPLAINT DETAIL & STATUS HISTORY          */}
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
            maxWidth: '640px',
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
                  Cleanliness Complaint #{selectedDetailModal.complaintCode}
                </h4>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {selectedDetailModal.hostel} · Room {selectedDetailModal.roomNumber} ({selectedDetailModal.block})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Category:</strong> {selectedDetailModal.category}</div>
                <div><strong>Location:</strong> {selectedDetailModal.location}</div>
                <div><strong>Priority:</strong> <span className={`h-badge ${selectedDetailModal.priority === 'Urgent' ? 'h-badge-urgent' : 'h-badge-low'}`}>{selectedDetailModal.priority}</span></div>
                <div><strong>Current Status:</strong> <span className={`h-badge ${getStatusBadgeClass(selectedDetailModal.status)}`}>{selectedDetailModal.status}</span></div>
                <div><strong>Assigned Warden:</strong> {selectedDetailModal.assignedWardenName || 'Hostel Warden'}</div>
                <div><strong>Housekeeping Staff:</strong> {selectedDetailModal.assignedStaffName || 'Pending Assignment'}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>Description:</div>
                <div style={{ fontSize: '0.86rem', color: '#1e293b', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                  "{selectedDetailModal.description}"
                </div>
              </div>

              {selectedDetailModal.attachmentUrl && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>Photo Evidence:</div>
                  <img src={selectedDetailModal.attachmentUrl} alt="Complaint Evidence" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              )}

              {/* Status History Audit Trail */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  Status Lifecycle &amp; Resolution History:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '2px solid #cbd5e1', paddingLeft: '12px', marginLeft: '6px' }}>
                  {(selectedDetailModal.statusHistory || []).map((step, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#334155' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{step.status}</span>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', marginLeft: '6px' }}>
                        {step.timestamp ? new Date(step.timestamp).toLocaleString() : ''}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>
                        "{step.note}" — <span style={{ fontWeight: 600 }}>{step.actor || 'System'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection reason if any */}
              {selectedDetailModal.rejectionReason && (
                <div style={{ background: '#fef2f2', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                    Rejection Reason
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '2px' }}>
                    {selectedDetailModal.rejectionReason}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailModal(null)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
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
