import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  Save,
  Clock,
  Paperclip,
  Eye,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Upload,
  FileText,
  FileSpreadsheet,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import RecipientSelector from './RecipientSelector.jsx';
import { communicationStore } from '../../services/communicationStore.js';
import './CommunicationHub.css';

export const MESSAGE_TYPES = [
  'General Announcement',
  'Academic Notice',
  'Examination Notice',
  'Attendance Notice',
  'Fee Notification',
  'Placement and Internship',
  'Admission Notice',
  'Hostel Notice',
  'Transport Notice',
  'Library Notice',
  'Accounts and Finance',
  'Staff Circular',
  'Meeting Notice',
  'Emergency Alert',
  'Event Announcement',
  'Document Sharing',
  'Form or Survey',
  'Other'
];

export const PRIORITIES = [
  { id: 'Normal', label: 'Normal', color: '#0284c7', bg: '#f0f9ff' },
  { id: 'Important', label: 'Important', color: '#d97706', bg: '#fffbeb' },
  { id: 'Urgent', label: 'Urgent', color: '#ea580c', bg: '#fff7ed' },
  { id: 'Emergency', label: 'Emergency', color: '#dc2626', bg: '#fef2f2' }
];

export default function MessageComposerModal({
  isOpen,
  onClose,
  account,
  initialDraft = null,
  preAttachedFile = null,
  onMessageSent
}) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialDraft?.title || '');
  const [heading, setHeading] = useState(initialDraft?.heading || 'Autonomous Institution Official Circular');
  const [messageType, setMessageType] = useState(initialDraft?.messageType || 'General Announcement');
  const [priority, setPriority] = useState(initialDraft?.priority || 'Normal');
  const [bodyHtml, setBodyHtml] = useState(initialDraft?.body || '');
  const [expiryDate, setExpiryDate] = useState(initialDraft?.expiryDate || '');
  const [submissionDeadline, setSubmissionDeadline] = useState(initialDraft?.submissionDeadline || '');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');

  // File Attachments
  const [attachments, setAttachments] = useState(
    preAttachedFile ? [preAttachedFile] : (initialDraft?.attachments || [])
  );
  const fileInputRef = useRef(null);

  // Recipient State
  const [recipients, setRecipients] = useState(
    initialDraft?.recipients || {
      roles: ['All Students'],
      branches: [],
      years: [],
      semesters: [],
      sections: [],
      batches: [],
      departments: [],
      individualUsers: []
    }
  );

  // View States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const editorRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Rich Text Editor Commands
  const executeCmd = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = (e) => {
    setBodyHtml(e.currentTarget.innerHTML);
  };

  // Attachment Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      fileObject: file
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    showToast(`Attached ${files.length} file(s)`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (attId) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newAttachments = files.map(file => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        fileObject: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
      showToast(`Attached ${files.length} dropped file(s)`);
    }
  };

  // Validation
  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter a clear Message Title');
      return false;
    }
    const cleanText = bodyHtml.replace(/<[^>]*>/g, '').trim();
    if (!cleanText && attachments.length === 0) {
      setValidationError('Please provide message content or attach a document');
      return false;
    }
    if (!recipients.roles.length && !recipients.individualUsers.length) {
      setValidationError('Please select at least one recipient role or individual recipient');
      return false;
    }
    if (isScheduled && !scheduledDate) {
      setValidationError('Please specify the Scheduled Date for timed delivery');
      return false;
    }
    setValidationError('');
    return true;
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (!title.trim()) {
      setValidationError('Please provide at least a title to save as draft');
      return;
    }
    const draftData = {
      id: initialDraft?.id,
      title,
      heading,
      messageType,
      priority,
      body: bodyHtml,
      expiryDate,
      submissionDeadline,
      attachments,
      recipients,
      sender: account?.name || 'Administrator',
      department: account?.department || 'Deanery'
    };
    communicationStore.saveDraft(draftData);
    showToast('✓ Message draft saved successfully');
    setTimeout(() => onClose(), 1200);
  };

  // Final Send Dispatch
  const handleFinalSend = () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        heading,
        messageType,
        priority,
        body: bodyHtml,
        expiryDate,
        submissionDeadline,
        attachments,
        recipients,
        sender: account?.name || 'Authorized Institutional Authority',
        department: account?.department || 'Office of Communications',
        estimatedCount: 180
      };

      if (isScheduled) {
        communicationStore.scheduleMessage({
          ...payload,
          scheduledFor: `${scheduledDate}T${scheduledTime}:00`
        }, account);
        showToast('✓ Announcement scheduled for automated delivery');
      } else {
        const sentMsg = communicationStore.sendNewMessage(payload, account);
        showToast(`✓ Notice #${sentMsg.id} dispatched across authorized channels!`);
      }

      if (initialDraft?.id) {
        communicationStore.deleteDraft(initialDraft.id);
      }

      if (onMessageSent) onMessageSent();
      setTimeout(() => {
        setIsSubmitting(false);
        setIsConfirmOpen(false);
        onClose();
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      setValidationError(err.message || 'Dispatch failed');
    }
  };

  return (
    <div className="apna-modal-backdrop" onClick={() => !isSubmitting && onClose()}>
      <div
        className="apna-composer-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* COMPOSER HEADER */}
        <div className="apna-composer-header">
          <div className="apna-composer-header-left">
            <div className="apna-composer-icon-badge">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="apna-composer-title">
                {isScheduled ? 'Schedule Institutional Announcement' : 'Create Message & Circular'}
              </h2>
              <p className="apna-composer-subtitle">
                Centralized Autonomous Dispatch · Multi-Role Targeting · Verified Documents
              </p>
            </div>
          </div>
          <button
            type="button"
            className="apna-composer-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close composer"
          >
            <X size={20} />
          </button>
        </div>

        {/* VALIDATION NOTICE */}
        {validationError && (
          <div className="apna-composer-alert error">
            <AlertCircle size={16} />
            <span>{validationError}</span>
            <button type="button" onClick={() => setValidationError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* COMPOSER BODY (SCROLLABLE) */}
        <div className="apna-composer-body">
          {/* SECTION 1: METADATA ROW */}
          <div className="apna-composer-grid-3">
            <div className="apna-form-group">
              <label className="apna-form-label">Message Type <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                className="apna-form-select"
                value={messageType}
                onChange={e => setMessageType(e.target.value)}
              >
                {MESSAGE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="apna-form-group">
              <label className="apna-form-label">Priority Level <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="apna-priority-pills">
                {PRIORITIES.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`apna-priority-btn ${priority === p.id ? 'active' : ''}`}
                    style={{
                      borderColor: priority === p.id ? p.color : '#e2e8f0',
                      color: priority === p.id ? p.color : '#475569',
                      background: priority === p.id ? p.bg : '#ffffff'
                    }}
                    onClick={() => setPriority(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="apna-form-group">
              <label className="apna-form-label">Issuing Authority / Sender</label>
              <input
                type="text"
                className="apna-form-input readonly"
                readOnly
                value={`${account?.name || 'Administrator'} (${account?.department || 'Deanery'})`}
              />
            </div>
          </div>

          {/* SECTION 2: TITLE & HEADING */}
          <div className="apna-form-group">
            <label className="apna-form-label" htmlFor="composer-title">
              <span>Message Title <span style={{ color: '#ef4444' }}>*</span></span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Concise title displayed in subject line</span>
            </label>
            <input
              id="composer-title"
              type="text"
              className="apna-form-input title-input"
              placeholder="e.g. B.Tech Modular Test II Examination Schedule & Hall Allotment"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="apna-composer-grid-2">
            <div className="apna-form-group">
              <label className="apna-form-label" htmlFor="composer-subheading">
                Subheading / Reference Circular No. (Optional)
              </label>
              <input
                id="composer-subheading"
                type="text"
                className="apna-form-input"
                placeholder="e.g. Ref No: GIFT/COE/2026/MOD-02"
                value={heading}
                onChange={e => setHeading(e.target.value)}
              />
            </div>

            <div className="apna-form-group">
              <label className="apna-form-label">
                Optional Action Deadline / Expiry Date
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="date"
                  className="apna-form-input"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  title="Notice Expiry Date"
                />
                <input
                  type="date"
                  className="apna-form-input"
                  value={submissionDeadline}
                  onChange={e => setSubmissionDeadline(e.target.value)}
                  title="Student Submission Deadline (if applicable)"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: RICH TEXT EDITOR */}
          <div className="apna-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="apna-form-label" style={{ margin: 0 }}>
                <span>Message Body &amp; Circular Text <span style={{ color: '#ef4444' }}>*</span></span>
              </label>
              <button
                type="button"
                className="apna-preview-toggle-btn"
                onClick={() => setIsPreviewOpen(prev => !prev)}
              >
                <Eye size={13} /> {isPreviewOpen ? 'Hide Live Preview' : 'Show Live Preview'}
              </button>
            </div>

            {/* Formatting Toolbar */}
            <div className="apna-editor-toolbar">
              <button type="button" onClick={() => executeCmd('bold')} title="Bold"><Bold size={14} /></button>
              <button type="button" onClick={() => executeCmd('italic')} title="Italic"><Italic size={14} /></button>
              <button type="button" onClick={() => executeCmd('underline')} title="Underline"><Underline size={14} /></button>
              <span className="toolbar-divider" />
              <button type="button" onClick={() => executeCmd('formatBlock', '<h2>')} title="Heading 2">H2</button>
              <button type="button" onClick={() => executeCmd('formatBlock', '<h3>')} title="Heading 3">H3</button>
              <button type="button" onClick={() => executeCmd('formatBlock', '<p>')} title="Paragraph">¶</button>
              <span className="toolbar-divider" />
              <button type="button" onClick={() => executeCmd('insertUnorderedList')} title="Bullet List"><List size={14} /></button>
              <button type="button" onClick={() => executeCmd('insertOrderedList')} title="Numbered List"><ListOrdered size={14} /></button>
              <span className="toolbar-divider" />
              <button type="button" onClick={() => executeCmd('justifyLeft')} title="Align Left"><AlignLeft size={14} /></button>
              <button type="button" onClick={() => executeCmd('justifyCenter')} title="Align Center"><AlignCenter size={14} /></button>
              <button type="button" onClick={() => executeCmd('justifyRight')} title="Align Right"><AlignRight size={14} /></button>
              <span className="toolbar-divider" />
              <button type="button" onClick={() => {
                const url = prompt('Enter link URL (e.g. https://...):');
                if (url) executeCmd('createLink', url);
              }} title="Insert Link"><Link2 size={14} /></button>
              <button type="button" onClick={() => {
                const tableHtml = '<table border="1" style="width:100%; border-collapse:collapse; margin:10px 0;"><tr><th style="padding:6px; background:#f1f5f9;">Date</th><th style="padding:6px; background:#f1f5f9;">Subject</th><th style="padding:6px; background:#f1f5f9;">Time</th></tr><tr><td style="padding:6px;">05 Nov 2026</td><td style="padding:6px;">Modular Test 2</td><td style="padding:6px;">08:30 AM</td></tr></table><p><br/></p>';
                executeCmd('insertHTML', tableHtml);
              }} title="Insert Sample Table"><TableIcon size={14} /></button>
              <button type="button" onClick={() => executeCmd('undo')} title="Undo"><RotateCcw size={14} /></button>
              <button type="button" onClick={() => executeCmd('redo')} title="Redo"><RotateCw size={14} /></button>
            </div>

            {/* Editable Content Area */}
            <div
              ref={editorRef}
              className="apna-rich-editor-box"
              contentEditable
              onInput={handleEditorInput}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
              role="textbox"
              aria-multiline="true"
              placeholder="Type or format your institutional announcement here..."
            />

            {/* Live Preview Drawer */}
            {isPreviewOpen && (
              <div className="apna-live-preview-box">
                <div className="preview-label">Live Recipient Preview</div>
                <div className="preview-header">
                  <span className={`apna-priority-tag ${priority.toLowerCase()}`}>{priority.toUpperCase()}</span>
                  <span className="apna-type-tag">{messageType}</span>
                </div>
                <h3 style={{ margin: '8px 0 4px', color: '#0f172a' }}>{title || 'Announcement Title'}</h3>
                {heading && <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>{heading}</div>}
                <div
                  className="preview-content-rendered"
                  dangerouslySetInnerHTML={{ __html: bodyHtml || '<em>Message content will be formatted here...</em>' }}
                />
              </div>
            )}
          </div>

          {/* SECTION 4: FILE ATTACHMENTS */}
          <div className="apna-form-group">
            <label className="apna-form-label">
              <span>Attached Documents &amp; Files</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Supports PDF, DOCX, XLSX, CSV, PPT, Images</span>
            </label>

            {/* Drag & Drop Zone */}
            <div
              className="apna-dropzone"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={22} color="#0284c7" />
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                Drag &amp; drop files here, or <span style={{ color: '#0284c7', textDecoration: 'underline' }}>browse from device</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Accepted: PDF, DOC, DOCX, XLSX, XLS, CSV, JPG, PNG (Max 25MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.ppt,.pptx"
              />
            </div>

            {/* Attachment Chips */}
            {attachments.length > 0 && (
              <div className="apna-attachment-chip-list">
                {attachments.map(att => (
                  <div key={att.id} className="apna-attachment-chip">
                    <Paperclip size={14} color="#0284c7" />
                    <div className="chip-details">
                      <span className="chip-name">{att.name}</span>
                      <span className="chip-size">
                        {att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Attached'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="chip-remove-btn"
                      onClick={() => handleRemoveAttachment(att.id)}
                      title="Remove attachment"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: DYNAMIC RECIPIENT SELECTOR */}
          <RecipientSelector
            value={recipients}
            onChange={setRecipients}
          />

          {/* SECTION 6: SCHEDULE TOGGLE */}
          <div className="apna-schedule-bar">
            <label className="apna-checkbox-label">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={e => setIsScheduled(e.target.checked)}
              />
              <Clock size={16} color="#7c3aed" />
              <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>Schedule for Automated Delivery Later</span>
            </label>

            {isScheduled && (
              <div className="apna-schedule-inputs">
                <input
                  type="date"
                  className="apna-form-input"
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setScheduledDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="apna-form-input"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* COMPOSER FOOTER */}
        <div className="apna-composer-footer">
          <div className="apna-footer-left">
            <button
              type="button"
              className="apna-btn secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              <Save size={15} /> Save Draft
            </button>
          </div>

          <div className="apna-footer-right">
            <button
              type="button"
              className="apna-btn secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="button"
              className="apna-btn primary"
              onClick={() => {
                if (validateForm()) {
                  setIsConfirmOpen(true);
                }
              }}
              disabled={isSubmitting}
            >
              {isScheduled ? <Clock size={15} /> : <Send size={15} />}
              <span>{isScheduled ? 'Schedule Message' : 'Send Announcement'}</span>
            </button>
          </div>
        </div>

        {/* CONFIRMATION DIALOG MODAL */}
        {isConfirmOpen && (
          <div className="apna-confirm-dialog-backdrop">
            <div className="apna-confirm-dialog-card">
              <div className="confirm-icon-wrap">
                <Send size={24} color="#0284c7" />
              </div>
              <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>
                Confirm Institutional Dispatch
              </h3>
              <p style={{ color: '#475569', fontSize: '0.86rem', lineHeight: 1.5 }}>
                Are you ready to broadcast <strong>"{title}"</strong> to the targeted stakeholders?
              </p>

              <div className="confirm-summary-list">
                <div><strong>Category:</strong> {messageType}</div>
                <div><strong>Priority:</strong> <span style={{ color: priority === 'Urgent' ? '#ea580c' : '#0284c7', fontWeight: 700 }}>{priority}</span></div>
                <div><strong>Target Stakeholders:</strong> {recipients.roles.join(', ') || 'Selected users'}</div>
                {recipients.branches?.length > 0 && <div><strong>Branches:</strong> {recipients.branches.join(', ')}</div>}
                {recipients.semesters?.length > 0 && <div><strong>Semesters:</strong> {recipients.semesters.join(', ')}</div>}
                <div><strong>Attachments:</strong> {attachments.length} document(s)</div>
              </div>

              <div className="confirm-dialog-actions">
                <button
                  type="button"
                  className="apna-btn secondary"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSubmitting}
                >
                  Edit Further
                </button>
                <button
                  type="button"
                  className="apna-btn primary"
                  onClick={handleFinalSend}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Dispatching...' : 'Confirm & Dispatch'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
