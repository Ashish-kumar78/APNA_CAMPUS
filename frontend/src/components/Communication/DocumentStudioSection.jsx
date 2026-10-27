// APNA CAMPUS — Smart Communication & Document Management System
// Document Studio Section: Word-Style Editor, Official Gazette Templates, PDF/Word Export & Document Library

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, Download, Send, Trash2, Edit3, Save,
  Check, Eye, Copy, ArrowLeft, Sparkles, FileSpreadsheet,
  CheckSquare, BookOpen, Layers, Printer, Share2, HelpCircle
} from 'lucide-react';
import { communicationStore } from '../../services/communicationStore.js';
import { exportToWord, exportTableToPdf } from '../../utils/documentExportUtils.js';

// Pre-built Institutional Gazette Templates
const OFFICIAL_TEMPLATES = [
  {
    id: 'tpl-exam-notice',
    name: 'Autonomous Examination Notice',
    category: 'Examination Cell',
    description: 'Official hall-ticket, conduct rules, and examination schedule circular',
    title: 'Autonomous Examination Cell Notification — Modular Examination 2026',
    templateType: 'notice',
    contentHtml: `
      <h2>AUTONOMOUS EXAMINATION CELL NOTIFICATION</h2>
      <p><strong>Ref No:</strong> AEC/AUT/2026/MOD-02 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Date:</strong> 27 October 2026</p>
      <p><strong>Sub:</strong> Guidelines for Modular Test-II Examination, Autumn Semester 2026-27.</p>
      <p>All candidates appearing for B.Tech, M.Tech, and MCA Modular Examinations are required to adhere strictly to the autonomous examination code of conduct:</p>
      <ol>
        <li>Candidates must report to designated examination halls at least 15 minutes before commencement.</li>
        <li>Biometric attendance check-in is mandatory at the entrance of each examination floor.</li>
        <li>Programmable calculators, mobile phones, smartwatch devices, and unauthorized study materials are strictly prohibited inside the examination hall.</li>
        <li>Autonomous answer scripts will be digitally scanned and evaluated through the encrypted barcode portal.</li>
      </ol>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Date</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Time</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Course Code & Subject</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Target Branches</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">05 Nov 2026</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">10:00 AM - 01:00 PM</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">CS501 - Data Structures & Algorithms</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">CSE, CSE (AI)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">07 Nov 2026</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">10:00 AM - 01:00 PM</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">AI502 - Deep Learning & Neural Nets</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">CSE (AI)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">09 Nov 2026</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">10:00 AM - 01:00 PM</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">EC401 - Signals & Linear Systems</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">ECE</td>
          </tr>
        </tbody>
      </table>
      <p>By Order of Controller of Examinations,<br/><strong>Autonomous Examination Cell · APNA CAMPUS</strong></p>
    `
  },
  {
    id: 'tpl-lab-assignment',
    name: 'Course Assignment & Rubrics',
    category: 'Academic Assignment',
    description: 'Coursework assignment problem statement, grading rubrics, and submission deadline',
    title: 'Department of Computer Science & Engineering — Laboratory Assignment 03',
    templateType: 'assignment',
    contentHtml: `
      <h2>Department of Computer Science & Engineering</h2>
      <h3>Course Code: CS501 — Advanced Algorithms & Distributed Data Structures</h3>
      <p><strong>Assignment 03 Problem Statement:</strong></p>
      <p>Design and implement a thread-safe Distributed Key-Value Store with consistent hashing and Raft consensus simulation in C++ or Java.</p>
      <h4>Mandatory Deliverables:</h4>
      <ul>
        <li>Source code repository link with unit tests achieving &gt;85% branch coverage.</li>
        <li>Benchmarking report comparing latency under 100 concurrent worker threads.</li>
        <li>Comprehensive architecture diagram in PDF format.</li>
      </ul>
      <h4>Grading Rubrics Breakdown (Total: 25 Marks):</h4>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; border: 1px solid #cbd5e1;">
        <tr style="background-color: #f8fafc;">
          <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">Component</th>
          <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">Weightage</th>
          <th style="padding: 6px; border: 1px solid #cbd5e1; text-align: left;">Evaluation Criteria</th>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">Consensus Correctness</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">10 Marks</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">Leader election & log replication</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">Concurrency & Thread Safety</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">8 Marks</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">Mutex/semaphore locking without deadlock</td>
        </tr>
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">Code Documentation & Readme</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">7 Marks</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">Clean Git commits & markdown documentation</td>
        </tr>
      </table>
      <p><strong>Submission Deadline:</strong> Friday, 15 November 2026, 11:59 PM.</p>
    `
  },
  {
    id: 'tpl-circular-admin',
    name: 'Institutional Staff Circular',
    category: 'Administrative Memo',
    description: 'Autonomous college administrative memorandum for staff and departments',
    title: 'Office of the Principal & Registrar — Staff General Circular',
    templateType: 'circular',
    contentHtml: `
      <h2>OFFICE OF THE PRINCIPAL & REGISTRAR</h2>
      <p><strong>CIRCULAR NO:</strong> AC/ADM/CIR-88/2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Date:</strong> 27 October 2026</p>
      <p><strong>To:</strong> All Heads of Departments, Deans, Teaching Faculty & Administrative Staff</p>
      <p><strong>Subject:</strong> NAAC Peer Review Team Visit & Departmental Documentation Audit</p>
      <p>In view of the upcoming NAAC Cycle-III Re-accreditation visit, all academic departments are advised to maintain verified course files, laboratory log registers, research publications dossiers, and student mentoring diaries updated through the APNA CAMPUS ERP system.</p>
      <p>Key checkpoints to be completed by 31 October 2026:</p>
      <ol>
        <li>Course attainment files with direct and indirect CO-PO mapping.</li>
        <li>Student internship and industry project completion certificates.</li>
        <li>Departmental advisory board meeting minutes and actions taken.</li>
      </ol>
      <p>Cooperation of all faculty and staff members is solicited for institutional excellence.<br/><br/><strong>Principal & Vice Chancellor</strong><br/>APNA CAMPUS Autonomous Higher Education</p>
    `
  },
  {
    id: 'tpl-bonafide-cert',
    name: 'Student Bonafide & Character Certificate',
    category: 'Deanery Certification',
    description: 'Autonomous student verification certificate for passport, visa, or bank loan',
    title: 'Institutional Bonafide & Conduct Certificate',
    templateType: 'certificate',
    contentHtml: `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2>TO WHOMSOEVER IT MAY CONCERN</h2>
        <h3>BONAFIDE CERTIFICATE</h3>
      </div>
      <p>This is to certify that Mr./Ms. <strong>[STUDENT_NAME]</strong>, bearing Registration Number <strong>[REGISTRATION_NUMBER]</strong>, is a bonafide student of this autonomous institution, currently pursuing <strong>Bachelor of Technology (B.Tech)</strong> in <strong>[BRANCH_NAME]</strong>, Semester <strong>[SEMESTER]</strong> for the academic session 2026-27.</p>
      <p>During his/her tenure at this institution, his/her conduct and character have been found to be <strong>SATISFACTORY & EXEMPLARY</strong>.</p>
      <p>This certificate is issued upon the request of the student for the purpose of <strong>[PURPOSE_E_G_PASSPORT_INTERNSHIP_EDUCATION_LOAN]</strong>.</p>
      <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div><strong>Date of Issue:</strong> 27 October 2026<br/>Place: Bhubaneswar</div>
        <div style="text-align: right;"><strong>Dean (Academic Affairs) & Registrar</strong><br/>APNA CAMPUS Autonomous Campus</div>
      </div>
    `
  }
];

