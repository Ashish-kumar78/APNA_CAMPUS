import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  ShieldCheck,
  Calendar,
  XCircle,
  Eye,
  Printer,
  Settings,
  Sparkles,
  UserPlus,
  Phone,
  Shield,
  Info,
  Home,
  Check,
  RotateCcw,
  Building,
  Wrench,
  User,
  Users
} from 'lucide-react';
import './StudentHostelPage.css';
import StudentGatePassSection from '../components/StudentGatePassSection.jsx';
import StudentVisitorRegistrationSection from '../components/StudentVisitorRegistrationSection.jsx';
import SmartComplaintModal from '../components/SmartComplaintModal.jsx';
import { getStudentGatePasses } from '../services/gatePassStore.js';
import {
  getAllHostelComplaints,
  getStudentComplaints,
  updateComplaintStatusInStore,
  subscribeHostelComplaints
} from '../services/hostelMaintenanceStore.js';
import {
  getAllResidentLeaves,
  getResidentLeavesByStudent,
  createResidentLeave,
  normalizeLeaveStatus
} from '../services/hostelResidentLeaveStore.js';
import { getActiveStudent } from '../services/studentStore.js';
import HostelSettingsRulesSection from '../components/hostel/HostelSettingsRulesSection.jsx';
import StudentFoodFeedbackSection from '../components/hostel/StudentFoodFeedbackSection.jsx';
import StudentCleanlinessSection from '../components/hostel/StudentCleanlinessSection.jsx';
import { getAllHostels } from '../services/hostelAttendanceStore.js';
import { getStudentRulesList, subscribeHostelRules } from '../services/hostelRulesStore.js';

