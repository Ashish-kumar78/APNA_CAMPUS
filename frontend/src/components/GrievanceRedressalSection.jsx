import React, { useState, useRef, useEffect } from 'react';
import {
  List,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  FileSpreadsheet,
  FileText,
  Plus,
  Minus,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './GrievanceRedressalSection.css';

// ── Exact Nature of Grievance Options (From User Image 2) ──
export const GRIEVANCE_NATURE_OPTIONS = [
  'Select',
  'Issues about Personal Belongings',
  'Issues about Hostel Life',
  'Making admission contrary to merit',
  'Irregularity in the admission process',
  'Refusing admission in accordance with the declared admission policy of the institute',
  'Non publication of prospectus',
  'Publishing false or misleading information in the prospectus',
  'Withhold or refuse to return any certificate or documents for the purpose of seeking admission',
  'Demand of money in excess of that specified in the declared admission policy',
  'Breach of the policy for reservation in admission',
  'Alleged discrimination of students from SC/ST/OBC/Women/Minority/Disabled category',
  'Non payment or delay in payment of scholarship',
  'Delay in conducting examination or declaration of results',
  'No provision of student amenities',
  'Unfair evaluation practices',
  'Harassment and victimization including sexual harassment'
];

// ── Earlier Lodged Options (From User Image 3) ──
export const EARLIER_LODGED_OPTIONS = ['No', 'Yes'];

const STORAGE_KEY = 'apna_campus_student_grievance_history';

export default function GrievanceRedressalSection({ studentAccount }) {
  // Collapsible toggle for "+ Do you have any grievance?"
  const [isOpen, setIsOpen] = useState(true);

  // Form states
  const [nature, setNature] = useState('Select');
  const [description, setDescription] = useState('');
  const [earlierLodged, setEarlierLodged] = useState('No');
  const [attachment, setAttachment] = useState(null);

  // Feedback notifications
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  // Hidden file input reference
  const fileInputRef = useRef(null);

  // History list from localStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load grievance history:', e);
    }
    return [];
  });

  // Table Column Filter States
  const [filters, setFilters] = useState({
    nature: '',
    description: '',
    earlierLodged: '',
    createdBy: '',
    resolved: '',
    resolvedBy: '',
    actionTaken: ''
  });

  // Save history changes to localStorage
  const saveHistory = (items) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist grievance history:', e);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // Handle document file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert('error', 'File size exceeds maximum 10MB limit.');
      return;
    }

    setAttachment({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type
    });
    showAlert('success', `File attached: ${file.name}`);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Reset
  const handleReset = () => {
    setNature('Select');
    setDescription('');
    setEarlierLodged('No');
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nature || nature === 'Select') {
      showAlert('error', 'Please select a valid Nature of Grievance.');
      return;
    }

    if (!description.trim()) {
      showAlert('error', 'Please enter a Grievance Description.');
      return;
    }

    const creatorName = studentAccount?.name || 'Ashish Kumar';
    const regNo = studentAccount?.registrationNumber || '2201289123';
    const createdByStr = `${creatorName} (${regNo})`;

    const newGrievance = {
      id: history.length + 1,
      ticketNumber: `GR-${new Date().getFullYear()}-${String(history.length + 1).padStart(4, '0')}`,
      nature,
      description: description.trim(),
      earlierLodged,
      attachmentName: attachment?.name || null,
      attachmentSize: attachment?.size || null,
      createdBy: createdByStr,
      resolved: 'Pending',
      resolvedBy: 'Under Grievance Cell Review',
      actionTaken: 'Ticket registered. Awaiting initial assessment by the autonomous redressal officer.',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updated = [newGrievance, ...history];
    saveHistory(updated);
    handleReset();
    showAlert('success', 'Request for Grievance Redressal submitted successfully!');

    // Smooth scroll to history table
    const tableEl = document.getElementById('grievance-history-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Compute filtered records
  const filteredHistory = history.filter((item) => {
    if (filters.nature && !item.nature.toLowerCase().includes(filters.nature.toLowerCase())) {
      return false;
    }
    if (filters.description && !item.description.toLowerCase().includes(filters.description.toLowerCase())) {
      return false;
    }
    if (filters.earlierLodged && !item.earlierLodged.toLowerCase().includes(filters.earlierLodged.toLowerCase())) {
      return false;
    }
    if (filters.createdBy && filters.createdBy !== 'ALL' && !item.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase())) {
      return false;
    }
    if (filters.resolved && !item.resolved.toLowerCase().includes(filters.resolved.toLowerCase())) {
      return false;
    }
    if (filters.resolvedBy && filters.resolvedBy !== 'ALL' && !item.resolvedBy.toLowerCase().includes(filters.resolvedBy.toLowerCase())) {
      return false;
    }
    if (filters.actionTaken && !item.actionTaken.toLowerCase().includes(filters.actionTaken.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Unique creators & resolvers for filter dropdowns
  const uniqueCreators = Array.from(new Set(history.map((h) => h.createdBy))).filter(Boolean);
  const uniqueResolvers = Array.from(new Set(history.map((h) => h.resolvedBy))).filter(Boolean);

  // ── PDF Export Functionality ──
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Header Bar
      doc.setFillColor(30, 96, 170); // #1e60aa
      doc.rect(0, 0, 297, 20, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('APNA CAMPUS ENTERPRISE ERP - GRIEVANCE REDRESSAL RECORD', 14, 13);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 215, 13);

      const tableData = (filteredHistory.length > 0 ? filteredHistory : history).map((item, idx) => [
        idx + 1,
        item.nature,
        item.description,
        item.earlierLodged,
        item.attachmentName || 'None',
        item.createdBy,
        item.resolved,
        item.resolvedBy,
        item.actionTaken
      ]);

      if (tableData.length === 0) {
        tableData.push(['-', 'No results found.', '-', '-', '-', '-', '-', '-', '-']);
      }

      autoTable(doc, {
        startY: 26,
        head: [[
          '#',
          'Nature of Grievance',
          'Grievance Description',
          'Earlier Lodged?',
          'Attachment',
          'Created by',
          'Whether Resolved?',
          'Resolved by',
          'Detail Action Taken'
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 96, 170],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 42 },
          2: { cellWidth: 50 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 24 },
          5: { cellWidth: 32 },
          6: { cellWidth: 24, halign: 'center' },
          7: { cellWidth: 34 },
          8: { cellWidth: 41 }
        }
      });

      doc.save(`Grievance_Redressal_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      showAlert('success', 'PDF Grievance History exported successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      showAlert('error', 'Failed to generate PDF. Please try again.');
    }
  };

  // ── EXCEL Export Functionality ──
  const handleExportExcel = () => {
    try {
      const recordsToExport = filteredHistory.length > 0 ? filteredHistory : history;

      const excelRows = recordsToExport.map((item, idx) => ({
        '#': idx + 1,
        'Ticket ID': item.ticketNumber || `GR-${idx + 1}`,
        'Nature of Grievance': item.nature,
        'Grievance Description': item.description,
        'Have you earlier lodged grievance on same subject?': item.earlierLodged,
        'Attachment': item.attachmentName || 'No attachment',
        'Created by': item.createdBy,
        'Whether Resolved?': item.resolved,
        'Resolved by': item.resolvedBy,
        'Detail Action Taken': item.actionTaken,
        'Date Lodged': item.createdAt || '-'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(
        excelRows.length > 0
          ? excelRows
          : [{ Note: 'No results found in Grievance History' }]
      );

      XLSX.utils.book_append_sheet(wb, ws, 'Grievance_History');
      XLSX.writeFile(wb, `Grievance_Redressal_History_${new Date().toISOString().split('T')[0]}.xlsx`);
      showAlert('success', 'Excel file exported successfully!');
    } catch (err) {
      console.error('Excel export error:', err);
      showAlert('error', 'Failed to generate Excel file.');
    }
  };

  return (
    <section className="grievance-redressal-container" id="grievance-redressal-section">
      {/* Alert Banner */}
      {alert && (
        <div className={`grievance-alert-banner grievance-alert-${alert.type}`} role="alert">
          {alert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TOP CARD: + Do you have any grievance? (EXACT IMAGE 1 MATCH)
          ───────────────────────────────────────────────────────────── */}
      <div
        className="grievance-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        title="Click to toggle grievance form"
      >
        <h3 className="grievance-accordion-title">
          <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
          <span>Do you have any grievance?</span>
        </h3>
      </div>

      {/* Green Horizontal Accent Line */}
      <div className="grievance-card-divider" />

      {isOpen && (
        <div className="grievance-form-card">
          <form onSubmit={handleSubmit} noValidate>
            {/* 1. Nature of Grievance * (Image 1 & 2) */}
            <div className="grievance-form-group">
              <label htmlFor="nature-of-grievance" className="grievance-form-label">
                <span>Nature of Grievance</span>
                <span className="grievance-required-star">*</span>
              </label>
              <select
                id="nature-of-grievance"
                className="grievance-select-input"
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                required
              >
                {GRIEVANCE_NATURE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Grievance Description * (Image 1) */}
            <div className="grievance-form-group">
              <label htmlFor="grievance-description" className="grievance-form-label">
                <span>Grievance Description</span>
                <span className="grievance-required-star">*</span>
              </label>
              <textarea
                id="grievance-description"
                className="grievance-textarea-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=""
                required
              />
            </div>

            {/* 3. Have you earlier lodged grievance on same subject? * (Image 1 & 3) */}
            <div className="grievance-form-group">
              <label htmlFor="earlier-lodged-select" className="grievance-form-label">
                <span>Have you earlier lodged the grievance on the same subject?</span>
                <span className="grievance-required-star">*</span>
              </label>
              <select
                id="earlier-lodged-select"
                className="grievance-select-input"
                value={earlierLodged}
                onChange={(e) => setEarlierLodged(e.target.value)}
                required
              >
                {EARLIER_LODGED_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />

            {/* Attached File Preview Chip */}
            {attachment && (
              <div className="grievance-attached-badge">
                <Paperclip size={13} />
                <span>
                  Attached: <strong>{attachment.name}</strong> ({attachment.size})
                </span>
                <button
                  type="button"
                  className="grievance-attached-remove"
                  onClick={handleRemoveAttachment}
                  title="Remove attachment"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Action Buttons: [Attach Document if any] [Request Grievance Redressal] [Reset] */}
            <div className="grievance-form-actions">
              <button
                type="button"
                className="btn-attach-document"
                onClick={() => fileInputRef.current?.click()}
                title="Select document to attach (PDF, Doc, Image up to 10MB)"
              >
                Attach Document if any
              </button>

              <button
                type="submit"
                className="btn-request-grievance"
                title="Submit grievance redressal request"
              >
                Request Grievance Redressal
              </button>

              <button
                type="button"
                className="btn-reset-grievance"
                onClick={handleReset}
                title="Reset form fields"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM CARD: := Grievance History (EXACT IMAGE 1 MATCH)
          ───────────────────────────────────────────────────────────── */}
      <div className="grievance-history-section" id="grievance-history-table">
        <div className="grievance-history-header-bar">
          <h3 className="grievance-history-title">
            <List size={20} />
            <span>Grievance History</span>
          </h3>

          <div className="grievance-export-buttons">
            <button
              type="button"
              className="btn-export-pdf"
              onClick={handleExportPDF}
              title="Export Grievance History to PDF"
            >
              PDF
            </button>
            <button
              type="button"
              className="btn-export-excel"
              onClick={handleExportExcel}
              title="Export Grievance History to Excel (.xlsx)"
            >
              EXCEL
            </button>
          </div>
        </div>

        {/* Grievance History Table with Header & Subheader Filter Row */}
        <div className="grievance-table-wrapper">
          <table className="grievance-data-table" aria-label="Grievance History">
            <thead>
              {/* Primary Header Row (Blue Text in Screenshot) */}
              <tr className="header-row">
                <th className="col-num">#</th>
                <th className="col-nature">Nature of Grievance</th>
                <th className="col-desc">Grievance Description</th>
                <th className="col-earlier">Have you earlier lodged the grievance on the same subject?</th>
                <th className="col-attach">Attachment</th>
                <th className="col-creator">Created by</th>
                <th className="col-status">Whether Resolved?</th>
                <th className="col-resolver">Resolved by</th>
                <th className="col-action">Detail Action Taken</th>
              </tr>

              {/* Sub-Header Filter Row (Inputs and Selects in Screenshot) */}
              <tr className="filter-row">
                <th className="col-num" />
                <th className="col-nature">
                  <input
                    type="text"
                    className="grievance-filter-input"
                    value={filters.nature}
                    onChange={(e) => handleFilterChange('nature', e.target.value)}
                    aria-label="Filter Nature of Grievance"
                  />
                </th>
                <th className="col-desc">
                  <input
                    type="text"
                    className="grievance-filter-input"
                    value={filters.description}
                    onChange={(e) => handleFilterChange('description', e.target.value)}
                    aria-label="Filter Grievance Description"
                  />
                </th>
                <th className="col-earlier">
                  <input
                    type="text"
                    className="grievance-filter-input"
                    value={filters.earlierLodged}
                    onChange={(e) => handleFilterChange('earlierLodged', e.target.value)}
                    aria-label="Filter Have you earlier lodged"
                  />
                </th>
                <th className="col-attach" />
                <th className="col-creator">
                  <select
                    className="grievance-filter-select"
                    value={filters.createdBy}
                    onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                    aria-label="Filter Created By"
                  >
                    <option value="">-- All --</option>
                    {uniqueCreators.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="col-status">
                  <input
                    type="text"
                    className="grievance-filter-input"
                    value={filters.resolved}
                    onChange={(e) => handleFilterChange('resolved', e.target.value)}
                    aria-label="Filter Whether Resolved"
                  />
                </th>
                <th className="col-resolver">
                  <select
                    className="grievance-filter-select"
                    value={filters.resolvedBy}
                    onChange={(e) => handleFilterChange('resolvedBy', e.target.value)}
                    aria-label="Filter Resolved By"
                  >
                    <option value="">-- All --</option>
                    {uniqueResolvers.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="col-action">
                  <input
                    type="text"
                    className="grievance-filter-input"
                    value={filters.actionTaken}
                    onChange={(e) => handleFilterChange('actionTaken', e.target.value)}
                    aria-label="Filter Detail Action Taken"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="grievance-no-records">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="col-num">{index + 1}</td>
                    <td className="col-nature">
                      <strong>{item.nature}</strong>
                      {item.ticketNumber && (
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                          Ticket: {item.ticketNumber}
                        </div>
                      )}
                    </td>
                    <td className="col-desc">{item.description}</td>
                    <td className="col-earlier" style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{item.earlierLodged}</span>
                    </td>
                    <td className="col-attach" style={{ textAlign: 'center' }}>
                      {item.attachmentName ? (
                        <span
                          className="grievance-attach-link"
                          title={`Attached: ${item.attachmentName}`}
                          onClick={() => showAlert('success', `Viewing attached file: ${item.attachmentName}`)}
                        >
                          <Paperclip size={12} />
                          {item.attachmentName.length > 12
                            ? `${item.attachmentName.slice(0, 10)}...`
                            : item.attachmentName}
                        </span>
                      ) : (
                        <span className="grievance-attach-none">No file</span>
                      )}
                    </td>
                    <td className="col-creator">{item.createdBy}</td>
                    <td className="col-status">
                      <span
                        className={`badge-status ${
                          item.resolved === 'Yes' || item.resolved === 'Resolved'
                            ? 'badge-status-resolved'
                            : item.resolved === 'Rejected'
                            ? 'badge-status-rejected'
                            : item.resolved === 'Under Review'
                            ? 'badge-status-review'
                            : 'badge-status-pending'
                        }`}
                      >
                        {item.resolved}
                      </span>
                    </td>
                    <td className="col-resolver">{item.resolvedBy}</td>
                    <td className="col-action">{item.actionTaken}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
