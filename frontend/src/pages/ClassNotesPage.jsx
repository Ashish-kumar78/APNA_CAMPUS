import { useEffect, useState } from 'react'
import {
  BookOpen,
  Calendar,
  Search,
  UploadCloud,
  FileText,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  User,
  Clock,
  Filter,
  Layers,
  X,
  Sparkles,
  Info,
  Flag,
  Share2,
  MessageSquare
} from 'lucide-react'
import { notesApi } from '../services/notesApi'
import './ClassNotesPage.css'

export default function ClassNotesPage({ account }) {
  const [notesList, setNotesList] = useState([])
  const [subjectFilter, setSubjectFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadStep, setUploadStep] = useState('form') // 'form' | 'preview'
  const [uploadForm, setUploadForm] = useState({
    subject: 'Operating Systems',
    date: new Date().toISOString().split('T')[0],
    topic: '',
    description: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState('')
  const [fileError, setFileError] = useState('')
  const [submittingUpload, setSubmittingUpload] = useState(false)

  // Viewer modal state
  const [selectedNote, setSelectedNote] = useState(null)
  const [activeVersionIndex, setActiveVersionIndex] = useState(1)

  // Report modal state
  const [reportingNoteId, setReportingNoteId] = useState(null)
  const [reportReason, setReportReason] = useState('Wrong information')
  const [reportDesc, setReportDesc] = useState('')

  // Toast
  const [toastMsg, setToastMsg] = useState('')

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  useEffect(() => {
    loadNotes()
  }, [subjectFilter, dateFilter, searchQuery])

  const loadNotes = async () => {
    const data = await notesApi.getClassNotes({
      subject: subjectFilter,
      date: dateFilter,
      search: searchQuery
    })
    if (data) setNotesList(data)
  }

  // Handle file select
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileError('')
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type.toLowerCase())) {
      setFileError('Invalid file format. Supported: JPG, JPEG, PNG, WEBP, PDF.')
      triggerToast('Invalid file format!')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit.')
      triggerToast('File size exceeds 10MB limit.')
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (evt) => setFilePreviewUrl(evt.target.result)
      reader.readAsDataURL(file)
    } else {
      setFilePreviewUrl('PDF_FILE')
    }
  }

  // Proceed to Preview
  const handleProceedToPreview = (e) => {
    e.preventDefault()
    if (!uploadForm.topic.trim()) {
      triggerToast('Please enter the lecture topic.')
      return
    }
    if (!selectedFile) {
      setFileError('Please select a handwritten notes image or PDF file.')
      triggerToast('File attachment is required.')
      return
    }
    setUploadStep('preview')
  }

  // Submit Upload
  const handleConfirmUpload = async () => {
    if (submittingUpload) return
    setSubmittingUpload(true)

    const payload = {
      subject: uploadForm.subject,
      date: uploadForm.date,
      topic: uploadForm.topic.trim(),
      description: uploadForm.description.trim(),
      previewUrl: filePreviewUrl,
      fileName: selectedFile ? selectedFile.name : 'class_notes.png',
      fileType: selectedFile ? selectedFile.type : 'image/png',
      studentName: account?.name || 'Rakesh Das',
      rollNumber: account?.registrationNumber || '2305201001',
      department: account?.department || 'Computer Science'
    }

    try {
      const res = await notesApi.uploadClassNotes(payload)
      if (res && res.success) {
        triggerToast('Class notes shared successfully!')
        await loadNotes()
        setShowUploadModal(false)
        resetUploadForm()
      }
    } catch {
      triggerToast('Failed to upload notes. Please try again.')
    } finally {
      setSubmittingUpload(false)
    }
  }

  const resetUploadForm = () => {
    setUploadStep('form')
    setUploadForm({
      subject: 'Operating Systems',
      date: new Date().toISOString().split('T')[0],
      topic: '',
      description: ''
    })
    setSelectedFile(null)
    setFilePreviewUrl('')
    setFileError('')
  }

  // Handle Submit Report
  const handleSubmitReport = async () => {
    if (!reportingNoteId) return
    const res = await notesApi.reportNote(reportingNoteId, reportReason, reportDesc)
    if (res && res.success) {
      triggerToast('Report submitted for faculty review. Thank you!')
      setReportingNoteId(null)
      setReportDesc('')
      await loadNotes()
    }
  }

  // Group duplicate notes for same Date + Subject + Topic
  const duplicateGroupedNotes = notesList.reduce((acc, note) => {
    const groupKey = `${note.subject}|${note.date}|${note.topic}`
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(note)
    return acc
  }, {})

  return (
    <div className="class-notes-page">
      {toastMsg && (
        <div className="notes-toast" role="alert">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="notes-header">
        <div>
          <h1 className="notes-title">Class Notes & Study Material Sharing</h1>
          <p className="notes-subtitle">Access handwritten notes, lecture slides & board photos shared by peers for missed classes</p>
        </div>
        <button 
          type="button"
          className="btn-upload-notes"
          onClick={() => {
            resetUploadForm()
            setShowUploadModal(true)
          }}
        >
          <UploadCloud size={18} />
          <span>Upload Class Notes</span>
        </button>
      </div>

      {/* Campus Connect Integration Callout */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(6, 182, 212, 0.35)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block' }}>Missed a lecture today? Request notes in Campus Connect</strong>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Classmates can upload directly in response to your request, with automatic upload locks and faculty verification points.</span>
          </div>
        </div>
        <button
          type="button"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: 'conv-ds' } }));
          }}
        >
          Open Class Chat →
        </button>
      </div>

      {/* FEATURE 2 — REQUIREMENT 4: USER-GENERATED CONTENT DISCLAIMER BANNER */}
      <div className="ugc-disclaimer-banner">
        <div className="ugc-icon"><Info size={20} /></div>
        <div className="ugc-text">
          <strong>Student-Uploaded Material Notice:</strong>
          <span> Content in this section is shared by fellow students for peer assistance. Please verify details with official syllabus & faculty guidance before academic examinations.</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="notes-filter-card">
        <div className="filter-group">
          <label><BookOpen size={14} /> Subject</label>
          <select 
            className="filter-select"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="ALL">All Subjects</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="Database Systems">Database Systems</option>
            <option value="Web Technology">Web Technology</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
          </select>
        </div>

        <div className="filter-group">
          <label><Calendar size={14} /> Lecture Date</label>
          <input 
            type="date"
            className="filter-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-group" style={{ flex: 1 }}>
          <label><Search size={14} /> Search Topic / Keywords</label>
          <input 
            type="text"
            className="filter-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic e.g. Process Scheduling, AVL Rotations..."
          />
        </div>

        {(subjectFilter !== 'ALL' || dateFilter || searchQuery) && (
          <button 
            type="button"
            className="btn-clear-filters"
            onClick={() => {
              setSubjectFilter('ALL')
              setDateFilter('')
              setSearchQuery('')
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Notes Cards Grid */}
      <div className="notes-grid">
        {Object.keys(duplicateGroupedNotes).length === 0 ? (
          <div className="notes-empty-state">
            <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h3>No class notes found for selected filters</h3>
            <p>Be the first to upload handwritten notes or board photos for your class!</p>
            <button 
              type="button" 
              className="btn-upload-notes" 
              style={{ marginTop: '12px' }}
              onClick={() => {
                resetUploadForm()
                setShowUploadModal(true)
              }}
            >
              Upload Notes
            </button>
          </div>
        ) : (
          Object.entries(duplicateGroupedNotes).map(([groupKey, groupNotes]) => {
            const primaryNote = groupNotes[0]
            const hasMultipleSets = groupNotes.length > 1

            return (
              <div key={groupKey} className="note-card">
                <div className="note-card-header">
                  <div>
                    <span className="note-subject-pill">{primaryNote.subject}</span>
                    <h3 className="note-topic-title">{primaryNote.topic}</h3>
                  </div>
                  {primaryNote.isFacultyVerified ? (
                    <span className="badge-faculty-verified" title={`Verified by ${primaryNote.verifiedBy}`}>
                      <ShieldCheck size={13} /> Faculty Verified
                    </span>
                  ) : (
                    <span className="badge-student-uploaded">Student Uploaded</span>
                  )}
                </div>

                <p className="note-description">{primaryNote.description}</p>

                {/* FEATURE 2 — REQUIREMENT 8: DUPLICATE NOTES SETS SELECTOR */}
                {hasMultipleSets && (
                  <div className="duplicate-sets-bar">
                    <span className="dup-label"><Layers size={13} /> {groupNotes.length} sets of notes available:</span>
                    <div className="dup-chips">
                      {groupNotes.map((n, idx) => (
                        <button
                          key={n.id}
                          type="button"
                          className="dup-chip-btn"
                          onClick={() => {
                            setSelectedNote(n)
                            setActiveVersionIndex(idx + 1)
                          }}
                        >
                          Notes {idx + 1} ({n.uploadedBy?.name?.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="note-card-meta">
                  <div className="meta-left">
                    <span><Calendar size={13} /> {primaryNote.date}</span>
                    <span><User size={13} /> Uploaded by: <strong>{primaryNote.uploadedBy?.name}</strong></span>
                  </div>
                  <div className="meta-right">
                    <button 
                      type="button" 
                      className="btn-view-notes"
                      onClick={() => {
                        setSelectedNote(primaryNote)
                        setActiveVersionIndex(1)
                      }}
                    >
                      <Eye size={14} /> View Notes
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MODAL 1: UPLOAD CLASS NOTES MODAL */}
      {showUploadModal && (
        <div className="notes-modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="notes-modal-card" onClick={e => e.stopPropagation()}>
            <button className="notes-modal-close" onClick={() => setShowUploadModal(false)}>×</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div className="notes-icon-box"><UploadCloud size={22} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Upload Class Notes</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Share lecture notes & board photos for absent peers</p>
              </div>
            </div>

            {uploadStep === 'form' ? (
              <form onSubmit={handleProceedToPreview}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Subject <span style={{ color: '#dc2626' }}>*</span></label>
                    <select 
                      className="form-input"
                      value={uploadForm.subject}
                      onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                      required
                    >
                      <option value="Operating Systems">Operating Systems</option>
                      <option value="Data Structures">Data Structures</option>
                      <option value="Computer Networks">Computer Networks</option>
                      <option value="Database Systems">Database Systems</option>
                      <option value="Web Technology">Web Technology</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Lecture Date <span style={{ color: '#dc2626' }}>*</span></label>
                    <input 
                      type="date"
                      className="form-input"
                      value={uploadForm.date}
                      onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">Topic / Unit Covered <span style={{ color: '#dc2626' }}>*</span></label>
                  <input 
                    type="text"
                    className="form-input"
                    value={uploadForm.topic}
                    onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                    placeholder="e.g. Process Scheduling Algorithms (Round Robin & SJF)"
                    required
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">Description / Summary Notes</label>
                  <textarea 
                    className="form-input"
                    rows={2}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="e.g. Hand-written notes covering Gantt charts and numerical problems..."
                  />
                </div>

                {/* Upload Box */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Attach File / Photo <span style={{ color: '#dc2626' }}>*</span></label>
                  <div className="upload-dropzone">
                    <input 
                      type="file"
                      id="class-note-file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="class-note-file" style={{ cursor: 'pointer', display: 'block' }}>
                      <UploadCloud size={32} style={{ color: '#4338ca', marginBottom: '6px' }} />
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedFile ? selectedFile.name : 'Click to select or drag & drop class notes'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                        Supported formats: JPG, JPEG, PNG, WEBP, PDF · Max size: 10MB
                      </div>
                    </label>
                  </div>
                  {fileError && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{fileError}</div>}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Preview Note Card →</button>
                </div>
              </form>
            ) : (
              /* FEATURE 2 — STEP 3: NOTE PREVIEW BEFORE UPLOADING */
              <div>
                <div className="note-preview-box">
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#0f172a' }}>Preview Note Attachment</h4>

                  <div style={{ textAlign: 'center', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                    {filePreviewUrl === 'PDF_FILE' ? (
                      <div style={{ padding: '20px', color: '#4338ca' }}>
                        <FileText size={48} style={{ margin: '0 auto 8px', display: 'block' }} />
                        <strong>{selectedFile?.name || 'Notes_Document.pdf'}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>PDF Document ({Math.round((selectedFile?.size || 0) / 1024)} KB)</div>
                      </div>
                    ) : (
                      <img 
                        src={filePreviewUrl} 
                        alt="Class Note Preview" 
                        style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    )}
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#334155' }}>
                    <div><strong>Subject:</strong> {uploadForm.subject}</div>
                    <div><strong>Date:</strong> {uploadForm.date}</div>
                    <div><strong>Topic:</strong> {uploadForm.topic}</div>
                    {uploadForm.description && <div><strong>Description:</strong> {uploadForm.description}</div>}
                    <div><strong>Uploaded By:</strong> {account?.name || 'Rakesh Das'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '14px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setUploadStep('form')}>← Replace File</button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleConfirmUpload}
                    disabled={submittingUpload}
                  >
                    {submittingUpload ? 'Uploading...' : 'Publish Notes ✓'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: FULL NOTES VIEWER */}
      {selectedNote && (
        <div className="notes-modal-backdrop" onClick={() => setSelectedNote(null)}>
          <div className="notes-modal-card" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <button className="notes-modal-close" onClick={() => setSelectedNote(null)}>×</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="note-subject-pill">{selectedNote.subject}</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', color: '#0f172a' }}>{selectedNote.topic}</h3>
                <small style={{ color: '#64748b' }}>Lecture Date: {selectedNote.date} · Shared by {selectedNote.uploadedBy?.name}</small>
              </div>
              <button 
                type="button"
                className="btn-report-flag"
                title="Report wrong info or inappropriate content"
                onClick={() => setReportingNoteId(selectedNote.id)}
              >
                <Flag size={14} /> Report Content
              </button>
            </div>

            {/* Content Display */}
            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '12px', color: '#ffffff', textAlign: 'center', marginBottom: '14px', maxHeight: '350px', overflowY: 'auto' }}>
              {selectedNote.fileType === 'application/pdf' ? (
                <div style={{ padding: '30px' }}>
                  <FileText size={56} style={{ color: '#818cf8', marginBottom: '12px' }} />
                  <div><strong>{selectedNote.fileName || 'Class_Notes.pdf'}</strong></div>
                  <a href={selectedNote.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '0.8rem', marginTop: '8px', display: 'inline-block' }}>Open PDF in New Tab ↗</a>
                </div>
              ) : (
                <img 
                  src={selectedNote.fileUrl} 
                  alt="Full Class Notes" 
                  style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '6px' }}
                />
              )}
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              {selectedNote.description}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <a 
                href={selectedNote.fileUrl} 
                download={selectedNote.fileName} 
                target="_blank"
                rel="noreferrer"
                className="btn-primary" 
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={15} /> Download Notes
              </a>
              <button type="button" className="btn-secondary" onClick={() => setSelectedNote(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT CONTENT MODAL (FEATURE 2 — REQUIREMENT 7) */}
      {reportingNoteId && (
        <div className="notes-modal-backdrop" onClick={() => setReportingNoteId(null)}>
          <div className="notes-modal-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <button className="notes-modal-close" onClick={() => setReportingNoteId(null)}>×</button>

            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#0f172a' }}>Report Student Content</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px' }}>
              Report inaccurate information, unclear images, or inappropriate material for faculty moderation.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Reason for Reporting <span style={{ color: '#dc2626' }}>*</span></label>
              <select 
                className="form-input"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="Wrong information">Wrong information</option>
                <option value="Unclear image / illegible handwriting">Unclear image / illegible handwriting</option>
                <option value="Wrong subject">Wrong subject</option>
                <option value="Wrong date">Wrong date</option>
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Duplicate upload">Duplicate upload</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Explanation Details</label>
              <textarea 
                className="form-input"
                rows={3}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Briefly describe what needs correction..."
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setReportingNoteId(null)}>Cancel</button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleSubmitReport}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
