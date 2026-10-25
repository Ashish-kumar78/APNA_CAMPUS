import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  AlertOctagon,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  X,
  Flame,
  Zap,
  Activity
} from 'lucide-react';
import { labStaffStore } from '../../services/labStaffStore.js';
import { BRANCHES_CONFIG } from './labStaffData.js';

export default function MaintenanceSafetyTab({
  subTab = 'work-orders',
  currentBranch,
  activeLabId,
  profile,
  maintenanceOrders = [],
  preventiveSchedule = [],
  safetyInspections = [],
  equipment = [],
  onSuccessToast,
  onOpenQuickAction
}) {
  const [activeSubTab, setActiveSubTab] = useState(subTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState('Central Engineering Services');

  // Incident log state
  const [incidentLogs, setIncidentLogs] = useState([
    {
      id: 'INC-2026-08',
      date: '2026-10-14',
      labId: 'CSE-LAB-02',
      type: 'Electrical Spark / Loose Neutral in Rack 02',
      severity: 'Medium',
      reportedBy: 'Mr. Biswajit Sahoo',
      rootCause: 'Vibration-induced terminal loosening on 16A industrial socket.',
      correctiveAction: 'Re-crimped ring lug, torqued terminal to 2.5 Nm, tested load with thermal camera.',
      status: 'Closed'
    },
    {
      id: 'INC-2026-07',
      date: '2026-09-28',
      labId: 'CHEM-SCI-01',
      type: 'Minor Dilute Acid Splash on Bench Worktop',
      severity: 'Low',
      reportedBy: 'Mr. Chittaranjan Das',
      rootCause: 'Reagent beaker tipped while measuring 0.1M HCl.',
      correctiveAction: 'Neutralized with sodium bicarbonate powder. No skin contact or injury. PPE worn.',
      status: 'Closed'
    }
  ]);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'Equipment Tripping Breaker',
    severity: 'Medium',
    rootCause: '',
    correctiveAction: ''
  });

  const branchTickets = maintenanceOrders.filter(m => m.department === currentBranch);
  const filteredTickets = branchTickets.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPri = filterPriority === 'ALL' || t.priority === filterPriority;
    const matchesStat = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesPri && matchesStat;
  });

  const branchPMS = preventiveSchedule.filter(p => p.department === currentBranch);
  const branchSafety = safetyInspections.filter(s => s.department === currentBranch);
  const latestInspection = branchSafety[0] || null;

  const handleResolveTicket = () => {
    if (!resolvingTicket) return;
    labStaffStore.updateMaintenanceOrder(resolvingTicket.id, {
      status: 'Resolved',
      resolutionNotes: resolutionInput || 'Resolved and verified by laboratory technician.'
    });
    onSuccessToast?.(`Work order #${resolvingTicket.id} marked as Resolved!`);
    setResolvingTicket(null);
    setResolutionInput('');
  };

  const handleAssignTechnician = () => {
    if (!assigningTicket) return;
    labStaffStore.updateMaintenanceOrder(assigningTicket.id, {
      status: 'Assigned',
      assignedTechnician: selectedTechnician
    });
    onSuccessToast?.(`Technician "${selectedTechnician}" assigned to ticket #${assigningTicket.id}!`);
    setAssigningTicket(null);
  };

  const handleCreateIncident = (e) => {
    e.preventDefault();
    const created = {
      id: `INC-2026-${String(incidentLogs.length + 9).padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      labId: activeLabId,
      type: newIncident.type,
      severity: newIncident.severity,
      reportedBy: profile.name,
      rootCause: newIncident.rootCause || 'Under investigation',
      correctiveAction: newIncident.correctiveAction || 'Immediate perimeter safety isolation',
      status: 'Action In-Progress'
    };
    setIncidentLogs([created, ...incidentLogs]);
    setShowIncidentModal(false);
    onSuccessToast?.(`Incident #${created.id} logged in central safety register!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('work-orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'work-orders' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'work-orders' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'work-orders' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Wrench size={16} /> Maintenance Work Orders ({branchTickets.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('preventive')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'preventive' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'preventive' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'preventive' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Calendar size={16} /> Preventive Maintenance ({branchPMS.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('safety-compliance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'safety-compliance' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'safety-compliance' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'safety-compliance' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={16} /> Safety &amp; Compliance Audit
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('incidents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: activeSubTab === 'incidents' ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSubTab === 'incidents' ? '#eff6ff' : '#ffffff',
            color: activeSubTab === 'incidents' ? '#2563eb' : '#475569',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <AlertOctagon size={16} /> Incident &amp; Breakdown Log ({incidentLogs.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MAINTENANCE WORK ORDERS */}
      {/* ========================================================================= */}
      {activeSubTab === 'work-orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action and Filter Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search ticket #, asset, or issue description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.86rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <button
                type="button"
                onClick={() => onOpenQuickAction?.('raise-maintenance')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Raise Work Order
              </button>
            </div>
          </div>

          {/* Tickets Table */}
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
                    <th style={{ padding: '12px 14px' }}>Ticket ID</th>
                    <th style={{ padding: '12px 14px' }}>Asset / Equipment</th>
                    <th style={{ padding: '12px 14px' }}>Issue Description</th>
                    <th style={{ padding: '12px 14px' }}>Priority</th>
                    <th style={{ padding: '12px 14px' }}>Technician</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t, idx) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                        {t.id}
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.reportedDate}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.assetName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Lab: {t.labName}</div>
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                        <div style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600 }}>{t.description}</div>
                        {t.resolutionNotes && (
                          <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '2px' }}>
                            ✓ Notes: {t.resolutionNotes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: t.priority === 'Critical' ? '#fee2e2' : (t.priority === 'High' ? '#ffedd5' : '#f1f5f9'),
                          color: t.priority === 'Critical' ? '#b91c1c' : (t.priority === 'High' ? '#c2410c' : '#475569')
                        }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#334155' }}>
                        {t.assignedTechnician || 'Unassigned'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: t.status === 'Resolved' ? '#dcfce7' : (t.status === 'In Progress' ? '#e0f2fe' : '#fef3c7'),
                          color: t.status === 'Resolved' ? '#15803d' : (t.status === 'In Progress' ? '#0369a1' : '#b45309')
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {t.status !== 'Resolved' && t.status !== 'Closed' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setAssigningTicket(t)}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Assign
                              </button>
                              <button
                                type="button"
                                onClick={() => setResolvingTicket(t)}
                                style={{
                                  background: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Resolve
                              </button>
                            </>
                          )}
                          {(t.status === 'Resolved' || t.status === 'Closed') && (
                            <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                              ✓ Completed
                            </span>
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
      {/* 2. PREVENTIVE MAINTENANCE */}
      {/* ========================================================================= */}
      {activeSubTab === 'preventive' && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            Preventive Maintenance &amp; Annual Maintenance Contracts (AMC)
          </h3>
          <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#64748b' }}>
            Scheduled routine inspections, filter renewals, UPS battery checks, and calibration cycles.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {branchPMS.map(pms => (
              <div
                key={pms.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563eb' }}>{pms.id} · {pms.frequency}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: pms.status === 'Scheduled' ? '#e0f2fe' : '#fef3c7',
                    color: pms.status === 'Scheduled' ? '#0369a1' : '#b45309'
                  }}>
                    {pms.status}
                  </span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    {pms.equipmentName}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
                    {pms.serviceType}
                  </p>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', fontSize: '0.78rem' }}>
                  <div style={{ color: '#64748b' }}>Contracted Vendor: <strong>{pms.vendor}</strong></div>
                  <div style={{ color: '#0f172a', marginTop: '2px' }}>Next Service Due: <strong style={{ color: '#2563eb' }}>{pms.nextScheduled}</strong></div>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                  <strong>Checklist:</strong> {pms.checklist.join(' · ')}
                </div>

                <button
                  type="button"
                  onClick={() => onSuccessToast?.(`Service order verified for ${pms.equipmentName}!`)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: 'auto'
                  }}
                >
                  Confirm Pre-Service Readiness
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SAFETY & COMPLIANCE AUDIT */}
      {/* ========================================================================= */}
      {activeSubTab === 'safety-compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Critical Compliance Banner */}
          <div style={{
            background: latestInspection && latestInspection.overallStatus === 'Compliant' ? '#f0fdf4' : '#fff7ed',
            border: latestInspection && latestInspection.overallStatus === 'Compliant' ? '1px solid #bbf7d0' : '1px solid #fed7aa',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={32} color={latestInspection && latestInspection.overallStatus === 'Compliant' ? '#16a34a' : '#d97706'} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Overall Safety Status: {latestInspection?.overallStatus || 'Compliant'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>
                  Score: <strong>{latestInspection?.score || 95}%</strong> · Verified on {latestInspection?.date || 'Today'} by {latestInspection?.inspectorName || profile.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenQuickAction?.('safety-checklist')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Run Audit Checklist
            </button>
          </div>

          {/* Inspection Records List */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
              Inspection History &amp; Findings
            </h4>

            {branchSafety.map(insp => (
              <div
                key={insp.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#f8fafc',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                    {insp.id} · {insp.labId} ({insp.date})
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: insp.overallStatus === 'Compliant' ? '#dcfce7' : '#fee2e2',
                    color: insp.overallStatus === 'Compliant' ? '#15803d' : '#b91c1c'
                  }}>
                    {insp.overallStatus} ({insp.score}%)
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '6px' }}>
                  <strong>Findings:</strong> {insp.findings}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>
                  <strong>Corrective Action Plan:</strong> {insp.correctiveAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INCIDENT & BREAKDOWN REGISTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'incidents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Incident, Spill &amp; Electrical Breakdown Register
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Statutory audit log of laboratory mishaps, near-misses, root cause analysis, and corrective actions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIncidentModal(true)}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={15} /> Log Incident
            </button>
          </div>

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
                    <th style={{ padding: '12px 14px' }}>Incident ID &amp; Date</th>
                    <th style={{ padding: '12px 14px' }}>Lab Location</th>
                    <th style={{ padding: '12px 14px' }}>Incident Nature</th>
                    <th style={{ padding: '12px 14px' }}>Severity</th>
                    <th style={{ padding: '12px 14px' }}>Root Cause</th>
                    <th style={{ padding: '12px 14px' }}>Corrective Action</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentLogs.map(inc => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                        {inc.id}
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{inc.date}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{inc.labId}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#b91c1c' }}>{inc.type}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: inc.severity === 'High' ? '#fee2e2' : '#fef3c7',
                          color: inc.severity === 'High' ? '#b91c1c' : '#b45309'
                        }}>
                          {inc.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#475569' }}>{inc.rootCause}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#16a34a' }}>{inc.correctiveAction}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                          ✓ {inc.status}
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

      {/* Resolve Ticket Modal */}
      {resolvingTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '480px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0b1830', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Resolve Work Order #{resolvingTicket.id}</h3>
              <button type="button" onClick={() => setResolvingTicket(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.82rem' }}>
                <div><strong>Asset:</strong> {resolvingTicket.assetName}</div>
                <div><strong>Reported Fault:</strong> {resolvingTicket.description}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Resolution Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the component replacement, test parameters, and sign-off..."
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResolveTicket}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✓ Mark Resolved &amp; Close Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {assigningTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0b1830', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Assign Technician to #{assigningTicket.id}</h3>
              <button type="button" onClick={() => setAssigningTicket(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Select Designated Technician / Vendor</label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Pramod Panda (Lead Electrician, Substation)">Pramod Panda (Lead Electrician)</option>
                  <option value="Suresh Mohapatra (Plumber & Pipe Works)">Suresh Mohapatra (Plumbing)</option>
                  <option value="HP Enterprise On-Site AMC Engineer">HP Enterprise On-Site Engineer</option>
                  <option value="Schneider Electric UPS Field Team">Schneider Electric UPS Team</option>
                  <option value="Central Workshop Metrology Cell">Central Workshop Metrology Cell</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAssigningTicket(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignTechnician}
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Incident Modal */}
      {showIncidentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ background: '#0b1830', color: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Log Laboratory Incident / Breakdown</h3>
              <button type="button" onClick={() => setShowIncidentModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Incident Nature *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smoke emission from capacitor / Glassware shatter"
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Severity Level</label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Low">Low (No injury, minor damage)</option>
                  <option value="Medium">Medium (Apparatus breakdown, tripped breaker)</option>
                  <option value="High">High (Immediate evacuation, fire risk)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Root Cause Analysis</label>
                <textarea
                  rows={2}
                  placeholder="Apparent failure mechanism..."
                  value={newIncident.rootCause}
                  onChange={(e) => setNewIncident({ ...newIncident, rootCause: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>Corrective &amp; Preventive Action (CAPA)</label>
                <textarea
                  rows={2}
                  placeholder="Measures taken to prevent recurrence..."
                  value={newIncident.correctiveAction}
                  onChange={(e) => setNewIncident({ ...newIncident, correctiveAction: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Record Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
