// APNA CAMPUS — Smart Communication & Document Management System
// Spreadsheets Section: Interactive Sheet Editor, Templates, Formulas, Import/Export & Attach to Message

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Table, Plus, Trash2, Download, Upload, FileSpreadsheet,
  Send, RefreshCw, Search, ArrowUpDown, Check, AlertCircle,
  Copy, ClipboardCheck, Sparkles, ChevronDown, HelpCircle, Save, Undo
} from 'lucide-react';
import { communicationStore } from '../../services/communicationStore.js';
import { exportToExcel, exportToCsv, exportTableToPdf } from '../../utils/documentExportUtils.js';

// ── Built-in Institutional Templates ──
const SPREADSHEET_TEMPLATES = [
  {
    id: 'tpl-students',
    name: 'Student Registration Master',
    category: 'Student Records',
    description: 'Admitted students directory with roll number, branch, semester and contact',
    columns: [
      { key: 'regNo', label: 'Reg. Number', width: 130 },
      { key: 'studentName', label: 'Student Name', width: 180 },
      { key: 'branch', label: 'Branch', width: 120 },
      { key: 'year', label: 'Year', width: 90 },
      { key: 'section', label: 'Section', width: 80 },
      { key: 'email', label: 'Institutional Email', width: 200 },
      { key: 'phone', label: 'Contact Phone', width: 120 },
      { key: 'status', label: 'Enrollment Status', width: 120 }
    ],
    rows: [
      { regNo: '2301289001', studentName: 'Rakesh Das', branch: 'CSE (AI)', year: '3rd Year', section: 'A', email: 'rakesh.d@campus.ac.in', phone: '9876543210', status: 'Regular' },
      { regNo: '2301289002', studentName: 'Alok Panda', branch: 'CSE', year: '3rd Year', section: 'A', email: 'alok.p@campus.ac.in', phone: '9876543211', status: 'Regular' },
      { regNo: '2301289003', studentName: 'Deepak Sethi', branch: 'CSE', year: '3rd Year', section: 'B', email: 'deepak.s@campus.ac.in', phone: '9876543212', status: 'Regular' },
      { regNo: '2301289004', studentName: 'Priya Patra', branch: 'CSE (AI)', year: '3rd Year', section: 'B', email: 'priya.p@campus.ac.in', phone: '9876543213', status: 'Regular' },
      { regNo: '2301289005', studentName: 'Sneha Mohanty', branch: 'CSE (AI)', year: '3rd Year', section: 'A', email: 'sneha.m@campus.ac.in', phone: '9876543214', status: 'Regular' }
    ]
  },
  {
    id: 'tpl-internship',
    name: 'Internship & Campus Placement Tracker',
    category: 'Placement Cell',
    description: 'Corporate recruiters, package CTC, test rounds, and selection counts',
    columns: [
      { key: 'company', label: 'Company Name', width: 160 },
      { key: 'role', label: 'Job Role', width: 150 },
      { key: 'ctc', label: 'CTC Package', width: 110 },
      { key: 'applied', label: 'Applicants', width: 90 },
      { key: 'shortlisted', label: 'Shortlisted', width: 100 },
      { key: 'placed', label: 'Selected', width: 90 },
      { key: 'driveDate', label: 'Drive Date', width: 110 },
      { key: 'status', label: 'Status', width: 120 }
    ],
    rows: [
      { company: 'Tata Consultancy Services', role: 'Digital & Ninja', ctc: '₹7.0 - 9.0 LPA', applied: 320, shortlisted: 145, placed: 42, driveDate: '2026-10-18', status: 'Completed' },
      { company: 'Cognizant Technology', role: 'Programmer Analyst', ctc: '₹6.5 LPA', applied: 280, shortlisted: 110, placed: 35, driveDate: '2026-10-22', status: 'Completed' },
      { company: 'Infosys Limited', role: 'Systems Engineer', ctc: '₹6.25 - 9.5 LPA', applied: 310, shortlisted: 95, placed: 28, driveDate: '2026-10-25', status: 'In Evaluation' },
      { company: 'Tech Mahindra', role: 'Software Engineer', ctc: '₹5.5 LPA', applied: 240, shortlisted: 80, placed: 20, driveDate: '2026-10-28', status: 'Scheduled' }
    ]
  },
  {
    id: 'tpl-attendance',
    name: 'Attendance & Exam Condonation Matrix',
    category: 'Examination Lists',
    description: 'Modular exam attendance calculation and 75% autonomous eligibility',
    columns: [
      { key: 'roll', label: 'Roll No', width: 120 },
      { key: 'name', label: 'Student Name', width: 170 },
      { key: 'branch', label: 'Branch', width: 110 },
      { key: 'held', label: 'Classes Held', width: 100 },
      { key: 'attended', label: 'Attended', width: 90 },
      { key: 'percentage', label: 'Attendance %', width: 110 },
      { key: 'eligible', label: 'Exam Eligibility', width: 130 }
    ],
    rows: [
      { roll: '2301289001', name: 'Rakesh Das', branch: 'CSE (AI)', held: 50, attended: 47, percentage: '94.0%', eligible: 'Eligible' },
      { roll: '2301289002', name: 'Alok Panda', branch: 'CSE', held: 50, attended: 43, percentage: '86.0%', eligible: 'Eligible' },
      { roll: '2301289003', name: 'Deepak Sethi', branch: 'CSE', held: 50, attended: 45, percentage: '90.0%', eligible: 'Eligible' },
      { roll: '2301289006', name: 'Suman Rout', branch: 'ECE', held: 50, attended: 33, percentage: '66.0%', eligible: 'Condonation Req.' },
      { roll: '2301289007', name: 'Bikash Jena', branch: 'MECH', held: 50, attended: 42, percentage: '84.0%', eligible: 'Eligible' }
    ]
  },
  {
    id: 'tpl-hostel',
    name: 'Hostel Room & Facility Maintenance Log',
    category: 'Hostel Complaints',
    description: 'Maintenance tickets, block, room, repair category, and resolution status',
    columns: [
      { key: 'ticketId', label: 'Ticket ID', width: 110 },
      { key: 'block', label: 'Hostel Block', width: 140 },
      { key: 'room', label: 'Room No', width: 90 },
      { key: 'category', label: 'Category', width: 120 },
      { key: 'reportedBy', label: 'Reported By', width: 150 },
      { key: 'assignedStaff', label: 'Assigned Staff', width: 140 },
      { key: 'status', label: 'Status', width: 120 }
    ],
    rows: [
      { ticketId: 'HST-101', block: 'Sarojini Girls A', room: '204', category: 'Plumbing', reportedBy: 'Sneha Mohanty', assignedStaff: 'Sunil Behera', status: 'In Progress' },
      { ticketId: 'HST-102', block: 'Gandhi Boys B', room: '112', category: 'Electrical', reportedBy: 'Alok Panda', assignedStaff: 'Santosh Jena', status: 'Resolved' },
      { ticketId: 'HST-103', block: 'Kalam Boys', room: '305', category: 'Furniture', reportedBy: 'Rakesh Das', assignedStaff: 'Pramod Sethi', status: 'Pending Review' }
    ]
  },
  {
    id: 'tpl-staff',
    name: 'Faculty & Staff Workload Allocation',
    category: 'Staff Information',
    description: 'Faculty designation, department, teaching hours, and lab assignments',
    columns: [
      { key: 'empId', label: 'Emp ID', width: 100 },
      { key: 'facultyName', label: 'Faculty Name', width: 170 },
      { key: 'dept', label: 'Department', width: 120 },
      { key: 'designation', label: 'Designation', width: 140 },
      { key: 'theoryHours', label: 'Theory Hrs/Wk', width: 110 },
      { key: 'labHours', label: 'Lab Hrs/Wk', width: 110 },
      { key: 'totalHours', label: 'Total Load', width: 100 }
    ],
    rows: [
      { empId: 'FAC-1001', facultyName: 'Dr. S. Mohanty', dept: 'CSE', designation: 'Associate Professor', theoryHours: 12, labHours: 6, totalHours: 18 },
      { empId: 'FAC-1002', facultyName: 'Prof. B. Panda', dept: 'CSE', designation: 'Assistant Professor', theoryHours: 14, labHours: 8, totalHours: 22 },
      { empId: 'FAC-1003', facultyName: 'Dr. Pallab Kumar Kar', dept: 'Examination', designation: 'Dean & CoE', theoryHours: 8, labHours: 4, totalHours: 12 }
    ]
  },
  {
    id: 'tpl-feedback',
    name: 'Student Feedback & Course Rating Metric',
    category: 'Feedback Collection',
    description: 'Course rating aggregation, pedagogy feedback, and lab infrastructure scores',
    columns: [
      { key: 'courseCode', label: 'Course Code', width: 110 },
      { key: 'courseName', label: 'Course Title', width: 180 },
      { key: 'instructor', label: 'Course Instructor', width: 160 },
      { key: 'respondents', label: 'Total Responses', width: 120 },
      { key: 'pedagogyScore', label: 'Pedagogy (/5)', width: 120 },
      { key: 'labFacilityScore', label: 'Lab Infra (/5)', width: 120 },
      { key: 'overallGrade', label: 'Overall Metric', width: 120 }
    ],
    rows: [
      { courseCode: 'CS501', courseName: 'Data Structures & Algorithms', instructor: 'Dr. S. Mohanty', respondents: 115, pedagogyScore: 4.8, labFacilityScore: 4.6, overallGrade: 'Exemplary (A+)' },
      { courseCode: 'AI502', courseName: 'Deep Learning & Neural Networks', instructor: 'Prof. M. R. Swain', respondents: 88, pedagogyScore: 4.7, labFacilityScore: 4.9, overallGrade: 'Exemplary (A+)' },
      { courseCode: 'EC401', courseName: 'VLSI Digital Signal Processing', instructor: 'Dr. P. Senapati', respondents: 92, pedagogyScore: 4.4, labFacilityScore: 4.2, overallGrade: 'Very Good (A)' }
    ]
  }
];

