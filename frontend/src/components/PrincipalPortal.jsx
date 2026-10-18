import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Megaphone,
  AlertTriangle,
  Award,
  Users,
  Clock,
  LogOut,
  Send,
  Eye,
  ShieldCheck,
  Check,
  Menu,
  X,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import './PrincipalPortal.css';
import './SuperAdminPortal.css';
import { erpStore } from '../services/erpStore.js';

export default function PrincipalPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('governance'); // governance, leaves, notices, academic_health
  const [leaveRequests, setLeaveRequests] = useState(() => erpStore.getLeaveRequests());
  const [toastMessage, setToastMessage] = useState('');

  const [institutionalNotices, setInstitutionalNotices] = useState([
    { id: 'NOTIF-201', title: 'Autumn End-Semester Autonomous Examination Schedule 2026', scope: 'All Campus', status: 'Approved & Broadcasted', author: 'Controller of Examinations', date: '02 Oct 2026' },
    { id: 'NOTIF-202', title: 'Campus Holiday on account of Gandhi Jayanti (02 October)', scope: 'College-wide', status: 'Approved & Broadcasted', author: 'Principal Secretariat', date: '01 Oct 2026' },
    { id: 'NOTIF-203', title: 'Cisco Systems Placement Drive for B.Tech Final Year Students', scope: 'Final Year B.Tech', status: 'Pending Approval', author: 'Training & Placement Cell', date: '04 Oct 2026' },
  ]);

  const [newNotice, setNewNotice] = useState({ title: '', scope: 'College-wide', content: '' });

  useEffect(() => {
    const handleUpdate = () => {
      setLeaveRequests([...erpStore.getLeaveRequests()]);
    };
    window.addEventListener('erp_store_updated', handleUpdate);
    return () => window.removeEventListener('erp_store_updated', handleUpdate);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleApproveLeave = (leaveId) => {
    erpStore.approveLeave(leaveId, 'principal', 'Approved by Principal / Director');
    triggerToast(`Leave request #${leaveId} officially approved!`);
  };

  const handleRejectLeave = (leaveId) => {
    erpStore.rejectLeave(leaveId, 'principal', 'Rejected by Principal');
    triggerToast(`Leave request #${leaveId} rejected.`);
  };

  const handleApproveNotice = (id) => {
    setInstitutionalNotices(institutionalNotices.map(n => n.id === id ? { ...n, status: 'Approved & Broadcasted' } : n));
    triggerToast(`Notice #${id} approved and published to all students & faculty!`);
  };

  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!newNotice.title) return;
    const item = {
      id: `NOTIF-${Math.floor(200 + Math.random() * 800)}`,
      title: newNotice.title,
      scope: newNotice.scope,
      status: 'Approved & Broadcasted',
      author: 'Office of the Principal / Director',
      date: new Date().toLocaleDateString('en-GB'),
    };
    setInstitutionalNotices([item, ...institutionalNotices]);
    erpStore.logAuditEvent({
      user: account.name || 'Principal / Director',
      role: 'PRINCIPAL',
      action: 'Issued Official Institutional Circular',
      target: newNotice.title,
      oldValue: 'Draft',
      newValue: 'Approved & Broadcasted',
    });
    setNewNotice({ title: '', scope: 'College-wide', content: '' });
    triggerToast('Official circular broadcasted to college portals!');
  };

  return (
    <div className="erp-principal-layout">
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
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="erp-sidebar erp-principal-sidebar">
          <div className="erp-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="erp-director-badge" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="erp-brand-text">
                <h2>Apna Campus</h2>
                <span style={{ color: '#38bdf8' }}>Office of Principal</span>
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
              className={`erp-nav-item ${activeTab === 'governance' ? 'active' : ''}`}
              onClick={() => setActiveTab('governance')}
            >
              <Building2 size={18} />
              <span>Campus Overview</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'leaves' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaves')}
            >
              <CalendarCheck size={18} />
              <span>Leave Approvals</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'notices' ? 'active' : ''}`}
              onClick={() => setActiveTab('notices')}
            >
              <Megaphone size={18} />
              <span>Official Circulars</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'academic_health' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic_health')}
            >
              <Award size={18} />
              <span>Academic Performance</span>
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
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              <h1>Principal / Director Command Center</h1>
              <p>Institutional Academic Leadership & Executive Clearances</p>
            </div>
          </div>

          <div className="erp-header-actions">
            <div className="erp-role-badge">
              <ShieldCheck size={14} /> Executive Clearance Authority
            </div>

            {/* Top-Right Campus OS User Profile Pill with Sign Out */}
            <div className="campus-user-pill">
              <div className="campus-user-avatar">PR</div>
              <div className="campus-user-details">
                <strong>{account?.name || 'Dr. S. K. Rout'}</strong>
                <small>Principal &amp; Director</small>
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
          {/* TAB 1: GOVERNANCE OVERVIEW */}
          {activeTab === 'governance' && (
            <div>
              <div className="erp-stats-grid">
                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Enrolled Students</span>
                    <Users size={18} color="#38bdf8" />
                  </div>
                  <div className="erp-stat-val">2,480</div>
                  <div className="erp-stat-note">5 Departments · 18 Autonomous Programs</div>
                </div>

                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Teaching Faculty</span>
                    <GraduationCap size={18} color="#10b981" />
                  </div>
                  <div className="erp-stat-val">146</div>
                  <div className="erp-stat-note">92% Ph.D & Master Holders</div>
                </div>

                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Pending Leave Requests</span>
                    <CalendarCheck size={18} color="#f59e0b" />
                  </div>
                  <div className="erp-stat-val">
                    {leaveRequests.filter(l => l.principalStatus === 'Pending Final Stamp').length}
                  </div>
                  <div className="erp-stat-note">Forwarded with HOD recommendation</div>
                </div>

                <div className="erp-stat-card">
                  <div className="erp-stat-card-header">
                    <span className="erp-stat-card-title">Institutional Pass %</span>
                    <Award size={18} color="#a855f7" />
                  </div>
                  <div className="erp-stat-val">94.2%</div>
                  <div className="erp-stat-note">Autumn 2026 Autonomous Session</div>
                </div>
              </div>

              {/* Department Oversight Table */}
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Academic Department Governance</h3>
                    <p>HOD status, syllabus completion, and faculty leaves today</p>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>HOD Name</th>
                        <th>Students</th>
                        <th>Faculty on Duty</th>
                        <th>Syllabus Pace</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong style={{ color: '#0f172a' }}>Computer Science & Engineering (CSE)</strong></td>
                        <td style={{ color: '#1e293b' }}>Dr. P. K. Pattnaik</td>
                        <td style={{ color: '#1e293b', fontWeight: 600 }}>540</td>
                        <td style={{ color: '#1e293b' }}>31 / 32 On Duty</td>
                        <td><span style={{ color: '#16a34a', fontWeight: 700 }}>74% Completed</span> <span style={{ color: '#475569' }}>(On Schedule)</span></td>
                        <td><button className="erp-btn erp-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => triggerToast('CSE report opened')}>Inspect</button></td>
                      </tr>
                      <tr>
                        <td><strong style={{ color: '#0f172a' }}>Electronics & Communication (ECE)</strong></td>
                        <td style={{ color: '#1e293b' }}>Dr. M. R. Senapati</td>
                        <td style={{ color: '#1e293b', fontWeight: 600 }}>380</td>
                        <td style={{ color: '#1e293b' }}>24 / 24 On Duty</td>
                        <td><span style={{ color: '#16a34a', fontWeight: 700 }}>71% Completed</span> <span style={{ color: '#475569' }}>(On Schedule)</span></td>
                        <td><button className="erp-btn erp-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => triggerToast('ECE report opened')}>Inspect</button></td>
                      </tr>
                      <tr>
                        <td><strong style={{ color: '#0f172a' }}>Electrical & Electronics (EEE)</strong></td>
                        <td style={{ color: '#1e293b' }}>Dr. S. K. Das</td>
                        <td style={{ color: '#1e293b', fontWeight: 600 }}>290</td>
                        <td style={{ color: '#1e293b' }}>18 / 18 On Duty</td>
                        <td><span style={{ color: '#16a34a', fontWeight: 700 }}>69% Completed</span> <span style={{ color: '#475569' }}>(On Schedule)</span></td>
                        <td><button className="erp-btn erp-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => triggerToast('EEE report opened')}>Inspect</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEAVE APPROVALS */}
          {activeTab === 'leaves' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Multi-Level Leave Approvals Queue</h3>
                  <p>Faculty & staff leave applications recommended by HODs awaiting Principal final sign-off</p>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Department & Role</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Reason & HOD Endorsement</th>
                      <th>Status</th>
                      <th>Principal Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map(leave => (
                      <tr key={leave.id}>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{leave.applicantName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {leave.applicantId}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{leave.applicantRole}</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>{leave.department}</div>
                        </td>
                        <td>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {leave.leaveType}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{leave.totalDays} Days</strong>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>{leave.startDate} to {leave.endDate}</div>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.45 }}>{leave.reason}</div>
                          <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                            ✓ HOD: {leave.hodRemarks || 'Recommended'}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            color: leave.principalStatus === 'Approved' ? '#16a34a' : leave.principalStatus === 'Rejected' ? '#dc2626' : '#d97706',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                          }}>
                            {leave.principalStatus}
                          </span>
                        </td>
                        <td>
                          {leave.principalStatus === 'Pending Final Stamp' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="erp-btn erp-btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => handleApproveLeave(leave.id)}
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                className="erp-btn erp-btn-danger"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => handleRejectLeave(leave.id)}
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Action Recorded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL NOTICES */}
          {activeTab === 'notices' && (
            <div>
              {/* Broadcast Notice Form */}
              <div className="erp-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Issue Official Principal Circular</h3>
                    <p>Direct broadcast to all student, faculty, and administrative dashboards</p>
                  </div>
                </div>

                <form onSubmit={handleCreateNotice}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Circular Subject / Heading..."
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                      required
                      style={{ padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                    <select
                      value={newNotice.scope}
                      onChange={(e) => setNewNotice({ ...newNotice, scope: e.target.value })}
                      style={{ padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    >
                      <option value="College-wide">College-wide (All Students & Staff)</option>
                      <option value="All Faculty Only">All Faculty & HODs Only</option>
                      <option value="All Students Only">All Students Only</option>
                      <option value="Final Year Students">Final Year Students Only</option>
                    </select>
                  </div>

                  <button type="submit" className="erp-btn erp-btn-primary">
                    <Send size={15} /> Publish & Broadcast Circular
                  </button>
                </form>
              </div>

              {/* Notice Clearance Queue */}
              <div className="erp-panel">
                <div className="erp-panel-header">
                  <div className="erp-panel-title">
                    <h3>Institutional Notice Clearance Board</h3>
                    <p>Notices submitted by departments or exam cell awaiting clearance</p>
                  </div>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Circular Title</th>
                        <th>Target Audience</th>
                        <th>Initiating Department</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institutionalNotices.map(n => (
                        <tr key={n.id}>
                          <td><strong style={{ color: '#0f172a' }}>{n.title}</strong></td>
                          <td>
                            <span style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {n.scope}
                            </span>
                          </td>
                          <td style={{ color: '#475569', fontWeight: 500 }}>{n.author}</td>
                          <td style={{ fontSize: '0.8rem', color: '#475569' }}>{n.date}</td>
                          <td>
                            <span style={{ color: n.status.includes('Approved') ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                              {n.status}
                            </span>
                          </td>
                          <td>
                            {n.status.includes('Pending') ? (
                              <button
                                className="erp-btn erp-btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => handleApproveNotice(n.id)}
                              >
                                Approve & Release
                              </button>
                            ) : (
                              <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>Released</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMIC HEALTH */}
          {activeTab === 'academic_health' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Institutional Autonomous Examination Performance</h3>
                  <p>Certified pass percentage, backlog distribution, and NAAC quality indicators</p>
                </div>
              </div>
              <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Official autonomous results compiled by Examination Cell. Continuous evaluation verified across all five engineering departments.
              </p>
            </div>
          )}

          {/* TAB 5: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="principal" />
          )}

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 120px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