export default function StudentHostelPage({ defaultTab = 'room-maintenance', account }) {
  const [activeSubTab, setActiveSubTab] = useState(defaultTab === 'overview' ? 'room-maintenance' : (defaultTab || 'room-maintenance'));
  const [pendingGatePassCount, setPendingGatePassCount] = useState(0);

  // Complaints state & synchronization
  const [complaints, setComplaints] = useState(() => getAllHostelComplaints());
  const [isSmartComplaintModalOpen, setIsSmartComplaintModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeHostelComplaints((updated) => {
      setComplaints(updated);
    });
    return unsub;
  }, []);

  // Live Admin Policy for Hostel Regulations & Code of Conduct live sync
  const [liveRules, setLiveRules] = useState(() => getStudentRulesList());
  useEffect(() => {
    const unsub = subscribeHostelRules(() => {
      setLiveRules(getStudentRulesList());
    });
    return unsub;
  }, []);
  // Defensive helper for regulations rendering: typeof rule === 'string'
  const getRuleDisplay = (rule) => (typeof rule === 'string' ? rule : rule?.title || '');

  // Student Leaves state & synchronization
  const activeStudent = getActiveStudent();
  const effectiveUser = account || activeStudent;
  const currentStudentName = effectiveUser?.name || 'Aman Kumar Sharma';
  const currentRollNumber = effectiveUser?.registrationNumber || effectiveUser?.rollNumber || effectiveUser?.identifier || '2305201001';
  const currentHostel = effectiveUser?.hostelName || 'Sarojini Girls Residence (Block A)';
  const currentRoom = effectiveUser?.roomNumber || '204';
  const currentPhone = effectiveUser?.phone || '+91 94370 11999';

  const [residentLeaves, setResidentLeaves] = useState(() => getAllResidentLeaves());
  const [hostelList, setHostelList] = useState(() => getAllHostels());
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState(null);
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [leaveToast, setLeaveToast] = useState(null);
  const [leaveFloor, setLeaveFloor] = useState('1st Floor');

  useEffect(() => {
    const handleHostelSync = () => setHostelList(getAllHostels());
    window.addEventListener('bput_hostels_updated', handleHostelSync);
    window.addEventListener('storage', handleHostelSync);
    return () => {
      window.removeEventListener('bput_hostels_updated', handleHostelSync);
      window.removeEventListener('storage', handleHostelSync);
    };
  }, []);

  const [newLeaveForm, setNewLeaveForm] = useState({
    studentName: currentStudentName,
    rollNumber: currentRollNumber,
    regNo: currentRollNumber,
    hostelName: currentHostel,
    roomNumber: currentRoom,
    phone: currentPhone,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    days: 2,
    reason: '',
    guardianName: effectiveUser?.guardianName || effectiveUser?.fatherName || 'D. Das',
    guardianPhone: effectiveUser?.guardianPhone || effectiveUser?.fatherPhone || '+91 94370 11888'
  });

  useEffect(() => {
    const handleLeavesSync = () => {
      setResidentLeaves(getAllResidentLeaves());
    };
    window.addEventListener('bput_hostel_leaves_updated', handleLeavesSync);
    window.addEventListener('storage', handleLeavesSync);
    return () => {
      window.removeEventListener('bput_hostel_leaves_updated', handleLeavesSync);
      window.removeEventListener('storage', handleLeavesSync);
    };
  }, []);

  const showLeaveToast = (msg) => {
    setLeaveToast(msg);
    setTimeout(() => setLeaveToast(null), 3500);
  };

  const studentFilteredLeaves = useMemo(() => {
    const activeRoll = currentRollNumber?.toLowerCase();
    const myLeaves = residentLeaves.filter(l =>
      (l.rollNumber && String(l.rollNumber).toLowerCase() === activeRoll) ||
      (l.regNo && String(l.regNo).toLowerCase() === activeRoll) ||
      (l.studentName && l.studentName.toLowerCase() === currentStudentName.toLowerCase())
    );
    return myLeaves.length > 0 ? myLeaves : residentLeaves;
  }, [residentLeaves, currentRollNumber, currentStudentName]);

  const normStatus = (s) => normalizeLeaveStatus(s);

  const rejectedLeavesCount = useMemo(() => {
    return residentLeaves.filter(l => normStatus(l.status) === 'Rejected').length;
  }, [residentLeaves]);

  const highPriorityRejection = useMemo(() => {
    return studentFilteredLeaves.find(l => normStatus(l.status) === 'Rejected') || null;
  }, [studentFilteredLeaves]);

  const highPriorityApproved = useMemo(() => {
    return studentFilteredLeaves.find(l => normStatus(l.status) === 'Approved' && !l.returned) || null;
  }, [studentFilteredLeaves]);

  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    if (!newLeaveForm.reason.trim()) {
      alert('Please specify the reason for your outstation leave.');
      return;
    }
    const created = createResidentLeave({
      ...newLeaveForm,
      studentName: newLeaveForm.studentName || currentStudentName,
      rollNumber: newLeaveForm.rollNumber || currentRollNumber,
      regNo: newLeaveForm.regNo || currentRollNumber,
      hostelName: newLeaveForm.hostelName || currentHostel,
      roomNumber: newLeaveForm.roomNumber || currentRoom,
    });
    // Immediately update local UI state (<1ms)
    setResidentLeaves(prev => [created, ...prev.filter(l => l.id !== created.id)]);
    setIsApplyLeaveModalOpen(false);
    showLeaveToast(`✓ Leave Application ${created.id} submitted successfully to Resident Warden & Hostel Administrator.`);
  };

  const myComplaints = useMemo(() => {
    return getStudentComplaints(currentRollNumber);
  }, [complaints, currentRollNumber]);

  const handleStudentVerify = (complaintId, isResolved) => {
    if (isResolved) {
      updateComplaintStatusInStore(complaintId, 'Resolved', currentStudentName, 'STUDENT', 'Verified and confirmed resolved by resident student.');
      showLeaveToast('✓ Ticket marked as Resolved! Feedback recorded.');
    } else {
      updateComplaintStatusInStore(complaintId, 'Reopened', currentStudentName, 'STUDENT', 'Reopened by student: Issue was not resolved.');
      showLeaveToast('⚠️ Ticket Reopened and re-routed to Resident Warden & Technical Team.');
    }
  };

  const getDeadlineInfo = (complaint) => {
    const deadlineMs = complaint.resolutionDeadline
      ? new Date(complaint.resolutionDeadline).getTime()
      : (new Date(complaint.filedDate || Date.now()).getTime() + 72 * 3600 * 1000);
    const now = Date.now();
    const diffHours = Math.round((deadlineMs - now) / (1000 * 60 * 60));
    const deadlineDate = new Date(deadlineMs);
    const deadlineStr = `${deadlineDate.getDate()} ${deadlineDate.toLocaleString('en-US', { month: 'short' })}, ${deadlineDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    return {
      diffHours,
      diffText: diffHours > 0 ? `${diffHours} hours remaining` : 'Deadline exceeded',
      deadlineStr
    };
  };

  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('submi') || s.includes('pend')) return 1;
    if (s === 'assigned') return 2;
    if (s.includes('progress')) return 3;
    if (s.includes('awaiting') || s.includes('verif')) return 4;
    if (s.includes('resolv') || s.includes('close')) return 5;
    return 1;
  };

  useEffect(() => {
    setActiveSubTab(defaultTab === 'overview' ? 'room-maintenance' : (defaultTab || 'room-maintenance'));
  }, [defaultTab]);

  useEffect(() => {
    const updateCount = () => {
      const passes = getStudentGatePasses();
      const p = passes.filter(x => x.status === 'Pending Warden Approval').length;
      setPendingGatePassCount(p);
    };
    updateCount();
    window.addEventListener('bput_gate_passes_changed', updateCount);
    return () => window.removeEventListener('bput_gate_passes_changed', updateCount);
  }, []);

  return (
    <div className="student-hostel-page">
      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('room-maintenance')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'room-maintenance' ? '#4f46e5' : '#f1f5f9',
            color: activeSubTab === 'room-maintenance' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'room-maintenance' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Home size={17} /> Room Allocation &amp; Maintenance
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gate-pass')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'gate-pass' ? '#4338ca' : '#f1f5f9',
            color: activeSubTab === 'gate-pass' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'gate-pass' ? '0 4px 12px rgba(67, 56, 202, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <ShieldCheck size={17} /> Hostel Gate Pass (Outing / Home Visit)
          {pendingGatePassCount > 0 && (
            <span style={{
              background: activeSubTab === 'gate-pass' ? '#fde047' : '#f59e0b',
              color: '#0f172a',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '9999px',
              marginLeft: '4px'
            }}>
              {pendingGatePassCount} Pending
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('visitors')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'visitors' ? '#0284c7' : '#f1f5f9',
            color: activeSubTab === 'visitors' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'visitors' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <UserPlus size={17} /> Visitor Registration
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('rules')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'rules' ? '#2563eb' : '#f1f5f9',
            color: activeSubTab === 'rules' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'rules' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={17} /> Hostel Rules &amp; Curfew
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('cleanliness')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'cleanliness' ? '#d97706' : '#f1f5f9',
            color: activeSubTab === 'cleanliness' ? '#ffffff' : '#475569',
            boxShadow: activeSubTab === 'cleanliness' ? '0 4px 12px rgba(217, 119, 6, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={17} /> Room Cleanliness Complaints
        </button>
      </div>

      {activeSubTab === 'room-maintenance' ? (
        <div className="hostel-residence-container">
          {/* Header Banner */}
          <div className="hostel-header-banner">
            <div>
              <h1>My Hostel Residence &amp; Accommodation</h1>
              <p>Room allocation, roommates, hostel guidelines, and 24/7 maintenance desk</p>
            </div>
            <button
              type="button"
              className="btn-lodge-complaint"
              onClick={() => setIsSmartComplaintModalOpen(true)}
            >
              <Plus size={16} /> Lodge Maintenance Request
            </button>
          </div>

          {/* Top 3 KPI Cards */}
          <div className="hostel-kpi-row">
            {/* Card 1: ALLOCATED ROOM */}
            <div className="hostel-kpi-box">
              <div>
                <div className="hostel-kpi-label">ALLOCATED ROOM</div>
                <div className="hostel-kpi-title">{currentRoom ? `Room ${currentRoom}` : 'Room 204'}</div>
                <div className="hostel-kpi-sub">Bed 01 (Window Side) · Floor 2</div>
              </div>
              <div>
                <span className="hostel-badge-chip green">
                  ✓ AC Triple Deluxe Accommodation
                </span>
              </div>
            </div>

            {/* Card 2: RESIDENCE COMPLEX */}
            <div className="hostel-kpi-box">
              <div>
                <div className="hostel-kpi-label">RESIDENCE COMPLEX</div>
                <div className="hostel-kpi-title" style={{ fontSize: '1.12rem' }}>
                  {currentHostel || 'Sarojini Girls Residence (Block A)'}
                </div>
                <div className="hostel-kpi-sub">
                  Resident Warden: Mrs. Nibedita Das
                </div>
              </div>
              <div>
                <a href="tel:+919437033445" className="warden-phone-link">
                  <Phone size={12} /> +91 94370 33445
                </a>
              </div>
            </div>

            {/* Card 3: HOSTEL FEE STATUS */}
            <div className="hostel-kpi-box">
              <div>
                <div className="hostel-kpi-label">HOSTEL FEE STATUS</div>
                <div className="hostel-kpi-title" style={{ color: '#16a34a' }}>Partially Paid</div>
                <div className="hostel-kpi-sub">₹20,000 Paid · ₹12,000 Balance Due</div>
              </div>
              <div>
                <span className="hostel-badge-chip green">
                  Mess Clearance: Active
                </span>
              </div>
            </div>
          </div>

          {/* Middle 2 Cards Grid */}
          <div className="hostel-sub-grid">
            {/* Left: Room 204 Roommates */}
            <div className="hostel-sub-card">
              <h3>Room {currentRoom || '204'} Roommates</h3>
              <div className="roommate-row">
                <div className="roommate-avatar-circle" style={{ background: '#8b5cf6' }}>P</div>
                <div>
                  <div className="roommate-details-name">Priya Patra</div>
                  <div className="roommate-details-sub">Roll 02 · CSE · Sem 1 · Bed 02</div>
                </div>
              </div>
              <div className="roommate-row">
                <div className="roommate-avatar-circle" style={{ background: '#7c3aed' }}>S</div>
                <div>
                  <div className="roommate-details-name">Sneha Mohanty</div>
                  <div className="roommate-details-sub">Roll 03 · CSE · Sem 1 · Bed 03</div>
                </div>
              </div>
            </div>

            {/* Right: Hostel Regulations & Code of Conduct */}
            <div className="hostel-sub-card">
              <h3>Hostel Regulations &amp; Code of Conduct</h3>
              <ul className="hostel-rules-list">
                <li>Night curfew strictly implemented at 6:30 PM.</li>
                <li>Biometric attendance check-in compulsory before 6:45 PM.</li>
                <li>Mess timings: Breakfast 7:30 - 9:00 AM, Dinner 7:30 - 8:30 PM.</li>
                <li>Electric heating appliances and immersion rods strictly prohibited.</li>
              </ul>
            </div>
          </div>

          {/* Complaints Section */}
          <div className="hostel-complaints-section">
            <div className="hostel-complaints-header">
              <h2>My Maintenance Complaints</h2>
              <span className="complaint-count-badge">
                {myComplaints.length} Details Recorded
              </span>
            </div>

            {myComplaints.length === 0 ? (
              <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <p style={{ margin: '0 0 0.75rem 0', fontWeight: 600 }}>No maintenance requests logged yet.</p>
                <button
                  type="button"
                  className="btn-lodge-complaint"
                  onClick={() => setIsSmartComplaintModalOpen(true)}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  <Plus size={14} /> Lodge Maintenance Request
                </button>
              </div>
            ) : (
              myComplaints.map(c => {
                const deadline = getDeadlineInfo(c);
                const stepIdx = getStepIndex(c.status);
                const isPendingApproval = c.status === 'Submitted' || c.status === 'Pending' || c.status === 'Pending Warden Approval';
                const isAssigned = c.status === 'Assigned';
                const isInProgress = c.status === 'In Progress';
                const isAwaitingVerif = c.status === 'Awaiting Student Verification' || c.status === 'Awaiting Verification';
                const isResolved = c.status === 'Resolved';

                const statusLabel = isPendingApproval ? 'Submitted' : c.status;
                const statusClass = isResolved ? 'resolved' : isAwaitingVerif ? 'awaiting' : isInProgress ? 'in-progress' : isAssigned ? 'assigned' : 'submitted';
                const priorityClass = (c.priority || 'Medium').toLowerCase();

                return (
                  <div key={c.id} className="complaint-ticket-card">
                    {/* Title & Tags Row */}
                    <div className="complaint-title-row">
                      <div className="complaint-title-group">
                        <span className="complaint-main-title">{c.title}</span>
                        <span className={`complaint-pill ${priorityClass}`}>{c.priority || 'Medium'}</span>
                        <span className="complaint-pill category">{c.category || 'Maintenance'}</span>
                        <span className="complaint-pill ai">
                          <Sparkles size={11} /> AI: {c.predictedCategory || (c.category ? c.category.toLowerCase() : 'defect')} ({c.confidence ? (c.confidence <= 1 ? Math.round(c.confidence * 100) : c.confidence) : 92}%)
                        </span>
                        <span className="complaint-pill deadline">
                          <Clock size={11} /> {deadline.diffText}
                        </span>
                      </div>
                      <span className={`complaint-status-chip ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Meta Line */}
                    <div className="complaint-meta-line">
                      <strong>Ticket: {c.id}</strong> · Filed: {c.filedDate || 'Today'} · {c.location || 'Room 204 Attached Bathroom'} · 72h Deadline: {deadline.deadlineStr}
                    </div>

                    {/* Warden Strip */}
                    <div className="complaint-warden-strip">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} color="#6366f1" />
                        <span>Assigned Resident Warden: <strong>{c.assignedWardenName || 'Mrs. Nibedita Das'}</strong> (Auto-routed by Hostel &amp; Block)</span>
                      </div>
                      <a href={`tel:${c.assignedWardenContact || '+919437033445'}`} className="warden-call-btn">
                        <Phone size={11} /> {c.assignedWardenContact || '+91 94370 33445'}
                      </a>
                    </div>

                    {/* Description Box */}
                    <div className="complaint-desc-box">
                      {c.description || c.title}
                    </div>

                    {/* Technician Strip (if assigned) */}
                    {c.assignedStaffName ? (
                      <div className="complaint-technician-strip">
                        <div className="tech-info-left">
                          <div className="tech-avatar">
                            {c.assignedStaffName.split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <div className="tech-name">{c.assignedStaffName}</div>
                            <div className="tech-role">{c.assignedStaffRole || 'Technician'} · Auto-assigned by workload</div>
                          </div>
                        </div>
                        <a href={`tel:${c.assignedStaffPhone || '+919437911231'}`} className="tech-call-btn">
                          <Phone size={12} /> {c.assignedStaffPhone || '+91 94379 11231'}
                        </a>
                      </div>
                    ) : (
                      <div style={{ background: '#fffbeb', border: '1px dashed #fde68a', borderRadius: '8px', padding: '0.5rem 0.85rem', fontSize: '0.78rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} /> Awaiting Resident Warden approval and technician assignment
                      </div>
                    )}

                    {/* 5-Step Pipeline Tracker */}
                    <div className="complaint-pipeline-stepper">
                      <span className={`pipeline-step ${stepIdx === 1 ? 'active' : stepIdx > 1 ? 'done' : ''}`}>
                        1. Submitted
                      </span>
                      <span className="pipeline-arrow">→</span>
                      <span className={`pipeline-step ${stepIdx === 2 ? 'active' : stepIdx > 2 ? 'done' : ''}`}>
                        2. Assigned
                      </span>
                      <span className="pipeline-arrow">→</span>
                      <span className={`pipeline-step ${stepIdx === 3 ? 'active' : stepIdx > 3 ? 'done' : ''}`}>
                        3. In Progress
                      </span>
                      <span className="pipeline-arrow">→</span>
                      <span className={`pipeline-step ${stepIdx === 4 ? 'active' : stepIdx > 4 ? 'done' : ''}`}>
                        4. Awaiting Verification
                      </span>
                      <span className="pipeline-arrow">→</span>
                      <span className={`pipeline-step ${stepIdx === 5 ? 'active' : ''}`}>
                        5. Resolved
                      </span>
                    </div>

                    {/* Status Log line */}
                    <div className="complaint-status-log">
                      <Info size={12} color="#6366f1" />
                      <span>Status Log: {c.resolutionNotes || (c.statusHistory && c.statusHistory[c.statusHistory.length - 1]?.note) || 'Complaint lodged.'}</span>
                    </div>

                    {/* Verification Actions */}
                    {isAwaitingVerif && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: '8px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
                          Technician marked work done. Please verify if the issue is resolved:
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleStudentVerify(c.id, true)}
                            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            <Check size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Confirm Resolved
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentVerify(c.id, false)}
                            style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            <RotateCcw size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Reopen Issue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : activeSubTab === 'gate-pass' ? (
        <StudentGatePassSection onOpenVisitorRegistration={() => setActiveSubTab('visitors')} />
      ) : activeSubTab === 'visitors' ? (
        <StudentVisitorRegistrationSection />
      ) : activeSubTab === 'leaves' ? (
        <div className="student-leaves-container">
          {/* Toast message */}
          {leaveToast && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} /> {leaveToast}
            </div>
          )}

          {/* HIGH-PRIORITY APPROVED NOTICE (When leave is approved by Admin or Warden) */}
          {highPriorityApproved && (
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 800, fontSize: '0.96rem' }}>
                  <CheckCircle2 size={20} color="#16a34a" />
                  <span>Outstation Leave Application {highPriorityApproved.id} is Officially APPROVED</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Sanctioned: {highPriorityApproved.approvedBy || 'Hostel Admin / Warden'} {highPriorityApproved.approvedAt ? `· ${highPriorityApproved.approvedAt}` : ''}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#14532d', lineHeight: 1.5 }}>
                Your overnight outstation leave request for <strong>"{highPriorityApproved.reason}"</strong> ({highPriorityApproved.startDate} → {highPriorityApproved.endDate}, {highPriorityApproved.days} Days) has been approved. Guardian verification is confirmed and digital pass clearance has been sanctioned.
              </div>
            </div>
          )}

          {/* HIGH-PRIORITY WARDEN / ADMIN REJECTION BANNER (User requirement: reason mentioned shown to student) */}
          {highPriorityRejection && (
            <div className="student-leave-rejection-banner">
              <div className="rejection-banner-header">
                <div className="rejection-banner-title">
                  <AlertTriangle size={20} color="#e11d48" />
                  <span>Important Notice: Leave Application {highPriorityRejection.id} Rejected by Hostel Authority</span>
                </div>
                <div className="rejection-banner-time">
                  Decided: {highPriorityRejection.rejectedAt || 'Recent'}
                </div>
              </div>

              <div className="rejection-quote-box">
                <div className="rejection-quote-label">
                  <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Reason Stated by Authority for Rejection:
                </div>
                <p className="rejection-quote-text">
                  "{highPriorityRejection.rejectionReason || 'Parent / Guardian telephonic consent could not be verified by hostel warden office.'}"
                </p>
              </div>

              <div className="rejection-banner-footer">
                <div>
                  Action taken by: <strong>{highPriorityRejection.rejectedBy || 'Hostel Administration / Warden'}</strong>
                  &nbsp;·&nbsp; Resident: <strong>{highPriorityRejection.studentName} ({highPriorityRejection.rollNumber || highPriorityRejection.regNo})</strong>
                </div>
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: '#fca5a5', color: '#991b1b', background: '#ffffff', fontWeight: 700 }}
                  onClick={() => setSelectedLeaveDetail(highPriorityRejection)}
                >
                  <Eye size={13} /> View Official Rejection Notice
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="student-hostel-header">
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={22} style={{ color: '#dc2626' }} /> My Overnight Leaves &amp; Outstation Requests
              </h1>
              <p>Official registry of overnight leave applications submitted to Resident Warden with real-time approvals and stated rejection reasons.</p>
            </div>
            <button
              type="button"
              className="admin-action-btn-primary"
              style={{ background: '#dc2626' }}
              onClick={() => setIsApplyLeaveModalOpen(true)}
            >
              <Plus size={15} /> Apply for Overnight Leave
            </button>
          </div>

          {/* Leaves Table Card */}
          <div className="student-leave-card-wrapper">
            {/* Leaves Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>App ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Student / Roll</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Hostel &amp; Room</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Leave Duration</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Reason</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Guardian Verification</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status &amp; Stated Reason</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFilteredLeaves.map(leave => {
                    const st = normStatus(leave.status);
                    const isRejected = st === 'Rejected';
                    const isApproved = st === 'Approved' || Boolean(leave.returned);
                    const isPending = !isRejected && !isApproved;

                    return (
                      <tr key={leave.id} style={{ borderBottom: '1px solid #f1f5f9', background: isRejected ? '#fffbfb' : '#ffffff' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {leave.id}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Applied: {leave.appliedOn}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{leave.studentName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Reg: {leave.rollNumber || leave.regNo}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{leave.phone}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{leave.hostelName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Room {leave.roomNumber}</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {leave.startDate} → {leave.endDate}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                            {leave.days} Days Total
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', maxWidth: '220px' }}>
                          <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                            {leave.reason}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{leave.guardianName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{leave.guardianPhone}</div>
                          <div style={{ fontSize: '0.72rem', color: leave.guardianStatus?.includes('Disapproved') ? '#dc2626' : '#166534', fontWeight: 600, marginTop: '2px' }}>
                            • {leave.guardianStatus}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', minWidth: '240px' }}>
                          {isRejected && (
                            <div>
                              <span className="badge-leave-rejected">
                                <XCircle size={12} /> Rejected
                              </span>
                              {/* Prominently show reason to student */}
                              <div className="student-leave-reason-chip">
                                <div className="student-leave-reason-label">
                                  <AlertCircle size={11} /> Reason Mentioned by Authority:
                                </div>
                                <div className="student-leave-reason-text">
                                  "{leave.rejectionReason || 'Parent / Guardian telephonic consent could not be verified by hostel warden office.'}"
                                </div>
                                <div className="student-leave-reason-by">
                                  By {leave.rejectedBy || 'Hostel Authority'} · {leave.rejectedAt || 'Recent'}
                                </div>
                              </div>
                            </div>
                          )}

                          {isApproved && (
                            <div>
                              <span className="badge-leave-approved">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                              <span className={leave.returned ? "badge-leave-returned" : "badge-leave-away"}>
                                {leave.returned ? "✓ Returned" : "⏳ Away"}
                              </span>
                              <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px' }}>
                                Sanctioned by {leave.approvedBy || 'Hostel Administration'}
                              </div>
                            </div>
                          )}

                          {isPending && (
                            <div>
                              <span className="badge-leave-pending">
                                <Clock size={12} /> Pending Review
                              </span>
                              <div style={{ fontSize: '0.72rem', color: '#854d0e', marginTop: '3px' }}>
                                Under warden &amp; admin verification
                              </div>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="admin-action-btn-secondary"
                            style={{
                              fontSize: '0.78rem',
                              padding: '0.4rem 0.75rem',
                              color: isRejected ? '#991b1b' : '#334155',
                              borderColor: isRejected ? '#fca5a5' : '#cbd5e1',
                              background: isRejected ? '#fef2f2' : '#ffffff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => setSelectedLeaveDetail(leave)}
                          >
                            <Eye size={13} /> {isRejected ? 'View Notice' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {studentFilteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        <Calendar size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No leave applications found for this student.</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem' }}>Click "Apply for Overnight Leave" above to create an outstation leave request.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── MODAL: VIEW FORMAL LEAVE & REJECTION NOTICE ── */}
          {selectedLeaveDetail && (
            <div className="admin-modal-backdrop" onClick={() => setSelectedLeaveDetail(null)}>
              <div
                className="admin-modal-card"
                style={{ maxWidth: '640px', width: '95vw' }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  className="admin-modal-header"
                  style={{
                    background: selectedLeaveDetail.status === 'Rejected' ? '#fef2f2' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1.25rem 1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {selectedLeaveDetail.status === 'Rejected' ? (
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                        <XCircle size={22} />
                      </div>
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <Calendar size={22} />
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: selectedLeaveDetail.status === 'Rejected' ? '#991b1b' : '#0f172a', fontWeight: 800 }}>
                        {selectedLeaveDetail.status === 'Rejected' ? 'Hostel Leave Application — Rejection Notice' : 'Hostel Overnight Leave Application Record'}
                      </h3>
                      <small style={{ color: selectedLeaveDetail.status === 'Rejected' ? '#b91c1c' : '#64748b' }}>
                        Application ID: <strong>{selectedLeaveDetail.id}</strong> · Submitted: {selectedLeaveDetail.appliedOn}
                      </small>
                    </div>
                  </div>
                  <button
                    className="admin-table-action-btn"
                    onClick={() => setSelectedLeaveDetail(null)}
                    style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="admin-modal-body" style={{ padding: '1.5rem' }}>
                  {/* REJECTION REASON CARD IF REJECTED */}
                  {selectedLeaveDetail.status === 'Rejected' && (
                    <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                        <AlertCircle size={15} /> Official Reason Stated by Resident Warden
                      </div>
                      <div style={{ fontSize: '1.02rem', color: '#881337', fontWeight: 600, lineHeight: '1.5', background: '#ffffff', padding: '14px 16px', borderRadius: '8px', borderLeft: '4px solid #e11d48' }}>
                        "{selectedLeaveDetail.rejectionReason || 'Parent / Guardian telephonic consent could not be verified by hostel warden office.'}"
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#9f1239', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <span>Decided by: <strong>{selectedLeaveDetail.rejectedBy || 'Mr. Rajesh Jena (Resident Warden)'}</strong></span>
                        <span>Date &amp; Time: <strong>{selectedLeaveDetail.rejectedAt || 'Recent'}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Application Data Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Resident Student</span>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedLeaveDetail.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>Reg No: {selectedLeaveDetail.rollNumber || selectedLeaveDetail.regNo}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Hostel &amp; Room</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedLeaveDetail.hostelName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>Room {selectedLeaveDetail.roomNumber}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Leave Period</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedLeaveDetail.startDate} → {selectedLeaveDetail.endDate}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{selectedLeaveDetail.days} Days Total</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Parent / Guardian</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedLeaveDetail.guardianName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedLeaveDetail.guardianPhone} ({selectedLeaveDetail.guardianStatus})</div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Stated Student Reason</span>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedLeaveDetail.reason}</div>
                    </div>
                  </div>

                  {/* Student Next Steps Notice */}
                  {selectedLeaveDetail.status === 'Rejected' && (
                    <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '0.8rem', color: '#0369a1' }}>
                      <strong>Resolution Guideline:</strong> If you believe the rejection was due to a telephonic miscommunication, have your parent/guardian call the Resident Warden directly at <strong>+91 94370 12345</strong>, or report in person to the Hostel Office between 05:00 PM and 07:00 PM.
                    </div>
                  )}
                </div>

                <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="admin-action-btn-secondary"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Print Notice
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn-primary"
                    style={{ background: '#0f172a' }}
                    onClick={() => setSelectedLeaveDetail(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── MODAL: APPLY FOR NEW OVERNIGHT LEAVE ── */}
          {isApplyLeaveModalOpen && (
            <div className="admin-modal-backdrop" onClick={() => setIsApplyLeaveModalOpen(false)}>
              <div
                className="admin-modal-card"
                style={{ maxWidth: '600px', width: '95vw' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="admin-modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Calendar size={20} color="#dc2626" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                        Apply for Overnight Outstation Leave
                      </h3>
                      <small style={{ color: '#64748b' }}>Application will be submitted directly to Resident Warden for verification.</small>
                    </div>
                  </div>
                  <button
                    className="admin-table-action-btn"
                    onClick={() => setIsApplyLeaveModalOpen(false)}
                    style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleApplyLeaveSubmit}>
                  <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Student Name</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={newLeaveForm.studentName}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, studentName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Registration / Roll Number</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={newLeaveForm.rollNumber}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, rollNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Hostel Residence</label>
                        <select
                          className="admin-form-select"
                          value={newLeaveForm.hostelName}
                          onChange={e => {
                            const newHostel = e.target.value;
                            const available = getRoomsForHostelAndFloor(newHostel, leaveFloor);
                            setNewLeaveForm({
                              ...newLeaveForm,
                              hostelName: newHostel,
                              roomNumber: available[0]?.roomNo || '101'
                            });
                          }}
                        >
                          {hostelList.map(h => (
                            <option key={h.id || h.code} value={h.name}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label>Floor</label>
                        <select
                          className="admin-form-select"
                          value={leaveFloor}
                          onChange={e => {
                            const newFloor = e.target.value;
                            setLeaveFloor(newFloor);
                            const available = getRoomsForHostelAndFloor(newLeaveForm.hostelName, newFloor);
                            setNewLeaveForm({
                              ...newLeaveForm,
                              roomNumber: available[0]?.roomNo || '101'
                            });
                          }}
                        >
                          <option value="1st Floor">1st Floor</option>
                          <option value="2nd Floor">2nd Floor</option>
                          <option value="3rd Floor">3rd Floor</option>
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label>Room Number *</label>
                        <select
                          className="admin-form-select"
                          value={newLeaveForm.roomNumber}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, roomNumber: e.target.value })}
                          required
                        >
                          {getRoomsForHostelAndFloor(newLeaveForm.hostelName, leaveFloor).map(r => (
                            <option key={r.roomNo} value={r.roomNo}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Leave Start Date</label>
                        <input
                          type="date"
                          className="admin-form-input"
                          value={newLeaveForm.startDate}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Leave End Date</label>
                        <input
                          type="date"
                          className="admin-form-input"
                          value={newLeaveForm.endDate}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Total Days</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          className="admin-form-input"
                          value={newLeaveForm.days}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, days: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>Reason for Outstation Leave *</label>
                      <textarea
                        className="admin-form-input"
                        rows="3"
                        placeholder="State clearly the reason for leaving campus (e.g. Sister's wedding in Berhampur, urgent dental procedure, hackathon)..."
                        value={newLeaveForm.reason}
                        onChange={e => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="admin-form-group">
                        <label>Parent / Guardian Name *</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={newLeaveForm.guardianName}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, guardianName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Parent / Guardian Contact *</label>
                        <input
                          type="tel"
                          className="admin-form-input"
                          value={newLeaveForm.guardianPhone}
                          onChange={e => setNewLeaveForm({ ...newLeaveForm, guardianPhone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      onClick={() => setIsApplyLeaveModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="admin-action-btn-primary"
                      style={{ background: '#dc2626' }}
                    >
                      Submit Leave Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : activeSubTab === 'rules' ? (
        <HostelSettingsRulesSection isHostelAdmin={false} canEditConfiguration={false} isStudent={true} account={account} />
      ) : activeSubTab === 'food-feedback' ? (
        <StudentFoodFeedbackSection account={account} />
      ) : activeSubTab === 'cleanliness' ? (
        <StudentCleanlinessSection account={account} />
      ) : (
        <StudentGatePassSection />
      )}

      {/* Lodge Smart Maintenance Complaint Modal */}
      <SmartComplaintModal
        isOpen={isSmartComplaintModalOpen}
        onClose={() => setIsSmartComplaintModalOpen(false)}
        hostelName={currentHostel}
        roomNumber={currentRoom}
        studentName={currentStudentName}
        rollNumber={currentRollNumber}
      />
    </div>
  );
}