export default function SpreadsheetsSection({ activeAccount, onAttachToMessage }) {
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);

  // Editor states
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedCell, setSelectedCell] = useState(null); // { rIdx, colKey }
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingColumnKey, setEditingColumnKey] = useState(null);
  const [columnRenameValue, setColumnRenameValue] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [copiedCellVal, setCopiedCellVal] = useState(null);
  const [formulaQuickCalc, setFormulaQuickCalc] = useState(null);

  const fileInputRef = useRef(null);

  // Load sheets from store
  useEffect(() => {
    const refresh = () => {
      const all = communicationStore.getSpreadsheets();
      setSpreadsheets(all);
      if (all.length > 0 && !activeSheetId) {
        selectSheet(all[0]);
      }
    };
    refresh();
    const unsub = communicationStore.subscribe(refresh);
    return () => unsub();
  }, []);

  const selectSheet = (sheet) => {
    setActiveSheetId(sheet.id);
    setActiveSheet(sheet);
    setTitle(sheet.title || 'Untitled Spreadsheet');
    setColumns(sheet.columns || [
      { key: 'col1', label: 'Column A', width: 140 },
      { key: 'col2', label: 'Column B', width: 140 },
      { key: 'col3', label: 'Column C', width: 140 }
    ]);
    setRows(sheet.rows || [
      { col1: '', col2: '', col3: '' }
    ]);
    setSelectedCell(null);
    setSearchQuery('');
    setFormulaQuickCalc(null);
  };

  const createBlankSheet = () => {
    const newSheet = {
      id: `SHT-${Date.now().toString().slice(-4)}`,
      title: `Institutional Sheet — ${new Date().toLocaleDateString('en-GB')}`,
      category: 'General Ledger',
      columns: [
        { key: 'item', label: 'Item / Name', width: 180 },
        { key: 'code', label: 'Code / ID', width: 120 },
        { key: 'qty', label: 'Quantity / Count', width: 130 },
        { key: 'remarks', label: 'Official Remarks', width: 200 }
      ],
      rows: [
        { item: 'Academic Notice Gazette', code: 'DOC-01', qty: 15, remarks: 'Verified by Deanery' },
        { item: 'Laboratory Kits CS501', code: 'KIT-102', qty: 45, remarks: 'In stock' },
        { item: 'Modular Hall Tickets', code: 'HT-AUT', qty: 420, remarks: 'Distributed' }
      ]
    };
    communicationStore.saveSpreadsheet(newSheet);
    selectSheet(newSheet);
  };

  const loadTemplate = (tpl) => {
    const newSheet = {
      id: `SHT-${Date.now().toString().slice(-4)}`,
      title: `${tpl.name} (${new Date().toLocaleDateString('en-GB')})`,
      category: tpl.category,
      columns: JSON.parse(JSON.stringify(tpl.columns)),
      rows: JSON.parse(JSON.stringify(tpl.rows))
    };
    communicationStore.saveSpreadsheet(newSheet);
    selectSheet(newSheet);
    setSaveSuccessMsg(`Template "${tpl.name}" loaded successfully!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // ── Cell Editing ──
  const handleCellChange = (rIdx, colKey, value) => {
    setRows(prevRows => {
      const next = [...prevRows];
      next[rIdx] = { ...next[rIdx], [colKey]: value };
      return next;
    });
  };

  // ── Row & Column Operations ──
  const handleAddRow = () => {
    const emptyRow = {};
    columns.forEach(col => { emptyRow[col.key] = ''; });
    setRows(prev => [...prev, emptyRow]);
  };

  const handleDeleteRow = (indexToDelete) => {
    if (rows.length <= 1) {
      alert('Spreadsheet must retain at least one row.');
      return;
    }
    setRows(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleAddColumn = () => {
    const colNumber = columns.length + 1;
    const newKey = `col_${Date.now().toString().slice(-4)}`;
    const newLabel = `New Field ${colNumber}`;
    setColumns(prev => [...prev, { key: newKey, label: newLabel, width: 140 }]);
    setRows(prev => prev.map(r => ({ ...r, [newKey]: '' })));
  };

  const handleDeleteColumn = (colKey) => {
    if (columns.length <= 1) {
      alert('Spreadsheet must retain at least one column.');
      return;
    }
    setColumns(prev => prev.filter(c => c.key !== colKey));
    setRows(prev => prev.map(r => {
      const copy = { ...r };
      delete copy[colKey];
      return copy;
    }));
  };

  const startRenameColumn = (col) => {
    setEditingColumnKey(col.key);
    setColumnRenameValue(col.label);
  };

  const finishRenameColumn = (colKey) => {
    if (columnRenameValue.trim()) {
      setColumns(prev => prev.map(c => c.key === colKey ? { ...c, label: columnRenameValue.trim() } : c));
    }
    setEditingColumnKey(null);
  };

  // ── Copy / Paste Simulation ──
  const handleCopyCell = (val) => {
    setCopiedCellVal(val);
    navigator.clipboard?.writeText(String(val || '')).catch(() => {});
  };

  const handlePasteCell = (rIdx, colKey) => {
    if (copiedCellVal !== null) {
      handleCellChange(rIdx, colKey, copiedCellVal);
    }
  };

  // ── Basic Formula Calculations (SUM, COUNT, AVERAGE) ──
  const calculateFormula = (type, colKey) => {
    const values = rows.map(r => Number(r[colKey])).filter(v => !isNaN(v) && v !== 0);
    const colName = columns.find(c => c.key === colKey)?.label || colKey;

    if (type === 'SUM') {
      const sum = values.reduce((a, b) => a + b, 0);
      setFormulaQuickCalc({ type: 'SUM', colName, result: sum.toLocaleString() });
    } else if (type === 'COUNT') {
      const count = rows.filter(r => r[colKey] !== undefined && r[colKey] !== '').length;
      setFormulaQuickCalc({ type: 'COUNT', colName, result: count });
    } else if (type === 'AVERAGE') {
      if (values.length === 0) {
        setFormulaQuickCalc({ type: 'AVERAGE', colName, result: 'N/A (No numeric rows)' });
      } else {
        const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
        setFormulaQuickCalc({ type: 'AVERAGE', colName, result: avg });
      }
    }
  };

  // ── Sorting ──
  const handleSort = (colKey) => {
    let direction = 'asc';
    if (sortConfig.key === colKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: colKey, direction });

    setRows(prev => {
      const sorted = [...prev].sort((a, b) => {
        const valA = a[colKey] ?? '';
        const valB = b[colKey] ?? '';
        const numA = Number(valA);
        const numB = Number(valB);

        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return direction === 'asc' ? numA - numB : numB - numA;
        }
        return direction === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
      return sorted;
    });
  };

  // ── Filtering / Search ──
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  // ── Save to Store ──
  const handleSaveDraft = () => {
    const sheetData = {
      id: activeSheetId || `SHT-${Date.now().toString().slice(-4)}`,
      title: title.trim() || 'Untitled Institutional Sheet',
      category: activeSheet?.category || 'General Ledger',
      columns,
      rows
    };
    communicationStore.saveSpreadsheet(sheetData);
    setSaveSuccessMsg('Spreadsheet saved locally to Institutional Workspace.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // ── Export Actions (Genuine XLSX, CSV, PDF) ──
  const handleExportXLSX = () => {
    const headers = columns.map(c => c.label);
    const data = rows.map(r => columns.map(c => r[c.key] ?? ''));
    exportToExcel(title || 'Apna_Campus_Spreadsheet', 'Sheet1', data, headers);
  };

  const handleExportCSV = () => {
    const headers = columns.map(c => c.label);
    const data = rows.map(r => columns.map(c => r[c.key] ?? ''));
    exportToCsv(title || 'Apna_Campus_Spreadsheet', data, headers);
  };

  const handleExportPDF = () => {
    const headers = columns.map(c => c.label);
    const tableRows = rows.map(r => columns.map(c => String(r[c.key] ?? '')));
    exportTableToPdf(
      title || 'Apna_Campus_Spreadsheet',
      title,
      headers,
      tableRows,
      `Office of Institutional Communications · NAAC A++ Autonomous Campus · ${new Date().toLocaleDateString('en-GB')}`
    );
  };

  // ── Import CSV ──
  const handleImportCsv = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 1) throw new Error('File contains no lines.');

        // Simple CSV splitter handling quoted cells
        const parseLine = (line) => {
          const cells = [];
          let current = '';
          let insideQuote = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && line[i + 1] === '"') {
              current += '"';
              i++;
            } else if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              cells.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          cells.push(current.trim());
          return cells;
        };

        const headerLine = parseLine(lines[0]);
        const importedCols = headerLine.map((label, idx) => ({
          key: `col_${idx}_${Date.now()}`,
          label: label || `Column ${idx + 1}`,
          width: 140
        }));

        const importedRows = lines.slice(1).map(line => {
          const cells = parseLine(line);
          const rowObj = {};
          importedCols.forEach((col, idx) => {
            rowObj[col.key] = cells[idx] ?? '';
          });
          return rowObj;
        });

        setColumns(importedCols);
        setRows(importedRows.length > 0 ? importedRows : [{}]);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
        setSaveSuccessMsg(`Imported ${importedRows.length} rows from ${file.name}`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } catch (err) {
        alert('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Attach to Message Workflow ──
  const handleAttachToMessage = () => {
    if (!onAttachToMessage) return;
    const attachmentItem = {
      id: `att-sheet-${Date.now()}`,
      name: `${(title || 'Institutional_Spreadsheet').replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`,
      size: rows.length * columns.length * 48 + 1024,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      isGeneratedSheet: true,
      sheetData: {
        title,
        columns,
        rows
      }
    };

    onAttachToMessage(attachmentItem);
  };

  return (
    <div className="comm-spreadsheets-container">
      {/* Top Action Bar */}
      <div className="comm-sub-header">
        <div className="comm-sub-header-left">
          <div className="comm-sub-icon-badge">
            <FileSpreadsheet size={22} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="comm-sub-title">Spreadsheet Studio & Institutional Ledgers</h2>
            <p className="comm-sub-desc">
              Interactive grid, formula calculations, templates, and genuine Excel/CSV/PDF export
            </p>
          </div>
        </div>

        <div className="comm-sub-header-actions">
          <button
            type="button"
            className="comm-btn-secondary"
            onClick={createBlankSheet}
            title="Create blank sheet"
          >
            <Plus size={16} /> Blank Sheet
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".csv,text/csv"
            onChange={handleImportCsv}
          />
          <button
            type="button"
            className="comm-btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Import data from CSV"
          >
            <Upload size={16} /> Import CSV
          </button>

          <button
            type="button"
            className="comm-btn-primary"
            onClick={handleSaveDraft}
          >
            <Save size={16} /> Save Sheet
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="comm-alert comm-alert-success">
          <Check size={16} /> {saveSuccessMsg}
        </div>
      )}

      {/* Templates Selector Row */}
      <div className="comm-templates-bar">
        <span className="comm-templates-label">
          <Sparkles size={14} className="text-amber-500" /> Pre-built Templates:
        </span>
        <div className="comm-templates-chips">
          {SPREADSHEET_TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              className="comm-template-chip"
              onClick={() => loadTemplate(tpl)}
              title={tpl.description}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Spreadsheet Workspace Card */}
      <div className="comm-sheet-workspace">
        {/* Title & Formula Controls */}
        <div className="comm-sheet-toolbar">
          <div className="comm-sheet-title-box">
            <input
              type="text"
              className="comm-sheet-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Spreadsheet Title..."
            />
            <span className="comm-sheet-badge">{activeSheet?.category || 'Custom Sheet'}</span>
          </div>

          <div className="comm-sheet-quick-actions">
            <div className="comm-sheet-search-box">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search cells..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="comm-sheet-search-input"
              />
            </div>

            {/* Export Dropdown buttons */}
            <div className="comm-export-btn-group">
              <button
                type="button"
                className="comm-btn-sm comm-btn-outline"
                onClick={handleExportXLSX}
                title="Download real Excel .XLSX"
              >
                <Download size={14} /> Excel (XLSX)
              </button>
              <button
                type="button"
                className="comm-btn-sm comm-btn-outline"
                onClick={handleExportCSV}
                title="Download standard CSV"
              >
                <Download size={14} /> CSV
              </button>
              <button
                type="button"
                className="comm-btn-sm comm-btn-outline"
                onClick={handleExportPDF}
                title="Generate formal PDF"
              >
                <Download size={14} /> PDF
              </button>
              <button
                type="button"
                className="comm-btn-sm comm-btn-accent"
                onClick={handleAttachToMessage}
                title="Attach this spreadsheet into Message Composer"
              >
                <Send size={14} /> Attach to Message
              </button>
            </div>
          </div>
        </div>

        {/* Formula Bar & Grid Tools */}
        <div className="comm-formula-bar">
          <div className="comm-formula-title">
            <span>Fx Quick Formulas:</span>
          </div>
          <div className="comm-formula-chips">
            {columns.map(col => (
              <div key={col.key} className="comm-formula-chip-group">
                <span className="comm-formula-col-name">{col.label}:</span>
                <button
                  type="button"
                  className="comm-formula-fn-btn"
                  onClick={() => calculateFormula('SUM', col.key)}
                >
                  SUM
                </button>
                <button
                  type="button"
                  className="comm-formula-fn-btn"
                  onClick={() => calculateFormula('AVERAGE', col.key)}
                >
                  AVG
                </button>
                <button
                  type="button"
                  className="comm-formula-fn-btn"
                  onClick={() => calculateFormula('COUNT', col.key)}
                >
                  COUNT
                </button>
              </div>
            ))}
          </div>
        </div>

        {formulaQuickCalc && (
          <div className="comm-formula-result-banner">
            <span className="font-semibold text-sky-800">
              Formula Result: {formulaQuickCalc.type}({formulaQuickCalc.colName}) =
            </span>
            <span className="comm-formula-result-value">{formulaQuickCalc.result}</span>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 ml-3"
              onClick={() => setFormulaQuickCalc(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Interactive Data Table Grid */}
        <div className="comm-sheet-table-wrapper">
          <table className="comm-sheet-table">
            <thead>
              <tr>
                <th className="comm-sheet-row-index-hdr">#</th>
                {columns.map((col, cIdx) => (
                  <th key={col.key} style={{ minWidth: col.width || 130 }}>
                    <div className="comm-th-content">
                      {editingColumnKey === col.key ? (
                        <input
                          type="text"
                          className="comm-th-edit-input"
                          value={columnRenameValue}
                          autoFocus
                          onChange={(e) => setColumnRenameValue(e.target.value)}
                          onBlur={() => finishRenameColumn(col.key)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') finishRenameColumn(col.key);
                            if (e.key === 'Escape') setEditingColumnKey(null);
                          }}
                        />
                      ) : (
                        <span
                          className="comm-th-label"
                          onDoubleClick={() => startRenameColumn(col)}
                          title="Double click to rename column heading"
                        >
                          {col.label}
                        </span>
                      )}

                      <div className="comm-th-actions">
                        <button
                          type="button"
                          className="comm-th-btn"
                          title="Sort Ascending/Descending"
                          onClick={() => handleSort(col.key)}
                        >
                          <ArrowUpDown size={12} />
                        </button>
                        <button
                          type="button"
                          className="comm-th-btn text-rose-500"
                          title="Delete column"
                          onClick={() => handleDeleteColumn(col.key)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="comm-th-add-col">
                  <button
                    type="button"
                    className="comm-th-add-btn"
                    onClick={handleAddColumn}
                    title="Add new column heading"
                  >
                    <Plus size={14} /> Col
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="comm-sheet-row-index">
                    <span>{rIdx + 1}</span>
                    <button
                      type="button"
                      className="comm-row-delete-btn"
                      onClick={() => handleDeleteRow(rIdx)}
                      title="Delete this row"
                    >
                      <Trash2 size={11} />
                    </button>
                  </td>
                  {columns.map((col) => {
                    const isSelected = selectedCell?.rIdx === rIdx && selectedCell?.colKey === col.key;
                    const cellVal = row[col.key] ?? '';
                    return (
                      <td
                        key={col.key}
                        className={`comm-sheet-cell ${isSelected ? 'cell-selected' : ''}`}
                        onClick={() => setSelectedCell({ rIdx, colKey: col.key })}
                      >
                        <input
                          type="text"
                          className="comm-sheet-cell-input"
                          value={cellVal}
                          onChange={(e) => handleCellChange(rIdx, col.key, e.target.value)}
                        />
                      </td>
                    );
                  })}
                  <td className="comm-sheet-spacer-td"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Table Toolbar */}
        <div className="comm-sheet-bottom-bar">
          <button
            type="button"
            className="comm-btn-sm comm-btn-secondary"
            onClick={handleAddRow}
          >
            <Plus size={14} /> Add Row
          </button>
          <span className="comm-sheet-meta-text">
            {rows.length} rows · {columns.length} columns · {filteredRows.length !== rows.length ? `Showing ${filteredRows.length} filtered results` : 'All records visible'}
          </span>
          <div className="comm-sheet-cell-clipboard-info">
            {selectedCell && (
              <span className="comm-cell-info-tag">
                Selected: Row {selectedCell.rIdx + 1}, {columns.find(c => c.key === selectedCell.colKey)?.label}
                <button
                  type="button"
                  className="ml-2 underline text-sky-600 hover:text-sky-800"
                  onClick={() => handleCopyCell(rows[selectedCell.rIdx]?.[selectedCell.colKey])}
                >
                  Copy
                </button>
                {copiedCellVal !== null && (
                  <button
                    type="button"
                    className="ml-2 underline text-emerald-600 hover:text-emerald-800"
                    onClick={() => handlePasteCell(selectedCell.rIdx, selectedCell.colKey)}
                  >
                    Paste
                  </button>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
