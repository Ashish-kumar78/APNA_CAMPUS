import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  X,
  BookOpen,
  Info,
} from 'lucide-react';

export default function EligibilityRulesTab({
  rules = [],
  courses = [],
  onUpdateRule,
  onAddRule,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingRule, setEditingRule] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    courseCode: 'BTECH-CSE',
    courseName: 'B.Tech Computer Science & Engineering',
    academicSession: '2026-2027',
    minQualification: '10+2 / Higher Secondary Exam (Science)',
    requiredSubjectsText: 'Physics, Mathematics, Chemistry or Computer Science',
    minAggregateMarks: 60.0,
    minReservedMarks: 50.0,
    qualifyingExam: 'JEE Main 2026 / OJEE 2026',
    maxEntranceRankJEE: 65000,
    maxEntranceRankOJEE: 3500,
    domicilePolicy: '85% Odisha State Quota · 15% All India JEE Quota',
    status: 'Active',
  });

  const filteredRules = rules.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.courseName?.toLowerCase().includes(q) ||
        r.courseCode?.toLowerCase().includes(q) ||
        r.qualifyingExam?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEditRule = (rule) => {
    setEditingRule({
      ...rule,
      requiredSubjectsText: (rule.requiredSubjects || []).join(', '),
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRule) return;

    const subjectsArray = editingRule.requiredSubjectsText
      ? editingRule.requiredSubjectsText.split(',').map((s) => s.trim()).filter(Boolean)
      : editingRule.requiredSubjects;

    onUpdateRule &&
      onUpdateRule(editingRule.id, {
        ...editingRule,
        requiredSubjects: subjectsArray,
        minAggregateMarks: Number(editingRule.minAggregateMarks),
        minReservedMarks: Number(editingRule.minReservedMarks),
      });

    setEditingRule(null);
  };

  const handleAddRuleSubmit = (e) => {
    e.preventDefault();
    const subjectsArray = formData.requiredSubjectsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onAddRule &&
      onAddRule({
        ...formData,
        requiredSubjects: subjectsArray,
        minAggregateMarks: Number(formData.minAggregateMarks),
        minReservedMarks: Number(formData.minReservedMarks),
        approvedBy: 'BPUT Academic Council & Principal',
      });

    setIsAddModalOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
            Course-Specific Eligibility &amp; Admission Rules
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Configurable academic criteria, minimum qualifying marks, mandatory subject combinations, and qualifying examination policies.
          </p>
        </div>
        <button
          type="button"
          className="adm-btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} /> Add Program Admission Rule
        </button>
      </div>

      {/* Institutional Policy Notice */}
      <div
        style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.8rem',
          color: '#0369a1',
        }}
      >
        <Info size={18} />
        <div>
          <strong>Institutional Governance Source of Truth:</strong> The admission policies displayed below represent the approved guidelines ratified by the BPUT Academic Council, AICTE Regulations, and the Office of the Principal. Modifying rules alters validation checks during application processing.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="adm-filter-bar">
        <div className="adm-search-input-wrap">
          <Search size={16} className="adm-search-icon" />
          <input
            type="text"
            className="adm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course name, code, or qualifying exam..."
          />
        </div>

        <div className="adm-filter-group">
          <select
            className="adm-select-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Rule Statuses</option>
            <option value="Active">Active Rules</option>
            <option value="Draft">Draft Policies</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {filteredRules.map((rule) => (
          <div key={rule.id} className="adm-panel-box" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="adm-panel-header" style={{ padding: '14px 18px', background: '#f8fafc' }}>
              <div>
                <span className="adm-badge-pill dark" style={{ marginBottom: '4px' }}>
                  {rule.courseCode} · {rule.academicSession}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                  {rule.courseName}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="adm-badge-pill green">{rule.status}</span>
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => handleEditRule(rule)}
                  style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                >
                  <Edit size={12} /> Edit
                </button>
              </div>
            </div>

            <div className="adm-panel-body" style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Minimum Qualification</span>
                <div style={{ fontWeight: 700, fontSize: '0.84rem', marginTop: '2px', color: '#0f172a' }}>
                  {rule.minQualification}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Min General Marks</span>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0284c7', marginTop: '2px' }}>
                    {rule.minAggregateMarks}%
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Min Reserved Marks</span>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#059669', marginTop: '2px' }}>
                    {rule.minReservedMarks}% (SC/ST/EWS)
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Mandatory Subjects</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {(rule.requiredSubjects || []).map((sub, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '2px 8px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Approved Qualifying Examination</span>
                <div style={{ fontWeight: 700, fontSize: '0.84rem', marginTop: '2px', color: '#0f172a' }}>
                  {rule.qualifyingExam}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                  {rule.domicilePolicy}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.7rem', color: '#94a3b8' }}>
                Approved: {rule.approvedBy} · {rule.lastModified}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div className="adm-modal-backdrop" onClick={() => setEditingRule(null)}>
          <div className="adm-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Configure Admission Rule: {editingRule.courseName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="adm-modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Minimum Qualifying Prerequisites *
                  </label>
                  <input
                    type="text"
                    required
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={editingRule.minQualification || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, minQualification: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Minimum General Aggregate Marks (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingRule.minAggregateMarks || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, minAggregateMarks: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Minimum Reserved Quota Marks (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingRule.minReservedMarks || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, minReservedMarks: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Required Mandatory Subjects (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={editingRule.requiredSubjectsText || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, requiredSubjectsText: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Qualifying Examination *
                    </label>
                    <input
                      type="text"
                      required
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={editingRule.qualifyingExam || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, qualifyingExam: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Rule Status
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={editingRule.status || 'Active'}
                      onChange={(e) => setEditingRule({ ...editingRule, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Domicile &amp; Reservation Policy
                  </label>
                  <input
                    type="text"
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={editingRule.domicilePolicy || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, domicilePolicy: e.target.value })}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setEditingRule(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Save Configured Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW RULE MODAL */}
      {isAddModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="adm-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Add Institutional Admission Policy Rule
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRuleSubmit}>
              <div className="adm-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Program *
                    </label>
                    <select
                      className="adm-select-control"
                      style={{ width: '100%' }}
                      value={formData.courseName}
                      onChange={(e) => {
                        const sel = courses.find((c) => c.name === e.target.value);
                        setFormData({
                          ...formData,
                          courseName: e.target.value,
                          courseCode: sel ? sel.code : 'BTECH',
                        });
                      }}
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Academic Session
                    </label>
                    <input
                      type="text"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={formData.academicSession}
                      onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Prerequisites *
                  </label>
                  <input
                    type="text"
                    required
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={formData.minQualification}
                    onChange={(e) => setFormData({ ...formData, minQualification: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Min General Marks (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={formData.minAggregateMarks}
                      onChange={(e) => setFormData({ ...formData, minAggregateMarks: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                      Min Reserved Marks (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="adm-search-input"
                      style={{ paddingLeft: '12px' }}
                      value={formData.minReservedMarks}
                      onChange={(e) => setFormData({ ...formData, minReservedMarks: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '4px' }}>
                    Required Subjects (Comma-separated)
                  </label>
                  <input
                    type="text"
                    className="adm-search-input"
                    style={{ paddingLeft: '12px' }}
                    value={formData.requiredSubjectsText}
                    onChange={(e) => setFormData({ ...formData, requiredSubjectsText: e.target.value })}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
