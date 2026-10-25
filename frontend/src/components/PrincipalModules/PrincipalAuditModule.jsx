import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  Search,
  Filter,
  Eye,
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Printer,
  History,
  Activity
} from 'lucide-react';
import { INITIAL_AUDIT_LOGS } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalAuditModule({ onToast }) {
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMod = moduleFilter === 'All' || l.module.includes(moduleFilter);
      const matchAct = actionTypeFilter === 'All' || l.actionType === actionTypeFilter;
      return matchSearch && matchMod && matchAct;
    });
  }, [logs, searchQuery, moduleFilter, actionTypeFilter]);

  return (
    <div className="principal-module-container">
      {/* Notice Banner */}
      <div className="principal-banner-notice">
        <div className="principal-banner-text">
          <History size={18} color="#0284c7" />
          <span>
            <strong>Simulated Statutory Administrative Audit Trail (Read-Only):</strong> Immutable chronological log of Principal approvals, gazette authorizations, circular broadcasts, and capital requisitions.
          </span>
        </div>
        <div className="principal-banner-badge">System Protocol v4.8</div>
      </div>

      {/* KPI Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Logged Administrative Transactions</span>
            <Activity size={16} color="#0284c7" />
          </div>
          <div className="principal-stat-box-val">{logs.length} Entries</div>
          <div className="principal-stat-box-sub">Current Autonomous Semester Session</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Executive Approvals</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>
            {logs.filter((l) => l.actionType === 'EXECUTIVE_APPROVAL' || l.actionType === 'RESULT_SUBMISSION').length} Records
          </div>
          <div className="principal-stat-box-sub">Principal Secretariat Directives</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>System Integrity</span>
            <ShieldCheck size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">Verified SHA-256</div>
          <div className="principal-stat-box-sub">Read-Only Cryptographic Checksums</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Active Campus Subnets</span>
            <Lock size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val">6 Subnets</div>
          <div className="principal-stat-box-sub">Principal, CoE, Accounts, Departments</div>
        </div>
      </div>

      {/* Toolbar: Search, Filters */}
      <div className="principal-toolbar">
        <div className="principal-toolbar-left">
          <div className="principal-search-bar" style={{ minWidth: '220px' }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search actor, action, or target entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="principal-select-filter"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="All">All Functional Modules</option>
            <option value="Leave Approvals">Leave Approvals</option>
            <option value="Examination">Examination Oversight</option>
            <option value="Circulars">Official Circulars</option>
            <option value="Finance">Finance Oversight</option>
            <option value="Timetable">Timetables &amp; Approval</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Accreditation">Accreditation</option>
          </select>

          <select
            className="principal-select-filter"
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
          >
            <option value="All">All Action Types</option>
            <option value="EXECUTIVE_APPROVAL">EXECUTIVE_APPROVAL</option>
            <option value="RESULT_SUBMISSION">RESULT_SUBMISSION</option>
            <option value="CIRCULAR_PUBLISHED">CIRCULAR_PUBLISHED</option>
            <option value="BUDGET_REQUISITION">BUDGET_REQUISITION</option>
            <option value="TIMETABLE_SUBMISSION">TIMETABLE_SUBMISSION</option>
            <option value="MAINTENANCE_LOGGED">MAINTENANCE_LOGGED</option>
            <option value="COMPLIANCE_UPDATE">COMPLIANCE_UPDATE</option>
          </select>
        </div>

        <div className="principal-toolbar-right">
          <button className="erp-btn erp-btn-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* Main Audit Trail Table */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Administrative Activity Audit Trail</h3>
            <p>Read-only institutional audit ledger tracking high-level statutory decisions and transactions</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredLogs.length} events
          </span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Timestamp &amp; Event ID</th>
                <th>Action Type</th>
                <th>Actor &amp; Institutional Role</th>
                <th>Affected Module</th>
                <th>Target / Subject</th>
                <th>Network IP / Subnet</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.timestamp}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.id}</div>
                  </td>
                  <td>
                    <span className="pbadge slate">{log.actionType}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.actor}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{log.role}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#334155' }}>{log.module}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b', maxWidth: '240px' }}>
                      {log.target}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                      {log.ipAddress}
                    </span>
                  </td>
                  <td>
                    <span className="pbadge success">{log.status}</span>
                  </td>
                  <td>
                    <button
                      className="erp-btn erp-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye size={13} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: AUDIT RECORD INSPECTION PANEL                     */}
      {/* ======================================================== */}
      {selectedLog && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '580px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Audit Entry: {selectedLog.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="pbadge slate">{selectedLog.actionType}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{selectedLog.timestamp}</span>
                </div>
                <h4 style={{ margin: '4px 0 6px', color: '#0f172a' }}>{selectedLog.target}</h4>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Module: <strong>{selectedLog.module}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Executing Actor</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedLog.actor}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{selectedLog.role}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <small style={{ color: '#64748b' }}>Originating Subnet</small>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{selectedLog.ipAddress}</div>
                  <div style={{ fontSize: '0.74rem', color: '#15803d' }}>Verified Internal Network</div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                  Transaction Payload Details
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {selectedLog.details}
                </p>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.75rem', textAlign: 'center' }}>
                🔒 Statutory Read-Only Record. Cryptographic Hash: <code style={{ color: '#0284c7' }}>SHA256:7f83b1657ff...</code>
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
