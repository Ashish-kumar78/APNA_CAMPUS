import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Clock,
  Send,
  Sparkles,
  Users,
  Search,
  Filter,
  X,
  Check,
  Star,
  Layers,
  ChevronRight
} from 'lucide-react';
import { communicationStore } from '../../services/communicationStore.js';
import { exportToExcel, exportToCsv, exportTableToPdf } from '../../utils/documentExportUtils.js';
import './CommunicationHub.css';

export const FORM_FIELD_TYPES = [
  'Short Answer',
  'Long Answer',
  'Email',
  'Number',
  'Date',
  'Time',
  'Dropdown',
  'Single Choice',
  'Multiple Choice',
  'Checkbox',
  'File Upload',
  'Rating',
  'Registration Number',
  'Employee ID',
  'Department',
  'Branch',
  'Semester',
  'Section'
];

export default function FormsSurveysSection({ account, onShareFormInComposer }) {
  const [forms, setForms] = useState(() => communicationStore.getForms());
  const [selectedForm, setSelectedForm] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResponsesOpen, setIsResponsesOpen] = useState(false);
  const [previewTestSubmitted, setPreviewTestSubmitted] = useState(false);
  const [responseSearch, setResponseSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Form Builder Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [confirmationMsg, setConfirmationMsg] = useState('Thank you for completing this institutional form!');
  const [fields, setFields] = useState([]);

  // Test response values in Preview Mode
  const [previewAnswers, setPreviewAnswers] = useState({});

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const reloadForms = () => {
    setForms(communicationStore.getForms());
  };

  // Open Builder for New Form
  const handleCreateNewForm = () => {
    setSelectedForm(null);
    setFormTitle('New Academic Survey & Feedback Form');
    setFormDesc('Institutional collection form for course feedback and student options.');
    setFormInstructions('Please answer all required questions carefully before submitting.');
    setSubmissionDeadline(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setConfirmationMsg('Your response has been registered with the College Administration.');
    setFields([
      { id: 'fld-1', title: 'Student Full Name', type: 'Short Answer', required: true, description: 'As per institutional ID card' },
      { id: 'fld-2', title: 'Registration / Roll Number', type: 'Registration Number', required: true },
      { id: 'fld-3', title: 'Academic Branch', type: 'Branch', required: true, options: ['CSE', 'CSE (AI)', 'ECE', 'MECH', 'CIVIL'] },
      { id: 'fld-4', title: 'Overall Rating of Course Delivery', type: 'Rating', required: true, description: '1 (Poor) to 5 (Outstanding)' },
      { id: 'fld-5', title: 'Detailed Constructive Feedback', type: 'Long Answer', required: false }
    ]);
    setIsBuilderOpen(true);
  };

  // Open Builder to Edit Existing Form
  const handleEditForm = (form) => {
    setSelectedForm(form);
    setFormTitle(form.title);
    setFormDesc(form.description || '');
    setFormInstructions(form.instructions || '');
    setSubmissionDeadline(form.submissionDeadline ? form.submissionDeadline.split('T')[0] : '');
    setConfirmationMsg(form.confirmationMessage || 'Thank you for completing this form!');
    setFields(form.fields || []);
    setIsBuilderOpen(true);
  };

  // Add New Field
  const handleAddField = (type = 'Short Answer') => {
    const newField = {
      id: `fld-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `Untitled ${type} Question`,
      type,
      required: false,
      description: '',
      options: ['Dropdown', 'Single Choice', 'Multiple Choice', 'Checkbox', 'Branch', 'Semester', 'Section', 'Department'].includes(type)
        ? ['Option 1', 'Option 2', 'Option 3']
        : []
    };
    setFields(prev => [...prev, newField]);
  };

  // Field Manipulation Helpers
  const handleFieldChange = (fldId, key, val) => {
    setFields(prev => prev.map(f => f.id === fldId ? { ...f, [key]: val } : f));
  };

  const handleAddOption = (fldId) => {
    setFields(prev => prev.map(f => {
      if (f.id === fldId) {
        const currentOpts = f.options || [];
        return { ...f, options: [...currentOpts, `Option ${currentOpts.length + 1}`] };
      }
      return f;
    }));
  };

  const handleUpdateOption = (fldId, optIdx, val) => {
    setFields(prev => prev.map(f => {
      if (f.id === fldId) {
        const nextOpts = [...(f.options || [])];
        nextOpts[optIdx] = val;
        return { ...f, options: nextOpts };
      }
      return f;
    }));
  };

  const handleRemoveOption = (fldId, optIdx) => {
    setFields(prev => prev.map(f => {
      if (f.id === fldId) {
        const nextOpts = (f.options || []).filter((_, idx) => idx !== optIdx);
        return { ...f, options: nextOpts };
      }
      return f;
    }));
  };

  const handleMoveField = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFields(updated);
  };

  const handleDeleteField = (fldId) => {
    setFields(prev => prev.filter(f => f.id !== fldId));
  };

  // Save Form
  const handleSaveForm = () => {
    if (!formTitle.trim()) {
      alert('Please enter a Form Title');
      return;
    }
    const payload = {
      id: selectedForm?.id,
      title: formTitle,
      description: formDesc,
      instructions: formInstructions,
      submissionDeadline: submissionDeadline ? `${submissionDeadline}T23:59:00` : null,
      confirmationMessage: confirmationMsg,
      status: 'Active',
      fields,
      responses: selectedForm?.responses || []
    };

    communicationStore.saveForm(payload);
    reloadForms();
    setIsBuilderOpen(false);
    showToast('✓ Form saved successfully into institutional database');
  };

  const handleDeleteForm = (formId) => {
    if (confirm('Are you sure you want to delete this form and all its responses?')) {
      communicationStore.deleteForm(formId);
      reloadForms();
      showToast('Form deleted');
    }
  };

  // Preview Submission Simulation
  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedForm && !isBuilderOpen) return;
    const formId = selectedForm?.id || 'FORM-2026-01';

    communicationStore.submitFormResponse(formId, {
      respondentName: account?.name || 'Preview Student',
      rollNumber: account?.identity || '2301289001',
      department: account?.department || 'CSE',
      answers: previewAnswers
    });

    setPreviewTestSubmitted(true);
    reloadForms();
    showToast('✓ Test response submitted and recorded!');
  };

  // Response Exports
  const handleExportResponses = (form, format) => {
    const responses = form.responses || [];
    if (!responses.length) {
      alert('No responses recorded yet for this form.');
      return;
    }

    const fieldKeys = form.fields.map(f => f.title);
    const headers = ['Submission Date', 'Student / Respondent', 'Roll / ID', 'Department', ...fieldKeys];
    const rows = responses.map(r => {
      const fieldAnswers = form.fields.map(f => {
        const val = r.answers?.[f.id];
        return Array.isArray(val) ? val.join('; ') : (val ?? '—');
      });
      return [
        new Date(r.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        r.respondentName || 'Anonymous',
        r.rollNumber || '—',
        r.department || '—',
        ...fieldAnswers
      ];
    });

    const safeName = `${form.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Responses`;

    if (format === 'excel') {
      exportToExcel(safeName, 'Responses', rows, headers);
      showToast('✓ Exported responses to Excel (.xlsx)');
    } else if (format === 'csv') {
      exportToCsv(safeName, rows, headers);
      showToast('✓ Exported responses to CSV');
    } else if (format === 'pdf') {
      exportTableToPdf(safeName, form.title, headers, rows, 'Official Student & Stakeholder Response Record');
      showToast('✓ Generated responses PDF');
    }
  };

  return (
    <div className="apna-forms-surveys-container">
      {/* Toast */}
      {toastMsg && (
        <div className="apna-notif-toast" style={{ top: 20, right: 30 }}>
          <CheckCircle2 size={16} /> <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="apna-hub-tab-header">
        <div>
          <h3>Forms &amp; Surveys Studio</h3>
          <p>Create Google-Forms-style questionnaires, collect responses, and analyze feedback.</p>
        </div>
        <button
          type="button"
          className="apna-btn primary"
          onClick={handleCreateNewForm}
        >
          <Plus size={15} /> Create Form
        </button>
      </div>

      {/* FORMS GRID */}
      <div className="apna-forms-list-grid">
        {forms.map(form => (
          <div key={form.id} className="apna-form-card">
            <div className="form-card-top">
              <span className="apna-form-status-pill active">
                <Check size={11} /> {form.status || 'Active'}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {form.fields?.length || 0} Questions
              </span>
            </div>

            <h4 className="form-card-title">{form.title}</h4>
            <p className="form-card-desc">{form.description}</p>

            <div className="form-card-meta">
              <div>
                <strong>{form.responses?.length || 0}</strong>
                <span>Submissions</span>
              </div>
              <div>
                <strong>{form.submissionDeadline ? new Date(form.submissionDeadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Open'}</strong>
                <span>Deadline</span>
              </div>
            </div>

            <div className="form-card-actions">
              <button
                type="button"
                className="form-action-btn"
                onClick={() => {
                  setSelectedForm(form);
                  setPreviewAnswers({});
                  setPreviewTestSubmitted(false);
                  setIsPreviewOpen(true);
                }}
                title="Preview as respondent"
              >
                <Eye size={13} /> Preview
              </button>

              <button
                type="button"
                className="form-action-btn"
                onClick={() => {
                  setSelectedForm(form);
                  setIsResponsesOpen(true);
                }}
                title="View responses"
              >
                <Users size={13} /> Responses ({form.responses?.length || 0})
              </button>

              <button
                type="button"
                className="form-action-btn"
                onClick={() => handleEditForm(form)}
                title="Edit form structure"
              >
                Edit
              </button>

              <button
                type="button"
                className="form-action-btn share"
                onClick={() => {
                  if (onShareFormInComposer) {
                    onShareFormInComposer(form);
                  } else {
                    showToast(`Form #${form.id} link copied for announcement sharing.`);
                  }
                }}
                title="Share form in announcement"
              >
                <Share2 size={13} /> Share
              </button>

              <button
                type="button"
                className="form-action-btn delete"
                onClick={() => handleDeleteForm(form.id)}
                title="Delete form"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {forms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', gridColumn: '1 / -1' }}>
            <FileText size={36} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            <p>No forms or surveys created yet. Click "+ Create Form" to build one!</p>
          </div>
        )}
      </div>

      {/* ── MODAL 1: FORM BUILDER (GOOGLE FORMS STYLE) ── */}
      {isBuilderOpen && (
        <div className="apna-modal-backdrop" onClick={() => setIsBuilderOpen(false)}>
          <div className="apna-form-builder-card" onClick={e => e.stopPropagation()}>
            <div className="apna-composer-header">
              <div className="apna-composer-header-left">
                <div className="apna-composer-icon-badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="apna-composer-title">
                    {selectedForm ? 'Edit Form Definition' : 'Create Google-Forms Style Questionnaire'}
                  </h2>
                  <p className="apna-composer-subtitle">
                    18 Field Types · Validation Rules · Instant Response Ledger
                  </p>
                </div>
              </div>
              <button type="button" className="apna-composer-close-btn" onClick={() => setIsBuilderOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="apna-form-builder-body">
              {/* Header Details Card */}
              <div className="form-builder-header-box">
                <input
                  type="text"
                  className="form-builder-title-input"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Form Title..."
                />
                <textarea
                  className="form-builder-desc-input"
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Form description / purpose for students or staff..."
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="apna-form-input"
                    value={formInstructions}
                    onChange={e => setFormInstructions(e.target.value)}
                    placeholder="Instructions (e.g. Keep registration number ready)"
                  />
                  <input
                    type="date"
                    className="apna-form-input"
                    value={submissionDeadline}
                    onChange={e => setSubmissionDeadline(e.target.value)}
                    title="Submission Deadline"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="form-builder-fields-list">
                {fields.map((field, idx) => {
                  const hasOptions = ['Dropdown', 'Single Choice', 'Multiple Choice', 'Checkbox', 'Branch', 'Semester', 'Section', 'Department'].includes(field.type);
                  return (
                    <div key={field.id} className="form-field-card">
                      <div className="field-card-top">
                        <span className="field-number">Q{idx + 1}</span>
                        <input
                          type="text"
                          className="field-title-input"
                          value={field.title}
                          onChange={e => handleFieldChange(field.id, 'title', e.target.value)}
                          placeholder="Question Title..."
                        />
                        <select
                          className="field-type-select"
                          value={field.type}
                          onChange={e => handleFieldChange(field.id, 'type', e.target.value)}
                        >
                          {FORM_FIELD_TYPES.map(ft => (
                            <option key={ft} value={ft}>{ft}</option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        className="field-desc-input"
                        value={field.description || ''}
                        onChange={e => handleFieldChange(field.id, 'description', e.target.value)}
                        placeholder="Help text or instructions for respondent (optional)..."
                      />

                      {/* Options List for Choice Types */}
                      {hasOptions && (
                        <div className="field-options-builder">
                          {(field.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="field-option-row">
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>•</span>
                              <input
                                type="text"
                                className="field-option-input"
                                value={opt}
                                onChange={e => handleUpdateOption(field.id, oIdx, e.target.value)}
                              />
                              <button
                                type="button"
                                className="remove-opt-btn"
                                onClick={() => handleRemoveOption(field.id, oIdx)}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="add-option-btn"
                            onClick={() => handleAddOption(field.id)}
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                      {/* Field Footer Actions */}
                      <div className="field-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            className="order-btn"
                            disabled={idx === 0}
                            onClick={() => handleMoveField(idx, 'up')}
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="order-btn"
                            disabled={idx === fields.length - 1}
                            onClick={() => handleMoveField(idx, 'down')}
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <label className="required-toggle">
                            <input
                              type="checkbox"
                              checked={Boolean(field.required)}
                              onChange={e => handleFieldChange(field.id, 'required', e.target.checked)}
                            />
                            <span>Required</span>
                          </label>

                          <button
                            type="button"
                            className="delete-field-btn"
                            onClick={() => handleDeleteField(field.id)}
                            title="Delete question"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Field Bar */}
              <div className="add-field-bar">
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>+ Add Question Field:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Short Answer', 'Long Answer', 'Single Choice', 'Dropdown', 'Rating', 'Registration Number', 'Branch', 'File Upload'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className="add-specific-field-pill"
                      onClick={() => handleAddField(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="apna-composer-footer">
              <button
                type="button"
                className="apna-btn secondary"
                onClick={() => setIsBuilderOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="apna-btn primary"
                onClick={handleSaveForm}
              >
                <Check size={15} /> Save Form Definition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: RESPONDENT PREVIEW / TEST SUBMIT ── */}
      {isPreviewOpen && selectedForm && (
        <div className="apna-modal-backdrop" onClick={() => setIsPreviewOpen(false)}>
          <div className="apna-preview-modal-card" onClick={e => e.stopPropagation()}>
            <div className="preview-top-banner">
              <span>Respondent View Simulation</span>
              <button type="button" onClick={() => setIsPreviewOpen(false)}><X size={16} /></button>
            </div>

            <div className="preview-content-scroll">
              <div className="preview-form-header">
                <h2>{selectedForm.title}</h2>
                <p>{selectedForm.description}</p>
                {selectedForm.instructions && (
                  <div className="preview-instructions">ℹ️ {selectedForm.instructions}</div>
                )}
                {selectedForm.submissionDeadline && (
                  <small style={{ color: '#ea580c', fontWeight: 600 }}>
                    ⏰ Submission Deadline: {new Date(selectedForm.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </small>
                )}
              </div>

              {previewTestSubmitted ? (
                <div className="preview-success-state">
                  <CheckCircle2 size={42} color="#10b981" />
                  <h3>Submission Recorded Successfully!</h3>
                  <p>{selectedForm.confirmationMessage || 'Thank you! Your response has been registered.'}</p>
                  <button
                    type="button"
                    className="apna-btn secondary"
                    onClick={() => {
                      setPreviewAnswers({});
                      setPreviewTestSubmitted(false);
                    }}
                  >
                    Submit Another Test Response
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePreviewSubmit}>
                  {selectedForm.fields.map((f, idx) => (
                    <div key={f.id} className="preview-question-card">
                      <label className="preview-q-title">
                        <span>{idx + 1}. {f.title}</span>
                        {f.required && <span style={{ color: '#ef4444' }}> *</span>}
                      </label>
                      {f.description && <div className="preview-q-desc">{f.description}</div>}

                      {/* Input based on type */}
                      {f.type === 'Long Answer' ? (
                        <textarea
                          className="apna-form-input"
                          rows={3}
                          value={previewAnswers[f.id] || ''}
                          onChange={e => setPreviewAnswers({ ...previewAnswers, [f.id]: e.target.value })}
                          required={f.required}
                        />
                      ) : f.type === 'Dropdown' || f.type === 'Branch' || f.type === 'Semester' || f.type === 'Section' ? (
                        <select
                          className="apna-form-select"
                          value={previewAnswers[f.id] || ''}
                          onChange={e => setPreviewAnswers({ ...previewAnswers, [f.id]: e.target.value })}
                          required={f.required}
                        >
                          <option value="">-- Select Option --</option>
                          {(f.options || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : f.type === 'Single Choice' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(f.options || []).map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}>
                              <input
                                type="radio"
                                name={f.id}
                                value={opt}
                                checked={previewAnswers[f.id] === opt}
                                onChange={e => setPreviewAnswers({ ...previewAnswers, [f.id]: e.target.value })}
                                required={f.required}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : f.type === 'Rating' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setPreviewAnswers({ ...previewAnswers, [f.id]: st })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                              <Star
                                size={22}
                                color="#eab308"
                                fill={(previewAnswers[f.id] || 0) >= st ? '#eab308' : '#e2e8f0'}
                              />
                            </button>
                          ))}
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                            {previewAnswers[f.id] ? `${previewAnswers[f.id]} / 5 Stars` : 'Tap to rate'}
                          </span>
                        </div>
                      ) : (
                        <input
                          type={f.type === 'Email' ? 'email' : f.type === 'Number' ? 'number' : f.type === 'Date' ? 'date' : 'text'}
                          className="apna-form-input"
                          value={previewAnswers[f.id] || ''}
                          onChange={e => setPreviewAnswers({ ...previewAnswers, [f.id]: e.target.value })}
                          placeholder={`Enter ${f.title.toLowerCase()}...`}
                          required={f.required}
                        />
                      )}
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="submit" className="apna-btn primary">
                      <Send size={15} /> Submit Response
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: FORM RESPONSES LEDGER & EXPORT ── */}
      {isResponsesOpen && selectedForm && (
        <div className="apna-modal-backdrop" onClick={() => setIsResponsesOpen(false)}>
          <div className="apna-responses-modal-card" onClick={e => e.stopPropagation()}>
            <div className="apna-composer-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Submissions &amp; Responses — {selectedForm.title}
                </h3>
                <small style={{ color: '#64748b' }}>
                  {selectedForm.responses?.length || 0} Total Completed Records · Real-time Survey Audit
                </small>
              </div>
              <button type="button" className="apna-composer-close-btn" onClick={() => setIsResponsesOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="apna-responses-body">
              {/* Export Bar */}
              <div className="responses-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    className="apna-form-input"
                    placeholder="Search by student name or roll..."
                    value={responseSearch}
                    onChange={e => setResponseSearch(e.target.value)}
                    style={{ width: 240, padding: '4px 8px', fontSize: '0.8rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="apna-export-btn"
                    onClick={() => handleExportResponses(selectedForm, 'excel')}
                    title="Download Excel spreadsheet"
                  >
                    <Download size={13} /> Export XLSX
                  </button>
                  <button
                    type="button"
                    className="apna-export-btn"
                    onClick={() => handleExportResponses(selectedForm, 'csv')}
                    title="Download CSV"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                  <button
                    type="button"
                    className="apna-export-btn"
                    onClick={() => handleExportResponses(selectedForm, 'pdf')}
                    title="Download PDF table"
                  >
                    <Download size={13} /> Export PDF
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="responses-table-wrap">
                <table className="apna-custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Respondent</th>
                      <th>Roll / ID</th>
                      <th>Dept</th>
                      {selectedForm.fields.slice(0, 5).map(f => (
                        <th key={f.id}>{f.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedForm.responses || [])
                      .filter(r => !responseSearch || r.respondentName.toLowerCase().includes(responseSearch.toLowerCase()) || r.rollNumber.toLowerCase().includes(responseSearch.toLowerCase()))
                      .map(r => (
                        <tr key={r.id}>
                          <td>{new Date(r.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                          <td><strong>{r.respondentName}</strong></td>
                          <td><code>{r.rollNumber}</code></td>
                          <td>{r.department}</td>
                          {selectedForm.fields.slice(0, 5).map(f => (
                            <td key={f.id}>
                              {r.answers?.[f.id] !== undefined ? String(r.answers[f.id]) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>

                {(!selectedForm.responses || selectedForm.responses.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No responses submitted yet. Share the form link or run a test submission in preview mode!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
