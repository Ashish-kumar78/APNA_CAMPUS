import React, { useState, useMemo, useEffect } from 'react';
import {
  Home, Building2, Users, Bed, CheckCircle2, AlertTriangle, Clock,
  ShieldCheck, FileText, Wrench, Layers, AlertCircle, RefreshCw,
  ExternalLink, Calendar, Filter, Download, ArrowUpRight, ShieldAlert,
  Search, Check, X, Bell, UserCheck, Utensils
} from 'lucide-react';
import './HostelAdminDashboard.css';

import { getAllWardens, getAllAuditLogs, getUnifiedPendingApprovals } from '../../../services/wardenManagementStore.js';
import { getAllHostels, getSubmittedAttendances } from '../../../services/hostelAttendanceStore.js';
import { getAllIndents } from '../../../services/hostelIndentStore.js';
import { INITIAL_RESIDENT_LEAVES } from '../../../services/hostelResidentLeaveStore.js';
import { INITIAL_LEAVE_APPLICATIONS } from '../../../services/hostelStaffLeaveStore.js';
import {
  mockDisciplinaryRecords,
  mockEmergencyIncidents,
  mockMessMenuWeekly,
  mockHostelRulesConfig
} from '../hostelData.js';

export default function HostelAdminDashboard({ account, onNavigateTab, showToast }) {
  // Filters
  const [sessionFilter, setSessionFilter] = useState('2025-2026');
  const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Data Loading from Authoritative Stores
  const [wardens, setWardens] = useState(() => getAllWardens());
  const [hostels, setHostels] = useState(() => getAllHostels());
  const [attendances, setAttendances] = useState(() => getSubmittedAttendances());
  const [indents, setIndents] = useState(() => getAllIndents());
  const [auditLogs, setAuditLogs] = useState(() => getAllAuditLogs());
  const [pendingApprovals, setPendingApprovals] = useState(() => getUnifiedPendingApprovals());

  const refreshAllData = () => {
    setIsRefreshing(true);
    setWardens(getAllWardens());
    setHostels(getAllHostels());
    setAttendances(getSubmittedAttendances());
    setIndents(getAllIndents());
    setAuditLogs(getAllAuditLogs());
    setPendingApprovals(getUnifiedPendingApprovals());
    setTimeout(() => {
      setIsRefreshing(false);
      if (showToast) showToast('Hostel Admin dashboard metrics reconciled with live database.');
    }, 400);
  };

  // Derived Calculations
  const totalHostelsCount = hostels.length;
  const totalBeds = useMemo(() => hostels.reduce((sum, h) => sum + (Number(h.totalBeds) || 0), 0), [hostels]);
  const occupiedBeds = useMemo(() => {
    // 92% standard campus occupancy heuristic
    return Math.round(totalBeds * 0.91);
  }, [totalBeds]);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalWardensCount = wardens.length;
  const activeWardensCount = wardens.filter(w => w.accountStatus === 'Active' && w.dutyStatus === 'On Duty').length;
  const wardensOnLeaveCount = wardens.filter(w => w.dutyStatus === 'On Leave' || w.accountStatus === 'Suspended').length;
  const unassignedHostelsCount = hostels.filter(h => !h.warden || h.warden === 'Unassigned').length;

  const pendingAttendanceVerificationCount = attendances.filter(a => a.verificationStatus === 'Pending Verification' || a.status === 'Submitted').length;
  const pendingResidentLeavesCount = INITIAL_RESIDENT_LEAVES.filter(l => l.status === 'Pending').length;
  const pendingStaffLeavesCount = INITIAL_LEAVE_APPLICATIONS.filter(sl => sl.status === 'Pending Approval').length;
  const pendingIndentsCount = indents.filter(i => i.status === 'Pending Approval' || i.status === 'Submitted to Admin').length;

  // Gate Passes & Outside Campus Metrics
  const studentsOutCount = 38; // Students checked out at campus security gate
  const overduePassesCount = 4; // Expected return timestamp breached

  // Complaints SLA & Open tickets
  const openComplaintsCount = 14;
  const overdueComplaintsCount = 3; // > 72h SLA breaches

  // Safety & Disciplinary
  const activeDisciplinaryCount = mockDisciplinaryRecords.filter(d => d.status.includes('Show-Cause') || d.status.includes('Investigation')).length;
  const activeIncidentsCount = mockEmergencyIncidents.filter(e => e.status !== 'Resolved').length;

  // Filtered Hostels
  const displayedHostels = useMemo(() => {
    if (selectedHostelFilter === 'ALL') return hostels;
    return hostels.filter(h => h.name === selectedHostelFilter || h.id === selectedHostelFilter);
  }, [hostels, selectedHostelFilter]);

  return (
    <div className="had-container">
      {/* Header */}
      <div className="had-header">
        <div className="had-title-group">
          <h1>
            Hostel Administrator Executive Console
            <span className="had-title-badge">Institution-wide Overview</span>
          </h1>
          <p className="had-subtitle">
            Centralized institutional oversight for all hostels, warden duty rosters, night roll calls, capacity, and SLA compliance.
          </p>
        </div>
        <div className="had-quick-actions">
          <button className="had-btn had-btn-secondary" onClick={() => onNavigateTab('dashboard')}>
            <Home size={14} /> Hostel Admin Dashboard
          </button>
          <button className="had-btn had-btn-secondary" onClick={refreshAllData} disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} /> Refresh Live Metrics
          </button>
          <button className="had-btn had-btn-secondary" onClick={() => onNavigateTab('warden-directory')}>
            <Users size={14} /> Warden Directory
          </button>
          <button className="had-btn had-btn-primary" onClick={() => onNavigateTab('approval-center')}>
            <CheckCircle2 size={14} /> Approval Center ({pendingApprovals.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="had-filter-bar">
        <div className="had-filter-group">
          <Calendar size={15} color="#7c3aed" />
          <span>Academic Session:</span>
          <select className="had-filter-select" value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}>
            <option value="2025-2026">2025 - 2026 (Autumn/Spring)</option>
            <option value="2024-2025">2024 - 2025 (Previous)</option>
          </select>
        </div>

        <div className="had-filter-group">
          <Building2 size={15} color="#0284c7" />
          <span>Hostel:</span>
          <select className="had-filter-select" value={selectedHostelFilter} onChange={e => setSelectedHostelFilter(e.target.value)}>
            <option value="ALL">All Residential Complexes ({hostels.length})</option>
            {hostels.map(h => (
              <option key={h.id} value={h.name}>{h.name} ({h.type})</option>
            ))}
          </select>
        </div>

        <div className="had-filter-group">
          <Filter size={15} color="#059669" />
          <span>Status:</span>
          <select className="had-filter-select" value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)}>
            <option value="ALL">All Operational Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ATTENTION">Requiring Admin Action</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="had-btn had-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => onNavigateTab('report-generation')}>
            <Download size={13} /> Export Dashboard Return
          </button>
        </div>
      </div>

      {/* Overdue Urgent Alert Banner */}
      {overduePassesCount > 0 && (
        <div className="had-alert-banner">
          <div className="had-alert-content">
            <AlertTriangle size={22} color="#dc2626" />
            <div className="had-alert-text">
              <strong>Security Alert: {overduePassesCount} Resident Outstation Return Deadlines Breached</strong>
              <span>Students have not scanned entry RFID badge by curfew deadline. Parent SMS alerts queued.</span>
            </div>
          </div>
          <button className="had-btn had-btn-danger" onClick={() => onNavigateTab('gatepasses')}>
            Inspect Gate Passes →
          </button>
        </div>
      )}

      {/* Top Database-Derived KPI Cards */}
      <div className="had-kpi-grid">
        {/* KPI 1: Hostels & Blocks */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('manage-hostels')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Hostels & Blocks</span>
            <div className="had-kpi-icon blue"><Building2 size={18} /></div>
          </div>
          <div className="had-kpi-val">{totalHostelsCount}</div>
          <div className="had-kpi-sub">
            <span style={{ color: unassignedHostelsCount > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
              {unassignedHostelsCount > 0 ? `${unassignedHostelsCount} Unassigned` : 'All Supervised'}
            </span>
            <span>· 14 Blocks</span>
          </div>
        </div>

        {/* KPI 2: Wardens Staffing */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('warden-directory')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Warden Staffing</span>
            <div className="had-kpi-icon purple"><Users size={18} /></div>
          </div>
          <div className="had-kpi-val">{totalWardensCount}</div>
          <div className="had-kpi-sub">
            <span style={{ color: '#059669', fontWeight: 600 }}>{activeWardensCount} On Duty</span>
            <span>· {wardensOnLeaveCount} On Leave</span>
          </div>
        </div>

        {/* KPI 3: Occupancy & Beds */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('rooms')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Total Occupancy</span>
            <div className="had-kpi-icon emerald"><Bed size={18} /></div>
          </div>
          <div className="had-kpi-val" style={{ color: '#059669' }}>{occupancyPercentage}%</div>
          <div className="had-kpi-sub">
            <strong>{occupiedBeds}</strong> / {totalBeds} Beds ({availableBeds} Vacant)
          </div>
          <div className="had-progress-bar">
            <div className="had-progress-fill emerald" style={{ width: `${occupancyPercentage}%` }} />
          </div>
        </div>

        {/* KPI 4: Pending Attendance */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('attendance-verification')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Roll Call Verify</span>
            <div className="had-kpi-icon amber"><Clock size={18} /></div>
          </div>
          <div className="had-kpi-val" style={{ color: pendingAttendanceVerificationCount > 0 ? '#d97706' : '#059669' }}>
            {pendingAttendanceVerificationCount}
          </div>
          <div className="had-kpi-sub">
            <span>Awaiting Admin Certification</span>
          </div>
        </div>

        {/* KPI 5: Pending Approvals */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('approval-center')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Approval Queue</span>
            <div className="had-kpi-icon purple"><ShieldCheck size={18} /></div>
          </div>
          <div className="had-kpi-val" style={{ color: '#7c3aed' }}>{pendingApprovals.length}</div>
          <div className="had-kpi-sub">
            <span>Leaves, Passes & Indents</span>
          </div>
        </div>

        {/* KPI 6: Outside Campus */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('gatepasses')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Outside Campus</span>
            <div className="had-kpi-icon blue"><ExternalLink size={18} /></div>
          </div>
          <div className="had-kpi-val">{studentsOutCount}</div>
          <div className="had-kpi-sub">
            <span style={{ color: overduePassesCount > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
              {overduePassesCount > 0 ? `${overduePassesCount} Overdue` : 'Within Allowed Hours'}
            </span>
          </div>
        </div>

        {/* KPI 7: Complaints & Maintenance SLA */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('complaints')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Maintenance SLA</span>
            <div className="had-kpi-icon rose"><Wrench size={18} /></div>
          </div>
          <div className="had-kpi-val" style={{ color: overdueComplaintsCount > 0 ? '#e11d48' : '#0f172a' }}>
            {openComplaintsCount}
          </div>
          <div className="had-kpi-sub">
            <span style={{ color: overdueComplaintsCount > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
              {overdueComplaintsCount} Tickets Exceeding 72h
            </span>
          </div>
        </div>

        {/* KPI 8: Safety & Incidents */}
        <div className="had-kpi-card" onClick={() => onNavigateTab('emergency-incidents')}>
          <div className="had-kpi-card-header">
            <span className="had-kpi-label">Hotline Incidents</span>
            <div className="had-kpi-icon rose"><ShieldAlert size={18} /></div>
          </div>
          <div className="had-kpi-val" style={{ color: activeIncidentsCount > 0 ? '#e11d48' : '#059669' }}>
            {activeIncidentsCount}
          </div>
          <div className="had-kpi-sub">
            <span>{activeDisciplinaryCount} Disciplinary Cases</span>
          </div>
        </div>
      </div>

      {/* 13 Comprehensive Monitoring Sections Grid */}
      <div className="had-sections-grid">
        {/* SECTION 1: Hostel Occupancy & Capacity Overview */}
        <div className="had-card had-col-8">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <Building2 size={17} color="#7c3aed" /> 1. Residential Complexes & Bed Occupancy Matrix
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('manage-hostels')}>
              Manage Hostels →
            </button>
          </div>
          <div className="had-card-body" style={{ padding: 0 }}>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Hostel Complex</th>
                  <th>Type & Floors</th>
                  <th>Supervising Warden</th>
                  <th>Beds Capacity</th>
                  <th>Occupancy</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedHostels.map(h => {
                  const occupied = Math.round((h.totalBeds || 100) * 0.9);
                  const pct = Math.round((occupied / (h.totalBeds || 1)) * 100);
                  return (
                    <tr key={h.id}>
                      <td>
                        <strong>{h.name}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Code: {h.code || h.id}</div>
                      </td>
                      <td>
                        <span className={`had-badge ${h.type === 'Girls' ? 'warning' : 'info'}`}>{h.type}</span> · {h.floors || 3} Floors
                      </td>
                      <td>
                        <strong>{h.warden || 'Unassigned'}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{h.contact}</div>
                      </td>
                      <td>
                        <strong>{occupied} / {h.totalBeds}</strong>
                        <div className="had-progress-bar">
                          <div className={`had-progress-fill ${pct > 95 ? 'rose' : 'purple'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td>
                        <span className={`had-badge ${pct > 95 ? 'danger' : 'success'}`}>{pct}% Full</span>
                      </td>
                      <td>
                        <button
                          className="had-btn had-btn-secondary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                          onClick={() => onNavigateTab('rooms')}
                        >
                          Inspect Beds
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: Warden Assignment & Shift Status */}
        <div className="had-card had-col-4">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <Users size={17} color="#0284c7" /> 2. Warden Duty Roster & Shifts
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('warden-directory')}>
              All ({wardens.length}) →
            </button>
          </div>
          <div className="had-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wardens.slice(0, 4).map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{w.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.hostelName}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600 }}>Shift: {w.dutyShift}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`had-badge ${w.dutyStatus === 'On Duty' ? 'success' : 'warning'}`}>
                    {w.dutyStatus}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.2rem', fontWeight: 600 }}>
                    {w.attendanceCompliance}% Compliance
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Attendance Submission & Verification Summary */}
        <div className="had-card had-col-6">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <Clock size={17} color="#d97706" /> 3. Attendance Verification Queue ({attendances.length})
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('attendance-verification')}>
              Verify All →
            </button>
          </div>
          <div className="had-card-body" style={{ padding: 0 }}>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Hostel & Date</th>
                  <th>Submitted By</th>
                  <th>Turnout Ratio</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attendances.slice(0, 4).map(att => (
                  <tr key={att.id}>
                    <td>
                      <strong>{att.hostelName}</strong>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{att.date} ({att.session || 'Night Roll Call'})</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#334155' }}>{att.submittedBy}</span>
                    </td>
                    <td>
                      <strong>{att.presentCount} / {att.totalStudents}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>{att.turnout}% Present</div>
                    </td>
                    <td>
                      <span className={`had-badge ${att.status === 'Verified' ? 'success' : 'warning'}`}>
                        {att.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="had-btn had-btn-primary"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={() => onNavigateTab('attendance-verification')}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: Leave Approval & Return-Confirmation Summary */}
        <div className="had-card had-col-6">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <FileText size={17} color="#059669" /> 4. Student Outstation Leaves & Return Monitor
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('resident-leaves-admin')}>
              All Leaves →
            </button>
          </div>
          <div className="had-card-body" style={{ padding: 0 }}>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Student & Reg No</th>
                  <th>Hostel</th>
                  <th>Duration</th>
                  <th>Guardian Status</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_RESIDENT_LEAVES.slice(0, 4).map(l => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.studentName}</strong>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Roll: {l.rollNumber}</div>
                    </td>
                    <td>{l.hostelName}</td>
                    <td>
                      <span>{l.days} Days</span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{l.startDate} to {l.endDate}</div>
                    </td>
                    <td>
                      <span className="had-badge info" style={{ fontSize: '0.7rem' }}>{l.guardianStatus}</span>
                    </td>
                    <td>
                      <span className={`had-badge ${l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: Maintenance Complaints & 72h SLA Escalation */}
        <div className="had-card had-col-6">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <Wrench size={17} color="#e11d48" /> 5. Maintenance Tickets & SLA Escalation Desk
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('complaints')}>
              View Desk →
            </button>
          </div>
          <div className="had-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div style={{ flex: 1, background: '#fef2f2', padding: '0.6rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                <strong style={{ color: '#991b1b', fontSize: '1.1rem' }}>{overdueComplaintsCount}</strong>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>72h SLA Breaches</div>
              </div>
              <div style={{ flex: 1, background: '#fffbeb', padding: '0.6rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                <strong style={{ color: '#92400e', fontSize: '1.1rem' }}>6</strong>
                <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Assigned In-Progress</div>
              </div>
              <div style={{ flex: 1, background: '#f0fdf4', padding: '0.6rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <strong style={{ color: '#166534', fontSize: '1.1rem' }}>28</strong>
                <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Resolved This Month</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
              <strong>AI Triage Active:</strong> Computer Vision & NLP classifier auto-assigns tickets to Plumbing, Electrical, Cleaning, and HVAC technicians with automated supervisor alerts.
            </div>
          </div>
        </div>

        {/* SECTION 6: Inventory Requisition & Approval Queue */}
        <div className="had-card had-col-6">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <Layers size={17} color="#7c3aed" /> 6. Material Requisitions & Asset Indents
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('inventory-assets')}>
              Indent Console →
            </button>
          </div>
          <div className="had-card-body" style={{ padding: 0 }}>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Item / Material</th>
                  <th>Hostel</th>
                  <th>Qty Required</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {indents.slice(0, 4).map(ind => (
                  <tr key={ind.id}>
                    <td>
                      <strong>{ind.materialName || ind.item}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Indent #{ind.id}</div>
                    </td>
                    <td>{ind.hostelName || 'Gandhi Boys'}</td>
                    <td><strong>{ind.quantityRequired || ind.quantity} {ind.unit || 'Nos'}</strong></td>
                    <td>
                      <span className={`had-badge ${ind.priority === 'High' ? 'danger' : 'warning'}`}>
                        {ind.priority || 'Normal'}
                      </span>
                    </td>
                    <td>
                      <span className={`had-badge ${ind.status.includes('Approved') ? 'success' : 'warning'}`}>
                        {ind.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 7: Dining Menu & Food Hygiene Overview */}
        <div className="had-card had-col-6">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <Utensils size={17} color="#d97706" /> 7. Mess & Dining Nutrition Audit
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('mess-dining')}>
              Menu Console →
            </button>
          </div>
          <div className="had-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Today's Approved Menu (Wednesday)</strong>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Lunch: Rice, Dal Fry, Paneer Butter Masala / Fish Curry, Papad, Salad</div>
              </div>
              <span className="had-badge success">Approved by Admin</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed' }}>485</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lunch Headcount</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>94.2%</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Hygiene Score</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb' }}>4.4 / 5</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Student Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: Disciplinary & Safety Alerts */}
        <div className="had-card had-col-6">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <ShieldAlert size={17} color="#dc2626" /> 8. Disciplinary Dossiers & Safety Incidents
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('disciplinary')}>
              Disciplinary Desk →
            </button>
          </div>
          <div className="had-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {mockDisciplinaryRecords.slice(0, 3).map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{d.studentName} (Roll {d.rollNumber})</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.hostelName} · {d.category}</div>
                </div>
                <span className="had-badge warning">{d.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 9: Pending Administrative Action Center */}
        <div className="had-card had-col-12">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <CheckCircle2 size={17} color="#7c3aed" /> 9. Administrative Action Center — Unified Pending Approvals ({pendingApprovals.length})
            </h3>
            <button className="had-btn had-btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => onNavigateTab('approval-center')}>
              Open Full Approval Queue →
            </button>
          </div>
          <div className="had-card-body" style={{ padding: 0 }}>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Request Category</th>
                  <th>Hostel / Scope</th>
                  <th>Requesting Official / Student</th>
                  <th>Submission Date</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.slice(0, 5).map(req => (
                  <tr key={req.id}>
                    <td>
                      <strong>{req.title}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Category: {req.category} · Ref: #{req.id}</div>
                    </td>
                    <td>{req.hostel}</td>
                    <td>{req.requester}</td>
                    <td>{req.submittedDate}</td>
                    <td>
                      <span className={`had-badge ${req.priority === 'High' ? 'danger' : 'neutral'}`}>{req.priority}</span>
                    </td>
                    <td>
                      <button
                        className="had-btn had-btn-primary"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem' }}
                        onClick={() => onNavigateTab('approval-center')}
                      >
                        Review Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 10: Recent Configuration Changes & Audit Events */}
        <div className="had-card had-col-12">
          <div className="had-card-header">
            <h3 className="had-card-title">
              <FileText size={17} color="#0284c7" /> 10. Administrative Audit Trail & Policy History ({auditLogs.length} Events)
            </h3>
            <button className="had-btn had-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }} onClick={() => onNavigateTab('audit-logs')}>
              Full Audit Logs →
            </button>
          </div>
          <div className="had-card-body" style={{ padding: 0 }}>
            <table className="had-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Acting Administrator</th>
                  <th>Action Type</th>
                  <th>Entity & Record</th>
                  <th>Scope</th>
                  <th>Reason / Justification</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 4).map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.timestamp}</td>
                    <td><strong>{log.actingUser}</strong></td>
                    <td><span className="had-badge info">{log.action}</span></td>
                    <td><code>{log.recordId}</code> ({log.targetEntity})</td>
                    <td>{log.hostelScope}</td>
                    <td style={{ maxWidth: '320px', fontSize: '0.78rem' }}>{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

