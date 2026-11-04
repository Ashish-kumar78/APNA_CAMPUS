import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  Briefcase,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Award,
  ChevronRight,
  TrendingUp,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminHumanResourcesConsole({ account }) {
  const [subTab, setSubTab] = useState('directory'); // 'directory', 'leaves', 'recruitment'
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    position: '',
    department: 'Computer Science & Engineering',
    vacancies: 1,
    minQualification: 'Ph.D. in related discipline',
    experienceYears: 5,
    applicationDeadline: '2026-12-15',
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, leaveRes, recRes] = await Promise.allSettled([
        api.getAdminHrEmployees(),
        api.getAdminHrLeaves(),
        api.getAdminHrRecruitments(),
      ]);

      if (empRes.status === 'fulfilled' && Array.isArray(empRes.value?.data)) {
        setEmployees(empRes.value.data);
      }
      if (leaveRes.status === 'fulfilled' && Array.isArray(leaveRes.value?.data)) {
        setLeaves(leaveRes.value.data);
      }
      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value?.data)) {
        setRecruitments(recRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLeaveDecision = async (decision) => {
    if (!selectedLeave) return;
    try {
      const res = await api.decideAdminHrLeave(selectedLeave.id, {
        decision,
        reason: decisionReason || (decision === 'APPROVED' ? 'Approved as per institutional entitlement' : 'Declined due to exam duty assignment'),
      });
      if (res?.data) {
        setLeaves(leaves.map(l => l.id === selectedLeave.id ? res.data : l));
        setIsLeaveModalOpen(false);
        setSelectedLeave(null);
        setDecisionReason('');
        showToast(`Leave application ${selectedLeave.id} ${decision.toLowerCase()}!`);
      }
    } catch (err) {
      alert('Error updating leave: ' + err.message);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAdminHrRecruitment(jobForm);
      if (res?.data) {
        setRecruitments([res.data, ...recruitments]);
        setIsJobModalOpen(false);
        showToast('Faculty & Staff vacancy posted!');
      }
    } catch (err) {
      alert('Error posting vacancy: ' + err.message);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.employeeId.toLowerCase().includes(search.toLowerCase()) || e.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department.toLowerCase().includes(deptFilter.toLowerCase());
    const matchRole = roleFilter === 'ALL' || e.type.toUpperCase() === roleFilter;
    return matchSearch && matchDept && matchRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981',
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="admin-view-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <UserCheck size={13} />
            Autonomous Human Capital &amp; Workforce ERP
          </div>
          <h2>Human Resources, Leave Clearances &amp; Talent Pipeline</h2>
          <p>
            Unified faculty and staff directory, leave balances and approval workflows, recruitment vacancies, and workload governance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {subTab === 'recruitment' && (
            <button className="admin-action-btn-primary" onClick={() => setIsJobModalOpen(true)}>
              <Plus size={14} /> Post Recruitment Opening
            </button>
          )}
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '8px',
      }}>
        {[
          { id: 'directory', label: 'Employee Directory', icon: Users, count: employees.length },
          { id: 'leaves', label: 'Staff Leave Approvals', icon: Clock, count: leaves.filter(l => l.status === 'PENDING').length },
          { id: 'recruitment', label: 'Talent Recruitment', icon: Briefcase, count: recruitments.length },
        ].map(t => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              <Icon size={14} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  borderRadius: '12px',
                  padding: '1px 6px',
                  fontSize: '11px',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Unified Employee Directory */}
      {subTab === 'directory' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search by name, employee ID, designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', width: '280px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px 8px', fontSize: '12px' }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="FACULTY">Faculty Only</option>
                  <option value="STAFF">Staff &amp; Operations</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Dept:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px 8px', fontSize: '12px' }}
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science (CSE)</option>
                  <option value="Electronics">Electronics (ECE)</option>
                  <option value="Administration">Administration</option>
                  <option value="Campus Operations">Campus Operations</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name &amp; Role</th>
                  <th>Designation</th>
                  <th>Department / Posting</th>
                  <th>Contact Information</th>
                  <th>Leave Balances (CL / SL / EL)</th>
                  <th>Performance Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {emp.employeeId}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{emp.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        <span className={`admin-badge ${emp.type === 'FACULTY' ? 'boys' : 'duty'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {emp.type}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{emp.designation}</td>
                    <td>
                      <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: '#475569' }}>
                      <div>✉ {emp.email}</div>
                      <div>📞 {emp.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#0f172a' }}>
                        {emp.leaveBalance?.casual || 8} CL · {emp.leaveBalance?.sick || 10} SL · {emp.leaveBalance?.earned || 15} EL
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 700, fontSize: '12px' }}>
                        ★ {emp.performanceRating || '4.8'}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${emp.status === 'Active' ? 'active' : 'inactive'}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Staff Leave Approvals */}
      {subTab === 'leaves' && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Pending Faculty &amp; Staff Leave Applications
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Review, approve, or decline employee leave requests with mandatory institutional justification.
              </p>
            </div>
            <span className="admin-badge pending">
              {leaves.filter(l => l.status === 'PENDING').length} Pending Review
            </span>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Department &amp; Designation</th>
                  <th>Leave Type</th>
                  <th>Duration &amp; Dates</th>
                  <th>Reason / Justification</th>
                  <th>Status</th>
                  <th>Decision Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td>
                      <code style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>
                        {l.id}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{l.employeeName}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{l.employeeId}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{l.designation}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{l.department}</div>
                    </td>
                    <td>
                      <span className="admin-badge duty" style={{ fontSize: '11px' }}>
                        {l.leaveType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {l.days} Days
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {l.fromDate} to {l.toDate}
                      </div>
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#334155', maxWidth: '240px' }}>
                      {l.reason}
                    </td>
                    <td>
                      <span className={`admin-badge ${l.status === 'APPROVED' ? 'active' : l.status === 'REJECTED' ? 'rejected' : 'pending'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => { setSelectedLeave(l); setIsLeaveModalOpen(true); }}
                            className="admin-action-btn-primary"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            Decide
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Decided by {l.decidedBy || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Talent Recruitment Pipeline */}
      {subTab === 'recruitment' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
          {recruitments.map(rec => (
            <div key={rec.id} className="admin-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="admin-badge boys" style={{ fontSize: '11px' }}>
                  {rec.department}
                </span>
                <span className={`admin-badge ${rec.status === 'OPEN' ? 'active' : 'pending'}`}>
                  {rec.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {rec.position}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                <div>👥 Vacancies: <strong>{rec.vacancies} Positions</strong></div>
                <div>🎓 Min Qualification: <strong>{rec.minQualification}</strong></div>
                <div>⏳ Min Experience: <strong>{rec.experienceYears} Years</strong></div>
                <div>📅 Application Deadline: <strong>{rec.applicationDeadline}</strong></div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>
                  {rec.applicantsCount || 0} Candidates Applied
                </span>
                <button
                  onClick={() => showToast(`Reviewing applicants for ${rec.id}`)}
                  className="admin-action-btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  Review Dossiers <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Decision Modal */}
      {isLeaveModalOpen && selectedLeave && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setIsLeaveModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0' }}>
              Decide Leave Application: {selectedLeave.id}
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
              Applicant: <strong>{selectedLeave.employeeName}</strong> ({selectedLeave.designation})<br />
              Duration: <strong>{selectedLeave.days} Days</strong> ({selectedLeave.fromDate} to {selectedLeave.toDate})<br />
              Reason: <em>"{selectedLeave.reason}"</em>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Administrative Remarks / Reason:
              </label>
              <textarea
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Approved as per entitlement / Alternate faculty invigilator arranged..."
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleLeaveDecision('REJECTED')}
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Decline Leave
              </button>
              <button
                type="button"
                onClick={() => handleLeaveDecision('APPROVED')}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {isJobModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div className="admin-card" style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={() => setIsJobModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px 0' }}>
              Post Recruitment Vacancy
            </h3>
            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Position Title</label>
                <input
                  type="text"
                  required
                  value={jobForm.position}
                  onChange={(e) => setJobForm({ ...jobForm, position: e.target.value })}
                  placeholder="e.g. Associate Professor in Cyber Security"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Department</label>
                <select
                  value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    value={jobForm.vacancies}
                    onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Min Experience (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={jobForm.experienceYears}
                    onChange={(e) => setJobForm({ ...jobForm, experienceYears: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Minimum Qualification</label>
                <input
                  type="text"
                  value={jobForm.minQualification}
                  onChange={(e) => setJobForm({ ...jobForm, minQualification: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Application Deadline</label>
                <input
                  type="date"
                  value={jobForm.applicationDeadline}
                  onChange={(e) => setJobForm({ ...jobForm, applicationDeadline: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                >
                  Post Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

