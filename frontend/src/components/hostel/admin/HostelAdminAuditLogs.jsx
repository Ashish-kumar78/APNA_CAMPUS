import React, { useState, useMemo } from 'react';
import {
  FileText, Search, Filter, Download, RotateCcw, Calendar,
  ShieldCheck, Eye, X, CheckCircle2, User
} from 'lucide-react';
import './HostelAdminDashboard.css';

import { getAllAuditLogs } from '../../../services/wardenManagementStore.js';

export default function HostelAdminAuditLogs({ showToast }) {
  const [logs, setLogs] = useState(() => getAllAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');

  // Modal inspection of diff
  const [selectedLog, setSelectedLog] = useState(null);

  const reloadLogs = () => {
    setLogs(getAllAuditLogs());
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchSearch =
        l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.actingUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.targetEntity.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
      const matchScope = scopeFilter === 'ALL' || l.hostelScope === scopeFilter;

      return matchSearch && matchAction && matchScope;
    });
  }, [logs, searchTerm, actionFilter, scopeFilter]);

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Acting User', 'Role', 'Action', 'Entity', 'Record ID', 'Hostel Scope', 'Reason', 'Outcome'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.actingUser}"`,
      l.actingRole,
      l.action,
      l.targetEntity,
      l.recordId,
      `"${l.hostelScope}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      l.outcome
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hostel_admin_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('✓ Official Audit Log exported to CSV.');
  };

  return (
    <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            Hostel Administration Official Audit Logs
            <span className="had-title-badge">Tamper-Evident</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Immutable chronological register of all administrative overrides, policy revisions, warden reassignments, and sanctions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="had-btn had-btn-secondary" onClick={reloadLogs}>
            <RotateCcw size={14} /> Refresh Logs
          </button>
          <button className="had-btn had-btn-primary" onClick={handleExportCSV}>
            <Download size={14} /> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="had-filter-bar">
        <div className="wm-search-box" style={{ width: '320px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search actor, record ID, entity, reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="had-filter-group">
          <Filter size={15} color="#7c3aed" />
          <span>Action Type:</span>
          <select className="had-filter-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="ALL">All Administrative Actions</option>
            <option value="POLICY_UPDATE">Policy Updates</option>
            <option value="WARDEN_REASSIGN">Warden Reassignment</option>
            <option value="WARDEN_PERMISSIONS_UPDATE">Permissions Update</option>
            <option value="ATTENDANCE_CORRECTION">Attendance Correction</option>
            <option value="ATTENDANCE_RECORD_OVERRIDE">Record Override</option>
            <option value="INVENTORY_APPROVAL">Inventory Approval</option>
            <option value="ADMIN_APPROVE">Admin Approvals</option>
            <option value="ADMIN_REJECT">Admin Rejections</option>
          </select>
        </div>

        <div className="had-filter-group">
          <span>Hostel Scope:</span>
          <select className="had-filter-select" value={scopeFilter} onChange={e => setScopeFilter(e.target.value)}>
            <option value="ALL">All Scopes</option>
            <option value="Gandhi Boys Residence">Gandhi Boys Residence</option>
            <option value="Sarojini Girls Residence">Sarojini Girls Residence</option>
            <option value="Bhabani Hostel-1">Bhabani Hostel-1</option>
            <option value="Bhabani Hostel-2">Bhabani Hostel-2</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="had-table">
          <thead>
            <tr>
              <th>Timestamp &amp; Ref</th>
              <th>Acting Administrator</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Scope</th>
              <th>Mandatory Reason</th>
              <th>Diff / Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(l => (
              <tr key={l.id}>
                <td>
                  <strong>{l.timestamp}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{l.id}</div>
                </td>
                <td>
                  <strong>{l.actingUser}</strong>
                  <div style={{ fontSize: '0.7rem', color: '#7c3aed' }}>{l.actingRole}</div>
                </td>
                <td>
                  <span className="had-badge info">{l.action}</span>
                </td>
                <td>
                  <strong>{l.recordId}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{l.targetEntity}</div>
                </td>
                <td>{l.hostelScope}</td>
                <td style={{ maxWidth: '300px', fontSize: '0.78rem' }}>
                  {l.reason}
                </td>
                <td>
                  <button
                    className="had-btn had-btn-secondary"
                    style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                    onClick={() => setSelectedLog(l)}
                  >
                    <Eye size={12} /> View Diff
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DIFF INSPECTOR MODAL */}
      {selectedLog && (
        <div className="wm-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="wm-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="wm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
                  Audit Event Record: {selectedLog.id}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Recorded at {selectedLog.timestamp} by {selectedLog.actingUser}
                </span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedLog(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="wm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.825rem' }}>
                <div><strong>Action:</strong> <span className="had-badge info">{selectedLog.action}</span></div>
                <div><strong>Outcome:</strong> <span className="had-badge success">{selectedLog.outcome}</span></div>
                <div><strong>Entity:</strong> {selectedLog.targetEntity}</div>
                <div><strong>Record ID:</strong> {selectedLog.recordId}</div>
                <div><strong>Scope:</strong> {selectedLog.hostelScope}</div>
                <div><strong>Acting Role:</strong> {selectedLog.actingRole}</div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.825rem', color: '#dc2626' }}>Previous State / Original Value:</strong>
                <pre style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '0.65rem', borderRadius: '6px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', margin: '0.35rem 0 0 0' }}>
                  {selectedLog.previousValue || '(None / Created)'}
                </pre>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.825rem', color: '#059669' }}>New State / Updated Value:</strong>
                <pre style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '0.65rem', borderRadius: '6px', fontSize: '0.75rem', whiteSpace: 'pre-wrap', margin: '0.35rem 0 0 0' }}>
                  {selectedLog.newValue}
                </pre>
              </div>

              <div>
                <strong style={{ fontSize: '0.825rem', color: '#1e293b' }}>Mandatory Administrative Justification:</strong>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem', borderRadius: '6px', fontSize: '0.8rem', marginTop: '0.35rem', color: '#334155' }}>
                  {selectedLog.reason}
                </div>
              </div>
            </div>
            <div className="wm-modal-footer">
              <button
                className="had-btn had-btn-secondary"
                onClick={() => setSelectedLog(null)}
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

