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
import { erpStore } from '../services/erpStore.js';

export default function StaffPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, visitors, inventory
  const [staffWorkspaces, setStaffWorkspaces] = useState(() => erpStore.getStaffWorkspaces());
  const [toastMessage, setToastMessage] = useState('');

  const [visitorsList, setVisitorsList] = useState([
    { id: 'VIS-901', name: 'Mr. Arvind Krishnan', org: 'Cognizant Campus Team', purpose: 'Campus Drive Coordination', phone: '+91 98450 11200', inTime: '09:30 AM', status: 'Inside Campus (Badge #04)' },
    { id: 'VIS-902', name: 'Dr. R. C. Mohanty', org: 'AICTE / BPUT Inspector', purpose: 'Autonomy Annual Inspection', phone: '+91 94371 44550', inTime: '10:15 AM', status: 'Inside Campus (Badge #01)' },
    { id: 'VIS-903', name: 'Mr. Rajesh Jena', org: 'Voltas HVAC Services', purpose: 'Central AC Maintenance', phone: '+91 94378 22114', inTime: '08:00 AM', status: 'Departed (Checked Out 12:45 PM)' },
  ]);

  useEffect(() => {
    const handleUpdate = () => {
      setStaffWorkspaces([...erpStore.getStaffWorkspaces()]);
    };
    window.addEventListener('erp_store_updated', handleUpdate);
    return () => window.removeEventListener('erp_store_updated', handleUpdate);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
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
              className={`erp-nav-item ${activeTab === 'take-attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('take-attendance')}
            >
              <ClipboardCheck size={18} />
              <span>Take Attendance</span>
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

          {/* STATS */}
          {activeTab !== 'take-attendance' && (
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
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Campus Maintenance & Laboratory Work Orders</h3>
                  <p>Real-time technical tasks allocated across campus blocks</p>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Ticket ID & Title</th>
                      <th>Work Category</th>
                      <th>Assigned Member</th>
                      <th>Priority</th>
                      <th>Created Date</th>
                      <th>Current Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffWorkspaces.map(t => (
                      <tr key={t.id}>
                        <td><strong>{t.title}</strong></td>
                        <td>
                          <span style={{ background: 'rgba(20, 184, 166, 0.12)', color: '#2dd4bf', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {t.category}
                          </span>
                        </td>
                        <td style={{ color: '#cbd5e1' }}>{t.assignedTo}</td>
                        <td>
                          <span style={{
                            background: t.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: t.priority === 'High' ? '#f87171' : '#38bdf8',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}>
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.createdAt}</td>
                        <td>
                          <span style={{
                            color: t.status === 'Completed' ? '#22c55e' : t.status === 'In Progress' ? '#38bdf8' : '#f59e0b',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                          }}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          {t.status !== 'Completed' ? (
                            <button
                              className="erp-btn erp-btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => handleUpdateTicketStatus(t.id, 'Completed')}
                            >
                              Mark Done
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                        <td><strong>{v.id}</strong></td>
                        <td><strong>{v.name}</strong></td>
                        <td style={{ color: '#cbd5e1' }}>{v.org}</td>
                        <td>{v.purpose}</td>
                        <td style={{ color: '#38bdf8' }}>{v.phone}</td>
                        <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{v.inTime}</td>
                        <td>
                          <span style={{
                            color: v.status.includes('Inside') ? '#22c55e' : '#94a3b8',
                            fontWeight: 600,
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
              <p style={{ color: '#94a3b8' }}>
                All physical and postal documents are indexed with speed post tracking IDs and synchronized with administrative document vault.
              </p>
            </div>
          )}

          {/* TAB 4: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="staff" />
          )}
        </div>
      </main>
    </div>
  );
}
