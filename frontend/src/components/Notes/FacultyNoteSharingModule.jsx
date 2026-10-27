import React, { useState, useEffect, useMemo } from 'react';
import {
  UploadCloud, Search, Filter, BookOpen, FileText, Download,
  Eye, Edit3, Trash2, RefreshCw, Layers, CheckCircle2,
  Calendar, User, AlertCircle, X, Plus, Clock, Sparkles,
  ChevronRight, ChevronLeft, ExternalLink, HelpCircle, FileCheck,
  Share2, ArrowDown, Check, Info, FileSpreadsheet, Tag
} from 'lucide-react';
import { notesApi } from '../../services/notesApi.js';
import { erpStore } from '../../services/erpStore.js';
import { notificationsApi } from '../../services/notificationsApi.js';
import './FacultyNoteSharingModule.css';

const MATERIAL_TYPES = [
  'Lecture Notes',
  'PPT / Presentation Slides',
  'Question Paper',
  'Assignment Sheet',
  'Lab Manual',
  'Reference Material'
];

export default function FacultyNoteSharingModule({ account }) {
  const facultyName = account?.name || 'Dr. S. Mohanty';
  const facultyId = account?.identity || 'FAC-042';

  // 1. Scoped Assigned Classes & Subjects for this Faculty
  const facultyAssignments = useMemo(() => {
    return erpStore.getFacultyAssignedClasses(account?.identity || account?.name || 'Dr. S. Mohanty');
  }, [account]);

  // Unique assigned subjects
  const assignedSubjects = useMemo(() => {
    const map = new Map();
    facultyAssignments.forEach(fa => {
      if (!map.has(fa.subjectCode)) {
        map.set(fa.subjectCode, {
          code: fa.subjectCode,
          name: fa.subjectName,
          semester: fa.semester,
          section: fa.section,
          deptCode: fa.deptCode || 'CSE'
        });
      }
    });
    return Array.from(map.values());
  }, [facultyAssignments]);

  // 2. States for Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  // Materials List State
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // 3. Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // PPT Preview Slide index
  const [activeSlide, setActiveSlide] = useState(1);

  // 4. Upload Form State
  const defaultSubject = assignedSubjects[0] || {
    code: 'CS501',
    name: 'Data Structures & Algorithms',
    semester: 'Semester 5',
    section: 'Section A'
  };

  const [uploadForm, setUploadForm] = useState({
    subjectCode: defaultSubject.code,
    subjectName: defaultSubject.name,
    semester: defaultSubject.semester,
    section: defaultSubject.section,
    materialType: 'Lecture Notes',
    title: '',
    topic: '',
    description: '',
    notifyStudents: true,
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileError, setUploadFileError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Replace File Form State
  const [replacementFile, setReplacementFile] = useState(null);
  const [replacementError, setReplacementError] = useState('');
  const [replacing, setReplacing] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    title: '',
    topic: '',
    description: '',
    materialType: 'Lecture Notes',
    semester: '',
    section: ''
  });

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Load materials
  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await notesApi.getFacultyStudyMaterials(facultyName, {
        subject: subjectFilter,
        semester: semesterFilter,
        materialType: typeFilter,
        search: searchQuery
      });
      setMaterials(data || []);
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [facultyName, subjectFilter, semesterFilter, typeFilter, searchQuery]);

  // Listen to external updates
  useEffect(() => {
    const handleUpdate = () => loadMaterials();
    window.addEventListener('apna_campus_materials_updated', handleUpdate);
    return () => window.removeEventListener('apna_campus_materials_updated', handleUpdate);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = materials.length;
    const totalDownloads = materials.reduce((acc, m) => acc + (m.downloadCount || 0), 0);
    const totalViews = materials.reduce((acc, m) => acc + (m.viewCount || 0), 0);
    const uniqueSubjects = new Set(materials.map(m => m.subjectCode || m.subject)).size;
    return { total, totalDownloads, totalViews, uniqueSubjects };
  }, [materials]);

  // Handle Subject Change in Upload Form
  const handleUploadSubjectChange = (code) => {
    const matched = assignedSubjects.find(s => s.code === code);
    if (matched) {
      setUploadForm(prev => ({
        ...prev,
        subjectCode: matched.code,
        subjectName: matched.name,
        semester: matched.semester || prev.semester,
        section: matched.section || prev.section
      }));
    }
  };

  // Handle File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileError('');
    const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.zip', '.jpg', '.jpeg', '.png', '.webp'];
    const fileNameLower = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isAllowed) {
      setUploadFileError('Unsupported file type. Please upload PDF, PPT, PPTX, DOC, DOCX, ZIP, or Images.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setUploadFileError('File size exceeds the 30MB maximum limit.');
      return;
    }

    setUploadFile(file);
    if (!uploadForm.title) {
      // Auto-populate title cleanly from filename
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setUploadForm(prev => ({
        ...prev,
        title: baseName.replace(/[-_]/g, ' ')
      }));
    }
  };

  // Handle Replacement File Selection
  const handleReplacementSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplacementError('');
    const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.zip', '.jpg', '.jpeg', '.png', '.webp'];
    const fileNameLower = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isAllowed) {
      setReplacementError('Unsupported file type. Please upload PDF, PPT, PPTX, DOC, DOCX, ZIP, or Images.');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setReplacementError('File size exceeds the 30MB maximum limit.');
      return;
    }

    setReplacementFile(file);
  };

  // Submit Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      triggerToast('Please provide a title for the study material.');
      return;
    }
    if (!uploadForm.topic.trim()) {
      triggerToast('Please specify the academic topic covered.');
      return;
    }
    if (!uploadFile) {
      setUploadFileError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      const fileSizeFormatted = uploadFile.size < 1024 * 1024
        ? `${(uploadFile.size / 1024).toFixed(1)} KB`
        : `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`;

      const payload = {
        title: uploadForm.title,
        description: uploadForm.description || `Official study material for ${uploadForm.subjectName}.`,
        materialType: uploadForm.materialType,
        subject: uploadForm.subjectName,
        subjectCode: uploadForm.subjectCode,
        semester: uploadForm.semester,
        section: uploadForm.section,
        topic: uploadForm.topic,
        fileName: uploadFile.name,
        fileType: uploadFile.type || 'application/pdf',
        fileSize: fileSizeFormatted,
        fileUrl: URL.createObjectURL(uploadFile),
        previewText: `Official Faculty Material\nSubject: ${uploadForm.subjectName} (${uploadForm.subjectCode})\nTopic: ${uploadForm.topic}\nPrepared & Published by ${facultyName}.\n\nCourse Synopsis:\n${uploadForm.description || 'Full lecture and syllabus study resources.'}`
      };

      const res = await notesApi.createStudyMaterial(payload, {
        name: facultyName,
        identity: facultyId,
        department: account?.department || 'Computer Science & Engineering',
        deptCode: account?.deptCode || 'CSE',
        designation: account?.designation || 'Associate Professor'
      });

      if (res && res.success) {
        triggerToast(`🎉 "${uploadForm.title}" uploaded! Enrolled students in ${uploadForm.semester} (${uploadForm.section}) notified.`);
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadForm({
          subjectCode: defaultSubject.code,
          subjectName: defaultSubject.name,
          semester: defaultSubject.semester,
          section: defaultSubject.section,
          materialType: 'Lecture Notes',
          title: '',
          topic: '',
          description: '',
          notifyStudents: true,
        });
        await loadMaterials();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      triggerToast('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (material) => {
    setSelectedMaterial(material);
    setEditForm({
      title: material.title,
      topic: material.topic || '',
      description: material.description || '',
      materialType: material.materialType || 'Lecture Notes',
      semester: material.semester || 'Semester 5',
      section: material.section || 'Section A'
    });
    setIsEditOpen(true);
  };

  // Save Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    const res = await notesApi.updateStudyMaterial(selectedMaterial.id, editForm);
    if (res && res.success) {
      triggerToast('Study material details updated successfully.');
      setIsEditOpen(false);
      setSelectedMaterial(null);
      await loadMaterials();
    }
  };

  // Open Replace Modal
  const openReplaceModal = (material) => {
    setSelectedMaterial(material);
    setReplacementFile(null);
    setReplacementError('');
    setIsReplaceOpen(true);
  };

  // Submit Replace
  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !replacementFile) {
      setReplacementError('Please select a replacement file.');
      return;
    }

    try {
      setReplacing(true);
      const fileSizeFormatted = replacementFile.size < 1024 * 1024
        ? `${(replacementFile.size / 1024).toFixed(1)} KB`
        : `${(replacementFile.size / (1024 * 1024)).toFixed(1)} MB`;

      const res = await notesApi.replaceStudyMaterialFile(selectedMaterial.id, {
        fileName: replacementFile.name,
        fileType: replacementFile.type || 'application/pdf',
        fileSize: fileSizeFormatted,
        fileUrl: URL.createObjectURL(replacementFile),
        previewText: `Revised Material (Updated)\nSubject: ${selectedMaterial.subject}\nTopic: ${selectedMaterial.topic}\nUpdated with latest revision by ${facultyName}.`
      });

      if (res && res.success) {
        triggerToast(`File replaced with "${replacementFile.name}" successfully!`);
        setIsReplaceOpen(false);
        setReplacementFile(null);
        setSelectedMaterial(null);
        await loadMaterials();
      }
    } catch (err) {
      console.error('Replace failed:', err);
      triggerToast('Failed to replace file.');
    } finally {
      setReplacing(false);
    }
  };

  // Open Preview Modal
  const openPreviewModal = (material) => {
    setSelectedMaterial(material);
    setActiveSlide(1);
    notesApi.recordMaterialView(material.id);
    setIsPreviewOpen(true);
  };

  // Download Handler
  const handleDownload = (material) => {
    notesApi.recordMaterialDownload(material.id);
    triggerToast(`Downloading ${material.fileName || 'study material'}...`);
    // Create temporary anchor to trigger real download
    const link = document.createElement('a');
    link.href = material.fileUrl;
    link.download = material.fileName || `${material.title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Refresh list metrics
    setTimeout(() => loadMaterials(), 800);
  };

  // Open Delete Modal
  const openDeleteModal = (material) => {
    setSelectedMaterial(material);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!selectedMaterial) return;
    const res = await notesApi.deleteStudyMaterial(selectedMaterial.id);
    if (res && res.success) {
      triggerToast(`"${selectedMaterial.title}" deleted.`);
      setIsDeleteOpen(false);
      setSelectedMaterial(null);
      await loadMaterials();
    }
  };

  // Helper for material type badge colors
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Lecture Notes': return 'badge-type-notes';
      case 'PPT / Presentation Slides': return 'badge-type-ppt';
      case 'Question Paper': return 'badge-type-qp';
      case 'Assignment Sheet': return 'badge-type-assignment';
      case 'Lab Manual': return 'badge-type-lab';
      case 'Reference Material': return 'badge-type-ref';
      default: return 'badge-type-notes';
    }
  };

  const getFileIcon = (fileName = '', fileType = '') => {
    const fLower = fileName.toLowerCase();
    if (fLower.endsWith('.ppt') || fLower.endsWith('.pptx') || fileType.includes('presentation')) {
      return <Layers size={18} className="file-icon-ppt" />;
    }
    if (fLower.endsWith('.doc') || fLower.endsWith('.docx') || fileType.includes('word')) {
      return <FileText size={18} className="file-icon-doc" />;
    }
    if (fLower.endsWith('.zip') || fLower.endsWith('.rar')) {
      return <FileSpreadsheet size={18} className="file-icon-zip" />;
    }
    return <FileText size={18} className="file-icon-pdf" />;
  };

  return (
    <div className="faculty-notes-module">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fn-toast">
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Main Action Bar */}
      <div className="fn-header-card">
        <div className="fn-header-main">
          <div className="fn-title-group">
            <span className="fn-pretitle">CAMPUS CONNECT &amp; RESOURCES</span>
            <h1 className="fn-title">Note Sharing &amp; Study Materials Desk</h1>
            <p className="fn-subtitle">
              Upload, organize, and share syllabus-aligned lecture notes, slide decks, assignments, question papers, and lab manuals directly with students in your assigned cohorts.
            </p>
          </div>
          <div className="fn-header-cta">
            <button
              type="button"
              className="fn-btn-primary"
              onClick={() => {
                setUploadFile(null);
                setUploadFileError('');
                setIsUploadOpen(true);
              }}
            >
              <UploadCloud size={18} />
              <span>Upload Notes / Materials</span>
            </button>
          </div>
        </div>

        {/* Assigned Subjects Access Scope Badge */}
        <div className="fn-scope-strip">
          <div className="fn-scope-label">
            <Tag size={13} />
            <strong>Authorized Teaching Assignments:</strong>
          </div>
          <div className="fn-scope-chips">
            {assignedSubjects.map(sub => (
              <span key={sub.code} className="fn-scope-chip" title={`${sub.name} (${sub.semester})`}>
                <strong>{sub.code}</strong> {sub.name} <small>({sub.semester})</small>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="fn-stats-grid">
        <div className="fn-stat-card">
          <div className="fn-stat-icon-wrap icon-blue">
            <BookOpen size={20} />
          </div>
          <div className="fn-stat-info">
            <span className="fn-stat-num">{stats.total}</span>
            <span className="fn-stat-label">Uploaded Study Materials</span>
          </div>
        </div>

        <div className="fn-stat-card">
          <div className="fn-stat-icon-wrap icon-emerald">
            <Download size={20} />
          </div>
          <div className="fn-stat-info">
            <span className="fn-stat-num">{stats.totalDownloads}</span>
            <span className="fn-stat-label">Student Offline Downloads</span>
          </div>
        </div>

        <div className="fn-stat-card">
          <div className="fn-stat-icon-wrap icon-purple">
            <Eye size={20} />
          </div>
          <div className="fn-stat-info">
            <span className="fn-stat-num">{stats.totalViews}</span>
            <span className="fn-stat-label">Student Document Views</span>
          </div>
        </div>

        <div className="fn-stat-card">
          <div className="fn-stat-icon-wrap icon-amber">
            <Layers size={20} />
          </div>
          <div className="fn-stat-info">
            <span className="fn-stat-num">{stats.uniqueSubjects}</span>
            <span className="fn-stat-label">Subjects Covered</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="fn-filter-bar">
        <div className="fn-search-wrap">
          <Search size={16} className="fn-search-icon" />
          <input
            type="text"
            className="fn-search-input"
            placeholder="Search by title, topic, description, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="fn-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="fn-filters-group">
          {/* Subject Filter */}
          <div className="fn-filter-select-wrap">
            <label>Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="fn-select"
            >
              <option value="ALL">All Assigned Subjects</option>
              {assignedSubjects.map(sub => (
                <option key={sub.code} value={sub.name}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="fn-filter-select-wrap">
            <label>Semester</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="fn-select"
            >
              <option value="ALL">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
            </select>
          </div>

          {/* Material Type Filter */}
          <div className="fn-filter-select-wrap">
            <label>Material Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="fn-select"
            >
              <option value="ALL">All Material Types</option>
              {MATERIAL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {(subjectFilter !== 'ALL' || semesterFilter !== 'ALL' || typeFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              className="fn-btn-reset"
              onClick={() => {
                setSubjectFilter('ALL');
                setSemesterFilter('ALL');
                setTypeFilter('ALL');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Materials Grid / List */}
      <div className="fn-materials-grid">
        {loading ? (
          <div className="fn-empty-state">
            <RefreshCw size={36} className="fn-spin-icon" />
            <p>Loading study materials catalog...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="fn-empty-state">
            <BookOpen size={48} className="fn-empty-icon" />
            <h3>No study materials found</h3>
            <p>
              {searchQuery || subjectFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try adjusting your search query or filter selections.'
                : 'Share lecture notes, question papers, or slide presentations with your students.'}
            </p>
            <button
              type="button"
              className="fn-btn-primary"
              style={{ marginTop: '14px' }}
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus size={16} /> Upload Notes / Materials
            </button>
          </div>
        ) : (
          materials.map((m) => (
            <div key={m.id} className="fn-card">
              {/* Card Header: Type Badge & Actions */}
              <div className="fn-card-header">
                <span className={`fn-type-badge ${getTypeBadgeClass(m.materialType)}`}>
                  {m.materialType}
                </span>
                <span className="fn-sem-badge">
                  {m.semester} · {m.section || 'All Sections'}
                </span>
              </div>

              {/* Title & Topic */}
              <div className="fn-card-body">
                <div className="fn-subject-tag">
                  <strong>{m.subjectCode || 'CS501'}</strong> · {m.subject}
                </div>
                <h3 className="fn-card-title" title={m.title}>
                  {m.title}
                </h3>
                <div className="fn-card-topic">
                  <strong>Topic:</strong> {m.topic || 'General Course Study Material'}
                </div>
                <p className="fn-card-desc">
                  {m.description}
                </p>

                {/* Attachment metadata badge */}
                <div className="fn-file-meta">
                  <div className="fn-file-name-group">
                    {getFileIcon(m.fileName, m.fileType)}
                    <span className="fn-file-name" title={m.fileName}>{m.fileName}</span>
                  </div>
                  <span className="fn-file-size">{m.fileSize}</span>
                </div>
              </div>

              {/* Card Footer: Metadata & Action Buttons */}
              <div className="fn-card-footer">
                <div className="fn-meta-row">
                  <span className="fn-meta-item">
                    <Calendar size={13} />
                    {m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '14 Oct 2026'}
                  </span>
                  <span className="fn-meta-item" title="Student Downloads">
                    <Download size={13} /> {m.downloadCount || 0}
                  </span>
                  <span className="fn-meta-item" title="Student Views">
                    <Eye size={13} /> {m.viewCount || 0}
                  </span>
                </div>

                <div className="fn-actions-row">
                  {/* View / Preview */}
                  <button
                    type="button"
                    className="fn-action-btn btn-view"
                    title="Preview Document & Details"
                    onClick={() => openPreviewModal(m)}
                  >
                    <Eye size={15} />
                    <span>Preview</span>
                  </button>

                  {/* Download */}
                  <button
                    type="button"
                    className="fn-action-btn btn-download"
                    title="Download Material"
                    onClick={() => handleDownload(m)}
                  >
                    <Download size={15} />
                  </button>

                  {/* Edit Details */}
                  <button
                    type="button"
                    className="fn-action-btn btn-edit"
                    title="Edit Material Details"
                    onClick={() => openEditModal(m)}
                  >
                    <Edit3 size={15} />
                  </button>

                  {/* Replace File */}
                  <button
                    type="button"
                    className="fn-action-btn btn-replace"
                    title="Replace with Revised File"
                    onClick={() => openReplaceModal(m)}
                  >
                    <RefreshCw size={15} />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    className="fn-action-btn btn-delete"
                    title="Delete Study Material"
                    onClick={() => openDeleteModal(m)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. UPLOAD NOTES / STUDY MATERIALS MODAL                   */}
      {/* ========================================================= */}
      {isUploadOpen && (
        <div className="fn-modal-overlay" onClick={() => setIsUploadOpen(false)}>
          <div className="fn-modal fn-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="fn-modal-header">
              <div className="fn-modal-title-group">
                <div className="fn-modal-icon-badge">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h2>Upload Study Materials &amp; Share with Students</h2>
                  <p>Distribute lecture notes, PPT slides, question papers, or assignments to your enrolled class.</p>
                </div>
              </div>
              <button type="button" className="fn-modal-close" onClick={() => setIsUploadOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="fn-form">
              <div className="fn-form-grid">
                {/* Subject Selector (Scoped to Assigned Classes) */}
                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">
                    Assigned Subject <span className="fn-required">*</span>
                    <small className="fn-label-hint">Only subjects assigned to your teaching schedule</small>
                  </label>
                  <select
                    className="fn-form-select"
                    value={uploadForm.subjectCode}
                    onChange={(e) => handleUploadSubjectChange(e.target.value)}
                    required
                  >
                    {assignedSubjects.map(sub => (
                      <option key={sub.code} value={sub.code}>
                        {sub.code} — {sub.name} ({sub.semester} · {sub.section})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester & Section */}
                <div className="fn-form-group fn-col-6">
                  <label className="fn-form-label">Target Semester <span className="fn-required">*</span></label>
                  <select
                    className="fn-form-select"
                    value={uploadForm.semester}
                    onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                    required
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                  </select>
                </div>

                <div className="fn-form-group fn-col-6">
                  <label className="fn-form-label">Target Section / Group <span className="fn-required">*</span></label>
                  <select
                    className="fn-form-select"
                    value={uploadForm.section}
                    onChange={(e) => setUploadForm({ ...uploadForm, section: e.target.value })}
                    required
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="All Sections">All Sections (Entire Cohort)</option>
                  </select>
                </div>

                {/* Material Type */}
                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Material Type <span className="fn-required">*</span></label>
                  <div className="fn-type-selector-pills">
                    {MATERIAL_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`fn-type-pill-btn ${uploadForm.materialType === type ? 'active' : ''}`}
                        onClick={() => setUploadForm({ ...uploadForm, materialType: type })}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Material Title <span className="fn-required">*</span></label>
                  <input
                    type="text"
                    className="fn-form-input"
                    placeholder="e.g. Unit 3 Lecture Notes: Balanced Trees & AVL Rotations"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                  />
                </div>

                {/* Topic */}
                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Academic Topic / Syllabus Chapter <span className="fn-required">*</span></label>
                  <input
                    type="text"
                    className="fn-form-input"
                    placeholder="e.g. Binary Search Trees, AVL Rotations, Insertion Complexity"
                    value={uploadForm.topic}
                    onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Description &amp; Student Study Instructions</label>
                  <textarea
                    className="fn-form-textarea"
                    rows="3"
                    placeholder="Add reading instructions, reference textbook pages, or guidelines for preparing for upcoming tests..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  />
                </div>

                {/* File Upload Zone */}
                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Attach File <span className="fn-required">*</span></label>
                  <div className="fn-dropzone">
                    <input
                      type="file"
                      id="fn-file-input"
                      className="fn-file-input-hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.jpg,.jpeg,.png,.webp"
                    />
                    <label htmlFor="fn-file-input" className="fn-dropzone-label">
                      <UploadCloud size={32} className="fn-dropzone-icon" />
                      <strong>Click to browse or drag &amp; drop document</strong>
                      <span className="fn-dropzone-hint">
                        Supported: PDF, PPT/PPTX, DOC/DOCX, ZIP, PNG, JPG (Max 30MB)
                      </span>
                    </label>

                    {uploadFile && (
                      <div className="fn-selected-file-chip">
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span className="fn-selected-name">{uploadFile.name}</span>
                        <span className="fn-selected-size">
                          ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          className="fn-remove-file"
                          onClick={() => setUploadFile(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {uploadFileError && (
                      <div className="fn-form-error">
                        <AlertCircle size={14} />
                        <span>{uploadFileError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Notification Checkbox */}
                <div className="fn-form-group fn-col-12">
                  <label className="fn-checkbox-label">
                    <input
                      type="checkbox"
                      checked={uploadForm.notifyStudents}
                      onChange={(e) => setUploadForm({ ...uploadForm, notifyStudents: e.target.checked })}
                    />
                    <span>
                      <strong>Notify Enrolled Students Automatically:</strong> Broadcast an instant notification alert to students in {uploadForm.semester} ({uploadForm.section}).
                    </span>
                  </label>
                </div>
              </div>

              <div className="fn-modal-footer">
                <button
                  type="button"
                  className="fn-btn-secondary"
                  onClick={() => setIsUploadOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fn-btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={16} className="fn-spin-icon" />
                      <span>Publishing Material...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Publish &amp; Share Material</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT MATERIAL DETAILS MODAL                            */}
      {/* ========================================================= */}
      {isEditOpen && selectedMaterial && (
        <div className="fn-modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="fn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fn-modal-header">
              <div className="fn-modal-title-group">
                <div className="fn-modal-icon-badge icon-amber">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2>Edit Material Details</h2>
                  <p>{selectedMaterial.subjectCode} · {selectedMaterial.subject}</p>
                </div>
              </div>
              <button type="button" className="fn-modal-close" onClick={() => setIsEditOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="fn-form">
              <div className="fn-form-grid">
                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Material Title</label>
                  <input
                    type="text"
                    className="fn-form-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Academic Topic</label>
                  <input
                    type="text"
                    className="fn-form-input"
                    value={editForm.topic}
                    onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="fn-form-group fn-col-6">
                  <label className="fn-form-label">Material Type</label>
                  <select
                    className="fn-form-select"
                    value={editForm.materialType}
                    onChange={(e) => setEditForm({ ...editForm, materialType: e.target.value })}
                  >
                    {MATERIAL_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="fn-form-group fn-col-6">
                  <label className="fn-form-label">Section</label>
                  <select
                    className="fn-form-select"
                    value={editForm.section}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="All Sections">All Sections</option>
                  </select>
                </div>

                <div className="fn-form-group fn-col-12">
                  <label className="fn-form-label">Description</label>
                  <textarea
                    className="fn-form-textarea"
                    rows="3"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="fn-modal-footer">
                <button type="button" className="fn-btn-secondary" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="fn-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. REPLACE FILE MODAL                                     */}
      {/* ========================================================= */}
      {isReplaceOpen && selectedMaterial && (
        <div className="fn-modal-overlay" onClick={() => setIsReplaceOpen(false)}>
          <div className="fn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fn-modal-header">
              <div className="fn-modal-title-group">
                <div className="fn-modal-icon-badge icon-purple">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <h2>Replace Attached File</h2>
                  <p>Update to a revised version while preserving resource link and stats.</p>
                </div>
              </div>
              <button type="button" className="fn-modal-close" onClick={() => setIsReplaceOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="fn-form">
              <div className="fn-current-file-box">
                <span className="fn-box-label">Current File:</span>
                <div className="fn-file-meta" style={{ marginTop: '4px' }}>
                  <div className="fn-file-name-group">
                    {getFileIcon(selectedMaterial.fileName, selectedMaterial.fileType)}
                    <strong>{selectedMaterial.fileName}</strong>
                  </div>
                  <span className="fn-file-size">{selectedMaterial.fileSize}</span>
                </div>
              </div>

              <div className="fn-form-group" style={{ marginTop: '16px' }}>
                <label className="fn-form-label">Select Revised File <span className="fn-required">*</span></label>
                <div className="fn-dropzone">
                  <input
                    type="file"
                    id="fn-replace-file-input"
                    className="fn-file-input-hidden"
                    onChange={handleReplacementSelect}
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.jpg,.jpeg,.png,.webp"
                  />
                  <label htmlFor="fn-replace-file-input" className="fn-dropzone-label">
                    <RefreshCw size={28} className="fn-dropzone-icon" />
                    <strong>Choose new revised document</strong>
                    <span className="fn-dropzone-hint">
                      Replaces existing attachment for all enrolled students
                    </span>
                  </label>

                  {replacementFile && (
                    <div className="fn-selected-file-chip">
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span className="fn-selected-name">{replacementFile.name}</span>
                      <span className="fn-selected-size">
                        ({(replacementFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  )}

                  {replacementError && (
                    <div className="fn-form-error">
                      <AlertCircle size={14} />
                      <span>{replacementError}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="fn-modal-footer">
                <button type="button" className="fn-btn-secondary" onClick={() => setIsReplaceOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="fn-btn-primary"
                  disabled={replacing || !replacementFile}
                >
                  {replacing ? 'Uploading Revision...' : 'Confirm File Replacement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DOCUMENT & METADATA PREVIEW MODAL                      */}
      {/* ========================================================= */}
      {isPreviewOpen && selectedMaterial && (
        <div className="fn-modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="fn-modal fn-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="fn-modal-header">
              <div className="fn-modal-title-group">
                <span className={`fn-type-badge ${getTypeBadgeClass(selectedMaterial.materialType)}`}>
                  {selectedMaterial.materialType}
                </span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{selectedMaterial.title}</h2>
                  <p>{selectedMaterial.subjectCode} · {selectedMaterial.subject} · {selectedMaterial.semester} ({selectedMaterial.section || 'All Sections'})</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="fn-btn-primary"
                  onClick={() => handleDownload(selectedMaterial)}
                >
                  <Download size={15} /> Download ({selectedMaterial.fileSize})
                </button>
                <button type="button" className="fn-modal-close" onClick={() => setIsPreviewOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="fn-preview-container">
              {/* Left Column: Interactive Document Reader / Presentation Simulator */}
              <div className="fn-preview-viewer">
                {/* PPT / Presentation Carousel Viewer */}
                {selectedMaterial.materialType.includes('PPT') || selectedMaterial.fileName?.toLowerCase().endsWith('.pptx') ? (
                  <div className="fn-ppt-viewer">
                    <div className="fn-ppt-toolbar">
                      <span className="fn-ppt-counter">Slide {activeSlide} of 4</span>
                      <div className="fn-ppt-nav">
                        <button
                          type="button"
                          disabled={activeSlide === 1}
                          onClick={() => setActiveSlide(prev => Math.max(1, prev - 1))}
                        >
                          <ChevronLeft size={16} /> Prev
                        </button>
                        <button
                          type="button"
                          disabled={activeSlide === 4}
                          onClick={() => setActiveSlide(prev => Math.min(4, prev + 1))}
                        >
                          Next <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="fn-ppt-slide">
                      {activeSlide === 1 && (
                        <div className="fn-slide-content">
                          <span className="fn-slide-topic-tag">{selectedMaterial.subjectCode} Lecture Presentation</span>
                          <h2>{selectedMaterial.title}</h2>
                          <h4>Topic: {selectedMaterial.topic}</h4>
                          <p className="fn-slide-author">Instructor: {selectedMaterial.uploadedBy?.name || facultyName}</p>
                          <div className="fn-slide-divider" />
                          <p>{selectedMaterial.description}</p>
                        </div>
                      )}
                      {activeSlide === 2 && (
                        <div className="fn-slide-content">
                          <h3>1. Learning Objectives &amp; Context</h3>
                          <ul className="fn-slide-list">
                            <li>Understand key theoretical foundations and core mathematical proofs.</li>
                            <li>Analyze algorithm execution step-by-step through trace tables.</li>
                            <li>Formulate space &amp; time asymptotic complexity invariants.</li>
                            <li>Apply concepts to university semester exam problem patterns.</li>
                          </ul>
                        </div>
                      )}
                      {activeSlide === 3 && (
                        <div className="fn-slide-content">
                          <h3>2. Detailed Technical Breakdown</h3>
                          <pre className="fn-slide-code-box">
                            {selectedMaterial.previewText || 'Visual representation and syllabus walkthrough slides.'}
                          </pre>
                        </div>
                      )}
                      {activeSlide === 4 && (
                        <div className="fn-slide-content">
                          <h3>3. Summary &amp; Practice Questions</h3>
                          <p>Review textbook chapters and complete exercise questions before next continuous internal assessment.</p>
                          <div className="fn-slide-callout">
                            <strong>Official Department Notes</strong>
                            <span>Prepared for {selectedMaterial.semester} {selectedMaterial.section}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* PDF / Document Text View */
                  <div className="fn-doc-viewer">
                    <div className="fn-doc-page">
                      <div className="fn-doc-page-header">
                        <span>APNA CAMPUS · ACADEMIC OPERATIONS</span>
                        <span>{selectedMaterial.subjectCode}</span>
                      </div>
                      <div className="fn-doc-page-title">
                        <h2>{selectedMaterial.title}</h2>
                        <div className="fn-doc-meta-row">
                          <span><strong>Course:</strong> {selectedMaterial.subject}</span>
                          <span><strong>Instructor:</strong> {selectedMaterial.uploadedBy?.name}</span>
                          <span><strong>Date:</strong> {selectedMaterial.uploadedAt?.split('T')[0]}</span>
                        </div>
                      </div>
                      <div className="fn-doc-body">
                        <h4>Topic: {selectedMaterial.topic}</h4>
                        <div className="fn-doc-text">
                          <pre>{selectedMaterial.previewText || selectedMaterial.description}</pre>
                        </div>
                      </div>
                      <div className="fn-doc-page-footer">
                        <span>Document ID: {selectedMaterial.id}</span>
                        <span>Official Study Material · Page 1 of 1</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Metadata & Details */}
              <div className="fn-preview-meta-panel">
                <h4>Resource Information</h4>
                <div className="fn-info-list">
                  <div className="fn-info-row">
                    <span className="fn-info-label">Material Type</span>
                    <span className="fn-info-val"><strong>{selectedMaterial.materialType}</strong></span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">Subject</span>
                    <span className="fn-info-val">{selectedMaterial.subject}</span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">Course Code</span>
                    <span className="fn-info-val"><code>{selectedMaterial.subjectCode}</code></span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">Cohort</span>
                    <span className="fn-info-val">{selectedMaterial.semester} · {selectedMaterial.section}</span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">File Name</span>
                    <span className="fn-info-val" style={{ wordBreak: 'break-all' }}>{selectedMaterial.fileName}</span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">File Size</span>
                    <span className="fn-info-val">{selectedMaterial.fileSize}</span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">Uploaded By</span>
                    <span className="fn-info-val">{selectedMaterial.uploadedBy?.name}</span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">Date Published</span>
                    <span className="fn-info-val">{selectedMaterial.uploadedAt ? new Date(selectedMaterial.uploadedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">Total Downloads</span>
                    <span className="fn-info-val"><strong style={{ color: '#16a34a' }}>{selectedMaterial.downloadCount || 0}</strong> downloads</span>
                  </div>
                  <div className="fn-info-row">
                    <span className="fn-info-label">Student Views</span>
                    <span className="fn-info-val"><strong style={{ color: '#4338ca' }}>{selectedMaterial.viewCount || 0}</strong> views</span>
                  </div>
                </div>

                <div className="fn-preview-actions">
                  <button
                    type="button"
                    className="fn-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleDownload(selectedMaterial)}
                  >
                    <Download size={16} /> Download File
                  </button>
                  <button
                    type="button"
                    className="fn-btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                    onClick={() => {
                      setIsPreviewOpen(false);
                      openEditModal(selectedMaterial);
                    }}
                  >
                    <Edit3 size={15} /> Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DELETE CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      {isDeleteOpen && selectedMaterial && (
        <div className="fn-modal-overlay" onClick={() => setIsDeleteOpen(false)}>
          <div className="fn-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="fn-modal-header">
              <div className="fn-modal-title-group">
                <div className="fn-modal-icon-badge icon-red">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h2>Delete Study Material?</h2>
                  <p>This action will remove the file from student access.</p>
                </div>
              </div>
              <button type="button" className="fn-modal-close" onClick={() => setIsDeleteOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>"{selectedMaterial.title}"</strong> ({selectedMaterial.fileName})?
              </p>
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '12px', marginTop: '12px', fontSize: '0.82rem', color: '#b91c1c' }}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                Enrolled students will no longer be able to view or download this study material.
              </div>
            </div>

            <div className="fn-modal-footer">
              <button type="button" className="fn-btn-secondary" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="fn-btn-primary"
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                onClick={handleDeleteConfirm}
              >
                Yes, Delete Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
