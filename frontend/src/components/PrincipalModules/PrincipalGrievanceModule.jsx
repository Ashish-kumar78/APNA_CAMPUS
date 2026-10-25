import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Lock,
  MessageSquare,
  Send,
  UserX,
  FileText
} from 'lucide-react';
import { INITIAL_GRIEVANCES } from './principalData.js';
import './PrincipalModules.css';

export default function PrincipalGrievanceModule({ onToast }) {
  const [grievances, setGrievances] = useState(INITIAL_GRIEVANCES);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals / Panels
  const [activeGrievance, setActiveGrievance] = useState(null);
  const [executiveDirective, setExecutiveDirective] = useState('');

  // Filtered List
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      const matchSearch =
        g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = deptFilter === 'All' || g.department.includes(deptFilter);
      const matchCat = categoryFilter === 'All' || g.category === categoryFilter;
      const matchPri = priorityFilter === 'All' || g.priority === priorityFilter;
      const matchStatus = statusFilter === 'All' || g.status.includes(statusFilter);
      return matchSearch && matchDept && matchCat && matchPri && matchStatus;
    });
  }, [grievances, searchQuery, deptFilter, categoryFilter, priorityFilter, statusFilter]);

  const escalatedCount = grievances.filter((g) => g.status.includes('Escalated')).length;
  const criticalCount = grievances.filter((g) => g.priority === 'Critical').length;

  // Handle Principal Executive Directive Submission
  const handleIssueDirective = (resolutionStatus) => {
    if (!activeGrievance) return;
    if (!executiveDirective.trim()) {
      if (onToast) onToast('Please enter your executive instructions or directive remarks.');
      return;
    }

    const targetId = activeGrievance.id;
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === targetId
          ? {
              ...g,
              status: resolutionStatus,
              executiveRemarks: `[Principal Directive · ${new Date().toLocaleDateString('en-GB')}]: ${executiveDirective.trim()}`,
            }
          : g
      )
    );

    if (onToast) onToast(`Executive Directive recorded for grievance ${targetId}!`);
    setActiveGrievance(null);
    setExecutiveDirective('');
  };

  return (
    <div className="principal-module-container">
      {/* Notice Banner */}
      <div className="principal-banner-notice danger">
        <div className="principal-banner-text">
          <Lock size={18} color="#b91c1c" />
          <span>
            <strong>Statutory Grievance Redressal Chamber (Confidential):</strong> Escalated academic, hostel, and administrative matters. Complainant identities are strictly protected per UGC regulations.
          </span>
        </div>
        <div className="principal-banner-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
          Executive Redressal Forum
        </div>
      </div>

      {/* KPI Stat Strip */}
      <div className="principal-stat-strip">
        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Escalated Grievances</span>
            <AlertTriangle size={16} color="#ef4444" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#dc2626' }}>
            {escalatedCount} Active Cases
          </div>
          <div className="principal-stat-box-sub">Requiring Principal Executive Intervention</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Critical Priority</span>
            <ShieldCheck size={16} color="#f59e0b" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#d97706' }}>
            {criticalCount} Critical
          </div>
          <div className="principal-stat-box-sub">Academic Marks &amp; Food Quality</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Mean Resolution Pace</span>
            <Clock size={16} color="#10b981" />
          </div>
          <div className="principal-stat-box-val" style={{ color: '#15803d' }}>4.2 Days</div>
          <div className="principal-stat-box-sub">Benchmark: &lt; 7 Calendar Days</div>
        </div>

        <div className="principal-stat-box">
          <div className="principal-stat-box-label">
            <span>Identity Protection</span>
            <UserX size={16} color="#8b5cf6" />
          </div>
          <div className="principal-stat-box-val">100% Anonymized</div>
          <div className="principal-stat-box-sub">Zero-Retaliation Safeguards</div>
        </div>
      </div>

      {/* Toolbar: Filters */}
      <div className="principal-toolbar">
        <div className="principal-toolbar-left">
          <div className="principal-search-bar" style={{ minWidth: '200px' }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search reference, subject, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="principal-select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Academic Evaluation">Academic Evaluation</option>
            <option value="Hostel & Dining">Hostel &amp; Dining</option>
            <option value="Campus Transport">Campus Transport</option>
            <option value="Central Library Access">Central Library Access</option>
          </select>

          <select
            className="principal-select-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Normal">Normal Priority</option>
          </select>

          <select
            className="principal-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Resolution States</option>
            <option value="Escalated">Escalated to Principal</option>
            <option value="In Progress">Inquiry in Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Grievances Table */}
      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Institutional Grievance Dossiers &amp; Escalation Ledger</h3>
            <p>Confidential representations escalated beyond departmental standing committees</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredGrievances.length} cases
          </span>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Ref ID &amp; Category</th>
                <th>Subject &amp; Representation</th>
                <th>Priority</th>
                <th>Department</th>
                <th>Submission Date</th>
                <th>Assigned Committee</th>
                <th>Status</th>
                <th>Executive Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrievances.map((grv) => (
                <tr key={grv.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{grv.id}</div>
                    <span className="pbadge slate" style={{ marginTop: 2 }}>{grv.category}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b', maxWidth: '300px' }}>
                      {grv.subject}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Lock size={11} color="#64748b" /> Complainant: <em>{grv.complainantType}</em>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`pbadge ${
                        grv.priority === 'Critical'
                          ? 'danger'
                          : grv.priority === 'High'
                          ? 'warning'
                          : 'info'
                      }`}
                    >
                      {grv.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#334155' }}>{grv.department}</td>
                  <td style={{ fontSize: '0.8rem', color: '#475569' }}>{grv.submissionDate}</td>
                  <td style={{ fontSize: '0.8rem', color: '#0f172a' }}>{grv.assignedAuthority}</td>
                  <td>
                    <span
                      className={`pbadge ${
                        grv.status.includes('Escalated')
                          ? 'danger'
                          : grv.status.includes('Resolved')
                          ? 'success'
                          : 'warning'
                      }`}
                    >
                      {grv.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="erp-btn erp-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setActiveGrievance(grv);
                        setExecutiveDirective('');
                      }}
                    >
                      <Eye size={13} /> Review Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: GRIEVANCE DETAILS & PRINCIPAL DIRECTIVE PANEL     */}
      {/* ======================================================== */}
      {activeGrievance && (
        <div className="principal-modal-overlay">
          <div className="principal-modal" style={{ maxWidth: '640px' }}>
            <div className="principal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#dc2626" />
                <h3 style={{ margin: 0 }}>Grievance Dossier: {activeGrievance.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGrievance(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="principal-modal-body">
              {/* Case Briefing */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span className="pbadge danger">{activeGrievance.priority} Priority</span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Submitted: {activeGrievance.submissionDate}</span>
                </div>
                <h4 style={{ margin: '4px 0 6px', color: '#0f172a' }}>{activeGrievance.subject}</h4>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Category: <strong>{activeGrievance.category}</strong> · Department: <strong>{activeGrievance.department}</strong>
                </div>
              </div>

              {/* Protected Description */}
              <div style={{ background: '#ffffff', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                  Representation Statement
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.6 }}>
                  {activeGrievance.description}
                </p>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.75rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
                  Inquiry Officer: <strong>{activeGrievance.assignedAuthority}</strong>
                </div>
              </div>

              {/* Existing Resolution / Remarks */}
              {activeGrievance.executiveRemarks && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: 4 }}>
                    Previous Executive Directive on Record
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e3a8a' }}>
                    {activeGrievance.executiveRemarks}
                  </p>
                </div>
              )}

              {/* Form to issue directive */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Principal Executive Directive &amp; Mandatory Remedial Order *
                </label>
                <textarea
                  rows={3}
                  placeholder="Record binding administrative directions to the committee, department HOD, or hostel warden..."
                  value={executiveDirective}
                  onChange={(e) => setExecutiveDirective(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>
            <div className="principal-modal-footer">
              <button className="erp-btn erp-btn-secondary" onClick={() => setActiveGrievance(null)}>
                Close
              </button>
              <button
                className="erp-btn erp-btn-secondary"
                style={{ color: '#0284c7' }}
                onClick={() => handleIssueDirective('Committee Inquiry in Progress')}
              >
                Remand for Inquiry
              </button>
              <button
                className="erp-btn erp-btn-primary"
                onClick={() => handleIssueDirective('Resolved')}
              >
                <CheckCircle2 size={15} /> Resolve with Directive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