export default function DocumentStudioSection({ activeAccount, onAttachToMessage, onNavigateTab }) {
  const [documents, setDocuments] = useState([]);
  const [viewMode, setViewMode] = useState('library'); // 'library' | 'editor' | 'preview'
  const [activeDocId, setActiveDocId] = useState(null);

  // Editor states
  const [docTitle, setDocTitle] = useState('');
  const [docStatus, setDocStatus] = useState('Draft');
  const [contentHtml, setContentHtml] = useState('');
  const [templateType, setTemplateType] = useState('custom');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const editorRef = useRef(null);

  // Sync with store
  useEffect(() => {
    const refresh = () => {
      const all = communicationStore.getDocuments();
      setDocuments(all);
    };
    refresh();
    const unsub = communicationStore.subscribe(refresh);
    return () => unsub();
  }, []);

  const openEditorForNew = (tpl = null) => {
    if (tpl) {
      setActiveDocId(null);
      setDocTitle(tpl.title);
      setDocStatus('Draft');
      setContentHtml(tpl.contentHtml);
      setTemplateType(tpl.templateType);
    } else {
      setActiveDocId(null);
      setDocTitle('Autonomous Institutional Document — ' + new Date().toLocaleDateString('en-GB'));
      setDocStatus('Draft');
      setContentHtml(`
        <h2>INSTITUTIONAL MEMORANDUM</h2>
        <p>Type your official announcement, guidelines, or notice content here...</p>
        <p><strong>Action required:</strong> Please review and execute as instructed.</p>
      `);
      setTemplateType('custom');
    }
    setViewMode('editor');
  };

  const openEditorForExisting = (doc) => {
    setActiveDocId(doc.id);
    setDocTitle(doc.title);
    setDocStatus(doc.status || 'Draft');
    setContentHtml(doc.contentHtml || '<p>No content</p>');
    setTemplateType(doc.templateType || 'custom');
    setViewMode('editor');
  };

  // ── Rich Text Formatting Helpers ──
  const execFormat = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
  };

  const insertHeading = (level) => {
    document.execCommand('formatBlock', false, level);
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Item / Description</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Branch / Section</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Deadline / Date</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Practical Exam Blueprint</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">CSE - 5th Sem</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">05 Nov 2026</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">Approved</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
  };

  // ── Save Document ──
  const handleSaveDocument = () => {
    const htmlToSave = editorRef.current ? editorRef.current.innerHTML : contentHtml;
    const docData = {
      id: activeDocId || `DOC-${Date.now().toString().slice(-4)}`,
      title: docTitle.trim() || 'Untitled Institutional Document',
      type: 'word',
      status: docStatus,
      templateType,
      contentHtml: htmlToSave,
      owner: activeAccount?.name || 'Academic Authority'
    };

    communicationStore.saveDocument(docData, activeAccount);
    setActiveDocId(docData.id);
    setContentHtml(htmlToSave);
    setSaveSuccessMsg('Document successfully saved to Document Studio.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // ── Export to Word (.doc) ──
  const handleExportWord = (docItem = null) => {
    const targetTitle = docItem ? docItem.title : docTitle;
    const targetHtml = docItem ? docItem.contentHtml : (editorRef.current ? editorRef.current.innerHTML : contentHtml);

    exportToWord(
      targetTitle || 'APNA_CAMPUS_Document',
      targetTitle,
      targetHtml,
      {
        sender: activeAccount?.name || 'Autonomous Deanery',
        department: activeAccount?.department || 'Office of Communications',
        date: new Date().toLocaleDateString('en-GB'),
        priority: 'Official Circular',
        recipients: 'Campus Wide'
      }
    );
  };

  // ── Export to PDF ──
  const handleExportPDF = (docItem = null) => {
    const targetTitle = docItem ? docItem.title : docTitle;
    const targetHtml = docItem ? docItem.contentHtml : (editorRef.current ? editorRef.current.innerHTML : contentHtml);

    // Extract text paragraphs and tables for a clean PDF
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(targetHtml, 'text/html');

    const headers = ['Section / Clause', 'Official Directive / Description'];
    const pElements = Array.from(parsedDoc.body.children);
    const tableRows = pElements.map((el, idx) => {
      const tag = el.tagName.toLowerCase();
      const prefix = tag.startsWith('h') ? `[${tag.toUpperCase()}]` : `Item ${idx + 1}`;
      return [prefix, el.textContent.trim()];
    }).filter(r => r[1].length > 0);

    exportTableToPdf(
      targetTitle || 'APNA_CAMPUS_Gazette',
      targetTitle,
      headers,
      tableRows.length > 0 ? tableRows : [['Directive', 'Official Institutional Notice Content']],
      `NAAC A++ Autonomous Campus · Official Gazette Reference: GAZ-${Date.now().toString(36).toUpperCase()}`
    );
  };

  // ── Attach to Message Workflow ──
  const handleAttachToMessage = (docItem = null) => {
    if (!onAttachToMessage) return;
    const item = docItem || {
      id: activeDocId || `DOC-${Date.now().toString().slice(-4)}`,
      title: docTitle,
      contentHtml: editorRef.current ? editorRef.current.innerHTML : contentHtml
    };

    const attachment = {
      id: `att-doc-${Date.now()}`,
      name: `${(item.title || 'Institutional_Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      size: 340000,
      type: 'application/pdf',
      isGeneratedDoc: true,
      docData: item
    };

    onAttachToMessage(attachment);
  };

  // ── Delete Document with Confirmation ──
  const handleDeleteDocument = (id) => {
    if (window.confirm('Are you sure you want to delete this document draft? This action cannot be undone.')) {
      communicationStore.deleteDocument(id);
      if (activeDocId === id) {
        setViewMode('library');
      }
    }
  };

  return (
    <div className="comm-doc-studio-container">
      {/* Studio Header */}
      <div className="comm-sub-header">
        <div className="comm-sub-header-left">
          <div className="comm-sub-icon-badge">
            <FileText size={22} className="text-sky-600" />
          </div>
          <div>
            <h2 className="comm-sub-title">Document Studio & Gazette Publishing</h2>
            <p className="comm-sub-desc">
              Word-style rich authoring, official gazette templates, PDF/DOCX generation & message attachments
            </p>
          </div>
        </div>

        <div className="comm-sub-header-actions">
          {viewMode === 'library' ? (
            <>
              <button
                type="button"
                className="comm-btn-secondary"
                onClick={() => onNavigateTab && onNavigateTab('Spreadsheets')}
                title="Open Spreadsheets module"
              >
                <FileSpreadsheet size={16} /> New Sheet
              </button>
              <button
                type="button"
                className="comm-btn-secondary"
                onClick={() => onNavigateTab && onNavigateTab('Forms & Surveys')}
                title="Open Form Builder"
              >
                <CheckSquare size={16} /> New Form
              </button>
              <button
                type="button"
                className="comm-btn-primary"
                onClick={() => openEditorForNew()}
              >
                <Plus size={16} /> Create Word Document
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="comm-btn-secondary"
                onClick={() => setViewMode('library')}
              >
                <ArrowLeft size={16} /> Document Library
              </button>
              <button
                type="button"
                className="comm-btn-secondary"
                onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
              >
                <Eye size={16} /> {viewMode === 'editor' ? 'Gazette Preview' : 'Edit Content'}
              </button>
              <button
                type="button"
                className="comm-btn-primary"
                onClick={handleSaveDocument}
              >
                <Save size={16} /> Save Document
              </button>
            </>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="comm-alert comm-alert-success">
          <Check size={16} /> {saveSuccessMsg}
        </div>
      )}

      {/* ── MODE 1: DOCUMENT LIBRARY ── */}
      {viewMode === 'library' && (
        <div className="comm-doc-library-view">
          {/* Templates Section */}
          <div className="comm-doc-templates-panel">
            <h3 className="comm-panel-title">
              <Sparkles size={16} className="text-amber-500" /> Pre-Formatted Autonomous Gazette Templates
            </h3>
            <div className="comm-templates-grid">
              {OFFICIAL_TEMPLATES.map(tpl => (
                <div key={tpl.id} className="comm-template-card">
                  <div className="comm-template-card-header">
                    <span className="comm-template-badge">{tpl.category}</span>
                  </div>
                  <h4 className="comm-template-name">{tpl.name}</h4>
                  <p className="comm-template-desc">{tpl.description}</p>
                  <button
                    type="button"
                    className="comm-template-use-btn"
                    onClick={() => openEditorForNew(tpl)}
                  >
                    Use This Template →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Documents Listing Table */}
          <div className="comm-doc-list-panel">
            <div className="comm-panel-header">
              <h3 className="comm-panel-title">
                <BookOpen size={16} className="text-sky-600" /> Active Campus Documents & Drafts ({documents.length})
              </h3>
            </div>

            <div className="comm-doc-table-container">
              <table className="comm-doc-table">
                <thead>
                  <tr>
                    <th>Document Title</th>
                    <th>Category / Status</th>
                    <th>Author / Owner</th>
                    <th>Last Modified</th>
                    <th className="text-right">Export & Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td className="comm-doc-title-cell">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-sky-600 shrink-0" />
                          <div>
                            <span className="comm-doc-title-text" onClick={() => openEditorForExisting(doc)}>
                              {doc.title}
                            </span>
                            <span className="comm-doc-id-sub">{doc.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="comm-doc-status-pill">{doc.status || 'Active Gazette'}</span>
                      </td>
                      <td className="text-slate-600 text-sm">{doc.owner || 'Deanery'}</td>
                      <td className="text-slate-500 text-xs">
                        {new Date(doc.lastModified).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="text-right">
                        <div className="comm-doc-action-btns">
                          <button
                            type="button"
                            className="comm-btn-icon"
                            onClick={() => openEditorForExisting(doc)}
                            title="Edit Document"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="comm-btn-icon"
                            onClick={() => handleExportWord(doc)}
                            title="Download Word Document (.doc)"
                          >
                            <Download size={15} className="text-blue-600" />
                          </button>
                          <button
                            type="button"
                            className="comm-btn-icon"
                            onClick={() => handleExportPDF(doc)}
                            title="Download Gazette PDF"
                          >
                            <Printer size={15} className="text-rose-600" />
                          </button>
                          <button
                            type="button"
                            className="comm-btn-icon"
                            onClick={() => handleAttachToMessage(doc)}
                            title="Attach to Message Composer"
                          >
                            <Send size={15} className="text-emerald-600" />
                          </button>
                          <button
                            type="button"
                            className="comm-btn-icon text-rose-500 hover:text-rose-700"
                            onClick={() => handleDeleteDocument(doc.id)}
                            title="Delete Draft"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        No documents created yet. Choose a template above or click "Create Word Document".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: WORD-STYLE DOCUMENT EDITOR ── */}
      {viewMode === 'editor' && (
        <div className="comm-word-editor-layout">
          {/* Document Properties Header Bar */}
          <div className="comm-editor-doc-bar">
            <input
              type="text"
              className="comm-doc-title-input"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Enter Document Title..."
            />
            <div className="comm-doc-meta-right">
              <select
                className="comm-select-sm"
                value={docStatus}
                onChange={(e) => setDocStatus(e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Official Gazette">Official Gazette</option>
                <option value="Course Material">Course Material</option>
                <option value="Archived">Archived</option>
              </select>

              <button
                type="button"
                className="comm-btn-sm comm-btn-outline"
                onClick={() => handleExportWord()}
              >
                <Download size={14} /> Word (.DOC)
              </button>
              <button
                type="button"
                className="comm-btn-sm comm-btn-outline"
                onClick={() => handleExportPDF()}
              >
                <Download size={14} /> PDF
              </button>
              <button
                type="button"
                className="comm-btn-sm comm-btn-accent"
                onClick={() => handleAttachToMessage()}
              >
                <Send size={14} /> Attach to Message
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="comm-word-toolbar">
            <select
              className="comm-toolbar-select"
              onChange={(e) => insertHeading(e.target.value)}
              defaultValue="p"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>

            <div className="comm-toolbar-divider" />

            <button type="button" className="comm-toolbar-btn font-bold" onClick={() => execFormat('bold')} title="Bold">
              B
            </button>
            <button type="button" className="comm-toolbar-btn italic font-serif" onClick={() => execFormat('italic')} title="Italic">
              I
            </button>
            <button type="button" className="comm-toolbar-btn underline" onClick={() => execFormat('underline')} title="Underline">
              U
            </button>

            <div className="comm-toolbar-divider" />

            <button type="button" className="comm-toolbar-btn" onClick={() => execFormat('justifyLeft')} title="Align Left">
              ⇤
            </button>
            <button type="button" className="comm-toolbar-btn" onClick={() => execFormat('justifyCenter')} title="Align Center">
              ≡
            </button>
            <button type="button" className="comm-toolbar-btn" onClick={() => execFormat('justifyRight')} title="Align Right">
              ⇥
            </button>

            <div className="comm-toolbar-divider" />

            <button type="button" className="comm-toolbar-btn" onClick={() => execFormat('insertUnorderedList')} title="Bullet List">
              • List
            </button>
            <button type="button" className="comm-toolbar-btn" onClick={() => execFormat('insertOrderedList')} title="Numbered List">
              1. List
            </button>
            <button type="button" className="comm-toolbar-btn" onClick={insertTable} title="Insert Data Table">
              + Table
            </button>

            <div className="comm-toolbar-divider" />

            <button type="button" className="comm-toolbar-btn" onClick={() => execFormat('undo')} title="Undo">
              ↶
            </button>
            <button type="button" className="comm-toolbar-btn" onClick={() => execFormat('redo')} title="Redo">
              ↷
            </button>
          </div>

          {/* Document Canvas (A4 White Page Preview) */}
          <div className="comm-word-canvas-wrapper">
            <div className="comm-word-page">
              {/* Institutional Letterhead Header */}
              <div className="comm-word-letterhead">
                <div className="comm-letterhead-title">APNA CAMPUS · AUTONOMOUS HIGHER EDUCATION</div>
                <div className="comm-letterhead-subtitle">
                  NAAC A++ Autonomous Institution · Office of Communications & Deanery
                </div>
                <div className="comm-letterhead-gazette-line">
                  OFFICIAL INSTITUTIONAL GAZETTE & COURSEWARE ARCHIVE
                </div>
              </div>

              {/* Editable Content Region */}
              <div
                ref={editorRef}
                className="comm-word-editable-body"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: contentHtml }}
                onInput={() => {
                  if (editorRef.current) {
                    setContentHtml(editorRef.current.innerHTML);
                  }
                }}
              />

              {/* Letterhead Footer */}
              <div className="comm-word-footer">
                <span>APNA CAMPUS ERP v3.0 · Official Verified Gazette Document</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 3: OFFICIAL GAZETTE PREVIEW ── */}
      {viewMode === 'preview' && (
        <div className="comm-preview-container">
          <div className="comm-preview-page-card">
            <div className="comm-word-letterhead">
              <div className="comm-letterhead-title">APNA CAMPUS · AUTONOMOUS HIGHER EDUCATION</div>
              <div className="comm-letterhead-subtitle">
                NAAC A++ Autonomous Institution · Office of Communications & Deanery
              </div>
              <div className="comm-letterhead-gazette-line">
                OFFICIAL INSTITUTIONAL GAZETTE & COURSEWARE ARCHIVE
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-xl font-bold text-slate-800 border-b pb-3 mb-4">{docTitle}</h1>
              <div
                className="prose max-w-none text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>

            <div className="comm-word-footer mt-10">
              <span>APNA CAMPUS ERP v3.0 · Official Verified Gazette Document</span>
              <span>Generated on {new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
