import React, { useState, useEffect } from 'react';
import {
  Wrench,
  FileText,
  UserCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Layers,
  ChevronRight,
  ShieldCheck,
  HardHat,
  Monitor,
  Menu,
  X,
  FileSpreadsheet,
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';
import TakeAttendanceModule from './Attendance/TakeAttendanceModule.jsx';
import './StaffPortal.css';
import './SuperAdminPortal.css';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import DigitalAnswerSheetEvaluationSystem from './DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx';
import { erpStore } from '../services/erpStore.js';
import { api } from '../services/api.js';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';

export default function StaffPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, tickets, visitors, inventory
  const [staffWorkspaces, setStaffWorkspaces] = useState(() => erpStore.getStaffWorkspaces());
  const [toastMessage, setToastMessage] = useState('');

  const [visitorsList, setVisitorsList] = useState([
    { id: 'VIS-901', name: 'Mr. Arvind Krishnan', org: 'Cognizant Campus Team', purpose: 'Campus Drive Coordination', phone: '+91 98450 11200', inTime: '09:30 AM', status: 'Inside Campus (Badge #04)' },
    { id: 'VIS-902', name: 'Dr. R. C. Mohanty', org: 'AICTE / BPUT Inspector', purpose: 'Autonomy Annual Inspection', phone: '+91 94371 44550', inTime: '10:15 AM', status: 'Inside Campus (Badge #01)' },
    { id: 'VIS-903', name: 'Mr. Rajesh Jena', org: 'Voltas HVAC Services', purpose: 'Central AC Maintenance', phone: '+91 94378 22114', inTime: '08:00 AM', status: 'Departed (Checked Out 12:45 PM)' },
  ]);

  const [liveComplaints, setLiveComplaints] = useState([
    {
      id: 'CMP-2026-101',
      studentName: 'Rakesh Das',
      rollNumber: '01',
      location: 'Room 204 Attached Bathroom',
      category: 'Plumbing',
      predictedCategory: 'plumbing',
      confidence: 0.88,
      title: 'Water tap leaking continuously in bathroom',
      description: 'The bathroom wash basin tap is broken at the valve and dripping water constantly.',
      priority: 'High',
      status: 'In Progress',
      assignedStaffName: 'Suresh Mohapatra',
      assignedStaffRole: 'Plumber & Water Works',
      filedDate: '18 Oct 2026',
      resolutionNotes: 'Assigned to Suresh Mohapatra. Ceramic washer replacement scheduled for 11:30 AM.',
    },
    {
      id: 'CMP-2026-102',
      studentName: 'Rakesh Das',
      rollNumber: '01',
      location: 'Study Area Desk #02',
      category: 'Electrical',
      predictedCategory: 'electrical',
      confidence: 0.82,
      title: 'Ceiling fan making screeching noise',
      description: 'The ceiling fan bearing has deteriorated and makes a loud squeaking sound on speed 4 and 5.',
      priority: 'Medium',
      status: 'Assigned',
      assignedStaffName: 'Pramod Panda',
      assignedStaffRole: 'Electrician & Power Maintenance',
      filedDate: '18 Oct 2026',
      resolutionNotes: 'Allocated to Pramod Panda based on lowest pending electrical workload.',
    }
  ]);
  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [resolutionInput, setResolutionInput] = useState('');

  const loadLiveComplaints = async () => {
    try {
      const res = await api.getComplaints();
      if (res && res.data && res.data.length > 0) {
        setLiveComplaints(res.data);
      }
    } catch {
      // keep fallback data
    }
  };

  useEffect(() => {
    loadLiveComplaints();
  }, []);

  const handleStartWork = async (ticket) => {
    try {
      await api.updateComplaintStatus(ticket.id, {
        status: 'In Progress',
        resolutionNotes: `Technician accepted work order and commenced on-site diagnosis at ${new Date().toLocaleTimeString()}.`,
      });
      triggerToast(`Ticket #${ticket.id} accepted! Status: In Progress`);
      loadLiveComplaints();
    } catch {
      setLiveComplaints(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'In Progress' } : t));
      triggerToast(`Ticket #${ticket.id} marked In Progress!`);
    }
  };

  const handleResolveTicket = async () => {
    if (!resolvingTicket) return;
    const notes = resolutionInput.trim() || 'Work completed and verified on-site by maintenance staff.';
    try {
      await api.updateComplaintStatus(resolvingTicket.id, {
        status: 'Resolved',
        resolutionNotes: notes,
      });
      triggerToast(`Ticket #${resolvingTicket.id} marked as RESOLVED!`);
      loadLiveComplaints();
    } catch {
      setLiveComplaints(prev => prev.map(t => t.id === resolvingTicket.id ? { ...t, status: 'Resolved', resolutionNotes: notes } : t));
      triggerToast(`Ticket #${resolvingTicket.id} marked as Resolved!`);
    } finally {
      setResolvingTicket(null);
      setResolutionInput('');
    }
  };

  const handleUpdateTicketStatus = (id, newStatus) => {
    erpStore.updateStaffTicketStatus(id, newStatus);
    triggerToast(`Ticket #${id} updated to "${newStatus}"!`);
  };

  return (
    <div className="erp-staff-layout">
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="erp-sidebar">
          <div className="erp-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="erp-staff-badge" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="erp-brand-text">
                <h2>Apna Campus</h2>
                <span style={{ color: '#2dd4bf' }}>Operations & Staff</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="erp-sidebar-nav">
            <button
              className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Monitor size={18} />
              <span>Staff &amp; Lab Dashboard</span>
              <span className="erp-nav-badge" style={{ background: '#14b8a6', color: '#ffffff' }}>Live</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'take-attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('take-attendance')}
            >
              <ClipboardCheck size={18} />
              <span>Take Attendance</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'lab-evaluation' ? 'active' : ''}`}
              onClick={() => setActiveTab('lab-evaluation')}
              style={{
                background: activeTab === 'lab-evaluation' ? undefined : 'linear-gradient(90deg, rgba(20, 184, 166, 0.12), rgba(59, 130, 246, 0.12))',
                border: '1px solid rgba(20, 184, 166, 0.35)'
              }}
            >
              <FileText size={18} style={{ color: '#2dd4bf' }} />
              <span>Practical &amp; Lab Evaluation</span>
              <span className="erp-nav-badge" style={{ background: '#14b8a6', color: '#ffffff' }}>New</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <Wrench size={18} />
              <span>Support & Lab Tickets</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'visitors' ? 'active' : ''}`}
              onClick={() => setActiveTab('visitors')}
            >
              <UserCheck size={18} />
              <span>Visitor Gate Passes</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'clerical' ? 'active' : ''}`}
              onClick={() => setActiveTab('clerical')}
            >
              <FileText size={18} />
              <span>Office Inward/Outward</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'report-generation' ? 'active' : ''}`}
              onClick={() => setActiveTab('report-generation')}
            >
              <FileSpreadsheet size={18} />
              <span>Report Generation</span>
            </button>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="erp-main-content">
        {activeTab === 'dashboard' ? (
          <RoleDashboardLanding
            roleKey="staff"
            account={account}
            onLogout={onLogout}
            onSwitchRole={onSwitchRole}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            onNavigate={(target) => {
              if (target === 'equipment') setActiveTab('tickets');
              else if (target === 'schedule') setActiveTab('take-attendance');
              else if (target === 'maintenance') setActiveTab('tickets');
              else setActiveTab('tickets');
            }}
          />
        ) : (
          <>
        <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation"
                aria-label="Show Navigation"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1>Non-Teaching Staff Operational Console</h1>
              <p>Lab Assistants, Office Clerks, Reception Desk & Technical Maintenance</p>
            </div>
          </div>

          <div className="erp-header-actions">
            <div className="erp-role-badge">
              <ShieldCheck size={14} /> Operations Staff Active
            </div>

            {/* Top-Right Campus OS User Profile Pill with Sign Out */}
            <div className="campus-user-pill">
              <div className="campus-user-avatar">OPS</div>
              <div className="campus-user-details">
                <strong>{account?.name || 'Support & Operations Staff'}</strong>
                <small>Technical &amp; Lab Support</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="erp-content-body">
          {/* TAB: TAKE ATTENDANCE */}
          {activeTab === 'take-attendance' && (
            <div style={{ marginBottom: '24px' }}>
              <TakeAttendanceModule
                account={account}
                role="staff"
                onBackToDashboard={() => setActiveTab('tickets')}
              />
            </div>
          )}

          {/* TAB: DIGITAL LAB / PRACTICAL EVALUATION */}
          {activeTab === 'lab-evaluation' && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '20px' }}>
              <DigitalAnswerSheetEvaluationSystem initialRole="staff" currentUser={account} />
            </div>
          )}

          {/* STATS */}
          {activeTab !== 'take-attendance' && activeTab !== 'lab-evaluation' && (
          <div className="erp-stats-grid">
            <div className="erp-stat-card">
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Open Tickets</span>
                <Wrench size={18} color="#2dd4bf" />
              </div>
              <div className="erp-stat-val">
                {staffWorkspaces.filter(t => t.status !== 'Completed').length}
              </div>
              <div className="erp-stat-note">Lab & facilities tasks</div>
            </div>

            <div className="erp-stat-card">
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Visitors On Campus</span>
                <UserCheck size={18} color="#38bdf8" />
              </div>
              <div className="erp-stat-val">2 Guests</div>
              <div className="erp-stat-note">AICTE / Recruiter VIPs</div>
            </div>

            <div className="erp-stat-card">
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Computer Labs</span>
                <Monitor size={18} color="#10b981" />
              </div>
              <div className="erp-stat-val">12 Labs</div>
              <div className="erp-stat-note">720 High-speed workstations</div>
            </div>

            <div className="erp-stat-card">
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Resolution SLA</span>
                <Clock size={18} color="#f59e0b" />
              </div>
              <div className="erp-stat-val">98.2%</div>
              <div className="erp-stat-note">Within 4-hour window</div>
            </div>
          </div>
          )}

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 140px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB 1: TICKETS */}
          {activeTab === 'tickets' && (
            <div className="erp-panel">
              <div className="erp-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="erp-panel-title">
                  <h3>AI-Assigned Campus Maintenance &amp; Work Orders</h3>
                  <p>Real-time tasks allocated automatically based on AI classification and technician workload</p>
                </div>
                <button
                  className="erp-btn erp-btn-secondary"
                  onClick={loadLiveComplaints}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                  <RotateCcw size={14} /> Refresh Tasks
                </button>
              </div>

              {/* LIVE COMPLAINTS TABLE */}
              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Ticket ID &amp; Location</th>
                      <th>Issue &amp; Details</th>
                      <th>Category &amp; AI Confidence</th>
                      <th>Assigned Member</th>
                      <th>Priority</th>
                      <th>Current Status</th>
                      <th>Resolution / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveComplaints.map(t => (
                      <tr key={t.id}>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{t.id}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            📍 {t.location || 'Campus Residence'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                            Student: {t.studentName} ({t.rollNumber || '01'})
                          </div>
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{t.title}</strong>
                          {t.description && (
                            <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.35 }}>
                              {t.description}
                            </p>
                          )}
                          {t.resolutionNotes && (
                            <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#0f766e', fontStyle: 'italic' }}>
                              Note: {t.resolutionNotes}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ background: '#ccfbf1', color: '#0f766e', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block', width: 'fit-content' }}>
                              {t.category}
                            </span>
                            {t.predictedCategory && (
                              <span style={{ fontSize: '0.7rem', color: '#7e22ce', fontWeight: 600 }}>
                                ✨ AI: {t.predictedCategory} ({Math.round((t.confidence || 0.85) * 100)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: '#0f172a', fontSize: '0.84rem' }}>
                          <strong>{t.assignedStaffName || 'Unassigned (In Review)'}</strong>
                          {t.assignedStaffRole && (
                            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>{t.assignedStaffRole}</div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            background: t.priority === 'High' ? '#fee2e2' : '#e0f2fe',
                            color: t.priority === 'High' ? '#b91c1c' : '#0369a1',
                            border: t.priority === 'High' ? '1px solid #fecaca' : '1px solid #bae6fd',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            color: t.status === 'Resolved' ? '#15803d' : t.status === 'In Progress' ? '#0284c7' : t.status === 'Needs Review' ? '#b45309' : '#6d28d9',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                          }}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          {t.status === 'Assigned' || t.status === 'Pending' ? (
                            <button
                              className="erp-btn erp-btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: '#0284c7', color: '#fff', border: 'none' }}
                              onClick={() => handleStartWork(t)}
                            >
                              Accept &amp; Start Work
                            </button>
                          ) : t.status === 'In Progress' ? (
                            <button
                              className="erp-btn erp-btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: '#059669', color: '#fff', border: 'none' }}
                              onClick={() => {
                                setResolvingTicket(t);
                                setResolutionInput('');
                              }}
                            >
                              Resolve Ticket
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>
                              ✓ Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal for adding resolution notes */}
              {resolvingTicket && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem',
                }}>
                  <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    maxWidth: '480px',
                    width: '100%',
                    color: '#f8fafc',
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#38bdf8' }}>
                      Complete Work Order: #{resolvingTicket.id}
                    </h3>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {resolvingTicket.title} · 📍 {resolvingTicket.location}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Resolution Notes &amp; Verification Action</label>
                      <textarea
                        rows={3}
                        value={resolutionInput}
                        onChange={e => setResolutionInput(e.target.value)}
                        placeholder="e.g. Replaced faulty washer and tested tap under full pressure. Verified zero leakage."
                        style={{
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff',
                          padding: '8px 10px',
                          fontSize: '0.85rem',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="erp-btn erp-btn-secondary"
                        onClick={() => setResolvingTicket(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        style={{
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          padding: '0.45rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={handleResolveTicket}
                      >
                        ✓ Mark Resolved &amp; Close Order
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISITORS */}
          {activeTab === 'visitors' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Reception Desk & Visitor Security Gate Passes</h3>
                  <p>Inward guest registry and campus security badge allocations</p>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Gate Pass ID</th>
                      <th>Guest Name</th>
                      <th>Organization</th>
                      <th>Visiting Purpose</th>
                      <th>Contact Phone</th>
                      <th>Check-In Time</th>
                      <th>Pass Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorsList.map(v => (
                      <tr key={v.id}>
                        <td><strong style={{ color: '#0f172a' }}>{v.id}</strong></td>
                        <td><strong style={{ color: '#0f172a' }}>{v.name}</strong></td>
                        <td style={{ color: '#475569', fontWeight: 500 }}>{v.org}</td>
                        <td style={{ color: '#1e293b' }}>{v.purpose}</td>
                        <td style={{ color: '#0284c7', fontWeight: 600 }}>{v.phone}</td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>{v.inTime}</td>
                        <td>
                          <span style={{
                            color: v.status.includes('Inside') ? '#16a34a' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CLERICAL */}
          {activeTab === 'clerical' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Administrative Clerical Inward / Outward Dispatch</h3>
                  <p>Council letters, university degree certificates, and speed-post dispatches</p>
                </div>
              </div>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                All physical and postal documents are indexed with speed post tracking IDs and synchronized with administrative document vault.
              </p>
            </div>
          )}

          {/* TAB 4: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="staff" />
          )}
        </div>
          </>
        )}
      </main>
    </div>
  );
}
