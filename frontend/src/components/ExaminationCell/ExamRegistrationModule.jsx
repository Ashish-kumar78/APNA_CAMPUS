import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  ShieldAlert,
  UserCheck,
  FileText,
  DollarSign,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function ExamRegistrationModule({ triggerToast }) {
  const [activeSubTab, setActiveSubTab] = useState('applications'); // 'applications' | 'eligibility' | 'debarments'
  const [registrations, setRegistrations] = useState(() => examinationStore.getRegistrations());
  const [debarments, setDebarments] = useState(() => examinationStore.getDebarments());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [condoneModal, setCondoneModal] = useState(null);
  const [newDebarModal, setNewDebarModal] = useState(false);
  const [debarForm, setDebarForm] = useState({
    rollNumber: '',
    regNo: '',
    name: '',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    reason: '',
    debarredPapers: 'CS501, CS502',
    orderNo: `GIFT/COE/DEBAR/2026/${Math.floor(20 + Math.random() * 80)}`,
  });

  // Filtered applications
  const filteredApps = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [registrations, searchQuery, categoryFilter, statusFilter]);

  // Handlers
  const handleApprove = (id, e) => {
    e?.stopPropagation();
    const updated = examinationStore.updateRegistrationStatus(id, 'Approved', 'Clearance verified by Controller Office');
    setRegistrations([...examinationStore.getRegistrations()]);
    if (selectedApp?.id === id) setSelectedApp(updated);
    triggerToast(`Application ${id} approved successfully.`);
  };

  const handleReject = (id, reason = 'Inadequate Attendance / Clearance Pending') => {
    const updated = examinationStore.updateRegistrationStatus(id, 'Rejected', reason);
    setRegistrations([...examinationStore.getRegistrations()]);
    if (selectedApp?.id === id) setSelectedApp(updated);
    triggerToast(`Application ${id} rejected.`);
  };

  const handleCondone = (e) => {
    e.preventDefault();
    if (!condoneModal) return;
    const updated = examinationStore.updateRegistrationStatus(
      condoneModal.id,
      'Conditionally Approved',
      `CoE Condonation granted on appeal: ${e.target.reason.value}`
    );
    setRegistrations([...examinationStore.getRegistrations()]);
    setCondoneModal(null);
    triggerToast(`CoE Attendance Condonation granted for ${updated.name}.`);
  };

  const handleCreateDebarment = (e) => {
    e.preventDefault();
    if (!debarForm.name || !debarForm.rollNumber) return;
    const newRecord = examinationStore.addDebarment({
      ...debarForm,
      debarredPapers: debarForm.debarredPapers.split(',').map(s => s.trim()),
    });
    setDebarments([...examinationStore.getDebarments()]);
    setNewDebarModal(false);
    triggerToast(`Debarment order ${newRecord.orderNo} recorded.`);
  };

  const handleRevokeDebarment = (id) => {
    examinationStore.revokeDebarment(id, 'Debarment period served / Academic council review');
    setDebarments([...examinationStore.getDebarments()]);
    triggerToast(`Debarment order ${id} revoked.`);
  };

  // Export
  const handleExportCsv = () => {
    const rows = filteredApps.map(r => ({
      ID: r.id,
      Roll: r.rollNumber,
      RegNo: r.regNo,
      Name: r.name,
      Course: r.course,
      Branch: r.branch,
      Semester: r.semester,
      Category: r.category,
      FeeStatus: r.feeStatus,
      FeeAmount: r.feeAmount,
      Status: r.status,
      Remarks: r.remarks
    }));
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent = keys.join(separator) + '\n' +
      rows.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(separator)).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Examination_Registrations_Roster.csv';
    link.click();
    triggerToast('Registration roster exported to CSV.');
  };

  // Stats
  const totalApps = registrations.length;
  const approvedCount = registrations.filter(r => r.status === 'Approved' || r.status === 'Conditionally Approved').length;
  const pendingCount = registrations.filter(r => r.status === 'Pending Verification').length;
  const rejectedCount = registrations.filter(r => r.status === 'Rejected').length;
  const backlogCount = registrations.filter(r => r.category === 'Backlog' || r.category === 'Supplementary').length;

  return (
    <div>
      {/* Sub-tabs header */}
      <div className="coe-subtabs-bar">
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('applications')}
        >
          <UserCheck size={16} />
          <span>Student Exam Applications</span>
          <span className="coe-subtab-badge">{totalApps}</span>
        </button>
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'eligibility' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('eligibility')}
        >
          <CheckCircle size={16} />
          <span>Subject-Wise Eligibility & Vetting</span>
          <span className="coe-subtab-badge">{approvedCount} Cleared</span>
        </button>
        <button
          type="button"
          className={`coe-subtab-btn ${activeSubTab === 'debarments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('debarments')}
        >
          <ShieldAlert size={16} />
          <span>Debarment Records & History</span>
          <span className="coe-subtab-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>{debarments.length}</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="erp-stats-grid">
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Total Applications</span>
            <Users size={18} color="#7c3aed" />
          </div>
          <div className="erp-stat-val">{totalApps}</div>
          <div className="erp-stat-note">Regular &amp; Arrear examinees</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Approved &amp; Cleared</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div className="erp-stat-val" style={{ color: '#16a34a' }}>{approvedCount}</div>
          <div className="erp-stat-note">{Math.round((approvedCount / totalApps) * 100)}% Clearance rate</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Pending Verification</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div className="erp-stat-val" style={{ color: '#d97706' }}>{pendingCount}</div>
          <div className="erp-stat-note">Accounts fee &amp; doc check</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Debarred / Ineligible</span>
            <ShieldAlert size={18} color="#dc2626" />
          </div>
          <div className="erp-stat-val" style={{ color: '#dc2626' }}>{debarments.length + rejectedCount}</div>
          <div className="erp-stat-note">Attendance shortage or disciplinary</div>
        </div>
      </div>

      {/* TAB 1: APPLICATIONS LIST */}
      {activeSubTab === 'applications' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Autonomous Examination Registration Desk</h3>
              <p>Verify candidate applications, category enrollment, fee clearance, and authorize hall ticket clearance</p>
            </div>
            <div className="erp-panel-actions">
              <button className="erp-btn erp-btn-secondary" onClick={handleExportCsv}>
                <FileSpreadsheet size={15} /> Export Roster CSV
              </button>
            </div>
          </div>

          <div className="exam-toolbar">
            <div className="exam-search-box">
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search candidate by name, roll no, reg no, branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="exam-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Regular">Regular Examination</option>
              <option value="Backlog">Backlog / Arrear</option>
              <option value="Supplementary">Special Supplementary</option>
            </select>
            <select
              className="exam-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Conditionally Approved">Conditionally Approved</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Application ID &amp; Candidate</th>
                  <th>Reg No &amp; Branch</th>
                  <th>Category &amp; Semester</th>
                  <th>Papers Enrolled</th>
                  <th>Exam Fee Status</th>
                  <th>Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Roll: <strong>{app.rollNumber}</strong> · <code>{app.id}</code>
                      </div>
                    </td>
                    <td>
                      <div><code>{app.regNo}</code></div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{app.branch}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: app.category === 'Regular' ? '#ede9fe' : app.category === 'Backlog' ? '#fee2e2' : '#fef3c7',
                        color: app.category === 'Regular' ? '#6d28d9' : app.category === 'Backlog' ? '#b91c1c' : '#b45309',
                      }}>
                        {app.category}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>{app.semester}</div>
                    </td>
                    <td>
                      <strong>{app.subjects.length} Papers</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.totalCredits} Total Credits</div>
                    </td>
                    <td>
                      <span style={{
                        color: app.feeStatus === 'Paid' ? '#16a34a' : '#dc2626',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        {app.feeStatus === 'Paid' ? `✓ Paid (₹${app.feeAmount})` : `⚠ Pending (₹${app.feeAmount})`}
                      </span>
                      {app.transactionId && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{app.transactionId}</div>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${
                        app.status === 'Approved' ? 'success' :
                        app.status === 'Conditionally Approved' ? 'info' :
                        app.status === 'Rejected' ? 'danger' : 'warning'
                      }`}>
                        {app.status}
                      </span>
                      {app.approvedBy && (
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>{app.approvedBy}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="erp-btn erp-btn-outline erp-btn-sm"
                          onClick={() => setSelectedApp(app)}
                          title="View Application Details"
                        >
                          <Eye size={13} /> View
                        </button>
                        {app.status === 'Pending Verification' && (
                          <>
                            <button
                              className="erp-btn erp-btn-success erp-btn-sm"
                              onClick={(e) => handleApprove(app.id, e)}
                              title="Approve Exam Registration"
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              className="erp-btn erp-btn-danger erp-btn-sm"
                              onClick={() => handleReject(app.id)}
                              title="Reject Registration"
                            >
                              <X size={13} />
                            </button>
                          </>
                        )}
                        {app.status === 'Rejected' && (
                          <button
                            className="erp-btn erp-btn-secondary erp-btn-sm"
                            onClick={() => setCondoneModal(app)}
                            title="Review Ineligible Case / Grant Condonation"
                          >
                            <Sparkles size={13} /> Review Appeal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT-WISE ELIGIBILITY & VETTING */}
      {activeSubTab === 'eligibility' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Subject-Wise Attendance &amp; Continuous Evaluation Vetting</h3>
              <p>Autonomous statutory criteria: Attendance &ge; 75% and Continuous Internal Evaluation (CIE) &ge; 40% (8/20)</p>
            </div>
            <div className="erp-panel-actions">
              <span className="status-pill success">
                <CheckCircle size={13} /> Strict AICTE/UGC Rules Applied
              </span>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Candidate &amp; Roll</th>
                  <th>Course &amp; Semester</th>
                  <th>Paper Breakdown &amp; Attendance</th>
                  <th>Internal Assessment (IA)</th>
                  <th>Overall Eligibility</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(app => {
                  const minAtt = Math.min(...app.subjects.map(s => s.attendance));
                  const avgAtt = Math.round(app.subjects.reduce((sum, s) => sum + s.attendance, 0) / app.subjects.length);
                  const isEligible = minAtt >= 75 && app.feeStatus === 'Paid';

                  return (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.name}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Roll {app.rollNumber} · <code>{app.regNo}</code></div>
                      </td>
                      <td>
                        <div>{app.course} - {app.branch}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.semester}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ fontSize: '0.78rem' }}>
                            Aggregate Attendance: <strong style={{ color: avgAtt >= 75 ? '#16a34a' : '#dc2626' }}>{avgAtt}%</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {app.subjects.map(s => (
                              <span
                                key={s.code}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  background: s.attendance >= 75 ? '#f0fdf4' : '#fef2f2',
                                  color: s.attendance >= 75 ? '#166534' : '#991b1b',
                                  border: `1px solid ${s.attendance >= 75 ? '#bbf7d0' : '#fecaca'}`
                                }}
                                title={`${s.name}: ${s.attendance}% Attendance, IA Score ${s.iaScore}`}
                              >
                                {s.code}: {s.attendance}%
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                          {app.subjects.every(s => s.iaScore >= 8) ? '✓ All Subjects &ge; 40%' : '⚠ Deficit in 1+ subjects'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${isEligible ? 'success' : 'danger'}`}>
                          {isEligible ? 'Eligible for Hall Ticket' : 'Detained / Ineligible'}
                        </span>
                      </td>
                      <td>
                        {!isEligible && (
                          <button
                            className="erp-btn erp-btn-secondary erp-btn-sm"
                            onClick={() => setCondoneModal(app)}
                          >
                            <Sparkles size={13} /> CoE Review
                          </button>
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

      {/* TAB 3: DEBARMENT RECORDS */}
      {activeSubTab === 'debarments' && (
        <div className="erp-panel">
          <div className="erp-panel-header">
            <div className="erp-panel-title">
              <h3>Statutory Debarment &amp; Disciplinary Records Registry</h3>
              <p>Official records of candidates disqualified from sitting in autonomous examinations</p>
            </div>
            <div className="erp-panel-actions">
              <button className="erp-btn erp-btn-danger" onClick={() => setNewDebarModal(true)}>
                <ShieldAlert size={15} /> Issue New Debarment Order
              </button>
            </div>
          </div>

          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Order No &amp; Date</th>
                  <th>Candidate &amp; Roll</th>
                  <th>Department &amp; Sem</th>
                  <th>Debarment Reason</th>
                  <th>Debarred Papers</th>
                  <th>Status &amp; Appeal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {debarments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong style={{ color: '#dc2626' }}>{d.orderNo}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Date: {d.orderDate}</div>
                    </td>
                    <td>
                      <strong>{d.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Roll: {d.rollNumber} · <code>{d.regNo}</code></div>
                    </td>
                    <td>
                      <div>{d.department}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{d.semester}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>
                        {d.reason}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {d.debarredPapers.map(p => (
                          <span key={p} style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${d.status.includes('Active') ? 'danger' : 'success'}`}>
                        {d.status}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{d.appealStatus}</div>
                    </td>
                    <td>
                      {d.status.includes('Active') && (
                        <button
                          className="erp-btn erp-btn-outline erp-btn-sm"
                          onClick={() => handleRevokeDebarment(d.id)}
                          title="Revoke debarment order upon appeal clearance"
                        >
                          Revoke Order
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

      {/* MODAL 1: VIEW APPLICATION DETAILS */}
      {selectedApp && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Examination Application Dossier</h3>
                <p>Application ID: <code>{selectedApp.id}</code> · {selectedApp.name}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <div><strong>Candidate:</strong> {selectedApp.name}</div>
                <div><strong>Roll Number:</strong> {selectedApp.rollNumber}</div>
                <div><strong>Reg No:</strong> <code>{selectedApp.regNo}</code></div>
                <div><strong>Program:</strong> {selectedApp.course} ({selectedApp.branch})</div>
                <div><strong>Semester:</strong> {selectedApp.semester}</div>
                <div><strong>Category:</strong> <span style={{ fontWeight: 700, color: '#7c3aed' }}>{selectedApp.category}</span></div>
                <div><strong>Fee Status:</strong> <span style={{ color: selectedApp.feeStatus === 'Paid' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{selectedApp.feeStatus} (₹{selectedApp.feeAmount})</span></div>
                <div><strong>Transaction:</strong> <code>{selectedApp.transactionId || 'N/A'}</code></div>
                <div><strong>Application Date:</strong> {selectedApp.applicationDate}</div>
              </div>

              <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 10px' }}>REGISTERED SUBJECTS &amp; ELIGIBILITY VETTING</h4>
              <table className="erp-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Paper Code</th>
                    <th>Course Title</th>
                    <th>Type</th>
                    <th>Credits</th>
                    <th>Attendance</th>
                    <th>IA Score (Max 20)</th>
                    <th>Eligibility Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedApp.subjects.map(s => (
                    <tr key={s.code}>
                      <td><code>{s.code}</code></td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.type}</td>
                      <td>{s.credits}</td>
                      <td>
                        <strong style={{ color: s.attendance >= 75 ? '#16a34a' : '#dc2626' }}>
                          {s.attendance}%
                        </strong>
                      </td>
                      <td><strong>{s.iaScore}</strong></td>
                      <td>
                        <span className={`status-pill ${s.attendance >= 75 ? 'success' : 'danger'}`}>
                          {s.attendance >= 75 ? 'Cleared' : 'Detained'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
                <strong>CoE Office Remarks:</strong> {selectedApp.remarks || 'No remarks recorded.'}
              </div>
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setSelectedApp(null)}>
                Close
              </button>
              {selectedApp.status === 'Pending Verification' && (
                <>
                  <button
                    type="button"
                    className="erp-btn erp-btn-danger"
                    onClick={() => { handleReject(selectedApp.id); setSelectedApp(null); }}
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    className="erp-btn erp-btn-primary"
                    onClick={() => { handleApprove(selectedApp.id); setSelectedApp(null); }}
                  >
                    <Check size={14} /> Authorize &amp; Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONDONATION REVIEW */}
      {condoneModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>CoE Attendance Condonation Council Review</h3>
                <p>Candidate: {condoneModal.name} (Roll {condoneModal.rollNumber})</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setCondoneModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCondone}>
              <div className="exam-modal-body">
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px' }}>
                  <p style={{ margin: 0 }}>
                    As per Autonomous College Regulation 4.2(b), the Controller of Examinations and Academic Council may grant attendance condonation up to 10% (i.e. down to 65%) for genuine medical emergencies or state/national sports participation.
                  </p>
                </div>
                <div className="exam-form-grid">
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Condonation Basis &amp; Document Ref *</label>
                    <textarea
                      name="reason"
                      rows={3}
                      className="exam-form-textarea"
                      required
                      placeholder="e.g. Hospitalization medical certificate #MED-9921 from Capital Hospital verified by college medical officer."
                      defaultValue="Genuine medical hospitalization with verified discharge summary and medical board clearance."
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Condonation Fee (₹)</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      defaultValue={500}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setCondoneModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Sparkles size={14} /> Grant Official Condonation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW DEBARMENT ORDER */}
      {newDebarModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Issue Statutory Debarment Order</h3>
                <p>Formal disqualification from Autonomous Examination</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setNewDebarModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateDebarment}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Student Roll Number *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. 15"
                      value={debarForm.rollNumber}
                      onChange={(e) => setDebarForm({ ...debarForm, rollNumber: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Registration Number *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. 2305201015"
                      value={debarForm.regNo}
                      onChange={(e) => setDebarForm({ ...debarForm, regNo: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Candidate Name *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={debarForm.name}
                      onChange={(e) => setDebarForm({ ...debarForm, name: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Debarment Grounds / Reason *</label>
                    <textarea
                      rows={2}
                      className="exam-form-textarea"
                      required
                      placeholder="e.g. Severe attendance shortage below 60% without medical justification."
                      value={debarForm.reason}
                      onChange={(e) => setDebarForm({ ...debarForm, reason: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Debarred Papers (Comma separated) *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="CS501, CS502"
                      value={debarForm.debarredPapers}
                      onChange={(e) => setDebarForm({ ...debarForm, debarredPapers: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewDebarModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-danger">
                  <ShieldAlert size={14} /> Seal &amp; Execute Debarment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
