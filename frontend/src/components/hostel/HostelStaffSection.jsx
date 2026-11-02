import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  Calendar,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  RotateCcw,
  RefreshCw,
  UserX,
  FileText,
  X,
  Check,
  ShieldCheck
} from 'lucide-react';
import { mockHostelStaffList } from './hostelData.js';
import {
  getAllWardens,
  syncWardensFromBackend,
  setWardenDutyStatus
} from '../../services/wardenManagementStore.js';
import {
  getAllStaffLeaves,
  applyStaffLeave,
  approveStaffLeave,
  rejectStaffLeave,
  syncStaffLeavesFromBackend
} from '../../services/hostelStaffLeaveStore.js';
import { api } from '../../services/api.js';
import './HostelExtraSections.css';

export default function HostelStaffSection({ account, isHostelAdmin }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'roster'
  const [toastMsg, setToastMsg] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Form for recording new staff leave
  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
    alternativeArrangement: '',
    status: 'Approved by Hostel Admin'
  });

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Compute merged list of dynamic wardens and institutional support staff
  const loadMergedStaffList = useCallback(() => {
    const wardens = getAllWardens();
    const leaves = getAllStaffLeaves();

    // Map all wardens into standard staff roster format
    const wardenStaff = wardens.map(w => {
      const id = w.id || w.employeeId;
      const name = w.name;

      // Check if warden has an approved leave in staff leaves store
      const activeApprovedLeave = leaves.find(l => {
        const matchesEmp = l.employeeId && (l.employeeId === id || l.employeeId === w.employeeId);
        const matchesName = l.applicantName && name && (
          l.applicantName.toLowerCase() === name.toLowerCase() ||
          l.applicantName.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(l.applicantName.toLowerCase())
        );
        return (matchesEmp || matchesName) && l.status === 'Approved by Hostel Admin';
      });

      // An official is on leave if their dutyStatus is 'On Leave', accountStatus is 'On Leave',
      // or they have an active approved leave record
      const isOnLeave = (
        w.dutyStatus === 'On Leave' ||
        w.accountStatus === 'On Leave' ||
        Boolean(activeApprovedLeave)
      );

      // Check photo / avatar
      const avatarPhoto = w.avatar || w.photoUrl || (
        typeof window !== 'undefined'
          ? (localStorage.getItem(`hostel_officer_avatar_${id}`) || localStorage.getItem(`hostel_officer_avatar_${w.employeeId}`))
          : null
      );

      return {
        id: id,
        employeeId: w.employeeId || id,
        name: name,
        designation: w.designation || 'Resident Warden',
        hostel: w.hostelName || w.assignedHostelOrPost || 'Gandhi Boys Residence',
        shift: w.dutyShift || 'General / 24x7 Resident',
        phone: w.phone || w.mobileNo || '+91 94370 00000',
        email: w.email || w.emailId || `${id.toLowerCase()}@gift.edu.in`,
        attendance: isOnLeave ? 'On Leave (Relief on Duty)' : 'Present On Duty',
        leaveStatus: isOnLeave ? (activeApprovedLeave?.leaveType || 'On Leave') : 'Active',
        isOnLeave: isOnLeave,
        dutyStatus: isOnLeave ? 'On Leave' : 'On Duty',
        avatar: avatarPhoto,
        isWarden: true,
        notes: w.notes || ''
      };
    });

    // Support staff (caretakers, electricians, plumbers, cooks, security sergeants)
    // Filter out initial static wardens from mockHostelStaffList to avoid duplicates with dynamic wardens
    const supportStaff = mockHostelStaffList
      .filter(s => !s.id.startsWith('WRD') && s.id !== 'STF-101' && s.id !== 'STF-102' && s.id !== 'STF-103')
      .map(s => {
        // Check if an approved leave exists in staff leaves store for this support staff
        const activeApprovedLeave = leaves.find(l => {
          const matchesEmp = l.employeeId && l.employeeId === s.id;
          const matchesName = l.applicantName && (
            l.applicantName.toLowerCase() === s.name.toLowerCase() ||
            l.applicantName.toLowerCase().includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(l.applicantName.toLowerCase())
          );
          return (matchesEmp || matchesName) && l.status === 'Approved by Hostel Admin';
        });

        const isOnLeave = Boolean(activeApprovedLeave) || s.attendance.includes('Leave');

        return {
          ...s,
          isOnLeave: isOnLeave,
          attendance: isOnLeave ? 'On Leave (Relief on Duty)' : 'Present On Duty',
          dutyStatus: isOnLeave ? 'On Leave' : 'On Duty',
          isWarden: false
        };
      });

    // Combine wardens first, then support staff
    return [...wardenStaff, ...supportStaff];
  }, []);

  const [staffList, setStaffList] = useState(loadMergedStaffList);

  // Synchronize on mount and listen to universal events
  useEffect(() => {
    let isMounted = true;

    // Initial sync with backend
    const syncBackend = async () => {
      try {
        setIsSyncing(true);
        await Promise.allSettled([
          syncWardensFromBackend(),
          syncStaffLeavesFromBackend()
        ]);
        if (isMounted) {
          setStaffList(loadMergedStaffList());
        }
      } catch (err) {
        console.warn('HostelStaffSection backend sync:', err?.message || err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    syncBackend();

    // Universal reactive listeners
    const handleUpdate = () => {
      if (isMounted) {
        setStaffList(loadMergedStaffList());
      }
    };

    window.addEventListener('bput_wardens_updated', handleUpdate);
    window.addEventListener('bput_warden_created', handleUpdate);
    window.addEventListener('bput_warden_duty_changed', handleUpdate);
    window.addEventListener('hostel_staff_leave_updated', handleUpdate);
    window.addEventListener('hostel_avatar_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('bput_wardens_updated', handleUpdate);
      window.removeEventListener('bput_warden_created', handleUpdate);
      window.removeEventListener('bput_warden_duty_changed', handleUpdate);
      window.removeEventListener('hostel_staff_leave_updated', handleUpdate);
      window.removeEventListener('hostel_avatar_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadMergedStaffList]);

  // Filtered staff based on search query
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const query = searchQuery.toLowerCase().trim();
    return staffList.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.designation.toLowerCase().includes(query) ||
      s.hostel.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) ||
      (s.phone && s.phone.includes(query))
    );
  }, [staffList, searchQuery]);

  // Dynamic KPI stats
  const stats = useMemo(() => {
    const total = staffList.length;
    const onLeave = staffList.filter(s => s.isOnLeave).length;
    const onDuty = total - onLeave;
    const residentWardens = staffList.filter(s =>
      (s.isWarden || s.designation.toLowerCase().includes('warden')) &&
      (s.shift.toLowerCase().includes('resident') || s.shift.toLowerCase().includes('24x7') || s.shift.toLowerCase().includes('general'))
    ).length;

    return { total, onDuty, onLeave, residentWardens };
  }, [staffList]);

  // Toggle duty/leave status for any staff or warden
  const handleToggleDuty = (staff) => {
    const nextDutyStatus = staff.isOnLeave ? 'On Duty' : 'On Leave';

    if (staff.isWarden) {
      // 1. Update warden store & backend
      setWardenDutyStatus(staff.id, nextDutyStatus, `Roster action by ${account?.name || 'Administrator'}`);

      // 2. If marking on leave, register an approved leave application
      if (nextDutyStatus === 'On Leave') {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        applyStaffLeave({
          applicantName: staff.name,
          employeeId: staff.id,
          designation: staff.designation,
          department: 'Hostel Administration',
          leaveType: 'Casual Leave',
          startDate: today,
          endDate: tomorrow,
          days: 1,
          session: 'Full Day',
          reason: 'Official duty relief sanctioned via Hostel Staff & Warden Roster.',
          alternativeArrangement: 'Relief Warden / Caretaker assigned to residential roll-call supervision.',
          status: 'Approved by Hostel Admin',
          approvedBy: account?.name || 'Hostel Administrator'
        });
        showToast(`✓ ${staff.name} is now marked On Leave (Relief on Duty)`);
      } else {
        showToast(`✓ ${staff.name} is now marked Present On Duty`);
      }
    } else {
      // Support staff duty toggle
      if (nextDutyStatus === 'On Leave') {
        applyStaffLeave({
          applicantName: staff.name,
          employeeId: staff.id,
          designation: staff.designation,
          department: 'Hostel Support Staff',
          leaveType: 'Casual Leave',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          days: 1,
          reason: 'Authorized absence marked from duty roster.',
          status: 'Approved by Hostel Admin',
          approvedBy: account?.name || 'Hostel Administrator'
        });
        showToast(`✓ ${staff.name} marked On Leave (Relief on Duty)`);
      } else {
        // Reject or remove any approved leave for this support staff
        const leaves = getAllStaffLeaves();
        const activeLeave = leaves.find(l => (l.employeeId === staff.id || l.applicantName === staff.name) && l.status === 'Approved by Hostel Admin');
        if (activeLeave) {
          rejectStaffLeave(activeLeave.id, 'Duty resumed by staff member', account?.name || 'Hostel Administrator');
        }
        showToast(`✓ ${staff.name} marked Present On Duty`);
      }
    }

    setStaffList(loadMergedStaffList());
  };

  // Submit modal to record official leave
  const handleRecordLeaveSubmit = (e) => {
    e.preventDefault();
    const selectedStaff = staffList.find(s => s.id === leaveForm.staffId) || staffList[0];
    if (!selectedStaff) {
      showToast('⚠️ Please select a staff member or warden.');
      return;
    }

    const diffTime = Math.abs(new Date(leaveForm.endDate) - new Date(leaveForm.startDate));
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    applyStaffLeave({
      applicantName: selectedStaff.name,
      employeeId: selectedStaff.id,
      designation: selectedStaff.designation,
      department: selectedStaff.isWarden ? 'Hostel Administration' : 'Hostel Operations',
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: days,
      session: 'Full Day',
      reason: leaveForm.reason || 'Official sanctioned leave recorded from Staff Roster.',
      alternativeArrangement: leaveForm.alternativeArrangement || 'Designated relief caretaker on duty.',
      status: 'Approved by Hostel Admin',
      approvedBy: account?.name || 'Hostel Administrator'
    });

    if (selectedStaff.isWarden) {
      setWardenDutyStatus(selectedStaff.id, 'On Leave', leaveForm.reason);
    }

    setIsLeaveModalOpen(false);
    setStaffList(loadMergedStaffList());
    showToast(`✓ Sanctioned ${leaveForm.leaveType} for ${selectedStaff.name}. Status updated to On Leave!`);
  };

  // Manual refresh from backend
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.allSettled([
        syncWardensFromBackend(),
        syncStaffLeavesFromBackend()
      ]);
      setStaffList(loadMergedStaffList());
      showToast('✓ Successfully refreshed roster from backend database!');
    } catch (err) {
      showToast('Backend refresh completed with local sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper for avatar initials fallback
  const getInitials = (name) => {
    if (!name) return 'W';
    return name
      .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*/i, '')
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  return (
    <div className="hostel-section-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '11px 20px',
          borderRadius: '10px',
          fontSize: '0.86rem',
          fontWeight: 600,
          boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Users size={24} color="#2563eb" /> Hostel Staff &amp; Warden Duty Roster</h2>
          <p>Wardens · Caretakers · Security Sergeants · Housekeeping &amp; Kitchen Personnel</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            className="h-btn h-btn-secondary"
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Fetch live records from backend"
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Backend'}
          </button>
          <button
            className="h-btn h-btn-primary"
            onClick={() => {
              setLeaveForm({
                staffId: staffList[0]?.id || '',
                leaveType: 'Casual Leave',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                reason: '',
                alternativeArrangement: '',
                status: 'Approved by Hostel Admin'
              });
              setIsLeaveModalOpen(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#ffffff' }}
          >
            <Plus size={15} /> Record Staff Leave
          </button>
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            Print Duty Roster
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hostel-kpi-grid">
        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon blue"><Users size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value">{stats.total}</span>
            <span className="hostel-kpi-title">Total Staff</span>
            <span className="hostel-kpi-subtitle">Sanctioned Hostel Cadre</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon emerald"><UserCheck size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#059669' }}>{stats.onDuty}</span>
            <span className="hostel-kpi-title">Present On Duty</span>
            <span className="hostel-kpi-subtitle">Active across shifts</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon amber"><Clock size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#d97706' }}>{stats.onLeave}</span>
            <span className="hostel-kpi-title">On Authorized Leave</span>
            <span className="hostel-kpi-subtitle">Relief active</span>
          </div>
        </div>

        <div className="hostel-kpi-card">
          <div className="hostel-kpi-icon purple"><Shield size={22} /></div>
          <div className="hostel-kpi-info">
            <span className="hostel-kpi-value" style={{ color: '#7c3aed' }}>{stats.residentWardens}</span>
            <span className="hostel-kpi-title">24x7 Resident Wardens</span>
            <span className="hostel-kpi-subtitle">Campus Quarter In-House</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hostel-tab-pills">
        <button
          className={`hostel-tab-pill ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          Staff Directory ({filteredStaff.length})
        </button>
        <button
          className={`hostel-tab-pill ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Weekly Shift Schedule
        </button>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === 'directory' && (
        <>
          <div className="hostel-filter-strip">
            <div className="hostel-search-input">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search staff by name, designation, hostel, or Staff ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Official contact records protected under BPUT Staff Privacy Code
            </div>
          </div>

          <div className="hostel-cards-grid">
            {filteredStaff.map(staff => (
              <div key={staff.id} className="hostel-item-card" style={{
                transition: 'all 0.2s ease',
                borderLeft: staff.isOnLeave ? '4px solid #f59e0b' : '4px solid #10b981'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* Photo DP or Initials Avatar */}
                  {staff.avatar ? (
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #bfdbfe',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                      }}
                      onError={(e) => {
                        // Fallback to initials if image fails
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'grid';
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: staff.isOnLeave ? '#fef3c7' : '#eff6ff',
                      color: staff.isOnLeave ? '#b45309' : '#2563eb',
                      display: staff.avatar ? 'none' : 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      border: staff.isOnLeave ? '2px solid #fde68a' : '2px solid #bfdbfe',
                      flexShrink: 0
                    }}
                  >
                    {getInitials(staff.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {staff.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                      {staff.designation}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Staff ID: {staff.id}
                      {staff.isWarden && (
                        <span style={{
                          marginLeft: '6px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          background: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 700
                        }}>
                          WARDEN
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}>
                  <div><strong>Assigned Hostel:</strong> {staff.hostel}</div>
                  <div><strong>Duty Shift:</strong> {staff.shift}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={13} color="#2563eb" />
                    <strong>Official Phone:</strong> {staff.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={13} color="#2563eb" />
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{staff.email}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #f1f5f9',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {/* Status Badge: Amber for On Leave, Emerald for Present */}
                  {staff.isOnLeave ? (
                    <span
                      className="h-badge h-badge-late"
                      style={{
                        background: '#fffbeb',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px'
                      }}
                    >
                      <Clock size={12} color="#b45309" />
                      On Leave (Relief on Duty)
                    </span>
                  ) : (
                    <span
                      className="h-badge h-badge-approved"
                      style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px'
                      }}
                    >
                      <CheckCircle2 size={12} color="#059669" />
                      Present On Duty
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {/* Action to switch Duty / Leave */}
                    <button
                      className="h-btn h-btn-secondary"
                      style={{
                        padding: '3px 7px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: staff.isOnLeave ? '#ecfdf5' : '#fffbeb',
                        color: staff.isOnLeave ? '#059669' : '#b45309',
                        borderColor: staff.isOnLeave ? '#a7f3d0' : '#fde68a'
                      }}
                      title={staff.isOnLeave ? 'Resume active hostel duty' : 'Mark on official leave'}
                      onClick={() => handleToggleDuty(staff)}
                    >
                      {staff.isOnLeave ? 'Resume Duty' : 'Mark Leave'}
                    </button>

                    <button
                      className="h-btn h-btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(staff.phone);
                        }
                        showToast(`Official phone ${staff.phone} for ${staff.name} copied!`);
                      }}
                    >
                      Quick Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TAB 2: ROSTER */}
      {activeTab === 'roster' && (
        <div className="hostel-table-container">
          <div className="hostel-table-scroll">
            <table className="hostel-data-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Designation</th>
                  <th>Hostel Station</th>
                  <th>Mon - Wed</th>
                  <th>Thu - Sat</th>
                  <th>Sunday Roster</th>
                  <th>Duty / Leave Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(st => (
                  <tr key={st.id} style={{ background: st.isOnLeave ? '#fffbeb15' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {st.avatar ? (
                          <img
                            src={st.avatar}
                            alt={st.name}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}>
                            {getInitials(st.name)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{st.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="h-badge h-badge-medium">{st.designation}</span></td>
                    <td>{st.hostel}</td>
                    <td style={{ fontSize: '0.82rem' }}>{st.shift}</td>
                    <td style={{ fontSize: '0.82rem' }}>{st.shift}</td>
                    <td style={{
                      fontSize: '0.82rem',
                      color: st.isOnLeave ? '#d97706' : '#059669',
                      fontWeight: 700
                    }}>
                      {st.isOnLeave ? 'Relief On Duty' : 'Regular Shift'}
                    </td>
                    <td>
                      <span className={`h-badge ${st.isOnLeave ? 'h-badge-late' : 'h-badge-approved'}`}>
                        {st.attendance}
                      </span>
                    </td>
                    <td>
                      <button
                        className="h-btn h-btn-secondary"
                        style={{ padding: '2px 7px', fontSize: '0.72rem', fontWeight: 600 }}
                        onClick={() => handleToggleDuty(st)}
                      >
                        {st.isOnLeave ? 'Resume' : 'Leave'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: RECORD STAFF LEAVE */}
      {isLeaveModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              padding: '1.2rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Record Staff / Warden Leave</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#bfdbfe' }}>
                  Update duty status &amp; relief coverage across hostel operations
                </p>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordLeaveSubmit} style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Select Staff Member / Warden *
                </label>
                <select
                  value={leaveForm.staffId}
                  onChange={e => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                  required
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation}) — {s.hostel}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Leave Type
                  </label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option>Casual Leave</option>
                    <option>Earned Leave</option>
                    <option>Special Leave</option>
                    <option>Sick Leave</option>
                    <option>Compensatory Leave</option>
                    <option>On-Duty (OD)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Approval Status
                  </label>
                  <input
                    type="text"
                    value="Approved by Hostel Admin"
                    readOnly
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      color: '#059669',
                      fontWeight: 700
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Reason for Absence
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent domestic obligation, medical appointment, outstation..."
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Alternative Relief Arrangement
                </label>
                <input
                  type="text"
                  placeholder="e.g. Caretaker / Senior Warden to supervise night roll call..."
                  value={leaveForm.alternativeArrangement}
                  onChange={e => setLeaveForm({ ...leaveForm, alternativeArrangement: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.8rem' }}>
                <button
                  type="button"
                  className="h-btn h-btn-secondary"
                  onClick={() => setIsLeaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-btn h-btn-primary"
                  style={{ background: '#2563eb', color: '#ffffff' }}
                >
                  Sanction &amp; Mark On Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
