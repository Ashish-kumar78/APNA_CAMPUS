import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Lock,
  Building,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Info,
  Search,
  Sparkles
} from 'lucide-react';
import {
  getAllHostelRules,
  addHostelRule,
  updateHostelRule,
  deleteHostelRule,
  resetHostelRulesToDefault,
  subscribeHostelRules
} from '../../services/hostelRulesStore.js';
import './HostelExtraSections.css';

export default function HostelSettingsRulesSection({ isHostelAdmin }) {
  // Authoritative rules state synchronized across Admin, Warden & Student
  const [rules, setRules] = useState(() => getAllHostelRules());

  // Category collapse state
  const [expandedCats, setExpandedCats] = useState({
    'Curfew & Gate Timings': true,
    'Visitor & Guest Policies': true,
    'Electrical & Room Safety': true,
    'Anti-Ragging & Code of Conduct': true
  });

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null); // { id, category, title, value, description }
  const [deletingRule, setDeletingRule] = useState(null); // { id, category, title }
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    category: 'Curfew & Gate Timings',
    customCategory: '',
    title: '',
    value: '',
    description: ''
  });

  // Subscribe to real-time rule changes
  useEffect(() => {
    const unsub = subscribeHostelRules((updatedRules) => {
      setRules(updatedRules);
    });
    return unsub;
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const toggleCategory = (cat) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleAll = (expand) => {
    const nextState = {};
    rules.forEach(c => {
      nextState[c.category] = expand;
    });
    setExpandedCats(nextState);
  };

  // Open Add Modal
  const handleOpenAddModal = (defaultCategory = 'Curfew & Gate Timings') => {
    setFormData({
      category: defaultCategory,
      customCategory: '',
      title: '',
      value: '',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (categoryName, item) => {
    setEditingRule({
      id: item.id,
      category: categoryName,
      title: item.title,
      value: item.value,
      description: item.description
    });
    setFormData({
      category: categoryName,
      customCategory: '',
      title: item.title,
      value: item.value,
      description: item.description
    });
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (categoryName, item) => {
    setDeletingRule({
      id: item.id,
      category: categoryName,
      title: item.title
    });
  };

  // Handle Add Form Submit
  const handleSaveNewRule = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a Rule / Curfew Title.');
      return;
    }

    const targetCategory = formData.category === '__CUSTOM__' 
      ? (formData.customCategory.trim() || 'General Hostel Policies')
      : formData.category;

    try {
      addHostelRule({
        category: targetCategory,
        title: formData.title,
        value: formData.value || 'Enforced',
        description: formData.description,
        author: isHostelAdmin ? 'Hostel Administrator' : 'Hostel Administration'
      });

      // Ensure newly added category is expanded
      setExpandedCats(prev => ({ ...prev, [targetCategory]: true }));
      setIsAddModalOpen(false);
      showToast(`Rule "${formData.title}" created & synced to Warden & Student portals!`);
    } catch (err) {
      alert(err.message || 'Failed to add rule.');
    }
  };

  // Handle Edit Form Submit
  const handleSaveEditRule = (e) => {
    e.preventDefault();
    if (!editingRule) return;
    if (!formData.title.trim()) {
      alert('Please enter a Rule / Curfew Title.');
      return;
    }

    const targetCategory = formData.category === '__CUSTOM__' 
      ? (formData.customCategory.trim() || editingRule.category)
      : formData.category;

    try {
      updateHostelRule(editingRule.id, {
        category: targetCategory,
        title: formData.title,
        value: formData.value,
        description: formData.description,
        author: isHostelAdmin ? 'Hostel Administrator' : 'Hostel Administration'
      });

      setExpandedCats(prev => ({ ...prev, [targetCategory]: true }));
      setEditingRule(null);
      showToast(`Rule "${formData.title}" updated & synced across all portals!`);
    } catch (err) {
      alert(err.message || 'Failed to update rule.');
    }
  };

  // Handle Delete Rule
  const handleConfirmDeleteRule = () => {
    if (!deletingRule) return;
    const ruleTitle = deletingRule.title;
    deleteHostelRule(deletingRule.id);
    setDeletingRule(null);
    showToast(`Rule "${ruleTitle}" removed from all warden and student portals.`);
  };

  // Handle Reset to Default Rules
  const handleResetDefaults = () => {
    resetHostelRulesToDefault();
    setIsResetConfirmOpen(false);
    showToast('Hostel rules & curfews reset to institutional baseline defaults.');
  };

  // Filter rules by search query
  const filteredRules = rules.map(cat => {
    if (!searchQuery.trim()) return cat;
    const q = searchQuery.toLowerCase();
    const matchingItems = cat.items.filter(item => 
      item.title.toLowerCase().includes(q) ||
      (item.value && item.value.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
    return {
      ...cat,
      items: matchingItems
    };
  }).filter(cat => cat.items.length > 0 || !searchQuery.trim());

  const existingCategories = Array.from(new Set(rules.map(r => r.category)));

  return (
    <div className="hostel-section-container">
      {/* Toast Feedback */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '0.86rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="hostel-section-header">
        <div>
          <h2><Settings size={24} color="#2563eb" /> Hostel Rules, Policies &amp; System Configuration</h2>
          <p>Institutional Residence Code · Gate Pass Thresholds · Curfew Schedules · Authority Governance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {isHostelAdmin && (
            <>
              <button
                type="button"
                className="h-btn h-btn-primary"
                onClick={() => handleOpenAddModal()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Add New Rule / Curfew Policy
              </button>
              <button
                type="button"
                className="h-btn h-btn-secondary"
                onClick={() => setIsResetConfirmOpen(true)}
                title="Restore original standard rules"
              >
                <RotateCcw size={14} /> Reset Baseline
              </button>
            </>
          )}
          <button className="h-btn h-btn-secondary" onClick={() => window.print()}>
            Print Hostel Manual
          </button>
        </div>
      </div>

      {/* Warden Read-Only Notice Banner */}
      {!isHostelAdmin && (
        <div className="warden-rules-notice-banner">
          <Info size={16} />
          <span>
            <strong>Warden Supervisory Mode:</strong> Hostel curfew timings, safety protocols, and disciplinary codes are centrally configured by the <strong>Hostel Administrator</strong>. Any updates reflect immediately across this portal and all resident student dashboards.
          </span>
        </div>
      )}

      {/* Filter and Expand Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        background: '#ffffff',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search rules, curfew timings, code of conduct..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              color: '#0f172a'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} color="#94a3b8" />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          <button
            type="button"
            onClick={() => toggleAll(true)}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
          >
            Expand All
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => toggleAll(false)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* RULES MANUAL & CURFEW MATRIX */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredRules.length === 0 ? (
          <div style={{
            background: '#ffffff',
            padding: '2.5rem',
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            color: '#64748b'
          }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>No rules matched "{searchQuery}"</p>
            <button
              className="h-btn h-btn-secondary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredRules.map(cat => {
            const isExpanded = expandedCats[cat.category] !== false;
            return (
              <div key={cat.category} className="hostel-rule-card">
                <div className="hostel-rule-header" onClick={() => toggleCategory(cat.category)}>
                  <h4>
                    <Shield size={18} color="#2563eb" /> {cat.category}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: '#eff6ff',
                      color: '#2563eb',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginLeft: '6px'
                    }}>
                      {cat.items.length} {cat.items.length === 1 ? 'Rule' : 'Rules'}
                    </span>
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isHostelAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(cat.category);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title={`Add rule to ${cat.category}`}
                      >
                        <Plus size={13} /> Add
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="hostel-rule-body">
                    {cat.items.length === 0 ? (
                      <div style={{ fontSize: '0.84rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                        No active rules configured under this category.
                      </div>
                    ) : (
                      cat.items.map((item) => (
                        <div key={item.id || item.title} className="hostel-rule-item-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.65rem' }}>
                            <div style={{ flex: 1, minWidth: '220px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a' }}>{item.title}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="h-badge h-badge-medium" style={{ fontWeight: 700 }}>{item.value}</span>
                              {isHostelAdmin && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    className="h-rule-action-btn edit"
                                    onClick={() => handleOpenEditModal(cat.category, item)}
                                    title="Edit rule / curfew"
                                  >
                                    <Edit2 size={12} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="h-rule-action-btn delete"
                                    onClick={() => handleOpenDeleteModal(cat.category, item)}
                                    title="Delete rule"
                                  >
                                    <Trash2 size={12} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {item.description && (
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.55 }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: ADD NEW RULE / CURFEW ── */}
      {isAddModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Add New Hostel Rule / Curfew Policy</h3>
              </div>
              <button
                type="button"
                className="admin-table-action-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewRule} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Policy Category *
                </label>
                <select
                  className="hostel-select"
                  style={{ width: '100%' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__CUSTOM__">+ Create New Category...</option>
                </select>
              </div>

              {formData.category === '__CUSTOM__' && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    New Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dining Hall Etiquette & Meal Timings"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Rule / Curfew Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late Night Library Pass / Weekend Curfew"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Timing / Policy Enforcement Value *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:00 PM / Prior Warden Gate Pass / Strictly Prohibited"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Rule Description &amp; Compliance Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the operational rule, student instructions, and any escalation/fine procedures."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                <Sparkles size={14} color="#2563eb" style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Rules saved here are instantly synchronized to the Hostel Warden dashboard and the Student Residential portal.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="h-btn h-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-btn h-btn-primary"
                >
                  <Plus size={14} /> Add Rule Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT RULE / CURFEW ── */}
      {editingRule && (
        <div className="admin-modal-backdrop" onClick={() => setEditingRule(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Edit Hostel Rule / Curfew Policy</h3>
              </div>
              <button
                type="button"
                className="admin-table-action-btn"
                onClick={() => setEditingRule(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditRule} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Policy Category
                </label>
                <select
                  className="hostel-select"
                  style={{ width: '100%' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__CUSTOM__">+ Move to New Category...</option>
                </select>
              </div>

              {formData.category === '__CUSTOM__' && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    New Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="New Category Name"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Rule / Curfew Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Timing / Policy Enforcement Value *
                </label>
                <input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Rule Description &amp; Guidelines
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="h-btn h-btn-secondary"
                  onClick={() => setEditingRule(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-btn h-btn-primary"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE RULE ── */}
      {deletingRule && (
        <div className="admin-modal-backdrop" onClick={() => setDeletingRule(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="admin-modal-header" style={{ borderBottomColor: '#fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                <AlertTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#b91c1c' }}>Delete Rule / Curfew Policy</h3>
              </div>
              <button
                type="button"
                className="admin-table-action-btn"
                onClick={() => setDeletingRule(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>
                Are you sure you want to permanently delete:
              </p>
              <div style={{ background: '#fef2f2', borderLeft: '3px solid #ef4444', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                <strong style={{ display: 'block', color: '#991b1b', fontSize: '0.92rem' }}>{deletingRule.title}</strong>
                <span style={{ fontSize: '0.78rem', color: '#b91c1c' }}>Category: {deletingRule.category}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                This rule will immediately be removed from the Hostel Warden portal and Student Resident dashboards.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="h-btn h-btn-secondary"
                  onClick={() => setDeletingRule(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="h-btn h-btn-danger"
                  onClick={handleConfirmDeleteRule}
                >
                  <Trash2 size={14} /> Yes, Delete Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM RESET BASELINE ── */}
      {isResetConfirmOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsResetConfirmOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <RotateCcw size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Reset Baseline Rules</h3>
              </div>
              <button
                type="button"
                className="admin-table-action-btn"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                Are you sure you want to restore the official institutional baseline rules and curfew schedules? Any custom rules added will be reset to default.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="h-btn h-btn-secondary"
                  onClick={() => setIsResetConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="h-btn h-btn-primary"
                  onClick={handleResetDefaults}
                >
                  Restore Baseline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
