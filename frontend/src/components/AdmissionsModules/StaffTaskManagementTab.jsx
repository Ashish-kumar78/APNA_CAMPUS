import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  FileCheck2,
  X,
  Send,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

export default function StaffTaskManagementTab({
  staff = [],
  onAssignTask,
}) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    staffId: staff[0]?.id || '',
    taskName: '',
    priority: 'Normal',
    dueDate: '2026-10-28',
    instructions: '',
  });

  const totalAssignedTasks = staff.reduce((acc, s) => acc + (s.assignedTasks || 0), 0);
  const totalCompletedTasks = staff.reduce((acc, s) => acc + (s.completedTasks || 0), 0);
  const totalAppsUnderReview = staff.reduce((acc, s) => acc + (s.appsUnderReview || 0), 0);
  const totalPendingVerifications = staff.reduce((acc, s) => acc + (s.pendingVerifications || 0), 0);

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.taskName.trim()) return;
    onAssignTask && onAssignTask(taskForm.staffId, taskForm.taskName.trim());
    alert(`Task '${taskForm.taskName}' successfully delegated!`);
    setIsTaskModalOpen(false);
    setTaskForm({
      staffId: staff[0]?.id || '',
      taskName: '',
      priority: 'Normal',
      dueDate: '2026-10-28',
      instructions: '',
    });
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Admission Staff Workload &amp; Task Delegation
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Monitor scrutiny officer throughput, assign verification batches, balance workloads, and track departmental deliverables.
          </p>
        </div>
        <button
          type="button"
          className="adm-btn-primary"
          onClick={() => setIsTaskModalOpen(true)}
        >
          <Plus size={15} /> Delegate Scrutiny Task
        </button>
      </div>

      {/* Aggregate KPI */}
      <div className="adm-kpi-grid">
        <div className="adm-kpi-card blue">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Active Staff Officers</span>
            <div className="adm-kpi-icon-wrap"><Users size={16} color="#0284c7" /></div>
          </div>
          <div className="adm-kpi-value">{staff.length}</div>
          <div className="adm-kpi-foot">Central Directorate panel</div>
        </div>

        <div className="adm-kpi-card amber">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Apps Under Review</span>
            <div className="adm-kpi-icon-wrap"><Clock size={16} color="#d97706" /></div>
          </div>
          <div className="adm-kpi-value">{totalAppsUnderReview}</div>
          <div className="adm-kpi-foot">Assigned to staff desks</div>
        </div>

        <div className="adm-kpi-card teal">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Pending Verifications</span>
            <div className="adm-kpi-icon-wrap"><FileCheck2 size={16} color="#0d9488" /></div>
          </div>
          <div className="adm-kpi-value">{totalPendingVerifications}</div>
          <div className="adm-kpi-foot">Dossier check in progress</div>
        </div>

        <div className="adm-kpi-card green">
          <div className="adm-kpi-header">
            <span className="adm-kpi-label">Completed Deliverables</span>
            <div className="adm-kpi-icon-wrap"><CheckCircle2 size={16} color="#059669" /></div>
          </div>
          <div className="adm-kpi-value">{totalCompletedTasks}</div>
          <div className="adm-kpi-foot">Processed this session</div>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="adm-panel-box">
        <div className="adm-panel-header">
          <div>
            <h3 className="adm-panel-title">
              <Briefcase size={18} color="#0284c7" /> Staff Workload Summary &amp; Capacity Indicators
            </h3>
            <p className="adm-panel-desc">Individual officer assignments and current pipeline workload capacity</p>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-data-table">
            <thead>
              <tr>
                <th>Officer Legal Name</th>
                <th>Designation &amp; Role</th>
                <th>Contact &amp; Extension</th>
                <th>Active Tasks</th>
                <th>Under Review</th>
                <th>Pending Verifications</th>
                <th>Completed</th>
                <th>Workload Utilization</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => {
                const workloadColor =
                  s.workload >= 90 ? '#e11d48' : s.workload >= 75 ? '#d97706' : '#059669';

                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {s.id}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{s.designation}</div>
                      <span className="adm-badge-pill dark" style={{ fontSize: '0.66rem', marginTop: '2px' }}>
                        {s.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.76rem', color: '#475569' }}>
                      <div>{s.email}</div>
                      <div style={{ fontSize: '0.71rem', color: '#64748b' }}>{s.phone}</div>
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center', color: '#0284c7' }}>
                      {s.assignedTasks} Tasks
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center', color: '#d97706' }}>
                      {s.appsUnderReview} Dossiers
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'center', color: '#0d9488' }}>
                      {s.pendingVerifications} Files
                    </td>
                    <td style={{ fontWeight: 800, textAlign: 'center', color: '#059669' }}>
                      {s.completedTasks}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '7px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${s.workload}%`,
                              background: workloadColor,
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: workloadColor, minWidth: '34px' }}>
                          {s.workload}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELEGATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsTaskModalOpen(false)}>
          <div className="adm-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Delegate Admission Scrutiny / Verification Task
              </h3>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit}>
              <div className="adm-modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Assign To Officer *
                  </label>
                  <select
                    className="adm-select-control"
                    style={{ width: '100%' }}
                    value={taskForm.staffId}
                    onChange={(e) => setTaskForm({ ...taskForm, staffId: e.target.value })}
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.designation} · Current Workload: {s.workload}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Task Title / Deliverable Description *
                  </label>
                  <input
                    type="text"
                    required
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={taskForm.taskName}
                    onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                    placeholder="e.g. Scrutinize 50 CSE Round 2 OJEE Rank Cards"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                      Priority Level *
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    >
                      <option value="Urgent">Urgent (Within 24 Hours)</option>
                      <option value="Normal">Normal (Standard Scrutiny Queue)</option>
                      <option value="Low">Low (Administrative Archiving)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '6px' }}>
                    Special Verification Instructions
                  </label>
                  <textarea
                    rows={3}
                    className="adm-search-input"
                    style={{ padding: '10px', resize: 'vertical' }}
                    value={taskForm.instructions}
                    onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                    placeholder="e.g. Please verify that caste certificate is issued by an officer not below the rank of Tehsildar..."
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  <Send size={14} /> Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
