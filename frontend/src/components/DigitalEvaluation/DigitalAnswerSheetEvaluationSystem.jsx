import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Plus,
  Play,
  RotateCcw,
  LogOut,
  Send,
  AlertTriangle,
  Layers,
  ChevronRight,
  Menu,
  X,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Check,
  ExternalLink,
  AlertCircle,
  Sparkles,
  UserCheck,
  DollarSign,
  GraduationCap,
  BellRing,
  ArrowUpRight,
  FileSpreadsheet,
  MessageSquare,
  QrCode,
  UploadCloud,
  CheckSquare,
  FolderOpen,
  BarChart3,
  Maximize2
} from 'lucide-react';
import './DigitalAnswerSheetEvaluationSystem.css';
import AnswerSheetViewer from './AnswerSheetViewer.jsx';
import DigitalMarkingPanel from './DigitalMarkingPanel.jsx';
import {
  digitalEvalStore,
  EVALUATION_SCHEME,
  calculateEvaluationSummary
} from '../../services/digitalEvaluationStore.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { drawGiftLogo } from '../../utils/pdfGenerator.js';

export default function DigitalAnswerSheetEvaluationSystem({
  initialRole = 'faculty',
  currentUser,
  onClose
}) {
  // Current active role portal (Exam Cell, HOD, Faculty, Lab Staff)
  const [activeRole, setActiveRole] = useState(initialRole); // 'exam_cell', 'hod', 'faculty', 'staff'

  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    }
  }, [initialRole]);

  // Store state
  const [sheets, setSheets] = useState(() => digitalEvalStore.getAllSheets());
  const [labRecords, setLabRecords] = useState(() => digitalEvalStore.getLabRecords());

  // Sub-navigation per role
  const [examCellSubNav, setExamCellSubNav] = useState('dashboard');
  const [hodSubNav, setHodSubNav] = useState('dashboard');
  const [facultySubNav, setFacultySubNav] = useState('assigned');
  const [staffSubNav, setStaffSubNav] = useState('practical');

  // Currently evaluated sheet in Workspace
  const [activeSheetId, setActiveSheetId] = useState('AS-CSE-0001');
  const [workspaceMarks, setWorkspaceMarks] = useState({});
  const [workspaceRemarks, setWorkspaceRemarks] = useState('');
  const [workspaceAnnotations, setWorkspaceAnnotations] = useState([]);

  // Blind evaluation identity reveal toggle (Examination Cell / CoE authorized only)
  const [revealedIdentities, setRevealedIdentities] = useState(false);
  const [showIdentityPinModal, setShowIdentityPinModal] = useState(false);
  const [identityPin, setIdentityPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Bundle Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Assign Faculty Modal
  const [assignModalSheet, setAssignModalSheet] = useState(null);
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState('FAC-042');

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Sync with store updates
  useEffect(() => {
    const handleUpdate = () => {
      setSheets(digitalEvalStore.getAllSheets());
      setLabRecords(digitalEvalStore.getLabRecords());
    };
    window.addEventListener('digital_evaluation_store_updated', handleUpdate);
    return () => window.removeEventListener('digital_evaluation_store_updated', handleUpdate);
  }, []);

  // When active sheet changes, sync local workspace state
  useEffect(() => {
    const sheet = digitalEvalStore.getSheetById(activeSheetId);
    if (sheet) {
      setWorkspaceMarks(sheet.marks ? { ...sheet.marks } : {});
      setWorkspaceRemarks(sheet.facultyRemarks || '');
      setWorkspaceAnnotations(sheet.annotations ? [...sheet.annotations] : []);
    }
  }, [activeSheetId]);

  const activeSheet = useMemo(() => {
    return sheets.find((s) => s.id === activeSheetId) || sheets[0];
  }, [sheets, activeSheetId]);

  // ── Workspace Handlers ──
  const handleMarksChange = (qId, score) => {
    setWorkspaceMarks((prev) => {
      const next = { ...prev };
      if (score === '' || score === null) delete next[qId];
      else next[qId] = score;
      return next;
    });
  };

  const handleAddAnnotation = (ann) => {
    setWorkspaceAnnotations((prev) => [...prev, ann]);
  };

  const handleClearAnnotations = () => {
    if (window.confirm('Clear all visual stamps and marks from this booklet?')) {
      setWorkspaceAnnotations([]);
      triggerToast('Booklet annotations cleared');
    }
  };

  const handleSaveDraft = () => {
    digitalEvalStore.saveDraftMarks(
      activeSheetId,
      workspaceMarks,
      workspaceRemarks,
      workspaceAnnotations
    );
    triggerToast(`Draft marks saved for ${activeSheetId}. You can resume anytime.`);
  };

  const handleSubmitEvaluation = () => {
    const summary = calculateEvaluationSummary(workspaceMarks);
    if (summary.totalCountedQuestions < 10) {
      if (!window.confirm(`You have only evaluated ${summary.totalCountedQuestions} questions out of 21. Do you still wish to submit?`)) {
        return;
      }
    }
    digitalEvalStore.submitEvaluationToHod(
      activeSheetId,
      workspaceMarks,
      workspaceRemarks,
      workspaceAnnotations
    );
    triggerToast(`Evaluation submitted for ${activeSheetId}. Locked and forwarded to HOD for moderation.`);
    setFacultySubNav('assigned');
  };

  const handleResetMarks = () => {
    if (window.confirm('Reset all entered marks for this answer sheet?')) {
      setWorkspaceMarks({});
      setWorkspaceRemarks('');
      setWorkspaceAnnotations([]);
      triggerToast('Marks reset to blank');
    }
  };

  // ── HOD Handlers ──
  const handleHodApprove = (sheetId, remarks) => {
    digitalEvalStore.hodApproveEvaluation(sheetId, remarks);
    triggerToast(`Evaluation for ${sheetId} approved and certified by HOD!`);
    setHodSubNav('sheets');
  };

  const handleHodReturn = (sheetId, remarks) => {
    if (!remarks.trim()) {
      triggerToast('Please provide feedback remarks for returning the script.');
      return;
    }
    digitalEvalStore.hodReturnEvaluation(sheetId, remarks);
    triggerToast(`Script ${sheetId} returned to faculty evaluator with feedback.`);
    setHodSubNav('sheets');
  };

  // ── Examination Cell Handlers ──
  const handleVerifyIdentityPin = (e) => {
    e.preventDefault();
    if (identityPin === 'gift123' || identityPin === '2026' || identityPin === 'admin') {
      setRevealedIdentities(true);
      setShowIdentityPinModal(false);
      setIdentityPin('');
      setPinError('');
      triggerToast('🔓 Student identity mapping revealed for Controller of Examinations.');
    } else {
      setPinError('Invalid Security PIN. Access is restricted to Controller of Examinations (CoE).');
    }
  };

  const handleAssignFaculty = () => {
    if (!assignModalSheet) return;
    const facMap = {
      'FAC-042': { id: 'FAC-042', name: 'Dr. S. Mohanty', dept: 'CSE' },
      'FAC-018': { id: 'FAC-018', name: 'Prof. S. Mishra', dept: 'CSE' },
      'FAC-029': { id: 'FAC-029', name: 'Dr. R. Sahoo', dept: 'CSE' }
    };
    const facObj = facMap[selectedFacultyForAssign];
    digitalEvalStore.assignFacultyToBundle([assignModalSheet.id], facObj);
    triggerToast(`Answer sheet ${assignModalSheet.id} assigned to ${facObj.name}.`);
    setAssignModalSheet(null);
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowUploadModal(false);
          triggerToast('Bundle digitized: 15 Scanned Scripts indexed with Barcodes generated!');
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // ── PDF Audit Report Generator ──
  const handleDownloadEvaluationReport = (targetSheet) => {
    const s = targetSheet || activeSheet;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Watermark & Logo
    drawGiftLogo(doc, (pageWidth - 70) / 2, 100, 70, true);
    drawGiftLogo(doc, 14, 12, 24, false);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('GIFT AUTONOMOUS, BHUBANESWAR', pageWidth / 2 + 8, 18, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199);
    doc.text('DIGITAL ANSWER SCRIPT EVALUATION CERTIFICATE & AUDIT TRAIL', pageWidth / 2 + 8, 24, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Biju Patnaik University of Technology (BPUT) Academic Regulations 2026', pageWidth / 2 + 8, 29, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 33, pageWidth - 14, 33);

    // Meta box
    const sum = calculateEvaluationSummary(s.marks || {});
    const studentInfo = s.secretStudentMapping || {};

    const metaRows = [
      ['Answer Script ID', s.id, 'Barcode Token', s.barcode],
      ['Course Title', `${s.subjectCode}: ${s.subjectName}`, 'Semester / Batch', `${s.semester} · ${s.batch}`],
      ['Assigned Evaluator', `${s.assignedFaculty?.name} (${s.assignedFaculty?.id})`, 'Evaluation Status', s.status],
      ['Candidate Name', revealedIdentities ? studentInfo.name : '*** MASKED FOR BLIND EVALUATION ***', 'Regd. Number', revealedIdentities ? studentInfo.registrationNumber : '*** PROTECTED BY COE ***'],
      ['Grand Total Marks', `${sum.grandTotal} / 100 (${sum.percentage}%)`, 'Final Grade', sum.grade]
    ];

    autoTable(doc, {
      startY: 37,
      margin: { left: 14, right: 14 },
      body: metaRows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 55 },
        2: { cellWidth: 35, fontStyle: 'bold', fillColor: [248, 250, 252] },
        3: { cellWidth: 55 }
      }
    });

    // Section Breakdown Table
    const secRows = EVALUATION_SCHEME.sections.map((sec) => {
      const secSum = sum.sections[sec.id] || { sectionTotal: 0, attemptCount: 0 };
      return [
        sec.title.split(':')[0],
        sec.description,
        sec.requiredAttempts,
        secSum.attemptCount,
        `${secSum.sectionTotal} / ${sec.maxMarks}`
      ];
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 80) + 6,
      margin: { left: 14, right: 14 },
      head: [['Section', 'Description', 'Required Attempts', 'Student Attempts', 'Marks Secured']],
      body: secRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 43, 72], fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 7.5, cellPadding: 2.2 }
    });

    // Remarks & Audit Notice
    const finalY = doc.lastAutoTable?.finalY || 150;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Evaluator Qualitative Remarks:', 14, finalY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(s.facultyRemarks || 'All questions verified and marked in compliance with BPUT marking schemes.', 14, finalY + 13);

    // Signatures
    const sigY = finalY + 35;
    doc.setDrawColor(15, 43, 72);
    doc.setLineWidth(0.5);

    doc.line(20, sigY, 70, sigY);
    doc.text('Faculty Evaluator Signature', 25, sigY + 5);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(s.assignedFaculty?.name || 'Dr. S. Mohanty', 25, sigY + 9);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.line(80, sigY, 130, sigY);
    doc.text('HOD Verification & Moderation', 83, sigY + 5);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Head of Department (CSE)', 83, sigY + 9);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.line(140, sigY, 190, sigY);
    doc.text('Controller of Examinations (CoE)', 143, sigY + 5);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('GIFT Autonomous, Bhubaneswar', 143, sigY + 9);

    doc.save(`GIFT_Evaluation_Audit_${s.id}.pdf`);
    triggerToast(`Official Audit Certificate downloaded for ${s.id}`);
  };

  // Filter sheets for tables
  const filteredSheets = sheets.filter((s) => {
    const matchSearch =
      !searchQuery ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (revealedIdentities && s.secretStudentMapping?.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchSubject = subjectFilter === 'ALL' || s.subjectCode === subjectFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchSearch && matchSubject && matchStatus;
  });

  return (
    <div className="digital-eval-system-root">
      {/* ── TOAST MESSAGE ── */}
      {toastMsg && (
        <div className="eval-system-toast">
          <CheckCircle size={16} color="#34d399" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOP MASTER BAR (ROLE SWITCHER & BLIND EVALUATION STATUS) ── */}
      <header className="eval-master-header">
        <div className="eval-master-left">
          <div className="eval-logo-badge">
            <div style={{
              background: '#ffffff',
              padding: '4px 6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
            }}>
              <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div>
              <h2>Digital Answer Sheet Evaluation System</h2>
              <p>Apna Campus · Autonomous Examination Cell · Scanned Script Digitization &amp; Grading</p>
            </div>
          </div>
        </div>



        {/* Right: Secret Blind Mapping Security Toggle */}
        <div className="eval-master-right">
          <button
            type="button"
            className={`btn-blind-toggle ${revealedIdentities ? 'revealed' : 'masked'}`}
            onClick={() => {
              if (revealedIdentities) {
                setRevealedIdentities(false);
                triggerToast('🔒 Student identities masked. Blind evaluation active.');
              } else {
                setShowIdentityPinModal(true);
              }
            }}
            title="Toggle Secret Student Identity Mapping (CoE Authorized Only)"
          >
            {revealedIdentities ? (
              <>
                <Eye size={14} /> <span>Student Identity: REVEALED</span>
              </>
            ) : (
              <>
                <Lock size={14} /> <span>Blind Evaluation: ACTIVE</span>
              </>
            )}
          </button>
          {onClose && (
            <button type="button" className="btn-close-system" onClick={onClose} title="Exit Module">
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          PORTAL 1: EXAMINATION CELL
          ══════════════════════════════════════════════════════════════════ */}
      {activeRole === 'exam_cell' && (
        <div className="eval-portal-layout">
          {/* Sub Navigation */}
          <nav className="eval-sub-nav">
            {[
              { id: 'dashboard', label: 'Examination Dashboard', icon: BarChart3 },
              { id: 'upload', label: 'Answer Sheet Upload & Digitization', icon: UploadCloud },
              { id: 'id_gen', label: 'Answer Sheet ID Generation', icon: QrCode },
              { id: 'assign', label: 'Assign Answer Sheets to Faculty', icon: Users },
              { id: 'qp_mgmt', label: 'Subject-wise Question Paper Management', icon: BookOpen },
              { id: 'progress', label: 'Evaluation Progress', icon: Clock },
              { id: 'verification', label: 'Marks Verification & Approval', icon: ShieldCheck },
              { id: 'reports', label: 'Evaluation Reports', icon: FileSpreadsheet }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sub-nav-btn ${examCellSubNav === tab.id ? 'active' : ''}`}
                onClick={() => setExamCellSubNav(tab.id)}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <main className="eval-portal-main">
            {/* 1. Dashboard */}
            {examCellSubNav === 'dashboard' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Examination Cell · Central Evaluation Operations</h3>
                    <p>Track booklet digitization, blind coding distribution, faculty turnaround velocity, and CoE approvals.</p>
                  </div>
                  <button type="button" className="btn-primary-eval" onClick={() => setShowUploadModal(true)}>
                    <UploadCloud size={16} /> Digitize New Exam Bundle
                  </button>
                </div>

                {/* KPI Metrics Grid */}
                <div className="eval-stats-grid">
                  <div className="eval-stat-card">
                    <span className="stat-label">Total Digitized Scripts</span>
                    <strong className="stat-value">1,420</strong>
                    <small className="stat-desc">36 Examination Subjects · 300 DPI</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Blind IDs Generated</span>
                    <strong className="stat-value">1,420</strong>
                    <small className="stat-desc">100% Barcoded &amp; Masked</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Assigned to Evaluators</span>
                    <strong className="stat-value">1,380</strong>
                    <small className="stat-desc">42 Autonomous Faculty Members</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Evaluated &amp; Certified</span>
                    <strong className="stat-value">910</strong>
                    <small className="stat-desc">65.9% Overall Completion Rate</small>
                  </div>
                </div>

                {/* Subject-Wise Live Velocity Table */}
                <div className="eval-table-card">
                  <div className="table-card-head">
                    <h4>Department &amp; Subject Evaluation Velocity</h4>
                    <span className="badge-live-pulse"><span className="pulse-dot"></span> Live Sync</span>
                  </div>
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Semester</th>
                        <th>Total Scripts</th>
                        <th>Evaluated</th>
                        <th>Pending</th>
                        <th>Progress</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { code: 'BTCS-T-PC-403', name: 'Programming with Python', sem: '4th Sem', total: 64, done: 52, pend: 12, pct: 81 },
                        { code: 'BTCS-T-PC-401', name: 'Design and Analysis of Algorithms', sem: '4th Sem', total: 64, done: 48, pend: 16, pct: 75 },
                        { code: 'BTCS-T-PC-402', name: 'Computer Organization & Architecture', sem: '4th Sem', total: 64, done: 30, pend: 34, pct: 47 },
                        { code: 'BTEC-T-OE-401', name: 'Digital Signal Processing', sem: '4th Sem', total: 64, done: 60, pend: 4, pct: 93 }
                      ].map((row) => (
                        <tr key={row.code}>
                          <td><code>{row.code}</code></td>
                          <td><strong>{row.name}</strong></td>
                          <td>{row.sem}</td>
                          <td>{row.total}</td>
                          <td><span className="status-badge-done">{row.done} Done</span></td>
                          <td><span className="status-badge-pend">{row.pend} Pending</span></td>
                          <td>
                            <div className="eval-progress-bar">
                              <div className="eval-progress-fill" style={{ width: `${row.pct}%` }}></div>
                              <span>{row.pct}%</span>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-table-action"
                              onClick={() => {
                                setSubjectFilter(row.code);
                                setExamCellSubNav('id_gen');
                              }}
                            >
                              Inspect Scripts →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Upload & Digitization */}
            {examCellSubNav === 'upload' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Answer Sheet Upload &amp; Scanner Ingestion Pipeline</h3>
                    <p>Ingest high-speed ADF scanned bundles. Automatically detect barcodes, split pages, and generate blind IDs.</p>
                  </div>
                </div>

                <div className="upload-pipeline-card">
                  <div className="dropzone-box" onClick={() => setShowUploadModal(true)}>
                    <UploadCloud size={48} className="dropzone-icon" />
                    <h4>Click or Drag Scanned Answer Sheet PDF / TIFF Bundles Here</h4>
                    <p>Supported Formats: High-Resolution PDF, Multi-page TIFF (Min. 300 DPI Monochrome / Color)</p>
                    <span className="btn-dropzone-cta">Select Scanned Answer Sheet Archive</span>
                  </div>

                  <div className="scanner-presets-grid">
                    <div className="preset-item">
                      <span className="preset-title">Scanner Standard:</span>
                      <strong>Fujitsu fi-7800 Production Scanner</strong>
                    </div>
                    <div className="preset-item">
                      <span className="preset-title">Resolution &amp; Color:</span>
                      <strong>300 DPI · 24-bit True Color OCR Verified</strong>
                    </div>
                    <div className="preset-item">
                      <span className="preset-title">Barcode Standard:</span>
                      <strong>Code 128 / QR Code Autonomous Standard</strong>
                    </div>
                    <div className="preset-item">
                      <span className="preset-title">Security Seal:</span>
                      <strong>SHA256 Tamper-Proof Cryptographic Hash</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ID Generation & Secret Student Mapping */}
            {examCellSubNav === 'id_gen' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Answer Sheet ID Generation &amp; Secret Student Mapping</h3>
                    <p>Manage anonymous IDs and review the encrypted student identity mapping table.</p>
                  </div>
                  <button
                    type="button"
                    className={`btn-primary-eval ${revealedIdentities ? 'btn-danger' : ''}`}
                    onClick={() => {
                      if (revealedIdentities) setRevealedIdentities(false);
                      else setShowIdentityPinModal(true);
                    }}
                  >
                    {revealedIdentities ? <Lock size={15} /> : <Eye size={15} />}
                    {revealedIdentities ? 'Mask Student Identities' : 'Reveal Identities (CoE Authorized)'}
                  </button>
                </div>

                {/* Filters */}
                <div className="eval-filter-strip">
                  <div className="filter-input-wrap">
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Search by Answer Sheet ID, Subject Code, or Student..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                    <option value="ALL">All Subjects</option>
                    <option value="BTCS-T-PC-403">Programming with Python</option>
                    <option value="BTCS-T-PC-401">Design and Analysis of Algorithms</option>
                    <option value="BTCS-T-PC-402">Computer Organization &amp; Architecture</option>
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="ALL">All Statuses</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Submitted">Submitted</option>
                    <option value="HOD Approved">HOD Approved</option>
                  </select>
                </div>

                {/* Data Table */}
                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Answer Sheet ID</th>
                        <th>Barcode Token</th>
                        <th>Subject</th>
                        <th>Semester</th>
                        <th>Student Name</th>
                        <th>Registration No.</th>
                        <th>Assigned Evaluator</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSheets.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.id}</strong></td>
                          <td><code className="barcode-code">{s.barcode}</code></td>
                          <td>
                            <strong>{s.subjectCode}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{s.subjectName}</div>
                          </td>
                          <td>{s.semester}</td>
                          <td>
                            {revealedIdentities ? (
                              <strong style={{ color: '#0f172a' }}>{s.secretStudentMapping?.name}</strong>
                            ) : (
                              <span className="badge-masked-identity">
                                <Lock size={11} /> MASKED SCRIPT
                              </span>
                            )}
                          </td>
                          <td>
                            {revealedIdentities ? (
                              <code>{s.secretStudentMapping?.registrationNumber}</code>
                            ) : (
                              <span className="badge-masked-identity">●●●●●●●●</span>
                            )}
                          </td>
                          <td>{s.assignedFaculty?.name || 'Unassigned'}</td>
                          <td>
                            <span className={`status-pill ${s.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {s.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => {
                                  setActiveSheetId(s.id);
                                  setActiveRole('faculty');
                                  setFacultySubNav('workspace');
                                }}
                                title="Open in Evaluation Workspace"
                              >
                                Evaluate
                              </button>
                              <button
                                type="button"
                                className="btn-table-action btn-icon-only"
                                onClick={() => handleDownloadEvaluationReport(s)}
                                title="Download Audit Certificate PDF"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Assign Answer Sheets to Faculty */}
            {examCellSubNav === 'assign' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Faculty Answer Script Allocation &amp; Workload Balancing</h3>
                    <p>Assign anonymized examination bundles to registered course evaluators with statutory turnaround deadlines.</p>
                  </div>
                </div>

                <div className="faculty-alloc-grid">
                  {[
                    { id: 'FAC-042', name: 'Dr. S. Mohanty', dept: 'CSE', assigned: 64, done: 52, quota: 70 },
                    { id: 'FAC-018', name: 'Prof. S. Mishra', dept: 'CSE', assigned: 64, done: 48, quota: 70 },
                    { id: 'FAC-029', name: 'Dr. R. Sahoo', dept: 'CSE', assigned: 64, done: 30, quota: 70 }
                  ].map((f) => (
                    <div key={f.id} className="faculty-alloc-card">
                      <div className="faculty-alloc-head">
                        <div>
                          <h4>{f.name}</h4>
                          <span className="fac-id-tag">{f.id} · {f.dept}</span>
                        </div>
                        <span className="quota-tag">{f.assigned} / {f.quota} Quota</span>
                      </div>
                      <div className="alloc-stat-row">
                        <span>Evaluation Completed:</span>
                        <strong>{f.done} Scripts</strong>
                      </div>
                      <div className="eval-progress-bar" style={{ margin: '10px 0' }}>
                        <div
                          className="eval-progress-fill"
                          style={{ width: `${Math.round((f.done / f.assigned) * 100)}%` }}
                        ></div>
                        <span>{Math.round((f.done / f.assigned) * 100)}%</span>
                      </div>
                      <button
                        type="button"
                        className="btn-alloc-action"
                        onClick={() => {
                          setSelectedFacultyForAssign(f.id);
                          setAssignModalSheet(sheets[0]);
                        }}
                      >
                        Assign Bundle to {f.name.split(' ')[1]} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Subject-wise Question Paper Management */}
            {examCellSubNav === 'qp_mgmt' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Subject-wise Question Paper &amp; Marking Rubric Schema</h3>
                    <p>The official autonomous question paper structure and section-wise attempt rules (100 Maximum Marks).</p>
                  </div>
                </div>

                <div className="qp-sections-preview">
                  {EVALUATION_SCHEME.sections.map((sec) => (
                    <div key={sec.id} className="qp-section-schema-card">
                      <div className="qp-sec-header">
                        <h4>{sec.title}</h4>
                        <span className="badge-max-marks">Max: {sec.maxMarks} Marks</span>
                      </div>
                      <p className="qp-sec-desc">{sec.description}</p>
                      <div className="qp-sec-rules">
                        <span>Total Questions: <strong>{sec.questionsAvailable}</strong></span>
                        <span>Required Attempts: <strong>{sec.requiredAttempts}</strong></span>
                        <span>Marks Per Question: <strong>{sec.marksPerQuestion}M</strong></span>
                        <span>Attempt Cap Rule: <strong>{sec.isCompulsory ? 'All Compulsory' : `Best ${sec.requiredAttempts} Evaluated`}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Evaluation Progress */}
            {examCellSubNav === 'progress' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>University Evaluation Progress Monitor</h3>
                    <p>Real-time audit velocity, turnaround warnings, and evaluation SLA tracking.</p>
                  </div>
                </div>

                <div className="eval-stats-grid">
                  <div className="eval-stat-card">
                    <span className="stat-label">Scripts Evaluated Today</span>
                    <strong className="stat-value">148</strong>
                    <small className="stat-desc">Peak hour 11:00 AM - 01:00 PM</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Average Turnaround Time</span>
                    <strong className="stat-value">4.2 Days</strong>
                    <small className="stat-desc">Well within 7-Day University SLA</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">HOD Approval Queue</span>
                    <strong className="stat-value">64 Scripts</strong>
                    <small className="stat-desc">Awaiting Final Departmental Sign-off</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Marks Discrepancy Alerts</span>
                    <strong className="stat-value">0</strong>
                    <small className="stat-desc">All Attempt Caps Strictly Validated</small>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Marks Verification & Approval */}
            {examCellSubNav === 'verification' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Controller of Examinations (CoE) Final Certification Gate</h3>
                    <p>Verify HOD-approved evaluations, certify marks records, and release marks to student transcripts.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary-eval"
                    onClick={() => triggerToast('All completed evaluations certified & locked for semester grade card publication!')}
                  >
                    <CheckSquare size={16} /> Certify &amp; Publish Approved Marks
                  </button>
                </div>

                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Script ID</th>
                        <th>Subject</th>
                        <th>Evaluator</th>
                        <th>Grand Total</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                        <th>HOD Sign-off</th>
                        <th>CoE Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheets.map((s) => {
                        const sum = calculateEvaluationSummary(s.marks || {});
                        return (
                          <tr key={s.id}>
                            <td><strong>{s.id}</strong></td>
                            <td>{s.subjectCode}</td>
                            <td>{s.assignedFaculty?.name}</td>
                            <td><strong>{sum.grandTotal} / 100</strong></td>
                            <td>{sum.percentage}%</td>
                            <td><span className="grade-badge">{sum.grade.split(' ')[0]}</span></td>
                            <td>
                              <span className={`status-pill ${s.status === 'HOD Approved' ? 'approved' : 'pending'}`}>
                                {s.status === 'HOD Approved' ? 'HOD Approved ✓' : s.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => handleDownloadEvaluationReport(s)}
                              >
                                <Download size={13} /> Audit Certificate
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. Evaluation Reports */}
            {examCellSubNav === 'reports' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Official Evaluation Reports &amp; Statistical Audits</h3>
                    <p>Generate institutional compliance reports, score distributions, and export records to CSV and PDF.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary-eval"
                    onClick={() => handleDownloadEvaluationReport(activeSheet)}
                  >
                    <Download size={15} /> Export Audit Report (PDF)
                  </button>
                </div>

                <div className="eval-stats-grid">
                  <div className="eval-stat-card">
                    <span className="stat-label">Highest Score Secured</span>
                    <strong className="stat-value">96.5 / 100</strong>
                    <small className="stat-desc">Script: AS-CSE-0003</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Class Average Score</span>
                    <strong className="stat-value">78.4%</strong>
                    <small className="stat-desc">Autonomous Batch 2028-P</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Pass Percentage</span>
                    <strong className="stat-value">98.2%</strong>
                    <small className="stat-desc">Above BPUT Minimum Threshold</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Audit Log Hash</span>
                    <strong className="stat-value">SHA-256</strong>
                    <small className="stat-desc">Certified &amp; Non-repudiable</small>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PORTAL 2: HOD PORTAL
          ══════════════════════════════════════════════════════════════════ */}
      {activeRole === 'hod' && (
        <div className="eval-portal-layout">
          <nav className="eval-sub-nav">
            {[
              { id: 'dashboard', label: 'Evaluation Dashboard', icon: BarChart3 },
              { id: 'sheets', label: 'Subject-wise Answer Sheets', icon: FolderOpen },
              { id: 'faculty_progress', label: 'Faculty Evaluation Progress', icon: Users },
              { id: 'review', label: 'Marks Review & Approval', icon: ShieldCheck },
              { id: 'reports', label: 'Evaluation Reports', icon: FileSpreadsheet }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sub-nav-btn ${hodSubNav === tab.id ? 'active' : ''}`}
                onClick={() => setHodSubNav(tab.id)}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <main className="eval-portal-main">
            {/* HOD Dashboard */}
            {hodSubNav === 'dashboard' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Head of Department (CSE) · Examination Evaluation Portal</h3>
                    <p>Review submitted evaluation markings, moderate question grading, and approve certified results.</p>
                  </div>
                </div>

                <div className="eval-stats-grid">
                  <div className="eval-stat-card">
                    <span className="stat-label">Department Answer Sheets</span>
                    <strong className="stat-value">256</strong>
                    <small className="stat-desc">Semester 4 (CSE &amp; AI)</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Evaluated by Faculty</span>
                    <strong className="stat-value">192</strong>
                    <small className="stat-desc">75.0% Submitted</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Approved by HOD</span>
                    <strong className="stat-value">128</strong>
                    <small className="stat-desc">Ready for CoE Certification</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Awaiting HOD Moderation</span>
                    <strong className="stat-value">64</strong>
                    <small className="stat-desc">Pending Departmental Review</small>
                  </div>
                </div>
              </div>
            )}

            {/* Subject-wise Answer Sheets */}
            {hodSubNav === 'sheets' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Subject-wise Evaluated Answer Sheets</h3>
                    <p>Select any evaluated answer script to review marks and grant HOD approval.</p>
                  </div>
                </div>

                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Script ID</th>
                        <th>Subject</th>
                        <th>Faculty Evaluator</th>
                        <th>Total Marks</th>
                        <th>Status</th>
                        <th>HOD Review</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheets.map((s) => {
                        const sum = calculateEvaluationSummary(s.marks || {});
                        return (
                          <tr key={s.id}>
                            <td><strong>{s.id}</strong></td>
                            <td>
                              <strong>{s.subjectCode}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{s.subjectName}</div>
                            </td>
                            <td>{s.assignedFaculty?.name}</td>
                            <td><strong>{sum.grandTotal} / 100</strong></td>
                            <td>
                              <span className={`status-pill ${s.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {s.status}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${s.hodReviewStatus === 'Approved' ? 'approved' : 'pending'}`}>
                                {s.hodReviewStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => {
                                  setActiveSheetId(s.id);
                                  setHodSubNav('review');
                                }}
                              >
                                Review &amp; Moderate →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Faculty Evaluation Progress */}
            {hodSubNav === 'faculty_progress' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Department Faculty Evaluation Velocity</h3>
                    <p>Track evaluator progress, submission dates, and turnaround SLA compliance.</p>
                  </div>
                </div>

                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Faculty Member</th>
                        <th>Assigned Subject</th>
                        <th>Quota</th>
                        <th>Evaluated</th>
                        <th>Completion</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Dr. S. Mohanty', code: 'BTCS-T-PC-403', quota: 64, done: 52, status: 'On Track' },
                        { name: 'Prof. S. Mishra', code: 'BTCS-T-PC-401', quota: 64, done: 48, status: 'On Track' },
                        { name: 'Dr. R. Sahoo', code: 'BTCS-T-PC-402', quota: 64, done: 30, status: 'Attention Needed' }
                      ].map((row) => (
                        <tr key={row.name}>
                          <td><strong>{row.name}</strong></td>
                          <td><code>{row.code}</code></td>
                          <td>{row.quota}</td>
                          <td><strong>{row.done}</strong></td>
                          <td>{Math.round((row.done / row.quota) * 100)}%</td>
                          <td>
                            <span className={`status-pill ${row.status === 'On Track' ? 'approved' : 'returned'}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Marks Review & Approval Workspace (HOD Mode) */}
            {hodSubNav === 'review' && (
              <div className="eval-workspace-split">
                <div className="eval-workspace-left">
                  <AnswerSheetViewer
                    sheet={activeSheet}
                    annotations={activeSheet.annotations || []}
                    readOnly={true}
                  />
                </div>
                <div className="eval-workspace-right">
                  <DigitalMarkingPanel
                    sheet={activeSheet}
                    marks={activeSheet.marks || {}}
                    facultyRemarks={activeSheet.facultyRemarks || ''}
                    readOnly={true}
                    isHodReview={true}
                    onHodApprove={handleHodApprove}
                    onHodReturn={handleHodReturn}
                  />
                </div>
              </div>
            )}

            {/* Evaluation Reports */}
            {hodSubNav === 'reports' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>HOD Departmental Evaluation Audit &amp; Grade Analytics</h3>
                    <p>Review grade distributions, moderation metrics, and download audit certificates.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary-eval"
                    onClick={() => handleDownloadEvaluationReport(activeSheet)}
                  >
                    <Download size={15} /> Download HOD Certified Audit PDF
                  </button>
                </div>

                <div className="eval-stats-grid">
                  <div className="eval-stat-card">
                    <span className="stat-label">Total Department Scripts</span>
                    <strong className="stat-value">256</strong>
                    <small className="stat-desc">Semester 4 (CSE &amp; AI)</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Grade O (Outstanding)</span>
                    <strong className="stat-value">48</strong>
                    <small className="stat-desc">Scores &gt; 90%</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Grade E (Excellent)</span>
                    <strong className="stat-value">94</strong>
                    <small className="stat-desc">Scores 80% – 89%</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Grade A (Very Good)</span>
                    <strong className="stat-value">72</strong>
                    <small className="stat-desc">Scores 70% – 79%</small>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PORTAL 3: FACULTY PORTAL (EVALUATION WORKSPACE)
          ══════════════════════════════════════════════════════════════════ */}
      {activeRole === 'faculty' && (
        <div className="eval-portal-layout">
          <nav className="eval-sub-nav">
            {[
              { id: 'assigned', label: 'My Assigned Answer Sheets', icon: FolderOpen },
              { id: 'workspace', label: 'Faculty Evaluation Workspace (65/35)', icon: Maximize2 },
              { id: 'history', label: 'Evaluation History & Audit', icon: CheckSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sub-nav-btn ${facultySubNav === tab.id ? 'active' : ''}`}
                onClick={() => setFacultySubNav(tab.id)}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <main className="eval-portal-main">
            {/* My Assigned Answer Sheets */}
            {facultySubNav === 'assigned' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>My Assigned Examination Answer Sheets</h3>
                    <p>Anonymized examination scripts allocated for digital evaluation. Student identities are cryptographically blind-coded.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary-eval"
                    onClick={() => {
                      setActiveSheetId(sheets[0]?.id || 'AS-CSE-0001');
                      setFacultySubNav('workspace');
                    }}
                  >
                    Open Active Workspace →
                  </button>
                </div>

                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Script ID</th>
                        <th>Barcode Token</th>
                        <th>Subject</th>
                        <th>Semester</th>
                        <th>Batch</th>
                        <th>Status</th>
                        <th>Evaluated Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheets.map((s) => {
                        const sum = calculateEvaluationSummary(s.marks || {});
                        return (
                          <tr key={s.id}>
                            <td><strong>{s.id}</strong></td>
                            <td><code className="barcode-code">{s.barcode}</code></td>
                            <td>
                              <strong>{s.subjectCode}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{s.subjectName}</div>
                            </td>
                            <td>{s.semester}</td>
                            <td>{s.batch}</td>
                            <td>
                              <span className={`status-pill ${s.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {s.status}
                              </span>
                            </td>
                            <td>
                              {s.marks && Object.keys(s.marks).length > 0 ? (
                                <strong>{sum.grandTotal} / 100 ({sum.grade.split(' ')[0]})</strong>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>Not Started</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="btn-table-action"
                                  onClick={() => {
                                    setActiveSheetId(s.id);
                                    setFacultySubNav('workspace');
                                  }}
                                >
                                  {s.status === 'Submitted' || s.status === 'HOD Approved' ? 'View Evaluation' : 'Evaluate Script →'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-table-action btn-icon-only"
                                  onClick={() => handleDownloadEvaluationReport(s)}
                                  title="Download Audit PDF"
                                >
                                  <Download size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FACULTY EVALUATION WORKSPACE (65% / 35% SPLIT SCREEN) */}
            {facultySubNav === 'workspace' && (
              <div className="eval-workspace-split">
                {/* Left: 65% Digital Answer Booklet Viewer */}
                <div className="eval-workspace-left">
                  <AnswerSheetViewer
                    sheet={activeSheet}
                    annotations={workspaceAnnotations}
                    onAddAnnotation={handleAddAnnotation}
                    onClearAnnotations={handleClearAnnotations}
                    readOnly={activeSheet.status === 'Submitted' || activeSheet.status === 'HOD Approved'}
                  />
                </div>

                {/* Right: 35% Digital Marking Panel */}
                <div className="eval-workspace-right">
                  <DigitalMarkingPanel
                    sheet={activeSheet}
                    marks={workspaceMarks}
                    facultyRemarks={workspaceRemarks}
                    onMarksChange={handleMarksChange}
                    onRemarksChange={setWorkspaceRemarks}
                    onSaveDraft={handleSaveDraft}
                    onSubmitEvaluation={handleSubmitEvaluation}
                    onResetMarks={handleResetMarks}
                    readOnly={activeSheet.status === 'Submitted' || activeSheet.status === 'HOD Approved'}
                  />
                </div>
              </div>
            )}

            {/* Evaluation History */}
            {facultySubNav === 'history' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Completed Script Evaluations History</h3>
                    <p>Permanent digital audit log of all completed evaluations submitted to the Examination Cell.</p>
                  </div>
                </div>

                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Script ID</th>
                        <th>Subject</th>
                        <th>Date Evaluated</th>
                        <th>Marks Awarded</th>
                        <th>Grade</th>
                        <th>HOD Verification</th>
                        <th>Audit Trail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheets.filter((s) => s.status === 'Submitted' || s.status === 'HOD Approved').map((s) => {
                        const sum = calculateEvaluationSummary(s.marks || {});
                        return (
                          <tr key={s.id}>
                            <td><strong>{s.id}</strong></td>
                            <td>{s.subjectCode}: {s.subjectName}</td>
                            <td>{s.evaluatedDate || '15-05-2026'}</td>
                            <td><strong>{sum.grandTotal} / 100</strong></td>
                            <td><span className="grade-badge">{sum.grade.split(' ')[0]}</span></td>
                            <td>
                              <span className={`status-pill ${s.status === 'HOD Approved' ? 'approved' : 'pending'}`}>
                                {s.status === 'HOD Approved' ? 'HOD Approved ✓' : 'Under Review'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => handleDownloadEvaluationReport(s)}
                              >
                                <Download size={13} /> PDF Certificate
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PORTAL 4: LAB STAFF PORTAL
          ══════════════════════════════════════════════════════════════════ */}
      {activeRole === 'staff' && (
        <div className="eval-portal-layout">
          <nav className="eval-sub-nav">
            {[
              { id: 'practical', label: 'Practical/Lab Evaluation', icon: Award },
              { id: 'internal', label: 'Internal Assessment Marks', icon: CheckSquare },
              { id: 'records', label: 'Practical Examination Records', icon: FileSpreadsheet }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sub-nav-btn ${staffSubNav === tab.id ? 'active' : ''}`}
                onClick={() => setStaffSubNav(tab.id)}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <main className="eval-portal-main">
            {/* Practical/Lab Evaluation */}
            {staffSubNav === 'practical' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Practical &amp; Laboratory Examination Evaluation</h3>
                    <p>Evaluate laboratory logbooks, practical execution outputs, and viva voce assessments.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary-eval"
                    onClick={() => triggerToast('New Practical evaluation roster initialized.')}
                  >
                    <Plus size={15} /> Enter New Lab Score
                  </button>
                </div>

                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Student Reg No.</th>
                        <th>Student Name</th>
                        <th>Lab Course</th>
                        <th>Logbook (20M)</th>
                        <th>CIA (20M)</th>
                        <th>Viva (20M)</th>
                        <th>Execution (40M)</th>
                        <th>Total (100M)</th>
                        <th>Grade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labRecords.map((r) => (
                        <tr key={r.id}>
                          <td><code>{r.studentRegNo}</code></td>
                          <td><strong>{r.studentName}</strong></td>
                          <td>{r.subjectCode}</td>
                          <td>{r.logbookRecordMarks}</td>
                          <td>{r.continuousInternalAssessment}</td>
                          <td>{r.vivaVoceMarks}</td>
                          <td>{r.practicalExecutionMarks}</td>
                          <td><strong>{r.totalMarks}</strong></td>
                          <td><span className="grade-badge">{r.grade}</span></td>
                          <td><span className="status-pill approved">{r.status} ✓</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Internal Assessment Marks */}
            {staffSubNav === 'internal' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Continuous Internal Assessment (CIA) &amp; Logbook Audit</h3>
                    <p>Internal assessment weightage breakdown across weekly lab experiments and attendance.</p>
                  </div>
                </div>

                <div className="eval-stats-grid">
                  <div className="eval-stat-card">
                    <span className="stat-label">Practical Batches Completed</span>
                    <strong className="stat-value">12 / 12</strong>
                    <small className="stat-desc">100% Laboratory Quotas Done</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Average Lab Score</span>
                    <strong className="stat-value">91.3%</strong>
                    <small className="stat-desc">Hands-on coding evaluations</small>
                  </div>
                  <div className="eval-stat-card">
                    <span className="stat-label">Certified Logbooks</span>
                    <strong className="stat-value">64 / 64</strong>
                    <small className="stat-desc">Verified by External Examiner</small>
                  </div>
                </div>
              </div>
            )}

            {/* Practical Examination Records */}
            {staffSubNav === 'records' && (
              <div className="eval-content-view">
                <div className="view-banner">
                  <div>
                    <h3>Official Practical Examination Records &amp; External Examiner Sign-off</h3>
                    <p>Signed autonomous practical examination score rosters submitted to BPUT gateway.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-primary-eval"
                    onClick={() => triggerToast('Practical examination ledger exported to CSV.')}
                  >
                    <Download size={15} /> Export Practical Ledger
                  </button>
                </div>

                <div className="eval-table-card">
                  <table className="eval-data-table">
                    <thead>
                      <tr>
                        <th>Assessment Record ID</th>
                        <th>Student</th>
                        <th>Lab Course</th>
                        <th>Verified By</th>
                        <th>Date</th>
                        <th>External Examiner Sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labRecords.map((r) => (
                        <tr key={r.id}>
                          <td><strong>{r.id}</strong></td>
                          <td>{r.studentName} ({r.studentRegNo})</td>
                          <td>{r.subjectCode}: {r.subjectName}</td>
                          <td>{r.staffEvaluator}</td>
                          <td>{r.verifiedDate}</td>
                          <td><span className="status-pill approved">Signed &amp; Sealed ✓</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ── MODAL: SECRET IDENTITY PIN VERIFICATION ── */}
      {showIdentityPinModal && (
        <div className="eval-modal-backdrop" onClick={() => setShowIdentityPinModal(false)}>
          <div className="eval-modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="eval-modal-close" onClick={() => setShowIdentityPinModal(false)}>×</button>
            <div className="modal-lock-crest">
              <Lock size={28} />
            </div>
            <h3>CoE Authorized Identity Vault</h3>
            <p>
              Autonomous examination regulations require cryptographic authorization to de-anonymize blind answer sheets.
            </p>

            <form onSubmit={handleVerifyIdentityPin}>
              <div style={{ margin: '16px 0' }}>
                <label className="modal-field-label">Enter Controller of Examinations (CoE) PIN:</label>
                <input
                  type="password"
                  className="modal-pin-input"
                  placeholder="Enter PIN (e.g. gift123)"
                  value={identityPin}
                  onChange={(e) => setIdentityPin(e.target.value)}
                  autoFocus
                />
                {pinError && <p className="modal-error-msg">{pinError}</p>}
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  Demo Authorized PIN: <code>gift123</code> or <code>admin</code>
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowIdentityPinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Verify &amp; Reveal Student Identities
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BUNDLE DIGITIZATION SIMULATOR ── */}
      {showUploadModal && (
        <div className="eval-modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="eval-modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="eval-modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            <div className="modal-lock-crest" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <UploadCloud size={28} />
            </div>
            <h3>Ingest Scanned Examination Script Bundle</h3>
            <p>Upload multi-page scanned answer scripts for autonomous barcode processing.</p>

            <div style={{ margin: '16px 0' }}>
              <label className="modal-field-label">Select Subject Examination Paper:</label>
              <select className="modal-select">
                <option value="BTCS-T-PC-403">BTCS-T-PC-403: Programming with Python (64 Candidates)</option>
                <option value="BTCS-T-PC-401">BTCS-T-PC-401: Design and Analysis of Algorithms (64 Candidates)</option>
                <option value="BTCS-T-PC-402">BTCS-T-PC-402: Computer Organization &amp; Architecture (64 Candidates)</option>
              </select>
            </div>

            {isUploading && (
              <div style={{ margin: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Digitizing pages, checking 300 DPI, generating blind IDs...</span>
                  <strong>{uploadProgress}%</strong>
                </div>
                <div className="eval-progress-bar">
                  <div className="eval-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                disabled={isUploading}
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                disabled={isUploading}
                onClick={handleSimulateUpload}
              >
                {isUploading ? 'Digitizing Bundle...' : 'Start Ingestion Pipeline →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN SCRIPT TO FACULTY ── */}
      {assignModalSheet && (
        <div className="eval-modal-backdrop" onClick={() => setAssignModalSheet(null)}>
          <div className="eval-modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="eval-modal-close" onClick={() => setAssignModalSheet(null)}>×</button>
            <div className="modal-lock-crest" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Users size={28} />
            </div>
            <h3>Assign Script to Faculty Evaluator</h3>
            <p>Assign Script <strong>{assignModalSheet.id}</strong> ({assignModalSheet.subjectCode}) to an accredited evaluator:</p>

            <div style={{ margin: '16px 0' }}>
              <label className="modal-field-label">Select Evaluator:</label>
              <select
                className="modal-select"
                value={selectedFacultyForAssign}
                onChange={(e) => setSelectedFacultyForAssign(e.target.value)}
              >
                <option value="FAC-042">Dr. S. Mohanty (CSE) · Current Load: 52 / 70</option>
                <option value="FAC-018">Prof. S. Mishra (CSE) · Current Load: 48 / 70</option>
                <option value="FAC-029">Dr. R. Sahoo (CSE) · Current Load: 30 / 70</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={() => setAssignModalSheet(null)}>
                Cancel
              </button>
              <button type="button" className="btn-modal-submit" onClick={handleAssignFaculty}>
                Confirm Allocation ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
