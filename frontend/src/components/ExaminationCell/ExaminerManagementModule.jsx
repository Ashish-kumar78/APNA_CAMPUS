import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Plus,
  DollarSign,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  Award,
  Mail,
  Phone,
  Building2,
  Send
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function ExaminerManagementModule({ triggerToast }) {
  const [examiners, setExaminers] = useState(() => examinationStore.getExaminers());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newExaminerModal, setNewExaminerModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'External',
    institution: '',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
    specialization: '',
    phone: '',
    email: '',
    remunerationRate: 40,
  });

  const filteredExaminers = useMemo(() => {
    return examiners.filter(e => {
      const matchSearch =
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [examiners, searchQuery, typeFilter]);

  const handleAddExaminer = (e) => {
    e.preventDefault();
    if (!form.name || !form.institution) return;
    const newExm = {
      id: `EXM-00${examiners.length + 1}`,
      ...form,
      experienceYears: 12,
      assignedBooklets: 0,
      evaluatedBooklets: 0,
      pendingBooklets: 0,
      turnaroundDays: 0,
      totalRemuneration: 0,
      paymentStatus: 'Awaiting Evaluation Assignment',
    };
    examiners.push(newExm);
    setExaminers([...examiners]);
    setNewExaminerModal(false);
    triggerToast(`Examiner ${newExm.name} inducted into CoE Autonomous Panel.`);
  };

  const handleSendReminder = (exm) => {
    triggerToast(`Evaluation status notification email dispatched to ${exm.email}`);
  };

  return (
    <div>
      {/* KPI Overview */}
      <div className="erp-stats-grid">
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Approved Examiners</span>
            <Users size={18} color="#7c3aed" />
          </div>
          <div className="erp-stat-val">{examiners.length} Faculty</div>
          <div className="erp-stat-note">Internal &amp; External university experts</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">External University Examiners</span>
            <Building2 size={18} color="#0284c7" />
          </div>
          <div className="erp-stat-val" style={{ color: '#0284c7' }}>
            {examiners.filter(e => e.type === 'External').length}
          </div>
          <div className="erp-stat-note">NIT, BPUT, VSSUT, OUTR</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Scripts Under Evaluation</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div className="erp-stat-val" style={{ color: '#d97706' }}>
            {examiners.reduce((s, e) => s + (e.pendingBooklets || 0), 0)} Scripts
          </div>
          <div className="erp-stat-note">Pending return to CoE vault</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Remuneration Disbursed</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div className="erp-stat-val" style={{ color: '#16a34a' }}>
            ₹{examiners.reduce((s, e) => s + (e.totalRemuneration || 0), 0)}
          </div>
          <div className="erp-stat-note">Autonomous honorarium pool</div>
        </div>
      </div>

      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Autonomous Board of Examiners &amp; Evaluators Directory</h3>
            <p>Subject experts, external university affiliations, evaluation workload quotas, and honorarium billing</p>
          </div>
          <div className="erp-panel-actions">
            <button className="erp-btn erp-btn-primary" onClick={() => setNewExaminerModal(true)}>
              <Plus size={15} /> Induct New Examiner
            </button>
          </div>
        </div>

        <div className="exam-toolbar">
          <div className="exam-search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search examiners by name, institution, specialization, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="exam-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Examiner Types</option>
            <option value="Internal">Internal Autonomous Faculty</option>
            <option value="External">External University Expert</option>
          </select>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Examiner Name &amp; Affiliation</th>
                <th>Designation &amp; Type</th>
                <th>Subject Specialization</th>
                <th>Workload (Assigned / Done / Pending)</th>
                <th>Honorarium Rate &amp; Total</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExaminers.map(exm => (
                <tr key={exm.id}>
                  <td>
                    <strong>{exm.name}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{exm.institution}</div>
                    <div style={{ fontSize: '0.7rem', color: '#0284c7', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span>✉ {exm.email}</span>
                      <span>☎ {exm.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div><strong>{exm.designation}</strong></div>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: exm.type === 'Internal' ? '#ede9fe' : '#e0f2fe',
                      color: exm.type === 'Internal' ? '#6d28d9' : '#0369a1',
                      display: 'inline-block',
                      marginTop: '3px'
                    }}>
                      {exm.type} Examiner
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{exm.department}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{exm.specialization}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      <strong>{exm.assignedBooklets}</strong> Scripts Assigned
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                      ✓ {exm.evaluatedBooklets} Evaluated · <span style={{ color: exm.pendingBooklets > 0 ? '#dc2626' : '#64748b' }}>{exm.pendingBooklets} Pending</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>₹{exm.totalRemuneration}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>₹{exm.remunerationRate} / Answer Script</div>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      exm.paymentStatus.includes('Cleared') ? 'success' : 'warning'
                    }`}>
                      {exm.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {exm.pendingBooklets > 0 && (
                      <button
                        className="erp-btn erp-btn-secondary erp-btn-sm"
                        onClick={() => handleSendReminder(exm)}
                        title="Send evaluation reminder email"
                      >
                        <Mail size={13} /> Remind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD EXAMINER */}
      {newExaminerModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Induct Examiner into Autonomous Panel</h3>
                <p>Register external/internal evaluator for paper setting &amp; answer script evaluation</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setNewExaminerModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddExaminer}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Examiner Full Name *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Dr. Ramesh Ch. Mohanty"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Examiner Type *</label>
                    <select
                      className="exam-form-select"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="External">External University Examiner</option>
                      <option value="Internal">Internal College Faculty</option>
                    </select>
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Affiliated University / College *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Biju Patnaik University of Technology, Rourkela"
                      value={form.institution}
                      onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Academic Specialization *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. Algorithms & Compiler Design"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Honorarium Rate (₹ per script) *</label>
                    <input
                      type="number"
                      className="exam-form-input"
                      required
                      value={form.remunerationRate}
                      onChange={(e) => setForm({ ...form, remunerationRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Email ID *</label>
                    <input
                      type="email"
                      className="exam-form-input"
                      required
                      placeholder="examiner@university.edu.in"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">Contact Phone *</label>
                    <input
                      type="tel"
                      className="exam-form-input"
                      required
                      placeholder="+91 94370 xxxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setNewExaminerModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Check size={14} /> Add Examiner to Panel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
