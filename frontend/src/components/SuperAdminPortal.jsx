import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Settings,
  History,
  Database,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Save,
  LogOut,
  ExternalLink,
  Sliders,
  Server,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  Menu,
  X,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import './SuperAdminPortal.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';
import { erpStore, permissionDefinitions, initialRolesList } from '../services/erpStore.js';

export default function SuperAdminPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, rbac, settings, audit, users, backup
  const [rolePermissions, setRolePermissions] = useState(() => erpStore.getRolePermissions());
  const [settings, setSettings] = useState(() => erpStore.getSettings());
  const [auditLogs, setAuditLogs] = useState(() => erpStore.getAuditLogs());
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [backupStatus, setBackupStatus] = useState('Idle');
  const [selectedRoleForRbac, setSelectedRoleForRbac] = useState('faculty');

  // Listen to ERP store reactive events
  useEffect(() => {
    const handleUpdate = () => {
      setRolePermissions({ ...erpStore.getRolePermissions() });
      setSettings({ ...erpStore.getSettings() });
      setAuditLogs([...erpStore.getAuditLogs()]);
    };
    window.addEventListener('erp_store_updated', handleUpdate);
    return () => window.removeEventListener('erp_store_updated', handleUpdate);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleTogglePermission = (roleKey, permId) => {
    erpStore.togglePermission(roleKey, permId);
    triggerToast(`Updated permission ${permId} for ${roleKey}`);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    erpStore.updateSettings(settings);
    triggerToast('Institutional ERP system settings saved successfully!');
  };

  const handleTriggerBackup = () => {
    setBackupStatus('Creating snapshot...');
    setTimeout(() => {
      erpStore.logAuditEvent({
        user: account.name || 'Super Administrator',
        role: 'SUPER_ADMIN',
        action: 'System Database Backup Generated',
        target: 'PostgreSQL DB & Object Vault',
        oldValue: 'Snapshot 2026-10-07',
        newValue: `Snapshot ${new Date().toISOString().split('T')[0]} (14.2 MB)`,
      });
      setBackupStatus('Backup Completed');
      triggerToast('Full PostgreSQL system snapshot created and encrypted in cloud vault!');
      setTimeout(() => setBackupStatus('Idle'), 4000);
    }, 1200);
  };

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.target.toLowerCase().includes(auditSearch.toLowerCase());
      const matchRole = auditRoleFilter === 'ALL' || log.role === auditRoleFilter;
      return matchSearch && matchRole;
    });
  }, [auditLogs, auditSearch, auditRoleFilter]);

  return (
    <div className="erp-super-admin-layout">
      {/* Toast */}
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
        <aside className="erp-sidebar">
          <div className="erp-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="erp-brand-badge" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="erp-brand-text">
                <h2>Apna Campus ERP</h2>
                <span>Super Admin Center</span>
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
              className={`erp-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Server size={18} />
              <span>Overview & Health</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'rbac' ? 'active' : ''}`}
              onClick={() => setActiveTab('rbac')}
            >
              <KeyRound size={18} />
              <span>RBAC Permissions</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              <span>System Settings</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <History size={18} />
              <span>Global Audit Trail</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span>User Directory</span>
            </button>
            <button
              className={`erp-nav-item ${activeTab === 'backup' ? 'active' : ''}`}
              onClick={() => setActiveTab('backup')}
            >
              <Database size={18} />
              <span>Backup & Recovery</span>
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
        {activeTab === 'overview' ? (
          <RoleDashboardLanding
            account={account}
            roleKey="super_admin"
            onLogout={onLogout}
            onSwitchRole={onSwitchRole}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNavigateTab={(tabId) => {
              if (tabId === 'users') setActiveTab('users');
              else if (tabId === 'approvals' || tabId === 'activity') setActiveTab('audit');
              else if (tabId === 'campus-connect') setActiveTab('campus-connect');
            }}
          />
        ) : (
          <>
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
                  <h1>Enterprise Governance & Security Console</h1>
                  <p>Super Administrator · Complete System-Level Control</p>
                </div>
              </div>

              <div className="erp-header-actions">
                {onSwitchRole && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>Preview:</span>
                    <select
                      className="erp-role-switcher-select"
                      value="super_admin"
                      onChange={(e) => onSwitchRole(e.target.value)}
                    >
                      <option value="super_admin">Super Administrator</option>
                      <option value="management">Management / Trustee</option>
                      <option value="principal">Principal / Director</option>
                      <option value="admin">Admin Operations</option>
                      <option value="hod">HOD</option>
                      <option value="faculty">Faculty Portal</option>
                      <option value="student">Student Portal</option>
                      <option value="accounts">Accounts & Finance</option>
                      <option value="exam_cell">Examination Cell</option>
                      <option value="library">Library Staff</option>
                      <option value="warden">Hostel Warden</option>
                      <option value="transport">Transport Fleet</option>
                      <option value="placement">Placement Cell</option>
                      <option value="staff">Non-Teaching Staff</option>
                    </select>
                  </div>
                )}
                <div className="erp-role-badge">
                  <ShieldCheck size={14} /> Full Access Grant
                </div>

                {/* Top Right Campus OS User Profile Pill with Sign Out */}
                <div className="campus-user-pill">
                  <div className="campus-user-avatar">SA</div>
                  <div className="campus-user-details">
                    <strong>{account?.name || 'Chief Systems Architect'}</strong>
                    <small>Super Admin • {account?.identity || 'SYS-SUPER-01'}</small>
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
              {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
              {activeTab === 'campus-connect' && (
                <div style={{ height: 'calc(100vh - 140px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
                  <CampusConnect account={account} />
                </div>
              )}

          {/* TAB 2: RBAC MATRIX */}
          {activeTab === 'rbac' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Role-Based Access Control (RBAC) Permission Matrix</h3>
                  <p>Configure granular permission grants across all 14 institutional roles</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    className="erp-role-switcher-select"
                    value={selectedRoleForRbac}
                    onChange={(e) => setSelectedRoleForRbac(e.target.value)}
                  >
                    {initialRolesList.map(r => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Permission Name</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'center' }}>{initialRolesList.find(r => r.key === selectedRoleForRbac)?.label}</th>
                      <th>Policy Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionDefinitions.map((perm) => {
                      const isGranted = (rolePermissions[selectedRoleForRbac] || []).includes(perm.id);
                      return (
                        <tr key={perm.id}>
                          <td>
                            <strong>{perm.label}</strong>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{perm.id}</div>
                          </td>
                          <td>
                            <span style={{
                              background: 'rgba(99, 102, 241, 0.12)',
                              color: '#a5b4fc',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}>
                              {perm.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              className="erp-checkbox-custom"
                              checked={isGranted}
                              disabled={selectedRoleForRbac === 'super_admin'}
                              onChange={() => handleTogglePermission(selectedRoleForRbac, perm.id)}
                            />
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {isGranted ? (
                              <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <CheckCircle2 size={13} /> Granted for role
                              </span>
                            ) : (
                              <span style={{ color: '#64748b' }}>Revoked / Restricted</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Institutional System & Autonomous Regulations</h3>
                  <p>Global parameters, grading formulas, and college profile</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Institution Name</label>
                    <input
                      type="text"
                      value={settings.institutionName}
                      onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Autonomous Institution Code</label>
                    <input
                      type="text"
                      value={settings.institutionCode}
                      onChange={(e) => setSettings({ ...settings, institutionCode: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Affiliating University</label>
                    <input
                      type="text"
                      value={settings.affiliatingUniversity}
                      onChange={(e) => setSettings({ ...settings, affiliatingUniversity: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Current Academic Session</label>
                    <input
                      type="text"
                      value={settings.currentAcademicYear}
                      onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Minimum Attendance Requirement (%)</label>
                    <input
                      type="number"
                      value={settings.minimumAttendancePercentage}
                      onChange={(e) => setSettings({ ...settings, minimumAttendancePercentage: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 600, marginBottom: '6px' }}>Grading Scale Scheme</label>
                    <select
                      value={settings.gradingSystem}
                      onChange={(e) => setSettings({ ...settings, gradingSystem: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.88rem' }}
                    >
                      <option value="10-Point Absolute Scale">10-Point Absolute Scale (UGC / AICTE Recommended)</option>
                      <option value="Relative Grading (Bell Curve)">Relative Grading (Bell Curve Standard)</option>
                      <option value="4-Point US GPA Scale">4-Point US GPA Scale</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="erp-btn erp-btn-primary">
                  <Save size={16} /> Save Configuration Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Institutional Security & Audit Trail</h3>
                  <p>Comprehensive immutable event ledger with diff tracking</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Search size={15} color="#64748b" style={{ marginRight: '6px' }} />
                    <input
                      type="text"
                      placeholder="Search actor or action..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '0.85rem', outline: 'none', width: '240px' }}
                    />
                  </div>

                  <select
                    className="erp-role-switcher-select"
                    value={auditRoleFilter}
                    onChange={(e) => setAuditRoleFilter(e.target.value)}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="HOD">HOD</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="EXAM_CELL">Exam Cell</option>
                    <option value="ACCOUNTS">Accounts</option>
                    <option value="LIBRARY">Library</option>
                    <option value="STAFF">Staff</option>
                  </select>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Actor & Role</th>
                      <th>Action</th>
                      <th>Target Resource</th>
                      <th>Old Value → New Value</th>
                      <th>IP Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                        <td>
                          <strong>{log.user}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#4f46e5', fontWeight: 600 }}>{log.role}</div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{log.action}</span></td>
                        <td style={{ color: '#334155' }}>{log.target}</td>
                        <td style={{ fontSize: '0.78rem' }}>
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>{log.oldValue}</span>
                          <span style={{ margin: '0 4px', color: '#64748b' }}>→</span>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>{log.newValue}</span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{log.ipAddress}</td>
                        <td>
                          <span style={{
                            background: log.status === 'Success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: log.status === 'Success' ? '#22c55e' : '#f87171',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>All Institutional User Accounts</h3>
                  <p>Central identity registry covering all 14 university roles</p>
                </div>
              </div>

              <div className="erp-table-responsive">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Role Category</th>
                      <th>Designated Title</th>
                      <th>Active Accounts</th>
                      <th>Primary Scope</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialRolesList.map((r) => (
                      <tr key={r.key}>
                        <td>
                          <span style={{
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: '#a5b4fc',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}>
                            {r.category}
                          </span>
                        </td>
                        <td>
                          <strong>{r.label}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Role Key: {r.key}</div>
                        </td>
                        <td><strong>{r.usersCount.toLocaleString()}</strong> Active</td>
                        <td style={{ color: '#475569' }}>{r.description}</td>
                        <td>
                          {onSwitchRole && (
                            <button
                              className="erp-btn erp-btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => onSwitchRole(r.key)}
                            >
                              Launch Portal
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP & RECOVERY */}
          {activeTab === 'backup' && (
            <div className="erp-panel">
              <div className="erp-panel-header">
                <div className="erp-panel-title">
                  <h3>Disaster Recovery & System Backups</h3>
                  <p>Enterprise data snapshots, automated schedules, and cold storage</p>
                </div>

                <button
                  className="erp-btn erp-btn-primary"
                  onClick={handleTriggerBackup}
                  disabled={backupStatus !== 'Idle'}
                >
                  <RefreshCw size={16} className={backupStatus !== 'Idle' ? 'animate-spin' : ''} />
                  {backupStatus === 'Idle' ? 'Create Instant Snapshot' : backupStatus}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Automated Cron Backups</h4>
                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    Scheduled every night at 02:00 AM IST. Retained for 90 days with point-in-time recovery.
                  </p>
                  <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
                    Active · Last executed 07 Oct, 02:00 AM
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Cloud Object Storage Vault</h4>
                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    S3 Glacier replicated storage. End-to-end encrypted with AES-256 GCM.
                  </p>
                  <span style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
                    Connected · 99.999999999% Durability
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="super_admin" />
          )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
